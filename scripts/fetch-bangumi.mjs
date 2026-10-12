#!/usr/bin/env node
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const UA = "personal-site/1.0 (+https://gitee.com/yqh611/personal-site)";

const KIND = process.argv[2] || "anime";
const CONFIG = {
  anime: {
    idsPath: resolve(ROOT, "src/content/anime-ids.json"),
    posterDir: resolve(ROOT, "public/anime"),
    outPath: resolve(ROOT, "src/content/anime.generated.ts"),
    publicPrefix: "/anime",
    typeName: "AnimeMeta",
    exportName: "ANIME",
  },
  game: {
    idsPath: resolve(ROOT, "src/content/game-ids.json"),
    posterDir: resolve(ROOT, "public/game"),
    outPath: resolve(ROOT, "src/content/game.generated.ts"),
    publicPrefix: "/game",
    typeName: "GameMeta",
    exportName: "GAMES",
  },
};

const cfg = CONFIG[KIND];
if (!cfg) {
  console.error(`unknown kind: ${KIND}. use anime|game`);
  process.exit(1);
}

async function fetchSubject(id) {
  const res = await fetch(`https://api.bgm.tv/v0/subjects/${id}`, {
    headers: { "User-Agent": UA, Accept: "application/json" },
  });
  if (!res.ok) throw new Error(`bgm ${id}: ${res.status} ${res.statusText}`);
  return res.json();
}

function jinaUrl(url) {
  const target = new URL(url);
  return `https://r.jina.ai/http://${target.hostname}${target.pathname}${target.search}${target.hash}`;
}

async function fetchMoegirlPage(url) {
  const res = await fetch(jinaUrl(url), {
    headers: { "User-Agent": UA, Accept: "text/plain" },
  });
  if (!res.ok) throw new Error(`moegirl ${url}: ${res.status} ${res.statusText}`);
  return res.text();
}

async function downloadPoster(url, id, dir) {
  const res = await fetch(url, { headers: { "User-Agent": UA } });
  if (!res.ok) throw new Error(`poster ${id}: ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  await mkdir(dir, { recursive: true });
  await writeFile(resolve(dir, `${id}.jpg`), buf);
}

function pickYear(dateStr) {
  if (!dateStr) return undefined;
  const m = /^(\d{4})/.exec(dateStr);
  return m ? Number(m[1]) : undefined;
}

function pickReleasePlatforms(subject) {
  const raw = subject.infobox?.find((field) => field?.key === "平台")?.value;
  const excluded = new Set(["Amazon Luna", "Stadia"]);
  const items = Array.isArray(raw) ? raw : raw ? [raw] : [];
  return items
    .map((item) => {
      if (typeof item === "string") return item;
      if (item && typeof item === "object" && "v" in item) return item.v;
      return undefined;
    })
    .filter((value) => typeof value === "string" && value.trim().length > 0 && !excluded.has(value.trim()))
    .map((value) => value.trim());
}

function parseChineseDate(value) {
  const match = value?.match(/(\d{4})年(\d{1,2})月(\d{1,2})日/);
  if (!match) return undefined;
  const [, year, month, day] = match;
  return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
}

function stripMarkdown(text) {
  return text
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/\*\*/g, "")
    .replace(/`/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function parseMoegirlMarkdown(markdown, sourceUrl) {
  const lines = markdown.split("\n").map((line) => line.trim());
  const title = lines.find((line) => line.startsWith("## "))?.replace(/^##\s+/, "").trim() || "";
  const titleOriginal = markdown.match(/^原名\s+(.+)$/m)?.[1]?.trim() || title;
  const releaseTime = markdown.match(/^发行时间\s+(.+)$/m)?.[1]?.trim();
  const platform = markdown.match(/^平台\s+(.+)$/m)?.[1]?.trim();
  const imageMatches = [...markdown.matchAll(/\!\[[^\]]*\]\((https?:\/\/[^)]+)\)/g)].map((match) => match[1]);
  const posterUrl = imageMatches.find((url) => !url.includes("Zh_conversion_icon")) || imageMatches[0];
  const intro = lines.find((line) => /^《.*》.*是由/.test(line)) || lines.find((line) => line.startsWith("《"));

  return {
    title,
    titleOriginal,
    year: releaseTime ? Number.parseInt(releaseTime, 10) || undefined : undefined,
    date: parseChineseDate(releaseTime),
    summary: intro ? stripMarkdown(intro) : "",
    score: undefined,
    tags: [],
    releasePlatforms: platform ? [platform] : [],
    posterUrl,
    sourceUrl,
    sourceName: "Moegirl",
  };
}

async function fetchGameRecord(entry) {
  const { id, note, moegirlUrl } = entry;
  try {
    process.stdout.write(`fetching ${KIND} ${id}... `);
    const s = await fetchSubject(id);
    const posterUrl = s.images?.large || s.images?.common || s.images?.medium;
    if (posterUrl) await downloadPoster(posterUrl, id, cfg.posterDir);
    console.log(`${id} ok`);
    return {
      id,
      title: s.name_cn || s.name,
      titleOriginal: s.name,
      year: pickYear(s.date),
      date: s.date,
      summary: (s.summary || "").trim(),
      score: s.rating?.score,
      tags: (s.tags || []).slice(0, 8).map((t) => t.name),
      releasePlatforms: pickReleasePlatforms(s),
      poster: `${cfg.publicPrefix}/${id}.jpg`,
      bgmUrl: `https://bangumi.tv/subject/${id}`,
      sourceName: "Bangumi",
      note,
    };
  } catch (error) {
    if (!moegirlUrl) throw error;
    console.log(`${id} bangumi failed, trying moegirl...`);
    const markdown = await fetchMoegirlPage(moegirlUrl);
    const parsed = parseMoegirlMarkdown(markdown, moegirlUrl);
    if (parsed.posterUrl) await downloadPoster(parsed.posterUrl, id, cfg.posterDir);
    console.log(`${id} ok`);
    return {
      id,
      title: parsed.title || `subject ${id}`,
      titleOriginal: parsed.titleOriginal || parsed.title || `subject ${id}`,
      year: parsed.year,
      date: parsed.date,
      summary: parsed.summary,
      score: parsed.score,
      tags: parsed.tags,
      releasePlatforms: parsed.releasePlatforms,
      poster: `${cfg.publicPrefix}/${id}.jpg`,
      bgmUrl: parsed.sourceUrl,
      sourceName: parsed.sourceName,
      note,
    };
  }
}

async function main() {
  const ids = JSON.parse(await readFile(cfg.idsPath, "utf8"));
  const out = await Promise.all(ids.map((entry) => fetchGameRecord(entry)));
  const body = `// Auto-generated by scripts/fetch-bangumi.mjs. Do not edit.
export type ${cfg.typeName} = {
  id: number;
  title: string;
  titleOriginal: string;
  year?: number;
  date?: string;
  summary: string;
  score?: number;
  tags: string[];
  releasePlatforms: string[];
  poster: string;
  bgmUrl: string;
  sourceName?: string;
  note?: string;
};

export const ${cfg.exportName}: ${cfg.typeName}[] = ${JSON.stringify(out, null, 2)};
`;
  await writeFile(cfg.outPath, body);
  console.log(`wrote ${cfg.outPath}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
