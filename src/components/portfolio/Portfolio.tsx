"use client";

import Image from "next/image";
import { PROJECTS } from "@/content/projects";
import { AIGC_ARTWORKS, AIGC_CATEGORIES } from "@/content/aigc";
import { surfacePath, type Locale } from "@/i18n/config";
import type { PortfolioMessages } from "@/i18n/messages";
import { EmptyExhibit } from "@/components/gallery/Gallery";
import { SiteHeader, SiteFooter, usePreferredLanguage } from "./SiteChrome";
import PreviewStrip from "./PreviewStrip";
import styles from "./portfolio.module.css";

function Arrow() {
  return <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 12h15m-6-6 6 6-6 6" /></svg>;
}

export default function Portfolio({ locale, copy, autoSelectLanguage = false }: { locale: Locale; copy: PortfolioMessages; autoSelectLanguage?: boolean }) {
  usePreferredLanguage(locale, autoSelectLanguage);
  return <div className={styles.root}>
    <SiteHeader locale={locale} copy={copy} />
    <main>
      <section className={styles.hero} aria-labelledby="portfolio-title">
        <h1 id="portfolio-title">{copy.hero.lead}<span>{copy.hero.emphasis}</span></h1>
        <p>{copy.hero.intro}</p>
        <a className={styles.pill} href="#ai-agent">{copy.hero.action}<Arrow /></a>
      </section>
      <div id="work" className={styles.previewIndex}>
        <PreviewStrip id="ai-agent" title="AI Agent" description={copy.agents.preview} href={surfacePath(locale, "agents")} copy={copy}>
          {PROJECTS.map(project => <article key={project.id} data-project-preview={project.id}>
            <a className={styles.previewCard} href={`${surfacePath(locale, "agents")}#work-${project.theme}`} aria-label={copy.ui.openProject.replace("{project}", copy.projects[project.id].title)}>
              <span className={styles.cover}><Image className={styles.preview} src={project.image} width={project.width} height={project.height} alt={copy.ui.projectImage.replace("{project}",copy.projects[project.id].title)} sizes="(max-width: 700px) 80vw, 450px" /></span>
              <span className={styles.stripCaption}><span className={styles.stripTitle}>{copy.projects[project.id].title}</span><span className={styles.projectSummary}>{copy.projects[project.id].summary}</span></span>
            </a>
          </article>)}
        </PreviewStrip>
      </div>
      <PreviewStrip id="aigc" title="AIGC" description={copy.gallery.preview} href={surfacePath(locale, "aigc")} copy={copy}>
        {AIGC_ARTWORKS.length ? AIGC_ARTWORKS.map(work => {
          const preview = work.kind === "images" ? work.src : work.kind === "videos" ? work.poster : work.cover?.src;
          const alt = work.kind === "images" ? work.alt[locale] : work.kind === "music" && work.cover ? work.cover.alt[locale] : work.title[locale];
          return <article key={work.id}>
            <a className={styles.previewCard} href={`${surfacePath(locale, "aigc")}#${work.kind}`}>
              <span className={styles.aigcPreviewWall}>{preview ? <Image className={styles.aigcPreviewImage} src={preview} fill alt={alt} sizes="(max-width: 700px) 80vw, 450px" /> : <span>{copy.gallery.categories[work.kind].title}</span>}</span>
              <span className={styles.stripCaption}><span className={styles.stripTitle}>{work.title[locale]}</span></span>
            </a>
          </article>;
        }) : AIGC_CATEGORIES.map(kind => <article key={kind} data-category-preview={kind}>
          <div className={styles.aigcPreviewWall}><EmptyExhibit kind={kind} copy={copy.gallery} /></div>
          <div className={styles.stripCaption}><h3 className={styles.stripTitle}>{copy.gallery.categories[kind].title}</h3></div>
        </article>)}
      </PreviewStrip>
      <section id="about" className={styles.textSection} aria-labelledby="about-title">
        <h2 id="about-title">{copy.about.title}</h2>
        <div className={styles.aboutCopy}>{copy.about.paragraphs.map(paragraph => <p key={paragraph}>{paragraph}</p>)}</div>
      </section>
      <section id="contact" className={styles.contactSection} aria-labelledby="contact-title">
        <h2 id="contact-title">{copy.contact.title}</h2><p>{copy.contact.description}</p>
        <a className={styles.pill} href="mailto:yqh611@gmail.com">{copy.contact.action}<Arrow /></a>
        <a className={styles.email} href="mailto:yqh611@gmail.com">yqh611@gmail.com</a>
      </section>
    </main>
    <SiteFooter locale={locale} copy={copy} />
  </div>;
}
