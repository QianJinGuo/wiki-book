# Harness Engineering: 让 Coding Agent 可靠完成长程任务

> 📊 Level ⭐⭐⭐ | 11.8KB

> 本页原内容在 2026-09-07 质量闭环中判定为 **dup-0.75**，已按导航页（MOC）重建；
> 原文备份见 `_archive/hub-rewrite-2026-09-07/harness-engineering-让-coding-agent-可靠完成长程任务-v2.md`，一手来源仍见下方 sources。

## 机制与论文
- [AgentScope Java Harness Framework 2.0 — 企业级 Agent 分布式场景的 Harness 实现 (Java 2.0 重大升级)](https://github.com/QianJinGuo/wiki-public/blob/main/entities/agentscope-java-harness-framework-enterprise-distributed.md) — AgentScope Java全版
- [晓斌：从 People-Oriented 到 Agent-Oriented Infra —— 意图驱动 + 代码沉淀的进化体](https://github.com/QianJinGuo/wiki-public/blob/main/entities/agent-oriented-infra-intent-driven-code-sedimentation.md) — Agent-Oriented Infra长文
- [Agent Harness 架构设计与实现：生产级 Agent 系统落地指南](https://github.com/QianJinGuo/wiki-public/blob/main/entities/agent-harness-architecture-design-production-guide.md) — 七层金字塔生产指南
- [Kimi Work：通用 Agent 战场从云端迁移到本地](https://github.com/QianJinGuo/wiki-public/blob/main/entities/kimi-work-codex-vibe-working-paradigm-shift.md) — Vibe Working开启+本地Harness 20356字rv9
- [Rein：4 模块 + 5 类型边界防止 agent.go 膨胀到 3000 行](https://github.com/QianJinGuo/wiki-public/blob/main/entities/rein-go-agent-4-modules-5-type-boundaries.md) — 4模块+5类型边界+7不变量：数据契约防上帝文件
- [Hugging Face AI Agent 术语表：Model / Agent / Scaffolding / Harness / Context Engineering / Policy / Tool / Skill / Sub-agent 完整区分](https://github.com/QianJinGuo/wiki-public/blob/main/entities/huggingface-ai-agent-glossary-model-scaffolding-harness-tool-skill-subagent.md) — HF术语表16399字：Scaffolding/Harness/Policy辨析
- [State of Memory in Agent Harness — mem0 视角的九大 harness 横评](https://github.com/QianJinGuo/wiki-public/blob/main/entities/state-of-memory-in-agent-harness-mem0-2026.md) — 九大harness记忆横评
- [Coding Harness 工程本质：从 Pi 到 OpenClaw](https://github.com/QianJinGuo/wiki-public/blob/main/entities/pi-openclaw-coding-harness.md) — Harness八能力+五工程模式：Context像投影8441字rv9
- Context Window Management Comparison — 四框架对比rv9
- [Harness Engineering 综合论述：为什么 2026 年真正重要的是它（含 ECC 开源实现案例）](https://github.com/QianJinGuo/wiki-public/blob/main/entities/harness-engineering-paradigm-comprehensive-2026.md) — 综合论述17305字含ECC案例rv9
- Anthropic N-days: Frontier Agent Vulnerability Research — N-day研究
- [Agentic Loop Engineering 工程手册：17 种 Loop 工程化技术的可复现实证框架](https://github.com/QianJinGuo/wiki-public/blob/main/entities/agentic-loop-engineering-handbook-empirical-framework.md) — 17种loop实证

## 工程实践
- ['长周期 Agent 详解：从 Ralph Loop 到可接管 Harness'](https://github.com/QianJinGuo/wiki-public/blob/main/entities/long-running-agent-ralph-loop-handover-harness-ruofei.md) — 三类漂移+5张卡治理12390字rv10全版
- [Karpathy 最新访谈：从 Vibe Coding 到 Agentic Engineering](https://github.com/QianJinGuo/wiki-public/blob/main/entities/karpathy-vibe-coding-agentic-engineering-v4.md) — v4 8090字rv10：可验证性上限+MenuGen警示
- [柚漫剧 AI 全流程提效拆解](https://github.com/QianJinGuo/wiki-public/blob/main/entities/yumanju-ai-full-flow-efficiency.md) — rv10全流程提效规则基建
- [Claude Code 源码核心机制详解](https://github.com/QianJinGuo/wiki-public/blob/main/entities/claude-code-core-internals.md) — 源码机制18k主版
- [Harness Engineering：让 Coding Agent 可靠完成长程任务](https://github.com/QianJinGuo/wiki-public/blob/main/entities/harness-engineering-long-term-agent-tasks.md) — 长程任务四原则+3000行粒度公式rv9
- [wow-harness v3：AI 开发的治理协议](https://github.com/QianJinGuo/wiki-public/blob/main/entities/wow-harness-v3-governance-protocol.md) — 事件溯源跨session治理协议
- [Codex /goal：长任务Agent的目标运行时](https://github.com/QianJinGuo/wiki-public/blob/main/entities/codex-goal-agent-runtime.md) — goal运行时rv9主版
- [高德 AI-Native 生产线（第 3 期）：7x24 Self-Healing Pipeline + Agent 自进化](https://github.com/QianJinGuo/wiki-public/blob/main/entities/gaode-ai-native-7x24-pipeline-self-healing.md) — 7×24自愈生产线15428字rv9全版
- [Harness Engineering 综合性指南（ConardLi 系列 · 含 Beautiful Article 实证 + Reacticle 协议）](https://github.com/QianJinGuo/wiki-public/blob/main/entities/harness-engineering-comprehensive-guide-conardli.md) — ConardLi六层架构14634字rv9
- [Deep Agents + Bedrock AgentCore：多 Agent 编排 + 隔离基础设施的端到端研究 Agent 实战](https://github.com/QianJinGuo/wiki-public/blob/main/entities/deep-agents-bedrock-agentcore-subagent-orchestration-aws.md) — 两层编排参考实现
- Orchestrating Self-Evolving Agents with CrewAI and NVIDIA NemoClaw — Flows/Crews双层+信任鸿沟
- [异步调用模式：Serverless 流水线中调用 Agent（避免空闲计算成本）](https://github.com/QianJinGuo/wiki-public/blob/main/entities/asynchronous-agent-invocation-patterns-serverless-pipelines.md) — 异步调用三模式

## 延伸导航
- [Agent 工程全景指南](https://github.com/QianJinGuo/wiki-public/blob/main/moc/agent-engineering-guide.md)

## 深度分析

### 长程任务的失败不是能力问题，而是状态问题

文章最核心的洞察是：长程任务失败的三个根源（上下文耗尽、中断重来、规模不可控）没有一个是模型推理能力问题，全部是**状态管理**问题。上下文压缩导致的信息逐层流失、"上下文焦虑"导致的提前收尾、跨会话记忆缺失导致的从零重启，本质上都是 Agent 的执行状态只存在于易失的对话上下文中。File As Progress 的设计把状态锚定到磁盘文件，等于把 Agent 从"靠记忆工作"改造成"靠账本工作"——恢复逻辑不需要知道之前发生了什么，只需读到当前状态就能推导续传策略。这也是它比 checkpoint/摘要类方案更可靠的原因：文件是确定性的，摘要是概率性的。

### 边界三种实现方式暗含一张依赖分类决策树

任务边界的实现（无依赖直接并行 / 有依赖拓扑排序 / 有冲突物理隔离）实际上构成一个按"任务间关系"分类的决策树：先做文件级依赖分析判断能否并行，再检测写冲突判断是否需要 Git Worktree 隔离。值得注意的细节是冲突的**延迟处理**策略——不在多 Agent 竞态中实时协调，而是等所有子任务跑完、工作区静止后再由 Agent 解冲突。这是因为静止状态下的冲突集合是确定的、不再变化的，Agent 面对的是快照而非移动靶。网状协作（Agent Teams）被明确排在最后选项，因为通信开销和不确定性会随节点数放大。

### CLI 化子任务解决的是 Prompt 的"传话失真"

子任务不嵌套在主 Agent 对话里、而是由外部脚本独立启动，这个设计最容易被低估的价值是**消除转述损耗**。文章给出的实证很典型：主 Agent 收到结构化指令后会"自由发挥"，把文件内容全部内联进 Prompt 而不是让 subagent 自己渐进式读文件，还混入了自己的推断，一旦推断有误审查方向就被带偏。程序化构建 Prompt（build-prompt.js）保证了所有子任务指令结构一致、逐字节确定。这本质上是把 Prompt 从"自然语言口头禅"降级为"编译产物"——主 Agent 只声明意图，指令由脚本生成。同时 CLI 进程化让并发数由 dispatch.js 控制，绕开了模型在对话内调度时"过于谨慎、不敢开高并发"的行为偏差。

### 状态机粒度是成本与恢复精度的权衡，产物存在性是唯一可信判据

状态设计（TODO → ANALYZING → ANALYZED → EXECUTING → …）的每个中间状态都必须对应一个落盘产物，所以"每多一个状态就多一个可精确恢复的断点"的直接代价是维护成本。文章给出的准则是务实的：只在执行时间长、或中间产物明确可复用的环节加状态；10 秒能跑完的任务三状态足够。另一个关键判断是 IN_PROGRESS 残留的甄别——不信任状态字段本身，而是以**产出物的存在性与合法性**（编译通过、JSON 可解析、符合 schema）作为唯一判据。重试分层（内层恢复会话 / 中层带反馈重试 / 外层重新调度）同样以文件状态而非 Agent 文本输出作为切换依据，因为模型自报的"任务完成"不可信，这在"完成的真实性"一节有直接教训。

### meta-skill 是编排经验的自举，边界假设会随模型过期

结尾的 Skill for Skill 思路把编排经验本身沉淀为 meta-skill（long-term-task-orchestration），让 Agent 生产"能反复做这类任务的工具"而非完成一次性任务——这是用 Agent 强化 Agent 的自举结构，与 [Coding Harness Engineering](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/coding-harness-engineering.md) 中 harness 知识资产化的方向一致。同时文章保持了清醒：harness 每个环节都隐含"当前模型做不到"的假设，模型进化后边界会移动，工程职责是定期重新审视"哪些环节该交给模型、哪些留在框架里"这个判断本身。相关长程任务四原则的更细拆解见 [Harness Engineering Long Term Agent Tasks](https://github.com/QianJinGuo/wiki-public/blob/main/entities/harness-engineering-long-term-agent-tasks.md)，3000 行粒度公式的完整推导也在该页；Claude Code 源码层的对应实现可参考 [Claude Code Core Internals](https://github.com/QianJinGuo/wiki-public/blob/main/entities/claude-code-core-internals.md)，上下文流失的机制背景可延伸至 [Context Management Agent Systems](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/context-management-agent-systems.md)。

## 实践启示

1. **用粒度校准代替拍脑袋拆分。** 先估算单子任务的 Token 构成（Prompt 模板 ~1K + 输入文件 10-20 Token/行 + 工作过程 2-3 倍输入），跑几组样本观察消耗是否经常逼近窗口的 80%：逼近则缩粒度，只用 30-40% 则放大粒度减少调度开销。同目录文件尽量同组，共享的 import/类型上下文能显著提升修改准确性。
2. **能用脚本判定的校验绝不交给 Agent。** tsc 编译、构建通过、单测通过这类有客观对错标准的检查用程序化校验（零 Token、结果确定、可无限重复）；只有主观判断（如 review 意见质量）才用独立会话的 Evaluator，且做事与评价的 Agent 必须隔离会话——同会话的历史推理会形成"自我说服"效应，必要时引入跨模型 Evaluator 进一步降低偏见。
3. **区分"硬失败"与"通过但有妥协"。** 把 99% 完成度的产出也 revert 重跑，会让大量文件在 DONE_WITH_WARNINGS 本可合入的状态下反复烧 Token。TS strict 迁移中遗留的少量 `@ts-ignore` 应记录为人工优化清单而非触发重试。只有重试耗尽且产出明显错误才标记 FAILED 回退人工。
4. **调度用随到随补，输出对人和对 Agent 分通道。** 子任务耗时不均匀时按批次等齐会浪费大量坑位空转时间，poll.js 补位策略让每个并发槽位始终有任务在跑；终端给人看的输出只要数字、比例、异常摘要，结构化完整状态写文件供新会话恢复时程序化解析，两者不要混在一起。
5. **把重试上限和停止边界写进编排协议。** 中层带反馈重试限制 2-3 次，耗尽后 revert、清理、标记 FAILED，子任务层面到此为止；外层是否重新 dispatch 需按 FAILED 数量决策——两三个值得重跑一轮，几十个说明规则本身有问题，盲目重跑只是烧 Token。先排查原因再决定，不要把重试当作万能兜底。

## 关联

- 同题异语种孪生页：[Harness Engineering Reliable Long Term Agent](https://github.com/QianJinGuo/wiki-public/blob/main/entities/harness-engineering-reliable-long-term-agent.md)（归并候选，提案卡 #11 批1）

---

