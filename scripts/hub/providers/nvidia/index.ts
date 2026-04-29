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

async function fetchNvidiaCapabilities(): Promise<Map<string, string[]>> {
  const capabilities = new Map<string, string[]>();

  try {
    const response = await fetch(DOCS_API_URL);
    if (!response.ok) return capabilities;

    const html = await response.text();

    const sectionRegex = /##\s+(Retrieval|Visual Models|multimodAl|Healthcare|route optimization|climate simulation|LLM APIs)([\s\S]*?)(?=##\s|$)/gi;
    let sectionMatch;

    while ((sectionMatch = sectionRegex.exec(html)) !== null) {
      const sectionName = sectionMatch[1].toLowerCase();
      const sectionContent = sectionMatch[2];

      const modelRegex = /\[([^\]]+)\]\(\/nim\/reference\/[^\)]+\)/g;
      let modelMatch;

      while ((modelMatch = modelRegex.exec(sectionContent)) !== null) {
        const modelPath = modelMatch[1];
        const caps = CAPABILITY_MAP[sectionName] || ['chat', 'text-generation'];
        capabilities.set(modelPath, caps);
      }
    }
  } catch {
    // fallback to empty map
  }

  return capabilities;
}

async function fetchNvidiaModels(): Promise<RawModelData[]> {
  const [modelsResponse, freeModelIds, nvidiaCaps] = await Promise.all([
    fetch('https://integrate.api.nvidia.com/v1/models'),
    fetchFreeModelIds(),
    fetchNvidiaCapabilities(),
  ]);

  if (!modelsResponse.ok) {
    console.warn(`[nvidia] API responded with ${modelsResponse.status}`);
    return [];
  }

  const data = (await modelsResponse.json()) as { data: NvidiaModel[] };

  return data.data.map((m) => {
    const modelId = m.id;
    const isFree = freeModelIds.has(modelId);
    const inferredCaps = inferCapabilities(modelId);
    const docCaps = nvidiaCaps.get(modelId);
    const capabilities = docCaps || inferredCaps;

    return {
      vendor: 'nvidia',
      modelId,
      name: modelId.split('/').pop() || modelId,
      description: `Model: ${modelId}`,
      contextSize: undefined,
      priceInput: undefined,
      priceOutput: undefined,
      isFree,
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
