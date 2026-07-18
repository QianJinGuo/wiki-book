# 用 AI Agent 自动化日常办公工作流 — 在 AWS 上构建 Outlook 邮件助手

## Ch11.090 用 AI Agent 自动化日常办公工作流 — 在 AWS 上构建 Outlook 邮件助手

> 📊 Level ⭐⭐ | 10.2KB | `entities/outlook-ai-agent-aws-fargate-claude-agent-sdk.md`

# 用 AI Agent 自动化日常办公工作流 — 在 AWS 上构建 Outlook 邮件助手

> **Background**: 中国区企业的 AI Agent 办公自动化方案。Agent 运行时基于 Claude Agent SDK 部署在 AWS Fargate，Skill 文件描述业务流程，MCP 封装外部系统，模型层通过硅基流动 SiliconFlow 接入（Bedrock 在中国区尚未提供）。

## 四层架构

```
┌─────────────────┐
│  Skill 层        │ ← Markdown 描述触发条件/执行步骤/工具调用顺序
├─────────────────┤
│  Agent 运行时    │ ← Claude Agent SDK on AWS Fargate
├─────────────────┤
│  模型层          │ ← SiliconFlow DeepSeek-V3 / Qwen2.5-72B (Anthropic 兼容)
├─────────────────┤
│  MCP 工具层      │ ← Microsoft Graph (Outlook) / 其他 SaaS 适配
└─────────────────┘
```

## 各层职责

### 1. Agent 运行时

- Claude Agent SDK 启动完整 Agent 子进程
- 内置推理-规划-执行循环
- 原生支持 MCP 工具发现与调用
- 多轮会话上下文

### 2. 模型层

- Bedrock 在 AWS 中国区（北京/宁夏）尚未提供
- 通过 AWS Marketplace 订阅硅基流动 SiliconFlow
- 兼容 Anthropic Messages API 端点
- 订阅与计费合并到 AWS 账单
- 更换 baseURL + API Key 即可切换其他供应商

### 3. Skill 层

- 每个办公场景对应一份 SKILL.md
- 随容器镜像打包或通过挂载卷加载
- **非技术人员可直接修改**（业务同事调整后更新镜像/挂载卷）
- 描述触发条件、执行步骤、工具调用顺序、输出格式、异常处理

### 4. MCP 工具层

- 统一封装外部系统（Microsoft Graph / 其他 SaaS）
- 适配中国区 Microsoft Graph 端点

## 适用场景

- Outlook 邮件助手（本文示例）
- 日历调度
- 文档归档
- 会议纪要
- 审批流转
- IT 工单分诊

## 工程实践要点

- 中国区部署需要：Fargate ARM64 镜像 + Microsoft Graph 中国区端点
- Skill 文件版本管理（Git 追踪）
- 模型供应商解耦（baseURL 切换）
- Agent 子进程资源限制（防止异常占用 Fargate CPU）

## 价值

- 业务同事不需懂代码即可调整 Skill
- 同一架构平移到不同办公场景
- 判断密集型任务（邮件分拣、会议待办、合同进度）自动化

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/outlook-ai-agent-aws-fargate-claude-agent-sdk.md)

## 深度分析

### 1. Skill 文件作为业务语言层的架构意图

Skill 层用 Markdown 描述业务流程，其核心设计意图是在工程层与业务层之间建立一个可直接沟通的中间层。这一层使非技术背景的业务同事能够独立调整自动化流程，而无需触及代码或重新部署服务。从工程角度看，这是一种职责分离（separation of concerns）实践：底层 API 调用相对稳定，而业务流程变化频繁。将流程定义从代码层抽离到 Markdown 文件，既降低了流程变更的操作成本，也使得同一份 Skill 可以在不同模型之间移植时保持行为基本一致。这种设计思路与 [Harness Engineering](../ch05/052-harness-engineering.html) 框架中"慢知识"（静态版本化知识）的概念相呼应 — Skill 文件本质上是结构化的业务知识载体，而非运行时逻辑。

### 2. MCP 协议作为企业级异构系统接入标准的价值

四层架构中 MCP 工具层承担了隔离 Agent 运行时与底层企业 API 差异的关键职责。Microsoft Graph、OneDrive、ServiceNow、Jira、企业 ERP 系统各有不同的 API 形态和认证机制，但 MCP 协议将它们收敛到统一的工具发现与调用接口。这意味着新增一个外部系统集成只需要开发一个新的 MCP Server，原有的 Skill 文件和 Agent 运行时无需改动。在 [Aderant Transforms Cloud Operations With Amazon Quick](ch11/191-aderant-transforms-cloud-operations-with-amazon-quick.html) 中已记录类似模式：MCP 作为连接 AI Agent 与企业数据孤岛的核心中间层，将系统打通成本从月级降至周级。该架构的可扩展性验证了 MCP 协议在企业级 Agent 部署中的标准化价值。

### 3. 模型可替换性作为中国区合规约束下的关键设计选择

文章明确指出 Bedrock 在 AWS 中国区（北京/宁夏）尚不可用，方案因此必须依赖第三方模型服务。这一约束反过来促成了架构中的模型无关性设计：模型层通过 baseURL + API Key 解耦，更换供应商仅涉及配置变更而非架构调整。从供应链合规角度看，将模型供应商的评估和选择权保留在业务层面（而非硬编码进架构）是必要的 — 中国区企业的数据出境合规要求使得模型供应商的资质评估成为采购决策的关键环节，而非技术选型的附属考虑。这种设计让"用什么模型"从架构决策降级为配置决策，降低了供应商更替的实际成本。

### 4. 草稿确认门作为外发动作合规基线的设计意图

Agent 不直接发送邮件，而是将起草的回复落入用户"草稿"文件夹由用户审阅后发送 — 这是方案中唯一的外发动作约束，也是一项硬编码设计而非可配置选项。这反映了在企业 AI Agent 部署中的一条核心原则：涉及外部各方的动作必须有人工确认环节。邮件草稿门的设计将 AI 定位为人类判断的增强而非替代，这与 [Harness Engineering 90 Percent Pillars](../ch05/052-harness-engineering.html) 中强调的可验证循环和约束验证理念一致。在更广泛的场景扩展中（审批流转、工单关闭、会议邀请发送），同一原则被建议作为安全与合规基线 — 所有外发动作落入待审状态或通过 IM 审批卡片推送确认。

### 5. Skill 自动生成机制对系统可维护性的深远影响

文章描述了一种"教一次，复用无数次"的 Skill 创建流程：用户带 Agent 实际执行任务过程中不断调整预期行为，任务做对后用户说"帮我把刚才的过程总结成一个 Skill"，Agent 自动调用内置 skill-creator 能力生成 SKILL.md。这一机制的重要意义在于将维护责任从技术侧（修改 Prompt/代码）转移到了业务侧（演示正确行为）。相比传统的 Prompt Engineering，这种方式生成的 Skill 源自用户实际演示的行为而非描述的行为，减少了表达与执行之间的语义偏差。从系统演化角度看，当业务流程变化时，用户可以通过重新演示而非手动编辑来更新 Skill，降低了维护门槛，同时使 Skill 的演进速度更容易与业务需求变化同步。

## 实践启示

### 1. 为 Skill 文件建立 Git 版本控制流程并制定提交规范

Skill 层直接面向非技术业务人员可写，必须从项目初期就建立 Git 版本控制机制。建议为每个场景的 Skill.md 配置独立的 Git 仓库或子目录，制定提交流程规范：每次 Skill 变更需附带变更说明（为什么改、改了什么），便于追溯和回滚。对于团队协作场景，可以引入 Pull Request 审查流程，确保业务同事的修改经过技术复核后再合并，避免语法错误导致 Agent 行为异常。

### 2. 为每个 MCP Server 实现最小权限配置并独立管理凭证

方案中 Microsoft Graph 的 OAuth 权限粒度（Mail.Read、Mail.ReadWrite、Mail.Send 等）是按场景设计的。在扩展到 files-mcp、flow-mcp、ticket-mcp 时，应继承这一原则，为每个 MCP Server 分配独立的凭证和最小必要权限，避免一份凭证全场景通用导致横向移动风险。凭证统一存入 AWS Secrets Manager，应用通过任务角色按需读取，不写入容器镜像或环境变量文件。

### 3. 将草稿确认门作为所有外发动作的标准强制环节

无论场景是邮件、日历邀请、审批推动还是工单关闭，一律要求 AI 将动作结果落入草稿/待确认状态，再通过 IM 审批卡片等企业内通道推送用户确认。这一约束应该在 Skill 层的输出格式声明中显式定义，而非依赖用户自觉检查。建议在所有 Skill 模板中预设"步骤 N：提交前确认"环节，明确标注哪些工具调用属于外发动作需要人工复核。

### 4. 设计跨模型供应商的一致性验证测试流程

由于方案支持通过更换 baseURL + API Key 切换模型供应商，应建立标准化的测试套件确保切换后行为一致。建议设计一组覆盖所有主要 Skill 场景的基准测试用例，分别在不同模型上运行并比对输出质量、工具调用准确率、异常处理表现等指标。这项测试应在供应商更替时强制执行，作为架构所声称的"模型无关性"的实际验证手段。

### 5. 对接企业 IM 审批通道实现产品化人工审批闭环

文章建议将人工审批步骤产品化，对接到企业 IM 工具（钉钉、企业微信、飞书等）的审批卡片。这一建议实践价值显著：草稿文件夹是被动的，用户需要主动进入邮箱查看；而 IM 审批卡片是主动推送的，用户的操作摩擦更低。建议在 PoC 阶段就规划与客户侧 IM 平台的集成方案，将待审批项以结构化卡片形式推送给责任人，同时收集用户的采纳率数据以量化 AI 辅助的实际效果。

---

