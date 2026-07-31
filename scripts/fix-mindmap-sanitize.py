"""Fix mindmap sanitize — remove all mermaid-breaking characters.

Root cause: mermaid mindmap fails on colons, periods, parentheses, etc.
The v3 script's sanitize was too lenient. This version aggressively
strips ALL non-alphanumeric/CJK characters.
"""
import re, os, sys
from collections import Counter

DOCS_DIR = '/path/to/user/wiki-book/docs'
DRY_RUN = '--dry' in sys.argv

SKIP_HEADINGS_LOWER = {
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
    '第 2 来源', '第2来源', '详细信息', '原文', 'related',
    'summary', 'overview', 'key points', 'related entities', 'solution overview',
    'background', 'conclusion', 'key takeaways', 'references', 'key insights',
    'technical details', 'implementation', 'best practices', '待关注',
    '元数据', '一句话总结', '三个独有贡献', '与已有实体的关系',
    '关键数据', '关键设计决策', '核心架构', '核心发现', '核心能力',
}


def sanitize(text):
    """Aggressively sanitize for mermaid mindmap compatibility."""
    # Remove markdown bold/italic markers
    text = re.sub(r'\*+', '', text)
    # Remove markdown links
    text = re.sub(r'\[([^\]]+)\]\([^\)]+\)', r'\1', text)
    # Remove ALL characters that break mermaid parsing
    # Keep: CJK unified ideographs, ASCII letters, digits, spaces, hyphens
    # Remove: punctuation, special chars, symbols
    cleaned = []
    for ch in text:
        cp = ord(ch)
        if (0x4E00 <= cp <= 0x9FFF or      # CJK
            0x3400 <= cp <= 0x4DBF or        # CJK Ext A
            0x3000 <= cp <= 0x303F or        # CJK Symbols (keep 、etc - we'll strip some)
            0xFF00 <= cp <= 0xFFEF or        # Halfwidth/Fullwidth
            0x30A0 <= cp <= 0x30FF or        # Katakana
            0x3040 <= cp <= 0x309F or        # Hiragana
            ('a' <= ch <= 'z') or 
            ('A' <= ch <= 'Z') or 
            ('0' <= ch <= '9') or
            ch == ' ' or ch == '-'):
            cleaned.append(ch)
    text = ''.join(cleaned)
    # Remove CJK punctuation that mermaid can't handle
    for ch in '、。，！？；：""''【】《》（）…—·':
        text = text.replace(ch, ' ')
    # Remove leading numbers like '1. ' or '2.1 '
    text = re.sub(r'^[\d\.]+\s*', '', text)
    # Collapse whitespace
    text = re.sub(r'\s+', ' ', text).strip()
    # Truncate at word boundary
    if len(text) > 36:
        text = text[:34].rsplit(' ', 1)[0] if ' ' in text[:34] else text[:34]
    return text


def extract_title(content):
    m = re.search(r'^#\s+(.+)', content, re.MULTILINE)
    if m:
        title = m.group(1).strip()
        title = re.sub(r'^Ch\d+\.\d+\s+', '', title)
        return sanitize(title) or '主题'
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


def is_generic(text):
    clean = text.strip().lower()
    if clean in SKIP_HEADINGS_LOWER:
        return True
    clean_nosp = clean.replace(' ', '')
    for s in SKIP_HEADINGS_LOWER:
        if clean_nosp == s.replace(' ', ''):
            return True
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
        if is_generic(h2_text):
            for h3 in h3_texts[:4]:
                if not is_generic(h3):
                    h3_clean = sanitize(h3)
                    if h3_clean and len(h3_clean) >= 2:
                        branches.append((h3_clean, []))
            continue
        
        h2_clean = sanitize(h2_text)
        if not h2_clean or len(h2_clean) < 2:
            continue
            
        if h3_texts:
            leaves = []
            for h3 in h3_texts[:3]:
                if not is_generic(h3):
                    h3_clean = sanitize(h3)
                    if h3_clean and len(h3_clean) >= 2:
                        leaves.append(h3_clean)
            branches.append((h2_clean, leaves))
        else:
            branches.append((h2_clean, []))
    
    if len(branches) < 2:
        return None
    
    branches = branches[:8]
    
    lines = [f'  root(("{title}"))']
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
        new_content = content[:mm_section.start()] + content[mm_section.end():]
        if not DRY_RUN:
            with open(filepath, 'w') as f:
                f.write(new_content)
        return 'removed'
    
    new_mindmap = build_mindmap(title, headings)
    
    if new_mindmap is None:
        new_content = content[:mm_section.start()] + content[mm_section.end():]
        if not DRY_RUN:
            with open(filepath, 'w') as f:
                f.write(new_content)
        return 'removed'
    
    if new_mindmap.strip() == old_mindmap.strip():
        return 'unchanged'
    
    new_content = content[:mm_section.start(2)] + new_mindmap + '\n' + content[mm_section.start(3):]
    
    if not DRY_RUN:
        with open(filepath, 'w') as f:
            f.write(new_content)
    return 'upgraded'


# Main
results = Counter()
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

print(f"Results:")
for k, v in sorted(results.items(), key=lambda x: -x[1]):
    print(f"  {k}: {v}")

# Stats
mm = 0
no_mm = 0
for ch in ['ch01','ch03','ch04','ch05','ch07','ch09','ch11','ch12']:
    ch_dir = os.path.join(DOCS_DIR, ch)
    for fname in os.listdir(ch_dir):
        if not fname.endswith('.md'):
            continue
        with open(os.path.join(ch_dir, fname)) as f:
            content = f.read()
        if re.search(r'```mermaid\nmindmap', content):
            mm += 1
        else:
            no_mm += 1
print(f"\nFinal: {mm} with mindmap / {no_mm} without")
