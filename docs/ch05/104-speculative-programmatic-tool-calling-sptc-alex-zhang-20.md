# Speculative Programmatic Tool Calling (sPTC) — Alex Zhang 2026

## Ch05.104 Speculative Programmatic Tool Calling (sPTC) — Alex Zhang 2026

> 📊 Level ⭐⭐ | 5.6KB | `entities/speculative-programmatic-tool-calling-sptc-alex-zhang-2026.md`

# Speculative Programmatic Tool Calling (sPTC) — Alex Zhang 2026

## 核心贡献

**Speculative Programmatic Tool Calling (sPTC)** 是一类将工具调用计算与 harness 正在生成的代码进行重叠（overlap）的技术，灵感来自 CPU 的 speculative execution 和 LLM 的 speculative decoding。核心技巧：在 harness 仍在生成 token 时，从**部分生成的 REPL 调用**中推断并预启动工具调用，而不是等整个生成完成。若最终生成的 REPL 确实调用了这些工具，它们立即从预启动调用的缓存输出返回。

关键观察：LLM 工具（sub-agent、search API）通常高延迟，是依赖代码执行作为动作的 harness 的瓶颈；同时主上下文生成本身也常是阻塞中间调用的显著延迟瓶颈。sPTC 的两个主要节省来源：(1) 在 token streaming 期间重叠已生成的工具调用；(2) 作为 REPL 调用之上的"朴素 JIT 编译器"，把代码中未写成异步但实际不阻塞的独立调用并行化。

## 设计：Shadowed Execution

高层设计是让 REPL 中导入的工具调用带一个可提前调用、在需要时替换为缓存输出的 hook。契约定义：(1) 哪些工具应被 speculate（如 sub-LLM 调用可以，sub-RLM 调用成本太高）；(2) 对输入依赖先前内存变量的工具调用的 speculate 机制。

核心机制是 **shadow REPL**：主代码 REPL 的 deepcopy fork，实时执行部分 REPL。大多数外部库和不安全函数（如 `open`）标记为 "unsafe"，任何输入依赖这些函数的 speculatable 工具都不 speculate。speculator executor 故意不用作真实 REPL executor——因为模型产生的完整 REPL 可能含错误代码或不完整工具调用，此时不希望 speculator 修改 REPL 状态，把整个 REPL cell 视为计算单元。

可 speculate 的情况分四类：
- **Case 1 Literals**：字符串/整数字面量可立即解析为工具调用，无需 shadowed execution
- **Case 2 Input dependencies**：所有输入 "safe"（纯函数、无副作用）即可 speculate；依赖被 speculate 的工具会先等依赖计算，即使 LLM 仍在 streaming 也执行
- **Case 3 Peekable 依赖**：streaming 中 shadow REPL 的工作命名空间使即使依赖是内存变量也能 speculate
- **Case 4 Blocked**：allowlist 定义可用来计算输入依赖的关键词/函数；被阻塞的工具不 speculate

在 PTC 中，工具调用按其输入唯一索引（非确定性则含 occurrence）。对相同工具调用（如对多个 sub-agent 的多数投票），必须跟踪唯一实例，避免单个 speculated 调用路由到每个副本——除非调用已知确定性。

## 基准与开销

实现 benchmark 于 OOLONG (trec-coarse, 132k) 和 OOLONG-Pairs (32k)（RLM 原论文），8xH100 80B + vLLM 服务器，Qwen3-30B-A3B-Instruct-0527 在 temperature=0.7 和 0.0，每次 5 遍，4 与 8 并发。**RLM 场景 speed-up 约 1-1.2x**。运行时额外开销可忽略（speculator 廉价地解析检查）；内存上 deepcopy REPL 相对实际变量内存廉价。最坏情况是 serving engine 被大量并发 speculated 请求堵塞。

## 相关工作与定位

- **Conveyor (Xu et al., 2024)**：允许用户定义部分执行机会（如一行代码），在 decoding 中解析
- **Speculative Interaction Agents (Hooper et al., 2026)**：把 Conveyor 系统正式定义为 "speculative tool calling"，主要减少 TTFT
- **AsyncFC (Feng et al., 2026)**：主张工具调用常被阻塞式实现，定义 future-based async wrapper 契约；风险是与原 harness 轨迹不 1:1

sPTC 认为对更复杂程序中的工具加 speculation 比标准 tool calling 更有用，因为程序运行时未知。标准 tool calling 下，LLM 生成足够 token 完整指定工具调用时，剩余 token 通常不多；而代码执行使实际工具调用模式显著更复杂，留下更多重叠空间。

实现：https://github.com/alexzhang13/spec-ptc（当前 {Python, bash, Bun} x {Coding harness, RLM, game agent}）。

## 相关实体

- [Language Model Harnesses as Compositional Generalizers (Alex Zhang)](ch05/080-harness.html) — 同作者 RLM harness 理论
- [MIT CSAIL RLM Harness Length Generalization](ch05/080-harness.html) — RLM 上下文
- [AlphaXiv RL for RLMs](https://github.com/QianJinGuo/wiki/blob/main/entities/alphaxiv-reinforcement-learning-for-rlms.md)
- [Prime Agent (RLM)](../ch03/006-agent.html)
- [Inference Optimization](https://github.com/QianJinGuo/wiki/blob/main/concepts/inference-optimization.md)
- [Speculative Decoding](https://github.com/QianJinGuo/wiki/blob/main/concepts/speculative-decoding.md) — 更基础的 token 级推测解码
- [Harness Loop Architecture](https://github.com/QianJinGuo/wiki/blob/main/concepts/harness-loop-architecture.md)

→ [原文存档](https://github.com/QianJinGuo/wiki-book/tree/main/docs/raw/articles/speculative-programmatic-tool-calling-sptc-alex-zhang-2026.md)

---

