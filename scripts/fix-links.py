import re, os

docs_dir = os.path.expanduser("~/wiki-book/docs")

# Build mapping from ALL markdown files (recursive)
slug_map = {}
for root, dirs, files in os.walk(docs_dir):
    for f in files:
        if not f.endswith('.md') or not f.startswith('ch'):
            continue
        filepath = os.path.join(root, f)
        with open(filepath, 'r', encoding='utf-8', errors='replace') as fh:
            head = ''.join(fh.readline() for _ in range(20))
        book_slug = f.replace('.md', '')
        m = re.search(r'`(entities|concepts|comparisons|queries|moc)/([^`]+)\.md`', head)
        if m:
            slug_map[f"{m.group(1)}/{m.group(2)}"] = book_slug

slug_only = {k.split('/')[-1]: v for k, v in slug_map.items()}
print(f"Mapping: {len(slug_map)} exact, {len(slug_only)} slug-only")

# Replace all GitHub URLs in ALL files (recursive)
counter = [0]
files_mod = [0]

def repl_link(m):
    counter[0] += 1
    text, wiki_path = m.group(1), m.group(2)
    book = slug_map.get(wiki_path) or slug_only.get(wiki_path.split('/')[-1])
    return f'[{text}](../{book}/)' if book else text

def repl_bare(m):
    counter[0] += 1
    wiki_path = m.group(1)
    book = slug_map.get(wiki_path) or slug_only.get(wiki_path.split('/')[-1])
    return f'../{book}/' if book else wiki_path.split('/')[-1]

for root, dirs, files in os.walk(docs_dir):
    for f in files:
        if not f.endswith('.md'):
            continue
        filepath = os.path.join(root, f)
        with open(filepath, 'r', encoding='utf-8', errors='replace') as fh:
            content = fh.read()
        orig = content
        
        content = re.sub(
            r'\[([^\]]+)\]\((?:https?://)?github\.com/QianJinGuo/wiki/blob/main/([^)]+)\.md\)',
            repl_link, content
        )
        content = re.sub(
            r'(?:https?://)?github\.com/QianJinGuo/wiki/blob/main/([^)\s]+)\.md',
            repl_bare, content
        )
        
        if content != orig:
            with open(filepath, 'w', encoding='utf-8') as fh:
                fh.write(content)
            files_mod[0] += 1

print(f"Replaced: {counter[0]}, Files: {files_mod[0]}")
