# 为什么 Agent 时代大家都在做 CLI——CLI/MCP/SKILL 三层模型与 AI 友好设计

## Ch04.584 为什么 Agent 时代大家都在做 CLI——CLI/MCP/SKILL 三层模型与 AI 友好设计

> 📊 Level ⭐⭐ | 3.4KB | `entities/why-cli-agent-era-alibaba-tech.md`

# 为什么 Agent 时代大家都在做 CLI——CLI/MCP/SKILL 三层模型与 AI 友好设计

> **来源**：阿里技术（郭小成）。从历史演进和结构性优势分析 CLI 在 Agent 时代复兴的根本原因，提出 CLI/MCP/SKILL 三层分层模型和 AI 友好设计四原则。
> → [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/why-cli-agent-era-alibaba-tech-郭小成.md)

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

## 与已有 wiki 实体关系

- 补充 [Cli Mcp Skill Architecture Decision Vibecoder](ch04/267-skill.html)：该实体聚焦架构选型决策矩阵，本文聚焦历史演进分析、结构性优势论证和产品设计原则。
- 关联 [如何为 Agent 设计产品](../ch03/045-agent.html)、[Agent Era Architect Skills Guide](../ch03/069-skills.html)

---

