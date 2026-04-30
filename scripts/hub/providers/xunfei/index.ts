import type { RawModelData, ProviderPlugin } from '../../types.js';

const MAAS_API = 'https://maas.xfyun.cn/api/v1/gpt-finetune/model/base/list-v2?page=1&size=9999';

// Spark HTTP API（与 MaaS 不同入口）：https://spark-api-open.xf-yun.com/v1/chat/completions
// 模型版本指向参考：https://www.xfyun.cn/doc/spark/HTTP%E8%B0%83%E7%94%A8%E6%96%87%E6%A1%A3.html
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

function buildSparkHttpModels(): RawModelData[] {
  return SPARK_HTTP_MODELS.map((m) => ({
    vendor: 'xunfei',
    modelId: `xunfei/${m.apiId}`,
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

// 基于 categoryTree.modelCategory 的实测映射（比 function 字段更准确）
const CATEGORY_CAPABILITIES: Record<string, string[]> = {
  '文本生成': ['chat', 'text-generation'],
  '多模态':   ['chat', 'text-generation', 'vision'],
  '图像理解': ['chat', 'text-generation', 'vision'],
  '文生图':   ['image-generation'],
  '重排序':   ['rerank'],
  '向量表示': ['embeddings'],
  '文本分类': ['chat', 'text-generation'],
};

async function fetchXunfeiModels(): Promise<RawModelData[]> {
  const sparkHttp = buildSparkHttpModels();

  try {
    const response = await fetch(MAAS_API, {
      headers: {
        Accept: 'application/json',
        'User-Agent': 'Mozilla/5.0 (compatible; ModelHubBot/1.0)',
      },
    });

    if (!response.ok) {
      console.warn(`[xunfei] API responded with ${response.status}`);
      return sparkHttp;
    }

    const json = (await response.json()) as { data?: { rows?: XunfeiModel[] }; succeed?: boolean };

    if (!json.succeed || !Array.isArray(json.data?.rows)) {
      console.warn('[xunfei] Invalid API response structure');
      return sparkHttp;
    }

    const out: RawModelData[] = [];
    for (const m of json.data.rows) {
      const serviceId = (m.serviceId ?? '').trim();
      // 跳过空 serviceId（未上线）和测试条目
      if (!serviceId || /^test[_-]/i.test(serviceId)) continue;

      const inferPrice = m.price?.inferencePrice ?? {};
      const inPrice = Number(inferPrice.inTokensPrice ?? 0);
      const outPrice = Number(inferPrice.outTokensPrice ?? 0);

      const contextNode = m.categoryTree?.find((c) => c.key === 'contextLengthTag')?.children?.[0];
      const contextSize = parseContextLabel(contextNode?.name);

      const categoryNode = m.categoryTree?.find((c) => c.key === 'modelCategory')?.children?.[0];
      const category = categoryNode?.name ?? '文本生成';

      // 从 categoryTree 推断能力，再用名称补充
      const caps = new Set<string>(CATEGORY_CAPABILITIES[category] ?? ['chat', 'text-generation']);
      if (/\bR1\b|Reasoner|\bthink(ing)?\b|QwQ/i.test(m.name)) caps.add('reasoning');
      if (/Coder|Code\b/i.test(m.name)) caps.add('code-generation');
      if (/OCR/i.test(m.name)) { caps.add('vision'); caps.add('ocr'); }
      if (/Reranker|重排/i.test(m.name)) caps.add('rerank');
      if (/Embed|向量/i.test(m.name)) caps.add('embeddings');

      const isFree = inPrice === 0 && outPrice === 0;

      out.push({
        vendor: 'xunfei',
        modelId: `xunfei/${serviceId}`,
        name: m.name,
        description: m.desc?.replace(/<[^>]*>/g, '')?.substring(0, 200) || `Xunfei model: ${m.name}`,
        contextSize,
        priceInput: inPrice,
        priceOutput: outPrice,
        priceCurrency: 'CNY',
        isFree,
        freeMechanism: isFree ? 'rate-limited' : null,
        trialScope: isFree ? 'specific' : 'none',
        capabilities: [...caps],
        metadata: {
          provider: m.userName,
          category,
          contextLabel: contextNode?.name,
          serviceId,
        },
      });
    }
    return [...out, ...sparkHttp];
  } catch (err) {
    console.error('[xunfei] Fetch error:', err instanceof Error ? err.message : err);
    return sparkHttp;
  }
}

function parseContextLabel(label?: string): number | undefined {
  if (!label) return undefined;
  const match = label.match(/(\d+)[kK]/);
  if (match) return parseInt(match[1]) * 1024;
  const num = parseInt(label);
  return isNaN(num) ? undefined : num;
}

interface XunfeiModel {
  name: string;
  userName: string;
  desc?: string;
  serviceId?: string;
  price?: {
    inferencePrice?: {
      inTokensPrice?: number;
      outTokensPrice?: number;
    };
  };
  categoryTree?: Array<{
    key: string;
    children?: Array<{ name: string }>;
  }>;
}

export const fetchModels: ProviderPlugin = fetchXunfeiModels;
