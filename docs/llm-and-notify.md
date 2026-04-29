# LLM 集成 & 通知

## GitHub Models（家族规范化兜底）

`scripts/hub/llm.ts` 仅在正则规范化失败时调用 LLM。

### 触发条件（aggregator 中的 outlier filter）

| 条件 | 含义 |
|------|------|
| `family.length < 2` | 规范化结果太短，可能算法失败 |
| `/[\/\\]/.test(family)` | 含 `/` 或 `\`，未剥干净 |
| `family.length > 60` | 太长，没匹配到剥离规则 |
| `/[^\x00-\x7F]/.test(family)` | 含非 ASCII（中文等） |

### 模型分配

| 任务 | 推荐模型 | 备用 |
|------|----------|------|
| family 分类 | `microsoft/phi-4` | `meta/llama-3.3-70b-instruct` → `openai/gpt-4o-mini` |

降级链：当首选模型 429 / 错误时自动尝试下一个。

### Free Plan 配额管理

| 模型 | 默认每日配额 |
|------|------|
| `openai/gpt-4o-mini` | 100 |
| `microsoft/phi-4` | 100 |
| `meta/llama-3.3-70b-instruct` | 100 |
| `openai/gpt-4o` | 30 |

调用计数存 `data/llm-budget.json`，按日重置。

### 缓存

`data/llm-cache.json`：
```json
{
  "family-classify:abc12345": {
    "output": "{\"family\":\"qwen-7b\",...}",
    "model": "microsoft/phi-4",
    "cachedAt": "2026-04-29T13:39:57Z"
  }
}
```

key = `${task}:${sha256(systemPrompt + input).slice(0,16)}`，命中后永不再调。

### 本地禁用

```bash
SKIP_LLM=1 npm run sync-models
```

或本地无 `GITHUB_TOKEN` 时自动跳过。

## 企业微信通知

`scripts/hub/notify.ts` 在 sync 末尾投递。

### 配置

GitHub repo 设置中添加 secret：
- 名字：`WECHAT_QYAPI_ID`
- 值：webhook URL `key=` 后面的 ID（**不带** `key=` 前缀）

### 内容结构

| 段落 | 触发条件 |
|------|----------|
| 📊 数据统计 | 总是 |
| 📈 Provider 变化 | 与上次对比有差异 |
| 🆕 新增 N 个 | 有新模型 |
| ➖ 移除 N 个 | 有移除模型 |
| ❌ Provider 失败 | 任意 provider 抓取失败 |
| ⚠️ 异常告警 | 总数 / 单 provider 下降超阈值 |
| 📦 各 Provider 模型数 | 总是 |
| 🔗 跨 Provider 头部家族 | 有跨家族 |
| 🤖 LLM 调用 | LLM 实际调用过 |

### 头部 emoji 含义

| Emoji | 含义 |
|-------|------|
| ✅ | 无变化无错误 |
| 🔄 | 数据有变化但无错误 |
| ⚠️ | 有 provider 失败或异常告警 |

### 跳过通知

```bash
npm run sync-models -- --no-notify          # 显式跳过
npm run sync-models -- --provider=gitee     # 单 provider 模式自动跳过
```
