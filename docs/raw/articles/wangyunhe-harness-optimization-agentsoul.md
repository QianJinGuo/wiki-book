---
title: "王云鹤眼中的Harness：复杂优化问题，AGI灵魂争夺之战"
platform: "机器之心（转载自知乎）"
author: "王云鹤"
date: "2026-05-18"
source_url: "https://mp.weixin.qq.com/s/Jxf4hqDNiVeB8C0KqJCNFA"
original_url: "https://zhuanlan.zhihu.com/p/2038669387150927679"
sha256: "c2d51ba25a544e290fd1158ecff5ade38bd51c2c5807e6fa7fc4b27f4e55e4cf"
review_value: 9
review_confidence: 8
review_recommendation: strong
review_stars: 5
tags: ["harness-engineering", "agent-architecture", "multi-model", "optimization", "agi"]
type: article
---
# 王云鹤眼中的Harness：复杂优化问题，AGI灵魂争夺之战
作者：王云鹤（华为诺亚方舟实验室）
来源：机器之心转载自知乎
## 什么是Agent？Agent = Models + Harness
Agent 长期缺乏清晰定义。王云鹤提出：**Agent = Models + Harness**（多模型，而非单 Base Model）。Harness 把围绕模型的所有高价值元素联动在一起，是 Agent 时代最重要的事情之一。
Harness 不会消亡——RAG 不是在消失而是在升级（加了 prompt、工具调用、知识后变成 skills），Harness 元素一直存在并随模型能力和算法创新不断进化。
## 为什么 Agent 需要多模型？
### 1. 模型"七国八制"
国内模型格局高度异构——各家根据业务属性、数据、技术路线出现特异化（有的擅长数学、有的 coding 强、有的长序列好），且价格差异大。Claude Code 内部调用多款模型（opus/sonnet/haiku）实现综合最优。Benchmark 表现与具体任务表现关联度可能很低——GPT 因过度安全而在量化任务中失利，deepseek/qwen 反而胜出^[原始来源：机器之心转载王云鹤知乎文章]。
### 2. 模型中的任务会"打架"
语言模型大部分时间不在统一模型中学所有任务。快慢思考合一在 2025 年被几乎所有人放弃。类比：图像超分（高通滤波）和去模糊（低通滤波）在同一基模中冲突^[Chen et al., IPT, CVPR 2021]。不同任务最优模型会有差异性。
### 3. 复杂任务更需要多模型
BEYOND LLM，多模态生成、具身智能等需多模型协同：文案转写 → 视频生成 → 转场稳定性保障。具身智能需感知、决策、运控、预测、记忆多模型协同。Harness 层时间窗 3-5 年以上。
## Harness 作为复杂优化问题
王云鹤将 Harness Engineering 形式化为优化问题：
- **Agent 价值范式** = 任务价值 × 成功率 × Token 性价比（Intelligence/Token）
- **优化目标**：对任务 T，从模型集合 M 中选择最优模型序列，并为每个模型调整 Harness 组件参数（prompt、RAG、memory、safety）至最优
- **手段**：handcrafted 经验 + human-in-the-loop 反馈 + LLM as optimizer + AutoML 经验
## Model Parameters + Harness Parameters 联合优化
下一代 AGI 路径：**Model Parameters 与 Harness Parameters 迭代优化或联合优化**。
Anthropic 的实践证明：opus 4 → Claude Code 1.0 → opus 4.5 → Claude Code 2.0 → opus 4.6... 基模与 Harness 迭代互促。
## AI "灵魂"之争
核心哲学问题：如果 Harness 能控制模型、选择模型、甚至基于 Harness 数据增训模型实现自主进化——AI 的大脑/灵魂到底在 Base Model 还是 Harness？
## 参考文献
- [r1] Trivedy, Vivek. "The Anatomy of an Agent Harness." LangChain Blog, 2026.
- [r2] Liu, Rui, et al. "AgentOS." arXiv:2603.08938, 2026.
- [r3] He, Chaoyue, et al. "Harness Engineering for Language Agents." 2026.
- [r4] Chen, Hanting, et al. "Pre-trained Image Processing Transformer." CVPR 2021.
- [r5] Tian, Yuchuan, et al. "Instruct-IPT." arXiv:2407.00676, 2024.
- [r6] Yang, Chengrun, et al. "Large Language Models as Optimizers." ICLR 2024.
- [r7] Trivedi, Prashant, et al. "Align-Pro." AAAI 2025.