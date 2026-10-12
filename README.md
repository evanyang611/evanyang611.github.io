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

首页固定三个主题、四个作品，每张卡片都使用完整居中的真实截图和全宽灰底：

| 四种语言页面共用的主题标题 | 作品 |
| --- | --- |
| AI for Investors | LogicDuo、ForeArena |
| AI for Developers | 奇妙生产力 / Qimiao Productivity |
| AI for ACGers | Genchi.news |

主题标题保留英文，主题简介及详情随页面语言切换。首页仅展示简短说明；背景、功能、技术思路及外部链接位于详情浮窗。ForeArena 详情说明当前线上服务使用 COUNCIA 名称，中文链接指向 `/zh`，英文及日文指向 `/en`。AllFeeds 和此前探索的其他项目不在本次首页范围。

## 内容与语言

- 项目 ID、图片尺寸和外部地址：`src/content/projects.ts`。
- 四种语言的界面、背景、功能及技术思路：`src/i18n/messages/`。
- 中文首页 `/`；繁体 `/zh-TW/`；英文 `/en/`；日文 `/ja/`。`/zh-CN/` 和 `/portfolio/` 兼容既有入口，canonical 指向 `/`。
- 每种语言生成独立 HTML、正确的 `html lang`、标题、描述和 hreflang。根入口依次采用有效的 `?lang=`、已保存的手动选择、浏览器语言偏好；无法匹配时默认简体中文。繁体地区及 `zh-Hant` 使用繁体；英文和日语地区变体使用对应语言。指定语言路径直接呈现对应内容。
- 产品截图与字体均为本地资产，来源及字体许可证位于 `public/images/` 和 `public/fonts/`。ForeArena 与 Qimiao 的封面来自真实公开页面，Qimiao 账户栏已排除。当前新增主题文字使用同字体的 SC/TC/JP 补充子集；每种语言现有 62 条非空文案。
- 导航和浏览器图标使用提供的星芒环轨 Logo 的透明底黑白灰版本。高清原图、网页尺寸和编辑提示词位于 `public/brand/`。

## 当前验收

`.impeccable/review/themes/finish-review.md` 对提供的本地证据给出 SHIP；记录覆盖简中桌面/移动全页、其他语言首屏、320px 窄屏、850px 双行导航、用户实际 388 × 853 视口，以及 ForeArena/Qimiao 移动详情。四个简中详情的滚动锁定、关闭与焦点返回已记录；其他语言详情为源代码审阅。

`validation.json` 记录 lint、四语言 62 条文案、四项语言解析测试、TypeScript/Next 构建、静态导出、字体覆盖、7 张上线图片的嵌入来源信息完整性及外部链接 200。文档同步未重新运行这些检查。历史 `plates` 与像素差异 `drift` 记录仍保留，当前 SHIP 不代表像素完全一致或生产验收。源码平滑滚动已在截图采集后恢复。

## 发布归属

这个目录是独立的 `personal-portfolio` Git 项目。GitHub 仓库仍使用用户站点所需的 `evanyang611/evanyang611.github.io`，其首页直接展示作品集。

推送到该仓库的 `main` 后，`.github/workflows/deploy-pages.yml` 的 GitHub Actions 检查文案、代码和导出文件，再发布 GitHub Pages。输出目录为 `out/`，没有运行时 API、文章资产或对原项目目录的依赖。

原 `personal-site` 使用独立的 Gitee 仓库 <https://gitee.com/yqh611/personal-site>，现有站点 <https://evanyang.site/> 保留个人主页、博客和兴趣内容。


本次三个主题、四个作品的改动在文档交接时尚未发布；此前的口号版本 `9431bc8` 已上线。发布负责人需提交并推送新版本，随后检查根页面及四语言路由、主题与作品数量、图片/字体、语言选择、Gmail、详情浮窗及 COUNCIA 对应语言链接。构建通过和本地 SHIP 与线上验收分别记录。
