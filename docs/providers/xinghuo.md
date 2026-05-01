# iFlytek Spark / 讯飞星火

> 本文档由 `npm run generate-docs` 根据 `data/models.json` 自动生成。

## 接入信息

| 项目 | 内容 |
|---|---|
| 内部 Provider ID | `xinghuo` |
| 官网 | [https://xinghuo.xfyun.cn](https://xinghuo.xfyun.cn) |
| 注册/登录 | [https://xinghuo.xfyun.cn](https://xinghuo.xfyun.cn) |
| 控制台 | [https://console.xfyun.cn/services/cbm](https://console.xfyun.cn/services/cbm) |
| API Key | [https://console.xfyun.cn/services/cbm](https://console.xfyun.cn/services/cbm) |
| 官方文档 | [https://www.xfyun.cn/doc/spark](https://www.xfyun.cn/doc/spark) |
| 模型/价格 | [https://www.xfyun.cn/doc/spark/HTTP%E8%B0%83%E7%94%A8%E6%96%87%E6%A1%A3.html](https://www.xfyun.cn/doc/spark/HTTP%E8%B0%83%E7%94%A8%E6%96%87%E6%A1%A3.html) |
| API Base URL | `https://spark-api-open.xf-yun.com/v1` |
| 鉴权方式 | bearer |
| 环境变量 | `XFYUN_API_KEY` |

## 当前统计

| 指标 | 数量 |
|---|---:|
| 总模型 | 6 |
| 免费模型 | 1 |
| 付费可试用 | 0 |

## 免费策略

Spark Lite 永久免费但限速（5 并发）；其他 Spark 系列按 token 计费。

## 当前免费模型

| Provider | Model ID | 名称 | 上下文 | 免费类型 | 限制 |
|---|---|---|---:|---|---|
| xinghuo  | `xinghuo/lite` | Spark Lite | 4K | 限速免费 | 5 并发上限 |
