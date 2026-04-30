const WECHAT_API = 'https://qyapi.weixin.qq.com/cgi-bin/webhook/send';

export interface NotifyPayload {
  totalModels: number;
  freeCount: number;
  totalFamilies: number;
  crossProviderFamilies: number;
  topFamilies: Array<{ family: string; providerCount: number }>;
  byProvider: Record<string, number>;
  failedProviders: string[];
  anomalies: string[];
  addedIds: string[];
  removedIds: string[];
  llmStats: { hits: number; misses: number; errors: number };
  durationMs: number;
  previousTotal?: number;
  previousFreeCount?: number;
  previousByProvider?: Record<string, number>;
}

const SEPARATOR = '─────────────────────────';

function diffNum(curr: number, prev?: number): string {
  if (prev === undefined) return `${curr}`;
  const delta = curr - prev;
  if (delta === 0) return `${curr} (持平)`;
  const sign = delta > 0 ? '+' : '';
  return `${curr} (${sign}${delta})`;
}

function trimList(items: string[], max = 5): string[] {
  if (items.length <= max) return items;
  return [...items.slice(0, max), `…还有 ${items.length - max} 个`];
}

function providerOf(id: string): string {
  const idx = id.indexOf('/');
  return idx > 0 ? id.slice(0, idx) : '(未分类)';
}

function groupByProvider(ids: string[]): Map<string, string[]> {
  const map = new Map<string, string[]>();
  for (const id of ids) {
    const p = providerOf(id);
    const arr = map.get(p) ?? [];
    arr.push(id);
    map.set(p, arr);
  }
  return map;
}

function renderProviderGroup(label: string, ids: string[], emoji: string): string[] {
  if (ids.length === 0) return [];
  const groups = groupByProvider(ids);
  const sorted = Array.from(groups.entries()).sort((a, b) => b[1].length - a[1].length);
  const lines: string[] = [];
  lines.push('');
  lines.push(`${emoji} ${label} ${ids.length} 个`);
  for (const [provider, items] of sorted) {
    lines.push(`  ${provider} (${items.length})`);
    for (const id of trimList(items, 3)) {
      const short = id.startsWith(provider + '/') ? id.slice(provider.length + 1) : id;
      lines.push(`    · ${short}`);
    }
  }
  return lines;
}

function renderProviderDelta(
  curr: Record<string, number>,
  prev: Record<string, number> | undefined
): string[] {
  if (!prev) return [];
  const allNames = new Set([...Object.keys(curr), ...Object.keys(prev)]);
  const deltas: Array<{ name: string; delta: number; curr: number; prev: number }> = [];
  for (const name of allNames) {
    const c = curr[name] ?? 0;
    const p = prev[name] ?? 0;
    if (c !== p) deltas.push({ name, delta: c - p, curr: c, prev: p });
  }
  if (deltas.length === 0) return [];
  deltas.sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta));
  const lines: string[] = [];
  lines.push('');
  lines.push('📈 Provider 变化');
  const maxName = Math.max(...deltas.map(d => d.name.length));
  for (const d of deltas) {
    const sign = d.delta > 0 ? `+${d.delta}` : `${d.delta}`;
    const tag = d.delta > 0 ? '🆕' : '➖';
    lines.push(`  ${tag} ${d.name.padEnd(maxName)}  ${d.prev} → ${d.curr}  (${sign})`);
  }
  return lines;
}

export function formatNotification(p: NotifyPayload): string {
  const hasError = p.failedProviders.length > 0 || p.anomalies.length > 0;
  const hasChange = p.addedIds.length > 0 || p.removedIds.length > 0;
  const headEmoji = hasError ? '⚠️' : (hasChange ? '🔄' : '✅');
  const time = new Date().toISOString().replace('T', ' ').slice(0, 19);
  const dur = (p.durationMs / 1000).toFixed(1);

  const lines: string[] = [];
  lines.push(`${headEmoji}  Model Hub 同步完成`);
  lines.push(`${time} UTC · 用时 ${dur}s`);
  lines.push(SEPARATOR);

  lines.push('📊 数据统计');
  lines.push(`  全量模型：${diffNum(p.totalModels, p.previousTotal)}`);
  lines.push(`  免费模型：${diffNum(p.freeCount, p.previousFreeCount)}`);
  lines.push(`  模型家族：${p.totalFamilies}（跨家 ${p.crossProviderFamilies}）`);

  lines.push(...renderProviderDelta(p.byProvider, p.previousByProvider));
  lines.push(...renderProviderGroup('新增', p.addedIds, '🆕'));
  lines.push(...renderProviderGroup('移除', p.removedIds, '➖'));

  if (p.failedProviders.length > 0) {
    lines.push('');
    lines.push(`❌ Provider 失败：${p.failedProviders.length} 个`);
    for (const name of p.failedProviders) lines.push(`  · ${name}`);
  }

  if (p.anomalies.length > 0) {
    lines.push('');
    lines.push(`⚠️ 异常告警`);
    for (const a of p.anomalies) lines.push(`  · ${a}`);
  }

  lines.push('');
  lines.push('📦 各 Provider 模型数');
  const providers = Object.entries(p.byProvider).sort((a, b) => b[1] - a[1]);
  const maxName = Math.max(...providers.map(([n]) => n.length));
  for (const [name, count] of providers) {
    lines.push(`  ${name.padEnd(maxName)}  ${count}`);
  }

  if (p.topFamilies.length > 0) {
    lines.push('');
    lines.push('🔗 跨 Provider 头部家族');
    for (const f of p.topFamilies.slice(0, 5)) {
      lines.push(`  · ${f.family} × ${f.providerCount} 家`);
    }
  }

  const llm = p.llmStats;
  if (llm.hits + llm.misses + llm.errors > 0) {
    lines.push('');
    lines.push(`🤖 LLM 调用：缓存 ${llm.hits} · 新调 ${llm.misses} · 错误 ${llm.errors}`);
  }

  return lines.join('\n');
}

export async function notifyWechat(payload: NotifyPayload): Promise<void> {
  const rawKey = process.env.WECHAT_QYAPI_ID;
  const key = rawKey?.trim();

  if (!key) {
    console.warn(
      `[Notify] ⚠ WECHAT_QYAPI_ID is ${rawKey === undefined ? 'undefined' : 'empty'} — notification skipped.\n` +
      `        Check: (1) repo secret name spelled exactly 'WECHAT_QYAPI_ID',\n` +
      `        (2) workflow yaml has 'WECHAT_QYAPI_ID: \${{ secrets.WECHAT_QYAPI_ID }}',\n` +
      `        (3) secret value is non-empty (paste only the key= value, not the full URL).`
    );
    return;
  }

  const preview = formatNotification(payload);
  console.log('[Notify] Sending WeChat message:');
  console.log('---8<---');
  console.log(preview);
  console.log('--->8---');

  const url = `${WECHAT_API}?key=${encodeURIComponent(key)}`;
  const body = { msgtype: 'text', text: { content: preview } };

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const text = await res.text();
    let json: { errcode?: number; errmsg?: string } = {};
    try {
      json = JSON.parse(text);
    } catch {
      console.warn(`[Notify] non-JSON response (HTTP ${res.status}): ${text.slice(0, 200)}`);
      return;
    }
    if (json.errcode === 0) {
      console.log('[Notify] ✓ WeChat notification sent.');
    } else {
      console.warn(`[Notify] ⚠ WeChat errcode=${json.errcode} errmsg=${json.errmsg ?? '(none)'}`);
    }
  } catch (err) {
    console.warn('[Notify] ✗ WeChat fetch failed:', err instanceof Error ? err.message : err);
  }
}
