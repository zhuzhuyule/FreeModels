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
| 总模型 | 19 |
| 免费模型 | 19 |
| 付费可试用 | 0 |

## 免费策略

免费模型通常带有请求频率或每日请求限制。

## 当前免费模型

| Provider | Model ID | 名称 | 上下文 | 免费类型 | 限制 |
|---|---|---|---:|---|---|
| openrouter  | `apodex/apodex-1.1-mini:free` | Apodex: Apodex 1.1 Mini (free) | 262K | 限速免费 | 20 RPM / 50 RPD / Free-variant limit is 20 RPM and 50 requests/day; a one-time purchase of 10+ USD credits raises the daily ceiling to 1000. Providers may log prompts for training on free routes. |
| openrouter  | `cohere/north-mini-code:free` | Cohere: North Mini Code (free) | 256K | 限速免费 | 20 RPM / 50 RPD / Free-variant limit is 20 RPM and 50 requests/day; a one-time purchase of 10+ USD credits raises the daily ceiling to 1000. Providers may log prompts for training on free routes. |
| openrouter  | `dots-studio/dots-3-note-preview:free` | Dots Studio: Dots3-Note Preview (free) | 512K | 限速免费 | 20 RPM / 50 RPD / Free-variant limit is 20 RPM and 50 requests/day; a one-time purchase of 10+ USD credits raises the daily ceiling to 1000. Providers may log prompts for training on free routes. |
| openrouter  | `free` | Free Models Router | 200K | 限速免费 | 20 RPM / 50 RPD / Free-variant limit is 20 RPM and 50 requests/day; a one-time purchase of 10+ USD credits raises the daily ceiling to 1000. Providers may log prompts for training on free routes. |
| openrouter  | `google/gemma-4-26b-a4b-it:free` | Google: Gemma 4 26B A4B  (free) | 262K | 限速免费 | 20 RPM / 50 RPD / Free-variant limit is 20 RPM and 50 requests/day; a one-time purchase of 10+ USD credits raises the daily ceiling to 1000. Providers may log prompts for training on free routes. |
| openrouter  | `google/gemma-4-31b-it:free` | Google: Gemma 4 31B (free) | 262K | 限速免费 | 20 RPM / 50 RPD / Free-variant limit is 20 RPM and 50 requests/day; a one-time purchase of 10+ USD credits raises the daily ceiling to 1000. Providers may log prompts for training on free routes. |
| openrouter  | `google/lyria-3-clip-preview` | Google: Lyria 3 Clip Preview | 1M | 限速免费 | 20 RPM / 50 RPD / Free-variant limit is 20 RPM and 50 requests/day; a one-time purchase of 10+ USD credits raises the daily ceiling to 1000. Providers may log prompts for training on free routes. |
| openrouter  | `google/lyria-3-pro-preview` | Google: Lyria 3 Pro Preview | 1M | 限速免费 | 20 RPM / 50 RPD / Free-variant limit is 20 RPM and 50 requests/day; a one-time purchase of 10+ USD credits raises the daily ceiling to 1000. Providers may log prompts for training on free routes. |
| openrouter  | `inclusionai/ling-3.1-flash` | inclusionAI: Ling 3.1 Flash | 262K | 限速免费 | 20 RPM / 50 RPD / Free-variant limit is 20 RPM and 50 requests/day; a one-time purchase of 10+ USD credits raises the daily ceiling to 1000. Providers may log prompts for training on free routes. |
| openrouter  | `liquid/lfm-2.5-2.6b:free` | LiquidAI: LFM2.5-2.6B (free) | 66K | 限速免费 | 20 RPM / 50 RPD / Free-variant limit is 20 RPM and 50 requests/day; a one-time purchase of 10+ USD credits raises the daily ceiling to 1000. Providers may log prompts for training on free routes. |
| openrouter  | `nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free` | NVIDIA: Nemotron 3 Nano Omni (free) | 256K | 限速免费 | 20 RPM / 50 RPD / Free-variant limit is 20 RPM and 50 requests/day; a one-time purchase of 10+ USD credits raises the daily ceiling to 1000. Providers may log prompts for training on free routes. |
| openrouter  | `nvidia/nemotron-3-super-120b-a12b:free` | NVIDIA: Nemotron 3 Super (free) | 262K | 限速免费 | 20 RPM / 50 RPD / Free-variant limit is 20 RPM and 50 requests/day; a one-time purchase of 10+ USD credits raises the daily ceiling to 1000. Providers may log prompts for training on free routes. |
| openrouter  | `nvidia/nemotron-3-ultra-550b-a55b:free` | NVIDIA: Nemotron 3 Ultra (free) | 1M | 限速免费 | 20 RPM / 50 RPD / Free-variant limit is 20 RPM and 50 requests/day; a one-time purchase of 10+ USD credits raises the daily ceiling to 1000. Providers may log prompts for training on free routes. |
| openrouter  | `nvidia/nemotron-3.5-content-safety:free` | NVIDIA: Nemotron 3.5 Content Safety (free) | 128K | 限速免费 | 20 RPM / 50 RPD / Free-variant limit is 20 RPM and 50 requests/day; a one-time purchase of 10+ USD credits raises the daily ceiling to 1000. Providers may log prompts for training on free routes. |
| openrouter  | `nvidia/nemotron-3.5-lightning:free` | NVIDIA: Nemotron 3.5 Lightning (free) | 1M | 限速免费 | 20 RPM / 50 RPD / Free-variant limit is 20 RPM and 50 requests/day; a one-time purchase of 10+ USD credits raises the daily ceiling to 1000. Providers may log prompts for training on free routes. |
| openrouter  | `poolside/laguna-s-2.1:free` | Poolside: Laguna S 2.1 (free) | 262K | 限速免费 | 20 RPM / 50 RPD / Free-variant limit is 20 RPM and 50 requests/day; a one-time purchase of 10+ USD credits raises the daily ceiling to 1000. Providers may log prompts for training on free routes. |
| openrouter  | `poolside/laguna-xs-2.1:free` | Poolside: Laguna XS 2.1 (free) | 262K | 限速免费 | 20 RPM / 50 RPD / Free-variant limit is 20 RPM and 50 requests/day; a one-time purchase of 10+ USD credits raises the daily ceiling to 1000. Providers may log prompts for training on free routes. |
| openrouter  | `thinkingmachines/inkling-small:free` | Thinking Machines: Inkling Small (free) | 1M | 限速免费 | 20 RPM / 50 RPD / Free-variant limit is 20 RPM and 50 requests/day; a one-time purchase of 10+ USD credits raises the daily ceiling to 1000. Providers may log prompts for training on free routes. |
| openrouter  | `thinkingmachines/inkling:free` | Thinking Machines: Inkling (free) | 1M | 限速免费 | 20 RPM / 50 RPD / Free-variant limit is 20 RPM and 50 requests/day; a one-time purchase of 10+ USD credits raises the daily ceiling to 1000. Providers may log prompts for training on free routes. |
