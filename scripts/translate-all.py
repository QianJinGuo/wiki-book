#!/usr/bin/env python3
"""Batch pre-translation for the live English mode.

Extracts translatable text segments from built site HTML using the same
skip rules and the same segment hash as overrides/assets/javascripts/
live-translate.js, translates new segments via SenseNova in batches, and
stores per-page dictionaries in translations/<page-key>.json (tracked in
git). build.sh copies them to site/assets/tr/ so the client can apply a
page instantly; segments missing from the dictionary still fall back to
real-time translation.

Incremental: existing dictionaries are reused, only new segment hashes
are sent upstream. A content change that reflows HTML naturally misses
the dictionary and heals via real-time translation until the next run.

Usage:
  python3 scripts/translate-all.py --dry-run          # count only
  python3 scripts/translate-all.py --pages index,course,PATH,ch
  python3 scripts/translate-all.py --all
Requires SENSENOVA_API_KEY in the environment or .dev.vars.
"""

import argparse
import concurrent.futures
import json
import os
import re
import struct
import sys
import time
import urllib.error
import urllib.request
from html import unescape
from html.parser import HTMLParser

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SITE = os.path.join(ROOT, "site")
OUT = os.path.join(ROOT, "translations")
UPSTREAM = "https://token.sensenova.cn/v1/chat/completions"
MODEL = os.environ.get("SENSENOVA_MODEL", "deepseek-v4-flash")
BATCH_CHARS = 3200
BATCH_ITEMS = 40
CONCURRENCY = 4
RETRY_DELAYS = [5, 15, 30]

SKIP_TAGS = {"script", "style", "noscript", "pre", "code", "kbd", "samp",
             "svg", "math", "textarea", "input", "select", "option", "template"}
SKIP_CLASS_TOKENS = ("mermaid", "diagram-", "wiki-book-tool", "wb-live-pill")
CJK = re.compile(r"[\u3400-\u4dbf\u4e00-\u9fff]")

SYSTEM_PROMPT = "\n".join([
    "You are a translation engine for a technical AI-engineering documentation site.",
    "Translate each numbered line from Chinese to natural, concise English.",
    "Rules:",
    "- Keep the line numbering exactly; never merge, split, add or drop lines.",
    "- Keep technical terms, product names, code identifiers, URLs and numbers intact.",
    "- Keep emoji and inline formatting as-is.",
    "- If a line has no Chinese, copy it unchanged.",
    "Output ONLY the numbered translated lines. No commentary, no code fences.",
])


# ── Segment hashing — must match live-translate.js bit for bit ──
def seg_key(text):
    """FNV-1a over UTF-16 code units (JS charCodeAt parity), base36 + length."""
    units = struct.unpack("<%dH" % (len(text.encode("utf-16-le")) // 2),
                          text.encode("utf-16-le"))
    h = 0x811C9DC5
    for u in units:
        h ^= u
        h = (h * 0x01000193) & 0xFFFFFFFF
    digits = "0123456789abcdefghijklmnopqrstuvwxyz"
    if h == 0:
        b36 = "0"
    else:
        b36 = ""
        while h:
            h, r = divmod(h, 36)
            b36 = digits[r] + b36
    return f"{b36}:{len(text)}"


def page_key(relpath):
    """site-relative 'ch01/foo.html' -> client pageKey 'ch01__foo'."""
    key = relpath[:-len(".html")] if relpath.endswith(".html") else relpath
    return key.replace(os.sep, "__") if os.sep in key else key.replace("/", "__")


class Extractor(HTMLParser):
    """Stack-based skip tracking: a text chunk is skipped while any open
    ancestor is a skip tag or carries a skip-class token. Void elements are
    never pushed, so unbalanced `<input>`-style tags cannot poison the stack."""

    VOID = {"area", "base", "br", "col", "embed", "hr", "img", "input",
            "link", "meta", "param", "source", "track", "wbr"}

    def __init__(self):
        super().__init__(convert_charrefs=False)
        self.stack = []
        self.segments = []

    def _skipping(self):
        return any(reason for _, reason in self.stack)

    def handle_starttag(self, tag, attrs):
        if tag in self.VOID:
            return
        reason = tag if tag in SKIP_TAGS else None
        if not reason:
            for name, value in attrs:
                if name == "class" and value and any(tok in value for tok in SKIP_CLASS_TOKENS):
                    reason = "class"
                    break
        self.stack.append((tag, reason))

    def handle_startendtag(self, tag, attrs):
        pass  # self-closing: never affects the stack

    def handle_endtag(self, tag):
        for i in range(len(self.stack) - 1, -1, -1):
            if self.stack[i][0] == tag:
                del self.stack[i:]
                return

    def handle_entityref(self, name):
        self._feed(unescape(f"&{name};"))

    def handle_charref(self, name):
        self._feed(unescape(f"&#{name};"))

    def handle_data(self, data):
        self._feed(data)

    def _feed(self, text):
        if self._skipping():
            return
        stripped = text.strip()
        if stripped and CJK.search(stripped):
            self.segments.append(stripped)


def extract(relpath):
    path = os.path.join(SITE, relpath)
    parser = Extractor()
    try:
        html = open(path, encoding="utf-8", errors="ignore").read()
    except FileNotFoundError:
        # The daily loop renumbers/renames entity pages concurrently; signal
        # the caller with None so the page can be retried after the sweep.
        print(f"    skipped (vanished): {relpath}", flush=True)
        return None
    parser.feed(html)
    return parser.segments


def load_api_key():
    key = os.environ.get("SENSENOVA_API_KEY")
    if key:
        return key
    dev_vars = os.path.join(ROOT, ".dev.vars")
    if os.path.exists(dev_vars):
        for line in open(dev_vars, encoding="utf-8"):
            if line.startswith("SENSENOVA_API_KEY="):
                return line.split("=", 1)[1].strip()
    sys.exit("ERROR: SENSENOVA_API_KEY not set (env or .dev.vars)")


def call_upstream(texts, api_key):
    numbered = "\n".join(f"{i + 1}. {t.replace(chr(10), ' ')}" for i, t in enumerate(texts))
    body = json.dumps({
        "model": MODEL,
        "messages": [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": numbered},
        ],
        "max_tokens": 8192,
        "temperature": 0.2,
        "stream": False,
    }).encode("utf-8")
    req = urllib.request.Request(UPSTREAM, data=body, headers={
        "Content-Type": "application/json",
        "Authorization": f"Bearer {api_key}",
    })
    last = None
    for attempt in range(len(RETRY_DELAYS) + 1):
        try:
            with urllib.request.urlopen(req, timeout=120) as resp:
                data = json.loads(resp.read().decode("utf-8"))
            content = data["choices"][0]["message"]["content"]
            cleaned = re.sub(r"```[a-z]*\n?", "", content).strip()
            parts = re.split(r"\n(?=\s*\d+\s*[.、)）]\s*)", cleaned)
            out = [None] * len(texts)
            for part in parts:
                m = re.match(r"^\s*(\d+)\s*[.、)）]\s*([\s\S]*)$", part)
                if not m:
                    continue
                idx = int(m.group(1)) - 1
                text = m.group(2).strip()
                if 0 <= idx < len(texts) and text:
                    out[idx] = text
            return [out[i] if out[i] is not None else texts[i] for i in range(len(texts))]
        except urllib.error.HTTPError as e:
            last = e
            detail = e.read().decode("utf-8", "ignore")[:120]
            print(f"    upstream {e.code}: {detail}", flush=True)
        except Exception as e:  # noqa: BLE001
            last = e
            print(f"    upstream error: {e}", flush=True)
        if attempt < len(RETRY_DELAYS):
            time.sleep(RETRY_DELAYS[attempt])
    raise RuntimeError(f"upstream failed after retries: {last}")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--all", action="store_true", help="translate every page")
    ap.add_argument("--pages", default="", help="comma-separated substrings of site-relative paths")
    ap.add_argument("--dry-run", action="store_true")
    args = ap.parse_args()

    filters = [f for f in args.pages.split(",") if f]
    if not args.all and not filters:
        sys.exit("Specify --all or --pages substrings")

    relpaths = []
    for root, dirs, files in os.walk(SITE):
        dirs[:] = [d for d in dirs if d not in ("assets", "search", "agent-book", "en")]
        for f in files:
            if f.endswith(".html"):
                relpaths.append(os.path.relpath(os.path.join(root, f), SITE))
    relpaths.sort()
    if filters:
        relpaths = [p for p in relpaths if any(f in p for f in filters)]

    api_key = None if args.dry_run else load_api_key()
    os.makedirs(OUT, exist_ok=True)

    # Site health gate: the daily loop occasionally wipes site/ mid-rebuild;
    # extracting from a gutted tree silently produces empty dictionaries and
    # a false "done". Refuse to start until the tree looks whole again.
    def site_page_count():
        n = 0
        for root, dirs, files in os.walk(SITE):
            dirs[:] = [d for d in dirs if d not in ("assets", "search", "agent-book", "en")]
            n += sum(1 for f in files if f.endswith(".html"))
        return n

    if not args.dry_run:
        while site_page_count() < 800:
            print(f"site/ looks gutted ({site_page_count()} html pages); waiting 120s for restore", flush=True)
            time.sleep(120)

    total_pages = 0
    total_new = 0
    vanished = []

    def process_page(rel, record=True):
        nonlocal total_pages, total_new
        key = page_key(rel)
        out_path = os.path.join(OUT, key + ".json")
        existing = {}
        if os.path.exists(out_path):
            try:
                existing = json.load(open(out_path, encoding="utf-8"))
            except Exception:  # noqa: BLE001
                existing = {}

        raw_segments = extract(rel)
        if raw_segments is None:
            # Only the main pass records vanished pages; the resweep must not
            # re-append while iterating the same list (infinite loop).
            if record:
                vanished.append(rel)
            return
        segments = raw_segments
        pairs = {}
        for seg in segments:
            pairs.setdefault(seg_key(seg), seg)
        # Heal rules — an existing entry is re-translated when:
        # - it is missing entirely, or
        # - its value equals the source (upstream passthrough skip), or
        # - its value still contains CJK (malformed "original → translation"
        #   combos from throttled batches).
        new_keys = [
            k for k in pairs
            if k not in existing
            or existing[k] == pairs[k]
            or CJK.search(existing[k])
        ]
        total_pages += 1
        total_new += len(new_keys)
        char_count = sum(len(pairs[k]) for k in new_keys)
        print(f"[{key}] segments={len(pairs)} new={len(new_keys)} chars={char_count:,}", flush=True)
        if args.dry_run or not new_keys:
            return

        items = [(k, pairs[k]) for k in new_keys]
        batches = []
        batch = []
        chars = 0
        for k, seg in items:
            if batch and (len(batch) >= BATCH_ITEMS or chars + len(seg) > BATCH_CHARS):
                batches.append(batch)
                batch, chars = [], 0
            batch.append((k, seg))
            chars += len(seg)
        if batch:
            batches.append(batch)

        done = 0
        lock_work = {"failed": []}

        def run(batch):
            keys = [k for k, _ in batch]
            texts = [s for _, s in batch]
            try:
                translated = call_upstream(texts, api_key)
                return list(zip(keys, translated))
            except RuntimeError:
                lock_work["failed"].extend(keys)
                return []

        with concurrent.futures.ThreadPoolExecutor(max_workers=CONCURRENCY) as pool:
            for result in pool.map(run, batches):
                for k, translation in result:
                    existing[k] = translation
                done += len(result)
                print(f"    {done}/{len(items)}", flush=True)

        with open(out_path, "w", encoding="utf-8") as fh:
            json.dump(existing, fh, ensure_ascii=False, sort_keys=True)
        if lock_work["failed"]:
            print(f"    WARNING: {len(lock_work['failed'])} segments failed, rerun to retry", flush=True)

    for rel in relpaths:
        process_page(rel)

    # Pages that vanished mid-run (the daily loop wiping site/) were skipped;
    # once the tree is whole again, sweep them once from a snapshot instead of
    # iterating a list that the sweep itself would grow.
    if vanished and not args.dry_run:
        print(f"\n{len(vanished)} pages vanished mid-run; retrying after site health check", flush=True)
        while site_page_count() < 800:
            print(f"site/ still gutted ({site_page_count()} html pages); waiting 120s", flush=True)
            time.sleep(120)
        pending = list(vanished)
        vanished.clear()
        for rel in pending:
            process_page(rel, record=False)

    print(f"\nDone: {total_pages} pages scanned, {total_new} new segments translated", flush=True)


if __name__ == "__main__":
    main()
