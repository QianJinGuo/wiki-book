# Dynamic Subagents: 代码驱动的 Subagent 编排

> 📊 Level ⭐⭐⭐ | 10.6KB

## 摘要

LangChain Dynamic Subagents 让 Agent 通过编写 JavaScript 脚本（而非逐轮工具调用）来编排 subagent 执行。核心替换：Agent 用代码（循环、分支、并发）驱动协调逻辑，而非依赖模型每步推理做编排决策。提供六种编排模式（Classify and Act、Fanout and Synthesize、Adversarial Verification、Generate and Filter、Tournament、Loop Until Done），通过轻量级 QuickJS 解释器安全执行。

## 核心要点

1. **核心替换**：Agent 用代码驱动 subagent 编排（写脚本 → 解释器执行 → 调度 subagent），替代逐轮工具调用
2. **确定性保证**：循环不会漏项，分支不会走偏——编排逻辑固化到确定性代码，而非模型每步推理
3. **六种编排模式**：Classify and Act / Fanout and Synthesize / Adversarial Verification / Generate and Filter / Tournament / Loop Until Done
4. **技术栈**：Deep Agents + QuickJS 代码解释器，内置 `task()` 全局函数，支持 responseSchema 结构化输出
5. **同源思想**：与 Claude Code Workflows、Recursive Language Models 共享「模型写代码，代码调度更多 Agent」的核心洞察

## 深度分析

### 从「模型推理编排」到「代码编排」的范式转变

传统 subagent 模式：主模型每步做推理决策 → 调用 subagent → 等待返回 → 推理下一步。这本质上是一种**隐式编排**，编排逻辑分布在模型的多步推理轨迹中，不可检查、不可复用、不可调试。

Dynamic Subagents 的代码编排是**显式编排**：编排逻辑写成 JavaScript 代码，在解释器中执行。循环、分支、并发由代码语义保证确定性。Agent 的推理工作从「如何协调」转变为「如何写协调代码」——而后者是 LLM 最擅长的任务。

这条路线并非孤例：Claude Code Workflows、Recursive Language Models（Recursive Language Models）共享同一个公式——**模型写代码，代码再调度更多模型**。放回 [Agent 编排模式](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/agent-orchestration-patterns.md) 的谱系里看，它改变了「编排由谁承担」的答案：过去是框架从外部用图或状态机固定编排、模型只做节点内决策；现在把编排权交还给模型，但用**代码**这种受限介质来约束它。模型拿回了自主权，同时被剥掉了「随手偏离计划」的自由度。

### 六种模式的工程本质

六种模式不是新发明——它们是对经典并行处理模式（fork-join、pipeline、divide and conquer）的 Agent 时代重新包装。真正的贡献是让 Agent 能根据任务类型在运行时自主选择合适的模式，而非人为预设。

对回经典原语就能读出各自的成本结构：fork-join → Fanout and Synthesize；多阶段条件流水线 → Classify and Act；带评分的 map-reduce → Generate and Filter；淘汰赛式选择 → Tournament；冗余对抗校验 → Adversarial Verification；迭代至收敛的定点搜索 → Loop Until Done。选择规则可压缩成一句：子任务同质且可切分就用 Fanout（吞吐优先）；输入异质、需路由到不同专家就用 Classify and Act；误报代价高（安全审计、合规检查）就用 Adversarial Verification，以第二次独立审查换低误报；解空间开放、评价标准模糊就用 Generate and Filter 或 Tournament；终止条件事先不可知、需要穷尽才用 Loop Until Done，且必须自带去重与停滞判据。

关键洞察是：模式不是模板而是**运行时选择**——同一个 Agent 可以在一段脚本里先 classify、再 fanout、再 verify，组合出的形状比任何单一模式都更接近真实任务；代价是模式选择本身也成为需要被 review 的决策。

### 确定性编排的可重放性：代码能校验，推理不能

逐轮工具调用把控制流藏进模型的思维链：每一步决策只存在于那一轮会话的隐状态里，不可静态审查、不可版本化、失败后也无法原样重放。代码编排把控制流固化为可读、可 diff 的 JavaScript——循环边界、并发宽度、终止条件都是文本事实，而不是概率采样的副产物。于是三件事第一次变得可能：调度形状可复现；token 预算可在运行前估算而非事后对账；失败可定位到某一行 `task()` 调用，而不是「模型第 7 轮想歪了」。

但要划清边界：代码锁定的是**调度**确定，而不是**结果**确定。subagent 内部的模型调用仍然是非确定性的，脚本只固定了 orchestration 的骨架，对正确性的信心必须另由验证环节（如 Adversarial Verification）提供，两者不可互相替代。

### QuickJS 沙箱：安全边界与注入爆炸半径

选 QuickJS 而不是直接执行 Python / Node，是能力最小化而非性能取舍：解释器只暴露 `task()` 这一个全局入口，脚本拿不到文件系统、网络、进程派生等原语，最坏也只能「调度更多 subagent」。

与 [Agent 沙箱与执行容器](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/agent-sandbox.md) 常见的逃逸威胁模型不同，这里的攻击面前移了：真正的风险不是执行器被突破，而是上下文被污染后模型**写出一个错误的计划**——例如把敏感路径当作 `description` 广播给几十个 subagent，把一次泄漏放大成几十次。沙箱把「任意代码执行」降级为「受约束的调度」，爆炸半径从进程级压缩到任务级：失控脚本最多是多花钱、多起几个 subagent，拿不到 shell。

由此得出两条约束：`task()` 的参数必须可审计（谁被调用、做什么、返回什么 schema），并发度与递归深度必须由宿主侧钳制——沙箱给安全下限，限额给成本上限。这也把 [Prompt 注入防御](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/prompt-injection-defense.md) 的重心从「过滤输入」部分移向「审计计划」。

### 成本与延迟：瓶颈从模型 token 迁移到调度与 IO

数百个 subagent 的现实约束就在编排开销上：逐轮工具调用要求模型为每一次下发产生一整个推理回合，300 次调用就是 300 个回合的 token 与延迟；脚本化后压缩为一次「写脚本」的推理，随后的几百次 `task()` 由宿主并发调度。

但瓶颈没有消失，只是迁移了：并行度升到几十上百之后，wall-clock 由最慢的 subagent、调度队列与返回值序列化共同决定，优化对象从「写更好的 prompt」变成分片粒度、并发上限、超时与重试——也就是把 Agent 工程的调优重心推回分布式系统的老问题。成本口径同样要换：token 消耗约等于扇出宽度乘以单个 subagent 的上下文规模，固定预算下加宽扇出等于稀释每个 subagent 的上下文，宽度与深度是零和的。

## 实践启示

1. **从 Fanout + Synthesize 起步**：六种模式里它坑最少——任务同质、无需路由判断、结果只需合并。先用它把「脚本调度 subagent」这条链路（并发、超时、聚合）跑通，再引入 Classify and Act、Adversarial Verification 这类更重的结构。
2. **每个 subagent 都强制 `responseSchema`**：这是让编排脚本能真正在代码里过滤、排序、聚合的前提。没有 schema 的返回值只能作为自由文本回灌给模型，等于把已经落地的确定性编排又退回成推理编排。
3. **并发度与递归深度做成宿主侧硬限额**：脚本能表达的是「想要多少」，宿主必须回答「最多多少」。否则一个被注入污染的扇出常数会直接变成账单事故——默认值保守，按任务显式放宽。
4. **把生成的脚本当作被 review 的一等产物**：记录每一次生成的 JS（输入、脚本全文、每个 `task()` 的 description/schema/返回值），让脚本可入库、可 diff、可重放。出问题时先怀疑脚本、再怀疑模型——脚本能版本化，思维链不能。
5. **为「不收敛」预设出口**：Loop Until Done 与 Tournament 必须自带去重集合、轮次上限和停滞判据；在生产环境里，没有终止判据的发现循环等价于无限计费。
6. **不必并行的任务别硬并行**：单点、强顺序、上下文高度耦合的任务（例如一次连续调试会话）交给单 Agent 更省也更快。把 orchestration 折成代码的收益，只在任务本身可切分、可并行或需要反复独立验证时才兑现。

## 相关实体

- [Anthropic Dynamic Workflows](https://github.com/QianJinGuo/wiki-public/blob/main/entities/anthropic-dynamic-workflows-ultracode-deep-research-lyuyuebannzi.md)
- [Generator-Evaluator 对抗验证](https://github.com/QianJinGuo/wiki-public/blob/main/entities/harness-generator-evaluator-anthropic.md)
- [Claude Code Subagent 规则](https://github.com/QianJinGuo/wiki-public/blob/main/entities/claude-code-12-rules-karpathy-extension.md)

→ [原文存档](https://mp.weixin.qq.com/s/aiJs5CC8Gb6qa_xDRNEjTA)

---

