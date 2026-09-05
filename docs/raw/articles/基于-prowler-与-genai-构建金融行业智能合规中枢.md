---
source: rss
source_url: https://aws.amazon.com/cn/blogs/china/based-on-prowler-genai-build-fintech-intelligent-compliance/
tags: [aws-china-blog, agentic-ai, context-engineering]
review_value: 8
review_confidence: 8
review_recommendation: strong
review_stars: 5
ingested: 2026-05-13
sha256: a774634b3186ef5f5b3754e48de1ad03ac28173b38ad89c3f445f0e3412a2afd
---
# 基于 Prowler 与 GenAI 构建金融行业智能合规中枢
摘要：本文提出了一套专为跨境金融机构打造的智能合规中枢架构方案，旨在解决面对多重监管框架（如 PCI DSS v4.0、MAS TRM-G、DORA 等）时由于重复审计、术语壁垒和修复滞后带来的“规模化合规难题”。
**目录**
01 一、概述
02 二、背景
03 三、方案介绍
04 四、方案价值
05 五、挑战：多框架合规的规模化难题
06 六、方案架构
07 七、为什么选择 Prowler
08 八、痛点一的解决思路：使用自定义合规框架
09 九、痛点二的解决思路：生成式 AI 合规分析
10 十、界面展示
11 十一、技术详解
12 十二、总结
* * *
## **一、概述**
本文提出了一套专为跨境金融机构打造的智能合规中枢架构方案，旨在解决面对多重监管框架（如 PCI DSS v4.0、MAS TRM-G、DORA 等）时由于重复审计、术语壁垒和修复滞后带来的“规模化合规难题”。
核心架构与创新机制：
  * 轻量级按需扫描： 采用 [Amazon ECS](<https://aws.amazon.com/cn/ecs/>) Fargate 动态调度开源安全工具 Prowler （Prowler 是一个开源的云安全工具，主要用于云的安全评估、审计、合规性检查、持续监控），按需执行 500+ 项安全检查，并将结果标准格式化（OCSF- Open Cybersecurity Schema Framework）后无缝集成至 [AWS Security Hub](<https://aws.amazon.com/cn/security-hub/>)。
  * 自定义框架与逻辑注入： 充分利用 Prowler 的检测与合规映射解耦机制，在 42 个内置框架外，灵活扩展了 9 个区域/新兴合规框架。方案创新性地引入了 Rationale（映射逻辑文档），明确了底层技术检查与顶层监管条款的对应依据。
  * 生成式 AI 智能解读： 借助 [Amazon Bedrock](<https://aws.amazon.com/cn/bedrock/>) 提供的大语言模型能力，结合底层扫描数据、框架元数据与 Rationale 上下文，彻底打通从技术告警到业务合规的“最后一公里”。
## **二、背景**
跨境金融机构同时面临 PCI DSS、MAS TRM-G、DORA、等保 2.0 等多套合规框架的审计要求，每个框架都有独立的审计周期、术语体系和技术标准。传统做法将每个框架作为独立的审计项目执行，导致重复评估、修复滞后、以及审计间隙的合规盲区。
## **三、方案介绍**
以 Prowler 开源安全扫描工具为引擎，通过 Amazon Elastic Container Service (Amazon ECS) 和 [AWS Fargate](<https://aws.amazon.com/cn/fargate/>) 按需执行扫描，借助 Amazon Bedrock 实现生成式 AI 合规分析。最终效果：一次扫描覆盖 51 个合规框架，GenAI 自动生成条款级分析报告。
## **四、方案价值**
无论处于安全合规流程的哪一环，这套架构都能提供直接的价值：
  * 对于 CTO：3 个人的安全团队，能做到 5 个框架的持续合规。AI 将原本需要数天的合规分析工作缩短到分钟级别。
  * 对于 CISO：一个仪表盘看到所有框架的合规得分，趋势变化一目了然，审计前不用再”突击”。
  * 对于合规负责人：AI 自动生成条款级映射报告，不再需要人工翻阅框架文档做差距分析。
  * 对于安全工程师：修复建议带可执行的 CLI 命令，按优先级排好了，AI 已经给出非常详细的修改建议。
  * 对于安全架构师：一条 CDK 命令部署，51 个框架开箱即用，自定义框架 JSON 格式可扩展。
## **五、挑战：多框架合规的规模化难题**
以一家跨境支付公司为例。核心交易系统运行在 AWS 上，业务覆盖新加坡、欧盟和中国。合规团队需要同时满足五个合规框架：
监管机构 | 合规框架  
---|---  
PCI 安全标准委员会 | PCI DSS v4.0  
新加坡金融管理局 (MAS) | TRM-G 技术风险管理指引  
欧盟委员会 | DORA 数字运营韧性法案  
公安部 | 等保 2.0 三级  
欧盟数据保护 | GDPR  
传统方式面临三个结构性问题：
### 5.1 痛点一：框架多，重复劳动严重
例如PCI DSS v4.0 Requirement 8.3 要求”对所有用户的访问使用多因素认证”，MAS TRM-G 第 9.1.2 条要求”关键系统实施多因素认证”，DORA Article 9 要求”确保 ICT 系统的访问仅限于授权人员”——这三条说的其实是同一件事：开启 MFA。
但在传统审计流程中，它们被分成三份检查表、三次评估、三份报告。PCI DSS 的 QSA 审计师来一次，MAS 的审查官来一次，DORA 的合规评估又来一次——每次都要准备同样的证据。
一家中等规模的支付公司，仅”身份认证”这一个领域，就可能在 PCI DSS、MAS TRM-G、DORA 三个框架中被重复评估 3 次。
### 5.2 痛点二：检查容易，说清楚难
市面上不缺安全扫描工具。AWS Security Hub、Prowler、ScoutSuite 都能告诉”KMS 密钥没有开启自动轮换”。
但合规团队拿到这个结果后，还需要回答三个问题：
  * “这违反了哪条？”——需要人工查阅 CPS 234 文档，找到第 8.1.4.1 条”数据保密性”
  * “风险多大？”——需要评估业务影响：这把密钥保护的是什么数据？停机迁移的成本是多少？
  * “先修哪个？”——12 个失败项，合规审计下月就来，资源有限，必须排优先级
这三个问题花的时间，往往比扫描本身多 10 倍。这就是合规的”最后一公里”——从技术检查结果到业务合规行动之间的鸿沟。
## **六、方案架构**
本方案包含四个核心组件：
[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/05/11/based-on-prowler-genai-build-fintech-intelligent-compliance-1.png>) [图1 整体架构图]  
---  
核心思路是 Prowler CLI 做扫描引擎，FastAPI 做编排中心，Bedrock 做 AI 分析——三者之间松耦合，通过 S3 文件和 API 调用交互。
Prowler CLI 以按需 ECS Fargate 任务运行，执行 500+ 安全检查项，输出 OCSF（Open Cybersecurity Schema Framework）标准格式的结果。
Extension API（基于 FastAPI 的 ECS Fargate 服务）作为编排中心——管理扫描配置、触发 Prowler 任务、处理扫描结果、并提供 Web UI。
结合扫描结果、框架上下文和 Rationale 文档，生成条款级的合规分析报告。（注：根据 Amazon Bedrock 的数据隐私合规标准，客户的提示词、安全扫描结果以及生成的报告都不会被用于训练底层的基座模型，确保金融级的数据隔离与隐私安全）。
辅助服务包括 [Amazon DynamoDB](<https://aws.amazon.com/cn/dynamodb/>)（元数据存储）、[Amazon S3](<https://aws.amazon.com/cn/s3/>)（扫描报告）、Security Hub（Findings 聚合）、[Amazon EventBridge](<https://aws.amazon.com/cn/eventbridge/>) Scheduler（定时调度扫描）。
关键组件：
组件 | 说明  
---|---  
Amazon Elastic Container Service (Amazon ECS)+ AWS Fargate | Extension API（FastAPI），唯一的常驻服务  
AWS ECS Fargate Task | Prowler CLI，按需启动（扫描时跑，完成后释放）  
Amazon DynamoDB | 3 张表（scan-tasks, scan-profiles, framework-metadata），生产环境持久化  
Amazon Simple Storage Service (Amazon S3) | Prowler 扫描报告（OCSF JSON + CSV），可导出下载  
Bedrock | Claude Sonnet 4，GenAI 合规分析  
Security Hub | 接收 Prowler 的AWS Security Finding Format (ASFF) 和原生安全服务聚合  
Amazon EventBridge Scheduler | 定时触发扫描（支持 rate/cron 表达式）  
### 6.1 组件交互流程
    用户 → Extension API (FastAPI)
             │
             ├──→ ECS RunTask → Prowler CLI 容器
             │                      │
             │                      ├──→ S3（OCSF JSON + CSV 报告）
             │                      └──→ Security Hub（ASFF findings）
             │
             ├──→ S3 GetObject → 解析 findings → DynamoDB（扫描结果）
             │
             ├──→ Bedrock InvokeModel → AI 分析报告
             │
             └──→ DynamoDB（扫描配置、任务记录、框架元数据）
Extension API 通过 ecs:RunTask 触发 Prowler CLI。任务完成后，API 从 S3 读取 OCSF 输出，计算合规评分，并将摘要存入 DynamoDB。用户可以请求 AI 分析，系统将 findings 与框架上下文一起发送给 Amazon Bedrock。
## **七、为什么选择 Prowler**
Prowler 是一个开源云安全评估工具，GitHub 上有 13,700+ stars（截止到2026年4月），在多份 AWS安全白皮书和 Well-Architected Labs 中被推荐使用。它提供 500+ 预置安全检查项，覆盖 IAM、加密、网络、日志、监控等安全领域。Prowler 在本方案中的核心优势是其合规框架架构：每个框架是一个标准 JSON 文件，将监管条款映射到已有的检查项。Prowler v5 内置 42 个合规框架，包括 CIS Benchmarks（v1.4–v6.0）、PCI DSS（v3.2.1、v4.0）、NIST 800-53（Rev 4、Rev 5）、ISO 27001、SOC 2、HIPAA、GDPR 等。
### 7.1 AWS 安全服务
服务 | 定位 | 功能  
---|---|---  
AWS Security Hub | 安全态势集中面板 | 聚合多源 findings、内置AWS安全基准、与 100+ 集成  
AWS Config | 资源配置持续审计 | 配置变更追踪、合规规则引擎、修复自动化  
Amazon GuardDuty | 威胁检测 | 实时恶意行为检测（异常 API 调用、加密货币挖矿、凭证泄露）  
Amazon Inspector | 漏洞管理 | EC2/ECR/Lambda 的 CVE 漏洞扫描  
AWS Audit Manager | 审计证据收集 | 自动收集审计证据、支持自定义框架、生成评估报告  
Amazon Macie | 数据安全 | S3 中的敏感数据发现和分类  
### 7.2 面临的真正挑战：自定义框架
假设面临上述场景——PCI DSS v4.0 审计下月到期，同时还要满足新加坡 MAS TRM-G合规审计。
PCI DSS v4.0：Security Hub 内置了 PCI DSS 标准，但它对应的还是 v3.2.1 的检查集。v4.0 新增了多因素认证强化、自定义化方法（Customized Approach）等要求，Security Hub 尚未完全覆盖。Prowler 的 PCI DSS v4.0 框架更新更快（社区驱动），可以作为 Security Hub 的补充验证。
MAS TRM-G：这是新加坡金管局的要求——Security Hub 没有内置这个标准，AWS Config 可以写自定义规则来检测，但 TRM-G 有 6 个条款域、22 个检查项——需要写 22 条 Config Rules + Lambda 函数。Audit Manager 支持自定义框架，但它收集的是”证据”（Config 快照、CloudTrail 日志），不会主动告诉”哪项不合规”。综上，需要借助于Prowler来做增强。
### 7.3 Prowler 介绍
简单说：它用 500+ 个预置的安全检查扫描账户，告诉哪些配置不符合安全最佳实践或合规框架要求。
    #一条命令，扫描整个账户的 PCI DSS 合规状态
    prowler aws --compliance pci_4.0.0_aws
每个”检查项”（Check）是一条具体的安全规则，例如：
Check ID | 检查内容 | 涉及服务  
---|---|---  
iam_root_mfa_enabled | 根账户是否启用了 MFA | IAM  
s3_bucket_server_side_encryption | S3 桶是否启用服务端加密 | S3  
rds_instance_storage_encrypted | RDS 数据库存储是否加密 | RDS  
cloudtrail_multi_region_enabled | CloudTrail 是否全区域启用 | CloudTrail  
kms_cmk_rotation_enabled | KMS 密钥是否开启自动轮换 | KMS  
vpc_flow_logs_enabled | VPC 是否启用流量日志 | VPC  
这 500+ 个 检查项覆盖了 IAM、存储、加密、网络、日志、监控等安全领域。
### 7.4 Prowler 的合规框架机制
Prowler 真正的差异化不是检查项多——而是它把检查项组织成合规框架。一个”合规框架”本质上是一个映射表：把监管条款对应到具体的检查项。比如 PCI DSS v4.0 框架定义了”Requirement 3.6.1 加密密钥管理”这个条款需要检查 kms_cmk_rotation_enabled。
Prowler v5 内置了 42 个合规框架，涵盖：
  * CIS Benchmarks（v1.4 到 v6.0，7 个版本）
  * PCI DSS（v3.2.1 + v4.0）
  * NIST 800-53（Rev 4 + Rev 5）、NIST CSF（v1.1 + v2.0）
  * ISO 27001（2013 + 2022）
  * SOC 2、HIPAA、GDPR、FedRAMP、FFIEC 等
扫描完成后，Prowler 可将结果以 ASFF (AWS Security Finding Format) 原生格式直接推送到 AWS Security Hub，与原生安全服务无缝聚合；同时，Prowler 也支持输出标准的 OCSF（Open Cybersecurity Schema Framework）JSON 格式并存储至 Amazon S3，方便后续接入 Amazon Security Lake 或企业级 SIEM 平台进行跨源安全数据分析。
[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/05/11/based-on-prowler-genai-build-fintech-intelligent-compliance-2.png>) [图2 Prowler OCSF 输出与 AWS Security Hub 集成]  
---  
### 7.5 Prowler 与 AWS安全服务的关系
Prowler 与 AWS 原生安全服务各有侧重，协同工作以覆盖完整的安全合规需求：
能力维度 | AWS服务 | Prowler 的能力  
---|---|---  
威胁检测 | Amazon GuardDuty | 不涉及  
漏洞管理 | Amazon Inspector | 不涉及  
配置审计 | AWS Config | 补充 Config 未覆盖的检查项  
合规框架 | AWS Security Hub（CIS、PCI、NIST） | 扩展到 51 个框架，含区域性标准  
条款映射 | AWS Audit Manager（证据收集） | 主动检测 + 条款到检查项映射 + Rationale  
Findings 聚合 | AWS Security Hub | Prowler OCSF 输出 → 导入 Security Hub  
对于 PCI DSS 等主流框架，AWS Security Hub 覆盖度较高。对于 MAS TRM-G、DORA、APRA CPS 234、等保 2.0 等区域性框架，AWS服务存在局限。Prowler 通过可扩展的框架定义机制填补这一空白。该方案不是要替换 AWS安全服务，而是用 Prowler 进行增强。
[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/05/11/based-on-prowler-genai-build-fintech-intelligent-compliance-3.png>) [图3 Prowler 与 AWS安全服务的协同增强]  
---  
Prowler 和 AWS服务是协同增强关系：
维度 | AWS安全服务 | Prowler 补充  
---|---|---  
威胁检测 | GuardDuty（实时、ML 驱动） | 不做实时威胁检测  
漏洞管理 | Inspector（CVE 数据库） | 不做软件漏洞扫描  
配置审计 | Config（变更触发、修复自动化） | 补充 Config 未覆盖的检查项  
合规框架 | Security Hub（有限：CIS/PCI/NIST） | 51 个框架，含自定义区域框架  
条款映射 | Audit Manager（证据收集，不主动检测） | 每个 检查项映射到条款 + 原因  
数据输出 | Security Hub（ASFF 格式） | OCSF JSON → 导入 Security Hub  
聚合面板 | Security Hub | 自建合规仪表盘（补充框架维度）  
关键定位：GuardDuty 管威胁、Inspector 管漏洞、Config 管配置变更、Prowler 管合规框架。各司其职，协同工作。
### 7.6 为什么选 Prowler 而不是其他开源工具
工具 | 优势 | 不选择的原因  
---|---|---  
ScoutSuite | 多云支持好 | 合规框架不如 Prowler 丰富；社区活跃度下降  
CloudSploit | 轻量、易集成 | 检查项数量少；合规框架支持有限  
Steampipe | SQL 查询云资源，灵活 | 偏”查询工具”而非”合规工具”；需自己编写合规逻辑  
Prowler | 选择 | 500+ 检查项、50+ 内置框架、JSON 格式可扩展、OCSF 输出对接 Security Hub、活跃社区  
选择 Prowler 的决定性原因：
  * 框架可扩展——这是选择 Prowler 的决定性原因。如果需要一个 Prowler 没有内置的框架（比如 MAS TRM-G），不需要改 Prowler 的源码，不需要写任何检测代码——只需要写一个 JSON 文件，定义”哪个条款对应哪些已有的检查项”。这个设计把”检测能力”和”合规映射”完全解耦。Prowler 社区负责维护 500+ 个检测 检查项而合规团队可以独立地定义新框架。正是利用这个特性，在 Prowler 内置的 42 个框架之外，又自定义开发了 9 个亚太区域和欧盟框架。
  * 框架定义是标准 JSON——新增框架只需写一个 JSON 文件，不需要编译或改源码
  * 检查项丰富且持续更新——500+ 合规检查项，社区每月更新
  * OCSF 标准输出——扫描结果直接导入 Security Hub，与 AWS原生服务形成闭环
## **八、痛点一的解决思路：使用自定义合规框架**
合规框架通常在”追着业务跑”，金融机构的合规需求不是静态的。它随着三个维度持续变化：
维度一：业务地理扩张。例如一家新加坡金融科技公司拿到澳大利亚的金融牌照，它需要在几个月内满足 APRA CPS 234- 一个之前完全不需要关心的框架。当它开始服务欧盟客户，但DORA 又来了。业务每进入一个新市场，就多一套合规要求。
维度二：监管框架迭代
  * DORA 在欧盟正式生效（2025 年 1 月强制执行）
  * NIS2 扩大了关键基础设施的定义范围
  * MiCA 首次对加密资产服务商提出云安全要求
  * PCI DSS 从 v3.2.1 升级到 v4.0，新增了大量要求
维度三：工具和平台的滞后。无论是 Prowler、Security Hub 还是任何商业合规平台，它们内置框架的更新速度往往跟不上监管的节奏。原因很简单——工具厂商需要研读法规、理解条款、映射检查项、编写代码、发布版本。
这就产生了一个结构性矛盾：业务不能等工具。当监管要求已经生效、审计已经排期，而扫描工具还没有这个框架。需要能自己快速定义合规框架的能力。
### 8.1 框架定义模型
Prowler v5 的合规框架定义是一个纯 JSON 文件。它把”检测逻辑”和”合规映射”完全分离：
[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/05/11/based-on-prowler-genai-build-fintech-intelligent-compliance-4.png>) [图4 Prowler 框架定义模型——检测逻辑与合规映射分离]  
---  
核心优势：自定义框架不需要写检测代码。Prowler 已经有 500+ 个安全检查（如 iam_root_mfa_enabled、kms_cmk_rotation_enabled、rds_instance_storage_encrypted），它们覆盖了 IAM、加密、网络、日志、监控等多个安全领域。自定义框架只需要做一件事：定义”哪个条款对应哪些已有的检查项”。
Prowler 的合规框架是一个 JSON 文件，将监管条款映射到已有的检查项。不需要编写检测代码——复用 Prowler 已有检查项，只需定义”哪个条款对应哪些检查项”。一个合规专家用有限的时间就能把一个新框架的条款映射写出来，不需要编程能力。只需要理解两件事：这个框架的条款要求是什么？Prowler 现有的哪些检查项能验证这个要求？
    {
      "Framework": "MAS-TRM-G",
      "Name": "MAS Technology Risk Management Guidelines",
      "Provider": "300",
      "Version": "1.0",
      "Requirements": [
        {
          "Id": "trm-9.1.2",
          "Description": "关键系统的多因素认证",
          "Checks": [
            "iam_root_mfa_enabled",
            "iam_user_mfa_enabled_console_access"
          ],
          "Attributes": [{ "Section": "访问控制" }]
        },
        {
          "Id": "trm-9.2.1",
          "Description": "加密密钥管理与轮换",
          "Checks": [
            "kms_cmk_rotation_enabled",
            "s3_bucket_server_side_encryption"
          ],
          "Attributes": [{ "Section": "加密管理" }]
        }
      ]
    }
合规专家可以快速的完成新合规框架的整理—理解监管条文、映射到 Prowler 的检查项目录而无需任何编程。这与传统方式的对比如下：
对比项 | AWS Config 自定义规则 | Prowler 自定义框架  
---|---|---  
新增一个框架 | 编写 N 个 Lambda + N 条 Config Rule | 编写 1 个 JSON 文件  
所需技能 | Python/Node.js 开发 | 合规知识 + JSON 编辑  
新增一个条款 | 修改代码 + 测试 + 部署 | 在 Checks 数组中添加一个 ID  
框架版本升级 | 重写受影响的 Lambda | 复制 JSON，修改映射  
时间成本 | 数周到数月 | 数小时到 1 天  
维护主体 | 开发团队 | 合规团队可自主维护  
### 8.2 已构建的 9 个自定义合规框架
合规框架 | 地区 | 条款数 | 映射的检查规则数  
---|---|---|---  
APRA CPS 234 | 澳大利亚 | 5 | 21  
MAS TRM-G | 新加坡 | 6 | 22  
DORA | 欧盟 | 5 | 19  
等保 2.0 三级 | 中国 | 5 | 21  
PIPL 个人信息保护法 | 中国 | 4 | 15  
PDPA 个人数据保护法 | 新加坡 | 4 | 17  
NIS2 网络安全指令 | 欧盟 | 5 | 24  
MiCA 加密资产市场法规 | 欧盟 | 6 | 26  
K-ISMS-P | 韩国 | 4 | 15  
## **九、痛点二的解决思路：生成式 AI 合规分析**
当前方案集成了 [AWS Bedrock](<https://aws.amazon.com/cn/bedrock/>) 上的LLM模型。当用户请求对某次扫描进行生成式AI分析时，方案构建的提示词包含四个层次：
  * 扫描结果——通过/失败的检查项列表，含严重级别和受影响资源
  * 框架元数据——框架名称、监管机构、行业、地区
  * 条款结构——条款层级和描述
  * Rationale（自定义框架）——每个检查项映射到每个条款的原因
### 9.1 Rationale 文档
在自定义框架上做的额外投入：Rationale（映射逻辑），标准的 Prowler 自定义框架只有”条款 → 检查项”的映射。在标准的条款-检查项映射之外，已为每个自定义框架编写了 Rationale 文档——Markdown 格式，逐条说明每个检查项映射到每个条款的原因。
例如 APRA CPS 234 的 rationale：
iam_root_mfa_enabled → CPS 234 第 8.1.2.1 条映射原因：8.1.2.1 要求对管理用户进行严格的身份标识和鉴别。根账户 MFA 保护最高权限的管理账户。
kms_cmk_rotation_enabled → CPS 234 第 8.1.4.1 条映射原因：8.1.4.1 要求密码技术的持续有效性。KMS 密钥自动轮换确保加密密钥定期更新。
这些 rationale 在三个场景中发挥关键作用：
场景一：审计答辩。当审计师问”凭什么认为检查了 MFA 就满足了 CPS 234 第 8.1.2.1 条？”，可以出示映射原因，说明合规逻辑链。
场景二：GenAI 分析。Rationale 会自动注入到 AI 的提示词上下文中。这就是为什么 AI 能给出条款级的精确分析，而不是泛泛的安全建议——它”知道”每个检查项和条款之间的关系，以及这个关系的依据。
场景三：框架迁移和更新。当框架更新（如 PCI DSS v3.2.1 → v4.0），rationale 帮助判断：旧版的映射关系在新版中是否仍然成立？哪些条款变了需要重新映射？
### 9.2 Rationale 带来的分析精度差异
同一个失败项”KMS 密钥未开启自动轮换”，在两个不同框架下的 AI 分析对比：
PCI DSS v4.0（内置框架，无 Rationale）：KMS 密钥未开启自动轮换可能影响 PCI DSS Requirement 3 的加密要求。建议开启自动轮换。
MAS TRM-G（自定义框架，有 Rationale）：KMS 密钥未开启自动轮换违反了 MAS TRM-G 第 9.2.1 条”加密密钥管理”。该条款要求金融机构定期轮换加密密钥以保持加密保护的持续有效性。在 MAS 技术风险评估中，这通常影响整体风险评级。修复命令：aws kms enable-key-rotation –key-id <key-arn>
这使LLM模型获得每个检查项与条款之间关系的具体知识——从而实现条款级分析，而非泛泛的安全建议。
### 9.3 GenAI 合规审计报告
生成的合规审计报告服务于多个利益相关方：
报告章节 | 目标受众 | 内容  
---|---|---  
总体安全态势 | CISO / 管理层 | 整体通过率、风险等级评估  
失败项深度分析 | 安全工程师 | 逐项：受影响资源、条款关联、风险说明  
修复建议 | 运维团队 | 可执行的 CLI 命令和 IaC 代码片段  
合规差距映射表 | 合规 / 审计团队 | 失败条款交叉对照表  
优先级路线图 | 项目管理 | 紧急（24h）/ 短期（2 周）/ 长期（3 个月）  
关键价值：一份报告同时服务 CISO、安全工程师、合规团队和项目经理四个角色。不再需要人工从扫描结果中”翻译”出不同角色需要的信息。过去把扫描结果映射到框架条款、评估业务影响、生成修复建议——这些只有资深安全顾问才能做的事情。现在大语言模型可以在 30 秒内完成，而且对后续人工分析提供了更加方便和细节的修复建议。
## **十、界面展示**
### 10.1 合规仪表盘
每个框架一张得分卡，颜色编码直观反映合规状态。打开页面即可了解当前合规全貌。
[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/05/11/based-on-prowler-genai-build-fintech-intelligent-compliance-5.jpg>) [图5 合规仪表盘——框架得分卡总览]  
---  
### 10.2 框架浏览与检查项
51 个框架按行业/地区分类。点击任一框架查看完整的 Requirement → 检查项。自定义框架（如 MAS TRM-G）额外显示每个检查项的映射原因。
[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/05/11/based-on-prowler-genai-build-fintech-intelligent-compliance-6.png>) [图6 框架浏览页面]  
---  
[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/05/11/based-on-prowler-genai-build-fintech-intelligent-compliance-7.jpg>) [图7 框架检查项详情]  
---  
### 10.3 扫描结果与 AI 分析
扫描详情页展示通过率、严重级别分布、逐条结果。点击”AI 解读”，GenAI 在 15–30 秒内生成条款级合规分析报告。
[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/05/11/based-on-prowler-genai-build-fintech-intelligent-compliance-8.png>) [图8 扫描结果详情页]  
---  
[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/05/11/based-on-prowler-genai-build-fintech-intelligent-compliance-9.jpg>) [图9 GenAI 合规解读报告]  
---  
### 10.4 扫描结果自动导入 Security Hub
[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/05/11/based-on-prowler-genai-build-fintech-intelligent-compliance-10.jpg>) [图10 扫描结果自动导入 AWS Security Hub]  
---  
## **十一、技术详解**
### 11.1 扫描执行：ECS Fargate 按需任务
Prowler CLI 以按需 Fargate 任务运行，而非常驻服务：
    # extension-api/services/prowler_cli_executor.py
    class ProwlerCliExecutor:
        async def run_scan(self, scan_id, framework_id, region=None):
            if self.scan_mode == "ecs":
                response = self.ecs_client.run_task(
                    cluster=self.cluster_arn,
                    taskDefinition=self.task_def_arn,
                    launchType="FARGATE",
                    overrides={
                        "containerOverrides": [{
                            "name": "prowler-cli",
                            "command": [
                                "aws", "--compliance", framework_id,
                                "--output-formats", "json-ocsf", "csv",
                                "--output-bucket", self.reports_bucket,
                                "--security-hub",
                                "--no-banner",
                                "--ignore-exit-code-3"
                            ]
                        }]
                    },
                    networkConfiguration={...}
                )
                return response["tasks"][0]["taskArn"]
            else:  # 本地开发模式
                # subprocess 执行
                ...
关键设计决策：
  * -ignore-exit-code-3：Prowler 在存在 FAIL findings 时返回退出码 3（不是错误）。不加此标志，每次发现问题的扫描都会显示为”失败”。
  * -no-banner：抑制动画进度条，避免容器中 stdout 缓冲区问题。
  * 双模式执行：同一套代码通过 SCAN_MODE 环境变量支持 ECS（生产）和 subprocess（本地开发）两种模式。
### 11.2 自定义框架部署：复制自定义策略到容器镜像
    Dockerfile
    # Dockerfile.prowler-cli
    FROM prowlercloud/prowler:latest
    COPY compliance/custom/*.json /app/prowler/compliance/aws/
自定义框架 JSON 文件在构建时复制到 Prowler 镜像中。运行 prowler aws –compliance mas_trmg_aws 时，Prowler 自动发现自定义框架——无需额外配置。
### 11.3 双模式存储架构
本方案采用双模式存储模式，实现开发到生产的无缝切换：
数据层 | 生产环境 | 本地开发  
---|---|---  
扫描任务 | Amazon DynamoDB | SQLite (data/scan_tasks.db)  
扫描配置 | Amazon DynamoDB | SQLite (data/scan_profiles.db)  
GenAI 配置 + 报告 | Amazon DynamoDB | SQLite (data/genai_config.db)  
扫描报告 | Amazon S3 | 本地文件系统 (data/prowler-output/)  
USE_LOCAL_METADATA 环境变量控制存储层切换。同一套 FastAPI 应用代码在两种模式下运行——只有存储后端不同。
### 11.4 定时调度：Amazon EventBridge Scheduler（生产）和 asyncio（本地）
    # 生产环境：Amazon EventBridge Scheduler + HTTP 目标
    scheduler.create_schedule(
        Name=schedule_name,
        ScheduleExpression=schedule_expression,  # "rate(1 day)" 或 "cron(0 2 * * ? *)"
        Target={
            "Arn": api_arn,
            "Input": json.dumps({"profile_id": profile_id}),
            ...
        }
    )
    # 本地开发：asyncio 后台任务
    async def _run_scheduled_scan(profile_id, interval_seconds):
        while True:
            await asyncio.sleep(interval_seconds)
            await trigger_scan(profile_id)
## **十二、总结**
本文展示了如何构建一套持续合规方案，解决跨境金融机构面临的三个核心挑战：
  * 重复评估 → 一次 Prowler 扫描同时映射到所有适用的 51 个合规框架。
  * 解读鸿沟 → 结合扫描结果、框架元数据和 Rationale 文档，生成条款级分析报告。一份报告同时服务 CISO、安全工程师、合规团队和项目管理者。
  * 时间点审计局限 → 实现每日或每周自动扫描，合规仪表盘追踪趋势变化。
  * *前述特定亚马逊云科技生成式人工智能相关的服务目前在亚马逊云科技海外区域可用。亚马逊云科技中国区域相关云服务由西云数据和光环新网运营，具体信息以中国区域官网为准。
**下一步行动：**
**相关产品：**
  * [Amazon Security Hub](<https://aws.amazon.com/cn/security-hub/?p=bl_pr_security-hub_l=1>) — 安全态势管理
  * [Amazon S3](<https://aws.amazon.com/cn/s3/?p=bl_pr_s3_l=2>) — 适用于 AI、分析和存档的几乎无限的安全对象存储
  * [Amazon Bedrock](<https://aws.amazon.com/cn/bedrock/?p=bl_pr_bedrock_l=3>) — 用于构建生成式人工智能应用程序和代理的端到端平台
  * [Amazon ECS](<https://aws.amazon.com/cn/ecs/?p=bl_pr_ecs_l=4>) — 完全托管的容器编排服务
  * [Amazon DynamoDB](<https://aws.amazon.com/cn/dynamodb/?p=bl_pr_dynamodb_l=5>) — 无服务器分布式 NoSQL 数据库
**相关文章：**
  * [基于 Amazon EKS 和 Graviton 构建多租户 AI Agent 平台：OpenClaw on Kubernetes 实践](<https://aws.amazon.com/cn/blogs/china/build-multi-tenant-ai-agent-on-eks-graviton-openclaw-k8s-practice/?p=bl_ar_l=1>)
  * [道通与亚马逊云科技联合推动充电运营全面进入智能化时代](<https://aws.amazon.com/cn/blogs/china/autel-and-aws-advance-charging-operations-into-the-intelligent-era/?p=bl_ar_l=2>)
  * [基于视频理解的智能视频剪辑指南](<https://aws.amazon.com/cn/blogs/china/intelligent-video-editing-guide-based-on-video-understanding/?p=bl_ar_l=3>)
  * [使用Amazon Quick Suite定制成本分析智能体](<https://aws.amazon.com/cn/blogs/china/use-amazon-quicksight-to-customize-cost-analysis-agents/?p=bl_ar_l=4>)
  * [Apache SeaTunnel 创新加速 ：AIDLC 方法论实践](<https://aws.amazon.com/cn/blogs/china/apache-seatunnel-aidlc-practice/?p=bl_ar_l=5>)
*前述特定亚马逊云科技生成式人工智能相关的服务目前在亚马逊云科技海外区域可用。亚马逊云科技中国区域相关云服务由西云数据和光环新网运营，具体信息以中国区域官网为准。
## 本篇作者
### 刘春华
亚马逊云科技金融行业资深解决方案架构师。在资本市场、支付以及 Web3 领域拥有丰富的从业经验。目前主要负责金融行业解决方案的架构设计与创新。致力于 Agentic AI 与大语言模型在智能投研、量化交易等场景的落地，深耕分布式量化回测及高频交易架构的探索与实践，并结合 Web3（如稳定币支付、RWA 资产代币化）的创新能力，赋能金融机构实现技术突围与业务合规转型。
### 黄曦
亚马逊云科技金融行业解决方案架构师， 企业级敏捷教练，专注于为量化基金、券商等资本市场客户提供云原生架构设计与数字化转型方案，在高性能交易系统、量化策略回测平台、实时行情处理及低延迟架构等领域拥有深入的技术积累。
* * *
## AWS 架构师中心：云端创新的引领者
探索 AWS 架构师中心，获取经实战验证的最佳实践与架构指南，助您高效构建安全、可靠的云上应用 **[](<https://aws.amazon.com/cn/solutions/architect-center/>)**|   
---|---