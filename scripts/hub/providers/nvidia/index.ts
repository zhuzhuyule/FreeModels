import type { RawModelData, ProviderPlugin } from '../../types.js';

interface NvidiaModel {
  id: string;
  object: string;
  created: number;
  owned_by: string;
}

const FREE_ENDPOINT_URL = 'https://build.nvidia.com/models?filters=nimType%3Anim_type_preview&_rsc=9wvz6';
const DOCS_API_URL = 'https://docs.api.nvidia.com/nim/reference/llm-apis';

const CAPABILITY_MAP: Record<string, string[]> = {
  'chat completion': ['chat', 'text-generation'],
  'completion': ['text-generation'],
  'embedding': ['embeddings'],
  'rerank': ['rerank'],
  'image': ['vision'],
  'video': ['video-generation'],
  'speech': ['speech-synthesis', 'speech-recognition'],
  'translation': ['speech-synthesis'],
  'protein': ['protein'],
  'molecule': ['molecule'],
  'dna': ['dna'],
  'weather': ['weather'],
  'route': ['optimization'],
  'detection': ['moderation'],
  'safety': ['moderation'],
  'guardrails': ['moderation'],
  'parse': ['document-processing'],
};

async function fetchWithRetry(
  url: string,
  retries = 2,
  delayMs = 1000
): Promise<string | null> {
  for (let i = 0; i <= retries; i++) {
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; ModelHubBot/1.0)',
          Accept: 'text/html,application/xhtml+xml',
        },
      });
      if (response.ok) {
        return await response.text();
      }
      console.warn(`[nvidia] HTTP ${response.status} for ${url}`);
    } catch (err) {
      console.warn(`[nvidia] Attempt ${i + 1} failed for ${url}:`, err instanceof Error ? err.message : err);
    }
    if (i < retries) {
      await new Promise(resolve => setTimeout(resolve, delayMs * (i + 1)));
    }
  }
  console.error(`[nvidia] All retries exhausted for ${url}`);
  return null;
}

async function fetchFreeModelIds(): Promise<Set<string>> {
  const freeModels = new Set<string>();

  for (let page = 1; page <= 3; page++) {
    const url = page === 1 ? FREE_ENDPOINT_URL : `${FREE_ENDPOINT_URL}&page=${page}`;
    const html = await fetchWithRetry(url);

    if (!html) {
      console.warn(`[nvidia] Failed to fetch free models page ${page}`);
      continue;
    }

    const regex = /href="\/([a-zA-Z0-9_-]+\/[a-zA-Z0-9_.-]+)"/g;
    let match;

    while ((match = regex.exec(html)) !== null) {
      const path = match[1];
      if (!path.includes('explore') && !path.includes('models/community')) {
        freeModels.add(path);
      }
    }
  }

  return freeModels;
}

async function fetchNvidiaCapabilities(): Promise<Map<string, string[]>> {
  const capabilities = new Map<string, string[]>();

  const docsPages = [
    { url: DOCS_API_URL, defaultCaps: ['chat', 'text-generation'] },
    { url: 'https://docs.api.nvidia.com/nim/reference/retrieval-apis', defaultCaps: ['embeddings'] },
    { url: 'https://docs.api.nvidia.com/nim/reference/visual-models-apis', defaultCaps: ['vision'] },
    { url: 'https://docs.api.nvidia.com/nim/reference/healthcare-apis', defaultCaps: ['protein'] },
  ];

  for (const page of docsPages) {
    const html = await fetchWithRetry(page.url);
    if (!html) continue;

    try {
      const modelRegex = /\[([^\]]+)\]\(ref:([^)]+)\)/g;
      let match;

      while ((match = modelRegex.exec(html)) !== null) {
        const modelId = match[1].trim();
        if (modelId && modelId.includes('/')) {
          capabilities.set(modelId, page.defaultCaps);
        }
      }
    } catch (err) {
      console.warn(`[nvidia] Error parsing ${page.url}:`, err instanceof Error ? err.message : err);
    }
  }

  console.log(`[nvidia] Parsed ${capabilities.size} model capabilities from docs`);
  return capabilities;
}

async function fetchNvidiaModels(): Promise<RawModelData[]> {
  console.log(`[nvidia] Fetching models from integrate.api.nvidia.com...`);

  const modelsResponse = await fetch('https://integrate.api.nvidia.com/v1/models', {
    headers: { Accept: 'application/json' },
  });

  if (!modelsResponse.ok) {
    console.error(`[nvidia] API responded with ${modelsResponse.status}`);
    return [];
  }

  const [freeModelIds, nvidiaCaps] = await Promise.all([
    fetchFreeModelIds(),
    fetchNvidiaCapabilities(),
  ]);

  console.log(`[nvidia] Found ${freeModelIds.size} free endpoint models`);

  const data = (await modelsResponse.json()) as { data: NvidiaModel[] };

  return data.data.map((m) => {
    const modelId = m.id;
    const isFree = freeModelIds.has(modelId);
    const inferredCaps = inferCapabilities(modelId);
    const docCaps = nvidiaCaps.get(modelId);
    const capabilities = docCaps?.length ? docCaps : inferredCaps;

    return {
      vendor: 'nvidia',
      modelId,
      name: modelId.split('/').pop() || modelId,
      description: `Model: ${modelId}`,
      contextSize: undefined,
      priceInput: undefined,
      priceOutput: undefined,
      priceCurrency: 'USD',
      isFree,
      freeKind: isFree ? 'trial-quota' : 'unknown',
      trialScope: isFree ? 'specific' : 'none',
      rateLimits: isFree ? { notes: 'NVIDIA NIM free credits, exhaustible' } : undefined,
      capabilities,
      metadata: { ...m, is_free_endpoint: isFree },
    };
  });
}

function inferCapabilities(modelId: string): string[] {
  const id = modelId.toLowerCase();
  const caps: string[] = [];

  if (id.includes('embed') || id.includes('rerank') || id.includes('nv-embed') || id.includes('bge')) caps.push('embeddings');
  if (id.includes('rerank') || id.includes('rank')) caps.push('rerank');
  if (id.includes('vision') || id.includes('vl') || id.includes('neva') || id.includes('paligemma') || id.includes('phi-4-multimodal')) caps.push('vision');
  if (id.includes('safety') || id.includes('guard') || id.includes('pii') || id.includes('content-safety') || id.includes('jailbreak')) caps.push('moderation');
  if (id.includes('translate') || id.includes('riva') || id.includes('tts') || id.includes('voice') || id.includes('speech')) caps.push('speech-synthesis');
  if (id.includes('cosmos') || id.includes('video') || id.includes('diffusion') || id.includes('stable')) caps.push('video-generation');
  if (id.includes('codestral') || id.includes('starcoder') || id.includes('codegemma') || id.includes('qwen-coder')) caps.push('code-generation');
  if (id.includes('esm') || id.includes('fold') || id.includes('protein') || id.includes('molmim') || id.includes('genmol')) caps.push('protein');
  if (id.includes('bevformer') || id.includes('streampetr') || id.includes('sparsedrive') || id.includes('ocdrnet') || id.includes('grounding')) caps.push('vision');
  if (id.includes('cuopt')) caps.push('optimization');
  if (id.includes('corrdiff') || id.includes('fourcastnet')) caps.push('weather');
  if (id.includes('trellis') || id.includes('dinov2')) caps.push('vision');
  if (!caps.length) caps.push('chat', 'text-generation');

  return caps;
}

export const fetchModels: ProviderPlugin = fetchNvidiaModels;
