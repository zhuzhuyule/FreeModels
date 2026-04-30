import type { RawModelData, ProviderPlugin } from '../../types.js';

interface CerebrasModel {
  modelId: string;
  name: string;
  contextSize?: number;
  parameters?: number;
  speed?: number;
  inputPrice?: number;
  outputPrice?: number;
  isFree: boolean;
  isPreview?: boolean;
  capabilities: string[];
}

const MODEL_DATA: CerebrasModel[] = [
  {
    modelId: 'llama3.1-8b',
    name: 'Llama 3.1 8B',
    contextSize: 8192,
    parameters: 8_000_000_000,
    speed: 2200,
    inputPrice: 0,
    outputPrice: 0,
    isFree: true,
    capabilities: ['chat', 'text-generation'],
  },
  {
    modelId: 'gpt-oss-120b',
    name: 'OpenAI GPT OSS',
    parameters: 120_000_000_000,
    speed: 3000,
    inputPrice: 0,
    outputPrice: 0,
    isFree: true,
    capabilities: ['chat', 'text-generation'],
  },
  {
    modelId: 'qwen-3-235b-a22b-instruct-2507',
    name: 'Qwen 3 235B Instruct',
    contextSize: 65536,
    parameters: 235_000_000_000,
    speed: 1400,
    isFree: false,
    isPreview: true,
    capabilities: ['chat', 'text-generation', 'reasoning'],
  },
  {
    modelId: 'zai-glm-4.7',
    name: 'Z.ai GLM 4.7',
    parameters: 355_000_000_000,
    speed: 1000,
    isFree: false,
    isPreview: true,
    capabilities: ['chat', 'text-generation'],
  },
];

async function fetchCerebrasModels(): Promise<RawModelData[]> {
  console.log('[cerebras] Parsing models from documentation...');

  return MODEL_DATA.map((m) => ({
    vendor: 'cerebras',
    modelId: `cerebras/${m.modelId}`,
    name: m.name,
    description: `Cerebras ${m.isPreview ? 'Preview ' : ''}model: ${m.name}${m.parameters ? ` - ${(m.parameters / 1e9).toFixed(0)}B parameters` : ''}${m.speed ? ` - ${m.speed} tokens/sec` : ''}`,
    contextSize: m.contextSize,
    priceInput: m.inputPrice,
    priceOutput: m.outputPrice,
    priceCurrency: 'USD',
    isFree: m.isFree || !!m.isPreview,
    freeMechanism: m.isFree ? 'rate-limited' : (m.isPreview ? 'preview' : null),
    trialScope: (m.isFree || m.isPreview) ? 'specific' : 'none',
    capabilities: m.capabilities,
    metadata: {
      originalId: m.modelId,
      parameters: m.parameters,
      speed: m.speed,
      isPreview: m.isPreview,
      provider: 'cerebras',
    },
  }));
}

export const fetchModels: ProviderPlugin = fetchCerebrasModels;