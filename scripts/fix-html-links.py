import os, re

site_dir = os.path.expanduser("~/wiki-book/site")

# Fix relative links in all HTML files
# Pattern: href=../ch04-090-xxx/ → href=/ch04-090-xxx/
fixed = 0
for root, dirs, files in os.walk(site_dir):
    for f in files:
        if not f.endswith('.html'):
            continue
        fp = os.path.join(root, f)
        with open(fp, 'r', encoding='utf-8', errors='replace') as fh:
            content = fh.read()
        orig = content
        
        # Fix: href=../ch04-xxx/ → href=/ch04-xxx/
        content = re.sub(r'href=(\.\./)(ch\d+-[^/ ]+/)', r'href=/\2', content)
        # Fix: href="../ch04-xxx/" → href="/ch04-xxx/"
        content = re.sub(r'href="(\.\./)(ch\d+-[^/"]+/)"', r'href="/\2"', content)
        
        if content != orig:
            with open(fp, 'w', encoding='utf-8') as fh:
                fh.write(content)
            fixed += 1

print(f"Fixed {fixed} HTML files")
