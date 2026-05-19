import type { RawModelData, ProviderPlugin } from '../../types.js';

const API_URL = 'https://api.cohere.com/v1/models';

// Cohere endpoint type -> capability tag.
const ENDPOINT_TO_CAPABILITY: Record<string, string> = {
  chat: 'chat',
  generate: 'text-generation',
  embed: 'embeddings',
  embed_image: 'vision',
  rerank: 'rerank',
  summarize: 'text-generation',
  transcriptions: 'speech-recognition',
};

interface CohereModel {
  name?: string;
  endpoints?: string[];
  default_endpoints?: string[];
  context_length?: number;
  is_deprecated?: boolean;
  finetuned?: boolean;
  features?: string[] | null;
}

async function fetchCoherePage(token?: string): Promise<{ models: CohereModel[]; next?: string }> {
  const apiKey = process.env.COHERE_API_KEY;
  const url = new URL(API_URL);
  url.searchParams.set('page_size', '200');
  if (token) url.searchParams.set('page_token', token);

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${apiKey}`, Accept: 'application/json' },
  });
  if (!res.ok) {
    console.warn(`[cohere] API responded with ${res.status}`);
    return { models: [] };
  }
  const json = (await res.json()) as { models?: CohereModel[]; next_page_token?: string };
  return { models: json.models ?? [], next: json.next_page_token };
}

async function fetchCohereModels(): Promise<RawModelData[]> {
  if (!process.env.COHERE_API_KEY) {
    console.warn('[cohere] COHERE_API_KEY missing, skipping.');
    return [];
  }

  const all: CohereModel[] = [];
  let token: string | undefined;
  do {
    const page = await fetchCoherePage(token);
    all.push(...page.models);
    token = page.next;
  } while (token);

  console.log(`[cohere] Raw items received: ${all.length}`);

  const models: RawModelData[] = [];
  for (const m of all) {
    if (!m.name) continue;
    if (m.is_deprecated) continue;
    if (m.finetuned) continue;

    const endpoints = new Set([...(m.endpoints ?? []), ...(m.default_endpoints ?? [])]);
    const capabilities = new Set<string>();
    for (const ep of endpoints) {
      const cap = ENDPOINT_TO_CAPABILITY[ep];
      if (cap) capabilities.add(cap);
    }
    if (capabilities.size === 0) continue;

    models.push({
      vendor: 'cohere',
      modelId: `cohere/${m.name}`,
      name: m.name,
      contextSize: m.context_length,
      priceCurrency: 'USD',
      // Cohere trial key: 20 RPM, 1000 requests/month shared across all models.
      isFree: true,
      freeMechanism: 'rate-limited',
      freeQuota: { rpm: 20, notes: '1000 requests/month shared across all models on trial key' },
      trialScope: 'all',
      capabilities: Array.from(capabilities),
      metadata: {
        endpoints: Array.from(endpoints),
        features: m.features ?? undefined,
        originalId: m.name,
      },
    });
  }

  return models;
}

export const fetchModels: ProviderPlugin = fetchCohereModels;
