import type { RawModelData, ProviderPlugin } from '../../types.js';

// 讯飞星火 (Spark) HTTP API：https://spark-api-open.xf-yun.com/v1/chat/completions
// 模型版本指向参考：https://www.xfyun.cn/doc/spark/HTTP%E8%B0%83%E7%94%A8%E6%96%87%E6%A1%A3.html
// 这里只覆盖讯飞自研 Spark 系列模型；第三方聚合（GLM/Qwen/...）见 xingchen provider。
// 所有 Spark HTTP 模型并发上限均为 5。
interface SparkHttpModel {
  apiId: string;
  name: string;
  description: string;
  contextSize?: number;
  isFree: boolean;
  capabilities: string[];
}

const SPARK_HTTP_MODELS: SparkHttpModel[] = [
  {
    apiId: '4.0Ultra',
    name: 'Spark 4.0 Ultra',
    description: '讯飞星火 4.0 Ultra 版本，旗舰通用大模型，综合能力最强。',
    contextSize: 8192,
    isFree: false,
    capabilities: ['chat', 'text-generation'],
  },
  {
    apiId: 'generalv3.5',
    name: 'Spark Max',
    description: '讯飞星火 Max 版本（generalv3.5），通用对话能力强。',
    contextSize: 8192,
    isFree: false,
    capabilities: ['chat', 'text-generation'],
  },
  {
    apiId: 'max-32k',
    name: 'Spark Max-32K',
    description: '讯飞星火 Max-32K 版本，32K 长上下文窗口，适合长文档处理。',
    contextSize: 32768,
    isFree: false,
    capabilities: ['chat', 'text-generation', 'long-context'],
  },
  {
    apiId: 'generalv3',
    name: 'Spark Pro',
    description: '讯飞星火 Pro 版本（generalv3），通用场景性价比版本。',
    contextSize: 8192,
    isFree: false,
    capabilities: ['chat', 'text-generation'],
  },
  {
    apiId: 'pro-128k',
    name: 'Spark Pro-128K',
    description: '讯飞星火 Pro-128K 版本，128K 超长上下文窗口。',
    contextSize: 131072,
    isFree: false,
    capabilities: ['chat', 'text-generation', 'long-context'],
  },
  {
    apiId: 'lite',
    name: 'Spark Lite',
    description: '讯飞星火 Lite 版本，轻量免费模型，速率受限。',
    contextSize: 4096,
    isFree: true,
    capabilities: ['chat', 'text-generation'],
  },
];

async function fetchXinghuoModels(): Promise<RawModelData[]> {
  return SPARK_HTTP_MODELS.map((m) => ({
    vendor: 'xinghuo',
    modelId: `xinghuo/${m.apiId}`,
    name: m.name,
    description: m.description,
    contextSize: m.contextSize,
    priceInput: m.isFree ? 0 : undefined,
    priceOutput: m.isFree ? 0 : undefined,
    priceCurrency: 'CNY',
    isFree: m.isFree,
    freeMechanism: m.isFree ? 'rate-limited' : null,
    freeQuota: m.isFree ? { notes: '5 并发上限' } : null,
    trialScope: m.isFree ? 'specific' : 'none',
    capabilities: m.capabilities,
    metadata: {
      provider: 'iFlytek',
      apiId: m.apiId,
      apiEndpoint: 'https://spark-api-open.xf-yun.com/v1/chat/completions',
      concurrency: 5,
      source: 'spark-http',
    },
  }));
}

export const fetchModels: ProviderPlugin = fetchXinghuoModels;
