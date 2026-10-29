# 阿里Qwen提出Skill-RM：把奖励模型做成可复用Agent Skill

> 📊 Level ⭐⭐⭐⭐ | 16.5KB

>原文存档：[原文存档](https://mp.weixin.qq.com/s/K92ZQp1PnVQq1UPOes9rtA)

#阿里Qwen提出Skill-RM：把奖励模型做成可复用Agent Skill

阿里巴巴 Qwen 应用团队提出 **Skill-RM**——把异构奖励评估标准（rubric、参考答案、checklist、verifier、聚合规则）封装成可执行的 Reward-Evaluation Skill，让 Agentic judge 按需检索资源、收集证据并确定性聚合打分。同一骨干 Qwen3.5-27B 下，RewardBench2/RM-Bench/JudgeBench 三项平均分从83.9提升到86.2（+2.3），挂载样本级资源后进一步达到89.1（+5.2）。开源仓库 https://github.com/Qwen-Applications/Skill-RM。

##核心定义

Skill-RM 把 RM 设计从「单一标量打分器」迁移到「Skill化的多源验证器」：

- **`SKILL.md`**（规格 I）：评估说明书——评分维度、优先级、输出格式（标量/成对/选 N）
- **资源库 `R`**：五类资源——Rubric、Reference、Checklist、Verifier、Calibration
- **执行协议 `E`**：诊断 →选资源 →验证 →聚合 →读出奖励
- **证据 `e_i = (c_i, o_i, d_i)`**：每条准则挂结构化观测与局部判定
- **读出函数 `f: E → Y`**：把轨迹确定性地映射到任务所需输出

**Skill-RM 不是单点模型，而是「评估操作系统」**：把 agentskills.io 的「说明书 +工具箱」范式专门用到 reward评估。

##论文核心发现

### 三项主基准（同骨干 Qwen3.5-27B）

| 方法 | RewardBench2 | RM-Bench | JudgeBench | 平均 |
|------|-------------|----------|-----------|------|
| Qwen3.5-27B Judge |81.1 |89.8 |80.8 |83.9 |
| RewardAgent |82.0 |80.5 |66.3 |76.3 |
| **Skill-RM** | **85.0** |91.5 | **82.1** | **86.2** |
| **Skill-RM + sample-spec.** | **86.0** | **91.5** |89.7 | **89.1** |

Skill-RM 三项全涨，样本级资源挂载后 +5.2 分（vs Baseline），全基准最高。

###关键消融：append资源反而降分

|改动 | 平均 | Δ |
|------|------|---|
| Baseline |83.9 |0.0 |
| + appended resources（直接粘进 prompt）|81.0 | **-2.9** |
| + appended + sample-spec. |82.0 | -1.9 |
| + Python tool |83.6 | -0.3 |
| **Skill-RM（Skill编排）** | **86.2** | **+2.3** |

**最具启发的反直觉数据**：把 reference 和 verifier 直接粘进 prompt，平均分掉2.9 分。append模式下 judge 同时看到 rubric、checklist、verifier 说明，却缺少 Skill协议规定的「先诊断再选资源」顺序，关键信号（如 sandbox 的 parse_json 结果）被长 prompt稀释。**+2.3 分的提升是编排赢了，不是资源变多了**。

### RL 下游（VerInstruct + GRPO）

| 方法 | IFEval | IFBench | AdvancedIF | 平均 |
|------|--------|---------|-----------|------|
| Tulu3 |82.6 |27.6 |25.0 |45.1 |
| VerIF |83.7 |27.6 |22.8 |44.7 |
| **Skill-RM** | **84.8** | **27.6** | **25.4** | **45.9** |

Skill-RM端到端接入 RL奖励链路，IFEval +1.1、AdvancedIF +2.6、IFBench持平。

###指令遵循 RM排名（IF-RewardBench Kendall）

| 方法 | 平均 |
|------|------|
| Skywork-V2-Llama3.1-8B |0.133 |
| Qwen3.5-27B |0.411 |
| Gemini-3-Flash |0.513 |
| **Skill-RM** | **0.524** |

标量 RM（Skywork）在 IF场景几乎失灵；Skill-RM 平均0.524最高。System-Prompt 子集0.413仍落后 Gemini-3-Flash 的0.489——长系统提示是指令遵循 judge 的硬骨头。

## 与同类方案的定位辨析

|方案 |资源类型 |样本级资源 |编排机制 |跨任务泛化 |
|------|----------|------------|----------|------------|
| TIR-Judge-Zero | 单模态（Python 执行器） |弱 |写代码验证 |单一（verifiable任务） |
| OpenRS | 多模态 | **强**（JudgeBench93.1）|协议定制 |弱（需适配）|
| OpenRubrics / Auto-Rubric | rubric单一模态 | 中 | prompt模板 | 中 |
| **Skill-RM** | **五类统一调度** | **强** | **Skill协议 +渐进式披露** | **强**（默认涨分） |

Skill-RM 的核心优势是「默认协议下就能涨分」，不需要为每种任务单独适配协议模板。代价是**推理开销**：多步 Agentic轨迹比单次标量 RM慢，需要 early stopping、证据缓存、artifact剪枝。

### 与现有 wiki概念的呼应

- **[Harness Engineering](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/harness-engineering-framework.md)**：Skill-RM 把 Skill范式从 Agent 执行层延伸到 RM评估层——同一套「说明书 +工具箱」抽象在两个不同域落地
- **[Skill 系统设计](https://github.com/QianJinGuo/wiki-public/blob/main/entities/skill-system-design-three-way-comparison.md)**：Reward-Evaluation Skill 是 SKILL.md范式在 reward域的扩展，证明 Skill抽象可复用、可编排、可审计
- **[Token-in-Token-out Agentic RL](https://github.com/QianJinGuo/wiki-public/blob/main/entities/agentic-rl-token-in-token-out.md)**：Skill-RM 是 agentic RL闭环中「奖励信号可审计化」的关键拼图——flat prompt 的奖励信号难复现，Skill化的评估轨迹可复查
- **[AWS RL LLM-as-Judge](https://github.com/QianJinGuo/wiki-public/blob/main/entities/aws-reinforcement-fine-tuning-llm-as-judge.md)**：AWS 的同方向探索，但 Skill-RM给出更系统的资源分层 +编排协议
- **[Agent 自改进六机制](https://github.com/QianJinGuo/wiki-public/blob/main/entities/agent-self-improvement-six-mechanisms.md)**：Skill-RM属于「外部奖励 + Skill化」机制，与 L4 对抗训练形成对照

###渐进式披露 vs append

flat prompting 的根本问题：把全部资源一次性倒给 judge，关键信号被淹没。Skill-RM 的渐进式披露借鉴 agentskills.io 的设计——**资源默认潜伏，Skill规格触发才加载**。消融数据 -2.9 直接证明：堆资源不如编排资源。

### 为什么 Skill-RM 不是「又一个 agentic judge」

TIR-Judge-Zero、OpenRS 等已有 agentic judge路线，但 Skill-RM 的差异化在于：

- **统一抽象**：rubric、reference、verifier、聚合规则被同一 Skill协议调度，不必为每种任务改 prompt
- **样本级扩展**：Skill 接口允许 per-sample挂载（reference、约束、verifier 输出），通用协议 +任务特化并存
- **证据 schema**：每条证据 `(c_i, o_i, d_i)`标准化，事后可审计、可复用

这是把 RM 从「模型」变成「评估基础设施」的关键一步。

## 深度分析

### 把 reward model 从「一个模型」重构为「一套评估基础设施」

标量 RM 的失效方式可预测：`r = RM(x,y)` 把正确性、格式、安全压成一个实数，下游只看得到分数，看不到分数从哪来。LLM-as-judge 补回了理由文本，但理由是非结构化生成，用哪些资源、采信哪条证据藏在一次前向里——可读，不可复算。rubric 条件化拆开了维度，却一次只暴露一种模态，遇到复合题仍靠 prompt 硬塞。三者共同短板不是判得不准，而是缺一层承接判断过程的接口。Skill-RM 不追更强骨干，把评估拆成规格 I、资源库 R、证据 E 与确定性读出 f，判分质量于是成为可单独替换、可回归的组件。基础设施的验收标准不是峰值分数，而是坏了好定位、换了不牵动全局。

### 为什么 append 掉分、编排涨分：注意力的预算分配

消融里最反直觉的一行是 -2.9：参考答案和 verifier 一个没少，分数反而低于裸 judge。原因在暴露顺序而非材料。append 模式下 rubric、checklist、verifier 说明与答案等权平铺，注意力没有优先级可依——`parse_json: pass` 只是长 prompt 中间一行字，和「语气是否友好」同权。Skill 协议反过来：先诊断任务类型，再按结论取资源，资源默认潜伏。判断链变成条件式的，关键观测出现在该出现的位置。这正是 progressive disclosure 的实质——文件组织方式决定注意力预算如何分配。+2.3 是顺序赢来的；单挂 Python 工具只有 -0.3，说明多一件工具本身几乎不值钱。

### 证据 schema 的工程价值：可审计、可复用、可归因

`e_i = (c_i, o_i, d_i)` 只是三个字段，实际把判分从叙述变成记录：c_i 锚定判据，o_i 是可外部复核的事实（verifier 输出、检索段落、格式检查），d_i 只对这条准则负责。三种能力随之落地。可审计——最终分数能回指到具体观测，而非一段听起来合理的推理；可复用——证据与聚合解耦，同一份观测可在不同准则下重新解读；可归因——分数错了能定位到哪条准则、哪个 verifier、哪次观测出错，修局部而不必重训 RM。这与 agent trace 同构：把评估轨迹当一等制品而非日志副产品，[Token-in-Token-out Agentic RL](https://github.com/QianJinGuo/wiki-public/blob/main/entities/agentic-rl-token-in-token-out.md) 要的奖励可复现性，只有落到 schema 层才可操作。

### Agentic judge 的成本结构：什么任务值得付

多步评估的成本是两项相乘：每样本若干轮评估 token 乘以 Best-of-N 的 N，且评估串行落在关键路径。既然贵，判据就不是「平均分涨没涨」，而是「重排能否逼近 Oracle@10」。GSM8K 上界 97.9、baseline 已 97.7，重排空间只剩 0.2，付 N 倍延迟换 0.1 分不成立；IFEval、HumanEval+ 上 baseline 与上界差距大，重排才有真实收益。BigCodeBench 居中：有提升却够不到上界，说明瓶颈已从「judge 不够努力」转到「复杂代码的可验证面不够宽」。离线 RL 链路里成本可摊到训练吞吐；在线逐 token 打分基本不可能回本。

### 迁移含义：技能是给 agent 的说明书，也是给评估器的证据合同

技能通常被读作写给执行者的手册。Skill-RM 给了第二种读法：同一份 `SKILL.md` 既回答「怎么做」，也回答「怎么算做对」。后果有二。其一，技能复用边界从「跨 agent」扩到「跨阶段」——同一份定义同时服务采样、判分与回归，[Skill 系统设计](https://github.com/QianJinGuo/wiki-public/blob/main/entities/skill-system-design-three-way-comparison.md) 的抽象因此多了一条被训练回路直接消费的出口。其二，技能质量有了可度量的下游：写得含糊的 skill 会在评估端表现为证据缺项。反过来，能被当合同用的技能，必须把准则写成可检查项，而不是形容词。

## 工程启示

- **RL管线已有 reference/verifier 的**：**封装成 Skill 接口，别直接 append 进 prompt**——消融已经证明会降分
- **采样解码 + Best-of-N 重排**：IFEval/HumanEval+收益最明确（Oracle@10几乎饱和的 GSM8K收益极小）
- **System-Prompt 长上下文场景**：仍是 judge弱点，值得单独扩 Skill资源库
- **上线前算清延迟**：Agentic 多步评估的 token 开销，能否被 Best-of-N质量增益覆盖

**适合场景**：指令遵循 RL（IF-RewardBench）、多源证据任务（数学+代码+工具）、跨任务泛化的 RM 服务化。**不适合**：超低延迟在线打分（每 token 都跑 Agentic judge 不划算）。

##局限与开放问题

- **评估范围**：以文本 IF 和标准 RM benchmark为主，多模态、长程 Agent、主观偏好待扩展
- **Skill策展靠人工**：自动化构建与持续更新是开放题
- **推理成本**：高于标量 RM，生产环境要算 ROI

## 实践启示

1. **RL管线已有 reference/verifier 的——封装成 Skill 接口，别直接 append 进 prompt**：消融数据已证明 append 模式平均掉 2.9 分；编排才是提升来源，不是资源数量

2. **Best-of-N 重排优先接入 IFEval/HumanEval 收益明确的场景**：Oracle@10 在 GSM8K 类饱和任务上收益极小，在 IF 场景收益最明确——先算 ROI 再上线

3. **System-Prompt 长上下文场景是 judge 的当前弱点**：值得单独扩 Skill 资源库，专门处理长系统提示的指令遵循评估

4. **上线前必须算清 Agentic 多步评估的 token 开销**：+2.3 分的提升能否被 Best-of-N 质量增益覆盖，是生产部署的 ROI 门槛

5. **Skill 策展自动化是开放研究方向**：当前依赖人工维护ресурс库，自动化构建与持续更新是工程落地的主要瓶颈

**适合场景**：指令遵循 RL（IF-RewardBench）、多源证据任务（数学+代码+工具）、跨任务泛化的 RM 服务化。**不适合**：超低延迟在线打分（每 token 都跑 Agentic judge 不划算）。

---

## 与已有实体的差异化

- **vs [AWS RL LLM-as-Judge](https://github.com/QianJinGuo/wiki-public/blob/main/entities/aws-reinforcement-fine-tuning-llm-as-judge.md)**：AWS走 Amazon Bedrock集成路线；Skill-RM走 Skill协议 +跨骨干通用路线
- **vs Evaluating Netflix with LLM-as-a-Judge**：Netflix案例是 judge 应用层；Skill-RM 是 judge框架层
- **vs [Multimodal Evaluators](https://github.com/QianJinGuo/wiki-public/blob/main/entities/multimodal-evaluators-mllm-as-judge-image-to-text.md)**：多模态 judge 是另一维度（输入模态）；Skill-RM 是单模态但评估协议层

## 上手资源

- **论文**：Skill-RM: Unifying Heterogeneous Evaluation Criteria via Agent Skill（Alibaba Qwen-Applications）
- **GitHub**：https://github.com/Qwen-Applications/Skill-RM
- **公众号转载**：Hyman的杂货铺（2026-06-10）
## 相关实体

- [面向 skills 编程：大淘宝企业购 5 阶段演进与 anthropic agent skills 标准实战](https://github.com/QianJinGuo/wiki-public/blob/main/entities/skills-driven-programming-taobao-enterprise-5-phase-evolution-2026-06-17.md)

---

