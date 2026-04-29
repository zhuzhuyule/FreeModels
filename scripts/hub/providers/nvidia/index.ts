import type { RawModelData, ProviderPlugin } from '../../types.js';

interface NvidiaModel {
  id: string;
  object: string;
  created: number;
  owned_by: string;
}

const FREE_ENDPOINT_URL = 'https://build.nvidia.com/models?filters=nimType%3Anim_type_preview&_rsc=9wvz6';

async function fetchFreeModelIds(): Promise<Set<string>> {
  const freeModels = new Set<string>();

  for (let page = 1; page <= 3; page++) {
    const url = page === 1 ? FREE_ENDPOINT_URL : `${FREE_ENDPOINT_URL}&page=${page}`;
    try {
      const response = await fetch(url);
      if (!response.ok) break;

      const html = await response.text();
      const regex = /href="\/([a-zA-Z0-9_-]+\/[a-zA-Z0-9_.-]+)"/g;
      let match;

      while ((match = regex.exec(html)) !== null) {
        const path = match[1];
        if (!path.includes('explore') && !path.includes('models/community')) {
          freeModels.add(path);
        }
      }
    } catch {
      break;
    }
  }

  return freeModels;
}

async function fetchNvidiaModels(): Promise<RawModelData[]> {
  const [modelsResponse, freeModelIds] = await Promise.all([
    fetch('https://integrate.api.nvidia.com/v1/models'),
    fetchFreeModelIds(),
  ]);

  if (!modelsResponse.ok) {
    console.warn(`[nvidia] API responded with ${modelsResponse.status}`);
    return [];
  }

  const data = (await modelsResponse.json()) as { data: NvidiaModel[] };

  return data.data.map((m) => {
    const modelId = m.id;
    const isFree = freeModelIds.has(modelId);

    return {
      vendor: 'nvidia',
      modelId,
      name: modelId.split('/').pop() || modelId,
      description: `Model: ${modelId}`,
      contextSize: undefined,
      priceInput: undefined,
      priceOutput: undefined,
      isFree,
      capabilities: inferCapabilities(modelId),
      metadata: { ...m, is_free_endpoint: isFree },
    };
  });
}

function inferCapabilities(modelId: string): string[] {
  const id = modelId.toLowerCase();
  const caps: string[] = [];

  if (id.includes('embed')) caps.push('embeddings');
  if (id.includes('rerank')) caps.push('rerank');
  if (id.includes('vision') || id.includes('vl') || id.includes('neva') || id.includes('paligemma')) caps.push('vision');
  if (id.includes('safety') || id.includes('guard') || id.includes('pii') || id.includes('content')) caps.push('moderation');
  if (id.includes('translate') || id.includes('tts') || id.includes('tts') || id.includes('voice')) caps.push('speech-synthesis');
  if (id.includes('cosmos') || id.includes('video') || id.includes('diffusion') || id.includes('sparse')) caps.push('video-generation');
  if (id.includes('starcoder') || id.includes('codellama') || id.includes('codestral') || id.includes('code')) caps.push('code-generation');
  if (id.includes('esm')) caps.push('protein');
  if (!caps.length) caps.push('chat', 'text-generation');

  return caps;
}

export const fetchModels: ProviderPlugin = fetchNvidiaModels;
