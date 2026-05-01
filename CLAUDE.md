# Model Hub — Agent Onboarding

聚合多家 AI provider 的免费/试用模型清单，输出统一 OpenAI 兼容 JSON。

## 架构

```
scripts/hub/providers/{name}/index.ts   ← 各 provider 抓数（插件化，自动发现）
        ↓ RawModelData[]
scripts/hub/aggregator.ts               ← 聚合、去重、enhance、校验、写盘
        ↓
data/models.json                         ← 唯一数据源（OpenAI 兼容）
website/dev.html                         ← 前端视图（相对路径 ../data）
```

新增 provider：在 `scripts/hub/providers/<name>/index.ts` 导出 `fetchModels: ProviderPlugin`，自动被发现。

## 关键约定

- **价格单位**：所有 `priceInput`/`priceOutput` 都是 **per 1,000,000 tokens**。每个 provider **必须**填 `priceCurrency: 'USD' | 'CNY'`。`undefined` = 未知，不要当 0 处理。
- **能力标签**：唯一 source of truth 是 `scripts/hub/taxonomy.ts`。Provider 内不要做关键词推断；输出原始字符串即可，`enhancer.ts` 集中规范化。
- **字段命名**：JSON 输出 snake_case (`is_free`, `free_kind`)，TS 内部 camelCase (`isFree`, `freeKind`)。映射在 `types.ts:toOpenAICompatible`。
- **缓存写盘**：`loadCache` 一次 → 内存修改 → `saveCache` 一次。**禁止**在循环里 `loadCache/saveCache`（O(N²) IO）。
- **Model ID 唯一性**：`modelId` 作为去重键。Provider 应当用 `vendor/name` 作为前缀避免跨 provider 冲突。

## 业务规则

### 免费定义（统一）

> **`is_free = true`**：在某种条件下（速率限制 / 配额 / 试用 credits）可以**不付费**调用 API。

无论永久免费还是配额内免费都算 free。**`is_free=false`** 表示必须付费。

### 描述免费机制的字段

- `free_mechanism`: `permanent | rate-limited | daily-tokens | monthly-tokens | trial-credits | preview | null`
- `free_quota`: `{ rpm?, rpd?, tpm?, tokens_per_day?, tokens_per_month?, total_credits?, notes? }`
- `trial_scope`: `flagship | fast | specific | all | none`（provider 试用策略覆盖范围）

### Gitee 体验
Gitee `free_use=true && hasPrice=true` 的 145 个模型 = 「**付费**但开放调用入口」 → 映射为 `is_free=false`。如未来确认有月度免费配额，再升级为 `is_free=true, free_mechanism='monthly-tokens'`。

### 已删除字段（不要再使用）

`billing_mode`、`free_tier`、`is_experienceable`、`free_kind`、`rate_limits` 已全部移除。统一为 `is_free` + `free_mechanism` + `free_quota`。

## Provider 数据源备忘

| Provider | 来源 | 注意事项 |
|---|---|---|
| Gitee | `ai.gitee.com/api/pay/service/operations` | API 字段已是 per-million；`metadata.isFullyFree` 触发 free_tier=full |
| BigModel | `open.bigmodel.cn/api/biz/operation/query?ids=...` | 数据嵌套在 `content` JSON 字符串里需二次解析 |
| OpenRouter | `openrouter.ai/api/frontend/models/find?fmt=cards&max_price=0` | `max_price=0` 直接拿全部免费模型；无认证 |
| NVIDIA | 三源：`build.nvidia.com` (免费列表) + `docs.api.nvidia.com` (能力) + `integrate.api.nvidia.com/v1/models` (主列表) | 必须用 `fetchWithRetry` |
| Google | `ai.google.dev/gemini-api/docs/pricing.md.txt` | API 返回 403，用文档而非 API；MODEL_DATA 硬编码 |
| Xinghuo (讯飞星火) | 硬编码 (Spark HTTP API：`spark-api-open.xf-yun.com/v1`) | 讯飞自研 Spark 系列（4.0Ultra / Max / Pro / Lite），并发上限 5；Spark Lite 永久免费 |
| Xingchen (讯飞星辰 MaaS) | `maas.xfyun.cn/api/v1/gpt-finetune/model/base/list-v2` | 第三方模型聚合（GLM/Qwen/DeepSeek 等）；`function` 字段映射：4=OCR/vision, 8=embeddings, 12=multimodal, 15=reasoning |
| Groq | `groq.com/pricing` | API 403，硬编码 MODEL_DATA |
| Cerebras | `inference-docs.cerebras.ai/models/overview` | 硬编码 |
| LongCat | `longcat.chat/platform/docs/zh/` | 硬编码；rateLimits.notes 存 "500K tokens/天" 之类 |

## 命令

```bash
npm run sync-models                  # 全量聚合
npm run sync-models -- --provider=gitee   # 仅跑某个
npm run sync-models -- --strict      # 异常时退出码 2（CI 用）
SKIP_LLM=1 npm run sync-models       # 跳过 GitHub Models 调用（本地调试）
npm run typecheck
```

## 模型家族聚合

`scripts/hub/family.ts` 通过正则把不同 provider 同一底层模型归到同一 `model_family`：
- 剥 provider 前缀 (`groq/`, `openrouter/`...)
- 剥 owner 前缀 (`meta/`, `qwen/`, `openai/`...)
- 抽 `quantization` (`fp8`, `int4`...) 和 `model_variant` (`instruct`, `reasoning`, `vl`...)
- 输出 `aliases[]`（同家族其他 modelId）

异常情况（family 太长、含 `/`）→ 走 `llm.ts` 的 `phi-4` LLM fallback。

人工修正：编辑 `scripts/hub/family-overrides.json`：
```json
{ "exact": {"odd-id": {"family": "qwen-7b"}}, "patterns": [{"match": "regex", "family": "..."}] }
```

## LLM 调用（GitHub Models）

- Free plan 配额：`gpt-4o-mini` ~150/天，`gpt-4o` ~50/天
- 缓存：`data/llm-cache.json`（input hash → output 永久）
- 预算：`data/llm-budget.json`（每天每模型计数）
- 多模型降级链：`phi-4 → llama-3.3-70b → gpt-4o-mini`（先用便宜的）
- 跳过：本地无 `GITHUB_TOKEN` 或 `SKIP_LLM=1` 自动绕过

## CI / 部署

- `daily-model-sync.yml`：每天 02:00 UTC 同步
- `sync-on-push.yml`：master push 触发 + bot commit 数据
- `sync-pages.yml`：复制到 gh-pages 分支
- GitHub Pages 模式：**Deploy from branch (gh-pages)**（**不是** workflow 模式）
- 自定义域名 `ofind.cn/FreeModels/`，过 Cloudflare + Fastly，部署后缓存最长 10 分钟

## 历史/已知陷阱

- `data/models.json` 由 bot 自动 commit，本地 push 前先 `git pull --rebase`
- `analyzer.ts:TIER_PATTERNS` 必须用 `\b\dB\b`（强制 B 后缀），否则 `GLM-4.6` 这类版本号会误判为 small
- `evaluateBilling` 中 `priceInput === undefined && priceOutput === undefined` → `'unknown'`，不要当 free
- 加新 provider 后，记得 `evaluator.ts:PROVIDER_META` 补 `displayName` / `website`

## 详细文档（按需 grep）

| 主题 | 路径 |
|------|------|
| 数据流 / 缓存 / 管线 | `docs/architecture.md` |
| 字段定义 / taxonomy / family | `docs/fields.md` |
| 代码约定 / 历史陷阱 | `docs/conventions.md` |
| Provider 数据源 / 免费策略 | `docs/providers/README.md` |
| LLM / 企业微信通知 | `docs/llm-and-notify.md` |
| CI / Pages / CDN | `docs/deployment.md` |
| 新增 provider 步骤 | `docs/adding-provider.md` |

## 其他 agent 的笔记

`.monkeycode/` 是 monkeycode agent 的累积开发笔记，**保留不要删**——记录历史决策与陷阱。本文件 (CLAUDE.md) + `docs/` 是当前权威。
