---
title: "大厂公开干货！Claude Skill 的正确搭建与使用方式"
source_url: "https://mp.weixin.qq.com/s/i40ltoT_LodyFmv7FT5HUQ"
publish_date: 2026-07-01
tags: [wechat, datawhale, anthropic, skill, agent, best-practices]
review_value: 7
review_confidence: 7
review_recommendation: neutral
sha256: e6cd082c0100801fe57f6a8288a6b3ffb79421e6a4cd013aab80d84fd0c06533
---

# 大厂公开干货！Claude Skill 的正确搭建与使用方式

来源：Datawhale

Anthropic 自己内部是怎么用 Claude Code Skills 的，这次终于公开了。
他们把内部团队的用法做了一次完整复盘：Skills 分成哪 9 类、哪类最值得花力气、怎么写才真的有用。这些经验之前只在 Anthropic 内部流转，现在一次讲清。

## 一、先把 Skill 理解对

Skill 不只是几段提示词，它更接近一个围绕任务组织起来的文件夹。
这个文件夹里可以放 SKILL.md，也可以放参考文档、脚本、模板、示例、hooks，甚至放会被后续任务继续读取的数据。Claude 调用 Skill 时，拿到的其实是一套完成任务所需的工作材料。

## 二、Anthropic 把内部 Skills 归成了 9 类

Anthropic 盘了一遍内部的 Skills，最后大致分成了 9 类。这 9 类连起来看，其实很像一条完整的软件工作流，从补知识到写代码，再到验证、部署、排障和运维。

### 前三类：给模型补知识、补验证、补数据
- **第一类：library 和 API reference** - 给模型解释某个库、CLI 或 SDK 在团队内部到底该怎么用，把容易用错的规则和 gotchas 写清楚
- **第二类：product verification** - 负责判断产出有没有真的工作，比如在无头浏览器里完整跑一遍注册和结账流程。Anthropic 明说这类对输出质量提升最明显，值得让工程师专门花一周打磨
- **第三类：data fetching and analysis** - 连着数据仓库和监控系统，把取数方法、字段约定和常见分析路径封装好

### 中间三类：开始接住团队里的日常流程
- **第四类：business process and team automation** - 把重复发生的团队流程压成一个命令就能跑的工作流，比如只输出相对昨天增量的 standup，或固定格式的周报
- **第五类：code scaffolding and templates** - 生成那些有固定骨架、但又带着大量自然语言约束的代码，比如新 service 或迁移文件
- **第六类：code quality and review** - 让代码尽量符合团队的质量标准。典型例子是 adversarial-review subagent

### 后三类：已经连到生产环境了
- **第七类：CI/CD and deployment** - 把代码从开发态推到上线态，比如 babysit-pr、deploy-<service>
- **第八类：runbooks** - 入口不是"我要写什么"，而是"现在出了什么症状"。报警、Slack thread、request ID 进来，给出结构化结论
- **第九类：infrastructure operations** - 资源清理、依赖治理和成本排查。常带破坏性，Skill 里要写清 guardrail

## 三、Anthropic 真正强调的：写对

### 好的 Skill 都很聚焦
最好的 Skill 往往都很聚焦。能清楚落进某一类里的 Skill 通常更稳；试图同时覆盖太多目标的 Skill 反而更容易把模型带乱。

### 所有类型里，最看重「验证」
Anthropic 特别强调 verification，建议让工程师单独花一周把验证类 Skill 做到足够好。两个实用建议：
1. 让 Claude 录下自己测试过程的视频
2. 在关键节点加程序化断言（状态变化、事件落库、目标页面状态）

### 真正有价值的内容是 gotchas
最有信号量的部分不是通用步骤，而是 gotchas。Claude 本来就会写代码、会读代码库。"默认它也会做"的东西写进 Skill 只会增加上下文。
真正值得写的是那些会把模型从默认思路里拽出来的细节：
- subscriptions 表是 append-only，要找最高 version，不能只看最新 created_at
- 同一字段在不同服务里叫不同名字（@request_id vs trace_id）
- staging 返回 200 不代表 webhook 真处理成功了，还得去看 payment_events

## 四、具体怎么写

1. **别把显而易见的话再写一遍** - Skill 不是给人看的摘要，它要补的是模型默认拿不到或容易走偏的信息
2. **SKILL.md 更像目录，不该写成大杂烩** - 做目录和路标，具体资料按需分发（stuck-jobs.md、references/api.md、assets/）
3. **Skill 不要写得太死** - 给关键规则，但留出适应空间
4. **setup 要提前想好** - 把配置放进 config.json，缺了就先问用户
5. **description 要直接服务触发** - 不是摘要，而是触发条件说明

## 五、Skill 用深之后：记忆、脚本和 hooks

- **记忆**：standup-post 把每次输出记进 standups.log，下次运行先读历史
- **脚本**：预置 helper functions，Claude 把回合花在编排上
- **hooks**：只在 Skill 被调用时生效。/careful 拦 rm -rf、DROP TABLE 等高危操作；/freeze 阻止对指定目录外的 Edit 和 Write

## 六、团队大规模用 Skill：分发和治理

两条主路线：repo 内 check-in 和插件 marketplace。
