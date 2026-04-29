# LongCat Provider

## 概述

LongCat API 开放平台是美团旗下的大模型服务平台，提供丰富的模型和每日免费额度。

## 数据来源

| 类型 | URL | 说明 |
|------|-----|------|
| 文档 | `https://longcat.chat/platform/docs/zh/` | 中文文档页面 |

## 筛选逻辑

### 1. 数据来源

模型数据从文档页面解析，包含模型名称、API 格式、描述和免费额度信息。

### 2. 模型数据

```typescript
interface LongCatModel {
  modelId: string;
  name: string;
  contextSize?: number;
  description: string;
  isFree: boolean;
  freeQuota?: string;
  capabilities: string[];
  apiFormats: string[];
  isAgentic?: boolean;
  isMultimodal?: boolean;
}
```

### 3. 能力分类

```typescript
const CAPABILITY_MAP = {
  'LongCat-Flash-Chat': ['chat', 'text-generation'],
  'LongCat-Flash-Thinking': ['chat', 'text-generation', 'reasoning'],
  'LongCat-Flash-Lite': ['chat', 'text-generation'],
  'LongCat-Flash-Omni-2603': ['chat', 'text-generation', 'vision'],
  'LongCat-2.0-Preview': ['chat', 'text-generation', 'agentic'],
};
```

### 4. 免费模型判断

LongCat 所有模型都有免费额度，因此 `isFree = true`：

```typescript
const MODEL_DATA: LongCatModel[] = [
  {
    modelId: 'LongCat-Flash-Chat',
    name: 'LongCat Flash Chat',
    contextSize: 256000,
    description: '高性能通用对话模型',
    isFree: true,
    freeQuota: '500,000 tokens/天',
    capabilities: ['chat', 'text-generation'],
  },
  // ... 所有模型 isFree = true
];
```

## 模型分类统计

| 分类 | 数量 | 免费额度 |
|------|------|----------|
| 通用对话 | 4 | 500K/天 |
| 深度思考 | 2 | 500K/天 |
| 多模态 | 1 | 500K/天 |
| Agentic | 1 | 10M/2小时 |
| **合计** | **7** | **全部免费** |

## 主要模型列表

| 模型 ID | 名称 | 上下文 | 免费额度 | 特点 |
|---------|------|--------|----------|------|
| LongCat-Flash-Chat | Flash Chat | 256K | 500K/天 | 通用对话 |
| LongCat-Flash-Thinking | Flash Thinking | 256K | 500K/天 | 深度思考 |
| LongCat-Flash-Thinking-2601 | Flash Thinking 2601 | 256K | 500K/天 | 升级版思考 |
| LongCat-Flash-Lite | Flash Lite | 256K | 50M/天 | MoE 轻量化 |
| LongCat-Flash-Omni-2603 | Flash Omni | 128K | 500K/天 | 多模态 |
| LongCat-Flash-Chat-2602-Exp | Flash Chat Exp | 256K | 500K/天 | 实验版 |
| LongCat-2.0-Preview | 2.0 Preview | 1M | 10M/2小时 | Agentic |

## API 端点

| 格式 | URL |
|------|-----|
| OpenAI | `https://api.longcat.chat/openai` |
| Anthropic | `https://api.longcat.chat/anthropic` |

## 特殊字段说明

| 字段 | 类型 | 说明 |
|------|------|------|
| `metadata.freeQuota` | string | 每日免费额度 |
| `metadata.apiFormats` | string[] | 支持的 API 格式 |
| `metadata.isAgentic` | boolean | 是否为 Agentic 模型 |
| `metadata.isMultimodal` | boolean | 是否支持多模态 |

## 关键代码

```typescript
// 文件：scripts/hub/providers/longcat/index.ts

async function fetchLongCatModels(): Promise<RawModelData[]> {
  return MODEL_DATA.map((m) => ({
    vendor: 'longcat',
    modelId: `longcat/${m.modelId}`,
    name: m.name,
    description: `LongCat: ${m.description}`,
    contextSize: m.contextSize,
    isFree: m.isFree,
    capabilities: m.capabilities,
    metadata: {
      originalId: m.modelId,
      contextSize: m.contextSize,
      freeQuota: m.freeQuota,
      apiFormats: m.apiFormats,
      isAgentic: m.isAgentic,
      isMultimodal: m.isMultimodal,
    },
  }));
}
```

## Provider 配置

```typescript
export const PROVIDER_META: Record<string, ProviderMeta> = {
  longcat: {
    name: 'longcat',
    displayName: 'LongCat',
    website: 'https://longcat.chat',
  },
};
```
