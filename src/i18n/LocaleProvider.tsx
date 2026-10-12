"use client";

import { createContext, useContext, useEffect, useSyncExternalStore, type ReactNode } from "react";
import zhCN from "./messages/zh-CN.json";
import zhTW from "./messages/zh-TW.json";
import en from "./messages/en.json";
import ja from "./messages/ja.json";
import { isLocale, type Locale } from "./types";

export type Messages = typeof zhCN;
const messages: Record<Locale, Messages> = { "zh-CN": zhCN, "zh-TW": zhTW, en, ja };
const STORAGE_KEY = "personal-site-language";
const CHANGE_EVENT = "personal-site-language-change";

function getSnapshot(): Locale {
  const query = new URLSearchParams(window.location.search).get("lang");
  if (isLocale(query)) return query;
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (isLocale(saved)) return saved;
  } catch {
    // Language switching also works when browser storage is unavailable.
  }
  return "zh-CN";
}

function subscribe(listener: () => void) {
  window.addEventListener(CHANGE_EVENT, listener);
  window.addEventListener("storage", listener);
  window.addEventListener("popstate", listener);
  return () => {
    window.removeEventListener(CHANGE_EVENT, listener);
    window.removeEventListener("storage", listener);
    window.removeEventListener("popstate", listener);
  };
}

function changeLocale(locale: Locale) {
  const url = new URL(window.location.href);
  url.searchParams.set("lang", locale);
  window.history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
  try {
    window.localStorage.setItem(STORAGE_KEY, locale);
  } catch {
    // The URL retains the choice even if storage is unavailable.
  }
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

type LocaleContextValue = { locale: Locale; messages: Messages; setLocale: (locale: Locale) => void };
const LocaleContext = createContext<LocaleContextValue | null>(null);

export default function LocaleProvider({ children }: { children: ReactNode }) {
  const locale = useSyncExternalStore(subscribe, getSnapshot, () => "zh-CN" as const);
  const copy = messages[locale];

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  return (
    <LocaleContext.Provider value={{ locale, messages: copy, setLocale: changeLocale }}>
      <title>{copy.site.title}</title>
      <meta name="description" content={copy.site.description} />
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  const context = useContext(LocaleContext);
  if (!context) throw new Error("useLocale must be used within LocaleProvider");
  return context;
}
