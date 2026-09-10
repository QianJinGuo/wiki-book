#!/usr/bin/env python3
"""Print content-rich excerpts for a slice of the regen queue."""
import json, re, sys

try:
    q = json.load(open('/tmp/regen-queue.json'))
except FileNotFoundError:
    q = json.load(open('scripts/diagrams/REGEN-REMAINING.json'))
    print('[using durable REGEN-REMAINING.json; index space restarts at 0]')
start, n = int(sys.argv[1]), int(sys.argv[2])
NOISE = re.compile(r'^(## 关联|---##|## 相关|## 延伸|\*最后更新|> \[!)\s*$')

def clean(md: str) -> str:
    # drop scraped page boilerplate: everything before '## TL;DR' (or first '## 深度分析')
    m = re.search(r'^## TL;DR', md, re.M)
    if m: md = md[m.start():]
    # cut trailing link sections
    m = re.search(r'^## 关联', md, re.M)
    if m: md = md[:m.start()]
    m = re.search(r'^## 相关页面', md, re.M)
    if m: md = md[:m.start()]
    # strip bare markdown links and image lines
    md = re.sub(r'!\[[^\]]*\]\([^)]+\)', '', md)
    md = re.sub(r'\[([^\]]+)\]\([^)]+\)', r'\1', md)
    md = re.sub(r'\n{3,}', '\n\n', md)
    return md.strip()

for i in range(start, min(start + n, len(q))):
    mmd, path = q[i]
    md = open(path, encoding='utf-8').read()
    body = clean(md)
    if len(body) > 4600: body = body[:4600] + '\n…[截断]'
    print(f"\n{'='*30} [{i}] {path} {'='*30}")
    print(body)
