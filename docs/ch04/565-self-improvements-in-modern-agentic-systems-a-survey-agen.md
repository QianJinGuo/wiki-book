# Self-Improvements in Modern Agentic Systems: A Survey — Agent 自我改进综述

## Ch04.565 Self-Improvements in Modern Agentic Systems: A Survey — Agent 自我改进综述

> 📊 Level ⭐⭐ | 4.7KB | `entities/self-improvements-modern-agentic-systems-survey-arxiv-2607-13104.md`

# Self-Improvements in Modern Agentic Systems: A Survey — Agent 自我改进综述

KAUST + 吉林大学 + Jürgen Schmidhuber 团队于 2026 年 7 月发表的系统性综述（arXiv 2607.13104），将 Agent 自我改进领域首次统一为**双路径框架**，涵盖从提示优化到哥德尔机器的完整技术谱系。

## 核心形式化定义

智能体被定义为**基础模型参数 θ 与操作支架 Σ 的耦合配置**：**At = (θt, Σt)**，其中 **Σt := (pt, mt, Tt, gt)**

- **pt**：结构化提示 / 系统指令
- **mt**：记忆（存储、检索、更新策略）
- **Tt**：外部工具集及调用接口
- **gt**：控制逻辑（路由、调度、安全约束）

自我改进 = **自诱导更新算子 U**，将执行经验转化为对 θ 或 Σ 的持久变更。

## 双路径分类法（核心贡献）

### 路径 A：基础模型改进（θ 更新，Σ 冻结）

| 子类 | 信号形式 | 代表方法 | 关键挑战 |
|------|---------|---------|---------|
| 内在生成式演示 (§5.1) | 自合成数据 → SFT | Self-Instruct, LMSI, SPORT | 模型坍缩、知识气泡 |
| 内在评估反馈 (§5.2) | 自评分/偏好/批评 → RL/DPO | Constitutional AI, Meta-Rewarding, TTRL | 评估器-策略耦合放大盲点 |
| 外在探索经验 (§5.3) | 环境交互轨迹 → RL | WebRL, UI-Genie, Agent-RLVR | 奖励稀疏/黑客、能力倒退 |

### 路径 B：支架改进（Σ 更新，θ 冻结）

| 组件 | 范式 | 代表方法 |
|------|------|---------|
| **提示** (§6.1) | 标量反馈 → 定性精炼 → 种群进化 → 文本梯度 | APE, Reflexion, Promptbreeder, TextGrad |
| **记忆** (§6.2) | CRUD + 扁平/层级/图/向量结构 + 选择治理 | Generative Agents, Mem0, MemoryBank, A-MEM |
| **工具** (§6.3) | 动态路由 → 迭代精炼 → 自主创建 | ToolNet, MCP-Flow, VOYAGER, TOOLMAKER |
| **全支架** (§6.4) | 自指代码改写，改进器与被改进系统共同进化 | Gödel Agent, AlphaEvolve, STOP, Agent Symbolic Learning |

## 关键设计洞见

### 快慢双环

Σ 改进（快速适应）与 θ 改进（慢速巩固）存在结构性不对称——当反馈有噪声时，先约束在支架内验证，稳定后再蒸馏到参数中。这是整个综述最具实践指导意义的结论。

### 评判即治理基础设施

评判器不是被动基准而是**攻击面**，需与生成器解耦。评估应报告完整学习曲线而非峰值分数，并追踪回归率和安全违规。

### 分层门控安全

自我改进应视为**不可信代码在受保护运行时中执行**，每次结构更新需通过验证器门控。

## 六大未来方向

1. **测试时持续适应** — 运行时动态更新检索/路由/记忆
2. **主动探索与好奇心** — 内在奖励驱动安全探索
3. **参数蒸馏与联合优化** — "系统 2 → 系统 1"，θ 与 Σ 联合优化
4. **资源约束下的改进动力学** — 预算感知的效率优化
5. **多智能体协同共进化** — 共享工件、安全版本控制
6. **开放世界分布漂移下的鲁棒性** — 非平稳模拟器替代静态排行榜

## 与 2026.7.27 阅读序列的关系

这篇综述为当天阅读的 7 篇文章（DataFlow-Harness、Reflection/Reflexion、TokenSpeed、MemoHarness、淘宝 SDD AI Coding、Agent OS、Own Your Intelligence）提供了统一的理论框架。其中淘宝 SDD AI Coding 对应 §7.1 软件工程实践，Reflection/Reflexion 对应 §6.1.2 定性反馈精炼，DataFlow-Harness 对应 §6.4 全支架改进，Agent OS 对应 §9.1 分层门控安全架构。

→ [原文存档](https://github.com/QianJinGuo/wiki-book/tree/main/docs/raw/articles/self-improvements-modern-agentic-systems-survey-arxiv-2607-13104.md)

## 相关实体

- [DataFlow-Harness](../ch05/009-harness.html)
- [Harness Engineering](../ch05/112-harness-engineering.html)
- [Harness Engineering & Self-Improvement Survey (Lilian Weng)](../ch05/112-harness-engineering.html)

---

