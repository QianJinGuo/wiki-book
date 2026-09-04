# Ch05 Harness 工程

> 给 Agent 装上骨架：Loop、Workflow、Dynamic Orchestration

> 本章收录 **95 篇**实体，按深度递增排列。

---

## 本章导航

| Level | 含义 | 篇数 |
|-------|------|------|
| ⭐ 入门 | 零基础可读 | 13 |
| ⭐⭐ 工程师 | 需编程基础 | 14 |
| ⭐⭐⭐ 专家 | 需ML基础 | 19 |
| ⭐⭐⭐⭐ 科学家 | 需研究背景 | 30 |
| ⭐⭐⭐⭐⭐ 大师 | 前沿/哲学 | 19 |

---

## 导读

如果 Agent 是大脑，Harness 就是骨骼和神经系统。

Harness Engineering 是 2026 年冒出来的最重要工程概念之一：它回答的问题不是"模型能不能做到"，而是"我们怎么确保模型在生产环境中稳定地做到"。

本章从 Harness Engineering Framework 出发，经过 Loop Engineering（设计替你写提示词的循环）、Dynamic Workflows（Claude Code 的 fan-out/复核/聚合模式）、到 QQ 音乐和阿里的实战案例。你会看到 92 篇材料如何从不同角度回答同一个问题：

"先写刹车，再写循环"——这句话值得刻在每个 Agent 工程师的显示器上。

---



---

## 本章内容

- [001. Harness Engineering：快手电商用 AI 流水线重塑研发范式（需求全生命周期自动化交付）](ch05/001-harness-engineering-ai)
- [002. Cloud Use 框架：Agent 作为云上受治理主体的四层模型](ch05/002-cloud-use-agent)
- [003. Code is cheap: Harness 方法论——水流理论、最小混沌单元与反 slop](ch05/003-code-is-cheap-harness-slop)
- [004. Karpathy AutoResearch Loop Cycle & Harness Optimization](ch05/004-karpathy-autoresearch-loop-cycle-harness-optimization)
- [005. Superpowers 深度解析：给 Claude Code 装上工程大脑](ch05/005-superpowers-claude-code)
- [006. 去哪儿网 AI Coding 研发平台实践：L0-L5 自动化分级 + Harness 四把锁 + QunarDevCenter + 天弦 QDO](ch05/006-ai-coding-l0-l5-harness-qunardevcenter-qdo)
- [007. HSCodeComp：阿里 ACL 2026 最佳资源论文——层级规则应用 Agent 基准](ch05/007-hscodecomp-acl-2026-agent)
- [008. MoonBit：面向 Agent 协作的编程语言（语言即工具链 + 形式化验证 + Wasm 沙箱）](ch05/008-moonbit-agent-wasm)
- [009. Cloudflare Copy Fail Linux 内核漏洞应急响应](ch05/009-cloudflare-copy-fail-linux)
- [010. Build a serverless image editing agent with Amazon Bedrock AgentCore harness](ch05/010-build-a-serverless-image-editing-agent-with-amazon-bedrock-a)
- [011. Beyond Vibe Coding — Directed Generation as Design Methodology](ch05/011-beyond-vibe-coding-directed-generation-as-design-methodolo)
- [012. 快手 AgentX——推荐系统自我迭代的 Agent 驱动研发闭环](ch05/012-agentx-agent)
- [013. 场景营销前端 AI Coding — 从问题到方案](ch05/013-ai-coding)
- [014. Harness Engineering for Self-Improvement — 翁荔 Lilian Weng 系统梳理 Harness 自我提升研究全景](ch05/014-harness-engineering-for-self-improvement-lilian-weng-h)
- [015. 应用宝活动平台 Harness 工程实践——从对话式 AI Coding 到工程化系统](ch05/015-harness-ai-coding)
- [016. 开启Harness Engineering探索之旅](ch05/016-harness-engineering)
- [017. WorkBuddy 产品实践：从模型到 Harness 的 Agent 可用产品架构](ch05/017-workbuddy-harness-agent)
- [018. 从零复刻 Claude Code：Harness 构建学习笔记](ch05/018-claude-code-harness)
- [019. 从渐进式 SDD 到 Lattice Harness：AI Coding 团队级闭环实践](ch05/019-sdd-lattice-harness-ai-coding)
- [020. GSD 完胜 OpenSpec 和 Superpowers？源码拆完发现：三者防的是 context rot 的三道防线](ch05/020-gsd-openspec-superpowers-context-rot)
- [021. 清华大学：驾驭工程 (Harness Engineering) 研究报告](ch05/021-harness-engineering)
- [022. Superpowers 6.0 反作弊重写：reviewer 只读怀疑论者 + 上下文经济学 + progress ledger + model 纪律 —— 术哥源码级拆解 158 commits](ch05/022-superpowers-6-0-reviewer-progress-ledger-model)
- [023. 全球首个完全AI编写的训练框架：面壁ForgeTrain速度反超英伟达Megatron，年底要把国产算力软件重写一遍](ch05/023-ai-forgetrain-megatron)
- [024. Thin Harness, Fat Skills：AI工程架构的本质](ch05/024-thin-harness-fat-skills-ai)
- [025. Skill Factory：三天手搓面向Harness设计的技能工厂](ch05/025-skill-factory-harness)
- [026. 腾讯 TAB Harness 全链路实战：从 Vibe Coding 到 13 阶段接力赛](ch05/026-tab-harness-vibe-coding-13)
- [027. browser-use v0.13 Browser Harness：薄抽象层设计哲学](ch05/027-browser-use-v0-13-browser-harness)
- [028. 缝合怪识别与减法决策论：OpenSpec + Superpowers 融合方案下线记（2 周 3 次实测 + 3 个测试 + 加法传播学 + Plan Mode + Superpowers + ASD 最终方案）](ch05/028-openspec-superpowers-2-3-3-plan-mode-s)
- [029. Harness 工程实践复盘：100% Cache 命中的 Agent 怎么设计？](ch05/029-harness-100-cache-agent)
- [030. Harness 到底是什么？看看 OpenClaw、Hermes、Claude Code 的演绎吧](ch05/030-harness-openclaw-hermes-claude-code)
- [031. Martin Fowler AI 研发提醒：Harness 承重层](ch05/031-martin-fowler-ai-harness)
- [032. Martin Fowler AI 研发 Harness：非确定性承重层](ch05/032-martin-fowler-ai-harness)
- [033. MAC（multi-agent-coding）：Skills + Hooks 两层 Harness —— 完全委托 0-20% 的解法](ch05/033-mac-multi-agent-coding-skills-hooks-harness-0-20)
- [034. 生产级 Harness 的 12 大组件以及主流框架对比](ch05/034-harness-12)
- [035. 基于 Harness + SDD + 多仓管理模式的 AI 全栈开发实践｜得物技术](ch05/035-harness-sdd-ai)
- [036. Martin Fowler 的 AI 研发提醒：非确定性进了研发链路，Harness 才真正开始承重](ch05/036-martin-fowler-ai-harness)
- [037. Harness 工程可视化：Vibe Coding 中重建工程可控性](ch05/037-harness-vibe-coding)
- [038. EnvHarness: Awakening Static Worlds for Agent Learning](ch05/038-envharness-awakening-static-worlds-for-agent-learning)
- [039. Harness Engineering：AI 能在真正\"出事会炸\"的后端系统里写代码吗？](ch05/039-harness-engineering-ai)
- [040. Spec Kit / OpenSpec / Superpowers 融合：棕地项目的三层Harness架构](ch05/040-spec-kit-openspec-superpowers-harness)
- [041. Loop Engineering 实践指南：CodeBuddy 中的自主循环系统 — Inner/Outer Loop + /goal + /loop + Team 对抗验证 + 状态外置](ch05/041-loop-engineering-codebuddy-inner-outer-loop-goal)
- [042. 腾讯 AI Team 知识沉淀体系（Harness Engineering 实践）](ch05/042-ai-team-harness-engineering)
- [043. Harness Engineering Deletable Worksite Ruofei](ch05/043-harness-engineering-deletable-worksite-ruofei)
- [044. Engineering roles shift from developing code to managing AI](ch05/044-engineering-roles-shift-from-developing-code-to-managing-ai)
- [045. Agent Harness Skill 系统实战指南 — Reference/Action 类型、动态注入与 frontmatter 全解](ch05/045-agent-harness-skill-reference-action-frontmatter)
- [046. Harness 工程之道：Skill 原理与最佳实践](ch05/046-harness-skill)
- [047. Harness Engineering：AI 能在真正"出事会炸"的后端系统里写代码吗？](ch05/047-harness-engineering-ai)
- [048. 一文带你弄懂 AI 圈爆火的新概念：Harness Engineering](ch05/048-ai-harness-engineering)
- [049. 长周期 Agent 详解：从 Ralph Loop 到可接管 Harness](ch05/049-agent-ralph-loop-harness)
- [050. Spec as AIOS：AI-Native 全栈交付的抗熵架构（高德技术系列第二期）](ch05/050-spec-as-aios-ai-native)
- [051. 高德广告工程 Harness/SDD 体系演进：从\"氛围编程\"治理到 AI Native 全流程闭环](ch05/051-harness-sdd-ai-native)
- [052. Harness Engineering 从理论到实战：行为正确性死结 + 上下文腐烂 + 可驾驭性 + Ashby 定律](ch05/052-harness-engineering-ashby)
- [053. AI Friendly 架构设计：后端系统面向无人值守开发时代的标准与路径](ch05/053-ai-friendly)
- [054. Harness 减法工程——删掉 61% 之后什么该留（L0-L3 四层归属）](ch05/054-harness-61-l0-l3)
- [055. Harness 模式 6-SubAgent 实战 — 17哥 versus 大模型评测平台（Git Submodule + Agent Handoff + Chrome DevTools MCP）](ch05/055-harness-6-subagent-17-versus-git-submodule-agent)
- [056. 万字干货！Harness Engineering如何工程化落地？](ch05/056-harness-engineering)
- [057. wow-harness v3：AI 开发的治理协议](ch05/057-wow-harness-v3-ai)
- [058. SkillOpt](ch05/058-skillopt)
- [059. Harness Engineering 实战：AI Coding 率从 25% 提升至 90%](ch05/059-harness-engineering-ai-coding-25-90)
- [060. DeepSeek 成本迁移：从 KV Cache 到 Harness 的系统层](ch05/060-deepseek-kv-cache-harness)
- [061. Cursor 复盘 Harness：模型决定能力上限，Harness 决定生产下限](ch05/061-cursor-harness-harness)
- [062. 王云鹤眼中的Harness：复杂优化问题，AGI灵魂争夺之战](ch05/062-harness-agi)
- [063. Agent生产级Harness工程指南](ch05/063-agent-harness)
- [064. 墙比模型更重要：Stripe Minions + 字节 DeerFlow 2.0 + 蚂蚁支小助 的同结论](ch05/064-stripe-minions-deerflow-2-0)
- [065. OpenClacky — Prompt Cache 命中率 90% 的 Harness 工程实践](ch05/065-openclacky-prompt-cache-90-harness)
- [066. Harness Engineering 核心模式](ch05/066-harness-engineering)
- [067. Harness Engineering 概念框架](ch05/067-harness-engineering)
- [068. 三器合一：gstack + Superpowers + OpenSpec 工程化 AI 编程实战](ch05/068-gstack-superpowers-openspec-ai)
- [069. 面向复杂算法任务的 AI Agent：高德 Long-Running Harness 架构与 Uplift 模型迭代应用](ch05/069-ai-agent-long-running-harness-uplift)
- [070. Is Grep All You Need? — 检索 × Harness × 交付方式耦合三元组（PwC 论文 arXiv 2605.15184 解读）](ch05/070-is-grep-all-you-need-harness-pwc-arxiv-2605-151)
- [071. SSD Spec 驱动开发实战：从四条约束到 ASD Harness 的工程落地](ch05/071-ssd-spec-asd-harness)
- [072. OpenSpec 四步法深度复盘：流程完整 ≠ 代码正确](ch05/072-openspec)
- [073. Harness Engineering 系统梳理](ch05/073-harness-engineering)
- [074. 12 个 Agent 工程设计底层逻辑：脚手架 vs 承重墙](ch05/074-12-agent-vs)
- [075. Superpowers 6.0 SDD 评审重写：文件交接 + 多平台支持](ch05/075-superpowers-6-0-sdd)
- [076. Harness Engineering 的未来——什么会消失，什么不会](ch05/076-harness-engineering)
- [077. Loop Engineering:不再写提示词,而是设计替你写提示词的循环——先写刹车再写循环（19 来源深度合并：Addy Osmani / Boris Cherny+Peter Steinberger / 教科书 / 若飞 工程现场 / TechFarrari 批判 / 若飞 实用指南 / 爱范儿 科普批判 / AllenTang Karpathy 尺子 / winty 7架构中文主流视角 / AutoResearch 5 决策 / 三层结构 + 三款产品对比 + Ralph Loop + 准备度总表 / Shubham Saboo PM 视角 / 若飞 吴恩达三层Loop）](ch05/077-loop-engineering-19-addy-osmani-boris-cherny-pete)
- [078. Harness Engineering：AI 从"聪明"到"可靠"的第三代工程范式](ch05/078-harness-engineering-ai)
- [079. Loss Function Development (LFD) — 损失函数开发与 /goal 循环（Elvis Sun）](ch05/079-loss-function-development-lfd-goal-elvis-sun)
- [080. Harness Engineering 综合论述：为什么 2026 年真正重要的是它（含 ECC 开源实现案例）](ch05/080-harness-engineering-2026-ecc)
- [081. QQ音乐 Harness Engineering 实践（大仓多服务场景）](ch05/081-qq-harness-engineering)
- [082. 一文带你弄懂 AI 圈爆火的新概念：Harness Engineering](ch05/082-ai-harness-engineering)
- [083. 阿里工程师 Harness 工程化实践 (双案例合并)](ch05/083-harness)
- [084. Harness Engineering 综合性指南（ConardLi 系列 · 含 Beautiful Article 实证 + Reacticle 协议）](ch05/084-harness-engineering-conardli-beautiful-article-r)
- [085. DIPG 蚂蚁保 Host-Research-Verify 三 Agent 离线 verify 闭环：C 端 AIGC 工程化范式](ch05/085-dipg-host-research-verify-agent-verify-c-aigc)
- [086. Harness 之后：状态边界与失败闭环（若飞续篇）](ch05/086-harness)
- [087. OpenSpec 规范驱动开发（SDD）框架 — proposal/design/tasks/specs 四类文档意图锁定](ch05/087-openspec-sdd-proposal-design-tasks-specs)
- [088. AI Native 时代研发组织何去何从](ch05/088-ai-native)
- [089. Claude Harness 设计：Generator-Evaluator 架构与 Context Reset 演进](ch05/089-claude-harness-generator-evaluator-context-reset)
- [090. Harness Engineering 四根支柱与四要素架构](ch05/090-harness-engineering)
- [091. AI 生产开发工作流：OpenSpec 规范驱动 + Superpowers 工具链](ch05/091-ai-openspec-superpowers)
- [092. Harness不是目的，知识才是护城河 —— 一个AI工程交付团队的知识沉淀实践](ch05/092-harness-ai)
- [093. Harness不是目的，知识才是护城河 —— 一个AI工程交付团队的知识沉淀实践](ch05/093-harness-ai)
- [094. Coding Harness 工程本质：从 Pi 到 OpenClaw](ch05/094-coding-harness-pi-openclaw)
- [095. Impeccable：大规模自动化测试框架](ch05/095-impeccable)
