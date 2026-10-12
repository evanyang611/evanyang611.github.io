"use client";

import { AnimatePresence, motion, type PanInfo } from "framer-motion";
import Image from "next/image";
import { useEffect, useRef, useState, useSyncExternalStore, type WheelEvent as ReactWheelEvent } from "react";
import { ANIME, type AnimeMeta } from "@/content/anime.generated";
import PageLayout from "../deck/PageLayout";
import { useLocale } from "@/i18n/LocaleProvider";
import { useCatalog } from "@/i18n/useCatalog";

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06, delayChildren: 0.12 } },
};
const item = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const } },
};

const YEARS = [2026, 2025, 2024, 2023, "2022+"] as const;
const slide = {
  enter: (direction: number) => ({ opacity: 0, x: direction > 0 ? 80 : -80 }),
  center: { opacity: 1, x: 0 },
  exit: (direction: number) => ({ opacity: 0, x: direction > 0 ? -80 : 80 }),
};

let rememberedYearIndex = 0;
const yearListeners = new Set<() => void>();

function subscribeToYear(listener: () => void) {
  yearListeners.add(listener);
  return () => yearListeners.delete(listener);
}

function getRememberedYearIndex() {
  return rememberedYearIndex;
}

function setRememberedYearIndex(nextIndex: number) {
  rememberedYearIndex = nextIndex;
  yearListeners.forEach((listener) => listener());
}

export default function AnimePage() {
  const { messages } = useLocale();
  const catalog = useCatalog();
  const entries = ANIME.map((entry) => ({ ...entry, ...catalog.anime[entry.id] }));
  const [active, setActive] = useState<AnimeMeta | null>(null);
  const yearIndex = useSyncExternalStore(subscribeToYear, getRememberedYearIndex, () => 0);
  const [direction, setDirection] = useState(1);
  const wheelLockedRef = useRef(false);
  const wheelTimerRef = useRef<number | null>(null);
  const year = YEARS[yearIndex];
  const recommendations =
    typeof year === "number" ? entries.filter((anime) => anime.year === year) : [];

  const goToYear = (nextIndex: number) => {
    if (nextIndex < 0 || nextIndex >= YEARS.length || nextIndex === yearIndex) return;
    setDirection(nextIndex > yearIndex ? 1 : -1);
    setRememberedYearIndex(nextIndex);
  };

  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (info.offset.x < -60) goToYear(yearIndex + 1);
    if (info.offset.x > 60) goToYear(yearIndex - 1);
  };

  const handleHorizontalWheel = (event: ReactWheelEvent<HTMLDivElement>) => {
    if (Math.abs(event.deltaX) < 24 || Math.abs(event.deltaX) <= Math.abs(event.deltaY)) return;

    event.preventDefault();
    event.stopPropagation();
    if (wheelLockedRef.current) return;

    wheelLockedRef.current = true;
    goToYear(yearIndex + (event.deltaX > 0 ? 1 : -1));
    if (wheelTimerRef.current != null) window.clearTimeout(wheelTimerRef.current);
    wheelTimerRef.current = window.setTimeout(() => {
      wheelLockedRef.current = false;
      wheelTimerRef.current = null;
    }, 500);
  };

  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setActive(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active]);

  useEffect(() => {
    return () => {
      if (wheelTimerRef.current != null) window.clearTimeout(wheelTimerRef.current);
    };
  }, []);

  return (
    <PageLayout page="anime" compactMobile>
      <div className="flex w-full max-w-4xl flex-col">
        <div className="mb-4 flex items-center justify-between gap-2 border-b border-[var(--ink-rule)] sm:mb-7">
          <div className="flex min-w-0 flex-1 overflow-x-auto pr-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" role="tablist" aria-label={messages.common.years}>
            {YEARS.map((option, index) => (
              <button
                key={option}
                type="button"
                role="tab"
                aria-selected={year === option}
                onClick={() => goToYear(index)}
                className={`mono relative shrink-0 px-3 py-3 text-[12px] tracking-[0.16em] transition-colors first:pl-0 sm:px-4 ${
                  year === option
                    ? "text-[var(--sky-deep)]"
                    : "text-[var(--foreground-faint)] hover:text-[var(--foreground)]"
                }`}
              >
                {option}
                {year === option && (
                  <motion.span
                    layoutId="anime-year-indicator"
                    className="absolute inset-x-0 -bottom-px h-px bg-[var(--sky-deep)] first:left-0"
                  />
                )}
              </button>
            ))}
          </div>

          <div className="hidden shrink-0 items-center gap-1 sm:flex">
            <button
              type="button"
              aria-label={messages.common.previousYear}
              disabled={yearIndex === 0}
              onClick={() => goToYear(yearIndex - 1)}
              className="grid h-9 w-9 place-items-center text-xl text-[var(--foreground-soft)] transition-colors hover:text-[var(--sky-deep)] disabled:cursor-default disabled:opacity-25"
            >
              ‹
            </button>
            <button
              type="button"
              aria-label={messages.common.nextYear}
              disabled={yearIndex === YEARS.length - 1}
              onClick={() => goToYear(yearIndex + 1)}
              className="grid h-9 w-9 place-items-center text-xl text-[var(--foreground-soft)] transition-colors hover:text-[var(--sky-deep)] disabled:cursor-default disabled:opacity-25"
            >
              ›
            </button>
          </div>
        </div>

        <div className="min-h-[320px] overflow-hidden sm:min-h-[420px]">
          <AnimatePresence mode="wait" custom={direction} initial={false}>
            <motion.div
              key={year}
              custom={direction}
              variants={slide}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.12}
              onDragEnd={handleDragEnd}
              onWheel={handleHorizontalWheel}
              data-horizontal-wheel
              className="min-h-[320px] cursor-grab active:cursor-grabbing sm:min-h-[420px]"
            >
              {recommendations.length > 0 ? (
                <motion.ul
                  variants={stagger}
                  initial="hidden"
                  animate="show"
                  className="grid w-full grid-cols-1 gap-4 lg:grid-cols-2"
                >
                  {recommendations.map((anime) => (
                    <motion.li key={anime.id} variants={item}>
                      <button
                        type="button"
                        data-recommendation-id={anime.id}
                        onClick={() => setActive(anime)}
                        className="group grid min-h-52 w-full grid-cols-[96px_1fr] gap-4 rounded-md border border-[var(--ink-rule)] bg-white/45 p-4 text-left transition-colors hover:border-[var(--rule)] hover:bg-[var(--paper)]/55 sm:grid-cols-[112px_1fr]"
                      >
                        <div className="relative aspect-[2/3] w-24 self-start overflow-hidden rounded-md bg-[var(--sky-soft)] ring-1 ring-[var(--ink-rule)] shadow-[0_4px_24px_-12px_rgba(61,122,168,0.4)] sm:w-28">
                          <Image
                            src={anime.poster}
                            alt={anime.title}
                            fill
                            sizes="(min-width: 640px) 112px, 96px"
                            className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                          />
                        </div>
                        <div className="flex min-w-0 flex-col self-stretch py-1">
                          <div className="line-clamp-2 font-serif text-base text-[var(--foreground)] transition-colors group-hover:text-[var(--sky-deep)] lg:text-lg">
                            {anime.title}
                          </div>
                          <div className="mono mt-1 text-[10px] tracking-[0.16em] text-[var(--foreground-faint)]">
                            {anime.year}
                          </div>
                          <div className="mt-4 border-t border-[var(--ink-rule)] pt-3">
                            <div className="mono text-[10px] tracking-[0.18em] text-[var(--sky-deep)]">
                              {messages.common.myNote}
                            </div>
                            <p className="mt-2 font-serif text-[14px] leading-6 text-[var(--foreground-soft)]">
                              {anime.note ?? messages.common.notePending}
                            </p>
                          </div>
                        </div>
                      </button>
                    </motion.li>
                  ))}
                </motion.ul>
              ) : (
                <div className="flex min-h-[360px] items-center justify-center text-center">
                  <div>
                    <div className="font-serif text-5xl text-[var(--sky)]/70">{year}</div>
                    <p className="mt-4 font-serif text-base text-[var(--foreground-faint)]">
                      {year === "2022+"
                        ? messages.common.comingSoon
                        : year === 2024
                          ? messages.common.comingSoon
                          : messages.common.empty}
                    </p>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <AnimatePresence>
        {active && (
          <AnimeModal
            anime={{ ...active, ...catalog.anime[active.id] }}
            note={catalog.anime[active.id].note}
            onClose={() => setActive(null)}
          />
        )}
      </AnimatePresence>
    </PageLayout>
  );
}

function AnimeModal({ anime, note, onClose }: { anime: AnimeMeta; note?: string; onClose: () => void }) {
  const { messages } = useLocale();
  useEffect(() => {
    document.body.dataset.modalOpen = "true";
    return () => {
      delete document.body.dataset.modalOpen;
    };
  }, []);
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] as const }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(15,30,50,0.55)] px-6 pb-6 pt-24 backdrop-blur-md"
      onClick={onClose}
    >
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-labelledby={`anime-${anime.id}-title`}
        initial={{ opacity: 0, y: 80, scale: 0.88 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 60, scale: 0.9 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] as const }}
        className="relative grid h-[calc(100dvh-8rem)] max-h-[88vh] w-full max-w-6xl grid-cols-1 overflow-hidden rounded-lg bg-[var(--background)] shadow-[0_30px_80px_-30px_rgba(15,30,50,0.45)] md:grid-cols-[minmax(420px,46%)_1fr]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative hidden h-full bg-[var(--sky-soft)] md:block">
          <Image
            src={anime.poster}
            alt={anime.title}
            fill
            sizes="(min-width: 1280px) 530px, 46vw"
            className="object-contain"
          />
        </div>

        <div className="flex h-full min-h-0 flex-col gap-5 overflow-y-auto p-8 lg:p-10">
          <div>
            <h3
              id={`anime-${anime.id}-title`}
              className="font-serif text-3xl font-semibold leading-tight tracking-tight lg:text-4xl"
              style={{
                backgroundImage:
                  "linear-gradient(135deg, #2563eb 0%, #7ab8e0 60%, #b8d6ec 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              {anime.title}
            </h3>
            {anime.titleOriginal !== anime.title && (
              <div className="mt-1 font-serif text-sm tracking-wide text-[var(--foreground-faint)]">
                {anime.titleOriginal}
              </div>
            )}
          </div>

          <div className="mono flex flex-wrap gap-x-6 gap-y-1 text-[11px] uppercase tracking-[0.22em] text-[var(--foreground-faint)]">
            {anime.year && <span>{anime.year}</span>}
            {anime.score != null && <span>★ {anime.score.toFixed(1)}</span>}
            <a
              href={anime.bgmUrl}
              target="_blank"
              rel="noreferrer"
              className="text-[var(--sky-deep)] transition-colors hover:text-[var(--foreground)]"
            >
              Bangumi ↗
            </a>
          </div>

          {anime.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {anime.tags.map((t) => (
                <span
                  key={t}
                  className="mono rounded-full border border-[var(--ink-rule)] px-3 py-[3px] text-[11px] text-[var(--foreground-soft)]"
                >
                  {t}
                </span>
              ))}
            </div>
          )}

          <p className="whitespace-pre-line font-serif text-[15px] leading-7 text-[var(--foreground-soft)] lg:text-base">
            {anime.summary}
          </p>

          {note && (
            <div className="border-l-2 border-[var(--sky)] pl-4 font-serif text-[15px] leading-7 italic text-[var(--foreground)] lg:text-base">
              {note}
            </div>
          )}
        </div>

        <button
          type="button"
          aria-label={messages.common.close}
          onClick={onClose}
          className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-[var(--background)]/80 text-[var(--foreground-soft)] backdrop-blur transition-colors hover:bg-[var(--sky-soft)] hover:text-[var(--foreground)]"
        >
          ×
        </button>
      </motion.div>
    </motion.div>
  );
}
