---
title: "Dynamic Subagents：用代码编排 Subagent，替代逐轮工具调用"
source_url: "https://mp.weixin.qq.com/s/aiJs5CC8Gb6qa_xDRNEjTA"
author: "AGI Hunt"
created: 2026-07-02
updated: 2026-07-02
type: raw
tags: [dynamic-subagents, subagent, orchestration, deep-agents, langchain, code-interpreter, agent-patterns]
ingested: 2026-07-02
sha256: 956eda9e7f3f0a293c89de5fa99b6d6c275533e5f8207d0517e37f8453a6c523
---

# Dynamic Subagents：用代码编排 Subagent，替代逐轮工具调用

LangChain 团队最新开源的 Dynamic Subagents：Agent 不再通过逐轮工具调用下发子任务，而是写一个脚本来编排 subagent 的执行——用 Agent 擅长写的代码（循环、分支、并发）来驱动协调逻辑。

与 Claude Code Workflows + Recursive Language Models 同源：模型写代码，代码调度更多 Agent。

## 核心优势

1. **确定性覆盖**：调度循环不会"看情况"跳过项目——循环就是循环，分支就是分支
2. **可靠复杂编排**：扇出与合成、多阶段流程、条件分支，固化到确定性代码中
3. **上下文隔离**：subagent 结果不在主 Agent 上下文窗口中，降低上下文腐化

## 工作原理

Agent 被赋予一个 Eval Tool，编写 JavaScript 在 QuickJS 解释器中安全执行。解释器暴露内置 `task()` 全局函数：

```javascript
const result = await task({
  description: "Review src/auth/login.ts for security issues.",
  subagentType: "reviewer",
  responseSchema: {
    type: "object",
    properties: {
      severity: { type: "string", enum: ["high", "medium", "low"] },
      issues: { type: "array", items: { type: "string" } },
    },
  },
});
const critical = result.severity === "high" ? result.issues : [];
```

## 六种编排模式

| 模式 | 描述 | 适用场景 |
|------|------|----------|
| **Classify and Act** | 输入分类后路由到专门 subagent | 混合输入（bug/feature/question） |
| **Fanout and Synthesize** | 同类型工作并行分发，合并结果 | 批量文档分析、跨目录代码审查 |
| **Adversarial Verification** | 第一遍产生发现，第二遍独立验证 | 安全审计、合规检查（低误报率） |
| **Generate and Filter** | 多 subagent 独立生成，评分筛选 | 架构方案、设计决策 |
| **Tournament** | 头对头淘汰，逐轮晋级 | 主观标准下的优化、样式选择 |
| **Loop Until Done** | 发现循环直到没有新结果 | 穷举搜索、死代码检测 |

## 快速开始

```python
pip install -U "deepagents[quickjs]"
from deepagents import create_deep_agent
from langchain_quickjs import CodeInterpreterMiddleware

agent = create_deep_agent(
    model="openai:gpt-5.5",
    middleware=[CodeInterpreterMiddleware()],
)
```

触发 Dynamic Subagents：向 Agent 发送包含 "workflow" 关键词的提示即可。

最快试用方式：dcode（LangChain 基于 Deep Agent 的终端编码 Agent）。

## 结语

Dynamic Subagents 代表了一个重要的方向转变：从"让模型直接调用子 Agent"转向"让模型写代码来调用子 Agent"。前者把编排负担压在模型推理上，后者把编排固化到确定性代码中。

六种编排模式并非新发明——它们是对 fork-join、pipeline、divide and conquer 等经典并行模式的 Agent 时代映射。真正的贡献在于让 Agent 能根据任务类型在运行时自主选择合适的模式。
