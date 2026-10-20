# Adding AIGC works

The requested state is empty: `src/content/aigc.ts` exports `AIGC_ARTWORKS = []`. Add entries only after Evan supplies and approves actual works. Blank home previews and walls are pending states, not sample art.

1. Put approved assets under `public/aigc/`, for example `images/`, `videos/` or `music/`. Registry URLs start `/aigc/`; omit `public`. Retain source and rights information with the supplied assets.
2. Add a unique stable `id`, a supported `kind` (`images`, `videos`, `music`), `src`, and `title` covering `zh-CN`, `zh-TW`, `en`, `ja`. Optional `description` also covers all four locales. `year` and `tool` are optional supplied facts.
3. Images require actual intrinsic `width`/`height` and meaningful four-language `alt`. Video optionally has `poster`. Music optionally has `cover` with `src`, intrinsic dimensions and four-language `alt`. Preserve complete original proportions.
4. Entries group by category. A populated category replaces its empty wall; other rooms retain their waiting label. Once populated, the home strip previews actual images, video posters or music covers, falling back to a localized kind label when no preview asset exists. It does not fabricate a player.
5. Video uses native `controls`, `playsInline` and `preload="metadata"`; audio uses native `controls` and `preload="none"`. Preserve user-initiated playback and no autoplay or background-music player.

Run lint, language/locale checks, Pages build and export checks. Accept the actual exported media in all four locales and desktop/narrow views: dimensions/alt, delivery, posters/covers, native play/pause/seeking and fallback links, keyboard access, language/room preservation and reduced-motion scrolling. The empty-framework review does not establish media/codec compatibility. The empty-state assertions in `scripts/check-export.mjs` already depend on `AIGC_ARTWORKS`. With the first approved populated release, review and extend asset/media checks as needed while preserving the conditional empty-state guard.
