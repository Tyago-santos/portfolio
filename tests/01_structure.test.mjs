import { test } from "node:test";
import assert from "node:assert/strict";
import { read, ids, anchors, stripComments } from "./_helpers.mjs";

const html = () => stripComments(read("index.html"));

test("documento em pt-BR com metadados essenciais", () => {
  const doc = html();
  assert.match(doc, /<html[^>]+lang=["']pt-BR["']/i);
  assert.match(doc, /<meta[^>]+name=["']viewport["']/i);
  assert.match(doc, /<meta[^>]+name=["']description["'][^>]+content=["'][^"']{60,}/i);
  assert.match(doc, /<title>[^<]*Tiago Santos[^<]*<\/title>/i);
  assert.match(doc, /rel=["']canonical["']/i);
});

test("seções existem na ordem editorial", () => {
  const doc = html();
  const order = ["top", "sobre", "experiencia", "projetos", "stack", "formacao", "contato"];
  const positions = order.map((id) => {
    const index = doc.search(new RegExp(`id=["']${id}["']`));
    assert.notEqual(index, -1, `seção #${id} ausente`);
    return index;
  });
  assert.deepEqual(positions, [...positions].sort((a, b) => a - b));
});

test("há exatamente um h1 e hierarquia de headings começa nele", () => {
  const doc = html();
  assert.equal((doc.match(/<h1\b/gi) || []).length, 1);
  assert.ok(doc.search(/<h1\b/) < doc.search(/<h2\b/));
});

test("toda imagem tem alt e dimensões declaradas", () => {
  const tags = [...html().matchAll(/<img\b[^>]*>/gi)].map((m) => m[0]);
  assert.ok(tags.length > 0);
  for (const tag of tags) {
    assert.match(tag, /\balt=["'][^"']*["']/, `img sem alt: ${tag}`);
    assert.match(tag, /\bwidth=["']\d+["']/, `img sem width: ${tag}`);
    assert.match(tag, /\bheight=["']\d+["']/, `img sem height: ${tag}`);
  }
});

test("todas as âncoras internas resolvem para um id existente", () => {
  const doc = html();
  const available = new Set(ids(doc));
  const broken = anchors(doc).filter((id) => !available.has(id));
  assert.deepEqual([...new Set(broken)], []);
});

test("skip-link e região principal acessível", () => {
  const doc = html();
  assert.match(doc, /class=["'][^"']*skip-link[^"']*["'][^>]*href=["']#(conteudo|top)["']/i);
  assert.match(doc, /<main[^>]+id=["'](conteudo|main)["']/i);
  assert.match(doc, /<nav[^>]+aria-label=/i);
});

test("projetos: 1 destaque + 5 cards = 6 projetos reais", () => {
  const doc = html();
  assert.equal((doc.match(/data-project(?=[\s>=])/g) || []).length, 6);
  assert.equal((doc.match(/data-project=["']featured["']/g) || []).length, 1);
});

test("navegação mobile usa botão com estado acessível", () => {
  const doc = html();
  assert.match(doc, /data-menu-toggle[^>]+aria-expanded=["']false["']/i);
  assert.match(doc, /data-menu-toggle[^>]+aria-controls=["'][^"']+["']/i);
});

test("conteúdo visível sem JavaScript", () => {
  const css = stripComments(read("css/style.css"));
  assert.equal(/(^|})\s*\[data-reveal\]\s*\{/m.test(css), false);
  assert.match(css, /\.js\s+\[data-reveal\]\s*\{[^}]*opacity:\s*0/i);
});
