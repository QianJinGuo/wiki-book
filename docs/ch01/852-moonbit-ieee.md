# MoonBit与无资源语言代码生成：IEEE论文评估与改进

## Ch01.852 MoonBit与无资源语言代码生成：IEEE论文评估与改进

> 📊 Level ⭐⭐ | 5.1KB | `entities/moonbit-llm-code-generation-no-resource-languages-ieee-2026.md`

# MoonBit与无资源语言代码生成：IEEE论文评估与改进

> **Background**：本文基于量子位对 IEEE TSE 接收论文《No Resource, No Benchmarks, No Problem? Evaluating and Improving LLMs for Code Generation in No-Resource Languages》的报道。论文由瑞士 USI Software Institute 和西班牙塞维利亚大学联合完成，系统评估了大模型在 MoonBit、Gleam 等无资源语言上的代码生成能力，并提出了系统性教学路径。

## 核心发现

论文将编程语言分为三类：高资源语言（Python、Java）、低资源语言（R、Lua、Haskell、Julia、Racket）和无资源语言（MoonBit、Gleam）。核心发现：大模型在新语言上**零样本表现极差**，但可以通过系统方法显著提升。

### 零样本 vs 增强方法

| 方法 | MoonBit HumanEval | MoonBit MBPP | MoonBit McEval-Hard |
|------|:---:|:---:|:---:|
| 零样本 | 接近 0% | 接近 0% | 0-1% |
| Few-shot | 有限提升 | 有限提升 | — |
| RAG | 比 few-shot 略差 | — | — |
| **继续预训练 (1370M tokens)** | **41.62%** | **44.76%** | **25.86%** |
| **Instruction Transferring** | **50.71%** | **53.04%** | **32.60%** |

实验基于 Qwen 2.5 Coder 32B base model。

## 方法论

### 基准构建

论文构建了三个代码生成 benchmark：HumanEval、MBPP 和 McEval-Hard，全部翻译到 MoonBit 和 Gleam，使用 pass@1 作为评价指标。

### Few-shot 与 RAG 尝试

- **Few-shot**：在 prompt 中放入几个 MoonBit 代码示例，让模型模仿。在 MoonBit 的 12 组比较中 few-shot 有 8 组优于 RAG。
- **RAG**：从 MoonBit 文档中检索相关内容放入 prompt。论文推测，模型从代码示例中抓语法比从文档片段理解规则更直接。
- **两者上限明显**：临时塞入 prompt 只能补语法知识，难以让模型真正掌握语言。

### 继续预训练 (Continued Pre-training)

用 MoonBit 真实代码和官方文档继续训练模型：
- 训练数据：约 1310 万 code tokens + 60 万 documentation tokens = 约 **1370 万 tokens**
- 对比：可用于 fine-tuning 的 MoonBit 数据仅约 50 万 tokens
- 效果：MoonBit HumanEval 从接近 0 提升到 41.62%

### Instruction Transferring（指令迁移）

两步法：
1. 先用 MoonBit 代码和文档让 base model 学会 MoonBit 语法
2. 再将 instruct model 的"指令跟随能力"迁移到已学 MoonBit 的模型上

结果：HumanEval 50.71%，MBPP 53.04%，McEval-Hard 32.60% — 论文中最强的 MoonBit 结果。

## MoonBit 的 AI-Native 语言设计

MoonBit 定位为面向云和边缘计算的 AI-native 编程语言，支持 wasm、wasm-gc、js 和 native 后端。其语言设计对 AI 编程有利：

- **Flattened design**：明确区分 toplevel 和 local definitions，toplevel 强制类型签名，减少嵌套
- **KV-cache friendly**：减少嵌套有利于 RAG、decoder correction、backtrack 等场景下的模型推理效率
- **工具链反馈**：语言设计越清晰，工具链反馈越完整，AI 编程循环越容易自动化

## 意义与观察

1. **新语言不是只能等待大模型自然覆盖** — 通过高质量代码、文档、benchmark 和训练方法，可以主动构建模型的编程能力。
2. **AI 时代编程语言评估新维度** — 除了性能、语法、类型系统、生态外，还需考虑"模型是否容易学会这门语言"。
3. **论文提供了可执行路径**：构建 benchmark → 知道模型哪里不会 → 用真实代码和文档继续训练 → instruction transferring。

## 相关概念

- [代码生成评估](https://github.com/QianJinGuo/wiki/blob/main/concepts/code-generation-evaluation.md)
- [微调技术](https://github.com/QianJinGuo/wiki/blob/main/concepts/fine-tuning-techniques.md)
- [Prompt 工程模式](https://github.com/QianJinGuo/wiki/blob/main/concepts/prompt-engineering-patterns.md)
- [RAG 检索增强生成](https://github.com/QianJinGuo/wiki/blob/main/concepts/rag-retrieval-augmented-generation.md)
- [DeepSeek Code Harness](../ch09/090-deepseek-code-harness.html)

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/moonbit-llm-code-generation-no-resource-languages-ieee-2026.md)

---

