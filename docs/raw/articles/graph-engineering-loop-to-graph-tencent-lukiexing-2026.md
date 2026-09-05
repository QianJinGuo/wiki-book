---
source_url: https://mp.weixin.qq.com/s/LzpfUsJRMcpPHzDovo5IrA
ingested: 2026-07-28
sha256: d151e821afeb561aa61fb50c48f5a4e412cec8b498801542a951c7d125f55074
source_published: 2026-07-28
title: "Loop Engineering 已死？一文带你了解Graph Engineering"
author: lukiexing
feed_name: 腾讯技术工程
---

# Loop Engineering 已死？一文带你了解 Graph Engineering

> 作者：lukiexing（腾讯技术工程）

## 01 起源

2026年7月17日，OpenClaw创始人 Peter Steinberger 在 X 上发问："我们还在聊循环（loops），还是已经转向图（graphs）了？" 三天 270 万浏览。Graph Engineering 一词由此传开。

## 02 五层演进

从 Prompt Engineering → Context Engineering → Harness Engineering → Loop Engineering → Graph Engineering，一层层往外叠，每一层解决上一层够不着的问题。

- **Prompt Engineering**: 管一次对话里话怎么说
- **Context Engineering**: 管往模型脑子里塞哪些信息
- **Harness Engineering**: 管工具、护栏、跨会话状态
- **Loop Engineering**: 管一个智能体如何持续工作（Boris Cherny: "我现在不提示 Claude 了，我运行一些循环，由循环去提示 Claude"）
- **Graph Engineering**: 管多个智能体、工具、人如何组织成可观测、可恢复、可扩展的系统

## 03 Loop 的五个结构性缺陷

1. **上下文腐烂**: 每轮思考+工具调用全塞回同窗口，第 10 轮膨胀到 18000 token
2. **错误级联**: 出错后靠模型自己发现循环跳出，极难做到
3. **工具过载**: 15-20 个工具时选择准确率急剧下降
4. **缺乏控制粒度**: 不能暂停子任务等审批，不能给不同步骤配不同模型
5. **可观测性差**: 不知道为何分支、哪步导致错误
6. **目标失明**（Goodhart's Law）: AI 客服案例 — 以"工单解决率"为指标，AI 学会偏转/快速关闭对话，客户流失率翻倍

## 04 Graph 定义：G = (V, E, S, P)

- **V (Node)**: 干活的单元，一进一出、只干一件事（专门化智能体或确定性步骤）
- **E (Edge)**: 节点间路由（直通、条件分支、扇出扇入、回环）
- **S (State)**: 沿边流动的共享对象（任务、证据、预算、检查点）
- **P (Policy)**: 约束（谁有权创建节点、调用工具、修改图）

## 05 三种经典拓扑

1. **Diamond** (扇出扇入): 拆分 → 并行 → 合并
2. **Orchestrator-Workers** (主管模式): 主管调度，专职工人执行
3. **Pipeline** (流水线): 固定步骤链，中间加检查点

## 06 Anthropic 五种工作流模式

Prompt Chaining / Routing / Parallelization / Orchestrator-Workers / Evaluator-Optimizer

## 07 核心价值：确定性

Verifier（验证器）+ Router（路由）拆分"判断"和"验证"。确定性来自：代码（格式校验/测试/去重）和现实（测试真跑过、钱真到账）。

警告："如果一张图里所有节点都在互相引用模型生成的结论，没有一个节点真的去碰一下现实，那它只是一台更精致的自嗨机器，一个项目管理做得更好的、更大的幻觉。"

## 08 框架对比

| 框架 | 编排模型 | 同任务 token | 适合场景 |
|------|---------|:----------:|---------|
| LangGraph | 有向图+条件边 | ~2000 | 长时运行、需审计、需回滚的生产管线 |
| CrewAI | 角色化 crews | ~3500 | 规范化角色协作分工 |
| AutoGen | 对话式 GroupChat | ~8000 | 多模型对话协调探索性任务 |
| Google ADK | 结构图架构 | — | code-first、企业级、可部署 Vertex AI |

## 09 生产案例

- **LinkedIn SQL Bot**: 路由+领域专家+写SQL+自纠错智能体，查询准确满意度 95%
- **Uber 代码迁移**: 子图按语言/仓库分拆，检查点扛住 CI 抽风，节省 21000+ 工程小时
- **Anthropic Research**: Orchestrator-Workers，比单智能体强 90.2%

## 10 使用决策

三条该用 Graph 的标准：
1. **上下文保护**: 子任务产生大量无关信息需隔离
2. **可并行**: 任务能切多分支同时跑
3. **专业化**: 不同步骤需不同工具/提示/专注度

成本数据：多智能体系统 token 消耗 ≈ 普通对话 15×，仅 token 用量解释性能方差 80%。
