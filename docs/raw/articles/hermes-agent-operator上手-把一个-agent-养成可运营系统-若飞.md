---
title: "Hermes Agent Operator 上手：把一个 Agent 养成可运营系统"
source_url: "https://mp.weixin.qq.com/s/R_xE3u5OrDKFJ1Eal9GqcQ"
author: "若飞"
feed_name: "架构师（JiaGouX）"
created: 2026-05-20
tags:
  - hermes
  - agent
  - harness-engineering
  - operator
  - wechat
type: article
sha256: d6ceb1e59e2359d0270b1e8b7d546e942f3325f6a7c2480be048363b64f49812
---

# Hermes Agent Operator 上手：把一个 Agent 养成可运营系统

> 来源：[架构师（JiaGouX）](https://mp.weixin.qq.com/s/R_xE3u5OrDKFJ1Eal9GqcQ)｜作者：若飞｜2026-05-20

## 核心主旨

本文是 Shann³《How to Become a Hermes Agent Operator》的中文解读与本土化补充。核心命题是：**如何把一个 Agent 从聊天窗口里搬出来，养成一个能长期跑、能交接、能撤权、能恢复的工作系统**。

## 控制面 vs. 运行面

Hermes Agent 的两个核心目录：

| 目录 | 定位 |
|------|------|
| `/root/vps-agents` | 控制室：文档、规则、Runbook、架构 |
| `/srv/<agent-name>/data` | 运行时：密钥、记忆、Skills、会话、cron |

**关键洞察**：分开这两个目录，就是 Agent 的"控制面"和"运行面"。这是"个人玩具"和"工程资产"的分界线。

## Agent Control Room — 5 个核心文件

Shann 的控制室方案，核心是 5 个文件：

### 1. inventory.md — 身份注册表
- 这个 Agent 负责什么、不负责什么
- 人从哪里找它
- 它能使用哪些工具
- 它依赖哪些外部系统
- 谁批准高风险动作

### 2. env-map.md — 凭据映射（不放密钥值）
- 密钥名称、提供方、作用域
- 存放位置、轮换周期、撤销步骤

### 3. runbook.md — 恢复手册
- 怎么启动、停止、看日志、重放失败任务
- 怎么撤销最近一次变更
- 怎么判断它可以恢复服务

### 4. backup.md — 状态备份
- 哪些目录要备份、哪些文件不能提交
- 备份频率、恢复步骤、有没有演练过

### 5. security.md — 安全边界
- 哪些工具默认允许、哪些动作必须审批
- 哪些输入是不可信来源
- Memory 和 Skill 的写入规则
- cron 任务 owner、日志保留多久

## Agent 三组件：brain / personality / skillset

| 组件 | 文件 | 作用 |
|------|------|------|
| brain | `MEMORY.md`、`USER.md` | 稳定事实、用户偏好、业务上下文 |
| personality | `SOUL.md` | 输出风格、沟通习惯、角色边界 |
| skillset | `skills/` | 反复出现的流程、动作和工具用法 |

**顺序建议**：新手不要第一天就写 Skills。先让 Agent 跑真实任务，跑错了就纠它，让 Harness 记录纠偏，再慢慢沉淀成 Skill。流程一开始就写得太满，写出来的多半是脑补的流程。

## 三条访问路径（优于"四级演进"）

同一套 Agent 系统，对外有三条访问路径：

| 路径 | 场景 |
|------|------|
| **direct path** | 起步阶段最稳——知道是 SEO 就直接找 SEO Agent，路径短、状态少、责任清楚 |
| **control path** | 管理面——改系统、看系统、恢复系统，不跑业务 |
| **orchestrated path** | 等手里已有多个专职 Agent，且经常遇到"这件事归谁""多结果怎么合并"，再考虑编排层 |

> **什么时候才值得拆新 Agent**：只有三类情况值得拆新 Agent——①有独立凭据，②有独立长期记忆，③有稳定流程且反复出现。否则都先别拆。

## SEO Agent 案例：强顺序链路不宜硬拆容器

Shann 的 SEO Agent 案例（21步，三段：research/production/distribution）的架构启示：

- 三组 sub-agent 都塞进**同一个 Docker 容器**，共享 env、memory、tools 和文件系统
- 原因：SEO 是强顺序链路——研究阶段的意图判断影响 brief，brief 影响 outline，outline 影响正文，正文又反向影响配图、QA、分发和监控
- 硬拆到三个隔离容器里，状态每搬一次就多一次掉上下文、掉约束的机会

**原则**：别按岗位名拆，按上下文边界拆。上下文不是聊天记录，是工作集。

## 四道门：原型 → 生产

生产级 Agent 不是从零写出来的，是一点点养出来的，对应四道门：

| 门 | 内容 |
|----|------|
| 第一道门 | 在主 Agent 里原型化——用真实语言描述流程，让它试一遍，把错暴露出来 |
| 第二道门 | 用真实任务跑 2-3 次——盯纠偏，不只盯"跑通" |
| 第三道门 | 拉到独立工作区收紧——整理提示、固定路由、补错误处理、决定哪些沉淀成 Skill |
| 第四道门 | 稳定后上 VPS/Docker/cron——至少跑过一周真实任务，且失败时能停得住、结果能复盘、状态能恢复 |

> **cron 只是把一次错误变成了周期性错误。** 少了目标、预算、验证、停止条件，跑得越久，攒下的问题越多。

## 7 天最小化落地计划

| 天 | 任务 |
|----|------|
| 第1天 | 挑一个重复任务（失败成本可控、输入输出清楚） |
| 第2天 | 建控制室：inventory.md、env-map.md、runbook.md、security.md |
| 第3天 | 写稳定上下文：业务事实、输出标准、禁用动作、审批边界 |
| 第4-5天 | 用真实任务跑三次，每次留 task-result.md |
| 第6天 | 回头看要不要写 Skill（只有流程出现稳定形状才沉淀） |
| 第7天 | 决定要不要升级（稳定 + 确实需要独立凭据/记忆/职责 → 拆专职 Agent） |

## 安全：延迟触发型 Prompt Injection

常驻 Agent 的安全问题不只是"别把 API Key 喂给模型"。Hermes 官方已有一层：危险命令审批、消息网关用户 allowlist、配对码、Docker 隔离、敏感文件写入限制。

**更隐蔽的风险**：不可信输入不一定当场作恶，可能先安静地写进记忆、Skill、cron、文件补丁，等几天后被另一条任务触发——类似"延迟触发的提示注入"：

- 一封邮件诱导 Agent 把错误规则记进 Memory
- 一段网页内容诱导改掉某个 Skill
- 一条聊天消息诱导创建定时任务
- 等执行时攻击者早不在现场

**应对**：上自动化之前先评估渗透半径——边界清楚，Agent 才敢多做一点；边界不清，越自动越心虚。

## 模型路由原则

Shann 并不把所有任务丢给同一模型：

- 创意、文案、语气、hook、内容草稿 → 更擅长写作和品味的模型
- 编码、规划、多步骤流程、浏览器自动化、抓取 → 更适合结构化执行的模型

**最强模型留给两个位置**：编排 Agent + 需要做判断和取舍的关键 Agent。便宜模型接批量研究、初稿、格式转换、风险可控的重复处理。

## 参考来源

- Shann³《How to Become a Hermes Agent Operator》：https://x.com/shannholmberg/status/2055335043904492011
- Hermes Agent 官方仓库：https://github.com/NousResearch/hermes-agent
- Hermes Agent 官方文档：https://hermes-agent.nousresearch.com/docs
- Shann 的 Agent Control Room 模板：https://github.com/shannhk/hermes-agent-control-room
- arXiv: Sleeper Channels and Provenance Gates: https://arxiv.org/abs/2605.13471
- Geoffrey Huntley: everything is a ralph loop：https://ghuntley.com/loop/

