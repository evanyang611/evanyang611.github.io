"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import ScrollHint from "@/components/deck/ScrollHint";

const SOCIALS = [
  {
    name: "Gitee",
    href: "https://gitee.com/yqh611",
    logo: "/brands/gitee.svg",
  },
  {
    name: "哔哩哔哩",
    href: "https://space.bilibili.com/18329449",
    logo: "/brands/bilibili.svg",
  },
  {
    name: "小红书",
    href: "https://www.xiaohongshu.com/user/profile/598b356182ec39309ab078ac",
    logo: "/brands/xiaohongshu.svg",
  },
];

export default function HeroPage() {
  const tags = ["二次元", "动漫", "游戏", "JPOP", "钢琴", "羽毛球"];
  const roles = ["机器学习算法", "大模型应用算法", "独立开发者"];
  const missions = ["AI for Investors", "AI for Developers", "AI for ACGers"];

  return (
    <div className="relative flex h-full w-full items-center px-5 py-12 sm:px-10 sm:py-16 lg:px-32 lg:py-28">
      <div className="grid w-full max-w-7xl items-center gap-12 lg:grid-cols-[minmax(0,1fr)_220px] lg:gap-16 lg:pr-[clamp(0rem,calc(56.25vw_-_45rem),9rem)]">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-10 flex flex-col items-center text-center lg:items-start lg:pl-48 lg:text-left"
        >
          <p
            className="mb-8 flex flex-wrap justify-center gap-x-3 gap-y-2 font-serif text-[15px] uppercase text-[var(--foreground-faint)] sm:text-base lg:flex-nowrap lg:justify-start"
            style={{ letterSpacing: "0.18em" }}
          >
            {roles.slice(0, 2).map((role, index) => (
              <span key={role} className="inline-flex shrink-0 items-center gap-x-3">
                <span>{role}</span>
                {index === 0 && (
                  <span aria-hidden className="text-[var(--rule)]">·</span>
                )}
              </span>
            ))}
            <span aria-hidden className="hidden text-[var(--rule)] lg:inline">·</span>
            <span className="basis-full lg:basis-auto">{roles[2]}</span>
          </p>

          <h1
            className="font-serif text-6xl font-semibold leading-none text-[#243746] sm:text-7xl lg:text-8xl"
            style={{
              textShadow: "0 16px 48px rgba(61,122,168,0.16)",
            }}
          >
            Evan Yang
          </h1>

          <p className="mt-8 flex flex-wrap justify-center gap-x-3 gap-y-2 font-serif text-lg italic text-[var(--sky-deep)] sm:text-xl lg:flex-nowrap lg:justify-start">
            {missions.map((mission, index) => (
              <span key={mission} className="inline-flex shrink-0 items-center gap-x-3">
                <span>{mission}</span>
                {index < missions.length - 1 && (
                  <span aria-hidden className="text-[var(--rule)] not-italic">／</span>
                )}
              </span>
            ))}
          </p>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.18, ease: [0.22, 1, 0.36, 1] }}
            className="mt-16"
          >
            <ul className="flex flex-wrap justify-center gap-2 lg:justify-start">
              {tags.map((tag) => (
                <li
                  key={tag}
                  className="rounded-full border border-[var(--ink-rule)] bg-[var(--background)]/60 px-4 py-1.5 font-serif text-sm text-[var(--foreground-soft)] backdrop-blur"
                >
                  {tag}
                </li>
              ))}
            </ul>
          </motion.div>
        </motion.div>

        <div className="flex min-w-0 flex-col items-center gap-14 sm:gap-16">
          <div className="relative h-36 w-36 sm:h-44 sm:w-44 lg:h-52 lg:w-52">
            <motion.div
              aria-hidden
              className="pointer-events-none absolute inset-[-4px] rounded-full border border-[rgba(61,122,168,0.42)]"
              initial={{ opacity: 0, scale: 0.88 }}
              animate={{ opacity: [0.46, 0.14, 0], scale: [1, 1.28, 1.6] }}
              transition={{ duration: 3.1, repeat: Infinity, ease: "easeOut", repeatDelay: 0.2 }}
            />
            <motion.div
              aria-hidden
              className="pointer-events-none absolute inset-[-8px] rounded-full border border-[rgba(61,122,168,0.26)]"
              initial={{ opacity: 0, scale: 0.88 }}
              animate={{ opacity: [0.34, 0.1, 0], scale: [1, 1.4, 1.82] }}
              transition={{ duration: 3.1, repeat: Infinity, ease: "easeOut", repeatDelay: 0.95 }}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
              className="relative h-full w-full overflow-hidden rounded-full ring-1 ring-[rgba(61,122,168,0.18)] shadow-[0_24px_70px_-34px_rgba(61,122,168,0.7)]"
            >
              <Image
                src="/avatar.jpg"
                alt="Evan Yang"
                fill
                sizes="(min-width: 1024px) 208px, 176px"
                className="object-cover"
                priority
              />
            </motion.div>
          </div>

          <motion.ul
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="flex items-center gap-4"
          >
            {SOCIALS.map((social) => (
              <li key={social.name}>
                <a
                  href={social.href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={social.name}
                  className="group grid h-10 w-10 place-items-center rounded-full border border-[var(--ink-rule)] bg-[var(--background)]/70 backdrop-blur transition-all duration-300 hover:-translate-y-0.5 hover:border-[var(--sky-deep)]/40 hover:shadow-[0_10px_28px_-14px_rgba(61,122,168,0.55)]"
                >
                  <span
                    className="h-[18px] w-[18px] bg-[var(--sky-deep)] opacity-75 transition-opacity duration-300 group-hover:opacity-100"
                    style={{
                      WebkitMaskImage: `url(${social.logo})`,
                      maskImage: `url(${social.logo})`,
                      WebkitMaskSize: "contain",
                      maskSize: "contain",
                      WebkitMaskRepeat: "no-repeat",
                      maskRepeat: "no-repeat",
                      WebkitMaskPosition: "center",
                      maskPosition: "center",
                    }}
                    aria-hidden
                  />
                </a>
              </li>
            ))}
          </motion.ul>
        </div>
      </div>

      <ScrollHint />
    </div>
  );
}
