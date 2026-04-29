import * as fs from 'fs';
import * as path from 'path';
import {
  fetchGiteeModels,
  fetchXunfeiModels,
  fetchNvidiaModels,
  fetchGoogleModels,
} from './providers/index.js';
import {
  evaluateCapabilities,
  evaluateDynamicPricing,
  mergeModelEntry,
} from './evaluator.js';
import type { ModelEntry, RawModelData } from './types.js';

const OUTPUT_PATH = path.resolve('data/models.json');

interface ProviderConfig {
  name: string;
  fetch: () => Promise<RawModelData[]>;
}

const providers: ProviderConfig[] = [
  { name: 'gitee', fetch: fetchGiteeModels },
  { name: 'xunfei', fetch: fetchXunfeiModels },
  { name: 'nvidia', fetch: fetchNvidiaModels },
  { name: 'google', fetch: fetchGoogleModels },
];

async function runAggregator(): Promise<void> {
  console.log('[Aggregator] Starting model aggregation...');

  const allRawModels: RawModelData[] = [];

  await Promise.all(
    providers.map(async (provider) => {
      try {
        console.log(`[Aggregator] Fetching from ${provider.name}...`);
        const models = await provider.fetch();
        console.log(`[Aggregator] ${provider.name}: ${models.length} models fetched`);
        allRawModels.push(...models);
      } catch (error) {
        console.error(`[Aggregator] ${provider.name} failed:`, error);
      }
    })
  );

  console.log(`[Aggregator] Total raw models: ${allRawModels.length}`);

  const mergedEntries: ModelEntry[] = allRawModels.map((raw) => {
    const cached = evaluateCapabilities(raw.vendor, raw.modelId, raw);
    const dynamic = evaluateDynamicPricing(raw);
    return mergeModelEntry(raw, cached, dynamic);
  });

  const outputDir = path.dirname(OUTPUT_PATH);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const output = {
    updatedAt: new Date().toISOString(),
    totalModels: mergedEntries.length,
    models: mergedEntries,
  };

  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(output, null, 2));
  console.log(`[Aggregator] Output written to ${OUTPUT_PATH}`);
}

runAggregator().catch((error) => {
  console.error('[Aggregator] Fatal error:', error);
  process.exit(1);
});
