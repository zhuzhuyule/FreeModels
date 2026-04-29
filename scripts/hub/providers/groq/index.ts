import type { RawModelData, ProviderPlugin } from '../../types.js';

const PRICING_PAGE = 'https://groq.com/pricing';

interface GroqModel {
  modelId: string;
  name: string;
  contextSize?: number;
  inputPrice?: number;
  outputPrice?: number;
  speed?: number;
  capabilities: string[];
  isFree?: boolean;
}

const MODEL_DATA: Record<string, Omit<GroqModel, 'modelId' | 'name' | 'capabilities'>> = {
  'llama-3.1-8b-instant': {
    contextSize: 128000,
    inputPrice: 0.05,
    outputPrice: 0.08,
    speed: 840,
  },
  'llama-3.3-70b-versatile': {
    contextSize: 128000,
    inputPrice: 0.59,
    outputPrice: 0.79,
    speed: 394,
  },
  'meta-llama/llama-4-scout-17b-16e-instruct': {
    contextSize: 128000,
    inputPrice: 0.11,
    outputPrice: 0.34,
    speed: 594,
  },
  'qwen/qwen3-32b': {
    contextSize: 131000,
    inputPrice: 0.29,
    outputPrice: 0.59,
    speed: 662,
  },
  'openai/gpt-oss-20b': {
    contextSize: 128000,
    inputPrice: 0.075,
    outputPrice: 0.30,
    speed: 1000,
  },
  'openai/gpt-oss-120b': {
    contextSize: 128000,
    inputPrice: 0.15,
    outputPrice: 0.60,
    speed: 500,
  },
  'canopylabs/orpheus-v1-english': {
    inputPrice: 22,
    speed: 100,
  },
  'canopylabs/orpheus-arabic-saudi': {
    inputPrice: 40,
    speed: 100,
  },
  'whisper-large-v3': {
    inputPrice: 0.111,
    speed: 217,
  },
  'whisper-large-v3-turbo': {
    inputPrice: 0.04,
    speed: 228,
  },
  'minimax-m2.5': {
    inputPrice: 0,
    outputPrice: 0,
    isFree: false,
  },
  'qwen/qwen3-vl-32b': {
    inputPrice: 0,
    outputPrice: 0,
    isFree: false,
  },
};

const CAPABILITY_MAP: Record<string, string[]> = {
  'llama-3.1-8b-instant': ['chat', 'text-generation'],
  'llama-3.3-70b-versatile': ['chat', 'text-generation'],
  'meta-llama/llama-4-scout-17b-16e-instruct': ['chat', 'text-generation'],
  'qwen/qwen3-32b': ['chat', 'text-generation', 'reasoning'],
  'openai/gpt-oss-20b': ['chat', 'text-generation'],
  'openai/gpt-oss-120b': ['chat', 'text-generation'],
  'canopylabs/orpheus-v1-english': ['speech-synthesis'],
  'canopylabs/orpheus-arabic-saudi': ['speech-synthesis', 'translation'],
  'whisper-large-v3': ['speech-recognition'],
  'whisper-large-v3-turbo': ['speech-recognition'],
  'minimax-m2.5': ['chat', 'text-generation'],
  'qwen/qwen3-vl-32b': ['chat', 'text-generation', 'vision'],
};

function getDisplayName(modelId: string): string {
  const names: Record<string, string> = {
    'llama-3.1-8b-instant': 'Llama 3.1 8B Instant',
    'llama-3.3-70b-versatile': 'Llama 3.3 70B Versatile',
    'meta-llama/llama-4-scout-17b-16e-instruct': 'Llama 4 Scout (17Bx16E)',
    'qwen/qwen3-32b': 'Qwen3 32B',
    'openai/gpt-oss-20b': 'GPT OSS 20B',
    'openai/gpt-oss-120b': 'GPT OSS 120B',
    'canopylabs/orpheus-v1-english': 'Orpheus English TTS',
    'canopylabs/orpheus-arabic-saudi': 'Orpheus Arabic Saudi TTS',
    'whisper-large-v3': 'Whisper V3 Large',
    'whisper-large-v3-turbo': 'Whisper Large v3 Turbo',
    'minimax-m2.5': 'Minimax M2.5',
    'qwen/qwen3-vl-32b': 'Qwen3-VL 32B',
  };
  return names[modelId] || modelId;
}

async function fetchGroqModels(): Promise<RawModelData[]> {
  console.log('[groq] Parsing models from pricing page...');

  const models: RawModelData[] = [];

  for (const [modelId, baseData] of Object.entries(MODEL_DATA)) {
    const displayName = getDisplayName(modelId);
    const capabilities = CAPABILITY_MAP[modelId] || ['chat', 'text-generation'];
    const isEnterprise = modelId === 'minimax-m2.5' || modelId === 'qwen/qwen3-vl-32b';

    models.push({
      vendor: 'groq',
      modelId: `groq/${modelId}`,
      name: displayName,
      description: `Groq ${isEnterprise ? 'Enterprise ' : ''}model: ${displayName}${baseData.speed ? ` - ${baseData.speed} tokens/sec` : ''}`,
      contextSize: baseData.contextSize,
      priceInput: baseData.inputPrice,
      priceOutput: baseData.outputPrice,
      isFree: baseData.isFree ?? false,
      capabilities,
      metadata: {
        originalId: modelId,
        speed: baseData.speed,
        isEnterprise,
        provider: 'groq',
      },
    });
  }

  console.log(`[groq] Parsed ${models.length} models from pricing page`);
  return models;
}

export const fetchModels: ProviderPlugin = fetchGroqModels;