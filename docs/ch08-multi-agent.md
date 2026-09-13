# Ch08 多 Agent 协作

> 从单兵到团队：编排、通信、治理

> 本章收录 **26 篇**实体，按深度递增排列。

---

## 本章导航

| Level | 含义 | 篇数 |
|-------|------|------|
| ⭐ 入门 | 零基础可读 | 4 |
| ⭐⭐ 工程师 | 需编程基础 | 2 |
| ⭐⭐⭐ 专家 | 需ML基础 | 9 |
| ⭐⭐⭐⭐ 科学家 | 需研究背景 | 9 |
| ⭐⭐⭐⭐⭐ 大师 | 前沿/哲学 | 2 |

---

## 导读

一个 Agent 能完成简单任务，但复杂任务需要团队。

本章探讨多 Agent 协作的核心问题：如何编排（谁先做、谁后做、谁并行）、如何通信（共享上下文 vs 消息传递）、如何治理（冲突解决、权限控制、审计追踪）。

你会看到 Claude Code 的 Subagent 如何避免上下文污染，OpenClaw 的多 Agent 团队搭建经验，以及阿里云 AgentRun 的 A2A 开放协议。

多 Agent 不是"把任务分给多个 Agent"那么简单——通信开销、状态同步、故障传播，每一个都是工程挑战。

---



---

## 本章内容

### ⭐ 入门（4 篇）

- [001. 龙虾装上了，可以用来干啥？分享下我的 OpenClaw 多智能体团队搭建经验！](ch08/001-openclaw)
- [002. 构建基于多智能体架构的深度思考交易系统](ch08/002-page-002)
- [003. Multi-Agent AI Safety Research Funding Call（DeepMind 主导，1000 万美元，四大方向）](ch08/003-multi-agent-ai-safety-research-funding-call-deepmind-1000)
- [004. OpenClaw 多智能体团队搭建实战经验](ch08/004-openclaw)

### ⭐⭐ 工程师（2 篇）

- [005. Graph Engineering：从单循环到多节点编排](ch08/005-graph-engineering)
- [006. 微软 Agent Framework 全栈指南（Python）](ch08/006-agent-framework-python)

### ⭐⭐⭐ 专家（9 篇）

- [007. 从多智能体编排到AI自主决策：资损防控体系的架构演进](ch08/007-ai)
- [008. Scalable voice agent design with Amazon Nova Sonic: multi-agent, tools, and session segmentation](ch08/008-scalable-voice-agent-design-with-amazon-nova-sonic-multi-ag)
- [009. Thousand Token Wood v2: Multi-Model Heterogeneous Agent Council](ch08/009-thousand-token-wood-v2-multi-model-heterogeneous-agent-coun)
- [010. 多智能体上下文隔离机制](ch08/010-page-010)
- [011. 对抗式验证：多 Agent 交叉校验设计哲学](ch08/011-agent)
- [012. Cost of Consensus](ch08/012-cost-of-consensus)
- [013. 这篇52页综述把AI做科研这件事，明明白白划成了L0到L4五个等级](ch08/013-52-ai-l0-l4)
- [014. Routa 多智能体协同交付平台](ch08/014-routa)
- [015. Nature丨Google和FutureHouse同日登刊，把AI科学助理推到科研前线](ch08/015-nature-google-futurehouse-ai)

### ⭐⭐⭐⭐ 科学家（9 篇）

- [016. JiuwenSwarm — Coordination Engineering 多智能体协作框架（含 SwarmFlow 可控编排 + Jiuwen Symphony 技能编排与分发）](ch08/016-jiuwenswarm-coordination-engineering-swarmflow-jiu)
- [017. AI Agent Memory Systems](ch08/017-ai-agent-memory-systems)
- [018. How Grab is Using AI Agents to Boost Team Productivity](ch08/018-how-grab-is-using-ai-agents-to-boost-team-productivity)
- [019. Factory Missions](ch08/019-factory-missions)
- [020. Oz Multi-Harness Cloud Agent Orchestration (Warp)](ch08/020-oz-multi-harness-cloud-agent-orchestration-warp)
- [021. 扣子 3.0 协作系统：项目化 + Agent 编排 + 工具链打通](ch08/021-3-0-agent)
- [022. AgentRun：阿里云多 Agent 生产级协作方案（A2A 开放协议）](ch08/022-agentrun-agent-a2a)
- [023. Orchestrating Self-Evolving Agents with CrewAI and NVIDIA NemoClaw](ch08/023-orchestrating-self-evolving-agents-with-crewai-and-nvidia-ne)
- [024. AP2 协议实测：Mandate 机制、Task 状态机与多 Agent 支付](ch08/024-ap2-mandate-task-agent)

### ⭐⭐⭐⭐⭐ 大师（2 篇）

- [025. Claude Code Dynamic Workflows 多Agent编排](ch08/025-claude-code-dynamic-workflows-agent)
- [026. 古法程序员复杂任务 Spec 写作：多 Agent 编排 + Skill 三层架构 + Gate 四态](ch08/026-spec-agent-skill-gate)


---

## 本章收束

多 Agent 的难点从来不是"多开几个"，而是通信与状态：谁看到什么、谁对什么负责、冲突了听谁的。这一章的案例反复证明——上下文隔离做得好的小团队，胜过共享一个爆炸上下文的大团队。编排是架构问题，不是数量问题。

---
