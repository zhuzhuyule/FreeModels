# Provider 文档索引

> 本文档由 `npm run generate-docs` 自动生成。Provider 数据源与抓取细节以 `scripts/hub/providers/{name}/index.ts` 为准。

## Provider 支持情况

| Provider | 内部 ID | 总模型 | 免费 | 付费可试用 | 免费策略 | 注册 | API Key | 文档 | 数据 |
|---|---|---:|---:|---:|---|---|---|---|---|
| [BigModel / 智谱 AI](https://open.bigmodel.cn)  | `bigmodel` | 56 | 9 | 0 | GLM Flash 等部分模型可免费使用，具体以官方价格页和控制台为准。 | [注册](https://open.bigmodel.cn) | [API Key](https://open.bigmodel.cn/usercenter/proj-mgmt/apikeys) | [文档](https://docs.bigmodel.cn) | [JSON](https://ofind.cn/FreeModels/data/providers/bigmodel/models.json) |
| [Cerebras](https://www.cerebras.ai)  | `cerebras` | 4 | 4 | 0 | 部分模型提供免费或限速使用，额度以官方控制台为准。 | [注册](https://cloud.cerebras.ai) | [API Key](https://cloud.cerebras.ai/platform/api-keys) | [文档](https://inference-docs.cerebras.ai) | [JSON](https://ofind.cn/FreeModels/data/providers/cerebras/models.json) |
| [Gitee AI](https://ai.gitee.com)  | `gitee` | 203 | 44 | 146 | 部分模型完全免费，另有一批模型允许体验。 | [注册](https://ai.gitee.com) | — | [文档](https://ai.gitee.com/docs) | [JSON](https://ofind.cn/FreeModels/data/providers/gitee/models.json) |
| [Google AI](https://ai.google.dev)  | `google` | 32 | 17 | 0 | Gemini API 部分模型提供免费层，通常带有 RPM / RPD / TPM 限制。 | [注册](https://aistudio.google.com) | [API Key](https://aistudio.google.com/app/apikey) | [文档](https://ai.google.dev/gemini-api/docs) | [JSON](https://ofind.cn/FreeModels/data/providers/google/models.json) |
| [Groq](https://groq.com)  | `groq` | 12 | 0 | 0 | 常见为开发者免费额度或限速体验，具体以官方控制台和价格页为准。 | [注册](https://console.groq.com) | [API Key](https://console.groq.com/keys) | [文档](https://console.groq.com/docs) | [JSON](https://ofind.cn/FreeModels/data/providers/groq/models.json) |
| [LongCat](https://longcat.chat)  | `longcat` | 7 | 7 | 0 | 提供每日 token 免费额度，额度和模型范围以官方文档为准。 | [注册](https://longcat.chat) | [API Key](https://longcat.chat/platform/api-keys) | [文档](https://longcat.chat/platform/docs) | [JSON](https://ofind.cn/FreeModels/data/providers/longcat/models.json) |
| [NVIDIA AI](https://developer.nvidia.com/ai)  | `nvidia` | 131 | 24 | 0 | NIM / build.nvidia.com 通常提供开发体验 credits 或试用额度。 | [注册](https://build.nvidia.com) | [API Key](https://build.nvidia.com/explore/discover) | [文档](https://docs.api.nvidia.com/nim) | [JSON](https://ofind.cn/FreeModels/data/providers/nvidia/models.json) |
| [OpenRouter](https://openrouter.ai)  | `openrouter` | 55 | 55 | 0 | 免费模型通常带有请求频率或每日请求限制。 | [注册](https://openrouter.ai) | [API Key](https://openrouter.ai/settings/keys) | [文档](https://openrouter.ai/docs) | [JSON](https://ofind.cn/FreeModels/data/providers/openrouter/models.json) |
| [iFlytek MaaS / 讯飞星辰](https://maas.xfyun.cn)  | `xingchen` | 49 | 9 | 0 | 第三方模型聚合（GLM/Qwen/DeepSeek 等）；部分模型 0 元开放，具体以控制台为准。 | [注册](https://maas.xfyun.cn) | [API Key](https://maas.xfyun.cn) | [文档](https://maas.xfyun.cn/docs) | [JSON](https://ofind.cn/FreeModels/data/providers/xingchen/models.json) |
| [iFlytek Spark / 讯飞星火](https://xinghuo.xfyun.cn)  | `xinghuo` | 6 | 1 | 0 | Spark Lite 永久免费但限速（5 并发）；其他 Spark 系列按 token 计费。 | [注册](https://xinghuo.xfyun.cn) | [API Key](https://console.xfyun.cn/services/cbm) | [文档](https://www.xfyun.cn/doc/spark) | [JSON](https://ofind.cn/FreeModels/data/providers/xinghuo/models.json) |

## 各 Provider 详细文档

- [BigModel / 智谱 AI](./bigmodel.md)
- [Cerebras](./cerebras.md)
- [Gitee AI](./gitee.md)
- [Google AI](./google.md)
- [Groq](./groq.md)
- [LongCat](./longcat.md)
- [NVIDIA AI](./nvidia.md)
- [OpenRouter](./openrouter.md)
- [iFlytek MaaS / 讯飞星辰](./xingchen.md)
- [iFlytek Spark / 讯飞星火](./xinghuo.md)
