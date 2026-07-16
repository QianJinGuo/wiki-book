# Build a Healthcare Appointment Agent with Amazon Nova 2 Sonic

## Ch04.594 Build a Healthcare Appointment Agent with Amazon Nova 2 Sonic

> 📊 Level ⭐⭐ | 3.7KB | `entities/build-a-healthcare-appointment-agent-with-amazon-nova-2-soni.md`

# Build a Healthcare Appointment Agent with Amazon Nova 2 Sonic

## 核心洞察

Amazon Nova 2 Sonic 的 speech-to-speech 模型 + Bedrock AgentCore 无服务器 runtime + Strands Agents SDK 的 `BidiAgent` 类，构成一个完整的**端到端语音 Agent 部署方案**。核心价值：传统方案是 STT->LLM->TTS 三段式链路（每步丢上下文），Nova 2 Sonic 直接在单一模型内处理语音，保留语调、犹豫、紧迫感等声学特征。

## 架构设计

- **前端**：React 浏览器界面，WebSocket 双向音频流
- **认证**：Amazon Cognito + SigV4 签名
- **Agent Runtime**：Amazon Bedrock AgentCore（无服务器容器部署）
- **模型**：Amazon Nova 2 Sonic（speech-to-speech，16kHz 采样率）
- **持久化**：DynamoDB（患者/预约/可用时段 3 张表）
- **通知**：Amazon SNS（人工升级通知）
- **SDK**：Strands Agents SDK 的 `BidiAgent` + `BidiNovaSonicModel`

## 7 个医疗工具（Strands @tool 装饰器）

| 工具 | 功能 | 实现细节 |
|------|------|----------|
| `authenticate_patient` | 语音身份验证 | DynamoDB GSI 查询，3 次尝试限制 |
| `confirm_appointment` | 确认预约 | 幂等更新，防重复确认 |
| `cancel_appointment` | 取消预约 | 状态机限制（仅 Scheduled/Confirmed/Rescheduled） |
| `find_available_slots` | 查询可用时段 | ProviderDateIndex GSI，返回 3 个选项 |
| `book_appointment_slot` | 预约时段 | DynamoDB 条件写入，原子防双预约 |
| `record_health_update` | 采集就诊前健康信息 | 4 项逐条采集（病史/过敏/陪同/顾虑） |
| `escalate_to_agent` | 人工升级 | 6 位参考号 + SNS 通知 |

## 对话流程（4 阶段）

1. **认证**：语音问候 -> 姓名+SSN 后四位 -> 重复确认 -> 工具验证
2. **预约管理**：展示预约详情 -> 确认/取消/改期 -> 改期时查询可用时段
3. **健康信息采集**：4 个问题逐条询问
4. **升级**：任意时刻可请求人工 -> 生成参考号 -> SNS 通知

## 关键设计决策

- **工具可插拔**：新增能力只需一个 `@tool` 函数 + 更新 system prompt
- **system prompt 驱动流程**：reschedule flow 等逻辑在 prompt 中定义，非硬编码
- **声学上下文保留**：Nova 2 Sonic 能感知患者语气变化（焦虑/困惑），调整回复策略
- **多语言切换**：对话中可自动切换患者偏好语言

## 部署

GitHub: aws-samples/sample-Nova-Sonic-AgentCore-Healthcare-Call-Center
CDK v2 一键部署，包含 Cognito + DynamoDB + SNS + AgentCore Runtime。

## 与现有 Agent 实体的差异化

本实体聚焦 **speech-to-speech 语音 Agent 的完整工程实现**（Nova 2 Sonic + AgentCore + Strands SDK），而非通用 Agent 框架理论。核心区别：
1. **声学层**：直接处理语音信号，非 STT->LLM->TTS 链路
2. **医疗领域约束**：身份验证合规、隐私数据处理、人工升级机制
3. **端到端部署**：CDK 一键部署到 AWS，含认证+持久化+通知

---

