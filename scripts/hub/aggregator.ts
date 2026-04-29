import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import {
  enhanceWithCache,
  saveProviderOutput,
  saveViewOutput,
  updateCache,
  buildViews,
  filterModels,
  PROVIDER_META,
} from './evaluator.js';
import type {
  RawModelData,
  EnhancedModelData,
  AggregatedOutput,
  ProviderPlugin,
} from './types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PROVIDERS_DIR = join(__dirname, 'providers');

interface DiscoveredProvider {
  name: string;
  fetch: ProviderPlugin;
}

async function discoverProviders(): Promise<DiscoveredProvider[]> {
  const providers: DiscoveredProvider[] = [];

  if (!fs.existsSync(PROVIDERS_DIR)) {
    return providers;
  }

  const entries = fs.readdirSync(PROVIDERS_DIR, { withFileTypes: true });

  for (const entry of entries) {
    if (!entry.isDirectory()) {
      continue;
    }

    const indexPath = join(PROVIDERS_DIR, entry.name, 'index.ts');
    if (!fs.existsSync(indexPath)) {
      continue;
    }

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
  provider: DiscoveredProvider
): Promise<{ provider: string; models: EnhancedModelData[] }> {
  console.log(`[Aggregator] Fetching from ${provider.name}...`);

  try {
    const rawModels = await provider.fetch();
    console.log(`[Aggregator] ${provider.name}: ${rawModels.length} raw models fetched`);

    const enhancedModels = rawModels.map(raw => {
      const enhanced = enhanceWithCache(provider.name, raw.modelId, raw);
      updateCache(provider.name, raw.modelId, raw, enhanced);
      return enhanced;
    });

    return { provider: provider.name, models: enhancedModels };
  } catch (error) {
    console.error(`[Aggregator] ${provider.name} failed:`, error);
    return { provider: provider.name, models: [] };
  }
}

async function main(): Promise<void> {
  console.log('[Aggregator] Starting model aggregation...');

  const providers = await discoverProviders();
  console.log(
    `[Aggregator] Discovered ${providers.length} providers: ${providers
      .map(p => p.name)
      .join(', ')}`
  );

  const results = await Promise.all(providers.map(runProvider));

  for (const result of results) {
    if (result.models.length > 0) {
      const outputPath = saveProviderOutput(result.provider, result.models);
      console.log(
        `[Aggregator] Saved ${result.models.length} models to ${outputPath}`
      );
    }
  }

  const allModels: EnhancedModelData[] = results.flatMap(r => r.models);

  const viewDefs = buildViews(allModels);
  for (const viewDef of viewDefs) {
    const filteredModels = filterModels(allModels, viewDef.filters);
    const outputPath = saveViewOutput(viewDef.view, filteredModels, viewDef.filters);
    console.log(
      `[Aggregator] Saved view "${viewDef.view}": ${filteredModels.length} models to ${outputPath}`
    );
  }

  const availableProviders = results
    .filter(r => r.models.length > 0)
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

  const output: AggregatedOutput = {
    updatedAt: new Date().toISOString(),
    totalModels: allModels.length,
    providers: availableProviders,
    providerMeta,
    views: viewDefs.map(v => v.view),
    models: allModels,
  };

  const outputPath = path.resolve('data/models.json');
  fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));
  console.log(
    `[Aggregator] Saved ${allModels.length} total models to ${outputPath}`
  );
}

main().catch(error => {
  console.error('[Aggregator] Fatal error:', error);
  process.exit(1);
});
