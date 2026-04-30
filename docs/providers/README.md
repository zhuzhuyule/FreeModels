# Provider 文档索引

所有 Provider 的数据源、认证方式、字段映射规则。

## Provider 列表

| Provider | 模型数 | 免费 | 体验 | 数据来源 | 抓取方式 |
|----------|-------:|-----:|-----:|----------|----------|
| Gitee | 202 | 44 | 145 | `ai.gitee.com/api/pay/service/operations` | API |
| NVIDIA | 134 | 25 | — | `integrate.api.nvidia.com/v1/models` + `build.nvidia.com` + `docs.api.nvidia.com` | API + HTML |
| Xunfei | 64 | 10 | — | `maas.xfyun.cn/api/v1/gpt-finetune/model/base/list-v2` | API |
| OpenRouter | 56 | 56 | — | `openrouter.ai/api/frontend/models/find?max_price=0` | API |
| BigModel | 54 | 7 | — | `open.bigmodel.cn/api/biz/operation/query?ids=...` | API |
| Google | 32 | 17 | — | `ai.google.dev/gemini-api/docs/pricing.md.txt` | 文档解析 |
| Groq | 12 | 0 | — | `groq.com/pricing` | 硬编码 |
| LongCat | 7 | 7 | — | `longcat.chat/platform/docs/zh/` | 硬编码 |
| Cerebras | 4 | 2 | — | `inference-docs.cerebras.ai/models/overview` | 硬编码 |
| **总计** | **565** | **168** | **145** | | |

## 数据源分类

### API（动态拉取）

| Provider | URL | 认证 |
|----------|-----|------|
| Gitee | `https://ai.gitee.com/api/pay/service/operations?vendor=` | 无 |
| Xunfei | `https://maas.xfyun.cn/api/v1/gpt-finetune/model/base/list-v2` | 无 |
| NVIDIA | `https://integrate.api.nvidia.com/v1/models` | 无（公开） |
| OpenRouter | `https://openrouter.ai/api/frontend/models/find?fmt=cards&max_price=0` | 无 |
| BigModel | `https://open.bigmodel.cn/api/biz/operation/query?ids=...` | 无 |

### HTML / 文档解析

| Provider | URL | 备注 |
|----------|-----|------|
| Google | `https://ai.google.dev/gemini-api/docs/pricing.md.txt?hl=zh-cn` | 用文档而非 API（API 返回 403） |
| NVIDIA | `https://build.nvidia.com/models?filters=...` | 解析 HTML 提取免费端点 ID |
| NVIDIA | `https://docs.api.nvidia.com/nim/reference/llm-apis` | 解析能力分类 |

### 硬编码 MODEL_DATA

| Provider | 来源页 | 维护方式 |
|----------|--------|----------|
| Groq | `groq.com/pricing` | 手动同步价格表（API 403） |
| Cerebras | `inference-docs.cerebras.ai/models/overview` | 模型变化少 |
| LongCat | `longcat.chat/platform/docs/zh/` | 模型变化少 |

> 硬编码 provider 的 LLM 接管是 P2 计划，当前未实施。

## 免费定义

> **`is_free = true`**：在某种限制条件下（速率 / 配额 / 试用 credits）可以**不付费**调用 API。

Gitee 的「体验」（原 `is_experienceable=true`）= 付费但开放调用入口，按 token 收费 → 映射为 `is_free=false`。

## 各 Provider 免费分布（`free_mechanism`）

| Provider | 永久 | 限速 | 日配额 | 月配额 | 试用 credits | 预览 | 必付费 |
|----------|-----:|-----:|-------:|-------:|-------------:|-----:|-------:|
| Gitee | 44 | 0 | 0 | 0 | 0 | 0 | 158 |
| NVIDIA | 0 | 0 | 0 | 0 | 26 | 0 | 108 |
| Xunfei | 0 | 10 | 0 | 0 | 0 | 0 | 54 |
| OpenRouter | 0 | 56 | 0 | 0 | 0 | 0 | 0 |
| BigModel | 7 | 0 | 0 | 0 | 0 | 0 | 47 |
| Google | 0 | 17 | 0 | 0 | 0 | 0 | 15 |
| Groq | 0 | 0 | 0 | 0 | 0 | 0 | 12 |
| LongCat | 0 | 0 | 7 | 0 | 0 | 0 | 0 |
| Cerebras | 0 | 0 | 0 | 0 | 0 | 2 | 2 |
| **总计** | **51** | **83** | **7** | **0** | **26** | **2** | **396** |

> 数据基于最新 sync。Gitee 145 个原"可体验"现归为必付费（按 token 收费）。

### 按家族跨 provider 分布

| 家族 | 提供 provider |
|------|---------------|
| `gpt-oss-120b` | cerebras, groq, openrouter, bigmodel-similar (5) |
| `qwen3-next-80b-a3b` | gitee, openrouter, xunfei, plus (4) |
| `qwen3-32b` | gitee, groq, xunfei (3) |
| `deepseek-v3.2` | gitee, openrouter, xunfei (3) |
| `minimax-m2.5` | gitee, groq, xunfei (3) |
| `glm-5.1` | gitee, z-ai, xunfei (3) |
| `llama-3.3-70b` | groq, nvidia, openrouter (3) |

详见 [模型家族规范化](../fields.md#模型家族-model_family)。

## 各 Provider 详细文档

> 以下为 monkeycode 时期的 provider 笔记，记录历史决策与陷阱。当前实现以代码 `scripts/hub/providers/{name}/index.ts` 为准。

| Provider | 笔记 |
|----------|------|
| Gitee | [.monkeycode/docs/providers/gitee.md](../../.monkeycode/docs/providers/gitee.md) |
| BigModel | [.monkeycode/docs/providers/bigmodel.md](../../.monkeycode/docs/providers/bigmodel.md) |
| Cerebras | [.monkeycode/docs/providers/cerebras.md](../../.monkeycode/docs/providers/cerebras.md) |
| Google | [.monkeycode/docs/providers/google.md](../../.monkeycode/docs/providers/google.md) |
| Groq | [.monkeycode/docs/providers/groq.md](../../.monkeycode/docs/providers/groq.md) |
| LongCat | [.monkeycode/docs/providers/longcat.md](../../.monkeycode/docs/providers/longcat.md) |
| NVIDIA | [.monkeycode/docs/providers/nvidia.md](../../.monkeycode/docs/providers/nvidia.md) |
| OpenRouter | [.monkeycode/docs/providers/openrouter.md](../../.monkeycode/docs/providers/openrouter.md) |
| Xunfei | [.monkeycode/docs/providers/xunfei.md](../../.monkeycode/docs/providers/xunfei.md) |

## 添加新 Provider

参考 [adding-provider.md](../adding-provider.md)。
