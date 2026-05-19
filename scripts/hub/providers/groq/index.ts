import type { RawModelData, ProviderPlugin, FreeQuota } from '../../types.js';

const API_BASE = 'https://api.groq.com/openai/v1';

// 价格表 (USD per 1M tokens) - Groq API 不返回价格, 手工维护. 不在表里的留 undefined.
const PRICE_TABLE: Record<string, { input?: number; output?: number; speed?: number }> = {
  'llama-3.1-8b-instant': { input: 0.05, output: 0.08, speed: 840 },
  'llama-3.3-70b-versatile': { input: 0.59, output: 0.79, speed: 394 },
  'meta-llama/llama-4-scout-17b-16e-instruct': { input: 0.11, output: 0.34, speed: 594 },
  'qwen/qwen3-32b': { input: 0.29, output: 0.59, speed: 662 },
  'openai/gpt-oss-20b': { input: 0.075, output: 0.30, speed: 1000 },
  'openai/gpt-oss-120b': { input: 0.15, output: 0.60, speed: 500 },
  'openai/gpt-oss-safeguard-20b': { input: 0.075, output: 0.30 },
  'canopylabs/orpheus-v1-english': { input: 22, speed: 100 },
  'canopylabs/orpheus-arabic-saudi': { input: 40, speed: 100 },
  'whisper-large-v3': { input: 0.111, speed: 217 },
  'whisper-large-v3-turbo': { input: 0.04, speed: 228 },
  'allam-2-7b': {},
  'groq/compound': {},
  'groq/compound-mini': {},
};

const CAPABILITY_OVERRIDES: Record<string, string[]> = {
  'qwen/qwen3-32b': ['chat', 'text-generation', 'reasoning'],
  'canopylabs/orpheus-v1-english': ['speech-synthesis'],
  'canopylabs/orpheus-arabic-saudi': ['speech-synthesis', 'translation'],
  'whisper-large-v3': ['speech-recognition'],
  'whisper-large-v3-turbo': ['speech-recognition'],
  'meta-llama/llama-prompt-guard-2-22m': ['moderation'],
  'meta-llama/llama-prompt-guard-2-86m': ['moderation'],
};

interface GroqApiModel {
  id: string;
  owned_by?: string;
  active?: boolean;
  context_window?: number;
  max_completion_tokens?: number;
}

function detectCapabilities(id: string): string[] {
  if (CAPABILITY_OVERRIDES[id]) return CAPABILITY_OVERRIDES[id];
  if (id.includes('whisper')) return ['speech-recognition'];
  if (id.includes('orpheus') || id.includes('tts')) return ['speech-synthesis'];
  if (id.includes('prompt-guard') || id.includes('guard')) return ['moderation'];
  return ['chat', 'text-generation'];
}

async function fetchModelList(apiKey: string): Promise<GroqApiModel[]> {
  const res = await fetch(`${API_BASE}/models`, {
    headers: { Authorization: `Bearer ${apiKey}` },
  });
  if (!res.ok) {
    console.warn(`[groq] /models responded with ${res.status}`);
    return [];
  }
  const json = (await res.json()) as { data?: GroqApiModel[] };
  return (json.data ?? []).filter(m => m.active !== false);
}

async function fetchRateLimits(modelId: string, apiKey: string): Promise<FreeQuota | null> {
  // 跳过 whisper/tts/guard 类: chat/completions 端点不接受这些模型.
  if (modelId.includes('whisper') || modelId.includes('orpheus') || modelId.includes('guard') || modelId.includes('tts')) {
    return null;
  }

  try {
    const res = await fetch(`${API_BASE}/chat/completions`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: modelId,
        messages: [{ role: 'user', content: 'Hi' }],
        max_tokens: 1,
        stream: true,
      }),
    });
    // 立刻 cancel body 避免读完, 我们只要 header.
    await res.body?.cancel();
    if (!res.ok) return null;

    const rpd = res.headers.get('x-ratelimit-limit-requests');
    const tpm = res.headers.get('x-ratelimit-limit-tokens');
    const quota: FreeQuota = {};
    if (rpd) quota.rpd = parseInt(rpd, 10);
    if (tpm) quota.tpm = parseInt(tpm, 10);
    return Object.keys(quota).length > 0 ? quota : null;
  } catch (err) {
    console.warn(`[groq] rate-limit probe failed for ${modelId}: ${err instanceof Error ? err.message : err}`);
    return null;
  }
}

async function withConcurrency<T, R>(items: T[], limit: number, fn: (item: T) => Promise<R>): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let cursor = 0;
  async function worker(): Promise<void> {
    while (true) {
      const idx = cursor++;
      if (idx >= items.length) return;
      results[idx] = await fn(items[idx]);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, () => worker()));
  return results;
}

async function fetchGroqModels(): Promise<RawModelData[]> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    console.warn('[groq] GROQ_API_KEY missing, skipping.');
    return [];
  }

  const apiModels = await fetchModelList(apiKey);
  console.log(`[groq] Discovered ${apiModels.length} active models via /v1/models`);

  // 并发 5 个探 rate-limit header.
  const quotas = await withConcurrency(apiModels, 5, m => fetchRateLimits(m.id, apiKey));

  const models: RawModelData[] = [];
  for (let i = 0; i < apiModels.length; i++) {
    const m = apiModels[i];
    const price = PRICE_TABLE[m.id] ?? {};
    const quota = quotas[i] ?? undefined;

    models.push({
      vendor: 'groq',
      modelId: `groq/${m.id}`,
      name: m.id,
      contextSize: m.context_window,
      priceInput: price.input,
      priceOutput: price.output,
      priceCurrency: 'USD',
      // Groq 全部模型都在免费层内可用, 按 rate-limit 限流.
      isFree: true,
      freeMechanism: 'rate-limited',
      freeQuota: quota ?? { notes: 'Rate-limited free tier' },
      trialScope: 'all',
      capabilities: detectCapabilities(m.id),
      metadata: {
        originalId: m.id,
        owner: m.owned_by,
        speed: price.speed,
        maxCompletionTokens: m.max_completion_tokens,
      },
    });
  }

  console.log(`[groq] Built ${models.length} models with rate-limit data`);
  return models;
}

export const fetchModels: ProviderPlugin = fetchGroqModels;
