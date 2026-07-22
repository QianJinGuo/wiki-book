---
title: "首个 Java Harness Framework：AgentScope 把 OpenClaw 带到企业分布式场景"
source_url: https://mp.weixin.qq.com/s/yBWOk-mpGih9bV4wqPnkOQ
tags: [wechat, article, claude, openai]
sha256: a1de7c7ed803
type: raw
created: 2026-05-15
updated: 2026-05-15
review_value: 9
review_confidence: 9
review_score: 81
review_stars: 5
review_recommendation: "入库"
ingested: 2026-05-15
source: "阿里云开发者"
source_authors: ["刘军"]
source_date: "2026-05-15"
---
# 首个 Java Harness Framework 来了｜AgentScope 把 OpenClaw 带到企业分布式场景
> 来源：阿里云开发者（刘军），2026年5月15日
## 背景：OpenClaw/Hermes 很好，但企业级场景用不起来
个人助手型 Agent（OpenClaw/Hermes/Claude Code）用本地目录做工作区，单机单用户没问题。但企业级场景遇到五个核心障碍：
1. **多用户多副本**：工作区如何在多用户隔离 + 多副本共享之间平衡？
2. **隔离执行**：Tool/Skill Script 不能在宿主机上跑，沙箱需支持多轮状态可恢复
3. **分布式文件系统**：workspace + 文件系统如何适配分布式环境（OSS/Redis/KV）？
4. **Multi-Agent 编排**：子任务分发、上下文隔离、异步执行、结果回收、超时取消
5. **开箱即用上下文管理**：压缩时机、压缩策略、历史可检索、跨进程重启恢复
**根源**：个人助手型 Agent 和企业级 Agent 是两种不同的工程形态。
## AgentScope Java 1.1.0 四项核心能力
1. **工作区驱动的 Agent 运行环境**：人格、知识、技能、记忆、子 Agent 规格统一沉淀在结构化工作区，每次运行自动加载上下文、结束后自动回写记忆
2. **可插拔的抽象文件系统**：本机磁盘/远端共享存储/隔离沙箱通过同一套接口操作，一套 Agent 逻辑适配个人到企业
3. **开箱即用的上下文管理**：内置对话压缩 + 双层记忆沉淀 + 全文检索，解决长对话上下文膨胀和跨会话记忆丢失
4. **子 Agent 编排与隔离执行**：声明式定义子 Agent、同步/异步委派；沙箱内工具执行，多轮对话间沙箱状态可恢复
## 核心支柱一：Workspace 作为唯一事实来源
Harness 为每个 Agent 引入 workspace 工作空间——结构化目录，承载：
- `AGENTS.md`：人格定义
- `MEMORY.md`：长期记忆
- `knowledge/`：领域知识
- `skills/`：可复用技能
- `subagents/`：子 Agent 规格
- `agents/<agentId>/`：会话历史
工作原理：
- 推理开始前，`WorkspaceContextHook` 把 AGENTS.md、MEMORY.md、knowledge/ 自动注入 system prompt
- 推理结束后，`MemoryFlushHook` 提炼新事实写入记忆文件
- 后台 `MemoryConsolidator` 周期性地把流水账合并成精炼的长期记忆
## 核心支柱二：AbstractFilesystem
解决本地磁盘在分布式场景下行不通的问题。统一接口（read/write/ls/grep），可适配本机磁盘、OSS、Redis、沙箱文件系统等任意介质。
**三种声明式模式**：
| 模式 | 适用场景 | Shell 工具 |
|------|----------|-----------|
| 本机 + Shell（默认） | 个人本机应用、开发测试 | ✅ |
| 远端共享存储 | 多副本在线服务 | ❌（默认不注册） |
| 沙箱执行 | DataAgent、Coding Agent 等不可信输入 | ✅（隔离内） |
## 三大工程能力
### 安全与隔离
- Shell/Code/Skill 在沙箱后端隔离执行，不直接在宿主机运行
- 工作区本身也可运行在沙箱内
- 工具注册与暴露由框架统一管理
### 分布式部署
- 多副本对等部署，关键文件通过 Remote 后端路由到共享存储，跨节点同步
- `IsolationScope`（SESSION / USER / AGENT / GLOBAL）+ `RuntimeContext` 实现多租户策略
### Subagent 与异步任务
- 子 Agent 工作区、文件系统、会话状态从父 Agent 继承或独立配置
- 异步任务状态机（PENDING/RUNNING/COMPLETED/FAILED/CANCELLED）开箱即用
## 典型使用场景
### 个人代理 Agent（典型如 OpenClaw 类应用）
- 核心诉求：让 Agent 真正了解用户、记住用户
- 能力：持续记忆、本地 Shell 执行、工作区即配置、会话跨进程恢复
### 企业级数据服务（典型如 DataAgent）
- 核心诉求：执行安全（用户驱动的代码不能无限制跑）、多副本体验一致
- 能力：隔离沙箱执行、多轮沙箱状态恢复、分布式记忆共享、子 Agent 并行编排、多租户隔离
### 企业在线服务（典型如淘天交易 Agent）
- 核心诉求：稳定与安全，不需要 Shell
- 能力：默认安全边界（不开启沙箱则不暴露 Shell）、多实例共享记忆、会话跨请求连续、并行子任务支持
## 核心概念
| 概念 | 定义 | 解决的问题 |
|------|------|----------|
| HarnessAgent | 基于 ReActAgent 的工程化封装入口 | 不想从零拼装压缩、记忆、会话、子任务、文件系统 |
| workspace | Agent 的工作目录，承载全部持久化内容 | 人格、知识、记忆、状态放哪、如何持续演化 |
| filesystem | 文件读写的统一接口抽象层 | 同一套 Agent 逻辑如何在本地、共享存储、沙箱间切换 |
| RuntimeContext | 单次 call() 的身份上下文 | 这一轮是谁、状态读写到哪、多租户如何隔离 |
| sandbox | 隔离执行环境，状态多轮可恢复 | 如何在不信任输入下安全执行工具，并保持多轮状态连续 |
| memory | 双层记忆系统（流水账 + 长期记忆） | 长对话不丢事实、上下文不爆、历史可检索 |
## 记忆管理机制
**第一层——每日流水账**：每次对话结束后，LLM 从当次对话提炼"新增事实"，以 bullet point 追加到当日记忆文件。只追加、不修改。
**第二层——长期记忆**：后台调度器周期性地把日流水账与现有 MEMORY.md 合并、去重、精炼，输出 Token 预算内的"可注入版"。
**对话压缩**：当消息数或 Token 数超过阈值，Harness 用 LLM 把之前对话压缩成摘要，保留最近若干条，其余卸载到 JSONL。压缩会在提炼长期记忆之后进行。框架会捕获 context overflow 异常、强制压缩、自动重试，对调用方透明。
## Quick Start
```java
// 1. 引入依赖
// <dependency>
//     <groupId>io.agentscope</groupId>
//     <artifactId>agentscope-harness</artifactId>
//     <version>${agentscope.version}</version>
// </dependency>
// 2. 准备工作区：创建 workspace/AGENTS.md
// 3. 构建 HarnessAgent
HarnessAgent agent = HarnessAgent.builder()
    .name("my-agent")
    .model(model)
    .workspace(Paths.get(".agentscope/workspace"))
    .compaction(CompactionConfig.builder()
        .triggerMessages(50)  // 消息数超过 50 触发压缩
        .keepMessages(20)     // 保留最近 20 条
        .build())
    .build();
RuntimeContext ctx = RuntimeContext.builder()
    .sessionId("user-session-001")  // 相同 sessionId 自动续接上下文
    .userId("alice")               // 多用户场景必传，用于命名空间隔离
    .build();
Msg reply = agent.call(userMessage, ctx).block();
```