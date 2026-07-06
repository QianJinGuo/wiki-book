---
title: "通过 LiteLLM 实现 Amazon Bedrock 成本管控：实时限额、多维监控与平台级兜底"
source: rss
source_url: https://aws.amazon.com/cn/blogs/china/litellm-implement-amazon-bedrock-cost-real-time
ingested: 2026-06-12
feed_name: AWS China Blog
source_published: 2026-06-12
type: article
source_type: rss
sha256: "b9f88861e61bdbb640127e465b1d72203b2a0050807208bfe75fbf8f44aefc49"
---

# 通过 LiteLLM 实现 Amazon Bedrock 成本管控：实时限额、多维监控与平台级兜底

摘要：本文介绍如何通过 LiteLLM AI Gateway 实现 Amazon Bedrock 的实时成本控制、多维成本监控，并结合 AWS Budgets 构建平台级兜底保护，同时利用 AWS 原生安全服务防止 API Key 盗刷。方案覆盖”事前限额 → 事中监控 → 事后兜底 → 安全纵深”四个层面，帮助企业实现 AI 投入可预测、AI 资产不被盗。  
  
**目录**

01 一、背景与挑战

02 二、整体方案架构

03 三、实时成本控制：LiteLLM Virtual Key 限额

04 四、多维成本监控：Virtual Key Tag 实现成本归因

05 五、平台级兜底：AWS Budgets 自动阻断超预算调用

06 六、安全防护：防止 API Key 盗刷

07 七、其他成本监控方案参考：CloudTrail + Athena + Amazon Quick

08 八、总结

09 九、参考链接

* * *

## **一、背景与挑战**

[Amazon Bedrock](<https://aws.amazon.com/cn/bedrock/>) 按 Token 计费（输入 Token + 输出 Token），企业在享受 AI 能力的同时面临两大风险：

风险类型 | 典型场景 | 后果  
---|---|---  
成本失控 | 开发者调试时大量调用、Prompt 设计不当导致 Token 爆炸、死循环调用 | 月底收到意外高额账单  
资产被盗 | API Key 泄露、内部人员滥用、凌晨异常调用 | 巨额费用 + 数据泄露风险  
  
核心诉求：需要一套方案同时解决”花多少钱可控”和”谁在花钱可见”两个问题，并在应用层失效时有平台级兜底。

## **二、整体方案架构**

[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/06/12/litellm-implement-amazon-bedrock-cost-real-time-1.png>) [图1：Bedrock 成本管控与安全防护架构]  
---  
      
    
    ┌─────────────────────────────────────────────────────────────────────┐
    │                     多层纵深防御体系                                   │
    ├─────────────────────────────────────────────────────────────────────┤
    │                                                                     │
    │  ┌──────────┐    ┌──────────────┐    ┌────────────────────────┐    │
    │  │ 开发者    │───→│ LiteLLM Proxy │───→│ Amazon Bedrock         │    │
    │  │ 应用服务  │    │              │    │ (VPC Endpoint 内网访问)  │    │
    │  └──────────┘    │ • Virtual Key │    └────────────────────────┘    │
    │                  │ • Tag 花费追踪 │                                  │
    │                  │ • Rate Limit  │    ┌────────────────────────┐    │
    │                  │ • Budget 限额  │───→│ PostgreSQL             │    │
    │                  └──────────────┘    │ (花费 & 审计记录)        │    │
    │                                      └────────────────────────┘    │
    │                                                                     │
    │  ┌───────────────────────────────────────────────────────────────┐ │
    │  │              AWS 原生安全与兜底层                                │ │
    │  │                                                               │ │
    │  │  成本兜底：AWS Budgets + Budget Action → 自动 Deny          │ │
    │  │  网络层：VPC Endpoint + Source VPC 限制 + Security Group    │ │
    │  │  身份层：IAM 最小权限 + Key 分离 + Secrets Manager          │ │
    │  │  检测层：CloudTrail + GuardDuty + CloudWatch 异常检测       │ │
    │  └───────────────────────────────────────────────────────────────┘ │
    │                                                                     │
    └─────────────────────────────────────────────────────────────────────┘
    

## **三、实时成本控制：LiteLLM Virtual Key 限额**

LiteLLM 的 Virtual Key 机制可以为每个用户/团队/应用创建独立的 API Key，并设置精确的预算上限和速率限制。超限请求被实时拒绝，无需等待 AWS Billing 延迟。

前置条件：本文假设你已部署 LiteLLM Proxy，部署方式参考 [LiteLLM 生产级部署：基于 AWS ECS/EKS 的 AI Gateway 架构](<../blog1/blog-litellm-production-deployment-aws.md>)。

### 3.1 创建带预算限额的 Virtual Key，可以API或者界面上操作都可以
    
    
    curl -X POST 'http://***litellm-gateway***.com/key/generate' \
      -H 'Authorization: Bearer sk-1234' \
      -H 'Content-Type: application/json' \
      -d '{
        "models": ["bedrock-claude-opus-4-6", "bedrock-claude-opus-4-7"],
        "key_alias": "game1-qa",
        "max_budget": 50,
        "budget_duration": "1mo",
        "tpm_limit": 100000,
        "rpm_limit": 60,
        "metadata": {"tags": ["team:qa", "project:game1"]}
      }'
    

### 3.2 多窗口预算配置

LiteLLM 支持灵活的 Budget Window 机制，可同时设置多个时间窗口的预算限制：

[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/06/12/litellm-implement-amazon-bedrock-cost-real-time-2.png>) [图2：LiteLLM Budget Window 配置]  
---  
  
配置项 | 说明 | 示例  
---|---|---  
Max Budget (USD) | Key/User/Team 的总预算上限，超限立即拒绝 | $50  
Budget Duration | 预算重置周期 | 1mo（每月重置）  
Budget Windows – Daily | 每日预算上限，每天 UTC 0 点自动重置 | $5/天  
Budget Windows – Monthly | 每月预算上限，每月 1 日自动重置 | $100/月  
TPM Limit | 每分钟 Token 数限制，防止瞬时大量消耗 | 100000  
RPM Limit | 每分钟请求数限制 | 60  
  
多窗口组合策略示例： – 日限 $5 — 防止单日异常消耗（如死循环调用） – 月限 $100 — 控制整体预算 – TPM 100K — 防止瞬时 Token 爆炸

超过任一限额，LiteLLM 立即返回 429 Budget Exceeded，无需等待 AWS Billing 延迟。

### 3.3 验证效果

[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/06/12/litellm-implement-amazon-bedrock-cost-real-time-3.png>) [图3：模型调用测试结果]  
---  
  
Claude Opus 4.6 和 4.7 调用成功，超限后立即被拒绝

## **四、多维成本监控：Virtual Key Tag 实现成本归因**

通过为 Virtual Key 打上业务标签（Tag），可以在 Dashboard 中按团队、项目、环境等维度查看花费分布。

官方文档：[Request Tags for Spend Tracking](<https://docs.litellm.ai/docs/proxy/request_tags>)

### 4.1 为不同业务线创建带 Tag 的 Key

在 LiteLLM UI 中创建 Key 时，可以直接在 Metadata 中设置 Tags：

[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/06/12/litellm-implement-amazon-bedrock-cost-real-time-4.png>) [图4：Virtual Key Tag 配置]  
---  
  
也可以通过 API 创建：
    
    
    # 游戏 QA 团队
    curl -X POST 'http://localhost:4000/key/generate' \
      -H 'Authorization: Bearer sk-1234' \
      -d '{
        "models": ["bedrock-claude-opus-4-6", "bedrock-claude-opus-4-7"],
        "key_alias": "game1-qa",
        "metadata": {"tags": ["team:qa", "project:game1"]},
        "max_budget": 50
      }'
    
    # 生产服务
    curl -X POST 'http://localhost:4000/key/generate' \
      -H 'Authorization: Bearer sk-1234' \
      -d '{
        "models": ["bedrock-claude-opus-4-7"],
        "key_alias": "prod-service",
        "metadata": {"tags": ["team:prod", "env:production"]},
        "max_budget": 200
      }'
    

### 4.2 Dashboard 按 Tag 查看花费

在 LiteLLM Dashboard 中可按 Tag 维度查看花费：

[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/06/12/litellm-implement-amazon-bedrock-cost-real-time-5.png>) [图5：Spend Per Tag]  
---  
  
Tag | 花费 | 成功请求 | Token 消耗  
---|---|---|---  
team:prod | $0.0019 | 2 | 96  
team:qa | $0.0059 | 6 | 312  
project:game1 | $0.0059 | 6 | 312  
  
### 4.3 进阶：基于 Tag 的模型路由

不同业务线可路由到不同模型版本（QA 用标准版、生产用高配版）：
    
    
    model_list:
      - model_name: claude-opus
        litellm_params:
          model: bedrock/us.anthropic.claude-opus-4-6-v1
          tags: ["tier:standard"]
      - model_name: claude-opus
        litellm_params:
          model: bedrock/us.anthropic.claude-opus-4-7
          tags: ["tier:premium"]
    
    router_settings:
      enable_tag_filtering: true
    

## **五、平台级兜底：AWS Budgets 自动阻断超预算调用**

为什么需要兜底？ LiteLLM 提供实时限额，但作为应用层组件，存在服务中断、配置错误等风险。AWS Budgets 是平台级服务，即使所有应用层防护失效，它仍然是费用的最后一道防线。

### 5.1 工作原理
    
    
    Bedrock 服务产生花费
           ↓
    AWS Billing 按服务汇总花费（有 4-8h 延迟）
           ↓
    AWS Budgets 持续检查：Bedrock 服务花费 vs 预算阈值
           ↓
    ├── 达到 80% → 发送告警邮件
    └── 达到 100% → 触发 Budget Action
                            ↓
                  自动给用户附加 Deny Policy
                            ↓
                  用户再调用 Bedrock → 被拒绝（403）
                            ↓
                  下个月初自动移除 Deny Policy → 恢复访问
    

关键安全原理 — IAM Deny 优先原则：AWS 中 Deny 永远优先于 Allow。即使用户有 AmazonBedrockFullAccess，只要附加了 Deny Bedrock 的策略，就100% 无法访问。这是 [AWS IAM](<https://aws.amazon.com/cn/iam/>) 的底层机制，不可绕过。

### 5.2 架构图

[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/06/12/litellm-implement-amazon-bedrock-cost-real-time-6.png>) [图6：Bedrock Budget 架构图]  
---  
  
### 5.3 完整配置步骤

**Step 1：创建 Deny Policy**
    
    
    aws iam create-policy \
      --policy-name "DenyBedrockAccess" \
      --policy-document '{
        "Version": "2012-10-17",
        "Statement": [{
          "Effect": "Deny",
          "Action": [
            "bedrock:InvokeModel",
            "bedrock:InvokeModelWithResponseStream",
            "bedrock:Converse",
            "bedrock:ConverseStream"
          ],
          "Resource": "*"
        }]
      }'
    

**Step 2：创建 Budget Action Role**
    
    
    aws iam create-role \
      --role-name "BudgetActionRole" \
      --assume-role-policy-document '{
        "Version": "2012-10-17",
        "Statement": [{
          "Effect": "Allow",
          "Principal": {"Service": "budgets.amazonaws.com"},
          "Action": "sts:AssumeRole"
        }]
      }'
    
    aws iam put-role-policy \
      --role-name "BudgetActionRole" \
      --policy-name "BudgetActionPermissions" \
      --policy-document '{
        "Version": "2012-10-17",
        "Statement": [{
          "Effect": "Allow",
          "Action": ["iam:AttachUserPolicy", "iam:DetachUserPolicy"],
          "Resource": "arn:aws:iam::<YOUR_ACCOUNT_ID>:user/brclient"
        }]
      }'
    

**Step 3：创建 Budget + 自动阻断（按 Bedrock 服务过滤）**
    
    
    aws budgets create-budget \
      --account-id <YOUR_ACCOUNT_ID> \
      --budget '{
        "BudgetName": "Bedrock-Monthly-Budget",
        "BudgetLimit": {"Amount": "10", "Unit": "USD"},
        "TimeUnit": "MONTHLY",
        "BudgetType": "COST",
        "CostFilters": {"Service": ["Amazon Bedrock"]}
      }' \
      --notifications-with-subscribers '[
        {"Notification": {"NotificationType": "ACTUAL", "ComparisonOperator": "GREATER_THAN", "Threshold": 80, "ThresholdType": "PERCENTAGE"},
         "Subscribers": [{"SubscriptionType": "EMAIL", "Address": "<YOUR_EMAIL>"}]},
        {"Notification": {"NotificationType": "ACTUAL", "ComparisonOperator": "GREATER_THAN", "Threshold": 100, "ThresholdType": "PERCENTAGE"},
         "Subscribers": [{"SubscriptionType": "EMAIL", "Address": "<YOUR_EMAIL>"}]}
      ]' --region us-east-1
    
    aws budgets create-budget-action \
      --account-id <YOUR_ACCOUNT_ID> \
      --budget-name "Bedrock-Monthly-Budget" \
      --notification-type ACTUAL \
      --action-type APPLY_IAM_POLICY \
      --action-threshold '{"ActionThresholdValue": 100, "ActionThresholdType": "PERCENTAGE"}' \
      --definition '{"IamActionDefinition": {"PolicyArn": "arn:aws:iam::<YOUR_ACCOUNT_ID>:policy/DenyBedrockAccess", "Users": ["brclient"]}}' \
      --execution-role-arn "arn:aws:iam::<YOUR_ACCOUNT_ID>:role/BudgetActionRole" \
      --approval-model AUTOMATIC \
      --subscribers '[{"SubscriptionType": "EMAIL", "Address": "<YOUR_EMAIL>"}]' \
      --region us-east-1
    

也可通过控制台操作，参考 [AWS Budgets Actions 文档](<https://docs.aws.amazon.com/cost-management/latest/userguide/budgets-controls.html>)。

[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/06/12/litellm-implement-amazon-bedrock-cost-real-time-7.png>) [图7：Budget Bedrock 配置示例]  
---  
  
### 5.4 实测效果

当花费超过预算后，Budget Action 自动执行：

[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/06/12/litellm-implement-amazon-bedrock-cost-real-time-8.png>) [图8：Budget Action 自动阻断测试结果]  
---  
      
    
    {
      "error": true,
      "message": "User: arn:aws:iam::****:user/brclient is not authorized to perform: bedrock:InvokeModelWithResponseStream ... with an explicit deny in an identity-based policy: arn:aws:iam::****:policy/DenyBedrockAccess"
    }
    

### 5.5 注意事项

项目 | 说明  
---|---  
延迟 | Billing 数据有 4-8 小时延迟，不是实时阻断，因此需要 LiteLLM 做实时限额  
恢复 | 每月初自动重置，也可手动移除 Deny Policy 提前恢复  
成本 | 前 2 个 Action-enabled Budget 免费，之后 $0.10/天  
审批 | 可设为 MANUAL 模式，人工审批后才执行  
  
## **六、安全防护：防止 API Key 盗刷**

即使设置了预算限额，API Key 泄露仍可能在限额内造成损失或数据泄露。以下通过 AWS 原生安全服务构建纵深防御。

### 6.1 网络层：VPC Endpoint + Source IP 限制

通过 VPC Endpoint 确保 Bedrock 流量不经过公网，结合 IAM Condition 限制调用来源：
    
    
    {
      "Version": "2012-10-17",
      "Statement": [{
        "Effect": "Deny",
        "Action": "bedrock:*",
        "Resource": "*",
        "Condition": {
          "StringNotEquals": {"aws:SourceVpc": "vpc-xxxxxxxx"}
        }
      }]
    }
    

效果：即使 API Key 泄露，攻击者从 VPC 外部调用会被 IAM Deny 拦截返回 403。

### 6.2 检测层：异常调用发现

AWS 服务 | 用途  
---|---  
CloudTrail | 记录所有 Bedrock API 调用（谁、何时、从哪里）  
GuardDuty | 检测异常 API 调用模式（异常地理位置、异常时间）  
CloudWatch Anomaly Detection | 自动发现用量突增  
  
### 6.3 LiteLLM 内置安全能力

功能 | 说明  
---|---  
Rate Limiting | 按 Key/User/Team 设置 TPM/RPM 限制  
IP 白名单 | allowed_ips 限制 Key 使用来源  
模型白名单 | 每个 Key 只能访问授权的模型  
Key 过期 | 设置 duration，到期自动失效  
请求审计 | 所有请求记录到数据库  
  
### 6.4 安全最佳实践 Checklist

  * Bedrock 通过 VPC Endpoint 访问，IAM 限制 Source VPC
  * LiteLLM IAM Role 仅有 bedrock:InvokeModel 权限（最小权限）
  * 每个业务线/环境/人员使用独立 API Key
  * 所有 Key 设置 Budget 上限和过期时间
  * AWS Budgets 配置兜底保护
  * CloudTrail 开启 Bedrock 调用日志
  * Master Key 存储在 [AWS Secrets Manager](<https://aws.amazon.com/cn/secrets-manager/>)



## **七、其他成本监控方案参考：CloudTrail + Athena + Amazon Quick**

除了 LiteLLM 实时监控外，还可以利用 [AWS CloudTrail](<https://aws.amazon.com/cn/cloudtrail/>) 记录的 Bedrock API 调用日志，结合 Athena 进行 SQL 分析，再通过 Amazon Quick 实现自然语言查询——无需写 SQL，直接用中文/英文提问即可获得成本洞察。

### 7.1 方案架构
    
    
    Bedrock API 调用
           ↓
    CloudTrail 记录每次 InvokeModel 事件（含模型 ID、用户、时间）
           ↓
    日志存储到 S3
           ↓
    Athena 建表（结构化查询层）
           ↓
    ┌─────────────────────────────────────────────────┐
    │  SQL 分析：Athena 直接查询                        │
    │  自然语言分析：Amazon Quick（自然语言查询）   │
    │  （两者结合，技术人员用 SQL，管理层用自然语言提问） │
    └─────────────────────────────────────────────────┘
    

### 7.2 CloudTrail + Athena：SQL 查询分析

通过 Athena 直接查询 CloudTrail 日志中的 Bedrock 调用记录，实现按用户、模型、时间维度的成本分析。

**7.2.1 创建 Athena 表**
    
    
    CREATE EXTERNAL TABLE cloudtrail_bedrock_logs (
      eventTime STRING,
      eventSource STRING,
      eventName STRING,
      userIdentity STRUCT<
        type: STRING,
        arn: STRING,
        accountId: STRING,
        userName: STRING
      >,
      requestParameters STRING,
      responseElements STRING,
      sourceIPAddress STRING,
      userAgent STRING
    )
    ROW FORMAT SERDE 'org.apache.hive.hcatalog.data.JsonSerDe'
    LOCATION 's3://<YOUR_CLOUDTRAIL_BUCKET>/AWSLogs/<ACCOUNT_ID>/CloudTrail/';
    

**7.2.2 查询示例：按用户统计 Bedrock 调用次数**
    
    
    SELECT
      userIdentity.userName AS user_name,
      eventName,
      COUNT(*) AS call_count,
      DATE(from_iso8601_timestamp(eventTime)) AS call_date
    FROM cloudtrail_bedrock_logs
    WHERE eventSource = 'bedrock.amazonaws.com'
      AND eventName IN ('InvokeModel', 'InvokeModelWithResponseStream', 'Converse', 'ConverseStream')
    GROUP BY userIdentity.userName, eventName, DATE(from_iso8601_timestamp(eventTime))
    ORDER BY call_count DESC;
    

**7.2.3 查询示例：按模型统计调用分布**
    
    
    SELECT
      json_extract_scalar(requestParameters, '$.modelId') AS model_id,
      COUNT(*) AS invocation_count,
      COUNT(DISTINCT userIdentity.userName) AS unique_users
    FROM cloudtrail_bedrock_logs
    WHERE eventSource = 'bedrock.amazonaws.com'
      AND eventName = 'InvokeModel'
    GROUP BY json_extract_scalar(requestParameters, '$.modelId')
    ORDER BY invocation_count DESC;
    

### 7.3 Amazon Quick：自然语言查询成本数据

Amazon Quick 支持自然语言提问，将 Athena 中的 CloudTrail 数据接入后，管理者无需编写 SQL，直接用自然语言即可获得成本洞察。

**7.3.1 配置步骤**

  1. CloudTrail → S3：确保 CloudTrail 已开启并将日志写入 S3
  2. Athena 建表：创建 CloudTrail 日志表（如 5.2 所示）
  3. Amazon Quick 连接 Athena：在 Amazon Quick 中添加 Athena 作为数据源，选择 cloudtrail_bedrock_logs 表
  4. 启用自然语言查询：在 Amazon Quick 中开启自然语言查询功能



**7.3.2 自然语言查询示例**

接入数据后，可以直接在 Amazon Quick 中用自然语言提问：

自然语言提问 | Amazon Quick 返回结果  
---|---  
“上周哪个用户调用 Bedrock 最多？” | 自动生成用户调用排行榜  
“过去 30 天 Claude 模型的调用趋势” | 生成时间趋势折线图  
“哪些 IP 地址在非工作时间调用了 Bedrock？” | 筛选异常时段的来源 IP 列表  
“按模型对比本月和上月的调用量变化” | 生成模型维度的环比对比图  
“哪个团队的 InvokeModel 调用增长最快？” | 自动计算增长率并排序  
  
核心优势：管理层和非技术人员无需学习 SQL，直接用自然语言即可完成成本分析和异常排查。

**7.3.3 可视化 Dashboard 维度**

Amazon Quick 还可以自动生成可视化 Dashboard：

维度 | 可视化内容  
---|---  
时间趋势 | 每日/每周 Bedrock 调用量趋势图  
用户分布 | 各 IAM 用户/角色的调用占比饼图  
模型使用 | 不同模型的调用次数对比柱状图  
异常检测 | 调用量突增的时间点标注  
来源 IP | 调用来源地理分布  
  
### 7.4 推荐组合方式

两者并非二选一，而是结合使用：

角色 | 使用方式 | 工具  
---|---|---  
开发/运维 | 编写精确 SQL 查询，深度排查问题 | Athena  
管理层/业务方 | 自然语言提问，快速获取成本概览 | Amazon Quick  
定期报表 | 自动生成周报/月报 Dashboard | Amazon Quick 定时刷新  
  
### 7.5 方案对比

维度 | LiteLLM（本文主方案） | CloudTrail + Athena | CloudTrail + Amazon Quick  
---|---|---|---  
实时拦截 |  超限立即拒绝 |  仅分析 |  仅分析  
查询方式 | Dashboard 界面 | SQL | 自然语言  
分析深度 | 中 |  灵活 SQL |  AI 辅助洞察  
使用门槛 | 低 | 需要 SQL 能力 |  零门槛（自然语言）  
额外成本 | LiteLLM 部署成本 | Athena 查询费用 | Amazon Quick 订阅费  
适用阶段 | 实时管控 | 事后深度分析 | 日常成本洞察  
  
推荐组合：LiteLLM 负责实时限额拦截 + CloudTrail + Athena 负责技术深度分析 + Amazon Quick 负责自然语言查询和管理层报表，形成”实时管控 + 深度分析 + 智能洞察”的完整闭环。

## **八、总结**

层次 | 方案 | 作用 | 时效性  
---|---|---|---  
实时限额 | LiteLLM Virtual Key + Budget | 超限立即拒绝 | 实时  
成本归因 | LiteLLM Virtual Key Tag + Dashboard | 按业务线/团队追踪花费 | 实时  
平台兜底 | AWS Budgets + Budget Actions | 超预算自动阻断 | 4-8h 延迟  
安全防护 | VPC Endpoint + IAM Condition + GuardDuty | 防止 Key 泄露被盗刷 | 实时  
  
核心设计原则：LiteLLM 实时拦截 + AWS Budgets 延迟兜底 = 双保险。即使 LiteLLM 服务异常，AWS Budgets 仍能确保费用不超限。

**下一步行动：**

**相关产品：**

  * [Amazon Bedrock](<https://aws.amazon.com/cn/bedrock/?p=bl_pr_bedrock_l=1>) — 用于构建生成式人工智能应用程序和代理的端到端平台
  * [Amazon CloudTrail](<https://aws.amazon.com/cn/cloudtrail/?p=bl_pr_cloudtrail_l=2>) — 审计跟踪
  * [Amazon Athena](<https://aws.amazon.com/cn/athena/?p=bl_pr_athena_l=3>) — 使用 SQL 在 S3 中查询数据
  * [Amazon IAM](<https://aws.amazon.com/cn/iam/?p=bl_pr_iam_l=4>) — 身份管理和访问权限
  * [Amazon VPC](<https://aws.amazon.com/cn/vpc/?p=bl_pr_vpc_l=5>) — 隔离云网络



**相关文章：**

  * [别让你的 Amazon Bedrock 模型为他人”打工”——API 调用安全防护指南](<https://aws.amazon.com/cn/blogs/china/amazon-bedrock-model-api-invocation-security-guide/?p=bl_ar_l=1>)
  * [Amazon Bedrock 护栏通过集中控制和管理支持跨账户防护](<https://aws.amazon.com/cn/blogs/china/amazon-bedrock-guardrails-supports-cross-account-safeguards-with-centralized-control-and-management/?p=bl_ar_l=2>)
  * [Amazon Bedrock模型推理的Serverless 异步架构 – 处理在线多模态高负载案例](<https://aws.amazon.com/cn/blogs/china/amazon-bedrock-model-inference-serverless-architecture-case-study/?p=bl_ar_l=3>)
  * [基于 Amazon Bedrock AgentCore Runtime 部署 Apache Doris MCP Server为 Quick Suite 等 AI 客户端提供原生数据分析能力](<https://aws.amazon.com/cn/blogs/china/runtime-deploy-apache-doris-mcp-server-quick-suite-ai-analytics/?p=bl_ar_l=4>)



## **九、参考链接**

  * [LiteLLM Virtual Keys 文档](<https://docs.litellm.ai/docs/proxy/virtual_keys>)
  * [LiteLLM Tag-Based Routing](<https://docs.litellm.ai/docs/proxy/tag_routing>)
  * [AWS Budgets Actions 配置](<https://docs.aws.amazon.com/cost-management/latest/userguide/budgets-controls.html>)
  * [IAM Principal-Based Cost Allocation](<https://docs.aws.amazon.com/awsaccountbilling/latest/aboutv2/iam-principal-cost-allocation.html>)
  * [Amazon VPC Endpoints for Bedrock](<https://docs.aws.amazon.com/bedrock/latest/userguide/vpc-interface-endpoints.html>)
  * [AWS CloudTrail 记录 Bedrock API 调用](<https://docs.aws.amazon.com/bedrock/latest/userguide/logging-using-cloudtrail.html>)
  * [使用 Athena 查询 CloudTrail 日志](<https://docs.aws.amazon.com/athena/latest/ug/cloudtrail-logs.html>)
  * [Amazon Quick 自然语言查询](<https://docs.aws.amazon.com/quick/latest/userguide/what-is.html>)



*前述特定亚马逊云科技生成式人工智能相关的服务目前在亚马逊云科技海外区域可用。亚马逊云科技中国区域相关云服务由西云数据和光环新网运营，具体信息以中国区域官网为准。

## 本篇作者

### 张振华

亚马逊云科技解决方案架构师，负责基于亚马逊云科技的云计算方案的架构和设计，在 Edge、Serverless 、容器化，微服务架构，云原生 DevOps 等方向具有丰富的实践经验。自加入亚马逊云科技后，专注于游戏行业，以及 GenAI 在游戏行业的应用。

### 刘振华

亚马逊云科技高级解决方案架构师。在加入 AWS 之前，曾在埃森哲、众安保险、华为等企业担任核心技术岗位，主导过多个大型软件系统的架构设计、研发交付与项目管理，积累了丰富的企业级实战经验。深耕 SaaS 与企业数智化转型领域，为金融、医疗健康与生命科学（HCLS）等行业客户提供云架构规划、迁移上云及现代化改造等技术咨询与赋能服务。当前聚焦于生成式 AI 技术在中国企业的落地实践，围绕 AI 编程助手、智能数据分析、AI for Science 等方向，帮助客户探索创新路径，加速业务智能化升级。

### 杨姝颖

亚马逊云科技解决方案架构师，在互联网行业工作多年，对推荐系统、广告投放引擎有丰富的开发经验。同时专注于生成式 AI 在中国区不同行业的落地和推广。

### 苏志勇

亚马逊云科技迁移解决方案架构师，主要负责企业上云跨云迁移相关的技术支持工作。曾担任研发工程师、解决方案架构师等职位，在 IT 专业服务和企业应用架构方面拥有多年的实践经验。

* * *

## 2026 亚马逊云科技中国峰会

智能投标、AI 质检、财务自动化、智能客服——生产级 Agent 全天开放体验。 [](<https://aws.amazon.com/cn/events/summits/shanghai/?ectrk=jyLXNovBYB51qgzUEipIpZcxlfE5%2Bs7NfDTnZwR7hFYtQmPUSToTuN%2FZO5doh20ZJ%2FloW6Rom0l3P4LLcoyUPA%3D%3D&sc_icampaign=glb-summit-blog-p1&sc_ichannel=ha&sc_iplace=blog&trk=ab30be54-aedd-480a-9364-ab0bf98e982d>) |   
---|---
