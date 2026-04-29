import type { RawModelData, ProviderPlugin } from '../../types.js';

const API_URL = 'https://openrouter.ai/api/frontend/models/find?fmt=cards&max_price=0';

interface OpenRouterAPIResponse {
  data: {
    models: OpenRouterModel[];
  };
}

interface OpenRouterModel {
  slug: string;
  name: string;
  short_name: string | null;
  author: string;
  author_display_name: string;
  description: string;
  context_length: number | null;
  input_modalities: string[];
  output_modalities: string[];
  supports_reasoning: boolean;
  reasoning_config?: {
    start_token: string;
    end_token: string;
    supports_reasoning_max_tokens?: boolean;
  };
  group: string;
  hidden: boolean;
}

function inferCapabilities(model: OpenRouterModel): string[] {
  const caps: string[] = ['chat', 'text-generation'];
  const modalities = model.input_modalities || [];

  if (modalities.includes('image')) caps.push('vision');
  if (modalities.includes('audio')) caps.push('speech-recognition');
  if (modalities.includes('video')) caps.push('video-generation');

  if (model.supports_reasoning) caps.push('reasoning');

  const nameLower = model.name.toLowerCase();
  if (nameLower.includes('embed')) caps.push('embeddings');
  if (nameLower.includes('rerank')) caps.push('rerank');
  if (nameLower.includes('code')) caps.push('code-generation');
  if (nameLower.includes('translate') || nameLower.includes('translation')) caps.push('translation');
  if (nameLower.includes('speech') || nameLower.includes('tts') || nameLower.includes('voice')) caps.push('speech-synthesis');

  return [...new Set(caps)];
}

async function fetchOpenRouterModels(): Promise<RawModelData[]> {
  console.log('[openrouter] Fetching models from OpenRouter API...');

  const response = await fetch(API_URL, {
    headers: {
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    console.error(`[openrouter] API responded with ${response.status}`);
    return [];
  }

  const data = (await response.json()) as OpenRouterAPIResponse;
  const models = data.data.models;

  console.log(`[openrouter] Fetched ${models.length} free models from OpenRouter`);

  return models.map((m) => {
    const capabilities = inferCapabilities(m);
    const isMultimodal = (m.input_modalities || []).length > 1 ||
      (m.input_modalities || []).some(mod => ['image', 'audio', 'video'].includes(mod));

    return {
      vendor: 'openrouter',
      modelId: `openrouter/${m.slug}`,
      name: m.name,
      description: m.description.replace(/<[^>]*>/g, '').slice(0, 500),
      contextSize: m.context_length || undefined,
      priceInput: 0,
      priceOutput: 0,
      priceCurrency: 'USD',
      isFree: true,
      freeKind: 'rate-limited',
      trialScope: 'specific',
      rateLimits: { rpm: 20, rpd: 50, notes: 'Free models limited to 20 req/min, 50/day on basic accounts' },
      capabilities,
      metadata: {
        originalId: m.slug,
        author: m.author,
        author_display_name: m.author_display_name,
        input_modalities: m.input_modalities,
        output_modalities: m.output_modalities,
        supports_reasoning: m.supports_reasoning,
        reasoning_config: m.reasoning_config,
        group: m.group,
        is_multimodal: isMultimodal,
        provider: 'openrouter',
      },
    };
  });
}

export const fetchModels: ProviderPlugin = fetchOpenRouterModels;
