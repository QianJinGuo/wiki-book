# Autoresearch: AI Agent-Driven Algorithmic Development (File Compression Experiment)

## Ch04.599 Autoresearch: AI Agent-Driven Algorithmic Development (File Compression Experiment)

> 📊 Level ⭐⭐ | 3.1KB | `entities/autoresearch-agent-algorithmic-development-file-compression-2026.md`

# Autoresearch: AI Agent-Driven Algorithmic Development (File Compression Experiment)

> **Background**: This entity documents Elliot Smith's Autoresearch experiment, where Claude Code was used autonomously to develop a file compression algorithm over 10 iterations. The work is in the tradition of Karpathy's "Autoresearch" concept — using AI agents to autonomously explore and solve constrained engineering problems.

## 实验设计

Smith 选择了文件压缩作为测试问题，因为其目标函数简单（文件体积越小越好）且约束明确（位完美往返 + 压缩/解压不超过 300 秒）。使用 Claude Code (Sonnet 4.6) 默认设置，Rust 语言（类型系统自动强制执行签名约束）。

实验基础设施：
- 压缩/解压函数桩（零压缩 baseline）
- 单元测试（字符串 + 简单文件的往返验证）
- Benchmark 脚本：从公共领域收集视频/音频/文本/随机数据样本
- 300 秒超时保护（防无限循环）
- 每次迭代前清除 Claude context → 自动生成 plan → 接受后让 agent 自主运行

## 结果

10 次迭代跨 ~2 周运行（主要受 Claude Code 额度限制）。最终结果：

- 相比基线压缩率提升 **34%**
- 最佳迭代组合了 LZ4 风格字典编码 + bit-packing 层
- 对比生产工具：达到 zstd 压缩率的 68%，但解压速度快 2x
- 所有代码开源：github.com/smitec/agent-compression

## 方法论意义

这个实验的核心价值在于展示了 AI agent 可以在几乎无人工干预的情况下，自主开发一个有实际意义的算法解决方案。与传统的基于梯度的 ML 优化不同，agent 通过代码修改和实验测试来搜索设计空间。

Smith 的基本方法是：提供一个带约束的工程问题框架（类型签名 + 测试 + 基准），让 agent 自主迭代改进。这与 `loop-engineering` 中的"开发循环"范式一致——但这里的 agent 是编码者而非辅助工具。

## 与同类工作的关系

- 与 [Headroom](https://github.com/QianJinGuo/wiki/blob/main/entities/headroom-context-compression-cache-stabilization.md) 不同：Headroom 关注 LLM 上下文压缩，这里关注通用数据压缩
- 与 `loop-engineering` 模式相关：agent 自主迭代改进的自动化循环
- 与 Karpathy 的 Autoresearch 概念一脉相承：让 Agent 自主进行端到端研究

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/autoresearch-claude-constrained-optimization-elliotcsmith-2026.md)

---

