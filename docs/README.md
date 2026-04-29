# Model Hub 文档

技术文档目录。普通使用者请看 [项目根 README](../README.md)。

## 内容索引

| 文档 | 说明 |
|------|------|
| [providers/README.md](./providers/README.md) | Provider 数据源、认证、字段映射、免费策略 |
| [architecture.md](./architecture.md) | 数据流、缓存策略、聚合管线 |
| [fields.md](./fields.md) | 输出字段定义、taxonomy、family 规范化 |
| [conventions.md](./conventions.md) | 代码约定（价格单位、字段命名、缓存写盘） |
| [llm-and-notify.md](./llm-and-notify.md) | GitHub Models 接入与企业微信通知 |
| [deployment.md](./deployment.md) | CI workflows、GitHub Pages、域名/CDN |
| [adding-provider.md](./adding-provider.md) | 新增 provider 的步骤与模板 |

## 给 AI Agent 的指引

- **Claude Code**：根目录 [`CLAUDE.md`](../CLAUDE.md) 是精简上下文
- **Monkeycode 等其他 agent**：[`.monkeycode/`](../.monkeycode) 保留了开发期累积的笔记

两套文档可以并存。本目录是当前权威，monkeycode 是历史轨迹。
