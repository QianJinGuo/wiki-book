---
source_url: "https://mp.weixin.qq.com/s/jBJTqh8KL-q87ahc-GdPMQ"
title: "武大团队提出SkillCAT：Agent技能进化效率暴涨40%"
source: "大模型论文研习社"
author: "王哥儿"
ingested: 2026-07-22
sha256: 5e09fc15ad1e4acfefc5466dd86857f8f867d60e257aab20500a9fd6cd4c4d9f
type: raw-article
tags: [skillcat, skill-self-evolution, contrastive-learning, topology-routing, whu, ntu]
---

# SkillCAT: Contrastive Assessment and Topology-Aware Skill Self-Evolution for LLM Agents

> 武汉大学 & 南洋理工大学 | arXiv 2606.13317 | 免训练框架，对比因果抽取 + 回放验证 + 拓扑路由

## 三大痛点

1. **单轨迹偏见（Single-Trace Bias）**：一条成功轨迹可能只是"蒙对了"
2. **未经验证的合并**：有害补丁偷溜进技能库，DocVQA 上 ANLS 反降 0.0620
3. **上下文过载**：技能越长越臃肿，"懂得多≠用得好"

## SkillCAT 三模块

### CCE（对比因果抽取）
同任务成功/失败轨迹配对照组，定位因果分水岭（首次动作分叉点），只在该点抽经验。

### AAE（评估增强进化）
在源任务克隆体上回放每个候选补丁，按结果跃迁打分（F→S=3, S→S=2, F→F=1, S→F=0），阈值 θ=2.0。

### TTE（拓扑感知任务执行）
把技能编译成可路由拓扑，LLM 路由器 top_k=7，削减 41.6% 上下文同时提升准确率。

## 主要结果

| 配置 | Vrf |
|------|-----|
| Baseline（无技能） | 9.67% |
| Trace2Skill | 29.67% |
| **SkillCAT（35B）** | **55.50%** |
| SkillCAT（122B） | 69.50%（与 Trace2Skill 的 69.83% 接近但全面反超） |

### Skill Creation（从弱到强）
Trace2Skill 几乎纹丝不动（-0.17/+0.16），SkillCAT 做到 54.50%/64.50%

### 消融
| 配置 | Vrf |
|------|-----|
| Full SkillCAT | 55.50% |
| w/o CCE | 32.50% |
| w/o AAE | 26.00% |
| w/o TTE | 46.50% |
| Only TTE | 27.50% |

### 工程结论
- CCE 5 个种子是最佳平衡点（更高反而回落）
- AAE 打分完美单调排列（F→S 51.0% > S→S 41.0% > F→F 32.0% > S→F 23.5%）
- TTE LLM 图路由 top_k=7 削减 41.6% 上下文

## 链接

- 论文: https://arxiv.org/abs/2606.13317
- 已有实体: [[entities/skill-self-evolution-three-approaches]]（技能自进化全景）
