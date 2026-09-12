# 长期运行的 Agent 怎么管：Hermes 治理分层与 5 张卡

> 📊 Level ⭐⭐⭐ | 8.3KB | `entities/hermes-agent-long-running-governance-five-cards-ruofei.md`

## 摘要

若飞以 Hermes Agent 为样本，讨论「长期运行」这一新阶段的治理问题：当 Agent 能自己积累记忆、流程与技能之后，难点不再是它能不能做事，而是做久了以后现场还能不能被人看懂、接手和修正。文章把 Hermes 当作「一次性摊开长期 Agent 全部麻烦」的样本，依次审视扩展路径、记忆预算、Skill 库与 GEPA 自改进，最后收束为团队自检的「5 张卡」框架。

## 核心要点

- **don't automate slop**：流程没跑明白就别先自动化；松散流程接上 Agent 不会变严谨，只会更快产出更多半成品。
- **四层 setup 反着看**：主 Agent → 专职 Agent → orchestrator → cron + 事件越往后越热闹，越要先确认第一层跑稳。
- **Level 1 四个验收点**：输入是否稳定、输出谁来收、失败怎么留痕、哪些动作要人点头——这是准入流程问题，不是能力问题。
- **记忆是预算不是仓库**：每写一条长期记忆都在花未来的注意力与判断预算；常驻层要小，其余按需检索。
- **四层信息隔离**：SOUL.md、AGENTS.md、MEMORY.md / USER.md、session_search 各管一件事，混放会互相污染。
- **Skill 库最怕「很多但没人敢信」**：旧 Skill 不敢用、步骤互相冲突、救火 Skill 被长期复用、第三方 Skill 偷偷扩权。
- **5 张卡**：身份卡、项目卡、记忆卡、Skill 卡、运行卡——不必真写 5 个文件，但脑子里必须分开。

### 四层 setup 反着看：先用窄场景把第一层跑稳

Hermes 官方给出的扩展路径是「主 Agent → 专职 Agent → orchestrator → cron + 事件」。若飞认为它本身很顺，但明确反对照抄：这条路径把注意力引向「越往后越热闹」的部分——多 Agent 编排、定时任务、事件驱动看起来更高级，而决定系统能否成立的其实是第一步的窄场景验证。规模不是中性的：它只放大已有质量，好的成杠杆、差的成麻烦，所以「要不要往下一层走」必须先有第一层的证据。

判据就是 Level 1 的四个验收点：输入是否稳定（输入每次都变，输出不稳就不奇怪）；输出谁来收（摘要、风险点、引用原文、素材，收件人不同格式就不同）；失败怎么留下来（没抓到哪些站点、哪些链接打不开、哪些判断只是推测）；哪些动作要人点头（读文档可放开，发消息、改配置、删文件、创建 cron 要慢）。四点没有一个在问「Agent 够不够聪明」，全都在问「流程准入是否过关」——没有这一关，cron 加 subagents 只会把半成品定时推过来，把模糊流程拆成好几个模糊流程。

### 记忆是预算不是仓库：四层信息隔离与污染路径

记忆观的分歧被概括为两个方向：OpenClaw 倾向「记得越多越好」，用时再搜索；Hermes 坚持「少放进 prompt，其余按需取」——常驻层很小（MEMORY.md 约 2200 字符、USER.md 约 1375 字符，以 frozen snapshot 进入 system prompt），历史会话丢进 SQLite + FTS5 的 session search。若飞的关键洞察是把记忆重新定义为预算而非仓库：每写进一条长期记忆，都在消耗未来的注意力预算、上下文预算和判断预算。

预算视角的产物是四层信息隔离：身份层（SOUL.md）回答「这个 Agent 是谁」；项目规则层（AGENTS.md）回答「这个项目怎么做事」，承载架构约定、命令、端口与部署；长期记忆层（MEMORY.md / USER.md）只放少量事实；历史检索层（session_search）承载全部会话存档。反例正是风险来源：把一次救火的临时命令写进身份层，下次它就成了长期偏好；把团队规范塞进用户偏好，换个项目就把判断带偏；把所有历史压进常驻记忆，模型每次都在背着旧包袱做新判断。

### 五张卡：把长期 Agent 的麻烦一次性摊开

文章最核心的原创贡献是「5 张卡」：把团队自己的 Agent 工作流在脑子里切成五类互不混淆的资产。身份卡规定 Agent 长期是什么角色、哪些语气与偏好边界不能被项目污染；项目卡记当前仓库、业务、命令、端口、部署与验收规则；记忆卡存少量长期事实，强调「能进来，也能被修正」；Skill 卡是可复用流程，必须带触发条件、步骤、坑和验证；运行卡覆盖 cron、消息入口、权限、日志、trace、失败重试与回滚。

配套的五个自检问题把它落成可审计的动作：身份、项目规则、任务状态、历史档案、过程资产是否分开放；Memory 有没有写入门槛；Skill 有没有准入和退场；自动化有没有先过 Level 1；团队能不能看见 Agent 做了什么——工具调用摘要、权限审批、日志、trace、diff 与测试结果共同构成一张「可信度仪表盘」。

### Skill 库与 GEPA：过程资产的准入、退场与证据链

Skill 增长后真正可怕的状态不是「没有」，而是「很多但没人敢信」。准入标准是四道否决门：没有明确触发条件、没有输入边界、没有验证方式的先不沉淀；会改系统状态、发消息、删东西的先过权限审查。退场机制由 Hermes Curator 提供：它并不炫，只在后台看 agent-created skills 的使用情况，默认 30 天不用转 stale、90 天归档，但工程价值在于承认「过程资产也会变旧」——会创建资产的系统若不会让资产退场，最后一定会被自己的资产拖慢。

GEPA（hermes-agent-self-evolution）的价值同理不在「Agent 自己变强了」，而在让「改 Skill」有了证据链：读取执行轨迹、分析失败原因、生成候选变体，再经评估、约束门与 PR review 才落地。当前只实现 Phase 1（Skill files），tool descriptions、system prompt sections 与持续改进循环仍在计划中。若飞的可信度判据是：不会直接相信它「学会了」，而要先看它改了什么、为什么改、评估怎么跑、失败样本在哪、人怎么审、怎么回滚。

## 实践启示

1. **先跑稳一个 Agent**：第 1 周只让一个主 Agent 跑窄场景（输入固定 + 输出固定），不急着写 Skill，先看它在哪里犯错。
2. **把 Skill 写小写具体**：第 2 周只沉淀一个 Skill，含触发条件、来源、链接、哪些是推测、怎么验证。
3. **cron 只负责点火**：第 3 周才引入 cron，让它按时拉起任务，最终判断仍由人来做。
4. **子 Agent 拆分裂度后置**：第 4 周才决定是否拆子 Agent，前提是边界已稳定。
5. **守住三条硬顺序**：主 Agent 不稳不写 Skill，Skill 没验证不上 cron，cron 结果不稳不拆子 Agent。
6. **为每类资产设门槛与退场**：Memory 要能写入也能修正，Skill 要能准入也能归档，自动化要留日志与回滚。

## 相关实体

- [Hermes Skill 系统深度解析](https://github.com/QianJinGuo/wiki-public/blob/main/entities/hermes-skill-system-deep-dive.md)
- [Hermes 与 OpenClaw 记忆系统对比](https://github.com/QianJinGuo/wiki-public/blob/main/entities/hermes-agent-memory-system-vs-openclaw.md)
- [把一个 Agent 养成可运营系统（若飞）](https://github.com/QianJinGuo/wiki-public/blob/main/entities/hermes-agent-operator上手-把一个-agent-养成可运营系统-若飞.md)
- [记忆架构：过去如何影响未来（若飞）](https://github.com/QianJinGuo/wiki-public/blob/main/entities/agent-memory-architecture-past-influence-future-ruofei.md)
- [过程资产退场与 Build-to-Delete](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/harness-component-expiry-and-build-to-delete.md)

→ [原文存档](https://mp.weixin.qq.com/s/DsJvu1qSpS0tQlrrcn-pCg)

---

