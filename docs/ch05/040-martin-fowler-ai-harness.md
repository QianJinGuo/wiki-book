# Martin Fowler 的 AI 研发提醒：非确定性进了研发链路，Harness 才真正开始承重

## Ch05.040 Martin Fowler 的 AI 研发提醒：非确定性进了研发链路，Harness 才真正开始承重

> 📊 Level ⭐⭐ | 12.3KB | `entities/martin-fowler-的-ai-研发提醒非确定性进了研发链路harness-才真正开始承重.md`

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

## 深度分析
### 1. 非确定性协作者是软件工程范式的根本性变化
Fowler 最有穿透力的洞察，不是"AI 带来更高抽象"，而是把这个问题压回到"软件工程第一次大规模面对一个非确定性协作者"。过去几十年，软件工程的所有方法论——TDD、CI/CD、重构、静态分析——都建立在一台确定性机器上。AI 生成越快，确定性反馈环就越值钱，而非越多余。这个翻转是理解所有后续"新概念"的起点。

### 2. Harness 是非确定性进入工程系统的适配层，不是新包装词
LangChain 的公式"Agent = Model + Harness"说清楚了：模型出智能，Harness 让智能真正能用。OpenAI 的 Harness Engineering 实践强调"计划是第一等工程资产"、"文档 Agent 看不见就等于不存在"、"架构规则要交给 linter 机械执行"。Fowler/Thoughtworks 的拆法是 guides（事前）+ sensors（事后）+ garbage collection（持续清理）。两者描述的是同一套机制的工程视角和架构视角，不是两套不同的东西。

### 3. Vibe Coding 解决"怎么做出"，Agentic Engineering 解决"怎么拥有"
"拥有"不是版权意义，是工程意义：知道它为什么这样设计、怎么验证、出事了怎么回滚，下次同类任务能不能少踩一个坑。Vibe Coding 在探索、原型、一次性工具上很有效；但掐断学习循环的代价在长期资产上会成倍放大——代码越写越多，上下文越来越混乱，每次修改都在埋雷。Fowler 的立场不是否定 Vibe Coding，而是给它划了一条清晰的适用边界。

### 4. 测试和重构不是旧时代包袱，而是 AI 时代的价值锚
"不要让 LLM 做可以确定性计算的事"这句话背后是：确定性答案让程序算，重构工具完成的事交给重构工具，测试和类型系统能挡住的风险别只靠 prompt。这个原则在 AI 时代反而更扛事——AI 生成越快，变更切越小，确定性反馈环就越能限制模型一次性的发散半径。

### 5. 六件小事的内在逻辑：把人的经验不断编码为系统确定性
Fowler 提出的六件小事不是零散建议，而是一个不断把"人判断"替换为"系统确定性"的循环：任务切小→知识进仓库→验证先跑→权限分层→错误分类→经验写回 Harness。每次失败后往系统里多塞一点确定性，长期积累下来，Harness 的容量决定了 Agent 能稳定承担多少工作。这是 Harness Engineering 最务实的落地路径。
---

## 实践启示
1. **先把团队内 AI 翻车案例做一次系统性分类**。区分参数错误、环境错误、权限错误、供应商错误、超时错误——分不清类型就没法往 Harness 里写对应的处理规则。分类是定向的前提。
2. **架构规则必须进入 linter/CI，不能只写 wiki 或只靠 prompt**。wiki 是给人看的，linter 是给 Agent 看的。一个有效规则的标准是：Agent 跑偏时，CI 能自动拦住，而不是靠人 Review 发现。
3. **知识进仓库的判断标准：Agent 看不见就等于不存在**。Slack 里的决策、Google Docs 里的规范、人脑子里的经验——这些对 Agent 都是黑洞。把它们转成 Markdown、JSON schema、架构约束文件，是 Harness 建设最基础也最容易被跳过的一步。
4. **技术债用持续小 PR 清，不做专项治理**。Fowler 和 OpenAI Harness Engineering 的共识是：大坑等不来专项治理，只能靠持续小动作消化。把这一条写成团队规范，比一次技术债清理大会更有效。
5. **从六件小事的第一件开始，而不是搭全链路 Harness**。先把任务切小这件事做到位：能否独立验证、边界是否清晰、完成标准是否明确——这把钥匙开不了，再好的 Harness 设计也承不住。
---

## 参考来源
- [The Pragmatic Engineer 访谈](https://www.becurious.to/shows/the-pragmatic-engineer/episodes/the-pragmatic-engineer-how-ai-will-change-software-engineering-with-martin-fowler-substack/transcript)
- [Martin Fowler: Some thoughts on LLMs and Software Development](https://martinfowler.com/articles/202508-ai-thoughts.html)
- [Martin Fowler Fragments: March 16, 2026](https://martinfowler.com/fragments/2026-03-16.html)
- [Harness engineering for coding agent users](https://martinfowler.com/articles/harness-engineering.html)
- [Mitchell Hashimoto: My AI Adoption Journey](https://mitchellh.com/writing/my-ai-adoption-journey)
- [OpenAI: Harness engineering: leveraging Codex in an agent-first world](https://openai.com/index/harness-engineering/)
- [LangChain: The Anatomy of an Agent Harness](https://www.langchain.com/blog/the-anatomy-of-an-agent-harness)
- [Simon Willison: The lethal trifecta for AI agents](https://simonwillison.net/2025/Jun/16/the-lethal-trifecta/)
- → [Harness Engineering 实体](/ch05-010-harness-engineering-ai-从-聪明-到-可靠-的第三代工程范式//)：Harness 部分与该实体高度互补，提供更完整的框架拆解
- → [2026 Harness 工程survey](/ch04-069-agent-harness-engineering-a-survey//)：行业层面的 Harness 工程全景图
- → [生产级 Harness 工程](/ch05-038-agent生产级harness工程指南//)：侧重生产环境的治理与 control plane 实践

---

