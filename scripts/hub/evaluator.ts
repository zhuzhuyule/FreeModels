import * as fs from 'fs';
import * as path from 'path';
import type { CachedCapabilities, RawModelData, EnhancedModelData, ViewOutput, ProviderMeta } from './types.js';
import { getCachedOrInfer } from './enhancer.js';

const CACHE_PATH = path.resolve('data/capability-cache.json');

export const PROVIDER_META: Record<string, ProviderMeta> = {
  gitee: {
    name: 'gitee',
    displayName: 'Gitee AI',
    website: 'https://ai.gitee.com',
  },
  xunfei: {
    name: 'xunfei',
    displayName: 'iFlytek Spark',
    website: 'https://xinghuo.xfyun.cn',
  },
  nvidia: {
    name: 'nvidia',
    displayName: 'NVIDIA AI',
    website: 'https://developer.nvidia.com/ai',
  },
  google: {
    name: 'google',
    displayName: 'Google AI',
    website: 'https://ai.google.dev',
  },
  github: {
    name: 'github',
    displayName: 'GitHub Models',
    website: 'https://github.com/marketplace/models',
  },
  cloudflare: {
    name: 'cloudflare',
    displayName: 'Cloudflare Workers AI',
    website: 'https://developers.cloudflare.com/workers-ai',
  },
};

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

export function saveViewOutput(
  view: string,
  models: EnhancedModelData[],
  filters: Record<string, string | string[]>
): string {
  const outputDir = path.resolve(`data/views/${view}`);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const output: ViewOutput = {
    view,
    updatedAt: new Date().toISOString(),
    totalModels: models.length,
    filters,
    models,
  };

  const outputPath = path.join(outputDir, 'models.json');
  fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));
  return outputPath;
}

export function buildViews(models: EnhancedModelData[]): Array<{ view: string; filters: Record<string, string | string[]> }> {
  return [
    { view: 'all', filters: {} },
    { view: 'free', filters: { billingMode: 'free' } },
    { view: 'reasoning', filters: { tags: 'reasoning' } },
    { view: 'multimodal', filters: { tags: 'multimodal' } },
  ];
}

export function filterModels(
  models: EnhancedModelData[],
  filters: Record<string, string | string[]>
): EnhancedModelData[] {
  if (Object.keys(filters).length === 0) {
    return models;
  }

  return models.filter(model => {
    for (const [key, value] of Object.entries(filters)) {
      if (Array.isArray(value)) {
        if (!value.some(v => checkFilter(model, key, v))) {
          return false;
        }
      } else {
        if (!checkFilter(model, key, value)) {
          return false;
        }
      }
    }
    return true;
  });
}

function checkFilter(model: EnhancedModelData, key: string, value: string): boolean {
  switch (key) {
    case 'billingMode':
      return model.billingMode === value;
    case 'tags':
      return model.tags.includes(value);
    case 'provider':
      return model.provider === value;
    case 'isReasoning':
      return model.isReasoning === (value === 'true');
    case 'isMultimodal':
      return model.isMultimodal === (value === 'true');
    default:
      return (model as unknown as Record<string, unknown>)[key] === value;
  }
}
