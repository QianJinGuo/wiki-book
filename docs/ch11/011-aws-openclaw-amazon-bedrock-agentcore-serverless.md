# 基于 AWS 示例项目，展示如何将 OpenClaw 迁移为基于 Amazon Bedrock AgentCore 的多租户 Serverless 架构

## Ch11.011 基于 AWS 示例项目，展示如何将 OpenClaw 迁移为基于 Amazon Bedrock AgentCore 的多租户 Serverless 架构

> 📊 Level ⭐⭐ | 28.8KB | `entities/using-amazon-bedrock-agentcore-openclaw-multi-2.md`

# "基于 AWS 示例项目，展示如何将 OpenClaw 迁移为基于 Amazon Bedrock AgentCore 的多租户 Serverless 架构"
---
title: "AI Agent 的迁移与现代化 — 使用 Amazon Bedrock AgentCore 将 OpenClaw 从单机改造为多租户 Serverless 架构 第二篇 | Amazon Web Services"
url: https://aws.amazon.com/cn/blogs/china/using-amazon-bedrock-agentcore-openclaw-multi-2/
source: rss
feed_name: AWS China Blog
---

## [亚马逊AWS官方博客](https://aws.amazon.com/cn/blogs/china/)
摘要：基于 AWS 示例项目，展示如何将 OpenClaw 迁移为基于 Amazon Bedrock AgentCore 的多租户 Serverless 架构。全系列 6 篇，涵盖 Replatform 与 Refactor 两种策略。本篇为第二篇：环境准备与代码获取，安装依赖工具、配置 AWS 环境、克隆项目代码、了解 cdk.json 配置项，以及初始化 CDK。
**目录**
01[一、环境准备](https://aws.amazon.com/cn/blogs/china/using-amazon-bedrock-agentcore-openclaw-multi-2/#section1)
02[二、获取代码](https://aws.amazon.com/cn/blogs/china/using-amazon-bedrock-agentcore-openclaw-multi-2/#section2)
04[相关链接](https://aws.amazon.com/cn/blogs/china/using-amazon-bedrock-agentcore-openclaw-multi-2/#section4)

* * *

## 一、环境准备
在开始部署之前，需要准备好开发环境。以下步骤假设你使用的是 Amazon Linux 2023 或类似的 Linux 环境（比如 AWS CloudShell 或 [Amazon EC2](https://aws.amazon.com/cn/ec2/) 实例）。

### 第一步：设置 AWS 账号和区域环境变量
先告诉系统你要部署到哪个 AWS 账号的哪个区域。
```
export TARGET_REGION=us-west-2
export CDK_DEFAULT_REGION=$TARGET_REGION
export CDK_DEFAULT_ACCOUNT=$(aws sts get-caller-identity --query Account --output text)
export PATH="$HOME/.local/bin:$PATH"
mkdir -p ~/openclaw-$TARGET_REGION && cd ~/openclaw-$TARGET_REGION
```
PowerShell
为什么做这一步：AWS CDK 需要知道部署目标（账号 + 区域）才能工作。创建一个专属工作目录便于管理，如果以后想部署到多个区域，每个区域一个目录互不干扰。

### 第二步：安装基础依赖
```
sudo dnf update -y
sudo dnf install -y python3.12-pip screen nodejs20 docker
```
PowerShell
为什么做这一步：

*   Python 3.12：CDK 应用用 Python 编写
*   Node.js 20：CDK CLI 工具需要 Node.js 运行
*   Docker：本文用 CodeBuild 模式构建镜像，实际不会用到本地 Docker。安装它是为了环境完整性和后续可能的本地调试
*   screen：部署过程比较长，用 screen 可以防止 SSH 断开导致中断

### 第三步：启动 Docker 服务
```
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -aG docker $USER
newgrp docker
docker -v
```
PowerShell
为什么做这一步：让当前用户不用 sudo 就能运行 docker 命令。最后 `docker -v` 验证能正常使用。

### 第四步：配置 [AWS X-Ray](https://aws.amazon.com/cn/xray/) 日志权限
```
aws logs put-resource-policy \
  --policy-name XRayLogGroupPolicy \
  --policy-document '{"Version":"2012-10-17","Statement":[{"Effect":"Allow","Principal":{"Service":"xray.amazonaws.com"},"Action":["logs:CreateLogGroup","logs:CreateLogStream","logs:PutLogEvents","logs:PutRetentionPolicy"],"Resource":"*"}]}' \
  --region $TARGET_REGION
aws xray update-trace-segment-destination \
  --destination CloudWatchLogs \
  --region $TARGET_REGION
```
PowerShell
为什么做这一步：什么是 AWS X-Ray？AWS X-Ray 是分布式追踪服务，能完整记录一次用户请求经过的所有组件（API Gateway → Router Lambda → AgentCore 容器 → Bedrock → Guardrails）及每段耗时。这对于迁移后的多组件架构尤为重要 — 原来单进程时出问题看一份日志就行，现在十几个组件串联，X-Ray 能把整条链路串起来，哪里慢、哪里错一目了然。
这两条命令做什么？第一条授权 X-Ray 服务往 [Amazon CloudWatch](https://aws.amazon.com/cn/cloudwatch/) Logs 写追踪数据；第二条把 X-Ray 追踪数据的输出目标设为 CloudWatch Logs，这样日志和追踪数据都在一个地方，排错更方便。

### 第五步：检查并开通 Amazon Bedrock Claude 模型访问
```
aws bedrock list-foundation-models \
  --region $TARGET_REGION \
  --query "modelSummaries[?contains(modelId,'claude')].[modelId]" \
  --output table
```
PowerShell
为什么做这一步：Amazon Bedrock 的模型访问是账号级别的设置，每个 AWS 账号首次使用 Bedrock 时都要手动开通想用的模型，否则调用会返回 AccessDeniedException。
上面命令的作用：列出当前区域你已经能访问的 Claude 模型。如果列表为空或缺少你要用的模型（本项目默认用 `global.anthropic.claude-sonnet-4-6`），需要到 Bedrock 控制台开通。
如何开通模型访问（控制台操作）
1.   进入 Amazon Bedrock 控制台（确保区域切到你部署的目标区域）
2.   左侧菜单找到 Model access（模型访问）
3.   点击 Modify model access 或 Enable specific models
4.   勾选 Anthropic 下的 Claude Sonnet 4（或项目配置的其他模型）
5.   Anthropic 模型需要填一个简短的用例说明表单（What's your industry / use case 等）
6.   提交后等待状态变成 Access granted
Claude 系列模型现在通常几秒到几分钟就能开通。如果命令已经能列出 Claude 模型，说明已经开通过，可以跳过控制台操作。

### 第六步：安装 AWS CDK 和 AgentCore Starter Toolkit
```
sudo npm install -g aws-cdk
cdk --version
pip3.12 install bedrock-agentcore-starter-toolkit --break-system-packages
echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.bashrc
agentcore --help
```
PowerShell
为什么做这一步：

*   AWS CDK：用于部署 Phase 1 和 Phase 3 的基础设施代码
*   AgentCore Starter Toolkit：CDK 不直接管理 AgentCore Runtime，需要通过这个工具在 Phase 2 创建 Runtime 和构建镜像

### 第七步：运行环境检查脚本
```
cat > check.sh /dev/null; then echo "✅ $1"; ((PASS++)); else echo "❌ $1"; ((FAIL++)); fi
}
check "AWS CLI v2"        "aws --version 2>&1 | grep -q 'aws-cli/2'"
check "AWS 凭证"          "aws sts get-caller-identity"
check "Node.js >= 18"     "node -e 'var v=parseInt(process.version.slice(1));process.exit(v>=18?0:1)'"
check "Python >= 3.11"    "python3.12 -c 'import sys; exit(0 if sys.version_info >= (3,11) else 1)'"
check "Docker"            "docker version"
check "AWS CDK v2"        "cdk --version 2>&1 | grep -q '^2'"
check "agentcore CLI"     "agentcore --help"
echo ""
echo "通过: $PASS / 失败: $FAIL"
[ $FAIL -eq 0 ] && echo "???? 环境就绪！" || echo "⚠️ 请修复上述失败项"
EOF
bash check.sh
```
PowerShell
为什么做这一步：一次性检查 7 项必备工具是否正常。全部通过才能进入下一步，避免后面部署时才发现某个工具没装。

## 二、获取代码
### 第一步：克隆项目代码
```
git clone https://github.com/aws-samples/sample-host-openclaw-on-amazon-bedrock-agentcore.git
cd sample-host-openclaw-on-amazon-bedrock-agentcore
```
PowerShell
为什么做这一步：从 AWS Samples 官方仓库克隆完整的项目代码（包含 CDK 基础设施、容器代码、Lambda 函数、部署脚本）。

### 第二步：设置部署区域
```
sed -i "s/\"region\": \"\"/\"region\": \"${TARGET_REGION}\"/" cdk.json
cat cdk.json
```
PowerShell
为什么做这一步：把 `cdk.json` 里空的区域字段替换成你的目标区域。`cdk.json` 是 CDK 的配置文件，里面还有模型 ID、每日预算、会话超时等可调参数。

### 第三步：创建 Python 虚拟环境并安装依赖
```
python3.12 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
pip install boto3
python -c "import boto3; import aws_cdk; print('Dependencies installed successfully')"
```
PowerShell
为什么做这一步：虚拟环境（venv）可以把项目依赖和系统 Python 隔离开，避免污染系统环境。`requirements.txt` 里列了 CDK 需要的 Python 包（主要是 aws-cdk-lib 和 cdk-nag）。最后一行验证依赖都装好了。

### 了解 cdk.json 配置项
在进入部署之前，先了解项目的配置。`cdk.json` 的 `context` 对象是项目所有可调参数的集中地。Stack 代码通过 `self.node.try_get_context("xxx")` 读取这些值。这里只是让你了解有哪些配置，本次部署你不需要修改任何配置项。
**部署目标配置**
| 配置项 | 当前值 | 作用 |
| --- | --- | --- |
| `account` | （空） | AWS 账号 ID。为空时读取环境变量 `CDK_DEFAULT_ACCOUNT` |
| `region` | 部署区域 | 部署区域。为空时读取 `CDK_DEFAULT_REGION`。已通过上一步的 sed 命令填入 |
| `availability_zones` | [] | VPC 使用的可用区列表。留空则 CDK 自动选 2 个。仅当目标区域 AgentCore 有 AZ 限制时才需要手动指定 |
**Amazon Bedrock 模型配置**
| 配置项 | 当前值 | 作用 |
| --- | --- | --- |
| `default_model_id` | global.anthropic.claude-sonnet-4-6 | 主 Agent 使用的 Claude 模型。`global.` 前缀表示跨区域推理（Cross Region Inference），Amazon Bedrock 会自动将请求路由到可用区域 |
| `subagent_model_id` | （空） | 子代理模型。空值表示复用主模型。可设置成更便宜/更快的模型省成本 |
**AgentCore Runtime 运行配置**
| 配置项 | 当前值 | 作用 |
| --- | --- | --- |
| `runtime_id` | openclaw_agent-21FHcrBssV | AgentCore Runtime ID。Phase 2 部署后由 deploy.sh 自动写入，Phase 3 的 Stack 会读取这个值 |
| `runtime_endpoint_id` | DEFAULT | Runtime Endpoint ID。Starter Toolkit 默认创建的 Endpoint 名就叫 DEFAULT |
| `image_version` | 70 | 容器镜像版本号。改这个值 + 重新部署，会强制 AgentCore 重新拉取镜像 |
| `session_idle_timeout` | 1800（30 分钟） | 会话空闲超时（秒），超时后 AgentCore 销毁 microVM。官方默认 900 秒（15 分钟） |
| `session_max_lifetime` | 28800（8 小时） | 会话最大生命周期（秒），上限 28800（8 小时） |
| `workspace_sync_interval_seconds` | 300（5 分钟） | 容器内 `.openclaw/` 工作区同步到 S3 的间隔（秒）。这是数据持久化迁移的关键参数 |
| `enable_browser` | true | 是否开启 AgentCore Browser（无头浏览器）。仅在支持的区域生效 |
**AWS Lambda 配置**
| 配置项 | 当前值 | 作用 |
| --- | --- | --- |
| `router_lambda_timeout_seconds` | 600 | Router Lambda 超时（秒）。冷启动时 Lightweight Agent 约 10-15 秒响应，加上 Bedrock 推理时间，整个请求可能超过 30 秒，所以设 600 秒留足余量 |
| `router_lambda_memory_mb` | 256 | Router Lambda 内存，影响 CPU 配额 |
| `cron_lambda_timeout_seconds` | 900 | 定时任务 Lambda 超时（秒）。需要够长以完成预热、消息处理、回复推送 |
| `cron_lambda_memory_mb` | 256 | 定时任务 Lambda 内存 |
| `cron_lead_time_minutes` | 5 | 定时任务预热提前量：任务触发前 5 分钟先启动容器（减少冷启动等待） |
**预算和告警配置**
| 配置项 | 当前值 | 作用 |
| --- | --- | --- |
| `daily_token_budget` | 1000000 | Token 预算告警阈值（100 万）。注意：虽然配置项名叫 daily，但实际 alarm 的检查周期是 1 小时，即 1 小时内 Token 总量超过此值就触发告警 |
| `daily_cost_budget_usd` | 5 | 成本预算告警阈值（美元）。同上，实际检查周期是 1 小时 |
| `anomaly_band_width` | 2 | Token 异常检测带宽（标准差倍数） |
**数据保留配置**
| 配置项 | 当前值 | 作用 |
| --- | --- | --- |
| `cloudwatch_log_retention_days` | 30 | CloudWatch 日志保留天数 |
| `token_ttl_days` | 90 | Amazon DynamoDB Token 用量记录的 TTL（生存时间，Time to Live），90 天自动删除 |
| `user_files_ttl_days` | 365 | S3 用户文件的生命周期（365 天后自动过期） |
**安全和开关**
| 配置项 | 当前值 | 作用 |
| --- | --- | --- |
| `registration_open` | false | 是否开放自助注册。false 表示只有白名单（DynamoDB 中有 ALLOW# 记录）的用户才能使用 Bot |
| `enable_cloudtrail` | false | 是否部署专用 AWS CloudTrail Trail。默认关闭（多数账号已有组织级 Trail） |
| `enable_guardrails` | （未设置，视为 true） | 是否启用 Amazon Bedrock Guardrails 内容过滤。代码逻辑是：未设置或设为 true 时启用，设为 false 时不创建 Guardrail。具体过滤规则在 `stacks/guardrails_stack.py` 中定义 |
| `guardrails_pii_action` | （未设置，默认 ANONYMIZE） | PII 检测动作。ANONYMIZE 表示匿名化替换，BLOCK 表示直接阻断 |
**CDK 框架配置（不需要改）**
以 `@aws-cdk/` 开头的配置是 CDK 框架自身的行为开关（比如最小化 IAM 策略、使用 IMDSv2 等），这些是最佳实践默认值，一般不要改动。

## 三、CDK 初始化（Bootstrap）
### 第一步：初始化 CDK 工作台
```
cdk bootstrap aws://$CDK_DEFAULT_ACCOUNT/$CDK_DEFAULT_REGION
```
PowerShell
为什么做这一步：CDK 部署时需要一个"工作台"来存放中间产物（[AWS CloudFormation](https://aws.amazon.com/cn/cloudformation/) 模板、Lambda 代码包等）。bootstrap 命令会在你的 AWS 账号里创建一个叫 `CDKToolkit` 的 Stack，包含一个 S3 桶、一个 ECR 仓库、几个 IAM 角色。
每个账号 + 区域组合只需要执行一次，后续所有 CDK 项目都会共用这个工作台。
验证方法：去 AWS 控制台的 CloudFormation 页面，应该能看到一个名为 `CDKToolkit` 的 Stack，状态 CREATE_COMPLETE。

### 第二步：预览将要创建的资源
```
cdk synth
```
PowerShell
为什么做这一步：把 Python CDK 代码"编译"成 CloudFormation 模板（YAML 格式），不会真的创建任何 AWS 资源。这一步主要是：

*   验证代码能正确生成模板
*   运行 cdk-nag 安全检查（检查是否有明显的安全配置错误）
*   生成的模板会在 `cdk.out/` 目录下，可以查看每个 Stack 会创建哪些资源

### 第三步：应用部署补丁
```
sed -i '/# --- S3 Bucket for Per-User File Storage/i\        # AWS Marketplace — required for Bedrock model access verification\n        self.execution_role.add_to_policy(\n            iam.PolicyStatement(\n                actions=[\n                    "aws-marketplace:ViewSubscriptions",\n                    "aws-marketplace:Subscribe",\n                ],\n                resources=["*"],\n            )\n        )\n' stacks/agentcore_stack.py
sed -i 's/dashboard_name="OpenClaw-Operations"/dashboard_name=f"OpenClaw-Operations-{region}"/' stacks/observability_stack.py
sed -i 's/dashboard_name="OpenClaw-Token-Analytics"/dashboard_name=f"OpenClaw-Token-Analytics-{self.region}"/' stacks/token_monitoring_stack.py
```
PowerShell
为什么做这一步：两处小补丁：

*   第一条（第一个 sed）：给 AgentCore 执行角色添加 AWS Marketplace 权限，Amazon Bedrock 某些模型的访问验证需要这个权限
*   第二、三条（后两个 sed）：给两个 CloudWatch Dashboard 的名称加上区域后缀，防止在多区域部署时名称冲突

## 相关链接
**➡️ 下一步行动：**
**相关产品：**

*   [Amazon CDK](https://aws.amazon.com/cn/cdk/?p=bl_pr_cdk_l=1) — 基础设施即代码框架
*   [Amazon Bedrock](https://aws.amazon.com/cn/bedrock/?p=bl_pr_bedrock_l=2) — 用于构建生成式人工智能应用程序和代理的端到端平台
*   [AWS Lambda](https://aws.amazon.com/cn/lambda/?p=bl_pr_lambda_l=3) — 无需服务器即可运行代码
*   [Amazon X-Ray](https://aws.amazon.com/cn/xray/?p=bl_pr_x-ray_l=4) — 分布式应用调试
*   [Amazon CloudWatch](https://aws.amazon.com/cn/cloudwatch/?p=bl_pr_cloudwatch_l=5) — 可观测性工具
**系列文章：**

*   [第一篇：为什么要把 OpenClaw 从单机搬到 AWS](https://aws.amazon.com/cn/blogs/china/using-amazon-bedrock-agentcore-openclaw-multi-1/?p=bl_ar_l=1)
*   [第三篇：Phase 1 — 部署基础设施](https://aws.amazon.com/cn/blogs/china/using-amazon-bedrock-agentcore-openclaw-multi-3/?p=bl_ar_l=2)
*   [第四篇：Phase 2 & 3 — 部署 AgentCore Runtime 与业务层](https://aws.amazon.com/cn/blogs/china/using-amazon-bedrock-agentcore-openclaw-multi-4/?p=bl_ar_l=3)
*   [第五篇：配置消息渠道与端到端验证](https://aws.amazon.com/cn/blogs/china/using-amazon-bedrock-agentcore-openclaw-multi-5/?p=bl_ar_l=4)
*   [第六篇：清理资源与总结展望](https://aws.amazon.com/cn/blogs/china/using-amazon-bedrock-agentcore-openclaw-multi-6/?p=bl_ar_l=5)
*前述特定亚马逊云科技生成式人工智能相关的服务目前在亚马逊云科技海外区域可用。亚马逊云科技中国区域相关云服务由西云数据和光环新网运营，具体信息以中国区域官网为准。

## 本篇作者
* * *

## AWS 架构师中心：云端创新的引领者
探索 AWS 架构师中心，获取经实战验证的最佳实践与架构指南，助您高效构建安全、可靠的云上应用
**[![Image 1](https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2025/11/13/sa-button.png)](https://aws.amazon.com/cn/solutions/architect-center/)**![Image 2](https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2025/11/13/sa.png)

## 深度分析
本文作为 OpenClaw 迁移至 Amazon Bedrock AgentCore 架构系列的第二篇，重点聚焦于**环境准备与代码获取**阶段。通过 7 步环境检查 + 3 步代码获取 + CDK 初始化的结构，为后续三阶段部署（Phase 1 基础设施、Phase 2 AgentCore Runtime、Phase 3 业务层）奠定了可复现的标准化基础。
**1. 环境准备的设计意图**
文章将环境准备拆分为 7 个独立检查项，这种"原子化验证"的设计值得称道。每个检查项都有明确的失败条件和修复指导，确保部署失败能在最早阶段被发现而非等到 Phase 1/2/3 运行时才暴露。这体现了 DevOps"fail fast"的原则——特别是 X-Ray 配置这一项，揭示了迁移前后架构复杂度变化的本质：原来单进程看一份日志，现在多组件串联需要分布式追踪。
**2. cdk.json 配置的架构哲学**
文章用大量篇幅解释 cdk.json 的每一项配置，揭示了该项目设计的几个关键决策：

- **跨区域推理模型** (`global.anthropic.claude-sonnet-4-6`)：通过 `global.` 前缀启用 Amazon Bedrock 的 Cross Region Inference特性，实现请求自动路由至可用区域，提升可用性同时降低延迟
- **会话生命周期管理**：30 分钟空闲超时 + 8 小时最大生命周期的组合，反映了对成本和资源的权衡——AgentCore 的 microVM 启动有冷启动开销，过短的超时会导致频繁重建，过长则增加资源占用成本
- **工作区同步间隔 300 秒**：这是数据持久化迁移的关键参数，将容器内 `.openclaw/` 目录定期同步至 S3，解决容器无状态与服务有状态需求之间的矛盾
**3. 安全架构的层次**
从配置项可见项目的多层安全设计：

- **注册层**：`registration_open: false` 强制白名单机制，防止未授权访问
- **传输层**：enable_cloudtrail 实现 API 操作审计
- **内容层**：enable_guardrails + guardrails_pii_action 实现 PII 检测与处理
- **IAM 层**：执行角色的最小权限原则（通过 CDK cdk-nag 检查）
**4. 补丁机制的技术债信号**
文章第三步要求手动应用三个 sed 补丁，这反映出示例项目在多区域支持方面的技术债：CloudWatch Dashboard 名称冲突问题说明项目初期未充分考虑多区域部署场景，AWS Marketplace 权限缺失说明对 Bedrock 模型访问验证流程的理解存在盲区。这提醒我们在生产项目中应尽早进行多区域/多账号的测试覆盖。

## 实践启示
**1. 标准化环境检查流程**
在团队内部推广环境检查脚本的使用，将 7 项检查项固化到 CI/CD 流水线的初始阶段。建议将其封装为 `setup-check.sh` 放在项目根目录，新成员 clone 后一键执行即可验证环境就绪状态。
**2. 配置管理的最佳实践**
cdk.json 的 `context` 对象是基础设施即代码场景下配置管理的好范例。建议：

- 将敏感配置（API keys、account IDs）保留在环境变量中，通过 CDK context 读取
- 为每个可调参数添加注释说明，便于团队成员理解修改影响
- 使用 `cdk context` 命令查看当前生效的配置值，避免与预期不符
**3. 多区域部署的前瞻设计**
从补丁中学习，在项目初期就考虑多区域/多账号场景：

- 所有命名型资源（Bucket、Queue、Dashboard）使用动态命名（region变量）而非静态命名
- IAM 策略使用最小权限原则，为未来跨账号访问预留扩展空间
- 提前申请 AWS Marketplace 订阅权限，避免部署时才发现缺失
**4. 可观测性建设的优先级**
X-Ray 配置步骤应在环境准备阶段优先完成，因为：

- 后续 Phase 1/2/3 部署的所有组件都会产生追踪数据
- 迁移完成后的调试高度依赖完整的调用链追踪
- CloudWatch Logs 与 X-Ray 的集成是排错的基础设施
→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/using-amazon-bedrock-agentcore-openclaw-multi-2.md)

## 相关实体
- [OpenClaw多租户迁移: Phase 2&3部署](ch11/213-openclaw.md)
- [Amazon Nova Multimodal Embeddings 制造业智能应用](ch11/257-amazon-nova.md)
- [Real-time voice agents with Stream Vision Agents and Amazon Nova 2 Sonic](../ch04/057-real-time-voice-agents-with-stream-vision-agents-and-amazon.md)
- [Improve bot accuracy with Amazon Lex Assisted NLU](../ch01/630-improve-bot-accuracy-with-amazon-lex-assisted-nlu.md)
- [AWS 一周综述：Amazon Bedrock AgentCore 付款、适用于 AWS 的 Agent 工具套件等（2026 年 5 月 11 日）](../ch04/499-amazon-bedrock-agentcore.md)
- [航班变更信息智能识别解决方案 | Amazon Web Services](https://github.com/QianJinGuo/wiki/blob/main/entities/航班变更信息智能识别解决方案.md)
- [Zenjoy 基于 Amazon Bedrock 和 EKS 构建 AIOps Agent：打通 Prometheus、ES 与夜莺的智能化告警实战](ch11/251-bedrock.md)
- [From siloed data to unified insights: Cross-account Athena Access for Amazon Quick](../ch01/675-from-siloed-data-to-unified-insights-cross-account-athena-a.md)
- [Control where your AI agents can browse with Chrome enterprise policies on Amazon Bedrock AgentCore](ch11/128-control-where-your-ai-agents-can-browse-with-chrome-enterpri.md)

- [AgentCore Runtime部署Apache Doris MCP Server](ch11/160-apache-doris-mcp-server-quick-suite-ai.md)
- [OpenClaw多租户迁移: 背景与架构概览](ch11/213-openclaw.md)
- [OpenClaw多租户迁移: Phase 1 基础设施部署](ch11/213-openclaw.md)
- [Amazon Bedrock模型推理的Serverless异步架构](ch11/152-amazon-bedrock.md)
- [Agent 原理、架构与工程实践](../ch03/045-agent.md)
- [from pdfs to insights: architecting an intelligent document](ch11/220-from-pdfs-to-insights-architecting-an-intelligent-document.md)

---

