---
title: Agent 自我改进的六条路
source_url: https://mp.weixin.qq.com/s/CH4wIRZVcDDZOmRvPFu43Q
publish_date: 2026-04-28
tags: [wechat, article, claude, agent, harness, rag, coding, llm]
review_value: 7
review_confidence: 7
review_recommendation: neutral
ingested: 2026-05-16
sha256: 82cf9df5123ff9236f67709aecc35ede5488cbf2890671b0aa75df7c4331c1b7
---

## 02 持久记忆
**代表项目**：Letta Code / Agent Zero（16,700 Stars）/ Hermes Agent（25,700 Stars）
**核心思路**：把 Agent 状态从「对话级」提升到「Agent级」，知识不清零
### Letta Code（API 层持久化）
- 记忆绑定在 Agent 上，不绑定在 LLM 上。换模型不影响记忆
- `/remember` 显式写入，`/skill` 把操作轨迹抽象成可复用模块
- LettaBot 多平台（ Telegram/Slack/Discord）共享记忆
### Agent Zero（动态工具生成 + 记忆）
- 遇到没有现成工具的任务时，当场写代码创建新工具
- 行为几乎全定义在可编辑的 prompt 文件中，小模型也能驱动
### Hermes Agent（机制最完整）
1. **自动技能提炼**：复杂任务后自动把操作步骤抽象成 Skill 文档，Skill 在使用中持续自我修正
2. **定期回顾（nudging）**：Agent 主动复盘经验，即使没用户发起对话也主动存重要知识
**共同技术洞见**：**不改权重，改状态**。在 LLM 参数冻结情况下，通过外部持久化状态层积累知识。
---
## 03 进化搜索
**代表项目**：EvoAgentX（2,700 Stars）/ AgentEvolver（1,300 Stars，阿里巴巴）
**核心思路**：用算法搜索更好的 Agent 配置（prompt、工具配置、工作流拓扑）
### EvoAgentX（三条优化线并行进化）
- **Prompt 文本**：TextGrad 调整每个 Agent 的指令措辞
- **工作流拓扑**：AFlow 搜索 Agent 间的连接方式
- **配置参数**：MIPRO 优化工具选择和参数设定
**实测效果**：HotPotQA F1 +7.44%，MATH +10%，GAIA 最高 +20%
### AgentEvolver（三个阶段）
1. **自我提问（Self-Questioning）**：Agent 自主探索环境给自己生成训练任务，不需要人工准备数据
2. **自我导航（Self-Navigating）**：用 ReMe 经验池管理模块，把跨任务成功经验存储起来，后续直接调用
3. **自我归因（Self-Attributing）**：用 **ADCA-GRPO** 算法做轨迹级别的因果信用分配——传统 RL 给整条轨迹一个 reward，ADCA-GRPO 会分析每一步操作的因果贡献（第3步帮了多少忙，第7步拖了多少后腿）
**ADCA-GRPO 效果**：7B 模型在 AppWorld 上从 1.8% → 32.4%，14B 达到 48.7%
---
## 04 对抗训练
**代表项目**：Agent0（1,100 Stars，北卡罗来纳大学 + Salesforce）
**核心**：**零数据自我进化**，双 Agent 对抗
- **Curriculum Agent**：生成越来越难的任务
- **Executor Agent**：用工具集成推理来解题
**关键动力学**：Executor 变强 → 简单题目没训练价值 → Curriculum Agent 被迫生成更难任务 → 倒逼 Executor 继续进化
> 竞争本身就是训练信号。整个过程不需要人工标注数据集，也不需要外部 reward model。
**效果**：
- 基于 Qwen3-8B-Base：数学推理 +18%（达 58.2 分），超过需要人工标注的 R-Zero 和 Socratic-Zeo
- 通用推理 +24%
- 视觉版本 Agent0-VL 在开源视觉语言模型中排第一
> 零标注，胜过有标注。精心策划的「对抗压力」比精心标注的数据集更能激发模型潜力。
---
## 05 自我修改
**代表项目**：HyperAgents（2,100 Stars，Meta）/ autoresearch（66,500 Stars，Karpathy）
### HyperAgents（Meta）
**核心**：负责改进的 Agent 也能被改进
- 论文：DGM-Hyperagents（Darwin Gödel Machine 的扩展版）
- 系统由 Task Agent（干活）和 Meta Agent（改进）两部分组成，统一写在一个可编辑程序中
- Meta Agent 不仅能改 Task Agent 的代码，**还能改自己的代码**
- 改进的策略本身也在进化
**实验中最印象深刻的现象**：系统自己发明了持久化记忆和性能追踪机制，没有人预设这些功能，Agent 自己判断需要它们，就写代码给自己加上了
**跨领域迁移**：在论文审稿和机器人任务上进化出的 HyperAgent，直接拿去做 IMO 数学评分，DGM 原版迁移效果约等于 0，而 DGM-H 的 imp@50 达到 **0.630**。原因：DGM 学到的是领域特定技巧，DGM-H 学到的是通用的「如何改进」策略（持久化记忆、趋势分析），这些在新领域照样管用。
### autoresearch vs HyperAgents 的区别
- **autoresearch**：AI（比如 Claude Code）本身不变，能得到更好的实验结果，但不会改进「自己做实验的方法」
- **HyperAgents**：进化的不只是结果，还有进化过程本身
---
## 06 编排自优化
**代表项目**：Meta-Harness（629 Stars，斯坦福，一作 Chelsea Finn 学生，DSPy 作者合作）
**核心**：用 Coding Agent（Claude Code + Opus 4.6）迭代优化 Harness
### 方案
每一轮：Agent 读取文件系统中的历史记录（之前每一版 Harness 的源代码、评估分数、执行 trace）→ 提出新 Harness 方案 → 跑评估 → 把结果写回文件系统
### 关键设计选择
**给 Agent 完整的文件系统访问权限，取代压缩摘要**
消融实验：只给分数和摘要时中位数准确率 34%，给完整文件系统直接跳到 **50%**。摘要版最高准确率（38.7%）甚至不如完整版的中位数（50.0%）。
> 压缩不只是丢了边角细节，而是丢掉了做正确决策所需的关键线索。
### 调试轨迹案例
- 第1-2轮同时修 bug 和改 prompt，性能大幅回退
- 第3轮：对比两个失败候选的改动记录，发现共同点是把结构修复和 prompt 变更混在一起 → 做了经典的混杂变量识别：拆开分别测试
- 第7轮：换策略，不再改任何现有逻辑，只在第一次 LLM 调用前加一个环境快照 → 成为全局最优
### 效果
- 文本分类比人工最优方案 ACE 高 **7.7 个百分点**，context 用量只有 ACE 的 1/4
- TerminalBench-2 达到 **76.4%** 通过率，超过人工精调方案，在所有 Opus 4.6 Agent 中排名第二
### 两层天花板
**Big Model**（模型能力决定理论上限）和 **Big Harness**（Harness 决定实际达到的高度）。Meta-Harness 做的事情是把 Harness 这一层的天花板尽量往模型天花板靠近。
---
## 六种机制横向对比
| 机制 | 核心思路 | 代表项目 | Stars |
|------|---------|---------|-------|
| 输出自审 | 生成后审查，循环修正 | LangGraph Reflection | 173 |
| 持久记忆 | 跨 session 积累知识和技能 | Letta Code · Agent Zero · Hermes Agent | 2.1k · 16.7k · 25.7k |
| 进化搜索 | 用算法优化 prompt、工具和工作流 | EvoAgentX · AgentEvolver | 2.7k · 1.3k |
| 对抗训练 | 双 Agent 竞争产生训练信号 | Agent0 | 1.1k |
| 自我修改 | 改写自己的代码和改进机制 | HyperAgents | 2.1k |
| 编排自优化 | 自动优化 Agent 的编排层 | Meta-Harness | 629 |
---
## 核心命题
**六种机制并非互斥**：
- Hermes Agent 同时用了反思、记忆和技能进化
- AgentEvolver 同时做了自我提问（对抗生成变体）和进化搜索
- Meta-Harness 的内部循环本身也包含反思和进化
**AI 的学习正在从训练阶段溢出到部署阶段。**
过去十年，模型变强的唯一方式是改权重。这些项目展示了另一种可能：**权重冻结的情况下，通过外部记忆、行为搜索、对抗训练、代码自修改、编排自优化来持续积累能力。**
如果说训练是「上学」，那这些机制就是毕业之后的**自学能力**。
---
## 相关链接
- HyperAgents (Meta)：https://github.com/facebookresearch/Hyperagents
- Agent0：https://github.com/aiming-lab/Agent0
- EvoAgentX：https://github.com/EvoAgentX/EvoAgentX
- AgentEvolver：https://github.com/modelscope/AgentEvolver
- Agent Zero：https://github.com/frdel/agent-zero
- Letta Code：https://github.com/letta-ai/letta-code
- Hermes Agent：https://github.com/NousResearch/hermes-agent
- autoresearch (Karpathy)：https://github.com/karpathy/autoresearch
- Meta-Harness (Stanford)：https://github.com/stanford-iris-lab/meta-harness-tbench2-artifact
- LangGraph Reflection：https://github.com/langchain-ai/langgraph-reflection