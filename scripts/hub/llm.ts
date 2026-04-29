import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

const ENDPOINT = 'https://models.github.ai/inference/chat/completions';
const CACHE_PATH = path.resolve('data/llm-cache.json');
const BUDGET_PATH = path.resolve('data/llm-budget.json');

const DEFAULT_BUDGET = {
  'openai/gpt-4o-mini': 100,
  'meta/llama-3.3-70b-instruct': 100,
  'microsoft/phi-4': 100,
  'openai/gpt-4o': 30,
};

export type LlmModel = keyof typeof DEFAULT_BUDGET;

interface LlmCache {
  [key: string]: {
    output: string;
    model: string;
    cachedAt: string;
  };
}

interface BudgetFile {
  date: string;
  used: Record<string, number>;
}

function hashInput(input: string): string {
  return crypto.createHash('sha256').update(input).digest('hex').slice(0, 16);
}

function loadJsonOr<T>(filePath: string, fallback: T): T {
  if (!fs.existsSync(filePath)) return fallback;
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf-8')) as T;
  } catch {
    return fallback;
  }
}

function saveJson(filePath: string, data: unknown): void {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

function loadBudget(): BudgetFile {
  const today = todayKey();
  const saved = loadJsonOr<BudgetFile>(BUDGET_PATH, { date: today, used: {} });
  if (saved.date !== today) {
    return { date: today, used: {} };
  }
  return saved;
}

function recordUsage(budget: BudgetFile, model: string): void {
  budget.used[model] = (budget.used[model] ?? 0) + 1;
  saveJson(BUDGET_PATH, budget);
}

export function isLlmEnabled(): boolean {
  if (process.env.SKIP_LLM === '1') return false;
  return !!process.env.GITHUB_TOKEN;
}

export interface LlmCallOptions {
  task: string;
  input: string;
  systemPrompt: string;
  model?: LlmModel;
  fallbackModels?: LlmModel[];
  jsonMode?: boolean;
  maxTokens?: number;
}

const stats = {
  hits: 0,
  misses: 0,
  errors: 0,
  skipped: 0,
};

export function getLlmStats(): typeof stats {
  return { ...stats };
}

async function callOnce(
  model: LlmModel,
  systemPrompt: string,
  input: string,
  jsonMode: boolean,
  maxTokens: number
): Promise<string | null> {
  const body = {
    model,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: input },
    ],
    max_tokens: maxTokens,
    ...(jsonMode ? { response_format: { type: 'json_object' } } : {}),
  };

  try {
    const res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (res.status === 429) {
      console.warn(`[llm] ${model} rate-limited`);
      return null;
    }
    if (!res.ok) {
      const text = await res.text();
      console.warn(`[llm] ${model} HTTP ${res.status}: ${text.slice(0, 200)}`);
      return null;
    }

    const json = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    return json.choices?.[0]?.message?.content ?? null;
  } catch (err) {
    console.warn(`[llm] ${model} error:`, err instanceof Error ? err.message : err);
    return null;
  }
}

export async function callLlm(opts: LlmCallOptions): Promise<string | null> {
  if (!isLlmEnabled()) {
    stats.skipped++;
    return null;
  }

  const cache = loadJsonOr<LlmCache>(CACHE_PATH, {});
  const cacheKey = `${opts.task}:${hashInput(opts.systemPrompt + opts.input)}`;

  if (cache[cacheKey]) {
    stats.hits++;
    return cache[cacheKey].output;
  }

  const budget = loadBudget();
  const candidates = [opts.model ?? 'openai/gpt-4o-mini', ...(opts.fallbackModels ?? [])];

  for (const model of candidates) {
    const limit = DEFAULT_BUDGET[model] ?? 50;
    if ((budget.used[model] ?? 0) >= limit) {
      console.warn(`[llm] ${model} budget exhausted (${limit}/day)`);
      continue;
    }

    const output = await callOnce(
      model,
      opts.systemPrompt,
      opts.input,
      opts.jsonMode ?? false,
      opts.maxTokens ?? 1024
    );

    recordUsage(budget, model);

    if (output) {
      stats.misses++;
      cache[cacheKey] = {
        output,
        model,
        cachedAt: new Date().toISOString(),
      };
      saveJson(CACHE_PATH, cache);
      return output;
    }
  }

  stats.errors++;
  return null;
}

export interface FamilyClassification {
  family: string;
  variant?: string;
  quantization?: string;
}

export async function classifyFamilyWithLlm(
  modelId: string,
  name: string
): Promise<FamilyClassification | null> {
  const systemPrompt = `You are a model taxonomy classifier. Given an AI model identifier, output JSON with the canonical family name (lowercase, hyphenated, no provider/owner prefix), variant suffix (instruct/chat/reasoning/vl/code/etc or null), and quantization (fp16/fp8/int4/etc or null).
Rules:
- Family = base model + version + parameter count, e.g. "llama-3.3-70b", "qwen2.5-7b", "gemini-2.5-pro", "glm-4.5"
- Strip provider prefixes (groq/, openrouter/) and owner prefixes (meta/, qwen/, openai/)
- Keep -preview, -beta as part of family (different model)
- Strip dates/build numbers (e.g. -2507, -20240101)
Output only JSON: {"family":"...","variant":"...","quantization":"..."}`;

  const input = `modelId: ${modelId}\nname: ${name}`;
  const result = await callLlm({
    task: 'family-classify',
    input,
    systemPrompt,
    model: 'microsoft/phi-4',
    fallbackModels: ['meta/llama-3.3-70b-instruct', 'openai/gpt-4o-mini'],
    jsonMode: true,
    maxTokens: 200,
  });

  if (!result) return null;
  try {
    const parsed = JSON.parse(result) as FamilyClassification;
    if (parsed.family) {
      return {
        family: parsed.family.toLowerCase(),
        variant: parsed.variant || undefined,
        quantization: parsed.quantization || undefined,
      };
    }
  } catch {
    return null;
  }
  return null;
}
