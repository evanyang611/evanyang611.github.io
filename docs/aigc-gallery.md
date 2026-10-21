# Adding AIGC works

Image works have no visible title on the homepage or in the gallery, as requested. Keep localized alt text for accessibility; registry titles remain internal metadata. Optional supplied descriptions/year/tool can still accompany a gallery image.

The registry contains two user-approved images: Blue Archive ensemble and Sunna warm-light portrait. Only these two works were selected on 2026-10-21; Mutsumi and alternate source versions are excluded. Video and music rooms remain intentionally empty.

Local intake is `aigc-inbox/` (Git-ignored). Preserve supplied originals there; publish only approved, optimized assets under `public/aigc/`. Current WebP images retain the supplied native dimensions (1920 × 1080 and 1728 × 2432), original proportions and colors. `public/aigc/sources.json` records source/output hashes and conversion settings. No generation model, date or prompt is asserted without supplied facts.

1. Put approved assets under `public/aigc/`, for example `images/`, `videos/` or `music/`. Registry URLs start `/aigc/`; omit `public`. Retain source and rights information with the supplied assets.
2. Add a unique stable `id`, a supported `kind` (`images`, `videos`, `music`), `src`, and `title` covering `zh-CN`, `zh-TW`, `en`, `ja`. Optional `description` also covers all four locales. `year` and `tool` are optional supplied facts.
3. Images require actual intrinsic `width`/`height` and meaningful four-language `alt`. Video optionally has `poster`. Music optionally has `cover` with `src`, intrinsic dimensions and four-language `alt`. Preserve complete original proportions.
4. Entries group by category. A populated category replaces its empty wall; other rooms retain their waiting label. Once populated, the home strip previews actual images, video posters or music covers, falling back to a localized kind label when no preview asset exists. It does not fabricate a player.
5. Video uses native `controls`, `playsInline` and `preload="metadata"`; audio uses native `controls` and `preload="none"`. Preserve user-initiated playback and no autoplay or background-music player.

Run lint, language/locale checks, Pages build and export checks. Accept the actual exported media in all four locales and desktop/narrow views: dimensions/alt, delivery, posters/covers, native play/pause/seeking and fallback links, keyboard access, language/room preservation and reduced-motion scrolling. The empty-framework review does not establish media/codec compatibility. The empty-state assertions in `scripts/check-export.mjs` already depend on `AIGC_ARTWORKS`. Populated export checks now validate unique IDs, assets, four-language titles/alt, homepage previews and matching gallery empty states. Audio/video playback still requires separate acceptance when real media is supplied.

## Image viewer

Gallery images are keyboard-accessible buttons opening a native modal dialog. The viewer starts with a complete fit-to-window image; its zoom control switches to intrinsic pixel dimensions with native touch/trackpad scrolling. Close button, Escape and the outside backdrop dismiss it. Body scrolling is locked while open and the triggering button regains focus on close. No artwork title is displayed. All controls and image descriptions cover the four locales. Blue Archive now uses the remaining `blue-archive-ensemble.png` source (1920 × 1080); its published URL includes a content hash to avoid showing the prior cached variant.
