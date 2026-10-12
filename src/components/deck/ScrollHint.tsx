"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useLocale } from "@/i18n/LocaleProvider";

const SWIPE_DURATION = 1.4;
const SWIPES_PER_CYCLE = 3;
const REST_DURATION = 5;

export default function ScrollHint() {
  const { messages } = useLocale();
  const [phase, setPhase] = useState<"hidden" | "visible">("hidden");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const initial = setTimeout(() => {
      setMounted(true);
      setPhase("visible");
    }, 2000);
    return () => clearTimeout(initial);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const visibleMs = SWIPE_DURATION * SWIPES_PER_CYCLE * 1000;
    const restMs = REST_DURATION * 1000;
    const t = setTimeout(
      () => setPhase((p) => (p === "visible" ? "hidden" : "visible")),
      phase === "visible" ? visibleMs : restMs,
    );
    return () => clearTimeout(t);
  }, [phase, mounted]);

  return (
    <AnimatePresence>
      {phase === "visible" && (
        <motion.div
          className="pointer-events-none absolute bottom-8 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2 sm:bottom-10"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        >
          <span
            className="font-serif text-[11px] uppercase text-[var(--foreground-faint)]"
            style={{ letterSpacing: "0.28em" }}
          >
            {messages.common.scroll}
          </span>
          <motion.div
            className="flex flex-col items-center"
            animate={{ y: [0, 6, 0] }}
            transition={{
              duration: SWIPE_DURATION,
              repeat: SWIPES_PER_CYCLE - 1,
              ease: "easeInOut",
            }}
          >
            <svg
              width="20"
              height="30"
              viewBox="0 0 20 30"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden
            >
              <rect
                x="1"
                y="1"
                width="18"
                height="28"
                rx="9"
                stroke="var(--sky-deep)"
                strokeWidth="1.25"
                opacity="0.55"
              />
              <motion.circle
                cx="10"
                cy={9}
                r="2.2"
                fill="var(--sky-deep)"
                animate={{ cy: [9, 18, 9] }}
                transition={{
                  duration: SWIPE_DURATION,
                  repeat: SWIPES_PER_CYCLE - 1,
                  ease: "easeInOut",
                }}
              />
            </svg>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
