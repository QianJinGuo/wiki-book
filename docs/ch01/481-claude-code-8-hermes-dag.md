# Claude Code 动态工作流 8 译本（行小招译注 + Hermes DAG 对比）

## Ch01.481 Claude Code 动态工作流 8 译本（行小招译注 + Hermes DAG 对比）

> 📊 Level ⭐⭐ | 7.5KB | `entities/claude-code-dynamic-workflows-8th-translation-xingxiaozhao.md`

# Claude Code 动态工作流 8 译本（行小招译注 + Hermes DAG 对比）

→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/claude-code-dynamic-workflows-8th-translation-xingxiaozhao.md)
→ 主条目：[Claude Code Dynamic Workflows Multi Agent Orchestration](ch03/073-claude-code.md)

## 摘要

本文是 Thariq 撰写的 "Claude Code 动态工作流" 系列文章的中文译注第 8 译本，由译者行小招翻译并附加 Hermes DAG 并行模式的对比分析。原文聚焦 Claude Code 在多 Agent 编排（multi-agent orchestration）场景下的 `/goal`、`/loop`、ultracode-trigger 等组合使用方式；译注则把这些 prompt 技巧与 Hermes 的 DAG 任务调度做横向对比，提炼出"声明式 workflow + 触发器"的通用模式。

## 核心要点

- **8 译本的定位**：这是 Thariq 系列的第 8 个中文译本，前 7 译本已覆盖单 Agent prompt 技巧、本地 skill 注册、`/init` 命令、permission 沙箱等议题；本译本开始涉及 multi-agent orchestration。
- **原文核心**：Thariq 提出"提示 Claude 自己创建工作流（prompt claude to create workflow）"的反直觉用法——让 Claude 在 session 内临时组合工具，而不是预先用 YAML/JSON 写死工作流。
- **行小招译注的差异点**：加入 Hermes DAG 对比，强调"save & share workflow" 与 "token budget" 在企业场景下的可复用性，而原文更偏向个人开发者的 ad-hoc 用法。
- **Ultracode-trigger 机制**：通过 `/goal` + `/loop` 组合，让 Claude Code 持续运行直到满足目标，这是动态工作流的核心触发器。
- **与 Opus 4.5 / GPT-5.5 的搭配**：原文实验数据基于 Claude Opus 4.5；译注补充了 Opus 4.7 与 GPT-5.5 在并行多 Agent 场景下的延迟对比。

## 深度分析

### 1. "Prompt Claude to create workflow" 的设计哲学

原文最有洞察力的观点是：**Claude Code 的 workflow 不应该是预先编排好的脚本，而是 prompt-time 动态构造的临时编排**。Thariq 给出的经典 pattern 是：

```
/goal 完成 X 任务
/loop 持续运行直到 X 验证通过
```

这两条命令的组合让 Claude 进入"目标驱动 + 持续执行"模式，而无需用户在外部维护 YAML 编排文件。这种方式在 demo 场景下效果惊艳，但有两个隐患：

1. **Token 消耗不可预测**——Claude 内部循环可能消耗远超预期的上下文长度
2. **工作流不可复用**——每次 session 的 workflow 都是临时的，无法团队共享

行小招译注补充 Hermes DAG 对比恰好弥补这两个弱点：Hermes 把 workflow 抽成可序列化的 DAG 图，并支持 token budget 上限和 share link 的企业级能力。

### 2. Ultracode-trigger：触发器即工作流

原文的 ultracode-trigger 模式本质上是把"事件触发 → Agent 执行"做成声明式：

- 触发器：文件改动 / Git hook / cron / webhook
- Agent：被触发的 Claude Code session
- 验证：触发器内嵌的检查器（lint / test / type-check）

这种模式在 Hermes 里等价于 "DAG node + scheduler trigger"，但 Hermes 进一步允许 DAG node 之间传递结构化数据，而 Claude Code 的 trigger 只能向 session 注入纯文本 prompt。

### 3. Token-budget 的工程意义

原文用一节专门讨论 token budget，因为它在 `/loop` 场景下至关重要：

- 没有 budget → 可能陷入无限循环烧光上下文
- 固定 budget → 可能在关键决策时预算耗尽
- 动态 budget（自适应）→ 难以预估成本

译注对比 Hermes 的做法：Hermes 用"DAG node budget + cross-node aggregation" 的双层预算控制，既能限定单节点开销，又能在 DAG 层做跨节点累计，对企业成本控制更友好。

### 4. Save & Share Workflow：从个人技巧到团队资产

原文最后讨论的 save & share 功能是 Thariq 系列的关键升级：把 session 内临时编排的工作流保存为可分享的 skill / command：

```
/save-workflow my-refactor-pattern
/share https://internal/claude-workflows/my-refactor-pattern
```

这让"动态工作流"从个人 demo 技巧变成团队可复用的资产。Hermes 在 2026-06 已经支持类似的"workflow version + ACL" 机制，但 Claude Code 的优势在于"零配置——直接 /save 即可"，对个人开发者更友好。

### 5. 与 Opus 4.7 的搭配注意事项

原文基于 Opus 4.5 写作，但译注补充了 4.7 的变化：

- 新版 tokenizer 让同样 prompt 多消耗 1.0-1.35x token → workflow 的 token budget 需要上调
- 4.7 引入 adaptive thinking → `/loop` 不再需要手动 `thinking budget`，但需要重新调校 effort 等级
- `/ultrareview` 是 4.7 新增的 workflow 节点 → 可作为 ultracode-trigger 后的"验证步骤"嵌入

## 实践启示

1. **小团队先学 Claude Code 动态工作流，再考虑迁移到 Hermes**：Claude Code 的 prompt-time workflow 学习曲线低，团队成员能在 1-2 小时内上手；Hermes DAG 需要 YAML/JSON 配置能力，门槛更高。
2. **企业场景优先 token budget 控制**：在 Claude Code 上用 `/loop` 时务必设置单次 session 的预算上限（推荐 200K token 起步），避免被自动 loop 烧光预算。
3. **动态工作流 ≠ 一次性脚本**：Thariq 反复强调 `/save-workflow`，是因为这个习惯能让 prompt 经验沉淀为团队资产；不要让动态 workflow 永远停在 session 临时态。
4. **Hermes DAG 对 Claude Code workflow 的补充**：当 Claude Code 动态 workflow 不够用（多 step 编排 / 跨 session 数据传递 / 团队共享）时，再考虑迁移到 Hermes 或类似 DAG 调度系统。
5. **Opus 4.7 升级要重新调校 workflow**：4.7 的 tokenizer 变化和 adaptive thinking 让原有 4.5 的 prompt 模板部分失效，迁移时建议在小流量场景下做 A/B 对比再全量切换。

## 关联实体

- [Claude Code Dynamic Workflows Multi Agent Orchestration](ch03/073-claude-code.md) — 主条目，51KB 完整多 Agent 编排指南
- [两万字详解Claude Code源码核心机制](ch03/073-claude-code.md) — Claude Code 源码级机制
- [Gsd Get Shit Done Context Management Tool](ch01/196-gsd-get-shit-done-context-management-tool.md) — GSD 上下文管理工具
- [深入理解 Claude Code 源码中的 Agent Harness 构建之道](ch03/073-claude-code.md) — Claude Code 中的 agent harness 构建
- [存之有序治之有矩Agent 记忆系统的工程实践与演进](ch04/503-agent.md) — Agent 记忆系统
- [Claude Code Harness Deep Understanding](ch01/378-claude-code-harness-deep-understanding.md) — Claude Code harness 深度解析
- [Claude Code Harness Deep Dive Founder Park](ch03/073-claude-code.md) — Founder Park 的 Claude Code harness 深度文章

## 相关实体

- [MOC](https://github.com/QianJinGuo/wiki/blob/main/moc/workflow-orchestration.md)

---

