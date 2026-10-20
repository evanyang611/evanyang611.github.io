export const LOCALES = ["zh-CN", "zh-TW", "en", "ja"] as const;
export type Locale = (typeof LOCALES)[number];
export const LANGUAGE_NAMES: Record<Locale, string> = {
  "zh-CN": "简体中文", "zh-TW": "繁體中文", en: "English", ja: "日本語",
};
export const LOCALE_PATHS: Record<Locale, string> = {
  "zh-CN": "/", "zh-TW": "/zh-TW/", en: "/en/", ja: "/ja/",
};
export const LANGUAGE_STORAGE_KEY = "personal-portfolio-language";
export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && LOCALES.includes(value as Locale);
}

export function browserLocale(languages: readonly string[]): Locale {
  for (const language of languages) {
    const [base, ...subtags] = language.trim().toLowerCase().split("-");
    if (base === "en" || base === "ja") return base;
    if (base !== "zh") continue;
    // An explicit script takes priority over a region (e.g. zh-Hans-TW).
    if (subtags.includes("hant")) return "zh-TW";
    if (subtags.includes("hans")) return "zh-CN";
    return subtags.some(tag => ["tw", "hk", "mo"].includes(tag)) ? "zh-TW" : "zh-CN";
  }
  return "zh-CN";
}

export function preferredLocale(query: unknown, saved: unknown, languages: readonly string[]): Locale {
  return isLocale(query) ? query : isLocale(saved) ? saved : browserLocale(languages);
}

export type Surface = "portfolio" | "aigc" | "agents";
export function surfacePath(locale: Locale, surface: Surface = "portfolio"): string {
  return surface === "portfolio" ? LOCALE_PATHS[locale] : `${LOCALE_PATHS[locale]}${surface === "agents" ? "ai-agent" : "aigc"}/`;
}
