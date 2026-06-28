## Ch02.015 深度解析 OpenClaw 在 Prompt / Context / Harness 三个维度中的设计哲学与实践

> 📊 Level ⭐⭐ | 9.2KB | `entities/openclaw-prompt-context-harness.md`

## Prompt Engineering：动态组装与文件驱动
System Prompt由buildAgentSystemPrompt()构建，23个模块按固定顺序搭积木般拼装。三种提示词模式：full（完整）/ minimal（精简）/ none（极简）。六个核心.md文件（AGENTS.md/SOUL.md/IDENTITY.md/USER.md/TOOLS.md/HEARTBEAT.md等）构成Agent的"灵魂"与"骨架"，通过Markdown文件驱动实现配置与代码解耦。

## Context Engineering：扩展、压缩和记忆
- **Skills渐进式披露**：默认只注入名称描述，任务需要时才读取SKILL.md，避免上下文爆炸
- **自适应分块压缩**：BASE_CHUNK_RATIO=0.4，分层摘要三函数（summarizeInStages→summarizeChunks→summarizeWithFallback）
- **修剪策略**：头尾保留中间省略，KV Cache时间窗口优化
- **双层Memory**：MEMORY.md长期记忆（每次对话注入，截断200行）+ memory/日期.md每日笔记（BM25+向量双路召回，时间衰减e^(-λt)）

## Harness Engineering：约束与引导控制
Workflow（主导权在人）vs Harness（主导权在AI）的本质区别。OpenClaw的Harness实践：

- **Hook全生命周期**：before_prompt_build / before_tool_call（参数校验拦截）/ after_tool_call / before_compaction / after_compaction / message_received / message_sending
- **三层安全沙箱**：文件系统沙箱 + 命令执行沙箱（白名单+Ask模式+safeBins）+ 网络访问沙箱
- **防注入/防越权/防泄露/防篡改**：操作系统最小权限兜底
- **人在环路**：高风险操作暂停等待人工确认

## 深度分析
**OpenClaw的三维工程体系为何重要**
Prompt/Context/Harness三层分离本质上是AI工程化的三次关键抽象。第一次抽象在"说"的层面——将Prompt的静态模板升级为动态组装的模块系统；第二次抽象在"看"的层面——通过渐进式披露和分层压缩解决上下文无限膨胀的根本矛盾；第三次抽象在"运行"的层面——用Hook机制和安全沙箱在保持AI自主性的同时建立可控边界。这三次抽象反映了从"如何用好AI"到"如何管好AI"的认知跃迁。
**文件驱动架构的设计哲学**
AGENTS.md/SOUL.md/IDENTITY.md等核心文件将Prompt的"灵魂"与代码解耦，这种做法解决了三个实际问题：1）非工程师也能修改Agent行为；2）同一套代码可以加载不同性格的Agent；3）运行时可以动态切换身份而不重启进程。Markdown作为配置载体的选择体现了"最小化依赖"原则——不需要解析器，不需要数据库，纯文本即可版本控制、diff对比、跨平台同步。
**双层Memory的时间衰减机制**
MEMORY.md长期记忆采用固定截断（200行）而每日笔记采用指数衰减e^(-λt)，这两种策略对应不同的记忆需求。长期记忆需要高可靠性和零干扰（每次对话必须存在），所以用简单粗暴的截断；每日笔记需要优先保留近期内容（低频日常交互），所以用时间衰减让旧记忆自然淡化。这个设计体现了"不同类型信息用不同策略处理"的工程原则。
**Harness的"度"如何把握**
OpenClaw的Hook机制提供了before_prompt_build、before_tool_call、after_tool_call等7个生命周期节点，但并非所有节点都需要强约束。参数校验拦截（before_tool_call）是低风险高收益的典型场景——不阻止AI行动，只确保行动参数有效；而网络访问沙箱则是高风险场景，需要白名单兜底。这种分级策略避免了"过度安全"导致的AI能力瘫痪，也避免了"过度自由"导致的安全事故。

## 实践启示
**1. 构建自己的"积木式Prompt库"**
不追求一个完美的System Prompt，而是将23个模块按职责分离到独立文件。每个模块独立测试、独立版本控制。需要完整能力时全加载，需要轻量执行时只加载核心模块。这种思路比"一个巨大Prompt打天下"更易于维护和调试。
**2. 渐进式披露的上下文管理**
任何长期运行的AI系统都面临上下文膨胀问题。OpenClaw的解法——默认只注入名称描述、任务需要时才读取完整Skill——可以迁移到自己的系统：建立"能力清单+按需加载"的文档机制，而不是把所有文档一股脑塞进上下文。
**3. 设计"人在环路"的触发条件**
不是所有AI操作都需要人工介入。参考OpenClaw的分级策略：低风险操作（读文件、数据查询）直接执行；中风险操作（写文件、修改配置）用Hook做参数校验后执行；高风险操作（网络请求、系统命令）才暂停等待确认。提前定义分级标准，比事后打补丁更有效。
**4. 用文件沙箱替代代码沙箱**
如果你的AI系统需要访问文件系统，不必实现完整的Linux容器隔离。可以学习OpenClaw的"严格限制Workspace访问范围"策略：在应用层定义可访问路径白名单，路径外访问直接拒绝。这比容器方案轻量得多，且足以应对大多数场景。
**5. Hook是调试AI的利器**
before_tool_call阶段的参数校验不仅能防止错误，还能作为"AI行为观察点"。在这个节点记录AI的原始意图（tool name + arguments），可以帮助分析AI的思考路径，定位Prompt或Instruction的歧义点。

## 相关维度深度分析
- **Claude Code Prompt Context Harness**（飞樰）侧重 Claude Code 的 Prompt/Context/Harness 三维度，与本文同作者互补
- **[Claude Code Agent Engineering](ch04-015-claude-code-agent.html)**（SooKool）侧重 StreamingToolExecutor/主循环/压缩/小模型
- **Openclaw Architecture**（800行架构）侧重 Tool/MessageBus/SubagentManager/REPL 主循环，与本文互补
- **[Hermes Agent](ch04-418-hermes-agent.html)** Hermes的Self-Evolving与OpenClaw的Memory机制对照

## 相关实体

- [Agent Harness 上下文管理：工作集视角](ch05-038-agent-harness.html)
- [从 Prompt 到 Harness：最小实操指南](ch01-664-stochastic-parrot-thought-experiment.html)
- [Agent Memory 架构解析](ch04-111-3-0-agent-agent-agent-5-6.html)
- [Claude Code Prompt 提示词体系源码解析](ch03-002-obsidian-claude-code.html)
- [Claude Code vs OpenClaw 记忆系统 — 向量数据库必要性反思](ch01-342-读完-claude-code-和-openclaw-的-memory-源码-我对-agent记忆需要向量数据库-这件.html)
- [From Agent Protocol to Harness Skill](ch04-351-from-agent-protocol-to-harness-skill.html)
- [Agent Harness 架构](ch04-207-agentcore-managed-harness.html)
- [Agent 自我改进的六条路](ch04-047-agent-自我改进的六条路.html)
- [Agent Memory System 设计指南](ch04-087-boris-cherny-ide-agent.html)
- [SkillClaw](ch04-312-agent-moltbook.html)
- [Skill 系统：Agent 如何把经验沉淀成可复用能力](ch04-135-agent-evolution-four-stages-and-six-dimensions-alibaba-clo.html)
- [Agent架构关键变化：Harness正在成为新后端](ch04-027-secure-ai-agents-with-policy-and-lambda-interceptors-in-amaz.html)
→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/openclaw-prompt-context-harness.md)

- [Thin Harness Fat Skills](ch05-063-ai-forgetrain-megatron.html)
- [Hermes Agent 记忆系统深度拆解](ch04-068-hermes-agent-记忆系统深度拆解.html)
- [Claude Code 架构深度解析](ch01-846-claude-code-agent-harness.html)
- [AgentCore Managed Harness](ch04-206-agentcore-managed-harness.html)
- [从 30 分钟手搓 Agent，到 Harness 成为"新后端"](ch04-254-从-30-分钟手搓-agent-到-harness-成为-新后端.html)
- [harness-engineering-systematic-explainer](ch05-036-harness-engineering-systematic-explainer.html)
- [claude-code-7-layer-memory-architecture](ch01-857-claude-code-7-layer-memory-architecture.html)
- [AI Agent 工程师能力地图](ch04-139-apache-rocketmq-5-5-0-litetopic-ai-agent.html)
- [阿里云端到端业务需求专家 agent：multica 平台 + superai-* 技能集群 + tdd/pre-pus](ch04-033-anthropic-agent-12-mcp.html)
- [fanling company as agent ai org reflection v2](ch04-180-codex-goal-agent.html)

---
