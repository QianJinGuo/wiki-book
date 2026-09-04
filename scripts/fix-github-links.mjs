#!/usr/bin/env node
/**
 * Rewrite generated wiki-book links to the two public layers.
 *
 * Published chapter markdown may point to wiki-public for curated
 * entity/concept/navigation pages. Raw article copies are private and are
 * deliberately not recreated by this helper.
 */

import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { wikiPublicUrl } from "./link-config.mjs";

const DOCS_DIR = join(process.cwd(), "docs");
const APPLY = process.argv.includes("--apply");
const PUBLIC_TYPES = new Set(["entities", "concepts", "comparisons", "queries", "moc"]);

function walkMarkdown(directory, result = []) {
  for (const entry of readdirSync(directory, { withFileTypes: true }).sort((a, b) =>
    a.name.localeCompare(b.name),
  )) {
    if (entry.name === "raw" || entry.name === "site" || entry.name === "node_modules") continue;
    const path = join(directory, entry.name);
    if (entry.isDirectory()) walkMarkdown(path, result);
    else if (entry.isFile() && entry.name.endsWith(".md")) result.push(path);
  }
  return result;
}

function rewriteUrl(url) {
  const match = url.match(
    /^https:\/\/github\.com\/QianJinGuo\/wiki\/(?:blob|tree|raw)\/main\/(.+)$/,
  );
  if (!match) return null;

  const target = match[1].replace(/[.,;!?]+$/, "").replace(/\.md\.md$/, ".md");
  const publicMatch = target.match(
    /^(entities|concepts|comparisons|queries|moc)\/(.+\.md)$/,
  );
  if (publicMatch && PUBLIC_TYPES.has(publicMatch[1])) return wikiPublicUrl(target);
  return null;
}

function rewriteContent(content) {
  let replacements = 0;
  const rewritten = content.replace(
    /https:\/\/github\.com\/QianJinGuo\/wiki\/(?:blob|tree|raw)\/main\/[^\s<>`)]+/g,
    (url) => {
      const replacement = rewriteUrl(url);
      if (!replacement) return url;
      replacements += 1;
      return replacement;
    },
  );
  return { content: rewritten, replacements };
}

const files = walkMarkdown(DOCS_DIR);
let filesModified = 0;
let totalReplaced = 0;
let staleUrls = 0;

for (const file of files) {
  const original = readFileSync(file, "utf8");
  const result = rewriteContent(original);
  totalReplaced += result.replacements;
  if (result.content !== original) {
    filesModified += 1;
    if (APPLY) writeFileSync(file, result.content, "utf8");
  }
  staleUrls += (result.content.match(
    /https:\/\/github\.com\/QianJinGuo\/wiki\/(?:blob|tree|raw)\/main\//g,
  ) || []).length;
}

console.log(
  `${APPLY ? "Applied" : "Found"} ${totalReplaced} two-layer link rewrites in ${filesModified} files`,
);

if (!APPLY && filesModified > 0) {
  console.log("Run with --apply to write the generated links.");
}
if (staleUrls > 0) {
  console.error(`Unmapped private wiki URLs remain: ${staleUrls}`);
  process.exitCode = 1;
}
