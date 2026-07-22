---
title: "阿里云 AgentTeams 解读：当 Agent 开始真正在企业里干活"
source_url: "https://mp.weixin.qq.com/s/oM3V-URazBmlLBeJQR3O_A"
source_site: "mp.weixin.qq.com"
source_author: "付宇轩(计缘)、邵丹(营火)｜阿里云云原生"
ingested: "2026-07-14"
sha256: "5823666ae3dc3d7d9f889a23fd3a16233c94d47319b7d50eae58321b73e6c0fb"
type: "raw-article"
tags: [agent, multi-agent, enterprise, alibaba-cloud, agent-teams, qwenpaw]
status: "ingested"
---

# 阿里云 AgentTeams 解读：当 Agent 开始真正在企业里干活

> 阿里云云原生团队推出的企业级多 Agent 平台。核心命题不是「一次任务怎么并行跑快」，而是「一个 Agent 组织怎么长期运转」。

## 四层落地架构

从上到下四层 + 贯穿四层的观测治理中台：

1. **入口层** — 原生 AgentTeams 客户端、钉钉/飞书/企业微信等 IM 集成、自研 Web HTTP 服务化接入
2. **Agent Identity** — 对接企业 IdP/SSO，为 Agent 工作负载签发身份，把用户身份透传到 Agent，每步操作可归属到人
3. **Agent Team 组织** — 按职能编成研发/客服/数据分析/运营等团队，由 TL Agent 调度，底层引擎热插拔
4. **统一 AI 资产管理** — 模型、Skill、MCP Server、Worker Agent 模板集中管理，BYOC 自主可控

右侧贯穿四层：观测、度量、治理中台（Token 消耗、Prompt 分析、效果审计）。

## 四道安全防线（零信任 Agent 管理底座）

**第一道：AI 网关（零凭证持有）** — 所有 LLM 调用和外部密钥统一收归网关加密托管，Agent 本身不持任何凭证。叠加细粒度风控：Agent 身份认证 + Skill/MCP 指令级拦截。对接钉钉、飞书、企业微信、RAM、Entra ID、Okta 等 IdP。

**第二道：Sandbox 沙箱（运行时隔离）** — 每个 Agent 跑在独立沙箱，实例/网络/存储三维物理隔离。

**第三道：通信安全** — 端到端加密协议传输，Room 机制保证信息透明、审计可溯源。

**第四道：Skill 市场（供应链安全）** — 所有 Skill/MCP 须安全扫描审核后上架，per-consumer ACL 最小权限授权。

> 太多人把 Agent 当成「更聪明的脚本」。安全不是锦上添花，是生死线。

## 三层协作架构

| 层级 | 角色 | 类比 |
|------|------|------|
| Manager Agent | 全局监管 + 任务拆解 | CEO |
| Team Leader Agent | 具体团队调度分配 | VP / TL |
| Worker Agent | 底层执行 | 一线员工 |

与 Claude Managed Agents（CMA）的关键区别：
- CMA 只有两层（Lead + Teammates），AgentTeams 多了一层 TL，解决管理幅度问题
- CMA 的 Lead 是固定主会话不可转移，AgentTeams 的 Manager 和 TL 都是独立实例可灵活调整
- CMA 的 Subagent 链对应 AgentTeams 里 Worker 进程内的 Subagent 链（延迟敏感的连贯流程）

### 引擎热插拔（协议层解耦）

底层引擎可混编：同一 Team 内 Worker A 跑 QwenPaw，Worker B 纳管 OpenClaw，Worker C 纳管 Claude Code，Worker D 是客户自研 Agent。类比 Kubernetes 的 CRI —— 把编排层和引擎层切开，企业不会被单一技术栈锁死。

## Sandbox 沙箱运行时

基于 ACS Sandbox，**Session 亲和路由** — 单 Session 单 Sandbox，资源/网络/存储三维隔离。

**弹性伸缩三种方式**：
1. **Session 级扩并发** — 多人同时交互拉起多个独立 Sandbox
2. **Team 级多副本分流** — 多个相同 Team 副本负载均衡
3. **Subagent 同进程编排压时延** — 一个 Worker 内建多个 Subagent，零网络跳数

**深休眠机制** — 无请求时 Sandbox 进入深休眠（快照保留现场，不产生费用），有请求秒级拉起。

## Agent 持续进化（AgentLoop 双飞轮）

- **左飞轮**：AgentTeams 多 Agent 协作底座，沉淀执行轨迹、工具调用日志、协作记录、成功/失败案例
- **右飞轮**：AgentLoop 调优引擎，做数据清洗、自动评估、SFT/RLHF 训练，反哺 Prompt 优化、模型更新、技能库优化

核心链路：**发现**（监控高频失败 Task，沉淀 Bad Case）→ **对齐**（构建企业专属 DPO/RLHF 训练集）→ **进化**（自动重构 Prompt）

> 真正的护城河不是你用了哪个模型，而是你积累了多少属于自己业务的 Agent 协作数据。

## 关键设计哲学

- Agent 不是工具，是员工
- 用基础设施的思路而不是脚本的思路对待 Agent
- 声明式管理：不是写脚本来编排 Agent，而是声明「我要一个研发团队」，平台 Reconcile 到期望状态
- 容器是确定性的，Agent 是概率性的，所以在 K8s 范式之上还加了 Heartbeat、阻塞上报、HITL、全链路可观测
