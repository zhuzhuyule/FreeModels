# Google AI Provider

## 概述

Google AI 提供 Gemini 系列模型，涵盖 LLM、图像生成、视频生成、语音合成等多种能力。

## 数据来源

| 类型 | URL | 说明 |
|------|-----|------|
| 文档 | `https://ai.google.dev/gemini-api/docs/pricing.md.txt?hl=zh-cn` | 定价文档（模型列表、价格、能力） |

## 筛选逻辑

### 1. 数据来源

Google 的模型数据完全从定价文档解析，包含：
- 模型 ID
- 模型名称
- 模型描述
- 上下文长度
- 输入/输出价格
- 免费层级

### 2. 免费模型判断

根据定价文档中的 "Free Tier" 列判断：

```typescript
// 如果 Free Tier 标注为 "Free of charge"，则 isFree = true
isFree: pricing.includes('Free of charge');
```

### 3. 能力分类

根据模型名称和类型推断：

```typescript
const CAPABILITY_MAP = {
  'chat completion': ['chat', 'text-generation'],
  'completion': ['text-generation'],
  'embedding': ['embeddings'],
  'rerank': ['rerank'],
  'image': ['vision'],
  'video': ['video-generation'],
  'speech': ['speech-synthesis'],
};
```

### 4. 模型分类

```typescript
interface GoogleModel {
  modelId: string;
  name: string;
  description: string;
  contextSize?: number;
  priceInput?: number;
  priceOutput?: number;
  isFree: boolean;
  capabilities: string[];
  category: 'LLM' | 'Image' | 'Video' | 'Audio' | 'Embedding' | 'TTS' | 'Robotics' | 'Agent';
}
```

## 模型分类统计

| 分类 | 数量 | 免费数量 |
|------|------|----------|
| LLM | 12 | 9 |
| Image | 6 | 0 |
| Audio | 6 | 4 |
| Video | 4 | 0 |
| Embedding | 2 | 2 |
| Robotics | 2 | 2 |
| **合计** | **32** | **17** |

## 主要模型列表

### LLM 模型

| 模型 ID | 名称 | 上下文 | 输入价格 | 输出价格 | 免费 |
|---------|------|--------|----------|----------|------|
| gemini-3.1-pro-preview | Gemini 3.1 Pro | 2M | $2.00 | $12.00 | 否 |
| gemini-3.1-flash-lite-preview | Gemini 3.1 Flash-Lite | 1M | $0.25 | $1.50 | 是 |
| gemini-3-flash-preview | Gemini 3 Flash | 1M | $0.50 | $3.00 | 是 |
| gemini-2.5-pro | Gemini 2.5 Pro | 1M | $1.25 | $10.00 | 是 |
| gemini-2.5-flash | Gemini 2.5 Flash | 1M | $0.30 | $2.50 | 是 |
| gemini-2.5-flash-lite | Gemini 2.5 Flash-Lite | 1M | $0.10 | $0.40 | 是 |
| gemma-4 | Gemma 4 | 1M | - | - | 是 |

### 图像/视频/音频模型

| 分类 | 模型 | 输入价格 | 输出价格 |
|------|------|----------|----------|
| Imagen 4 | imagen-4.0-generate-001 | $0.04/图 | - |
| Imagen 4 Ultra | imagen-4.0-ultra-generate-001 | $0.06/图 | - |
| Veo 3.1 | veo-3.1-generate-preview | $0.40/秒 | - |
| Lyria 3 | lyria-3-clip-preview | $0.04/请求 | - |

## 特殊字段说明

| 字段 | 类型 | 说明 |
|------|------|------|
| `metadata.category` | string | 模型分类（LLM/Image/Video等） |
| `metadata.originalId` | string | 原始模型 ID |

## 关键代码

```typescript
// 文件：scripts/hub/providers/google/index.ts

const MODEL_DATA: GoogleModel[] = [
  {
    modelId: 'gemini-3.1-pro-preview',
    name: 'Gemini 3.1 Pro Preview',
    description: '最新性能、智力和可用性改进，支持多模态理解、代理能力和 vibe-coding',
    contextSize: 2000000,
    priceInput: 2.00,
    priceOutput: 12.00,
    isFree: false,
    capabilities: ['chat', 'text-generation', 'reasoning', 'agentic'],
    category: 'LLM',
  },
  // ... 更多模型
];
```

## Provider 配置

```typescript
export const PROVIDER_META: Record<string, ProviderMeta> = {
  google: {
    name: 'google',
    displayName: 'Google AI',
    website: 'https://ai.google.dev',
  },
};
```
