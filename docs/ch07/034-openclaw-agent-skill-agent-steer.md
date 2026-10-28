# OpenClaw 深度架构分析：Agent 引擎、多源 Skill 系统、子 Agent steer 重定向、五层容错

> 📊 Level ⭐⭐⭐⭐ | 13.9KB

> 京东技术发布的 OpenClaw 源码深度分析，聚焦 Agent 执行引擎、Skill 系统、子 Agent 架构和容错机制——与 [OpenClaw 与 Hermes 源码架构对比](https://github.com/QianJinGuo/wiki-public/blob/main/entities/openclaw-hermes-source-code-agent-architecture-review.md)（Gateway/Channel/Dreaming 记忆视角）互补。

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

## 深度分析

这套架构值得注意的不是它列了多少机制，而是每处取舍背后的成本转移方向。下面从 Token 经济、编排时延、故障分层与权限边界四个角度各切一刀，最后标出它没有覆盖的部分。结构上它由 pi-mono 提供 ReAct 循环、OpenClaw 提供路由与容错，因此这些取舍大多落在平台层而非引擎层。

### 菜单注入的赌注：把不可逆的 Token 超支换成可修复的选择错误

全量注入 Skill 的成本随语料总量线性增长，且每一轮都要重付；菜单注入把它压到「名称+描述+位置」这一常量级，省下的部分赌在 LLM 的按需检索上。两类失败并不对称：Prompt 膨胀一旦发生，本轮预算已经花掉，无法回收；选错 Skill 只多一次文件读取，下一轮即可纠正。所以「每次最多读一个」不是省钱技巧，而是把错误放在可回滚的一侧——代价是选择质量被 description 的写法完全决定，这也解释了 Skill 写作规范为何反复强调 description 是最重要的字段。参见 [上下文窗口经济学](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/context-window-economics.md)。

### steer 与推送式返回：把编排成本从轮询搬到事件

轮询模型下，主 Agent 的等待等于最慢子 Agent 的耗时，且必须持续持有全部子任务状态；推送模型让主 Agent 在第一个结果到达时就能决策——发现答案即 kill 其余，总耗时收敛到「第一个成功者」而非「最慢者」。steer 则把纠错成本从「杀掉重建」降到「中断、清空队列、注入新指令、重启」，保留已积累的上下文。代价是顺序不再保证、重复投递需要幂等，主 Agent 必须能消费乱序到达的部分结果。这套组合更像 [编排者-工作者架构](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/orchestrator-worker-architecture.md) 的事件化版本。

### 五层容错按「对状态的侵入程度」排序，而非按重要性

第 1 层只做归一化（20+ 提供商的错误格式统一），零副作用；第 2 层对同一目标重试（250ms 起步、上限 1.5s、抖动 0.2、最多 3 次），只治瞬时故障；第 3 层换 Key 不换模型，治配额与鉴权，能力不变；第 4 层跨提供商换模型，能力已经改变，属最后手段；第 5 层压缩上下文，改动的是输入本身，代价最深。判据是每层对系统状态的侵入程度：越往后，恢复越贵、越难回退。spawnDepth 上限不在这条链上，它约束的是结构而非故障。

### 两级拒绝列表：能力由「在树中的位置」决定，而不是 Agent 身份

第一级对所有子 Agent 生效的禁令（gateway、cron、memory_search、sessions_send）针对爆炸半径——这些工具要么改动全局状态，要么跨会话读取记忆，被并行子 Agent 滥用后无法收敛。第二级对叶子额外禁止 subagents、sessions_list、sessions_spawn，针对控制面——叶子若仍握有派生能力，递归上限就形同虚设。两者合起来的含义是：同一份 Agent 配置在不同深度会得到不同能力集，权限是算出来的，不是声明出来的；反过来，这也解释了这些禁令为何不做成参数开关——一旦允许调用方自行声明权限，越权就退化成配置问题，而在多层派生中没有人审计配置。参见 [子 Agent 派生模式](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/subagent-spawning-pattern.md)。

### 边界：这是可用性架构，不是正确性架构

推送式返回只报告完成、失败或被杀，不校验结论是否成立；steer 纠正的是方向，不是质量。Skill 选择虽由 LLM 自主完成，但文中没有给出选择是否正确的事后度量，因此「自主」实际上不可审计。模型回退跨提供商时，同一份 Prompt 会落到能力不同的模型上，原有计划不会重新验证。可迁移的判断是：这套设计把「跑不完」的概率压到很低，对「跑完了但是错的」几乎不设防；正确性只能靠外部评测补齐，上下文隔离也只是缩小污染面，不等于结论可信。参见 [多 Agent 上下文隔离](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/multi-agent-context-isolation.md)。

一句话概括：OpenClaw 在这里展示的不是功能清单，而是一套把成本、时延与故障都显式定价的工程选择；凡是没有被定价的部分（结论正确性、Skill 选择质量），就是它留给上层评测与人工复核的空间。

## 实践启示

- **Skill 菜单注入（非全量）是 Token 优化的关键**：只注入摘要信息（name/description/location），Agent 按需读取完整 SKILL.md——这是 OpenClaw 处理 50+ Skill 的高效机制
- **子 Agent 的 spill 能力比执行更重要**：steer 重定向和推送式结果返回是 Agent 编排的核心——不是创建了多少子 Agent，而是能灵活地中断/重定向/并行处理结果
- **Auth 熔断器可扩展到任何 API 调用场景**：健康追踪+自动轮换+熔断保护+渐进恢复的模式可迁移到其他多后端服务架构
- **工具权限隔离的设计模式**：两级拒绝列表（always 禁止 + leaf 节点额外禁止）+ spawnDepth 限制——防止 Agent 无限递归避免资源耗尽
- **Skill 上限配置是系统工程**：5 个 SkillsLimitsConfig 参数的精调是 Agent 生产成本管理的关键

→ [原文存档](https://mp.weixin.qq.com/s/7RWpW-wZuDmKuexf8smGGQ)

---
## 关联
- 相关概念: [Harness Engineering](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/harness-engineering-framework.md)

---

