# Ch05 Harness 工程

> 给 Agent 装上骨架：Loop、Workflow、Dynamic Orchestration

> 本章收录 **106 篇**实体，按深度递增排列。

---

## 本章导航

| Level | 含义 | 篇数 |
|-------|------|------|
| ⭐ 入门 | 零基础可读 | 17 |
| ⭐⭐ 工程师 | 需编程基础 | 14 |
| ⭐⭐⭐ 专家 | 需ML基础 | 25 |
| ⭐⭐⭐⭐ 科学家 | 需研究背景 | 33 |
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

### 🧭 本章综合（2 篇）

- [S01. Harness Engineering 的 2026：从提示词工程到运行时控制](ch05/S01-harness-engineering-2026)
- [S02. 先写刹车，再写循环：Harness 设计的六个决策点](ch05/S02-harness-brakes-first)

### ⭐ 入门（17 篇）

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

### ⭐⭐ 工程师（14 篇）

- [018. MoonBit：面向 Agent 协作的编程语言（语言即工具链 + 形式化验证 + Wasm 沙箱）](ch05/018-moonbit-agent-wasm)
- [019. Harness Engineering for Self-Improvement — 翁荔 Lilian Weng 系统梳理 Harness 自我提升研究全景](ch05/019-harness-engineering-for-self-improvement-lilian-weng-h)
- [020. 应用宝活动平台 Harness 工程实践——从对话式 AI Coding 到工程化系统](ch05/020-harness-ai-coding)
- [021. 从零复刻 Claude Code：Harness 构建学习笔记](ch05/021-claude-code-harness)
- [022. vivo Agent 系统分析：大模型是大脑不是马，Harness 是 ICU 不是马鞍](ch05/022-vivo-agent-harness-icu)
- [023. 来自字节跳动TRAE的Harness Engineering指南](ch05/023-trae-harness-engineering)
- [024. 从渐进式 SDD 到 Lattice Harness：AI Coding 团队级闭环实践](ch05/024-sdd-lattice-harness-ai-coding)
- [025. GSD 完胜 OpenSpec 和 Superpowers？源码拆完发现：三者防的是 context rot 的三道防线](ch05/025-gsd-openspec-superpowers-context-rot)
- [026. 清华大学：驾驭工程 (Harness Engineering) 研究报告](ch05/026-harness-engineering)
- [027. Superpowers 6.0 反作弊重写：reviewer 只读怀疑论者 + 上下文经济学 + progress ledger + model 纪律 —— 术哥源码级拆解 158 commits](ch05/027-superpowers-6-0-reviewer-progress-ledger-model)
- [028. 全球首个完全AI编写的训练框架：面壁ForgeTrain速度反超英伟达Megatron，年底要把国产算力软件重写一遍](ch05/028-ai-forgetrain-megatron)
- [029. Thin Harness, Fat Skills：AI工程架构的本质](ch05/029-thin-harness-fat-skills-ai)
- [030. Skill Factory：三天手搓面向Harness设计的技能工厂](ch05/030-skill-factory-harness)
- [031. 从 Prompt 到 Harness：Claude 官方学习资料](ch05/031-prompt-harness-claude)

### ⭐⭐⭐ 专家（25 篇）

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
- [049. Loop Engineering 半年实战拆解：claude-ship 开源自进化开发系统](ch05/049-loop-engineering-claude-ship)
- [050. Claude Managed Agents 官方 Harness 平台指南](ch05/050-claude-managed-agents-harness)
- [051. 规格驱动开发与 Harness](ch05/051-harness)
- [052. Harness Engineering Deletable Worksite Ruofei](ch05/052-harness-engineering-deletable-worksite-ruofei)
- [053. Harness进化论文 — M⋆记忆程序进化与AutoHarness动作约束](ch05/053-harness-m-autoharness)
- [054. 从 Autoresearch 到 Better-Harness：自动优化真正难在评价信号](ch05/054-autoresearch-better-harness)
- [055. Agent Harness Skill 系统实战指南 — Reference/Action 类型、动态注入与 frontmatter 全解](ch05/055-agent-harness-skill-reference-action-frontmatter)
- [056. Harness 工程之道：Skill 原理与最佳实践](ch05/056-harness-skill)

### ⭐⭐⭐⭐ 科学家（33 篇）

- [057. Harness Engineering：AI 能在真正"出事会炸"的后端系统里写代码吗？](ch05/057-harness-engineering-ai)
- [058. 长周期 Agent 详解：从 Ralph Loop 到可接管 Harness](ch05/058-agent-ralph-loop-harness)
- [059. Spec as AIOS：AI-Native 全栈交付的抗熵架构（高德技术系列第二期）](ch05/059-spec-as-aios-ai-native)
- [060. Harness Engineering 从理论到实战：行为正确性死结 + 上下文腐烂 + 可驾驭性 + Ashby 定律](ch05/060-harness-engineering-ashby)
- [061. 高德广告工程 Harness/SDD 体系演进：从\"氛围编程\"治理到 AI Native 全流程闭环](ch05/061-harness-sdd-ai-native)
- [062. 长时间运行应用的 Harness 设计](ch05/062-harness)
- [063. AI Friendly 架构设计：后端系统面向无人值守开发时代的标准与路径](ch05/063-ai-friendly)
- [064. Harness 减法工程——删掉 61% 之后什么该留（L0-L3 四层归属）](ch05/064-harness-61-l0-l3)
- [065. Harness 模式 6-SubAgent 实战 — 17哥 versus 大模型评测平台（Git Submodule + Agent Handoff + Chrome DevTools MCP）](ch05/065-harness-6-subagent-17-versus-git-submodule-agent)
- [066. Model-Harness Fit：Agent 脚手架适配模型](ch05/066-model-harness-fit-agent)
- [067. 万字干货！Harness Engineering如何工程化落地？](ch05/067-harness-engineering)
- [068. wow-harness v3：AI 开发的治理协议](ch05/068-wow-harness-v3-ai)
- [069. SkillOpt](ch05/069-skillopt)
- [070. DeepSeek 成本迁移：从 KV Cache 到 Harness 的系统层](ch05/070-deepseek-kv-cache-harness)
- [071. How harnesses and post-training close the open-weight bug-finding gap](ch05/071-how-harnesses-and-post-training-close-the-open-weight-bug-fi)
- [072. Cursor 复盘 Harness：模型决定能力上限，Harness 决定生产下限](ch05/072-cursor-harness-harness)
- [073. Claude Code 之父最新访谈：编程已经结束、harness 将消失、Claude Code 将只有 100 行代码、loop 才是未来](ch05/073-claude-code-harness-claude-code-100-loop)
- [074. 王云鹤眼中的Harness：复杂优化问题，AGI灵魂争夺之战](ch05/074-harness-agi)
- [075. Agent生产级Harness工程指南](ch05/075-agent-harness)
- [076. 墙比模型更重要：Stripe Minions + 字节 DeerFlow 2.0 + 蚂蚁支小助 的同结论](ch05/076-stripe-minions-deerflow-2-0)
- [077. Agent Harness Engineering: A Survey — ETCLOVG Taxonomy](ch05/077-agent-harness-engineering-a-survey-etclovg-taxonomy)
- [078. 数据级 Harness：架构师 JiaGouX 解读 Anthropic 95% 数据分析与 5 个反直觉边界](ch05/078-harness-jiagoux-anthropic-95-5)
- [079. Harness Engineering 核心模式](ch05/079-harness-engineering)
- [080. browser-use v0.13 Browser Harness：薄抽象层设计哲学](ch05/080-browser-use-v0-13-browser-harness)
- [081. Agent Harness 解析：智能体架构深度拆解](ch05/081-agent-harness)
- [082. 三器合一：gstack + Superpowers + OpenSpec 工程化 AI 编程实战](ch05/082-gstack-superpowers-openspec-ai)
- [083. 面向复杂算法任务的 AI Agent：高德 Long-Running Harness 架构与 Uplift 模型迭代应用](ch05/083-ai-agent-long-running-harness-uplift)
- [084. Is Grep All You Need? — 检索 × Harness × 交付方式耦合三元组（PwC 论文 arXiv 2605.15184 解读）](ch05/084-is-grep-all-you-need-harness-pwc-arxiv-2605-151)
- [085. SSD Spec 驱动开发实战：从四条约束到 ASD Harness 的工程落地](ch05/085-ssd-spec-asd-harness)
- [086. OpenSpec 四步法深度复盘：流程完整 ≠ 代码正确](ch05/086-openspec)
- [087. 12 个 Agent 工程设计底层逻辑：脚手架 vs 承重墙](ch05/087-12-agent-vs)
- [088. Superpowers 6.0 SDD 评审重写：文件交接 + 多平台支持](ch05/088-superpowers-6-0-sdd)
- [089. Harness Engineering 的未来——什么会消失，什么不会](ch05/089-harness-engineering)

### ⭐⭐⭐⭐⭐ 大师（17 篇）

- [090. Loop Engineering:不再写提示词,而是设计替你写提示词的循环——先写刹车再写循环（19 来源深度合并：Addy Osmani / Boris Cherny+Peter Steinberger / 教科书 / 若飞 工程现场 / TechFarrari 批判 / 若飞 实用指南 / 爱范儿 科普批判 / AllenTang Karpathy 尺子 / winty 7架构中文主流视角 / AutoResearch 5 决策 / 三层结构 + 三款产品对比 + Ralph Loop + 准备度总表 / Shubham Saboo PM 视角 / 若飞 吴恩达三层Loop）](ch05/090-loop-engineering-19-addy-osmani-boris-cherny-pete)
- [091. Harness Engineering：AI 从"聪明"到"可靠"的第三代工程范式](ch05/091-harness-engineering-ai)
- [092. Loss Function Development (LFD) — 损失函数开发与 /goal 循环（Elvis Sun）](ch05/092-loss-function-development-lfd-goal-elvis-sun)
- [093. Harness Engineering 综合论述：为什么 2026 年真正重要的是它（含 ECC 开源实现案例）](ch05/093-harness-engineering-2026-ecc)
- [094. QQ音乐 Harness Engineering 实践（大仓多服务场景）](ch05/094-qq-harness-engineering)
- [095. 深入理解 Claude Code 源码中的 Agent Harness 构建之道](ch05/095-claude-code-agent-harness)
- [096. 一文带你弄懂 AI 圈爆火的新概念：Harness Engineering](ch05/096-ai-harness-engineering)
- [097. 阿里工程师 Harness 工程化实践 (双案例合并)](ch05/097-harness)
- [098. Harness Engineering 综合性指南（ConardLi 系列 · 含 Beautiful Article 实证 + Reacticle 协议）](ch05/098-harness-engineering-conardli-beautiful-article-r)
- [099. DIPG 蚂蚁保 Host-Research-Verify 三 Agent 离线 verify 闭环：C 端 AIGC 工程化范式](ch05/099-dipg-host-research-verify-agent-verify-c-aigc)
- [100. Harness 之后：状态边界与失败闭环（若飞续篇）](ch05/100-harness)
- [101. OpenSpec 规范驱动开发（SDD）框架 — proposal/design/tasks/specs 四类文档意图锁定](ch05/101-openspec-sdd-proposal-design-tasks-specs)
- [102. AI Native 时代研发组织何去何从](ch05/102-ai-native)
- [103. Claude Harness 设计：Generator-Evaluator 架构与 Context Reset 演进](ch05/103-claude-harness-generator-evaluator-context-reset)
- [104. AI 生产开发工作流：OpenSpec 规范驱动 + Superpowers 工具链](ch05/104-ai-openspec-superpowers)
- [105. Harness不是目的，知识才是护城河 —— 一个AI工程交付团队的知识沉淀实践](ch05/105-harness-ai)
- [106. Coding Harness 工程本质：从 Pi 到 OpenClaw](ch05/106-coding-harness-pi-openclaw)


---

## 本章收束

"先写刹车，再写循环。"这一章的几十种实践最终都收敛到这一句话。循环给了 Agent 持续行动的能力，刹车给了它停在正确位置的能力——没有刹车的循环跑得越快，离目标越远。评估、状态、交接、验证，都是刹车的不同名字。

---
