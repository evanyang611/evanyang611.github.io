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
