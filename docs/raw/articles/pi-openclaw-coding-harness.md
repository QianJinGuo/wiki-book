---
title: Coding Harness 工程本质：从 Pi 到 OpenClaw
source_url: https://mp.weixin.qq.com/s/5r2tbJCu75f75hgRwQpF-Q
publish_date: 2026-05-07
tags: [wechat, article, agent, harness, coding, llm, openclaw]
review_value: 7
review_confidence: 7
review_recommendation: neutral
sha256: a53d49f74502656a9bc8e92ee8f94a1dc08d62b92dbdb09bf184d18f594dd738
---
# Coding Harness 工程本质：从 Pi 到 OpenClaw
> 原文：https://mp.weixin.qq.com/s/5r2tbJCu75f75hgRwQpF-Q
## Pi 定位：Minimal Terminal Coding Harness
Pi 在 coding-agent README 里把自己称为 minimal terminal coding harness。它没有停在聊天壳，也没有把几十个概念堆在一起做演示。默认情况下，它先给模型一组很小的身体能力：read、write、edit、bash。再往外，才是 session、context files、compaction、skills、extensions、TUI、RPC、SDK。
**Pi 这个顺序把 Agent 的底层工程暴露得很清楚：能力不会从概念里自动长出来，它靠一层层工程边界托住。**
## Pi 分层架构
```
Provider API -> agent loop -> coding tools
-> session / context / compaction
-> terminal UI / RPC / SDK
```
packages 分层：
- `packages/ai`：多 provider 的 LLM API 适配层
- `packages/agent`：通用 agent runtime，处理 tool calling、state、event streaming
- `packages/coding-agent`：终端 coding harness，也就是 pi
- `packages/tui` / `packages/web-ui`：界面层
## Harness 补齐了什么
让模型从"建议你怎么修"走到"自己去修"，至少要补齐：
1. 读取项目
2. 修改文件
3. 执行命令
4. 把工具结果送回模型
5. 保存行动轨迹
6. 裁剪上下文
7. 拦截风险动作
8. 用真实证据判断完成状态
**别把 harness 想成一个新名词。它就是模型进入真实任务后绕不开的那套工程外壳。**
## 五个可复用的工程模式
### 1. Context 像投影，不像容器
Session 可以很丰富，但模型每轮看到的应该是一份经过治理的 projection。
三类状态分开：
- 给模型看的
- 给用户界面看的
- 只给审计和恢复看的
### 2. Transcript 是账本，working context 是视图
Pi 的 session JSONL 记录行动轨迹和分支历史，compaction 也只是新增摘要 entry，不删除旧消息。
```
durable history: 完整行动轨迹
working context: 当前模型可见材料
summary: 二者之间的压缩视图
```
只保留完整历史，模型会被旧日志拖垮。只保留摘要，摘要一错就没证据可查。**两层都要保留。**
### 3. 权限要进运行时管线
Pi 的 beforeToolCall / afterToolCall 给工具执行前后留出边界：
- `beforeToolCall`：发生在工具实际执行前，适合做参数、路径、权限、风险动作检查
- `afterToolCall`：发生在工具结果返回后，适合做审计、截断、结构化补充和错误标记
OpenClaw 继续往前走：按 owner-only、agent 配置、provider、group/channel、sender、sandbox、sub-agent 等规则算出 effective tool policy，再把最终可用工具通过 customTools 注入 Pi。
### 4. Runtime kernel 小，产品 control plane 厚
Pi 没有把所有时髦能力都塞进核心。核心主要负责模型、loop、工具调用、状态、事件和 session。
OpenClaw 展示了另一半年：长期运行的个人助理系统会长出 Gateway、通道接入、pairing、Control UI、auth profile 管理、usage 展示、sandbox、队列、fallback、cron、webhook。
**Pi 负责内核语义，OpenClaw 负责产品世界。**
### 5. 失败路径和证据链一起设计
Pi 工具没有假设一切顺利：
- read 会截断并提示续读 offset
- bash 保留完整输出路径、支持 timeout 和 abort
- edit 会因为 oldText 不唯一或重叠而拒绝修改
OpenClaw 处理 provider fallback、auth profile 管理、idle timeout、context overflow、tool result truncation、trajectory 记录和 compaction 超时。
## Pi → OpenClaw 的演进
| 维度 | Pi | OpenClaw |
|------|-----|---------|
| 定位 | Runtime kernel | Product control plane |
| session | JSONL transcript | JSONL + sessions.json（两层状态） |
| 工具策略 | 内置 | 动态化（按 agent/provider/channel/sender 规则计算） |
| context builder | 基础 | 进入运行时层面 |
| 通道 | TUI 本地 | IM/移动/Canvas/cron/webhook |
### session 需要两层状态
Pi 的 transcript 是 JSONL，适合记录对话和工具轨迹。OpenClaw 还维护 sessions.json，用 sessionKey -> sessionId 管不同通道、群组、cron、hook、sub-agent 的路由和当前会话。
- transcript 记录发生了什么
- session store 记录消息该进入哪条轨道
### 工具策略需要动态化
OpenClaw 会根据 agent、provider、group/channel、sender、sandbox、owner-only 规则算出 effective tool policy，再把最终可用工具通过 customTools 统一注入 Pi。
## 稳定路线
自己搭 Agent，不用一次做成 Pi。比较稳的路线是：
1. **先做只读 Agent**：接模型 provider，写最小 loop，提供 read、grep、find、ls，重点放在工具 schema、上下文组装和结果截断
2. **再加精确修改**：提供 edit，用小块 replacement，返回 diff，保证路径限制和 diff 可见
3. **然后加命令执行**：提供 bash，带 cwd、timeout、输出截断、abort，让 Agent 形成"改完跑测试，失败再修"的闭环
4. **尽早做 event log**：不要只存 messages，工具调用、工具结果、模型变化、文件修改、人工插话都应该能回放
5. **再做 context builder 和 compaction**：把 durable history 和 working context 分开
6. **最后再上 skills、extensions、MCP、memory**
## Harness 会被模型内化吗
一部分会：认知策略层可以被模型学进去（"先读文件再改"、"改完跑测试"）。
模型内化不了的部分（也不应该交给模型内化）：
- 文件系统在哪里
- 当前用户是谁
- 哪些路径不能碰
- 哪条消息来自群聊
- 谁有 owner 权限
- 工具结果怎么截断
- session 怎么恢复
- 成本怎么记
**如果把 harness 理解成一堆提示词和流程模板，它会被模型吸收一部分；如果把 harness 理解成模型进入真实任务后的运行时秩序，它只会越来越重要。prompt scaffolding 会变薄，runtime harness 会变硬。**