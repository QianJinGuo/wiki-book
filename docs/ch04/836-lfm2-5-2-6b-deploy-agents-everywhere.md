# LFM2.5-2.6B: Deploy Agents Everywhere

## Ch04.836 LFM2.5-2.6B: Deploy Agents Everywhere

> 📊 Level ⭐⭐⭐ | 4.9KB | `entities/liquid-ai-lfm2-5-2-6b-agentic-on-device.md`

# LFM2.5-2.6B: Deploy Agents Everywhere

> **Background**：Liquid AI 于 2026-08-04 发布 LFM2.5-2.6B，定位端侧（on-device）Agentic 模型：小到可跑在手机上、CPU 上保持响应、能力足以支撑 Agentic 工作流（规划、工具调用、多步任务）。与同系列 [LFM2.5-230M](../ch05/109-ai.html)（边缘小模型）和 [LFM2.5 Encoders](../ch05/109-ai.html)（长上下文编码器）形成互补。

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
4. **Agentic RL**：最后阶段让模型在真实 Agent 环境中运行——通过真实 agent harnesses 跑多轮 Agentic RL，任务覆盖研究、写作、代码、数据分析、文档管理、外部工具、多步工作流自动化。每次 rollout 在专用沙箱中运行，GRPO 优化 + outcome-based reward（LLM-as-judge rubric + 程序化检查 + 硬安全门）。**训练直接在 [Hermes Agent](../ch05/065-harness-engineering.html)、OpenClaw 等 harness 内进行**，让模型暴露于其工具、system prompts 和交互模式，跨 Agent 环境可靠工作

## 与同系列模型的关系

| 模型 | 定位 | 关键差异 |
|------|------|----------|
| [LFM2.5-230M](../ch05/109-ai.html) | 最小边缘模型，19T tokens | 工具调用/数据提取，213 tok/s（S25 Ultra） |
| LFM2.5-2.6B | 端侧 Agentic 主力 | ~34T tokens、128K 词表、四阶段 Agentic 后训练 |
| LFM2.5-8B-A1B | 更大体量（A1B = 1B 激活） | MOPD/词表扩展流程的同源参考 |

## 工程含义

- **Agentic RL 数据路线**：在真实 harness（Hermes/OpenClaw）内训练是「让模型适应 Agent 环境」的务实路径，与 [Harness Engineering](../ch05/065-harness-engineering.html) 领域关注点一致——环境即训练数据
- **on-policy 蒸馏的价值**：MOPD 解决 off-policy 蒸馏的分布漂移问题，teacher/student 同源是稳定性关键——对多领域能力融合有参考价值
- **端侧 Agent 的成本论**：本地推理免除 per-token 成本 → Agent 可并行常驻，是 edge Agent 产品设计的经济学依据

→ [原文存档](https://github.com/QianJinGuo/wiki-book/tree/main/docs/raw/articles/liquid-ai-lfm2-5-2-6b-agentic-on-device.md)

---

