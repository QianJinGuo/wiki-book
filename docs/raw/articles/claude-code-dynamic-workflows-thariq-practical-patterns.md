---
title: "Claude Code Dynamic Workflows 实战模式与构建技巧（Thariq Shihipar 一手经验）"
source_url: "https://mp.weixin.qq.com/s/1eSGt71P-PeaGszs2cikTw"
publish_date: 2026-06-04
tags: [wechat, article, claude-code, dynamic-workflows, thariq, subagent, multi-agent, patterns, fan-out, tournament, adversarial-verification, model-routing, token-budget, skill-md, claude-md]
review_value: 10
review_confidence: 10
review_recommendation: strong
sha256: f64133d607679f2b33f96f10547d7cbb5fdd563c4c98b0adee2a12e1f3ef806a
---
# Claude Code Dynamic Workflows 实战模式与构建技巧
> 作者：Thariq Shihipar（@trq212，Anthropic Claude Code 团队） + Sid Bidasaria（@sidbid）
> 原文：https://mp.weixin.qq.com/s/1eSGt71P-PeaGszs2cikTw
> 官方博客：https://claude.com/blog/a-harness-for-every-task-dynamic-workflows-in-claude-code

## 一句话定位
**Claude Code Dynamic Workflows = 让 Claude 临时为每个任务编写专属 harness（执行框架）的 JavaScript 协调机制**。模型够强（Claude Opus 4.8）后，**不再需要为每个用例写静态 harness**——直接让 Claude 现场生成。

> 关键范式：动态工作流能决定**每个 subagent 用哪个模型**、是否在**独立 worktree** 运行、可被用户中断后**从上次停下的地方接着跑**。

## 8 个示例 Prompt（打开思路）
1. "这个测试每跑 50 次失败 1 次。建一个工作流来复现它，提出假设，在 worktree 里对抗式验证。/goal：在某假设被证实前不要停"
2. "翻我最近 50 次会话，挖出反复在做的纠正，归纳成 CLAUDE.md 规则"
3. "查过去半年 #incidents Slack 频道，找出反复出现却没人提工单的根因"
4. "商业计划书 → 让不同 Agent 从投资人/客户/竞争对手视角批得体无完肤"
5. "80 份简历按后端岗位排名 → 锦标赛复核前 10 → AskUserQuestion 整理评分标准"
6. "命令行工具起名 → 头脑风暴 → 锦标赛挑前 3"
7. "把所有 User 模型重命名为 Account"
8. "博客草稿 → 对照代码库核实每个技术论断"

## 动态工作流如何运作
- **执行一个 JavaScript 文件** → 包含若干特殊函数，**生成并协调 subagents**
- 包含标准 JS 函数（JSON/Math/Array）处理数据
- **每个 subagent 独立上下文窗口** + **目标聚焦** + **彼此隔离**
- **可决定**：subagent 用哪个模型 + 是否在独立 worktree 运行
- **可恢复**：用户中断/退出终端后，**恢复会话时从上次停下的地方接着跑**

## 3 大失败模式（动态工作流要对抗的）
| 失败模式 | 表现 | 对抗手段 |
|---|---|---|
| **智能体惰性** (agentic laziness) | 复杂任务没干完就停（如安全评审 50 条只处理 20 条） | 拆 subagent + /goal 硬性完成要求 |
| **自我偏好偏差** (self-preferential bias) | 偏袒自己产出，对照评分标准核实时更明显 | 独立 subagent 对抗式校验 |
| **目标漂移** (goal drift) | 多轮交互后丢失原始目标，尤其是 compaction 后 | 每次摘要都是有损的 → 边界情况、"不要做 X" 约束丢失 → 拆 subagent 隔离 |

## 6 大基础模式
| # | 模式 | 核心 |
|---|---|---|
| 4.1.1 | **分类并执行** (Classify-and-act) | 分类 subagent 判类型 → 路由到不同 subagent/行为；末尾分类器决定最终输出 |
| 4.1.2 | **扇出并汇总** (Fan-out-and-synthesize) | 任务拆 N 步 → 每步一个 subagent → 汇总步骤是屏障（等待所有扇出完成再合并） |
| 4.1.3 | **对抗式校验** (Adversarial verification) | 对每个生成的 subagent 单独跑一个，对照评分标准做对抗式校验 |
| 4.1.4 | **生成并筛选** (Generate-and-filter) | 围绕主题生成 → 评分标准筛选 → 去重 → 只返最优质 |
| 4.1.5 | **锦标赛** (Tournament) | N subagent 用不同方法做同一任务 → 评判 subagent 用**成对比较 (pairwise)** 决出优胜者 |
| 4.1.6 | **循环至完成** (Loop until done) | 工作量未知 → 循环生成 subagent 直到停止条件满足（无新发现/无错误） |

## 11 大实战用例

| # | 场景 | 核心套路 |
|---|---|---|
| 5.1 | **迁移与重构**（如 Bun 从 Zig → Rust） | 拆步骤（调用点/失败测试/各模块）→ 每处修复分 worktree → 另起 subagent 对抗式评审 → 合并 |
| 5.2 | **深度研究**（`/deep-research`） | 扇出多路网络搜索 + 抓取 + 对抗式校验 + 汇总带引用报告 |
| 5.3 | **深度核查** | 报告 → 识别所有事实性论断 → 每条分 subagent 核查 → 校验 subagent 检查溯源质量 |
| 5.4 | **排序**（1000+ 行排序） | **成对比较比绝对打分更可靠**；并行分桶排名 + 合并；确定性循环只留当前排序在上下文 |
| 5.5 | **记忆与规则遵循**（CLAUDE.md 老漏规则） | 列出必须由校验 subagent 逐条检查的规则；再加 "怀疑论者" subagent 复核避免误报 |
| 5.6 | **根因排查**（调试/复盘） | 多 subagent 从**互不相交证据**提假设（日志/文件/数据各一个）→ 每个假设面对校验+反驳者 |
| 5.7 | **规模化分流**（支持队列/bug 报告） | 每条目分类 + 去重 + 行动（修复/上报人类）；**隔离区模式**（禁不可信 subagent 执行高权限操作） |
| 5.8 | **探索与品味**（设计/命名） | subagent 探索一堆方案 → 评审 subagent 按评分标准判断 → 完成即停 |
| 5.9 | **评测**（为技能打分） | worktree 拆 N subagent + 比较 subagent 对照评分标准打分 |
| 5.10 | **模型与智能路由** | **分类 subagent 调校** → 决定每个任务用哪个模型；例 "auth 模块" 先看代码库规模/形态 → 路由 Sonnet/Opus |
| 5.11 | **什么时候不该用** | 常规编程任务大多不需要；不要给每件事 5 评审者 |

## 构建动态工作流的 5 大技巧

### 6.1 提示词技巧
- **详尽提示词** = 最好结果
- 提示**"快速工作流"**（如快速跑一轮对抗式评审）
- 提示使用具体模式名称

### 6.2 与 `/goal` + `/loop` 配合
- 可重复工作流（分流/研究/核查）→ `/loop` 按固定间隔跑
- `/goal` 设定**硬性完成要求**
- 组合：5.7 分流工作流 + /loop = 持续不断处理

### 6.3 Token 用量预算
- **为动态工作流设定明确 token 预算**
- 提示如 "用 10k token" → 设定上限
- 例：5.4 排序场景 1000+ 行硬塞会失败 → 工作流可拆

### 6.4 保存与分享工作流
- **菜单按 "s" 保存** → 签入 `~/.claude/workflows` 或通过**技能 (skill) 分发**
- 技能里分享：JS 工作流文件放技能文件夹，**SKILL.MD 引用**
- **提示：把技能里的工作流当模板**（不是必须逐字运行的脚本）

### 6.5 隔离区 (Quarantine) 模式（5.7 实战）
- 禁止读取不可信公开内容的 subagent 执行高权限操作
- 高权限操作改由负责处理信息的 subagent 完成
- 安全/不可信输入场景必备

## 静态 vs 动态工作流
| 维度 | 静态工作流 (Claude Agent SDK / `claude -p`) | 动态工作流 (Opus 4.8+) |
|---|---|---|
| 应对边界 | 必须覆盖所有 → 通用、笼统 | Claude 现编 → 量身定制 |
| 适配 | 写代码时考虑所有用例 | **为你的具体用例**生成 |
| 模型要求 | 任意 | **需要 Claude Opus 4.8 智能** |

## 启示
1. **harness 之争 → 动态生成 harness** — 模型够强后不需要为每个用例写静态 harness
2. **多 subagent + 独立上下文 = 对抗 3 大失败模式**（惰性/自我偏好/目标漂移）
3. **锦标赛（pairwise）比绝对打分更可靠** — 5.4 排序场景的工程经验
4. **隔离区模式是安全/不可信输入场景标配**
5. **工作流是 skill.md 的天然内容** — 工作流放技能文件夹 + SKILL.MD 引用 = 可分享模板
6. **token 预算必设** — 动态工作流消耗更多 token
7. **不是每个任务都需要工作流** — 常规编程任务大多用不上
8. **动态工作流是 Claude Code 的可扩展点** — "扩展 Claude Code 的好方式"

## 与已入库对照
- [[entities/claude-code-dynamic-workflows-multi-agent-orchestration|Claude Code Dynamic Workflows（已有合并实体）]]：本文与该实体互补，添加**11 实战用例 + 5 构建技巧 + token 预算 + 隔离区模式**
- 与 [[entities/embabel|Embabel]] 对照：Embabel 强调**运行时类型系统集成 + 确定性规划**；Claude Code 强调**动态生成 JS 工作流 + subagent 隔离**——殊途同归
- 与 [[entities/coze-3-0-collaboration-system|扣子 3.0]] 对照：扣子是云端项目化；Claude Code 是本地工作流
- 与 [[entities/meta-skill|Meta Skill]] 对照：Meta Skill 是 Skill 之上的抽象；Dynamic Workflow 是 subagent 之上的编排

## 参考链接
- [1] https://code.claude.com/docs/en/workflows
- [2] https://code.claude.com/docs/en/glossary#agentic-harness
- [7] https://claude.com/blog/a-harness-for-every-task-dynamic-workflows-in-claude-code
- [8] https://code.claude.com/docs/en/sub-agents
- [9] https://www.anthropic.com/news/claude-opus-4-8
- [12] http://claude.md/
- [13] http://skill.md/
