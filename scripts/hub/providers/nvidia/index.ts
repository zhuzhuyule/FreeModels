import type { RawModelData, ProviderPlugin } from '../../types.js';

interface NvidiaModel {
  id: string;
  object: string;
  created: number;
  owned_by: string;
}

async function fetchNvidiaModels(): Promise<RawModelData[]> {
  const response = await fetch('https://integrate.api.nvidia.com/v1/models', {
    headers: {
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    console.warn(`[nvidia] API responded with ${response.status}`);
    return [];
  }

  const data = (await response.json()) as { data: NvidiaModel[] };

  return data.data.map((m) => ({
    vendor: 'nvidia',
    modelId: m.id,
    name: m.id.split('/').pop() || m.id,
    description: `Model: ${m.id}`,
    contextSize: undefined,
    priceInput: undefined,
    priceOutput: undefined,
    capabilities: inferCapabilities(m.id),
    metadata: m,
  }));
}

function inferCapabilities(modelId: string): string[] {
  const id = modelId.toLowerCase();
  const caps: string[] = [];

  if (id.includes('embed')) caps.push('embeddings');
  if (id.includes('rerank') || id.includes('ranker')) caps.push('rerank');
  if (id.includes('vision') || id.includes('vl') || id.includes('neva') || id.includes('phi-3-vision')) caps.push('vision');
  if (id.includes('safety') || id.includes('guard') || id.includes('pii') || id.includes('content')) caps.push('moderation');
  if (id.includes('translate')) caps.push('speech-synthesis');
  if (id.includes('cosmos') || id.includes('video') || id.includes('diffusion')) caps.push('video-generation');
  if (id.includes('starcoder') || id.includes('codellama') || id.includes('codestral') || id.includes('code')) caps.push('code-generation');
  if (!caps.length) caps.push('chat', 'text-generation');

  return caps;
}

export const fetchModels: ProviderPlugin = fetchNvidiaModels;
