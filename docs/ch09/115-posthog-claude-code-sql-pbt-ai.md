# PostHog 用 Claude Code 重写 SQL 解析器：PBT + 影子模式的生产级 AI 重写实践

## Ch09.115 PostHog 用 Claude Code 重写 SQL 解析器：PBT + 影子模式的生产级 AI 重写实践

> 📊 Level ⭐⭐ | 6.4KB | `entities/posthog-claude-rewrite-sql-parser-pbt.md`

# PostHog 用 Claude Code 重写 SQL 解析器

> PostHog 工程师使用多个并行 Claude Code 会话，将 C++ ANTLR 生成的 SQL 解析器重写为 Rust 手写递归下降解析器，生产环境平均快 454 倍。

## 摘要

PostHog 允许用户直接使用 SQL 访问数据，其 SQL 解析器是将用户 SQL 转译成 ClickHouse SQL 的入口点，也是访问控制、查询优化等所有下游操作的依赖。原有解析器使用 ANTLR（C++ 版本）生成，将语法规则编译为 ATN（带栈的非确定性有限自动机），运行时通过通用解释器遍历图——尽管优化程度极高，基于图遍历的解释器速度永远无法与手写递归下降解析器媲美。PostHog 团队使用 Claude Opus 4.7 在 Rust 中重新实现了整个解析器，最终产物为 16K 行解析器代码 + 5K 行工具代码。

## 核心要点

- **性能飞跃**：生产环境平均快 **454 倍**，笔记本电脑基准测试约 70 倍，所有实际查询与旧解析器完全等效
- **双方法并行**：Claude 同时生成"性能优先"（递归下降 + Pratt 表达式循环）和"成功率优先"（尽可能遵循 ANTLR 行为，但用显式代码而非通用图遍历）两种实现，最终效果相近
- **PBT 驱动开发**：使用 Hypothesis 库定义属性（新解析器输出与 oracle 一致），并基于 ANTLR `.g4` 语法文件自动生成 SQL 生成器
- **影子模式验证**：新解析器以影子模式在生产环境运行，从约 5 万查询扩展到数百万次，无任何偏差后切换
- **工具代码规模**：16K 行解析器代码 + 5K 行工具代码（包括 SQL 生成器、覆盖率引导测试、ShrinkRay 精简工具等）

## 深度分析

### 验证闭环是 LLM 代码生成的核心模式

PostHog 案例揭示了一个可复现的模式：LLM 生成代码的能力已经足够强，但**真正决定项目成败的不是"写得快不快"，而是"出了错能不能及时发现"**。团队将现有 C++ 解析器作为 oracle，用 PBT 自动发现差异、用覆盖率引导提高测试充分性、用影子模式在生产环境验证——这一闭环才是项目的核心资产。

这与 `Claude Code 在大型代码库中的 Harness 配置` 中强调的验证优先理念一致：AI 生成代码的生产力释放，依赖于配套的测试基础设施。

### 脆弱修复的识别与约束

实验中一个关键发现是 Claude 经常做"脆弱修复"——比如加 1 Token 前瞻但实际上需要 2 Token。修复方案是**在编写修复代码前，强制将语法文件和 C++ 源代码加载到上下文**。这意味着对 LLM 的上下文管理不仅是信息提供的问题，也直接影响输出质量。这一经验与 `Claude Code 工具系统架构` 中的上下文构建设计相互印证。

### 代码覆盖率的非传统用法

通常代码覆盖率用于衡量测试的完整性。但 PostHog 项目将其用作**测试用例生成的引导信号**——覆盖器识别未覆盖的语法结构，针对性生成用例。这是"AI 辅助的 AI 测试"的典型案例：LLM 生成的代码，由 LLM 辅助的工具来测试。

### 新常态的预测

作者预测：**解析器生成器提供 oracle，LLM 利用 PBT/模糊测试构建性能更高的"手工"解析器将成为新常态**。这一预测指向更广的范式——任何有明确 oracle（旧实现、规范文档、形式化定义）的代码重写任务，都可以复用这一模式。这与 `Harness Engineering` 中强调的"将验证内建于自动化流程"的思路高度一致。

### 多会话并行与人类的角色

项目中使用了多个并行 Claude Code 会话——不是单 Agent 顺序工作，而是多 Agent 并行探索不同方案。工程师的角色从"写代码"转变为"搭建验证闭环"：定义 oracle、编写 PBT 属性、审查差异、决定修复策略。这是 [Agent Harness Engineering 范式](https://github.com/QianJinGuo/wiki/blob/main/concepts/agent-harness-engineering-paradigm.md) 中"人类在环"的典型案例。

## 实践启示

1. **搭建验证闭环优先于编写代码**：在委托 LLM 生成生产级代码前，先确保有 oracle（旧实现、规范、测试套件）和自动验证机制（PBT、影子模式）。没有验证闭环的 LLM 生成代码，风险远高于收益。

2. **覆盖率引导是 AI 测试的有效策略**：当 LLM 生成代码时，传统的手写测试用例可能漏掉 LLM 特有的错误模式。使用覆盖率引导的自动测试生成，能更系统地发现 LLM 输出的边界问题。

3. **影子模式是生产级验证的关键环节**：在完全切换前，让新实现在生产环境以"只读"方式运行，收集真实流量下的差异。PostHog 从 5 万查询扩展到数百万次，数小时内完成切换——这是最低风险的切换策略。

4. **上下文管理直接影响 LLM 输出质量**：针对 LLM 的"脆弱修复"问题，应在 prompt 中强制包含完整的相关上下文（语法文件、源码）。这不是提高 prompt 技巧，而是工程化的上下文构建。

5. **工具代码的规模可能超过产品代码**：16K 行解析器对应 5K 行工具代码——测试工具、生成器、精简器、覆盖率工具。计划 AI 重写项目时，应将工具代码的开销纳入预算。

## 相关实体

- `Claude Code 大型代码库 Harness 配置`
- `Claude Code 工具系统架构`
- `Harness Engineering`
- [Agent Harness Engineering 范式](https://github.com/QianJinGuo/wiki/blob/main/concepts/agent-harness-engineering-paradigm.md)
- `Claude Code 循环类型官方分类`

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/posthog-claude-rewrite-sql-parser-70x.md)

---

