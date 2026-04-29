import type { RawModelData, EnhancedModelData, CachedCapabilities } from './types.js';

const REASONING_KEYWORDS = /\b(reasoning|think|thought|r1|tot|chain.?of.?thought|problem.?solv|logical.?think)\b/i;
const MULTIMODAL_KEYWORDS = /\b(vision|visual|multimodal|image|photo|picture|图生|图理解|视觉|多模态)\b/i;
const TEXT_GEN_KEYWORDS = /\b(text|chat|llm|language|model|对话|文本|生成)\b/i;
const TOOL_USE_KEYWORDS = /\b(tool|function.?call|plugin|tool.?use|actions|function_calling)\b/i;

export function inferCapabilities(model: RawModelData): {
  tags: string[];
  isReasoning: boolean;
  isMultimodal: boolean;
  hasToolUse: boolean;
} {
  const text = `${model.modelId} ${model.name} ${model.description || ''}`.toLowerCase();
  const tags: string[] = [];

  const isReasoning = REASONING_KEYWORDS.test(text);
  const isMultimodal = MULTIMODAL_KEYWORDS.test(text);
  const hasToolUse = TOOL_USE_KEYWORDS.test(text) || (model.capabilities?.some(c =>
    c.toLowerCase().includes('tool') || c.toLowerCase().includes('function')
  ) ?? false);

  if (isReasoning) {
    tags.push('reasoning');
    tags.push('text-generation');
  } else if (TEXT_GEN_KEYWORDS.test(text)) {
    tags.push('text-generation');
  }

  if (isMultimodal) {
    tags.push('vision');
    tags.push('multimodal');
  }

  if (model.capabilities) {
    model.capabilities.forEach(cap => {
      const normalized = cap.toLowerCase().trim();
      if (!tags.includes(normalized)) {
        tags.push(normalized);
      }
    });
  }

  return { tags, isReasoning, isMultimodal, hasToolUse };
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
  priceOutput?: number
): 'free' | 'pay' | 'mixed' {
  const input = priceInput ?? 0;
  const output = priceOutput ?? 0;

  if (input === 0 && output === 0) {
    return 'free';
  }
  if (input === 0 || output === 0) {
    return 'mixed';
  }
  return 'pay';
}

export function evaluateFreeTier(
  isFreeApi?: boolean,
  billingMode?: 'free' | 'pay' | 'mixed'
): 'none' | 'trial' | 'full' {
  if (billingMode === 'free') {
    return 'full';
  }
  if (isFreeApi === true) {
    return 'trial';
  }
  return 'none';
}

export function enhanceModel(raw: RawModelData): EnhancedModelData {
  const { tags, isReasoning, isMultimodal, hasToolUse } = inferCapabilities(raw);
  const contextLabel = formatContextLabel(raw.contextSize);
  const billingMode = evaluateBilling(raw.priceInput, raw.priceOutput);
  const freeTier = evaluateFreeTier(raw.isFree, billingMode);

  return {
    ...raw,
    provider: raw.vendor,
    tags,
    isReasoning,
    isMultimodal,
    hasToolUse,
    contextLabel,
    billingMode,
    freeTier,
    tier: 'medium',
    speed: 'standard',
    useCase: [],
    performanceLevel: 'mid',
  };
}

export function getCachedOrInfer(
  vendor: string,
  modelId: string,
  raw: RawModelData,
  cache: Record<string, CachedCapabilities>
): EnhancedModelData {
  const key = `${vendor}/${modelId}`;
  const cached = cache[key];

  const { tags, isReasoning, isMultimodal, hasToolUse } = inferCapabilities(raw);
  const contextLabel = formatContextLabel(raw.contextSize);
  const billingMode = evaluateBilling(raw.priceInput, raw.priceOutput);
  const freeTier = evaluateFreeTier(raw.isFree, billingMode);

  return {
    ...raw,
    provider: vendor,
    tags: cached?.tags ?? tags,
    isReasoning: cached?.isReasoning ?? isReasoning,
    isMultimodal: cached?.isMultimodal ?? isMultimodal,
    hasToolUse: cached?.hasToolUse ?? hasToolUse,
    contextLabel: cached?.contextSize ?? contextLabel,
    billingMode,
    freeTier,
    tier: cached?.tier ?? 'medium',
    speed: 'standard',
    useCase: [],
    performanceLevel: cached?.performanceLevel ?? 'mid',
  };
}
