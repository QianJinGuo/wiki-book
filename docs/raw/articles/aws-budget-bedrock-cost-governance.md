---
title: "利用 AWS Budget 实现 Amazon Bedrock 用量监控、超预算告警与自动中断方案"
source: rss
source_url: https://aws.amazon.com/cn/blogs/china/leveraging-aws-budget-implement-amazon-bedrock/
ingested: 2026-06-01
feed_name: AWS
source_published: 2026-05-28T01:27:50Z
type: article
sha256: 1890821de5b46dc329d9dd2d64284bb252233ac3bf297fb83d70d6075b066369
tags: ['aws-budget', 'bedrock', 'cost-governance', 'finops']
---
# 利用AWS Budget实现Amazon Bedrock 用量监控、超预算告警与自动中断方案

## 利用AWS Budget实现Amazon Bedrock 用量监控、超预算告警与自动中断方案

摘要：本文介绍如何利用 AWS Budgets + Budget Actions 实现 Amazon Bedrock 的平台级成本兜底：按 IAM 用户追踪花费、设置预算告警、超预算时自动附加 Deny Policy 阻断调用，每月自动重置恢复。无需部署任何额外组件，纯 AWS 原生方案。

**目录**

01 [方案概述与原理](#section1)

02 [架构图](#section2)

03 [前置条件](#section3)

04 [步骤](#section4)

05 [验证与测试](#section5)

06 [局限性](#section6)

07 [注意事项与 FAQ](#section7)

08 [创建的资源清单](#section8)

09 [清理资源（如果不再需要）](#section9)

10 [参考文档](#section10)

* * *

## **1\. 方案概述与原理**

### 1.1 我们要解决什么问题？

[Amazon Bedrock](https://aws.amazon.com/cn/bedrock/) 按 token 计费（输入 token + 输出 token），如果团队中有人大量调用模型，可能产生意外高额账单。我们需要：

1.  看得见 — 知道每个 IAM 用户花了多少钱
2.  收得到 — 花费接近预算时收到告警邮件
3.  拦得住 — 超预算时自动阻断该用户的 Bedrock 访问

### 1.2 三个核心 AWS 服务

服务

作用

类比

IAM Principal-Based Cost Allocation

自动记录每次 Bedrock 调用是谁发起的，按用户拆分账单

费用详单，按照tag 统计，可以设置user，env，project等等业务标签

AWS Budgets

设置预算上限，到达阈值时发送通知

手机套餐余量提醒

AWS Budgets Actions

超预算时自动执行操作（如附加 Deny 策略）

费用用完自动停机

### 1.3 工作原理流程

```
用户调用 Bedrock API
       ↓
AWS 自动记录：谁调用的 + 花了多少钱（IAM Principal Cost Allocation）
       ↓
花费数据汇入 AWS Billing（有几小时延迟）
       ↓
AWS Budgets 持续检查：当前花费 vs 预算阈值
       ↓
├── 达到 80% → 发送告警邮件
└── 达到 100% → 发送告警邮件 + 触发 Budget Action
                        ↓
              自动给用户附加 Deny Policy
                        ↓
              用户再调用 Bedrock → 被拒绝（403）
                        ↓
              下个月初自动移除 Deny Policy → 恢复访问
```

### 1.4 关键概念解释

*   IAM Policy 的 Deny 优先原则：AWS 中 Deny 永远优先于 Allow。即使用户有 AmazonBedrockFullAccess，只要同时附加了一个 Deny Bedrock 的策略，就无法访问。
*   Billing 延迟：AWS 账单数据通常有 4-8 小时延迟，所以这不是实时阻断方案，但对于预算管控已经足够。

## **2\. 架构图**

架构图文件：[bedrock-budget-architecture.drawio](https://aws.amazon.com/cn/blogs/china/bedrock-budget-architecture.drawio)

[![](https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/05/27/leveraging-aws-budget-implement-amazon-bedrock-1.png)](https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/05/27/leveraging-aws-budget-implement-amazon-bedrock-1.png)

\[图1：Bedrock Budget 架构图\]

## **3\. 前置条件**

*   一个 AWS 账户（本例：<YOUR\_ACCOUNT\_ID>）
*   AWS CLI 已安装并配置好凭证（aws configure）
*   有 IAM 管理权限和 Billing 访问权限的用户
*   已知要监控的 IAM 用户名（本例：brclient）

### 3.1 如何找到谁在调用 Bedrock？

用 CloudTrail 查询最近的 Bedrock 调用记录：

```
aws cloudtrail lookup-events \
  --region us-east-1 \
  --lookup-attributes AttributeKey=EventSource,AttributeValue=bedrock.amazonaws.com \
  --max-results 20 \
  --query 'Events[].{Time:EventTime, User:Username, Event:EventName}' \
  --output table
```

示例输出：

```
|         Event         |            Time             |         User         |
+-----------------------+-----------------------------+----------------------+
|  ConverseStream       |  2026-05-05T16:16:21+08:00  |  brclient            |
|  ConverseStream       |  2026-05-05T11:01:16+08:00  |  <INSTANCE_ID>       |
|  ListFoundationModels |  2026-05-05T15:59:21+08:00  |  <YOUR_IAM_USER>     |
```

从这里可以看到 brclient 是主要的 Bedrock 调用者。

## **4\. 步骤**

### Step 1：配置 IAM Principal-Based Cost Allocation（按用户追踪花费）

**1\. 原理**

AWS 会自动在账单数据中记录每次 Bedrock API 调用的 IAM 身份。你只需要在 Billing Console 中”激活”这个功能。

**2\. 操作步骤**

1\. 登录 AWS Console → 进入 Billing and Cost Management

2\. 左侧菜单选择 Cost Allocation Tags

3\. 找到 AWS-Generated Cost Allocation Tags 标签页

4\. 激活 aws:PrincipalTag 相关标签

5\. （可选）给 IAM 用户打标签以便按部门/项目分组：

```
# 给 brclient 打上部门标签
aws iam tag-user --user-name brclient --tags Key=Department,Value=AI-Team
aws iam tag-user --user-name brclient --tags Key=Project,Value=ChatBot
```

6\. 在 Cost Explorer 中，选择 Group by → Tag → 即可按用户/部门查看 Bedrock 花费

详细操作文档参考[IAM Principal-Based Cost Allocation](https://docs.aws.amazon.com/awsaccountbilling/latest/aboutv2/iam-principal-cost-allocation.html)

**3\. 效果**

在 Cost Explorer 中可以看到类似： – brclient: $3.91（本月） – other-user: $1.20（本月）

### Step 2：创建 AWS Budget（设置预算和告警）

**1\. 原理**

AWS Budgets 会持续监控你指定服务的花费，当达到设定阈值时发送邮件通知。

**2\. 操作命令**

```
aws budgets create-budget \
  --account-id <YOUR_ACCOUNT_ID> \
  --budget '{
    "BudgetName": "Bedrock-Monthly-Budget",
    "BudgetLimit": {
      "Amount": "10",
      "Unit": "USD"
    },
    "TimeUnit": "MONTHLY",
    "BudgetType": "COST",
    "CostFilters": {
      "Service": ["Amazon Bedrock"]
    },
    "CostTypes": {
      "IncludeTax": true,
      "IncludeSubscription": true,
      "UseBlended": false,
      "IncludeRefund": false,
      "IncludeCredit": false,
      "IncludeUpfront": true,
      "IncludeRecurring": true,
      "IncludeOtherSubscription": true,
      "IncludeSupport": true,
      "IncludeDiscount": true,
      "UseAmortized": false
    }
  }' \
  --notifications-with-subscribers '[
    {
      "Notification": {
        "NotificationType": "ACTUAL",
        "ComparisonOperator": "GREATER_THAN",
        "Threshold": 80,
        "ThresholdType": "PERCENTAGE"
      },
      "Subscribers": [
        {
          "SubscriptionType": "EMAIL",
          "Address": "<YOUR_EMAIL>"
        }
      ]
    },
    {
      "Notification": {
        "NotificationType": "ACTUAL",
        "ComparisonOperator": "GREATER_THAN",
        "Threshold": 100,
        "ThresholdType": "PERCENTAGE"
      },
      "Subscribers": [
        {
          "SubscriptionType": "EMAIL",
          "Address": "<YOUR_EMAIL>"
        }
      ]
    }
  ]' \
  --region us-east-1
```

**3\. 参数说明**

参数

值

含义

BudgetName

Bedrock-Monthly-Budget

预算名称

Amount

10

月度预算 $10

TimeUnit

MONTHLY

按月计算，还有按天，按小时等多种方式

CostFilters.Service

Amazon Bedrock

只监控 Bedrock 服务

Threshold 80%

ACTUAL

实际花费到 $8 时告警

Threshold 100%

ACTUAL

实际花费到 $10 时告警

**4\. 验证**

```
aws budgets describe-budget \
  --account-id <YOUR_ACCOUNT_ID> \
  --budget-name "Bedrock-Monthly-Budget" \
  --region us-east-1
```

### Step 3：创建 Deny Policy（准备中断策略）

**1\. 原理**

创建一个 IAM Policy，明确拒绝（Deny）Bedrock 的推理 API。由于 AWS 的 Deny 优先原则，即使用户有 FullAccess，附加这个 Deny 策略后就无法调用 Bedrock。

**2\. 操作命令**

```
aws iam create-policy \
  --policy-name "DenyBedrockAccess" \
  --policy-document '{
    "Version": "2012-10-17",
    "Statement": [
      {
        "Effect": "Deny",
        "Action": [
          "bedrock:InvokeModel",
          "bedrock:InvokeModelWithResponseStream",
          "bedrock:Converse",
          "bedrock:ConverseStream"
        ],
        "Resource": "*"
      }
    ]
  }'
```

**3\. 说明**

*   只 Deny 了推理相关的 API（InvokeModel、Converse）
*   没有 Deny ListModels 等只读操作，用户仍然可以查看模型列表
*   这个策略创建后不会立即生效，只有被附加到用户时才起作用

### Step 4：创建 Budget Action Role（授权 Budgets 执行操作）

**1\. 原理**

AWS Budgets 需要一个 IAM Role 来代替你执行”附加策略”的操作。这个 Role 的信任关系允许 budgets.amazonaws.com 服务来 Assume 它。

**2\. 操作命令**

创建 Role

```
aws iam create-role \
  --role-name "BudgetActionRole" \
  --assume-role-policy-document '{
    "Version": "2012-10-17",
    "Statement": [
      {
        "Effect": "Allow",
        "Principal": {
          "Service": "budgets.amazonaws.com"
        },
        "Action": "sts:AssumeRole"
      }
    ]
  }'
```

给 Role 授权（允许它附加/移除策略）

```
aws iam put-role-policy \
  --role-name "BudgetActionRole" \
  --policy-name "BudgetActionPermissions" \
  --policy-document '{
    "Version": "2012-10-17",
    "Statement": [
      {
        "Effect": "Allow",
        "Action": [
          "iam:AttachUserPolicy",
          "iam:DetachUserPolicy"
        ],
        "Resource": "arn:aws:iam::<YOUR_ACCOUNT_ID>:user/brclient"
      }
    ]
  }'
```

**3\. 说明**

*   Trust Policy 让 AWS Budgets 服务可以扮演这个 Role
*   Permission Policy 只允许对 brclient 用户进行策略附加/移除操作（最小权限原则）

### Step 5：创建 Budget Action（超预算自动中断）

**1\. 原理**

将前面创建的 Budget、Deny Policy、Action Role 串联起来：当 Budget 检测到花费超过阈值时，自动使用 Action Role 将 Deny Policy 附加到目标用户。

**2\. 操作命令**

```
aws budgets create-budget-action \
  --account-id <YOUR_ACCOUNT_ID> \
  --budget-name "Bedrock-Monthly-Budget" \
  --notification-type ACTUAL \
  --action-type APPLY_IAM_POLICY \
  --action-threshold '{
    "ActionThresholdValue": 100,
    "ActionThresholdType": "PERCENTAGE"
  }' \
  --definition '{
    "IamActionDefinition": {
      "PolicyArn": "arn:aws:iam::<YOUR_ACCOUNT_ID>:policy/DenyBedrockAccess",
      "Users": ["brclient"]
    }
  }' \
  --execution-role-arn "arn:aws:iam::<YOUR_ACCOUNT_ID>:role/BudgetActionRole" \
  --approval-model AUTOMATIC \
  --subscribers '[
    {
      "SubscriptionType": "EMAIL",
      "Address": "<YOUR_EMAIL>"
    }
  ]' \
  --region us-east-1
```

**3\. 参数说明**

参数

值

含义

notification-type

ACTUAL

基于实际花费（非预测）

action-type

APPLY\_IAM\_POLICY

操作类型：附加 IAM 策略

ActionThresholdValue

100

100% 预算时触发

PolicyArn

DenyBedrockAccess

要附加的 Deny 策略

Users

brclient

目标用户

approval-model

AUTOMATIC

自动执行，无需人工审批

**4\. 验证**

```
aws budgets describe-budget-actions-for-budget \
  --account-id <YOUR_ACCOUNT_ID> \
  --budget-name "Bedrock-Monthly-Budget" \
  --region us-east-1
```

预期输出中应看到 “Status”: “STANDBY”（待命中，等待触发）。

## **5\. 验证与测试**

### 5.1 查看当前预算状态

```
aws budgets describe-budget \
  --account-id <YOUR_ACCOUNT_ID> \
  --budget-name "Bedrock-Monthly-Budget" \
  --region us-east-1 \
  --query 'Budget.{Name:BudgetName, Limit:BudgetLimit.Amount, Spent:CalculatedSpend.ActualSpend.Amount, Forecast:CalculatedSpend.ForecastedSpend.Amount}'
```

我们的实际测试结果：

```
{
  "Name": "Bedrock-Monthly-Budget",
  "Limit": "10.0",        // 预算 $10
  "Spent": "3.909",       // 已花 $3.91
  "Forecast": "4.346"     // 预测本月 $4.35
}
```

### 5.2 测试触发流程

1\. 用 brclient 的凭证持续调用 Bedrock，直到花费超过 $8

2\. 检查邮箱是否收到 80% 告警邮件

3\. 继续调用直到超过 $10

4\. 检查 Deny Policy 是否被自动附加：

```
aws iam list-attached-user-policies --user-name brclient
```

5\. 尝试用 brclient 调用 Bedrock，应该返回 AccessDenied

### 5.3 手动模拟（不想等花费累积）

注意测试 IAM principal Tag的时候，需要24小时才回生效

可以临时把预算改成 $3（低于当前已花费的 $3.91）来触发：

```
aws budgets update-budget --account-id <YOUR_ACCOUNT_ID> --new-budget '{
  "BudgetName": "Bedrock-Monthly-Budget",
  "BudgetLimit": {"Amount": "#", "Unit": "USD"},
  "TimeUnit": "MONTHLY",
  "BudgetType": "COST",
  "CostFilters": {"Service": ["Amazon Bedrock"]}
}'
```

[![](https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/05/27/leveraging-aws-budget-implement-amazon-bedrock-2.png)](https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/05/27/leveraging-aws-budget-implement-amazon-bedrock-2.png)

\[图2：手动模拟测试\]

响应的用户调用bedrock的时候就会爆如下错误

```
{
  "error": true,
  "message": "User: arn:aws:iam::****:user/brclient is not authorized to perform: bedrock:InvokeModelWithResponseStream on resource: arn:aws:bedrock:us-east-1:****:inference-profile/us.deepseek.r1-v1:0 with an explicit deny in an identity-based policy: arn:aws:iam::****:policy/DenyBedrockAccess"
}
```

## **6\. 局限性**

### 6.1 Budget 已支持 IAM Principal Tag Filter ✅

更新（2026-05）：经验证，AWS Budgets 现已支持通过 Tag 维度按 iamPrincipal/user 过滤。

在 AWS Budgets Console 中创建/编辑 Budget 时，可以添加如下 Filter：

维度

类型

操作

值

Dimension

Tag

Includes

iamPrincipal/user = brclient

这意味着现在可以为单个 IAM 用户创建独立的 Bedrock 预算，实现按用户级别的费用监控和告警。

**6.1.1 当前 Bedrock-Monthly-Budget 实际配置**

通过 aws budgets describe-budget 确认，当前 budget 使用的是新版 FilterExpression：

```
{
  "FilterExpression": {
    "And": [
      {
        "Dimensions": {
          "Key": "SERVICE",
          "Values": ["Amazon Bedrock"]
        }
      },
      {
        "Not": {
          "Dimensions": {
            "Key": "RECORD_TYPE",
            "Values": ["Credit", "Refund"]
          }
        }
      }
    ]
  }
}
```

*   Budget 限额: $4.0 USD/月
*   当前花费: $4.037（已超预算）
*   Budget Action 状态: EXECUTION\_SUCCESS（DenyBedrockAccess 已自动附加到 brclient）

**6.1.2 如何添加 IAM Principal Tag Filter**

如果需要按用户过滤，可以在 Console 中编辑 Budget，添加 Tag filter： – Filter type: Tag – Tag Key: iamPrincipal/user – Includes Values: brclient

或通过 CLI 更新 budget，在 FilterExpression 中添加 Tag 条件：

```
{
  "And": [
    {
      "Dimensions": {
        "Key": "SERVICE",
        "Values": ["Amazon Bedrock"]
      }
    },
    {
      "Tags": {
        "Key": "iamPrincipal/user",
        "Values": ["brclient"]
      }
    },
    {
      "Not": {
        "Dimensions": {
          "Key": "RECORD_TYPE",
          "Values": ["Credit", "Refund"]
        }
      }
    }
  ]
}
```

**ℹ️ 注意：**

IAM Principal Tag 需要先在 Billing Console 的 Cost Allocation Tags 中激活，激活后约 24 小时才能在 Budget filter 中生效。

### 6.2 历史参考

账单（Cost Explorer）上已支持 IAM Principal：

[![](https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/05/27/leveraging-aws-budget-implement-amazon-bedrock-3.png)](https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/05/27/leveraging-aws-budget-implement-amazon-bedrock-3.png)

\[图3：billing-suport-tag-user\]

Budget 上现在也已支持 IAM Principal Tag filter（Dimension → Tag → iamPrincipal/user → Includes → brclient）：

[![](https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/05/27/leveraging-aws-budget-implement-amazon-bedrock-4.png)](https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/05/27/leveraging-aws-budget-implement-amazon-bedrock-4.png)

\[图4：Budget-IAM-tag-support\]

## **7\. 注意事项与 FAQ**

### Q: 超预算后多久会生效？

A: AWS Billing 数据有 4-8 小时延迟。Budget Action 在 Billing 数据更新后才会触发。这不是实时阻断。

### Q: 下个月会自动恢复吗？

A: 是的。Budget Action 的 IAM Policy 类型会在每个预算周期开始时自动重置（移除 Deny Policy），用户恢复访问。

### Q: 如果需要实时阻断怎么办？

A: 需要在 Bedrock 前面加一层网关（如 [AWS Step Functions](https://aws.amazon.com/cn/step-functions/) Cost Sentry 或 LiteLLM Proxy），在每次请求前检查 token 预算。

### Q: 如何按用户设置不同的预算？

A: 需要为每个用户创建单独的 Budget，并使用 Cost Allocation Tags 过滤。

### Q: approval-model 可以改成需要审批吗？

A: 可以，把 AUTOMATIC 改成 MANUAL。超预算时会发邮件通知你，你在 Console 中手动批准后才执行。

### Q: 创建的资源会产生费用吗？

A: Budget 监控和通知免费。前 2 个 Action-enabled Budget 免费，之后每个 $0.10/天。

## **8\. 创建的资源清单**

资源类型

名称 / ID

用途

AWS Budget

Bedrock-Monthly-Budget

月度 $10 预算

IAM Policy

DenyBedrockAccess

超预算时附加的 Deny 策略

IAM Role

BudgetActionRole

授权 Budgets 服务执行操作

Budget Action

自动执行逻辑

## **9.清理资源（如果不再需要）**

```
# 删除 Budget Action
aws budgets delete-budget-action --account-id <YOUR_ACCOUNT_ID> \
  --budget-name "Bedrock-Monthly-Budget" \
  --action-id "<ACTION_ID>" --region us-east-1

# 删除 Budget
aws budgets delete-budget --account-id <YOUR_ACCOUNT_ID> \
  --budget-name "Bedrock-Monthly-Budget" --region us-east-1

# 删除 IAM Policy（需要先确认没有附加到任何用户）
aws iam delete-policy --policy-arn arn:aws:iam::<YOUR_ACCOUNT_ID>:policy/DenyBedrockAccess

# 删除 Role 的内联策略，再删除 Role
aws iam delete-role-policy --role-name BudgetActionRole --policy-name BudgetActionPermissions
aws iam delete-role --role-name BudgetActionRole
```

## **10.参考文档**

*   [IAM Principal-Based Cost Allocation](https://docs.aws.amazon.com/awsaccountbilling/latest/aboutv2/iam-principal-cost-allocation.html)
*   [AWS Budgets Actions 配置](https://docs.aws.amazon.com/cost-management/latest/userguide/budgets-controls.html)
*   [Bedrock CloudWatch 监控](https://docs.aws.amazon.com/bedrock/latest/userguide/monitoring.html)
*   [Proactive Cost Management for Bedrock (Blog)](https://aws.amazon.com/blogs/machine-learning/build-a-proactive-ai-cost-management-system-for-amazon-bedrock-part-1/)

**➡️ 下一步行动：**

**相关产品：**

*   [Amazon Bedrock](https://aws.amazon.com/cn/bedrock/?p=bl_pr_bedrock_l=1) — 用于构建生成式人工智能应用程序和代理的端到端平台
*   [Amazon IAM](https://aws.amazon.com/cn/iam/?p=bl_pr_iam_l=2) — 身份管理和访问权限
*   [Amazon Step Functions](https://aws.amazon.com/cn/step-functions/?p=bl_pr_step-functions_l=3) — 分布式应用程序的可视工作流
*   [Amazon CloudWatch](https://aws.amazon.com/cn/cloudwatch/?p=bl_pr_cloudwatch_l=4) — 可观测性工具
*   [Amazon CloudTrail](https://aws.amazon.com/cn/cloudtrail/?p=bl_pr_cloudtrail_l=5) — 审计跟踪

**相关文章：**

*   [Amazon Bedrock模型推理的Serverless 异步架构 – 处理在线多模态高负载案例](https://aws.amazon.com/cn/blogs/china/amazon-bedrock-model-inference-serverless-architecture-case-study/?p=bl_ar_l=1)
*   [别让你的 Amazon Bedrock 模型为他人”打工”——API 调用安全防护指南](https://aws.amazon.com/cn/blogs/china/amazon-bedrock-model-api-invocation-security-guide/?p=bl_ar_l=2)
*   [在 Amazon Bedrock 上为 Claude 应用设计稳健的 Prompt Cache 策略](https://aws.amazon.com/cn/blogs/china/amazon-bedrock-claude-application-design-prompt-cache-policy/?p=bl_ar_l=3)
*   [通过 Amazon Bedrock 运行 Claude Cowork 配置实践](https://aws.amazon.com/cn/blogs/china/claude-cowork-amazon-bedrock-configuration-practice/?p=bl_ar_l=4)
*   [Amazon Bedrock 护栏通过集中控制和管理支持跨账户防护](https://aws.amazon.com/cn/blogs/china/amazon-bedrock-guardrails-supports-cross-account-safeguards-with-centralized-control-and-management/?p=bl_ar_l=5)

\*前述特定亚马逊云科技生成式人工智能相关的服务目前在亚马逊云科技海外区域可用。亚马逊云科技中国区域相关云服务由西云数据和光环新网运营，具体信息以中国区域官网为准。

## 本篇作者

* * *

![](https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/05/15/summit-tag3.png)

## 亚马逊云科技中国峰会

开发者挑战赛现场开启，基于真实业务场景亲手构建 Agent。

[![](https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/05/25/yuyuecanhui.png)](https://aws.amazon.com/cn/events/summits/shanghai/?ectrk=jyLXNovBYB51qgzUEipIpZcxlfE5%2Bs7NfDTnZwR7hFYtQmPUSToTuN%2FZO5doh20ZJ%2FloW6Rom0l3P4LLcoyUPA%3D%3D&sc_icampaign=glb-summit-blog-p2&sc_ichannel=ha&sc_iplace=blog&trk=ab30be54-aedd-480a-9364-ab0bf98e982d)

![](https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/05/14/2026_Summits_Commercial_Banner_1440x657.png)
