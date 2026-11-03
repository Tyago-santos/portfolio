import { readFileSync, existsSync, readdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

/** Lê um arquivo de texto relativo à raiz do repo. */
export function read(rel) {
  return readFileSync(join(ROOT, rel), "utf8");
}

export function exists(rel) {
  return existsSync(join(ROOT, rel));
}

export function list(rel) {
  return readdirSync(join(ROOT, rel), { withFileTypes: true });
}

/** Remove comentários HTML e CSS para evitar falsos positivos. */
export function stripComments(source) {
  return source
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/\/\*[\s\S]*?\*\//g, "");
}

/** Coleta atributos src/href de tags específicas. */
export function collectRefs(html, tagPattern = /<(img|link|script)\b[^>]*>/gi) {
  const refs = [];
  for (const [tag] of html.matchAll(tagPattern)) {
    const attr = /\b(?:src|href)\s*=\s*["']([^"']+)["']/i.exec(tag);
    if (attr) refs.push({ tag, url: attr[1] });
  }
  return refs;
}

/** URLs que apontam para fora do site. */
export function isExternal(url) {
  return /^(?:[a-z][a-z0-9+.-]*:|\/\/)/i.test(url);
}

/** Todas as âncoras internas (#id) do HTML. */
export function anchors(html) {
  return [...html.matchAll(/href\s*=\s*["']#([^"']+)["']/gi)].map((m) => m[1]);
}

export function ids(html) {
  return [...html.matchAll(/\bid\s*=\s*["']([^"']+)["']/gi)].map((m) => m[1]);
}
