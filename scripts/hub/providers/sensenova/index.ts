import type { RawModelData, ProviderPlugin } from '../../types.js';

// 商汤 SenseNova Token Plan (公测期免费档)
// - 数据源: https://www.sensenova.cn/token-plan + https://platform.sensenova.cn/docs
// - 免费档独立 host: https://token.sensenova.cn/v1 (跟付费 api.sensenova.cn 区分)
// - 通用配额: 每模型 5 小时 / 1500 次调用; 最多 20 API Key
// - 公测期完全免费, 付费档位即将上线

interface SenseNovaModel {
  modelId: string;
  name: string;
  contextSize?: number;
  description: string;
  freeQuota: string;
  capabilities: string[];
  isMultimodal?: boolean;
  isReasoning?: boolean;
}

const MODEL_DATA: SenseNovaModel[] = [
  {
    modelId: 'sensenova-6.7-flash-lite',
    name: 'SenseNova 6.7 Flash-Lite',
    description: '轻量多模态智能体模型, Cowork-Skills 办公场景特化',
    freeQuota: '1500 次 / 5 小时',
    capabilities: ['chat', 'text-generation', 'tool-use'],
  },
  {
    modelId: 'sensenova-u1-fast',
    name: 'SenseNova U1 Fast',
    description: '原生多模态, 理解生成一体 (NEO-Unify 架构)',
    freeQuota: '1500 次 / 5 小时',
    capabilities: ['chat', 'text-generation', 'vision'],
    isMultimodal: true,
  },
  {
    modelId: 'deepseek-v4-flash',
    name: 'DeepSeek V4 Flash',
    contextSize: 262144,
    description: 'DeepSeek V4 Flash (商汤代理), 256K 长上下文',
    freeQuota: '特殊配额, 见官方文档',
    capabilities: ['chat', 'text-generation'],
  },
];

async function fetchSenseNovaModels(): Promise<RawModelData[]> {
  console.log('[sensenova] Parsing models from documentation...');

  return MODEL_DATA.map((m) => ({
    vendor: 'sensenova',
    modelId: `sensenova/${m.modelId}`,
    name: m.name,
    description: `SenseNova: ${m.description}`,
    contextSize: m.contextSize,
    priceInput: undefined,
    priceOutput: undefined,
    priceCurrency: 'CNY',
    isFree: true,
    freeMechanism: 'rate-limited',
    freeQuota: { notes: m.freeQuota },
    trialScope: 'all',
    capabilities: m.capabilities,
    metadata: {
      originalId: m.modelId,
      contextSize: m.contextSize,
      freeQuota: m.freeQuota,
      apiFormats: ['OpenAI'],
      isMultimodal: m.isMultimodal,
      isReasoning: m.isReasoning,
      provider: 'sensenova',
    },
  }));
}

export const fetchModels: ProviderPlugin = fetchSenseNovaModels;
