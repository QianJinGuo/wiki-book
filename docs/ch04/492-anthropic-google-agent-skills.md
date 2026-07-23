# 从 Anthropic 到 Google：Agent Skills 正在进入\"设计模式\"阶段

## Ch04.492 从 Anthropic 到 Google：Agent Skills 正在进入\"设计模式\"阶段

> 📊 Level ⭐⭐ | 5.8KB | `entities/从-anthropic-到-googleagent-skills-正在进入设计模式阶段.md`

## 深度分析

Google Cloud Tech 发布的《5 Agent Skill design patterns every ADK developer should know》将常见 Skill 分为 5 类：Tool Wrapper、Generator、Reviewer、Inversion、Pipeline。这篇文章的核心价值不在于新增了多少名词，而在于补上了 Skills 讨论的又一块缺口：从「格式怎么写」继续演进到「工作流怎么设计」 ^。Anthropic 先解决了 Skill 的格式和运行机制问题，Google 则补上了 Skill 的内容设计模式 ^。

Skill 的本质是「过程资产」而非「提示词模板」。提示词模板解决的是单次对话如何表达，过程资产解决的是这类事情以后怎么做 ^。Skill 中的每个句子都承担运行时职责：触发词决定是否被加载，步骤顺序影响 Agent 是否跳步，检查清单影响结果评价，负面约束决定是否越权 ^。这解释了为什么 Skill 不适合被看成「更长的提示词」——它的每个组成部分都直接影响 Agent 在运行时的行为模式 ^。

Skill 和 Harness 是同一件事的两面。Harness 负责运行时主循环：上下文怎么组织、工具怎么调、状态怎么留、错误怎么反馈、权限怎么收口。Skill 负责把某类可复用方法带进运行时 ^。可以这样理解：Skill 是 Harness 可以按需加载的过程模块 ^。这也解释了为什么从 Claude Code、Codex CLI 到 Cursor、Gemini CLI，再到 Vercel、Trail of Bits、Hugging Face、Sentry，都在围绕同一个 SKILL.md 文件做工程 ^。

Skill 的真正壁垒在于团队经验的系统性沉淀，而非文档写作能力。Zak El Fassi 提出的 Skills-Driven Development 朴素但能形成复利 ^。当一个资深工程师说「Skill is the code」时，更准确的理解是：过去写在手里、脑子里、团队习惯里的工作方式，正在被写成 Agent 可执行的接口 ^。Kaxil Naik 几个月没有手写代码，花大量时间迭代 Skills、Hooks、CLI、MCP 和集成——这句话值得停下来想一想，当工程经验可以被「编程」进 Agent 时，工程师的生产力杠杆发生了根本性变化 ^。

Google 的 5 个模式，本质上是在回答：团队经验进入 Agent 运行时以后，内部会长成哪些稳定结构 ^。每个模式背后都对应一种 Agent 常见失败：Tool Wrapper 解决缺领域知识，Generator 解决输出漂移，Reviewer 解决检查标准混乱，Inversion 解决需求没问清，Pipeline 解决复杂流程跳步骤 ^。

## 实践启示

先判断任务形态，再决定 Skill 类型。写 Skill 时，先问一句：这个 Skill 主要是在注入知识、生成模板、审查结果、收集需求，还是跑流程？如果是知识注入，主体接近 Tool Wrapper；如果是输出格式稳定，接近 Generator；如果是质量门禁，接近 Reviewer；如果是模糊需求，前面先放 Inversion；如果有多阶段和验收点，再上 Pipeline ^。

description 是路由契约，不是简介。触发范围太宽，Agent 会乱用；太窄，又可能用不上 ^。更清楚的写法，是说明具体场景：当用户要发布 Next.js 服务到 Vercel、检查预览环境、处理构建失败、回滚部署时使用 ^。

把大块知识、模板和确定性动作从主提示拆出去。SKILL.md 如果无限变长，很快会变成另一个系统提示词。稳定但很长的规范放 references/；固定输出模板放 assets/；确定性、重复性、容易出错的动作尽量放 scripts/ ^。

明确门控点：哪些步骤需要停下来。需求没问完，不生成架构方案；API 清单没确认，不生成最终文档；测试没跑过，不宣称修复完成；风险项没分级，不进入发布建议；破坏性操作没确认，不执行 ^。

Skill 适合让 Agent 理解和应用流程，但安全底线、权限控制、审计记录更适合下沉到确定性更强的层。如果某条规则每次都要成立，更适合用 Hook 这类确定性机制强制，而不是只写在提示或 Skill 里 ^。

## 相关实体
- [Cong Anthropic Dao Googleagent Skills Zhengzai Jinru Sheji Moshi Jieduan](ch04/399-agent-skills.html)
- [Anthropic Google Agent Skills Design Patterns](ch04/372-anthropic-google-agent-skills.html)
- [Anthropic 14 Skill Patterns Best Practices](../ch01/322-anthropic-14-skill.html)
- [Anthropic 官方技能最佳实践14 个可复用的 Agent Skills 设计模式](ch04/399-agent-skills.html)
- [Anthropic Agent Skills Design Patterns 14](ch04/279-anthropic-agent.html)

→ [原文存档](https://github.com/QianJinGuo/wiki-book/tree/main/docs/raw/articles/从-anthropic-到-googleagent-skills-正在进入设计模式阶段.md)
- [nature | anthropic：蒸馏过程潜意识传递行为偏好](../ch05/090-ai.html)

---

