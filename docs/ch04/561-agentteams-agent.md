# 阿里云 AgentTeams 企业级多 Agent 平台

## Ch04.561 阿里云 AgentTeams 企业级多 Agent 平台

> 📊 Level ⭐⭐ | 4.1KB | `entities/alibaba-cloud-agentteams-enterprise-multi-agent.md`

# 阿里云 AgentTeams 企业级多 Agent 平台

> 阿里云云原生团队推出的企业级多 Agent 协作平台，核心命题不是「一次任务怎么并行跑快」，而是「一个 Agent 组织怎么长期运转」。与 Claude Managed Agents 的设计哲学形成对照。

## 四层落地架构

1. **入口层** — 原生客户端、钉钉/飞书/企业微信 IM 集成、HTTP 服务化（不逼员工换工具）
2. **Agent Identity** — 对接企业 IdP/SSO，Agent 工作负载签发身份，操作可归属到人
3. **Agent Team** — 按职能编队（研发/客服/数据分析等），TL Agent 调度，引擎热插拔
4. **统一 AI 资产管理** — 模型/Skill/MCP/Worker 模板集中管理，BYOC 自主可控

贯穿四层：观测、度量、治理中台（Token 消耗、Prompt 分析、效果审计）。

## 四道安全防线（零信任 Agent 管理底座）

这是 AgentTeams 与市面上大多数多 Agent 框架的最大差异所在：

1. **AI 网关（零凭证持有）** — LLM 调用和密钥统一网关加密托管，Agent 零明文持有凭证；身份认证 + Skill/MCP 指令级拦截
2. **Sandbox 沙箱** — 实例/网络/存储三维物理隔离，爆炸半径锁死
3. **通信安全** — 端到端加密 + Room 机制审计可溯源
4. **Skill 市场** — 安全扫描审核上架 + per-consumer ACL 最小权限授权

## 三层协作架构

| 层级 | 职责 | 类比 |
|------|------|------|
| Manager Agent | 全局监管 + 任务拆解 | CEO |
| Team Leader Agent | 团队调度分配 | VP/TL |
| Worker Agent | 底层执行 | 一线员工 |

与 [Agent Harness 6 种运行时模式](../ch05/039-agent-harness.html) 中提到的分层委托模式一致，但 AgentTeams 强调 TL 层解决管理幅度问题。

与 Claude Managed Agents（CMA）的关键区别：CMA 只有两层（Lead + Teammates），Lead 不可转移；AgentTeams 的 Manager/TL 均为独立实例可灵活调整。

### 引擎热插拔（协议层解耦）

底层引擎可混编——QwenPaw、OpenClaw、Claude Code 可共存于同一 Team。类比 Kubernetes CRI：编排层与引擎层解耦，企业不会被单一技术栈锁死。

## Sandbox 沙箱运行时

基于 ACS Sandbox，单 Session 单 Sandbox，三维隔离 + 三种弹性伸缩方式：

1. **Session 级扩并发** — 多人交互拉起多个独立 Sandbox
2. **Team 级多副本分流** — 多实例负载均衡
3. **Subagent 同进程编排** — 一个 Worker 内建多个 Subagent 零网络跳数

**深休眠机制**：无请求时快照保留现场不产生费用，有请求秒级拉起。

## Agent 持续进化（AgentLoop 双飞轮）

- **左飞轮**：AgentTeams 协作底座沉淀执行轨迹和协作数据
- **右飞轮**：AgentLoop 调优引擎做清洗、评估、SFT/RLHF 训练

核心链路：**发现**（高频失败 Task）→ **对齐**（企业专属 DPO/RLHF）→ **进化**（Prompt/模型/Skill 优化）

> 真正的护城河不是你用了哪个模型，而是你积累了多少属于自己业务的 Agent 协作数据。

## 设计哲学

- Agent 不是工具，是员工
- 用基础设施思路而非脚本思路对待 Agent
- 声明式管理（`agentteams apply`），类比 `kubectl apply`
- 容器确定性 vs Agent 概率性 → 额外加 Heartbeat/阻塞上报/HITL/全链路可观测

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/alibaba-cloud-agentteams-enterprise-multi-agent.md)

---

