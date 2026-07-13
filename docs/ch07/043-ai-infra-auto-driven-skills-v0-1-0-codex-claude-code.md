# AI-Infra-Auto-Driven-SKILLS v0.1.0：给 Codex / Claude Code 的推理框架工作流

## Ch07.043 AI-Infra-Auto-Driven-SKILLS v0.1.0：给 Codex / Claude Code 的推理框架工作流

> 📊 Level ⭐⭐ | 9.0KB | `entities/ai-infra-auto-driven-skills-v0-bbuf-giantpanda.md`

> -> [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/ai-infra-auto-driven-skills-v0-bbuf-giantpanda.md)

# AI-Infra-Auto-Driven-SKILLS：推理框架工作流编码

## 一句话

BBuf 在 GiantPandaLLM 发文介绍 AI-Infra-Auto-Driven-SKILLS v0.1.0——将推理框架开发的 benchmark/profile/debug 流程整理成 SKILL.md，供 Codex / Claude Code 按步骤执行，遵循工程纪律。

## 核心价值

**问题**：性能优化不适合直接从现象进入源码修改，链条中任何一步缺失，后续结论都不可靠。

**解决**：将 benchmark→profile→源码修改→复测的完整流程编码为 Agent 可执行的 skill，保留人工检查入口。

## 10 个 Core Skills

| Skill | 解决的问题 |
|-------|------------|
| llm-serving-auto-benchmark | 公平的 serving benchmark 搜索 |
| llm-torch-profiler-analysis | torch profiler trace 分析，prefill/decode 分开 |
| llm-pipeline-analysis | kernel timeline 下钻 |
| model-compute-simulation | FLOPs/MFU 估算 |
| sglang/vllm-sota-humanize-loop | 固定 workload 下追 SOTA 性能 |
| sglang-prod-incident-triage | 线上 incident 先提取 replay 再 debug |
| model-pr-optimization-history | 本地知识记录，复用历史 PR 思路 |

## 深度分析

### 1. 工程纪律转化为可执行工作流

BBuf 设计的 AI-Infra-Auto-Driven-SKILLS 核心洞察是：**推理框架性能优化是一个多阶段链条，而非单次修改**。传统的优化方式往往是从现象直接进入源码修改——工程师看到某个指标不达预期，就直接改 kernel 或改配置，但这种做法忽略了一个根本问题：链条中任何一步缺失，后续结论都不可靠。

这个框架将 benchmark→profile→源码修改→复测的完整流程拆解为独立可执行的 skill，每个 skill 都带有明确的输入输出约束和人工检查入口。这种设计使得 Agent 在执行过程中能够：
- 维持跨轮状态，而不是每次都从空白开始
- 记录中间证据，确保结论可复现
- 在关键节点等待人工判断，避免盲目修改

### 2. SOTA Humanize Loop 的设计逻辑

SOTA Humanize Loop 是这个框架中最核心的skill，其设计逻辑体现了"先追踪再超越"的策略：
1. **输入模型和硬件预算** — 明确约束条件
2. **搜索 benchmark 找到可复现的 competitor** — 确保基线可信
3. **Profile 定位瓶颈** — 用数据而非直觉定位问题
4. **小范围源码修改** — 避免大范围改动的不可控风险
5. **回到同一 workload 复测** — 保证对比的公平性
6. **提 PR（如需）** — 沉淀到社区

这个 loop 的关键约束包括：开始前查询相关 open PR、workspace 必须干净、benchmark/profile 前记录 GPU 状态、资源不足时等待或停止、只清理当前模型 cache 等。这些约束保证了优化过程的可控性和可复现性。

### 3. skill 工件的具体结构

每个 skill 都是一个独立的工作单元，以 llm-serving-auto-benchmark 为例，它解决的是"如何对 SGLang、vLLM、TensorRT-LLM 或其他 OpenAI-compatible server 做公平的 serving benchmark 搜索"这个问题。类似的，llm-torch-profiler-analysis 负责读 torch profiler trace 并输出 kernel、overlap、fuse opportunity 三张表，且 prefill/decode 分开分析。

这种结构使得：
- Agent 可以独立调用某个 skill 完成特定子任务
- 人工可以在任意节点介入检查
- 不同项目之间可以复用和迁移 skill 集合

### 4. 与传统 Agent 工作流的区别

传统的 Agent 工作流往往是"全链路自主决策"——给 Agent 一个目标，它自行决定执行步骤。这种方式在简单任务中表现良好，但在复杂工程任务中容易出现"幻觉式优化"：Agent 跳过必要的 benchmark 和 profile 步骤，直接基于不完整的数据做出错误的修改决策。

AI-Infra-Auto-Driven-SKILLS 的设计明确将**工程纪律编码为工作流约束**，而不是依赖 Agent 的自主判断。这代表了 AI Infra 领域 Agent 应用的一个重要趋势：从"让 Agent 自己想办法"转向"让 Agent 在约束框架内执行最佳实践"。

## 实践启示

### 对 AI Infra 开发者的启示

1. **建立标准化工作流**：在开始任何性能优化之前，先建立 benchmark → profile → 修改 → 复测的标准化流程，并将其固化为可执行的脚本或 skill。

2. **保留人工检查入口**：不要让 Agent 完全自主决策。在关键节点（如 benchmark 确认、profile 结果解读、源码修改范围界定）设置人工检查环节。

3. **积累本地知识库**：model-pr-optimization-history 的设计表明，历史 PR 的优化思路是宝贵的知识资产。建立一个本地知识记录系统，可以在面对新问题时快速定位可复用的思路。

### 对 Agent 开发者的启示

1. **约束优于自由**：在复杂工程任务中，明确的工作流约束往往比 Agent 的自主探索更有效。设计 Agent 系统时，应该考虑如何将领域最佳实践编码为工作流约束。

2. **状态维持机制**：跨轮状态维持是 Agent 执行长链路任务的关键。需要设计专门的状态管理机制，确保每轮执行都能继承上一轮的中间结果。

3. **公平对比的重要性**：sglang-sota-humanize-loop 和 vllm-sota-humanize-loop 的设计强调了"公平对比"的原则——只有保证基线和测试条件的一致性，优化结果才有说服力。

### 对框架开发团队的启示

1. **skill 工件化**：将框架使用经验固化为 skill 工件，使得团队成员和 Agent 都可以复用这些经验，降低框架的学习门槛。

2. **可复现性优先**：在追求 SOTA 性能之前，先确保工作流程的可复现性。一个可复现的次优解比一个不可复现的"最优解"更有价值。

## 关联阅读

## 一句话

AI Infra 工程纪律正在变成可执行的 skill artifact——推理框架优化流程的最佳实践被编码为 Agent 工作流。
## 相关实体
- [Skill Issues Compromising Claude Code With Malicious Skills Agents Part 1](../ch01/816-skill-issues-compromising-claude-code-with-malicious-skills.html)
- [Claude Code Skills Mcp Rules Source Analysis](ch07/006-claude-code-skills-mcp-rules.html)
- [Skill System Design Three Way Comparison](../ch04/266-skill.html)
- [Openclaw Agent Loop Design Patterns](../ch01/1132-openclaw-agent.html)
- [Claude Code Vs Codex Context Architecture 02](../ch03/075-claude-code.html)

- [Claude Code Hiring Engineers](https://github.com/QianJinGuo/wiki/blob/main/concepts/claude-code-hiring-engineers.md)- [tliveomni vllm 适配与量化方案](../ch01/896-vllm.html)
- [claude code 从 demo 到产线 · 企业 harness 工程化的 8 道关卡（黄佳/咖哥 csdn）](../ch03/075-claude-code.html)
- [MOC](https://github.com/QianJinGuo/wiki/blob/main/moc/workflow-orchestration.md)

---

