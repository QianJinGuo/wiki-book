# So You Want to Sell Inference

## Ch01.585 So You Want to Sell Inference

> 📊 Level ⭐⭐ | 6.2KB | `entities/tomtunguz-com-so-you-want-to-sell-inference.md`

# So You Want to Sell Inference

## 摘要

Tom Tunguz 深入分析 LLM 推理市场的商业经济学。核心论点：AI 增长最快的公司要么在卖推理，要么在转售推理。但推理转售是**零毛利业务**——本质上是支付通道而非软件公司。文章系统性地拆解了三种定价策略：cost-plus markup、value-based pricing、cost optimization，并指出 **value-based pricing 是唯一可持续的模型**。

## 核心要点

### 三种定价策略

#### 1. Cost-plus Markup

在推理成本之上加价：

- **原理**：客户价格 = 推理成本 × 1.3（30% 毛利）
- **前提**：harness（产品、工作流、UX）必须足够好，才能证明溢价合理
- **致命缺陷**：客户会将你的价格与 raw API 对比，然后绕过你
- **趋势**：随着推理 commoditize，markup 向零压缩

这是最简单的模型，但也是最脆弱的。本质上是**支付处理器 + 仪表板**。

#### 2. Value-based Pricing

按结果收费：

- **原理**：按解决的 ticket 数、完成的任务数、生成的报告数收费——创造价值的一个比例
- **案例**：Sierra 只在 agent 解决 ticket 时收费，失败不收费
- **案例**：Devin 卖 Agent Compute Units（ACU），不是 token——与 Databricks、Snowflake 的 credit 模型相同
- **优势**：毛利与推理成本**完全解耦**，客户看不到你的推理成本
- **持久性**：这是真正的软件商业模式

#### 3. Cost Optimization

降低推理成本以扩大毛利：

- **Model routing**：根据任务复杂度路由到不同模型（战术性，可复制）
- **Caching**：缓存重复查询的推理结果（战术性，可复制）
- **Distillation**：用 frontier 模型生成训练数据，蒸馏到 sub-8B 参数的专有小模型（**可防御**）

Distillation 是唯一可持续的优化策略：生产流量通过 frontier teacher 模型，蒸馏到学生模型，部署在便宜硬件上。最终你拥有竞争对手无法复制的专有模型。

### Bring Your Own Key 的影响

当客户自带 API key 时：

- **Cost-plus 崩溃**：客户在云账单上看到原始推理成本，markup 变成可见的税
- **Value-based 存活**：客户直接付推理费，为你为结果付费
- **Optimization 存活**：客户带 key 不带引擎，你收平台费

结论：**卖平台，不卖 token**。

### 董事会应该问的问题

每个推理转售业务的董事会都应该问：**你在运行哪种定价模型？**

- Cost-plus = 带仪表板的支付处理器
- Value-based = 软件公司

答案决定了你在构建什么。

## 深度分析

### 推理市场的结构性变化

推理正在经历与其他基础设施服务相同的 commoditization 路径：

**类比历史**：
- **计算**：从自建机房 → IaaS（AWS）→ 价格战 → 价值在 PaaS/SaaS 层
- **存储**：从本地磁盘 → S3 → 价格战 → 价值在数据平台层
- **推理**：从自建 GPU → API 服务 → 价格战 → 价值在应用层

推理是 AI 时代的"第一导数"（first derivative of inference），但第一导数本身不创造持久价值。

### Harness 的价值与陷阱

文章提到了一个关键概念：**harness**（产品、工作流、UX 包装在模型周围）。这与 [Harness Engineering](/ch05-041-harness-engineering-概念框架/) 的理念高度吻合。

但 harness 存在一个陷阱：

- 如果 harness 只是**包装**（wrapper），客户会绕过你直接调 API
- 如果 harness 是**价值创造**（解决具体问题），客户愿意按结果付费

区别在于：wrapper 增加成本，harness 创造价值。

### 对 AI Infra 投资的启示

Tom Tunguz 的分析对投资者有明确的指引：

1. **纯推理转售**：零毛利，不值得投资
2. **Cost-plus wrapper**：随着推理 commoditize，毛利趋向零
3. **Value-based 平台**：持久的软件商业模式，值得投资
4. **Distillation + 专有模型**：可防御的竞争优势

### Sierra 和 Devin 的定价模式

文章举的两个案例值得深入分析：

**Sierra**：按 resolved ticket 收费
- 客户为**结果**付费，不为 token 付费
- 失败的尝试 = Sierra 的成本，不是客户的成本
- 激励对齐：Sierra 有动力提高成功率

**Devin**：Agent Compute Units (ACU)
- 抽象层在 compute 之上，类似 Databricks 的 DBU
- 客户理解的是"完成工作量"，不是"消耗多少 token"
- 定价与底层推理成本解耦

## 实践启示

- **定价策略**：如果你在卖推理，立即转向 value-based pricing
- **Distillation**：投资专有小模型的能力，这是可防御的竞争优势
- **Harness 设计**：确保你的 harness 创造价值而非仅增加成本
- **BYOK 策略**：支持客户自带 key，但确保你的价值不依赖于 markup
- **指标选择**：用业务指标（resolved tickets、completed tasks）而非技术指标（tokens）定价

## 相关实体

- [Harness Engineering](/ch05-041-harness-engineering-概念框架/) — harness 的价值与陷阱
- [AgentCore](/ch04-206-agentcore-managed-harness/) — 平台层产品的定位参考
- Inference Economics — 推理经济学的更广泛讨论
- Sierra — value-based pricing 的案例
- Devin — ACU 定价模型的案例
- Model Distillation — cost optimization 的核心策略

→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/tomtunguz-com-so-you-want-to-sell-inference.md)

---

