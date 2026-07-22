---
title: "面试官问：'你都是Vibe Coding，怎么保证质量？'——用OpenSpec、Superpowers、gstack把Vibe Coding 拉回到工程交付"
source_url: "https://mp.weixin.qq.com/s/BGnZKKNUVqOm7Hh6FY7Rhg"
source: "wechat|代码随想录|卡码大模型"
author: "程序员Carl"
publish_date: "2026-06-12"
ingested: "2026-06-12"
type: article
tags: []
source_type: wechat
sha256: "fdaac93827a8a46ca1d185be6db8f8b610e480935d9210d4134a4dba109f9da3"
---

面试官可能会这么问："你都是 Vibe Coding，怎么保证质量？" 程序员Carl 的回答：**用 OpenSpec、Superpowers、gstack 把 Vibe Coding 拉回到工程交付**。

核心论点：AI 增强开发的核心不是让 AI 更快开写，而是让 AI 在正确的规格、正确的流程、正确的交付闭环里写。这三件套不是让你"装更多插件"，它真正解决的是一个问题：**怎么把 Vibe Coding 拉回工程交付**。

## 目录

1. AI 增强开发和 Vibe Coding 的区别是什么？
2. 为什么光靠 Claude Code 或 Codex 还不够？
3. OpenSpec：先把需求变成规格
4. Superpowers：让 Agent 按工程纪律执行
5. gstack：把交付闭环补完整
6. 三件套怎么组合？
7. 面试怎么回答？
8. 什么时候该用，什么时候别用？

## 一、AI 增强开发和 Vibe Coding 的区别是什么？

Vibe Coding 的典型模式：需求一句话，AI 直接写；写完能跑，直接 Accept；报错了，再把报错粘给 AI。这个过程看起来很快，但**致命问题：需求、设计、验证、交付，全靠聊天过程临时维持**。一旦上下文变长，或者换一个窗口，Agent 很容易忘掉最初的约束。

AI 增强开发不一样——把 AI 放进流程里面：

- 先把需求写成规格
- 再把规格拆成设计和任务
- 开发时按测试和计划执行
- 交付前做 Review 和 QA
- 失败样本沉淀成下一轮规则

**面试标准答案**：

> Vibe Coding 是把 AI 当成一次性代码生成器，AI 增强开发是把 AI 放进工程闭环。前者关注"能不能写出来"，后者关注"需求是否清楚、实现是否符合规格、测试是否覆盖边界、上线是否可控"。

面试官问这个问题，**不是在问你会不会用工具，是在问你：你用 AI 写代码，是不是还保留工程判断力**。

## 二、为什么光靠 Claude Code 或 Codex 还不够？

Claude Code 和 Codex 确实很强——能读代码、改文件、跑测试、处理错误、调用工具。但**强模型解决的是"能力问题"，不是"流程问题"**。

一个很强的 Agent 也可能犯这些错误：

- 需求没澄清就开始写
- 只实现 happy path
- 测试写得像证明自己没错
- 代码 Review 只看表面
- 浏览器里真实流程没走一遍
- 上线后没有复盘失败原因

**这些问题不是换一个更大的模型就自动消失**。因为 Agent 的默认倾向是"尽快完成用户请求"。用户说"帮我做个功能"，它就会努力做功能。但**成熟工程师不会立刻开写**——会先问需求、场景、边界、恢复、影响、验证。

**AI 增强开发三件套 = 三层外部工件给 AI 代码生成加门禁**：

| 工具 | 解决的问题 |
|------|------------|
| **OpenSpec** | 管"做什么"——把需求变成 proposal、design、tasks、spec delta |
| **Superpowers** | 管"怎么做"——把澄清、设计确认、TDD、子 Agent 执行、代码审查变成 Agent 应该遵守的开发纪律 |
| **gstack** | 管"怎么交付"——把产品复盘、工程计划评审、代码 Review、浏览器 QA、发布检查、复盘沉淀串成一个交付流程 |

**一句话：模型负责生成，三件套负责约束生成**。

## 三、OpenSpec：先把需求变成规格

OpenSpec 解决的第一个问题是：**需求太模糊**。

AI 最怕的不是需求复杂，而是需求含糊。"做会员续费"，AI 可以写，但它不知道：

- 月卡续费和年卡续费规则是否一样
- 过期后续费是从今天算，还是从原到期日算
- 续费失败后订单状态怎么流转
- 支付回调重复到达怎么处理
- 管理后台是否要看到续费记录

这些如果不先写清楚，**AI 只能猜**。猜得像，不代表猜得对。

OpenSpec 的关键点：

- 轻量级 spec-driven framework
- 支持 Claude Code、Cursor、Codex、GitHub Copilot 等工具
- 每次变更会产生 spec delta，方便审查需求变化
- specs 会和代码一起放在仓库里，作为长期上下文

**AI 编程最大的问题之一是上下文不持久**。今天这个聊天窗口里你解释了 20 分钟业务规则，明天换一个窗口规则没了。OpenSpec 把规格放到仓库里，就等于把"需求意图"变成了代码旁边的长期资产。

**典型结构**：

```
openspec/
  specs/
    membership-renewal/
      spec.md
  changes/
    add-renewal-coupon/
      proposal.md
      design.md
      tasks.md
      specs/
        membership-renewal/
          spec.md
```

**面试高级答法**：

> OpenSpec 的核心价值不是"帮我写计划"，而是把需求意图变成可版本管理、可审查、可复用的规格。它解决的是 AI 开发里最容易失控的上游问题：需求没定义清楚，Agent 就开始写代码。

## 四、Superpowers：让 Agent 按工程纪律执行

OpenSpec 解决了"要做什么"。但规格写完，不代表 Agent 就一定会按好习惯开发。**很多 Agent 最大的问题是：太急着写代码**。

Superpowers 解决的是第二个问题：**开发过程没有纪律**。官方 README：Superpowers 是给 coding agents 用的一套完整软件开发方法论，基于可组合 skills 和初始指令。

核心动作：

- 先澄清你到底要做什么
- 把对话整理成 spec
- 分块给你确认设计
- 再生成可执行的 implementation plan
- 强调 red/green TDD、YAGNI、DRY
- 执行时用 subagent-driven development
- 每个任务完成后检查和 Review

**这套东西不是让 Agent "更聪明"，而是让 Agent 别乱来**。

**TDD 的关键作用**：AI 默认经常是"代码写完后补测试"，这类测试容易变成证明题——证明自己刚刚写的代码没错。如果按 red/green TDD，先写失败测试，再写最小实现，再重构，会逼 Agent 先明确行为预期。

**面试标准答案**：

> Superpowers 解决的不是模型能力问题，而是 Agent 开发纪律问题。它把澄清、设计确认、TDD、任务拆分、子 Agent 执行和 Review 变成默认流程，避免 Agent 一上来就写代码。

## 五、gstack：把交付闭环补完整

代码写完，不是工程交付的终点。真正的工程交付还要：

- 代码有没有被审查？
- 页面有没有真实跑过？
- 回归测试有没有补？
- 发布前检查有没有做？
- 这次踩过的坑有没有沉淀？

gstack 解决的是第三个问题：**交付链路容易被跳过**。官方页面定义：gstack 是 AI coding 的 delivery loop，不是 prompt 集合。

gstack 的流程：

- **Think**：`/office-hours` 把需求重新想清楚
- **Plan**：`/plan-ceo-review`、`/plan-eng-review`、`/plan-design-review` 压测产品、架构、UX 和测试
- **Build**：按确定的 brief 开发
- **Review**：`/review` 查回归、缺测试、隐藏风险
- **Test**：`/qa` 跑真实浏览器 QA
- **Ship**：`/ship` 做最后发布检查
- **Reflect**：`/retro` 复盘本轮模式和问题

**Browser QA 尤其重要**——很多 AI 代码"测试通过"，但页面一打开就露馅：按钮挡住、表单状态没清、移动端布局炸、登录态下流程不对。单靠单元测试，发现不了这些问题。**gstack 把真实浏览器 QA 放进流程里，本质上是在提醒：AI 写的是代码，但用户用的是产品**。

## 六、三件套怎么组合？

按链路讲（不要混着讲）：

| 工具 | 解决的问题 | 核心产物 | 主要阶段 |
|------|-----------|---------|---------|
| **OpenSpec** | 需求模糊、上下文不持久 | spec、proposal、design、tasks | 开发前 |
| **Superpowers** | Agent 急着写、流程不稳定 | 设计确认、TDD、任务执行、Review | 开发中 |
| **gstack** | Review、QA、发布和复盘容易缺失 | plan review、browser QA、ship checklist、retro | 交付前后 |

**面试标准答案**：

> OpenSpec 是规格层，Superpowers 是执行纪律层，gstack 是交付闭环层。

## 七、面试怎么回答？（5 个高频题）

**1. AI 增强开发和普通 AI 辅助编程有什么区别？**
普通 AI 辅助编程更像局部提效（补代码、解释报错、生成测试）。AI 增强开发强调把 AI 纳入完整工程流程，从需求规格、设计、实现、测试、Review 到发布复盘都由流程约束。**区别不在于是否使用 AI，而在于 AI 是否被工程化治理**。如果没有规格和验证，AI 越强，越可能把错误快速放大。

**2. 为什么 OpenSpec 比一个详细 Prompt 更可靠？**
详细 Prompt 只能服务当前聊天窗口。OpenSpec 把需求规格放进仓库，能被版本管理、Review，也能跨会话复用。对 Agent 来说，它不是临时上下文，而是长期上下文。对团队来说，它不只是给 AI 看，也是给人审查需求变化用的。

**3. Superpowers 解决的是模型能力问题吗？**
不是。Superpowers 解决的是 Agent 工作习惯问题。强模型也会急着开写、跳过澄清、测试写得不严谨。Superpowers 用 skills 和方法论让 Agent 先澄清、再设计、再计划、按 TDD 和任务拆分执行，核心是把工程纪律变成默认行为。

**4. gstack 为什么强调 Review 和 QA？**
因为 AI 生成代码最危险的地方是"看起来完成了"。代码能编译、测试能过，不代表用户流程真的没问题。gstack 把 Review、Browser QA、Ship、Retro 纳入交付闭环，防止 AI 写完代码后直接跳过人工团队原本会做的工程检查。

**5. 如果让你在项目里落地这三件套，你会怎么做？**
不会一上来全量铺开，而是按风险分层。低风险小改动可以直接用 Claude Code 或 Codex 加简单 Review。涉及核心业务逻辑、跨模块改动、支付权限数据一致性这类任务，先用 OpenSpec 写清规格，再用 Superpowers 按任务和 TDD 执行，最后用 gstack 做 Review、浏览器 QA 和 Ship 检查。

## 八、什么时候该用，什么时候别用？

**三件套不是银弹**。如果你只是改一个按钮文案，或者修一个明显的 CSS 问题，没必要先写一堆 spec。

**适合的场景**：
- 支付、订单、会员、权限这类核心业务
- 一次改动跨前端、后端、数据库、任务队列
- 需求边界多，失败场景多
- 新人或 Agent 不熟悉项目上下文
- 需要团队 Review 需求变化，而不只是 Review 代码
- 上线后出错代价很高

**判断标准**：如果错误只影响局部样式，可以轻流程。如果错误会影响钱、权限、数据一致性、用户主流程，就上规格和交付闭环。

**面试最后总结**：

> AI 增强开发不是反对 Vibe Coding 的速度，而是给速度加边界。OpenSpec 让需求可审查，Superpowers 让开发有纪律，gstack 让交付有闭环。真正成熟的 AI 编程，不是让 Agent 写得更多，而是让 Agent 在正确约束下写得更可靠。

**AI 编程时代程序员的新优势**：不是和 AI 比谁敲代码快，是你能不能把 AI 管成一个靠谱的工程队友。
