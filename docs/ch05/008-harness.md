# 阿里工程师 Harness 工程化实践 (双案例合并)

## Ch05.008 阿里工程师 Harness 工程化实践 (双案例合并)

> 📊 Level ⭐⭐ | 26.3KB | `entities/harness-engineering-alibaba-java-case-study.md`

## 文章概要
阿里工程师在企业级 Java 应用（10万+行代码）上从零构建 Harness 体系，AI 代码率从 **24.86% 提升至 90.54%**。文章系统梳理三次范式跃迁（Prompt→Context→Harness）、四根支柱、四类失败模式，以及真实项目的完整实践路径。

## 三次范式跃迁
| 阶段 | 时间 | 核心关注 | 隐喻 |
|------|------|----------|------|
| **Prompt Engineering** | 2022-2024 | 单次交互优化 | 写好一封邮件 |
| **Context Engineering** | 2025 | 给 Agent 看什么 | 给邮件附上正确附件（Tobi Lutke） |
| **Harness Engineering** | 2026 | 跨会话/跨Agent/跨阶段的完整系统架构 | 造一辆好车 |
**核心引用**：

- Ryan Lopopolo（OpenAI）：*"Agents aren't hard; the Harness is hard."*
- Mitchell Hashimoto（HashiCorp）：*"Every time you discover an agent has made a mistake, you take the time to engineer a solution so that it can never make that mistake again."*

## Harness Engineering 四根支柱
### 支柱一：上下文架构（Context Architecture）
Agent 应恰好获得当前任务所需的上下文——不多不少。
**反面教训**（OpenAI 团队）：AGENTS.md 写成百科全书 → "所有内容都重要 = 没有内容重要"
**正确做法**：AGENTS.md ~100行，作为**索引和地图**（Index & Map），指向深层 Design Docs、Architecture Specs、Quality Criteria。
核心：上下文分层加载、按需获取。

### 支柱二：Agent 专业化（Agent Specialization）
拥有受限工具集的专业 Agent，优于拥有全部权限的通用 Agent。
Anthropic 三角色分离：

- **Planner**：负责规划
- **Generator**：负责实现
- **Evaluator**：负责验证
> "将做事的 Agent 和评判的 Agent 分开，是一个强有力的杠杆。"

### 支柱三：持久化记忆（Persistent Memory）
进度持久化在文件系统上，而非上下文窗口中。
Anthropic 标准化启动序列：
```
检查当前工作目录 → 读取 Git Log 和进度文件（如 progress.md）→ 定位优先级最高的未完成任务 → 开始工作
```
使跨越数十个会话的长时间任务成为可能。

### 支柱四：结构化执行（Structured Execution）
永远不让 Agent 在未经审查和批准书面计划之前写代码。
理想执行流：**理解 → 规划 → 执行 → 验证**（每个阶段之间有明确的质量门禁）
OpenAI 团队经验：用 Custom Linter + Structure Tests + Taste Invariants 构建机械化约束。
> "Waiting is expensive, fixing is cheap" — 宁可让 Agent 多跑一轮验证，也不要在人工 Review 时才发现问题。

## Anthropic 四类失败模式
| 失败模式 | 描述 | 解决方案 |
|----------|------|----------|
| **One-shot Syndrome** | 复杂需求在单个上下文窗口内完成，窗口超过 40% 填充率后质量快速衰退 | 上下文窗口 Sweet Spot < 40% |
| **Premature Victory Declaration** | Agent 完成部分工作就宣布结束，核心功能未实现或验证 | 引入端到端验证（Puppeteer MCP 截图） |
| **Premature Feature Completion** | Agent 认为功能已实现但未做端到端测试，部署后关键路径不通 | Browser Automation 自动化验证 |
| **Cold Start Problem** | 多次会话间缺乏持久化记忆，新会话需大量 Token 重新理解项目 | progress.md + 持久化记忆体系 |
**共同根源**：Agent 缺乏外部的结构化约束（Structured Constraints）和反馈机制（Feedback Mechanisms）。
**根本能力缺陷**：*"Agents are incapable of accurately evaluating their own work"*

## 企业级项目三大挑战
### 1. 认知负担（Cognitive Load）
企业级 Java 应用特征：10万+行代码，HSF/Dubbo/gRPC、Temporal/LiteFlow、Apollo/Nacos、Tair/Redis 等。
Agent 的知识边界等于代码库的文件边界。如果某条架构约定不在代码库中以机器可读的形式存在，对 Agent 来说它就不存在。
**隐性知识问题**：

- 某条链路是高频变更区（过去一年数十次 XML 改动）
- 某个全局配置类在项目中有近百处引用
- 价格字段必须用 `long` 类型且单位为分

### 2. 质量控制的系统性缺失（Systematic Quality Gap）
Agent 生成代码语法正确、风格统一，但业务语义层面可能存在微妙错误。
当 Agent 产出速度远超人工审查速度时，质量瓶颈从"写代码"转移到"看代码"。

### 3. 熵的累积（Entropy Accumulation）
OpenAI 百万行代码实践中提出：Agent 写代码时会模仿代码库中已有的 Suboptimal Pattern。
**累积后果**：代码库逐渐腐化（Code Rot）。
**解法**：Golden Principles 编码化，后台 Agent 自动扫描违规并提交修复 PR → **"Entropy Garbage Collection"机制**

## 开发者角色范式转移
| 传统模式 | Agent-First 模式 |
|----------|-----------------|
| 写代码 | 设计 Agent 的工作环境（Working Environment Design）|
| 调 Bug | 编写规范文档（Specification Authoring）|
| Code Review | 管理任务拆分与验收（Task Orchestration & Acceptance）|
**关键转变**：文档从"给人看的参考资料"变成"Agent 认识世界的唯一窗口"。发现 Bug 不再只是修代码，而是修 Harness。

## 实战结果
| 指标 | 数值 |
|------|------|
| AI 代码率提升 | 24.86% → 90.54% |
| 代码量 | 10万+ 行 Java |
| 技术栈 | Java 1.8 / Spring Boot / LiteFlow / HSF / Diamond |

## 深度分析
### 1. 为什么 Context Architecture 是最难攻克的壁垒
Alibaba 的案例揭示了一个关键真相：在企业级 Java 代码库中，隐性知识（Tacit Knowledge）的存在使得上下文管理成为系统工程问题，而非简单的 Prompt 优化。
典型的企业级 Java 项目中存在大量**未编码的架构约定**——价格精度处理、链路高频变更区、全局配置类的近百处引用——这些信息存在于资深工程师的直觉中，却从未以机器可读的方式写入代码库。
这意味着，当 Context Architecture 设计失败时，增加更多的上下文反而会让 Agent 的推理质量下降。OpenAI 团队将 AGENTS.md 写成百科全书式文档的失败案例，恰好印证了这一点：信息过载导致 Agent 无法区分信号与噪声。

### 2. 三角色分离（Planner/Generator/Evaluator）的深层意义
Anthropic 的 Planner-Generator-Evaluator 分离，本质上是对"自我评估幻觉"的系统性破解。
Agent 生成代码时，对自身产出的评估存在系统性偏差——它倾向于认为自己的代码是正确的、有完整功能的。这种偏差不是通过更好的 Prompt 能根本解决的，而必须通过引入外部的评估机制来对冲。
这与软件工程中"将测试与实现分离"的思想一脉相承。Generative Agent 和被测代码之间存在利益冲突（自己评价自己的产出），引入独立的 Evaluator 本质上是在架构层面消解这个冲突。

### 3. Entropy Garbage Collection 的工程化思路
OpenAI 提出的"Entropy Garbage Collection"是一个极具工程价值的概念：与其等待代码库腐化到无法维护，不如用后台 Agent 持续扫描并自动修复 Suboptimal Pattern。
这个机制的核心创新在于：它把质量维护从"人工定期 Review"转变为"机器持续监控"。当前端代码生成速度远超人工 Review 速度时，人工的质量门禁必然成为瓶颈。自动化的 Entropy GC 是突破这个瓶颈的唯一可行路径。

## 实践启示
### 给 AI 团队的建议
1. **建立机器可读的架构知识库**：将原来存在于老工程师脑子里的隐性知识转化为代码库可读取的规范文档（.md / JSON / 代码注释），让 Agent 能在运行时访问。
2. **强制执行理解→规划→执行→验证的流程**：永远不要让 Agent 在没有书面计划的情况下直接写代码。计划阶段的质量直接决定后续执行的质量。
3. **引入 Custom Linter 作为强制约束**：不仅验证语法，更验证业务语义（如价格字段必须用 `long` 类型）。Linter 失败应该阻断提交，而非留给人工 Review 发现。

### 给管理者的建议
1. **AI 代码率不是越快越好**：当 AI 代码率从 24.86% 提升到 90.54% 时，质量控制体系必须同步升级。如果 Harness 没有跟上，AI 代码率越高，腐化风险越大。
2. **开发者角色转变是真实发生的**：团队需要重新定义工程师的职责边界。从"写代码的人"转变为"设计 Agent 工作环境的人"，这个转变需要新的培训、新的协作流程，甚至新的招聘标准。
3. **长期投资 Harness 而非短期优化 Prompt**：根据三次范式跃迁的经验，Prompt Engineering 的边际收益已经显著递减，而 Context Architecture 和 Structured Execution 的优化空间仍然巨大。

## 第二来源: 杜学友 (阿里技术) 6 层架构 + 19 节点 + 7 维评测

> **核心信息**: 2026 年 5-6 月, 阿里技术 杜学友 公开《AI 不缺智商缺纪律: 一场 Harness 工程化实践》——与第一来源 (24.86%→90.54% AI 代码率) 同样出自阿里工程师, **角度互补**: 第一来源是"指标跃迁 + 4 支柱"宏观经验, 这一来源是 "**`~/.claude/` 文件系统级 6 层架构 + 19 节点 dispatcher 状态机 + G1-G8 门禁 + 7 维评测平台**" 的具体工程实现。两者合在一起构成"**阿里系 Harness 实践的工程化全景**"。

### 核心观点: prompt 是负债, harness 才是资产

> 作者自述: "对付 AI 的不确定性, 堆 prompt 是负债, 做框架才是资产"。

**模型能力的责任转移**: AI Coding 瓶颈从"模型能力"转移到"流程工程"——模型已足够聪明, 但不稳定, 稳定性必须由外部框架供给。

### 6 层架构 (`~/.claude/` 文件系统布局)

杜学友的 `~/.claude` 不是一堆零散配置, 而是一个**三层加载模型**, 核心思想: **把上下文当预算来管理**——常驻的极小, 深的按需加载。

| 层 | 内容 | 加载时机 | 解决 |
|----|------|----------|------|
| **2.1 常驻入口层** | `CLAUDE.md` + `CLAUDE.local.md` (角色、代码偏好、流程触发规则、G1-G8 门禁速查) | 每次会话 | 主会话常驻 ≤8K, 项目规范隔离 |
| **2.2 原子规则层** | `rules/` (7 个), 单一职责 | 按需引用 | "**每条规则都是一次事故的墓志铭**" |
| **2.3 角色 Agent 层** | `agents/` (dispatcher / orchestrator / requirement-analyst / tech-architect / quality-guardian / plan-generator / developer / verifier / deployer / tester) | 主会话按状态调度 | "**主会话应该退化成纯执行器**" |
| **2.4 按需上下文层** | `context/` (10 个, TDD 指南、Pre-Mortem 模板、对抗辩论、证据链规范) | 进入对应阶段才 Read | U 型注意力分布 → 深度内容不挤占主窗口 |
| **2.5 执行支撑层** | `skills/` (22 个) + `commands/` (12 个) + `evals/` | 显式调用 | 内部 CLI 封装, slash 命令入口 |
| **2.6 稳定性支点** | `eval` 检测 + `hook` 拦截 | 实时围栏 | 门禁 + 强制约束 |

### 19 节点标准研发链路 (动态裁剪)

需求评审 → 需求确认 → 方案设计 → 方案确认 → Pre-Mortem → 实施计划 → 验收标准确认
→ 拉变更 → 建分支 → 建 worktree → 开发 → 编译 → 单测 → ATDD → 证据链
→ 部署预发 → 接口测试 → 上线确认 → 验收报告

**动态裁剪**: 由 **意图 × 风险** 决定。QUERY 不要求任何产物、BUG_FIX/LOW 只查 5 节点、FEATURE/HIGH 查满 19 节点。

**硬规则**: "改完必部署"——真实业务代码改动自动追加部署预发 + 接口测试。

**当前边界 (诚实声明)**: 流程止步于预发部署 + 接口测试 + 验收报告。**online (G8 生产上线) 节点不强制**, 由人兜底——出错成本高于 AI 自主效率收益。

### 「薄主会话」三条铁律

1. **主会话只听 dispatcher**: 禁止自己 Read `phases/*.md` / `evidence.json`
2. **职责隔离**: 每个 agent 的可用工具严格受限
3. **上下文 ≤8K**: 只加载 CLAUDE.md + 触发规则 + 最近一条 dispatcher 指令

### 三种编排机制对比 (杜学友的选型决策)

| 机制 | 优势 | 致命伤 | 适合场景 |
|------|------|--------|----------|
| **Workflow** (JS 脚本编排) | 确定性控制流、高并行 `pipeline()` / `parallel()`、schema 强校验 | ① Bash 120s 超时 (最大 10 分钟) 长构建被静默杀死 ② 无 `askUser` 交互原语 ③ 跨 session 不可续 | 单阶段、无人工交互、超时窗口内 |
| **Agent Team** (消息驱动) | 多 agent 并行 | 松散协调无确定性工序、状态散落 TaskList、SendMessage 是"通知"不是"阻断" | 多人并行改多模块 |
| **dispatcher + 文件交接** ✅ | 天然持久化、可审计、强一致性 | 每次切换 Read 上步产物 ~2-5K tokens、并行受限于序列化 | **控制平面:有状态工序链 + 人工门禁 + 跨天续跑** |

**选型核心**: harness 本质是**控制平面, 不是计算平面**。

**dispatcher + 文件交接三个硬优势**:
- **天然持久化**——进程崩了文件还在, 跨天需求 `Read state.json` 即续
- **可审计**——每步产物是 markdown, `git diff` 一眼看清楚谁在哪步写了什么
- **强一致性**——state-keeper 单写者 (hook 拦截其他写者) + ajv schema 校验前置

**结论**: 三种正交互补。**Workflow 管计算平面, Team 管协作平面, dispatcher + 文件交接管控制平面**。当前实验方向: 混合编排——dispatcher 管控制流, Workflow 加速三角色评审等纯计算环节。

### 4 阶段演进史 (作者实战复盘)

> "**每一阶段的切换都并非优化, 而是止损**"

| 阶段 | 做法 | 崩盘症状 | 根因 |
|------|------|----------|------|
| **第一阶段 · 拿来主义** | oh-my-claudecode / everything-claude-code 社区 OpenSpec | 通用规范覆盖不了企业 Java 流程 | 边界情况全靠临场补丁 |
| **第二阶段 · 重 prompt 约束** | 把所有流程规矩写进 CLAUDE.md | ① 不听话 (选择性遵守) ② 上下文爆炸 ③ 自我矛盾 (规则冲突) | "**prompt 是说服, 不是强制**" |
| **第三阶段 · 减负 + 分层加载** | 常驻 ≤8K + 深度内容移到 `context/` | 长程会话中规则被业务代码稀释到注意力衰减区 | "**更多字无法对抗概率性遗忘**" |
| **第四阶段 · Agent 调度编排** | dispatcher 状态机 + 文件交接 + 职责隔离 | 24 agent 拆分后系统 prompt 反而占满上下文 | agent 数量不是问题, **职责隔离才是** |

### 7 维评测平台: 把流程作为被测对象

**核心理念**: 评测平台是**评估者, 不是执行者**。绝不替被试 claude 执行部署或测试——一旦平台"帮忙干活", 就失去客观裁判资格。

**3 个反常识设计**:
- **零 LLM 调用**: 100% Python 确定性逻辑, 3 次跑分 hash 完全一致
- **宁要可复现的"粗糙分", 不要会漂移的"精准分"**: ±5 分波动的 LLM 评委让 A/B 对比失去意义
- **评测环境越"干净", 反而越不真实**: 隔离 Maven 仓库 → 依赖解析失败 → 恒为 0 分; 换共享 6.9G `~/.m2` 缓存才跑通

**7 维评分** (按权重):
1. 流程完整性 (22%) — **"文件系统不会说谎"**, 不靠"模型说做了", 查产物文件
2. 代码正确性 (22%) — amaven + jdk 真编译真单测, **honesty gap** 暴露 AI 自报 vs 真实差距
3. 评审充分性
4. 验证质量
5. 部署完整性
6. 文档一致性
7. 经验沉淀度

**理论支撑 (arxiv 2605.29682)**:
- 原始 token 消耗 + 工具调用解释 agent 成功率方差 **R²=0.33~0.42**
- **验证反馈质量 (Effective Feedback Compute) 达到 R²=0.94~0.99**
- "**决定 AI 干活靠不靠谱的并非给它多少预算, 而是检查做得多好**"

### G1-G8 门禁墙 (eval 式硬校验)

每个门禁是**确定性 Python 函数**, 检查产物存不存在、编译过不过、单测通没通。verifier agent 跑完后写 `phases/verification.json`, 任一 gate FAIL 则流程退回 DEVELOPING——**不是"建议", 是"阻断"**。

**hook 拦截 (运行时硬约束)**: ① 状态文件写操作只允许编排层 agent 触发 (其他绕过直接 reject); ② 危险操作 (`git push --force`、`rm -rf`) 弹确认。

**核心原则**: 流程强制执行必须**从 LLM 推理中外置到确定性基础设施**。门禁必须是确定性代码, 独立于上下文窗口, **fail-closed** (默认拒绝, 只放行显式允许的操作)。

### 经验三级进化 (auto-learn 规则驱动)

以 `mvn -am 卡死` 为例:
- **lesson** (单次记录) → **pattern** (跨项目归纳 "Mac + system-scope 依赖 = 禁用 -am") → **instinct** (自动注入所有新项目 `build.md`)

**每一级晋升都需人工确认**, 防止错误经验扩散。

### 与第一来源 (24.86%→90.54% AI 代码率) 的 12 维对比

| # | 维度 | 第一来源 (90% AI 代码率) | 第二来源 (6 层架构) |
|---|------|--------------------------|---------------------|
| 1 | 关注点 | 指标跃迁 + 4 根支柱 | **具体工程实现** (6 层 + 19 节点 + 7 维评测) |
| 2 | 时间跨度 | 长期 (代码率 24→90%) | 2 个月 (harness 演进) |
| 3 | 抽象层级 | 概念框架 (Context/Agent Specialization/Memory/Structured Exec) | **文件系统级布局** (`~/.claude/` 具体路径) |
| 4 | 评测方法 | 隐含在 4 支柱里 | **专门 7 维评测平台**, 100% Python 确定性 |
| 5 | 演进史 | 三次范式跃迁 (Prompt→Context→Harness) | **4 阶段实战止损** (拿来主义→重 prompt→分层→agent 编排) |
| 6 | 流程节点 | 隐含在 Structured Execution | **显式 19 节点 dispatcher 状态机** |
| 7 | 门禁机制 | Custom Linter + Structure Tests + Taste Invariants | **G1-G8 门禁墙 + hook 拦截 + fail-closed** |
| 8 | 状态管理 | progress.md + 持久化记忆 | **`state.json` + `phases/*.md` + `evidence.json` + ajv schema 校验** |
| 9 | 多 agent | Anthropic 三角色 (Planner/Generator/Evaluator) | **9 角色 dispatcher 流水线** (含 orchestrator 合成 + 三角色评审) |
| 10 | 上下文管理 | 渐进式披露 (AGENTS.md ~100 行) | **三层加载 (≤8K 常驻 / 按需 rules / 按需 context)** |
| 11 | 关键论断 | "**Harness is hard**" (Lopopolo) | "**模型负责聪明, 我们负责让它守纪律**" (杜学友) |
| 12 | 借鉴/互补 | 给出了**为什么** (Context/Specialization 必要性) | 给出了**怎么做** (具体文件路径 + dispatcher 设计 + 评测平台代码) |

> **核心互补关系**: 第一来源是 "**为什么 harness 重要**" 的认知框架, 第二来源是 "**如何把 harness 落地**" 的工程手册。两者合在一起, 构成 "**从问题到方案**" 的完整闭环。

### 业界相关引用

- **VILA-Lab 对 Claude Code 逆向工程**: Claude Code 记忆**完全基于文件系统** (CLAUDE.md + JSONL 日志), 没有向量数据库、没有 Embedding, **5 层渐进式压缩管线** (裁剪 → 截断 → Auto-Compact 全量摘要), **流程状态细节在 Auto-Compact 阶段丢失**
- **Devin "脑机分离"**: 推理 (大脑) 在沙箱外, 执行环境 (机器) 无权访问大脑状态——Cognition 评价"更好的架构", 代价是状态管理更复杂
- **sd0x-dev-flow**: 四个关键词 "**hook-enforced dual review, state-machine gates that survive context compaction, and fail-closed safety**"
- **Apache Burr**: Agent 决策表达为状态机节点 + 可插拔持久化 + 实时追踪 UI 的通用框架
- **VikingMem (VLDB 2026)**: 16.82% Token 留存得分 75.80 vs 朴素 RAG 100% 留存仅 63.81——"**更少 Token + 更智能组织 > 全量保留**"
- **Codebase-Memory-MCP**: 多轮 AST 分析构建知识图谱 (13+ 节点、18+ 边)——99.2% Token 减少宣传被证伪, 但架构模式有价值

### 第二来源的"还能怎么提升"诚实声明

- **结构化记忆层**: 当前三级进化是手动管理, 可借 VikingMem / Sverklo 双时态记忆
- **代码知识图谱**: 大型多模块项目 Agent 每次理解代码关系都要逐文件读, Codebase-Memory-MCP 试点
- **编排形态 A/B 对比**: v-agentwf-nodecomp vs v-dynwf, **由评测分数决定优劣, 不靠拍脑袋**

> **核心金句**: 能「**用实验回答架构之争**」这件事本身, 就是评测平台最大的价值。

### 适配迁移性

杜学友最后提炼的可迁移模式: 任何 "**能力够强但输出不稳定、且过程可观测**" 的 AI 工作流, 都可以被这样工程化——给它**分层的约束、外置的状态、确定性的评分**, 让每一次改动都能被证明是进步还是退步。

**边界**: 依赖 "**过程可观测**"。如果 AI 任务中间产物无法落盘 (如纯创意生成), 失效; 模型强到能自我保证纪律, harness 功成身退。

## 相关链接
- 参考：[Harness Engineering Framework](https://github.com/QianJinGuo/wiki/blob/main/concepts/harness-engineering-framework.md)
- 参考：[Coding Harness Engineering](https://github.com/QianJinGuo/wiki/blob/main/concepts/coding-harness-engineering.md)
- 参考：[Managed Agents Architecture](https://github.com/QianJinGuo/wiki/blob/main/concepts/managed-agents-architecture.md)
## 相关实体
- [一文带你弄懂 Ai 圈爆火的新概念Harness Engineering V2](ch04/150-ai.md)
- [Agent Harness Engineering Survey 2026](ch04/502-agent.md)
- [Harness Engineeringai 能在真正出事会炸的后端系统里写代码吗](ch04/150-ai.md)
- [Harness Engineering Systematic Framework](ch05/061-harness-engineering.md)
- [Agentscope Java Harness Framework](ch04/502-agent.md)

→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/harness-engineering-alibaba-java-case-study.md)
→ [原文存档 (杜学友 6 层架构)](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/harness-engineering-alibaba-6-layer-architecture-duxueyou.md)
- [协作涌现：agent room 的多智能体决策框架](ch04/502-agent.md)
- [programbench swe agent benchmark](ch04/452-programbench-swe-agent-benchmark.md)
- [harness 工程可视化：vibe coding 中重建工程可控性](ch05/061-harness-engineering.md)
- [MOC](https://github.com/QianJinGuo/wiki/blob/main/moc/multi-agent-coordination.md)

---

