import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { read, exists, collectRefs, isExternal, stripComments } from "./_helpers.mjs";

test("js/script.js passa na verificação de sintaxe", () => {
  const check = spawnSync(process.execPath, ["--check", "js/script.js"], {
    cwd: process.cwd(),
    encoding: "utf8",
  });
  assert.equal(check.status, 0, `node --check falhou:\n${check.stderr}`);
});

test("todos os assets locais referenciados existem", () => {
  const html = stripComments(read("index.html"));
  const missing = collectRefs(html)
    .filter(({ url }) => !isExternal(url) && !url.startsWith("#"))
    .map(({ url }) => url.replace(/^\.\//, "").replace(/[?#].*$/, ""))
    .filter((url) => url && !exists(url));
  assert.deepEqual(missing, []);
});

// Apenas tags que o navegador baixa em runtime. Metadados como
// <link rel="canonical"> apontam para fora por natureza e não carregam nada.
const RUNTIME_LINK_REL = /\brel\s*=\s*["'](?:stylesheet|preload|prefetch|modulepreload|icon|shortcut icon|apple-touch-icon|manifest|mask-icon)\b/i;
const isRuntimeTag = (tag) => {
  if (/^<link\b/i.test(tag)) return RUNTIME_LINK_REL.test(tag);
  return true;
};

test("nenhum recurso de runtime vem de CDN externa", () => {
  const html = stripComments(read("index.html"));
  const css = stripComments(read("css/style.css"));
  const external = collectRefs(html, /<(img|link|script)\b[^>]*>/gi)
    .filter(({ tag }) => isRuntimeTag(tag))
    .filter(({ url }) => isExternal(url) && !url.startsWith("data:"))
    .map(({ url }) => url);
  assert.deepEqual(external, []);
  assert.equal(/@import\s+url\(\s*["']?https?:/i.test(css), false);
  assert.equal(/url\(\s*["']?https?:/i.test(css), false);
});

test("fonte Space Grotesk está self-hosted e pré-carregada", () => {
  assert.equal(exists("assets/fonts/space-grotesk-latin.woff2"), true);
  const html = read("index.html");
  assert.match(html, /rel=["']preload["'][^>]*space-grotesk-latin\.woff2/i);
  assert.match(html, /@font-face[\s\S]*?Space Grotesk/i);
  assert.match(read("css/style.css"), /--font-display:\s*["']Space Grotesk["']/);
});

test("o único script é local e não há placeholder", () => {
  const html = read("index.html");
  assert.equal(/<script[^>]+src=["'](?:https?:)?\/\//i.test(html), false);
  assert.match(html, /<script[^>]+src=["']\.\/js\/script\.js["']/i);
  assert.equal(/lorem ipsum/i.test(html), false);
});

test("favicon é SVG local e não puxa recurso externo", () => {
  const html = read("index.html");
  const icon = /<link[^>]*rel=["']icon["'][^>]*>/i.exec(html);
  assert.ok(icon, "link rel=icon ausente");
  assert.match(icon[0], /href=["']\.\/assets\/favicon\.svg["']/i, "favicon não aponta para ./assets/favicon.svg");
  assert.match(icon[0], /type=["']image\/svg\+xml["']/i);

  const svg = read("assets/favicon.svg").trim();
  assert.ok(svg.startsWith("<svg"), "assets/favicon.svg não é um SVG");
  assert.match(svg, /viewBox=["']0 0 \d+ \d+["']/, "SVG sem viewBox não escala");

  // Um favicon precisa renderizar idêntico em qualquer navegador: sem @font-face,
  // sem url() e sem http — senão o glifo muda (ou some) conforme a plataforma.
  assert.equal(/@font-face/i.test(svg), false, "favicon declara @font-face");
  assert.equal(/url\(/i.test(svg), false, "favicon carrega recurso por url()");
  assert.equal(/(?:src|href)=["'](?:https?:)?\/\//i.test(svg), false, "favicon referencia URL externa");

  // A pilha de fonte precisa terminar numa família genérica, para haver fallback.
  const fam = /font-family=(["'])(.*?)\1/.exec(svg);
  assert.ok(fam, "favicon sem font-family");
  const stack = fam[2].split(",").map((s) => s.trim().replace(/^['"]|['"]$/g, ""));
  assert.match(
    stack[stack.length - 1],
    /^(?:sans-serif|serif|monospace|cursive|fantasy)$/i,
    `última família da pilha deve ser genérica, veio "${stack[stack.length - 1]}"`
  );
});
