---
source: rss
source_url: https://aws.amazon.com/cn/blogs/china/aws-devops-agent-build-gaming-intelligent-operations
ingested: 2026-07-16
sha256: 70600a6fdd5e0af23c806b42ec70989d1a700dd60543651e46e5313ba3fa2add
feed_name: AWS China Blog
source_published: 2026-07-16
---

# 星合互娱借助 AWS DevOps Agent 构建多游戏智能运维体系

摘要：面对多游戏、多账号、小团队的运维压力，星合互娱在评估多种 AI 运维方案后，最终选择了 AWS DevOps Agent。核心考量在于：DevOps Agent 并非独立于现有体系之外的另一套工具，而是能够直接融入星合互娱已有的监控、代码和云账号体系，让 AI 在现有数据上发挥价值，而非要求团队重新建设数据管道。  
  
**目录**

01 一、关于星合互娱

02 二、业务挑战

03 三、为什么选择 AWS DevOps Agent

04 四、架构与实现

05 五、实际效果

06 六、未来规划

07 七、总结

* * *

## **一、关于星合互娱**

星合互娱（StarUnion Interactive Entertainment）是一家专注于 SLG（策略类手游）出海的游戏公司，旗下拥有 The Ants: Underground Kingdom（小小蚁国）、Beast Lord（兽王争霸）、Myths of Moonrise（月光传说）等多款全球发行的 SLG 手游，覆盖北美、欧洲、日韩、东南亚等 10+ 国家/地区 Top 100 榜单。

星合互娱采用多账号架构运行在 AWS 上，核心服务包括 [Amazon EKS](<https://aws.amazon.com/cn/eks/>)、[Amazon Redshift](<https://aws.amazon.com/cn/redshift/>)、[Amazon EMR](<https://aws.amazon.com/cn/emr/>)、Aurora MySQL、[Amazon OpenSearch](<https://aws.amazon.com/cn/opensearch-service/>) Service、[Amazon ElastiCache](<https://aws.amazon.com/cn/elasticache/>) Redis、[Amazon MSK](<https://aws.amazon.com/cn/msk/>) 等，支撑多款游戏的全球服务器集群和大数据分析平台。

## **二、业务挑战**

随着多款游戏同时运营，星合互娱的运维团队面临以下挑战：

**1\. 多游戏、多账号运维复杂度高**

星合互娱采用按游戏项目划分 AWS 子账号的架构（主账号 StarUnion + 多个游戏项目子账号），运维团队需要同时监控和管理 `45` 个 AWS 账号、`5` 个 EKS 集群。每款游戏有独立的技术栈和告警规则，跨账号的故障定位耗时较长。

**2\. 告警风暴与 MTTR 压力**

SLG 游戏对可用性要求极高——玩家实时在线进行策略对抗，任何服务中断都会直接影响玩家留存和付费体验。高峰期（如新服开放、跨服活动）告警量激增，运维工程师需要在大量告警中快速识别根因，传统的人工逐一排查方式 MTTR 较长。

**3\. 运维团队规模有限**

作为出海游戏公司，星合互娱希望将有限的人力聚焦在业务功能开发和玩家体验优化上。运维团队 `7人` 需要支撑多款游戏的 7×24 运行，亟需 AI 工具辅助提效。

## **三、为什么选择 AWS DevOps Agent**

面对多游戏、多账号、小团队的运维压力，星合互娱在评估多种 AI 运维方案后，最终选择了 [AWS DevOps Agent](<https://aws.amazon.com/cn/devops-agent/>)。核心考量在于：DevOps Agent 并非独立于现有体系之外的另一套工具，而是能够直接融入星合互娱已有的监控、代码和云账号体系，让 AI 在现有数据上发挥价值，而非要求团队重新建设数据管道。

具体选择原因：

  1. 原生 AWS 集成：DevOps Agent 可以直接访问 CloudWatch 指标、EKS 集群状态、RDS 性能洞察等 AWS 原生数据源，覆盖星合互娱 45 个账号、5 个 EKS 集群的监控需求，无需额外的数据管道
  2. 与现有监控栈无缝对接：星合互娱已基于 Grafana 构建起 141 个 Dashboard 的统一监控平台，DevOps Agent 的 Grafana MCP 能力可以直接读取现有数据，保护既有投入
  3. 多账号跨项目支持：通过 Secondary Account 配置，Agent 可以跨游戏项目 AWS 子账号进行故障排查，完美匹配「按游戏划分账号」的架构
  4. 安全合规：所有跨账号访问通过 IAM Role AssumeRole 方式实现，遵循最小权限原则，满足出海游戏公司对数据访问管控的合规要求



## **四、架构与实现**

### 4.1 整体架构

[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/07/15/aws-devops-agent-build-gaming-intelligent-operations-1.png>) [图1]  
---  
  
### 4.2 关键能力配置

**4.2.1 Grafana 集成**

星合互娱使用 Grafana 作为统一监控平台，共接入 66 个数据源（Prometheus、Loki、VictoriaMetrics Logs、Grafana Pyroscope、StarRocks/MySQL、ClickHouse、InfluxDB 等 7 种类型），覆盖多云环境及各游戏项目独立监控与日志数据源，维护 141 个 Dashboard，涵盖主机、容器、数据库、日志、游戏进程、云资源及大数据组件等场景。通过 DevOps Agent 的 Grafana Skill，Agent 可以：

  * 实时查询 Grafana Dashboard 指标
  * 基于告警上下文自动关联相关面板
  * 生成包含图表截图的故障分析报告



**4.2.2 多账号 Secondary Account 配置**

通过 Secondary Account 配置，DevOps Agent 以 IAM Role AssumeRole 方式跨账号访问各游戏项目的 AWS 资源，目前已覆盖小小蚁国、兽王争霸、月光传说等主力游戏的生产环境，运维工程师无需切换账号即可完成跨项目故障排查。

**4.2.3 GitLab 代码关联**

接入 GitLab Pipeline Source 后，DevOps Agent 可以在故障排查时自动关联近期代码变更：

  * 分析最近 1-2 天的 commit/MR 记录
  * 自动关联告警时间窗口内的代码变更
  * 辅助 RCA 判断是否为代码发布导致的问题



**4.2.4 接入自定义 MCP**

通过接入自定义 MCP 工具，DevOps Agent 可以访问团队自建的运维工具链，实现更贴合业务的故障排查能力扩展。星合互娱目前接入了两个自定义 MCP 场景：

  * VictoriaLogs 日志分析：通过 Grafana MCP 对接 VictoriaLogs 数据源，Agent 可以直接检索和分析游戏服务日志，在故障排查时自动关联应用日志上下文
  * 玩家网络诊断：通过网络工具 MCP，Agent 可以分析和定位玩家运营商网络问题（如延迟、丢包），辅助运维团队判断是服务端故障还是玩家侧网络异常



## **五、实际效果**

### 5.1 故障响应提效

指标 | 使用前 | 使用后 | 改善  
---|---|---|---  
平均故障定位时间 | ~60 分钟 | ~15 分钟 | 缩短约 75%  
跨账号故障排查耗时 | ~90 分钟 | ~20 分钟 | 缩短约 78%  
告警处理方式 | 人工逐系统排查 | AI 自动关联数据、工程师介入时已有完整上下文 | —  
  
### 5.2 典型场景：跨数据源联合排查线上超时故障

以下是一个真实案例，还原 DevOps Agent 如何在多数据源之间自动关联、逐步缩小根因范围。

告警触发：某业务服务收到 GO-SDK 错误告警，客户端请求 10 秒超时无响应。运维工程师将告警信息发给 DevOps Agent，启动排查。

DevOps Agent 排查过程：

第一步 — 确认基础资源：Agent 查询 EKS 集群中对应服务的 Pod 状态与 Prometheus 指标（CPU、内存、Goroutine 数量），确认 4 个 Pod 均处于 Running 状态，资源使用正常，排除容器资源不足的可能。

第二步 — 分析应用日志：Agent 通过 Grafana Loki 检索请求链路日志，关键发现：服务端只记录了请求到达的日志，没有后续处理完成或报错的日志，说明请求在业务逻辑中途卡住，而非被拒绝或崩溃。同时段其他请求均正常（响应 1-7ms），排除服务整体异常。

第三步 — 分析 ALB 层指标：Agent 查询 CloudWatch ALB 指标，该时间段 ELB 5xx 为 0，P99 延迟正常，排除负载均衡层问题。但在排查过程中，Agent 在稍晚时段的 ALB 日志中发现了一个附带问题：短时间内约 930 个 502 错误，98% 指向同一个网关服务 Pod。

第四步 — 定位第二个根因：Agent 检查该网关服务 Pod 事件，发现该 Pod 因内存超出限制（512Mi）被 OOMKilled，重启过程中产生了集中的 502 错误，约 3 秒后 Pod 重启完成，服务自动恢复。

排查结论：

问题 | 根因  
---|---  
**超时问题** | 请求卡在业务逻辑中，疑似下游服务（缓存/数据库）调用未设置超时，导致请求无限阻塞  
**502 问题（附带发现）** | 网关服务 Pod 内存限制过低，OOMKilled 后重启期间短暂不可用  
  
两个问题时间相近但原因完全独立，DevOps Agent 在分析过程中将其明确区分，避免了误判。

修复措施：针对超时问题，在下游调用处增加超时控制并补充请求链路日志；针对 OOM 问题，将网关服务内存上限从 512Mi 调整为 1Gi+，同时增加副本数并配置内存使用率预警告警。整个从告警到完成 RCA 的过程，相比以往人工逐层检查各系统显著提速。

### 5.3 运维团队反馈

“我们 7 个人同时维护多款游戏的生产环境，最头疼的就是跨账号排查问题——以前要在好几个 AWS Console 之间来回切，现在 DevOps Agent 直接帮我们把各个系统的数据关联起来，工程师拿到的已经是整理好的上下文，判断根因快了很多。”   
—— 龚小成，运维部门负责人，星合互娱 

## **六、未来规划**

星合互娱计划进一步扩展 DevOps Agent 的使用范围：

  * 告警主动响应：通过 Webhook 接入告警系统，由 DevOps Agent 在第一时间自动触发分析、完成初步 RCA，再将结论推送给运维工程师介入处理，将人工响应时机后移，从「人找问题」转变为「问题找人」
  * 业务场景定制 Skill：针对 SLG 游戏特有的运维场景（如新服开放期间的容量预判、跨服活动的流量突增分析、游戏进程异常的自动诊断）开发定制化 Skill，让 Agent 具备游戏业务语境下的专项判断能力
  * 覆盖更多游戏项目账号：将 DevOps Agent 的 Secondary Account 逐步扩展至全部在运营游戏项目，实现统一入口跨项目排查
  * 全链路可观测性打通：结合分布式 Tracing 和 eBPF 数据，让 Agent 在定位慢调用和服务依赖问题时具备更完整的链路视角，补齐日志 + 指标之外的第三维数据



## **七、总结**

星合互娱通过 AWS DevOps Agent 构建了覆盖多款 SLG 手游的智能运维体系，利用 AI Agent 的自动化故障分析能力，有效降低了多账号、多游戏架构下的运维复杂度。DevOps Agent 与 Grafana、GitHub 等现有工具链的无缝集成，让运维团队能够以更少的人力支撑更大规模的业务增长。

### 关于 AWS DevOps Agent

AWS DevOps Agent 是一款 AI 驱动的运维助手，能够自动执行事件分类、根因分析（RCA）和修复建议等 DevOps 任务。它集成了 [Amazon CloudWatch](<https://aws.amazon.com/cn/cloudwatch/>)、Grafana、GitHub 等多种数据源，支持通过 Agent Space Web 界面、Chat API 和 Webhook 等多种方式与运维团队交互。 [了解更多](<https://aws.amazon.com/devops-agent/>)

**相关文章：**

  * [将 AWS DevOps Agent 智能运维能力延伸到中国区](<https://aws.amazon.com/cn/blogs/china/aws-devops-agent-intelligent-operations/?p=bl_ar_l=1>)
  * [基于 AWS DevOps Agent 构建 AI 驱动的运维分析系统](<https://aws.amazon.com/cn/blogs/china/based-on-aws-devops-agent-build-ai-operations-analytics-system/?p=bl_ar_l=2>)
  * [AWS DevOps Agent 实战：云网络故障自主调查与修复建议](<https://aws.amazon.com/cn/blogs/china/aws-devops-agent-network-fault/?p=bl_ar_l=3>)
  * [AWS DevOps Agent 与 GitHub 集成实践：如何实现从代码变更到故障调查的端到端闭环](<https://aws.amazon.com/cn/blogs/china/aws-devops-agent-github-integration-practice-how-to-implement-fault-end-to-end/?p=bl_ar_l=4>)



*前述特定亚马逊云科技生成式人工智能相关的服务目前在亚马逊云科技海外区域可用。亚马逊云科技中国区域相关云服务由西云数据和光环新网运营，具体信息以中国区域官网为准。

## 本篇作者

### 龚小成

星合互娱运维部门负责人，拥有多年大规模游戏出海运维与架构经验，全面负责公司多云基础设施演进、持续交付与云成本治理。当前聚焦于大语言模型与 AIOps 的结合，致力于推动下一代智能化游戏运维平台的落地实践。

### 陈伟

星合互娱游戏运维组长，负责手游业务的多云架构（AWS/GCP/阿里云/腾讯云/华为云），主导自动化 CI/CD 实践及云资源成本优化，持续推动监控平台建设与能力提升。在公司积极推动 AIOps 在各类运维场景的落地与应用。

### Chenlong Hu

亚马逊云科技技术客户经理，拥有丰富的跨国国际项目经验及海内外工作经验。在职业生涯中担任过产品经理、开发、架构师、运维工程师等多种角色，致力于通过云计算服务助力客户的成功。

### 粟伟

亚马逊云科技资深解决方案架构师，专注游戏行业。开源项目爱好者，致力于云原生应用推广、落地。具有 15 年以上的信息技术行业专业经验，担任过高级软件工程师，系统架构师等职位，在加入亚马逊云科技之前曾就职于 Bea、Oracle、IBM 等公司。

* * *

## AWS 架构师中心：云端创新的引领者

探索 AWS 架构师中心，获取经实战验证的最佳实践与架构指南，助您高效构建安全、可靠的云上应用 **[](<https://aws.amazon.com/cn/solutions/architect-center/>)**|   
---|---
