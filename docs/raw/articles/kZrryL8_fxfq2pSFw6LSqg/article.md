# Harness Engineering for Self-Improvement — 通过 Harness 工程实现 AI 自我提升

> Lilian Weng (翁荔) 博客 · 机器之心编译 · 2026年7月7日 17:31

> 原文：https://lilianweng.github.io/posts/2026-07-04-harness/

---

**摘要**：当模型本身的智能已经足够强大时，真正决定它能走多远的，或许是包裹在模型外面的那层「Harness」——负责编排模型思考、调用工具、管理上下文、评估结果的那套系统。系统地梳理了从 ACE、Meta Context Engineering 到 Self-Harness、Darwin Gödel Machine 等一系列围绕「Harness 自我优化」展开的研究工作，试图回答：递归式自我提升（RSI）究竟会先发生在模型权重层面，还是先发生在这层「脚手架」上？

---

## RSI 与 Harness

递归式自我提升（recursive self-improvement, RSI）可追溯到 I. J. Good (1965)。在现代 AI 中，这个反馈循环可能表现为模型直接改写自己的权重。但更广义地说，它也可以是模型去改进训练流程和部署系统。

**Harness** 指的是围绕基础模型搭建的系统，负责编排执行流程，并决定：
- 模型如何思考和规划
- 如何调用工具并采取行动
- 如何感知和管理上下文
- 如何存储产物
- 如何评估结果

## Harness 设计模式

### 模式一：工作流自动化
Karpathy 的 autoresearch 库是清晰范例：目标导向循环 — 规划 → 执行 → 观察/测试 → 改进 → 直到达成目标。Codex 智能体循环通过「智能体运行时」分析执行轨迹和失败案例并据此迭代改进。

### 模式二：文件系统作为持久化记忆
长时程智能体系统中，Harness 不应把整个工作流塞进上下文，而是把持久化状态保存在文件中。学会如何读写文件系统是 LLM 的基础技能，以文件形式管理持久化记忆会随核心模型能力提升而受益。

### 模式三：子智能体与后台任务
Harness 可派生出多个子智能体并行执行任务。关键设计：让并行性变得显式且可检查——子智能体输出保存为文件、日志和状态记录，模型可在中断后恢复并对执行历史进行推理。

### 案例：编程智能体 Harness
主流编程智能体（Claude Code、Codex、OpenCode、Cursor）的核心接口已趋于稳定：规划 → 编辑 → 构建 → 测试 → Lint → 审查的循环 + 一整套工具（bash/editor/文件搜索/代码搜索/网络搜索等）。

### Harness 层与核心智能之争
- **近期 RSI 路径**：Harness 工程将向「元方法论」演进（改进获得更好答案的机制本身）
- 成熟的 Harness 支撑自动化研究循环；更聪明的模型防止 Harness 被过度工程化
- 最终，许多 Harness 层面的改进会被内化为核心模型行为，但外部接口应会保留

---

## Harness 优化

优化的演进：指令提示词 → 结构化上下文 → 工作流 → Harness 代码 → 优化器代码

### 上下文工程

- **ACE（Agentic Context Engineering）**(Zhang et al. 2025)：把上下文当作不断演化的「playbook」。三组件：生成器（Generator）、反思器（Reflector）、策展器（Curator）。防止上下文坍缩的关键设计：策展器输出结构化、条目化的要点，定期精炼去重。
- **MCE（Meta Context Engineering）**(Ye et al. 2026)：把「机制」（如何管理上下文）与「产物内容」分离。双层优化：元层面搜索最佳技能 s*，基础层面在给定技能下优化上下文函数。技能以 skill.md + 动态数据文件形式实例化。
- **Meta-Harness**(Lee et al. 2026)：优化决定「哪些信息应被存储、检索并呈现给模型」的代码本身——用于优化 Harness 的 Harness。外层循环：智能体提议新 Harness → 文件系统目录管理 → 帕累托前沿筛选。

### 工作流设计

- **AI Scientist**(Lu et al. 2026)：完整流水线——提出想法 → 写代码 → 跑实验 → 分析结果 → 写论文 → 同行评审
- **ScientistOne**(Meng et al. 2026)：以「可验证性」为核心约束——每条论断必须能追溯到证据来源
- **Autodata**(Kulikov et al. 2026)：出题者→弱解题者→强解题者→验证者的四角色数据合成
- **ADAS**(Hu et al. 2025)：元智能体搜索智能体工作流设计方案——初始化档案库 → 生成新工作流 → 评估 → 加入档案库
- **AFlow**(Zhang et al. 2025)：工作流表示为图（节点=LLM调用，边=代码逻辑），MCTS优化

### 自我提升型 Harness

- **STOP（Self-Taught Optimizer）**(Zelikman et al. 2023)：改进「改进器 I」自身（元改进）。改进后的改进器发现多种策略（遗传算法、任务分解、模拟退火、集束搜索等）。⚠️ 仅 GPT-4 有效，GPT-3.5/Mixtral 因基础模型不够强反而变差。
- **Self-Harness**(Zhang et al. 2026)：弱点挖掘 → 有边界 Harness 提议 → 提议验证（held-in/held-out 双重门控）三阶段循环。在 Terminal-Bench-2 上显著提升 Qwen3.5/Qwen3.5/GLM-5 能力。

### 进化搜索

- **Promptbreeder**(Fernando et al. 2023)：变异操作优化提示词，变异提示词本身也在通过进化被改进
- **GEPA**(Agrawal et al. 2025)：基于反思的提示 + 进化搜索
- **AlphaEvolve**(Novikov et al. 2025)：编程智能体进化搜索系统——维护候选程序池，LLM 生成改进 diff，用 #EVOLVE-BLOCK 标注可改进区域
- **Darwin Gödel Machine (DGM)**(Zhang et al. 2025)：以「可编辑的 Harness 代码仓库」进化为目标。固定模型条件下，Claude 3.5 Sonnet 从 20%→50% (SWE-bench Verified)。
- **Hyperagents**(Zhang et al. 2026)：元智能体控制如何修改现有任务智能体以创造新智能体

### 联合优化（模型权重 + Harness）

- **SIA**(Hebbar et al. 2026)：元智能体提出 Harness + 任务智能体执行 + 反馈智能体决定更新 Harness 还是权重。目前证据初步。

---

## 未来挑战（7 大瓶颈）

1. **弱且模糊的评估者** — 许多论断缺乏快速精确的验证器
2. **上下文与记忆的生命周期** — 上下文工程应成为智能核心组成部分
3. **负面结果** — LLM 不擅长判断何时放弃假设、报告失败
4. **多样性坍缩** — 进化/RL 循环倾向于利用已知高回报模式
5. **奖励作弊（Reward Hacking）** — 评估者和权限控制应放置在循环之外
6. **长期成功** — 优化目标短视（如无法捕捉可维护性、向后兼容性）
7. **人类的角色** — 人类应在技术栈中向上移动，在恰当时机提供监督

---

## 附录：有用的基准测试

| 基准 | 评估内容 | 当前最佳 |
|------|----------|----------|
| PaperBench | 复现 ICML 论文（8316 条评分细则） | Claude 3.5 Sonnet ~21% |
| CORE-Bench | 计算可复现性（90 篇论文, 270 任务） | GPT-4o 最难任务 21% |
| ScienceAgentBench | 数据驱动科学发现（102 任务, 4 学科） | — |
| RE-Bench | ML 研究工程（7 环境, 61 人类专家对比） | 2h AI 4x 人类, 8h 人类反超 |
| MLE-bench | Kaggle 竞赛环境（75 竞赛） | o1-preview + AIDE 16.9% 铜牌 |
| KernelBench | GPU 内核正确性与速度（250 任务） | — |

---

## 参考文献

涵盖 35 篇论文，核心引用包括：Good 1965; Yudkowsky 2008; ACE (ICLR 2026); MCE (arXiv 2026); Meta-Harness (arXiv 2026); AI Scientist (Nature 2026); ADAS (ICLR 2025); AFlow (ICLR 2025); STOP (COLM 2024); Self-Harness (arXiv 2026); AlphaEvolve (arXiv 2025); DGM (arXiv 2025); SIA (arXiv 2026); PaperBench (ICML 2025); RE-Bench (ICML 2025); KernelBench (arXiv 2025)

---

*原文来自微信公众号：机器之心 · 编译自 Lilian Weng 博客 · 已按知识库入库标准存档*
