# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

The professional portfolio is for professional peers and potential collaborators, as confirmed by the user. They need to understand Evan Yang's expertise and inspect his work.

## Product Purpose

The standalone, work-focused `personal-portfolio` project is assigned the GitHub user-site homepage. The separate `personal-site` stays on Gitee and evanyang.site, with its personal, blog, and hobby content. The portfolio's footer links to that separate site.

## Capabilities and Constraints

- Independent stack: Next.js 16.4.0, React 19.2.4, TypeScript, and CSS Modules. No article, music, hobby, or personal-site runtime dependency.
- The established deployment is a static export to GitHub Pages. Publishing and production acceptance are pending the release owner's workflow.
- Preserve existing unrelated uncommitted work.
- The user chose visual mockups before implementation and pinned https://pearl.framer.website/ as the visual reference. Use Evan's own content and authentic assets.
- Preserve the later approved centered 1120px maximum width, gray image stages, complete screenshots, captions, and native project dialogs.

## Evidence on Hand

- Professional biography, education, contact copy, project summaries, backgrounds, features, technical approaches, and link labels: `src/i18n/messages/{zh-CN,zh-TW,en,ja}.json`, selected through `src/i18n/messages.ts`.
- Project identities, image paths, dimensions, and external destinations: `src/content/projects.ts`. The projects are LogicDuo, AllFeeds, and Genchi.news.
- Email and separate personal-site destinations, section structure, selector, and native-dialog behavior: `src/components/portfolio/Portfolio.tsx`.
- Locale paths and language-preference rules: `src/i18n/config.ts`; translated metadata and alternate links: `src/i18n/metadata.ts`; document languages: `src/components/Document.tsx` and the default/localized root layouts.
- Authentic cover provenance: `public/images/sources.json`. Self-hosted font sources and licenses: `public/fonts/sources.json`, `public/fonts/localized-sources.json`, and sibling `*-OFL.txt` files.
- Local standalone acceptance: `.impeccable/review/standalone/finish-review.md`, `validation.json`, `browser-checks.json`, `language-preferences.json`, eight language/viewport captures, and two mobile dialog captures. The finish verdict is SHIP for the inspected local implementation; it does not certify publication.
- Employer names, employment dates, user counts, business results, and client endorsements have not been supplied. Do not invent them.

## Product Principles

- Show concrete work before broad capability claims.
- Keep expertise, independent projects, and contact information legible.
- Attribute contributions and results only where evidence exists.
- Keep the professional portfolio focused on work; personal writing and hobbies belong to the separate personal site.

## Confirmed multilingual scope

The portfolio has no blog section. Simplified Chinese, Traditional Chinese, English, and Japanese cover navigation, biography, project summaries, detailed backgrounds, features, technical approaches, assistive labels, contact, and footer. The localized message files contain 49 translated strings per locale. Routes are `/`, `/zh-TW/`, `/en/`, and `/ja/`; language-specific static HTML includes titles, descriptions, document language, canonical URLs, and alternate links. Explicit language paths take priority over remembered preferences. All screenshots are authentic product UI and retain their source language and colors.
