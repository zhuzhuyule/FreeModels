import type { RawModelData, ProviderPlugin } from '../../types.js';

// Agnes AI (Sapiens AI 旗下 AI Gateway)
// - 目录: https://agnes-ai.com/doc/models (Mintlify 页, SSR 内嵌 title/description/href JSON)
// - 单模型页 SSR 渲染了价格表 (List/Standard Price + Current Price) 与 Context window
// - /v1/models 端点存在但需 API key (401), CI 无 key, 故走文档解析
// - image / video 模型走单独生成接口 (非 chat completions), 与旧版口径一致不收录

const CATALOG_URL = 'https://agnes-ai.com/doc/models';

interface CatalogEntry {
  title: string;
  description: string;
  href: string;
}

function decodeEntities(s: string): string {
  return s
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
}

function stripTags(s: string): string {
  return decodeEntities(s.replace(/<[^>]*>/g, ' ')).replace(/\s+/g, ' ').trim();
}

function cellText(cellHtml: string): string {
  return stripTags(cellHtml);
}

// "List price" / "Standard Price" / "Current price" 三种表头文案都出现过, 按行标签识别更稳.
interface PriceColumns {
  list?: number;
  current?: number;
}

function parsePriceCells(cells: string[]): PriceColumns {
  const prices: number[] = [];
  for (const c of cells) {
    const m = c.match(/\$\s*([\d.]+)\s*\/\s*(?:1M|M)\s*tokens/i) ?? c.match(/\$\s*([\d.]+)/);
    if (m) prices.push(Number.parseFloat(m[1]));
  }
  if (prices.length === 0) return {};
  return { list: prices[0], current: prices[prices.length - 1] };
}

function extractAllTables(html: string): string[][][] {
  const tables: string[][][] = [];
  for (const tb of html.match(/<table[\s\S]*?<\/table>/g) ?? []) {
    const rows: string[][] = [];
    for (const tr of tb.match(/<tr>[\s\S]*?<\/tr>/g) ?? []) {
      const cells = (tr.match(/<t[dh][^>]*>[\s\S]*?<\/t[dh]>/g) ?? []).map(cellText);
      if (cells.length) rows.push(cells);
    }
    if (rows.length) tables.push(rows);
  }
  return tables;
}

interface ParsedAgnesModel {
  modelId?: string;
  contextSize?: number;
  vision: boolean;
  toolCalling: boolean;
  input?: PriceColumns;
  output?: PriceColumns;
  cachedInput?: number;
}

function parseSize(text: string): number | undefined {
  const m = text.match(/([\d.]+)\s*([KMkm])/);
  if (!m) return undefined;
  const n = Number.parseFloat(m[1]);
  const u = m[2].toLowerCase();
  if (u === 'k') return Math.round(n * 1000);
  if (u === 'm') return Math.round(n * 1_000_000);
  return n;
}

function parseModelPage(html: string): ParsedAgnesModel {
  const text = stripTags(html);
  const out: ParsedAgnesModel = { vision: false, toolCalling: false };

  // 比对表 "Model name | agnes-2.0-flash | agnes-2.5-flash" — 当前模型在最右列
  const modelRow = text.match(/Model name\s+((?:agnes-[\w.-]+[\s|]*)+)/i);
  if (modelRow) {
    const ids = modelRow[1].match(/agnes-[\w.-]+/g);
    if (ids?.length) out.modelId = ids[ids.length - 1];
  }
  if (!out.modelId) {
    const alt = text.match(/\bModel\s+(agnes-[0-9][\w.-]+)/i);
    out.modelId = alt?.[1];
  }

  const ctx = text.match(/Context window\s+([\d.]+\s*[KM])/i);
  if (ctx) out.contextSize = parseSize(ctx[1]);

  if (/Input modalities[^.]{0,40}image/i.test(text)) out.vision = true;
  if (/tool calling/i.test(text)) out.toolCalling = true;

  for (const rows of extractAllTables(html)) {
    for (const cells of rows) {
      const label = cells[0].toLowerCase();
      const price = parsePriceCells(cells.slice(1));
      if (!price.list && price.list !== 0) continue;
      if (/^(input tokens|input$|input cache miss)/.test(label)) out.input = price;
      else if (/^(output tokens|output$)/.test(label)) out.output = price;
      else if (/(cached input|cache hit)/.test(label)) out.cachedInput = price.list;
    }
  }
  return out;
}

async function fetchCatalog(): Promise<CatalogEntry[]> {
  const res = await fetch(CATALOG_URL);
  if (!res.ok) throw new Error(`[agnes] catalog page HTTP ${res.status}`);
  const html = await res.text();
  // RSC payload 里的转义 JSON: \"title\":\"...\",\"description\":\"...\",\"href\":\"/en/docs/agnes-...\"
  const unescaped = html.replace(/\\"/g, '"').replace(/\\'/g, "'").replace(/\\\//g, '/');
  const seen = new Set<string>();
  const entries: CatalogEntry[] = [];
  const re = /"title":"(Agnes [^"]+)","description":"([^"]*)","href":"(\/en\/docs\/agnes-[^"]+)"/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(unescaped)) !== null) {
    if (seen.has(m[3])) continue;
    seen.add(m[3]);
    if (/agnes-image|agnes-video/.test(m[3])) continue; // 非 chat 接口, 不收录
    entries.push({ title: m[1], description: m[2], href: m[3] });
  }
  return entries;
}

async function fetchAgnesModels(): Promise<RawModelData[]> {
  console.log('[agnes] Fetching model catalog from official docs...');
  const catalog = await fetchCatalog();
  if (catalog.length === 0) throw new Error('[agnes] catalog parse produced 0 text models');

  const pages = await Promise.all(catalog.map(async (entry) => {
    const url = `https://agnes-ai.com${entry.href}`;
    const res = await fetch(url);
    if (!res.ok) {
      console.warn(`[agnes] ${url} HTTP ${res.status}`);
      return null;
    }
    return { entry, parsed: parseModelPage(await res.text()) };
  }));

  const models: RawModelData[] = [];
  for (const p of pages) {
    if (!p) continue;
    const { entry, parsed } = p;
    if (!parsed.modelId) {
      console.warn(`[agnes] ${entry.href}: modelId not found, skipping`);
      continue;
    }
    // 有效价 = Current Price 列 (促销期可能为 $0); 单价字段存 List/Standard 价, 供算费用.
    const inEff = parsed.input?.current;
    const outEff = parsed.output?.current;
    const promoFree = inEff === 0 && outEff === 0;
    const capabilities = ['chat', 'text-generation'];
    if (parsed.vision) capabilities.push('vision');
    if (parsed.toolCalling) capabilities.push('function-calling', 'tool-use');

    models.push({
      vendor: 'agnes',
      modelId: `agnes/${parsed.modelId}`,
      name: entry.title,
      description: `Agnes AI: ${entry.description}`,
      contextSize: parsed.contextSize,
      priceInput: parsed.input?.list,
      priceOutput: parsed.output?.list,
      priceCurrency: 'USD',
      isFree: promoFree,
      freeMechanism: promoFree ? 'rate-limited' : null,
      freeQuota: promoFree
        ? { notes: '限时 $0 Current Price (List price 为正常单价); 免费档 RPM 限制见 docs/tokenplan' }
        : null,
      trialScope: promoFree ? 'all' : 'none',
      capabilities,
      metadata: {
        originalId: parsed.modelId,
        provider: 'agnes',
        docUrl: `https://agnes-ai.com${entry.href}`,
        current_price_input: inEff,
        current_price_output: outEff,
        cached_input_price: parsed.cachedInput,
        source: 'docs',
      },
    });
  }

  if (models.length === 0) throw new Error('[agnes] parsed 0 models — docs format may have changed');
  console.log(`[agnes] Parsed ${models.length} text models from docs.`);
  return models;
}

export const fetchModels: ProviderPlugin = fetchAgnesModels;
