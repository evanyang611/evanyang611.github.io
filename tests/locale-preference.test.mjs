import assert from "node:assert/strict";
import test from "node:test";
import { browserLocale, preferredLocale } from "../src/i18n/config.ts";

test("matches regional browser languages to the available translations", () => {
  for (const language of ["en", "en-US", "en-GB"]) assert.equal(browserLocale([language]), "en");
  for (const language of ["ja", "ja-JP"]) assert.equal(browserLocale([language]), "ja");
  for (const language of ["zh", "zh-CN", "zh-SG", "zh-Hans"]) assert.equal(browserLocale([language]), "zh-CN");
  for (const language of ["zh-TW", "zh-HK", "zh-MO", "zh-Hant"]) assert.equal(browserLocale([language]), "zh-TW");
});

test("honors browser preference order and explicit Chinese scripts", () => {
  assert.equal(browserLocale(["fr-FR", "ja-JP", "en-US"]), "ja");
  assert.equal(browserLocale(["en-US", "zh-CN"]), "en");
  assert.equal(browserLocale(["zh-Hans-TW"]), "zh-CN");
  assert.equal(browserLocale(["zh-Hant-CN"]), "zh-TW");
  assert.equal(browserLocale(["ZH-hAnT-hk"]), "zh-TW");
});

test("defaults to Simplified Chinese when no supported preference exists", () => {
  assert.equal(browserLocale([]), "zh-CN");
  assert.equal(browserLocale(["fr-FR", "de-DE"]), "zh-CN");
  assert.equal(browserLocale([""]), "zh-CN");
});

test("explicit query and saved manual choice take priority over the browser", () => {
  assert.equal(preferredLocale("ja", "en", ["zh-CN"]), "ja");
  assert.equal(preferredLocale(null, "zh-CN", ["en-US"]), "zh-CN");
  assert.equal(preferredLocale(null, "zh-TW", ["ja-JP"]), "zh-TW");
  assert.equal(preferredLocale("unknown", "unknown", ["en-US"]), "en");
  assert.equal(preferredLocale(null, null, ["fr-FR"]), "zh-CN");
});
