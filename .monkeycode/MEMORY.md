# 用户指令记忆

本文件记录了用户的指令、偏好和教导，用于在未来的交互中提供参考。

## 格式

### 用户指令条目
用户指令条目应遵循以下格式：

[用户指令摘要]
- Date: [YYYY-MM-DD]
- Context: [提及的场景或时间]
- Instructions:
  - [用户教导或指示的内容，逐行描述]

### 项目知识条目
Agent 在任务执行过程中发现的条目应遵循以下格式：

[项目知识摘要]
- Date: [YYYY-MM-DD]
- Context: Agent 在执行 [具体任务描述] 时发现
- Category: [代码结构|代码模式|代码生成|构建方法|测试方法|依赖关系|环境配置]
- Instructions:
  - [具体的知识点，逐行描述]

## 去重策略
- 添加新条目前，检查是否存在相似或相同的指令
- 若发现重复，跳过新条目或与已有条目合并
- 合并时，更新上下文或日期信息
- 这有助于避免冗余条目，保持记忆文件整洁

## 条目

[Model Hub 项目架构]
- Date: 2026-04-29
- Context: 用户描述 Model Hub 项目需求时
- Category: 代码结构
- Instructions:
  - OpenAI 兼容格式作为主结构（object: list, data[]）
  - Provider 插件化：新 Provider 只需创建目录文件，自动被发现
  - 单一数据源：data/models.json 是唯一输出
  - 前端运行时过滤：通过 URL 参数（?view=free-full）前端过滤
  - 字段命名：snake_case（billing_mode, free_tier, is_reasoning）

[Gitee 免费模型分级逻辑]
- Date: 2026-04-29
- Context: 用户解释 Gitee 127 个"免费"模型的特殊性
- Category: 业务逻辑
- Instructions:
  - Gitee 44 个完全免费模型（is_free=true, 无价格）
  - Gitee 144 个允许体验模型（is_experienceable=true, 有价格但允许体验）
  - 其他 Provider 只有 is_free 区分，不存在 is_experienceable
  - 收费模式只有两种：免费和收费，没有第三种

[Python 静态服务器启动位置]
- Date: 2026-04-29
- Context: 用户反馈页面 404，修复服务器配置
- Category: 环境配置
- Instructions:
  - 静态服务器必须从项目根目录（/workspace）启动
  - 执行：cd /workspace && python3 -m http.server 8000
  - 不能从 website/ 子目录启动，否则 data/ 目录无法访问
  - HTML 文件中的相对路径需要考虑访问路径（/website/dev.html vs /dev.html）

[NVIDIA Provider 数据来源]
- Date: 2026-04-29
- Context: 实现 NVIDIA Provider 时
- Category: 依赖关系
- Instructions:
  - NVIDIA 免费端点：解析 build.nvidia.com HTML 获取
  - NVIDIA 能力分析：解析 docs.api.nvidia.com 获取准确分类
  - API 端点：integrate.api.nvidia.com/v1/models
  - 添加 fetchWithRetry 重试机制处理网络波动

[Google Provider 实现]
- Date: 2026-04-29
- Context: Google API 403 Forbidden，切换到 HTML 解析
- Category: 代码模式
- Instructions:
  - Google Generative Language API 需要认证，返回 403
  - 改用解析 ai.google.dev/models HTML 页面获取模型列表
  - 正则表达式：/models\/(gemini-[\w-]+)/g 从页面提取模型 ID

[Google Provider 实现]
- Date: 2026-04-29
- Context: 更新 Google Provider 从定价文档获取完整模型信息
- Category: 代码模式
- Instructions:
  - 定价文档：https://ai.google.dev/gemini-api/docs/pricing.md.txt?hl=zh-cn
  - 模型数量从 8 个增加到 32 个（包含 LLM、图像、视频、音频、嵌入、机器人等）
  - 免费模型：17 个（Flash 系列、Embedding 等）
  - 模型分类：LLM(12), Image(6), Audio(6), Video(4), Embedding(2), Robotics(2)

[LongCat Provider 实现]
- Date: 2026-04-29
- Context: 添加 LongCat 作为新的 Provider
- Category: 代码模式
- Instructions:
  - 文档页面：https://longcat.chat/platform/docs/zh/
  - API 端点：https://api.longcat.chat/openai 和 https://api.longcat.chat/anthropic
  - 全部 7 个模型都有免费额度（500K-50M tokens/天）
  - 模型：Flash Chat, Flash Thinking, Flash Thinking 2601, Flash Lite, Flash Omni, Flash Chat Exp, 2.0 Preview
  - Provider 文件：scripts/hub/providers/longcat/index.ts

[Cerebras Provider 实现]
- Date: 2026-04-29
- Context: 添加 Cerebras 作为新的 Provider
- Category: 代码模式
- Instructions:
  - API 端点：https://api.cerebras.ai/v1/chat/completions
  - 文档页面：https://inference-docs.cerebras.ai/models/overview
  - 模型列表：llama3.1-8b (8B, 免费), gpt-oss-120b (120B, 免费), qwen-3-235b-a22b-instruct-2507 (235B, Preview), zai-glm-4.7 (355B, Preview)
  - Provider 文件：scripts/hub/providers/cerebras/index.ts

[Groq Provider 实现]
- Date: 2026-04-29
- Context: 添加 Groq 作为新的 Provider
- Category: 代码模式
- Instructions:
  - Groq API 需要认证（返回 403），改用解析 groq.com/pricing 页面
  - 从定价页面提取模型：名称、价格、速度、上下文长度
  - 模型数据硬编码在 provider 中（MODEL_DATA）
  - 模型类型：LLM（TTS、ASR、Chat）、企业独有模型
  - Provider 文件：scripts/hub/providers/groq/index.ts
- Date: 2026-04-29
- Context: Xunfei API 404，从用户提供 HTML 源码找到正确端点
- Category: 代码模式
- Instructions:
  - API 端点：https://maas.xfyun.cn/api/v1/gpt-finetune/model/base/list-v2
  - 能力字段映射：function 字段（4=OCR, 8=Embedding, 12=多模态, 15=深度推理）
  - contextLengthTag 从 categoryTree 中提取
  - 价格从 price.inferencePrice 提取（inTokensPrice/outTokensPrice）

[OpenRouter Provider 实现]
- Date: 2026-04-29
- Context: 添加 OpenRouter 作为新的 Provider
- Category: 代码模式
- Instructions:
  - API 端点：https://openrouter.ai/api/frontend/models/find?fmt=cards&max_price=0
  - 使用 max_price=0 筛选完全免费的模型
  - 返回 56 个免费模型（汇聚 NVIDIA、Poolside、Google 等提供商）
  - 模型 ID 格式：openrouter/{author}/{slug}
  - 支持的模态：text, image, audio, video
  - metadata 包含：author, author_display_name, input_modalities, output_modalities, supports_reasoning, reasoning_config, group
  - Provider 文件：scripts/hub/providers/openrouter/index.ts
  - 元数据配置：scripts/hub/evaluator.ts 的 PROVIDER_META

[Model Hub 项目当前状态]
- Date: 2026-04-29
- Context: 项目整理
- Category: 代码结构
- Instructions:
  - Provider 数量：8 个（Gitee, NVIDIA, Google, Xunfei, Groq, Cerebras, LongCat, OpenRouter）
  - 总模型数：516 个
  - 免费模型：161 个（Gitee 44 + NVIDIA 50 + Google 17 + Cerebras 2 + LongCat 7 + OpenRouter 56）
  - 允许体验：144 个（Gitee 特有）
  - 运行命令：npm run sync-models（聚合数据）
  - 类型检查：npm run typecheck
  - 数据文件：data/models.json（唯一数据源）
  - 文档目录：.monkeycode/docs/
