import * as fs from 'fs';
import * as path from 'path';
import type { CachedCapabilities, RawModelData, EnhancedModelData, ProviderMeta } from './types.js';
import { toOpenAICompatible } from './types.js';
import { getCachedOrInfer } from './enhancer.js';
import { profileModel, extractParameterCount } from './analyzer.js';

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
  openrouter: {
    name: 'openrouter',
    displayName: 'OpenRouter',
    website: 'https://openrouter.ai',
  },
  bigmodel: {
    name: 'bigmodel',
    displayName: 'BigModel',
    website: 'https://open.bigmodel.cn',
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

export function mutateCacheEntry(
  cache: Record<string, CachedCapabilities>,
  vendor: string,
  modelId: string,
  model: RawModelData,
  enhanced: EnhancedModelData
): void {
  const key = `${vendor}/${modelId}`;
  const now = new Date().toISOString();

  if (!cache[key]) {
    cache[key] = {
      tags: enhanced.tags,
      isReasoning: enhanced.isReasoning,
      isMultimodal: enhanced.isMultimodal,
      hasToolUse: enhanced.hasToolUse,
      contextSize: enhanced.contextLabel,
      parameterCount: enhanced.parameterCount,
      tier: enhanced.tier,
      performanceLevel: enhanced.performanceLevel,
      description: model.description || enhanced.tags.join(', '),
      updatedAt: now,
    };
    return;
  }
  if (model.description && !cache[key].description?.startsWith(model.description.substring(0, 20))) {
    cache[key].description = model.description;
    cache[key].updatedAt = now;
  }
}

export function enhanceWithCacheUsing(
  cache: Record<string, CachedCapabilities>,
  vendor: string,
  modelId: string,
  raw: RawModelData
): EnhancedModelData {
  const base = getCachedOrInfer(vendor, modelId, raw, cache);

  const cached = cache[`${vendor}/${modelId}`];
  const parameterCount = extractParameterCount(raw.name) || cached?.parameterCount;

  const profile = profileModel(
    raw.name,
    base.tags,
    raw.priceInput,
    raw.isFree
  );

  return {
    ...base,
    parameterCount,
    tier: profile.tier,
    speed: profile.speed,
    useCase: profile.useCase,
    performanceLevel: profile.performanceLevel,
    estimatedLatency: profile.estimatedLatency,
  };
}

export function saveProviderOutput(
  provider: string,
  models: EnhancedModelData[]
): string {
  const outputDir = path.resolve(`data/providers/${provider}`);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const compatible = toOpenAICompatible(models);
  const output = {
    object: 'list' as const,
    provider,
    updated_at: compatible.updated_at,
    total: models.length,
    data: compatible.data,
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

  const compatible = toOpenAICompatible(models);
  const output = {
    object: 'list' as const,
    view,
    updated_at: compatible.updated_at,
    total: models.length,
    filters,
    data: compatible.data,
  };

  const outputPath = path.join(outputDir, 'models.json');
  fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));
  return outputPath;
}

export function buildViews(models: EnhancedModelData[]): Array<{ view: string; filters: Record<string, string | string[]> }> {
  return [
    { view: 'all', filters: {} },
    { view: 'free', filters: { isFree: 'true' } },
    { view: 'free-permanent', filters: { freeMechanism: 'permanent' } },
    { view: 'free-rate-limited', filters: { freeMechanism: 'rate-limited' } },
    { view: 'free-quota', filters: { freeMechanism: ['daily-tokens', 'monthly-tokens', 'trial-credits'] } },
    { view: 'paid-trial', filters: { isFree: 'false', trialScope: 'all' } },
    { view: 'reasoning', filters: { tags: 'reasoning' } },
    { view: 'multimodal', filters: { tags: 'vision' } },
    { view: 'tool-use', filters: { hasToolUse: 'true' } },
    { view: 'fast', filters: { speed: 'fast' } },
    { view: 'premium', filters: { speed: 'premium' } },
    { view: 'small', filters: { tier: 'small' } },
    { view: 'large', filters: { tier: 'large' } },
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
    case 'isFree':
      return model.isFree === (value === 'true');
    case 'freeMechanism':
      return model.freeMechanism === value;
    case 'trialScope':
      return model.trialScope === value;
    case 'tags':
      return model.tags.includes(value);
    case 'provider':
      return model.provider === value;
    case 'isReasoning':
      return model.isReasoning === (value === 'true');
    case 'isMultimodal':
      return model.isMultimodal === (value === 'true');
    case 'hasToolUse':
      return model.hasToolUse === (value === 'true');
    case 'speed':
      return model.speed === value;
    case 'tier':
      return model.tier === value;
    case 'performanceLevel':
      return model.performanceLevel === value;
    default:
      return (model as unknown as Record<string, unknown>)[key] === value;
  }
}
