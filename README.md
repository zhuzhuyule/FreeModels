# FreeModels

聚合多家 AI provider 的免费 / 试用模型清单，统一为 OpenAI 兼容 JSON。每天自动同步、跨 provider 模型识别、自动生成文档索引、企业微信变更通知。

🌐 **在线访问**：<https://ofind.cn/FreeModels/>

## Provider 支持情况

> 该表由 `npm run generate-docs` 根据 `data/models.json` 自动更新。

<!-- AUTO-GENERATED:PROVIDER_INDEX_START -->
| Provider | 内部 ID | 总模型 | 免费 | 体验/试用 | 免费策略 | 注册 | API Key | 文档 | 数据 |
|---|---|---:|---:|---:|---|---|---|---|---|
<!-- AUTO-GENERATED:PROVIDER_INDEX_END -->

## 数据规模

> 该表由 `npm run generate-docs` 自动更新。

<!-- AUTO-GENERATED:STATS_START -->
| 维度 | 数量 |
|------|-----:|
<!-- AUTO-GENERATED:STATS_END -->

## 免费模型列表

> 该表由 `npm run generate-docs` 自动更新，展示 `is_free=true` 的模型。完整机器可读数据请使用 `data/views/free-full/models.json` 或 `data/views/free/models.json`。

<!-- AUTO-GENERATED:FREE_MODELS_START -->
| Provider | Model ID | 名称 | 上下文 | 免费类型 | 限制 |
|---|---|---|---:|---|---|
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
| `free` | 计费模式为 free（含限速 / 配额） |
| `free-full` | 仅 `free_tier=full`（完全免费） |
| `free-trial` | 仅 `free_tier=trial`（试用） |
| `reasoning` | 推理模型 |
| `multimodal` | 多模态 |
| `tool-use` | 支持工具调用 |
| `fast` | 快速档位 |
| `premium` | 高性能档位 |
| `small` | 小型模型 |
| `large` | 大型模型 |

```bash
# 例：只看完全免费
curl https://ofind.cn/FreeModels/data/views/free-full/models.json
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
const res = await fetch('https://ofind.cn/FreeModels/data/views/free-full/models.json');
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
  "billing_mode": "free",
  "free_kind": "rate-limited",
  "trial_scope": "specific",
  "rate_limits": { "rpm": 20, "rpd": 50, "notes": "Free models limited to 20/min" },
  "model_family": "llama-3.3-70b",
  "model_variant": "instruct",
  "aliases": ["groq/llama-3.3-70b-versatile", "nvidia/meta/llama-3.3-70b-instruct"],
  "tags": ["chat", "text-generation", "tool-use"],
  "tier": "large",
  "performance_level": "high"
}
```

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
