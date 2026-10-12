"use client";

import { motion } from "framer-motion";
import PageLayout from "../deck/PageLayout";

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06, delayChildren: 0.12 } },
};
const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const } },
};

export default function AboutPage() {
  return (
    <PageLayout title="About Me" subtitle="关于我">
      <motion.div
        variants={stagger}
        initial="hidden"
        animate="show"
        className="flex w-full max-w-4xl flex-col gap-4"
      >
        <motion.div variants={item} className="space-y-2 font-serif text-[15px] leading-7 text-[var(--foreground-soft)] lg:text-base">
          <p>你好，我是 Evan，目前生活在上海。</p>
          <p>欢迎来到我的个人主页。这里记录着我的工作、正在做的项目，以及生活中的一些兴趣爱好。</p>
        </motion.div>

        <motion.div variants={item} aria-hidden className="h-4" />

        <motion.div variants={item} className="space-y-2 font-serif text-[15px] leading-7 text-[var(--foreground-soft)] lg:text-base">
          <p>我的本科就读于北京航空航天大学统计学专业，后来前往美国哥伦比亚大学攻读统计学硕士。毕业后，我一直从事 AI 算法相关工作。随着大模型的发展，我的职业方向也逐渐从机器学习转向 AI Agent。</p>
          <p>职业生涯的前几年，我主要负责需求预测、运筹优化和计算机视觉等方向。后来开始专注于大模型应用，主要从事 AI Agent 的模型后训练与工程落地。</p>
          <p>闲暇时间里，我也希望成为一名独立开发者，会利用 AI 开发一些自己感兴趣的产品。</p>
        </motion.div>

        <motion.div variants={item} aria-hidden className="h-4" />

        <motion.div variants={item} className="space-y-2 font-serif text-[15px] leading-7 text-[var(--foreground-soft)] lg:text-base">
          <p>生活中，我是一名重度二次元爱好者。</p>
          <p>我喜欢动漫（我有自己的动漫库，每季都会下载收藏新番）、游戏（PS、Switch、PC、手游全平台，尤其偏爱 JRPG），也喜欢 Anisong（二次元偶像、二次元乐队、Vocaloid） 和 J-POP。我经常会去现场观看喜欢的歌手、乐队以及二次元 Live，也偶尔会弹一些 Anisong 的钢琴曲，并坚持每周打一场羽毛球。</p>
        </motion.div>

        <motion.div variants={item} aria-hidden className="h-4" />

        <motion.p variants={item} className="font-serif text-[15px] leading-7 text-[var(--foreground-soft)] lg:text-base">
          在这个网站的后面几页，你将会看到我的工作经历与作品，也会看到我想推荐给你的动漫、游戏和音乐。如果这些内容恰好也是你的兴趣，希望我们能因为它们产生一些共鸣。
        </motion.p>
      </motion.div>
    </PageLayout>
  );
}
