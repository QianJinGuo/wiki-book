## Ch20.001 Vibe Design ≠ Vibe Coding —— 资深设计师对 AI 前端工作流的哲学批判

> 📊 Level ⭐ | 9.8KB | `entities/impeccable-vibe-design-philosophy-anomaly.md`

# Vibe Design ≠ Vibe Coding —— 资深设计师对 AI 前端工作流的哲学批判
> "Code is correct or not. Design is good or not. The same workflow can't serve both." —— Anomaly Innovations 创始人核心论点

Anomaly Innovations 创始人（37 年设计 × AI 经验，公开撰文）反驳 [Karpathy 提出的 vibe coding 概念](https://entities/karpathy-vibe-coding-to-agentic-engineering.md) 在前端的适用性：**代码能编译 ≠ 设计完成**。这条边界划清后，AI 工具在前端赛道会进一步分化。

## 相关实体
- [Elena Progressive Web Components](ch03-044-elena-progressive-web-components.html)

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/impeccable-anomaly-vibe-design-vs-vibe-coding.md)

## 核心论点

### "Vibe Coding" 的适用边界
- **vibe coding**（Karpathy 概念）= 自然语言描述意图 → AI 生成可运行代码。**对软件工程有效**——因为代码"对错分明"
- **vibe design ≠ design** —— 同样方法套到设计上失败，因为设计"无对错、但有好坏"
- AI 在设计上**缺少的不是工具，而是判断力**：color theory、accessibility、typography、hierarchy、motion、consistency 6 大领域都需要"经验直觉"

### 6 大 AI 前端失败类别（可作为 anti-pattern checklist）

| 类别 | 典型问题 | 修复方向 |
|---|---|---|
| **色彩理论** | 紫蓝渐变泛滥、对比度不足、品牌色乱搭 | 限定 palette + 检测器拦截 |
| **可访问性** | 对比度、键盘导航、ARIA、screen reader 体验 | axe-core + 硬规则 |
| **排版细节** | 字距、行高、字号节奏、字重对比 | DESIGN.md 强制 typography scale |
| **视觉层次** | F/Z-pattern 缺失、CTA 不突出、信息密度不均 | critique 命令 |
| **动效过度** | 渐变慢、缓动曲线怪、吃掉注意力 | motion-token + 限制时长 |
| **一致性** | 组件风格跳跃、间距不统一、icon 混用 | design token + token drift 检测 |

这 6 类与 [Impeccable](ch05-001-impeccable.html) 的 41 条检测规则高度重合 —— **资深设计师的"经验分类"与工程化项目的"规则集"是同一件事的两面**。

### 解决路径：Rule + Skill，不是 Rule-only
- 单纯把 rules 写到 CLAUDE.md **不够** —— rules 是声明式约束，AI 容易"选择性遵守"或长上下文里漂移
- **Skill（命令 + 上下文 + 检测器）才是结构化修复** —— 主动触发 + 检查 + 反馈闭环
- 推荐组合：**2-3 个设计 skill + 一组硬规则（颜色、字号、间距）** = 可持续的设计工作流

### Anomaly 的产品哲学
- **Anomaly AI Hero** —— 内部使用产品，定位"AI 设计助手"，**不直接给成品**，而是"给设计师检查 + 改稿用"
- 哲学："AI 不替代设计师，而是给设计师一个**永远不会累、不会忘规则的 junior**"
- 创始人在原文末尾明确推荐读者去看 [pbakaus/impeccable](https://github.com/pbakaus/impeccable) 仓库

## 与 vibe coding 论战的连接

这是继 [Karpathy 原始概念](https://entities/karpathy-vibe-coding-to-agentic-engineering.md) 和 [Simon Willison 的同主题回应](https://entities/vibe-coding-agentic-engineering-convergence-simon-willison.md) 之后，**第一次有"资深设计师"明确反驳 vibe coding 在前端的适用性**。三种立场：

| 立场 | 代表 | 关键词 |
|---|---|---|
| **正向接纳** | Karpathy | "vibe coding 是新编程范式" |
| **收敛为工程** | Willison | "vibe coding → agentic engineering" |
| **领域拒绝** | Anomaly 创始人 | "design 不接受 vibe coding" |

## 启示

1. **"对错分明 vs 好坏分明"** 是判断 AI 工具适用性的根本边界 —— 可用 vibe coding 写业务逻辑，但用 skill 工作流做设计品控
2. **6 大失败类别可作为任何 AI 前端项目的 anti-pattern checklist** —— 不依赖 Impeccable 也可手动套用
3. **资深从业者的"经验分类" = 工程化项目的"规则集"** —— 这是个普遍的同构现象：知识工作的"经验"可被结构化
4. **前端 AI 工具会进一步分化** —— 纯 vibe coding 工具（原型）vs 设计 skill 工具（品控），赛道不同

## 相关对照
- [Impeccable](ch05-001-impeccable.html) —— 文章末尾直接推荐此项目，本文是"为什么需要 Impeccable"的哲学背书
- [Karpathy Vibe Coding](ch04-122-hy3-preview-agent.html) —— Karpathy 原始概念出处
- [Willison Vibe Coding Convergence](ch01-247-vibe-coding-and-agentic-engineering-convergence-simon-willi.html) —— Willison 的同主题回应
- [Agent Skill 编写指南](ch04-163-claude-code-subagents.html) —— 通用 skill 格式
- [Agentic Design System 演化](ch01-012-agentic-design-system-from-chatbot-to-orchestration.html)
- → [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/impeccable-anomaly-vibe-design-vs-vibe-coding.md)

## 深度分析

- **"对错分明 vs 好坏分明"是AI工具适用性的根本分水岭**：代码具有客观的布尔正确性（可编译/不可编译），而设计质量是定性的、上下文依赖的、主观的。这条边界解释了为何 Karpathy 的 vibe coding 范式在软件工程领域成立，但在设计领域遭遇系统性失败——AI可以精准执行语法，却无法替代设计师的审美判断力

- **6大失败类别揭示了AI前端的结构性问题，而非偶发缺陷**：紫蓝渐变泛滥、对比度不足、ARIA缺失、字距失控、F-pattern缺失、动效吞噬注意力——这六类错误不是AI的"偶发失误"，而是AI缺乏"设计经验直觉"的必然表现。原文将其定位为"anti-pattern checklist"，意味着任何AI前端方案都必须正面应对这六个维度

- **Rule-only范式在设计领域存在根本性缺陷**：单纯将规则写入CLAUDE.md属于声明式约束，AI在长上下文或任务漂移时容易"选择性遵守"。这与软件工程中rules能有效约束代码输出的情况截然不同——设计的"好"比代码的"对"更难被形式化定义

- **Skill架构代表了比Rule更深的结构化**：Skill=命令+上下文+检测器的闭环，比声明式规则多了主动触发和反馈验证两个环节。Anomaly创始人的产品哲学进一步揭示这一点的深层意义——AI不是替代设计师，而是提供一个"永远不会累、不会忘规则的junior"。这重新定位了AI在前端工作流的角色：不是创意输出者，而是品质控制者

- **这是设计领域对vibe coding的首次正式"领域拒绝"**：与Karpathy（正向接纳）和Willison（收敛为agentic engineering）不同，Anomaly创始人从37年设计经验出发，明确主张design不接受vibe coding范式。这一立场的出现预示着前端AI工具即将进入"赛道分化"阶段——原型工具vs品控工具将走向不同的技术架构

## 实践启示

1. **在前端AI项目中明确区分"原型阶段"和"品控阶段"**：用vibe coding处理快速原型和业务逻辑验证（此处AI的"对错分明"特性有效），但在设计品质控制环节切换到skill-based工作流。两个阶段采用不同的工具和方法论，而非试图用单一流程覆盖

2. **将6大AI前端失败类别内化为团队anti-pattern checklist**：无论是自研AI前端工具还是集成第三方方案，都要针对色彩理论、可访问性、排版细节、视觉层次、动效规范、一致性这六个维度建立检测规则。可参考 [Impeccable](ch05-001-impeccable.html) 的41条检测规则的实现方式，即使不直接使用该工具，也能从中学习结构化检测思路

3. **优先采用Skill架构而非Rule-only来约束AI设计输出**：在CLAUDE.md或类似配置中，不仅要写声明式规则，更要配套实现"触发命令+检测器+反馈闭环"。设计skill应该包含：主动触发的检查命令、基于规则的自动检测、与设计系统对齐的上下文信息三个部分

4. **用设计token体系支撑一致性维护**：组件风格跳跃、间距不统一、icon混用等一致性问题，根源在于缺乏统一的设计token体系。建议建立color token、spacing token、typography token、motion token四层token系统，并配合token drift检测机制，确保AI生成结果始终与设计系统对齐

5. **以"AI作为永不疲倦的junior设计师"而非"AI作为替代者"来构建产品哲学**：参考Anomaly AI Hero的定位——工具的价值在于为设计师提供一个"永远不会累、不会忘规则的审查者"。这一视角决定了产品设计方向：不是减少设计师的工作量，而是提升设计师对AI输出结果的质量把控效率

---
