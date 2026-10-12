"use client";

import { motion } from "framer-motion";
import { BusuanziStatsText } from "@/components/stats/BusuanziStats";
import PageLayout from "../deck/PageLayout";
import { useLocale } from "@/i18n/LocaleProvider";

type Account = {
  name: string;
  detail: string;
  href: string;
  logo?: string;
};

const ACCOUNTS: Account[] = [
  {
    name: "Contact me",
    detail: "yqh611@126.com",
    href: "mailto:yqh611@126.com",
  },
  {
    name: "Gitee",
    detail: "yqh611",
    href: "https://gitee.com/yqh611",
    logo: "/brands/gitee.ico",
  },
  {
    name: "哔哩哔哩",
    detail: "UID 18329449",
    href: "https://space.bilibili.com/18329449",
    logo: "/brands/bilibili.ico",
  },
  {
    name: "小红书",
    detail: "ID 956978174",
    href: "https://www.xiaohongshu.com/user/profile/598b356182ec39309ab078ac",
    logo: "/brands/xiaohongshu.ico",
  },
];

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.12 } },
};
const item = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const } },
};

export default function LinksPage() {
  const { messages } = useLocale();
  const accounts = ACCOUNTS.map((account, index) => ({ ...account, name: [messages.links.contact, "Gitee", messages.links.bilibili, messages.links.xiaohongshu][index] }));
  return (
    <div className="relative h-full w-full">
      <PageLayout page="links" compactMobile>
        <p className="mb-6 max-w-2xl font-serif text-[15px] leading-8 text-[var(--foreground-soft)] sm:mb-8 sm:text-[16px]">
          {messages.links.intro}
        </p>
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="show"
          className="grid w-full max-w-3xl grid-cols-1 gap-x-10 sm:grid-cols-2"
        >
          {accounts.map((account) => (
            <motion.a
              key={account.name}
              variants={item}
              href={account.href}
              target={account.href.startsWith("http") ? "_blank" : undefined}
              rel={account.href.startsWith("http") ? "noreferrer" : undefined}
              className="group grid min-h-20 grid-cols-[40px_1fr_auto] items-center gap-4 py-5 transition-[padding,color] duration-300 hover:pl-2"
            >
              <span
                className="grid h-10 w-10 place-items-center overflow-hidden font-serif text-lg font-semibold text-[var(--sky-deep)]"
                aria-hidden
              >
                {account.logo ? (
                  <span
                    className="h-8 w-8 bg-contain bg-center bg-no-repeat"
                    style={{ backgroundImage: `url(${account.logo})` }}
                  />
                ) : (
                  <span className="grid h-8 w-8 place-items-center rounded-full border border-[var(--rule)]">@</span>
                )}
              </span>

              <span className="min-w-0">
                <span className="block font-serif text-base text-[var(--foreground)] transition-colors group-hover:text-[var(--sky-deep)] lg:text-lg">
                  {account.name}
                </span>
                <span className="mono mt-1 block truncate text-[11px] text-[var(--foreground-faint)]">
                  {account.detail}
                </span>
              </span>

              <span
                aria-hidden
                className="mono text-[12px] text-[var(--foreground-faint)] transition-transform duration-300 group-hover:translate-x-1 group-hover:text-[var(--sky-deep)]"
              >
                ↗
              </span>
            </motion.a>
          ))}
        </motion.div>
      </PageLayout>

      <footer className="pointer-events-auto absolute bottom-6 left-5 right-14 z-20 flex flex-col items-center gap-1.5 pt-4 sm:left-10 sm:right-20 lg:left-32 lg:right-36">
        <a
          href="https://beian.miit.gov.cn/"
          target="_blank"
          rel="noreferrer"
          className="mono text-[11px] tracking-[0.12em] text-[var(--foreground-faint)] transition-colors hover:text-[var(--sky-deep)]"
        >
          苏ICP备2026043399号-1
        </a>
        <p
          id="busuanzi_container_site_pv"
          className="mono text-[11px] tracking-[0.12em] text-[var(--foreground-faint)]"
        >
          <BusuanziStatsText />
        </p>
      </footer>
    </div>
  );
}
