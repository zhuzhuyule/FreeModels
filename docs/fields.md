# 字段定义

JSON 输出使用 `snake_case`，TS 内部使用 `camelCase`，映射在 `scripts/hub/types.ts:toOpenAICompatible`。

## 核心标识

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | string | OpenAI 兼容主键，等于 `model_id` |
| `model_id` | string | 唯一模型标识，约定 `vendor/name` 格式 |
| `provider` | string | 供应商内部名（gitee / bigmodel / ...） |
| `name` | string | 显示名 |
| `description` | string | 模型描述（清洗 HTML，限长 200-500） |
| `created` | number | 派生时间戳（OpenAI 兼容字段） |
| `owned_by` | string | 同 provider |

## 上下文

| 字段 | 类型 | 说明 |
|------|------|------|
| `context_size` | number | token 数 |
| `context_label` | string | 人类可读：`32K`、`128K`、`1M` |

## 价格 / 计费

| 字段 | 类型 | 说明 |
|------|------|------|
| `price_input` | number? | 输入价格（超出免费配额后的单价），**单位见 `price_unit`** |
| `price_output` | number? | 输出价格 |
| `price_currency` | `'USD' \| 'CNY'` | 货币 |
| `price_unit` | `'per_million_tokens'` | 单位（统一） |
| `is_free` | boolean | 在某种限制条件下，**不付费**就能调用 |
| `free_mechanism` | `FreeMechanism \| null` | 免费机制（见下表） |
| `free_quota` | `FreeQuota \| null` | 具体配额数值 |
| `trial_scope` | `'all' \| 'flagship' \| 'fast' \| 'specific' \| 'none'` | Provider 试用策略覆盖范围 |

### 免费定义

> **`is_free = true`**：在某种条件下（速率限制 / 配额 / 试用 credits）可以**不付费**调用 API。

无论是「永久免费」还是「每日 100万 tokens 免费、超出收费」，只要存在不付费可用的窗口，都算 `is_free=true`。`free_mechanism` 描述具体机制。

### `free_mechanism` 取值

| 值 | 含义 | 例子 |
|---|---|---|
| `permanent` | 无任何限制，永久免费 | bigmodel GLM-4-Flash |
| `rate-limited` | 有 RPM/RPD 速率限制，但调用免费 | OpenRouter `:free`、Google Flash 层 |
| `daily-tokens` | 每日 token 配额内免费 | LongCat 500K-50M tokens/天 |
| `monthly-tokens` | 每月 token 配额内免费 | （某些 provider） |
| `trial-credits` | 一次性试用 credits（用完即停） | NVIDIA NIM credits |
| `preview` | 预览/Beta 期免费（可能下线） | Cerebras Qwen 3 235B Preview |
| `null` | `is_free=false` 时为 null（必须付费） | — |

### `free_quota` 结构

```typescript
{
  rpm?: number              // 每分钟请求数
  rpd?: number              // 每天请求数
  tpm?: number              // 每分钟 token 数
  tokens_per_day?: number   // 每天 token 配额
  tokens_per_month?: number // 每月 token 配额
  total_credits?: number    // 试用总额度
  notes?: string            // 文字补充（"500,000 tokens/天" 等）
}
```

**约定**：`undefined` / `null` 表示未知或不适用，**不要**当 0 处理。

## 能力

| 字段 | 类型 | 说明 |
|------|------|------|
| `capabilities` | string[] | 原始能力标签（provider 输入） |
| `tags` | string[] | 规范化后的 taxonomy 标签 |
| `is_reasoning` | boolean | 派生 |
| `is_multimodal` | boolean | 派生 |
| `has_tool_use` | boolean | 派生 |

### Capability Taxonomy

权威来源：[`scripts/hub/taxonomy.ts`](../scripts/hub/taxonomy.ts)

```
chat                  reasoning             vision
text-generation       multimodal            image-generation
tool-use              function-calling      image-to-image
code-generation       code-editing          image-processing
embeddings            rerank                video-generation
speech-recognition    speech-synthesis      video-processing
music-generation      3d-generation         document-processing
web-search            translation           moderation  agentic
```

同义词自动映射：`tool_use → tool-use`、`embedding → embeddings`、`image → vision`、`text-to-speech → speech-synthesis`、`asr → speech-recognition` 等。

## 模型家族 / 别名

| 字段 | 类型 | 说明 |
|------|------|------|
| `model_family` | string | 规范化后的家族名（如 `llama-3.3-70b`） |
| `model_variant` | string? | 变体后缀（`instruct`/`reasoning`/`vl` 等） |
| `quantization` | string? | 量化标记（`fp16`/`fp8`/`int4` 等） |
| `aliases` | string[] | 同家族其他 modelId |

### 规范化算法（`family.ts`）

1. 剥 provider 前缀（`groq/`、`openrouter/`、...）
2. 递归剥 owner 前缀（`meta/`、`meta-llama/`、`qwen/`、`openai/`、...）
3. 抽出 `quantization`（`fp8` / `int4` / `awq` / ...）
4. 抽出 `model_variant`：保留语义重要的（`reasoning`、`vl`、`code` 等），剥可去除的（`instruct`、`chat`、`versatile` 等）
5. 移除日期 / 构建号后缀（`-2507`、`-20240101`）
6. 命中阈值（长度过长、含 `/`、含非 ASCII）走 LLM 兜底

人工修正：[`scripts/hub/family-overrides.json`](../scripts/hub/family-overrides.json)：
```json
{
  "exact": { "原始ID": { "family": "...", "variant": "..." } },
  "patterns": [{ "match": "正则", "family": "..." }]
}
```

## 规模 / 速度推断

由 `analyzer.ts` 基于名字 + 价格 + capabilities 推断：

| 字段 | 类型 | 说明 |
|------|------|------|
| `parameter_count` | number? | 从名字提取（如 `72B` → `72_000_000_000`） |
| `tier` | `'small' \| 'medium' \| 'large' \| 'xlarge'` | 模型规模档位 |
| `speed` | `'fast' \| 'standard' \| 'premium'` | 速度档位 |
| `performance_level` | `'entry' \| 'mid' \| 'high' \| 'enterprise'` | 综合性能 |
| `use_case` | string[] | 推断的使用场景 |
| `estimated_latency` | string? | 预估延迟 `< 1s` / `1-3s` / `3-10s` |

> tier 的正则要求强制 `B` 后缀（`\b70B\b`），避免 `GLM-4.6` 这类版本号被误判为 small。
