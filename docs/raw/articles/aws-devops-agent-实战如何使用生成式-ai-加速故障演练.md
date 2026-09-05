---
source: rss
source_url: https://aws.amazon.com/cn/blogs/china/aws-devops-agent-how-to-using
ingested: 2026-07-16
sha256: 630b393c5bcd5857860b6ad08c2f364f8d49a6cdca89ec4564d316ca190d1b7b
feed_name: AWS China Blog
source_published: 2026-07-16
---

# AWS DevOps Agent 实战：如何使用生成式 AI 加速故障演练

摘要：本文将通过示例介绍，如何借助 Kiro 与 AWS DevOps Agent，把原本高度依赖人力的演练，转变为低成本、可复现、并能在每次演练中自动产出调查结论的流程。读完本文，您将了解如何为每一类故障切换信号设计可靠的检测、如何运行基础演练并设计其他演练流程，以及如何把 DevOps Agent 集成到您的 on-call 流程。

**目录**

01 一、前言

02 二、关于 DevOps Agent

03 三、示例应用

04 四、故障响应场景设计

05 五、用 Kiro 生成演练手册（示例）

06 六、运行演练与查看调查（示例）

07 七、用 Kiro 把调查结果形成演练报告

08 八、总结

* * *

## **一、前言**

任何生产系统都可能出现各类故障，例如服务器宕机、数据库主从切换、缓存节点失联、中间件依赖变慢等。更关键的是，日常的监控与告警是被动的，它们只在故障真正发生时才起作用；在故障未发生时，团队无法确认告警是否有效、响应流程能否按预先设计快速执行。演练的目的正是将这种不确定转化为可掌握的确定性：在真实故障发生之前，主动在测试或预生产环境中制造已知故障，以检验架构的可靠性设计与响应流程，并借此提升团队的响应速度。一次完整的演练，通常是在检验故障响应流程中的几个关键环节：

  * 可观测性与检测：故障发生后，系统能否在第一时间发出告警。例如数据库刚发生一次主从切换、某个节点掉线，是否有对应的告警？告警又需要多久才能送达值班工程师？如果告警滞后，甚至没有触发，业务可能已经受到影响，而运维团队仍无从知晓。
  * 调查与定位（根因分析）：告警触发之后，能否快速定位问题并查清根因。这一步通常最为耗时，也最考验能力，工程师不仅需要对业务系统有深入的了解，还要在大量监控图表、日志与近期变更记录中反复检索、逐一排除。
  * 复盘与持续改进：故障处理完成后，将本次的时间线、根因与处理过程记录下来，总结发生原因与后续的规避措施，将经验沉淀为可落地的改进项，避免同类问题重复发生。



在 Kiro 与 DevOps Agent 这类生成式 AI 工具出现之前，演练流程几乎全靠人工完成：运维工程师需要专门维护一套手册与脚本，并在环境每次变更后手动更新。正因为每个环节都高度依赖人力，它们才难以被持续做好，许多运维团队实际上并没有足够的人力去持续完善演练。本文将通过示例介绍，如何借助 Kiro 与 [AWS DevOps Agent](<https://aws.amazon.com/cn/devops-agent/>)，把原本高度依赖人力的演练，转变为低成本、可复现、并能在每次演练中自动产出调查结论的流程。读完本文，您将了解如何为每一类故障切换信号设计可靠的检测、如何运行基础演练并设计其他演练流程，以及如何把 DevOps Agent 集成到您的 on-call 流程。

## **二、关于 DevOps Agent**

[AWS DevOps Agent](<https://docs.aws.amazon.com/devopsagent/latest/userguide/>) 是一个由生成式 AI 驱动的自主运维智能体，可以将其理解为一位随时待命的站点可靠性工程（SRE）协作者。它解决的核心问题是：线上出现异常时，自动展开调查、定位根因，并给出可执行的缓解建议，将事件的平均恢复时间（MTTR）从小时级缩短至分钟级。DevOps Agent 需要在收到触发信号（例如一条 [Amazon CloudWatch](<https://aws.amazon.com/cloudwatch/>) 告警或一张支持工单）后创建调查，先理解现象、制定调查计划，再把具体的排查任务分派给多个专职的子智能体并行执行。它的调查是“联邦式”的，会跨越您的可观测性栈（指标、日志、链路追踪）、基础设施配置乃至代码与部署变更，将表象一路追溯到真正的变更来源，最后输出一份结构化的根因分析与缓解方案。

在本文中，我们将 DevOps Agent 定义为演练的“自动首响者”：演练一旦注入故障、触发告警，DevOps Agent便自动接手调查、产出调查报告，随后交接给 on-call 工程师。我们还可以让 Kiro 作为工程师的生成式 AI 助手，调用 DevOps Agent API 获取信息，检查可观测性系统是否触发告警、告警是否及时、自动生成演练报告、提出流程改进、对可观测性基础提出建议等，将演练固化为一套可反复执行的流程。Kiro和DevOps Agent将负责完成大部分的文字工作和演练、调查流程，可以反复对演练流程进行验证和完善，大大减少了人的工作和实现效率提升。

## **三、示例应用**

在接下来的部分，我们将通过一个示例应用，用轻量的故障切换演练来验证故障响应流程。示例应用是一个虚拟的电商微服务应用，整套部署跨三个可用区，前端与各业务服务都以容器形式运行。四个托管服务分别支撑不同的业务能力：

  * [Amazon EKS](<https://aws.amazon.com/eks/>)容器编排平台，运行前端 UI 以及商品、购物车、订单等全部微服务。
  * [Amazon Aurora](<https://aws.amazon.com/rds/aurora/>)关系型数据库，存放商品目录、订单等核心业务数据。
  * [Amazon ElastiCache for Redis](<https://aws.amazon.com/elasticache/redis/>)缓存层，存放购物车这类对时延敏感的数据。
  * [Amazon MSK](<https://aws.amazon.com/msk/>)（Kafka）消息队列，承载下单等异步事件流，将下单动作与后续处理解耦。



下图（图 1）展示了该应用的整体架构：模拟出的用户请求经前端 UI 进入，商品服务读写 Aurora、购物车服务读写 Redis、下单流程通过 MSK 异步串联，所有微服务都运行在跨三个可用区的 EKS 集群上。这样，后续我们对任意一个托管服务做故障切换演练时，您都能清楚它对应用的哪一部分产生影响。

[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/07/08/aws-devops-agent-how-to-using-generative-ai-fault-1.png>) [图 1. 示例电商应用架构]  
---  
  
需要说明的是，该示例应用的流量并非真实用户产生，而是由一个内置的负载生成器（load generator）持续模拟。它会不间断地执行一遍典型的购物流程，反复访问前端 UI 的主要接口，例如打开首页（`GET /`）、浏览商品目录（`GET /catalog`）、查看商品详情（`GET /catalog/{id}`）、加入购物车以及下单结算，这些请求再由 UI 扇出到后端的商品、购物车、订单等服务。这样做的目的，是让系统始终保持一个稳定的基线流量：当我们对某个托管服务做故障切换时，它对请求成功率与时延的影响才能被清楚地观测到，而不会因缺乏流量而无法观测。

前面提到，DevOps Agent 是“被触发”才创建调查的，它不会主动推测故障位置，而是需要一个明确的入口信号（一个 webhook 请求）来启动调查。在接入方式上，DevOps Agent 既可以由告警或事件通过 webhook 触发，也能与工单系统、Slack 以及 Datadog、PagerDuty 等第三方工具集成，覆盖 AWS、多云与本地环境。我们为演练准备了两条互补的触发链路：

  * 事件路径：许多故障本身就会产生“事件”，例如 [Amazon Aurora](<https://aws.amazon.com/cn/rds/aurora/>) 完成一次故障切换会发出一条 RDS 事件，或者某个 CloudWatch 告警从 `OK` 变为 `ALARM`。这类事件由一条 [Amazon EventBridge](<https://aws.amazon.com/eventbridge/>) 规则捕获，触发一个中继 [AWS Lambda](<https://aws.amazon.com/lambda/>) 函数，再由它将事件包装成 incident 并 POST 到 DevOps Agent 的 webhook。
  * 指标路径：另一些故障需要靠“指标”才能识别，例如节点掉线、副本欠同步。这类指标先被采集进 Prometheus，由 Grafana 的告警规则每分钟评估一次；一旦越过阈值（firing），Grafana 就将其 POST 到同一个 webhook。

[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/07/08/aws-devops-agent-how-to-using-generative-ai-fault-2.png>) [图 2. DevOps Agent 的两条触发链路]  
---  
  
在真实场景中，同一个根因往往会同时触发多个异常，例如一次 Amazon Aurora 故障切换，可能既发出 RDS 事件、又让上游服务的错误率告警、还带动多个监控指标越过阈值。DevOps Agent 支持事件关联：它会自动将相似的、时间接近的、或指向同一资源与根因的多个事件，归拢到同一次调查中，形成“一个主调查加若干关联事件”的结构，而不是并行拉起多条互不相干的调查。这样，无论一次故障在您的观测栈中触发多少关联信号，工程师最终看到的都是一条聚合后的时间线和一份统一的根因分析，既压制了告警噪声，也避免同一个问题被反复排查。与此同时，工程师应确保可观测性基础足够完善，让尽可能多的故障信号都能在第一时间被捕获并告警。

关于 DevOps Agent 的基础使用以及如何配置 webhook，请参考 [AWS DevOps Agent 用户指南](<https://docs.aws.amazon.com/devopsagent/latest/userguide/>)。

## **四、故障响应场景设计**

有了触发链路，接下来要为每个托管服务设计一个故障响应场景：注入什么故障、这个故障又会经哪条路径触发 DevOps Agent 创建调查。我们为四个服务各设计了一个基础场景，都用服务自带的原生命令触发一次真实的故障切换：

服务 | 注入的故障（基础演练） | 触发路径  
---|---|---  
Amazon Aurora | 用 `aws rds failover-db-cluster` 触发一次数据库故障切换 | 事件路径（RDS 故障切换事件 → DevOps Agent）  
Amazon EKS | 用 `aws ec2 terminate-instances` 终止一个工作节点 | 事件路径（EC2 实例终止事件 → DevOps Agent）  
Amazon ElastiCache for Redis | 用 `aws elasticache test-failover` 触发一次主从切换 | 指标路径（主从转换 → DevOps Agent）  
Amazon MSK | 用 `aws kafka reboot-broker` 重启一个 broker | 事件路径（副本数量告警 → DevOps Agent）  
  
在示例应用中，我们将展示上述几类基础设施场景的演练过程与结果。在真实演练中，除了这些基础设施类场景外，可以按同样的思路设计更多演练（例如依赖变慢、网络分区、依赖限流等），如果希望将这些更复杂的演练做得更规范、更安全，可以使用 [AWS Fault Injection Service](<https://aws.amazon.com/fis/>)（FIS），一个托管的混沌工程服务。相比手动执行一条原生命令，FIS 能注入更丰富的故障类型（例如网络延迟与丢包、可用区断电、批量终止节点等），支持自定义实验模板、设置“停止条件（stop condition）”作为安全护栏并在触发后自动回滚，还能将演练编排成可定时执行的 game day。本文的四个基础场景用原生命令即可演示；当您需要更贴近真实故障、或更大范围的实验时，FIS 是自然的下一步。如需进一步的定制化演练方案，也可以联系您的 AWS account 团队。更多内容可参考 [AWS FIS 用户指南](<https://docs.aws.amazon.com/fis/latest/userguide/what-is.html>)。

## **五、用 Kiro 生成演练手册（示例）**

在真正注入故障之前，先为每个场景写一份演练手册作为执行计划，写清注入命令、预期触发路径、预期现象与预期恢复方式，供人工确认后再执行。手册是“演练前”的文档，此时还没有任何调查可参考，因此我们把上一节确定的演练设计（服务、注入命令、触发路径）直接提供给 Kiro，让它据此把手册补全：注入命令与触发路径来自设计，预期现象与预期恢复方式则由 Kiro 结合该服务的高可用机制推断。下面是一个示例提示词，只需替换其中的设计信息：
    
    
    以下是一个故障演练的设计，请据此生成一份故障演练手册：
    - 服务：{例如 Amazon Aurora}
    - 注入方式：{例如 aws rds failover-db-cluster 触发一次数据库故障切换}
    - 触发路径：{例如 事件路径——RDS 故障切换事件经 EventBridge 与中继 Lambda 送到 DevOps Agent}
    
    请按以下结构补全手册：
    1) 注入命令：写出完整的原生命令与必要参数（占位处标注需在演练时替换的实际标识，如集群名、实例 ID）
    2) 预期触发路径：复述走事件路径还是指标路径、由哪类信号触发 DevOps Agent 创建调查
    3) 预期现象：结合该服务的高可用机制，说明故障切换期间对应用可能产生的影响
    4) 预期恢复方式：是否自愈、依赖哪种高可用机制（如 Multi-AZ 提升 / ASG 补节点 / 副本因子≥2），是否需要人工介入
    
    以「# 故障演练手册：<服务> <故障>」作为标题直接开头，随后依次给出上述四段内容，不要添加任何额外的说明、注释或前后缀。
    

将以上四个场景信息各提供给 Kiro 跑一次，就得到覆盖全部场景的演练手册。手册在演练前明确了“预期会发生什么”，演练结束后再用 DevOps Agent 的真实调查结论与它对照，即可判断实际行为是否符合预期。如果使用了 FIS，还可以让 Kiro 参考 FIS 的 playbook 生成这份手册。您可以在这个提示词的基础上进行完善或自定义来生成演练文档。

## **六、运行演练与查看调查（示例）**

手册确认之后，就可以把它交给 Kiro 来驱动整个演练过程。相比人工逐条敲命令再守着控制台刷新，Kiro 能按手册自动完成注入、并全程跟踪 DevOps Agent 的调查直到结束。这里有两个容易被忽视的关键点:其一是演练隔离，DevOps Agent 会把时间接近、指向同一资源的事件关联进同一次调查，因此在注入前应先结束尚未完成的调查，确保本次演练的结论独立、不被其它事件干扰;其二是必须等待调查跑到 COMPLETED 再停手，调查的根因摘要只有在完成后才可获取,中途取消会永久丢失本次结论。下面这条提示词只需替换其中的手册内容:
    
    
    以下是一份已确认的故障演练手册（含注入命令、预期触发路径、预期现象与预期恢复方式），请据此执行本次演练：
    <在此粘贴该服务的演练手册内容或路径>
    执行步骤：
    1. 演练隔离：先用aws devops-agent list-backlog-tasks --agent-space-id <space> --sort-field CREATED_AT --order DESC --max-items 20检查是否存在未结束（状态非 COMPLETED / CANCELED）的调查；若有，先将其取消，确保本次演练独立、不会因事件关联被并入其它调查。
    2. 注入故障：执行手册中的注入命令；若命令含运行时标识（如实例 ID、broker ID），先用对应 describe命令现查并填入。记录注入时刻。
    3. 定位调查：轮询 list-backlog-tasks（同样用 --sort-field CREATED_AT --order DESC，勿用 --no-paginate），找到本次注入触发的新调查（taskType=INVESTIGATION，标题与该服务/告警匹配）。
    4. 等待完成：持续轮询该调查状态，直至变为 COMPLETED（通常约 5 分钟）。务必等它跑完再停手，切勿中途取消——investigation_summary_md 仅在 COMPLETED 后可得，提前取消会永久丢失调查结论。
    5. 输出：报告本次调查的 taskId、标题、创建时间，以及“注入到创建调查”的耗时，供我在控制台核对。
    

### 6.1 演练一：Amazon Aurora 故障切换

**触发链路**

Aurora 完成故障切换后会发出一条 RDS 故障切换事件。它走事件路径：由一条 EventBridge 规则捕获，触发中继 Lambda，将事件包装成 incident 送到 webhook，DevOps Agent 在约一分钟内自动创建调查，无需人工建单。

**调查结果**

调查完成后，DevOps Agent 沿调用链还原了这次切换的影响，并溯源到具体操作。下面两张图是本次演练的实际产出：调查日志记录了写实例运行时长骤降、约 10 秒内商品服务连接被拒（HTTP 404）并级联到 UI（约 78 次 HTTP 500）、随后 DNS 重指向自愈的完整时间线；根因分析则显示 Agent 排除了资源压力后，经 CloudTrail 溯源到一条人为的 `rds:FailoverDBCluster` 调用，判定为演练而非真实故障。

[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/07/08/aws-devops-agent-how-to-using-generative-ai-fault-3.png>) [图 3. Aurora 演练：DevOps Agent 调查日志]  
---  
  
[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/07/08/aws-devops-agent-how-to-using-generative-ai-fault-4.png>) [图 4. Aurora 演练：DevOps Agent 根因分析]  
---  
  
### 6.2 演练二：Amazon EKS 节点失联

**触发链路**

节点被终止时，[Amazon EC2](<https://aws.amazon.com/cn/ec2/>) 会发出实例状态变更事件（shutting-down / terminated）。这次演练走事件路径：该事件经 EventBridge → 中继 Lambda → webhook，DevOps Agent 自动创建调查。

**调查结果**

下面两张图是本次演练的实际产出：调查日志记录了 Agent 确认该实例已终止，`StateReason` 为 `Client.UserInitiatedShutdown`（即一次 `TerminateInstances` API 调用，而非 Spot 中断或硬件故障）；根因分析判定这是一次人为的节点终止（非真实容量故障），托管节点组的 ASG 通过 EC2 健康检查发现节点丢失，在同一可用区拉起替换节点、恢复期望容量 3，整个影响约 1 分钟；Agent 还注意到近期这种“外部终止到 ASG 补节点”已重复约 8 次。

[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/07/08/aws-devops-agent-how-to-using-generative-ai-fault-5.png>) [图 5. EKS 演练：DevOps Agent 调查日志]  
---  
  
[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/07/08/aws-devops-agent-how-to-using-generative-ai-fault-6.png>) [图 6. EKS 演练：DevOps Agent 根因分析]  
---  
  
### 6.3 演练三：Amazon ElastiCache for Redis 故障切换

**触发链路**

主从切换是一次“角色翻转”而非“数值越限”，传统的阈值告警难以表达。因此采用指标路径：“主从角色是否翻转过”这一状态被 Grafana 告警捕获，经 webhook 让 DevOps Agent 自动创建调查。

**调查结果**

下面两张图是本次演练的实际产出：调查日志记录了复制组主从角色翻转、一个副本被提升为新主、客户端在下一次命令时自动重连的过程；根因分析显示 Agent 经 CloudTrail 溯源到这次 `test-failover`，判定为有意的演练；作为缓存，正常演练下无数据丢失。

[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/07/08/aws-devops-agent-how-to-using-generative-ai-fault-7.png>) [图 7. Redis 演练：DevOps Agent 调查日志]  
---  
  
[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/07/08/aws-devops-agent-how-to-using-generative-ai-fault-8.png>) [图 8. Redis 演练：DevOps Agent 根因分析]  
---  
  
### 6.4 演练四：Amazon MSK broker 故障

**触发链路**

broker 下线会导致“欠副本分区数（UnderReplicatedPartitions）”升高，触发告警，经事件路径送到 webhook，DevOps Agent 自动创建调查。

**调查结果**

下面两张图是本次演练的实际产出：调查日志记录了欠副本分区数从 0 跳到 56、broker 1 优雅关闭约两分钟后重新加入、leader 迁移到存活 broker 的过程；根因分析显示因副本因子为 3、同步副本集始终 ≥2，控制器数量保持 1、离线分区数全程为 0，即无数据丢失，Agent 排除磁盘满与 OOM 后经 CloudTrail 溯源到人为的 `RebootBroker` 调用。

[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/07/08/aws-devops-agent-how-to-using-generative-ai-fault-9.png>) [图 9. MSK 演练：DevOps Agent 调查日志]  
---  
  
[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/07/15/aws-devops-agent-how-to-using-10-new.png>) [图 10. MSK 演练：DevOps Agent 根因分析]  
---  
  
## **七、用 Kiro 把调查结果形成演练报告**

四个演练各自产出了一份 DevOps Agent 调查报告。与其手动整理，不如直接在 Kiro 通过 DevOps Agent 接口将它们取回，生成一份结构化的故障演练报告。下面是一个示例提示词，只需替换其中的服务与故障：
    
    
    取回 DevOps Agent 最近一次针对 {服务与故障，例如 Aurora 故障切换} 的调查（investigation_summary_md），
    生成一份故障演练报告，用以下固定结构：
    1) 演练概述（服务、注入命令、演练日期）
    2) 触发路径（走事件路径还是指标路径、多久创建调查）
    3) 调查结论（现象 → 影响 → 根因，作为本次的预期基线）
    4) 恢复情况（是否自愈、是否需要人工）
    （可选）改进项：仅当调查暴露了可落地的加固点时才写；若本次已自愈、无特别可加固之处，
    则在"恢复情况"末尾注明"本次自愈且无可加固项"并省略此段，不要为凑格式而编造改进项。
    
    以「# 故障演练报告：<服务> <故障>」作为标题直接开头，随后依次给出上述结构的内容，不要添加任何额外的说明、注释或前后缀。
    

Kiro 会返回类似下面这样的一份报告（以 Aurora 故障切换为例）：
    
    
    # 故障演练报告：Amazon Aurora 故障切换
    
    ## 1. 演练概述
    - 服务：Amazon Aurora（示例电商应用的订单/商品数据库）
    - 注入命令：aws rds failover-db-cluster --db-cluster-identifier <cluster>
    - 演练日期：2026-07-04
    
    ## 2. 触发路径
    事件路径：Aurora 发出 RDS 故障切换事件 → EventBridge → 中继 Lambda → DevOps Agent
    webhook，注入后约 1 分钟自动创建调查。
    
    ## 3. 调查结论（预期基线）
    - 现象：写实例 EngineUptime 骤降至 8 秒，确认发生一次实例重启/切换。
    - 影响：切换的约 10 秒窗口内，catalog 连接写端点失败（连接被拒，对外表现为 HTTP 404，
      155 条），并级联到前端 UI——/home、/catalog 返回约 78 次 HTTP 500。
    - 根因：资源指标全程平稳，排除资源压力/宕机/配置变更；经 CloudTrail 溯源到一次人为的
      rds:FailoverDBCluster 调用，判定为有意演练、非真实故障。
    
    ## 4. 恢复情况
    写端点 DNS 重指向新写实例后，catalog 与 UI 同时自愈，全程无人工干预。
    
    ## 5. 改进项
    - 为 catalog / UI 增加数据库断连重连与退避重试，缩短切换窗口内的错误面。
    - 评估在 failover 期间对非关键路径做优雅降级，避免 404/500 直接透传给用户。
    

对四个演练各跑一次（替换服务与故障即可），将这些报告汇总在一起，就得到一份覆盖全部场景的演练报告。它将每次演练的调查结论固化为“预期基线”，下次再演练时，只需对照这条基线，即可判断响应链是否退化。

## **八、总结**

本文以一个跨三可用区的示例应用为例，展示了如何设计故障演练场景、DevOps Agent 触发链路，以及如何使用 Kiro 与 DevOps Agent 快速完成故障演练。本方案的价值体现在两个方面：其一，DevOps Agent 将最耗时的分诊与根因定位自动化，它在数十秒内创建调查，跨指标、日志、事件与部署变更做联邦式关联，并借助调查工具溯源到根因，将 MTTR 中原本依赖人工比对的部分缩短至分钟级；其二，借助 Kiro，我们将每次调查的结论沉淀为结构化、可复现的演练文档，并将其固化为“预期基线”，演练因此从一次性的手工操作，转变为一套可反复执行、持续对照的流程。当您需要比原生命令更丰富的故障注入、编排与护栏时，还可以进一步引入 AWS Fault Injection Service；如有更深入或定制化的演练需求，欢迎联系您的 AWS account 团队。

**下一步行动：**

**相关产品：**

  * [Amazon DevOps Agent](<https://aws.amazon.com/cn/devops-agent/?p=bl_pr_devops-agent_l=1>) — 解决和预防事故的代理
  * [Amazon Aurora](<https://aws.amazon.com/cn/rds/aurora/?p=bl_pr_aurora_l=2>) — 适用于 PostgreSQL、MySQL 和 DSQL 的无服务器关系数据库服务
  * [Amazon MSK](<https://aws.amazon.com/cn/msk/?p=bl_pr_msk_l=3>) — 完全托管式 Apache Kafka 服务
  * [Amazon EKS](<https://aws.amazon.com/cn/eks/?p=bl_pr_eks_l=4>) — 托管式 Kubernetes 服务
  * [Amazon EventBridge](<https://aws.amazon.com/cn/eventbridge/?p=bl_pr_eventbridge_l=5>) — 大规模构建事件驱动应用程序



**相关文章：**

  * [用 Kiro Skill 打造你的专属 AI 工作流：以会议纪要自动生成为例](<https://aws.amazon.com/cn/blogs/china/kiro-skill-build-custom-ai-workflow-meeting-minutes-auto-generate/?p=bl_ar_l=1>)
  * [用 Kiro CLI 自动搭建 FluentBit 日志采集方案：两种 EKS 埋点数据落地 S3 Parquet 的实战对比](<https://aws.amazon.com/cn/blogs/china/kiro-cli-fluentbit-logging-solution-eks-s3-parquet-comparison/?p=bl_ar_l=2>)
  * [AWS DevOps Agent 与 GitHub 集成实践：如何实现从代码变更到故障调查的端到端闭环](<https://aws.amazon.com/cn/blogs/china/aws-devops-agent-github-integration-practice-how-to-implement-fault-end-to-end/?p=bl_ar_l=3>)
  * [当 Kiro 遇上 OpenClaw：AI Agent 双向协作的实践探索](<https://aws.amazon.com/cn/blogs/china/kiro-openclaw-ai-agent-practice-explore/?p=bl_ar_l=4>)
  * [从手动到智能：用 Kiro CLI + OpenSearch MCP 让每个人都成为 OpenSearch 专家](<https://aws.amazon.com/cn/blogs/china/from-manual-to-smart-use-kiro-cli-opensearch-mcp-to-make-everyone-an-opensearch-expert/?p=bl_ar_l=5>)



*前述特定亚马逊云科技生成式人工智能相关的服务目前在亚马逊云科技海外区域可用。亚马逊云科技中国区域相关云服务由西云数据和光环新网运营，具体信息以中国区域官网为准。

## 本篇作者

### 柯逸楠

AWS解决方案架构师，具有丰富的数据分析和挖掘经验，负责基于AWS云平台的解决方案咨询和设计。

* * *

## AWS 架构师中心：云端创新的引领者

探索 AWS 架构师中心，获取经实战验证的最佳实践与架构指南，助您高效构建安全、可靠的云上应用 **[](<https://aws.amazon.com/cn/solutions/architect-center/>)**|   
---|---
