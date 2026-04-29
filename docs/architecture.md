# 架构

## 数据流

```
Provider API/HTML
       ↓ fetchModels()
scripts/hub/providers/{name}/index.ts        → RawModelData[]
       ↓
scripts/hub/aggregator.ts                     → 聚合 / 去重 / enhance / 校验
       ↓
data/models.json                              → 单一权威输出
       ↓
website/dev.html  (相对路径 ../data)          → 前端视图
```

## 模块职责

| 文件 | 职责 |
|------|------|
| `scripts/hub/aggregator.ts` | 入口：发现 provider → 并行抓取 → 去重 → enhance → 校验 → LLM 兜底 → 通知 |
| `scripts/hub/providers/{name}/index.ts` | 各 provider 插件，导出 `fetchModels(): Promise<RawModelData[]>` |
| `scripts/hub/enhancer.ts` | 用 cache + 关键词推断填充 capability / billing / family |
| `scripts/hub/analyzer.ts` | 推断 `tier` / `speed` / `performanceLevel` / `useCase` |
| `scripts/hub/evaluator.ts` | cache 读写、`PROVIDER_META` 元信息 |
| `scripts/hub/taxonomy.ts` | 25 个 capability 标签枚举 + 同义词归一 |
| `scripts/hub/family.ts` | 模型家族正则规范化 + overrides 装载 |
| `scripts/hub/llm.ts` | GitHub Models 客户端 + 缓存 + 预算 + 降级链 |
| `scripts/hub/notify.ts` | 企业微信通知格式化 + 投递 |
| `scripts/hub/types.ts` | 共享类型 + JSON 输出映射 |

## 聚合管线

```
1. discoverProviders()         遍历 providers/ 目录，import 所有 index.ts
2. loadCache()                 读取 capability-cache.json 一次
3. Promise.all(runProvider)    并行抓取所有 provider
   └─ enhanceWithCacheUsing    cache hit / 推断
   └─ mutateCacheEntry         内存修改 cache
4. saveCache()                 一次性写盘
5. dedupeByModelId             同 modelId 取信息更全的
6. validateAndFilter           schema 校验
7. refineFamiliesWithLlm       outlier 走 LLM（中文 / 长名 / 含斜杠）
8. fillAliases                 同 family 互相填 aliases[]
9. detectAnomalies             与上次输出对比
10. writeFile + notifyWechat
```

## 缓存策略

| 缓存文件 | 内容 | 失效 |
|----------|------|------|
| `data/capability-cache.json` | 模型能力推断（tags、isReasoning、tier 等） | 永久（除非手动删除） |
| `data/llm-cache.json` | LLM input hash → output | 永久 |
| `data/llm-budget.json` | 当日各 LLM 模型调用计数 | 跨天自动重置 |

**重要约束**：缓存读写遵循 **一次读 / 多次内存修改 / 一次写**，**严禁** 在循环内反复 `loadCache()/saveCache()`（O(N²) IO）。

## 性能特征

- 9 个 provider 并行抓取，~2-6 秒（取决于 NVIDIA 三源最慢的）
- 565 模型 enhance + dedupe ~10ms
- LLM 仅在 outlier 时调用，目前每次 sync ~2 次（中文模型名）
- 总耗时 5-8 秒
