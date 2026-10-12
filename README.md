# personal-portfolio

Evan Yang 的独立职业作品集。保留 Pearl 风格的居中限宽、灰底完整截图和简短项目介绍，点击作品打开详情浮窗。

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

## 内容与语言

- 项目 ID、图片尺寸和外部地址：`src/content/projects.ts`。
- 四种语言的界面、背景、功能及技术思路：`src/i18n/messages/`。
- 中文首页 `/`；繁体 `/zh-TW/`；英文 `/en/`；日文 `/ja/`。`/zh-CN/` 和 `/portfolio/` 兼容既有入口，canonical 指向 `/`。
- 每种语言生成独立 HTML、正确的 `html lang`、标题、描述和 hreflang。根入口依次采用有效的 `?lang=`、已保存的手动选择、浏览器语言偏好；无法匹配时默认简体中文。繁体地区及 `zh-Hant` 使用繁体；英文和日语地区变体使用对应语言。指定语言路径直接呈现对应内容。
- 产品截图与字体均为本地资产，来源及字体许可证位于 `public/images/` 和 `public/fonts/`。

## 发布归属

这个目录是独立的 `personal-portfolio` Git 项目。GitHub 仓库仍使用用户站点所需的 `evanyang611/evanyang611.github.io`，其首页直接展示作品集。

推送到该仓库的 `main` 后，GitHub Actions 检查文案、代码和导出文件，再发布 GitHub Pages。输出目录为 `out/`，没有运行时 API、文章资产或对原项目目录的依赖。

原 `personal-site` 使用独立的 Gitee 仓库 <https://gitee.com/yqh611/personal-site>，现有站点 <https://evanyang.site/> 保留个人主页、博客和兴趣内容。
