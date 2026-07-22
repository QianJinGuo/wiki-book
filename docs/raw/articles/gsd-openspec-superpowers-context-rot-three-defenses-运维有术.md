---
title: "GSD 完胜 OpenSpec 和 Superpowers？源码拆完发现：三者防的是 context rot 的三道防线"
source_url: "https://mp.weixin.qq.com/s/JvLeQjHJvrf06iLtK6XmIg"
source: "运维有术（术哥）"
author: "术哥"
ingested: 2026-07-06
sha256: 97e1116cd1243c6dc066c4e955f349d588fc05431cd103bdcc111643d9aae88d
---

**文章主旨**：针对"GSD 完胜 OpenSpec 和 Superpowers"的流行叙事，作者通过阅读源码指出三者解决的是 context rot 的三个不同症状阶段，存在递进关系而非替代关系。

**1. Context Rot 不是模型 bug**

GSD 的官方文档 docs/explanation/context-engineering.md 给出的描述：As that window fills, something subtle happens. The model does not fail loudly. It keeps answering. But the quality of its answers quietly degrades... Researchers call this context rot.

四种典型表现：
- 模型开始和早期已确认的决策自相矛盾
- 代码风格偏离会话开始时定下的约定
- 计划开始忽略早已被埋在历史里的需求
- 模型对 20 轮对话前还正确的文件名、函数签名产生幻觉

关键认知：不是模型 bug，是 transformer attention 在长序列上的固有属性。

**2. OpenSpec：防的是 AI 该做什么的腐烂**

诊断最窄也最准——context rot 的第一个症状是 AI 把需求在长对话里搞漂移了。解决方案：把需求从易腐烂的对话历史里搬到版本化的文件系统里。

核心三件套：
- specs/ — 当前真相（source of truth）
- changes/ — 进行中的变更（每个一个文件夹）
  - proposal.md（为什么改、改什么）
  - design.md（怎么改）
  - tasks.md（执行清单）
  - specs/ — delta spec：只描述变化

Delta Spec 机制（只写增量，不重写）：三个固定区段——ADDED Requirements、MODIFIED Requirements、REMOVED Requirements。优势：Clarity（审阅时只看 diff）、Conflict avoidance（两个 change 同时碰同一份 spec 只改不同 requirement）、Brownfield fit（适配现有项目，不用先把整个遗留系统文档化）。

OpenSpec 显式不做的事：不管 context engineering（假设主对话能保持清醒）、不管执行过程（apply 命令把任务交给 AI 自由发挥）、不管代码质量。一旦对话变长，AI 脑子开始糊，spec 文件再规范，AI 读的时候也读偏。

**3. Superpowers：防的是 AI 怎么做事的腐烂**

诊断比 OpenSpec 宽一层——context rot 的第二个症状是 AI 跳过 TDD、不做 code review、直接动手改代码（流程纪律退化）。解决方案：14 个自动触发的 skill，把好习惯变成条件反射。

自动触发机制：Even a 1% chance a skill might apply means that you should invoke the skill to check. skill check 必须发生在 clarifying question 之前。

Red Flags 表防止模型自我开脱：
- "This is just a simple question" → Questions are tasks. Check for skills.
- "I need more context first" → Skill check comes BEFORE clarifying questions.
- "The skill is overkill" → Simple things become complex. Use it.
- "I remember this skill" → Skills evolve. Read current version.

14 个 skill 分类：测试（test-driven-development）、调试（systematic-debugging、verification-before-completion）、协作（brainstorming、writing-plans、executing-plans、dispatching-parallel-agents、requesting-code-review、receiving-code-review、using-git-worktrees、finishing-a-development-branch、subagent-driven-development）、元（writing-skills、using-superpowers）。

硬门禁：Brainstorming skill 禁止在用户批准设计前动手——Do NOT invoke any implementation skill, write any code, scaffold any project, or take any implementation action until you have presented a design and the user has approved it.

Superpowers 的 subagent：subagent-driven-development 和 dispatching-parallel-agents 都支持 fresh context + 并行 dispatch，只是不如 GSD 结构化——触发方式靠模型/用户 ad-hoc 判断，没有自动依赖分析，没有原子锁。

Superpowers 不管的事：跨会话状态（无 .planning/ 持久化）、结构化并行（并行 ad-hoc）、spec 演进（brainstorming 产出设计文档但无 delta 合并机制）。

**4. GSD：防的是 AI 脑子本身的腐烂**

诊断最深——前面两个框架都在治标，只要对话够长，AI 的注意力本身会被噪声稀释。解决方案最激进：不试图让 AI 在长对话里保持清醒，直接放弃长对话。

核心设计：GSD Core's central insight is that most of the work in a coding session does not need to happen in the main context at all. 每个离散任务交给专门的 subagent（干净、精心限定的上下文窗口），报告回到轻量级 orchestrator。

Orchestrator → Fresh-context Agent：orchestrator 故意做得很薄——不推理领域、不写代码、不解释结果，只负责路由。这样它的上下文增长很慢。

34 个 Agent（ls agents/ 实测）的实际分工：
- Researchers（4 路并行）：project-researcher / phase-researcher / ui-researcher / advisor-researcher
- Synthesiser（串行，等研究员完成）
- Planners / Roadmapper（串行）
- Checkers（串行，最多 3 轮修订）：plan-checker / integration-checker / ui-checker / nyquist-auditor
- Executor（波次内并行，波次间串行）
- Verifier（串行）
- Mapper（4 路并行）
- Auditor（串行）

Wave Execution（结构化并行核心）：任务按依赖关系分成多个 wave，同一 wave 内的任务并行执行，wave 之间串行等待。两个并发安全机制——STATE.md.lock 原子锁（O_EXCL 创建，防止两个 agent 同时读改写状态文件）和 Per-wave hook run。

.planning/ 跨会话记忆：PROJECT.md + REQUIREMENTS.md + ROADMAP.md + STATE.md + phases/ 目录。continue-here.md 机制让 orchestator 自己的上下文也快满时，把进度写入文件，下次开新会话从断点继续。

GSD 承认的代价：Coordination overhead（每个 agent spawn 耗时 1-5 分钟）、Opacity during execution（subagent 运行时对父会话不可见）、Context stitching cost（装配正确上下文需要 orchestrator 花钱）、Model cost amplification（5 个 Opus agent 并行贵 5 倍）。提供 /gsd-quick 和 /gsd-fast 跳过完整阶段循环。

**5. 三者对比**

| 维度 | OpenSpec | Superpowers | GSD |
|------|----------|-------------|-----|
| 诊断的腐烂层 | 需求/契约腐烂 | 流程纪律腐烂 | 注意力本身腐烂 |
| 核心机制 | spec / change / delta | 14 个自动触发 skill | orchestrator + fresh-context subagent |
| 持久化 | specs/ + changes/ | 无跨会话状态 | .planning/ + STATE.md + continue-here.md |
| 并行调度 | 无 | ad-hoc，模型自觉 | wave execution + 原子锁 |
| 硬门禁 | 无 | brainstorming 设计批准、TDD | plan-checker 修订（不强制 TDD） |
| 数字规模 | 5 个核心命令 | 14 个 skill | 34 agent / 70 command / 95 workflow |
| 学习成本 | 最低 | 中等 | 最高 |
| 适合项目规模 | 小到中 | 中 | 中到大 |

**几处流传说法纠正**：
- GSD 有 33 个 Agent → ls agents/ 实测 34 个
- GSD 有 86 个命令 → commands/gsd/ 实测 70 个
- GSD 有 142 项功能 → FEATURES.md 章节标题约 44 项核心 + v1.27 扩展
- Superpowers 不管上下文工程 → 部分错误，subagent-driven-development 和 dispatching-parallel-agents 都涉及 fresh context
- Superpowers 子 agent 全串行 → 准确，但 dispatching-parallel-agents 支持手动并行

**7. 理想用户画像**

OpenSpec：已有完整开发流程，只是缺和 AI 对需求的方式。痛点：AI 忘了最初要它做什么。

Superpowers：想要装上就能用的纪律。痛点：AI 跳过测试直接写代码，写完方向错了。

GSD：真正的多文件、多会话、跨天大型项目，愿意接受仪式化流程和 5 倍 model 成本换取不会在第 5 个文件时腐烂。痛点：注意力稀释。

三者是洋葱结构——OpenSpec 外层防需求漂移 → Superpowers 管执行纪律 → GSD 最内防注意力被噪声稀释。可叠加使用，叠得越多防御越厚但维护成本越高。
