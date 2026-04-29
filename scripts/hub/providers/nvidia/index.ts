import type { RawModelData, ProviderPlugin } from '../../types.js';

async function fetchNvidiaModels(): Promise<RawModelData[]> {
  const apiKey = process.env.NVIDIA_API_KEY || '';
  const response = await fetch('https://integrate.api.nvidia.com/v1/models', {
    headers: {
      Authorization: `Bearer ${apiKey}`,
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    console.warn(`[nvidia] API responded with ${response.status}`);
    return [];
  }

  const data = (await response.json()) as Record<string, unknown>;

  if (!Array.isArray(data.models)) {
    return [];
  }

  return data.models.map((m: Record<string, unknown>) => ({
    vendor: 'nvidia',
    modelId: String(m.id || ''),
    name: String(m.name || ''),
    description: String(m.description || ''),
    contextSize: Number(m.context_length || m.contextWindow || 0) || undefined,
    priceInput: (() => {
      const p = m.pricing as Record<string, unknown> | undefined;
      return Number(p?.input ?? 0) || undefined;
    })(),
    priceOutput: (() => {
      const p = m.pricing as Record<string, unknown> | undefined;
      return Number(p?.output ?? 0) || undefined;
    })(),
    capabilities: Array.isArray(m.capabilities) ? m.capabilities.map(String) : undefined,
    metadata: m,
  }));
}

export const fetchModels: ProviderPlugin = fetchNvidiaModels;
