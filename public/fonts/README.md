# Site fonts

The site self-hosts Cormorant Garamond, JetBrains Mono, and Noto Serif SC / TC / JP.
These are the unchanged WOFF2 subsets from the project's successful Next.js 16.2.6
static export on 2026-10-12. `src/app/fonts.css` preserves the font faces, Unicode
ranges, weights, styles, and adjusted fallback metrics from that export.

The corresponding SIL Open Font License files are included here. The upstream
families are maintained in the [Google Fonts repository](https://github.com/google/fonts/tree/main/ofl).

Keeping the font files in the repository avoids a build-time dependency on the
Google Fonts CSS response format. It also preserves subset loading: visitors
download only the ranges needed by the text they view.
