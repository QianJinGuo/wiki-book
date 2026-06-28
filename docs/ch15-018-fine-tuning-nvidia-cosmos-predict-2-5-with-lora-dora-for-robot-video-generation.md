## Ch15.018 Fine-Tuning NVIDIA Cosmos Predict 2.5 with LoRA/DoRA for Robot Video Generation

> 📊 Level ⭐⭐⭐ | 8.7KB | `entities/nvidia-cosmos-fine-tuning-robot-video-generation.md`

## 核心要点
- **参数高效微调**：LoRA/DoRA 仅需训练 ~50M 参数（相比 2B 总量），单 GPU 可运行
- **域适应能力**：解决通用世界模型在机器人手臂、手部、工具等领域的分布偏移问题
- **合成数据生成**：为机器人策略学习提供可扩展的合成轨迹，降低真实数据收集成本
- **多维评估体系**：Sampson Error（几何）+ Physical Plausibility（物理）+ Instruction Following（指令）
- **实用配置**：rank=32, 100 epochs, ~2.5 小时 8×H100

## 深度分析
### 为什么世界模型需要微调
Cosmos Predict 2.5 作为通用视频生成模型，在未微调状态下存在三类典型缺陷：
1. **外观幻觉**：机器人手臂被替换为人类手部（out-of-distribution 导致的分布外幻觉）
2. **动作错误**：不遵循指令指定的手（左手/右手）或目标物体
3. **几何失真**：帧间抖动、多视角不一致
微调的本质是让模型学习特定机器人平台的视觉和运动学特征，而非重新学习通用物理规律。

### LoRA 机制的技术原理
LoRA 在 DiT 的注意力层和前馈层注入低秩矩阵：
```
ΔW = A × B, where A ∈ R^{d×r}, B ∈ R^{r×k}, rank r << min(d,k)
```
训练时：

- 冻结原始权重 W₀
- 仅训练 A、B 矩阵
- 推理时：W = W₀ + (α/r) × ΔW
**优势**：

- 显存占用大幅降低（从 2B 参数量降至 ~50M）
- 适配器文件小（~200MB），便于分发和切换
- 可为不同领域训练多个 adapter，运行时动态加载

### DoRA 的增量改进
DoRA 将权重分解为幅度和方向两部分：
```
W = m × (W₀ + ΔW / ||W₀ + ΔW||)
```
其中 m 是可学习的幅度标量。直觉上，DoRA 让模型分别学习「**改变多少**」（幅度）和「**往哪个方向变**」（方向），提供额外的表达能力。
实验结果显示：rank=32 时 LoRA 与 DoRA 性能相当，但在极低 rank（r=8）或训练不稳定场景下 DoRA 表现更好。

### 合成数据的价值与局限
**价值**：

- 真实机器人数据收集成本 $10K-$100K/task
- 合成数据可在数小时内生成大量多样化轨迹
- 可以覆盖危险场景、稀有物体、极端条件
**局限**：

- 受限于世界模型的物理理解上限
- 模拟到真实的 sim-to-real  gap 需要处理
- 需要高质量 prompt 描述期望动作

### 评估指标设计分析
| 指标 | 衡量内容 | 为什么重要 |
|------|---------|-----------|
| Temporal Sampson Error | 帧间几何一致性 | 物理可信的运动轨迹 |
| Cross-view Sampson Error | 多视角一致性 | 3D 空间理解 |
| Physical Plausibility | 物理规律遵循 | 合成数据的物理有效性 |
| Instruction Following | 指令执行正确性 | 任务完成的保证 |

## 实践启示
### 微调前的 Checklist
- [ ] 明确目标域：机器人类型（单臂/双臂/轮式）、相机配置、任务类型
- [ ] 评估数据量：92 个视频对 GR00T 级别任务足够，但垂直领域可能需要更多
- [ ] 确定评估指标：物理可信性 vs 指令遵循哪个更重要
- [ ] 准备计算资源：80GB GPU 最小，8×H100 加速迭代

### 训练超参数建议
```
lora_rank: 32          # 平衡表达力和效率
lora_alpha: 32         # = rank 保持 scale factor = 1.0
num_epochs: 100        # 从 100 开始，观察 val loss 调整
learning_rate: 1e-4    # 标准设置
warmup_steps: 100      # 渐进式学习率预热
```

### DoRA 适用场景
当出现以下情况时，考虑切换到 DoRA：

- 使用极低 rank (r=8) 且训练 loss 震荡
- 观察到 LoRA 过拟合但又不希望增大 rank
- 任务需要更精细的方向控制

## 相关实体
- [Fine Tuning Nvidia Cosmos Predict 25 With Loradora For Robot Video Generation](ch01-885-elf-embedded-language-flows.html)
- [Fine Tuning Nvidia Cosmos Predict 2 5 With Lora Dora For Robot Video Generation](ch01-885-elf-embedded-language-flows.html)
- [Fine Tuning Cosmos](ch01-862-ai-agent-5-l1-l2-l3-6-benchmark-llm-as-jud.html)
- [Navigating Eu Ai Act Requirements For Llm Fine Tuning On Amazon Sagemaker Ai](ch01-330-deepseek-36-ai.html)
- [Video Agent Paradigm Compute Talent Flywheel Ethan He 20260606](ch01-781-world-s-first-native-color-lidar-gives-machines-human-like-v.html)

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/fine-tuning-nvidia-cosmos-predict-2-5-with-lora-dora-for-robot-video-generation.md)

### 应用 Pipeline
```
1. 准备领域数据
   └─ 视频 + 文本描述（手、物体、动作）
2. 训练 LoRA/DoRA
   └─ 2.5 小时 / 100 epochs @ 8×H100
3. 生成合成轨迹
   └─ 批量生成 + 多 seed 去噪
4. 质量筛选
   └─ Physical score > 4.0
   └─ Instruction following > 4.0
5. 机器人策略学习
   └─ 合成数据 → 行为克隆 / RL
6. Sim-to-Real 部署
   └─ Domain randomization
   └─ 域适应微调
```
→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/nvidia-cosmos-fine-tuning-robot-video-generation.md)
- mind lab lora 持续学习体系：δ-mem + mint + lora scaling law + macar

---
