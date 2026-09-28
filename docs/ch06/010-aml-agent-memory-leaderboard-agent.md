# AML（Agent Memory Leaderboard）：机制级 Agent 记忆评测榜单

> 📊 Level ⭐⭐⭐ | 10.8KB

## 核心定位

**AML（Agent Memory Leaderboard，记忆之巅排行榜）2026-08-12 发布首期结果**，由清华、北大、人大、上海交大、浙大、复旦、中科大、南大、上海人工智能实验室、中科院自动化所等国内外数十所高校与研究机构联合主办，Datawhale 参与——是业内首个关注 Agent 记忆系统的**机制级榜单**。上线十天内 136 个团队注册参评，官方站点点击量突破 20 万次。

## 评测设计：机制隔离是核心创新

AML 与既有记忆基准（[Agent-Memory 评测全景](https://github.com/QianJinGuo/wiki-public/blob/main/entities/agent-memory-evaluation-landscape-taobao-survey.md) 覆盖的 MUSE/LOCOMO/MemoryAgentBench 等 9 大方案）的关键区别在于**机制级变量控制**：

- **统一提供生成模型和评分模型**，将参评方案的发挥空间集中在检索与召回环节——避免"最终效果分不清来自底层模型还是记忆模块"的经典混淆问题
- **双维度矩阵**：类型分文本记忆/代码记忆两条赛道 × 组别分学术方法榜/商业产品榜
- 文本赛道考察：事实召回、多跳整合、时序理解、记忆治理、个性化、规则执行、安全与隐私
- 代码赛道考察：从历史工程任务中检索并复用调试经验与项目上下文
- **防刷分机制**：公开子集 + 私有盲测集相结合，评测分数与代码 Commit/镜像版本绑定，降低硬编码与测试集过拟合可能

## 首期榜单结果

| 榜单 | 第一名 | 分数 | 紧随其后 |
|------|--------|------|---------|
| 商业产品榜·文本赛道 | **MemoraX** | 58.0 | MemOS、NTES-MEMORY-SMART |
| 开源方法榜·文本赛道 | **InvMem** | 45.1 | Refind、ActiveMemoryIndex |

MemoraX 在系统稳定性、信息检索与召回等方面表现突出，体现工程落地能力。Hybrid Search、ChronoHybridMem 等方案也取得靠前成绩。

## 行业信号

**Agent 记忆系统尚未形成单一主流路线**——动态记忆索引、混合检索等方向仍在持续演进，学术界与开源社区加快探索迭代。AML 将常态化更新并推出技术复盘。

## 2nd Source — 机器之心（2026-08-14 首期揭榜报道）

AML 首期榜单发布后 48 小时内，GitHub、Hugging Face 及 Twitter/X 等海内外技术社区引发爆发式讨论。机器之心将这一事件定位为 Agent 长期记忆赛道的 **"ImageNet 时刻"**——长期记忆（Long-term Memory）是实现 Agent 长期协作的基础，决定其能否摆脱"永远从头开始"的西西弗斯困境。

**互补角度**：
1. **MemoraX 全维度统治**：首期榜单中 MemoraX 以 58.0 高居商业产品榜榜首，并在文本类记忆全部 7 个能力维度位列第一（事实召回、多跳整合、时序理解、记忆治理、个性化、规则执行、安全与隐私）
2. **社区反响数据**：榜单发布 48h 内 GitHub/HF/X 引发爆发式讨论，标志 Agent 记忆评测进入公众视野
3. **记忆痛点的工程化表述**：将长期记忆问题具象化为"API 账单指数级爆炸 + 冗长噪音信息海洋中的幻觉 + 失效规则反复执行 + 过期偏好无法清除 + 上轮踩坑下轮重演"五大工程痛点

→ [原文存档](https://mp.weixin.qq.com/s?__biz=MzA3MzI4MjgzMw==&mid=2651050318&idx=1&sn=07ab7baa68c9e6f7fd617751830c9ddf)

## 深度分析

### 机制隔离为何是基准有效性的关键

Agent 记忆评测长期存在归因污染问题：端到端成绩可能来自记忆模块本身，也可能来自参评方案自带的生成模型、提示词工程甚至评分偏好。早期基准（LOCOMO、MemoryAgentBench 等）大多允许参赛者自带模型栈，榜单排名混合了"模型能力"与"记忆机制"两个变量——弱记忆配强模型的方案可能反超强记忆配弱模型的方案，评测者无从分辨。AML 统一生成与评分模型，把自由变量压缩到检索与召回环节，是从"系统级评测"走向"机制级评测"的实质性一步。[评测全景综述](https://github.com/QianJinGuo/wiki-public/blob/main/entities/agent-memory-evaluation-landscape-taobao-survey.md) 中 9 大方案的碎片化对比，正是缺乏这种变量控制的结果。机制隔离的价值不止于公平：分数差异第一次可以被归因到记忆机制本身，对研究方向选择和工程选型都有直接信号价值。

### 首期结果说明了什么

首期榜单释放了三层信息。其一，**工程成熟度是第一分水岭**：MemoraX 58.0 对开源第一名 InvMem 45.1 的近 13 分差距，且在文本赛道全部 7 个能力维度（事实召回、多跳整合、时序理解、记忆治理、个性化、规则执行、安全与隐私）通吃，说明头部商业产品在记忆流水线每个环节都有积累，开源尚无单点突破能弥补全链路差距。其二，**没有单一机制胜出**：Hybrid Search、ChronoHybridMem、ActiveMemoryIndex 等靠前方案分别代表混合检索、时序索引、动态索引等路线，与 [Agent 记忆架构](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/agent-memory-architecture.md) 领域"尚未形成主流范式"的判断互相印证。其三，**治理与安全进入硬性计分**：记忆治理、规则执行、安全与隐私与召回类指标同权重，"记住更多"不再等于"更好"，遗忘策略与失效规则清理（对应 [记忆生命周期哲学](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/agent-memory-lifecycle-philosophies.md) 中写入/淘汰的权衡）成为被正式评测的一等公民。

### 与既有记忆评测的关系

AML 并非孤立出现，而是 [Agent-Memory 评测全景](https://github.com/QianJinGuo/wiki-public/blob/main/entities/agent-memory-evaluation-landscape-taobao-survey.md) 版图的路线升级。既有基准（MUSE、LOCOMO 等 9 大方案）多为任务级评测，回答"这个记忆系统好不好用"；AML 是机制级评测，回答"哪类记忆机制在哪项能力上有效"。两者互补而非替代：任务级分数贴近产品体验但归因模糊，机制级分数归因清晰但可能脱离任务分布。合理用法是先看 AML 定位机制短板，再用任务级基准验证场景适配度——这与 [Agent 评测基准框架](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/agent-evaluation-benchmark-frameworks.md) 中"能力维度 × 场景赛道"的矩阵化设计趋势一致。

### 机制级榜单的局限

机制隔离的代价是生态真实性的让渡。四点限制：**其一，统一模型栈削平了协同效应**——真实产品中记忆模块与特定生成模型的配合可能正是竞争力所在，被隔离后不可见。**其二，榜单分布 ≠ 产品分布**：评测任务以学术构造的文本/代码场景为主，真实记忆负载（多模态、多会话、跨应用）更复杂，榜首优势未必保持。**其三，榜单存在滞后**：记忆机制迭代速度可能快于评测集更新。**其四，防刷分是军备竞赛而非终局**：公开子集 + 私有盲测 + Commit 绑定提高过拟合成本，但不能根除针对性优化——解读分数应关注机制层面的相对差异，而非绝对分数。

## 实践启示

1. **选型时先隔离变量再看分数**：先确认方案在你自己的生成模型栈上的表现，再用 AML 机制级分数判断其记忆机制水位——两者都过关才值得引入，不要被端到端 demo 分数误导。
2. **为 7 个能力维度建立内部画像而非只看总分**：MemoraX 全维度第一说明头部方案无明显短板；自建记忆系统应对照这 7 个维度做内部回归测试，找到短板维度定向补强。
3. **把记忆治理和安全隐私当作一等公民设计**：失效规则清理、过期偏好淘汰、隐私隔离在 AML 中是计分项而非附加项。应尽早实现记忆条目的 TTL/失效机制与审计日志，后补成本远高于初始设计。
4. **机制路线选择上保持组合思维**：首期靠前方案横跨混合检索、动态索引、时序记忆等多个机制家族，单一机制难以覆盖全部场景。参考 [Agent 记忆系统设计](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/agent-memory-system-design.md) 的分层思路，优先构建可插拔记忆层架构，让检索策略按场景替换。
5. **用机制级分数做归因诊断，用任务级分数做验收**：自建 Agent 出现"忘记关键上下文"类问题时，先对照 AML 能力维度定位是哪类记忆能力不足（时序理解？多跳整合？），再针对性改造；产品验收应基于自有真实任务集，机制榜单分数不能替代场景验证。
6. **关注榜单常态化更新与技术复盘**：记忆机制范式未定（参见 [四大流派对比](https://github.com/QianJinGuo/wiki-public/blob/main/entities/agent-memory-four-schools-comparison-2026-07-22.md)），首期排名置信度有限。把 AML 后续复盘当作技术雷达，跟踪哪些机制路线在多期榜单持续走强，再决定投入方向。

## 相关实体

- [Agent-Memory 评测全景（9 大方案）](https://github.com/QianJinGuo/wiki-public/blob/main/entities/agent-memory-evaluation-landscape-taobao-survey.md) — 2026-06 综述，AML 是其"机制隔离"路线的后继基准
- [Mem0/Letta/Zep/VoltMem 对比](https://github.com/QianJinGuo/wiki-public/blob/main/entities/agent-memory-four-schools-comparison-2026-07-22.md)
- [Agent 记忆架构本质](https://github.com/QianJinGuo/wiki-public/blob/main/entities/agent-memory-architecture-essence.md)
- [记忆存储工程实践](https://github.com/QianJinGuo/wiki-public/blob/main/entities/agent-memory-storage-engineering-practical-guide.md)
- AI Agent 记忆系统
- [Agent 记忆架构](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/agent-memory-architecture.md)
- Agent 评测基准

→ [原文存档](https://mp.weixin.qq.com/s?__biz=MzIwNzc2NTk0NQ==&mid=2247619465&idx=1&sn=a6bd2f497a2fc375f5fb07b733d54914)

---

