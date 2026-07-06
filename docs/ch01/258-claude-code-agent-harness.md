# 深入理解 Claude Code 源码中的 Agent Harness 构建之道

## Ch01.258 深入理解 Claude Code 源码中的 Agent Harness 构建之道

> 📊 Level ⭐⭐ | 28.1KB | `entities/深入理解-claude-code-源码中的-agent-harness-构建之道.md`

# 深入理解 Claude Code 源码中的 Agent Harness 构建之道

> 来源：微信公众号"技术极简主义"——对 Anthropic Claude Code 源码泄露事件的深度技术分析
> 背景：2026 年 4 月，因 npm 打包未排除 `.map` 映射文件，1900+ TypeScript 文件、51 万行核心代码意外曝光
> URL: https://mp.weixin.qq.com/s/uHbvBbANCU7fHwvGhsr9sw

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/深入理解-claude-code-源码中的-agent-harness-构建之道.md)

## 摘要

本文基于 Claude Code 源码泄露事件，**逐行拆解一个请求从用户输入到 Agent 交付可工作的代码的完整生命周期**。核心论断是：**LLM 调用本身只是一行代码，真正让 Agent 可用的，是围绕这行代码精心设计的 Agent Harness**。整个 Agent 由 `query.ts` 中的 `query()` 异步生成器函数驱动，所有其他代码都为这个函数服务。文中详细剖析了上下文组装、API 调用、响应解析、权限检查、工具执行、结果反馈、上下文管理、终止恢复这 8 个核心步骤，以及 Plan Mode、Tasks 等高级特性。

## 核心要点

- **源码泄露事件**：Claude Code 因 npm 打包未排除 `.map` 映射文件，导致 1900+ TypeScript 文件、51 万行核心代码意外曝光；归档后数小时内收获 1100+ 星。这是迄今为止生产级 AI Agent 系统最完整的一次公开审视。
- **核心循环 8 步**：用户输入 → 上下文组装 → 调用 Claude API → 解析响应 → 检查权限 → 执行工具 → 反馈结果 → 上下文检查（太大则压缩）→ 终止。**不断循环直到任务完成**。
- **上下文组装的缓存分层**：通过 `SYSTEM_PROMPT_DYNAMIC_BOUNDARY` 标记分隔——边界之前用全局缓存范围（所有用户共享），边界之后是会话特定。**MCP 指令**是唯一非缓存部分（因为可能动态变化）。
- **CLAUDE.md 加载层级**：系统级 (`/etc/claude-code/`) → 用户级 (`~/.claude/`) → 项目级（每一层目录都有）→ 本地级（gitignore）。**遍历从根目录向下，最近的文件优先级最高**。
- **完整上下文包组成**：系统提示词 ~15K tokens + CLAUDE.md ~2K + 记忆 ~500 + MCP ~300 + 对话历史 ~5K + 用户消息 ~10。**上下文不只是"你的消息"**，是消息+项目规则+个人偏好+Agent 记忆+对话历史。
- **技能预算控制**：所有技能描述最多占上下文的 1%（200K 模型即 2000 tokens），每个技能描述不超过 250 字符。**模型可按需调用 `ToolSearchTool` 拿完整定义**。
- **43 个内置工具**：文件 I/O（FileRead/Edit/Write）、搜索（Glob/Grep）、执行（Bash）、Web（Fetch/Search）、Agents（AgentTool/SendMessage）、任务（TaskCreate/Get/Update/List）、规划（EnterPlanMode/ExitPlanMode）、用户交互（AskUserQuestion）、技能（Skill）、MCP（List/Read）等。
- **分层权限机制**：4 层检查——拒绝规则 → 允许规则 → Bash 分类器（最多 2 秒）→ 询问用户。**任一层做出决定即终止**。
- **工具并发设计**：通过 `isConcurrencySafe()` 标记——**只读操作并发执行（默认最多 10 个），写操作串行执行**。`partitionToolCalls()` 自动分批。
- **三级压缩策略**：微压缩（每轮之间，处理解释性内容）→ 会话记忆压缩（生成 `CompactBoundaryMessage` 替换原始历史）→ 反应式压缩（捕获 `prompt_too_long` 错误时现场压缩）。
- **自动压缩断路器**：连续失败 3 次后停止尝试自动压缩。历史背景：曾有 1,279 个会话连续失败 3,000+ 次，每天浪费 ~25 万次 API 调用。
- **Plan Mode 本质**：权限系统里的"状态切换"——`toolPermissionContext.mode` 切到 `'plan'`。**真正的变化不在权限，而在行为引导**——技术上 Claude 仍可用所有工具甚至改文件，但行为约束让它优先规划。

## 深度分析

### 1. Agent Harness 作为"围绕 LLM 的一行代码精心设计的工程系统"

本文最核心的论断：

> "LLM 调用本身只是一行代码，真正让 Agent 可用的，是围绕这行代码精心设计的 Agent Harness。"

**这一论断颠覆了"Agent = 强模型"的简化叙事**。模型能力固然关键，但生产级 Agent 系统的工程复杂度绝大部分来自 harness 层：上下文组装、缓存优化、权限控制、工具并发、状态管理、错误恢复、压缩策略、终止判断。

这与 [Harness Engineering Core Patterns](https://github.com/QianJinGuo/wiki/blob/main/entities/harness-engineering-core-patterns-claude-code.md) 中"Harness 是 Agent 系统的工程价值所在"的论断一致——模型是引擎，harness 是底盘、传动、刹车、仪表盘的整套工程组合。

### 2. 上下文组装：缓存分层是性能的关键

Claude Code 的上下文组装通过 `SYSTEM_PROMPT_DYNAMIC_BOUNDARY` 标记分隔缓存边界。

**这一设计的工程价值**：

| 部分 | 是否缓存 | 缓存范围 | 优化收益 |
|------|---------|---------|---------|
| 介绍/系统/任务/操作/工具/语调/会话指导/记忆/环境/总结 | 是 | 全局缓存（所有用户共享） | 跨用户复用，降低成本 |
| MCP 指令 | 否 | 每次重算 | 因 MCP 服务器可能动态连接/断开 |

**关键洞察**：边界设计决定了成本结构——把稳定的内容推到全局缓存边界之前，把动态变化的内容留在边界之后。**这是一个看似微小但影响巨大的工程决策**。

### 3. CLAUDE.md 加载层级：配置文件就是知识层级

CLAUDE.md 文件从根目录向下逐层加载：

```
系统级 → 用户级 → 项目级（每一层目录） → 本地级（gitignore）
```

**最近的目录优先级最高**——这意味着在 `src/` 子目录下可以有比根目录更具体的指令。

**@include 指令**让一个 CLAUDE.md 可以拉入其他文件（最多 5 层深度）。**`git worktree` 兼容性**——避免同一份规则被重复加载。

这与 [Claude Code Harness Deep Understanding](https://github.com/QianJinGuo/wiki/blob/main/entities/claude-code-harness-deep-understanding.md) 中关于"分层知识组织"的论述相互印证——配置文件本身构成了 Agent 的"知识层级"。

### 4. 完整上下文包：用户消息只是冰山一角

当用户输入"修复登录 bug"时，实际发送给 Claude 的内容是：

```
系统提示词:       ~15,000 tokens
CLAUDE.md 文件:   ~2,000 tokens
记忆:             ~500 tokens
MCP 指令:         ~300 tokens
对话历史:         ~5,000 tokens
你的消息:         ~10 tokens
```

**用户消息只占 0.04% 的上下文**——Agent 看到的 99.96% 是系统、规则、记忆、历史的组合。

这一数据点对 Agent 设计者极有启示：**你给 Agent 的"消息"不是你输入的那一句，而是系统为你准备的所有上下文**。这与 [Headroom Context Compression](https://github.com/QianJinGuo/wiki/blob/main/entities/headroom-context-compression-agent-vibecoder.md) 中关于"上下文是工程产物"的论述一致——上下文不是自然涌现的，而是被精心组装的。

### 5. 技能预算控制：1% 规则的设计哲学

Claude Code 用硬性预算控制技能列表大小：

- 所有技能描述加起来最多占上下文的 1%（200K 模型 = 2000 tokens）
- 每个技能描述不超过 250 字符
- 技能太多自动截断
- 需要详细信息时，模型调用 `ToolSearchTool` 按需加载

**设计哲学**：技能列表是"目录"，完整定义是"正文"。**先把目录塞进上下文，模型按需展开**——这是处理大量潜在工具/技能的标准模式。

### 6. 工具并发与一致性：isConcurrencySafe 标记的精妙

Claude Code 通过 `isConcurrencySafe()` 标记控制并发执行：

- 只读操作并发执行（默认最多 10 个）
- 写操作串行执行
- `partitionToolCalls()` 自动分批

**实际例子**（修复登录 bug）：

```
批次 1（并发）：GrepTool, GrepTool, GlobTool  ← 三个同时跑
批次 2（串行）：FileEditTool                  ← 单独执行
批次 3（并发）：FileReadTool, FileReadTool    ← 两个一起跑
```

**关键工程细节**：工具可以修改后续上下文——有些工具返回"上下文修改函数"用于更新 `ToolUseContext`。并发批次先收集修改，整批完再统一应用；串行批次每个工具执行完立刻应用。**这一设计避免了并发冲突**。

这与 [Factory Mission](https://github.com/QianJinGuo/wiki/blob/main/entities/multi-agent-mission-factory-luke-aiengineer.md) 的"串行 + 定点内部并行"策略有异曲同工之妙——但 Mission 是 Agent 间的串行，Claude Code 是工具间的串行。

### 7. 分层权限机制：4 层检查的设计取舍

Claude Code 的权限机制是分层的：

```
工具调用进来
  ↓
1. 命中拒绝规则 → 直接拦掉
  ↓
2. 命中允许规则 → 直接放行
  ↓
3. Bash 分类器 → 异步判断（最多 2 秒）
  ↓
4. 交互提示 → 再问你一次
```

**每个工具调用的实际路径**：

| 工具 | 层 1 | 层 2 | 层 3 | 层 4 | 结果 |
|------|------|------|------|------|------|
| GrepTool("login") | 通过 | 命中允许规则 | - | - | 自动通过 |
| BashTool("git status") | 通过 | 通过 | 判断为只读 | - | 自动通过 |
| BashTool("rm -rf /") | 命中拒绝规则 | - | - | - | 直接拦截 |
| FileEditTool("app.ts") | 通过 | 通过 | 通过 | 需要确认 | 弹出提示 |
| BashTool("npm install") | 通过 | 通过 | 判断不确定（超时） | 需要确认 | 弹出提示 |

**设计哲学**："该快的地方尽量快，该谨慎的地方一定谨慎"。

**Bash 分类器的 2 秒超时机制**很关键——如果分类器不能在 2 秒内判断（说明这是个复杂命令），直接进入交互提示，**不阻塞用户体验**。

### 8. 三级压缩策略：从微压缩到反应式压缩

Claude Code 不是用一种方式处理上下文膨胀，而是分层处理：

**第一级：微压缩**（每轮之间发生）
- 处理"解释性内容"
- 工具输入/输出保留
- 中间冗长解释压缩成更短总结

**第二级：会话记忆压缩**（主要策略）
- 获取最早对话历史块
- 调用 API 生成简洁摘要
- 用 `CompactBoundaryMessage` 替换原始消息
- 一条摘要消息可替代几十条历史

**第三级：反应式压缩**（出事后才顶上）
- API 返回 `prompt_too_long` 错误时触发
- 立刻捕获错误，当场压缩
- 重建请求再试

**断路器机制**：连续失败 3 次后停止自动压缩。

历史教训：1,279 个会话连续失败 3,000+ 次，每天浪费 25 万次 API 调用——**任何自动化机制都必须有熔断**。

这与 [Harness 状态边界与失败闭环](https://github.com/QianJinGuo/wiki/blob/main/entities/harness-之后-状态边界与失败闭环-若飞.md) 中关于"边界即熔断点"的工程哲学一致——失败应当被显式处理，而非无限循环。

### 9. Plan Mode：行为引导而非权限关闭

Plan Mode 的本质是"权限系统里的状态切换"——技术上 Claude 仍可用所有工具甚至改文件：

> "真正的变化，其实不在权限，而在行为引导。"

**这一设计哲学揭示了 Agent 系统设计的一个深层原则**：**不要用权限禁锢 Agent，而要用行为引导**。完全禁止 Agent 做某些事会大幅降低其能力；通过提示词和行为约束引导它"先规划再执行"是更优雅的方案。

这与 [Claude Managed Agents 企业自托管](https://github.com/QianJinGuo/wiki/blob/main/entities/claude-managed-agents-self-hosted-sandbox-enterprise.md) 中关于"Hybrid Control Plane"的设计哲学一致——**控制是分层的，不是二元的**。

### 10. 终止原因的多样性：8 种退出路径

Claude Code 列出 8 种终止原因：

- `completed` — 正常结束
- `max_turns` — 达到最大轮次
- `aborted_streaming` — 用户 Ctrl+C
- `aborted_tools` — 工具执行时被用户打断
- `prompt_too_long` — 上下文太大
- `model_error` — 模型报错
- `blocking_limit` — 禁用自动压缩时达到硬限制
- `hook_stopped` — 外部钩子要求停止

**对应不同恢复策略**：

- 提示太长：先轻量清理，再摘要压缩
- 输出超限：提高输出上限，最多 3 次重试
- 服务器过载：指数退避重试，但后台任务不重试避免放大压力
- 模型回退：切换备用模型，清理未完成内容重新跑

**关键工程原则**：后台任务不重试——"避免在高负载时把压力放大"。**生产级 Agent 必须考虑自己的失败不能加剧系统负载**。

### 11. 异步生成器作为核心架构

Claude Code 用 `query()` 异步生成器驱动整个系统：

```typescript
async function* queryLoop() {
  while (true) {
    // 一轮循环 = 一次完整 API 往返
  }
}
```

**为什么用异步生成器而非 Promise**：
- **流式输出**：边生成边输出，不用等全部完成
- **可暂停/继续**：中间可以随时暂停再继续
- **State 对象传递**：每轮决策影响下轮行为

这与 [Claude Code Harness Deep Dive](https://github.com/QianJinGuo/wiki/blob/main/entities/claude-code-harness-deep-dive-founder-park.md) 中关于"流式交互是 Agent 体验核心"的论述一致——用户感受到的"逐字输出"本质就是 `StreamEvent` 实时推送的结果。

### 12. 工具调用的"上下文修改函数"

Claude Code 工具可以返回"上下文修改函数"来影响后续执行：

- 切换工作目录
- 更新缓存
- 调整可用工具

**这一设计的工程含义**：工具不是被动响应，而是**可以主动塑造后续执行环境**。这是 Agent 系统区别于传统函数调用的关键能力。

## 实践启示

### 1. 构建 Agent Harness 的优先级

如果你的目标是构建生产级 Agent 系统，本文揭示的优先级是：

1. **上下文组装**（缓存分层）：决定成本结构
2. **权限检查**（分层机制）：决定安全边界
3. **工具执行**（并发控制）：决定性能
4. **上下文管理**（压缩策略）：决定长任务可行性
5. **终止恢复**（错误处理）：决定稳定性

### 2. 学习 Claude Code 的具体设计

- 缓存分层：用 `BOUNDARY` 标记分隔可缓存与不可缓存内容
- CLAUDE.md 层级：从根目录向下加载，最近目录优先级最高
- 工具接口：`name/description/inputSchema/execute/isConcurrencySafe/isReadOnly`
- 权限 4 层：拒绝 → 允许 → 分类器 → 询问
- 工具并发：默认 10 个并发，写操作串行
- 上下文压缩：微压缩 → 会话记忆压缩 → 反应式压缩
- 断路器：连续失败 N 次后停止自动重试

### 3. Plan Mode 的设计原则

不要试图"关闭"Agent 的能力，而要用行为引导约束其行为：

- 完全禁止 = 大幅降低能力
- 行为引导 = 优雅约束

### 4. 工具并发设计原则

- 标记 `isConcurrencySafe()` 是必须的
- 默认并发数（10）是合理上限
- 写操作必须串行
- 上下文修改要统一收集，避免并发冲突

### 5. 后台任务的重试策略

服务器过载时：前台任务重试，**后台任务不重试**——避免在高负载时放大压力。

### 6. 自动化必须有熔断

任何自动重试、循环、压缩机制都必须有：

- 失败次数上限
- 熔断后的明确退出
- 日志记录失败历史（用于事后分析）

Claude Code 的 1,279 个会话、25 万次 API 调用/天的浪费，是任何自动化系统的警示故事。

### 7. 借鉴 Claude Code 的工具系统设计

如果你的 Agent 系统涉及大量工具：

- 用统一接口（`type Tool = {...}`）抽象所有工具
- 强制实现 `isConcurrencySafe()` 和 `isReadOnly()`
- 用集中注册（`getAllBaseTools()`）管理默认工具
- 用前缀（`mcp_github_create_issue`）避免命名冲突
- 支持条件工具（按平台/模式动态出现）

### 8. 设计文档驱动的工程

Claude Code 的很多工程决策都有源码注释支撑（"BQ 2026-03-10: 1,279 sessions had 50+ consecutive failures"）。**生产级 Agent 系统的演进必须有完整的设计文档和决策追溯**。

## 相关实体

- [两万字详解 Claude Code 源码核心机制](https://github.com/QianJinGuo/wiki/blob/main/entities/两万字详解claude-code源码核心机制.md)
- [Claude Code Harness 深度解析](https://github.com/QianJinGuo/wiki/blob/main/entities/claude-code-harness-deep-dive-founder-park.md)
- [Claude Code Harness 深度理解](https://github.com/QianJinGuo/wiki/blob/main/entities/claude-code-harness-deep-understanding.md)
- [GSD 上下文管理工具](https://github.com/QianJinGuo/wiki/blob/main/entities/gsd-get-shit-done-context-management-tool.md)
- [Agent 记忆系统工程实践](https://github.com/QianJinGuo/wiki/blob/main/entities/存之有序治之有矩agent-记忆系统的工程实践与演进.md)
- [Harness Engineering Core Patterns](https://github.com/QianJinGuo/wiki/blob/main/entities/harness-engineering-core-patterns-claude-code.md)
- [Harness 状态边界与失败闭环](https://github.com/QianJinGuo/wiki/blob/main/entities/harness-之后-状态边界与失败闭环-若飞.md)
- [Factory Mission Multi-Agent 系统](https://github.com/QianJinGuo/wiki/blob/main/entities/multi-agent-mission-factory-luke-aiengineer.md)
- [Claude Managed Agents 企业自托管](https://github.com/QianJinGuo/wiki/blob/main/entities/claude-managed-agents-self-hosted-sandbox-enterprise.md)
- [OpenClaw 多 Agent 团队实践](https://github.com/QianJinGuo/wiki/blob/main/entities/openclaw-multi-agent-team-practice-v2.md)
- [OpenClaw 完全指南](https://github.com/QianJinGuo/wiki/blob/main/entities/openclaw-完全指南这可能是全网最新最全的系统化教程了32w字建议收藏.md)
- [OpenClaw 多智能体团队搭建经验](https://github.com/QianJinGuo/wiki/blob/main/entities/龙虾装上了可以用来干啥分享下我的-openclaw-多智能体团队搭建经验-v2.md)
- [Headroom Context Compression](https://github.com/QianJinGuo/wiki/blob/main/entities/headroom-context-compression-agent-vibecoder.md)
- [AI Agent Harness 构建](https://github.com/QianJinGuo/wiki/blob/main/entities/ai-agent-harness-construction-akshay-baoyu.md)
- [MOC](https://github.com/QianJinGuo/wiki/blob/main/moc/agent-engineering-guide.md)

---

