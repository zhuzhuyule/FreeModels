import * as fs from 'fs';
import * as path from 'path';
import type { CachedCapabilities, RawModelData, EnhancedModelData } from './types.js';
import { getCachedOrInfer } from './enhancer.js';

const CACHE_PATH = path.resolve('data/capability-cache.json');

export function loadCache(): Record<string, CachedCapabilities> {
  if (!fs.existsSync(CACHE_PATH)) {
    return {};
  }
  return JSON.parse(fs.readFileSync(CACHE_PATH, 'utf-8'));
}

export function saveCache(cache: Record<string, CachedCapabilities>): void {
  const dir = path.dirname(CACHE_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(CACHE_PATH, JSON.stringify(cache, null, 2));
}

export function updateCache(
  vendor: string,
  modelId: string,
  model: RawModelData,
  enhanced: EnhancedModelData
): void {
  const cache = loadCache();
  const key = `${vendor}/${modelId}`;

  if (!cache[key]) {
    cache[key] = {
      tags: enhanced.tags,
      isReasoning: enhanced.isReasoning,
      isMultimodal: enhanced.isMultimodal,
      contextSize: enhanced.contextLabel,
      description: model.description || enhanced.tags.join(', '),
      updatedAt: new Date().toISOString(),
    };
    saveCache(cache);
  } else if (model.description && !cache[key].description?.startsWith(model.description.substring(0, 20))) {
    cache[key].description = model.description;
    cache[key].updatedAt = new Date().toISOString();
    saveCache(cache);
  }
}

export function enhanceWithCache(
  vendor: string,
  modelId: string,
  raw: RawModelData
): EnhancedModelData {
  const cache = loadCache();
  return getCachedOrInfer(vendor, modelId, raw, cache);
}

export function saveProviderOutput(
  provider: string,
  models: EnhancedModelData[]
): string {
  const outputDir = path.resolve(`data/providers/${provider}`);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const output = {
    provider,
    updatedAt: new Date().toISOString(),
    totalModels: models.length,
    models,
  };

  const outputPath = path.join(outputDir, 'models.json');
  fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));
  return outputPath;
}
