# 百亿补贴 C 端 AI Coding 实战：基于 SDD 的服务端 AI Coding 实践

## Ch05.048 百亿补贴 C 端 AI Coding 实战：基于 SDD 的服务端 AI Coding 实践

> 📊 Level ⭐⭐ | 11.8KB | `entities/百亿补贴-c-端-ai-coding-实战基于-sdd-的服务端-ai-coding-实践.md`

# 百亿补贴 C 端 AI Coding 实战：基于 SDD 的服务端 AI Coding 实践

**来源**: 大淘宝技术（淘天集团-天猫技术团队）
**作者**: 码一
**发布日期**: 2026-07-27
**评分**: v=8 c=8 s=4 vxc=64

## 核心论点

服务端 AI Coding 在复杂业务场景（历史项目迭代、复杂玩法交互、线上质量要求）中难以达到生产级质量。淘天百亿补贴团队放弃「完全自动化的端到端流程」，转向「开发者深度参与 + Aone Copilot 工具链」的 SDD 模式：Spec 作为唯一真相源，解决 AI 的概率性输出、上下文限制与局部视野三大硬约束；引入自进化记忆机制（topic-open/topic-save）管理跨会话上下文。最终在百亿补贴玩法迭代（4k+ 代码行）中实现 0 手写代码、4 天交付，Spec 5000+ 行、长期记忆 200+、任务记录 500+。

## AI Coding 的三个天然瓶颈

- **概率性输出**：同样的提示词，两次运行结果可能完全不同
- **上下文限制**：对话轮次多了模型会「遗忘」早期约定；上下文压缩后关键约束容易丢失
- **局部视野**：大项目里 AI 只能看到提供的部分代码，基于局部信息的修改可能破坏全局架构

Vibe Coding（完全自然语言自由发挥）在小项目/原型可行，但在实际业务必然失败：迭代失控（无约束下 AI 随意修改架构决策）、上下文坍塌（模型重复犯已纠正的错误）、局部冲突（局部优化与项目其他逻辑冲突）。

## SDD 作为 Harness Engineering 的 AI Coding 实践

SDD 核心理念：**代码是 Spec 的副作用**，规格说明是唯一真实来源（Single Source of Truth）。Spec 是系统的压缩表示——10 万行代码的 Spec 可能只有几千字，AI 能一次性读完并理解全局约束；修改功能前先更新 Spec，AI 基于更新后的 Spec 生成代码，保持全局一致性。

SDD 映射到 Harness 四层架构：
- **约束层**：定义不可违背的技术原则，防止 AI 随意变更架构决策
- **上下文层**：分层文档体系（需求→架构→任务）确保 AI 获得「恰好足够」的信息
- **执行层**：Specify→Plan→Implement→Validate 强制流程，防止「一股脑写代码」
- **记忆层**：Spec 作为持久化唯一真相源，解决跨会话「失忆」和状态漂移

核心结论：模型能力不是瓶颈，SDD 才是让 AI Coding 从「碰运气」变成可重复、可管控的关键工程。

## 演进路径：从全自动 P2C 到开发者深度参与

**历史尝试 — 多 Agent P2C（PRD to Code）工作流**：目标「端到端、全自动」，步骤为预生成知识库 → 需求分析&改写 → 技术方案生成 → 代码生成 → 自动化测试，每步产出下一步的 Spec；每层又基于软件工程学设计多 Agent（coordinator → rewriter → clarifier → analyzer，校验不通过最多迭代 3 次）。结果：代码采纳率约 70%，但内部步骤过多导致单次任务执行时间偏长、有限人机交互无法彻底解决 Spec 不精准问题、缺少成熟代码库索引和 Linter 方案（阿里级 Java 应用 LSP 会 OOM）。

**当前方案 — Aone Copilot + 开发者深度参与**：从 P2C 教训得出「AI Coding 的瓶颈不在代码生成，而在上下文管理和质量把控」。Aone Copilot 作为 IDE Extension 具备四个优势：内置 Linter（生成时拦截低级问题）、代码库索引（自带语义检索）、代码可见（开发者逐行审查、随时介入）、Agent 能力成熟。流程从「一键到底」变为「开发者精确控制 Spec 的每一步演进」：不重复造轮子、放弃全自动长任务、严格遵循「先更新 Spec，再生成代码」。本质转变：**从「信任 AI 的全流程判断」变成「信任 AI 的单步执行能力」**。

## 实践流程：Specify → Plan → Implement → Validate

- **Specify**：PRD 结构化整理（提取核心功能点、识别隐含技术约束、明确 Non-Goals）+ 参考代码索引（缩小 AI 搜索空间）+ 约束补充（技术栈/编码规范/安全底线显式写进 Spec）。对玩法项目额外强调注释齐全、日志齐全。经验：一个好的提示词模板就够了，过度工程化增加维护成本。
- **Plan**：带着明确问题做技术资产调研 + AI 主动提出疑问和风险点 + 技术方案产出（开发者核心职责是审核架构合理性——「AI 给的方案能跑，但不一定好」）。
- **Implement**：先搭框架再填细节——AI 搭建可编译但无实现的骨架，开发者审核确认后按任务列表逐模块实现；每个任务独立会话，开始前 `topic-open` 加载记忆和 Spec 片段，完成后 `topic-save` 保存关键决策。
- **Validate**：贯穿每一步，输出 Spec 与输入 Spec 对齐。实测迭代：技术方案与 PRD 对齐 3+2 次，代码与技术方案对齐 5+ 次。手段：AI 辅助对齐文档、AI 辅助对齐代码、多模型交叉 CR（利用「认知差异」发现盲点）。CR 重点不是「逻辑对不对」而是「设计好不好」：过度抽象、吞异常、边界条件、跨模块风格一致性。

## 上下文工程：恰好足够

核心原则：不能多（上下文过长 AI「迷失在中间」）、不能少（信息不足 AI 自信「脑补」）。工具仅用 2 个 MCP + 1 套自建 Skill：
- **context7**：查询第三方开源库特定版本文档和代码示例，不依赖 AI 可能过时的训练数据
- **artifact7**：面向阿里巴巴二方库的代码上下文治理，从 SDK 源码解析接口定义，精准版本绑定确保 AI 召回正确的 API 用法
- **topic-open / topic-save**：自进化记忆体，让每次对话从「恰好足够」的上下文开始

实践技巧：文档预处理（去格式噪音、提取核心信息、按模块重组）、渐进式披露（实现模块 A 只加载 A 的 Spec 和直接依赖接口，一次对话只涉及 1-2 个话题）、记忆管理（里程碑即 topic-save，只记有价值内容）。

## 自进化记忆：@ali/ai-coding-assistant

轻量级工具，核心两个 Skill（`topic-open` / `topic-save`），借鉴 OpenClaw「md 文件即知识」范式——所有记忆存成可读、可编辑、可 Git 版本化的 `.md` 文件。不做复杂 Agent 系统，不改变现有工作流，只给 AI 装一个「记忆体」。

**四层文件结构**（分层按需加载，节省上下文）：
```
topics/
├── index.json          # 第1层：话题索引，粗筛路由
└── <话题名>/
    ├── TOPIC.md        # 第2层：话题定义，精确定位
    ├── MEMORY.md       # 第3层：跨会话技术决策总结
    └── sessions/       # 第4层：历史会话存档
        └── <时间戳>-<描述>.md
```

**三个关键决策**：话题隔离（大项目拆话题，独立记忆互不干扰）、记忆即知识库（AI 在对话中自动生成进化，只记代码参考/解决方案/常见错误/跨话题关联）、最小侵入（对话开始加载记忆、结束保存记忆，大的变更需用户确认）。记忆文件是 `.md` 格式且存在项目目录中，天然支持 Git 版本化——团队成员拉取最新代码即同步所有人的 AI 记忆，天然解决多人协作。

## 质量保证：没有银弹

分布式项目的部署成本、mock 覆盖不了真实场景、AI 无法替代人对业务逻辑的判断——当前阶段质量保证必须靠人深度介入：多模型交叉 CR、AI 辅助对齐、开发者逐行 CR（设计合理性/边界条件/错误处理）、测试针对性回归（针对 AI 生成代码做手工回归，特别是边界场景和异常路径）。「不优雅，但诚实。AI Coding 提升了代码生成效率，但质量保证的责任没有被转移——它依然在人的肩上。」

## 经验总结

**什么有效**：Spec 是真正的产出物（代码只是副产品）；开发者角色从「写代码」变「做决策」；小步快跑优于一步到位；上下文工程是被严重低估的能力（给 AI 提供什么上下文，比怎么写 prompt 重要 10 倍）；自进化记忆让迭代开发真正可行。

**什么需要改进**：Spec 膨胀——技术方案数千行、伪代码占据大量篇幅打满上下文，违背 SDD「人定义 WHAT，AI 实现 HOW」原则。判断信号：「换一个技术栈实现，这份 Spec 是否仍然有效？」答案为否即说明 Spec 混入了 HOW。应对：提示词禁止完整伪代码、按模块拆分 Spec、建立抽象度检查环节。

**对 AI Coding 的思考**：AI Coding 的上限不取决于模型有多强，而取决于开发者的工程素养有多高。SDD 的本质是把软件工程最佳实践适配到人机协作新范式。「AI 放大一切：好的工程实践被放大成高效产出，差的工程实践也被放大成更大的混乱。」SDD 提供可控性，自进化记忆提供连续性——两者结合才是 AI Coding 真正能用于生产的关键。

## 相关实体

- [端到端 CodingAgent 设计：百亿补贴 C 端 AI Coding 实战](../ch04/030-codingagent.html) — 同团队同业务线的姊妹篇（前端 D2C + SKILLS 体系），本文聚焦服务端 SDD 流程 + 自进化记忆
- [SDD 实践：格子 Harness 团队](ch05/122-ai-coding.html) — 另一团队 SDD 落地实践
- [OpenSpec SDD](ch05/055-openspec.html) — Spec Kit 业界实践参照
- [AgentMemory](../ch06/005-agentmemory-coding-agent.html) — Coding Agent 本地记忆同类方案
- [SDD 规格驱动开发 Harness](https://github.com/QianJinGuo/wiki/blob/main/concepts/sdd-specification-driven-development-harness.md)
- [Harness Engineering 范式](https://github.com/QianJinGuo/wiki/blob/main/concepts/agent-harness-engineering-paradigm.md)
- [Agent 记忆架构](https://github.com/QianJinGuo/wiki/blob/main/concepts/agent-memory-architecture.md)
- [Agent 编排模式](https://github.com/QianJinGuo/wiki/blob/main/concepts/agent-orchestration-patterns.md)

→ [原文存档](https://github.com/QianJinGuo/wiki-book/tree/main/docs/raw/articles/百亿补贴-c-端-ai-coding-实战基于-sdd-的服务端-ai-coding-实践.md)

---

