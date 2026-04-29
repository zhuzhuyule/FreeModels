# Gitee AI Provider

## 概述

Gitee AI 是国内领先的 AI 模型聚合平台，提供丰富的开源和自研模型。

## 数据来源

| 类型 | URL | 说明 |
|------|-----|------|
| API | `https://ai.gitee.com/api/pay/service/operations?vendor=` | 模型列表和定价 API |

## 筛选逻辑

### 1. 免费模型判断

```typescript
const freeUse = firstOp.free_use === true;
const hasPrice = opPrice > 0 || tPriceInput > 0 || tPriceOutput > 0;

// 完全免费：free_use=true 且无价格
isFree = freeUse && !hasPrice;

// 允许体验：free_use=true 但有价格（Gitee 特有）
isExperienceable = freeUse && hasPrice;
```

### 2. 能力推断

根据模型名称、描述、类型关键词推断：

```typescript
const CAPABILITY_KEYWORDS = {
  reasoning: [/\b(reasoning|think|thought|r1|chain.?of.?thought|problem.?solv)\b/i],
  vision: [/\b(vision|visual|image|photo|picture|multimodal|图生|图理解)\b/i],
  tool_use: [/\b(tool|function.?call|plugin|tool.?use|actions)\b/i],
  code: [/\b(code|programming|codegen|script)\b/i],
};
```

### 3. 类型映射

```typescript
const TYPE_MAP = {
  text2text: 'text-generation',
  text2image: 'image-generation',
  image2image: 'image-to-image',
  image2text: 'vision',
  audio2text: 'speech-recognition',
  text2audio: 'speech-synthesis',
  embedding: 'embeddings',
  chat: 'chat',
  'code-generation': 'code-generation',
  rerank: 'rerank',
  moderation: 'moderation',
  doc2md: 'document-processing',
  web_search: 'web-search',
};
```

## 模型分类统计

| 分类 | is_free | is_experienceable | 数量 |
|------|---------|-------------------|------|
| 完全免费 | true | false | 44 |
| 允许体验 | false | true | 144 |
| 收费 | false | false | 13 |
| **合计** | | | **201** |

## 特殊字段说明

| 字段 | 类型 | 说明 |
|------|------|------|
| `is_free` | boolean | 完全免费（无价格） |
| `is_experienceable` | boolean | 允许体验（有价格但可体验） |
| `metadata.freeUse` | boolean | API 返回的 free_use 字段 |
| `metadata.isFullyFree` | boolean | 是否完全免费（无任何价格） |

## 关键代码

```typescript
// 文件：scripts/hub/providers/gitee/index.ts

const opPrice = Number(firstOp.price || 0);
const tPriceInput = Number(firstOp.input_million_tokens_price || 0);
const tPriceOutput = Number(firstOp.output_million_tokens_price || 0);
const freeUse = firstOp.free_use === true;
const hasPrice = opPrice > 0 || tPriceInput > 0 || tPriceOutput > 0;

const isFullyFree = freeUse && !hasPrice;
const isExperienceable = freeUse && hasPrice;
```

## Provider 配置

```typescript
// 在 scripts/hub/evaluator.ts 中
export const PROVIDER_META: Record<string, ProviderMeta> = {
  gitee: {
    name: 'gitee',
    displayName: 'Gitee AI',
    website: 'https://ai.gitee.com',
  },
};
```
