import type { RawModelData, ProviderPlugin, FreeQuota } from '../../types.js';

// LLM7.io：/v1/models 目录公开可读；免费口径来自官方文档两处——
// tier 字段说明 turbo = "available with free API tokens"，limits 页给出免费档配额。
// 注意：官方 quickstart 要求 dash.llm7.io 领取的 free API token（需注册，不需付费）。
const API_URL = 'https://api.llm7.io/v1/models';
const LIMITS_URL = 'https://docs.llm7.io/limits.md';

interface Llm7Model {
  id: string;
  created?: number;
  owned_by?: string;
  model_type?: string;
  tier?: string;
  usage_based_only?: boolean;
  pricing?: {
    input?: number;
    output?: number;
    price?: number;
    currency?: string;
    unit?: string;
  };
  pricing_mode?: string;
  modalities?: { input?: string[]; output?: string[] };
  context_window?: { tokens?: number | null; chars?: number | null };
  stream?: boolean;
  json_mode?: boolean;
  reasoning?: boolean;
  tools_calling?: boolean;
  capabilities?: { vision?: boolean; tools?: boolean; reasoning?: boolean };
}

function parseNumber(text: string): number | undefined {
  const match = text.replace(/,/g, '').match(/(\d+(?:\.\d+)?)/);
  return match ? Number(match[1]) : undefined;
}

// 免费档配额只在 "Free token" 这一行；按表头分节定位，避免误读 Pro 行。
function freeTokenRow(md: string, sectionPattern: RegExp): string | undefined {
  const lines = md.split('\n');
  let inSection = false;
  for (const line of lines) {
    const heading = line.match(/^##\s+(.+)$/);
    if (heading) {
      inSection = sectionPattern.test(heading[1]);
      continue;
    }
    if (inSection && /^\|\s*Free token\s*\|/i.test(line)) return line;
  }
  return undefined;
}

interface Llm7FreeLimits {
  requestPerSecond?: number;
  rpm?: number;
  requestsPerHour?: number;
  tokensPerDay?: number;
}

async function fetchFreeLimits(): Promise<Llm7FreeLimits> {
  const res = await fetch(LIMITS_URL, { headers: { Accept: 'text/markdown, text/plain;q=0.9' } });
  if (!res.ok) throw new Error(`[llm7] limits doc responded with ${res.status}`);
  const md = await res.text();

  const rateRow = freeTokenRow(md, /text\s*generation/i);
  if (!rateRow) throw new Error('[llm7] "Free token" rate row not found in limits doc');
  const cells = rateRow.split('|').map(c => c.trim()).filter(Boolean);
  // cells: [access type, per second, per minute, per hour]
  const [requestPerSecond, rpm, requestsPerHour] = [
    parseNumber(cells[1] ?? ''),
    parseNumber(cells[2] ?? ''),
    parseNumber(cells[3] ?? ''),
  ];
  if (!rpm) throw new Error(`[llm7] could not parse free-tier RPM from row: ${rateRow}`);

  const tokenRow = freeTokenRow(md, /token\s*usage\s*availability/i);
  const tokensPerDay = tokenRow ? parseNumber(tokenRow.split('|')[2] ?? '') : undefined;

  console.log(`[llm7] Free token tier: ${requestPerSecond}/s, ${rpm}/min, ${requestsPerHour}/hour, ${tokensPerDay ?? '?'} tokens per 24h`);
  return { requestPerSecond, rpm, requestsPerHour, tokensPerDay };
}

function capabilitiesFor(m: Llm7Model): string[] {
  const inputs = m.modalities?.input ?? [];
  const outputs = m.modalities?.output ?? [];
  const caps = new Set<string>();

  const type = (m.model_type || '').toLowerCase();
  if (type === 'chat' || type === 'systemone' || (!inputs.length && !outputs.length)) {
    caps.add('chat');
    caps.add('text-generation');
  }
  if (inputs.includes('image') || m.capabilities?.vision) caps.add('vision');
  if (inputs.includes('audio')) caps.add('speech-recognition');
  if (type === 'audio_to_text' || outputs.includes('audio')) caps.add(type === 'audio_to_text' ? 'speech-recognition' : 'speech-synthesis');
  if (inputs.includes('video')) caps.add('video-processing');
  if (outputs.includes('image') || type === 'image') caps.add('image-generation');
  if (outputs.includes('video') || type === 'video') caps.add('video-generation');
  if (m.tools_calling || m.capabilities?.tools) caps.add('tool-use');
  if (m.reasoning || m.capabilities?.reasoning) caps.add('reasoning');
  if (m.id.toLowerCase().includes('code')) caps.add('code-generation');
  if (m.id.toLowerCase().includes('embed')) caps.add('embeddings');

  return Array.from(caps);
}

async function fetchLlm7Models(): Promise<RawModelData[]> {
  const [modelsRes, limits] = await Promise.all([
    fetch(API_URL, { headers: { Accept: 'application/json' } }),
    fetchFreeLimits(),
  ]);
  if (!modelsRes.ok) throw new Error(`[llm7] catalog responded with ${modelsRes.status}`);

  const json = (await modelsRes.json()) as { data?: Llm7Model[] };
  const list = json.data ?? [];
  if (list.length === 0) throw new Error('[llm7] empty model catalog');

  const turbo = list.filter(m => m.tier === 'turbo');
  console.log(`[llm7] ${turbo.length}/${list.length} models in the turbo (free-token) tier`);
  if (turbo.length === 0) throw new Error('[llm7] no turbo-tier models in catalog');

  const quotaNotes = [
    'Free API token from dash.llm7.io (signup required, no payment).',
    limits.tokensPerDay
      ? `${limits.tokensPerDay.toLocaleString('en-US')} tokens per 24 hours across input+output`
      : 'Token allowance per 24 hours not published',
    `${limits.rpm} requests per minute, ${limits.requestsPerHour ?? '?'} per hour.`,
    'Official docs warn the free-token quota may be reduced without notice.',
    'price_input/price_output are LLM7 paid-usage rates (USD per 1M tokens), not what the free tier costs.',
  ].join(' ');

  const freeQuota: FreeQuota = {
    rpm: limits.rpm,
    tokens_per_day: limits.tokensPerDay,
    notes: quotaNotes,
  };

  return turbo.map((m) => {
    // usage_based_only=true 的 turbo 模型只能走付费额度，不占免费 token.
    const free = m.usage_based_only !== true;
    const pricing = m.pricing ?? {};
    const perMillion = (pricing.unit ?? '').toLowerCase() === '1m tokens';

    return {
      vendor: 'llm7',
      modelId: `llm7/${m.id}`,
      name: m.id,
      description: `LLM7 ${m.model_type ?? 'model'} (${m.tier ?? 'unknown'} tier)`,
      contextSize: m.context_window?.tokens || undefined,
      priceInput: perMillion ? pricing.input : undefined,
      priceOutput: perMillion ? pricing.output : undefined,
      priceCurrency: 'USD',
      isFree: free,
      freeMechanism: free ? 'daily-tokens' : null,
      freeQuota: free ? freeQuota : null,
      trialScope: free ? 'specific' : 'none',
      capabilities: capabilitiesFor(m),
      metadata: {
        originalId: m.id,
        owner: m.owned_by || 'llm7',
        modelType: m.model_type,
        tier: m.tier,
        usageBasedOnly: m.usage_based_only,
        pricingMode: m.pricing_mode,
        pricing: m.pricing,
        contextChars: m.context_window?.chars,
        requestsPerSecond: limits.requestPerSecond,
        requestsPerHour: limits.requestsPerHour,
        input_modalities: m.modalities?.input ?? [],
        output_modalities: m.modalities?.output ?? [],
        apiFormats: ['OpenAI'],
        source: 'api+docs',
      },
    };
  });
}

export const fetchModels: ProviderPlugin = fetchLlm7Models;
