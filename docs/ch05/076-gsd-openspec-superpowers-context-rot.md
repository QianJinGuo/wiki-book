# GSD 完胜 OpenSpec 和 Superpowers？源码拆完发现：三者防的是 context rot 的三道防线

> 📊 Level ⭐⭐⭐⭐ | 13.4KB

> **来源**：运维有术（术哥）。对 OpenSpec、Superpowers、GSD 三个 AI 编程框架的源码级对比分析，指出三者解决的是 context rot 的三个不同症状阶段——需求漂移、流程退化、注意力稀释，存在递进关系而非替代关系。
> → [原文存档](https://mp.weixin.qq.com/s/JvLeQjHJvrf06iLtK6XmIg)

## 核心洞见：三层防御模型

三个框架不是在竞争，而是在不同的纵深防御 context rot：

```
OpenSpec     → 防需求/契约腐烂（最外层）
Superpowers  → 防流程纪律退化（中层）
GSD          → 防注意力本身被噪声稀释（最内层）
```

### OpenSpec：防 AI 该做什么的腐烂

**诊断**：context rot 的第一个症状是 AI 把需求在长对话里搞漂移了。

**解决方案**：把需求从易腐烂的对话历史搬到版本化的文件系统。核心三件套——`specs/`（当前真相）、`changes/`（进行中的变更，含 delta spec）、`changes/archive/`（归档）。

**Delta Spec 机制**：不重写整个规范，只写增量。三个固定区段——ADDED / MODIFIED / REMOVED Requirements。优势：Clarity（只看 diff）、Conflict avoidance（同时碰同一份 spec 只要改不同 requirement）、Brownfield fit（适配现有项目，不用先文档化整个遗留系统）。

**天花板**：不管 context engineering，一旦对话变长 AI 脑子开始糊，spec 再规范也读偏。

### Superpowers：防 AI 怎么做事的腐烂

**诊断**：context rot 的第二个症状是 AI 跳过 TDD、不做 code review、直接动手改代码（流程纪律退化）。

**解决方案**：14 个自动触发的 skill，把好习惯变成条件反射。Even a 1% chance → invoke skill check BEFORE clarifying question。

**Red Flags 表**：防止模型自我开脱的六条心理防线（"This is just a simple question" → "Questions are tasks. Check for skills."）。

**硬门禁**：brainstorming 禁止在用户批准设计前写任何代码。TDD skill 强制先写测试再写代码。

**Subagent 支持**：subagent-driven-development 和 dispatching-parallel-agents 都支持 fresh context 和并行 dispatch，但触发方式靠模型 ad-hoc 判断，缺乏自动依赖分析和原子锁。

**天花板**：无跨会话状态（/clear 后必须从头加载），并行 ad-hoc，spec 无 delta 合并机制。

### GSD：防 AI 脑子本身的腐烂

**诊断最深**：spec 再清楚它也读偏，纪律再严它也执行不到位——只要对话够长，注意力本身会被稀释。

**解决方案最激进**：不试图让 AI 在长对话里保持清醒，直接放弃长对话。每个离散任务交给专门的 subagent（干净上下文窗口），报告回到轻量级 orchestrator。

**Orchestrator 设计原则**：故意做得很薄——不推理领域、不写代码、不解释结果，只负责路由。这样上下文增长很慢。

**34 个 Agent**：Researchers（4 路并行）、Synthesiser、Planners、Checkers（最多 3 轮修订）、Executor（波次内并行）、Verifier、Mapper（4 路并行）、Auditor。

**Wave Execution**：按依赖关系分成 wave，同一 wave 内并行，wave 间串行。并发安全：STATE.md.lock 原子锁（O_EXCL 创建，>10 秒自动清理）+ Per-wave hook run。

**.planning/ 跨会话记忆**：PROJECT.md + REQUIREMENTS.md + ROADMAP.md + STATE.md + phases/ 目录。continue-here.md 机制实现断点续传。

**承认的代价**：Coordination overhead（1-5 分/agent）、Opacity during execution、Context stitching cost、Model cost amplification（5 倍）。提供 /gsd-quick 和 /gsd-fast 跳过完整流程。

## 源码实测数字澄清

针对流传叙事的纠正：
- GSD 有 33 个 Agent → ls agents/ 实测 **34 个**
- GSD 有 86 个命令 → commands/gsd/ 实测 **70 个**
- GSD 有 142 项功能 → FEATURES.md 章节标题约 **44 项核心**
- Superpowers 不管上下文工程 → 部分错误，有 subagent 机制只是不如 GSD 结构化
- "Improve & Repeat 博客实测 GSD 是唯一产出可用应用的框架" → 单一样本，不构成统计结论

## 理想用户画像

| 框架 | 用户特征 | 核心痛点 |
|------|---------|---------|
| OpenSpec | 已有完整开发流程，只缺 AI 需求对齐方式 | AI 忘了最初要它做什么 |
| Superpowers | 认可 TDD/code review 但经常偷懒不做 | AI 跳过测试直接写代码 |
| GSD | 多文件、多会话、跨天的大型项目 | AI 在第 N 个文件开始腐烂 |

## 深度分析

### Context rot 是 attention 的固有属性，不是可修复的 bug

文章引用 GSD 官方文档 docs/explanation/context-engineering.md 的描述：随着窗口被填满，模型不会大声失败——它继续回答，但回答质量在悄悄退化。四种典型表现：与早期已确认的决策自相矛盾、代码风格偏离会话开始时的约定、计划忽略早已埋进历史的需求、对 20 轮对话前还正确的文件名和函数签名产生幻觉。关键认知是：这不是模型 bug，而是 transformer attention 在长序列上的固有属性——这意味着任何"更聪明的 prompt"都无法根治，只能靠架构层面的防御来绕开。

这个定位解释了为什么三个框架都选择了"外部化"路线：既然长上下文本身不可靠，就把状态搬到不会腐烂的介质上——OpenSpec 搬到版本化的 spec 文件，GSD 搬到 .planning/ 目录，Superpowers 搬到自动触发的 skill 文件。三者共享同一个底层假设：文件系统比对话历史可靠。

### 三道防线是洋葱结构：可叠加而非二选一

源码拆完后的核心结论是递进而非替代：OpenSpec 外层防需求漂移 → Superpowers 管执行纪律 → GSD 最内防注意力被噪声稀释。三者可以叠加使用，叠得越多防御越厚，但维护成本也越高。

从各自的"不做清单"看互补性更清楚：OpenSpec 显式不管 context engineering、不管执行过程、不管代码质量；Superpowers 不管跨会话状态、不管结构化并行、不管 spec 演进（brainstorming 产出的设计文档没有 delta 合并机制）；GSD 的 plan-checker 修订门禁反而不强制 TDD。每一层的盲区恰好是相邻一层的主场——这正是"洋葱"比喻的实质：没有任何一层单独够用，但也不需要任何一层单独够用。

### 结构化并行是 GSD 与 Superpowers 的真正分水岭

两者都有 subagent 机制（subagent-driven-development 和 dispatching-parallel-agents 都支持 fresh context + 并行 dispatch），流传说法"Superpowers 不管上下文工程"部分错误。真正的差异在于工程化程度：Superpowers 的并行触发靠模型/用户 ad-hoc 判断，没有自动依赖分析，没有原子锁；GSD 则把并行做成了 wave execution——任务按依赖关系分 wave，wave 内并行、wave 间串行，配 STATE.md.lock 原子锁（O_EXCL 创建，防止两个 agent 同时读改写状态文件）和 per-wave hook run 两个并发安全机制。

这解释了"Improve & Repeat 博客实测 GSD 是唯一产出可用应用的框架"的传播现象为何站不住：单一样本不构成统计结论，GSD 的优势边界在多文件、多会话、跨天的大型项目，小项目用它只会白付 5 倍 model 成本和每个 agent spawn 1-5 分钟的协调开销。

### GSD 的激进之处：放弃长对话，而不是拯救长对话

前两个框架的思路都是"让 AI 在长对话里保持清醒"（把需求钉住、把纪律钉住），GSD 的诊断最深也最激进——直接放弃长对话。核心洞察是 most of the work in a coding session does not need to happen in the main context at all：每个离散任务交给干净上下文窗口的专门 subagent，报告回到一个故意做得很薄的 orchestrator——不推理领域、不写代码、不解释结果，只负责路由，因此上下文增长很慢。

值得注意的对称设计：GSD 不只防 subagent 的上下文腐烂，连 orchestrator 自己的上下文腐烂也防——continue-here.md 机制在 orchestator 上下文快满时把进度写入文件，下次开新会话从断点继续。腐烂防御被应用到了系统的每一层。

## 实践启示

1. **先诊断腐烂层，再选框架**：AI 忘了最初要它做什么 → OpenSpec；AI 跳过测试直接写代码 → Superpowers；AI 在第 N 个文件开始糊 → GSD。症状对号入座，避免给小项目套上 5 倍成本的仪式化流程。
2. **把状态从对话搬进文件系统**：无论用哪个框架，防 context rot 的共同原理都是外部化——spec 用 delta 增量（ADDED/MODIFIED/REMOVED）而非重写全量，项目状态用 .planning/ + STATE.md 持久化，跨会话靠 continue-here.md 断点续传。
3. **给模型的好习惯装上机械触发器**：Superpowers 的"1% 可能适用就先 check skill、skill check 先于 clarifying question"和 Red Flags 表（"This is just a simple question" → "Questions are tasks. Check for skills."）说明：靠模型自觉的纪律必然退化，要把习惯变成条件反射式的自动门禁。
4. **并行必须有锁，否则是数据竞争**：多 agent 同时读写共享状态文件时，照抄 GSD 的 O_EXCL 原子锁 + 依赖分 wave（wave 内并行、wave 间串行）模式；没有自动依赖分析和原子锁的 ad-hoc 并行（Superpowers 式）适合人工监督下的小规模场景。
5. **orchestrator 要刻意做薄**：只路由、不推理领域、不写代码、不解释结果，才能让调度层的上下文增长足够慢——这是长任务多 agent 系统不成文的隐含前提。
6. **别轻信框架评测叙事，去数源码**：流传的"33 个 Agent"实测 34、"86 个命令"实测 70、"142 项功能"实际约 44 项核心、"唯一产出可用应用"是单一样本——结论级别从源码实测来，不从二手转发来。

## 与现有 wiki 实体关系

- 补充 [Gsd Get Shit Done Context Management Tool](https://github.com/QianJinGuo/wiki-public/blob/main/entities/gsd-get-shit-done-context-management-tool.md)：该实体聚焦 GSD 实用操作（如何用 GSD 管理项目），本文聚焦三框架对比和各自 context rot 防御机制。
- 涉及 [Openspec Spec Driven Development Trae Solo](https://github.com/QianJinGuo/wiki-public/blob/main/entities/openspec-spec-driven-development-trae-solo.md) 和 [Three Tools In One Gstack Superpowers Openspec Engineering Ai Coding](https://github.com/QianJinGuo/wiki-public/blob/main/entities/three-tools-in-one-gstack-superpowers-openspec-engineering-ai-coding.md)：从源码角度分析了 OpenSpec 和 Superpowers 的机制差异。

---

