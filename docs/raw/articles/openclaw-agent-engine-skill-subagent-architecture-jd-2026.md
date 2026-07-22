---
title: "OpenClaw Agent 引擎/Skill/SubAgent 架构深度解析：多源 Skill 加载、子 Agent steered 重定向、五层容错"
source_url: "https://mp.weixin.qq.com/s/7RWpW-wZuDmKuexf8smGGQ"
author: "京东技术 - OpenClaw 源码分析"
source: "京东技术"
ingested: 2026-07-01
sha256: placeholder
---

# OpenClaw Agent 引擎与 Skill/SubAgent 架构深度解析

## 1. 为什么需要 OpenClaw

OpenClaw 解决三大痛点：多渠道消息统一处理（内建十余种渠道+extensions 扩展）、长时运行 Agent 挑战（Gateway 模式+多会话状态管理+LLM 提供商故障自动恢复+API Key 轮换）、灵活知识扩展（Skill 机制）。

与 pi-mono 的关系：pi-mono 提供单用户/单 session/请求-响应模式的 Agent 引擎，OpenClaw 在其上构建多用户/多 session/多渠道的生产级扩展。

## 2. Agent 核心架构

### 入口与编排
- 两个入口（CLI 和 Gateway/API）走同一套流程
- 准备：session → model 选择 → skills 加载
- 容错保护层：runWithModelFallback（多个 Auth Profile 轮换）

### ReAct 循环
src/agents/pi-embedded-runner/run.ts：Reasoning → Acting → Observation 直到完成或达到 MAX_RUN_LOOP_ITERATIONS（根据可用 Auth Profile 数量动态缩放）。

### 单次执行尝试
准备 workspace → 加载 Skill entries → 构建 System Prompt（Skill 菜单+工具说明+身份信息）→ 创建工具集 → 调用 pi-coding-agent → 处理工具调用结果/流式输出/上下文压缩

## 3. Skill 机制

### Skill 是什么
以 SKILL.md 文件形式存在的知识/指令包，告诉 Agent "如何做某类事情"。项目内置约 50+ 个 Skill。

### 多源加载（6 个来源按优先级合并）
高优先级覆盖低优先级同名 Skill。

### 内置 Skill 目录解析
按顺序查找：环境变量 OPENCLAW_BUNDLED_SKILLS_DIR → 可执行文件同级 skills/ → 包根目录向上查找包含 SKILL.md 的 skills 目录。

### 插件 Skill
每个插件通过 openclaw.plugin.json 的 skills 字段声明，安全检查确保路径在插件根目录内。

### 过滤与资格判断
shouldIncludeSkill() 多层过滤：配置禁用/内置白名单/运行时资格（OS 兼容性+必要二进制工具+必要环境变量）。

### 数量限制
SkillsLimitsConfig：maxCandidatesPerRoot/maxSkillsLoadedPerSource/maxSkillsInPrompt/maxSkillsPromptChars/maxSkillFileBytes。

### 菜单注入（System Prompt）
所有符合条件的 Skill 的摘要信息（name/description/location）注入到 System Prompt，非完整内容。Agent 自主选择 Skill，每次最多选择一个（never read more than one skill up front）。

### SkillSnapshot
buildWorkspaceSkillSnapshot() 将加载结果封装为 SkillSnapshot（prompt/skills/skillFilter/resolvedSkills/version）。子 Agent 可复用父 Agent 的 SkillSnapshot。

## 4. 子 Agent 架构

### 创建机制
sessions_spawn 工具。SpawnSubagentParams：task/label/agentId/model/thinking/runTimeoutSeconds/thread/mode/cleanup/sandbox/expectsCompletionMessage/attachments。

### 创建模式
- mode: run（默认）：一次性执行
- mode: session：持久会话，可多次交互

### 创建流程
校验参数 → 深度检查（spawnDepth < maxSpawnDepth）→ 子 Agent 数量检查（maxChildren）→ 创建 child session → 注册运行 → 异步执行 → 触发 Hook。

### 生命周期
subagent-registry.ts 维护 Map<string, SubagentRunRecord>。API：registerSubagentRun/listSubagentRunsForRequester/countActiveRunsForSession/markSubagentRunTerminated/releaseSubagentRun。

五种终止原因：complete/error/killed/session-reset/session-delete。注册表可持久化到磁盘，重启后从 restoreSubagentRunsFromDisk() 恢复。

### 推送式结果返回
runSubagentAnnounceFlow() 逐个推送结果。优势：提前处理/提前终止/渐进式反馈/部分失败处理/精细超时。

### steer 重定向（核心容错机制）
当子 Agent 方向偏离或卡住时，主 Agent 通过 steer 重新指挥：中断当前工作（abortEmbeddedPiRun）→ 清空队列 → 等待停止 → 发送新指令 → 重新开始。

## 5. Skill 与子 Agent 协作

子 Agent 不是由主 Agent 指定 Skill，而是自己加载并选择。通过 agents.list[].skills 配置限制 Agent 的 Skill 范围。

编排型 Skill（如 OpenProse）指导 Agent 创建子 Agent 执行 workflow。

Token 成本考量：为子 Agent 配置更便宜的模型，主 Agent 保留高质量模型。

## 6. 容错机制

### 错误分类与识别
来自 20+ LLM 提供商的不同错误格式统一标准化。

### 认证熔断器
多个 API Key/Auth Profile → 健康追踪 → 自动轮换 → 熔断保护 → 渐进恢复。run.ts 中 advanceAuthProfile()。

### 模型回退
主模型 → 备选模型 1 → 备选模型 2 → 报告错误。回退链跨提供商（Anthropic→OpenAI→Google）。

### 上下文恢复
对话历史过长时自动压缩，最多尝试 3 次 compaction，仍溢出则截断工具结果。

### 智能重试
指数退避+抖动。OVERLOAD_FAILOVER_BACKOFF_POLICY：initialMs=250, maxMs=1_500, factor=2, jitter=0.2。DEFAULT_RETRY_CONFIG：attempts=3。

### 五层防御
第 1 层：错误分类 → 第 2 层：智能重试 → 第 3 层：Auth 轮换 → 第 4 层：模型回退 → 第 5 层：上下文恢复

## 7. 工具系统

### 四类工具
文件工具/命令执行工具/消息与频道工具/Agent 管理工具。

### 权限策略
两级拒绝列表：所有子 Agent 始终禁止的工具（gateway/agents_list/cron/memory_search 等）+ 叶子节点额外禁止的工具（subagents/sessions_spawn 等）。
叶子节点判断：spawnDepth >= maxSpawnDepth 时不能再创建子 Agent。

### 自定义工具扩展
插件可通过 openclaw.plugin.json 注册自定义工具，遵循统一接口（label/name/description/parameters/execute）。
