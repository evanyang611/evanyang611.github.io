# personal-portfolio

Evan Yang 的独立作品集，发布目标为 https://evanyang611.github.io/。首页以 AI Agent、AIGC、About 三个模块组织内容，保留现有标题、自我介绍、联系区和 Pearl 风格的黑白灰、1120px 居中限宽及留白。支持简体中文、繁體中文、English 和日本語；三个导航标签在所有语言中固定为 `AI Agent / AIGC / About`，其他说明、详情、无障碍标签和元数据随语言切换。

## 本地开发与检查

```bash
npm ci
npm run dev       # http://localhost:8071/
npm run lint
npm run i18n:check
npm run test:locale
npm run build:pages
npm run check:export
npm run preview   # http://localhost:8071/
```

## 页面与内容

| 页面 | 简体中文 | 其他语言 |
| --- | --- | --- |
| 首页 | `/` | `/zh-TW/`、`/en/`、`/ja/` |
| AI Agent 完整作品 | `/ai-agent/` | `/{locale}/ai-agent/` |
| AIGC 展厅 | `/aigc/` | `/{locale}/aigc/` |

首页 AI Agent 和 AIGC 各有原生横向滚动预览及 `Enter` 入口。前者展示四个真实产品，后者展示 Blue Archive 合绘和 Sunna 暖光肖像两幅已批准图片。支持手动前后按钮、聚焦区域的左右键、触控和触控板原生滚动；两端禁用对应按钮，默认以 32px/s 缓慢往返自动滚动，端点停留 1 秒后反向。悬停在预览轨道内或轨道内有键盘焦点时会临时暂停；手动浏览后停止，需用继续按钮恢复。离开视野或切到后台停止，减少动态效果偏好下关闭自动滚动，保留即时手动浏览。首页导航对应 `#ai-agent`、`#aigc`、`#about`，兼容 `#work` 锚点。

原完整作品列表和原生详情浮窗移到 AI Agent 页面，保持三个英文主题：

| 主题 | 作品 |
| --- | --- |
| AI for Investors | LogicDuo、ForeArena |
| AI for Developers | 奇妙生产力 / Qimiao Productivity |
| AI for ACGers | Genchi.news |

完整作品页大于 700px 时每行两个作品，第二行 Developers/ACGers 通过共享 subgrid 标题轨道对齐封面；700px 及以下按主题单列。截图完整、原色、居中灰底，说明在图片外。首页预览进入对应主题；完整作品页卡片打开背景、功能、技术思路及外链浮窗。ForeArena 是 `forearena.com` 的定时多 Agent 投资研究产品，中文链接为 `/zh`，英文及日文为 `/en`；公开示例面板不构成投资收益证明。AllFeeds 不在当前四件作品范围。

AIGC 独立展厅继承同一系统。图片展区展示 Blue Archive 合绘（2720 × 1530）和 Sunna 暖光肖像（1728 × 2432），视频、音乐继续待展。高清原稿保留在 Git 忽略的 `aigc-inbox/`，发布的 WebP 合计 1,071,292 字节，转换未缩放或裁切。四语言标题/替代文本与素材来源见 `src/content/aigc.ts`、`public/aigc/sources.json`，添加方式见 [指南](docs/aigc-gallery.md)。竖图按视口限高且完整居中；桌面只有两幅预览时使用 58% 卡片宽度，保持自动滚动。

## 实现与语言

- 首页/预览：`src/components/portfolio/Portfolio.tsx`、`PreviewStrip.tsx`；完整产品/浮窗：`AgentProjects.tsx`；项目身份、主题、图片尺寸和外链：`src/content/projects.ts`。
- 共享导航、页脚和语言选择：`src/components/portfolio/SiteChrome.tsx`。详情页可在集合间跳转，About、联系、品牌与返回入口指向同语言首页。语言切换保留当前首页、AI Agent 或 AIGC 页面及锚点。
- 展厅：`src/components/gallery/`；作品注册表：`src/content/aigc.ts`。
- 每种语言当前有 92 条非空文案：`src/i18n/messages/`。路径/偏好：`src/i18n/config.ts`；三种页面元数据：`src/i18n/metadata.ts`。静态 HTML 各有正确 `html lang`、标题、描述、canonical 和 hreflang。指定语言路径优先；默认入口依次使用有效 `?lang=`、手动偏好、浏览器语言，最后回退简中。
- 截图、Logo、字体来源与许可证保留在 `public/images/`、`public/brand/`、`public/fonts/`。展厅与首页文字使用同族 SC/TC/JP 补充字体，来源见 `localized-sources.json`。

## 本次图片接入

当前本地验收材料位于 `.impeccable/review/aigc-intake/`：1440px 桌面、390px 手机和 320px 日文画廊没有页面溢出；两幅图片保持完整比例；四语言切换保留展区锚点；首页两图自动滚动、暂停、手动末端与 Enter 入口已检查。lint、92 条 UI 文案/语言检查、4 项偏好测试、18 页构建和带真实素材的导出检查通过。机械扫描为 0 项主要问题，5 项既有字号文档提示。实体手机、其他浏览器内核和未来音视频播放仍未验证。发布前线上基线为 `45b5d27`，本次发布以 GitHub Actions 与线上素材读回为准。

## 历史验收与发布记录

本轮证据位于 `.impeccable/review/index/`。独立审阅覆盖八张有效截图：桌面/移动首页、320px 日文首页、850px 英文首页、桌面/简中移动 AI Agent、移动展厅和音乐预览末端。音乐图为 390 × 844 中部视口，不是全页。视觉范围符合既有系统；初审要求同步过期文档，最终 disposition 以 `finish-review.md` 为准。

`browser-checks.json` 记录 1440/390/320/850px 无页面溢出、末端按钮禁用、左右键、两个 Enter、四产品三主题、ForeArena 浮窗 Escape 与焦点恢复、集合语言切换，以及空注册表/三个预览/三个空房间/零音视频元素。构建者报告 lint、每语言 89 条文案、4 项语言测试、Next/TypeScript 构建（18 个页面）、四语言静态导出和 `git diff --check` 通过。检测有 11 项字体阶梯文档提示，0 项主要问题。本次文档同步未重跑浏览器或检测；真实 AIGC 素材及播放、实体手机和其他浏览器内核仍未验证。

历史 `.impeccable/review/paired/`、`plates` 与 `drift` 记录保留；本地审阅不证明本轮已经上线。本项目推送 GitHub 用户站仓库 `evanyang611/evanyang611.github.io` 的 `main` 后，由 `.github/workflows/deploy-pages.yml` 检查并发布 `out/`。本次文档交接时已验收线上基线为 `9a3faec`（GitHub Actions `38254765284` 成功）；新首页与集合页面等待提交、推送和生产验收。发布后需读取线上版本，检查四语言首页/集合、入口锚点、字体、滚动控制、返回路径及项目浮窗。

原 `personal-site` 继续使用 [Gitee 仓库](https://gitee.com/yqh611/personal-site) 和 [evanyang.site](https://evanyang.site/)，保留博客及其他个人内容，页脚继续链接该站。

本次自动滚动更新的运行证据位于 `.impeccable/review/auto-scroll/`；新增暂停、继续和减少动态效果标签。原首页与集合发布版本为 `2930916`，本次更新另行发布验收。
