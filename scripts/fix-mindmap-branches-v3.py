"""Fix mindmap branches v3 — remove mindmaps that only contain generic branches.

If after filtering generic headings, a mindmap has 0 or 1 branches left,
it's worse than useless. Remove the entire mindmap section.

Also: expand skip list with all remaining generic patterns.
"""
import re, os, sys

DOCS_DIR = '/path/to/user/wiki-book/docs'
DRY_RUN = '--dry' in sys.argv

# Comprehensive skip list — any heading that's a wiki template artifact
SKIP_HEADINGS_LOWER = {
    # Chinese
    '摘要', '核心要点', '关联', '链接', '参考', '参考资料', '延伸阅读',
    '原文存档', '导读', '相关链接', '关联阅读', '相关实体', '关联实体',
    '概念导图', '架构图', '本章导航', '来源', '出处', '原文链接',
    '深度分析', '实践启示', '实践指导', '实践建议',
    '技术要点', '核心内容', '内容结构', '核心观点', '核心技术',
    '核心洞察', '核心问题', '关键要点', '关键洞察', '关键发现', '重点内容',
    '详细分析', '深入分析', '专题分析', '专题解读', '深度解读',
    '技术分析', '技术解析', '技术细节', '方法论', '方法解析',
    '最佳实践', '应用实践', '工程实践', '落地实践',
    '行业影响', '影响分析', '趋势分析', '未来展望', '发展趋势',
    '解决方案', '架构方案', '实现方案', '设计方案',
    '相关主题', '概述', '核心命题', '核心定位', '一句话', '一句话定位',
    '核心结论', '核心论点', '标签', '上线状态', '适用场景', '应用场景',
    '背景', '与现有实体的差异化', '与知识库的连接', '实验结果',
    '技术洞察', '行业意义', '关键数据/实践启示', '相关概念',
    '第 2 来源', '第2来源',
    # English
    'summary', 'overview', 'key points', 'related entities', 'solution overview',
    'background', 'conclusion', 'key takeaways', 'references', 'key insights',
    'technical details', 'implementation', 'best practices',
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
    text = re.sub(r'\[([^\]]+)\]\([^\)]+\)', r'\1', text)
    text = text.replace('"', "'").replace('(', '').replace(')', '')
    text = text.replace('[', '').replace(']', '').replace('{', '').replace('}', '')
    text = text.replace('&', 'and').replace('<', '').replace('>', '')
    text = text.replace('#', '').replace('|', ' ').replace('`', '')
    text = text.replace('—', '-').replace('–', '-').replace('…', '...')
    text = re.sub(r'\s+', ' ', text).strip()
    if len(text) > 28:
        text = text[:26] + '...'
    return text


def is_generic(text):
    clean = text.strip().lower()
    # Direct match
    if clean in SKIP_HEADINGS_LOWER:
        return True
    # Remove spaces and try again
    clean_nosp = clean.replace(' ', '')
    for s in SKIP_HEADINGS_LOWER:
        if clean_nosp == s.replace(' ', ''):
            return True
    # Prefix match for "第 2 来源" patterns
    if clean.startswith('第 2 来源') or clean.startswith('第2来源') or clean.startswith('第 2来源'):
        return True
    return False


def build_mindmap(title, headings):
    h2_list = []
    current_h2 = None
    current_h3s = []
    
    for level, text in headings:
        if level == 2:
            if current_h2 is not None:
                h2_list.append((current_h2, current_h3s))
            current_h2 = text
            current_h3s = []
        elif level == 3 and current_h2 is not None:
            current_h3s.append(text)
    
    if current_h2 is not None:
        h2_list.append((current_h2, current_h3s))
    
    branches = []
    
    for h2_text, h3_texts in h2_list:
        h2_is_generic = is_generic(h2_text)
        
        if h2_is_generic:
            # Promote non-generic children
            for h3 in h3_texts[:4]:
                if not is_generic(h3):
                    h3_clean = sanitize(h3)
                    if h3_clean:
                        branches.append((h3_clean, []))
            continue
        
        # Content-specific H2
        if h3_texts:
            leaves = []
            for h3 in h3_texts[:3]:
                if not is_generic(h3):
                    h3_clean = sanitize(h3)
                    if h3_clean:
                        leaves.append(h3_clean)
            branches.append((sanitize(h2_text), leaves))
        else:
            branches.append((sanitize(h2_text), []))
    
    # KEY: if fewer than 2 content-specific branches, return None (remove mindmap)
    if len(branches) < 2:
        return None
    
    branches = branches[:8]
    
    title_clean = sanitize(title)
    lines = [f'  root(("{title_clean}"))']
    for branch, leaves in branches:
        lines.append(f'    {branch}')
        for leaf in leaves[:3]:
            lines.append(f'      {leaf}')
    
    return 'mindmap\n' + '\n'.join(lines)


def fix_article(filepath):
    with open(filepath, 'r') as f:
        content = f.read()
    
    # Find mindmap section
    mm_section = re.search(
        r'(## 概念导图\s*\n\s*\n```mermaid\n)(mindmap.*?)(```\s*\n)',
        content, re.DOTALL
    )
    if not mm_section:
        return 'no_mindmap'
    
    old_mindmap = mm_section.group(2).strip()
    
    title = extract_title(content)
    headings = extract_heading_tree(content)
    
    if len(headings) < 2:
        # Not enough structure — remove mindmap section
        new_content = content[:mm_section.start()] + content[mm_section.end():]
        if not DRY_RUN:
            with open(filepath, 'w') as f:
                f.write(new_content)
        return 'removed'
    
    new_mindmap = build_mindmap(title, headings)
    
    if new_mindmap is None:
        # Only generic branches — remove mindmap section
        new_content = content[:mm_section.start()] + content[mm_section.end():]
        if not DRY_RUN:
            with open(filepath, 'w') as f:
                f.write(new_content)
        return 'removed'
    
    if new_mindmap.strip() == old_mindmap.strip():
        return 'unchanged'
    
    # Replace mindmap content
    new_content = content[:mm_section.start(2)] + new_mindmap + '\n' + content[mm_section.start(3):]
    
    if not DRY_RUN:
        with open(filepath, 'w') as f:
            f.write(new_content)
    return 'upgraded'


# Main
results = Counter()
by_ch = {}

for ch in ['ch01', 'ch03', 'ch04', 'ch05', 'ch07', 'ch09', 'ch11', 'ch12']:
    ch_dir = os.path.join(DOCS_DIR, ch)
    if not os.path.isdir(ch_dir):
        continue
    for fname in sorted(os.listdir(ch_dir)):
        if not fname.endswith('.md'):
            continue
        fpath = os.path.join(ch_dir, fname)
        result = fix_article(fpath)
        results[result] += 1

print(f"\nResults:")
for k, v in sorted(results.items(), key=lambda x: -x[1]):
    print(f"  {k}: {v}")

# Final stats
mindmap_count = 0
no_mindmap_count = 0
for ch in ['ch01', 'ch03', 'ch04', 'ch05', 'ch07', 'ch09', 'ch11', 'ch12']:
    ch_dir = os.path.join(DOCS_DIR, ch)
    for fname in os.listdir(ch_dir):
        if not fname.endswith('.md'):
            continue
        fpath = os.path.join(ch_dir, fname)
        with open(fpath) as f:
            content = f.read()
        if re.search(r'\`\`\`mermaid\nmindmap', content):
            mindmap_count += 1
        else:
            no_mindmap_count += 1

print(f"\nFinal: {mindmap_count} with mindmap / {no_mindmap_count} without")
