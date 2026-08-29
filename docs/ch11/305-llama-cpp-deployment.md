# LLaMA.cpp Deployment

> 📊 Level ⭐⭐ | 1.1KB | `entities/llama-cpp-deployment.md`

# LLaMA.cpp Deployment

## 概述

LLaMA.cpp 是一个高性能的 C/C++ 推理引擎，用于在本地部署 LLaMA 系列大语言模型。它支持 CPU/GPU 混合推理、量化（GGUF 格式）、以及多平台部署（Linux/macOS/Windows）。在 Agent 工程中，LLaMA.cpp 常用于搭建本地推理服务，降低 API 调用成本，同时保证数据隐私。关键部署考量包括：量化级别选择（Q4_K_M/Q5_K_M/Q8_0）、内存占用优化、并发请求处理（通过 server 模式）、以及与 OpenAI 兼容 API 的集成。

## 主要内容

- 量化格式选择 (GGUF)
- CPU/GPU 混合推理
- Server 模式部署
- 并发与性能调优
- 与 Agent 框架集成

## 相关概念

- 与 Agent 推理优化、模型部署、成本控制等领域密切相关
- 参见 [Harness Engineering](https://github.com/QianJinGuo/wiki/blob/main/concepts/harness-engineering-framework.md) 中的推理基础设施部分

---

