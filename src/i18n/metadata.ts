import type { Metadata } from "next";
import { LOCALE_PATHS, type Locale } from "./config";
import { MESSAGES } from "./messages";

const OG_LOCALES = { "zh-CN": "zh_CN", "zh-TW": "zh_TW", en: "en_US", ja: "ja_JP" };

export function portfolioMetadata(locale: Locale): Metadata {
  const copy = MESSAGES[locale];
  return {
    metadataBase: new URL("https://evanyang611.github.io"),
    title: copy.metadata.title,
    description: copy.metadata.description,
    alternates: {
      canonical: LOCALE_PATHS[locale],
      languages: { "zh-Hans": "/", "zh-Hant": "/zh-TW/", en: "/en/", ja: "/ja/", "x-default": "/" },
    },
    icons: { icon: "/favicon.jpg" },
    openGraph: {
      title: copy.metadata.title, description: copy.metadata.description,
      url: LOCALE_PATHS[locale], locale: OG_LOCALES[locale],
      alternateLocale: Object.values(OG_LOCALES).filter(value => value !== OG_LOCALES[locale]),
      type: "website",
    },
  };
}
