# Agentic Code Review

> 📊 Level ⭐⭐⭐ | 8.8KB

> Source: [原文存档](https://addyosmani.com/blog/agentic-code-review/)

## 核心要点

- **来源**: https://addyosmani.com/blog/agentic-code-review/
- **评估理由**: Strong thesis on AI-driven code review becoming the highest-leverage engineering activity, supported by specific metrics from Faros AI (22k devs, 861% churn up), CodeRabbit (1.7x more issues in AI PRs), and GitClear (4x output, ~12% real productivity gain). Writing is engaging, well-structured, and 

## 内容提炼

_Coding agents are extraordinarily good now, and getting better fast. The interesting consequence is that the hard part of engineering moved from writing code to deciding whether to trust it, which makes review the most leveraged skill in software right now. How you approach it depends enormously on who you are: a solo developer with no users and a team maintaining a ten-year-old application are not solving the same problem._

* * *

I am more optimistic about agentic engineering than I have ever been. The agents are genuinely good, they get better every month, and on an ordinary day I now ship things I would not have attempted a year ago. This write-up is a map of where the interesting work went, because it did move, and most teams have not fully caught up to where.

Code review used to work because of a happy accident of relative speed. A senior engineer could read code faster than a junior could write it, so review kept pace without anyone designing it to, and the team absorbed how the system fit together as a side effect of reading each other’s diffs. A lot of that was not deliberate. It fell out of a single fact: writing code was the slow, expensive part, and

## 关键洞察

- ## What the 2026 data actually shows
- the incidents-to-PR ratio up **242.7%**
- the per-developer defect rate up from **9% to 54%**
- median review _duration_ up **441.5%**, with time-to-first-review and average review time both roughly doubling
- PRs merged with **zero review up 31.3%**
- ## Everyone is solving a different problem

## 实践启示

- 文章的核心论点可在生产环境验证
- 与现有实体的差异化角度：本文来自 addyosmani.com 视角
- 引用源：[Agentic Code Review Addyosmani](https://addyosmani.com/blog/agentic-code-review/)
## 深度分析

### 数据面：四组独立测量，同一张账单

文章的说服力来自把轶事换成互相独立的测量。Faros AI 对 22,000 名开发者、4,000 个团队的遥测显示，AI 采纳度升高后吞吐确实上升，但代码 churn 暴涨 861%、事故/PR 比上涨 242.7%、人均缺陷率从 9% 升到 54%、评审时长上涨 441.5%，而零评审合并的 PR 增加 31.3%——没有谁决定停止评审，只是评审者跟不上流量，代码未读先合，随后这成了常态。GitClear 的数据给出单句版本：重度 AI 用户产出约为非用户的 4 倍，真实生产率提升却只有约 12%，多出的近 4 倍代码仍需人来读，这就是评审问题的一句话定义。作者保留供应商立场声明（Faros 与 CodeRabbit 都在卖货），但效应量跨源一致；最刺眼的细节是工程纪律成熟的团队同样中招——好流程挡不住超过其设计容量的流量。这与 wiki 内 [Anthropic 8x 产出复盘](https://github.com/QianJinGuo/wiki-public/blob/main/entities/anthropic-8x-output-verification-bottleneck-fiona-fung.md) 的「验证瓶颈」判断互相印证。

### 评审经济学：从写慢读快到写快读慢

评审制度过去能运转，靠一个相对速度的偶然：资深工程师读代码快于新人写代码，评审自然跟得上，团队对系统的整体理解也作为读 diff 的副产品沉淀下来。Agent 打破了这个不等式：千行代码的生成时间低于人的阅读时间，约束后移到唯一没变快的环节——一个人确信改动是对的。作者称此为当下杠杆最高的位置，且同一批工具既是问题也是解药：他用 Claude Code/Codex 对进站 PR 做风险排序的批量初筛，把评审从逐 diff 阅读改造成注意力分配，队列才维持得住。这正好落在 [Loop Engineering 方法论](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/loop-engineering-methodology.md) 的 judge 位置上：循环替代人做检查，人保留合并权。

### 意图缺失与异构评审

人类作者写代码时意图免费随行，评审是核对他的推理；Agent 也推理，但推理痕迹在产出 diff 的瞬间就被丢弃，评审者成了「第一个看到这段代码的人」——2026 年论文《AI Slop and the Software Commons》对 1,154 条讨论帖的一手引述。修法是工具问题：让 Agent 在 PR 上声明目标与已排除的备选，把决策日志挂进 diff，重建成本即大幅消失。工具侧的关键发现不是选最好的那一个：一名工程师并行跑 CodeRabbit、Greptile、Seer、BugBot 四个评审器，617 处去重后的发现里 93.4% 只被其中一家命中，四家从未在同一行上重合。四个同款模型只是一个更贵的评审器；异构性本身就是召回率。这与 [Verifier 悖论](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/verifier-paradox.md) 的警告互补——验证能力是独立变量，不随生成能力自动增长。

### 从 human-in-the-loop 到 human-on-the-loop

机器已经在评审超过一半的代码，真正的问题只是「要不要有意为之」。模型自审自判的闭环拥有相关性极强的盲区，同族模型会在相同位置自信地一致犯错；无人认同的「看起来没问题」是借来的信心（borrowed confidence）——Choosing to Stay Human 从认知投降角度给出同构论证。作者现下的落点：人不再逐行读，而是上移一层，保留问责、构建判断、高爆炸半径关卡与「没人写下来的需求」四类不可转移职责，用抽样审计替代全量阅读。Kun Chen 的 40 PR/天工作流是该谱系一端的极值：意图前置进计划、机器做逐行检查、人留在升级路径上——但它是「单人无用户」条件下的理性解，抄到多人团队等于在自家仪表盘上复刻 Faros 数字。与 19 源合并的 [Loop Engineering 深度合并](https://github.com/QianJinGuo/wiki-public/blob/main/entities/loop-engineering-addy-osmani-challengehub.md) 对照，本文把同一范式从「写侧」推进到了「审侧」。

### 实践清单

1. 按风险分层而非按作者分层：配置改动给 linter 加扫一眼，支付路径给全栈——类型、测试、两家异构 AI 评审器、系统 owner、安全检查。
2. 提高受理门槛：评审前要求改动说明、非巨型 diff、测试输出及其真实运行证明，把意图重建成本推回提交方。
3. 把测试改动当代码读：Agent 先改行为再「改测试」适配坏行为是最危险失败模式，大范围重写断言的 diff 优先看；变异测试验证测试是否真能抓错。
4. CI 是不动的墙：删除测试、跳过 lint、降低覆盖率阈值、把不可信输入注入 prompt——确定性闸门不会被一段自信的散文说服。
5. 合并权归人：AI 评审意见是传感器不是判决，谁点 merge 谁负责，模型不能被 on-call。
6. 团队层面：写代码提速后砍评审人力，只是把节省兑换成未来事故；开源维护者已被大量「貌似有料实则空洞」的贡献打穿，公司是下一个。

## 相关实体
- from doer to director: the ai mindset shift
- why internally-built ai fails fund accounting audits
- [back up and restore your amazon eks cluster resources using](https://github.com/QianJinGuo/wiki-public/blob/main/entities/back-up-and-restore-your-amazon-eks-cluster-resources-using-velero-amazon-web-se.md)

---

