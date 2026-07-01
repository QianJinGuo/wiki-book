# Skill 版本对比五大原则：从'两个数字比大小'到工程化质量门禁

## Ch07.053 Skill 版本对比五大原则：从'两个数字比大小'到工程化质量门禁

> 📊 Level ⭐⭐ | 5.9KB | `entities/skill-version-comparison-five-principles-winty.md`

> 原文归档：[原文归档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/skill-version-comparison-five-principles-winty.md)

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

## 相关实体

- [Skill 版本管理五大原则](ch04/245-skill.md) — 同作者同系列，版本管理侧
- [Agent Skill 写作评估](ch04/245-skill.md)
- [Harness Engineering](ch05/061-harness-engineering.md)
- [Claw-SWE-Bench](ch12/003-token.md) — harness 独立评测基准
- [Agent Eval WalleZhang](ch04/503-agent.md) — YAML 驱动评估框架

---

