# 腾讯 AI Team 知识沉淀体系（Harness Engineering 实践）

## Ch05.055 腾讯 AI Team 知识沉淀体系（Harness Engineering 实践）

> 📊 Level ⭐⭐ | 8.2KB | `entities/tencent-ai-team-knowledge-harness.md`

# 腾讯 AI Team 知识沉淀体系
## 概述
腾讯 AI 工程交付团队（AI Team）提出的完整知识沉淀实践体系，核心主张：**Harness 不是目的，知识才是护城河**。工作流只是管道，知识才是流过管道的活水。

## 核心贡献
- **三维正交知识体系**：五层存储（Layer 0-P/0-T/1/2/3）× 五种类型（model/decision/guideline/pitfall/process）× 三级成熟度（draft/verified/proven）
- **团队知识库独立 Git 仓库**：跨项目共享、生命周期独立、权限独立
- **工作流即知识沉淀闭环**：INIT 注入 → 各阶段按需查询 → ARCHIVE 自动提取
- **三级渐进式索引**（借鉴 Karpathy LLM Wiki Pattern）：全景目录（~50行）→ 分类清单（~100-300行）→ 完整条目（~50-200行）
- **自动衰减 + Lint 机制**：12/6 月未引用自动降级，定期清理过时/矛盾知识
- **突破人机交互瓶颈**：Hapi 内网版远程操控，跨设备会话接管，异步审批

## 核心原则
> Skill、Agent、工具链会随模型迭代更新，但领域知识是永恒的。
1. **工作流可替换，知识可累积** — 工作流变化快，领域知识不管怎么变都有价值
2. **没有知识沉淀的工作流是一次性的** — 投入工程成本搭建工具链，却没让工具链越来越聪明
3. **知识是团队的复利资产** — 成百上千条 proven 知识条目时，新成员、新项目都能站在前人肩上
4. **Big Model vs Big Harness 的务实立场** — 知识工程投入是确定性回报；模型能力提升不能替代领域知识

## 来源
→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/tencent-knowledge-harness-practice.md) — 腾讯技术工程，stevenpxiao，2026-04-27

## 深度分析
### 核心命题：Harness Engineering 的终极价值在于知识而非工具
文章最有力的论断是"Harness 不是目的，知识才是护城河"。在 2026 年业界还在争论"Big Model vs Big Harness"的时候，腾讯 AI Team 给出了一个务实的判断：**模型能力提升不能替代领域知识，再强的模型也不知道你的业务系统里有哪些隐藏的坑**。 这个论断的底层逻辑是：工作流（how）是可替换的，知识（what）是可累积的。当工具链变化时，只有知识能跨工具复用。

### 三维正交知识体系的工程价值
五层存储（Layer 0-P/0-T/1/2/3）× 五种类型（model/decision/guideline/pitfall/process）× 三级成熟度（draft/verified/proven），这三个维度的正交性设计值得深入分析：

- **存储层（Location）**：从个人偏好（Layer 0-P）到团队约定（Layer 0-T）到跨项目通用（Layer 1）到业务专属（Layer 2）再到项目绑定（Layer 3），形成了一个**知识粒度从细到粗、共享范围从小到大的光谱**。Layer 3 的项目知识如果被判定为跨项目通用，可以自动提升到 Layer 1 或 2，形成知识的**向上流动机制**。
- **知识类型（MECE 覆盖）**：五种类型覆盖了知识的完整生命周期——实体定义（model）、技术选型理由（decision）、推荐/禁止做法（guideline）、已知风险模式（pitfall）、业务流程（process）。其中 **pitfall 类型最难以从模型中直接获得**，最依赖团队实践积累，也是知识护城河的核心。
- **三级成熟度**：draft → verified → proven 的晋升路径，结合**自动衰减机制**（proven 12 个月未引用降级，verified 6 个月未引用降级），解决了知识库最常见的问题——**过时知识僵尸化**。

### 知识生命周期三通道设计的巧思
工作流即知识沉淀闭环：INIT（注入）→ 各阶段（按需查询）→ ARCHIVE（提取）。这个设计的核心洞察是：**知识的生产者和消费者是同一个 Agent**。ARCHIVE 阶段的 @archiver 自动从工作流产物中提取知识条目，这意味着知识沉淀不是额外的负担，而是工作流的自然副产品。
各阶段的查询焦点设计（ANALYZE_PRODUCT 查询 model/process/pitfall；ARCHITECT 查询 decision/model）体现了**按需消费**的思想——不在不需要的时候加载不需要的知识。

### 三级渐进式索引的工程意义
借鉴 Karpathy LLM Wiki Pattern 的三级索引（~50行全景目录 → ~100-300行分类清单 → ~50-200行完整条目），本质上是**知识查询的预算控制**。Agent 可以用 ~50 行的成本了解知识库全貌，用 ~300 行的成本定位到相关条目，只在真正需要时才读取完整内容。这解决了大知识库的"无从下手"问题。

### 突破人机交互瓶颈的架构启示
Hapi 内网版的设计哲学——**状态持久化（文件系统即状态机）、断点恢复、异步审批、跨设备接管**——是对传统 Harness"在场依赖"问题的根本性回答。4 小时/8 小时的创始人有效时间约束，通过 24 小时待机 + 异步审批得到缓解。

### 与其他 Harness 实践的关系
腾讯 AI Team 的知识沉淀体系，与 [系统化 Harness Engineering 框架](ch05/061-harness-engineering.md) 中的治理（Governance）支柱高度对齐，也与 [Thin Harness Fat Skills](ch04/255-skill.md) 的核心主张（工具链薄，知识技能厚）形成呼应。知识自动衰减机制与 LLM Wiki Pattern 的 Lint 机制一脉相承。

## 实践启示
### 知识沉淀的冷启动路径
**从 /flow-import 开始**：冷启动导入支持多源收集（Git/TAPD/iWiki/本地文档/口述），初始 maturity 统一为 draft。这解决了"团队有知识但没有结构化"的常见困境。渐进导入的方式让团队不需要一开始就付出高成本。
**优先级：pitfall > decision > guideline > process > model**。越靠前的类型越难从模型中获得，越需要人工沉淀；越靠后的类型越容易被模型覆盖，可以后置。

### 独立 Git 仓库的工程理由
团队知识库**独立于业务项目**的 Git 仓库设计有三个核心价值：
1. **跨项目共享**：同一份知识可以服务于多个业务项目
2. **生命周期独立**：业务项目结束，知识库继续存在
3. **权限独立**：可以单独管理知识库的访问权限

### 知识贡献的共识机制
从 draft → verified（1 人验证）→ proven（≥2 人 + ≥2 项目），这个晋升门槛的设计值得借鉴：**低门槛进入，高门槛晋升**。draft 门槛低鼓励贡献，proven 门槛高保证质量。冲突解决策略（内容矛盾写入 contributions/conflicts/，由 maintainer 裁决）避免了知识库的碎片化。

### 自动衰减的实操配置
- **proven 条目 12 个月未引用 → 降级为 verified**：建议用 CI 自动检查最后引用时间
- **verified 条目 6 个月未引用 → 降级为 draft**：可以和知识库 Lint 集成
- **draft 持续未引用 → 归档**：归档不是删除，而是移入 _archive/ 目录，保留可追溯性

### 跨团队知识联邦（未来方向）
文章提到的"跨团队知识联邦"探索方向——Layer 1（通用技术知识）安全共享 + Layer 2（业务知识）保护边界——是大型组织最需要的能力。实现路径可能是：共识层（Layer 1 知识通过 PR review 合并）+ 隔离层（Layer 2 知识通过 API 调用按需暴露）。

## 相关实体
→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/tencent-knowledge-harness-practice.md) — 腾讯技术工程，stevenpxiao，2026-04-27
→ [AI Team 知识沉淀体系（概念页）](https://github.com/QianJinGuo/wiki/blob/main/concepts/ai-team-knowledge-harness.md) — 详细架构说明
→  — 三支柱架构对照
→  — 知识 vs 工具链的务实立场
→ [Agent Memory 架构本质](ch03/045-agent.md) — 与知识层级的关联讨论

---

