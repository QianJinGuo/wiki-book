# Agent Principle Architecture Engineering Practice

## Ch04.307 Agent Principle Architecture Engineering Practice

> 📊 Level ⭐⭐ | 8.2KB | `entities/agent-principle-architecture-engineering-practice.md`

# 你不知道的 Agent：原理、架构与工程实践
文章内容基于作者个人技术实践与独立思考，旨在分享经验，仅代表个人观点。
这篇文章主要讲 Agent 架构里几块最影响工程效果的内容，包括控制流、上下文工程、工具设计、记忆、多 Agent 组织、评测、追踪和安全，最后再用 OpenClaw 的实现把这些设计原则串起来看一遍。
整理下来，有几处判断和我原来想的不太一样，更贵的模型带来的提升，很多时候没有想象中那么大，反而 Harness 和验证测试质量对成功率的影响更大，调试 Agent 行为时，也应优先检查工具定义，因为多数工具选择错误都出在描述不准确，另外，评测系统本身的问题，很多时候比 Agent 出问题更难发现，如果一直在 Agent 代码上反复调，效果未必明显，读完这篇，这几个问题应该能有些答案。
Agent Loop 的核心实现逻辑抽象后其实不到 20 行代码：

## 深度分析

### 1. Harness 工程比模型选择更决定系统成功率

文章核心观点之一：模型能力固然重要，但决定系统能否稳定运行的往往是外围工程条件。这个判断在代码编写这类高可验证任务上最成立——OpenAI 用 3 个工程师 5 个月写百万行代码、将近 1500 个 PR，速度是传统开发的 10 倍，背后不是模型有多强，而是 Harness 工程做对了：Agent 看不到的内容等于不存在（知识必须存在于代码库本身）、约束编码化而非文档化（架构分层靠自定义 Linter 机械强制）、端到端自主完成任务（从验证到合并全链路不需要人介入）。

### 2. 上下文分层是防止 Context Rot 的关键

上下文工程的本质是解决注意力稀释问题。Transformer 的注意力复杂度是 O(n²)，上下文越长关键信号越容易被噪声稀释，Context Rot 是最常见的失效模式。解决方式是按信息使用频率和稳定性分层管理：常驻层（身份定义、项目约定、绝对禁止项）保持短硬可执行，按需加载层（Skills 和领域知识）描述符常驻完整内容触发时再注入，运行时注入层（当前时间、渠道 ID、用户偏好）每轮按需拼入，记忆层（跨会话经验）不直接进系统提示需要时才读取，系统层（Hooks 或代码规则）处理确定性逻辑完全不进上下文。

### 3. 工具设计必须从 API 封装演进到 ACI 原则

工具设计经历了三个阶段：第一代 API 封装（粒度过细，Agent 需要协调多个工具才能完成目标）→ 第二代 ACI（Agent-Computer Interface，工具对应 Agent 目标而不是底层 API 操作）→ 第三代 Advanced Tool Use（Tool Search 动态发现、Programmatic Tool Calling 代码编排、Tool Use Examples 示例驱动）。ACI 原则的核心是：工具描述说明何时用何时不用、错误结构化给出修正建议、定义和实现绑定在一起。调试 Agent 时应优先检查工具定义，因为大多数工具选择错误的原因出在描述不准确，不在模型能力。

### 4. 多 Agent 协作必须协议先于协作、隔离先于并行

多 Agent 协作的核心问题不是并行，而是隔离和协作模式。两种工作模式：指挥者模式（人与单个 Agent 紧密互动，每轮调整决策，session 结束产出物就消失）和统筹者模式（人在起点和终点出现，中间多个 Agent 并行工作，产出会变成 PR 等可持久化工件）。协作必须先把协议写清楚（消息结构结构化有状态 append-only 崩溃可恢复）、任务图和依赖关系先定、隔离边界先做（子 Agent 有独立 messages[] 只回传摘要，探索细节留在子 Agent 自己的上下文里）。多 Agent 下幻觉会互相放大，需要交叉验证打断错误传播链。

### 5. 评测系统本身的问题往往比 Agent 出问题更难发现

Agent 评测结构比传统评测复杂得多：需要先准备好工具、运行环境和任务，Agent 在执行过程中多次调用工具修改环境状态，最后的评分不是看它说了什么而是跑测试验证环境里真正发生了什么。评测系统常见的出错来源包括运行环境资源不足导致进程被杀、评分器本身有 bug 把正确答案判成失败、测试用例和生产场景脱节、或者只看聚合分数而漏掉某一类任务系统性变差——这些问题在表现上都和模型退化一模一样。正确顺序是：先查环境，再动 Agent。

## 实践启示

### 1. 优先构建高质量的 Harness 基础设施

不要在模型选型上反复纠结，而要在验收基线、执行边界、反馈信号和回退手段这些工程条件上投入足够资源。拿到一个新任务时，先判断它在「任务清晰度 × 验证自动化程度」矩阵中的位置，尽可能把任务推进到「目标明确 + 结果可自动验证」的象限。

### 2. 按使用频率和稳定性分层管理上下文

不要把所有信息都塞进系统提示，而是分层管理：常驻层只放每次会话都必须成立的内容并保持简短、按需加载层用 Skill 描述符作为索引完整内容触发时再注入、运行时注入层每轮按需拼入动态信息、记忆层跨会话经验不直接进系统提示。同时确保常驻层稳定以提高 Prompt Caching 缓存命中率。

### 3. 用 ACI 原则重新审视工具设计

检查现有工具定义是否符合：面向 Agent 目标而非 API 操作、说明何时用何时不用、错误结构化给出修正建议、定义和实现绑定。工具数量要克制，能用 Shell 处理的、只需静态知识的、更适合 Skill 的，都不需要新增工具。调试 Agent 时优先检查工具描述，因为多数工具选择错误的原因在描述不准确。

### 4. 多 Agent 协作前先建立协议和隔离边界

不要先写 Prompt 再想协作方式，而是先确定协议（结构化消息、有状态、append-only）、任务图和依赖关系、隔离边界（子 Agent 独立 messages[] 只回传摘要）。引入并行之前先验证单 Agent 上限。子 Agent 设置深度限制防止无限递归，最小系统提示不带 Skills 和 Memory 指令避免权限外泄。

### 5. 评测出问题先修评测再动 Agent

建立评测体系后遇到表现下降时，第一反应是查环境（资源是否不足）、查评分器本身是否有 bug、查测试用例是否和生产场景脱节。只有确认评测系统本身没有问题后，才基于失真信号去调整 Agent 方向。评测套件饱和了不是好事——当通过率接近 100% 时应该补充更难的任务。

## 相关实体
- [Agent Engineering Principles Architecture Practice](ch04/441-agent-engineering-principles-architecture-practice.md)
- [Harness Engineering 让 Coding Agent 可靠完成长程任务 V2](ch09/043-coding-agent.md)
- [Factory Mission Multi Agent Architecture](ch01/888-factory-mission-multi-agent-architecture.md)
- [Harness Engineering Long Term Agent Tasks](ch04/502-agent.md)
- [Huggingface Ai Agent Glossary Model Scaffolding Harness Tool Skill Subagent](ch04/245-skill.md)

→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/agent-principle-architecture-engineering-practice.md)

---

