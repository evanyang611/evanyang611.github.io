// Blog body template.
//
// Naming: kebab-case slug matching the id in blogs.ts
// Location: src/content/blogs/<slug>.ts
// Register: add BlogMeta entry to src/content/blogs.ts BLOGS array with matching loadBody import
//
// Markdown conventions used by BlogsPage renderer:
//
// - Headings: ## for top-level (## 1 xxx), ### for sub (### 1.1 xxx). Do NOT include a duplicate # top title — the modal renders post.title separately.
// - Tables: GFM pipe tables. Multi-line cells: use <br> for line breaks (rehype-raw enabled). Bullets in cells: prefix "• " manually.
// - Images:
//     ![alt](/blogs/<slug>/<uuid>.png?w=NNN)   → capped at NNN px (max 720)
//     ![alt](/blogs/<slug>/<uuid>.png?full=1)  → capped at 720 px
//     ![alt](/blogs/<slug>/<uuid>.png)         → default 480 px
//   Store images under public/blogs/<slug>/. All images are lazy-loaded (loading="lazy") — nothing fetches until the modal opens.
// - Code blocks: fenced ```lang ... ``` supported.
// - Links: [text](https://url) — external only, no internal wiki paths.
// - Do NOT paste internal-only content (company jargon, private links, PII). Trim before importing.

export const body = `## 1 章节标题

正文段落。行内 **加粗**、*斜体*、\`code\`、[链接](https://example.com)。

- 无序列表 A
- 无序列表 B

1. 有序列表 A
2. 有序列表 B

### 1.1 子标题

| 列头 A | 列头 B | 列头 C |
| --- | --- | --- |
| 单元格<br>换行 | • 项 1<br>• 项 2 | 值 |

![示意图](/blogs/example/xxx.png?w=480)

\`\`\`ts
export const body = "hello";
\`\`\`


## 2 下一章

引用示例：

> 引用行 1
> 引用行 2
`;
