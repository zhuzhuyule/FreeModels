import type { RawModelData, EnhancedModelData, CachedCapabilities } from './types.js';

const REASONING_KEYWORDS = /\b(reasoning|think|thought|r1|tot|chain.?of.?thought|problem.?solv|logical.?think)\b/i;
const MULTIMODAL_KEYWORDS = /\b(vision|visual|multimodal|image|photo|picture|图生|图理解|视觉|多模态)\b/i;
const TEXT_GEN_KEYWORDS = /\b(text|chat|llm|language|model|对话|文本|生成)\b/i;

export function inferCapabilities(model: RawModelData): {
  tags: string[];
  isReasoning: boolean;
  isMultimodal: boolean;
} {
  const text = `${model.modelId} ${model.name} ${model.description || ''}`.toLowerCase();
  const tags: string[] = [];

  const isReasoning = REASONING_KEYWORDS.test(text);
  const isMultimodal = MULTIMODAL_KEYWORDS.test(text);

  if (isReasoning) {
    tags.push('reasoning');
    tags.push('text-generation');
  } else if (TEXT_GEN_KEYWORDS.test(text)) {
    tags.push('text-generation');
  }

  if (isMultimodal) {
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

  return { tags, isReasoning, isMultimodal };
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

export function enhanceModel(raw: RawModelData): EnhancedModelData {
  const { tags, isReasoning, isMultimodal } = inferCapabilities(raw);
  const contextLabel = formatContextLabel(raw.contextSize);
  const billingMode = evaluateBilling(raw.priceInput, raw.priceOutput);

  return {
    ...raw,
    tags,
    isReasoning,
    isMultimodal,
    contextLabel,
    billingMode,
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

  const { tags, isReasoning, isMultimodal } = inferCapabilities(raw);
  const contextLabel = formatContextLabel(raw.contextSize);
  const billingMode = evaluateBilling(raw.priceInput, raw.priceOutput);

  return {
    ...raw,
    tags: cached?.tags ?? tags,
    isReasoning: cached?.isReasoning ?? isReasoning,
    isMultimodal: cached?.isMultimodal ?? isMultimodal,
    contextLabel: cached?.contextSize ?? contextLabel,
    billingMode,
  };
}
