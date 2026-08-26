# Grok Bot 0.18 运行时重建：Agent 的五层运行时与可靠性协议

## Ch04.595 Grok Bot 0.18 运行时重建：Agent 的五层运行时与可靠性协议

> 📊 Level ⭐⭐ | 6.2KB | `entities/grok-bot-agent-runtime-five-layer-vibecoder-2026.md`

# Grok Bot 0.18 运行时重建：Agent 的五层运行时与可靠性协议

> VibeCoder 对 Grok Bot 0.18.0 非官方重建仓库的源码级解读：145 万行运行时 CJS bundle 被恢复成可读 TypeScript，逐层拆解 Anysphere 的 Agent 运行时，提炼出五层架构与五条可靠性协议。

## 背景：这是 Grok Bot，不是 Grok Build
这次重建对象是 Grok Bot——8 月 11 日进入 early beta、拥有持久云电脑、能跨浏览器/文件/终端/插件工作的 AI 队友；与 7 月官方开源的终端编码 Agent Grok Build 是两个产品。固定样本由 Anysphere Developer ID 签名并通过 Apple 公证，无标准 source map、无官方 monorepo，作者定性为"高保真实现重建"，接近"实现泄露"但离"原始源码仓库泄露"还有证据距离。

## 五层（六层）运行时架构
顺着一次 sendPrompt 读下去，可见六层：Renderer、Electron main/preload、Node coordinator、Host/transcript、Agent runtime、末端执行 surface。Renderer 管消息/卡片/Computer 画面；preload 只暴露窄 bridge 与单 owner 的 MessagePort；Coordinator 接住 renderer RPC 再连接长期运行的 Host；Host 持有 transcript、幂等接收、每 Agent 的 turn lane 与用户可见状态。进入 turn shell 后系统才建立 generation、权限 epoch、隐私模式、MCP discovery 与 box readiness；Production owner 把本轮 resource accessor、prompt session、summary session 与 tool host 绑好后 runStream 恢复 conversation state 进入模型与工具循环。

两个稳定细节：输入端用 nonce + digest 做 durable acceptance（网络重试不产生重复回合）；状态端用 generation fence（旧 turn 被新消息打断后，即使晚到也不能覆盖新状态）。

## 可靠性五协议
**Prompt 是合同，middleware 负责巡检，settlement 负责验收。** 普通 assistant text 只服务内部活动流，只有 SendMessage 才算真正发给用户。start-of-turn middleware 在首次回复前塞入"先用工具"提醒；send-message middleware 在连续工具调用超阈值而无消息时催汇报；turn 结束 transcript runtime 检查 SendMessage 是否真的进入用户可见记录。System prompt 按固定顺序拼接 profile/身份/时区/memory/automation/workflow/channels/Agent directory/MCP/box/Computer 能力，profile 与 memory 在同一 compaction epoch 内冻结。

**Toolset 是策略。** 每轮重建 toolset：主 Agent/Subagent/共享房间/Computer 未就绪/MCP 未发现拿到不同工具，Shared room 缩成白名单，Subagent 配置缺失直接得空工具集；无 resource accessor 的能力不出现在 schema，执行器缺失 fail closed。低频 MCP 工具用二级发现（先 meta tool，live projection 成立后再加载 connector）减少上下文浪费。

**Context 要分层。** 四条通道各管一件事：Summary（对话语义，unused context <10k tokens 或 10% 启动后台摘要、5k 或 5% 才允许持久化；输入过大用 max-min fair allocation）、Durable Blocks（计划/待办/项目根/运行模式/自动化/技能）、Memory（profile 与 recent，user/project/agent 不同预算与写入边界）、GUI latest image（视觉状态穿过 compaction）。

**Approval 要绑定状态。** Local-tool permission（never/ask/always）一次批准绑定 Agent/tool call/动作/目标/direction epoch，新 turn 退休旧批准；Auto-review 判断副作用是否越策略。Computer 操作把动作/目的/box/页面 display-state identity 纳入批准，执行前重查页面，窗口变化旧卡失效；脚本执行补 SHA-256 与规范化 target。安全边界：Electron 开启 context isolation、关闭 Node integration，但 Chromium sandbox 关闭并加 no-sandbox，不能宣传成 OS 级隔离。

**Reply 是交付。** 把回复当可恢复 side effect：SendMessage 支持文本/图片组/附件/widget/secret/thread；turn result 记录发送数与 reaction，两者都无则视为交付义务未完成，最多三次隐藏 nudge；Ack obligation 持久化，进程中断/重启后可 redrive；无法确认旧动作完成时要求用户重发不假装成功。由此 reply 获得与文件写入相似的可靠性语义：接收幂等、执行可中断、状态防回滚、交付可补偿。

## Router 属于扩展
Router 支持 Cursor/Claude Code/Codex/OpenRouter + 本地 Docker box，但这是重建作者明确列出的扩展：非 Cursor provider 在 Coordinator 处分流（Claude Code 走临时 MCP bridge、Codex 走 Responses SSE、OpenRouter 走 AI SDK，最多 8 turn/step），没有完整经过原生 Host 的 prompt assembly、memory freeze、durable conversation state 与长循环。它证明同一套 UI 协议可挂多个 provider，不证明原生 Agent 就是简化 Router。

## 相关
与 [Grok Build Agent 内核](../ch03/006-agent.html) 同作者同类型（VibeCoder 源码级拆解），但为不同产品（终端编码 Agent vs 持久云电脑 AI 队友）。与 [Claude Fable 5 提示词泄漏运行时](../ch01/475-claude-fable-5.html) 同为"产品运行时反推"侧写。与 [Harness Engineering](../ch05/050-harness-engineering.html) 主题互链。→ [原文存档](https://github.com/QianJinGuo/wiki-book/tree/main/docs/raw/articles/grok-bot-agent-runtime-five-layer-vibecoder-2026.md)

---

