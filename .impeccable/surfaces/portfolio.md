# Professional portfolio

## Target

Independent project `personal-portfolio`: `src/app/(default)/page.tsx` at `/`, plus localized routes in `src/app/(localized)/[locale]/`.

## Mode

Experience: visitors inspect real products and engineering work, learn the professional background, and contact Evan.

## Pinned Direction

The user selected Pearl (https://pearl.framer.website/). Retain its white/black/gray editorial language, strong sans-serif typography, spacious navigation, and image-led case studies.

The user explicitly clarified the key image rule: every project image belongs on a uniform gray background and is centered inside that background. Use visibly generous margins, preserve the complete image and original colors, and place captions outside the gray cover. This applies to all three composition options and every eventual project thumbnail or case-study cover.

## Content

- Evan Yang; machine learning, AI Agent, and independent product development.
- LogicDuo: AI-assisted analysis for individual investors.
- AllFeeds: open-source distributed data collection, Controller/Worker architecture.
- Genchi.news: live-event information aggregation for Anisong and J-POP audiences.
- Professional background, supplied education, technical writing, and public email contact.

## Compositional Round

Three mockups share the pinned Pearl visual system and vary hierarchy only:

1. A — generous typographic opening followed by a full-width featured product.
2. B — professional introduction and featured project in an asymmetric first viewport.
3. C — compact introduction with a large project and two smaller project previews, putting the work first.

The user requested selecting a visual mockup before implementation. No composition is approved yet. The second revision of all three mockups applies the clarified gray-stage image system; the original versions remain as history.

Current mockups:

- `.impeccable/mocks/portfolio-pearl-a-v2.png`
- `.impeccable/mocks/portfolio-pearl-b-v2.png`
- `.impeccable/mocks/portfolio-pearl-c-v2.png`

Revision prompts and references are recorded in `.impeccable/mocks/portfolio-cover-revision-prompts.json`. Generated with the built-in ImageGen tool.

## Whitespace Revision

The user pointed out that the mockups remain crowded compared with Pearl. The prior first-viewport goal compressed three projects into one view and used heavy Chinese display type. Revise the closest-to-Pearl composition A as a desktop full-page study: spacious introduction first, featured work below the first viewport, lighter display type, wide gray image stages with smaller centered complete screenshots, captions below each stage, and generous separation between projects. This is a mockup revision, not a selected or approved implementation.

Latest whitespace study: `.impeccable/mocks/portfolio-pearl-a-v3.png`. Prompt and references: `.impeccable/mocks/portfolio-whitespace-revision-prompt.json`. It supersedes the compact A studies for spacing decisions. The earlier B/C layouts remain historical alternatives, not implementation authority.

## Claims and Implementation Boundaries

Do not invent employers, dates, scale, client endorsements, investment performance, or project results. Actual project UI imagery remains distinct from generated composition previews. Case studies, navigation, article reading, mobile behavior, accessibility, and deployment must be validated when the selected composition is implemented.

## Approved implementation

On 2026-10-12 the user explicitly requested formal implementation: “我们按照这个思路来正式制作portfolio吧”. The approved composition is `.impeccable/mocks/portfolio-pearl-a-v3.png`, with its sidecar marked approved. Earlier composition-selection notes above describe history.

Every homepage project has one gray-stage image and one brief introduction. Clicking opens a detailed floating dialog with project background, concrete capabilities, technical focus, and external project links. Support close button, Escape, backdrop click, contained scrolling, keyboard focus, and returning focus to the originating project. Mobile retains the same content and readable dialog layout.

## Direction contract

THESIS: Evan's professional work unfolds through a spacious introduction and real product covers; project detail appears only when opened.

OWN-WORLD: White, black, neutral gray, regular sans-serif type, quiet black pill actions, and uniform gray image stages with complete centered screenshots.

STORY: Visitors understand Evan's focus, inspect LogicDuo, AllFeeds and Genchi, read his technical work, and contact him or visit a project.

FIRST VIEWPORT: Compact horizontal navigation; spacious professional headline and supporting sentence; one view-work action; the first large cover begins after the opening introduction. Captions sit below covers.

FORM: User-pinned Pearl editorial portfolio and approved A-v3 long-page composition; seed 4838e001. Project dialogs inherit this system.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## Local preview and width correction

The user explicitly requested local preview only with no deployment for this round. On inspecting the first build, the user said the page felt too large and asked for a centered limited width with visible white space on both sides. This correction overrides the original comp's near-full-width covers. Use a shared 1120px maximum container with 24–48px inner gutters across navigation, introduction, work, biography, writing, contact and footer. Reduce desktop headline and project-caption scale with the narrower covers; keep the same generous vertical rhythm and mobile single-column layout.

## Independent project and publishing migration

On 2026-10-12 the user explicitly decided to extract this into `personal-portfolio`, use the GitHub user-site homepage for the portfolio, retain the original personal site on Gitee and evanyang.site, remove portfolio blogs, and support Simplified Chinese, Traditional Chinese, English, and Japanese. This current scope supersedes the earlier in-site `/portfolio` and local-preview-only implementation phase. Keep the approved centered1120px visual world, real gray-stage covers and project dialogs. No writing navigation, section, reader, Markdown dependencies, or article/media assets ship here. A compact native language selector joins the header; every visible and assistive string, project description and external-link label is localized. Distinct static language pages include correct document languages and metadata. The footer points to the separate personal site. Original product screenshots keep their original language and colors.

## Latest selected scope: three topics and four works

The user explicitly selected this exact homepage roster, overriding the exploratory nine-work inventory:

- **AI for Investors**: LogicDuo, ForeArena.
- **AI for Developers**: 奇妙生产力 (Qimiao).
- **AI for ACGers**: Genchi.news.

Each topic has a short localized introduction. Every work uses the same full-width gray stage within the shared 1120px container, one brief caption, and a detail dialog. ForeArena links to its current COUNCIA public service; the naming relationship is explained in the localized dialog. Do not describe portfolio research as proven investment returns. Other local projects are discovery evidence, not additional homepage cards.

The current hero is “把好奇心，做成有用的产品。” and localized equivalents. The user-supplied mobile screenshot exposed excessive first-fold whitespace; mobile now uses a compact two-row header, 44px touch targets, a 32–44px headline (Japanese 27–38px), and content-driven hero height with 56px/72px top/bottom padding. Desktop retains the approved whitespace and width. Current Gmail is yqh611@gmail.com; the monochrome supplied logo remains left of the name. Four languages and browser language selection remain required.

## Latest correction: paired works and correct ForeArena product

The user clarified that ForeArena means https://forearena.com/, a separate scheduled investor-briefing product. Replace the mistaken COUNCIA screenshot, links and four-language detail copy. Chinese locale links use forearena.com/zh; English and Japanese use /en. Earlier COUNCIA naming claims above are superseded, not current product facts.

Desktop uses two works per row: LogicDuo/ForeArena under Investors, followed by side-by-side Developers/Qimiao and ACGers/Genchi topics. Secondary topic headers share grid tracks so covers align despite localized introduction lengths. Each card uses the ordinary gray-stage cover within a half-width column. At 700px and below, all topics and cards flow as single-column blocks. Preserve existing side whitespace, hero, branding and dialog behavior.
