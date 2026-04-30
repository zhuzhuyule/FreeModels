import type { RawModelData, ProviderPlugin } from '../../types.js';

const LLMS_TXT_URL = 'https://docs.bigmodel.cn/llms.txt';
const DOC_BASE = 'https://docs.bigmodel.cn';
const PRICING_API = 'https://open.bigmodel.cn/api/biz/operation/query?ids=1137,1122,1123,1124,1132,1125,1126';

interface BigModelDoc {
  url: string;
  modelId: string;        // 文件名截下来即可（与 API modelCode 一致）
  title: string;
  description?: string;
  inputModalities: string[];
  outputModalities: string[];
  contextWindow?: number;
  maxOutputTokens?: number;
  capabilities: {
    thinkingMode: boolean;
    streaming: boolean;
    functionCall: boolean;
    contextCache: boolean;
    structuredOutput: boolean;
    mcp: boolean;
    vision: boolean;
  };
}

const MODALITY_MAP: Record<string, string> = {
  '文本': 'text',
  '图像': 'image',
  '图片': 'image',
  '视频': 'video',
  '音频': 'audio',
  '语音': 'audio',
  '文件': 'file',
  '文档': 'document',
};

async function fetchFreeModelUrls(): Promise<string[]> {
  const response = await fetch(LLMS_TXT_URL);
  if (!response.ok) {
    console.warn(`[bigmodel] llms.txt HTTP ${response.status}`);
    return [];
  }
  const text = await response.text();
  const urls = new Set<string>();
  const regex = /https:\/\/docs\.bigmodel\.cn(\/cn\/guide\/models\/free\/[\w.-]+)\.md/gi;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(text)) !== null) {
    urls.add(`${DOC_BASE}${match[1]}.md`);
  }
  return Array.from(urls);
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * 解析 <Card title="X" icon={...}>...</Card>。
 * 直接 regex 会被 icon JSX 里的 svg `/>` 提前截断，所以扫描时跳过 {} 内的 `>`。
 */
function extractCardValue(md: string, title: string): string | undefined {
  const re = new RegExp(`<Card\\s+title=["']${escapeRegex(title)}["']`, 'i');
  const start = md.search(re);
  if (start < 0) return undefined;

  let i = md.indexOf(title, start) + title.length;
  let braceDepth = 0;
  while (i < md.length) {
    const c = md[i];
    if (c === '{') braceDepth++;
    else if (c === '}') braceDepth--;
    else if (c === '>' && braceDepth === 0) break;
    i++;
  }
  if (i >= md.length) return undefined;

  const contentStart = i + 1;
  const contentEnd = md.indexOf('</Card>', contentStart);
  if (contentEnd < 0) return undefined;

  return md.slice(contentStart, contentEnd)
    .replace(/<[^>]*>/g, '')
    .replace(/\{[^}]*\}/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function hasCard(md: string, title: string): boolean {
  return new RegExp(`<Card\\s+title=["']${title}["']`, 'i').test(md);
}

function hasAnyCard(md: string, titles: string[]): boolean {
  return titles.some(t => hasCard(md, t));
}

function parseModalities(value?: string): string[] {
  if (!value) return [];
  return value
    .split(/[、,，\s/]+/)
    .map(t => MODALITY_MAP[t.trim()] ?? null)
    .filter((x): x is string => Boolean(x));
}

function parseTokenSize(text?: string): number | undefined {
  if (!text) return undefined;
  const match = text.match(/(\d+(?:\.\d+)?)\s*([kKmMgG])/);
  if (!match) {
    const num = parseInt(text.replace(/[^0-9]/g, ''));
    return Number.isFinite(num) && num > 0 ? num : undefined;
  }
  const n = parseFloat(match[1]);
  const unit = match[2].toLowerCase();
  if (unit === 'k') return n * 1000;
  if (unit === 'm') return n * 1_000_000;
  if (unit === 'g') return n * 1_000_000_000;
  return n;
}

function parseContextFromText(md: string): number | undefined {
  // 老格式 doc 把 context 写在 Accordion 内文，如 "模型具备 128K 上下文" 或 "支持 1M 上下文"
  const patterns = [
    /(\d+(?:\.\d+)?\s*[KMG])\s*(?:tokens?\s*)?(?:的)?(?:上下文|context)/i,
    /(?:上下文|context)[^<>\n]{0,30}(\d+(?:\.\d+)?\s*[KMG])/i,
  ];
  for (const re of patterns) {
    const m = md.match(re);
    if (m) {
      const size = parseTokenSize(m[1]);
      if (size) return size;
    }
  }
  return undefined;
}

function parseMaxOutputFromText(md: string): number | undefined {
  const patterns = [
    /(?:最大输出|max\s*output)[^<>\n]{0,20}(\d+(?:\.\d+)?\s*[KMG])/i,
    /(\d+(?:\.\d+)?\s*[KMG])\s*(?:tokens?\s*)?(?:最大输出|max\s*output)/i,
  ];
  for (const re of patterns) {
    const m = md.match(re);
    if (m) {
      const size = parseTokenSize(m[1]);
      if (size) return size;
    }
  }
  return undefined;
}

function parseDescription(md: string): string | undefined {
  // 第一段非 JSX 的中文段落（在 # 标题之后）
  const lines = md.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    if (line.startsWith('#') || line.startsWith('<') || line.startsWith('>')) continue;
    if (line.length < 20) continue;
    return line.replace(/\*\*([^*]+)\*\*/g, '$1').slice(0, 500);
  }
  return undefined;
}

function modelIdFromUrl(url: string): string {
  const match = url.match(/\/free\/([\w.-]+)\.md$/);
  return match?.[1] ?? '';
}

async function fetchAndParseDoc(url: string): Promise<BigModelDoc | null> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.warn(`[bigmodel] doc ${url} HTTP ${response.status}`);
      return null;
    }
    const md = await response.text();

    const titleMatch = md.match(/^#\s+(.+)$/m);
    const title = titleMatch?.[1].trim() ?? modelIdFromUrl(url);
    const modelId = modelIdFromUrl(url);
    if (!modelId) return null;

    const contextFromCard = parseTokenSize(extractCardValue(md, '上下文窗口'));
    const contextFromText = parseContextFromText(md);
    const maxOutFromCard = parseTokenSize(extractCardValue(md, '最大输出 Tokens'));
    const maxOutFromText = parseMaxOutputFromText(md);

    return {
      url,
      modelId,
      title,
      description: parseDescription(md),
      inputModalities: parseModalities(extractCardValue(md, '输入模态')),
      outputModalities: parseModalities(extractCardValue(md, '输出模态')),
      contextWindow: contextFromCard ?? contextFromText,
      maxOutputTokens: maxOutFromCard ?? maxOutFromText,
      capabilities: {
        thinkingMode: hasAnyCard(md, ['思考模式', '内置深度思考', '深度思考', '推理']),
        streaming: hasCard(md, '流式输出'),
        functionCall: hasAnyCard(md, ['Function Call', '工具调用', 'function-calling']),
        contextCache: hasCard(md, '上下文缓存'),
        structuredOutput: hasCard(md, '结构化输出'),
        mcp: hasCard(md, 'MCP'),
        vision: hasAnyCard(md, ['视觉理解', '图像理解', '视觉']),
      },
    };
  } catch (err) {
    console.warn(`[bigmodel] failed to parse ${url}:`, err instanceof Error ? err.message : err);
    return null;
  }
}

function deriveCapabilities(doc: BigModelDoc): string[] {
  const caps = new Set<string>(['chat', 'text-generation']);
  if (doc.inputModalities.includes('image') || doc.capabilities.vision) caps.add('vision');
  if (doc.inputModalities.includes('video') || doc.capabilities.vision) caps.add('vision');
  if (doc.inputModalities.includes('audio')) caps.add('speech-recognition');
  if (doc.outputModalities.includes('image')) caps.add('image-generation');
  if (doc.outputModalities.includes('video')) caps.add('video-generation');
  if (doc.outputModalities.includes('audio')) caps.add('speech-synthesis');
  if (doc.capabilities.thinkingMode) caps.add('reasoning');
  if (doc.capabilities.functionCall) {
    caps.add('tool-use');
    caps.add('function-calling');
  }
  // 从 modelId 名字补充（用于纯 image/video 生成模型）
  const id = doc.modelId.toLowerCase();
  if (id.includes('cogvideo')) {
    caps.delete('chat');
    caps.delete('text-generation');
    caps.add('video-generation');
  }
  if (id.includes('cogview')) {
    caps.delete('chat');
    caps.delete('text-generation');
    caps.add('image-generation');
  }
  // 名字含 v 但能力卡没显式声明视觉时（如 GLM-4.1V-Thinking-Flash）
  if (/\b\d+(?:\.\d+)?v\b/i.test(id) || id.includes('vision')) {
    caps.add('vision');
  }
  return Array.from(caps);
}

function docToRaw(doc: BigModelDoc): RawModelData {
  return {
    vendor: 'bigmodel',
    modelId: `bigmodel/${doc.modelId}`,
    name: doc.title,
    description: doc.description,
    contextSize: doc.contextWindow,
    priceInput: 0,
    priceOutput: 0,
    priceCurrency: 'CNY',
    isFree: true,
    freeMechanism: 'permanent',
    trialScope: 'specific',
    capabilities: deriveCapabilities(doc),
    metadata: {
      docUrl: doc.url,
      originalId: doc.modelId,
      inputModalities: doc.inputModalities,
      outputModalities: doc.outputModalities,
      maxOutputTokens: doc.maxOutputTokens,
      supportsThinking: doc.capabilities.thinkingMode,
      supportsFunctionCall: doc.capabilities.functionCall,
      supportsStructuredOutput: doc.capabilities.structuredOutput,
      supportsMCP: doc.capabilities.mcp,
      supportsContextCache: doc.capabilities.contextCache,
      supportsStreaming: doc.capabilities.streaming,
      provider: 'bigmodel',
      source: 'docs',
    },
  };
}

// ============= 从 pricing API 抓全量模型（含付费） =============

interface PricingResponse {
  code: number;
  msg: string;
  data: Array<{ id: number; operationId: string; content: string }>;
}

interface PricingParsedModel {
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

function isFreeFromPrice(price?: string): boolean {
  if (!price) return false;
  const p = price.toLowerCase();
  return p.includes('免费') || p === 'free';
}

function parseContextSize(context?: string): number | undefined {
  if (!context) return undefined;
  const match = context.match(/(\d+)([kKmMgG])?/);
  if (!match) return undefined;
  const num = parseInt(match[1]);
  const unit = (match[2] || '').toLowerCase();
  if (unit === 'k') return num * 1000;
  if (unit === 'm') return num * 1_000_000;
  if (unit === 'g') return num * 1_000_000_000;
  if (context.includes('1M')) return 1_000_000;
  return num < 1000 ? num * 1000 : num;
}

function inferCapabilitiesFromPricing(model: PricingParsedModel): string[] {
  const caps: string[] = ['chat', 'text-generation'];
  const text = `${model.name} ${model.description || ''} ${model.category}`.toLowerCase();
  if (/(视觉|vision|image|图像|v-)/.test(text)) caps.push('vision');
  if (/(视频|video|cogvideo)/.test(text)) caps.push('video-generation');
  if (/(图像生成|image generation|cogview)/.test(text)) caps.push('image-generation');
  if (/(语音|speech|tts|glm-tts)/.test(text)) caps.push('speech-synthesis');
  if (/(识别|asr|glm-asr)/.test(text)) caps.push('speech-recognition');
  if (/(embedding|向量)/.test(text)) caps.push('embeddings');
  if (/(rerank|重排序)/.test(text)) caps.push('rerank');
  if (/(reasoning|推理|thinking|z1)/.test(text)) caps.push('reasoning');
  if (/(code|代码|codegee)/.test(text)) caps.push('code-generation');
  if (/(search|搜索)/.test(text)) caps.push('web-search');
  return Array.from(new Set(caps));
}

function extractFromPricingList(list: any[]): PricingParsedModel[] {
  const out: PricingParsedModel[] = [];
  for (const listItem of list) {
    const groupName = listItem.modelName || 'unknown';
    if (!Array.isArray(listItem.modelList)) continue;
    for (const model of listItem.modelList) {
      let name: string | null = null;
      let price: string | undefined;
      let context: string | undefined;
      let description: string | undefined;
      for (const v of Object.values(model)) {
        if (typeof v !== 'string') continue;
        const text = v.trim();
        if (!name && isModelName(text)) name = text;
      }
      if (!name) continue;
      for (const v of Object.values(model)) {
        if (typeof v !== 'string') continue;
        const text = v.trim();
        const lower = text.toLowerCase();
        if (!price && (lower === '免费' || lower === 'free' || lower.includes('免费'))) price = '免费';
        else if (!price && (lower.includes('元') || lower.includes('¥') || /^\d+(\.\d+)?\s*$/.test(text))) {
          const clean = lower.replace(/[^0-9.]/g, '');
          if (clean && parseFloat(clean) === 0) price = '免费';
        }
        if (!context && (/\d+[kKmMgG]/.test(text) || text === '1M' || text.match(/^\d+K$/i))) context = text;
        if (!description && /^(语言模型|视觉理解|图像理解|视觉推理|图像生成|视频生成|语音生成|语音识别|推理模型|图像\/视频理解)$/.test(lower)) description = text;
      }
      out.push({ name, context, price, description, category: groupName });
    }
  }
  return out;
}

async function fetchFromPricingApi(): Promise<RawModelData[]> {
  try {
    const response = await fetch(PRICING_API, { headers: { Accept: 'application/json' } });
    if (!response.ok) {
      console.warn(`[bigmodel] Pricing API HTTP ${response.status}`);
      return [];
    }
    const data = (await response.json()) as PricingResponse;
    if (data.code !== 200) {
      console.warn(`[bigmodel] Pricing API code=${data.code} msg=${data.msg}`);
      return [];
    }

    const parsed: PricingParsedModel[] = [];
    for (const item of data.data) {
      try {
        const content = JSON.parse(item.content);
        if (Array.isArray(content.list)) parsed.push(...extractFromPricingList(content.list));
      } catch {
        // ignore
      }
    }

    const seen = new Set<string>();
    const result: RawModelData[] = [];
    for (const pm of parsed) {
      const dedupKey = `${pm.name}|${pm.context || ''}|${pm.price || ''}`;
      if (seen.has(dedupKey)) continue;
      seen.add(dedupKey);
      const isFree = isFreeFromPrice(pm.price);
      const slug = pm.name.toLowerCase().replace(/\s+/g, '-');
      result.push({
        vendor: 'bigmodel',
        modelId: `bigmodel/${slug}`,
        name: pm.name,
        description: pm.description || pm.category,
        contextSize: parseContextSize(pm.context),
        priceInput: isFree ? 0 : undefined,
        priceOutput: isFree ? 0 : undefined,
        priceCurrency: 'CNY',
        isFree,
        freeMechanism: isFree ? 'permanent' : null,
        trialScope: isFree ? 'specific' : 'none',
        capabilities: inferCapabilitiesFromPricing(pm),
        metadata: {
          originalName: pm.name,
          context: pm.context,
          price: pm.price,
          category: pm.category,
          provider: 'bigmodel',
          source: 'pricing-api',
        },
      });
    }
    console.log(`[bigmodel] Pricing API: ${result.length} models (${result.filter(m => m.isFree).length} free)`);
    return result;
  } catch (err) {
    console.warn('[bigmodel] Pricing API failed:', err instanceof Error ? err.message : err);
    return [];
  }
}

async function fetchFromDocs(): Promise<RawModelData[]> {
  const urls = await fetchFreeModelUrls();
  if (urls.length === 0) return [];
  const docs = (await Promise.all(urls.map(fetchAndParseDoc))).filter(
    (d): d is BigModelDoc => d !== null
  );
  console.log(`[bigmodel] Docs: ${docs.length}/${urls.length} free model(s) parsed`);
  return docs.map(docToRaw);
}

function mergeModels(fromList: RawModelData[], fromDocs: RawModelData[]): RawModelData[] {
  const byId = new Map<string, RawModelData>();
  // 1. 先放 list 数据（全量、含付费）
  for (const m of fromList) byId.set(m.modelId, m);
  // 2. docs 数据覆盖（重名时以 docs 为准，因为它来自官方专门的免费模型文档）
  let overlap = 0;
  for (const m of fromDocs) {
    if (byId.has(m.modelId)) {
      overlap++;
      const existing = byId.get(m.modelId)!;
      // docs 字段优先；缺失字段从 list 兜底
      byId.set(m.modelId, {
        ...existing,
        ...m,
        contextSize: m.contextSize ?? existing.contextSize,
        description: m.description ?? existing.description,
        metadata: { ...existing.metadata, ...m.metadata, source: 'docs+pricing-api' },
      });
    } else {
      byId.set(m.modelId, m);
    }
  }
  console.log(`[bigmodel] Merged: ${fromList.length} list + ${fromDocs.length} docs = ${byId.size} unique (${overlap} overlap, docs-priority)`);
  return Array.from(byId.values());
}

async function fetchBigModelModels(): Promise<RawModelData[]> {
  console.log('[bigmodel] Fetching from pricing API + docs...');
  const [fromList, fromDocs] = await Promise.all([
    fetchFromPricingApi(),
    fetchFromDocs(),
  ]);
  return mergeModels(fromList, fromDocs);
}

export const fetchModels: ProviderPlugin = fetchBigModelModels;
