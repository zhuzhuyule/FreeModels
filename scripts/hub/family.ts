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
  'gitee', 'bigmodel', 'xunfei', 'longcat',
];

const OWNER_PREFIXES = [
  'meta', 'meta-llama', 'openai', 'qwen', 'qwen2', 'qwen3',
  'microsoft', 'mistral-ai', 'mistralai', 'deepseek-ai', 'deepseek',
  'anthropic', 'google', 'nvidia', 'cohere', 'ai21', 'thudm',
  'baichuan', 'internlm', 'xai', 'x-ai', 'z-ai', 'zai',
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

function stripPrefix(id: string, prefixes: string[]): string {
  for (const prefix of prefixes) {
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
    curr = stripPrefix(curr, OWNER_PREFIXES);
  }
  return curr;
}

export function canonicalizeFamily(modelId: string, name?: string): FamilyResult {
  const overrides = loadOverrides();

  if (overrides.exact?.[modelId]) {
    return overrides.exact[modelId];
  }

  const lower = modelId.toLowerCase();
  let id = lower;

  id = stripPrefix(id, PROVIDER_PREFIXES);
  id = stripAllOwnerPrefixes(id);

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

  id = id.replace(/-(\d{4})$/, '');           // -2507 trailing date
  id = id.replace(/-(\d{8})$/, '');           // -20240101 date
  id = id.replace(/-(\d{6})$/, '');
  id = id.replace(/[\/\\]+/g, '-');
  id = id.replace(/--+/g, '-');
  id = id.replace(/^-|-$/g, '');

  return {
    family: id || lower,
    variant,
    quantization,
  };
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
