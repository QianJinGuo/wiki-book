# Hermes Agent v0.14.0 核心架构与快速上手

## Ch12.012 Hermes Agent v0.14.0 核心架构与快速上手

> 📊 Level ⭐⭐ | 21.5KB | `entities/hermes-agent-v014-core-architecture-shugex.md`

## 核心定位
Hermes Agent v0.14.0：一个**自进化 AI Agent 框架**。内置学习闭环，能从任务经验中提炼可复用的 skill，并在后续使用中自我修正。

关键数字：30+ LLM 提供商、40+ 内置工具、7 种终端后端。

## System Prompt 三层架构
设计哲学：**stable/context/volatile 分层**。

- **stable（稳定层）**：Agent 身份（SOUL.md 或默认身份）、工具使用指导、技能提示、环境提示、平台提示。生命周期内基本不变。
- **context（上下文层）**：AGENTS.md、.cursorrules 等上下文文件 + 调用方传入的 system_message。随项目/场景切换而变化。
- **volatile（易变层）**：记忆快照、用户画像、外部记忆提供者块、时间戳/会话/模型/提供商信息。每轮对话都可能不同。

**核心价值**：系统提示词在每个会话中只构建一次并缓存，后续轮次复用——对上游 LLM 提供商的 prefix cache 友好，减少重复 token 计费。

## Agent Loop：思考-行动循环
核心在 `agent/conversation_loop.py`（约 3900 行），精简逻辑：

```python
while (api_call_count < self.max_iterations
      and self.iteration_budget.remaining > 0) \
      or self._budget_grace_call:
    response = client.chat.completions.create(...)
    if response.tool_calls:
        for tool_call in response.tool_calls:
            result = handle_function_call(tool_call.name, tool_call.args, task_id)
            messages.append(tool_result_message(result))
        api_call_count += 1
    else:
        return response.content
```

关键设计：核心循环不到 10 行代码，复杂能力来自外围工具系统/提示词组装/记忆管理，而非循环本身的复杂度。

**关键参数**：

- `max_iterations`：默认 90，控制工具调用迭代次数上限
- `iteration_budget`：更细粒度的预算控制
- `_budget_grace_call`：预算耗尽后额外执行一次，避免任务中途截断
- 工具调用使用**线程池并行执行**，上限 8 个 worker

## 工具自动发现机制
采用**注册模式**：每个 `tools/*.py` 文件在导入时调用 `registry.register()` 自动注册，无需手动维护工具列表。

- `model_tools.py` 中的 `discover_builtin_tools()` 触发发现
- `toolsets.py` 定义 `_HERMES_CORE_TOOLS` 列表，约 40+ 工具
- 工具必须归属于某个 toolset 才能被 Agent 使用

**核心工具集**：web（搜索/内容提取）、terminal（命令执行）、file（文件操作）、browser（浏览器自动化，13个工具）、code_execution（Python脚本执行）、delegation（子代理委派）、skills（技能管理）、memory（持久化记忆）、todo（任务规划）。

## 安装方式
|| 方式 | 命令 | 适用场景 ||
||------|------|---------|
|| 一键安装 | `curl -fsSL .../install.sh \| bash` | 快速体验，Linux/macOS/WSL2/Termux ||
|| pip | `pip install hermes-agent && hermes postinstall` | 已有 Python 环境 ||
|| 贡献者路径 | `git clone + ./setup-hermes.sh` | 修改源码或阅读代码 ||

## 源码目录结构
```
hermes-agent/
├── run_agent.py          # AIAgent 核心类（~4100 行）
├── model_tools.py        # 工具编排层
├── toolsets.py          # 工具集定义
├── cli.py               # 交互式 CLI（~11k 行）
├── agent/               # Agent 内部模块
│   ├── system_prompt.py # 系统提示词组装
│   ├── conversation_loop.py  # 对话循环
│   └── prompt_builder.py # 提示词构建器
├── tools/               # 工具实现（自动发现）
├── gateway/             # 消息网关
└── plugins/            # 插件系统
```

## CLI 核心命令
- `hermes` — 交互式 CLI 对话
- `hermes --tui` — 现代 TUI 界面（推荐）
- `hermes setup` — 一站式配置向导
- `hermes model` — 选择 LLM 提供商和模型
- `hermes tools` — 配置启用的工具
- `hermes config set` — 设置单个配置项
- `hermes gateway` — 启动消息网关
- `hermes doctor` — 诊断问题
- `hermes --continue` — 恢复上次会话

## AIAgent 核心接口
```python

# 简单接口：返回最终响应字符串
response = agent.chat("帮我分析这段代码的性能问题")

# 完整接口：返回 final_response + messages
result = agent.run_conversation(
    user_message="分析代码",
    system_message="你是一个代码审查专家",
    conversation_history=[],
    task_id="review-001"
)
```

## 关键参数
```python
AIAgent(
    base_url=None,           # LLM 端点
    api_key=None,            # API 密钥
    provider=None,           # 提供商标识
    model="",                # 模型名称
    max_iterations=90,       # 工具调用迭代上限
    enabled_toolsets=None,   # 启用的工具集
    disabled_toolsets=None   # 禁用的工具集
)
```

## 深度分析

### 简洁核心循环的设计哲学
Agent Loop 在 `agent/conversation_loop.py`（约 3900 行），实际核心逻辑不到 10 行代码。这个设计刻意为之：循环保持极简，复杂能力通过外围工具系统/提示词组装/记忆管理实现组合扩展。这与许多 Agent 框架每轮重建完整 system prompt 的做法形成对比——后者导致缓存全部失效，而 Hermes 把 stable/volatile 分层，缓存命中率更高。

### 工具并行的资源边界
工具调用使用线程池并行执行，上限 8 个 worker。当 Agent 同时触发大量工具调用时，可能出现资源争用。`enabled_toolsets`/`disabled_toolsets` 不仅是功能裁剪，也是上下文管理手段——40+ 工具的 JSON Schema 体积不小，按场景裁剪等于变相增加可用上下文。

### 供应链安全事件的工程回应
2026 年 5 月 12 日"（官方称为 Mini Shai-Hulud 蠕虫事件"）之后，Hermes Agent 采取精确版本锁定（==X.Y.Z），不接受版本范围，mistralai PyPI 包已被隔离移除。这说明框架在快速迭代和安全性之间选择了后者——依赖审查应成为团队使用前的常规步骤。

### 多后端部署的层次覆盖
7 种终端后端（local/docker/ssh/modal/daytona/vercel_sandbox/singularity）覆盖了从本地开发到云端到 HPC 的完整场景。生产环境推荐 Docker 后端保证行为一致性；HPC 场景用 Singularity——这种分层覆盖是成熟框架的标志。

### 64K 上下文门槛的双刃剑效应
64K 是务实选择，但代价是轻量模型和小参数模型被排除在外。本地模型（llama.cpp/Ollama）需要手动设置 `--ctx-size 65536` 或 `-c 65536`。选择 Hermes 意味着接受这个硬件门槛。

## 实践启示

1. **快速上手路径**：已知提供商 → `hermes model` 直接选模型；未知 → `hermes setup` 向导
2. **工具集精细控制**：`enabled_toolsets=["web", "terminal"]` 或 `disabled_toolsets=["browser"]`，既能裁剪功能也能减少 tool schema 上下文占用
3. **delegation + code_execution 建议搭配使用**，形成完整的子代理执行-反馈链路
4. **生产环境用 Docker 后端**，`TERMINAL_ENV=docker`，保证团队行为一致性
5. **配置分离原则**：密钥放 `~/.hermes/.env`（chmod 600），非机密设置放 `~/.hermes/config.yaml`（可版本控制）
6. **排查流程**：先 `hermes doctor`，再按官方命令链逐层定位
7. **Windows 用户推荐 WSL2**，原生 Windows 仍在 Early Beta
8. **依赖审查**：通过贡献者路径安装后，检查 `pyproject.toml` 约 268 行的依赖版本确认无篡改

## SOUL.md 专题（术哥 2026-06-03 续篇）

术哥 2026-06-03 发布的 SOUL.md 专题深度续篇（[原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/hermes-agent-soul-md-personality-shugex.md)），把 v0.14 架构篇简述的 3 层提示词展开为**完整的身份系统专题**——SOUL.md 是如何从文件到提示词、14 personality 如何叠加、为什么需要安全扫描、容器为什么不能自改身份。

### 核心命题

**同一个 AI Agent，在项目 A 风格克制、项目 B 突然絮叨——不是模型问题，是人格定义方式问题**。

大部分框架把身份/风格/项目规范塞在一个 system prompt。Hermes 用三层分工：
- **SOUL.md** → 身份（人走到哪都一样）
- **AGENTS.md** → 项目（管项目级，cwd 向上发现）
- **/personality** → 临时风格切换（不修改文件，叠加在 context 层）

### stable 层 14 部分分解（v0.14 架构篇未展开）

stable 层不是只有 SOUL.md，由 14 部分按序拼接，**SOUL.md 永远在 #1**：

| # | 部件 | 作用 |
|---|------|------|
| 1 | **SOUL.md 内容**（或 `DEFAULT_AGENT_IDENTITY` 回退） | 身份基线 |
| 2 | `HERMES_AGENT_HELP_GUIDANCE` | 引导用户了解 Hermes 配置 |
| 3 | `TASK_COMPLETION_GUIDANCE` | 任务完成/反虚构引导 |
| 4 | 工具感知行为引导 | 记忆/搜索/技能/Kanban（按条件注入）|
| 5 | `COMPUTER_USE_GUIDANCE` | macOS 计算机使用引导 |
| 6 | Nous 订阅提示 | 商业订阅信息 |
| 7 | `TOOL_USE_ENFORCEMENT_GUIDANCE` | 工具使用强制 |
| 8 | 模型特定操作引导 | Google/OpenAI 模型特殊处理 |
| 9 | 技能系统提示 | skills 列表 |
| 10 | 模型身份覆盖 | Alibaba 等特殊提供商 |
| 11 | 环境提示 | WSL/Termux 等 |
| 12 | Python 工具链探针 | Python 环境检查 |
| 13 | 活跃配置文件提示 | 当前 profile 名 |
| 14 | 平台特定格式提示 | Feishu/Telegram 等 |

**为什么 SOUL.md 必须在 #1**：后续所有引导都以 SOUL.md 身份为前提。放后面 → 引导以默认身份运行，与 SOUL.md 风格冲突。

### SOUL.md 加载链路（`load_soul_md()` 7 步）

源码 `agent/prompt_builder.py`：

```python
def load_soul_md() -> Optional[str]:
    ensure_hermes_home()                              # 1. 确保 HERMES_HOME 存在
    soul_path = get_hermes_home() / "SOUL.md"         # 2. 只认 HERMES_HOME，不搜 cwd
    if not soul_path.exists(): return None            # 3. 文件不存在 → None
    content = soul_path.read_text(...).strip()        # 4. 读取去空白
    if not content: return None                       # 5. 空文件 → None
    content = _scan_context_content(content, ...)     # 6. 安全扫描
    content = _truncate_content(content, ...)         # 7. 截断
    return content
```

**关键设计**：

| 决策 | 原因 |
|------|------|
| **只认 HERMES_HOME** | "If Hermes loaded SOUL.md from whatever directory you happened to launch it in, your personality could change unexpectedly between projects." |
| **不覆盖已有 SOUL.md** | `_ensure_default_soul_md()` 只在文件不存在时创建，不会每次启动检查内容是否是默认的，不会覆盖你的修改 |
| **原样注入不包装** | `stable_parts.append(_soul_content)` 直接 append；测试 `test_soul_md_has_no_wrapper_text()` 断言无 ## 包装——包装会干扰模型注意力 |
| **空文件返回 None** | 触发 `DEFAULT_AGENT_IDENTITY` 回退："You are Hermes Agent, an intelligent AI assistant created by Nous Research..." |

**与 AGENTS.md 行为对比**：AGENTS.md 从 cwd 向上遍历到 git root（管项目级，人换项目行为可换）。SOUL.md 锁 HERMES_HOME（管人，人走到哪身份都一样）。

### 安全扫描（`_scan_context_content`）

```python
def _scan_context_content(content: str, filename: str) -> str:
    findings = _scan_for_threats(content, scope="context")
    if findings:
        return f"[BLOCKED: {filename} contained potential prompt injection]"
    return content
```

**`context` scope 覆盖**：经典注入、promptware/C2、角色扮演劫持。
**不用 `strict` scope**：SSH 后门/持久化/数据泄露 URL 检测对用户自写文件太激进易误报。

**完全阻止，不是警告**：检测到威胁 → 返回 `[BLOCKED: ...]` 占位符（不是删掉可疑部分继续用，是直接拦）。所有上下文文件（AGENTS.md/CLAUDE.md/.cursorrules）过同一扫描，**都用 `context` scope**。

**截断策略**：`_truncate_content()` 保留**头部+尾部**，中间插入截断标记。两头保留意味着：开头身份描述 + 结尾风格约束都被保留，砍掉中间可能不关键的内容。

### 14 内置 personality + overlay 机制

源码 `cli.py` 406-421：

| 类型 | 名称 |
|------|------|
| **实用型**（5）| helpful、concise、technical、creative、teacher |
| **趣味型**（7）| kawaii、catgirl、pirate、shakespeare、surfer、noir、uwu |
| **特殊型**（2）| philosopher、hype |

**自定义**（`config.yaml`）：
```yaml
agent:
  personalities:
    codereviewer: >  # 简单 string
      You are a meticulous code reviewer...
    coder:           # dict 格式，更细粒度
      description: "Expert programmer"
      system_prompt: "You are an expert programmer."
      tone: "technical"
      style: "concise"
```

**`/personality` overlay 执行流程**（`_handle_personality_command()`）：
1. 从 `self.personalities` 字典查找
2. 写入 `self.system_prompt`（`agent.system_prompt` 配置项）
3. **`self.agent = None`**——强制下次对话时重新初始化
4. 持久化到 `config.yaml` 的 `agent.system_prompt`

**第 3 步关键**：不是重启整个 Agent，而是让它在下次需要时重新组装系统提示词。重新组装时新 personality 注入 context 层（SOUL.md 之后）。

**Gateway 模式非破坏性**：`tui_gateway/server.py` 的 `_apply_personality_to_session()` 往会话历史插系统消息 `[System: The user has changed the assistant's personality. ...]`。**保留历史，不重置会话**——切换 personality 不破坏已有对话。

**清除**：`/personality none` / `default` / `neutral` → 重置 `system_prompt` 并触发重建 → 恢复 SOUL.md 基线。

### SOUL.md vs AGENTS.md：判断准则

**官方原话**：
> "If it should follow you everywhere, it belongs in SOUL.md. If it belongs to a project, it belongs in AGENTS.md."

**判断方法**：**关闭所有项目、只开空白对话，还希望 Agent 保持这个行为吗？**
- 是 → SOUL.md
- 不是 → AGENTS.md

| 维度 | SOUL.md | AGENTS.md |
|------|---------|-----------|
| 管 | 身份、语气、沟通风格 | 项目架构、编码规范、工具偏好 |
| 作用域 | 所有项目、所有会话 | 仅当前项目 |
| 位置 | `$HERMES_HOME/SOUL.md` | `$CWD/AGENTS.md`（向上遍历到 git root）|
| 加载层 | stable Slot #1 | context 层 |

**常见错误**：
- ❌ "团队用英文" → SOUL.md（导致个人项目也被强制英文）
- ❌ "友好鼓励语气" → AGENTS.md（切项目语气就变）

**跨框架兼容**：Hermes 主动兼容 CLAUDE.md 和 .cursorrules——项目根目录有这些文件且无更高优先级上下文文件时自动加载。**从 Claude Code 迁移只需额外创建 SOUL.md 管身份**。从 OpenClaw 迁移更简单——`hermes claw migrate` 一条命令搬配置和数据，SOUL.md 自动导入。

### 特殊执行模式的继承规则

| 模式 | 是否继承 SOUL.md | 原因 |
|------|-----------------|------|
| **主 Agent 对话** | ✅ 继承 | 默认行为 |
| **Cron 任务** | ✅ 继承 | `cron/scheduler.py:1654` `load_soul_identity=True`——定时任务也是你派出去的 |
| **子代理/委托** | ❌ 不继承 | `cli.py:3161` 用 `DEFAULT_AGENT_IDENTITY`——子代理是工具，不应有人格偏好（否则搜索子 Agent 突然 shakespeare 风格）|
| **`HERMES_IGNORE_RULES=1`** | ❌ 跳过所有 | 仅调试/隔离测试场景 |
| **多 Profile** | ✅ 各自独立 | `~/.hermes/profiles/<name>/` 各自有 SOUL.md——切换 Profile 切整个身份体系 |

**容器写入保护**：`tests/agent/test_file_safety_container_mirror.py` 的 `classify_container_mirror_target()` 检测对 `profiles/*/SOUL.md` 的写入尝试。**Hermes 文件安全机制阻止 Agent 通过容器路径篡改自己的 SOUL.md**——防止 Agent 自我修改身份（不能让它自己删自己的约束）。

### 最佳实践

**SOUL.md 模板**（官方示例）：
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

**不写**：项目指令（→ AGENTS.md）/ 临时风格（→ /personality）/ 敏感信息。

**与 /personality 配合**：
- SOUL.md = 基线（直接、不废话、技术导向）
- 代码审查 → `/personality technical`
- 头脑风暴 → `/personality creative`
- 切完不用手动恢复 → `/personality none` 自动回基线

**迭代优化**：
1. 默认身份跑几天 → 记录不满意的地方
2. SOUL.md 加针对性规则 → 跑几天看效果
3. 重复

**好规则特征**：不依赖特定项目/话题，描述沟通偏好。"Push back when something is a bad idea" 写代码写文章都适用。

### 跨框架迁移对照表

| 你在想什么 | 放在 Hermes 哪里 |
|-----------|------------------|
| "Agent 回复更直接" | SOUL.md |
| "这个项目用 TypeScript" | AGENTS.md |
| "今天用海盗风格" | /personality pirate |
| "团队代码规范 ESLint" | AGENTS.md |
| "Agent 不应过度讨好" | SOUL.md |

## 相关主题
- [Hermes Agent Tool System Architecture](/ch04-418-hermes-agent/) — Hermes Agent 工具系统架构专篇（术哥，2026-05-23）— 工具注册/执行/生命周期管理
- [Hermes Agent Goal And Kanban](/ch04-418-hermes-agent/) — Hermes Agent goal 与 Kanban 集成
- [Hermes Agent](/ch04-418-hermes-agent/) — Hermes Agent 自进化机制

---

