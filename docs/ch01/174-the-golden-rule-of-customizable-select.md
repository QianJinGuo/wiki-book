# The golden rule of Customizable Select

## Ch01.174 The golden rule of Customizable Select

> 📊 Level ⭐ | 3.2KB | `entities/webkit-customizable-select-golden-rule.md`

# The golden rule of Customizable Select

> Source: [原文存档](https://github.com/QianJinGuo/wiki-book/tree/main/docs/raw/articles/webkit-customizable-select-golden-rule.md)


## 核心要点

- **来源**: https://webkit.org/blog/18117/the-golden-rule-of-customizable-select/
- **评分**: v=8, c=9, v×c=72, stars=4
- **评估理由**: High-quality technical article from the WebKit team explaining a clear, actionable best practice for the new customizable select feature. Well-structured with concrete examples (code snippets, before/after visuals), strong rationale spanning UX, accessibility, and progressive enhancement, and author

## 内容提炼

```mermaid
graph LR
    subgraph "数据准备"
        RAW[原始数据] --> CLEAN[清洗过滤]
        CLEAN --> ANNOTATE[标注/质量筛选]
        ANNOTATE --> SPLIT[训练/验证分割]
    end
    subgraph "训练阶段"
        PRE[预训练<br/>Next-Token]
        SFT[监督微调<br/>指令跟随]
        ALIGN[对齐<br/>RLHF/DPO/GRPO]
    end
    SPLIT --> PRE --> SFT --> ALIGN
    subgraph "高效训练"
        LORA[LoRA/QLoRA<br/>参数高效]
        DISTIL[知识蒸馏<br/>模型压缩]
        DS[DeepSpeed<br/>分布式]
    end
    SFT --> LORA
    ALIGN --> DISTIL
    PRE --> DS
    subgraph "评估"
        AUTO[自动评测<br/>基准测试]
        HUMAN[人工评测<br/>对抗测试]
    end
    ALIGN --> AUTO & HUMAN
    classDef data fill:#fef3c7,stroke:#d97706
    classDef train fill:#dbeafe,stroke:#2563eb
    classDef eff fill:#ede9fe,stroke:#7c3aed
    classDef eval fill:#d1fae5,stroke:#059669
    class RAW,CLEAN,ANNOTATE,SPLIT data
    class PRE,SFT,ALIGN train
    class LORA,DISTIL,DS eff
    class AUTO,HUMAN eval
```


Published Time: 2026-06-15T14:20:31-07:00

Markdown Content:
Customizable select is coming to Safari 27. With this technology, developers can fully control the appearance of `<select>` elements — custom arrows, option layouts, color swatches, icons, full visual styling — without the need for JavaScript libraries or an endless parade of `<div>` elements. And because it’s a built-in control, you don’t have to compromise on keyboard navigation or accessibility semantics.

But, to ensure this built-in control works well for everyone, it’s important to follow this single but essential rule: **always provide text content or accessible text attributes for your `option` elements.**

Every time that rule is broken, every time an option is styled to show a visual without any text and without any accessible fallbacks, three different problems get introduced all at once. The menu is harder to use for everyone, impossible to use with accessibility tools, and it becomes a completely broken experience in browsers that don’t support it yet.

When you remember to follow the rule, you’ll improve the user experience, support accessibility, and provide progressive enhancement so it works for people re

## 关键洞察

- ## Better progressive enhancement

## 实践启示

- 文章的核心论点可在生产环境验证
- 与现有实体的差异化角度：本文来自 webkit.org 视角
- 引用源：[Webkit Customizable Select Golden Rule](https://github.com/QianJinGuo/wiki-book/tree/main/docs/raw/articles/webkit-customizable-select-golden-rule.md)
## 相关实体
- [tokenomics: the 62.5-minute rule for claude](ch01/989-anthropic.html)
- [from doer to director: the ai mindset shift](ch01/031-from-doer-to-director-the-ai-mindset-shift.html)
- [why internally-built ai fails fund accounting audits](ch01/130-why-internally-built-ai-fails-fund-accounting-audits.html)

---

