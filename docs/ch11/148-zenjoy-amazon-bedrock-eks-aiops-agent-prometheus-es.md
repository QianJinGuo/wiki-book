# Zenjoy 基于 Amazon Bedrock 和 EKS 构建 AIOps Agent：打通 Prometheus、ES 与夜莺的智能化告警实战

## Ch11.148 Zenjoy 基于 Amazon Bedrock 和 EKS 构建 AIOps Agent：打通 Prometheus、ES 与夜莺的智能化告警实战

> 📊 Level ⭐⭐ | 7.7KB | `entities/zenjoy-aiops-agent-bedrock-eks-prometheus.md`

## 核心要点
- 基于 Amazon Bedrock + EKS 构建 AIOps Agent，整合 Prometheus、ElasticSearch、夜莺监控数据
- 多窗口分析算法：Z-Score、IQR、线性回归
- 解决企业级 AIOps 落地的工程化挑战

## 深度分析
### 1. 算法与 LLM 的职责解耦架构
该方案最核心的设计哲学是**确定性计算与不确定性推理的分离**。数学算法（Z-Score、IQR、线性回归）负责全量数据的确定性分析，LLM 仅在算法确认异常后才介入生成报告。这种架构在工程上有两个关键价值：其一，避免了 LLM 直接处理海量时序数据带来的 Token 成本失控和幻觉风险；其二，算法部分的可解释性和可靠性远高于纯 LLM 方案，符合运维场景对确定性输出的要求。

### 2. 多窗口分层分析机制的技术意图
四个时间窗口（1h / 24h / 48h / 7d）并非简单的时间划分，而是对应了不同的异常检测目标：

- **1h 窗口**专注于实时尖峰，通过 Z-Score 捕捉突发离群值，同时保留静态阈值作为最后兜底
- **24h 和 48h 窗口**形成趋势发现的两级确认机制，只有两者趋势一致时才判定为异常趋势，有效过滤业务自然波动导致的误报
- **7d 窗口**作为全局基线，通过历史同期 IQR 建立业务正常波动范围，实现告警的动态基线化

### 3. 周期检测的工程化演进
从 ACF+FFT 到 STL 再到 7 天同时段 IQR，团队经历了一次有代表性的算法降级。这反映了 AIOps 落地中一个常见陷阱：理论上更复杂的算法未必带来更好的工程效果。7 天同时段 IQR 的核心思想是"用历史同期数据建立正常范围"而非"显式建模周期"，这种思路放弃了理论优雅性但换取了极高的工程稳定性和可维护性。

### 4. Token 治理与 LLM 幻觉防护
该方案通过双重机制控制 LLM 幻觉：数据层面，将原始时序数据（通常 50KB+）压缩为结构化摘要（不到 1KB）；Prompt 层面，在 System Prompt 中强制要求"必须给出具体 Pod 名、具体指标值与判断依据，不允许使用模糊表述"。两者的结合使得 Token 消耗降低 90% 以上，同时保证了 LLM 输出的准确性。

### 5. 与 `智能成本分析与告警系统` 的架构共性
两个方案都采用了 Bedrock AgentCore 作为 Agent 托管 runtime，说明 AgentCore 在运维自动化场景中的适用性已得到验证。关键共性包括：按需触发（非持续运行）的调度模式、确定性算法 Tool 与 LLM 的配合、以及 Serverless 化带来的成本优化。差异点在于 Zenjoy 方案侧重多源监控数据整合和周期性趋势分析，而智能成本方案侧重预算异常检测。

## 实践启示
### 工程化要点
**渐进式演进优于一步到位**：方案建议按三阶段引入 AIOps 能力——先建立基础监控池（EKS + Prometheus + 夜莺），再引入算法分析漏斗（IQR/Z-Score/线性回归），最后按需引入 LLM 进行报告生成。这种策略降低了初期复杂度，让团队能够在每个阶段验证效果后再决定是否深入。
**动态基线是降低告警疲劳的关键**：传统的静态阈值在业务具有周期性特征时天然存在误报和漏报并存的问题。7 天历史同期 IQR 提供了业务自适应基线，将"是否符合业务周期性规律"作为告警判定的前置条件，这是从被动响应转向主动防御的核心转变。
**夜莺作为统一告警入口的价值**：将 AIOps Agent、Prometheus 原生告警、ES 日志告警统一汇聚到夜莺，实现了告警的统一视图和多渠道分发。这一设计避免了多套告警系统并存带来的告警碎片化和运维人员的多系统切换成本。

### 技术选型建议
对于面临类似微服务监控挑战的团队，建议优先评估业务的周期性特征。如果业务存在明显的高低峰规律，7 天同期 IQR 基线方案值得优先考虑，其工程复杂度和维护成本远低于显式周期建模。如果业务波动无明显规律，则应将重点放在 24h/48h 趋势确认机制上，通过时间维度的平滑过滤降低误报。

### 架构演进路径
AgentCore Runtime 的使用表明，Serverless Agent 托管正在成为 AI 原生运维工具的主流部署形态。相比自建 Agent 基础设施，托管方案在资源效率、会话隔离和弹性扩缩容方面具有优势。对于希望在运维场景快速验证 AIOps 价值的团队，基于 AgentCore 的部署模式是一个低风险的技术选型。
→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/zenjoy-aiops-agent-bedrock-eks-prometheus.md)

## 相关实体
- [Introducing OS Level Actions in Amazon Bedrock AgentCore Browser](../ch04/377-introducing-os-level-actions-in-amazon-bedrock-agentcore-bro.html)
- [Doris MCP on AgentCore Runtime: VPC原生MCP部署模式](ch11/246-aws-bedrock-agentcore.html)
- [自己的工具自己控：MCP Server、Amazon Bedrock AgentCore、Quick Suite集成指南](../ch04/530-amazon-bedrock-agentcore.html)
- [OpenClaw多租户迁移: Phase 2&3部署](ch11/224-openclaw.html)
- [AgentCore Runtime部署Apache Doris MCP Server](ch11/164-apache-doris-mcp-server-quick-suite-ai.html)
- [AgentCore Identity: 3-legged OAuth+Session Binding的安全架构](ch11/246-aws-bedrock-agentcore.html)
- [OpenClaw多租户迁移: 背景与架构概览](ch11/224-openclaw.html)
- [别让你的 Amazon Bedrock 模型为他人打工——API 调用安全防护指南](../ch12/034-amazon-bedrock-api.html)
- [OpenClaw多租户迁移: Phase 1 基础设施部署](ch11/224-openclaw.html)
- [AgentCore Browser OS级操作：Action-Screenshot-Reaction闭环](ch11/246-aws-bedrock-agentcore.html)
- [Amazon Bedrock模型推理的Serverless异步架构](ch11/156-amazon-bedrock.html)
- [基于 AWS 示例项目，展示如何将 OpenClaw 迁移为基于 Amazon Bedrock AgentCore 的多租户 Serverless 架构](../ch04/530-amazon-bedrock-agentcore.html)

- [SQS+Lambda异步管道：2000并发0%限流的工程细节](ch11/009-aws-bedrock.html)
- [基于 Prowler 与 GenAI 构建金融行业智能合规中枢（Alt）](ch11/054-prowler-genai.html)
- [在 Amazon Bedrock 上为 Claude 应用设计稳健的 Prompt Cache 策略](ch11/058-amazon-bedrock-claude-prompt-cache.html)
- [build-custom-code-based-evaluators-in-amazon-bedrock-agentco](ch11/156-amazon-bedrock.html)

---

