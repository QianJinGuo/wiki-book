---
title: "Agent Loop 源码导读：一次 Hermes 任务的完整生命周期"
author: "winty"
source_url: "https://mp.weixin.qq.com/s/WZFHvVCil9GkQ-oTclS_Tw"
published_date: "2026-05-20"
feed_name: "微信公众号"
tags: [hermes, agent-loop, agent-architecture, source-code, self-evolution]
type: article
review_value: 8
review_confidence: 9
review_recommendation: "pass"
sha256: ab622dfac175040878c8a549cf27656e1bdb85581ac829e16ca3df671b6a7e0d
---
---
# Agent Loop 源码导读：一次 Hermes 任务的完整生命周期
> 原文：Agent Loop 源码导读：一次 Hermes 任务的完整生命周期
> 作者：winty（前端Q）
> 来源：https://mp.weixin.qq.com/s/WZFHvVCil9GkQ-oTclS_Tw
> 日期：2026年5月20日
## 核心发现
Hermes 的 Agent Loop 主循环不到 200 行代码，做的事情本质上就一句话：
> 循环 → 拼提示词 → 调模型 → 看要不要调工具 → 检查是不是该退出
那些复杂的事情都被推到了别的模块里。Loop 本身只是个调度器。
## 主循环 5 阶段抽象
不同框架（Hermes、LangGraph、Cursor、Claude Code）命名不同，但本质都是这 5 个阶段：
1. **Receive Input** — 拿到 user message 或上一轮 tool result
2. **Build Prompt** — 拼 Memory + Skill + Context
3. **Call LLM** — 发请求 / 等响应 / 解析结果
4. **Execute Tool** — 模型要调工具就执行，不要就跳过
5. **Check Done** — 任务完成了？完了就退出，没完就回到第 1 步
**金句：Agent 不是一次性的调用，而是一个循环。**
Chat 是 request-response 模式（问一句答一句）；Agent 是 task-completion 模式（给定目标，循环跑直到完成）。
## 4 个核心模块
### 模块 1：Loop Orchestrator（循环主控）
200 行主循环本体。职责极窄：
- 维护当前是第几轮（turn count）
- 在 5 个阶段之间调度
- 检查终止条件
- 把每一步事件丢给下层记录
**它不知道 prompt 怎么拼，不知道模型怎么调，不知道工具怎么跑。它只知道"下一步该叫谁"。**
设计原则：主循环应该是最薄的那一层，重逻辑要推到下面。
### 模块 2：Prompt Builder（提示词组装）
每轮要做的事：
- 读 system prompt 模板
- 注入相关 Memory 条目
- 检索并注入相关 Skill
- 把可用 Tools 序列化成 schema
- 拼上整个对话历史
- 控制总长度不超过模型 context window
好处：改 prompt 策略不需要动主循环。想加一种新的注入方式（比如加 RAG 检索结果），只改 Prompt Builder，Loop 完全不知道。
### 模块 3：执行层（LLM Adapter + Tool Runner）
- **LLM Adapter：** 屏蔽不同模型 API 差异（OpenAI / Anthropic / Bedrock），上层只传 prompt、拿回结构化响应
- **Tool Runner：** 找到工具实现、传参、捕获异常、包装成统一格式
两个模块都是**无状态**的，方便测试和并发。
### 模块 4：Trajectory Recorder（轨迹记录）
把循环里每一个事件写到结构化的 session trace 里。是后续 Nudge Engine 和 Review Agent 的输入。
把记录和执行解耦：即使关闭自学习功能，主循环照样能跑（trace 写到 /dev/null 就行）。
## 一轮内完整时序
```
Orchestrator → Prompt Builder: buildPrompt(state)
Prompt Builder → Orchestrator: return prompt  # 50-200ms（含 Memory 检索、Skill 匹配）
Orchestrator → LLM Adapter: callModel(prompt)
LLM Adapter → Orchestrator: return assistant message  # 1-5秒（最慢）
Orchestrator 自检：has tool_calls?
Orchestrator → Tool Runner: execute(tool_call)  # 默认串行
Tool Runner → Orchestrator: return tool result
Orchestrator 自检：task done?
  - 无 tool_calls → 任务完成，退出
  - 有 tool_calls → 回到第1步，开新一轮
```
**金句：一轮 = 一次模型调用 + 0~N 次工具调用。**
很多人以为"一轮 = 一次模型调用"，结果 token 和耗时算偏了。如果模型调了 5 个工具，实际是 1 次 LLM + 5 次 Tool。
**工具默认串行的原因：** 工具之间可能有顺序依赖（如先 read_file 再 write_file），并发会出竞态。除非工具明确声明"只读、纯函数、可并发"，否则一律串行。
## 4 种退出姿势
### 退出 1：任务自然完成（约 70% 任务）
```python
if assistantMessage.tool_calls.length === 0:
    break
```
### 退出 2：达到最大 turn 上限
Hermes 默认 25 轮（小任务）或 50 轮（复杂任务）。
**关键：** 达到 turn 上限的退出不能算"任务完成"，否则 Review Agent 会把"卡住"当成"成功"去复盘。Hermes 显式标注 `terminated_by: "max_turns"`，让下游知道是异常结束。
### 退出 3：用户主动打断
用户按 Ctrl+C 或点击取消按钮。需要处理：
- 中断模型 stream 生成
- 尝试 cancel 正在执行的工具（不是所有工具都支持）
- 已完成工具调用保留结果，正在执行的中断
### 退出 4：不可恢复错误
模型 API 挂了、工具抛未捕获异常、内存 OOM。处理原则：
- 把错误信息记到 trajectory（让 Review Agent 知道原因）
- 释放占用的资源
- 给用户能看懂的错误提示，不甩 stack trace
**金句：一个好的 Loop，必须有 4 种退出姿势。**
## 源码发现
### 发现 1：Loop 内不做任何业务判断
Hermes 的 Loop 里没有任何 `if 任务类型 == X 那么...` 的代码。
业务差异（如"代码任务要先 lint"、"文档任务要先 outline"）全通过 Skill 注入 prompt，由模型自己判断。Loop 永远是同一个流程。
这种"通用循环 + 差异化 prompt"的设计让 Loop 可以在所有场景复用，不会因为加新功能而越来越臃肿。
### 发现 2：每一步事件实时落盘
Trajectory Recorder 不是任务结束才一次性写入，而是每一步事件实时写到磁盘。
如果任务跑到一半挂了，没落盘的事件就丢了，Review Agent 拿不到完整 trace。实时落盘的代价是每秒多写几次 disk，收益是任何异常情况下都能事后复盘。
### 发现 3：Tool 调用默认串行
改成默认并发跑 100 个真实任务，7% 出现"读到了上一步还没写完的数据"竞态。并发应该是个 opt-in 选项，不能是默认。
### 发现 4：刻意避免状态机
Hermes 没用显式状态机。Loop 就是个简单的 while 循环，状态全在变量里。
显式状态机会让每种状态都需要预先定义，新增能力时改动巨大。简单 while 循环灵活得多。
适用场景：任务种类有限、流程稳定 → 状态机（如客服对话）；任务种类无限、高度灵活 → 简单 Loop（如通用 Coding Agent）。
## 设计哲学
- **"主循环克制，外围灵活"** — 所有复杂逻辑推到 Prompt Builder/Tool Runner/Trajectory Recorder
- **"自进化"是叠加能力，不是嵌入逻辑** — Memory/Skill/Nudge/Review 从外部叠加到 Loop 上，Loop 不知道它们存在。哪天不想要自学习了，拔掉这些模块，Loop 照样跑
- **先想清楚怎么停，再想怎么跑** — 从 Hermes 学到的最重要的一条
## 下篇预告
Prompt Builder 深入：Memory、Skill、Context Files 怎么进入 system prompt，长度超了怎么裁剪、优先级怎么定。