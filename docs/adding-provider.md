# 添加 Provider

## 步骤

1. 创建目录 `scripts/hub/providers/<name>/index.ts`
2. 导出 `fetchModels: ProviderPlugin`
3. 在 `scripts/hub/evaluator.ts:PROVIDER_META` 添加 `displayName` / `website`
4. 跑 `npm run sync-models` 自动发现

## 模板

```typescript
import type { RawModelData, ProviderPlugin } from '../../types.js';

const API_URL = 'https://example.com/api/models';

async function fetch(): Promise<RawModelData[]> {
  const response = await fetch(API_URL);
  if (!response.ok) {
    console.warn(`[myprovider] API ${response.status}`);
    return [];
  }
  const data = await response.json();

  return data.models.map((m: any) => ({
    vendor: 'myprovider',
    modelId: `myprovider/${m.id}`,                    // 务必加 vendor 前缀
    name: m.displayName,
    description: m.description?.slice(0, 500),

    contextSize: m.contextLength,
    priceInput: m.inputPrice,                          // per million tokens
    priceOutput: m.outputPrice,
    priceCurrency: 'USD',                              // 或 'CNY'

    isFree: m.free === true,
    freeMechanism: m.free ? 'rate-limited' : null,     // permanent / rate-limited / daily-tokens / monthly-tokens / trial-credits / preview / null
    freeQuota: m.free ? { rpm: 60, notes: '...' } : null,
    trialScope: m.free ? 'specific' : 'none',          // all / flagship / fast / specific / none

    capabilities: m.modalities ?? ['chat', 'text-generation'],

    metadata: {
      // 任意原始字段
    },
  }));
}

export const fetchModels: ProviderPlugin = fetch;
```

## 元信息

`scripts/hub/evaluator.ts`：

```typescript
export const PROVIDER_META: Record<string, ProviderMeta> = {
  // ... 现有
  myprovider: {
    name: 'myprovider',
    displayName: 'My Provider',
    website: 'https://myprovider.com',
  },
};
```

## 注意事项

- **不要**自己实现关键词推断 capabilities，输出原始字符串即可，taxonomy 会规范化
- **不要**自己除以/乘以转换价格单位，统一 per-million-tokens
- **不要**抛错，失败返回 `[]`，aggregator 会处理
- **务必**用 `vendor/` 前缀的 modelId
- 加 retry 策略：参考 `scripts/hub/providers/nvidia/index.ts:fetchWithRetry`

## 判断 `free_mechanism`

> 核心定义：`is_free=true` 表示用户在某种限制条件下**不付费**就能调用。

| 性质 | `free_mechanism` | 例子 |
|------|------------------|------|
| 永久免费、无任何限制 | `permanent` | bigmodel GLM-4-Flash、Gitee 完全免费 |
| 免费但有 RPM/RPD 限制 | `rate-limited` | OpenRouter `:free`、Google Flash 层 |
| 每日 token 配额内免费 | `daily-tokens` | LongCat 500K-50M tokens/天 |
| 每月 token 配额内免费 | `monthly-tokens` | （部分 provider） |
| 一次性试用 credits（用完即停） | `trial-credits` | NVIDIA NIM credits |
| 预览版免费（可能下线） | `preview` | Cerebras Qwen 3 235B Preview |
| **不免费**（必须付费） | `null` | Gitee 体验、所有付费模型 |

`free_quota` 字段补充具体配额数值（rpm、tokens_per_day、total_credits 等）。
