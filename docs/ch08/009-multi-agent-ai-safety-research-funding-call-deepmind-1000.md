# Multi-Agent AI Safety Research Funding Call（DeepMind 主导，1000 万美元，四大方向）

> 📊 Level ⭐⭐⭐ | 9.9KB

> 原文存档：[原文存档](https://deepmind.google/blog/investing-in-multi-agent-ai-safety-research/)

## 概述

Google DeepMind 联合 **Schmidt Sciences、Cooperative AI Foundation、ARIA**（英国先进研究与发明局）并获得 **Google.org** 支持，于 2026-06-11 发布**最多 1000 万美元**的多 Agent AI 安全研究资助公告。这是首个由主要 AI 实验室主导、联合多家长期 AI 安全公益机构**共同出资**的多 Agent 安全研究计划。申请截止 **2026-08-08**，获奖者 2026 秋季公布。

核心命题：随着 AI 技术规模化，正在进入"数百万由不同组织构建的 AI Agent 在数字环境中交互、通信、谈判、交易"的新时代。这种跨组织、跨网络的 Agent 交互产生"涌现"集体行为（emergent collective behaviors），目前缺乏预测、测量和监控工具，构成传统单模型安全评估无法覆盖的新型风险。

## 四大优先研究方向

| 方向 | 核心问题 | 典型研究对象 |
|------|---------|-------------|
| **Sandboxes and testbeds** | 如何构建可复现的真实环境来评估多 Agent 安全 | 虚拟市场、模拟生态系统、跨组织工作流 |
| **Science of agent networks** | 交互 Agent 种群的安全相关属性 | 集体能力如何涌现/扩展、网络如何失败/失稳、如何检测危险的种群级属性 |
| **Strengthening agent infrastructure** | 强化跨平台 Agent 安全交互协议 | 身份、声誉、承诺（commitment）协议的抗压测试 |
| **Oversight and control** | 监控已部署的 Agent 种群 | 种群级集体危害的检测与缓解方法 |

## 关键贡献

1. **首次主要 AI 实验室主导 + 公益联合资助模式**：DeepMind 提供资金，Schmidt Sciences、ARIA、Cooperative AI Foundation 提供研究框架，Google.org 提供运营支持，**单一资金方无法独立驱动**。该模式可被复用到未来多 Agent 安全研究。

2. **从"单模型安全"到"种群级安全"的研究范式转变**：现有 AI 安全评估**主要在隔离状态下分析单个模型**，新框架则要求理解**交互产生的涌现行为**。这意味着 safety evaluation 范式从 per-model 转向 population-level。

3. **四大方向形成完整闭环**：Sandboxes（实验环境）→ Science（理论）→ Infrastructure（协议层）→ Oversight（部署层）—— 从基础研究到实战部署形成完整覆盖，每一层都是研究机会。

## 与 DeepMind 2025 工作的延续

资助公告明确将本计划建立在 DeepMind 2025 年的两项基础工作上：

- **2025 年多 Agent 交互理解框架**（2025 foundational framework for understanding these interactions）
- **AI Agent Traps**（对抗环境下 Agent 面临的脆弱性研究）

资助计划是这两项工作的规模化扩展，从实验室单点研究转向"全球独立研究者网络"协同推进。

## 申请要点

- **金额**：up to $10M total
- **截止**：2026-08-08
- **公布**：Autumn 2026
- **资格**：学术界 + 独立研究者（全球范围）
- **优先方向**：上述四大方向
- **背景契合度**：
  - Schmidt Sciences: Science of Trustworthy AI + AI Agents 计划
  - ARIA: Scaling Trust 计划（关注 cyber-physical multi-agent coordination）
  - Cooperative AI Foundation: cooperative AI 基础研究

## 深度分析

**1. 为什么"种群级"风险无法用现有评测工具覆盖**：当前绝大多数 safety evaluation 的基本单元是"单个模型在隔离状态下的表现"，而多 Agent 交互的风险恰恰出在"交互"本身——独立系统的组合可以涌现出任何单模型评估都无法预测的集体行为，包括突然的集体能力跃迁、网络级失稳乃至不可预期的经济活动激增（参见 [Multi-Agent Systems](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/multi-agent-systems.md)）。这意味着风险的来源从"模型内部的失败"转移到"系统之间的交互模式"，评测对象必须从 model 转向 population。

**2. 资助结构本身是一个信号**：公告反复强调 "No single lab can solve multi-agent safety alone"，并选择联合 Schmidt Sciences、ARIA、Cooperative AI Foundation 等外部机构共同出资，同时面向全球学术界与独立研究者开放。这不是普通的公益资助——它反映 DeepMind 判断多 Agent 安全（[AI Safety](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/ai-safety.md)）的复杂度已超出任何单一实验室的内部研究议程，需要通过外部研究网络来分散探索四大方向。

**3. 四大方向构成"环境—理论—协议—监督"的分层研究栈**：Sandboxes/testbeds 解决"在哪里实验"（[Agent Sandbox](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/agent-sandbox.md)：可复现的真实环境），science of agent networks 解决"如何理解"（种群属性的科学理论），agent infrastructure 解决"如何安全交互"（身份/声誉/承诺协议，见 [Agent 身份可移植性](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/agent-identity-portability.md)），oversight and control 解决"部署后怎么办"（种群级危害的监控与缓解）。这个分层结构暗示 DeepMind 认为多 Agent 安全不是单点问题，而是需要从基础设施到治理的整栈投入。

**4. 与 2025 年工作的关系：从内部框架到外部网络**：2025 年的多 Agent 交互理解框架和 AI Agent Traps 研究是 DeepMind 内部的理论奠基（延续脉络见 [Securing the Future of AI Agents](https://github.com/QianJinGuo/wiki-public/blob/main/entities/deepmind-securing-future-ai-agents.md)），本次 $10M 资助则把验证与扩展交给外部研究者——相当于把"我们提出了框架"推进到"我们请全球社区来检验和填充这个框架"。理论先行、资助跟进的节奏也说明多 Agent 安全已从概念讨论进入需要大规模实证的阶段。

**5. "从第一天开始建设安全"的时机论**：公告明确指出 Agent 生态系统尚在形成早期——数百万跨组织 Agent 即将通信、谈判、交易，这既是风险也是机会：现在介入可以为整个 AI 生态预埋安全与稳定性基线，而不必等到大规模部署后再补救。这与事后对齐思路形成对比：多 Agent 安全更强调在协议和基础设施层"预埋"安全属性，与 [Anthropic 多智能体冲突实验](https://github.com/QianJinGuo/wiki-public/blob/main/entities/anthropic-multi-agent-conflict-frontier-red-team-2026-08.md)揭示的"安全是整体属性而非个体属性"判断相互印证。

## 实践启示

1. **申请策略**：截止 2026-08-08，2026 秋季公布获奖名单。四方向中 Sandboxes/testbeds 与 agent infrastructure（身份/声誉/承诺协议）的工程属性最强，适合有 agent 系统工程背景的团队；science of agent networks 更偏理论建模。申请前应对照 Schmidt Sciences（Science of Trustworthy AI / AI Agents）、ARIA（Scaling Trust）、Cooperative AI Foundation 各自的计划定位选择切入点。

2. **工程团队的准备动作**：即使不申请资助，多 Agent 系统的开发者现在就应该把身份认证、声誉机制与承诺协议纳入架构设计——公告把这三类协议列为需要 stress-test 的核心基础设施，说明它们有望成为未来跨平台 Agent 交互的事实标准。

3. **评测视角升级**：做 agent 评测时应补充"种群级"测试项——不只测单个 agent 的行为，还要测多实例交互下的集体行为（能力涌现、失稳、非预期经济活动）。Sandboxes/testbeds 方向本身就是一个可切入的产品与开源机会。

4. **研究选题信号**：$10M 资助 + 四大优先方向等于未来 1-2 年多 Agent 安全的公开研究议程；跟踪获奖者名单（2026 秋公布）可以提前判断哪些子问题被主要实验室认为最有价值。

## 相关主题

- [DiffusionGemma](https://github.com/QianJinGuo/wiki-public/blob/main/entities/diffusiongemma-4x-faster-text-generation-google-2026-06.md) — 同为 Google DeepMind 2026-06 公告
- Multi-Agent System Safety — 概念层（待创建）

## 一句话定位

**"单模型安全 → 种群级安全"**的研究范式转变 + 首个主要 AI 实验室联合公益机构的 $10M 多 Agent 安全研究资助计划

---
## 关联
- 相关概念: [Harness Engineering](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/harness-engineering-framework.md)

---

