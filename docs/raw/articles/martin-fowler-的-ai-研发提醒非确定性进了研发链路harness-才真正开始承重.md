---
title: Martin Fowler 的 AI 研发提醒：非确定性进了研发链路，Harness 才真正开始承重
source_url: https://mp.weixin.qq.com/s/Ya0M9C-TBY_d3lzcmipRDA
publish_date: 2026-05-10
tags: [wechat, article, openai, agent, harness, rag, coding, llm]
review_value: 7
review_confidence: 7
review_recommendation: neutral
sha256: eb04d301123c26a96435314aaf31ed5d830d20f43f95d18ab6f2d5cb99c1bd9a
---
# Martin Fowler 的 AI 研发提醒：非确定性进了研发链路，Harness 才真正开始承重
> 原文存档：[[raw/articles/martin-fowler-的-ai-研发提醒非确定性进了研发链路harness-才真正开始承重|原文存档]]
## 太长不看版
- Fowler 这次让我最受用的，不是"AI 带来更高抽象"这一层，而是他把变化压回到"软件工程第一次大规模面对一个非确定性协作者"这件事上。
- Vibe Coding 的边界其实挺清楚：原型、一次性工具上很好用；一旦做成长期资产，难的就变成学习循环、代码所有权和系统可理解性。
- TDD、重构、CI、静态检查不仅没过时，反而更扛事了。AI 生成越快，确定性反馈越值钱。
- Harness 不只是个新包装词。把它当成"非确定性适配层"更顺手：上下文、工具、权限、测试、观测、垃圾回收都在这层承重。
- Agentic Engineering 的重点不是把人从工程里抽走，而是把人的工作往目标、边界、验证、治理和经验沉淀这边挪。
- 团队这边可以先慢一点：与其急着搭"全自动 AI 团队"，不如先把六件小事补上——小切片、强验证、仓库内知识、权限边界、错误分类、持续清理。
## 核心观点
### 非确定性进入工程链路
软件工程过去几十年都建立在一台确定性机器上。现在，我们把一个非确定性的协作者接进了研发链路。
AI 研发主线从代码生成更快转向非确定性进入工程系统。
围绕这个核心，很多看上去特别热闹的新词，反而能各归各位：
- Vibe Coding
- Agentic Engineering
- Context Engineering
- Harness Engineering
- Subagents
- Skills
- Agent 控制台
绕来绕去，大多都在回答同一个问题：当 AI 不只是补全两行代码，而是开始读仓库、改文件、调工具、跑测试、开 PR、查日志、修 CI 的时候，整个研发系统怎么消化这种非确定性。
### Harness 是非确定性的适配层
**Harness 是把非确定性能力接入工程系统的那层适配层。**
LangChain 那篇《The Anatomy of an Agent Harness》把公式写得很直接：Agent = Model + Harness。模型出智能，Harness 让智能真正能用上。
OpenAI 的 Harness Engineering 在 Codex 的实践里反复在讲几件很朴素的事：
- 计划是第一等工程资产，复杂任务的执行计划和决策日志要进仓库
- 文档不能只活在 Slack、Google Docs 或者人的脑子里，Agent 看不见，就等于不存在
- 架构规则要交给 linter 和 CI 机械执行，不能只写在 wiki 里
- 技术债要靠持续的小 PR 一直清，而不是攒成一个大坑等专项治理
- 人的品味和边界，要尽量编码到仓库里，让后面跑的 Agent 自动继承
Fowler / Thoughtworks 那篇 Harness Engineering 给出的拆法：
- **guides** 是事前引导：规则、文档、工具描述、架构边界、任务模板
- **sensors** 是事后感知：测试、lint、日志、指标、评估器、错误分类、用户反馈
- **garbage collection** 是持续清理：删掉旧补丁、订正文档、扔掉不再适合新模型的护栏
### Vibe Coding 的边界
Vibe Coding 解决的是怎么把东西做出来。Agentic Engineering 关心的是，做出来之后，人和系统还能不能继续拥有它。
"拥有"不是版权意义上的那种，而是工程意义上的：知道它为什么这样设计、怎么验证、出事了怎么回滚，下次再做同类任务时，能少踩一次坑。
Fowler 对 Vibe Coding 的态度：探索、原型、一次性脚本、临时工具很好用；但长期资产没办法只靠"感觉差不多能跑"。因为软件工程里藏着一条很隐蔽的学习循环——如果 AI 写完之后，人不看、不理解，也不 review，只是在报错时继续往上加 prompt，这条循环就被悄悄掐断了。
### 测试和重构不是旧时代的包袱
AI 生成代码越快，越要把变更切小。小切片还多承担了一件事：限制模型一次性发散的半径。
Fowler 那句"不要让 LLM 做可以确定性计算的事"背后真正的工程味道：
- 如果一个答案能由程序算出来，就让程序算
- 如果一个变更能由重构工具完成，就让重构工具做
- 如果一个风险能由测试、类型、策略、权限系统提前挡住，就别只靠 prompt 祈祷模型这次听话
### 工程师进入了中间循环
Fowler 转述了 Annie Vella 对 158 位工程师的一项研究，里面有个词：supervisory engineering work（监督式工程工作）。
过去我们习惯讲内循环和外循环：
- 内循环是写代码、跑测试、调试
- 外循环是提交、review、CI/CD、发布、观测
AI 接进来之后，好像在中间又长出来一层：工程师要定义任务、组织上下文、监督 Agent 执行、评估输出、把这次的错纠正为下一次的规则，再把经验沉回系统。
工程师从控制光标进入目标、边界、验证和系统演进的中间循环。
### 六件小事
1. **把任务切小**：从可以独立验证的小任务下手
2. **把知识放回仓库**：让 Agent 能拿到上下文
3. **让验证先跑起来**：测试、类型约束、lint、架构边界检查
4. **权限按风险分层**：读/写/执行/删除/合并分级管理
5. **错误要分类**：分清参数错误、环境错误、权限错误、超时、供应商错误等
6. **把经验写回 Harness**：每次失败后，往系统里多塞一点确定性
## 参考来源
- [The Pragmatic Engineer 访谈](https://www.becurious.to/shows/the-pragmatic-engineer/episodes/the-pragmatic-engineer-how-ai-will-change-software-engineering-with-martin-fowler-substack/transcript)
- [Martin Fowler: Some thoughts on LLMs and Software Development](https://martinfowler.com/articles/202508-ai-thoughts.html)
- [Martin Fowler Fragments: March 16, 2026](https://martinfowler.com/fragments/2026-03-16.html)
- [Harness engineering for coding agent users](https://martinfowler.com/articles/harness-engineering.html)
- [Mitchell Hashimoto: My AI Adoption Journey](https://mitchellh.com/writing/my-ai-adoption-journey)
- [OpenAI: Harness engineering: leveraging Codex in an agent-first world](https://openai.com/index/harness-engineering/)
- [LangChain: The Anatomy of an Agent Harness](https://www.langchain.com/blog/the-anatomy-of-an-agent-harness)
- [Simon Willison: The lethal trifecta for AI agents](https://simonwillison.net/2025/Jun/16/the-lethal-trifecta/)
---
*来源：[[raw/articles/martin-fowler-的-ai-研发提醒非确定性进了研发链路harness-才真正开始承重|架构师 - 2026-05-07]]*