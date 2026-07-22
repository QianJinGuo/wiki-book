---
title: sub-agent-vs-agent-team-selection-guide
source_url: https://mp.weixin.qq.com/s/LNkT_xRhdh2iCxBQcVKpUQ
publish_date: 2026-04-30
tags: [wechat, article, claude, agent]
review_value: 7
review_confidence: 7
review_recommendation: neutral
sha256: 2d1639ca499c0e018d081dde825c38050965927ad7331bc99ea595dbefb0bcfd
---
## 核心判断准则
> 多智能体架构里，最先该判断的不是"要拆几个"，而是这些子任务之间是否共享同一段上下文。能干净切开的用 Sub-Agent，必须共享状态的才上 Agent Team。
## Sub-Agent vs Agent Team 本质区别
| 维度 | Sub-Agent | Agent Team |
|------|-----------|------------|
| 上下文 | 各有独立上下文 | 共享上下文 |
| 通信 | 必须经过父 Agent | Agent 之间直接对话 |
| 新 Agent | 不能再生新 Agent | 可以互相拉起 |
| 返回内容 | 只返回结论，不带中间思考 | 持续共享状态变化 |
| 适用场景 | 隔离 + 压缩 + 并行 | 持续协作 + 共享状态 + 互相调头 |
## 最大的坑：按"岗位"拆而不是按"上下文边界"拆
常见错误：Planner → Developer → Tester → Reviewer，按人类公司分工切。
问题：每次交接信息都在变薄——Planner 知道"代码刚被重构过某个奇怪判断是有原因的"，这条没传到 Developer；Developer 做了临时取舍（"这次先不改 token 校验顺序因为影响下游 SSO"），也没沉淀下来。
**Design around context boundaries, not roles.** 不要按角色设计，要按上下文边界设计。
工程三问：
1. 这两件事，需不需要看到对方的中间过程？
2. 这两件事，会不会因为对方做完了某一步就影响自己下一步？
3. 交给同一个 Agent 一次性干，会不会更省心？
如果答案偏向"是"，那就别拆。
## Sub-Agent 硬约束
- 子 Agent 之间不能直接通信
- 子 Agent 不能再生新 Agent
- 所有流量必须经过父 Agent
- 只返回最终输出，不带中间思考
**三个价值：隔离 / 压缩 / 并行**
代码示例（claude_agent_sdk）：
```python
from claude_agent_sdk import query, ClaudeAgentOptions, AgentDefinition
async def main():
    async for message in query(
        prompt="Review the authentication module for issues",
        options=ClaudeAgentOptions(
            allowed_tools=["Read", "Grep", "Glob", "Agent"],
            agents={
                "security-reviewer": AgentDefinition(
                    description="Find vulnerabilities and security risks",
                    prompt="You are a security expert.",
                    tools=["Read", "Grep", "Glob"],
                    model="sonnet",
                ),
                "performance-optimizer": AgentDefinition(
                    description="Identify performance bottlenecks",
                    prompt="You are a performance engineer.",
                    tools=["Read", "Grep", "Glob"],
                    model="sonnet",
                ),
            },
        ),
    ):
        print(message)
```
**description 字段是路由信号**，不是注释。写得含糊，路由就含糊；边界清楚，分发也清楚。
## Agent Team 适用场景
适合"做着做着会发现问题，然后需要互相调头"的任务。
典型例子：软件项目——前端改了接口契约后端要立刻知道；测试发现用例挂了开发要能即时拿到失败上下文；需求理解错了整个链路要回退。
**成本远高于 Sub-Agent：**
- 需要共享状态层（能处理冲突、版本化）
- 需要节点间通信协议
- 需要 Lead Agent 仲裁分歧、推动进度
- 调试链路长，问题可能在节点协作而非单个节点
**口诀：任务不互相依赖，就别上 team；任务必须互相依赖，就别用 sub。**
## 五种编排原语
生产里真正在用的就这几个：
| 原语 | 说明 | 典型场景 |
|------|------|---------|
| **Prompt Chaining** | A 做完给 B，B 做完给 C | 先抽取 → 再翻译 → 再润色 |
| **Routing** | 根据任务特征派给最合适的 Agent | 客服"识别意图再分流" |
| **Parallelization** | 互不依赖任务并行跑再汇总 | 代码审查多维度分析 |
| **Orchestrator–Worker** | orchestrator 拆/派/收，workers 各自干 | Sub-Agent 标准形态 |
| **Evaluator–Optimizer** | 先生成，再评估，再迭代 | 报告生成、代码补全自检 |
> 多 Agent 不是产品形态，是一组可组合的工作流原语。一旦当产品形态理解，就容易陷入攀比；当成工具箱理解，问题才回到"拼什么原语最合适"。
## 判断框架表
| 你在问的问题 | 该考虑的方向 |
|-------------|-------------|
| 能不能一个 Agent 干完？ | 能就先这样，别提前优化 |
| 子任务需不需要看到彼此中间过程？ | 不需要 → Sub-Agent；需要 → Agent Team |
| 子任务跑的时候要不要互相影响？ | 不要 → 并行 Sub-Agent；要 → Team |
| 是不是只想"看起来更高级"？ | 是 → 退回单 Agent，先把任务模型搞清楚 |
| 每步要不要严格按业务规则走？ | 要 → 加确定性中间层，不要硬塞给 team |
## 隐藏成本
多 Agent 带来的不只是性能收益：
- 编排逻辑要写/维护/监控
- Agent 之间契约要定义/版本化
- 调试链路长
- 上下文多 Agent 间一致流转（信息差导致动作错）
- 治理成本（审计/回滚/计费）翻倍
**当任务高度依赖、协调成本远大于收益，或上下文压根没法切干净时，单 Agent 反而最稳。**
## 核心立场
> 围绕上下文边界设计，而不是围绕角色设计；从简单结构开始，只在确定需要时再加复杂度。
架构没有银弹。没有最好的架构，只有最适合当前任务的架构。