import type { RawModelData, ProviderPlugin } from '../../types.js';

const API_URL = 'https://cloud.sambanova.ai/api/pricing';

interface SambaPrice {
  model_id?: string;
  model_name?: string;
  input_token_price?: string;
  output_token_price?: string;
  input_duration_price_per_hour?: string;
}

function parseNumber(v: string | undefined): number | undefined {
  if (!v) return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
}

async function fetchSambaNovaModels(): Promise<RawModelData[]> {
  const res = await fetch(API_URL);
  if (!res.ok) {
    console.warn(`[sambanova] API responded with ${res.status}`);
    return [];
  }
  const json = (await res.json()) as { prices?: SambaPrice[] };
  const list = json.prices ?? [];
  console.log(`[sambanova] Raw items received: ${list.length}`);

  const models: RawModelData[] = [];
  for (const m of list) {
    const id = m.model_id;
    if (!id) continue;

    // SambaNova 的价格字段是 cents per million tokens (推断), 转 USD per million.
    const inputCents = parseNumber(m.input_token_price);
    const outputCents = parseNumber(m.output_token_price);
    const priceInput = inputCents !== undefined ? inputCents / 100 : undefined;
    const priceOutput = outputCents !== undefined ? outputCents / 100 : undefined;

    models.push({
      vendor: 'sambanova',
      modelId: `sambanova/${id}`,
      name: m.model_name || id,
      priceInput,
      priceOutput,
      priceCurrency: 'USD',
      // SambaNova Cloud 给新账户 $5 trial credits, 有效 3 个月.
      isFree: true,
      freeMechanism: 'trial-credits',
      freeQuota: { total_credits: 5, notes: '$5 trial credits, valid for 3 months' },
      trialScope: 'all',
      capabilities: ['chat', 'text-generation'],
      metadata: { originalId: id },
    });
  }

  return models;
}

export const fetchModels: ProviderPlugin = fetchSambaNovaModels;
