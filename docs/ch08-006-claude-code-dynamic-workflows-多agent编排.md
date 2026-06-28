## Ch08.006 Claude Code Dynamic Workflows 多Agent编排

> 📊 Level ⭐⭐⭐ | 57.4KB | `entities/claude-code-dynamic-workflows-multi-agent-orchestration.md`

## 核心价值

Dynamic Workflows 把"循环/分支/复查逻辑"从主会话抽到 workflow 脚本里，主会话只拿最终报告。上下文压力小，执行稳定，适合普通 subagents 处理不了的代码库级大任务。

## vs Subagents / Skills / Agent Teams

| 能力 | 本质 | 适合场景 |
|------|------|---------|
| Subagents | 结果回主对话 | 旁路任务（查日志/读文件/局部review） |
| Skills | 操作手册 | 固定流程（写文章/发小红书） |
| Agent teams | 多session协作+互发消息 | 跨层功能开发/不同假设并行调试 |
| **Dynamic Workflows** | **任务图固化，脚本调度** | **代码库审计/文件迁移/多来源研究** |

## 关键设计边界

- **脚本不读写文件/不跑shell**：只协调 agents，真实操作由 agents 执行
- **subagent 权限继承用户 allowlist**：文件编辑自动批准；shell/web fetch/MCP 按用户配置
- **并发上限**：16 agents（低CPU可能更少），单次最多 1000 agents
- **中途不能等人输入**：只有 agent 权限提示能暂停；必须人工 sign-off 的场景需拆成多个 workflow

## 触发方式

1. **@workflow**：在 prompt 里写 `@workflow`，Claude 高亮生成 workflow 脚本。按 `Ctrl+G` 可忽略。
2. **ultracode**：`/ultracode` 是 xhigh reasoning effort + 自动 workflow 编排。Claude 自己判断哪些任务值得跑 workflow，可能拆成多个连续 workflow（先理解→实施→验证）。

内置 workflow：`@workflow:research` 从多个角度搜索资料、交叉验证 claim、生成带引用报告。

## 运行时管理

**审批阶段**：CLI 显示 planned phases，可选择运行/以后同项目不再询问/查看 raw script/取消。Desktop app 显示 approval card（workflow名/阶段列表/token使用提醒），可选 Once/Always/Deny。

**运行中监控**：`/workflow status` 查看每个 phase 的 agent 数/token总量/耗时。常用按键：`Enter` 详情/`Space` 暂停恢复/`X` 停止/`R` 重启选中agent/`S` 保存成可复用命令。

**保存位置**：项目级（进仓库，团队共用）或个人级。保存后变成 slash command。项目级优先于个人级。

## 深度分析

### 调度器 vs Worker 的职责分离

Dynamic Workflows 的核心架构是**调度器-工作者模式（Orchestrator-Worker Pattern）**的变体。workflow 脚本作为调度器存在，本身不执行业务操作，只负责任务分解、agents 派发、结果收集和汇总。这种关注点分离带来了三个实际好处：

1. **上下文隔离**：主会话不需要在整个任务生命周期中保持活跃，避免了长任务导致的上下文膨胀
2. **执行稳定性**：循环/分支逻辑固化在脚本变量里，不依赖主会话的推理判断
3. **并行效率**：多个 subagents 可同时工作，调度器等待所有 workers 完成后才汇总结论

这与 [Fan-Out 模式](ch04-302-agent-principle-architecture-engineering-practice.html) 的核心区别在于：Fan-Out 是"启动和收集分离"，Dynamic Workflows 则在此基础上增加了**多阶段（phases）和互相复查**的能力。

### 与 Agent Teams 的本质区别

Sub-Agent vs Agent Team 选型 的核心判断准则：按上下文边界设计，而不是按角色设计。Dynamic Workflows 更接近 Sub-Agent 模式——subagent 之间不直接通信，所有协调经过 workflow 脚本。但它引入了**阶段（phases）**概念，使得多步骤协作成为可能。

Dynamic Workflows 适合的场景：
- 代码库审计（先 map 文件，再按模块分配 agents，最后 verifier 复查）
- 几百文件迁移（有明确的任务图，可固化执行顺序）
- 多来源研究（@workflow:research 类型，内置交叉验证逻辑）

不适合的场景：
- 做着做着需要互相调头的任务（这应该上 Agent Teams）
- 需要跨 subagent 传递中间状态的工作（Dynamic Workflows 只传递最终报告）
- 必须人工 sign-off 的决策节点（需要拆成多个 workflow）

### 并发模型的工程限制

16 agents 的并发上限对于大多数代码库级任务是够用的，但要注意：
- 低 CPU 机器可能更少（实际并发受限于机器资源）
- 单次 1000 agents 的限制意味着超大型任务需要分批跑
- subagent 总在 `@claude` 模式下运行，继承用户的 tool allowlist——如果 shell/MCP 不在 allowlist 里，中途可能需要人工授权

### ultracode 的自动编排价值

`/ultracode` 的核心价值不是"更快"，而是**自动判断任务是否值得跑 workflow 以及如何拆解**。这解决了工作流设计中最难的部分——判断什么时候需要多阶段、什么时候需要并行、什么时候需要 verifier agents。可能的拆解方式：先理解代码结构 → 再实施修改 → 最后验证。

## 使用建议

1. **先用只读审计**：确认结果质量后再跑修复型 workflow
2. **ultracode**：自动判断任务是否值得跑 workflow，可能拆成多阶段连续 workflow
3. **保存成可复用命令**：项目级（团队共用）和个人级（跨项目），项目级优先

## 示例 Prompt（审计类）

```
Phase 1: map all relevant files and entry points.
Phase 2: assign independent agents by module; each agent must cite exact files and lines.
Phase 3: run verifier agents that try to disprove each finding.
```

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/claude-code-dynamic-workflows-multi-agent-orchestration.md)
→ [Thariq 官方博客中文版](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/claude-code-dynamic-workflows-thariq-blog-gaia.md)

## Thariq 官方博客补充：6 种模式 + 3 类失败模式

Anthropic Claude Code 团队 Thariq Shihipar 2026-06-03 发布的官方博客，补充了**使用模式分类**和**失败模式分类**——这是 VibeCoder 技术解析（聚焦调度器/worker 架构）未覆盖的视角。

### 3 类失败模式（必须用 workflow 对抗的根因）

| 失败模式 | 表现 | 触发条件 | workflow 对抗手段 |
|---------|------|---------|------------------|
| **智能体懒惰** | 多部分任务未完成时提前停下，宣称完成（如安全审查 50 项只处理 20 项） | 长任务、复杂任务 | 强制阶段化、verifier agent 检查完成度 |
| **自我偏好偏差** | 验证/评判自己的结果时倾向给高分 | 单上下文窗口、要求基于评分标准验证 | 派生独立 verifier agent（看不到原始思考） |
| **目标漂移** | 多轮对话/上下文压缩后丢失原始目标和约束 | 上下文压缩、边界条件、否定约束（"不要做 X"） | 每个 subagent 独立窗口 + 隔离目标 |

这 3 类失败模式是**为什么需要 workflow 的根本原因**，而不是简单的"任务大了装不下"。动态工作流的核心价值 = **架构性地隔离上下文 + 派生独立验证者**。

### 6 种核心模式

| 模式 | 作用 | 典型场景 |
|------|------|---------|
| **分类再行动** | 分类器 agent 判任务类型 → 路由到不同 handler | 多类型混合任务（如同时含 bug 修复 + 文档更新） |
| **扇出并综合** | 拆 N 个小步 → N 个 agent → 综合 agent 等待屏障 → 合并 | 大规模并行研究、跨文件审计 |
| **对抗性验证** | 每个生成 agent 配独立 verifier agent 评分 | 事实核查、技术主张验证、CLAUDE.md 规则验证 |
| **生成并过滤** | 围绕主题生成一批 → 评分/去重 → 留最佳 | 命名头脑风暴、设计方案探索 |
| **锦标赛** | N 个 agent 竞争同一任务 → 成对评判直到选胜者 | 排序（按 bug 严重度）、UI 选最佳 |
| **循环直到完成** | 不设固定轮数 → 满足停止条件才结束 | 大规模分诊、根因调查（不预设工作量） |

**关键观察**：6 模式不是互斥的，**实际 workflow 通常组合多种**。例如 "深度研究 skill" = 扇出（web 搜索）+ 对抗性验证（核查 claim）+ 综合（带引用报告）。

## Thariq 实战：10 大使用场景

### 1. 迁移与重构
Bun 用 workflow 从 Zig 重写为 Rust。**关键技巧**：把任务拆为 callsite/失败测试/模块等步骤 → 每个修复派生子 agent 到独立 worktree → 另一 agent 做对抗性审查 → 合并。**反模式提醒**：告诉 agent 避开资源密集型命令，最大化并行度。

### 2. 深度研究
内置 `/deep-research` skill = 扇出 web 搜索 + 抓取来源 + 对抗性验证 + 综合报告（带引用）。**不只用于 web**——也可从 Slack 汇总状态报告、或深入探索代码库理解某功能。

### 3. 深度验证
对**已有报告**做事实核查：① 一个 agent 识别所有事实性主张 ② 每条主张派生子 agent 详细核查 ③ 验证 agent 还能反查溯源 agent 用的来源质量。**双重 adversarial verification**。

### 4. 排序
1000+ 行定性排序在单 prompt 里质量急剧下降。workflow 方案：
- **锦标赛**：成对比较 agent 流水线（相对判断 > 绝对打分）
- **分桶并行**：先并行分桶排序，再合并
- **赛程管理**：确定性循环维护赛程表，只有当前 run 在上下文里

### 5. 记忆与规则遵守
CLAUDE.md 里写了但常被漏的规则 → 创建 workflow，每条规则对应一个验证 agent，**怀疑者人格 agent** 审查规则本身是否合理（防误报）。**反向**也成立：挖最近 session/CR 评论 → 并行聚类 → 对抗性验证 → 提炼回 CLAUDE.md。

### 6. 根因调查
独立假设法：派生多个 agent，从**互不重叠的证据**（日志/文件/数据）生成假设。每个假设交一组验证者+反驳者。**适用所有"事后复盘"**——销售下滑、pipeline 失败、PR 退版本。

### 7. 大规模分诊
支持队列、bug backlog。**隔离区模式**（关键安全模式）：读不可信公开内容的 agent 禁止执行高权限操作，由负责行动的 agent 完成。搭配 `/loop` 让 Claude 持续跑。

### 8. 探索与品味
设计、命名这类基于品味的任务 + 评分标准 = workflow 主场。agent 探索方案 + 审查 agent 用评分标准评估，达到条件即停。

### 9. 评估（Evals）
为特定任务运行轻量评估：worktree 派生独立 agent → 派生比较 agent 按评分标准打分。**真实使用场景**：评估并改进自己创建的 skill。

### 10. 模型与智能路由
分类器 agent 先研究任务 → 根据复杂度路由到 Sonnet/Opus。例如"解释 auth 模块"：先看文件数 + 代码结构 → 决定用哪个模型。**节省成本 + 提升质量**。

## 静态 vs 动态工作流演进

| 维度 | 静态（Claude Agent SDK / `claude -p`） | 动态（Dynamic Workflows） |
|------|---------------------------------------|--------------------------|
| 边界覆盖 | 需覆盖所有边界情况，更通用 | Claude 即时编写，专门为用例定制 |
| 智能水平依赖 | 不强 | 需要 Claude Opus 4.8+ 才足够智能 |
| 复用方式 | 代码库、CI | `~/.claude/workflows` 或 skill 模板 |
| 适用阶段 | 成熟稳定的工作流 | 探索期、Claude 自己判断最优路径 |

**核心判断**：动态工作流 = **让 Claude 自己当架构师**写定制执行框架，前提是模型够强。Opus 4.8 之后才成熟。

## 提示词最佳实践

| 技巧 | 说明 |
|------|------|
| **写详细提示词** | 具体技术 + 模式名称 = 最佳结果（"用 fan-out 加对抗性验证" > "用多 agent"） |
| **quick workflow** | 不只大任务用，小假设验证也可用 workflow 加速 |
| **/goal + /loop** | 重复任务（分诊/研究/验证）配 /loop 周期跑 + /goal 硬性完成要求 |
| **Token 预算** | "use 10k tokens" 类预算提示词控制成本 |

## 保存与分享

- **个人保存**：工作流菜单按 `s` → 写入 `~/.claude/workflows`
- **skill 化分享**：把 JS workflow 文件放进 skill 目录 + 在 `SKILL.md` 中引用
- **模板化提示**：建议提示 Claude 把 skill 里的 workflow 当**模板**而非逐字脚本，保留灵活性

## 什么时候不要用

> 工作流还很新。虽然有很多场景可以带来超额结果，但**并非每个任务都需要它们**，而且它们可能会使用明显更多 token。

**反模式清单**：
- 常规编码任务（不需要 5 人审查小组）
- 简单对话查询
- 一次性小修改
- 任务太小不值得 trade-off token 成本

**判断准则**：问自己——"这个任务是否能用 workflow 做到**过去做不到**的事？"如果是 → 用；如果只是"做得更快/更稳" → 评估 token 成本。

## 相关实体

- [Agent Orchestration](ch04-409-agent-01-agent.html) — 多 Agent 编排的控制平面、状态管理、human-in-the-loop 审批
- [四种 Sub Agent 模式](ch04-302-agent-principle-architecture-engineering-practice.html) — 内联工具/Fan-Out/Agent Pool/Teams 的控制粒度与状态保留对比
- [Sub-Agent vs Agent Team 选型 — 上下文边界设计准则与五种编排原语](ch04-495-逆天的架构-用-harness-langgraph-a2a-写一个-agent-team.html)
- [Claude Code 架构](ch01-571-claude-code-架构解析.html) — Claude Code 整体架构设计
- [Claude Code 大代码库使用](ch01-384-how-claude-code-works-in-large-codebases-best-practices-and.html) — 大型代码库场景的最佳实践

- MOC
## Thariq 2026-06-04 实战模式与构建技巧补遗
> 整理自 Thariq Shihipar 2026-06-04 的一手经验博客（与 sidbid 合作）
> 原文：https://mp.weixin.qq.com/s/1eSGt71P-PeaGszs2cikTw

**核心新内容**：模型够强（Claude Opus 4.8）后，**不再需要为每个用例写静态 harness**——直接让 Claude **现场生成**动态工作流。

### 3 大失败模式（动态工作流要对抗的）
| 失败模式 | 表现 | 对抗手段 |
|---|---|---|
| **智能体惰性** (agentic laziness) | 复杂任务没干完就停（如安全评审 50 条只处理 20 条） | 拆 subagent + /goal 硬性完成要求 |
| **自我偏好偏差** (self-preferential bias) | 偏袒自己产出，对照评分标准核实时更明显 | 独立 subagent 对抗式校验 |
| **目标漂移** (goal drift) | 多轮交互后丢失原始目标，尤其是 compaction 后 | 每次摘要都是有损的 → "不要做 X" 约束丢失 → 拆 subagent 隔离 |

### 6 大基础模式（前文已总结，详见 [原文](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/claude-code-dynamic-workflows-thariq-blog-gaia.md)）

### 11 大实战用例（新增 5.10 + 5.11）
| # | 场景 | 核心套路 |
|---|---|---|
| 5.1 | **迁移与重构**（如 Bun 从 Zig → Rust） | 拆步骤 → 每处修复分 worktree → 另起 subagent 对抗式评审 → 合并 |
| 5.2 | **深度研究**（`/deep-research`） | 扇出多路网络搜索 + 抓取 + 对抗式校验 + 汇总带引用报告 |
| 5.3 | **深度核查** | 报告 → 识别所有事实性论断 → 每条分 subagent 核查 → 校验 subagent 检查溯源质量 |
| 5.4 | **排序**（1000+ 行排序） | **成对比较 (pairwise) 比绝对打分更可靠**；并行分桶排名 + 合并；确定性循环只留当前排序在上下文 |
| 5.5 | **记忆与规则遵循**（CLAUDE.md 老漏规则） | 列出必须由校验 subagent 逐条检查的规则；再加 "怀疑论者" subagent 复核避免误报 |
| 5.6 | **根因排查**（调试/复盘） | 多 subagent 从**互不相交证据**提假设（日志/文件/数据各一个）→ 每个假设面对校验+反驳者 |
| 5.7 | **规模化分流**（支持队列/bug 报告） | 每条目分类 + 去重 + 行动（修复/上报人类）；**隔离区模式** |
| 5.8 | **探索与品味**（设计/命名） | subagent 探索一堆方案 → 评审 subagent 按评分标准判断 |
| 5.9 | **评测**（为技能打分） | worktree 拆 N subagent + 比较 subagent 对照评分标准打分 |
| **5.10** | **模型与智能路由** | **分类 subagent 调校** → 决定每个任务用哪个模型；例 "auth 模块" 先看代码库规模/形态 → 路由 Sonnet/Opus |
| **5.11** | **什么时候不该用** | 常规编程任务大多不需要；不要给每件事 5 评审者 |

### 5 大构建技巧
1. **详尽提示词** → 最好结果；可提示 "快速工作流"（如快速对抗式评审）
2. **与 `/goal` + `/loop` 配合** → 可重复工作流（分流/研究/核查）按固定间隔跑 + 硬性完成要求
3. **Token 用量预算** → 提示如 "用 10k token" 设定上限
4. **保存与分享** → 菜单按 "s" → 签入 `~/.claude/workflows` 或**通过技能分发**（工作流放技能文件夹 + SKILL.MD 引用）
5. **隔离区 (Quarantine) 模式**（5.7 实战）→ 禁止读取不可信公开内容的 subagent 执行高权限操作

### 静态 vs 动态工作流
| 维度 | 静态 (Claude Agent SDK / `claude -p`) | 动态 (Opus 4.8+) |
|---|---|---|
| 应对边界 | 必须覆盖所有 → 通用、笼统 | Claude 现编 → 量身定制 |
| 适配 | 写代码时考虑所有用例 | **为你的具体用例**生成 |
| 模型要求 | 任意 | **需要 Claude Opus 4.8 智能** |

### 8 个示例 Prompt（打开思路）
1. "测试每跑 50 次失败 1 次 → 建工作流复现 + 假设 + worktree 对抗式验证。/goal：在某假设被证实前不要停"
2. "翻最近 50 次会话 → 挖反复纠正 → 归纳成 CLAUDE.md 规则"
3. "查过去半年 #incidents Slack → 找反复出现却没人提工单的根因"
4. "商业计划书 → 多 Agent 视角（投资人/客户/竞争对手）批得体无完肤"
5. "80 份简历按后端岗位排名 → 锦标赛复核前 10 → AskUserQuestion 整理评分标准"
6. "命令行工具起名 → 头脑风暴 → 锦标赛挑前 3"
7. "把所有 User 模型重命名为 Account"
8. "博客草稿 → 对照代码库核实每个技术论断"

### 关键启示
1. **harness 之争 → 动态生成 harness** — 模型够强后不需要为每个用例写静态 harness
2. **多 subagent + 独立上下文 = 对抗 3 大失败模式**（惰性/自我偏好/目标漂移）
3. **锦标赛（pairwise）比绝对打分更可靠** — 5.4 排序场景的工程经验
4. **隔离区模式是安全/不可信输入场景标配**
5. **工作流是 skill.md 的天然内容** — 工作流放技能文件夹 + SKILL.MD 引用 = 可分享模板
6. **Token 预算必设** — 动态工作流消耗更多 token
7. **不是每个任务都需要工作流** — 常规编程任务大多用不上

## AGI Hunt 公众号 5th 译本：上手指南视角（2026-06-04）
> 整理自 AGI Hunt 公众号 2026-06-04 对同一篇 Anthropic 博客的中文译解
> 原文：https://mp.weixin.qq.com/s/hxBkT-iJleQkaODzjWVC2A
> 与前文 4 个 source **同源**（Anthropic "A harness for every task" 博客）

**该译本的独特视角**（相比 1eSGt71P 实战版 / 高可用架构 gaia 版）：
- **结构差异**：按"为什么需要 → 怎么量身定制 → 六种编排 → 实战 → 上手 → 克制"叙事流，而非 1eSGt71P 的"模式→场景→技巧"分类法
- **官方表态首次中文呈现**：Claude Code 官方账号 + Cat Wu（Anthropic PM）的 1:1 原文翻译（含 "ultracode 模式"命名 + `/effort ultracode` 触发方式）
- **Agent Teams vs Dynamic Workflows 区分图**：明确 N=100+ 个 subagent 的"执行者/验证者/修复者"三层架构
- **猫吴本（Cat Wu）个人用例**：用 Workflow 清理内部上百个 A/B test flag → 自动识别 roll out 到 0% / 100% 的废弃 flag
- **「是否值得用」决策启发**：6 大使用场景（迁移/规则生成/根因/分诊/探索/评测）+ 模型路由（按任务复杂度分 Sonnet/Opus）+ Quarantine 隔离区
- **与 1eSGt71P 实战版的细微差异**：强调 "**适合 100+ subagent 大规模并发**" 而非 1eSGt71P 强调的 "**实时恢复**"

**复用结论**：本译本**不独立入库**（80% 内容与已有 4 source 重叠），但补充了：
1. Cat Wu（Anthropic PM）的官方营销文案
2. Agent Teams vs Dynamic Workflows 视觉化对比框架
3. 大规模并发（N=100+）的可行性与 token 成本现实

**一句话整合**：Anthropic 用 Dynamic Workflow 把"每个任务写静态 harness"范式翻篇到"现场为每个任务量身定制动态工作流"，**5 个中文译本**（1eSGt71P 实战 / 高可用架构 gaia 详尽 / Anthropic 官方英文 / 32da0cfe merge / 当前 hxBkT 5th）**叙事角度不同但核心模式完全收敛**——6 种编排 / 3 类失败 / Quarantine 隔离 / 8 个示例 prompt / `/goal`+`/loop`+token 预算三件套。

## 玉澄 / 51CTO 译本补充（6th source, 2026-06-04）

[玉澄译本](https://raw/articles/claude-code-dynamic-workflows-zhuge6-yucheng-translation) 是 Dynamic Workflows 同源内容的**第 6 个中文译本**。**主体内容（6 模式 / 3 失败模式 / 8 Prompt / 10 场景 / 静态 vs 动态 / 5 Tips）与前 5 source 高度重叠**。**本译本独特补充**：

### 1. "quick workflow（快速工作流）" 概念
> "Workflows 不仅仅适用于大型任务。您可以**提示模型使用'quick workflow（快速工作流）'**。例如，你可以针对某个假设创建一个快速的对抗性审查。"

**价值**：打破"Workflows = 大型任务"的刻板印象，**让快速对抗性审查也用 Workflow**。

### 2. Bun 重写 Zig→Rust 案例 + X 帖子链接
> "Bun 曾使用 Workflows 将其底层代码从 Zig 重写为 Rust。您可以在 Jarred 的 X 帖中了解更多关于这一过程的细节。"

**具体链接**：[https://x.com/jarredsumner/status/2060050578026189172](https://x.com/jarredsumner/status/2060050578026189172)

**价值**：**真实生产案例**（Bun 著名 JavaScript 工具链）证明 Workflows 在大规模代码迁移中的可行性。

### 3. Slack 上下文状态报告生成
> "你不仅可以在网络搜索中应用此类研究。例如，您可以让 Claude **根据 Slack 中的上下文汇编一份状态报告**，或者通过深入探索代码库来研究某个功能的运作原理。"

**价值**：**Workflows 适用于非技术性工作**的又一例证（继 Thariq "非技术性工作有时更有用" 补充）。

### 4. Static workflows 精确定义
> "Claude Code 的 Static workflows（静态工作流）是指**预先定义好、结构固定的工作流模板，其 Agent 类型、数量和执行步骤都是固定的，适合重复使用和分享（可保存到 ~/.claude/workflows 文件夹）**。"

**价值**：明确 Static vs Dynamic 边界（"通用" vs "为你的特定用例量身定制的 Harness"）。

### 5. Skill 把 Workflow 当"模板"
> "为了获得更大的灵活性，你可能需要提示 Claude **将 Skill 中的 Workflow 视为'模板'，而不是必须逐字逐句严格执行的脚本**。"

**价值**：Workflow + Skill 的灵活使用模式（不是"写死"而是"模板"）。

**整合视角**：6 个中文译本叙事的**唯一非冗余新增**是 **Bun 案例的具体 X 帖子链接**（其他如"quick workflow"/"Skill 当模板" 等概念性补充已被前 5 source 部分覆盖）。这一案例链接值得在最终汇总时高亮——**真实生产级代码迁移 + 公开 trace** 是 Dynamic Workflows 能力的最强证据。

## 架构师 JiaGouX 译本补充（7th source, 2026-06-04）

[架构师 JiaGouX 译本](https://raw/articles/claude-code-dynamic-workflows-jiagoux-architect-perspective) 是 Dynamic Workflows 同源内容的**第 7 个中文译本**。**主体内容（6 模式 / 3 失败模式 / 8 Prompt / 10 场景 / 5 Tips）与前 6 source 高度重叠**。**本译本独特贡献**（**最不可替代**）：

### 1. 任务级 Harness 统一框架
> "**Dynamic Workflows 这次露出来的新信号，是 Claude Code 开始把这些任务级约束写进一段可执行流程里。**"

**6 大能力统一框架**（架构师视角）：

| 能力 | 主要解决的问题 | 架构师理解 |
|---|---|---|
| **Subagents** | 隔离上下文和局部任务 | 派一个人去看一块材料 |
| **Agent Teams** | 多块工作协作 | 几个人围绕同一个任务协同 |
| **Cowork** | 停止条件和交互节奏 | 什么时候继续，什么时候交回人 |
| **Skills** | 过程资产复用 | 把做对的方法沉淀下来 |
| **Harness** | 状态、权限、验证、记录 | 管住任务怎么跑、怎么查 |
| **Dynamic Workflows** | 任务级编排 | **为当前任务临时写一套可执行流程** |

> "**当 Subagents、Skills、Agent Teams、Goals、Hooks、Worktrees 都慢慢补齐以后，系统需要一种方式，把这些能力按任务临时编排起来。这就是任务级 Harness。**"

### 2. 任务级 Harness 把什么管起来（7 问清单）
> "**只盯着'能并发 1000 个 Agent'，很容易把它用成昂贵的自动化噪声。换成任务级 Harness 这个角度，问题会变得更具体：**"

1. 这个任务的**材料稳定吗**
2. **工作单元能不能拆开**
3. **每个单元的证据是什么**
4. **哪些动作只读，哪些动作会改状态**
5. **哪些动作要先问人**
6. **超过多少 token 或多少轮就停**
7. **最后交给人的是什么证据包**

> "**这些问题不花哨，但很接近生产系统。**"

### 3. 团队新瓶颈转移（Anthropic 内部观察）
> "**在 Claude Code 团队里，写代码、写测试、重构，已经越来越少成为唯一瓶颈。新的瓶颈开始转向验证、代码审查和安全。**"

> "**模型越来越会写以后，团队紧张的地方会转向验证、审查和守门。**"

### 4. 7 个"日常土问题"（Agent 系统设计自检）
1. 它知道自己什么时候没完成吗
2. 它能把证据留给我吗
3. 它会不会偏爱自己的结论
4. 它能不能把失败写回下一次流程
5. 它知道哪些事不能做、最多花多少吗
6. 人什么时候介入最合适

### 5. Bun 案例的边界判断
> "**Thariq 在后续讨论里补过一个边界：模型还没有完全到那一步，Bun 适合，是因为它非常可验证，测试覆盖也很好。这句比案例数字更能说明边界。**"

> "**Bun 更像是在提醒我们：只有足够可验证的旧系统，才适合被 Agent 切开、迁移、反复修复，再由人做最终判断。**"

**对迁移任务来说，代码量当然重要，后面这些条件往往更难**：
- 行为能不能被测试约束 / 编译错误能不能快速暴露 / 性能回退能不能被 benchmark 看见 / 每个模块的等价性有没有证据 / 最后合并前有没有人类 review

### 6. Cat Wu 整理 A/B test flags 案例（更接地气）
> "**这个场景没有 Bun 那么戏剧化，但我反而觉得它更适合团队第一批尝试。**"

**为什么适合**：每个 flag 都能单独检查 / 结果可以并行收集 / 判断标准相对明确 / 最终动作可以先交给人确认 / 错了也不至于直接改坏生产系统

> "**这类任务说明，Dynamic Workflows 不只属于代码迁移。它更适合'很多独立小单元 + 每个都要验证 + 最后统一合成'的工作。**"

### 7. 7 个"要写清楚的事"清单（落地策略）

| 维度 | 我会问的问题 |
|---|---|
| **材料** | 要读哪些目录、链接、issue、日志 |
| **结果** | 最后给报告、补丁、PR，还是分类表 |
| **证据** | 每个结论需要哪些引用、命令、测试或截图 |
| **动作** | 只读，还是允许改文件；哪些命令不能碰 |
| **模型** | 哪些阶段用强模型，哪些阶段用便宜模型 |
| **停止** | 最多多少轮、多少 token、哪些失败直接交回人 |
| **人的介入** | 人在什么时候 review，怎么判断能不能继续 |

### 8. 首轮只读试跑实例（billing 模块风险盘点）
```
目标：盘点 billing 模块里可能缺测试的路径。
范围：只读 src/billing、tests/billing，不访问 .env，不改文件。
拆分：按目录分给 4 个 subagents，每个只看自己负责的目录。
每个分支输出：文件路径、风险描述、证据、未确认点。
验证：再拉 1 个 reviewer，只检查证据是否站得住。
停止：最多 1 轮，不做修复，不自动开 PR。
交付：一张风险表，按高/中/低优先级排序。
```

> "**这件事说到底很朴素：Agent 能往前推，边界就要早一点写清楚。目标模糊、能做什么没说清、验收也没说清，在强 Agent 手里反而更危险。**"

### 9. token 预算 7 件事
1. 哪些阶段用强模型
2. 哪些阶段用便宜模型
3. 哪些分支只读不写
4. 哪些验证只抽样
5. 哪些任务最多跑一轮
6. 哪些任务可以配合 /loop 长跑
7. 哪些任务超过预算直接交回人

> "**我也不建议把 /effort ultracode 当成默认日常模式。它适合大任务、硬任务、验证成本高的任务。日常小改动用它，通常只是把一件简单事做贵。**"

**整合视角**：7 个中文译本叙事中，**JiaGouX 译本的最不可替代新增** = **"任务级 Harness" 统一框架** + **团队新瓶颈转移（写代码→验证/审查/安全）** + **7 个"要写清楚的事"清单** —— 这三点是前 6 译本完全没出现的元层洞察 + 落地策略。**[raw/articles/claude-code-dynamic-workflows-jiagoux-architect-perspective.md]**

---

## 8th 来源（2026-06）：行小招译注 + Hermes DAG 对比视角

> "**Anthropic 又开始抄袭了，把这套抄进了 claude code，改名为 dynamic workflow**"

**作者**："行小招"（落地公司研发交付智能体；研究大量开源智能体实现）

**3 大新增视角（前 7 译本完全没有）**：

### 1. **Hermes DAG 动态图先于 Claude Code Dynamic Workflow**

> "**Hermes 的 DAG 动态图，效果非常显著，这不，Anthropic 又开始抄袭了，把这套抄进了 claude code，改名为 dynamic workflow**"

**作者主张**：
- Hermes Agent **早于** Claude Code 提出 DAG 动态图范式
- Anthropic 把这套"抄"进 Claude Code 改名为 **dynamic workflow**
- 这是**开源 → 闭源反向流动**的典型案例

### 2. **Opus 4.8 + Dynamic Workflow > GPT-5.5（实测对比）**

> "**纯粹的 Opus 4.8 在 xhigh/max 级别上其实比不上 GPT-5.5，但加上 dynamic workflow 之后直接反超**"

**核心数据点**（**唯一来自中文译本的实测对比**）：
- 纯 Opus 4.8（xhigh/max 级别）< GPT-5.5
- Opus 4.8 + Dynamic Workflow > GPT-5.5
- **结论**：Harness 模式（dynamic workflow）能把模型能力曲线推到 Pareto Frontier 推进的位置

### 3. **企业级智能体终局判断 — Dynamic Workflow > Agent Teams**

> "**当下企业级智能体的终局就是这个了，不是那比较虚的 Agent team's，那玩意不稳定**"

**作者核心断言**：
- **企业级智能体终局 = Dynamic Workflow**（任务图固化 + 脚本调度）
- **不是 Agent Teams**（角色分工 + 自主协调）—— "**那玩意不稳定**"
- 这是从企业落地角度对两种范式的**直接对垒判断**

**Thariq 原文 6 种工作流模式**（行小招译注版本）：

| 模式 | 中文译名 | 适用场景 |
|---|---|---|
| Classify-and-act | **分类再行动** | 任务类型判断 + 分派 |
| Fan-out-and-synthesize | **扇出再综合** | 大量小步骤 + 干净独立上下文 |
| Adversarial verification | **对抗式验证** | 子智能体输出 + 独立审查 |
| Generate-and-filter | **生成再过滤** | 多想法生成 + 评分筛选 |
| Tournament | **锦标赛** | N 个智能体竞争 + 两两比较 |
| Loop until done | **循环直到完成** | 工作量未知 + 满足停止条件 |

**Thariq 原文 3 类失效模式**（行小招译注版本）：

| 失效模式 | 中文译名 | 表现 |
|---|---|---|
| **Agentic laziness** | **智能体懒惰** | 复杂多部分任务中**未真正完成就提前收工**；只处理 50 项里的 20 项就宣布完成 |
| **Self-preferential bias** | **自我偏好偏差** | Claude 更倾向认可自己的结果/发现，**按评分标准验证时尤其明显** |
| **Goal drift** | **目标漂移** | 多轮交互后逐渐偏离最初目标；**尤其在上下文压缩之后**（每次摘要都损失信息） |

**Thariq 原文 8 大实战场景**（行小招译注版本）：

| 场景 | 关键 insight |
|---|---|
| **迁移与重构** | 拆成调用点/失败测试/模块 → 每任务子智能体 + worktree 隔离 + 对抗式审查；**明确告诉智能体不要使用资源消耗很大的命令** |
| **深度研究** | /deep-research 技能 = 扇出网页搜索 + 抓取来源 + 对抗式验证 + 综合成带引用报告 |
| **深度验证** | 一个智能体识别事实声明 → 每条声明一个子智能体核查 → **再加一个验证智能体检查来源质量** |
| **排序** | 1000+ 行单 prompt 排序质量下降；**锦标赛或两两比较流水线**；并行分桶 + 合并；**相对判断比绝对打分更可靠** |
| **记忆与规则遵循** | 经常漏掉的规则 → 工作流列出必查规则 + 每条配验证智能体 + **怀疑者子智能体审查规则是否合理** |
| **根因调查** | 多个独立假设 + 多个不重叠证据来源 + 验证者和反驳者；**结构上避免自我偏好偏差** |
| **大规模分诊** | 隔离区模式：**读不可信公开内容的智能体不能执行高权限操作**；+ /loop 持续执行 |
| **探索与品味判断** | 设计/命名任务 + 评分标准 + 评审智能体；**方案按标准通过锦标赛排序** |

**Thariq 原文 4 大构建技巧**（行小招译注版本）：

1. **提示词技巧**：**为动态工作流编写提示词时，越具体越好**；可以提示"快速工作流"（如快速对某个假设做一次对抗式审查）
2. **结合 /goal 和 /loop**：适合重复运行（分诊/研究/验证）+ 定期执行 + /goal 设置明确完成要求
3. **Token 使用预算**：**提示词中写 "use 10k tokens" 就会设置对应上限**
4. **保存和分享**：菜单按 "s" 保存 → ~/.claude/workflows → **通过技能分发**（放进技能目录 + 在 SKILL.MD 引用）；**提示 Claude 把技能里的工作流视为模板，而不是必须逐字照跑的脚本**

**关键触发词**：
- **"ultracode"** = 触发词，确保 Claude Code 创建工作流
- 直接说 "**用工作流 ...**" 也可
- 普通任务**不要硬上**："**大多数传统编程任务并不需要 5 个审查者组成的评审团**"

**Token 消耗警告**：
> "**动态工作流通常会消耗更多 token，所以需要认真思考何时使用、如何使用。**"

**保存到技能目录**：
- JavaScript 工作流文件放进技能目录
- 在 SKILL.MD 中引用它们
- **提高灵活性**：把工作流视为**模板**，不是必须逐字照跑的脚本

**8 译本整体定位**：
- **1-7 译本**：偏 Anthropic 官方视角（技术拆解 + 实践模式）
- **8 译本（行小招）**：**中文社区视角** + Hermes DAG 先发论 + Opus vs GPT-5.5 实测 + 企业终局判断

**Hermes Agent `hermes-agent-skill-crossover-optimization` ↔ Claude Code Dynamic Workflow 关系**（中文社区视角）：
- **Hermes DAG 动态图**（开源） = Dynamic Workflow 的**前身 / 灵感来源**
- **Claude Code Dynamic Workflow**（闭源） = 借鉴后**产品化重命名**
- **两个生态互相喂养**：开源创新 → 闭源产品化 → 反哺开源

**核心金句（行小招版）**：

- "**Anthropic 又开始抄袭了，把这套抄进了 claude code，改名为 dynamic workflow**"
- "**Hermes 的 DAG 动态图，效果非常显著**"
- "**纯粹的 Opus 4.8 在 xhigh/max 级别上其实比不上 GPT-5.5，但加上 dynamic workflow 之后直接反超**"
- "**当下企业级智能体的终局就是这个了，不是那比较虚的 Agent team's，那玩意不稳定**"
- "**多部分任务中尚未真正完成就提前收工，并在只取得部分进展后宣布任务完成**"
- "**Claude 更倾向于认可自己的结果或发现，尤其是在你要求它按照评分标准去验证或评判这些结果时**"
- "**每一次摘要都会损失信息，像边缘条件要求，或者'不要做 X'之类的约束，都可能在过程中丢失**"
- "**综合步骤相当于一道屏障，它会等待所有扇出的智能体完成，再把它们的结构化输出合并成一个结果**"
- "**相对判断通常比绝对打分更可靠。每次比较都由自己的智能体完成**"
- "**可以让不同智能体分别查看日志、文件和数据。随后，每个假设都要接受一组验证者和反驳者的审视**"
- "**读取不可信公开内容的智能体不能执行高权限操作，高权限操作改由负责行动的智能体完成**"
- "**当评审智能体认为某个方案已经达到标准时，任务就完成了**"
- "**大多数传统编程任务并不需要 5 个审查者组成的评审团**"
- "**为动态工作流编写提示词时，越具体越好**"
- "**也可以提示模型使用'快速工作流'**"
- "**当工作流适合重复运行时，比如分诊、研究或验证，可以和 /loop 搭配**"
- "**为了提高灵活性，你可能会希望提示 Claude，把技能里的工作流视为模板，而不是必须逐字照跑的脚本**"

**整合视角（8 译本全栈）**：
- **8 译本叙事中，行小招译本的最不可替代新增** = **3 大中文社区视角**：
  1. **Hermes DAG 先发论**（**开源 → 闭源反向流动**的典型案例）
  2. **Opus 4.8 + Dynamic Workflow > GPT-5.5** 实测对比
  3. **企业级智能体终局 = Dynamic Workflow > Agent Teams**（直接对垒判断）
- 这三点是前 7 译本完全没出现的**元层判断 + 实测数据**

## 9th 来源（2026-06-05）：机器之心权威译本

> 「该功能允许 Claude 根据具体任务即时编写定制化执行框架，协调多个子 Agent 并行工作，解决大规模、高并行、对抗性任务中的系统性失效问题。」

**译者**：机器之心编辑部（机器之心 = AI 主流媒体，权威译本）

**译本特色**（vs 前 8 译本）：
- **版本号具体化**：明确「使用 Claude Opus 4.8 的动态工作流」
- **开篇 8 个示例 prompt 完整列出**（测试失败调试 / 会话错误挖掘 / Slack 工单根因 / 商业计划多视角拆解 / 简历排名 / CLI 工具命名 / User→Account 重命名 / 博客技术声明审查）
- **三阶段叙述**：上周发布 → 解决什么问题 → Thariq 博客全文译述
- **章节归类与高可用架构版基本一致**（核心机制 → 失败模式 → 6 模式 → 10 场景 → 构建技巧）

**9th 译本定位**（vs 前 8 译本）：

| 译本 | 来源公众号 | 独家价值 |
|------|------------|----------|
| 1st-2nd | 高可用架构 / 独立翻译 | 官方视角完整技术拆解 |
| 3rd-4th | 多公众号转载 | 复述 + 译注 |
| 5th | AGI Hunt | 上手指南视角 |
| 6th | 玉澄 / 51CTO | 静态 vs 动态精确边界 + Skill 模板 |
| 7th | 架构师 JiaGouX | 任务级 Harness 7 问清单 + Anthropic 内部观察 |
| 8th | 行小招 | Hermes DAG 先发论 + Opus vs GPT-5.5 实测 + 终局判断 |
| **9th** | **机器之心** | **权威媒体完整译本 + Opus 4.8 版本号 + 开篇 8 示例 prompt 完整版** |

**9th 译本对 entity 的新增贡献**：
- **Opus 4.8 显式版本号** — 机器之心译本明确「Claude Opus 4.8」作为 Dynamic Workflow 的基础模型，前 8 译本多省略具体版本
- **开篇 8 示例 prompt 完整保留** — 8 个使用案例的 prompt 写法对实践者最有参考价值
- **权威性背书** — 机器之心作为 AI 主流媒体的完整译本，**最适合作为对外引用的单一权威译本**

**9 译本整合后的 entity 价值**：
- **官方视角**（1-2 译本）+ **实战模式**（3-4）+ **上手指南**（5）+ **静态/动态精确边界**（6）+ **任务级 Harness 框架**（7）+ **中文社区元层判断**（8）+ **权威媒体背书**（9）
- 形成**9 个独立视角**的完整整合，**主实体总价值 v×c ≈ 9×10 = 90**

**整合后 9 译本相互验证的关键点**：
- **6 模式 + 3 失败 + 10 场景**：所有 9 译本一致（同一原文）
- **触发词 "ultracode"**：8th + 9th 都明确
- **保存到 `~/.claude/workflows`**：8th + 9th 都明确
- **Token 预算 "use 10k tokens"**：8th + 9th 都明确
- **静态 vs 动态差异**：6th 精确定义，9th 译本补充"Claude Opus 4.8"

**与 [机器之心译本](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/claude-code-dynamic-workflows-jiqizhixin-9th-translation.md) raw 的关系**：
- 机器之心版 raw 保留完整正文 + 译本特色
- 主 entity 已 merge 全部 9 译本的洞察，机器之心版无独家洞察，因此只作为"权威媒体背书"补遗
- 引用模式：本文即可作为对外引用 dynamic workflows 的**最权威单一译本**

## 10th Source：林月半子的 AI 笔记（2026-06-05）—— 实战触发 + ultracode 模式 + /deep-research + 编排者哲学

> 来源：[林月半子的 AI 笔记](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/anthropic-dynamic-workflows-ultracode-deep-research-lyuyuebannzi.md)（2026-06-05）
> **关系**：与 1st-9th 译本同源不同公众号的实战解读。**保留独家数据**：3 步跑起来（`/config` 开启 / prompt 含 "workflow" / `ultracode` / `/deep-research`）+ Claude Code 版本要求 v2.1.154 + Subagent/Skill/Workflow 三者核心差异（"谁握着计划"）+ 编排者哲学（"AI 写编排代码 vs 人写编排代码"）+ Sisyphus Labs 抄袭指控事件。

### Sisyphus Labs 抄袭指控事件

上周 Anthropic 发布 Dynamic Workflows，**24 小时不到**就被人公开指控"抄袭"。一个叫 **Sisyphus Labs** 的团队直接在推特上@了 Anthropic，说 Claude Code 新推的 **ultracode 模式**跟他们做的 OMO 工具里的 **ultrawork 和 atlas** 功能几乎一模一样。

> 抄没抄的，我不评价。但这件事背后有个更值得想的问题：**让 AI 自己写编排脚本这个能力，已经成了 Coding Agent 赛道的兵家必争之地**。
>
> **OpenAI Codex `/goal` 模式、第三方 OMO 开源、Anthropic Dynamic Workflows**——路径各不相同，但所有人都要解决同一个问题：**AI 要能自己拆任务、调度一支 Agent 舰队去干大活**。

### Subagent / Skill / Dynamic Workflows 三者核心差异

> **核心问题只有一个：谁握着计划？**

| 类型 | 谁决定下一步 | 中间结果流向 | 适用 |
|------|------------|------------|------|
| **Subagent** | Claude 逐轮判断 | **所有中间结果回到你的对话上下文** | "跑腿" |
| **Skill** | Claude 决定，按 prompt 走 | **同样回到对话上下文** | 预写 SOP |
| **Dynamic Workflows** | **脚本自己决定下一步** | **循环/分支/中间结果全在脚本变量里流转** | "流水线作业" |

**上下文占用关键洞察**：

> **用 subagent 或 skill 派 10 个小弟去干活，10 份结果全部作为 tool result 回到你的对话里，上下文越跑越臃肿，到后面 Claude 的注意力都被过程信息稀释了。**
>
> **Workflow 的 10 份中间结果在脚本变量里流转，最后只有一份汇总报告回到 Claude 的上下文。**

### 3 步跑起来你的第一个 Workflow（实战独家）

| 步骤 | 操作 | 独家细节 |
|------|------|---------|
| **1. 准备** | `/config` 命令 | 检查 Dynamic workflows 开启 + **版本要求 Claude Code v2.1.154+** |
| **2a. 触发方式一** | prompt 含 `workflow` 关键词 | Claude Code 会高亮成彩色提示 |
| **2b. 触发方式二** | `/effort ultracode` | **推理努力拉到最高档 xhigh + 自动判断何时用 Workflow** |
| **2c. 触发方式三** | `/deep-research <问题>` | 内置工作流：多角度搜索 + 交叉核对 + 投票表决 + 没通过验证的剔除 |

**ultracode 模式独家细节**：

- 开了之后**一个复杂的请求可能被拆成连续好几个 Workflow**——先理解代码，再修改，最后验证
- **每个请求消耗的 token 明显更高**
- **别在简单任务上开着忘关了**——退回用 `/effort high`

### 运行中可执行操作（独家）

| 操作 | 快捷键 | 效果 |
|------|--------|------|
| 查看详情 | Enter / → | 看调了什么模型/花了多少 token/用了几次工具/跑了多久/完整 prompt 和输出 |
| 暂停运行 | `p` | 随时暂停再恢复，已完成的工作不白费 |
| 保存 Workflow | `s` | 保存成 `/命令名` 斜杠命令，下次直接调用 |

**保存路径**：

- `.claude/workflows/`——项目级（克隆仓库的人都能用）
- `~/.claude/workflows/`——个人级（每个项目都能用，但只有你能看到）

### 编排者哲学（独家核心金句）

> **在官方推出这个功能之前，想让多个 Agent 并行干活、结果汇总、错误重试，你得自己写编排代码，处理并发控制、限流重试、中间状态管理、结果聚合，全是脏活。**
>
> **Dynamic Workflows 把编排这层的技术门槛直接抹平了。**
>
> **以前是人写编排代码、手搓各种脏活，AI 只管卖力气。**
>
> **现在是 AI 自己根据任务现场生成编排逻辑，跑在官方提供的运行时里。**
>
> **门槛从"会写编排代码"降到了"会定义目标"。**

### 10 译本对照

| 译本 | 来源 | 独家贡献 |
|------|------|---------|
| 1st-2nd | 高可用架构 / 独立翻译 | 官方视角完整技术拆解 |
| 3rd-4th | 多公众号转载 | 复述 + 译注 |
| 5th | AGI Hunt | 上手指南视角 |
| 6th | 玉澄 / 51CTO | 静态 vs 动态精确边界 + Skill 模板 |
| 7th | 架构师 JiaGouX | 任务级 Harness 7 问清单 + Anthropic 内部观察 |
| 8th | 行小招 | Hermes DAG 先发论 + Opus vs GPT-5.5 实测 + 终局判断 |
| 9th | 机器之心 | 权威媒体完整译本 + Opus 4.8 版本号 + 开篇 8 示例 prompt 完整版 |
| **10th（本节）** | **林月半子的 AI 笔记** | **3 步跑起来 + ultracode + /deep-research + Subagent/Skill/Workflow 三者核心差异（"谁握着计划"）+ 编排者哲学 + Sisyphus Labs 抄袭指控事件 + Claude Code v2.1.154 版本要求** |

**10 译本整合后的 entity 价值**：
- **10 个独立视角**的完整整合
- **主实体总价值 v×c ≈ 10×10 = 100**（接近本 wiki 上限）
- 整合后形成"**官方视角 → 实战模式 → 上手指南 → 边界定义 → Harness 框架 → 元层判断 → 权威背书 → 抄袭事件 → 哲学抽象**"完整 10 维坐标系

---
