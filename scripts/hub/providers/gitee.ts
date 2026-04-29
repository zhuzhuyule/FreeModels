import type { RawModelData } from '../types.js';

export async function fetchGiteeModels(): Promise<RawModelData[]> {
  const response = await fetch('https://ai.gitee.com/api/models', {
    headers: { 'Accept': 'application/json' },
  });

  if (!response.ok) {
    console.warn(`Gitee API responded with ${response.status}`);
    return [];
  }

  const data = await response.json() as Record<string, unknown>;

  if (!Array.isArray(data.models)) {
    return [];
  }

  return data.models.map((m: Record<string, unknown>) => ({
    vendor: 'gitee',
    modelId: String(m.id || m.model_id || ''),
    name: String(m.name || ''),
    description: String(m.description || ''),
    contextSize: Number(m.context_length || m.context_size || 0) || undefined,
    priceInput: (() => {
      const p = m.pricing as Record<string, unknown> | undefined;
      return Number(m.price_input ?? p?.input ?? 0) || undefined;
    })(),
    priceOutput: (() => {
      const p = m.pricing as Record<string, unknown> | undefined;
      return Number(m.price_output ?? p?.output ?? 0) || undefined;
    })(),
    capabilities: Array.isArray(m.capabilities) ? m.capabilities.map(String) : undefined,
    metadata: m,
  }));
}
