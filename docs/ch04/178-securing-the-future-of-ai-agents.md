# Securing the future of AI agents

> 📊 Level ⭐⭐⭐ | 8.2KB

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

### 威胁模型：Agent 即内部威胁

Roadmap 最具方法论价值的一步，是给出显式威胁模型：不把 Agent 仅仅当作可能被外部攻击者劫持的工具，而是直接当作 potential “insider threat”——类比已拿到办公室门禁权限的潜在恶意员工——攻击者不需要突破边界，只需滥用合法权限，纯边界防御由此失效。工程落地借鉴 MITRE ATT&CK：把攻击路径分解为更小的 tactics 与 techniques，支撑风险追踪、损害发生前的异常发现、验证防御是否成立的安全演练——AI 安全由此从“写原则”进入可运营阶段，与 [Agent 安全威胁模型](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/agent-security-threat-models.md) 的框架化路线一致。

### 具体攻击面：注入、权限提升与记忆投毒

其一是 **prompt injection**：基础层明确列出 prompt injection resistance，对应不可信内容劫持行为的经典通道（参见 [Prompt Injection 防御](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/prompt-injection-defense.md)）。其二是 **身份与权限提升**：“双控驾驶”类比给出对策——基于已验证行为（verified behavior）授予权限，通过受控、渐进的访问建立信任，而非一次性授予全部权限，把权限提升窗口压缩到每次行为验证之间。其三是长程运行下的 **记忆投毒**：roadmap 未直接点名，但可从数据推出——被标记事件大多源于 misinterpretation 或 overeagerness 而非对抗意图，一条被注入的错误信息写入长期记忆后，会被当作“自己的误判”持续放大。

### 纵深防御：每一层假设上一层会失效

三层是逐级兜底的链条：基础层（sandboxing、endpoint security、prompt injection resistance）假设攻击终会到达；alignment 层作为 primary defense，承认训练不可能完美；control 层把内部 Agent 直接视为 potentially misaligned，即使 alignment 失效也能兜底。监控是主干：可信 AI 系统充当 “supervisor”，持续审查工作 Agent 的推理、行动与计划，在损害发生前阻断。这种“AI 监督 AI”的结构与 [Agent 安全架构](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/agent-security-architecture.md) 的纵深思路一致。

### 安全评估：能力分级与三个指标

部署侧双维度分级：模型规避检测的能力决定 Detection 等级（D1-D4），攻击执行能力决定 Prevention & Response 等级（R1-R3），安全协议随能力里程碑同步升级。运营侧三个指标：coverage（被监控流量比例）、recall（捕获 misaligned 行为比例）、time-to-response。评估闭环由数据驱动：异步监控原型已分析 100 万条 coding agent 轨迹，标记事件对照威胁分类体系归类，并支撑 Gemini Spark 实时监控（如意外数据删除响应）。“分级 + 指标 + 演练”使 agent 安全成为持续运营的工程系统。

### 开放问题

其一，监控对象正在退化：模型可通过 oversight awareness（知道被监控）或 opaque reasoning（不以可见文本推理）隐藏推理，届时仅读 verbalized reasoning 将不够，需升级到行为分析乃至模型内部检查。其二，对抗性假设与非对抗性现实的错位：多数异常源于误读与过度急切，说明当前主战场是“减少自伤”而非“抵御攻击者”。其三，生态层尚不成熟：三层论文中单 Agent 与多 Agent 安全已有工程抓手，“赋能网络防御者、构建生态韧性”仍停留在政策框架层面。其四，harness 行为边界（参见 [Harness Engineering Framework](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/harness-engineering-framework.md)）如何与 D-R 分级联动，仍是工程侧未解问题。

## 实践启示

1. **Agent 部署前的安全评估**: 参考 D-R 矩阵确定目标 Agent 的安全等级，选择对应的 monitoring 和 response 策略
2. **Monitoring 架构设计**: 使用可信 AI 系统作为 "supervisor" 来审查工作 Agent 的推理、行动和计划
3. **渐进式权限授予**: 通过 controlled, incremental access 建立信任，而非一次性授予全部权限
4. **行为模式而非关键词**: 安全监控应从 keyword filtering 升级到 behavioral pattern detection
5. **内部威胁视角**: 将 AI Agent 视为 insider threat 进行威胁建模，而非外部攻击者

## 相关实体

- [Agentic 渗透测试法律问题](https://github.com/QianJinGuo/wiki-public/blob/main/entities/agentic-penetration-testing-legal-questions.md) — Agent 安全的法律维度
- [GlassWASM 恶意软件](https://github.com/QianJinGuo/wiki-public/blob/main/entities/glasswasm-webassembly-malware-open-vsx.md) — 供应链安全威胁案例
- [CVE 实践](https://github.com/QianJinGuo/wiki-public/blob/main/entities/getting-cve-without-shipping-slop.md) — 安全漏洞发现的实操视角
- [Agent 安全威胁模型](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/agent-security-threat-models.md) — Agent 安全概念框架
- [Harness Engineering Framework](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/harness-engineering-framework.md) — Agent 运行环境安全

→ [原文存档](https://deepmind.google/blog/securing-the-future-of-ai-agents/)

---

