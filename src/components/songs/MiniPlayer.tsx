"use client";

import { AnimatePresence, motion } from "framer-motion";
import { usePlayer } from "./PlayerProvider";
import { useLocale } from "@/i18n/LocaleProvider";

export default function MiniPlayer() {
  const { messages } = useLocale();
  const { current, playing, toggle, next, prev, close, error, dismissError } = usePlayer();
  return (
    <AnimatePresence>
      {error && (
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 24 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] as const }}
          className="fixed bottom-4 left-1/2 z-50 flex w-[calc(100vw-1.5rem)] max-w-[28rem] -translate-x-1/2 items-center gap-3 rounded-lg border border-[var(--ink-rule)] bg-[var(--background)]/95 px-5 py-3 shadow-[0_18px_40px_-18px_rgba(15,30,50,0.45)] backdrop-blur sm:left-auto sm:right-6 sm:bottom-6 sm:w-auto sm:max-w-none sm:translate-x-0"
        >
          <span className="font-serif text-[14px] text-[var(--foreground)]">{messages.player.unavailable}</span>
          <button
            type="button"
            onClick={dismissError}
            aria-label={messages.common.close}
            className="grid h-6 w-6 place-items-center rounded-full text-[var(--foreground-faint)] transition-colors hover:text-[var(--foreground)]"
          >
            ×
          </button>
        </motion.div>
      )}
      {current && (
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 24 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] as const }}
          className="fixed bottom-4 left-1/2 z-40 flex w-[calc(100vw-1.5rem)] max-w-[28rem] -translate-x-1/2 items-center justify-between gap-3 rounded-full border border-[var(--ink-rule)] bg-[var(--background)]/95 px-4 py-3 shadow-[0_18px_40px_-18px_rgba(15,30,50,0.45)] backdrop-blur sm:left-auto sm:right-6 sm:bottom-6 sm:w-auto sm:max-w-none sm:translate-x-0 sm:px-5"
        >
          <div className="flex items-center gap-1">
            <button
              type="button"
              aria-label={messages.player.previous}
              onClick={prev}
              className="grid h-7 w-7 place-items-center rounded-full text-[var(--foreground-soft)] transition-colors hover:text-[var(--sky-deep)]"
            >
              <svg width="10" height="10" viewBox="0 0 12 12" fill="currentColor">
                <rect x="1" y="1" width="2" height="10" rx="0.5" />
                <path d="M11 1v10L4 6l7-5z" />
              </svg>
            </button>
            <button
              type="button"
              aria-label={playing ? messages.player.pause : messages.player.play}
              onClick={toggle}
              className="grid h-9 w-9 place-items-center rounded-full bg-[var(--sky-deep)] text-[var(--background)] transition-transform hover:scale-105"
            >
              {playing ? (
                <svg width="12" height="12" viewBox="0 0 14 14" fill="currentColor">
                  <rect x="2" y="1" width="3.5" height="12" rx="0.5" />
                  <rect x="8.5" y="1" width="3.5" height="12" rx="0.5" />
                </svg>
              ) : (
                <svg width="12" height="12" viewBox="0 0 14 14" fill="currentColor">
                  <path d="M3 1.5v11l9.5-5.5L3 1.5z" />
                </svg>
              )}
            </button>
            <button
              type="button"
              aria-label={messages.player.next}
              onClick={next}
              className="grid h-7 w-7 place-items-center rounded-full text-[var(--foreground-soft)] transition-colors hover:text-[var(--sky-deep)]"
            >
              <svg width="10" height="10" viewBox="0 0 12 12" fill="currentColor">
                <path d="M1 1v10l7-5L1 1z" />
                <rect x="9" y="1" width="2" height="10" rx="0.5" />
              </svg>
            </button>
          </div>
          <div className="w-[180px] min-w-0 text-center">
            <div className="truncate font-serif text-[15px] text-[var(--foreground)]">
              {current.title}
            </div>
            <div className="truncate font-serif text-[12px] text-[var(--foreground-faint)]">
              {current.artist}
            </div>
          </div>
          <button
            type="button"
            aria-label={messages.common.close}
            onClick={close}
            className="grid h-7 w-7 place-items-center rounded-full text-[var(--foreground-faint)] transition-colors hover:bg-[var(--sky-soft)] hover:text-[var(--foreground)]"
          >
            ×
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
