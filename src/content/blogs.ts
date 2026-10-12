export type BlogMeta = {
  id: string;
  title: string;
  date: string;
  tags: string[];
  summary?: string;
  loadBody: () => Promise<string>;
};

export const BLOGS: BlogMeta[] = [
  {
    id: "claude-code-memory",
    title: "Claude Code 的记忆模块设计",
    date: "2026-03-31",
    tags: ["工作笔记", "行业调研", "AI Agent"],
    summary:
      "拆解 Claude Code 跨对话记忆系统的完整设计：纯文件系统实现、四类记忆分型、写入/读取双通道、时效性验证与冲突处理策略。",
    loadBody: () => import("./blogs/claude-code-memory").then((m) => m.body),
  },
  {
    id: "ai-agent-memory",
    title: "AI Agent 记忆模块调研",
    date: "2025-12-05",
    tags: ["工作笔记", "行业调研", "AI Agent"],
    summary:
      "从背景、定义、行业进展与关键模块四个维度，系统梳理 AI Agent Memory 的技术路线与设计选择。",
    loadBody: () => import("./blogs/ai-agent-memory").then((m) => m.body),
  },
  {
    id: "mask2former",
    title: "图像分割简介与 Mask2Former 系列论文",
    date: "2024-07-01",
    tags: ["工作笔记", "学术调研", "计算机视觉"],
    summary:
      "从图像分割任务的三种范式出发，梳理 DETR / MaskFormer / Mask2Former 的设计思路与演进关系。",
    loadBody: () => import("./blogs/mask2former").then((m) => m.body),
  },
  {
    id: "ai-tts",
    title: "AI 语音合成技术与近期热门应用",
    date: "2023-06-08",
    tags: ["分享讲稿", "学术调研", "语音合成"],
    summary:
      "以 2023 年 AI 孙燕姿现象为切入点，从声音信号基础走到 Tacotron / FastSpeech / VITS / VALL-E，梳理 TTS 三代范式演进。",
    loadBody: () => import("./blogs/ai-tts").then((m) => m.body),
  },
];
