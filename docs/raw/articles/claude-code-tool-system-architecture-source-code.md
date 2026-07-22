---
title: "万字长文拆解Agent 架构设计（二）：工具系统设计"
source_url: "https://mp.weixin.qq.com/s/iD73TPYxZj6s-Jpmpt0ulw"
source_site: "架构师带你玩转AI"
author: "AllenTang"
ingested: "2026-07-08"
sha256: "9ead27967daf3aee238ffdf85a25be63a41d6092549b60bc06c5129d483688cd"
type: raw
tags:
  - claude-code
  - tool-system
  - agent-architecture
  - permission-model
  - sub-agent
  - safety
  - source-code-analysis
---

> 如果记忆系统是 Agent 的"认知基础设施"，那工具系统就是 Agent 的"手脚"。
> 没有工具的 Agent 只能说话，有了工具的 Agent 才能做事——读文件、执行命令、调用 API、甚至派出子 Agent。

## Part 1：拆解 Claude Code 源码

### 1.1 工具的数据结构：AgentTool 接口

```typescript
type ToolPermission = 'auto' | 'confirm' | 'block';

interface AgentTool {
  name: string;
  description: string;
  inputSchema: JSONSchema;
  defaultPermission: ToolPermission; // 工具自带，不在外部配置表
  execute(input: TInput, context: ToolContext): Promise<TResult>;
  assessRisk?(input: TInput, context: ToolContext): Promise<boolean | null>;
}
```

关键设计：`defaultPermission` 是工具的属性，不是外部配置表。工具的风险画像和工具本身绑定。

### 1.2 三档权限分级：ToolPermissionManager

- **auto**：自动执行（只读/无副作用），如 `ReadFile`
- **confirm**：默认需要用户确认，如 `WriteFile`
- **block**：默认拦截，需明确授权，如 `Bash`

用户在会话中只能将权限调松（auto→confirm 不行，block→confirm 可以），不能调紧。

运行时风险评估 `assessRisk()` 可动态覆盖默认权限。例如 Bash 工具评估命令参数：`ls` 返回 `auto`，`rm -rf /` 返回 `block`。

### 1.3 子 Agent 作为普通工具

Claude Code 将子 Agent 也定义为普通工具 `AgentTool`，意味着：
- 子 Agent 有自己的 name/description/inputSchema，和 ReadFile 在同一个工具列表里
- 父 Agent 通过 tool_use 调用子 Agent，和调用其他工具没有区别
- 子 Agent 的 `execute()` 内部是另一个完整的 Agent 循环

设计价值：递归 Agent 没有增加额外的架构复杂度。

### 1.4 两阶段安全分类器

- **Phase 1（快速分类）**：轻量级规则匹配，拦截明显有害的命令
- **Phase 2（Classification）**：调用 LLM 分析意图。二分类输出 `SAFE`（自动执行）或 `UNSAFE`（阻断并生成拒绝理由）

## Part 2：动手实现 MiniAgentToolSystem

文章用 TypeScript 实现了精简版的工具系统，核心包括：
- `AgentTool` 接口实现
- `ToolPermissionManager` 权限决策
- `AgentRuntime` 工具执行引擎
- 子 Agent 递归调用

## 核心设计原则

1. **权限绑定工具而非用户/场景**：defaultPermission 是工具本身的属性
2. **运行时覆盖优于静态配置**：assessRisk() 在运行时根据实际输入调整权限
3. **子 Agent 即工具**：复用工具抽象，无需特化框架
4. **安全 vs 效率的工程平衡**：先快速分类器过滤，再用 LLM 深度分析
5. **默认安全**：block 级工具不会被绕过，只能由用户显式授权
