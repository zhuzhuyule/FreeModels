const WECHAT_API = 'https://qyapi.weixin.qq.com/cgi-bin/webhook/send';

export interface NotifyPayload {
  totalModels: number;
  totalFamilies: number;
  crossProviderFamilies: number;
  topFamilies: Array<{ family: string; providerCount: number }>;
  byProvider: Record<string, number>;
  failedProviders: string[];
  anomalies: string[];
  llmStats: { hits: number; misses: number; errors: number };
  durationMs: number;
  previousTotal?: number;
}

function pickEmoji(payload: NotifyPayload): string {
  if (payload.failedProviders.length > 0) return '⚠️';
  if (payload.anomalies.length > 0) return '⚠️';
  return '✅';
}

function diffLine(label: string, curr: number, prev?: number): string {
  if (prev === undefined) return `${label}: **${curr}**`;
  const delta = curr - prev;
  const sign = delta > 0 ? `+${delta}` : `${delta}`;
  return `${label}: **${curr}** (${sign})`;
}

function formatMarkdown(payload: NotifyPayload): string {
  const emoji = pickEmoji(payload);
  const lines: string[] = [];
  lines.push(`## ${emoji} Model Hub 同步报告`);
  lines.push('');
  lines.push(`> ${new Date().toISOString().replace('T', ' ').slice(0, 19)} UTC · 用时 ${(payload.durationMs / 1000).toFixed(1)}s`);
  lines.push('');
  lines.push('### 数据概况');
  lines.push(`- ${diffLine('模型总数', payload.totalModels, payload.previousTotal)}`);
  lines.push(`- 家族数：**${payload.totalFamilies}**（跨 provider **${payload.crossProviderFamilies}** 个）`);

  if (payload.topFamilies.length > 0) {
    lines.push('');
    lines.push('### 跨 provider 头部家族');
    for (const f of payload.topFamilies.slice(0, 5)) {
      lines.push(`- \`${f.family}\` × ${f.providerCount} 家`);
    }
  }

  lines.push('');
  lines.push('### Provider 拉取');
  const providers = Object.entries(payload.byProvider).sort((a, b) => b[1] - a[1]);
  for (const [name, count] of providers) {
    lines.push(`- ${name}: ${count}`);
  }

  if (payload.failedProviders.length > 0) {
    lines.push('');
    lines.push(`### ⚠️ 失败 Provider`);
    for (const p of payload.failedProviders) lines.push(`- ${p}`);
  }

  if (payload.anomalies.length > 0) {
    lines.push('');
    lines.push('### ⚠️ 异常');
    for (const a of payload.anomalies) lines.push(`- ${a}`);
  }

  const llm = payload.llmStats;
  if (llm.hits + llm.misses + llm.errors > 0) {
    lines.push('');
    lines.push(`### LLM 调用 (GitHub Models)`);
    lines.push(`- 缓存命中：${llm.hits}，新调用：${llm.misses}，失败：${llm.errors}`);
  }

  return lines.join('\n');
}

export async function notifyWechat(payload: NotifyPayload): Promise<void> {
  const key = process.env.WECHAT_QYAPI_ID;
  if (!key) {
    console.log('[Notify] WECHAT_QYAPI_ID not set, skipping notification.');
    return;
  }

  const url = `${WECHAT_API}?key=${encodeURIComponent(key)}`;
  const body = {
    msgtype: 'markdown',
    markdown: { content: formatMarkdown(payload) },
  };

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const json = (await res.json()) as { errcode?: number; errmsg?: string };
    if (json.errcode === 0) {
      console.log('[Notify] WeChat notification sent.');
    } else {
      console.warn(`[Notify] WeChat returned errcode=${json.errcode} errmsg=${json.errmsg}`);
    }
  } catch (err) {
    console.warn('[Notify] WeChat send failed:', err instanceof Error ? err.message : err);
  }
}
