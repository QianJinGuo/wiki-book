# 设计系统的新作者：从 Agent 读到 Agent 写

## Ch03.082 设计系统的新作者：从 Agent 读到 Agent 写

> 📊 Level ⭐⭐ | 9.4KB | `entities/design-systems-agent-author-evolution.md`

# 设计系统的新作者：从 Agent 读到 Agent 写

> AI Agent 从设计系统的读取者进化为写作者，Figma MCP + Storybook MCP + DESIGN.md + SKILL.md 四层能力叠加。v=8 c=9 s=4 vxc=72

## 摘要

Murphy Trueman 在 2025 年预测设计系统的下一个用户将是 Agent——一个会解析组件、检查 token、理解命名规范并产出结构正确代码的读取者。仅仅 12 个月后，Agent 已经开始写入设计系统。Figma 开放 Canvas 给 Agent 的 `use_figma` 工具、Storybook 10.3 的 MCP for React、Google 的 DESIGN.md 开放规范、Anthropic 的 Agent Skills 规范四层能力叠加，共同推动 Agent 从设计系统的读者进化为作者。这一转变对设计系统的治理模型、可追溯性和审查流程带来了根本性挑战。

## 核心要点

1. **四层能力叠加**：Figma MCP (`use_figma`) + Storybook MCP + Google DESIGN.md + Anthropic SKILL.md 构成 Agent 写入设计系统的完整技术栈
2. **四种写入模式**：画布修改（直接放置组件到 Figma 画布）、Token 编写（读写设计 Token）、文档编写（自动生成组件描述和注释）、Agent 面向文件的编写（Agent 自我生成 SKILL.md/DESIGN.md）
3. **治理挑战**：Agent 写入打破了传统"设计师起草→团队审查→代码所有者批准"的治理模型，审查环节的缺失成为最大瓶颈
4. **可追溯性危机**：Agent 的变更记录散落在 prompt 历史和模型响应中，缺乏人类作者那种面向未来问答的提交信息
5. **领先团队的特征**：Token 版本化、组件描述作为规范、文档同时面向人类和机器、有明确的所有者负责审查 Agent 产出

## 深度分析

### 从读到写的范式转变

2025 年 Trueman 论证设计系统需要为 Agent 做好"可读"准备——组件需要机器可解析的命名、Token 需要结构化的描述、文档需要能被 Agent 理解。这个论点在当时是前瞻性的，预测了 12-24 个月的时间窗口。但实际情况比预测更快：Agent 在"读"还没完全落地时就开始"写"了。

这一转变的核心驱动力是 **MCP（Model Context Protocol）** 的普及。Figma 的 `use_figma` 工具（2026 年 3 月）、Storybook 10.3 的 MCP for React（同期）、以及社区驱动的 Figma Console MCP 等工具，共同构建了 Agent 操作设计系统的能力层。这些工具不是各自独立的插件，而是同一个趋势的不同面向：设计系统的交互面正在从图形界面转向 API。

### 四种写入模式的深度分析

**画布修改**是最直观的写入模式。Agent 通过 `use_figma` 接收"用现有组件创建设置页面"之类的需求，在 Figma 画布上放置真实组件并应用变量。输出是一个可编辑、可发布的 Figma 文件，而非平面图像。这与传统的"截图+标注"工作流有本质区别——Agent 操作的是设计系统的真实构件，而不是代理表示。

**Token 编写**模式更具工程意义。通过 Storybook MCP、Figma MCP 和社区工具，Agent 可以读取 Token 文件、提出值变更建议、将变更写回变量、并同步更新文档——全部在同一个会话中完成。这意味着曾经需要设计师通过 Figma 插件手动编辑的 Token 系统，现在由 Agent 根据 prompt 指令直接操作。Token 从配置项变成了 API 端点。

**文档编写**是第三个模式。组件描述、使用说明、无障碍注释、弃用警告——这些传统上由设计师或技术写手维护的内容，现在由 Agent 在与代码变更相同的流程中自动生成。文档开始随系统演进而非滞后于系统，这改变了"先有实现后有文档"的传统顺序。

**Agent 面向文件的编写**是最深层的模式。Claude Code 的 auto-memory 将约定写入磁盘，Skill 创建工具从观察到的 workflow 生成 SKILL.md，DESIGN.md 通过 CLI 从 Figma 文件再生。那些原本用来指导 Agent 行为的文件，现在反过来成为 Agent 自己的写作对象——系统描述 Agent，Agent 修改系统，边界在循环中消失。

### 治理模型的张力

Agent 写作不会必然打破传统治理模型，但会将治理模型拉伸到它设计时未预期的程度。当 Agent 将组件变体写入 Figma 文件时，"变更和发布之间的审查步骤"不再明确属于任何人。同理适用于跨三个平台移动的 Token 值、一次性应用于整个组件库的无障碍注释。经典的"谁签批了"问题变得难以回答——大多数团队的答案是"谁知道下一个 PR 谁看"，这本质上是用希望包裹的审查流程。

Figma 原生画布 Agent（2026 年 5 月 beta，Config 2026 全面开放）进一步扩大了这一张力。Agent 不再只是通过 MCP 从外部访问 Figma 的工具——它内置在设计工具中，经过设计微调，对组件和 Token 的理解甚至超越第三方 Agent。产品经理探索布局、创始人草绘流程，都在同一个文件中操作，而熟练的 Agent 即使在不正确的情况下也能让变更看起来合理。

### 可追溯性的挑战

可追溯性是紧随审查之后的下一个断裂点。大多数系统追踪"什么变了"比追踪"为什么变"更完善，当作者是概率性的 LLM 时，这个差距变得致命。Token 从 `16px` 移到 `20px`，组件变体加了不同的 padding，无障碍注释应用到 40 个组件——每个变更都有记录，但背后的推理只存在于 prompt 和模型响应中，两者都不持久。Git 提交历史读起来像人类为未来问答准备的记录，而 Agent 的 prompt 历史更接近黑箱。

### 压缩效应

四种写入模式共享一个本质特征：压缩。设计系统一直位于意图和实现之间，中间有人类做翻译工作。Agent 正在移除这个翻译者。描述组件的同一套系统现在可以生产、测试和文档化它——这意味着系统所做的契约开始承载前所未有的重量。系统在同一动作中变得更强大也更脆弱。

## 实践启示

1. **Token 版本化是第一道防线**：将 Token 视为 API 而非配置文件。Agent 提出的值变更应作为 PR 提交到版本化 Token 文件，附带审查者和变更日志，而非原地修改变量让无人察觉。

2. **组件描述就是规范**：Agent 写入时，组件描述是它构建的依据。只描述组件外观的描述无法给 Agent 可靠的写作指导——为用途而非外观编写的描述，才能产生可用而非仅合理的 Agent 输出。

3. **建立 Agent 产出审查机制**：不是非要人类逐项检查一切，但必须有人/机制负责。可以是测试套件捕获结构回归、资深设计师批量审查 Token 变更、或自动化的规则引擎——关键在于审查有明确的所有者。

4. **文档必须同时面向人和机器**：YAML 前置元数据、JSON Token 块等机器可读结构必须与散文共存。只面向人或只面向机器都不再可行，因为文档同时是读取目标和写入目标。

5. **监控 Token 系统的完整性**：定期审计 Token 值的变化，建立废弃策略和迁移路径。Agent 可能在多个会话中渐进式修改 Token，导致整个设计语言漂移而不被察觉。

6. **记录 Agent 变更的上下文**：在 Agent 写回变更时，强制附带变更原因的自然语言摘要。使用 SKILL.md 或类似机制捕捉 Agent 做出特定设计决策的推理过程，确保可追溯性不仅仅停留在字节层面。

## 相关实体

- [Figma MCP 的四种用法](https://github.com/QianJinGuo/wiki/blob/main/entities/4-ways-were-using-our-mcp-server-at-figma.md) — Figma 的实践案例，展示了 Agent 如何使用 MCP 操作设计系统
- [Anthropic Skill Stack 架构](../ch01/884-anthropic.html) — Agent Skills 规范的工程实现
- [Claude Code 深度架构分析](https://github.com/QianJinGuo/wiki/blob/main/concepts/claude-code-deep-architecture-analysis.md) — Claude Code 的内存管理与会话持久化机制，与 auto-memory 写入设计系统文件相关
- [Claude Code 治理软规则](ch03/075-claude-code.html) — 探讨 Agent 行为的治理模式与审查策略
- [设计发现性](https://github.com/QianJinGuo/wiki/blob/main/entities/lovable-discoverability-intro.md) — 探讨设计系统在 AI 时代的可发现性

## 参考来源

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/design-systems-agent-author-evolution-murphytrueman.md)

---

