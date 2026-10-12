"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import type { PageMeta } from "./usePageNav";
import { useLocale } from "@/i18n/LocaleProvider";

type Props = {
  pages: PageMeta[];
  index: number;
  onJump: (i: number) => void;
};

export default function DotRail({ pages, index, onJump }: Props) {
  const { messages } = useLocale();
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const media = window.matchMedia("(min-width: 640px)");
    const isDesktop = () => media.matches;
    const hideDelay = 1800;
    let timer: number | null = null;

    const showTemporarily = () => {
      if (isDesktop()) {
        setVisible(true);
        return;
      }
      setVisible(true);
      if (timer != null) window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        setVisible(false);
        timer = null;
      }, hideDelay);
    };

    const onInteraction = () => showTemporarily();
    const onResize = () => {
      if (isDesktop()) {
        setVisible(true);
        if (timer != null) {
          window.clearTimeout(timer);
          timer = null;
        }
        return;
      }
      showTemporarily();
    };

    showTemporarily();
    window.addEventListener("pointerdown", onInteraction, { passive: true });
    window.addEventListener("keydown", onInteraction);
    window.addEventListener("wheel", onInteraction, { passive: true });
    window.addEventListener("touchstart", onInteraction, { passive: true });
    media.addEventListener("change", onResize);

    return () => {
      if (timer != null) window.clearTimeout(timer);
      window.removeEventListener("pointerdown", onInteraction);
      window.removeEventListener("keydown", onInteraction);
      window.removeEventListener("wheel", onInteraction);
      window.removeEventListener("touchstart", onInteraction);
      media.removeEventListener("change", onResize);
    };
  }, [index]);

  return (
    <nav
      aria-label={messages.navigation.label}
      className={`fixed right-3 top-1/2 z-30 -translate-y-1/2 transition-[opacity,transform] duration-300 sm:right-6 lg:right-10 ${
        visible ? "opacity-100" : "pointer-events-none opacity-0 translate-x-2"
      }`}
    >
      <ul className="flex flex-col items-end gap-3 sm:gap-5">
        {pages.map((p, i) => {
          const active = i === index;
          return (
            <li key={p.id}>
              <button
                type="button"
                aria-label={`${messages.navigation.goTo} ${p.label}`}
                data-page-link={p.id}
                aria-current={active ? "page" : undefined}
                onClick={() => onJump(i)}
                className="flex min-h-6 min-w-8 flex-col items-end justify-center gap-1"
              >
                <motion.span
                  layout
                  initial={false}
                  animate={{
                    width: active ? 22 : 8,
                    backgroundColor: active ? "rgba(61,122,168,1)" : "rgba(61,122,168,0)",
                    borderColor: active ? "rgba(61,122,168,1)" : "rgba(205,216,226,1)",
                  }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  className="block h-[2px] rounded-full border"
                />
                <span
                  className={`mono hidden text-[11px] tracking-[0.08em] transition-colors sm:block ${
                    active ? "text-[var(--sky-ink)]" : "text-[var(--foreground-soft)]"
                  }`}
                >
                  {p.label}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
