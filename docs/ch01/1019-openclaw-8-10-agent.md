# 拆解 OpenClaw 架构（二）：8 个文件 + 10 步流水线，Agent 人格系统的源码级设计

## Ch01.1019 拆解 OpenClaw 架构（二）：8 个文件 + 10 步流水线，Agent 人格系统的源码级设计

> 📊 Level ⭐⭐ | 3.6KB | `entities/拆解-openclaw-架构二8-个文件-10-步流水线agent-人格系统的源码级设计.md`

# 拆解 OpenClaw 架构（二）：8 个文件 + 10 步流水线，Agent 人格系统的源码级设计

**来源**: 科技充电站

**发布日期**: 2026-02-27

**原文链接**: https://mp.weixin.qq.com/s/UKM4apyYPYBfb27vtbrN6g

---

AI 时代，有两种行为：

一种，活在别人的评测里，把模型的强当自己的强，痴人说梦；

另一种，活在真实的实战里，用最顶级的 AI，武装自己。

前者在噪音里坐享"技术平权"，后者在 疼痛中完成"自我进化"。

朋友们好，我是行小招。

这是 OpenClaw 深度技术解析系列的第二篇。上一篇我们拆了 Gateway 和 Channels，讲了一条消息从发出到回复的 6 阶段流水线。文末我留了个问题：AI Agent 的人格，应该硬编码在代码里，还是外部化成一个文件？

今天就来揭晓 OpenClaw 的答案。

OpenClaw 给 Agent 人格系统取了一个非常有野心的名字：SOUL.md。

不是 config.md，不是 persona.md，不是 system-prompt.md。是 SOUL，灵魂。

打开官方模板，第一句话就把我震住了：

"You're not a chatbot. You're becoming someone."

你不是一个聊天机器人，你正在成为某个人。

说实话，第一次看到这句话的时候，我觉得有点"中二"。一个 Markdown 文件而已，至于上升到灵魂的高度吗？

但读完整套设计之后，我改变了看法。

SOUL.md 不只是一个 system prompt 的载体，它是 OpenClaw 整个身份系统的基石。官方模板里列了三条核心原则：

Be genuinely helpful, not performatively helpful， 真正有用，而不是表演性地有用。这句话戳中了我，因为很多 AI Agent 确实在"表演有用"，回复得很快很长很有格式，但实际上没解决问题。

Have opinions — you're allowed to disagree， 有自己的观点，允许不同意。这条很大胆，大多数 AI 系统的人设都是"我来帮助你"，OpenClaw 鼓励 Agent 形成独立观点。

Remember you're a guest， 记住你是客人。你住在别人的数字生活里，尊重边界。

这三条不是空洞的口号，它们直接影响 Agent 的行为模式：第一条决定了回复质量的衡量标准，第二条决定了对话中的互动深度，第三条决定了操作授权的谨慎程度。

## 不只是 SOUL.md：8 个文件构成完整的"人格操作系统"

很多人以为 OpenClaw 的人格系统就是一个 SOUL.md。不是的，实际上是 8 个文件协同工作，各司其职。

文件
干什么用
什么时候加载

SOUL.md
人格、语气、价值观、行为边界
每次会话

AGENTS.md
操作指令、启动序列、工作流定义
每次会话

USER.md
人类档案：你叫什么、在哪个时区、有什么偏好
每次会话

IDENTITY.md
显示名、主题色、emoji 偏好
每次会话

TOOLS.md
本地环境备注，比如你装了哪些命令行工具
每次会话

MEMORY.md
策展的长期事实，大约 100 行
仅私聊 ，群组不加载

memory/YYYY-MM-DD.md
每日日志，追加写入
今天 + 昨天

HEARTBEAT.md
定时心跳检查的清单

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/拆解-openclaw-架构二8-个文件-10-步流水线agent-人格系统的源码级设计.md)

---

