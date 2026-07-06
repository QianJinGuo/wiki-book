# Hermes Agent 自我改进机制概述

## Ch04.224 Hermes Agent 自我改进机制概述

> 📊 Level ⭐⭐ | 10.8KB | `entities/hermes-self-improving-overview-winty.md`

[Hermes Self Improving Overview Winty](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/hermes-self-improving-overview-winty.md)

点击上方 前端Q，关注公众号
回复加群，加入前端Q技术交流群
我跟很多做 Agent 的朋友聊过一个话题：Agent 真的能"自我进化"吗？
大家给的答案多半是：
▸ "可以啊，模型越来越强嘛"
▸ "可以啊，prompt 越调越好啊"
▸ "可以啊，加点 RAG 不就行了"
听起来好像都对。但你仔细一想会发现，这些都是外部在帮 Agent 变强，不是 Agent 自己在变强。
模型迭代是 OpenAI 的事，prompt 调优是工程师的事，RAG 是知识库的事。Agent 自己呢？它一直在原地，每次任务都从零开始。
Hermes 的"Self-Improving"不一样。它说的是：Agent 自己能从工作中学到东西，自己写下来，自己下次复用，自己持续修补。
整个闭环不依赖人，也不依赖模型升级。
这一篇我把这个闭环拆开讲清楚。

## 先给"自进化"做一个工程定义
同一个用户，让同一个 Agent，在不同时间点做同类任务，后做的明显比先做的更准更快。
三个关键词：

- 同一个用户：排除 prompt 优化的影响
- 同一个 Agent 实例：排除模型版本升级的影响
- 同类任务：排除任务难度变化的影响
按这个标准，市面上 95% 的 Agent 不算自进化。Hermes 算。

## 自进化要靠 4 件事配合
第 1 件事：能记住事（Memory）— 事实级别的认知，写到 markdown 文件里，下次自动加载到 system prompt。
第 2 件事：能沉淀做法（Skill）— 操作级别的经验，写成有 step 的 markdown 文件，下次按攻略执行。
第 3 件事：能主动触发学习（Nudge Engine）— 到了某个时间点/事件/轮次，强制提醒"该学习了"。
第 4 件事：能客观地复盘（Review Agent）— 专门 fork 一个独立 Agent 来复盘，它没有完成任务的执念，只看快照判断什么值得记。

## 闭环是怎么转起来的
任务执行 (主 Agent + Trajectory 落盘) → Nudge 触发 (轮数/事件/时间) → Review Agent fork (读 Trajectory，做判断) → 落盘 (Memory 加事实 / Skill 创建或 Patch) → 下次任务 (Prompt Assembly 把 Memory + Skill 拽进 system prompt) → 执行更顺、更快、更准 → 回到任务执行
这是一个真正意义上的反馈环 (feedback loop)。

## 为什么闭环必须包含"主动触发"
被动学习有个致命问题：用户大多数时候不会反馈。用户的诉求是"把活干完"，不是"教 Agent 怎么干得更好"。
Nudge Engine 解决的就是这件事 —— 不依赖用户反馈，到时间了/轮次了/事件了，Agent 自己提醒自己复盘。

## 为什么"复盘"必须由独立 Agent 来做
主 Agent 自己 review 的偏差："刚才这事我做得不错" → 不学；"刚才那步有点尴尬，先别提" → 不记；"用户没说不满意" → 不改。
独立 Review Agent 没有"我做得好"的滤镜，只看快照不看情绪，唯一任务就是判断"什么值得保存"。

## "进化速度"不是越快越好
Memory 是有上限的，新事实进来要挤旧事实。Skill 是有触发条件的，无关任务不会触发新 Skill。Review Agent 是会"否决"的，没价值的快照不会变成新内容。
好的自进化系统不是"无限学习一切"，是只学真正有复用价值的东西，并且持续修剪。

## 自进化的"反例"
反例 1：所有对话都进 Memory → 几小时就爆了，模型注意力被无关聊天淹没
反例 2：让模型 fine-tune 进基模 → 成本巨高，时延巨长，rollback 不可能
反例 3：用大向量库存历史，每次检索 → 检索精度不够，Skill 不适合用 embedding 召回
反例 4：让用户每次手动告诉 Agent 学了啥 → 用户 99% 不会写

## 自进化的"加速度"
第 1 周：每完成 5-6 个任务，沉淀 1 个 Skill
第 2 周：Skill 之间"互相调用"，新 Skill 站在已有 Skill 上构建
第 3 周：Memory 和 Skill 开始对照，发现过时事实，自动 patch 修订
第 4 周：Agent 先扫现有 Skill 再看有没有可借鉴的
学习不是线性的，是复利的。

## 自进化和"模型升级"是两件事
模型升级是 OpenAI/Anthropic 给你的能力上限。自进化是你的 Agent 在你这个特定环境下的"熟练度增长"。
Hermes 不试图改基模，它试图让你这个 Agent 在你这个用户、团队、项目里越来越好用。

## 我的看法
真正的"自进化"不是一项能力，是一种结构。是由 4 个独立角色 (Memory、Skill、Nudge、Review) 协作出来的反馈环。
每个角色单看都很简单，组合起来才产生"持续变强"的效果。
Memory ≈ 团队 wiki，Skill ≈ 流程 SOP，Nudge Engine ≈ 周会复盘提醒，Review Agent ≈ 同事 code review。
Hermes 的设计哲学，不是 AI 哲学，是组织学。

## 深度分析
1. **自进化是结构，不是能力** — 传统观点把 Self-Improving 当成一种"加在 Agent 上的功能"，但原文的核心洞见恰好相反：自进化不是一项能力，而是 4 个独立角色（Memory、Skill、Nudge Engine、Review Agent）协作出来的结构效应。单个角色都很简单，组合起来才产生"持续变强"的效果。这意味着任何试图用单一模块解决自进化的方案（无论是加 RAG、加 prompt 调优、还是加 fine-tune）都注定是局部最优。
2. **独立 Review Agent 解决的是"执行-反思"利益冲突** — 主 Agent 自己复盘的偏差不是粗心，而是结构性利益冲突：主 Agent 的目标是"完成任务"，复盘时天然倾向于放大成绩、淡化失误、忽略隐患。原文设计了一个没有任务完成执念的独立 Review Agent，只读快照不做判断，这个分离的价值在于——它把"运动员"和"裁判员"分到了不同的 Agent 实例，从根本上切断了自我美化的动机。
3. **被动学习的致命缺陷：用户不会主动反馈** — 原文明确定义了 Nudge Engine 存在的原因：用户的诉求是"把活干完"，不是"帮 Agent 变得更好"。这一观察直接解释了为什么几乎所有依赖用户反馈的 Agent 学习系统都会失败——这不是实现问题，是激励机制错位。Nudge Engine 的本质是把"触发学习"从用户侧收回到 Agent 侧，到时间/轮次/事件条件满足时强制发起复盘。
4. **Skill 复合产生复利，而非线性积累** — 原文中"自进化的加速度"描述了 4 周的演进路径：第 1 周独立 Skill → 第 2 周 Skill 互相调用 → 第 3 周 Memory 和 Skill 交叉修订 → 第 4 周主动扫描已有 Skill 再执行。这不是线性学习，而是复利增长：新 Skill 站在已有 Skill 基础上构建，每次复盘都在同时修订 Memory 中的过时事实，形成正向飞轮。
5. **设计哲学的隐喻：组织学而非 AI 学** — 原文用了一组精确的类比：Memory ≈ 团队 wiki，Skill ≈ 流程 SOP，Nudge Engine ≈ 周会复盘提醒，Review Agent ≈ 同事 code review。这组类比不是修辞，而是设计指南：每个组件的最优实现方式不是来自 AI 论文，而是来自人类组织的最佳实践。这意味着 Hermes 的实现者应该去读《团队协作的五大障碍》而不是《Transformer 架构》，至少在架构层面是这样。

## 实践启示
1. **先实现 Trajectory 持久化，再谈自进化** — 在设计任何自进化机制之前，必须先确保任务执行过程能以结构化快照的形式落盘。没有 Trajectory，Review Agent 无快照可读，自进化闭环无法闭合。推荐用 JSONL 文件按"时间戳 + 任务类型 + 执行步骤 + 结果"格式存储每次任务轨迹，这是整个反馈环的原材料。
2. **Nudge Engine 的触发条件要分层设计** — 不要只用单一触发条件，推荐三层：时间驱动（如每完成 3 个任务强制复盘）、事件驱动（如任务失败率超过阈值）、轮次驱动（如连续 5 轮同类任务后触发）。多层触发能避免单一条件失效导致整个学习回路停转，同时也要设计退避机制防止高频任务场景下 Nudge 过于频繁。
3. **Review Agent 必须是独立进程，而非主 Agent 的一个工具调用** — 在工程实现上，Review Agent 应该以完全独立的 Agent 实例运行，有独立的 context window，不继承主 Agent 的 system prompt。只有这样才能真正切断"我做得不错"的自我美化循环。如果只是主 Agent 调用一个 `review()` 函数，两者的利益冲突问题依然存在。
4. **Skill 的检索不用向量数据库，用规则匹配** — 原文明确指出 Skill 不适合用 embedding 召回，原因是 Skill 是有触发条件的过程性知识，而不是事实性陈述。推荐实现方式：用 YAML/JSON 清单注册每个 Skill 的触发条件（任务类型、前置上下文、适用场景），在 Prompt Assembly 阶段用规则引擎匹配，而非向量相似度检索。
5. **给 Memory 容量设定硬性上限，并设计淘汰策略** — 新事实进来必然触发旧事实的挤出，推荐设定 Memory 上限（如最多保留 50 条事实），并让 Review Agent 显式负责淘汰决策而非依赖 LLM 的隐式注意力。淘汰标准：低复用频率、过时、与新事实矛盾。定期运行 Memory 压缩任务，把多个相关事实合并为一个高层面概括。

## 关联阅读
## 相关实体
- [Hermes Self Improving Loop Winty](https://github.com/QianJinGuo/wiki/blob/main/entities/hermes-self-improving-loop-winty.md)
- [Hermes 9 Module Architecture Winty](https://github.com/QianJinGuo/wiki/blob/main/entities/hermes-9-module-architecture-winty.md)
- [Hermes Agent Self Evolving Source Analysis](https://github.com/QianJinGuo/wiki/blob/main/entities/hermes-agent-self-evolving-source-analysis.md)
- [P Ai Pms Guide To Claude](https://github.com/QianJinGuo/wiki/blob/main/entities/p-ai-pms-guide-to-claude.md)
- [Hermes Skill System Winty](https://github.com/QianJinGuo/wiki/blob/main/entities/hermes-skill-system-winty.md)

---

