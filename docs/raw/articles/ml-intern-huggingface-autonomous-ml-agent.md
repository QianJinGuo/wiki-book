---
title: "ml intern huggingface autonomous ml agent"
source_url: https://github.com/huggingface/ml-intern
author: "Hugging Face (Aksel Joonas Reedi, Henri Bonamy, Yoan Di Cosmo, Leandro von Werra, Lewis Tunstall)"
published: 2026-04
ingested: 2026-05-07
sha256: da60fa1d
github: https://github.com/huggingface/ml-intern
license: Apache 2.0
framework: smolagents (27K+ Stars)
type: raw
created: 2026-05-10
updated: 2026-05-10
tags: [github]
---
# ml-intern: Hugging Face 开源自主 ML 工程代理
> 项目: https://github.com/huggingface/ml-intern
> 框架: https://github.com/huggingface/smolagents (27K+ Stars)
> Spaces: https://huggingface.co/spaces/smolagents/ml-intern
> License: Apache 2.0
## 项目定位
ml-intern 是 Hugging Face 于 2026 年 4 月开源的自主 ML 工程代理（Autonomous ML Agent）。**给它一个训练目标，它会自主完成从文献调研到模型发布的完整 ML 工作流。**
基于 Hugging Face 自家的 smolagents 框架构建，深度集成 HF 生态：Hub 仓库、数据集、文档系统、云计算（HF Jobs）以及实验追踪工具 Trackio。
## 核心工作循环（三阶段工作流）
1. **Research（研究）**：爬取 arXiv / HF Papers → 阅读论文方法章节 → 遍历引用图谱
2. **Plan & Validate（规划与验证）**：拆解任务 → 搜索 HF Hub 上的数据集 → 检查数据质量与可用算力
3. **Implement（实现）**：编写训练脚本 → 通过 HF Jobs 提交到 GPU 集群 → 读取评估结果 → 诊断失败 → 自动重训直到性能提升
不是一次性执行，而是持续闭环迭代。
## 核心架构
- **submission loop**：主循环驱动所有操作
- **Context Manager**：自动压缩上下文至 ~170k tokens
- **ToolRouter**：HF 文档/研究、GitHub 代码搜索、沙箱工具、规划、MCP 服务器
- **Doom Loop 检测器**：防止 Agent 陷入死循环
- **Session 追踪**：自动上传到 HF 私有数据集，可用 HF Agent Trace Viewer 浏览
## Benchmark
在 PostTrainBench（图宾根大学 & 马克斯·普朗克研究所）上测试——单张 H100 GPU / 10 小时内对基础模型完成后训练：
| 对比方 | GPQA 得分 |
|--------|----------|
| Qwen3-1.7B 基线 | ~10% |
| Claude Code | 22.99% |
| **ml-intern（Qwen3-1.7B）** | **32%** |
| PostTrainBench SOTA (Gemma-3-4B) | 33% |
## 实战案例
### 合成数据生成（医疗领域）
评估 HF Hub 医疗数据集质量 → 自动生成高质量合成数据 → 上采样 → HealthBench 评估
### 自主 RLHF（数学推理）
搜索数学指令数据 → 编写 GRPO 训练脚本 → A100 GPU 训练监控 reward 曲线 → 消融实验 → 确定最终 checkpoint
## 安装与使用
- uv sync && uv tool install -e .
- CLI: ml-intern（交互）或 ml-intern --prompt "xxx"（Headless）
- 支持模型：Anthropic, OpenAI, 本地 (Ollama/vLLM/LLama.cpp), HF 路由 (MiniMax/Kimi/GLM/DeepSeek)
- 支持 Slack Web API 通知
## smolagents 框架（基础）
仓库: https://github.com/huggingface/smolagents（27K+ Stars, Apache 2.0）
核心特性：
- 极简设计：agents.py < 1,000 行
- CodeAgent：动作写成 Python 代码，比 JSON/text 减少 30% 步骤
- 模型无关：HF InferenceClient, LiteLLM, OpenAI, Azure, Bedrock, transformers
- 沙箱执行：E2B, Blaxel, Modal, Docker, Pyodide+Deno
- 工具无关：MCP 服务器、LangChain 工具、Hub Space 工具
- CLI: smolagent（通用）和 webagent（网页 Agent）