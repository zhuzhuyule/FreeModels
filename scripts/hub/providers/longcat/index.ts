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

// 2026-06 复核: 平台下架 Flash 全系列 (Chat / Thinking / Thinking-2601 /
// Lite / Omni-2603 / Chat-2602-Exp), 仅保留 LongCat-2.0-Preview.
// 数据源: https://longcat.chat/platform/docs/zh/
const MODEL_DATA: LongCatModel[] = [
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
    priceCurrency: 'CNY',
    isFree: m.isFree,
    freeMechanism: m.isFree ? 'daily-tokens' : null,
    freeQuota: m.isFree ? { notes: m.freeQuota } : null,
    trialScope: m.isFree ? 'specific' : 'none',
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
