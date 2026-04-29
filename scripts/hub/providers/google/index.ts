import type { RawModelData, ProviderPlugin } from '../../types.js';

async function fetchGoogleModels(): Promise<RawModelData[]> {
  const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models', {
    headers: { Accept: 'application/json' },
  });

  if (!response.ok) {
    console.warn(`[google] API responded with ${response.status}`);
    return [];
  }

  const data = (await response.json()) as Record<string, unknown>;

  if (!Array.isArray(data.models)) {
    return [];
  }

  return data.models.map((m: Record<string, unknown>) => ({
    vendor: 'google',
    modelId: String(m.name || '').replace('models/', ''),
    name: String(m.displayName || m.name || ''),
    description: String(m.description || ''),
    contextSize: Number(m.context_window || m.contextLength || 0) || undefined,
    priceInput: undefined,
    priceOutput: undefined,
    capabilities: Array.isArray(m.supported_generation_methods)
      ? m.supported_generation_methods.map(String)
      : undefined,
    metadata: m,
  }));
}

export const fetchModels: ProviderPlugin = fetchGoogleModels;
