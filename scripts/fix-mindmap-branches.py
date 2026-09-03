"""Fix mindmap branches: replace generic template headings with content-specific ones.

Problem: 2944 articles share "深度分析" branch, 2853 share "实践启示" — 
these are wiki template headings, not article-specific concepts.

Fix: 
1. Parse all ## and ### headings
2. Skip generic headings (深度分析, 实践启示, 相关实体, etc.)
3. Use ### sub-headings directly as branches when their parent ## is generic
4. This makes every mindmap unique and content-specific
"""
import re, os, sys

DOCS_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'docs'))
DRY_RUN = '--dry' in sys.argv

# Generic headings that add NO cognitive value in a mindmap
GENERIC_H2 = {
    '摘要', '核心要点', '关联', '链接', '参考', '参考资料', '延伸阅读', 
    '原文存档', '导读', '相关链接', '关联阅读', '相关实体', '关联实体',
    '概念导图', '架构图', '本章导航', '来源', '出处',
}

# These H2 are somewhat useful but their children (###) are MORE useful
# When H2 is in this set, we promote ### to direct branches
H2_PROMOTE_CHILDREN = {
    '深度分析', '实践启示', '实践指导', '技术要点', '核心内容',
    '内容结构', '核心观点', '核心技术', '核心洞察', '核心问题',
    '相关主题', '关键要点', '关键洞察', '关键发现', '重点内容',
    '详细分析', '深入分析', '专题分析', '专题解读', '深度解读',
    '技术分析', '技术解析', '技术细节', '方法论', '方法解析',
    '实践建议', '最佳实践', '应用实践', '工程实践', '落地实践',
    '行业影响', '影响分析', '趋势分析', '未来展望', '发展趋势',
    '解决方案', '架构方案', '实现方案', '设计方案',
}


def extract_title(content):
    m = re.search(r'^#\s+(.+)', content, re.MULTILINE)
    if m:
        title = m.group(1).strip()
        title = re.sub(r'^Ch\d+\.\d+\s+', '', title)
        if len(title) > 30:
            title = title[:28] + '…'
        return title
    return '主题'


def extract_heading_tree(content):
    """Extract heading structure as a tree of (level, text) items."""
    headings = []
    for line in content.split('\n'):
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


def sanitize(text):
    """Clean text for mermaid mindmap compatibility."""
    # Remove markdown links
    text = re.sub(r'\[([^\]]+)\]\([^\)]+\)', r'\1', text)
    # Remove chars that break mermaid
    text = text.replace('"', "'").replace('(', '').replace(')', '')
    text = text.replace('[', '').replace(']', '').replace('{', '').replace('}', '')
    text = text.replace('&', 'and').replace('<', '').replace('>', '')
    text = text.replace('#', '').replace('|', ' ').replace('`', '')
    text = text.replace('—', '-').replace('–', '-').replace('…', '...')
    # Collapse whitespace
    text = re.sub(r'\s+', ' ', text).strip()
    # Truncate
    if len(text) > 28:
        text = text[:26] + '...'
    return text


def build_mindmap(title, headings):
    """Build content-specific mindmap, skipping generic headings."""
    # Group headings: h2 -> [h3_children]
    h2_list = []  # [(h2_text, [h3_texts])]
    current_h2 = None
    current_h3s = []
    
    for level, text in headings:
        if level == 2:
            # Save previous group
            if current_h2 is not None:
                h2_list.append((current_h2, current_h3s))
            current_h2 = text
            current_h3s = []
        elif level == 3 and current_h2 is not None:
            current_h3s.append(text)
    
    if current_h2 is not None:
        h2_list.append((current_h2, current_h3s))
    
    # Build mindmap branches
    branches = []  # List of (branch_name, [leaf_names])
    
    for h2_text, h3_texts in h2_list:
        h2_clean = sanitize(h2_text)
        
        # Skip entirely generic H2 with no children
        if h2_clean in GENERIC_H2:
            continue
        
        # If H2 is generic-but-has-children, promote children to branches
        if h2_clean.lower() in {h.lower() for h in H2_PROMOTE_CHILDREN}:
            for h3 in h3_texts[:4]:
                h3_clean = sanitize(h3)
                if h3_clean and h3_clean not in GENERIC_H2:
                    # H3 becomes a standalone branch (no children)
                    branches.append((h3_clean, []))
            continue
        
        # H2 is content-specific: use it as a branch with H3 as leaves
        if h3_texts:
            leaves = []
            for h3 in h3_texts[:4]:
                h3_clean = sanitize(h3)
                if h3_clean and h3_clean not in GENERIC_H2:
                    leaves.append(h3_clean)
            branches.append((h2_clean, leaves))
        else:
            branches.append((h2_clean, []))
    
    if not branches:
        return None
    
    # Limit to 8 branches for readability
    branches = branches[:8]
    
    # Build mermaid code
    title_clean = sanitize(title)
    lines = [f'  root(("{title_clean}"))']
    for branch, leaves in branches:
        lines.append(f'    {branch}')
        for leaf in leaves[:3]:
            lines.append(f'      {leaf}')
    
    return 'mindmap\n' + '\n'.join(lines)


def fix_article_mindmap(filepath):
    with open(filepath, 'r') as f:
        content = f.read()
    
    # Find existing mindmap block
    mm_match = re.search(r'## 概念导图\s*\n\s*\n```mermaid\n(mindmap.*?)```', content, re.DOTALL)
    if not mm_match:
        return False
    
    old_mindmap = mm_match.group(1).strip()
    
    # Rebuild from article headings
    title = extract_title(content)
    headings = extract_heading_tree(content)
    
    if len(headings) < 2:
        return False
    
    new_mindmap = build_mindmap(title, headings)
    if new_mindmap is None:
        return False
    
    # Skip if unchanged
    if new_mindmap.strip() == old_mindmap.strip():
        return False
    
    # Replace the mindmap content
    new_content = content[:mm_match.start(1)] + new_mindmap + content[mm_match.end(1):]
    
    if not DRY_RUN:
        with open(filepath, 'w') as f:
            f.write(new_content)
    return True


# Main
count = 0
changed_branches = 0
by_ch = {}

for ch in ['ch01', 'ch03', 'ch04', 'ch05', 'ch07', 'ch09', 'ch11', 'ch12']:
    ch_dir = os.path.join(DOCS_DIR, ch)
    if not os.path.isdir(ch_dir):
        continue
    ch_count = 0
    for fname in sorted(os.listdir(ch_dir)):
        if not fname.endswith('.md'):
            continue
        fpath = os.path.join(ch_dir, fname)
        if fix_article_mindmap(fpath):
            count += 1
            ch_count += 1
    by_ch[ch] = ch_count

print(f"\nTotal: {count} articles mindmap upgraded")
for ch, c in sorted(by_ch.items(), key=lambda x: -x[1]):
    print(f"  {ch}: +{c}")
