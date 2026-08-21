---
source_url: https://mp.weixin.qq.com/s/RlgwFWpaLj2sH_pK-EZRAg
ingested: 2026-08-21
sha256: 18cfb05d2f13dffeaba245234ce09cb329a4adb426224dae08b361faaf746962
title: "从 Codex Harness 到 DSH Subagent：Agent 正在进入软件架构的新一层（若飞源码级拆解）"
author: 若飞（架构师 JiaGouX）
source: 微信公众号
type: raw
tags: [agent-runtime, harness, codex, app-server, dsh, deepseek-harness, subagent, agent-as-runtime, orchestration, claude-code, agent-execution-unit, agent-composition]
---

# 从 Codex Harness 到 DSH Subagent：Agent 正在进入软件架构的新一层

> 原始来源：https://mp.weixin.qq.com/s/RlgwFWpaLj2sH_pK-EZRAg
> 作者：若飞（架构师 JiaGouX，微信公众号，2026-08-21）
> 对象：DeepSeek Harness (DSH) 0.1.0-rc.8 的 subagent 子系统 + OpenAI Codex 平台化开放

## 核心命题

若飞把 DSH 升到 0.1.0-rc.8，看到一个关键变化：**DSH 可以直接把 Codex 和 Claude Code 叫来当 subagent**。DSH 调用的不只是另一个模型接口——一次 `subagent_codex` 调用会启动 Codex 自己的 app-server、thread、turn 和 Agent Loop。父 Agent 只是把任务交出去，真正读代码、调工具、进沙箱并处理审批的，仍是 Codex 那套完整的执行系统。

文章把「已经发生的变化」与「未来可能出现的架构」分开：前者在官方文档和代码里，后者是推演。

## 第一层：代码已经把 Agent 的执行入口打开了

### Codex 把产品背后的 Harness 露了出来

OpenAI 把 Codex 背后的 Harness 放到「平台」位置。按 OpenAI 定义，**Harness 是模型周围的执行系统**，管理对话状态、流式执行、工具、沙箱和审批策略，让任务跨过多轮模型调用继续跑。这次对外开放：Codex CLI、SDK、app-server、Skills、Plugins 等 Harness 与集成界面；模型访问和托管服务仍分开，IDE 扩展和 Codex cloud 不在开源组件里。

**app-server 是控制接口和事件转换层**，没有在 core 外面再造一套 Agent Loop。它把外部请求转换成 Thread/Turn 操作，再把核心事件整理成客户端可消费的通知。源码链路：`外部宿主 → app-server → thread/start → turn/start → run_turn → 模型采样与工具执行`。
- `thread/start`：准备配置、工作目录、沙箱、权限和工具，创建核心 Thread 并订阅事件
- `turn/start`、`turn/steer`、`turn/interrupt`：回到 Thread 操作
- `run_turn`：模型采样、工具结果回填、待处理输入、上下文压缩和取消

三种接法：`codex exec`（CI/脚本/一次性）、SDK（程序启动/恢复/流式）、app-server（thread/turn/事件/中断/审批给外部产品）。DSH 选择 app-server，因为它需要亲自创建 thread、启动 turn、等待完成并处理中断。

### DSH 没有重做 Codex，而是把它接成一个子代理

rc.8 里 Codex 和 Claude Code 是两个可安装的 Profile Bundle，安装后需在 Agent 预设中显式打开工具，父 Agent 会看到 `subagent_codex`、`subagent_claude_code` 具名工具。

调用分两段：父 Agent 决定是否委派/选工具/写任务/前台还是后台；DSH 运行时负责把适配器注册成工具、校验调用、启动进程、管理后台 Job、传递取消信号、收回结果。provider 预绑定 `providerName` 和固定 `toolName`，模型看到稳定工具名，背后接哪套运行时由宿主配置决定。

- **Codex 链路**：父 Agent 调用 subagent_codex → DSH 启动 Codex app-server → 创建临时 thread → 启动 turn → 等待 turn/completed → 交回结果
- **Claude Code 链路**：走官方 Claude Agent SDK，拉起随包安装的兼容 CLI，执行一次独立 query
- 排障细节：Codex 适配器固定 `@openai/codex@0.147.0`，Claude Code 由固定版本 SDK 选随包 CLI，都不找系统 PATH 的同名命令

### rc.8 接通了委派，还没组成常驻团队

Codex 适配器每次新开进程/临时 thread/turn；Claude Code 设 `persistSession: false`。两边都只拿到独立任务文本 + 父会话工作目录，不继承父对话、角色、工具筛选、深度策略、输出格式。子 Agent 中间细节（工具调用/文件改动/token）不会复制进父会话；后台任务可查可取消，但不能拿 Job ID 继续会话。

局限：两个外部适配器仍是一次性委派，有取消和进程清理，但无统一超时验收和副作用回滚；沿用父工作目录，并发改同批文件会冲突。

## 第二层：Agent 是否会成为软件架构的新一层

### 组合的粒度抬高了一层

回顾 MCP → Agent 技术栈 → Context/Loop/Harness/Environment 的演进，这次 DSH 接进来的不再是工具能力，而是带自己 Loop、状态和权限体系的 Codex/Claude Code。组合粒度升级：

**模型调用 → 工具调用 → Agent 调用**

工具协议解决「Agent 怎样使用能力」；到 Runtime 层，问题变成「一个完整 Agent 怎样被另一个系统调用」。

### 它更像 Runtime，不太像更大的函数

传统函数拿参数执行预定义逻辑返回结果；完整 Agent 调用要维护上下文、多轮往返、敏感动作审批、产生状态/事件/副作用。当这套运行过程可被外部应用创建/恢复/中断/观察/审批，架构上就开始接近 Runtime。

它像服务调用但不能照抄微服务：子 Agent 收到的是自然语言任务（非类型明确请求）；副作用被接口和事务框住（Agent 可能拿工作目录连续读写、调外部工具）；返回「已完成」只是自述，不是可入账的业务事实。若要按 Agent 组合系统，需补：任务合同、资源计量、超时、隔离、可观测、权限联动、副作用处理——今天还没有成熟标准。

### Agent 编排是把几种控制权拆开

「主 Agent」更像任务里的角色而非固定产品身份。把 DSH 调用链拆开，至少四种责任：

| 参与者 | 在调用链里做什么 |
|--------|----------------|
| 父 Agent | 判断是否委派、选择子代理、组织任务、决定是否等待 |
| DSH 运行时 | 暴露工具、启动适配器、管理进程/Job/取消/结果收集 |
| Codex/Claude Code | 在各自 Harness 内维护上下文、运行 Loop、调工具、执行原生沙箱和权限策略 |
| 业务系统与人 | 提供权威事实、决定业务动作能否发生、用真实结果验收 |

三件事不能混：选中子代理 ≠ 拿到全部权限；子代理说「完成」≠ 业务验收通过；取消 Job ≠ 副作用已回滚。

OpenAI 的 Relay 物流示例：用户选中异常运单，应用把运单和状态交给 Codex，Agent 查数据比较方案，真要重订时应用把具体动作摆到人面前审批，执行完刷新权威记录。

### Harness 有可能成为新的基础设施层

OpenAI 官方 ARC-AGI-3 实验数字：保留推理状态 + 上下文压缩后，同一 GPT-5.6 Sol 得分 13.3%→38.3%，输出 Token 降到 1/6。数字只在原条件看，支撑的克制判断：模型没换，执行状态怎么保留、上下文怎么整理，结果差很多。

若飞把 Harness 理解为 Agent 时代的执行基础设施：模型提供推理能力，Harness 管状态/Loop/工具/沙箱/审批/事件，宿主接进产品和业务流程。这一层不取代业务后端——Harness 的状态不是订单/运单/发布记录，Harness 的审批不继承公司业务授权。它负责让 Agent 持续可控干活，业务系统负责事实/授权/验收。

克制边界：OpenAI 文档仍把 app-server 命令和 WebSocket 传输标在实验性边界内（不支持生产工作负载）；跨主机 WebSocket 要单独处理认证和 TLS；DSH rc.8 两个外部 provider 还没有共享长期记忆、持续协作和统一验收。代码开放、协议跑通、生产可托付是三件事。

## 参考资料
- OpenAI，Codex as a platform: build on the open agent harness（2026-08-19）
- OpenAI，Open-source components of Codex and where to collaborate
- OpenAI，Codex SDK / Codex App Server
- OpenAI，How two settings tripled our ARC-AGI-3 scores
- OpenAI Engineering，Unrolling the Codex agent loop / Unlocking the Codex harness: how we built the App Server
- DeepSeek，DeepSeek Harness 官方仓库 + dsh-v0.1.0-rc.8 Codex/Claude Code provider + Subagent 子系统文档

（End）
