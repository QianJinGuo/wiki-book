---
source_url: "https://mp.weixin.qq.com/s/57VtC2cq2sTEWHGRPEqDGA"
ingested: 2026-06-26
sha256: 560f56d6d2cce12e
---

# 从 API 到 AI Agent：阿里云云监控 CLI + Agent Skill 实战

**公众号**: 阿里云云原生 (作者: 陈廷彬颍川) | **发布时间**: 2026-06-14 10:00
**Skill**: [alibabacloud-cms-manage](https://skills.aliyun.com/skills/alibabacloud-cms-manage) | 阿里云云原生 CMS 团队

---

**30秒读懂**: 阿里云云监控 CLI (`aliyun cms2`) 把 CMS (Cloud Monitor Service) 2.0 控制台中的接入、配置、查询、告警、事件等能力统一沉淀为命令行入口;**CMS Agent Skill** 则把这些命令组织成面向 AI Agent 的业务工作流。

过去,运维自动化往往从 API 开始:查文档、拼参数、写脚本、调接口;**现在**,通过云监控 CLI + Agent Skill,这些能力可以被组织成 **AI Agent 可理解、可执行、可校验** 的标准化工作流。

对运维人员来说,它的价值不是"多一个工具",而是让你**用自然语言描述运维目标**,由 AI Agent 完成场景理解、CLI 调用、API 执行和结果校验,将重复、多步骤、易出错的可观测运维操作变成**可确认、可审计、可复用**的自动化流程。

## 为什么需要 CLI+Agent Skill

随着云上业务规模和基础设施持续增长,可观测运维贯穿了**资源接入、指标/日志采集、告警治理、链路排查、根因分析、稳定性运营**的全流程,运维工作量和操作复杂度随之攀升。**AI Agent 凭借强大的语言理解与任务编排能力,正在成为新的运维协作入口**。

但要让 AI Agent **真正进入生产运维闭环**,不能只停留在"理解问题、生成建议或脚本"的阶段,还需要:
- 一套**稳定**的云监控能力执行入口
- **标准化**的领域流程
- **必要**的人工确认
- **可校验**的执行结果

云监控 CLI + Agent Skill 正是面向这一需求构建的能力套件。

## CLI+Skill 的解决方案

阿里云云监控 CLI (`aliyun cms2`) 提供统一、稳定、可审计的能力入口,**CMS Agent Skill** 则把云监控领域的业务语义和操作流程沉淀为 AI Agent 可理解、可执行的工作流。二者配合,AI Agent 可以从"帮我把这个 ACK 集群接入云监控"这样的自然语言指令出发,**自动完成场景识别、参数生成、CLI 调用、API 执行和结果校验**。

### 关键设计原则

- **统一命令树**: CLI 已覆盖 CMS 2.0 控制台中的**接入中心、Prometheus 服务、应用监控、用户体验监控、告警中心、事件中心**等能力。后续将继续覆盖**云拨测、Grafana 大盘**等能力,实现对 CMS 2.0 控制台的完整覆盖。

- **AI Agent 原生适配**:
  - 提供规范、明确、细致的 `--help` 信息,支持 `--show-schema`、`--show-example-body` 等辅助能力,帮助 AI 准确处理各类业务场景
  - 默认使用 `-o text` 输出紧凑 CSV,显著降低 **AI Token 消耗**
  - 通过结构化 JSON 错误码,支持 Agent **根据错误原因自动决策和修复**

- **Skill 驱动**: 配套 Skill 文档沉淀**完整业务工作流**,Agent 无需硬编码即可完成复杂多步操作

## CLI+Skill 工作流程

**最直观的变化是:不再从控制台入口或 API 参数开始操作,而是从一个明确的运维目标开始,由 Agent 按标准流程完成后续执行与校验**。

这条链路的核心理念是"**可控自动化**":
- Agent **不会绕过**运维体系
- Agent **通过统一 CLI 入口**和 **Skill 中沉淀的业务规则**执行操作
- 这样既能减少重复劳动,又能**保留必要的权限、确认和审计边界**

## 安装与配置

### ▍安装 Skill/CLI

打开阿里云 Agent Skills 门户的 `alibabacloud-cms-manage` Skill,按界面引导完成 Skill 安装。

**安装完成后**,AI Agent 使用 Skill 时会自动检测并引导安装或更新阿里云 CLI 及 `cms2` 插件到所需版本,**无需手动处理环境依赖**。

```bash
# 验证 CLI 安装成功
aliyun version
# 验证 cms2 插件可用
aliyun cms2 --help
```

### ▍配置凭证

支持 **AccessKey、STS Token** 等多种凭证类型。

## 5 大实战场景

### 实战场景一(接入中心):ACK 集群可观测接入

**业务场景**: SRE 团队新建了一个 ACK 集群用于部署微服务,需要将集群的节点、Pod、容器等指标接入云监控。

**使用方式**: 在 AI Agent 对话中输入 —

> 帮我看看杭州有哪些容器集群没有可观测能力,帮我接入一下。

Agent 就会自动完成整个接入流程,用户只需在关键节点确认即可。

**AI Agent 7 步流程**:

| 步骤 | Agent 自动执行的操作 |
|------|---------------------|
| 1: 查询容器集群 | 通过云资源中心,查询符合条件的容器集群列表 |
| 2: 已接入实例判断 | 查询实体数据 (EntityStore),过滤掉已接入云监控的实例 |
| 3: 资源验证 | 通过云资源中心查询集群 ID,确认其真实身份、所属账号等信息 |
| 4: 组件选择 | 从接入组件目录中匹配适合 ACK 场景的 Addon (监控组件),获取参数 schema 和工作流模板 |
| 5: 策略创建 | 创建集成策略 (Integration Policy),关联目标 Workspace |
| 6: 组件部署 | 创建 Addon Release,将集群的指标采集接入到 Prometheus 实例 |
| 7: 结果验证 | 检查存储实例、关联大盘和采集 Job 目标,确认数据链路畅通 |

**接入中心常见 prompt 示例**:
- 按资源组接入:"将默认资源组下,北京区域的所有 RDS 接入云监控的 {workspace} 下"
- 按标签接入:"将匹配标签 key= {tagKey}, value={tagValue} 的所有 ECS 接入云监控的 {workspace} 下"
- 跨账号接入:"将 {资源目录成员账号uid} 的上海区域下,所有 AI 网关接入云监控下"

### 实战场景二(告警中心):智能告警规则管理

**业务场景**: SRE 需要为生产环境建立完善的告警体系,以容器服务集群节点为例,配置专业的节点告警规则。

**使用方式**: 典型对话示例 —

> 针对容器的告警有什么建议,然后帮我 apply。

**AI Agent 6 步流程**: 查询现有告警规则 → 查询指标信息 → 生成告警规则配置 → **Dry Run 告警规则** → 创建现有未覆盖的告警规则 → 修改现有不合理的告警规则

**告警中心常见 prompt 示例**:
- 智能分析告警规则:分析现有告警是否配置合理,是否存在告警噪声,不合理就一键修改
- 修改告警规则联系人:将告警规则 {规则id/名称} 的通知对象改为 {联系人}
- 查询告警历史:查询告警规则 {规则id/名称} 的 1 周内的告警历史

### 实战场景三(Prometheus 服务):Prometheus 实例管理与数据查询

**业务场景**: 运维团队需要管理多个 Prometheus 实例,分析监控指标和业务健康状况,并配置 Recording Rule 预聚合高频指标。

**使用方式**:

> 帮我看看杭州有哪些 Prometheus 实例,按工作空间分组展示。

**Agent 核心能力**:
- **Prometheus 实例管理**: 创建、查询、更新、删除 Prometheus 实例,支持按标签、地域过滤
- **Prometheus 聚合视图管理**: 创建、查询、更新、删除 Prometheus 聚合视图
- **Recording Rule 管理**: 创建/删除预聚合规则,管理规则的启停状态

### 实战场景四(应用性能监控 APM):应用监控/AI 可观测接入

此场景的接入流程包括**初始化 APM 基础设施、获取凭证、注册应用、获取配置模板、验证接入**等步骤,传统接入过程较复杂。**通过 CLI + Skill 可极大简化流程,实现自然语言交互式接入**。

(此场景的 6 步 CLI 详细流程见 2026-06-07 铖朴/珂帆 APM 接入篇)

### 实战场景五(数据查询):元数据、PromQL 和基础云监控指标查询

**业务场景**: 查询元数据、Prometheus 指标数据、基础云监控指标数据,以便分析业务运行情况、排查故障/问题。

**使用方式**:

> CPU使用率最高的 ECS 列表:找出最近半小时内 CPU 使用率最高的 10 台 ECS 实例。

**Agent 核心能力**:
- **元数据 (Meta) 查询**: 执行指标、namespace、事件元数据查询
- **PromQL 查询**: 对接入云监控指标监控的资源,执行即时查询和范围查询,以及 label、labelValues、series 元数据查询
- **基础云监控指标查询**: 执行基础云监控的 top、latest、range、points 等命令

## 完整 CLI 命令树(节选核心)

```text
aliyun cms2
├── integrate                    接入中心管理
│   ├── policy                   接入策略管理
│   ├── service-monitor          serviceMonitor 采集规则查询
│   ├── pod-monitor              podMonitor 采集规则查询
│   ├── custom-job               自定义 Prometheus 采集 Job 查询
│   ├── addon-release            组件实例管理
│   └── addon                    可用接入组件目录
├── workspace                    工作空间管理
├── prometheus                   Prometheus 服务管理
│   ├── instance                 Prometheus 实例管理
│   ├── view                     Prometheus 聚合视图管理
│   └── recording-rule           RecordingRule 预聚合管理
├── apm                          应用性能监控管理
│   ├── service                  APM 应用服务管理
│   └── configuration            APM 配置管理
├── rum                          用户体验监控管理
│   ├── service                  RUM 应用服务管理
│   └── configuration            RUM 配置管理
├── alert                        告警中心管理
│   ├── rule                     告警规则管理
│   ├── template                 告警规则模板管理
│   └── history                  告警触发与恢复历史
├── notification-channel         通知渠道管理
│   ├── contact                  告警联系人 (邮件、短信、钉钉)
│   ├── robot                    告警机器人 (钉钉/飞书/企微)
│   └── webhook                  Webhook 回调地址
├── event-hub                    事件中心管理
├── metric                       指标查询
│   ├── promql                   PromQL 即时/范围查询
│   └── basic                    云监控1.0指标查询
├── trace                        Trace数据查询
├── entity                       云资源与 EntityStore 查询
└── meta                         元数据查询
```

**阅读原文**: [云监控 2.0 全生命周期管理详情](https://skills.aliyun.com/skills/alibabacloud-cms-manage)
