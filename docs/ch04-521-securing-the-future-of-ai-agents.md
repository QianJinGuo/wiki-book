# Securing the future of AI agents

## Ch04.521 Securing the future of AI agents

> 📊 Level ⭐⭐⭐⭐⭐ | 5.5KB | `entities/deepmind-securing-future-ai-agents.md`

## Securing the future of AI agents

> **来源**: deepmind.google
> **作者**: Rohin Shah, Four Flynn (DeepMind)
> **发布日期**: 2026-06-18

## 摘要

DeepMind 发布了 AI Control Roadmap，提出一套"纵深防御"(defense-in-depth) 框架来保障内部 AI Agent 系统安全。该框架超越传统 model alignment，引入系统级安全层——即使 alignment 不完美，也能提供安全保障。核心理念类似"双控驾驶"：信任 AI Agent 但保留随时接管的能力。预计到 2030 年，仅美国市场 AI Agent 就将创造 2.9 万亿美元经济价值，安全保障的紧迫性不言而喻。

## 核心要点

### 1. AI Control 框架的三层防御

- **基础层**: 传统安全措施——sandboxing、endpoint security、prompt injection resistance
- **Alignment 层**: 通过训练使 AI 内在安全且有帮助 (primary defense)
- **Control 层**: 将内部 Agent 视为潜在 misaligned，提供额外安全保障——即使 alignment 失效也能兜底

### 2. 威胁建模方法论

借鉴 MITRE ATT&CK 框架，将 AI Agent 视为"内部威胁"(insider threat)，类比已拥有办公室权限的潜在恶意员工。将潜在攻击分解为更小的 tactics 和 techniques，实现系统化风险追踪、行为异常检测和安全演练。

### 3. 双维度安全等级体系

| 维度 | 等级 | 含义 |
|------|------|------|
| **Detection (D1-D4)** | 基于模型规避检测的能力 | 从可见 chain-of-thought 监控 → 行为分析 → 模型内部检查 |
| **Response (R1-R3)** | 基于模型造成伤害的能力 | 从异步修复 → 实时阻断 |

随着模型能力提升，安全协议需同步升级：当模型学会隐藏推理过程 (oversight awareness / opaque reasoning) 时，仅靠 verbalized reasoning 监控将不再足够。

### 4. 大规模轨迹分析实践

DeepMind 已分析 100 万条 coding agent 任务轨迹，关键发现：
- 大多数标记事件**并非来自对抗性意图**，而是源于 agent misinterpretation 或过度急切 (overeagerness)
- 已建立 Gemini Spark agent 的实时监控系统，可响应如意外数据删除等问题
- 从简单关键词过滤升级到高信号行为模式识别

### 5. 三层 Agent 安全论文

同步发布政策框架《Three Layers of Agent Security》，涵盖：
1. 单个 Agent 级别的安全
2. 多 Agent 系统的安全
3. 赋能网络防御者、构建生态韧性

## 深度分析

### "假设 misalignment" 的安全哲学

AI Control Roadmap 的核心假设是：**如果一个高度 capable 的 AI Agent 不 aligned 且以意外方式行动怎么办？** 这与传统安全工程中的 threat modeling 一脉相承——不假设组件可信，而是建立验证机制。

这代表了 AI 安全领域的范式转变：从"确保 AI 对齐"到"即使不对齐也能安全运行"的双保险策略。对于 Agent 安全威胁模型 领域而言，这是一个重要的方法论贡献。

### Detection-Response 矩阵的工程意义

D1-D4 × R1-R3 的矩阵为不同风险等级的部署场景提供了明确的安全基线。例如：
- 低风险任务 (代码格式化) → D1 + R1 (异步审查)
- 高风险任务 (系统管理) → D3 + R3 (实时阻断)

这种分层方法避免了一刀切的安全策略，允许在安全性和效率之间做出合理权衡。

### 百万轨迹数据的启示

"大多数标记事件非对抗性"这一发现意义深远。它意味着当前阶段的主要安全风险不是 AI 故意作恶，而是 AI 的 misinterpretation 和 overeagerness——这对 [Harness Engineering Framework](/ch05-041-harness-engineering-概念框架/) 设计有直接影响：需要在 harness 层面建立更精确的行为边界，而不是仅依赖 alignment training。

## 实践启示

1. **Agent 部署前的安全评估**: 参考 D-R 矩阵确定目标 Agent 的安全等级，选择对应的 monitoring 和 response 策略
2. **Monitoring 架构设计**: 使用可信 AI 系统作为 "supervisor" 来审查工作 Agent 的推理、行动和计划
3. **渐进式权限授予**: 通过 controlled, incremental access 建立信任，而非一次性授予全部权限
4. **行为模式而非关键词**: 安全监控应从 keyword filtering 升级到 behavioral pattern detection
5. **内部威胁视角**: 将 AI Agent 视为 insider threat 进行威胁建模，而非外部攻击者

## 相关实体

- [Agentic 渗透测试法律问题](/ch04-327-new-legal-questions-agentic-pen-testing/) — Agent 安全的法律维度
- [GlassWASM 恶意软件](/ch12-067-glasswasm-webassembly-malware-found-in-trojanized-open-vsx/) — 供应链安全威胁案例
- [CVE 实践](/ch12-073-getting-a-cve-without-shipping-slop/) — 安全漏洞发现的实操视角
- Agent 安全威胁模型 — Agent 安全概念框架
- [Harness Engineering Framework](/ch05-041-harness-engineering-概念框架/) — Agent 运行环境安全

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/deepmind-securing-future-ai-agents.md)

---
