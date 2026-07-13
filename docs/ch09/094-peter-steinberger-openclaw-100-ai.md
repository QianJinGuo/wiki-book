# Peter Steinberger / OpenClaw — 100个AI程序员案例

## Ch09.094 Peter Steinberger / OpenClaw — 100个AI程序员案例

> 📊 Level ⭐⭐ | 7.5KB | `entities/peter-steinberger-openclaw-100-ai-agents.md`

## 概述
OpenClaw之父Peter Steinberger（@steipete）用3人团队+100个Codex AI agent运行软件开发流水线，30天花费$130万（OpenAI报销）。展示了token作为新生产资料的可能性。

## 关键数据
- **团队规模**：3人
- **AI agent数量**：约100个Codex实例
- **30天成本**：$1,305,088.81（约900万人民币）
- **Token消耗**：6030亿
- **API请求**：760万次
- **OpenAI报销**：是

## AI代理承担的工作
- 审PR
- 找安全漏洞
- 去重issue
- 改bug
- 监控benchmark
- 发现回归后发到Discord
- 听完会议后直接开PR
核心洞察：软件开发真正贵的是沟通、理解、上下文切换、审查、回归、修复、等待、重复劳动。

## CodexBar
Peter开发的macOS菜单栏工具，追踪Codex、Claude、Cursor、Gemini、Copilot等AI编程工具的：

- 使用窗口
- credit消耗
- 成本
- 重置时间
意义：token正在成为新的「生产资料」。

## 思考
Steinberger：「我在探索，如果token成本不是问题，软件开发会变成什么样。」
模型降价趋势：$130万 → $13万 → $1.3万。100个AI agent同时工作将从硅谷独家变为三人创业团队的基本操作。

## 参考资料
## 深度分析
Peter Steinberger的100个AI Agent实验揭示了当前AI编程工具在工程规模应用中的真实成本结构和组织变革含义，其核心洞察远超"花130万美元"这一表面数字。
**1. $130万月成本的分布揭示了token经济学：6030亿token、760万次API请求，平均每百万token约$2.16——这是Codex Speed的定价区间。** 但更重要的是：这130万里大部分是OpenAI报销的，Steinberger实际上在免费验证其AI编程流水线的有效性。真正的成本是$130万；如果是自费，100个并发Codex实例的经济账完全不同——按照当前$2-3/M的定价，个人开发者或小型团队永远无法负担这种规模。这意味着"100个AI agent同时工作"从一开始就是大厂特权，而非创业公司的现实选项。
**2. Steinberger的核心洞察——"软件开发真正贵的是沟通、理解、上下文切换、审查、回归、修复、等待、重复劳动"——直接指向了AI Agent在软件工程中的真实价值定位。** AI Agent最擅长的是高重复性、低上下文切换成本的任务（审PR、找安全漏洞、去重issue），而人类工程师最适合高价值判断和复杂上下文理解的任务。这不是"AI取代人类"，而是"AI把人类从不值得做的事情中解放出来"。
**3. CodexBar的开发者工具credit追踪功能是一个被低估的创新——它将token消费从"看不见的后台成本"变成了"可见的生产力仪表盘"。** 当开发者能看到每次代码补全花费了多少token，决策行为会随之改变：更少的无谓生成、更高效的提示词设计。这可能催生一种新的"token效率优化"工程文化——类似于Google时代工程师优化延迟和吞吐量的文化。
**4. 模型降价趋势（$130万→$13万→$1.3万）对创业公司意味着什么？** Steinberger的判断是："100个AI agent同时工作将从硅谷独家变为三人创业团队的基本操作。"但这个预测忽略了一个关键约束：即使成本下降100倍，100个并发Agent的组织协调（orchestration）、输出质量控制（避免100个agent产生100种不一致的实现风格）和人类审查的瓶颈仍然存在。成本不是制约因素，工程组织能力才是。
**5. token作为"新生产资料"的概念需要解构：token的本质是可量化的注意力单位。** 当注意力可以被量化、购买和分配时，软件工程的生产函数就改变了——不再是"工程师时间 × 技能水平"，而是"token投入 × 模型能力 × 组织协调效率"。这对如何评估AI编程工具的投资回报率（ROI）提出了全新框架：不是"AI生成了多少代码"，而是"AI生成的代码节省了多少高价值工程师的时间"。

## 实践启示
**对于工程团队管理者：** 评估AI编程工具ROI的正确框架不是"节省了多少代码行"，而是"高价值工程师的时间有多少被低价值重复任务占用"——用Steinberger的100 agent矩阵重新审视团队的工作结构，识别哪些任务值得分配给AI、哪些必须保留给人类。
**对于AI工具采购决策者：** CodexBar式的token追踪能力是评估工具实际生产力的关键基础设施。没有可见的token消耗数据，团队会系统性地过度使用AI（无谓的补全请求），而不是把AI集中用于高价值任务。
**对于创业团队：** 等待"成本下降到可负担水平"而非现在就开始小规模实验AI Agent工作流，可能是一个错误。Steinberger的经验表明，真实的组织学习曲线比工具成本更难解决——如何协调100个AI agent与人类工程师的协作、如何建立代码风格一致性标准，这些组织能力需要时间积累，不是在成本降低后一夜之间就能建立的。
**对于AI Agent框架开发者：** 多agent协调系统（multi-agent orchestration）将是下一代AI编程工具的核心竞争壁垒。成本降低后，谁的协调框架能最有效地将任务分配给合适的agent、聚合结果、解决冲突，谁就能在"百agent时代"占据优势。

## 参考资料
- [The Decoder: For $1.3 Million a Month](https://the-decoder.com/for-1-3-million-a-month-openclaw-founder-peter-steinberger-runs-100-ai-agents-that-code-review-prs-and-find-bugs/)
- [X: @steipete](https://x.com/steipete/status/2055346265869721905)

## 相关实体
- [Claw Chain Cyera Research Unveil Four Chainable Vulnerabilities In Openclaw](ch09/072-claw-chain-cyera-research-unveil-four-chainable-vulnerabili.html)
- [Openclaw Agent Loop Design Patterns](../ch01/1132-openclaw-agent.html)
- [Autoresearch Multi Agent Software](../ch03/045-agent.html)
- [Hiclaw V110 K8S Hermes Worker](../ch01/214-0.html)
- [Pi Openclaw Coding Harness](../ch11/225-openclaw.html)

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/ai-powered-honeypots-turning-the-tables-on-malicious-ai-agents.md)

- [OpenAI Codex Speed](https://developers.openai.com/codex/speed)
→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/3-persons-100-ai-programmers-1-3-million-openai-pays.md)

---

