# NVIDIA AI Provider

## 概述

NVIDIA 提供基于其 LPU（Language Processing Unit）的 AI 推理服务，拥有极高的推理速度。

## 数据来源

| 类型 | URL | 说明 |
|------|-----|------|
| API | `https://integrate.api.nvidia.com/v1/models` | 模型列表 API |
| HTML | `https://build.nvidia.com/models?filters=nimType%3Anim_type_preview` | 免费端点 HTML 解析 |
| HTML | `https://docs.api.nvidia.com/nim/reference/llm-apis` | 能力分类文档 |

## 筛选逻辑

### 1. 免费模型判断

从 `build.nvidia.com` HTML 页面解析免费模型列表：

```typescript
const FREE_ENDPOINT_URL = 'https://build.nvidia.com/models?filters=nimType%3Anim_type_preview';

// 正则提取模型路径
const regex = /href="\/([a-zA-Z0-9_-]+\/[a-zA-Z0-9_.-]+)"/g;
```

### 2. 能力分类解析

从 `docs.api.nvidia.com` 解析各模型的能力标签：

```typescript
// 能力映射
const CAPABILITY_MAP: Record<string, string[]> = {
  'chat completion': ['chat', 'text-generation'],
  'completion': ['text-generation'],
  'embedding': ['embeddings'],
  'rerank': ['rerank'],
  'image': ['vision'],
  'video': ['video-generation'],
  'speech': ['speech-synthesis', 'speech-recognition'],
  'protein': ['protein'],
  'molecule': ['molecule'],
  'dna': ['dna'],
  'weather': ['weather'],
  'route': ['optimization'],
  'detection': ['moderation'],
  'safety': ['moderation'],
  'guardrails': ['moderation'],
};
```

### 3. 启发式能力推断

当文档解析失败时，使用模型名称推断：

```typescript
function inferCapabilities(modelId: string): string[] {
  const id = modelId.toLowerCase();
  const caps: string[] = [];

  if (id.includes('embed') || id.includes('rerank')) caps.push('embeddings');
  if (id.includes('vision') || id.includes('vl')) caps.push('vision');
  if (id.includes('safety') || id.includes('guard')) caps.push('moderation');
  if (id.includes('cosmos') || id.includes('video')) caps.push('video-generation');
  if (id.includes('esm') || id.includes('protein')) caps.push('protein');
  if (!caps.length) caps.push('chat', 'text-generation');

  return caps;
}
```

### 4. 重试机制

```typescript
async function fetchWithRetry(url: string, retries = 2, delayMs = 1000): Promise<string | null> {
  for (let i = 0; i <= retries; i++) {
    try {
      const response = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
      if (response.ok) return await response.text();
    } catch (err) { /* retry */ }
    if (i < retries) await new Promise(resolve => setTimeout(resolve, delayMs * (i + 1)));
  }
  return null;
}
```

## 模型统计

| 分类 | 数量 |
|------|------|
| 总模型数 | 139 |
| 免费端点 | 50 |
| 能力从文档解析 | 149 |

## 特殊字段说明

| 字段 | 类型 | 说明 |
|------|------|------|
| `isFree` | boolean | 是否在免费端点列表中 |
| `metadata.is_free_endpoint` | boolean | NVIDIA 免费端点标记 |
| `metadata.source` | string | 数据来源（API/HTML） |

## 关键代码

```typescript
// 文件：scripts/hub/providers/nvidia/index.ts

// 并行获取：API + 免费端点 + 能力文档
const [modelsResponse, freeModelIds, nvidiaCaps] = await Promise.all([
  fetch('https://integrate.api.nvidia.com/v1/models'),
  fetchFreeModelIds(),      // HTML 解析
  fetchNvidiaCapabilities(), // 文档解析
]);

// 能力合并：文档优先，启发式 fallback
const docCaps = nvidiaCaps.get(modelId);
const capabilities = docCaps?.length ? docCaps : inferredCaps;
```

## Provider 配置

```typescript
export const PROVIDER_META: Record<string, ProviderMeta> = {
  nvidia: {
    name: 'nvidia',
    displayName: 'NVIDIA AI',
    website: 'https://developer.nvidia.com/ai',
  },
};
```
