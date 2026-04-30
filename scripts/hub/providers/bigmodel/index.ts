import type { RawModelData, ProviderPlugin } from '../../types.js';

const PRICING_API = 'https://open.bigmodel.cn/api/biz/operation/query?ids=1137,1122,1123,1124,1132,1125,1126';

interface BigModelPricingResponse {
  code: number;
  msg: string;
  data: Array<{
    id: number;
    operationId: string;
    content: string;
  }>;
}

interface ParsedModel {
  name: string;
  context?: string;
  price?: string;
  description?: string;
  category: string;
}

const MODEL_NAME_PATTERNS = [
  /^GLM-[\w.-]+$/i,
  /^CogView[\w-]*$/i,
  /^CogVideo[\w-]*$/i,
  /^Embedding-[\w]+$/i,
  /^ChatGLM[\w-]*$/i,
  /^CharGLM[\w-]*$/i,
  /^Emohaa$/i,
  /^CodeGeeX[\w-]*$/i,
  /^Rerank$/i,
  /^GLM-TTS$/i,
  /^GLM-ASR$/i,
  /^Search-[\w]+$/i,
];

function isModelName(value: string): boolean {
  const v = value.trim();
  return MODEL_NAME_PATTERNS.some(p => p.test(v)) ||
    /^(glm|cog|embedding|chatglm|charglm|emohaa|codegeex|rerank|search|glm-tts|glm-asr)/i.test(v);
}

function extractModelsFromList(list: any[]): ParsedModel[] {
  const models: ParsedModel[] = [];

  for (const listItem of list) {
    const modelName = listItem.modelName || 'unknown';
    const modelList = listItem.modelList;

    if (!modelList || !Array.isArray(modelList)) continue;

    for (const model of modelList) {
      let name: string | null = null;
      let price: string | undefined;
      let context: string | undefined;
      let description: string | undefined;

      for (const [key, value] of Object.entries(model)) {
        if (typeof value !== 'string') continue;

        const v = value.trim();

        if (!name && isModelName(v)) {
          name = v;
        }
      }

      if (!name) continue;

      for (const [key, value] of Object.entries(model)) {
        if (typeof value !== 'string') continue;
        const v = value.trim();
        const lowerV = v.toLowerCase();

        if (lowerV === '免费' || lowerV === 'free' || lowerV.includes('免费')) {
          if (!price) price = '免费';
        } else if (!price && (lowerV.includes('元') || lowerV.includes('¥') || /^\d+(\.\d+)?\s*$/.test(v))) {
          const cleanV = lowerV.replace(/[^0-9.]/g, '');
          if (cleanV && parseFloat(cleanV) === 0) {
            if (!price) price = '免费';
          }
        }

        if (!context && (/\d+[kKmMgG]/.test(v) || v === '1M' || v.match(/^\d+K$/))) {
          context = v;
        }

        if (!description) {
          if (lowerV === '语言模型' || lowerV === '视觉理解' || lowerV === '图像理解' ||
              lowerV === '视觉推理' || lowerV === '图像生成' || lowerV === '视频生成' ||
              lowerV === '语音生成' || lowerV === '语音识别' || lowerV === '推理模型' ||
              lowerV === '图像/视频理解' || lowerV === '图像理解') {
            description = v;
          }
        }
      }

      if (name) {
        models.push({
          name,
          context,
          price,
          description,
          category: modelName !== 'unknown' ? modelName : description || 'unknown',
        });
      }
    }
  }

  return models;
}

function parsePricingResponse(response: BigModelPricingResponse): ParsedModel[] {
  const models: ParsedModel[] = [];

  for (const item of response.data) {
    try {
      const content = JSON.parse(item.content);

      if (content.list && Array.isArray(content.list)) {
        const extracted = extractModelsFromList(content.list);
        models.push(...extracted);
      }
    } catch (e) {
      console.warn('[bigmodel] Failed to parse content item:', e);
    }
  }

  return models;
}

function inferCapabilities(model: ParsedModel): string[] {
  const caps: string[] = ['chat', 'text-generation'];
  const text = `${model.name} ${model.description || ''} ${model.category}`.toLowerCase();

  if (text.includes('视觉') || text.includes('vision') || text.includes('image') || text.includes('图像') || text.includes('v-')) {
    caps.push('vision');
  }
  if (text.includes('视频') || text.includes('video')) {
    caps.push('video-generation');
  }
  if (text.includes('图像生成') || text.includes('image generation') || text.includes('cogview')) {
    caps.push('image-generation');
  }
  if (text.includes('语音') || text.includes('speech') || text.includes('tts') || text.includes('glm-tts')) {
    caps.push('speech-synthesis');
  }
  if (text.includes('识别') || text.includes('asr') || text.includes('glm-asr')) {
    caps.push('speech-recognition');
  }
  if (text.includes('embedding') || text.includes('向量')) {
    caps.push('embeddings');
  }
  if (text.includes('rerank') || text.includes('重排序')) {
    caps.push('rerank');
  }
  if (text.includes('reasoning') || text.includes('推理') || text.includes('thinking') || text.includes('z1')) {
    caps.push('reasoning');
  }
  if (text.includes('code') || text.includes('代码') || text.includes('codegee')) {
    caps.push('code-generation');
  }
  if (text.includes('search') || text.includes('搜索')) {
    caps.push('web-search');
  }

  return [...new Set(caps)];
}

function parseContextSize(context?: string): number | undefined {
  if (!context) return undefined;

  const match = context.match(/(\d+)([kKmMgG])?/);
  if (match) {
    const num = parseInt(match[1]);
    const unit = (match[2] || '').toLowerCase();
    if (unit === 'k') return num * 1000;
    if (unit === 'm') return num * 1000000;
    if (unit === 'g') return num * 1000000000;
    return num * 1000;
  }

  if (context.includes('1M')) return 1000000;

  return undefined;
}

function isFreeModel(price?: string): boolean {
  if (!price) return false;
  const p = price.toLowerCase();
  return p.includes('免费') || p === 'free';
}

async function fetchBigModelModels(): Promise<RawModelData[]> {
  console.log('[bigmodel] Fetching models from pricing API...');

  const response = await fetch(PRICING_API, {
    headers: {
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    console.error(`[bigmodel] API responded with ${response.status}`);
    return [];
  }

  const data = (await response.json()) as BigModelPricingResponse;

  if (data.code !== 200) {
    console.error(`[bigmodel] API error: ${data.code} - ${data.msg}`);
    return [];
  }

  const parsedModels = parsePricingResponse(data);
  console.log(`[bigmodel] Parsed ${parsedModels.length} entries from pricing API`);

  const models: RawModelData[] = [];
  const seen = new Set<string>();

  for (const pm of parsedModels) {
    const dedupKey = `${pm.name}|${pm.context || ''}|${pm.price || ''}`;
    if (seen.has(dedupKey)) continue;
    seen.add(dedupKey);

    const capabilities = inferCapabilities(pm);
    const isFree = isFreeModel(pm.price);
    const contextSize = parseContextSize(pm.context);

    models.push({
      vendor: 'bigmodel',
      modelId: `bigmodel/${pm.name.toLowerCase().replace(/\s+/g, '-')}`,
      name: pm.name,
      description: pm.description || pm.category,
      contextSize,
      priceInput: isFree ? 0 : undefined,
      priceOutput: isFree ? 0 : undefined,
      priceCurrency: 'CNY',
      isFree,
      freeMechanism: isFree ? 'permanent' : null,
      trialScope: isFree ? 'specific' : 'none',
      capabilities,
      metadata: {
        originalName: pm.name,
        context: pm.context,
        price: pm.price,
        category: pm.category,
        provider: 'bigmodel',
      },
    });
  }

  console.log(`[bigmodel] ${models.filter(m => m.isFree).length} free models, ${models.length} total`);
  return models;
}

export const fetchModels: ProviderPlugin = fetchBigModelModels;
