---
title: "上海AI Lab 提出 Self-Harness：Agent自己改Harness，通过率最高涨138%"
source_url: "https://mp.weixin.qq.com/s/sgP8m1nnW7JhsDT7Ki7nVw"
source: "wechat|Hyman的杂货铺"
author: "Hyman的杂货铺"
publish_date: "2026-06-12"
ingested: "2026-06-12"
type: article
tags: []
source_type: wechat
sha256: "618adb3ff8fcc8a8c73cf099a2eb91b9891cd24793e5bacf4705706a785c5107"
---

上海人工智能实验室（Shanghai AI Lab）提出 **Self-Harness** 范式：让固定权重的 LLM Agent 根据执行轨迹挖掘自身弱点、提出并回归验证 Harness 修改。在 Terminal-Bench-2.0 上把三款模型的 held-out 通过率分别推到 61.9%、38.1%、57.1%。其中 Qwen3.5 在 held-in 集上相对提升高达 138%，说明极简 Harness 对小模型的压制有多狠。

**论文标题**：Self-Harness: Harnesses That Improve Themselves
**论文链接**：https://arxiv.org/abs/2606.09498

## 背景

Claude Code、Codex、OpenHands 这类 Agent 产品背后，真正决定成败的往往是**底座模型 + Harness**的组合。Harness 就是包住模型的"执行脚手架"——系统 Prompt、工具集、验证规则、失败恢复策略、运行时控制逻辑，全都算在内。同一个 GPT 级模型，换一套 Harness，终端任务通过率能差出十几个百分点。

Harness 至今仍主要靠人类工程师手工打磨。模型家族越来越多、迭代越来越快，给每个新模型单独调一套 Harness，成本已经跟不上了。Self-Harness 换了一条路——**让 Agent 自己改自己正在用的 Harness**，不依赖更强外部模型，也不靠人类逐行改配置。

## Harness 到底是什么？

论文把 Harness 定义为模型与环境之间的**非参数化执行协议层**。它包括：

- 系统指令与阶段性 Prompt
- 文件读写、Shell 执行等工具接口
- 记忆与状态管理
- 验证与权限策略
- 失败恢复与运行时熔断机制

可以把 LLM 想成技能固定的工人，Harness 是他的操作手册。Self-Harness 不雇新工人、也不改造工人，只不断修订手册，再用实际产出验证修订是否有效。

形式化地说，固定模型 M 在 Harness H 下处理任务 τ，产生执行轨迹 ξ 和输出 o；评估器 V 给出 pass/fail。优化对象是 Harness 序列 H*，**模型权重和评估器始终冻结**，只改周围的执行协议。

这和 Reflexion、Agentic Context Engineering 等"自我改进"工作有本质区别：后者改的是记忆、上下文或单次回复策略；Meta-Harness 等外部优化器则由更强 Agent 搜索 Harness 代码。Self-Harness 要求**同一个固定模型**，在**当前 Harness 约束下**，根据**自己的失败证据**提出有界修改——更像 Agent 在给自己写"操作手册"。

## Self-Harness 三阶段闭环

整条链路可以概括成 **Weakness Mining → Harness Proposal → Proposal Validation**。核心直觉是：先把零散失败变成可操作的证据，再让模型当 Proposer 出补丁，最后用回归测试决定是否合并进下一代 Harness。

### 阶段一：Weakness Mining（弱点挖掘）

用当前 Harness 在 **held-in** 任务集上跑固定模型，收集轨迹记录。

失败记录集合会先经过**验证器驱动的确定性聚类**，再结构化交给 Proposer。每条失败轨迹被归因成一个三元组签名：

- e_verifier：验证器层面的终端失败原因（超时、缺文件、断言失败等）
- e_action：Agent 行为对该失败的因果贡献
- e_mechanism：可复用的抽象行为机制（无限重试、未创建产物、环境变量丢失等）

只有签名完全相同的失败才归入同一簇。这一步刻意避免"语义相似但机制不同"的失败被混在一起——比如两个任务都超时，一个是因为死循环调工具，另一个是因为没写输出文件，需要的 Harness 补丁完全不同。

每个簇再整理成结构化失败模式（簇大小、代表任务、共享症状、验证器证据），按支持度和可修复性排序，打包成证据束交给下一阶段。**只描述问题，不预设怎么改**——评估器与优化器职责分离。

### 阶段二：Harness Proposal（Harness 提案）

同一模型在 Proposer 角色下，读取证据束、当前 Harness 可编辑接口、历史通过行为、以往被拒提案摘要，**并行生成 k 个互异提案**。

每个提案把证据束映射到候选 Harness，外加审计记录（针对的失败模式、修改表面、预期行为、回归风险）。

提案必须满足两条硬约束：

1. **多样性**：k 个分支应覆盖不同失败机制或不同 Harness 表面，不能换措辞重复同一补丁
2. **最小性**：每个分支只改解决该机制所需的最小表面，禁止重写整套控制架构

Proposer 还会过滤"不可修复"的簇——纯能力上限、任务特异性难度、证据不足的失败，不会硬凑修改。

### 阶段三：Proposal Validation（提案验证）

候选 Harness 不能"提议即采纳"。对每条提案，在 held-in 和 **held-out** 上分别重跑评估（held-out 轨迹从未暴露给 Proposer，专做回归门）。

记 a、b 为候选 Harness 在两个 split 上的通过任务数，候选相对当前 Harness 的增益为：

```
Δ = (a + b) - (a_prev + b_prev)
```

接受规则 **极其保守**：

```
接受 ⟺ (Δa ≥ 0 AND Δb ≥ 0) AND (Δa > 0 OR Δb > 0)
```

也就是说：至少一个 split 有提升，另一个 split 不能退步；靠"牺牲 held-in 换 held-out"的提案一律拒绝。同一轮多个兼容提案可合并；被拒提案只记日志，不改活跃 Harness。评估带随机性时会重复跑并聚合 pass 计数，降低单次侥幸过关的概率。

## 实验设置：极简 Harness 上的公平对比

论文在 **Terminal-Bench-2.0** 上验证——89 个容器化终端任务，考察工具调用、产物管理、验证行为、错误恢复等 Agent 基本功。主实验固定 64 个任务子集，剔除依赖不稳定外网或多模态输入、初始 Harness 不支持的条目，降低评测噪声。

三个底座模型覆盖不同家族：

- **MiniMax M2.5**（托管 API）
- **Qwen3.5-35B-A3B**（4×NVIDIA H200 本地 SGLang 部署）
- **GLM-5**（OpenRouter）

初始 Harness 基于 **DeepAgent** SDK，刻意保持极简：一段 Terminal-Bench 默认系统 Prompt + 基础文件读写编辑 + Shell 工具。Self-Harness 只能修改声明好的 Harness 配置接口（指令、工具策略、验证引导、运行时策略、子 Agent、Skill 等），模型、解码、工具集、评测环境、评估器全部锁定。

任务集预先划分为 held-in / held-out；held-in 供弱点挖掘与提案，held-out 仅用于晋升门控。主指标为 Pass (%)：每个 Harness 候选默认重复 2 次尝试，由任务验证器对最终容器状态判定成败。

## 主结果：三模型全线上涨，Qwen 相对提升最猛

| 模型 | Held-in 变化 | Held-out 变化 | Held-out 相对提升 |
|------|-------------|--------------|------------------|
| MiniMax M2.5 | 43.0% → 50.0% | 40.5% → 61.9% | **+53%** |
| Qwen3.5-35B-A3B | 15.1% → 36.0% | 23.8% → 38.1% | +60% |
| GLM-5 | 47.7% → 57.0% | 42.9% → 57.1% | +33% |

数字背后有几个反直觉的细节：

- **Qwen3.5 held-in 从 15.1% 拉到 36.0%，相对提升 138%**，是三者里最夸张的——说明小模型在极简 Harness 下浪费了大量能力，针对性补丁收益极高
- **MiniMax held-out 40.5% → 61.9%，绝对涨 21.4 个百分点**，是 held-out 绝对增益冠军
- **三个 promoted Harness 没有任何一个在任一 split 上退步**，说明回归门有效挡住了"拆东墙补西墙"式修改

held-out 同步上涨尤其关键：改进抓住了可泛化的执行机制缺陷，没有停留在死记 held-in 失败案例上。

## 进化轨迹：试错与合并并存

Self-Harness 的真实运行更像分支搜索，表面看会有平台期和回撤。论文为每个模型画了进化曲线：绿点=接受、灰叉=拒绝、阶梯线连接有效候选。

**MiniMax M2.5** 在论文绘制的进化曲线上从 42.2% 爬到 53.9%，最终保留三类补丁：

- **Missing artifacts** → 尽早创建必需输出文件
- **Schema-invalid content** → 规范结构化工具输出标签
- **Stalled tool loops** → 工具调用超过 50 次后强制转向

**Qwen3.5** 从 20.3% 到 36.7%，引入了依赖预检 Skill、工具错误 Middleware、探索循环熔断、artifact-ensure 子 Agent 等更重型的结构机制；其中 subagent 和 skill 分支曾因无进一步收益被整体丢弃——说明系统会主动放弃无效探索。

**GLM-5** 从 46.1% 到 57.0%，侧重会话级环境持久化、分阶段外部下载、以及"探索太久就转入实现与测试"的验证阶段约束。

三条跑下来都绕不开 **artifact reliability（产物可靠性）**；但补丁方向截然不同——M2.5 补内容标签和工具预算上限，Qwen 补依赖预检和重试纪律，GLM 补 Shell 环境持久化和探索—实现切换。三套脚手架没法互相抄作业，**有效 Harness 必须按模型量身裁剪**。

## 案例深潜：补丁如何改变真实执行轨迹？

论文用 Terminal-Bench 具体任务做了 before/after 轨迹对比，比宏观数字更能说明 Self-Harness 在干什么。

### GLM-5：build-pov-ray 从"硬下完再说"到"分阶段验证"

初始 Harness 下，Agent 把大量 tool budget 砸在漫长的外部资源下载上，sanity check 反复非零仍强行 finalize。编辑后的 Harness 要求分阶段下载、先检查压缩包完整性、发现超时证据后换源、修复失败的渲染检查——**行为路径被 Harness 从"探索型"拧向"工程型"**。

### MiniMax M2.5：count-dataset-tokens 的"先写答案文件"

接受补丁后，bootstrap 指令从"找最小编辑面"变成"识别必需输出产物并尽早创建初版"；运行时策略启用 tool message 上限。失败轨迹里 Agent 在数据集元数据里打转直到超时；成功轨迹则锁定 science subset、算出 token总数、写入 `/app/answer.txt` 并回读验证——**早产物 + 有界探索**直接转化为 pass。

### Qwen3.5：extract-elf 的工具错误恢复

初始轨迹中 Agent 写好 extractor 后陷入反复 overwrite/edit 失败，最终删掉 `/app/extract.js`，验证器因缺文件判 fail。编辑后增加 tool-error 触发的系统 Prompt，把 Agent 拽回"补产物"主线：重建 extractor、修正解析逻辑、校验 JSON、确保文件在位——这是 **Middleware 级干预**，比堆叠礼貌用语管用得多。

## 与相关工作的位置关系

| 方向 | 代表工作 | 改进对象 | Self-Harness 差异 |
|------|---------|---------|------------------|
| 上下文/记忆自适应 | Reflexion, ACE | 回复策略、上下文 | 改声明式 Harness 状态 |
| 外部 Agent 设计搜索 | ADAS, Meta-Harness | Harness 代码空间 | 无更强外部优化器 |
| 开放 ended 自进化 | AI Scientist, DGM | 算法/能力扩展 | 有界编辑 + 固定基准 |

论文刻意把自己放在"可控、可审计"的一端：每次 Harness 变更都记录修改表面、split 结果、接受/拒绝决策，形成可追溯的 lineage。这对工程团队意味着——**Harness 可以像代码一样走 PR + 回归测试流程**，告别纯靠手感调 Prompt 的黑盒时代。

## 局限与未来：自进化≠无限进化

作者也坦诚了几条边界：

- 研究范围限定在**有界 Harness 编辑 + 固定基准**，尚未触及开放世界无限自举
- 接受的补丁仍可能带 **benchmark-specific** 偏差；更高风险场景需要比 pass-rate 非回归更严的门控
- 全流程依赖验证器质量和轨迹记录完整性——**垃圾证据进，垃圾补丁出**

## 个人判断

Self-Harness 最打动人的地方，是它把"模型弱点"和"系统补丁"之间的映射做成了**可验证的闭环**。过去调 Agent，常见做法是看几条失败 log 然后手写规则；这里用 verifier-grounded 聚类把失败机制结构化，再用 held-out 回归挡住过拟合——本质上是在 Harness 层做了一套**轻量 RLHF**，奖励信号就是确定性验证器。

如果这条路线继续往外推，预期会看到两类落地：

1. **模型发布配套 Self-Harness 流水线**：新 checkpoint 上线前自动跑几轮自我补丁，比通用 Prompt 模板更贴模型行为
2. **与 Meta-Harness 混合**：弱模型自举 + 强模型偶尔审阅提案，在成本与上限之间折中

Terminal-Bench 毕竟是容器化封闭任务。真实生产的 Harness 还要处理权限、合规、多租户隔离，接受门控只会更严，这段路还很长。但至少方向是对的——**Agent 时代的竞争，会越来越像"模型 × Harness"的联合优化**，参数规模只是一半故事。
