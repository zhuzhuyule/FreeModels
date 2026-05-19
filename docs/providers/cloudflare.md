# Cloudflare Workers AI

> 本文档由 `npm run generate-docs` 根据 `data/models.json` 自动生成。

## 接入信息

| 项目 | 内容 |
|---|---|
| 内部 Provider ID | `cloudflare` |
| 官网 | [https://developers.cloudflare.com/workers-ai](https://developers.cloudflare.com/workers-ai) |
| 注册/登录 | [https://dash.cloudflare.com/sign-up](https://dash.cloudflare.com/sign-up) |
| 控制台 | [https://dash.cloudflare.com](https://dash.cloudflare.com) |
| API Key | [https://dash.cloudflare.com/profile/api-tokens](https://dash.cloudflare.com/profile/api-tokens) |
| 官方文档 | [https://developers.cloudflare.com/workers-ai](https://developers.cloudflare.com/workers-ai) |
| 模型/价格 | [https://developers.cloudflare.com/workers-ai/models](https://developers.cloudflare.com/workers-ai/models) |
| API Base URL | `https://api.cloudflare.com/client/v4/accounts/{account_id}/ai/v1` |
| 鉴权方式 | bearer |
| 环境变量 | `CLOUDFLARE_API_KEY` |

## 当前统计

| 指标 | 数量 |
|---|---:|
| 总模型 | 72 |
| 免费模型 | 72 |
| 付费可试用 | 0 |

## 免费策略

账户级每日 10,000 neurons 免费额度，所有 Workers AI 模型共享。

## 当前免费模型

| Provider | Model ID | 名称 | 上下文 | 免费类型 | 限制 |
|---|---|---|---:|---|---|
| cloudflare  | `cloudflare/@cf/ai4bharat/indictrans2-en-indic-1B` | @cf/ai4bharat/indictrans2-en-indic-1B | unknown | 日 token 配额 | 10,000 neurons/day account-wide (shared across all Workers AI models) |
| cloudflare  | `cloudflare/@cf/aisingapore/gemma-sea-lion-v4-27b-it` | @cf/aisingapore/gemma-sea-lion-v4-27b-it | 128K | 日 token 配额 | 10,000 neurons/day account-wide (shared across all Workers AI models) |
| cloudflare  | `cloudflare/@cf/baai/bge-base-en-v1.5` | @cf/baai/bge-base-en-v1.5 | 154K | 日 token 配额 | 10,000 neurons/day account-wide (shared across all Workers AI models) |
| cloudflare  | `cloudflare/@cf/baai/bge-large-en-v1.5` | @cf/baai/bge-large-en-v1.5 | unknown | 日 token 配额 | 10,000 neurons/day account-wide (shared across all Workers AI models) |
| cloudflare  | `cloudflare/@cf/baai/bge-m3` | @cf/baai/bge-m3 | 60K | 日 token 配额 | 10,000 neurons/day account-wide (shared across all Workers AI models) |
| cloudflare  | `cloudflare/@cf/baai/bge-reranker-base` | @cf/baai/bge-reranker-base | unknown | 日 token 配额 | 10,000 neurons/day account-wide (shared across all Workers AI models) |
| cloudflare  | `cloudflare/@cf/baai/bge-small-en-v1.5` | @cf/baai/bge-small-en-v1.5 | unknown | 日 token 配额 | 10,000 neurons/day account-wide (shared across all Workers AI models) |
| cloudflare  | `cloudflare/@cf/black-forest-labs/flux-1-schnell` | @cf/black-forest-labs/flux-1-schnell | unknown | 日 token 配额 | 10,000 neurons/day account-wide (shared across all Workers AI models) |
| cloudflare  | `cloudflare/@cf/black-forest-labs/flux-2-dev` | @cf/black-forest-labs/flux-2-dev | unknown | 日 token 配额 | 10,000 neurons/day account-wide (shared across all Workers AI models) |
| cloudflare  | `cloudflare/@cf/black-forest-labs/flux-2-klein-4b` | @cf/black-forest-labs/flux-2-klein-4b | unknown | 日 token 配额 | 10,000 neurons/day account-wide (shared across all Workers AI models) |
| cloudflare  | `cloudflare/@cf/black-forest-labs/flux-2-klein-9b` | @cf/black-forest-labs/flux-2-klein-9b | unknown | 日 token 配额 | 10,000 neurons/day account-wide (shared across all Workers AI models) |
| cloudflare  | `cloudflare/@cf/bytedance/stable-diffusion-xl-lightning` | @cf/bytedance/stable-diffusion-xl-lightning | unknown | 日 token 配额 | 10,000 neurons/day account-wide (shared across all Workers AI models) |
| cloudflare  | `cloudflare/@cf/deepgram/aura-1` | @cf/deepgram/aura-1 | unknown | 日 token 配额 | 10,000 neurons/day account-wide (shared across all Workers AI models) |
| cloudflare  | `cloudflare/@cf/deepgram/aura-2-en` | @cf/deepgram/aura-2-en | unknown | 日 token 配额 | 10,000 neurons/day account-wide (shared across all Workers AI models) |
| cloudflare  | `cloudflare/@cf/deepgram/aura-2-es` | @cf/deepgram/aura-2-es | unknown | 日 token 配额 | 10,000 neurons/day account-wide (shared across all Workers AI models) |
| cloudflare  | `cloudflare/@cf/deepgram/flux` | @cf/deepgram/flux | unknown | 日 token 配额 | 10,000 neurons/day account-wide (shared across all Workers AI models) |
| cloudflare  | `cloudflare/@cf/deepgram/nova-3` | @cf/deepgram/nova-3 | unknown | 日 token 配额 | 10,000 neurons/day account-wide (shared across all Workers AI models) |
| cloudflare  | `cloudflare/@cf/deepseek-ai/deepseek-r1-distill-qwen-32b` | @cf/deepseek-ai/deepseek-r1-distill-qwen-32b | 80K | 日 token 配额 | 10,000 neurons/day account-wide (shared across all Workers AI models) |
| cloudflare  | `cloudflare/@cf/defog/sqlcoder-7b-2` | @cf/defog/sqlcoder-7b-2 | 10K | 日 token 配额 | 10,000 neurons/day account-wide (shared across all Workers AI models) |
| cloudflare  | `cloudflare/@cf/facebook/bart-large-cnn` | @cf/facebook/bart-large-cnn | unknown | 日 token 配额 | 10,000 neurons/day account-wide (shared across all Workers AI models) |
| cloudflare  | `cloudflare/@cf/google/embeddinggemma-300m` | @cf/google/embeddinggemma-300m | unknown | 日 token 配额 | 10,000 neurons/day account-wide (shared across all Workers AI models) |
| cloudflare  | `cloudflare/@cf/google/gemma-2b-it-lora` | @cf/google/gemma-2b-it-lora | 8K | 日 token 配额 | 10,000 neurons/day account-wide (shared across all Workers AI models) |
| cloudflare  | `cloudflare/@cf/google/gemma-3-12b-it` | @cf/google/gemma-3-12b-it | 80K | 日 token 配额 | 10,000 neurons/day account-wide (shared across all Workers AI models) |
| cloudflare  | `cloudflare/@cf/google/gemma-4-26b-a4b-it` | @cf/google/gemma-4-26b-a4b-it | 256K | 日 token 配额 | 10,000 neurons/day account-wide (shared across all Workers AI models) |
| cloudflare  | `cloudflare/@cf/google/gemma-7b-it-lora` | @cf/google/gemma-7b-it-lora | 4K | 日 token 配额 | 10,000 neurons/day account-wide (shared across all Workers AI models) |
| cloudflare  | `cloudflare/@cf/huggingface/distilbert-sst-2-int8` | @cf/huggingface/distilbert-sst-2-int8 | unknown | 日 token 配额 | 10,000 neurons/day account-wide (shared across all Workers AI models) |
| cloudflare  | `cloudflare/@cf/ibm-granite/granite-4.0-h-micro` | @cf/ibm-granite/granite-4.0-h-micro | 131K | 日 token 配额 | 10,000 neurons/day account-wide (shared across all Workers AI models) |
| cloudflare  | `cloudflare/@cf/leonardo/lucid-origin` | @cf/leonardo/lucid-origin | unknown | 日 token 配额 | 10,000 neurons/day account-wide (shared across all Workers AI models) |
| cloudflare  | `cloudflare/@cf/leonardo/phoenix-1.0` | @cf/leonardo/phoenix-1.0 | unknown | 日 token 配额 | 10,000 neurons/day account-wide (shared across all Workers AI models) |
| cloudflare  | `cloudflare/@cf/llava-hf/llava-1.5-7b-hf` | @cf/llava-hf/llava-1.5-7b-hf | unknown | 日 token 配额 | 10,000 neurons/day account-wide (shared across all Workers AI models) |
| cloudflare  | `cloudflare/@cf/lykon/dreamshaper-8-lcm` | @cf/lykon/dreamshaper-8-lcm | unknown | 日 token 配额 | 10,000 neurons/day account-wide (shared across all Workers AI models) |
| cloudflare  | `cloudflare/@cf/meta-llama/llama-2-7b-chat-hf-lora` | @cf/meta-llama/llama-2-7b-chat-hf-lora | 8K | 日 token 配额 | 10,000 neurons/day account-wide (shared across all Workers AI models) |
| cloudflare  | `cloudflare/@cf/meta/llama-2-7b-chat-fp16` | @cf/meta/llama-2-7b-chat-fp16 | 4K | 日 token 配额 | 10,000 neurons/day account-wide (shared across all Workers AI models) |
| cloudflare  | `cloudflare/@cf/meta/llama-2-7b-chat-int8` | @cf/meta/llama-2-7b-chat-int8 | 8K | 日 token 配额 | 10,000 neurons/day account-wide (shared across all Workers AI models) |
| cloudflare  | `cloudflare/@cf/meta/llama-3-8b-instruct` | @cf/meta/llama-3-8b-instruct | 8K | 日 token 配额 | 10,000 neurons/day account-wide (shared across all Workers AI models) |
| cloudflare  | `cloudflare/@cf/meta/llama-3-8b-instruct-awq` | @cf/meta/llama-3-8b-instruct-awq | 8K | 日 token 配额 | 10,000 neurons/day account-wide (shared across all Workers AI models) |
| cloudflare  | `cloudflare/@cf/meta/llama-3.1-8b-instruct-awq` | @cf/meta/llama-3.1-8b-instruct-awq | 8K | 日 token 配额 | 10,000 neurons/day account-wide (shared across all Workers AI models) |
| cloudflare  | `cloudflare/@cf/meta/llama-3.1-8b-instruct-fp8` | @cf/meta/llama-3.1-8b-instruct-fp8 | 32K | 日 token 配额 | 10,000 neurons/day account-wide (shared across all Workers AI models) |
| cloudflare  | `cloudflare/@cf/meta/llama-3.2-11b-vision-instruct` | @cf/meta/llama-3.2-11b-vision-instruct | 128K | 日 token 配额 | 10,000 neurons/day account-wide (shared across all Workers AI models) |
| cloudflare  | `cloudflare/@cf/meta/llama-3.2-1b-instruct` | @cf/meta/llama-3.2-1b-instruct | 60K | 日 token 配额 | 10,000 neurons/day account-wide (shared across all Workers AI models) |
| cloudflare  | `cloudflare/@cf/meta/llama-3.2-3b-instruct` | @cf/meta/llama-3.2-3b-instruct | 80K | 日 token 配额 | 10,000 neurons/day account-wide (shared across all Workers AI models) |
| cloudflare  | `cloudflare/@cf/meta/llama-3.3-70b-instruct-fp8-fast` | @cf/meta/llama-3.3-70b-instruct-fp8-fast | 24K | 日 token 配额 | 10,000 neurons/day account-wide (shared across all Workers AI models) |
| cloudflare  | `cloudflare/@cf/meta/llama-4-scout-17b-16e-instruct` | @cf/meta/llama-4-scout-17b-16e-instruct | 131K | 日 token 配额 | 10,000 neurons/day account-wide (shared across all Workers AI models) |
| cloudflare  | `cloudflare/@cf/meta/llama-guard-3-8b` | @cf/meta/llama-guard-3-8b | 131K | 日 token 配额 | 10,000 neurons/day account-wide (shared across all Workers AI models) |
| cloudflare  | `cloudflare/@cf/meta/m2m100-1.2b` | @cf/meta/m2m100-1.2b | unknown | 日 token 配额 | 10,000 neurons/day account-wide (shared across all Workers AI models) |
| cloudflare  | `cloudflare/@cf/microsoft/phi-2` | @cf/microsoft/phi-2 | 2K | 日 token 配额 | 10,000 neurons/day account-wide (shared across all Workers AI models) |
| cloudflare  | `cloudflare/@cf/microsoft/resnet-50` | @cf/microsoft/resnet-50 | unknown | 日 token 配额 | 10,000 neurons/day account-wide (shared across all Workers AI models) |
| cloudflare  | `cloudflare/@cf/mistral/mistral-7b-instruct-v0.1` | @cf/mistral/mistral-7b-instruct-v0.1 | 3K | 日 token 配额 | 10,000 neurons/day account-wide (shared across all Workers AI models) |
| cloudflare  | `cloudflare/@cf/mistral/mistral-7b-instruct-v0.2-lora` | @cf/mistral/mistral-7b-instruct-v0.2-lora | 15K | 日 token 配额 | 10,000 neurons/day account-wide (shared across all Workers AI models) |
| cloudflare  | `cloudflare/@cf/mistralai/mistral-small-3.1-24b-instruct` | @cf/mistralai/mistral-small-3.1-24b-instruct | 128K | 日 token 配额 | 10,000 neurons/day account-wide (shared across all Workers AI models) |
| cloudflare  | `cloudflare/@cf/moonshotai/kimi-k2.5` | @cf/moonshotai/kimi-k2.5 | 256K | 日 token 配额 | 10,000 neurons/day account-wide (shared across all Workers AI models) |
| cloudflare  | `cloudflare/@cf/moonshotai/kimi-k2.6` | @cf/moonshotai/kimi-k2.6 | 262K | 日 token 配额 | 10,000 neurons/day account-wide (shared across all Workers AI models) |
| cloudflare  | `cloudflare/@cf/myshell-ai/melotts` | @cf/myshell-ai/melotts | unknown | 日 token 配额 | 10,000 neurons/day account-wide (shared across all Workers AI models) |
| cloudflare  | `cloudflare/@cf/nvidia/nemotron-3-120b-a12b` | @cf/nvidia/nemotron-3-120b-a12b | 256K | 日 token 配额 | 10,000 neurons/day account-wide (shared across all Workers AI models) |
| cloudflare  | `cloudflare/@cf/openai/gpt-oss-120b` | @cf/openai/gpt-oss-120b | 128K | 日 token 配额 | 10,000 neurons/day account-wide (shared across all Workers AI models) |
| cloudflare  | `cloudflare/@cf/openai/gpt-oss-20b` | @cf/openai/gpt-oss-20b | 128K | 日 token 配额 | 10,000 neurons/day account-wide (shared across all Workers AI models) |
| cloudflare  | `cloudflare/@cf/openai/whisper` | @cf/openai/whisper | unknown | 日 token 配额 | 10,000 neurons/day account-wide (shared across all Workers AI models) |
| cloudflare  | `cloudflare/@cf/openai/whisper-large-v3-turbo` | @cf/openai/whisper-large-v3-turbo | unknown | 日 token 配额 | 10,000 neurons/day account-wide (shared across all Workers AI models) |
| cloudflare  | `cloudflare/@cf/openai/whisper-tiny-en` | @cf/openai/whisper-tiny-en | unknown | 日 token 配额 | 10,000 neurons/day account-wide (shared across all Workers AI models) |
| cloudflare  | `cloudflare/@cf/pfnet/plamo-embedding-1b` | @cf/pfnet/plamo-embedding-1b | unknown | 日 token 配额 | 10,000 neurons/day account-wide (shared across all Workers AI models) |
| cloudflare  | `cloudflare/@cf/qwen/qwen2.5-coder-32b-instruct` | @cf/qwen/qwen2.5-coder-32b-instruct | 33K | 日 token 配额 | 10,000 neurons/day account-wide (shared across all Workers AI models) |
| cloudflare  | `cloudflare/@cf/qwen/qwen3-30b-a3b-fp8` | @cf/qwen/qwen3-30b-a3b-fp8 | 33K | 日 token 配额 | 10,000 neurons/day account-wide (shared across all Workers AI models) |
| cloudflare  | `cloudflare/@cf/qwen/qwen3-embedding-0.6b` | @cf/qwen/qwen3-embedding-0.6b | 8K | 日 token 配额 | 10,000 neurons/day account-wide (shared across all Workers AI models) |
| cloudflare  | `cloudflare/@cf/qwen/qwq-32b` | @cf/qwen/qwq-32b | 24K | 日 token 配额 | 10,000 neurons/day account-wide (shared across all Workers AI models) |
| cloudflare  | `cloudflare/@cf/runwayml/stable-diffusion-v1-5-img2img` | @cf/runwayml/stable-diffusion-v1-5-img2img | unknown | 日 token 配额 | 10,000 neurons/day account-wide (shared across all Workers AI models) |
| cloudflare  | `cloudflare/@cf/runwayml/stable-diffusion-v1-5-inpainting` | @cf/runwayml/stable-diffusion-v1-5-inpainting | unknown | 日 token 配额 | 10,000 neurons/day account-wide (shared across all Workers AI models) |
| cloudflare  | `cloudflare/@cf/stabilityai/stable-diffusion-xl-base-1.0` | @cf/stabilityai/stable-diffusion-xl-base-1.0 | unknown | 日 token 配额 | 10,000 neurons/day account-wide (shared across all Workers AI models) |
| cloudflare  | `cloudflare/@cf/unum/uform-gen2-qwen-500m` | @cf/unum/uform-gen2-qwen-500m | unknown | 日 token 配额 | 10,000 neurons/day account-wide (shared across all Workers AI models) |
| cloudflare  | `cloudflare/@cf/zai-org/glm-4.7-flash` | @cf/zai-org/glm-4.7-flash | 131K | 日 token 配额 | 10,000 neurons/day account-wide (shared across all Workers AI models) |
| cloudflare  | `cloudflare/@hf/google/gemma-7b-it` | @hf/google/gemma-7b-it | 8K | 日 token 配额 | 10,000 neurons/day account-wide (shared across all Workers AI models) |
| cloudflare  | `cloudflare/@hf/mistral/mistral-7b-instruct-v0.2` | @hf/mistral/mistral-7b-instruct-v0.2 | 3K | 日 token 配额 | 10,000 neurons/day account-wide (shared across all Workers AI models) |
| cloudflare  | `cloudflare/@hf/nousresearch/hermes-2-pro-mistral-7b` | @hf/nousresearch/hermes-2-pro-mistral-7b | 24K | 日 token 配额 | 10,000 neurons/day account-wide (shared across all Workers AI models) |
