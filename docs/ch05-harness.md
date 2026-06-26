# Ch05 Harness 工程

> 给 Agent 装上骨架：Loop、Workflow、Dynamic Orchestration

> 本章收录 **85 篇**实体，按深度递增排列。

---

## 本章导航

| Level | 含义 | 篇数 |
|-------|------|------|
| ⭐ 入门 | 零基础可读 | 1 |
| ⭐⭐ 工程师 | 需编程基础 | 70 |
| ⭐⭐⭐ 专家 | 需ML基础 | 13 |
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

- [001. Impeccable](../ch05-001-impeccable)
- [002. Loop Engineering:不再写提示词,而是设计替你写提示词的循环——先写刹车再写循环（13 来源深度合并：Addy Osmani / Boris Cherny+Peter Steinberger / 教科书 / 若飞 工程现场 / TechFarrari 批判 / 若飞 实用指南 / 爱范儿 科普批判 / AllenTang Karpathy 尺子 / winty 7架构中文主流视角 / AutoResearch 5 决策 / 三层结构 + 三款产品对比 + Ralph Loop + 准备度总表 / Shubham Saboo PM 视角）](../ch05-002-loop-engineering-不再写提示词-而是设计替你写提示词的循环-先写刹车再写循环-13-来源深度合并-ad)
- [003. QQ音乐 Harness Engineering 实践（大仓多服务场景）](../ch05-003-qq音乐-harness-engineering-实践-大仓多服务场景)
- [004. Loop Engineering: 把反馈循环放进工程现场](../ch05-004-loop-engineering-把反馈循环放进工程现场)
- [005. 一文带你弄懂 AI 圈爆火的新概念：Harness Engineering](../ch05-005-一文带你弄懂-ai-圈爆火的新概念-harness-engineering)
- [006. Harness Engineering 综合论述：为什么 2026 年真正重要的是它（含 ECC 开源实现案例）](../ch05-006-harness-engineering-综合论述-为什么-2026-年真正重要的是它-含-ecc-开源实现案例)
- [007. 缝合怪识别与减法决策论：OpenSpec + Superpowers 融合方案下线记（2 周 3 次实测 + 3 个测试 + 加法传播学 + Plan Mode + Superpowers + ASD 最终方案）](../ch05-007-缝合怪识别与减法决策论-openspec-superpowers-融合方案下线记-2-周-3-次实测-3-个测试)
- [008. 阿里工程师 Harness 工程化实践 (双案例合并)](../ch05-008-阿里工程师-harness-工程化实践-双案例合并)
- [009. Harness Engineering 综合性指南（ConardLi 系列 · 含 Beautiful Article 实证 + Reacticle 协议）](../ch05-009-harness-engineering-综合性指南-conardli-系列-含-beautiful-article)
- [010. Harness Engineering：AI 从"聪明"到"可靠"的第三代工程范式](../ch05-010-harness-engineering-ai-从-聪明-到-可靠-的第三代工程范式)
- [011. 一文带你弄懂 AI 圈爆火的新概念：Harness Engineering](../ch05-011-一文带你弄懂-ai-圈爆火的新概念-harness-engineering)
- [012. 长周期 Agent 详解：从 Ralph Loop 到可接管 Harness](../ch05-012-长周期-agent-详解-从-ralph-loop-到可接管-harness)
- [013. Spec as AIOS：AI-Native 全栈交付的抗熵架构（高德技术系列第二期）](../ch05-013-spec-as-aios-ai-native-全栈交付的抗熵架构-高德技术系列第二期)
- [014. Harness 到底是什么？看看 OpenClaw、Hermes、Claude Code 的演绎吧](../ch05-014-harness-到底是什么-看看-openclaw-hermes-claude-code-的演绎吧)
- [015. Harness 之后：状态边界与失败闭环（若飞续篇）](../ch05-015-harness-之后-状态边界与失败闭环-若飞续篇)
- [016. 高德广告工程 Harness/SDD 体系演进：从\"氛围编程\"治理到 AI Native 全流程闭环](../ch05-016-高德广告工程-harness-sdd-体系演进-从-氛围编程-治理到-ai-native-全流程闭环)
- [017. harness-design-long-running-apps](../ch05-017-harness-design-long-running-apps)
- [018. AI Native 时代研发组织何去何从](../ch05-018-ai-native-时代研发组织何去何从)
- [019. ai-production-development-workflow-openspec-superpowers-gstack](../ch05-019-ai-production-development-workflow-openspec-superpowers-gsta)
- [020. Martin Fowler AI 研发 Harness：非确定性承重层](../ch05-020-martin-fowler-ai-研发-harness-非确定性承重层)
- [021. Martin Fowler AI 研发提醒：Harness 承重层](../ch05-021-martin-fowler-ai-研发提醒-harness-承重层)
- [022. AI Friendly 架构设计：后端系统面向无人值守开发时代的标准与路径](../ch05-022-ai-friendly-架构设计-后端系统面向无人值守开发时代的标准与路径)
- [023. OpenSpec 规范驱动开发（SDD）框架 — proposal/design/tasks/specs 四类文档意图锁定](../ch05-023-openspec-规范驱动开发-sdd-框架-proposal-design-tasks-specs-四类文档意图锁)
- [024. OpenAI Skills/Shell/Compaction：终结提示词工程的三位一体Agent原语](../ch05-024-openai-skills-shell-compaction-终结提示词工程的三位一体agent原语)
- [025. Harness 模式 6-SubAgent 实战 — 17哥 versus 大模型评测平台（Git Submodule + Agent Handoff + Chrome DevTools MCP）](../ch05-025-harness-模式-6-subagent-实战-17哥-versus-大模型评测平台-git-submodule)
- [026. MAC（multi-agent-coding）：Skills + Hooks 两层 Harness —— 完全委托 0-20% 的解法](../ch05-026-mac-multi-agent-coding-skills-hooks-两层-harness-完全委托-0)
- [027. Harness不是目的，知识才是护城河 —— 一个AI工程交付团队的知识沉淀实践](../ch05-027-harness不是目的-知识才是护城河-一个ai工程交付团队的知识沉淀实践)
- [028. wow-harness v3：AI 开发的治理协议](../ch05-028-wow-harness-v3-ai-开发的治理协议)
- [029. 万字干货！Harness Engineering如何工程化落地？](../ch05-029-万字干货-harness-engineering如何工程化落地)
- [030. Harness Engineering：AI工程的三次进化](../ch05-030-harness-engineering-ai工程的三次进化)
- [031. Harness Engineering 实战：AI Coding 率从 25% 提升至 90%](../ch05-031-harness-engineering-实战-ai-coding-率从-25-提升至-90)
- [032. Coding Harness 工程本质：从 Pi 到 OpenClaw](../ch05-032-coding-harness-工程本质-从-pi-到-openclaw)
- [033. 生产级 Harness 的 12 大组件以及主流框架对比](../ch05-033-生产级-harness-的-12-大组件以及主流框架对比)
- [034. DeepSeek 成本迁移：从 KV Cache 到 Harness 的系统层](../ch05-034-deepseek-成本迁移-从-kv-cache-到-harness-的系统层)
- [035. Cursor 复盘 Harness：模型决定能力上限，Harness 决定生产下限](../ch05-035-cursor-复盘-harness-模型决定能力上限-harness-决定生产下限)
- [036. harness-engineering-systematic-explainer](../ch05-036-harness-engineering-systematic-explainer)
- [037. 王云鹤眼中的Harness：复杂优化问题，AGI灵魂争夺之战](../ch05-037-王云鹤眼中的harness-复杂优化问题-agi灵魂争夺之战)
- [038. Agent生产级Harness工程指南](../ch05-038-agent生产级harness工程指南)
- [039. OpenClacky — Prompt Cache 命中率 90% 的 Harness 工程实践](../ch05-039-openclacky-prompt-cache-命中率-90-的-harness-工程实践)
- [040. Martin Fowler 的 AI 研发提醒：非确定性进了研发链路，Harness 才真正开始承重](../ch05-040-martin-fowler-的-ai-研发提醒-非确定性进了研发链路-harness-才真正开始承重)
- [041. Harness Engineering 概念框架](../ch05-041-harness-engineering-概念框架)
- [042. Harness Engineering 核心模式](../ch05-042-harness-engineering-核心模式)
- [043. 三器合一：gstack + Superpowers + OpenSpec 工程化 AI 编程实战](../ch05-043-三器合一-gstack-superpowers-openspec-工程化-ai-编程实战)
- [044. Is Grep All You Need? — 检索 × Harness × 交付方式耦合三元组（PwC 论文 arXiv 2605.15184 解读）](../ch05-044-is-grep-all-you-need-检索-harness-交付方式耦合三元组-pwc-论文-arxi)
- [045. SSD Spec 驱动开发实战：从四条约束到 ASD Harness 的工程落地](../ch05-045-ssd-spec-驱动开发实战-从四条约束到-asd-harness-的工程落地)
- [046. OpenSpec 四步法深度复盘：流程完整 ≠ 代码正确](../ch05-046-openspec-四步法深度复盘-流程完整-代码正确)
- [047. 面向复杂算法任务的 AI Agent：高德 Long-Running Harness 架构与 Uplift 模型迭代应用](../ch05-047-面向复杂算法任务的-ai-agent-高德-long-running-harness-架构与-uplift-模型迭代应用)
- [048. SkillOpt](../ch05-048-skillopt)
- [049. Harness Engineering 系统梳理](../ch05-049-harness-engineering-系统梳理)
- [050. Harness Engineering：AI 能在真正\"出事会炸\"的后端系统里写代码吗？](../ch05-050-harness-engineering-ai-能在真正-出事会炸-的后端系统里写代码吗)
- [051. Loop Engineering 实践指南：CodeBuddy 中的自主循环系统 — Inner/Outer Loop + /goal + /loop + Team 对抗验证 + 状态外置](../ch05-051-loop-engineering-实践指南-codebuddy-中的自主循环系统-inner-outer-loop)
- [052. Harness Engineering：AI 能在真正\"出事会炸\"的后端系统里写代码吗？](../ch05-052-harness-engineering-ai-能在真正-出事会炸-的后端系统里写代码吗)
- [053. 腾讯 AI Team 知识沉淀体系（Harness Engineering 实践）](../ch05-053-腾讯-ai-team-知识沉淀体系-harness-engineering-实践)
- [054. Harness Engineering 实践指南：10 步路线图 + 8 失败模式 + 设计 Checklist — 系列第 15 篇收官](../ch05-054-harness-engineering-实践指南-10-步路线图-8-失败模式-设计-checklist-系)
- [055. 基于 Harness + SDD + 多仓管理模式的 AI 全栈开发实践｜得物技术](../ch05-055-基于-harness-sdd-多仓管理模式的-ai-全栈开发实践-得物技术)
- [056. 腾讯CDN LEGO Harness Engineering实战](../ch05-056-腾讯cdn-lego-harness-engineering实战)
- [057. 准备开一个新坑从零复刻一个-claude-codenn目标是在这个过程中和大家一起学习-claude-code-的-harness-是如何做的nnclaude-](../ch05-057-准备开一个新坑从零复刻一个-claude-codenn目标是在这个过程中和大家一起学习-claude-code-的-ha)
- [058. 从 Autoresearch 到 Better-Harness：自动优化真正难在评价信号](../ch05-058-从-autoresearch-到-better-harness-自动优化真正难在评价信号)
- [059. Engineering roles shift from developing code to managing AI](../ch05-059-engineering-roles-shift-from-developing-code-to-managing-ai)
- [060. 清华大学：驾驭工程 (Harness Engineering) 研究报告](../ch05-060-清华大学-驾驭工程-harness-engineering-研究报告)
- [061. 全球首个完全AI编写的训练框架：面壁ForgeTrain速度反超英伟达Megatron，年底要把国产算力软件重写一遍](../ch05-061-全球首个完全ai编写的训练框架-面壁forgetrain速度反超英伟达megatron-年底要把国产算力软件重写一遍)
- [062. Claude Code 多 Agent Harness 源码拆解：留纸条、抠上下文、抠缓存、捆手脚](../ch05-062-claude-code-多-agent-harness-源码拆解-留纸条-抠上下文-抠缓存-捆手脚)
- [063. Thin Harness, Fat Skills：AI工程架构的本质](../ch05-063-thin-harness-fat-skills-ai工程架构的本质)
- [064. Superpowers 6.0 SDD 评审重写：文件交接 + 多平台支持](../ch05-064-superpowers-6-0-sdd-评审重写-文件交接-多平台支持)
- [065. Skill Factory：三天手搓面向Harness设计的技能工厂](../ch05-065-skill-factory-三天手搓面向harness设计的技能工厂)
- [066. browser harness github](../ch05-066-browser-harness-github)
- [067. Superpowers 深度解析：给 Claude Code 装上工程大脑](../ch05-067-superpowers-深度解析-给-claude-code-装上工程大脑)
- [068. 12 个 Agent 工程设计底层逻辑：脚手架 vs 承重墙](../ch05-068-12-个-agent-工程设计底层逻辑-脚手架-vs-承重墙)
- [069. Cloudflare Copy Fail Linux 内核漏洞应急响应](../ch05-069-cloudflare-copy-fail-linux-内核漏洞应急响应)
- [070. Harness Engineering Deletable Worksite Ruofei](../ch05-070-harness-engineering-deletable-worksite-ruofei)
- [071. Harness Engineering 的未来——什么会消失，什么不会](../ch05-071-harness-engineering-的未来-什么会消失-什么不会)
- [072. Harness Engineering：AI 能在真正"出事会炸"的后端系统里写代码吗？](../ch05-072-harness-engineering-ai-能在真正-出事会炸-的后端系统里写代码吗)
- [073. Loss Function Development (LFD) — 损失函数开发与 /goal 循环（Elvis Sun）](../ch05-073-loss-function-development-lfd-损失函数开发与-goal-循环-elvis-sun)
- [074. Harness 工程实践复盘：100% Cache 命中的 Agent 怎么设计？](../ch05-074-harness-工程实践复盘-100-cache-命中的-agent-怎么设计)
- [075. DIPG 蚂蚁保 Host-Research-Verify 三 Agent 离线 verify 闭环：C 端 AIGC 工程化范式](../ch05-075-dipg-蚂蚁保-host-research-verify-三-agent-离线-verify-闭环-c-端-aigc)
- [076. Harness Engineering 从理论到实战：行为正确性死结 + 上下文腐烂 + 可驾驭性 + Ashby 定律](../ch05-076-harness-engineering-从理论到实战-行为正确性死结-上下文腐烂-可驾驭性-ashby-定律)
- [077. Harness Engineering 四根支柱与四要素架构](../ch05-077-harness-engineering-四根支柱与四要素架构)
- [078. Harness不是目的，知识才是护城河 —— 一个AI工程交付团队的知识沉淀实践](../ch05-078-harness不是目的-知识才是护城河-一个ai工程交付团队的知识沉淀实践)
- [079. 墙比模型更重要：Stripe Minions + 字节 DeerFlow 2.0 + 蚂蚁支小助 的同结论](../ch05-079-墙比模型更重要-stripe-minions-字节-deerflow-2-0-蚂蚁支小助-的同结论)
- [080. Claude Harness 设计：Generator-Evaluator 架构与 Context Reset 演进](../ch05-080-claude-harness-设计-generator-evaluator-架构与-context-reset-演进)
- [081. Harness 工程可视化：Vibe Coding 中重建工程可控性](../ch05-081-harness-工程可视化-vibe-coding-中重建工程可控性)
- [082. 知识沉淀是护城河](../ch05-082-知识沉淀是护城河)
- [083. Better-Harness：Agent Harness 自动优化方法论](../ch05-083-better-harness-agent-harness-自动优化方法论)
- [084. Superpowers 6.0 反作弊重写：reviewer 只读怀疑论者 + 上下文经济学 + progress ledger + model 纪律 —— 术哥源码级拆解 158 commits](../ch05-084-superpowers-6-0-反作弊重写-reviewer-只读怀疑论者-上下文经济学-progress-le)
- [085. Harness进化论文 — M⋆记忆程序进化与AutoHarness动作约束](../ch05-085-harness进化论文-m-记忆程序进化与autoharness动作约束)
