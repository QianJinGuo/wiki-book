# Harness Engineering 系统梳理

> 📊 Level ⭐⭐⭐ | 10.2KB

> 本页原内容在 2026-09-07 质量闭环中判定为 **dup-0.75**，已按导航页（MOC）重建；
> 原文备份见 `_archive/hub-rewrite-2026-09-07/harness-engineering-systematic-framework.md`，一手来源仍见下方 sources。

## 机制与论文
- [Agent Harness Engineering: A Survey](https://github.com/QianJinGuo/wiki-public/blob/main/entities/agent-harness-engineering-survey-2026.md) — harness工程survey
- [Agent Harness 架构设计与实现：生产级 Agent 系统落地指南](https://github.com/QianJinGuo/wiki-public/blob/main/entities/agent-harness-architecture-design-production-guide.md) — 七层金字塔生产指南
- [Harness 到底是什么？看看 OpenClaw、Hermes、Claude Code 的演绎吧](https://github.com/QianJinGuo/wiki-public/blob/main/entities/harness-engineering-7-layers-openclaw-hermes-claude-code-p1anu.md) — 三框架演绎七层模型12857字rv9
- [Hermes Agent 深度解析（阿里云/飞樰）](https://github.com/QianJinGuo/wiki-public/blob/main/entities/hermes-agent-deep-dive.md) — 自进化内外双路径+四维工程7934字rv9全版
- [Hugging Face AI Agent 术语表：Model / Agent / Scaffolding / Harness / Context Engineering / Policy / Tool / Skill / Sub-agent 完整区分](https://github.com/QianJinGuo/wiki-public/blob/main/entities/huggingface-ai-agent-glossary-model-scaffolding-harness-tool-skill-subagent.md) — HF术语表16399字：Scaffolding/Harness/Policy辨析
- [Harness Engineering for Self-Improvement — 翁荔 Lilian Weng 系统梳理 Harness 自我提升研究全景](https://github.com/QianJinGuo/wiki-public/blob/main/entities/harness-engineering-self-improvement-survey-lilian-weng.md) — 翁荔RSI全景：ACE→MCE→DGM谱系
- [Agentic Loop Engineering 工程手册：17 种 Loop 工程化技术的可复现实证框架](https://github.com/QianJinGuo/wiki-public/blob/main/entities/agentic-loop-engineering-handbook-empirical-framework.md) — 17种loop实证
- [生产级 Harness 的 12 大组件以及主流框架对比](https://github.com/QianJinGuo/wiki-public/blob/main/entities/production-harness-12-components-framework-comparison.md) — 12组件+OS类比：TerminalBench 30名外→第5名9722字rv9
- [王云鹤眼中的Harness：复杂优化问题，AGI灵魂争夺之战](https://github.com/QianJinGuo/wiki-public/blob/main/entities/wangyunhe-harness-optimization-agentsoul.md) — Agent=Models+Harness联合优化
- [Is Grep All You Need? — 检索 × Harness × 交付方式耦合三元组（PwC 论文 arXiv 2605.15184 解读）](https://github.com/QianJinGuo/wiki-public/blob/main/entities/is-grep-all-you-need-pwc-retrieval-harness-coupling.md) — grep vs vector×harness×交付耦合三元组rv9
- [Hidden Technical Debt of AI Systems: Agent Harness](https://github.com/QianJinGuo/wiki-public/blob/main/entities/hidden-technical-debt-agent-harness.md) — Harness层五维技术债
- [AI Coding 的底层框架：一切优化都是在对抗熵增——信息论视角](https://github.com/QianJinGuo/wiki-public/blob/main/entities/ai-coding-entropy-framework-baidu-geek-2026.md) — 信息论统一框架
- [深入理解 Claude Code 源码中的 Agent Harness 构建之道](https://github.com/QianJinGuo/wiki-public/blob/main/entities/深入理解-claude-code-源码中的-agent-harness-构建之道.md) — 16095字源码8步循环
- [刚刚，翁荔博客又上新：通过Harness工程实现AI自我提升](https://github.com/QianJinGuo/wiki-public/blob/main/entities/刚刚翁荔博客又上新通过harness工程实现ai自我提升.md) — RSI路径与七挑战

## 工程实践
- 'Harness Engineering：AI 从 — 六层架构+七大反模式+分级决策树19712字rv9
- [Claude Harness 设计：Generator-Evaluator 架构与 Context Reset 演进](https://github.com/QianJinGuo/wiki-public/blob/main/entities/harness-generator-evaluator-anthropic.md) — Generator-Evaluator+context reset 10329字rv9全版
- [深度拆解 Claude Code：12 个可复用的 Agentic Harness 设计模式](https://github.com/QianJinGuo/wiki-public/blob/main/entities/claude-code-agentic-harness-design-patterns.md) — 12个harness模式
- [Harness Engineering 综合性指南（ConardLi 系列 · 含 Beautiful Article 实证 + Reacticle 协议）](https://github.com/QianJinGuo/wiki-public/blob/main/entities/harness-engineering-comprehensive-guide-conardli.md) — ConardLi六层架构14634字rv9
- [Impeccable：把 AI 前端设计变成可检查的工作流 — 33.4k Star 开源项目深度分析](https://github.com/QianJinGuo/wiki-public/blob/main/entities/impeccable-frontend-design-skill-harness-vibecoder.md) — Impeccable四层架构9210字rv9全版
- [Subagents 详解：Claude Code 如何避免上下文污染](https://github.com/QianJinGuo/wiki-public/blob/main/entities/subagents-详解claude-code-如何避免上下文污染.md) — 上下文卫生subagent详解
- [超级个体到超级组织：李志飞 CodeBanana 组织转型实践](https://github.com/QianJinGuo/wiki-public/blob/main/entities/super-individual-to-super-organization-tencent-research-2026.md) — 超级组织转型CodeBanana
- [CLAUDE.md](https://github.com/QianJinGuo/wiki-public/blob/main/entities/claude-code-source-leak-lifecycle-analysis.md) — 8步生命周期10k
- [QQ音乐 Harness Engineering 实践（大仓多服务场景）](https://github.com/QianJinGuo/wiki-public/blob/main/entities/qq-music-harness-engineering-monorepo-microservices.md) — 代码产出=AI能力×上下文质量（乘法）15606字rv9
- [Harness 减法工程——删掉 61% 之后什么该留（L0-L3 四层归属）](https://github.com/QianJinGuo/wiki-public/blob/main/entities/tdsql-harness-subtraction-l0-l3-tencent-2026-08-06.md) — 减法工程L0-L3四层归属

## 深度分析

### 软控制与硬控制：为什么 Harness 必须是系统工程而非调提示词
这门课程解读的第一性原理是：模型会写代码，不代表它知道文件在哪里；测试脚本存在，不代表它会主动运行；规则写在文档里，不代表它会稳定遵守。这类失败是行动链路上的结构性断点，不是"把提示词写好一点"能解决的。AGENTS.md 式的自然语言规则属于软控制——有概率性，模型可能不照做；系统性的 Harness 则把同样的意图转化为硬控制：在 completion 前强制核对测试结果、用工具权限与沙箱拦住高风险动作、把进度固化成磁盘工件。从"希望它这样做"升级为"系统默认约束它这样做"，正是 Harness 工程区别于提示词调优的分水岭，也是 [Harness Engineering Framework](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/harness-engineering-framework.md) 一类框架的核心命题。

### 测量反馈回路：Harness 是持续演进的闭环，不是一次性配置
七环节控制回路（人定目标 → Guides 前馈 → Reason-Act-Observe 执行 → Tools → Sensors → State → Harness update）的要害在最后一环：Sensors 捕捉到的偏差必须回流，把每次失败写进规则、工具、测试或文档，让同类错误更难重复。这解释了两件事：其一，Harness 无法一次设计到位——断点只有在真实任务中暴露出来，才能被工程化地补成下一轮的默认能力；其二，把海量规则塞进单体 AGENTS.md 的做法注定失败——静态规则文件会随项目演化快速腐烂，而闭环靠测量驱动规则的新陈代谢。渐进披露的信息系统（常驻文件当地图、细节文档按需读取、测试与日志对 Agent 直接可见）则是这条回路在上下文侧的配套。

### 1.6% 与 98.4%：复杂度主体在确定性基础设施一侧
对 Claude Code v2.1.88 共 51.2 万行 TypeScript 源码的系统分析给出：AI 决策逻辑仅占 1.6%，其余 98.4% 是权限网关、上下文管理、工具路由、错误恢复等确定性工程基础设施。这组数字常被误读成"模型只贡献 1.6% 的能力"，实际它刻画的是产品复杂度的分布：让一个概率模型稳定可用，工作量几乎全部落在确定性的外壳上。LangChain 只调整 harness（系统提示、工具、中间件、推理模式）就把 Terminal Bench 2.0 从 52.8 提升到 66.5、模型一行未换，从反面印证同一结论：harness 是当前 Agent 能力上限的主要杠杆。这与"一切优化都是在对抗熵增"的信息论视角互相呼应，参见 [Ai Coding Entropy Framework Baidu Geek 2026](https://github.com/QianJinGuo/wiki-public/blob/main/entities/ai-coding-entropy-framework-baidu-geek-2026.md)。

### Evaluator 的递归问题：验证者自身也需要 Harness
Generator/Evaluator 分工的薄弱点在于 Evaluator 天然不客观：Anthropic 观察到模型开箱即用并不是合格的 QA——它会发现真实问题，随后又说服自己这些问题不重要并放行，且倾向浅层测试而不主动探测边界。因此可靠性不能靠"换另一个模型"获得，只能靠"另一个被约束的验证流程"：明确的验收标准、操作真实环境的能力、把判断写成可复盘的 evidence、预定义升级给人的条件。这构成一个递归结构——验证流程本身也是需要被工程化的对象（详见 [Harness Generator Evaluator Anthropic](https://github.com/QianJinGuo/wiki-public/blob/main/entities/harness-generator-evaluator-anthropic.md)）——它把"要不要信任模型输出"的问题，转化为"能否审计验证流程"的问题。

## 实践启示
1. 用断点清单驱动演进：每次任务失败先定位断点所在环节（感知/工具/状态/验证），再把修复固化为下一轮默认存在的系统约束，而不是追加一句提示词。
2. 逐条硬化软规则：对 AGENTS.md 里每条"希望它遵守 X"，寻找对应的机械化手段（hook、权限门、CI 检查、磁盘工件），能搬出自然语言的都搬出去。
3. 为长任务建设外部状态：feature list、progress notes、handoff artifacts 全部落盘，使任务可恢复、可交接、可验证；上下文按渐进披露组织，拒绝单体巨型规则文件。
4. 给验证流程独立配置：验收标准明确化、判断写成 evidence、失败升级条件预定义，并根据真实误判持续修正评分标准与测试深度。
5. 工程投入押在 98.4% 一侧：权限网关、工具路由、错误恢复、上下文管理是可靠性的主体，模型升级不会替代这部分工作，只会抬高其回报——工程师的能力曲线正转向"能为 AI 设计多严格的工作环境"。
6. 把 lint 错误写成修复指令：让静态检查直接输出 Agent 可执行的改法（如"用 logger.info 代替 console.log"），使 CI 成为生成-验证回路的自动反馈源；可复用的护栏模式参见 [Claude Code Agentic Harness Design Patterns](https://github.com/QianJinGuo/wiki-public/blob/main/entities/claude-code-agentic-harness-design-patterns.md)。

## 关联

- 同题异语种孪生页：[Harness Engineering耗时一周我是如何将应用的Ai Coding率提升至90的](https://github.com/QianJinGuo/wiki-public/blob/main/entities/harness-engineering耗时一周我是如何将应用的ai-coding率提升至90的.md)（归并候选，提案卡 #11 批1）

---

