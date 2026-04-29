# Groq Provider

## 概述

Groq 提供基于 LPU（Language Processing Unit）的极速推理服务，以高吞吐量著称。

## 数据来源

| 类型 | URL | 说明 |
|------|-----|------|
| 页面 | `https://groq.com/pricing` | 定价页面（HTML） |

## 筛选逻辑

### 1. 数据来源

Groq API 需要认证返回 403，因此改用解析 `groq.com/pricing` 页面获取模型数据。

### 2. 模型数据

模型数据硬编码在 Provider 中：

```typescript
const MODEL_DATA: Record<string, Omit<GroqModel, 'modelId' | 'name' | 'capabilities'>> = {
  'llama-3.1-8b-instant': {
    contextSize: 128000,
    inputPrice: 0.05,
    outputPrice: 0.08,
    speed: 840,
  },
  // ... 更多模型
};
```

### 3. 能力映射

```typescript
const CAPABILITY_MAP: Record<string, string[]> = {
  'llama-3.1-8b-instant': ['chat', 'text-generation'],
  'llama-3.3-70b-versatile': ['chat', 'text-generation'],
  'meta-llama/llama-4-scout-17b-16e-instruct': ['chat', 'text-generation'],
  'qwen/qwen3-32b': ['chat', 'text-generation', 'reasoning'],
  'canopylabs/orpheus-v1-english': ['speech-synthesis'],
  'canopylabs/orpheus-arabic-saudi': ['speech-synthesis', 'translation'],
  'whisper-large-v3': ['speech-recognition'],
  'whisper-large-v3-turbo': ['speech-recognition'],
  // ...
};
```

### 4. 名称映射

```typescript
function getDisplayName(modelId: string): string {
  const names: Record<string, string> = {
    'llama-3.1-8b-instant': 'Llama 3.1 8B Instant',
    'qwen/qwen3-32b': 'Qwen3 32B',
    // ...
  };
  return names[modelId] || modelId;
}
```

## 模型分类统计

| 分类 | 数量 |
|------|------|
| LLM | 6 |
| TTS | 2 |
| ASR | 2 |
| Enterprise | 2 |
| **合计** | **12** |

## 主要模型列表

### LLM 模型

| 模型 ID | 名称 | 上下文 | 输入价格 | 输出价格 | 速度 |
|--------|------|--------|----------|----------|------|
| llama-3.1-8b-instant | Llama 3.1 8B Instant | 128k | $0.05 | $0.08 | 840 TPS |
| llama-3.3-70b-versatile | Llama 3.3 70B | 128k | $0.59 | $0.79 | 394 TPS |
| meta-llama/llama-4-scout-17b-16e-instruct | Llama 4 Scout | 128k | $0.11 | $0.34 | 594 TPS |
| qwen/qwen3-32b | Qwen3 32B | 131k | $0.29 | $0.59 | 662 TPS |
| openai/gpt-oss-20b | GPT OSS 20B | 128k | $0.075 | $0.30 | 1000 TPS |
| openai/gpt-oss-120b | GPT OSS 120B | 128k | $0.15 | $0.60 | 500 TPS |

### TTS 模型

| 模型 ID | 名称 | 价格 | 速度 |
|--------|------|------|------|
| canopylabs/orpheus-v1-english | Orpheus English | $22/1M chars | 100 c/s |
| canopylabs/orpheus-arabic-saudi | Orpheus Arabic | $40/1M chars | 100 c/s |

### ASR 模型

| 模型 ID | 名称 | 价格 | 速度 |
|--------|------|------|------|
| whisper-large-v3 | Whisper V3 | $0.111/hr | 217x |
| whisper-large-v3-turbo | Whisper Turbo | $0.04/hr | 228x |

## 特殊字段说明

| 字段 | 类型 | 说明 |
|------|------|------|
| `metadata.originalId` | string | 原始模型 ID |
| `metadata.speed` | number | 推理速度（tokens/sec 或 chars/sec） |
| `metadata.isEnterprise` | boolean | 是否为企业独有模型 |

## 关键代码

```typescript
// 文件：scripts/hub/providers/groq/index.ts

async function fetchGroqModels(): Promise<RawModelData[]> {
  return MODEL_DATA.map(([modelId, baseData]) => ({
    vendor: 'groq',
    modelId: `groq/${modelId}`,
    name: getDisplayName(modelId),
    contextSize: baseData.contextSize,
    priceInput: baseData.inputPrice,
    priceOutput: baseData.outputPrice,
    isFree: false,
    capabilities: CAPABILITY_MAP[modelId] || ['chat', 'text-generation'],
    metadata: {
      originalId: modelId,
      speed: baseData.speed,
      isEnterprise: ['minimax-m2.5', 'qwen/qwen3-vl-32b'].includes(modelId),
    },
  }));
}
```

## Provider 配置

```typescript
export const PROVIDER_META: Record<string, ProviderMeta> = {
  groq: {
    name: 'groq',
    displayName: 'Groq',
    website: 'https://groq.com',
  },
};
```
