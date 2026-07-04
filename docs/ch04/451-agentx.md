# 快手 AgentX

## Ch04.451 快手 AgentX

> 📊 Level ⭐⭐ | 5.7KB | `entities/kuaishou-agentx.md`

# 快手 AgentX

AgentX 是快手推出的面向工业推荐系统的 Agent 驱动自迭代框架，旨在让 Agent 成为推荐迭代的执行主体，持续生成方案、实现代码、上线实验、读取反馈，并把每一次轨迹沉淀为下一轮进化的燃料。

技术报告：[AgentX: Towards Agent-Driven Self-Iteration of Industrial Recommender Systems](https://arxiv.org/abs/2606.26859v2)

## 架构组成

AgentX 将推荐实验拆解为四个核心阶段：

### Brainstorm Agent

把模糊业务目标（如「提升观看时长」「改善冷启」）收敛成有优先级、有证据、有边界的可落地方案。综合历史实验、系统架构、数据分析和外部论文研究进行方案生成。

### Developing Agent

让代码生成真正进入生产语境。通过仓库知识库、特征 schema 查询、DSL 检查、C++ 语法检查、dryrun 验证等工具，将代码生成约束在真实仓库和平台规则内。同时支持论文复现、模块消融和跨论文结构组合。

### Evaluation Agent

负责安全部署、流量分桶、参数冲突检查、指标读取和 guardrail veto。关键特性是将成功和失败都资产化：成功实验成为后续方案的 playbook，失败实验沉淀为反例、约束和剪枝规则。

### Harness Evolution (SGPO)

通过 **SGPO（Semantic-Gradient-based Prompt Optimization）**实现自进化。从历史执行轨迹中诊断 Agent 工作方式的缺陷（遗漏业务约束、证据不足、反复犯同类代码错误等），将诊断转化为子 Agent 的局部 harness 更新，通过配对评估决定是否接纳。

这才是 AgentX 最关键的区别：它不是把人工流程简单自动化一遍，而是把每次执行都变成系统能力增长的一部分。

## 实验数据

在快手 App 真实业务部署中：

| 指标 | 数据 |
|------|------|
| 实验想法数 | 374 个 |
| 通过方案审核 | 106 个 (28.34%) |
| 完成代码与上线 | 100 个 (94.3%) |
| 可发布结果 | 10 个 (9.9%) |
| 并发能力提升 | 8 倍 |
| 单位人力业务价值提升 | 3.7 倍 |
| 主站 App 消费时长 | +0.561% |
| 生活服务年化收入 | 超 1 亿元 |

## 自加速特性

在运行窗口内，AgentX 展现出明显的自我加速：

- 周并发实验数从 15 增至 60
- idea 通过率从 15% 提升到 45%
- 每周可发布结果从 2 个提升到 5 个

## 模型研究拓展

AgentX 的闭环同样可迁移到模型研究：自动阅读论文、复现方法、在公开数据集评估、抽取互补模块进行跨论文结构组合。在快手 App 直播时长指标上带来 +0.865% 收益。

## 与相关概念的关系

- 不是简单的代码助手，而是重构推荐研发的生产函数
- 核心区别在于把每次执行都变成系统能力增长的一部分
- 支持「想法—代码—实验—归因—进化」的完整闭环

→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/kuaishou-agentx-recommender-self-iteration.md)

## 第 2 来源 — 快手技术公众号 (2026-07-03)

v×c=81, 快手技术官方公众号，提供更详细的工程实现描述。

### 互补角度

1. **PCV 增强精排分两轮闭环优化案例** — 第一轮 PCV boosting 未达显著性，AgentX 没有简单归为失败，而是转化为下一轮输入（质量门控+自适应权重），最终消费时长 +0.071%。展示了 AgentX 的「失败→更强假设」自进化能力

2. **SGPO 机制详细描述** — Semantic-Gradient-based Prompt Optimization：从历史轨迹中找出 Agent 缺陷（遗漏约束、证据不足、反复同类错误），转化为子 Agent 局部 harness 更新，通过 replay 配对评估决定是否接纳

3. **完整实验漏斗数据** — 374 想法→106 通过审核(28.34%)→100 上线(94.3%)→10 可发布(9.9%)。补充了第 1 来源缺失的漏斗中间环节数据

4. **周级自加速曲线** — 周并发实验数 15→60，idea 通过率 15%→45%，每周可发布结果 2→5。不仅提升绝对值，更显示加速度在增加

5. **模型侧拓展细节** — 系统自动阅读推荐论文、复现方法、跨论文结构组合。达到发布级别的模型在直播时长指标 +0.865%。说明 AgentX 闭环同样可迁移到模型研究

6. **技术栈补充** — 四阶段各自的技术实现细节（特征 schema 查询、C++ 语法检查、dryrun 验证、guardrail veto 等）比第 1 来源更丰富

→ [第2原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/kuaishou-agentx-self-iteration-recsys-2026.md)

---

