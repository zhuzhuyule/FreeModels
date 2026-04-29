# BigModel Provider

## 概述

BigModel（智谱AI开放平台）是北京智谱华章科技股份有限公司的大模型平台，提供 GLM 系列模型的 API 服务。

## 数据来源

| 类型 | URL | 说明 |
|------|-----|------|
| API | `https://open.bigmodel.cn/api/biz/operation/query?ids=1137,1122,1123,1124,1132,1125,1126` | 定价页面 API |

## 筛选逻辑

### 1. 数据获取

定价页面 API 返回 JSON 格式数据，包含以下分类：
- 语言模型
- 视觉模型
- 图像模型
- 视频模型
- 向量模型
- 其他模型
- 模型训练
- 模型推理
- 搜索工具

### 2. 模型名称识别

通过正则匹配识别模型名称：

```typescript
const MODEL_NAME_PATTERNS = [
  /^GLM-[\w.-]+$/i,
  /^CogView[\w-]*$/i,
  /^CogVideo[\w-]*$/i,
  /^Embedding-[\w]+$/i,
  /^ChatGLM[\w-]*$/i,
  /^CharGLM[\w-]*$/i,
  /^Emohaa$/i,
  /^CodeGeeX[\w-]*$/i,
  /^Rerank$/i,
  /^GLM-TTS$/i,
  /^GLM-ASR$/i,
  /^Search-[\w]+$/i,
];
```

### 3. 能力推断

根据模型名称和分类推断能力：

```typescript
function inferCapabilities(model: ParsedModel): string[] {
  const caps: string[] = ['chat', 'text-generation'];
  const text = `${model.name} ${model.description} ${model.category}`;

  if (text.includes('视觉') || text.includes('vision')) caps.push('vision');
  if (text.includes('视频')) caps.push('video-generation');
  if (text.includes('图像生成') || text.includes('cogview')) caps.push('image-generation');
  if (text.includes('语音')) caps.push('speech-synthesis');
  if (text.includes('识别')) caps.push('speech-recognition');
  if (text.includes('embedding')) caps.push('embeddings');
  if (text.includes('rerank')) caps.push('rerank');
  if (text.includes('推理') || text.includes('z1')) caps.push('reasoning');
  if (text.includes('code')) caps.push('code-generation');
  if (text.includes('search')) caps.push('web-search');

  return caps;
}
```

### 4. 去重策略

同一模型可能出现在多个分类中（语言模型、模型训练、模型推理等），使用 `name|context|price` 作为去重键。

## 模型分类统计

| 分类 | 数量 | 说明 |
|------|------|------|
| 完全免费 | 7 | 包含 Flash 系列 |
| 总模型数 | 83 | 涵盖 LLM、视觉、图像、视频、语音等 |

## 免费模型列表

| 模型 | 上下文 | 类型 | 能力 |
|------|--------|------|------|
| GLM-4-Flash | 128K | 语言模型 | chat, text-generation |
| GLM-4-Flash-250414 | 128K | 语言模型 | chat, text-generation |
| GLM-Z1-Flash | 128K | 推理模型 | chat, text-generation, reasoning |
| GLM-4V-Flash | 4K | 视觉理解 | chat, text-generation, vision |
| GLM-4.1V-Thinking-Flash | 64K | 视觉推理 | chat, text-generation, vision |
| CogView-3-Flash | - | 图像生成 | chat, text-generation, vision |
| CogVideoX-Flash | - | 视频生成 | chat, text-generation, video-generation |

## 主要模型列表

### 语言模型

| 模型 | 上下文 | 价格 | 说明 |
|------|--------|------|------|
| GLM-4-Plus | 128K | ¥5/1M tokens | 高智能旗舰 |
| GLM-4-Air-250414 | 128K | ¥0.5/1M tokens | 高性价比 |
| GLM-4-Long | 1M | ¥1/1M tokens | 超长输入 |
| GLM-Z1-Air | 128K | ¥0.5/1M tokens | 高性价比推理 |
| GLM-Z1-FlashX | 128K | ¥0.1/1M tokens | 高速低价 |

### 视觉模型

| 模型 | 上下文 | 价格 | 说明 |
|------|--------|------|------|
| GLM-4V-Plus | 16K | ¥4/1M tokens | 视觉推理 |
| GLM-4V-Flash | 4K | 免费 | 图像理解 |
| GLM-4.1V-Thinking-Flash | 64K | 免费 | 视觉推理 |

### 图像/视频模型

| 模型 | 类型 | 价格 | 说明 |
|------|------|------|------|
| CogView-4 | 图像生成 | ¥0.06/次 | 多分辨率 |
| CogView-3-Flash | 图像生成 | 免费 | 多分辨率 |
| CogVideoX-3 | 视频生成 | ¥1/次 | 多分辨率 |
| CogVideoX-Flash | 视频生成 | 免费 | 多分辨率 |

## 特殊字段说明

| 字段 | 类型 | 说明 |
|------|------|------|
| `metadata.originalName` | string | 原始模型名称 |
| `metadata.context` | string | 上下文长度标识 |
| `metadata.price` | string | 价格信息 |
| `metadata.category` | string | 模型分类 |

## Provider 配置

```typescript
export const PROVIDER_META: Record<string, ProviderMeta> = {
  bigmodel: {
    name: 'bigmodel',
    displayName: 'BigModel',
    website: 'https://open.bigmodel.cn',
  },
};
```

## 关键代码

```typescript
// 文件：scripts/hub/providers/bigmodel/index.ts

async function fetchBigModelModels(): Promise<RawModelData[]> {
  const response = await fetch(PRICING_API, {
    headers: { Accept: 'application/json' },
  });

  const data = (await response.json()) as BigModelPricingResponse;
  const parsedModels = parsePricingResponse(data);

  return parsedModels.map(pm => ({
    vendor: 'bigmodel',
    modelId: `bigmodel/${pm.name.toLowerCase()}`,
    name: pm.name,
    isFree: isFreeModel(pm.price),
    capabilities: inferCapabilities(pm),
    metadata: { ... },
  }));
}
```
