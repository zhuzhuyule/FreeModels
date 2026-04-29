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
} from './evaluator.js';
import type {
  EnhancedModelData,
  ProviderPlugin,
  CachedCapabilities,
} from './types.js';
import { toOpenAICompatible } from './types.js';
import { groupByFamily } from './family.js';
import { classifyFamilyWithLlm, getLlmStats, isLlmEnabled } from './llm.js';
import { notifyWechat, type NotifyPayload } from './notify.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PROVIDERS_DIR = join(__dirname, 'providers');
const OUTPUT_PATH = path.resolve('data/models.json');

const ANOMALY_THRESHOLD = 0.5;
const TOTAL_DROP_THRESHOLD = 0.1;

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

function dedupeByModelId(models: EnhancedModelData[]): EnhancedModelData[] {
  const map = new Map<string, EnhancedModelData>();
  const conflicts: Record<string, number> = {};

  const score = (m: EnhancedModelData): number =>
    (m.description?.length ?? 0) +
    (m.contextSize && m.contextSize > 0 ? 1000 : 0) +
    (m.capabilities?.length ?? 0) * 10 +
    (m.priceInput !== undefined ? 5 : 0) +
    (m.priceOutput !== undefined ? 5 : 0);

  for (const m of models) {
    const existing = map.get(m.modelId);
    if (!existing) {
      map.set(m.modelId, m);
      continue;
    }
    conflicts[m.modelId] = (conflicts[m.modelId] ?? 1) + 1;
    if (score(m) > score(existing)) {
      map.set(m.modelId, m);
    }
  }

  const conflictCount = Object.keys(conflicts).length;
  if (conflictCount > 0) {
    const total = Object.values(conflicts).reduce((a, b) => a + b, 0);
    console.warn(
      `[Aggregator] Deduplicated ${total - conflictCount} conflicting record(s) across ${conflictCount} model id(s).`
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
  maxCalls = 30
): Promise<void> {
  if (!isLlmEnabled()) return;

  const counts = new Map<string, number>();
  for (const m of models) counts.set(m.modelFamily, (counts.get(m.modelFamily) ?? 0) + 1);

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

  console.log(`[Aggregator] LLM refining ${limited.length} family outlier(s)...`);

  for (const m of limited) {
    const result = await classifyFamilyWithLlm(m.modelId, m.name);
    if (result?.family) {
      m.modelFamily = result.family;
      if (result.variant) m.modelVariant = result.variant;
      if (result.quantization) m.quantization = result.quantization;
    }
  }
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
  byProvider: Record<string, number>;
}

function snapshotPrevious(): ProviderSnapshot | null {
  if (!fs.existsSync(OUTPUT_PATH)) return null;
  try {
    const previous = JSON.parse(fs.readFileSync(OUTPUT_PATH, 'utf-8')) as { data?: Array<{ provider: string }> };
    if (!Array.isArray(previous.data)) return null;
    const byProvider: Record<string, number> = {};
    for (const m of previous.data) {
      byProvider[m.provider] = (byProvider[m.provider] ?? 0) + 1;
    }
    return { total: previous.data.length, byProvider };
  } catch {
    return null;
  }
}

function detectAnomalies(
  current: ProviderSnapshot,
  previous: ProviderSnapshot | null,
  failedProviders: string[]
): string[] {
  const warnings: string[] = [];

  if (failedProviders.length > 0) {
    warnings.push(`Provider(s) failed: ${failedProviders.join(', ')}`);
  }

  if (!previous) return warnings;

  const totalDrop = (previous.total - current.total) / previous.total;
  if (totalDrop > TOTAL_DROP_THRESHOLD) {
    warnings.push(
      `Total models dropped ${(totalDrop * 100).toFixed(1)}% (${previous.total} -> ${current.total})`
    );
  }

  for (const [name, prevCount] of Object.entries(previous.byProvider)) {
    const currCount = current.byProvider[name] ?? 0;
    if (prevCount === 0) continue;
    const drop = (prevCount - currCount) / prevCount;
    if (drop > ANOMALY_THRESHOLD) {
      warnings.push(
        `Provider "${name}" dropped ${(drop * 100).toFixed(1)}% (${prevCount} -> ${currCount})`
      );
    }
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
  const previous = snapshotPrevious();

  const results = await Promise.all(filteredProviders.map(p => runProvider(p, cache)));

  saveCache(cache);

  const allModels = validateAndFilter(
    dedupeByModelId(results.flatMap(r => r.models))
  );

  await refineFamiliesWithLlm(allModels);
  fillAliases(allModels);
  const familyStats = reportFamilyStats(allModels);

  if (isLlmEnabled()) {
    const s = getLlmStats();
    console.log(`[Aggregator] LLM stats: cache_hits=${s.hits}, calls=${s.misses}, errors=${s.errors}`);
  }

  const availableProviders = results
    .filter(r => r.models.length > 0)
    .map(r => r.provider);
  const failedProviders = results
    .filter(r => r.error || r.models.length === 0)
    .map(r => r.provider);

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
  for (const m of allModels) {
    byProvider[m.provider] = (byProvider[m.provider] ?? 0) + 1;
  }
  const current: ProviderSnapshot = { total: allModels.length, byProvider };

  const warnings = detectAnomalies(current, previous, failedProviders);
  if (warnings.length > 0) {
    console.warn('\n[Aggregator] ⚠ Anomalies detected:');
    for (const w of warnings) console.warn(`  - ${w}`);
    if (strictMode) {
      console.error('[Aggregator] Strict mode: aborting due to anomalies.');
      process.exit(2);
    }
  }

  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(output, null, 2));
  console.log(`[Aggregator] Saved ${allModels.length} models to ${OUTPUT_PATH}`);

  if (!skipNotify) {
    const payload: NotifyPayload = {
      totalModels: allModels.length,
      totalFamilies: familyStats.total,
      crossProviderFamilies: familyStats.crossProvider,
      topFamilies: familyStats.top.slice(0, 5),
      byProvider,
      failedProviders,
      anomalies: warnings,
      llmStats: getLlmStats(),
      durationMs: Date.now() - startedAt,
      previousTotal: previous?.total,
    };
    await notifyWechat(payload);
  }
}

main().catch(error => {
  console.error('[Aggregator] Fatal error:', error);
  process.exit(1);
});
