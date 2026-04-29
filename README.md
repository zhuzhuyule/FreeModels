# Model Hub

Multi-Provider Model Aggregation Hub with Intelligent Caching

## Architecture

```
scripts/hub/
├── aggregator.ts        # Main orchestration engine (auto-discovers providers)
├── enhancer.ts          # Capability inference (tags, reasoning, multimodal)
├── evaluator.ts         # Cache management & provider output
├── types.ts            # Shared TypeScript interfaces
└── providers/           # Provider plugins (auto-discovered)
    ├── gitee/
    │   └── index.ts    # Gitee AI models
    ├── xunfei/
    │   └── index.ts    # iFlytek models
    ├── nvidia/
    │   └── index.ts    # NVIDIA AI models
    └── google/
        └── index.ts    # Google AI models

data/
├── providers/           # Per-provider outputs
│   ├── gitee/models.json
│   ├── xunfei/models.json
│   ├── nvidia/models.json
│   └── google/models.json
├── capability-cache.json  # Persistent capability cache
└── models.json          # Aggregated output
```

## Adding a New Provider

1. Create a new directory under `scripts/hub/providers/{provider-name}/`
2. Create `index.ts` with a `fetchModels` export:

```typescript
import type { RawModelData, ProviderPlugin } from '../../types.js';

async function fetchModels(): Promise<RawModelData[]> {
  // Fetch from provider API
  // Return array of RawModelData
}

export const fetchModels: ProviderPlugin = fetchModels;
```

3. Run `npm run sync-models` - the new provider is auto-discovered and its output appears at `data/providers/{provider-name}/models.json`

## Capability Enhancement

The `enhancer.ts` automatically infers:
- **tags**: reasoning, text-generation, multimodal, etc.
- **isReasoning**: detected from model name/description keywords
- **isMultimodal**: detected from vision-related keywords
- **contextLabel**: normalized context size (e.g., "128K")
- **billingMode**: free / pay / mixed

## Cache Strategy

| Property | Cached | Notes |
|----------|--------|-------|
| tags, isReasoning, isMultimodal | Yes | Persisted in `capability-cache.json` |
| contextSize | Yes | Normalized label cached |
| description | Yes | Updated if provider provides better description |
| price, isFree, billingMode | No | Always recalculated from latest data |

## Commands

```bash
npm install
npm run sync-models    # Run aggregation locally
npm run typecheck       # TypeScript validation
```

## Output Format

### Per-Provider (`data/providers/{provider}/models.json`)
```json
{
  "provider": "gitee",
  "updatedAt": "2026-04-29T12:00:00.000Z",
  "totalModels": 42,
  "models": [...]
}
```

### Aggregated (`data/models.json`)
```json
{
  "updatedAt": "2026-04-29T12:00:00.000Z",
  "totalModels": 150,
  "providers": ["gitee", "xunfei", "nvidia", "google"],
  "models": [...]
}
```
