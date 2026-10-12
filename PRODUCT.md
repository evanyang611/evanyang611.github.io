# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

The professional portfolio is for professional peers and potential collaborators, as confirmed by the user. They need to understand Evan Yang's expertise and inspect his work.

## Product Purpose

The standalone, work-focused `personal-portfolio` project is assigned the GitHub user-site homepage at https://evanyang611.github.io/. The separate `personal-site` stays on Gitee and evanyang.site, with its personal, blog, and hobby content. The portfolio's footer links to that separate site.

## Capabilities and Constraints

- Independent stack: Next.js 16.4.0, React 19.2.4, TypeScript, and CSS Modules. No article, music, hobby, or personal-site runtime dependency.
- The established deployment is a static export to GitHub Pages through `.github/workflows/deploy-pages.yml`. The current paired-work and ForeArena correction is locally validated and awaiting the release owner’s commit, push, and production acceptance; `9502f5b` is the prior deployed revision.
- Preserve existing unrelated uncommitted work.
- The user chose visual mockups before implementation and pinned https://pearl.framer.website/ as the visual reference. Use Evan's own content and authentic assets.
- Preserve the later approved centered 1120px maximum width, gray image stages, complete screenshots, captions, and native project dialogs.

## Evidence on Hand

- Professional biography, education, contact copy, project summaries, backgrounds, features, technical approaches, and link labels: `src/i18n/messages/{zh-CN,zh-TW,en,ja}.json`, selected through `src/i18n/messages.ts`.
- Project identities, image paths, dimensions, and external destinations: `src/content/projects.ts`. The selected projects are LogicDuo, ForeArena, 奇妙生产力 / Qimiao, and Genchi.news. The same file owns the fixed English topic names and memberships.
- Email and separate personal-site destinations, section structure, selector, and native-dialog behavior: `src/components/portfolio/Portfolio.tsx`.
- Locale paths and language-preference rules: `src/i18n/config.ts`; translated metadata and alternate links: `src/i18n/metadata.ts`; document languages: `src/components/Document.tsx` and the default/localized root layouts.
- Authentic cover provenance: `public/images/sources.json`. Self-hosted font sources and licenses: `public/fonts/sources.json`, `public/fonts/localized-sources.json`, and sibling `*-OFL.txt` files.
- Current local acceptance: `.impeccable/review/paired/finish-review.md` gives SHIP for the supplied local correction. The reviewer opened and dimension-checked eight captures: Simplified Chinese full pages at 1440px/390px, English/Japanese/Traditional Chinese galleries at 850px, Chinese/Japanese ForeArena dialog openings at 390px, and the actual 735 × 853 user-width gallery. `browser-checks.json` records aligned paired rows and no horizontal overflow. `forearena-links.json` records the other three locales' destinations at 1280px desktop; the Japanese dialog screenshot is separately 390px. `user-preview.jpg` is an excluded contact view.
- Current builder-reported checks passed lint; 62 nonempty strings in each locale; locale resolver tests; TypeScript/Next build; static export with the exact roster; the correct ForeArena registry/copy guards; current non-ASCII self-hosted glyph coverage; and seven shipping rasters with zero missing embedded provenance. This documentation pass did not rerun these checks or the supplied detector `[]`.
- The earlier standalone review and A-v3 composition remain history. The open `plates` gate, historical AllFeeds plate score 0.3903, and final-diff score 0.7611 / `drift` remain unpassed historical fidelity records; the current local verdict does not certify exact pixel fidelity or deployment.
- Employer names, employment dates, user counts, business results, and client endorsements have not been supplied. Do not invent them.

## Product Principles

- Show concrete work before broad capability claims.
- Keep expertise, independent projects, and contact information legible.
- Attribute contributions and results only where evidence exists.
- Keep the professional portfolio focused on work; personal writing and hobbies belong to the separate personal site.

## Selected homepage scope

Exactly three topics and four works ship, replacing the exploratory nine-work inventory:

| Topic heading on all four pages | Works |
| --- | --- |
| AI for Investors | LogicDuo; ForeArena |
| AI for Developers | 奇妙生产力 / Qimiao Productivity |
| AI for ACGers | Genchi.news |

The topic headings remain English and each has a short localized introduction. Above 700px, LogicDuo and ForeArena share the first row under Investors. Developers/Qimiao and ACGers/Genchi share the second row with independent headings; a shared subgrid header track keeps their covers aligned across localized introduction lengths. All four cards use ordinary single-track gray stages (aspect ratio 1.3), complete centered authentic screenshots, and brief captions. At 700px and below, the projects stack in topic order. Clicking opens a localized native detail dialog containing background, features, technical approach, and the outbound link.

ForeArena is the scheduled multi-agent investment research product at `https://forearena.com/`. Its four localized details describe selecting research targets and schedules; examining market drivers, recent changes, future scenarios and agent judgments; and receiving traceable briefings through an account, email, or read-only API. Chinese destinations are `https://forearena.com/zh`, and English/Japanese destinations are `https://forearena.com/en`, derived from the authoritative registry root. Its authentic 1280 × 720 cover is `/images/forearena-investor-cover.jpg`, captured from the public Chinese landing page. The visible sample panel is product imagery and does not substantiate investment returns. Earlier reviews' alternate product mapping and full-width placement are superseded by this correction.

AllFeeds is removed from the homepage and its old cover is absent. The other discovered projects remain inventory evidence and must not silently become shipping cards. The curiosity-led headline and introduction are current in all four message files. The mobile opening follows the user’s screenshot correction so the first topic and cover appear in the first viewport; desktop retains the approved whitespace.

## Confirmed multilingual scope

The portfolio has no blog section. Simplified Chinese, Traditional Chinese, English, and Japanese cover navigation, headline and introduction, topic introductions, biography, project titles and summaries, detailed backgrounds, features, technical approaches, assistive labels, contact, and footer. The localized message files contain 62 nonempty strings per locale. Routes are `/`, `/zh-TW/`, `/en/`, and `/ja/`; language-specific static HTML includes titles, descriptions, document language, canonical URLs, and alternate links. Explicit language paths take priority over automatic selection. Default entries honor a valid query or saved manual choice, then match the browser's ordered language preferences, with Simplified Chinese as the fallback. Contact uses `yqh611@gmail.com`. All screenshots are authentic product UI and retain their source language and colors.


## Release and evidence boundaries

Documentation now reflects the paired-work correction; publication and production acceptance remain separate release steps. Source smooth scrolling is restored after the temporary exported-CSS capture override. The release owner must verify the root and locale routes, exact paired topic/roster content, images/fonts, language selection, Gmail contact, a project dialog, and the localized ForeArena destination after publishing. Live motion, a fresh keyboard/screen-reader session, all non-CN lower-page/dialog scroll states, physical-device behavior, other browser engines, current public product behavior or investment outcomes, and this correction's production release were not independently exercised by the current reviewer.
