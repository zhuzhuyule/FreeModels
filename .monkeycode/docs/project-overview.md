# Model Hub 项目文档

## 项目概述

构建一个多供应商 AI 模型聚合中心，采用 OpenAI 兼容格式（object: list, data[]）作为唯一数据源，支持前端运行时过滤和多种视图切换。

## 核心需求

1. **多供应商插件化架构**：新 Provider 只需在 `scripts/hub/providers/` 目录下创建目录文件，即可被自动发现
2. **OpenAI 兼容格式**：统一数据结构，便于前端处理和扩展
3. **模型免费层分级**：区分"完全免费"和"允许体验"两种免费模式
4. **前端多视图展示**：支持按供应商、能力、免费层级等多种维度过滤

## 技术架构

### 数据流

```
Provider API/HTML
       ↓
  scripts/hub/providers/{provider}/index.ts
       ↓
  scripts/hub/aggregator.ts (聚合入口)
       ↓
  data/models.json (唯一数据源)
       ↓
  website/dev.html (前端视图)
```

### 数据文件

- `data/models.json`：聚合后的 OpenAI 兼容格式数据
- `data/capability-cache.json`：模型能力缓存

### Provider 列表

| Provider | 模型数 | 数据来源 | 免费端点 | 详细文档 |
|----------|--------|----------|----------|----------|
| Gitee | 201 | ai.gitee.com API | 44 完全免费 + 144 体验 | [providers/gitee.md](./providers/gitee.md) |
| BigModel | 83 | open.bigmodel.cn API | 7 个免费 | [providers/bigmodel.md](./providers/bigmodel.md) |
| Cerebras | 4 | inference-docs.cerebras.ai | 2 个免费 | [providers/cerebras.md](./providers/cerebras.md) |
| Groq | 12 | groq.com/pricing | 0 | [providers/groq.md](./providers/groq.md) |
| LongCat | 7 | longcat.chat/platform/docs | 全部免费 | [providers/longcat.md](./providers/longcat.md) |
| NVIDIA | 139 | api.nvidia.com + HTML | 50 个 | [providers/nvidia.md](./providers/nvidia.md) |
| Xunfei | 64 | maas.xfyun.cn | 0 | [providers/xunfei.md](./providers/xunfei.md) |
| Google | 32 | ai.google.dev/pricing | 17 个免费 | [providers/google.md](./providers/google.md) |
| OpenRouter | 56 | openrouter.ai API | 56 个免费 | [providers/openrouter.md](./providers/openrouter.md) |
| **总计** | **599** | | | |

## 字段设计

### 核心字段

| 字段 | 类型 | 说明 |
|------|------|------|
| id | string | 模型完整 ID（provider/model-id） |
| provider | string | 供应商名称 |
| name | string | 模型显示名称 |
| description | string | 模型描述 |
| context_size | number | 上下文长度（Token） |
| context_label | string | 上下文标签（人类可读） |
| capabilities | string[] | 能力标签数组 |

### 计费相关字段

| 字段 | 类型 | 说明 |
|------|------|------|
| price_input | number | 输入价格（$/1M tokens） |
| price_output | number | 输出价格（$/1M tokens） |
| is_free | boolean | 是否完全免费 |
| is_experienceable | boolean | 是否允许体验（Gitee 特有） |
| billing_mode | 'free' \| 'pay' \| 'mixed' | 计费模式 |
| free_tier | 'none' \| 'trial' \| 'full' | 免费层级 |

### 能力相关字段

| 字段 | 类型 | 说明 |
|------|------|------|
| is_reasoning | boolean | 是否支持推理 |
| is_multimodal | boolean | 是否支持多模态 |
| has_tool_use | boolean | 是否支持工具调用 |
| tags | string[] | 标签数组 |

### 分级字段

| 字段 | 类型 | 说明 |
|------|------|------|
| tier | 'small' \| 'medium' \| 'large' \| 'xlarge' | 模型规模 |
| speed | 'fast' \| 'standard' \| 'premium' | 速度等级 |
| performance_level | 'entry' \| 'mid' \| 'high' \| 'enterprise' | 性能等级 |
| use_case | string[] | 使用场景 |

## 能力标签（capabilities）

标准能力标签：

- `chat` - 对话
- `text-generation` - 文本生成
- `embeddings` - 向量表示
- `vision` - 视觉理解
- `image-generation` - 图片生成
- `video-generation` - 视频生成
- `speech-synthesis` - 语音合成
- `speech-recognition` - 语音识别
- `code-generation` - 代码生成
- `moderation` - 内容审核
- `rerank` - 重排序
- `reasoning` - 推理
- `agentic` - Agent 能力

## Gitee 免费模型分级

Gitee API 返回的 `free_use=true` 字段需要进一步区分：

### 判断逻辑

```
if (free_use === true && hasPrice === false) {
  is_free = true;           // 完全免费
  is_experienceable = false;
} else if (free_use === true && hasPrice === true) {
  is_free = false;         // 收费模型
  is_experienceable = true; // 但允许体验
} else {
  is_free = false;         // 纯收费
  is_experienceable = false;
}
```

### 实际分布

| 分类 | is_free | is_experienceable | 数量 |
|------|---------|-------------------|------|
| 完全免费 | true | false | 44 |
| 允许体验 | false | true | 144 |
| 收费 | false | false | 13 |
| **合计** | | | **201** |

## Provider 实现要求

### 文件结构

```
scripts/hub/providers/{provider}/
└── index.ts
```

### 导出格式

```typescript
import type { RawModelData, ProviderPlugin } from '../../types.js';

async function fetchXxxModels(): Promise<RawModelData[]> {
  // 实现获取逻辑
  return models;
}

export const fetchModels: ProviderPlugin = fetchXxxModels;
```

### RawModelData 接口

```typescript
interface RawModelData {
  vendor: string;
  modelId: string;
  name: string;
  description?: string;
  contextSize?: number;
  priceInput?: number;
  priceOutput?: number;
  isFree?: boolean;
  isExperienceable?: boolean;
  capabilities?: string[];
  metadata?: Record<string, unknown>;
}
```

## 前端页面

### 入口页面 (index.html)

静态入口页面，展示各视图入口链接：
- 开发视图
- 完全免费模型
- 允许体验模型
- 推理模型
- 全部模型

### 开发视图 (website/dev.html)

支持多条件过滤和排序的表格视图：

**支持筛选条件**：
- 搜索（名称、描述）
- 供应商
- 模型规模
- 速度等级
- 计费模式
- 免费层级
- 能力类型
- 推理模型
- 工具调用

**URL 参数**：
- `view=all` - 全部模型
- `view=free-full` - 完全免费
- `view=experienceable` - 允许体验
- `view=reasoning` - 推理模型
- `view=multimodal` - 多模态
- `view=tool-use` - 工具调用

## 统计计算方法

### 模型数量统计

模型数量通过 `npm run sync-models` 命令聚合后，通过以下方式计算：

```bash
# 运行同步
npm run sync-models

# 统计数据（从 data/models.json 读取）
python3 -c "
import json
with open('data/models.json') as f:
    data = json.load(f)
print(f'Total: {data[\"total\"]}')
print(f'Providers: {len(data[\"providers\"])}')
"
```

### 免费模型判断规则

| 字段 | 判断逻辑 | Provider |
|------|----------|----------|
| `is_free = true` | 价格为零或标记为"免费" | 所有 Provider |
| `is_experienceable = true` | 有价格但允许体验（Gitee 特有） | 仅 Gitee |

### Provider 模型数量

```
总模型数 = sum(各 Provider 模型数)
免费模型 = sum(各 Provider is_free=true 的模型数)
体验模型 = Gitee 中 is_experienceable=true 的模型数
```

### 实时统计查询

```bash
# 统计各 Provider 模型数量
python3 -c "
import json
from collections import Counter
with open('data/models.json') as f:
    data = json.load(f)
counts = Counter(m.get('provider') for m in data['data'])
for p, c in sorted(counts.items()):
    print(f'{p}: {c}')
"

# 统计免费模型
python3 -c "
import json
with open('data/models.json') as f:
    data = json.load(f)
free = [m for m in data['data'] if m.get('is_free')]
exp = [m for m in data['data'] if m.get('is_experienceable')]
print(f'Free: {len(free)}, Experienceable: {len(exp)}')
"
```

## 运行命令

```bash
# 聚合所有 Provider 数据
npm run sync-models

# 类型检查
npm run typecheck
```

## 启动服务

```bash
# 从项目根目录启动（必须！）
cd /workspace
python3 -m http.server 8000

# 访问地址
# 主页: http://localhost:8000/
# 开发视图: http://localhost:8000/website/dev.html
```

### Provider 详细文档

每个 Provider 的详细实现信息、数据来源、筛选逻辑请参考：

- [Provider 文档索引](./providers/README.md)

## 相关文件

- `scripts/hub/aggregator.ts` - 聚合入口
- `scripts/hub/types.ts` - 类型定义
- `scripts/hub/evaluator.ts` - 模型增强逻辑
- `scripts/hub/providers/gitee/index.ts` - Gitee Provider
- `scripts/hub/providers/bigmodel/index.ts` - BigModel Provider
- `scripts/hub/providers/cerebras/index.ts` - Cerebras Provider
- `scripts/hub/providers/groq/index.ts` - Groq Provider
- `scripts/hub/providers/longcat/index.ts` - LongCat Provider
- `scripts/hub/providers/nvidia/index.ts` - NVIDIA Provider
- `scripts/hub/providers/google/index.ts` - Google Provider
- `scripts/hub/providers/xunfei/index.ts` - Xunfei Provider
- `scripts/hub/providers/openrouter/index.ts` - OpenRouter Provider
- `website/dev.html` - 开发视图页面
- `website/app.js` - 简单视图应用
- `data/models.json` - 聚合数据文件

## 更新日志

### 2026-04-29

1. **新增 BigModel Provider**
   - 7 个免费模型（GLM-4-Flash, GLM-Z1-Flash, GLM-4V-Flash 等）
   - API: https://open.bigmodel.cn/api/biz/operation/query
   - 定价 API 无需认证，可直接获取

2. **新增 OpenRouter Provider**
   - 56 个免费模型，汇聚 NVIDIA、Poolside、Google 等多个提供商的免费模型
   - 使用 `max_price=0` 筛选完全免费模型

3. **添加 is_experienceable 字段**
   - 区分"完全免费"和"允许体验"两种模式
   - Gitee 144 个模型标记为 `is_experienceable=true`

4. **新增 Provider**
   - Groq: 12 个模型，高速 LPU
   - Cerebras: 4 个模型，千亿参数大模型
   - LongCat: 7 个模型，每日免费额度

5. **Provider 数据源优化**
   - Google: 从 HTML 解析改为定价文档解析，模型数 8→32
   - NVIDIA: 添加 fetchWithRetry 重试机制，解析 docs.api.nvidia.com 获取准确能力
   - Xunfei: 改用 MaaS API（maas.xfyun.cn）

5. **文档整理**
   - 添加 `docs/providers/` 目录，每个 Provider 独立文档
   - 记录数据来源、筛选逻辑、模型列表
