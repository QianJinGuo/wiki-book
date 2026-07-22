---
source_url: https://unknown/hermes-agent-v014-architecture-shugex
tags: [article]
ingested: 2026-05-01
sha256: 97b8ace42aa3ac8789c6afc22c46159890985c32b5064a25a324e90912451949
---
🚩 2026 年「术哥无界」系列实战文档 X 篇原创计划 第 119 篇，Hermes Agent  最佳实战「2026」系列第 2 篇

大家好，欢迎来到 术哥无界 | ShugeX ｜ 运维有术。

我是术哥，一名专注于 AI 编程、AI 智能体、Agent Skills、MCP、云原生、AIOps、Milvus 向量数据库的技术实践者与开源布道者！

Talk is cheap, let's explore。无界探索，有术而行。

Hermes Agent 架构概览图

图 1：Hermes Agent 核心架构与关键数据概览

Hermes Agent v0.14.0 的定位很明确：一个自进化 AI Agent 框架。它不是简单的 API 封装，而是内置了学习闭环 - 能从任务经验中提炼可复用的 skill，并在后续使用中自我修正。

翻了一圈官方文档和源码，发现几个数字挺扎眼的：30+ LLM 提供商、40+ 内置工具、7 种终端后端。但初次接触的人很容易被这些数字淹没，跑个 Quickstart 都可能卡住。

这篇文章从源码出发，把 Hermes Agent 的核心架构拆清楚，再一步步说明怎么正确配置和运行。

说明：本文内容基于 Hermes Agent 源码（NousResearch/hermes-agent）v0.14.0 和官方 Quickstart 文档分析整理而成，源码分析基于笔者本地仓库版本，尚未在生产环境中完成全场景验证。文中的配置模板和参数建议仅供参考，实际效果请以你的业务数据和环境测试结果为准。如果有实际使用经验，欢迎在评论区分享交流。

1. 核心机制：三层 Prompt 与思考-行动循环
System Prompt 三层架构示意图

图 2：System Prompt 三层架构 — stable/context/volatile 分层设计

Hermes Agent 的核心不是某个花哨的功能，而是它的分层设计哲学。理解了这套设计，后面的配置和调试就不会抓瞎。

System Prompt 三层架构

系统提示词在 agent/system_prompt.py 中组装，分为三层：

stable（稳定层）：Agent 身份（由 SOUL.md 或默认身份定义）、工具使用指导、技能提示、环境提示、平台提示。这些内容在 Agent 生命周期内基本不变。
context（上下文层）：AGENTS.md、.cursorrules 等上下文文件 + 调用方传入的 system_message。这一层随项目或场景切换而变化。
volatile（易变层）：记忆快照、用户画像、外部记忆提供者块、时间戳/会话/模型/提供商信息。每一轮对话都可能不同。

这个设计的核心考量是缓存命中率。系统提示词在每个会话中只构建一次并缓存，后续轮次复用 - 对上游 LLM 提供商的 prefix cache 友好，能明显减少重复 token 的计费。

对于做过多轮对话系统的开发者来说，这个设计应该不陌生。很多 Agent 框架每轮都重建完整 system prompt，导致缓存全部失效。Hermes 把不变的部分（stable）和频繁变化的部分（volatile）分开，这是一个值得借鉴的工程决策。

Agent Loop：思考-行动循环
Agent Loop 流程图

图 3：Agent Loop 思考-行动循环流程

对话循环的核心在 agent/conversation_loop.py（约 3900 行）。精简后的逻辑如下：

while (api_call_count < self.max_iterations
       and self.iteration_budget.remaining > 0) \
       or self._budget_grace_call:
    if self._interrupt_requested:
        break
    response = client.chat.completions.create(
        model=model,
        messages=messages,
        tools=tool_schemas
    )
    if response.tool_calls:
        for tool_call in response.tool_calls:
            result = handle_function_call(
                tool_call.name,
                tool_call.args,
                task_id
            )
            messages.append(tool_result_message(result))
        api_call_count += 1
    else:
        return response.content


循环逻辑清晰：发送消息，检查是否有工具调用，有则执行并继续循环，没有则返回最终响应。

有意思的是，这个号称自带学习闭环的 Agent 框架，核心循环不到 10 行代码。复杂的能力来自外围的工具系统、提示词组装和记忆管理，而不是循环本身的复杂度。这是一种刻意的设计选择 - 循环保持简洁，能力通过组合扩展。

几个关键参数值得关注：

max_iterations 默认 90，控制工具调用的迭代次数上限
iteration_budget 提供更细粒度的预算控制
_budget_grace_call 允许预算耗尽后额外执行一次，避免任务中途截断
工具调用使用线程池并行执行，上限 8 个 worker
工具自动发现机制

工具系统采用注册模式。每个 tools/*.py 文件在导入时调用 registry.register() 自动注册，不需要手动维护工具列表。

model_tools.py 中的 discover_builtin_tools() 触发发现过程，toolsets.py 定义了 _HERMES_CORE_TOOLS 列表，即所有平台共享的基础工具集，约 40+ 个工具。工具必须归属于某个 toolset 才能被 Agent 使用 - 这套设计让工具的启停变得很灵活。

核心工具集包括：web（搜索和内容提取）、terminal（命令执行）、file（文件操作）、browser（浏览器自动化，13 个工具）、code_execution（Python 脚本执行）、delegation（子代理委派）、skills（技能管理）、memory（持久化记忆）、todo（任务规划）。

2. 源码级快速上手
安装方式对比

Hermes Agent 提供三种安装路径，适用场景不同：

方式
	
命令
	
适用场景


一键安装
	curl -fsSL https://raw.githubusercontent.com/NousResearch/hermes-agent/main/scripts/install.sh | bash	
快速体验，Linux/macOS/WSL2/Termux


pip 安装
	pip install hermes-agent && hermes postinstall	
已有 Python 环境


贡献者路径
	git clone
 + ./setup-hermes.sh
	
需要修改源码或阅读代码

一键安装器会自动处理 uv、Python 3.11、Node.js、ripgrep、ffmpeg 等依赖。如果选择贡献者路径，源码目录结构如下：

hermes-agent/
├── run_agent.py          # AIAgent 核心类（~4100 行）
├── model_tools.py        # 工具编排层
├── toolsets.py           # 工具集定义
├── cli.py                # 交互式 CLI（~11k 行）
├── agent/                # Agent 内部模块
│   ├── system_prompt.py  # 系统提示词组装
│   ├── conversation_loop.py  # 对话循环
│   └── prompt_builder.py # 提示词构建器
├── tools/                # 工具实现（自动发现）
├── gateway/              # 消息网关
└── plugins/              # 插件系统

AIAgent 核心接口

AIAgent 类在 run_agent.py 中，构造函数接收约 60 个参数。日常使用只需要关注两个接口：

# 简单接口：返回最终响应字符串
response = agent.chat("帮我分析这段代码的性能问题")

# 完整接口：返回 final_response + messages
result = agent.run_conversation(
    user_message="分析代码",
    system_message="你是一个代码审查专家",
    conversation_history=[],
    task_id="review-001"
)


构造函数中几个关键参数：

AIAgent(
    base_url=None,          # LLM 端点
    api_key=None,           # API 密钥
    provider=None,          # 提供商标识
    model="",               # 模型名称
    max_iterations=90,      # 工具调用迭代上限
    enabled_toolsets=None,  # 启用的工具集
    disabled_toolsets=None  # 禁用的工具集
)


不过大多数情况下不需要直接构造 AIAgent，CLI 和网关会自动处理初始化。

CLI 核心命令
hermes              # 交互式 CLI 对话
hermes --tui        # 现代 TUI 界面（推荐）
hermes setup        # 一站式配置向导
hermes model        # 选择 LLM 提供商和模型
hermes tools        # 配置启用的工具
hermes config set   # 设置单个配置项
hermes gateway      # 启动消息网关
hermes doctor       # 诊断问题
hermes --continue   # 恢复上次会话


按照官方 Quickstart 的推荐路径，hermes setup 然后运行真实聊天验证响应，是最直接的入门方式。如果已经知道要用哪个提供商，直接 hermes model 选模型更快。

官方文档还提供了一个快速路径表，按目标选择入口：

目标
	
第一步
	
下一步


本机运行
	hermes setup	
运行真实聊天验证响应


已知提供商
	hermes model	
保存配置，开始聊天


机器人/常驻服务
	hermes gateway setup	
连接 Telegram/Discord/Slack


本地/自托管模型
	hermes model
 自定义端点
	
验证端点、模型名、上下文长度
3. 环境与配置避坑指南
配置文件结构图

图 4：配置分离原则 — .env 安全区域 vs config.yaml 共享区域

Hermes Agent 的配置遵循分离原则：密钥和令牌放 ~/.hermes/.env，非机密设置放 ~/.hermes/config.yaml。这个分离不是随便做的 - .env 文件可以设置严格权限（chmod 600），而 config.yaml 可以加入版本控制共享给团队。

三个配置加载器服务于不同运行场景：

加载器
	
使用者
	
位置

load_cli_config()	
CLI 交互模式
	cli.py
load_config()	
CLI 子命令
	hermes_cli/config.py

直接 YAML 加载
	
网关运行时
	gateway/run.py
64K 上下文：容易踩的硬性门槛

这是新手遇到频率很高的问题。Hermes Agent 要求模型至少 64,000 tokens 的上下文窗口，低于这个值的模型在启动时会被直接拒绝。

为什么不设低一点？考虑到系统提示词三层架构 + 工具 schema + 对话历史的 token 消耗，64K 是一个务实的选择。但代价也很明显 - 一些轻量模型和小参数模型直接被排除在外。

本地模型需要手动设置上下文长度：

# llama.cpp
./main --ctx-size 65536

# Ollama
ollama run model_name -c 65536

环境变量配置

.env.example 列出了 20+ 个 LLM 提供商的密钥配置。以下是常用的几个：

# LLM 提供商（选一个即可）
OPENROUTER_API_KEY=sk-or-...    # OpenRouter，200+ 模型
GOOGLE_API_KEY=AIza...          # Google AI Studio
DEEPSEEK_API_KEY=sk-...         # DeepSeek

# 工具密钥（按需配置）
EXA_API_KEY=...                 # Exa AI 搜索
FIRECRAWL_API_KEY=...           # Firecrawl 爬虫

# 终端配置
TERMINAL_ENV=local              # 后端类型
TERMINAL_TIMEOUT=60             # 命令超时（秒）


你在项目中用的是哪些 LLM 提供商？欢迎在评论区聊聊配置心得。

常见故障排查

遇到问题先跑 hermes doctor，它会在终端输出一份诊断报告。官方文档提供了一个完整的诊断命令链：

hermes doctor
→ hermes model
→ hermes setup
→ hermes sessions list
→ hermes --continue
→ hermes gateway status


常见问题对照表：

症状
	
原因
	
修复


空回复或乱码
	
提供商认证或模型选择错误
	
重跑 hermes model


自定义端点返回垃圾数据
	
base URL 错误或非 OpenAI 兼容
	
先在独立客户端验证端点


网关启动但无法收消息
	
Bot token 或白名单不完整
	
重跑 hermes gateway setup


无法恢复旧会话
	
切换了 profile 或会话未保存
	hermes sessions list
 检查

另外注意 Windows 的支持状态。官方文档明确标注原生 Windows 仍为 Early Beta，推荐使用 WSL2。如果在 Windows 上遇到莫名其妙的问题，切换到 WSL2 是排查方向。

4. 进阶最佳实践
工具集生态图

图 5：9 大核心工具集生态与关系

Prompt 缓存优化策略

前面提到系统提示词的三层架构有缓存考量，实际使用中可以进一步优化：

stable 层尽量保持不变。 身份、工具指导这些内容一旦确定就不要频繁修改。每次修改都会导致缓存失效，增加 token 消耗。

context 层按项目切换。AGENTS.md 和 .cursorrules 可以放在项目根目录，切换项目时自动生效，不需要手动更新配置。这比每次都修改 system_message 参数要优雅。

volatile 层交给框架管理。 记忆快照、用户画像这些内容由框架自动更新，不需要手动干预。如果发现上下文膨胀过快，可以检查 hermes_state.py 中的 SessionDB（基于 SQLite FTS5）是否正常压缩历史会话。

工具集精细控制

工具并行执行的上限是 8 个 worker。在复杂任务中，如果 Agent 同时触发大量工具调用，可能出现资源争用。通过 enabled_toolsets 和 disabled_toolsets 精细控制：

# 只启用 Web 搜索和终端工具
agent = AIAgent(
    enabled_toolsets=["web", "terminal"]
)

# 禁用浏览器自动化（减少 token 消耗）
agent = AIAgent(
    disabled_toolsets=["browser"]
)


从源码来看，各工具集之间是独立的，可以自由组合。但 delegation（子代理委派）和 code_execution（代码执行）建议搭配使用 - 子代理执行代码后，结果能被主代理直接利用，形成完整的执行-反馈链路。

禁用不常用的工具集还有一个隐性好处：减少发送给 LLM 的 tool schema 体积。每个工具的 JSON Schema 都会占用上下文空间，40+ 工具的 schema 加起来不是小数目。按场景裁剪工具集，等于变相增加了可用上下文。

供应链安全考量

Hermes Agent 在 2026 年 5 月 12 日经历了一次供应链安全事件（官方称为 Mini Shai-Hulud 蠕虫事件），之后采取了严格的依赖管理策略。

所有核心依赖使用精确版本锁定（==X.Y.Z），不接受版本范围。mistralai PyPI 包已被隔离移除。这个做法牺牲了一些灵活性，但从安全角度看是合理的。

如果通过贡献者路径安装，建议在 git clone 后检查 pyproject.toml 中的依赖版本，确认没有被篡改。pyproject.toml 约 268 行，核心依赖部分可以快速扫描。

多后端部署建议

7 种终端后端覆盖了从本地开发到云端部署的场景：

local：本地开发调试，默认选项，零配置
docker：隔离环境运行，适合 CI/CD 和团队标准化
ssh：远程服务器执行，适合需要特定硬件的场景
modal / daytona / vercel_sandbox：云端按需执行，按用量计费
singularity：HPC 环境专用，学术和科研场景

生产环境推荐 Docker 后端，通过 TERMINAL_ENV=docker 配置。本地开发用默认的 local 即可。如果团队有多人协作的需求，Docker 后端配合统一的工具集配置，能确保每个人跑出来的行为一致。

总结

Hermes Agent 的设计有几个值得关注的点。

分层架构做得清晰。 System Prompt 三层分离、配置文件分离、工具集独立注册 - 每一层都有明确的职责边界。这种设计对调试友好，出问题时能快速定位到具体层。

但门槛不算低。 64K 上下文的硬性要求、60 个构造参数、40+ 工具的组合配置 - 初次接触确实需要花时间理解。hermes setup 向导虽然能简化初始化流程，但理解底层原理才能在遇到问题时快速排查。

适合谁：需要在生产环境部署 Agent 的团队、想要深入理解 Agent 架构的开发者、需要多平台消息网关（Telegram/Discord/Slack）的场景。

不适合谁：只想快速调用 LLM API 的轻度用户、对 Agent 概念不熟悉的入门者。

从源码分析来看，Hermes Agent 的工程完成度相当高。核心循环保持简洁，能力通过分层组合扩展，这是一个成熟的工程选择。如果你在评估 Agent 框架，值得花时间跑通它的 Quickstart。

你觉得 Hermes Agent 的三层 Prompt 设计对其他 Agent 框架有没有参考价值？欢迎在评论区聊聊你的看法。

好啦，谢谢你观看我的文章，如果喜欢可以点赞转发给需要的朋友，我们下一期再见！敬请期待！


