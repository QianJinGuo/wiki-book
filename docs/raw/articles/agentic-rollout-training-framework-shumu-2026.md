---
source_url: https://mp.weixin.qq.com/s/o4V3mn2vjn9h7kjUmlnccw
ingested: 2026-07-28
sha256: ad34a402b319e9e93304029956efae3c2d870ce092e54c8b74462936074ba25c
source_published: 2026-07-28
title: "从LLM Rollout到Agentic Rollout！Agentic RL训练框架设计中的一些总结和思考"
author: 水木SH (知乎)
feed_name: 大模型智能
---

# 从 LLM Rollout 到 Agentic Rollout

大模型智能｜分享

来源 | 知乎
作者 | 水木SH

前言：前段时间支持了团队的Agentic RL训练工作，在框架开发过程中碰到诸多问题，有了一些新的思考，在此进行记录。

## 01 从 LLM Rollout 到 Agentic Rollout

强化学习（RL）训练通常在数据生成和模型更新两个阶段交替进行。首先，Rollout模块按照当前策略执行任务，生成输出或交互轨迹，并对结果进行奖励评估。随后，训练模块利用生成的数据更新模型参数，并将更新后的参数同步回Rollout，用于生成下一轮训练数据，从而形成完整的训练闭环。

对Reasoning时代的 LLM RL来说，一次 Rollout 是单轮的：系统向模型发送 prompt，获得 response输出，计算奖励。

对Agentic RL来说，情况则更加复杂。以Codex代码修复为例，Agent需要读取仓库文件、分析错误、修改代码、测试验证。为了完成这些步骤，它需要多次调用模型，并通过工具调用执行文件操作、运行命令和依赖安装等。因此，Agent的执行过程需要进行多轮模型调用和工具交互。这要求 Rollout 模块不仅能够提供模型推理，还需要管理 Agent 及其运行环境，并采集执行过程中产生的多轮模型轨迹。

## 02 耦合式架构

早期实现 Agentic RL 最直接的方式，是在 Rollout 模块中显式实现 Agent Loop，以模拟真实 Agent 框架的执行过程。整个 Agent Loop 都由 Rollout 模块驱动，模型输入、模型输出、工具调用可以在执行过程中被直接记录。

**优点**：Agent 行为容易控制和调试，训练轨迹易于采集。

**缺点**：难以扩展（不同 Agent 使用不同 harness，需要重复适配），黑盒 Agent 不适配（claude code 不开源，无法模拟内部逻辑）。

## 03 解耦式架构

解耦式架构让 Agent 保持原生运行，Rollout 系统不再实现具体的 Agent Loop 逻辑，而是从外部管理 Agent 的生命周期，并在 Agent 与模型之间的通信链路上采集交互轨迹。

三个核心组件：
- **Controller**：负责 Rollout 任务的统一编排
- **Runtime Manager**：负责 Agent 的运行时管理（创建隔离环境、启动/停止 Agent、回收产物）
- **Gateway**：负责轨迹采集（位于 Agent 和 LLM Server 之间，充当 LLM Server 的代理服务）

一次完整 Agentic Rollout 分三个阶段：
1. **资源创建与初始化**：Session 创建、沙盒准备
2. **Agent 执行与轨迹采集**：Agent 通过 Gateway 访问 LLM Server，Gateway 记录完整交互轨迹
3. **结果汇总与资源释放**：回收执行结果 + Trajectory，生成训练样本，释放资源

## 04 Gateway 设计细节

### 协议归一化
不同 Agent 框架使用不同 API 协议（OpenAI Chat Completions、OpenAI Responses、Anthropic Messages）。Gateway 入口增加 Adapter 将不同协议统一转换为 OpenAI Chat Completions 格式作为标准格式。

响应阶段：Gateway 向 LLM Server 采用非流式转发，但对仅支持流式的 Agent 框架（如 Codex CLI），Adapter 将完整结果重新封装为 SSE 事件流返回。

### 请求场景分类
Gateway 接收的请求不一定都来自主 Agent Loop，还可能来自上下文压缩、SubAgent 调用、会话摘要、心跳检测等。不同场景的训练价值不同，需要差异化处理。

### 轨迹重建
Agent 执行过程中，消息历史可能发生压缩（上下文超窗口时），导致前后请求的消息序列不再连续。Gateway 通过前缀匹配判断是否属于同一次执行：若当前序列以前一轮完整序列为前缀则追加，否则另存为新轨迹。但需注意部分 Agent 框架会脱敏/注入额外内容，导致严格字符串匹配失效，需要 case-by-case 放宽条件。

### Token 一致性
仅保存 message 数组不够，需同时保存对应的 token id 序列。原因：(1) tokenize/decode 不一定可逆（如"苹果"可能被重新编码为不同 token id），影响 Prefix Cache 复用；(2) token id 不一致影响训练稳定性，log probability 等数据与 token 位置绑定，错位会导致梯度信号不可靠。

在 Gateway 中进行 tokenize 和 detokenize 操作。Agent 不需要 reasoning content 执行工具，但 thinking 过程对训练有价值，仍保留在 token id 序列中。

## 05 Runtime Manager 设计细节

### 抽象分层
两个独立抽象维度：
- **Agent Harness**：描述如何准备、启动和解析某一种 Agent（CodexHarness / ClaudeCodeHarness / HermesHarness）
- **Sandbox Backend**：描述如何创建和操作某一种运行环境（E2BBackend / DockerBackend / LocalBackend）

由 Runtime Manager 组合编排。

### Hook 机制
在 Agent 生命周期中提供标准化扩展点（before_run / after_run / on_error），将附加能力拆分为独立可插拔的 Hook，按配置顺序依次执行。

## 06 Controller 设计细节

负责接收任务、协调执行顺序：
- **任务编排**：创建独立上下文（Session、沙盒），任务之间相互隔离
- **流程协调**：依次协调 Session 创建、环境准备、Agent 启动、轨迹回收和样本生成
- **异常处理与结果汇总**：异常时终止并释放资源；正常时汇总执行结果 + 轨迹 + Reward，生成训练样本

## 07 扩展性设计

**Gateway 扩展**：将不同 Session 分配给不同 Gateway 进程实例，分散 CPU 压力（tokenize/detokenize 等密集任务）；同一 Session 始终由同一 Gateway 管理以保证轨迹一致性。

**Runtime Manager 扩展**：高并发场景下 E2B SDK 在并发超 1000 时出现超时和不稳定。将 Runtime Manager 扩展到多个进程，分散 E2B SDK 并发压力。

## 参考框架

- verl：https://github.com/verl-project/verl
- slime：https://github.com/THUDM/slime
- ProRL-Agent-Server：https://github.com/NVIDIA-NeMo/ProRL-Agent-Server
- openclaw：https://github.com/openclaw/openclaw
- hermes-agent：https://github.com/nousresearch/hermes-agent
- codex：https://github.com/openai/codex
- learn-claude-code：https://github.com/shareAI-lab/learn-claude-code
