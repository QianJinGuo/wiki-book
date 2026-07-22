---
type: source
source_url: https://mp.weixin.qq.com/s/pXGI92pcrTzel7B3kZn_Zw
sha256: db3bccd0654b4933df467517eae3a63b5bccd76ec2d26831122c07d0fde5f368
ingested: 2026-07-09
source: 术哥无界（微信公众号）
source_title: 12 行 vs 689 行：mattpocock/skills 与 superpowers 的路线之争
source_published: 2026-07-09 08:30
review_value: 9
review_confidence: 9
review_stars: 5
---

# 12 行 vs 689 行：mattpocock/skills 与 superpowers 的路线之争

> 本文走源码深度解读路线，所有技术事实以 mattpocock/skills 仓库 v1.1.0 源码为准。

## 1. 18 个 promoted skill 和一条已经改名的链路

skills/ 下按 bucket 分桶，只有 engineering/ 和 productivity/ 两个桶的 skill 算 promoted（进 README、plugin.json、docs）。当前 v1.1.0 合计 promoted 18 个（12 个 user-invoked + 6 个 model-invoked）。

演化历史：to-prd 改名 to-spec，to-issues 合并进 to-tickets（吞掉了旧 to-plan），wayfinder 和 code-review 从 in-progress 毕业到 engineering。

路线信号：skill 数量会精简不膨胀。对比 superpowers 的 14 个 skill 合计 3300+ 行、单篇 writing-skills 689 行。

## 2. disable-model-invocation：一条约束决定整个仓库的形状

user-invoked（disable-model-invocation: true）：模型永远不能自动触发，description 是给人看的
model-invoked（默认）：description 保留 trigger phrasing 给模型读
依赖单向：user-invoked 可以调 model-invoked，user-invoked 之间不能互相调用

18 个里 12 个是 user-invoked，模型能自动看到的只有 6 个。隐藏是故意的，理由：与其让 18 个 skill 全塞进模型上下文互相干扰，不如只露几个给模型，剩下的靠 /ask-matt router 兜底。

对照 superpowers：用 hook 往每个会话开头注入指令，哪怕只有 1% 的可能某个 skill 适用也必须调用。

## 3. 四大支柱：把几本经典软件工程书压成最小锚点

**支柱一：Grilling**。解决"Agent 没做我想要的"（引用《Pragmatic Programmer》No-one knows exactly what they want）。底层原语 grilling 12 行，grill-me（无 codebase）和 grill-with-docs（有 codebase）都委托给它。关键区分：能查代码查到的 fact 由 agent 自己查，需要拍板的 decision 必须等用户回答。

**支柱二：CONTEXT.md**。解决"Agent 太啰嗦"。在 grilling 过程中顺手编一本项目词典，落成 CONTEXT.md 一个文件。来自 Eric Evans《Domain-Driven Design》的 ubiquitous language。配套 domain-modeling（74 行）是主动维护这门语言的 model-invoked skill。

**支柱三：TDD + 反馈回路**。解决"代码不 work"。tdd skill 36 行，核心是红绿循环加三个反模式：Implementation-coupled、Tautological、Horizontal slicing。解法是 vertical slice / tracer bullet 模式。配套 diagnosing-bugs（134 行）把硬 bug 诊断拆成 6 个 phase。

**支柱四：深模块/架构**。解决"代码成了泥球"。引用 Kent Beck（Invest in the design of the system every day）和 Ousterhout（The best modules are deep）。codebase-design（114 行）定义了一套术语：Module、Interface、Implementation、Depth、Seam（引 Michael Feathers）、Adapter、Leverage、Locality。明确拒绝 depth 定义成行数比值，改用 depth-as-leverage。

四根支柱全是老书老概念压成 agent 能执行的最小形态。

## 4. 主流程：从 idea 到 ship

/grill-with-docs（有 codebase）/grill-me（无）-> 判断设计是否需要 runnable 答案 -> 需要就走 /handoff -> /prototype -> /handoff 回来
-> 判断是否多 session -> 是就走 /to-spec -> /to-tickets（切成 tracer-bullet 票，带 blocking edges）-> 每个 ticket 开新 session -> /implement -> /tdd -> /code-review

Context hygiene 铁律：1 到 3 步必须保持在一个未打断的 context window 里（不 compact、不清空），直到 /to-tickets 完成后每个 /implement 才开新窗口。上限 smart zone ~120k token。

三个 on-ramp：/triage（堆积 bug 和请求）、/diagnosing-bugs（东西坏了）、/wayfinder（巨大模糊的努力，greenfield 或超大 feature）

wayfinder（127 行）用游戏化隐喻：destination（固定 scope）、map（wayfinder:map issue）、fog of war（暂时无法精确表述的决策区域）、frontier（所有 blocker 已 close 的 open ticket）、out of scope。

code-review（89 行）把评审拆成两条并行 sub-agent：Standards 轴（编码规范 + 12 个 Fowler smell baseline）和 Spec 轴（忠实实现 issue/PRD）。双轴各自报告，不合并 rerank。

## 5. writing-great-skills：skill 写作的元方法论

83 行正文 + 独立 GLOSSARY.md。核心美德：predictability（过程一致而非输出一致）。
关键概念：Leading words（利用模型预训练知识的词，如 fog of war、tracer bullet）、Progressive disclosure、Completion criterion（反模式 premature completion）、Sediment、No-op、Negation（不要写"别想大象"这类否定式指令）。

解释了为什么 grilling 12 行能工作：leading words（grill 模型懂）、progressive disclosure（细节委托给上层）、明确 completion criterion。

## 6. 一条 to-tickets 的工程权衡

Wide refactor（机械改动但 blast radius 全代码库）：不用 tracer bullet，改用 expand-contract。
方法论是工具不是信仰，TDD 不是所有场景的答案。

## 7. 两条路线的克制对照

superpowers 假设模型会偷懒，把每条退路堵死，靠 hook 强制触发。代价是 token 消耗大。
mattpocock/skills 假设模型大概率做对，skill 只在关键处给锚点，用 router 兜底。代价是用户得记 12 个斜杠命令，得在 grilling 阶段真坐下来逐个拍板。

两条路线能共存，两个都留着跑一遍对比交付质量，是当前够诚实的对比方式。

→ [[entities/matt-pocock-skills-vs-superpowers-comparison|关联实体：Matt Pocock Skills vs Superpowers 路线对比]]
