import * as fs from 'fs';
import * as path from 'path';

const README_PATH = path.resolve('README.md');
const TARGET_HEADING = '## 直接使用预编译 JSON（推荐 API 消费方）';
const KEYS = ['PROVIDER_INDEX', 'STATS', 'FREE_MODELS'] as const;

function generatedBlockPattern(key: string): RegExp {
  return new RegExp(`<!-- AUTO-GENERATED:${key}_START -->[\\s\\S]*?<!-- AUTO-GENERATED:${key}_END -->`);
}

function extractBlock(content: string, key: string): string | null {
  const match = content.match(generatedBlockPattern(key));
  return match?.[0] ?? null;
}

function removeBlock(content: string, key: string): string {
  return content.replace(generatedBlockPattern(key), '').replace(/\n{3,}/g, '\n\n');
}

function removeLegacyStats(content: string): string {
  return content.replace(/\n## 数据规模\n\n[\s\S]*?(?=\n## )/, '\n');
}

function main(): void {
  if (!fs.existsSync(README_PATH)) {
    throw new Error('README.md not found');
  }

  let content = fs.readFileSync(README_PATH, 'utf-8');
  const blocks = Object.fromEntries(KEYS.map(key => [key, extractBlock(content, key)])) as Record<typeof KEYS[number], string | null>;

  for (const key of KEYS) {
    if (!blocks[key]) {
      throw new Error(`Missing generated block: ${key}`);
    }
    content = removeBlock(content, key);
  }

  content = removeLegacyStats(content).trim();

  const generatedTop = [
    '## Provider 支持情况',
    '',
    blocks.PROVIDER_INDEX,
    '',
    '## 数据规模',
    '',
    blocks.STATS,
    '',
    '## 免费模型列表',
    '',
    blocks.FREE_MODELS,
  ].join('\n');

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
