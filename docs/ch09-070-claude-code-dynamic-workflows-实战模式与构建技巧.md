# Claude Code Dynamic Workflows 实战模式与构建技巧

## Ch09.070 Claude Code Dynamic Workflows 实战模式与构建技巧

> 📊 Level ⭐⭐ | 8.3KB | `entities/claude-code-dynamic-workflows-thariq-practical-patterns.md`

# Claude Code Dynamic Workflows 实战模式与构建技巧

> **Background**: Anthropic Claude Code 团队的 Thariq Shihipar 和 Sid Bidasaria 分享了 Dynamic Workflows 的实战经验——让 Claude 为每个任务临时编写专属 harness 的 JavaScript 协调机制。模型够强（Claude Opus 4.8）后，不再需要为每个用例写静态 harness，直接让 Claude 现场生成。

## 摘要

Claude Code Dynamic Workflows 是一种让模型为每个任务动态生成执行框架（harness）的范式。核心机制是执行一个 JavaScript 文件，其中包含特殊函数来生成和协调多个 subagent——每个 subagent 有独立上下文窗口、目标聚焦和彼此隔离。文章系统介绍了 3 大失败模式（智能体惰性、自我偏好偏差、目标漂移）、6 大基础模式（分类执行、扇出汇总、对抗校验等）、11 个实战用例和 5 大构建技巧。

## 核心要点

### 动态工作流的运作机制

- **执行 JavaScript 文件** → 包含特殊函数，生成并协调 subagents
- **每个 subagent**：独立上下文窗口 + 目标聚焦 + 彼此隔离
- **可决定**：subagent 用哪个模型 + 是否在独立 worktree 运行
- **可恢复**：用户中断/退出终端后，恢复会话时从上次停下的地方接着跑

### 3 大失败模式

| 失败模式 | 表现 | 对抗手段 |
|---|---|---|
| **智能体惰性** (agentic laziness) | 复杂任务没干完就停（如安全评审 50 条只处理 20 条） | 拆 subagent + /goal 硬性完成要求 |
| **自我偏好偏差** (self-preferential bias) | 偏袒自己产出，对照评分标准核实时更明显 | 独立 subagent 对抗式校验 |
| **目标漂移** (goal drift) | 多轮交互后丢失原始目标，尤其是 compaction 后 | 每次摘要有损 → 拆 subagent 隔离约束 |

### 6 大基础模式

| 模式 | 核心思想 | 典型场景 |
|---|---|---|
| **分类并执行** (Classify-and-act) | 分类 subagent 判类型 → 路由到不同 subagent | 支持工单分流 |
| **扇出并汇总** (Fan-out-and-synthesize) | 任务拆 N 步 → 每步一个 subagent → 汇总屏障 | 深度研究 |
| **对抗式校验** (Adversarial verification) | 每个生成 subagent 单独跑校验 subagent | 代码评审 |
| **生成并筛选** (Generate-and-filter) | 生成 → 评分标准筛选 → 去重 → 只返最优质 | 命名/设计方案 |
| **锦标赛** (Tournament) | N subagent 用不同方法做同一任务 → pairwise 比较决出优胜 | 1000+ 行排序 |
| **循环至完成** (Loop until done) | 循环生成 subagent 直到停止条件满足 | 根因排查 |

### 11 大实战用例

| 场景 | 核心套路 |
|---|---|
| **迁移与重构** | 拆步骤 → 每处修复分 worktree → 对抗式评审 → 合并 |
| **深度研究** | 扇出多路搜索+抓取+对抗校验+汇总带引用报告 |
| **深度核查** | 识别所有事实论断 → 每条分 subagent 核查 |
| **排序** | pairwise 比较比绝对打分更可靠；并行分桶排名+合并 |
| **记忆与规则遵循** | 列出规则 → 校验 subagent 逐条检查 + "怀疑论者"复核 |
| **根因排查** | 多 subagent 从互不相交证据提假设 → 每个假设面对校验+反驳 |
| **规模化分流** | 每条目分类+去重+行动；隔离区模式 |
| **探索与品味** | subagent 探索方案 → 评审 subagent 按标准判断 |
| **评测** | worktree 拆 N subagent + 比较 subagent 对照标准打分 |
| **模型路由** | 分类 subagent 判断 → 决定每个任务用哪个模型 |
| **什么时候不用** | 常规编程任务大多不需要 |

## 深度分析

### 静态 vs 动态 Harness 的范式转变

Dynamic Workflows 代表了 agent 架构的一个根本转变：

| 维度 | 静态 harness | 动态 harness |
|---|---|---|
| 应对边界 | 必须覆盖所有用例 → 通用、笼统 | Claude 现编 → 量身定制 |
| 适配 | 写代码时考虑所有用例 | 为你的具体用例生成 |
| 模型要求 | 任意 | 需要 Claude Opus 4.8 级智能 |

这意味着：**harness engineering 的未来可能是 meta-harness engineering**——不写具体的 harness，而是写指导模型生成 harness 的规则和模式库。

### 锦标赛模式的工程洞察

"Pairwise 比较比绝对打分更可靠"是来自排序场景的关键经验：

- 1000+ 行硬塞一个上下文会失败
- 成对比较减少了评判的认知负荷
- 并行分桶 + 合并是规模化的方法
- 确定性循环只保留当前排序在上下文中

这与 LLM-as-judge 研究的发现一致：pairwise comparison 的一致性显著高于 Likert 绝对评分。

### 隔离区模式的安全价值

在处理不可信输入（如公开网页内容、用户提交数据）时：

- 禁止读取不可信内容的 subagent 执行高权限操作
- 高权限操作改由负责处理信息的 subagent 完成
- 本质上是 agent 版本的"最小权限原则"

### Token 预算的工程必要性

Dynamic Workflows 消耗更多 token——多个 subagent 各有独立上下文窗口。设置明确 token 预算是生产化的前提：

- 提示如"用 10k token"设定上限
- 排序场景 1000+ 行硬塞会失败 → 工作流可拆分
- 保存工作流为 skill 中的模板 → 可复用、可预算

### 8 个打开思路的示例 Prompt

这些 prompt 展示了 Dynamic Workflows 的设计空间：

1. 间歇性测试失败 → 建工作流复现 + 在 worktree 中对抗式验证
2. 翻最近 50 次会话 → 挖反复纠正 → 归纳成 CLAUDE.md 规则
3. 查 #incidents Slack 频道 → 找反复出现却没提工单的根因
4. 商业计划书 → 不同 Agent 从投资人/客户/竞争对手视角批评
5. 80 份简历排名 → 锦标赛复核 → AskUserQuestion 整理标准
6. 命令行工具起名 → 头脑风暴 → 锦标赛挑前 3
7. 把所有 User 模型重命名为 Account
8. 博客草稿 → 对照代码库核实每个技术论断

## 实践启示

1. **模型够强后，静态 harness 可以被动态生成替代**：这是 harness engineering 的范式转变
2. **多 subagent + 独立上下文是对抗失败模式的关键架构**：惰性、自我偏好、目标漂移都需要隔离来解决
3. **锦标赛（pairwise）比绝对打分更可靠**：适用于排序、评审、选择等所有比较类任务
4. **隔离区模式是安全/不可信输入场景标配**：agent 版最小权限原则
5. **工作流是 skill.md 的天然内容**：放技能文件夹 + SKILL.MD 引用 = 可分享模板
6. **Token 预算必设**：动态工作流消耗更多 token，需要显式预算控制
7. **不是每个任务都需要工作流**：常规编程任务大多用不上，不要给每件事 5 个评审者
8. **动态工作流是 Claude Code 的可扩展点**：分享工作流 = 分享 agent 能力

## 相关实体

- [Claude Code Dynamic Workflows（已有合并实体）](/ch04-409-agent-orchestration/)
- [Embabel](/ch07-019-embabel/)
- 扣子 3.0
- [Meta Skill](/ch07-022-meta-skill/)
- [Harness Engineering](/ch05-041-harness-engineering-概念框架/)

→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/claude-code-dynamic-workflows-thariq-practical-patterns.md)

---

