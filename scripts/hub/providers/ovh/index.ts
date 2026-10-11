import type { RawModelData, ProviderPlugin, FreeQuota, PriceCurrency } from '../../types.js';

// OVHcloud AI Endpoints：OpenAI 兼容端点可匿名访问（无需 API key / 注册）。
// - 列表: https://oai.endpoints.kepler.ai.cloud.ovh.net/v1/models （id/上下文/单价）
// - 能力: https://catalog.endpoints.ai.ovh.net/rest/v1/models_v2 （官网用的结构化
//   capabilities + 简介；只靠 id 猜的话 qwen3.5/gpt-oss 这些会全部只剩默认两个标签）
// - 速率: docs.ovhcloud.com 的 AI Endpoints 文档（RSPress，URL 追加 .md 即纯 markdown）
const API_URL = 'https://oai.endpoints.kepler.ai.cloud.ovh.net/v1/models';
const CATALOG_URL = 'https://catalog.endpoints.ai.ovh.net/rest/v1/models_v2';
const CAPABILITIES_DOC_URL =
  'https://docs.ovhcloud.com/en/guides/public-cloud/ai-machine-learning/ai-endpoints-capabilities.md';

interface OvhPricing {
  currency_unit?: string;
  prompt?: string;
  completion?: string;
  request?: string;
  image?: string;
  input_cache_reads?: string;
  input_cache_writes?: string;
}

interface OvhModel {
  id: string;
  object?: string;
  created?: number;
  owned_by?: string;
  context_length?: number;
  max_completion_tokens?: number;
  pricing?: OvhPricing;
}

interface OvhCatalogRow {
  id?: string;
  name?: string;
  description?: string;
  category?: string;
  category_v2?: string;
  tags?: string[];
  metadata?: {
    aliases?: string[];
    model_specs?: {
      capabilities?: {
        reasoning?: boolean;
        function_calling?: boolean;
        web_search?: boolean;
        input_modality?: string[];
        output_modality?: string[];
      };
    };
  };
}

// 目录里的单价是「每 token」，hub 的口径是每 1M tokens。
function perMillion(perToken: string | number | undefined): number | undefined {
  const n = Number(perToken);
  if (!Number.isFinite(n) || n <= 0) return undefined;
  return Number((n * 1_000_000).toFixed(4));
}

// /v1/models 的 id 和官网目录的 id/name/aliases 三套写法互不相同
// （qwen-guard-gen-06b vs Qwen3Guard-Gen-0.6B），只比 id 会漏掉三分之一的行。
function normId(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]/g, '');
}

// category_v2 是官网现在的分类，23/23 覆盖；Text Generation 之外都不该带 chat。
const CATEGORY_TAGS: Record<string, string[]> = {
  'Text Generation': ['chat', 'text-generation'],
  Embeddings: ['embeddings'],
  'Text To Speech': ['speech-synthesis'],
  'Speech To Text': ['speech-recognition'],
  'Image Generation': ['image-generation'],
  'Safety & Moderation': ['moderation'],
};

const TAG_TAGS: Record<string, string> = {
  Vision: 'vision',
  Reasoning: 'reasoning',
  Moderation: 'moderation',
  Translation: 'translation',
  'Automatic Speech Recognition': 'speech-recognition',
  'Text To Speech': 'speech-synthesis',
  'Image Generation': 'image-generation',
};

// Multi-speaker / Diarisation 不在 hub 的能力口径里，落到 TAG_TAGS 之外被忽略。

function capabilitiesFromCatalog(row: OvhCatalogRow): string[] {
  const caps = new Set<string>(CATEGORY_TAGS[row.category_v2 ?? row.category ?? '']
    ?? ['chat', 'text-generation']); // 官网新增分类时退回文本口径，不丢标签

  for (const tag of row.tags ?? []) {
    const mapped = TAG_TAGS[tag];
    if (mapped) caps.add(mapped);
  }

  const spec = row.metadata?.model_specs?.capabilities ?? {};
  if (spec.reasoning) caps.add('reasoning');
  if (spec.function_calling) caps.add('tool-use');
  if (spec.web_search) caps.add('web-search');

  // modality 比 tags 全：bge-m3 这类 tags 为空，但 output_modality 说得很清楚。
  const input = spec.input_modality ?? [];
  const output = spec.output_modality ?? [];
  if (input.includes('image')) caps.add('vision');
  if (input.includes('sound')) caps.add('speech-recognition');
  if (output.includes('embedding_vector')) caps.add('embeddings');
  if (output.includes('sound')) caps.add('speech-synthesis');
  if (output.includes('image')) caps.add('image-generation');

  return Array.from(caps);
}

// 兜底：官网目录取不到时按 id 猜。分类字段改名/新增模型来不及进目录时会走到这里。
function capabilitiesFor(id: string): string[] {
  const s = id.toLowerCase();
  if (s.includes('tts')) return ['speech-synthesis'];
  if (s.includes('whisper') || /asr/.test(s)) return ['speech-recognition'];
  if (s.includes('embed') || s.includes('bge')) return ['embeddings'];
  if (s.includes('stable-diffusion') || s.includes('diffusion')) return ['image-generation'];
  if (s.includes('guard')) return ['moderation'];
  const caps = ['chat', 'text-generation'];
  if (s.includes('-vl') || s.includes('vision')) caps.push('vision');
  return caps;
}

async function fetchAnonymousTier(): Promise<{ rpm: number; note: string }> {
  const res = await fetch(CAPABILITIES_DOC_URL, { headers: { Accept: 'text/markdown, text/plain;q=0.9,*/*;q=0.8' } });
  if (!res.ok) throw new Error(`[ovh] capabilities doc responded with ${res.status}`);
  const md = await res.text();
  const line = md.match(/- \*\*Anonymous\*\*:[^\n]*/)?.[0];
  const rpm = line?.match(/(\d+)\s*requests? per minute/i);
  if (!line || !rpm) throw new Error('[ovh] anonymous rate limit not found in capabilities doc');
  console.log(`[ovh] ${line.replace(/^- /, '')}`);
  return { rpm: parseInt(rpm[1], 10), note: line.replace(/^- \*\*Anonymous\*\*:\s*/, '').replace(/\.\s*$/, '').trim() };
}

async function fetchCatalogIndex(): Promise<Map<string, OvhCatalogRow>> {
  const res = await fetch(CATALOG_URL, { headers: { Accept: 'application/json' } });
  if (!res.ok) throw new Error(`[ovh] catalog api responded with ${res.status}`);
  const rows = (await res.json()) as OvhCatalogRow[];
  if (!Array.isArray(rows) || rows.length === 0) throw new Error('[ovh] catalog api returned no rows');

  const index = new Map<string, OvhCatalogRow>();
  for (const row of rows) {
    const keys = [row.id, row.name, ...(row.metadata?.aliases ?? [])];
    for (const key of keys) {
      if (key) index.set(normId(key), row);
    }
  }
  return index;
}

async function fetchOvhModels(): Promise<RawModelData[]> {
  const [apiRes, tier, catalogResult] = await Promise.all([
    fetch(API_URL, { headers: { Accept: 'application/json' } }),
    fetchAnonymousTier(),
    fetchCatalogIndex().then(
      (index) => ({ index, error: null as string | null }),
      (error: Error) => ({ index: new Map<string, OvhCatalogRow>(), error: error.message }),
    ),
  ]);
  if (!apiRes.ok) throw new Error(`[ovh] model list responded with ${apiRes.status}`);

  const json = (await apiRes.json()) as { data?: OvhModel[] };
  const list = json.data ?? [];
  if (list.length === 0) throw new Error('[ovh] empty model list');

  if (catalogResult.error) {
    console.warn(`[ovh] official catalog unavailable (${catalogResult.error}); falling back to id heuristics`);
  } else {
    const joined = list.filter((m) => catalogResult.index.has(normId(m.id))).length;
    console.log(`[ovh] ${list.length} models in AI Endpoints list, ${joined}/${list.length} joined to the official catalog`);
  }

  const freeQuota: FreeQuota = {
    rpm: tier.rpm,
    notes: `Anonymous access (no API key, no signup): ${tier.note}. With an API key the same models are billed pay-as-you-go per token (400 RPM per project) — price_input/price_output are those rates, not what the anonymous tier costs.`,
  };

  return list.map((m) => {
    const info = catalogResult.index.get(normId(m.id));
    const currency: PriceCurrency = m.pricing?.currency_unit === 'CNY' ? 'CNY' : 'USD';
    return {
      vendor: 'ovh',
      modelId: `ovh/${m.id}`,
      name: m.id,
      description: info?.description?.trim(),
      contextSize: m.context_length || undefined,
      priceInput: perMillion(m.pricing?.prompt),
      priceOutput: perMillion(m.pricing?.completion),
      priceCurrency: currency,
      // 匿名层不计费、无需账号，全部模型按速率限制免费。
      isFree: true,
      freeMechanism: 'rate-limited',
      freeQuota,
      trialScope: 'all',
      capabilities: info ? capabilitiesFromCatalog(info) : capabilitiesFor(m.id),
      capabilitiesAuthoritative: !!info,
      metadata: {
        originalId: m.id,
        owner: m.owned_by,
        maxCompletionTokens: m.max_completion_tokens || undefined,
        catalogPricing: m.pricing,
        apiFormats: ['OpenAI'],
        source: info ? 'api+catalog+docs' : 'api+docs',
      },
    };
  });
}

export const fetchModels: ProviderPlugin = fetchOvhModels;
