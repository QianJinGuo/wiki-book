# Harness Engineering 实践指南：10 步路线图 + 8 失败模式 + 设计 Checklist — 系列第 15 篇收官

## Ch05.054 Harness Engineering 实践指南：10 步路线图 + 8 失败模式 + 设计 Checklist — 系列第 15 篇收官

> 📊 Level ⭐⭐ | 7.8KB | `entities/harness-engineering-10-step-practical-guide-2026.md`

「Agent Harness Engineering 技术连载」第 15 篇（收官篇），将前 14 篇理论提炼为可立即使用的实践指南——10 步从零到生产路线图、8 种常见失败模式速查表、Harness 设计 Checklist、给不同角色的具体建议。

## 核心定义

Harness Engineering 是弥合「Demo 能跑」与「生产能用」之间鸿沟的工程学科。类比：**Harness Engineering 之于 AI Agent，正如 DevOps 之于软件部署**。

Agent 面临的上下文腐烂、工具误用、成本失控、安全漏洞、跨会话失忆——这些问题不是模型的问题，是 Harness 的问题。

## 10 步从零构建 Harness

| 步骤 | 内容 | 对应系列篇目 |
|---|---|---|
| **Step 1** | 定义目标和边界（30 分钟，输出 AGENTS.md 初始版） | — |
| **Step 2** | 设计工具集（原子工具为主，Shell 为后备，3-5 个起步） | 第 5 篇 |
| **Step 3** | 上下文管理（渐进式披露 + 工具输出卸载 2000T + Prompt 缓存） | 第 4 篇 |
| **Step 4** | 状态管理三层（短期对话 / 中期 Progress File / 长期 Git） | — |
| **Step 5** | 安全护栏（命令白名单 + 目录黑名单 + 破坏性操作审批） | 第 7 篇 |
| **Step 6** | 验证循环（计算型优先 + 推理型 LLM Judge 兜底） | 第 8 篇 |
| **Step 7** | 可观测性（Langfuse 5 分钟接入，Trace 先行） | 第 12 篇 |
| **Step 8** | 长程执行（Ralph Loop 自动续接，干净上下文迭代） | 第 6 篇 |
| **Step 9** | 成本优化（模型路由 > Prompt 缓存 > 子 Agent 隔离 > 卸载） | 第 13 篇 |
| **Step 10** | 持续迭代（每周 review，记录决策到 AGENTS.md） | — |

**关键原则**：先做 Step 1/2/7 跑起来，其他步骤根据实际问题逐步加入。成本优化先做前两项通常省 60%+。

## 8 种常见失败模式速查表

| 失败模式 | 表现 | 缓解策略 |
|---|---|---|
| **完成幻觉** | 声称完成但实际没做 | Feature List 要求可计算 passes 标准 |
| **上下文腐烂** | 20-30min 后质量下降 | 60% 使用率触发 Compaction + 重注入原始任务 |
| **过早停止** | 任务未完成就停 | Ralph Loop 拦截 + 系统提示"测试通过前不停" |
| **级联错误** | 小错滚雪球 | 关键步骤后验证检查点 + 子任务独立标准 |
| **上下文溢出** | Context length exceeded | 工具输出卸载 + 早触发 Compaction + 子 Agent 隔离 |
| **工具误用** | 参数错误 / 用错工具 | 改善描述 + 参数验证 + 使用示例 |
| **跨会话失忆** | 新会话重复已完成工作 | 强制读取 Progress File + 关键步骤即时更新 |
| **范围蔓延** | 做额外"改进" | AGENTS.md 明确"只改任务要求的内容" |

## Harness 设计 Checklist（5 大类 18 项）

**目标与边界**：任务可验证 / 禁止区域已定义 / 成功标准可计算
**工具设计**：覆盖核心场景 / 有 Shell 后备 / 一句话描述 / 沙箱限制
**上下文管理**：渐进式披露 / 输出卸载 / Prompt 缓存
**安全护栏**：命令白名单/黑名单 / 破坏性操作审批 / 敏感路径限制
**验证+可观测+成本**：自动测试 / Trace 接入 / 成本追踪 / 模型路由 / 预算硬顶

## 三个新技能

工程师角色从「写代码」转向三个新能力：

1. **约束工程**（Constraint Engineering）：设计 Agent 不能做什么——护栏、白名单、审批门禁
2. **评估设计**（Evaluation Design）：定义「什么叫做对了」——可计算标准 + LLM Judge
3. **反馈循环设计**（Feedback Loop Design）：可观测性 + 评估 → 知道改什么、怎么改、改了有没有用

## 三个趋势

1. **模型与 Harness 紧密耦合**：训练数据包含特定 Harness 下的高质量轨迹，协同设计
2. **自适应 Harness**：自动观察运行模式、识别失败、调整配置（GEPA 算法方向）
3. **Harness as a Service**：云端托管护栏/可观测/评估（LangSmith / Galileo / Helicone）

## 系列三件最重要的事

1. **模型之外的一切，决定 Agent 生产质量** — 模型是 CPU，Harness 是操作系统
2. **评估是 Harness 改进的引擎** — 没有评估就是猜测
3. **核心是工程纪律** — 测试、可观测性、故障隔离、持续改进，应用场景变了原理没变

## 深度分析与实践启示

**1. 10 步路线图 vs Hermes Agent 的实现映射**

Hermes Agent 已实现路线图中的大部分步骤：Step 1 = AGENTS.md + CLAUDE.md（目标边界）；Step 2 = tools/ 目录（原子工具）；Step 3 = context management + compaction；Step 4 = session persistence + memory tool；Step 5 = disallowed_tools + hooks；Step 6 = pre-commit hooks + wiki-lint；Step 7 = Langfuse integration；Step 8 = cron + kanban（长程执行）；Step 9 = model routing（OpenRouter）。Step 10 持续迭代通过 skill_manage 和 session_search 实现。 [Hermes Agent Skills Source Code Analysis Shuge](/ch04-418-hermes-agent/)

**2. Progress File 模式与 Hermes Memory/Cron 的对比**

文章推荐 Progress File（claude-progress.txt）作为跨 session 状态管理。Hermes 用 memory tool（持久化记忆）+ cron job（定时执行）+ kanban（任务板）三者组合实现等价功能。memory 适合持久事实，cron 适合定时触发，kanban 适合任务分解——比单一 Progress File 更结构化但也更复杂。

**3. 8 种失败模式的实证价值**

这 8 种失败模式不是理论推测，每种都有"表现→诊断→缓解"三段式，可直接用于 Agent 系统的 post-mortem 分析。尤其"完成幻觉"和"上下文腐烂"是生产中最常见的两类——前者靠计算型验证（不能只声明完成），后者靠 Compaction 策略（60% 阈值 + 重注入）。

**4. 局限性：缺乏度量基准**

作为收官篇偏总结性质，缺乏：(1) 10 步路线图各步骤的实际耗时/成本数据；(2) 8 种失败模式在生产中的频率分布；(3) Checklist 18 项的优先级排序。这些数据需要在具体项目中积累。

## 相关实体

- [Harness Engineering Framework](/ch05-041-harness-engineering-概念框架/)
- [Production Harness 12 Components](/ch05-033-生产级-harness-的-12-大组件以及主流框架对比/)
- [Harness Engineering 14 步路线图](/ch04-362-harness-工程-14-步路线图-从单-agent-到自改进系统/)
- [AI Agent Harness Construction — Akshay](/ch04-065-深度拆解-ai-智能体-harness-的构造-译/)
- [Ralph Loop 长程执行](/ch05-012-长周期-agent-详解-从-ralph-loop-到可接管-harness/)
- [Hermes Agent Skills 源码分析](/ch04-418-hermes-agent/)
- Agent 记忆生命周期哲学
- Agent Engineering Guide MOC
- → [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/harness-engineering-10-step-practical-guide-2026.md)

---

