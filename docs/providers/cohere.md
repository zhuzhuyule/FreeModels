# Cohere

> 本文档由 `npm run generate-docs` 根据 `data/models.json` 自动生成。

## 接入信息

| 项目 | 内容 |
|---|---|
| 内部 Provider ID | `cohere` |
| 官网 | [https://cohere.com](https://cohere.com) |
| 注册/登录 | [https://dashboard.cohere.com/welcome/register](https://dashboard.cohere.com/welcome/register) |
| 控制台 | [https://dashboard.cohere.com](https://dashboard.cohere.com) |
| API Key | [https://dashboard.cohere.com/api-keys](https://dashboard.cohere.com/api-keys) |
| 官方文档 | [https://docs.cohere.com](https://docs.cohere.com) |
| 模型/价格 | [https://docs.cohere.com/docs/models](https://docs.cohere.com/docs/models) |
| API Base URL | `https://api.cohere.com/v1` |
| 鉴权方式 | bearer |
| 环境变量 | `COHERE_API_KEY` |

## 当前统计

| 指标 | 数量 |
|---|---:|
| 总模型 | 30 |
| 免费模型 | 30 |
| 付费可试用 | 0 |

## 免费策略

Trial key 永久免费：20 RPM、1000 requests/月，所有模型共享配额。

## 当前免费模型

| Provider | Model ID | 名称 | 上下文 | 免费类型 | 限制 |
|---|---|---|---:|---|---|
| cohere  | `cohere/c4ai-aya-expanse-32b` | c4ai-aya-expanse-32b | 128K | 限速免费 | 20 RPM / 1000 requests/month shared across all models on trial key |
| cohere  | `cohere/c4ai-aya-vision-32b` | c4ai-aya-vision-32b | 16K | 限速免费 | 20 RPM / 1000 requests/month shared across all models on trial key |
| cohere  | `cohere/cohere-transcribe-03-2026` | cohere-transcribe-03-2026 | 33K | 限速免费 | 20 RPM / 1000 requests/month shared across all models on trial key |
| cohere  | `cohere/command-a-03-2025` | command-a-03-2025 | 288K | 限速免费 | 20 RPM / 1000 requests/month shared across all models on trial key |
| cohere  | `cohere/command-a-plus-05-2026` | command-a-plus-05-2026 | 128K | 限速免费 | 20 RPM / 1000 requests/month shared across all models on trial key |
| cohere  | `cohere/command-a-reasoning-08-2025` | command-a-reasoning-08-2025 | 289K | 限速免费 | 20 RPM / 1000 requests/month shared across all models on trial key |
| cohere  | `cohere/command-a-translate-08-2025` | command-a-translate-08-2025 | 9K | 限速免费 | 20 RPM / 1000 requests/month shared across all models on trial key |
| cohere  | `cohere/command-a-vision-07-2025` | command-a-vision-07-2025 | 128K | 限速免费 | 20 RPM / 1000 requests/month shared across all models on trial key |
| cohere  | `cohere/command-r-08-2024` | command-r-08-2024 | 128K | 限速免费 | 20 RPM / 1000 requests/month shared across all models on trial key |
| cohere  | `cohere/command-r-plus-08-2024` | command-r-plus-08-2024 | 128K | 限速免费 | 20 RPM / 1000 requests/month shared across all models on trial key |
| cohere  | `cohere/command-r7b-12-2024` | command-r7b-12-2024 | 132K | 限速免费 | 20 RPM / 1000 requests/month shared across all models on trial key |
| cohere  | `cohere/command-r7b-arabic-02-2025` | command-r7b-arabic-02-2025 | 128K | 限速免费 | 20 RPM / 1000 requests/month shared across all models on trial key |
| cohere  | `cohere/embed-english-light-v3.0` | embed-english-light-v3.0 | 512 | 限速免费 | 20 RPM / 1000 requests/month shared across all models on trial key |
| cohere  | `cohere/embed-english-light-v3.0-image` | embed-english-light-v3.0-image | unknown | 限速免费 | 20 RPM / 1000 requests/month shared across all models on trial key |
| cohere  | `cohere/embed-english-v3.0` | embed-english-v3.0 | 512 | 限速免费 | 20 RPM / 1000 requests/month shared across all models on trial key |
| cohere  | `cohere/embed-english-v3.0-image` | embed-english-v3.0-image | unknown | 限速免费 | 20 RPM / 1000 requests/month shared across all models on trial key |
| cohere  | `cohere/embed-multilingual-light-v3.0` | embed-multilingual-light-v3.0 | 512 | 限速免费 | 20 RPM / 1000 requests/month shared across all models on trial key |
| cohere  | `cohere/embed-multilingual-light-v3.0-image` | embed-multilingual-light-v3.0-image | unknown | 限速免费 | 20 RPM / 1000 requests/month shared across all models on trial key |
| cohere  | `cohere/embed-multilingual-v3.0` | embed-multilingual-v3.0 | 512 | 限速免费 | 20 RPM / 1000 requests/month shared across all models on trial key |
| cohere  | `cohere/embed-multilingual-v3.0-image` | embed-multilingual-v3.0-image | unknown | 限速免费 | 20 RPM / 1000 requests/month shared across all models on trial key |
| cohere  | `cohere/embed-v4.0` | embed-v4.0 | 8K | 限速免费 | 20 RPM / 1000 requests/month shared across all models on trial key |
| cohere  | `cohere/rerank-english-v3.0` | rerank-english-v3.0 | 4K | 限速免费 | 20 RPM / 1000 requests/month shared across all models on trial key |
| cohere  | `cohere/rerank-multilingual-v3.0` | rerank-multilingual-v3.0 | 4K | 限速免费 | 20 RPM / 1000 requests/month shared across all models on trial key |
| cohere  | `cohere/rerank-v3.5` | rerank-v3.5 | 4K | 限速免费 | 20 RPM / 1000 requests/month shared across all models on trial key |
| cohere  | `cohere/rerank-v4.0-fast` | rerank-v4.0-fast | 33K | 限速免费 | 20 RPM / 1000 requests/month shared across all models on trial key |
| cohere  | `cohere/rerank-v4.0-pro` | rerank-v4.0-pro | 33K | 限速免费 | 20 RPM / 1000 requests/month shared across all models on trial key |
| cohere  | `cohere/tiny-aya-earth` | tiny-aya-earth | 8K | 限速免费 | 20 RPM / 1000 requests/month shared across all models on trial key |
| cohere  | `cohere/tiny-aya-fire` | tiny-aya-fire | 8K | 限速免费 | 20 RPM / 1000 requests/month shared across all models on trial key |
| cohere  | `cohere/tiny-aya-global` | tiny-aya-global | 8K | 限速免费 | 20 RPM / 1000 requests/month shared across all models on trial key |
| cohere  | `cohere/tiny-aya-water` | tiny-aya-water | 8K | 限速免费 | 20 RPM / 1000 requests/month shared across all models on trial key |
