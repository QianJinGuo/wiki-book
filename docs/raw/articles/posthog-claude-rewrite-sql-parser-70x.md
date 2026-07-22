---
title: "用 Claude 重写 SQL 解析器，性能暴涨 70 倍：程序员做的不是写代码，而是搭建验证闭环"
source_url: "https://mp.weixin.qq.com/s/XdGP1hq1dCGocq5YSaz6UA"
source_site: "mp.weixin.qq.com"
source_author: "Robbie Coomber｜PostHog / InfoQ"
ingested: "2026-07-14"
sha256: "57800f0a15fb0625b8df7e39e2f6c82742bd68c0683a57262191fd21fddbfd50"
type: "raw-article"
tags: [claude-code, ai-coding, sql-parser, rust, pbt, rewriting, posthog]
status: "ingested"
---

# 用 Claude 重写 SQL 解析器，性能暴涨 70 倍

> PostHog 工程师使用多个并行 Claude Code 会话，将 C++ ANTLR 生成的 SQL 解析器重写为 Rust 手写递归下降解析器。结果：16K 行解析器代码，5K 行工具代码，生产环境平均快 454 倍。

## 背景

PostHog 允许用户直接使用 SQL 访问数据，将 SQL 转译成 ClickHouse SQL。解析器将 SQL 转 AST，是所有下游（访问控制、优化）的入口，操作不受信任输入。

原有解析器使用 **ANTLR**（C++ 版本）生成。ANTLR 将语法规则编译为 ATN（带栈的非确定性有限自动机），运行时通用解释器遍历图。支持任意动态前瞻，但基于图遍历的解释器速度永远无法与手写递归下降解析器媲美。

## 方法

Claude Opus 4.7 生成，Rust 编写。同时测试两种方法：
1. **性能优先**：递归下降 + Pratt 表达式循环，必要时加前瞻和回溯
2. **成功率优先**：尽可能遵循 ANTLR 行为，但状态转换用显式代码而非通用图遍历

最终效果差不多。

### 核心验证闭环

新解析器必须以现有 C++ 解析器为 **oracle**，确保所有实际查询完全一致。

**基于属性的测试（PBT）**：使用 Hypothesis 库定义属性（新解析器输出与 oracle 一致），Hypothesis 自动生成不满足属性的 SQL 输入。作者与 Claude 合作编写工具，基于 ANTLR `.g4` 语法文件自动生成 SQL 生成器（还为 .g4 文件写了新解析器），并添加 Token 交换、括号等排列。

**针对脆弱修复的提示工程**：Claude 经常做脆弱修复（加 1 Token 前瞻但实际需 2 Token）。修复方案：在编写修复代码前，强制将语法文件和 C++ 源代码加载到上下文。

### 迭代循环

1. 从 PBT、真实语料库、回归测试和"深入思考边缘情况"生成新的失败测试
2. 用 ShrinkRay 精简到最简单重现步骤
3. 深入思考最佳修复方案，查阅语法规则和 C++ 源码
4. 实施修复
5. 运行回归套件
6. 自动重新运行循环

**代码覆盖率引导**：基于代码覆盖率的测试用例生成使 SQL 分布更均衡，覆盖器识别未覆盖语法结构并针对性生成用例。

### 影子模式验证

新解析器以"影子模式"在生产环境运行，继续使用旧解析器并报告差异。从测试约 5 万查询扩展到快速测试数百万次解析。仅几小时后就将生产流量切换到影子模式。

## 结果

- **生产环境**：平均快 **454 倍**
- **笔记本电脑基准测试**：约 70 倍
- 在所有实际查询中与旧解析器完全等效
- 仅在极端边缘案例存在差异（如 `SELECT SELECT FROM FROM WHERE WHERE AND AND`）

## 最终产物

"手写"预测性递归下降解析器，搭载 Pratt 表达式核心，LL(2) 游标，局部有序选择式试探回溯。Claude Opus 4.7 生成，Rust，2026 年 5 月。

## 对工具链的影响

作者预测：解析器生成器提供 oracle，LLM 利用 PBT/模糊测试构建性能更高的"手工"解析器并将成新常态。

原文：https://posthog.com/blog/sql-parser
