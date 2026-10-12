"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { PROJECTS, THEMES, type Project } from "@/content/projects";
import { LANGUAGE_NAMES, LANGUAGE_STORAGE_KEY, LOCALES, LOCALE_PATHS, isLocale, preferredLocale, type Locale } from "@/i18n/config";
import type { PortfolioMessages } from "@/i18n/messages";
import styles from "./portfolio.module.css";

const GENCHI_PATHS: Record<Locale, string> = {
  "zh-CN": "zh-Hans", "zh-TW": "zh-Hant", en: "en", ja: "ja",
};

function Arrow({ external = false }: { external?: boolean }) {
  return (
    <svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      {external ? <path d="M6 18 18 6M6 6h12v12" /> : <path d="M4 12h15m-6-6 6 6-6 6" />}
    </svg>
  );
}

function ProjectCover({ project, alt, featured = false, dialog = false }: {
  project: Project; alt: string; featured?: boolean; dialog?: boolean;
}) {
  return (
    <span className={`${styles.cover} ${featured ? styles.featuredCover : ""} ${dialog ? styles.dialogCover : ""}`}>
      <Image className={styles.preview} src={project.image} alt={alt} width={project.width} height={project.height} sizes={featured ? "(max-width: 700px) 80vw, 700px" : "(max-width: 700px) 80vw, 450px"} />
    </span>
  );
}

function LanguageSelect({ locale, label }: { locale: Locale; label: string }) {
  const router = useRouter();
  return (
    <span className={styles.languageSelect}>
      <select aria-label={label} value={locale} onChange={event => {
        const next = event.target.value;
        if (!isLocale(next) || next === locale) return;
        try { window.localStorage.setItem(LANGUAGE_STORAGE_KEY, next); } catch { /* URL choice works without storage. */ }
        router.push(`${LOCALE_PATHS[next]}${window.location.hash}`);
      }}>
        {LOCALES.map(language => <option key={language} value={language} lang={language}>{LANGUAGE_NAMES[language]}</option>)}
      </select>
      <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="m6 9 6 6 6-6" /></svg>
    </span>
  );
}

export default function Portfolio({ locale, copy, autoSelectLanguage = false }: {
  locale: Locale; copy: PortfolioMessages; autoSelectLanguage?: boolean;
}) {
  const [detail, setDetail] = useState<Project | null>(null);
  const router = useRouter();
  const close = useCallback(() => setDetail(null), []);
  const titleFor = (project: Project) => copy.projects[project.id].title;

  const renderTheme = (theme: (typeof THEMES)[number]) => (
    <section key={theme.id} id={`work-${theme.id}`} className={styles.theme} aria-labelledby={`theme-${theme.id}`}>
      <header className={styles.themeHeader}>
        <h2 id={`theme-${theme.id}`} lang="en">{theme.title}</h2>
        <p>{copy.themes[theme.id]}</p>
      </header>
      <div className={styles.projectGrid}>
        {PROJECTS.filter(project => project.theme === theme.id).map(project => (
          <article key={project.id}>
            <button type="button" className={styles.projectButton} data-project-id={project.id} aria-label={copy.ui.openProject.replace("{project}", titleFor(project))} aria-haspopup="dialog" onClick={() => setDetail(project)}>
              <ProjectCover project={project} alt={copy.ui.projectImage.replace("{project}", titleFor(project))} />
              <span className={styles.caption}>
                <span><span className={styles.projectTitle}>{titleFor(project)}</span><span className={styles.projectSummary}>{copy.projects[project.id].summary}</span></span>
                <Arrow />
              </span>
            </button>
          </article>
        ))}
      </div>
    </section>
  );

  useEffect(() => {
    if (!autoSelectLanguage) return;
    const query = new URLSearchParams(window.location.search).get("lang");
    let saved: string | null = null;
    try { saved = window.localStorage.getItem(LANGUAGE_STORAGE_KEY); } catch { /* Optional preference storage. */ }
    const languages = navigator.languages?.length ? navigator.languages : [navigator.language];
    const next = preferredLocale(query, saved, languages);
    if (next !== locale) router.replace(`${LOCALE_PATHS[next]}${window.location.hash}`);
  }, [locale, autoSelectLanguage, router]);

  return (
    <div className={styles.root}>
      <a className={styles.skipLink} href="#work">{copy.ui.skip}</a>
      <header className={styles.header}>
        <a className={styles.wordmark} href={LOCALE_PATHS[locale]} aria-label={copy.nav.home}>
          <Image className={styles.brandMark} src="/brand/evan-logo.png" alt="" width={48} height={48} loading="eager" />
          <span>Evan Yang</span>
        </a>
        <nav aria-label={copy.nav.label}><a href="#work">{copy.nav.work}</a><a href="#about">{copy.nav.about}</a></nav>
        <div className={styles.headerActions}>
          <LanguageSelect locale={locale} label={copy.nav.language} />
          <a className={styles.pill} href="#contact">{copy.nav.contact}</a>
        </div>
      </header>

      <main>
        <section className={styles.hero} aria-labelledby="portfolio-title">
          <h1 id="portfolio-title">{copy.hero.lead}<span>{copy.hero.emphasis}</span></h1>
          <p>{copy.hero.intro}</p>
          <a className={styles.pill} href="#work">{copy.hero.action}<Arrow external /></a>
        </section>

        <section id="work" className={styles.work} aria-label={copy.nav.work}>
          {renderTheme(THEMES[0])}
          <div className={styles.secondaryThemes}>
            {THEMES.slice(1).map(renderTheme)}
          </div>
        </section>

        <section id="about" className={styles.textSection} aria-labelledby="about-title">
          <h2 id="about-title">{copy.about.title}</h2>
          <div className={styles.aboutCopy}>{copy.about.paragraphs.map(paragraph => <p key={paragraph}>{paragraph}</p>)}</div>
        </section>

        <section id="contact" className={styles.contactSection} aria-labelledby="contact-title">
          <h2 id="contact-title">{copy.contact.title}</h2>
          <p>{copy.contact.description}</p>
          <a className={styles.pill} href="mailto:yqh611@gmail.com">{copy.contact.action}<Arrow external /></a>
          <a className={styles.email} href="mailto:yqh611@gmail.com">yqh611@gmail.com</a>
        </section>
      </main>
      <footer className={styles.footer}>
        <span>Evan Yang</span><a href="https://evanyang.site/" target="_blank" rel="noopener noreferrer">{copy.footer.personal}<Arrow external /></a>
      </footer>

      {detail && (
        <DetailDialog title={titleFor(detail)} closeLabel={copy.ui.close} onClose={close}>
          <h2 id="detail-title" className={styles.detailTitle}>{titleFor(detail)}</h2>
          <p className={styles.detailSummary}>{copy.projects[detail.id].summary}</p>
          <ProjectCover project={detail} dialog alt={copy.ui.projectImage.replace("{project}", titleFor(detail))} />
          <div className={styles.projectDetails}>
            <section><h3>{copy.ui.background}</h3><p>{copy.projects[detail.id].background}</p></section>
            <section><h3>{copy.ui.features}</h3><ul>{copy.projects[detail.id].features.map(feature => <li key={feature}>{feature}</li>)}</ul></section>
            <section><h3>{copy.ui.approach}</h3><p>{copy.projects[detail.id].approach}</p></section>
            <nav aria-label={copy.ui.links.replace("{project}", titleFor(detail))} className={styles.projectLinks}>
              {detail.links.map((link, index) => (
                <a key={link.id} className={styles.pill} href={detail.id === "genchi" ? `https://genchi.news/${GENCHI_PATHS[locale]}` : detail.id === "forearena" ? `${link.href}${locale.startsWith("zh") ? "zh" : "en"}` : link.href} target="_blank" rel="noopener noreferrer">
                  {copy.projects[detail.id].linkLabels[index]}<Arrow external />
                </a>
              ))}
            </nav>
          </div>
        </DetailDialog>
      )}
    </div>
  );
}

function DetailDialog({ title, closeLabel, onClose, children }: {
  title: string; closeLabel: string; onClose: () => void; children: ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    const previousFocus = document.activeElement;
    const htmlOverflow = document.documentElement.style.overflow;
    const bodyOverflow = document.body.style.overflow;
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    dialog.showModal();
    return () => {
      dialog.close();
      document.documentElement.style.overflow = htmlOverflow;
      document.body.style.overflow = bodyOverflow;
      if (previousFocus instanceof HTMLElement) previousFocus.focus({ preventScroll: true });
    };
  }, []);

  return (
    <dialog ref={ref} className={styles.dialog} aria-labelledby="detail-title" onCancel={event => { event.preventDefault(); onClose(); }} onClick={event => {
      if (event.target !== event.currentTarget) return;
      const rect = event.currentTarget.getBoundingClientRect();
      if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) onClose();
    }}>
      <div className={styles.dialogBar}>
        <span>{title}</span>
        <button type="button" autoFocus aria-label={closeLabel} onClick={onClose}>
          <svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="m6 6 12 12M18 6 6 18" /></svg>
        </button>
      </div>
      <div className={styles.dialogBody}>{children}</div>
    </dialog>
  );
}
