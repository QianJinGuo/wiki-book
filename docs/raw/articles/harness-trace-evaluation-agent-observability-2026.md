---
title: "重新学习Harness系列 7：Trace 与 Evaluation——Agent 可观测性、评测和持续改进的工程基础"
source_url: "https://mp.weixin.qq.com/s/FXylj19OA1CE1RMBzzECcw"
source_account: "AgenticCoding 实验室（Elara）"
source_type: "wechat"
ingested: "2026-08-27"
sha256: "ba547d5dfd3e595d562c5322a530c05d096fd4676bb2ba3b64002ea8195dbd92"
tags: [harness, trace, evaluation, observability, agent, telemetry, continuous-improvement, eval]
type: raw
---

# 重新学习Harness系列 7：Trace 与 Evaluation

> 来源：AgenticCoding 实验室（Elara）| 2026-08-27 入库 | v=6 c=5 v×c=30 Raw only

一句话结论：Trace 解决"Agent 到底做了什么、为什么这么做、哪里出错了"，Evaluation 解决"Agent 做得好不好、改动有没有变好、能不能上线"；**没有 Trace 的 Agent 不可调试，没有 Evaluation 的 Agent 不可迭代**。

## 为什么 Agent 特别需要 Trace/Evaluation
传统软件行为相对确定（输入固定→代码路径固定→输出基本固定）。Agent 系统每步都可能变：模型输出不稳定、Tool Call 参数可能错、Tool Result 过长/截断、上下文污染、Plan 漂移、停止条件过早/过晚、快慢模型调度选错路径、代码表面成功但测试失败。所以不能只看最终回答，必须能回答：它看到了什么/调用了什么工具/工具返回了什么/为什么继续/为什么停止/在哪一步偏了/这次改动比上版本好吗。

## 1. Trace 是什么
Trace 是 Agent 一次运行过程的完整轨迹记录（"飞行记录仪"），记录整个执行链路：用户输入 → 上下文构造 → 模型请求 → 模型响应 → Tool Call → Tool Result → 状态更新 → 停止判断 → 最终回答。Coding Agent 的 Trace 包括：用户任务/使用模型/system prompt 版本/tool schema 版本/repo context/每轮 LLM 输入输出/每次 read·grep·edit·shell/每次工具参数/工具返回/diff/测试结果/plan 更新/stop reason/token 用量/延迟/错误重试。

## 2. Trace 应记录什么（分级）
- **Run 级别**：run_id、session_id、user_id、task、started_at/ended_at、status（success/failed/blocked/cancelled）、stop_reason、model_policy、total_tokens、total_cost、total_tool_calls。
- **Step 级别**：step_id、type、model、input_context_ref、output_ref、tool_call（name/args）、tool_result_ref、latency_ms、tokens（input/output/cached_input）。可定位：哪步跑偏、哪个工具失败、哪次上下文太长、哪次过早停止、哪个 tool result 污染后续上下文。
- **Model Call 信息**：model name、prompt/context 引用、system prompt 版本、tool schema 版本、temperature、max_tokens、reasoning effort、response、tool calls、stop reason、token usage、cached token usage、latency、error/retry。生产环境未必能长期保存完整 prompt（隐私/代码）→ 完整原文短期保存 + 长期保存 hash/摘要/元数据。
- **Tool Call 信息**：tool_call_id、tool_name、args、args_hash、started_at/ended_at、success、result_ref、side_effect、approval_required/status。Coding Agent 特别重要：read 了哪些文件、edit 了哪些、产生什么 diff、shell 命令/exit code、是否高风险命令、是否经用户确认。
- **Context 信息**：记录上下文构造过程而非仅最终 prompt——context_id、blocks（name 等）。

## 3. Evaluation（评测）
（本系列第 7 篇聚焦 Trace 侧工程细节，Evaluation 部分强调评测是 Agent 迭代的闭环基础：评测解决"改动有没有变好、能不能上线"，与 Trace 互补构成可观测性与持续改进的工程底座。）

## 核心意义
Trace 让 Agent 从"不可调试"变"可调试"，Evaluation 让 Agent 从"不可迭代"变"可迭代"。二者是 Agent 可观测性、评测和持续改进的工程基础。传统软件靠确定性，Agent 靠 Trace+Eval 建立反馈闭环。
