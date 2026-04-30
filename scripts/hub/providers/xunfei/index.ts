import type { RawModelData, ProviderPlugin } from '../../types.js';

const MAAS_API = 'https://maas.xfyun.cn/api/v1/gpt-finetune/model/base/list-v2?page=1&size=9999';

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
  try {
    const response = await fetch(MAAS_API, {
      headers: {
        Accept: 'application/json',
        'User-Agent': 'Mozilla/5.0 (compatible; ModelHubBot/1.0)',
      },
    });

    if (!response.ok) {
      console.warn(`[xunfei] API responded with ${response.status}`);
      return [];
    }

    const json = (await response.json()) as { data?: { rows?: XunfeiModel[] }; succeed?: boolean };

    if (!json.succeed || !Array.isArray(json.data?.rows)) {
      console.warn('[xunfei] Invalid API response structure');
      return [];
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
    return out;
  } catch (err) {
    console.error('[xunfei] Fetch error:', err instanceof Error ? err.message : err);
    return [];
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
