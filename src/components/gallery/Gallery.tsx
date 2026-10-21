"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { AIGC_ARTWORKS, AIGC_CATEGORIES, type AigcArtwork, type AigcCategory } from "@/content/aigc";
import type { Locale } from "@/i18n/config";
import type { PortfolioMessages } from "@/i18n/messages";
import { SiteHeader, SiteFooter, usePreferredLanguage } from "@/components/portfolio/SiteChrome";
import site from "@/components/portfolio/portfolio.module.css";
import styles from "./gallery.module.css";

type ImageArtwork = Extract<AigcArtwork, { kind: "images" }>;

export function EmptyExhibit({ kind, copy }: { kind: AigcCategory; copy: PortfolioMessages["gallery"] }) {
  return <div className={`${styles.emptyWall} ${styles[kind]}`} data-empty-exhibit={kind}>
    <div className={styles.mounts} aria-hidden="true">
      {kind === "images" ? <><span /><span /><span /></> : <span />}
    </div>
    <p>{copy.empty}</p>
  </div>;
}

function Artwork({ work, locale, copy, onOpen }: { work: AigcArtwork; locale: Locale; copy: PortfolioMessages["gallery"]; onOpen: (work: ImageArtwork) => void }) {
  return <figure className={styles.artwork} data-artwork-id={work.id}>
    <div className={styles.artworkMedia}>
      {work.kind === "images" && <button type="button" className={styles.imageButton} aria-label={copy.openImage.replace("{description}", work.alt[locale])} aria-haspopup="dialog" onClick={() => onOpen(work)}>
        <Image src={work.src} width={work.width} height={work.height} alt={work.alt[locale]} sizes="(max-width: 700px) 90vw, 1000px" />
      </button>}
      {work.kind === "videos" && <video controls playsInline preload="metadata" poster={work.poster} aria-label={work.title[locale]}><source src={work.src} /><a href={work.src}>{copy.download}</a></video>}
      {work.kind === "music" && <>
        {work.cover && <Image className={styles.albumCover} src={work.cover.src} width={work.cover.width} height={work.cover.height} alt={work.cover.alt[locale]} sizes="(max-width: 700px) 60vw, 240px" />}
        <audio controls preload="none" aria-label={work.title[locale]}><source src={work.src} /><a href={work.src}>{copy.download}</a></audio>
      </>}
    </div>
    {(work.kind !== "images" || work.year || work.tool || work.description) && <figcaption>{work.kind !== "images" && <h3>{work.title[locale]}</h3>}{(work.year || work.tool) && <p>{[work.year, work.tool].filter(Boolean).join(" · ")}</p>}{work.description && <p>{work.description[locale]}</p>}</figcaption>}
  </figure>;
}

export default function Gallery({ locale, copy, autoSelectLanguage = false }: { locale: Locale; copy: PortfolioMessages; autoSelectLanguage?: boolean }) {
  const [selectedImage, setSelectedImage] = useState<ImageArtwork | null>(null);
  const closeImage = useCallback(() => setSelectedImage(null), []);
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
            {works.length ? <div className={styles.artworks}>{works.map(work => <Artwork key={work.id} work={work} locale={locale} copy={copy.gallery} onOpen={setSelectedImage} />)}</div> : <EmptyExhibit kind={kind} copy={copy.gallery} />}
          </section>;
        })}
      </div>
    </main>
    <SiteFooter locale={locale} copy={copy} surface="aigc" />
    {selectedImage && <ImageLightbox work={selectedImage} locale={locale} copy={copy.gallery} onClose={closeImage} />}
  </div>;
}

function ImageLightbox({ work, locale, copy, onClose }: { work: ImageArtwork; locale: Locale; copy: PortfolioMessages["gallery"]; onClose: () => void }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const [zoomed, setZoomed] = useState(false);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const previousFocus = document.activeElement;
    const htmlOverflow = document.documentElement.style.overflow;
    const bodyOverflow = document.body.style.overflow;
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    dialog.showModal();
    closeRef.current?.focus();
    return () => {
      dialog.close();
      document.documentElement.style.overflow = htmlOverflow;
      document.body.style.overflow = bodyOverflow;
      if (previousFocus instanceof HTMLElement) previousFocus.focus({ preventScroll: true });
    };
  }, []);

  return <dialog ref={dialogRef} className={styles.lightbox} aria-label={copy.imageViewer} aria-modal="true" onCancel={event => { event.preventDefault(); onClose(); }} onKeyDown={event => {
    if (event.key !== "Tab") return;
    const controls = event.currentTarget.querySelectorAll<HTMLElement>('button:not(:disabled), [tabindex="0"]');
    const first = controls[0];
    const last = controls[controls.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
    if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
  }} onClick={event => {
    if (event.target !== event.currentTarget) return;
    const rect = event.currentTarget.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) onClose();
  }}>
    <div className={styles.lightboxControls}>
      <button type="button" aria-label={zoomed ? copy.zoomOut : copy.zoomIn} aria-pressed={zoomed} onClick={() => setZoomed(current => !current)}>
        <svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><circle cx="10" cy="10" r="6" /><path d="m15 15 5 5M7 10h6" />{!zoomed && <path d="M10 7v6" />}</svg>
      </button>
      <button ref={closeRef} type="button" autoFocus aria-label={copy.closeImage} onClick={onClose}>
        <svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="m6 6 12 12M18 6 6 18" /></svg>
      </button>
    </div>
    <div className={styles.lightboxViewport} data-zoomed={zoomed} tabIndex={zoomed ? 0 : undefined} role={zoomed ? "region" : undefined} aria-label={zoomed ? copy.imageViewer : undefined}>
      <Image src={work.src} width={work.width} height={work.height} alt={work.alt[locale]} sizes="100vw" loading="eager" />
    </div>
  </dialog>;
}
