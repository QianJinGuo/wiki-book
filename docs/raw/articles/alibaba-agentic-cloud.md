---
title: "alibaba-agentic-cloud"
created: 2026-06-10
type: raw
sha256: 3afdccd447b883f8863f3fd96281b11cede2415ccbfefdf3b9049f5f2799358c
---
# 阿里云 Agentic Cloud

source_url: https://mp.weixin.qq.com/s/zYvl-XjdcW2Sx2XDNGJ2mQ
source: 极客公园
author: 郑玄
published: 2026-05-25
score: 8×8=64
tags: [cloud, agent, alibaba, qwen, maas, bailian, skill]
rating: 8
confidence: 8
types: [agent-infrastructure, cloud-platform, llm-platform]
review_value: 8
review_confidence: 8

# 摘要

阿里云在520峰会上发布 Agentic Cloud 战略，将整朵云按 Agent 需求重做，目标是让 Agent 成为云的一等公民。产品、API、计费、文档、官网全部围绕 Agent 重新设计。

# 四层架构

## 芯片层（平头哥）
- 真武 AI 芯片累计出货 56 万片
- 覆盖 20+ 行业、400+ 客户
- 30+ 车企智驾研发已上线
- 倚天 Arm CPU + 镇岳存储主控 + 磐脉 400G 网卡 → 芯云模一体化

## 基础设施层（Agentic Cloud）
两件事：
1. **Agent Infra**：任务级运行环境隔离 + 多 Agent 编排 + 任务级身份鉴权 + 多模态记忆存储
   - 关键转变：传统云=资源调度（稳态 QPS），Agent 云=任务调度（突发+长尾+高并发）
2. **Agentic Products**：56 款产品 Skill 化，Agent 可直接调用
   - 已落地：OSS Agent、StarOps、Dataworks Agent
   - 本质：把云产品接口重做一遍，从读文档/调 API → 任务级/交互式对话

## 模型层（千问 Qwen）
- Qwen3.7-Max：Arena 全球盲测总榜第一梯队，超越 Kimi-K2.6、DeepSeek-v4-pro、GLM-5.1
- Hugging Face 衍生模型破 20 万个，下载量过 10 亿次
- 全球开源模型采用率 53%，超越 Meta-Llama 和 Google-Gemma
- 主流编程 Agent（Cursor、Claude Code、Qwen Code、OpenCode、Cline）已全部支持 Qwen

## 平台层（百炼）
- 冷启动降低 90%+
- 每分钟拉起 10000 Pod
- SLA 4 个 9
- 四种计费形态：按 Token / PTU / MU / Batch API
- Prompt Caching：重复上下文计算降低 98%（Claude Code 场景）

# 千问云新官网
- 定位：AI 时代版 Stripe/Linear
- 200+ 主流模型 API（Qwen、GLM、Kimi、DeepSeek、Wan）
- 模型服务打包成 Skills 和 CLI → Agent 可直接调用
- 战略含义：阿里云公开承认"云的用户不再只是人"

# 商业模式重构

## 从卖 Token 到卖结果
| 维度 | 传统云 | Agentic Cloud |
|------|--------|--------------|
| 销售指标 | GPU 销量、客户迁移量 | 付费 Token 企业客户数、Agent 自主完成闭环比例 |
| 客户对象 | IT 负责人 | 董事长/CEO/业务负责人 |
| 定价 | 按资源/量 | 按 Token → 结果付费（演进中） |
| 组织 | 现有云销售团队 | 独立 MaaS 销售团队 |

## 财务表现（FY26 Q4）
- 云外部收入增速：40%
- AI 收入占比：首破 30%
- AI 产品收入：连续 11 季度三位数同比增长
- 年化 AI 收入：358 亿

# 关键洞察

1. **Agentic Cloud 本质**：云厂商从"卖计算资源"变成"卖 Agent 工作流能力"
2. **Skill 化是最大工作量**：56 款产品接口重做，比发新品难得多
3. **结果付费是终极形态**：但需技术成熟到一定程度才能实现
4. **Qwen 开源生态价值**：53% 全球采用率意味着大量第三方 Agent 默认接入，形成推理平台锁定

# 相关链接

- [千问云](https://qwen.cloud.alibaba.com)
- [百炼平台](https://bailian.console.aliyun.com)
