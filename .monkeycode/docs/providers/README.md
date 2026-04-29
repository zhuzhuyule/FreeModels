# Provider 文档索引

本文档目录包含所有 AI 模型 Provider 的详细文档。

## Provider 列表

| Provider | 模型数 | 数据来源 | 免费模型数 | 文档 |
|----------|--------|----------|------------|------|
| Gitee | 201 | ai.gitee.com API | 44 + 144 体验 | [gitee.md](./gitee.md) |
| Cerebras | 4 | inference-docs.cerebras.ai | 2 | [cerebras.md](./cerebras.md) |
| Groq | 12 | groq.com/pricing | 0 | [groq.md](./groq.md) |
| LongCat | 7 | longcat.chat/docs | 7 | [longcat.md](./longcat.md) |
| NVIDIA | 139 | api.nvidia.com + HTML | 50 | [nvidia.md](./nvidia.md) |
| Xunfei | 64 | maas.xfyun.cn | 0 | [xunfei.md](./xunfei.md) |
| Google | 32 | ai.google.dev/pricing | 17 | [google.md](./google.md) |
| OpenRouter | 56 | openrouter.ai API | 56 | [openrouter.md](./openrouter.md) |
| **总计** | **515** | | **~226** | |

## 数据源分类

### API 类

| Provider | API URL | 认证要求 |
|----------|---------|----------|
| Gitee | `https://ai.gitee.com/api/pay/service/operations?vendor=` | 否 |
| Xunfei | `https://maas.xfyun.cn/api/v1/gpt-finetune/model/base/list-v2` | 可能需要 |
| NVIDIA | `https://integrate.api.nvidia.com/v1/models` | API Key |
| OpenRouter | `https://openrouter.ai/api/frontend/models/find?fmt=cards&max_price=0` | 否 |

### HTML/文档解析类

| Provider | 页面 URL | 说明 |
|----------|----------|------|
| Google | `https://ai.google.dev/gemini-api/docs/pricing.md.txt?hl=zh-cn` | 定价文档 |
| Groq | `https://groq.com/pricing` | 定价页面 |
| Cerebras | `https://inference-docs.cerebras.ai/models/overview` | 模型概述 |
| LongCat | `https://longcat.chat/platform/docs/zh/` | 中文文档 |
| NVIDIA | `https://build.nvidia.com/models` | 免费端点列表 |

## 免费模型策略

### 完全免费（is_free = true）

| Provider | 模型数 | 说明 |
|----------|--------|------|
| Gitee | 44 | 无价格，完全免费 |
| Cerebras | 2 | Llama 3.1 8B, GPT OSS 120B |
| LongCat | 7 | 全部模型都有免费额度 |
| NVIDIA | 50 | build.nvidia.com 列出的免费端点 |
| Google | 17 | Flash 系列、Embedding 等 |
| OpenRouter | 56 | max_price=0 筛选的免费模型 |

### 允许体验（is_experienceable = true）

| Provider | 模型数 | 说明 |
|----------|--------|------|
| Gitee | 144 | 有价格但允许体验（Gitee 特有） |

### 收费模型

| Provider | 模型数 |
|----------|--------|
| Gitee | 13 |
| Cerebras | 2 |
| Groq | 12 |
| NVIDIA | 89 |
| Xunfei | 64 |
| Google | 15 |

## 能力标签标准化

所有 Provider 使用统一的能力标签：

| 标签 | 说明 |
|------|------|
| `chat` | 对话能力 |
| `text-generation` | 文本生成 |
| `embeddings` | 向量表示 |
| `vision` | 视觉理解 |
| `image-generation` | 图像生成 |
| `video-generation` | 视频生成 |
| `speech-synthesis` | 语音合成 |
| `speech-recognition` | 语音识别 |
| `code-generation` | 代码生成 |
| `moderation` | 内容审核 |
| `rerank` | 重排序 |
| `reasoning` | 推理能力 |
| `agentic` | Agent 能力 |
| `robotics` | 机器人 |

## 字段命名规范

所有字段使用 snake_case 格式：

| 字段 | 类型 | 说明 |
|------|------|------|
| `is_free` | boolean | 是否完全免费 |
| `is_experienceable` | boolean | 是否允许体验 |
| `price_input` | number | 输入价格（$/1M tokens） |
| `price_output` | number | 输出价格（$/1M tokens） |
| `context_size` | number | 上下文长度（tokens） |
| `context_label` | string | 上下文标签（人类可读） |
| `billing_mode` | string | 计费模式（free/pay/mixed） |
| `free_tier` | string | 免费层级（none/trial/full） |

## 更新日志

| 日期 | Provider | 更新内容 |
|------|----------|----------|
| 2026-04-29 | OpenRouter | 新增 Provider，56 个免费模型 |
| 2026-04-29 | Gitee | 添加 is_experienceable 字段区分完全免费和允许体验 |
| 2026-04-29 | NVIDIA | 添加 fetchWithRetry 重试机制，解析 docs 获取能力 |
| 2026-04-29 | Google | 从 HTML 解析改为定价文档解析，模型数 8→32 |
| 2026-04-29 | Groq | 新增 Provider，从定价页面解析 |
| 2026-04-29 | Cerebras | 新增 Provider，从文档解析 |
| 2026-04-29 | LongCat | 新增 Provider，从文档解析 |
