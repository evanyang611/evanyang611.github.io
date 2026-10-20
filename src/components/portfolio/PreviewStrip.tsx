"use client";

import { useCallback, useEffect, useId, useRef, useState, type ReactNode } from "react";
import type { PortfolioMessages } from "@/i18n/messages";
import styles from "./portfolio.module.css";

function ScrollArrow({ back = false }: { back?: boolean }) {
  return <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d={back ? "M20 12H5m6-6-6 6 6 6" : "M4 12h15m-6-6 6 6-6 6"} /></svg>;
}

export default function PreviewStrip({ id, title, description, href, copy, children }: { id: string; title: string; description: string; href: string; copy: PortfolioMessages; children: ReactNode }) {
  const track = useRef<HTMLDivElement>(null);
  const trackId = useId();
  const [ends, setEnds] = useState({ start: true, end: false });
  const updateEnds = useCallback(() => {
    const node = track.current;
    if (node) setEnds({ start: node.scrollLeft < 2, end: node.scrollLeft + node.clientWidth >= node.scrollWidth - 2 });
  }, []);
  useEffect(() => {
    const node = track.current;
    if (!node) return;
    const observer = new ResizeObserver(updateEnds);
    observer.observe(node);
    updateEnds();
    return () => observer.disconnect();
  }, [updateEnds]);
  const move = (direction: number) => {
    const node = track.current;
    if (!node) return;
    const step = (node.firstElementChild?.getBoundingClientRect().width ?? node.clientWidth) + 24;
    node.scrollBy({ left: step * direction, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
  };
  return <section id={id} className={styles.previewSection} aria-labelledby={`${id}-title`}>
    <header className={styles.stripHeader}>
      <div><h2 id={`${id}-title`} lang="en">{title}</h2><p>{description}</p></div>
      <a className={styles.enterLink} href={href} aria-label={copy.ui.enterSection.replace("{section}",title)}><span lang="en">Enter</span><ScrollArrow /></a>
    </header>
    <div ref={track} id={trackId} className={styles.previewTrack} tabIndex={0} role="region" aria-label={copy.ui.previewRegion.replace("{section}",title)} onScroll={updateEnds} onKeyDown={event => {
      if (event.target !== event.currentTarget || !["ArrowLeft", "ArrowRight"].includes(event.key)) return;
      event.preventDefault(); move(event.key === "ArrowLeft" ? -1 : 1);
    }}>{children}</div>
    <div className={styles.stripControls}>
      <p>{copy.ui.scrollHint}</p>
      <div>
        <button type="button" aria-label={copy.ui.previous.replace("{section}",title)} aria-controls={trackId} disabled={ends.start} onClick={() => move(-1)}><ScrollArrow back /></button>
        <button type="button" aria-label={copy.ui.next.replace("{section}",title)} aria-controls={trackId} disabled={ends.end} onClick={() => move(1)}><ScrollArrow /></button>
      </div>
    </div>
  </section>;
}
