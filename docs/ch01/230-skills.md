# 【实践案例】我用Skills实现了个自媒体知识管理神器！

## Ch01.230 【实践案例】我用Skills实现了个自媒体知识管理神器！

> 📊 Level ⭐ | 2.5KB | `entities/实践案例我用skills实现了个自媒体知识管理神器.md`

# 【实践案例】我用Skills实现了个自媒体知识管理神器！

**来源**: 叶小钗

**发布日期**: 2026-05-02

**原文链接**: https://mp.weixin.qq.com/s/YDnhytrpl26ozXgGvauc1Q

---

AI训练营9 期 ，5 月7日 开班，欢迎咨询

这两年，除了投入创业AI项目外，我还有个身份是一名自媒体。作为内容创作者，我经常需要从各种渠道搜集和整理信息，但这个过程始终充斥着低效与痛苦。

例如，当我刷到一条内容扎实的视频时，脑中常会闪过这样的念头：“这段内容如果能转成文字就好了，以后查阅会方便很多。”

然而现实中的操作往往是： 先收藏、再截图 ，最后把链接丢进“稍后处理”的收藏夹。等到真正需要整理时，不仅当时的灵感与上下文早已消失， 手头依然没有一份好用的文字材料 。

过去，我会把这类任务交给实习生，但看着他吃力的操作过程，我总忍不住摇头：

- 反复拖拽进度条，寻找关键句子；

- 紧盯着字幕或费力听写，整理出的格式却依旧混乱；

- 想做笔记，但信息分散在时间轴上，难以有效重组。

我在想，如果我自己来做，一次两次尚可忍受，但长期这样肯定受不了，于是，我带着实习生将这个繁琐的流程封装成了一个 Claude Skill：

严格来说，这个场景其实Workflow已经是最优解了，但谁还没有一个Agent的梦想呢，而且Workflow只是解决了一个单点问题，就这个小问题背后其实有更大的探索空间：

能否构建一个完整的系统，让 AI 自动完成从内容抓取、整理到知识管理的全过程？

于是，我开发了 Krawl 系统 ：

一个基于 Claude Skills 机制的知识库管理系统。在深入介绍 Krawl 之前，我们首先需要理解一个核心概念：Claude Skills。

## unset unset 认识 Skills unset unset

Anthropic 官方文档给出了 Agent Skills 的定义：

Agent Skills are modular capabilities that extend Claude’s functionality. Each Skill packages instructions, metadata, and optional resources (s

---

