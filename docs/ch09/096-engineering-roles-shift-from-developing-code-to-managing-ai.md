# Engineering roles shift from developing code to managing AI | CIO Dive

## Ch09.096 Engineering roles shift from developing code to managing AI | CIO Dive

> 📊 Level ⭐⭐ | 7.5KB | `entities/820297.md`

# Engineering roles shift from developing code to managing AI | CIO Dive

## 相关实体

- [scaling archunit with nebula archrules](../ch11/278-scaling-archunit-with-nebula-archrules.html)
→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/820297.md)

- [MOC](https://github.com/QianJinGuo/wiki/blob/main/moc/observability-monitoring.md)
## 摘要

CIO Dive 2026-05-14 报道 Harness 公司发布的《State of Engineering Excellence 2026》调研结果：在 700 名企业开发者与工程负责人中，**81% 表示 AI 节省下来的编码时间现在被用来审查 AI 的产出**；近三分之一的开发者工作时间被这种"看不见的工作"占据。该报告揭示了 AI 编码工具大规模落地后，工程角色正从"开发者"转向"AI 管理者"，但企业现有的生产力衡量框架仍然停留在上一个时代。

## 核心要点

- **AI 编码已成默认**：企业工程团队普遍采用 AI 编码工具，但生产力 ROI 的衡量仍然模糊。
- **81% 时间用于审查 AI 输出**：在 Harness 调研的 700 名企业工程专业人员中，81% 表示节省的编码时间被"代码审查 / Bug 修复 / 上下文切换"消耗。
- **三分之一时间不可见**：将近 1/3 的开发者工作日花在不计入"产出指标"的审查与协调上。
- **测量框架过时**：Harness SVP Trevor Stuart 指出，行业仍依赖过去十年为瀑布式开发设计的 dashboards，无法衡量 AI 时代的工作单元。
- **责任范围扩大**：工程岗现在需要承担代码质量与安全审查、下游结果问责、AI 信任判断等多重责任。
- **可执行建议**：审计现有 framework 实际捕捉了什么 vs AI 实际产生了什么；加强 governance & security 评审；与开发者共建 measurement guardrails。

## 深度分析

### 1. "看不见的工作"为什么让生产力指标失真

传统软件开发的 DORA 指标（部署频率、变更前置时间、变更失败率、恢复时间）衡量的是"流过流水线的工作"。AI 编码出现后，开发者的工作结构发生了根本性变化：

- **生成阶段**：AI 在数秒内产出 100-500 行代码，但其中可能包含幻觉、过时的 API 调用、安全漏洞
- **审查阶段**：开发者需要逐段理解 AI 的推理、对比设计意图、识别潜在缺陷，这部分时间**不会出现在 DORA 指标里**
- **修复阶段**：审查发现的 bug 往往需要 back-and-forth 提示工程，进一步消耗上下文

Harness 报告称之为 "invisible work"——它不增加 commit 数、不缩短 pipeline 时间，但占据了开发者 1/3 的工作时间。这正是 DORA 指标失效的根因：**它衡量的"output"不是开发者实际在做的"work"**。

### 2. Engineering role 的三层重新定义

报告实质上揭示了工程角色的三层重定义：

1. **从 "coder" 到 "AI supervisor"**：工程师不再是从需求直接产出代码，而是要设计 prompt、检查 AI 输出、判断何时 override、何时 trust。
2. **从 "individual contributor" 到 "accountability holder"**：工程师需要对 AI 生成代码的下游结果（生产事故、安全漏洞、性能问题）承担最终责任——即使代码本身是 AI 写的。
3. **从 "domain specialist" 到 "context engineer"**：要让 AI 高质量产出，工程师需要先做好上下文工程——文件索引、需求拆解、约束声明——这部分工作传统上不算"开发"。

### 3. 为什么测量框架成为最大瓶颈

Trevor Stuart 的关键洞察是："Engineering leaders are being asked to make multi-year AI investment decisions using dashboards built for a different era of software development."

测量框架的瓶颈体现在三个方面：

- **指标定义错位**：deployment frequency 衡量的是 ship 速度，但 AI 时代瓶颈在 ship 之前的 review，指标应该前移到 review latency
- **数据采集断层**：DORA 工具只能采集 CI/CD 系统的数据，AI 工具链（Cursor / Claude Code / Copilot）的会话数据没有回流到 metrics pipeline
- **公平性争议**：超过半数受访者担心基于 AI 数据做绩效考核，希望"改进数据"和"绩效评估"明确分离

### 4. 对企业的可执行建议

Harness 报告给出的建议可以归纳为四个层面：

| 层面 | 行动 | 衡量指标 |
|------|------|----------|
| 框架审计 | 对比现有 framework 实际捕捉 vs AI 实际产生 | coverage gap % |
| 代码交付追踪 | 追踪组织级别的 code delivery rate | lines shipped / engineer / week |
| 审查时间量化 | 单独度量花在 AI 审查上的时间 | review hours / engineer / week |
| 治理与安全 | 增加 governance & security 评审 | security review pass rate |

### 5. 行业对照与潜在反例

报告中 81% 这个数字需要放在行业语境下理解：

- **HackerRank 2025 调研**显示超过三分之二的开发者感到"deliver faster" 的压力，这与 Harness 报告的"审查负担"叠加，说明 AI 工具同时推高了交付期望和审查负担
- **并非所有企业都适用**：在高度监管行业（金融、医疗），审查时间本来就高，AI 反而可能通过结构化审查降低部分负担
- **个体差异显著**：资深工程师的审查时间占比可能高于初级工程师，因为资深工程师更擅长发现 AI 难以自查的架构级问题

## 实践启示

1. **重新定义"开发工作"**：把 AI 审查、上下文工程、prompt 设计纳入正式的工程 KPI，而不是当作"非工作时间"。
2. **改造 metrics pipeline**：在 DORA 之上增加 review latency、AI acceptance rate、prompt iteration count 等 AI 时代专属指标。
3. **分离改进数据与绩效评估**：避免开发者为了考核而减少 AI 使用——AI 数据应只用于"流程改进"，不直接挂钩个人绩效。
4. **建立 governance guardrails**：在 AI 工具落地的同时，配套 security review 和 code ownership 流程，避免"AI 写、AI 审、AI 上"的失控链。
5. **投资上下文工程培训**：让工程师从 prompt 写作进阶到上下文管理——这将是未来 3-5 年最重要的工程技能分化点。

## 关联实体

- [Karpathy 最新访谈从 Vibe Coding 到 Agentic Engineering](../ch04/235-agentic.html) — Karpathy 关于 AI 时代工程师角色转变的访谈
- [Karpathy Vibe Coding Agentic Engineering](../ch04/132-karpathy-vibe-coding-agentic-engineering.html) — Vibe Coding 到 Agentic Engineering 范式转变
- [两万字详解Claude Code源码核心机制](../ch03/076-claude-code.html) — Claude Code 源码机制详解
- [你不知道的 Agent原理架构与工程实践 V2](../ch03/046-agent.html) — Agent 原理架构与工程实践
- [构建基于多智能体架构的深度思考交易系统 V2](https://github.com/QianJinGuo/wiki/blob/main/entities/构建基于多智能体架构的深度思考交易系统-v2.md) — 多智能体交易系统架构
- [Openclaw 完全指南这可能是全网最新最全的系统化教程了32W字建议收藏](../ch11/225-openclaw.html) — OpenClaw 完全指南

---

