# Agent Evolution: Four Stages and Six Dimensions (Alibaba Cloud)

## Ch04.135 Agent Evolution: Four Stages and Six Dimensions (Alibaba Cloud)

> 📊 Level ⭐⭐ | 13.5KB | `entities/agent-evolution-four-stages-six-dimensions-aliyun.md`

# Agent Evolution: Four Stages and Six Dimensions (Alibaba Cloud)

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/agent-evolution-four-stages-six-dimensions-aliyun.md)

## 摘要

阿里云技术实践文章对 2023–2026 年 Agent 演化进行结构化梳理：**四阶段范式演进**（被动式 ReAct → 工作流 Agent → 自主 Agent → 自进化 Agent）与**六维技术概念演变**（Prompt / Planning / Memory / Tools / Workflow / Environment）。核心观点："形未变，神已变"——经典模块组合未变，但每个模块的运行逻辑发生了内核级重构。

## 核心要点

- 四阶段是**并存且互补**的，不是替代关系；不同阶段适合不同业务复杂度与稳定性要求
- 六个技术维度的演化**同时发生**：Prompt 解耦、Planning 长程化、Memory 文件系统化、Tools CLI 原生化、Workflow Skill 封装、Environment Runtime 化
- 核心思想：**通过工程化手段构建确定性，以承载模型的不确定性**
- 营销号转载早期内容导致学习者出现"穿越感"，需建立时间线认知避免混用
- "为升级而升级"和"盲目追新"是常见的选型误区

## 深度分析

### 四阶段范式演进

**阶段一：早期 Agent（被动式 ReAct，2023）**
基于 Lilian Weng《LLM Powered Autonomous Agents》定义的 LLM + Planning + Tools + Memory 架构，本质是"被动式响应"。ReAct（Reasoning + Acting）"Reasoning → Observe → Response"单步链条，受限于基础模型，能稳定做 3 轮以上 Reasoning 的不多。代表项目：AgentGPT、AutoGen、MetaGPT。

**阶段二：工作流 Agent（结构化与可控性，2024）**
to B 业务对稳定性要求推动 Agentic Workflow 主流化。核心理念是用工程化约束弥补模型不确定性——LangGraph、Dify 等提供 Workflow 编排。本质是"早期 Harness"——虽然当时无此概念，但做法一致。Workflow Agent 牺牲灵活性换取极高可控性和可解释性，对非长尾、非极度复杂场景仍是性价比最高的方案。

**阶段三：自主 Agent（复杂规划与长程任务，2025）**
Manus 通用 Agent 火爆 + Claude Code / Codex 等 AI Coding Agent 出现 → 标志 Agent 能力的质变飞跃。2026 年初 OpenClaw 等框架进一步巩固。"自主 Agent"的核心特征：复杂 Planning、拆解宏大需求为子任务、长程连续运行（仅需用户清晰描述需求与 Specs）、自我校验机制配合。

**阶段四：自进化 Agent（持续学习与自我升级，2026）**
Hermes Agent + LLM-Wiki 等开源项目 → Agent 可自我沉淀 Skill、自我沉淀知识库、通过 RL 训练提升模型能力。解决"静态模型"与"动态世界"的矛盾。机制：记忆模块 + 反馈循环 + 自我反思，将一次任务的教训转化为新知识或策略。最终目标：实现"越用越好用"。

### 六维技术概念演变

**1. Prompt：深耦合 → 渐进式加载**
早期每个任务一个 Agent，每个 Agent 一段精心调试的 System Prompt（人设、目标、要求、约束、示例），维护成本极高。当前的解耦策略：System Prompt 只保留最底层通用指令和固定部分；动态内容（任务要求、领域知识、人设规范）拆解到外部文件系统（SKILL.md / USER.md / SOUL.md / CLAUDE.md / AGENTS.md），通过渐进式披露（Progressive Disclosure）加载。核心是"上下文的组织形式发生了变化"——动静分离。

**2. Planning：思维链 → 复杂长程任务**
早期依赖 CoT（Chain of Thought）线性串行逻辑推导，简单任务尚可，复杂场景易陷入逻辑断层或死循环。当前的飞跃：
- **复杂问题结构化分解**：主动拆解宏大目标为可执行子任务，生成结构化 Todo List
- **多步协同与长程推理**：按步骤执行 + 动态调整 + 长上下文保持一致性
- **子 Agent 动态构建**：根据子任务需求动态实例化或调用专项子 Agent

驱动因素：基座模型推理能力升级（逻辑、长文本、指令遵循）。Planning 从"提示词技巧"演变为真正的"智能决策中枢"。

**3. Memory：检索增强 → 文件系统化**
早期记忆二分：短期（对话上下文）vs 长期（外部知识库 RAG 向量检索）。当前两个维度都演变：

短期记忆从"存储"转向"管理与压缩"：阈值控制（基于 token 数或语义密度）+ 结构化摘要（保留头尾关键指令）+ 重点提取（剔除冗长噪音）。

长期记忆从"向量数据库主导"转向"文件系统主导"：
- **事项型记忆（Episodic）**：用户偏好、历史行为、每日待办 → 文件系统（MEMORY.md 或每日 Memory 日志）记录
- **知识型记忆（Semantic）**：LLM-Wiki、GBrain 等本地化知识库理念 → Markdown 文件 + Obsidian 笔记工具（个人/中小团队），企业级仍需 RAG/QMD/SQLite 补充

本质：**从纯向量检索走向文件系统沉淀 + 向量检索混合管理**。

**4. Tools：Function Call → CLI / Script**
这是变化最大的维度。早期主流是 Function Call（将系统能力封装为标准 API + 模型可调用函数）——开发维护成本极高，API Schema 管理复杂。MCP 优化注册与发现机制但未改变底层逻辑。真正的范式转移：
- **CLI 命令行原生化**：模型预训练数据中已包含大量 CLI 命令（grep、cat、vim 等）→ 零样本学习优势，节省 token 空间；支持 --help 的工具可被模型按需查询自解释
- **Script 脚本化**：Python 等脚本封装工具逻辑，本地与远程统一；协议黑盒化（鉴权、参数拼接隐藏在脚本内）；Skill 集成（CLI 通过 Skill 描述文件注册）

核心转移：**从"人为适配模型"转向"利用模型原生能力"**。

**5. Workflow：刚性编排 → 动态混合封装**
早期 Workflow 显式硬编码，类似"状态机 / 流水线"，严格按 1、2、3 步执行——保障 Agent 不跑偏但牺牲灵活性。当前形态重构：
- **逻辑内聚化**：分散在 Workflow 引擎中的步骤定义、约束、核心判断逻辑直接写入 Skill 的 Markdown（SKILL.md），模型阅读 Skills 即理解完整链路
- **执行脚本化**：精确控制环节通过 Skill 关联的 Resources Script 编排

新挑战：可控性 vs 稳定性博弈。当前最佳实践是**混合架构**——Skill 为主（灵活易用）+ Workflow 为辅/兜底（关键主干流程保留确定性）+ Workflow 可封装为特殊 Tool 供 Agent 调用。

**6. Environment：无状态 → 运行时环境**
早期 Agent 对工具调用、子 Agent 调用无状态，无需专门运行环境。当前 Agent 成为"数字员工"（持久化存储 + 文件读写 + 状态管理），必须有专属 Workspace。两种形态：
- **本地个人电脑（Local Desktop）**：极高便利性，OpenClaw 最早基于此火爆；缺点是缺乏隔离机制，操作失误可能影响用户数据 → 需严格确认机制
- **沙箱环境（Sandbox / Cloud Server）**：Docker / Kubernetes 容器化隔离，企业级生产主流；操作限制在虚拟文件系统，提供安全边界与资源管控

### 核心哲学：构建确定性承载不确定性

文章提出贯穿全文的核心思想："**通过工程化手段构建确定性，以承载模型的不确定性**"。这是 Agent 从"魔法调优"到"系统工程"转变的本质，也是未来构建高质量 Agent 的基石。

### 与本文观察的对应关系

文中提及的代表性框架可对应到本仓库其他实体：
- **Cloud Code / Codex / OpenClaw / Hermes** → [Claude Code](/ch01-558-claude-code-harness-深度分析/) / [OpenClaw](/ch01-642-openclaw-完全指南-这可能是全网最新最全的系统化教程了-3-2w字-建议收藏/) / Hermes Agent 等
- **Workflow 引擎 LangGraph / Dify** → Agent 编排基础设施
- **Skills 体系（SKILL.md / CLAUDE.md / AGENTS.md）** → [Harness Engineering](/ch05-041-harness-engineering-概念框架/) 的核心载体
- **LLM-Wiki / GBrain** → 本地知识库理念

## 实践启示

- **建立时间线认知**：区分"基础范式"和"最新实践"，避免混用不同时期概念；遇到"穿越感"时回溯时间线而非直接套用
- **运行模型 > 功能列表**：评估 Agent 方案时关注运行模型（同步响应 vs 异步常驻），而非仅看功能列表
- **选型匹配业务复杂度**：to B 高稳定性需求 → Workflow Agent；长程企业任务 → 自主 Agent；持续学习需求 → 自进化 Agent
- **混合架构落地**：企业级不要"非此即彼"——Skill 为主 + Workflow 为辅 + Script 兜底
- **Context 工程优于 Prompt 调优**：把精力放在"动态内容如何组织加载"而非"提示词逐字调试"
- **优先 CLI 原生而非 API 包装**：除非必要，不要为每个操作写专用 API；CLI + Script 是模型"先天知识"
- **沙箱隔离是生产前置条件**：所有企业级 Agent 部署都必须有 Docker/K8s 级隔离
- **Memory 分层管理**：短期靠压缩（摘要+阈值），长期靠文件系统+向量化混合

## 相关实体

- [Claude Code 深度解析](/ch01-558-claude-code-harness-深度分析/) — 自主 Agent 阶段（阶段三）代表
- [OpenClaw 完整指南](/ch01-642-openclaw-完全指南-这可能是全网最新最全的系统化教程了-3-2w字-建议收藏/) — 自主 Agent 阶段（阶段三）代表
- Claude Code Dynamic Workflows — 阶段三到阶段四过渡的 Dynamic Workflow 范式
- [从氛围编程到智能体工程](/ch04-070-从氛围编程到智能体工程/) — Agentic Engineering 范式演进
- [Agent 记忆系统实践](/ch01-707-存之有序-治之有矩-agent-记忆系统的工程实践与演进/) — Memory 模块工程化
- [Hermes Agent Operator](/ch04-067-hermes-agent-operator-上手-把一个-agent-养成可运营系统/) — 自进化 Agent（阶段四）代表
- [Agent YAML 评测](/ch01-746-从手动到自动化-用agenteval构建agent评测体系/) — 自进化机制中的评估反馈环
- [Harness Engineering](/ch05-041-harness-engineering-概念框架/) — 阶段二到阶段四贯穿的核心工程化思想
- Context Engineering — Prompt 解耦与渐进式加载的方法论
- [gene/gep — evomap×清华 提出的「策略基因」经验对象框架（arxiv 2604.15097）](/ch09-011-gene-gep-evomap-清华-提出的-策略基因-经验对象框架-arxiv-2604-15097/)

---

