# OpenClaw长期记忆：优秀管线与玄学效果

## Ch01.1123 OpenClaw长期记忆：优秀管线与玄学效果

> 📊 Level ⭐⭐ | 3.3KB | `entities/openclaw长期记忆优秀管线与玄学效果.md`

# OpenClaw长期记忆：优秀管线与玄学效果

**来源**: 阿里云开发者

**发布日期**: 2026-04-15

**原文链接**: https://mp.weixin.qq.com/s/pLqKTe1J2FkiiquoT4dOJA

---

"Memory is limited — if you want to remember something, WRITE IT TO A FILE. ‘Mental notes’ don’t survive session restarts. Files do."

—— OpenClaw AGENTS.md 默认模板

对于 AI Agent 来说，“记住”是最基础也是最难做好的能力之一。当前的大语言模型在单轮对话中表现出色，但一旦会话结束，所有上下文都从窗口中消失。如何让 Agent 在多轮、跨天的交互中稳定地记住用户的偏好、事实和决策，以及值得记录的事件？OpenClaw 给出了一套以 Markdown 文件为载体的多层记忆体系，其管线覆盖记录、演进、召回全流程——设计理念优秀， 但其全流程以 LLM 弱约束的方式进行决策，实际记忆效果往往不够稳定 。

本文将从源码层面拆解这套记忆系统的全链路，分析其中的不确定性环节，并介绍 RDSClaw 记忆插件 如何补强这些环节，其在LoCoMo10评测中得到了13.90%的提升效果。

一、OpenClaw 记忆系统全景

OpenClaw 的核心设计原则是： 一切持久状态都是磁盘上的 Markdown 文件 。 Agent 的身份、规则、记忆、工具配置——全部以明文  .md  文件的形式存放在工作区目录下，每次会话启动时按优先级注入系统提示词。

完整的文件体系如下：

文件
用途
加载时机

AGENTS.md
工作区规则、安全边界、红线指令
每次会话（最高优先级）

SOUL.md
Agent 个性、价值观、沟通风格
每次会话

IDENTITY.md
Agent 身份元数据（名字、角色、头像）
每次会话

USER.md
用户档案（名字、昵称、时区、个人背景）
每次会话

TOOLS.md
环境配置（设备信息、SSH 主机、TTS 偏好）
每次会话

MEMORY.md
长期记忆 （已验证事实、决策、持久学习）
仅 DM 主会话

memory/YYYY-MM-DD.md
日记忆 （当天观察、临时笔记）
当天 + 昨天自动加载

DREAMS.md
梦境日记（Dreaming 系统输出，仅供人类审查）
不自动注入

可以看到，  AGENTS.md  、  SOUL.md  、  USER.md  等文件定义的是 Agent 的身份、规则和用户档案，它们在每次会话启动时被加载，用户和 Agent 都可以在对话中更新（比如  USER.md  的模板明确写着 "Update this as you go" ）。而  MEMORY.md  和  memory/YYYY-MM-DD.md  则是另一套机制——它们承载的是 Agent 在对话中积累的动态记忆，并且有一套专门的写入、演进和召回管线。

下面逐层展开。

二、记忆写入：两条路径

OpenClaw 的记忆写入有两条主要路径，它们共同负责将对话中的信息写入  memory/YYYY-MM-DD.md  日记忆文件。

2.1 Agent 主动写入（LLM 决策）

这是最常用的写入路径。在对话过程中，Agent 可以随时主动调用  write  工具将信息写入记忆文件：

-

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/openclaw长期记忆优秀管线与玄学效果.md)

---

