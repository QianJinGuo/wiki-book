#!/usr/bin/env node
/** Fail closed when public source or site output contains private material. */

import { existsSync, lstatSync, readdirSync, readFileSync, realpathSync } from "node:fs";
import { join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = resolve(fileURLToPath(new URL("..", import.meta.url)));
const args = process.argv.slice(2);
function option(name, fallback) {
  const index = args.indexOf(name);
  return index >= 0 && args[index + 1] ? resolve(args[index + 1]) : fallback;
}

const sourceRoot = option("--source", projectRoot);
const siteRoot = option("--site", join(sourceRoot, "site"));
const errors = [];
const forbiddenText = [
  ".private-build-marker",
  "wiki-book-private",
  "/Users/jinguo/wiki",
  "site-private",
  "search_index.private.json",
  "neighbor_graph.private.json",
  "rag-private-",
];

function walk(root, callback) {
  if (!existsSync(root)) return;
  for (const entry of readdirSync(root, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
    if ([".git", "node_modules", ".venv", "site-private", ".build-private", "backups"].includes(entry.name)) continue;
    const path = join(root, entry.name);
    if (entry.isDirectory()) walk(path, callback);
    else if (entry.isFile()) callback(path);
  }
}

function textOf(path) {
  try {
    const buffer = readFileSync(path);
    if (buffer.includes(0)) return null;
    return buffer.toString("utf8");
  } catch {
    return null;
  }
}

function isReliableSourceUrl(sourceUrl) {
  try {
    const parsed = new URL(sourceUrl);
    if (!/^https?:$/.test(parsed.protocol) || !parsed.hostname) return false;
    const host = parsed.hostname.toLowerCase();
    return ![
      "unknown",
      "example.com",
      "localhost",
      "127.0.0.1",
      "hf-mirror.com",
    ].some((blocked) => host === blocked || host.endsWith(`.${blocked}`));
  } catch {
    return false;
  }
}

function checkText(root, label, skip = () => false) {
  walk(root, (path) => {
    if (skip(path)) return;
    const text = textOf(path);
    if (text === null) return;
    for (const marker of forbiddenText) {
      if (text.includes(marker)) errors.push(`${label}/${relative(root, path)} contains forbidden marker ${marker}`);
    }
  });
}

const rawRoot = join(sourceRoot, "docs", "raw", "articles");
let sourceCards = 0;
let rawFiles = 0;
if (!existsSync(rawRoot)) {
  errors.push("public source-card directory is missing: docs/raw/articles");
} else {
  walk(rawRoot, (path) => {
    if (!path.endsWith(".md")) return;
    rawFiles += 1;
    const text = readFileSync(path, "utf8");
    const frontmatter = text.match(/^---\s*\n(.*?)\n---\s*(?:\n|$)/s)?.[1] || "";
    const rawLabel = relative(rawRoot, path);
    if (!/^type:\s*source-card\s*$/m.test(frontmatter)) errors.push(`raw/${rawLabel} is not a source-card`);
    const sourceUrl = frontmatter.match(/^source_url:\s*["']?([^"'\s]+)["']?\s*$/m)?.[1] || "";
    try {
      if (!isReliableSourceUrl(sourceUrl)) throw new Error("invalid");
      sourceCards += 1;
    } catch {
      errors.push(`raw/${rawLabel} has no reliable http(s) source_url`);
    }
    if (text.split("\n").length > 30 || lstatSync(path).size > 4096) {
      errors.push(`raw/${rawLabel} exceeds source-card size limits`);
    }
    if (/Markdown Content:|raw-article|<html|```(?:html|markdown)/i.test(text)) {
      errors.push(`raw/${rawLabel} looks like a retained full-text body`);
    }
  });
}

checkText(sourceRoot, "source", (path) =>
  path === join(sourceRoot, "scripts", "check-public-build.mjs") ||
  path.startsWith(join(sourceRoot, "site") + "/"),
);
if (!existsSync(siteRoot)) {
  errors.push(`public site directory is missing: ${siteRoot}`);
} else {
  checkText(siteRoot, "site");
  const siteReal = realpathSync(siteRoot);
  const expectedSite = realpathSync(sourceRoot) === sourceRoot ? join(sourceRoot, "site") : join(sourceRoot, "site");
  if (siteReal !== realpathSync(expectedSite)) errors.push(`site path is not the public source site: ${siteReal}`);
}

console.log(JSON.stringify({ source_root: sourceRoot, site_root: siteRoot, raw_files: rawFiles, source_cards: sourceCards }));
if (errors.length) {
  console.error(`Public build safety check failed with ${errors.length} error(s):`);
  for (const error of errors.slice(0, 100)) console.error(`- ${error}`);
  if (errors.length > 100) console.error(`- ... and ${errors.length - 100} more`);
  process.exit(1);
}
