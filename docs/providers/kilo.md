# Kilo Code Gateway

> 本文档由 `npm run generate-docs` 根据 `data/models.json` 自动生成。

## 接入信息

| 项目 | 内容 |
|---|---|
| 内部 Provider ID | `kilo` |
| 官网 | [https://kilo.ai](https://kilo.ai) |
| 注册/登录 | [https://app.kilo.ai](https://app.kilo.ai) |
| 控制台 | [https://app.kilo.ai](https://app.kilo.ai) |
| API Key | — |
| 官方文档 | [https://kilo.ai/docs/gateway/models-and-providers](https://kilo.ai/docs/gateway/models-and-providers) |
| 模型/价格 | [https://kilo.ai/models](https://kilo.ai/models) |
| API Base URL | `https://api.kilo.ai/api/gateway` |
| 鉴权方式 | none |
| 环境变量 | — |

## 当前统计

| 指标 | 数量 |
|---|---:|
| 总模型 | 16 |
| 免费模型 | 16 |
| 付费可试用 | 0 |

## 免费策略

官方目录中标记 isFree 的模型对匿名请求开放（无需 API key / 注册）：每 IP 200 requests/小时。免费路由可能记录 prompt 用于训练，见每条记录的 may_train_on_your_prompts。

## 当前免费模型

| Provider | Model ID | 名称 | 上下文 | 免费类型 | 限制 |
|---|---|---|---:|---|---|
| kilo  | `cohere/north-mini-code:free` | Cohere: North Mini Code (free) | 256K | 限速免费 | 200 requests per hour per IP (anonymous, no API key required) |
| kilo  | `dots-studio/dots-3-note-preview:free` | Dots Studio: Dots3-Note Preview (free) | 512K | 限速免费 | 200 requests per hour per IP (anonymous, no API key required) |
| kilo  | `inclusionai/ling-3.1-flash` | inclusionAI: Ling 3.1 Flash | 262K | 限速免费 | 200 requests per hour per IP (anonymous, no API key required) |
| kilo  | `kilo-auto/free` | Auto Free | 256K | 限速免费 | 200 requests per hour per IP (anonymous, no API key required) |
| kilo  | `liquid/lfm-2.5-2.6b:free` | LiquidAI: LFM2.5-2.6B (free) | 66K | 限速免费 | 200 requests per hour per IP (anonymous, no API key required) |
| kilo  | `nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free` | NVIDIA: Nemotron 3 Nano Omni (free) | 256K | 限速免费 | 200 requests per hour per IP (anonymous, no API key required) |
| kilo  | `nvidia/nemotron-3-super-120b-a12b:free` | NVIDIA: Nemotron 3 Super (free) | 262K | 限速免费 | 200 requests per hour per IP (anonymous, no API key required) |
| kilo  | `nvidia/nemotron-3-ultra-550b-a55b:free` | NVIDIA: Nemotron 3 Ultra (free) | 1M | 限速免费 | 200 requests per hour per IP (anonymous, no API key required) |
| kilo  | `nvidia/nemotron-3.5-content-safety:free` | NVIDIA: Nemotron 3.5 Content Safety (free) | 128K | 限速免费 | 200 requests per hour per IP (anonymous, no API key required) |
| kilo  | `nvidia/nemotron-3.5-lightning:free` | NVIDIA: Nemotron 3.5 Lightning (free) | 1M | 限速免费 | 200 requests per hour per IP (anonymous, no API key required) |
| kilo  | `openrouter/free` | OpenRouter Free Models Router | 200K | 限速免费 | 200 requests per hour per IP (anonymous, no API key required) |
| kilo  | `poolside/laguna-s-2.1:free` | Poolside: Laguna S 2.1 (free) | 262K | 限速免费 | 200 requests per hour per IP (anonymous, no API key required) |
| kilo  | `poolside/laguna-xs-2.1:free` | Poolside: Laguna XS 2.1 (free) | 262K | 限速免费 | 200 requests per hour per IP (anonymous, no API key required) |
| kilo  | `stealth/glyph-cluster` | Stealth: Glyph Cluster (free) | 256K | 限速免费 | 200 requests per hour per IP (anonymous, no API key required) |
| kilo  | `stepfun/step-5-preview-free` | StepFun: Step 5 Preview (free) | 1M | 限速免费 | 200 requests per hour per IP (anonymous, no API key required) |
| kilo  | `thinkingmachines/inkling-small:free` | Thinking Machines: Inkling Small (free) | 1M | 限速免费 | 200 requests per hour per IP (anonymous, no API key required) |
