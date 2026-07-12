# Anthropic 官方 Agent Harness 平台：Claude Managed Agents 完整指南

## Ch01.380 Anthropic 官方 Agent Harness 平台：Claude Managed Agents 完整指南

> 📊 Level ⭐⭐ | 13.2KB | `entities/anthropic-官方-agent-harness-平台claude-managed-agents-完整指南.md`

title: "Anthropic 官方 Agent Harness 平台：Claude Managed Agents 完整指南"
created: 2026-05-10
updated: 2026-06-17
type: entity
tags: [mlops, ai-agent, agent-tools, engineering, anthropic, claude, claude-managed-agents, harness-engineering, agent-platform]
review_value: 7
sources:
  - raw/articles/anthropic-官方-agent-harness-平台claude-managed-agents-完整指南
  - raw/articles/claude-managed-agents-evolution-of-agentic-surfaces-2026-06
review_confidence: 8
---

> -> [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/anthropic-官方-agent-harness-平台claude-managed-agents-完整指南.md)
从微信文章 [Anthropic 官方 Agent Harness 平台：Claude Managed Agents 完整指南](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/anthropic-官方-agent-harness-平台claude-managed-agents-完整指南.md) 提取。

## 核心内容
source_url: https://mp.weixin.qq.com/s/A_ksLCNmIL4lXLcZeVSPsQ

### 主要章节
- ##  四大核心概念
- ###  1\. Agent（智能体）
- ###  2\. Environment（环境）
- ###  3\. Session（会话）
- ###  4\. Events（事件）
- ##  完整实战示例
- ##  自定义工具和 MCP 服务器
- ###  自定义工具
- ###  MCP 服务器
- ##  多智能体编排（研究预览版）
- ##  与其他方法的对比
- ##  定价详解
- ###  1）Token 费用（和普通 API 一样）
- ###  2）会话运行时间
- ##  可以构建什么

## 深度分析
### 架构哲学：从"模型调用"到"平台托管"
Managed Agents 的核心转变在于将 Agent 的基础设施责任从用户转移到平台。这与 AWS 从 EC2 到 Lambda 的演进路径高度相似。
传统 Agent 开发需要自行处理循环控制、工具调用、执行环境、上下文管理四大难题。Managed Agents 通过 Harness 引擎将这些封装为平台能力，开发者只需定义任务本身。

### 四层抽象的价值锚点
| 层次 | 职责 | 用户可控性 |
|------|------|------------|
| Agent | 模型选择、系统提示词、工具集 | 高 — 完全自定义 |
| Environment | 运行时依赖、网络隔离、代码挂载 | 中 — 按需配置 |
| Session | 容器实例、状态持久化 | 低 — 平台管理 |
| Events | 通信协议、流式交互 | 低 — 标准接口 |
这种分层抽象使得平台能够在不破坏用户体验的前提下持续优化底层基础设施。

### 多智能体编排的工程意义
当前多智能体仅支持一层委托结构（协调器 → 工作者），但这个限制本身揭示了一个重要信号：Anthropic 将多智能体定位为"AI 版 CI/CD 流水线"，而非通用的智能体网络。
共享文件系统+隔离对话上下文的组合，是兼顾协作效率与干扰隔离的务实设计。测试智能体可以直接引用审查智能体的发现问题，实现自动化的任务接续。

### 定价模型的隐含逻辑
$0.08/小时的会话运行时间成本结构清晰：

- **Token 成本** = 模型的"思考费用"，与输出质量直接相关
- **Runtime 成本** = 环境的"占用费用"，与任务复杂度相关
提示词缓存命中仅算 0.1x 这个机制对长上下文 Agent 极为关键，因为一个典型代码审查任务的上下文往往达到 100K+ tokens。

### 市场定位分析
Anthropic 的 Agent 产品矩阵按"用户自管理程度"排列，覆盖从完全自研（Messages API）到零管理（Claude Cowork）的完整光谱。Managed Agents 处于中间偏上的位置，目标是后端自动化场景——这个市场此前主要由 self-hosted Agent 方案占据。

## 实践启示
### 迁移路径建议
**从 Messages API 迁移**：如果当前 Agent 逻辑已经稳定，迁移到 Managed Agents 可以立即获得环境管理、错误恢复和版本控制能力。关键是重构工具调用层以适配新的工具定义格式。
**从自托管 Agent SDK 迁移**：如果目前使用 Agent SDK 部署在自有基础设施上，Managed Agents 的价值在于降低运维负担。但需要评估网络隔离需求是否与平台能力匹配。

### 最佳实践场景
1. **PR 审查自动化**：结合 GitHub MCP，直接在 Pull Request 流程中嵌入代码审查，成本可控（约 $0.7/次）
2. **CI 自愈**：将失败日志作为输入，让 Agent 定位问题并生成修复 PR，适合处理 flaky test 和简单回归
3. **文档生成流水线**：在代码合并后自动触发，保持文档与代码的同步

### 运营注意事项
- **会话管理**：及时关闭超时会话，避免不必要的 runtime 费用
- **工具范围**：按最小权限原则配置工具集，敏感操作使用自定义工具而非直接开放 shell
- **版本控制**：利用 Agent 版本机制做灰度发布，新版本先在测试环境验证再切换
- **MCP 优先**：有现成 MCP 接口的系统（Slack、GitHub、Jira）优先接入，避免重复造轮子

### 风险与局限
- 多智能体仍在预览阶段，生产使用需单独申请
- 网络默认 unrestricted，需要手动配置白名单以满足安全要求
- 环境缓存虽能加速启动，但冷启动场景下仍有等待时间

## 相关实体
- [Claude Managed Agents 官方 Harness 平台指南](ch01/283-anthropic-claude-managed-agents.html)
- [Anthropic Claude Managed Agents 平台正式发布](ch01/283-anthropic-claude-managed-agents.html)
- [claude managed agents official](../ch04/549-claude-managed-agents-official.html)
- [深入理解 Claude Code 源码中的 Agent Harness 构建之道](../ch05/039-agent-harness.html)
- [claude managed agents](../ch04/655-claude-managed-agents.html)
- [Claude Managed Agents 开发者指南](../ch04/655-claude-managed-agents.html)
- [精选 10 个开发者常用的 AI 智能体技能（Agent Skills）](../ch04/385-agent-skills.html)
- [Agent 开发范式演进：从环境工程出发，“简化”多源实时上下文](../ch03/045-agent.html)
- [Anthropic 联创：2028 年实现 AI 自我构建的概率超过 60%](ch01/890-anthropic.html)
- [我把 Karpathy 的 AutoResearch 搬到了软件开发领域，效果炸了](https://github.com/QianJinGuo/wiki/blob/main/entities/我把-karpathy-的-autoresearch-搬到了软件开发领域效果炸了.md)
- [吴恩达：AI 将最先杀死前端](../ch05/082-ai.html)
- [IMClaw：通过微信/飞书操控ClaudeCode/Codex/GeminiCLI/Pi Agent蜂群](../ch03/075-claude-code.html)
- [两万字详解Claude Code源码核心机制](../ch03/075-claude-code.html)
- [天猫新品营销技术团队AI编码实战指南（上）](../ch05/082-ai.html)
- [深入理解 Claude Code 源码中的 Agent Harness 构建之道](../ch05/039-agent-harness.html)
- [从Vibe Coding到Agentic Engineering：重构后台开发全流程](../ch04/235-agentic.html)
- [告别“氛围编程”：基于 Harness 治理和 SDD 的团队级 AI 研发范式演进与实践](../ch05/018-harness.html)
- [别再把上下文当聊天记录](https://github.com/QianJinGuo/wiki/blob/main/entities/别再把上下文当聊天记录.md)
- [Harness不是目的，知识才是护城河 —— 一个AI工程交付团队的知识沉淀实践](../ch05/018-harness.html)
- [深度拆解 Hermes Agent 记忆系统：它修正了 OpenClaw 的哪层误区？](../ch03/090-hermes-agent.html)
- [Cursor 复盘 Harness：模型决定能力上限，Harness 决定生产下限](../ch05/018-harness.html)
- [你不知道的 Agent：原理、架构与工程实践](../ch03/045-agent.html)
- [看 AgentRun 如何玩转记忆存储，最佳实践来了！](../ch04/003-agentrun.html)
- [Karpathy 最新访谈：从 Vibe Coding 到 Agentic Engineering](../ch04/235-agentic.html)
- [一文带你弄懂 AI 圈爆火的新概念：Harness Engineering](../ch05/066-harness-engineering.html)
- [龙虾装上了，可以用来干啥？分享下我的 OpenClaw 多智能体团队搭建经验！](../ch11/225-openclaw.html)
- [Harness Engineering：耗时一周，我是如何将应用的AI Coding率提升至90%的](../ch05/066-harness-engineering.html)
- [llm 自我提升系统综述 — yang 等 113 页四阶段闭环框架（zesearch nlp lab）](ch01/618-llm.html)

- [MOC](https://github.com/QianJinGuo/wiki/blob/main/moc/mlops-training-inference.md)
## 第 2 来源：claude.com 官方 blog 视角（2026-06-10，演进叙事）

补充自 [Claude Managed Agents Evolution of Agentic Surfaces 官方 blog](https://claude.com/blog/building-with-claude-managed-agents)，提供 Anthropic 第一方对平台架构演进的官方叙事。

### 平台演进时间线

- **2023**: 开放 Claude API — 简单 tokens-in / tokens-out 模型，开发者自己构建 harness
- **2025**: 发布 Claude Code — Anthropic 内部用了同一套 harness：loop、tool 执行、subagent、context 管理
- **2025 末**: Claude Agent SDK — 让外部团队在 Claude Code 的同款 harness 上构建自己的 agent
- **2026 早期**: Claude Managed Agents — 把 harness + 生产基础设施打包为组合式 API

### 官方对 Managed Agents 6 大生产化挑战的解答

| 挑战 | Agent SDK 方案 | Managed Agents 方案 |
|------|--------------|-------------------|
| 托管和扩展 | 开发者自管 | 平台自动扩展 |
| Session 管理 | 本地或外部存储 | append-only 日志，可中断恢复 |
| 文件系统管理 | 开发者配 | 平台提供隔离 workspace |
| 执行隔离 | 同一 container 内运行 | **harness 与 sandbox 解耦**（brain 与 hands 分离） |
| 凭证管理 | 开发者注入 | 凭证不进入 sandbox |
| 可观测性 | OTel 导出 | 完整 session 重建 |

### 核心架构创新：Brain-Hands-Session 三元组

Managed Agents 解耦大脑（harness 调用 Claude）与手（sandbox 执行代码），由 session（append-only 模型/工具/结果日志）连接两者。

- Claude 可以在任何 container 启动前开始推理
- Sandbox 远离用户凭证
- 整个 run 可从 session 任意时间点重建

### 与现有实体的互补

本条 entity 主体（2026-05-10 微信译本）侧重 4 大核心概念、定价、实战场景。官方 blog（2026-06-10）补充架构演进时间线、6 大生产挑战的官方解答、brain-hands-session 三元组设计哲学。两者结合形成完整的产品认知 — 微信译本讲它是什么、怎么用、多少钱，官方 blog 讲它为什么这样设计、解决了什么、上一个版本有什么不同。

### 三个独有贡献（官方 blog 视角）

1. **6 大生产化挑战的官方列举** — Hosting/Session/Filesystem/Isolation/Credentials/Observability，提供了对 agent 平台化所需能力的完整 checklist
2. **Brain-Hands-Session 三元组** — 不只是技术架构，更是一种凭证不进入 sandbox 的安全哲学的具体实现
3. **从 Message API 到 Managed Agents 的演进叙事** — Anthropic 第一次公开承认在 prototype 阶段自行构建 harness 是合理的，但 production 化需要平台化

---

