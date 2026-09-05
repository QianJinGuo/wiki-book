---
source_url: "https://mp.weixin.qq.com/s/WjsbxrqdCXfNMlkwDpekOg"
ingested: 2026-06-18
sha256: 309ec62da91d38eb9afaa12cc87a4fd82f97a8dabeb9be36740e5ab20fac225b
---

# Code Review

When reviewing code:

1. Identify the behavioral change.
2. Check correctness risks first.
3. Check security and data handling.
4. Check missing tests.
5. Return findings ordered by severity.

这里最关键的是 description。

它不是给人看的简介。

它是给模型判断"什么时候该用这个 Skill"的触发线索。

描述太泛，Skill 会乱触发。

描述太窄，真正需要时又想不起来。

好的描述应该包含：

任务类型
适用对象
期望产物
不要覆盖太多无关场景
渐进加载：Skill 为什么适合长文档

Skill 最大的工程价值，不只是"把 prompt 存成文件"。

而是渐进加载。

Agent 不应该一启动就把所有团队规范、所有流程、所有示例都塞进上下文。

那会很快把上下文撑爆。

更合理的方式是三层。

第一层，只让模型知道有哪些 Skill，以及每个 Skill 的简短描述。

第二层，当任务匹配时，读取对应 SKILL.md。

第三层，如果 SKILL.md 还引用了模板、脚本、参考文档，再按需读取。

这就是 Skills 很适合放团队知识的原因。

它既不是隐藏黑箱，也不是一次性塞满上下文。

它是：

先暴露目录
再加载说明
最后按需读取细节

Skill 目录里可以放什么

不要把 Skill 理解成只有一个 Markdown。

一个成熟 Skill 通常会有这些东西：

SKILL.md
references/
templates/
scripts/
assets/

references/ 适合放长规范。

比如公司代码规范、写作风格、审查清单。

templates/ 适合放固定输出格式。

比如 PR Review 模板、发布说明模板、事故复盘模板。

scripts/ 适合放可执行辅助脚本。

比如把 Markdown 转 HTML、跑格式化、生成报告。

assets/ 适合放固定素材。

比如品牌图、样式模板、示例文件。

但有一个原则：

SKILL.md 只放路由和核心流程，不要把所有资料都糊进去。

如果正文太长，模型每次加载 Skill 都会背一堆不一定用得上的东西。

更好的写法是：

做 A 时，读取 references/a.md
做 B 时，读取 templates/b.md
需要生成文件时，优先运行 scripts/build.ts

这就把 Skill 从"长 prompt"变成了"任务操作系统入口"。

Skills、Hooks、Subagents、MCP 怎么分工

到这里，容易出现一个问题：

这些东西看起来都能"定制 Agent"，到底怎么选？

我建议用四句话判断。

Skills：教它怎么做
Hooks：管它什么时候能做
Subagents：拆给谁去做
MCP：接入外部系统去做

举个代码审查场景。

Skill 负责定义审查流程：

先看行为变化
再看正确性
再看安全
再看测试
最后按 severity 输出

Hook 负责拦截危险动作：

不允许审查 Agent 修改源码
不允许访问生产数据库
记录所有工具调用

Subagent 负责分工：

security-reviewer 看安全
test-reviewer 看测试
docs-reviewer 看文档

MCP 负责接系统：

GitHub MCP 读取 PR
Linear MCP 读取需求
Slack MCP 发审查结果

不要让 Skill 承担所有责任。

Skill 可以说"应该检查安全问题"。

但它不能真正阻止危险工具。

真正的阻止要靠权限、Hooks 和运行环境。

什么时候值得写 Skill

不是所有 prompt 都值得变成 Skill。

我通常用五个条件判断。

第一，这个任务会重复出现。

只做一次的临时任务，不用 Skill。

第二，流程相对稳定。

如果每次都完全不同，写 Skill 只会制造假稳定。

第三，团队希望统一产物质量。

比如代码审查、测试生成、发布说明、公众号排版。

第四，流程里有容易忘的细节。

比如安全检查点、品牌语气、法规要求、发布前 checklist。

第五，内容需要版本管理。

如果你希望 Skill 的变更也能 code review，那它就值得变成文件。

反过来，如果只是一次性提醒：

这次多关注一下性能

直接写进当前 prompt 就够了。

一个团队 Skill 库怎么设计

团队里最容易犯的错误，是上来就做一个大而全的 Skill。

比如：

engineering-best-practices

里面塞满代码规范、测试规范、架构规范、安全规范、发布规范。

结果是：

什么都沾一点
什么都触发
什么都不精确

更好的方式是按任务拆。

例如：

code-review
test-generation
release-notes
incident-review
api-docs
wechat-article-publishing

每个 Skill 都回答三个问题：

什么时候用？
具体怎么做？
输出什么格式？

如果有共享规范，不要复制到每个 Skill 里。

放进 references/，让需要的 Skill 引用。

这样改一处，所有相关 Skill 都能受益。

一个可落地的 Skill 模板

我建议从这个结构开始：

---
name: [稳定短名]
description: [任务 + 适用场景 + 期望产物]
---

# [Skill 名称]

## When To Use

适合什么任务。

## Inputs

需要用户或上下文提供什么。

## Workflow

1. 第一步
2. 第二步
3. 第三步

## Output

固定输出结构。

## Boundaries

不要做什么。

## References

需要时再读取哪些文件。

其中 Boundaries 很重要。

Skill 不只是告诉 Agent 要做什么。

也要告诉它不要越界。

比如代码审查 Skill 可以写：

不要直接修改代码。
不要评论纯风格偏好，除非违反项目规范。
不要把低置信度猜测写成确定结论。

这些边界能显著降低噪音。

Skills 在 Agent SDK 产品里的位置

如果你在做一个 Agent 产品，Skills 不应该只是开发者本地的小工具。

它可以变成产品能力的一部分。

例如企业内部平台。

你可以给不同团队挂不同 Skill 集。

财务团队：invoice-review、expense-policy
研发团队：code-review、test-generation
客服团队：refund-policy、complaint-escalation
内容团队：wechat-article、xhs-note

这背后的产品设计是：

用户选择角色或任务类型
系统加载对应 Skill 集
权限 preset 同步切换
可观测系统记录 Skill 使用情况

这样，Skill 不只是 prompt 文件。

它变成了 Agent 产品里的"专业能力包"。

常见坑

第一个坑：Skill 太长。

把所有知识都放进 SKILL.md，最后只是换了一个地方堆上下文。

第二个坑：description 太泛。

比如"帮助开发者写代码"这种描述，几乎什么任务都能触发。

第三个坑：把权限写成建议。

Skill 里写"不要删除文件"只是建议。

真正不能删除，要靠 disallowed_tools、Hooks 或沙箱。

第四个坑：没有输出格式。

Skill 如果只写流程，不写输出结构，父 Agent 很难消费结果。

第五个坑：没有维护机制。

Skill 是知识资产。

知识资产会过期。

它需要 review、版本管理和淘汰机制。

结尾

到第 11 篇，Claude Agent SDK 的图景已经很清楚了。

工具解决能力。

权限解决边界。

Session 解决连续性。

Subagent 解决分工。

MCP 解决外部系统连接。

Skills 解决经验复用。

如果说 MCP 把外部系统接进 Agent，那么 Skills 把团队经验接进 Agent。

它最适合沉淀那些重复、稳定、可审查的做法。

不要把 Skill 当万能 prompt。

把它当团队给 Agent 写的操作手册。

下一篇，我们进入生产运行的另一个核心问题：

Agent 跑起来以后，怎么知道它到底发生了什么？

也就是可观测性。

参考资料

• Anthropic Claude Agent SDK Skills docs, checked on 2026-06-17.
• Anthropic Claude Code Skills docs, checked on 2026-06-17.
• Anthropic Claude Agent SDK overview, checked on 2026-06-17.
• Local plan: ref-doc/claude-agent-sdk-series-plan.md.
