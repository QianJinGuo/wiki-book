# Build a Healthcare Appointment Agent with Amazon Nova 2 Sonic

> 📊 Level ⭐⭐⭐ | 11.8KB

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

## 深度分析

### Speech-to-speech 重排的是整条延迟与打断预算

级联方案（STT -> LLM -> TTS）的延迟是分段累加的：STT 要等静音检测判出"用户说完了"才收敛，LLM 再等首 token，TTS 再等首帧音频。真正的损失不止毫秒数——转写层把副语言信息（音高、停顿、迟疑）压扁成纯文本，下游模型只拿得到"说了什么"，拿不到"怎么说"。医疗提醒场景里，患者语气中的焦虑本应改变 Agent 的复述方式，这层信息在第一步就丢了。

Nova 2 Sonic 把语音理解与生成放进同一模型做双向流式，价值不止延迟：端到端音频意味着"边听边说"的路由、以及被打断时如何收尾，都由模型在音频空间自行维护，不必再叠一套外部 VAD 判决 + 打断状态机（传统做法要显式维护"用户插话 -> 取消播放队列 -> 重置上下文"，这本身是经典 bug 源）。原文特别强调模型对家庭与诊室常见噪声、带口音英语做了设计，这两点是电话场景的可用性硬指标。

代价藏在可观测性里：级联链路每步都留下人类可读的文本中间态，端到端模型只暴露音频流与工具调用事件——选 speech-to-speech 就等于连调试与评测的方法论一起换掉。可对照 [级联架构的打断检测](https://github.com/QianJinGuo/wiki-public/blob/main/entities/livekit-agents-voice-ai-streaming-cascade-interruption-detection.md) 与 [实时语音架构](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/openai-realtime-voice-architecture.md)。

### AgentCore Runtime 把"会话隔离"从代码问题变成基础设施问题

一通电话在服务端不是一次请求，而是一段有状态长生命周期：一条长连 WebSocket、一份会话内存、若干进行中的工具调用与尚未落库的中间结果。自建 harness 就得自己解决会话到进程/容器的亲和路由、长连超时回收、并发上限、以及"某个会话崩了不拖垮邻居"的故障域切分——全与业务无关，却极易出事。sample 的分工很干净：`BidiAgent` 只管容器内的对话逻辑与工具编排，AgentCore Runtime 管容器托管、会话级隔离、自动扩缩与带 IAM 认证的 WebSocket 端点。

对呼叫中心这类负载（白天尖峰、夜间近乎空闲），把运行时能力外包给托管层比自研划算。需要单独记账的只有冷启动：语音场景里"接起后的第一声"停顿可被用户直接感知，冷启动预算要和前端提示音策略一起设计。可与 [Lambda MicroVM 与 AgentCore 对比](https://github.com/QianJinGuo/wiki-public/blob/main/entities/lambda-microvms-vs-bedrock-agentcore-ai-agent-comparison.md) 交叉阅读。

### 工具循环的可靠性由 schema 与描述驱动，不由 prompt 里的祈使句驱动

7 个工具都是 `@tool` 装饰的普通 Python 函数，模型从签名与 docstring 得到结构化 schema，再据语义决定何时调用。由此得到常被低估的结论：**docstring 实际是写给模型的 API 契约**——把"什么状态下必须调用、参数从哪来、失败如何措辞"写清楚，比在 system prompt 里反复叮嘱更稳，因为 schema 随工具常驻上下文，而 prompt 规则会被长对话稀释。

硬约束放在工具内部，形成"模型管意图、后端管不变量"的分工：认证工具限三次尝试，取消工具只接受 Scheduled / Confirmed / Rescheduled 三态，确认工具有幂等检查，预约工具用 DynamoDB 条件写入原子占位防并发双预约。即便模型路由错了，错误也只表现为"工具失败 -> Agent 换措辞重试"，而不是写坏数据。

`find_available_slots` 只回最多三个候选时段，这是**语音专属的输出预算**：同样数据在文本界面列十条无伤大雅，在语音里患者记不住，还拉长通话与计费。工具输出面的大小本身就是需按模态调优的参数，可延伸 [工具使用模式](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/tool-use-patterns-ai-agents.md)。

### 四阶段流程是一个带失败终止的状态机，而不是顺序脚本

认证 -> 预约管理 -> 健康信息采集 -> 升级，每阶段都有可判定的后置条件：已验证的患者记录、已知的预约对象、已采集的字段集合。原文把阶段规则写进 system prompt 而非硬编码，好处是可改，代价是阶段转移的正确性只能靠评测与工具侧兜底保证。

两个细节值得抄。其一是**复述确认**：Agent 查库前先把听到的姓名与 SSN 后四位念回去请患者确认，用人机共用的一次纠错回路对冲 ASR 在高风险字段上的错误，比提升模型精度便宜得多。其二是**失败即转向而非继续尝试**：认证三次失败直接升级人工，不让模型在同一坑里循环——身份验证流程里 fail-closed 是唯一可接受的默认值。fail-fast 门控的真正价值是阻断错误传播：若认证未过就进入排期，被污染的不只是预约字段，还有写进病历备注的健康信息，而医疗场景的错误数据会进入临床判断链路。升级出口设计成任意状态可跳转（6 位参考号 + SNS 通知 + 24 小时回呼），本质是把无法自动化的部分显式交还人力。

### 从参考实现到生产：合规、可观测性、成本三个缺口

原文明确自身只是演示：处理 PHI 需 HIPAA 合规评审、与 AWS 签署 BAA，以及配套的安全与临床评审。语音还多一层——音频本身具备可识别性，"音频即 PHI"，音频留存、转录留存与用户告知策略需独立定义，不能沿用文本系统的默认值。端到端音频模型也没有可读中间文本，需把工具调用序列、阶段转移、音频往返时延（首字节/尾字节）做成结构化 trace，否则线上问题只能靠录音回听；非确定性对话的评测应双轨——轨迹正确性（是否走对阶段、是否在正确时点调用正确工具）与结果正确性（落库结果是否符合业务预期），而非逐句比对措辞。

成本结构同样变了：计费单位从 token 数变成并发会话分钟数，长连会话空闲也在消耗资源。原文在 clean-up 一节专门提醒 `cdk destroy` 可能残留 CloudWatch 日志组——同一类"长生命周期资源"的账也要算进语音链路。

## 实践启示

1. **先画延迟预算再选架构。** 拆出"用户说完 -> Agent 出声"的每一跳耗时。若副语言信息对业务判断有实际影响（医疗安抚、催收、情绪处理），端到端 speech-to-speech 是功能需求而非性能优化；若只需文本语义，级联链路的可观测性与成本优势更明显。
2. **把不变量下沉到工具后端，把意图判断留给模型。** 尝试次数上限、状态机白名单、幂等检查、条件写入防并发都不要指望 prompt 保证。设计原则：模型给出错误意图时，系统应"拒绝并回到对话"，而不是"写坏数据"。
3. **把每个 `@tool` 的 docstring 当 API 契约写。** 写明适用状态、必填参数来源、失败返回语义；工具描述随 schema 常驻上下文，比散落在 prompt 里的规则更抗长对话稀释。工具数量增长时要复查选择准确率。
4. **为语音模态单独设定输出预算。** 列表类工具限制返回条数（时段候选只给 2-3 个），控制单次回复的信息密度；凡需用户记忆或复述的内容，都按"听一遍能否记住"裁剪——这同时是体验优化和省钱手段。
5. **身份验证一律"复述确认 + 尝试上限 + 失败即转人工"。** 用一次确认轮次对冲 ASR 在姓名、数字、字母上的高错误率；硬性尝试次数写在工具内部而非 prompt 里；失败路径必须通向人工。
6. **上线前补齐三件工程件：PHI/合规边界、voice 专用 trace、按并发分钟的成本模型。** 评测按"轨迹 + 结果"双轨设计并预留录音回听与人工抽检；对长连会话显式设定空闲超时与资源回收，避免测试与压测流量变成持续性账单。

---
## 关联
- 相关概念: [Harness Engineering](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/harness-engineering-framework.md)
- 相关: Agent 架构

---

