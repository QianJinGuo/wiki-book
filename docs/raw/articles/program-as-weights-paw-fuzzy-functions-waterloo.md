---
title: "Program-as-Weights 用自然语言写函数，编译成权重本地跑：0.6B 小模型超过32B 模型"
source_url: "https://mp.weixin.qq.com/s/YaZCRvo4a-cTkeQ-XkEO1g"
author: "微信公众号"
feed_name: "微信公众号"
publish_date: 2026-07-07
created: 2026-07-07
ingested: 2026-07-07
tags: [program-as-weights, paw, fuzzy-functions, lora, neural-compilation, llm-optimization, edge-ai, waterloo]
type: article
review_value: 8
review_confidence: 8
review_recommendation: strong
review_stars: 4
sha256: a0826aed12e48f1eddc1dadcf4bea3095368d3e10653389db4e312d5bc2549d1
---

# Program-as-Weights 用自然语言写函数，编译成权重本地跑：0.6B 小模型超过32B 模型

Waterloo 等团队提出 Program-as-Weights (PAW)：自然语言描述模糊函数 → 云端神经编译器编译成 ~23MB LoRA 权重文件 → 笔记本上 0.6B 小模型加载后离线反复调用。

- 论文：arXiv:2607.02512
- 项目：https://programasweights.com
- FuzzyBench-10M 数据集

## 核心理念

传统编程对"模糊函数"（日志告警、JSON修复、搜索排序）束手无策；现有做法是每次调 API，贵且不可离线。PAW 三步走：
1. 开发者用自然语言写函数需求
2. 神经编译器把需求编译成小型"神经可执行文件"（LoRA权重）
3. 冻结的小解释器加载该文件，像调普通函数一样处理输入

类比：编译器把源码→可执行文件，运行时只执行。差别在于可执行文件是学出来的参数块，运行时是神经网络。

## 编译产物：一半文字，一半权重

| 组件 | 是什么 | 干什么 |
|---|---|---|
| 伪程序 | 任务重述 + 输入输出样例 | 帮小模型理解任务 |
| LoRA 权重 (~38.5M 参数) | 把解释器"拧"成特定函数 | 细粒度行为控制 |

单程序约 23MB (Q4_0 量化)，底座模型只需下载一次。

### 编译流水线（两个 4B 模型分工）

- 伪编译器 (Qwen3-4B-Instruct)：不训练，改写用户规格
- LoRA 编译器 (Qwen3-4B)：经 LoRA Mapper 生成每层 LoRA 矩阵

解释器全程冻结。换函数只需重新编译——一个运行时，挂无数个程序。

## 主实验结果

| 方法 | FuzzyBench EM | 可离线 | 推理内存 |
|---|---|---|---|
| PAW (Qwen3 0.6B) | **73.78%** | ✅ | ~1.2GB |
| Qwen3-32B 直推 | 68.70% | ⚠️ | ~60GB |
| 裸 0.6B 直推 | 9.84% | ✅ | ~1.2GB |
| LM→Code (ALCHEmist) | 35.81% | ✅ | varies |

关键发现：PAW 0.6B 在 WRENCH 真实任务上 (YouTube/SMS/Yelp/IMDB) 整体与 4B-32B 直推同档，但程序可打包带走。

## 其他关键结论

- **无编译器不行**：固定 LoRA r=64 仅 52.10%，全量微调 58.40%，PAW 73.78%
- **量化友好**：Q6_K+Q4_0 总 623MB, EM 65.75% (vs bf16 65.80%)
- **图像任务无需换解释器**：编译器换 VL-4B, 解释器仍是 0.6B 文本
- **8 种噪声下最多掉 3.7 点**：伪程序是降噪层

PAW 适合"函数定义相对稳定、调用次数多"的场景。方向：大模型不必每条输入都上场，定义函数时编译一次、调用时本地小模型执行。
