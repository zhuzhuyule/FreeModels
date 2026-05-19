# GitHub Models

> 本文档由 `npm run generate-docs` 根据 `data/models.json` 自动生成。

## 接入信息

| 项目 | 内容 |
|---|---|
| 内部 Provider ID | `github` |
| 官网 | [https://github.com/marketplace/models](https://github.com/marketplace/models) |
| 注册/登录 | [https://github.com/join](https://github.com/join) |
| 控制台 | [https://github.com/marketplace/models](https://github.com/marketplace/models) |
| API Key | [https://github.com/settings/tokens](https://github.com/settings/tokens) |
| 官方文档 | [https://docs.github.com/en/github-models](https://docs.github.com/en/github-models) |
| 模型/价格 | [https://github.com/marketplace?type=models](https://github.com/marketplace?type=models) |
| API Base URL | `https://models.github.ai/inference` |
| 鉴权方式 | bearer |
| 环境变量 | `GITHUB_TOKEN` |

## 当前统计

| 指标 | 数量 |
|---|---:|
| 总模型 | 43 |
| 免费模型 | 43 |
| 付费可试用 | 0 |

## 免费策略

按 Copilot 订阅层级（Free / Pro / Pro+ / Business / Enterprise）限速，免费层有较严格的 input/output token 限制。

## 当前免费模型

| Provider | Model ID | 名称 | 上下文 | 免费类型 | 限制 |
|---|---|---|---:|---|---|
| github  | `github/AI21-Jamba-1-5-Large` | AI21 Jamba 1.5 Large | 262K | 限速免费 | Dependent on Copilot subscription tier (Free/Pro/Pro+/Business/Enterprise) |
| github  | `github/Codestral-2501` | Codestral 25.01 | 256K | 限速免费 | Dependent on Copilot subscription tier (Free/Pro/Pro+/Business/Enterprise) |
| github  | `github/cohere-command-a` | Cohere Command A | 131K | 限速免费 | Dependent on Copilot subscription tier (Free/Pro/Pro+/Business/Enterprise) |
| github  | `github/Cohere-command-r-08-2024` | Cohere Command R 08-2024 | 131K | 限速免费 | Dependent on Copilot subscription tier (Free/Pro/Pro+/Business/Enterprise) |
| github  | `github/Cohere-command-r-plus-08-2024` | Cohere Command R+ 08-2024 | 131K | 限速免费 | Dependent on Copilot subscription tier (Free/Pro/Pro+/Business/Enterprise) |
| github  | `github/DeepSeek-R1` | DeepSeek-R1 | 128K | 限速免费 | Dependent on Copilot subscription tier (Free/Pro/Pro+/Business/Enterprise) |
| github  | `github/DeepSeek-R1-0528` | DeepSeek-R1-0528 | 128K | 限速免费 | Dependent on Copilot subscription tier (Free/Pro/Pro+/Business/Enterprise) |
| github  | `github/DeepSeek-V3-0324` | DeepSeek-V3-0324 | 128K | 限速免费 | Dependent on Copilot subscription tier (Free/Pro/Pro+/Business/Enterprise) |
| github  | `github/gpt-4-1` | OpenAI GPT-4.1 | 1M | 限速免费 | Dependent on Copilot subscription tier (Free/Pro/Pro+/Business/Enterprise) |
| github  | `github/gpt-4-1-mini` | OpenAI GPT-4.1-mini | 1M | 限速免费 | Dependent on Copilot subscription tier (Free/Pro/Pro+/Business/Enterprise) |
| github  | `github/gpt-4-1-nano` | OpenAI GPT-4.1-nano | 1M | 限速免费 | Dependent on Copilot subscription tier (Free/Pro/Pro+/Business/Enterprise) |
| github  | `github/gpt-4o` | OpenAI GPT-4o | 131K | 限速免费 | Dependent on Copilot subscription tier (Free/Pro/Pro+/Business/Enterprise) |
| github  | `github/gpt-4o-mini` | OpenAI GPT-4o mini | 131K | 限速免费 | Dependent on Copilot subscription tier (Free/Pro/Pro+/Business/Enterprise) |
| github  | `github/gpt-5` | OpenAI gpt-5 | 200K | 限速免费 | Dependent on Copilot subscription tier (Free/Pro/Pro+/Business/Enterprise) |
| github  | `github/gpt-5-chat` | OpenAI gpt-5-chat (preview) | 200K | 限速免费 | Dependent on Copilot subscription tier (Free/Pro/Pro+/Business/Enterprise) |
| github  | `github/gpt-5-mini` | OpenAI gpt-5-mini | 200K | 限速免费 | Dependent on Copilot subscription tier (Free/Pro/Pro+/Business/Enterprise) |
| github  | `github/gpt-5-nano` | OpenAI gpt-5-nano | 200K | 限速免费 | Dependent on Copilot subscription tier (Free/Pro/Pro+/Business/Enterprise) |
| github  | `github/grok-3` | Grok 3 | 131K | 限速免费 | Dependent on Copilot subscription tier (Free/Pro/Pro+/Business/Enterprise) |
| github  | `github/grok-3-mini` | Grok 3 Mini | 131K | 限速免费 | Dependent on Copilot subscription tier (Free/Pro/Pro+/Business/Enterprise) |
| github  | `github/Llama-3-2-11B-Vision-Instruct` | Llama-3.2-11B-Vision-Instruct | 128K | 限速免费 | Dependent on Copilot subscription tier (Free/Pro/Pro+/Business/Enterprise) |
| github  | `github/Llama-3-2-90B-Vision-Instruct` | Llama-3.2-90B-Vision-Instruct | 128K | 限速免费 | Dependent on Copilot subscription tier (Free/Pro/Pro+/Business/Enterprise) |
| github  | `github/Llama-3-3-70B-Instruct` | Llama-3.3-70B-Instruct | 128K | 限速免费 | Dependent on Copilot subscription tier (Free/Pro/Pro+/Business/Enterprise) |
| github  | `github/Llama-4-Maverick-17B-128E-Instruct-FP8` | Llama 4 Maverick 17B 128E Instruct FP8 | 1M | 限速免费 | Dependent on Copilot subscription tier (Free/Pro/Pro+/Business/Enterprise) |
| github  | `github/Llama-4-Scout-17B-16E-Instruct` | Llama 4 Scout 17B 16E Instruct | 10M | 限速免费 | Dependent on Copilot subscription tier (Free/Pro/Pro+/Business/Enterprise) |
| github  | `github/MAI-DS-R1` | MAI-DS-R1 | 128K | 限速免费 | Dependent on Copilot subscription tier (Free/Pro/Pro+/Business/Enterprise) |
| github  | `github/Meta-Llama-3-1-405B-Instruct` | Meta-Llama-3.1-405B-Instruct | 131K | 限速免费 | Dependent on Copilot subscription tier (Free/Pro/Pro+/Business/Enterprise) |
| github  | `github/Meta-Llama-3-1-8B-Instruct` | Meta-Llama-3.1-8B-Instruct | 131K | 限速免费 | Dependent on Copilot subscription tier (Free/Pro/Pro+/Business/Enterprise) |
| github  | `github/Ministral-3B` | Ministral 3B | 131K | 限速免费 | Dependent on Copilot subscription tier (Free/Pro/Pro+/Business/Enterprise) |
| github  | `github/mistral-medium-2505` | Mistral Medium 3 (25.05) | 128K | 限速免费 | Dependent on Copilot subscription tier (Free/Pro/Pro+/Business/Enterprise) |
| github  | `github/mistral-small-2503` | Mistral Small 3.1 | 128K | 限速免费 | Dependent on Copilot subscription tier (Free/Pro/Pro+/Business/Enterprise) |
| github  | `github/o1` | OpenAI o1 | 200K | 限速免费 | Dependent on Copilot subscription tier (Free/Pro/Pro+/Business/Enterprise) |
| github  | `github/o1-mini` | OpenAI o1-mini | 128K | 限速免费 | Dependent on Copilot subscription tier (Free/Pro/Pro+/Business/Enterprise) |
| github  | `github/o1-preview` | OpenAI o1-preview | 128K | 限速免费 | Dependent on Copilot subscription tier (Free/Pro/Pro+/Business/Enterprise) |
| github  | `github/o3` | OpenAI o3 | 200K | 限速免费 | Dependent on Copilot subscription tier (Free/Pro/Pro+/Business/Enterprise) |
| github  | `github/o3-mini` | OpenAI o3-mini | 200K | 限速免费 | Dependent on Copilot subscription tier (Free/Pro/Pro+/Business/Enterprise) |
| github  | `github/o4-mini` | OpenAI o4-mini | 200K | 限速免费 | Dependent on Copilot subscription tier (Free/Pro/Pro+/Business/Enterprise) |
| github  | `github/Phi-4` | Phi-4 | 16K | 限速免费 | Dependent on Copilot subscription tier (Free/Pro/Pro+/Business/Enterprise) |
| github  | `github/Phi-4-mini-instruct` | Phi-4-mini-instruct | 128K | 限速免费 | Dependent on Copilot subscription tier (Free/Pro/Pro+/Business/Enterprise) |
| github  | `github/Phi-4-mini-reasoning` | Phi-4-mini-reasoning | 128K | 限速免费 | Dependent on Copilot subscription tier (Free/Pro/Pro+/Business/Enterprise) |
| github  | `github/Phi-4-multimodal-instruct` | Phi-4-multimodal-instruct | 128K | 限速免费 | Dependent on Copilot subscription tier (Free/Pro/Pro+/Business/Enterprise) |
| github  | `github/Phi-4-reasoning` | Phi-4-reasoning | 33K | 限速免费 | Dependent on Copilot subscription tier (Free/Pro/Pro+/Business/Enterprise) |
| github  | `github/text-embedding-3-large` | OpenAI Text Embedding 3 (large) | 8K | 限速免费 | Dependent on Copilot subscription tier (Free/Pro/Pro+/Business/Enterprise) |
| github  | `github/text-embedding-3-small` | OpenAI Text Embedding 3 (small) | 8K | 限速免费 | Dependent on Copilot subscription tier (Free/Pro/Pro+/Business/Enterprise) |
