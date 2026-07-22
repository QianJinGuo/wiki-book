---
source_url: "https://mp.weixin.qq.com/s/6G3q32_RNxf5CMZ_kdeSkw"
source_title: "Lilian Weng：Harness才是模型自我迭代的现实起点和关键，而不是直接重写权重"
source_author: "AI寒武纪"
ingested: 2026-07-08
sha256: "dcca14b7872303354bc4b939ce566afef9ff9bf7de92507857cb53249dd7ae36"
type: raw-source
status: ingested
tags: [harness-engineering, rsi, lilian-weng, self-harness, evolutionary-search, meta-harness]
---

# Lilian Weng：Harness才是模型自我迭代的现实起点和关键，而不是直接重写权重

> AI寒武纪对 Lilian Weng 博客 Harness Engineering for Self-Improvement 的解读。
> 博客原文：https://lilianweng.github.io/posts/2026-07-04-harness/

## Harness 系统设计的三大模式

早期智能体框架关注 LLM+记忆+工具+规划。Harness 工程引入工作流设计、评估机制、权限控制以及持久化状态管理，整体设计更接近操作系统和运行时软件系统。

### 模式一：工作流自动化
构建让大模型自主运行、测试和迭代的工作流。典型流程：规划→执行→观察与测试→改进→重复。AI 分析自身运行轨迹和失败案例，通过智能体运行时系统迭代进度，不依赖静态提示词。

### 模式二：文件系统作为持久化记忆
长周期任务中，日志、代码修改、轨迹迅速超出上下文窗口。Harness 将持久化状态存入文件系统，模型通过 Bash 命令读写。随基础模型代码能力提升，基于文件系统的记忆管理自然享受模型能力红利。

### 模式三：子智能体与后台任务
派生多个子智能体并发执行任务，主智能体通过进程管理器启动、检查、取消和合并。并行过程文件化、日志化，确保中断后仍能恢复推理。

## 优化路径补充细节

### Meta-Harness
深入到代码层面，直接优化决定信息存储、检索和呈现方式的代码。Harness 候选方案全部以代码库+分数+运行轨迹保存在文件系统，由编码智能体自主读取和迭代。

### STOP（Self-learning Optimizer）
早期递归 Harness 改进尝试。通过自我改进更新，在下游任务中提升优化器自身表现。实验中发现优化器自主发现了遗传算法、多臂提示词老虎机、模拟退火等策略。在 GPT-4 上有效，但在较弱模型上效果下降——基础模型智能依然是核心。

### AlphaEvolve
编码智能体进化搜索系统，通过修改代码块发现更好的算法解决方案。

### SIA（Joint Optimization）
联合优化 Harness 与模型权重。包含元智能体、任务特定智能体和反馈智能体。反馈智能体根据近期轨迹决定更新 Harness 还是更新权重。但在训练稳定性和防止奖励作弊上仍面临重大挑战。

## 六类常见失效模式

AI Scientist 等系统在实际运行中容易遇到的失效模式：
1. 倾向使用训练数据中的陈旧默认配置
2. 执行压力下将复杂设计退化为简单实现
3. 长周期项目中丢失关键细节
4. 过度乐观并宣布虚假成功
5. 缺乏领域内默会知识
6. 缺乏判断研究价值的科学品味
