---
source_url: "https://mp.weixin.qq.com/s/CFTp_TVA8DQLFuvirkrFvQ"
title: "万字长文拆解Agent架构设计（四）：多Agent协作"
author: "AllenTang / 架构师带你玩AI"
ingested: 2026-07-22
sha256: "c9f8e7d6a5b4c3d2e1f0a9b8c7d6e5f4a3b2c1d0e9f8a7b6c5d4e3f2a1b0c"
source_platform: weixin
tags: [claude-code, multi-agent, context-isolation, orchestrator, subagent, task-tool, source-code]
---

# 万字长文拆解 Agent 架构设计（四）：多 Agent 协作

> 作者：AllenTang / 架构师带你玩AI
> 日期：2026-07-22

本系列目标：拆解 Claude Code 源码，理解 Agent 底层架构的设计思路。核心方法：读源码 → 理解设计决策 → 用 TypeScript 手写核心逻辑。第四篇聚焦多 Agent 协作。

## 引言

前三篇拆完了单个 Agent：记忆、工具、循环。任务超出一个上下文能装的范围时，直觉是多派几个 Agent 分工。但子 Agent 背后是同一个模型，它甚至不知道主 Agent 之前聊过什么——多派一个，凭什么让系统变强？

**Claude Code 的回答：多 Agent 协作切分的不是能力，而是上下文。**

## Part 1：拆解 Claude Code 源码

### 1.1 角色划分：编排者 / 子 Agent

Claude Code 里的两种角色（简化自源码）：

```
interface OrchestratorConfig {
  allowedTools: ['task', 'read_file', 'list_dir'];  // 只读 + 派发
  maxSubagents: number;
  subagentBudget: TokenBudget;
}

interface SubagentConfig {
  allowedTools: ['bash', 'write_file', 'read_file']; // 执行、写文件
  canSpawnSubagents: boolean;  // 默认 false
  inheritedContext: string;
}
```

**关键设计**：编排者和执行者的工具集互补，不重叠。编排者有 task 工具但通常没有副作用工具（write_file、bash）；执行者有这些工具但默认没有 task 工具（不能再派子 Agent）。

这个划分防住了两个问题：一是编排者绕过规划直接乱改文件；二是执行者未经授权自行派出新 Agent，让调度树无限膨胀。

### 1.2 派发就是一次工具调用：Task 工具

派子 Agent 的入口是 task 工具。形态上和普通工具一样，但语义特殊：输入是一段任务描述，输出是子 Agent 的最后一条消息。

```
const TaskTool: AgentTool = {
  name: 'task',
  description: '派发一个子 Agent 执行独立任务...',
  parameters: {
    subagent_type: { type: 'string' },
    prompt: { type: 'string' },  // 任务描述：唯一的输入
  },
  async execute(toolCallId, { subagent_type, prompt }, signal) {
    const def = loadAgentDefinition(subagent_type);
    const finalMessage = await runSubagent(def, prompt, signal);
    return { content: finalMessage };
  },
};
```

子 Agent 的"角色设定"是一个 markdown 文件，放在 `.claude/agents/` 目录下：

```markdown
<!-- .claude/agents/code-reviewer.md -->
---
name: code-reviewer
description: 审查代码改动，找 bug、安全问题和风格问题
tools: [read_file, bash, grep]
---
你是一个严格的代码审查员。读入改动，逐条审查。
只报你有把握的问题，每个问题附上具体文件和行号。
```

三个字段读者各不相同：`description` 给主 Agent 的模型看（决定派给谁），`tools` 给权限系统看（工具白名单），正文给子 Agent 自己看（system prompt）。

### 1.3 上下文隔离：新桌子，只交结论

子 Agent 启动时拿到的上下文是全新的：独立的 system prompt、独立的工具定义，对话历史从一条消息开始——就是父 Agent 写的任务描述。父 Agent 之前聊过什么一概看不到。

任务完成后，进入父 Agent 上下文的只有**子 Agent 的最后一条消息**。子 Agent 跑了多少轮、调了什么工具、走了什么弯路，父 Agent 一概不知道。

```
主 Agent 的上下文：用户请求 + 各子 Agent 交回的一页页结论
├── 子 Agent 1 的上下文（全新）：文件 1–10 → 一条结论消息
├── 子 Agent 2 的上下文（全新）：文件 11–20 → 一条结论消息
└── 子 Agent 3 的上下文（全新）：文件 21–30 → 一条结论消息
```

**"新桌子"隐喻**：把上下文窗口想象成 Agent 的桌子。子 Agent 做的，就是把一摞资料挪到自己桌上看完，最后只交回一页结论。父 Agent 的桌上多了一页纸，少了一万页资料。

这就是核心答案：**多 Agent 协作的本质不是能力分工，而是上下文切分。子 Agent 不比主 Agent 多懂什么，它强的地方只是"桌子干净"。**

## Part 2：手写核心逻辑（TypeScript）

### 项目结构

```
multi-agent/
├── src/
│   ├── types.ts        # 子 Agent 定义与返回结构
│   ├── agent-def.ts    # markdown + frontmatter 定义解析
│   ├── spawn.ts        # 派发核心：上下文隔离 + 权限交集 + 只交回最后一条消息
│   └── task-tool.ts    # Task 工具封装
├── package.json
└── tsconfig.json
```

### 派发核心：spawn.ts

三处注释对应三个设计决策：

```
async function spawnSubagent(parent, def, taskPrompt, signal) {
  // 1. 权限交集：定义声明 ∩ 父 Agent 拥有，默认去掉 task 工具
  const allowedTools = deriveSubagentPermissions(parent.tools, def.tools);
  
  // 2. 全新上下文：不需要"把父 Agent 历史传下去"的代码
  const loop = new AgentLoop(
    new ContextAssembler(def.systemPrompt, subagentTools, new MemoryStore()),
    new PermissionManager(subagentTools),
    parent.llm,
    allocateSubagentBudget(parent.budget),
  );
  
  // 3. 返回值 = 最后一条消息
  const finalMessage = await loop.run(taskPrompt, crypto.randomUUID(), signal);
  return { status: 'success', output: finalMessage };
}
```

### 并行调度

并行的核心没有一行新代码：模型在一轮里发出多个 task 调用，第三篇的循环本来就并发执行。哪些并行、哪些串行，是模型的判断——**没有写调度器，模型就是调度器**。

### 设计要点

1. **权限交集**：子 Agent 的工具 = 定义声明 ∩ 父 Agent 拥有的工具，并默认去掉 task 工具
2. **预算只减不增**：子 Agent 分到的 token 预算从父 Agent 的剩余预算中切分
3. **Agent Loop 复用**：子 Agent 跑的是标准 Agent Loop，没有任何特殊执行路径
4. **description 即接口**：子 Agent 定义的 description 是给主 Agent 模型做路由决策的唯一依据
