---
title: "从手动到自动化：用AgentEval构建Agent评测体系"
url: https://mp.weixin.qq.com/s/_4Ekt7Zhs4e8NzfOWGy0mg
author: WalleZhang
source: WalleZhang
date: 2026-03-21
created: 2026-05-19
type: raw
tags: [agent, evaluation, testing, benchmark, agentic-ai, golang, yaml]
review_value: 7.5
review_confidence: 8.5
sha256: 8b5e2a1c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f
---
# 从手动到自动化：用AgentEval构建Agent评测体系
> 来源：WalleZhang，2026-03-21
> GitHub：https://github.com/wallezhang/agent-eval | 官网：https://agent-eval.walleeva.space
## 核心问题
Claude/Agent 评测的核心痛点：
- **非确定性**：同一 prompt 跑两次结果可能不同
- **传播效应**：改一个词可能导致整个行为链路变化，且不可预测
- **上游波动**：模型本身升级，Agent 表现可能波动
传统测试金字塔（单元→集成→E2E）覆盖不了 Agent 的核心质量问题。
> "Teams without evals get bogged down in reactive loops — fixing one failure, creating another." — Anthropic
## pass@k 和 pass^k 指标
- **pass@k**：k 次里至少有一次通过的概率（能力上限）
- **pass^k**：k 次全部通过的概率（可靠性）
两者一起看才有意义。可靠性指标（pass^k）是评估 Agent 稳定性的关键。
## 评分器体系
|| 类型 | 适用场景 |
||------|---------|
| `exact_match` | 有标准答案的知识问答 |
| `contains` | 检查关键词是否出现 |
| `regex` | 有格式要求的任务 |
| `command` | 能跑测试脚本的场景 |
| `llm` | 开放式问答主观评分 |
| `constraint` | 合规检查（must_match/must_not_match） |
多评分器可组合，通过 `weight` 控制权重，最终分数是加权平均，但通过条件是 AND——两个评分器都得通过。
## CI/CD 集成
```bash
# PR 合并前只跑核心用例
agent-eval run -c eval.yaml --tags core --fail-under 0.9
# 日常回归跑全量
agent-eval run -c eval.yaml --fail-under 0.8
# 安全审查单独跑
agent-eval run -c eval.yaml --tags safety --fail-under 1.0
```
`--fail-under` 通过率低于阈值返回退出码 1，阻断流水线。
## 缓存机制
```yaml
cache:
  enabled: true
  dir: .cache/
  ttl: 24h
```
缓存 key 是 (Agent 类型 + Agent 配置 + 任务输入) 的 SHA256 哈希。调评分规则时只重跑评分，不调 API。
## A/B 对比
```bash
agent-eval run -c eval.yaml  # 基线 run ID: eefc2b36
agent-eval run -c eval.yaml  # 新 run ID: b3c4d5e6
agent-eval compare eefc2b36 b3c4d5e6  # 支持 ID 前缀匹配
```
## 扩展机制
Agent 接口（两个方法）：
```go
type Agent interface {
    Execute(ctx context.Context, input model.TaskInput) (*model.AgentOutput, error)
    Close() error
}
```
Grader 接口（两个方法）：
```go
type Grader interface {
    Grade(ctx context.Context, input GradeInput) (*model.GradeResult, error)
    Type() string
}
```
## 实现细节
- **pass@k 计算**：对数空间计算，组合数在 n 大时会溢出，用 log 空间算术避免精度问题
- **SQLite**：纯 Go 实现（modernc.org/sqlite），不需要 CGO，交叉编译方便
- **缓存透明**：Agent 被 CachedAgent 包裹，缓存命中时 metadata 里加 `cache_hit: true` 标记
- **Hook 失败非致命**：生命周期 Hook 执行失败只打 warning 日志，不终止评测
## 路线图
- 动态多轮交互评测（LLM 扮演用户动态追问）
- 可视化 Dashboard（看历史趋势的交互式面板）
- 国内主流模型 API 适配
- 评测集市场（客服、代码生成、信息提取标准评测集）
- 分布式执行
## 安装
```bash
curl -fsSL https://raw.githubusercontent.com/wallezhang/agent-eval/main/install.sh | bash
agent-eval init my-eval
cd my-eval
agent-eval run -c eval.yaml
```