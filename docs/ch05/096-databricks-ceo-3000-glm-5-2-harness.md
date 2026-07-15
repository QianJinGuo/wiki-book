# Databricks CEO用3000名程序员真实任务测试GLM 5.2 — Harness选择比模型更重要

## Ch05.096 Databricks CEO用3000名程序员真实任务测试GLM 5.2 — Harness选择比模型更重要

> 📊 Level ⭐⭐ | 3.7KB | `entities/databricks-glm-52-3000-engineer-benchmark-coding-agent.md`

# Databricks CEO用3000名程序员真实任务测试GLM 5.2 — Harness选择比模型更重要

2026年7月，Databricks 联合创始人兼 CEO Ali Ghodsi 率领团队，基于公司3000多名工程师的真实 Pull Request，做了一次大规模编码 Agent 基准测试，覆盖多家模型和编码框架的实际表现。测试结果揭示了一个核心发现：**调用模型的框架（Harness）选择，对成本和质量的综合影响不亚于模型本身的选型**。

## 测试方法论

测试基于 Databricks 真实业务代码库（含 Scala、Go、Rust、Java、Bazel 等多种语言和工具链），从最近的 Pull Request 中抽取出包含独立测试的任务，经过人工校准后构建基准测试集。团队利用 Unity AI Gateway 收集了所有编码交互日志以分析任务复杂度分布。

为防止 AI 代理利用 Git 历史作弊，测试期间对 Git 历史进行了隔离。评估不依赖 LLM 裁判，而是依靠客观的测试通过情况判定结果。

## 核心发现

### 1. GLM 5.2 逼近 Opus 4.8，开源模型迎来突破

测试中，GLM 5.2 成功跻身顶级能力梯队，在质量上与 Opus 4.8 基本持平，但单次任务成本仅1.28美元（Opus 4.8为1.94美元）。团队已着手将开源模型部署为日常开发主力。

### 2. Token 单价 ≠ 任务成本

开发者通常通过对比 Token 单价估算 AI 费用，但测试表明这种估算经常失真。例如 Sonnet 5 的 Token 单价比 Opus 4.8 便宜约1.7倍，但实际单次任务成本为2.09美元（Opus 4.8仅为1.94美元），且完成率还低6个百分点。原因在于 Sonnet 5 需要更多轮次尝试，多消耗了1.9倍的 Token。

### 3. Harness 对效率的决定性影响

即使调用完全相同的模型，使用不同框架（如 Claude Code/Codex vs Pi）时，任务成本可能产生两倍以上的差距，而质量保持一致。Pi 框架每次交互发送的上下文减少约三倍，通过更紧凑的工作集管理上下文，用更少轮次完成任务。

### 4. 模型分类呈现能力梯队

测试显示模型和框架可清晰划分为三个能力梯队。开发团队决定将更多日常工作分流给 Haiku 和 GPT 5.4 Mini 级别的模型，避免盲目使用高价模型。

## Omnigent 智能路由

基于测试结论，Databricks 开发了 Omnigent 调度系统，可在模型和框架之上按任务灵活切换不同组合，实现智能路由。该系统计划通过 Unity AI Gateway 集成，根据任务类型自动推荐最合适的模型和框架组合。

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/databricks-glm-52-3000-engineer-benchmark-coding-agent.md)

> 参见 [AMD跑GLM 5.2成本只要英伟达一半](https://github.com/QianJinGuo/wiki/blob/main/entities/amd跑glm-52成本只要英伟达一半.md) 从不同角度报告 GLM 5.2 推理成本。

---

