import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = new URL("../out/", import.meta.url);
const languages = {"zh-CN": "", "zh-TW": "zh-TW/", en: "en/", ja: "ja/"};
for (const [locale, dir] of Object.entries(languages)) {
  const html = fs.readFileSync(new URL(`${dir}index.html`, root), "utf8");
  const copy = JSON.parse(fs.readFileSync(new URL(`../src/i18n/messages/${locale}.json`, import.meta.url), "utf8"));
  assert.match(html, new RegExp(`<html[^>]*lang="${locale}"`), `${locale}: incorrect document language`);
  assert.ok(html.includes(copy.hero.lead.trim().replaceAll("&", "&amp;")), `${locale}: headline not rendered in static HTML`);
  for (const id of ["logicduo", "allfeeds", "genchi"]) assert.ok(html.includes(`data-project-id="${id}"`));
  assert.ok(!html.includes('href="#writing"') && !html.includes('id="writing"'), `${locale}: removed blog section returned`);
  assert.equal([...html.matchAll(/href="mailto:yqh611@gmail\.com"/g)].length, 2, `${locale}: contact actions must use the current Gmail address`);
  assert.ok(!html.includes("yqh611@126.com"), `${locale}: old email address returned`);
  for (const alternate of ["zh-Hans", "zh-Hant", "en", "ja"]) assert.ok(html.includes(`hrefLang="${alternate}"`), `${locale}: missing alternate ${alternate}`);
  for (const [, src] of html.matchAll(/(?:src|href)="([^"?#]+)(?:[?#][^"]*)?"/g)) {
    if (!src.startsWith("/") || src === "/" || src.endsWith("/")) continue;
    assert.ok(fs.existsSync(new URL(src.slice(1), root)), `${locale}: missing local resource ${src}`);
  }
  console.log(`${locale}: static HTML, document language, three projects, metadata and local resources verified`);
}
assert.ok(!fs.existsSync(new URL("blogs/", root)), "old blog assets copied into standalone portfolio");
assert.ok(!fs.existsSync(new URL("portfolio/fonts/", root)), "old nested asset path copied into standalone portfolio");
console.log(`Standalone export verified at ${path.resolve("out")}`);
