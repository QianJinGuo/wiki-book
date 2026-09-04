#!/usr/bin/env node
/**
 * Build-time guard for the public two-layer link contract.
 *
 * Without --require-targets this checks URL shape and stale private URLs,
 * which is suitable for GitHub Actions. Local sync can additionally validate
 * that every public target exists in the sibling wiki-public checkout.
 */

import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { linkConfig } from "./link-config.mjs";

const PROJECT_ROOT = resolve(fileURLToPath(new URL("..", import.meta.url)));
const DOCS_DIR = join(PROJECT_ROOT, "docs");
const REQUIRE_TARGETS = process.argv.includes("--require-targets");
const PUBLIC_ROOT = resolve(
  process.env.WIKI_PUBLIC_ROOT || join(PROJECT_ROOT, "..", "wiki-public"),
);

function walkPublishedMarkdown(directory, result = []) {
  for (const entry of readdirSync(directory, { withFileTypes: true }).sort((a, b) =>
    a.name.localeCompare(b.name),
  )) {
    if (entry.name === "raw" || entry.name === "site" || entry.name === "node_modules") continue;
    const path = join(directory, entry.name);
    if (entry.isDirectory()) walkPublishedMarkdown(path, result);
    else if (entry.isFile() && entry.name.endsWith(".md")) result.push(path);
  }
  return result;
}

function pathFromUrl(url, baseUrl) {
  const parsed = new URL(url);
  const base = new URL(`${baseUrl}/`);
  if (parsed.origin !== base.origin || !parsed.pathname.startsWith(base.pathname)) return null;
  const path = decodeURIComponent(parsed.pathname.slice(base.pathname.length));
  if (!path || path.includes("..") || path.startsWith("/")) return null;
  return path;
}

const oldPrivateUrl = /https:\/\/github\.com\/QianJinGuo\/wiki(?:[\/\s)'"`]|$)/g;
const allUrls = /https:\/\/github\.com\/QianJinGuo\/[^\s<>`)]+/g;
const forbiddenRawUrl = /https:\/\/github\.com\/QianJinGuo\/wiki-book\/(?:blob|tree)\/main\/docs\/raw\/articles\//i;
const files = walkPublishedMarkdown(DOCS_DIR);
const errors = [];
const publicTargets = new Set();

for (const file of files) {
  const content = readFileSync(file, "utf8");
  const fileLabel = relative(PROJECT_ROOT, file);

  for (const match of content.matchAll(oldPrivateUrl)) {
    errors.push(`${fileLabel}: private wiki URL remains near ${match[0]}`);
  }

  for (const match of content.matchAll(allUrls)) {
    const url = match[0].replace(/[.,;!?]+$/, "");
    if (forbiddenRawUrl.test(url)) {
      errors.push(`${fileLabel}: public chapter still links to a raw copy ${url}`);
      continue;
    }
    const publicPath = pathFromUrl(url, linkConfig.wikiPublicBaseUrl);
    if (publicPath) {
      if (!/^(entities|concepts|comparisons|queries|moc)\/.+\.md$/.test(publicPath)) {
        errors.push(`${fileLabel}: invalid wiki-public target ${url}`);
      } else {
        publicTargets.add(publicPath);
      }
    }

    if (/https?:\/\/raw\/articles\//i.test(url)) {
      errors.push(`${fileLabel}: malformed raw source URL remains ${url}`);
    }
  }
  if (/\]\([^)]*raw\/articles\//i.test(content) || /\^\[raw\/articles\//i.test(content)) {
    errors.push(`${fileLabel}: relative raw article link remains`);
  }
}

if (REQUIRE_TARGETS) {
  if (!existsSync(PUBLIC_ROOT)) {
    errors.push(`wiki-public target directory not found: ${PUBLIC_ROOT}`);
  } else {
    for (const target of publicTargets) {
      if (!existsSync(join(PUBLIC_ROOT, target))) {
        errors.push(`missing wiki-public target: ${target}`);
      }
    }
  }
}

console.log(
  `Checked ${files.length} published Markdown files: ${publicTargets.size} public targets, raw targets 0`,
);
if (errors.length > 0) {
  console.error(`Wiki link check failed with ${errors.length} error(s):`);
  for (const error of errors.slice(0, 100)) console.error(`- ${error}`);
  if (errors.length > 100) console.error(`- ... and ${errors.length - 100} more`);
  process.exit(1);
}
