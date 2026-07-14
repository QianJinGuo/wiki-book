# Harness Engineering for Self-Improvement — 翁荔 Lilian Weng 系统梳理 Harness 自我提升研究全景

## Ch05.072 Harness Engineering for Self-Improvement — 翁荔 Lilian Weng 系统梳理 Harness 自我提升研究全景

> 📊 Level ⭐⭐ | 6.7KB | `entities/harness-engineering-self-improvement-survey-lilian-weng.md`

# Harness Engineering for Self-Improvement — 翁荔系统梳理 Harness 自我提升研究全景

> Lilian Weng (翁荔) 博客最新文章，系统梳理了 Harness 工程在递归式自我提升（RSI）方向的研究全景，从 ACE、MCE、Meta-Harness 到 Self-Harness、Darwin Gödel Machine、SIA，涵盖 35+ 篇论文参考文献。[^1]

## 核心命题

递归式自我提升（RSI）究竟会先发生在模型权重层面，还是先发生在 **Harness（脚手架）**层面？翁荔认为近期内 RSI 路径不太可能一上来就是模型改写自己的权重，更可行的路径是：**Harness 工程向「元方法论」演进**——改进获得更好答案的机制本身。[^1]

## 与已有实体的关系

- [Self-Harness 论文深度分析](ch05/018-harness.html) — 互补：该实体聚焦 Self-Harness 单篇论文的具体方法论（Weakness Mining → Proposal → Validation 三阶段），本实体覆盖 Harness 自我提升的**全部研究谱系**（ACE → MCE → Meta-Harness → STOP → Self-Harness → DGM → SIA）
- [Harness Engineering](ch05/069-harness-engineering.html) — 上位框架：本实体是 Harness Engineering 在**自我提升**这一前沿子方向的研究全景
- [Agent 自我提升六种机制](../ch03/046-agent.html) — 互补：该实体从 Agent 视角归纳六种路径，本实体从 **Harness 优化**视角系统梳理研究论文
- [Harness 工程五大支柱](ch05/069-harness-engineering.html) — 互补：该实体聚焦生产级 Harness 实践，本实体聚焦前沿研究

## Harness 设计模式

### 模式一：工作流自动化
Karpathy's autoresearch: 规划 → 执行 → 观察/测试 → 改进 的目标导向循环。Codex 智能体循环通过「智能体运行时」而非静态提示词分析执行轨迹。[^1]

### 模式二：文件系统作为持久化记忆
长时程智能体中，Harness 应将持久化状态保存为文件而非塞进上下文。读写文件是 LLM 的基础技能，以文件管理记忆会随模型能力提升而受益。[^1]

### 模式三：子智能体与后台任务
关键设计：并行性应显式可检查——子智能体输出保存为文件/日志/状态记录，模型可中断后恢复。[^1]

## Harness 优化演进路径

**指令提示词 → 结构化上下文 → 工作流 → Harness 代码 → 优化器代码**

### 上下文工程谱系

| 方法 | 核心思想 | 关键设计 |
|------|----------|----------|
| **ACE** (Zhang'25) | 上下文 = 演化 playbook | 三组件：Generator/Reflector/Curator；条目化要点防坍缩 |
| **MCE** (Ye'26) | 技能机制 vs 内容分离 | 双层优化：元层搜技能，基础层优上下文；skill.md + 动态文件 |
| **Meta-Harness** (Lee'26) | 优化 Harness 的 Harness | 智能体提议新 Harness → 帕累托前沿筛选 → 文件系统目录管理 |

### 工作流设计

| 方法 | 定位 | 核心创新 |
|------|------|----------|
| AI Scientist (Lu'26) | 全自动研究流水线 | 想法→代码→实验→论文→评审 |
| ScientistOne (Meng'26) | 可验证性约束 | 证据链检查，每条论断可追溯 |
| Autodata (Kulikov'26) | 数据合成 | 出题者/弱解题者/强解题者/验证者四角色 |
| ADAS (Hu'25) | 元搜索工作流 | 元智能体生成→评估→入库循环 |
| AFlow (Zhang'25) | 图表达+MCTS | 节点=LLM调用，边=代码逻辑，MCTS搜索最优工作流 |

### 自我提升型 Harness

- **STOP** (Zelikman'23)：改进「改进器 I」本身。⚠️ 仅 GPT-4 有效，GPT-3.5/Mixtral 反变差——基础模型须够强
- **Self-Harness** (Zhang'26)：Weakness Mining → Harness Proposal → Proposal Validation（held-in/held-out 双重门控）
- **DGM** (Zhang'25)：可编辑 Harness 代码仓库进化。Claude 3.5 Sonnet: SWE-bench 20%→50%, Polyglot 14.2%→30.7%
- **Hyperagents** (Zhang'26)：元智能体控制如何修改现有任务智能体

### 进化搜索

- **Promptbreeder** (Fernando'23)：变异操作优化提示词，**变异提示词也在进化**
- **GEPA** (Agrawal'25)：反思 + 进化搜索
- **AlphaEvolve** (Novikov'25)：候选程序池 + LLM 生成 diff，#EVOLVE-BLOCK 标注可改进区域
- **ShinkaEvolve** (Lange'25)：父代采样策略 + 代码新颖性拒绝采样 + 元便签本指导变异
- **ThetaEvolve** (Wang'25)：进化搜索 + RL + 上下文学习

### 联合优化（权重 + Harness）

- **SIA** (Hebbar'26)：元智能体(强模型) 提 Harness → 任务智能体(弱模型) 执行 → 反馈智能体决定更新 Harness 还是权重。目前证据初步。[^1]

## 7 大未来挑战

1. **弱评估者** — 许多论断缺乏快速精确的验证器
2. **上下文与记忆生命周期** — 上下文工程应成为智能核心组成部分而非软件系统层
3. **负面结果** — LLM 不擅长判断何时放弃假设；训练数据成功/失败不平衡
4. **多样性坍缩** — 需要机制防止种群坍缩成同解变体
5. **奖励作弊** — 评估者和权限控制应放置在进化循环之外
6. **长期成功** — 优化目标短视，无法捕捉可维护性/向后兼容性
7. **人类角色** — 人类应在技术栈中向上移动而非被排除在循环外

## 基准附录

| 基准 | 评估 | 当前最佳 |
|------|------|----------|
| PaperBench | ICML 论文复现(8316条评分细则) | Claude 3.5 Sonnet ~21% |
| CORE-Bench | 计算可复现性(90论文/270任务) | GPT-4o 最难21% |
| ScienceAgentBench | 数据驱动科学发现(4学科/102任务) | — |
| RE-Bench | ML 研究工程 vs 人类专家(7环境/61位专家) | 2h AI 4x人类, 8h人类反超 |
| MLE-bench | Kaggle 竞赛(75竞赛) | o1-preview+AIDE 16.9%铜牌 |
| KernelBench | GPU 内核正确性与速度(250任务) | — |

## 参考

→ [raw/articles/kZrryL8_fxfq2pSFw6LSqg|原文存档]
→ [Lilian Weng 原博客](https://lilianweng.github.io/posts/2026-07-04-harness/)

[^1]: raw/articles/kZrryL8_fxfq2pSFw6LSqg

---

