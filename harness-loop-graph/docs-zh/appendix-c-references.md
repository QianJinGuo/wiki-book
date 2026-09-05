---
title: "附录 C 参考文献"
---

# 附录 C 参考文献

本书的引用分两类：**库内笔记**（Hermes Wiki 知识库 ~/wiki 中的实体/概念/对比/问题页，它们各自再引用原始外部出处）与**公开文献**（论文、官方博客、公开报告）。转引约定：标注"经库内笔记转引"的数据，请以库内笔记所载原始出处为最终依据；库内笔记路径可在 Hermes Wiki 中检索。

## C1 核心库内笔记（按主题）

**Harness 工程**

- `entities/harness-engineering` —— 范式主实体：Agent = Model + Harness；三代范式；六层架构；七反模式；5 制品/3 阵营/5 共识原则；Harness 衰减与 Build to Delete；主权线；Can.ac、$9/$200 等量化数据；八条来源线索（含阿里云多智能体实践、若飞新规）
- `concepts/harness-engineering-framework` —— 框架页：六层结构、上下文五层、Generator-Evaluator、压缩 vs 重置
- `topics/agent-harness-deep-dive-qa` —— 五层架构（L1–L5）、工具-层级映射矩阵、Loop 六原语、生产实录、未解问题
- `queries/harness-minimum-checklist` —— MVH A/B 面、工具 token 账、瓶颈三问、保质期表、迁移检查表
- `concepts/when-not-to-harness-engineering` —— 反方四边界条件、上 Harness 前四问、NomShub 逃逸链
- `comparisons/model-capability-vs-harness-engineering` —— 正反方对抗、分层时序裁决、三可判定预测
- `comparisons/context-vs-harness`（见 `entities/harness-engineering` 第 6 来源） —— 症状诊断对照表

**Loop 工程**

- `moc/loop-engineering` —— 主题地图：10 条核心论点、五阶段循环、Loop≠Cron、成本结构
- `entities/loop-engineering-feedback-control-system` —— 主实体：闭环四件套、六组件、单智能体 vs Fleet、Samuel McDonnell 批评、Bun 案例、控制论映射
- `comparisons/prompt-engineering-vs-context-engineering`、`comparisons/vibe-coding-vs-agentic-engineering` —— 范式对照

**Graph 工程**

- `entities/langgraph-state-machine-under-the-hood` —— 状态机三要素、Reducer、compile、扇出/扇入、stream
- `comparisons/orchestrator-worker-vs-dag-agent`、`comparisons/single-agent-vs-multi-agent` —— 拓扑与迁移判据
- `topics/multi-agent-systems` —— 协作模式谱系、JSONL Inbox、摘要回传、Pass@k/Pass^k

**记忆与上下文**

- `topics/agent-memory-systems` —— 记忆类型、四建模对象、三路检索、生命周期治理
- `queries/why-agent-poc-fails-production` —— 六失败类别、十项清单、81% 审查开销数据、腾讯知识分层

**范式与史论**

- `drafts/karpathy-2026-vibe-to-agentic-engineering` —— 184 篇横切：vibe→agentic 演化、L1–L6、animals vs ghosts、行业回声
- `entities/vibe-coding-god-object-7months-failure`、`entities/tencent-vibe-coding-to-agentic-engineering-backend` —— 翻车案例与团队复盘

## C2 公开文献

**论文**

- Vaswani et al., *Attention Is All You Need*. NeurIPS 2017. arXiv:1706.03762
- Yao et al., *ReAct: Synergizing Reasoning and Acting in Language Models*. ICLR 2023. arXiv:2210.03629
- Wei et al., *Chain-of-Thought Prompting Elicits Reasoning in Large Language Models*. NeurIPS 2022. arXiv:2201.11903
- Shinn et al., *Reflexion: Language Agents with Verbal Reinforcement Learning*. 2023. arXiv:2303.11366
- Liu et al., *Lost in the Middle: How Language Models Use Long Contexts*. TACL 2024. arXiv:2307.03172
- Stanford / UC Berkeley / NVIDIA, *LLM-as-a-Verifier*. 2026（Terminal-Bench 2.0 数据；经 `drafts/karpathy-2026-vibe-to-agentic-engineering` 转引）
- METR, *Measuring the Impact of Early-2025 AI on Experienced Open-Source Developer Productivity*. 2025

**工程博客与官方文档**

- Anthropic, *Effective Harnesses for Long-Running Agents*. 2025-11
- Anthropic, *When AI builds itself*. 2026-06
- Anthropic, MCP（Model Context Protocol）发布与文档. 2024-11 起
- OpenAI (Ryan Lopopolo), *Harness engineering: leveraging Codex in an agent-first world*. 2026-02
- Mitchell Hashimoto, *My AI Adoption Journey*. 2026-02
- Ben Thompson, *Agents Over Bubbles*. Stratechery. 2026-03
- Stripe Engineering (Alistair Gray), *Minions: Stripe's one-shot, end-to-end coding agents*. 2026-02
- LangChain (Vivek Trivedy), *Improving Deep Agents with harness engineering*. 2026-02
- Birgitta Böckeler (Martin Fowler 站点), *Harness Engineering*. 2026-02
- Can.ac, *I Improved 15 LLMs at Coding in One Afternoon. Only the Harness Changed.* 2026-02
- GitHub Blog, *How to write a great AGENTS.md: lessons from over 2,500 repositories*
- Addy Osmani, *Loop Engineering*（六原语框架）. 2026
- Google, A2A（Agent2Agent Protocol）. 2025-04（后捐入 Linux Foundation）
- LangGraph 官方文档（StateGraph / Reducer / Checkpointer）
- LinearB 年度工程效能报告（AI PR 被拒率数据）. 2025

## C3 引用与时效声明

1. 书中所有量化数据均在相应章节标注来源；不同来源对同一现象的数字可能不同（测量口径差异），本书优先采用库内笔记明确记载的数值并注明出处。
2. Harness/Loop/Graph 领域演进极快：工具能力与数据截至 2026 年中。本书随知识库每日 check & eval 流程持续修订。
3. 对存在正反方争议的命题（模型能力 vs Harness 工程），本书同时呈现双方证据与裁决框架（第 2、13 章），不以单一立场作结论。
4. 发现错误请在本仓库提 issue；勘误进入下一版并在对应章节标注。
