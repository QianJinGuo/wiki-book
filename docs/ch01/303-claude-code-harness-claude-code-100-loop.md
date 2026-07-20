# Claude Code 之父最新访谈：编程已经结束、harness 将消失、Claude Code 将只有 100 行代码、loop 才是未来

## Ch01.303 Claude Code 之父最新访谈：编程已经结束、harness 将消失、Claude Code 将只有 100 行代码、loop 才是未来

> 📊 Level ⭐⭐ | 14.9KB | `entities/claude-code-之父最新访谈编程已经结束harness-将消失claude-code-将只有-100-行代码loop-才是未来.md`

## 核心要点
- **Boris Cherny** 是 Claude Code 的创造者，2024 年 9 月加入 Anthropic Labs 孵化团队
- 2025 年 10 月起模型已能写 100% 代码，Boris 本人从 2026 年起不再手写代码
- 最高纪录：一天提交 150 个 PR，全部通过手机操作
- `/loop` 是他认为最重要的功能——让 AI 在后台定时执行任务
- 预测：一年后 Claude Code 的产品外壳（harness）可能只剩 100 行代码
- 未来趋势：人人都能编程，跨学科通才崛起，10 倍数量创业公司将颠覆现有格局

## 相关资源
- [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/claude-code-之父最新访谈编程已经结束harness-将消失claude-code-将只有-100-行代码loop-才是未来.md)

## 关于 Boris Cherny
Boris Cherny 的履历相当硬核。他出生在乌克兰，1995 年随家人移民美国，祖父是苏联时期的程序员，家里曾堆满打孔卡片。他本科学的是经济学，编程完全自学，18 岁开始创业，后成为 YC 公司第一号员工，在对冲基金、广告技术、创业公司间摸爬滚打。
2017 年进入 Meta 后，他从 IC4 一路升到 IC8（首席工程师），全公司仅几十人达到此级别。在 Meta 期间负责 Instagram 的 Python 到 Hack 迁移，主导 Meta 全线产品的代码质量工作，还曾在日本奈良远程工作一年半，代码产出达到全公司前 1%。
工作之余，他写了 O'Reilly 的书《Programming TypeScript》，创建了旧金山 TypeScript Meetup（全球最大），还做了叫 Undux 的 React 状态管理库，成为 Facebook 内部最流行的状态管理框架。2024 年 9 月加入 Anthropic Labs 孵化团队，该团队产出包括 Claude Code、MCP、Claude Desktop 桌面应用。

## Claude Code 的诞生
Claude Code 的诞生有些偶然。2024 年底 AI 编程的主流形态还是「tab 补全」，但 Boris 团队感觉模型能力远超当时产品所能承载，「有一个巨大的产品溢出」。
前 6 个月 Claude Code 基本不好用，发布后增长平平。真正的拐点是 2025 年 5 月 Opus 4 发布，指数级增长从此开始。团队策略是「为未来 6 个月的模型做产品」，这种超前建设最终被证明赌对了。

## 编程已经解决了
对于「编程已经解决了（coding is solved）」这个说法，Boris 用自己的实践支撑：Claude Code 代码库用 TypeScript 和 React，从 2025 年 10、11 月起模型就能写 100% 代码；到 2026 年他一行代码都没亲手写过。一天几十个 PR 是常态，最高纪录是一天 150 个 PR。
他承认大型复杂代码库和冷门语言模型还搞不定，但「通常答案就是，等下一个模型」。

## 手机就是工位
Boris 现在主要用手机工作。他打开 Claude App，左侧 Code 标签页里同时跑着 5 到 10 个会话，每个会话下挂着多个子 Agent，加起来约几百个 Agent 同时运行。晚上则让几千个 Agent 跑更深层任务。

## Loop 才是未来
Boris 最常用的功能是 `/loop`——让 Claude 用 cron 调度定时任务。他同时跑着几十个 loop：PR 守护（自动修 CI、自动 rebase）、CI 健康维护（自动修 flaky test）、每 30 分钟从 X 抓取用户反馈并聚类整理。4.7 模型已开始自发使用 loop，比如发现数据随时间变化后主动说「我会每 30 分钟给你发一份报告」。
这种「不需要用户教模型怎么用工具」的状态在他看来才是对的。

## 人人都写代码
未来团队形态：Boris 预测会出现越来越多跨学科通才。Claude Code 团队已在这样运作——工程经理写代码，产品经理写代码，设计师写代码，数据科学家写代码，用户研究员写代码，连财务同事都在写代码。「各自专业领域没变，但现在所有人都多了一项能力：编程。」

## AI 时代的护城河
引用 Hamilton Helmer 的「七力模型」，Boris 认为 AI 时代下切换成本和流程能力在下降（模型可帮用户迁移、Claude 4.7 可「爬山算法」式迭代优化流程），但网络效应、规模经济、独占资源依然坚固。他预测未来 10 年会涌现 10 倍数量创业公司颠覆现有格局，因为小团队可做出大公司量级产品，而大公司改造流程、重新培训员工、克服内部阻力都是小团队没有的包袱。

## 印刷术类比
Boris 用印刷术发明做类比：1400 年代欧洲只有 10% 的人识字，印刷术发明后 50 年文献总量超过此前千年总和、书本成本降 100 倍，几百年后全球识字率从 10% 升到 70%。
他认为软件会经历同样事情且速度更快。「写会计软件最好的人也许今天已不再是工程师，而应该是一个真正懂会计的人。因为编程是容易的部分，懂领域才是难的部分。」

## Anthropic 内部实践
Anthropic 内部与外部差距不在模型（用的和外部一样，主要是 Opus 4.7），而在组织和流程。现在内部已没有手写代码，所有 SQL 都是模型写的。多个 Claude Agent 在 loop 中运行，遇到不确定的事会通过 Slack 找其他人的 Claude Agent 沟通——Agent 之间通过 Slack 自主通信协作。真正的领先优势是组织架构和工作流程的变革。

## Harness 将消失
对于「Claude Code 成功是模型功劳还是产品功劳」的问题，Boris 说六个月前觉得大概是 50/50。但他认为随着模型越来越强，产品外壳（harness）重要性会逐渐降低。现在 Claude Code 里的安全机制（prompt injection 防护、命令静态验证、权限模式、human-in-the-loop）未来都会变得不那么重要。他的预测是：一年后 Claude Code 的产品外壳可能只需要 100 行代码。

## MCP 就是答案
Boris 认为知识工作（Co-work 等场景）的答案是 MCP——同样的 MCP 连接器接上 Salesforce、Google Docs、Google Calendar，无论是 Claude AI、Claude CLI 还是 Claude Code 都能用。没有 MCP 的系统，Computer Use 是兜底方案。但他也说这些都不太重要，「MCP 也好，API 也好，只要有某种程序化的接入方式就行。对模型来说，都只是 token」。

## 深度分析
### 1. AI 编程的临界点已过
Boris 的访谈揭示 AI 编程已跨越关键临界点。从 2025 年 10 月起，模型已能独立完成 100% 编码任务，到 2026 年连 Claude Code 创造者本人都停止手写代码。这意味着 AI 编程从「辅助工具」进化为「主要执行者」，人类角色彻底转变为「指挥者」和「验证者」。

### 2. Agent 架构的根本转变
传统软件开发范式中，工具是静态的、需要人类操作。而 Boris 展示的是动态 Agent 生态：loop 驱动的后台任务、Slack 上 Agent 间的自主通信、模型自发使用工具（而不等待人类指令）。这标志软件工程进入「委托式编程」时代——人类定义目标和约束，AI 自主完成任务编排和执行。

### 3. Harness 的商品化趋势
Boris 预测 harness（产品外壳）将大幅简化的观点意义深远。当前 AI 产品的大量工程投入集中在安全护栏、权限控制、human-in-the-loop 等「约束机制」上。当模型能力足够强时，这些约束将变得不那么必要，产品竞争将从「安全可靠的 Agent 框架」转向「高质量的模型能力和领域知识」。

### 4. 软件民主化的历史重演
印刷术打破知识垄断，软件民主化将打破「编程能力」的垄断。Boris 的类比指向一个深刻转变：未来最优秀的软件将来自「最懂领域的人」而非「最会编程的人」。这与 GitLab 备忘录中「深度技术问题供给增加，解决它们的人将成为最稀缺人才」形成有趣对照——两者都指向专业分工的重组，而非简单的技术替代。

### 5. 组织架构的范式冲击
Boris 提到 Anthropic 内部「没有手写代码」，所有 SQL 都是模型写的，且 Agent 间通过 Slack 自主通信。这不仅是工具变化，而是工作流程的根本重构。当 Agent 能自主协作、持续运行、定时报告时，传统管理层级（汇报线、审批流）将受到根本挑战。GitLab 也在同步扁平化组织（移除三层管理层），两者指向同一趋势。

## 实践启示
### 给工程师的建议
1. **掌握 Agent 编排能力**：学习使用 loop、batch 等工具管理多个并行 Agent，理解如何设置调度、监控、异常处理
2. **深化系统设计能力**：代码生成自动化后，系统架构、分布式设计、技术选型等需要深度判断的能力将更稀缺
3. **领域知识优先**：在某些垂直领域，「懂业务」可能比「懂编程」更重要，如 Boris 所说「写会计软件最好的人可能不再是工程师」
4. **适应手机工作流**：Boris 展示的移动优先开发模式值得尝试，在通勤等碎片时间管理 Agent 任务

### 给管理者的建议
1. **重新定义工程师产出**：从「代码行数」转向「解决的问题」和「交付的价值」，GitLab CEO 也提到类似转变
2. **扁平化组织结构**：GitLab 移除三层管理层的做法与 AI 驱动的自主工作流更匹配
3. **建立 AI 优先的开发文化**：参考 Anthropic 内部实践，让 Agent 成为默认工作搭档而非辅助工具
4. **关注 harness 而非模型**：当模型能力差距缩小时，产品体验和组织效率将成为差异化因素

### 给创业者的机会
Boris 预测将涌现 10 倍数量创业公司。小团队能做出大公司量级产品的时代，机会在于：垂直领域的 AI 原生工具、面向 Agent 的基础设施（而非面向人类用户的接口）、帮助企业迁移到 Agent 流程的服务和咨询。

## 相关链接
- [访谈视频](https://www.youtube.com/watch?v=SlGRN8jh2RI)
- [Boris Cherny 的 X](https://x.com/bcherny)
- [Boris 的 Claude Code 使用技巧](https://howborisusesclaudecode.com/)
- [Claude Code](https://claude.ai/code)

## 相关实体
- [LLM-as-a-Verifier: A General-Purpose Verification Framework](ch01/1237-llm.html)
- [你不知道的 Agent：原理、架构与工程实践](../ch03/046-agent.html)
- [告别“氛围编程”：基于 Harness 治理和 SDD 的团队级 AI 研发范式演进与实践](../ch05/018-harness.html)
- [看 AgentRun 如何玩转记忆存储，最佳实践来了！](../ch04/003-agentrun.html)
- [Karpathy 最新访谈：从 Vibe Coding 到 Agentic Engineering](../ch04/235-agentic.html)
- [RAG深度解析：分块、向量化、召回、重排，才是"蒸馏同事skill"的关键](../ch04/267-skill.html)
- [别再把上下文当聊天记录](https://github.com/QianJinGuo/wiki/blob/main/entities/别再把上下文当聊天记录.md)
- [一文带你弄懂 AI 圈爆火的新概念：Harness Engineering](../ch05/052-harness-engineering.html)
- [龙虾装上了，可以用来干啥？分享下我的 OpenClaw 多智能体团队搭建经验！](../ch11/225-openclaw.html)

- [Hermes Agent /goal 长任务运行时架构](../ch04/367-hermes-agent-goal.html)
- [LLM agent脚手架如何具备自进化能力？——以hermes agent为例](../ch03/092-hermes-agent.html)
- [LoongSuite GenAI 可观测语义规范](../ch04/442-loongsuite-genai.html)
- [低代码 Agent、框架 Agent、自研 Agent 决策框架](../ch03/046-agent.html)
- [三器合一：gstack + Superpowers + OpenSpec 工程化 AI 编程实战](../ch05/100-ai-coding.html)

---

