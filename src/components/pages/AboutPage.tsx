"use client";

import { motion } from "framer-motion";
import PageLayout from "../deck/PageLayout";
import { useLocale } from "@/i18n/LocaleProvider";

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06, delayChildren: 0.12 } },
};
const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const } },
};

export default function AboutPage() {
  const { messages } = useLocale();
  return (
    <PageLayout page="about">
      <motion.div
        variants={stagger}
        initial="hidden"
        animate="show"
        className="flex w-full max-w-4xl flex-col gap-4"
      >
        <motion.div variants={item} className="space-y-2 font-serif text-[15px] leading-7 text-[var(--foreground-soft)] lg:text-base">
          {messages.about.intro.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
        </motion.div>

        <motion.div variants={item} aria-hidden className="h-4" />

        <motion.div variants={item} className="space-y-2 font-serif text-[15px] leading-7 text-[var(--foreground-soft)] lg:text-base">
          {messages.about.career.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
        </motion.div>

        <motion.div variants={item} aria-hidden className="h-4" />

        <motion.div variants={item} className="space-y-2 font-serif text-[15px] leading-7 text-[var(--foreground-soft)] lg:text-base">
          {messages.about.interests.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
        </motion.div>

        <motion.div variants={item} aria-hidden className="h-4" />

        <motion.p variants={item} className="font-serif text-[15px] leading-7 text-[var(--foreground-soft)] lg:text-base">
          {messages.about.closing}
        </motion.p>
      </motion.div>
    </PageLayout>
  );
}
