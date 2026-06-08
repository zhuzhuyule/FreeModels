import type { RawModelData, ProviderPlugin } from '../../types.js';

// Agnes AI (Sapiens AI 旗下 AI Gateway)
// - 注册即用, 免费档无明确速率/配额公开
// - 数据源: https://agnes-ai.com/doc/quickstart (静态硬编码, 平台无 /v1/models 端点)
// - chat 接口: https://apihub.agnes-ai.com/v1/chat/completions
// - image / video 模型走单独生成接口 (非 chat completions), 此处不收录

interface AgnesModel {
  modelId: string;
  name: string;
  description: string;
  capabilities: string[];
}

const MODEL_DATA: AgnesModel[] = [
  {
    modelId: 'agnes-1.5-flash',
    name: 'Agnes 1.5 Flash',
    description: '默认对话模型',
    capabilities: ['chat', 'text-generation'],
  },
  {
    modelId: 'agnes-2.0-flash',
    name: 'Agnes 2.0 Flash',
    description: '新版对话模型',
    capabilities: ['chat', 'text-generation'],
  },
];

async function fetchAgnesModels(): Promise<RawModelData[]> {
  console.log('[agnes] Parsing models from documentation...');

  return MODEL_DATA.map((m) => ({
    vendor: 'agnes',
    modelId: `agnes/${m.modelId}`,
    name: m.name,
    description: `Agnes AI: ${m.description}`,
    contextSize: undefined,
    priceInput: undefined,
    priceOutput: undefined,
    priceCurrency: 'USD',
    isFree: true,
    freeMechanism: 'rate-limited',
    freeQuota: { notes: '免费 AI Gateway, 注册即用; 具体限速以平台公告为准' },
    trialScope: 'all',
    capabilities: m.capabilities,
    metadata: {
      originalId: m.modelId,
      apiFormats: ['OpenAI'],
      provider: 'agnes',
    },
  }));
}

export const fetchModels: ProviderPlugin = fetchAgnesModels;
