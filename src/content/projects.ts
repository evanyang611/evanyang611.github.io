export const PROJECTS = [
  { id: "logicduo", title: "LogicDuo", image: "/images/logicduo-cover.png", width: 1280, height: 720, links: [{ id: "website", href: "https://logicduo.com/" }] },
  { id: "allfeeds", title: "AllFeeds", image: "/images/allfeeds-cover.png", width: 1920, height: 1057, links: [{ id: "github", href: "https://github.com/StarSailAI/AllFeeds" }, { id: "gitee", href: "https://gitee.com/StarSailAI/allfeeds" }] },
  { id: "genchi", title: "Genchi.news", image: "/images/genchi-cover.png", width: 1280, height: 720, links: [{ id: "website", href: "https://genchi.news/" }] },
] as const;
export type Project = (typeof PROJECTS)[number];
export type ProjectId = Project["id"];
