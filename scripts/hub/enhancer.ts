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

// 关键词 → 能力标签. 中文关键词必须写在独立的分支里: JS 的 \w 不含汉字, 中文
// 两侧构不成 \b, 所以旧实现 (…|视觉|多模态)\b 那几个中文分支从来没生效过,
// 中文描述的 provider 因此全部只剩 chat + text-generation 两个默认标签.
const KEYWORD_TAGS: Array<{ tag: CapabilityTag; pattern: RegExp }> = [
  {
    tag: 'reasoning',
    pattern: /(?:\b(?:reasoning|thinking|thoughts?|chain[- ]of[- ]thought|problem[- ]solv\w*|logical[- ]think\w*|tot|qwq|r1)\b|深度思考|思维链|(?<!非)思考模式|推理模型|数学推理|多步推导|长程推理)/i,
  },
  {
    tag: 'vision',
    pattern: /(?:\b(?:vision|visual|multimodal|image|photo|picture|vlm)\b|视觉|多模态|图像|图片|看图|图理解)/i,
  },
  {
    tag: 'text-generation',
    pattern: /(?:\b(?:text|chat|llm|language|model)\b|文本|对话|语言模型|大模型|文本生成|内容生成)/i,
  },
  {
    tag: 'tool-use',
    pattern: /(?:\b(?:tool[- ]?use|tools|function[- ]?call\w*|plugin)\b|工具调用|函数调用|工具使用)/i,
  },
  {
    tag: 'code-generation',
    pattern: /(?:\b(?:code|codes|coding|programming)\b|代码|编程)/i,
  },
  {
    tag: 'embeddings',
    pattern: /(?:\b(?:embed|embeddings?|vector)\b|嵌入|文本向量|向量模型)/i,
  },
  {
    tag: 'rerank',
    pattern: /(?:\b(?:rerank\w*|re[- ]rank)\b|重排序|重排)/i,
  },
  {
    tag: 'speech-recognition',
    pattern: /(?:\b(?:asr|stt|transcription|transcribe)\b|speech[- ]to[- ]text|语音识别|语音转写)/i,
  },
  {
    tag: 'speech-synthesis',
    pattern: /(?:\btts\b|text[-_ ]to[-_ ]speech|语音合成|声音克隆|声音复刻)/i,
  },
  {
    tag: 'image-generation',
    pattern: /(?:\bimage[- ]generation\b|text[- ]to[- ]image|文生图|图像生成|图片生成)/i,
  },
  {
    tag: 'video-generation',
    pattern: /(?:\bvideo[- ]generation\b|text[- ]to[- ]video|image[- ]to[- ]video|文生视频|图生视频|视频生成)/i,
  },
  {
    tag: 'document-processing',
    pattern: /(?:\bocr\b|document[- ](?:parsing|understanding|processing)|光学字符识别|文档理解|文档解析|版面分析)/i,
  },
  {
    tag: 'translation',
    pattern: /(?:\b(?:translation|translate)\b|翻译)/i,
  },
  {
    tag: 'moderation',
    pattern: /(?:\b(?:moderation|guardrails?|safety)\b|内容安全|内容审核)/i,
  },
];

export function inferCapabilities(model: RawModelData): {
  tags: CapabilityTag[];
  isReasoning: boolean;
  isMultimodal: boolean;
  hasToolUse: boolean;
} {
  const fromProvider = normalizeCapabilities(model.capabilities ?? []);

  // provider 给的是官方结构化能力字段时, 再从 description 猜只会带来误报:
  // OVH 的 llama 简介 "aligned ... for helpfulness and safety" 打出 moderation,
  // embedding / TTS 简介里的 "text" 打出 text-generation。官方字段覆盖不到的
  // 模型 (nvidia 未进文档表的那些) 仍然走关键词推断。
  const fromKeyword = new Set<CapabilityTag>();
  if (!(model.capabilitiesAuthoritative && fromProvider.length > 0)) {
    const text = `${model.modelId} ${model.name} ${model.description || ''}`.toLowerCase();
    for (const { tag, pattern } of KEYWORD_TAGS) {
      if (pattern.test(text)) fromKeyword.add(tag);
    }
  }

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
