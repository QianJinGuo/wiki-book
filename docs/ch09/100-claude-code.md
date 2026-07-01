# Claude Code 命令使用指南

## Ch09.100 Claude Code 命令使用指南

> 📊 Level ⭐⭐ | 6.0KB | `entities/claude-code-commands-usage-guide.md`

# claude-code-commands-usage-guide

- `clear`：彻底清空，重新开始（不适合日常整理，适合"重开一局"）
- `compact`：压缩上下文，保留主线清理包袱（比 clear 更该高频使用）
- `context`：可视化查看上下文使用情况，决定要不要收拾
- `resume`：恢复之前的会话，减少重复铺垫
- `rewind`：回退到之前的节点，精细化回退而非全盘重开）

## 相关实体
- [Claude Code Openclaw Usage Ettin](ch09/029-claude-code-openclaw-usage-ettin.md)
- [Obsidian Claude Code Integration Guide](ch09/099-obsidian-claude-code-integration-guide.md)
- [Claude Code Self Repair Hooks Memory Config](ch04/150-ai.md)
- [刚刚Opus 47发布相比46核心变化与Claude Code搭配最佳实践](ch03/073-claude-code.md)
- [打造可靠的 Ai 编程环境Claude Code Hooks 完整开发者指南 V2](ch04/150-ai.md)

→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/claude-code-commands-usage-guide.md)

## 深度分析

### 1. 上下文管理是 Claude Code 高效使用的第一道门槛

文章将命令分为五大类，"会话与上下文管理"排在第一优先级。这个排序反映了 Claude Code 使用的核心矛盾：**上下文长度是稀缺资源，而 AI Coding 任务天然需要大量上下文** 。`compact` 命令被标注为"比 clear 更该高频使用"——因为 `clear` 过于激进（彻底清空），而 `compact` 可以保留主线同时清理包袱，是一个更精细的上下文管理工具。`context` 命令让用户可视化看到上下文使用情况再做决策，这是一个"诊断-决策"的主动管理模式，而非被动等到上下文爆满才处理。

### 2. 权限系统是 Claude Code 安全与效率的平衡器

第三类命令中，`permissions` 管理 allow/ask/deny 三类规则，`deny` 优先级最高 。这说明 Claude Code 的权限模型是一个分层结构：deny（硬边界）> ask（需要确认）> allow（直接执行）。`auto mode` 是运行时尽量少打断，但文章特别强调它"不替代 permissions 静态边界"——这意味着 `auto mode` 是运行时优化，而 permissions 是架构层面的安全基线，不能混淆两者 。

### 3. `fewer-permission-prompts` 体现了用历史数据优化工作流的设计思路

这个命令基于历史使用记录，把低风险高频确认沉淀成 allowlist 。这是一个非常实用的设计：Claude Code 不是在每次运行时重新学习权限规则，而是通过历史数据自动建立个性化权限配置。对团队来说，这个机制可以让整个团队的权限配置收敛到一个合理的基线，减少重复确认的同时保持安全边界。

### 4. `skills` vs `memory` 的分层设计是知识管理的方法论体现

`memory` 用于存放长期稳定信息（事实类），`skills` 用于把重复流程沉淀成可复用命令（流程类） 。这个区分非常有价值：CLAUDE.md 放事实，skills 放流程。事实是静态的，流程是动态的；事实变化频率低，流程变化频率高需要经常执行。这种分层设计让不同类型的知识各归其位，避免了用一个工具解决两种不同性质问题带来的混乱。

### 5. 团队场景的规模化使用依赖 `team-onboarding` 和 `batch`

文章在第五类"高阶效率"中提到的 `team-onboarding`（生成团队上手指南初稿）和 `batch`（并行交后台 agent）代表了 Claude Code 从个人效率工具向团队协作工具演进的意图 。`batch` 命令特别适合大规模可拆分的代码改造（并行交后台 agent，独立 git worktree），这意味着 Claude Code 在团队场景中不只是写代码的助手，还可以是代码重构的协调者。

## 实践启示

1. **每天优先用 `context` 检查上下文再用 `compact` 清理**：不要等上下文爆满才处理。建议在每次任务阶段性收口后主动运行 `context` 查看占用情况，再决定是否需要 `compact`。这个习惯可以避免上下文膨胀导致的性能下降和成本浪费 。

2. **`rewind` 优先于 `clear` 用于错误恢复**：遇到模型跑偏时，`rewind` 可以精细化回退到之前的节点，保留有效上下文而不是全盘重开 。这是比 `clear` 更符合实际工作流的错误恢复方式。

3. **权限配置遵循 deny > ask > allow 的优先级设计**：对于涉及文件写入、外部命令执行、数据删除等高风险操作，优先设置为 deny；对于需要监控但不阻断的操作设置为 ask；对于低风险高频操作（读文件、查日志）设置为 allow 。用 `permissions` 命令定期审视权限配置，而不是配置完就再也不看。

4. **模型选择遵循"执行型优先效率，判断型优先能力"原则**：`model` 命令用于判断任务类型 。简单执行任务（代码生成、格式转换）用低成本快速模型，复杂判断任务（架构决策、安全审查、复杂调试）用最强能力模型。这个原则可以显著优化 Claude Code 的使用成本。

5. **`skills` 沉淀而非每次重写**：当一个任务执行超过3次时，应该用 `skills` 把它沉淀成可复用命令，而不是每次重新描述流程 。对于团队来说，把高频流程沉淀到 shared skills 中，可以让整个团队的 Claude Code 使用效率收敛到较高水平，而不需要每个人都从零开始积累。

→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/claude-code-commands-usage-guide.md)

---

