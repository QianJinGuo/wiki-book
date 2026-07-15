# Claude Code 源码深度解析（13 核心机制）

## Ch01.316 Claude Code 源码深度解析（13 核心机制）

> 📊 Level ⭐⭐ | 15.4KB | `entities/claude-code-source-deep-dive-warrior.md`

> -> [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/claude-code-source-deep-dive-warrior.md)

# Claude Code 源码深度解析（13 核心机制）
> 22,873 字源码深度拆解，每节均与 Codex/OpenCode/Gemini-CLI 横向对比

## 13 个核心模块
| # | 模块 | 核心亮点 |
|---|------|---------|
| 1 | System Prompt | 6层优先级动态组装，运行时注入工具/MCP/Skill/环境/ToolSearch |
| 2 | 工具系统 | ~45工具，isConcurrencySafe只读并发/写入串行，shouldDefer+ToolSearch延迟加载 |
| 3 | 目录树感知 | 注入git状态替代目录树，每轮更新，按需探索 |
| 4 | Plan模式 | 权限层只读约束（非prompt约束），需先ToolSearch发现，UI审批退出 |
| 5 | Context压缩 | 五层递进：预算→snipCompact→microCompact(cache_edits)→contextCollapse→autoCompact |
| 6 | Sub-Agent | AgentTool统一入口，7种模式，4内置+自定义，Fork模式字节级system prompt共享 |
| 7 | 失败处理 | 宽松+API重试3次+权限拒绝渐进升级（3次连续→弹UI） |
| 8 | Hooks系统 | **Claude Code 独有**，24种事件，同步+异步，三级优先级 |
| 9 | CLAUDE.md记忆 | 多层目录递归发现合并，Compact后自动重新注入 |
| 10 | 权限治理 | 4模式，两阶段AI分类器（64t快速→4096t思考），35+白名单，Worktree沙箱 |
| 11 | 状态持久化 | JSONL transcript，50MB流式，Sidechain独立存储，/resume四步重建 |
| 12 | MCP集成 | 动态工具扩展，延迟加载+alwaysLoad，资源/认证/交互完整 |
| 13 | 预算管理 | 四维度：Token/成本(maxBudgetUsd)/工具结果/轮次 |

## 关键设计决策
1. **微压缩（microCompact）** — 利用 Anthropic API cache_edits 在服务端做注意力屏蔽，本地消息和 cache 都不变，解决压缩与 cache 的矛盾
2. **延迟加载与 prefix cache** — 通过独立 attachment（deferred_tools_delta）而非修改消息流，避免工具发现状态变化破坏 cache
3. **权限拒绝渐进升级** — 3次连续或20次累计→从自动切换到询问用户，防止分类器误判导致死锁
4. **工具结果磁盘替换** — 超限结果持久化到磁盘，模型收到路径引用而非完整内容（Read 例外 Infinity）
5. **两阶段 AI 分类器** — 先 64t 快速判断放行，再 4096t 链式推理降低误报，都利用 prompt cache 复用

## 与现有知识关联
- [Claude Code 架构解析](../ch03/076-claude-code.html) — 互补页面，本文更深更全面
- [Claude Code Prompt/Context/Harness](../ch09/060-claude-code-prompt.html) — 三层工程视角
- [Prompt Caching 工程实践](ch01/272-anthropic-prompt-caching-claude-code.html) — 与 microCompact 相关
- [Agent Harness 12 组件](../ch05/039-agent-harness.html) — Harness 通用框架
- [Claude Code Subagent 上下文卫生](../ch04/331-claude-code-subagent.html) — Sub-Agent 设计
- [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/claude-code-source-deep-dive-warrior.md)

## 深度分析
### System Prompt 动态组装的工程价值
Claude Code 的 System Prompt 体系是它与其他主流 Agent 框架差异最显著的设计之一。静态 System Prompt 的问题是：工具集一旦变化（比如接入新的 MCP 服务器），prompt 内容就过时了，需要人工维护。而 Claude Code 的运行时动态组装意味着，每次会话启动时 prompt 内容都是当前环境状态的精确映射——工具启用则描述注入，工具禁用则描述消失。这种响应式 prompt 构建是 Claude Code 能支持大规模工具生态（MCP 工具可随用随接）的技术前提。

### 工具并发调度的隐性约束
`isConcurrencySafe` 这个设计看起来是纯粹的性能优化，但它对 Agent 的工具使用策略有深刻的隐式影响：模型需要在单次回复中同时发出多个只读工具调用，才能真正利用并发能力。如果模型习惯每次只发出一个工具调用再等结果，系统的并发调度就形同虚设。这说明 Claude Code 的工具并发不是"自动并行"那么简单，它要求模型的工具调用模式与系统的并发设计对齐——这是一个需要 prompt 工程和框架设计协同优化的耦合点。

### deferred_tools_delta：Prefix Cache 与动态状态的正交解法
延迟工具发现与 Prompt Cache 的冲突是本文最值得细读的工程细节。工具被"发现"这个状态是动态的（随会话推进越来越多），但 Prompt Cache 依赖的是消息序列的稳定性——如果把动态的已发现工具列表直接插入消息流，每次工具发现都会导致 cache 失效。Claude Code 的解法是引入独立的 attachment 通道（deferred_tools_delta）来传递增量信息，而不动消息流本身。这个设计体现了一个重要的工程原则：**当两个系统维度都会变化时，让它们正交地变化，不要让它们在同一条数据通道上耦合**。

### microCompact 的注意力屏蔽原理
microCompact 是整个 Claude Code 架构中最反直觉的设计之一。它的核心洞察是：`cache_edits` 参数（`clear_tool_uses_20250919`）并不是真正"删除"那些 token，而是让 API 在本次 forward pass 中对指定位置施加 `attention_mask = 0`——即这些 token 对其他 token 的注意力贡献为零。物理上序列仍然是 `[A][B][tool_result_1000tokens][C]`，每个 token 的 position encoding 完全不变，所以 KV 缓存矩阵完全保留。这个机制之所以work，是因为 softmax 的数值精度问题：当 attention mask 不为 0 的 token 数量过少时，分配到每个 token 的注意力数值会产生精度误差。

### Plan 模式的权限层面约束
大多数 Agent 框架的 Plan 模式是在 prompt 里加一句"只读，不要写文件"，依赖模型自觉遵守。Claude Code 的 Plan 模式约束落在权限系统层面：`toolPermissionContext.mode` 被置为 `'plan'`，写操作在权限检查阶段直接被拦截，不经过模型判断。这是一个关键的设计差异：prompt 约束是可以被模型忽视的（尤其在复杂推理场景中），但权限层面的约束只有两种结果——放行或拦截，没有第三种。这种设计让 Plan 模式真正成为安全的探索阶段，而不只是"建议不要写"的善意提示。

### 五层压缩机制的层次设计
Claude Code 的五层 context 压缩不是简单的"阈值触发→压缩"，而是一套精心设计的分层兜底机制，每层处理不同类型的信息流失：①工具结果预算（单次工具输出超限→磁盘替换）解决单点过大；②snipCompact（规则打分删除不重要消息）解决历史膨胀但不调用 LLM；③microCompact（cache_edits 注意力屏蔽）解决 cache 命中与信息删除的矛盾；④contextCollapse（折叠保留近期精度）比 autoCompact 的全量摘要更保留细节；⑤autoCompact（fork 子 Agent 生成摘要）作为最后兜底。五层设计的工程哲学是：能用规则解决的不用 LLM，能不解构信息的不解构，能保留粒度的不全局压缩。

### Hooks 系统：平台化的基础设施
Claude Code 的 Hooks 系统（24 种事件，同步/异步两级响应，三级优先级配置）是它定位为"可扩展平台"而非单纯命令行工具的核心支撑。`PreToolUse` 拦截、`PostToolUse` 改写输出、`SessionStart` 替换初始消息、`PermissionRequest` 自动化授权决策——这些能力加在一起，使得 Claude Code 可以被深度定制成各种垂直场景的 Agent 底座，而不需要修改框架本身。值得注意的是 Hook 对评测公平性的影响：`--no-hooks` 模式应该是所有基准测试的标准配置，否则 Hooks 可以通过注入额外上下文或修改工具输入来影响模型的输出质量。

### 两阶段 AI 分类器的工程经济学
权限分类器先用 64t 快速判断放行，再用 4096t 链式推理降低误报——这个两阶段设计的核心是工程经济学：不是所有决策都需要深度推理。快速判断承担了绝大多数简单场景（节省 token），深度推理只在快速判断不确定时才触发。更关键的是两个阶段都利用了 Prompt Cache 复用 prompt 结构，降低了重复计算的成本。这个设计提醒我们：在 Agent 系统中，不是模型越强越好，而是不同强度的模型用在最合适的地方更划算。

### CLAUDE.md 作为跨会话记忆的局限性
CLAUDE.md 的多层目录递归发现和合并注入是一个设计精良的记忆系统，但它有一个被低估的局限性：记忆的内容质量完全取决于人写进去的东西。模型可以主动往 CLAUDE.md 写内容来实现"跨会话学习"，但这个机制只有在团队主动维护 CLAUDE.md 的内容质量时才有效。如果 CLAUDE.md 长期不更新，模型写入的内容变得陈旧，整个记忆系统就会成为一个越来越不可信的上下文来源。与其说 CLAUDE.md 是"Agent 的记忆"，不如说它更像"团队维护的工程契约"——契约的质量由人决定，Agent 只是执行者。

## 实践启示
### 1. 设计工具时声明并发安全性
在为 Claude Code 或类似框架开发自定义工具时，`isConcurrencySafe` 的声明直接影响系统的并发调度效率。只读工具（文件读取、搜索、查询）应返回 `true`，任何写操作应返回 `false`。这个声明不仅影响工具自身的执行，还影响同批次其他工具的调度顺序——如果错误声明，可能导致写操作被错误地并发执行，引发数据竞争。

### 2. 用 delay loading 降低首次响应延迟
对于用户可能不总是用到的工具（如 `EnterPlanMode`），应使用 `shouldDefer: true` 将其标记为延迟加载。这样首次请求不会携带这些工具的完整 schema，节省了 context 空间和首次 token 消耗。同时要配合 `searchHint` 字段提供精准的能力描述（3~10 词），让 `ToolSearch` 能准确匹配到这些延迟工具。

### 3. 用 Hooks 构建安全护栏
在正式环境使用 Claude Code 时，`PreToolUse` Hook 是最重要的安全配置点：拦截高风险工具（如文件删除、网络请求、外部 API 调用），在执行前增加确认或规则判断；`PermissionRequest` Hook 可以实现完全自动化的权限策略，对于已知安全的操作模式（如只读搜索），直接返回 `allow`，避免每次弹窗中断工作流。需要注意的是，这些 Hook 的行为应该在团队内文档化，避免因为 Hook 配置差异导致不同成员使用同一工具时得到不同的执行结果。

### 4. 用 CLAUDE.md 建立项目级工程契约
团队应该在每个项目根目录维护 `CLAUDE.md`，其内容应包括：代码风格规范和禁止修改的目录、常用构建和测试命令的标准写法、关键模块的架构说明和模块间依赖关系、团队协作规范（commit 格式、PR 流程、分支策略）。这些内容在每次会话启动时自动注入，模型不需要每次探索 `package.json` 或 `Makefile` 就能知道标准的构建命令。这比口头约定或文档维护更有效，因为模型会直接使用这些信息来指导自己的行为。

### 5. 理解 microCompact 边界，避免误用压缩场景
microCompact 通过 `cache_edits` 保留本地消息不变，解决的是"cache 命中"与"历史信息删除"的矛盾。但这个机制有明确的边界：只能清理 Read、Bash、Grep、Glob、WebSearch、WebFetch、FileEdit、FileWrite 这些输出可重现的工具。REPL（代码解释器）和 MCP 工具的输出无法被清理，因为它们的结果是即时的、不可重现的。如果在不应该清理的工具上误用压缩机制，可能导致模型在后续推理中缺失关键上下文。

### 6. 渐进式权限升级是防止死循环的关键
当 AI 分类器持续拒绝工具调用时，系统不会一直静默拒绝——连续 3 次或累计 20 次拒绝后，会自动从"自动拒绝"切换到"询问用户"。这个设计解决的是分类器误判导致的 Agent 死锁问题。在构建自定义权限策略时，应该在自动决策和人工介入之间预留这个渐进升级通道，而不是假设分类器永远正确。如果团队选择用规则替代 AI 分类器（比如全部 `alwaysAllow` 或 `alwaysDeny`），这个升级机制就失效了，此时需要用其他方式（如 Hook 的 `PermissionRequest` 回调）来模拟类似的升级逻辑。

### 7. Fork 模式适用于长会话上下文共享
在需要子 Agent 继承父 Agent 完整对话历史的场景（如对一个复杂问题进行多轮分析），应该使用 Fork 模式的 subagent 而不是普通 subagent。Fork 模式的子 Agent 继承字节级相同的 system prompt，这意味着父 Agent 和子 Agent 可以共享同一个 prompt cache，降低长会话的 token 成本。但需要注意：Fork 模式是实验性的，在关键任务中应该验证其行为稳定性。

### 8. 评测 Claude Code 时使用 --no-hooks
在对 Claude Code 进行基准测试或功能对比时，必须使用 `--no-hooks` 参数禁用所有 Hooks，或者在测试报告中显式说明 Hooks 配置。因为 `PreToolUse` 可以修改工具输入、`PostToolUse` 可以修改工具输出、`UserPromptSubmit` 可以注入额外上下文——这些 Hook 行为会让测试结果无法复现，破坏评测的公平性。这个原则也适用于团队内部的 prompt 调优：调优过程中如果依赖 Hooks 注入上下文，调优得到的 prompt 参数在实际生产环境中可能表现不同。

## 相关实体
- [Claude Code 源码解析：Skills/MCP/Rules 底层机制对比](../ch07/006-claude-code-skills-mcp-rules.html)
- [两万字详解Claude Code源码核心机制](../ch03/076-claude-code.html)
- [Claude Code 源码拆解：从启动到多 Agent 扩展层](../ch03/076-claude-code.html)
- [Claude Code Prompt 提示词体系源码解析](../ch09/060-claude-code-prompt.html)
- [Claude Code 接入自建开源模型：企业私有化与降本实践 | 亚马逊AWS官方博客](../ch03/076-claude-code.html)
- [深入理解 Claude Code 源码中的 Agent Harness 构建之道](ch01/459-claude-code-harness-deep-understanding.html)
- [MOC](https://github.com/QianJinGuo/wiki/blob/main/moc/claude-code-complete-guide.md)

---

