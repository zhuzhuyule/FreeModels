# FreeModels

聚合多家 AI provider 的免费 / 试用模型清单，统一为 OpenAI 兼容 JSON。每天自动同步、跨 provider 模型识别、自动生成文档索引、企业微信变更通知。

🌐 **在线访问**：<https://ofind.cn/FreeModels/>

## Provider 支持情况

> 该表由 `npm run generate-docs` 根据 `data/models.json` 自动更新。

<!-- AUTO-GENERATED:PROVIDER_INDEX_START -->
| Provider | 内部 ID | 总模型 | 免费 | 付费可试用 | 免费策略 | 注册 | API Key | 文档 | 数据 |
|---|---|---:|---:|---:|---|---|---|---|---|
| [BigModel / 智谱 AI](https://open.bigmodel.cn)  | `bigmodel` | 56 | 9 | 0 | GLM Flash 等部分模型可免费使用，具体以官方价格页和控制台为准。 | [注册](https://open.bigmodel.cn) | [API Key](https://open.bigmodel.cn/usercenter/proj-mgmt/apikeys) | [文档](https://docs.bigmodel.cn) | [JSON](https://ofind.cn/FreeModels/data/providers/bigmodel/models.json) |
| [Cerebras](https://www.cerebras.ai)  | `cerebras` | 4 | 4 | 0 | 部分模型提供免费或限速使用，额度以官方控制台为准。 | [注册](https://cloud.cerebras.ai) | [API Key](https://cloud.cerebras.ai/platform/api-keys) | [文档](https://inference-docs.cerebras.ai) | [JSON](https://ofind.cn/FreeModels/data/providers/cerebras/models.json) |
| [Gitee AI](https://ai.gitee.com)  | `gitee` | 202 | 44 | 145 | 部分模型完全免费，另有一批模型允许体验。 | [注册](https://ai.gitee.com) | — | [文档](https://ai.gitee.com/docs) | [JSON](https://ofind.cn/FreeModels/data/providers/gitee/models.json) |
| [Google AI](https://ai.google.dev)  | `google` | 32 | 17 | 0 | Gemini API 部分模型提供免费层，通常带有 RPM / RPD / TPM 限制。 | [注册](https://aistudio.google.com) | [API Key](https://aistudio.google.com/app/apikey) | [文档](https://ai.google.dev/gemini-api/docs) | [JSON](https://ofind.cn/FreeModels/data/providers/google/models.json) |
| [Groq](https://groq.com)  | `groq` | 12 | 0 | 0 | 常见为开发者免费额度或限速体验，具体以官方控制台和价格页为准。 | [注册](https://console.groq.com) | [API Key](https://console.groq.com/keys) | [文档](https://console.groq.com/docs) | [JSON](https://ofind.cn/FreeModels/data/providers/groq/models.json) |
| [LongCat](https://longcat.chat)  | `longcat` | 7 | 7 | 0 | 提供每日 token 免费额度，额度和模型范围以官方文档为准。 | [注册](https://longcat.chat) | [API Key](https://longcat.chat/platform/api-keys) | [文档](https://longcat.chat/platform/docs) | [JSON](https://ofind.cn/FreeModels/data/providers/longcat/models.json) |
| [NVIDIA AI](https://developer.nvidia.com/ai)  | `nvidia` | 134 | 26 | 0 | NIM / build.nvidia.com 通常提供开发体验 credits 或试用额度。 | [注册](https://build.nvidia.com) | [API Key](https://build.nvidia.com/explore/discover) | [文档](https://docs.api.nvidia.com/nim) | [JSON](https://ofind.cn/FreeModels/data/providers/nvidia/models.json) |
| [OpenRouter](https://openrouter.ai)  | `openrouter` | 58 | 58 | 0 | 免费模型通常带有请求频率或每日请求限制。 | [注册](https://openrouter.ai) | [API Key](https://openrouter.ai/settings/keys) | [文档](https://openrouter.ai/docs) | [JSON](https://ofind.cn/FreeModels/data/providers/openrouter/models.json) |
| [iFlytek Spark / 讯飞星火](https://xinghuo.xfyun.cn)  | `xunfei` | 64 | 10 | 0 | 部分模型或套餐提供免费额度 / 限速体验，具体以 MaaS 控制台为准。 | [注册](https://xinghuo.xfyun.cn) | [API Key](https://maas.xfyun.cn) | [文档](https://www.xfyun.cn/doc/spark) | [JSON](https://ofind.cn/FreeModels/data/providers/xunfei/models.json) |
<!-- AUTO-GENERATED:PROVIDER_INDEX_END -->

## 数据规模

> 该表由 `npm run generate-docs` 自动更新。

<!-- AUTO-GENERATED:STATS_START -->
| 维度 | 数量 |
|------|-----:|
| Provider | 9 |
| 模型总数 | 569 |
| 免费模型 (`is_free=true`) | 175 |
| 付费可试用 (Gitee 体验等) | 145 |
| 模型家族 | 473 |
| 跨 Provider 家族 | 65 |
| · 限速免费 | 87 |
| · 永久免费 | 53 |
| · 试用 credits | 26 |
| · 日 token 配额 | 7 |
| · 预览版 | 2 |
<!-- AUTO-GENERATED:STATS_END -->

## 免费模型列表

> 该表由 `npm run generate-docs` 自动更新，展示 `is_free=true` 的模型。完整数据请用 `data/views/free/models.json`，或按机制查 `free-permanent` / `free-rate-limited` / `free-quota` / `paid-trial`。

<!-- AUTO-GENERATED:FREE_MODELS_START -->
| Provider | Model ID | 名称 | 上下文 | 免费类型 | 限制 |
|---|---|---|---:|---|---|
| bigmodel  | `bigmodel/cogvideox-flash` | CogVideoX-Flash | unknown | 永久免费 | — |
| bigmodel  | `bigmodel/cogview-3-flash` | Cogview-3-Flash | unknown | 永久免费 | — |
| bigmodel  | `bigmodel/glm-4-flash` | GLM-4-Flash | 128K | 永久免费 | — |
| bigmodel  | `bigmodel/glm-4-flash-250414` | GLM-4-Flash-250414 | 128K | 永久免费 | — |
| bigmodel  | `bigmodel/glm-4.1v-thinking-flash` | GLM-4.1V-Thinking-Flash | 64K | 永久免费 | — |
| bigmodel  | `bigmodel/glm-4.6v-flash` | GLM-4.6V-Flash | 128K | 永久免费 | — |
| bigmodel  | `bigmodel/glm-4.7-flash` | GLM-4.7-Flash | 200K | 永久免费 | — |
| bigmodel  | `bigmodel/glm-4v-flash` | GLM-4V-Flash | 4K | 永久免费 | — |
| bigmodel  | `bigmodel/glm-z1-flash` | GLM-Z1-Flash | 128K | 永久免费 | — |
| cerebras  | `cerebras/gpt-oss-120b` | OpenAI GPT OSS | unknown | 限速免费 | — |
| cerebras  | `cerebras/llama3.1-8b` | Llama 3.1 8B | 8K | 限速免费 | — |
| cerebras  | `cerebras/qwen-3-235b-a22b-instruct-2507` | Qwen 3 235B Instruct | 66K | 预览版 | — |
| cerebras  | `cerebras/zai-glm-4.7` | Z.ai GLM 4.7 | unknown | 预览版 | — |
| gitee  | `all-mpnet-base-v2` | all-mpnet-base-v2 | unknown | 永久免费 | — |
| gitee  | `Baichuan-M2-32B` | 百川医疗大模型 M2-32B | 64K | 永久免费 | — |
| gitee  | `bce-embedding-base_v1` | bce-embedding-base_v1 | 500 | 永久免费 | — |
| gitee  | `bce-reranker-base_v1` | bce-reranker-base_v1 | 500 | 永久免费 | — |
| gitee  | `bge-large-zh-v1.5` | bge-large-zh-v1.5 | 500 | 永久免费 | — |
| gitee  | `bge-m3` | bge-m3 | 8K | 永久免费 | — |
| gitee  | `bge-reranker-v2-m3` | bge-reranker-v2-m3 | 8K | 永久免费 | — |
| gitee  | `bge-small-zh-v1.5` | bge-small-zh-v1.5 | 500 | 永久免费 | — |
| gitee  | `DeepSeek-Prover-V2-7B` | DeepSeek-Prover 数学定理证明 | unknown | 永久免费 | — |
| gitee  | `DeepSeek-R1-Distill-Qwen-1.5B` | DeepSeek-R1-Distill-Qwen-1.5B | 32K | 永久免费 | — |
| gitee  | `DeepSeek-R1-Distill-Qwen-14B` | DeepSeek-R1-Distill-Qwen-14B | 32K | 永久免费 | — |
| gitee  | `DeepSeek-R1-Distill-Qwen-7B` | DeepSeek-R1-Distill-Qwen-7B | 32K | 永久免费 | — |
| gitee  | `GLM-4-9B-0414` | GLM-4-9B-0414 | 32K | 永久免费 | — |
| gitee  | `glm-4-9b-chat` | GLM-4-9B-Chat | 32K | 永久免费 | — |
| gitee  | `GLM-4.6V-Flash` | GLM-4.6V-Flash | 128K | 永久免费 | — |
| gitee  | `GLM-4.7-Flash` | GLM-4.7-Flash | 200K | 永久免费 | — |
| gitee  | `GLM-ASR` | GLM-ASR | unknown | 永久免费 | — |
| gitee  | `HealthGPT-L14` | HealthGPT 医疗大模型 | 32K | 永久免费 | — |
| gitee  | `HuatuoGPT-o1-7B` | HuatuoGPT-o1-7B 医疗大模型 | 32K | 永久免费 | — |
| gitee  | `internlm3-8b-instruct` | InternLM3-8B-Instruct | 32K | 永久免费 | — |
| gitee  | `jina-clip-v1` | jina-clip-v1 | 500 | 永久免费 | — |
| gitee  | `jina-clip-v2` | jina-clip-v2 | 8K | 永久免费 | — |
| gitee  | `jina-embeddings-v4` | jina-embeddings-v4 | 32K | 永久免费 | — |
| gitee  | `jina-reranker-m0` | jina-reranker-m0 | 10K | 永久免费 | — |
| gitee  | `Lingshu-32B` | Lingshu-32B 医疗大模型 | 32K | 永久免费 | — |
| gitee  | `medgemma-4b-it` | MedGemma 医疗大模型 | 32K | 永久免费 | — |
| gitee  | `nomic-embed-code` | nomic-embed-code | 32K | 永久免费 | — |
| gitee  | `nonescape-v0` | AI 图片检测 | unknown | 永久免费 | — |
| gitee  | `nsfw-classifier` | 色情图片检测 | unknown | 永久免费 | — |
| gitee  | `Qwen2-7B-Instruct` | Qwen2-7B-Instruct | 24K | 永久免费 | — |
| gitee  | `Qwen3-0.6B` | Qwen3-0.6B | 32K | 永久免费 | — |
| gitee  | `Qwen3-4B` | Qwen3-4B | 32K | 永久免费 | — |
| gitee  | `Qwen3-8B` | Qwen3-8B | 32K | 永久免费 | — |
| gitee  | `Qwen3-Embedding-0.6B` | Qwen3-Embedding-0.6B | 32K | 永久免费 | — |
| gitee  | `Qwen3-Embedding-4B` | Qwen3-Embedding-4B | 32K | 永久免费 | — |
| gitee  | `Qwen3-Embedding-8B` | Qwen3-Embedding-8B | 32K | 永久免费 | — |
| gitee  | `Qwen3-Reranker-0.6B` | Qwen3-Reranker-0.6B | 8K | 永久免费 | — |
| gitee  | `Qwen3-Reranker-4B` | Qwen3-Reranker-4B | 8K | 永久免费 | — |
| gitee  | `Qwen3-Reranker-8B` | Qwen3-Reranker-8B | 8K | 永久免费 | — |
| gitee  | `Qwen3Guard-Gen-0.6B` | Qwen3Guard-Gen-0.6B | 32K | 永久免费 | — |
| gitee  | `Security-semantic-filtering` | 违规文本检测 | 32K | 永久免费 | — |
| gitee  | `SenseVoiceSmall` | SenseVoiceSmall | unknown | 永久免费 | — |
| gitee  | `Spark-TTS-0.5B` | Spark-TTS-0.5B | unknown | 永久免费 | — |
| gitee  | `Youtu-Embedding` | Youtu-Embedding | 8K | 永久免费 | — |
| google  | `google/gemini-2.0-flash` | Gemini 2.0 Flash | 1M | 限速免费 | — |
| google  | `google/gemini-2.0-flash-lite` | Gemini 2.0 Flash-Lite | 1M | 限速免费 | — |
| google  | `google/gemini-2.5-flash` | Gemini 2.5 Flash | 1M | 限速免费 | — |
| google  | `google/gemini-2.5-flash-lite` | Gemini 2.5 Flash-Lite | 1M | 限速免费 | — |
| google  | `google/gemini-2.5-flash-lite-preview-09-2025` | Gemini 2.5 Flash-Lite Preview | 1M | 限速免费 | — |
| google  | `google/gemini-2.5-flash-native-audio-preview-12-2025` | Gemini 2.5 Flash Native Audio | 1M | 限速免费 | — |
| google  | `google/gemini-2.5-flash-preview-tts` | Gemini 2.5 Flash Preview TTS | unknown | 限速免费 | — |
| google  | `google/gemini-2.5-pro` | Gemini 2.5 Pro | 1M | 限速免费 | — |
| google  | `google/gemini-3-flash-preview` | Gemini 3 Flash Preview | unknown | 限速免费 | — |
| google  | `google/gemini-3.1-flash-lite-preview` | Gemini 3.1 Flash-Lite Preview | 1M | 限速免费 | — |
| google  | `google/gemini-3.1-flash-live-preview` | Gemini 3.1 Flash Live Preview | 1M | 限速免费 | — |
| google  | `google/gemini-3.1-flash-tts-preview` | Gemini 3.1 Flash TTS Preview | unknown | 限速免费 | — |
| google  | `google/gemini-embedding-001` | Gemini Embedding | unknown | 限速免费 | — |
| google  | `google/gemini-embedding-2` | Gemini Embedding 2 | unknown | 限速免费 | — |
| google  | `google/gemini-robotics-er-1.5-preview` | Gemini Robotics-ER 1.5 Preview | 1M | 限速免费 | — |
| google  | `google/gemini-robotics-er-1.6-preview` | Gemini Robotics-ER 1.6 Preview | 1M | 限速免费 | — |
| google  | `google/gemma-4` | Gemma 4 | 1M | 限速免费 | — |
| longcat  | `longcat/LongCat-2.0-Preview` | LongCat 2.0 Preview | 1M | 日 token 配额 | 10,000,000 tokens/2小时 |
| longcat  | `longcat/LongCat-Flash-Chat` | LongCat Flash Chat | 256K | 日 token 配额 | 500,000 tokens/天 |
| longcat  | `longcat/LongCat-Flash-Chat-2602-Exp` | LongCat Flash Chat 2602 Exp | 256K | 日 token 配额 | 500,000 tokens/天 |
| longcat  | `longcat/LongCat-Flash-Lite` | LongCat Flash Lite | 256K | 日 token 配额 | 50,000,000 tokens/天 |
| longcat  | `longcat/LongCat-Flash-Omni-2603` | LongCat Flash Omni 2603 | 128K | 日 token 配额 | 500,000 tokens/天 |
| longcat  | `longcat/LongCat-Flash-Thinking` | LongCat Flash Thinking | 256K | 日 token 配额 | 500,000 tokens/天 |
| longcat  | `longcat/LongCat-Flash-Thinking-2601` | LongCat Flash Thinking 2601 | 256K | 日 token 配额 | 500,000 tokens/天 |
| nvidia  | `bytedance/seed-oss-36b-instruct` | seed-oss-36b-instruct | unknown | 试用 credits | NVIDIA NIM free credits, exhaustible |
| nvidia  | `google/gemma-2-2b-it` | gemma-2-2b-it | unknown | 试用 credits | NVIDIA NIM free credits, exhaustible |
| nvidia  | `google/gemma-3-27b-it` | gemma-3-27b-it | unknown | 试用 credits | NVIDIA NIM free credits, exhaustible |
| nvidia  | `google/gemma-3n-e2b-it` | gemma-3n-e2b-it | unknown | 试用 credits | NVIDIA NIM free credits, exhaustible |
| nvidia  | `google/gemma-3n-e4b-it` | gemma-3n-e4b-it | unknown | 试用 credits | NVIDIA NIM free credits, exhaustible |
| nvidia  | `meta/llama-4-maverick-17b-128e-instruct` | llama-4-maverick-17b-128e-instruct | unknown | 试用 credits | NVIDIA NIM free credits, exhaustible |
| nvidia  | `meta/llama-guard-4-12b` | llama-guard-4-12b | unknown | 试用 credits | NVIDIA NIM free credits, exhaustible |
| nvidia  | `microsoft/phi-4-multimodal-instruct` | phi-4-multimodal-instruct | unknown | 试用 credits | NVIDIA NIM free credits, exhaustible |
| nvidia  | `minimaxai/minimax-m2.7` | minimax-m2.7 | unknown | 试用 credits | NVIDIA NIM free credits, exhaustible |
| nvidia  | `mistralai/devstral-2-123b-instruct-2512` | devstral-2-123b-instruct-2512 | unknown | 试用 credits | NVIDIA NIM free credits, exhaustible |
| nvidia  | `mistralai/magistral-small-2506` | magistral-small-2506 | unknown | 试用 credits | NVIDIA NIM free credits, exhaustible |
| nvidia  | `mistralai/mistral-large-3-675b-instruct-2512` | mistral-large-3-675b-instruct-2512 | unknown | 试用 credits | NVIDIA NIM free credits, exhaustible |
| nvidia  | `mistralai/mistral-medium-3-instruct` | mistral-medium-3-instruct | unknown | 试用 credits | NVIDIA NIM free credits, exhaustible |
| nvidia  | `mistralai/mistral-medium-3.5-128b` | mistral-medium-3.5-128b | unknown | 试用 credits | NVIDIA NIM free credits, exhaustible |
| nvidia  | `mistralai/mistral-nemotron` | mistral-nemotron | unknown | 试用 credits | NVIDIA NIM free credits, exhaustible |
| nvidia  | `moonshotai/kimi-k2-instruct` | kimi-k2-instruct | unknown | 试用 credits | NVIDIA NIM free credits, exhaustible |
| nvidia  | `moonshotai/kimi-k2-instruct-0905` | kimi-k2-instruct-0905 | unknown | 试用 credits | NVIDIA NIM free credits, exhaustible |
| nvidia  | `moonshotai/kimi-k2-thinking` | kimi-k2-thinking | unknown | 试用 credits | NVIDIA NIM free credits, exhaustible |
| nvidia  | `nvidia/gliner-pii` | gliner-pii | unknown | 试用 credits | NVIDIA NIM free credits, exhaustible |
| nvidia  | `nvidia/nemotron-3-content-safety` | nemotron-3-content-safety | unknown | 试用 credits | NVIDIA NIM free credits, exhaustible |
| nvidia  | `nvidia/nemotron-content-safety-reasoning-4b` | nemotron-content-safety-reasoning-4b | unknown | 试用 credits | NVIDIA NIM free credits, exhaustible |
| nvidia  | `nvidia/nemotron-mini-4b-instruct` | nemotron-mini-4b-instruct | unknown | 试用 credits | NVIDIA NIM free credits, exhaustible |
| nvidia  | `nvidia/nv-embed-v1` | nv-embed-v1 | unknown | 试用 credits | NVIDIA NIM free credits, exhaustible |
| nvidia  | `nvidia/nv-embedcode-7b-v1` | nv-embedcode-7b-v1 | unknown | 试用 credits | NVIDIA NIM free credits, exhaustible |
| nvidia  | `qwen/qwen3-coder-480b-a35b-instruct` | qwen3-coder-480b-a35b-instruct | unknown | 试用 credits | NVIDIA NIM free credits, exhaustible |
| nvidia  | `stepfun-ai/step-3.5-flash` | step-3.5-flash | unknown | 试用 credits | NVIDIA NIM free credits, exhaustible |
| openrouter  | `openrouter/alibaba/wan-2.6` | Alibaba: Wan 2.6 | unknown | 限速免费 | 20 RPM / 50 RPD / Free models limited to 20 req/min, 50/day on basic accounts |
| openrouter  | `openrouter/alibaba/wan-2.7` | Alibaba: Wan 2.7 | unknown | 限速免费 | 20 RPM / 50 RPD / Free models limited to 20 req/min, 50/day on basic accounts |
| openrouter  | `openrouter/baidu/qianfan-ocr-fast` | Baidu: Qianfan-OCR-Fast (free) | 66K | 限速免费 | 20 RPM / 50 RPD / Free models limited to 20 req/min, 50/day on basic accounts |
| openrouter  | `openrouter/black-forest-labs/flux.2-flex` | Black Forest Labs: FLUX.2 Flex | 67K | 限速免费 | 20 RPM / 50 RPD / Free models limited to 20 req/min, 50/day on basic accounts |
| openrouter  | `openrouter/black-forest-labs/flux.2-klein-4b` | Black Forest Labs: FLUX.2 Klein 4B | 41K | 限速免费 | 20 RPM / 50 RPD / Free models limited to 20 req/min, 50/day on basic accounts |
| openrouter  | `openrouter/black-forest-labs/flux.2-max` | Black Forest Labs: FLUX.2 Max | 47K | 限速免费 | 20 RPM / 50 RPD / Free models limited to 20 req/min, 50/day on basic accounts |
| openrouter  | `openrouter/black-forest-labs/flux.2-pro` | Black Forest Labs: FLUX.2 Pro | 47K | 限速免费 | 20 RPM / 50 RPD / Free models limited to 20 req/min, 50/day on basic accounts |
| openrouter  | `openrouter/bytedance-seed/seedream-4.5` | ByteDance Seed: Seedream 4.5 | 4K | 限速免费 | 20 RPM / 50 RPD / Free models limited to 20 req/min, 50/day on basic accounts |
| openrouter  | `openrouter/bytedance/seedance-1-5-pro` | ByteDance: Seedance 1.5 Pro | unknown | 限速免费 | 20 RPM / 50 RPD / Free models limited to 20 req/min, 50/day on basic accounts |
| openrouter  | `openrouter/bytedance/seedance-2.0` | ByteDance: Seedance 2.0 | unknown | 限速免费 | 20 RPM / 50 RPD / Free models limited to 20 req/min, 50/day on basic accounts |
| openrouter  | `openrouter/bytedance/seedance-2.0-fast` | ByteDance: Seedance 2.0 Fast | unknown | 限速免费 | 20 RPM / 50 RPD / Free models limited to 20 req/min, 50/day on basic accounts |
| openrouter  | `openrouter/cognitivecomputations/dolphin-mistral-24b-venice-edition` | Venice: Uncensored (free) | 33K | 限速免费 | 20 RPM / 50 RPD / Free models limited to 20 req/min, 50/day on basic accounts |
| openrouter  | `openrouter/cohere/rerank-4-fast` | Cohere: Rerank 4 Fast | 33K | 限速免费 | 20 RPM / 50 RPD / Free models limited to 20 req/min, 50/day on basic accounts |
| openrouter  | `openrouter/cohere/rerank-4-pro` | Cohere: Rerank 4 Pro | 33K | 限速免费 | 20 RPM / 50 RPD / Free models limited to 20 req/min, 50/day on basic accounts |
| openrouter  | `openrouter/cohere/rerank-v3.5` | Cohere: Rerank v3.5 | 4K | 限速免费 | 20 RPM / 50 RPD / Free models limited to 20 req/min, 50/day on basic accounts |
| openrouter  | `openrouter/google/gemma-3-12b-it` | Google: Gemma 3 12B (free) | 33K | 限速免费 | 20 RPM / 50 RPD / Free models limited to 20 req/min, 50/day on basic accounts |
| openrouter  | `openrouter/google/gemma-3-27b-it` | Google: Gemma 3 27B (free) | 131K | 限速免费 | 20 RPM / 50 RPD / Free models limited to 20 req/min, 50/day on basic accounts |
| openrouter  | `openrouter/google/gemma-3-4b-it` | Google: Gemma 3 4B (free) | 33K | 限速免费 | 20 RPM / 50 RPD / Free models limited to 20 req/min, 50/day on basic accounts |
| openrouter  | `openrouter/google/gemma-3n-e2b-it` | Google: Gemma 3n 2B (free) | 8K | 限速免费 | 20 RPM / 50 RPD / Free models limited to 20 req/min, 50/day on basic accounts |
| openrouter  | `openrouter/google/gemma-3n-e4b-it` | Google: Gemma 3n 4B (free) | 8K | 限速免费 | 20 RPM / 50 RPD / Free models limited to 20 req/min, 50/day on basic accounts |
| openrouter  | `openrouter/google/gemma-4-26b-a4b-it` | Google: Gemma 4 26B A4B  (free) | 262K | 限速免费 | 20 RPM / 50 RPD / Free models limited to 20 req/min, 50/day on basic accounts |
| openrouter  | `openrouter/google/gemma-4-31b-it` | Google: Gemma 4 31B (free) | 262K | 限速免费 | 20 RPM / 50 RPD / Free models limited to 20 req/min, 50/day on basic accounts |
| openrouter  | `openrouter/google/lyria-3-clip-preview` | Google: Lyria 3 Clip Preview | 1M | 限速免费 | 20 RPM / 50 RPD / Free models limited to 20 req/min, 50/day on basic accounts |
| openrouter  | `openrouter/google/lyria-3-pro-preview` | Google: Lyria 3 Pro Preview | 1M | 限速免费 | 20 RPM / 50 RPD / Free models limited to 20 req/min, 50/day on basic accounts |
| openrouter  | `openrouter/google/veo-3.1` | Google: Veo 3.1 | unknown | 限速免费 | 20 RPM / 50 RPD / Free models limited to 20 req/min, 50/day on basic accounts |
| openrouter  | `openrouter/google/veo-3.1-fast` | Google: Veo 3.1 Fast | unknown | 限速免费 | 20 RPM / 50 RPD / Free models limited to 20 req/min, 50/day on basic accounts |
| openrouter  | `openrouter/google/veo-3.1-lite` | Google: Veo 3.1 Lite | unknown | 限速免费 | 20 RPM / 50 RPD / Free models limited to 20 req/min, 50/day on basic accounts |
| openrouter  | `openrouter/inclusionai/ling-2.6-1t` | inclusionAI: Ling-2.6-1T (free) | 262K | 限速免费 | 20 RPM / 50 RPD / Free models limited to 20 req/min, 50/day on basic accounts |
| openrouter  | `openrouter/kwaivgi/kling-v3.0-pro` | Kling: Video v3.0 Pro | unknown | 限速免费 | 20 RPM / 50 RPD / Free models limited to 20 req/min, 50/day on basic accounts |
| openrouter  | `openrouter/kwaivgi/kling-v3.0-std` | Kling: Video v3.0 Standard | unknown | 限速免费 | 20 RPM / 50 RPD / Free models limited to 20 req/min, 50/day on basic accounts |
| openrouter  | `openrouter/kwaivgi/kling-video-o1` | Kling: Video O1 | unknown | 限速免费 | 20 RPM / 50 RPD / Free models limited to 20 req/min, 50/day on basic accounts |
| openrouter  | `openrouter/liquid/lfm-2.5-1.2b-instruct` | LiquidAI: LFM2.5-1.2B-Instruct (free) | 33K | 限速免费 | 20 RPM / 50 RPD / Free models limited to 20 req/min, 50/day on basic accounts |
| openrouter  | `openrouter/liquid/lfm-2.5-1.2b-thinking` | LiquidAI: LFM2.5-1.2B-Thinking (free) | 33K | 限速免费 | 20 RPM / 50 RPD / Free models limited to 20 req/min, 50/day on basic accounts |
| openrouter  | `openrouter/meta-llama/llama-3.2-3b-instruct` | Meta: Llama 3.2 3B Instruct (free) | 131K | 限速免费 | 20 RPM / 50 RPD / Free models limited to 20 req/min, 50/day on basic accounts |
| openrouter  | `openrouter/meta-llama/llama-3.3-70b-instruct` | Meta: Llama 3.3 70B Instruct (free) | 66K | 限速免费 | 20 RPM / 50 RPD / Free models limited to 20 req/min, 50/day on basic accounts |
| openrouter  | `openrouter/minimax/hailuo-2.3` | MiniMax: Hailuo 2.3 | unknown | 限速免费 | 20 RPM / 50 RPD / Free models limited to 20 req/min, 50/day on basic accounts |
| openrouter  | `openrouter/minimax/minimax-m2.5` | MiniMax: MiniMax M2.5 (free) | 197K | 限速免费 | 20 RPM / 50 RPD / Free models limited to 20 req/min, 50/day on basic accounts |
| openrouter  | `openrouter/nousresearch/hermes-3-llama-3.1-405b` | Nous: Hermes 3 405B Instruct (free) | 131K | 限速免费 | 20 RPM / 50 RPD / Free models limited to 20 req/min, 50/day on basic accounts |
| openrouter  | `openrouter/nvidia/llama-nemotron-embed-vl-1b-v2` | NVIDIA: Llama Nemotron Embed VL 1B V2 (free) | 131K | 限速免费 | 20 RPM / 50 RPD / Free models limited to 20 req/min, 50/day on basic accounts |
| openrouter  | `openrouter/nvidia/nemotron-3-nano-30b-a3b` | NVIDIA: Nemotron 3 Nano 30B A3B (free) | 256K | 限速免费 | 20 RPM / 50 RPD / Free models limited to 20 req/min, 50/day on basic accounts |
| openrouter  | `openrouter/nvidia/nemotron-3-nano-omni-30b-a3b-reasoning` | NVIDIA: Nemotron 3 Nano Omni (free) | 256K | 限速免费 | 20 RPM / 50 RPD / Free models limited to 20 req/min, 50/day on basic accounts |
| openrouter  | `openrouter/nvidia/nemotron-3-super-120b-a12b` | NVIDIA: Nemotron 3 Super (free) | 262K | 限速免费 | 20 RPM / 50 RPD / Free models limited to 20 req/min, 50/day on basic accounts |
| openrouter  | `openrouter/nvidia/nemotron-nano-12b-v2-vl` | NVIDIA: Nemotron Nano 12B 2 VL (free) | 128K | 限速免费 | 20 RPM / 50 RPD / Free models limited to 20 req/min, 50/day on basic accounts |
| openrouter  | `openrouter/nvidia/nemotron-nano-9b-v2` | NVIDIA: Nemotron Nano 9B V2 (free) | 128K | 限速免费 | 20 RPM / 50 RPD / Free models limited to 20 req/min, 50/day on basic accounts |
| openrouter  | `openrouter/openai/gpt-oss-120b` | OpenAI: gpt-oss-120b (free) | 131K | 限速免费 | 20 RPM / 50 RPD / Free models limited to 20 req/min, 50/day on basic accounts |
| openrouter  | `openrouter/openai/gpt-oss-20b` | OpenAI: gpt-oss-20b (free) | 131K | 限速免费 | 20 RPM / 50 RPD / Free models limited to 20 req/min, 50/day on basic accounts |
| openrouter  | `openrouter/openai/sora-2-pro` | OpenAI: Sora 2 Pro | unknown | 限速免费 | 20 RPM / 50 RPD / Free models limited to 20 req/min, 50/day on basic accounts |
| openrouter  | `openrouter/poolside/laguna-m.1` | Poolside: Laguna M.1 (free) | 131K | 限速免费 | 20 RPM / 50 RPD / Free models limited to 20 req/min, 50/day on basic accounts |
| openrouter  | `openrouter/poolside/laguna-xs.2` | Poolside: Laguna XS.2 (free) | 131K | 限速免费 | 20 RPM / 50 RPD / Free models limited to 20 req/min, 50/day on basic accounts |
| openrouter  | `openrouter/qwen/qwen3-coder` | Qwen: Qwen3 Coder 480B A35B (free) | 262K | 限速免费 | 20 RPM / 50 RPD / Free models limited to 20 req/min, 50/day on basic accounts |
| openrouter  | `openrouter/qwen/qwen3-next-80b-a3b-instruct` | Qwen: Qwen3 Next 80B A3B Instruct (free) | 262K | 限速免费 | 20 RPM / 50 RPD / Free models limited to 20 req/min, 50/day on basic accounts |
| openrouter  | `openrouter/sourceful/riverflow-v2-fast` | Sourceful: Riverflow V2 Fast | 8K | 限速免费 | 20 RPM / 50 RPD / Free models limited to 20 req/min, 50/day on basic accounts |
| openrouter  | `openrouter/sourceful/riverflow-v2-fast-preview` | Sourceful: Riverflow V2 Fast Preview | 8K | 限速免费 | 20 RPM / 50 RPD / Free models limited to 20 req/min, 50/day on basic accounts |
| openrouter  | `openrouter/sourceful/riverflow-v2-max-preview` | Sourceful: Riverflow V2 Max Preview | 8K | 限速免费 | 20 RPM / 50 RPD / Free models limited to 20 req/min, 50/day on basic accounts |
| openrouter  | `openrouter/sourceful/riverflow-v2-pro` | Sourceful: Riverflow V2 Pro | 8K | 限速免费 | 20 RPM / 50 RPD / Free models limited to 20 req/min, 50/day on basic accounts |
| openrouter  | `openrouter/sourceful/riverflow-v2-standard-preview` | Sourceful: Riverflow V2 Standard Preview | 8K | 限速免费 | 20 RPM / 50 RPD / Free models limited to 20 req/min, 50/day on basic accounts |
| openrouter  | `openrouter/tencent/hy3-preview` | Tencent: Hy3 preview (free) | 262K | 限速免费 | 20 RPM / 50 RPD / Free models limited to 20 req/min, 50/day on basic accounts |
| openrouter  | `openrouter/z-ai/glm-4.5-air` | Z.ai: GLM 4.5 Air (free) | 131K | 限速免费 | 20 RPM / 50 RPD / Free models limited to 20 req/min, 50/day on basic accounts |
| xunfei  | `xunfei/DeepSeek-OCR` | DeepSeek-OCR | 8K | 限速免费 | — |
| xunfei  | `xunfei/Hunyuan-MT-7B` | Hunyuan-MT-7B | 33K | 限速免费 | — |
| xunfei  | `xunfei/HunyuanOCR` | HunyuanOCR | 33K | 限速免费 | — |
| xunfei  | `xunfei/Qwen-Image-2512` | Qwen-Image-2512 | unknown | 限速免费 | — |
| xunfei  | `xunfei/Qwen3-1.7B` | Qwen3-1.7B | 33K | 限速免费 | — |
| xunfei  | `xunfei/Qwen3-Embedding-8B` | Qwen3-Embedding-8B | 33K | 限速免费 | — |
| xunfei  | `xunfei/Qwen3-Reranker-8B` | Qwen3-Reranker-8B | 33K | 限速免费 | — |
| xunfei  | `xunfei/Qwen3.5-2B` | Qwen3.5-2B | 33K | 限速免费 | — |
| xunfei  | `xunfei/StableDiffusion_XL_Base_1` | StableDiffusion_XL_Base_1 | unknown | 限速免费 | — |
| xunfei  | `xunfei/Z-Image-Turbo` | Z-Image-Turbo | 512 | 限速免费 | — |
<!-- AUTO-GENERATED:FREE_MODELS_END -->

## 直接使用预编译 JSON（推荐 API 消费方）

所有数据文件已部署在 GitHub Pages，**无需自己跑同步**，直接 fetch 即可。

### 主数据

```bash
# 全量数据（包含所有字段）
curl https://ofind.cn/FreeModels/data/models.json
```

### 按视图过滤

```
https://ofind.cn/FreeModels/data/views/<view>/models.json
```

| 视图 | 内容 |
|------|------|
| `all` | 全部模型 |
| `free` | `is_free=true`（含所有免费机制） |
| `free-permanent` | `free_mechanism=permanent`（永久免费） |
| `free-rate-limited` | `free_mechanism=rate-limited`（限速免费） |
| `free-quota` | `free_mechanism` ∈ `daily-tokens` / `monthly-tokens` / `trial-credits`（配额免费） |
| `paid-trial` | 付费但可试用调用（`is_free=false && trial_scope=all`，如 Gitee 体验） |
| `reasoning` | 推理模型 |
| `multimodal` | 多模态 |
| `tool-use` | 支持工具调用 |
| `fast` | 快速档位 |
| `premium` | 高性能档位 |
| `small` | 小型模型 |
| `large` | 大型模型 |

```bash
# 例：只看永久免费（无限制）
curl https://ofind.cn/FreeModels/data/views/free-permanent/models.json

# 例：付费可试用（如 Gitee 体验）
curl https://ofind.cn/FreeModels/data/views/paid-trial/models.json
```

### 按 Provider 过滤

```
https://ofind.cn/FreeModels/data/providers/<provider>/models.json
```

可选 provider：`gitee` / `bigmodel` / `cerebras` / `google` / `groq` / `longcat` / `nvidia` / `openrouter` / `xunfei`

```bash
# 例：只看 OpenRouter
curl https://ofind.cn/FreeModels/data/providers/openrouter/models.json
```

### 缓存特性

- CDN 缓存最长 10 分钟（Fastly + Cloudflare）
- 数据每天 02:00 UTC 自动刷新
- 强制刷新：`Cache-Control: no-cache` 或附 `?t=<timestamp>` 绕过

### JS 端示例

```javascript
const res = await fetch('https://ofind.cn/FreeModels/data/views/free-permanent/models.json');
const { data } = await res.json();
const reasoning = data.filter(m => m.is_reasoning);
console.log(`${reasoning.length} 个免费推理模型`);
```

## 数据格式示例

```json
{
  "id": "openrouter/meta-llama/llama-3.3-70b-instruct",
  "provider": "openrouter",
  "name": "Llama 3.3 70B Instruct",
  "context_size": 128000,
  "context_label": "128K",
  "price_input": 0,
  "price_output": 0,
  "price_currency": "USD",
  "price_unit": "per_million_tokens",
  "is_free": true,
  "free_mechanism": "rate-limited",
  "free_quota": { "rpm": 20, "rpd": 50, "notes": "Free models limited to 20/min" },
  "trial_scope": "specific",
  "model_family": "llama-3.3-70b",
  "model_variant": "instruct",
  "aliases": ["groq/llama-3.3-70b-versatile", "nvidia/meta/llama-3.3-70b-instruct"],
  "tags": ["chat", "text-generation", "tool-use"],
  "tier": "large",
  "performance_level": "high"
}
```

### 免费定义

> **`is_free = true`** = 在某种限制下（速率 / 配额 / 试用 credits）可以**不付费**调用。

`free_mechanism` 描述具体机制：`permanent` / `rate-limited` / `daily-tokens` / `monthly-tokens` / `trial-credits` / `preview`。

`free_quota` 给出具体数值（rpm、tokens_per_day、total_credits 等）。

完整字段定义：[docs/fields.md](./docs/fields.md)

## 文档索引

| 文档 | 说明 |
|------|------|
| [docs/README.md](./docs/README.md) | 文档总目录 |
| [docs/architecture.md](./docs/architecture.md) | 数据流、聚合管线、缓存策略 |
| [docs/fields.md](./docs/fields.md) | 字段定义、taxonomy、family 规范化 |
| [docs/conventions.md](./docs/conventions.md) | 代码约定（价格单位、命名、缓存 IO） |
| [docs/providers/README.md](./docs/providers/README.md) | Provider 接入索引、免费策略与详细文档 |
| [docs/llm-and-notify.md](./docs/llm-and-notify.md) | GitHub Models 与企业微信通知 |
| [docs/deployment.md](./docs/deployment.md) | CI workflows、Pages、CDN |
| [docs/adding-provider.md](./docs/adding-provider.md) | 新增 Provider 步骤与模板 |
| [CLAUDE.md](./CLAUDE.md) | Claude Code agent 上下文 |

## 命令

```bash
npm install
npm run sync-models                       # 全量同步模型 JSON
npm run generate-docs                     # 根据 data/models.json 生成 README / Provider 文档
npm run sync                              # 同步模型 JSON 并生成文档
npm run sync-models -- --provider=gitee   # 仅跑某个 provider
npm run sync-models -- --strict           # 异常时退出码 2
npm run sync-models -- --no-notify        # 跳过通知
SKIP_LLM=1 npm run sync-models            # 跳过 LLM
npm run typecheck

# 本地预览前端
npx serve .
# 访问 http://localhost:3000/website/dev.html
```

## 环境变量

| 变量 | 必需 | 用途 |
|------|------|------|
| `GITHUB_TOKEN` | CI 自动 / 本地可选 | GitHub Models API 调用（家族 LLM 兜底） |
| `WECHAT_QYAPI_ID` | 可选 | 企业微信 webhook key |
| `SKIP_LLM` | 可选 | 设为 `1` 跳过 LLM |

## 项目结构

```
.
├── scripts/hub/                  # 聚合脚本
│   ├── aggregator.ts             # 入口
│   ├── docs-generator.ts         # README / Provider 文档生成器
│   ├── providers/                # Provider 插件（自动发现）
│   ├── enhancer.ts               # 能力推断
│   ├── analyzer.ts               # tier/speed 推断
│   ├── evaluator.ts              # 缓存 + view 输出
│   ├── taxonomy.ts               # 能力标签枚举
│   ├── family.ts                 # 家族规范化
│   ├── llm.ts                    # GitHub Models 客户端
│   ├── notify.ts                 # 企业微信通知
│   └── types.ts                  # 共享类型
├── data/
│   ├── models.json               # 主输出
│   ├── providers/<name>/         # 按 provider 过滤
│   ├── views/<view>/             # 按视图过滤
│   ├── capability-cache.json
│   ├── llm-cache.json
│   └── llm-budget.json
├── website/                      # 前端
├── docs/                         # 技术文档
├── .github/workflows/            # 同步 workflow
└── CLAUDE.md                     # Agent 上下文
```

详见 [docs/architecture.md](./docs/architecture.md)。

## License

MIT
