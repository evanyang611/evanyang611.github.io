# Evan Yang · 个人主页

基于 Next.js 16 构建的全屏翻页式个人站点。

## 页面结构

| 页面 | 内容 |
|------|------|
| Hero | 头像 + 名称 |
| About | 自我介绍 |
| Work | 工作经历 |
| Blogs | 技术博客（Markdown 正文 + 语音对比） |
| Anime | 动漫推荐（Bangumi 数据驱动海报墙） |
| Games | 游戏推荐（同上） |
| Songs | 歌曲推荐（YouTube 播放） |
| Links | 联系方式、社交账号与访问统计 |

## 开发

```bash
npm install
npm run dev          # http://localhost:8070
```

## 数据更新

```bash
npm run fetch:anime  # 从 Bangumi 拉取动漫元数据 + 海报
npm run fetch:game   # 从 Bangumi 拉取游戏元数据 + 海报
```

配置文件：`src/content/anime-ids.json`、`src/content/game-ids.json`

## 构建 & 部署

### GitHub Pages

站点仓库：`evanyang611/evanyang611.github.io`，网站地址：<https://evanyang611.github.io/>。

```bash
npm run lint
npm run build:pages  # 导出 HTML/CSS/JS 与 public 资源到 out/
```

在 GitHub 仓库的 **Settings → Pages → Source** 中选择 **GitHub Actions**。
推送到该仓库的 `main` 分支后，`.github/workflows/deploy-pages.yml` 会自动检查、构建和发布。
本地保留 Gitee `origin` 与原 `main` 分支的完整历史。
由于旧历史包含超过 GitHub 单文件限制的运行时二进制，GitHub 从当前源码快照建立独立历史；
日常更新使用本地 `codex/github-pages` 分支，跟踪 GitHub 的 `main`：

```bash
git switch codex/github-pages
git push github HEAD:main
```

静态构建关闭服务端图片优化；本地海报、博客图片和 WAV 音频一起发布。
歌曲播放器仍使用 YouTube，需要访客网络能够访问 YouTube。
该部署使用域名根路径；若改用项目子目录地址，需要额外适配资源路径。

### Node.js / Docker

默认构建保留 `standalone` 输出，继续支持现有服务器部署。

```bash
npm run build

# Docker Compose
docker compose build
docker compose up -d
```

## 技术栈

- Next.js 16 (App Router, Turbopack)
- React 19
- Tailwind CSS v4
- Framer Motion 12
- YouTube IFrame API（歌曲播放）
