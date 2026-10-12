"use client";

import { AnimatePresence, motion, useMotionValue, useSpring } from "framer-motion";
import { useEffect, type ReactNode } from "react";
import DotRail from "./DotRail";
import { usePageNav, type PageMeta } from "./usePageNav";
import { useLocale } from "@/i18n/LocaleProvider";
import type { PageId } from "@/i18n/types";

export type DeckPage = PageMeta & { node: ReactNode };

type Props = { pages: DeckPage[] };

const variants = {
  enter: (dir: 1 | -1) => ({ y: dir === 1 ? 60 : -60, opacity: 0 }),
  center: { y: 0, opacity: 1 },
  exit: (dir: 1 | -1) => ({ y: dir === 1 ? -40 : 40, opacity: 0 }),
};

export default function Deck({ pages }: Props) {
  const { index, direction, go } = usePageNav(pages);
  const { messages } = useLocale();
  const meta = pages.map(({ id }) => ({ id, label: messages.navigation[id as PageId] }));
  const active = pages[index];

  return (
    <div className="fixed inset-0 overflow-hidden bg-[var(--background)] text-[var(--foreground)]">
      <SoftBlobs />
      <MouseGlow />

      <AnimatePresence custom={direction} initial={false} mode="wait">
        <motion.section
          key={active.id}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-0 z-10"
          aria-labelledby={`page-${active.id}-title`}
        >
          {active.node}
        </motion.section>
      </AnimatePresence>

      <DotRail pages={meta} index={index} onJump={go} />
    </div>
  );
}

function SoftBlobs() {
  return (
    <>
      <div
        aria-hidden
        className="blob-a pointer-events-none absolute -left-40 top-1/4 h-[520px] w-[520px] rounded-full opacity-40 blur-3xl z-0"
        style={{
          background:
            "radial-gradient(circle, rgba(122,184,224,0.55), transparent 70%)",
        }}
      />
      <div
        aria-hidden
        className="blob-b pointer-events-none absolute -right-40 bottom-0 h-[560px] w-[560px] rounded-full opacity-35 blur-3xl z-0"
        style={{
          background:
            "radial-gradient(circle, rgba(122,184,224,0.45), transparent 70%)",
        }}
      />
    </>
  );
}

function MouseGlow() {
  const x = useMotionValue(-400);
  const y = useMotionValue(-400);
  const spring = { stiffness: 320, damping: 30, mass: 0.3, restDelta: 0.5 };
  const sx = useSpring(x, spring);
  const sy = useSpring(y, spring);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
    };
    const leave = () => {
      x.set(-400);
      y.set(-400);
    };
    window.addEventListener("mousemove", handler);
    window.addEventListener("mouseleave", leave);
    return () => {
      window.removeEventListener("mousemove", handler);
      window.removeEventListener("mouseleave", leave);
    };
  }, [x, y]);

  return (
    <motion.div
      aria-hidden
      className="pointer-events-none fixed z-0 h-[480px] w-[480px] -translate-x-1/2 -translate-y-1/2 rounded-full"
      style={{
        left: sx,
        top: sy,
        background:
          "radial-gradient(circle, rgba(122,184,224,0.22), rgba(122,184,224,0) 65%)",
        filter: "blur(20px)",
      }}
    />
  );
}
