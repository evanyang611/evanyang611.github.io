"use client";

import Image from "next/image";
import { AIGC_ARTWORKS, AIGC_CATEGORIES, type AigcArtwork, type AigcCategory } from "@/content/aigc";
import type { Locale } from "@/i18n/config";
import type { PortfolioMessages } from "@/i18n/messages";
import { SiteHeader, SiteFooter, usePreferredLanguage } from "@/components/portfolio/SiteChrome";
import site from "@/components/portfolio/portfolio.module.css";
import styles from "./gallery.module.css";

export function EmptyExhibit({ kind, copy }: { kind: AigcCategory; copy: PortfolioMessages["gallery"] }) {
  return <div className={`${styles.emptyWall} ${styles[kind]}`} data-empty-exhibit={kind}>
    <div className={styles.mounts} aria-hidden="true">
      {kind === "images" ? <><span /><span /><span /></> : <span />}
    </div>
    <p>{copy.empty}</p>
  </div>;
}

function Artwork({ work, locale, fallback }: { work: AigcArtwork; locale: Locale; fallback: string }) {
  return <figure className={styles.artwork} data-artwork-id={work.id}>
    <div className={styles.artworkMedia}>
      {work.kind === "images" && <Image src={work.src} width={work.width} height={work.height} alt={work.alt[locale]} sizes="(max-width: 700px) 90vw, 1000px" />}
      {work.kind === "videos" && <video controls playsInline preload="metadata" poster={work.poster} aria-label={work.title[locale]}><source src={work.src} /><a href={work.src}>{fallback}</a></video>}
      {work.kind === "music" && <>
        {work.cover && <Image className={styles.albumCover} src={work.cover.src} width={work.cover.width} height={work.cover.height} alt={work.cover.alt[locale]} sizes="(max-width: 700px) 60vw, 240px" />}
        <audio controls preload="none" aria-label={work.title[locale]}><source src={work.src} /><a href={work.src}>{fallback}</a></audio>
      </>}
    </div>
    {(work.kind !== "images" || work.year || work.tool || work.description) && <figcaption>{work.kind !== "images" && <h3>{work.title[locale]}</h3>}{(work.year || work.tool) && <p>{[work.year, work.tool].filter(Boolean).join(" · ")}</p>}{work.description && <p>{work.description[locale]}</p>}</figcaption>}
  </figure>;
}

export default function Gallery({ locale, copy, autoSelectLanguage = false }: { locale: Locale; copy: PortfolioMessages; autoSelectLanguage?: boolean }) {
  usePreferredLanguage(locale, autoSelectLanguage, "aigc");
  return <div className={site.root}>
    <SiteHeader locale={locale} copy={copy} surface="aigc" />
    <main className={styles.gallery}>
      <header className={styles.intro}>
        <h1>{copy.gallery.title}</h1>
        <p>{copy.gallery.intro}</p>
      </header>
      <nav className={styles.categoryNav} aria-label={copy.gallery.navigation}>
        {AIGC_CATEGORIES.map(kind => <a key={kind} href={`#${kind}`}>{copy.gallery.categories[kind].title}</a>)}
      </nav>
      <div id="exhibitions" className={styles.exhibitions}>
        {AIGC_CATEGORIES.map(kind => {
          const works = AIGC_ARTWORKS.filter(work => work.kind === kind);
          return <section key={kind} id={kind} className={styles.room} aria-labelledby={`room-${kind}`}>
            <header className={styles.roomHeader}><h2 id={`room-${kind}`}>{copy.gallery.categories[kind].title}</h2><p>{copy.gallery.categories[kind].description}</p></header>
            {works.length ? <div className={styles.artworks}>{works.map(work => <Artwork key={work.id} work={work} locale={locale} fallback={copy.gallery.download} />)}</div> : <EmptyExhibit kind={kind} copy={copy.gallery} />}
          </section>;
        })}
      </div>
    </main>
    <SiteFooter locale={locale} copy={copy} surface="aigc" />
  </div>;
}
