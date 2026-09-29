# Skills 重新定义 Agent 喂知识：从'提前给'到'按需取'的范式反转

> 📊 Level ⭐⭐⭐ | 10.0KB

## 核心概述

本文梳理了给 Agent 喂知识的四种方法进化线（Prompt → RAG → CLAUDE.md → Skills），指出前三种的共同死穴是"提前给"，而 Skills 的颠覆在于"按需取"——通过渐进式披露（Progressive Disclosure）三层机制，让知识可以无限积累却始终只有当下需要的那一点出现在模型眼前。Skills 不是一份 markdown，而是可执行的能力。

→ [原文存档](https://mp.weixin.qq.com/s/fuhenGVN36CHTvj3LW_D_Q)

## 四种喂法进化线

| 喂法 | 核心机制 | 关键缺陷 |
|------|----------|----------|
| **Prompt** | 当场说 | 一次性，说完就忘 |
| **RAG** | 提前存进知识库，用时检索 | 得提前猜要用什么，存多存少都出问题 |
| **CLAUDE.md** | 每次自动注入 | 越堆越长，噪音淹没关键内容 |
| **Skills** | 按需取，渐进式披露 | 无（范式反转） |

前三种的共同死穴：**都是"提前给"**——Prompt 当场提前说，RAG 提前存进库，CLAUDE.md 提前写好每次灌。都预设你得在 AI 干活前准备好知识，但"提前"本身就是原罪。

## ETH Zurich 实证（2026-02）

机器生成的 CLAUDE.md 类上下文文件使任务成功率**降低约 3%**，人精心写的也只**提升约 4%**，且无论哪种都让推理成本**涨 20% 以上**。原因：无差别灌入大量模型"本来就知道"的内容，等于往上下文灌噪音。

## 渐进式披露三层机制

1. **目录层**：每个 skill 一行简介（~80 token），系统启动时只加载所有 skill 的目录。17 个官方 skill 全部目录才一千多 token。
2. **正文层**：任务匹配到某个 skill 时才加载完整正文，其他 skill 一字不进。
3. **参考文件层**：正文中引用的更深细节，只有真的需要时才单独加载。

**装一百个 skill 也不会互相干扰**——没用上的 skill 压根不占上下文。

## Skills ≠ markdown：可执行的能力

一个 skill 是一个文件夹，里面能装可执行代码。Anthropic 的 docx skill 除了说明还塞了脚本（"必须显式设置纸张大小""绝不用 unicode 字符当项目符号"等踩坑经验）。

关键：脚本和数据**全程不进入上下文**，只有结果进。把确定性操作从"模型用脑子硬想"卸载成"运行一段代码"——更可靠，几乎不占脑容量。

**纯 markdown = 文字描述的知识（占上下文）；Skill = 可执行的能力（不占上下文）。**

## 决策规则

> 背景知识（项目是什么、有哪些资料）→ Projects / CLAUDE.md
> 做事的本事（代码审查流程、文档规范）→ Skill

Anthropic 重新定义的不是"知识的格式"，是**"知识被调用的时机"**。

## 深度分析

### 时机才是那个变量：上下文是稀缺资源，不是垃圾桶

Prompt、RAG、CLAUDE.md 的共同点不是「都用文字」，而是都要求人在任务开始前对「模型将来需要什么」下注：Prompt 当场押一次，RAG 在建库时押知识边界与切分粒度，CLAUDE.md 押一份常驻背景。押错是双向受罚——给少了缺依据，给多了关键信息被稀释。Skills 挪动的不是知识的格式（RAG 早就不靠注入、也能检索），而是**知识被调用的时机**：把「提前准备」换成「执行中自取」。 这正是 [上下文工程](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/context-engineering.md) 的立场：目标不是让模型知道得更多，而是让它在正确时刻看见正确的那一小块。

### 渐进式披露是一份三层加载协议，不是一句口号

目录层给元数据（约 80 token／个，17 个官方 skill 合计一千多 token 常驻），正文层在匹配后整份载入，参考文件层只在实际需要时单独取。读成成本模型更清楚：**费用按层、按需结算**——没被命中的 skill 成本为零，新增一个 skill 的边际成本恒定在一行目录，而非线性叠加进每次请求。代价是责任转移：第一层成了唯一入口，描述含糊的 skill 此后每次都等于不存在，或更糟，被错误命中——**元数据因此从文档升格为接口契约**。

### ETH Zurich 的实证：问题不在上下文太少，而在不够准

机器生成的 CLAUDE.md 类文件让成功率掉约 3%，人精心撰写的也只涨约 4%，而两种情况的推理成本都涨 20% 以上。这不是「写得还不够好」，而是**增量信息的性价比结构**：模型本来就知道、或读一眼代码就能推断的内容，进入上下文后贡献接近零甚至为负，却照样消耗 token、延迟与注意力。

由此可换一个判据：不看内容是否与任务相关，而看**模型是否无法自行推断、且此刻就需要它**，两者都成立才进上下文。人写只换来 4% 还暗示：这类范式在很多任务组合上只是勉强打平，Skills 的胜利靠结构而非措辞。

### Skill = 可执行能力：把确定性从推理里剥离

docx skill 内嵌的脚本装着这类经验：生成文档必须显式设置纸张大小（底层库默认 A4）、绝不用 unicode 字符当项目符号。两种载体的差别是量级的：**描述性知识是 markdown，占上下文；可执行能力是代码，只让结果进上下文。** 把确定性操作从「模型用脑子硬想」卸载成「跑一段代码」，可靠性与成本同时受益，数据全程没被推过注意力层。

这接上了 [Harness 工具设计](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/harness-tool-design-evolution.md) 与 [Agent Harness 工程范式](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/agent-harness-engineering-paradigm.md)：工具的价值在于把不可靠的推理换成一份确定性契约，而 Skills 把签发这类契约的权力从平台方下放给了使用者。

### 选型地图与 Skills 的失效边界

按知识类型落位：背景类留在 Projects / CLAUDE.md，流程与本事做成 Skill，确定性运算下沉为脚本。文章给的二分之外，实践中还会撞上**规模**与**变化频率**两条轴：

- RAG 仍胜出：语料大到无法逐条枚举；数据在查询时刻才需最新值，不宜冻结进文件夹；需要语义搜索与权限隔离。参见 [RAG](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/rag-retrieval-augmented-generation.md)。
- Skills 失效：维护腐化——封装的外部工具变了而文件夹没变，没有运行期报错，只产出静默的错误结果；版本漂移——同一能力在多处各写一版；冲突——两个 skill 对同一任务给出互斥步骤，注册表却不带冲突检测；判断类知识——依赖情境权衡的「最佳实践」无法写成确定性脚本。

最需强调的仍是：渐进式披露的收益全押在元数据质量上，描述失准的 skill 要么永不加载、要么错误加载，两种都比没有更贵。

## 实践启示

1. **先问时机，再问格式。** 往上下文加任何东西前，先回答「模型能不能自己拿到、并在需要的那一刻拿到」；能，就把它移出上下文，交给文件系统或脚本。
2. **用三把刀切知识：背景 / 本事 / 确定性执行。** 背景进 CLAUDE.md 或 Projects，本事做成 Skill，确定性运算下沉成脚本——第三种性价比最高、也最常被忽略。
3. **把 skill 描述当接口写。** 元数据决定命中率，description 要写明触发场景与不适用场景，而不是概述内容。
4. **用增量实验而非直觉评估上下文配置。** 一次只加一条上下文或一个 skill，测成功率与推理成本，不加分的删掉；成功率提升不足以偿付 20% 成本涨幅时，那次「优化」是净损失。
5. **给 skill 库配维护机制。** 版本锁定、定期回归、明确负责人；脚本要走代码审查，因为别人写的 skill 会在你的环境里执行——skill 库是代码库，不是文档集。
6. **平台层要补的是注册表、检索与冲突检测，而非数量上限。** 懒加载已兜住规模风险，「装一百个 skill」本身安全；真正风险是命中率低、描述失准、互相打架的 skill 静默共存——能否评估 skill 的实际效果，会成为衡量 Agent 平台成熟度的新指标。

## 关联

- [Claude Code 大型代码库 Harness 配置](https://github.com/QianJinGuo/wiki-public/blob/main/entities/claude-code-large-codebase-harness-configuration.md) — Skills 作为 Harness 五扩展点之一，渐进式披露的工程视角
- [Anthropic Knowledge Work Plugins 分析](https://github.com/QianJinGuo/wiki-public/blob/main/entities/knowledge-work-plugins-anthropic-source-analysis.md) — 3 级渐进式披露的详细技术分析
- [Claude Code 为什么会忽略指令](https://github.com/QianJinGuo/wiki-public/blob/main/entities/claude-code-why-instructions-ignored-jia-gou-x-2026.md) — CLAUDE.md 越写越糟的诊断，本文给出 Skills 作为解法
- [Claude Code 七种自定义方法](https://github.com/QianJinGuo/wiki-public/blob/main/entities/claude-code-seven-customization-methods-anthropic-official.md) — Skills 在七种方法中的定位
- [CLAUDE.md 12 条规则](https://github.com/QianJinGuo/wiki-public/blob/main/entities/claude-md-12-rules-mnilax-cf2019.md) — CLAUDE.md 喂法的代表，本文指出其局限

---

