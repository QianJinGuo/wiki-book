#!/usr/bin/env python3
"""diagram pipeline: queue / validate / assemble / progress

Articles live in docs/chXX/<slug>.md (regenerated nightly by book_compiler).
Diagrams live as standalone sources in diagrams-src/chXX/<slug>.mmd and are
assembled into docs/diagrams/<key>.json, where <key> mirrors the frontend
contract in overrides/assets/javascripts/diagram-overlay.js:

    pathname.strip('/').removesuffix('.html').replace('/', '-') + '.json'

Nothing is ever injected into article markdown.
"""
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
DOCS = ROOT / 'docs'
SRC = ROOT / 'diagrams-src'
OUT = DOCS / 'diagrams'

FENCE = re.compile(r'^```mermaid', re.MULTILINE)
TITLE = re.compile(r'^# (.+)$', re.MULTILINE)
LEVEL = re.compile(r'Level (⭐+)')
META = re.compile(r'^> 📊 (.+)$', re.MULTILINE)

DIAGRAM_TYPES = (
    'graph ', 'flowchart ', 'graph TD', 'graph LR', 'mindmap',
    'sequenceDiagram', 'classDiagram', 'stateDiagram', 'erDiagram',
    'timeline', 'pie', 'quadrantChart', 'journey', 'gantt', 'C4Context',
)


def diagram_key(rel: str) -> str:
    """docs-relative md path -> frontend JSON key."""
    for ext in ('.md', '.mmd'):
        if rel.endswith(ext):
            rel = rel[:-len(ext)]
            break
    return rel.replace('/', '-')


def scan_pages():
    pages = []
    for md in sorted(DOCS.glob('ch*/*.md')):
        rel = str(md.relative_to(DOCS))
        text = md.read_text(encoding='utf-8')
        m = TITLE.search(text)
        title = m.group(1).strip() if m else md.stem
        lv = LEVEL.search(text)
        level = len(lv.group(1)) if lv else 0
        pages.append({
            'rel': rel,
            'key': diagram_key(rel),
            'title': title,
            'level': level,
            'bytes': md.stat().st_size,
            'inline_mermaid': bool(FENCE.search(text)),
        })
    return pages


def cmd_queue():
    """Emit generation queue, high-value first: level desc, size desc."""
    pages = [p for p in scan_pages() if not p['inline_mermaid']]
    pages.sort(key=lambda p: (-p['level'], -p['bytes']))
    for p in pages:
        print(json.dumps(p, ensure_ascii=False))


def _load_meta(rel: str) -> dict:
    meta_p = (SRC / rel).with_suffix('.meta.json')
    if meta_p.exists():
        return json.loads(meta_p.read_text(encoding='utf-8'))
    return {}


def cmd_validate():
    """Syntax-level gate. Content-anchor check against the source article."""
    ok, bad = 0, []
    for mmd in sorted(SRC.glob('ch*/*.mmd')):
        rel = str(mmd.relative_to(SRC))
        meta = _load_meta(rel)
        if meta.get('status') == 'rejected':
            bad.append((rel, 'marked rejected'))
            continue
        text = mmd.read_text(encoding='utf-8').strip()
        # first non-comment line must declare a diagram type
        body = '\n'.join(l for l in text.splitlines() if not l.startswith('%%'))
        first = next((l for l in body.splitlines() if l.strip()), '')
        if not first.lstrip().lower().startswith(DIAGRAM_TYPES):
            bad.append((rel, f'no diagram type: {first[:40]!r}'))
            continue
        lines = body.splitlines()
        if not 3 <= len(lines) <= 45:
            bad.append((rel, f'line count {len(lines)}'))
            continue
        if body.count('"') % 2 or body.count('[') != body.count(']'):
            bad.append((rel, 'unbalanced quotes/brackets'))
            continue
        # unicode arrows are fine inside quoted labels, fatal as edge operators
        import re as _re
        for ln in body.splitlines():
            outside = _re.sub(r'"[^"]*"', '', ln)
            if any(c in outside for c in '→←⇒⇐⟶⟸'):
                bad.append((rel, f'unicode arrow outside quotes: {ln.strip()[:44]!r}'))
                break
        # lines declaring two labels must carry a mermaid edge operator
        if not bad or bad[-1][0] != rel:
            for ln in body.splitlines():
                t = ln.strip()
                if t.count('["') >= 2 and not any(op in t for op in ('-->', '-.', '==>', '--', '~~~')):
                    bad.append((rel, f'edge without operator: {t[:50]!r}'))
                    break
        # anchor: some real words from the article title must appear
        md = DOCS / rel
        title = TITLE.search(md.read_text(encoding='utf-8')) if md.exists() else None
        title = title.group(1) if title else ''
        words = [w for w in re.findall(r'[\u4e00-\u9fff]{2,}|[A-Za-z]{4,}', title)]
        hit = sum(1 for w in words if w.lower() in body.lower())
        if words and hit == 0:
            bad.append((rel, f'no anchor from title {title!r}'))
            continue
        ok += 1
    print(f'valid: {ok}  invalid: {len(bad)}')
    for rel, why in bad[:60]:
        print(f'  BAD {rel}: {why}')
    return 0 if not bad else 1


def cmd_assemble():
    """diagrams-src -> docs/diagrams/<key>.json for every valid diagram."""
    OUT.mkdir(parents=True, exist_ok=True)
    written, dropped = 0, []
    valid_keys = set()
    for mmd in sorted(SRC.glob('ch*/*.mmd')):
        rel = str(mmd.relative_to(SRC))
        meta = _load_meta(rel)
        if meta.get('status') == 'rejected':
            dropped.append(rel)
            continue
        text = mmd.read_text(encoding='utf-8').strip()
        title_m = re.match(r'^%%\s*title:\s*(.+)$', text, re.MULTILINE)
        title = title_m.group(1).strip() if title_m else rel
        code = '\n'.join(l for l in text.splitlines()
                         if not l.startswith('%%')).strip()
        key = diagram_key(rel)
        valid_keys.add(key)
        (OUT / f'{key}.json').write_text(
            json.dumps([{'title': title, 'code': code, 'isSvg': False}],
                       ensure_ascii=False, indent=1),
            encoding='utf-8')
        written += 1
    # prune JSONs whose source diagram or article is gone
    stale = [j for j in OUT.glob('*.json') if j.stem not in valid_keys]
    for j in stale:
        j.unlink()
    print(f'assembled: {written}  rejected: {len(dropped)}  pruned: {len(stale)}')


def cmd_progress():
    pages = scan_pages()
    todo = [p for p in pages if not p['inline_mermaid']]
    done = {str(m.relative_to(SRC)) for m in SRC.glob('ch*/*.mmd')}
    have = sum(1 for p in todo if p['rel'][:-3] + '.mmd' in done)
    print(f'articles: {len(pages)} (inline-mermaid: {len(pages)-len(todo)})')
    print(f'diagrams: {have}/{len(todo)}  remaining: {len(todo)-have}')


if __name__ == '__main__':
    cmd = sys.argv[1] if len(sys.argv) > 1 else 'progress'
    globals().get('cmd_' + cmd, cmd_progress)()
