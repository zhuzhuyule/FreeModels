# 代码约定

## 价格单位

所有 `priceInput` / `priceOutput` 统一为 **per 1,000,000 tokens**。

每个 provider **必须**填 `priceCurrency: 'USD' | 'CNY'`。

`undefined` 表示未知，**不要**当作 0 处理。

## 字段命名

| 层 | 风格 | 示例 |
|----|------|------|
| JSON 输出 | `snake_case` | `is_free`、`free_kind`、`model_family` |
| TypeScript 内部 | `camelCase` | `isFree`、`freeKind`、`modelFamily` |

映射函数：`scripts/hub/types.ts:toOpenAICompatible`

## 缓存 IO

```typescript
// ✅ 正确：load 一次，多次内存修改，save 一次
const cache = loadCache();
for (const m of models) {
  mutateCacheEntry(cache, ..., m, enhanced);
}
saveCache(cache);

// ❌ 严禁：循环里反复 load/save（O(N²) IO）
for (const m of models) {
  const cache = loadCache();        // 不要这样
  cache[key] = ...;
  saveCache(cache);                  // 不要这样
}
```

## 能力标签来源

唯一权威：`scripts/hub/taxonomy.ts`。

- Provider 内**不要**做关键词推断
- Provider 输出原始字符串即可
- `enhancer.ts` 会调用 `normalizeCapabilities` 集中规范化

## modelId 唯一性

约定 `vendor/name` 前缀，避免跨 provider 冲突。

```typescript
modelId: `groq/llama-3.3-70b-versatile`     // ✅
modelId: `llama-3.3-70b`                      // ❌ 容易与其他 provider 冲突
```

去重发生在 aggregator 中，按"信息完整度"打分（描述长度 + 上下文 + capabilities + 价格）保留更全的那条。

## 错误处理

- Provider 抓取失败：返回空数组而非抛出，`aggregator` 会记录 failedProviders
- 异常告警：总数下降 > 10% 或单 provider 下降 > 50% 触发 warning
- `--strict` 模式：异常时退出码 2，CI 可捕获

## 风格

- 无注释优先（命名表达意图）
- 关键 WHY 才写注释（如"必须 \\b..\\b 强制 B 后缀，否则 GLM-4.6 误判"）
- 不写"已修复 bug X"这类历史注释

## 历史陷阱

- `analyzer.ts:TIER_PATTERNS` 必须 `\b\dB\b`（强制 B），否则版本号被误判
- `evaluateBilling` 中 `priceInput === undefined && priceOutput === undefined` 返回 `'unknown'`，不要当 free
- gitee API 字段 `input_million_tokens_price` 已经是 per-million，**不要**再除以 1M
- bot 的 sync commit 与人工提交可能冲突，push 前 `git pull --rebase`，data 文件取 `--theirs`
