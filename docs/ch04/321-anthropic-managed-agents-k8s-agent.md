# Anthropic Managed Agents：用 K8s 思路虚拟化 Agent 组件

## Ch04.321 Anthropic Managed Agents：用 K8s 思路虚拟化 Agent 组件

> 📊 Level ⭐⭐ | 8.5KB | `entities/anthropic-managed-agents-scaling.md`

# anthropic-managed-agents-scaling

本文编译自 Anthropic 工程博客，系统阐述 Managed Agents 的核心理念：用 K8s 的思路虚拟化 Agent 组件——将 session（事件日志）、harness（大脑/工具调用循环）、sandbox（代码执行环境）解耦为三个独立接口，让每个组件都能独立故障、独立替换、独立扩展。
早期设计把全部 Agent 组件塞进一个容器——文件操作是本地 syscall，部署简单，但这养了一只**宠物**：

- 容器卡死 → 调试困难（WebSocket 分不清故障在哪个环节）
- Claude 工作环境硬编码 → 无法对接客户自有 VPC
- Prompt injection 攻击面大：不可信代码和凭证在同一环境

## 相关实体
- [Anthropic Pm Jess Yan Managed Agents](../ch01/933-anthropic.html)
- [Anthropic Claude Managed Agents Platform 2026](../ch01/236-anthropic-claude-managed-agents.html)
- [Claude Managed Agents Self Hosted Sandbox Mcp Tunnels Enterprise](ch04/517-claude-managed-agents.html)
- [From Prompt To Harness Claude Official](../ch05/018-harness.html)
- [Anthropic Demystifying Evals For Ai Agents](ch04/457-anthropic-demystifying-evals-for-ai-agents.html)

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/anthropic-managed-agents-scaling.md)

- [MOC](https://github.com/QianJinGuo/wiki/blob/main/moc/prompt-engineering-guide.md)
## 深度分析

### 从宠物到牛群：Agent 架构范式转移

Anthropic 这篇文章揭示了 Agent 系统设计的根本性范式转移。传统 Agent 架构将 harness（决策循环）、sandbox（执行环境）、session（状态存储）耦合在同一个容器进程内，这种设计固然降低了初始复杂度，却也制造了一个"全或无"的故障模型——任何一个组件的失败都会导致整个系统不可用，如同养宠物：宠物死了，系统就死了。

Managed Agents 的解法借用了 Kubernetes 在分布式系统领域已经验证的成功路径：**通过接口抽象实现组件解耦**。这不是简单的代码重构，而是一种认知框架的升级。当我们说"Session 是持久化日志"时，我们实际上是在说：状态不应该活在内存里，而应该活在有明确接口的外部存储里。这与 K8s 的 PersistentVolume 概念一脉相承——Pod 可以死，但数据不应该跟着 Pod 一起死。

### 脑手分离的工程哲学

文章中最具洞察力的设计是"脑手分离"：Harness（大脑）负责决策，Sandbox（手）负责执行。两者通过 `execute(name, input) → string` 这样的远程调用交互。这种设计的深层含义是：**信任边界重新划定**。

在单体架构里，Claude 生成的代码和真实凭证共处一室，一次成功的 prompt injection 就可以窃取所有敏感数据。而脑手分离后，Claude 的"手"——即它生成的代码——只能操作 sandbox 内部的资源。Token 根本不在 sandbox 的可达范围内，正如文章所言："不是所有安全问题都要靠权限收窄来解决，有时候换个架构就能把问题消除掉。"

这是一种**架构层面的安全设计（Security by Architecture）**，而非依赖运行时权限检查的**安全设计（Security by Policy）**。前者将安全问题消灭在根源，后者则需要在每个可能的攻击路径上设防。

### Session 外部化对 Agent 持久化的启示

文章特别区分了 Session 和上下文窗口：上下文窗口是 LLM 的固有限制，属于模型层面；Session 是外部持久化日志，属于架构层面。这个区分至关重要。

当前大多数 Agent 系统依赖上下文窗口来维持状态，这意味着：任务越长，重要历史信息被"挤出"的风险越高。Compaction、Memory 工具、Context trimming 这些妥协方案都涉及不可逆的信息丢失。而 Session 外部化彻底改变了这个局面——日志可以无限增长，只要保留完整的 getSession 接口，Agent 可以从任意历史点恢复。

这为**长时间任务**和**跨会话上下文**提供了架构层面的原生支持，而非事后打补丁。

### 对行业的影响

Anthropic 的这个设计很可能会成为 Agent 架构的"标准答案"之一。原因有三：其一，它用已经验证的分布式系统概念（K8s）来解释自己的设计，降低了行业学习成本；其二，它解决了实际生产环境中的三个核心痛点（故障恢复、多租户隔离、安全）；其三，它的核心接口足够简单，可以被各种上层框架复用。

## 实践启示

### 在既有项目中应用脑手分离

如果你的 Agent 系统还是单体架构，可以考虑分步骤迁移：

1. **第一步：接口提取**。不要一次性改造，先为 session、harness、sandbox 分别定义清晰的接口。就像从巨石架构迁移到微服务，先画清楚边界。
2. **第二步：Session 外部化**。将事件日志从内存移到外部存储（Redis、PostgreSQL、甚至文件）。这步风险最低，收益最直观——你可以重启 harness 而不丢状态。
3. **第三步：Sandbox 独立化**。让 sandbox 从本地进程调用变成远程调用（即使在同一台机器上，也走 TCP）。这步完成后，你就可以独立扩缩容 sandbox 实例了。
4. **第四步：Token 安全重构**。将敏感 token 移出 sandbox，通过 MCP 代理访问。这步涉及安全，需要仔细审计。

### 实现 Cattle 文化的工程实践

"Cattle not Pet"说起来简单，真正落地需要配套工程能力：

- **健康检查**：每个组件必须有清晰的健康检查接口。Session 的健康检查是"能否正常读写"；Harness 的健康检查是"能否正常唤醒和恢复"；Sandbox 的健康检查是"provision 是否成功"。
- **超时和重试**：远程调用必须有合理的超时设置。Sandbox 挂了，Harness 需要能够感知并处理，而不是无限等待。
- **日志和追踪**：跨组件调用需要 trace ID 将各组件的日志串联起来。纯粹靠 WebSocket 日志很难调试跨三个组件的复杂故障。

### 安全架构的具体实现建议

Token 不可达设计在工程上有几个关键实现点：

1. **Git credentials 隔离**：在初始化阶段用 token 克隆仓库，然后立即将 git remote 改为基于 SSH key 或本地凭证的方式。这样即使 sandbox 内的进程执行 `git push`，也是推送到本地配置而非携带 token。
2. **MCP 代理模式**：所有需要外部认证的操作都通过 MCP 协议。代理根据 session ID 映射到对应的凭证，MCP 服务本身持有 token，sandbox 永远接触不到。
3. **网络层面隔离**：如果条件允许，让 sandbox 运行在独立的网络命名空间，即使出现进程逃逸也无法直接访问内网服务。

### 避免常见误区

- **不要过度工程化**：如果你的 Agent 系统规模很小（几十个并发 session），强行解耦只会增加复杂度。评估的标准是：**故障域隔离的收益是否大于接口抽象带来的额外复杂性**。
- **不要把 Session 当数据库**：Session 是事件日志，不是查询用的数据库。频繁的全量查询应该另外建索引，不要直接扫 Session 日志。
- **不要忽略 Harness 的无状态要求**：Harness 必须是真正无状态的。任何需要在崩溃后恢复的中间状态都应该存在 Session 里，而不是 Harness 的内存中。

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/anthropic-managed-agents-scaling.md)

---

