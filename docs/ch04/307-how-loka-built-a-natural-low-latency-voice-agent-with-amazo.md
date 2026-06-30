# How Loka Built a Natural, Low-Latency Voice Agent with Amazon Nova 2 Sonic

## Ch04.307 How Loka Built a Natural, Low-Latency Voice Agent with Amazon Nova 2 Sonic

> 📊 Level ⭐⭐ | 8.1KB | `entities/how-loka-built-a-natural-low-latency-voice-agent-with-amazon.md`

# How Loka Built a Natural, Low-Latency Voice Agent with Amazon Nova 2 Sonic

> **Background**：AWS 官方博客 2026-06-24 发布的案例研究，详细介绍了 Loka 如何使用 Amazon Nova 2 Sonic 构建低延迟、自然对话的语音 Agent。文章包含具体的性能基准测试数据（Big Bench Audio 87.0 分）、架构设计细节和 Prompt 工程迭代过程。

## 摘要

Loka 为汽车经销商构建了一个基于 Amazon Nova 2 Sonic 的语音 Agent，解决了传统语音助手"机器人感强、延迟高、客户挂断"的核心痛点。通过 speech-to-speech 端到端处理，系统实现了 1.39 秒的首音延迟，Big Bench Audio 推理得分 87.0（超越 Gemini 2.5 Flash 的 71.0 和 GPT Realtime 的 83.0），成本仅 $0.27/小时。通过迭代 Prompt 工程，整体评分从 2.7 提升到 3.8/5.0。

## 核心要点

### 1. 传统语音助手的根本缺陷

传统语音助手采用**三步流水线**：

1. **STT**（语音转文本）：将语音转换为文本
2. **LLM**（大语言模型）：处理文本并生成响应
3. **TTS**（文本转语音）：将文本响应转换回语音

这个流水线在每一步都引入**累积延迟**，导致用户听到响应前需要等待 3-5 秒。在汽车经销商的销售场景中，这种延迟破坏了自然对话的感觉，让打断或纠正助手变得笨拙和令人沮丧。更关键的是，STT 过程中丢失了**语调、犹豫和紧迫感**等关键声学特征。

### 2. Speech-to-Speech 端到端方案

Nova 2 Sonic 采用**原生 speech-to-speech**方案：

- 直接处理音频流，无需中间文本转换
- 在单一模型中完成理解、推理和生成
- 保留语调、情感和细微线索

**性能基准（Big Bench Audio）**：

| 模型 | 语音推理得分 | 首音延迟 | 成本/小时 |
|------|------------|---------|----------|
| **Nova 2 Sonic** | **87.0** | **1.39s** | **$0.27** |
| Gemini 2.5 Flash | 71.0 | - | - |
| GPT Realtime | 83.0 | - | - |

1.39 秒的首音延迟支持自然的"打断"行为，符合人类对话模式。

### 3. Prompt 工程迭代：从 2.7 到 3.8

Loka 将 Prompt 视为代码，基于测量性能进行迭代：

| 配置 | 响应适当性 | 意图理解 | 完整性 | 对话自然度 | 总分 |
|------|-----------|---------|--------|-----------|------|
| Baseline | 2.9 | 3.0 | 2.5 | 2.8 | 2.7 |
| Prompt v1 | 3.2 | 3.3 | 3.0 | 3.9 | 3.1 |
| **Prompt v2** | **3.7** | **3.9** | **3.9** | **4.1** | **3.8** |

关键改进：
- **模板化变量**：用 `{assistant_name}`、`{dealership_address}` 替换硬编码细节
- **结构化格式**：从编号列表改为带标题的要点，减少指令间干扰
- **行为示例**：添加具体示例展示如何回应而不重复用户的话
- **预响应检查清单**：在每次回复前进行自我审计

Prompt 管理通过 **Amazon Bedrock Prompt Management** 实现，每个模板版本有唯一 ARN，支持从草稿到生产的无缝升级。

### 4. 边缘场景测试

| 场景 | 总分 | 特点 |
|------|------|------|
| 忙碌家长 | **5.0** | 完美处理打断、背景噪音、时间压力 |
| 愤怒客户 | 4.5 | 保持冷静、共情、专注解决方案 |
| 困惑客户 | 4.5 | 耐心澄清而不居高临下 |
| 健谈客户 | 3.0 | 长篇输入导致完整性下降 |
| 老年客户 | 3.0 | 类似挑战，错误恢复降至 2.0 |

平均边缘场景得分 4.0，表明系统具有较强的真实场景准备度。

### 5. 生产架构设计

Loka 的架构采用**无服务器、事件驱动**设计：

- **传输层**：LiveKit（抽象 WebRTC/SIP 复杂性）
- **计算层**：AWS Fargate + ECS（独立扩展 Agent Worker 和媒体服务器）
- **持久层**：Amazon RDS（经销商配置、对话历史、客户记录）
- **缓存层**：Amazon ElastiCache（房间管理、临时会话协调）
- **模型层**：Amazon Bedrock（Nova 2 Sonic 直接访问）
- **可观测性**：Langfuse（自托管，追踪每个 Agent 决策和工具调用）

工具层通过 Python 函数实现，包括库存搜索、预约、客户数据查询等。模型决定何时使用工具，Python 函数执行 GraphQL 查询并返回结构化数据。

## 深度分析

### Speech-to-Speech vs STT→LLM→TTS

Nova 2 Sonic 的端到端方案解决了传统流水线的几个根本问题：

1. **延迟**：消除中间文本转换，延迟从 3-5 秒降至 1.39 秒
2. **信息丢失**：保留语调、情感、犹豫等声学特征
3. **错误累积**：单一模型避免了多步骤错误传播
4. **成本**：$0.27/小时的成本使其在大规模部署中具有经济可行性

这与 [医疗预约 Agent](ch04/498-build-a-healthcare-appointment-agent-with-amazon-nova-2-soni.md) 的设计选择一致——两者都采用了 Nova 2 Sonic 作为核心模型。

### Prompt 工程的工程化

Loka 的 Prompt 工程方法值得学习：

1. **版本管理**：每个 Prompt 版本有唯一 ARN，支持回滚和审计
2. **变量模板化**：将客户特定信息与通用逻辑分离
3. **结构化格式**：使用标题和要点减少指令间干扰
4. **自审计机制**：预响应检查清单确保每次回复都经过验证

这种方法将 Prompt 从"一次性任务"转变为**可重复、可审计的工作流**。

### 架构的可扩展性

Loka 的架构设计考虑了大规模部署的需求：

- **独立扩展**：Agent Worker 和媒体服务器可以独立扩展
- **资源优化**：在经销商高峰时段动态优化资源
- **成本控制**：无服务器架构避免了闲置资源的浪费
- **多租户支持**：同一核心 Prompt 通过变量注入为每个客户提供定制服务

## 实践启示

### 对语音 Agent 开发者的建议

1. **优先考虑延迟**：用户对延迟的容忍度极低，1.39 秒是可接受的上限
2. **投资 Prompt 工程**：Prompt 迭代可以带来 40%+ 的性能提升
3. **测试边缘场景**：健谈客户和老年客户暴露了系统的弱点
4. **使用 Prompt 管理工具**：版本控制和审计是生产环境的必需品

### 对 Agent 架构师的启示

1. **端到端模型优于流水线**：当可用时，优先选择端到端方案
2. **无服务器架构适合语音场景**：流量具有明显的高峰和低谷模式
3. **可观测性是关键**：Langfuse 等工具提供了必要的调试和优化能力
4. **工具层应该轻量**：Python 函数 + GraphQL 是一个有效的组合

### 对企业客户的建议

1. **从具体场景开始**：汽车经销商是一个明确的起点
2. **定义清晰的成功指标**：对话自然度、完整性、错误恢复
3. **持续迭代 Prompt**：Prompt 工程是一个持续的过程
4. **监控成本**：$0.27/小时在大规模部署中可能快速累积

## 相关实体

- [医疗预约 Agent](ch04/498-build-a-healthcare-appointment-agent-with-amazon-nova-2-soni.md) — Nova 2 Sonic 在医疗场景的应用
- Voice Agent Architecture — 语音 Agent 架构设计
- [Agent Harness Context Management](ch04/503-agent.md) — Agent 上下文管理
- [Harness Engineering Framework](https://github.com/QianJinGuo/wiki/blob/main/concepts/harness-engineering-framework.md) — Harness 工程框架

## 参考

→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/how-loka-built-a-natural-low-latency-voice-agent-with-amazon.md)

---

