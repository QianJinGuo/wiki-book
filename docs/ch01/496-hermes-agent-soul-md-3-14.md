# Hermes Agent SOUL.md：3 层提示词、14 个内置人格，从源码看身份定制的完整设计

## Ch01.496 Hermes Agent SOUL.md：3 层提示词、14 个内置人格，从源码看身份定制的完整设计

> 📊 Level ⭐⭐ | 9.5KB | `entities/hermes-agent-soul-md-personality-shugex.md`

# Hermes Agent SOUL.md：3 层提示词、14 个内置人格，从源码看身份定制的完整设计

→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/hermes-agent-soul-md-personality-shugex.md)

## 摘要

Hermes Agent（Nous Research 开发，GitHub Star 突破 60,000）用三层提示词架构解决 Agent 身份定义问题：SOUL.md 管身份、AGENTS.md 管项目、/personality 管临时风格切换。本文从源码层面深度分析了 `load_soul_md()` 函数链路、stable 层 14 部分分解、`_scan_context_content()` 安全扫描与截断机制、14 个内置 personality + overlay 机制、SOUL.md vs AGENTS.md 职责分离、Cron/子代理/多 Profile 场景下的继承规则，以及容器写入保护等完整设计。

## 核心要点

### 三层提示词架构

Hermes 系统提示词分为三层（源码：`agent/system_prompt.py` 的 `build_system_prompt_parts()`）：

| 层级 | 内容 | 变化频率 |
|------|------|---------|
| **stable** | SOUL.md 身份、工具行为引导、技能提示、环境提示 | 会话生命周期内基本不变 |
| **context** | 用户传入的 system_message、AGENTS.md 等上下文文件 | 会话之间可能变化 |
| **volatile** | 记忆快照、USER.md 画像、时间戳、会话 ID | 每轮对话都可能不同 |

**核心目的：前缀缓存友好**。系统提示词在每个会话中只构建一次并缓存到 `agent._cached_system_prompt`，只有在上下文压缩事件后才重建。stable 不变 → 缓存命中 → 节省 token 计费。

### stable 层 14 部分分解

stable 层不是只有 SOUL.md，由 14 个部分按序拼接而成，SOUL.md 永远在 #1：

1. **SOUL.md 内容**（或 `DEFAULT_AGENT_IDENTITY` 回退）
2. `HERMES_AGENT_HELP_GUIDANCE` — 引导用户了解 Hermes 自身配置
3. `TASK_COMPLETION_GUIDANCE` — 通用任务完成/反虚构引导
4. 工具感知行为引导（按条件注入）：记忆、搜索、技能、Kanban
5. `COMPUTER_USE_GUIDANCE` — 计算机使用引导（macOS）
6. Nous 订阅提示
7. `TOOL_USE_ENFORCEMENT_GUIDANCE` — 工具使用强制引导
8. 模型特定操作引导（Google/OpenAI 模型）
9. 技能系统提示
10. 模型身份覆盖（Alibaba 等特殊提供商）
11. 环境提示（WSL、Termux 等）
12. Python 工具链探针
13. 活跃配置文件提示
14. 平台特定格式提示

**SOUL.md 必须在 #1 的原因**：后面所有引导都以 SOUL.md 身份为前提。如果放后面，这些引导会以默认身份运行，与 SOUL.md 风格冲突。

### SOUL.md 加载流程

源码位置：`agent/prompt_builder.py` 的 `load_soul_md()` 函数。关键设计点：

- **只认 HERMES_HOME，不认 cwd**：`soul_path = get_hermes_home() / "SOUL.md"` 写死路径。官方解释："If Hermes loaded SOUL.md from whatever directory you happened to launch it in, your personality could change unexpectedly between projects."
- **回退到默认身份**：如果返回 None（文件不存在/空/被拦截），使用 `DEFAULT_AGENT_IDENTITY`
- **自动播种**：首次运行时 `_ensure_default_soul_md()` 只在 SOUL.md 不存在时创建，已有文件永远不会被覆盖
- **原样注入，不加包装**：`stable_parts.append(_soul_content)` 直接 append，不加 "## SOUL.md" 包装——SOUL.md 本身就是给模型看的身份描述，加包装会干扰模型注意力

这与 [Claude Code 源码分析](ch03/075-claude-code.md) 中的 AGENTS.md 加载机制形成对比——AGENTS.md 从工作目录向上遍历到 git root 发现，而 SOUL.md 管人，人走到哪身份都一样。

## 深度分析

### 安全扫描：防注入第一道门

SOUL.md 是用户写的文件，原样注入到系统提示词。如果有人写入"忽略之前的所有指令"等注入指令，Agent 会被劫持。Hermes 用 `_scan_context_content()` 应对：

- 使用 `context` scope 威胁模式库：覆盖经典注入模式、promptware/C2 模式、角色扮演劫持
- **不使用 `strict` scope**（SSH 后门/持久化/数据泄露 URL 检测）——对用户写的上下文文件太激进易误报
- **完全阻止，不是警告**：检测到威胁 → 返回 `[BLOCKED: ...]` 占位符，直接拦住（因为内容原样进入系统提示词，没有第二次处理机会）

截断机制 `_truncate_content()` 保留头部和尾部，中间插入截断标记——开头身份描述 + 结尾风格约束都被保留，砍掉中间可能不那么关键的内容。

这种安全设计与 [Hermes Agent v0.14 核心架构](ch01/217-0.md) 中讨论的整体安全模型一致。

### /personality 命令：14 个内置人格 + 自定义

SOUL.md 是持久人格基线。临时换风格用 `/personality`。

**14 个内置 personality**（源码：cli.py 406-421）：

| 类型 | 名称 | 定位 |
|------|------|------|
| 实用型 | helpful、concise、technical、creative、teacher | 日常工作 |
| 趣味型 | kawaii、catgirl、pirate、shakespeare、surfer、noir、uwu | 风格化对话 |
| 特殊型 | philosopher、hype | 深度思考/极度热情 |

**overlay 机制（不是替换）**：`/personality` 在 context 层注入，位于 SOUL.md 之后。SOUL.md 定义"Agent 是谁"，/personality 定义"这次对话用什么语气"——两者共存。

关键实现细节：`_handle_personality_command()` 设置 `self.agent = None`，强制 Agent 在下次对话时重新初始化。重新初始化时会重新组装系统提示词，此时新 personality 注入 context 层。

**Gateway 模式非破坏性**：`tui_gateway/server.py` 的 `_apply_personality_to_session()` 在会话历史中插入系统消息，保留历史不重置会话——切换 personality 不破坏已有对话。

### SOUL.md vs AGENTS.md：职责分离

官方一句话准则：
> "If it should follow you everywhere, it belongs in SOUL.md. If it belongs to a project, it belongs in AGENTS.md."

| 维度 | SOUL.md | AGENTS.md |
|------|---------|-----------|
| 管 | 身份、语气、沟通风格 | 项目架构、编码规范、工具偏好 |
| 作用域 | 所有项目、所有会话 | 仅当前项目 |
| 位置 | `$HERMES_HOME/SOUL.md` | `$CWD/AGENTS.md` |
| 加载层 | stable 层（Slot #1） | context 层 |

**跨框架兼容**：Hermes 主动兼容 CLAUDE.md 和 .cursorrules——如果项目根目录有这些文件且无更高优先级上下文文件，Hermes 自动加载。从 Claude Code/Cursor 迁移项目配置基本无缝衔接。

### 特殊执行模式：继承规则

- **Cron 任务**：继承 SOUL.md（`load_soul_identity=True`）。设计意图：定时任务也是你派出去的，带着你的身份去干活
- **子代理/委托模式**：不继承 SOUL.md，使用 `DEFAULT_AGENT_IDENTITY`。理由：子代理是主 Agent 的工具，不需要也不应该有人格偏好
- **多 Profile 系统**：每个 Profile 位于 `~/.hermes/profiles/<name>/`，拥有独立 SOUL.md、config.yaml、skills、cron、memories。切换 Profile = 切换整个身份体系
- **容器写入保护**：`classify_container_mirror_target()` 检测对 `profiles/*/SOUL.md` 的写入尝试，阻止 Agent 通过容器路径篡改自己的 SOUL.md——防止 Agent 自我修改身份

## 实践启示

### SOUL.md 写什么

官方示例模板强调三个特征：跨上下文稳定、足够广泛适用于多种对话、足够具体能实质性塑造风格。典型内容包括人格定义、沟通风格、回避事项和技术立场。

### 不写什么

- ❌ 项目指令（框架/端口/目录结构）→ AGENTS.md
- ❌ 临时风格（今天想活泼点）→ /personality
- ❌ 敏感信息（API Key/密码）

### 跨框架迁移对照表

| 你在想什么 | 放在 Hermes 哪里 |
|-----------|------------------|
| "Agent 回复更直接" | SOUL.md |
| "这个项目用 TypeScript" | AGENTS.md |
| "今天用海盗风格" | /personality pirate |
| "团队代码规范 ESLint" | AGENTS.md |
| "Agent 不应过度讨好" | SOUL.md |

从 Claude Code 迁移：CLAUDE.md 留项目根目录自动识别，只需额外创建 SOUL.md 管身份。

## 相关实体

- [Hermes Agent V014 Architecture Shugex](ch01/217-0.md)
- [两万字详解Claude Code源码核心机制](ch03/075-claude-code.md)
- [深入理解 Claude Code 源码中的 Agent Harness 构建之道](ch03/075-claude-code.md)
- [From Prompt To Harness Claude Official](ch05/009-harness.md)
- [Harness Engineering 核心模式](https://github.com/QianJinGuo/wiki/blob/main/concepts/harness-engineering-framework.md)

---

