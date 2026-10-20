# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Professional peers and potential collaborators inspect Evan Yang's expertise, independent products and supplied AI creations, then contact him or visit a project.

## Product Purpose

The independent `personal-portfolio` owns the GitHub user-site homepage at https://evanyang611.github.io/. Its homepage is an index of AI Agent, AIGC and About. The separate `personal-site` retains personal writing and other content at evanyang.site and Gitee; its footer link remains.

## Capabilities and Constraints

- Next.js 16.4.0, React 19.2.4, TypeScript, CSS Modules, self-hosted fonts and static GitHub Pages export through `.github/workflows/deploy-pages.yml`.
- Preserve the curiosity-led hero, biography, contact, monochrome identity, centered 1120px maximum container, complete gray-stage screenshots and native detail dialogs.
- Homepage navigation labels are exactly `AI Agent / AIGC / About` in all four languages, as requested. Contact is a separate localized action.
- AI Agent and AIGC each have a manual horizontal preview strip and an `Enter` link to an independent detailed collection. No automatic carousel, blog, background-music player, upload service or runtime backend is introduced.
- AIGC is empty now: `AIGC_ARTWORKS` remains `[]`. Future media requires approved assets and separate rendering/playback acceptance.
- Preserve unrelated work. At this documentation handoff, `9a3faec` is the verified published baseline (GitHub Actions `38254765284` succeeded); the new index and collections await release and production acceptance.

## Current surfaces

| Surface | Default route | Localized routes | Contents |
| --- | --- | --- | --- |
| Home index | `/` | `/zh-TW/`, `/en/`, `/ja/` | Preserved hero; AI Agent and AIGC previews; About; contact |
| AI Agent | `/ai-agent/` | `/{locale}/ai-agent/` | Four curated products in three topics; native detail dialogs |
| AIGC | `/aigc/` | `/{locale}/aigc/` | Images, videos and music rooms; all explicitly empty |

Home navigation anchors `#ai-agent`, `#aigc`, and `#about`; the hero action enters the AI Agent preview and the legacy `#work` anchor remains. Collection navigation routes to AI Agent/AIGC or home About. Brand, contact and footer return paths preserve locale. Current collection items use `aria-current="page"`.

AI Agent previews four authentic product covers with brief captions. Cards enter the matching collection topic; project dialogs belong to the collection. AIGC currently previews three explicitly pending media rooms. Each section's `Enter` opens its collection. Tracks support native horizontal scroll snap, touch/trackpad scrolling, previous/next buttons disabled at endpoints, and left/right keys on the focused region. Reduced-motion preference makes button/key movement instant. No timed movement or fake media controls.

## AI Agent collection

The former homepage gallery moves intact to the independent AI Agent page:

| Topic heading in every locale | Works |
| --- | --- |
| AI for Investors | LogicDuo; ForeArena |
| AI for Developers | 奇妙生产力 / Qimiao Productivity |
| AI for ACGers | Genchi.news |

Above 700px, Investors contains LogicDuo/ForeArena in the first row. Developers/Qimiao and ACGers/Genchi share a second row with independent headings and a shared subgrid header track aligning covers across localized introductions. All four use ordinary gray stages, complete centered original-color screenshots and captions. At 700px and below, topics stack. Cards open localized native dialogs with background, features, technical approach and links; Escape, close/backdrop dismissal, contained scrolling and focus return remain.

ForeArena is scheduled multi-agent investment research at `https://forearena.com/`: targets and schedules, market drivers, recent changes, future scenarios, agent judgments, and traceable account/email/read-only API briefings. Registry-derived destinations are `/zh` for Chinese and `/en` for English/Japanese. Its authentic 1280 × 720 public landing-page cover is `/images/forearena-investor-cover.jpg`; the sample panel does not substantiate investment returns. Earlier COUNCIA mapping/full-width placement is superseded. AllFeeds and other discovered projects are not additional shipping cards.

## AIGC exhibition

The user requests an art-exhibition framework without media yet. Images, videos and music rooms have localized introductions and waiting labels, with flat neutral walls and blank mounting/projection/album geometry. No fabricated artworks, counts or rendered audio/video players appear in the current empty state.

The typed registry supports complete images with intrinsic dimensions and four-language alt text, controlled inline video with an optional poster, and controlled audio with an optional cover. Neither player autoplays. With approved works, the homepage uses actual images/posters/covers; a localized kind label is the fallback when a preview asset is absent. A populated category automatically replaces its empty wall while other rooms remain empty. `docs/aigc-gallery.md` covers files under `public/aigc/`, localized metadata and later acceptance.

## Confirmed multilingual scope

Simplified Chinese, Traditional Chinese, English and Japanese cover descriptions, biography, contact, project titles/summaries/details, gallery text, assistive labels and metadata. The three navigation labels, home module names, `Enter`, AI Agent collection title and three product topic headings intentionally remain English. Each message file contains 89 nonempty strings.

Each surface has static localized HTML, correct `html lang`, title/description, canonical and hreflang. Explicit locale paths take priority; default entries honor a valid query, saved manual preference, then ordered browser languages, with Simplified Chinese fallback. Switching language preserves surface and hash. Contact is `yqh611@gmail.com`; screenshots keep their original language and colors.

## Sources and implementation ownership

- `src/components/portfolio/Portfolio.tsx`: index, biography/contact; `PreviewStrip.tsx`: scroll controls/keys; `AgentProjects.tsx`: collection and native-dialog lifecycle.
- `src/components/portfolio/SiteChrome.tsx`: shared navigation, language/preference routing and footer; `src/content/projects.ts`: IDs, topics, assets, dimensions and destinations.
- `src/components/gallery/{Gallery.tsx,gallery.module.css}`: rooms and future media; `src/content/aigc.ts`: empty typed registry/order.
- `src/i18n/messages/`, `config.ts`, `metadata.ts`, `Document.tsx` and route layouts: content, routing, metadata and document language.
- `public/images/sources.json`, `public/brand/sources.json`, `public/fonts/{sources.json,localized-sources.json}` and font licenses: provenance. Existing-family SC/TC/JP gallery subsets add 21/22/17 glyphs; index subsets add 4/5/4.
- `.impeccable/surfaces/{portfolio,aigc}.md`: user direction. `DESIGN.md` and `.impeccable/design.json`: incumbent system with narrow index/gallery extensions.

## Product Principles

- Show concrete work and truthful empty states before broad claims.
- Distinguish index previews from detailed collections.
- Attribute results only with evidence; do not invent employers, dates, scale, endorsements or investment outcomes.
- Preserve localization, native navigation, manual scrolling and keyboard focus.
- Add only Evan's approved real media, with user-initiated native playback.

## Evidence and release boundaries

Current evidence is `.impeccable/review/index/`. A fresh reviewer inspected eight captures: desktop/mobile home, 320px Japanese home, 850px English home, desktop/Simplified Chinese mobile AI Agent, mobile gallery, and the end-scrolled 390 × 844 music-preview viewport. The last is a mid-page viewport, not a full-page capture. Visual scope fits the incumbent world; the initial verdict requests updating superseded documentation. Final disposition belongs to `finish-review.md` after this handoff.

Supplied `browser-checks.json` records no page overflow at 1440/390/320/850px, strip scrolling/end disabling, focused-region arrow keys, both Enter links, four products/three topics, ForeArena dialog Escape/focus return, collection language/return paths, zero artworks, three home empty previews, three gallery empty rooms and zero audio/video elements. Builder-reported lint, 89 strings per locale, four locale tests, Next/TypeScript build (18 pages), four-locale static export and `git diff --check` passed. Detector: zero primary findings, 11 advisory type-ramp documentation differences. This documentation pass did not rerun browser sessions, implementation checks or detection.

Populated artwork rendering, actual native video/audio playback, physical phones and other engines remain unverified. This release is pending on published baseline `9a3faec`. After publishing, read back the served revision, localized home/collection routes and metadata, previews/controls, empty rooms, font delivery, surface/hash preservation, return paths and existing dialogs.

Prior paired-work review and comp records remain history. The open `plates` gate, historical AllFeeds plate score 0.3903 and first-build final-diff score 0.7611 (`drift`) remain unpassed fidelity records; this extension does not repair them or certify exact pixel fidelity or deployment.
