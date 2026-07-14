# PostHog 用 Claude Code 重写 SQL 解析器：PBT + 影子模式的生产级 AI 重写实践

## Ch09.166 PostHog 用 Claude Code 重写 SQL 解析器：PBT + 影子模式的生产级 AI 重写实践

> 📊 Level ⭐⭐ | 2.3KB | `entities/posthog-claude-rewrite-sql-parser-pbt.md`

# PostHog 用 Claude Code 重写 SQL 解析器

> PostHog 工程师使用多个并行 Claude Code 会话，将 C++ ANTLR 生成的 SQL 解析器重写为 Rust 手写递归下降解析器，生产环境平均快 454 倍。

## 背景

原有解析器用 ANTLR（C++）生成，将语法规则编译为 ATN（非确定性有限自动机），运行时通用解释器遍历图。尽管优化程度极高，基于图遍历的解释器速度永远无法与手写递归下降解析器媲美。

## 方法

Claude Opus 4.7 生成，Rust 编写。以现有 C++ 解析器为 **oracle**，**基于属性的测试（PBT）** 为核心验证手段。

### PBT 驱动开发

使用 Hypothesis 库定义属性（新解析器输出与 oracle 一致），自动生成不满足属性的 SQL 输入。作者与 Claude 合作编写工具，基于 ANTLR `.g4` 语法文件自动生成 SQL 生成器。

**代码覆盖率引导**测试用例生成，覆盖器识别未覆盖语法结构并针对性生成用例。

### 迭代循环

1. PBT/真实语料库/回归测试生成新失败测试 → 2. ShrinkRay 精简到最简单重现 → 3. 查阅语法和源码找修复方案 → 4. 实施修复 → 5. 回归套件 → 6. 自动重跑

### 影子模式验证

新解析器以影子模式在生产环境运行，同时继续用旧解析器。从约 5 万查询扩展到数百万次，无任何偏差后几小时内切换。

## 结果

- **生产环境**：平均快 **454 倍**
- 手写递归下降 + Pratt 表达式核心 + LL(2) 游标 + 局部回溯
- 所有实际查询与旧解析器完全等效

## 对工具链的影响

作者预测：解析器生成器提供 oracle，LLM 利用 PBT/模糊测试构建性能更高的手写解析器将成为新常态。

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/posthog-claude-rewrite-sql-parser-70x.md)

---

