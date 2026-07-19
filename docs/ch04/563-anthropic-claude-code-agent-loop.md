# Anthropic 大规模代码迁移方法论 — Claude Code 多 Agent Loop 的工程实践

## Ch04.563 Anthropic 大规模代码迁移方法论 — Claude Code 多 Agent Loop 的工程实践

> 📊 Level ⭐⭐ | 4.2KB | `entities/anthropic-claude-code-large-scale-code-migration-2026.md`

# Anthropic 大规模代码迁移方法论 — Claude Code 多 Agent Loop 的工程实践

> **Background**：本文档基于 Anthropic 官方博客 2026-07-16 发布的文章建立，总结了 Anthropic 内部使用 Claude Code 进行大规模代码迁移（Bun Zig→Rust、Mike Krieger Python→TypeScript）的六步方法论。参考了 Anthropic 官方博客多个来源。

## 核心洞见

"You don't fix the code. You fix the process (loop) that produced the code."

## 两个关键案例

### Bun Zig→Rust（Jarred Sumner）
- 100 万+ 行代码，< 2 周完成
- 100% 测试套件通过后 merge
- 19 个回归 post-merge，全部修复
- Token 消耗：59 亿 input + 6.9 亿 output（~$165K API pricing）
- 成果：memory leaks 从 6,745MB → 609MB，binary 缩小 19%，性能提升 2-5%

### Python→TypeScript（Mike Krieger）
- 165,000 行 TypeScript 在一个周末完成
- 数百个 agent、8 个 phase gate、3 轮 adversarial review
- 最终 parity check diff 每个命令的输出 vs Python 原版
- 编译时间从 30min → 2s，binary 启动快 6x，退休独立部署 pipeline

## 六步方法论

### 前置：构建强 Judge
Judge 必须能对等地评估原始代码和目标代码。步骤：分类测试 → 重写为可移植断言 → 验证 judge（对好代码通过，对故意写坏的代码失败）。

### Step 1: 创建 Rulebook + Dependency Map + Gap Inventory
- **Rulebook**: 结构保持型翻译用查表规则，重新设计型用设计文档
- **Dependency Map**: 文件依赖分析，决定并行工作流的分片
- **Gap Inventory**: 语言特有的差距（Zig→Rust 是内存管理，Python→TS 是 interface contract）

### Step 2: 压力测试规则
小规模迁移作为"shakedown cruise"：一个 agent 用 rulebook 翻译 3 个文件、一个 agent 像资深工程师一样翻译 3 个文件、一个 agent 用 diff 创建新规则。在大规模部署前捕获关键问题。

### Step 3: 并行翻译所有文件
Multi-agent loop 架构：implement → review → fix。使用小模型做 implementer、大模型做 reviewer。Adversarial review（2 个 reviewer，分歧 → 第三个裁决）。Rulebook 持续增长，代码从不手动修补。当 reviewer 反复发现相同错误时，修改 rulebook 而非逐文件修补，然后重新生成受影响的 batch。

### Steps 4-6: 编译 → 运行 → 匹配行为
同一 loop 架构，逐步减少 human judgment。Fixer agent 处理 compiler errors → smoke test crashes → test suite failures。Build daemon 序列化重建（最昂贵的操作只允许一个进程执行）。

## 最佳实践
- 关注 pattern，而非 individual failures（fixer agent 处理个体问题）
- Adversarial review + mechanical verification
- 不要在所有环节用最大模型（implementer 用小模型，reviewer 用大模型）
- 前置 human hours（rulebook + stress test 最耗时）
- 让工作队列 mechanical & resumable（"完成"=输出文件在磁盘上存在）
- 审查 loop results，而非 individual code

## 与其他实体的关系

本实体提供了 **多 agent loop 用于生产级代码迁移** 的具体方法论，与以下实体互补：

- [Claude Code Dynamic Workflows](../ch09/089-claude-code-dynamic-workflows.html)（动态工作流基础）
- [Claude Code Loop Types](../ch09/127-claude-code-loop-types.html)（loop 类型官方分类）
- [Agentic Loop Engineering](../ch05/007-loop-engineering.html)（loop 工程框架）
- [Claude Code Engineering Truth](../ch03/076-claude-code.html)（工程实践）
- [Claude Code 架构](../ch03/076-claude-code.html)

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/anthropic-claude-code-large-scale-code-migration-2026.md)

---

