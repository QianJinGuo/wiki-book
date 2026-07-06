# Matt Pocock Skills — AI编程技能集合

## Ch07.036 Matt Pocock Skills — AI编程技能集合

> 📊 Level ⭐⭐ | 9.2KB | `entities/mattpocock-skills-grill-me-grill-with-docs-caveman.md`

## 概述
Matt Pocock（TypeScript 类型系统专家，Total TypeScript 作者）整理的 AI 编程 Skill 集合。14 个 Skill 全部为纯 Markdown 文件，零依赖，零安装。
安装：`npx skills@latest add mattpocock/skills`

## Skill 分类
**工程类（10个）**：grill-with-docs、diagnose、tdd、improve-codebase-architecture、triage、to-prd、to-issues、zoom-out、prototype、setup
**效率类（4个）**：grill-me、caveman、handoff、write-a-skill

## 核心 Skill 详解
### grill-me — 需求追问
**问题**：大多数人在看到错误答案之前不知道自己真正想要什么。
**核心理念**：AI 不停追问用户，直到双方理解完全一致。每次只问一个问题，并给出 AI 的推荐答案供用户确认。
**与 Claude Code 内置 plan mode 的本质区别**：
| | Claude Code plan mode | grill-me |
|---|---|---|
| 交互方式 | 选择题 | 问答题 + AI 推荐 |
| 适用人群 | 有经验的程序员 | 所有用户（包括非技术背景） |
| 输出 | 粗粒度选项 | 完整 PRD |
**安装**：`npx skills@latest add mattpocock/skills/grill-me`

### grill-with-docs — 术语对齐
解决"鸡同鸭讲"问题——你和 AI 对同一概念用不同叫法，导致代码指代混乱。
**三板斧**：
1. **统一语言**：每确定一个概念自动写入 `CONTEXT.md`，后续所有命名统一用术语
2. **交叉验证**：AI 主动对比用户描述和代码实现，指出不一致（"你说支持部分退款，代码只能整单退款——哪个对？"）
3. **ADR 记录**：满足"难撤销 + 不看上下文会困惑 + 有方案取舍"三个条件时建议创建 Architecture Decision Record

### caveman — 极简回复模式
砍掉寒暄、解释性文字和模糊措辞，只保留技术要点。安全/破坏性操作时自动退出该模式。

## 核心理念
这些 Skill 的价值在于：将《程序员修炼之道》《领域驱动设计》《极限编程》等几十年经典工程实践，浓缩成 AI 可执行的格式。
> "AI 编程的速度在加快，但软件工程的根基没变。越快的工具，越需要好的工程实践来兜底。"

## 深度分析
### Skill 的工程本质：从"约束AI"到"约束人"
Matt Pocock 的 Skill 体系代表了一种范式转移。Karpathy 的 CLAUDE.md 思路是"治理AI"——通过约束AI行为来提升输出质量。但 Matt Pocock 走的是"治理人"路线——通过引导用户思考来弥补需求不明确的问题。
这两条路并不矛盾：Karpathy 解决的是"AI 写代码乱"的问题（已知需求，AI 不认真执行）；Matt Pocock 解决的是"用户不知道自己真正要什么"的问题（需求本身就模糊）。

### grill-me 的深层价值：强制延迟满足
grill-me 的核心机制——不停追问、每次只问一个问题——本质上是一种强制性的延迟满足训练。在 AI 时代，人们倾向于"快说出需求、快拿结果"，但软件工程的经典教训是：前期澄清的代价远低于后期返工。
grill-me 将《程序员修炼之道》中"先明晰需求再动手"的原则产品化，通过 AI 追问强制用户面对自己不清晰的决策点。

### 三类 Skill 的协同矩阵
| Skill | 问题类型 | 干预时机 | 核心机制 |
|-------|---------|---------|---------|
| grill-me | 需求模糊 | 开发前 | 追问澄清 |
| grill-with-docs | 术语混乱 | 开发中 | 上下文积累 |
| caveman | 输出冗余 | 开发后 | 压缩回复 |
三者形成完整闭环：grill-me 确保方向正确 → grill-with-docs 确保理解一致 → caveman 确保执行高效。

### 与 DDD/SDD 的渊源
grill-me 对应 DDD 的 Event Storming 环节——通过不断追问将模糊业务愿景精确化。grill-with-docs 直接对应 DDD 的 Ubiquitous Language 实践。caveman 则类似极限编程中的"简洁编程"原则——只做必要的事。
这些 Skill 并非新发明，而是将经典工程方法论重新包装成 AI 可执行的格式。

## 实践启示
### 立即可用的组合
**新项目启动**：grill-me（需求澄清）→ grill-with-docs（术语对齐）→ caveman（开发执行）
这套组合是最高频的使用路径。grill-me 在空目录下运行效果最佳，因为 AI 可以从零开始构建完整的上下文。
**调试场景**：diagnose + caveman 组合。先用 diagnose 系统化定位问题根因，再用 caveman 获取极简解决方案。

### caveman 的安全边界
caveman 模式在安全/破坏性操作时会自动退出，这是关键的设计细节。不要试图绕过这个限制——当 AI 拒绝在 caveman 模式下执行删除操作时，说明该操作需要更审慎的上下文。

### CONTEXT.md 的维护策略
grill-with-docs 会自动积累 CONTEXT.md，但需要定期清理：

- 每完成一个大功能后，合并相关的上下文条目
- 避免 CONTEXT.md 膨胀到失去快速查阅价值
- 术语定义尽量简短：用一句话说明，不要用段落

### ADR 的触发条件
grill-with-docs 建议创建 ADR 时满足三个条件：难撤销、不看上下文会困惑、有方案取舍。实操中这个阈值略高，建议：当团队对某个技术选型出现2次以上分歧时，就创建 ADR 记录决策过程。

### write-a-skill 的正确用法
Matt Pocock 的 Skill 本质上都是 Markdown——这意味着你可以在他的 Skill 基础上定制。可以先安装 `grill-me`，在日常使用中记录它漏掉的问题场景，然后用自己的经验扩展它，最终通过 `write-a-skill` 输出为独立 Skill。

## 完整工作流（6 步）

Matt Pocock Skills 不只是零散命令，它们串成一条完整开发流：

1. **/grill-with-docs** — 需求澄清 + 领域语言沉淀到 CONTEXT.md
2. **/to-prd** — 对话整理成 PRD 文档
3. **/to-issues** — 按用户可感知行为拆垂直切片（不是按文件拆）
4. **/tdd** — red-green-refactor，每次只推进一个可观察行为
5. **/diagnose** — 先复现 → 缩小范围 → 假设 → 验证 → 修复 → 补回归
6. **/improve-codebase-architecture** — 周期性修剪（重复收一收、职责理一理、ADR 补一补）

陌生模块先跑 /zoom-out，从系统层面理解再动手。

## 与其他工作流对比

| 工作流 | 关注重点 | 适合场景 | 取舍 |
|--------|----------|----------|------|
| Matt Pocock Skills | 需求澄清 + 测试 + 诊断 + 架构整理 | 日常开发、长期维护、小团队 | 灵活但需主动决策 |
| GSD | 长周期任务管理 + 上下文延续 | 跨天任务、多文件改动 | 流程完整，小任务略重 |
| BMAD | 角色分工 + 规范化研发 | 从 0 到 1 产品、多人协作 | 体系完整，学习成本高 |
| Superpowers | TDD + 评审纪律 | 重视测试质量 | 对测试纪律要求高 |
| Spec-Kit | 规格驱动开发 | 企业项目、需求评审先行 | 前期投入大，过程可控 |

→ [Superpowers 6.0 SDD 评审重写](https://github.com/QianJinGuo/wiki/blob/main/entities/superpowers-6-sdd-review-redesign-file-handoff.md)
→ [三器合一工程化实战](https://github.com/QianJinGuo/wiki/blob/main/entities/three-tools-in-one-gstack-superpowers-openspec-engineering-ai-coding.md)

## 相关概念
- SDD（Spec-Driven Development） — 规格驱动开发，与 grill-me/grill-with-docs 理念相通
- TDT（Task-Driven Development） — 任务驱动开发，grill-me 追问后最终产出的即为 TDT
## 相关实体
- [Andrej Karpathy Claude Md 134K Stars 2026](https://github.com/QianJinGuo/wiki/blob/main/entities/andrej-karpathy-claude-md-134k-stars-2026.md)
- [Openai Codex 521 Update Appshots Goal Computer Use](https://github.com/QianJinGuo/wiki/blob/main/entities/openai-codex-521-update-appshots-goal-computer-use.md)
- [Graphify Software Engineering Knowledge Graph](https://github.com/QianJinGuo/wiki/blob/main/entities/graphify-software-engineering-knowledge-graph.md)
- [Anthropic Claude Code Large Codebase Best Practices 50002A089323](https://github.com/QianJinGuo/wiki/blob/main/entities/anthropic-claude-code-large-codebase-best-practices-50002a089323.md)
- [Stepan Gershuni Ai Native Startup Guide](https://github.com/QianJinGuo/wiki/blob/main/entities/stepan-gershuni-ai-native-startup-guide.md)

---

