"use client";

import { motion } from "framer-motion";
import PageLayout from "../deck/PageLayout";
import { useLocale } from "@/i18n/LocaleProvider";

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.12 } },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const } },
};

export default function PhotoPage() {
  const { messages } = useLocale();
  const shots = messages.photo.shots.map(([label, note]) => ({label, note}));
  return (
    <PageLayout page="photo">
      <div className="flex w-full max-w-5xl flex-col gap-8">
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="show"
          className="grid gap-6 lg:grid-cols-[1fr_0.85fr]"
        >
          <motion.div variants={item} className="space-y-4">
            <p className="max-w-2xl font-serif text-[16px] leading-8 text-[var(--foreground-soft)] sm:text-[17px]">
              {messages.photo.paragraphs[0]}
            </p>
            <p className="max-w-2xl font-serif text-[16px] leading-8 text-[var(--foreground-soft)] sm:text-[17px]">
              {messages.photo.paragraphs[1]}
            </p>
          </motion.div>

          <motion.div
            variants={item}
            className="rounded-md border border-[var(--ink-rule)] bg-white/35 p-5 backdrop-blur-sm"
          >
            <div className="mono text-[11px] tracking-[0.18em] text-[var(--foreground-faint)]">
              {messages.photo.direction}
            </div>
            <div className="mt-3 font-serif text-lg leading-8 text-[var(--foreground)]">
              {messages.photo.themes}
            </div>
            <p className="mt-3 font-serif text-[14px] leading-7 text-[var(--foreground-soft)]">
              {messages.photo.note}
            </p>
          </motion.div>
        </motion.div>

        <motion.div
          variants={stagger}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          {shots.map((shot, index) => (
            <motion.article
              key={shot.label}
              variants={item}
              className="group overflow-hidden rounded-md border border-[var(--ink-rule)] bg-white/35"
            >
              <div
                className={`relative aspect-[4/5] overflow-hidden ${
                  index % 3 === 0
                    ? "bg-[linear-gradient(180deg,rgba(255,255,255,0.9),rgba(234,244,252,0.65))]"
                    : index % 3 === 1
                      ? "bg-[linear-gradient(180deg,rgba(246,250,255,0.92),rgba(222,235,245,0.7))]"
                      : "bg-[linear-gradient(180deg,rgba(255,255,255,0.88),rgba(228,240,250,0.72))]"
                }`}
              >
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(122,184,224,0.18),transparent_55%)]" />
                <div className="absolute inset-0 flex flex-col justify-end p-5">
                  <div className="mono text-[11px] tracking-[0.18em] text-[var(--sky-deep)]">
                    {shot.label}
                  </div>
                  <div className="mt-2 font-serif text-[14px] leading-7 text-[var(--foreground-soft)]">
                    {shot.note}
                  </div>
                </div>
              </div>
            </motion.article>
          ))}
        </motion.div>
      </div>
    </PageLayout>
  );
}
