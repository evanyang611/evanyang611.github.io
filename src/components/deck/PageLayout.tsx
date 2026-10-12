"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

type Props = {
  title: ReactNode;
  subtitle?: ReactNode;
  children: ReactNode;
  compactMobile?: boolean;
};

export default function PageLayout({ title, subtitle, children, compactMobile = false }: Props) {
  const outerClassName = compactMobile
    ? "relative flex h-full w-full flex-col gap-3 px-4 py-4 sm:px-10 sm:py-8 lg:grid lg:grid-cols-[minmax(0,0.85fr)_minmax(0,2fr)] lg:gap-24 lg:px-32 lg:py-28"
    : "relative grid h-full w-full grid-cols-1 gap-4 px-5 py-12 sm:gap-10 sm:px-10 sm:py-16 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,2fr)] lg:gap-24 lg:px-32 lg:py-28";
  const titleClassName = compactMobile
    ? "flex flex-col items-start gap-1 pt-8 sm:pt-8 lg:pl-16 lg:pt-24"
    : "flex flex-col items-start gap-4 pt-2 sm:pt-8 lg:pl-16 lg:pt-24";
  const contentClassName = compactMobile
    ? "flex min-h-0 min-w-0 flex-1 flex-col overscroll-y-contain overflow-y-auto pt-0 pr-0 lg:pt-8 lg:pr-16"
    : "flex min-h-0 min-w-0 flex-col overscroll-y-contain overflow-y-auto pt-2 pr-10 sm:pt-8 sm:pr-4 lg:pt-8 lg:pr-16";

  return (
    <div className={outerClassName}>
      <motion.div
        initial={{ opacity: 0, x: -24 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        className={titleClassName}
      >
        <div className="inline-flex flex-col items-start">
          <h2
            className="font-serif text-3xl font-semibold leading-[1.05] tracking-tight sm:text-5xl lg:text-7xl"
            style={{
              backgroundImage:
                "linear-gradient(135deg, #2563eb 0%, #7ab8e0 60%, #b8d6ec 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              paddingBottom: "0.1em",
            }}
          >
            {title}
          </h2>
          {subtitle && (
            <span className="-mt-1 font-serif text-base tracking-[0.32em] text-[var(--foreground-faint)] lg:text-lg">
              {subtitle}
            </span>
          )}
        </div>
      </motion.div>

      <div
        data-page-scroll
        className={contentClassName}
      >
        {children}
      </div>
    </div>
  );
}
