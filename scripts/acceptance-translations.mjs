#!/usr/bin/env node
/**
 * Acceptance harness for the live English mode.
 *
 * For every page: enable the mode before load (localStorage), wait for the
 * translation pass to settle, then measure how much CJK text remains in the
 * main content areas. A page passes when the remaining CJK ratio is under
 * the threshold. Results land in a JSON + markdown report.
 *
 * Usage:
 *   node scripts/acceptance-translations.mjs --dicts-only
 *   node scripts/acceptance-translations.mjs --pages-file pages.txt
 *   node scripts/acceptance-translations.mjs --all-site --timeout 90000
 * Options:
 *   --base URL          site base (default https://jinguo.tech)
 *   --threshold 0.04    max remaining CJK char ratio to pass
 *   --timeout 30000     per-page settle timeout (ms); real-time pages need more
 *   --concurrency 3     parallel pages
 *   --limit N           only first N pages (smoke runs)
 *   --report PATH       report file prefix (default translations/acceptance)
 */

import { chromium } from "playwright-core";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";

function arg(name, fallback) {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 && process.argv[i + 1] ? process.argv[i + 1] : fallback;
}
function flag(name) {
  return process.argv.includes(`--${name}`);
}

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const SITE = path.join(ROOT, "site");
const BASE = arg("base", "https://jinguo.tech").replace(/\/$/, "");
const THRESHOLD = parseFloat(arg("threshold", "0.04"));
const TIMEOUT = parseInt(arg("timeout", "30000"), 10);
const CONCURRENCY = parseInt(arg("concurrency", "3"), 10);
const LIMIT = parseInt(arg("limit", "0"), 10);
const REPORT = arg("report", "translations/acceptance");

const SETTLE_POLL_MS = 1500;

function pageKeyToPath(key) {
  if (key === "index") return "/";
  return "/" + key.replace(/__/g, "/") + ".html";
}

function buildPageList() {
  if (flag("dicts-only")) {
    const dir = path.join(ROOT, "translations");
    return fs
      .readdirSync(dir)
      .filter((f) => f.endsWith(".json"))
      .map((f) => pageKeyToPath(f.replace(/\.json$/, "")));
  }
  if (flag("all-site")) {
    const out = [];
    const walk = (dir) => {
      for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        if (entry.isDirectory()) {
          if (["assets", "search", "agent-book", "en"].includes(entry.name)) continue;
          walk(path.join(dir, entry.name));
        } else if (entry.name.endsWith(".html")) {
          const rel = path.relative(SITE, path.join(dir, entry.name));
          out.push("/" + rel.split(path.sep).join("/"));
        }
      }
    };
    walk(SITE);
    return out;
  }
  const pagesFile = arg("pages-file", "");
  if (pagesFile) {
    return fs
      .readFileSync(pagesFile, "utf8")
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);
  }
  console.error("Specify --dicts-only, --all-site or --pages-file");
  process.exit(1);
}

const MEASURE_SNIPPET = `(() => {
  const SKIP = 'script,style,noscript,pre,code,kbd,samp,svg,math,.mermaid,.diagram-trigger,.diagram-overlay,.diagram-lightbox,.wiki-book-tools,.wiki-book-tool-toast,.wb-live-pill,textarea,input,select,option,[contenteditable]';
  const CJK = /[\\u3400-\\u4dbf\\u4e00-\\u9fff]/;
  let total = 0, cjk = 0, nodes = 0;
  let roots = document.querySelectorAll('.md-header, .md-tabs, .md-sidebar, .md-content, .md-footer');
  if (!roots.length) roots = [document.body];
  roots.forEach((root) => {
    const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode(n) {
        if (!n.nodeValue || !n.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
        const p = n.parentElement;
        if (!p || p.closest(SKIP)) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    });
    while (w.nextNode()) {
      const t = w.currentNode.nodeValue.trim();
      total += t.length;
      if (CJK.test(t)) { cjk += t.length; nodes += 1; }
    }
  });
  const pill = document.querySelector('.wb-live-pill');
  return { total, cjk, nodes, pillVisible: pill ? pill.classList.contains('is-visible') : false };
})()`;

async function settleAndMeasure(page, timeoutMs) {
  const deadline = Date.now() + timeoutMs;
  let prev = null;
  let stable = 0;
  let stats = { total: 0, cjk: 0, nodes: 0, pillVisible: false };
  while (Date.now() < deadline) {
    stats = await page.evaluate(MEASURE_SNIPPET).catch(() => stats);
    const unchanged = prev && prev.cjk === stats.cjk && prev.total === stats.total;
    stable = unchanged ? stable + 1 : 0;
    prev = stats;
    if (!stats.pillVisible && stable >= 1) break;
    await page.waitForTimeout(SETTLE_POLL_MS);
  }
  return stats;
}

async function testPage(context, pagePath) {
  const url = BASE + pagePath;
  const page = await context.newPage();
  const started = Date.now();
  try {
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 45000 });
    await page.waitForFunction(() => document.readyState !== "loading", null, { timeout: 20000 });
    const stats = await settleAndMeasure(page, TIMEOUT);
    const ratio = stats.total > 0 ? stats.cjk / stats.total : 0;
    return {
      path: pagePath,
      url,
      ok: ratio <= THRESHOLD,
      ratio: Math.round(ratio * 10000) / 100,
      cjkRemaining: stats.cjk,
      totalChars: stats.total,
      cjkNodes: stats.nodes,
      ms: Date.now() - started,
    };
  } catch (error) {
    return { path: pagePath, url, ok: false, error: String(error).slice(0, 200), ms: Date.now() - started };
  } finally {
    await page.close().catch(() => {});
  }
}

async function main() {
  let pages = buildPageList();
  if (LIMIT > 0) pages = pages.slice(0, LIMIT);
  console.log(`Acceptance: ${pages.length} pages, base=${BASE}, threshold=${THRESHOLD}, timeout=${TIMEOUT}ms`);

  const browser = await chromium.launch({ channel: "chrome", headless: true });
  const context = await browser.newContext(
    { viewport: { width: 1280, height: 900 }, userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36" },
  );
  await context.addInitScript(() => {
    try { localStorage.setItem("wb-live-lang", "en"); } catch (_) {}
  });

  const results = [];
  let cursor = 0;
  async function worker() {
    while (cursor < pages.length) {
      const pagePath = pages[cursor++];
      const result = await testPage(context, pagePath);
      results.push(result);
      console.log(
        `${result.ok ? "PASS" : "FAIL"}  ${String(Math.round(result.ratio ?? 100)).padStart(3)}%  ${result.path}` +
          (result.error ? `  (${result.error})` : ""),
      );
    }
  }
  await Promise.all(Array.from({ length: CONCURRENCY }, worker));
  await browser.close();

  const passed = results.filter((r) => r.ok);
  const failed = results.filter((r) => !r.ok);
  const summary = {
    base: BASE,
    threshold: THRESHOLD,
    total: results.length,
    passed: passed.length,
    failed: failed.length,
    at: new Date().toISOString(),
    results: results.sort((a, b) => (a.ok === b.ok ? a.ratio - b.ratio : a.ok ? -1 : 1)),
  };
  fs.writeFileSync(`${REPORT}.json`, JSON.stringify(summary, null, 2));
  const lines = [
    `# Acceptance report (${summary.at})`,
    ``,
    `- Base: ${BASE} · threshold: ${THRESHOLD} · total: ${summary.total} · pass: ${passed.length} · fail: ${failed.length}`,
    ``,
    failed.length ? `## Failures` : `## All pages passed`,
    ``,
    ...(failed.length
      ? failed.map((r) => `- [ ] ${r.path} — ratio ${r.ratio ?? "?"}%, ${r.cjkRemaining ?? "?"} CJK chars left${r.error ? `, error: ${r.error}` : ""}`)
      : []),
  ];
  fs.writeFileSync(`${REPORT}.md`, lines.join("\n"));
  console.log(`\n${passed.length}/${results.length} passed. Report: ${REPORT}.{json,md}`);
  process.exit(failed.length ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
