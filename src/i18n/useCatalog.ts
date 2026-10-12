"use client";

import { useLocale } from "./LocaleProvider";
import type { Locale } from "./types";
import zhCN from "./catalog/zh-CN.json";
import zhTW from "./catalog/zh-TW.json";
import en from "./catalog/en.json";
import ja from "./catalog/ja.json";

type RecommendationText = { title: string; summary: string; tags: string[]; note: string };
type Catalog = { anime: Record<number, RecommendationText>; game: Record<number, RecommendationText> };
const catalogs: Record<Locale, Catalog> = { "zh-CN": zhCN, "zh-TW": zhTW, en, ja };

export function useCatalog() {
  const { locale } = useLocale();
  return catalogs[locale];
}
