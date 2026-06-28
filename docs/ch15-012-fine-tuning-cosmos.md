## Ch15.012 Fine-Tuning Cosmos

> 📊 Level ⭐⭐⭐ | 15.6KB | `entities/fine-tuning-cosmos.md`

## 核心要点

- **参数高效微调范式**：Cosmos Predict 2.5 (2B 参数) 通过 LoRA/DoRA 仅需训练 ~50M 参数，单 GPU 可运行
- **世界模型适配**：解决通用视频生成模型在机器人领域的外观幻觉、动作错误、几何失真三大问题
- **合成数据生成**：为机器人策略学习提供可扩展的、低成本的合成轨迹，绕过真实数据收集的 $10K-$100K/task 成本
- **多维评估体系**：Sampson Error（几何）+ Physical Plausibility（物理）+ Instruction Following（指令）三重指标
- **实用配置**：rank=32, 100 epochs, ~2.5 小时 8×H100 / 17 小时单 H100

## 为什么需要微调 Cosmos

### 世界模型的分布偏移问题

Cosmos Predict 2.5 作为通用世界模型，在处理**机器人领域特定任务**时存在三类典型缺陷：

| 问题类型 | 表现 | 根本原因 |
|---------|------|---------|
| **外观幻觉** | 机器人手臂被替换为人类手部 | 机器人视觉特征 out-of-distribution |
| **动作错误** | 不遵循指令指定的手（左手/右手）或目标物体 | 域适应能力不足 |
| **几何失真** | 帧间抖动、多视角不一致 | 训练数据的视觉统计与目标域不匹配 |

### 微调的本质

微调是将通用世界模型的「物理直觉」与特定机器人平台的「运动学特征」对齐，而非重新学习通用物理规律 。

这意味着：

- 不需要 full fine-tuning（全量参数更新）
- 冻结预训练权重可以保留强大的物理 priors
- 只需要 ~2.5% 的参数更新即可实现有效的域适应

## 技术架构

### Cosmos Predict 2.5 组成

```
Cosmos Predict 2.5 (2B 参数)
├── VAE (Video Encoder/Decoder)
│   └── 将视频编码为 latent 表示
├── Text Encoder
│   └── 将文本 prompt 编码为 embeddings
└── DiT (Diffusion Transformer)
    └── 在 latent space 执行扩散生成
```

### LoRA 注入机制

LoRA 在 DiT 的注意力层和前馈层注入低秩矩阵 ：

```
ΔW = A × B, 其中 A ∈ R^{d×r}, B ∈ R^{r×k}, rank r << min(d,k)
```

**训练时**：

- 冻结原始权重 W₀
- 仅训练 A、B 矩阵（~50M 参数）
- 推理时：W = W₀ + (α/r) × ΔW

**注入位置**：

- 注意力投影：`to_q`, `to_k`, `to_v`, `to_out.0`
- 前馈层：`ff.net.0.proj`, `ff.net.2`

### DoRA 的增量改进

DoRA 将权重分解为幅度和方向两部分 ：

```
W = m × (W₀ + ΔW / ||W₀ + ΔW||)
```

其中 m 是可学习的幅度标量。直觉上，DoRA 让模型分别学习「**改变多少**」（幅度）和「**往哪个方向变**」（方向）。

| 特性 | LoRA | DoRA |
|------|------|------|
| 原理 | 低秩矩阵分解 | 幅度+方向分解 |
| 内存开销 | 相同 | 略高 |
| 极低 rank 表现 | 可能不稳定 | 更稳定 |
| **推荐场景** | 通用场景，rank≥16 | 内存受限或极低 rank |

## 训练流程详解

### 数据准备

**训练数据集**：GR1-100 (92 个机器人操作视频 + 文本描述)

```
gr1_dataset/train
├── metas/*.txt          #  caption 描述
├── videos/*.mp4        #  视频文件
└── metadata.csv         #  元数据
```

**测试数据集**：PhysicalAI-Robotics-GR00T-Eval (50 个 prompt-image 对)

```
gr1_dataset/test
├── filename1.txt        #  文本描述
├── filename1.png       #  初始帧图像
└── ...
```

### 训练配置建议

| 超参数 | 推荐值 | 说明 |
|--------|--------|------|
| `lora_rank` | 32 | 平衡表达力和效率 |
| `lora_alpha` | 32 | = rank 保持 scale factor = 1.0 |
| `num_epochs` | 100 | 从 100 开始，观察 val loss 调整 |
| `learning_rate` | 1e-4 | 标准设置 |
| `warmup_steps` | 100 | 渐进式学习率预热 |
| `batch_size` | 1 | 受限于视频内存占用 |
| `height/width` | 432/768 | 视频分辨率 |

**完整训练命令** ：

```bash
export MODEL_NAME="nvidia/Cosmos-Predict2.5-2B"
export DATA_DIR="gr1_dataset/train"
export OUT_DIR=YOUR_OUTPUT_DIR
lora_rank=32

accelerate launch --mixed_precision="bf16" train_cosmos_predict25_lora.py \
  --pretrained_model_name_or_path=$MODEL_NAME \
  --revision diffusers/base/post-trained \
  --train_data_dir=$DATA_DIR \
  --train_batch_size=1 \
  --num_train_epochs=500 \
  --checkpointing_epochs=100 \
  --seed=0 \
  --output_dir=$OUT_DIR \
  --report_to=wandb \
  --height 432 --width 768 \
  --allow_tf32 --gradient_checkpointing \
  --lora_rank $lora_rank --lora_alpha $lora_rank
```

### 训练时长估算

| 硬件配置 | 100 epochs 时间 |
|---------|----------------|
| 8× H100 | ~2.5 小时 |
| 单 H100 | ~17 小时 |
| 单 A100 80GB | ~24-30 小时（估算） |

## 推理与部署

### 加载 LoRA 权重

```python
from diffusers import Cosmos2_5_PredictBasePipeline

pipe = Cosmos2_5_PredictBasePipeline.from_pretrained(
    "nvidia/Cosmos-Predict2.5-2B",
    revision="diffusers/base/post-trained",
    device_map="cuda",
    torch_dtype=torch.bfloat16,
)
pipe.load_lora_weights("/path/to/lora/checkpoint")
pipe.fuse_lora(lora_scale=1.0)  # 合并权重，消除推理开销
```

### 生成视频

```python

# 可重复性噪声生成
latent_shape = pipe.get_latent_shape_cthw(height, width, num_frames)
noises = arch_invariant_rand(
    (batch_size, *latent_shape), 
    dtype=torch.float32, device=device, seed=seed
)

frames = pipe(
    image=image,           # PIL Image: 条件首帧
    prompt=prompt,          # 文本描述
    num_frames=num_frames,
    num_inference_steps=36,
    height=432,
    width=768,
    latents=noises,         # 可选
).frames[0]

export_to_video(frames, "output.mp4", fps=16)
```

### LoRA 热切换

可以训练多个 domain-specific adapters，推理时动态加载，实现一个 base model 服务多个垂直场景 ：

```python

# 加载领域 A 的 adapter
pipe.load_lora_weights("path/to/domain_a_lora")

# 生成领域 A 的视频
...

# 切换到领域 B 的 adapter
pipe.load_lora_weights("path/to/domain_b_lora")

# 生成领域 B 的视频
```

## 评估指标体系

### Sampson Error（几何一致性）

Sampson Error 是几何计算机视觉中的传统指标，衡量匹配关键点到其对应极线的距离 。

| 指标 | 衡量内容 | 为什么重要 |
|------|---------|-----------|
| **Temporal Sampson Error** | 连续帧间的几何一致性 | 物理可信的运动轨迹 |
| **Cross-view Sampson Error** | 不同相机视角的同时帧一致性 | 3D 空间理解 |

### LLM-as-a-Judge（物理可信性 & 指令遵循）

使用 Cosmos Reason2 作为评判模型，1-5 分评分 ：

**Physical Plausibility**（不看 prompt）：

- 物体行为是否符合物理特性（刚体不变形、液体自然流动）
- 运动和力是否与真实物理一致（重力、惯性、动量守恒）
- 物体交互是否合理（无异常穿透、碰撞反应适当）
- 时序一致性（帧间无突兀变化）

**Instruction Following**（看 prompt + video）：

- 任务完成度
- 动作准确性
- 物体交互正确性
- 目标达成
- 正确手的使用（左手/右手）

## 实验结果

### 定性分析

| 模型 | 典型问题 |
|------|---------|
| **Base Model (微调前)** | 幻觉人类手部、不遵循左右手指令、帧间抖动 |
| **LoRA r=32** | 解决上述所有问题 |
| **DoRA r=32** | 与 LoRA 性能相当 |

### 定量分析

**关键发现** ：

1. **100 epochs 足够**：在 8× H100 上约 2.5 小时即可显著提升所有三个指标
2. **LoRA vs DoRA**：在 rank=32 时收敛到相近性能；DoRA 在极低 rank 或不稳定场景下略有优势
3. **Rank 影响**：

   - 更大 rank (32 vs 8) 提升指令遵循（模型有更多容量学习精确的手和物体交互）
   - 但不提升几何一致性或物理可信性（这些 priors 主要由冻结的基础模型捕获）

## 从合成数据到真实机器人

```
Cosmos Predict 2.5 + Domain LoRA
        ↓
  生成多样化合成轨迹（批量 + 多 seed 去噪）
        ↓
  质量筛选
  ├── Physical score > 4.0
  └── Instruction following > 4.0
        ↓
  合成轨迹数据集
        ↓
  行为克隆 / RL 训练机器人策略
        ↓
  Sim-to-Real 部署
  ├── Domain randomization
  └── 域适应微调
```

### 合成数据的价值与局限

**价值** ：

- 真实机器人数据收集成本 $10K-$100K/task
- 合成数据可在数小时内生成大量多样化轨迹
- 可以覆盖危险场景、稀有物体、极端条件

**局限**：

- 受限于世界模型的物理理解上限
- Sim-to-real gap 需要处理
- 需要高质量 prompt 描述期望动作

## 实践 Checklist

### 微调前确认

- [ ] 明确目标域：机器人类型（单臂/双臂/轮式）、相机配置、任务类型
- [ ] 评估数据量：92 个视频对 GR00T 级别任务足够，但垂直领域可能需要更多
- [ ] 确定评估指标：物理可信性 vs 指令遵循哪个更重要
- [ ] 准备计算资源：80GB GPU 最小，8×H100 加速迭代

### DoRA 切换时机

当出现以下情况时，考虑切换到 DoRA ：

- 使用极低 rank (r=8) 且训练 loss 震荡
- 观察到 LoRA 过拟合但又不希望增大 rank
- 任务需要更精细的方向控制

## 深度分析

### 参数高效微调的实质是"保留物理 priors + 适配域外观分布"

LoRA/DoRA 微调 Cosmos Predict 2.5 的本质不是让模型"重新学习物理"，而是将通用世界模型的视觉分布适配到特定机器人平台的外观特征 。实验结果揭示了一个关键不对称：rank 32 vs rank 8 的差异仅体现在指令遵循能力上，而几何一致性和物理可信性在两个 rank 下都没有显著差异。这意味着几何和物理 priors 主要由冻结的基础模型捕获，LoRA 适配的只是"机器人手臂看起来是什么样"和"给定 prompt 应该执行什么动作"这类浅层分布偏移 。对于需要同时优化所有三个指标的场景，增大 rank 并非万能解——当 base model 的物理 priors 本身存在问题时，冻结权重 + LoRA 的组合无法修复底层物理理解缺陷。

### 多维度评估体系的必要性：单一指标会掩盖重要缺陷

该论文构建了三重评估体系：Sampson Error（几何一致性）、LLM-as-Judge Physical Plausibility（物理可信性）、LLM-as-Judge Instruction Following（指令遵循） 。这是一个重要的设计选择，因为视频生成质量的视觉逼真度与"物理正确性"和"任务完成度"之间没有强相关性。一个帧间完全一致、物体运动流畅的视频可能完全遵循了错误的手（左手 vs 右手）或与目标物体交互错误；反之亦然。这意味着在构建机器人合成数据 pipeline 时，必须对每个维度分别设定质量门槛（Physical score > 4.0 AND Instruction following > 4.0），而非依赖单一 FID 或 LPIPS 指标 。

### LoRA 热切换使单一 base model 服务多域成为可能

推理时动态加载不同 domain-specific LoRA adapters 的能力，指向一个重要的工程模式：world model + domain adapters 的组合可能是机器人领域通用基础模型的最终形态 。在 Cosmos 之前，每个机器人类别（工业臂、协作臂、轮式）通常需要独立训练或微调一个完整的视频生成模型；LoRA 热切换使得一个 2B 参数的 base model 可以通过切换 ~50M 的 adapter 服务多个垂直场景，存储和计算成本降低了一个数量级。这种模式与 LLM 社区的 adapter/tuning 实践完全一致，暗示机器人 world model 的未来可能走向"一个通用物理世界模型 + 多个领域轻量适配器"的架构。

### 100 epochs 是效率与效果的最优平衡点

实验数据显示 100 epochs（约 2.5 小时 8×H100）在三个评估指标上均达到显著提升，继续训练到 500 epochs 的边际收益很小 。这一发现对工程实践有重要指导意义：对于快速迭代验证场景，100 epochs 是最低可行训练长度；超过 100 epochs 的训练更可能是在拟合训练数据噪声而非学习新的域知识。这还意味着，对于需要频繁重新训练或持续学习的场景（如持续收集新机器人数据的在线学习），单次 100 epochs 的训练成本（~2.5 小时 on 8×H100）是可接受的工程预算。

### DoRA 的优势在 rank=32 时消失，在极低 rank 时才显现

在 rank=32 的标准配置下，LoRA 和 DoRA 收敛到相近性能 。DoRA 的幅度-方向分解在更高 rank 时提供了额外的表达能力，但当 rank 足够高时，这种分解带来的增益被 LoRA 自身的低秩更新空间所吸收。只有在 rank 极低（r=8）或训练不稳定场景下，DoRA 的结构化分解才表现出稳定优势 。这为实践者提供了一个清晰的决策框架：rank≥16 时默认使用 LoRA，rank<16 或观察到训练 loss 震荡时切换到 DoRA。

## 实践启示

1. **默认使用 LoRA r=32，DoRA 仅作为特定场景的替代方案**。在 rank=32 下，LoRA 和 DoRA 性能相当，LoRA 实现更简单、无额外开销 。只有在 GPU 内存严重受限时才考虑 DoRA r=32，或当 rank=8 时观察到训练 loss 震荡才切换到 DoRA 以获得更稳定的低 rank 学习。

2. **评估体系必须覆盖所有三个维度，而非仅依赖视频质量指标**。 Sampson Error 衡量几何一致性、Physical Plausibility 衡量物理可信性、Instruction Following 衡量任务完成度，三者缺一不可 。在构建合成数据 pipeline 时，应同时设定所有三个维度的质量门槛（如 > 4.0），而非仅凭视觉质量或单一指标筛选数据，否则生成数据中的指令遵循错误会被行为克隆阶段放大 。

3. **合成数据的多 seed 去噪是提高轨迹多样性的关键**。同一个 prompt-image 对通过不同的随机 seed 去噪可以生成多条轨迹，这是在有限训练样本下最大化数据多样性的有效方法 。建议对每个测试样本生成 5 个不同 seed 的视频并取平均评分，以获得更可靠的指标估计 。

4. **fuse_lora 是生产部署的必要步骤**。LoRA weights 在推理时合并到 base model 以消除每次推理的 adapter 计算开销 。对于需要低延迟推理的生产环境，应在部署前执行 `pipe.fuse_lora(lora_scale=1.0)`，而非保留未合并的 LoRA weights。

5. **World model + 多 domain adapters 是推荐的多机器人平台策略**。训练多个 domain-specific LoRA adapters（如 GR1、双臂机器人、轮式平台），推理时动态切换加载，可以在单一 2B base model 上服务多个机器人平台 。这比分别为每个平台训练完整模型在存储、推理成本和一致性维护上都有显著优势。

## 相关资源

- [Cosmos Cookbook](https://nvda.ws/4qevli8) — 官方技术食谱
- [HuggingFace Cosmos Collection](https://huggingface.co/nvidia/collections?search=cosmos) — 模型和数据集
- [GitHub: nvidia-cosmos](https://github.com/nvidia-cosmos) — 官方代码库
- [Cosmos Discord](https://discord.gg/u23rXTHSC9) — 社区讨论

## 相关词条

- Fine-Tuning NVIDIA Cosmos Predict 2.5 with LoRA/DoRA for Robot Video Generation
- Fine-Tuning NVIDIA Cosmos Predict 2.5 with LoRA/DoRA — 深度分析
- [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/nvidia-cosmos-fine-tuning-robot-video-generation.md)

## 相关实体

- MOC

---
