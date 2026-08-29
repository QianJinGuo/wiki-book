# Ch05 Harness 工程

> 给 Agent 装上骨架：Loop、Workflow、Dynamic Orchestration

> 本章收录 **93 篇**实体，按深度递增排列。

---

## 本章导航

| Level | 含义 | 篇数 |
|-------|------|------|
| ⭐ 入门 | 零基础可读 | 1 |
| ⭐⭐ 工程师 | 需编程基础 | 75 |
| ⭐⭐⭐ 专家 | 需ML基础 | 17 |

---

## 导读

如果 Agent 是大脑，Harness 就是骨骼和神经系统。

Harness Engineering 是 2026 年冒出来的最重要工程概念之一：它回答的问题不是"模型能不能做到"，而是"我们怎么确保模型在生产环境中稳定地做到"。

本章从 Harness Engineering Framework 出发，经过 Loop Engineering（设计替你写提示词的循环）、Dynamic Workflows（Claude Code 的 fan-out/复核/聚合模式）、到 QQ 音乐和阿里的实战案例。你会看到 92 篇材料如何从不同角度回答同一个问题：

"先写刹车，再写循环"——这句话值得刻在每个 Agent 工程师的显示器上。

---



---

## 本章内容

- [001. Impeccable：大规模自动化测试框架](ch05/001-impeccable)
- [002. Loop Engineering:不再写提示词,而是设计替你写提示词的循环——先写刹车再写循环（19 来源深度合并：Addy Osmani / Boris Cherny+Peter Steinberger / 教科书 / 若飞 工程现场 / TechFarrari 批判 / 若飞 实用指南 / 爱范儿 科普批判 / AllenTang Karpathy 尺子 / winty 7架构中文主流视角 / AutoResearch 5 决策 / 三层结构 + 三款产品对比 + Ralph Loop + 准备度总表 / Shubham Saboo PM 视角 / 若飞 吴恩达三层Loop）](ch05/002-loop-engineering-19-addy-osmani-boris-cherny-pete)
- [003. Harness Engineering：AI 从"聪明"到"可靠"的第三代工程范式](ch05/003-harness-engineering-ai)
- [004. Harness Engineering 综合论述：为什么 2026 年真正重要的是它（含 ECC 开源实现案例）](ch05/004-harness-engineering-2026-ecc)
- [005. QQ音乐 Harness Engineering 实践（大仓多服务场景）](ch05/005-qq-harness-engineering)
- [006. 一文带你弄懂 AI 圈爆火的新概念：Harness Engineering](ch05/006-ai-harness-engineering)
- [007. 缝合怪识别与减法决策论：OpenSpec + Superpowers 融合方案下线记（2 周 3 次实测 + 3 个测试 + 加法传播学 + Plan Mode + Superpowers + ASD 最终方案）](ch05/007-openspec-superpowers-2-3-3-plan-mode-s)
- [008. 阿里工程师 Harness 工程化实践 (双案例合并)](ch05/008-harness)
- [009. Harness Engineering 综合性指南（ConardLi 系列 · 含 Beautiful Article 实证 + Reacticle 协议）](ch05/009-harness-engineering-conardli-beautiful-article-r)
- [010. 一文带你弄懂 AI 圈爆火的新概念：Harness Engineering](ch05/010-ai-harness-engineering)
- [011. 长周期 Agent 详解：从 Ralph Loop 到可接管 Harness](ch05/011-agent-ralph-loop-harness)
- [012. Spec as AIOS：AI-Native 全栈交付的抗熵架构（高德技术系列第二期）](ch05/012-spec-as-aios-ai-native)
- [013. Harness 到底是什么？看看 OpenClaw、Hermes、Claude Code 的演绎吧](ch05/013-harness-openclaw-hermes-claude-code)
- [014. Harness 之后：状态边界与失败闭环（若飞续篇）](ch05/014-harness)
- [015. Martin Fowler AI 研发提醒：Harness 承重层](ch05/015-martin-fowler-ai-harness)
- [016. 高德广告工程 Harness/SDD 体系演进：从\"氛围编程\"治理到 AI Native 全流程闭环](ch05/016-harness-sdd-ai-native)
- [017. OpenSpec 规范驱动开发（SDD）框架 — proposal/design/tasks/specs 四类文档意图锁定](ch05/017-openspec-sdd-proposal-design-tasks-specs)
- [018. AI Native 时代研发组织何去何从](ch05/018-ai-native)
- [019. AI Friendly 架构设计：后端系统面向无人值守开发时代的标准与路径](ch05/019-ai-friendly)
- [020. AI 生产开发工作流：OpenSpec 规范驱动 + Superpowers 工具链](ch05/020-ai-openspec-superpowers)
- [021. Harness 减法工程——删掉 61% 之后什么该留（L0-L3 四层归属）](ch05/021-harness-61-l0-l3)
- [022. Martin Fowler AI 研发 Harness：非确定性承重层](ch05/022-martin-fowler-ai-harness)
- [023. Harness 模式 6-SubAgent 实战 — 17哥 versus 大模型评测平台（Git Submodule + Agent Handoff + Chrome DevTools MCP）](ch05/023-harness-6-subagent-17-versus-git-submodule-agent)
- [024. Harness不是目的，知识才是护城河 —— 一个AI工程交付团队的知识沉淀实践](ch05/024-harness-ai)
- [025. MAC（multi-agent-coding）：Skills + Hooks 两层 Harness —— 完全委托 0-20% 的解法](ch05/025-mac-multi-agent-coding-skills-hooks-harness-0-20)
- [026. 万字干货！Harness Engineering如何工程化落地？](ch05/026-harness-engineering)
- [027. wow-harness v3：AI 开发的治理协议](ch05/027-wow-harness-v3-ai)
- [028. SkillOpt](ch05/028-skillopt)
- [029. Coding Harness 工程本质：从 Pi 到 OpenClaw](ch05/029-coding-harness-pi-openclaw)
- [030. Harness Engineering 实战：AI Coding 率从 25% 提升至 90%](ch05/030-harness-engineering-ai-coding-25-90)
- [031. 生产级 Harness 的 12 大组件以及主流框架对比](ch05/031-harness-12)
- [032. DeepSeek 成本迁移：从 KV Cache 到 Harness 的系统层](ch05/032-deepseek-kv-cache-harness)
- [033. Cursor 复盘 Harness：模型决定能力上限，Harness 决定生产下限](ch05/033-cursor-harness-harness)
- [034. 王云鹤眼中的Harness：复杂优化问题，AGI灵魂争夺之战](ch05/034-harness-agi)
- [035. Agent生产级Harness工程指南](ch05/035-agent-harness)
- [036. 基于 Harness + SDD + 多仓管理模式的 AI 全栈开发实践｜得物技术](ch05/036-harness-sdd-ai)
- [037. OpenClacky — Prompt Cache 命中率 90% 的 Harness 工程实践](ch05/037-openclacky-prompt-cache-90-harness)
- [038. Martin Fowler 的 AI 研发提醒：非确定性进了研发链路，Harness 才真正开始承重](ch05/038-martin-fowler-ai-harness)
- [039. Harness Engineering 核心模式](ch05/039-harness-engineering)
- [040. Harness Engineering 概念框架](ch05/040-harness-engineering)
- [041. EnvHarness: Awakening Static Worlds for Agent Learning](ch05/041-envharness-awakening-static-worlds-for-agent-learning)
- [042. 三器合一：gstack + Superpowers + OpenSpec 工程化 AI 编程实战](ch05/042-gstack-superpowers-openspec-ai)
- [043. 面向复杂算法任务的 AI Agent：高德 Long-Running Harness 架构与 Uplift 模型迭代应用](ch05/043-ai-agent-long-running-harness-uplift)
- [044. Is Grep All You Need? — 检索 × Harness × 交付方式耦合三元组（PwC 论文 arXiv 2605.15184 解读）](ch05/044-is-grep-all-you-need-harness-pwc-arxiv-2605-151)
- [045. SSD Spec 驱动开发实战：从四条约束到 ASD Harness 的工程落地](ch05/045-ssd-spec-asd-harness)
- [046. OpenSpec 四步法深度复盘：流程完整 ≠ 代码正确](ch05/046-openspec)
- [047. Harness Engineering 系统梳理](ch05/047-harness-engineering)
- [048. 12 个 Agent 工程设计底层逻辑：脚手架 vs 承重墙](ch05/048-12-agent-vs)
- [049. Harness Engineering：AI 能在真正\"出事会炸\"的后端系统里写代码吗？](ch05/049-harness-engineering-ai)
- [050. Spec Kit / OpenSpec / Superpowers 融合：棕地项目的三层Harness架构](ch05/050-spec-kit-openspec-superpowers-harness)
- [051. Superpowers 6.0 SDD 评审重写：文件交接 + 多平台支持](ch05/051-superpowers-6-0-sdd)
- [052. Loop Engineering 实践指南：CodeBuddy 中的自主循环系统 — Inner/Outer Loop + /goal + /loop + Team 对抗验证 + 状态外置](ch05/052-loop-engineering-codebuddy-inner-outer-loop-goal)
- [053. Harness Engineering for Self-Improvement — 翁荔 Lilian Weng 系统梳理 Harness 自我提升研究全景](ch05/053-harness-engineering-for-self-improvement-lilian-weng-h)
- [054. Harness Engineering Deletable Worksite Ruofei](ch05/054-harness-engineering-deletable-worksite-ruofei)
- [055. 开启Harness Engineering探索之旅](ch05/055-harness-engineering)
- [056. WorkBuddy 产品实践：从模型到 Harness 的 Agent 可用产品架构](ch05/056-workbuddy-harness-agent)
- [057. Harness Engineering 的未来——什么会消失，什么不会](ch05/057-harness-engineering)
- [058. 从零复刻 Claude Code：Harness 构建学习笔记](ch05/058-claude-code-harness)
- [059. 从渐进式 SDD 到 Lattice Harness：AI Coding 团队级闭环实践](ch05/059-sdd-lattice-harness-ai-coding)
- [060. GSD 完胜 OpenSpec 和 Superpowers？源码拆完发现：三者防的是 context rot 的三道防线](ch05/060-gsd-openspec-superpowers-context-rot)
- [061. Engineering roles shift from developing code to managing AI](ch05/061-engineering-roles-shift-from-developing-code-to-managing-ai)
- [062. 清华大学：驾驭工程 (Harness Engineering) 研究报告](ch05/062-harness-engineering)
- [063. Agent Harness Skill 系统实战指南 — Reference/Action 类型、动态注入与 frontmatter 全解](ch05/063-agent-harness-skill-reference-action-frontmatter)
- [064. 全球首个完全AI编写的训练框架：面壁ForgeTrain速度反超英伟达Megatron，年底要把国产算力软件重写一遍](ch05/064-ai-forgetrain-megatron)
- [065. Thin Harness, Fat Skills：AI工程架构的本质](ch05/065-thin-harness-fat-skills-ai)
- [066. Skill Factory：三天手搓面向Harness设计的技能工厂](ch05/066-skill-factory-harness)
- [067. Harness 工程之道：Skill 原理与最佳实践](ch05/067-harness-skill)
- [068. 腾讯 TAB Harness 全链路实战：从 Vibe Coding 到 13 阶段接力赛](ch05/068-tab-harness-vibe-coding-13)
- [069. Karpathy AutoResearch Loop Cycle & Harness Optimization](ch05/069-karpathy-autoresearch-loop-cycle-harness-optimization)
- [070. Superpowers 深度解析：给 Claude Code 装上工程大脑](ch05/070-superpowers-claude-code)
- [071. 去哪儿网 AI Coding 研发平台实践：L0-L5 自动化分级 + Harness 四把锁 + QunarDevCenter + 天弦 QDO](ch05/071-ai-coding-l0-l5-harness-qunardevcenter-qdo)
- [072. Cloudflare Copy Fail Linux 内核漏洞应急响应](ch05/072-cloudflare-copy-fail-linux)
- [073. Build a serverless image editing agent with Amazon Bedrock AgentCore harness](ch05/073-build-a-serverless-image-editing-agent-with-amazon-bedrock-a)
- [074. Beyond Vibe Coding — Directed Generation as Design Methodology](ch05/074-beyond-vibe-coding-directed-generation-as-design-methodolo)
- [075. 快手 AgentX——推荐系统自我迭代的 Agent 驱动研发闭环](ch05/075-agentx-agent)
- [076. 场景营销前端 AI Coding — 从问题到方案](ch05/076-ai-coding)
- [077. Harness Engineering：AI 能在真正"出事会炸"的后端系统里写代码吗？](ch05/077-harness-engineering-ai)
- [078. Loss Function Development (LFD) — 损失函数开发与 /goal 循环（Elvis Sun）](ch05/078-loss-function-development-lfd-goal-elvis-sun)
- [079. DIPG 蚂蚁保 Host-Research-Verify 三 Agent 离线 verify 闭环：C 端 AIGC 工程化范式](ch05/079-dipg-host-research-verify-agent-verify-c-aigc)
- [080. Harness 工程实践复盘：100% Cache 命中的 Agent 怎么设计？](ch05/080-harness-100-cache-agent)
- [081. Harness Engineering 从理论到实战：行为正确性死结 + 上下文腐烂 + 可驾驭性 + Ashby 定律](ch05/081-harness-engineering-ashby)
- [082. Claude Harness 设计：Generator-Evaluator 架构与 Context Reset 演进](ch05/082-claude-harness-generator-evaluator-context-reset)
- [083. Harness Engineering 四根支柱与四要素架构](ch05/083-harness-engineering)
- [084. Harness不是目的，知识才是护城河 —— 一个AI工程交付团队的知识沉淀实践](ch05/084-harness-ai)
- [085. 墙比模型更重要：Stripe Minions + 字节 DeerFlow 2.0 + 蚂蚁支小助 的同结论](ch05/085-stripe-minions-deerflow-2-0)
- [086. Harness 工程可视化：Vibe Coding 中重建工程可控性](ch05/086-harness-vibe-coding)
- [087. 应用宝活动平台 Harness 工程实践——从对话式 AI Coding 到工程化系统](ch05/087-harness-ai-coding)
- [088. Superpowers 6.0 反作弊重写：reviewer 只读怀疑论者 + 上下文经济学 + progress ledger + model 纪律 —— 术哥源码级拆解 158 commits](ch05/088-superpowers-6-0-reviewer-progress-ledger-model)
- [089. Cloud Use 框架：Agent 作为云上受治理主体的四层模型](ch05/089-cloud-use-agent)
- [090. Code is cheap: Harness 方法论——水流理论、最小混沌单元与反 slop](ch05/090-code-is-cheap-harness-slop)
- [091. browser-use v0.13 Browser Harness：薄抽象层设计哲学](ch05/091-browser-use-v0-13-browser-harness)
- [092. HSCodeComp：阿里 ACL 2026 最佳资源论文——层级规则应用 Agent 基准](ch05/092-hscodecomp-acl-2026-agent)
- [093. MoonBit：面向 Agent 协作的编程语言（语言即工具链 + 形式化验证 + Wasm 沙箱）](ch05/093-moonbit-agent-wasm)
