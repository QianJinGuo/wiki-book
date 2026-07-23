# 存之有序，治之有矩——Agent 记忆系统的工程实践与演进

## Ch01.808 存之有序，治之有矩——Agent 记忆系统的工程实践与演进

> 📊 Level ⭐⭐ | 5.5KB | `entities/存之有序治之有矩agent-记忆系统的工程实践与演进.md`

# 存之有序，治之有矩——Agent 记忆系统的工程实践与演进

→ [原文存档](https://github.com/QianJinGuo/wiki-book/tree/main/docs/raw/articles/存之有序治之有矩agent-记忆系统的工程实践与演进.md)

## 深度分析

# 存之有序，治之有矩——Agent 记忆系统的工程实践与演进
摘要：本文是”解决 Agentic AI 应用 Token 爆炸问题”系列的第三篇，系统讨论 Agent 记忆系统在生产环境的工程税:从写入纪律、Prompt Cache 冲突、跨模型容量、Embedding 迁移到 Agent 自产 Skill 治理,以及 S3 Files / S3 Vectors / AgentCore Memory 在亚马逊云科技上的落地路径。

### 核心观点

1. **目录**
02 2026 的新变量
03 Part 1.
2. 记忆系统的五个工程考量
04 Part 2.
3. 记忆的写入纪律与失效机制
05 Part 3.
4. 记忆写入与 Prompt Cache 的冲突
06 Part 4.
5. Token
07 Part 5.

### 内容结构

- 存之有序，治之有矩——Agent 记忆系统的工程实践与演进
- **1\. 引言**
- **2\. 2026 的新变量**
- **3\. Part 1. 记忆系统的五个工程考量**
- **4\. Part 2. 记忆的写入纪律与失效机制**
- 4.1 路径一：LLM 判官
- 4.2 路径二：公式打分
- 4.3 路径三：托管策略（内置 + 可自定义）
- 4.4 路径四：workload-feedback adaptation
- 4.5 延伸：图结构下的失效判断

### 技术要点

- **agent架构**: 本文在agent方向提出的设计理念与实现路径
- **工程挑战**: 实际落地中面临的关键问题与应对策略
- **architecture趋势**: 相关技术演进方向与新兴范式

### 关联实体

- [Headroom Context Compression Agent Vibecoder](../ch03/046-agent.html)
- [构建无服务器Kiro调度平台用Kiro Cli Eventbridge Ecs Fargate实现定时Ai任务](../ch05/090-ai.html)
- [Hermes Agent V014 Architecture Shugex](../ch03/092-hermes-agent.html)
- [Extending Mcp Support For Amazon Bedrock Agentcore Gateway](../ch11/161-extending-mcp-support-for-amazon-bedrock-agentcore-gateway.html)
- [Agent Eval Wallezhang Yaml Driven Agent Evaluation](../ch03/046-agent.html)
- [腾讯混元新里程碑Hy3 Preview 发布开源Agent 表现全面提升](ch01/117-hy3-preview.html)

## 补充：Agent 经验变更系统视角（若飞/架构师 2026-07-19）

若飞从"经验变更系统"视角补充了 Agent Memory 的治理维度：记忆一旦参与决策就不再只是存档，需要管理证据、状态、作用域、验证、晋升和回滚。

### 六层经验层级

| 层次 | 解决的问题 | 默认状态 |
|------|-----------|----------|
| 原始证据 | 当时发生了什么 | 只追加、可追溯 |
| 当前状态 | 任务现在走到哪里 | 一个权威版本 |
| 候选经验 | 哪条做法可能有用 | 未验证、可过期 |
| 已验证记忆 | 哪类场景可以复用 | 有来源和作用域 |
| Skill / Harness | 以后默认怎样做 | 有版本、可回归 |
| Policy | 哪些动作允许或禁止 | 外部维护、单独审批 |

### 读取链与写入链分离

- **读取链**：当前任务允许哪些过去进来
- **写入链**：当前结果凭什么影响未来

关键洞察：Memory 的写入是经验获得长期影响力的入口，读取则是历史进入当前任务的准入过程。一次有效离可靠经验还很远——需复现+外部证据+明确作用域才能晋升。Memory 进入 Skill 或 Harness（参考信息→默认行为）时，验证要求随之提高。

→ [原文存档](https://github.com/QianJinGuo/wiki-book/tree/main/docs/raw/articles/agent-memory-self-improvement-verification-ruofei-2026-07-19.md)

## 实践启示

1. **Agent 设计**: 关注控制流与上下文工程的平衡，Harness 约束比模型能力更影响成功率
2. **可观测性**: Agent 行为调试应优先检查工具定义和上下文质量
3. **渐进式部署**: 从简单 ReAct 循环起步，逐步引入多 Agent 编排
4. **验证优先**: 建立完善的测试验证体系，确保 Agent 行为可预测

## 相关实体

- [MOC](https://github.com/QianJinGuo/wiki/blob/main/moc/agent-engineering-guide.md)

---

