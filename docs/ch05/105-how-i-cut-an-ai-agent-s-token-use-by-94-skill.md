# How I Cut an AI Agent's Token Use by 94% — 将 Skill 从自然语言编译为确定性代码

## Ch05.105 How I Cut an AI Agent's Token Use by 94% — 将 Skill 从自然语言编译为确定性代码

> 📊 Level ⭐⭐ | 2.6KB | `entities/vivekhaldar-compiling-agent-skill-token-cut-94pct-2026.md`

# How I Cut an AI Agent's Token Use by 94% — 将 Skill 从自然语言编译为确定性代码

Vivek Haldar 展示了一个具体的工作流案例：将 Agent Skill 从**纯自然语言指令**（natlang code）**编译**为**确定性 Python 程序 + LLM 仅做核心决策**的混合架构，获得了 **94% token 减少** 和 **87% 延迟降低**，同时输出质量基本不变。

## 核心洞察：Crystallized Workflow

当 Skill 执行多次后，大部分行为不再需要 LLM 推理——路径已经固化（crystallized）。文章中的 LinkedIn 回帖 Skill 总是查找相同来源、构建相同内容清单、应用相同过滤条件。**只有两个步骤真的需要 LLM：候选选择和草稿撰写。** 其余都是普通确定性代码。

## 编译过程

原始 Skill 是自然语言编写的 Agent Skill（类似 `hermes-agent` 的 SKILL.md），描述来源、最近历史检查、选择标准和草稿格式。每次运行，agent（Codex）需解读指令、制定计划、调用工具、跟踪状态。

编译后的 Skill 变成"薄引导程序"（thin bootloader），调用一个 Python 程序。该程序：
1. 获取已知来源
2. 构建内容清单
3. 检查近期发帖记录
4. 应用过滤器
5. 管理工作流状态
6. 仅在选择和生成时调用 LLM

Token 节省来源：**移除完成确定性工作的模型调用**，而非换用小模型。

## 关键数据

| 指标 | 改进 |
|------|------|
| Token 使用 | 减少 **94%** |
| 延迟 | 降低 **87%** |
| 输出质量 | 基本不变 |

## 与现有实体的关系

- 与 [Agent Harness Engineering Survey](ch05/052-harness-engineering.html) 中"Harness 的演进——从自然语言到确定性结构"的趋势一致
- "Natlang code" 概念与 Agent Skill 从自然语言到确定性代码的编译过程一致——当行为固化后，不再需要每次从头推理
- 对 Token 优化的实践贡献者 [Context Engineering](https://github.com/QianJinGuo/wiki/blob/main/concepts/context-engineering.md) 提供了具体的落地案例

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/vivekhaldar-compiling-ai-agent-skill-token-cut-94pct-2026.md)

---

