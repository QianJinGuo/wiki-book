# Mellum 2 (JetBrains open-weight 12B MoE code LLM)

## Ch01.551 Mellum 2 (JetBrains open-weight 12B MoE code LLM)

> 📊 Level ⭐⭐ | 8.1KB | `entities/mellum-2-jetbrains-open-12b-moe-code-model.md`

# Mellum 2 (JetBrains open-weight 12B MoE code LLM)

> **Background**: JetBrains 在 2026-05-29 发布 Mellum 2 技术报告（arXiv:2605.31268），是其代码补全 4B dense Mellum 的继任者。12B 总量 / 2.5B active 的 MoE 架构，64 experts / 8 active + Sliding Window + Multi-Token Prediction 双用（pretrain 辅助目标 + speculative decoding draft），FP8 + Muon + 3-phase 课程 10.6T tokens 训练，128K YaRN 扩展，SFT + RLVR 后训练出 Instruct + Thinking 两版本。Apache 2.0 全套权重释放。

## 核心架构特征

| 维度 | 选择 | 含义 |
|------|------|------|
| 总量/激活 | 12B / 2.5B | 64 experts × 8 active per token |
| Attention | GQA 4 KV heads + Sliding Window (3/4 layers) | 长上下文友好 + 推理 KV cache 节省 |
| MTP head | 单一 Multi-Token Prediction head | 同时用作 pretrain 辅助 loss + speculative decoding draft model |
| Pre-training | 10.6T tokens，3-phase 课程 (web -> code+math) | Muon + FP8 + Warmup-Hold-Decay |
| Context | 128K via layer-selective YaRN | 不全层 RoPE 缩放，按层选择性应用 |
| Post-training | SFT -> RLVR | 出 Instruct + Thinking 两 checkpoint |

## 三个独有贡献

1. **MTP head 一体两用** — 单一 Multi-Token Prediction head 同时承担预训练 auxiliary objective 和推理阶段 speculative decoding 的 draft model。这是把训练目标和推理加速器合并的工程化设计，避免单独 draft model 的训练/维护成本。
2. **设计约束驱动消融** — "在 commodity GPU 上 inference efficiency" 作为 ablation 硬约束，验证每个架构选择。不是性能优先而是 **部署成本优先** 的设计哲学。
3. **Thinking + Instruct 双 checkpoint** — 同一 base 出两版（直接回答 vs 显式 reasoning trace 后回答），让用户在 latency/cost/能力之间做 trade-off 而不必切换 vendor。

## 与现有 code-LLM entity 的差异化

- **vs Qwen-Coder / DeepSeek-Coder 系列** — Mellum 2 强在 Apache 2.0 + JetBrains IDE 集成生态，弱在通用 reasoning benchmark
- **vs Codestral** — Mistral 的 22B dense，Mellum 2 是 MoE 路线 + 显式 speculative decoding 设计
- **vs StarCoder 2** — BigCode 主导的 15B dense 社区驱动，Mellum 2 是单 vendor 主导 + MoE 工程化
- **vs OpenCoder / Yi-Coder** — 中小规模（1.5B-9B），Mellum 2 的 2.5B active 介于中间偏小但 MTP 设计让推理吞吐可期

## 评测覆盖

- **Code generation**: 4B-14B open-weight 范围内对标有竞争力
- **Math/Reasoning**: 与同档位 base 比
- **Tool use / Function calling**: agentic coding 关键能力
- **Knowledge / Safety**: 安全 bench 与同类对齐
- **核心卖点**: 12B 总量 + 2.5B dense 等效计算成本 + 128K context

## 知识库定位

- 属"开源代码 LLM 工程化" 主题
- 与 2026-05 月多个 MoE code model 趋势（DeepSeek-V3 / Qwen3-MoE / Codestral 系列）形成 **Apache 2.0 + JetBrains IDE 集成** 的差异化生态位
- 对 harness / agent / tool-use 场景：MTP 双用是值得注意的 inference trick
- 对 post-training 工程：RLVR 两阶段（先 SFT 再 RLVR）是当前 open-weight 主流

## 深度分析

1. **MTP head 一体两用是训练-推理协同设计的典范** — 单一 Multi-Token Prediction head 同时服务预训练 auxiliary objective 和 speculative decoding draft model，避免了独立 draft model 的训练/维护成本。 这与 [Deepseek Moe Parallel Strategy](ch01/1196-deepseek.html) 中 DeepSeek 对 MoE 通信层面的深度定制思路一致——都是通过工程化设计最大化已有资源的利用率，而非堆叠额外算力。

2. **设计哲学从"性能优先"转向"部署成本优先"** — 技术报告明确以"inference efficiency on commodity GPUs"作为 ablation 硬约束，验证每个架构选择 。这代表一种务实的产品化思维：不在学术界刷榜benchmark，而在成本敏感的真实部署场景中寻找最优解。对比国内部分模型"性能优先"的设计哲学，Mellum 2 的路线更接近 DeepSeek 的工业导向。

3. **Sliding Window Attention 按层选择性应用是长上下文的工程折中** — 三/四层应用 Sliding Window 而非全局应用，叠加 layer-selective YaRN 128K 扩展，兼顾了长上下文能力与 KV cache 节省 。这类按层差异化设计正在成为长上下文模型的标准范式，如 GQA 本身也是一种按 KV head 维度的差异化配置。

4. **Thinking + Instruct 双 checkpoint 暴露了 RLVR 后训练的推理开销问题** — Instruct 版本直接回答，Thinking 版本显式输出 reasoning trace 后再回答 。这意味着 Thinking 模式需要额外算力生成完整推理链，latency/cost 代价显著。用户可自行选择体现了对推理开销的诚实态度，而非强迫用户接受"统一体验"。

## 实践启示

1. **代码 LLM 项目优先评估"活跃参数成本"而非"总量参数"** — 12B 总量 / 2.5B active 意味着 per-token 计算成本与 2.5B dense 模型相当，但总参数量更大可能带来 KV cache 容量优势。在做代码模型选型时，active parameter 才是实际推理成本的精确度量。

2. **设计 MoE 代码模型时将 speculative decoding draft 纳入训练目标联合设计** — MTP head 一体两用证明，把 draft model 的训练目标合并到主模型的 auxiliary objective 中是可行的。这可以省去独立训练 draft model 的成本，适合资源有限的团队参考。

3. **后训练阶段优先 SFT 再 RLVR 的两阶段流程** — Mellum 2 的 post-training 路线（Supervised Fine-Tuning → RLVR）是当前 open-weight 主流范式 。对于做代码模型 post-training 的团队，先 SFT 建立基础能力再 RLVR 增强的流程风险较低。

4. **长上下文代码模型优先考虑层选择性 RoPE 缩放而非全局缩放** — layer-selective YaRN 通过不全层应用 RoPE 缩放避免所有层的质量损失 。对于需要 100K+ 上下文的应用（如代码库分析），按层选择性扩展比全局扩展的精度损失更小。

5. **开源代码模型差异化竞争聚焦"部署成本+许可证+IDE 集成"三角** — Mellum 2 选择 Apache 2.0 + JetBrains IDE 集成生态位，而非在 benchmark 上硬刚。中小团队如果无法在性能上超越头部，可以借鉴此思路，通过许可证友好、工具链集成、或特定场景优化建立自己的 niche。

## 来源

- [arXiv:2605.31268](https://arxiv.org/abs/2605.31268) — 原始技术报告
- → [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/mellum-2-jetbrains-open-12b-moe-code-model.md)

---

