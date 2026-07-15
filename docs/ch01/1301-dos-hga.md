# 大模型推理模型DoS攻击——浙大阿里HGA方法

## Ch01.1301 大模型推理模型DoS攻击——浙大阿里HGA方法

> 📊 Level ⭐⭐⭐⭐ | 2.6KB | `entities/hga-reasoning-model-dos-zheda-alibaba-2026.md`

# 大模型推理模型DoS攻击——浙大阿里HGA方法

浙江大学联合阿里巴巴安全团队提出了一种针对大语言推理模型的新型 DoS 风格资源耗尽攻击方法——**HGA（Hierarchical Genetic Algorithm）**。该方法在严格黑盒条件下，利用推理模型的"过度思考"特性，诱导模型生成极长推理链，实现 26.1 倍的 token 增长放大。

## 攻击背景

以 DeepSeek-R1 为代表的推理模型在数学求解、代码生成、科学分析、智能体决策等场景被广泛应用。与普通大模型相比，推理模型在回答前会生成更长的思考链。当输入问题存在缺失条件、逻辑矛盾或结构错位时，模型可能陷入反复推理、自我修正、重新假设的"过度思考"状态。

这种行为的攻击面在于：攻击者不一定让模型输出有害内容，而是通过精心构造的问题让模型"想太多"，从而消耗服务端计算资源——形成一种面向推理模型的 DoS 风格资源耗尽攻击。

## HGA 方法

HGA 的核心思路是**层次化遗传算法**：

1. **黑盒条件**：不依赖模型权重、梯度或内部结构，仅通过 API 交互进行攻击。
2. **自动扰动**：自动扰动问题的逻辑结构，诱导推理模型生成极长、冗余、反复自我修正的推理过程。
3. **效果验证**：在多个主流推理模型和基准上均能显著放大输出长度，在 MATH 数据集上最高实现 26.1 倍 token 增长，远超原始问题和现有攻击方法。

## 安全影响

该研究揭示了一个重要的 AI 安全新维度：**推理效率本身也是一种攻击面**。传统 DoS 攻击关注网络层/应用层资源耗尽，而 HGA 展示了一种针对 LLM 推理计算资源的攻击路径，对推理服务的成本和安全设计有重要启示。

## 相关实体

- [LLM推理安全分级](ch01/656-llm-thonking.html)
- [提示注入角色分类](https://github.com/QianJinGuo/wiki/blob/main/entities/mechanistic-explanation-prompt-injection-roles.md)

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/hga-reasoning-model-dos-zheda-alibaba-2026.md)

---

