# LLaMA.cpp Deployment

## Ch11.288 LLaMA.cpp Deployment

> 📊 Level ⭐⭐ | 3.6KB | `entities/llama-cpp-deployment.md`

# LLaMA.cpp Deployment

## 概述

LLaMA.cpp 是一个高性能的 C/C++ 推理引擎，用于在本地部署 LLaMA 系列大语言模型。它支持 CPU/GPU 混合推理、量化（GGUF 格式）、以及多平台部署（Linux/macOS/Windows）。在 Agent 工程中，LLaMA.cpp 常用于搭建本地推理服务，降低 API 调用成本，同时保证数据隐私。关键部署考量包括：量化级别选择（Q4_K_M/Q5_K_M/Q8_0）、内存占用优化、并发请求处理（通过 server 模式）、以及与 OpenAI 兼容 API 的集成。

## 主要内容

- 量化格式选择 (GGUF)
- CPU/GPU 混合推理
- Server 模式部署
- 并发与性能调优
- 与 Agent 框架集成

## 深度分析

### GGUF 量化是本地推理的"精度-成本"主开关

LLaMA.cpp 的性能与资源占用主要由 GGUF 量化级别决定：Q4_K_M 是吞吐/质量平衡的默认选择，Q8_0 更接近原模型精度但内存需求更高，Q2/Q3 则面向内存受限场景。部署前应基于目标模型参数量、可用内存与延迟预算做矩阵测算——量化级别的选择往往比推理引擎本身的优化对端到端体验影响更大。

### 本地推理的战略价值是隐私与成本，而非绝对性能

相比云端 GPU 服务，LLaMA.cpp 在消费级硬件上的吞吐并不占优，其核心价值在于两条：一是数据不出本机，满足隐私与合规约束；二是按次调用的边际成本趋近于零，适合高频率、低单次价值的调用（如批量文档处理、本地代码补全）。部署决策应先问"这个负载是否必须上云"，再谈优化。

### Server 模式的并发模型决定接入方式

LLaMA.cpp 的 `server` 模式暴露 OpenAI 兼容的 HTTP API，是接入 Agent 框架的标准路径。但单实例并发能力有限，且推理是 CPU/GPU 密集型——高并发场景需要前置队列或横向多实例，否则请求排队时延会掩盖模型本身的推理速度。对 Agent 场景，需区分"单请求大上下文"与"多请求小上下文"两类负载分别设计。

### CPU/GPU 混合推理是硬件的弹性利用

支持将部分层卸载到 GPU、其余留在 CPU 的混合模式，让部署可以贴合实际硬件（如 Mac 的统一内存架构、仅有少量显存的机器）。这要求部署脚本能按层分配设备，并理解内存带宽才是本地推理的真正瓶颈——对多数消费级 CPU 而言，模型能否装入内存比浮点算力更关键。

## 实践启示

1. 先用 Q4_K_M 起步跑通链路，再根据质量反馈决定是否升到 Q8_0 或降到更低量化
2. 按"模型大小 + 可用内存 + 延迟预算"做量化矩阵测算，避免拍脑袋选级别
3. 通过 OpenAI 兼容 API 接入 Agent 框架，保留未来切换云端服务的能力
4. 高并发场景前置请求队列，或按负载类型拆分多个 server 实例
5. 将本地推理用于隐私敏感或高频低价值负载，把云资源留给高价值请求

## 相关概念

- 与 Agent 推理优化、模型部署、成本控制等领域密切相关
- 参见 [Harness Engineering](https://github.com/QianJinGuo/wiki/blob/main/concepts/harness-engineering-framework.md) 中的推理基础设施部分
- 参见 [Quantization Techniques](https://github.com/QianJinGuo/wiki/blob/main/entities/quantization-techniques.md) 的量化方法体系
- 参见 [LLaMA.cpp 部署 Qwen3.6 实测](https://github.com/QianJinGuo/wiki/blob/main/entities/mtp-加速推理最佳实践在亚马逊云科技中国区使用-llamacpp-部署-qwen36-的实测指南.md) 的实测数据
- 参见 [Minimal CLI Agent](ch03/035-agent.html) 的本地模型集成示例

---

