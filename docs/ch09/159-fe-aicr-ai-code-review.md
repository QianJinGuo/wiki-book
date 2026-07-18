# 百度网盘主端 FE AICR：AI Code Review 准入实践

## Ch09.159 百度网盘主端 FE AICR：AI Code Review 准入实践

> 📊 Level ⭐⭐ | 3.0KB | `entities/baidu-aicr-ai-code-review-ci-cd.md`

# 百度网盘主端 FE AICR：AI Code Review 准入实践

> **来源**：百度Geek说（鸽子王）。百度网盘主端 FE 团队在 CI/CD 流水线中嵌入 AICR（AI Code Review）强制检测链路的实战经验，覆盖架构设计、模型选型、误报治理、耗时优化、全流程规划。
> → [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/baidu-aicr-ai-code-review-ci-cd-entry.md)

## 核心数据

| 指标 | 数值 |
|------|------|
| 月 CR 量 | ~2000 次 |
| AI 生成代码占比 | 55.87% |
| 累计检测（0401-0621） | 4388 次 CR |
| 平均检测耗时（含排队） | 7.08 分钟 |
| 阻断问题 | ~300+ |
| GLM5 检出率 | ~5% / 6.9%（552 CR 验证） |
| GPT5.5 检出率 | ~25% / 21.8%（同批 552 CR） |
| GPT5.5 vs GLM5 相对检出 | 3.2x |

## 多智能体协作审查架构

```
三路并行审查 Agent ──→ 聚合整理 Agent ──→ 核实 Agent ──→ 复核 Agent
    运行时风险                       反向验证       二次复核（防漏报）
    逻辑一致性                       过滤误报
    边界条件/调用链
```

### 关键设计原则

**1. 审查 Agent ≠ 核实 Agent ≠ 复核 Agent**：三个角色目标不同，互相制衡。审查倾向于"多发现问题"，核实倾向于"删除不存在的"，复核倾向于"别把真的删了"。单一 Agent 无法兼顾发现能力和结果可信度。

**2. 规则需随模型动态调整**：

- 弱模型（GLM5，~5% 检出率）→ 强规则、细约束，帮模型补足检测深度
- 强模型（GPT5.5，~25% 检出率）→ 规则软化，给模型自主空间，减少机械式约束

经验：越高阶的模型，规则可以越轻。强规则反而限制高阶模型自主能力。

**3. 误报是治理问题不是消除问题**：
- 核实 Agent 反向验证 + 复核 Agent 二次校验
- 静态评论过滤控制噪音
- 纠错本沉淀高频误报和业务规则
- 每周两次复盘持续优化

## 检测耗时管理

甜点：平均 5 分钟。拆分为 7 个阶段，每个阶段设置时间预算和超时策略。

## CI/CD vs Pre-commit 决策

CI/CD（95% 完成度）：规则热更新、工作流闭环、数据沉淀、统一执行环境 → 团队级准入
Pre-commit（20% 完成度）：本地自检，轻量快速 → 个人级前置

## 全流程 CR 建设蓝图

| 阶段 | 完成度 |
|------|--------|
| 开发中 Agent 集成审查 Skills | 100% |
| CI/CD 流水线 AICR 正式准入 | 95% |
| 合入后质量复盘 | 40% |
| Pre-commit 轻量自检 | 20% |
| Spec/需求阶段前置规则 | 规划中 |

## 与已有 wiki 实体关系

- 关联 [阿里 Open Code Review](https://github.com/QianJinGuo/wiki/blob/main/entities/阿里开源-open-code-review一周揽下-5k-star更专业的代码评审-cli.md)、harness-engineering、multi-agent 等标签

---

