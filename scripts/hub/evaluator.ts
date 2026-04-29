import * as fs from 'fs';
import * as path from 'path';
import type { CachedCapabilities, RawModelData, ModelEntry } from './types.js';

const CACHE_PATH = path.resolve('data/capability-cache.json');

function loadCache(): Record<string, CachedCapabilities> {
  if (!fs.existsSync(CACHE_PATH)) {
    return {};
  }
  return JSON.parse(fs.readFileSync(CACHE_PATH, 'utf-8'));
}

function saveCache(cache: Record<string, CachedCapabilities>): void {
  const dir = path.dirname(CACHE_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(CACHE_PATH, JSON.stringify(cache, null, 2));
}

function generateCapabilities(model: RawModelData): CachedCapabilities {
  const modelId = model.modelId.toLowerCase();
  const name = model.name.toLowerCase();
  const tags: string[] = [];

  const isReasoning =
    /\b(reasoning|think|r1|thought)\b/.test(modelId) ||
    /\b(reasoning|think|r1|thought)\b/.test(name);

  const isMultimodal =
    /\b(vision|visionary|multimodal|image|visual)\b/.test(modelId) ||
    /\b(vision|visionary|multimodal|image|visual)\b/.test(name);

  if (isReasoning) tags.push('reasoning');
  if (isMultimodal) tags.push('multimodal');
  if (model.capabilities) {
    tags.push(...model.capabilities.filter(t => !tags.includes(t)));
  }

  let contextSize = 'unknown';
  if (model.contextSize) {
    if (model.contextSize >= 1000000) {
      contextSize = `${Math.round(model.contextSize / 1000000)}M`;
    } else if (model.contextSize >= 1000) {
      contextSize = `${Math.round(model.contextSize / 1000)}K`;
    } else {
      contextSize = `${model.contextSize}`;
    }
  }

  return {
    tags,
    isReasoning,
    isMultimodal,
    contextSize,
    updatedAt: new Date().toISOString(),
  };
}

export function getCachedCapabilities(
  vendor: string,
  modelId: string
): CachedCapabilities | null {
  const cache = loadCache();
  const key = `${vendor}/${modelId}`;
  return cache[key] || null;
}

export function evaluateCapabilities(
  vendor: string,
  modelId: string,
  rawData: RawModelData
): CachedCapabilities {
  const cache = loadCache();
  const key = `${vendor}/${modelId}`;

  if (!cache[key]) {
    cache[key] = generateCapabilities(rawData);
    saveCache(cache);
  }

  return cache[key];
}

export function evaluateDynamicPricing(
  model: RawModelData
): { isFree: boolean; billingMode: 'free' | 'pay' | 'mixed'; priceInput?: number; priceOutput?: number } {
  const priceInput = model.priceInput ?? 0;
  const priceOutput = model.priceOutput ?? 0;

  if (priceInput === 0 && priceOutput === 0) {
    return { isFree: true, billingMode: 'free' };
  }

  if (priceInput === 0 || priceOutput === 0) {
    return {
      isFree: false,
      billingMode: 'mixed',
      priceInput: priceInput || undefined,
      priceOutput: priceOutput || undefined,
    };
  }

  return {
    isFree: false,
    billingMode: 'pay',
    priceInput,
    priceOutput,
  };
}

export function mergeModelEntry(
  raw: RawModelData,
  cached: CachedCapabilities,
  dynamic: ReturnType<typeof evaluateDynamicPricing>
): ModelEntry {
  return {
    vendor: raw.vendor,
    modelId: raw.modelId,
    name: raw.name,
    description: raw.description,
    contextSize: cached.contextSize,
    isFree: dynamic.isFree,
    billingMode: dynamic.billingMode,
    isReasoning: cached.isReasoning,
    isMultimodal: cached.isMultimodal,
    capabilities: cached.tags,
    priceInput: dynamic.priceInput,
    priceOutput: dynamic.priceOutput,
    raw: raw.metadata || {},
  };
}
