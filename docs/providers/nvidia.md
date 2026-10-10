# NVIDIA AI

> 本文档由 `npm run generate-docs` 根据 `data/models.json` 自动生成。

## 接入信息

| 项目 | 内容 |
|---|---|
| 内部 Provider ID | `nvidia` |
| 官网 | [https://developer.nvidia.com/ai](https://developer.nvidia.com/ai) |
| 注册/登录 | [https://build.nvidia.com](https://build.nvidia.com) |
| 控制台 | [https://build.nvidia.com](https://build.nvidia.com) |
| API Key | [https://build.nvidia.com/explore/discover](https://build.nvidia.com/explore/discover) |
| 官方文档 | [https://docs.api.nvidia.com/nim](https://docs.api.nvidia.com/nim) |
| 模型/价格 | [https://build.nvidia.com/models](https://build.nvidia.com/models) |
| API Base URL | `https://integrate.api.nvidia.com/v1` |
| 鉴权方式 | bearer |
| 环境变量 | `NVIDIA_API_KEY` |

## 当前统计

| 指标 | 数量 |
|---|---:|
| 总模型 | 80 |
| 免费模型 | 18 |
| 付费可试用 | 0 |

## 免费策略

公共 NIM 端点（build.nvidia.com 标记的免费模型）限速约 40 RPM / 10,000 requests/天，限速内不收费；官方 limits 页为准。

## 当前免费模型

| Provider | Model ID | 名称 | 上下文 | 免费类型 | 限制 |
|---|---|---|---:|---|---|
| nvidia  | `deepseek-ai/deepseek-v4.1-flash` | deepseek-v4.1-flash | unknown | 限速免费 | 40 RPM / 10000 RPD / Public NIM endpoints: Up to 40 rpm and 10,000 requests per day; limits may vary by model and by traffic |
| nvidia  | `google/diffusiongemma-26b-a4b-it` | diffusiongemma-26b-a4b-it | unknown | 限速免费 | 40 RPM / 10000 RPD / Public NIM endpoints: Up to 40 rpm and 10,000 requests per day; limits may vary by model and by traffic |
| nvidia  | `google/gemma-4-31b-it` | gemma-4-31b-it | unknown | 限速免费 | 40 RPM / 10000 RPD / Public NIM endpoints: Up to 40 rpm and 10,000 requests per day; limits may vary by model and by traffic |
| nvidia  | `ising-calibration-1.5-31b` | ising-calibration-1.5-31b | unknown | 限速免费 | 40 RPM / 10000 RPD / Public NIM endpoints: Up to 40 rpm and 10,000 requests per day; limits may vary by model and by traffic |
| nvidia  | `meta/llama-3.2-11b-vision-instruct` | llama-3.2-11b-vision-instruct | unknown | 限速免费 | 40 RPM / 10000 RPD / Public NIM endpoints: Up to 40 rpm and 10,000 requests per day; limits may vary by model and by traffic |
| nvidia  | `meta/llama-3.2-90b-vision-instruct` | llama-3.2-90b-vision-instruct | unknown | 限速免费 | 40 RPM / 10000 RPD / Public NIM endpoints: Up to 40 rpm and 10,000 requests per day; limits may vary by model and by traffic |
| nvidia  | `meta/llama-guard-4-12b` | llama-guard-4-12b | unknown | 限速免费 | 40 RPM / 10000 RPD / Public NIM endpoints: Up to 40 rpm and 10,000 requests per day; limits may vary by model and by traffic |
| nvidia  | `meta/muse-glimmer-30b` | muse-glimmer-30b | unknown | 限速免费 | 40 RPM / 10000 RPD / Public NIM endpoints: Up to 40 rpm and 10,000 requests per day; limits may vary by model and by traffic |
| nvidia  | `moonshotai/kimi-k3` | kimi-k3 | unknown | 限速免费 | 40 RPM / 10000 RPD / Public NIM endpoints: Up to 40 rpm and 10,000 requests per day; limits may vary by model and by traffic |
| nvidia  | `nemotron-3-embed-1b` | nemotron-3-embed-1b | unknown | 限速免费 | 40 RPM / 10000 RPD / Public NIM endpoints: Up to 40 rpm and 10,000 requests per day; limits may vary by model and by traffic |
| nvidia  | `nemotron-3-nano-omni-30b-a3b-reasoning` | nemotron-3-nano-omni-30b-a3b-reasoning | unknown | 限速免费 | 40 RPM / 10000 RPD / Public NIM endpoints: Up to 40 rpm and 10,000 requests per day; limits may vary by model and by traffic |
| nvidia  | `nemotron-3-super-120b-a12b` | nemotron-3-super-120b-a12b | unknown | 限速免费 | 40 RPM / 10000 RPD / Public NIM endpoints: Up to 40 rpm and 10,000 requests per day; limits may vary by model and by traffic |
| nvidia  | `nemotron-3-ultra-550b-a55b` | nemotron-3-ultra-550b-a55b | unknown | 限速免费 | 40 RPM / 10000 RPD / Public NIM endpoints: Up to 40 rpm and 10,000 requests per day; limits may vary by model and by traffic |
| nvidia  | `nemotron-3.5-content-safety` | nemotron-3.5-content-safety | unknown | 限速免费 | 40 RPM / 10000 RPD / Public NIM endpoints: Up to 40 rpm and 10,000 requests per day; limits may vary by model and by traffic |
| nvidia  | `nemotron-3.5-lightning-30b-a3b` | nemotron-3.5-lightning-30b-a3b | unknown | 限速免费 | 40 RPM / 10000 RPD / Public NIM endpoints: Up to 40 rpm and 10,000 requests per day; limits may vary by model and by traffic |
| nvidia  | `openai/gpt-oss-20b` | gpt-oss-20b | unknown | 限速免费 | 40 RPM / 10000 RPD / Public NIM endpoints: Up to 40 rpm and 10,000 requests per day; limits may vary by model and by traffic |
| nvidia  | `poolside/laguna-xs-2.1` | laguna-xs-2.1 | unknown | 限速免费 | 40 RPM / 10000 RPD / Public NIM endpoints: Up to 40 rpm and 10,000 requests per day; limits may vary by model and by traffic |
| nvidia  | `riva-translate-4b-instruct-v2` | riva-translate-4b-instruct-v2 | unknown | 限速免费 | 40 RPM / 10000 RPD / Public NIM endpoints: Up to 40 rpm and 10,000 requests per day; limits may vary by model and by traffic |
