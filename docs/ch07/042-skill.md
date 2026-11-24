# Skill 版本对比五大原则：从'两个数字比大小'到工程化质量门禁

> 📊 Level ⭐⭐⭐⭐ | 10.9KB

> 原文归档：[原文归档](https://mp.weixin.qq.com/s/jbmdkP1Oj6_J_ZDRiW131w)

Skill 版本升级不能只看总分变化，需要多维度对比 + 分场景拆解 + 失败 case 人眼复核 + 统计显著性检验 + Token/时延纳入门禁。本文提出 5 条原则和完整的版本对比报告 YAML 模板。

## 一句话

**版本对比不是"两个数字比大小"：8 维度对比 + 5 层场景拆解 + regression/improvement/drift 三集 diff + 2σ 显著性 + Token/时延门禁 + CI 自动化。**

## 六种"假改进"陷阱

1. **均值改善但分布退化** — 总分涨了但关键场景回退
2. **整体提升但 P0 翻车** — 高优先级 case 回退即事故
3. **主要场景持平边缘场景下滑** — 低频但高风险场景被忽视
4. **看似变好其实是测试集偏移** — 新版刚好更适配测试集分布
5. **Token 暴涨换正确率** — 成本飙升但收益微小
6. **稳定性下降换正确率** — 正确率波动变大，确定性降低

## 五条原则

### 原则 1：永远多维度对比，不要只看一个数字

8 个必看维度：

| 维度 | 关心什么 | 例子 |
|------|----------|------|
| 总体正确率 | 平均效果 | overall_score 0.78 → 0.82 |
| 分层指标 | L1/L2/L3/L4 各层 | L3 +5pt, L4 -2pt |
| 分类型场景 | 不同 case 类型 | P0 +0pt, P1 +6pt, P2 +4pt |
| 一致性 | 多次跑的稳定性 | consistency 0.86 → 0.92 |
| 鲁棒性 | 扰动场景 | tool_junk 72% → 75% |
| 资源消耗 | Token / 步骤数 | tokens +18%, steps +0.6 |
| 时延 | 平均响应时间 | latency +1.4s |
| 失败模式 | 失败的种类 | 新版本是否引入新失败模式 |

### 原则 2：分场景看，不要只看均值

必须按 5 种维度拆分：

- 按业务严重性：P0 / P1 / P2
- 按使用频率：高频 / 中频 / 低频
- 按用户角色：开发 / 运维 / 业务
- 按风险等级：涉及生产 / 涉及测试 / 只读
- 按已知难度：经典 case / 边缘 case / 难 case

**P0 回退 = 事故**，不管总体分数涨多少。

### 原则 3：失败 case 必须人眼复核

三集 diff：

- **Regression set** — v1 ✅ → v2 ❌（最关键，P0 regression 原则不上线）
- **Improvement set** — v1 ❌ → v2 ✅
- **Drift set** — 都失败但方式不同（v1 死循环 vs v2 错误结论）

### 原则 4：用统计方法，不要凭感觉

- 每个版本至少跑 3 次评估
- 显著性判断：`diff > 2 * pooled_std`（最简版）
- 更严肃用配对 t 检验

如果 v2 比 v1 高 2pp 但波动 ±3pp，这 2pp 不是真改进。

### 原则 5：Token 与时延必须纳入对比

**Token/时延门禁标准：**

- 总分提升 ≤ 5pt → Token 增长 ≤ 10%，时延增长 ≤ 15%
- 总分提升 > 5pt → Token 增长 ≤ 25%，时延增长 ≤ 30%

反面案例：正确率 +2pp 但 Token +75%、时延 +75%，生产实际收益为负。

## 完整版本对比报告模板

YAML 结构化模板（关键字段）：

- `overall`：v1/v2 mean + diff + significant (bool)
- `by_layer`：L1-L4 各层变化
- `by_severity`：P0/P1/P2 变化
- `stability`：consistency_score + robustness_avg
- `cost`：avg_tokens + avg_latency 变化率
- `regression_cases`：具体 case 编号 + 描述
- `improvement_cases`：具体 case 编号 + 描述
- `verdict`：结论 + blockers + recommended_actions

## 真实案例：db-query Skill v2.0.0 被 P0 回退拦下

总分 +6pt 但 DELETE -30pt、DDL -35pt → 回退原因：新 prompt 过于激进 → 保留 v1 的"先确认再执行"逻辑后全部场景改进才上线。

## CI 自动化建议

- PR 提交后自动触发评估
- 自动生成对比报告贴回 PR 评论
- 指标回退 > 阈值自动加 regression 标签
- regression 标签 PR 需特殊审批才能 merge

## 深度分析

### "假改进"的本质：度量维度与决策维度不匹配

文章的核心洞察在于：大多数"变好了吗"的争论，根源是对比双方用了不同维度的尺子。总分是一个一维投影，而 Skill 的质量是一个多维空间——正确率、一致性、鲁棒性、成本、时延、失败模式。当新版在总分上占优时，只说明它在"被测的那个维度"上占优，不代表工程决策所需的全部维度都安全。六种"假改进"陷阱（均值改善分布退化、P0 翻车、边缘下滑、测试集偏移、Token 暴涨、稳定性下降）可以统一理解为：**每一个陷阱都对应一个被总分掩盖的维度**。因此文章给出的 8 维度对比表不是清单式建议，而是一组与上线决策直接对齐的决策变量——任何一个维度回退，都应该阻断"v2 更好"这个结论。

### 均值为什么必然骗人：场景分布的重尾性

均值适合对称、同质的分布，但 Skill 的 case 分布天然是重尾的：少数 P0 场景承担了绝大部分业务风险，大量 P2 场景贡献了绝大部分样本量。这种结构下，总分几乎完全由"样本多的那端"决定，而事故几乎总是发生在"风险大的那端"。db-query Skill 的真实案例极具说服力：总分 +6pt，但 DELETE -30pt、DDL -35pt——原因是新 prompt 让 Agent 变得"激进"，而激进恰恰是写操作场景最不该有的特质。文章据此提出按业务严重性、使用频率、用户角色、风险等级、已知难度五个轴拆分场景，本质是强制让"风险端"在报告里获得与"样本端"同等的可见性。

### 三集 diff：从"分数对比"转向"case 级因果审查"

原则 3 的价值常被低估。Regression / Improvement / Drift 三个集合的划分，把版本对比从"统计陈述"升级为"因果陈述"：Regression set 回答"新版弄坏了什么"，Improvement set 回答"新版修好了什么"，Drift set 则揭示失败模式本身的迁移——同样是失败，v1 死循环 vs v2 给出错误结论，后者的风险其实更高，因为错误结论会被用户采信而死循环会被发现。这种 case 级审查还有一个隐含作用：它是人眼对评估体系本身的校验。如果 regression set 里出现大量"看不懂为什么失败"的 case，往往说明测试集或 judge 出了问题，而不是 Skill 出了问题。

### 显著性检验与成本门禁：把"改进"变成可证伪的命题

单次评估的差异可能完全是噪声，文章用最朴素的方法处理：每版本至少跑 3 次，用 `diff > 2 * pooled_std` 做最简显著性判断，更严肃时上配对 t 检验。这把"我觉得变好了"变成一个可证伪的统计命题。同样重要的是原则 5 的成本门禁：它把 Token 和时延从"事后复盘项"提升为"上线前置条件"，且门禁阈值与收益幅度挂钩（总分提升 ≤5pt 时 Token 增长不得超 10%，>5pt 时放宽到 25%）。反面案例中 +2pp 正确率换来 +75% Token 和 +75% 时延，说明没有成本约束的评估会系统性地奖励"用算力堆分"。最后一公里是 CI 化：对比报告作为 PR 强制流程，regression 标签阻断 merge——度量的存在感本身就是治理。

## 实践启示

1. **任何 Skill 版本升级前，先固定 8 维度对比表**：总体正确率、分层指标、分类型场景、一致性、鲁棒性、Token、时延、失败模式——缺任何一维就不要宣布"变好了"。
2. **给每个 P0 case 建立独立看板**：P0 回退一票否决上线，无论总分涨多少；评估报告里 P0 的变化必须单独一行可见，不能淹没在均值里。
3. **每次版本对比产出三集 diff 并人工过一遍**：regression set 逐条人眼复核（尤其 P0），drift set 额外关注"错误结论型"失败——它比死循环更危险。
4. **把显著性检验写进对比脚本**：每版本至少跑 3 次，`diff > 2 * pooled_std` 不过线就当噪声处理；2pp 的"改进"配 ±3pp 的波动不值得发布。
5. **把 Token/时延门禁固化为代码**：按"总分提升幅度 → 允许的成本增幅"的阶梯写死在 CI 里，正确率收益无法覆盖成本增幅时自动拒绝发布。
6. **对比报告进 PR 流程而非邮件**：评估自动触发、报告贴回 PR 评论、regression 标签阻断 merge——让"客观度量"取代"靠人盯着"。

相关概念: [Skill Engineering Principles](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/skill-engineering-principles.md) · [Evaluation Harness Design](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/evaluation-harness-design.md) · [Agent Evaluation Benchmark Frameworks](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/agent-evaluation-benchmark-frameworks.md)

## 相关实体

- [Skill 版本管理五大原则](https://github.com/QianJinGuo/wiki-public/blob/main/entities/skill-version-management-semantic-versioning-practices-winty.md) — 同作者同系列，版本管理侧
- [Agent Skill 写作评估](https://github.com/QianJinGuo/wiki-public/blob/main/entities/agent-skill-writing-evaluation.md)
- Harness Engineering
- [Claw-SWE-Bench](https://github.com/QianJinGuo/wiki-public/blob/main/entities/claw-swe-bench-harness-evaluation-benchmark-tokenrhythm.md) — harness 独立评测基准
- [Agent Eval WalleZhang](https://github.com/QianJinGuo/wiki-public/blob/main/entities/agent-eval-wallezhang-yaml-driven-agent-evaluation-framework.md) — YAML 驱动评估框架

---

