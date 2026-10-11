import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import {
  enhanceWithCacheUsing,
  mutateCacheEntry,
  loadCache,
  saveCache,
  PROVIDER_META,
  saveProviderOutput,
  saveViewOutput,
  buildViews,
  filterModels,
} from './evaluator.js';
import type {
  EnhancedModelData,
  ProviderPlugin,
  CachedCapabilities,
} from './types.js';
import { toOpenAICompatible, toCanonicalId } from './types.js';
import { groupByFamily } from './family.js';
import { classifyFamilyWithLlm, getLlmStats, isLlmEnabled, initLlmContext, flushLlmContext } from './llm.js';
import { notifyWechat, type NotifyPayload } from './notify.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PROVIDERS_DIR = join(__dirname, 'providers');
const OUTPUT_PATH = path.resolve('data/models.json');

const ANOMALY_THRESHOLD = 0.5;
const TOTAL_DROP_THRESHOLD = 0.1;
// 免费占比 / is_free 翻转的阈值. 单个模型转付费是正常的, 成片翻转通常是
// 上游字段改名或 provider 解析分支写错, 必须被拦住而不是静默落 master.
const FREE_RATIO_SWING_THRESHOLD = 0.1;
const FREE_FLIP_THRESHOLD = 0.05;

// OpenAI /v1/models drop-in 端点的物理路径. 让 OpenAI client 配置
// BaseURL = "https://ofind.cn/FreeModels/v1" 后直接拉到 model 列表.
// 写两份: 无扩展名 (OpenAI 标准路径) + .json 扩展名 (确保 Content-Type
// 是 application/json -- GitHub Pages 按扩展名设 mime type).
const V1_MODELS_PATH = path.resolve('v1/models');
const V1_MODELS_JSON_PATH = path.resolve('v1/models.json');

interface DiscoveredProvider {
  name: string;
  fetch: ProviderPlugin;
}

interface ProviderResult {
  provider: string;
  models: EnhancedModelData[];
  error?: string;
}

async function discoverProviders(): Promise<DiscoveredProvider[]> {
  const providers: DiscoveredProvider[] = [];

  if (!fs.existsSync(PROVIDERS_DIR)) {
    return providers;
  }

  const entries = fs.readdirSync(PROVIDERS_DIR, { withFileTypes: true });

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;

    const indexPath = join(PROVIDERS_DIR, entry.name, 'index.ts');
    if (!fs.existsSync(indexPath)) continue;

    try {
      const modulePath = `./providers/${entry.name}/index.js`;
      const providerModule = await import(modulePath);
      const fetchFn = providerModule.fetchModels || providerModule.default?.fetchModels;
      if (typeof fetchFn === 'function') {
        providers.push({ name: entry.name, fetch: fetchFn });
        console.log(`[Aggregator] Loaded provider: ${entry.name}`);
      }
    } catch (error) {
      console.warn(`[Aggregator] Failed to load provider ${entry.name}:`, error);
    }
  }

  return providers;
}

async function runProvider(
  provider: DiscoveredProvider,
  cache: Record<string, CachedCapabilities>
): Promise<ProviderResult> {
  console.log(`[Aggregator] Fetching from ${provider.name}...`);

  try {
    const rawModels = await provider.fetch();
    console.log(`[Aggregator] ${provider.name}: ${rawModels.length} raw models fetched`);

    const enhancedModels = rawModels.map(raw => {
      const enhanced = enhanceWithCacheUsing(cache, provider.name, raw.modelId, raw);
      mutateCacheEntry(cache, provider.name, raw.modelId, raw, enhanced);
      return enhanced;
    });

    return { provider: provider.name, models: enhancedModels };
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error(`[Aggregator] ${provider.name} failed:`, msg);
    return { provider: provider.name, models: [], error: msg };
  }
}

function dedupeByProviderModelId(models: EnhancedModelData[]): EnhancedModelData[] {
  // 复合键 (provider, modelId): 跨 provider 同名 model 是合法的 (同一开源
  // 模型不同 host, 如 Groq/Cerebras/SambaNova 都有 llama-3.1-8b), 必须共存.
  // 去重只发生在同一 provider 内 (plugin 重复返回同一 model 时).
  const map = new Map<string, EnhancedModelData>();
  const conflicts: Record<string, number> = {};

  // 分级比较, 字典序: 能力数 > context > 价格完整度 > description 长度.
  // 避免老逻辑里 description 长 200 字符压过 capabilities 多 20 个的赢家.
  const features = (m: EnhancedModelData): [number, number, number, number] => [
    m.capabilities?.length ?? 0,
    m.contextSize && m.contextSize > 0 ? 1 : 0,
    (m.priceInput !== undefined ? 1 : 0) + (m.priceOutput !== undefined ? 1 : 0),
    m.description?.length ?? 0,
  ];

  const isBetter = (a: EnhancedModelData, b: EnhancedModelData): boolean => {
    const fa = features(a);
    const fb = features(b);
    for (let i = 0; i < fa.length; i++) {
      if (fa[i] !== fb[i]) return fa[i] > fb[i];
    }
    return false;
  };

  const compositeKey = (m: EnhancedModelData): string => `${m.provider}:${m.modelId}`;

  for (const m of models) {
    const key = compositeKey(m);
    const existing = map.get(key);
    if (!existing) {
      map.set(key, m);
      continue;
    }
    conflicts[key] = (conflicts[key] ?? 1) + 1;
    if (isBetter(m, existing)) {
      map.set(key, m);
    }
  }

  const conflictCount = Object.keys(conflicts).length;
  if (conflictCount > 0) {
    const total = Object.values(conflicts).reduce((a, b) => a + b, 0);
    console.warn(
      `[Aggregator] Deduplicated ${total - conflictCount} intra-provider conflicting record(s) across ${conflictCount} (provider, modelId) pair(s).`
    );
  }

  return Array.from(map.values());
}

function validateModel(m: EnhancedModelData): string[] {
  const errors: string[] = [];
  if (!m.modelId) errors.push('missing modelId');
  if (!m.name) errors.push('missing name');
  if (!m.provider) errors.push('missing provider');
  if (!Array.isArray(m.tags)) errors.push('tags must be array');
  if (m.priceInput !== undefined && (typeof m.priceInput !== 'number' || m.priceInput < 0)) {
    errors.push('priceInput must be non-negative number');
  }
  if (m.priceOutput !== undefined && (typeof m.priceOutput !== 'number' || m.priceOutput < 0)) {
    errors.push('priceOutput must be non-negative number');
  }
  return errors;
}

async function refineFamiliesWithLlm(
  models: EnhancedModelData[],
  maxCalls = 30,
  concurrency = 5
): Promise<void> {
  if (!isLlmEnabled()) return;

  const candidates = models.filter(m => {
    const family = m.modelFamily;
    if (!family || family.length < 2) return true;
    if (/[\/\\]/.test(family)) return true;
    if (family.length > 60) return true;
    // Non-ASCII (Chinese / Japanese / etc.) — likely needs LLM canonicalization
    // eslint-disable-next-line no-control-regex
    if (/[^\x00-\x7F]/.test(family)) return true;
    return false;
  });

  const limited = candidates.slice(0, maxCalls);
  if (limited.length === 0) return;

  console.log(`[Aggregator] LLM refining ${limited.length} family outlier(s) with concurrency=${concurrency}...`);

  let cursor = 0;
  async function worker(): Promise<void> {
    while (true) {
      const idx = cursor++;
      if (idx >= limited.length) return;
      const m = limited[idx];
      const result = await classifyFamilyWithLlm(m.modelId, m.name);
      if (result?.family) {
        m.modelFamily = result.family;
        if (result.variant) m.modelVariant = result.variant;
        if (result.quantization) m.quantization = result.quantization;
      }
    }
  }
  await Promise.all(Array.from({ length: Math.min(concurrency, limited.length) }, () => worker()));
}

function fillAliases(models: EnhancedModelData[]): void {
  const groups = groupByFamily(models);
  for (const [, group] of groups) {
    if (group.length < 2) continue;
    const ids = group.map(m => m.modelId);
    for (const m of group) {
      m.aliases = ids.filter(id => id !== m.modelId);
    }
  }
}

function reportFamilyStats(
  models: EnhancedModelData[]
): { total: number; crossProvider: number; top: Array<{ family: string; providerCount: number }> } {
  const groups = groupByFamily(models);
  let multiProvider = 0;
  const top: Array<{ family: string; providerCount: number }> = [];
  for (const [family, group] of groups) {
    const providers = new Set(group.map(m => m.provider));
    if (providers.size >= 2) {
      multiProvider++;
      top.push({ family, providerCount: providers.size });
    }
  }
  top.sort((a, b) => b.providerCount - a.providerCount);
  console.log(`[Aggregator] Family groups: ${groups.size} (${multiProvider} cross-provider).`);
  if (top.length > 0) {
    const preview = top.slice(0, 5).map(t => `${t.family}(${t.providerCount}p)`).join(', ');
    console.log(`[Aggregator] Top cross-provider families: ${preview}`);
  }
  return { total: groups.size, crossProvider: multiProvider, top };
}

function validateAndFilter(models: EnhancedModelData[]): EnhancedModelData[] {
  const valid: EnhancedModelData[] = [];
  let invalidCount = 0;
  for (const m of models) {
    const errors = validateModel(m);
    if (errors.length > 0) {
      invalidCount++;
      console.warn(`[Aggregator] Invalid model ${m.provider}/${m.modelId}: ${errors.join(', ')}`);
      continue;
    }
    valid.push(m);
  }
  if (invalidCount > 0) {
    console.warn(`[Aggregator] Dropped ${invalidCount} invalid model(s).`);
  }
  return valid;
}

interface ProviderSnapshot {
  total: number;
  freeCount: number;
  byProvider: Record<string, number>;
  freeByProvider: Record<string, number>;
  ids: Set<string>;
  freeIds: Set<string>;
}

function snapshotPrevious(): ProviderSnapshot | null {
  if (!fs.existsSync(OUTPUT_PATH)) return null;
  try {
    const previous = JSON.parse(fs.readFileSync(OUTPUT_PATH, 'utf-8')) as {
      data?: Array<{ id: string; provider?: string; owned_by?: string; is_free?: boolean }>;
    };
    if (!Array.isArray(previous.data)) {
      console.warn(`[Aggregator] ⚠ Previous models.json has no .data array — anomaly detection disabled.`);
      return null;
    }
    const byProvider: Record<string, number> = {};
    const freeByProvider: Record<string, number> = {};
    const ids = new Set<string>();
    const freeIds = new Set<string>();
    let freeCount = 0;
    for (const m of previous.data) {
      // owned_by 是新 schema 的字段名, provider 是历史字段 (同值, 二者并存).
      // 读取时优先 owned_by, fallback provider 兼容旧 JSON.
      const owner = m.owned_by ?? m.provider ?? '';
      byProvider[owner] = (byProvider[owner] ?? 0) + 1;
      // 复合键: 跨 provider 同 id 是合法共存, 必须用 (owner, id) 才唯一.
      const key = `${owner}:${m.id}`;
      ids.add(key);
      if (m.is_free) {
        freeCount++;
        freeByProvider[owner] = (freeByProvider[owner] ?? 0) + 1;
        freeIds.add(key);
      }
    }
    return { total: previous.data.length, freeCount, byProvider, freeByProvider, ids, freeIds };
  } catch (err) {
    console.warn(
      `[Aggregator] ⚠ Failed to parse previous models.json (${err instanceof Error ? err.message : err}) — anomaly detection disabled.`
    );
    return null;
  }
}

function detectAnomalies(
  current: ProviderSnapshot,
  previous: ProviderSnapshot | null,
  failedProviders: string[],
  emptyProviders: string[]
): string[] {
  const warnings: string[] = [];

  if (failedProviders.length > 0) {
    warnings.push(`Provider(s) failed: ${failedProviders.join(', ')}`);
  }

  // 返回 0 条同样要拦: 上游改版/字段改名时 fetch 是"成功"的, 只靠抛错抓不住,
  // 而它的破坏方式与失败一模一样 (该 provider 的模型全部从列表里消失).
  if (emptyProviders.length > 0) {
    warnings.push(`Provider(s) returned 0 models: ${emptyProviders.join(', ')}`);
  }

  if (!previous) return warnings;

  const totalDrop = (previous.total - current.total) / previous.total;
  if (totalDrop > TOTAL_DROP_THRESHOLD) {
    warnings.push(
      `Total models dropped ${(totalDrop * 100).toFixed(1)}% (${previous.total} -> ${current.total})`
    );
  }

  // 对称检查: 只盯"掉"会漏掉解析分支变宽的情况 (例如把付费模型一起收进来),
  // 那同样是脏数据, 而且会直接把非免费条目冒充成免费列表.
  for (const name of new Set([...Object.keys(previous.byProvider), ...Object.keys(current.byProvider)])) {
    const prevCount = previous.byProvider[name] ?? 0;
    const currCount = current.byProvider[name] ?? 0;
    if (prevCount === 0) continue; // 新接入 provider 没有基线, 不与阈值比较
    const delta = (currCount - prevCount) / prevCount;
    if (delta < -ANOMALY_THRESHOLD) {
      warnings.push(
        `Provider "${name}" dropped ${(delta * 100).toFixed(1)}% (${prevCount} -> ${currCount})`
      );
    } else if (delta > ANOMALY_THRESHOLD) {
      warnings.push(
        `Provider "${name}" grew ${(delta * 100).toFixed(1)}% (${prevCount} -> ${currCount})`
      );
    }
  }

  // 单个 provider 的免费数单独查: 某个小 provider 的 is_free 全丢时, 全局免费
  // 占比只动一两个百分点、翻转数也不到 5%, 只有按家看才拦得住.
  // 基数小于 3 条不做比较, 否则上游新增/下线一个模型就会天天误报.
  for (const name of new Set([...Object.keys(previous.freeByProvider), ...Object.keys(current.freeByProvider)])) {
    const prevFree = previous.freeByProvider[name] ?? 0;
    const currFree = current.freeByProvider[name] ?? 0;
    const change = currFree - prevFree;
    if (prevFree < 3 || Math.abs(change) < 3) continue;
    const delta = change / prevFree;
    if (Math.abs(delta) > ANOMALY_THRESHOLD) {
      warnings.push(
        `Provider "${name}" free models ${delta > 0 ? 'grew' : 'dropped'} ${(delta * 100).toFixed(1)}% ` +
        `(${prevFree} -> ${currFree})`
      );
    }
  }

  const prevFreeRatio = previous.freeCount / previous.total;
  const currFreeRatio = current.freeCount / current.total;
  const freeSwing = currFreeRatio - prevFreeRatio;
  if (Math.abs(freeSwing) > FREE_RATIO_SWING_THRESHOLD) {
    warnings.push(
      `Free share swung ${(freeSwing * 100).toFixed(1)}pp ` +
      `(${(prevFreeRatio * 100).toFixed(1)}% -> ${(currFreeRatio * 100).toFixed(1)}%)`
    );
  }

  // is_free 翻转: 总量不变但免费标记成片翻转时, 上面的比值检查可能看不出来
  // (例如同时有一批转付费、一批转免费). 只在两批共有的模型上比较.
  let overlap = 0;
  const flipped: string[] = [];
  for (const key of current.ids) {
    if (!previous.ids.has(key)) continue;
    overlap++;
    if (previous.freeIds.has(key) !== current.freeIds.has(key)) flipped.push(key);
  }
  if (overlap > 0 && flipped.length / overlap > FREE_FLIP_THRESHOLD) {
    const shown = flipped.slice(0, 5).join(', ');
    warnings.push(
      `${flipped.length} model(s) flipped is_free out of ${overlap} unchanged entries (>5%): ${shown}` +
      (flipped.length > 5 ? `, …还有 ${flipped.length - 5} 个` : '')
    );
  }

  return warnings;
}

async function main(): Promise<void> {
  const startedAt = Date.now();
  console.log('[Aggregator] Starting model aggregation...');

  const args = process.argv.slice(2);
  const targetProvider = args.find(a => a.startsWith('--provider='))?.split('=')[1];
  const strictMode = args.includes('--strict');
  const skipNotify = args.includes('--no-notify') || !!targetProvider;

  const providers = await discoverProviders();

  const filteredProviders = targetProvider
    ? providers.filter(p => p.name === targetProvider)
    : providers;

  console.log(
    `[Aggregator] Discovered ${providers.length} providers, running: ${filteredProviders
      .map(p => p.name)
      .join(', ')}`
  );

  const cache = loadCache();
  // 单 provider 跑时, 上一版聚合文件里含所有 provider, 拿它当基线会把其它
  // provider 全部算成"移除"并要求审核. 单 provider 的护栏是它自己的 0 条/抛错.
  const previous = targetProvider ? null : snapshotPrevious();
  if (targetProvider) {
    console.log(`[Aggregator] --provider=${targetProvider}: diff baseline skipped (aggregate not rewritten).`);
  }

  const results = await Promise.all(filteredProviders.map(p => runProvider(p, cache)));

  saveCache(cache);

  const allModels = validateAndFilter(
    dedupeByProviderModelId(results.flatMap(r => r.models))
  );

  if (isLlmEnabled()) initLlmContext();
  await refineFamiliesWithLlm(allModels);
  if (isLlmEnabled()) flushLlmContext();
  fillAliases(allModels);
  const familyStats = reportFamilyStats(allModels);

  if (isLlmEnabled()) {
    const s = getLlmStats();
    console.log(`[Aggregator] LLM stats: cache_hits=${s.hits}, calls=${s.misses}, errors=${s.errors}`);
  }

  const availableProviders = results
    .filter(r => r.models.length > 0)
    .map(r => r.provider);
  // 失败 = provider 抛错; 返回空数组不是"失败"但同样是脏数据 (见 detectAnomalies).
  const failedProviders = results
    .filter(r => r.error)
    .map(r => r.provider);
  const emptyProviders = results
    .filter(r => !r.error && r.models.length === 0)
    .map(r => r.provider);
  if (emptyProviders.length > 0) {
    console.warn(`[Aggregator] Provider(s) returned 0 models: ${emptyProviders.join(', ')}`);
  }

  const providerMeta: Record<string, typeof PROVIDER_META[string]> = {};
  for (const name of availableProviders) {
    if (PROVIDER_META[name]) {
      providerMeta[name] = PROVIDER_META[name];
    } else {
      providerMeta[name] = {
        name,
        displayName: name.charAt(0).toUpperCase() + name.slice(1),
      };
    }
  }

  const output = toOpenAICompatible(allModels);
  output.providers = providerMeta;

  const byProvider: Record<string, number> = {};
  const freeByProvider: Record<string, number> = {};
  const currentIds = new Set<string>();
  const currentFreeIds = new Set<string>();
  let freeCount = 0;
  for (const m of allModels) {
    byProvider[m.provider] = (byProvider[m.provider] ?? 0) + 1;
    // 键必须与 snapshotPrevious 同口径: 外部 canonical id (剥掉 provider
    // 前缀). 用内部 modelId 会让所有带前缀的模型每天被误报成"新增+移除"成对噪音.
    const key = `${m.provider}:${toCanonicalId(m.provider, m.modelId)}`;
    currentIds.add(key);
    if (m.isFree) {
      freeCount++;
      freeByProvider[m.provider] = (freeByProvider[m.provider] ?? 0) + 1;
      currentFreeIds.add(key);
    }
  }
  const current: ProviderSnapshot = {
    total: allModels.length,
    freeCount,
    byProvider,
    freeByProvider,
    ids: currentIds,
    freeIds: currentFreeIds,
  };

  const addedIds: string[] = [];
  const removedIds: string[] = [];
  if (previous) {
    for (const id of currentIds) if (!previous.ids.has(id)) addedIds.push(id);
    for (const id of previous.ids) if (!currentIds.has(id)) removedIds.push(id);
  }

  const warnings = detectAnomalies(current, previous, failedProviders, emptyProviders);
  if (warnings.length > 0) {
    console.warn('\n[Aggregator] ⚠ Anomalies detected:');
    for (const w of warnings) console.warn(`  - ${w}`);
    if (strictMode) {
      // 不在这里 exit: 先写数据 + 发通知, main 末尾再以退出码 2 路由到 PR 审核.
      console.error('[Aggregator] Strict mode: anomalies will gate this run into PR review (exit 2 after output).');
    }
  }

  const outputJson = JSON.stringify(output, null, 2);

  // 聚合文件 (data/models.json、/v1/models、views) 是全 provider 的产物;
  // --provider=X 的 output 只含那一家, 无条件写会把线上列表覆盖成单家子集.
  // 单家调试只落 data/providers/<name>/models.json.
  if (targetProvider) {
    console.log(`[Aggregator] --provider=${targetProvider}: skipped ${OUTPUT_PATH}, ${V1_MODELS_PATH} and views.`);
  } else {
    fs.writeFileSync(OUTPUT_PATH, outputJson);
    console.log(`[Aggregator] Saved ${allModels.length} models to ${OUTPUT_PATH}`);

    // OpenAI /v1/models drop-in: 写两份, 详见 V1_MODELS_PATH 常量注释.
    fs.mkdirSync(path.dirname(V1_MODELS_PATH), { recursive: true });
    fs.writeFileSync(V1_MODELS_PATH, outputJson);
    fs.writeFileSync(V1_MODELS_JSON_PATH, outputJson);
    console.log(`[Aggregator] Saved OpenAI /v1/models drop-in to ${V1_MODELS_PATH} (+ .json variant)`);
  }

  for (const provider of availableProviders) {
    const providerModels = allModels.filter(m => m.provider === provider);
    saveProviderOutput(provider, providerModels);
  }
  console.log(`[Aggregator] Wrote per-provider files for ${availableProviders.length} provider(s).`);

  if (!targetProvider) {
    for (const { view, filters } of buildViews(allModels)) {
      const viewModels = filterModels(allModels, filters);
      saveViewOutput(view, viewModels, filters);
    }
    console.log(`[Aggregator] Wrote view files.`);
  }

  if (!skipNotify) {
    const payload: NotifyPayload = {
      totalModels: allModels.length,
      freeCount,
      totalFamilies: familyStats.total,
      crossProviderFamilies: familyStats.crossProvider,
      topFamilies: familyStats.top.slice(0, 5),
      byProvider,
      failedProviders,
      anomalies: warnings,
      addedIds,
      removedIds,
      llmStats: getLlmStats(),
      durationMs: Date.now() - startedAt,
      previousTotal: previous?.total,
      previousFreeCount: previous?.freeCount,
      previousByProvider: previous?.byProvider,
      reviewRequired: strictMode && warnings.length > 0,
    };
    await notifyWechat(payload);
  }

  // --strict 的语义只跟异常有关, 跟发不发通知无关: 单 provider 调试
  // (--provider=X --strict) 也要能靠 0 条/抛错拿到非 0 退出码.
  if (strictMode && warnings.length > 0) {
    console.error('[Aggregator] Strict mode: exiting 2 for PR review gating.');
    process.exit(2);
  }
}

main().catch(error => {
  console.error('[Aggregator] Fatal error:', error);
  process.exit(1);
});
