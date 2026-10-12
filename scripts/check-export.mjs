import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { PROJECTS, THEMES } from "../src/content/projects.ts";

assert.equal(PROJECTS.find(project => project.id === "forearena").links[0].href, "https://forearena.com/", "ForeArena must link to the user-selected product");
const root = new URL("../out/", import.meta.url);
const languages = {"zh-CN": "", "zh-TW": "zh-TW/", en: "en/", ja: "ja/"};
for (const [locale, dir] of Object.entries(languages)) {
  const html = fs.readFileSync(new URL(`${dir}index.html`, root), "utf8");
  const copy = JSON.parse(fs.readFileSync(new URL(`../src/i18n/messages/${locale}.json`, import.meta.url), "utf8"));
  assert.match(html, new RegExp(`<html[^>]*lang="${locale}"`), `${locale}: incorrect document language`);
  assert.ok(html.includes(copy.hero.lead.trim().replaceAll("&", "&amp;")), `${locale}: headline not rendered in static HTML`);
  for (const { id } of PROJECTS) assert.ok(html.includes(`data-project-id="${id}"`));
  for (const { id, title } of THEMES) {
    assert.ok(html.includes(`id="work-${id}"`) && html.includes(title), `${locale}: missing theme ${id}`);
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
  console.log(`${locale}: static HTML, document language, four projects, three themes, metadata and local resources verified`);
}
assert.ok(!fs.existsSync(new URL("blogs/", root)), "old blog assets copied into standalone portfolio");
assert.ok(!fs.existsSync(new URL("portfolio/fonts/", root)), "old nested asset path copied into standalone portfolio");
console.log(`Standalone export verified at ${path.resolve("out")}`);
