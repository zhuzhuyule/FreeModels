import type { RawModelData, ProviderPlugin, FreeQuota, PriceCurrency } from '../../types.js';

// OVHcloud AI Endpoints：OpenAI 兼容端点可匿名访问（无需 API key / 注册）。
// - 目录: https://oai.endpoints.kepler.ai.cloud.ovh.net/v1/models
// - 速率: docs.ovhcloud.com 的 AI Endpoints 文档（RSPress，URL 追加 .md 即纯 markdown）
const API_URL = 'https://oai.endpoints.kepler.ai.cloud.ovh.net/v1/models';
const CAPABILITIES_DOC_URL =
  'https://docs.ovhcloud.com/en/guides/public-cloud/ai-machine-learning/ai-endpoints-capabilities.md';

interface OvhPricing {
  currency_unit?: string;
  prompt?: string;
  completion?: string;
  request?: string;
  image?: string;
  input_cache_reads?: string;
  input_cache_writes?: string;
}

interface OvhModel {
  id: string;
  object?: string;
  created?: number;
  owned_by?: string;
  context_length?: number;
  max_completion_tokens?: number;
  pricing?: OvhPricing;
}

// 目录里的单价是「每 token」，hub 的口径是每 1M tokens。
function perMillion(perToken: string | number | undefined): number | undefined {
  const n = Number(perToken);
  if (!Number.isFinite(n) || n <= 0) return undefined;
  return Number((n * 1_000_000).toFixed(4));
}

function capabilitiesFor(id: string): string[] {
  const s = id.toLowerCase();
  if (s.includes('tts')) return ['speech-synthesis'];
  if (s.includes('whisper') || /asr/.test(s)) return ['speech-recognition'];
  if (s.includes('embed') || s.includes('bge')) return ['embeddings'];
  if (s.includes('stable-diffusion') || s.includes('diffusion')) return ['image-generation'];
  if (s.includes('guard')) return ['moderation'];
  const caps = ['chat', 'text-generation'];
  if (s.includes('-vl') || s.includes('vision')) caps.push('vision');
  return caps;
}

async function fetchAnonymousTier(): Promise<{ rpm: number; note: string }> {
  const res = await fetch(CAPABILITIES_DOC_URL, { headers: { Accept: 'text/markdown, text/plain;q=0.9,*/*;q=0.8' } });
  if (!res.ok) throw new Error(`[ovh] capabilities doc responded with ${res.status}`);
  const md = await res.text();
  const line = md.match(/- \*\*Anonymous\*\*:[^\n]*/)?.[0];
  const rpm = line?.match(/(\d+)\s*requests? per minute/i);
  if (!line || !rpm) throw new Error('[ovh] anonymous rate limit not found in capabilities doc');
  console.log(`[ovh] ${line.replace(/^- /, '')}`);
  return { rpm: parseInt(rpm[1], 10), note: line.replace(/^- \*\*Anonymous\*\*:\s*/, '').replace(/\.\s*$/, '').trim() };
}

async function fetchOvhModels(): Promise<RawModelData[]> {
  const [catalogRes, tier] = await Promise.all([
    fetch(API_URL, { headers: { Accept: 'application/json' } }),
    fetchAnonymousTier(),
  ]);
  if (!catalogRes.ok) throw new Error(`[ovh] catalog responded with ${catalogRes.status}`);

  const json = (await catalogRes.json()) as { data?: OvhModel[] };
  const list = json.data ?? [];
  if (list.length === 0) throw new Error('[ovh] empty model catalog');
  console.log(`[ovh] ${list.length} models in AI Endpoints catalog`);

  const freeQuota: FreeQuota = {
    rpm: tier.rpm,
    notes: `Anonymous access (no API key, no signup): ${tier.note}. With an API key the same models are billed pay-as-you-go per token (400 RPM per project) — price_input/price_output are those rates, not what the anonymous tier costs.`,
  };

  return list.map((m) => {
    const currency: PriceCurrency = m.pricing?.currency_unit === 'CNY' ? 'CNY' : 'USD';
    return {
      vendor: 'ovh',
      modelId: `ovh/${m.id}`,
      name: m.id,
      contextSize: m.context_length || undefined,
      priceInput: perMillion(m.pricing?.prompt),
      priceOutput: perMillion(m.pricing?.completion),
      priceCurrency: currency,
      // 匿名层不计费、无需账号，全部模型按速率限制免费。
      isFree: true,
      freeMechanism: 'rate-limited',
      freeQuota,
      trialScope: 'all',
      capabilities: capabilitiesFor(m.id),
      metadata: {
        originalId: m.id,
        owner: m.owned_by,
        maxCompletionTokens: m.max_completion_tokens || undefined,
        catalogPricing: m.pricing,
        apiFormats: ['OpenAI'],
        source: 'api+docs',
      },
    };
  });
}

export const fetchModels: ProviderPlugin = fetchOvhModels;
