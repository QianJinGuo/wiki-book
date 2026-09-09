# Agent 上下文窗口管理对比

> 📊 Level ⭐ | 5.1KB | `entities/context-window-management.md`

# Agent 上下文窗口管理对比

> 本页原内容在 2026-09-07 质量闭环中判定为 **dup-0.8**，已按导航页（MOC）重建；
> 原文备份见 `_archive/hub-rewrite-2026-09-07/context-window-management.md`，一手来源仍见下方 sources。

## 机制与论文
- [Harness 到底是什么？看看 OpenClaw、Hermes、Claude Code 的演绎吧](https://github.com/QianJinGuo/wiki-public/blob/main/entities/harness-engineering-7-layers-openclaw-hermes-claude-code-p1anu.md) — 三框架演绎七层模型12857字rv9
- [AI Agent 架构设计（七）：Skills 系统设计（OpenClaw、Claude Code、Hermes Agent 对比）](https://github.com/QianJinGuo/wiki-public/blob/main/entities/skill-system-design-three-way-comparison.md) — 三框架skill系统设计对比
- [Context Window Management Comparison](https://github.com/QianJinGuo/wiki-public/blob/main/entities/context-window-management-comparison.md) — 四框架对比rv9
- [800行代码实现 Open Claw 的 Tool、消息总线、子Agent管理架构](https://github.com/QianJinGuo/wiki-public/blob/main/entities/open-claw-tool-bus-subagent-architecture.md) — 薄抽象显式控制流8802字rv9全版
- [TencentDB Agent Memory：符号化短期记忆+分层式长期记忆](https://github.com/QianJinGuo/wiki-public/blob/main/entities/tencentdb-agent-memory-hierarchical.md) — 8661字最全分层记忆版
- [深度解析 OpenClaw 在 Prompt / Context / Harness 三个维度中的设计哲学与实践](https://github.com/QianJinGuo/wiki-public/blob/main/entities/openclaw-prompt-context-harness.md) — 三维度源码：23模块拼装+自适应分块+双层Memory
- [How AI Agent Memory Works](114-how-ai-agent-memory-works.html) — 记忆五层+六架构权衡科普
- [Hermes Agent 为什么火了？和 OpenClaw 龙虾比一比](https://github.com/QianJinGuo/wiki-public/blob/main/entities/hermes-agent-vs-openclaw-comparison.md) — 爱马仕vs龙虾：控制面vs成长型定位对比
- [Agent 记忆架构：先别急着把 Memory 当数据库](https://github.com/QianJinGuo/wiki-public/blob/main/entities/agent-memory-architecture-past-influence-future-ruofei.md) — 记忆影响未来的治理
- [OpenClaw 与 Claude Code 的 Agent Loop 设计范式](https://github.com/QianJinGuo/wiki-public/blob/main/entities/openclaw-agent-loop-design-patterns.md) — 五级跃迁史+循环管控三硬约束5696字全版
- [AgentMemory 源码分析：给 Coding Agent 装上本地长期记忆](https://github.com/QianJinGuo/wiki-public/blob/main/entities/agentmemory-source-analysis-coding-agent-local-memory.md) — 源码级解析互补
- [800行代码实现 Open Claw 的 Tool、消息总线、子Agent管理架构](https://github.com/QianJinGuo/wiki-public/blob/main/entities/800行代码实现-open-claw-的-tool消息总线子agent管理架构.md) — agent核心组件实现
- [Claude Code 七层记忆架构](https://github.com/QianJinGuo/wiki-public/blob/main/entities/claude-code-7-layer-memory-architecture.md) — 七层防御金字塔
- [Claude Code and What Comes Next](../ch01/255-claude-code-and-what-comes-next.html) — 压缩/Skills/Subagents
- [OpenClaw与Hermes源码架构对比](https://github.com/QianJinGuo/wiki-public/blob/main/entities/openclaw-hermes-source-code-agent-architecture-review.md) — 双框架源码对比：OpenClaw四亮点+Hermes四补充

## 工程实践
- [Claude Code Openclaw Memory Comparison](https://github.com/QianJinGuo/wiki-public/blob/main/entities/claude-code-openclaw-memory-comparison.md) — 记忆系统对比rv9
- [Claude Code Prompt 提示词体系源码解析](https://github.com/QianJinGuo/wiki-public/blob/main/entities/claude-code-prompt-source-analysis.md) — 六大prompt模块全版
- [MemOS Hermes 记忆插件](https://github.com/QianJinGuo/wiki-public/blob/main/entities/memos-hermes-plugin.md) — MemOS插件：智能去重+混合检索7225字
- [扣子 3.0 多 Agent 协同实战：指挥所有 Agent 的 Agent + 5 人团队 6 步流水线](https://github.com/QianJinGuo/wiki-public/blob/main/entities/coze-3-multimagent-team-orchestration-wangheige.md) — 三案例实战报告
- [Claude Code Openclaw Usage Ettin](../ch09/105-claude-code-openclaw-usage-ettin.html) — Ettin rerank集成
- [Claude Code Agent Memory Systems — L0~L3 四层记忆方案](https://github.com/QianJinGuo/wiki-public/blob/main/entities/claude-code-agent-memory-four-levels-analysis.md) — L0-L3演化
- [IMClaw：通过微信/飞书操控ClaudeCode/Codex/GeminiCLI/Pi Agent蜂群](https://github.com/QianJinGuo/wiki-public/blob/main/entities/imclaw通过微信飞书操控claude-code-coodex-gemini-clipi-agent蜂群.md) — ACP协议N+M解耦+网关架构6224字全版
- [阿里云 MSE AI 任务调度 + Agent Sandbox：动态休眠/唤醒 OpenClaw Agent 成本下降 90%+](https://github.com/QianJinGuo/wiki-public/blob/main/entities/aliyun-mse-ai-task-scheduling-agent-sandbox-cost-90-percent.md) — 休眠唤醒短条borderline
- [Harness 工程 14 步路线图：从单 Agent 到自改进系统](https://github.com/QianJinGuo/wiki-public/blob/main/entities/harness-engineering-14-step-roadmap.md) — 三层楼模型14步渐进构建

## 延伸导航
- [Claude Code 生态完全指南](https://github.com/QianJinGuo/wiki-public/blob/main/moc/claude-code-complete-guide.md)
- [OpenClaw 的架构设计为什么值得研究？它与 Hermes/Claude Code 的核心差异？](https://github.com/QianJinGuo/wiki-public/blob/main/moc/openclaw-architecture.md)
- [Agent Memory 架构选择的关键决策点是什么？](https://github.com/QianJinGuo/wiki-public/blob/main/moc/agent-memory-architecture-decision-points.md)

---

