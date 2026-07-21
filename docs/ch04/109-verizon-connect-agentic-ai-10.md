# Verizon Connect Agentic AI: 10万用户规模的工程实践

## Ch04.109 Verizon Connect Agentic AI: 10万用户规模的工程实践

> 📊 Level ⭐⭐ | 15.9KB | `entities/verizon-connect-agentic-ai-100k-users.md`

# Verizon Connect Agentic AI: 10万用户规模的工程实践

> **背景**：本文档基于 AWS Machine Learning Blog 的 Verizon Connect 案例编写，探讨如何在生产环境中大规模部署 Agentic AI 系统。 

## 核心架构：两层 Agentic 设计

Verizon Connect 的 Fleet Management Agentic AI 系统采用两层架构，每层使用 LLM 的不同推理能力：

**第一层：异常聚合与优先级排序**
- Agent 接收原始异常数据（1.2M 车辆 × 500M 数据点/天）
- LLM 自主决定如何聚合异常（按根因、时间相关性、类别相似性）
- 自主分配相关性分数（严重程度、重复率、影响范围、可执行性）
- 输出 Top 4 最相关洞察进入下一阶段

**第二层：Agentic Tool-Based 调查**
- 为每个摘要洞察启动独立的 Agent 实例
- Agent 自主决定调用哪些工具、调用顺序、调用次数
- 迭代直到收集足够证据生成数据支持的洞察
- 关键优势：可发现未预料的模式和边缘案例 

## 关键技术决策

### 异常检测：专用代码 vs LLM

**问题**：要求 LLM 直接分析大规模原始表格数据是常见陷阱。

**解决方案**：使用 AWS Step Functions + Lambda 构建无服务器统计模型执行异常检测，识别"是什么"，让 AI Agent 专注"为什么"和"如何处理"。

### AI Agent 执行环境

- **框架**：Strands Agents（开源 SDK）
- **运行时**：AWS Lambda（无服务器，按需扩展）
- **状态管理**：Agent 无状态，上下文在分析时按需获取 

### 工具集

Agent 可用的工具：
- 从 S3 获取预计算的异常
- 从 Amazon Aurora 查询原始数据
- 从 DynamoDB 获取历史洞察
- 将最终洞察写回 S3
- 在 DynamoDB 中跟踪任务状态

### 大语言模型演进

| 阶段 | 模型 | 理由 |
|------|------|------|
| 验证 | Claude 4.5 Sonnet | 高质量验证逻辑和洞察质量 |
| 生产 | Claude 4.5 Haiku | 更具成本效益 |
| 成本优化 | Amazon Nova 2 Lite | 输入 Token 成本降低 70%，质量保持 |

**关键洞察**：工作负载以输入 Token 为主（遥测数据、异常、上下文），因此输入成本优化至关重要。

### 并发管理

使用 Amazon SQS 控制 SQS-to-Lambda 触发器的最大并发：
- 平滑 API 请求峰值
- 保持在 Amazon Bedrock 配额内（TPM、RPM）
- 可靠交付，无需过度配置

**时间窗口计算**：
- 总窗口：5 小时（3 小时时区差异 + 1 小时异常检测 + 4 小时 Agent 推理）
- RPM 1500 时，洞察生成约 1.25 小时

## 架构图

```
┌─────────────────────────────────────────────────────────────────────┐
│                      Daily Trigger                                   │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│              Anomaly Detection (Step Functions + Lambda)             │
│   - 从原始数据存储提取结构化信息                                      │
│   - 执行计算密集型异常检测                                           │
│   - 写入异常表                                                       │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│              AI Agent Activation (Strands Agents + Lambda)           │
│   ┌──────────────────────────────────────────────────────────────┐  │
│   │ Stage 1: Summary Generation                                   │  │
│   │  - 聚合异常为洞察候选                                         │  │
│   │  - 分配相关性分数                                             │  │
│   │  - 选择 Top 4 洞察                                            │  │
│   └──────────────────────────────────────────────────────────────┘  │
│                                  │                                   │
│                                  ▼                                   │
│   ┌──────────────────────────────────────────────────────────────┐  │
│   │ Stage 2: Detailed Generation                                  │  │
│   │  - 自主工具调用                                                │  │
│   │  - 数据驱动调查                                                │  │
│   │  - 生成最终洞察                                                │  │
│   └──────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│              Insight Delivery (Reveal Application)                  │
└─────────────────────────────────────────────────────────────────────┘
```

## 生成效果示例

系统生成的运营洞察示例：

- **安全模式检测**：「本周您的车队紧急制动增加 100%。有趣的是，这与紧急加速减少同时发生，提示驾驶员疲劳或交通拥堵加剧。」
- **运营效率**：「车辆 #90000 在发动机运转时间内有 50% 处于怠速状态，显著高于车队平均水平。这代表了不必要的燃油成本。」
- **车队性能**：「日行驶里程下降 59%，但超速事件增加 54%。这表明车辆行驶距离更短但速度更高——建议优化路线。」

## 深度分析

### 1. 分离数值分析与语义推理的设计哲学

Verizon Connect 明确拒绝了「让 LLM 直接处理大规模原始表格数据」的常见陷阱，转而采用专用统计模型负责「是什么」的数值异常检测，AI Agent 专注「为什么」和「如何处理」的语义推理。这种分离反映了 Agentic AI 系统的核心设计原则：LLM 不擅长数值计算，但卓越于因果推理和上下文理解。

这一设计选择背后的工程逻辑是：500M 数据点/天的规模下，即使是最强大的 LLM 也会在 token 消耗和推理质量上遭遇瓶颈。将「数值繁重」的工作卸载给专用代码，让 LLM 只处理聚合后的精简异常集，是实现大规模扩展的关键。

### 2. 两层推理架构的工程必然性

两层架构并非过度设计，而是解决实际工程问题的产物。第一层（聚合与排序）将 1.2M 车辆产生的海量异常压缩为可管理的 Top 4 洞察候选；第二层（Tool-Based 调查）则通过自主探索发现预定义规则永远无法覆盖的边缘模式。

这种架构的优势在于它天然支持并行化：每个 Top 4 洞察由独立 Agent 实例处理，彼此无状态依赖，可水平扩展。这与无服务器 Lambda 的执行模型高度契合。

### 3. 模型路由的成本优化策略

Verizon Connect 的模型演进路径（Claude 4.5 Sonnet → Claude 4.5 Haiku → Amazon Nova 2 Lite）揭示了一个重要的工程现实：对于输入密集型工作负载，输入 token 成本比输出 token 成本更具优化空间。

车队管理场景的输入 token 包含大量遥测数据、异常上下文、历史对比——这些信息量大但结构相对固定。Amazon Nova 2 Lite 将输入成本降低 70% 而质量保持，是典型的输入优化模型路由案例。这一策略的前提是建立了完善的自动化测试套件和质量基准数据集，确保模型切换不影响输出质量。

### 4. SQS 并发控制：保护下游配额的工程艺术

使用 SQS 控制 Lambda 触发器的最大并发是一个精巧的限流设计。在 TPM/RPM 配额约束下，SQS 充当了请求平滑器——即使上游产生突发流量，下游 Bedrock API 的请求速率也被限制在安全范围内。

5 小时时间窗口的拆解（3 小时时区差异 + 1 小时异常检测 + 4 小时 Agent 推理）说明了生产系统的窗口管理思维：每个阶段都有明确的预算，任何阶段的超时都会级联影响最终交付。RPM 1500 下 1.25 小时的洞察生成时间是经过精心计算的，留有充足余量。

### 5. 未来架构演进方向

文章透露的演进路径值得关注：从 AWS Lambda Agent 部署迁移到 Amazon Bedrock AgentCore Runtime，以及采用 Model Context Protocol（MCP）进行工具集成。这意味着当前基于 Strands Agents + Lambda 的无状态设计将逐步被 Bedrock 原生 Agent 能力取代，工具集成也将走向标准化。

## 实践启示

1. **避免 LLM 直接处理原始表格数据**：使用专用统计模型或规则引擎进行数值异常检测，让 LLM 专注语义分析。这是 Agentic AI 系统大规模扩展的前提条件。

2. **建立自动化质量保障体系**：在模型路由（如 Sonnet → Haiku → Nova 2 Lite）前，必须建立自动化测试套件和黄金基准数据集，确保质量不因成本优化而下降。

3. **利用 SQS 实现弹性限流**：通过控制 SQS-to-Lambda 的最大并发，既保护下游 API 配额，又能在不过度配置资源的前提下应对请求峰值。

4. **无状态 Agent 设计是水平扩展的基础**：Agent 无状态、上下文按需获取的执行模式，使得系统可以简单地通过增加并发实例来应对更大规模的工作负载。

5. **分阶段部署验证**：建议从小型试点开始验证用例和成本效率，再逐步扩展到全企业级部署。这与 AWS 官方倡导的三阶段方法论（试点 → 扩展 → 全企业部署）一致。

## 相关实体
- [Aws Bedrock Multi Agent Collaboration Guide](../ch11/009-aws-bedrock.html)
- [Spec Review Agent Baz Bedrock Agentcore Multi Agent](../ch11/050-bedrock-agentcore.html)
- [Introducing Os Level Actions In Amazon Bedrock Agentcore Browser](ch04/381-introducing-os-level-actions-in-amazon-bedrock-agentcore-bro.html)
- [Aws Bedrock Agentcore Identity Security](../ch11/253-aws-bedrock-agentcore.html)
- [航班变更信息智能识别解决方案](https://github.com/QianJinGuo/wiki/blob/main/entities/航班变更信息智能识别解决方案.md)

## 相关主题

- **Amazon Nova 2 Lite** — Amazon Nova 2 Lite 模型
- **Strands Agents** — Strands Agents 框架
- **Amazon Bedrock** — AWS 全托管生成式 AI 服务
- **AWS Step Functions** — AWS 无服务器工作流编排

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/verizon-connect-agentic-ai-100k-users.md)

---

