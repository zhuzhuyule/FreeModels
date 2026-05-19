import type { RawModelData, ProviderPlugin } from '../../types.js';

const API_URL = 'https://api.cloudflare.com/client/v4/accounts';

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

    // Cloudflare Workers AI 全局免费额度: 10,000 neurons/day.
    // 超出按 price 字段计费, 所以所有模型在配额内都可视为免费.
    models.push({
      vendor: 'cloudflare',
      modelId: `cloudflare/${m.name}`,
      name: m.name,
      description: m.description,
      contextSize,
      priceInput: price.input,
      priceOutput: price.output,
      priceCurrency: 'USD',
      isFree: true,
      freeMechanism: 'daily-tokens',
      freeQuota: { notes: '10,000 neurons/day account-wide (shared across all Workers AI models)' },
      trialScope: 'all',
      capabilities,
      metadata: {
        cfTask: taskName,
        beta: props.beta === 'true' ? true : undefined,
        lora: props.lora === 'true' ? true : undefined,
        originalId: m.name,
        cfId: m.id,
      },
    });
  }

  return models;
}

export const fetchModels: ProviderPlugin = fetchCloudflareModels;
