# 部署 & CI

## Workflows

| 文件 | 触发 | 作用 |
|------|------|------|
| `.github/workflows/daily-model-sync.yml` | cron `0 2 * * *`（每日 02:00 UTC） + 手动 | 全量同步 |
| `.github/workflows/sync-on-push.yml` | push 到 master 且涉及 `scripts/hub/**` | 代码改动触发同步 |
| `.github/workflows/sync-pages.yml` | push 到 master + 手动 | 复制 `master` 到 `gh-pages` 分支 |

## CI 权限

```yaml
permissions:
  contents: write    # bot commit 数据
  models: read       # 调用 GitHub Models
```

## CI Secrets

| Secret | 来源 | 用途 |
|--------|------|------|
| `GITHUB_TOKEN` | 自动注入 | git push + GitHub Models API |
| `WECHAT_QYAPI_ID` | 手动添加 | 企业微信 webhook key |

## Bot Commit 流程

1. workflow 跑 `npm run sync-models`
2. 数据有变化时 `stefanzweifel/git-auto-commit-action` 用 bot 身份 commit
3. 推回 master，触发 `sync-pages.yml`
4. master → gh-pages 分支
5. GitHub Pages 自动构建（`Deploy from branch (gh-pages)`）

**注意**：本地 push 前必须 `git pull --rebase`，否则会被 bot 提交挡住。data 文件冲突时 `git checkout --theirs data/*.json`。

## GitHub Pages 配置

- **Source**：Deploy from a branch
- **Branch**：`gh-pages` `/` (root)
- **不要**用 "GitHub Actions" 模式（之前踩过坑：自定义 deploy workflow 必须放在 master 才会触发）

## 域名 / CDN

```
github.io/FreeModels  ──301──►  ofind.cn/FreeModels  ──Cloudflare──►  Fastly  ──►  GitHub Pages
```

| 缓存层 | TTL | 清理方式 |
|--------|-----|----------|
| Fastly（GitHub Pages） | 600s | 等过期 |
| Cloudflare | DYNAMIC（不缓存）/ max-age=600 | dashboard → Caching → Purge |
| 浏览器 | max-age=600 | Cmd+Shift+R |

最长冷启动延迟：~10 分钟（Fastly TTL）。

## 部署后验证

```bash
# 检查最新构建时间
gh api repos/zhuzhuyule/FreeModels/pages/builds --jq '.[0]'

# 直连测试
curl -sI https://ofind.cn/FreeModels/data/models.json | grep -i last-modified
```
