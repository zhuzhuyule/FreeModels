# Provider 文档索引

> 本文档由 `npm run generate-docs` 自动生成。Provider 数据源与抓取细节以 `scripts/hub/providers/{name}/index.ts` 为准。

## Provider 支持情况

| Provider | 内部 ID | 总模型 | 免费 | 付费可试用 | 免费策略 | 注册 | API Key | 文档 | 数据 |
|---|---|---:|---:|---:|---|---|---|---|---|
| —  | `agnes` | 5 | 2 | 0 | — | — | — | — | [JSON](https://ofind.cn/FreeModels/data/providers/agnes/models.json) |
| [BigModel / 智谱 AI](https://open.bigmodel.cn)  | `bigmodel` | 57 | 10 | 0 | GLM Flash 等部分模型可免费使用，具体以官方价格页和控制台为准。 | [注册](https://open.bigmodel.cn) | [API Key](https://open.bigmodel.cn/usercenter/proj-mgmt/apikeys) | [文档](https://docs.bigmodel.cn) | [JSON](https://ofind.cn/FreeModels/data/providers/bigmodel/models.json) |
| [Cerebras](https://www.cerebras.ai)  | `cerebras` | 2 | 2 | 0 | 部分模型提供免费或限速使用，额度以官方控制台为准。 | [注册](https://cloud.cerebras.ai) | [API Key](https://cloud.cerebras.ai/platform/api-keys) | [文档](https://inference-docs.cerebras.ai) | [JSON](https://ofind.cn/FreeModels/data/providers/cerebras/models.json) |
| [Cloudflare Workers AI](https://developers.cloudflare.com/workers-ai)  | `cloudflare` | 69 | 62 | 0 | 账户级每日 10,000 neurons 免费额度，所有 Workers AI 模型共享。 | [注册](https://dash.cloudflare.com/sign-up) | [API Key](https://dash.cloudflare.com/profile/api-tokens) | [文档](https://developers.cloudflare.com/workers-ai) | [JSON](https://ofind.cn/FreeModels/data/providers/cloudflare/models.json) |
| [Cohere](https://cohere.com)  | `cohere` | 34 | 34 | 0 | Trial key 永久免费：20 RPM、1000 requests/月，所有模型共享配额。 | [注册](https://dashboard.cohere.com/welcome/register) | [API Key](https://dashboard.cohere.com/api-keys) | [文档](https://docs.cohere.com) | [JSON](https://ofind.cn/FreeModels/data/providers/cohere/models.json) |
| [Gitee AI](https://ai.gitee.com)  | `gitee` | 205 | 36 | 92 | 部分模型完全免费，另有一批模型允许体验。 | [注册](https://ai.gitee.com) | — | [文档](https://ai.gitee.com/docs) | [JSON](https://ofind.cn/FreeModels/data/providers/gitee/models.json) |
| [GitHub Models](https://github.com/marketplace/models)  | `github` | 37 | 37 | 0 | 按 Copilot 订阅层级（Free / Pro / Pro+ / Business / Enterprise）限速，免费层有较严格的 input/output token 限制。 | [注册](https://github.com/join) | [API Key](https://github.com/settings/tokens) | [文档](https://docs.github.com/en/github-models) | [JSON](https://ofind.cn/FreeModels/data/providers/github/models.json) |
| [Google AI](https://ai.google.dev)  | `google` | 38 | 22 | 0 | Gemini API 部分模型提供免费层，通常带有 RPM / RPD / TPM 限制。 | [注册](https://aistudio.google.com) | [API Key](https://aistudio.google.com/app/apikey) | [文档](https://ai.google.dev/gemini-api/docs) | [JSON](https://ofind.cn/FreeModels/data/providers/google/models.json) |
| [Groq](https://groq.com)  | `groq` | 11 | 11 | 0 | 常见为开发者免费额度或限速体验，具体以官方控制台和价格页为准。 | [注册](https://console.groq.com) | [API Key](https://console.groq.com/keys) | [文档](https://console.groq.com/docs) | [JSON](https://ofind.cn/FreeModels/data/providers/groq/models.json) |
| [Kilo Code Gateway](https://kilo.ai)  | `kilo` | 16 | 16 | 0 | 官方目录中标记 isFree 的模型对匿名请求开放（无需 API key / 注册）：每 IP 200 requests/小时。免费路由可能记录 prompt 用于训练，见每条记录的 may_train_on_your_prompts。 | [注册](https://app.kilo.ai) | — | [文档](https://kilo.ai/docs/gateway/models-and-providers) | [JSON](https://ofind.cn/FreeModels/data/providers/kilo/models.json) |
| [LLM7.io](https://llm7.io)  | `llm7` | 7 | 6 | 0 | turbo 层模型可用免费 token 调用（在 dash.llm7.io 注册领取，无需付费）：100,000 tokens/24 小时，60 requests/分钟、250 requests/小时；官方声明免费额度可能随时下调。表内价格是按 token 计费费率。 | [注册](https://dash.llm7.io) | [API Key](https://dash.llm7.io) | [文档](https://docs.llm7.io/limits) | [JSON](https://ofind.cn/FreeModels/data/providers/llm7/models.json) |
| [LongCat](https://longcat.chat)  | `longcat` | 1 | 1 | 0 | 提供每日 token 免费额度，额度和模型范围以官方文档为准。 | [注册](https://longcat.chat) | [API Key](https://longcat.chat/platform/api-keys) | [文档](https://longcat.chat/platform/docs) | [JSON](https://ofind.cn/FreeModels/data/providers/longcat/models.json) |
| [NVIDIA AI](https://developer.nvidia.com/ai)  | `nvidia` | 80 | 18 | 0 | 公共 NIM 端点（build.nvidia.com 标记的免费模型）限速约 40 RPM / 10,000 requests/天，限速内不收费；官方 limits 页为准。 | [注册](https://build.nvidia.com) | [API Key](https://build.nvidia.com/explore/discover) | [文档](https://docs.api.nvidia.com/nim) | [JSON](https://ofind.cn/FreeModels/data/providers/nvidia/models.json) |
| [OpenRouter](https://openrouter.ai)  | `openrouter` | 19 | 19 | 0 | 免费模型通常带有请求频率或每日请求限制。 | [注册](https://openrouter.ai) | [API Key](https://openrouter.ai/settings/keys) | [文档](https://openrouter.ai/docs) | [JSON](https://ofind.cn/FreeModels/data/providers/openrouter/models.json) |
| [OVHcloud AI Endpoints](https://www.ovhcloud.com/en-gb/public-cloud/ai-endpoints/)  | `ovh` | 23 | 23 | 0 | 目录内模型支持匿名调用（无需注册、无需 API key）：每 IP 每模型 2 requests/分钟。带 API key 走 Public Cloud 按 token 计费（400 RPM/项目），表内 price_input/price_output 是该付费费率，不是匿名档费用。 | [注册](https://www.ovhcloud.com/en-gb/public-cloud/ai-endpoints/) | — | [文档](https://docs.ovhcloud.com/en/guides/public-cloud/ai-machine-learning/ai-endpoints-getting-started) | [JSON](https://ofind.cn/FreeModels/data/providers/ovh/models.json) |
| [SambaNova Cloud](https://cloud.sambanova.ai)  | `sambanova` | 19 | 19 | 0 | 新账户提供 $5 trial credits，有效期 3 个月。 | [注册](https://cloud.sambanova.ai) | [API Key](https://cloud.sambanova.ai/apis) | [文档](https://docs.sambanova.ai) | [JSON](https://ofind.cn/FreeModels/data/providers/sambanova/models.json) |
| —  | `sensenova` | 3 | 3 | 0 | — | — | — | — | [JSON](https://ofind.cn/FreeModels/data/providers/sensenova/models.json) |
| [iFlytek MaaS / 讯飞星辰](https://maas.xfyun.cn)  | `xingchen` | 44 | 7 | 0 | 第三方模型聚合（GLM/Qwen/DeepSeek 等）；部分模型 0 元开放，具体以控制台为准。 | [注册](https://maas.xfyun.cn) | [API Key](https://maas.xfyun.cn) | [文档](https://maas.xfyun.cn/docs) | [JSON](https://ofind.cn/FreeModels/data/providers/xingchen/models.json) |
| [iFlytek Spark / 讯飞星火](https://xinghuo.xfyun.cn)  | `xinghuo` | 6 | 1 | 0 | Spark Lite 永久免费但限速（5 并发）；其他 Spark 系列按 token 计费。 | [注册](https://xinghuo.xfyun.cn) | [API Key](https://console.xfyun.cn/services/cbm) | [文档](https://www.xfyun.cn/doc/spark) | [JSON](https://ofind.cn/FreeModels/data/providers/xinghuo/models.json) |

## 各 Provider 详细文档

- [agnes](./agnes.md)
- [BigModel / 智谱 AI](./bigmodel.md)
- [Cerebras](./cerebras.md)
- [Cloudflare Workers AI](./cloudflare.md)
- [Cohere](./cohere.md)
- [Gitee AI](./gitee.md)
- [GitHub Models](./github.md)
- [Google AI](./google.md)
- [Groq](./groq.md)
- [Kilo Code Gateway](./kilo.md)
- [LLM7.io](./llm7.md)
- [LongCat](./longcat.md)
- [NVIDIA AI](./nvidia.md)
- [OpenRouter](./openrouter.md)
- [OVHcloud AI Endpoints](./ovh.md)
- [SambaNova Cloud](./sambanova.md)
- [sensenova](./sensenova.md)
- [iFlytek MaaS / 讯飞星辰](./xingchen.md)
- [iFlytek Spark / 讯飞星火](./xinghuo.md)
