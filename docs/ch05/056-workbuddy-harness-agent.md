# WorkBuddy 产品实践：从模型到 Harness 的 Agent 可用产品架构

## Ch05.056 WorkBuddy 产品实践：从模型到 Harness 的 Agent 可用产品架构

> 📊 Level ⭐⭐ | 7.5KB | `entities/workbuddy-product-framework-agent-harness-anne-2026.md`

# WorkBuddy 产品实践：从模型到 Harness 的 Agent 可用产品架构

> 模型能力只是起点。Agent 能否稳定完成任务取决于工具接入、上下文组织、权限边界、结果验证、反馈纠正和跨会话延续。

## 核心抽象

WorkBuddy 策略产品经理 Anne 提出产品视角的模型调用抽象：

```
输出 = 模型(系统提示词 + 工具 + 会话历史 + 其他上下文 + 用户指令)
```

两条核心约束：
1. **模型是无状态的** — 产品侧维护状态再注入
2. **模型知识截止到训练日期** — 实时信息需工具查询

## 四层能力体系

| 概念 | 核心问题 | 消费者 |
|------|---------|--------|
| **Tool Call (Function Call)** | 模型怎么请求执行动作 | 模型 + Agent |
| **MCP (Model Context Protocol)** | 外部系统怎么标准化接入 | Agent / Server |
| **Skill** | 一类任务该按什么流程做 | Agent |
| **Plugin** | 一组能力怎么打包分发 | 用户/团队/产品 |

关键区分：MCP 解决"外部系统怎么接入"，Skill 解决"这类任务应该怎么做"。

## Context Engineering 五类动作

1. **写入（Write）**：把目标、规则、环境和任务状态显式写进上下文
2. **选择（Select）**：从已有候选信息里只挑当前这一步需要的
3. **检索（Retrieve）**：从历史会话、资料库按需捞取
4. **压缩（Compress）**：长内容外置到文件、清理过期/重复内容
5. **隔离（Isolate）**：独立会话/Sub-agent 处理旁支任务，只把结果带回主线

### 渐进式加载

工具定义按需加载——默认只暴露名称和简介，进入任务后加载完整内容。Skill 也用同样机制，先看名称和描述，确认适用后再读完整 SKILL.md。

### Prompt Cache 意识

System Prompt、基础工具定义、长期规则放前面并保持稳定；动态内容追加到后面。缓存命中率正在成为被普遍关注的工程指标。

## Memory 系统

### 五类长期记忆

| 类型 | 内容 |
|------|------|
| 稳定事实 | 用户城市、工作语言等去情境化信息 |
| 用户知识背景 | 专业背景、知识水平 |
| 行为信号 | 从多次交互观察到的稳定使用模式 |
| 表达偏好 | 表达方式的稳定偏好 |
| 会话延续 | 当前会话中仍有价值的进度、决策 |

### 关键设计：程序性记忆不进长期记忆

WorkBuddy 明确区分陈述性记忆（用户事实）和程序性记忆（做事方法）。经过验证的工作方法走 **Skill** 路径（可版本化、可评审、可测试、可回滚、按需加载），不注入为长期记忆。因为程序性记忆可能将局部经验误升为通用策略、干扰模型推理、隐性改写 Agent 行为、降低泛化与可控性。

### 记忆作用域分层

当前轮 → 会话/Thread → 项目/Workspace → 用户级 → 团队/组织。作用范围越大、影响越高，写入和晋升门槛也应越高。

注入分阶段：冷启动少量高置信摘要 → 请求理解时激活候选 → 执行中回查原始会话/文件 → 任务收尾时提取候选记忆并去重/冲突检查。

## Harness Engineering 五层架构（构建者视角）

### 1. 运行环境层
文件系统、Shell/Bash、Sandbox、Browser、MCP/Connectors、权限边界/Approval Gate、Allowlist/Denylist

### 2. 引导层（Feedforward）
Agent 开始前提供信息和约束，提高首次正确率：项目上下文、环境上下文（OS/Shell/时区）、规则与风格、工具使用规则、Skills、上下文结构与 Prompt Cache

### 3. 反馈层（Feedback）
- 工具结果包含可纠正信息（路径提示、重新读取、权限确认）
- 编辑前时间戳校验（避免覆盖用户最新修改）
- 外部验证信号返回 Agent：Lint/类型检查/测试/构建
- Audit log 留痕可追溯

### 4. 编排层
渐进式加载、意图识别和路由、多模型路由、Teams 多 Agent 协作、并行工具调用

### 5. 迭代层
Harness 自身随模型能力、用户场景和新问题持续调整。一次失败可能偶发，同类失败多次出现或风险很高时再调整。

### 使用者视角四类组件

1. **上下文工程**：分层规则文件（AGENT.md/WORKBUDDY.md）、OpenSpec、Skills、Slash 命令
2. **架构约束**：规则变成可执行检查（本地/Git Hooks/CI/审查 Agent）
3. **反馈循环**：Post-edit checkpoint、本地检查/CI 结果、/team:mr 工作流
4. **熵管理**：周期性扫描代码漂移、重复实现、失效文档、过期依赖

## Loop Engineering

Loop = 触发器 + 独立执行环境 + Skills + Tools/MCP + Sub-agents + Memory + Sensors/Evals + 停止条件

区别于 Goal（只保存目标的状态组件），Loop 需要完整的触发→执行→验证→停止机制。

## 未解决问题

1. **业务正确性验证缺口**：需求和实现可能共享同一误解，部分业务正确性缺少可计算判定标准
2. **代码库 Harnessability**：老系统因结构不清、历史违例多、可观测性弱而更难建 Harness
3. **AI 可能推动技术方案标准化**：团队可能优先选已配好 Harness、结构统一的方案
4. **Harness 需持续投入**：规则要更新、测试要补充、工具要适配新模型

## 相关实体

- [WorkBuddy Skill 全拆解](../ch07/054-skill.html)
- [Mem0 vs WorkBuddy Agent 记忆对比](../ch04/407-mem0-vs-workbuddy-agent.html)
- [OpenClaw/WorkBuddy/Loop 工程对比](../ch04/350-loop-engineering.html)

→ [原文存档](https://github.com/QianJinGuo/wiki-book/tree/main/docs/raw/articles/workbuddy-agent-product-practice-tencent-2026.md)

## 第 1 来源 — WorkBuddy VS Codex：八个维度讲透国内企业该怎么选...

v×c=49。WorkBuddy VS Codex：八个维度讲透国内企业该怎么选

> → [原文存档](https://github.com/QianJinGuo/wiki-book/tree/main/docs/raw/articles/workbuddy-vs-codex八个维度讲透国内企业该怎么选.md)

---

