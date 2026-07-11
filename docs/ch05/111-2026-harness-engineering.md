# 为什么 2026 年真正重要的是 Harness Engineering？

## Ch05.111 为什么 2026 年真正重要的是 Harness Engineering？

> 📊 Level ⭐⭐⭐ | 12.5KB | `entities/harness-engineering-2026-why-it-matters.md`

# 为什么 2026 年真正重要的是 Harness Engineering？

## 摘要

2026 年 AI 工程的核心范式正在从"更强的模型"转向"更可靠的系统"。Harness Engineering——即 AI agent 的系统化工程约束与安全壳层设计——被 ThoughtWorks、Anthropic、OpenAI 和 Hugging Face 等组织独立认定为 2026 年最重要的工程学科。其核心公式为：**Agent = Model + Harness**。Harness 是模型之外的一切——约束、反馈回路、上下文文档和工具边界。本文系统阐述了 Harness Engineering 的五大工件、三个实践阵营、五条普适原则，以及"构建是为了删除"的反直觉设计哲学。

## 核心概念

### Agent = Model + Harness

Harness 的最简定义来自 ThoughtWorks：Agent 不仅仅是模型，而是模型与 Harness 的组合。Harness 包括让 agent 不偏离轨道的约束、捕捉错误的反馈回路、告诉 agent 自己身在何处的文档、以及它被允许使用的工具。拿掉 harness，就只剩一个原始语言模型，在代码库里"一路猜"。加上合适的 harness，就变成一个能交付生产代码的系统。

### 操作系统类比

Hugging Face 的 Philipp Schmid 给出了一个精妙的类比：

- **Model = CPU**（原始处理能力）
- **Context window = RAM**（有限、易失的工作记忆）
- **Harness = Operating System**（管理 CPU 在何时看到什么）
- **Agent = 运行在上面的应用**

多数团队正在运行"没有操作系统的应用"——这是他们的 agent 在生产环境失败的根源。

## 五种核心 Harness 工件

### 1. AGENT.md / CLAUDE.md 文件

分布在代码库各处的 Markdown 文件，agent 在每次会话开始时读取，包含项目上下文、编码约定、架构决策和当前工作。OpenAI 称其为 AGENT.md，Anthropic 称其为 CLAUDE.md，Cursor 使用 .cursorrules。每个主要模块一个文件，随项目演进持续更新。

### 2. JSON 功能列表（进度追踪器）

跨会话工作时，agent 每次启动都拿到空上下文窗口。JSON 进度文件记录了每个功能的定义、验证方式和通过/失败状态。agent 在每次会话开始时读取它，选择优先级最高且仍失败的功能，实现并标记通过——实现了一个"读进度→选功能→实现→提交→重复"的闭环。Anthropic 发现 agent 意外覆盖 JSON 的概率低于 Markdown，一个小细节在 6 小时自主运行中非常关键。

### 3. 会话初始化例程

每次会话都以同样的 7 步启动序列开始：确认工作目录 → 阅读 git 日志和进度文件 → 检查功能列表 → 启动开发服务器 → 运行基础端到端验证 → 实现一个功能 → 描述性信息提交。没有这套例程，agent 会把前 20 分钟浪费在弄清楚"已经有什么"上。

### 4. Sprint 合约

在 agent 写下第一行代码之前，两个 agent 先谈判：Generator agent 提出构建方案和验证标准，Evaluator agent 审查方案的完整性和标准清晰度。只有双方达成一致后才开始实现。这是 AI 版的设计评审——在同一次处理中同时规划和执行的 agent，产出不可靠结果。

### 5. 结构化任务模板

在任何编码之前，Harness 先分析真实代码库，生成基于实际代码库的影响地图——真实文件路径（非幻觉路径）、真实存在的符号名、应遵循的现有模式、具体的验收标准。大多数团队跳过这一步，导致 agent 猜测文件结构、发明不存在的 API 端点、构建出和代码库不匹配的东西。

## 三大实践阵营

### OpenAI：环境优先

OpenAI 的 Codex 团队交付了 100 万行生产代码（零手写），核心方法是"先设计环境，再放手让 agent 工作"。他们不逐行 code review，而是把环境设计得足够彻底，让 agent 一开始就产出可评审的结果。具体实践包括：严格的依赖流（Types → Config → Repo → Service → Runtime → UI）、遍布代码库的 AGENT.md 文件、agent 直接接入 CI/CD 流水线。成果：Sora Android 应用，4 位工程师，28 天，Play Store 排名第一，99.9% 无崩溃。Codex 每周处理内部 70% 的 pull request。

### Anthropic：执行与评审分离

Anthropic 发现 agent 无法可靠地评价自己的输出（给自己"全 A"），因此设计了三个专门的 agent 角色：**Planner**（将提示转成完整产品规格）、**Generator**（一次一个 sprint 实现功能）、**Evaluator**（用浏览器自动化像真实用户一样测试应用）。关键洞察：让独立 evaluator 保持怀疑，远比让 generator 严厉批评自己的工作容易。数据对比：单独 agent 无 harness 仅 9 美元但产出破损应用；完整 harness 需要 200 美元但产出可用软件。

### ThoughtWorks：2×2 分类框架

ThoughtWorks 观察 50 多个工程团队后，提出沿两个轴分类 harness 控制：运行时维度（Feedforward 引导 vs Feedback 反馈）和机制维度（Computational 确定性 vs Inferential LLM 驱动），形成 2×2 矩阵：计算性前馈（类型系统、linter）、计算性反馈（测试套件）、推理性前馈（规格文档）、推理性反馈（LLM 代码评审）。核心发现：单靠 feedforward 或 feedback 都不够，两者必须并存在分层设计中。

## 五条普适原则

1. **上下文胜过指令**：展示当前世界状态比抽象指令更有效
2. **规划和执行必须分离**：不可在同一轮处理中同时完成二者
3. **反馈回路不可协商**：没有反馈的 harness 只是绕了远路的 prompt
4. **一次只做一件事**：强制增量主义是所有成功 harness 的共性
5. **代码库就是文档**：repo 是唯一事实来源，不存在独立的 agent 知识库

## Harness 衰减悖论

### 构建是为了删除

Harness 的每个组件都编码了一个关于"模型做不到什么"的假设。随着模型能力进步，这些假设会过期——这就是 **harness 衰减**。Anthropic 的 A/B 测试显示，从 Opus 4.5 到 4.6 到 4.7，曾经必不可少的 sprint 拆解和 evaluator 角色不断缩小或变为累赘。Philipp Schmid 的建议是"构建是为了删除"：每个 harness 组件都应设计为可移除的，定期关掉每个组件测试输出质量是否变化，如果没变化就删除。

### 成本演化

完整的 harness 方案（200 美元，6 小时）比无 harness（9 美元，20 分钟）贵 22 倍，但换来了可运行产品而非截图正确的演示版。更重要的是，趋势线是：更好的模型 = 更简单的 harness = 更便宜的运行，因此 harness 投资的价值会随着模型升级而增值而不是贬损。

## 深度分析

### 1. Harness Engineering 的本质是"信任但验证"的系统化

Harness Engineering 的深层本质是 AI 时代的**系统工程方法论**——它在模型能力与生产可靠性之间建立了一个可量化、可管理的接口层。这条思路与 [Backend for Agent](../ch03/045-agent.html) 中讨论的"智能体后端"架构一脉相承，都是将不可预测的智能体行为约束在可控框架内的工程尝试。不同于传统软件工程中的防御性编程（Defensive Programming），Harness Engineering 不是在代码层面设置壁垒，而是在认知和决策层面建立护栏——它约束的是 agent 的"思考过程"而非"执行结果"。

### 2. "环境比模型更重要"的隐含前提

LangChain 的同一模型在不同 harness 下 52.8% → 66.5% 的提升，和 Vercel 移除了 80% 工具后性能反而更好的发现，共同指向一个反直觉的结论：**约束不是负担，而是性能杠杆**。但这隐含了两个前提：第一，模型本身必须具备足够高的能力基线（弱模型即使有最好的 harness 也办不到）；第二，harness 设计与模型能力必须协调演进——oprus 4.5 时代需要的 sprint 拆解在 opus 4.7 时代变成了多余。这意味着 harness 设计者需要**持续跟踪模型能力变化来调整约束强度**，而不是"一次设计、永久使用"。

### 3. 从"强模型"到"强系统"的范式迁移

Harness Engineering 的兴起标志着 AI 工程的重心从"提高模型智商"迁移到了"提高系统可靠性"。这种迁移与 [Agent 落地真相](../ch03/045-agent.html) 中讨论的"从能跑通到能投产"的讨论完全一致。2025 年行业更关注模型评测成绩单上的数字提升；2026 年的竞争焦点则变成了：谁能先让 AI agent 可靠地交付生产级输出。Harness Engineering 正是此范式迁移的工程载体。

### 4. Harness 衰减的深层次含义

"构建是为了删除"的设计哲学触及了一个更本质的问题：**AI 系统的工程设计与 AI 模型的进步速度之间永远存在时差**。今天的 harness 设计是对今天模型缺陷的补偿，而明天的模型可能已不再有那些缺陷。这意味着 harness 工程本质上是一种"临时性"——其价值不是永久性的基础设施，而是在模型能力追赶生产需求过程中的过渡方案。这一认识对于长期工程投资决策具有指导意义：与其花大代价建造永久性的基础设施，不如设计可快速替换的模块化约束层。

## 实践启示

1. **从小型 harness 开始，分阶段扩展**：不必一开始就搭建完整的三大件（AGENT.md + JSON 进度 + sprint 合约）。从最薄的一层（一个 AGENT.md 文件）开始，让 agent 先跑起来，然后根据实际失败的模式扩展 harness——这是迭代式 harness 建设的最佳实践。

2. **量化 harness 效果**：在引入每个 harness 组件前后，记录关键指标（agent 完成率、错误率、迭代次数、token 消耗）。只有当数据证明组件正在降低重要错误率时才保留它。定期测试在移除该组件后指标是否变化。

3. **模型升级时主动审查 harness 组件**：每当你升级目标模型（例如从 claude-opus-4.5 到 4.6），主动审查所有 harness 组件是否仍然必要。Anthropic 的经验表明，一次模型升级可以让某些组件完全多余。"构建是为了删除"应成为每个 spririt 的固定议程。

4. **VDD（验证驱动开发）是 Harness Engineering 的核心实践**：不管是 JSON 功能列表中的通过/失败标志，还是 sprint 合约中的 evaluator 检查，验证驱动是确保 agent 输出质量的最有效手段。在 agent 开始任何工作前，先确定"如何验证结果是正确的"。

## 相关实体

- [Backend for Agent — 智能体后端架构](../ch03/045-agent.html)
- [Agent 落地真相：从能跑通到能投产](../ch03/045-agent.html)
- [Agent Harness 钉钉招聘实践](ch05/039-agent-harness.html)
- [Claude Code Skills 实践指南](../ch07/035-claude-code-skills.html)
- [注意力崩溃与上下文管理](https://github.com/QianJinGuo/wiki/blob/main/entities/attention-collapse-context-management.md)
- [Harness Engineering 框架](https://github.com/QianJinGuo/wiki/blob/main/concepts/harness-engineering-framework.md)

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/为什么-2026-年真正重要的是-harness-engineering.md)

---

