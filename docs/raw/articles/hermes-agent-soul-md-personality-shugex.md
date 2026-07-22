---
source_url: "https://mp.weixin.qq.com/s/_xojuGE6fWX4LiaHj38njQ""
ingested: 2026-06-26
sha256: 0f05dbfbff7065f1
---

# Hermes Agent SOUL.md：3 层提示词、14 个内置人格，从源码看身份定制的完整设计

> 来源：术哥无界 | 作者：术哥（运维有术） | 2026-06-03 08:30 山东
> 「术哥无界」系列第 129 篇，Hermes Agent 最佳实战「2026」系列第 8 篇
> 原文地址：https://mp.weixin.qq.com/s/_xojuGE6fWX4LiaHj38njQ

## 核心命题

同一个 AI Agent，在项目 A 里回复得专业克制，到了项目 B 却突然变得絮絮叨叨——**这不是模型的问题，是人格定义方式的问题**。

大部分 Agent 框架把身份、风格、项目规范全塞在一个 system prompt 里。Hermes Agent 用三层架构解决：
- **SOUL.md** 管身份
- **AGENTS.md** 管项目
- **/personality** 管临时风格切换

三者各司其职，互不干扰。

Hermes Agent 是 Nous Research 开发的开源 AI Agent（GitHub Star 已突破 60,000），支持 200+ 大模型和 15+ 消息平台。

## 1. 三层提示词架构

Hermes 系统提示词分为三层（源码：`agent/system_prompt.py` 的 `build_system_prompt_parts()`）：

| 层级 | 内容 | 变化频率 |
|------|------|---------|
| **stable** | SOUL.md 身份、工具行为引导、技能提示、环境提示 | 会话生命周期内基本不变 |
| **context** | 用户传入的 system_message、AGENTS.md 等上下文文件 | 会话之间可能变化 |
| **volatile** | 记忆快照、USER.md 画像、时间戳、会话 ID | 每轮对话都可能不同 |

**核心目的：前缀缓存友好**。系统提示词在每个会话中只构建一次并缓存到 `agent._cached_system_prompt`，只有在上下文压缩事件后才重建。stable 不变 → 缓存命中 → 节省 token 计费（Anthropic prompt caching 等）。

**测试覆盖**：`test_system_prompt.py` 确认三层按序拼接，stable 层的 SOUL.md 永远在第一个位置。

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

**为什么 SOUL.md 必须在 #1**：后面所有引导都以 SOUL.md 身份为前提。如果放后面，这些引导会以默认身份运行，与 SOUL.md 风格冲突。

## 2. SOUL.md 加载流程

源码位置：`agent/prompt_builder.py` 的 `load_soul_md()` 函数。

```python
def load_soul_md() -> Optional[str]:
    # 1. 确保 HERMES_HOME 目录存在
    ensure_hermes_home()
    
    # 2. 只从 HERMES_HOME 加载，不搜索当前工作目录
    soul_path = get_hermes_home() / "SOUL.md"
    
    # 3. 文件不存在 → 返回 None
    if not soul_path.exists():
        return None
    
    # 4. 读取并去除首尾空白
    content = soul_path.read_text(encoding="utf-8").strip()
    
    # 5. 空文件也返回 None
    if not content:
        return None
    
    # 6. 安全扫描
    content = _scan_context_content(content, "SOUL.md")
    
    # 7. 截断
    content = _truncate_content(content, "SOUL.md")
    
    return content
```

### 关键设计点

**只认 HERMES_HOME，不认 cwd**：`soul_path = get_hermes_home() / "SOUL.md"` 写死路径。官方解释："If Hermes loaded SOUL.md from whatever directory you happened to launch it in, your personality could change unexpectedly between projects."

测试 `test_loads_soul_md_from_hermes_home_only()` 验证：在 `HERMES_HOME` 和 cwd 各放一个 SOUL.md，只有 HERMES_HOME 的被加载。

**对比 AGENTS.md 行为**：AGENTS.md 是从工作目录向上遍历到 git root 发现的（管项目级）。SOUL.md 管人，人走到哪身份都一样。

**回退到默认身份**：如果返回 None（文件不存在/空/被拦截），使用 `DEFAULT_AGENT_IDENTITY`：
```
"You are Hermes Agent, an intelligent AI assistant created by Nous Research.
You are helpful, knowledgeable, and direct."
```

**自动播种**：首次运行时 `_ensure_default_soul_md()` 在 `ensure_hermes_home()` 中被调用，**只在 SOUL.md 不存在时创建**——已有文件永远不会被覆盖。不会每次启动检查内容是否是默认的，也不会覆盖你的修改。

**原样注入，不加包装**：`stable_parts.append(_soul_content)` 直接 append，不加 "## SOUL.md" 包装。测试 `test_soul_md_has_no_wrapper_text()` 断言无包装——SOUL.md 本身就是给模型看的身份描述，加包装会干扰模型注意力。

## 3. 安全扫描：防注入第一道门

SOUL.md 是用户写的文件，原样注入到系统提示词。如果有人写入"忽略之前的所有指令"等注入指令，Agent 会被劫持。Hermes 用 `_scan_context_content()` 应对：

```python
def _scan_context_content(content: str, filename: str) -> str:
    findings = _scan_for_threats(content, scope="context")
    if findings:
        return f"[BLOCKED: {filename} contained potential prompt injection]"
    return content
```

扫描使用 `context` scope 威胁模式库：覆盖经典注入模式、promptware/C2 模式、角色扮演劫持。**不使用 `strict` scope**（SSH 后门/持久化/数据泄露 URL 检测）——对用户写的上下文文件太激进易误报。

**完全阻止，不是警告**：检测到威胁 → 返回 `[BLOCKED: ...]` 占位符。不是删掉可疑部分继续用，是直接拦住（因为内容原样进入系统提示词，没有第二次处理机会）。

所有上下文文件（AGENTS.md、CLAUDE.md、.cursorrules）都过同一扫描，但都用 `context` scope。

### 截断机制

`_truncate_content()` 保留头部和尾部，中间插入截断标记。**两头保留策略**：开头身份描述 + 结尾风格约束都被保留，砍掉中间可能不那么关键的内容。

**官方建议**：SOUL.md 不应写太长。理想特征是"跨上下文稳定、足够广泛适用于多种对话、足够具体能实质性塑造风格"——满足这三条的文本通常不会太长。

## 4. /personality 命令：14 个内置人格 + 自定义

SOUL.md 是持久人格基线。临时换风格（代码审查用严厉语气、创意讨论用活泼语气）→ 用 `/personality`。

### 14 个内置 personality（源码：cli.py 406-421）

| 类型 | 名称 | 定位 |
|------|------|------|
| 实用型 | helpful、concise、technical、creative、teacher | 日常工作 |
| 趣味型 | kawaii、catgirl、pirate、shakespeare、surfer、noir、uwu | 风格化对话 |
| 特殊型 | philosopher、hype | 深度思考/极度热情 |

`/personality pirate` 让 Agent 用海盗风格回复。`/personality shakespeare` 跑代码审查输出很戏剧——但干活还是 `technical` 更靠谱。

### 自定义 personality（config.yaml）

```yaml
agent:
  personalities:
    # 简单 string 格式
    codereviewer: >
      You are a meticulous code reviewer...
    
    # dict 格式，更细粒度
    coder:
      description: "Expert programmer"
      system_prompt: "You are an expert programmer."
      tone: "technical"
      style: "concise"
```

### overlay 机制（不是替换）

`/personality` 在 context 层注入，位于 SOUL.md 之后。**SOUL.md 定义"Agent 是谁"，/personality 定义"这次对话用什么语气"**——两者共存。

`_handle_personality_command()`（cli.py）执行流程：
1. 从 `self.personalities` 字典查找人格
2. 将 personality 文本写入 `self.system_prompt`（即 `agent.system_prompt` 配置项）
3. **设置 `self.agent = None`**——关键！强制 Agent 在下次对话时重新初始化
4. 选择持久化到 `config.yaml` 的 `agent.system_prompt` 字段

**第 3 步关键**：不是重启整个 Agent，而是让它在下次需要时重新初始化。重新初始化时会重新组装系统提示词，此时新 personality 注入 context 层。

**清除 personality**：`/personality none` / `default` / `neutral` 都能清除 overlay，恢复 SOUL.md 基准身份。

**Gateway 模式非破坏性**：`tui_gateway/server.py` 的 `_apply_personality_to_session()` 在会话历史中插入系统消息 `[System: The user has changed the assistant's personality. ...]`。**保留历史，不重置会话**——切换 personality 不破坏已有对话。

## 5. SOUL.md vs AGENTS.md：职责分离

**官方一句话准则**：
> "If it should follow you everywhere, it belongs in SOUL.md. If it belongs to a project, it belongs in AGENTS.md."

| 维度 | SOUL.md | AGENTS.md |
|------|---------|-----------|
| 管 | 身份、语气、沟通风格 | 项目架构、编码规范、工具偏好 |
| 作用域 | 所有项目、所有会话 | 仅当前项目 |
| 位置 | `$HERMES_HOME/SOUL.md` | `$CWD/AGENTS.md` |
| 加载层 | stable 层（Slot #1） | context 层 |

**判断准则**：**这个东西是不是应该跟着你走？**
- 关闭所有项目、只开空白对话，**还希望 Agent 保持这个行为**？→ SOUL.md
- **不是**？→ AGENTS.md

**常见错误**：
- ❌ 把"团队用英文回复"放 SOUL.md → 个人项目也被强制英文
- ❌ 把"友好鼓励语气"放 AGENTS.md → 切项目语气就变了

**跨框架兼容**：Hermes 主动兼容 CLAUDE.md 和 .cursorrules——如果项目根目录有这些文件且无更高优先级上下文文件，Hermes 自动加载。从 Claude Code/Cursor 迁移项目配置基本无缝衔接。

**对比 OpenClaw 迁移**：`hermes claw migrate` 一条命令搬配置和数据，SOUL.md 自动导入。

## 6. 特殊执行模式：继承规则

### Cron 任务：继承 SOUL.md

源码：`cron/scheduler.py` 1654-1659 行。
```python
# Cron jobs should always inherit the user's SOUL.md identity
load_soul_identity=True,
```

即使 Cron 跳过其他上下文文件，SOUL.md 身份仍加载。**设计意图**：定时任务也是你派出去的，带着你的身份去干活。

### 子代理/委托模式：不继承

源码：`cli.py` 3161 行。
```python
# AGENTS.md/SOUL.md/.cursorrules and persistent memory are not loaded.
```

子代理用 `DEFAULT_AGENT_IDENTITY`，不加载 SOUL.md。**理由**：子代理是主 Agent 的工具，不需要也不应该有人格偏好。否则搜索子 Agent 突然用 shakespeare 风格返回结果，对话就乱了。

**环境变量 `HERMES_IGNORE_RULES=1`**：跳过所有上下文文件（AGENTS.md、SOUL.md、.cursorrules）和持久记忆。**仅用于调试和隔离测试**。

### 多 Profile 系统

每个 Profile 位于 `~/.hermes/profiles/<name>/`，拥有独立 SOUL.md、config.yaml、skills、cron、memories。源码 `hermes_cli/main.py` 10835 行输出：`Edit {profile_dir_display}/SOUL.md for different personality`。

**用法**：给工作、学习、个人项目各建一个 Profile，每个有不同人格。**切换 Profile = 切换整个身份体系**。

### 容器写入保护

`tests/agent/test_file_safety_container_mirror.py` 中的 `classify_container_mirror_target()` 检测对 `profiles/*/SOUL.md` 的写入尝试。**Hermes 文件安全机制阻止 Agent 通过容器路径篡改自己的 SOUL.md**——防止 Agent 自我修改身份（不能让它自己删自己的约束）。

## 7. 最佳实践

### SOUL.md 写什么

官方示例模板：
```markdown
# Personality
You are a pragmatic senior engineer with strong taste.
You optimize for truth, clarity, and usefulness over politeness theater.

## Style
- Be direct without being cold
- Prefer substance over filler
- Push back when something is a bad idea
- Admit uncertainty plainly

## What to avoid
- Sycophancy
- Hype language
- Repeating the user's framing if it's wrong

## Technical posture
- Prefer simple systems over clever systems
- Care about operational reality
- Treat edge cases as part of the design
```

### 不写什么
- ❌ 项目指令（框架/端口/目录结构）→ AGENTS.md
- ❌ 临时风格（今天想活泼点）→ /personality
- ❌ 敏感信息（API Key/密码）——虽然过安全扫描，别放

### 与 /personality 配合
- SOUL.md = 基线（直接、不废话、技术导向）
- 代码审查 → `/personality technical`
- 头脑风暴 → `/personality creative`
- 切完不用手动恢复 → `/personality none` 自动回基线

### 迭代优化方法
1. 用默认身份跑几天，感受风格
2. 记录不满意的地方（太啰嗦？太讨好？）
3. 在 SOUL.md 针对性加规则
4. 跑几天看效果
5. 重复

**好规则特征**：不依赖特定项目/话题，描述沟通偏好。"Push back when something is a bad idea" 写代码写文章都适用。

### 跨框架迁移对照表

| 你在想什么 | 放在 Hermes 哪里 |
|-----------|------------------|
| "Agent 回复更直接" | SOUL.md |
| "这个项目用 TypeScript" | AGENTS.md |
| "今天用海盗风格" | /personality pirate |
| "团队代码规范 ESLint" | AGENTS.md |
| "Agent 不应过度讨好" | SOUL.md |

从 Claude Code 迁移：CLAUDE.md 留项目根目录自动识别，**只需额外创建 SOUL.md 管身份**。

## 与现有 wiki 实体的关系

本文是 [[entities/hermes-agent-v014-core-architecture-shugex|Hermes Agent v0.14.0 核心架构]]（术哥，2026-05-23）的**SOUL.md 专题深度续篇**——同作者同系列（Hermes Agent 最佳实战 2026）。

| 维度 | v0.14 架构篇 | 本文 SOUL.md 专题 |
|------|--------------|------------------|
| 时间 | 2026-05-23 | 2026-06-03 |
| 焦点 | 整体架构、Agent Loop、工具系统、3 层提示词简述 | SOUL.md 全链路、14 personality、安全扫描、Profile |
| 深度 | 广度覆盖（架构总览） | 深度专题（一个文件） |
| 内容 | 40+ 工具、CLI、配置 | 14 部分 stable 分解、load_soul_md() 源码、_scan_context_content、_handle_personality_command 源码 |
| 唯一性 | 框架级别 | 文件级别 |

**合并到现有 entity 的 `## SOUL.md 专题（术哥 2026-06-03 续篇）` 章节**——本文独有内容（14 部分 stable 分解、14 personality、安全扫描、容器写入保护、Profile 系统、迁移对照表）作为深度补充。
