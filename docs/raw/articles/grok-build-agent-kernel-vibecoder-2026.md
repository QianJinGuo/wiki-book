---
source_url: https://mp.weixin.qq.com/s/Z5CtrWbmIgY5N5kOtSPVxw
ingested: 2026-07-18
sha256: c6afbdb17900d121de00005bd4fdff8e9ba727828613d7c847c4ffb0b9e25ed8
title: "拆解马斯克连夜开源的 Grok Build：79 个 Cargo 包背后的 Agent 内核"
author: VibeCoder
source: Vibe编码 (微信公众号)
score_v: 8
score_c: 6
score_vc: 48
decision: raw_only
---

# 拆解马斯克连夜开源的 Grok Build：79 个 Cargo 包背后的 Agent 内核

2026 年 7 月 15 日，xAI 公开了 Grok Build 的源码。仓库包含 79 个 Cargo package、23 个二进制 target、2238 个 Rust 文件；把测试、vendor 和生成代码算进去，规模约 136 万行。

## 架构概览

真正的内核在 xai-grok-shell。发行物由 xai-grok-pager-bin 启动和组装，pager 负责 TUI、渲染与 ACP client。session、agent loop、sampling、tools、persistence、leader 和 relay 汇合在 xai-grok-shell。TUI、单轮模式与 IDE/ACP 入口共享大部分 session 和 turn 语义，是同一套执行系统的不同宿主面。

系统有两条协议边界：
- **ACP** 连接 TUI、IDE、leader、relay 与 Agent，负责 session、prompt、流式 update 和权限 reverse request
- 本地或远端工具执行由 tool types、protocol 与 runtime 负责

当前主 Agent 的工具路径是 ToolBridge → FinalizedToolset → LocalRegistry。Computer Hub 侧能确认两种 workspace provider：leader 进程内持有的 WorkspaceHandle，以及独立的 xai-workspace-server。

## 一次 Prompt 是一段长 RPC

同一 session 的 prompt 严格排队，队头拥有 foreground turn。输入落盘、上下文准备、压缩检查、模型采样、工具执行和结果回注，都发生在一次 prompt 的生命周期内。

一次用户输入可以触发多次模型请求。模型返回工具调用后，执行结果会进入对话，再发起下一次采样；context overflow 可能触发 compact-and-resubmit；认证问题可能触发 refresh-and-resubmit。没有工具调用也未必立即结束，TodoGate、late interjection 和 structured output validation 都可能要求续跑。

**完成权设计**：取消、重试与队列推进并发发生时，旧 task 仍可能晚到。系统用 queue head 和 prompt id 校验谁能提交最终结果，失去所有权的 completion 会被丢弃。取消按钮只是界面能力，completion ownership 才决定取消后会不会串台。

## 四个状态所有者

Grok Build 没有把所有可变状态塞进一把全局锁：

- **SessionActor** — 管 prompt 队列、当前 turn、取消和完成权
- **ChatStateActor** — 管 conversation、token estimate、tool call/result 配对和 history repair
- **SamplerActor** — 管活动 request、provider stream 与传输恢复
- **Persistence loop** — 管 JSONL、plan、goal、rewind、checkpoint 和 flush barrier

每个 actor 都是自己那部分状态的单写者。跨 actor 没有全局事务，系统靠 prompt id、request id、channel ordering、flush barrier 与 load-time repair 收敛。

错误处理位置也按此划分：网络/HTTP/限流归 Sampler；认证刷新/上下文溢出/重新提交归 Session；悬空 tool call 与历史配对归 ChatState；torn UTF-8 和损坏 JSONL 记录归 loader。

## 工具治理

模型给出一批 tool calls 后，系统先串行完成 typed parse、Plan mode gate、hooks 和 permission。只有通过治理的调用才进入 dispatch。互不冲突的工具可以并发，同一路径写入用 mutex 收口。

这个设计同时保留了审批顺序和工具吞吐。但没有提供文件事务；一批工具仍可能部分成功，回滚需要执行器自己定义。max_turns 也不能充当副作用预算，因为检查发生在本批工具完成、下一次 sampling 开始之前。

工具输出在核心层保持强类型，到对象安全或网络边界才擦除成 JSON。同一结果还能投影成 JSON、model content blocks 与 chat message，减少多次序列化造成的语义漂移。

## 代码存在与默认生效之间的差距

Grok Build 里至少有五组需要分开判断的能力：

1. **Compaction** — 基础 single-pass 默认工作；two-pass/prefire 已有实现但默认关闭，只在环境变量/配置/远端设置开启后运行
2. **Workspace** — 主 Agent 走本地 workspace；WorkspaceOps::Proxy 已实现却找不到生产构造调用
3. **Hub** — provider 路径已接入，backend 与 consumer 位于仓库外
4. **Sandbox** — CLI 与 leader 的 sandbox 默认值 off，standalone workspace server 默认 workspace。显式启用后部分路径会告警后继续运行。session summary 记录 configured profile 名称，无法单独证明 sandbox 已经 applied
5. **Mode policy** — 非 Plan mode 的热切换会更新身份和 system prompt，update_policies_from_definition 仍是 TODO 空实现。旧 ToolBridge 会继续复用，mode label 不能证明策略已同步变化

## 长会话恢复

JSONL 存储对普通更新使用 append，对 rewind 和 compaction 使用临时文件加 rename 的 full replace；加载时隔离坏行，再由 ChatState 修复 dangling tool calls。

**已知缺陷**：拼接 JSON 参数恢复会在日志里记录匹配到后续对象，实际仍解析第一个对象。首对象不匹配、第二个对象匹配时，本可恢复的调用会变成 ToolParsingError。

## 采用建议

- **目标是学习成熟 Coding Agent** → Session、ChatState、Sampler 和 tool pipeline 是最有价值的阅读路线
- **目标是 IDE 集成** → ACP stdio 是边界最清楚的入口
- **只是增加工具** → MCP、plugins 与 skills 的维护面远小于直接修改 ToolBridge
- **完整自托管** → 公开树缺少 Computer Hub、relay 和 inference proxy 的服务端实现
