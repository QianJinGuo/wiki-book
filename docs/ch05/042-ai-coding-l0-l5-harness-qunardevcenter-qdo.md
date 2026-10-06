# 去哪儿网 AI Coding 研发平台实践：L0-L5 自动化分级 + Harness 四把锁 + QunarDevCenter + 天弦 QDO

> 📊 Level ⭐⭐⭐ | 10.2KB

## 核心概述

去哪儿旅行（Qunar）基础架构负责人李佳奇的技术大会分享，完整还原一个数千人研发组织全面落地 AI Coding 的路径。核心框架包括：AI Coding L0-L5 自动化分级体系、Harness 四把锁控制模型、QunarDevCenter 数据采集平台、天弦 QDO 编排引擎。

→ [原文存档](https://mp.weixin.qq.com/s/Ug_fMuGkQmM4tECUbpfXOg)

## AI Coding L0-L5 自动化分级

借用自动驾驶分级，业界最清晰的 AI Coding 阶段定义：

- **L0** 全手动
- **L1** 代码补全与辅助（Copilot 级别）
- **L2** 部分自动生成（模块级）
- **L3** 有条件自动化（需求→可运行代码，阻塞求援）
- **L4** 高度自动化（AI 承担大部分交付流水线）
- **L5** 完全自动化（需求到上线 AI 完成）

## Harness 四把锁

Harness = AI 研发过程控制能力。核心不是模型多强，而是约束/隔离/审查组成的工程体系：

1. AI 触发机制（Skills/Workflow/Agent 流程化调用）
2. 约束与门禁（模板、规范、质量标准、准入拦截）
3. 安全隔离环境（沙箱/虚拟环境）
4. 人工审查节点（12 个环节各有关口）

## 度量体系

**AI R&D Metrics = Volume x Maturity**

| 量的指标 | 质的指标 |
|---------|---------|
| 出码率、出码量 | Coding 自动化水平（L1-L3） |
| 团队覆盖率、需求覆盖率 | Harness 等级（Refined） |

出码率计算：生产基线对比——两次 tag 间所有 commit 中 Git Blame 区分 AI vs 人类。

自动化水平 Insight：T（绝对时长）/ M（用户消息数）/ C（用户输入字符数）三维度越小越好。

## QunarDevCenter

AI Coding 数据采集平台：Session 数据采集（jsonl/SQLite）→ 扫描过滤（mtime/size 缓存、sha1、gitRemote 白名单）→ 调度上传。三张核心表设计覆盖原始内容、会话元数据、AI 代码变更。

## 天弦 QDO

AI 研发自动化编排引擎。JDK 自动升级案例：211 个应用，编译通过率 93%。

架构分层：Skill 接入 > Agent 执行 > QDO 调度 > 用户交互。三种 Coding 模式：交互式、自动化、批处理。

## 关键经验

- **先度量，再规模** — 没有度量就没有改进方向
- **Harness 决定上限** — 约束/隔离/审查比模型选择更重要
- **出码率必须可下钻** — 到部门/项目/人/session/文件级别
- **数据驱动透明文化** — 公开看板形成组织加速器
- **AI Coding 终极形态** — 从个人提效到组织能力复利

## 深度分析

### L0-L5 不是纯度阶梯，而是组织的共同语言

这套分级的真正价值不在于它分得多精确，而在于它把「我们 AI Coding 做到哪了」从一个无法对话的模糊问题，转译成一个所有层级都能对齐的坐标。管理层看阶段分布，一线研发看自己卡在几级，两者终于可以在同一套词汇下谈判资源。因此正确的提问方式不是「我们现在是 L 几」——组织级平均等级几乎必然是失真的——而是「哪些环节长期停在 L2、为什么上不去」。分级借用自动驾驶的隐喻，也继承了它的隐含结论：等级提升发生在控制能力提升之后，而非模型换代之后。这与 [Agent 自主性 L0-L5 分级](https://github.com/QianJinGuo/wiki-public/blob/main/entities/agent-autonomy-levels-l0-l5-addy-osmani-2026.md) 把等级绑定到「人类监督密度」上的处理同源：级别描述的不是 AI 有多强，而是人机责任如何切分。

### 四把锁到出码率的因果链

Harness 四把锁常被当成一份检查清单来读，更准确的理解是一条因果链：触发机制（Skills/Workflow/Agent）决定 AI 是否被稳定调用，约束门禁（模板、规范、准入拦截）把「AI 写的代码」收敛到可评审的形状，隔离环境压缩试错的后果半径，人工审查节点则把剩余风险显式标价。四者叠加之后，「让 AI 多写一点」才从一场赌博变成一次理性选择——这才是出码率能持续上升的机制。反过来看，任何一把锁缺席都会给增长设天花板：没有约束，出码率涨到某个点就以返工和事故的形式还回来；没有隔离，团队根本不敢把权限交给 Agent。这也解释了「Harness 决定上限」的真实含义——瓶颈不在模型能力，而在组织愿意承担的风险结构。参见 [Harness Engineering 框架](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/harness-engineering-framework.md)。

### 度量即干预：可下钻的闭环

QunarDevCenter 值得注意的不是采集管道本身，而是它把「AI 提效」从一句口号改写成一个可归因对象。部门、项目、个人、session、文件五级下钻，意味着任何一个数字都能被追问到具体产出物；出码率取两次 tag 之间的 git blame 做生产基线对比，则刻意绕开了自报数据的失真。公开看板把这种可归因性转化成组织压力与经验扩散机制。这条链路与 [AI Coding 度量实践](https://github.com/QianJinGuo/wiki-public/blob/main/entities/loongsuite-pilot-sls-ai-coding-metrics-practice.md) 给出的方向一致——度量系统真正的产品不是报表，而是行为改变。

配套的三维 insight（绝对时长 T、消息数 M、输入字符数 C，越小越好）是这套体系里最精巧的一笔：它把「自动化水平」从主观感受变成一个可比较的向量，使 L1-L3 的判定不再依赖评审者的印象。

### 真正卡住规模化的是组织契约，不是技术

天弦 QDO 的 JDK 自动升级案例——211 个应用、编译通过率 93%——常被当作效率证据，但更诚实的读法是：剩下 7% 的失败仍回到人手里，而「谁来兜底」恰是企业级 rollout 的真实成本项。三类非技术阻力会很快主导进度：信任（团队是否相信 AI 产物可以合入主干）、审查负荷（十二个环节的人工确认权会把人变成新瓶颈，审查者倦怠是隐性风险）、以及责任归属（AI 生成的代码由谁 owner，出了问题谁签字）。这些问题的解法都不是技术性的，而是激励与制度设计问题，也正是「个人提效」与「组织能力复利」之间那道最容易被低估的裂缝。可观测性的作用不只是做看板，更是把责任链显式化，参见 [Harness 可观测性](https://github.com/QianJinGuo/wiki-public/blob/main/entities/agent-harness-observability-production.md)。

### 与其它团队级 Harness 叙事的差异

同类团队级 harness 写作多以单个系统或单项目为单位，重心在 Agent 循环与任务拆解——回答「AI 怎么把这件事做完」。本案例的单位是数千人组织，交付的是三件可跨部门复用的元设施：一套分级（对齐语言）、一套度量（归因能力）、一层编排（规模执行）。因此两篇去哪儿系案例其实互补：[去哪儿大型核心系统重构](https://github.com/QianJinGuo/wiki-public/blob/main/entities/qunar-ai-coding-large-core-system-refactor-2026.md) 展示单项目内的 Harness+Loop+Task 深水区做法，本文展示让这类做法能在全公司被复制、比较与考核的治理层。相较 [从 SDD 到 Lattice Harness](https://github.com/QianJinGuo/wiki-public/blob/main/entities/sdd-practice-lattice-harness-team-ai-coding.md)，差异同样在抽象层级：一个在优化交付质量曲线，一个在优化组织学习曲线。

## 实践启示

1. **先定义可归因的基线，再谈规模**——用版本 tag 之间的 blame 对比替代自报数据，否则出码率只是叙事，撑不起资源决策。
2. **用分级统一语言，但把管理目标设在瓶颈点**——追踪「哪些环节停在 L2 以及原因」，而不是追逐组织平均等级，后者几乎必然被少数先进团队拉高。
3. **四把锁按序补齐，不跳过任何一把**——触发 → 约束门禁 → 隔离 → 人工审查；跳过约束或隔离，出码率的增长会以返工和事故的形式被收回。
4. **指标必须下钻到 session 与文件级**——只能看趋势的看板无法定位责任，也无法沉淀可复制的做法。
5. **把审查负荷与代码归属当作一等设计对象**——明确 AI 产物的 owner 与签字责任，并为人审留出产能预算，否则试点会死在规模化阶段。
6. **优先在规则成熟、失败可回滚的场景证明组织信心**——例如 JDK 升级这类高成功率批处理场景，以一次压倒性结果换取后续授权。

## 相关实体

- [Agent Harness 架构](https://github.com/QianJinGuo/wiki-public/blob/main/entities/agent-harness-architecture.md) — Harness Engineering 概念框架
- [Enterprise Readiness Maturity Model](https://github.com/QianJinGuo/wiki-public/blob/main/entities/enterprise-readiness-maturity-model.md) — 企业成熟度模型
- [从 SDD 到 Lattice Harness](https://github.com/QianJinGuo/wiki-public/blob/main/entities/sdd-practice-lattice-harness-team-ai-coding.md) — 另一团队级 AI Coding harness 实践
- [AI Infra 全景 9 层架构](https://github.com/QianJinGuo/wiki-public/blob/main/entities/ai-infra-panorama-9-layer-agent-production.md) — AI 基础设施全景

---

