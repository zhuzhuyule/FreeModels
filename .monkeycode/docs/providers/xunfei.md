# Xunfei Provider (iFlytek Spark)

## 概述

iFlytek Spark（讯飞星火）是科大讯飞推出的大模型服务平台。

## 数据来源

| 类型 | URL | 说明 |
|------|-----|------|
| API | `https://maas.xfyun.cn/api/v1/gpt-finetune/model/base/list-v2?page=1&size=9999` | MaaS API |

## 筛选逻辑

### 1. API 请求

```typescript
const MAAS_API = 'https://maas.xfyun.cn/api/v1/gpt-finetune/model/base/list-v2?page=1&size=9999';

const response = await fetch(MAAS_API, {
  headers: {
    Accept: 'application/json',
    'User-Agent': 'Mozilla/5.0',
  },
});
```

### 2. 响应结构

```typescript
interface XunfeiResponse {
  data?: {
    rows?: XunfeiModel[];
  };
  succeed?: boolean;
}

interface XunfeiModel {
  name: string;
  userName: string;
  desc?: string;
  function?: number;
  price?: {
    inferencePrice?: {
      inTokensPrice?: number;
      outTokensPrice?: number;
      inTokensOrigPrice?: number;
      outTokensOrigPrice?: number;
    };
  };
  categoryTree?: Array<{
    key: string;
    children?: Array<{ name: string }>;
  }>;
}
```

### 3. 价格解析

```typescript
const price = m.price?.inferencePrice || {};
const inPrice = Number(price.inTokensPrice ?? price.inTokensOrigPrice ?? 0);
const outPrice = Number(price.outTokensPrice ?? price.outTokensOrigPrice ?? 0);
```

### 4. 上下文长度解析

从 `categoryTree` 中提取 `contextLengthTag`：

```typescript
const contextNode = m.categoryTree?.find(c => c.key === 'contextLengthTag')?.children?.[0];
const contextSize = parseContextLabel(contextNode?.name);

function parseContextLabel(label?: string): number | undefined {
  if (!label) return undefined;
  const match = label.match(/(\d+)[kK]/);
  if (match) return parseInt(match[1]) * 1024;
  return undefined;
}
```

### 5. 能力映射

```typescript
const CAPABILITY_MAP: Record<number, string[]> = {
  4: ['ocr', 'vision'],           // OCR
  8: ['embeddings'],              // Embedding
  12: ['chat', 'text-generation', 'vision'], // 多模态
  15: ['reasoning'],              // 深度推理
};

// 基于名称推断
if (m.name.includes('Reranker')) caps.push('rerank');
if (m.name.includes('Embedding')) caps.push('embeddings');
if (m.name.includes('VL') || m.name.includes('OCR')) caps.push('vision');
if (m.name.includes('Code')) caps.push('code-generation');
```

## 模型分类统计

| 分类 | 数量 |
|------|------|
| 总模型数 | 64 |
| 免费 | 0 |
| 收费 | 全部 |

## 特殊字段说明

| 字段 | 类型 | 说明 |
|------|------|------|
| `metadata.provider` | string | 服务提供方 |
| `metadata.category` | string | 模型类别 |
| `metadata.function` | number | 功能类型（4/8/12/15） |
| `metadata.contextLabel` | string | 上下文标签（人类可读） |

## 关键代码

```typescript
// 文件：scripts/hub/providers/xunfei/index.ts

async function fetchXunfeiModels(): Promise<RawModelData[]> {
  const json = await response.json();

  return json.data.rows.map((m) => {
    const capabilities: string[] = [];
    if (m.function) {
      const mapped = CAPABILITY_MAP[m.function];
      if (mapped) capabilities.push(...mapped);
    }

    return {
      vendor: 'xunfei',
      modelId: `xunfei/${m.name}`,
      name: m.name,
      description: m.desc?.replace(/<[^>]*>/g, '')?.substring(0, 200),
      contextSize,
      priceInput: inPrice,
      priceOutput: outPrice,
      isFree: inPrice === 0 && outPrice === 0,
      capabilities,
      metadata: {
        provider: m.userName,
        category: categoryNode?.name || '文本生成',
        function: m.function,
        contextLabel: contextNode?.name,
      },
    };
  });
}
```

## Provider 配置

```typescript
export const PROVIDER_META: Record<string, ProviderMeta> = {
  xunfei: {
    name: 'xunfei',
    displayName: 'iFlytek Spark',
    website: 'https://xinghuo.xfyun.cn',
  },
};
```
