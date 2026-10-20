import type { Metadata } from "next";
import { surfacePath, type Locale, type Surface } from "./config";
import { MESSAGES } from "./messages";

const OG_LOCALES = { "zh-CN": "zh_CN", "zh-TW": "zh_TW", en: "en_US", ja: "ja_JP" };

export function portfolioMetadata(locale: Locale, surface: Surface = "portfolio"): Metadata {
  const copy = surface === "aigc" ? MESSAGES[locale].gallery : surface === "agents" ? MESSAGES[locale].agents : MESSAGES[locale];
  const pagePath = surfacePath(locale, surface);
  return {
    metadataBase: new URL("https://evanyang611.github.io"),
    title: copy.metadata.title,
    description: copy.metadata.description,
    alternates: {
      canonical: pagePath,
      languages: { "zh-Hans": surfacePath("zh-CN", surface), "zh-Hant": surfacePath("zh-TW", surface), en: surfacePath("en", surface), ja: surfacePath("ja", surface), "x-default": surfacePath("zh-CN", surface) },
    },
    icons: { icon: { url: "/brand/favicon.png", type: "image/png", sizes: "96x96" } },
    openGraph: {
      title: copy.metadata.title, description: copy.metadata.description,
      url: pagePath, locale: OG_LOCALES[locale],
      alternateLocale: Object.values(OG_LOCALES).filter(value => value !== OG_LOCALES[locale]),
      type: "website",
    },
  };
}
