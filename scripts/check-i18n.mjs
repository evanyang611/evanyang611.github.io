import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { resolve } from "node:path";
import ts from "typescript";

const root = fileURLToPath(new URL("../", import.meta.url));
const locales = ["zh-CN", "zh-TW", "en", "ja"];
const read = (path) => readFile(resolve(root, path), "utf8");
const readJSON = async (path) => JSON.parse(await read(path));
const source = await readJSON("src/i18n/messages/zh-CN.json");

function compareShape(expected, actual, location) {
  if (typeof expected === "string") {
    assert.equal(typeof actual, "string", location);
    assert.ok(actual.trim(), `${location}: empty translation`);
  } else if (Array.isArray(expected)) {
    assert.ok(Array.isArray(actual), location);
    assert.equal(actual.length, expected.length, `${location}: incomplete list`);
    expected.forEach((item, i) => compareShape(item, actual[i], `${location}.${i}`));
  } else {
    assert.deepEqual(Object.keys(actual).sort(), Object.keys(expected).sort(), `${location}: translation keys differ`);
    Object.entries(expected).forEach(([key, item]) => compareShape(item, actual[key], `${location}.${key}`));
  }
}

const originalCatalog = await readJSON("src/i18n/catalog/zh-CN.json");
for (const locale of locales) {
  compareShape(source, await readJSON(`src/i18n/messages/${locale}.json`), locale);
  compareShape(originalCatalog, await readJSON(`src/i18n/catalog/${locale}.json`), `${locale}.catalog`);
}

for (const kind of ["anime", "game"]) {
  const generated = await read(`src/content/${kind}.generated.ts`);
  const entries = JSON.parse(generated.slice(generated.indexOf("= [") + 2).trim().replace(/;$/, ""));
  assert.deepEqual(Object.keys(originalCatalog[kind]).sort(), entries.map((entry) => String(entry.id)).sort(), `${kind}: every recommendation needs translations`);
}

const resources = (body) => {
  const prose = body.replace(/^```[^\n]*\n[\s\S]*?^```/gm, "");
  return [
    ...Array.from(prose.matchAll(/\]\(([^)]+)\)/g), (match) => match[1]),
    ...Array.from(prose.matchAll(/\bsrc="([^"]+)"/g), (match) => match[1]),
  ].sort();
};
const headings = (body) => Array.from(body.matchAll(/^(#{1,6})\s/gm), (match) => match[1]);
const fences = (body) => (body.match(/^```/gm) ?? []).length;
const formulas = (body) => body.match(/\$\$[\s\S]*?\$\$/g) ?? [];

for (const id of Object.keys(source.blog.posts)) {
  const compiled = ts.transpileModule(await read(`src/content/blogs/${id}.ts`), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
  const exports = {};
  new Function("exports", compiled)(exports);
  for (const locale of locales.slice(1)) {
    const body = await read(`public/blogs/translations/${locale}/${id}.md`);
    assert.ok(body.trim(), `${locale}/${id}: missing article`);
    assert.deepEqual(resources(body), resources(exports.body), `${locale}/${id}: images, links, or audio changed`);
    assert.deepEqual(headings(body), headings(exports.body), `${locale}/${id}: article sections missing`);
    assert.equal(fences(body), fences(exports.body), `${locale}/${id}: code blocks missing`);
    assert.deepEqual(formulas(body), formulas(exports.body), `${locale}/${id}: formula changed`);
    if (locale === "en") assert.ok(!/[\u3400-\u9fff]/u.test(body), `${locale}/${id}: untranslated Chinese`);
  }
}
console.log("Four languages verified: all UI keys, 22 recommendation details, four complete articles, original links, images, formulas, and audio.");
