import type { RawModelData, ProviderPlugin } from '../../types.js';

async function fetchXunfeiModels(): Promise<RawModelData[]> {
  const response = await fetch('https://xinghuo.xfyun.cn/api/models', {
    headers: { Accept: 'application/json' },
  });

  if (!response.ok) {
    console.warn(`[xunfei] API responded with ${response.status}`);
    return [];
  }

  const data = (await response.json()) as Record<string, unknown>;

  if (!Array.isArray(data.data)) {
    return [];
  }

  return data.data.map((m: Record<string, unknown>) => ({
    vendor: 'xunfei',
    modelId: String(m.modelId || m.id || ''),
    name: String(m.name || ''),
    description: String(m.description || ''),
    contextSize: Number(m.contextLength || m.contextWindow || 0) || undefined,
    priceInput: (() => {
      const p = m.price as Record<string, unknown> | undefined;
      const pr = m.pricing as Record<string, unknown> | undefined;
      return Number(p?.input ?? pr?.input ?? 0) || undefined;
    })(),
    priceOutput: (() => {
      const p = m.price as Record<string, unknown> | undefined;
      const pr = m.pricing as Record<string, unknown> | undefined;
      return Number(p?.output ?? pr?.output ?? 0) || undefined;
    })(),
    capabilities: Array.isArray(m.capabilities) ? m.capabilities.map(String) : undefined,
    metadata: m,
  }));
}

export const fetchModels: ProviderPlugin = fetchXunfeiModels;
