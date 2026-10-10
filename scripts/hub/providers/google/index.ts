import type { RawModelData, ProviderPlugin } from '../../types.js';

// 官方定价文档的 markdown 源. 线上解析而非硬编码, 避免模型列表/价格过期
// (旧版硬编码表曾把已弃用的 gemini-2.0 系列标成免费).
const PRICING_DOC_URL = 'https://ai.google.dev/gemini-api/docs/pricing.md.txt';

const EMOJI_RE_G = /[\p{Extended_Pictographic}\uFE0F]/gu;

interface PriceRow {
  label: string;
  free: string;
  paid: string;
}

interface DocSection {
  title: string;
  ids: string[];
  description: string;
  rows: PriceRow[];
}

function cleanTitle(raw: string): string {
  return raw
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(EMOJI_RE_G, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// 促销价形如 "$0.75 through December 31, 2026. $1.50 starting January 1, 2027."
// — 取第一个数字, 即当前生效价.
function firstPrice(cell: string | undefined): number | undefined {
  if (!cell) return undefined;
  const m = cell.match(/\$\s*([\d.]+)/);
  return m ? Number.parseFloat(m[1]) : undefined;
}

function isFreeCell(cell: string): boolean {
  return /free of charge/i.test(cell);
}

// 按 ### 小节切表: 有 Standard 时只取 Standard 表 (Batch/Flex/Priority 是折扣变体),
// 无小节的老式章节取第一张表. 剔除分隔行、表头行和 "Used to improve" 行.
function pickRows(sectionLines: string[]): PriceRow[] {
  const hasSubsection = sectionLines.some((l) => /^###\s/.test(l));
  const tables: Array<{ sub: string; rows: PriceRow[] }> = [];
  let sub = '';
  let current: PriceRow[] | null = null;
  for (const line of sectionLines) {
    if (/^###\s/.test(line)) {
      sub = line.replace(/^###\s+/, '').trim().toLowerCase();
      continue;
    }
    if (line.trim().startsWith('|')) {
      if (!current) current = [];
      const cells = line.split('|').slice(1, -1).map((c) => c.trim());
      if (cells.length < 3) continue;
      if (cells.every((c) => c === '' || /^:?-{2,}:?$/.test(c))) continue;
      if (/free tier/i.test(cells[1])) continue;
      const [label, free, paid] = cells;
      if (!label || /used to improve/i.test(label)) continue;
      current.push({ label, free, paid });
    } else if (current) {
      tables.push({ sub, rows: current });
      current = null;
    }
  }
  if (current) tables.push({ sub, rows: current });
  if (tables.length === 0) return [];
  if (!hasSubsection) return tables[0].rows;
  return tables.find((t) => t.sub === 'standard')?.rows ?? [];
}

function extractDescription(lines: string[], startIdx: number): string {
  const out: string[] = [];
  let started = false;
  for (let i = startIdx; i < lines.length; i++) {
    const l = lines[i].trim();
    if (!l) {
      if (started) break;
      continue;
    }
    if (/^\[|^!\[|^>|^\^|^#|^\|/.test(l)) continue;
    started = true;
    out.push(l);
  }
  return out
    .join(' ')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(EMOJI_RE_G, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function capabilitiesFor(title: string): { capabilities: string[]; category: string } {
  const t = title.toLowerCase();
  if (t.includes('embedding')) return { capabilities: ['embeddings'], category: 'Embedding' };
  if (t.includes('image')) return { capabilities: ['image-generation'], category: 'Image' };
  if (/\btts\b/.test(t)) return { capabilities: ['speech-synthesis'], category: 'Audio' };
  if (t.includes('transcribe')) return { capabilities: ['speech-recognition'], category: 'Audio' };
  if (t.includes('translate') || t.includes('live')) {
    return { capabilities: ['chat', 'speech-recognition', 'speech-synthesis'], category: 'Realtime' };
  }
  if (t.includes('veo') || t.includes('omni')) return { capabilities: ['video-generation'], category: 'Video' };
  if (t.includes('robotics')) return { capabilities: ['chat', 'text-generation', 'vision'], category: 'Robotics' };
  return { capabilities: ['chat', 'text-generation'], category: 'LLM' };
}

// 多 id 章节 (如 "Gemini 3.8 Live, ... Extended Thinking, and ... Live Preview")
// 标题按逗号/and 拆开与 id 一一对应; 拆不齐时用模型 id 保证名字唯一.
function namesFor(section: DocSection): string[] {
  if (section.ids.length === 1) return [section.title];
  const parts = section.title
    .split(/,\s*(?:and\s+)?|\s+and\s+/)
    .map((p) => p.trim())
    .filter(Boolean);
  return section.ids.map((id, i) => (parts.length === section.ids.length ? parts[i] : id));
}

function parsePricingDoc(md: string): DocSection[] {
  const sections: DocSection[] = [];
  for (const chunk of md.split(/^## /m).slice(1)) {
    const lines = chunk.split('\n');
    const title = cleanTitle(lines[0]);
    const idLineIdx = lines.findIndex((l) => /^\s*\*\[/.test(l));
    const idLine = idLineIdx >= 0 ? lines[idLineIdx] : '';
    const ids = [...idLine.matchAll(/\[`([^`]+)`\]/g)].map((m) => m[1]);
    if (ids.length === 0) {
      // 无内联 id 的章节 (如 Pricing for tools/agents、Gemma 开放模型) 不入库,
      // 避免编造调用方不存在的 API model id.
      continue;
    }
    const rows = pickRows(lines);
    if (rows.length === 0) continue;
    const description = extractDescription(lines, idLineIdx >= 0 ? idLineIdx + 1 : 1);
    sections.push({ title, ids, description, rows });
  }
  return sections;
}

function buildModel(
  id: string,
  name: string,
  section: DocSection,
  priceInput: number | undefined,
  priceOutput: number | undefined,
  isFree: boolean
): RawModelData {
  const { capabilities, category } = capabilitiesFor(section.title);
  const isFlagship = /pro|ultra/i.test(id);
  // modelId 带 "models/" 前缀对齐 Gemini OpenAI-compat /v1beta/openai/models 端点格式.
  return {
    vendor: 'google',
    modelId: `google/models/${id}`,
    name,
    description: `Google: ${section.description || 'Official model on the Gemini API'}`,
    priceInput,
    priceOutput: priceOutput !== undefined && priceOutput > 0 ? priceOutput : undefined,
    priceCurrency: 'USD',
    isFree,
    freeMechanism: isFree ? 'rate-limited' : null,
    trialScope: isFree ? (isFlagship ? 'flagship' : 'fast') : 'none',
    capabilities,
    metadata: {
      originalId: id,
      category,
      provider: 'google',
    },
  };
}

async function fetchGoogleModels(): Promise<RawModelData[]> {
  console.log('[google] Fetching official pricing documentation...');
  const res = await fetch(PRICING_DOC_URL);
  if (!res.ok) throw new Error(`[google] pricing doc fetch failed: HTTP ${res.status}`);
  const md = await res.text();
  if (!/^## /m.test(md) || !/free tier/i.test(md)) {
    throw new Error('[google] pricing doc format unexpected (missing ## sections / Free Tier tables)');
  }

  const models: RawModelData[] = [];
  for (const section of parsePricingDoc(md)) {
    const names = namesFor(section);
    const inputRow = section.rows.find((r) => /input price/i.test(r.label));
    const outputRow = section.rows.find((r) => /output price/i.test(r.label));
    if (inputRow || outputRow) {
      // token 计费模型: 同节多 id 共用 Standard 价.
      const isFree = isFreeCell((inputRow ?? outputRow)!.free);
      section.ids.forEach((id, i) => {
        models.push(buildModel(id, names[i], section, firstPrice(inputRow?.paid), firstPrice(outputRow?.paid), isFree));
      });
    } else {
      // 媒体模型按秒/按次计费 (Veo/Lyria): 行与 id 按文档顺序一一对应.
      section.ids.forEach((id, i) => {
        const row = section.rows[Math.min(i, section.rows.length - 1)];
        models.push(buildModel(id, names[i], section, firstPrice(row.paid), undefined, isFreeCell(row.free)));
      });
    }
  }

  // 文档改版导致解析塌方时抛错, 交由 strict 门槛转 PR 人工复核, 不静默发布残缺数据.
  if (models.length < 5) {
    throw new Error(`[google] parsed only ${models.length} models — pricing doc likely restructured`);
  }
  console.log(`[google] Parsed ${models.length} models from pricing doc.`);
  return models;
}

export const fetchModels: ProviderPlugin = fetchGoogleModels;
