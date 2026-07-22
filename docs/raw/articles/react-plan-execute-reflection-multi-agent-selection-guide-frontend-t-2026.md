---
title: "ReAct、Plan-and-Execute、Reflection、Multi-Agent 模式选型指南：5 步决策树 + AgentScope 完整 Demo"
source: "tabzhan / 前端T站"
source_url: "https://mp.weixin.qq.com/s/XeNEa0sZkUTBMhM0wzCy3A"
ingested: 2026-06-16
sha256: "3099054c6f52cd192e2bc7770d3a449bcd2f58fbbd7fb790537a5d629576ade7"
type: raw
tags: [react, plan-and-execute, reflection, multi-agent, agentscope, agent-patterns, agent-architecture, decision-tree, 5-step-selection, dashscope, qwen, dialog-agent, self-critique, ai-generated, frontend-t, 2026]
review_value: 8
review_confidence: 7
---

# ReAct、Plan-and-Execute、Reflection、Multi-Agent 模式选型指南

**作者**：tabzhan / 前端T站 | **发布时间**：2026-06-07 21:19

> **作者提示**："内容由AI生成" + 决策树参考其他博主分享。

## 写在前面

这四种 Agent 架构/模式**并非互斥**，而是解决不同复杂度、不同约束条件任务的"设计范式"。实际系统中常组合使用。

## 模式对比

### 1. ReAct (Reasoning + Acting)
**循环**：思考 (Thought) → 行动 (Action) → 观察 (Observation)
**特点**：边推理边调用工具，根据实时反馈决定下一步
**适合**：需要动态调用外部工具/API、环境反馈高度不确定、步骤依赖实时结果的任务

### 2. Plan-and-Execute (规划-执行)
**机制**：先由 Planner 生成完整或部分计划 (DAG/步骤列表)，再由 Executor 按序执行
**支持**：执行中动态重规划 (Replanning)
**适合**：流程明确、步骤依赖强、可提前拆解的中长程任务

### 3. Reflection (反思/自评估)
**机制**：完成单步或整体任务后，Agent 对自身输出进行批判性评估 (Self-Critique)，识别错误/不足并迭代优化
**配套**：常配合 Verifier/Critic 模块
**适合**：对质量/准确性要求极高、可容忍多次迭代与延迟的任务

### 4. Multi-Agent (多智能体协作)
**机制**：多个具备不同角色/技能的 Agent 通过通信协议协作，可呈层级、对等或流水线架构
**支持**：任务分解、并行处理与交叉验证
**适合**：跨领域、高复杂度、需模拟人类团队分工的大型项目或系统级任务

## 框架实现：AgentScope 3 个完整 Demo

### Demo 1: ReAct — 天气查询

```python
import agentscope
from agentscope.agents import ReActAgent
from agentscope.models import DashScopeChatModel
from agentscope.tool import Toolkit, ToolResponse
from agentscope.message import Msg

agentscope.init(project="react_demo")

model = DashScopeChatModel(
    model_name="qwen-max",
    api_key="your_api_key",
    generate_kwargs={"temperature": 0.0}
)

toolkit = Toolkit()

@toolkit.register_tool_function
def get_weather(city: str) -> ToolResponse:
    return ToolResponse(content=[{"type": "text", "text": f"{city} 天气：晴，25°C"}])

agent = ReActAgent(
    name="WeatherAssistant",
    sys_prompt="你是一个助手，使用工具回答天气问题。",
    model=model,
    toolkit=toolkit,
    max_iters=5  # ReAct 最大循环次数
)

user_msg = Msg("user", "杭州天气如何？", role="user")
response = agent(user_msg)
```

### Demo 2: Plan-and-Execute — 查询+建议

```python
# Planner 输出 JSON 数组计划
planner_sys = """你是一个规划器。将任务拆解为JSON数组格式：
[{"step":1, "tool":"工具名", "input":"参数"}]
仅返回 JSON，不要解释。"""

planner = DialogAgent(name="Planner", sys_prompt=planner_sys, 
                      model_config={"model_name": "qwen-max", "api_key": "your_key"})
executor = DialogAgent(name="Executor", sys_prompt=executor_sys, toolkit=toolkit,
                       model_config={"model_name": "qwen-max", "api_key": "your_key"})

# Plan-and-Execute 编排
plan_msg = planner(user_msg)
plan_json = json.loads(plan_msg.content.strip("`json\n"))
for step in plan_json:
    step_msg = Msg("planner", f"执行步骤: 调用 {step['tool']}, 参数: {step['input']}", role="user")
    response = executor(step_msg)
```

### Demo 3: Reflection — 产品文案迭代

```python
# Generator Agent
gen_sys = "你是产品文案专家。根据任务撰写<100字描述，吸收反馈后优化。仅输出正文。"

# Critic Agent
crit_sys = """你是严格主编。评估标准：1.提及容量/材质/智能功能/目标人群 2.<100字 3.专业有吸引力。
返回JSON: {"score": 0-10, "issues": [], "suggestions": "...", "passed": true/false}"""

def run_reflection(task: str, max_iters: int = 3):
    for i in range(max_iters):
        # 1. 生成/优化
        draft_msg = generator(draft_msg)
        # 2. 评估
        crit_msg = critic(Msg("user", f"评估文案: {draft_msg.content}\n历史意见: {feedback}"))
        # 3. 解析反馈
        c = json.loads(crit_msg.content)
        if c['passed']:
            break
        feedback = c['suggestions']
        draft_msg = Msg("user", f"任务: {task}\n历史草稿: {draft_msg.content}\n意见: {feedback}\n请优化。")
```

## 架构选型：5 步决策树

```
1 任务步骤是否可提前明确？
   ├─ 是 → 走 Plan-and-Execute (流程固定、易审计)
   └─ 否 → 进入 2

2 下一步是否高度依赖实时环境反馈？
   ├─ 是 → 走 ReAct (边做边看、动态探索)
   └─ 否 → 进入 3

3 对输出准确性/合规性要求是否极高？(容错率 <5%)
   ├─ 是 → 引入 Reflection (生成→评估→迭代)
   └─ 否 → 单代理+简单Prompt即可

4 任务是否跨多个专业领域？或需并行处理/角色分工？
   ├─ 是 → 升级为 Multi-Agent (角色化协作)
   └─ 否 → 保持单代理架构

5 资源约束是否严格？(延迟<3s / Token预算有限 / 无专职AI运维)
   ├─ 是 → 降级：ReAct 或 轻量 Plan，关闭 Reflection/多角色
   └─ 否 → 按上述匹配执行
```

### 决策树关键阈值

| 阈值 | 触发模式 | 含义 |
|------|---------|------|
| 步骤可提前明确 | Plan-and-Execute | 流程固定易审计 |
| 下一步依赖实时反馈 | ReAct | 边做边看 |
| 容错率 <5% | Reflection | 高质量需求 |
| 跨多领域 | Multi-Agent | 角色化分工 |
| 延迟 <3s / Token 受限 | 降级 | 资源约束 |

## 4 模式互补关系

| 模式 | 与其他组合 | 组合场景 |
|------|----------|---------|
| ReAct | + Multi-Agent | 主 Agent 用 ReAct 决策，子 Agent 专业化执行 |
| Plan-and-Execute | + Reflection | Plan 后每步 Reflection 评估，Replanning 触发条件 |
| Reflection | + ReAct | ReAct 每步后接 Reflection，避免错误累积 |
| Multi-Agent | + Plan-and-Execute | Planner 协调者 + Executor 角色群 |

## 关联引用

→ [[entities/design-patterns-for-ai-agents-2026|Design Patterns for AI Agents 2026]] — 第 1 来源（综合设计模式概览）
→ [[entities/twelve-agent-design-patterns-yunduojun-datastudio|12 Agent 设计模式底层逻辑 (云朵君)]] — Claude Code 12 模式
→ [[entities/four-sub-agent-patterns-2026|4 种 Sub Agent 模式]] — 主 Agent 调度子 Agent
→ [[entities/agent-orchestration|Agent orchestration]] — 编排总论
→ [[raw/articles/design-patterns-for-ai-agents-2026|原文存档 1 (综合设计模式)]]
→ [[raw/articles/react-plan-execute-reflection-multi-agent-selection-guide-frontend-t-2026|原文存档（本篇）]]
