# OpenClaw + Amazon Bedrock + Amazon EKS 联动实践：打印机包装质检助手实战

## Ch11.052 OpenClaw + Amazon Bedrock + Amazon EKS 联动实践：打印机包装质检助手实战

> 📊 Level ⭐⭐ | 12.3KB | `entities/openclaw-amazon-bedrock-eks-printer-qc.md`

# OpenClaw + Amazon Bedrock + Amazon EKS 联动实践：打印机包装质检助手实战

> 使用 OpenClaw + Amazon Bedrock + Amazon EKS 构建打印机包装质检 AI Agent 的实战教程，包含完整的代码示例和架构设计。

## 核心内容

# OpenClaw + Amazon Bedrock + Amazon EKS联动实践：打印机包装质检助手实战

摘要：随着打印机出厂包装质检工作量的增长，产线质检员每天需要目视比对大量包装图片，判断泡沫托盘中每个槽位的配件是否齐全。传统方式准确率和效率难以保障。希望借助 AI Agent 将领域专家的判断规则固化下来，同时保持快速迭代能力。

**目录**

01 [前言](#section1)

02 [业务背景与客户痛点](#section2)

03 [系统架构详细设计](#section3)

04 [经验总结](#section4)

05 [成本分析](#section5)

06 [结论](#section6)

07 [参考文档](#section7)

* * *

## **1、前言**

OpenClaw是一款面向个体开发者与企业的开源 Agentic IDE/CLI，支持 TUI、飞书/Lark、Slack 等多种 Channel 接入，可以将用户意图转化为自动化工作流，配合 Skill 机制把领域知识直接注入 Agent。

[Amazon Bedrock](https://aws.amazon.com/cn/bedrock/)是亚马逊云科技提供的企业级托管大模型服务，通过统一 API 即可调用 Anthropic Claude、Meta Llama、[Amazon Nova](https://aws.amazon.com/cn/ai/generative-ai/nova/)等主流基础模型，无需管理模型基础设施，天然支持私有网络、IAM 细粒度授权和审计合规。

[Amazon EKS](https://aws.amazon.com/cn/eks/) Auto Mode是 Amazon Elastic Kubernetes Service 的托管模式，节点、存储、网络、自动扩缩容均由 AWS 全权管理，用户只需关注应用本身，大幅降低Kubernetes运维复杂度。

随着打印机出厂包装质检工作量的增长，产线质检员每天需要目视比对大量包装图片，判断泡沫托盘中每个槽位的配件是否齐全。传统方式准确率和效率难以保障。希望借助 AI Agent 将领域专家的判断规则固化下来，同时保持快速迭代能力。

## **2、业务背景与客户痛点**

### 2.1 客户场景介绍

客户是国内领先的打印机制造商，其国际事业部负责打印机的出厂质量管理。随着海外订单量快速增长，出厂前的包装质检成为瓶颈环节。目前客户采用人工目视的方式对照《出厂配件清单》，逐一核对每台机器包装盒中的配件：一台打印机的包装箱内配件包括：通讯线袋、测试耗材、料架支撑、显示器、缓冲器、工具包、电源线等7类；每个配件固定放入黑色泡沫托盘的专属凹槽内。质检员需要比对"正常样例图"和"异常样例图"（如缺缓冲器时的包装图），判断待检件是否齐全。判断规则相对复杂：

1.  槽位识别：泡沫托盘分左右两块，每个凹槽有特定形状（矩形、圆形、L 形、条形）；
2.  异色判断：有配件时槽内应能看到异于黑色泡沫的物体（银白、透明、金属光泽等）；
3.  遮挡处理：工具包可能遮挡缓冲器槽，需要人工复核；
4.  空槽识别：空槽的泡沫形状轮廓容易被误判为"有配件"；

### 2.2 核心痛点分析

通过和客户相关人员的深度访谈和场景调研，我们识别出以下核心痛点：

1、人工目检效率低下

*   每台机器包装入库需要拍照 + 人工比对，单次平均 30 秒
*   每天上百台机器的峰值产能下，质检员累计工时按小时计
*   临近下班疲劳度高，漏检率明显上升

2、判断标准依赖个人经验

*   新员工需要数周跟老师傅学习才能独立判断
*   不同质检员对"拿不准"的模糊案例判断不一致
*   缺少标准化的输出报告用于追溯

3、企业内部沟通基础设施已有

*   产线 QA 工作全部通过飞书群沟通
*   希望 AI 助手直接接入现有飞书工作流，不再增加额外的操作工具

4、私有化/合规要求

*   包装图可能涉及产品外观设计，不希望上传到公网 SaaS
*   要求模型推理在 AWS 账户内闭环，走 VPC Endpoint 访问 Bedrock5、迭代频率高
*   配件清单会随产品迭代变化（比如下个月新增一款配件盒）
*   要求业务侧可以在不发版的情况下自行更新判断规则

### 2.3 技术方案选型

基于客户的实际情况和业务诉求，我们选择了Amazon EKS Auto Mode + Amazon Bedrock + OpenClaw的组合方案。

**2.3.1 AI 能力以 Skill 形式交付，而非微调**

打印机包装判断属于典型的\*\*规则化视觉判断\*\*任务：判据（哪个槽有什么、如何辨认有无）可以用自然语言清晰描述，但配件清单会随产品迭代。Fine-tune 成本高、迭代慢、绑死模型；RAG 不擅长结构化判断步骤；而 \*\*OpenClaw 的 Skill 机制\*\* 把 SKILL.md + 参考样例图打包成一个资源包，Agent 在识别到触发条件时自动加载并按步骤执行，迭代规则只需改一个 markdown 文件，几秒内生效。

**2.3.2 Bedrock 支持私有化多模态调用**

Claude Sonnet 4.6 原生支持图片输入 + 文本输出，通过 Bedrock 调用可以：- 在客户 AWS 账户 VPC 内部，走 VPC Endpoint，数据不出账户- 使用 IAM 或 Long-term API Key 做细粒度授权- CloudTrail 全量审计，满足合规要求- 成本按 Token 实际用量计费，无最低消费

**2.3.3 Amazon EKS Auto Mode 降低运维负担**

OpenClaw 需要长驻 gateway 进程（Channel 接入、TUI、Session 管理），天然适合容器化部署。Amazon EKS Auto Mode 自动管理节点、存储卷、扩缩容、安全补丁，运维团队不需要关心 Node 层的维护。Pod 使用 EFS 做持久化存储，自定义 Skill 和 Agent 记忆跨 Pod 重启不丢失。

**2.3.4 飞书 Channel 作为用户入口**

客户已经全员使用飞书进行内部沟通。OpenClaw 提供开箱即用的飞书 Channel，通过 WebSocket 与飞书开放平台连接，质检员在飞书中 @机器人并上传包装图片即可触发质检，结果以标准化报告形式在飞书消息中返回。无需额外部署 Web UI、移动端或小程序。

## **3、系统架构详细设计**

系统整体架构如下图所示：

[![](https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/05/26/amazon-eks-practice-assistant-1.jpg)](https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/05/26/amazon-eks-practice-assistant-1.jpg)

## 深度分析

### 3.1 Skill vs RAG vs Fine-tune：方法论边界

三维选型框架：准备成本（Skill 数小时 vs Fine-tune 千至万条标注数据）、迭代速度（改 Markdown 立即生效 vs 重训数天）、跨模型迁移性（Skill 无状态 vs Fine-tune 绑死版本） ^。规则化视觉判断（质检、SOP 核查）天然适合 Skill；通用能力提升属 Fine-tune；大量事实性知识检索属 RAG ^。

### 3.2 VPC Endpoint SG 动态性陷阱

EKS Auto Mode 为 Pod 自动创建的 SG 不固定（每次调度变化），因此 **VPC Endpoint SG 必须放行整个 VPC CIDR 段**，而非精确绑定 Pod SG ^。若精确绑定，Bedrock/EFS/STS 调用全部超时 ^。此细节在标准 EKS 文档中未被突出强调，属于 EKS Auto Mode 特有复杂度。

### 3.3 Skill 注册与召回的上下文盲区

**Skill 不会自动加载进 Agent Context** — LLM 只能基于当前上下文可见信息决策，本质是 RAG 式召回问题 ^。解法是在 `AGENTS.md` 末尾显式追加 Skill 描述块 ^。Skill "安装"和"激活"是两个独立环节，不主动管理上下文可见性将导致 Agent 始终回复"没有这个技能"，即使 Skill 状态为 `ready`。

### 3.4 版本锁定与容器化 Agent 运维纪律

OpenClaw 2026.5.x 系列 ESM 打包 bug 导致飞书插件死循环重启，overlay 层使 in-place patch 无效 ^。解法是回滚到 2026.4.15 并锁定镜像 tag（严禁 `:latest`） ^。`initContainer` 中所有 `openclaw config set` 命令必须放在同一 shell 进程内一次性执行，否则 Gateway 读到中间态配置导致 TUI 显示 `model: unknown` ^。

### 3.5 成本结构与分层推理降本路径

POC 月费用约 $438.56，其中 Bedrock Claude Sonnet 4.6 最高（$180），其次是 EC2（$55.85）和 NAT Gateway（$65.70） ^。三级降本路径：非工作时段 `scale to 0`（仅保留 EFS）^；生产规模扩大后用 Claude Haiku 4 做初筛、Sonnet 4.6 处理复杂判断的分层架构 ^；多租户共享 Cluster 摊薄成本 ^。

## 实践启示

### 4.1 VPC Endpoint SG 必须覆盖整个 VPC CIDR

EKS Auto Mode Pod SG 动态分配，无法预先固定 ^。为 Bedrock Runtime、S3、STS、EFS 创建的 VPC Endpoint 入站规则必须放行整个 VPC CIDR，而非精确绑定 Pod SG。配置错误会导致所有 AWS 托管服务超时，但服务本身正常，排查难度高。

### 4.2 生产环境必须用 IRSA 而非 Long-term API Key

POC 可用 Long-term API Key 快速验证，但生产环境必须切换到 IRSA 通过 STS 换发短期 Token，满足最小权限原则 ^。关键：IRSA Trust Policy 必须包含 `sts:TagSession`（EKS Auto Mode 特殊要求） ^，IAM Policy 应仅授予 `bedrock:InvokeModel` 针对特定 Model ARN，而非 `bedrock:*`。

### 4.3 Skill 安装后必须同步到 AGENTS.md 以激活上下文可见性

安装 Skill 后需在 `AGENTS.md` 末尾显式追加描述块（触发词、路径、条件） ^。Agent 依赖 SKILL.md `description` 做语义检索，但 Skill 不会自动出现在上下文中 ^。不主动管理上下文可见性将导致 Agent 始终回复"没有这个技能"。

### 4.4 生产部署必须固定 OpenClaw 版本，禁止 `:latest` tag

2026.5.x 系列 ESM bug 导致飞书插件死循环重启，overlay 层使 in-place patch 无效 ^。CI/CD 中维护版本锁定列表便于回滚。`initContainer` 所有 `openclaw config set` 命令必须在同一 shell 进程完整执行，避免 Gateway 读到中间态配置 ^。

### 4.5 质检场景 Skill 应遵循"保守优先"原则抑制幻觉

`CRITICAL JUDGMENT RULE: 不要猜测为"有"` 是减少幻觉最有效的手段 ^。制造业质检场景 **误报（无报为有）比漏报危害更大**，会导致合格品被误判触发返工 ^。Skill 报告应区分"已确认"、"疑似"、"需人工复核"三类状态 ^，高风险决策转人类复核。

## 参考来源

## 相关实体
- [Bedrock Agentcore Payment X402 Agent](../ch11-006-用-amazon-bedrock-agentcore-payment-构建自主支付-ai-agent-x402-协议实战/)
- [Ci T Based On Amazon Bedrock Agentcore Openclaw Enterprise Intelligent Operations Best Practices](../ch11-056-ci-amp-t基于-amazon-bedrock-agentcore-与-openclaw-的企业级智能运维最佳实践/)
- [Ai Agent 的迁移与现代化 使用 Amazon Bedrock Agentcore 将 Openclaw 从单机改造为多租户 Serverless 架构 ](../ch11-076-ai-agent-的迁移与现代化-使用-amazon-bedrock-agentcore-将-openclaw-从单机改/)
- [Using Amazon Bedrock Agentcore Openclaw Multi 4](../ch11-191-ai-agent-的迁移与现代化-使用-amazon-bedrock-agentcore-将-openclaw-从单/)
- [Using Amazon Bedrock Agentcore Openclaw Multi 5](../ch11-017-基于-aws-示例项目-展示如何将-openclaw-迁移为基于-amazon-bedrock-agentcore-的多/)

→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/openclaw-amazon-bedrock-eks-printer-qc.md)

---

