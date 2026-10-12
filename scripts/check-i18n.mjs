import assert from "node:assert/strict";
import fs from "node:fs";

const locales = ["zh-CN", "zh-TW", "en", "ja"];
const messages = Object.fromEntries(locales.map(locale => [locale, JSON.parse(fs.readFileSync(new URL(`../src/i18n/messages/${locale}.json`, import.meta.url), "utf8"))]));
function entries(value, path = "") {
  if (typeof value === "string") return [[path, value]];
  return Object.entries(value).flatMap(([key, child]) => entries(child, `${path}.${key}`));
}
const baseline = entries(messages["zh-CN"]);
for (const locale of locales) {
  const translated = entries(messages[locale]);
  assert.deepEqual(translated.map(([key]) => key), baseline.map(([key]) => key), `${locale}: translation structure or array lengths differ`);
  for (let i = 0; i < baseline.length; i++) {
    const [key, value] = translated[i];
    assert.ok(value.trim(), `${locale}: empty ${key}`);
    assert.deepEqual(value.match(/\{\w+\}/g) ?? [], baseline[i][1].match(/\{\w+\}/g) ?? [], `${locale}: damaged placeholder ${key}`);
  }
  assert.equal(messages[locale].projects.allfeeds.linkLabels.length, 2);
  assert.ok(!("writing" in messages[locale].nav), `${locale}: removed blog navigation returned`);
  console.log(`${locale}: ${translated.length} nonempty translated strings; project/feature/link coverage complete`);
}
