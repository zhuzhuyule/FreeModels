import type { RawModelData, ProviderPlugin } from '../../types.js';

// 公开端点, 无需 API key (官方文档 api-reference/models/public-models).
// 旧版硬编码表里的 llama3.1-8b / qwen-3-235b / zai-glm-4.7 均已下线,
// 且 gpt-oss-120b 早已不免费 (仅有 $5/30 天试用 credits), 改为线上解析.
const API_URL = 'https://api.cerebras.ai/public/v1/models';

interface CerebrasPublicModel {
  id: string;
  name?: string;
  description?: string;
  owned_by?: string;
  pricing?: { prompt?: string; completion?: string };
  capabilities?: Record<string, boolean>;
  limits?: { max_context_length?: number };
  deprecated?: boolean;
  preview?: boolean;
  quantization?: string;
}

// pricing 单位是 USD/token, 转成项目口径的 USD/1M tokens.
function perMillion(value: string | undefined): number | undefined {
  if (value === undefined) return undefined;
  const n = Number.parseFloat(value);
  return Number.isFinite(n) ? Number((n * 1_000_000).toFixed(4)) : undefined;
}

async function fetchCerebrasModels(): Promise<RawModelData[]> {
  console.log('[cerebras] Fetching public model catalog...');
  const res = await fetch(API_URL);
  if (!res.ok) throw new Error(`[cerebras] public models fetch failed: HTTP ${res.status}`);
  const json = (await res.json()) as { data?: CerebrasPublicModel[] };
  if (!Array.isArray(json.data)) throw new Error('[cerebras] unexpected response shape (missing data[])');

  const models: RawModelData[] = [];
  for (const m of json.data) {
    if (m.deprecated) continue;
    const caps: string[] = ['chat', 'text-generation'];
    const c = m.capabilities ?? {};
    if (c.reasoning) caps.push('reasoning');
    if (c.vision) caps.push('vision');
    if (c.function_calling || c.tools) caps.push('function-calling', 'tool-use');

    models.push({
      vendor: 'cerebras',
      modelId: `cerebras/${m.id}`,
      name: m.name ?? m.id,
      description: m.description ? `Cerebras: ${m.description}` : undefined,
      contextSize: m.limits?.max_context_length,
      priceInput: perMillion(m.pricing?.prompt),
      priceOutput: perMillion(m.pricing?.completion),
      priceCurrency: 'USD',
      // 官方口径: 无永久免费层, 所有 Shared Inference 模型可在新账号 $5 试用
      // credits (30 天过期) 内低速率使用.
      isFree: true,
      freeMechanism: 'trial-credits',
      freeQuota: {
        total_credits: 5,
        notes: '$5 free credits for new accounts (expire after 30 days); Free Trial tier ~5 RPM per model; no permanently free tier',
      },
      trialScope: 'all',
      capabilities: caps,
      metadata: {
        originalId: m.id,
        provider: 'cerebras',
        preview: m.preview,
        quantization: m.quantization,
      },
    });
  }

  if (models.length === 0) throw new Error('[cerebras] public model catalog returned no usable models');
  console.log(`[cerebras] Parsed ${models.length} models from public catalog.`);
  return models;
}

export const fetchModels: ProviderPlugin = fetchCerebrasModels;
