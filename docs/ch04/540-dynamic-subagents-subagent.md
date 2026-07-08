# Dynamic Subagents: 代码驱动的 Subagent 编排

## Ch04.540 Dynamic Subagents: 代码驱动的 Subagent 编排

> 📊 Level ⭐⭐ | 4.0KB | `entities/dynamic-subagents-code-driven-orchestration.md`

# Dynamic Subagents: 代码驱动的 Subagent 编排

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

### 六种模式的工程本质

六种模式不是新发明——它们是对经典并行处理模式（fork-join、pipeline、divide and conquer）的 Agent 时代重新包装。真正的贡献是让 Agent 能根据任务类型在运行时自主选择合适的模式，而非人为预设。

## 实践启示

1. **数百级 subagent 场景**：逐工具调用 300 次不可行，脚本循环几百次 subagent 本质无开销差异
2. **结构化输出集成**：`responseSchema` 让 subagent 结果可直接在编排代码中过滤、排序、聚合
3. **已有类似方案**：OpenAI Codex CLI 的 `delegate_task` 也是类似思路——将调度逻辑转化为代码
4. **模式选择即能力**：Agent 能根据任务自主选择并行/串行/对抗等模式，比固定模板更灵活

## 相关实体

- [Anthropic Dynamic Workflows](../ch01/863-anthropic.html)
- [Generator-Evaluator 对抗验证](../ch01/863-anthropic.html)
- [Claude Code Subagent 规则](../ch09/155-claude-code-1.html)

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/dynamic-subagents-code-driven-orchestration-langchain-2026.md)

---

