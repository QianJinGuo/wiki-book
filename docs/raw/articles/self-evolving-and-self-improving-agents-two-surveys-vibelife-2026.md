---
source_url: https://mp.weixin.qq.com/s/Qfez4p6089zBp1GyjCYlRQ
tags: [article]
ingested: 2026-08-14
sha256: d65f8d51b052937c591e718c0b92bc97388c39a4b20989eec7530a1f31f0705a
---
来源 | vibe life（独立公众号综述档）

# 自演化与自改进智能体 · 两篇综述合集

本文收录两篇互为补充的智能体「自改进 / 自演化」综述的详细笔记。第一篇 Fang, Peng, Zhang et al. (2025)《A Comprehensive Survey of Self-Evolving AI Agents》以「统一反馈环（System Inputs / Agent System / Environment / Optimiser）」为骨架，覆盖单 agent / 多 agent / 领域专用三类优化；第二篇 Gao et al. (2026)《Self-Improvements in Modern Agentic Systems: A Survey》以「𝒜=(θ,Σ) 双路径」为骨架，把自改进拆成参数改进（改 θ）与脚手架改进（改 Σ）两条路。

> 注：第二篇 Gao et al. 综述原文已在库（raw/articles/self-improvements-modern-agentic-systems-survey-arxiv-2607-13104，含实体），本文仅对第一篇 Fang et al. 部分完整记录。

## 第一篇 · A Comprehensive Survey of Self-Evolving AI Agents（Fang, Peng, Zhang et al., 2025）

把"自演化 AI agent"作为衔接 foundation model 与 lifelong agentic system 的新范式，用一个统一反馈环框架系统综述单 agent / 多 agent / 领域专用三类进化与优化技术。

### 核心贡献

- 形式化 Self-Evolving AI Agents 的「三定律」(Endure / Excel / Evolve)
- 勾勒 LLM 中心学习范式从 MOP→MOA→MAO→MASE 的演进
- 提出统一的概念框架，抽象出自演化反馈环（System Inputs / Agent System / Environment / Optimisers）
- 系统综述单 agent、多 agent、领域专用三类自演化与优化技术
- 全面梳理评测、安全与伦理考量，指出关键开放挑战与未来研究方向

### 四范式演进（MOP→MOA→MAO→MASE）

| 范式 | 是否改参数 | 反馈 / 交互来源 | 单 / 多 agent | 人工配置程度 |
|------|------|------|------|------|
| MOP（离线预训练） | 否（冻结部署） | 静态语料预训练 | 单 | 全静态，人工设定后不再动 |
| MOA（在线适应） | 是（SFT / LoRA / RLHF） | 标注 / 评分 / 指令 | 单 | 部署后可更新，但仍人工触发 |
| MAO（多 agent 编排） | 否（不改参数） | agent 间消息 / 辩论 | 多 | 手工 workflow、固定协议、人工工具链 |
| MASE（多 agent 自演化） | 否（自精炼 prompt / memory / tool / 拓扑） | 环境反馈 + meta-reward | 多群体 | 自演化，人工配置最少 |

四个范式不是并列而是一条每一跳都有驱动力的演进链：MOP 的静态性 → MOA 用 SFT/LoRA/RLHF 更新模型本身；MOA 的单模型能力不足 → MAO 用多 agent 通信协作（不改参数）；MAO 的手工 workflow 固定协议成为瓶颈 → MASE 让 agent 群体据环境反馈与 meta-reward 持续自我精炼。

### 三定律（Three Laws of Self-Evolving AI Agents）

受 Asimov 机器人三定律启发，自演化的三条约束定律（后者以前者为前提）：

| 定律 | 目标 | 约束对象 | 优先级 |
|------|------|------|------|
| I. Endure（安全适应） | 任何修改中都保持安全与稳定 | 安全性、稳定性 | 最高，是前置条件 |
| II. Excel（性能保持） | 保留或提升既有任务性能 | 任务性能 | 次之，以 I 为前提 |
| III. Evolve（自主演化） | 自主优化内部组件以应对变化 | 组件、结构 | 再次，以 I、II 为前提 |

关键在读优先级列：Excel 服从 Endure，Evolve 服从前两者，安全永远最高。

### 统一反馈环（Self-Evolving Process 四组件闭环）

一轮迭代按以下顺序流动：**System Inputs** 给定任务设定（任务级或实例级）→ **Agent System**（单或多 agent）在 **Environment** 中执行任务 → **Environment** 据评测指标给出反馈信号 → **Optimiser** 在搜索空间 𝒮 上用算法 ℋ 更新 𝒜（改参数 / 改 prompt / 改结构）；必要时合成新训练样本反哺 Inputs。更新后的 𝒜 重新部署进入下一轮，直到达到性能阈值或收敛。

Optimiser 目标公式：𝒜*=argmax𝒜∈𝒮 𝒪(𝒜; ℐ)——在搜索空间 S 中找让评测函数 O(A; I) 最大的 agent 配置 A*。

- **System Inputs 两粒度**：任务级（{τ, 𝒟train}，提升整个任务整体性能，缺标注数据时用 LLM 合成替代训练集）；实例级（{(x,y), 𝒞} 输入输出对+可选上下文，提升单样本性能）
- **Agent Systems 优化范围**：单组件（只动 LLM / prompt / tool 之一）vs 多组件联合（LLM+prompt；prompt+拓扑——unified 一脉动机）
- **Environment 反馈两来源**：任务评测指标（有 ground-truth 或可执行验证，如编译器+测试用例）；LLM evaluator（无 ground-truth 时代理指标或文本反馈）
- **Optimisers 七类算法**：启发式 / 梯度 / BO / MCTS / RL / 进化 / 学习策略

### 多 Agent 系统组织（架构 + 通信）

**三种 MAS 架构**：Hierarchical（层级，静态层级线性/树，模块化易开发但固定拓扑适应性差）；Centralised（中心 manager-follower，全局规划+具体执行兼顾，但中心节点瓶颈单点故障）；Decentralised（去中心对等分布式，无单点故障鲁棒，但信息同步/安全/协作成本高）。

**四类标准化通信协议**：A2A（水平 peer-to-peer 任务委派，结构化委派执行对调用方不透明）；ANP（水平去中心化"agent internet"，内置 DID+动态协议协商）；MCP（垂直 agent↔外部工具/数据，统一 client-server 接口）；Agora（水平元协议，动态协商自然语言与结构化之间切换）。

### 单 Agent 优化（按目标组件分四类）

1. **LLM 行为优化**：训练式（SFT 标注推理轨迹：STaR/NExT/Deepseek-Prover；RL 偏好对/可验证奖励：DPO/Absolute Zero/DeepSeek-R1 GRPO/R-Zero）vs 测试式（外部 verifier 反馈 refine：CodeT/LEVER/Baldur；多候选+verifier 搜索：CoT-SC/Tree-of-Thoughts/Graph-of-Thoughts）
2. **Prompt 优化四族**：Edit-based（局部编辑：GRIPS/TEMPERA）/ Generative（LLM 整体重写：ORPO/PromptAgent/MIPRO）/ Text-gradient（文本梯度反向更新：ProTeGi/TextGrad）/ Evolutionary（变异交叉选择：EvoPrompt/Promptbreeder）
3. **记忆优化两类**：短期（管理有限上下文保持局部连贯：Reflexion/MemoryBank/MoT）；长期（跨会话持久检索：MemGPT/HippoRAG/A-MEM/Mem0）
4. **工具优化三方向**：训练式（SFT/RL 教模型何时用怎么用：ToolLLM/ReTool/Tool-N1）；推理式（重构文档或树搜索选工具：EASYTOOL/ToolChain/Tool-Planner）；功能优化（修改或创造工具本身：CREATOR/LATM/CRAFT——让 agent 自造工具）

### 多 Agent 优化（四条优化维度）

- **手动设计三种基线 workflow**：Parallel（并发+投票聚合，吞吐扩展好但协调成本指数增长）；Hierarchical（多层自上而下，适合深度研究/代码生成但固定拓扑）；Debate（对抗-协商-仲裁，平衡准确性与可解释性但实现维护成本高）——共性拓扑固定，正是自演化要松开的
- **prompt 维度**：优化 agent 指令/角色/团队配置（AutoAgents、DSPy）
- **topology 维度**：优化 agent 间连接/通信结构（AFlow MCTS 引导、GPTSwarm RL 连续边概率、AgentPrune 低秩图掩码剪枝以 token 经济为目标）
- **unified 维度**：prompt+topology(+tool) 联合（ADAS Python 代码统一表示、EvoAgent 进化文本设置、MASS 三阶段条件耦合、MaAS agent 超网控制器+MC+文本梯度查询级采样推理成本大降）
- **backbone 维度**：优化底层 LLM 参数——Reasoning-oriented（Sirius/MALT/MaPoRL/MARFT 用多 agent 协作轨迹做 SFT/DPO/RL）vs collaboration-oriented（COPPER/OPTIMA 直接训"会不会协作"，OPTIMA 报告 2.8× 性能、token 成本不到 10%）

### 领域专用优化（六子任务）

- 生物医学：医疗诊断（MDAgents/MedAgent-Pro/MedAgentSim，多轮问诊+多模态证据）；分子发现（CACTUS/ChemAgent/DrugAgent，化学符号推理+RDKit+可证性）
- 编程：代码精炼（Self-Refine/CodeAgent/OpenHands）；代码调试（Self-Debugging/PyCapsule/FixAgent，运行时反馈+模块化角色）
- 金融与法律：金融决策（FinCon/PEER/FinRobot，动态市场+合规）；法律推理（LawLuo/AgentCourt/LegalGPT，规则锚定+判例）

### 评测三线

- **benchmark-based**：五类能力——工具/API（ToolBench/API-Bank/GTA/AppWorld）、Web 导航（WebArena/VisualWebArena）、多 agent 协作与通才（GAIA/AgentBench/MultiAgentBench/SwarmBench）、GUI 与多模态（OSWorld/AndroidWorld）、领域任务（SWE-bench 编程/AgentClinic/MMedAgent 医学）
- **LLM-based**：LLM-as-Judge（pointwise/pairwise 只评最终输出）vs Agent-as-Judge（评整条推理轨迹而非只看输出）
- **safety**：AgentHarm/RedCode/MACHIAVELLI/SafeLawBench（恶意顺从/权力寻租/法律对齐）；共同短板：多数评测是快照式的，对 MASE 持续演化系统需要纵向、演化感知评测

### 七挑战与五未来方向

**七挑战（按三定律归组）**：Endure——安全/监管/对齐（优化优先任务指标忽视安全）、奖励建模与优化不稳定（中间步骤奖励数据稀缺）；Excel——科学/领域场景评测（缺乏可靠 ground-truth）、MAS 效率—效果平衡（大规模算力/延迟/不稳定）、prompt/拓扑可迁移性（对 backbone 脆弱）；Evolve——多模态/空间环境优化（多数算法仅文本）、工具使用与创造（多假定固定工具集）

**五未来方向**：全自主自演化的仿真环境（MASE，工具共创/多模态开放交互式仿真平台）；推进工具使用与创造（MAO→MASE，自适应选择/组合/创造工具+RL+评测管线）；真实世界评测与基准（跨 stage 评测快照化）；MAS 效率—效果权衡（MAO，联合建模性能与资源约束）；面向科学的领域感知演化（MASE，异构知识源+定制评测+合规）

## 第二篇 · Self-Improvements in Modern Agentic Systems: A Survey（Gao et al., 2026）

> 该综述原文已在库（raw/articles/self-improvements-modern-agentic-systems-survey-arxiv-2607-13104 + entity），此处仅记 vibe life 笔记特有的要点摘要，不重复入库。

核心框架：智能体 𝒜=(θ,Σ)，Σt := (pt, mt, 𝒯t, gt)（prompt / 记忆 / 工具 / 控制逻辑）。自改进=自诱导更新算子 𝒰（执行相 ℰ 产出信号 + 更新相 𝒰 提交持久改动）。两条路径：Foundation Model Improvement（改 θ，三类信号：内在生成式示范 𝒟t / 内在评估反馈 et / 外在探索经验 τt）与 Scaffolding Improvement（改 Σ，四类组件：prompt p / memory m / tool 𝒯 / full scaffolding）。历史根源追溯至经典 AI（最小二乘→符号启发式 EURISKO→连接主义元学习 Schmidhuber/Gödel Machine→形式化 Orseau&Ring→可扩展 FM）；skill=算子 𝒰 的可复用实例（meta-level skill 作用于智能体自身配置，恢复自指环）。关键洞见：θ 更新落在经典框架内（RL/online/active learning），Σ 更新重塑决策过程本身（动态改变有效状态-动作空间，经典框架无对应物的结构元学习）；自改进须防 evaluator-policy 耦合（critic 是攻击面）、参数固化是有损压缩、分层门控保安全（Vingean reflection 难题）。
