import type { RawModelData, ProviderPlugin } from '../../types.js';

const MAAS_API = 'https://maas.xfyun.cn/api/v1/gpt-finetune/model/base/list-v2?page=1&size=9999';

const CAPABILITY_MAP: Record<number, string[]> = {
  4: ['ocr', 'vision'],
  8: ['embeddings'],
  12: ['chat', 'text-generation', 'vision'],
  15: ['reasoning'],
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

    return json.data.rows.map((m) => {
      const price = m.price?.inferencePrice || {};
      const inPrice = Number(price.inTokensPrice ?? price.inTokensOrigPrice ?? 0);
      const outPrice = Number(price.outTokensPrice ?? price.outTokensOrigPrice ?? 0);

      const contextNode = m.categoryTree?.find((c) => c.key === 'contextLengthTag')?.children?.[0];
      const contextSize = parseContextLabel(contextNode?.name);

      const categoryNode = m.categoryTree?.find((c) => c.key === 'modelCategory')?.children?.[0];
      const category = categoryNode?.name || '文本生成';

      const capabilities: string[] = [];
      if (m.function) {
        const mapped = CAPABILITY_MAP[m.function];
        if (mapped) capabilities.push(...mapped);
      }
      if (m.name.includes('Reranker') || m.name.includes('重排序')) capabilities.push('rerank');
      if (m.name.includes('Embedding') || m.name.includes('向量')) capabilities.push('embeddings');
      if (m.name.includes('VL') || m.name.includes('OCR')) capabilities.push('vision');
      if (m.name.includes('Code') || m.name.includes('coder')) capabilities.push('code-generation');
      if (!capabilities.length) capabilities.push('chat', 'text-generation');

      const isFree = inPrice === 0 && outPrice === 0;

      return {
        vendor: 'xunfei',
        modelId: `xunfei/${m.name}`,
        name: m.name,
        description: m.desc?.replace(/<[^>]*>/g, '')?.substring(0, 200) || `Xunfei model: ${m.name}`,
        contextSize,
        priceInput: inPrice,
        priceOutput: outPrice,
        priceCurrency: 'CNY',
        isFree,
        freeKind: isFree ? 'rate-limited' : 'unknown',
        trialScope: isFree ? 'specific' : 'none',
        capabilities,
        metadata: {
          provider: m.userName,
          category,
          function: m.function,
          contextLabel: contextNode?.name,
        },
      };
    });
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
  function?: number;
  price?: {
    inferencePrice?: {
      inTokensPrice?: number;
      outTokensPrice?: number;
      inTokensOrigPrice?: number;
      outTokensOrigPrice?: number;
    };
  };
  categoryTree?: Array<{
    key: string;
    children?: Array<{ name: string }>;
  }>;
}

export const fetchModels: ProviderPlugin = fetchXunfeiModels;
