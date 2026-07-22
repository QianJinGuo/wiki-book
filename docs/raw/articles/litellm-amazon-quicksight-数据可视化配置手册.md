---
source: rss
source_url: https://aws.amazon.com/cn/blogs/china/litellm-amazon-quicksight-visualization-configuration
ingested: 2026-06-15
feed_name: AWS China Blog
source_published: 2026-06-15
sha256: 5c59c8888023149bd7366acf5e5bd26a1c0ccc771f00b3e26ad90bc4aafeaf47
---

# LiteLLM + Amazon QuickSight 数据可视化配置手册

摘要：本文档介绍如何将 LiteLLM AI Gateway 的请求日志和费用数据接入 Amazon QuickSight，构建运维监控 Dashboard，实现对 LLM 使用量、费用、性能的可视化分析。  
  
**目录**

01 概述

02 前提条件

03 数据源一：S3 日志 + Athena

04 数据源二：Aurora PostgreSQL

05 QuickSight 配置步骤

06 安全最佳实践

07 运维 Dashboard 建议

08 常见问题

09 费用估算

10 参考链接

11 结语

* * *

## **1\. 概述**

本文档介绍如何将 LiteLLM AI Gateway 的请求日志和费用数据接入 [Amazon QuickSight](<https://aws.amazon.com/cn/quicksight/>)，构建运维监控 Dashboard，实现对 LLM 使用量、费用、性能的可视化分析。

### 1.1 架构图

[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/06/12/litellm-amazon-quicksight-visualization-configuration-1.png>) [图1：LiteLLM + QuickSight 架构图]  
---  
  
### 1.2 数据源对比

数据源 | 内容 | 实时性 | 适合场景  
---|---|---|---  
S3 + Athena | 每次请求的完整日志（含 messages、response） | 实时 | 请求级分析、内容审计  
Aurora PostgreSQL | 费用汇总表（按天/用户/团队/Tag） | 实时 | 费用统计、预算监控  
  
### 1.3 相比 LiteLLM 内置 UI 的优势

对比项 | LiteLLM 内置 Dashboard | QuickSight  
---|---|---  
自定义图表 | 固定视图，不可自定义 | 完全自定义，拖拽建图  
多维度交叉分析 | 有限 | 支持任意维度组合  
数据导出 | 不支持 | 支持 CSV/PDF 导出  
权限控制 | 需要 LiteLLM admin 权限 | 独立权限体系，可分享给非技术人员  
自然语言查询 | 不支持 | Amazon Q 自然语言建图  
告警 | 不支持 | 支持阈值告警  
历史数据 | 受数据库保留策略限制 | S3 永久保存  
  
## **2\. 前提条件**

  * AWS 账号已开通 Amazon QuickSight Enterprise Edition
  * LiteLLM Proxy 已部署并运行
  * LiteLLM 配置了 S3 日志回调和 Aurora PostgreSQL 数据库



### 2.1 LiteLLM 配置要求

确保 litellm_config.yaml 包含以下配置：
    
    
    litellm_settings:
      cache: true
      store_audit_logs: true
      success_callback: ["s3_v2"]
      s3_callback_params:
        s3_bucket_name: os.environ/S3_BUCKET_NAME
        s3_region_name: os.environ/AWS_DEFAULT_REGION
        s3_path: litellm-logs
        s3_endpoint_url: https://s3.amazonaws.com
    

## **3\. 数据源一：S3 日志 + Athena**

### 3.1 S3 日志结构

LiteLLM 将每次请求的完整日志以 JSON 格式写入 S3：
    
    
    s3://<bucket>/litellm-logs/
      ├── 2026-05-10/
      │   ├── time-01-07-22_chatcmpl-xxx.json
      │   └── ...
      ├── 2026-05-17/
      │   └── ...
    

每条日志包含的关键字段：
    
    
    {
      "id": "chatcmpl-xxx",
      "model": "bedrock/us.anthropic.claude-opus-4-6-v1",
      "status": "success",
      "response_time": 3.07,
      "response_cost": 0.0022495,
      "metadata": {
        "user_api_key_alias": "claudecode",
        "user_api_key_auth_metadata": {
          "tags": ["user:cloudcode-user1", "project:game1"]
        }
      },
      "cost_breakdown": {
        "input_cost": 0.0001595,
        "output_cost": 0.00209
      },
      "request_tags": ["user:cloudcode-user1", "project:game1"]
    }
    

### 3.2 创建 Athena 表

在 Athena 控制台（或 CLI）执行以下 DDL，创建外部表映射 S3 JSON 日志：
    
    
    CREATE EXTERNAL TABLE IF NOT EXISTS litellm_logs (
      id STRING,
      litellm_call_id STRING,
      trace_id STRING,
      call_type STRING,
      cache_hit STRING,
      stream STRING,
      status STRING,
      custom_llm_provider STRING,
      startTime DOUBLE,
      endTime DOUBLE,
      response_time DOUBLE,
      model STRING,
      metadata STRUCT<
        user_api_key_alias: STRING,
        user_api_key_spend: DOUBLE,
        user_api_key_user_id: STRING,
        user_api_key_request_route: STRING,
        requester_ip_address: STRING,
        user_agent: STRING,
        user_api_key_auth_metadata: STRUCT<
          tags: ARRAY<STRING>
        >
      >,
      messages ARRAY<STRUCT<role: STRING, content: STRING>>,
      response STRUCT<
        choices: ARRAY<STRUCT<
          finish_reason: STRING,
          message: STRUCT<content: STRING, role: STRING>
        >>,
        usage: STRUCT<
          completion_tokens: INT,
          prompt_tokens: INT,
          total_tokens: INT
        >
      >,
      response_cost DOUBLE,
      cost_breakdown STRUCT<
        input_cost: DOUBLE,
        output_cost: DOUBLE,
        total_cost: DOUBLE
      >,
      request_tags ARRAY<STRING>,
      model_group STRING,
      api_base STRING
    )
    ROW FORMAT SERDE 'org.openx.data.jsonserde.JsonSerDe'
    WITH SERDEPROPERTIES (
      'ignore.malformed.json' = 'true',
      'case.insensitive' = 'true'
    )
    STORED AS INPUTFORMAT 'org.apache.hadoop.mapred.TextInputFormat'
    OUTPUTFORMAT 'org.apache.hadoop.hive.ql.io.HiveIgnoreKeyTextOutputFormat'
    LOCATION 's3://<your-bucket>/litellm-logs/'
    TBLPROPERTIES ('has_encrypted_data'='false');
    

### 3.3 创建展平视图

创建视图将嵌套字段展平为独立列，方便 QuickSight 使用：
    
    
    CREATE OR REPLACE VIEW litellm_logs_flat AS
    SELECT
      id,
      status,
      custom_llm_provider,
      startTime,
      response_time,
      model,
      -- 时间字段
      from_unixtime(CAST(startTime AS BIGINT)) AS request_time,
      date(from_unixtime(CAST(startTime AS BIGINT))) AS request_date,
      hour(from_unixtime(CAST(startTime AS BIGINT))) AS request_hour,
      day_of_week(from_unixtime(CAST(startTime AS BIGINT))) AS request_day_of_week,
      -- 用户维度
      metadata.user_api_key_alias,
      metadata.requester_ip_address AS metadata_ip,
      metadata.user_agent AS metadata_user_agent,
      -- 从 tags 提取用户和项目
      regexp_extract(
        array_join(filter(metadata.user_api_key_auth_metadata.tags, t -> t LIKE 'user:%'), ','),
        'user:(.*)', 1
      ) AS tag_user,
      regexp_extract(
        array_join(filter(metadata.user_api_key_auth_metadata.tags, t -> t LIKE 'project:%'), ','),
        'project:(.*)', 1
      ) AS tag_project,
      -- 响应
      response.choices[1].finish_reason AS finish_reason,
      response.choices[1].message.content AS response_content,
      response.usage.completion_tokens AS usage_completion_tokens,
      response.usage.prompt_tokens AS usage_prompt_tokens,
      response.usage.total_tokens AS usage_total_tokens,
      -- 费用
      response_cost,
      cost_breakdown.input_cost,
      cost_breakdown.output_cost,
      cost_breakdown.total_cost,
      request_tags,
      model_group,
      api_base
    FROM litellm_logs
    

### 3.4 数据更新频率

环节 | 延迟  
---|---  
LiteLLM → S3 | 实时（秒级）  
S3 → Athena | 实时（Athena 直接读 S3，无缓存）  
Athena → QuickSight (Direct Query) | 实时  
Athena → QuickSight (SPICE) | 按刷新计划（最快每小时）  
  
## **4\. 数据源二：Aurora PostgreSQL**

### 4.1 Aurora 中的费用统计表

LiteLLM 自动在 Aurora 中维护以下汇总表：

表名 | 说明  
---|---  
LiteLLM_SpendLogs | 每次请求的花费明细  
LiteLLM_DailyTagSpend | 按 Tag（项目/环境）每日花费汇总  
LiteLLM_DailyUserSpend | 按用户每日花费汇总  
LiteLLM_DailyTeamSpend | 按团队每日花费汇总  
LiteLLM_VerificationToken | API Key 信息（别名、花费、预算）  
LiteLLM_AuditLog | 管理操作审计日志  
  
### 4.2 维度设计建议

维度 | 字段 | 用途  
---|---|---  
用户维度 | user_api_key_alias | 哪个 API Key / 谁在用  
项目维度 | tag（来自 request tags） | 哪个项目  
环境维度 | tag（如 env:prod） | 哪个环境  
模型维度 | model_group | 用了哪个模型  
时间维度 | date | 按天聚合  
  
## **5\. QuickSight 配置步骤**

### 5.1 IAM 权限配置

**5.1.1 QuickSight Service Role**

QuickSight 使用 IAM Role aws-quicksight-service-role-v0，需要附加以下策略：

策略 | 用途  
---|---  
AWSQuickSightS3Policy | 访问 S3 日志桶  
AWSQuicksightAthenaAccess | 访问 Athena 查询  
AWSQuickSightVPCPolicy | VPC 网络访问（连 Aurora）  
  
**5.1.2 S3 策略示例**
    
    
    {
      "Version": "2012-10-17",
      "Statement": [
        {
          "Effect": "Allow",
          "Action": "s3:ListAllMyBuckets",
          "Resource": "arn:aws:s3:::*"
        },
        {
          "Effect": "Allow",
          "Action": ["s3:GetObject", "s3:GetBucketLocation", "s3:ListBucket"],
          "Resource": [
            "arn:aws:s3:::<your-bucket>",
            "arn:aws:s3:::<your-bucket>/*"
          ]
        }
      ]
    }
    

**5.1.3 VPC 策略（连接 Aurora 需要）**
    
    
    {
      "Version": "2012-10-17",
      "Statement": [
        {
          "Effect": "Allow",
          "Action": [
            "ec2:CreateNetworkInterface",
            "ec2:ModifyNetworkInterfaceAttribute",
            "ec2:DeleteNetworkInterface",
            "ec2:DescribeSubnets",
            "ec2:DescribeSecurityGroups",
            "ec2:DescribeNetworkInterfaces",
            "ec2:DescribeVpcs"
          ],
          "Resource": "*"
        }
      ]
    }
    

### 5.2 启用 QuickSight 服务访问

  1. QuickSight 控制台 → 右上角用户图标 → Manage QuickSight
  2. Security & permissions → QuickSight access to AWS services → Manage
  3. 勾选： 
     * [Amazon Athena](<https://aws.amazon.com/cn/athena/>)
     * [Amazon S3](<https://aws.amazon.com/cn/s3/>)（选择 LiteLLM 日志桶）
     * [AWS Secrets Manager](<https://aws.amazon.com/cn/secrets-manager/>)（选择数据库密码 secret）
  4. 保存



### 5.3 创建 VPC Connection（连接 Aurora）
    
    
    aws quicksight create-vpc-connection \
      --aws-account-id <ACCOUNT_ID> \
      --vpc-connection-id litellm-vpc \
      --name litellm-vpc \
      --subnet-ids subnet-xxx subnet-yyy \
      --security-group-ids sg-xxx \
      --role-arn arn:aws:iam::<ACCOUNT_ID>:role/service-role/aws-quicksight-service-role-v0 \
      --region us-east-1
    

**重要：**

Aurora 安全组需要添加入站规则，允许 QuickSight VPC ENI 访问端口 5432：
    
    
    aws ec2 authorize-security-group-ingress \
      --group-id <aurora-sg-id> \
      --protocol tcp --port 5432 \
      --source-group <aurora-sg-id>
    

### 5.4 创建 Athena 数据源
    
    
    aws quicksight create-data-source \
      --aws-account-id <ACCOUNT_ID> \
      --data-source-id litellm-athena \
      --name "litellm-athena" \
      --type ATHENA \
      --data-source-parameters '{"AthenaParameters":{"WorkGroup":"primary"}}' \
      --region us-east-1
    

### 5.5 创建 Aurora 数据源（使用 Secrets Manager）
    
    
    aws quicksight create-data-source \
      --aws-account-id <ACCOUNT_ID> \
      --data-source-id litellm-aurora \
      --name "litellm-aurora" \
      --type POSTGRESQL \
      --data-source-parameters '{
        "PostgreSqlParameters": {
          "Host": "<aurora-cluster-endpoint>",
          "Port": 5432,
          "Database": "litellm"
        }
      }' \
      --credentials '{
        "SecretArn": "arn:aws:secretsmanager:us-east-1:<ACCOUNT_ID>:secret:<secret-name>"
      }' \
      --vpc-connection-properties '{
        "VpcConnectionArn": "arn:aws:quicksight:us-east-1:<ACCOUNT_ID>:vpcConnection/litellm-vpc"
      }' \
      --ssl-properties '{"DisableSsl": false}' \
      --region us-east-1
    

### 5.6 创建 Dataset 并设置每日刷新
    
    
    # 创建 Dataset（以 DailyTagSpend 为例）
    aws quicksight create-data-set \
      --aws-account-id <ACCOUNT_ID> \
      --data-set-id litellm-daily-tag-spend \
      --name "LiteLLM Daily Tag Spend" \
      --import-mode SPICE \
      --physical-table-map '{
        "table": {
          "RelationalTable": {
            "DataSourceArn": "arn:aws:quicksight:us-east-1:<ACCOUNT_ID>:datasource/litellm-aurora",
            "Schema": "public",
            "Name": "LiteLLM_DailyTagSpend",
            "InputColumns": [
              {"Name": "tag", "Type": "STRING"},
              {"Name": "date", "Type": "STRING"},
              {"Name": "model", "Type": "STRING"},
              {"Name": "spend", "Type": "DECIMAL"},
              {"Name": "api_requests", "Type": "INTEGER"},
              {"Name": "successful_requests", "Type": "INTEGER"},
              {"Name": "failed_requests", "Type": "INTEGER"}
            ]
          }
        }
      }' \
      --permissions '[{
        "Principal": "arn:aws:quicksight:us-east-1:<ACCOUNT_ID>:user/default/<your-user>",
        "Actions": ["quicksight:DescribeDataSet","quicksight:PassDataSet","quicksight:UpdateDataSet","quicksight:DeleteDataSet","quicksight:DescribeIngestion","quicksight:ListIngestions","quicksight:CreateIngestion"]
      }]' \
      --region us-east-1
    
    # 设置每日刷新（UTC 00:00 = 北京时间 08:00）
    aws quicksight create-refresh-schedule \
      --aws-account-id <ACCOUNT_ID> \
      --data-set-id litellm-daily-tag-spend \
      --schedule '{
        "ScheduleId": "daily-refresh",
        "ScheduleFrequency": {
          "Interval": "DAILY",
          "TimeOfTheDay": "00:00"
        },
        "RefreshType": "FULL_REFRESH"
      }' \
      --region us-east-1
    

## **6\. 安全最佳实践**

### 6.1 凭证安全

措施 | 说明  
---|---  
Secrets Manager | 数据库密码通过 Secrets Manager 管理，不硬编码  
密码自动轮换 | Secrets Manager 支持自动轮换，QuickSight 自动获取新密码  
SSL 加密传输 | QuickSight 到 Aurora 连接启用 SSL  
KMS 加密存储 | Aurora 和 S3 数据使用 KMS 加密  
  
### 6.2 网络安全

措施 | 说明  
---|---  
VPC 私有连接 | QuickSight 通过 VPC Connection 访问 Aurora，不走公网  
安全组隔离 | Aurora 安全组仅允许 QuickSight ENI 和 LiteLLM ECS 访问  
无公网暴露 | Aurora 不开启公网访问  
  
### 6.3 访问控制

措施 | 说明  
---|---  
IAM 最小权限 | QuickSight Role 仅授予必要的 S3/Athena/EC2 权限  
QuickSight 用户权限 | 通过 QuickSight 内部权限控制谁能看哪些 Dataset  
行级安全 (RLS) | 可配置 RLS 限制不同用户只能看自己项目的数据  
审计日志 | LiteLLM 的 store_audit_logs: true 记录所有管理操作  
  
### 6.4 数据安全

措施 | 说明  
---|---  
S3 桶策略 | 限制只有 QuickSight Role 和 LiteLLM 可以访问  
Athena 查询结果加密 | 查询结果存储在指定 S3 路径，可配置 KMS 加密  
SPICE 加密 | QuickSight SPICE 数据静态加密  
  
## **7\. 运维 Dashboard 建议**

### 7.1 QuickSight Dashboard 效果示例

[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/06/12/litellm-amazon-quicksight-visualization-configuration-2.png>) [图2：QuickSight LiteLLM 日志分析 Dashboard]  
---  
  
### 7.2 推荐图表

图表 | 数据源 | 用途  
---|---|---  
每日费用趋势 | DailyTagSpend | 费用是否异常增长  
按项目费用占比 | DailyTagSpend | 钱花在哪个项目  
按用户费用排行 | DailyUserSpend | 谁花钱最多  
请求成功率 | DailyTagSpend | 服务稳定性  
平均响应延迟 | S3 Athena 视图 | 性能监控  
Token 消耗趋势 | DailyTagSpend | 容量规划  
API Key 预算使用率 | VerificationToken | 预算告警  
模型使用分布 | SpendLogs | 模型选择优化  
  
### 7.3 筛选器建议

  * 时间范围：今天 / 本周 / 本月 / 自定义
  * 项目：tag 字段下拉筛选
  * 用户：user_api_key_alias 下拉筛选
  * 模型：model_group 下拉筛选



### 7.3 使用 Amazon Q 自然语言建图

QuickSight Enterprise Edition 内置 Amazon Q，支持自然语言创建图表：
    
    
    "Show total spend by tag as pie chart"
    "Line chart of api_requests by date"
    "Top 5 api_key by spend"
    

## **8\. 常见问题**

### Q: QuickSight 提示 “Unable to retrieve Athena workgroups”

A: 需要在 Manage QuickSight → Security & permissions 中启用 Athena 访问，并确保 IAM Role 附加了 AWSQuicksightAthenaAccess 策略。

### Q: S3 JSON 嵌套字段在 QuickSight 中显示为空

A: QuickSight 直连 S3 只能解析一层嵌套。解决方案是通过 Athena 建表 + 视图展平嵌套字段，QuickSight 连接 Athena 而非直连 S3。

### Q: Connection type 下拉只显示 “Public network”

A: 使用 CLI 创建数据源可以指定 VPC Connection，绕过 UI 限制。

### Q: 数据源创建后在 UI 看不到

A: CLI 创建的数据源需要手动授权给用户：
    
    
    aws quicksight update-data-source-permissions \
      --data-source-id <id> \
      --grant-permissions '[{"Principal":"<user-arn>","Actions":[...]}]'
    

### Q: SPICE 数据不是最新的

A: SPICE 是快照模式，需要刷新。可以设置每日自动刷新，或手动点击 “Refresh now”。

## **9\. 费用估算**

服务 | 计费方式 | 预估费用  
---|---|---  
QuickSight Enterprise | $24/月/Author, $5/月/Reader（截至 2026-05，以 AWS 官网为准） | 按用户数  
Athena | $5/TB 扫描量 | 日志量小时几乎免费  
S3 存储 | $0.023/GB/月 | 日志量小时 < $1/月  
Aurora | 按实例规格 | 已有，无额外费用  
SPICE | $0.38/GB/月 | 汇总数据量小，< $1/月  
  
## **10\. 参考链接**

  * [Amazon QuickSight 文档](<https://docs.aws.amazon.com/quicksight/>)
  * [QuickSight 连接 Athena](<https://docs.aws.amazon.com/quick/latest/userguide/create-a-data-set-athena.html>)
  * [QuickSight VPC Connection](<https://docs.aws.amazon.com/quicksight/latest/user/working-with-aws-vpc.html>)
  * [QuickSight Secrets Manager 集成](<https://docs.aws.amazon.com/quick/latest/userguide/secrets-manager-integration.html>)
  * [LiteLLM S3 日志文档](<https://docs.litellm.ai/docs/proxy/logging#s3-logging>)
  * [Athena JSON SerDe](<https://docs.aws.amazon.com/athena/latest/ug/json-serde.html>)



## **11\. 结语**

**下一步行动：**

**相关产品：**

  * [Amazon QuickSight](<https://aws.amazon.com/cn/quicksight/?p=bl_pr_quicksight_l=1>) — 高速业务分析服务
  * [Amazon S3](<https://aws.amazon.com/cn/s3/?p=bl_pr_s3_l=2>) — 适用于 AI、分析和存档的几乎无限的安全对象存储
  * [Amazon Athena](<https://aws.amazon.com/cn/athena/?p=bl_pr_athena_l=3>) — 使用 SQL 在 S3 中查询数据
  * [Amazon Aurora](<https://aws.amazon.com/cn/rds/aurora/?p=bl_pr_aurora_l=4>) — 适用于 PostgreSQL、MySQL 和 DSQL 的无服务器关系数据库服务
  * [Amazon VPC](<https://aws.amazon.com/cn/vpc/?p=bl_pr_vpc_l=5>) — 隔离云网络



**相关文章：**

  * [从数据库连接到自然语言查询：Amazon QuickSuite 数据分析全流程实践](<https://aws.amazon.com/cn/blogs/china/amazon-quicksuite-data-analysis-end-to-end-practice/?p=bl_ar_l=1>)
  * [基于 Amazon Bedrock AgentCore Runtime 部署 Apache Doris MCP Server为 Quick Suite 等 AI 客户端提供原生数据分析能力](<https://aws.amazon.com/cn/blogs/china/runtime-deploy-apache-doris-mcp-server-quick-suite-ai-analytics/?p=bl_ar_l=2>)
  * [推出 OpenClaw on Amazon Lightsail，用于运行您的自主私有人工智能代理](<https://aws.amazon.com/cn/blogs/china/introducing-openclaw-on-amazon-lightsail-to-run-your-autonomous-private-ai-agents/?p=bl_ar_l=3>)
  * [Amazon Nova Lite Fine-Tuning: 高性价比的视觉检测模型微调案例与实践](<https://aws.amazon.com/cn/blogs/china/amazon-nova-lite-fine-tuning-cost-effective-vision-detection-model-tuning-case-and-practice/?p=bl_ar_l=4>)
  * [Amazon Bedrock模型推理的Serverless 异步架构 – 处理在线多模态高负载案例](<https://aws.amazon.com/cn/blogs/china/amazon-bedrock-model-inference-serverless-architecture-case-study/?p=bl_ar_l=5>)



*前述特定亚马逊云科技生成式人工智能相关的服务目前在亚马逊云科技海外区域可用。亚马逊云科技中国区域相关云服务由西云数据和光环新网运营，具体信息以中国区域官网为准。

## 本篇作者

### 张振华

亚马逊云科技解决方案架构师，负责基于亚马逊云科技的云计算方案的架构和设计，在 Edge、Serverless 、容器化，微服务架构，云原生 DevOps 等方向具有丰富的实践经验。自加入亚马逊云科技后，专注于游戏行业，以及 GenAI 在游戏行业的应用。

### 刘振华

亚马逊云科技高级解决方案架构师。在加入 AWS 之前，曾在埃森哲、众安保险、华为等企业担任核心技术岗位，主导过多个大型软件系统的架构设计、研发交付与项目管理，积累了丰富的企业级实战经验。深耕 SaaS 与企业数智化转型领域，为金融、医疗健康与生命科学（HCLS）等行业客户提供云架构规划、迁移上云及现代化改造等技术咨询与赋能服务。当前聚焦于生成式 AI 技术在中国企业的落地实践，围绕 AI 编程助手、智能数据分析、AI for Science 等方向，帮助客户探索创新路径，加速业务智能化升级。

### 杨姝颖

亚马逊云科技解决方案架构师，在互联网行业工作多年，对推荐系统、广告投放引擎有丰富的开发经验。同时专注于生成式 AI 在中国区不同行业的落地和推广。

* * *

## 2026 亚马逊云科技中国峰会

智能投标、AI 质检、财务自动化、智能客服——生产级 Agent 全天开放体验。 [](<https://aws.amazon.com/cn/events/summits/shanghai/?ectrk=jyLXNovBYB51qgzUEipIpZcxlfE5%2Bs7NfDTnZwR7hFYtQmPUSToTuN%2FZO5doh20ZJ%2FloW6Rom0l3P4LLcoyUPA%3D%3D&sc_icampaign=glb-summit-blog-p1&sc_ichannel=ha&sc_iplace=blog&trk=ab30be54-aedd-480a-9364-ab0bf98e982d>) |   
---|---
