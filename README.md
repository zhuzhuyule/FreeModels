# Model Hub

Multi-Provider Model Aggregation Hub with Intelligent Caching and Pre-computed Views

## Architecture

```
scripts/hub/
├── aggregator.ts        # Main orchestration (auto-discovers providers)
├── enhancer.ts          # Capability inference (tags, reasoning, multimodal)
├── evaluator.ts         # Cache management, view building, output
├── types.ts            # Shared TypeScript interfaces
└── providers/           # Provider plugins (auto-discovered)
    ├── gitee/index.ts
    ├── xunfei/index.ts
    ├── nvidia/index.ts
    ├── google/index.ts
    └── {new-provider}/index.ts   # Just add a new directory!

website/                 # Static site (optional)
├── index.html
├── styles.css
└── app.js

data/
├── providers/           # Per-provider outputs
│   ├── gitee/models.json
│   ├── xunfei/models.json
│   ├── nvidia/models.json
│   └── google/models.json
├── views/              # Pre-computed filtered views
│   ├── all/models.json         # All models
│   ├── free/models.json        # Free tier only
│   ├── reasoning/models.json   # Reasoning models
│   └── multimodal/models.json  # Vision/multimodal models
├── capability-cache.json  # Persistent capability cache
└── models.json          # Aggregated output with metadata
```

## Output Structure

### Aggregated (`data/models.json`)
```json
{
  "updatedAt": "2026-04-29T12:00:00.000Z",
  "totalModels": 150,
  "providers": ["gitee", "xunfei", "nvidia", "google"],
  "providerMeta": {
    "gitee": { "name": "gitee", "displayName": "Gitee AI", "website": "https://ai.gitee.com" },
    "nvidia": { "name": "nvidia", "displayName": "NVIDIA AI", "website": "https://developer.nvidia.com/ai" }
  },
  "views": ["all", "free", "reasoning", "multimodal"],
  "models": [
    {
      "vendor": "gitee",
      "modelId": "DeepSeek-R1",
      "name": "DeepSeek-R1",
      "provider": "gitee",
      "description": "DeepSeek's reasoning model...",
      "contextLabel": "128K",
      "billingMode": "free",
      "isReasoning": true,
      "isMultimodal": false,
      "tags": ["reasoning", "text-generation"],
      "priceInput": 0,
      "priceOutput": 0
    }
  ]
}
```

### Per-Provider (`data/providers/{provider}/models.json`)
```json
{
  "provider": "gitee",
  "updatedAt": "2026-04-29T12:00:00.000Z",
  "totalModels": 42,
  "models": [...]
}
```

### Pre-computed View (`data/views/{view}/models.json`)
```json
{
  "view": "free",
  "updatedAt": "2026-04-29T12:00:00.000Z",
  "totalModels": 25,
  "filters": { "billingMode": "free" },
  "models": [...]
}
```

## Adding a New Provider

1. Create directory: `scripts/hub/providers/{provider-name}/`
2. Create `index.ts`:

```typescript
import type { RawModelData, ProviderPlugin } from '../../types.js';

async function fetchModels(): Promise<RawModelData[]> {
  // Fetch from your provider's API
  // Return array of RawModelData with vendor field set to your provider name
}

export const fetchModels: ProviderPlugin = fetchModels;
```

3. Run `npm run sync-models`

The provider is auto-discovered and outputs appear in:
- `data/providers/{provider-name}/models.json`
- `data/models.json` (aggregated)
- `data/views/*/models.json` (filtered views)

## Capability Enhancement

The `enhancer.ts` automatically infers:

| Property | Description |
|----------|-------------|
| tags | reasoning, text-generation, multimodal, etc. |
| isReasoning | Detected from name/description keywords |
| isMultimodal | Detected from vision-related keywords |
| contextLabel | Normalized: 128K, 1M, etc. |
| billingMode | free / pay / mixed |

## Cache Strategy

| Property | Cached | Notes |
|----------|--------|-------|
| tags, isReasoning, isMultimodal | Yes | Persisted in `capability-cache.json` |
| contextSize (label) | Yes | Normalized value cached |
| description | Yes | Updated if provider provides better |
| price, isFree, billingMode | No | Always recalculated |

## Commands

```bash
npm install              # Install dependencies
npm run sync-models     # Run aggregation locally
npm run typecheck       # TypeScript validation
```

## Static Site

Open `website/index.html` in a browser (or serve with any static server).

Features:
- View all / free / reasoning / multimodal models
- Search by name, ID, description, or tags
- Filter by provider
- Displays provider info, pricing, context size, capabilities

To serve locally:
```bash
npx serve website
# or
cd website && python -m http.server 8080
```
