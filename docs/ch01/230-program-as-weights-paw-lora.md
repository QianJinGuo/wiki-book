# Program-as-Weights (PAW) — 神经编译模糊函数为 LoRA 权重

## Ch01.230 Program-as-Weights (PAW) — 神经编译模糊函数为 LoRA 权重

> 📊 Level ⭐ | 2.4KB | `entities/program-as-weights-paw-fuzzy-functions-waterloo.md`

# Program-as-Weights (PAW) — 神经编译模糊函数为 LoRA 权重

> 文章 "Program-as-Weights" (2026-07-07) 的实体整理。Waterloo 团队提出将自然语言描述的模糊函数编译为 LoRA 权重，0.6B 小模型离线执行即超越 32B 模型。

## 核心理念

传统编程对"模糊函数"（日志告警、JSON修复、搜索排序）束手无策。现有做法在代码里直接调 API，每条输入都推理一次，贵且不可离线。

PAW 三步走：
1. 开发者用自然语言写函数需求
2. 云端**神经编译器**把需求编译成小型"神经可执行文件"（LoRA 权重，~23MB）
3. **冻结的小解释器**加载该文件，像调普通函数一样处理输入

类比传统编程：编译器把源码变成可执行文件，运行时只负责执行。差别在于可执行文件是学出来的参数块，运行时是神经网络。

## 核心数据

| 方法 | FuzzyBench EM | 离线可执行 | 推理内存 |
|---|---|---|---|
| **PAW (Qwen3 0.6B)** | **73.78%** | ✅ | ~1.2GB |
| Qwen3-32B 直推 | 68.70% | ⚠️ 需 60GB | ~60GB |
| 裸 0.6B 直推 | 9.84% | ✅ | ~1.2GB |

PAW 0.6B 在 WRENCH 真实任务（YouTube/SMS/Yelp/IMDB）上整体与 4B-32B 直推同档。

## 关键发现

1. **无编译器不行**：固定 LoRA r=64 仅 52.10%，全量微调 58.40%，PAW 73.78%
2. **量化后仍可用**：Q6_K+Q4_0 总 623MB, EM 65.75%（vs bf16 65.80%）
3. **图像任务无需换解释器**：编译器换成 VL-4B，解释器仍是 0.6B 文本
4. **噪声鲁棒**：8 种扰动下最多掉 3.7 点，伪程序是降噪层

## 局限

PAW 适合"函数定义相对稳定、调用次数多"的场景。编译质量绑在 FuzzyBench 覆盖面上。

## 参考

- 论文: arXiv:2607.02512
- 项目: https://programasweights.com
- FuzzyBench-10M: 合成数据集，29 个主题 7 大家族，800+ 子类

→ [raw/articles/program-as-weights-paw-fuzzy-functions-waterloo|原文存档]

---

