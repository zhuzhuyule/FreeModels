# Cerebras Provider

## 概述

Cerebras 提供基于超大参数模型的极速推理服务，专注千亿参数大模型。

## 数据来源

| 类型 | URL | 说明 |
|------|-----|------|
| 文档 | `https://inference-docs.cerebras.ai/models/overview` | 模型概述文档 |

## 筛选逻辑

### 1. 数据来源

Cerebras API 需要认证返回 403，因此改用解析文档页面获取模型数据。

### 2. 模型数据

模型数据硬编码在 Provider 中：

```typescript
const MODEL_DATA: CerebrasModel[] = [
  {
    modelId: 'llama3.1-8b',
    name: 'Llama 3.1 8B',
    contextSize: 8192,
    parameters: 8_000_000_000,
    speed: 2200,
    inputPrice: 0,
    outputPrice: 0,
    isFree: true,
    capabilities: ['chat', 'text-generation'],
  },
  // ... 更多模型
];
```

### 3. 模型类型

```typescript
interface CerebrasModel {
  modelId: string;
  name: string;
  contextSize?: number;
  parameters?: number;
  speed?: number;
  inputPrice?: number;
  outputPrice?: number;
  isFree: boolean;
  isPreview?: boolean;
  capabilities: string[];
}
```

### 4. 免费模型判断

根据文档标注：
- Production 模型：部分免费
- Preview 模型：通常收费或内测

## 模型分类统计

| 分类 | 数量 | 免费数量 |
|------|------|----------|
| Production | 2 | 2 |
| Preview | 2 | 0 |
| **合计** | **4** | **2** |

## 主要模型列表

| 模型 ID | 名称 | 上下文 | 参数 | 速度 | 类型 | 免费 |
|--------|------|--------|------|------|------|------|
| llama3.1-8b | Llama 3.1 8B | 8k | 8B | 2200 TPS | Production | 是 |
| gpt-oss-120b | GPT OSS 120B | - | 120B | 3000 TPS | Production | 是 |
| qwen-3-235b-a22b-instruct-2507 | Qwen 3 235B | 64k | 235B | 1400 TPS | Preview | 否 |
| zai-glm-4.7 | Z.ai GLM 4.7 | - | 355B | 1000 TPS | Preview | 否 |

## 特殊字段说明

| 字段 | 类型 | 说明 |
|------|------|------|
| `metadata.originalId` | string | 原始模型 ID |
| `metadata.parameters` | number | 参数数量 |
| `metadata.speed` | number | 推理速度（tokens/sec） |
| `metadata.isPreview` | boolean | 是否为预览模型 |

## 关键代码

```typescript
// 文件：scripts/hub/providers/cerebras/index.ts

async function fetchCerebrasModels(): Promise<RawModelData[]> {
  return MODEL_DATA.map((m) => ({
    vendor: 'cerebras',
    modelId: `cerebras/${m.modelId}`,
    name: m.name,
    description: `Cerebras ${m.isPreview ? 'Preview ' : ''}model: ${m.name}`,
    contextSize: m.contextSize,
    priceInput: m.inputPrice,
    priceOutput: m.outputPrice,
    isFree: m.isFree,
    capabilities: m.capabilities,
    metadata: {
      originalId: m.modelId,
      parameters: m.parameters,
      speed: m.speed,
      isPreview: m.isPreview,
    },
  }));
}
```

## Provider 配置

```typescript
export const PROVIDER_META: Record<string, ProviderMeta> = {
  cerebras: {
    name: 'cerebras',
    displayName: 'Cerebras',
    website: 'https://cerebras.ai',
  },
};
```
