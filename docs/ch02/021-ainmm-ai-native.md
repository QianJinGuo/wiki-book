# AINMM：存量生产级工程向 AI Native 演进的五级成熟度模型

> 📊 Level ⭐⭐⭐⭐ | 13.1KB

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

## 深度分析

### Harness Gap：AINMM 试图弥合的结构性矛盾

AINMM 的出发点不是一个功能需求，而是一个行业级的结构性矛盾：模型的代码产出能力在快速提升，但端到端交付效率并未同步增长。Sonar 报告 42% 的新增代码由 AI 生成，GitClear 却发现代码搅动率翻倍、重复代码增长 4x——产出侧的繁荣与质量侧的恶化同时发生。OpenAI 将这道缺口命名为 Harness Gap：瓶颈不在模型，而在为模型搭建的工程环境。AINMM 的独特贡献在于把这道通常停留在"体感"层面的缺口，翻译成了一个组织能力评估问题——你不缺更好的模型，你缺一套可测量、可比较、可指导改造的 AI 协作基础设施，而成熟度模型正是给这类基础设施定级的工具。

这个定位决定了 AINMM 的评估哲学：它衡量的是"为 AI 搭建了多完善的工作环境"，而不是"用了多先进的模型"。这也解释了为什么五大过程域（PA1-PA5）全部落在 harness 侧——上下文工程、能力封装、验证回路、协作契约、自进化，没有一项是"选哪个模型"。这与 [Context Engineering](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/context-engineering.md) 和 [Harness Engineering Framework](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/harness-engineering-framework.md) 的核心主张一致：同一模型在不同 harness 下表现差距巨大，环境即能力。

### ML1-ML5：把"AI Native"从口号变成可测量的能力阶梯

行业里大量"AI Native"论述停留在宣言层面——给出原则和愿景，但无法回答"我们现在在哪一级、离下一级差多少"。AINMM 的关键设计是用三层量化机制消解这种模糊：每个等级绑定五维度最低分阈值（如 ML3 要求 D1≥16、D2≥12、D3≥12、D4≥10）、总分区间、以及关键过程域特定目标（SG）达成情况，且等级判定需同时满足分数与 SG 双条件。

值得注意的是分数区间的设计：五级区间（8-16 / 32-44 / 50-64 / 70-85 / 86-100）互不衔接，中间留有明确空档。这意味着存在一个"够不到下一级"的徘徊带——例如 45-49 分的团队既高于 ML2 上限又低于 ML3 下限，唯一出路是补齐 ML3 的 SG（契约式协作、置信度路由、组织级标准流程）而不是继续堆分数。这个空档实际上把"升级"从数量问题重新定义为质变问题：分数衡量 harness 建设的量，SG 衡量协作范式的质，二者缺一不可。

挽单系统的实践为这套阶梯提供了可复现的验证：AINA 初始评估 30 分（ML1），完成 AGENTS.md、Gate 1-2、协议桥等定向改造后升至 48 分（ML2）。30→48 的变化是可审计的——每一分都对应一项可指认的工程改造，这正是成熟度模型区别于成熟度口号的地方。

### AINA 评估框架的机制设计

AINA（AI Native Assessment）框架的机制有三个值得展开的设计点。其一是三类评估形态覆盖完整生命周期：AINA-C（自动快照）回答"我们现在哪一级"，AINA-P（计划评估）回答"改造计划能把我们带到哪一级"，AINA-S（持续监控）回答"改造是否在退化"——评估本身被纳入了闭环，而不是一次性打分。

其二是双表示法：阶段式表示法给出整体等级，服务管理层对话和对外比较；雷达图式表示法给出五维度独立评分（每维 0-20 分），服务工程团队定位短板。挽单系统能识别出"子工程 Monorepo 策略、电商全自动测试链路、线上数据回流闭环"三个缺口，靠的正是维度级拆解——总分只告诉你差距，雷达图才告诉你差在哪。

其三是评估与提升路径的对齐：ML1 的 Context Day、ML1→ML2 的 Skill Sprint + Gate Sprint、ML2→ML3 的 Contract Sprint，每个 Sprint 都直接对应某一维度的分数提升。评估框架和改进方法论是同一套坐标系的两面，避免了"评完不知道怎么改"的常见断裂。

### 对 CMMI 的继承与 AI Native 特有的偏离

AINMM 对 CMMI 的继承是结构性的：保持五级架构、"逐级递进、每级是下一级基础"的不可跳级原则、过程域 + 特定目标（SG）的判定结构，连 ML4 的命名"Quantitatively Managed"都直接沿用 CMMI 措辞。这让熟悉 CMMI 的组织几乎零学习成本地迁移心智模型。

但偏离同样关键。CMMI 评估的对象是"组织过程的制度化程度"，隐含假设是流程一旦定义就该稳定运行；AINMM 评估的是"AI 参与的深度和工程化程度"，而 PA5（自进化）明确要求 harness 本身随模型能力增长而持续进化。换言之，CMMI 的终点是把过程固化，AINMM 的终点是让过程具备遗传和进化能力（ML5 的"进化可遗传"）。这是范式级差异：当模型能力每几个月上一个台阶时，一个固化的最优流程会迅速变成束缚，一个会自我改造的流程才是资产。企业成熟度评估的这条演进线索，与 [Enterprise Readiness Maturity Model](https://github.com/QianJinGuo/wiki-public/blob/main/entities/enterprise-readiness-maturity-model.md) 所刻画的通用企业就绪度模型形成互补，也与 [Qunar Ai Coding Platform Practice L0 L5 Harness](https://github.com/QianJinGuo/wiki-public/blob/main/entities/qunar-ai-coding-platform-practice-l0-l5-harness.md) 的 L0-L5 分级实践互为印证——多家团队不约而同地选择"分级 + 可测量"来驯服 AI 协作的不确定性，说明这已成为行业收敛方向。

## 实践启示

1. **先做 Context Day，再谈任何升级。** 挽单系统从 ML0 到 ML1 只用了 150 行 AGENTS.md + docs/ 目录 + 信息分级，起点成本极低但收益明确（AI 从"不认识项目"变为"认识项目"）。不要在没建立项目语义层之前讨论 Skill 封装或门禁——每一级都建立在下一级的地基上，跳级没有捷径。

2. **用分数基线代替体感排期。** 任何 AI 工程改造启动前先跑一次 AINA-C 快照，拿到五维度雷达图，把资源投向最低维度而不是最热闹方向。挽单系统 30→48 分的改造之所以高效，正因为每一项投入都对应评估识别出的真实缺口。

3. **门禁先窄后宽。** Gate 1-2（编译 + 架构约束）先行建立，Gate 3-4（单元测试 + 集成测试 + E2E）后补。验证回路不需要一步到位，但没有编译门禁的 AI 代码产出会立即转化为搅动率和重复代码——这恰是 Harness Gap 的直接成因。

4. **高频操作优先封装为 Skill。** AI 行为不可预测的根源之一是同一操作每次被不同地描述和执行。把高频操作固化进 SKILL.md，行为就可预测、可复制、可回归验证——这是从 ML2 开始"信任可以工程化"的最低成本抓手，参见 [Skill Engineering Principles](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/skill-engineering-principles.md)。

5. **配套设施缺口往往比等级本身更重要。** 挽单实践识别的三个缺口（子工程 Monorepo 策略、全自动测试链路、线上数据回流闭环）都不是"分数问题"而是基础设施问题。等级只是体检报告，真正的改造对象常常是体检暴露的系统性缺失。

6. **双循环分开跑：工程演进与框架沉淀解耦。** 内层循环（评估→改造→验证）解决自己项目的问题，外层循环（提炼→通用化→反哺）让解决方案变成可跨项目复制的组织资产。只有内循环的团队在重复造轮子，只有外循环的团队在纸上谈兵——两者节奏不同，混在一起会导致实践无法沉淀、框架无法落地。

## 关联

- Harness Engineering — AINMM 的过程域对应 Harness 五层架构
- [高德 Harness/SDD 演进](https://github.com/QianJinGuo/wiki-public/blob/main/entities/gaode-sdd-harness-team-ai-coding-paradigm-ibjfu.md) — 另一家团队 AI Native 团队级实践
- [Agent 作为 Software 3.0 基础设施](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/agent-as-software-3-0-substrate.md) — AI Native 的范式基础
- [AI Agent 评测 5 维体系](https://github.com/QianJinGuo/wiki-public/blob/main/entities/ai-coding-practice-agent-evaluation-five-dimension-three-level-gating.md) — 评估维度的互补框架
- [Vibe Coding vs Agentic Engineering](https://github.com/QianJinGuo/wiki-public/blob/main/comparisons/vibe-coding-vs-agentic-engineering.md) — 工程成熟度背景

→ [原文存档](https://mp.weixin.qq.com/s/VBbr0jqHSQQn1W-iwRuG8g)

---

