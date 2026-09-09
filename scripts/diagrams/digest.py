#!/usr/bin/env python3
"""Compact digest of an article: title, meta, core points, heading outline."""
import sys, re
from pathlib import Path

def digest(md: Path, cap=1400):
    t = md.read_text(encoding='utf-8')
    lines = t.splitlines()
    out = []
    for l in lines[:6]:
        out.append(l)
        if l.startswith('> 📊'):
            break
    # heading outline
    for l in lines:
        if re.match(r'^#{2,3} ', l):
            out.append(l)
    # core points section
    m = re.search(r'## 核心要点\n(.*?)(?=\n## |\Z)', t, re.S)
    if m:
        out.append('## 核心要点')
        out.append(m.group(1).strip()[:900])
    text = '\n'.join(out)
    return text[:cap]

if __name__ == '__main__':
    for rel in sys.argv[1:]:
        print('=' * 16, rel)
        print(digest(Path(rel)))
        print()
