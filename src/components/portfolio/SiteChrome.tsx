"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { LANGUAGE_NAMES, LANGUAGE_STORAGE_KEY, LOCALES, LOCALE_PATHS, isLocale, preferredLocale, surfacePath, type Locale, type Surface } from "@/i18n/config";
import type { PortfolioMessages } from "@/i18n/messages";
import styles from "./portfolio.module.css";

export function usePreferredLanguage(locale: Locale, auto: boolean, surface: Surface = "portfolio") {
  const router = useRouter();
  useEffect(() => {
    if (!auto) return;
    const query = new URLSearchParams(window.location.search).get("lang");
    let saved: string | null = null;
    try { saved = window.localStorage.getItem(LANGUAGE_STORAGE_KEY); } catch { /* Preference storage is optional. */ }
    const languages = navigator.languages?.length ? navigator.languages : [navigator.language];
    const next = preferredLocale(query, saved, languages);
    if (next !== locale) router.replace(`${surfacePath(next, surface)}${window.location.hash}`);
  }, [locale, auto, surface, router]);
}

function LanguageSelect({ locale, label, surface }: { locale: Locale; label: string; surface: Surface }) {
  const router = useRouter();
  return <span className={styles.languageSelect}>
    <select aria-label={label} value={locale} onChange={event => {
      const next = event.target.value;
      if (!isLocale(next) || next === locale) return;
      try { window.localStorage.setItem(LANGUAGE_STORAGE_KEY, next); } catch { /* The URL still records the choice. */ }
      router.push(`${surfacePath(next, surface)}${window.location.hash}`);
    }}>
      {LOCALES.map(language => <option key={language} value={language} lang={language}>{LANGUAGE_NAMES[language]}</option>)}
    </select>
    <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="m6 9 6 6 6-6" /></svg>
  </span>;
}

export function SiteHeader({ locale, copy, surface = "portfolio" }: { locale: Locale; copy: PortfolioMessages; surface?: Surface }) {
  const home = surface === "portfolio" ? "" : LOCALE_PATHS[locale];
  return <>
    <a className={styles.skipLink} href={surface === "aigc" ? "#exhibitions" : surface === "agents" ? "#work" : "#ai-agent"}>{surface === "aigc" ? copy.gallery.skip : copy.ui.skip}</a>
    <header className={styles.header}>
      <a className={styles.wordmark} href={LOCALE_PATHS[locale]} aria-label={copy.nav.home}>
        <Image className={styles.brandMark} src="/brand/evan-logo.png" alt="" width={48} height={48} loading="eager" />
        <span>Evan Yang</span>
      </a>
      <nav aria-label={copy.nav.label}>
        <a href={surface === "portfolio" ? "#ai-agent" : surfacePath(locale, "agents")} aria-current={surface === "agents" ? "page" : undefined}>{copy.nav.work}</a>
        <a href={surface === "portfolio" ? "#aigc" : surfacePath(locale, "aigc")} aria-current={surface === "aigc" ? "page" : undefined}>{copy.nav.aigc}</a>
        <a href={`${home}#about`}>{copy.nav.about}</a>
      </nav>
      <div className={styles.headerActions}>
        <LanguageSelect locale={locale} label={copy.nav.language} surface={surface} />
        <a className={styles.pill} href={`${home}#contact`}>{copy.nav.contact}</a>
      </div>
    </header>
  </>;
}

export function SiteFooter({ locale, copy, surface = "portfolio" }: { locale: Locale; copy: PortfolioMessages; surface?: Surface }) {
  return <footer className={styles.footer}>
    <span>Evan Yang</span>
    <div className={styles.footerLinks}>
      {surface !== "portfolio" && <a href={LOCALE_PATHS[locale]}>{copy.gallery.back}<svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M20 12H5m6-6-6 6 6 6" /></svg></a>}
      <a href="https://evanyang.site/" target="_blank" rel="noopener noreferrer">{copy.footer.personal}<svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M6 18 18 6M6 6h12v12" /></svg></a>
    </div>
  </footer>;
}
