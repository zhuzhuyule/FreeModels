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
    freeKind: m.free ? 'rate-limited' : 'unknown',     // permanent / rate-limited / trial-quota / preview / unknown
    trialScope: m.free ? 'specific' : 'none',          // all / flagship / fast / specific / none
    rateLimits: m.free ? { rpm: 60, notes: '...' } : undefined,

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

## 常见 free_kind 判断

| 性质 | `free_kind` | 例子 |
|------|-------------|------|
| 永久免费、无任何限制 | `permanent` | bigmodel GLM-4-Flash、gitee 完全免费 |
| 免费但有 RPM/RPD 限制 | `rate-limited` | OpenRouter `:free`、Google Flash 层 |
| 免费配额（用完即停） | `trial-quota` | NVIDIA NIM credits、LongCat 每日 tokens |
| 预览版免费（可能下线） | `preview` | Cerebras Qwen 3 235B Preview |
| Provider 没明确说明 | `unknown` | 缺乏文档时的默认值 |
