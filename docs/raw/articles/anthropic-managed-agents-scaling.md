---
title: anthropic-managed-agents-scaling
source_url: https://mp.weixin.qq.com/s/gkTsLXiGOHmracA0JpKPEQ
publish_date: 2026-05-07
tags: [wechat, article, claude, agent, harness, coding, openclaw]
review_value: 7
review_confidence: 7
review_recommendation: neutral
sha256: 68d6b34ef4379d5d66e453dece453d2dfca698ae7307c785fb752d94f65ec1a9
---
## 文章概要
本文编译自 Anthropic 工程博客，系统阐述 Managed Agents 的核心理念：用 K8s 的思路虚拟化 Agent 组件——将 session（事件日志）、harness（大脑/工具调用循环）、sandbox（代码执行环境）解耦为三个独立接口，让每个组件都能独立故障、独立替换、独立扩展。
## 核心主题
### 问题背景：宠物困境
早期设计把全部 Agent 组件塞进一个容器——文件操作是本地 syscall，部署简单，但这养了一只**宠物**：
- 容器挂了 → session 就没了
- 容器卡死 → 调试困难（WebSocket 分不清故障在哪个环节）
- Claude 工作环境硬编码 → 无法对接客户自有 VPC
- Prompt injection 攻击面大：不可信代码和凭证在同一环境
### K8s 的历史映射
十年前容器编排面临的同类问题：组件耦合、状态丢失、扩展困难。K8s 的解法是**硬件虚拟化**——Pod/Service/PersistentVolume 比底层硬件活得久。
Managed Agents 在做同样的事，只不过虚拟化对象从**硬件**换成了 **Agent 组件**。
### 三大接口抽象
| 接口 | 职责 | 故障行为 |
|------|------|----------|
| **Session** | 完整事件日志（发生了什么） | 持久化，Harness 挂了可从 last event 继续 |
| **Harness** | 调用 Claude + 路由工具调用的循环 | 本身无状态，挂了 → `wake(sessionId)` 拉起新实例 |
| **Sandbox** | Claude 跑代码、编辑文件的执行环境 | 挂了 → `provision({resources})` 重建，Harness 将失败当工具错误传回 Claude |
### 脑手分离架构
```
Harness（大脑） ← emitEvent(id, event) → Session（记忆）
       ↓ execute(name, input)
   Sandbox（手）
```
- **Harness 不住在容器里**——像调用工具一样调用容器：`execute(name, input) → string`
- **Sandbox 是 Cattle**：挂了就挂了，Harness 传回失败，Claude 决定重试
- **Harness 本身也是 Cattle**：无需要在崩溃中存活的状态，session 日志在外部
- **Session 持久化**：运行中用 `emitEvent(id, event)` 写入，重启后 `getSession(id)` 拿回日志，从 last event 继续
### 安全架构：Token 隔离
**问题**：单体容器里，Claude 生成的不可信代码和凭证在同一环境，一次成功的 prompt injection 就能读取环境变量。
**解法：让 token 在 sandbox 里根本不可达**
- 初始化时用 token 克隆仓库，写入本地 `git remote`，之后 `push/pull` 走本地配置
- 自定义工具走 MCP
- OAuth token 存在**安全保险箱**里，Claude 通过专用代理调用 MCP 工具
- 代理根据 session 拿到对应凭证再调外部服务
> 不是所有安全问题都要靠权限收窄来解决，有时候换个架构就能把问题消除掉。
### Session vs 上下文窗口
长时间任务超出上下文窗口的常见应对都涉及不可逆决策：
- **Compaction**：压缩成摘要（丢失细节）
- **Memory 工具**：写到文件（需要额外检索）
- **Context trimming**：删旧工具结果或 thinking block（可能误删重要信息）
Managed Agents 的 Session 作为外部持久化日志，不受上下文窗口限制。
## 关键要点
1. **K8s 思路**：组件虚拟化 → 接口抽象 → 解耦扩展
2. **Cattle not Pet**：所有组件（Sandbox、Harness）都应能独立挂掉重建
3. **脑手分离**：Claude + Harness（大脑）与 Sandbox（手）分离，各自独立扩展
4. **Session 持久化**：`emitEvent` → `getSession` → 从 last event 继续
5. **安全架构**：Token 不可达设计 > 权限收窄
6. **Session ≠ 上下文窗口**：Session 是外部持久化日志，不受 context 限制
## 相关链接
- Anthropic 工程博客原文: [Scaling Managed Agents: Decoupling the brain from the hands](https://www.anthropic.com/research/scaling-managed-agents)
- 参考: [[concepts/coding-harness-engineering]]
- 参考: [[concepts/openclaw-architecture]]
- 参考: [[concepts/hermes-agent-architecture]]