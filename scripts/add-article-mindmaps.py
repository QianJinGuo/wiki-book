"""Add mindmap to every sub-article by extracting heading structure.

Strategy:
1. Parse ## and ### headings from each article
2. Build a mindmap with the article title as root, ## as branches, ### as leaves
3. Insert at the top, before the first ## heading (after title/frontmatter)
4. Skip if article already has a mindmap
"""
import re, os, sys

DOCS_DIR = '/path/to/user/wiki-book/docs'
DRY_RUN = '--dry' in sys.argv

def extract_title(content):
    """Get the first # heading as the mindmap root."""
    m = re.search(r'^#\s+(.+)', content, re.MULTILINE)
    if m:
        title = m.group(1).strip()
        # Clean up: remove ChXX.NNN prefix if present
        title = re.sub(r'^Ch\d+\.\d+\s+', '', title)
        # Truncate for mindmap readability
        if len(title) > 30:
            title = title[:28] + '…'
        return title
    return '主题'

def extract_headings(content):
    """Extract ## and ### headings, return structured list."""
    headings = []
    for line in content.split('\n'):
        # Skip ChXX.NNN meta-headings
        m3 = re.match(r'^###\s+(.+)', line)
        if m3:
            text = m3.group(1).strip()
            if not re.match(r'^Ch\d+\.\d+', text):
                headings.append((3, text))
            continue
        m2 = re.match(r'^##\s+(.+)', line)
        if m2:
            text = m2.group(1).strip()
            if not re.match(r'^Ch\d+\.\d+', text):
                headings.append((2, text))
    return headings

def build_mindmap(title, headings):
    """Build mermaid mindmap code from headings."""
    # Filter out generic headings that add no value
    skip_headings = {'摘要', '核心要点', '关联', '链接', '参考', '参考资料', '延伸阅读', '原文存档', '导读'}
    
    lines = [f'  root(("{title}"))']
    
    current_h2 = None
    h2_children = {}  # h2_text -> [h3_texts]
    h2_order = []     # preserve order
    
    for level, text in headings:
        # Truncate long headings
        display = text
        if len(display) > 25:
            display = display[:23] + '…'
        # Remove markdown links
        display = re.sub(r'\[([^\]]+)\]\([^\)]+\)', r'\1', display)
        # Remove special chars that break mermaid
        display = display.replace('"', "'").replace('(', '').replace(')', '').replace('[', '').replace(']', '')
        display = display.replace('&', 'and').replace('<', '').replace('>', '').replace('{', '').replace('}', '')
        display = display.replace('#', '').replace('|', ' ').replace('`', '')
        
        if level == 2:
            if display in skip_headings or display.startswith('> '):
                current_h2 = None
                continue
            current_h2 = display
            if current_h2 not in h2_children:
                h2_children[current_h2] = []
                h2_order.append(current_h2)
        elif level == 3 and current_h2:
            h2_children[current_h2].append(display)
    
    if not h2_order:
        return None
    
    # Limit: max 8 branches, max 4 leaves each (for readability)
    for h2 in h2_order[:8]:
        lines.append(f'    {h2}')
        children = h2_children[h2][:4]
        for child in children:
            lines.append(f'      {child}')
    
    return 'mindmap\n' + '\n'.join(lines)

def add_mindmap_to_article(filepath):
    with open(filepath, 'r') as f:
        content = f.read()
    
    # Skip if already has mindmap
    if re.search(r'```mermaid\s*\nmitmap', content):
        return False
    
    # Skip tiny articles
    if len(content) < 300:
        return False
    
    title = extract_title(content)
    headings = extract_headings(content)
    
    if len(headings) < 2:
        return False  # Not enough structure for a mindmap
    
    mindmap_code = build_mindmap(title, headings)
    if mindmap_code is None:
        return False
    
    # Find insertion point: after the ChXX.NNN heading and before content
    lines = content.split('\n')
    insert_idx = None
    
    # Strategy: insert after "核心要点" or "摘要" section (before the first meaningful ##)
    # Or after the ChXX heading if no 摘要
    ch_heading_idx = None
    first_content_idx = None
    
    for i, line in enumerate(lines):
        if re.match(r'^##\s+Ch\d+\.\d+', line):
            ch_heading_idx = i
        elif line.startswith('## ') and ch_heading_idx is not None:
            if first_content_idx is None:
                first_content_idx = i
    
    if first_content_idx:
        insert_idx = first_content_idx
    elif ch_heading_idx:
        insert_idx = ch_heading_idx + 1
    else:
        # Fallback: after first #
        for i, line in enumerate(lines):
            if line.startswith('# '):
                insert_idx = i + 1
                break
    
    if insert_idx is None:
        return False
    
    # Build the mindmap block
    block = [
        '',
        '## 概念导图',
        '',
        '```mermaid',
        mindmap_code,
        '```',
        '',
    ]
    
    for j, bline in enumerate(block):
        lines.insert(insert_idx + j, bline)
    
    if not DRY_RUN:
        with open(filepath, 'w') as f:
            f.write('\n'.join(lines))
    return True

# Main
count = 0
by_ch = {}
skipped = 0

for ch in ['ch01', 'ch03', 'ch04', 'ch05', 'ch07', 'ch09', 'ch11', 'ch12']:
    ch_dir = os.path.join(DOCS_DIR, ch)
    if not os.path.isdir(ch_dir):
        continue
    ch_count = 0
    for fname in sorted(os.listdir(ch_dir)):
        if not fname.endswith('.md'):
            continue
        fpath = os.path.join(ch_dir, fname)
        if add_mindmap_to_article(fpath):
            count += 1
            ch_count += 1
        else:
            skipped += 1
    by_ch[ch] = ch_count

print(f"\nTotal: {count} articles got mindmaps")
print(f"Skipped: {skipped} (too short / no structure / already had mindmap)")
for ch, c in sorted(by_ch.items(), key=lambda x: -x[1]):
    print(f"  {ch}: +{c}")
