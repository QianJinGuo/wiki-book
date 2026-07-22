---
source_url: "https://mp.weixin.qq.com/s/7oAp2krFqj8z3ElzJM6n6Q"
source_type: "wechat-mp"
title: "摒弃冗长技能文档，Gene 用轻量化策略提升 Agent 效果"
author: "Junjie Wang, Yiming Ren, Haoyang Zhang（EvoMap 团队）"
publisher: "数据派THU（来源：机器之心）"
publisher_secondary: "WeChat 公众号转载"
date: "2026-06-13"
ingested: "2026-06-13"
sha256: "58ad875e3011ddb77602d6111419a93871217056d6396688e7567c130b69c949"
tags: [agent-skill, gene, gep, evomap, evolver, openclaw, critpt, agent-evolution, test-time-evolution, experience-reuse, strategy-gene, arxiv-2604-15097, qinghua, junjie-wang, haoyang-zhang]
extraction: "browser"
paper: "From Procedural Skills to Strategy Genes: Towards Experience-Driven Test-Time Evolution"
arxiv: "https://arxiv.org/abs/2604.15097"
affiliation: "Infinite Evolution Lab (EvoMap) × 清华大学"
repos:
  - "https://github.com/EvoMap/evolver"
  - "https://github.com/EvoMap/critpt-openclaw-reproducible-70"
---

# 摒弃冗长技能文档，Gene 用轻量化策略提升 Agent 效果

> 来源：https://mp.weixin.qq.com/s/7oAp2krFqj8z3ElzJM6n6Q
> 公众号：数据派THU（来源：机器之心）
> 2026-06-13 17:00 · 北京
> 本文约 4300 字，建议阅读 8 分钟
> 本文介绍 Gene 与 GEP 协议，详解其优于传统 Skill 的 Agent 优化原理。

## 「Agent 玄学」：长 Skill 文档为何不灵

你已经把任务背景写清楚了，把流程拆清楚了，把常见坑、API 用法、示例代码、注意事项都塞进去了，甚至还专门写了一份长长的 Skill 文档。可下一次同类任务再来，模型还是可能在同一个地方犯错。

这套路径有一个共同前提：**经验作为一份内容被存储、召回、调用，再重新喂给模型，就会带来提升**。

深挖这个现象，是一个有趣、有用、但「反直觉」的问题：**包罗万象的详细文档，不等于高质量控制对象**。

行业真正看错 Skill 的地方，就在这里。大家把 Skill 当成了智能复用的终点，却忽略了模型并非"阅读"一份文档，而是在有限推理预算里寻找下一步策略、哪些行为必须避免、什么约束优先级最高。

对人类工程师来说，**完整性**意味着安全感与规范；但对模型来说，完整性很多时候意味着**信号被稀释、重点被冲淡、控制被背景材料淹没**。也就是说，Skill 的强项恰恰建立在它服务人类理解之上，而不是服务模型在当下任务中的决策。

## EvoMap 团队 × 清华：Gene 与 GEP 协议

EvoMap 团队（**Infinite Evolution Lab × 清华大学**）围绕这个问题做了系统研究，提出了一个极具记忆点的新概念：**Gene（基因）**。灵感源于生物学 —— 基因是编码蛋白质的 DNA 片段，源自千百年来传承的共同记忆和经验，而 Agent 的基因则是通过 GEP 协议的机制沉淀下来的可验证可复用的知识资产。

- **论文标题**：From Procedural Skills to Strategy Genes: Towards Experience-Driven Test-Time Evolution
- **作者**：Junjie Wang, Yiming Ren, Haoyang Zhang
- **机构**：Infinite Evolution Lab（EvoMap）× 清华大学
- **arXiv**：https://arxiv.org/abs/2604.15097
- **Evolver（进化引擎）**：https://github.com/EvoMap/evolver
- **CritPt 任务复现仓库**：https://github.com/EvoMap/critpt-openclaw-reproducible-70

论文用 **45 个科学代码场景下的 4,590 次受控实验** + **CritPt benchmark** 上的端到端验证向我们展示了：

> 当同一份底层经验被分别注入模型时，完整 Skill 包反而**低于无指导基线**，而十多倍更短的 Gene 对象**稳定取胜**。

这个偏好不只出现在「写 Prompt」那一刻，它一路传导到了「Agent 在测试时如何持续进化」这件事的设计原理上。很多时候决定 Agent 是否聪明的，不是「你存了多少经验」，而是「**经验回到模型那一刻，长什么形状**」。

这启发了什么？今天行业谈起 Agent 优化，关键词永远是：更强基模、更长上下文、更高级的 RAG、更复杂的 memory 系统。但 Gene 揭示了经验复用的关键，**不是给模型更多内容性的提示，而是把经验做成一个紧凑、面向控制、可持续进化的对象**。这件事在过去几乎被整个 Agent 圈忽视了。

## What is Gene？

EvoMap 团队研究发现：**给模型用的经验对象，应该按「控制密度」而不是「文档完整性」来设计**。

但团队并未止步于这一经验观察，在 4,590 次受控实验里把现象固化后，EvoMap 团队定义了一套**可复制、可变异、可遗传**的解决方案策略，**Gene 是其中完整的对象层三层 framework 的一部分**：

### Gene / Capsule / Event 三件套

| 对象 | 角色 | 关键属性 |
|------|------|----------|
| **Gene** | 可复用进化策略模板 | 含 `keywords + summary + strategy + AVOID` 四类信号，作为 test-time 控制片注入；定义"在什么情况下、做什么事、遵守什么约束" |
| **Capsule** | 被验证过的任务级执行路径 + 审计记录 | 任务级 evidence 链 |
| **Event** | 不可变的进化日志 | 写回触发对 Gene 的 Validate / Mutate / Solidify |

**Gene 关键字段**（约 230 token）：
- `signals`（触发信号：子串匹配 / 正则 / 多语言别名）
- `strategy`（有序可执行步骤）
- `constraints`（限制变更范围 + 禁止触碰路径）
- `validation`（执行验证 + SHA-256 内容寻址哈希）
- 唯一 `asset_id`，不可篡改

### GEP（Gene Evolution Protocol）六阶段循环

三件套被一个六阶段循环串起来，构成 GEP 协议：

详见：https://evomap.ai/wiki/16-gep-protocol

**大白话流程**：
1. 先将过去的失败、成功、修复路径**蒸馏成 Gene**（不是写文档，而是写可溯源控制信号）
2. 新任务进来时，**Scan** 任务上下文 → 匹配最相关的 Gene → **当 System Instruction 注入**
3. 执行完之后，把这次结果以 **Event** 形式写回，触发对 Gene 的 **Validate / Mutate / Solidify** —— 让 Gene 池本身在不更新基模参数的前提下持续进化

## Gene 如何"降维打击" Skill

所有数据都来自同一套实验管线：在 **Gemini 3.1 Pro Preview**（Pro）和 **Gemini 3.1 Flash Lite Preview**（Flash）两个固定模型上，用沙盒执行 + Checkpoint 通过率作为指标，温度 T=0.05，最大输出 16,384 token。

### Skill 输给 Gene，输的不是质量，是形态

论文先做了最直接的对比：同样的底层经验，分别打成 **~2,500 token 的 Skill 包** 和 **~230 token 的 Gene 对象**。

- **完整 Skill 包**在两模型平均水平上**低于无指导基线 1.1pp**
- **更短的 Gene** 高出基线 **3.0pp**
- 绝的一点：Skill **不是均匀地差**，它在弱模型 Flash 上有提升（**41.8→49.0**），但在强模型 Pro 上狠狠拖后腿（**60.1→50.7**）—— 长 Skill 把 Pro 的固有能力**直接压住了**

**"procedural skill"** 也就是今天最常见的文档式经验包，通常包含：overview、workflow、pitfalls、error handling、API notes、examples、scripts。通过消融实验看到底是哪一段在起作用：

> **只有 Workflow 一段在认真起作用，Overview 反而是全文最大的负贡献**。Skill 的有用信号是稀疏的、集中在一小段程序性内容里，其余大量"为人类可读性服务"的材料，反而稀释甚至污染了控制信号。

**Skill 输给 Gene，输的不是知识量与信息密度，而是受控对象选择**。**给人看的东西塞进模型的执行预算，反而会成为控制噪声**。

### Gene 不仅仅是"少则全，多则惑"的提示词

读到这里，最容易冒出的反驳是：「Gene 赢，不就是因为它短、不抢上下文吗？」

实际上 Gene 针对失败有三种分类的进化意图。论文专门用**预算对齐实验**把 Skill 的有效部分截短到和 Gene 一样的 230 token：

> **预算完全相同 —— Gene 仍然碾压**。剪短确实让 Skill 不再倒贴分，但它怎么剪都打不到 Gene 的高度。

论文还做了**渐进式构造**（progressive construction），看 Gene 内部到底是哪一层在起作用：

> **注意第二行**：keywords + summary 反而**回到无指导基线**。**真正把表现拔起来的是 strategy 这一层**。同样的字数，组织成"摘要"没用，组织成"策略"才有用。

**Gene 不是更短的 prompt，是不一样形态的对象**。决定模型行为的是控制结构，不是 token 多少；**strategy 这一层不可省**。

论文的扰动实验里，最反直觉的一条是：**用过时算法范式写的 `stale_paradigm` Gene 拿到了 56.6%**，比 clean Gene 的 54.0% 还高；但换错算法掉到 48.8%、换错领域掉到 49.4%—— 掉分条件就在隔壁。

这两个结果合起来才完整：**Gene 的有效条件是"保留任务相关的控制框架"，而不是"写得多新"**。过期的方法只要框架对仍然好用；新方法如果框架错，反而拖累。这一对比也提示了 Gene 的鲁棒性边界：**结构上很宽容，语义上很挑剔**。

### 总结失败的最优形态，不是日志，是蒸馏过的警告

所有做 Agent 系统的人都在面对一个问题：**失败该怎么存**？长 trajectory？Reflection summary？Error log？

EvoMap 团队看向的关键问题是：**如果工程预算有限，失败该用什么形式回到模型那里**？

论文同时跑了两组对照。

**对照一：失败放在不同载体里**

> 把失败往 Skill 或自由文本里塞，**全部低于无指导基线**。
> **Gene 是唯一的正贡献载体** —— 但即便如此，Gene + 失败仍然不如 Gene 单独（54.0 → 52.0）。
> **失败原样附加，反而稀释了 Gene**。

**对照二：失败和策略以什么形态混合**

> 最强的不是"失败 + 策略"混合体，也不是"策略 only"，而是 **failure warnings only** ——把失败蒸馏成一句句独立的"AVOID xxx"，反而比保留策略本体还强。

也就是说，对 Agent 真正有用的失败经验，**不长成"日志"，而长成这样**（来自论文 UV-vis 谱学场景的真实 AVOID）：

```
AVOID 把 min_distance 当成波长值传给 scipy.signal.find_peaks，要先转成采样点单位
AVOID 把 peak_widths 的原始输出直接当 FWHM 上报，要先换回波长单位
```

**这背后的原则非常明确**：**失败经验的累积应该是选择性压缩，不是加法式堆叠**。

## Gene 长什么样：一个最小可验证工件

讲到这里，应该看一眼一个真正的 Gene 长什么样。下面是论文 UV-vis 场景的注入示例：

```
Domain keywords: uv-vis, peak detection, FWHM, unit conversion
Summary: Detect peaks and compute wavelength-domain peak properties correctly
Strategy:
  1. Detect peaks with prominence-based criteria
  2. Convert min_distance into sample-index units before peak detection
  3. AVOID: Report FWHM only after converting peak_widths outputs back to wavelength units
```

约 **230 token**，5 个字段。它的对照物是同一份经验的 **Skill 包**：

约 **2,500 token**，包含 overview、workflow、pitfalls、API notes、examples、scripts 等子章节，整体形态接近一份 README。

两者在论文实验里使用**同一个 systemInstruction 注入槽**和**同一套 sandbox 评测脚本** —— 也就是说，控制条件完全一致，差别只在于"这一段被注入的内容长什么形状"。

GEP 协议则把这个原始 Gene 进一步规范化为带 `id / schema_version / signals_match / strategy / constraints / validation / asset_id` 等字段的**可校验对象** —— 目的是让它能被匹配、替换、修订、组合，而不是停留在"一段格式好看的 prompt"。

## 协议层的规矩也变了

Gene 最绝的一点，是没有把"经验对象"局限在一个讨巧的 Prompt 技巧上，而是**直接杀到了协议层**。

在测试时控制（Inference）阶段，逻辑非常顺滑：同一道科学代码题，把 ~2,500 token 的 Skill 包换成 ~230 token 的 Gene 控制片，模型立刻算得更准。

但在协议层（Protocol）这件事上，EvoMap 团队抛出了一个更本质的判断：

> **经验对象在多 Agent 之间被交换的时候，它必须是一个对象，不能是一段文档**。

为什么？因为没有协议，Gene 仍然只是一段 prompt —— 边界不稳、字段无法比较、不能累积。一旦协议化，Gene 就从"提示片段"变成**可匹配、可替换、可修订、可组合**的对象，可以被持续修订、被审计追溯、在多 Agent 之间以一致的方式被使用。

**GEP 不是格式细节，而是让 Gene 从测试时控制对象升格成持久策略优化接口的那一层协议**。

## 实验结果：CritPt 排行榜的"白嫖式"智能黑马

为了拿数据说话，EvoMap 团队把 Evolver 直接拉到 **CritPt** 这个公开的前沿物理基准上跑端到端结果。

- **CritPt** 是动态的、严格模拟真实物理科研过程的数据集：https://critpt.com/
- **Evolver** 是"基模 + Gene 池 + 进化引擎 + 工具链"的完整系统
  - OpenClaw 作为 host runtime
  - Evolver 作为进化引擎
  - Gene/GEP 作为对象与协议层
- 近期爆火的 **Hermes Agent** 也在一定程度上"借鉴"了 Evolver 的设计理念
- Benchmark70 任务的全量复现答案见：https://github.com/EvoMap/critpt-openclaw-reproducible-70

**端到端结果**：

| 时间 | 基模 | 跑分 | Evolver(Gene) | 提升 |
|------|------|------|---------------|------|
| 2026-02-16 | 基模 A | 9.1% | **18.57%** | **+9.47pp** |
| 2026-03-26 | 基模 B | 17.7% | **27.14%** | **+9.44pp** |

> **不更新一个参数、不加任何 SFT/RL、纯靠经验对象层的进化** —— 同一基模直接被抬升 **+9pp** 量级。同时，**token 消耗从 100 美金降低到不到 1 美金**。

## Gene 给行业带来了什么？

EvoMap 团队构建的 Gene，把一种飘渺的"直觉"，打造成了一套**可定义、可审计、可演化、面向测试时控制的经验表示方法论**。

- **对应用层**：把"写给同事的 Skill 文档"和"运行时注入给模型的控制信号"**分离开**，这可能是一个几乎没有成本、见效极快的"魔法"。
- **对做 Agent 长期记忆、做 Reflection 的研究者**：**失败的最佳沉淀形态不是 trajectory log 或 reflection summary，而是 AVOID 警告**。GPU 吃紧时，留什么经验不只看采集得对不对，还得看它是不是足够接得上模型当前的执行预算。
- **在多 Agent 经验交换的设定下**：比起传输 Skill 文档，**传输结构化的 Gene 对象更适合作为协议层载荷** —— 因为只有可被匹配、可被修订、可被验证的对象，才能在多方之间真正累积和进化。

## 结论

**Gene 像一面镜子，照出了 Agent 经验复用的本质**：

> Agent 不是在"读一份说明书"，而是在"有限推理预算里寻找下一步该怎么做、什么必须避免"。
> 然而这是双向的 —— **你给 Agent 喂的经验对象长什么样，反过来定义了它能进化成什么样**。

当整个 AI 圈都在为了更长的 context、更花哨的 RAG、更复杂的 memory 系统无脑卷生卷死时，EvoMap 团队轻巧地给出了一条无比朴素的线索：

> **让 Agent 持续变强的捷径，不是把提示词写得更完整，而是把执行经验做成一个更紧凑、更可控、更可进化的对象**。

这在 CritPt 这种硬基准上有用，在协议层的多 Agent 经验交换上更有用，**为未来的 A2A 群体智能指明了一条通路**。

Agent 时代，下一阶段的竞争，不仅是更大的模型和更长的上下文，更是谁能率先针对**智能算力的利用效率**找到更好的通解。

## 作者简介

- **Haoyang Zhang（张昊阳）**：95 后连续创业者，**EvoMap 创始人 & CEO**，**GEP（Genome Evolution Protocol）协议作者**。OpenClaw 社区现象级开发者，其开发的 **Evolver 插件 10 分钟登顶 ClawHub 榜首、72 小时斩获 3.6 万次下载**，是最广为人知的「自进化」工具，后续围绕这一方向创办 EvoMap。
- **Junjie Wang（王军杰）**：**EvoMap 首席科学家**，研究方向：Agent 自进化、协议层、经验对象设计。早稻田大学博士，清华大学博士后，长期围绕"Agent 如何在测试时持续变强"展开系统研究，**Evolver 主要开发者之一**。

> 编辑：于腾凯  校对：李享沣
