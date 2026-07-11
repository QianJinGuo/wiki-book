# Mem0 vs WorkBuddy：Agent 记忆层的两条路线，谁才是终极答案？

## Ch04.637 Mem0 vs WorkBuddy：Agent 记忆层的两条路线，谁才是终极答案？

> 📊 Level ⭐⭐ | 2.2KB | `entities/mem0-vs-workbuddyagent-记忆层的两条路线谁才是终极答案.md`

# Mem0 vs WorkBuddy：Agent 记忆层的两条路线，谁才是终极答案？

# Mem0 vs WorkBuddy：Agent 记忆层的两条路线，谁才是终极答案？
---
source: wechat
source_url: https://mp.weixin.qq.com/s/CyZv5BQyW3SSVIJ1U8Ba9A
ingested: 2026-07-08
source_published: 2026年7月8日 09:00
---
# Mem0 vs WorkBuddy：Agent 记忆层的两条路线，谁才是终极答案？
大模型本身是无状态的，一次请求结束后，模型不会记住你是谁，刚刚做过什么，如果想让模型知道之前发生了什么，我们不得不把历史消息丢给大模型，让大模型看到之前的消息，这个也只能解决短期的上下文消息，不能解决Agent的长期协作问题。
一个好用的Agent，不能每次都问用户喜欢什么，它需要记住用户的偏好，记住用户的历史决策以及相关任务状态，并且在未来合适的时候，能够把这些消息找回来，再次丢给大模型，让模型可以在当前事件上做出正确的决策。
这个就是Agent记忆层的，它不是简单的记录了聊天的历史信息，需要把历史交互压缩成可检索，可追述，可演化的长期上下文。
之前我们在开发Agent时候，一般都是自己写代码来做记忆层，包括长期记忆和短期记忆。今天我们来学习一款开源的Agent记忆框架Mem0，看看他的实现方式是什么，是不是可以直接拿到我们的Agent中使用，有没有我们可以借鉴的方法。
## Agent 如何接入 Mem0
github地址 :https://github.com/mem0ai/mem0
有59.9k的star
官网地址：https://mem0.ai/
接入Mem0这个记忆框架，官方给出了三种方式
  * 官方的云端API
  * 自建部署服务
  * 直接使用sdk
这三种方式各有优劣，我们直接看 官方给出的对比图
这三

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/mem0-vs-workbuddyagent-记忆层的两条路线谁才是终极答案.md)

---

