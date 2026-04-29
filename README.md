# Model Hub

Multi-Provider Model Aggregation Hub with Intelligent Caching

## Architecture

```
scripts/hub/
├── aggregator.ts       # Main orchestration engine
├── evaluator.ts        # Capability cache & dynamic pricing evaluation
├── types.ts            # Shared TypeScript interfaces
└── providers/
    ├── index.ts        # Provider exports
    ├── gitee.ts        # Gitee AI models
    ├── xunfei.ts       # iFlytek models
    ├── nvidia.ts       # NVIDIA AI models
    └── google.ts       # Google AI models
```

## Capability Cache

Static properties (tags, reasoning, context size) are cached in `data/capability-cache.json`.

Dynamic properties (pricing, free tier status) are always recalculated.

## Commands

```bash
npm install
npm run sync-models    # Run aggregation locally
```
