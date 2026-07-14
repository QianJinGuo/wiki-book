# GSD 完胜 OpenSpec 和 Superpowers？源码拆完发现：三者防的是 context rot 的三道防线

## Ch05.079 GSD 完胜 OpenSpec 和 Superpowers？源码拆完发现：三者防的是 context rot 的三道防线

> 📊 Level ⭐⭐ | 5.4KB | `entities/gsd-openspec-superpowers-context-rot-three-defenses.md`

# GSD 完胜 OpenSpec 和 Superpowers？源码拆完发现：三者防的是 context rot 的三道防线

> **来源**：运维有术（术哥）。对 OpenSpec、Superpowers、GSD 三个 AI 编程框架的源码级对比分析，指出三者解决的是 context rot 的三个不同症状阶段——需求漂移、流程退化、注意力稀释，存在递进关系而非替代关系。
> → [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/gsd-openspec-superpowers-context-rot-three-defenses-运维有术.md)

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

## 与现有 wiki 实体关系

- 补充 [Gsd Get Shit Done Context Management Tool](https://github.com/QianJinGuo/wiki/blob/main/entities/gsd-get-shit-done-context-management-tool.md)：该实体聚焦 GSD 实用操作（如何用 GSD 管理项目），本文聚焦三框架对比和各自 context rot 防御机制。
- 涉及 [Openspec Spec Driven Development Trae Solo](ch05/049-openspec.html) 和 [Three Tools In One Gstack Superpowers Openspec Engineering Ai Coding](ch05/098-ai-coding.html)：从源码角度分析了 OpenSpec 和 Superpowers 的机制差异。

---

