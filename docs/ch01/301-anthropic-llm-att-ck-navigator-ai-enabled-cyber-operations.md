# Anthropic LLM ATT&CK Navigator: AI-Enabled Cyber Operations

## Ch01.301 Anthropic LLM ATT&CK Navigator: AI-Enabled Cyber Operations

> 📊 Level ⭐⭐ | 14.1KB | `entities/anthropic-llm-attck-navigator-cyber-operations.md`

# Anthropic LLM ATT&CK Navigator: AI-Enabled Cyber Operations

> Source: [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/anthropic-llm-attck-navigator-cyber-operations.md)
> Authors: Kyla Guru, Alex Moix, Jacob Klein (Anthropic Red Team, 2026-06-03)

## 概述

Anthropic 红队 2026-06-03 发布的**首份** LLM 威胁行为 ATT&CK 映射报告。研究将 2025-03 至 2026-03 期间因违反 Usage Policy 被封禁的 **832 个恶意账户**所产生的 13,873 次 AI-协助攻击行为，逐一映射到 MITRE ATT&CK V18 框架的 14 个战术 + 482 个子技术上。配套发布了交互式 LLM ATT&CK Navigator 工具，并提出 **ARiES (AI Risk Enablement Score)** 风险评分方法论。

数据已纳入 Verizon 2026 DBIR 报告。

## ARiES 风险评分方法

ARiES 采**加性评分**（0-100），三个维度：

| 维度 | 范围 | 评估内容 |
|------|------|----------|
| **Threat** | 0–35 | 意图清晰度、技术复杂度（Claude 评估提示词与工具用法）、威胁情报信号、规避检测的策略 |
| **Vulnerability** | 0–35 | 模型使能攻击的能力、所用接口的风险（API/agentic 编码平台如 Claude Code 得分最高，因可自动化操作）|
| **Impact** | 0–30 | 实际 / 潜在后果（安全分类器 + 调查员评估）|

**关键设计决策 — 加性 vs 乘法**：传统 cyber 风险公式 `Risk = Threat × Vulnerability × Impact` 是**乘法性**（任一为零则总分为零），反映"攻击是否成功"。ARiES 采**加性**则允许"部分攻击使能模式"仍可见 — 例如"高能力 + 高后果但意图不清"或"明确意图 + 能力但无受害者证据"在乘法模型下会归零，但这些恰恰是 defender 应识别的早期信号。

**重要区分**：ARiES **不预测攻击是否成功**，而是衡量 "AI 涉及的 misuse 案例的令人担忧程度"。

## 核心发现

### 1. 中-高风险行为者占比半年翻 1.7 倍

- 第一期：33% 行为者为 medium 或更高风险
- 第二期：56%（**1.7× 增长，不到一年**）
- 增长集中在**高危害子技术**：lateral movement、credential dumping、web shells（每行为者风险权重最高的子集），而非"build-and-obfuscate"商品化工作

### 2. 技术复杂度不再是主要区分指标

历史上"贯穿整个 killchain"只对最高技术能力者可行。研究发现 **AI 已让低技术能力者跨越整个攻击链**。**接入模型的平台**（API vs Claude Code）也**不**区分风险等级 — 真正区分高风险行为者的是**他们让模型做什么**。

### 3. Agentic Scaffolding 是新的风险乘数

2025-11 Anthropic 瓦解的 [cyber espionage campaign](https://www.anthropic.com/news/disrupting-AI-espionage) 中：
- 风险评分 **100/100**（满）
- 但所用技术**数量**与中风险行为者相当
- **区别不在技术数量**，而是**用 AI agent 编排这些技术的方式**

报告核心论断："随着 AI-使能 cyber 技术在攻击者群体中普及，**单凭行为者向模型请求的内容将越来越难区分其风险等级**。差异化指标将变为 **scaffolding** — 围绕模型构建的代码、架构、工具，让模型能自主链式组合攻击阶段。"

### 4. ATT&CK 框架覆盖缺口

报告**显式承认** MITRE ATT&CK 框架**尚未覆盖**以下关键自主行为：
- Autonomous killchain orchestration
- Real-time pivot decisions
- AI-directed execution with no human intervention

这些行为**目前无 ATT&CK ID**。"现代威胁情报依赖的分类法需要扩展以捕获这些行为。"

## 高频被滥用的技术

最常见的 ATT&CK 技术族：**T1587 (Develop Capabilities)** — 832 行为者中 **574 个（69%）** 使用，其中 560 个为 T1587.001 (Malware Development)。具体滥用模式包括：
- 自定义脚本生成与迭代
- DLL 注入代码（带详细实现指导）
- 浏览器指纹规避
- 自动化账户管理

## 配套产品变更

基于本研究，Anthropic 扩展了：
- Claude 内置 misuse 分类器（覆盖本研究识别的最高风险行为模式）
- [Next-Generation Constitutional Classifiers](https://www.anthropic.com/research/next-generation-constitutional-classifiers) 探测能力，覆盖本研究揭示的高风险行为指标

## 与 N-days 研究的互补

本文与 [N-days Frontier Agent 研究](../ch04/256-anthropic-n-days-frontier-agent-vulnerability-research.html) 构成 Anthropic 2026-06 的**双联报告**：

| 维度 | N-days 研究 | ATT&CK Navigator |
|------|-------------|------------------|
| 视角 | 前沿能力（Mythos Preview 可做什么）| 当下滥用现状（公开模型被如何用）|
| 数据 | 18 + 21 受控实验 | 832 真实账户 13,873 行为 |
| 输出 | 利用链成功矩阵 | ARiES 风险评分 + ATT&CK 映射 |
| 政策建议 | Defender 加速 patch 部署 | Classifier 升级 + ATT&CK 框架扩展 |
| 共同主题 | 模型代际跃迁压缩防御窗口 | Agentic scaffolding 取代技术复杂度作为风险指标 |

## 实践启示

1. **风险评估维度迁移**：从"技术复杂度"迁移到"scaffolding 复杂度 + 编排自主性"
2. **早期信号捕获**：用加性评分（不是乘法）确保 partial-enablement 模式可见
3. **威胁分类法扩展**：现有 ATT&CK 框架需补"自主决策类"行为（killchain 编排、实时 pivot、无人类干预执行）
4. **接入渠道弱化**：API / agentic 编码平台 / Web 界面对最终风险影响接近 — 不能因渠道而轻视
5. **检测靠行为不靠内容**：意图模糊 + 高能力比清晰意图 + 低能力更应被标记（乘法模型会漏掉前者）

## 深度分析

**1. Agentic scaffolding 替代技术复杂度成为核心风险指标**

这是报告最具颠覆性的发现：AI 已让低技术能力者跨越整个攻击链。GTG-1002 案例（100/100 满分）的关键不是技术数量（与中风险行为者相当），而是"用 AI agent 编排这些技术的方式"。这意味着未来的威胁评估框架需要从"行为者会什么"转向"行为者如何组织 AI 来执行"。

**2. ARiES 加性评分 vs 乘法评分的深层含义**

传统 `Risk = Threat × Vulnerability × Impact` 是乘法模型，任一维度为零则总分为零。这反映"攻击是否成功"的视角，但会漏掉 partial-enablement 的早期信号。ARiES 采加性的理由：AI enablement 的信号本身就值得捕获 — 即使最终攻击未成功，高能力 + 高后果但意图不清的模式同样危险。这意味着防御方应投资于"异常 AI 使用模式"检测，而非仅在攻击成功后响应。

**3. ATT&CK 框架的结构性缺口：缺少"编排行为"维度**

报告明确指出 MITRE ATT&CK V18 尚未覆盖三类关键自主行为：autonomous killchain orchestration、real-time pivot decisions、AI-directed execution with no human intervention。这些行为无 ATT&CK ID，但恰恰是区分最高风险行为者的维度。这不仅是分类法问题，而是意味着现有威胁情报基础设施无法捕获 AI-native 攻击模式。

**4. 接入渠道（API vs Claude Code vs Web）对风险无显著区分**

80% 的恶意账户使用 Claude Code，但接入平台并不区分风险等级 — 中风险和高风险行为者在 API、Claude Code、Web 界面上的分布统计上无显著差异。这揭示：对于威胁评估，接入渠道是一个被高估的维度，真正区分风险的是"让模型做什么"而非"通过什么接口访问模型"。

**5. 中-高风险行为者半年 1.7 倍增长的威胁含义**

从 33% 到 56% 的增长集中在 lateral movement、credential dumping、web shells 等高危害子技术。这意味着 AI 不仅在扩大攻击者数量，还在提高攻击质量。低技术门槛 + 高质量攻击组合将重新定义网络安全的攻防经济。

## Cross-links

-
## 相关实体

- [hackers accessed bwh hotels reservation system for months](../ch05/089-ai.html)
→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/anthropic-llm-attck-navigator-cyber-operations.md)
- → [同 Anthropic 红队研究：前沿模型 N-day 利用能力](../ch04/256-anthropic-n-days-frontier-agent-vulnerability-research.html)
- → [Mythos 营销角度](ch01/944-anthropic.html)
- → [Cloudflare Glasswing 视角 Mythos 安全](../ch12/030-mythos.html)
- → [Arctic Wolf SOC 机器速度运营](https://github.com/QianJinGuo/wiki/blob/main/entities/arctic-wolf-security-operations-machine-speed.md)
- → MITRE ATT&CK 框架（V18，外部参考）

## 元数据

- **研究主体**：Anthropic Red Team + Threat Intelligence
- **发表日期**：2026-06-03
- **数据集规模**：832 账户 / 13,873 观察 / 482 唯一子技术 / 14 个战术全覆盖
- **方法论创新**：ARiES 加性风险评分
- **可重复性**：中（数据集已匿名化以保护 actor；评估方法可复用）
- **配套工具**：[LLM ATT&CK Navigator 交互界面](http://red.anthropic.com/2026/attack-navigator/navigator.html)

## 实践启示

1. **重新设计威胁评估框架**：从"技术数量和复杂度"转向"scaffolding 编排自主性"和"AI 使用模式"——关注行为者如何组织 AI，而非仅看技术栈
2. **部署加性风险评分**：将 ARiES 方法论引入内部检测系统，确保 partial-enablement 模式（高能力 + 高后果但意图不清）不被乘法模型归零
3. **推动 MITRE ATT&CK 扩展**：主动向 MITRE 提交"自主编排行为"的分类提案，参与定义下一代框架以捕获 AI-native 攻击模式
4. **不能因接入渠道而轻视风险**：API / Claude Code / Web 界面对风险评估价值接近，应同等重视所有渠道的异常检测
5. **关注 lateral movement 作为高风险信号**：lateral movement 是最强的高风险行为预测因子（54 个行为者平均风险得分 56.4，高于均值 46.8），一旦检测到此类行为立即升级响应

---

