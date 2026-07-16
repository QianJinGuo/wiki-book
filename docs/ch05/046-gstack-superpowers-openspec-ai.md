# 三器合一：gstack + Superpowers + OpenSpec 工程化 AI 编程实战

## Ch05.046 三器合一：gstack + Superpowers + OpenSpec 工程化 AI 编程实战

> 📊 Level ⭐⭐ | 11.4KB | `entities/three-tools-in-one-gstack-superpowers-openspec-engineering-ai-coding.md`

## 元信息
- **作者**：AgentBuff
- **日期**：2026-05-12
- **平台**：微信公众号
- **评分**：v×c = 8×8 = 64（strong，4星）
- **关联工具**：OpenSpec、Superpowers、gstack

## 核心概念
三个工具在同一个 Claude Code 会话中串联整合，各管不同层次，互不干扰：
| 工具 | 职责 | 存储位置 |
|------|------|----------|
| OpenSpec | 需求层（做什么） | `openspec/` |
| Superpowers | 质量层（做得好） | `CLAUDE.md` + skill 文件 |
| gstack | 执行层（怎么做、怎么发） | `.gstack/` |

## 四个关键串联点
### 1. OpenSpec 产物 → gstack 评审
OpenSpec 的 `/opsx:propose` 生成 proposal.md、specs/、design.md、tasks.md 四个文件。gstack 的 `/autoplan` 启动 CEO/design/eng/DX 四类评审，直接读取这些文件作为输入，无需手动复制粘贴。

### 2. Superpowers HARD-GATE → 自动拦截
`brainstorming` skill 的 HARD-GATE 要求"先展示设计并获得用户批准"才能写代码。OpenSpec 的 `design.md` + gstack 评审结论满足此门禁条件，自动放行。这意味着即使跳过 OpenSpec 直接说"加功能"，Superpowers 也会强制先走设计流程。

### 3. Superpowers TDD → gstack /review 质量提升
TDD 铁律（先写失败测试再写代码）作为 skill 文件规则自动执行。`/review` 因有测试作为行为契约，审查质量更高，能发现 localStorage 缺乏 try-catch（Safari 隐私模式抛异常）等生产级 bug。

### 4. gstack /ship → OpenSpec /opsx:archive
顺序固定：先 `/ship` 上线，再 `/opsx:archive` 收尾。归档将 Delta 规范合入主规范，确保 `openspec/specs/` 始终反映系统当前状态。

## 完整工作流示例（加暗色模式）
7 个手动命令驱动整个流程，其余串联自动完成：
```
/opsx:propose → /autoplan → (写代码) → /review → /qa → /ship → /opsx:archive
```
背后自动发生的：

- DAG 引擎解析依赖，生成 4 个产物文件
- 4 个评审角色读取 OpenSpec 产物，输出评审结论
- Superpowers HARD-GATE 检查设计批准，TDD 铁律先写测试
- gstack 读取 diff + 测试，找出生产级 bug
- Playwright Chromium 执行真实浏览器操作（截图、对比度验证）
- VERSION 升级、CHANGELOG 生成、PR 创建、推送
- Delta 规范合入主规范，归档变更

## 避坑要点
- **不重复门禁**：Superpowers HARD-GATE 已卡设计审批，不要再用 gstack 的 `/plan-design-review` 重复审查。推荐：Superpowers 管设计门禁，gstack 管代码审查（有浏览器验证）。
- **specs/ 是唯一真相源**：需求有冲突时以 `openspec/specs/` 为准。
- **/ship 是唯一发布出口**：OpenSpec 归档只是收尾记录，不是发布。
- **TDD 三个例外**：一次性原型、生成的代码、配置文件可跳过 TDD，除此外铁律不打折扣。

## 相关概念
- OpenSpec：需求层工具，DAG 产物依赖图，写代码前对齐需求
- Superpowers：质量层工具，HARD-GATE + TDD 铁律
- gstack：执行层工具，Browse 引擎 + 7 阶段 Sprint 管线
- [Harness Engineering实践做了一个平台让AI一晚上自动评测和优化你的系统](ch05/052-harness-engineering.html)
- [在 RDS PostgreSQL 中实现 RaBitQ 量化](https://github.com/QianJinGuo/wiki/blob/main/entities/在-rds-postgresql-中实现-rabitq-量化.md)
- [Codeindex · 让大模型更好地理解你的代码](../ch01/406-codeindex.html)
- [使用 Agent Skills 做知识库检索，能比传统 RAG 效果更好吗？](../ch04/391-agent-skills.html)
- [Claude Code 之父最新访谈：编程已经结束、harness 将消失、Claude Code 将只有 100 行代码、loop 才是未来](../ch03/076-claude-code.html)
- [Claude Code Agent 工程设计](../ch03/068-claude-code-agent.html)
- [你不知道的 Agent 原理架构与工程实践](../ch04/339-agent-principle-architecture-engineering-practice.html)
- [Ralph Loop 不够用：长时间 Agent 还缺这 3 件事](../ch03/046-agent.html)
- [Coding Harness 工程本质](https://github.com/QianJinGuo/wiki/blob/main/concepts/coding-harness-engineering.md)

## 深度分析
### 三层架构的协同逻辑
三个工具构成一个**预防→实时拦截→事后验收**的三段式质量门禁体系。OpenSpec 在需求层预防冲突，Superpowers 在编码层实时拦截低质量代码，gstack 在发布前做最后一轮浏览器级验证。这种分层设计避免了单点失效——任何一个工具单独使用都有盲区，但串联后互补。
OpenSpec 的 DAG 引擎是整个流程的触发器。`/opsx:propose` 生成的四个文件（proposal.md、specs/、design.md、tasks.md）不只是文档，而是结构化的需求契约。gstack 的 `/autoplan` 能够直接解析这些文件并启动对应评审，说明 OpenSpec 的输出格式与 gstack 的输入期望是经过特意对齐的。这种对齐不是巧合，而是工具设计时就考虑到了串联。

### HARD-GATE 的本质
Superpowers 的 HARD-GATE 不是普通的"建议先做设计"，而是**强制性的技能级门禁**。brainstorming skill 的规则直接嵌入 AI 的决策流程，在收到写代码请求时首先检查是否存在已批准的设计文档。这意味着即使用户绕过 OpenSpec 直接说"加功能"，Superpowers 也会强制要求先输出 design.md 并获得批准。
这个机制解决了一个根本矛盾：AI 编程中用户往往急于求快，跳过设计阶段直接让 AI 写代码，结果代码质量差、返工多。传统的人工 Code Review 无法解决这个问题，因为人工审查总是在代码写完之后才介入。HARD-GATE 把质量关卡前移到写代码之前，从源头减少低质量代码的生成。

### TDD 与 /review 的互补性
TDD 铁律要求先写失败测试再写代码，这一规则作为 skill 文件自动执行。gstack 的 `/review` 之所以能发现 Safari 隐私模式 localStorage 异常这类生产级 bug，根本原因是 TDD 提供了**行为契约**。review 工具不是漫无目的地读代码，而是拿着测试用例去验证实际行为，发现测试预期与实现结果的差异。
没有 TDD 的 /review 只能做静态代码审查，发现的是代码风格、可读性、潜在 bug 等通用问题。有了 TDD，/review 变成了一种有方向的验证行为——它知道代码"应该做什么"，所以能发现"实际做了什么"的偏差。这种差异在真实浏览器环境中会被放大，因为测试环境与生产环境的差异（不同浏览器的隐私模式、并发请求、异常边界）只有通过 Playwright Chromium 执行才能暴露。

### 发布流水线的顺序陷阱
工作流规定**先 `/ship` 再 `/opsx:archive`**，这个顺序是刻意设计的。如果反过来，先归档再发布，归档的内容就失去了与实际发布状态的实时对应。OpenSpec 的 `openspec/specs/` 应该始终反映系统当前状态，这意味着最后一个更新的文件应该是发布后生成的 Delta 规范合入结果。
这个顺序还隐含了一个假设：发布过程本身是可能失败的。如果 `/ship` 失败了，`/opsx:archive` 不会执行，specs/ 保持发布前的状态。一旦 `/ship` 成功，发布结果（版本号、CHANGELOG、部署状态）就已经确定，此时归档是顺理成章的收尾动作。

## 实践启示
### 如何真正用好三层串联
不要把三个工具当作独立的工具箱，需要的时候挑一个用。正确的方式是**让 OpenSpec 的产物成为团队的共享契约**。这意味着 design.md 不只是给 AI 看的，也是给人看的——评审结论应该包含人的批准记录。当 OpenSpec 产物在团队范围内可见可查，HARD-GATE 的设计审批就变成了一个有团队背书的质量门禁，而不是 AI 的自说自话。

### 避免门禁重叠
Superpowers HARD-GATE 已经卡住设计审批，gstack 的 `/plan-design-review` 就不应该再启用一次重复审查。实践中推荐让 Superpowers 管设计门禁，gstack 管代码审查和浏览器验证。两者的关注点不同：设计审批回答"这个方案是否合理"，代码审查回答"这个实现是否正确"。混用会导致评审冗余，拖慢开发节奏。

### TDD 例外的正确理解
TDD 三个例外（一次性原型、生成的代码、配置文件）是经过实践验证的务实策略，但实践中容易被滥用。判断标准不是"我想跳过"而是"跳过之后能否在后续补充测试"。一次性原型如果最终会成为生产代码，测试应该在原型验收后补上，而不是永远不写。生成代码（AI 生成的脚手架代码）如果没有业务逻辑，可以跳过，但生成的业务逻辑代码需要测试覆盖。

## 相关实体
- [Cli Anything Wechat Demo Conglin](../ch03/097-cli-anything.html)

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/three-tools-in-one-gstack-superpowers-openspec-engineering-ai-coding.md)

### 版本感知的工作流
整个流程高度依赖版本状态和变更追踪。当 `/ship` 执行 VERSION 升级、CHANGELOG 生成、PR 创建时，这些产物本身就是 OpenSpec 归档的输入。如果团队规模较大，建议在 PR 描述中包含 OpenSpec 的 proposal 链接，让 code reviewer 能够直接跳转到需求源头进行审查。这样就形成了一个完整的需求→实现→验证→发布的闭环。
- [Cli Anything Wechat Demo](../ch03/097-cli-anything.html)

---

