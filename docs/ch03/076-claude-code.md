# Claude Code 命令完全指南

## Ch03.076 Claude Code 命令完全指南

> 📊 Level ⭐⭐ | 10.4KB | `entities/claude-code-commands-guide.md`

## 概述
Claude Code 命令系统化指南——5 分类（会话/模型/权限/扩展/高阶）+ 分阶段优先级 + 速查表。核心理念：命令不是拿来背的，知道什么时候用、为什么用才关键。

## 五大类命令体系
### 第一类：会话与上下文管理
最基础也最常用，直接决定日常体验。
| 命令 | 用途 | 关键区别 |
|------|------|---------|
| `clear` | 彻底清空重开 | 不适合日常整理，适合"重开一局" |
| `compact` | 压缩上下文，保留主线 | 比 clear 更该高频使用 |
| `context` | 可视化查看上下文状态 | 先看状态，再决定怎么收 |
| `resume` | 恢复之前的会话 | 减少重复铺垫 |
| `rewind` | 回退到之前的节点 | 精细化回退，非全盘重开 |
| `recap` | 一句话阶段性收口 | 长任务节点整理进度 |
> 最容易被低估的是 `compact`——很多人一乱就 `clear`，但更稳的做法是先想：这个任务是该重开，还是该瘦身。

### 第二类：模型、推理强度与成本
解决"让谁、用什么状态来做"的问题。
**核心判断：执行型 vs 判断型**

- **执行型任务**（改明确代码/修定位清楚的 bug/补实现细节）→ 优先效率
- **判断型任务**（分析链路/多方案取舍/排查原因）→ 优先能力
| 命令 | 用途 |
|------|------|
| `model` | 选谁来做 |
| `effort` | 这件事要不要多想（明确则收低，复杂往上拨） |
| `status` | 确认当前模型/账号/连接状态 |
| `cost` | 看成本、计划用量、活动统计 |
| `stats` | 看 Token 结构、时间维度、代码改动量、活动分布 |

### 第三类：权限、安全与排障
解决"为什么该能做但做不成"的问题。
**三层权限体系：**
1. **permissions** — allow/ask/deny 三类规则，deny 优先级最高
2. **auto mode** — 运行时尽量少打断，不替代 permissions 静态边界
3. **sandbox** — 减少确认的同时保留执行边界
**三层分清楚：**

- **permissions**：哪些能做、哪些要问、哪些禁止
- **auto mode**：哪些调用可以自动放行
- **sandbox**：即使执行也只在边界内（项目目录内文件/网络）
| 命令 | 用途 |
|------|------|
| `permissions` | 管理 allow/ask/deny 规则 |
| `doctor` | 先体检再排障（刚配置完不好使时用） |
| `debug` | 开启调试日志，把问题卡在哪一层看清楚 |
| `sandbox` | 项目目录内连续执行，减少确认保留边界 |
| `security-review` | 涉及权限/数据/文件/外部输入时补安全检查 |
| `fewer-permission-prompts` | 基于历史使用记录，把低风险高频确认沉淀成 allowlist |

### 第四类：扩展能力
把 Claude Code 从"临时问答工具"变成"可复用工作流工具"。
**判断标准：**

- 长期事实 → `memory`
- 操作流程 → `skills`
- 专门角色 → `agents`
- 固定时机自动执行 → `hooks`
- 连接外部系统 → CLI + skill（MCP 优先于没有好 CLI 的情况）
- 定期重复执行 → `schedule`
| 命令 | 用途 |
|------|------|
| `memory` | 只放长期稳定信息，不要当会话垃圾桶 |
| `skills` | 把重复流程沉淀成可复用命令 |
| `agents` | 拆出专门角色（code-reviewer/debugger），主会话变协调者 |
| `hooks` | 把固定动作自动化（格式化/测试/危险命令拦截） |
| `mcp` | 没有好用的官方 CLI 时考虑；优先 CLI + skill |
| `schedule` | 把低风险重复性检查变成 routine |

### 第五类：高阶效率和工作流
长链路任务的"效率放大器"。
| 命令 | 用途 | 适用条件 |
|------|------|---------|
| `batch` | 大规模可拆分代码改造 | 范围大 + 子任务独立 + 验收标准清楚 |
| `simplify` | 功能做完后的代码收口 | 复用/质量/效率问题 |
| `loop` | 持续盯一件事（等部署/CI） | 优先用于"看"和"查" |
| `autofix-pr` | 监听 PR，CI 失败/reviewer 评论时自动修复 | 明确反馈和 CI 失败 |
| `team-onboarding` | 生成团队上手指南初稿 | 团队推广 |
| `powerup` | 交互式学习新功能 | 跟不上更新节奏时 |
| `release-notes` | 直接在 CC 里看版本更新 | 确认命令从哪个版本开始有 |

## 分阶段优先级
**第一优先级**（直接影响日常体验）：`compact`、`permissions`、`model`、`effort`
**第二优先级**（有反馈地使用）：`context`、`stats`、`cost`、`doctor`、`debug`
**第三优先级**（用深）：`skills`、`hooks`、`agents`、`sandbox`
**第四优先级**（看场景）：`mcp`、`schedule`、`batch`、`autofix-pr`

## 核心理念
> Claude Code 最值得学的，不只是怎么问，还有怎么用。命令不是拿来背的，知道什么时候该用哪个、为什么用它、用完能解决什么问题，才关键。
不要为了"高级"而高级——先解决真实问题，再选择合适命令。

## 深度分析
1. **五类命令体系本质是一套决策框架，而非工具清单** — 会话管理回答"在哪"，模型选择回答"派谁"，权限体系回答"能干啥"，扩展能力回答"怎么积累"，高阶命令回答"怎么放大"。这五个维度覆盖了从单次交互到长期工作流建设的完整路径
2. **`compact` 被单独强调为最被低估的命令，揭示了上下文管理是日常高频痛点** — 许多人遇到上下文膨胀第一反应是 `clear` 重开，但作者认为更优策略是先评估任务是否真的需要重开，还是只需要"瘦身"。这个建议直接针对实际工作流中的效率损耗
3. **权限体系的三层设计（permissions/auto mode/sandbox）体现了安全与效率的系统性平衡** — permissions 是静态规则边界，auto mode 是运行时放行策略，sandbox 是执行时的物理限制。三者分工明确而非重叠，反映了 Claude Code 在多用户/多场景环境中的成熟度
4. **第五类高阶命令的存在说明 Claude Code 正从"单次问答工具"向"可持续工作流平台"演进** — `batch`、`schedule`、`autofix-pr`、`team-onboarding` 这些命令的存在，使得 Claude Code 不再只是临时辅助工具，而是可以承担持续性工程角色的平台
5. **速查表设计将认知模式从"记命令"转变为"记场景"** — 传统学习是记命令名称（inductive），速查表是记场景反查命令（deductive），大幅降低了使用时的认知负担，让命令从"需要背"变成"能快速查"

## 实践启示
1. **建立成本意识：用 `cost` 和 `stats` 定期审视 Token 消耗** — 很多用户只关注功能是否达成，从不关注成本。建议每周或每项目用 `stats` 看一次 Token 结构，识别异常消耗模式，调整 `model` 和 `effort` 使用策略
2. **优先掌握 `compact` 而非动不动 `clear`** — 当上下文开始混乱时，先执行 `context` 查看状态，再决定用 `compact` 瘦身还是 `clear` 重开。这个判断习惯能显著减少不必要的上下文丢失和重复铺垫
3. **用 `skills` 沉淀重复流程而非用 `memory` 存临时信息** — 这是两个最容易被混用的命令：skills 放的是"怎么做"（流程），memory 放的是"是什么"（事实）。把 CLAUDE.md 当事实库、skills 当操作手册，分工清晰才能复用有效
4. **团队推广从 `team-onboarding` 开始，先有指南再谈规范** — 在团队内推 Claude Code 时，不要直接给规则文档，而是先生成一版基于实际使用历史的上手指南，让团队成员看到 Claude Code 已经在做的事，再讨论补充规范
5. **涉及文件/权限/外部输入的操作前，主动跑一遍 `security-review`** — 这是最少被使用但最能避免事后麻烦的命令。在执行批量修改、数据库操作、权限变更前花 30 秒跑一次，能有效拦截许多潜在问题

## 相关
- [Claude Code 架构解析](ch03/076-claude-code.html)
- [Claude Code Prompt/Context/Harness](../ch09/060-claude-code-prompt.html)
- [Cat Wu: Claude Code PM 工作流](ch03/076-claude-code.html)

## 相关实体
- [obsidian claude code integration guide](../ch09/127-obsidian-claude-code-integration-guide.html)
- [Claude Code vs OpenClaw Agent 记忆系统对比](ch03/076-claude-code.html)
- [开源 AI 知识管理搭档 Obsidian + Claude Code 完整集成指南](ch03/075-obsidian-claude-code.html)
- [CLAUDE.md 12 条规则：Karpathy 扩展模板](../ch09/083-claude-code-1.html)
- [两万字详解Claude Code源码核心机制](ch03/076-claude-code.html)
- [Claude Code Subagent 上下文卫生](../ch04/331-claude-code-subagent.html)
- [MOC](https://github.com/QianJinGuo/wiki/blob/main/moc/workflow-orchestration.md)

---

