import type { RawModelData, ProviderPlugin } from '../../types.js';

const API_URL = 'https://api.cloudflare.com/client/v4/accounts';
// 官方定价页（Accept: text/markdown 可直接拿 markdown），用于识别「必须付费 billing method」的模型。
const PRICING_URL = 'https://developers.cloudflare.com/workers-ai/platform/pricing/';

// task.name 来自 Cloudflare 的标准 task 枚举.
const TASK_TO_CAPABILITY: Record<string, string> = {
  'Text Generation': 'text-generation',
  'Text Embeddings': 'embeddings',
  'Text Classification': 'moderation',
  'Text-to-Image': 'image-generation',
  'Text-to-Speech': 'speech-synthesis',
  'Automatic Speech Recognition': 'speech-recognition',
  'Image-to-Text': 'vision',
  'Image Classification': 'vision',
  Translation: 'translation',
  Summarization: 'text-generation',
};

interface CfProperty {
  property_id: string;
  value: unknown;
}

interface CfModel {
  id: string;
  name: string;
  description?: string;
  task?: { name?: string };
  properties?: CfProperty[];
  tags?: string[];
}

function propsToMap(props: CfProperty[] | undefined): Record<string, unknown> {
  const map: Record<string, unknown> = {};
  for (const p of props ?? []) map[p.property_id] = p.value;
  return map;
}

function parsePrice(value: unknown): { input?: number; output?: number } {
  if (!Array.isArray(value)) return {};
  const out: { input?: number; output?: number } = {};
  for (const entry of value as Array<{ unit?: string; price?: number }>) {
    const unit = (entry.unit ?? '').toLowerCase();
    const price = typeof entry.price === 'number' ? entry.price : undefined;
    if (price === undefined) continue;
    // "per M input tokens" / "per M output tokens" — 已经是 per-million 单位, 直接用.
    if (unit.includes('input') && unit.includes('token')) out.input = price;
    else if (unit.includes('output') && unit.includes('token')) out.output = price;
  }
  return out;
}

/**
 * 官方定价页会点名「requires a paid billing method」的模型：
 * 这些模型不吃 Workers AI 每日 10,000 neurons 免费额度，需要 Workers Paid 或 AI Gateway 预付 credits。
 * 用文件名（最后一段）比对，避免版本后缀差异导致漏匹配。
 */
async function fetchPaidOnlyModels(): Promise<Set<string>> {
  const res = await fetch(PRICING_URL, { headers: { Accept: 'text/markdown' } });
  if (!res.ok) throw new Error(`[cloudflare] pricing page responded with ${res.status}`);
  const md = await res.text();
  if (!/neurons per day/i.test(md)) {
    throw new Error('[cloudflare] pricing page format changed: no neuron allocation text found');
  }

  const note = md.split('\n').find(line => /requires? a paid billing method/i.test(line));
  const paidOnly = new Set<string>();
  if (!note) {
    console.warn('[cloudflare] pricing page has no paid-billing note; treating all models as free-allocation');
    return paidOnly;
  }
  for (const hit of note.matchAll(/`(@[a-z0-9_.-]+(?:\/[a-z0-9_.-]+)+)`/gi)) {
    const basename = hit[1].split('/').pop() ?? hit[1];
    paidOnly.add(basename);
  }
  console.log(`[cloudflare] Paid-billing-only models: ${paidOnly.size} (${Array.from(paidOnly).join(', ')})`);
  return paidOnly;
}

async function fetchCloudflareModels(): Promise<RawModelData[]> {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const apiKey = process.env.CLOUDFLARE_API_KEY;
  if (!accountId || !apiKey) {
    console.warn('[cloudflare] CLOUDFLARE_ACCOUNT_ID / CLOUDFLARE_API_KEY missing, skipping.');
    return [];
  }

  const url = `${API_URL}/${accountId}/ai/models/search?per_page=500`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${apiKey}` },
  });
  if (!res.ok) {
    console.warn(`[cloudflare] API responded with ${res.status}`);
    return [];
  }

  const json = (await res.json()) as { result?: CfModel[]; success?: boolean };
  const list = json.result ?? [];
  console.log(`[cloudflare] Raw items received: ${list.length}`);

  const paidOnly = await fetchPaidOnlyModels();

  const models: RawModelData[] = [];
  for (const m of list) {
    const taskName = m.task?.name ?? '';
    // 跳过 internal / non-tensor 模型 (Dumb Pipe).
    if (taskName === 'Dumb Pipe') continue;

    const props = propsToMap(m.properties);
    const capability = TASK_TO_CAPABILITY[taskName];
    const capabilities: string[] = [];
    if (capability) capabilities.push(capability);
    if (props.function_calling === 'true') capabilities.push('function-calling');
    if (props.reasoning === 'true') capabilities.push('reasoning');

    const ctxRaw = props.context_window;
    const contextSize = typeof ctxRaw === 'string' && /^\d+$/.test(ctxRaw)
      ? parseInt(ctxRaw, 10)
      : undefined;

    const price = parsePrice(props.price);
    const basename = m.name.split('/').pop() ?? m.name;
    // Cloudflare Workers AI 全局免费额度: 10,000 neurons/day.
    // 超出按 price 字段计费, 所以配额内的模型可视为免费; 定价页点名的模型则完全不走免费额度.
    const requiresPaidBilling = paidOnly.has(basename);

    models.push({
      vendor: 'cloudflare',
      modelId: `cloudflare/${m.name}`,
      name: m.name,
      description: m.description,
      contextSize,
      priceInput: price.input,
      priceOutput: price.output,
      priceCurrency: 'USD',
      isFree: !requiresPaidBilling,
      freeMechanism: requiresPaidBilling ? null : 'daily-tokens',
      freeQuota: requiresPaidBilling
        ? { notes: 'Excluded from the 10,000 neurons/day free allocation: requires the Workers Paid plan or prepaid AI Gateway credits' }
        : { notes: '10,000 neurons/day account-wide (shared across all Workers AI models); price_input/price_output are overage rates once the daily quota is used up' },
      trialScope: requiresPaidBilling ? 'none' : 'all',
      capabilities,
      metadata: {
        cfTask: taskName,
        beta: props.beta === 'true' ? true : undefined,
        lora: props.lora === 'true' ? true : undefined,
        originalId: m.name,
        cfId: m.id,
        requiresPaidBilling: requiresPaidBilling || undefined,
      },
    });
  }

  return models;
}

export const fetchModels: ProviderPlugin = fetchCloudflareModels;
