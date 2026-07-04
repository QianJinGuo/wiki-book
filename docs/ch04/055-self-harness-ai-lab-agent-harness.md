# Self-Harness：上海AI Lab 提出的 Agent 自我改进 Harness 范式

## Ch04.055 Self-Harness：上海AI Lab 提出的 Agent 自我改进 Harness 范式

> 📊 Level ⭐⭐ | 23.3KB | `entities/self-harness-shanghai-ai-lab-agent-improves-harness.md`

# Self-Harness：上海AI Lab 提出的 Agent 自我改进 Harness 范式

> 本实体整理自 [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/self-harness-shanghai-ai-lab-agent-improves-harness-hyman-2026-06-12.md)，并参考 Shanghai AI Lab 论文 *Self-Harness: Harnesses That Improve Themselves*（https://arxiv.org/abs/2606.09498 ）。

## 一句话总结

**Self-Harness** 由上海人工智能实验室（Shanghai AI Lab）提出，核心是：**让固定权重的 LLM Agent 根据自己的执行轨迹挖掘弱点、提出 Harness 修改提案、再用 held-in/held-out 双重门控验证合并**。在 Terminal-Bench-2.0 上把 MiniMax M2.5、Qwen3.5-35B-A3B、GLM-5 三款模型的 held-out 通过率分别推到 **61.9%、38.1%、57.1%**；其中 Qwen3.5 held-in 集相对提升高达 **138%**，说明极简 Harness 对小模型能力的压制有多狠。

## 范式定位：Harness 改进的第三条路

| 范式 | 谁改进 Harness | 改进对象 | 依赖外部 |
|------|---------------|---------|---------|
| **人类工程** | 工程师 | 手工调优 | 人力 |
| **Meta-Harness**（Stanford） | 更强 Agent（Opus 4.6） | Harness 代码空间 | 强外部模型 |
| **Self-Harness**（Shanghai AI Lab） | **同一个固定模型** | **声明式 Harness 状态** | **无** |

Self-Harness 的根本性差异化：**不依赖更强外部模型，也不靠人类逐行改配置**。Agent 在"当前 Harness 约束下"用"自己的失败证据"提出"有界修改"——本质上是 Agent 在给自己写"操作手册"。

这与 [L6 Meta-Harness 编排自优化](https://github.com/QianJinGuo/wiki/blob/main/entities/agent-self-improvement-six-mechanisms.md) 同属一脉，但**Self-Harness 走得更远**——它把"Big Harness > Big Model"的 thesis 推到了**单模型自举**的极端：哪怕没有更强模型，固定权重的模型也能通过 Harness 自进化获得显著提升。

## Harness 形式化定义

论文把 Harness 定义为**模型与环境之间的非参数化执行协议层**：

- **H** = Harness（H* 是优化目标）
- **M** = 固定模型（**权重冻结**）
- **τ** = 任务
- **ξ** = 执行轨迹
- **o** = 输出
- **V** = 评估器（**冻结**）

Harness 包含的组件：

- 系统指令与阶段性 Prompt
- 文件读写、Shell 执行等工具接口
- 记忆与状态管理
- 验证与权限策略
- 失败恢复与运行时熔断机制

**优化目标**：H*（Harness 序列）— **模型权重和评估器始终冻结**，只改周围的执行协议。

## Self-Harness 三阶段闭环

整条链路可概括为 **Weakness Mining → Harness Proposal → Proposal Validation**。核心直觉：先把零散失败变成可操作的证据，再让模型当 Proposer 出补丁，最后用回归测试决定是否合并。

### 阶段一：Weakness Mining（弱点挖掘）

用当前 Harness 在 **held-in** 任务集上跑固定模型，收集轨迹记录 ξ，其中 V(τ, o) 为验证结果。

**关键设计：验证器驱动的确定性聚类**

失败记录集合会先经过 verifier-grounded 聚类，再结构化交给 Proposer。每条失败轨迹归因成**三元组签名**：

- **e_verifier**：验证器层面的终端失败原因（超时、缺文件、断言失败等）
- **e_action**：Agent 行为对该失败的因果贡献
- **e_mechanism**：可复用的抽象行为机制（无限重试、未创建产物、环境变量丢失等）

只有签名完全相同的失败才归入同一簇。这一步刻意避免"语义相似但机制不同"的失败被混在一起——比如两个任务都超时，一个是因为死循环调工具，另一个是因为没写输出文件，需要的 Harness 补丁完全不同。

每个簇再整理成结构化失败模式（簇大小、代表任务、共享症状、验证器证据），按支持度和可修复性排序，打包成证据束 S 交给下一阶段。**S 只描述问题，不预设怎么改**——评估器与优化器职责分离。

### 阶段二：Harness Proposal（Harness 提案）

同一模型在 Proposer 角色下，读取 S、当前 Harness 可编辑接口、历史通过行为、以往被拒提案摘要，**并行生成 k 个互异提案**。

每个提案把 S 映射到候选 Harness，外加审计记录（针对的失败模式、修改表面、预期行为、回归风险）。

**两条硬约束**：

1. **多样性**：k 个分支应覆盖不同失败机制或不同 Harness 表面，不能换措辞重复同一补丁
2. **最小性**：每个分支只改解决该机制所需的最小表面，禁止重写整套控制架构

Proposer 还会过滤"不可修复"的簇——纯能力上限、任务特异性难度、证据不足的失败，不会硬凑修改。

### 阶段三：Proposal Validation（提案验证）— 接受门极其保守

候选 Harness 不能"提议即采纳"。对每条提案，在 held-in 和 **held-out** 上分别重跑评估（held-out 轨迹从未暴露给 Proposer，专做回归门）。

记 a、b 为候选 Harness 在两个 split 上的通过任务数，候选相对当前 Harness 的增益为：

```
Δ = (a + b) - (a_prev + b_prev)
```

**接受规则**：

```
接受 ⟺ (Δa ≥ 0 AND Δb ≥ 0) AND (Δa > 0 OR Δb > 0)
```

也就是说：**至少一个 split 有提升，另一个 split 不能退步**；靠"牺牲 held-in 换 held-out"的提案一律拒绝。

同一轮多个兼容提案可合并；被拒提案只记日志，不改活跃 Harness。评估带随机性时会重复跑并聚合 pass 计数，降低单次侥幸过关的概率。

## 实验：Terminal-Bench-2.0 + 三个底座模型

**评测基准**：Terminal-Bench-2.0（89 个容器化终端任务，考察工具调用、产物管理、验证行为、错误恢复等 Agent 基本功）。主实验固定 64 个任务子集，剔除依赖不稳定外网或多模态输入的条目。

**三个底座模型**：

| 模型 | 部署方式 | 备注 |
|------|---------|------|
| MiniMax M2.5 | 托管 API | 闭源旗舰 |
| Qwen3.5-35B-A3B | 4×NVIDIA H200 本地 SGLang 部署 | 开源 MoE |
| GLM-5 | OpenRouter | 闭源 |

**初始 Harness**：基于 [DeepAgent](https://github.com/QianJinGuo/wiki/blob/main/entities/tmic-ai-xiaoxin-deepagent-architecture-evolution.md) SDK，刻意保持极简（默认系统 Prompt + 基础文件读写编辑 + Shell 工具）。Self-Harness 只能修改声明好的 Harness 配置接口（指令、工具策略、验证引导、运行时策略、子 Agent、Skill 等），模型、解码、工具集、评测环境、评估器全部锁定。

## 主结果：三个反直觉细节

| 模型 | Held-in 变化 | Held-out 变化 | Held-out 相对提升 |
|------|-------------|--------------|------------------|
| MiniMax M2.5 | 43.0% → 50.0% | 40.5% → 61.9% | **+53%** |
| Qwen3.5-35B-A3B | 15.1% → 36.0% | 23.8% → 38.1% | +60% |
| GLM-5 | 47.7% → 57.0% | 42.9% → 57.1% | +33% |

**三个反直觉细节**：

1. **Qwen3.5 held-in 相对提升 138%**（15.1% → 36.0%）——小模型在极简 Harness 下浪费了大量能力，针对性补丁收益极高
2. **MiniMax held-out 绝对涨 21.4 个百分点**（40.5% → 61.9%）——是 held-out 绝对增益冠军
3. **三个 promoted Harness 在任一 split 上都没退步**——回归门有效挡住了"拆东墙补西墙"式修改

held-out 同步上涨尤其关键：改进抓住了**可泛化的执行机制缺陷**，没有停留在死记 held-in 失败案例上。

## 进化轨迹：分支搜索与合并

Self-Harness 真实运行更像**分支搜索**，会有平台期和回撤。绿点=接受、灰叉=拒绝、阶梯线连接有效候选。

### MiniMax M2.5：42.2% → 53.9%

最终保留三类补丁：

- **Missing artifacts** → 尽早创建必需输出文件
- **Schema-invalid content** → 规范结构化工具输出标签
- **Stalled tool loops** → 工具调用超过 50 次后强制转向

### Qwen3.5：20.3% → 36.7%

引入更重型的结构机制：

- 依赖预检 Skill
- 工具错误 Middleware
- 探索循环熔断
- artifact-ensure 子 Agent

其中 subagent 和 skill 分支曾因无进一步收益被整体丢弃——**系统会主动放弃无效探索**。

### GLM-5：46.1% → 57.0%

- 会话级环境持久化
- 分阶段外部下载
- "探索太久就转入实现与测试"的验证阶段约束

三条跑下来都绕不开 **artifact reliability（产物可靠性）**；但补丁方向截然不同——M2.5 补内容标签和工具预算上限，Qwen 补依赖预检和重试纪律，GLM 补 Shell 环境持久化和探索—实现切换。**三套脚手架没法互相抄作业，有效 Harness 必须按模型量身裁剪**。

## 三个 Case Study：补丁如何改变真实执行轨迹？

### Case 1：GLM-5 + build-pov-ray（探索型 → 工程型）

- **初始 Harness**：Agent 把大量 tool budget 砸在漫长的外部资源下载上，sanity check 反复非零仍强行 finalize
- **编辑后 Harness**：分阶段下载 → 先检查压缩包完整性 → 发现超时证据后换源 → 修复失败的渲染检查
- **结果**：**行为路径从"探索型"拧向"工程型"**

### Case 2：MiniMax M2.5 + count-dataset-tokens（早产物 + 有界探索）

- **初始 Harness**：bootstrap 指令是"找最小编辑面"，运行时无 tool message 上限
- **编辑后 Harness**：bootstrap 改为"识别必需输出产物并尽早创建初版"；运行时策略启用 tool message 上限
- **结果**：失败轨迹里 Agent 在数据集元数据里打转直到超时；成功轨迹则锁定 science subset、算出 token 总数、写入 `/app/answer.txt` 并回读验证——**早产物 + 有界探索**直接转化为 pass

### Case 3：Qwen3.5 + extract-elf（Middleware 级干预）

- **初始 Harness**：Agent 写好 extractor 后陷入反复 overwrite/edit 失败，最终删掉 `/app/extract.js`，验证器因缺文件判 fail
- **编辑后 Harness**：增加 tool-error 触发的系统 Prompt，把 Agent 拽回"补产物"主线
- **结果**：重建 extractor、修正解析逻辑、校验 JSON、确保文件在位——**这是 Middleware 级干预，比堆叠礼貌用语管用得多**

## 深度分析

### 1. Self-Harness 与 L6 Meta-Harness 的关系

[L6 Meta-Harness 编排自优化](https://github.com/QianJinGuo/wiki/blob/main/entities/agent-self-improvement-six-mechanisms.md) 是 [Agent 自我改进六层模型](https://github.com/QianJinGuo/wiki/blob/main/concepts/agent-self-improvement-loops.md) 的最顶层，强调"Big Harness > Big Model"。Stanford 的 Meta-Harness 用 **Claude Code + Opus 4.6** 迭代优化 Harness（强模型改弱模型），7 轮迭代把文本分类推到比 ACE 高 7.7 个百分点。

Self-Harness 是**同模型自举**版本——把"需要更强模型"这个外部依赖彻底拿掉。这条路线走通后有几个深远含义：

- **每个新发布的模型 checkpoint 都可以在出厂前自动跑几轮 Self-Harness**，形成"模型 + 个性化 Harness"配对发布
- **Harness 改进从"专家工程"降维到"模型自进化"**，边际成本趋近于零
- **对闭源模型厂商尤其有价值**——他们可以内部 Self-Harness 而无需暴露模型权重给外部 Meta-Harness 系统

### 2. 受"小模型被压制"现象的工程含义

Qwen3.5 在极简 Harness 下 held-in 仅 15.1%，而 Self-Harness 后跳到 36.0%（**+138%**）。这意味着：

- **小模型在通用 Harness 上有大量"沉睡能力"**——不是模型本身不行，而是 Harness 没有针对性暴露它的强项
- **未来 Agent 评测必须配对报告"Harness 家族"**——只报模型分数不报 Harness 改进是信息缺失
- **模型选型需要考虑"可改进性"**——一个 Self-Harness 友好的小模型可能比一个固定 Harness 上的大模型更优

### 3. "Harness 工程被严重低估"的具体证据

Meta-Harness 消融实验 显示：给 AI 完整信息（50%）vs 摘要（34%），差距远比模型切换（Claude 3.5 → 4）带来的收益大。Self-Harness 用三组数据进一步验证了这一点：

- M2.5 held-out 绝对涨 21.4 个百分点（来自 Harness 改进）
- GLM-5 held-out 涨 14.2 个百分点
- Qwen3.5 held-in 涨 20.9 个百分点（**相对 138%**）

如果用 [Harness-as-Product-Surface](https://github.com/QianJinGuo/wiki/blob/main/concepts/harness-as-product-surface.md) 的视角看，**模型是 0、1 之争，Harness 是中间地带的全部竞争**。Self-Harness 把这条 thesis 用"模型自举"的方式做了实证。

### 4. 接受规则的工程严谨性

Self-Harness 的接受门 **接受 ⟺ (Δa ≥ 0 AND Δb ≥ 0) AND (Δa > 0 OR Δb > 0)** 设计得极其保守：

- **不允许任何一个 split 退步**——避免"拆东墙补西墙"
- **必须至少一个 split 有提升**——避免"无用但无害"的修改堆积
- **held-out 不暴露给 Proposer**——专门做回归门，模拟"面对新任务"的能力

这个设计直接对标 [验证工程](https://github.com/QianJinGuo/wiki/blob/main/concepts/verifier-driven-development.md) 里的**双向门控**原则：既要 in-distribution 提升，也要 out-of-distribution 不退步。这与传统的 RLHF 用单一 reward signal 不一样，**Self-Harness 的奖励信号是结构化的（held-in、held-out 两个 pass 计数）**，本质上是在 Harness 层做了**轻量 RLHF**。

### 5. 与现有"自进化"工作的层级区分

| 方向 | 代表 | 改进对象 | Self-Harness 差异 |
|------|------|---------|------------------|
| 上下文/记忆自适应 | [Reflexion](https://github.com/QianJinGuo/wiki/blob/main/concepts/agent-self-improvement-loops.md), ACE | 回复策略、上下文 | 改**声明式 Harness 状态** |
| 外部 Agent 设计搜索 | [ADAS](https://github.com/QianJinGuo/wiki/blob/main/entities/agent-self-improvement-six-mechanisms.md), [Meta-Harness](https://github.com/QianJinGuo/wiki/blob/main/entities/agent-self-improvement-six-mechanisms.md) | Harness 代码空间 | **无更强外部优化器** |
| 开放 ended 自进化 | AI Scientist, DGM | 算法/能力扩展 | **有界编辑 + 固定基准** |

Self-Harness 把自己定位在**"可控、可审计"**的一端：每次 Harness 变更都记录修改表面、split 结果、接受/拒绝决策，形成可追溯的 lineage。这对工程团队意味着——**Harness 可以像代码一样走 PR + 回归测试流程**，告别纯靠手感调 Prompt 的黑盒时代。

## 局限与未来方向

### 论文自陈的局限

- **有界 Harness 编辑 + 固定基准**——尚未触及开放世界无限自举
- **补丁可能带 benchmark-specific 偏差**——更高风险场景需要比 pass-rate 非回归更严的门控
- **依赖验证器质量和轨迹记录完整性**——垃圾证据进，垃圾补丁出

### 推演的两类落地

1. **模型发布配套 Self-Harness 流水线**：新 checkpoint 上线前自动跑几轮自我补丁，比通用 Prompt 模板更贴模型行为
2. **与 Meta-Harness 混合**：弱模型自举 + 强模型偶尔审阅提案，在成本与上限之间折中

### 推演的工程挑战

- **真实生产 Harness 要处理权限、合规、多租户隔离**——接受门控只会更严
- **验证器质量决定了 Self-Harness 的天花板**——需要为每个垂直领域构造"轻量可信"的验证器
- **Harness 修改的 lineage 治理**——多次 Self-Harness 后 Harness 可能漂移到难以维护的状态

## 实践启示

### 对 Agent 工程师

1. **不要把 Harness 当作"调一次就完"的配置**——它应该是和模型一起持续进化的状态
2. **跟踪执行轨迹的失败模式聚类**——这是 Self-Harness 的核心思路，手工版也能用
3. **建立"修改 → held-in 测试 → held-out 验证"的三步回归流程**——即使不用 Self-Harness，PR-style Harness 治理也是必需的

### 对模型厂商

1. **出厂前跑 Self-Harness**——给每个 checkpoint 配对发布"模型 + 个性化 Harness"
2. **公开 Harness 改进 trace**——让用户看到模型在不同任务上的失败模式
3. **接受"模型 × Harness"联合优化是常态**——单独比较模型分是不完整的

### 对评测基准设计

1. **必须同时报告 baseline Harness 和 Self-Harness 后分数**——否则无法判断模型真实能力
2. **基准应当提供"held-in / held-out 划分"**——支持 Self-Harness 风格的接受门
3. **基准应当提供"轻量可信的验证器"**——这是 Self-Harness 能否落地的关键依赖

## 与现有实体的互补关系

- [Agent 自我改进六条路](https://github.com/QianJinGuo/wiki/blob/main/entities/agent-self-improvement-six-mechanisms.md) — L6 Meta-Harness 编排自优化的"同模型自举"实现
- [Agent Harness 工程学调研 2026](https://github.com/QianJinGuo/wiki/blob/main/entities/agent-harness-engineering-survey-2026.md) — Self-Harness 是该领域的最新论文
- [Agent Harness 工程学调研 etcvlovg Taxonomy](https://github.com/QianJinGuo/wiki/blob/main/entities/agent-harness-engineering-survey-etcvlovg-taxonomy.md)
- [Agent Production Harness Engineering](https://github.com/QianJinGuo/wiki/blob/main/entities/agent-production-harness-engineering.md)
- [Harness Engineering Framework](https://github.com/QianJinGuo/wiki/blob/main/concepts/harness-engineering-framework.md)
- [Harness as Product Surface](https://github.com/QianJinGuo/wiki/blob/main/concepts/harness-as-product-surface.md)
- [Agent 自我改进循环](https://github.com/QianJinGuo/wiki/blob/main/concepts/agent-self-improvement-loops.md)
- [AI 自我改进自举](https://github.com/QianJinGuo/wiki/blob/main/concepts/ai-self-improvement-bootstrapping.md)
- [Evaluation Harness Design](https://github.com/QianJinGuo/wiki/blob/main/concepts/evaluation-harness-design.md)
- [Verifier-Driven Development](https://github.com/QianJinGuo/wiki/blob/main/concepts/verifier-driven-development.md)
- [SGLang](https://github.com/QianJinGuo/wiki/blob/main/entities/sglang.md) — Qwen3.5 部署用到的推理引擎
- [DeepAgent 架构演进](https://github.com/QianJinGuo/wiki/blob/main/entities/tmic-ai-xiaoxin-deepagent-architecture-evolution.md) — 初始 Harness 基于 DeepAgent SDK
- [ByteDance TRAE Harness Engineering Guide](https://github.com/QianJinGuo/wiki/blob/main/entities/bytedance-trae-harness-engineering-guide.md)
- [复旦 AHE Agentic Harness Engineering](https://github.com/QianJinGuo/wiki/blob/main/entities/fudan-agentic-harness-engineering-ahe-gpt54-7points.md)
- [Harness Engineering 七层架构](https://github.com/QianJinGuo/wiki/blob/main/entities/harness-engineering-7-layers-openclaw-hermes-claude-code-p1aNu.md)
- [Harness Component Expiry and Build-to-Delete](https://github.com/QianJinGuo/wiki/blob/main/concepts/harness-component-expiry-and-build-to-delete.md) — Self-Harness 的"接受门"是这一思想的工程化实现

→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/self-harness-shanghai-ai-lab-agent-improves-harness-hyman-2026-06-12.md)

---

