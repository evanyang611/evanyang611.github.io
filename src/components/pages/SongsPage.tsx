"use client";

import { motion } from "framer-motion";
import { useMemo } from "react";
import { SONGS, type SongEntry } from "@/content/songs";
import { usePlayer } from "../songs/PlayerProvider";
import PageLayout from "../deck/PageLayout";
import { useLocale } from "@/i18n/LocaleProvider";

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05, delayChildren: 0.12 } },
};
const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const } },
};

function groupByArtist(songs: SongEntry[]) {
  const map = new Map<string, SongEntry[]>();
  for (const s of songs) {
    const list = map.get(s.artist) ?? [];
    list.push(s);
    map.set(s.artist, list);
  }
  return Array.from(map.entries());
}

export default function SongsPage() {
  const { messages } = useLocale();
  const groups = useMemo(() => groupByArtist(SONGS), []);
  const { play, playAll, current, playing, toggle } = usePlayer();

  return (
    <PageLayout page="songs">
      <p className="mb-5 font-serif text-[12px] text-[var(--foreground-faint)] sm:text-[13px]">
        {messages.player.notice}
      </p>
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => playAll(SONGS)}
          className="mono inline-flex items-center gap-2 rounded-full border border-[var(--ink-rule)] px-4 py-1.5 text-[12px] tracking-[0.14em] text-[var(--foreground-soft)] transition-colors hover:border-[var(--sky-deep)] hover:text-[var(--sky-deep)]"
        >
          <svg width="10" height="12" viewBox="0 0 10 12" fill="currentColor">
            <path d="M0 0v12l10-6L0 0z" />
          </svg>
          {messages.player.playAll}
        </button>
        <button
          type="button"
          onClick={() => {
            const shuffled = [...SONGS].sort(() => Math.random() - 0.5);
            playAll(shuffled);
          }}
          className="mono inline-flex items-center gap-2 rounded-full border border-[var(--ink-rule)] px-4 py-1.5 text-[12px] tracking-[0.14em] text-[var(--foreground-soft)] transition-colors hover:border-[var(--sky-deep)] hover:text-[var(--sky-deep)]"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.2">
            <path d="M1 9h2.5l5-6H11M1 3h2.5l5 6H11M11 3v0M11 9v0" />
            <path d="M9.5 1.5L11 3l-1.5 1.5M9.5 7.5L11 9l-1.5 1.5" />
          </svg>
          {messages.player.shuffle}
        </button>
      </div>
      <motion.div
        variants={stagger}
        initial="hidden"
        animate="show"
        className="grid w-full grid-cols-1 gap-x-12 gap-y-8 sm:grid-cols-2 xl:grid-cols-3"
      >
        {groups.map(([artist, list]) => (
          <motion.section key={artist} variants={item} className="flex flex-col gap-3">
            <h3 className="font-serif text-base text-[var(--foreground)] lg:text-lg">
              {artist}
            </h3>
            <ol className="flex flex-col">
              {list.map((s, i) => {
                const isCurrent = current?.id === s.id;
                return (
                  <li
                    key={s.id}
                    className="group grid grid-cols-[28px_1fr] items-baseline gap-3 border-b border-[var(--ink-rule)] py-2"
                  >
                    <span className="mono text-[13px] text-[var(--foreground-faint)]">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <button
                      type="button"
                      onClick={() => isCurrent ? toggle() : play(s, SONGS)}
                      className="min-w-0 text-left"
                    >
                      <span
                        className={`block truncate font-serif text-[15px] transition-colors lg:text-base ${
                          isCurrent
                            ? "text-[var(--sky-deep)]"
                            : "text-[var(--foreground)] group-hover:text-[var(--sky-deep)]"
                        }`}
                      >
                        {s.title}
                        {isCurrent && (
                          <span className="mono ml-3 text-[10px] uppercase tracking-[0.24em] text-[var(--foreground-faint)]">
                            {playing ? messages.player.playing : messages.player.paused}
                          </span>
                        )}
                      </span>
                      {s.note && (
                        <span className="block truncate font-serif text-[13px] text-[var(--foreground-faint)]">
                          {s.note}
                        </span>
                      )}
                    </button>
                  </li>
                );
              })}
            </ol>
          </motion.section>
        ))}
      </motion.div>
    </PageLayout>
  );
}
