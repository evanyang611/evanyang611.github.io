"use client";

import { AnimatePresence, motion, type PanInfo } from "framer-motion";
import Image from "next/image";
import { useEffect, useRef, useState, useSyncExternalStore, type WheelEvent as ReactWheelEvent } from "react";
import { GAMES, type GameMeta } from "@/content/game.generated";
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

const PLATFORMS = ["PlayStation", "Switch", "PC", "Phone"] as const;
type Platform = (typeof PLATFORMS)[number];

const GAME_PLATFORMS: Record<number, Platform> = {
  146598: "PlayStation",
  482314: "Phone",
  137458: "PlayStation",
  390508: "PlayStation",
  112339: "PlayStation",
  62229: "Switch",
  290114: "Switch",
  234026: "PC",
  477760: "PC",
  113290: "PC",
};


function formatReleasePlatform(platform: string) {
  if (platform === "Nintendo Switch 2") return "NS2";
  if (platform === "Nintendo Switch") return "NS";
  if (platform === "Microsoft Windows" || platform === "Windows") return "PC";
  return platform;
}

const slide = {
  enter: (direction: number) => ({ opacity: 0, x: direction > 0 ? 80 : -80 }),
  center: { opacity: 1, x: 0 },
  exit: (direction: number) => ({ opacity: 0, x: direction > 0 ? -80 : 80 }),
};

let rememberedPlatformIndex = 0;
const platformListeners = new Set<() => void>();

function subscribeToPlatform(listener: () => void) {
  platformListeners.add(listener);
  return () => platformListeners.delete(listener);
}

function getRememberedPlatformIndex() {
  return rememberedPlatformIndex;
}

function setRememberedPlatformIndex(nextIndex: number) {
  rememberedPlatformIndex = nextIndex;
  platformListeners.forEach((listener) => listener());
}

export default function GamePage() {
  const { messages } = useLocale();
  const catalog = useCatalog();
  const entries = GAMES.map((entry) => ({ ...entry, ...catalog.game[entry.id] }));
  const [active, setActive] = useState<GameMeta | null>(null);
  const platformIndex = useSyncExternalStore(
    subscribeToPlatform,
    getRememberedPlatformIndex,
    () => 0,
  );
  const [direction, setDirection] = useState(1);
  const wheelLockedRef = useRef(false);
  const wheelTimerRef = useRef<number | null>(null);
  const platform = PLATFORMS[platformIndex];
  const games = entries.filter((game) => GAME_PLATFORMS[game.id] === platform);

  const goToPlatform = (nextIndex: number) => {
    if (nextIndex < 0 || nextIndex >= PLATFORMS.length || nextIndex === platformIndex) return;
    setDirection(nextIndex > platformIndex ? 1 : -1);
    setRememberedPlatformIndex(nextIndex);
  };

  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (info.offset.x < -60) goToPlatform(platformIndex + 1);
    if (info.offset.x > 60) goToPlatform(platformIndex - 1);
  };

  const handleHorizontalWheel = (event: ReactWheelEvent<HTMLDivElement>) => {
    if (Math.abs(event.deltaX) < 24 || Math.abs(event.deltaX) <= Math.abs(event.deltaY)) return;

    event.preventDefault();
    event.stopPropagation();
    if (wheelLockedRef.current) return;

    wheelLockedRef.current = true;
    goToPlatform(platformIndex + (event.deltaX > 0 ? 1 : -1));
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
    <PageLayout page="games" compactMobile>
      <div className="flex w-full max-w-4xl flex-col">
        <div className="mb-4 flex items-center justify-between gap-2 border-b border-[var(--ink-rule)] sm:mb-7">
          <div className="flex min-w-0 flex-1 overflow-x-auto pr-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" role="tablist" aria-label={messages.common.platforms}>
            {PLATFORMS.map((option, index) => (
              <button
                key={option}
                type="button"
                role="tab"
                aria-selected={platform === option}
                onClick={() => goToPlatform(index)}
                className={`mono relative shrink-0 px-3 py-3 text-[12px] tracking-[0.1em] transition-colors first:pl-0 sm:px-4 ${
                  platform === option
                    ? "text-[var(--sky-deep)]"
                    : "text-[var(--foreground-faint)] hover:text-[var(--foreground)]"
                }`}
              >
                {option === "Phone" ? messages.common.phone : option}
                {platform === option && (
                  <motion.span
                    layoutId="game-platform-indicator"
                    className="absolute inset-x-0 -bottom-px h-px bg-[var(--sky-deep)]"
                  />
                )}
              </button>
            ))}
          </div>

          <div className="hidden shrink-0 items-center gap-1 sm:flex">
            <button
              type="button"
              aria-label={messages.common.previousPlatform}
              disabled={platformIndex === 0}
              onClick={() => goToPlatform(platformIndex - 1)}
              className="grid h-9 w-9 place-items-center text-xl text-[var(--foreground-soft)] transition-colors hover:text-[var(--sky-deep)] disabled:cursor-default disabled:opacity-25"
            >
              ‹
            </button>
            <button
              type="button"
              aria-label={messages.common.nextPlatform}
              disabled={platformIndex === PLATFORMS.length - 1}
              onClick={() => goToPlatform(platformIndex + 1)}
              className="grid h-9 w-9 place-items-center text-xl text-[var(--foreground-soft)] transition-colors hover:text-[var(--sky-deep)] disabled:cursor-default disabled:opacity-25"
            >
              ›
            </button>
          </div>
        </div>

        <div className="min-h-[320px] overflow-hidden sm:min-h-[420px]">
          <AnimatePresence mode="wait" custom={direction} initial={false}>
            <motion.div
              key={platform}
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
              {games.length > 0 ? (
                <motion.ul
                  variants={stagger}
                  initial="hidden"
                  animate="show"
                  className="grid w-full grid-cols-1 gap-4 lg:grid-cols-2"
                >
                  {games.map((game) => {
                    const releasePlatforms = game.releasePlatforms ?? [];
                    return (
                      <motion.li key={game.id} variants={item}>
                        <button
                          type="button"
                          data-recommendation-id={game.id}
                        onClick={() => setActive(game)}
                          className="group grid min-h-52 w-full grid-cols-[96px_1fr] gap-4 rounded-md border border-[var(--ink-rule)] bg-white/45 p-4 text-left transition-colors hover:border-[var(--rule)] hover:bg-[var(--paper)]/55 sm:grid-cols-[112px_1fr]"
                        >
                          <div className="relative aspect-[2/3] w-24 self-start overflow-hidden rounded-md bg-[var(--sky-soft)] ring-1 ring-[var(--ink-rule)] sm:w-28">
                            <Image
                              src={game.poster}
                              alt={game.title}
                              fill
                              sizes="(min-width: 640px) 112px, 96px"
                              className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                            />
                          </div>
                          <div className="flex min-w-0 flex-col py-1">
                            <div className="line-clamp-2 font-serif text-base text-[var(--foreground)] transition-colors group-hover:text-[var(--sky-deep)] lg:text-lg">
                              {game.title}
                            </div>
                            <div className="mono mt-1 text-[10px] tracking-[0.16em] text-[var(--foreground-faint)]">
                              <span>{game.year ?? "—"}</span>
                              {releasePlatforms.length > 0 && (
                                <>
                                  <span className="mx-2 text-[var(--ink-rule)]">·</span>
                                  <span>{releasePlatforms.map(formatReleasePlatform).join(" / ")}</span>
                                </>
                              )}
                            </div>
                            <div className="mt-4 border-t border-[var(--ink-rule)] pt-3">
                              <div className="mono text-[10px] tracking-[0.18em] text-[var(--sky-deep)]">
                                {messages.common.myNote}
                              </div>
                              <p className="mt-2 font-serif text-[14px] leading-6 text-[var(--foreground-soft)]">
                                {game.note ?? messages.common.notePending}
                              </p>
                            </div>
                          </div>
                        </button>
                      </motion.li>
                    );
                  })}
                </motion.ul>
              ) : (
                <div className="flex min-h-[360px] items-center justify-center text-center">
                  <div>
                    <div className="font-serif text-4xl text-[var(--sky)]/70">{platform === "Phone" ? messages.common.phone : platform}</div>
                    <p className="mt-4 font-serif text-base text-[var(--foreground-faint)]">
                      {messages.common.comingSoon}
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
          <GameModal
            game={{ ...active, ...catalog.game[active.id] }}
            note={catalog.game[active.id].note}
            onClose={() => setActive(null)}
          />
        )}
      </AnimatePresence>
    </PageLayout>
  );
}

function GameModal({ game, note, onClose }: { game: GameMeta; note?: string; onClose: () => void }) {
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
        aria-labelledby={`game-${game.id}-title`}
        initial={{ opacity: 0, y: 80, scale: 0.88 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 60, scale: 0.9 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] as const }}
        className="relative grid h-[calc(100dvh-8rem)] max-h-[88vh] w-full max-w-6xl grid-cols-1 overflow-hidden rounded-lg bg-[var(--background)] shadow-[0_30px_80px_-30px_rgba(15,30,50,0.45)] md:grid-cols-[minmax(420px,46%)_1fr]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative hidden h-full bg-[var(--sky-soft)] md:block">
          <Image
            src={game.poster}
            alt={game.title}
            fill
            sizes="(min-width: 1280px) 530px, 46vw"
            className="object-contain"
          />
        </div>

        <div className="flex h-full min-h-0 flex-col gap-5 overflow-y-auto p-8 lg:p-10">
          <div>
            <h3
              id={`game-${game.id}-title`}
              className="font-serif text-3xl font-semibold leading-tight tracking-tight lg:text-4xl"
              style={{
                backgroundImage:
                  "linear-gradient(135deg, #2563eb 0%, #7ab8e0 60%, #b8d6ec 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              {game.title}
            </h3>
            {game.titleOriginal !== game.title && (
              <div className="mt-1 font-serif text-sm tracking-wide text-[var(--foreground-faint)]">
                {game.titleOriginal}
              </div>
            )}
          </div>

          <div className="mono flex flex-wrap gap-x-6 gap-y-1 text-[11px] uppercase tracking-[0.22em] text-[var(--foreground-faint)]">
            {game.year && <span>{game.year}</span>}
            {game.score != null && <span>★ {game.score.toFixed(1)}</span>}
            <a
              href={game.bgmUrl}
              target="_blank"
              rel="noreferrer"
              className="text-[var(--sky-deep)] transition-colors hover:text-[var(--foreground)]"
            >
              {game.sourceName ?? "Bangumi"} ↗
            </a>
          </div>

          {game.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {game.tags.map((t) => (
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
            {game.summary}
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
