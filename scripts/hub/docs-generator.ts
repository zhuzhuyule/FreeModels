import * as fs from 'fs';
import * as path from 'path';

interface FreeQuota {
  rpm?: number;
  rpd?: number;
  tpm?: number;
  tokens_per_day?: number;
  tokens_per_month?: number;
  total_credits?: number;
  notes?: string;
}

type FreeMechanism = 'permanent' | 'rate-limited' | 'daily-tokens' | 'monthly-tokens' | 'trial-credits' | 'preview' | null;

interface ModelRecord {
  id?: string;
  model_id?: string;
  provider: string;
  name: string;
  context_label?: string;
  is_free?: boolean;
  free_mechanism?: FreeMechanism;
  free_quota?: FreeQuota | null;
  trial_scope?: string;
  model_family?: string;
}

const MECHANISM_LABEL: Record<string, string> = {
  permanent: '永久免费',
  'rate-limited': '限速免费',
  'daily-tokens': '日 token 配额',
  'monthly-tokens': '月 token 配额',
  'trial-credits': '试用 credits',
  preview: '预览版',
};

interface ModelsJson {
  updated_at?: string;
  data: ModelRecord[];
}

interface ProviderLinks {
  name: string;
  displayName: string;
  website: string;
  signupUrl?: string;
  consoleUrl?: string;
  apiKeyUrl?: string;
  docsUrl?: string;
  pricingUrl?: string;
  modelsUrl?: string;
  apiBaseUrl?: string;
  authType?: string;
  envKey?: string;
  freePolicy?: string;
}

const ROOT = path.resolve('.');
const MODELS_PATH = path.join(ROOT, 'data/models.json');
const README_PATH = path.join(ROOT, 'README.md');
const PROVIDERS_README_PATH = path.join(ROOT, 'docs/providers/README.md');
const PROVIDER_DOCS_DIR = path.join(ROOT, 'docs/providers');

const PROVIDER_LINKS: Record<string, ProviderLinks> = {
  gitee: {
    name: 'gitee',
    displayName: 'Gitee AI',
    website: 'https://ai.gitee.com',
    signupUrl: 'https://ai.gitee.com',
    docsUrl: 'https://ai.gitee.com/docs',
    modelsUrl: 'https://ai.gitee.com/serverless-api',
    freePolicy: '部分模型完全免费，另有一批模型允许体验。',
  },
  bigmodel: {
    name: 'bigmodel',
    displayName: 'BigModel / 智谱 AI',
    website: 'https://open.bigmodel.cn',
    signupUrl: 'https://open.bigmodel.cn',
    consoleUrl: 'https://open.bigmodel.cn/usercenter/proj-mgmt/apikeys',
    apiKeyUrl: 'https://open.bigmodel.cn/usercenter/proj-mgmt/apikeys',
    docsUrl: 'https://docs.bigmodel.cn',
    pricingUrl: 'https://open.bigmodel.cn/pricing',
    apiBaseUrl: 'https://open.bigmodel.cn/api/paas/v4',
    authType: 'bearer',
    envKey: 'BIGMODEL_API_KEY',
    freePolicy: 'GLM Flash 等部分模型可免费使用，具体以官方价格页和控制台为准。',
  },
  cerebras: {
    name: 'cerebras',
    displayName: 'Cerebras',
    website: 'https://www.cerebras.ai',
    signupUrl: 'https://cloud.cerebras.ai',
    consoleUrl: 'https://cloud.cerebras.ai',
    apiKeyUrl: 'https://cloud.cerebras.ai/platform/api-keys',
    docsUrl: 'https://inference-docs.cerebras.ai',
    modelsUrl: 'https://inference-docs.cerebras.ai/models/overview',
    apiBaseUrl: 'https://api.cerebras.ai/v1',
    authType: 'bearer',
    envKey: 'CEREBRAS_API_KEY',
    freePolicy: '部分模型提供免费或限速使用，额度以官方控制台为准。',
  },
  google: {
    name: 'google',
    displayName: 'Google AI',
    website: 'https://ai.google.dev',
    signupUrl: 'https://aistudio.google.com',
    consoleUrl: 'https://aistudio.google.com',
    apiKeyUrl: 'https://aistudio.google.com/app/apikey',
    docsUrl: 'https://ai.google.dev/gemini-api/docs',
    pricingUrl: 'https://ai.google.dev/gemini-api/docs/pricing',
    modelsUrl: 'https://ai.google.dev/gemini-api/docs/models',
    apiBaseUrl: 'https://generativelanguage.googleapis.com',
    authType: 'api-key',
    envKey: 'GEMINI_API_KEY',
    freePolicy: 'Gemini API 部分模型提供免费层，通常带有 RPM / RPD / TPM 限制。',
  },
  groq: {
    name: 'groq',
    displayName: 'Groq',
    website: 'https://groq.com',
    signupUrl: 'https://console.groq.com',
    consoleUrl: 'https://console.groq.com',
    apiKeyUrl: 'https://console.groq.com/keys',
    docsUrl: 'https://console.groq.com/docs',
    pricingUrl: 'https://groq.com/pricing',
    modelsUrl: 'https://console.groq.com/docs/models',
    apiBaseUrl: 'https://api.groq.com/openai/v1',
    authType: 'bearer',
    envKey: 'GROQ_API_KEY',
    freePolicy: '常见为开发者免费额度或限速体验，具体以官方控制台和价格页为准。',
  },
  longcat: {
    name: 'longcat',
    displayName: 'LongCat',
    website: 'https://longcat.chat',
    signupUrl: 'https://longcat.chat',
    consoleUrl: 'https://longcat.chat/platform',
    apiKeyUrl: 'https://longcat.chat/platform/api-keys',
    docsUrl: 'https://longcat.chat/platform/docs',
    modelsUrl: 'https://longcat.chat/platform/docs',
    authType: 'bearer',
    envKey: 'LONGCAT_API_KEY',
    freePolicy: '提供每日 token 免费额度，额度和模型范围以官方文档为准。',
  },
  nvidia: {
    name: 'nvidia',
    displayName: 'NVIDIA AI',
    website: 'https://developer.nvidia.com/ai',
    signupUrl: 'https://build.nvidia.com',
    consoleUrl: 'https://build.nvidia.com',
    apiKeyUrl: 'https://build.nvidia.com/explore/discover',
    docsUrl: 'https://docs.api.nvidia.com/nim',
    modelsUrl: 'https://build.nvidia.com/models',
    apiBaseUrl: 'https://integrate.api.nvidia.com/v1',
    authType: 'bearer',
    envKey: 'NVIDIA_API_KEY',
    freePolicy: 'NIM / build.nvidia.com 通常提供开发体验 credits 或试用额度。',
  },
  openrouter: {
    name: 'openrouter',
    displayName: 'OpenRouter',
    website: 'https://openrouter.ai',
    signupUrl: 'https://openrouter.ai',
    consoleUrl: 'https://openrouter.ai/settings',
    apiKeyUrl: 'https://openrouter.ai/settings/keys',
    docsUrl: 'https://openrouter.ai/docs',
    pricingUrl: 'https://openrouter.ai/models',
    modelsUrl: 'https://openrouter.ai/models?max_price=0',
    apiBaseUrl: 'https://openrouter.ai/api/v1',
    authType: 'bearer',
    envKey: 'OPENROUTER_API_KEY',
    freePolicy: '免费模型通常带有请求频率或每日请求限制。',
  },
  xinghuo: {
    name: 'xinghuo',
    displayName: 'iFlytek Spark / 讯飞星火',
    website: 'https://xinghuo.xfyun.cn',
    signupUrl: 'https://xinghuo.xfyun.cn',
    consoleUrl: 'https://console.xfyun.cn/services/cbm',
    apiKeyUrl: 'https://console.xfyun.cn/services/cbm',
    docsUrl: 'https://www.xfyun.cn/doc/spark',
    modelsUrl: 'https://www.xfyun.cn/doc/spark/HTTP%E8%B0%83%E7%94%A8%E6%96%87%E6%A1%A3.html',
    apiBaseUrl: 'https://spark-api-open.xf-yun.com/v1',
    authType: 'bearer',
    envKey: 'XFYUN_API_KEY',
    freePolicy: 'Spark Lite 永久免费但限速（5 并发）；其他 Spark 系列按 token 计费。',
  },
  xingchen: {
    name: 'xingchen',
    displayName: 'iFlytek MaaS / 讯飞星辰',
    website: 'https://maas.xfyun.cn',
    signupUrl: 'https://maas.xfyun.cn',
    consoleUrl: 'https://maas.xfyun.cn',
    apiKeyUrl: 'https://maas.xfyun.cn',
    docsUrl: 'https://maas.xfyun.cn/docs',
    modelsUrl: 'https://maas.xfyun.cn',
    apiBaseUrl: 'https://maas-api.cn-huabei-1.xf-yun.com/v1',
    authType: 'bearer',
    envKey: 'XFYUN_MAAS_API_KEY',
    freePolicy: '第三方模型聚合（GLM/Qwen/DeepSeek 等）；部分模型 0 元开放，具体以控制台为准。',
  },
};

function loadModels(): ModelsJson {
  if (!fs.existsSync(MODELS_PATH)) {
    throw new Error(`Missing ${MODELS_PATH}. Run npm run sync-models first.`);
  }
  return JSON.parse(fs.readFileSync(MODELS_PATH, 'utf-8')) as ModelsJson;
}

function mdLink(label: string, url?: string): string {
  return url ? `[${label}](${url})` : '—';
}

function quotaText(quota?: FreeQuota | null): string {
  if (!quota) return '—';
  const parts = [
    quota.rpm ? `${quota.rpm} RPM` : undefined,
    quota.rpd ? `${quota.rpd} RPD` : undefined,
    quota.tpm ? `${quota.tpm} TPM` : undefined,
    quota.tokens_per_day ? `${quota.tokens_per_day.toLocaleString()} tokens/天` : undefined,
    quota.tokens_per_month ? `${quota.tokens_per_month.toLocaleString()} tokens/月` : undefined,
    quota.total_credits ? `${quota.total_credits} credits` : undefined,
    quota.notes,
  ].filter(Boolean);
  return parts.length ? parts.join(' / ') : '—';
}

function mechanismLabel(mech?: FreeMechanism): string {
  if (!mech) return '—';
  return MECHANISM_LABEL[mech] ?? mech;
}

function providerStats(models: ModelRecord[]) {
  const map = new Map<string, { total: number; free: number; paidTrial: number }>();
  for (const model of models) {
    const item = map.get(model.provider) ?? { total: 0, free: 0, paidTrial: 0 };
    item.total += 1;
    if (model.is_free) item.free += 1;
    // 付费但开放试用调用（如 Gitee 体验）
    if (!model.is_free && model.trial_scope === 'all') item.paidTrial += 1;
    map.set(model.provider, item);
  }
  return map;
}

function uniqueFamilies(models: ModelRecord[]): { total: number; crossProvider: number } {
  const groups = new Map<string, Set<string>>();
  for (const model of models) {
    if (!model.model_family) continue;
    const providers = groups.get(model.model_family) ?? new Set<string>();
    providers.add(model.provider);
    groups.set(model.model_family, providers);
  }
  return {
    total: groups.size,
    crossProvider: Array.from(groups.values()).filter(p => p.size > 1).length,
  };
}

function buildProviderIndex(models: ModelRecord[]): string {
  const stats = providerStats(models);
  const providers = Array.from(stats.keys()).sort();
  const rows = providers.map(provider => {
    const meta = PROVIDER_LINKS[provider] ?? { name: provider, displayName: provider, website: '' };
    const s = stats.get(provider)!;
    const dataUrl = `https://ofind.cn/FreeModels/data/providers/${provider}/models.json`;
    return [
      `| ${mdLink(meta.displayName, meta.website)} `,
      `\`${provider}\``,
      String(s.total),
      String(s.free),
      String(s.paidTrial),
      meta.freePolicy ?? '—',
      mdLink('注册', meta.signupUrl),
      mdLink('API Key', meta.apiKeyUrl),
      mdLink('文档', meta.docsUrl),
      mdLink('JSON', dataUrl),
    ].join(' | ') + ' |';
  });
  return [
    '| Provider | 内部 ID | 总模型 | 免费 | 付费可试用 | 免费策略 | 注册 | API Key | 文档 | 数据 |',
    '|---|---|---:|---:|---:|---|---|---|---|---|',
    ...rows,
  ].join('\n');
}

function buildStats(models: ModelRecord[]): string {
  const families = uniqueFamilies(models);
  const providers = new Set(models.map(m => m.provider));
  const free = models.filter(m => m.is_free).length;
  const paidTrial = models.filter(m => !m.is_free && m.trial_scope === 'all').length;
  const byMech: Record<string, number> = {};
  for (const m of models) {
    if (m.is_free && m.free_mechanism) {
      byMech[m.free_mechanism] = (byMech[m.free_mechanism] ?? 0) + 1;
    }
  }
  const rows = [
    '| 维度 | 数量 |',
    '|------|-----:|',
    `| Provider | ${providers.size} |`,
    `| 模型总数 | ${models.length} |`,
    `| 免费模型 (\`is_free=true\`) | ${free} |`,
    `| 付费可试用 (Gitee 体验等) | ${paidTrial} |`,
    `| 模型家族 | ${families.total} |`,
    `| 跨 Provider 家族 | ${families.crossProvider} |`,
  ];
  for (const [mech, count] of Object.entries(byMech).sort((a, b) => b[1] - a[1])) {
    rows.push(`| · ${mechanismLabel(mech as FreeMechanism)} | ${count} |`);
  }
  return rows.join('\n');
}

function buildFreeModelsSummary(models: ModelRecord[]): string {
  const free = models.filter(m => m.is_free);
  const byMech: Record<string, number> = {};
  for (const m of free) {
    const k = m.free_mechanism ?? 'unknown';
    byMech[k] = (byMech[k] ?? 0) + 1;
  }
  const mechParts = Object.entries(byMech)
    .sort((a, b) => b[1] - a[1])
    .map(([k, n]) => `${mechanismLabel(k as FreeMechanism)} ${n} 个`)
    .join('、');

  return [
    `共 **${free.length}** 个免费模型（${mechParts}）。`,
    ``,
    `完整列表及按机制筛选：`,
    `- [全部免费模型](https://ofind.cn/FreeModels/data/views/free/models.json)`,
    `- [永久免费](https://ofind.cn/FreeModels/data/views/free-permanent/models.json)`,
    `- [限速免费](https://ofind.cn/FreeModels/data/views/free-rate-limited/models.json)`,
    `- [配额免费](https://ofind.cn/FreeModels/data/views/free-quota/models.json)`,
    `- [付费可试用](https://ofind.cn/FreeModels/data/views/paid-trial/models.json)`,
  ].join('\n');
}

function buildFreeModelsTable(models: ModelRecord[], provider?: string): string {
  const freeModels = models
    .filter(m => m.is_free && (!provider || m.provider === provider))
    .sort((a, b) => a.provider.localeCompare(b.provider) || (a.model_id ?? a.id ?? '').localeCompare(b.model_id ?? b.id ?? ''));

  if (freeModels.length === 0) return '_当前未识别到免费模型。_';

  const rows = freeModels.map(model => [
    `| ${model.provider} `,
    `\`${model.model_id ?? model.id ?? ''}\``,
    model.name.replace(/\|/g, '\\|'),
    model.context_label ?? '—',
    mechanismLabel(model.free_mechanism),
    quotaText(model.free_quota).replace(/\|/g, '\\|'),
  ].join(' | ') + ' |');

  return [
    '| Provider | Model ID | 名称 | 上下文 | 免费类型 | 限制 |',
    '|---|---|---|---:|---|---|',
    ...rows,
  ].join('\n');
}

function replaceSection(content: string, key: string, generated: string): string {
  const start = `<!-- AUTO-GENERATED:${key}_START -->`;
  const end = `<!-- AUTO-GENERATED:${key}_END -->`;
  const block = `${start}\n${generated}\n${end}`;
  const pattern = new RegExp(`${start}[\\s\\S]*?${end}`);
  if (pattern.test(content)) return content.replace(pattern, block);
  return `${content.trim()}\n\n${block}\n`;
}

function writeReadme(models: ModelRecord[]): void {
  let content = fs.existsSync(README_PATH) ? fs.readFileSync(README_PATH, 'utf-8') : '# FreeModels\n';
  content = content.replace('# Model Hub', '# FreeModels');
  content = replaceSection(content, 'PROVIDER_INDEX', buildProviderIndex(models));
  content = replaceSection(content, 'STATS', buildStats(models));
  content = replaceSection(content, 'FREE_MODELS', buildFreeModelsSummary(models));
  fs.writeFileSync(README_PATH, content.endsWith('\n') ? content : `${content}\n`);
}

function providerDoc(provider: string, models: ModelRecord[]): string {
  const meta = PROVIDER_LINKS[provider] ?? { name: provider, displayName: provider, website: '' };
  const stats = providerStats(models).get(provider) ?? { total: 0, free: 0, paidTrial: 0 };
  return `# ${meta.displayName}\n\n` +
    `> 本文档由 \`npm run generate-docs\` 根据 \`data/models.json\` 自动生成。\n\n` +
    `## 接入信息\n\n` +
    `| 项目 | 内容 |\n|---|---|\n` +
    `| 内部 Provider ID | \`${provider}\` |\n` +
    `| 官网 | ${mdLink(meta.website, meta.website)} |\n` +
    `| 注册/登录 | ${mdLink(meta.signupUrl ?? '—', meta.signupUrl)} |\n` +
    `| 控制台 | ${mdLink(meta.consoleUrl ?? '—', meta.consoleUrl)} |\n` +
    `| API Key | ${mdLink(meta.apiKeyUrl ?? '—', meta.apiKeyUrl)} |\n` +
    `| 官方文档 | ${mdLink(meta.docsUrl ?? '—', meta.docsUrl)} |\n` +
    `| 模型/价格 | ${mdLink(meta.modelsUrl ?? meta.pricingUrl ?? '—', meta.modelsUrl ?? meta.pricingUrl)} |\n` +
    `| API Base URL | ${meta.apiBaseUrl ? `\`${meta.apiBaseUrl}\`` : '—'} |\n` +
    `| 鉴权方式 | ${meta.authType ?? '—'} |\n` +
    `| 环境变量 | ${meta.envKey ? `\`${meta.envKey}\`` : '—'} |\n\n` +
    `## 当前统计\n\n` +
    `| 指标 | 数量 |\n|---|---:|\n` +
    `| 总模型 | ${stats.total} |\n` +
    `| 免费模型 | ${stats.free} |\n` +
    `| 付费可试用 | ${stats.paidTrial} |\n\n` +
    `## 免费策略\n\n${meta.freePolicy ?? '以官方文档和控制台为准。'}\n\n` +
    `## 当前免费模型\n\n${buildFreeModelsTable(models, provider)}\n`;
}

function writeProviderDocs(models: ModelRecord[]): void {
  if (!fs.existsSync(PROVIDER_DOCS_DIR)) fs.mkdirSync(PROVIDER_DOCS_DIR, { recursive: true });
  const providers = Array.from(new Set(models.map(m => m.provider))).sort();
  const index = `# Provider 文档索引\n\n` +
    `> 本文档由 \`npm run generate-docs\` 自动生成。Provider 数据源与抓取细节以 \`scripts/hub/providers/{name}/index.ts\` 为准。\n\n` +
    `## Provider 支持情况\n\n${buildProviderIndex(models)}\n\n` +
    `## 各 Provider 详细文档\n\n` +
    providers.map(p => `- [${PROVIDER_LINKS[p]?.displayName ?? p}](./${p}.md)`).join('\n') + '\n';
  fs.writeFileSync(PROVIDERS_README_PATH, index);

  for (const provider of providers) {
    fs.writeFileSync(path.join(PROVIDER_DOCS_DIR, `${provider}.md`), providerDoc(provider, models));
  }
}

function main(): void {
  const { data } = loadModels();
  writeReadme(data);
  writeProviderDocs(data);
  console.log(`[Docs] Updated README and provider docs from ${data.length} models.`);
}

main();
