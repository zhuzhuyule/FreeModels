# Model Hub

Multi-Provider Model Aggregation Hub with Intelligent Caching and Analysis

## Architecture

```
scripts/hub/
├── aggregator.ts        # Main orchestration (auto-discovers providers)
├── enhancer.ts         # Capability inference
├── evaluator.ts        # Cache management, view building, output
├── analyzer.ts         # Model profiling: tier, speed, performance
├── types.ts            # Shared TypeScript interfaces
└── providers/          # Provider plugins (auto-discovered)
    ├── gitee/index.ts
    ├── xunfei/index.ts
    ├── nvidia/index.ts
    ├── google/index.ts
    └── {new-provider}/index.ts

website/
├── index.html          # Production UI
├── dev.html            # Dev UI with all filters
├── styles.css
└── app.js

data/
├── providers/{provider}/models.json   # Per-provider outputs
├── views/              # Pre-computed filtered views
│   ├── all/models.json
│   ├── free/models.json
│   ├── reasoning/models.json
│   ├── multimodal/models.json
│   ├── tool-use/models.json
│   ├── fast/models.json
│   ├── premium/models.json
│   ├── small/models.json
│   └── large/models.json
├── capability-cache.json
└── models.json

.github/workflows/daily-model-sync.yml
```

## Model Analysis

Each model is analyzed with:

| Field | Description | Values |
|-------|-------------|--------|
| tier | Model size based on parameters | small (<3B), medium (3-20B), large (20-70B), xlarge (>70B) |
| speed | Speed tier based on pricing and model type | fast, standard, premium |
| performanceLevel | Comprehensive scoring | entry, mid, high, enterprise |
| estimatedLatency | Expected response time | < 1s, 1-3s, 3-10s |
| parameterCount | Extracted from model name | e.g., 72000000000 for 72B |
| useCase | Inferred use cases | content-creation, semantic-search, etc. |

## Cache Strategy

| Property | Cached | Notes |
|----------|--------|-------|
| tags, isReasoning, isMultimodal, hasToolUse | Yes | Persisted in `capability-cache.json` |
| tier, performanceLevel | Yes | Based on model name and capabilities |
| contextSize (label) | Yes | Normalized value cached |
| description | Yes | Updated if provider provides better |
| price, isFree, billingMode | No | Always recalculated from latest data |

## Adding a New Provider

1. Create directory: `scripts/hub/providers/{provider-name}/`
2. Create `index.ts`:

```typescript
import type { RawModelData, ProviderPlugin } from '../../types.js';

async function fetchModels(): Promise<RawModelData[]> {
  // Fetch from your provider's API
  // Return array of RawModelData with vendor field set to your provider name
  return [{
    vendor: 'provider-name',
    modelId: 'model-id',
    name: 'Model Name',
    description: '...',
    contextSize: 32000,
    priceInput: 0.000001,
    priceOutput: 0.000002,
    isFree: false,
    capabilities: ['chat', 'text-generation'],
    metadata: {},
  }];
}

export const fetchModels: ProviderPlugin = fetchModels;
```

3. Run `npm run sync-models`

## Commands

```bash
npm install              # Install dependencies
npm run sync-models     # Run aggregation locally
npm run sync-models -- --provider=gitee  # Run specific provider
npm run typecheck       # TypeScript validation
```

## Development Server

```bash
# Serve the website
npx serve website

# Or open directly (after running sync-models)
open website/dev.html?view=free  # View free models only
open website/dev.html?view=all   # View all models
```

## Dev Page Features

The `website/dev.html` page provides:
- Search by name, description, model ID
- Filter by provider, tier, speed, billing, reasoning, tool_use
- Sortable columns (click header to sort)
- Real-time filtering

## Output Format

```json
{
  "vendor": "gitee",
  "modelId": "Qwen2.5-72B-Instruct",
  "name": "Qwen2.5-72B-Instruct",
  "description": "...",
  "contextSize": 32000,
  "contextLabel": "32K",
  "isFree": false,
  "billingMode": "pay",
  "capabilities": ["text-generation", "tool_use", "function_calling"],
  "tags": ["text-generation", "tool_use", "function_calling"],
  "isReasoning": false,
  "isMultimodal": false,
  "hasToolUse": true,
  "parameterCount": 72000000000,
  "tier": "large",
  "speed": "standard",
  "useCase": ["content-creation", "writing-assistance", "agentic-tasks"],
  "performanceLevel": "mid",
  "estimatedLatency": "3-10s"
}
```
