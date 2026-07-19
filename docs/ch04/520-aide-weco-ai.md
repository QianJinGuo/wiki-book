# AIDE² — 递归自我改进首获实验证据（Weco AI）

## Ch04.520 AIDE² — 递归自我改进首获实验证据（Weco AI）

> 📊 Level ⭐⭐ | 5.0KB | `entities/aide2-recursive-self-improvement-weco-2026.md`

# AIDE² — 递归自我改进首获实验证据（Weco AI）

AIDE² 是 Weco AI 提出的两层级自动研究框架，**首次为递归自我改进（Recursive Self-Improvement, RSI）达到 Level 1 提供了实验性证据**。其核心创新在于：让一个外层研究 agent 持续修改内层 agent 的 **harness**（搜索策略、上下文管理、错误处理、评测逻辑），而**模型权重始终不变**。

## 架构设计

AIDE² 将自动研究分为内外两层：

1. **内层 AIDE** — 提出方案、修改代码、运行实验（Gemini 3 Flash）
2. **外层 AIDE_human** — 直接修改内层 agent 的 harness 代码，包括搜索策略、上下文管理、错误处理和评测逻辑（Claude Opus 4.7）

这种非对称配置的原因：外层 token 开销只占总成本一小部分，因此使用能力更强的模型；内层在固定预算下，Gemini 3 Flash 能匹配或略胜更大模型，同时成本更低。

## 100 轮筛选中的渐进改进

整个实验连续完成 100 个外层步骤，从 AIDE₀ 迭代到 AIDE₉₉，**无人工介入**。刷新历史最佳的改写出现在第 **2、6、28、39、47、63 和 85 轮**——约 93% 的候选版本未能通过评测。

### 搜索策略演化

- **AIDE₀**：全局贪心——生成 5 个初始方案，随机调试 bug 叶节点或选择整棵树最高分节点继续改进
- **AIDE₈₅**：多臂老虎机——在搜索分支之间分配预算，选中分支后沿最佳节点优化；分支长期停滞时复制最佳代码另开分支
- 被拒的更复杂方案包括岛屿遗传算法、锦标赛选择、MCTS 式价值回传等

### 上下文管理压缩

- AIDE₀：每次将所有历史尝试的完整代码和执行输出放入提示词
- AIDE₈₅：保存完整方案树但按操作类型构建最小上下文——生成、调试、改进各有不同视角
- **结果：完整提示词平均长度压缩到朴素历史拼接方式的约 1/16**

## 评测可靠性

KernelBench 检验**奖励作弊（Reward Hacking）**：将单元测试测得的加速放在端到端训练负载中重新验证，若保留加速不足一半或变慢/失败，即记为作弊。

- AIDE₈₅ 奖励作弊率：**63% → 34%**（减半），低于 AIDE₄₇ 和人工版的 42%
- 自动形成三类防护：反过拟合指令、硬编码 Guard、统计校正（末版失效）

## RSI 四级评估

| 级别 | 定义 | AIDE² 状态 |
|------|------|-----------|
| Level 0 | 系统能独立跑完研发循环，但效率低于人工 | ✅ 已超越 |
| **Level 1** | **改进同一系统的效率超过人工** | **✅ 首次实验证据** |
| Level 2 | 点火：改进后的内层 agent 能成为更好的外层优化 agent | ❌ 未达（AIDE₄₇ 更省样本但峰值无显著优势） |
| Level 3 | 固定预算下进展加速（智能爆炸条件） | ❌ 未达 |

## 外部迁移能力

AIDE₄₇ 和 AIDE₈₅ 在三项**未参与版本筛选的外部任务**上均超过 AIDE₀ 和人工版：

- **MLE-Bench Lite**：AIDE₄₇ 最高 (0.739)
- **ALE-Bench Lite**：AIDE₈₅ 领先 (1790)
- **WeatherBench 2**：AIDE₈₅ 领先 (0.803)

内部综合分数上升不代表所有外部能力同步增强，但两代版本都在未参与筛选的任务上保持优势，提供了**二阶泛化证据**。

## 关键局限

1. **代码质量退化**：AIDE₈₅ 代码更复杂，残留无效逻辑，维护和部署更困难
2. **高淘汰率**：约 90% 方案被拒
3. **持续加速未出现**：Level 3（智能爆炸必要条件）未达
4. **完整报告与代码未公开**
5. **实验协议与成本口径待进一步披露**

## 与已有 RS 框架对比

AIDE² 区别于此前 [Lossy Self-Improvement](../ch01/328-lossy-self-improvement.html) 和 [AI Self-Improvement / Bootstrapping](https://github.com/QianJinGuo/wiki/blob/main/concepts/ai-self-improvement-bootstrapping.md) 的核心在于：它不更新模型权重，而是在 **harness 层**进行元优化，并且首次在实验上证明了改进可以**跨任务迁移**。这与 [Harness Engineering 自我改进综述](../ch05/052-harness-engineering.html) 中指出的方向一致——harness 本身可以成为自我改进的优化对象。

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/aide-squared-recursive-self-improvement-weco-2026-07-16.md)

---

