---
source_url: "https://mp.weixin.qq.com/s/DSMMP9sA5ngHh0nRoBwfIg"
ingested: 2026-06-26
sha256: a2e893017a10a8f6
---

# AI-Infra-Auto-Driven-SKILLS v0.1.0：给 Codex / Claude Code 的推理框架工作流

> **来源**：GiantPandaLLM，2026年5月26日，BBuf
> **仓库**：https://github.com/BBuf/AI-Infra-Auto-Driven-SKILLS（400+ stars）
> **背景**：GiantPandaCV 整理推理框架开发中的流程约束为 SKILL.md，供 Codex / Claude Code 按步骤执行

## 一句话

BBuf 在 GiantPandaLLM 发文介绍 AI-Infra-Auto-Driven-SKILLS v0.1.0——将推理框架开发中的 benchmark、profile、debug、源码修改等流程整理成 SKILL.md，供 Codex / Claude Code 按步骤执行，让 Agent 在 AI Infra 工作中遵循工程纪律。

## 核心价值

**问题**：推理框架性能优化不适合直接从现象进入源码修改。可复现流程包括：
1. 确认 benchmark 是否公平
2. 区分 prefill/decode
3. 检查 kernel timeline
4. 查询历史 PR
5. 做小范围源码改动
6. 回到同一组 workload 复测

**任何一步缺失，后续结论都不可靠**。

AI-Infra-Auto-Driven-SKILLS 将这些流程整理成 Agent 可执行的 skill，保留人工检查入口——工程判断由人完成，skill 负责自动化重复步骤、记录中间证据、维持跨轮状态。

## v0.1.0 包含的 10 个 Core Skills

| Skill | 解决的问题 |
|-------|------------|
| **llm-serving-auto-benchmark** | 对 SGLang、vLLM、TensorRT-LLM 或其他 OpenAI-compatible server 做公平的 serving benchmark 搜索 |
| **llm-serving-capacity-planner** | 从 SGLang/vLLM 启动日志看 GPU memory、KV cache、request capacity 和 OOM pressure |
| **llm-torch-profiler-analysis** | 读 torch profiler trace，输出 kernel、overlap、fuse opportunity 三张表，prefill/decode 分开 |
| **llm-pipeline-analysis** | 继续往 forward、layer、kernel timeline 下钻，找代表层、anchor kernel 和 Perfetto 时间范围 |
| **model-compute-simulation** | 根据模型结构估算 operator shapes、FLOPs、MFU，把 kernel 和 op 对起来看 |
| **sglang-humanize-review** | 使用 2024-2025 SGLang human review 语料做代码审查，覆盖正确性、测试、性能和维护性问题 |
| **sglang-sota-humanize-loop** | 输入模型和硬件预算，让 SGLang 在固定 workload/SLA 下追平或超过当前可复现的最优 competitor |
| **vllm-sota-humanize-loop** | 同上，目标框架换成 vLLM |
| **sglang-prod-incident-triage** | 线上 serving 出现 queue growth、timeout、wrong output、crash、hang 时，先提取 replay，再决定 debug 步骤 |
| **model-architecture-diagram** | 找 DeepSeek、GLM、Qwen、Kimi、MiniMax、Step、Hunyuan、Qwen3-VL 等模型的公开原始架构图 |

另外还有 **model-pr-optimization-history**：保存模型优化 PR 的本地知识记录，SOTA loop 修改源码前会先查询，确认目标模型家族已有的相关 PR、修改文件、验证风险和可复用思路。

## 两个 SOTA Loop

**SOTA Humanize Loop**：
1. 输入模型和硬件预算
2. 搜索 benchmark 找到可复现的 competitor
3. Profile 定位瓶颈
4. 提出优化方案并小范围修改源码
5. 回到同一 workload 复测
6. 提 PR（如需）

**prompt 包含的约束**：
- 开始前查询相关 open PR
- workspace 必须干净
- benchmark/profile 前记录 GPU 状态
- 资源不足时等待或停止
- 只清理当前模型 cache，不清理共享 cache
- 需要提 PR 时只推到允许的 fork
- 每个优化 PR 都写明 benchmark 和 GSM8K/MMLU 精度表

## 目录结构

```
AI-Infra-Auto-Driven-SKILLS/
├── skills/
│   ├── llm-serving-auto-benchmark/
│   ├── llm-torch-profiler-analysis/
│   ├── llm-pipeline-analysis/
│   ├── model-compute-simulation/
│   ├── llm-serving-capacity-planner/
│   ├── sglang-humanize-review/
│   ├── sglang-sota-humanize-loop/
│   ├── vllm-sota-humanize-loop/
│   ├── sglang-prod-incident-triage/
│   ├── model-architecture-diagram/
│   └── model-pr-optimization-history/
```

## 安装使用

```bash
git clone --branch v0.1.0 https://github.com/BBuf/AI-Infra-Auto-Driven-SKILLS.git
cd AI-Infra-Auto-Driven-SKILLS

# Codex
mkdir -p "${CODEX_HOME:-$HOME/.codex}/skills"
ln -s "$PWD/skills/llm-serving-auto-benchmark" "${CODEX_HOME:-$HOME/.codex}/skills/llm-serving-auto-benchmark"
ln -s "$PWD/skills/llm-torch-profiler-analysis" "${CODEX_HOME:-$HOME/.codex}/skills/llm-torch-profiler-analysis"
# ... 其他 skills

# Claude Code
mkdir -p "$HOME/.claude/skills"
ln -s "$PWD/skills/llm-serving-auto-benchmark" "$HOME/.claude/skills/llm-serving-auto-benchmark"
ln -s "$PWD/skills/llm-torch-profiler-analysis" "$HOME/.claude/skills/llm-torch-profiler-analysis"
# ... 其他 skills
```

## 一句话总结

AI Infra 工作流正在被编码成可执行的 skill artifact——让 Agent 在推理框架优化中遵循工程纪律，而不是凭直觉进入源码修改。

---

*仓库：https://github.com/BBuf/AI-Infra-Auto-Driven-SKILLS*
