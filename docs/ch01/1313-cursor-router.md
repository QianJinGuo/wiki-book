# Cursor Router: 生产流量驱动的模型路由系统

## Ch01.1313 Cursor Router: 生产流量驱动的模型路由系统

> 📊 Level ⭐⭐ | 3.9KB | `entities/cursor-router-production-model-routing-2026.md`

# Cursor Router: 生产流量驱动的模型路由系统

> 原文存档：[原文存档](https://github.com/QianJinGuo/wiki-book/tree/main/docs/raw/articles/cursor-router-how-cursor-chooses-model-2026.md)

Cursor Router 是 Cursor 于 2026-07-22 发布的模型路由系统，核心理念是**模型选择应从真实开发者工作的生产表现中学习，而非从 benchmark 分数推断**。

## 核心架构：Compass + 任务分类学两段式路由

路由决策分两部分：

- **Compass（复杂度预测器）**：预测每个 turn 用户是否满意，将预测分数作为复杂度代理。分数 0-1 连续值，通过阈值 τ 决定留在性价比模型还是升级到 frontier 模型。阈值越低越多流量留在性价比模型；越高越多升级
- **任务分类学（Task Taxonomy）**：对更复杂 turn 分类，三个维度——Domains（后端/数据库 schema/前端）、Tasks（修 bug/跑命令/写测试）、Modifiers（有界编辑/产品问题/视觉密集变更）——然后匹配各模型最强的任务类别

**路由算法**：`route(x) = 价格高效模型 if Compass < τ, else 任务路由（taxonomy 选 frontier 模型）`。

## 数据集构建：来自生产流量的真实信号

数据集包含数十万 turn，跨多模型采样，每条数据包含路由可用的对话信号 + 两个结果度量：

- **性能**：从用户下一步行为推断——继续下一个任务是强正向信号，纠正 agent 是强负向信号
- **成本**：从 API 定价 + token 用量计算。因为数据来自实时流量，也捕获了 benchmark 常遗漏的成本（如切换模型导致的 cache miss）

## Compass 校准验证

Compass 在线评估确认其分数是用户满意度的强预测器：

- Compass 评为最可能成功的 turn → 96% 收到正向性能信号
- 评为最不可能成功的 turn → 71% 收到正向性能信号

## 模型差异化：没有模型在所有类别都占优

通过跨类别模型性能对比发现，每个模型都有其优势类别：

| 模型 | 优势 |
|------|------|
| Grok | 广泛常规工作的高性价比（Git 命令、通用数据库操作），低推理成本 |
| Sol | 规划与代码库理解；多个实现任务上以更低成本取得强结果 |
| Opus | 执行密集型工作（devops、数据库查询、性能优化） |
| Fable | 调试与视觉实现；复杂任务上质量增益值得其更高成本 |

## 实测效果

- **Auto Intelligence**：高于 Fable 级用户满意度，成本降低 68%（发布后进一步降 18%）
- **Auto Balance**：优于 Opus 4.8，成本低 41%（进一步降 8%），用户满意度 +3%

## 相关实体

- [Cursor Harness 生产运营](ch01/452-cursor-harness-model-production-floor.html) — 同源 Cursor 工程实践：模型 + Harness 组合作为发布单元
- [CursorBench 3.1](ch01/341-cursor-evals-benchmark-3-1-2026-07.html) — Cursor 的离线评测体系（路由用线上生产信号，与离线评测互补）
- [本地推理成本分析](ch01/607-apple-silicon-costs-more-than-openrouter.html) — 推理成本计算维度
- [AI 成本优化框架](https://github.com/QianJinGuo/wiki/blob/main/concepts/ai-cost-optimization-framework.md) — 成本-质量权衡框架
- [推理优化](https://github.com/QianJinGuo/wiki/blob/main/concepts/inference-optimization.md) — 推理成本优化方法

---

