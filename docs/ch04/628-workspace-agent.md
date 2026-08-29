# Workspace：面向 Agent 的组织资产基座（百度实践）

> 📊 Level ⭐⭐ | 5.6KB | `entities/workspace-organizational-asset-base-baidu-2026.md`

# Workspace：面向 Agent 的组织资产基座（百度实践）

> 百度Geek说（何雪源）第一方实践：个人提效 ≠ 组织提效。Workspace 是「面向 Agent 的组织资产基座」——解决组织资产用什么形式组织、怎么流动的问题，让 Agent 通过它了解业务、参与业务。

## 三个卡点与组织提效四件事
业务提效困境的三个卡点：①个人经验难以复制、②跨角色背景对齐成本高、③工具生态各自为政——都不是「模型不够强」造成的，换更强模型也不会消失。devflow（基于 SDD 理念的百度 Native 研发工作流，每阶段硬门禁）让个人产出涨了，但团队需求交付数据没改善——**纵向的短板决定交付周期，横向的断点决定经验能不能变成组织能力**。组织提效要解决四件事：资产怎么攒起来（低成本记经验）、攒起来的东西怎么流动、流程和角色职责变化、交付质量持续稳定。

## Workspace 是什么
不是文档库、不是 skill 库、也不是把几个仓库放一起。它是**面向 Agent 的组织资产基座**：把团队的知识库、代码库、iCafe 空间、skill 都放到一个代码库下，Agent 能访问所有业务资产还能自行验证产出。

**关键原则：Workspace 不存知识的快照或备份，只存摘要和索引。** 不是把外部内容整理成文本存进去，而是构建外部资产的索引，让 Agent 知道查询某问题该去哪个平台获取——固有流程和方式不变（依旧在知识库写文档、iCafe 记录任务），Workspace 不直接改变工作模式，这也是它能推广的原因。

## 组织结构
README.md 是规则唯一源（AGENTS.md/CLAUDE.md 都是指向它的软链，三端共读，不把软链替换成副本）；`.claude/.codex/.comate` 三端桥接只放软链（新增 agent/skill 只改一处，解决多 harness 生态）。docs 分两层按「内容会怎样失效」划分不按主题：**知识层**（docs/knowledge/）放概念定义/外部系统入口/带条件的经验判断——被新证据推翻时回头改旧页；**活动层**（docs/activity/）放每次迭代做了什么/怎么做的/验证结果——不失效只增不改。repos 用 git submodule 引入只读。

四个关键文件：README（规则唯一源）、docs/README（路由表，只描述信息怎么找，外部平台是权威源 docs 只是索引层）、docs/INDEX（资产表一行一条 + 签名短哈希判断缓存落后）、docs/LOG（按日期倒序变更日志，留「为什么」依据）。

## summarize skill：资产流动闭环的最后一环
Workspace 能不能越来越好用，关键在 summarize skill（迭代收尾写回）——没有写回，Agent 每次都从零开始，Workspace 退化成静态文档库。三条设计取舍：**强制执行**（会话最后必须执行，写回不靠自觉）、**尽可能不打扰用户**（减少人的决策，写回变成需要人配合的手续就会被跳过）、**宁多记不漏记**（多余经验页只是噪声，丢掉的经验是下次重新踩一遍，拿不准写进不会失效的 activity 层）。分流表：客观事实/概念规则→knowledge、带条件判断/踩坑→experience-<主题>.md、外部系统入口→sources.md、做了什么怎么验证→activity/<日期>-<主题>.md、**本版参数阈值数值留 activity 不进 knowledge**（参数会随调整变、进知识层立刻过期还被当规则引用）。旧页被推翻时回头改原页（否则两份矛盾真相、检索命中随机）；同步 INDEX/LOG；补双向引用。

## 实践：RocketMQ Workspace（组织级）
核心产品 Workspace，文档组织三层，沉淀 20 个 skill 分六组覆盖需求讨论→开发验收→排障→封线→资产沉淀完整链路，Workflow 四阶段 Spec Driven Development。示例：Bug 修复（diagnosing-bugs 定位→to-icafe-card 建卡→spec-workflow 走方案设计/开发/验收/收尾四步→Patch+交付报告）；新功能开发（spec-workflow 走 spec driven 流程）。

## 相关
与 [AI-Native 组织方法论（SDD）](../ch05/022-ai-native.html)、[Lattice Harness 团队 SDD 实践](../ch05/129-ai-coding.html)、[Spec as AIOS（AGENTS.md 类）](../ch05/022-ai-native.html) 同属 spec-driven/组织工程主题；本文贡献是「面向 Agent 的组织资产基座」——不存快照只存索引 + knowledge/activity 两层 + summarize 写回闭环。与 [组织能力护城河](../ch01/1077-ai-true-moat-organizational-capability.html)、[AI 时代护城河不是大模型](../ch01/1156-llm.html) 互补（组织资产 vs 组织能力）。→ [原文存档](https://github.com/QianJinGuo/wiki-book/tree/main/docs/raw/articles/workspace-organizational-asset-base-baidu-2026.md)

---

