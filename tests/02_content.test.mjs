import { test } from "node:test";
import assert from "node:assert/strict";
import { read, stripComments } from "./_helpers.mjs";

const html = () => stripComments(read("index.html"));
const css = () => stripComments(read("css/style.css"));
const js = () => stripComments(read("js/script.js"));

test("identidade e formação verdadeiras", () => {
  const doc = html();
  // O CSS aplica uppercase em alguns rótulos, então a comparação ignora caixa.
  const normalized = doc.toLowerCase();
  for (const fact of ["Tiago Santos", "Vittal Web", "Unex", "Sistemas de Informação", "1º semestre"]) {
    assert.ok(normalized.includes(fact.toLowerCase()), `fato ausente: ${fact}`);
  }
});

test("estágio na Vittal Web está marcado como concluído", () => {
  const doc = html();
  const experienceStart = doc.indexOf('id="experiencia"');
  const projectsStart = doc.indexOf('id="projetos"', experienceStart);
  const experience = doc.slice(experienceStart, projectsStart);

  assert.match(experience, /ESTÁGIO CONCLUÍDO/);
  assert.doesNotMatch(experience, /CARGO ATUAL/);
  assert.match(experience, /Jun\/2026 – Nov\/2026/);
  assert.doesNotMatch(doc, /desenvolvedor Full Stack na Vittal Web/i);
  assert.doesNotMatch(doc, /"affiliation":\s*\{\s*"@type":\s*"Organization",\s*"name":\s*"Vittal Web"/);
});

test("localização verdadeira: Vitória da Conquista, BA", () => {
  const doc = html().toLowerCase();
  assert.ok(doc.includes("vitória da conquista"), "cidade ausente");
  assert.ok(doc.includes("addresslocality"), "JSON-LD sem localidade");
  assert.ok(doc.includes('"addresslocality": "vitória da conquista"'), "JSON-LD desatualizado");
  assert.equal(doc.includes("salvador"), false, "cidade antiga ainda presente");
  // fuso da Bahia continua UTC-3
  assert.ok(doc.includes("utc-3"));
});

test("os seis projetos e seus links reais estão presentes", () => {
  const doc = html();
  const projects = {
    "Gnosis IA": "ia-study-wheat.vercel.app",
    "Connect Dev": "connectdev.network",
    "Pergunta da Igreja SUD": "projeto-quiz-sud.vercel.app",
    Promise: "promise-8s8f.onrender.com",
    Polearn: "polearn.onrender.com",
    "Acompanhamento de Pessoas": "project-lma-99.onrender.com",
  };
  for (const [name, url] of Object.entries(projects)) {
    assert.ok(doc.includes(name), `projeto ausente: ${name}`);
    assert.ok(doc.includes(url), `link ausente de ${name}: ${url}`);
  }
  assert.ok(doc.includes("github.com/Tyago-santos"));
});

test("currículo em PDF está linkado e existe", () => {
  const doc = html();
  assert.match(doc, /assets\/curriculo_tiago_dev\.pdf/);
  assert.match(doc, /<a[^>]+download/i);
});

test("não há métricas ou provas fabricadas", () => {
  const doc = html();
  for (const fake of ["99.98%", "100% uptime", "< 10ms", "120Hz", "Clientes", "Depoimentos"]) {
    assert.equal(doc.includes(fake), false, `claim fabricado: ${fake}`);
  }
});

test("contato lista os canais reais", () => {
  const doc = html();
  for (const link of [
    "linkedin.com/in/tiago-santos-b10165376",
    "github.com/Tyago-santos",
    "instagram.com/tiago_skywalker",
    "mailto:xlzthyago@gmail.com",
  ]) {
    assert.ok(doc.includes(link), `canal ausente: ${link}`);
  }
});

test("tokens visuais da referência estão definidos", () => {
  const sheet = css();
  const tokens = {
    "--bg:": "#f9f9f7",
    "--ink-100:": "#0a0a0c",
    "--font-display:": "Space Grotesk",
    "--font-body:": "Inter",
    "--font-mono:": "JetBrains Mono",
  };
  for (const [token, value] of Object.entries(tokens)) {
    assert.match(sheet, new RegExp(`${token}\\s*[^;]*${value}`, "i"), `token ${token} ausente`);
  }
});

test("acessibilidade de movimento e foco implementada", () => {
  const sheet = css();
  assert.match(sheet, /@media\s*\(prefers-reduced-motion:\s*reduce\)/);
  assert.match(sheet, /:focus-visible/);
  assert.equal(/cursor:\s*none/i.test(sheet), false);
});

test("JS é vanilla e defensivo", () => {
  const source = js();
  assert.equal(/^\s*import\s/m.test(source), false);
  assert.equal(/require\(/.test(source), false);
  assert.equal(/innerHTML\s*=/.test(source), false);
  assert.equal(/document\.write/.test(source), false);
  assert.equal(/eval\(/.test(source), false);
  assert.match(source, /prefers-reduced-motion/);
  assert.match(source, /addEventListener\(\s*["']scroll["'][^)]*passive:\s*true/s);
  assert.match(source, /IntersectionObserver/);
});
