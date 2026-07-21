# A Missing Layer in Agentic Systems?

## Ch04.358 A Missing Layer in Agentic Systems?

> 📊 Level ⭐⭐ | 8.0KB | `entities/a-missing-layer-in-agentic-systems.md`

# A Missing Layer in Agentic Systems?

> 原文存档：[原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/a-missing-layer-in-agentic-systems.md)

## 摘要

CrewAI 创始人提出 Agentic 系统需要第三层——Human-in-the-Loop (HITL) 层。在确定性骨架（Flows）和智能推理（Agent/Crews）之外，HITL 不是对 Agent 能力不足的妥协，而是扩大可部署用例范围的关键架构。通过 90/10 法则（90% 自动化、10% 人类增强），系统能覆盖 99.9% 准确率要求、合规签批、人性化输出等用例——这些在纯自主架构下会永远卡在试点阶段。AB InBev 每年 2000 万工单的实践证明：30% 完全自主 + 70% 人机协作 = 2800 万美元单用例价值。

## 核心要点

### HITL 扩展而非限制部署面

核心论点反转了常规认知：

- 99.9% 准确率要求的用例？——HITL 使其可部署
- 需要合规签批的用例？——HITL 使其可部署
- 输出需要人性化触感的用例？——HITL 使其可部署
- 需要人类灵活进出环路的用例？——HITL 使其可部署

没有 HITL，这些场景会永远停留在试点阶段。HITL 不是对 AI 局限性的承认，而是对可部署范围的架构性扩展。

### 三层架构模型

1. **确定性骨干层（Flows）**：结构和控制——排序、错误处理、状态管理
2. **智能推理层（LLM/Agent/Crews）**：推理和适应——研究、创作、判断
3. **人类判断层（HITL）**：监督和问责——审查、签批、干预

### 两种 HITL 模式

- **Human-in-the-loop**：Agent 暂停，人类审查或编辑，工作流继续。精确干预，在特定检查点
- **Human-on-the-loop**：人类监控、调整参数、需要时干预。监督而不阻塞每一步

前者关乎**精确性**——某些步骤需要人类判断；后者关乎**信心**——有人在观察、可以介入。

### AB InBev 的规模化实践

- 全球每三瓶啤酒就有一瓶来自 AB InBev
- 年处理 2000 万工单，AI 年影响 300 亿美元决策
- 联系模型：30% 完全自主 + 70% 人机增强（Agent 与员工协作：路由请求、提取信息、草拟回复供人类审查）
- 单一用例目标价值：2800 万美元
- CTO David Almeida 的核心观点："AI 不会独立存在，AI 会存在于我们的技术平台中创造价值"

### CrewAI 的 HITL 实现

**开源层**——`@human_feedback` 装饰器：

```python
@human_feedback(
    message="Review this before sending:",
    emit=["approved", "rejected", "needs_revision"]
)
def review_content(self, content):
    return content
```

一行代码添加检查点：Flow 暂停→呈现输出→收集反馈→基于响应路由到不同路径。全状态持久化，跨异步人类交互，内建审计历史。

**企业层（AMP）**——生产级控制平面：
- Email-first 通知：任何人通过回复邮件即可响应
- 智能路由：按方法模式路由，或从 Flow 状态动态拉取负责人
- SLA 追踪：响应时间目标，瓶颈定位
- 自动响应回退：无人响应时的预配置行为
- Webhook：推送到 Slack、Jira、ServiceNow
- 完整审计轨迹：每个请求、响应、决策带时间戳

## 深度分析

### 90/10 法则的架构意义

90/10 不是固定比例，而是一种架构立场：系统必须同时支持自动化和人类增强，比例可调。这意味着 HITL 不是事后补加的审查按钮，而是从架构第一天就内建的能力——Flow 的暂停/恢复状态机、异步人类交互的状态持久化、路由决策的配置化。这比"先做自主、再加审查"的增量式方法有根本区别：后者通常导致审查机制与核心流程的阻抗不匹配。

### Human-in-the-loop vs Human-on-the-loop 的实用边界

两种模式的选择取决于错误成本和决策频率：
- **错误成本高 + 决策频率低** → Human-in-the-loop（每步审查）：合规签批、法律审查
- **错误成本中 + 决策频率高** → Human-on-the-loop（监控+抽样）：客服路由、内容审核
- **错误成本低 + 决策频率高** → 完全自主：数据提取、格式转换

实际部署往往是混合模式：简单决策自动处理，边缘情况触发 HITL，异常情况触发 HOTL 报警。

### 装饰器模式的工程效率

`@human_feedback` 一行代码就能将任意函数转化为人类审查检查点，这种极低集成成本是 HITL 被广泛采用的前提。如果添加人类审查需要重构流程编排、实现状态持久化、设计消息传递机制，大多数团队会选择跳过。装饰器模式将所有复杂性封装在框架层，开发者只需声明"这里需要人类审查"。

但这也意味着审查逻辑的定制化受限于装饰器参数——如果需要更复杂的审查流程（多级审批、条件性路由、并行审查），就需要深入框架内部。

### 监管驱动的采纳时间线

原文指出 HITL 采用加速不是偶然的：EU AI Act 正在执法、FDA 要求高风险 AI 的人类监督、SOC2 审计追问 AI 决策追踪。这使得 HITL 从"锦上添花"变成"合规必要"。对于全球运营的企业（如 AB InBev），在不同司法管辖区同时满足这些要求是实际操作约束，而非理论讨论。

### 从"移除人类"到"设计人类参与"的范式转移

原文最终论点：看待人类参与 AI 有两种方式——有人视为需最小化的限制，有人视为需设计的架构。后者才是生产级系统的正确立场。这不是技术保守主义，而是工程务实主义——在当前模型可靠性水平下，精心设计的人类参与比追求完全自主能覆盖更多真实用例、创造更多商业价值。

## 实践启示

1. **HITL 作为架构第一公民**：不是在自主系统上补加审查层，而是在系统设计之初就将人类检查点作为一等概念——状态机需支持暂停/恢复，路由逻辑需支持人类决策分支
2. **90/10 比例可调，架构不可调**：具体比例随用例变化，但系统必须从第一天就支持 HITL——事后补加的成本远高于初始内建
3. **降低 HITL 集成门槛**：像 `@human_feedback` 装饰器这样的一行集成方式，是 HITL 被广泛采用的关键——集成复杂度与采纳率成反比
4. **区分 HITL 和 HOTL**：前者是精确干预（特定检查点），后者是全局监控（随时可介入）——不同场景需要不同模式，系统应同时支持
5. **监管合规是 HITL 的硬性驱动**：EU AI Act、FDA、SOC2 的要求使 HITL 从可选项变为必选项——设计系统时预留审计轨迹和人类决策记录

## 相关实体

- [Lessons From 2 Billion Agentic Workflows](ch04/421-lessons-from-2-billion-agentic-workflows.html) — 20 亿次工作流的三核心模式
- [Agentcore Harness](ch04/656-agentcore-harness.html) — AgentCore 工程化
- [Hands Free First Notice Of Loss Using Strands Agents And Ama](ch04/369-hands-free-first-notice-of-loss-using-strands-agents-and-am.html) — 保险 FNOL 中的人类角色重置
- [Build An Ai Powered Equipment Repair Assistant Using Amazon ](ch04/228-build-an-ai-powered-equipment-repair-assistant-using-amazon.html) — AgentCore 维修助手的记忆层设计
- [Production Agent Engineering](https://github.com/QianJinGuo/wiki/blob/main/concepts/production-agent-engineering.md) — 生产级 Agent 工程
- [Agent Deployment Strategy](https://github.com/QianJinGuo/wiki/blob/main/concepts/agent-deployment-strategy.md) — Agent 部署策略
- [Ai Safety Governance](https://github.com/QianJinGuo/wiki/blob/main/concepts/ai-safety-governance.md) — AI 安全治理
- [Autonomous Agent Systems](https://github.com/QianJinGuo/wiki/blob/main/concepts/autonomous-agent-systems.md) — 自主 Agent 系统
- [Agent Framework Comparison](https://github.com/QianJinGuo/wiki/blob/main/concepts/agent-framework-comparison.md) — Agent 框架对比
- [Multi Agent Orchestration](https://github.com/QianJinGuo/wiki/blob/main/concepts/multi-agent-orchestration.md) — 多 Agent 编排

---

