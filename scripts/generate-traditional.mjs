import { readFile, writeFile, mkdir } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import OpenCC from "opencc-js";
import ts from "typescript";

const root = fileURLToPath(new URL("../", import.meta.url));
const convert = OpenCC.Converter({ from: "cn", to: "tw" });
function convertValues(value) {
  if (typeof value === "string") return convert(value);
  if (Array.isArray(value)) return value.map(convertValues);
  return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, convertValues(item)]));
}

for (const directory of ["messages", "catalog"]) {
  const input = JSON.parse(await readFile(resolve(root, `src/i18n/${directory}/zh-CN.json`), "utf8"));
  await writeFile(resolve(root, `src/i18n/${directory}/zh-TW.json`), `${JSON.stringify(convertValues(input), null, 2)}\n`);
}

const directory = resolve(root, "public/blogs/translations/zh-TW");
await mkdir(directory, { recursive: true });
const messages = JSON.parse(await readFile(resolve(root, "src/i18n/messages/zh-CN.json"), "utf8"));
for (const id of Object.keys(messages.blog.posts)) {
  const source = await readFile(resolve(root, `src/content/blogs/${id}.ts`), "utf8");
  const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
  const exports = {};
  new Function("exports", compiled)(exports);
  const body = convert(exports.body).replace(/^> +$/gm, ">").trimEnd();
  await writeFile(resolve(directory, `${id}.md`), `${body}\n`);
}
console.log("Traditional Chinese messages, recommendations, and four complete articles generated.");
