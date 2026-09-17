# Skills 重新定义 Agent 喂知识：从'提前给'到'按需取'的范式反转

> 📊 Level ⭐ | 4.5KB

## 核心概述

本文梳理了给 Agent 喂知识的四种方法进化线（Prompt → RAG → CLAUDE.md → Skills），指出前三种的共同死穴是"提前给"，而 Skills 的颠覆在于"按需取"——通过渐进式披露（Progressive Disclosure）三层机制，让知识可以无限积累却始终只有当下需要的那一点出现在模型眼前。Skills 不是一份 markdown，而是可执行的能力。

→ [原文存档](https://mp.weixin.qq.com/s/fuhenGVN36CHTvj3LW_D_Q)

## 四种喂法进化线

| 喂法 | 核心机制 | 关键缺陷 |
|------|----------|----------|
| **Prompt** | 当场说 | 一次性，说完就忘 |
| **RAG** | 提前存进知识库，用时检索 | 得提前猜要用什么，存多存少都出问题 |
| **CLAUDE.md** | 每次自动注入 | 越堆越长，噪音淹没关键内容 |
| **Skills** | 按需取，渐进式披露 | 无（范式反转） |

前三种的共同死穴：**都是"提前给"**——Prompt 当场提前说，RAG 提前存进库，CLAUDE.md 提前写好每次灌。都预设你得在 AI 干活前准备好知识，但"提前"本身就是原罪。

## ETH Zurich 实证（2026-02）

机器生成的 CLAUDE.md 类上下文文件使任务成功率**降低约 3%**，人精心写的也只**提升约 4%**，且无论哪种都让推理成本**涨 20% 以上**。原因：无差别灌入大量模型"本来就知道"的内容，等于往上下文灌噪音。

## 渐进式披露三层机制

1. **目录层**：每个 skill 一行简介（~80 token），系统启动时只加载所有 skill 的目录。17 个官方 skill 全部目录才一千多 token。
2. **正文层**：任务匹配到某个 skill 时才加载完整正文，其他 skill 一字不进。
3. **参考文件层**：正文中引用的更深细节，只有真的需要时才单独加载。

**装一百个 skill 也不会互相干扰**——没用上的 skill 压根不占上下文。

## Skills ≠ markdown：可执行的能力

一个 skill 是一个文件夹，里面能装可执行代码。Anthropic 的 docx skill 除了说明还塞了脚本（"必须显式设置纸张大小""绝不用 unicode 字符当项目符号"等踩坑经验）。

关键：脚本和数据**全程不进入上下文**，只有结果进。把确定性操作从"模型用脑子硬想"卸载成"运行一段代码"——更可靠，几乎不占脑容量。

**纯 markdown = 文字描述的知识（占上下文）；Skill = 可执行的能力（不占上下文）。**

## 决策规则

> 背景知识（项目是什么、有哪些资料）→ Projects / CLAUDE.md
> 做事的本事（代码审查流程、文档规范）→ Skill

Anthropic 重新定义的不是"知识的格式"，是**"知识被调用的时机"**。

## 关联

- [Claude Code 大型代码库 Harness 配置](https://github.com/QianJinGuo/wiki-public/blob/main/entities/claude-code-large-codebase-harness-configuration.md) — Skills 作为 Harness 五扩展点之一，渐进式披露的工程视角
- [Anthropic Knowledge Work Plugins 分析](https://github.com/QianJinGuo/wiki-public/blob/main/entities/knowledge-work-plugins-anthropic-source-analysis.md) — 3 级渐进式披露的详细技术分析
- [Claude Code 为什么会忽略指令](https://github.com/QianJinGuo/wiki-public/blob/main/entities/claude-code-why-instructions-ignored-jia-gou-x-2026.md) — CLAUDE.md 越写越糟的诊断，本文给出 Skills 作为解法
- [Claude Code 七种自定义方法](https://github.com/QianJinGuo/wiki-public/blob/main/entities/claude-code-seven-customization-methods-anthropic-official.md) — Skills 在七种方法中的定位
- [CLAUDE.md 12 条规则](https://github.com/QianJinGuo/wiki-public/blob/main/entities/claude-md-12-rules-mnilax-cf2019.md) — CLAUDE.md 喂法的代表，本文指出其局限

---

