---
title: "阿里Qwen出手：Skill-RM把奖励模型做成可复用Agent Skill"
source_url: "https://mp.weixin.qq.com/s/K92ZQp1PnVQq1UPOes9rtA"
ingested:2026-06-10
sha256:71b68d7932f57cd9883a593c97256e7aaf19e7c596c14bdfd1a9ba9d8c5c80b0
type: source
tags: [wechat, skill-rm, qwen, reward-model, agent-skill, rewardbench, rm-bench, judgebench, alibaba, agentic-judge, skill-md, llm-as-judge, grpo, verinstruct, hyman]
---

#阿里 Qwen 提出 Skill-RM：把奖励模型做成可复用 Agent Skill

>论文标题：**Skill-RM: Unifying Heterogeneous Evaluation Criteria via Agent Skill**
>论文作者：阿里巴巴 Qwen团队（Qwen-Applications）
> 开源仓库：https://github.com/Qwen-Applications/Skill-RM
>公众号转载：Hyman的杂货铺，2026年6月10日07:30

## 一句话

阿里巴巴 Qwen团队提出 **Skill-RM**，把异构的奖励评估标准（rubric、参考答案、checklist、verifier 等）封装成可执行的 **Reward-Evaluation Skill**，让 Agent 按需检索资源、收集证据并聚合打分，在 RewardBench2、RM-Bench、JudgeBench 三项基准上以 Qwen3.5-27B骨干取得 **86.2 平均分**，超越同骨干 LLM-as-a-Judge 基线 **+2.3**。

## 一道 JSON 题，暴露 RM 的「拼凑困境」

论文 Figure1 给了一个极简但典型的判卷场景。Prompt 要求写一个 `normalizeScores(values)` 函数，返回包含 `minScore`、`maxScore`、`normalizedScores` 的 JSON字符串。

两个候选回答：
- A：snake_case键名 + JSON 结构错误
- B：camelCase键名正确 +字段齐全

如果只看「像不像好代码」，两个回答都可能骗过浅层 judge。真正靠谱的评估要同时动用好几类资源：

1. **测试执行**（代码类任务优先跑测试）
2. **格式约束**（camelCase标识符、精确 JSON键名）
3. **沙盒验证**（Python sandbox 执行 parse_json 检查）
4. **优先级规则**（正确性优先于风格，平局才看次要维度）

传统 LLM-as-a-Judge 会把上述内容全塞进一个 prompt，让模型自己琢磨先看哪条、后看哪条。**Skill-RM换了个思路**：把这些资源写进 Reward-Evaluation Skill，按固定流程「诊断 →选资源 →验证 →聚合」走一遍。论文示例轨迹里 A 得2/5、B 得5/5，最终选 B——每一步证据都挂在结构化输出里，事后能复查。

**核心矛盾**：评估标准已经碎片化，编排层却还停留在 flat prompting。

##背景：RM 从「打分器」变成「多源验证器」

大模型后训练里 Reward Model（RM）是 RLHF、RFT、GRPO 等流程的「方向盘」。早期范式是点式标量预测，优化目标为

`r = RM(x, y)`

——`x` 是 prompt，`y` 是回答，输出一个数。简单、快，但信息损失大。

模型能力往推理、代码、工具调用方向扩张后，「怎么判好坏」也跟着变复杂：
- 数学题要对答案、跑 verifier
- 代码题要过单元测试
- 安全场景要拆约束、做 policy veto
-事实类问题要查 reference、检索证据
- Agent轨迹要逐步校验 tool call合法性

信号来源各异，现有设计却缺统一编排。标量 RM 把多维证据压成不透明分数；LLM-as-a-Judge 能写理由，但资源选择、证据追踪、信号聚合往往藏在模型「直觉」里，难复现。Rubric条件化、工具增强 judge 等方向各有进展，大多**一次只暴露一种资源模态**——缺的是可复用、可编排、证据可追溯的抽象层。

## Agent Skill范式为何能迁移到 RM？

Anthropic 的 Agent Skills、开源 agentskills.io规范，把「怎么做一类任务」打包成文件系统制品：核心是 `SKILL.md`（流程 + 元数据），旁边挂脚本、参考文档、可执行资源，Agent 按需渐进式加载。

奖励评估和 Agent 做任务，底层逻辑很像：都要在多种工具/文档里**选对资源、按步骤执行、留下可复查记录**。Anthropic 的 Skill 把这类流程固化成文件；Skill-RM把它专门用到「怎么给模型回答打分」。

论文把资源库分成五类：

|资源类型 |例子 |作用 |
|----------|------|------|
| Rubric & Criterion | 有用性、正确性、安全 | 定义评判维度与优先级 |
| Reference |答案键、证据段落 |支撑事实/数学正确性 |
| Checklist & Constraint |格式要求、禁止行为 | 把指令遵循拆成可检查项 |
| Verifier & Tool | Python sandbox |产出可执行观测 |
| Calibration & Aggregation |证据优先级规则 |解决冲突、映射到最终判断 |

**Skill-RM 的核心动作**：把奖励知识外化成 **Reward-Evaluation Skill**——带资源库、调用协议、证据 schema 的可执行评估程序，相当于给 judge 一份「判卷说明书」加「工具箱」。

## 三步走：Skill-RM实际怎么判一道题？

**第一步，加载 Skill规格**。类似读 `SKILL.md`：这次要评哪些准则？输出格式是点式分数、成对偏好，还是从 N 个候选里选一个？论文把 Skill记为 `S = (I, R)`——`I` 是说明书，`R` 是工具箱。

**第二步，按协议收集证据**。Agentic judge逐步执行：列出可用资源 →检视 rubric →调 verifier →填 checklist。每激活一条准则 `c_i`，就记一条证据 `e_i`：`o_i` 是观测（比如 sandbox 返回 `parse_json: pass`），`d_i` 是局部判定（满足/违反/不确定）。所有证据汇总成 `E = {(c_i, o_i, d_i)}`，`E` 是最终结论字段。

**第三步，确定性读出奖励**。读出函数 `f: E → Y` 从完整轨迹 `E`映射到任务所需输出：`Y ∈ ℝ` 给标量，`Y ∈ {1, ..., N}` 给最优候选编号，`Y ∈ {A, B}` 即成对偏好。点式 RM、pairwise RM、rubric聚合 RM 被收进同一套 Skill 执行范式——差别只在最后一步怎么读 `E`。

**关键设计是渐进式披露**：资源默认潜伏，Skill规格触发才加载。flat prompt 把整库资源一次性倒给 judge，上下文噪声会把关键信号淹没——后面消融实验会验证这一点。

资源库本身通过 LLM辅助策展：从文献、benchmark文档、可验证评估实践里聚合候选，去重、泛化、版本冻结。论文 Appendix 列了6 类通用资源（helpfulness rubric、math answer-first rubric、code test-first rubric、safety bounded-help rubric、JSON format checklist、evidence priority aggregation rule）加样本级扩展接口。

## 实验：同骨干对比才是硬指标

### RewardBench2 / RM-Bench / JudgeBench 主结果

| 方法 | RewardBench2 | RM-Bench | JudgeBench | 平均 |
|------|-------------|----------|-----------|------|
| GPT-4o Judge |64.9 |73.1 |59.8 |65.9 |
| Skywork-Reward-V2-Llama-3.1-8B |84.1 |92.8 |80.0 |85.6 |
| Qwen3.5-27B Judge |81.1 |89.8 |80.8 |83.9 |
| RewardAgent (Qwen3.5-27B) |82.0 |80.5 |66.3 |76.3 |
| **Skill-RM (Qwen3.5-27B)** | **85.0** |91.5 | **82.1** | **86.2** |

同骨干下，Skill-RM 三项全涨，平均从83.9提到86.2（+2.3）。RewardBench2 和 RM-Bench拿到完整行最高；JudgeBench 上122B MoE变体冲到85.2，27B 版82.1 也已超过同骨干 judge 的80.8。

和 **TIR-Judge-Zero**（agentic verifier judge，平均76.4）比，Skill-RM 的优势在**统一编排多种资源**，而不只是挂一个 Python 执行器。和 **OpenRubrics**、**Auto-Rubric** 等 rubric 系统比，Skill-RM 能同时调度 rubric、reference、verifier、聚合规则，不必为每种任务单独改 prompt模板。

###挂载样本级资源：RL场景的关键增益

| 方法 | RewardBench2 | RM-Bench | JudgeBench | 平均 |
|------|-------------|----------|-----------|------|
| Qwen3.5-27B Judge |81.1 |89.8 |80.8 |83.9 |
| OpenRS + sample-spec. |84.0 |87.5 | **93.1** |88.2 |
| Skill-RM |85.0 |91.5 |82.1 |86.2 |
| **Skill-RM + sample-spec.** | **86.0** | **91.5** |89.7 | **89.1** |

OpenRS 在 JudgeBench 上冲到93.1（定制评估协议），但**同骨干平均最高仍是 Skill-RM + sample-spec. 的89.1**。无样本资源时 Skill-RM 已 +2.3；挂上样本资源后再 +2.9，说明 Skill 接口对 RL 下游价值更大。

###消融：append资源反而降分

这篇论文最有启发的一行数据在这里：

| 方法 | 平均 | Δ |
|------|------|---|
| Baseline (Qwen3.5-27B Judge) |83.9 |0.0 |
| + appended resources |81.0 | -2.9 |
| + appended + sample-spec. |82.0 | -1.9 |
| + Python tool |83.6 | -0.3 |
| **Skill-RM** | **86.2** | **+2.3** |
| **Skill-RM + sample-spec.** | **89.1** | **+5.2** |

把 reference 和 verifier 直接粘进 prompt，平均分从83.9掉到81.0。append模式下 judge 同时看到 rubric、checklist、verifier 说明，却缺少 Skill协议规定的「先诊断再选资源」顺序，关键信号（如 sandbox 的 parse_json 结果）容易被长 prompt稀释——这和渐进式披露的设计正好相反。单独给 Python工具也几乎没增益（83.6）。**+2.3 分的提升，更像是编排赢了，而不是资源变多了。**

论文还在 GPT-4o、Claude-3.5-Sonnet、DeepSeek-V3 等多个骨干上做了补充实验（Appendix Table8），趋势一致：Skill-RM相对同骨干 flat judge均有正向提升，说明机制不绑死 Qwen 一家。

## Best-of-N 重排：哪里赚、哪里还难

JETTS固定池实验用 Qwen2.5-72B-Instruct 生成10 个候选，比较重排质量（和生成能力无关）。Baseline 和 Skill-RM走相同 sequential pairwise knockout；Skywork-Reward-V2-Qwen3-8B独立打分选最高。

- **GSM8K**：Skill-RM97.8，Oracle@10 上界97.9，Baseline97.7——数学近乎饱和，Skill 只是把最后0.1抠出来
- **IFEval、HumanEval+**：Skill-RM明显超过 Baseline 和 Skywork，指令遵循和代码场景收益最实在
- **BigCodeBench**：Skill-RM 有正向提升，但距 Oracle仍有明显差距，复杂代码任务的重排仍是短板

**工程取舍**：采样解码 + Best-of-N 时，IFEval 和 HumanEval+值得优先加 Skill-RM 式重排层；BigCodeBench 这类复杂代码任务，单靠 judge 重排很难贴近 Oracle@10 上界。

##指令遵循 RL：能当奖励源吗？

### IF-RewardBench排序（Kendall 相关 overall assessment）

| 方法 | Single-Turn | Multi-Turn | System-Prompt | 平均 |
|------|-------------|------------|---------------|------|
| Gemini-3-Flash |0.589 |0.460 |0.489 |0.513 |
| Qwen3.5-27B |0.507 |0.440 |0.287 |0.411 |
| Skywork-V2-Llama3.1-8B |0.153 |0.205 |0.039 |0.133 |
| **Skill-RM** | **0.619** | **0.540** | **0.413** | **0.524** |

标量 RM（Skywork 平均0.133）在 IF场景几乎失灵；**Skill-RM 平均0.524最高**，Single-Turn（0.619）和 Multi-Turn（0.540）拉满。System-Prompt 子集0.413，仍落后 Gemini-3-Flash 的0.489——长系统提示是指令遵循 judge 的硬骨头，后续 Skill扩展值得盯。

### VerInstruct + GRPO 下游训练

| 方法 | IFEval | IFBench | AdvancedIF | 平均 |
|------|--------|---------|-----------|------|
| Tulu3 |82.6 |27.6 |25.0 |45.1 |
| VerIF |83.7 |27.6 |22.8 |44.7 |
| **Skill-RM** | **84.8** | **27.6** | **25.4** | **45.9** |

VerIF 是最接近的对照（同样用 VerInstruct + GRPO）。Skill-RM 平均45.9最高，IFEval +1.1、AdvancedIF +2.6，IFBench持平27.6。**增幅不大，但方向正确**——Skill-RM 可以端到端接入 RL奖励链路，而不只是离线 benchmark刷分。

## 和 TIR-Judge、OpenRS差在哪？

- **TIR-Judge-Zero**：给 judge挂 Python 执行器，让模型写代码验证答案。强项是 verifiable任务，弱项是资源类型单一——rubrics、checklists、聚合规则仍靠 prompt硬塞
- **OpenRS**：样本级资源做得深，JudgeBench 上样本资源挂载后极强（93.1）。代价是评估协议定制程度高，跨任务泛化要单独适配
- **Skill-RM**：用 Skill抽象统一调度所有资源类型，默认协议下就能涨分，挂载样本资源后进一步拉升。trade-off 是**推理开销**：多步 Agentic轨迹比单次标量 RM慢，论文也承认需要 early stopping、证据缓存、artifact剪枝来控成本

##局限：三件事还没解决

1. **评估范围**以文本 IF 和标准 RM benchmark为主，多模态、长程 Agent、主观偏好待扩展
2. **Skill靠人工策展**，自动化构建与持续更新是开放题
3. **推理成本**高于标量 RM，生产环境要算 ROI——Best-of-N 重排可能划算，每 token 在线 RL奖励可能要慎重

## RM竞争正在转向「评估基础设施」

Skill-RM 本质是把 agentskills.io 那套「说明书 +工具箱」搬进判卷：同一骨干 Qwen3.5-27B 上，编排式 Skill 比 flat judge 平均高2.3 分，**append资源反而掉2.9 分**——说明问题在流程，不在堆料。对齐训练要的是**稳定、可审计的奖励信号**；flat prompt每次让 judge 从零决定资源用法，复现性和透明度都吃亏。

### 工程建议（基于论文数据）

- RL管线里已有 reference/verifier 的，**试试封装成 Skill 式接口，别直接 append 进 prompt**——消融已经证明会降分
-采样解码后加 Best-of-N 重排，**IFEval/HumanEval+收益明确**
- System-Prompt 长上下文场景仍是弱点，值得单独扩 Skill资源库
- 上线前算清楚延迟：Agentic 多步评估的 token 开销，能不能被 Best-of-N 的质量增益覆盖

开源仓库 https://github.com/Qwen-Applications/Skill-RM 已放出。Qwen 应用团队这条线如果和 Qwen3.5训练栈深度整合，有机会成为开源对齐方案里「**可编排奖励**」方向的标杆实现。
