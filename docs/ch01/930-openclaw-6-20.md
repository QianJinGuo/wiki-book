# 拆解 OpenClaw 架构（一）：6 阶段流水线与 20+ 平台的消息归一化

## Ch01.930 拆解 OpenClaw 架构（一）：6 阶段流水线与 20+ 平台的消息归一化

> 📊 Level ⭐⭐ | 4.4KB | `entities/拆解-openclaw-架构一6-阶段流水线与-20-平台的消息归一化.md`

# 拆解 OpenClaw 架构（一）：6 阶段流水线与 20+ 平台的消息归一化

**来源**: 科技充电站

**发布日期**: 2026-02-26

**原文链接**: https://mp.weixin.qq.com/s/MWB1iG1rZYpV5a4Ob1XWpg

---

AI 时代，有两种行为：

一种，活在别人的评测里，把模型的强当自己的强，痴人说梦；

另一种，活在真实的实战里，用最顶级的 AI，武装自己。

前者在噪音里坐享"技术平权"，后者在 疼痛中完成"自我进化"。

朋友们好，我是行小招。

这是 OpenClaw 深度技术解析系列的第一篇。

OpenClaw 是 GitHub 历史上增长最快的开源项目，200K+ stars，70 天不到。网上分析它的文章很多，但大多停留在"它能控制你的电脑"这个层面。我想做的不一样，我要扒开它的源码，一个模块一个模块地拆，拆到技术人看了觉得"有料"的程度。

第一篇，我们从最底层开始：Gateway 与 Channels。

先不聊架构，先看一个具体场景。

你在 Telegram 里给你的 OpenClaw Agent 发了一句话："帮我查一下明天北京的天气"。这条消息从你手指触屏的那一刻起，到你看到回复，中间经历了什么？

grammY 库接收到 Telegram 的 Update 事件，Channel Adapter 把它归一化成一个统一的  InboundContext  结构，Gateway Server 根据你的 chat_id 和 agent 配置路由到正确的会话，Lane Queue 把这条消息排进队列并串行执行，Agent Runner 组装好 system prompt 调用 LLM，Agentic Loop 开始"思考-工具调用-观察"的循环，最后 Response Path 把回复分块（Telegram 单条消息上限 4096 字符）流回你的聊天窗口，同时写入一份 JSONL 转录文件。

六个阶段，一条流水线，从头走到尾。

这就是 OpenClaw 的 6 阶段执行流水线。看起来不复杂对吧？但真正有意思的地方在细节里。比如，为什么同一个会话内的消息要强制串行执行？为什么选 JSONL 追加写而不是数据库？为什么一个 Node.js 进程能同时撑起 20 多个平台的消息收发？

这些问题背后，是一系列非常老练的工程决策。

## Gateway：一个 Node.js 进程统治一切

OpenClaw 的 Gateway 是一个用 TypeScript 写的长驻 Node.js 进程，要求 Node 22+，默认绑定  127.0.0.1:18789  。它是整个系统的神经中枢，采用经典的 Hub-and-Spoke 架构，所有的消息面、会话路由、Agent 编排、事件协调全归它管。

一个主机只能跑一个 Gateway，这不是建议，是硬性架构约束。

为什么？

因为 WhatsApp 的 Baileys 协议严格限制单设备会话，同一手机号不能同时在多个 Web 会话中活跃。这不是 OpenClaw 想不想多开的问题，是底层协议不让你多开。类似的约束在 iMessage 上也存在，必须跑在真实的 Mac 硬件上才能访问私有 API。

做过即时通讯系统的朋友应该能体会这种痛，你的架构设计很多时候不是被自己的需求决定的，而是被第三方平台的协议约束逼出来的。

OpenClaw 选择用一个单例进程收敛所有复杂性，把多平台接入的"脏活"封装在一层，让上面的

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/拆解-openclaw-架构一6-阶段流水线与-20-平台的消息归一化.md)

---

