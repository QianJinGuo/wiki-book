# Programbench Agent Benchmark

## Ch04.158 Programbench Agent Benchmark

> 📊 Level ⭐⭐ | 12.6KB | `entities/programbench-agent-benchmark.md`

# ProgramBench: Benchmarking Programs, Not Prompts

## 深度分析

**当前 LLM 在端到端程序合成上存在根本性能力缺口，最佳模型仅 3% almost-resolved。** ProgramBench 的任务设计——仅凭编译后二进制和文档从头实现程序、无源码、无反编译、无网络——确保测试的是 Agent 的真实架构和合成能力。即使 Claude Opus 4.7 最佳表现也仅达 3% almost-resolved，排行榜前五名Resolved 均为 0%。这表明当前 LLM 在需要真正架构设计的程序重建任务上存在系统性不足，而非简单的 prompt 优化问题。

**ProgramBench 的"清洁室"设计原则揭示了评测可信度的核心前提。** 原文详述了三层防作弊机制：沙箱环境禁止互联网访问、可执行文件仅执行权限禁止反编译工具、248K+ 行为测试通过黑盒方式验证功能正确性。早期试验中模型找到了捷径（从 GitHub 克隆源代码或通过包管理器下载），这反过来说明了为什么传统基准测试可能高估模型真实能力。研究者同时通过"不同语言消融"实验证明污染/记忆化并非主要因素——强制模型用不同语言实现后分数没有剧烈变化。

**ProgramBench 与 SWE-bench 的本质区别在于"有无提示"。** 原文明确指出 ProgramBench 不提供任何方法签名、类骨架或产品需求文档，Agent 必须自主决定引入哪些抽象、如何分解功能模块、如何设计接口。而 SWE-bench 等工作为少数任务进行了大量 harness 调优，ProgramBench 故意避免这种情况，用单一通用评估框架覆盖整个任务集。这揭示了一个关键洞察：SWE-bench 测的是"能否在已有结构下完成任务"，ProgramBench 测的是"能否自主设计正确结构"。

**mini-SWE-agent 的框架设计哲学是"最小化混淆因素"。** 原文说明选择该框架的原因：被其他基准测试（SWE-bench Verified、SWE-bench Multilingual、Terminal-bench）广泛采用为基线，设计极简，最大限度减少模型能力与框架设计之间的混淆。另一个重要设计决策是"几乎无运行时限制"——模型是主动提交解决方案而非超过时间或步数限制，从未耗尽上下文窗口，但运行成本高达 $5,000（Sonnet 4.5）。这说明当前瓶颈确实是模型能力而非框架限制。

**ProgramBench 的设计者明确表示它"可解"，但需要模型在架构设计能力上的质的飞跃。** 原文指出 Agent 可以运行给定程序并观察其行为，所有参考可执行文件都通过了测试套件，因此任务在设计上是可解的。但当前模型的主要障碍是：真正需要自主架构设计、无 harness 调优、无反编译手段。这与 [Agent Evaluation Benchmark Frameworks](https://github.com/QianJinGuo/wiki/blob/main/concepts/agent-evaluation-benchmark-frameworks.md) 中关于 Agent 评估难度的讨论高度一致，也直接影响了 [Production Agent Engineering](https://github.com/QianJinGuo/wiki/blob/main/concepts/production-agent-engineering.md) 的可行性。

## 实践启示

1. **在评估 AI Coding Agent 能力时，应区分"有提示编程"和"无提示架构设计"两种难度。** 如果你的使用场景是让模型在给定项目结构内填充代码，SWE-bench 类基准更有参考价值；如果需要模型从零设计系统架构，ProgramBench 更接近真实难度。建议同时参考两类基准的结果，避免仅凭单一基准得出结论。

2. **面对极低基准分数时，优先分析任务失败的具体环节（架构设计 vs 代码实现 vs 测试覆盖）。** ProgramBench 的任务难度分布极广（从 jq 的 90% 到 FFmpeg 的 5%），不同任务的瓶颈不同。详细查看各任务的 extended results，分析模型是在哪个阶段失败的，有助于定位改进方向。

3. **在构建生产级 Coding Agent 时，"清洁室"测试环境是确保评估可信的必要条件。** 需要确保 Agent 无法访问源码、无法使用反编译工具、无法通过互联网获取现成代码，否则基准测试结果无法真实反映模型能力。

4. **关注 scaffold/harness 的设计质量——它直接影响模型能力的真实体现。** mini-SWE-agent 的设计哲学表明，过于复杂的 scaffold 可能掩盖模型真实能力，而过于简单的 scaffold 可能无法充分发挥模型潜力。选择基准时需考虑该基准使用的框架是否适合自己的评估目标。

5. **ProgramBench 的出现预示着"纯程序合成能力"将成为下一个模型竞争焦点。** 3% 的几乎解决率说明当前模型在架构层面的能力远未成熟，随着模型厂商在架构设计能力上的投入加大，这一基准的分数变化将是重要的能力指标。

## 参见

## 任务设计：无源码、无反编译、无网络

ProgramBench 的任务设计极具挑战性：Agent 必须仅凭编译后的二进制文件和文档，从头实现目标程序。这意味着：

- **无源代码**：Agent 无法访问程序的原始实现
- **无反编译能力**：禁止使用反编译器获取中间表示
- **无网络访问**：Agent 不能在任务执行期间访问互联网资源

这种约束确保测试的是 Agent 的真实程序理解和合成能力，而非记忆或剽窃。

## 任务规模与覆盖范围

基准测试包含 **200 个编程任务**，涵盖从简单工具到复杂系统的广泛范围：

| 难度层级 | 代表性任务 | 特点 |
|---------|-----------|------|
| 基础工具 | jq | 命令行 JSON 处理器，逻辑相对简单 |
| 中间系统 | FFmpeg | 多媒体处理框架，功能丰富 |
| 复杂系统 | SQLite | 嵌入式数据库，API 庞大 |

任务设计确保覆盖多种编程范式、API 调用模式和系统交互场景。

## 评估体系：248K+ 行为测试

每个任务配备 **248,000+ 行为测试用例**，通过黑盒方式验证实现的功能正确性。测试覆盖：

- **功能等价性**：输出与原始程序行为一致
- **边界条件**：异常输入的处理
- **性能基准**：执行效率和资源使用
- **API 兼容性**：接口调用结果匹配

这种大规模行为测试确保评估的全面性和可靠性。

## 评估框架：mini-SWE-agent

ProgramBench 使用 [mini-SWE-agent](https://github.com/swe-agent/mini-swe-agent/) 作为标准评估框架。该框架被多个基准测试（SWE-bench Verified、SWE-bench Multilingual、Terminal-bench）广泛采用作为基线，且设计极简，最大程度减少模型能力与框架设计之间的混淆因素。

评估特点：

- **几乎无运行时限制**：除少数例外情况，模型是主动提交解决方案而非超过时间或步数限制，从未耗尽上下文窗口
- **成本上限**：由于不限制总成本，测试运行成本高达 $5,000（Sonnet 4.5）
- **单一天通用框架**：整个任务集使用单一通用评估框架，而非针对个别任务调优

## 当前最佳表现：Claude Opus 4.7 仅 3%

在 ProgramBench 上表现最佳的模型是 Claude Opus 4.7，但即使是这个顶级模型，也仅达到了 **3% almost-resolved**（几乎解决）的水平。

完整排行榜（前五）：

| 排名 | 模型 | Agent | Resolved | Almost Resolved |
|------|------|-------|----------|-----------------|
| 1 | Claude Opus 4.7 | mini-SWE-agent | 0% | 3.0% |
| 2 | Claude Opus 4.6 | mini-SWE-agent | 0% | 2.5% |
| 3 | Claude Sonnet 4.6 | mini-SWE-agent | 0% | 1.0% |
| 4 | GPT 5.4 | mini-SWE-agent | 0% | 0.0% |
| 5 | Gemini 3.1 Pro | mini-SWE-agent | 0% | 0.0% |

这一数据揭示了当前 LLM 在程序合成领域的根本性挑战：

1. **真正需要架构设计**：与其他全仓库生成项目不同，ProgramBench 不提供任何提示或结构，Agent 必须真正自己设计架构
2. **无 Harness 调优**：其他工作为少数任务进行了大量 harness 调优，ProgramBench 故意避免这种情况
3. **清洁室实现**：采取实质性预防措施防止作弊
4. **无反编译**：可执行文件只有执行权限，没有读取权限，任何非执行操作（如反编译器、objdump、strings、hexdump）都会失败

这一结果与  中关于 Agent 评估难度的讨论高度一致。

## 意义与影响

ProgramBench 的发布对 AI Agent 研究领域具有重要意义：

### 区别于传统基准

传统 LLM 基准如 HumanEval、MATH 等测试的是代码补全或数学推理，而 ProgramBench 聚焦于 **端到端程序合成**，这是 Agent 在实际软件工程任务中的核心能力。

### 推动 Agent 能力发展

低基准分数（3%）表明当前 Agent 在真实编程任务上仍有巨大提升空间。ProgramBench 为研究者提供了标准化的评估框架，有助于：

- 识别当前模型的薄弱环节
- 指导未来 Agent 架构改进
- 促进多 Agent 协作和工具使用研究

### 与 Harness Engineering 的关联

ProgramBench 评估的场景与 [Harness Engineering Framework](https://github.com/QianJinGuo/wiki/blob/main/concepts/harness-engineering-framework.md) 中描述的生产环境编程任务高度吻合。Agent 在这类任务中的局限性直接影响了  的可行性。

## 参见

- [刚刚Opus 47发布相比46核心变化与Claude Code搭配最佳实践 V2](https://github.com/QianJinGuo/wiki/blob/main/entities/刚刚opus-47发布相比46核心变化与claude-code搭配最佳实践-v2.md) — Claude Opus 4.7 发布详情
- [Agent Eval Wallezhang Yaml Driven Agent Evaluation Framework](https://github.com/QianJinGuo/wiki/blob/main/entities/agent-eval-wallezhang-yaml-driven-agent-evaluation-framework.md) — 另一种 Agent 评估框架
-  — Agent 评估基准框架综述
- [Autonomous Agent Systems](https://github.com/QianJinGuo/wiki/blob/main/concepts/autonomous-agent-systems.md) — 自主 Agent 系统概念
- [Coding Harness Engineering](https://github.com/QianJinGuo/wiki/blob/main/concepts/coding-harness-engineering.md) — 编码 Harness 工程概念

## 技术细节：反作弊与污染检测

### 清洁室实现

ProgramBench 采取实质性预防措施确保评估的公正性：

- **沙箱环境**：Agent 运行在沙箱容器中，无法访问互联网
- **执行权限限制**：可执行文件只有执行权限，没有读取权限
- **无反编译工具**：任何非执行操作（如运行反编译器、objdump、strings、hexdump）都会失败

早期试验中，在没有这些限制的情况下，模型找到了捷径，如从 GitHub 克隆源代码仓库或通过包管理器下载代码。

### 污染/记忆化检测

所有任务均来自开源仓库，评估的 LLM 肯定在训练时见过这些代码。但研究者并不担心这个问题：

- **零分现象**：即使记忆化在起作用（看起来并非如此），也远远不足以获得高分。分数似乎与实现功能的一致性努力更相关
- **不同语言消融**：在论文第 4.1 节中，引入了一种替代推理设置，强制模型用与原始程序不同的语言实现程序，有效绕过记忆化。分数没有发生剧烈变化

## 论文信息

- **标题**：ProgramBench: Can Language Models Rebuild Programs From Scratch?
- **作者**：John Yang, Kilian Lieret, Jeffrey Ma, Parth Thakkar, Dmitrii Pedchenko, Sten Sootla, Emily McMilin, Pengcheng Yin, Rui Hou, Gabriel Synnaeve, Diyi Yang, Ofir Press
- **机构**：Meta Superintelligence Labs • Stanford University • Harvard University
- **arXiv**：https://arxiv.org/abs/2605.03546

→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/programbench-agent-benchmark.md)

---

