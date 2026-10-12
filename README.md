# personal-portfolio

Evan Yang 的独立职业作品集，发布目标为 https://evanyang611.github.io/。保留 Pearl 风格的居中限宽、灰底完整截图和简短项目介绍，点击作品打开原生详情浮窗。

内容包含作品、个人介绍及联系入口，支持简体中文、繁體中文、English 和日本語。文章及兴趣内容继续属于独立的 `personal-site` 项目。

## 本地开发

```bash
npm ci
npm run dev       # http://localhost:8071/
```

## 检查和预览

```bash
npm run lint
npm run i18n:check
npm run test:locale
npm run build
npm run check:export
npm run preview   # http://localhost:8071/
```

## 作品范围

首页固定三个主题、四个作品，每张卡片都使用完整居中的真实截图和普通灰底画布：

| 四种语言页面共用的主题标题 | 作品 |
| --- | --- |
| AI for Investors | LogicDuo、ForeArena |
| AI for Developers | 奇妙生产力 / Qimiao Productivity |
| AI for ACGers | Genchi.news |

主题标题保留英文，主题简介及详情随页面语言切换。大于 700px 时每行两个作品：第一行由 Investors 的 LogicDuo 和 ForeArena 组成；第二行由 Developers/Qimiao 与 ACGers/Genchi 组成，保留各自标题与简介。第二行使用共享 subgrid 标题轨道，使不同语言简介换行后封面仍对齐。每个作品占一列，画布宽高比为 1.3；700px 及以下按主题顺序单列展示，画布宽高比为 1.45。

首页仅展示简短说明；背景、功能、技术思路及外部链接位于详情浮窗。ForeArena 是 <https://forearena.com/> 的多 Agent 定时投资研究产品：选择标的与研究计划，对照市场主线、近期变化、未来情景和 Agent 判断，通过账户、邮件或只读 API 接收简报。链接由项目注册表地址生成，中文指向 <https://forearena.com/zh>，英文及日文指向 <https://forearena.com/en>。公开示例面板仅用于展示产品，不作为投资收益证明。此前审阅记录中的其他产品映射与全宽卡片排列已经被本轮修正取代。AllFeeds 和此前探索的其他项目不在本次首页范围。

## 内容与语言

- 项目 ID、图片尺寸和外部地址：`src/content/projects.ts`。
- 四种语言的界面、背景、功能及技术思路：`src/i18n/messages/`。
- 中文首页 `/`；繁体 `/zh-TW/`；英文 `/en/`；日文 `/ja/`。`/zh-CN/` 和 `/portfolio/` 兼容既有入口，canonical 指向 `/`。
- 每种语言生成独立 HTML、正确的 `html lang`、标题、描述和 hreflang。根入口依次采用有效的 `?lang=`、已保存的手动选择、浏览器语言偏好；无法匹配时默认简体中文。繁体地区及 `zh-Hant` 使用繁体；英文和日语地区变体使用对应语言。指定语言路径直接呈现对应内容。
- 产品截图与字体均为本地资产，来源及字体许可证位于 `public/images/` 和 `public/fonts/`。ForeArena 封面 `/images/forearena-investor-cover.jpg` 为 1280 × 720 的真实公开中文页面截图，独立文件名避免沿用旧封面的浏览器缓存；Qimiao 账户栏已排除。当前主题及口号补充字体保留，修正的 ForeArena 文案在同一字体家族新增 SC/TC/JP 子集，分别覆盖 12/14/18 个字形；每种语言仍有 62 条非空文案。
- 导航和浏览器图标使用提供的星芒环轨 Logo 的透明底黑白灰版本。高清原图、网页尺寸和编辑提示词位于 `public/brand/`。

## 当前验收

`.impeccable/review/paired/finish-review.md` 对提供的本地修正给出 SHIP，无实质问题。审阅者打开并核对了全部 8 张截图尺寸：1440px/390px 简中全页，850px 英文、日文、繁体作品区，390px 简中/日文 ForeArena 详情开头，以及实际 735 × 853 用户宽度的作品区。850px 作品区截图只覆盖第二行标题及封面上部；`user-preview.jpg` 是联系区截图，已排除。

`browser-checks.json` 记录各语言成对排列及无横向溢出；`forearena-links.json` 中其他三种语言的链接检查为 1280px 桌面记录，日文详情截图另为 390px。构建者报告 lint、四语言 62 条文案、语言解析测试、TypeScript/Next 构建、静态导出、正确 ForeArena 注册表与文案保护检查、当前非 ASCII 字体覆盖、7 张上线图片的嵌入来源信息完整性均通过。文档同步没有重跑这些检查或提供的空检测结果 `[]`。历史 `plates` 与像素差异 `drift` 记录仍保留，当前 SHIP 不代表像素完全一致或生产验收。源码平滑滚动已在截图采集后恢复。

本轮独立审阅未覆盖动态效果、新一轮键盘/读屏会话、全部非简中页面下部与详情滚动状态、实体设备、其他浏览器内核、产品当前线上行为或投资结果，以及本轮生产发布。

## 发布归属

这个目录是独立的 `personal-portfolio` Git 项目。GitHub 仓库仍使用用户站点所需的 `evanyang611/evanyang611.github.io`，其首页直接展示作品集。

推送到该仓库的 `main` 后，`.github/workflows/deploy-pages.yml` 的 GitHub Actions 检查文案、代码和导出文件，再发布 GitHub Pages。输出目录为 `out/`，没有运行时 API、文章资产或对原项目目录的依赖。

原 `personal-site` 使用独立的 Gitee 仓库 <https://gitee.com/yqh611/personal-site>，现有站点 <https://evanyang.site/> 保留个人主页、博客和兴趣内容。


本次双列作品排列与 ForeArena 修正在文档交接时尚未发布；此前的 `9502f5b` 是最近上线版本。发布负责人需提交并推送新版本，随后检查根页面及四语言路由、成对主题与作品数量、图片/字体、语言选择、Gmail、详情浮窗及 ForeArena 对应语言链接。构建通过和本地 SHIP 与线上验收分别记录。
