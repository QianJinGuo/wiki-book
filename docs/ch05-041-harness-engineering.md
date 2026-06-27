# Harness Engineering 概念框架

## Ch05.041 Harness Engineering 概念框架

> 📊 Level ⭐⭐ | 11.8KB | `entities/harness-engineering-framework.md`

## 核心方程

- Agent = Model + Harness
- Harness = Agent - Model = 除模型外的所有东西

## Anthropic 实践

### 上下文焦虑：Compaction vs Reset

任务一长，模型上下文窗口越来越满，开始丢细节、丢重点、急着收尾。Compaction（同一 Agent，历史变短，心理状态延续）与 Reset（直接换干净上下文的新 Agent，交班时交接清楚）两种策略的选择，决定了长程任务的可靠性。对于某些模型（如 Claude Sonnet 4.5），Reset 才能真正"清空包袱、重新出发"——压缩历史会丢失 Agent 对任务的心理模型，这些无法被显式压缩保存。

### 自评失真：Generator + Evaluator 分离

模型做完之后自评偏乐观（设计、体验、产品完整度等无绝对二元答案的问题）。Generator + Evaluator 分离是解法：Planner 把短需求扩展成完整产品规格，Generator 逐步实现，Evaluator 实际操作页面、跑交互、看结果——不是读代码打分。生产与验收必须分离才能保证输出质量。

## OpenAI 实践

### 渐进式披露

早期错误是巨大的 AGENTS.md 把所有规范、架构、约定一股脑塞进去。最终方案是 AGENTS.md 只有 ~100 行，充当"目录页"，指向仓库里的详细文档：ARCHITECTURE.md（架构总览）、docs/design-docs/（设计文档，带验证状态）、docs/exec-plans/（执行计划）、docs/QUALITY_SCORE.md（各模块质量评分），配合 CI 自动校验文档新鲜度和交叉引用，以及"文档园丁"Agent 定期扫描过时文档并提 PR 修复。

OpenAI 另一核心经验是：人类不写代码，只负责设计环境——拆解意图（把产品目标拆成 Agent 能理解的小块任务）、补全能力（Agent 失败时问"环境里缺了什么让它失败的"然后补上）、建立反馈回路（让 Agent 能看到自己工作的结果）。

## LangChain 案例

底层模型完全不变，仅仅通过改造和迭代 Harness，Terminal Bench 2.0 得分就从 52.8 提升到 66.5（Top30 到 Top5）。真正决定 AI 产品上限的也许是模型，但真正决定能否稳定交付的往往是 Harness。

## 深度分析

**1. Prompt → Context → Harness 的三次演进揭示 AI 落地能力的层次跃迁**

从"怎么说"到"给什么"到"别跑偏"，这条演进链本质上是 AI 系统责任的转移：模型能力不足时，责任在 Prompt；模型变强后，责任转向 Context；Agent 进入真实任务执行时，责任落在 Harness。理解这个层次对于正确诊断 AI 系统故障至关重要——输出质量下降时，答案往往不在换模型，而在调整 Harness 层。

**2. "评估与观测"层是当前行业最薄弱的环节**

在六层结构中，上下文管理、工具系统已有大量积累，但评估与观测层（包括环境验证、过程日志、质量归因）仍是大多数内部 AI 系统的盲区。Generator + Evaluator 分离的启示是：模型自评不可信，只有在实际环境中操作并观察结果才能真正验证质量。AI 系统的可观测性建设与模型本身同等重要。

**3. 渐进式披露是解决上下文焦虑的工程化最优解**

OpenAI 的 AGENTS.md 从"巨册"压缩到 ~100 行目录页，配合后台"文档园丁"Agent 定期修复，这一方案解决了两个问题：避免了过多信息撑爆上下文窗口，同时通过机器可执行的规则保持了文档的新鲜度和引用完整性。文档不再是静态文本，而是与 CI 流程绑定的活性资产。

**3. Reset vs Compaction 的选择揭示了 Agent 记忆管理的根本矛盾**

压缩历史会丢失"心理上下文"——Agent 对任务的心理模型、当前进度的主观判断无法被显式压缩保存。显式状态交接（交接文档）比隐式历史传递更可靠，在构建超过 10 步的多步骤 Agent 时应优先设计状态交接协议。

## 实践启示

1. **建立六层结构的内部审计清单**：对照 Harness Engineering 的六层结构逐一评估现有 AI 系统的覆盖程度。"评估与观测"和"约束校验"两层是多数团队的盲区，应优先补充环境验证（可运行/可交互）和输出前的格式规范校验规则。

2. **强制执行 Generator + Evaluator 分离**：在内部 AI 项目中，不允许 Generator 代理自己验证自己的输出。Evaluator 必须是一个独立的、具有实际环境访问权限的 Agent，实际执行操作而非读取代码判断结果。

3. **采用渐进式文档结构替代单一 AGENTS.md**：将项目文档拆分为分层目录（架构总览 / 设计文档 / 执行计划 / 质量评分），通过 CI 自动检查文档新鲜度和交叉引用，并设置"文档园丁"Agent 定期清理过时内容。

4. **优先设计状态交接协议**：对于超过 10 步的复杂任务，显式设计 Agent 之间的交接文档格式（包含当前进度、已完成步骤的证据、待解决的核心问题），而不是依赖对话历史传递上下文。

## 第二来源: 2026 Rahul 综述 (学科正式确立版)

> **核心信息**: 2026 年 2 月 OpenAI 1M LOC 之后 90 天内, OpenAI / Anthropic / ThoughtWorks / Hugging Face 共同命名"**Harness Engineering**"为新工程学科. Rahul 在 X 发表的 canonical 综述 (公众号转载), 是该领域第一份面向工程师的"全景图 + 5 工件 + 5 原则 + 3 阵营 + 衰减论"完整指南.

### 学科确立时间线 (90 天)

- **2026-02**: OpenAI 小团队交付 1M 行生产代码, 0 手写
- **2026-02-03**: Anthropic 发表 3 篇相关论文
- **2026-03**: ThoughtWorks 形式化为框架
- **2026-04**: Hugging Face Philipp Schmid 命名"2026 最重要学科"

### 5 种 Harness 工件 (Rahul 框架)

| # | 工件 | 关键创新 | 跨阵营共识 |
|---|------|----------|------------|
| 1 | **AGENT.md / CLAUDE.md** | 仓库各处 Markdown, 每次会话开始读取 | OpenAI/AGENT.md / Anthropic/CLAUDE.md / Cursor/.cursorrules |
| 2 | **JSON 功能列表** | 跨会话进度追踪器 (覆盖概率 < Markdown) | Anthropic 实测 |
| 3 | **会话初始化例程** | Anthropic 7 步启动序列, 每次完全一致 | 节省 20 分钟 |
| 4 | **Sprint 合约** | 双 Agent 协商 (Generator + Evaluator) | 规划执行分离 |
| 5 | **结构化任务模板** | 基于真实代码库的影响地图 | Red Hat 实现 |

> **为什么 JSON 而非 Markdown?** Anthropic 发现 agent 意外覆盖 JSON 的概率低于 Markdown. 小细节, 6 小时自主运行里非常重要.

### 操作系统类比 (Philipp Schmid)

| 层级 | 计算机类比 | 含义 |
|------|------|------|
| Model | CPU | 原始处理能力 |
| Context window | RAM | 有限、易失的工作记忆 |
| Harness | Operating System | 管理 CPU 在何时看到什么 |
| Agent | App | 运行在上面的应用 |

> 大多数人正在运行没有操作系统的应用. 这就是他们的 agent 在生产环境失败的原因.

### 3 阵营对比 (撞同一堵墙, 搭出三种梯子)

| 阵营 | 核心方法 | 代表成果 | 量化 |
|------|----------|----------|------|
| **OpenAI 环境优先** | 设计彻底环境, 放手让 agent 工作 | Sora Android (4 工程师 / 28 天) | 99.9% 无崩溃, Codex 处理 70% PR |
| **Anthropic 执行评判分离** | Planner + Generator + Evaluator 3 Agent | A/B 测试 9 美元 vs 200 美元 | 22 倍成本, 换来可用产品 |
| **ThoughtWorks 2×2 框架** | Feedforward/Feedback × Computational/Inferential | 50+ 团队观察 | 跨 2 象限叠加 |

**Anthropic A/B 测试真实数字**:
- 单独 agent (无 harness): **9 美元, 20 分钟** → 破损应用
- 完整 harness (Opus 4.5): **200 美元, 6 小时** → 精致 UI + 物理逻辑正确
- 模型升级后 harness: **124 美元** (38% 节省)

### 5 项普适原则 (三支团队独立走到这里)

1. **上下文胜过指令**: 给地图, 不要给 1000 页手册
2. **规划和执行必须分离**: 同一次处理中同时做会产出不可靠结果
3. **反馈回路不可协商**: 没有反馈的 harness 只是一个绕了远路的 prompt
4. **一次只做一件事**: 强制增量主义, 是所有成功 harness 的共性
5. **代码库就是文档**: 投资代码组织的团队会免费获得更好的 agent 性能

### Harness 衰减 (最反直觉的真相)

**Anthropic 实测演化路径**:
- **Opus 4.5**: sprint 拆解 + 每个 sprint 评估 (200 美元)
- **Opus 4.6**: 不做 sprint 拆解 + 单次评估 (**节省 38% 成本**)
- **Opus 4.7**: 模型开始自我验证 → evaluator 角色进一步缩小

> Harness 中的每个组件, 都编码了一个关于"模型做不到什么"的假设. 随着模型进步, 这些假设会过期, 组件也会变成开销.

### 构建是为了删除 (Philipp Schmid)

> 把每个 harness 组件都设计成可移除的. 定期关掉每个组件, 测试输出质量是否变化. 如果没有变化: 删除它.

- **Manus** 6 个月重构 5 次 harness
- **LangChain** 1 年重组 3 次
- **Vercel** 移除 80% 工具, 性能反而更好

### 与本实体原版 (ConardLi) 的视角差异

| 维度 | 原版 (ConardLi, 2026-04) | Rahul 综述 (2026-06) |
|------|------|------|
| **定位** | 概念框架 + 三次演进 | 新学科确立的 canonical 综述 |
| **重点** | Prompt → Context → Harness 演进 | Harness 本身作为"操作系统类比" |
| **案例深度** | OpenAI/Claude/LangChain 各 1 例 | OpenAI + Anthropic + ThoughtWorks + Red Hat + LangChain + Vercel + Manus 7 例 |
| **新增概念** | 六层结构, Generator+Evaluator | Sprint 合约 / 会话初始化 / 衰减论 / 构建是为了删除 / 成本现实 |
| **价值增量** | 框架本身 | 工业级成本 + 跨阵营共识 + 演化趋势 |

> **判断**: Rahul 综述不是新概念, 是对 Harness Engineering 在 2026 学科确立期的全景图 + 工业成本 + 演化规律的整合. 与 ConardLi 框架互补, 不重复. 5 种 artifact / 5 原则 / 3 阵营 / 衰减论全部是新增视角.

## 相关实体
- [Fudan Peking Ahe Agentic Harness Engineering](/ch04-220-fudan-peking-ahe-agentic-harness-engineering/)
- [Agent Harness 12 Components 7 Decisions](/ch04-061-一篇看懂-agent-harness-的结构-12组件-7决策完整框架/)
- [Harness Engineering 第三代工程范式](/ch01-602-harness-engineering-ai-从-聪明-到-可靠-的第三代工程范式/)
- [Huggingface Ai Agent Glossary Model Scaffolding Harness Tool Skill Subagent](/ch04-277-ai-tool-poisoning-exposes-a-major-flaw-in-enterprise-agent-s/)
- Openclaw Prompt Context Harness

→ [原文存档 (ConardLi)](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/harness-engineering-framework.md)
→ [原文存档 (Rahul 2026 综述)](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/harness-engineering-2026-rahul-rauhul.md)

---

