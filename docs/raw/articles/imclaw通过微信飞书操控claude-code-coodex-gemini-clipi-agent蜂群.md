---
source: wechat
source_url: https://mp.weixin.qq.com/s/UkAX2bA0QIDFQya-F5W5DQ
tags: [wechat, article, claude, openai, gpt, agent, harness, openclaw]
ingested: 2026-05-12
feed_name: 百度Geek说
source_published: 2026-04-01
sha256: 22299d2881136441796dac333800014ae79e1218cc3bfb22408cc4548a9765f9
review_value: 5
review_confidence: 6
review_recommendation: worth-reading
---
# IMClaw：通过微信/飞书操控ClaudeCode/Codex/GeminiCLI/Pi Agent蜂群
。
点击蓝字，关注我们
作者 |  鸟窝
导读  introduction  本文介绍了一个名为 IMClaw 的开源项目，它是一个支持 ACP 协议的 AI Agent 网关，核心价值是让你通过微信、飞书等 IM 工具，远程操控 ClaudeCode、Codex、Gemini CLI 等十余种 AI Agent 在服务器上工作。
_ 全文 5635 字，预计阅读时间 8 分钟  _
> 一行命令，让 这些 AI Agent 在远程服务器上为你工作：
>
> https://github.com/smallnest/imclaw
>
支持的Ai Agent列表：
** ** Agent  ** ** |  ** ** Adapter  ** ** |  ** ** Wraps  ** **
---|---|---
` pi  ` |  pi-acp  |  Pi Coding Agent
` openclaw  ` |  native (  ` openclaw acp  ` )  |  OpenClaw ACP bridge
` codex  ` |  codex-acp  |  Codex CLI
` claude  ` |  claude-agent-acp  |  Claude Code
` gemini  ` |  native  (  ` gemini --acp  ` )  |  Gemini CLI
` cursor  ` |  native (  ` cursor-agent acp  ` )  |  Cursor CLI
` copilot  ` |  native (  ` copilot --acp --stdio  ` )  |  GitHub Copilot CLI
` droid  ` |  native (  ` droid exec --output-format acp  ` )  |  Factory Droid
` iflow  ` |  native (  ` iflow --experimental-acp  ` )  |  iFlow CLI
` kilocode  ` |  ` npx -y @kilocode/cli acp  ` |  Kilocode
` kimi  ` |  native (  ` kimi acp  ` )  |  Kimi CLI
` kiro  ` |  native (  ` kiro-cli-chat acp  ` )  |  Kiro CLI
` opencode  ` |  ` npx -y opencode-ai acp  ` |  OpenCode
` qoder  ` |  native (  ` qodercli --acp  ` )  |  Qoder CLI
` qwen  ` |  native (  ` qwen --acp  ` )  |  Qwen Code
` trae  ` |  native (  ` traecli acp serve  ` )  |  Trae CLI
GEEK TALK
01
为什么需要 IMClaw？
如果你是一名开发者，相信你已经体验过 Claude Code、Cursor 等 AI 编程助手的强大能力， 甚至在一些同学试用了OpenClaw和基于ClaudeCode做的Agent之后，普遍反映Claude Code更智能。但当你的项目在远程服务器上，或者你需要在多台机器之间协作时，问题就来了：
** ** 痛点一：远程服务器上的 AI 助手怎么用？  ** **
本地跑 Claude Code 很香，但生产环境在云端服务器上。想用 AI 分析线上日志、调试远程代码？抱歉，得先 SSH 上去，再想办法装 AI 工具——这一套下来，环境配置就能劝退不少人。
** ** 痛点二：多个 AI Agent 怎么统一管理？  ** **
Claude、Codex、各种 AI 工具轮番上阵，每个都有自己的 CLI 和配置方式。想在不同 Agent 之间切换？想复用会话上下文？想控制权限？这些都得自己折腾。
** ** 痛点三：安全认证怎么办？  ** **
把 AI Agent 暴露到网络上，安全问题怎么解决？谁都能调用的 AI Agent，跟裸奔的服务器有什么区别？
** ** 想法一：基于Claude Code/Codex，做一个类似OpenClaw平台该怎么做？
这也是最近我一直思索的，想利用Claude Code做一个训练推理故障分析平台，而且后台也不想绑死Claude Code，可以替换成其他的Agent比如Codex等。Claude Code可以安装在一组沙箱中，每个用户一个沙箱，沙箱中部署了Claude Code/Codex和各种Skill/工具，就类似Manus的沙箱的处理机制一样。
** ** IMClaw 就是为了解决这些问题而生的。  ** **
GEEK TALK
02
什么是 ACP 协议？
在深入了解 IMClaw 之前，我们需要先认识一下  ** ** ACP（Agent Client Protocol）协议  ** ** 。
** 2.1 ACP 协议简介  **
ACP 是一种标准化的 Agent 客户端通信协议，它定义了客户端与 AI Agent 之间的交互规范。简单来说，ACP 让不同的 AI Agent（如 Claude、Codex 等）能够通过统一的方式进行调用和管理。
在 AI Agent 快速发展的今天，各种 Agent 工具层出不穷，但它们之间缺乏统一的通信标准：
* Claude 有自己的 API 和 CLI
* OpenAI Codex 有另一套接口
* 其他 Agent 工具更是五花八门
这导致开发者需要针对每个 Agent 学习不同的使用方式，集成成本极高。ACP 协议的出现，就是为了解决这个问题——  ** ** 一套协议，多种 Agent  ** ** 。
** 2.2 ACP 的核心特性  **
** ** 1\. 标准化的消息格式  ** **
ACP 定义了统一的消息结构，包括请求、响应、错误处理等，让客户端不需要关心底层 Agent 的实现细节。
** ** 2\. 会话管理  ** **
ACP 支持会话的概念，允许用户在同一上下文中进行多轮对话，Agent 能够记住之前的交互内容。
** ** 3\. 权限控制  ** **
ACP 内置了权限请求和批准机制，Agent 在执行敏感操作（如写入文件、执行命令）前会请求用户确认。
** ** 4\. 工具调用  ** **
ACP 支持工具调用（Tool Use），Agent 可以使用预定义的工具集来完成任务，如读写文件、执行 Shell 命令、搜索代码等。
** 2.3 ACP 的应用场景  **
AI 编程助手  ** ** ：Claude Code、Cursor 等工具都在使用类似协议
自动化运维  ** ** ：让 AI Agent 执行服务器管理任务
代码审查  ** ** ：自动化代码质量检查和优化建议
文档生成  ** ** ：基于代码自动生成技术文档
数字员工  ** ** : 将业务封装成数字员工提供服务
GEEK TALK
03
acpx：ACP 协议的命令行工具
了解了 ACP 协议，接下来介绍  ** ** acpx  ** ** ——这是OpenClaw项目下一个非常有用的工具。
** 3.1 acpx 是什么？  **
acpx 是一个 Node.js 编写的命令行工具，它实现了 ACP 协议，让用户能够通过终端与各种 AI Agent 交互。你可以把它理解为一个"Agent 路由器"，它会根据你的请求选择合适的 Agent 来处理。
** 3.2 安装 acpx  **
*
    npm install -g acpx@latest
** 3.3 acpx 的核心能力  **
** ** 1\. 多 Agent 支持  ** **
acpx 支持多种 AI Agent 后端：
Claude  ** ** ：Anthropic 的 Claude 模型，擅长代码理解和生成
Codex  ** ** ：OpenAI 的代码专用模型
* 其他兼容 ACP 协议的 Agent
** ** 2\. 会话管理  ** **
    # 创建新会话acpx session create --name my-session# 查看会话列表acpx session list# 使用指定会话acpx prompt --session my-session "帮我分析这段代码"
** ** 3\. 工具集成  ** **
acpx 内置了丰富的工具集：
工具  |  功能
---|---
` Read  ` |  读取文件内容
` Write  ` |  写入文件
` Bash  ` |  执行 Shell 命令
` Grep  ` |  搜索文件内容
` Glob  ` |  文件模式匹配
** ** 4\. 权限模式  ** **
acpx 提供三种权限模式：
* ` approve-reads  ` ：读取自动批准，写入需要确认（默认）
* ` approve-all  ` ：所有操作自动批准
* ` deny-all  ` ：拒绝所有写入操作（只读模式）
** 3.4 acpx 的局限性  **
虽然 acpx 功能强大，但它有一个明显的局限：  ** ** 只能在本地使用  ** ** 。
如果你想在远程服务器上使用 acpx，你需要：
1. SSH 登录到远程服务器
2. 在远程服务器上安装 Node.js 和 acpx
3. 配置 API Key 等环境变量
4. 在远程终端中操作
这种方式不仅麻烦，而且存在安全隐患——API Key 需要存储在远程服务器上。
** ** IMClaw 正是为了解决这个问题而设计的！  ** **
GEEK TALK
04
IMClaw 是什么？
IMClaw 是一个支持  ** ** ACP 协议  ** ** 的 AI Agent 网关，它将 acpx 的能力封装成网络服务，让你可以通过网络远程调用 AI Agent。
** 4.1 核心能力  **
* 🚀  ** ** 远程访问  ** ** ：通过 CLI 即可连接远程服务器上的 AI Agent
* 🔐  ** ** 安全认证  ** ** ：支持 Token 认证，保护你的 AI Agent 不被滥用
* 💬  ** ** 多会话管理  ** ** ：会话可复用，上下文不丢失
* 🤖  ** ** 多 Agent 支持  ** ** ：Claude、Codex 等多种 Agent，一键切换
* ⚡  ** ** 轻量部署  ** ** ：单个二进制文件，无需配置文件，开箱即用
** 4.2 架构设计  **
    ┌─────────────┐                      ┌─────────────┐                      ┌─────────────┐│             │     WebSocket        │             │      ACP Protocol    │             ││ imclaw-cli  │ ◄──────────────────► │   imclaw    │ ◄──────────────────► │    acpx     ││  (本地CLI)  │     JSON-RPC         │  (网关服务) │      子进程调用       │  (AI Agent) ││             │                      │             │                      │             │└─────────────┘                      └─────────────┘                      └─────────────┘      ▲                                    ▲      │                                    │      │         网络（可跨服务器）           │      └────────────────────────────────────┘﻿
** ** 工作流程：  ** **
1. ` imclaw  ` 网关服务在远程服务器上启动，监听 WebSocket 端口
2. ` imclaw-cli  ` 在本地连接远程网关
3. 用户通过 CLI 发送请求
4. 网关将请求转发给 acpx
5. acpx 调用 AI Agent 处理请求
6. 结果沿原路返回给用户
** 4.3 相比直接使用 acpx 的优势  **
** 4.4 不止于此  **
IMClaw 还提供了 acp-remote Skill, 这也意味着你可以在OpenClaw中安装此Skill, 然后通过微信、飞书、QQ、telegram等IM工具控制沙箱中的ClaudeCode/Codex等Agent。
acp-remote Skill 通过调用 imclaw-cli 和远程沙箱中的  ** ** imclaw  ** ** (网关服务)通信。
这样我们的想象空间就很大了。我们可以在OpenClaw控制ClaudeCode/Codex等 , 也可以在ClaudeCode中控制OpenClaw/Codex等，也可以在Codex中控制OpenClaw/Codex。
我们甚至做一个IM的网关，向上连接各种IM如微信、飞书，向下通过imclaw-cli 连接各种支持imclaw网关服务，进而连接各种Agent。
事实上，这种想法一些网友也在尝试，虽然他们并没有使用ACP协议的方式，比如：
* https://github.com/Hanson/claude-client：  用手机远程写代码！通过飞书控制本地 Claude Code（当前支持飞书，后续可能支持更多 IM）
* https://github.com/op7418/CodePilot  : 让你的 ClaudeCode 变成 Openclaw（龙虾），连接飞书、Discord 远程控制
* https://code.claude.com/docs/en/remote-control  : Claude官方的远程控制，只给Pro以上的会员使用
你甚至不需要额外开发，利用OpenClaw已经能够连接IM的能力，就能远程控制ClaudecCode，而且不止ClaudeCode，而是十几个不同的Coding Agent。
GEEK TALK
05
快速安装
** 5.1 安装 acpx  **
acpx 是 IMClaw 的必需依赖，需要先安装：
*
    npm install -g acpx@latest
安装完成后，确保  ` acpx  ` 命令可用：
*
    acpx --version
** 5.2 安装 IMClaw  **
三种方式任选：
** ** 方式一：下载预编译二进制（推荐）  ** **
从  GitHub Releases  下载对应平台的压缩包，解压即可使用。
支持的平台：
* Linux (amd64, arm64)
* macOS (amd64, arm64 / Apple Silicon)
* Windows (amd64)
** ** 方式二：一键安装脚本  ** **
*
    curl -fsSL https://raw.githubusercontent.com/smallnest/imclaw/main/scripts/install.sh | bash﻿
这个脚本会自动检测你的操作系统和架构，下载对应的二进制文件并安装到  ` ~/bin  ` 目录。
** ** 方式三：Go 安装  ** **
如果你有 Go 环境：
*   *
    go install github.com/smallnest/imclaw/cmd/imclaw@latestgo install github.com/smallnest/imclaw/cmd/imclaw-cli@latest
GEEK TALK
06
五分钟上手
** 6.1 第一步：启动网关服务  **
在远程服务器上启动 imclaw：
    # 默认配置启动（监听 0.0.0.0:8080）imclaw# 指定端口和认证 Tokenimclaw --port 9000 --token your-secret-token# 查看所有参数imclaw --help﻿
服务启动后会显示：
    ╔═══════════════════════════════════════╗║          IMClaw dev                    ║║   AI Agent Gateway with ACP Protocol  ║╚═══════════════════════════════════════╝Gateway started on 0.0.0.0:8080  HTTP:      http://0.0.0.0:8080  WebSocket: ws://0.0.0.0:8080/wsUse 'imclaw-cli' to interact with the server.﻿
** ** 服务器参数说明：  ** **
** 6.2 第二步：本地连接远程  **
    # 连接远程服务器imclaw-cli --server ws://your-server:8080/ws# 带认证 Tokenimclaw-cli --server ws://your-server:8080/ws --token your-secret-token﻿
进入  ** ** 交互模式  ** ** 后，就可以像使用本地 AI 助手一样与远程 Agent 对话了：
    IMClaw CLI devConnected to ws://your-server:8080/wsSession: abc123 | Agent: claudePermissions: approve-reads | Format: textType your message and press Enter. Use /help for commands, /quit to exit.> 帮我分析一下 /var/log/nginx/error.log 里的错误﻿
交互模式效果：
** 6.3 第三步：单命令模式（推荐）  **
如果只是想执行单条命令，直接用  ` -p  ` 参数：
    # 一次性执行imclaw-cli --server ws://your-server:8080/ws -p "查看服务器磁盘使用情况"# 自动批准所有操作（适合自动化场景）imclaw-cli --server ws://your-server:8080/ws --approve-all -p "分析代码并给出优化建议"# JSON 输出（方便程序解析）imclaw-cli --server ws://your-server:8080/ws --format json -p "列出当前目录文件"
GEEK TALK
07
进阶用法
** 7.1 会话复用  **
IMClaw 支持会话复用，让 AI 记住上下文：
    # 第一次对话，会返回 session_idimclaw-cli --server ws://remote:8080/ws -p "阅读 main.go 文件"# 输出包含 session_id: xxx-xxx-xxx# 继续同一个会话imclaw-cli --server ws://remote:8080/ws --session xxx-xxx-xxx -p "这个函数有什么问题？"
会话的生命周期由服务器管理，即使你断开连接，会话仍然保持。下次连接时可以继续之前的对话。
** 7.2 多 Agent 切换  **
不同任务用不同的 Agent：
    # 使用 Claudeimclaw-cli --server ws://remote:8080/ws --agent claude -p "帮我写一个 Go 函数"# 使用 Codeximclaw-cli --server ws://remote:8080/ws --agent codex -p "分析这段代码的性能瓶颈"
支持的 Agent 类型取决于 acpx 的配置，常见的有：
* ` claude  ` ：Anthropic Claude，擅长代码理解和长上下文对话
* ` codex  ` ：OpenAI Codex，专注于代码生成
** 7.3 权限控制  **
IMClaw 提供三种权限模式，灵活控制 Agent 的行为：
** ** 1\. approve-reads（默认模式）  ** **
*
    imclaw-cli --server ws://remote:8080/ws -p "读取配置文件"
* 读取文件、搜索代码等操作自动批准
* 写入文件、执行命令等操作需要确认
* 平衡了便捷性和安全性
** ** 2\. approve-all（全自动模式）  ** **
*
    imclaw-cli --server ws://remote:8080/ws --approve-all -p "帮我重构这个模块"
* 所有操作自动批准
* 适合自动化脚本或可信环境
警告  ** ** ：Agent 可以执行任意操作，请谨慎使用
** ** 3\. deny-all（只读模式）  ** **
*
    imclaw-cli --server ws://remote:8080/ws --deny-all -p "分析代码安全性"
* 拒绝所有写入操作
* 适合安全审计、代码审查场景
* Agent 只能读取，不能修改任何内容
** 7.4 工具限制  **
你可以限制 Agent 能使用的工具：
    # 只允许读取和搜索imclaw-cli --server ws://remote:8080/ws --allowed-tools "Read,Grep,Glob" -p "分析项目结构"# 允许所有工具imclaw-cli --server ws://remote:8080/ws --allowed-tools "" -p "完全自由的 Agent"# 默认工具集：Bash,Read,Writeimclaw-cli --server ws://remote:8080/ws -p "正常操作"
** 7.5 指定工作目录  **
让 Agent 在特定目录下工作：
*
    imclaw-cli --server ws://remote:8080/ws --cwd /path/to/project -p "分析这个项目"
Agent 的所有文件操作都会相对于这个目录进行。
GEEK TALK
08
在 OpenClaw中使用 acp-remote Skill
如果你是  ** ** OpenClawd  ** ** 用户，还可以通过  ` acp-remote  ` Skill 更便捷地连接远程 IMClaw 服务，无需手动输入命令。
** 8.1 什么是 acp-remote Skill？  **
` acp-remote  ` 是IMClaw一个专为 OpenClaw 设计的 Skill，它封装了  ` imclaw-cli  ` 的调用，让你可以直接在 OpenClaw 对话中与远程 AI Agent 交互。
** 8.2 安装 Skill 依赖  **
确保已安装必要的依赖：
    # 安装 acpxnpm install -g acpx@latest# 安装 imclaw-clicurl -fsSL https://raw.githubusercontent.com/smallnest/imclaw/main/scripts/install.sh | bash﻿
** 8.3 配置环境变量  **
在  ` ~/.bashrc  ` 或  ` ~/.zshrc  ` 中配置远程服务器：
*   *
    export IMCLAW_SERVER="ws://your-server:8080/ws"export IMCLAW_TOKEN="your-secret-token"
这样 OpenClawd 就能自动获取连接信息。
如果你没有配置这些环境变量，也没有关系，第一次调用的时候OpenClaw会智能的找你询问，你按需提供就好，第一次调用成功后让OpenClaw把这些信息保存下来：
** 8.4 使用示例  **
在 OpenClaw 中，直接告诉 AI 使用 acp-remote：
*
    使用 acp-remote skill, agent用claude, 获取当前北京的天气﻿
AI 会自动：
1. 检测并安装必要的依赖（imclaw-cli、acpx）
2. 执行你的请求并返回结果
** 8.5 实际场景  **
** ** 场景一：远程日志分析  ** **
*
    用 acp-remote 分析远程服务器上的 nginx 错误日志，找出最常见的 5 种错误﻿
AI 会：
* 连接远程服务器
* 读取 nginx 错误日志
* 统计错误类型和频率
* 给出分析报告
** ** 场景二：远程代码审查  ** **
*
    用 acp-remote 连接生产服务器，审查 /app/src 目录下的代码，找出潜在的性能问题﻿
AI 会：
* 扫描指定目录的代码
* 分析代码结构和逻辑
* 识别性能瓶颈和优化点
** ** 场景三：远程调试  ** **
*
    用 acp-remote 帮我在远程服务器上调试这个内存泄漏问题，进程 PID 是 12345﻿
AI 会：
* 检查进程状态
* 分析内存使用情况
* 查看相关日志
* 提供调试建议
这样，你就可以在 OpenClaw 的对话中无缝操作远程服务器，无需切换到终端，大大提升工作效率！
** 8.6 imclaw-cli 交互模式命令  **
进入交互模式后，支持以下命令：
    > /newNew session created. Context cleared.> /agent codexSwitched to agent: codex> /sessionCurrent Session:  ID:            abc-123-def  Agent:         codex  Created:       2024-01-15 10:30:00  Last Active:   2024-01-15 10:35:00> /agentsAvailable agents:  - claude  - codex﻿
GEEK TALK
09
安全最佳实践
1\. 使用 Token 认证
*   *
    # 启动时设置强 Tokenimclaw --token "$(openssl rand -hex 32)"
###
2\. 限制网络访问
    # 只监听本地（配合 SSH 隧道使用）imclaw --host 127.0.0.1# 或使用防火墙限制访问iptables -A INPUT -p tcp --dport 8080 -s 10.0.0.0/8 -j ACCEPTiptables -A INPUT -p tcp --dport 8080 -j DROP﻿
3\. 使用只读模式进行审计
但是使用这个参数之后Claude Code能力也大打折扣。
*   *
    # 安全审计时拒绝所有写操作imclaw-cli --server ws://remote:8080/ws --deny-all -p "审计系统配置"
###
4\. 定期更换 Token
    # 使用环境变量管理 Tokenexport IMCLAW_TOKEN="$(cat /etc/imclaw/token)"imclaw --token "$IMCLAW_TOKEN"
GEEK TALK
10
写在最后
IMClaw 的设计哲学是  ** ** 简单、实用、安全  ** ** ：
简单  ** ** ：无需配置文件，命令行参数即可启动
实用  ** ** ：支持单命令模式和交互模式，满足不同场景
安全  ** ** ：Token 认证，权限控制，让你放心地远程调用 AI
可扩展  ** ** ：架构简单、易于扩展，可以作为基座创建功能更丰富的产品
无论你是想：
* 在远程服务器上使用 AI 助手
* 统一管理多个 AI Agent
* 构建 AI 驱动的自动化流程
* 在 OpenClaw 中无缝操作远程资源
IMClaw 都能帮你轻松实现。
项目完全开源，欢迎 Star、PR 和反馈！
** ** GitHub  ** ** :  https://github.com/smallnest/imclaw
END
**
[ 我用 Go 重写了一个 OpenClaw 框架：这就是 GoClaw ](<https://mp.weixin.qq.com/s?__biz=Mzg5MjU0NTI5OQ==&mid=2247606511&idx=1&sn=c1266293438ae02d8d967cbc10e7f563&scene=21#wechat_redirect>)
[ 从心理按摩到实操上手的OpenClaw全指南 ](<https://mp.weixin.qq.com/s?__biz=Mzg5MjU0NTI5OQ==&mid=2247606479&idx=1&sn=3972ed6c224b5f2a35fc295ca1c5a5cf&scene=21#wechat_redirect>)
[ 百度MEG数据中台ClickHouse在数据湖仓中的探索和应用 ](<https://mp.weixin.qq.com/s?__biz=Mzg5MjU0NTI5OQ==&mid=2247606414&idx=1&sn=83cd76168a5c1043195c9e7bf54be515&scene=21#wechat_redirect>)
[ DuClaw来了！零门槛开启自由“养虾”🦞 ](<https://mp.weixin.qq.com/s?__biz=Mzg5MjU0NTI5OQ==&mid=2247606374&idx=1&sn=d935cb0cfa068e7770bfd644d44d0c1e&scene=21#wechat_redirect>)
[ 打造高效易用的Agent Skill ](<https://mp.weixin.qq.com/s?__biz=Mzg5MjU0NTI5OQ==&mid=2247606370&idx=1&sn=c33e69854709115eb1a5a214e8bd7347&scene=21#wechat_redirect>)
一键三连，好运连连，bug不见  👇