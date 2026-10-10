# OVHcloud AI Endpoints

> 本文档由 `npm run generate-docs` 根据 `data/models.json` 自动生成。

## 接入信息

| 项目 | 内容 |
|---|---|
| 内部 Provider ID | `ovh` |
| 官网 | [https://www.ovhcloud.com/en-gb/public-cloud/ai-endpoints/](https://www.ovhcloud.com/en-gb/public-cloud/ai-endpoints/) |
| 注册/登录 | [https://www.ovhcloud.com/en-gb/public-cloud/ai-endpoints/](https://www.ovhcloud.com/en-gb/public-cloud/ai-endpoints/) |
| 控制台 | — |
| API Key | — |
| 官方文档 | [https://docs.ovhcloud.com/en/guides/public-cloud/ai-machine-learning/ai-endpoints-getting-started](https://docs.ovhcloud.com/en/guides/public-cloud/ai-machine-learning/ai-endpoints-getting-started) |
| 模型/价格 | [https://www.ovhcloud.com/en-gb/public-cloud/ai-endpoints/catalog/](https://www.ovhcloud.com/en-gb/public-cloud/ai-endpoints/catalog/) |
| API Base URL | `https://oai.endpoints.kepler.ai.cloud.ovh.net/v1` |
| 鉴权方式 | none |
| 环境变量 | — |

## 当前统计

| 指标 | 数量 |
|---|---:|
| 总模型 | 23 |
| 免费模型 | 23 |
| 付费可试用 | 0 |

## 免费策略

目录内模型支持匿名调用（无需注册、无需 API key）：每 IP 每模型 2 requests/分钟。带 API key 走 Public Cloud 按 token 计费（400 RPM/项目），表内 price_input/price_output 是该付费费率，不是匿名档费用。

## 当前免费模型

| Provider | Model ID | 名称 | 上下文 | 免费类型 | 限制 |
|---|---|---|---:|---|---|
| ovh  | `bge-m3` | bge-m3 | 8K | 限速免费 | 2 RPM / Anonymous access (no API key, no signup): 2 requests per minute, per IP and per model. With an API key the same models are billed pay-as-you-go per token (400 RPM per project) — price_input/price_output are those rates, not what the anonymous tier costs. |
| ovh  | `bge-multilingual-gemma2` | bge-multilingual-gemma2 | 8K | 限速免费 | 2 RPM / Anonymous access (no API key, no signup): 2 requests per minute, per IP and per model. With an API key the same models are billed pay-as-you-go per token (400 RPM per project) — price_input/price_output are those rates, not what the anonymous tier costs. |
| ovh  | `gpt-oss-120b` | gpt-oss-120b | 131K | 限速免费 | 2 RPM / Anonymous access (no API key, no signup): 2 requests per minute, per IP and per model. With an API key the same models are billed pay-as-you-go per token (400 RPM per project) — price_input/price_output are those rates, not what the anonymous tier costs. |
| ovh  | `gpt-oss-20b` | gpt-oss-20b | 131K | 限速免费 | 2 RPM / Anonymous access (no API key, no signup): 2 requests per minute, per IP and per model. With an API key the same models are billed pay-as-you-go per token (400 RPM per project) — price_input/price_output are those rates, not what the anonymous tier costs. |
| ovh  | `Meta-Llama-3_3-70B-Instruct` | Meta-Llama-3_3-70B-Instruct | 131K | 限速免费 | 2 RPM / Anonymous access (no API key, no signup): 2 requests per minute, per IP and per model. With an API key the same models are billed pay-as-you-go per token (400 RPM per project) — price_input/price_output are those rates, not what the anonymous tier costs. |
| ovh  | `Mistral-7B-Instruct-v0.3` | Mistral-7B-Instruct-v0.3 | 66K | 限速免费 | 2 RPM / Anonymous access (no API key, no signup): 2 requests per minute, per IP and per model. With an API key the same models are billed pay-as-you-go per token (400 RPM per project) — price_input/price_output are those rates, not what the anonymous tier costs. |
| ovh  | `Mistral-Nemo-Instruct-2407` | Mistral-Nemo-Instruct-2407 | 66K | 限速免费 | 2 RPM / Anonymous access (no API key, no signup): 2 requests per minute, per IP and per model. With an API key the same models are billed pay-as-you-go per token (400 RPM per project) — price_input/price_output are those rates, not what the anonymous tier costs. |
| ovh  | `Mistral-Small-3.2-24B-Instruct-2506` | Mistral-Small-3.2-24B-Instruct-2506 | 131K | 限速免费 | 2 RPM / Anonymous access (no API key, no signup): 2 requests per minute, per IP and per model. With an API key the same models are billed pay-as-you-go per token (400 RPM per project) — price_input/price_output are those rates, not what the anonymous tier costs. |
| ovh  | `nvr-tts-de-de` | nvr-tts-de-de | unknown | 限速免费 | 2 RPM / Anonymous access (no API key, no signup): 2 requests per minute, per IP and per model. With an API key the same models are billed pay-as-you-go per token (400 RPM per project) — price_input/price_output are those rates, not what the anonymous tier costs. |
| ovh  | `nvr-tts-en-us` | nvr-tts-en-us | unknown | 限速免费 | 2 RPM / Anonymous access (no API key, no signup): 2 requests per minute, per IP and per model. With an API key the same models are billed pay-as-you-go per token (400 RPM per project) — price_input/price_output are those rates, not what the anonymous tier costs. |
| ovh  | `nvr-tts-es-es` | nvr-tts-es-es | unknown | 限速免费 | 2 RPM / Anonymous access (no API key, no signup): 2 requests per minute, per IP and per model. With an API key the same models are billed pay-as-you-go per token (400 RPM per project) — price_input/price_output are those rates, not what the anonymous tier costs. |
| ovh  | `nvr-tts-it-it` | nvr-tts-it-it | unknown | 限速免费 | 2 RPM / Anonymous access (no API key, no signup): 2 requests per minute, per IP and per model. With an API key the same models are billed pay-as-you-go per token (400 RPM per project) — price_input/price_output are those rates, not what the anonymous tier costs. |
| ovh  | `Qwen2.5-VL-72B-Instruct` | Qwen2.5-VL-72B-Instruct | 33K | 限速免费 | 2 RPM / Anonymous access (no API key, no signup): 2 requests per minute, per IP and per model. With an API key the same models are billed pay-as-you-go per token (400 RPM per project) — price_input/price_output are those rates, not what the anonymous tier costs. |
| ovh  | `Qwen3-Embedding-8B` | Qwen3-Embedding-8B | 33K | 限速免费 | 2 RPM / Anonymous access (no API key, no signup): 2 requests per minute, per IP and per model. With an API key the same models are billed pay-as-you-go per token (400 RPM per project) — price_input/price_output are those rates, not what the anonymous tier costs. |
| ovh  | `Qwen3.5-397B-A17B` | Qwen3.5-397B-A17B | 262K | 限速免费 | 2 RPM / Anonymous access (no API key, no signup): 2 requests per minute, per IP and per model. With an API key the same models are billed pay-as-you-go per token (400 RPM per project) — price_input/price_output are those rates, not what the anonymous tier costs. |
| ovh  | `Qwen3.5-9B` | Qwen3.5-9B | 262K | 限速免费 | 2 RPM / Anonymous access (no API key, no signup): 2 requests per minute, per IP and per model. With an API key the same models are billed pay-as-you-go per token (400 RPM per project) — price_input/price_output are those rates, not what the anonymous tier costs. |
| ovh  | `Qwen3.6-27B` | Qwen3.6-27B | 262K | 限速免费 | 2 RPM / Anonymous access (no API key, no signup): 2 requests per minute, per IP and per model. With an API key the same models are billed pay-as-you-go per token (400 RPM per project) — price_input/price_output are those rates, not what the anonymous tier costs. |
| ovh  | `Qwen3.8-27B` | Qwen3.8-27B | 262K | 限速免费 | 2 RPM / Anonymous access (no API key, no signup): 2 requests per minute, per IP and per model. With an API key the same models are billed pay-as-you-go per token (400 RPM per project) — price_input/price_output are those rates, not what the anonymous tier costs. |
| ovh  | `Qwen3Guard-Gen-0.6B` | Qwen3Guard-Gen-0.6B | 33K | 限速免费 | 2 RPM / Anonymous access (no API key, no signup): 2 requests per minute, per IP and per model. With an API key the same models are billed pay-as-you-go per token (400 RPM per project) — price_input/price_output are those rates, not what the anonymous tier costs. |
| ovh  | `Qwen3Guard-Gen-8B` | Qwen3Guard-Gen-8B | 33K | 限速免费 | 2 RPM / Anonymous access (no API key, no signup): 2 requests per minute, per IP and per model. With an API key the same models are billed pay-as-you-go per token (400 RPM per project) — price_input/price_output are those rates, not what the anonymous tier costs. |
| ovh  | `stable-diffusion-xl-base-v10` | stable-diffusion-xl-base-v10 | unknown | 限速免费 | 2 RPM / Anonymous access (no API key, no signup): 2 requests per minute, per IP and per model. With an API key the same models are billed pay-as-you-go per token (400 RPM per project) — price_input/price_output are those rates, not what the anonymous tier costs. |
| ovh  | `whisper-large-v3` | whisper-large-v3 | unknown | 限速免费 | 2 RPM / Anonymous access (no API key, no signup): 2 requests per minute, per IP and per model. With an API key the same models are billed pay-as-you-go per token (400 RPM per project) — price_input/price_output are those rates, not what the anonymous tier costs. |
| ovh  | `whisper-large-v3-turbo` | whisper-large-v3-turbo | unknown | 限速免费 | 2 RPM / Anonymous access (no API key, no signup): 2 requests per minute, per IP and per model. With an API key the same models are billed pay-as-you-go per token (400 RPM per project) — price_input/price_output are those rates, not what the anonymous tier costs. |
