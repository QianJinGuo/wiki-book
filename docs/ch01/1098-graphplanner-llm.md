# GraphPlanner — 图记忆网络驱动多智能体 LLM 工作流路由

## Ch01.1098 GraphPlanner — 图记忆网络驱动多智能体 LLM 工作流路由

> 📊 Level ⭐⭐ | 3.5KB | `entities/graphplanner-multi-agent-workflow-router-uiuc-2026.md`

# GraphPlanner — 图记忆网络驱动多智能体 LLM 工作流路由

> **Background**：本文基于 UIUC 研究团队提出的 GraphPlanner 框架整理。论文发表于 arXiv 2604.23626，代码开源于 github.com/ulab-uiuc/GraphPlanner。原报道来自新智元。

GraphPlanner 是 UIUC 提出的多智能体 LLM 路由框架，将传统的模型选择路由（LLM Router）升级为动态工作流生成（Agentic Workflow Generation）。其核心创新在于：Router 不仅决定调用哪个模型，还决定每个模型应承担的角色（Planner / Executor / Summarizer），并利用图结构记忆网络（GARNet）记录历史交互以指导决策。

## 核心架构

**GARNet（Graph-based Agentic Router Network）**：一种异构图记忆网络，维护两类图记忆：

- **Workflow Memory Graph**：当前 query 在本轮推理中生成的子问题、角色调用和中间回复
- **Historical Memory Graph**：历史任务中的 query-response、LLM-Role 交互、accuracy 和 cost 

GARNet 将 query node、response node、LLM-role node 以及 accuracy-cost edge 组织成异构图，通过共享的 role hub nodes 连接当前工作流和历史记忆，使 Router 在做决策时能利用历史积累的模型能力画像与协作模式。

**动作空间**：每一步选择二元动作 `(Agent Role, LLM Backbone)`。预定义三类角色：

1. **Planner** — 将复杂 query 分解为 atomic sub-queries
2. **Executor** — 回答原始 query 或子问题
3. **Summarizer** — 聚合多个中间结果，生成最终回答

对于简单问题，GraphPlanner 可直接选择 Executor 一步完成；对于复杂任务，先调用 Planner 拆解，再调用多个 Executor，最后 Summarizer 汇总。

## 训练与实验

GraphPlanner 将 workflow generation 建模为 Markov Decision Process，使用 PPO 强化学习训练。奖励函数同时考虑 task utility（回答正确性）与 computational cost（每步调用成本），通过超参数 α 控制 accuracy-cost trade-off。学到的不是固定工作流模板，而是面对不同 query 时自适应决定规划深度的动态策略。

实验覆盖 14 个任务、6 个领域（Math、Code、Commonsense Reasoning、World Knowledge 等），在 Phase 2（自由生成 workflow）中相比最强 baseline 提升约 9.3% 平均准确率。在 out-of-domain 任务（LogicGrid、MGSM、CommonGen）上取得 78% 平均准确率，优于 GraphRouter、RouterDC、Router-R1 等 baseline。同时支持 Inductive（不依赖历史交互，轻量部署）和 Transductive（利用历史 memory，更高性能）两种推理模式。

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/给多智能体llm装上图记忆工作流路由器搞定调用协作规划.md)

---

