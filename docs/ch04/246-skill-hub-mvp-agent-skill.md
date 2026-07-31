# Skill Hub MVP：可评估、可回滚、可发布的 Agent Skill 治理平台

## Ch04.246 Skill Hub MVP：可评估、可回滚、可发布的 Agent Skill 治理平台

> 📊 Level ⭐⭐ | 10.3KB | `entities/skill-hub-mvp-evaluation-rollback-release.md`

# Skill Hub MVP：可评估、可回滚、可发布的 Agent Skill 治理平台

## 摘要

winty 实现的 Skill Hub MVP（~400 行 Python）是 Agent Skill 工程化治理的最小可行平台。不依赖商用工具或外部数据库，mock LLM 调用，但跑通了完整核心闭环：Skill 注册、版本评估、跨版本对比、自动门禁、灰度路由、一键回滚。这套系统的核心设计理念是：**Skill 的治理与 DevOps 的代码治理一脉相承**——主体从"代码"变成了"Skill"，但工程治理逻辑不变。唯一的关键区别是，Skill 的评估取代了传统测试，成为整套体系的核心质量门。

## 六组件架构

| 组件 | 职责 | 核心接口 |
|------|------|----------|
| **SkillRegistry** | 文件系统版本管理 | register(name, version, content) / load_skill(name, version) |
| **EvalEngine** | 跑评估出 4 层指标 | evaluate(name, version, test_set) → EvalMetrics |
| **CompareService** | 版本对比 + Blocker 检测 | compare(v1_metrics, v2_metrics) → CompareReport |
| **PromotionGate** | 自动门禁决策 | can_promote_to_canary(metrics) / can_promote_to_stable(compare, days) |
| **CanaryRouter** | 按调用方灰度路由 | resolve_version(skill, caller) → version |
| **RollbackService** | 一键回滚 | promote(skill, version) / rollback(skill) → prev_version |

## 文件系统存储结构

```
hub/
  skills/{name}/{version}/skill.md
  skills/{name}/state.json   # {"stable": "1.0.0", "canary": "1.1.0"}
  evaluations/{name}/{version}.json
```

阶段 1（Skill < 30、团队 < 3）完全够用，规模上来再换数据库，模型不变。

## 门禁规则（CI 强制阻断）

- L3/L4 回退 > 3 个百分点 → 拦截
- L4 < 90% 硬底线 → 拦截
- Token 增幅 > 25% → 拦截
- 灰度天数 < 7 → 不能 promote 到 stable

## 评估体系

每个 case 跑 3 次（一致性），4 层指标加权：L1(10%) + L2(20%) + L3(50%) + L4(20%)。

## 灰度路由

CanaryRouter 维护 allowlist，在名单的 caller 路由到 canary 版本，否则走 stable。

## 关键坑

1. **测试集太干净** → 需要 60% 真实日志+30% 故障复盘+10% 人工策展
2. **Judge 模型太弱** → 必须用比 Skill 更强的模型作 judge
3. **Gate 太松** → 按 severity/scenario 分桶
4. **回滚没人测** → 每季度做一次回滚演练

## 核心判断

Skill Hub 解决的是"AI 经验到生产"的链路（Skill→评估→灰度→回滚→监控），与 DevOps 解决"代码到生产"链路一脉相承。主体从"代码"变成"Skill"，但工程治理逻辑不变。唯一不同的是 Skill 的评估取代了传统测试，成为整套体系的核心。

## 深度分析

### Skill 治理为什么需要一套独立平台

Agent Skill 的工程治理与普通软件之间有一个根本性差异：**Skill 的行为是非确定性的，无法用传统单元测试覆盖**。一个 Skill 的核心逻辑不是"输入 X 输出 Y"的确定性函数，而是"输入 X → LLM 推理 → 输出 Y"的概率性过程。同一个 Skill 在同一个输入上，可能因 LLM 的推理路径不同而产生不同的输出。

这意味着：

1. **传统 CI/CD 的测试阶段无法直接移植**——你没办法断言"这个 Skill 返回了正确结果"，只能评估"这个 Skill 在 N 次运行中达到了 X% 的通过率"
2. **版本回退决策需要多维指标综合**——一个版本可能在 L1/L2 上表现更好，但在 L3/L4 上退步；也可能 Token 消耗降低了但一致性也下降了
3. **灰度能力是刚需**——你永远无法在预发布环境中完全验证 Skill 的生产行为，必须通过灰度逐步暴露影响面

Skill Hub 的六组件架构正是围绕这些非确定性挑战设计的。EvalEngine 处理概率性评估（多次运行取聚合指标），CompareService 处理跨版本的指标变化检测（不仅仅是"通过/不通过"），PromotionGate 实现了基于多维指标的门禁策略，CanaryRouter 和 RollbackService 构成了生产安全的最后防线。

### 四层评估体系的战术设计

Skill Hub 的四层评估体系（L1-L4）是一个经过深思熟虑的评估策略分层：

- **L1（10%）**：基础功能正确性。确保 Skill 在典型输入下不会崩溃或产生非结构化输出。这是最轻量、最快速的检查，适合在每个提交时运行。
- **L2（20%）**：边界条件处理。测试 Skill 在异常输入、极端参数、空值等情况下的鲁棒性。这些测试覆盖了"用户会怎么误用这个 Skill"的场景。
- **L3（50%）**：任务完成质量。这是评估体系的核心，占权重的 50%。通过真实业务场景的测试案例来评估 Skill 是否真正解决了用户的问题。L3 的测试数据应该主要来自生产日志（60%）和故障复盘（30%），而不是人工构造的"干净"样本。
- **L4（20%）**：一致性 + 资源消耗。评估 Skill 在同一输入下多次运行的输出一致性、Token 消耗的稳定性，以及执行时间。L4 < 90% 是硬底线——如果一个 Skill 连自己的行为都不能保持一致，它在生产中的可预测性就值得怀疑。

每层评估跑 3 次取平均，这是为了消除 LLM 推理的随机性对评估结果的影响。3 次是在"统计显著性"和"评估成本"之间的经验平衡。

### 门禁策略的工程权衡

PromotionGate 的门禁规则体现了几项关键的工程权衡：

**L3/L4 回退 > 3pt → 拦截**：允许小幅度回退（≤3pt），因为 LLM 版本更新可能导致某些场景提升、另一些场景轻微下降。3pt 阈值在"容许合理波动"和"防止质量滑坡"之间取得平衡。

**L4 < 90% → 硬底线**：一致性是 Skill 在生产中可被信任的前提。如果一个 Skill 在相同的输入下有超过 10% 的概率输出不同结果（或者 Token 消耗波动过大），它就不应该进入生产。

**Token 增幅 > 25% → 拦截**：Token 消耗直接影响 Skill 的运行成本。25% 的增幅红线确保了版本迭代不会意外地大幅增加推理成本，迫使开发者在功能和成本之间做出公开的权衡。

**灰度天数 < 7 → 不能 promote 到 stable**：这是对"未知未知"的防御。即使所有自动化检查都通过，也要在灰度环境中暴露至少 7 天，以确保足够的时间窗口来发现非预期的行为。这借鉴了软件工程中"金丝雀发布"的最佳实践。

这些规则被硬编码在 CI 中而非配置文件中，是为了确保门禁规则本身的变更也需要经过代码审查——"谁改门禁规则"这件事本身就是一个重要的治理决策。

### 与 DevOps 的类比：Skill 治理的启发式框架

将 Skill Hub 的架构映射到 DevOps 治理框架中，可以得到一个有用的启发式：

| DevOps 阶段 | 对应问题 | Skill Hub 组件 |
|------------|---------|---------------|
| 代码仓库 | 代码怎么存？ | SkillRegistry（文件系统版本管理） |
| 单元测试 | 功能对吗？ | EvalEngine（L1-L2） |
| 集成测试 | 业务跑得通吗？ | EvalEngine（L3） |
| 性能测试 | 资源够吗？ | EvalEngine（L4） |
| 代码审查 | 变更可接受吗？ | CompareService + PromotionGate |
| 灰度发布 | 逐步上线？ | CanaryRouter |
| 回滚 | 出事了怎么办？ | RollbackService |

这个映射的价值在于：它让已经有 DevOps 经验的工程师能够快速理解 Skill 治理的核心概念。唯一需要重新学习的是"评估"——它是传统测试的替代品，也是整个体系中最难做对的部分。

## 实践启示

1. **从文件系统开始，不要过早引入数据库**：在 Skill 数量 < 30、团队 < 3 的阶段，文件系统版本管理完全够用。过早引入数据库会增加架构复杂度，却不会带来实质改善。当扩展时，只需将文件读写替换为数据库查询，架构模型不变。

2. **测试集质量比规模重要**：60% 真实日志 + 30% 故障复盘 + 10% 人工策展是经过验证的配比。纯人工构造的测试集过于"干净"，会漏掉生产中的真实边界情况。建议从生产日志中定期抽取并标注新的测试案例。

3. **3 次重复跑是统计显著性的最低要求**：单次评估不可信，因为 LLM 的输出有随机性。3 次取平均是在评估成本和结果可信度之间的实际折中。对于 L3/L4 等关键指标，考虑增加到 5 次。

4. **灰度天数不能少于 7 天**：即使所有自动化门禁都通过，也要在真实生产流量下暴露至少 7 天。这用于捕获"在测试环境中永远不会出现但生产中一定会发生"的意外行为。

5. **门禁规则应硬编码在 CI 中**：门禁规则本身的修改应该经过代码审查流程。如果门禁规则是可配置的，那么在"生产事故时需要紧急绕过"的时候，绕过操作会绕过应有的治理流程。

6. **每季度做一次回滚演练**：大部分团队只有在真正需要回滚时才发现回滚流程不可靠。将回滚演练加入季度计划，确保 RollbackService 的路径始终可用。

## 相关实体

- [企业级 Skill 8 块最小骨架 + 8 条 checklist](ch04/273-skill.html) — 同作者 winty，侧重 Skill 本身的设计规范
- [Skill Hell：Agent Skill 工程落地](ch04/372-skill-hell-agent-skill.html) — Skill 工程化的实践挑战
- [Skill 编排的 6 种依赖关系](ch04/273-skill.html)
- [Agent Harness 生产化](../ch05/058-agent-harness.html)
- **Agent Skill 治理框架**
- **AI 评估框架与 Harness**
- **AI Skill 的 DevOps 管线**

→ [原文存档](https://github.com/QianJinGuo/wiki-book/tree/main/docs/raw/articles/skill-hub-mvp-evaluation-rollback-release.md)

---

