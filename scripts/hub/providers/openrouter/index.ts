import type { RawModelData, ProviderPlugin } from '../../types.js';

const API_URL =
  'https://openrouter.ai/api/frontend/models/find?active=true&max_price=0&output_modalities=text';

interface OpenRouterAPIResponse {
  data: {
    models: OpenRouterModel[];
  };
}

interface OpenRouterEndpoint {
  is_free: boolean;
  is_disabled?: boolean;
  is_hidden?: boolean;
  limit_rpm?: number | null;
  limit_rpd?: number | null;
  provider_name?: string;
  provider_slug?: string;
  model_variant_slug?: string;
  variant?: string;
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
  endpoint?: OpenRouterEndpoint | null;
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
  const models = data.data.models.filter(
    (m) => m.endpoint?.is_free && !m.endpoint?.is_disabled && !m.endpoint?.is_hidden,
  );

  console.log(`[openrouter] Fetched ${models.length} free models from OpenRouter`);

  return models.map((m) => {
    const capabilities = inferCapabilities(m);
    const isMultimodal = (m.input_modalities || []).length > 1 ||
      (m.input_modalities || []).some(mod => ['image', 'audio', 'video'].includes(mod));

    const rpm = m.endpoint?.limit_rpm ?? undefined;
    const rpd = m.endpoint?.limit_rpd ?? undefined;
    const quotaParts: string[] = [];
    if (rpm) quotaParts.push(`${rpm} req/min`);
    if (rpd) quotaParts.push(`${rpd} req/day`);
    const notes = quotaParts.length
      ? `Free tier: ${quotaParts.join(', ')} (per endpoint, basic account)`
      : 'Free tier with rate limits (see openrouter.ai)';

    // modelId is the exact string the user passes to OpenRouter's API.
    // model_variant_slug includes the :free suffix; without it the call hits
    // the same-named paid endpoint and silently bills.
    const canonicalSlug = m.endpoint?.model_variant_slug || m.slug;

    return {
      vendor: 'openrouter',
      modelId: canonicalSlug,
      name: m.name,
      description: m.description.replace(/<[^>]*>/g, '').slice(0, 500),
      contextSize: m.context_length || undefined,
      priceInput: 0,
      priceOutput: 0,
      priceCurrency: 'USD',
      isFree: true,
      freeMechanism: 'rate-limited',
      freeQuota: { rpm, rpd, notes },
      trialScope: 'specific',
      capabilities,
      metadata: {
        originalId: canonicalSlug,
        baseSlug: m.slug,
        variant: m.endpoint?.variant,
        author: m.author,
        author_display_name: m.author_display_name,
        input_modalities: m.input_modalities,
        output_modalities: m.output_modalities,
        supports_reasoning: m.supports_reasoning,
        reasoning_config: m.reasoning_config,
        group: m.group,
        is_multimodal: isMultimodal,
        endpoint_provider: m.endpoint?.provider_slug,
        provider: 'openrouter',
      },
    };
  });
}

export const fetchModels: ProviderPlugin = fetchOpenRouterModels;
