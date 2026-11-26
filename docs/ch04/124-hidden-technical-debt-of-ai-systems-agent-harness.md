# Hidden Technical Debt of AI Systems: Agent Harness

> 📊 Level ⭐⭐⭐ | 10.4KB

> **Background**：本文基于 leehanchung 2026-05-08 发表的深度技术分析，系统梳理了 AI Agent 系统中"Harness 层"的技术债务问题。文章以 Google 经典论文《Hidden Technical Debt in Machine Learning Systems》为类比，指出 Agent 系统中真正的工程复杂度不在模型本身，而在围绕模型的 Harness 层——system prompts、tool wrappers、planner-executor loops、retry policies、context compaction 策略等。

## 核心论点

Agent 系统的 Harness 层（系统提示词、工具包装器、规划-执行循环、重试策略、上下文压缩策略、工具调用白名单、停止判断器、降级方案）构成了真正的技术债务来源。即使使用 n8n 等低代码工具绘制工作流，本质上仍是 Harness 工程。

## Harness 层的五个技术债务维度

### 1. System Prompt 膨胀
- 系统提示词持续增长，团队不断添加新规则和边界条件
- 每次新增工具或功能都需要更新 prompt，导致维护成本指数增长
- Prompt 之间存在隐式依赖和冲突，难以测试和验证

### 2. Tool Wrapper 脆弱性
- 工具包装器将外部 API 的复杂性封装为 LLM 可调用的接口
- API 变更、认证过期、速率限制等外部因素导致 wrapper 频繁失效
- 每个 wrapper 都是潜在的故障点，需要独立的错误处理和重试逻辑

### 3. Planner-Executor 循环的隐式状态
- 规划器和执行器之间的状态传递依赖隐式约定
- 上下文窗口限制导致历史信息丢失，规划器可能重复已失败的操作
- 缺乏显式的状态机设计，使得调试和可观测性极差

### 4. Context Compaction 策略
- 长对话需要压缩历史上下文以适应模型窗口
- 压缩策略（摘要、截断、滑动窗口）各有权衡，且与具体任务强相关
- 错误的压缩可能导致关键信息丢失，影响后续推理质量

### 5. Model Capability Evolution 的适配成本
- 模型能力快速演进，Harness 层的假设可能过时
- 为旧模型设计的 guardrails 可能限制新模型的能力发挥
- 团队需要持续评估和调整 Harness 层的设计

## 与现有实体的差异化

本文从**技术债务**视角审视 Agent Harness，与现有 `harness-engineering-systematic-framework`（通用理论框架）和 `agent-harness-context-management-working-set`（上下文管理专项）形成互补：
- 现有实体侧重**如何构建** Harness
- 本文侧重**Harness 的维护成本和债务累积**

## 深度分析

### 债务性质的根本差异：经典 ML 债务会腐化，Harness 债务会过期

《Hidden Technical Debt in Machine Learning Systems》刻画的经典 ML 债务（胶水代码、纠缠效应、未声明的消费者）发生在稳定模型周围的管道里，随系统演进逐渐腐化、需要持续偿还。本文论证 Agent 系统的 Harness 债务有着完全不同的代谢方式：Harness 是为"当前模型能力水平"搭建的补偿结构，模型每次代际升级都会让一部分结构从承重墙退化为脚手架，因此这类债务不是意外累积，而是**按计划过期**——"今天的 Harness 是一个 2026 年的工件"。 作者给出的操作性判据是：对每个 Harness 组件问"它过时之后删除需要多久"——一小时能删掉的是期权（option），一周才删得掉的是债务（debt），债务的定义由此从"维护成本高"改写为"退出成本高"。

这一判据统一了实体上文归纳的五个债务维度，其共同点是"为上一代模型的弱点而写"。文章历数了正在溶解的五类结构——无代码工作流画布、LLM 友好工具包装器、planner-executor 脚手架、向量检索记忆栈、多智能体拓扑图； 它们各自补偿的正是旧模型的短板——2023 年的小上下文窗口与 2024 年不可靠的工具调用。 理论内核是 Hyung Won Chung 的一句话："为当前算力水平添加结构，然后移除它，因为结构会成为下一级算力的瓶颈。" 该命题在 wiki 内已有独立展开：[Harness 组件过期与构建即删除](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/harness-component-expiry-and-build-to-delete.md)。

### 训练/生产双重工件：经典框架不存在的债务维度

本文相对经典框架最大的增量，是论证 Harness 实为多个工件而非一个：生产 Harness 是约束面（最小权限、默认拒绝、审计日志、kill switch），训练 Harness 是探索面（宽容失败、原始工具、最大化动作空间），二者刻意反向——"训练处最宽、部署处最窄，其差距应是刻意设计并接受审计的工程产物，而非事故"。 经典 ML 系统训练与推理的输入分布大体同构，不存在这个维度；而 Agent 的不对称直接制造一对镜像失败模式：把生产白名单导入训练造成"过度束缚"（护栏替模型做了思考，它从未学会自己重试、自己选工具、自己停止），把开放式研究环境直接上线造成"围栏不足"（prompt injection 一到即执行敏感操作）。 连接两侧的第三工件是评估 Harness 与对齐团队：它拥有 system-prompt 管线，并以跨发布行为一致性（parity）为考核指标。 这一命题的独立展开见 [评估 Harness 设计](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/evaluation-harness-design.md)。

### 债务的承重面：Harness 选择本身是性能变量

文章用两个证据证明 Harness 是承重结构而非外围管道。其一，一方 Harness 系统性优于三方：模型是在实验室自己的 Harness（工具 schema、循环形状、上下文布局、停止条件）里做后训练的，policy 与该表面共同演化；把同一模型放进三方 Harness 等于让它以 out-of-distribution 的接口行事，基准上存在可测差距。 其二，Letta Code 在 Opus 4.5 上以 59.1% 对 41.6% 击败了官方 Claude Code——三方逆袭的机制正是投资轴差异：前者以记忆基底为核心，后者刻意做薄持久记忆，而基准恰好奖励记忆。 由此得到全文最直接的债务推论：Meta-Harness、AutoHarness 一类自动优化 Harness 的方法在当前任务分布上有效，但收益"以偏斜、不可解释与下一次模型发布时的过期为代价"——结果结构无人书写、不可审计；作者直言把自动优化或定制的 Harness 发布到生产就是**主动累积技术债务**。 正确的花钱位置由三层优化面给出：skills/prompts 便宜（小时级）、Harness 中等（天到周级）、模型昂贵（季度级），应把领域知识推向最便宜的一层，即 thin harness, fat skills； wiki 已有专文：[Thin Harness, Fat Skills](https://github.com/QianJinGuo/wiki-public/blob/main/entities/thin-harness-fat-skills.md)。

### 偿债机制：对齐从内而外，结构以可拆卸为设计目标

文章进一步把 Harness 债务与对齐经济学挂钩：白名单、动作门、输出过滤器都是"在尚未成形的行为周围筑栅栏"，每道外部围栏的聪明预算固定，而模型智能的增长快于软件体操，足够强的 Agent 迟早找到围栏配置出错的缝隙；真正的对齐发生在训练 Harness 里，以奖励塑形把策略更新进权重，围栏从模型之外移入模型之内，这是唯一随能力一起扩展的对齐方式。 因此偿债方向不是堆更多围栏，而是做宽训练 Harness——竞争力正从训练算法转向环境，更好的环境产出更内化的策略，模型对生产脚手架的依赖随之减少；投资训练 Harness 即是在预付两三个模型代际之后的生产债务。 组织层面的落点与"实践启示"第 1、4 条呼应：最耐久的团队把 Harness 当 90 天工件而非永久产品面，在模型发布边界删除大部分脚手架，并预先把代码组织成可丢弃的形状；browser-use 的自愈 Harness 是极限情形——主体是 Agent 运行时自己编辑的代码加一份 SKILL.md。 相比"实践启示"第 2 条的测试框架主张，本文把靶心从"当前行为正确"推进到"删除成本可控"：生产 Harness 应"像打算替换它一样建造"，耐久的是训练/评估数据与环境基底——这正是 [Harness Engineering 框架](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/harness-engineering-framework.md) 通用方法论之外本文新增的偿债视角。

## 实践启示

1. **Harness 层应作为独立的工程对象管理**，而非 prompt + code 的随意组合
2. **需要 Harness 层的测试框架**，类似于软件工程中的集成测试
3. **模型升级时应评估 Harness 兼容性**，而非只关注模型本身的 benchmark
4. **可观测性是 Harness 工程的基础**——没有 trace 和 log，调试 harness 问题如同大海捞针

## 参考

→ [原文存档](https://leehanchung.github.io/blogs/2026/05/08/hidden-technical-debt-agent-harness)
→ [Harness Engineering 框架](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/harness-engineering-framework.md)

---
## 关联
- 相关概念: [Harness Engineering](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/harness-engineering-framework.md)
- 相关: Agent 架构

---

