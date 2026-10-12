export const THEMES = [
  { id: "investors", title: "AI for Investors" },
  { id: "developers", title: "AI for Developers" },
  { id: "acgers", title: "AI for ACGers" },
] as const;
export type ThemeId = (typeof THEMES)[number]["id"];

export const PROJECTS = [
  { id: "logicduo", title: "LogicDuo", theme: "investors", image: "/images/logicduo-cover.png", width: 1280, height: 720, links: [{ id: "website", href: "https://logicduo.com/" }] },
  { id: "forearena", title: "ForeArena", theme: "investors", image: "/images/forearena-investor-cover.jpg", width: 1280, height: 720, links: [{ id: "website", href: "https://forearena.com/" }] },
  { id: "qimiao", title: "Qimiao", theme: "developers", image: "/images/qimiao-cover.jpg", width: 1280, height: 620, links: [{ id: "website", href: "https://longxia.sale/" }] },
  { id: "genchi", title: "Genchi.news", theme: "acgers", image: "/images/genchi-cover.png", width: 1280, height: 720, links: [{ id: "website", href: "https://genchi.news/" }] },
] as const;
export type Project = (typeof PROJECTS)[number];
export type ProjectId = Project["id"];
