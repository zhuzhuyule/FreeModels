# Model Hub

聚合 9 家 AI provider 的免费 / 试用模型清单，自动产出统一 OpenAI 兼容 JSON。每天定时同步并支持企业微信通知。

**在线访问**：https://ofind.cn/FreeModels/

## 功能特性

- **9 家 Provider 聚合**：Gitee、BigModel、NVIDIA、Google、Xunfei、Groq、Cerebras、LongCat、OpenRouter（共 ~565 模型）
- **统一 OpenAI 格式**：`object: list`, `data[]`，可直接前端消费
- **跨 Provider 模型识别**：同底层模型（如 Llama-3.3-70B）自动归为同一 `model_family`，方便对比哪家便宜/快
- **细粒度免费分类**：区分 `permanent`（完全免费）/ `rate-limited`（限速）/ `trial-quota`（配额）/ `preview`（预览版）
- **试用范围标识**：`trial_scope` 区分 `flagship`（旗舰开放试用）/ `fast`（快速档）/ `specific`/ `none`
- **价格统一单位**：所有 `priceInput/priceOutput` 都是 `per_million_tokens`，配 `priceCurrency: USD | CNY`
- **能力标签规范化**：25 个 taxonomy 标签 + 同义词映射（`tool_use → tool-use` 等）
- **自动去重 + Schema 校验 + 异常告警**
- **LLM 智能补强**：GitHub Models 仅在正则失效时兜底（中文模型名等），缓存避免重复调用
- **企业微信通知**：每次同步推送数据变化、新增/移除、Provider 健康度

## 数据示例

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
  "aliases": [
    "groq/llama-3.3-70b-versatile",
    "nvidia/meta/llama-3.3-70b-instruct"
  ],
  "tags": ["chat", "text-generation", "tool-use"],
  "tier": "large",
  "performance_level": "high"
}
```

## 架构

```
scripts/hub/
├── aggregator.ts          # 入口：发现 provider → 聚合 → 去重 → 校验 → 通知
├── providers/
│   ├── gitee/index.ts     # 各 provider 插件，导出 fetchModels
│   ├── bigmodel/...
│   └── {new-provider}/    # 自动发现，创建目录即可
├── enhancer.ts            # 用 cache + 推断填字段
├── analyzer.ts            # tier / speed / performanceLevel 推断
├── evaluator.ts           # 缓存读写、PROVIDER_META
├── taxonomy.ts            # 能力标签枚举 + 同义词规范化
├── family.ts              # 模型家族正则规范化
├── family-overrides.json  # 人工修正映射
├── llm.ts                 # GitHub Models 客户端 + 缓存 + 预算
├── notify.ts              # 企业微信通知
└── types.ts               # 共享类型

data/
├── models.json            # 唯一聚合输出
├── capability-cache.json  # 能力推断缓存
├── llm-cache.json         # LLM 输入 hash → 输出
└── llm-budget.json        # 当日 LLM 调用计数

website/
├── index.html             # 入口页
└── dev.html               # 全功能开发视图（搜索 / 过滤 / 排序）

.github/workflows/
├── daily-model-sync.yml   # 每天 02:00 UTC 自动同步
├── sync-on-push.yml       # 代码推送触发同步
└── sync-pages.yml         # master → gh-pages 同步
```

## 命令

```bash
npm install
npm run sync-models                       # 全量同步
npm run sync-models -- --provider=gitee   # 仅跑某个 provider
npm run sync-models -- --strict           # 异常时退出码 2（CI 用）
npm run sync-models -- --no-notify        # 跳过企业微信通知
SKIP_LLM=1 npm run sync-models            # 跳过 GitHub Models 调用
npm run typecheck

# 本地预览前端
npx serve .
# 然后访问 http://localhost:3000/website/dev.html
```

## 环境变量 / Secrets

CI 通过 GitHub Actions Secrets 注入；本地开发可写到 shell 环境。

| 变量 | 必需 | 用途 |
|---|---|---|
| `GITHUB_TOKEN` | 自动注入（CI）/ 可选（本地） | 调用 GitHub Models API（家族 LLM 兜底）。本地若缺则自动跳过 LLM |
| `WECHAT_QYAPI_ID` | 可选 | 企业微信 webhook URL `key=` 后的 ID（不含前缀）。缺则跳过通知 |
| `SKIP_LLM` | 可选 | 设为 `1` 强制跳过 LLM，本地调试用 |

CI 权限要求（`.github/workflows/*.yml`）：
```yaml
permissions:
  contents: write
  models: read    # 调用 GitHub Models 必需
```

## 添加新 Provider

1. 创建目录 `scripts/hub/providers/{name}/index.ts`
2. 导出 `fetchModels: ProviderPlugin`：

```typescript
import type { RawModelData, ProviderPlugin } from '../../types.js';

async function fetch(): Promise<RawModelData[]> {
  return [{
    vendor: 'myprovider',
    modelId: 'myprovider/model-x',          // 用 vendor/ 前缀避免跨 provider 冲突
    name: 'Model X',
    description: '...',
    contextSize: 128000,
    priceInput: 0.5,                         // per million tokens
    priceOutput: 1.5,
    priceCurrency: 'USD',                    // 或 'CNY'
    isFree: false,
    freeKind: 'unknown',                     // 或 permanent/rate-limited/trial-quota/preview
    trialScope: 'none',                      // 或 flagship/fast/specific/all
    rateLimits: { rpm: 60, notes: '...' },   // 可选
    capabilities: ['chat', 'text-generation'],
    metadata: {},
  }];
}

export const fetchModels: ProviderPlugin = fetch;
```

3. 在 `scripts/hub/evaluator.ts` 的 `PROVIDER_META` 加 `displayName / website`
4. 运行 `npm run sync-models` 自动发现

## 关键约定

- **价格单位**：`per_million_tokens`。`undefined` 表示未知，**不要**当 0 处理
- **字段命名**：JSON 输出 `snake_case`，TS 内部 `camelCase`，映射在 `types.ts:toOpenAICompatible`
- **缓存写盘**：`loadCache` 一次 → 内存修改 → `saveCache` 一次。**禁止**循环里 `loadCache/saveCache`
- **能力标签**：唯一来源是 `taxonomy.ts`。Provider 输出原始字符串即可，统一在 `enhancer.ts` 规范化
- **modelId 唯一**：用 `vendor/name` 前缀。重复时 aggregator 按信息完整度自动保留最佳

## Provider 数据源备忘

| Provider | 来源 | 说明 |
|---|---|---|
| Gitee | `ai.gitee.com/api/pay/service/operations` | API 字段已是 per-million；区分 `is_free` vs `is_experienceable` |
| BigModel | `open.bigmodel.cn/api/biz/operation/query?ids=...` | 数据嵌套在 `content` JSON 字符串里，需二次解析 |
| OpenRouter | `openrouter.ai/api/frontend/models/find?fmt=cards&max_price=0` | `max_price=0` 直接拿全部免费模型；无认证 |
| NVIDIA | 三源：`build.nvidia.com`（免费列表）+ `docs.api.nvidia.com`（能力）+ `integrate.api.nvidia.com/v1/models`（主） | 必须 `fetchWithRetry` |
| Google | `ai.google.dev/gemini-api/docs/pricing.md.txt` | API 返回 403，用文档；MODEL_DATA 硬编码 |
| Xunfei | `maas.xfyun.cn/api/v1/gpt-finetune/model/base/list-v2` | `function` 字段：4=OCR/vision, 8=embeddings, 12=multimodal, 15=reasoning |
| Groq | `groq.com/pricing` | API 403，硬编码 |
| Cerebras | `inference-docs.cerebras.ai/models/overview` | 硬编码 |
| LongCat | `longcat.chat/platform/docs/zh/` | 硬编码；`rateLimits.notes` 存配额信息 |

## Gitee 免费三态（特殊业务规则）

仅 Gitee 区分 `is_free` 和 `is_experienceable`：

| `free_use` | 有价格 | `is_free` | `is_experienceable` | `free_kind` |
|---|---|---|---|---|
| `true` | `false` | `true` | `false` | `permanent` |
| `true` | `true` | `false` | `true` | `trial-quota` |
| `false` | — | `false` | `false` | `unknown` |

其他 provider 只用 `is_free` 一种。

## CI / 部署

- **每日同步**（`daily-model-sync.yml`）：UTC 02:00
- **代码推送同步**（`sync-on-push.yml`）：`scripts/hub/**` 改动触发
- **Pages 部署**（`sync-pages.yml`）：master → gh-pages 分支
- GitHub Pages 模式：**Deploy from branch (gh-pages)**
- 自定义域名 `ofind.cn/FreeModels/`，过 Cloudflare + Fastly（CDN 缓存最长 10 分钟）

## 企业微信通知预览

```
🔄  Model Hub 同步完成
2026-04-29 13:39 UTC · 用时 6.5s
─────────────────────────
📊 数据统计
  全量模型：567 (+9)
  免费模型：170 (+5)
  模型家族：475（跨家 64）

📈 Provider 变化
  🆕 gitee       200 → 202  (+2)
  🆕 nvidia      139 → 141  (+2)
  ➖ xunfei      65 → 64    (-1)

🆕 新增 9 个
  google (2)
    · gemini-3.5-flash
    · gemini-3.5-pro-preview
  ...

📦 各 Provider 模型数
  gitee       202
  nvidia      141
  ...

🔗 跨 Provider 头部家族
  · gpt-oss-120b × 5 家
  · qwen3-next-80b-a3b × 4 家

🤖 LLM 调用：缓存 0 · 新调 2 · 错误 0
```

异常时头部变 ⚠️，会带 `❌ Provider 失败` 和 `⚠️ 异常告警` 段落。

## 给 AI Agent 的开发指引

- `CLAUDE.md` — Claude Code 视角的精简上下文
- `.monkeycode/` — Monkeycode agent 累积的开发笔记（保留供其他 agent 参考）

## License

MIT
