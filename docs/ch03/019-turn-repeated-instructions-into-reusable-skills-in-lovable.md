# Turn repeated instructions into reusable skills in Lovable | Lovable

## Ch03.019 Turn repeated instructions into reusable skills in Lovable | Lovable

> 📊 Level ⭐ | 8.0KB | `entities/turn-repeated-instructions-into-reusable-skills-in-lovable-l.md`

## 核心要点
- **AI agent 的记忆缺失问题**：当前 AI agents 都是通才（generalists），每次打开 Lovable 都不记得用户的工作方式、 conventions 和风格，需要反复解释相同内容
- **Skills 是可复用的指令集**：Skills 解决"重复解释"问题——写一次，AI 在相关任务时自动调用，用户停止重复自己
- **Skills vs Knowledge vs Prompting 三层模型**：prompting 是即时需求，knowledge 是始终加载的常量，skills 是任务特定的可复用 playbook 
- **Description 是技能的核心**：Lovable 决策是否调用某个 skill 时只读取 description，不读 instructions——description 弱则 skill 无效
- **Skills 按需加载，可叠加**：多个 skills 可同时触发同一任务（focused skills stack cleanly），支持手动调用（/skill-name）或自动匹配
- **Skills 只是指令，不是脚本**：Skill 不执行操作、不扫描网站、不运行检查——只是 Lovable 读取并遵循的指南

## 深度分析
### 1. Skills 的本质价值：消除重复摩擦
文章指出了 AI agents 当前的核心矛盾：通用性与个性化的张力。当前 agent 没有记忆，每次对话都是全新的上下文。用户被迫反复解释自己的 conventions、风格偏好和已有工作方式。这种"小摩擦累积"是 agent 采用率提升的主要障碍之一。
Skills 的解决方案本质上是将"隐性知识显性化"——把用户头脑中对"这件事应该怎么做"的认知提取成文档，让 AI 可读取。这与传统的 prompt library 不同，Skills 是任务触发的可组合单元，而非静态的指令集合。

### 2. Description 设计是技能系统的关键工程点
文章用大量篇幅强调 description 的重要性，因为 Lovable 的触发机制依赖 description 而非 instructions。这是一个反直觉的设计：instructions 再精美，description 不准确就不会被调用。这意味着 Skills 的核心工程挑战是**准确描述触发条件**，而非写详细的执行步骤。
好的 description 包含三个要素：具体触发动作（如"building, styling, modifying UI"）、技能实际作用（如"enforces visual conventions"）、明确边界（"not for content or copy decisions"）。边界界定的缺失是 bad description 的常见问题。

### 3. Skills 的可组合性与"聚焦优于大而全"
文章揭示了一个重要的 Skills 设计原则：多个小而聚焦的 skills 可叠加生效，而一个大而全的 skill 会互相竞争。design-system 和 landing-page-copy 可同时触发，分别作用于视觉和文案，形成 1+1>2 的效果。
这与 software design 中的单一职责原则（SRP）高度一致：技能应该做一件事并做好。当技能边界模糊时（两个 skill 都可能触发同一任务），问题通常出在 description 描述不够精准，而非需要更多规则。

### 4. 渐进式细节加载架构
Skill 文件结构支持主文件和支撑文件的分离：主 SKILL.md 保持精简（快速加载），支撑文件通过 markdown link 按需引入（[View palette](./colors.md)）。这种架构让 skill 可包含深度细节而不影响触发性能。
这是一种典型的"懒加载"设计：只在实际需要时才加载更深层的上下文，避免一次性加载所有知识造成的 token 浪费和干扰。

### 5. 与 Knowledge 的互补关系
文章明确了 Skills 和已有"workspace/project knowledge"的功能区分：Knowledge 是始终加载的基础规则（coding standards、brand voice、产品细节），Skills 是任务触发的 playbook。两者协同：Knowledge 定义常量，Skills 定义可复用流程。
这意味着用户需要维护两套上下文体系，设计良好时两者相互增强——Knowledge 提供一致的基础，Skills 提供灵活的专项能力。

## 实践启示
1. **优先打磨 description**：写 Skills 时先确保 description 准确描述触发条件（何时调用）和边界（何时不调用），再写 instructions。Description 是入口，入口错则全盘皆输。
2. **用"教新队友"的心态写 instructions**：把 skill 看作给新成员的 one-page guide，而非给 AI 的程序脚本。具体规则（如"no pure black or pure white"）胜过模糊指示（如"keep it professional"）。
3. **建立"避免"章节**：明确列出不该做的事（颜色、词汇、布局模式）往往比正面清单更有价值，因为 AI 默认行为需要被显式约束。
4. **定期审查 skill 的实际效果**：Skill 发布后需要迭代——如果 AI 响应模糊，收紧 instructions；如果触发时机不对，调优 description。Skills 是活的工件，需要维护。
5. **避免为一次性任务创建 skill**：Skills 解决的是反复出现的摩擦，如果某件事只发生一次，overhead 超过收益。判断标准：这件事以前出现过吗？以后还会出现吗？
6. **当多个 skill 冲突时，优先收窄 description**：Skills 冲突几乎总是 scope 问题，不是规则数量问题。收紧 description 让触发更精准，避免两个 skill 同时触发同一任务。

## 典型 Skill 示例解析
### design-system
- **触发条件**：构建或修改任何页面/组件
- **核心约束**：只使用品牌色板、组件复用、避免混用圆角/锐角
- **设计亮点**：包含支撑文件 colors.md 和 components-reference.md，主文件通过 link 按需加载

### fresh-eyes-review
- **触发条件**：用户需要关于网站的第一印象反馈
- **核心约束**：模拟陌生人视角，五秒测试、" huh?" 时刻、信任缺口检测
- **设计亮点**：用"七秒关闭"的心理模型驱动审查视角，而非泛泛的"给反馈"

### landing-page-copy
- **触发条件**：撰写或重写 landing page、hero、营销页面文案
- **核心约束**：禁止词汇清单、结构固定（Hero→3 benefit blocks→Proof→CTA）
- **设计亮点**：明确的边界定义（not for blog posts, help docs, in-app text）

## 相关实体

- [Lovable Discoverability 介绍](https://github.com/QianJinGuo/wiki/blob/main/entities/lovable-discoverability-intro.md)

- [Claude Code Skills 超能力实战](../ch01/521-claude-code-skills-superpowers.html)
- [Anthropic Agent Skills 设计模式14条](../ch04/277-anthropic-agent.html)
- [Matt Pocock Skills Grill](ch03/069-skills.html)
→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/turn-repeated-instructions-into-reusable-skills-in-lovable-l.md)

---

