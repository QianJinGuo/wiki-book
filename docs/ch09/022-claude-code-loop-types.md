# Claude Code Loop Types — 官方四种循环模式分类法

> 📊 Level ⭐⭐⭐ | 13.2KB

> Claude Code 团队 (Delba de Oliveira & Michael Segner) 官方定义的四种 Loop 类型。与第三方教程不同，这是官方分类法。

## 四种 Loop 类型一览

| Loop 类型 | 触发方式 | 停止条件 | 适用场景 | 关键特性 |
|---|---|---|---|---|
| 轮次驱动 | 用户提示词 | 任务完成 | 短、一次性任务 | SKILL.md 验证优化 |
| 目标驱动 (/goal) | 实时提示词 | 目标达成/达最大轮数 | 有明确可验证退出条件的任务 | 评估模型检查条件 |
| 时间驱动 (/loop, /schedule) | 指定时间间隔 | 取消或工作完成 | 周期性工作, 外部系统交互 | 可按间隔重跑同条提示词 |
| 主动循环 | 事件/日程触发 | 任务退出; routine 持续运行 | 反复出现的工作流 | /schedule + /goal + skills + auto mode + dynamic workflows 组合 |

## 代码质量五原则（第 2 来源独家）

1. **保持代码库本身干净**：Claude 会遵循已有的模式和约定
2. **给 Claude 验证自身工作的方法**：通过 SKILL.md 记录团队认可的验证标准（如前端更改验证：启动开发服务器 → 交互验证 → 截图 → 控制台检查 → Chrome Devtools MCP 性能审计）
3. **让文档易于获取**：框架和库的文档包含最新最佳实践
4. **第二智能体代码审查**：全新上下文的评审者偏见更少（内置 `/code-review` 或 GitHub 审查工具）
5. **系统性改进**：单次结果未达标准时，将其编写到系统中以改善未来所有迭代

## Token 管理六策略（第 2 来源独家）

1. 为具体工作选择合适的组件和模型
2. 定义清晰的成功和停止标准
3. 大规模运行前试点评估（动态工作流可生成数百个智能体）
4. **确定性工作使用脚本**：脚本比推理更经济（如 PDF 技能运行表单填充脚本）
5. 间隔与变化频率匹配
6. 查看使用情况：`/usage`（按技能/子智能体/MCP 细分）、`/goal`（轮次和 Token）、`/workflows`（每个智能体的 Token）

## 第 3 来源 — 架构师中文实践视角（2026-07-15）

> 公众号"架构师"对 Claude Code 四类 Loop 的中文解读，补充了长任务状态下的人机交接流程。

### 长任务状态追踪六要素

当 Loop 跨多轮运行（数小时甚至跨定时唤醒），聊天记录不再可靠。作者整理了接手现场所需的六要素：

- **SPEC**：明确 scope（如"只升级依赖 X，最多 5 轮"）
- **STATE**：当前版本、候选版本、已尝试路径、失败原因
- **EVIDENCE**：测试退出码、依赖树 Diff、发布说明中的风险项
- **IMPACT**：可能受影响的服务、用户路径和运行环境
- **PERMISSION**：可写独立分支，不自动合并，不改生产配置
- **HANDOFF**：为什么停止、哪些风险未覆盖、谁做决定

### 构建有效的 Skill 的实战建议

- 从近期 PR 中提取 Reviewer 的关注模式：哪些调用点被搜索、为什么拒绝改动、最终靠什么证据合并
- 第一版 Skill 不必写很多——测试命令、退出码、必须查看的 Diff 比"仔细检查兼容性"更能约束 Agent
- 返工原因应写回系统：如果某类 PR 总因许可证或默认配置被拒绝，这些信息应进入下一版 Skill 或检查脚本

### 四类 Loop 的控制权递进关系

四种 Loop 不是成熟度阶梯，而是一个控制权递进谱系：

- 依赖升级最适合从**回合式**开始：Agent 查版本、改代码、跑测试，人决定是否继续
- 只有当检查标准稳定、停止条件可验证、权限边界清楚时，才有必要升级到目标式或定时式
- 主动式不是单独指令，而是一组能力的组合（/schedule + /goal + Skills + Dynamic Workflows + Auto mode）

## /loop 源码机制与实操验证（SUPP 2026-08-06）

> 数据派THU（王大鹏）实操教程补充：官方分类法定义"是什么"，本节补充"怎么实现"——/loop 的底层机制、状态持久化与错误分类决策，均为前三个 source 未覆盖的维度。

### /loop 本质 = cron + prompt（源码级）

读 Claude Code 源码：loop.ts 解析 interval → cron 表达式 → CronCreate 创建定时任务（recurring=true）→ 立刻执行一次 prompt（不等第一个 tick）→ cronScheduler.ts `setInterval(check, 1000)` 每秒检查 → 到期 onFire(prompt) → 注入消息队列 → agent 开始新 turn。

**没有 evaluator，没有自动判断"是否达标"的系统组件。** /loop 做的事就是"定时唤醒 prompt"。"判断是否达标"、"决定继续还是停止"、"区分错误类型"这些智能全在用户设计的 prompt 里，调度器只做一件事：到时间了，把 prompt 塞给 agent。

### 状态文件模式（sync_state.json）

Loop 持久状态设计：`{status, last_check_time, known_articles, check_count}`——每次唤醒先读状态决定分支（success 正常同步 / token_expired 先轻量检测再决定），无新内容时只更新 check_count 和 last_check_time，**决策路径最短、token 消耗最低**（"知道什么时候不该做事"）。

### 错误分类决策（判断在 prompt 不在调度器）

同样"执行失败"，agent 区分：**内容层面的问题（值得重试）vs 基础设施层面的问题（需要人介入）**。微信 token 过期（API 返回 ret=200003 invalid session）→ 不重试、标记 token_expired、通知用户扫码；下一轮先轻量检测 token 是否恢复，未恢复则"仍在等待扫码，本轮跳过"。对比 cron 脚本：报错 → 退出 → traceback 躺日志 → 第二天才发现数据断了一天。

### 五形态设计空间

Claude Code 里 agent 的自动化触发有五种形态：/loop（时间表）、/goal（目标驱动）、hooks（事件确定性触发）、subagent spawn（并行验证）、workflow（LLM 决定子 agent 组合）——实际工作流组合使用（示例：scheduled loop 每周五触发 → 主 agent 分析 PR 识别缺失 skill → spawn 子 agent 用 goal loop 验证）。设计 Loop 的第一步不是 loop 组件本身，而是先写处理问题的 skill。

## 与已有实体的关系
- [Claude Code Loop Engineering 完整攻略](https://github.com/QianJinGuo/wiki-public/blob/main/entities/claude-code-loop-engineering-guide.md) — 兔兔AGI 第三方教程，侧重实战技法；本实体是官方分类法，侧重模式选择决策
- [阿里云 Loop 实战」— 同为 Loop 实践，但本实体聚焦 Claude Code 的 CLI 命令级 loop 原语

## 参考

→ [raw/articles/claude-code-loop-types-official-taxonomy-four-modes|原文存档 1](https://github.com/QianJinGuo/wiki-public/blob/main/entities/aliyun-loop-engineering-log-scan-auto-fix-deploy.md)
→ [raw/articles/fyjE5EhnV1jKzE8NnscZDQ|原文存档 2 (AI寒武纪)]
→ [raw/articles/anthropic-loop-four-types-practical-guide-jiagoux-2026-07-15|原文存档 3 (架构师)]
→ [raw/articles/claude-code-loop-practical-cron-prompt-datathu-2026-08-06|原文存档 4 (数据派THU)]

## 深度分析

四类 Loop 常被读成"自动化由低到高"，官方真正切分的是**停止判据归谁所有**与**验证发生在哪里**。

### 分类轴：停止判据的四次移交

回合式判据在模型自评、裁决权在人；目标式抽成可执行断言交给独立评估器；定时式的停止条件不是"做完了"，而是"取消"或"外部工作完成"；主动式拆两层——单任务靠 /goal，Routine 只由人关闭。

后果是：**每升一级，不确定性并不消失，只是换了持有者**——回合式担心"模型跑偏"，目标式转到"目标写对没"，定时式转到"间隔与真实变化频率是否匹配"，主动式转到"权限与例外归谁"。升级不是能力升级，而是把风险从运行时推到规格与组织层；故官方说四类没有高低，只有检查标准稳定、停止条件可验证、权限清楚之后，升级才有净收益。

### 上下文生命周期：验证是"审计"而非"调查"

目标式最易被高估：评估器不跑命令、不读文件，只能看到 Claude 已放进对话记录的证据——它是审计已提交证据，不是独立取证；共享错误规格时，执行者与评估者会一起判过。

定时式更硬：/loop 跑在本机，机器停则循环停，云端持续要靠 research preview 的 /schedule；运行列表的绿色只说明启停无基础设施错误，不代表业务成功。 既然每次唤醒都是独立会话的启停，聊天记录就不是账本，连续性必须外置到状态文件、Issue 字段、CI 与 PR 模板——长任务六要素不是文档规范，而是跨会话唯一的记忆载体。

### 四种类型的最小对照

| 维度 | 回合式 | 目标式 /goal | 定时式 /loop·/schedule | 主动式 |
|---|---|---|---|---|
| 谁停它 | 人 | 独立评估器 | 取消或外部事件 | 判目标+人关 Routine |
| 上下文 | 单会话累积 | 同会话，只读记录 | 每次唤醒重启 | 状态外置+证据包 |
| 验证位置 | 人眼读 Diff | 审计已交证据 | 循环内无验证 | 状态字段+人工闸门 |
| 最适合 | 需人补判断 | 条件可机检 | 周期性外部交互 | 权限已划清 |

每类防一个失败，也各留残留：回合式防漂移，残留复核债；目标式防"自我宣布完成"，残留判据被字面满足；定时式防"忘了再看一眼"，残留空转与间隔错配；主动式防"人必须在场"，残留组合风险——不可信输入、敏感数据与对外写同处一会话。

### 经济性：Token 便宜，复核贵

"多跑几轮不难，难的是留下足够证据" 是成本判断：单轮 Token 近乎线性且便宜，人工复核却随 Diff 规模与证据缺失超线性上升。只留一句"已经完成"，成本只是从夜里的 Agent 转到早上的工程师。 盈亏平衡点在证据的边际可读性，不在 Token 单价。

### 机制设定了能力上限

/loop 自动化的只是**重启与提醒**，不自动化**记忆**与**判断**：前者靠外置状态，后者靠 prompt 与 Skill 里的判据。故"无人值守"需三项一次性投入：可执行的验证方法、可机读的状态与证据格式、可回滚的权限边界——Worktree、Sandbox、Hook、Checkpoint 分段设界，外部写入另备回滚。 反向亦然：任务若无法断线无损恢复，或无人能凭证据包几分钟内决定继续、合并还是停止，就不该进定时式或主动式。

## 关联

- 同题异语种孪生页：[Claude官方教你用 Loop如何让Claude Code上夜班的四个交接点](https://github.com/QianJinGuo/wiki-public/blob/main/entities/claude官方教你用-loop如何让claude-code上夜班的四个交接点.md)（归并候选，提案卡 #11 批1）

---

