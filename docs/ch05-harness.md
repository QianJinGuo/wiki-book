# Ch05 Harness 工程

> 给 Agent 装上骨架：Loop、Workflow、Dynamic Orchestration

> 本章收录 **126 篇**实体，按深度递增排列。

---

## 本章导航

| Level | 含义 | 篇数 |
|-------|------|------|
| ⭐ 入门 | 零基础可读 | 2 |
| ⭐⭐ 工程师 | 需编程基础 | 101 |
| ⭐⭐⭐ 专家 | 需ML基础 | 22 |
| ⭐⭐⭐⭐ 科学家 | 需研究背景 | 1 |

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
- [002. Spec Kit / OpenSpec / Superpowers 融合：棕地项目的三层Harness架构](ch05/002-spec-kit-openspec-superpowers-harness)
- [003. Loop Engineering:不再写提示词,而是设计替你写提示词的循环——先写刹车再写循环（19 来源深度合并：Addy Osmani / Boris Cherny+Peter Steinberger / 教科书 / 若飞 工程现场 / TechFarrari 批判 / 若飞 实用指南 / 爱范儿 科普批判 / AllenTang Karpathy 尺子 / winty 7架构中文主流视角 / AutoResearch 5 决策 / 三层结构 + 三款产品对比 + Ralph Loop + 准备度总表 / Shubham Saboo PM 视角 / 若飞 吴恩达三层Loop）](ch05/003-loop-engineering-19-addy-osmani-boris-cherny-pete)
- [004. Harness Engineering 综合论述：为什么 2026 年真正重要的是它（含 ECC 开源实现案例）](ch05/004-harness-engineering-2026-ecc)
- [005. Harness Engineering：AI 从"聪明"到"可靠"的第三代工程范式](ch05/005-harness-engineering-ai)
- [006. QQ音乐 Harness Engineering 实践（大仓多服务场景）](ch05/006-qq-harness-engineering)
- [007. Loop Engineering: 把反馈循环放进工程现场](ch05/007-loop-engineering)
- [008. 一文带你弄懂 AI 圈爆火的新概念：Harness Engineering](ch05/008-ai-harness-engineering)
- [009. 缝合怪识别与减法决策论：OpenSpec + Superpowers 融合方案下线记（2 周 3 次实测 + 3 个测试 + 加法传播学 + Plan Mode + Superpowers + ASD 最终方案）](ch05/009-openspec-superpowers-2-3-3-plan-mode-s)
- [010. 阿里工程师 Harness 工程化实践 (双案例合并)](ch05/010-harness)
- [011. Harness Engineering 综合性指南（ConardLi 系列 · 含 Beautiful Article 实证 + Reacticle 协议）](ch05/011-harness-engineering-conardli-beautiful-article-r)
- [012. 一文带你弄懂 AI 圈爆火的新概念：Harness Engineering](ch05/012-ai-harness-engineering)
- [013. 长周期 Agent 详解：从 Ralph Loop 到可接管 Harness](ch05/013-agent-ralph-loop-harness)
- [014. Spec as AIOS：AI-Native 全栈交付的抗熵架构（高德技术系列第二期）](ch05/014-spec-as-aios-ai-native)
- [015. Harness 到底是什么？看看 OpenClaw、Hermes、Claude Code 的演绎吧](ch05/015-harness-openclaw-hermes-claude-code)
- [016. Harness 之后：状态边界与失败闭环（若飞续篇）](ch05/016-harness)
- [017. 高德广告工程 Harness/SDD 体系演进：从\"氛围编程\"治理到 AI Native 全流程闭环](ch05/017-harness-sdd-ai-native)
- [018. 长时间运行应用的 Harness 设计](ch05/018-harness)
- [019. AI Native 时代研发组织何去何从](ch05/019-ai-native)
- [020. AI 生产开发工作流：OpenSpec 规范驱动 + Superpowers 工具链](ch05/020-ai-openspec-superpowers)
- [021. Martin Fowler AI 研发 Harness：非确定性承重层](ch05/021-martin-fowler-ai-harness)
- [022. Martin Fowler AI 研发提醒：Harness 承重层](ch05/022-martin-fowler-ai-harness)
- [023. AI Friendly 架构设计：后端系统面向无人值守开发时代的标准与路径](ch05/023-ai-friendly)
- [024. OpenSpec 规范驱动开发（SDD）框架 — proposal/design/tasks/specs 四类文档意图锁定](ch05/024-openspec-sdd-proposal-design-tasks-specs)
- [025. OpenAI Skills/Shell/Compaction：终结提示词工程的三位一体Agent原语](ch05/025-openai-skills-shell-compaction-agent)
- [026. Harness 模式 6-SubAgent 实战 — 17哥 versus 大模型评测平台（Git Submodule + Agent Handoff + Chrome DevTools MCP）](ch05/026-harness-6-subagent-17-versus-git-submodule-agent)
- [027. MAC（multi-agent-coding）：Skills + Hooks 两层 Harness —— 完全委托 0-20% 的解法](ch05/027-mac-multi-agent-coding-skills-hooks-harness-0-20)
- [028. Harness不是目的，知识才是护城河 —— 一个AI工程交付团队的知识沉淀实践](ch05/028-harness-ai)
- [029. wow-harness v3：AI 开发的治理协议](ch05/029-wow-harness-v3-ai)
- [030. 万字干货！Harness Engineering如何工程化落地？](ch05/030-harness-engineering)
- [031. Harness Engineering：AI工程的三次进化](ch05/031-harness-engineering-ai)
- [032. Harness Engineering 实战：AI Coding 率从 25% 提升至 90%](ch05/032-harness-engineering-ai-coding-25-90)
- [033. Coding Harness 工程本质：从 Pi 到 OpenClaw](ch05/033-coding-harness-pi-openclaw)
- [034. DeepSeek 成本迁移：从 KV Cache 到 Harness 的系统层](ch05/034-deepseek-kv-cache-harness)
- [035. 生产级 Harness 的 12 大组件以及主流框架对比](ch05/035-harness-12)
- [036. Cursor 复盘 Harness：模型决定能力上限，Harness 决定生产下限](ch05/036-cursor-harness-harness)
- [037. Harness Engineering 系统性解读](ch05/037-harness-engineering)
- [038. 王云鹤眼中的Harness：复杂优化问题，AGI灵魂争夺之战](ch05/038-harness-agi)
- [039. Agent生产级Harness工程指南](ch05/039-agent-harness)
- [040. OpenClacky — Prompt Cache 命中率 90% 的 Harness 工程实践](ch05/040-openclacky-prompt-cache-90-harness)
- [041. Martin Fowler 的 AI 研发提醒：非确定性进了研发链路，Harness 才真正开始承重](ch05/041-martin-fowler-ai-harness)
- [042. SkillOpt](ch05/042-skillopt)
- [043. Harness Engineering 概念框架](ch05/043-harness-engineering)
- [044. Harness Engineering 核心模式](ch05/044-harness-engineering)
- [045. 三器合一：gstack + Superpowers + OpenSpec 工程化 AI 编程实战](ch05/045-gstack-superpowers-openspec-ai)
- [046. 从AI Coding到Harness Engineering的端到端工程开发实践](ch05/046-ai-coding-harness-engineering)
- [047. Is Grep All You Need? — 检索 × Harness × 交付方式耦合三元组（PwC 论文 arXiv 2605.15184 解读）](ch05/047-is-grep-all-you-need-harness-pwc-arxiv-2605-151)
- [048. SSD Spec 驱动开发实战：从四条约束到 ASD Harness 的工程落地](ch05/048-ssd-spec-asd-harness)
- [049. OpenSpec 四步法深度复盘：流程完整 ≠ 代码正确](ch05/049-openspec)
- [050. 面向复杂算法任务的 AI Agent：高德 Long-Running Harness 架构与 Uplift 模型迭代应用](ch05/050-ai-agent-long-running-harness-uplift)
- [051. Harness Engineering 系统梳理](ch05/051-harness-engineering)
- [052. Spec-Driven Development (SDD) 全面总结：从5人7天案例到方法论全集](ch05/052-spec-driven-development-sdd-5-7)
- [053. Harness Engineering：AI 能在真正\"出事会炸\"的后端系统里写代码吗？](ch05/053-harness-engineering-ai)
- [054. 刚刚，翁荔博客又上新：通过Harness工程实现AI自我提升](ch05/054-harness-ai)
- [055. Loop Engineering 实践指南：CodeBuddy 中的自主循环系统 — Inner/Outer Loop + /goal + /loop + Team 对抗验证 + 状态外置](ch05/055-loop-engineering-codebuddy-inner-outer-loop-goal)
- [056. Superpowers 6.0 SDD 评审重写：文件交接 + 多平台支持](ch05/056-superpowers-6-0-sdd)
- [057. Devin Fusion: 多模型路由 Harness 实现 35% 成本降低](ch05/057-devin-fusion-harness-35)
- [058. Harness Engineering：AI 能在真正\"出事会炸\"的后端系统里写代码吗？](ch05/058-harness-engineering-ai)
- [059. Trellis vs Superpowers 源码对比：不同抽象层的工程框架](ch05/059-trellis-vs-superpowers)
- [060. OMEGA: 面向多机器人协作的具身Agent Harness](ch05/060-omega-agent-harness)
- [061. 腾讯 AI Team 知识沉淀体系（Harness Engineering 实践）](ch05/061-ai-team-harness-engineering)
- [062. Loop Engineering 会是 AI 的下个关键词吗？](ch05/062-loop-engineering-ai)
- [063. 生产级 Agent 全景：架构、Harness 工程、组织与人才](ch05/063-agent-harness)
- [064. Harness Engineering 实践指南：10 步路线图 + 8 失败模式 + 设计 Checklist — 系列第 15 篇收官](ch05/064-harness-engineering-10-8-checklist-15)
- [065. 基于 Harness + SDD + 多仓管理模式的 AI 全栈开发实践｜得物技术](ch05/065-harness-sdd-ai)
- [066. 腾讯CDN LEGO Harness Engineering实战](ch05/066-cdn-lego-harness-engineering)
- [067. 从零复刻 Claude Code：Harness 构建学习笔记](ch05/067-claude-code-harness)
- [068. 从 Autoresearch 到 Better-Harness：自动优化真正难在评价信号](ch05/068-autoresearch-better-harness)
- [069. Harness Engineering 的未来——什么会消失，什么不会](ch05/069-harness-engineering)
- [070. Loop Engineering 系统框架：四次跃迁、五要素模型、成本公式与三大风险](ch05/070-loop-engineering)
- [071. 如何利用 Harness 一句话交付产品功能](ch05/071-harness)
- [072. Harness Engineering for Self-Improvement — 翁荔 Lilian Weng 系统梳理 Harness 自我提升研究全景](ch05/072-harness-engineering-for-self-improvement-lilian-weng-h)
- [073. Engineering roles shift from developing code to managing AI](ch05/073-engineering-roles-shift-from-developing-code-to-managing-ai)
- [074. 清华大学：驾驭工程 (Harness Engineering) 研究报告](ch05/074-harness-engineering)
- [075. Agent Harness Skill 系统实战指南 — Reference/Action 类型、动态注入与 frontmatter 全解](ch05/075-agent-harness-skill-reference-action-frontmatter)
- [076. 全球首个完全AI编写的训练框架：面壁ForgeTrain速度反超英伟达Megatron，年底要把国产算力软件重写一遍](ch05/076-ai-forgetrain-megatron)
- [077. Claude Code 多 Agent Harness 源码拆解：留纸条、抠上下文、抠缓存、捆手脚](ch05/077-claude-code-agent-harness)
- [078. Thin Harness, Fat Skills：AI工程架构的本质](ch05/078-thin-harness-fat-skills-ai)
- [079. GSD 完胜 OpenSpec 和 Superpowers？源码拆完发现：三者防的是 context rot 的三道防线](ch05/079-gsd-openspec-superpowers-context-rot)
- [080. Skill Factory：三天手搓面向Harness设计的技能工厂](ch05/080-skill-factory-harness)
- [081. Browser Harness Github](ch05/081-browser-harness-github)
- [082. Lilian Weng Harness Engineering for Self-Improvement — RSI 从 Harness 开始](ch05/082-lilian-weng-harness-engineering-for-self-improvement-rsi)
- [083. Harness 工程之道：Skill 原理与最佳实践](ch05/083-harness-skill)
- [084. Superpowers 深度解析：给 Claude Code 装上工程大脑](ch05/084-superpowers-claude-code)
- [085. AI 原生组织方法论：叶小钗的完整框架与实战](ch05/085-ai)
- [086. 腾讯 TAB Harness 全链路实战：从 Vibe Coding 到 13 阶段接力赛](ch05/086-tab-harness-vibe-coding-13)
- [087. 12 个 Agent 工程设计底层逻辑：脚手架 vs 承重墙](ch05/087-12-agent-vs)
- [088. Karpathy AutoResearch Loop Cycle & Harness Optimization](ch05/088-karpathy-autoresearch-loop-cycle-harness-optimization)
- [089. Cloudflare Copy Fail Linux 内核漏洞应急响应](ch05/089-cloudflare-copy-fail-linux)
- [090. Harness 工程 2026 年度调研](ch05/090-harness-2026)
- [091. 从Vibe Coding到Harness—— 一套大仓AI工程化实战](ch05/091-vibe-coding-harness-ai)
- [092. Build a serverless image editing agent with Amazon Bedrock AgentCore harness](ch05/092-build-a-serverless-image-editing-agent-with-amazon-bedrock-a)
- [093. Beyond Vibe Coding — Directed Generation as Design Methodology](ch05/093-beyond-vibe-coding-directed-generation-as-design-methodolo)
- [094. Databricks CEO用3000名程序员真实任务测试GLM 5.2 — Harness选择比模型更重要](ch05/094-databricks-ceo-3000-glm-5-2-harness)
- [095. 去哪儿网 AI Coding 研发平台实践：L0-L5 自动化分级 + Harness 四把锁 + QunarDevCenter + 天弦 QDO](ch05/095-ai-coding-l0-l5-harness-qunardevcenter-qdo)
- [096. 快手 AgentX——推荐系统自我迭代的 Agent 驱动研发闭环](ch05/096-agentx-agent)
- [097. 规格驱动开发与 Harness](ch05/097-harness)
- [098. 场景营销前端 AI Coding — 从问题到方案](ch05/098-ai-coding)
- [099. Harness Engineering Deletable Worksite Ruofei](ch05/099-harness-engineering-deletable-worksite-ruofei)
- [100. 开启Harness Engineering探索之旅](ch05/100-harness-engineering)
- [101. 从渐进式 SDD 到 Lattice Harness：AI Coding 团队级闭环实践](ch05/101-sdd-lattice-harness-ai-coding)
- [102. 开启Harness Engineering探索之旅](ch05/102-harness-engineering)
- [103. 从 Vibe Coding 到 Harness Engineering：小米 JDK21 升级中可控演进的 AI 工程实践](ch05/103-vibe-coding-harness-engineering-jdk21-ai)
- [104. Harness Engineering：AI 能在真正"出事会炸"的后端系统里写代码吗？](ch05/104-harness-engineering-ai)
- [105. Loss Function Development (LFD) — 损失函数开发与 /goal 循环（Elvis Sun）](ch05/105-loss-function-development-lfd-goal-elvis-sun)
- [106. Harness 工程实践复盘：100% Cache 命中的 Agent 怎么设计？](ch05/106-harness-100-cache-agent)
- [107. DIPG 蚂蚁保 Host-Research-Verify 三 Agent 离线 verify 闭环：C 端 AIGC 工程化范式](ch05/107-dipg-host-research-verify-agent-verify-c-aigc)
- [108. Harness Engineering 从理论到实战：行为正确性死结 + 上下文腐烂 + 可驾驭性 + Ashby 定律](ch05/108-harness-engineering-ashby)
- [109. Harness Engineering 四根支柱与四要素架构](ch05/109-harness-engineering)
- [110. Claude Harness 设计：Generator-Evaluator 架构与 Context Reset 演进](ch05/110-claude-harness-generator-evaluator-context-reset)
- [111. Harness不是目的，知识才是护城河 —— 一个AI工程交付团队的知识沉淀实践](ch05/111-harness-ai)
- [112. 墙比模型更重要：Stripe Minions + 字节 DeerFlow 2.0 + 蚂蚁支小助 的同结论](ch05/112-stripe-minions-deerflow-2-0)
- [113. Harness 工程可视化：Vibe Coding 中重建工程可控性](ch05/113-harness-vibe-coding)
- [114. 为什么 2026 年真正重要的是 Harness Engineering？](ch05/114-2026-harness-engineering)
- [115. 知识沉淀是护城河](ch05/115-page-115)
- [116. 应用宝活动平台 Harness 工程实践——从对话式 AI Coding 到工程化系统](ch05/116-harness-ai-coding)
- [117. Better-Harness：Agent Harness 自动优化方法论](ch05/117-better-harness-agent-harness)
- [118. Cloud Use 框架：Agent 作为云上受治理主体的四层模型](ch05/118-cloud-use-agent)
- [119. Superpowers 6.0 反作弊重写：reviewer 只读怀疑论者 + 上下文经济学 + progress ledger + model 纪律 —— 术哥源码级拆解 158 commits](ch05/119-superpowers-6-0-reviewer-progress-ledger-model)
- [120. Code is cheap: Harness 方法论——水流理论、最小混沌单元与反 slop](ch05/120-code-is-cheap-harness-slop)
- [121. 阿里 Harness 工程实战：Agent 自主迭代 17 小时优化业务 Agent](ch05/121-harness-agent-17-agent)
- [122. MoonBit：面向 Agent 协作的编程语言（语言即工具链 + 形式化验证 + Wasm 沙箱）](ch05/122-moonbit-agent-wasm)
- [123. browser-use v0.13 Browser Harness：薄抽象层设计哲学](ch05/123-browser-use-v0-13-browser-harness)
- [124. 阿里数据研发 Harness Engineering：NL2SQL × Multi-Agent × 知识工程](ch05/124-harness-engineering-nl2sql-multi-agent)
- [125. 翁荔再写万字长文：AI自我改进，先从Harness开始](ch05/125-ai-harness)
- [126. Harness进化论文 — M⋆记忆程序进化与AutoHarness动作约束](ch05/126-harness-m-autoharness)
