# How to Avoid AI Code Slop

## Ch09.107 How to Avoid AI Code Slop

> 📊 Level ⭐⭐ | 6.8KB | `entities/how-to-avoid-ai-code-slop.md`

## 核心要点
- 来源：eng-leadership
- 评分：v=7 × c=8
## 相关实体
- [Ai Coding Agent Quality Defense Five Control Mechanisms](../ch04/317-ai-coding-agent.html)
- [How Claude Code Works In Large Codebases Best Practices And Where To Start](../ch01/493-how-claude-code-works-in-large-codebases-best-practices-and.html)
- [Low Code Api Integration](../ch03/073-how-to-build-low-code-api-integrations-for-enterprise-apps-u.html)
- [How_Claude_Code_Works_In_Large_Codebases](../ch01/1084-claude.html)
- [Karpathy Claude Md Rules](../ch01/302-claude-md.html)

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/how-to-avoid-ai-code-slop.md)

- [MOC](https://github.com/QianJinGuo/wiki/blob/main/moc/coding-agent-practice.md)
## 深度分析
AI 代码质量问题的根源在于代码生成速度与审查速度的剪刀差。当 AI 能以 10 倍速度产出代码，而人类审查能力无法同步扩展时，团队被迫在"严格人工审查"和"AI 辅助轻量审查"之间二选一——但两者都有致命缺陷 。
**AI 代码 Slop 的六种形态：**
1. **似是而非的错误逻辑**：语法正确、风格地道，但逻辑本质错误。这类 bug 在代码审查中最难被发现，因为审查者需要理解"代码应该做什么"才能判断，而非仅看"代码做了什么" 。
2. **过度工程化**：AI 训练数据中包含大量企业级架构模式，导致原本需要 15 行代码的问题被扩展成 200 行的抽象层 。
3. **规范盲区**：代码通过通用模式生成，但忽略特定代码库的命名约定、错误处理模式、模块边界等个性化规范 。
4. **API 幻觉与废弃用法**：自信地调用不存在的方法、引用已移除两个版本的配置选项，或调用当前服务上下文中不可访问的内部 API 。
5. **防御性过度**：过多的 try-catch 块、错误静默吸收、冗余日志——代码"优雅地"吞掉失败，使调试变得几乎不可能 。
6. **模式 COPY 而不理解**：复制 retry 逻辑到根本不需要重试的上下文；为始终同步的调用添加断路器 。
**核心矛盾：Slop 能通过"视觉测试"**——它看起来像真实代码，这正是它危险的原因 。

### 从"审代码"到"审意图"范式转移
传统代码审查是为人类编写代码的世界设计的。当人类写代码时，作者的意图通过审查过程传递——他们能解释考虑过的权衡、拒绝过的替代方案、工作过的约束。即使未写明，上下文也是可访问的。
AI 写代码时，意图可能只存在于从未保存的提示词、不捕捉决策过程的工单，或工程师的脑海中。实现被保留了，但背后的推理没有 。
Aviator 的实验回答了核心问题：**如果审查发生在代码写出来之前呢？**
实验方法：先写 spec，再 AI 生成代码，最后用 spec 验证。完整实现约 6k 行代码，40% 应用代码、40% 测试、20% GraphQL 自动生成文件。Spec 审查阶段产生 14 条验收标准、65 个可检查项。第二 agent 用 6 分钟验证全部 65 条，产生结构化报告：60 通过、4 失败、1 部分通过 。
人类审查者平均每个 PR 留下 10 条评论，但发现的主要 bug 是陈旧的编辑器状态。代码审查捕获了约定级别问题（import 放置、enum 重复、命名模式） 。
**结论：Spec 审查捕获设计级别问题（缺失需求、规格不足、范围问题），代码审查捕获约定级别问题——两者针对不同维度都需要** 。

### 测试的局限性
测试验证行为，但局限于测试作者想到要测试的范围。AI 生成代码引入的失败模式，按定义是未被预料到的——因为如果工程师预料到了，他们就会在提示词中明确说明 。
> 你无法针对你没有意识到要去表述的需求写测试 。

## 实践启示
**渐进式干预框架（从简单到复杂）：**
1. **严格限定 AI 任务范围**：大型、开放式的提示词产生最多 slop。"构建这个功能"给予 AI 过多自由度。将大任务分解为边界清晰的小任务，在它们之间设置明确的检查点 。
2. **将意图作为一等公民**：在任何代码生成之前，将意图以可审查、可批准的形式写下来。轻量级规格模板：2-3 句范围描述、一系列验收标准、一条关于明确不在范围内的注释。使其成为 PR 的前置要求 。
3. **实施意图前置审查**：对于任何超过一定复杂度阈值的 AI 辅助任务，要求在代码生成开始前完成规格审批 。
   > 最昂贵的审查是发生在代码存在之后的那个 。
4. **自动化你能自动化的**：测试、linting 和类型检查捕获表面级 slop，不应跳过。AI 代码的信任是分层叠加的 。
5. **建立团队 Slop Register**：每个代码库都有 AI 持续犯错的模式。将这些模式反馈到提示词中（预防），并告知 CI 检查（捕获） 。
**关于开销的误解**：写 spec 浪费时间、工程师不想减速——这是最常见的反对意见。但 Aviator 的实验表明，spec 审查阶段约 10 小时工程工作产生了 14 条验收标准和 65 个检查项——相当于一个可作为代码验证依据的文档 。Spec 生成本身也可以是 AI 辅助的 。
**起步建议**：对于刚开始的团队，最有价值的第一步通常是：对于超过一定复杂度阈值的 AI 辅助任务，要求捕获提示词中的意图 。

## 关联阅读
- [SDD (Spec-Driven Development)](https://github.com/QianJinGuo/wiki/blob/main/concepts/sdd-specification-driven-development-harness.md) — 规格驱动开发方法论，与本文"审意图而非审代码"核心理念高度契合
- [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/how-to-avoid-ai-code-slop.md) — Ankit Jain 的完整原文

---

