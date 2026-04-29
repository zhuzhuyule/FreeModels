# OpenRouter Provider

## 概述

OpenRouter 是一个模型聚合平台，汇聚了来自 NVIDIA、Poolside、Google 等多家提供商的免费模型。通过 OpenRouter API 获取免费模型列表（`max_price=0` 筛选）。

## 数据来源

| 类型 | URL | 说明 |
|------|-----|------|
| API | `https://openrouter.ai/api/frontend/models/find?fmt=cards&max_price=0` | 免费模型列表 |

## 筛选逻辑

### 1. 数据获取

使用 `max_price=0` 参数筛选完全免费的模型。OpenRouter API 返回 JSON 格式数据：

```json
{
  "data": {
    "models": [{
      "slug": "nvidia/nemotron-3-nano-omni-30b-a3b-reasoning",
      "name": "NVIDIA: Nemotron 3 Nano Omni (free)",
      "context_length": 256000,
      "input_modalities": ["text", "audio", "image", "video"],
      "supports_reasoning": true,
      ...
    }]
  }
}
```

### 2. 能力推断

根据模型名称和输入模态推断能力：

```typescript
function inferCapabilities(model: OpenRouterModel): string[] {
  const caps: string[] = ['chat', 'text-generation'];

  if (modalities.includes('image')) caps.push('vision');
  if (modalities.includes('audio')) caps.push('speech-recognition');
  if (modalities.includes('video')) caps.push('video-generation');
  if (model.supports_reasoning) caps.push('reasoning');

  if (nameLower.includes('embed')) caps.push('embeddings');
  if (nameLower.includes('rerank')) caps.push('rerank');
  if (nameLower.includes('code')) caps.push('code-generation');

  return caps;
}
```

### 3. 模型 ID 格式

```
openrouter/{author}/{slug}
```

示例：`openrouter/nvidia/nemotron-3-nano-omni-30b-a3b-reasoning`

## 模型分类统计

| 分类 | 数量 | 说明 |
|------|------|------|
| 完全免费 | 56 | 使用 `max_price=0` 筛选 |
| 多模态 | 32 | 包含图像/音频/视频输入 |
| 推理模型 | 16 | `supports_reasoning: true` |

## 主要模型列表

### NVIDIA 系列

| 模型 ID | 名称 | 上下文 | 模态 | 推理 |
|--------|------|--------|------|------|
| nvidia/nemotron-3-nano-omni-30b-a3b-reasoning | Nemotron 3 Nano Omni | 256k | 文本/音频/图像/视频 | 是 |
| nvidia/nemotron-3-super-30b | Nemotron 3 Super | - | 文本 | - |

### Poolside 系列

| 模型 ID | 名称 | 上下文 | 推理 |
|--------|------|--------|------|
| poolside/laguna-xs.2 | Laguna XS.2 | 131k | 是 |
| poolside/laguna-m.1 | Laguna M.1 | 131k | 是 |

### Google 系列

| 模型 ID | 名称 | 上下文 | 说明 |
|--------|------|--------|------|
| google/gemma-4-26b-a4b | Gemma 4 26B | - | 免费版本 |
| google/gemma-4-31b | Gemma 4 31B | - | 免费版本 |

## 特殊字段说明

| 字段 | 类型 | 说明 |
|------|------|------|
| `metadata.originalId` | string | 原始模型 slug |
| `metadata.author` | string | 模型作者 |
| `metadata.author_display_name` | string | 作者显示名称 |
| `metadata.input_modalities` | string[] | 输入模态 |
| `metadata.output_modalities` | string[] | 输出模态 |
| `metadata.supports_reasoning` | boolean | 是否支持推理 |
| `metadata.reasoning_config` | object | 推理配置 |
| `metadata.group` | string | 模型分组 |
| `metadata.is_multimodal` | boolean | 是否多模态 |

## Provider 配置

```typescript
export const PROVIDER_META: Record<string, ProviderMeta> = {
  openrouter: {
    name: 'openrouter',
    displayName: 'OpenRouter',
    website: 'https://openrouter.ai',
  },
};
```

## 关键代码

```typescript
// 文件：scripts/hub/providers/openrouter/index.ts

async function fetchOpenRouterModels(): Promise<RawModelData[]> {
  const response = await fetch(API_URL, {
    headers: { Accept: 'application/json' },
  });

  const data = (await response.json()) as OpenRouterAPIResponse;

  return data.data.models.map((m) => ({
    vendor: 'openrouter',
    modelId: `openrouter/${m.slug}`,
    name: m.name,
    description: m.description.replace(/<[^>]*>/g, '').slice(0, 500),
    contextSize: m.context_length || undefined,
    priceInput: 0,
    priceOutput: 0,
    isFree: true,
    capabilities: inferCapabilities(m),
    metadata: {
      originalId: m.slug,
      author: m.author,
      input_modalities: m.input_modalities,
      supports_reasoning: m.supports_reasoning,
      provider: 'openrouter',
    },
  }));
}
```
