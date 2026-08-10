# LangChain Deep Agents v0.7: 精简 Agent Harness

## Ch04.261 LangChain Deep Agents v0.7: 精简 Agent Harness

> 📊 Level ⭐⭐ | 11.6KB | `entities/langchain-deep-agents-v0-7-2026-07-29.md`

# LangChain Deep Agents v0.7: 精简 Agent Harness

## 摘要

LangChain 于 2026 年 7 月发布 Deep Agents v0.7，对 agent harness 进行了根本性的精简。核心成果是 base input tokens 减少 65%（约 6k → 约 2k），同时在三类基准评估（自主任务、对话、长上下文）× 四款模型的矩阵中保持同等性能。该版本受 Anthropic 最新 context engineering 指南启发，移除了隐藏的 base system prompt、将内置 tool descriptions 裁剪 43%，并使 `TodoListMiddleware` 变为 opt-in。此外，v0.7 大幅增强了 middleware 的可配置性，允许开发者全面覆盖默认的 middleware 栈和 prompt。

## 核心要点

| 改进领域 | 具体变化 | 影响 |
|---------|---------|------|
| **Base harness 精简** | 移除 base system prompt，裁剪 tool descriptions 43%，TodoListMiddleware opt-in | base input tokens 从 ~6k 降至 ~2k（-65%） |
| **性能持平** | 在 Autonomous / Conversational / Long-context 三类任务上验证 | 整体 reward 持平；gpt-5.6-luna 的 tokens -34%、cost -15%、reward +4% |
| **Context Engineering** | 遵循 Interfaces beat examples 和 Avoid repetition 原则 | 更少的 prompt 膨胀，模型更专注于 tool schema |
| **Middleware 可配置性** | 支持通过 `.name` 匹配覆盖默认 middleware；SummarizationMiddleware 可自定义触发阈值和提示词 | 解决 top community ask，告别 hacky 变通方案 |
| **Filesystem 优化** | write_file 覆盖而非报错；read_file 分页返回行数/offset；grep/glob 返回截断标记 | 大项目下的稳定性和可用性提升 |
| **Breaking changes** | 移除 BackendFactory；添加 delete tool 至默认 filesystem | 需注意迁移 |

## 深度分析

### Context Engineering 哲学转向

v0.7 的发布标志着 LangChain 在 harness 设计理念上的重要转折。其核心洞见来自 Anthropic 更新的 context engineering 指南——该指南报告 Claude Code 的系统提示在 Opus 5 和 Fable 5 上被削减了 80%+ 而编码评测未出现可测量的下降。[Context Engineering](https://github.com/QianJinGuo/wiki/blob/main/concepts/context-engineering.md) 从"加更多指令让模型表现更好"转向"移除模型已经不需要的指令"。

v0.7 遵循两条关键原则：

1. **Interfaces beat examples**：精心设计的 tool schema 比曾经流行的 few-shot examples 更能教会模型使用工具。Few-shot examples 可能窄化模型探索空间，而工具接口的形式化描述（参数、类型、约束）对现代模型而言是更高效的引导信号。这与 [Tool Use Patterns](https://github.com/QianJinGuo/wiki/blob/main/concepts/tool-use-patterns-ai-agents.md) 领域的近期研究一致。

2. **Avoid repetition**：在 system prompt 和 tool description 中重复同一指令不会提供有意义的强化。现代模型的指令遵循能力已经足够强，冗余提示只会浪费 token 预算和引入噪音。

### 三项具体改动及其效果

v0.7 围绕"削减不必要的 base input token"这一假设进行了三项改动：

**移除 base system prompt.** Deep Agents 此前在底层注入了一段包含通用指南和工具使用说明的 system prompt，v0.7 将其完全移除。这使得自定义 prompt 不再与之叠加或冲突，用户的 prompt 控制力得到根本性提升。

**裁剪 tool descriptions 43%.** 内置工具的描述文本被大幅精简，去除了冗余和示例性文字，仅保留模型调用所需的最小语义信息。

**TodoListMiddleware opt-in.** `create_deep_agent` 不再默认包含 `TodoListMiddleware`。评测显示，规划提示和 `write_todos` 工具在多模型、多类别的测试中并未显著提升性能——甚至在小部分场景中略有负面影响。

这三项改动叠加后，默认 agent 单次调用的 base input tokens 从约 6,000 降至约 2,000。

### 评估方法与结果

LangChain 使用了一套新的评估套件来验证改动没有导致性能回退。评估覆盖三类 agent 任务：

- **Autonomous（自主任务）**：端到端的编码和数据分析任务
- **Conversational（对话）**：与模拟用户的多轮对话
- **Long-context（长上下文）**：需要检索和大篇幅推理的任务

评估矩阵为 3（任务类别）× 4（模型）：`gpt-5.6-luna`、`gemini-3.6-flash`、`claude-sonnet-4-6`、`claude-opus-4-8`。

结果概览：

| 模型 | Token 变化 | Cost 变化 | Reward 变化 |
|------|-----------|-----------|------------|
| **gpt-5.6-luna** | **-34%** | **-15%** | **+4%** |
| claude-opus-4-8 | 统计显著下降 | 统计不显著 | 持平 |
| gemini-3.6-flash | 下降 | 下降 | 持平 |
| claude-sonnet-4-6 | — | 明显上升（两个困难自主任务导致） | 持平 |

> 注：所有模型的 reward 置信区间跨越零值，即无统计显著的 reward 变化。Luna 和 Opus 的 token 降低具有统计显著性，Luna 的 cost 降低也具有统计显著性。

### TodoListMiddleware 的适用场景

虽然 TodoListMiddleware 默认被移除，官方文档指出它仍然在某些场景中值得主动启用：

1. **长多步任务**：agent 需要在多轮调用间维持显式规划，避免跑偏
2. **能力较弱的模型**：这类模型需要更多脚手架来避免遗漏步骤或丢失上下文线索
3. **面向 UI 的场景**：用户可见的规划和进度展示本身也是产品体验的一部分

启用方式仅为一行：`middleware=[TodoListMiddleware()]`。

### Middleware 可配置性的意义

Middleware 栈的覆盖能力是过去六个月中 Deep Agents 社区的**第一需求**（参见 GitHub issue #3783）。此前开发者无法合法地更改默认 middleware 行为——需要 hacky 的变通方案来移除或修改某些中间件。

v0.7 通过两方面的设计解决了这一问题：

**Prompt 全面控制。** 移除隐藏 prompting 后，自定义 prompt 不再与系统级 prompt 叠加造成膨胀或冲突。用户注入的指令获得最大效力。

**Middleware 覆盖机制。** 现在可以通过传递一个 `.name` 属性匹配默认 middleware 名称的实例来就地替换它，而非因重名报错。例如自定义 `SummarizationMiddleware`：

```python
from deepagents import create_deep_agent
from deepagents.middleware import SummarizationMiddleware

agent = create_deep_agent(
    model="anthropic:claude-sonnet-5",
    middleware=[
        SummarizationMiddleware(
            model="fireworks:accounts/fireworks/models/kimi-k3",
            trigger=("fraction", 0.5),          # 50% context window 触发而非默认的 85%
            summary_prompt="Summarize the conversation so far, keeping any file paths and decisions verbatim...",
        ),
    ],
)
```

这种模式适用于任何内置 middleware 的定制化，包括 prompt-caching TTLs 等参数。

### Filesystem 的实用性改进

Filesystem 作为 [Agent Loop](https://github.com/QianJinGuo/wiki/blob/main/concepts/agent-loop-design.md) 中 agent 读写和导航状态的上下文管理层，v0.7 做出了一系列基于 eval 和 `dcode` 实际使用轨迹的优化：

- **write_file 覆盖而非报错**（PR #4109）：更贴近真实开发体验
- **分页 read_file**（PR #4540）：返回总行数、剩余行数及下一个 offset，支持精确分页
- **grep/glob 截断保护**（PR #4063 / #4570 / #4706）：在大型目录树上返回部分结果并附加 `truncated` 标记，而非挂起；grep 增加 1,000 行匹配上限、流式输出和上下文行支持

这些改进特别适合 [Agent Observability](https://github.com/QianJinGuo/wiki/blob/main/concepts/agent-observability.md) 和 [Long-running Agent](https://github.com/QianJinGuo/wiki/blob/main/concepts/long-running-agent-architecture.md) 场景，在这些场景中 filesystem 操作可能影响 agent 的稳定性。

## 实践启示

1. **打磨 tool schema 而非写更多 prompt。** v0.7 的核心教训是：花精力设计精确、自描述的 tool schema（参数、约束、边界条件），其 ROI 高于在 system prompt 中写指令。工具接口本身就是最好的 instruction。

2. **定期审计 prompt 冗余。** 随着模型能力提升，曾经必要的提示指导可能已经过时。维护一个"prompt 审计"周期，移除不再需要的指令和重复内容。

3. **为不同模型准备不同的 harness 配置。** v0.7 的评估显示不同模型对 harness 的响应显著不同（如 claude-sonnet-4-6 与 gpt-5.6-luna 的成本行为相反）。建议按模型家族维护独立的 harness 配置文件和 middleware 栈。

4. **TodoList 按需启用。** 默认关闭 TodoListMiddleware 是正确选择，但不要完全遗忘它——对长流程、弱模型、UI 场景，显式规划仍然是重要工具。

5. **利用 middleware 覆盖实现渐进式定制。** 从默认栈开始，通过 `.name` 匹配逐渐替换需要定制的中间件，而非 fork 整个 harness。这样既能跟上官方更新，又能获得定制灵活性。

6. **filesystem 操作的容错优先。** 对于 agent 在大型代码库或文件树中的操作，启用截断保护和分页读取，避免 agent 因单次 filesystem 调用异常而崩溃。

## 相关实体

- [Deep Agents Bedrock 集成](ch04/605-agent-orchestration.html) — Deep Agents 在 AWS Bedrock 上的部署和 subagent 编排
- [Agent Harness Engineering 范式](https://github.com/QianJinGuo/wiki/blob/main/concepts/agent-harness-engineering-paradigm.md) — Harness 设计的理论框架，v0.7 的实践补充
- [AHE — Agentic Harness Engineering](https://github.com/QianJinGuo/wiki/blob/main/concepts/ahe-agentic-harness-engineering.md) — Agentic Harness Engineering 方法论的完整阐述
- [Context Engineering](https://github.com/QianJinGuo/wiki/blob/main/concepts/context-engineering.md) — Anthropic 引领的 context engineering 理念，v0.7 的直接理论来源
- [Codex Context Engineering](../ch01/734-codex.html) — Codex 在 context engineering 上的不同实践路径
- [Context Engineering 三种记忆范式](https://github.com/QianJinGuo/wiki/blob/main/entities/context-engineering-three-memory-paradigms.md) — 从记忆范式角度理解 context 管理
- [Agent Orchestration Patterns](https://github.com/QianJinGuo/wiki/blob/main/concepts/agent-orchestration-patterns.md) — 上层编排模式与底层 harness 优化的互补关系
- [Tool Use Patterns](https://github.com/QianJinGuo/wiki/blob/main/concepts/tool-use-patterns-ai-agents.md) — 工具使用模式，v0.7 中 Interfaces beat examples 的底层理论基础
- [Agent 评估基准](https://github.com/QianJinGuo/wiki/blob/main/concepts/agent-evaluation-benchmarks.md) — Deep Agents v0.7 使用的评估方法论
- [Agent Observability](https://github.com/QianJinGuo/wiki/blob/main/concepts/agent-observability.md) — 调节 middleware 和 filesystem 后的可观测性需求
- [Agent Loop Design](https://github.com/QianJinGuo/wiki/blob/main/concepts/agent-loop-design.md) — 更精简的 harness 如何影响 agent 主循环设计

→ [原文存档](https://github.com/QianJinGuo/wiki-book/tree/main/docs/raw/articles/langchain-deep-agents-v0-7-2026-07-29.md)

---

