# Ch05 Harness 工程

> 给 Agent 装上骨架：Loop、Workflow、Dynamic Orchestration

> 本章收录 **102 篇**实体，按深度递增排列。

---

## 本章导航

| Level | 含义 | 篇数 |
|-------|------|------|
| ⭐ 入门 | 零基础可读 | 18 |
| ⭐⭐ 工程师 | 需编程基础 | 13 |
| ⭐⭐⭐ 专家 | 需ML基础 | 24 |
| ⭐⭐⭐⭐ 科学家 | 需研究背景 | 30 |
| ⭐⭐⭐⭐⭐ 大师 | 前沿/哲学 | 17 |

---

## 导读

如果 Agent 是大脑，Harness 就是骨骼和神经系统。

Harness Engineering 是 2026 年冒出来的最重要工程概念之一：它回答的问题不是"模型能不能做到"，而是"我们怎么确保模型在生产环境中稳定地做到"。

本章从 Harness Engineering Framework 出发，经过 Loop Engineering（设计替你写提示词的循环）、Dynamic Workflows（Claude Code 的 fan-out/复核/聚合模式）、到 QQ 音乐和阿里的实战案例。你会看到 92 篇材料如何从不同角度回答同一个问题：

"先写刹车，再写循环"——这句话值得刻在每个 Agent 工程师的显示器上。

---



---

## 本章内容

### ⭐ 入门（18 篇）

- [001. Bringing more agent harnesses and frameworks to Cloudflare, starting with Flue](ch05/001-bringing-more-agent-harnesses-and-frameworks-to-cloudflare)
- [002. Harness Engineering：快手电商用 AI 流水线重塑研发范式（需求全生命周期自动化交付）](ch05/002-harness-engineering-ai)
- [003. Cloud Use 框架：Agent 作为云上受治理主体的四层模型](ch05/003-cloud-use-agent)
- [004. 深入理解 Claude Code 源码中的 Agent Harness 构建之道](ch05/004-claude-code-agent-harness)
- [005. 深入浅出 Harness Engineering 之核心模式与理念](ch05/005-harness-engineering)
- [006. Harness Engineering 系统梳理](ch05/006-harness-engineering)
- [007. Code is cheap: Harness 方法论——水流理论、最小混沌单元与反 slop](ch05/007-code-is-cheap-harness-slop)
- [008. Anthropic 官方 Agent Harness 平台：Claude Managed Agents 完整指南](ch05/008-anthropic-agent-harness-claude-managed-agents)
- [009. Karpathy AutoResearch Loop Cycle & Harness Optimization](ch05/009-karpathy-autoresearch-loop-cycle-harness-optimization)
- [010. Cursor Harness Model Production Floor](ch05/010-cursor-harness-model-production-floor)
- [011. Martin Fowler AI 研发 Harness：非确定性承重层](ch05/011-martin-fowler-ai-harness)
- [012. Superpowers 深度解析：给 Claude Code 装上工程大脑](ch05/012-superpowers-claude-code)
- [013. Claude Code Harness Deep Understanding](ch05/013-claude-code-harness-deep-understanding)
- [014. Claude Code Harness 深度分析](ch05/014-claude-code-harness)
- [015. 去哪儿网 AI Coding 研发平台实践：L0-L5 自动化分级 + Harness 四把锁 + QunarDevCenter + 天弦 QDO](ch05/015-ai-coding-l0-l5-harness-qunardevcenter-qdo)
- [016. Cloudflare Copy Fail Linux 内核漏洞应急响应](ch05/016-cloudflare-copy-fail-linux)
- [017. Build a serverless image editing agent with Amazon Bedrock AgentCore harness](ch05/017-build-a-serverless-image-editing-agent-with-amazon-bedrock-a)
- [018. Loop Engineering 半年实战拆解：claude-ship 开源自进化开发系统](ch05/018-loop-engineering-claude-ship)

### ⭐⭐ 工程师（13 篇）

- [019. MoonBit：面向 Agent 协作的编程语言（语言即工具链 + 形式化验证 + Wasm 沙箱）](ch05/019-moonbit-agent-wasm)
- [020. Harness Engineering for Self-Improvement — 翁荔 Lilian Weng 系统梳理 Harness 自我提升研究全景](ch05/020-harness-engineering-for-self-improvement-lilian-weng-h)
- [021. 应用宝活动平台 Harness 工程实践——从对话式 AI Coding 到工程化系统](ch05/021-harness-ai-coding)
- [022. 从零复刻 Claude Code：Harness 构建学习笔记](ch05/022-claude-code-harness)
- [023. 来自字节跳动TRAE的Harness Engineering指南](ch05/023-trae-harness-engineering)
- [024. 从渐进式 SDD 到 Lattice Harness：AI Coding 团队级闭环实践](ch05/024-sdd-lattice-harness-ai-coding)
- [025. GSD 完胜 OpenSpec 和 Superpowers？源码拆完发现：三者防的是 context rot 的三道防线](ch05/025-gsd-openspec-superpowers-context-rot)
- [026. 清华大学：驾驭工程 (Harness Engineering) 研究报告](ch05/026-harness-engineering)
- [027. Superpowers 6.0 反作弊重写：reviewer 只读怀疑论者 + 上下文经济学 + progress ledger + model 纪律 —— 术哥源码级拆解 158 commits](ch05/027-superpowers-6-0-reviewer-progress-ledger-model)
- [028. 全球首个完全AI编写的训练框架：面壁ForgeTrain速度反超英伟达Megatron，年底要把国产算力软件重写一遍](ch05/028-ai-forgetrain-megatron)
- [029. Thin Harness, Fat Skills：AI工程架构的本质](ch05/029-thin-harness-fat-skills-ai)
- [030. Skill Factory：三天手搓面向Harness设计的技能工厂](ch05/030-skill-factory-harness)
- [031. 从 Prompt 到 Harness：Claude 官方学习资料](ch05/031-prompt-harness-claude)

### ⭐⭐⭐ 专家（24 篇）

- [032. 缝合怪识别与减法决策论：OpenSpec + Superpowers 融合方案下线记（2 周 3 次实测 + 3 个测试 + 加法传播学 + Plan Mode + Superpowers + ASD 最终方案）](ch05/032-openspec-superpowers-2-3-3-plan-mode-s)
- [033. Harness 工程实践复盘：100% Cache 命中的 Agent 怎么设计？](ch05/033-harness-100-cache-agent)
- [034. Harness 到底是什么？看看 OpenClaw、Hermes、Claude Code 的演绎吧](ch05/034-harness-openclaw-hermes-claude-code)
- [035. Martin Fowler AI 研发提醒：Harness 承重层](ch05/035-martin-fowler-ai-harness)
- [036. MAC（multi-agent-coding）：Skills + Hooks 两层 Harness —— 完全委托 0-20% 的解法](ch05/036-mac-multi-agent-coding-skills-hooks-harness-0-20)
- [037. 生产级 Harness 的 12 大组件以及主流框架对比](ch05/037-harness-12)
- [038. 基于 Harness + SDD + 多仓管理模式的 AI 全栈开发实践｜得物技术](ch05/038-harness-sdd-ai)
- [039. Harness 工程可视化：Vibe Coding 中重建工程可控性](ch05/039-harness-vibe-coding)
- [040. EnvHarness: Awakening Static Worlds for Agent Learning](ch05/040-envharness-awakening-static-worlds-for-agent-learning)
- [041. Harness Engineering实践做了一个平台让AI一晚上自动评测和优化你的系统](ch05/041-harness-engineering-ai)
- [042. Beyond Vibe Coding — Directed Generation as Design Methodology](ch05/042-beyond-vibe-coding-directed-generation-as-design-methodolo)
- [043. HSCodeComp：阿里 ACL 2026 最佳资源论文——层级规则应用 Agent 基准](ch05/043-hscodecomp-acl-2026-agent)
- [044. Harness Engineering：AI 能在真正\"出事会炸\"的后端系统里写代码吗？](ch05/044-harness-engineering-ai)
- [045. 场景营销前端 AI Coding — 从问题到方案](ch05/045-ai-coding)
- [046. Spec Kit / OpenSpec / Superpowers 融合：棕地项目的三层Harness架构](ch05/046-spec-kit-openspec-superpowers-harness)
- [047. Loop Engineering 实践指南：CodeBuddy 中的自主循环系统 — Inner/Outer Loop + /goal + /loop + Team 对抗验证 + 状态外置](ch05/047-loop-engineering-codebuddy-inner-outer-loop-goal)
- [048. 面向大型代码库的 Claude Code 团队落地经验与扩展策略（Agent Harness）](ch05/048-claude-code-agent-harness)
- [049. Claude Managed Agents 官方 Harness 平台指南](ch05/049-claude-managed-agents-harness)
- [050. 规格驱动开发与 Harness](ch05/050-harness)
- [051. Harness Engineering Deletable Worksite Ruofei](ch05/051-harness-engineering-deletable-worksite-ruofei)
- [052. Harness进化论文 — M⋆记忆程序进化与AutoHarness动作约束](ch05/052-harness-m-autoharness)
- [053. 从 Autoresearch 到 Better-Harness：自动优化真正难在评价信号](ch05/053-autoresearch-better-harness)
- [054. Agent Harness Skill 系统实战指南 — Reference/Action 类型、动态注入与 frontmatter 全解](ch05/054-agent-harness-skill-reference-action-frontmatter)
- [055. Harness 工程之道：Skill 原理与最佳实践](ch05/055-harness-skill)

### ⭐⭐⭐⭐ 科学家（30 篇）

- [056. Harness Engineering：AI 能在真正"出事会炸"的后端系统里写代码吗？](ch05/056-harness-engineering-ai)
- [057. 长周期 Agent 详解：从 Ralph Loop 到可接管 Harness](ch05/057-agent-ralph-loop-harness)
- [058. Spec as AIOS：AI-Native 全栈交付的抗熵架构（高德技术系列第二期）](ch05/058-spec-as-aios-ai-native)
- [059. Harness Engineering 从理论到实战：行为正确性死结 + 上下文腐烂 + 可驾驭性 + Ashby 定律](ch05/059-harness-engineering-ashby)
- [060. 高德广告工程 Harness/SDD 体系演进：从\"氛围编程\"治理到 AI Native 全流程闭环](ch05/060-harness-sdd-ai-native)
- [061. 长时间运行应用的 Harness 设计](ch05/061-harness)
- [062. AI Friendly 架构设计：后端系统面向无人值守开发时代的标准与路径](ch05/062-ai-friendly)
- [063. Harness 减法工程——删掉 61% 之后什么该留（L0-L3 四层归属）](ch05/063-harness-61-l0-l3)
- [064. Harness 模式 6-SubAgent 实战 — 17哥 versus 大模型评测平台（Git Submodule + Agent Handoff + Chrome DevTools MCP）](ch05/064-harness-6-subagent-17-versus-git-submodule-agent)
- [065. Model-Harness Fit：Agent 脚手架适配模型](ch05/065-model-harness-fit-agent)
- [066. 万字干货！Harness Engineering如何工程化落地？](ch05/066-harness-engineering)
- [067. wow-harness v3：AI 开发的治理协议](ch05/067-wow-harness-v3-ai)
- [068. SkillOpt](ch05/068-skillopt)
- [069. DeepSeek 成本迁移：从 KV Cache 到 Harness 的系统层](ch05/069-deepseek-kv-cache-harness)
- [070. Cursor 复盘 Harness：模型决定能力上限，Harness 决定生产下限](ch05/070-cursor-harness-harness)
- [071. 王云鹤眼中的Harness：复杂优化问题，AGI灵魂争夺之战](ch05/071-harness-agi)
- [072. Agent生产级Harness工程指南](ch05/072-agent-harness)
- [073. 墙比模型更重要：Stripe Minions + 字节 DeerFlow 2.0 + 蚂蚁支小助 的同结论](ch05/073-stripe-minions-deerflow-2-0)
- [074. Agent Harness Engineering: A Survey — ETCLOVG Taxonomy](ch05/074-agent-harness-engineering-a-survey-etclovg-taxonomy)
- [075. Harness Engineering 核心模式](ch05/075-harness-engineering)
- [076. browser-use v0.13 Browser Harness：薄抽象层设计哲学](ch05/076-browser-use-v0-13-browser-harness)
- [077. Agent Harness 解析：智能体架构深度拆解](ch05/077-agent-harness)
- [078. 三器合一：gstack + Superpowers + OpenSpec 工程化 AI 编程实战](ch05/078-gstack-superpowers-openspec-ai)
- [079. 面向复杂算法任务的 AI Agent：高德 Long-Running Harness 架构与 Uplift 模型迭代应用](ch05/079-ai-agent-long-running-harness-uplift)
- [080. Is Grep All You Need? — 检索 × Harness × 交付方式耦合三元组（PwC 论文 arXiv 2605.15184 解读）](ch05/080-is-grep-all-you-need-harness-pwc-arxiv-2605-151)
- [081. SSD Spec 驱动开发实战：从四条约束到 ASD Harness 的工程落地](ch05/081-ssd-spec-asd-harness)
- [082. OpenSpec 四步法深度复盘：流程完整 ≠ 代码正确](ch05/082-openspec)
- [083. 12 个 Agent 工程设计底层逻辑：脚手架 vs 承重墙](ch05/083-12-agent-vs)
- [084. Superpowers 6.0 SDD 评审重写：文件交接 + 多平台支持](ch05/084-superpowers-6-0-sdd)
- [085. Harness Engineering 的未来——什么会消失，什么不会](ch05/085-harness-engineering)

### ⭐⭐⭐⭐⭐ 大师（17 篇）

- [086. Loop Engineering:不再写提示词,而是设计替你写提示词的循环——先写刹车再写循环（19 来源深度合并：Addy Osmani / Boris Cherny+Peter Steinberger / 教科书 / 若飞 工程现场 / TechFarrari 批判 / 若飞 实用指南 / 爱范儿 科普批判 / AllenTang Karpathy 尺子 / winty 7架构中文主流视角 / AutoResearch 5 决策 / 三层结构 + 三款产品对比 + Ralph Loop + 准备度总表 / Shubham Saboo PM 视角 / 若飞 吴恩达三层Loop）](ch05/086-loop-engineering-19-addy-osmani-boris-cherny-pete)
- [087. Harness Engineering：AI 从"聪明"到"可靠"的第三代工程范式](ch05/087-harness-engineering-ai)
- [088. Loss Function Development (LFD) — 损失函数开发与 /goal 循环（Elvis Sun）](ch05/088-loss-function-development-lfd-goal-elvis-sun)
- [089. Harness Engineering 综合论述：为什么 2026 年真正重要的是它（含 ECC 开源实现案例）](ch05/089-harness-engineering-2026-ecc)
- [090. QQ音乐 Harness Engineering 实践（大仓多服务场景）](ch05/090-qq-harness-engineering)
- [091. 深入理解 Claude Code 源码中的 Agent Harness 构建之道](ch05/091-claude-code-agent-harness)
- [092. 一文带你弄懂 AI 圈爆火的新概念：Harness Engineering](ch05/092-ai-harness-engineering)
- [093. 阿里工程师 Harness 工程化实践 (双案例合并)](ch05/093-harness)
- [094. Harness Engineering 综合性指南（ConardLi 系列 · 含 Beautiful Article 实证 + Reacticle 协议）](ch05/094-harness-engineering-conardli-beautiful-article-r)
- [095. DIPG 蚂蚁保 Host-Research-Verify 三 Agent 离线 verify 闭环：C 端 AIGC 工程化范式](ch05/095-dipg-host-research-verify-agent-verify-c-aigc)
- [096. Harness 之后：状态边界与失败闭环（若飞续篇）](ch05/096-harness)
- [097. OpenSpec 规范驱动开发（SDD）框架 — proposal/design/tasks/specs 四类文档意图锁定](ch05/097-openspec-sdd-proposal-design-tasks-specs)
- [098. AI Native 时代研发组织何去何从](ch05/098-ai-native)
- [099. Claude Harness 设计：Generator-Evaluator 架构与 Context Reset 演进](ch05/099-claude-harness-generator-evaluator-context-reset)
- [100. AI 生产开发工作流：OpenSpec 规范驱动 + Superpowers 工具链](ch05/100-ai-openspec-superpowers)
- [101. Harness不是目的，知识才是护城河 —— 一个AI工程交付团队的知识沉淀实践](ch05/101-harness-ai)
- [102. Coding Harness 工程本质：从 Pi 到 OpenClaw](ch05/102-coding-harness-pi-openclaw)


---

## 本章收束

"先写刹车，再写循环。"这一章的几十种实践最终都收敛到这一句话。循环给了 Agent 持续行动的能力，刹车给了它停在正确位置的能力——没有刹车的循环跑得越快，离目标越远。评估、状态、交接、验证，都是刹车的不同名字。

---
