import { test } from "node:test";
import assert from "node:assert/strict";
import { read, stripComments } from "./_helpers.mjs";

const html = () => stripComments(read("index.html"));
const css = () => stripComments(read("css/style.css"));

test("todo target=_blank usa rel=noopener noreferrer", () => {
  const blanks = [...html().matchAll(/<a\b[^>]*target=["']_blank["'][^>]*>/gi)].map((m) => m[0]);
  assert.ok(blanks.length > 0, "nenhum link com target=_blank encontrado");
  const unprotected = blanks.filter((tag) => {
    const rel = /\brel\s*=\s*["']([^"']*)["']/i.exec(tag);
    if (!rel) return true;
    const value = rel[1].toLowerCase();
    return !(value.includes("noopener") && value.includes("noreferrer"));
  });
  assert.deepEqual(
    unprotected.map((t) => t.replace(/\s+/g, " ").slice(0, 90)),
    [],
    "target=_blank sem proteção contra reverse tabnabbing"
  );
});

test("nenhum href usa esquema perigoso", () => {
  const hrefs = [...html().matchAll(/\bhref\s*=\s*["']([^"']*)["']/gi)].map((m) => m[1]);
  const dangerous = hrefs.filter((h) => /^\s*(javascript|data|vbscript):/i.test(h));
  assert.deepEqual(dangerous, []);
  assert.equal(/<a\b[^>]*\bhref\s*=\s*["']\s*["']/i.test(html()), false, "href vazio");
});

test("nenhum handler de evento inline no HTML", () => {
  const tags = [...html().matchAll(/<[a-z][^>]*>/gi)].map((m) => m[0]);
  const inline = tags.filter((t) => /\son[a-z]+\s*=/i.test(t));
  assert.deepEqual(
    inline.map((t) => t.replace(/\s+/g, " ").slice(0, 90)),
    []
  );
  assert.equal(/<iframe\b/i.test(html()), false, "iframe não é esperado neste site");
});

test("nenhuma requisição insegura ou de terceiros em runtime", () => {
  const doc = html();
  // http:// puro (exclui o namespace SVG dentro de data: URI, que não é requisição)
  const plainHttp = [...doc.matchAll(/(?:src|href)\s*=\s*["'](http:\/\/[^"']+)["']/gi)].map((m) => m[1]);
  assert.deepEqual(plainHttp, []);
  assert.equal(/<meta[^>]+http-equiv=["']Content-Security-Policy/i.test(doc), false,
    "CSP por meta exigiria unsafe-inline — usar cabeçalho real na Render");
});

test("referrer é limitado para não vazar a URL completa a terceiros", () => {
  assert.match(
    html(),
    /<meta\s+name=["']referrer["']\s+content=["']strict-origin-when-cross-origin["']\s*\/?>/i
  );
});

test("indicador de foco é espesso o bastante para ser visto", () => {
  const rule = /:focus-visible\s*\{([^}]*)\}/.exec(css());
  assert.ok(rule, "regra :focus-visible ausente");
  const width = /outline-width:\s*([\d.]+)px/.exec(rule[1]) || /outline:\s*(\d+)px/.exec(rule[1]);
  assert.ok(width, "largura do outline não declarada");
  assert.ok(Number(width[1]) >= 2, `outline de ${width[1]}px é fino demais`);
  assert.match(rule[1], /outline-style:\s*solid|outline:\s*\d+px\s+solid/);
  assert.match(rule[1], /outline-offset:/);
});
