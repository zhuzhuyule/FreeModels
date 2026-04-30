import * as fs from 'fs';
import * as path from 'path';

const README_PATH = path.resolve('README.md');
const TARGET_HEADING = '## 直接使用预编译 JSON（推荐 API 消费方）';

const SECTIONS = [
  { key: 'PROVIDER_INDEX', heading: '## Provider 支持情况', note: '> 该表由 `npm run generate-docs` 根据 `data/models.json` 自动更新。' },
  { key: 'STATS', heading: '## 数据规模', note: '> 该表由 `npm run generate-docs` 自动更新。' },
  { key: 'FREE_MODELS', heading: '## 免费模型列表', note: '> 该表由 `npm run generate-docs` 自动更新，展示 `is_free=true` 的模型。完整数据请用 `data/views/free/models.json`，或按机制查 `free-permanent` / `free-rate-limited` / `free-quota` / `paid-trial`。' },
] as const;

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function generatedBlockPattern(key: string): RegExp {
  return new RegExp(`<!-- AUTO-GENERATED:${key}_START -->[\\s\\S]*?<!-- AUTO-GENERATED:${key}_END -->`);
}

function extractBlock(content: string, key: string): string | null {
  const match = content.match(generatedBlockPattern(key));
  return match?.[0] ?? null;
}

function removeSectionWithBlock(content: string, key: string, heading: string): string {
  // 匹配 (前置空行)? + heading 行 + (note 行 + 空行)? + 块本身
  const pattern = new RegExp(
    `\\n*${escapeRegex(heading)}\\n+(?:>[^\\n]*\\n+)?<!-- AUTO-GENERATED:${key}_START -->[\\s\\S]*?<!-- AUTO-GENERATED:${key}_END -->\\n*`,
    'g'
  );
  return content.replace(pattern, '\n\n');
}

function main(): void {
  if (!fs.existsSync(README_PATH)) {
    throw new Error('README.md not found');
  }

  let content = fs.readFileSync(README_PATH, 'utf-8');

  const blocks: Record<string, string> = {};
  for (const { key } of SECTIONS) {
    const block = extractBlock(content, key);
    if (!block) {
      throw new Error(`Missing generated block: ${key}. Run npm run generate-docs first.`);
    }
    blocks[key] = block;
  }

  // 移除所有现有的 heading + note + block 三件套（包括残留的空 heading）
  for (const { key, heading } of SECTIONS) {
    content = removeSectionWithBlock(content, key, heading);
  }

  content = content.replace(/\n{3,}/g, '\n\n').trim();

  // 在头部组装新的 sections
  const generatedTop = SECTIONS.map(({ key, heading, note }) =>
    `${heading}\n\n${note}\n\n${blocks[key]}`
  ).join('\n\n');

  if (content.includes(TARGET_HEADING)) {
    content = content.replace(TARGET_HEADING, `${generatedTop}\n\n${TARGET_HEADING}`);
  } else {
    const firstHeading = content.match(/^# .+$/m)?.[0];
    if (!firstHeading) {
      content = `${generatedTop}\n\n${content}`;
    } else {
      const insertAt = content.indexOf('\n\n', content.indexOf(firstHeading));
      if (insertAt >= 0) {
        content = `${content.slice(0, insertAt)}\n\n${generatedTop}${content.slice(insertAt)}`;
      } else {
        content = `${content}\n\n${generatedTop}`;
      }
    }
  }

  fs.writeFileSync(README_PATH, `${content.trim()}\n`);
  console.log('[Docs] Moved generated README sections near the top.');
}

main();
