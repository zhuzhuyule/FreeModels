import type { RawModelData, ProviderPlugin } from '../../types.js';

const MARKETPLACE_URL = 'https://github.com/marketplace';

interface MarketplaceModel {
  type?: string;
  name?: string;
  friendly_name?: string;
  task?: string;
  publisher?: string;
  summary?: string;
  tags?: string[];
  registry?: string;
  model_url?: string;
  max_input_tokens?: number;
  max_output_tokens?: number;
}

const TASK_TO_CAPABILITY: Record<string, string[]> = {
  'chat-completion': ['chat', 'text-generation'],
  embeddings: ['embeddings'],
};

async function fetchPage(page: number): Promise<{ models: MarketplaceModel[]; totalPages: number }> {
  const url = `${MARKETPLACE_URL}?type=models&page=${page}`;
  const res = await fetch(url, {
    headers: { Accept: 'application/json', 'x-requested-with': 'XMLHttpRequest' },
  });
  if (!res.ok) {
    console.warn(`[github] page ${page} responded with ${res.status}`);
    return { models: [], totalPages: 0 };
  }
  const json = (await res.json()) as { results?: MarketplaceModel[]; totalPages?: number };
  return { models: json.results ?? [], totalPages: json.totalPages ?? 0 };
}

async function fetchGithubModels(): Promise<RawModelData[]> {
  const all: MarketplaceModel[] = [];
  let totalPages = 1;
  for (let p = 1; p <= totalPages; p++) {
    const { models, totalPages: tp } = await fetchPage(p);
    all.push(...models);
    if (p === 1) totalPages = tp || 1;
    // 礼貌点, 不连发.
    if (p < totalPages) await new Promise(r => setTimeout(r, 250));
  }

  console.log(`[github] Raw items received: ${all.length}`);

  const models: RawModelData[] = [];
  for (const m of all) {
    if (!m.name || !m.task) continue;
    const capabilities = TASK_TO_CAPABILITY[m.task] ?? ['text-generation'];

    models.push({
      vendor: 'github',
      modelId: `github/${m.name}`,
      name: m.friendly_name || m.name,
      description: m.summary,
      contextSize: m.max_input_tokens,
      priceCurrency: 'USD',
      // GitHub Models 免费, 按 Copilot 订阅层级限流.
      isFree: true,
      freeMechanism: 'rate-limited',
      freeQuota: { notes: 'Dependent on Copilot subscription tier (Free/Pro/Pro+/Business/Enterprise)' },
      trialScope: 'all',
      capabilities,
      metadata: {
        publisher: m.publisher,
        registry: m.registry,
        modelUrl: m.model_url,
        tags: m.tags,
        maxOutputTokens: m.max_output_tokens,
        originalId: m.name,
      },
    });
  }

  return models;
}

export const fetchModels: ProviderPlugin = fetchGithubModels;
