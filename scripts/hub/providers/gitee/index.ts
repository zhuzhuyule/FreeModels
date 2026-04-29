import type { RawModelData, ProviderPlugin } from '../../types.js';

const TYPE_MAP: Record<string, string> = {
  text2text: 'text-generation',
  text2image: 'image-generation',
  image2image: 'image-to-image',
  image2text: 'vision',
  audio2text: 'speech-recognition',
  text2audio: 'speech-synthesis',
  embedding: 'embeddings',
  embeddings: 'embeddings',
  chat: 'chat',
  'code-generation': 'code-generation',
  'code-edit': 'code-editing',
  completions: 'text-generation',
  moderation: 'moderation',
  rerank: 'rerank',
  rerank_multimodal: 'rerank',
  doc2md: 'document-processing',
  image2video: 'video-generation',
  text2video: 'video-generation',
  image23d: '3d-generation',
  image_matting: 'image-processing',
  text2music: 'music-generation',
  audio_video2video: 'video-processing',
  comfyui_sampler: 'image-generation',
  web_search: 'web-search',
  sentence_similarity: 'embeddings',
  speech2text: 'speech-recognition',
  text2speech: 'speech-synthesis',
};

const CAPABILITY_KEYWORDS: Record<string, RegExp[]> = {
  reasoning: [/\b(reasoning|think|thought|r1|chain.?of.?thought|problem.?solv)\b/i],
  vision: [/\b(vision|visual|image|photo|picture|multimodal|图生|图理解)\b/i],
  tool_use: [/\b(tool|function.?call|plugin|tool.?use|actions)\b/i],
  code: [/\b(code|programming|codegen|script)\b/i],
  function_calling: [/\b(function.?call|tool.?call|tools?)\b/i],
};

const CONTEXT_PATTERNS: RegExp[] = [
  /(\d+(?:\.\d+)?)\s*[kKmMgG]\b/i,
  /context[:\s]*(\d+)/i,
];

function parseContextSize(tags: Array<{ name: string; slug?: string }>): number | undefined {
  for (const tag of tags || []) {
    const name = tag.name || '';
    for (const pattern of CONTEXT_PATTERNS) {
      const match = name.match(pattern);
      if (match && match[1]) {
        const num = parseFloat(match[1]);
        const unit = name.toLowerCase().replace(match[1], '').trim();
        if (unit === 'k' || unit === 'kb') return num * 1000;
        if (unit === 'm' || unit === 'mb') return num * 1000000;
        if (unit === 'g' || unit === 'gb') return num * 1000000000;
        if (num < 1000 && num > 0) return num * 1000;
        return num;
      }
    }
  }
  return undefined;
}

function inferCapabilities(
  name: string,
  description: string,
  type: string,
  modelId: string
): { capabilities: string[]; isReasoning: boolean; isMultimodal: boolean; hasToolUse: boolean } {
  const text = `${name} ${description} ${type} ${modelId}`.toLowerCase();
  const capabilities: string[] = [];

  const mappedType = TYPE_MAP[type] || TYPE_MAP[type.replace(/-/g, '')] || type;
  if (!capabilities.includes(mappedType)) {
    capabilities.push(mappedType);
  }

  let isReasoning = false;
  let isMultimodal = false;
  let hasToolUse = false;

  for (const [cap, patterns] of Object.entries(CAPABILITY_KEYWORDS)) {
    if (patterns.some(p => p.test(text))) {
      if (cap === 'reasoning') isReasoning = true;
      if (cap === 'vision') isMultimodal = true;
      if (cap === 'tool_use' || cap === 'function_calling') hasToolUse = true;
      if (!capabilities.includes(cap)) capabilities.push(cap);
    }
  }

  if (isReasoning && !capabilities.includes('text-generation')) {
    capabilities.push('text-generation');
  }

  return { capabilities, isReasoning, isMultimodal, hasToolUse };
}

async function fetchGiteeModels(): Promise<RawModelData[]> {
  const response = await fetch('https://ai.gitee.com/api/pay/service/operations?vendor=', {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'application/json, text/plain, */*',
      'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
    },
  });

  if (!response.ok) {
    console.warn(`[gitee] API responded with ${response.status}`);
    return [];
  }

  const data = (await response.json()) as Record<string, unknown>;
  const rawList = Array.isArray(data)
    ? data
    : (data as any).data?.list || (data as any).list || (data as any).data || [];

  console.log(`[gitee] Raw items received: ${rawList.length}`);

  const models: RawModelData[] = [];

  for (const item of rawList) {
    const service = (item as any).service || {};
    const operations = (item as any).operations || [];
    const firstOp = operations[0] || {};

    const opPrice = Number(firstOp.price || 0);
    const tPriceInput = Number(firstOp.input_million_tokens_price || 0);
    const tPriceOutput = Number(firstOp.output_million_tokens_price || 0);
    const freeUse = firstOp.free_use === true;
    const hasPrice = opPrice > 0 || tPriceInput > 0 || tPriceOutput > 0;
    const isFullyFree = freeUse && !hasPrice;
    const isExperienceable = freeUse && hasPrice;

    const rawType = String(firstOp.type || service.type || 'unknown').toLowerCase();

    const { capabilities, isReasoning, isMultimodal, hasToolUse } = inferCapabilities(
      service.name || '',
      service.remark || '',
      rawType,
      String(service.ident || service.name || '')
    );

    const description = String(service.remark || '')
      .replace(/<[^>]*>/g, '')
      .substring(0, 500);

    const contextSize = parseContextSize(service.tags || []);

    let modelIdent = service.ident || (service.model_info && (service.model_info as any).id);
    if (!modelIdent || /^\d+$/.test(String(modelIdent))) {
      modelIdent = service.name || 'Unknown';
    }

    const priceInput = tPriceInput > 0 ? tPriceInput : (tPriceInput === 0 ? 0 : undefined);
    const priceOutput = tPriceOutput > 0 ? tPriceOutput : (tPriceOutput === 0 ? 0 : undefined);

    models.push({
      vendor: 'gitee',
      modelId: String(modelIdent),
      name: String(service.name || 'Unknown'),
      description: description || undefined,
      contextSize,
      priceInput,
      priceOutput,
      priceCurrency: 'CNY',
      isFree: isFullyFree,
      isExperienceable,
      freeKind: isFullyFree ? 'permanent' : (isExperienceable ? 'trial-quota' : 'unknown'),
      trialScope: isFullyFree ? 'specific' : (isExperienceable ? 'all' : 'none'),
      capabilities,
      metadata: {
        originalType: rawType,
        isReasoning,
        isMultimodal,
        hasToolUse,
        operationsCount: operations.length,
        serviceIdent: service.ident,
        apiFormat: firstOp.api_format,
        path: firstOp.path,
        tags: service.tags?.map((t: any) => t.name).join(', '),
        freeUse,
        isFullyFree,
      },
    });
  }

  return models;
}

export const fetchModels: ProviderPlugin = fetchGiteeModels;
