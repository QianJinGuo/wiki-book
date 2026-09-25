# SkillOpt-Lite：一行Vibe指令加速Agent技能自进化

> 📊 Level ⭐⭐⭐⭐ | 11.1KB

> **论文**：SkillOpt-Lite: Better and Faster Agent Self-evolution via One Line of Vibe (arXiv:2607.03451)
> **来源**：Hyman的杂货铺 | [原文存档](https://mp.weixin.qq.com/s/XAz5KdMMKCVqGTLtw9Nv0w)
> **GitHub**：https://github.com/EvolvingLMMs-Lab/SkillOpt-Lite

## 核心创新

SkillOpt-Lite 将 Agent 技能优化重构为**零阶优化 + 文件系统调试**范式，删掉了 SkillOpt 管线中层层叠叠的组件（mini-batch合并、慢更新阻尼、拒绝缓冲），仅保留四个核心步骤：

> **轨迹落盘 → 文件系统探索 → 最小补丁 → 验证门控**

### 零阶优化统一视角

将已有 Agent 反思范式映射到经典零阶优化工具箱：

| 范式 | ZO 对应 | 来源 |
|------|---------|------|
| 单轨迹反思（Reflexion/Voyager） | 单点梯度估计 | 已有 |
| 批量 rollout（Trace2Skill/SkillOpt/SkillForge） | mini-batch 随机梯度 | 已有 |
| 成败对比（SkillCat） | 中心差分 | 已有 |
| 逐步原子修改（SkillAdapter） | 坐标下降 | 已有 |
| 编辑预算衰减/拒绝缓冲（SkillOpt） | 信赖域+控制变元 | 已有 |
| **轨迹落盘+文件系统探索（SkillOpt-Lite）** | **语言介导程序编译** | **本文** |

**关键洞见**：轨迹不是黑盒标量——每次 rollout 吐出一整段可读轨迹（计划、工具调用、报错栈、中间文件）。因此技能优化不是黑盒优化，而是"语言介导的程序编译"：技能文档是源码，LLM 是编译器+运行时，轨迹是调试日志。

### HarnessOpt：技能饱和后改脚手架

当技能文本调到头，瓶颈转到 Harness（工具循环、观测格式、重试策略）。HarnessOpt 把 Harness 也当成可编辑代码，配合白名单+烟测+可回滚的安全约束。

## 关键实验结果

| 任务 | 最好成绩 | 提升幅度 |
|------|---------|---------|
| SpreadsheetBench | GPT-5.4-nano 66.2（+36.3） | 联合优化超越 GPT-5.5+完整 SkillOpt |
| ALFWorld | GPT-5.4-nano 81.3%（+9.5） | 小型提升 |
| LiveMath | GPT-5.5 73.6（+37.0） | 大幅提升 |
| DocVQA | GPT-5.5 94.2（+5.2） | 显著提升 |

## 边界条件

1. 验证集太小仍抖
2. 语义任务增益有限
3. HarnessOpt 依赖 Round-0 质量
4. 计算成本：每轮 batch rollout + 验证不便宜

## 深度分析

### 零阶优化映射的解释力与失效点

把已有的 Agent 反思范式逐条投影到经典零阶优化工具箱，价值不在于换个说法，而在于可以把 ZO 领域积累多年的直觉直接搬到技能优化上。批量 rollout 对应 mini-batch 随机梯度，"批量越大越稳但越贵"因此天然成立：批量压低梯度估计的方差，让共识挖掘出的失败模式更可能是真信号而非单条轨迹的偶然，但每多一条 rollout 就多一次完整的模型推演与验证开销，边际收益递减的位置由任务自身方差决定。

编辑预算衰减与拒绝缓冲被映射成信赖域加控制变元，解释力同样直白：单轮补丁不能太大，否则一步跨出当前技能的"有效半径"，验证集分数会剧烈震荡；保留上一版可用技能作为回退点，等价于控制变元约束，使每次探索都落在已知可行解的邻域内。

真正失效的一步在最后：经典 ZO 的目标函数只吐回一个标量，而技能优化每次 rollout 吐出的是一整段可读轨迹。梯度在这里不是数值而是文本——它同时携带了奖励信息与失败原因，却无法被"梯度下降"的框架直接消化。这正是 SkillOpt-Lite 与 [微软 SkillOpt](https://github.com/QianJinGuo/wiki-public/blob/main/entities/skillopt-microsoft-train-skill-like-neural-network.md) 的分水岭：后者仍按神经网络训练的隐喻堆叠组件，前者承认目标是非标量的，转而用文件系统与共识挖掘去读文本。

### 语言介导的程序编译：可复用的调试习惯

"技能文档是源码、LLM 是编译器兼运行时、轨迹是调试日志"这个类比，把技能优化从"调参"重新定义为软件维护，随之而来的是三件可以直接照搬的程序员调试习惯。

第一是保留完整轨迹。既然轨迹是调试日志，删掉它就等于关掉断点。轨迹落盘（每个 rollout 一个文本文件）本质上是把不可见的推理过程变成可检索的持久化工件，失败模式因此可以被反复 list/read，而不依赖某次反思 Agent 的记忆。

第二是可复现的实验设置。调试结论必须能被别人重跑验证，对应到技能优化就是独立验证集与固定门控：补丁只有独立验证集分数上升才被接受，否则回滚。这条纪律正是"最小补丁 + 独立验证"闭环能够替代复杂组件的原因。

第三是分层验证。源码改动通常先过单元测试再过集成测试，技能改动同样应分层——单任务烟测、小验证集门控、大验证集确认。只在很小的验证集上过门控，恰好是 SkillOpt-Lite 自己承认的抖动来源之一。

### HarnessOpt 的判定信号与安全护栏

把技能文本比作源码，Harness（工具循环、观测格式、重试策略）就是构建脚本与运行时环境。何时判定"技能文本已饱和、瓶颈转到 Harness"？可操作的信号大致有三类：连续多轮最小补丁在独立验证集上不再带来可测提升；共识挖掘反复定位到同一类失败，却已无法用技能文本约束（例如失败总是发生在工具返回格式的解析处）；同一份技能换到不同 Harness 上的表现差距，明显大于换模型带来的差距。

一旦判定瓶颈转移，HarnessOpt 把 Harness 也当成可编辑代码。但这比改技能危险得多：技能只影响模型读什么，Harness 改的是模型如何行动，一处错误的重试策略可能让整个循环烧掉大量 token 甚至无法恢复。因此白名单（只能改框架脚本，不能碰评测逻辑与数据）、烟测加验证门控（改完先跑冒烟再进验证集）、可回滚（git reset 加 feature toggle）属于必要条件而非加分项。

### 实验增益的条件性：可优化空间决定收益上限

如果只看提升幅度的数字，很容易得出"普遍显著提升"的笼统结论；把模型与任务交叉看，结论其实是有条件的。SpreadsheetBench 上 GPT-5.4-nano 从 29.9 提到 66.2（+36.3），LiveMath 上 GPT-5.5 从 36.6 提到 73.6（+37.0），这两处大幅增益都发生在初始能力远低于任务要求的模型上——技能文档补齐了它们原本缺失的程序性知识。

反向对照同样清楚：DocVQA 上 GPT-5.5 只涨 5.2 分就已冲到 94.2，ALFWorld 上 nano 涨 9.5 分到 81.3%，语义检索与具身任务之间的差距被压在 +0.1 到 +1.5 分。所以收益大小并不取决于模型强弱，而取决于"初始技能文本与 Harness 留了多少可优化空间"：强模型配合标准 Harness 往往已贴近该任务在当前底座下的上限，技能文本再改也无处可改。

更有说服力的旁证是联合优化：只调 Harness 让 nano 在 SpreadsheetBench 上从 0.6619 升到 0.7651，叠加技能优化后到 0.7758，超过 GPT-5.5 跑标准 Harness 加完整 SkillOpt 的 0.7620。一个更小的模型配上被优化过的脚手架，可以赢过更大的模型配上未优化的脚手架——收益来自可优化空间被打开，而非模型本身的替换。

### 边界条件的成因与在 wiki 中的定位

四条边界条件每一条都对应一种应该放弃或换路的工程情境。验证集太小仍然抖动，根因是零阶估计的方差无法被小样本压制，此时应扩大验证集或降低单轮补丁幅度，而不是继续加轮次。语义任务增益有限，根因是缺少客观 reward 信号——没有可判定的成败，共识挖掘就无从提炼补丁，这类任务更适合人工规则沉淀而非自动进化。

HarnessOpt 依赖 Round-0 质量则是典型的垃圾进垃圾出：若初始 Harness 连基本工具调用都跑不通，模型读到的轨迹全是噪声，探索阶段便提炼不出有意义的最小补丁。计算成本这条是硬约束，每轮 batch rollout 加验证都不便宜，因此技能优化更适合低频、可离线、收益可摊销的批处理任务，而不是塞进在线请求路径。

放进 wiki 的坐标系里，SkillOpt-Lite 的介入层级比提示词优化更深一层：它同时修改技能文本与执行脚手架，而 [LLM 工件优化](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/llm-artifact-optimization.md) 一类做法只把技能文本当成待打磨的产物。相比 [技能自进化的其他路径](https://github.com/QianJinGuo/wiki-public/blob/main/entities/skill-self-evolution-three-approaches.md) 多依赖经验积累或对照学习，它额外提供了"可回滚地修改运行时"这一维度，这也是它与 [Harness Engineering](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/harness-engineering-framework.md) 共享底座的原因；代价是必须承担 [不该做 Harness Engineering 的风险](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/when-not-to-harness-engineering.md)——Round-0 或验证集质量不足时，自动改脚手架会把错误固化。

## 实践启示

- **最小闭环思维**：Agent 自我进化不需要复杂组件堆叠，文件系统 + 共识挖掘 + 独立验证构成够用的最小闭环
- **降低复杂度**：去掉 mini-batch 合并、慢更新阻尼等组件后，反而更快更强——应审慎评估每层抽象的实际贡献
- **Harness 是瓶颈**：当技能优化饱和后，Harness（执行脚手架）成为下一个可优化的维度
- **一行命令部署**：`/skillopt-loop rounds=10 batchsize=40 target=gpt5.4-nano` 的低门槛入口降低了 Agent 自进化的使用成本

---
## 关联
- 相关概念: [Harness Engineering](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/harness-engineering-framework.md)
- 相关: Agent 架构

---

