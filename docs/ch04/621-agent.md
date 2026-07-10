# 万字长文拆解 Agent 架构设计（二）：工具系统设计

## Ch04.621 万字长文拆解 Agent 架构设计（二）：工具系统设计

> 📊 Level ⭐⭐ | 3.0KB | `entities/claude-code-tool-system-architecture-deep-dive.md`

# Claude Code 工具系统架构深度拆解

> Claude Code 的工具系统不是简单的"函数注册表 + 调用分发器"，而是包含权限分级、运行时风险评估、子 Agent 递归和两阶段安全分类器的完整架构。

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/claude-code-tool-system-architecture-source-code.md)

## 核心组件

### AgentTool 接口

每个工具的基础契约，核心字段：

- **name/description**：注入系统提示，让模型知道何时调用
- **inputSchema**：JSON Schema，模型按此格式输出参数
- **defaultPermission**：权限等级（auto/confirm/block），工具自带属性
- **execute()**：执行逻辑
- **assessRisk()**：可选，运行前快速风险评估

### 三档权限分级

| 等级 | 说明 | 示例 |
|------|------|------|
| **auto** | 自动执行（只读/无副作用） | ReadFile |
| **confirm** | 默认需用户确认 | WriteFile |
| **block** | 默认拦截，需明确授权 | Bash |

运行时风险评估 `assessRisk()` 可动态覆盖默认权限。例如 Bash 对 `ls` 返回 auto，对 `rm -rf /` 返回 block。

### 子 Agent 作为普通工具

Claude Code 将子 Agent 定义为标准 `AgentTool`：

- 和 ReadFile 在同一个工具列表里，父 Agent 通过 tool_use 调用
- 子 Agent 的 `execute()` 内部是一个完整的 Agent 循环
- 递归 Agent 没有增加额外的架构复杂度

### 两阶段安全分类器

1. **Phase 1（快速分类）**：轻量级规则匹配，拦截明显有害命令
2. **Phase 2（LLM 分类）**：调用 LLM 分析意图，输出 SAFE/UNSAFE

## 设计原则

1. **权限绑定工具而非用户/场景**：defaultPermission 是工具本身属性
2. **运行时覆盖优于静态配置**：assessRisk() 根据实际输入动态调整
3. **子 Agent 即工具**：复用工具抽象，无需特化框架
4. **安全 vs 效率的工程平衡**：先快速分类器过滤，再用 LLM 深度分析
5. **默认安全**：block 级工具不会被绕过

## 关联

- [AI Agent 工具数量陷阱](ch04/030-ai-agent.html) — 5 个边界清楚的工具胜过 20 个模糊工具，与 Claude Code 工具设计互补
- [Agent Harness 架构设计与实现](../ch05/039-agent-harness.html) — 生产级 Agent 系统设计参考

---

