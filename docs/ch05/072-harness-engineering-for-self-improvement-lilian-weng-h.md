# Harness Engineering for Self-Improvement — 翁荔 Lilian Weng 系统梳理 Harness 自我提升研究全景

> 📊 Level ⭐⭐⭐⭐ | 14.6KB

## Harness Engineering for Self-Improvement — 翁荔系统梳理 Harness 自我提升研究全景

> Lilian Weng (翁荔) 博客最新文章，系统梳理了 Harness 工程在递归式自我提升（RSI）方向的研究全景，从 ACE、MCE、Meta-Harness 到 Self-Harness、Darwin Gödel Machine、SIA，涵盖 35+ 篇论文参考文献。[^1]

## 核心命题

递归式自我提升（RSI）究竟会先发生在模型权重层面，还是先发生在 **Harness（脚手架）**层面？翁荔认为近期内 RSI 路径不太可能一上来就是模型改写自己的权重，更可行的路径是：**Harness 工程向「元方法论」演进**——改进获得更好答案的机制本身。[^1]

## 与已有实体的关系

- [Self-Harness 论文深度分析](https://github.com/QianJinGuo/wiki-public/blob/main/entities/self-harness-shanghai-ai-lab-agent-improves-harness.md) — 互补：该实体聚焦 Self-Harness 单篇论文的具体方法论（Weakness Mining → Proposal → Validation 三阶段），本实体覆盖 Harness 自我提升的**全部研究谱系**（ACE → MCE → Meta-Harness → STOP → Self-Harness → DGM → SIA）
- Harness Engineering — 上位框架：本实体是 Harness Engineering 在**自我提升**这一前沿子方向的研究全景
- [Agent 自我提升六种机制](https://github.com/QianJinGuo/wiki-public/blob/main/entities/agent-self-improvement-six-mechanisms.md) — 互补：该实体从 Agent 视角归纳六种路径，本实体从 **Harness 优化**视角系统梳理研究论文
- [Harness 工程五大支柱](https://github.com/QianJinGuo/wiki-public/blob/main/entities/harness-engineering-90-percent-pillars.md) — 互补：该实体聚焦生产级 Harness 实践，本实体聚焦前沿研究

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

### MemoHarness：经验驱动的案例级 Harness 适配

圣母大学团队提出的 MemoHarness 是 Lilian Weng 综述之后的新进展：不是在设计新 Harness 架构，而是让已有 Harness 学会**从经验中自适应**。

**六维 Harness 空间**：按推理流水线的时间顺序将 Harness 拆成六个可编辑控制面（D1 输入拼装 → D2 工具与检索 → D3 生成长度与采样 → D4 多步编排 → D5 跨轮记忆 → D6 输出处理），搜索不再改一整坨黑盒提示，而是在这六个旋钮上结构化编辑。这比 Lilian Weng 综述中"上下文工程谱系"（ACE/MCE）的单一维度搜索更系统。

**两阶段流程**：
- 训练期：在有标签的搜索集上搜索六维配置，每次执行记录轨迹、得分、成本和维度诊断
- 测试期：经验库冻结，对新题检索相似历史案例，将全局 harness 改编为案例级配置，一轮执行即交卷

**与综述中工作的对比**：

| 维度 | Self-Harness | DGM | **MemoHarness** |
|------|-------------|-----|-----------------|
| 改动单位 | 提示词 | Harness 代码 | 六维旋钮 |
| 搜索范围 | 单次 | 多代进化 | 结构化笛卡尔积 |
| 测试期自适应 | 无（部署固定） | 无（部署固定） | **每道新题单独改编** |
| 失败归因 | 执行结果 | 测试是否通过 | **分维度诊断** |

**结果**：Terminal-Bench 0.722→0.806 (+8.4pp)，同模型同工具，只换 Harness。

→ [原文存档](https://mp.weixin.qq.com/s/1UfFSdrtnp07WIqe1gX0Nw)

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

## 深度分析

### 被改进的对象分五层，不是一件事

综述把 35 篇工作排成时间线，但改动单位并不同质：Promptbreeder 与 STOP 改提示词，ACE 改条目化 playbook，MCE 在 skill.md 层分离「如何管理上下文」的机制与内容，AFlow/ADAS 搜工作流图，Meta-Harness 与 DGM 改代码仓库乃至优化器代码，只有 SIA 在「改 Harness」与「改权重」间做选择且证据初步。[^1]

这也解释了共同选择：权重更新要数据、算力与不可逆发布，改错无法回滚；Harness 的一行 diff 可 review、可 revert，能在同一 checkpoint 上 A/B。**在可回滚性成为硬约束之前，自我提升会优先发生在文本层。** [^1]

### 元层次的阶梯：越往上，信号越稀

「提示词 → 结构化上下文 → 工作流 → Harness 代码 → 优化器代码」不只是复杂度递增，它改变了反馈的信噪比。改一句提示词，跑一次就能判好坏；改一版优化器代码，要跑完整个搜索才知好坏，而那搜索本身带随机性。层级越高，单次试验越贵、样本越少、信用分配越模糊——这是 Harness Engineering 从「写脚手架」转向「设计改进机制」的代价。[^1]

阶梯还带自指：Promptbreeder 连变异提示词一起进化，Meta-Harness 是「优化 Harness 的 Harness」。递归没有天然终点，只能由评估预算截断——「元」应停在评估器还撑得住的那层。[^1]

### 进化搜索与手工设计：谁做接受决策

DGM、AlphaEvolve、AFlow 同族：维护候选池，LLM 生成 diff，用基准分或 MCTS 价值选择，前提是任务可自动打分。目标一旦含混（可维护性、向后兼容、人类偏好），自动选择就退化为对代理指标的过拟合。手工路线（AI Scientist、ScientistOne）把「什么算好」写进结构：换不来速度，换来可解释的失败。[^1]

最难的中间态由 STOP 标出：同一回路在 GPT-4 上有效，在 GPT-3.5 与 Mixtral 上反而变差。回路没变，是提议修改的智能体不够强，产出净负价值编辑而门控无力识别。**自我提升存在能力地板，地板由提议者水平而非流程决定。** [^1]

### 验证门要装在循环之外，停止条件要由人写

这些工作共享四段结构：提议便宜，接受昂贵。Self-Harness 用 held-in/held-out 双门控，DGM 用档案库加基准分，Meta-Harness 用帕累托前沿保留非支配解，AFlow 用 MCTS 回溯价值。[^1] 形式不同，作用一致——装一个自我修改无法改写的裁判。评估者留在环内，被优化对象迟早学会讨好裁判而非解决问题，这正是 [评估器瓶颈](https://github.com/QianJinGuo/wiki-public/blob/main/entities/agent-self-evolution-evaluator-bottleneck.md)。

停止条件是同一枚硬币的另一面：LLM 不擅判断何时放弃假设，训练数据里成功远多于失败，循环因此倾向无限打补丁而不认方向错了。把「何时停」写成预算上限或人工规则，比指望自省可靠。[^1]

### MemoHarness 补上的那块：部署期自适应

综述里的方法几乎都产出「一个」全局 Harness，部署后固定——Self-Harness 与 DGM 测试期都不再学习。MemoHarness 往前推一步：训练期在六维空间搜索，测试期冻结经验库，对新题检索相似案例，把全局配置改编成案例级配置，一轮交卷，Terminal-Bench 0.722 → 0.806，FinanceAgent 提升 16.7 个百分点。

它的贡献是把 Harness 显式化为六个耦合控制面（D1 输入拼装 → D6 输出处理）。维度互相牵引：开检索要留证据位、加长预算、可能变多步、结尾从「原样输出」改为「抽字段」。所以这不是六个旋钮的笛卡尔积，而是带约束的联合搜索——也解释了只改上下文的单维路线为何在长程任务上触顶。

### 综述留下的空白

其一，缺衡量「改进过程」的基准：PaperBench ~21%、RE-Bench 等量的是任务成功率，没人量「这次编辑能否泛化、单位提升耗多少 token」。其二，RE-Bench 里 2 小时 AI 四倍于人类、8 小时人类反超，说明自我改进只覆盖短时程。其三，SIA 的「何时改权重、何时改 Harness」仍停在初步证据。[^1]

## 实践启示

1. **先拆维度，再谈优化。** 照 MemoHarness 的时间序切成输入拼装、工具与检索、采样、多步编排、跨轮记忆、输出处理六面，每面独立可开关、可回滚。没有这套命名，「改 Harness」只能整块重写提示词，失败时无法归因。

2. **把可改进的东西放进文件。** 提示词里的指令会被压缩、截断、下一轮覆盖；写成 skill.md、目录结构或可 diff 的配置，才能被 review、revert、归档成候选池。文件既是记忆也是基因。[^1]

3. **门控与停止条件都写在循环之外。** 每次自我修改都过 held-out 门控，评估集、权限与预算上限不放在进化环内；同时写死「何时停」，并记录失败轨迹、维度诊断与「为什么放弃」，而非只留成功样本。这比选哪种搜索算法更决定成败。

4. **训练期搜索，部署期只检索。** 贵搜索离线做一次，线上只做案例检索加配置改编，一轮出结果。现场搜配置延迟不可接受，完全冻结又放弃案例级适配的收益。

5. **先在强模型上验证回路，再下放。** STOP 在弱模型上的负增益说明流程对而提议者弱会净亏损。[六种自我提升机制](https://github.com/QianJinGuo/wiki-public/blob/main/entities/agent-self-improvement-six-mechanisms.md) 的比较也支持这点：可迁移性取决于评估信号而非更新位置；部分改进终会被下一代模型内化，长期资产是接口与评估体系。[^1]

## 关联

- 同题异语种孪生页：[刚刚翁荔博客又上新通过Harness工程实现Ai自我提升](https://github.com/QianJinGuo/wiki-public/blob/main/entities/刚刚翁荔博客又上新通过harness工程实现ai自我提升.md)（归并候选，提案卡 #11 批1）

---

