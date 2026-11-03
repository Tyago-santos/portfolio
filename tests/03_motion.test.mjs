import { test } from "node:test";
import assert from "node:assert/strict";
import { read, stripComments } from "./_helpers.mjs";

const html = () => stripComments(read("index.html"));
const css = () => stripComments(read("css/style.css"));
const js = () => stripComments(read("js/script.js"));

test("título do hero é composto por letras com entrada escalonada", () => {
  const doc = html();
  const h1 = /<h1[^>]*aria-label=["']Tiago Santos["'][\s\S]*?<\/h1>/i.exec(doc);
  assert.ok(h1, "h1 sem aria-label acessível");

  const letters = [...h1[0].matchAll(/<span class="ch" style="--i:(\d+)">/g)].map((m) =>
    Number(m[1])
  );
  assert.equal(letters.length, 11, `esperava 11 letras, achei ${letters.length}`);
  assert.deepEqual(letters, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  // as letras continuam estáticas no HTML: visíveis sem JavaScript
  assert.ok(h1[0].includes("T</span>"));
  assert.ok(h1[0].includes("S</span>"));
});

test("barra de progresso do scroll existe e é decorativa", () => {
  const doc = html();
  const bar = /<div class="hud__progress"[^>]*>[\s\S]*?<\/div>/.exec(doc);
  assert.ok(bar, "barra de progresso ausente");
  assert.match(bar[0], /aria-hidden=["']true["']/);
  assert.match(bar[0], /data-scroll-progress/);
  assert.match(css(), /\.hud__progress\s+span\s*\{[^}]*transform-origin:/);
  assert.match(js(), /\[data-scroll-progress\]/);
  assert.match(js(), /scaleX\(/);
});

test("listas de cards entram em cascata", () => {
  const doc = html();
  const cssSource = css();
  for (const grid of ["xp__grid", "projects__grid", "ct__links", "focus"]) {
    assert.ok(
      new RegExp(`class="[^"]*${grid}[^"]*"`).test(doc),
      `container ${grid} ausente`
    );
  }
  const staggered = [...doc.matchAll(/--i:(\d+)/g)].map((m) => Number(m[1]));
  assert.ok(
    staggered.length >= 20,
    `esperava ao menos 20 elementos escalonados, achei ${staggered.length}`
  );
  assert.match(
    cssSource,
    /\.js\s+\[data-reveal\][^}]*transition-delay:\s*calc\(var\(--i/s,
    "atraso de cascata não aplicado sob .js"
  );
});

test("revelação por recorte (wipe) fica visível sem JavaScript", () => {
  const doc = html();
  const cssSource = css();
  assert.ok(/class="case__frame" data-wipe/.test(doc), "case__frame sem data-wipe");
  assert.equal(
    /(^|})\s*\[data-wipe\]\s*\{/m.test(cssSource),
    false,
    "regra [data-wipe] sem o prefixo .js esconderia conteúdo sem JS"
  );
  assert.match(cssSource, /\.js\s+\[data-wipe\]\s*\{[^}]*clip-path:\s*inset\(0\s+0\s+100%\s+0\)/);
  assert.match(cssSource, /\.js\s+\[data-wipe\]\.is-in\s*\{[^}]*clip-path:\s*inset\(0/);
});

test("movimento reduzido neutraliza atrasos e animações novas", () => {
  const cssSource = css();
  const block = /@media\s*\(prefers-reduced-motion:\s*reduce\)\s*\{[\s\S]*?\n\}/.exec(
    cssSource
  );
  assert.ok(block, "bloco prefers-reduced-motion ausente");
  assert.match(block[0], /transition-delay:\s*0ms\s*!important/);
  assert.match(block[0], /animation-delay:\s*0ms\s*!important/);

  // foto do hero: entrada + flutuação sutil
  assert.match(cssSource, /@keyframes\s+photo-in/);
  assert.match(cssSource, /@keyframes\s+photo-float/);
  assert.match(cssSource, /\.hero__photo img\s*\{[^}]*animation:[^}]*photo-float/s);

  // giant text da seção de atuação deriva com o scroll
  assert.match(cssSource, /\.xp__giant\s*\{[^}]*--gx/s);
  assert.match(js(), /--gx/);
});

test("mix-blend-mode do título não é isolado por stacking context", () => {
  const cssSource = css();
  const title = /\.hero__title\s*\{([^}]*)\}/.exec(cssSource);
  assert.ok(title, "regra .hero__title ausente");
  assert.match(title[1], /mix-blend-mode:\s*difference/, "título sem blend difference");

  // Um z-index em .hero__stage cria stacking context e isola o blend: o título
  // fica branco sobre o fundo claro do hero e some. Regressão real já vivida.
  const stage = /\.hero__stage\s*\{([^}]*)\}/.exec(cssSource);
  assert.ok(stage, "regra .hero__stage ausente");
  assert.equal(
    /\bz-index\s*:/.test(stage[1]),
    false,
    ".hero__stage com z-index isola o mix-blend-mode do título"
  );

  // as coordenadas do hero continuam acima do título gigante
  assert.match(cssSource, /\.hero__coord\s*\{[^}]*z-index:\s*7/);
});

test("imagens revelam sua cor natural apenas sob o cursor", () => {
  const sheet = css();
  const source = js();

  const reveal = /\.cursor-image-reveal\s*\{([^}]*)\}/.exec(sheet);
  assert.ok(reveal, "camada de revelação de imagem ausente");
  assert.match(reveal[1], /position:\s*fixed/);
  assert.match(reveal[1], /display:\s*none/);
  assert.match(reveal[1], /pointer-events:\s*none/);
  assert.match(sheet, /\.cursor-image-reveal\.is-visible\s*\{[^}]*display:\s*block/);
  assert.match(sheet, /\.project__cover img\s*\{[^}]*filter:\s*grayscale\(1\)/);
  assert.doesNotMatch(sheet, /\.project__cover:hover img\s*\{[^}]*filter:\s*grayscale\(0\)/);
  assert.match(source, /function initCursorImageReveal\(\)/);
  assert.match(source, /document\.addEventListener\(\s*["']pointermove["']/);
  assert.match(source, /event\.pointerType === ["']touch["']/);
  assert.match(source, /event\.target\.closest\("img"\)/);
  assert.match(source, /radial-gradient\(circle/);
  assert.match(source, /requestAnimationFrame\(paint\)/);
});

test("texto ganha degradê colorido apenas perto do cursor", () => {
  const sheet = css();
  const source = js();
  const textEffect = /\.cursor-text-color\s*\{([^}]*)\}/.exec(sheet);

  assert.ok(textEffect, "efeito localizado de cor no texto ausente");
  assert.match(textEffect[1], /background-clip:\s*text/);
  assert.match(textEffect[1], /radial-gradient\(/);
  assert.match(textEffect[1], /#83d8c0/);
  assert.match(textEffect[1], /#74bce3/);
  assert.match(textEffect[1], /#a69ae7/);
  assert.match(textEffect[1], /var\(--cursor-text-base\)/);
  assert.match(source, /function textNodeAt\(x, y\)/);
  assert.match(source, /parent\.closest\("button, \.btn"\)/);
  assert.match(source, /event\.target\.closest\("button, \.btn"\)/);
  assert.match(source, /activeText\.classList\.add\("cursor-text-color"\)/);
  assert.match(source, /activeText\.style\.removeProperty\("--cursor-text-x"\)/);
});

test("botões mantêm as cores base ao passar o cursor", () => {
  const sheet = css();

  assert.match(sheet, /\.btn:hover\s*\{[^}]*transform:\s*translateY\(-1px\)/);
  assert.doesNotMatch(sheet, /\.btn:hover\s*\{[^}]*\b(?:background|color|border-color)\s*:/);
  assert.doesNotMatch(sheet, /\.btn--(?:solid|dark):hover\s*\{/);
  assert.doesNotMatch(sheet, /\.hero__actions \.btn:hover\s*\{/);
});

test("nenhuma animação nova depende de JavaScript para exibir conteúdo", () => {
  const doc = html();
  // as letras do h1 são HTML estático, sem injeção por script
  const h1 = /<h1[^>]*>[\s\S]*?<\/h1>/.exec(doc);
  assert.ok(h1, "h1 ausente");
  assert.equal(/<script/i.test(h1[0]), false, "h1 depende de script");
  assert.equal(/<noscript/i.test(h1[0]), false);
  // a barra de progresso é decorativa e não esconde texto
  assert.match(doc, /hud__progress[^>]*aria-hidden=["']true["']/);
});
