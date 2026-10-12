---
name: Evan Yang Professional Portfolio
description: A standalone, four-language editorial portfolio for AI engineering and independent products.
colors:
  ink: "#111"
  paper: "#fff"
  stage: "#eee"
  muted: "#666"
  display-muted: "#767676"
  detail-copy: "#444"
  biography: "#454545"
  supporting: "#555"
  arrow: "#707070"
  rule: "#ddd"
  hover-ink: "#333"
  selector-hover: "#999"
  scrollbar-thumb: "#aaa"
  scrollbar-track: "#f4f4f4"
  backdrop: "rgb(0 0 0 / 32%)"
typography:
  display:
    fontFamily: "var(--font-display)"
    fontSize: "clamp(42px, 4.7vw, 68px)"
    fontWeight: 400
    lineHeight: 1.23
    letterSpacing: "-.035em"
  display-mobile:
    fontFamily: "var(--font-display)"
    fontSize: "clamp(32px, 8.5vw, 44px)"
    fontWeight: 400
    lineHeight: 1.35
    letterSpacing: "-.025em"
  display-mobile-ja:
    fontFamily: "var(--font-display)"
    fontSize: "clamp(27px, 8.5vw, 38px)"
    fontWeight: 400
    lineHeight: 1.35
    letterSpacing: "-.025em"
  theme-heading:
    fontFamily: "var(--font-display)"
    fontSize: "clamp(26px, 2.5vw, 34px)"
    fontWeight: 400
    lineHeight: 1.3
    letterSpacing: "-.02em"
  theme-heading-mobile:
    fontFamily: "var(--font-display)"
    fontSize: "24px"
    fontWeight: 400
    lineHeight: 1.3
    letterSpacing: "-.02em"
  theme-intro:
    fontFamily: "var(--font-body)"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.7
  theme-intro-mobile:
    fontFamily: "var(--font-body)"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.6
  section:
    fontFamily: "var(--font-body)"
    fontSize: "clamp(28px, 3vw, 42px)"
    fontWeight: 400
    lineHeight: 1.3
    letterSpacing: "-.025em"
  project-title:
    fontFamily: "var(--font-body)"
    fontSize: "clamp(27px, 2.3vw, 32px)"
    fontWeight: 400
    lineHeight: 1.3
    letterSpacing: "-.025em"
  project-summary:
    fontFamily: "var(--font-body)"
    fontSize: "clamp(16px, 1.4vw, 18px)"
    fontWeight: 400
    lineHeight: 1.5
  body:
    fontFamily: "var(--font-body)"
    fontSize: "17px"
    fontWeight: 400
    lineHeight: 1.7
  label:
    fontFamily: "var(--font-body)"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.4
  language-select:
    fontFamily: "var(--font-body)"
    fontSize: "14px"
    fontWeight: 400
  detail-title:
    fontFamily: "var(--font-body)"
    fontSize: "clamp(30px, 4vw, 48px)"
    fontWeight: 400
    lineHeight: 1.35
    letterSpacing: "-.025em"
  contact-display:
    fontFamily: "var(--font-display)"
    fontSize: "clamp(38px, 4.3vw, 60px)"
    fontWeight: 400
    lineHeight: 1.4
    letterSpacing: "-.03em"
rounded:
  flat: "0"
  dialog: "12px"
  pill: "999px"
  circle: "50%"
spacing:
  brand-gap: "10px"
  caption-gap: "8px"
  theme-intro-offset: "12px"
  theme-intro-offset-mobile: "10px"
  theme-header-offset: "40px"
  theme-header-offset-mobile: "24px"
  theme-gap: "140px"
  theme-gap-mobile: "100px"
  link-gap: "12px"
  action-gap: "14px"
  compact-gap: "16px"
  mobile-work-gutter: "20px"
  caption-offset: "22px"
  inset: "24px"
  header-gap: "32px"
  panel-gap: "48px"
  text-column-gap: "64px"
  page-gutter: "clamp(24px, 3.5vw, 48px)"
  cover-inset: "clamp(24px, 3.8vw, 50px)"
  featured-cover-inset: "clamp(40px, 5vw, 72px)"
  mobile-cover-inset: "28px"
  mobile-project-gap: "70px"
  mobile-hero-top: "56px"
  mobile-hero-bottom: "72px"
  mobile-hero-action-offset: "32px"
  project-row-gap: "clamp(84px, 9.5vw, 146px)"
  project-column-gap: "clamp(24px, 2.5vw, 40px)"
  text-section-offset: "clamp(140px, 15vw, 230px)"
components:
  brand-mark:
    size: "48px"
  button-primary:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "10px 24px"
  button-primary-hover:
    backgroundColor: "{colors.hover-ink}"
    textColor: "{colors.paper}"
  navigation:
    textColor: "{colors.ink}"
    padding: "10px 0"
  language-select:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    typography: "{typography.language-select}"
    rounded: "{rounded.pill}"
    padding: "10px 32px 10px 16px"
    width: "132px"
  theme-heading:
    textColor: "{colors.ink}"
    typography: "{typography.theme-heading}"
  theme-intro:
    textColor: "{colors.muted}"
    typography: "{typography.theme-intro}"
  project-card:
    textColor: "{colors.ink}"
    rounded: "{rounded.flat}"
    padding: "0"
    width: "100%"
  project-stage:
    backgroundColor: "{colors.stage}"
    rounded: "{rounded.flat}"
    padding: "{spacing.cover-inset}"
    width: "100%"
  featured-project-stage:
    backgroundColor: "{colors.stage}"
    rounded: "{rounded.flat}"
    padding: "{spacing.featured-cover-inset}"
    width: "100%"
  project-caption:
    textColor: "{colors.ink}"
    typography: "{typography.project-title}"
  detail-dialog:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.dialog}"
    padding: "0"
    width: "min(1000px, calc(100% - 64px))"
  dialog-close:
    backgroundColor: "{colors.stage}"
    textColor: "{colors.ink}"
    rounded: "{rounded.circle}"
    size: "44px"
---

# Design System: Evan Yang Professional Portfolio

## Overview

**Creative North Star: "Pearl-inspired professional portfolio"**

A calm editorial presentation uses white paper, black actions, neutral gray image stages, and regular sans-serif type. Real product imagery supplies the color and visual detail. Broad white margins and generous vertical spacing give each piece of work room to be inspected.

This system governs the independent `personal-portfolio` project and its four language pages. It preserves Pearl’s visual world and the user-approved centered-width correction. Later choices for identity, copy, topic structure, and mobile rhythm govern the current implementation; the original A-v3 composition remains historical evidence. The separate personal site has its own visual system and runtime.

**Key Characteristics:**

- Centered content with visible white space on both sides.
- Regular sans-serif hierarchy and compact black pill actions.
- Complete, original-color product images centered on identical gray stages.
- Paired desktop works with independent topic headings, aligned cover starts, captions outside images, and project detail on demand.
- Native language selection, native scrolling, keyboard-visible focus, and reduced-motion support.

The current finish verdict is **SHIP** in `.impeccable/review/paired/finish-review.md`, scoped to the supplied local paired-work and ForeArena correction. This correction has not been published at this documentation handoff; `9502f5b` is the prior deployed revision. The release owner will commit, push, and verify the new GitHub Pages version. Earlier reviews' full-width layout and alternate product mapping are historical and superseded by the current correction.

The reviewer opened and dimension-checked all eight current captures: full-page Simplified Chinese at 1440px and 390px, gallery views in English/Japanese/Traditional Chinese at 850px, Chinese and Japanese ForeArena dialog openings at 390px, and the actual 735 × 853 user-width gallery. The lower second-row covers extend beyond the 850px gallery viewports; `user-preview.jpg` is an excluded contact view. `.impeccable/review/paired/browser-checks.json` records aligned paired rows and no horizontal overflow; `forearena-links.json` records the other three locales' destinations at 1280px desktop. Existing builder-reported checks passed lint, 62 nonempty strings per locale, locale resolver tests, TypeScript/Next build, static export, the correct ForeArena registry/copy guards, current non-ASCII glyph coverage, and seven shipping rasters with zero missing embedded provenance. This documentation pass did not rerun them or the supplied detector `[]`. Live motion, a fresh keyboard/screen-reader session, all non-CN lower-page/dialog scroll states, physical devices, other browser engines, current public product behavior or investment outcomes, and the new production release remain outside this review's independent coverage.

Historical fidelity evidence remains unchanged: the earlier build state is open at `plates`, the authentic AllFeeds image scored 0.3903 against a generated arrangement, and the first-build pixel diff scored 0.7611 (`drift`). These records are not automated certification of this standalone multilingual build.

## Colors

The palette is achromatic; project screenshots retain their own colors. Frontmatter values are normative, extracted from `src/components/portfolio/portfolio.module.css` and `src/app/globals.css`.

### Primary

- **Ink** (`ink`): headlines, navigation, project names, actions, focus outlines, and dialog controls.
- **Hover Ink** (`hover-ink`): filled-action hover surface and border.

### Neutral

- **Paper** (`paper`): page, dialog, language selector, and sticky dialog toolbar.
- **Image Stage** (`stage`): every product cover and the close-button resting surface.
- **Muted Text** (`muted`): topic introductions, project summaries, email, footer, and dialog toolbar.
- **Display Gray** (`display-muted`): the second phrase of the opening headline.
- **Detail Ink** (`detail-copy`) and **Biography Ink** (`biography`): project-detail and biography copy.
- **Supporting Gray** (`supporting`): the contact introduction.
- **Arrow Gray** (`arrow`): project-caption arrows.
- **Quiet Rule** (`rule`): selector border, text selection, and close-button hover.
- **Selector Hover** (`selector-hover`): language-selector hover border.
- **Scrollbar Thumb / Track**: dialog scrolling affordance.
- **Backdrop** (`backdrop`): the translucent black native-dialog scrim.

**The Complete Image Rule.** Keep every product image complete, centered, and in its original colors. The gray stage belongs around the image; it must not tint, crop, or replace the product UI.

The sidecar's synthesized achromatic tonal ramps are explanatory panel metadata, not additional production color tokens.

## Typography

**Display Font:** `var(--font-display)`.

**Body Font:** `var(--font-body)`.

`src/app/globals.css` resolves these variables from the document language. `Portfolio Sans` is the self-hosted Inter alias; `Portfolio CJK`, `Portfolio TC`, and `Portfolio JP` are Noto Sans SC, TC, and JP respectively.

| Document language | Body stack | Display stack |
| --- | --- | --- |
| `zh-CN` | `"Portfolio Sans", "Portfolio CJK", "PingFang SC", "Microsoft YaHei", sans-serif` | `"Portfolio CJK", "Portfolio Sans", sans-serif` |
| `zh-TW` | `"Portfolio Sans", "Portfolio TC", "PingFang TC", "Microsoft JhengHei", sans-serif` | `"Portfolio TC", "Portfolio Sans", sans-serif` |
| `en` | Default body stack | `"Portfolio Sans", sans-serif` |
| `ja` | `"Portfolio Sans", "Portfolio JP", "Hiragino Sans", "Yu Gothic", sans-serif` | `"Portfolio JP", "Portfolio Sans", sans-serif` |

`public/fonts/portfolio-fonts.css` declares normal weights 400, 500, and 600 with `font-display: swap`. The base files are `inter-d712603da422.woff2`, `notosanssc-38f8055b65db.woff2`, `notosanstc-eb3c8c184666.woff2`, and `notosansjp-daa0e41795a6.woff2`. Subsets and Google Fonts source records live in `public/fonts/localized-sources.json` and `public/fonts/sources.json`; sibling `*-OFL.txt` files retain all four font licenses. Characters outside the declared subsets use the language-specific fallback stacks. Current text is predominantly 400, with 500 for the wordmark and project-detail subheadings.

The homepage headline is “把好奇心，做成有用的产品。” with equivalent Traditional Chinese, English, and Japanese wording in the locale messages. Locale-specific `*-slogan-*.woff2` supplements cover the headline and introduction's newly added Chinese/Japanese characters with the same font families and weights; their sources are recorded in `localized-sources.json`. Topic and four-work text retains `notosanssc-themes-59ece5918230.woff2` (44 additional SC glyphs), `notosanstc-themes-25570fdfd531.woff2` (54 TC glyphs), and `notosansjp-themes-b46345c111f7.woff2` (44 JP glyphs). The corrected ForeArena copy adds `notosanssc-forearena-120023c3f3d7.woff2` (12 SC glyphs), `notosanstc-forearena-1a2eb9235edc.woff2` (14 TC glyphs), and `notosansjp-forearena-1eb34602844d.woff2` (18 JP glyphs), all in the existing families, weights, and licenses. Desktop headline size, black/gray emphasis, and page spacing retain the established design. On mobile the gray phrase is a width-contained inline block to preserve a complete thought; Japanese display size uses `clamp(27px, 8.5vw, 38px)` so the product phrase remains intact.

### Hierarchy

- **Display:** frontmatter `display` is the desktop opening headline. At the mobile breakpoint use `display-mobile`; Japanese uses `display-mobile-ja`. The gray phrase stays a width-contained inline block.
- **Topic Heading / Introduction:** frontmatter `theme-heading` and `theme-intro` introduce each work group. At the mobile breakpoint use their `-mobile` roles. Introductions remain muted, with a maximum measure of 65ch.
- **Section:** frontmatter `section` labels biography with quiet regular weight.
- **Project Title / Summary:** frontmatter roles form one caption group. Mobile uses 29px titles and 16px summaries; the summary sits 8px below the title.
- **Body:** frontmatter `body` is 17px on desktop; mobile page copy is 16px. Biography has a 70ch maximum and line height 2 (1.95 on mobile). Dialog copy remains 17px with line height 1.8 and a 72ch detail maximum.
- **Label / Navigation:** filled-action labels use the frontmatter `label` role. Navigation is 16px on desktop and 15px on mobile; the mobile header contact action is 14px.
- **Language Select:** the frontmatter selector role changes to 16px on mobile; its width narrows only at 360px and below.
- **Detail Title:** fluid regular headings wrap long text. Detail subheads are 21px, weight 500; mobile uses 20px.
- **Contact Display:** frontmatter `contact-display` changes to 39px on mobile. The opening supporting sentence uses `clamp(17px, 1.7vw, 20px)`, 17px on mobile.
- **Wordmark / Supporting Labels:** the wordmark uses `clamp(24px, 2.1vw, 28px)`, weight 500, line height 1, tracking `-.035em`; mobile is 22px. Footer text is 15px/14px, email 16px, and dialog-toolbar text 14px.

**The Regular Type Rule.** Preserve the quiet weight hierarchy. CJK display text needs comfortable line height; visual emphasis comes from scale and space rather than heavy weight.

Opening and contact headlines use balanced wrapping, except Japanese uses `text-wrap: wrap` for natural line breaks. Correct `<html lang>` from `Document.tsx` and the per-locale root layouts is part of the font system.

## Layout

**The Shared Width Rule.** Navigation, introduction, work, biography, contact, and footer share a centered outer container with maximum width 1120px and the frontmatter `page-gutter` inside it. This user correction supersedes the near-full-width approved composition. The maximum includes inner gutters under the project's border-box sizing.

The desktop header uses three columns (`1fr auto 1fr`): wordmark, centered Work/About navigation, and end-aligned language selector plus Contact action. Its height is `clamp(76px, 7.7vw, 112px)`. The opening section has a minimum height of `clamp(470px, 47.5vw, 730px)` and separate top, side, and bottom whitespace; at widths of 1600px and above its minimum height is 760px. Page width and cover padding are separate controls.

Above 700px the work gallery shows two works per row. The Investors topic uses two equal project tracks for LogicDuo and ForeArena. Developers/Qimiao and ACGers/Genchi share the second row while retaining independent topic headings and localized introductions. The secondary-topic wrapper uses two equal columns, `project-column-gap` between columns, `theme-gap` above it, and `theme-header-offset` between its shared header and cover tracks. Each child topic spans those two rows with `grid-template-rows: subgrid`; its header has no separate bottom margin, and its project grid has one column. This shared header track aligns the two covers even when localized introductions wrap to different heights. The Investors header retains `theme-header-offset` below it; title-to-introduction separation is `theme-intro-offset`.

Every current homepage card uses the ordinary stage: aspect ratio 1.3 and frontmatter `cover-inset`, without spanning both desktop columns. The featured-stage role remains available in the reusable CSS but is unused by the current roster. Dialog stages use aspect ratio 1.9. Images occupy the available inner box with `object-fit: contain`. Captions sit below the stage with `caption-offset`, independent of the gray region.

Biography uses a `1fr 2fr` grid with `text-column-gap`. The frontmatter section and project gaps preserve generous rhythm. Contact begins after `clamp(160px, 17vw, 260px)` and has `clamp(100px, 11vw, 170px)` bottom padding.

At the inclusive 850px breakpoint, the header becomes two rows: wordmark and Contact above, Work/About navigation and selector below. The header uses 24px block padding and a 20px gap; lower-row navigation has a 28px gap. This header change occurs independently of the page's single-column breakpoint.

At the inclusive 700px breakpoint, projects and biography become single-column. The secondary-topic wrapper and its child topics switch to block flow: `theme-gap-mobile` separates it from Investors and separates Developers from ACGers, while each header uses `theme-header-offset-mobile` below it. Header, hero, biography, contact, and footer use 24px sides; work uses 20px sides. The header uses `20px 24px` padding and a 16px grid gap; home and section links have targets of at least 44px in each dimension. Header navigation has a 24px gap. At 360px and below the language selector is 120px wide so the larger section targets still fit. Homepage covers use aspect ratio 1.45 with `mobile-cover-inset`; each topic’s project gap is `mobile-project-gap`. Topic introductions use `theme-intro-offset-mobile`. Biography begins after 130px and contact after 150px. The mobile hero has no reserved minimum height; its top, bottom, and action offsets use the `mobile-hero-*` tokens, with 24px sides. The supplied mobile evidence places the first topic and cover within the first viewport while retaining generous separation.

Dialogs are independent of the page container: desktop uses the frontmatter width with a viewport height allowance of 64px. Mobile allows 12px on each side and uses `calc(100dvh - 24px)` maximum height. The body scrolls inside the panel; the toolbar stays visible. Mobile dialog covers use aspect ratio 1.45 and 24px insets.

## Elevation & Depth

**The Flat Surface Rule.** Resting page surfaces and product cards have no shadows. White space, image-stage contrast, and functional borders provide separation. Modal depth comes from the native top layer and the backdrop token, not decorative elevation effects.

Project hover uses image scale 1.025 over 0.45s with `cubic-bezier(.2,.7,.2,1)` and an arrow shift of 5px over 0.25s, only on hover-capable devices. Filled-action color changes use 0.18s. Dialog opening uses 0.2s `ease-out`, moving from an 8px lower position and opacity .5 to rest. Reduced motion disables these transitions/animation and changes smooth scrolling to automatic. Exact motion and focus rules live in the sidecar.

## Shapes

Project stages are square-cornered rectangles with overflow contained. Captions have no enclosing card chrome. Filled actions and the language selector use the frontmatter pill radius; the detail panel uses the dialog radius. The close control is a 44px circle. Borders are functional: a 1px ink action edge and a quiet selector edge. The accepted portfolio has no decorative gradients or glass treatments.

## Components

### Filled Actions

Compact black pills pair white labels with a small inline arrow where needed. Use the frontmatter primary action and hover variants with a 48px minimum height. The mobile header contact action is the compact variant (44px minimum, `8px 18px` padding). Focus is a 2px ink outline with 6px offset. Use anchors for section, email, and external links.

### Navigation

Short text anchors lead to Work and About, with Contact as a separate filled action. Hover adds an underline with a 7px offset; keyboard focus uses the shared ink outline. The home link pairs the user's monochrome star-and-orbit mark with the 500-weight Evan Yang name, separated by 10px. The transparent PNG mark is 48px on desktop and 40px on mobile; the mobile name is 22px. At 360px and below, the visual name is hidden to preserve room for navigation actions, while section links remain on one line with a 12px gap; the localized home-link accessible name remains. The same mark is the 96px PNG browser icon. Navigation has no fixed or sticky page overlay. A focus-revealed skip link leads to work.

### Native Language Selector

Use the native `<select>` with a localized accessible label and four options: 简体中文, 繁體中文, English, 日本語. It retains the frontmatter 132px width and 48px minimum height; mobile uses 44px minimum height and 16px text. A small inline chevron is decorative. Hover changes the border to `selector-hover`; focus uses the shared ink outline.

Routes are `/` for Simplified Chinese, `/zh-TW/`, `/en/`, and `/ja/`. Selection stores an optional preference and navigates while preserving the section hash. Explicit locale paths take precedence over automatic selection. The default entry checks a valid language query, saved manual choice, then ordered browser languages; unsupported preferences fall back to Simplified Chinese. Visible and assistive copy comes from `src/i18n/messages/`, with metadata supplied by `src/i18n/metadata.ts`.

### Topic Header

An unboxed heading and a short muted introduction establish each audience’s narrative. Use the frontmatter topic roles and offsets with a 65ch maximum introduction width. The current headings are fixed English strings on every locale, marked `lang="en"`; the introductions come from the current page language. Homepage topic membership is product content, owned by `src/content/projects.ts` and PRODUCT.md, rather than a global design token.

### Gray-Stage Project Card

The whole image-plus-caption group is a semantic button with an accessible project name and `aria-haspopup="dialog"`. It has no border, shadow, or background outside the stage. The image is centered and complete; title, short summary, and arrow sit on white below it. `ProjectCover` retains featured, ordinary, and dialog variants; all four current homepage cards use the ordinary variant in one desktop column each. Only the brief caption appears on the homepage; extended content appears in the opened dialog.

`src/content/projects.ts` owns the project identities, assets, dimensions, and external targets. Current covers for LogicDuo, ForeArena, Qimiao, and Genchi.news are `/images/logicduo-cover.png` (1280 × 720), `/images/forearena-investor-cover.jpg` (1280 × 720), `/images/qimiao-cover.jpg` (1280 × 620), and `/images/genchi-cover.png` (1280 × 720). `public/images/sources.json` records their authentic public-page captures from 2026-10-12. The ForeArena capture comes from `https://forearena.com/zh` and shows its public sample panel; it is product imagery rather than performance evidence. Its dedicated filename prevents reuse of the older incorrectly mapped cover from a browser cache. The Qimiao capture omits the account header. AllFeeds is absent from the current homepage and its cover asset has been removed. The original screenshot language and colors remain unchanged. Generated images in `.impeccable/mocks/` are historical composition studies, not replacement UI or evidence of project performance.

The user supplied the portfolio logo. `public/brand/evan-logo-master.png` preserves the imagegen monochrome edit at full resolution, with the original star/ribbon identity and transparent background; `evan-logo.png` and `favicon.png` are resized delivery assets. `public/brand/sources.json` records the source, editing prompt, and preparation sizes. Branding uses only neutral black/gray/white and retains transparent areas inside the orbits.

### Detail Dialog

Use the native `<dialog>` with `showModal()`, an accessible heading, sticky toolbar, and close button receiving initial focus. Project content follows background, features, technical approach, and real external links. Escape, the close button, and clicks outside the panel close it. Opening locks page scrolling; closing restores prior overflow and focus to the originating control. External links use a new tab with `noopener noreferrer`; Genchi links follow the current portfolio language. ForeArena's four localized dialogs describe scheduled multi-agent investment research: targets and schedules, market drivers, recent changes, future scenarios, and briefing delivery through an account, email, or read-only API. Its locale destination is derived from the registry's `https://forearena.com/` root, adding `zh` for Chinese locales and `en` for English/Japanese.

The sidecar dialog snippet illustrates visual structure. `src/components/portfolio/Portfolio.tsx` owns lifecycle, dismissal, scroll locking, and focus restoration. Preserve these behaviors when reusing the pattern.

### Contact and Footer

The contact section pairs a regular display heading with a brief introduction, email action, and visible email address. The footer's localized personal-site link points to the separate `https://evanyang.site/` site.

## Do's and Don'ts

### Do:

- Do apply these tokens to the independent four-language portfolio.
- Do use the shared centered width and visible side whitespace confirmed by the user.
- Do center complete, original-color product screenshots on the same gray stage and place captions below on white.
- Do maintain regular sans-serif typography, locale-specific font stacks, and generous space between content groups.
- Do reuse the native language selector and detail dialog with keyboard focus, contained scrolling, and reduced-motion behavior.
- Do retain font licenses, asset source manifests, and the distinction between real UI images and generated studies.

### Don't:

- Don't restore near-full-width desktop covers or enlarge type without a new user decision.
- Don't crop product screenshots to fill stages, tint them gray, or substitute generated dashboard UI.
- Don't compress several projects into the opening introduction to demonstrate coverage.
- Don't add shadows, decorative gradients, glass surfaces, or heavy display weight to this system.
- Don't import the original personal site's visual system or runtime into this independent portfolio.
- Don't present the local finish verdict or historical fidelity records as production deployment acceptance or an automated fidelity pass.
