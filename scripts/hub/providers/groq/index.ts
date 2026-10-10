import type { RawModelData, ProviderPlugin, FreeQuota } from '../../types.js';

const API_BASE = 'https://api.groq.com/openai/v1';

// Groq 官方把模型目录（含价格 / 速率 / 上下文）以 markdown 形式提供，直接解析，不再手工维护价格表。
const CATALOG_URL = 'https://console.groq.com/docs/models.md';
// 免费层的每模型限额（RPM/RPD/TPM/TPD）。models.md 里的列是付费 Developer plan 基线，不能当免费额度用。
const RATE_LIMITS_URL = 'https://console.groq.com/docs/rate-limits.md';

type PricingUnit = 'per_1m_tokens' | 'per_hour' | 'per_1m_characters' | 'contact_sales' | 'unknown';

interface GroqCatalogModel {
  id: string;
  name: string;
  tier: string;
  enterprise: boolean;
  speed?: number;
  priceInput?: number;
  priceOutput?: number;
  pricingUnit: PricingUnit;
  priceRaw?: string;
  contextWindow?: number;
  maxCompletionTokens?: number;
  developerPlanLimitsRaw?: string;
}

interface GroqFreeLimit {
  rpm?: number;
  rpd?: number;
  tpm?: number;
  tokensPerDay?: number;
  audioSecondsPerHour?: number;
  audioSecondsPerDay?: number;
}

interface GroqApiModel {
  id: string;
  owned_by?: string;
  active?: boolean;
  context_window?: number;
  max_completion_tokens?: number;
}

const CAPABILITY_OVERRIDES: Record<string, string[]> = {
  'canopylabs/orpheus-v1-english': ['speech-synthesis'],
  'canopylabs/orpheus-arabic-saudi': ['speech-synthesis', 'translation'],
  'whisper-large-v3': ['speech-recognition'],
  'whisper-large-v3-turbo': ['speech-recognition'],
  'meta-llama/llama-prompt-guard-2-22m': ['moderation'],
  'meta-llama/llama-prompt-guard-2-86m': ['moderation'],
};

function detectCapabilities(id: string): string[] {
  if (CAPABILITY_OVERRIDES[id]) return CAPABILITY_OVERRIDES[id];
  if (id.includes('whisper')) return ['speech-recognition'];
  if (id.includes('orpheus') || id.includes('tts')) return ['speech-synthesis'];
  if (id.includes('prompt-guard')) return ['moderation'];
  return ['chat', 'text-generation'];
}

function parseScaled(text: string): number | undefined {
  const m = text.match(/(\d[\d,]*(?:\.\d+)?)\s*([kmb])?/i);
  if (!m) return undefined;
  const n = parseFloat(m[1].replace(/,/g, ''));
  if (!Number.isFinite(n)) return undefined;
  const unit = (m[2] || '').toLowerCase();
  if (unit === 'k') return n * 1000;
  if (unit === 'm') return n * 1_000_000;
  if (unit === 'b') return n * 1_000_000_000;
  return n;
}

function cleanCell(cell: string): string {
  return cell.replace(/\\\s*/g, '').trim();
}

function parsePriceCell(cell: string): {
  input?: number;
  output?: number;
  unit: PricingUnit;
  raw?: string;
} {
  const raw = cleanCell(cell);
  if (!raw || raw === '-') return { unit: 'unknown' };

  const input = raw.match(/\$\s*([\d,.]+)\s*input/i);
  const output = raw.match(/\$\s*([\d,.]+)\s*output/i);
  if (input || output) {
    return {
      input: input ? parseFloat(input[1].replace(/,/g, '')) : undefined,
      output: output ? parseFloat(output[1].replace(/,/g, '')) : undefined,
      unit: 'per_1m_tokens',
    };
  }
  if (/per\s*hour/i.test(raw)) return { unit: 'per_hour', raw };
  if (/per\s*1m?\s*characters/i.test(raw)) return { unit: 'per_1m_characters', raw };
  if (/contact\s*sales/i.test(raw)) return { unit: 'contact_sales' };
  return { unit: 'unknown', raw };
}

const LIMIT_COLUMN_MAP: Record<string, keyof GroqFreeLimit> = {
  rpm: 'rpm',
  rpd: 'rpd',
  tpm: 'tpm',
  tpd: 'tokensPerDay',
  ash: 'audioSecondsPerHour',
  asd: 'audioSecondsPerDay',
};

/** rate-limits.md 的限额表：`| MODEL ID | RPM | RPD | TPM | TPD | ASH | ASD |`，按列名定位。 */
function parseFreeLimits(md: string): Map<string, GroqFreeLimit> {
  const out = new Map<string, GroqFreeLimit>();
  let columns: string[] | null = null;
  let inLimitsSection = false;

  for (const line of md.split('\n')) {
    const heading = line.match(/^##\s+([^#].*?)(?:\([^)]*\))?\s*$/);
    if (heading) {
      // 只取限额表所在小节；后面的 header 说明表结构不同，不能混进来。
      inLimitsSection = /rate\s*limits/i.test(heading[1]);
      columns = null;
      continue;
    }
    const trimmed = line.trim();
    if (!inLimitsSection || !trimmed.startsWith('|')) continue;
    const cells = trimmed
      .split('|')
      .map(c => c.trim())
      .filter((_, i, arr) => i > 0 && i < arr.length - 1);

    if (cells.some(c => /^model\s*id$/i.test(c))) {
      columns = cells.map(c => c.toLowerCase());
      continue;
    }
    if (!columns) continue;

    const id = cleanCell(cells[0] ?? '');
    if (!/^[a-z0-9][\w.-]*(\/[\w.-]+)?$/i.test(id)) continue;

    const limit: GroqFreeLimit = {};
    for (let i = 1; i < cells.length && i < columns.length; i++) {
      const key = LIMIT_COLUMN_MAP[columns[i]];
      if (!key) continue;
      const value = parseScaled(cleanCell(cells[i]));
      if (value !== undefined) limit[key] = value;
    }
    out.set(id, limit);
  }
  return out;
}

function displayName(cell: string, id: string): string {
  const stripped = cell.replace(/!\[[^\]]*\]\([^)]*\)/g, '');
  const m = stripped.match(/\[([^\]]+)\]\(\/docs\/model\//);
  return m?.[1]?.trim() || id;
}

/**
 * 解析文档表格。MODEL ID 单元格里 `![图标](url)显示名](/docs/model/<id>)` 的链接路径即 model id。
 * Deprecated 段整体跳过（表头存在但行已下线）。
 */
function parseCatalog(md: string): GroqCatalogModel[] {
  const models = new Map<string, GroqCatalogModel>();
  let tier = 'other';

  for (const line of md.split('\n')) {
    // 标题形如 `## [Production Models](#production-models)`
    const heading = line.match(/^##\s+([^#].*?)(?:\([^)]*\))?\s*$/);
    if (heading) {
      const title = heading[1].toLowerCase();
      if (title.includes('deprecat')) tier = 'deprecated';
      else if (title.includes('production')) tier = 'production';
      else if (title.includes('preview')) tier = 'preview';
      else if (title.includes('featured')) tier = 'featured';
      else tier = 'other';
      continue;
    }
    if (tier === 'deprecated' || !line.trim().startsWith('|')) continue;

    const cells = line.split('|').map(c => c.trim()).filter((c, i, arr) => i > 0 && i < arr.length - 1);
    if (cells.length < 4) continue;

    const idMatch = cells[0].match(/\/docs\/model\/([\w.\/-]+)/);
    if (!idMatch) continue;
    const id = idMatch[1];

    const price = parsePriceCell(cells[2] ?? '');
    const speed = parseScaled(cleanCell(cells[1] ?? ''));

    const model: GroqCatalogModel = {
      id,
      name: displayName(cells[0], id),
      tier,
      enterprise: /enterprise/i.test(cells[0]),
      speed: Number.isFinite(speed) ? speed : undefined,
      priceInput: price.input,
      priceOutput: price.output,
      pricingUnit: price.unit,
      priceRaw: price.raw,
      contextWindow: parseScaled(cleanCell(cells[4] ?? '')),
      maxCompletionTokens: parseScaled(cleanCell(cells[5] ?? '')),
      developerPlanLimitsRaw: cleanCell(cells[3] ?? ''),
    };
    // featured 段是 production/preview 行的重复展示，已有更完整信息时不覆盖。
    const existing = models.get(id);
    if (existing && (existing.tier !== 'featured' || tier === 'featured')) continue;
    models.set(id, model);
  }

  return Array.from(models.values());
}

async function fetchCatalog(): Promise<GroqCatalogModel[]> {
  const res = await fetch(CATALOG_URL, { headers: { Accept: 'text/markdown, text/plain;q=0.9,*/*;q=0.8' } });
  if (!res.ok) throw new Error(`[groq] catalog ${CATALOG_URL} responded with ${res.status}`);
  const md = await res.text();
  if (!/\|\s*MODEL ID/i.test(md)) throw new Error('[groq] catalog format changed: no model table found');
  const models = parseCatalog(md);
  if (models.length < 5) throw new Error(`[groq] catalog parsed only ${models.length} models`);
  console.log(`[groq] Catalog: ${models.length} models from ${CATALOG_URL}`);
  return models;
}

async function fetchFreeLimits(): Promise<Map<string, GroqFreeLimit>> {
  const res = await fetch(RATE_LIMITS_URL, { headers: { Accept: 'text/markdown, text/plain;q=0.9,*/*;q=0.8' } });
  if (!res.ok) throw new Error(`[groq] rate limits ${RATE_LIMITS_URL} responded with ${res.status}`);
  const limits = parseFreeLimits(await res.text());
  if (limits.size < 3) throw new Error(`[groq] rate limits format changed, parsed only ${limits.size} rows`);
  console.log(`[groq] Free-tier rate limits: ${limits.size} models`);
  return limits;
}

async function fetchModelList(apiKey: string): Promise<GroqApiModel[]> {
  const res = await fetch(`${API_BASE}/models`, {
    headers: { Authorization: `Bearer ${apiKey}` },
  });
  if (!res.ok) {
    console.warn(`[groq] /models responded with ${res.status}`);
    return [];
  }
  const json = (await res.json()) as { data?: GroqApiModel[] };
  return (json.data ?? []).filter(m => m.active !== false);
}

async function probeAccountQuota(modelId: string, apiKey: string): Promise<FreeQuota | null> {
  // 跳过 whisper/tts/prompt-guard 类: chat/completions 端点不接受这些模型.
  if (/whisper|orpheus|prompt-guard|\btts\b/i.test(modelId)) return null;

  try {
    const res = await fetch(`${API_BASE}/chat/completions`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: modelId,
        messages: [{ role: 'user', content: 'Hi' }],
        max_tokens: 1,
        stream: true,
      }),
    });
    // 立刻 cancel body 避免读完, 我们只要 header.
    await res.body?.cancel();
    if (!res.ok) return null;

    // Groq 只暴露 RPD 与 TPM 两个 limit header（见 rate-limits.md）。
    const rpd = res.headers.get('x-ratelimit-limit-requests');
    const tpm = res.headers.get('x-ratelimit-limit-tokens');
    const quota: FreeQuota = {};
    if (rpd) quota.rpd = parseInt(rpd, 10);
    if (tpm) quota.tpm = parseInt(tpm, 10);
    return Object.keys(quota).length > 0 ? quota : null;
  } catch (err) {
    console.warn(`[groq] rate-limit probe failed for ${modelId}: ${err instanceof Error ? err.message : err}`);
    return null;
  }
}

async function withConcurrency<T, R>(items: T[], limit: number, fn: (item: T) => Promise<R>): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let cursor = 0;
  async function worker(): Promise<void> {
    while (true) {
      const idx = cursor++;
      if (idx >= items.length) return;
      results[idx] = await fn(items[idx]);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, () => worker()));
  return results;
}

async function fetchGroqModels(): Promise<RawModelData[]> {
  const apiKey = process.env.GROQ_API_KEY;
  const [catalog, limitById] = await Promise.all([fetchCatalog(), fetchFreeLimits()]);
  const byId = new Map(catalog.map(c => [c.id, c]));

  const apiModels = apiKey ? await fetchModelList(apiKey) : [];
  if (!apiKey) console.warn('[groq] GROQ_API_KEY missing, using official catalog only.');
  else console.log(`[groq] Discovered ${apiModels.length} active models via /v1/models`);

  // API 的活跃列表为准；无 key（或列表拉取失败）时退回官方目录里的非企业专属模型。
  const ids: string[] = apiModels.length > 0
    ? apiModels.map(m => m.id)
    : catalog.filter(c => !c.enterprise).map(c => c.id);

  const apiById = new Map(apiModels.map(m => [m.id, m]));
  const probes = apiKey
    ? await withConcurrency(ids, 5, id => probeAccountQuota(id, apiKey))
    : ids.map(() => null);

  const models: RawModelData[] = [];
  for (let i = 0; i < ids.length; i++) {
    const id = ids[i];
    const doc = byId.get(id);
    const api = apiById.get(id);
    const probed = probes[i] ?? undefined;
    const limit = limitById.get(id);
    const free = !doc?.enterprise;

    // 官方文档的免费层限额为基线；带 key 探到的账户限额优先（账户可能已升级 tier）。
    const quota: FreeQuota = {};
    const rpd = probed?.rpd ?? limit?.rpd;
    const tpm = probed?.tpm ?? limit?.tpm;
    if (rpd !== undefined) quota.rpd = rpd;
    if (tpm !== undefined) quota.tpm = tpm;
    if (limit?.rpm !== undefined) quota.rpm = limit.rpm;
    if (limit?.tokensPerDay !== undefined) quota.tokens_per_day = limit.tokensPerDay;
    if (Object.keys(quota).length === 0) {
      quota.notes = free ? 'Rate-limited free tier' : 'Enterprise plan only (Contact Sales)';
    }

    models.push({
      vendor: 'groq',
      modelId: `groq/${id}`,
      name: doc?.name ?? id,
      contextSize: api?.context_window ?? doc?.contextWindow,
      priceInput: doc?.priceInput,
      priceOutput: doc?.priceOutput,
      priceCurrency: 'USD',
      isFree: free,
      freeMechanism: free ? 'rate-limited' : null,
      freeQuota: quota,
      trialScope: free ? 'all' : 'none',
      capabilities: detectCapabilities(id),
      metadata: {
        originalId: id,
        owner: api?.owned_by,
        speed: doc?.speed,
        maxCompletionTokens: api?.max_completion_tokens ?? doc?.maxCompletionTokens,
        docsTier: doc?.tier,
        enterpriseOnly: doc?.enterprise,
        pricingUnit: doc?.pricingUnit,
        priceRaw: doc?.priceRaw,
        developerPlanLimits: doc?.developerPlanLimitsRaw,
        audioSecondsPerHour: limit?.audioSecondsPerHour,
        audioSecondsPerDay: limit?.audioSecondsPerDay,
        source: doc ? 'api+docs-catalog' : 'api',
      },
    });
  }

  console.log(`[groq] Built ${models.length} models (${models.filter(m => m.isFree).length} free-tier)`);
  return models;
}

export const fetchModels: ProviderPlugin = fetchGroqModels;
