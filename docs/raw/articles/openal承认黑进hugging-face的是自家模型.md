---
title: "OpenAI 承认黑进 Hugging Face 的是自家模型"
source: wechat
source_url: https://mp.weixin.qq.com/s/DPdL84k27BNYHdzokwA9dA
ingested: 2026-07-24
feed_name: 夕小瑶科技说
source_published: 2026-07-22
sha256: 9b8983dc7b0867faca15b468aad3238e48d44edb6c9da178d9b81e943c1b3f9d
---

# OpenAl承认黑进Hugging Face的是自家模型

昨天我们发了一篇文章， [ Hugging face 自曝遭受了一场神秘 Agent的自主攻击，但不知道是谁。 ](<https://mp.weixin.qq.com/s?__biz=MzIwNzc2NTk0NQ==&mid=2247618750&idx=1&sn=0da416e48027a6ed99183e539428a019&scene=21#wechat_redirect>)

今天，凶手找到了。

是 OpenAI 自己的模型，而且奥特曼亲口承认了。

OpenAI  ** 今天发文确认，这起事件来自自家的一次网络攻防能力测试。  **

参与测试的是一组模型，包括 GPT-5.6 Sol 和一个更强预发布模型。

并且为了测试模型的极限能力，还特意降低了网络安全、拒答、拦截机制。

Hugging Face 原本不在测试范围内。

但是模型自身推断 Hugging Face 可能存着相关模型、数据集或“答案”。于是它开始找能让自己“作弊通关”的信息，最后通过凭证、零日漏洞、远程代码执行等链路，打到了 Hugging Face 的生产环境。。。

要看它怎么一路黑进 Hugging Face 的数据库，得先说说这场测试是怎么设置的。

##  ◈  为了测出模型上限，OpenAI 放松了安全限制

这套测试叫 ExploitGym，是一场给 AI 准备的网络攻防考试。

模型要在一个封闭环境里找漏洞、完成任务，按设计不能接触外面的真实系统。

为了测出模型到底有多强，OpenAI 放宽了平时会让模型拒绝危险操作的限制，也没有开启正式环境中专门拦截高风险网络活动的安全检查。

这项评测就是要观察  ** 减少这些拦截  ** 后，模型究竟能走到哪一步。

这下好了，安全检查一放开，负责隔离模型的环境出了问题。模型真的摸到了外网。

其实这组模型本来不能直接上网，只能通过 OpenAI 内部的一项服务下载需要的软件。

然而这项服务里藏着一个连开发它的公司都不知道的漏洞。既然没人知道，自然也还没来得及修。

模型就从这个缺口钻了进去。安全行业把这种漏洞叫作“零日漏洞”。

模型借此进入 OpenAI 的研究网络，拿到更高权限，又在几台内部机器之间继续寻找。

终于连上互联网以后，模型开始去网上找答案，它们判断 Hugging Face 可能存着 ExploitGym 的相关材料，于是继续寻找进入 Hugging Face 的方法。

由于Hugging Face 平时也会允许用户上传数据集，自动处理这些文件。

这就给模型打开了继续进入内部系统的通道。之后，它们又接触到部分云服务和系统访问密钥。

最终读到了 Hugging Face 正在使用的业务数据库，评测答案就存放在里面。

##  ◈  答案拿到了，风险却走出了实验室

OpenAI 称，评测中的这组模型当时处于“过度专注”（hyperfocused）状态，一直盯着 ExploitGym 的答案。

从 OpenAI 公布的行动路径看，Hugging Face 并非预先给定的目标。模型取得公网访问后，判断那里可能存有题解，于是继续寻找入口。

模型只有一个目标——完成任务，取得最高成绩，行动范围不断扩大。模型每遇到一个障碍，就继续寻找下一条路。走到第三方生产系统时，它仍在完成任务，这场评测就越出授权范围了。

事故发生后，OpenAI 开始收紧测试环境。模型可以访问哪些地方、能拿到多大权限，都会受到更严格的限制。测试过程中出现异常，也要更早发现和阻止。

虽然这些措施可能会拖慢研究进度，但 OpenAI 已经开始执行。

目前，OpenAI 仍在和 Hugging Face 一起调查。模型利用的那个软件漏洞已经报告给提供方，正在修补。OpenAI 也会向 Hugging Face 提供相关模型，帮助它加强安全防护。

这类网络安全模型还会继续研究。只是下一次再做类似测试，模型的活动范围和权限会被管得更严，异常操作也会更早被发现和停下来。

参考文献

[1]  OpenAI 官方说明：OpenAI and Hugging Face partner to address security incident during model evaluation:  ` https://openai.com/index/hugging-face-model-evaluation-security-incident/  `

[2]  Hugging Face 官方通报：Security incident disclosure — July 2026:  ` https://huggingface.co/blog/security-incident-july-2026  `

[3]  Axios：OpenAI says Hugging Face breach caused by one of its models:  ` https://www.axios.com/2026/07/21/openai-says-hugging-face-breach-caused-by-one-its-models  `
