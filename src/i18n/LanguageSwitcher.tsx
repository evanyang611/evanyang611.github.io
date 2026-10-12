"use client";

import { useLocale } from "./LocaleProvider";
import { LANGUAGE_NAMES, LOCALES } from "./types";

export default function LanguageSwitcher() {
  const { locale, messages, setLocale } = useLocale();
  return (
    <nav aria-label={messages.navigation.language} data-language-switcher className="fixed right-4 top-4 z-[60] flex items-center gap-1 rounded-full border border-[var(--rule)] bg-white/95 p-1 sm:right-6 sm:top-6 lg:right-10 lg:top-7">
      {LOCALES.map((language) => (
        <button key={language} type="button" lang={language} aria-pressed={locale === language} onClick={() => setLocale(language)} className={`min-h-11 rounded-full px-2 text-[13px] leading-none transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--sky-deep)] sm:px-3 sm:text-sm ${locale === language ? "bg-[var(--sky-soft)] font-semibold text-[var(--sky-ink)]" : "text-[var(--foreground-soft)] hover:bg-[var(--paper)] hover:text-[var(--foreground)]"}`}>
          {LANGUAGE_NAMES[language]}
        </button>
      ))}
    </nav>
  );
}
