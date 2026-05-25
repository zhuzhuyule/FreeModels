import * as fs from 'fs';
import * as path from 'path';

const OVERRIDES_PATH = path.resolve('scripts/hub/family-overrides.json');

interface OverridesFile {
  exact?: Record<string, FamilyResult>;
  patterns?: Array<{ match: string; family: string; variant?: string }>;
}

export interface FamilyResult {
  family: string;
  variant?: string;
  quantization?: string;
}

const PROVIDER_PREFIXES = [
  'groq', 'openrouter', 'cerebras', 'nvidia', 'google',
  'gitee', 'bigmodel', 'xinghuo', 'xingchen', 'longcat',
  'cloudflare', 'cohere', 'github', 'sambanova',
];

// 只用 `prefix/` 形式剥离的 owner 前缀。这些字符串本身也常作为模型家族前缀
// （例如 qwen3-32b、deepseek-v3.2、mistral-7b），不能用 hyphen 剥离。
const OWNER_PREFIXES_SLASH_ONLY = [
  'qwen', 'qwen2', 'qwen3',
  'deepseek',
  'mistral',
  'gemma',
  'phi',
  'cohere',
];

// 既能 `prefix/` 也能 `prefix-` 剥离的纯 owner 前缀。这些字符串通常不会
// 作为模型家族名出现，可以放心剥掉。
const OWNER_PREFIXES_BOTH = [
  'meta', 'meta-llama',
  'openai', 'anthropic',
  'microsoft', 'google', 'nvidia',
  'mistral-ai', 'mistralai',
  'deepseek-ai',
  'ai21', 'thudm',
  'baichuan', 'internlm',
  'xai', 'x-ai', 'z-ai', 'zai',
  'canopylabs', 'huggingfaceh4', 'shenzhou-ai',
];

const QUANTIZATION_PATTERN = /-(fp16|fp8|fp4|bf16|int8|int4|q4|q8|q4_k_m|q5_k_m|awq|gptq|gguf)\b/i;

const STRIPPABLE_VARIANTS = [
  'instruct', 'chat', 'versatile', 'turbo', 'it',
];

const KEPT_VARIANTS = [
  'reasoning', 'thinking', 'think', 'r1',
  'code', 'coder', 'codestral',
  'vl', 'vision', 'multimodal', 'mm',
  'embed', 'embedding',
  'rerank', 'reranker',
  'audio', 'tts', 'asr', 'whisper',
  'image', 'video',
  'guard', 'safety', 'moderation',
];

let cachedOverrides: OverridesFile | null = null;

function loadOverrides(): OverridesFile {
  if (cachedOverrides) return cachedOverrides;
  if (!fs.existsSync(OVERRIDES_PATH)) {
    cachedOverrides = { exact: {}, patterns: [] };
    return cachedOverrides;
  }
  try {
    cachedOverrides = JSON.parse(fs.readFileSync(OVERRIDES_PATH, 'utf-8')) as OverridesFile;
  } catch {
    cachedOverrides = { exact: {}, patterns: [] };
  }
  return cachedOverrides;
}

function stripProviderPrefix(id: string): string {
  // 循环剥, 解决多层路径如 "cloudflare/@cf/openai/gpt-oss-120b":
  //   pass 1: 剥 cloudflare/ → "@cf/openai/gpt-oss-120b"
  //   pass 2: 剥 @cf/         → "openai/gpt-oss-120b" (owner 由后续 stripAllOwnerPrefixes 剥)
  let prev = '';
  let curr = id;
  while (prev !== curr) {
    prev = curr;
    // Cloudflare 特殊: @cf/ 是 Workers AI 的 path namespace, 不是 owner
    curr = curr.replace(/^@cf\//i, '');
    // Google Gemini 特殊: models/ 是 Gemini API 的 resource name 前缀, 不是 owner.
    // (modelId 形如 google/models/gemini-2.5-flash → 剥 google 后剥 models)
    curr = curr.replace(/^models\//i, '');
    for (const prefix of PROVIDER_PREFIXES) {
      const re = new RegExp(`^${prefix}/`, 'i');
      if (re.test(curr)) {
        curr = curr.replace(re, '');
        break;
      }
    }
  }
  return curr;
}

// 长度倒序，避免 "meta" 抢先匹配 "meta-llama"
const OWNER_BOTH_SORTED = [...OWNER_PREFIXES_BOTH].sort((a, b) => b.length - a.length);
const OWNER_SLASH_SORTED = [...OWNER_PREFIXES_SLASH_ONLY].sort((a, b) => b.length - a.length);

function stripOwnerPrefix(id: string): string {
  // 先试 owner-with-hyphen-allowed 列表（更激进）
  for (const prefix of OWNER_BOTH_SORTED) {
    const re = new RegExp(`^${prefix}[-/]`, 'i');
    if (re.test(id)) {
      return id.replace(re, '');
    }
  }
  // 再试 slash-only 列表（保守）
  for (const prefix of OWNER_SLASH_SORTED) {
    const re = new RegExp(`^${prefix}/`, 'i');
    if (re.test(id)) {
      return id.replace(re, '');
    }
  }
  return id;
}

function stripAllOwnerPrefixes(id: string): string {
  let prev = '';
  let curr = id;
  while (prev !== curr) {
    prev = curr;
    curr = stripOwnerPrefix(curr);
  }
  return curr;
}

// 评分越高表示 family 越"可读"（有版本号、有分隔符、有 size），越低说明越像不透明 slug.
// hasSize 加 +5 让任何含 size suffix 的 family 永远赢过缺 size 的, 避免
// cerebras name="OpenAI GPT OSS" 跟 id="gpt-oss-120b" 平手时丢掉 120b.
function familyScore(family: string): number {
  let score = 0;
  if (/-\d+b\b/i.test(family)) score += 5;    // size suffix (-120b, -70b, -8b 等), 最重要维度
  if (/\d+\.\d+/.test(family)) score += 3;   // 版本号带点（glm-5.1, llama-3.1）
  if (/-/.test(family)) score += 1;            // 含连字符
  if (/^[a-z0-9]+$/.test(family)) score -= 2; // 纯字母数字无分隔符（opaque slug）
  return score;
}

function deriveFamilyFromSlug(slug: string): FamilyResult {
  let id = slug;
  // 剥 license/channel 标记 -- 这些是计费/分发维度, 不影响"用户互换能力等价".
  //   (free) / (beta) / (preview) / (trial)    -- 括号风格 (OpenRouter name)
  //   :free / :beta / :preview                  -- 冒号风格 (OpenRouter id)
  // 必须在 stripProviderPrefix 之前, 因为 OpenRouter id 是 "openai/gpt-oss-120b:free",
  // 不剥 :free 会让 family 变成 "gpt-oss-120b:free" 跟其他 provider 的 "gpt-oss-120b" 分裂.
  id = id.replace(/[\s\-_]?\((free|beta|preview|trial)\)/gi, '');
  id = id.replace(/:(free|beta|preview)\b/gi, '');
  id = stripProviderPrefix(id);
  id = stripAllOwnerPrefixes(id);

  let quantization: string | undefined;
  const quantMatch = id.match(QUANTIZATION_PATTERN);
  if (quantMatch) {
    quantization = quantMatch[1].toLowerCase();
    id = id.replace(QUANTIZATION_PATTERN, '');
  }

  let variant: string | undefined;
  for (const v of KEPT_VARIANTS) {
    const re = new RegExp(`-(${v})\\b`, 'i');
    const m = id.match(re);
    if (m) {
      variant = m[1].toLowerCase();
      break;
    }
  }
  if (!variant) {
    for (const v of STRIPPABLE_VARIANTS) {
      const re = new RegExp(`-(${v})\\b`, 'i');
      const m = id.match(re);
      if (m) {
        variant = m[1].toLowerCase();
        id = id.replace(re, '');
        break;
      }
    }
  }

  for (const v of STRIPPABLE_VARIANTS) {
    id = id.replace(new RegExp(`-${v}\\b`, 'gi'), '');
  }

  id = id.replace(/-(\d{4})$/, '');
  id = id.replace(/-(\d{8})$/, '');
  id = id.replace(/-(\d{6})$/, '');
  id = id.replace(/[\/\\]+/g, '-');
  id = id.replace(/--+/g, '-');
  id = id.replace(/^-|-$/g, '');

  return { family: id || slug, variant, quantization };
}

export function canonicalizeFamily(modelId: string, name?: string): FamilyResult {
  const overrides = loadOverrides();

  if (overrides.exact?.[modelId]) {
    return overrides.exact[modelId];
  }

  if (overrides.patterns) {
    for (const p of overrides.patterns) {
      try {
        const re = new RegExp(p.match, 'i');
        if (re.test(modelId) || re.test(name ?? '')) {
          return { family: p.family, variant: p.variant };
        }
      } catch {
        // ignore bad regex
      }
    }
  }

  const idSlug = modelId.toLowerCase();
  const idResult = deriveFamilyFromSlug(idSlug);

  // 当 name 存在时，也尝试从 name 派生，选分更高的（解决 xunfei serviceId 不可读问题）
  if (name) {
    const nameSlug = name.toLowerCase().replace(/[\s_]+/g, '-');
    const nameResult = deriveFamilyFromSlug(nameSlug);
    // > 而非 >=: 平手时 idResult 赢. 配合 familyScore 的 size 加分, 让 id
    // 含 size 但 name 不含的 case (cerebras gpt-oss-120b / name "OpenAI GPT OSS")
    // 自动选 id 保留 size.
    if (familyScore(nameResult.family) > familyScore(idResult.family)) {
      return {
        family: nameResult.family,
        variant: idResult.variant ?? nameResult.variant,
        quantization: idResult.quantization ?? nameResult.quantization,
      };
    }
  }

  return idResult;
}

export function groupByFamily<T extends { modelFamily: string }>(
  models: T[]
): Map<string, T[]> {
  const groups = new Map<string, T[]>();
  for (const m of models) {
    const key = m.modelFamily;
    const arr = groups.get(key) ?? [];
    arr.push(m);
    groups.set(key, arr);
  }
  return groups;
}

export function buildAliasIndex<T extends { modelId: string; modelFamily: string }>(
  models: T[]
): Map<string, string[]> {
  const families = groupByFamily(models);
  const index = new Map<string, string[]>();
  for (const [family, group] of families) {
    if (group.length < 2) continue;
    const ids = group.map(m => m.modelId);
    for (const m of group) {
      const others = ids.filter(id => id !== m.modelId);
      index.set(m.modelId, others);
    }
  }
  return index;
}
