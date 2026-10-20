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
  const [paused, setPaused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [visible, setVisible] = useState(false);
  const [pageVisible, setPageVisible] = useState(false);
  const [motionAllowed, setMotionAllowed] = useState(false);
  const direction = useRef(1);
  const running = motionAllowed && !paused && !hovered && !focused && visible && pageVisible && !(ends.start && ends.end);
  const updateEnds = useCallback(() => {
    const node = track.current;
    if (!node) return;
    const next = { start: node.scrollLeft < 2, end: node.scrollLeft + node.clientWidth >= node.scrollWidth - 2 };
    setEnds(current => current.start === next.start && current.end === next.end ? current : next);
  }, []);
  useEffect(() => {
    const node = track.current;
    if (!node) return;
    const observer = new ResizeObserver(updateEnds);
    observer.observe(node);
    updateEnds();
    return () => observer.disconnect();
  }, [updateEnds]);
  useEffect(() => {
    const node = track.current;
    if (!node) return;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updateMotion = () => setMotionAllowed(!motion.matches);
    const updatePage = () => setPageVisible(!document.hidden);
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting && entry.intersectionRatio >= .15), { threshold: .15 });
    observer.observe(node);
    updateMotion();
    updatePage();
    motion.addEventListener("change", updateMotion);
    document.addEventListener("visibilitychange", updatePage);
    return () => {
      observer.disconnect();
      motion.removeEventListener("change", updateMotion);
      document.removeEventListener("visibilitychange", updatePage);
    };
  }, []);
  useEffect(() => {
    const node = track.current;
    if (!node || !running) return;
    let frame = 0;
    let previous = 0;
    let restUntil = 0;
    // Retain subpixel progress even on displays where scrollLeft is rounded.
    let position = node.scrollLeft;
    const advance = (time: number) => {
      frame = requestAnimationFrame(advance);
      if (!previous) { previous = time; restUntil = time + 1000; return; }
      const elapsed = Math.min(time - previous, 50);
      previous = time;
      if (time < restUntil) return;
      const limit = node.scrollWidth - node.clientWidth;
      if (limit <= 0) return;
      position = Math.max(0, Math.min(limit, position + direction.current * 32 * elapsed / 1000));
      node.scrollLeft = position;
      if (position >= limit || position <= 0) {
        direction.current = position >= limit ? -1 : 1;
        restUntil = time + 1000;
      }
    };
    frame = requestAnimationFrame(advance);
    return () => cancelAnimationFrame(frame);
  }, [running]);
  const move = (direction: number) => {
    setPaused(true);
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
    <div ref={track} id={trackId} className={styles.previewTrack} data-auto-enabled={motionAllowed} data-auto-scroll={running ? "running" : "paused"} tabIndex={0} role="region" aria-label={copy.ui.previewRegion.replace("{section}",title)} onScroll={updateEnds} onPointerEnter={event => { if (event.pointerType !== "touch") setHovered(true); }} onPointerLeave={() => setHovered(false)} onPointerDown={() => setPaused(true)} onWheel={event => { if (event.deltaX || event.shiftKey) setPaused(true); }} onFocusCapture={() => setFocused(true)} onBlurCapture={event => { if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false); }} onKeyDown={event => {
      if (event.target !== event.currentTarget || !["ArrowLeft", "ArrowRight"].includes(event.key)) return;
      event.preventDefault(); move(event.key === "ArrowLeft" ? -1 : 1);
    }}>{children}</div>
    <div className={styles.stripControls}>
      <p>{copy.ui.scrollHint}</p>
      <div>
        <button type="button" aria-label={!motionAllowed ? copy.ui.reducedMotion : (paused ? copy.ui.resumeScroll : copy.ui.pauseScroll).replace("{section}",title)} aria-controls={trackId} disabled={!motionAllowed} onClick={() => setPaused(current => !current)}>
          <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">{paused || !motionAllowed ? <path d="m9 5 11 7-11 7Z" /> : <path d="M8 5v14M16 5v14" />}</svg>
        </button>
        <button type="button" aria-label={copy.ui.previous.replace("{section}",title)} aria-controls={trackId} disabled={ends.start} onClick={() => move(-1)}><ScrollArrow back /></button>
        <button type="button" aria-label={copy.ui.next.replace("{section}",title)} aria-controls={trackId} disabled={ends.end} onClick={() => move(1)}><ScrollArrow /></button>
      </div>
    </div>
  </section>;
}
