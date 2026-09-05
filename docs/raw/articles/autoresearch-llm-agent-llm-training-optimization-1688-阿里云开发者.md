---
title: "AutoResearch-LLM：让 Agent 接手 LLM 训练优化"
source_url: "https://mp.weixin.qq.com/s/9qEgOV9FGk6u9_9zMLSI6A"
source: "阿里云开发者"
author: "吉梦林"
ingested: 2026-07-06
sha256: 2ca318b632b02ec8056303c645d63e3e5af6a0f81cef9c12778f942f1ba89dfa
---

**阿里妹导读**

本文是一份 LLM 微调 AutoResearch 落地实战。作者把过去几个月在电商场景（Query 改写 / 同款判定 / 重排打分）上做 Qwen3 微调时的完整流水线沉淀成一个由 Agent 驱动的三阶段框架：场景诊断 → 方案设计 → 自动化实验，同时把踩过的坑（PyTorch 2.6 vs DeepSpeed、Qwen3 thinking mode 让 BLEU 掉到个位数、多队列 OSS endpoint 差异）一并写成 SKILL.md 交给 Agent 执行。

文章适合关注 AI Coding、Agent for ML、LLM 微调工程化的同学阅读。文中提到的部分平台/工具（如星云、TuningFactory、TAO/Pailitao-AutoResearch）为公司内部命名，思路和方法本身与平台无关，读者可类比到 PAI、SageMaker、Slurm 等外部环境。（文章内容基于作者个人技术实践与独立思考，旨在分享经验，仅代表个人观点。）

**前言**

两个月前写完《多模态检索 TBStars_VL_Emb 指令遵循微调》文章之后，结尾留了一句话：可构建完整的 "请求 → 召回 → 曝光/点击/成交 → 样本反馈 → 模型训练 → 线上服务 → 请求" 优化迭代闭环。当时只是有个朦胧的想法——"如果训练这一环也能自动化，整个闭环就能转起来"。但真正落地谁来推动？怎么落地？没想清楚。

Karpathy 把 AutoResearch 这个名字带火（他的思路是：让 Agent 按照一份 SKILL 文件驱动的实验清单，自主完成从假设到验证的循环），紧接着又陆续读到主搜团队的 TAO-AutoResearch 和拍立淘团队的 Pailitao-AutoResearch，发现 "Agent 接管训练优化迭代" 这件事已经被这两份工作在工业级跑通了——当时留的那句话，已经有人替我做完了一半。

但这两份工作都和它们所在的业务、训练平台耦合比较深。对于 1688 这边在星云平台上训 LLM 的同学，还需要一套接地气的版本：底层换成团队里大量在用的 TuningFactory——它是内部对开源 LLaMA-Factory 的 Fork，把 ODPS 数据源、内部存储、多队列适配等都做了封装。训练平台换成星云（内部通用训练平台，支持多种 GPU 队列），全 API 拉日志，不用开浏览器。把过去几个月在数据接入 / 镜像 / 分布式训练上踩过的坑全部沉淀进 SKILL.md。

本文 AutoResearch-LLM：章节 1 讲来由和定位，章节 2 是流水线设计，章节 3 是工程实现，章节 4 是踩坑实录，章节 5 是和已有工作的横向对比。

**1. 背景**

**1.1 缘起**

两个月前那篇 TBStars 文章里画了一张闭环图：请求 → 召回 → 曝光/点击/成交 → 样本反馈 → 模型训练 → 线上服务 → 请求。数据回流、特征生成、上线发布这几环 1688 都有相对成熟的工程基建。但模型训练这一环始终是手工活：算法同学盯着 eval_loss、改 LR、重提任务、看日志、再改 LR，一天下来真正的"研究时间"很少。

CV 分类领域作者之前做过一版 auto_research_cv_cls_demo（下文简称"前作 CV demo"），在 CIFAR-10 上跑通了 "Agent 按 SKILL 跑实验" 的小闭环，最终拿到 +1.22% 的提升。不过 CV 分类还是太简单：单文件训练入口、本地数据集、单机训练。要把这套思路搬到 1688 的 LLM 微调场景，要解决的事情多得多：

| 维度 | CV demo | LLM 实战 |
|------|---------|----------|
| 训练框架 | 手写 main.py | TuningFactory（LLaMA-Factory 的内部 Fork） |
| 数据 | CIFAR-10 本地 tar | ODPS 表（百万行起步） |
| 模型 | ResNet18~50 | Qwen3-1.7B ~ 35B-A3B（含 MoE） |
| 并行 | 单卡 | DeepSpeed ZeRO-2/3 + Megatron Turbo |
| 训练时长 | 30~60 分钟 | 1~24 小时 |
| 评估 | acc 直接打出来 | 还要再起一轮 generate + BLEU/ROUGE |
| 平台 | - | 星云 |

**1.2 参考的两份工作**

写这个项目之前认真读了两份公司内部同学做过的 AutoResearch 落地：

- **TAO-AutoResearch**：4 个专职子 Agent（分析 / 训练 / 评测 / 压测）+ Git Worktree 实验隔离 + 三平台可插拔后端，跑了 20 轮迭代，hitrate@20 +3.05%；功能最完整，工程化程度也最高
- **Pailitao-AutoResearch**：三阶段流水线（理解分析 / 改进方案 / 实验验证）+ Git 分支隔离，附带一个最小可跑 demo 仓库；门槛低，适合作为新人理解 AutoResearch 思想的入口

auto_research_llm 的演化路径：先从 Pailitao demo 学到三阶段骨架 → 在 CIFAR-10 上做了一版前作 CV demo（CV 分类验证可行）→ 这次再把同一套三阶段、单 Skill、易上手的结构搬到 LLM 微调上，针对 1688 场景做了几处升级。

四者的相对位置大致是：Pailitao demo（最简骨架）→ 前作 CV demo（CV 验证可行）→ auto_research_llm（1688 LLM 接地气版）→ TAO-AutoResearch（多 Agent + 多平台）

**1.3 目前做到什么程度**

已端到端验证：SFT 全参 / SFT LoRA / SFT LoRA MoE / DPO LoRA / 离线数据蒸馏（大模型生成 → SFT）。配置就绪未验证：在线 KD（TuningFactory --stage distill）/ RL（GRPO，基于 ROLL）。场景覆盖 1688 电商 Query 改写 / 同款判定 / 重排打分。基座 Qwen3 系列（1.7B / 8B / 32B）+ Qwen3.6-35B-A3B（MoE）。数据 ODPS（主）+ OSS JSON（小数据备选）。分布式 DeepSpeed ZeRO-2/3 / Megatron Turbo + EP（MoE）。

**仓库结构：**

```
auto_research_llm/
├── SKILL.md ← Agent 主入口（Pipeline / 参数 / Debug 全在这）
├── submit.sh / kill.sh ← 任务提交与终止
├── user_info.json ← 个人凭证（已 gitignore）
├── configs/ ← 训练/推理配置（一文件一方式）
│   ├── sft_lora.sh 单卡 LoRA
│   ├── sft_lora_multi.sh 多卡 LoRA + DeepSpeed
│   ├── sft_full.sh 全参 + DeepSpeed
│   ├── sft_lora_moe.sh MoE + Megatron Turbo
│   ├── distill.sh KD Loss 蒸馏
│   ├── dpo_lora.sh DPO
│   ├── rl_roll.sh GRPO（基于 ROLL）
│   ├── infer.sh 单独推理
│   ├── ds_zero2.json / ds_zero3.json
│   └── cluster.json / cluster_2gpu.json / cluster_multigpu.json
├── scripts/
│   ├── sync_to_tuning_factory.sh submodule 实验分支自动 push
│   ├── prepare_distill_data.py 蒸馏数据生成
│   └── convert_to_hf.sh ckpt 转 HF 格式
├── scenarios/
│   ├── query_rewrite/{README,odps_ddl.sql,sample_data.json,eval_metrics.py}
│   ├── same_product/...
│   └── reranking/...
├── TuningFactory/ ← submodule（分支 openlm）
├── experiment_logs/ ← 自动下载的训练完整日志
└── experiment_results.csv ← 实验记录入口（自动追加）
```

**2. 流水线设计**

整体沿用 TAO / Pailitao 的三阶段写法：

**阶段 1：场景理解与基线分析** — 不上来就调参，先做体检。按七个维度把当前任务过一遍：基座模型、数据质量、数据规模、Prompt 模板、训练方式选型、Eval 配置、Baseline 复盘。产出 analysis_report.md。

**阶段 2：实验方案设计** — 把"我能做什么"写成清单，把"应该先做什么"写成优先级。一级参数：learning_rate、lora_rank/alpha、lora_target、num_train_epochs、Prompt 模板、cutoff_len。同时搭配 15+ 技术候选库。产出 improve_guide.md。

**阶段 3：自动化实验验证** — 单变量探索 → 正交组合 → 数据维度兜底。每个实验：生成 config → push 实验分支 → submit → 监控 → 评估 → 入 csv。产出 experiment_results.csv + final_report.md。

**3. 工程实现要点**

数据接入：ODPS（MaxCompute）表。TuningFactory 的字段映射通过 --prompt、--query、--response 三个参数。

训练配置脚本：每种训练方式对应一个 configs/*.sh 文件，头部是统一的"输入区"（MODEL_NAME、SCENARIO、EXP_NAME、ODPS 数据源、训练超参），改顶部十几行变量即可起新实验。

自动评估：TuningFactory 的 Trainer 自带 --predict_with_generate=True，训完直接打 BLEU/ROUGE，省掉一整轮推理脚本。注意关 --enable_thinking=False（否则 Qwen3 thinking mode 让 BLEU 掉到个位数）。

effective_batch 经验：SFT 7B 64~128，SFT 35B+ 32~64，DPO/SimPO 32~64，RL GRPO 8~16。调参顺序：per_device_train_batch_size 拉到显存极限 → gradient_accumulation_steps 凑 eff_batch → LR 按 √eff_batch 微调。

平台问题兜底：平台级问题外挂给星云官方 support skill，项目 SKILL.md 只维护项目专属的 Debug 表。

**4. 踩坑实录**

**4.1 PyTorch 2.6 + DeepSpeed ZeRO + load_best 撞在一起**

错误：WeightsUnpickler error: Unsupported global GLOBAL deepspeed.runtime.fp16.loss_scaler.LossScaler

根因：PyTorch 2.6 默认 weights_only=True，DeepSpeed 序列化的 LossScaler 对象不在白名单里。触发点有两个：Trainer auto-resume（output_dir 里有 checkpoint）和训练结束 _load_best_model()。

修复：禁用 --overwrite_output_dir=True，不可用 --load_best_model_at_end=True。全参再加 --save_only_model=True。需要 best ckpt 时按 trainer_state.json 的 best_model_checkpoint 字段手动定位。

**4.2 predict BLEU 异常低（<5）**

现象：训练完 eval_loss=0.0042 但 predict_bleu-4=1.82。查看 generated_predictions.jsonl，predict 输出含 <think>...</think> 标签。

根因：Qwen3 默认开了 thinking mode，generate 时会先吐一大段思考内容再给答案。训练时 TuningFactory 的 qwen3 模板（ReasoningTemplate）在训练阶段自动给 label 包一层 <think>\n\n</think>\n\n{output}，但推理时 enable_thinking 默认 True，模型就把空 think 填满了。

修复：所有 configs/*.sh 默认带上 --enable_thinking=False。实测关闭前 BLEU=1.82，关闭后 BLEU=46.32，ROUGE-L=63.57。

**4.3 oss_endpoint 格式因队列而异**

同一 region 的 OSS，在不同 GPU 队列（不同 IDC 线路）下白名单规则可能不同。MI308X 队列用 cn-hangzhou.oss.aliyuncs.com，H20/H200 用 oss-cn-hangzhou-internal.aliyuncs.com。切换队列时同步修改 endpoint。

**5. 同期工作横向对比**

| 项目 | 入门门槛 | 适用领域 | 训练框架 |
|------|---------|---------|---------|
| karpathy/autoresearch | 最低 | 单文件 train.py 实验 | 任意本地 GPU |
| Pailitao-AutoResearch | 低 | 多模态排序/通用 demo | 自研 |
| 前作 CV demo | 低 | CV 分类 | PyTorch |
| auto_research_llm（本文） | 中 | 1688 LLM 微调 | TuningFactory + ROLL |
| TAO-AutoResearch | 高 | 搜索召回/排序 | 自研 + AOP |

**6. 还没做好的几块**

Agent 调参循环还不够智能（无 Hyperband/Successive Halving 剪枝）；跨场景知识不流通（打算搞 lessons.jsonl）；在线蒸馏未端到端验证；TuningFactory 不支持离线蒸馏 logit caching；RL 流水线没接进 submit.sh；本地评估缺失；MOS 实测较少（35B 模型端到端 ckpt 加载未验证）；多 Agent 协作未实现。

**7. 写在最后**

回到开头那张"请求 → 召回 → ... → 模型训练 → 线上服务"的闭环图。主搜、拍立淘的同学已经把骨架搭起来了，前作 CV demo 在 CIFAR-10 上跑通过一次，本文的 LLM 实战版又把 1688 这边的细节填上。下一步是把"模型训练"这一环和"样本反馈 / 线上服务"接上。
