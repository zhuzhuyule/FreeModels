import type {
  RawModelData,
  EnhancedModelData,
  CachedCapabilities,
  BillingMode,
  FreeTier,
  FreeKind,
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
  if (!contextSize || contextSize === 0) {
    return 'unknown';
  }
  if (contextSize >= 1_000_000) {
    return `${Math.round(contextSize / 1_000_000)}M`;
  }
  if (contextSize >= 1_000) {
    return `${Math.round(contextSize / 1_000)}K`;
  }
  return `${contextSize}`;
}

export function evaluateBilling(
  priceInput?: number,
  priceOutput?: number,
  isFree?: boolean
): BillingMode {
  if (priceInput === undefined && priceOutput === undefined) {
    return isFree ? 'free' : 'unknown';
  }
  const input = priceInput ?? 0;
  const output = priceOutput ?? 0;
  if (input === 0 && output === 0) return 'free';
  if (input === 0 || output === 0) return 'mixed';
  return 'pay';
}

export function evaluateFreeTier(
  isFreeApi?: boolean,
  isFullyFree?: boolean
): FreeTier {
  if (isFullyFree === true) return 'full';
  if (isFreeApi === true) return 'trial';
  return 'none';
}

export function inferFreeKind(raw: RawModelData, billingMode: BillingMode): FreeKind {
  if (raw.freeKind) return raw.freeKind;
  if (billingMode !== 'free' && !raw.isFree) return 'unknown';
  if (raw.isExperienceable) return 'trial-quota';
  const id = `${raw.modelId} ${raw.name}`.toLowerCase();
  if (id.includes('preview') || id.includes('beta') || id.includes('experimental')) {
    return 'preview';
  }
  return 'rate-limited';
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
  cache: Record<string, CachedCapabilities>
): EnhancedModelData {
  const key = `${vendor}/${modelId}`;
  const cached = cache[key];

  const inferred = inferCapabilities(raw);
  const contextLabel = formatContextLabel(raw.contextSize);
  const billingMode = evaluateBilling(raw.priceInput, raw.priceOutput, raw.isFree);
  const freeTier = evaluateFreeTier(raw.isFree, (raw.metadata as any)?.isFullyFree);
  const freeKind = inferFreeKind(raw, billingMode);
  const trialScope = inferTrialScope(raw);

  const tags = (cached?.tags && cached.tags.length > 0
    ? normalizeCapabilities(cached.tags)
    : inferred.tags);

  const familyResult = canonicalizeFamily(raw.modelId, raw.name);

  return {
    ...raw,
    provider: vendor,
    tags,
    isReasoning: cached?.isReasoning ?? inferred.isReasoning,
    isMultimodal: cached?.isMultimodal ?? inferred.isMultimodal,
    hasToolUse: cached?.hasToolUse ?? inferred.hasToolUse,
    contextLabel: cached?.contextSize ?? contextLabel,
    billingMode,
    freeTier,
    freeKind,
    trialScope,
    modelFamily: raw.modelFamily ?? familyResult.family,
    modelVariant: raw.modelVariant ?? familyResult.variant,
    quantization: raw.quantization ?? familyResult.quantization,
    aliases: raw.aliases ?? [],
    tier: cached?.tier ?? 'medium',
    speed: 'standard',
    useCase: [],
    performanceLevel: cached?.performanceLevel ?? 'mid',
  };
}
