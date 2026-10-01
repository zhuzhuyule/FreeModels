import type { RawModelData, ProviderPlugin } from '../../types.js';

// 公共 API 无鉴权. 旧端点 /api/frontend/models/find 已下线 (404),
// 且该端点返回的 endpoint 级 rpm/rpd 限额在公共 API 中没有对应字段.
const API_URL = 'https://openrouter.ai/api/v1/models';

interface OpenRouterArchitecture {
  input_modalities?: string[];
  output_modalities?: string[];
}

interface OpenRouterModel {
  id: string;
  name: string;
  description: string;
  context_length: number | null;
  architecture?: OpenRouterArchitecture;
  pricing?: { prompt?: string | number; completion?: string | number };
  supported_parameters?: string[];
  reasoning?: boolean;
}

function isZeroPrice(v: string | number | undefined): boolean {
  return Number(v) === 0;
}

function inferCapabilities(model: OpenRouterModel): string[] {
  const caps: string[] = ['chat', 'text-generation'];
  const modalities = model.architecture?.input_modalities || [];

  if (modalities.includes('image')) caps.push('vision');
  if (modalities.includes('audio')) caps.push('speech-recognition');
  if (modalities.includes('video')) caps.push('video-processing');

  if (model.reasoning) caps.push('reasoning');
  if ((model.supported_parameters || []).includes('tools')) caps.push('tool-use');

  const nameLower = model.name.toLowerCase();
  if (nameLower.includes('embed')) caps.push('embeddings');
  if (nameLower.includes('rerank')) caps.push('rerank');
  if (nameLower.includes('code')) caps.push('code-generation');
  if (nameLower.includes('translate') || nameLower.includes('translation')) caps.push('translation');
  if (nameLower.includes('speech') || nameLower.includes('tts') || nameLower.includes('voice')) caps.push('speech-synthesis');

  return [...new Set(caps)];
}

async function fetchOpenRouterModels(): Promise<RawModelData[]> {
  console.log('[openrouter] Fetching models from OpenRouter public API...');

  const response = await fetch(API_URL, {
    headers: {
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    // 抛错让 aggregator 记为 provider failure, 而不是静默产出 0 条模型.
    throw new Error(`OpenRouter API responded with ${response.status}`);
  }

  const data = (await response.json()) as { data?: OpenRouterModel[] };
  const models = (data.data ?? []).filter(
    (m) =>
      m.id &&
      isZeroPrice(m.pricing?.prompt) &&
      isZeroPrice(m.pricing?.completion) &&
      (m.architecture?.output_modalities ?? ['text']).includes('text'),
  );

  console.log(`[openrouter] Fetched ${models.length} free models from OpenRouter`);

  return models.map((m) => {
    const capabilities = inferCapabilities(m);
    const inputModalities = m.architecture?.input_modalities ?? [];
    const isMultimodal =
      inputModalities.length > 1 ||
      inputModalities.some(mod => ['image', 'audio', 'video'].includes(mod));

    // 公共 API 的 id 已含 :free 后缀, 即调用 API 时使用的精确 modelId.
    const [author] = m.id.split('/');

    return {
      vendor: 'openrouter',
      modelId: m.id,
      name: m.name,
      description: (m.description || '').replace(/<[^>]*>/g, '').slice(0, 500),
      contextSize: m.context_length || undefined,
      priceInput: 0,
      priceOutput: 0,
      priceCurrency: 'USD',
      isFree: true,
      freeMechanism: 'rate-limited',
      freeQuota: { notes: 'Free tier with rate limits (see openrouter.ai)' },
      trialScope: 'specific',
      capabilities,
      metadata: {
        originalId: m.id,
        baseSlug: m.id.split(':')[0],
        variant: m.id.includes(':') ? m.id.split(':')[1] : undefined,
        author,
        input_modalities: inputModalities,
        output_modalities: m.architecture?.output_modalities ?? [],
        supports_reasoning: !!m.reasoning,
        is_multimodal: isMultimodal,
        provider: 'openrouter',
      },
    };
  });
}

export const fetchModels: ProviderPlugin = fetchOpenRouterModels;
