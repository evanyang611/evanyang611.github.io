import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { AIGC_ARTWORKS, AIGC_CATEGORIES } from "../src/content/aigc.ts";
import { PROJECTS, THEMES } from "../src/content/projects.ts";

assert.equal(PROJECTS.find(project => project.id === "forearena").links[0].href, "https://forearena.com/", "ForeArena must link to the user-selected product");
const root = new URL("../out/", import.meta.url);
const languages = {"zh-CN": "", "zh-TW": "zh-TW/", en: "en/", ja: "ja/"};
assert.equal(new Set(AIGC_ARTWORKS.map(work => work.id)).size, AIGC_ARTWORKS.length, "artwork IDs must be unique");
for (const work of AIGC_ARTWORKS) {
  assert.ok(AIGC_CATEGORIES.includes(work.kind), `${work.id}: unsupported media kind`);
  assert.ok(work.src.startsWith("/aigc/"), `${work.id}: media must use the gallery asset directory`);
  assert.ok(fs.existsSync(new URL(work.src.slice(1), root)), `${work.id}: exported media missing`);
  for (const locale of Object.keys(languages)) {
    assert.ok(work.title[locale]?.trim(), `${work.id}: ${locale} title missing`);
    if (work.description) assert.ok(work.description[locale]?.trim(), `${work.id}: ${locale} description missing`);
    if (work.kind === "images") assert.ok(work.alt[locale]?.trim(), `${work.id}: ${locale} alt missing`);
  }
  if (work.kind === "images") assert.ok(work.width > 0 && work.height > 0, `${work.id}: intrinsic dimensions missing`);
}
for (const [locale, dir] of Object.entries(languages)) {
  const html = fs.readFileSync(new URL(`${dir}index.html`, root), "utf8");
  const copy = JSON.parse(fs.readFileSync(new URL(`../src/i18n/messages/${locale}.json`, import.meta.url), "utf8"));
  assert.match(html, new RegExp(`<html[^>]*lang="${locale}"`), `${locale}: incorrect document language`);
  assert.ok(html.includes(copy.hero.lead.trim().replaceAll("&", "&amp;")), `${locale}: headline not rendered in static HTML`);
  const agents = fs.readFileSync(new URL(`${dir}ai-agent/index.html`, root), "utf8");
  assert.ok(agents.includes(`rel="canonical" href="https://evanyang611.github.io/${dir}ai-agent/"`));
  assert.match(agents, new RegExp(`<html[^>]*lang="${locale}"`));
  for (const { id } of PROJECTS) {
    assert.ok(html.includes(`data-project-preview="${id}"`));
    assert.ok(agents.includes(`data-project-id="${id}"`));
  }
  for (const id of ["ai-agent", "aigc", "about"]) assert.ok(html.includes(`id="${id}"`));
  assert.ok(html.includes(`href="/${dir}ai-agent/"`));
  assert.ok(html.includes('href="#ai-agent"') && html.includes('href="#aigc"'));
  for (const kind of AIGC_CATEGORIES) if (!AIGC_ARTWORKS.length) assert.ok(html.includes(`data-category-preview="${kind}"`));
  for (const { id, title } of THEMES) {
    assert.ok(agents.includes(`id="work-${id}"`) && agents.includes(title), `${locale}: missing theme ${id}`);
    assert.equal(PROJECTS.filter(project => project.theme === id).length, id === "investors" ? 2 : 1, `${id}: unexpected curated works`);
  }
  assert.ok(!html.includes('href="#writing"') && !html.includes('id="writing"'), `${locale}: removed blog section returned`);
  assert.equal([...html.matchAll(/href="mailto:yqh611@gmail\.com"/g)].length, 2, `${locale}: contact actions must use the current Gmail address`);
  assert.ok(!html.includes("yqh611@126.com"), `${locale}: old email address returned`);
  assert.ok(html.includes('src="/brand/evan-logo.png"'), `${locale}: navigation logo missing`);
  assert.ok(html.includes('href="/brand/favicon.png"'), `${locale}: brand favicon missing`);
  for (const alternate of ["zh-Hans", "zh-Hant", "en", "ja"]) assert.ok(html.includes(`hrefLang="${alternate}"`), `${locale}: missing alternate ${alternate}`);
  for (const [, src] of html.matchAll(/(?:src|href)="([^"?#]+)(?:[?#][^"]*)?"/g)) {
    if (!src.startsWith("/") || src === "/" || src.endsWith("/")) continue;
    assert.ok(fs.existsSync(new URL(src.slice(1), root)), `${locale}: missing local resource ${src}`);
  }
  const galleryPath = `${dir}aigc/`;
  assert.ok(html.includes(`href="/${galleryPath}"`), `${locale}: gallery entry missing`);
  const gallery = fs.readFileSync(new URL(`${galleryPath}index.html`, root), "utf8");
  assert.match(gallery, new RegExp(`<html[^>]*lang="${locale}"`));
  assert.ok(gallery.includes(copy.gallery.title), `${locale}: gallery heading missing`);
  assert.ok(gallery.includes(`rel="canonical" href="https://evanyang611.github.io/${galleryPath}"`), `${locale}: gallery canonical missing`);
  for (const kind of AIGC_CATEGORIES) {
    assert.ok(gallery.includes(`id="${kind}"`), `${locale}: missing ${kind} room`);
    assert.equal(gallery.includes(`data-empty-exhibit="${kind}"`), !AIGC_ARTWORKS.some(work => work.kind === kind), `${locale}: ${kind} empty state does not match its media`);
  }
  for (const work of AIGC_ARTWORKS) {
    assert.ok(html.includes(`data-artwork-preview="${work.id}"`), `${locale}: artwork preview missing`);
    assert.ok(gallery.includes(`data-artwork-id="${work.id}"`), `${locale}: artwork missing`);
    const escaped = value => value.replaceAll("&", "&amp;").replaceAll('"', "&quot;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll("'", "&#x27;");
    assert.ok(html.includes(escaped(work.title[locale])) && gallery.includes(escaped(work.title[locale])), `${locale}: artwork title missing`);
    if (work.kind === "images") assert.ok(gallery.includes(`alt="${escaped(work.alt[locale])}"`) && gallery.includes(`src="${work.src}"`), `${locale}: artwork image/alt missing`);
  }
  for (const [kind, tag] of [["videos", "video"], ["music", "audio"]]) {
    if (!AIGC_ARTWORKS.some(work => work.kind === kind)) assert.ok(!new RegExp(`<${tag}\\b`).test(gallery), `${locale}: ${tag} player rendered without media`);
  }
  if (!AIGC_ARTWORKS.length) {
    assert.ok(!/<(?:video|audio)\b/.test(gallery), `${locale}: player rendered without media`);
    assert.ok(!gallery.includes('data-artwork-id="'), `${locale}: fake artwork rendered`);
  }
  assert.ok(!gallery.includes("autoplay"), `${locale}: gallery must not autoplay`);
  console.log(`${locale}: ${AIGC_ARTWORKS.length} approved artworks, localized previews, empty rooms and media boundaries verified`);
  console.log(`${locale}: home previews, AI Agent collection, four projects, three themes and metadata verified`);
}
assert.ok(!fs.existsSync(new URL("blogs/", root)), "old blog assets copied into standalone portfolio");
assert.ok(!fs.existsSync(new URL("portfolio/fonts/", root)), "old nested asset path copied into standalone portfolio");
console.log(`Standalone export verified at ${path.resolve("out")}`);
