import type { RawModelData, ProviderPlugin } from '../../types.js';

const DOCS_PAGE = 'https://longcat.chat/platform/docs/zh/';

interface LongCatModel {
  modelId: string;
  name: string;
  contextSize?: number;
  description: string;
  isFree: boolean;
  freeQuota?: string;
  capabilities: string[];
  apiFormats: string[];
  isAgentic?: boolean;
  isMultimodal?: boolean;
}

const MODEL_DATA: LongCatModel[] = [
  {
    modelId: 'LongCat-Flash-Chat',
    name: 'LongCat Flash Chat',
    contextSize: 256000,
    description: '高性能通用对话模型',
    isFree: true,
    freeQuota: '500,000 tokens/天',
    capabilities: ['chat', 'text-generation'],
    apiFormats: ['OpenAI', 'Anthropic'],
  },
  {
    modelId: 'LongCat-Flash-Thinking',
    name: 'LongCat Flash Thinking',
    contextSize: 256000,
    description: '深度思考模型',
    isFree: true,
    freeQuota: '500,000 tokens/天',
    capabilities: ['chat', 'text-generation', 'reasoning'],
    apiFormats: ['OpenAI', 'Anthropic'],
  },
  {
    modelId: 'LongCat-Flash-Thinking-2601',
    name: 'LongCat Flash Thinking 2601',
    contextSize: 256000,
    description: '升级版深度思考模型',
    isFree: true,
    freeQuota: '500,000 tokens/天',
    capabilities: ['chat', 'text-generation', 'reasoning'],
    apiFormats: ['OpenAI', 'Anthropic'],
  },
  {
    modelId: 'LongCat-Flash-Lite',
    name: 'LongCat Flash Lite',
    contextSize: 256000,
    description: '高效轻量化MoE模型',
    isFree: true,
    freeQuota: '50,000,000 tokens/天',
    capabilities: ['chat', 'text-generation'],
    apiFormats: ['OpenAI', 'Anthropic'],
  },
  {
    modelId: 'LongCat-Flash-Omni-2603',
    name: 'LongCat Flash Omni 2603',
    contextSize: 128000,
    description: '多模态模型',
    isFree: true,
    freeQuota: '500,000 tokens/天',
    capabilities: ['chat', 'text-generation', 'vision'],
    apiFormats: ['OpenAI'],
    isMultimodal: true,
  },
  {
    modelId: 'LongCat-Flash-Chat-2602-Exp',
    name: 'LongCat Flash Chat 2602 Exp',
    contextSize: 256000,
    description: '高性能通用对话模型（实验版）',
    isFree: true,
    freeQuota: '500,000 tokens/天',
    capabilities: ['chat', 'text-generation'],
    apiFormats: ['OpenAI'],
  },
  {
    modelId: 'LongCat-2.0-Preview',
    name: 'LongCat 2.0 Preview',
    contextSize: 1024000,
    description: '高性能Agentic模型（内测）',
    isFree: true,
    freeQuota: '10,000,000 tokens/2小时',
    capabilities: ['chat', 'text-generation', 'agentic'],
    apiFormats: ['OpenAI', 'Anthropic'],
    isAgentic: true,
  },
];

async function fetchLongCatModels(): Promise<RawModelData[]> {
  console.log('[longcat] Parsing models from documentation...');

  return MODEL_DATA.map((m) => ({
    vendor: 'longcat',
    modelId: `longcat/${m.modelId}`,
    name: m.name,
    description: `LongCat: ${m.description}`,
    contextSize: m.contextSize,
    priceInput: undefined,
    priceOutput: undefined,
    isFree: m.isFree,
    capabilities: m.capabilities,
    metadata: {
      originalId: m.modelId,
      contextSize: m.contextSize,
      freeQuota: m.freeQuota,
      apiFormats: m.apiFormats,
      isAgentic: m.isAgentic,
      isMultimodal: m.isMultimodal,
      provider: 'longcat',
    },
  }));
}

export const fetchModels: ProviderPlugin = fetchLongCatModels;