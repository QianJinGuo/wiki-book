# Hermes Agent 记忆系统 vs OpenClaw 记忆观

> 📊 Level ⭐ | 5.0KB

> 本页原内容在 2026-09-07 质量闭环中判定为 **dup-0.8**，已按导航页（MOC）重建；
> 原文备份见 `_archive/hub-rewrite-2026-09-07/hermes-agent-memory-system.md`，一手来源仍见下方 sources。

## 机制与论文
- [AgentScope Java Harness Framework 2.0 — 企业级 Agent 分布式场景的 Harness 实现 (Java 2.0 重大升级)](https://github.com/QianJinGuo/wiki-public/blob/main/entities/agentscope-java-harness-framework-enterprise-distributed.md) — AgentScope Java全版
- [深度拆解 Hermes Agent 记忆系统](https://github.com/QianJinGuo/wiki-public/blob/main/entities/hermes-agent-memory-system-openclaw-comparison.md) — 记忆成本账四层体系15260字rv10最深版
- [Hermes Agent Skill 互优化：SkillEvolver × Darwin × EmbodiSkill 4 轮闭环](https://github.com/QianJinGuo/wiki-public/blob/main/entities/hermes-agent-skill-crossover-optimization.md) — SkillEvolver×Darwin×EmbodiSkill互优化13412字
- [MiroFlow：Deep Research Agent 脚手架 —— 与 Code Agent 的 6 大工程差异](https://github.com/QianJinGuo/wiki-public/blob/main/entities/miroflow-deep-research-agent-harness-mirothinker.md) — Code vs Research Agent 6大工程差异16596字rv10
- [Hermes Agent 深度解析（阿里云/飞樰）](https://github.com/QianJinGuo/wiki-public/blob/main/entities/hermes-agent-deep-dive.md) — 自进化内外双路径+四维工程7934字rv9全版
- Context Window Management Comparison — 四框架对比rv9
- [Agent Harness 上下文管理：工作集视角](https://github.com/QianJinGuo/wiki-public/blob/main/entities/agent-harness-context-management-working-set.md) — 工作集视角上下文管理
- 深度解析 OpenClaw 在 Prompt / Context / Harness 三个维度中的设计哲学与实践 — 三维度源码：23模块拼装+自适应分块+双层Memory
- [Hermes Agent 为什么火了？和 OpenClaw 龙虾比一比](https://github.com/QianJinGuo/wiki-public/blob/main/entities/hermes-agent-vs-openclaw-comparison.md) — 爱马仕vs龙虾：控制面vs成长型定位对比
- [AI Coding Agent 记忆系统](https://github.com/QianJinGuo/wiki-public/blob/main/entities/ai-coding-agent-memory-system.md) — 分层记忆设计
- [HiClaw v1.1.0 — Kubernetes 集群部署与 Hermes Worker 运行时](https://github.com/QianJinGuo/wiki-public/blob/main/entities/hiclaw-v110-k8s-hermes-worker.md) — HiClaw K8s Controller-Reconciler架构分析
- [AI Agent工具数量陷阱——5个边界清楚的工具胜过20个模糊工具](https://github.com/QianJinGuo/wiki-public/blob/main/entities/ai-agent-tool-count-trap.md) — 工具税数据与机制
- [OpenClaw与Hermes源码架构对比](https://github.com/QianJinGuo/wiki-public/blob/main/entities/openclaw-hermes-source-code-agent-architecture-review.md) — 双框架源码对比：OpenClaw四亮点+Hermes四补充
- [Hermes Agent 爱马仕的三级 memory，到底在记什么？](https://github.com/QianJinGuo/wiki-public/blob/main/entities/hermes-agent-three-layer-memory-architecture-one.md) — 三级memory详解7410字，80% consolidation
- [Agent 记忆系统的主矛盾：历史增长 vs 临场上下文调度](https://github.com/QianJinGuo/wiki-public/blob/main/entities/agent-memory-main-contradiction-context-scheduling.md) — 主矛盾框架分析

## 工程实践
- [Claude Code 源码深度解析（13 核心机制）](https://github.com/QianJinGuo/wiki-public/blob/main/entities/claude-code-source-deep-dive-warrior.md) — 13机制rv10
- Claude Code Openclaw Memory Comparison — 记忆系统对比rv9
- [MemOS Hermes 记忆插件](https://github.com/QianJinGuo/wiki-public/blob/main/entities/memos-hermes-plugin.md) — MemOS插件：智能去重+混合检索7225字
- Openclaw Multi Agent Team Practice V2 — 七Agent花园团队：专精胜于全能12180字全版
- [MFS：zilliztech 的 Agent 统一上下文 harness，一套动词打通 20+ 数据源](https://github.com/QianJinGuo/wiki-public/blob/main/entities/zilliztech-mfs-open-tag-claude-tag-shuge-2026.md) — 统一动词文件树寻址
- [Claude Code 从 Demo 到产线 · 企业 Harness 工程化的 8 道关卡（黄佳/咖哥 CSDN）](https://github.com/QianJinGuo/wiki-public/blob/main/entities/claude-code-demo-to-production-8-gates-huang-jia-csdn-2026.md) — 8道关卡清单
- [阿里云 MSE AI 任务调度 + Agent Sandbox：动态休眠/唤醒 OpenClaw Agent 成本下降 90%+](https://github.com/QianJinGuo/wiki-public/blob/main/entities/aliyun-mse-ai-task-scheduling-agent-sandbox-cost-90-percent.md) — 休眠唤醒短条borderline
- [OpenClaw 多租户系列 #7 — 基于 ECS Fargate + Graviton 的轻量级企业 AI Agent 平台 | 亚马逊AWS官方博客](https://github.com/QianJinGuo/wiki-public/blob/main/entities/openclaw-multi-7-ecs-fargate-graviton.md) — ECS变体+双Agent并行+四层隔离
- [淘宝主播 Agent Harness 工程：六元组框架与直播场景八项实战](https://github.com/QianJinGuo/wiki-public/blob/main/entities/taobao-live-anchor-agent-harness-engineering-2026.md) — harness六元组八项实战

## 延伸导航
- [Agent 记忆与上下文系统](https://github.com/QianJinGuo/wiki-public/blob/main/moc/memory-context-systems.md)

---

