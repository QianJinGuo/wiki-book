# Flow2Spec：开发过程自然长出知识图谱的 Agent 工程框架

## Ch04.386 Flow2Spec：开发过程自然长出知识图谱的 Agent 工程框架

> 📊 Level ⭐⭐ | 7.4KB | `entities/flow2spec-structured-knowledge-routing-ctrip-2026.md`

# Flow2Spec：开发过程自然长出知识图谱的 Agent 工程框架

携程（Lands）开源的 Flow2Spec 是一个让项目在开发过程中自然长出知识图谱的 Agent 工程框架。核心设计：知识库不是一个大文档而是一套路由协议，Agent 通过 manifest→matcher→topic→dependencies→docs 的渐进式路径获取精确上下文，每次开发产生的新知识通过 f2s-kb-distill/f2s-kb-sync 反哺回知识库，形成知识演进闭环。

## 核心洞察

### 「上下文越多 Agent 越笨」悖论与 Flow2Spec 的解法

Flow2Spec 直面一个根本矛盾：你希望 AI 多了解项目，但上下文越多，它越容易读不完、读偏、忘掉重点。传统方案不断加规则（先读这个、再读那个、这个不能改），最后上下文变成膨胀的说明书。

Flow2Spec 的解法是**把知识从扁平文档变成有边有路由的图**：不是让 Agent 一次读更多，而是让 Agent 每次只拿该拿的知识，并在依赖链上确保不遗漏前置约束。

### 知识路由协议：manifest→matcher→topic→dependencies→docs

Flow2Spec 对知识库暴露的不是"文件"，而是"怎么找到正确知识"的接口：

1. `manifest-routing.json` — 告诉 Agent 有哪些主题
2. `matchers/*.json` — 告诉 Agent 这个需求可能命中哪些主题
3. `topics/*.md` — 给 Agent 短摘要和硬约束
4. `topicDependencies` — 告诉 Agent 哪些前置规则必须一起读
5. `stock-docs/` / `req-docs/` — 只在需要时下钻

### 渐进式读取四步：match → expand → verify → act

1. **match**：先读 manifest，按任务缩小候选范围
2. **expand**：topicDependencies 展开依赖主题
3. **verify**：确认覆盖度、缺依赖、是否需要反问
4. **act**：确认可执行后才进入实现

### 知识从开发过程中长出而非预先建设

Flow2Spec 不要求先做大规模文档工程。知识在使用过程中自然生长：init 空骨架 → 生成架构说明 → Agent 按现有知识路由 → 实现后同步确认事实回知识库。知识是需求澄清→技术方案→代码实现→修复→知识同步→提交过程中逐步长出来的。

### 五层约束系统

入口层（读取顺序）→ 配置层（先读开关）→ 路由层（先读 manifest）→ 技能层（前置检查）→ 门禁层（checklist/知识检查/知识覆盖检查）。目标不是完全消除遗忘，而是让"绕过规则"在每个阶段都更难发生。

## 与现有知识库的关联

- [Hermes Agent](../ch03/090-hermes-agent.html) — Flow2Spec 的 .Knowledge/ 路由协议与 Hermes 的 Skill 系统形成互补：Hermes 管理 Agent 能力单元（Skills），Flow2Spec 管理项目层面的知识路由和开发流程
- [Skill 设计模式](ch04/266-skill.html) — Flow2Spec 的 f2s-* 命令本质上是预定义的 Skill，但其知识路由协议是比 Skill 更高一层的组织抽象
- [AI Agent Skill 系统设计：淘宝技术工程实践](ch04/266-skill.html) — Flow2Spec 的 HARD-GATE 等价物是五层约束，前向测试等价于 verify 步骤
- [Loop Engineering](../ch05/007-loop-engineering.html) — Flow2Spec 的开发闭环（req→clarify→tech→kb→code→sync→commit）是 Loop Engineering 在产品工程场景的具体实现
- [Memory in the LLM Era](../ch01/947-llm.html) — Flow2Spec 的 f2s-kb-distill 和 memory 系统中的抽取模块本质上是同一件事的不同抽象层级

## 深度分析

### 从「文件索引」到「知识路由」的范式转换

现有项目知识方案（AGENTS.md、CLAUDE.md、Cursor rules）本质上都是**文件索引**——告诉 Agent 哪些文件存在、按什么顺序读。Flow2Spec 的核心创新是把文件索引升级为**知识路由**——不仅告诉 Agent 文件在哪里，还告诉它不同的知识之间有什么依赖关系、当前任务需要哪些主题组合、知识覆盖是否够、源码答案是否需要反哺。

这个范式转换类似于从「静态网站目录」到「动态路由网关」的升级。文件索引是声明式的（告诉 Agent 有什么），知识路由是协议式的（定义 Agent 该怎么获取）。

### manifest-routing.json 的设计价值

manifest-routing.json 不是普通的配置文件。它实质上是一个**Agent 的知识查询协议**——定义了 Agent 与项目知识库之间的查询-响应契约。这个协议包含三个关键设计：

1. **路由不暴露内容**：manifest 只告诉 Agent 有哪些主题和怎么找到它们，但不包含主题本身的内容。Agent 命中 topic 后通过 topicDependencies 展开组合，不依赖单次读取
2. **依赖是显式的**：topicDependencies 强制 Agent 在命中主主题前先加载前置知识，解决了"只读局部规则"的常见失败模式
3. **可演进**：manifest 在仓库中能 diff、能 review、能随代码提交。这不是离线知识，而是和代码同步演进的

### 知识反哺循环：让 Agent 从消费者变成维护者

Flow2Spec 最独特的设计是 f2s-kb-distill/f2s-kb-sync 构成的**知识反哺循环**。传统方案中，Agent 消费知识库回答问题；Flow2Spec 中，Agent 在源码中找到新答案后，自动判断是否需要把该知识写回 topic。这使得知识库从单向消费变成双向演进——Agent 不只是知识消费者，也是知识维护者。

这实际上是建立了一个「开发→对话→知识→开发」的正反馈：开发过程中产生的知识被沉淀 → 下次类似需求 Agent 有更好的上下文 → 开发质量提升 → 更多新知识产生。

## 实践启示

1. **对中大型项目，使用 Flow2Spec 替代 AGENTS.md/CLAUDE.md**：AGENTS.md 单一文件无法承载 dependency 关系和渐进式读取。Flow2Spec 的路由协议更适合有复杂业务规则的项目
2. **知识从开发中长出，不要在开发前强行建设**：先用 init 创建空骨架，然后在使用过程中通过 kb-distill/kb-sync 逐步积累
3. **五层约束比 HARD-GATE 更系统**：Flow2Spec 的入口→配置→路由→技能→门禁五层设计比单点 HARD-GATE 更适合项目级约束管理
4. **开启意图识别 + 任务持久化**：intentRecognition + changeTracking 两个开关能让 Agent 自动分流，跨会话续接任务
5. **提交前知识覆盖检查是防止知识腐蚀的关键**：f2s-git-commit 在提交前检查知识是否需要更新，是防止文档与代码不同步的最后防线

## 原始存档
→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/flow2spec-structured-knowledge-routing-ctrip-2026.md)

---

