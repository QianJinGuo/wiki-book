---
source: wechat
source_url: https://mp.weixin.qq.com/s/Nr8_9LJWcKUIUl4LCC5U_w
ingested: 2026-08-04
feed_name: 数据STUDIO
wechat_mp_fakeid: MP_WXS_3949259461
source_published: 2026-07-28
title: "Codex、Claude Code 的推理 effort 本质就是往 prompt 里塞了一句话"
sha256: f692836f1352c0a6b6d3b35e769b5bcad4b0c1a4028aa17d57ee4fa3fa576702
---

# Codex、Claude Code 的推理 effort 本质就是往 prompt 里塞了一句话

---
source: wechat
source_url: https://mp.weixin.qq.com/s/Nr8_9LJWcKUIUl4LCC5U_w
ingested: 2026-08-04
source_published: 2026年7月28日 11:58
---


现在打开 Codex、Claude Code、Kimi Code，选完模型，旁边往往还有一个推理档位的选择器——low / medium / high / max / ultra。大部分人凭手感拨，简单问题拨低、难题拨高。也没什么不对。

但如果你在工程里大量调用推理模型，靠手感就有点危险了。因为同一个模型在 high 和 low 下，API 成本和延迟可以差好几倍，而边际收益到了高段会急剧衰减。更重要的是，那个选择器背后不是一个简单的"多想一点"魔法——它对应着训练管线里一组具体的、公开可查的工程决策。

这次 Sebastian Raschka 写了一篇长文，从 DeepSeek-R1 的 RLVR 一直拆到 Inkling 的连续值 effort conditioning，把六份开源模型技术报告放在一起对比。我看完后最大的感受是：这东西完全可以工程化理解，不需要当成黑箱。

本文按这个思路组织：先把推理模型的基础机制讲清楚（RLVR、think 标签、开关、档位），然后逐个拆解六套训练配方，最后落到工程上怎么用。

GPT-5.6 Sol 在不同推理档位下的 benchmark 表现。模型越大，最高档的边际增益越明显。

## 01一、"推理模型"到底在推理什么？

先把词说清楚。AI 里的技术名词大多数不能按字面理解——神经网络不真的像人脑工作，同理，"推理模型"也不真的像人一样推理。

在 LLM 研究的语境里，reasoning model 指的是：**模型在给出最终答案之前，先输出一段中间的推理过程（reasoning trace），相当于把草稿纸上的步骤一并写出来** 。这个定义本身不涉及机制，只描述行为。

举个例子就清楚了。问"15% of 240 is what?"，普通 LLM 直接答"36"。推理模型会先输出一段话："To find 15% of 240, I need to multiply 240 × 0.15. 240 × 0.1 = 24, 240 × 0.05 = 12, so 24 + 12 = 36"，然后给出答案。这一段中间输出就是 reasoning trace。

左边是普通 LLM 直接给答案，右边是推理模型先绕一段中间过程再作答。

### RLVR：只打分，不教步骤，模型自己学会了推理

让模型产生这种行为的核心方法，是 DeepSeek-R1 论文给出的 RLVR——Reinforcement Learning with Verifiable Rewards。做法直接到反直觉：

  1. 给模型一个问题（数学题、代码题），让它生成答案。
  2. 用外部验证器检查最终答案对不对——数学用 SymPy 或 WolframAlpha 验算，代码用编译器或单元测试跑一遍。
  3. 对就给 reward 1，错就给 0。

**关键点：中间的推理过程完全不参与评分。**  DeepSeek 团队试过把推理 trace 也纳入训练信号，发现帮助不大，就砍掉了。训练只看最终答案对不对、输出格式合不合规。R_total = R_accuracy + R_format，就这么简单。

但结果是什么？只靠"奖励结果"这一条，模型自己学会了：写中间步骤、回溯检查、发现错误然后自我修正。这种"等一下，这里好像不对"的瞬间，论文里叫 Aha moment——模型在推理 trace 中间突然意识到之前算错了，回头改，再继续。

这其实是一个很深的工程洞察：**你不需要教模型怎么推理，只需要在可验证的领域给它正确与否的信号，它自己会涌现出推理行为。**  当然有个前提——领域必须能自动核对对错。数学和代码天然满足这个条件，这也是为什么推理模型的早期 benchmark 几乎都集中在这两个领域。

### think 标签是界面需要，不是推理需要

你大概率在模型输出里见过 `<think>` 和 `</think>` 标签。很容易以为这对标签"开启"了推理能力。不是。

这对标签是**装饰性的** ，对推理能力本身没有贡献。它唯一的作用是标记推理 trace 的起止位置，好让 ChatGPT、Codex 这些界面把它折叠隐藏——用户通常不需要看中间的草稿，只需要看最终答案。

证据是：你可以用不带这对标签的方式重新训练一个模型，benchmark 分数几乎一样。换成任意一对别的符号，效果也一样。

那它是怎么来的？训练时在 RLVR 的 reward 函数里加了一项格式奖励——鼓励模型把推理过程放进 `<think></think>` 标签里。R_format 就是一条简单的规则检查：推理 trace 在标签里 = +1，不在 = 0。所以标签是训出来的格式约定，不是推理的机制基础。

这个区分很重要，因为后面讲各模型的训练配方时，你会发现大量操作都是在控制这个标签区域的行为：预填空标签来关闭推理、在标签中间截断来控制长度、用不同惩罚系数来影响标签区域的 token 数量。**标签本身不值钱，但它圈出来的那块区域，是全部工程操作的作用面。**

推理模型中常见的格式标签。它们标记草稿的起止，不是"思考"本身。

## 02从"关不掉的话痨"到"混合模式"

理解了推理模型的基础机制，再看一个演进问题：**第一代推理模型只有一个档位——开，而且关不掉。**

DeepSeek-V3 是基座，DeepSeek-R1 是另一个独立训练的推理模型。R1 的典型毛病：不管问什么——哪怕"hello"——它都长篇大论地推一遍，而且没有关闭推理的开关。你没法让它"直接答就行"。这也是为什么第一代推理模型虽然 benchmark 漂亮，但在实际产品里很难用：简单对话的延迟和成本完全没必要。

再简单的问题，第一代推理模型也要啰嗦一大段。

后来的模型开始解决这个问题。Qwen3 是一个标志性的转折点——它做到了**同一个模型既能当普通 LLM，也能按需切成推理模式** 。实现方式叫 Thinking Mode Fusion，在 SFT 阶段混合两种样本：

  * `/think` 样本：`<think>` → 推理 trace → `</think>` → 答案
  * `/no_think` 样本：`<think></think>` → 直接跳到答案

推理时，`enable_thinking=False` 在 chat template 层面预填一个空的 `<think></think>` 块，模型看到这个就知道这轮不需要推理，直接给答案。`enable_thinking=True` 预填 `<think>`，触发推理模式。软开关是给模型看的 `/think` 和 `/no_think` 指令，硬开关是 chat template 直接预填标签——后者保证模型不会"自作主张"地开始推理。

Qwen3 0.6B 在 thinking=False 和 thinking=True 下的响应差异。thinking=False 时模型直接跳到最后答案，thinking=True 时正常输出推理过程。

从 Qwen3 开始，"开关"变成了推理模型的标配。而到了 GPT-5.6 这一代，开关从二元变成了多档——low / medium / high / max / ultra，甚至更多。这就是文章开头说的那个下拉菜单。

## 03这句 system prompt，模型凭什么能听懂？

### 档位的实际载体

OpenAI 没公开 GPT-5.6 闭源模型的训练实现，但从它们去年开源的 gpt-oss 可以确认一个关键事实：**推理档位是通过 system prompt 传进去的。**

GPT-5.6 暴露从 Light 到 Ultra 的六档推理档位。最多档的方案之一。

具体来说，gpt-oss 的 chat template 在每次请求前面加一句 `Reasoning effort: low` / `Reasoning effort: medium` / `Reasoning effort: high`。ChatGPT 和 Codex 界面上那个下拉选择器，本质上就是把按钮映射成这么一句话。

同样的机制也出现在其他模型里。DeepSeek V4 的 Think Max 模式用 `Reasoning Effort: Absolute maximum with no shortcuts permitted`。Inkling 用 `Thinking effort level: 0.8` 这样的连续值。Kimi K3 在 API 里直接暴露出 `reasoning_effort` 参数，也是用自然语言指令传给模型。

gpt-oss 的 chat template 将推理档位作为 system message 注入。档位的唯一载体就是这句自然语言指令。

所以档位的实际载体就是一句话。这个事实本身并不令人意外——毕竟 LLM 只能用 token 交流。真正的问题在后面。

### 随便一个模型不行，训练时必须动手脚

随便拿一个没经过对应训练的模型，往 system prompt 里塞 `Reasoning effort: high`，它不会理你。它没有学会"这句话 → 这个行为"的映射。

要让模型真正听懂这份指令，训练阶段必须配合。目前六份技术报告公开的配方可以归纳为三条核心路径：

**路径一：RLVR 阶段调长度惩罚。**  不同 system prompt 配不同的 token 惩罚系数 λ。说 low 时 λ 大，对生成长度罚得重，逼模型写短。说 high 时 λ 小或为零，放它写长。这种做法的本质是让 RL 阶段直接把"档位标签 → token 预算"的关联编码进策略。

奖励函数大致是这个形式：
    
    
    R(e) = R_task − λ(e) × N_tokens  
    

其中 e 是 effort level，λ(e) 是档位对应的 token 惩罚系数。e 越大 λ 越小。DeepSeek V4 和 Inkling 都走这条路。

**路径二：RLVR 之后补一轮 effort-conditioned SFT。**  收集一批"这个 prompt 要这么长的推理"的配对样本，让模型在 SFT 阶段学会 label 到长度的映射。目标响应可以由人类写、由另一个模型生成、或由模型自己生成后筛选。Qwen3 的 Thinking Mode Fusion 就是这个思路，虽然它做的是二元开关而非连续档位，但机制本质相同。

**路径三：多专家蒸馏。**  不给同一个模型训练多种行为，而是分别训多个"专家"——low 专家用短推理数据训、high 专家用长推理数据训、max 专家用最大上下文窗口和小长度惩罚训——然后通过 on-policy distillation 把所有专家的行为合并进同一个 checkpoint。DeepSeek V4 和 Kimi K3 明确走了这条路。

三条路径不互斥。Sebastian Raschka 推测 gpt-oss 和 GPT-5.6 是路径一和路径二组合着用的——先用 RLVR 做推理能力的基础训练，再用 SFT 植入档位响应。从效果看，这可能是目前最成熟的工程方案。

这个三路径框架建立以后，下面逐个拆模型的配方就有了坐标系——每套方案都可以被理解为这三条路径的某种排列组合。

两种可能实现路径：effort-conditioned RLVR（左侧，调整 token 惩罚）和 effort-conditioned SFT（右侧，喂入不同长度的配对样本）。两者可组合。  


## 04换模型和调档位，是两个相互独立的轴

在逐模型拆解之前，还需要讲清楚一个概念区分，因为它直接关系到你怎么理解档位的工程意义。

GPT-5.6 的界面把两件事分得很清楚。左边的 Luna / Terra / Sol 选择器，**是在换模型本身** ——不同的权重文件，不同的参数量级，不同的训练算力投入。右边的推理档位选择器，**模型不变，只改推理时花掉多少 token** 。前者对应训练 scaling（training compute scaling），后者对应推理 scaling（inference scaling）。

选模型（左）和调档位（右）对应两个不同的 scaling 轴。左换权重，右换推理算力。  


把这两个轴画在同一张图上，会得到一个很直观的结论：**同一模型的不同档位是一条曲线，不同模型是不同的曲线。小模型高档位，可以追平大模型低档位。**

Artificial Analysis 在 Coding Agent Index v1.1 上的实测数据说明了这一点。沿单条曲线（比如 Sol）从 low 往 ultra 走，coding 表现提升，API 成本也提升——这是推理 scaling。从 Luna 的曲线跳到 Terra 再到 Sol，同样是表现和成本一起涨——这是模型 scaling。两条曲线会重叠。Luna 开到 high 有时和 Terra 的 low 分数差不多。

沿单条曲线移动是调档位（推理 scaling），跨 Luna/Terra/Sol 三条曲线是换模型（训练 scaling）。两者都能提分，也会推高成本。  


从工程角度看，这意味着你手里握着两个旋钮：

  * 调档位是**在同一次训练投入下，买更多或更少的推理时间** ；
  * 换模型是**买更多或更少的训练投入本身** 。

两个旋钮可以组合。用大模型低档位还是小模型高档位，取决于你对精度、成本、延迟的权衡。没有哪个组合在所有任务上都是最优的。

但有一个规律是跨模型成立的：**档位的边际收益会递减。**  GPT-5.6 Sol 从 high 到 max 到 ultra，每一档仍然提升 coding agent 分数，但提升幅度越来越小，成本却线性甚至超线性增长。Inkling 的 effort 曲线更直观——effort 0.8 以后 benchmark 几乎走平，token 数还在涨，但分数不涨了。

推理档位同时推高 API 成本和 coding 表现，但在 GPT-5.6 最高几档出现明显的收益递减。  


gpt-oss 在不同推理档位下的响应长度和精度。档位越高 token 越多、准确度越高，但趋势在接近高段时变平。  


这个规律对实际使用有直接影响：如果你的任务不需要极限推理，"最高档"反而是最差选择——多花了钱，没多拿分。

## 05逐模型拆解：六套配方各有什么不一样

前面四节搭了一个理解框架：什么是推理模型 → 开关怎么来的 → 档位在 system prompt 里 → 训练时有三条路 → 档位和模型是两个轴。下面在这个框架下逐个看六份开源模型技术报告里到底做了什么。

还有一个训练 scaling vs 推理 scaling 区分的关系图：

训练和推理 scaling 是提高推理模型能力的两个独立手段。两条曲线都可以独立推动 benchmark 提升。  


DeepSeek V4 的做法最直观，也是最能看清"多专家蒸馏"路径的案例。

它定义了三种推理模式：

  * **Non-think** ：不输出推理 trace，直接给答案。这等于前面说的"开关关掉"的那个行为。
  * **Think High** ：标准推理模式，在 `<think></think>` 里写完整推理过程，大多数场景下的默认档。
  * **Think Max** ：和 Think High 一样输出推理 trace，但用了更长的上下文窗口 + 更小的长度惩罚 + 一句特殊系统指令 `Reasoning Effort: Absolute maximum with no shortcuts permitted`。

这三种行为来自三个**独立训练** 的推理专家。每个专家在 RLVR 阶段使用不同的 context window 和 length penalty 配置。Think Max 的配置最宽松——context 更长（给推理更多空间）、长度惩罚更小（允许它写更长的 trace）。然后，三个推理专家加上一批领域专家（DeepSeek V4 的 teacher pool 超过十个），通过 on-policy distillation 合并进同一个 checkpoint。

这里有一个容易被误读的关键点：**那句  `Absolute maximum with no shortcuts permitted` 不是纯 prompt engineering。** 它是和训练配置绑定的——换一个没经过这个惩罚配置的模型，照抄这句话不会有效果。think max 行为是在 RLVR 阶段编码的，system prompt 只是触发器。

DeepSeek V4 报告写得很详细，但有一个遗憾：没有公开不同 teacher 和三种推理模式的精确映射关系。所以只能确认架构路径，无法精确还原每个 expert 的 reward 配方。

DeepSeek V4 的三个推理模式在文档中的描述。Think Max 那句 system 指令看着像 prompt 技巧，实际背后有独立训练配置。  


### 5.2 Nemotron 3 Ultra：把"学出来的行为"和"外部硬截断"拆成两个维度

NVIDIA 的 Nemotron 3 Ultra 是我觉得工程上最值得仔细看的一个方案，因为它做了一个其他模型没做的事：**把推理行为模式和 token 预算上限拆成两套独立机制。**

Nemotron 也提供三种模式——regular（默认推理）、medium-effort（便宜推理）、reasoning-off（关闭推理）——推理时通过 chat template 选择，不是 system prompt。

但 medium-effort 的来历跟 DeepSeek 完全不同。它不是靠调 RLVR 惩罚系数做出来的，而是**在 SFT 阶段用 GPT-OSS-120B 的 medium-effort 输出当 teacher，生成训练样本** 。约 2.5% 的 RLVR prompt 在数学、STEM、代码任务上使用 medium-effort 设置，进一步强化这种行为。换句话说，Nemotron 是从别人的模型里"蒸馏"出了一个便宜推理模式。

真正独特的是第二个设计：**推理预算硬截断。**  研究人员在 SFT 阶段构造了一种特殊数据：取一条正常推理 trace，在随机 token 位置截断，保留原始最终答案。截断处插入 `</think>` 标签，但这部分被从 SFT loss 里 mask 掉——意思是"这里不是模型自己决定结束的，不要学这个截断决策本身"。模型学的是：**推理可以在任何位置被外部中止，中止后仍然要输出正确答案。**

结果是：推理时，外部 client 可以在任意 token 预算处插入 `</think>` 强制结束推理块。regular 和 medium-effort 两种模式都可以叠加任意外部预算——同一个模式宽松跑和收紧跑的区别是：需要的 token 少了，但推理质量由模式本身保证（或限制）。**档位决定推理行为，预算决定推理长度上限，两个参数正交。**

这种设计对于预算敏感的生产环境非常实用。你不需要为了省钱而降档（降档可能会降低推理质量），直接在当前档位上加预算上限就行了。

Nemotron 3 Ultra 的三种推理设置通过 chat template 控制。regular / medium-effort / reasoning-off 同时支持叠加外部预算截断。  


### 5.3 Kimi K2.5 的 Toggle：先做对，再做快

Kimi K2.5 提出了一个叫 Toggle 的方法，它解决了一个很具体的训练难题：**如果你一直在固定 budget 下训练模型，它会"过拟合"短答案——变快了，变便宜了，但失去了靠增加推理量解决难题的能力。**

这个问题的本质是：推理能力本身需要在长 trace 上训练，但你又要让它学会在某些场景下写短 trace。如果用固定 budget，两种能力互相冲突——短 budget 会侵蚀推理根基。

Toggle 的解法是**在 RL 训练时交替两个阶段，每隔固定步数切换：**

**预算阶段（budgeted）：**  正确答案被鼓励保持在特定 token 预算内。预算来自该题目历史上所有正确 rollout 的响应长度分布的一个分位数。不是拍脑袋定一个数，而是从数据里算出来的"这道题历史上对的那些答案大概多长"。

**无约束阶段（unconstrained）：**  恢复正常最大生成长度，让模型继续从长推理中学习。模型的推理能力上限在这个阶段保持不被侵蚀。

一个重要的约束条件：**预算只在模型对该题的准确率超过阈值后才激活。**  如果准确率不达标，不开启预算——先确保模型能稳定做对，再让它做得更短。这避免了模型还没学会解题就被迫缩短推理，导致"又短又错"的死循环。

实验效果：K2 Thinking 的生成 token 削减 25%~30%，benchmark 几乎不掉。而且这种"可快可慢"的能力从数学和代码 RL 任务迁移到了 GPQA 和 MMLU-Pro——不需要针对这些任务重新训练。

Kimi K2.5 的 Toggle 方法把推理 token 砍掉了约 25%-30%，benchmark 几乎不掉。图中的 "w/o Toggle" vs "w/ Toggle" 展示了效果。  


需要注意，Toggle 完全在训练阶段运行。训出来的 checkpoint 没有内置的"快/慢"选择器，推理时只提供一个二元的 thinking / instant 开关。后来的 Kimi K3 才提供了 low / high / max 三档——做法是分别训三个专家（每个覆盖通用 tasks、通用 agents、coding agents 三个领域，共 3×3=9 个专家），再通过多教师 on-policy distillation 合并成一个模型。K3 的推理控制用自然语言 `thinking-effort` 指令，细节在 K3 的技术报告里有更多展开（这篇文章发布后几天才放出，Raschka 原文有更新，我这里同步引用）。

### 5.4 Qwen3：开关的工业化实现

Qwen3 的贡献主要在"开关"机制的标准化。前面已经提过 Thinking Mode Fusion 的原理，这里补充几个工程细节。

Qwen3 的后训练管线有四步：

  1. **Long-CoT SFT** ：用长推理链的监督微调建立基础推理能力。
  2. **Reasoning RL** ：RLVR 强化推理能力。
  3. **Thinking Mode Fusion** ：混合 `/think` 和 `/no_think` 样本做 SFT，让模型学会两种行为。
  4. **General RL** ：强化指令跟随和格式遵循，确保模型在该推理的时候推理，该闭嘴的时候闭嘴。

推理时，硬开关靠 chat template 预填 `<think>` 或 `<think></think>` 实现。软开关靠 `/think` 和 `/no_think` 指令——软开关更灵活（模型可以根据问题难度自行判断是否需要推理），硬开关更可靠（不会自作主张）。

Qwen3 还支持一个外部推理预算——在请求的 token 阈值处，推理被停止，插入 `stop thinking` 指令，模型继续生成最终答案。报告里提到，这个截断行为没有被显式训练，是 Thinking Mode Fusion 后涌现出来的能力。这一点跟 Nemotron 形成了对比：Nemotron 显式构造了截断训练数据，Qwen3 没有，但两个模型都能在推理时被外部截断。这暗示了一个可能的规律：**一旦模型学会了  `<think>` 区域的起止概念，外部截断就是一个相对容易泛化的操作。**

### 5.5 GLM-5：把"开关"扩展为多行为模式

GLM-5 在 Qwen3 的基础上往前走了一步。它不满足于 on / off 的二元开关，而是定义了三种与推理相关的行为模式：

  * **Interleaved thinking（交错思考）：**  在每次回答和每次 tool call 之前都插入一个推理块。这让模型在调用工具前后都能思考——而不是想完一次就机械执行。
  * **Preserved thinking（保留思考）：**  在多轮对话中保留之前的推理块，让模型可以复用它。这解决了传统推理模型每轮都重新从零推理的问题。
  * **Turn-level thinking（按轮次开关）：**  每轮对话独立控制是否开启推理。这一轮可以推理，下一轮可以不推理，不需要全局设置。

这些行为在多任务 SFT 阶段通过更新的 chat template 引入，之后经过推理 RL、agent RL 和通用 RL 三轮强化，最后用 on-policy distillation 把不同阶段的 checkpoint 合并。

GLM-5 的设计方向说明一件事：**当 chat template 成为推理行为的控制面后，可以往里面塞的不只是"开不开"，还可以是"在哪开""开多久""要不要看历史"。**  Chat template 正在从一个简单的格式约定，变成一个行为控制协议。

### 5.6 Inkling：把标签换成连续值

Inkling 做了一个所有方案里最激进的改动：**不用 low / medium / high 这种离散标签，而用一个 0 到 1 的连续值。**

训练时，每个 rollout 的 system message 里指定一个 effort 值（如 0.2、0.8、0.99），同时根据这个值调整 RL 阶段的 token 长度惩罚系数 λ(e)。λ(e) 被设计为 e 的递减函数——e 越小，λ 越大，惩罚越重，推理越短。

Inkling 的大部分后训练来自 asynchronous RL，超过 30M rollout。一次相对较小的初始 SFT 之后，所有 effort conditioning 都在 RL 阶段完成。奖励函数的形式大致和前面路径一相同：R(e) = R_task − λ(e) × N_tokens，但 e 是连续值而不是离散标签。

推理时，用户给 `Thinking effort level: 0.8` 这样的 system message。从 Inkling 公布的 benchmark 数据看，这个值是有效的——effort 0.2 和 0.8 在 token 数上有显著差异，对应 benchmark 分数也有显著差异。但 effort 0.99 和 0.8 的分数差距已经很小，token 数却还在涨。

连续值的问题是用户侧的。0.7 和 0.8 有差别吗？什么任务用 0.3？离散标签虽然粗，但 low / medium / high 的语义直觉很清晰。Inkling 自己后来也在界面上把连续值映射回了更容易理解的选择器。从工程实践角度，连续值可能更适合被一个内部 router 消费，而不是直接暴露给用户。

## 06七套方案，一张表总结

把六份报告的核心工程决策放在同一张表里，差异会非常清楚：

模型| 档位粒度| 核心训练机制| 推理控制面| 最特殊的设计  
---|---|---|---|---  
**DeepSeek V4**|  3 档 (Non-think / Think High / Think Max)| 多专家 RLVR(各用不同 context + length penalty) → on-policy 蒸馏| system prompt + chat template| 唯一公开了 Think Max 特殊指令 + 对应训练配置的  
**Nemotron 3 Ultra**|  3 档 (off / medium-effort / regular)| SFT(用 GPT-OSS teacher) + RLVR(2.5% medium-effort)| chat template| **外部硬截断独立于模式** ，预算和档位正交  
**Kimi K2.5**|  2 档 (thinking / instant)| Toggle RL: 预算阶段与无约束阶段交替| chat template prefill| 准确率先过阈值才启预算，"先稳后快"  
**Kimi K3**|  3 档 (low / high / max)| 9 专家 RLVR(3领域×3档位) → 多教师蒸馏| system prompt| 三领域分别训档位专家，合并进单 checkpoint  
**Qwen3**|  2 档 + 外部预算截断| CoT SFT → Reasoning RL → Thinking Mode Fusion → General RL| chat template + 外部停止指令| 截断能力未显式训练即涌现  
**GLM-5**|  多行为模式 (非简单档位)| 多任务 SFT(交错/保留/按轮次) → RL → 蒸馏| chat template prefill| 跨轮次推理保留 + tool call 间插入推理  
**Inkling**|  连续值 0~1| 30M+ rollout 异步 RL(连续 effort 标签)| system message| 唯一使用连续值的方案，全 RL 阶段 conditioning  
  
附录：原文六份报告中公开的训练机制汇总对比。

六份开源模型报告中公开的训练机制和推理控制面的详细对比表。

这张表不是为了比较"谁更好"——不同模型的基座、训练数据、后训练算力、benchmark 和产品目标都不一样，不是同一组变量下的对照实验。表的价值在于看清楚：**相似的档位标签背后，管线可以完全不同。**  比如同样是"three modes"，DeepSeek V4 三个专家分别训，Nemotron 的 medium-effort 是用别人的模型蒸馏出来的——表面一样，选择路径不一样，对应的工程约束和迭代成本也不一样。

## 07看完六份报告后的三个判断

**判断一：档位是被训练管线编码的行为模式，system prompt 只是触发器。**

所有六个方案的共同点是：档位对应的行为在训练阶段就被决定了——用什么长度惩罚、什么 context window、什么 reward 函数——推理时的 system prompt 只是在不同"行为槽"之间切换。这就是为什么换一个没经过对应训练的模型，写同样的 system prompt 指令毫无用处。

从工程角度看，这意味着你在选档位时不是在选"模型聪明程度"，而是在选一种训练时就定好的**资源分配策略** 。每个档位代表了训练团队在长度、精度、成本之间做的一次 trade-off 决策。你拿到这个模型时，这个决策已经做完了。

**判断二：档位和预算在解耦，未来可能是两个独立 API 参数。**

Nemotron 和 Qwen3 展示了同一个方向：学出来的推理行为（档位选择）和外部施加的推理长度限制（预算）是两套独立机制。Nemotron 做了显式的截断训练，Qwen3 没用显式训练但也支持截断。

这个解耦如果成为标准，意味着未来的推理 API 可能提供两个独立参数——行为模式选择 + token 预算上限——而不是一个合并的"档位"。这对生产环境的价值很清楚：大多数时候你不需要降档来省钱，只需要在当前档位上加预算上限。代码 review 保持 high 模式但限制 2000 token，和切成 low 模式，效果可能完全不一样。

**判断三：自动档仍然很难，短期内需要自己写路由规则。**

GPT-5 做过 Auto 模式，效果不好，从界面上撤了。Raschka 的判断是：近期推理档位仍会是一个显式模型输入，但 Agent 外面的 harness 或一个内部 router 会越来越多地根据任务状态和剩余预算自动选档。

这个判断务实。自动档的前提是准确判断"这个任务需要多少推理"，而这件事本身就是一个很难的判断问题——它要求系统理解任务的隐含难度、评估当前上下文的质量、预测不同推理量能带来的精度增益。这三件事目前都没有可靠的通用解法。

但半自动是可行的。如果你在不同任务上反复手动调档位，可以把规则写下来：简单问答 → low，多步推理 → high，代码生成走 max。这比 Auto 模式便宜得多，比手动拨高效得多，而且出错时你知道为什么错。

## 08写在最后

最后落到工程实践上。

**第一，看模型先看它有没有公开档位训练细节。**  如果一份模型报告只说"我们提供了 low / medium / high 三档"但不讲怎么做出来的，那档位对你来说就是黑箱——你不知道 low 意味着模型被训练成"少写"还是"多写但被截断"，两种行为的失败模式完全不同。DeepSeek V4、Nemotron、Kimi、Qwen3、GLM-5、Inkling 这六份报告值得读，至少它们把配方交代了。

**第二，API 成本最敏感的场景，优先看支持硬截断的模型。**  Nemotron 和 Qwen3 让你不降档只加预算上限，这在生产环境里比降档更安全——推理质量不打折，成本可控。其他模型的档位本质上是行为的完整切换，降档可能改变答案质量而不只是减少 token。

**第三，写一个简单的档位路由。**  不需要做 Auto 模式的复杂度。三五个规则就够了。比如：判断问题类型 → 选档位；判断上下文长度 → 选预算上限。如果后续模型版本更新了档位行为，改规则比改系统 prompt 更快定位问题。

推理档位不是玄学。它是一组被训练管线编码进权重的行为模式，暴露给用户的方式恰好是一个下拉菜单。理解这个事实本身，就比大部分凭手感拨的人多了一层工程上的确定性。

> 参考：https://magazine.sebastianraschka.com/p/controlling-reasoning-effort-in-llms
