---
title: "Claude Code 动态工作流源码解析：pi-dynamic-workflows 架构实现"
description: "基于 GitHub 开源项目 pi-dynamic-workflows 的源码分析：沙箱确定性、结果回收路径、三个编排原语、预算/中止安全网、实时进度快照机制"
source_url: "https://mp.weixin.qq.com/s/-fgHupVwuT3c4eJMrd43Xw"
author: "AI技术立文"
platform: wechat
published: "2026-05-30"
ingested: "2026-05-30"
sha256: "e26801024723ec11aa768070d5e3b382bc77b2b182cfacd62cd1d0445b267042"
type: article
tags:
  - agent
  - claude-code
  - dynamic-workflow
  - orchestration
source: [[entities/claude-code-dynamic-workflows-multi-agent-orchestration]]
---

# Claude Code 动态工作流源码解析：pi-dynamic-workflows 架构实现

AI技术立文 | 2026-05-30

> [!NOTE]
> 本文为 `claude-code-dynamic-workflows-multi-agent-orchestration` 的 raw supplement，补充源码级实现细节。

## 源码架构总览

pi-dynamic-workflows（https://github.com/Michaelliv/pi-dynamic-workflows）受 Claude Code 动态工作流启发，为 Pi-mono 实现了相同核心机制。六个文件，每个设计决策都值得细看。

## 沙箱与执行确定性

**vm 沙箱白名单注入对象**：JSON、Math、Array、Object、String、Number、Boolean、Set、Map、Promise、console（重定向到 log()）。除此之外什么都没有。

**禁止内容**：
- `Date.now()`、`new Date()` — 时间依赖
- `Math.random()` — 随机性
- `require`、`import`、`fs`、网络 API — 外部 I/O
- meta 对象展开运算符、计算属性、函数调用

**AST 解析验证**：acorn 逐节点验证 meta 对象每个属性都是字面量。`__proto__` 原型链污染入口直接封死。

```javascript
const DETERMINISM_BLOCKLIST =
  /\bDate\s*\.\s*now\b|\bMath\s*\.\s*random\b|\bnew\s+Date\s*\(\s*\)/;
```

目的：同一个脚本跑十次，编排逻辑完全一致。非确定性只存在于子 Agent 的 LLM 调用（被隔离在沙箱外）。

## 结果回收的两条路径

### 路径一：纯文本

子 Agent 进行多轮工具调用（读文件、跑命令、查代码），从消息列表倒序找到最后一条 assistant 消息，提取文本返回。结果提取只看最终回复。

### 路径二：结构化输出（capture 闭包机制）

传入 JSON Schema，子 Agent 调用 `structured_output` 工具返回结果。关键设计：`terminate: true` — 子 Agent 调用瞬间立即结束，不产生额外 assistant turn。

```javascript
const finding = await agent('Find security-sensitive files.', {
  label: 'security scan',
  schema: {
    type: 'object',
    properties: {
      paths: { type: 'array', items: { type: 'string' } },
      severity: { type: 'string' },
    },
    required: ['paths', 'severity'],
  },
})
// finding 是校验后的 JSON 对象，不是字符串
```

**capture 实现**：`{ called: false, value: undefined }` 作为普通对象闭包注入到 `structured_output` 工具的 `execute()` 函数。工具被调用时，Pi 框架先用 Schema 校验参数，校验通过后写入 capture 并返回 `terminate: true`，子 Agent 会话立即结束。主流程检查 `capture.called`，子 Agent 跑完却没调用工具则直接抛异常。

没有消息队列，没有事件总线，没有 pub/sub。就是一个共享引用加一个终止信号。

## 优雅降级

```javascript
catch (error) {
  if (options.signal?.aborted) throw error; // abort 直接上抛
  log(`agent ${label} failed: ${error.message}`);
  return null; // 优雅降级
}
```

非 abort 类失败返回 null，记录日志，不影响其他分支。`parallel()` 和 `pipeline()` 同样策略。工作流脚本需要处理 null：

```javascript
const results = await parallel([...])
const validResults = results.filter(r => r !== null)
```

## 三个编排原语

整个框架只提供三个核心编排原语：

1. **`agent(prompt)`** — 启动子 Agent，等待结果
2. **`parallel([() => agent(...), ...])`** — 并发启动多个，全部完成后返回数组
3. **`pipeline(items, stage1, stage2, ...)`** — 每个 item 独立通过多个 stage，item 之间并发，stage 之间串行

没有 DAG 调度器，没有条件路由，没有状态机。JavaScript 的 `if/else` 和 `for` 足以表达。工作流脚本本身是图灵完备的程序，不需要再发明 DSL。

**并发控制**：基于 Promise 的简易限流器，默认并发数 `CPU 核心数 - 2`，上限 16：

```javascript
const concurrency = Math.max(
  1,
  Math.min(options.concurrency ??
    Math.max(1, (globalThis.navigator?.hardwareConcurrency ?? 8) - 2), 16),
);
```

## 预算和中止作为安全网

### 第一道：token budget

每个子 Agent 返回结果后，用 `JSON.stringify(result).length / 4` 粗估 token 消耗并累加。超出预算直接抛异常，后续 `agent()` 调用不再执行：

```javascript
if (budget.total !== null && budget.remaining() <= 0)
  throw new Error("workflow token budget exhausted");
```

工作流脚本可主动查询预算余量调整策略：

```javascript
if (budget.remaining() < 1000) {
  log('Budget low, skipping deep analysis')
}
```

### 第二道：AbortSignal

用户按 Esc 或调用方主动取消时，`signal.aborted` 变为 true。每个 `agent()`、`parallel()`、`pipeline()` 调用前都会检查。正在运行的子 Agent 通过 `session.abort()` 立即中止，状态标记为 skipped。abort 不走优雅降级，直接上抛，整个工作流终止。

## 实时进度快照机制

每个子 Agent 的启动和结束触发回调（onAgentStart/onAgentEnd），连同 onPhase 和 onLog，持续更新 WorkflowSnapshot 对象。快照包含当前阶段、每个子 Agent 状态（queued/running/done/error/skipped）、已完成数、错误数、日志。

**前端渲染格式**：

```
◆ Workflow: multi_review (4/4 done)
  ✓ Review 3/3
    #1 ✓ security
    #2 ✓ perf
    #3 ✓ readability
  ✓ Synthesize 1/1
    #4 ✓ synthesis
```

`phase()` 纯粹是给进度展示分组，不影响执行逻辑。

## Map-Verify-Reduce 设计意图

官方文档点出的更深层设计意图：让多个独立的 Agent 互相交叉验证对方的发现，只有经过验证的结论才进入最终报告。

Claude Code 内置的 `/deep-research` 命令是这个模式的标杆实现：多角度搜索，获取并交叉验证源信息，对每个论断进行投票，最终返回带引用的报告，没通过交叉验证的论断被过滤掉。

更准确地说，这是 **Map-Verify-Reduce**。编排脚本天然支持"先独立产出、再交叉审查"模式，因为每个阶段的结果都是脚本变量，可以任意组合传递。

## 可保存、可恢复、可复用

**可恢复**：中途停掉运行，可在同一会话恢复——已完成 Agent 返回缓存结果，只有未完成部分重新执行。

**可保存为命令**：`/workflows` 选择完成的工作流，按 `s` 保存为 `/<name>` 命令。支持两种保存位置：
- `.claude/workflows/` — 项目级，团队共享
- `~/.claude/workflows/` — 用户级，跨项目生效

**/effort ultracode 模式**：Claude 对每个实质性任务自动规划工作流，不需要手动触发。一个请求可能产生一连串工作流。

→ [[entities/claude-code-dynamic-workflows-multi-agent-orchestration|源 entity]]
