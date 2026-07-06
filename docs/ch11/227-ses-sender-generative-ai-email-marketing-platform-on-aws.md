# SES Sender: Generative AI Email Marketing Platform on AWS

## Ch11.227 SES Sender: Generative AI Email Marketing Platform on AWS

> 📊 Level ⭐⭐ | 4.0KB | `entities/ses-sender-generative-ai-email-marketing-aws.md`

# SES Sender: Generative AI Email Marketing Platform on AWS

AWS 推出的 SES Sender 是构建于 Amazon SES 之上的自托管、开源邮件营销与可送达性管理平台，将生成式 AI 应用于模板创作与质量把关的完整闭环。

## 核心痛点

运营和增长团队面临的邮件营销挑战：

1. **可送达性**：邮件是否进入收件箱（而非垃圾箱）取决于发信信誉、模板质量、合规配置
2. **合规要求**：Gmail、Yahoo 强制要求一键退订，不合规邮件会被拦截甚至拉黑域名
3. **数据追踪**：发多少、送达多少、退信率、打开率、点击率 —— 缺乏逐封数据无法优化
4. **成本控制**：按消息计费的托管服务成本随发送量线性增长；模板创作依赖稀缺设计人力

## AI 驱动的核心能力

### 1. 模板智能创作

生成式 AI 不仅撰写文案，还从多维度评估和优化模板：
- **可送达性评分**：预测是否容易被标记为垃圾邮件
- **打开率优化**：主题行和内容吸引力分析
- **移动端体验**：响应式布局检查
- **合规性检测**：退订链接、物理地址等法规要求

### 2. 原生 MCP 集成

AI Agent 可直接通过 Model Context Protocol (MCP) 调用发信能力，实现：
- 自主邮件营销活动执行
- 基于用户行为的触发式邮件
- 与 CRM、用户分层系统的自动化集成

## 架构设计

### 核心组件

1. **单 Writer 发送引擎**：仅 ENABLE_SENDER=true 的实例运行发送线程，API 层可横向扩展，避免 SES 配额争抢
2. **无公网 Webhook 事件追踪**：后端主动长轮询 SQS，保持服务私有，无需暴露公网回调地址
3. **AI 解耦层**：模板优化/评测作为独立 AI 调用层，支持 Amazon Bedrock 与任意 OpenAI 兼容端点

### 部署资源

基于 AWS CDK 一键部署：
- **网络**：跨两个可用区的 VPC，CloudFront + ALB 入口
- **计算**：ECS on Fargate 运行 frontend、backend、mcp 服务
- **数据**：Aurora MySQL Serverless v2
- **事件**：SES → SNS → SQS 事件链路，CloudWatch 指标
- **安全**：Secrets Manager 管理密钥，IAM 角色全程无长期 AK/SK

## 部署与使用

```bash
git clone https://github.com/aws-samples/sample-ses-sender.git
cd cdk && npm install
npx cdk bootstrap
npm run deploy
```

部署输出中的 AppUrl 即为访问地址，默认管理员账号 admin/admin123，首次登录后需立即修改。

**注意**：Amazon SES 新账户默认处于沙箱模式，仅能向已验证地址发送；正式群发前需申请生产访问权限。

## 替代方案背景

Amazon Pinpoint 将于 2026 年 10 月 30 日终止支持，现有用户需规划迁移。SES Sender 是针对这一场景的替代选择，提供自托管、开源、多团队协作的完整方案。

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/生成式-ai-给邮件营销提效从写模板到质量把关的自动化闭环.md)

---

