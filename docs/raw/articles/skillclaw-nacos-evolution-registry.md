---
source_url: https://mp.weixin.qq.com/s/8rvfRULBztdhzmMycTxMAA
title: "SkillClaw × Nacos：从一次 Agent 会话到可治理 Skill Registry 的自动演化闭环"
source: "阿里云云原生"
ingested: 2026-06-01
sha256: a9ea941c663e656a6065f2dfb90ed9047e61c61296481c3baa4a733f59f2d35e
---

# SkillClaw × Nacos：从一次 Agent 会话到可治理 Skill Registry 的自动演化闭环

**作者：** 墨松
**发布日期：** 2026年6月1日

## 摘要

介绍 SkillClaw（高德技术团队提出的 Skill 自动演化框架）与 Nacos AI Registry 联合构建的闭环：SkillClaw 从真实 Agent 会话中提炼候选 Skill，Nacos 承接 draft→review→online 的治理流程、版本标签分发、审计回滚。形成从 Memory 到 Skill Registry 的完整演化闭环。

## 内容

## 产生之困 + 共享之困

**产生之困：** Agent 在真实任务中沉淀的经验难以从"一次个人成功实践"转化为可复用 Skill。经验停留在本地 memory，没有形成团队资产。

**共享之困：** 即使提炼成 Skill，如何被团队发现、使用、版本管理、审核、回滚？Skill 只是本地文件就无法团队级复用。

## SkillClaw 与 Nacos 各解决什么问题

**SkillClaw（高德技术）**：Agent 运行时框架，通过本地 proxy 接管模型调用，注入 Skill 目录，记录 Agent 执行过程（会话 turn、工具调用、结果、错误、Skill 命中）。Evolve Server 基于数据判断：是否有可复用经验？已有 Skill 需改进？应生成新 Skill？

核心能力：从真实使用数据中发现可复用模式→沉淀 Skill；持续改进已有 Skill；为不同 Agent 客户端提供统一 Skill 生成/同步入口。

**Nacos AI Registry**：将 Skill 作为 AI Resource 注册管理，有版本、标签，可处于 draft/reviewing/online 状态，支持 Pipeline 审核、label 分发、审计、Trace。

## 闭环运转：SkillClaw × Nacos

联合共建工作：

1. **Registry 后端对接：** SkillClaw 内置 Nacos 作为 Skill Registry 后端，本地候选 Skill 提交到 Nacos
2. **生命周期治理：** 候选 Skill 默认进入 Nacos draft→review→online 治理流程
3. **版本与标签分发：** Nacos label 管理 Skill 版本，SkillClaw 客户端按标签（如 `latest`）拉取同步到本地

### 治理保障

1. SkillClaw 生成候选 Skill，不做最终发布决策
2. Nacos 承接 draft→review→online 治理流程，以及 label、审计、回滚、上下线
3. Agent 运行时只读取 Skill，不持有发布和删除权限
4. 敏感信息、危险命令、越权工具等检查，通过 Nacos Pipeline 和 `skill-scanner` 插件接入

### QuickStart 流程（7 步）

1. 安装部署 Nacos
2. 启动 SkillClaw Proxy 和 Evolver（配置 LLM、Nacos 连接、会话目录）
3. 启动 Agent 并对话（通过多次对话教会 Agent 特定格式/流程）
4. 查看 Evolver 生成结果（日志中查找 uploaded skill 确认）
5. 登录 Nacos 查看 Skill Registry（验收候选 Skill 列表）
6. 新会话测试 Skill 复用（一句话调用已注册 Skill）
7. 停止并恢复 Agent 配置

### 落地场景

- 新人接手老项目：资深同学带 Agent 跑过需求后，SkillClaw 沉淀实操经验为 Skill，Nacos 审核后发给团队
- 反复处理同类线上问题：排查过程中 SkillClaw 提炼排障 Skill，Nacos 审核发布
- 平台能力推广：平台同学完成接入后 SkillClaw 提炼接入步骤，Nacos 按版本标签分发
- 统一 Agent 工作方式：SkillClaw 从多人真实使用中提炼稳定工作模式，Nacos 统一管理分发
- 一线支持沉淀高频问题：支持类 Skill 审核发布，减少重复答疑

### 未来方向

- 打通生成链路与会话追踪：每次 Skill 版本变更记录基于哪次会话、验证得分、发布原因
- 将自动演化从 Skill 扩展到 AgentSpec：模型配置、Skill 集合、Prompt 引用、安全策略都从真实运行中持续生长
