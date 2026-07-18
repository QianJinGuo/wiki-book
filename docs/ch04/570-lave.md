# LAVE：面向扩散语言模型的约束解码

## Ch04.570 LAVE：面向扩散语言模型的约束解码

> 📊 Level ⭐⭐ | 4.0KB | `entities/lave-lookahead-then-verify-diffusion-lm-constrained-decoding-issta-2026.md`

# LAVE：基于前瞻验证的扩散语言模型约束解码

> 清华大学 AI Agent 课题组提出 LAVE（Lookahead-then-Verify），通过前瞻补全与语法验证实现扩散语言模型的可靠约束解码，在四个主流扩散 LM 上达到接近 100% 的语法正确率。论文被 ISSTA 2026 接收。

## 核心问题

扩散语言模型（Diffusion LLM）从 [MASK] 构成的序列出发以非顺序方式生成 token，具备并行解码和高效率推理的潜力（LLaDA、Dream、Gemini Diffusion 等）。但在代码、JSON、SMILES 等形式语言生成任务中，其输出难以稳定满足语法约束——Dream-7B 在 HumanEval-CPP 上的语法错误率高达 23.8%。

自回归语言模型的约束解码较为直接（中间输出始终是不含空缺的完整前缀），但扩散 LM 的中间输出包含 [MASK] 空缺，传统语法解析器无法直接判定不完整前缀是否可扩展为合法完整输出。

## 方法：LAVE

LAVE 的核心思想是 **Lookahead-then-Verify**（先前瞻，再验证）：

1. **前瞻补全**：利用扩散 LM 一次前向传播同时给出所有位置 token 概率分布的特性，为当前不完整前缀生成若干高概率的候选补全
2. **语法验证**：使用语法解析器（如 Earley Parser）并行检查每个候选是否可扩展为符合上下文无关文法的完整输出
3. **决策**：存在任一候选通过验证 → 接受新提议的 token；全部不可扩展 → 拒绝该 token，模型重新生成

### 工作示例

不完整前缀 `return a [MASK] b ? [MASK] : b` 可能被补全为：
- `return a > b ? a : b` ✅ 合法
- `return a < b ? a : b` ✅ 合法
- `return a > b ? b : b` ✅ 合法

只要至少一个候选通过验证，新 token 就被接受。直接枚举所有补全不可行（[MASK] 位置对应词表中大量 token，组合后指数级候选空间），LAVE 通过仅采样高概率候选来控制开销。

## 实验结果

在 LLaDA-8B、LLaDA-1.5、Dream-7B 和 DiffuCoder-7B 四个扩散 LM 上的评测（覆盖 C++、Java、Go、JSON、SMILES）：

- **语法正确率**：四个模型在五项任务上均接近 100%（显著提升）
- **功能正确率**：Dream-7B C++ 任务从 25.6% 提升至 33.5%
- **推理开销**：JSON 任务平均推理时间仅增加 ~3%；SMILES 任务中因减少无关自然语言生成，推理时间反而下降

## 相关实体

- [Baddlm Diffusion Language Model Backdoor 2026](../ch01/1170-baddlm.html) — 扩散语言模型后门攻击
- [D Opsd Diffusion Llm On Policy Self Distillation](../ch01/178-d-opsd.html) — 扩散 LLM 在线自蒸馏
- [Residual Context Diffusion Apple Ml 2026 07](../ch01/966-20.html) — Apple 残差上下文扩散
- [Diffusion Model Architecture](https://github.com/QianJinGuo/wiki/blob/main/concepts/diffusion-model-architecture.md) — 扩散模型架构
- [Speculative Decoding](https://github.com/QianJinGuo/wiki/blob/main/concepts/speculative-decoding.md) — 推测解码（并行解码的相邻领域）

## 论文信息

- **论文**：Lookahead-then-Verify: Reliable Constrained Decoding for Diffusion LLMs under Context-Free Grammars
- **接收**：ISSTA 2026
- **团队**：清华大学人工智能学院 AI Agent 课题组（通讯作者：李佳助理教授，第一作者：张奕彤）
- **arXiv**：https://arxiv.org/pdf/2602.00612
- **代码**：https://github.com/THU-Agent/LAVE

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/issta-2026lave面向扩散语言模型的约束解码.md)

---

