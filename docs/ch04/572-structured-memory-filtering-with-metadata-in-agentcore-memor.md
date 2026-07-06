# Structured Memory Filtering with Metadata in AgentCore Memory

## Ch04.572 Structured Memory Filtering with Metadata in AgentCore Memory

> 📊 Level ⭐⭐ | 3.3KB | `entities/structured-memory-filtering-metadata-agentcore-memory.md`

# Structured Memory Filtering with Metadata in AgentCore Memory

Amazon Bedrock AgentCore Memory 的元数据过滤机制（metadata filtering）在命名空间隔离基础上叠加了细粒度属性过滤，使 Agent 从语义相似的噪声中精确检索所需信息。实测将长时记忆问答准确率从 40% 提升至 64%，对上下文依赖型问题（时间范围、优先级、部门）的准确率从 16% 提升至 69%。

## 核心机制

AgentCore Memory 通过三层生命周期管理元数据：配置（configuration）、存储（ingestion）、检索（retrieval），在短期记忆（short-term memory）和长期记忆（long-term memory）两个层级均生效。

### 命名空间 + 元数据双层架构

- **命名空间（Namespaces）**：逻辑隔离的"谁"维度，如 `clients/client-123/sessionABC` 或 `patients/patient-456`，确保多租户数据分离
- **元数据过滤（Metadata Filtering）**：在命名空间内部做"什么"维度的子分组，如类别、解决状态、日期、优先级、标签

### 元数据生命周期

1. **配置阶段**：通过 Memory Metadata Configuration API 定义过滤键（如 `type`, `department`, `priority`）
2. **存储阶段**：写入记忆时附加属性键值对，作用于短期和长期记忆
3. **检索阶段**：基于属性的过滤条件在语义搜索前执行，缩小搜索范围

## 实测效果

在一个基于 LoCoMo 风格多轮对话的 151 问题测试集上：

- **总体 QA 准确率**：40% → 64%（+24pp）
- **上下文依赖型问题**（时间范围、优先级、部门过滤）：16% → 69%（+53pp）

## 应用场景

### 多 Agent 架构

每个 Agent 使用独立的命名空间，内部按问题类型、部门、优先级分层过滤。一个 IT 支持 Agent 在处理网络故障时，先按 `type: networking` 过滤记忆，再搜索 `status: unresolved` 的关联工单。

### 多租户系统

命名空间保障租户隔离，元数据过滤在租户内部提供二级分组。每个租户的 Agent 可以按 `department`, `region`, `tier` 等业务维度精确检索。

## 现有覆盖

- `[Agent 记忆工程挑战 (AWS China)](ch01/216-0.md)` — AgentCore 记忆系统工程实践概述
- `[AgentCore Harness](ch05/009-harness.md)` — AgentCore 整体平台
- `[AI Agent Memory Systems](ch04/069-ai.md)` — Agent 记忆系统综述

→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/structured-memory-filtering-metadata-agentcore-memory.md)

---

