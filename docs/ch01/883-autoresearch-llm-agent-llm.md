# AutoResearch-LLM：让 Agent 接手 LLM 训练优化

## Ch01.883 AutoResearch-LLM：让 Agent 接手 LLM 训练优化

> 📊 Level ⭐⭐ | 4.9KB | `entities/autoresearch-llm-agent-llm-training-optimization-1688.md`

# AutoResearch-LLM：让 Agent 接手 LLM 训练优化

> **来源**：阿里云开发者（吉梦林）。本文是 1688 团队 LLM 微调 AutoResearch 的落地实战，基于 TuningFactory（LLaMA-Factory 内部 Fork）+ 星云平台，覆盖电商场景（Query 改写 / 同款判定 / 重排打分）下 Qwen3 系列模型的三阶段自动化调优框架。
> → [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/autoresearch-llm-agent-llm-training-optimization-1688-阿里云开发者.md)

## 核心贡献

将 Karpathy 的 AutoResearch 思想首次落地到 1688 的 LLM 微调场景，核心创新点：

1. **三阶段 Agent 驱动流水线**：场景诊断 → 方案设计 → 自动化实验，每个阶段有明确产出物，方便 Agent 在长上下文里"接力"
2. **TuningFactory 深度集成**：submodule 引入 + 实验分支隔离（Git Worktree），一个 SKILL.md 驱动整个调参循环
3. **七维基线诊断**：基座模型 / 数据质量 / 数据规模 / Prompt 模板 / 训练方式 / Eval 配置 / Baseline 复盘
4. **六级参数优先级**：LR/LoRA → batch → 训练策略 → 数据 → 分布式 → 评估，搭配 15+ 技术候选库
5. **自动评估链路**：TuningFactory Trainer 内置 predict_with_generate，自动出 BLEU-4 / ROUGE-L，省掉独立推理脚本

## 架构设计

### 三阶段流水线

**阶段 1：场景理解与基线分析** — 7 维诊断 + baseline 跑分。关键规则：基座模型在本阶段锁定，后续整个实验序列不再可调。

**阶段 2：实验方案设计** — 技术候选库匹配 + 六级优先级展开。一级参数涵盖 learning_rate、lora_rank/alpha、lora_target、num_train_epochs、Prompt 模板、cutoff_len。

**阶段 3：自动化实验验证** — 单变量探索 → 正交组合 → 数据维度兜底。每个实验经历：生成 config → push 实验分支 → submit → 监控 → 评估 → 入 csv。产出 experiment_results.csv（实验级明细） + final_report.md（研究级总结）。

### 实验隔离

基于 submodule worktree 多分支，命名规范：`experiment-{编号}-{场景}-{方式}-{变量}`（如 `experiment-03-qr-sft-lora32-prompt-v2`）。scripts/sync_to_tuning_factory.sh 自动完成：submodule 拉分支 → 复制配置 → commit + push。

## 关键技术栈

| 组件 | 选用 | 说明 |
|------|------|------|
| 训练框架 | TuningFactory | LLaMA-Factory 内部 Fork，封装 ODPS 数据源、内部存储、多队列适配 |
| 训练平台 | 星云 | 内部通用训练平台，全 API 操作（不用开浏览器） |
| 基座模型 | Qwen3 系列 | 1.7B / 8B / 32B + Qwen3.6-35B-A3B（MoE） |
| 数据 | ODPS / OSS | ODPS 主 + OSS JSON 备选 |
| 并行 | DeepSpeed ZeRO-2/3 / Megatron Turbo | MoE 场景加 EP |
| 评估 | Trainer predict_with_generate | 自动 BLEU-4 / ROUGE-L |
| RL 框架 | ROLL（已接入） | GRPO，未端到端验证 |

## 踩坑记录

### PyTorch 2.6 + DeepSpeed + load_best 冲突

PyTorch 2.6 默认 weights_only=True，DeepSpeed LossScaler 序列化对象不被接受。触发点：Trainer auto-resume 和 _load_best_model()。修复：禁用 overwrite_output_dir 和 load_best_model_at_end，按 trainer_state.json 手动定位 best ckpt。

### Qwen3 thinking mode 让 BLEU 掉到个位数

训练时 TuningFactory 的 ReasoningTemplate 自动给 label 包 `<think>\n\n</think>\n\n{output}`，但推理时 enable_thinking 默认 True，模型输出思考内容而非答案。修复：所有 config 加 `--enable_thinking=False`。实测 BLEU 从 1.82 → 46.32。

### OSS endpoint 因队列而异

MI308X 与 H20/H200 队列的白名单规则不同，需要不同的 endpoint 格式。切换队列时同步修改。

## 与现有工作对比

| 项目 | 门槛 | 适用领域 | 框架 | 隔离 |
|------|------|---------|------|------|
| Karpathy AutoResearch | 最低 | 单文件实验 | 任意 GPU | — |
| Pailitao-AutoResearch | 低 | 多模态排序/通用 | 自研 | Git 分支 |
| 前作 CV demo | 低 | CV 分类 | PyTorch | Git Worktree |
| **auto_research_llm（本文）** | **中** | **1688 LLM 微调** | **TuningFactory + ROLL** | **Submodule 分支 / Worktree** |
| TAO-AutoResearch | 高 | 搜索召回/排序 | 自研 + AOP | Git Worktree（4 子 Agent） |

## 已知不足

- Agent 调参无 Hyperband/Successive Halving 剪枝
- 跨场景知识不流通（计划 lessons.jsonl 踩坑库）
- 在线蒸馏（--stage distill）未端到端验证
- TuningFactory 不支持离线 logit caching 蒸馏
- RL 流水线未接入统一 submit.sh
- 本地评估（F1 / NDCG@10）未自动化
- 单 Agent + Skill 形式，无多 Agent 协作

---

