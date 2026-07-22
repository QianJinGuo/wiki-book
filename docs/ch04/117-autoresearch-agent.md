# AutoResearch 分类法：四种 Agent 循环设计与四维分析框架

## Ch04.117 AutoResearch 分类法：四种 Agent 循环设计与四维分析框架

> 📊 Level ⭐⭐ | 15.4KB | `entities/autoresearch-taxonomy-chengzihong-chengzihong.md`

# AutoResearch 分类法：四种 Agent 循环设计与四维分析框架

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/autoresearch-taxonomy-chengzihong-chengzihong.md)

## 摘要

"白白小白"（陈子弘）系统性整理 AutoResearch（自动机器学习研究）领域的四种主流 Agent 循环设计：线性 Keep-or-Discard、树搜索、遗传进化池、异步多 Agent 进化。文章核心价值在于给出一个**通用四维分析框架**（搜索拓扑、反馈信号、记忆架构、决策主体），可解构任何新的 AutoResearch 方法并直接评估其优劣势。当基模固定时，**Agent 循环设计就是研究效率竞争的本质**——这正是 [Yann Dubois 强调的"AutoResearch = 基模 + Agent Loop"](../ch01/168-openai.html)。

## 核心要点

- **AutoResearch = 基模 + Agent Loop**：基模固定时，方法循环设计是研究效率竞争的本质。
- **四种循环设计**：
  1. **线性 Keep-or-Discard**（Karpathy autoresearch）：最简单，固定时间预算，无并行能力。
  2. **树搜索**（AIDE、AI Scientist v2）：节点=完整方案，边=代码变换；可回溯、可并行。
  3. **遗传进化池**（FunSearch、AlphaEvolve、GEPA）：种群演化，无严格父子拓扑。
  4. **异步多 Agent 进化**（CORAL）：多个独立 Agent 通过共享持久记忆间接协调。
- **四维分析框架**：搜索拓扑、反馈信号、记忆架构、决策主体——任何 AutoResearch 方法都可用此框架解构。
- **UCB 平衡利用与探索**：在树搜索中，UCB(node) = 平均收益 + C × sqrt(ln(总访问次数) / 该节点访问次数) 解决"贪婪策略导致其他子树被饿死"的问题。
- **GEPA 的关键创新**：用文本反馈取代标量奖励驱动突变——LLM 阅读完整执行轨迹后归因原因、提出针对性修改。
- **CORAL 的去中心化**：通过文件系统实现共享记忆（attempts/、notes/、skills/），无显式通信协议——Agent 通过符号链接按需读取避免上下文过载。

## 深度分析

### 一、为什么"Agent Loop 设计"是研究效率竞争的本质

基模的差距在缩小，但**研究效率的差距在扩大**——这是 AutoResearch 领域的核心判断。当所有人都用相似基模（GPT-5.4、Claude Opus 4.6、Gemini Pro）时，**区别在于 Agent 如何用它们**：

- 同样的 GPT-5.4 在 Karpathy autoresearch（线性循环）下 vs AIDE（树搜索）下产出的论文质量差异巨大
- 同样的 Claude Opus 在 AI Scientist v2（树搜索 + Agent 自主选择）下 vs CORAL（异步多 Agent）下，产出效率完全不同

这呼应了 [Nathan 评测 GPT 5.4 时的核心论点](../ch01/513-codex.html)：模型权重之外的"系统"才是真正的差异化来源。Agent Loop 就是研究的"系统"。

### 二、四种循环的工程取舍

#### 2.1 线性 Keep-or-Discard

**代表**：Karpathy autoresearch

**核心约束**：固定 5 分钟时间预算，强制思考"什么改动能在极短训练后产生可测量收益"。

**优势**：
- 极简（3 个文件 + Markdown 指令）
- 自主执行，无人工干预

**局限**：
- 无法并行探索多个方向
- 失败实验的经验未结构化保存（可能反复尝试同一 idea 死循环）
- 短时间约束易陷入局部最优
- 仅看最终标量指标，可解释性不足

#### 2.2 树搜索

**代表**：AIDE、AI Scientist v2

**核心数据结构**：树中每个节点是完整可独立运行的 Python 脚本（从数据加载到模型训练到输出指标的完整 ML pipeline），边是三种算子：

| 算子 | 输入 | 输出 | 关键约束 |
|------|------|------|---------|
| Draft | 任务描述 + 已有方案摘要 + "不要重复"指令 | 全新方案 | 每个 draft 用不同方向（XGBoost / NN / feature engineering） |
| Debug | 完整 buggy 代码 + 终端输出 + traceback | 修复后代码 | 修复后仍可继续 debug 直到深度上限 |
| Improve | 当前方案代码 + 成功方案摘要 | atomic improvement | 每次只改一个东西（只换特征工程或只换超参数） |

**关键设计哲学**："atomic improvement"——每次只改一个东西，可清楚归因效果。

**选择策略**：
- **AIDE 贪婪策略**：总是选当前最优节点做 improve → 收敛快但易陷入局部最优（其他 draft 被"饿死"）
- **MCTS/UCB 策略**：用 Upper Confidence Bound 公式平衡利用与探索
- **AI Scientist v2 完全去公式化**：让 Agent 自主判断"现在应该深耕哪个方向"

#### 2.3 遗传进化池

**代表**：FunSearch（DeepMind, 2023）、AlphaEvolve（2024）、GEPA（2025）

**核心思想**：维护候选种群，选择优秀个体，施加 LLM 突变，评估后代适应度，逐代推动种群向更优方向进化。

**关键差异（vs 树搜索）**：进化池中的个体之间**没有严格的父子拓扑**——任何个体都可被选为突变起点，多个个体可被交叉组合。

**FunSearch 创新**：使用 MAP-Elites 算法，**不只保留最优个体**，而是在多个行为维度的每个 niche 中都保留最优个体，从而维持种群的多样性。

**GEPA 革命**：用文本反馈取代标量奖励驱动突变——系统先对当前候选进行 rollout，记录完整的执行轨迹（推理过程、工具调用、输出），然后让 LLM 阅读这些轨迹来诊断问题、归因原因、提出针对性修改。这与 [Yann 提到"RL 的归因难题"](../ch01/168-openai.html)形成对照：GEPA 不通过 RL 自动归因，而是用 LLM 阅读 + 推理进行归因。

#### 2.4 异步多 Agent 进化

**代表**：CORAL（2026）

**核心思想**：多个 Agent 各自独立运行完整的搜索循环，通过**共享持久记忆**间接协调，无需任何显式通信协议。

**共享记忆结构（文件系统实现）**：
- `attempts/`：所有历史评估记录（JSON 格式，按 commit hash 索引）
- `notes/`：观察和反思（Markdown 格式，支持合并和分类）
- `skills/`：可复用的过程和工具（自然语言描述 + 可执行脚本）

**关键设计**：每个 Agent 通过符号链接访问共享记忆，按需读取以避免上下文过载，且 Agent 可以主动整理和重组记忆结构。

这与 [多 Agent 编排](https://github.com/QianJinGuo/wiki/blob/main/concepts/multi-agent-orchestration.md)的本质区别：**CORAL 没有中央协调器**——所有协调通过共享文件系统隐式完成，更接近"分布式系统"而非"主从架构"。

### 三、四维分析框架的实战价值

任何 AutoResearch 方法都可用此框架解构：

| 维度 | 决定什么 | 极端选择 | 工程含义 |
|------|---------|---------|---------|
| **搜索拓扑** | 系统如何在解空间中行走 | 线性 / 树 / 池 / 异步 | 决定并行能力、回溯能力、局部最优风险 |
| **反馈信号** | 系统从每次实验中学到多少 | 标量 / 结构化 / 文本 | 决定下一次决策质量、信息密度 |
| **记忆架构** | 系统能否从历史中学习 | 无 / Git / 解树 / 文件系统 / 知识图谱 | 决定跨实验的知识复利、上下文管理 |
| **决策主体** | 谁在控制搜索过程 | 人类硬编码 / Agent 自主 | 决定系统的自适应能力、人类工作量 |

**实战示例——用框架评估 GEPA**：
- 搜索拓扑：池（无严格父子）
- 反馈信号：**文本**（执行轨迹）
- 记忆架构：解树 / 文件系统（取决于实现）
- 决策主体：Agent 自主（用 LLM 阅读轨迹诊断）

优势：文本反馈比标量反馈信息密度高得多，能传达"哪个模块出了问题"
劣势：处理文本反馈的计算成本也高得多，且需要 LLM 能可靠归因（不一定）

### 四、与"传统 AutoML"的本质区别

传统 AutoML（Auto-sklearn、Optuna、FLAML）主要在固定特征工程 + 模型选择的组合空间内搜索，调优超参数。AutoResearch 的本质区别在于：

1. **解空间维度更高**：不仅调模型超参，还生成新的 feature engineering、新的模型架构、新的训练流程
2. **LLM 作为算子**：传统 AutoML 用贝叶斯优化/进化算法生成候选；AutoResearch 用 LLM 生成候选（语义级别的代码生成）
3. **反馈维度更丰富**：传统 AutoML 仅用标量指标；AutoResearch 可用执行轨迹、文本反馈
4. **研究本身是产物**：传统 AutoML 输出模型；AutoResearch 输出可发表的研究（论文 + 代码 + 实验数据）

### 五、循环设计的"复杂度 vs 性能"权衡

| 循环类型 | 工程复杂度 | 适用场景 | 典型场景 |
|---------|----------|---------|---------|
| 线性 | 极低 | 单方向研究、简单任务 | 单变量 ablation |
| 树搜索 | 中 | 多方向对比、需要回溯 | ML 竞赛、新模型探索 |
| 遗传进化池 | 中高 | 多样性优先、长期演化 | 数学发现、算法优化 |
| 异步多 Agent | 高 | 大规模并行、长时间运行 | 大型研究项目、跨团队协作 |

## 实践启示

1. **基模趋同时，差异化在 Agent Loop**：当所有团队用相似基模时，研究效率的差异完全由 Agent 循环设计决定。
2. **新 AutoResearch 方法出现时，用四维框架快速评估**：在选择/实现新方法前，先用"搜索拓扑/反馈信号/记忆架构/决策主体"四维解构，避免盲目跟随。
3. **从线性循环起步，按需升级**：MVP 阶段用 Karpathy autoresearch 的线性循环；遇到需要并行/回溯时升级到 AIDE 树搜索；遇到需要多样性时升级到遗传进化池；遇到需要长时间大规模并行时升级到 CORAL。
4. **"Atomic improvement"是工程纪律**：每次只改一个东西，可清楚归因效果——这是 AIDE 的核心工程哲学，应作为所有 AutoResearch 实验的默认纪律。
5. **文本反馈 > 标量反馈**（当 LLM 归因能力可用时）：GEPA 表明用 LLM 阅读执行轨迹归因，比用标量奖励更有效。但前提是 LLM 归因能力本身靠谱。
6. **共享记忆是异步多 Agent 的关键基础设施**：CORAL 的文件系统实现（attempts/notes/skills）可作为企业内部多 Agent 协作的参考架构。
7. **UCB 公式解决"贪婪导致的早期饿死"问题**：在树搜索中，如果担心某些 draft 的子树被过早忽略，使用 UCB 公式引入"好奇心加分"。

## 相关实体

- [Yann Dubois Openai Post Training Matt Turck Interview](../ch01/168-openai.html)
- [What Comes Next With Open Models](../ch01/215-what-comes-next-with-open-models.html)
- [Harness Engineering](https://github.com/QianJinGuo/wiki/blob/main/concepts/harness-engineering-framework.md)
- [Multi-Agent Orchestration](https://github.com/QianJinGuo/wiki/blob/main/concepts/multi-agent-orchestration.md)
- **Monte Carlo Tree Search**
- **AutoML**
- **Atomic Experiment Design**
- [MOC](https://github.com/QianJinGuo/wiki/blob/main/moc/workflow-orchestration.md)

---

