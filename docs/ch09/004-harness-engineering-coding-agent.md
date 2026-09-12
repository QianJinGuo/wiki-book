# Harness Engineering - 让 Coding Agent 可靠完成长程任务

> 📊 Level ⭐ | 5.0KB | `entities/harness-engineering-reliable-long-term-agent.md`

> 本页原内容在 2026-09-07 质量闭环中判定为 **dup-0.85**，已按导航页（MOC）重建；
> 原文备份见 `_archive/hub-rewrite-2026-09-07/harness-engineering-reliable-long-term-agent.md`，一手来源仍见下方 sources。

## 机制与论文
- [Code as Agent Harness 综述](https://github.com/QianJinGuo/wiki-public/blob/main/entities/code-as-agent-harness-survey.md) — 102页综述
- [Agent生产级Harness工程指南](https://github.com/QianJinGuo/wiki-public/blob/main/entities/agent-production-harness-engineering.md) — 四支柱审查框架
- [Agent Memory 架构解析](https://github.com/QianJinGuo/wiki-public/blob/main/entities/agent-memory-architecture-ruofei.md) — memory架构解析
- [Agent Reliability: Context Drift & Tool Calling Hallucination](https://github.com/QianJinGuo/wiki-public/blob/main/entities/agent-reliability-context-drift-tool-hallucination.md) — 漂移与幻觉分层解法
- [Agent Harness 6 种运行模式与 SDB 方法论](https://github.com/QianJinGuo/wiki-public/blob/main/entities/agent-harness-6-runtime-patterns-sdb.md) — SDB边界形式化
- [Prime Agent — 以 RLM + Continual Harness 双抽象为核心的自改进编码 Harness](https://github.com/QianJinGuo/wiki-public/blob/main/entities/prime-agent-self-improving-rlm-agent.md) — RLM+Continual Harness：harness状态可CRUD
- [ICML 2026 Open Reproductions — 大规模 Agent 驱动的论文复现审计](https://github.com/QianJinGuo/wiki-public/blob/main/entities/icml-2026-open-reproductions-agent-audit.md) — 2226篇论文35908个claim的agent复现审计
- [Databricks CEO用3000名程序员真实任务测试GLM 5.2 — Harness选择比模型更重要](https://github.com/QianJinGuo/wiki-public/blob/main/entities/databricks-glm-52-3000-engineer-benchmark-coding-agent.md) — 3000工程师实测
- [SemaPLC：验证门控的 PLC 代码生成 Agent Harness](https://github.com/QianJinGuo/wiki-public/blob/main/entities/semaplc-verification-gated-agent-harness-plc-codegen-2026-08-26.md) — 验证门控PLC代码生成harness

## 工程实践
- ['Harness Engineering：AI 从](../ch05/061-harness-engineering.html) — 六层架构+七大反模式+分级决策树19712字rv9
- [Cursor 复盘 Harness：模型决定能力上限，Harness 决定生产下限](https://github.com/QianJinGuo/wiki-public/blob/main/entities/cursor-复盘-harness模型决定能力上限harness-决定生产下限.md) — Cursor复盘主版
- [DeepSeek Code Harness](091-deepseek-code-harness.html) — DSH 28k主版
- [vivo Agent 系统分析：大模型是大脑不是马，Harness 是 ICU 不是马鞍](https://github.com/QianJinGuo/wiki-public/blob/main/entities/vivo-agent-brain-body-icu-harness-evolutionary-framework-2026.md) — 大脑身体ICU隐喻框架
- [AI-DLC：紫讯落地 AI 原生研发新范式的实践](https://github.com/QianJinGuo/wiki-public/blob/main/entities/ai-dlc-zixun-ai-native-development-lifecycle.md) — AI-DLC四件套
- [FastContext（微软开源 Coding Agent 仓库探索子代理）](https://github.com/QianJinGuo/wiki-public/blob/main/entities/microsoft-fastcontext-coding-agent-explore-subagent-vibecoder.md) — Explore子Agent只读三工具，证据bundle
- [It’s safe to close your laptop now: Hosting coding agents on Amazon Bedrock AgentCore](https://github.com/QianJinGuo/wiki-public/blob/main/entities/bedrock-agentcore-coding-agent-hosting.md) — 远端工作站即服务
- [Coding Agent在百度的落地实践：从反馈闭环到工程范式重构](https://github.com/QianJinGuo/wiki-public/blob/main/entities/baidu-comate-coding-agent-feedback-loop-wanpeng.md) — 双层loop实践
- [Harness Engineering 系统性解读](https://github.com/QianJinGuo/wiki-public/blob/main/entities/harness-engineering-systematic-explainer.md) — 李宏毅课程解读7933字最全版
- [Devin Fusion: 多模型路由 Harness 实现 35% 成本降低](https://github.com/QianJinGuo/wiki-public/blob/main/entities/devin-fusion-multi-model-harness-cognition.md) — Sidekick双agent路由
- [Skill Hell：Agent Skill 工程方法论](https://github.com/QianJinGuo/wiki-public/blob/main/entities/skill-hell-agent-skill-engineering-ruofei.md) — Skill Hell四失效模式治理
- [从Vibe Coding到Harness—— 一套大仓AI工程化实战](https://github.com/QianJinGuo/wiki-public/blob/main/entities/从vibe-coding到harness-一套大仓ai工程化实战.md) — TAB大仓实战2293字版
- [Claude Code 多 Agent Harness 源码拆解：留纸条、抠上下文、抠缓存、捆手脚](https://github.com/QianJinGuo/wiki-public/blob/main/entities/claude-code-multi-agent-harness-source-analysis.md) — 留纸条抠上下文
- [去哪儿 AI Coding 驱动大型核心系统重构 — Harness+Loop+Task 工程化方法论](https://github.com/QianJinGuo/wiki-public/blob/main/entities/qunar-ai-coding-large-core-system-refactor-2026.md) — 15万行重构提效70%：Harness约束+Loop推进
- [AI Native SDLC Playbook：Anthropic 应用 AI 团队的软件开发生命周期重构方法论](https://github.com/QianJinGuo/wiki-public/blob/main/entities/ai-native-sdlc-playbook-anthropic.md) — SDLC六阶段重构

## 关联

- 同题异语种孪生页：[Harness Engineering 让 Coding Agent 可靠完成长程任务 V2](https://github.com/QianJinGuo/wiki-public/blob/main/entities/harness-engineering-让-coding-agent-可靠完成长程任务-v2.md)（归并候选，提案卡 #11 批1）
- 同题异语种孪生页：[Agent架构关键变化Harness正在成为新后端](https://github.com/QianJinGuo/wiki-public/blob/main/entities/agent架构关键变化harness正在成为新后端.md)（归并候选，提案卡 #11 批1）
- 同题异语种孪生页：[Harness Engineering耗时一周我是如何将应用的Ai Coding率提升至90的](https://github.com/QianJinGuo/wiki-public/blob/main/entities/harness-engineering耗时一周我是如何将应用的ai-coding率提升至90的.md)（归并候选，提案卡 #11 批1）

---

