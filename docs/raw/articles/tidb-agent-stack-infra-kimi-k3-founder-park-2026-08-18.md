---
title: "Agent 基建不是设计出来的，是被 Kimi K3 和一堆应用公司卷出来的"
source_url: https://mp.weixin.qq.com/s/H0UwPJ_eSiR7zO0mX_QG0w
source: wechat
author: Founder Park（整理 TiDB 团队，作者唐刘 TiDB 一号员工/CAIO）
publish_date: 2026-08-18
ingested: 2026-08-18
type: raw-article
tags: [agent, infra, database, tidb, agent-stack, state, filesystem, memory]
sha256: 3e73d8c13c78f8522331d19563b3856efb4515dac4e1ffc30a9a22c19cc2accc
review_value: 7
review_confidence: 7
---
# Agent 基建不是设计出来的，是被 Kimi K3 和一堆应用公司卷出来的

> Founder Park 整理 TiDB 团队（唐刘）近两年服务 AI 团队的实践。TiDB 从分布式数据库转身为 Kimi/Dify 背后的 Agent 基建服务商（Memory/Filesystem/Lake），拼出 TiDB Agent Stack。

## Kimi Agent 规模化的两个基建难题
- **Kimi 建站（K3）**：用户一句话得到前端+后端+数据库应用，平台需承载上千万个站点，多数平时无流量但用户可能几个月后回来。给每站点常驻数据库空闲费用高；多站点塞进一个 PostgreSQL 用 Schema 隔离，到万级规模就扛不住。
  - 解法：Agent 与物理存储间加虚拟数据库层。无请求释放计算资源，极端情况整个平台只需一个常驻连接网关；Agent 要新库时从预热池 1 秒拿就绪实例。无流量站点不产生成本。
- **Kimi Code**：Agent 进仓库改文件/跑测试/生成 patch，复杂任务跨多 session。Sandbox 可随时拉起销毁，但代码仓库/未提交修改/Git 对象/任务进度要留下。用 TiDB Cloud Filesystem 把「执行」和「状态」拆开：Sandbox 干活，Workspace 记住；新 Sandbox 挂同一工作区从存档点继续。

## 数据库服务对象的变化
- 最早：AI 应用扛用户增长容量（分库分表→运维）。头部 LLM 公司 C 端十万到亿级。
- Dify：多租户容器收敛进 TiDB Cloud，成本降 80%，运维负担降 90%。希望工作空间对应独立数据空间，数据库生命周期进入产品逻辑。
- 头部通用 Agent 平台：「需要至少 100 万个数据库」，每个 Agent 任务都可能建库。今天 TiDB Cloud 新建集群超 90% 是 AI Agent 直接创建。
- 结论：用户/租户对应稳定数据空间的假设失效，Agent 和任务成为资源分配与隔离新粒度。

## 数据库之外的 Agent 状态
- AI Workforce 平台：上下文压缩丢状态、session 切换丢信息、多 Agent 记忆不共享 → 需要跨 session 持久可检索记忆。推动 TiDB Cloud Memory（「数据库存数据，记忆存这个 Agent 是谁」）。
- AI 硬件公司：音频/转录/纪要/笔记分散，内容/元数据/向量/权限/版本各一套 → 收回来一个文件/对象/系统。
- Kimi Coding Agent：Git 不仅是文件更是状态。产品边界：执行环境临时弹性，任务状态进入独立持久层（应用数据/记忆/文件/Git 工作区/checkpoint/操作记录）。Agent 逐渐成为 full-stack agent。

## Agent 进真实业务要可追溯可解释
- Clink：面向 Agent 的支付基础设施，明确授权和风控下完成充值/消费/订阅，记录身份/授权/资金流向/执行结果。收敛到 TiDB Cloud Lake 后物化视图实时 Join 13 张业务表，核心指标约一周上线。
- 一个 Agent 产品至少回答六问；Web 时代计算单位用户，移动时代会话，Agent 时代计算单位是 Agent 自己——带任务/记忆/文件/权限在平台上「生活」。

## 三个可落地判断
1. **先算空闲成本再谈规模**：Agent 业务长尾负载，规模化的第一性原理是不干活成本趋近零、要干活秒级就绪。
2. **从第一天就拆开执行和状态**：早定义哪些可重建（Sandbox），哪些必须持久（数据/记忆/文件/工作区/checkpoint/审计）。
3. **让 Agent 少跨几次系统边界**：每加一个外部系统多一套接口/身份/格式/错误。标准：Agent 能否看到稳定数据语义、权限能否贯通、失败能否找到原因恢复。

## TiDB Agent Stack
- Starter 承接应用数据（秒级就绪/scale-to-zero/SQL+向量+JSON 统一查询）；Memory 保存可检索长期记忆；Filesystem 保存文件/Git 工作区/checkpoint；Lake 统一交易与分析语义。定位「Unified Storage Layer for Agents」（Agent 的统一状态底座）。
- 结论：AI 不会消除基础设施，AI 会让基础设施再次显现。
