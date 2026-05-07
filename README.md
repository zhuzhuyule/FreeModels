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
| [Gitee AI](https://ai.gitee.com)  | `gitee` | 203 | 44 | 146 | 部分模型完全免费，另有一批模型允许体验。 | [注册](https://ai.gitee.com) | — | [文档](https://ai.gitee.com/docs) | [JSON](https://ofind.cn/FreeModels/data/providers/gitee/models.json) |
| [Google AI](https://ai.google.dev)  | `google` | 32 | 17 | 0 | Gemini API 部分模型提供免费层，通常带有 RPM / RPD / TPM 限制。 | [注册](https://aistudio.google.com) | [API Key](https://aistudio.google.com/app/apikey) | [文档](https://ai.google.dev/gemini-api/docs) | [JSON](https://ofind.cn/FreeModels/data/providers/google/models.json) |
| [Groq](https://groq.com)  | `groq` | 12 | 0 | 0 | 常见为开发者免费额度或限速体验，具体以官方控制台和价格页为准。 | [注册](https://console.groq.com) | [API Key](https://console.groq.com/keys) | [文档](https://console.groq.com/docs) | [JSON](https://ofind.cn/FreeModels/data/providers/groq/models.json) |
| [LongCat](https://longcat.chat)  | `longcat` | 7 | 7 | 0 | 提供每日 token 免费额度，额度和模型范围以官方文档为准。 | [注册](https://longcat.chat) | [API Key](https://longcat.chat/platform/api-keys) | [文档](https://longcat.chat/platform/docs) | [JSON](https://ofind.cn/FreeModels/data/providers/longcat/models.json) |
| [NVIDIA AI](https://developer.nvidia.com/ai)  | `nvidia` | 131 | 24 | 0 | NIM / build.nvidia.com 通常提供开发体验 credits 或试用额度。 | [注册](https://build.nvidia.com) | [API Key](https://build.nvidia.com/explore/discover) | [文档](https://docs.api.nvidia.com/nim) | [JSON](https://ofind.cn/FreeModels/data/providers/nvidia/models.json) |
| [OpenRouter](https://openrouter.ai)  | `openrouter` | 55 | 55 | 0 | 免费模型通常带有请求频率或每日请求限制。 | [注册](https://openrouter.ai) | [API Key](https://openrouter.ai/settings/keys) | [文档](https://openrouter.ai/docs) | [JSON](https://ofind.cn/FreeModels/data/providers/openrouter/models.json) |
| [iFlytek MaaS / 讯飞星辰](https://maas.xfyun.cn)  | `xingchen` | 49 | 9 | 0 | 第三方模型聚合（GLM/Qwen/DeepSeek 等）；部分模型 0 元开放，具体以控制台为准。 | [注册](https://maas.xfyun.cn) | [API Key](https://maas.xfyun.cn) | [文档](https://maas.xfyun.cn/docs) | [JSON](https://ofind.cn/FreeModels/data/providers/xingchen/models.json) |
| [iFlytek Spark / 讯飞星火](https://xinghuo.xfyun.cn)  | `xinghuo` | 6 | 1 | 0 | Spark Lite 永久免费但限速（5 并发）；其他 Spark 系列按 token 计费。 | [注册](https://xinghuo.xfyun.cn) | [API Key](https://console.xfyun.cn/services/cbm) | [文档](https://www.xfyun.cn/doc/spark) | [JSON](https://ofind.cn/FreeModels/data/providers/xinghuo/models.json) |
<!-- AUTO-GENERATED:PROVIDER_INDEX_END -->

## 数据规模

> 该表由 `npm run generate-docs` 自动更新。

<!-- AUTO-GENERATED:STATS_START -->
| 维度 | 数量 |
|------|-----:|
| Provider | 10 |
| 模型总数 | 555 |
| 免费模型 (`is_free=true`) | 170 |
| 付费可试用 (Gitee 体验等) | 146 |
| 模型家族 | 475 |
| 跨 Provider 家族 | 55 |
| · 限速免费 | 84 |
| · 永久免费 | 53 |
| · 试用 credits | 24 |
| · 日 token 配额 | 7 |
| · 预览版 | 2 |
<!-- AUTO-GENERATED:STATS_END -->

## 免费模型

> 该区块由 `npm run generate-docs` 自动更新。

<!-- AUTO-GENERATED:FREE_MODELS_START -->
共 **170** 个免费模型（限速免费 84 个、永久免费 53 个、试用 credits 24 个、日 token 配额 7 个、预览版 2 个）。

完整列表及按机制筛选：
- [全部免费模型](https://ofind.cn/FreeModels/data/views/free/models.json)
- [永久免费](https://ofind.cn/FreeModels/data/views/free-permanent/models.json)
- [限速免费](https://ofind.cn/FreeModels/data/views/free-rate-limited/models.json)
- [配额免费](https://ofind.cn/FreeModels/data/views/free-quota/models.json)
- [付费可试用](https://ofind.cn/FreeModels/data/views/paid-trial/models.json)
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
