"use client";

import { motion } from "framer-motion";
import PageLayout from "../deck/PageLayout";
import { useLocale } from "@/i18n/LocaleProvider";

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.12 } },
};
const item = {
  hidden: { opacity: 0, y: 14 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
  },
};

type Card = {
  kicker: string;
  title: string;
  body: string;
  cta?: { label: string; href?: string };
  links?: { label: string; href: string }[];
};

const CARDS: Card[] = [
  {
    kicker: "AI for Investors",
    title: "LogicDuo",
    body: "面向个人投资者的 AI 辅助分析产品，也是我个人量化投资体系的重要组成部分。利用大模型完成新闻解读、逻辑分析、趋势研判、投资归因以及持仓诊断。",
    cta: { label: "logicduo.com", href: "https://logicduo.com" },
  },
  {
    kicker: "AI for Developers",
    title: "AllFeeds",
    body: "开源的分布式数据采集基础设施。通过 Controller / Worker 架构统一调度任务，支持 RSS、网页、Sitemap 与 JSON API，并内置失败重试、故障恢复、历史回填和可视化 Dashboard。",
    links: [
      { label: "GitHub", href: "https://github.com/StarSailAI/AllFeeds" },
      { label: "Gitee", href: "https://gitee.com/StarSailAI/allfeeds" },
    ],
  },
  {
    kicker: "AI for ACGers",
    title: "Genchi.news",
    body: "专注于日本二次元现地演出资讯的聚合网站，覆盖 Anisong、J-POP、声优、二次元偶像等现场活动，帮助现场演出爱好者不错过每一场自己喜欢的演出。",
    cta: { label: "建设中" },
  },
];

export default function WorkPage() {
  const { messages } = useLocale();
  const cards = CARDS.map((card, index) => ({ ...card, kicker: messages.hero.missions[index], body: messages.work.projects[index], cta: card.cta && { ...card.cta, label: card.cta.href ? card.cta.label : messages.common.comingSoon } }));
  return (
    <PageLayout page="work">
      <motion.div
        variants={stagger}
        initial="hidden"
        animate="show"
        className="flex w-full max-w-5xl flex-col gap-10 pb-6 lg:gap-14"
      >
        <motion.section variants={item} className="space-y-5">
          <p className="font-serif text-[15px] leading-8 text-[var(--foreground-soft)] lg:text-[16px] lg:leading-9">
            {messages.work.paragraphs[0]}
          </p>
          <p className="font-serif text-[15px] leading-8 text-[var(--foreground-soft)] lg:text-[16px] lg:leading-9">
            {messages.work.paragraphs[1]}
          </p>
        </motion.section>

        <motion.div
          variants={item}
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5"
        >
          {cards.map((card) => (
            <ProjectCard key={card.kicker} card={card} />
          ))}
        </motion.div>
      </motion.div>
    </PageLayout>
  );
}

function ProjectCard({ card }: { card: Card }) {
  const { messages } = useLocale();
  const inner = (
    <>
      <div className="flex-1">
        <h3 className="font-serif text-xl font-semibold italic leading-tight text-[var(--sky-deep)] lg:text-[22px]">
          {card.kicker}
        </h3>
        <p className="mt-4 font-serif text-[14px] font-semibold text-[var(--foreground)] lg:text-[15px]">
          {card.title}
        </p>
        <p className="mt-2 font-serif text-[13.5px] leading-7 text-[var(--foreground-soft)] lg:text-sm">
          {card.body}
        </p>
      </div>

      {card.cta && (
        <div className={`mt-6 flex items-center gap-2 font-serif text-[13px] text-[var(--sky-deep)] ${card.cta.href ? "transition-transform duration-500 group-hover:translate-x-1" : ""}`}>
          <span className="mono tracking-[0.06em]">{card.cta.label}</span>
          {card.cta.href && <span aria-hidden>↗</span>}
        </div>
      )}

      {card.links && (
        <div
          className="mt-6 flex items-center font-serif text-[13px] text-[var(--sky-deep)]"
          aria-label={`${card.title} ${messages.common.links}`}
        >
          {card.links.map((link, index) => (
            <span key={link.href} className="flex items-center">
              {index > 0 && <span aria-hidden className="mx-2 text-[var(--foreground-soft)]">｜</span>}
              <a
                href={link.href}
                target="_blank"
                rel="noreferrer"
                className="mono inline-flex tracking-[0.06em] transition-transform duration-300 hover:-translate-y-0.5"
              >
                {link.label}
              </a>
            </span>
          ))}
        </div>
      )}
    </>
  );

  const shared =
    "group relative flex h-full min-h-[220px] flex-col rounded-2xl border border-[var(--ink-rule)] bg-[var(--background)]/70 p-5 backdrop-blur transition-all duration-500 hover:-translate-y-1 hover:border-[var(--sky-deep)]/40 hover:bg-[var(--background)] hover:shadow-[0_24px_60px_-32px_rgba(61,122,168,0.55)] lg:p-6";

  return card.cta?.href ? (
    <a
      href={card.cta.href}
      target="_blank"
      rel="noreferrer"
      className={shared}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-5 top-0 h-px bg-gradient-to-r from-transparent via-[var(--sky-deep)]/40 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100"
      />
      {inner}
    </a>
  ) : (
    <div className={shared}>
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-5 top-0 h-px bg-gradient-to-r from-transparent via-[var(--sky-deep)]/40 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100"
      />
      {inner}
    </div>
  );
}
