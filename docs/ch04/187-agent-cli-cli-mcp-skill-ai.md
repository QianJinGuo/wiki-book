# 为什么 Agent 时代大家都在做 CLI——CLI/MCP/SKILL 三层模型与 AI 友好设计

> 📊 Level ⭐⭐⭐ | 8.3KB | `entities/why-cli-agent-era-alibaba-tech.md`

# 为什么 Agent 时代大家都在做 CLI——CLI/MCP/SKILL 三层模型与 AI 友好设计

> **来源**：阿里技术（郭小成）。从历史演进和结构性优势分析 CLI 在 Agent 时代复兴的根本原因，提出 CLI/MCP/SKILL 三层分层模型和 AI 友好设计四原则。
> → [原文存档](https://mp.weixin.qq.com/s/46wmaOdXD8gWQzD0BXII1A)

## 核心框架：CLI / MCP / SKILL 三层模型

三个工具不是竞争关系，是能力栈的不同层级：

```
SKILL = 菜谱   ─── 完整编排逻辑，组合多个 CLI + MCP
MCP   = 预制菜 ─── 常用操作封装，标准化 schema
CLI   = 食材   ─── 最灵活的原子操作，无状态可序列化
```

Agent 需要在三层之间自由切换——CLI 是创新的试验场，MCP 是标准化的沉淀池，SKILL 是最佳实践的固化层。CLI 的繁荣不会让 MCP 衰落，反之 CLI 积累的操作经验会沉淀为 MCP 工具和 SKILL 工作流。

## Agent + CLI 五大结构性优势

1. **天然同构**：LLM 和终端都是 text-in/text-out，让 AI 操作 GUI 需要截图→视觉识别→模拟点击，一行命令拆成四步
2. **自描述性**（最被低估的优势）：`--help` 就是文档，工具即说明书。API 需要额外注入文档
3. **Unix 管道与组合**：管道组合实现即兴编排，MCP 适合标准操作但缺乏这种灵活性
4. **并行原生**：CLI 命令无状态可序列化，一个字符串就是一个完整指令。批量生成→并行分发→独立重试
5. **上下文干净**：MCP 工具清单常驻上下文窗口，CLI 无此开销

## AI 友好产品设计四原则

1. **可调用**：能力不锁在 GUI。每个操作应有 CLI/API/MCP 接口（前门给人，后门给 Agent）
2. **可理解**：`--help` 即文档，参数语义化，错误信息能指导下一步
3. **可组合**：标准接口，原子操作可自由串联
4. **可恢复**：幂等操作，状态追溯，失败可回退

## 人机协作可观测性

- **计划可观测性**：Agent 先出方案让人审（plan 模式），逐行审批 → 审批方案
- **过程可观测性**：工具调用、读文件、改代码实时展示，人可随时叫停

核心命题：花 10% 注意力获得 90% 掌控感，协作边界动态可调。

## Agent First 设计范式（类比 Mobile First）

- 能力暴露：每个产品应有"人操作"和"Agent 调用"两个版本
- 数据流动：重构为"展示给人看 + 喂给 Agent 用"
- 协作边界：动态可调而非代码写死

## 历史视角

CLI（1970s） → GUI（1990s） → Agentic CLI（2025s）。当软件操作者从人扩展到 Agent，CLI 不再只是工程师的老工具，而是 Agent 调用数字世界的高效入口。

## 深度分析

### CLI 在 Agent 时代复兴的结构性原因

CLI 在 2020 年代 Agent 时代的"第三次复兴"（1970s CLI → 1990s GUI → 2025s Agentic CLI）不是技术怀旧，而是由 AI 系统的基本能力需求驱动的结构性回归。LLM 的本质是 text-in/text-out 的序列生成器，CLI 是 text-in/text-out 的计算机接口——它们在 I/O 模式上天然同构。让一个 text-native 系统去操作 GUI 需要经历"截图→视觉识别→坐标映射→模拟点击"的四步翻译，每一步都在信息损失和错误累积。而 CLI 只需一步：生成命令字符串。

### 自描述性作为 Agent 系统的核心设计原则

"CLI 的 --help 就是文档"这句话背后是一个被低估的工程原则：**工具即说明书**。传统 API 需要撰写、维护、同步开发者文档，且文档与实现之间的偏差是永恒的 bug 源。CLI 的自描述性将"了解工具能力"的成本从"翻阅文档"降为"敲一条命令"，这对 AI Agent 尤其重要——Agent 无法像人类一样直觉判断某个命令行参数的含义是否存在歧义。自描述性是 Agent-First 设计中"可理解"原则的最佳实践。

### CLI/MCP/SKILL 三层模型的能力栈逻辑

"CLI = 食材，MCP = 预制菜，SKILL = 菜谱"这个比喻精确地刻画了三者的关系：它们是能力栈的不同层级，而非竞争或替代关系。CLI 层提供最大的灵活性（即兴编排、管道组合），MCP 层提供标准化（结构化 schema、参数校验），SKILL 层提供最佳实践固化（完整编排流程）。Agent 系统不应在这三层中"选一"，而应设计为"根据场景在三层之间自由切换"——高频标准化操作走 MCP，深度定制任务走 CLI 组合，完整工作流走 SKILL。

### Unix 管道的即兴编排 vs. MCP 的标准封装的权衡

Unix 管道组合（如 `calendar agenda --next-week | grep "张三"`）的核心优势是**即兴编排**——无需预先定义组合规则，只需输出格式兼容即可串联。这在探索性任务中至关重要：Agent 可以在执行过程中动态构建新的处理流水线。但这也意味着上层系统需要理解每个 CLI 的输出格式，缺乏 MCP 的标准化 schema。对于团队而言，正确的策略是：用 CLI 做快速实验和探索，将验证过的 CLI 组合沉淀为 MCP 工具。

### "10% 注意力获得 90% 掌控感"的可观测性设计

人机协作的可观测性设计中，核心矛盾是"控制的粒度 vs. 认知的负担"——要求 Agent 的每一步都向人类报告，会导致人类注意力疲劳，最终"不再看"而丧失监督意义。好的协作界面不是让人类检查每一条命令，而是让人类在"完全不看"（全自动）和"逐行审批"（手动）之间有一个滑动窗口——Agent 先出方案（plan 模式），人类审批方案而非逐行审批，执行过程中实时展示关键状态变更。这篇框架将"协作边界"从代码写死的二元选择变成了动态可调的光谱。

## 实践启示

1. **Agent 操作接口优先选择 CLI 而非 GUI**：在构建 Agent 可调用的系统时，CLI 在开发成本、解析开销、并行能力、上下文开销等维度全面优于 GUI 操作。如果产品只有 GUI，优先提供 CLI 版本作为 Agent 的"后门"。

2. **建立 CLI→MCP→SKILL 的渐进沉淀机制**：建议团队建立"CLI 快速实验 → 验证后封装为 MCP 工具 → 复杂流程固化为 SKILL/Skill 工作流"的管道。每个阶段都要有明确的"晋级标准"（如：CLI 命令被 3 个以上的 Agent 任务自动调用时，应封装为 MCP 工具）。

3. **--help 即文档的工程指标**：每条 CLI 命令的 --help 输出应经过 Agent 友好的评审，确保 Agent 可以从中理解参数语义、输入格式、输出格式、错误处理方式。可以考虑设计"Agent-tested"标签，确保每条命令至少被一条自动化测试以 Agent 方式调用过。

4. **并行原生的工程约束**：CLI 命令的"无状态可序列化"特性是 Agent 并行调用的基础。在设计 CLI 系统时，应确保每条命令可以在不依赖前序上下文的情况下独立执行（幂等性、原子性），从而支持 Agent 的批量生成和并行分发。

5. **可恢复性要求幂等设计**：AI 友好设计四原则中"可恢复"是最容易被忽视的。在 Agent 执行失败后需要重试时，每个操作的幂等性决定了重试的安全边界。在 CLI 设计中，创建类操作应支持 `--dry-run` 预览模式，修改类操作应支持 `--undo` 或操作的原子性回滚。

## 与已有 wiki 实体关系

- 补充 [Cli Mcp Skill Architecture Decision Vibecoder](https://github.com/QianJinGuo/wiki-public/blob/main/entities/cli-mcp-skill-architecture-decision-vibecoder.md)：该实体聚焦架构选型决策矩阵，本文聚焦历史演进分析、结构性优势论证和产品设计原则。
- 关联 [如何为 Agent 设计产品](https://github.com/QianJinGuo/wiki-public/blob/main/entities/如何为-agent-设计产品.md)、[Agent Era Architect Skills Guide](https://github.com/QianJinGuo/wiki-public/blob/main/entities/agent-era-architect-skills-guide.md)

---

