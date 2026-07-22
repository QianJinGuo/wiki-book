---
source_url: "https://mp.weixin.qq.com/s/RBCp7c7paGw3J--JHZc_Cg"
source_title: "翁荔新博客提出「自进化先从Harness开始」，DeepSeek崔添翼转发附议"
source_author: "听雨"
source_publisher: "量子位 (QbitAI)"
ingested: 2026-07-08
sha256: "7f3362f35dd78287ab3a5400ffbf8d6ccff5c44d61f1488753a2931c1d00a011"
type: raw-source
status: ingested
tags: [harness-engineering, rsi, self-improvement, lilian-weng, self-harness, evolutionary-search, dgm]
---

# 翁荔新博客提出「自进化先从Harness开始」，DeepSeek崔添翼转发附议

> Lilian Weng (翁荔) 博客 Harness Engineering for Self-Improvement 的量子位解读。
> 博客原文：https://lilianweng.github.io/posts/2026-07-04-harness/

## 核心论点：自进化先从 Harness 开始

前 OpenAI 安全副总裁、Thinking Machines Lab 联创翁荔提出 **RSI（Recursive Self-Improvement，递归自我改进）**的工程化路径：不一定从模型改写自身权重开始，而是从 **Harness** 开始。

DeepSeek 研究员崔添翼附议："Harness 方向的自进化，和模型方向的自进化一样，都是非常可能出成果的方向。**Skill 就是 Harness 自进化中比较初级的一种形式**——从 prompt 层面进行自进化。"

**Harness = 模型外部的运行系统**：决定模型如何调用工具、管理上下文、读写文件、拆分任务、调用子 Agent、验证结果，以及从失败中复盘。

## 递进链条：优化对象层层抽象

Context Engineering → Workflow Design → Self-Improving Harness → Evolutionary Search

### 第一层：Context Engineering

Agent 做长任务时上下文失控的解决方案：

**ACE（Agentic Context Engineering）**：上下文当作一本持续更新的"操作手册"。三相角色：Generator 生成轨迹 → Reflector 提炼要点 → Curator 整理成结构化条目增量更新。

**MCE（Meta Context Engineering）**：把"怎么管理上下文"和"上下文里放什么"拆成两层优化。外层进化管理上下文的技能，内层用这个技能优化具体任务的上下文。比 ACE 更接近"自我管理的记忆"。

### 第二层：Workflow Design

模型如何组织行动：

- **AI Scientist**：从想法→代码→实验→论文→评审的完整科研流水线
- **ADAS**：把"设计 Agent 工作流"本身做成可搜索的优化问题，元智能体不断提出新工作流设计并接受评估
- **AFlow**：工作流表示成图，用 MCTS 搜索更优图结构

递进：人类工程化流程 → 模型参与设计流程 → 流程结构进入搜索空间

### 第三层：Self-Improving Harness

模型不只是使用 Harness 完成任务，而是开始分析 Harness 哪里不好，并提出对 Harness 的修改。

**Self-Harness 三步循环**：
1. **Weakness Mining（弱点挖掘）**：收集执行轨迹（工具调用/错误日志/失败结果/验证器反馈），挖出反复出现的失败模式
2. **Harness Proposal（Harness 提案）**：基于失败模式提出小范围、可验证的修改
3. **Proposal Validation（提案验证）**：候选修改经测试验证后才合入

关键设计原则：
- 小范围（聚焦可复现问题）
- 可验证（确认提升且无回归）
- 差异化（不同提案之间保持差异）
- 权限控制（修改系统层代码时安全层保持独立）

已在 MiniMax M2.5、Qwen3.5、GLM-5 等模型上跑 Terminal-Bench-2，学出针对不同模型薄弱点的个性化 Harness 配置。

### 第四层：Evolutionary Search（进化搜索）

Harness 本身成为可搜索对象。逻辑类似自然选择：生成多个候选 Harness → Benchmark 评估 → 保留更好版本 → 继续下一轮。

**DGM（Darwin Gödel Machine）**：coding agent 直接修改自己的 Harness 代码仓库。Claude 3.5 Sonnet 基座，从简单初始配置出发：

| 基准 | 初始 | 进化后 |
|------|------|-------|
| SWE-bench Verified | 20% | **50%** |
| Polyglot | 14.2% | **30.7%** |

达到甚至超过人工设计的 agent。

## Harness 的边界

翁荔认为 Harness 和模型训练互相强化，不是替代关系。Harness 的改进最终可能被"内化"进模型行为中。

### 当前瓶颈
1. **评估器太弱太模糊**：只有代码/数学等有明确、快速、客观反馈的任务能跑通 RL
2. **上下文和记忆生命周期**：任务越自主，记忆管理越复杂
3. **负面结果被忽视**：训练数据以成功案例为主
4. **多样性坍缩**：进化/强化学习循环容易坍缩成同一种方案
5. **Reward hacking**：自我改进循环会优化任何给定信号
6. **长期健康 vs 短期成功**：优化目标大多是短期任务完成度，而非代码库长期健康
7. **人类角色**：人被踢出循环，但要往"环外"移动——在合适抽象层级提供监督
