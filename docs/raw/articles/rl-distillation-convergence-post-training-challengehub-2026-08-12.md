---
title: "RL 和蒸馏正在合流：2026 大模型后训练的新范式"
created: 2026-08-12
updated: 2026-08-12
type: raw
tags: [post-training, rl, distillation, grpo, rlvr, on-policy-distillation, self-distillation, dapo, deepseek-v4, mimo, glm-5, nemotron, survey]
source_url: "https://mp.weixin.qq.com/s/qyXX8LoAUYn4509M6_61Bw"
sha256: "18639b73c632c5308dbbdcfeb4ccabe525f6cc0df8408596b648d3999cea06db"
source_author: "ChallengeHub（转载，原文 Sergio Paniego 两篇 HF 博客合并：agentic-rl-2026）"
ingested: 2026-08-12
vxc: 30
score_note: "v=6 c=5 (转载号综述档，同 gurubar survey tier) — 两阶段合流横向框架库内无同款（非 DUPLICATE），但细节大量已被 xopd/llm-post-training-full-guide 覆盖，30<42 不达 SUPP → Raw only"
---

# RL 和蒸馏正在合流：2026 大模型后训练的新范式

> ChallengeHub 转载 Sergio Paniego 两篇 HF 博客合并稿（原文：huggingface.co/blog/sergiopaniego/agentic-rl-2026）。核心论点：**RL 负责用结果奖励把行为找出来，蒸馏负责用密集信号把它搬进最终那一个模型里**——2026 年各家前沿实验室的后训练流水线里，两者是前后相接的两个阶段，不是二选一。

## 第一部分：结果奖励这条线

### 从偏好奖励到可验证结果

- **RLHF（InstructGPT）**：先训奖励模型学人类偏好，再用 PPO 采样新回答训练
- **DPO**：砍掉采样循环，直接从固定偏好对学习
- **o1（2024-09）**：把 RL 顶到推理正中央——大规模 RL 教会模型用思维链高效思考，数据效率高；对算法本身只字未提
- **Tulu 3（AI2）**：贡献了"可验证奖励强化学习（RLVR）"——奖励不是人类偏好模型，而是**可真正跑起来的检查**
- **DeepSeek-R1（2025-01）**：纯 RL 激发大模型推理能力（aha moment）；用 GRPO（源自 DeepSeekMath）
- **Llama 4（Meta）**：在线 RL 作流水线核心——训一轮模型后持续筛选提示词，只留中等到困难难度

### 可验证奖励的工业实践

- **Qwen3**：Reasoning RL 阶段在精选"查询—验证器对"上跑 GRPO（每提示词自带检查）
- **小米 MiMo-7B**：13 万道可验证数学+编程题数据集 + **测试难度驱动的代码奖励**缓解稀疏奖励（让每次尝试携带的信息量不只是"过/不过"一个比特）
- **Mistral Magistral**：只做解可被验证的问题（数学答案须数值/表达式，代码题须配测试）
- **Gemma 3**：RL 微调阶段列代码执行反馈 + 解数学题真值奖励
- **Kimi K2**：自我批评反馈通用 RL 框架，但 critic 被拴在可验证侧——用可验证奖励提示词生成的 on-policy rollout 持续更新 critic（把 RLVR 客观性能信号蒸馏进评估模型）
- **GLM-5**：混合奖励体系——规则奖励函数 + 结果奖励模型（ORM）+ 生成式奖励模型（GRM）三类信号

> 一句话总结：**只要你能跑起来一段检查，你就有了一个奖励函数。**

### GRPO 已经长成一个家族

每家都改了点东西（GRPO 是起点，没有原样照搬）：

- **DAPO（字节）**：Clip-Higher（提升系统多样性、避免熵坍塌）+ 动态采样 + token 级策略梯度损失 + 超长奖励塑形
- **Dr. GRPO**：修 GRPO 优化偏差——人为拉长回复（尤其错误输出）
- **GSPO（Qwen）**：修正从 token 级挪到**序列级**（重要性比率在序列似然上定义）
- **CISPO（MiniMax）**：裁剪重要性采样权重而非 token 更新
- **Magistral**：组建训练批次时过滤所有优势为零的组（零优势组教不了模型任何东西；对应 Trackio 面板 frac_reward_zero_std 指标）

**TRL 库实证**：截至 2026-08，GRPOTrainer 的 loss_type 默认值已是 `"dapo"` 而非原版 GRPO；`"grpo"` 选项 docstring 注明不推荐（存在长度偏差——偏好正优势的较短补全与负优势的较长补全）；GSPO 通过 `importance_sampling_level="sequence"` 提供。

### 奖励正在变成一个"环境"

最新报告里模型开始动手（打开文件、执行命令、调用工具），奖励最后才到来：

- **LFM2.5-2.6B（Liquid AI）**：每次 rollout 跑在专属沙箱（自有运行时）；优化用 GRPO，奖励基于结果 = LLM-as-a-judge 评分 + 程序化检查 + 硬性安全闸门
- **Cursor Composer**：通过在多种开发环境中 RL，针对软件工程优化
- **Kimi K3 / GLM-5 / Nemotron 3 Ultra / MiniMax**：同一思路的不同版本

## 第二部分：蒸馏这条线

三个阶段的划分（off-policy / on-policy / 自蒸馏）几乎一一对应各家真实做法。

### 老用法：大教师带小学生（off-policy）

- **Gemma 3**：后训练依赖改进版知识蒸馏，教师是大 IT（instruction-tuned）模型；Gemma 4 类似
- **DeepSeek-R1-Distill**：R1 推理轨迹通过 SFT 灌进紧凑 Qwen/Llama 学生（硬标签黑盒口味）
- off-policy 两种口味：匹配教师下一 token 分布（软标签白盒）vs 在教师生成文本上训（硬标签黑盒）

### 新用法：把一堆 RL 专家合并成一个模型（on-policy 蒸馏）

问题：一个 RL 阶段练出的技能往往在下个阶段被练废。绕道：**每个领域单独训一个 RL 专家（数学/代码/Agent），在学生自己生成的 rollout 中把这些专家一起蒸馏进去**（学生负责写、教师给每个 token 打分）。

关键细节：**教师通常不是更大的模型——是同一底座的不同 checkpoint，尺寸一样，只在某领域被 RL 多推一段。让它们够格当教师的是专精，不是规模。**

- **DeepSeek-V4**：描述最干净——每领域先 SFT 再 GRPO 出专家，之后 on-policy 蒸馏出统一模型（学生优化反向 KL 损失）
- **MiMo-V2-Flash**：多教师形态命名者 **MOPD**（Multi-Teacher On-Policy Distillation），领域教师提供密集 token 级信号
- **GLM-5**：把同一机制用在训练阶段之间（RL 阶段后最后一轮蒸馏找回被磨损的能力，教师是同血脉更早 checkpoint）
- **Nemotron 3 Ultra**：十多个专精教师（各自领域流水线），一起在学生 rollout 上给密集 token 级指导
- **Qwen3**：经典方向（大教师带小学生，学生 logits 对齐），成本约 RL 的 1/10 GPU 时且效果更好

> 共同理由：教师可对每个 token 反馈，RL 奖励一整次尝试才给一个数字——蒸馏在"学会具体行为"上收敛快得多。Thinking Machines 在远低于 RL 的算力下打平 RL 基线。

### 第三种：当教师就是你自己（自蒸馏）

- **Cursor Composer 2.5**：上下文塞入期望行为描述 → 带提示的模型成为不带提示的同一模型的教师（逐 token KL 拉近，推理时无需提示）——"特权教师"（Sasha Rush 讲得很细）
- **Thinking Machines**：新领域微调后从微调前的 checkpoint 蒸馏回来——恢复被微调抹掉的行为同时保住新知识（"更早的教师"，持续学习解法，同 GLM-5 解决同一问题换到个人尺度）

> 教师不需要更大，只需要在当下的上下文里更强。有时候那个人就是模型自己。

## 第三部分：两条线在哪汇合

SFT/RL/蒸馏界限变糊，背后清晰规律：**先用 RL 把某项能力做出来，再用蒸馏把它搬进最终那一个模型里。**

- **DeepSeek-V4**：GRPO 训领域专家（定制奖励模型引导）→ on-policy 蒸馏合并（反向 KL）
- **MiMo-V2-Flash**：RL 归在教师头上（领域专精教师经大规模 RL 训练）而非学生自己
- **LFM2.5-2.6B**：小尺寸同款两步走——每领域教师先 RLVR，学生 on-policy 吸收，然后才到自己 agentic RL 阶段

## 规律总表

| 规律 | 报告里的例子 | 源流 |
|---|---|---|
| 从偏好奖励走到可验证结果 | InstructGPT、o1、Tulu 3、DeepSeek-R1、Llama 4 | 可验证奖励对结果跑一段检查 |
| 可验证奖励 | Qwen3、MiMo-7B、Gemma 3、Magistral、Seed1.5-Thinking | 检查 + 模型裁判 |
| 混合奖励 | Kimi K2、GLM-5、LFM2.5-2.6B | 检查 + 模型裁判 |
| 魔改 GRPO | DAPO、Dr. GRPO、GSPO、CISPO、Magistral | 修稳定性、长度和采样毛病 |
| 环境里 Agentic RL | Kimi K3、GLM-5、Nemotron 3 Ultra、MiniMax（Forge）、Cursor、LFM2.5-2.6B | 工具和多步交互训练 |
| 大教师小学生 | Gemma 3、Gemma 4、DeepSeek-R1-Distill、Qwen3 | 大模型压进小模型 |
| 多教师 on-policy 蒸馏 | DeepSeek-V4、MiMo-V2-Flash（MOPD）、GLM-5、Nemotron 3 Ultra | 各领域 RL 专家并成一个模型 |
| 自蒸馏 | Cursor Composer 2.5、Thinking Machines | 教师就是模型自己（更强上下文/更早 checkpoint） |
| 先 RL 再蒸馏 | DeepSeek-V4、MiMo-V2-Flash、LFM2.5-2.6B | 先做强专家再合进一个模型 |

## 备注

- 0.6B 小规模实验现象几乎都能在这些报告找到对应（如 Trackio 面板曲线向好但编程能力下滑 + 熵坍塌——DAPO Clip-Higher 要躲开的；Dr. GRPO 修训练目标长度偏差 vs 那次翻车是奖励在给"多产出"直接付钱，成因和解法两码事）
- 局限声明：只针对公开训练描述综述（截至 2026-08），不代表实验室内部全部做法——Gemma 4 因报告没写后训练被排除，Anthropic/Cohere 未查，OpenAI 仅 o1 博客露面；Nathan Lambert 和 Finbarr Timbers 在 Interconnects 有另一角度评述
- 与库内互补：xopd-on-policy-distillation（学术论文六维分类全景，本文为工业报告横向视角）、llm-post-training-full-guide（方法演进全景）、liquid-ai-lfm2-5-2-6b（LFM2.5 四阶段后训练实例）
