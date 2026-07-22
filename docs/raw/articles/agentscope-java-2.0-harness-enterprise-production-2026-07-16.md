---
source_url: https://mp.weixin.qq.com/s/jIWU-aYtBFbRJSQxXVXaDQ
ingested: 2026-07-16
sha256: a8266c7efff13c12110b0f9686f52dd32bd0d2038a4d2150f7befb97d39679ac
source_published: 2026-07-16
title: "AgentScope 2.0 生产可用，企业级 Harness 底座全解析！"
author: 刘军（陆龟）
feed_name: 阿里云云原生
---

> AgentScope Java 2.0 核心思路：基于 ReActAgent 推理内核，增加 Harness 工程化层。开发者可继续使用轻量 ReAct 循环，也可按需启用 Workspace、持久记忆、Session、Sandbox、Skill、Subagent 等能力。

## AgentScope 生态全景

框架层（蓝色）：Python/Java/TypeScript/Go 四语言实现 → Agent Loop（Reasoning/Tool Call/Event/Message）
- 模型侧：DeepSeek、OpenAI、Qwen 兼容
- 观测：OpenTelemetry 埋点 → LangFuse / ARMS
- 网关：Higress（模型代理/MCP 代理）、Nacos（Skill/MCP 市场管理）
- 上层产品：QwenPaw、AgentTeams

## ReActAgent 内核与核心组件

底层 ReAct 推理循环不变，2.0 新增：
- **Permission** — 工具调用权限管控
- **Middleware** — 替代旧 Hook，优化事件传递和中间介入

## 1.0→2.0 迁移

- 绿色（兼容）：大部分 API 兼容，Hook 标记为废弃但保留
- 黄色（必须改）：Agent State 引入，调用入口加 Runtime Context（User/Session 隔离）
- 红色（可延后）：废弃 API 将在 2.1 移除

## Harness 核心设计

### Workspace — Agent 进化的 Source of Truth

逻辑概念，包含两类资产：
- **静态资产**：AGENTS.md、Skills、Sub-Agent（随镜像打包）
- **运行时数据**：Session 状态、Task 状态、MEMORY.md（运行时生成）

多租户隔离：一个 Agent → 一个 Workspace → 按 User/Session/Agent 维度逻辑隔离。

### 抽象文件系统

Workspace 物理存储通过 Abstract File System 接口解耦：
- **本地 On-premise**：操作磁盘（单机）
- **数据库/OSS**：MySQL/Redis/OSS（多实例共享）
- **Sandbox**：完整隔离（工具执行环境）

### 内置上下文压缩策略（四道防线）

1. 工具结果截取 + 落盘（超阈值后给文件引用路径）
2. 工具入参截断
3. 过往消息压缩（保留最近 N 条）
4. **不可压缩内容**：任务规划、异步子 Agent 状态、工具权限授权记录等必须在全局保留

### 双层长期记忆

- **每日流文件**：会话压缩前 Flush 分拣 → 写入当天专属文件
- **全局 MEMORY.md**：后台任务定期扫描当日记忆 → 蒸馏为全局 MEMORY.md（每次请求时注入 System Prompt）
- 配套工具：Memory Search、Memory Get、Session Search
- 所有 Prompt 可定制

### 子智能体编排

- **同步子 Agent**：主 Agent 等待完成
- **异步子 Agent**：支持完成后主动通知回主 Agent
- **远程子 Agent**：远端 Agent 调用
- **Task List Toolkit**：主 Agent 查看所有子 Agent 状态
- **直接与子 Agent 对话**：用户可切到子 Agent 引导任务
- 上下文共享策略、事件透传标记、权限继承均已设计

### Sandbox 管理

工具执行放在沙箱中，有完整生命周期管理系统。

### Skills

- **四层注册中心**：对接 Nacos 等中心化管理系统，自动加载
- **Workspace 细粒度隔离**：不同用户不同 Skill
- **沙箱内执行**：含脚本和资源文件的 Skill 投影到 Sandbox 中闭环执行

### 计划模式

内置 Plan 配套工具（PlanEnter/PlanExit），流程：
1. 开启 Plan → Agent 生成计划
2. 切回 Agent Mode → 按计划执行
3. 支持自主识别模式（Agent 根据任务自动切换）
4. Permission 控制：切换模式时弹窗征求用户同意

### Channel：消息平台 → Gateway → Agent

原生支持对接企业 IM 系统。

## 企业级应用示例

1. **个人助手**：Workspace 绑定本地磁盘，单机
2. **多租户 Managed Agent 平台**：零代码 Agent Builder，共享 Agent 但多租户隔离，依赖 Workspace + Abstract File System 分组
3. **数据 Agent 平台**：per-用户进化 + Skill 审批式能力市场
4. **自主编码机器人**：对接 GitLab，每个 Issue/PR 独立 Sandbox，Thread 路由 + 一次性 Docker 容器

## 企业应用覆盖

阿里巴巴集团内：飞猪、淘宝闪购、虎鲸文娱、AIDC、阿里控股、淘天交易、淘天手淘、1688、千问APP、高德、阿里云、蚂蚁国际、蚂蚁全球支付等
开源/云上：金融、交通/物流、消费零售、制造、能源、医疗、教育/政媒、互联网、SaaS、咨询
