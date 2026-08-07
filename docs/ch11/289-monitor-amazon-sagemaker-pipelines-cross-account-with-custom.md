# Monitor Amazon SageMaker Pipelines cross-account with custom Amazon CloudWatch dashboards

## Ch11.289 Monitor Amazon SageMaker Pipelines cross-account with custom Amazon CloudWatch dashboards

> 📊 Level ⭐⭐ | 3.7KB | `entities/monitor-sagemaker-pipelines-cross-account.md`

# Monitor Amazon SageMaker Pipelines cross-account with custom Amazon CloudWatch dashboards

## 核心内容

本文来自 AWS Machine Learning Blog，作者 Giorgio Pessot (AWS Professional Services ML Engineer)。文章介绍了一套用于跨 AWS 账户和区域集中监控 SageMaker Pipelines 的无服务器事件驱动解决方案，基于 CloudWatch 自定义仪表盘实现统一可观测性。

核心架构采用 **Hub-and-Spoke（中心-辐射）模型**：

1. **Dashboard Stack（中心堆栈）**：部署在监控主账户/区域，包含 CloudWatch 仪表盘、DynamoDB 存储表和 Lambda 数据处理函数。
2. **Forwarder Stack（转发器堆栈）**：部署在被监控的各个账户/区域，使用 EventBridge 规则捕获 SageMaker Pipeline 状态变更事件，经 Lambda 富化处理后跨账户转发到监控中心。

**数据流工作流程**：
- SageMaker AI 在 Pipeline 步骤状态变更时生成事件
- EventBridge 规则捕获事件并触发 Lambda 处理
- Lambda 富化事件数据（执行状态、显示名称等）并发送到本地 EventBridge 总线
- 自定义 EventBridge 规则将富化数据转发到监控账户
- IAM 角色和资源策略保障跨账户事件传输安全
- 监控账户中的 EventBridge 规则触发 Lambda 将数据持久化存储到 DynamoDB
- Lambda 作为仪表盘后端，读取 DynamoDB 并返回格式化 HTML
- CloudWatch 自定义 Widget 展示 Pipeline 执行信息（账户 ID、区域、创建时间、状态），支持按 Pipeline 名称过滤和查看步骤详情
- 对异常活动触发 CloudWatch 告警并通过 SNS 通知

**最佳实践**：支持扩展监控 Step Functions、AWS Batch、AWS Glue、EMR 等工作负载；支持多层告警（EventBridge + CloudWatch Logs + Metrics）；支持 VPC 私有网络部署；支持与 CI/CD 集成（AWS Organizations + ADF）；可替代使用 Amazon Managed Grafana 进行可视化。

**部署要求**：两个以上 AWS 账户，CDK (v2.1100.1+)，Python 3.14+，Docker，AWS CLI v2.32.12+。

## 分析

本文给出的方案解决了 MLOps 实践中一个实际问题：当 SageMaker Pipelines 分布在多个 AWS 账户和区域时，运维人员需要在不同环境间反复切换来查看执行状态。方案的架构设计有以下几个亮点：

- **轻量级转发**：Forwarder 堆栈采用纯 EventBridge 驱动，无需在受监控账户中部署轮询或常驻计算资源
- **低延迟**：事件驱动架构实现近实时数据同步
- **可扩展性**：可通过自定义 Lambda 函数扩展数据采集和仪表盘可视化逻辑，支持从 Step Functions、Batch、Glue 等来源采集数据
- **安全性**：跨账户事件传输使用 IAM 角色和资源策略进行细粒度访问控制
- **用户友好**：CloudWatch 自定义 Widget 实现了交互式过滤、步骤详情报弹框等高级 UI 功能，用户无需离开 AWS 控制台即可完成监控

→ [原文存档](https://github.com/QianJinGuo/wiki-book/tree/main/docs/raw/articles/monitor-sagemaker-pipelines-cross-account.md)

---
## 关联
- 相关概念: [Harness Engineering](https://github.com/QianJinGuo/wiki/blob/main/concepts/harness-engineering-framework.md)

---

