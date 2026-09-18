# AINMM：存量生产级工程向 AI Native 演进的五级成熟度模型

> 📊 Level ⭐⭐ | 5.9KB

> 大淘宝技术（供给技术团队·木直）提出的 AI Native 能力成熟度模型，借鉴 CMMI 思想，定义了 5 个成熟度等级（ML1-ML5）和 5 大过程域，配套 AI Native Evolution Kit 工具，通过挽单系统实践验证。

## 核心命题

行业存在结构性矛盾：AI 代码产出能力快速提升，但端到端交付效率未同步增长。Sonar 报告 42% 新增代码由 AI 生成，GitClear 发现代码搅动率翻倍、重复代码增长 4x，OpenAI 将此定义为 Harness Gap。AINMM 的目标是把模糊感知变成可测量、可比较、可指导的工程框架。

## 五大过程域（PA1-PA5）

| 过程域 | 对应 Harness 层 | 核心内容 |
|--------|----------------|---------|
| PA1 上下文工程 | Context Layer | 建立 AI 能理解的"项目语义层"——AGENTS.md 做地图，docs/ 做手册 |
| PA2 能力封装 | Capability Layer | 高频操作封装为标准化 Skill（SKILL.md），行为可预测可复制 |
| PA3 验证回路 | Verification Layer | 自动化门禁 Gate 1-4（编译→架构→单元测试→集成测试+E2E） |
| PA4 协作契约 | Collaboration Layer | Design by Contract + 置信度路由（4 级分流）+ 8 阶段 SOP + 偏航检测 |
| PA5 自进化 | Evolution Layer | 经验沉淀→主动优化→量化管理→跨项目复制 |

## 五级成熟度定义

| 等级 | 名称 | 核心特征 | 五维度基准分 | 总分范围 |
|------|------|---------|------------|---------|
| ML1 | 已感知级（Aware） | AGENTS.md 就位，AI 认识项目 | D1≥8 | 8-16 |
| ML2 | 已管理级（Managed） | Skill 封装+基础门禁，AI 可预测 | D1≥12,D2≥8,D3≥8 | 32-44 |
| ML3 | 已定义级（Defined） | 契约式协作+置信度路由，组织标准流程 | D1≥16,D2≥12,D3≥12,D4≥10 | 50-64 |
| ML4 | 已量化级（Quantitatively Managed） | 数据驱动+受控进化+Critic Agent | D1≥18,D2≥16,D3≥16,D4≥12,D5≥8 | 70-85 |
| ML5 | 持续优化级（Optimizing） | 进化可遗传，AI Native 成为组织资产 | D1≥18,D2≥18,D3≥18,D4≥16,D5≥16 | 86-100 |

等级判定需同时满足两个条件：(1) 各维度得分达到最低分阈值；(2) 该等级关键过程域特定目标（SG）全部达成。

## 评估方法：AINA 框架

五维度独立评分（每维 0-20 分），采用 AINA（AI Native Assessment）方法，包含三类评估：AINA-C（自动快照）、AINA-P（计划评估）、AINA-S（持续监控）。同时支持阶段式表示法（整体等级）和雷达图式表示法（五维度评分）。

## 提升路径

| 路径 | 核心行动 | 方法 |
|------|---------|------|
| ML1 起点 | Context Day | 建立 AGENTS.md + docs/ + 信息分级 |
| ML1→ML2 | Skill Sprint + Gate Sprint | 封装高频 Skill + 建立 Gate 1-2 + MEMORY.md |
| ML2→ML3 | Contract Sprint | 契约式设计 + 置信度路由 + 8 阶段 SOP + Gate 1-4 |
| ML3→ML4 | Metrics Sprint + Evolution Sprint | 指标基线 + Critic Agent + 进化元约束 |
| ML4→ML5 | Ecosystem Sprint | Evolution Kit + 跨项目复制 + 虚拟 Monorepo |

## 实践案例

挽单系统（淘天内部存量 Java 生产系统，千余文件、微服务、跨多端）作为 AINMM 的"孵化器"，采用**双循环方法论**：

- **内层循环**（工程演进）：评估 → 识别短板 → 定向改造 → 验证效果 → 再评估
- **外层循环**（框架沉淀）：实践 → 模式提炼 → 通用化 → AINMM 定义 → 反哺实践

实战结果：AINA 初始评估 30 分（ML1）→ 改造后 48 分（ML2）。识别的真实缺口包括子工程 Monorepo 策略、电商全自动测试链路、线上数据回流闭环。

## 与 CMMI 的关系

AINMM 继承 CMMI 的"逐级递进、每级是下一级基础"原则——ML1 是 ML2 的基础，不存在跳级捷径。保持相同五级结构，但特化到 AI Native 研发范式，评估"AI 参与的深度和工程化程度"。

## 设计哲学

1. **Harness 比 Agent 更重要**——评估不是"用了多先进的模型"，而是"为 AI 搭建了多完善的工作环境"
2. **信任是可以工程化的**——通过上下文、封装、验证、契约、进化机制分级释放信任
3. **成熟度是渐进式螺旋上升**——从 AGENTS.md 开始就是一个有价值的起点

## 关联

- Harness Engineering — AINMM 的过程域对应 Harness 五层架构
- [高德 Harness/SDD 演进](https://github.com/QianJinGuo/wiki-public/blob/main/entities/gaode-sdd-harness-team-ai-coding-paradigm-ibjfu.md) — 另一家团队 AI Native 团队级实践
- [Agent 作为 Software 3.0 基础设施](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/agent-as-software-3-0-substrate.md) — AI Native 的范式基础
- [AI Agent 评测 5 维体系](https://github.com/QianJinGuo/wiki-public/blob/main/entities/ai-coding-practice-agent-evaluation-five-dimension-three-level-gating.md) — 评估维度的互补框架
- [Vibe Coding vs Agentic Engineering](https://github.com/QianJinGuo/wiki-public/blob/main/comparisons/vibe-coding-vs-agentic-engineering.md) — 工程成熟度背景

→ [原文存档](https://mp.weixin.qq.com/s/VBbr0jqHSQQn1W-iwRuG8g)

---

