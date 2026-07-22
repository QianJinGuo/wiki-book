---
title: "开源 agentcanvas：读 Logfire 日志，一键可视化整个智能体工作流"
source: wechat
source_url: https://mp.weixin.qq.com/s/yx3xrqonDLNG_ZESt4FGlQ
author: ChallengeHub
account: ChallengeHub
account_description: "由互联网大厂和中科院研究所的算法数分小伙伴创建，专注 ML/NLP/数据分析/竞赛干货"
published: 2026-06-16T22:03:00+08:00
ingested: 2026-06-16
sha256: b044a76d13c9966a826025a2ceac63985f28c693f0f1418dee27657ba8e223b2
tags: [agent, agent-visualization, agentcanvas, logfire, pydantic-ai, opentelemetry, otel, otel-genai-span, genai-prices, trace-to-html, vstorm, observability, debugging, agent-debugging, demo-delivery]
content_type: tool-introduction
language: zh-CN
---

# 开源 agentcanvas：读 Logfire 日志，一键可视化整个智能体工作流

> 原创 / ChallengeHub / 2026-06-16 22:03 / 北京

## 核心命题

> **做过 AI 智能体项目交付的人，多半都遇到过这个尴尬时刻：跟客户开会演示，屏幕上就一个输入框、一段输出，对方礼貌地点点头，然后冒出那句灵魂拷问——"所以……它到底干了啥？"**

问题在于，智能体内部其实热闹得很：模型在反复思考、调用各种工具、有时候还会派出一个子智能体去干脏活累活，每一步都在烧 Token、烧钱。可这些过程对客户来说全是黑箱，他们只看得见一头一尾。

最近翻到一个叫 **agentcanvas** 的开源项目（github.com/vstorm-co/agentcanvas，MIT 协议），切入点挺聪明：

> **它不另起炉灶去重新监控，而是直接读取智能体本来就上报给 Logfire 的追踪日志，把整段运行过程还原成一张能拖、能缩放、能点开看细节的交互式流程图。**

一句话概括它干的事：把"用户提问 → Agent 接手 → 模型决定怎么做 → 跑了哪些工具 → 每步花了多少钱 → 最终答案"这条完整链路原原本本画出来，直接甩到会议室大屏上。客户不用懂技术，看图就明白钱花在了哪、活是怎么干完的。

## 这张图上到底能看到什么

最核心的是一张块状流程图。整次运行被铺在一块可以平移、缩放、拖拽的画布上，节点之间用箭头串起来，谁先谁后、谁调用了谁一目了然。

### 递归嵌套结构

如果某个工具本身又是另一个智能体（带着自己的一套工具），它会被画成一个嵌套的框，而且是**递归的**——系统套几层，图就跟着套几层，多复杂的结构都兜得住。

多轮对话也没被压扁，每一轮都是独立的一帧按顺序连起来，旁边还有个侧边栏，完整呈现 `用户 → 助手 → 用户 → 助手` 的对话全文。

### 每节点检查面板

光有结构还不够，agentcanvas 把每一步的"账本"也都摊开了。点开任意一个节点，会弹出一个可以拉伸大小的检查面板，里面信息相当扎实：

- 用了哪家 provider
- 模型的结束原因
- 响应 ID
- 这一步它手里到底握着哪些可用工具（**连工具描述都带上**）
- 输出模式
- 思考配置

### Token 与花费精确折算

**Token 和花费这两块算是它的招牌**：

- 输入、输出、推理三类 Token 既分步统计也汇总到整次运行
- 花费更是精确到每一次模型调用和整段流程的总价，背后是用 **Pydantic 官方的 genai-prices** 按 Token 实打实折算出来的，**而不是拍脑袋估的数**

模型的"思考"过程也没漏掉，每次模型调用上都标着它的推理摘要和推理 Token 数，对话转录里也能看到。

### 工具下钻

工具这一层同样能下钻。每个工具都能看到它这一次的输入、输出和耗时，排查"哪一步卡了""哪个工具返回得不对"会方便很多。

### 导览模式

> **导览模式** —— 专门为演示场景设计。

它内置了一套讲解：
- **自动模式**：像放幻灯片一样一步步走完整个流程
- **手动模式**：用空格、点击或方向键自己控制节奏，还能往回退

每一步都配了大白话的旁白，专门用来给客户做演示。

### 单 HTML 输出

最后一点很实在：输出就是一个**单独的 HTML 文件**。不用起服务、不用打包构建，离线能开，扔进聊天框直接发给客户就行。

## 怎么把它用起来

### 一行安装

```bash
pip install agentcanvas
```

接着在环境变量（或 `.env` 文件）里配好 `LOGFIRE_READ_TOKEN`，然后从最近一次运行直接生成报告：

```bash
agentcanvas                          # 最近一次运行 → agent_flow.html（自动用浏览器打开）
agentcanvas --list                   # 列出最近的几次运行
agentcanvas --trace-id <id>          # 指定某一次运行
agentcanvas -o report.html --no-open
```

### 当库用

如果想把它嵌进自己的代码里当库用，也很顺手：

```python
from agentcanvas import LogfireClient, parse_run, render_html

client = LogfireClient()                       # 读取 LOGFIRE_READ_TOKEN
trace_id = client.latest_trace_id()
report = parse_run(client.fetch_trace(trace_id), trace_id)
open("report.html", "w").write(render_html(report))
```

### 环境变量清单

| 变量 | 作用 |
|------|------|
| `LOGFIRE_READ_TOKEN` | 通过 Logfire Query API 读取追踪数据（**必填**） |
| `LOGFIRE_BASE_URL` | 可选的区域切换（默认美区；欧区填 https://logfire-eu.pydantic.dev） |
| `LOGFIRE_WRITE_TOKEN` | 示例智能体往 Logfire 发遥测数据时用 |
| `OPENROUTER_API_KEY` | 示例智能体（模型走 OpenRouter）用 |

### 5 分钟跑通 demo

仓库里自带了一个能直接跑的示例智能体（`assets/scripts/main.py`），它本身就是个"麻雀虽小五脏俱全"的例子：带思考能力、五个工具、一个嵌套子智能体外加多轮对话。

```bash
uv sync --all-extras --prerelease=allow                  # 安装 demo 这个 extra
uv run --prerelease=allow python assets/scripts/main.py  # 在 Logfire 里生成一段样例追踪
agentcanvas                                             # 把它画出来
```

## 背后是怎么跑通的

整条流水线其实很直白：

```
Logfire（OpenTelemetry GenAI spans）──查询──► 解析器 ──► payload ──渲染──► agent_flow.html
```

**Pydantic AI 的埋点会自动吐出 OpenTelemetry 的 GenAI span**，比如：

- `invoke_agent` — 智能体调用
- `chat` — 模型对话
- `execute_tool` — 工具执行

agentcanvas 通过 Logfire 的 **Query API**（用 SQL 加一个读取 Token）把这些 span 拉下来，再把零散的 span 树**重新拼回一个递归的工作流**——也就是"轮次 → 回合 → 工具 → 嵌套智能体"这样一层层的结构，用 `genai-prices` 给它标好价，最后渲染成那份自包含的 HTML 报告。

> **说白了，它没有给你的智能体增加任何额外负担，纯粹是"吃"你已经产生的日志。只要你的项目本来就在用 Pydantic AI + Logfire 这套，接上去几乎是零成本。**

## 代码结构一览

项目本身不大，几个模块各司其职：

| 模块 | 职责 |
|------|------|
| `logfire_client.py` | Logfire Query API 客户端（SQL → 数据行） |
| `parser.py` | span 树 → 递归 payload（轮次、回合、工具、嵌套智能体） |
| `pricing.py` | 通过 `genai-prices` 按 Token 算出精确花费 |
| `render.py` | payload → 内嵌的 HTML / CSS / JS 报告 |
| `viz.py` | 命令行入口 |
| `assets/scripts/main.py` | demo 智能体：会思考、五个工具、一个嵌套子智能体、多轮对话 |

仓库整体是**全类型标注 + 带测试的**，提 PR 之前 `make all`（ruff + mypy + pytest）必须跑过。

## 写在最后

> **这类工具的价值，往往不在技术多炫，而在它戳中了一个真实的痛点：智能体越做越复杂，可对外解释起来却越来越费劲。**

agentcanvas 的取巧之处就在于：

1. **不重复造监控** —— 把现成的 Logfire 追踪数据"翻译"成客户能看懂的画面
2. **Token 和钱算得明明白白** —— 不是估的数，是按 `genai-prices` 实打实折算的
3. **既能拿去做演示，也能自己用来排查问题** —— 导览模式 + 工具下钻 + 递归嵌套

项目采用 **MIT 协议**，由专注落地智能体工程的咨询团队 **Vstorm** 开源维护。

如果手头正好有 Pydantic AI 的项目，又苦于跟客户解释不清，倒是值得拉下来玩一玩。