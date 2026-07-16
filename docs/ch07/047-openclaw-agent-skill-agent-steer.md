# OpenClaw 深度架构分析：Agent 引擎、多源 Skill 系统、子 Agent steer 重定向、五层容错

## Ch07.047 OpenClaw 深度架构分析：Agent 引擎、多源 Skill 系统、子 Agent steer 重定向、五层容错

> 📊 Level ⭐⭐ | 8.2KB | `entities/openclaw-agent-engine-skill-subagent-architecture-jd-2026.md`

# OpenClaw 深度架构分析：Agent 引擎、多源 Skill 系统、子 Agent steer 重定向、五层容错

> 京东技术发布的 OpenClaw 源码深度分析，聚焦 Agent 执行引擎、Skill 系统、子 Agent 架构和容错机制——与 [OpenClaw 与 Hermes 源码架构对比](../ch01/283-openclaw-hermes.html)（Gateway/Channel/Dreaming 记忆视角）互补。

## 架构分层

OpenClaw 在 pi-mono（嵌入式 Agent 引擎）之上构建三层：
- **pi-mono 层**：ReAct 循环、LLM 调用、工具执行
- **OpenClaw 平台层**：路由、容错、认证管理、Skill 系统
- **渠道层**：统一消息抽象，同一 Agent 多平台服务

**两种互补架构**：Agent + Skill（注入领域知识）+ 主子 Agent（并行执行+上下文隔离）。

## Agent 执行引擎

**双入口同流程**：CLI 和 Gateway/API 走同一条执行路径。runWithModelFallback 提供多 Auth Profile 轮换。

**ReAct 循环**（pi-embedded-runner/run.ts）：Reasoning → Acting → Observation。MAX_RUN_LOOP_ITERATIONS 根据可用 Auth Profile 数量动态缩放（更多 Key = 更大重试空间）。

**单次执行**：准备 workspace → 加载 Skill entries → 构建 System Prompt（Skill 菜单+工具说明+身份信息）→ 创建工具集 → 调用 pi-coding-agent → 处理结果/流式/压缩。

## Skill 机制详解

### 多源加载（6 来源按优先级合并）
高优先级覆盖低优先级同名 Skill：项目级 > 内置 > ... (详见内置 Skill 目录解析逻辑)。

### 过滤与资格
shouldIncludeSkill() 三层过滤：配置禁用(排除) → 内置白名单(allowBundled) → 运行时资格（OS 兼容性+必要二进制+必要环境变量）。

### 数量限制
| 参数 | 作用 |
|------|------|
| maxCandidatesPerRoot | 每来源最大候选数 |
| maxSkillsLoadedPerSource | 每来源最大加载数 |
| maxSkillsInPrompt | Prompt 中最大 Skill 数 |
| maxSkillsPromptChars | Skill 段最大字符数 |
| maxSkillFileBytes | 单 SKILL.md 最大字节 |

### 菜单注入与自主选择
所有符合条件的 Skill 的**摘要**（name/description/location）注入 System Prompt，非完整内容。Agent 自主选择，**每次最多读一个 Skill**（never read more than one skill up front）。

### SkillSnapshot
buildWorkspaceSkillSnapshot() → { prompt, skills, skillFilter, resolvedSkills, version }。子 Agent 可复用父 Agent 的 SkillSnapshot。

## 子 Agent 架构

### 创建参数（sessions_spawn 工具）
SpawnSubagentParams：task(必需)/label/agentId/model/thinking/runTimeoutSeconds/thread/mode(run|session)/cleanup(delete|keep)/sandbox(inherit|require)/expectsCompletionMessage/attachments。

### 创建流程
校验参数 → 深度检查(spawnDepth) → 数量检查(maxChildren) → 创建 child session → registerSubagentRun → 异步执行 → Hook 触发。

### 生命周期与注册表
subagent-registry.ts：registerSubagentRun/listSubagentRunsForRequester/countActiveRunsForSession/markSubagentRunTerminated/releaseSubagentRun。
五种终止原因：complete/error/killed/session-reset/session-delete。磁盘持久化，重启后 restoreSubagentRunsFromDisk() 恢复。

### 推送式结果返回
runSubagentAnnounceFlow()：逐个推送。先完成的先处理→发现答案可 kill 其余→部分失败可立即补救。

### Steer 重定向（核心容错机制）
当子 Agent 偏离方向或卡住时，主 Agent 用 subagents steer 重新指挥：abortEmbeddedPiRun(中断) → 清空队列 → 等待停止 → 注入新指令 → 重新开始。

## 五层容错体系

| 层 | 机制 | 说明 |
|----|------|------|
| 第 1 层 | 错误分类 | 20+ LLM 提供商错误统一标准化 |
| 第 2 层 | 智能重试 | 指数退避+抖动（initial=250ms, max=1.5s, jitter=0.2） |
| 第 3 层 | Auth 轮换（熔断器） | 多 API Key 健康追踪→自动轮换→熔断保护→渐进恢复 |
| 第 4 层 | 模型回退 | 跨提供商回退链（Anthropic→OpenAI→Google） |
| 第 5 层 | 上下文恢复 | 自动 compaction（最多 3 次）→ 截断工具结果 |

## 工具权限策略

两级拒绝列表：

**所有子 Agent 始终禁止**：gateway, agents_list, whatsapp_login, session_status, cron, memory_search, memory_get, sessions_send。

**叶子节点额外禁止**：subagents, sessions_list, sessions_history, sessions_spawn。

叶子节点判断：spawnDepth >= maxSpawnDepth。

## 与已有 OpenClaw 实体的互补

| 维度 | 已有实体（Gateway/Channel/记忆） | 本实体（Agent 引擎/Skill/SubAgent） |
|------|-------------------------------|----------------------------------|
| 视角 | Gateway 微内核+Channel Plugin+Dreaming | Agent 执行引擎+Skill+SubAgent+容错 |
| 核心概念 | Channel 25+ Adapter, 5 层纵深防御, 记忆向量引擎 | ReAct 循环, 6 源 Skill 加载, steer 重定向, 5 层容错 |
| 关注点 | 外部通信/多平台/安全/记忆 | 内部运行时/知识注入/任务分解/故障恢复 |
| 分析深度 | 架构概念层 | 源码级参数/流程/配置 |

## 关键独到判断

> "Steer 是核心容错机制，个人认为是灵魂——当子 Agent 方向偏离或卡住时，主 Agent 可以通过 steer 重新指挥：中断当前工作 → 清空队列 → 等待停止 → 发送新指令 → 重新开始。"

> "Skill 的选择是 Agent (LLM) 自主完成的，不是系统硬编码的规则匹配。关键约束：never read more than one skill up front——每次最多选择一个 Skill，避免不必要的 Token 消耗。"

> "叶子节点判断：当子 Agent 的 spawnDepth >= maxSpawnDepth 时，被视为叶子节点，不能再创建自己的子 Agent，从而防止无限递归。"

> "推送式结果返回的优势：提前处理、提前终止（发现答案后可以 kill 其余子 Agent）、渐进式反馈、部分失败处理、精细超时。"

## 实践启示

- **Skill 菜单注入（非全量）是 Token 优化的关键**：只注入摘要信息（name/description/location），Agent 按需读取完整 SKILL.md——这是 OpenClaw 处理 50+ Skill 的高效机制
- **子 Agent 的 spill 能力比执行更重要**：steer 重定向和推送式结果返回是 Agent 编排的核心——不是创建了多少子 Agent，而是能灵活地中断/重定向/并行处理结果
- **Auth 熔断器可扩展到任何 API 调用场景**：健康追踪+自动轮换+熔断保护+渐进恢复的模式可迁移到其他多后端服务架构
- **工具权限隔离的设计模式**：两级拒绝列表（always 禁止 + leaf 节点额外禁止）+ spawnDepth 限制——防止 Agent 无限递归避免资源耗尽
- **Skill 上限配置是系统工程**：5 个 SkillsLimitsConfig 参数的精调是 Agent 生产成本管理的关键

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/openclaw-agent-engine-skill-subagent-architecture-jd-2026.md)

---

