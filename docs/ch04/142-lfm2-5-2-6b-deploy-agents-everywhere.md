# LFM2.5-2.6B: Deploy Agents Everywhere

> 📊 Level ⭐⭐⭐ | 9.6KB

> **Background**：Liquid AI 于 2026-08-04 发布 LFM2.5-2.6B，定位端侧（on-device）Agentic 模型：小到可跑在手机上、CPU 上保持响应、能力足以支撑 Agentic 工作流（规划、工具调用、多步任务）。与同系列 [LFM2.5-230M](https://github.com/QianJinGuo/wiki-public/blob/main/entities/liquid-ai-lfm2-5-230m.md)（边缘小模型）和 [LFM2.5 Encoders](https://github.com/QianJinGuo/wiki-public/blob/main/entities/liquid-ai-lfm2-5-encoders-fast-long-context-cpu.md)（长上下文编码器）形成互补。

## 核心定位：端侧 Agent 的经济学转变

LFM2.5-2.6B 的核心论点：**移除 per-token 成本会改变开发者构建方式**。不依赖云 API 的本地 Agent 提供免费推理、低延迟和真实隐私；Agent 可以在本地硬件上大规模并行化，跑后台任务消耗数百万 tokens 而无边际成本——当 token 花费不再是约束时，Agent 可以全天候随处运行。

## 模型规格

- **参数量**：2.6B（Base + Post-trained 双形态，均已在 Hugging Face 发布）
- **预训练数据**：~34T tokens
- **词表扩展**：为支持非拉丁脚本，将词表翻倍至 128K——通过 in-place 扩展现有 tokenizer（与 LFM2.5-8B-A1B 同流程），而非从头重训
- **上下文**：mid-training 含专用 128K context-extension 阶段，支撑 Agentic 工作流的长输入

## 四阶段后训练管线

把 Base 模型变成 Agentic 模型的完整配方（这是该文最有价值的技术内容）：

1. **Supervised Fine-Tuning (SFT)**：两连段——先全领域广覆盖，再针对优先级技能（agentic 任务、推理、工具使用）定向塑形。SFT 数据混合规模约为 LFM2.5-8B-A1B 的 7 倍，agentic 任务（工具使用、web 搜索、软件工程、agent traces）加权更重。最终 SFT checkpoint 同时作为 student 模型和后续 specialist teachers 的初始化
2. **Teacher Specialization**：从共享 SFT checkpoint 出发，每个目标领域训练一个专家（SFT + verifiable-reward RL/RLVR）：指令遵循、数学、知识（含幻觉控制）、代码、工具使用、长上下文。专家独立深训，避免不相关目标的竞争更新
3. **Multi-Domain On-Policy Distillation (MOPD)**：用专家作 teacher 蒸馏进单一 student。与 off-policy 蒸馏不同，MOPD 让 student 在自己策略下 rollout，每个 prompt 路由到对应领域 teacher，以 token 级反馈监督。因 teacher 与 student 同源于一个 SFT checkpoint，反馈分布接近，训练稳定
4. **Agentic RL**：最后阶段让模型在真实 Agent 环境中运行——通过真实 agent harnesses 跑多轮 Agentic RL，任务覆盖研究、写作、代码、数据分析、文档管理、外部工具、多步工作流自动化。每次 rollout 在专用沙箱中运行，GRPO 优化 + outcome-based reward（LLM-as-judge rubric + 程序化检查 + 硬安全门）。**训练直接在 Hermes Agent、OpenClaw 等 harness 内进行**，让模型暴露于其工具、system prompts 和交互模式，跨 Agent 环境可靠工作

## 与同系列模型的关系

| 模型 | 定位 | 关键差异 |
|------|------|----------|
| [LFM2.5-230M](https://github.com/QianJinGuo/wiki-public/blob/main/entities/liquid-ai-lfm2-5-230m.md) | 最小边缘模型，19T tokens | 工具调用/数据提取，213 tok/s（S25 Ultra） |
| LFM2.5-2.6B | 端侧 Agentic 主力 | ~34T tokens、128K 词表、四阶段 Agentic 后训练 |
| LFM2.5-8B-A1B | 更大体量（A1B = 1B 激活） | MOPD/词表扩展流程的同源参考 |

## 深度分析

### 端侧 Agent 的经济学：从「按 token 计费」到「边际成本为零」

这套发布文最有价值的不是基准分数，而是一个结构性论断：云端 API Agent 的设计空间被 per-token 成本锚定，Agent 只能部署在高价值路径上；本地推理把边际成本压到零后，部署逻辑从「值不值得花钱跑」变成「硬件还剩多少余量」，后台任务、全天候常驻、大规模并行化都变得可行。 这与 [LFM2.5-230M](https://github.com/QianJinGuo/wiki-public/blob/main/entities/liquid-ai-lfm2-5-230m.md) 呼应：同厂商两档模型覆盖「最便宜边缘推理」与「端侧跑得动 Agent 工作流」两个价格点。速度支撑论点：M5 Max 220 tok/s、Ryzen AI Max+ 395 113 tok/s、内存低于 2.5GB、手机 30 tok/s。

### 四阶段后训练：为什么「共享 SFT checkpoint」是整条管线的枢纽

管线里有个容易被忽略的依赖设计：最终 SFT checkpoint 同时充当 student 的起点和所有 specialist teachers 的初始化。 Teacher Specialization 从同一 checkpoint 分叉出指令遵循、数学、知识（含幻觉控制）、代码、工具使用、长上下文六类专家，各自用重加权数据 + RLVR 深训，避免多目标互相竞争。 这个同源性直接决定 MOPD 的可行性：student 在自己策略下 rollout，每个 prompt 按域路由到对应 teacher 获得 token 级反馈；teacher 与 student 分布足够接近，反馈才能「引导而不破坏」训练。 整套管线是先分叉、再收敛：分叉换域内优化深度，同源换分布兼容；对比 [模型蒸馏](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/model-distillation-compression.md) 的常规 off-policy 路线，on-policy 的收益是学生不离开自身分布就能吸收专家能力。

### Agentic 能力来源：环境即训练数据

端侧小模型「能力够用」的真正来源不是参数量，而是直接在真实 agent harnesses（Hermes Agent、OpenClaw 等）内部做多轮 Agentic RL，暴露于真实工具集、system prompts 和交互模式。 每次 rollout 在独立沙箱运行，GRPO + outcome-based reward（LLM-as-judge rubric + 程序化检查 + 硬安全门）优化；Harness Proxy 则把 harness 当黑盒零修改接入，透明捕获 token 级轨迹用于校验训练样本。 这印证了 Harness Engineering 的核心命题——harness 的接口形态本身就是可训练的环境。基准也支持：最小的模型在几乎所有指令遵循与工具使用基准上领先，唯一明确落后的是 coding。

## 实践启示

1. **用「边际成本为零」重审 Agent 产品设计**：因 API 账单而砍掉的后台自动化（监控、批量整理、常驻巡检）在端侧都值得重新评估——约束从预算变成设备余量。
2. **多领域能力融合优先「分叉专家再蒸馏」**：共享 checkpoint 训练专家、再 on-policy 蒸馏回收，比单模型叠加冲突目标更稳；teacher/student 同源是隐性前提。
3. **给 Agent 模型做 RL，直接在目标 harness 里跑**：与其在自造抽象环境中训练再迁移，不如把真实 harness（Hermes/OpenClaw 类）当黑盒接入训练循环——工具集、system prompt、交互模式的暴露本身就是能力来源。
4. **端侧部署用实测吞吐说话**：2.5GB 内存、CPU 113–220 tok/s、手机 30 tok/s 说明「能不能跑 Agent」要按完整链路测；把解码速度和内存上限写进选型硬约束。
5. **词表扩展可 in-place 而非重训**：非拉丁脚本支持通过扩展现有 tokenizer 到 128K 实现，配合 mid-training 的 context-extension 阶段——多语言/长上下文需求不必推倒重来。
6. **小模型 Agent 有明确适用边界**：高吞吐、重隐私的 edge 场景选它；coding-heavy 或最复杂的 agentic 任务留给更大模型。

## 工程含义

- **Agentic RL 数据路线**：在真实 harness（Hermes/OpenClaw）内训练是「让模型适应 Agent 环境」的务实路径，与 Harness Engineering 领域关注点一致——环境即训练数据
- **on-policy 蒸馏的价值**：MOPD 解决 off-policy 蒸馏的分布漂移问题，teacher/student 同源是稳定性关键——对多领域能力融合有参考价值
- **端侧 Agent 的成本论**：本地推理免除 per-token 成本 → Agent 可并行常驻，是 edge Agent 产品设计的经济学依据

→ [原文存档](https://www.liquid.ai/blog/lfm2-5-2-6b)

---

