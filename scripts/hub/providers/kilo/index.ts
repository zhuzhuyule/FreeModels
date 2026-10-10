import type { RawModelData, ProviderPlugin } from '../../types.js';

// Kilo Code Gateway：免费模型池对匿名请求开放（无需 API key / 注册）。
// - 目录: https://api.kilo.ai/api/gateway/models （官方 isFree 字段）
// - 速率: https://kilo.ai/docs/gateway/models-and-providers （"Anonymous users are rate-limited to 200 requests per hour per IP"）
const API_URL = 'https://api.kilo.ai/api/gateway/models';
const DOCS_URL = 'https://kilo.ai/docs/gateway/models-and-providers';

interface KiloModel {
  id: string;
  name?: string;
  description?: string;
  created?: number;
  context_length?: number;
  architecture?: {
    input_modalities?: string[];
    output_modalities?: string[];
  };
  top_provider?: { context_length?: number; max_completion_tokens?: number; is_moderated?: boolean };
  pricing?: { prompt?: string | number; completion?: string | number };
  supported_parameters?: string[];
  isFree?: boolean;
  mayTrainOnYourPrompts?: boolean;
  autoRouting?: boolean;
}

function capabilitiesFor(m: KiloModel): string[] {
  const inputs = m.architecture?.input_modalities ?? [];
  const outputs = m.architecture?.output_modalities ?? [];
  const params = m.supported_parameters ?? [];
  const caps = new Set<string>(['chat', 'text-generation']);

  if (inputs.includes('image')) caps.add('vision');
  if (inputs.includes('audio')) caps.add('speech-recognition');
  if (inputs.includes('video')) caps.add('video-processing');
  if (outputs.includes('image')) caps.add('image-generation');
  if (outputs.includes('audio')) caps.add('speech-synthesis');
  if (params.includes('tools')) caps.add('tool-use');
  if (params.includes('reasoning') || params.includes('include_reasoning')) caps.add('reasoning');

  const id = m.id.toLowerCase();
  if (id.includes('code')) caps.add('code-generation');
  if (id.includes('embed')) caps.add('embeddings');
  return Array.from(caps);
}

async function fetchAnonymousRateLimit(): Promise<{ rph?: number; note: string }> {
  const res = await fetch(DOCS_URL);
  if (!res.ok) throw new Error(`[kilo] docs page responded with ${res.status}`);
  const html = await res.text();
  const match = html.match(/([\d,]+)\s*requests? per hour per IP/i);
  if (!match) throw new Error('[kilo] anonymous rate limit not found in docs');
  const rph = parseInt(match[1].replace(/,/g, ''), 10);
  console.log(`[kilo] Anonymous tier: ${rph} requests per hour per IP`);
  return { rph, note: `${rph} requests per hour per IP (anonymous, no API key required)` };
}

async function fetchKiloModels(): Promise<RawModelData[]> {
  const [catalogRes, tier] = await Promise.all([
    fetch(API_URL, { headers: { Accept: 'application/json' } }),
    fetchAnonymousRateLimit(),
  ]);
  if (!catalogRes.ok) throw new Error(`[kilo] catalog responded with ${catalogRes.status}`);

  const json = (await catalogRes.json()) as { data?: KiloModel[] };
  const list = json.data ?? [];
  if (list.length === 0) throw new Error('[kilo] empty model catalog');

  const free = list.filter(m => m.isFree === true);
  console.log(`[kilo] ${free.length}/${list.length} models flagged free`);
  if (free.length === 0) throw new Error('[kilo] no free models in catalog');

  return free.map((m) => ({
    vendor: 'kilo',
    modelId: `kilo/${m.id}`,
    name: m.name ?? m.id,
    description: (m.description || '').slice(0, 500),
    contextSize: m.context_length || m.top_provider?.context_length || undefined,
    priceInput: 0,
    priceOutput: 0,
    priceCurrency: 'USD' as const,
    isFree: true,
    freeMechanism: 'rate-limited',
    freeQuota: { notes: tier.note },
    trialScope: 'specific',
    capabilities: capabilitiesFor(m),
    metadata: {
      originalId: m.id,
      maxCompletionTokens: m.top_provider?.max_completion_tokens,
      input_modalities: m.architecture?.input_modalities ?? [],
      output_modalities: m.architecture?.output_modalities ?? [],
      requests_per_hour: tier.rph,
      auto_routing: m.autoRouting,
      may_train_on_your_prompts: m.mayTrainOnYourPrompts,
      apiFormats: ['OpenAI'],
      source: 'api+docs',
    },
  }));
}

export const fetchModels: ProviderPlugin = fetchKiloModels;
