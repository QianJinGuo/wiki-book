# Harness Engineering 综合论述：为什么 2026 年真正重要的是它（含 ECC 开源实现案例）

## Ch05.006 Harness Engineering 综合论述：为什么 2026 年真正重要的是它（含 ECC 开源实现案例）

> 📊 Level ⭐⭐ | 27.3KB | `entities/harness-engineering-paradigm-comprehensive-2026.md`

# Harness Engineering 综合论述：为什么 2026 年真正重要的是它

2026 年是 Harness Engineering 概念从「Claude Code 内部实践」走向「全行业共识」的关键一年。Rahul Patil（Google）和 AI 技术立文分别在 5-6 月发布了两篇系统化论述，把 Harness Engineering 从「Anthropic 一家之言」推到了「2026 必备工程范式」的位置。 本文综合两文，结合 [Agent Harness 架构](../ch04-207-agent-harness-架构) 给出 2026 视角下的 Harness Engineering 完整图景。

---

## Harness Engineering 是什么

Harness Engineering 的核心命题：**当 LLM 是新一代运行时（Karpathy Software 3.0），agent harness 就是这个运行时的「操作系统 + 标准库」**。开发者面对的不再是「写代码调用 API」，而是「**设计一个 harness 让 LLM 在其中安全、高效、可验证地工作**」。

Harness 工程的「harness」（马具、控制系统）一词非常贴切：它不是模型本身，而是「**驾驭模型的框架**」——类似马和车的关系，车（模型）的能力是基础，但车夫（harness）决定能不能到达目的地。

## 与传统软件工程的 4 个核心区别

### 1. 概率性 vs 确定性

传统软件工程是「输入确定 → 输出确定」——给定相同输入，程序永远返回相同结果。Harness 工程是「输入相同 → 输出可能不同」——LLM 的概率性导致结果不固定。这个差异导致**传统软件工程的最佳实践（确定性测试）不直接适用**——必须用「分布测试」（多次运行看分布）替代「点测试」（单次运行看结果）。

### 2. 工具设计是核心竞争力

传统软件工程中，工具（library/framework）是「开发者用」；Harness Engineering 中，工具是「**LLM 用**」。这意味着工具的设计哲学完全改变：

- **必须 LLM 友好**：每个工具的 description 要写得详细、参数 schema 要标准化、错误信息要人类可读
- **必须可组合**：工具应该设计为可被其他工具组合（file_read + file_search → 先搜再读）
- **必须有可观测性**：每次工具调用必须有 trace/span/metric，方便 debug

### 3. Verifier 决定上线

传统软件工程的「上线 gate」是测试（unit/integration/e2e）。Harness 工程的「上线 gate」是 **verifier**——更广义的质量门禁：测试 + lint + 类型检查 + 安全扫描 + LLM-as-judge + human gate。**没有 verifier 的 harness 等同于失控的自动化**。^[concepts/verifier-driven-development]

### 4. 上下文是稀缺资源

LLM 的 context window 是有限的（即使 Claude 200K 也有限），所以 harness 必须在「什么信息应该进 context」「什么信息应该压缩」「什么信息应该丢弃」上做精细管理。传统软件工程没有这个维度。^[entities/agent-harness-context-management-working-set]

## 2026 年的关键演进

Rahul 提出的 4 个 2026 关键趋势：

1. **Harness-as-Product**：harness 本身成为产品（不只是工具）。AWS AgentCore、Anthropic Claude Managed Agents、OpenAI Agents SDK 都在做「让 harness 成为可商业化的产品」。
2. **Verifier Agent 崛起**：第二个 LLM 专门做 verifier（reviewer/quality-checker）成为标配——单一 LLM 自写自审不可靠。
3. **MCP 成为标准协议**：Model Context Protocol 从 Anthropic 一家变成行业标准（OpenAI、Google、Microsoft 都支持）——harness 的「工具 catalog」层有了标准接口。
4. **Harness 长程化**：从「单次任务」到「持续运行」的 harness 出现——Claude Code `/loop`、Codex `/goal`、Hermes cronjob 都是这个方向的探索。

## Harness 工程的 4 层架构

AI 技术立文给出的 4 层架构（综合两文）：

```
┌─────────────────────────────────────┐
│ 应用层 (Application)                 │  ← 业务逻辑、prompt、skill
├─────────────────────────────────────┤
│ 编排层 (Orchestration)               │  ← sub-agent、loop、parallel
├─────────────────────────────────────┤
│ 控制层 (Control / Harness)          │  ← verifier、context、state
├─────────────────────────────────────┤
│ 运行时 (Runtime / Model)             │  ← LLM、tools、environment
└─────────────────────────────────────┘
```

每层都有独立的工程纪律：
- 应用层：prompt 质量、skill 设计
- 编排层：sub-agent 隔离、loop 设计、task graph
- 控制层：verifier、context 管理、state 持久化
- 运行时：model 选择、tool 协议、environment 配置

## 现实案例

### Claude Code 的 Harness

Anthropic Claude Code 的 harness 是「**自用工具进化到产品**」的典型：内部工具 → 100 行 Python 原型 → 数万行 Python + Rust 产品 → Claude Code for Enterprise。^[entities/claude-code-core-internals]

### OpenAI Agents SDK

OpenAI Agents SDK 是「**harness-as-product**」的另一形态：把 harness 抽象为 Python SDK，开发者通过 import 即可获得「开箱即用的 agent loop + tool + verifier + memory」。OpenAI Codex `/goal` 是其面向 long-running 场景的扩展。

### AWS AgentCore

AWS AgentCore 是「**harness-as-managed-service**」的代表：把整个 harness 抽象为托管服务，开发者只写「业务 agent」不用管运行时。^[entities/agentcore-harness]

### Hermes Agent

Hermes Agent 是「**harness-as-extensible-platform**」的探索：核心 harness 极简（~1000 行），所有扩展通过 skill/plugin 接入。^[entities/hermes-agent] 这种「**核心小 + 扩展强**」的哲学与 Unix 「small tools, composable」的哲学一脉相承。

## 局限与反对声音

Harness Engineering 的第一个局限是**复杂度爆炸**——设计一个生产级 harness 需要 6+ 个能力域（context / harness / memory / tool / verifier / observability）协同，团队需要 5+ 个工程师才能维护。^[concepts/agent-engineering-capability-map] 第二个反对意见是**Harness-as-Product 平台的锁定风险**——一旦选用 AWS AgentCore，未来迁移到 Claude Managed Agents 成本极高。务实策略：选择「**OpenAI 兼容 API + 标准 MCP 协议**」的平台，减少锁定。^[concepts/100-line-vs-managed-harness-tradeoff] 第三个现实问题：**Harness 的「最佳实践」仍在快速演化**——2025 年的最佳实践到 2026 年可能就过时（2025 Q3 Claude Code 加入 Review Mode 就是例子）。所以 harness 选型要保留「**快速迁移能力**」。

## 与相邻概念的区分

**Harness Engineering vs Agentic Engineering**：harness engineering 是 agentic engineering 的子集（聚焦 harness 设计），agentic engineering 是更广的范式（含 context / verifier 等）。两者的关系类似「Linux kernel」和「Operating System」——kernel 是 OS 的核心但不是全部。**Harness Engineering vs Prompt Engineering**：prompt 是「**输入层**」（怎么问），harness 是「**执行层**」（怎么跑）。prompt engineering 是 harness 的一部分但远不是全部。**Harness Engineering vs Software Engineering**：传统 SE 管「**确定性代码**」，harness engineering 管「**概率性 agent 系统**」——两者核心能力栈不互通。

## 深度分析

### 洞察 1：Harness Engineering 从「一家之言」到「行业共识」的范式跃迁

2026 年最值得关注的不是技术本身，而是 **Harness Engineering 完成了从 Anthropic 内部实践到全行业共识的关键一跃**。Rahul Patil 和 AI 技术立文的系统化论述把这个原本模糊的 concept 变成了可教授、可工程化、可产品化的完整范式。这种跃迁的本质是：harness 不再是「让 agent 跑起来的胶水代码」，而是「**决定 agent 能力边界的操作系统**」。AWS AgentCore、OpenAI Agents SDK、Anthropic Claude Managed Agents 三大玩家同时押注这个方向，不是巧合，而是 LLM 能力触达某个临界点后的必然选择。

### 洞察 2：Rahul Patil / AI 技术立文论述的方法论价值

Rahul 的论述核心贡献在于**把「概率性工程的最佳实践」系统化**——传统软件工程的确定性测试范式在 LLM 场景失效后，社区急需新的工程纪律。Rahul 提出的多层 verifier、context 作为稀缺资源、工具即产品等命题，本质上是在为「**概率性软件工程**」建立方法论基础。AI 技术立文的 4 层架构（应用 / 编排 / 控制 / 运行时）则为这个方法论提供了可操作的结构框架。两文结合，第一次让 Harness Engineering 从业者有了「**从哪里入手、往哪里演进**」的共同语言。 Verifier 驱动开发 的兴起是这个方法论价值的直接体现。

### 洞察 3：LLM 作为新运行时的工程范式重塑

Karpathy 的「Software 3.0」类比在 2026 年已经不只是隐喻，而是被工程实践充分验证的现实。当 LLM 成为新的运行时，harness 就自然成为这个运行时的「操作系统 + 标准库」。这个比喻的深层含义是：**harness 的设计目标不再是「让模型输出正确」，而是「让模型在一个安全的、可观测的、有限资源的执行环境中持续运行」**。这和操作系统内核的设计哲学高度一致——内核不保证应用程序的正确性，而是保证应用程序在有限资源下的公平调度和故障隔离。 上下文管理 的本质就是 memory management，verifier 的本质就是 system call permission checking。

### 洞察 4：多层 Verifier 架构的必然性

「一个 LLM 审自己写的代码」在 2026 年已经被彻底证伪。Rahul 提出的「L1–L4 verifier 分层」不是过度工程，而是**概率性系统的必然要求**——每个 LLM 都有自己的能力边界和盲点，多层 verifier 的核心价值在于**用不同能力的 model 交叉验证不同维度的问题**。L1 的单元测试检查函数正确性，L2 的 LLM-as-judge 检查语义质量，L3 的静态分析检查安全风格，L4 的人类 gate 守住不可逆决策。只有这种分层才能应对 agent 系统的多维度质量挑战。 [Claude Code 核心架构](../ch01-162-claude-code-源码核心机制详解) 的 review mode 迭代路径是这个分层理念的最佳例证。

### 洞察 5：Context 稀缺性催生的「记忆分层」工程哲学

当 context window 成为稀缺资源，harness 必须内建「记忆分层」机制——working set（热数据）、compressed（温数据）、discarded（冷数据）。这个机制的工程哲学意义在于：**它把 LLM 的「上下文理解能力」从隐性的模型能力变成了显性的工程可控性**。传统软件工程的 memory management 是显式设计的，harness工程的 context 管理也应该是显式设计的。 Agent Harness 上下文管理 的工作集视角为这个工程哲学提供了具体实现路径。

## 实践启示

团队启动 Harness Engineering 时遵循 4 步。**Step 1：从现有工具的痛点出发**——不要「先搭 harness 再找场景」，而是「**有 3+ 个真实 agent 任务痛点**」再投入 harness 工程。**Step 2：先 100 行原型再产品化**——参考 Claude Code 演化路径，先用最少代码跑通主循环，验证假设后再产品化。**Step 3：选 platform 优先选 OpenAI 兼容 API**——避免被单家平台锁定。**Step 4：每月 review harness 质量**——verifier 通过率、tool 调用成功率、context 命中率、成本/token 等指标作为月度 review 输入。**关键原则：harness 应该是「**慢慢长出来**」而非「**一次到位**」**——这与 Agent 作为 Software 3.0 基础设施 的整体哲学一致。^[concepts/agent-as-software-3-0-substrate]

## 2026 落地的 4 个工程重点

基于两篇综合论述 + Anthropic Claude Code / OpenAI Codex / AWS AgentCore / Hermes Agent 的实践，2026 年 Harness Engineering 的 4 个工程重点：

### 重点 1：把 verifier 做成独立子系统

传统做法是「**测试通过 = 上线**」，2026 应该是「**多层 verifier + 独立子系统**」：
- L1: 单元/集成测试（函数级正确性）
- L2: LLM-as-judge（输出质量）
- L3: 静态分析（安全/性能/风格）
- L4: Human gate（高风险/不可逆动作）

每个 L 都是独立子系统（独立 prompt / 独立 model / 独立 context），不能「**用同一个 LLM 审同一个 LLM 写的代码**」。

### 重点 2：把 context 当作稀缺资源

LLM context window 是有限的——即使 Claude 200K 也有限。2026 harness 的关键工程是「**context 优化**」：
- 哪些信息进 context（working set 策略）
- 哪些信息压缩（autoCompact 策略）
- 哪些信息丢弃（decay 策略）

参考 Agent Harness 上下文管理 的工作集视角。

### 重点 3：建立 harness 自身的可观测性

「**没有可观测性 = 没有 production**」——harness 的每次运行必须有 trace/span/metric，让人类可以 debug 「**为什么这次 agent 输出错了**」。工具：LangSmith / Helicone / Braintrust / OpenLLMetry。Hermes Agent 的 wiki-lint pre-commit gate 是 harness 可观测性的小型实现。

### 重点 4：每月 review harness 质量

harness 不会「**一次到位**」——它在生产中会不断暴露问题。每月 review 这些指标：
- verifier 通过率（多低算低？）
- tool 调用成功率（多低算低？）
- context 命中率（多低算低？）
- 每次任务平均 token 消耗（趋势）
- 用户 feedback rate

根据指标调整 harness 配置——这与 Agent 自我改进循环 的「harness 也是 agent 的一部分」理念一致。

## 2026 Harness Engineering vs 2024 比较

| 维度 | 2024 | 2026 |
|------|------|------|
| Harness 角色 | 工具 | 操作系统 |
| 核心能力 | prompt + tool | context + verifier + observability + memory + orchestration |
| 团队规模 | 1-2 人 | 5-10 人 |
| 产品形态 | Library | Platform / Service |
| 评测方式 | 单元测试 | 多层 verifier |
| 上线 gate | 测试通过 | verifier 通过 + human review |
| 商业模式 | 开源 / 商业 | 托管服务（per-call / per-agent） |

这个对比显示：**harness 工程在 2 年内从「开发实践」升级到「独立产品」**——这是 2026 年最重要的范式跃迁。

---

# 第 3 来源补充：ECC（affaan-m/everything-claude-code）— Harness 操作系统的开源实现案例

> VibeCoder / Vibe编码 2026-06-16 对 affaan-m/ECC 仓库的源码深度分析。如果说第 1/2 来源建立了"Harness = LLM 时代的操作系统"的概念框架，这一篇给出了**真实可用的开源实现案例**——一个完整的 Harness OS 怎么组织、怎么工作、怎么落地。

## ECC 是什么

> **AI 编程工具正在从单次问答，往一整套工程工作流迁移**。

affaan-m/ECC（原 everything-claude-code）把 agent 在真实开发里需要的**配置、hook、技能、记忆、验证和并行执行**全部组织起来。

> **看完整份源码后，它更像一套 harness 操作系统**——agent 怎么进入项目、怎么加载上下文、怎么少浪费 token、怎么验证、怎么把重复经验沉淀下来。

## 三层安装结构（关键工程细节）

### profiles / modules / components 三层

| 层 | 职责 | 示例 |
|----|------|------|
| **profiles** | 决定默认装多大一套 | `minimal` / `core` / `developer` / `security` / `research` / `full` |
| **modules** | 把资产分组 | rules / agents / commands / hooks / platform configs / workflow skills |
| **components** | 面向用户按能力选择 | 每个 skill 独立 component |

> **关键工程细节**：`scripts/lib/install-manifests.js` 会给**每一个 skill 生成独立 component**。

用户可以只装 `strategic-compact`、`verification-loop`、`iterative-retrieval` 这几个高价值技能，**不用把整个大包塞进 prompt**。

> **Agent 的上下文有硬上限，装得越满，越容易让模型带着一堆无关指令工作**。

## 8 大主题深度拆解

### 1. Token 优化靠选择

**按任务路由模型**：
- 机械扫描 / 分类 / 后台提取 → 便宜模型
- 默认实现 / review → 主力模型
- 架构判断 / 复杂设计 / 高风险决策 → 更强模型

> **更关键的是安装面控制**。少装不需要的 rules/agents/skills/MCP，比后面再努力压缩 prompt 更有效。

**后台处理**：edit 后只记录改动文件，真正的格式化和 typecheck 放到 Stop 阶段批量跑。**快速编辑时保持轻，收尾时再做严一点的检查**。

### 2. 记忆要有边界

> **很多 agent 记忆方案最大的问题，是把旧总结直接当成新指令塞回来**。

ECC 的 `session-start.js` 会加载历史上下文，但它：
- **有上限**
- **优先按 worktree 匹配**
- **历史摘要会被明确标成历史参考，不会伪装成当前任务命令**

**记忆三分法**：

| 类型 | 风险 |
|------|------|
| 项目事实 | 低（项目级固定） |
| 历史会话 | 中（上下文加载） |
| 可复用 instinct | 高（必须谨慎 promote） |

### 3. 进化能力（continuous-learning-v2）

> **没有让模型凭感觉写一堆"经验总结"**。

**真实行为记录**：
- `PreToolUse` / `PostToolUse` hook 记录真实工具行为
- **observer 后台读取最近观察**
- 只有**重复出现的模式**才会被提成 instinct

**Instinct Scope & Confidence 规则**：
- 项目内反复出现 → 先留项目
- 多项目都出现 + 置信度够高 → promote 全局经验
- `evolve` 把稳定 instincts 聚类 → 生成候选 skill/command/agent

> **不建议一开始就把自动观察全开**。先手动跑一段时间，确认团队工作流稳定，再打开 continuous-learning-v2。否则它学到的可能是早期混乱习惯。

### 4. 验证三层 + Eval 关键区分

**验证分层**：

| 层次 | 用途 |
|------|------|
| **checkpoint** | 阶段标记，比较这一步是不是比上一版更好 |
| **quality gate** | 日常 hook，改完文件后跑轻量检查 |
| **eval harness** | 评估 agentic workflow 能不能稳定完成任务 |

**Eval 关键区分（独家洞察）**：

| 指标 | 场景 | 含义 |
|------|------|------|
| **pass@k** | 探索 | k 次里有一次成功就算有生成价值 |
| **pass^k** | 回归 | 连续 k 次都得过才说明行为稳 |

> **pass@k 适合探索**（看模型能不能做出来）；**pass^k 适合回归**（看模型稳定性能不能复现）。

### 5. 并行隔离原则

> **没有鼓励盲目多开 agent**。

**能并行的**：读代码、审查、测试、互不重叠的小功能
**应该 worktree 隔离甚至别并行的**：会互相踩文件 / 改 schema / 动部署环境

### 6. Subagent 上下文（iterative-retrieval 独家设计）

> **Subagent 最难处理的是上下文**。

- 给太多 → 贵 + 容易分心
- 给太少 → 只能猜

ECC 的 `iterative-retrieval` 走**检索循环**：

```
1. 派一个宽查询
2. 评估材料够不够
3. 再补检索（最多循环几轮）
4. 收口时只把相关上下文交给执行 agent
```

> **这个模式比"让 subagent 自己读完整仓库"靠谱很多**。它把任务拆成找材料和做判断，减少盲派任务的成本。

### 7-8. 安装建议（渐进升级路径）

**起步小安装面**：
```
minimal profile + strategic-compact + context-budget +
verification-loop + eval-harness + ai-regression-testing +
iterative-retrieval
```

**Hook 温和起步**：session start / pre compact / session end / post edit accumulator / stop format typecheck / quality gate / context monitor / config protection

**渐进升级**：
- 大项目 → 加 dmux/worktree orchestration
- 团队稳定后 → 打开 continuous-learning-v2

## ECC 设计的 6 大哲学原则

> **ECC 最值得看的地方，是它把 agent 工作流当成工程系统来设计**。

它默认模型需要：

1. **边界**（安装面 + 记忆 scope）
2. **记忆分层**（项目事实 / 历史会话 / instinct 三类分离）
3. **检查点**（checkpoint / quality gate / eval harness）
4. **评测分级**（pass@k 探索 vs pass^k 回归）
5. **后台学习**（observer → instinct → skill 渐进 + scope 渐进）
6. **并行隔离**（worktree + 写入面控制）

才能在真实工程里稳定工作。

> **真正落地时，我会很克制地装**。先用小安装面解决最痛的问题，再按项目需要加 hook 和 skill。

> **Agent harness 的复杂度一旦失控，本身也会变成新的上下文负担**。

## 第 3 来源 vs 前 2 来源的互补

| 维度 | 第 1 来源（Rahul Patil） | 第 2 来源（AI 技术立文） | 第 3 来源（ECC） |
|------|------------------------|------------------------|----------------|
| 视角 | 概念框架 + 行业趋势 | 中国 AI 团队实践综述 | **真实开源实现** |
| 抽象层 | "为什么 2026 Harness 是 OS" | "Harness 12 组件 / 7 层" | **"OS 的具体代码长啥样"** |
| 关键概念 | Harness 角色转变 | 12 组件 / 7 层 / 6 类 agent | **profiles/modules/components + 8 主题** |
| 实操内容 | 概念 + 哲学 | 中国实践综述 | **真实仓库源码分析** |
| 独家贡献 | 2024 vs 2026 对比表 | ADPS / CSO / 6 类 agent | **pass@k vs pass^k + iterative-retrieval + instinct scope 渐进** |

**关键判断**：第 3 来源把抽象的"Harness 操作系统"概念**落到一个真实的开源仓库**——affaan-m/ECC 提供了 8 大主题的具体实现方案（安装面控制、按任务路由模型、记忆三分法、observer 后台学习、pass@k vs pass^k、iterative-retrieval 检索循环、worktree 并行隔离、渐进升级路径）。这是其他 Harness Engineering 论述中**几乎找不到的工程实操粒度**。

---

## 相关实体

- [loop engineering: 把反馈循环放进工程现场](../ch05-004-loop-engineering-把反馈循环放进工程现场)
- [Hermes Agent Eval Harness：可验证 Skill 进化的 7 模块闭环](../ch04-418-hermes-agent)
→ [第 1 篇原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/harness-engineering-2026-rahul-rauhul.md) · [第 2 篇原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/harness-engineering-everything-2026-ai-tech-article.md) · [第 3 篇原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/ecc-harness-os-everything-claude-code-vibecoder-2026-06-16.md)​

---

