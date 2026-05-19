import type {
  RawModelData,
  EnhancedModelData,
  CachedCapabilities,
  FreeMechanism,
  FreeQuota,
  TrialScope,
} from './types.js';
import { normalizeCapabilities, deriveDerivedTags, type CapabilityTag } from './taxonomy.js';
import { canonicalizeFamily } from './family.js';

const REASONING_KEYWORDS = /\b(reasoning|think|thought|r1|tot|chain.?of.?thought|problem.?solv|logical.?think)\b/i;
const MULTIMODAL_KEYWORDS = /\b(vision|visual|multimodal|image|photo|picture|图生|图理解|视觉|多模态)\b/i;
const TEXT_GEN_KEYWORDS = /\b(text|chat|llm|language|model|对话|文本|生成)\b/i;
const TOOL_USE_KEYWORDS = /\b(tool|function.?call|plugin|tool.?use|actions|function_calling)\b/i;

export function inferCapabilities(model: RawModelData): {
  tags: CapabilityTag[];
  isReasoning: boolean;
  isMultimodal: boolean;
  hasToolUse: boolean;
} {
  const text = `${model.modelId} ${model.name} ${model.description || ''}`.toLowerCase();

  const fromKeyword = new Set<CapabilityTag>();
  if (REASONING_KEYWORDS.test(text)) fromKeyword.add('reasoning');
  if (MULTIMODAL_KEYWORDS.test(text)) fromKeyword.add('vision');
  if (TEXT_GEN_KEYWORDS.test(text)) fromKeyword.add('text-generation');
  if (TOOL_USE_KEYWORDS.test(text)) fromKeyword.add('tool-use');

  const fromProvider = normalizeCapabilities(model.capabilities ?? []);

  const merged = deriveDerivedTags([
    ...Array.from(fromKeyword),
    ...fromProvider,
  ]);

  return {
    tags: merged,
    isReasoning: merged.includes('reasoning'),
    isMultimodal: merged.includes('vision') || merged.includes('multimodal'),
    hasToolUse: merged.includes('tool-use') || merged.includes('function-calling'),
  };
}

export function formatContextLabel(contextSize?: number): string {
  if (!contextSize || contextSize === 0) return 'unknown';
  if (contextSize >= 1_000_000) return `${Math.round(contextSize / 1_000_000)}M`;
  if (contextSize >= 1_000) return `${Math.round(contextSize / 1_000)}K`;
  return `${contextSize}`;
}

/**
 * 推断免费机制：
 * - 优先使用 provider 显式提供的 freeMechanism
 * - 否则根据 isFree + 名字提示推断 (preview / unknown 默认)
 * - is_free=false 时返回 null
 */
export function inferFreeMechanism(raw: RawModelData): FreeMechanism | null {
  if (!raw.isFree) return null;
  if (raw.freeMechanism) return raw.freeMechanism;
  const id = `${raw.modelId} ${raw.name}`.toLowerCase();
  if (id.includes('preview') || id.includes('beta') || id.includes('experimental')) {
    return 'preview';
  }
  return 'rate-limited';
}

export function inferFreeQuota(raw: RawModelData): FreeQuota | null {
  return raw.freeQuota ?? null;
}

export function inferTrialScope(raw: RawModelData): TrialScope {
  if (raw.trialScope) return raw.trialScope;
  if (raw.isFree === false) return 'none';
  return 'specific';
}

export function getCachedOrInfer(
  vendor: string,
  modelId: string,
  raw: RawModelData,
  _cache: Record<string, CachedCapabilities>
): EnhancedModelData {
  // 注意: 不再用 cache 覆盖能力字段. cache 是 write-once 快照, 旧数据会让模型升级
  // (context 变大、新增 tool-use 等) 永远反映不到输出. 推断是纯函数, 每次重算即可.
  const inferred = inferCapabilities(raw);
  const contextLabel = formatContextLabel(raw.contextSize);
  const freeMechanism = inferFreeMechanism(raw);
  const freeQuota = inferFreeQuota(raw);
  const trialScope = inferTrialScope(raw);
  const familyResult = canonicalizeFamily(raw.modelId, raw.name);

  return {
    ...raw,
    provider: vendor,
    tags: inferred.tags,
    isReasoning: inferred.isReasoning,
    isMultimodal: inferred.isMultimodal,
    hasToolUse: inferred.hasToolUse,
    contextLabel,
    freeMechanism,
    freeQuota,
    trialScope,
    modelFamily: raw.modelFamily ?? familyResult.family,
    modelVariant: raw.modelVariant ?? familyResult.variant,
    quantization: raw.quantization ?? familyResult.quantization,
    aliases: raw.aliases ?? [],
    tier: 'medium',
    speed: 'standard',
    useCase: [],
    performanceLevel: 'mid',
  };
}
