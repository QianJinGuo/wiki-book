---
title: "dataflow harness data pipeline agent pku 2026"
type: source
created: "2026-07-27"
updated: "2026-07-27"
sha256: "2a6d06ec08bf1f6558b2fb57c4878e8d67f19cbcb2fe894385a9b4caf266fb90"
source_url: "https://mp.weixin.qq.com/s/Gah00ChUSnHItOnDMO6jBQ"
---

# AI 数据最难搞的 Harness 工程，被北大开源了！— DataFlow-Harness

> 原文：[AI 数据最难搞的 Harness 工程，被北大开源了！](https://mp.weixin.qq.com/s/Gah00ChUSnHItOnDMO6jBQ)
> 作者：梁昊 · 北京大学 OpenDCAI 团队 / Datawhale
> 日期：2026-07-24
> 归档时间：2026-07-24
> 论文：https://huggingface.co/papers/2607.16617
> GitHub（WebUI）：https://github.com/OpenDCAI/DataFlow-WebUI
> GitHub（DataFlow 主库）：https://github.com/OpenDCAI/DataFlow

---

## 背景：NL2Pipeline Gap

当前准备 AI-ready 数据集的常见方式：工程师手搓脚本，或 Code Agent 生成一次性脚本后拼接。两种方式在流程复用、平台审计、可视化编辑和长期治理上存在明显短板。

论文提出核心概念 **NL2Pipeline gap**：用户表达的是自然语言工作流意图，而生产环境需要的是可检查、可编辑、可复用的平台原生流水线，二者之间存在鸿沟。

## DataFlow-Harness 架构设计

基于 DataFlow 开源生态，叠加 Harness 工程约束，让 Agent 在真实平台的边界内做数据处理，输出平台原生 Pipeline。

四个核心组件：

1. **Data Pipeline Backend** — 状态中心。一条 pipeline 表示为 `P = (D, O, E, S, R)`：数据源 D、算子实例 O、有向依赖边 E、字段 Schema S、运行状态 R
2. **MCP Tools Layer** — Agent 意图 → 结构化操作。Agent 通过 typed mutations 修改 pipeline（添加/删除算子、更新参数、连接节点），经过 Request-Validate-Commit 流程：获取状态 → 提交变更 → 检查 DAG 无环 + Schema 兼容 → 写入后端
3. **DataFlow-Skills** — 流程知识。编码算子选择模式、Schema 依赖关系、参数配置经验和流水线装配步骤
4. **DataFlow-WebUI** — 交互和可视化。对话模式 + DAG 画布拖拽两种操作模式，共享同一份 Pipeline 状态

## 实验效果

与 Vanilla Claude Code、Context-Aware Claude Code、MCP-only 三种方式对比：

**综合效果对比（12 个数据工程任务 × 120 次）**：
- 端到端通过率：93.3%（vs CC 94.2%）
- 成本：$0.261（vs CC $0.950，下降 **72.5%**）
- 生成延迟：95.5s（vs CC 190.7s，下降 **49.9%**）
- 输出产物：Native DAG（可编辑、可复用）

**Textbook-to-VQA 抽取**：
- Precision：0.972
- Coverage Rate：0.873

**Skills 贡献分析**：简单任务 MCP-only 已可完成（10/10），复杂任务（QA basic、QA with filter、Text-to-QA chain）MCP-only 仅 6/10，DataFlow-Harness 达 9-10/10。

**下游训练验证**：
- 数学推理（Qwen2.5-32B-Instruct）：DataFlow-Harness 合成数据训练平均分 51.6→55.7，AIME24@32 25.1→35.9
- 通用 SFT（Qwen2.5-7B-Base）：平均分 61.5→63.8，HumanEval 78.0→80.5，MBPP 64.6→75.4

## 作者信息

梁昊，北京大学大数据科学研究中心博士，主导 Data-Centric AI 系列开源项目（DataFlow、DataFlex、One-Eval 等）。

## References

- 论文：https://huggingface.co/papers/2607.16617
- DataFlow-WebUI：https://github.com/OpenDCAI/DataFlow-WebUI
- DataFlow 主库：https://github.com/OpenDCAI/DataFlow
- DataFlex：https://github.com/OpenDCAI/DataFlex
- One-Eval：https://github.com/OpenDCAI/One-Eval
- 北大 DCAI 团队：https://github.com/OpenDCAI
