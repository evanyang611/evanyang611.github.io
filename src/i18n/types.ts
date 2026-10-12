export const LOCALES = ["zh-CN", "zh-TW", "en", "ja"] as const;
export type Locale = (typeof LOCALES)[number];
export type PageId = "home" | "about" | "work" | "blogs" | "anime" | "games" | "songs" | "links";

export const LANGUAGE_NAMES: Record<Locale, string> = {
  "zh-CN": "简体中文",
  "zh-TW": "繁體中文",
  en: "English",
  ja: "日本語",
};

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && LOCALES.includes(value as Locale);
}
