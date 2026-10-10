# LLM7.io

> 本文档由 `npm run generate-docs` 根据 `data/models.json` 自动生成。

## 接入信息

| 项目 | 内容 |
|---|---|
| 内部 Provider ID | `llm7` |
| 官网 | [https://llm7.io](https://llm7.io) |
| 注册/登录 | [https://dash.llm7.io](https://dash.llm7.io) |
| 控制台 | [https://dash.llm7.io](https://dash.llm7.io) |
| API Key | [https://dash.llm7.io](https://dash.llm7.io) |
| 官方文档 | [https://docs.llm7.io/limits](https://docs.llm7.io/limits) |
| 模型/价格 | [https://docs.llm7.io/guides/models-api](https://docs.llm7.io/guides/models-api) |
| API Base URL | `https://api.llm7.io/v1` |
| 鉴权方式 | bearer |
| 环境变量 | `LLM7_API_KEY` |

## 当前统计

| 指标 | 数量 |
|---|---:|
| 总模型 | 7 |
| 免费模型 | 6 |
| 付费可试用 | 0 |

## 免费策略

turbo 层模型可用免费 token 调用（在 dash.llm7.io 注册领取，无需付费）：100,000 tokens/24 小时，60 requests/分钟、250 requests/小时；官方声明免费额度可能随时下调。表内价格是按 token 计费费率。

## 当前免费模型

| Provider | Model ID | 名称 | 上下文 | 免费类型 | 限制 |
|---|---|---|---:|---|---|
| llm7  | `codestral-latest` | codestral-latest | 32K | 日 token 配额 | 60 RPM / 100,000 tokens/天 / Free API token from dash.llm7.io (signup required, no payment). 100,000 tokens per 24 hours across input+output 60 requests per minute, 250 per hour. Official docs warn the free-token quota may be reduced without notice. price_input/price_output are LLM7 paid-usage rates (USD per 1M tokens), not what the free tier costs. |
| llm7  | `DeepSeek-V4-Flash-0731` | DeepSeek-V4-Flash-0731 | 400K | 日 token 配额 | 60 RPM / 100,000 tokens/天 / Free API token from dash.llm7.io (signup required, no payment). 100,000 tokens per 24 hours across input+output 60 requests per minute, 250 per hour. Official docs warn the free-token quota may be reduced without notice. price_input/price_output are LLM7 paid-usage rates (USD per 1M tokens), not what the free tier costs. |
| llm7  | `GLM-5.3-Flash` | GLM-5.3-Flash | 400K | 日 token 配额 | 60 RPM / 100,000 tokens/天 / Free API token from dash.llm7.io (signup required, no payment). 100,000 tokens per 24 hours across input+output 60 requests per minute, 250 per hour. Official docs warn the free-token quota may be reduced without notice. price_input/price_output are LLM7 paid-usage rates (USD per 1M tokens), not what the free tier costs. |
| llm7  | `gpt-oss:20b` | gpt-oss:20b | 128K | 日 token 配额 | 60 RPM / 100,000 tokens/天 / Free API token from dash.llm7.io (signup required, no payment). 100,000 tokens per 24 hours across input+output 60 requests per minute, 250 per hour. Official docs warn the free-token quota may be reduced without notice. price_input/price_output are LLM7 paid-usage rates (USD per 1M tokens), not what the free tier costs. |
| llm7  | `mistral-Nemo-Instruct-2407` | mistral-Nemo-Instruct-2407 | 128K | 日 token 配额 | 60 RPM / 100,000 tokens/天 / Free API token from dash.llm7.io (signup required, no payment). 100,000 tokens per 24 hours across input+output 60 requests per minute, 250 per hour. Official docs warn the free-token quota may be reduced without notice. price_input/price_output are LLM7 paid-usage rates (USD per 1M tokens), not what the free tier costs. |
| llm7  | `nemotron-3-nano:30b` | nemotron-3-nano:30b | 1M | 日 token 配额 | 60 RPM / 100,000 tokens/天 / Free API token from dash.llm7.io (signup required, no payment). 100,000 tokens per 24 hours across input+output 60 requests per minute, 250 per hour. Official docs warn the free-token quota may be reduced without notice. price_input/price_output are LLM7 paid-usage rates (USD per 1M tokens), not what the free tier costs. |
