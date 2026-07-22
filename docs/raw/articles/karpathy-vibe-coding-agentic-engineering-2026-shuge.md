---
source_url: https://mp.weixin.qq.com/s/r7haj0lwGNgtCnbfx574Hg
ingested: 2026-07-15
sha256: 47000b5f0af1abc7ba4e8babe7a4a71b76a6a0391991920082f9f992c830a7eb
source_published: 2026-07-15
title: "Karpathy 最新判断：Vibe Coding 没死，Software 3.0 正在分出 Agentic Engineering"
author: 运维有术
feed_name: 术哥无界
---

Karpathy 最新判断：Vibe Coding 没死，Software 3.0 正在分出 Agentic Engineering

2025 年 2 月，Karpathy 给 Vibe Coding 起了名字。2025 年 6 月，他系统阐述 Software 3.0。到了 2026 年，他又用 Agentic Engineering 指代专业开发中的另一套纪律。三者并非互相替代的新名词。Software 3.0 是编程范式，Vibe Coding 是低门槛、低监督的特殊工作方式，Agentic Engineering 则是在这套范式中交付专业软件的工程纪律。

1. Karpathy 为什么此时值得听

Sequoia AI Ascent 举办于 2026 年 4 月 20 日。Karpathy 在那场对话中重述了 Software 3.0，也划清了 Vibe Coding 与 Agentic Engineering 的边界。一个月后的 5 月 19 日，他才宣布加入 Anthropic。那场对话发生在入职前。

他参与过 OpenAI 的早期研究，也曾负责 Tesla 的 AI 工作。后来持续通过演讲、课程和个人文章解释 LLM。2017 年提出 Software 2.0，2025 年命名 Vibe Coding、阐述 Software 3.0，2026 年又把专业开发从原始 Vibe Coding 中单独拎出，暂称 Agentic Engineering。

2. Software 3.0 先换了编程对象

Software 1.0 编写明确规则。Software 2.0 配置数据、目标函数和网络。Software 3.0 再往前走一步：开发者用 prompt、上下文、示例、工具、记忆和指令去编程一个 LLM。

但 Software 3.0 没有清空前两种范式。身份、支付、权限、账务和审计仍适合确定、可追踪的 Software 1.0；底层模型仍来自 Software 2.0；自然语言交互与 agent 编排才落在 3.0。

3. Vibe Coding 没死，专业开发分出来了

2025 年 2 月，Karpathy 描述 Vibe Coding：用语音下指令，不读 diff，接受 agent 的改动，报错就贴回去，甚至忘掉代码本身。它的作用：用很低的启动成本，把一个念头尽快变成能运行的东西。

问题出在失败成本变化之后。MenuGen 的原型很快，接上真实用户后却撞上认证、支付、部署、密钥和生产配置。照原始含义一路 vibe 下去并不是好主意。

于是 2026 年 2 月，他用 Agentic Engineering 暂称专业工作流：agent 承担代码生成，人负责规格、编排、监督、审查和结果。

4. AI 为什么不能一路只管 vibe

模型的能力并不平滑。Karpathy 用过两个说法：
- Ghost 而非 Animal：前沿 LLM 从互联网中的人类文本痕迹学习，像被召唤出的文字幽灵
- Jagged Intelligence（锯齿状智能）：模型能处理大型代码库或漏洞任务，却会在普通常识上犯低级错误

5. 可验证性只是支撑，不是主命题

Agentic Engineering 需要测试、审查和反馈回路。但 verifiability 只是工程纪律中的一件工具。一个任务即便容易验收，如果训练体系从未认真覆盖，模型也未必擅长。自主度设置应该看一组条件：结果能否验证、失败是否可逆、模型是否见过相似分布、业务损失有多大、责任由谁承担。

6. 人类能力要从使用力转向理解力

Karpathy 引用并认同了一句话：You can outsource your thinking, but you can't outsource your understanding. 思考过程可以委托，理解不能转交。工具操作会折旧，对用户、系统和失败语义的理解反而更值钱。

7. 产品经理该改哪几件事
- 先判断产品是否还需要存在
- 把 Demo 与可交付状态分开
- 按风险配置 agent 自主度
- 评审 agent 的工作契约：输入规格、编排、权限边界、测试反馈、审查和最终责任
- 流程轻重应跟着失败成本走

8. 回到 Karpathy 的那条主线

Software 3.0 让自然语言、上下文和工具调用成为新的编程材料；Vibe Coding 降低软件创作门槛；Agentic Engineering 把规格、验证、审查和责任重新接回专业开发。原型阶段可以借 Vibe Coding 换速度。进入真实责任场景后，就要切换到 Agentic Engineering。Vibe Coding 没有消失。该消失的，是拿原型速度冒充工程成熟度的侥幸。

来源：Sequoia AI Ascent 2026：sequoiacap.com/article/ai-ascent-2026
Karpathy 的 AI Ascent 辅助转录：karpathy.bearblog.dev/sequoia-ascent-2026
Karpathy 加入 Anthropic 原帖：x.com/karpathy/status/2056753169888334312
Software 3.0 演讲：youtube.com/watch?v=LCEmiRjPEtQ
MenuGen 复盘：karpathy.bearblog.dev/vibe-coding-menugen/
Vibe Coding 原帖：x.com/karpathy/status/1886192184808149383
Agentic Engineering 回顾帖：x.com/karpathy/status/2019137879310836075
Animals vs Ghosts：karpathy.bearblog.dev/animals-vs-ghosts/
Jagged Intelligence 原帖：x.com/karpathy/status/1816531576228053133
Karpathy 的 Verifiability 文章：karpathy.bearblog.dev/verifiability/
