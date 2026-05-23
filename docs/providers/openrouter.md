# OpenRouter

> 本文档由 `npm run generate-docs` 根据 `data/models.json` 自动生成。

## 接入信息

| 项目 | 内容 |
|---|---|
| 内部 Provider ID | `openrouter` |
| 官网 | [https://openrouter.ai](https://openrouter.ai) |
| 注册/登录 | [https://openrouter.ai](https://openrouter.ai) |
| 控制台 | [https://openrouter.ai/settings](https://openrouter.ai/settings) |
| API Key | [https://openrouter.ai/settings/keys](https://openrouter.ai/settings/keys) |
| 官方文档 | [https://openrouter.ai/docs](https://openrouter.ai/docs) |
| 模型/价格 | [https://openrouter.ai/models?max_price=0](https://openrouter.ai/models?max_price=0) |
| API Base URL | `https://openrouter.ai/api/v1` |
| 鉴权方式 | bearer |
| 环境变量 | `OPENROUTER_API_KEY` |

## 当前统计

| 指标 | 数量 |
|---|---:|
| 总模型 | 25 |
| 免费模型 | 25 |
| 付费可试用 | 0 |

## 免费策略

免费模型通常带有请求频率或每日请求限制。

## 当前免费模型

| Provider | Model ID | 名称 | 上下文 | 免费类型 | 限制 |
|---|---|---|---:|---|---|
| openrouter  | `openrouter/arcee-ai/trinity-large-thinking` | Arcee AI: Trinity Large Thinking (free) | 262K | 限速免费 | Free tier with rate limits (see openrouter.ai) |
| openrouter  | `openrouter/baidu/cobuddy` | Baidu Qianfan: CoBuddy (free) | 131K | 限速免费 | Free tier with rate limits (see openrouter.ai) |
| openrouter  | `openrouter/cognitivecomputations/dolphin-mistral-24b-venice-edition` | Venice: Uncensored (free) | 33K | 限速免费 | 8 RPM / Free tier: 8 req/min (per endpoint, basic account) |
| openrouter  | `openrouter/deepseek/deepseek-v4-flash` | DeepSeek: DeepSeek V4 Flash (free) | 1M | 限速免费 | Free tier with rate limits (see openrouter.ai) |
| openrouter  | `openrouter/google/gemma-4-26b-a4b-it` | Google: Gemma 4 26B A4B  (free) | 262K | 限速免费 | Free tier with rate limits (see openrouter.ai) |
| openrouter  | `openrouter/google/gemma-4-31b-it` | Google: Gemma 4 31B (free) | 262K | 限速免费 | Free tier with rate limits (see openrouter.ai) |
| openrouter  | `openrouter/liquid/lfm-2.5-1.2b-instruct` | LiquidAI: LFM2.5-1.2B-Instruct (free) | 33K | 限速免费 | Free tier with rate limits (see openrouter.ai) |
| openrouter  | `openrouter/liquid/lfm-2.5-1.2b-thinking` | LiquidAI: LFM2.5-1.2B-Thinking (free) | 33K | 限速免费 | Free tier with rate limits (see openrouter.ai) |
| openrouter  | `openrouter/meta-llama/llama-3.2-3b-instruct` | Meta: Llama 3.2 3B Instruct (free) | 131K | 限速免费 | 8 RPM / Free tier: 8 req/min (per endpoint, basic account) |
| openrouter  | `openrouter/meta-llama/llama-3.3-70b-instruct` | Meta: Llama 3.3 70B Instruct (free) | 131K | 限速免费 | 8 RPM / Free tier: 8 req/min (per endpoint, basic account) |
| openrouter  | `openrouter/minimax/minimax-m2.5` | MiniMax: MiniMax M2.5 (free) | 205K | 限速免费 | 10000 RPD / Free tier: 10000 req/day (per endpoint, basic account) |
| openrouter  | `openrouter/nousresearch/hermes-3-llama-3.1-405b` | Nous: Hermes 3 405B Instruct (free) | 131K | 限速免费 | 8 RPM / Free tier: 8 req/min (per endpoint, basic account) |
| openrouter  | `openrouter/nvidia/nemotron-3-nano-30b-a3b` | NVIDIA: Nemotron 3 Nano 30B A3B (free) | 256K | 限速免费 | Free tier with rate limits (see openrouter.ai) |
| openrouter  | `openrouter/nvidia/nemotron-3-nano-omni-30b-a3b-reasoning` | NVIDIA: Nemotron 3 Nano Omni (free) | 256K | 限速免费 | Free tier with rate limits (see openrouter.ai) |
| openrouter  | `openrouter/nvidia/nemotron-3-super-120b-a12b` | NVIDIA: Nemotron 3 Super (free) | 1M | 限速免费 | Free tier with rate limits (see openrouter.ai) |
| openrouter  | `openrouter/nvidia/nemotron-nano-12b-v2-vl` | NVIDIA: Nemotron Nano 12B 2 VL (free) | 128K | 限速免费 | Free tier with rate limits (see openrouter.ai) |
| openrouter  | `openrouter/nvidia/nemotron-nano-9b-v2` | NVIDIA: Nemotron Nano 9B V2 (free) | 128K | 限速免费 | 50 RPM / Free tier: 50 req/min (per endpoint, basic account) |
| openrouter  | `openrouter/openai/gpt-oss-120b` | OpenAI: gpt-oss-120b (free) | 131K | 限速免费 | 5000 RPD / Free tier: 5000 req/day (per endpoint, basic account) |
| openrouter  | `openrouter/openai/gpt-oss-20b` | OpenAI: gpt-oss-20b (free) | 131K | 限速免费 | 10000 RPD / Free tier: 10000 req/day (per endpoint, basic account) |
| openrouter  | `openrouter/openrouter/owl-alpha` | Owl Alpha | 1M | 限速免费 | Free tier with rate limits (see openrouter.ai) |
| openrouter  | `openrouter/poolside/laguna-m.1` | Poolside: Laguna M.1 (free) | 131K | 限速免费 | Free tier with rate limits (see openrouter.ai) |
| openrouter  | `openrouter/poolside/laguna-xs.2` | Poolside: Laguna XS.2 (free) | 131K | 限速免费 | Free tier with rate limits (see openrouter.ai) |
| openrouter  | `openrouter/qwen/qwen3-coder` | Qwen: Qwen3 Coder 480B A35B (free) | 1M | 限速免费 | 8 RPM / Free tier: 8 req/min (per endpoint, basic account) |
| openrouter  | `openrouter/qwen/qwen3-next-80b-a3b-instruct` | Qwen: Qwen3 Next 80B A3B Instruct (free) | 262K | 限速免费 | 8 RPM / Free tier: 8 req/min (per endpoint, basic account) |
| openrouter  | `openrouter/z-ai/glm-4.5-air` | Z.ai: GLM 4.5 Air (free) | 131K | 限速免费 | Free tier with rate limits (see openrouter.ai) |
