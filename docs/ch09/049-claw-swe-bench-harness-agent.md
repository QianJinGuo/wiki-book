# Claw-SWE-Bench：首个独立测量Harness对编程Agent影响的基准

## Ch09.049 Claw-SWE-Bench：首个独立测量Harness对编程Agent影响的基准

> 📊 Level ⭐⭐ | 11.4KB | `entities/claw-swe-bench-harness-evaluation-benchmark-tokenrhythm.md`

## 核心贡献

Claw-SWE-Bench 是由基元律动（TokenRhythm，创始人王云鹤，原华为诺亚方舟实验室主任）联合无问芯穹、清华大学、北京大学、SEE 基金等机构发布的编程 Agent 评测基准，**首次让 harness 作为可独立测量的变量加以控制**。

核心创新点：

1. **Claw for Coding 适配器** — 首次让 OpenClaw 这类通用 Agent 能够进入 SWE-bench 评分流程，通过 adapter 层将通用 Agent 交互转换为可评分的 diff patch
2. **多语言覆盖** — 8 种编程语言、43 个真实代码仓库、350 个 GitHub issue 修复任务
3. **成本透明** — 强制所有系统在统一 prompt、预算和评分流程下汇报 API 总成本
4. **Lite-80 轻量版** — 8 种语言各 10 个实例，成本为 full-350 的 22.9%，Pass@1 偏差仅 0.4 个百分点

## 适配器设计

OpenClaw 式通用 Agent 无法原生进入 SWE-bench 评分流程的原因有三：

- SWE-bench 需要干净、可复现的 Docker 工作区，通用 Agent 依赖自己的运行环境
- SWE-bench 只读取 `model_patch` 字段，通用 Agent 输出格式不匹配
- 通用 Agent 的缓存/元数据/会话文件会污染 git diff

**适配器解决方案**：Agent 在 `/testbed` 工作区里真实编辑仓库文件，运行结束后 runner 从 Git 状态中导出代码补丁。不同 harness 通过统一接口接入评测流程。

**Bare adapter vs Full adapter 对照**（底座模型 GLM 5.1）：
- Bare adapter（最小集成）：Pass@1 = 19.1%，patch 应用失败率 69.1%
- Full adapter（工具编辑仓库）：Pass@1 = 73.4%，应用失败率 < 1.5%

## 横扫实验关键发现

### 固定 harness（OpenClaw），换模型

| 模型 | Pass@1 | 总成本 |
|------|--------|--------|
| GPT 5.5 | 78.0% | $1,399 |
| Claude Opus 4.7 | 77.1% | $1,082 |
| GLM 5.1 | 73.4% | $277 |
| DeepSeek-V4 Pro | 71.7% | $81 |
| DeepSeek-V4 Flash | 70.3% | $8.2 |
| Qwen 3.6-flash | 66.0% | $71 |
| Seed 2.0-mini | 48.6% | — |

**关键发现**：同样是七成左右的解决率，成本可以差出两个数量级（DeepSeek-V4 Flash $8.2 vs GPT 5.5 $1,399）。

### 固定模型，换 harness

| Harness | GLM 5.1 Pass@1 | Qwen 3.6-flash Pass@1 |
|---------|----------------|----------------------|
| OpenClaw | 73.4% | 66.0% |
| Hermes-agent | — | — |
| ZeroClaw | — | 58.3% |
| GenericAgent | — | 38.6% |
| Nanobot | — | — |

在 GLM 5.1 上五个 harness 差距达 **12.5 个百分点**，在 Qwen 3.6-flash 上差距扩大到 **27.4 个百分点**。同一个模型换一套 harness，结果能相差一个模型档位甚至更多。

## 答案泄露修复

在构建多语言任务集时发现 SWE-bench-Multilingual 部分实例中 `base_commit` 之后的 Git 历史仍然可见，Agent 可通过 `git log` 看到未来的修复提交。清理后：

- Claude Opus 4.7：84.7% → 76.7%（-8.0pp）
- Kimi 2.6：-5.0pp
- Qwen 3.6-flash：-2.0pp

已向上游提交修复 PR。

## 资源链接

- 论文：https://arxiv.org/pdf/2606.12344v1
- GitHub：https://github.com/opensquilla/claw-swe-bench
- Hugging Face：https://huggingface.co/datasets/TokenRhythm/Claw-SWE-Bench

## 深度分析

**1. Harness 是可独立测量的第一类变量**

传统评测把模型、harness、任务集打包成一个不可分割的黑箱，Claw-SWE-Bench 的核心贡献是首次将 harness 列为可独立操控的变量加以控制。固定任务集和模型后，harness 之间的差距在 GLM 5.1 上达 12.5pp，在 Qwen 3.6-flash 上扩大至 27.4pp——这说明在编程 Agent 领域，harness 的工程设计本身就是一种核心竞争力，而非可有可无的包装层。

**2. 适配器本身是能力释放的一部分，而非纯接口转换**

Bare adapter（最小集成，直接让 OpenClaw 在最终回复中输出 unified diff 文本）Pass@1 仅为 19.1%，应用失败率高达 69.1%。Full adapter（强制通过工具编辑仓库文件，由 runner 从 Git 状态导出补丁）则将 Pass@1 提升至 73.4%，应用失败率降至 1.5% 以下。同一模型、同一个 OpenClaw harness，54pp 的差距完全来自 adapter 层的实现方式——这说明适配器不是中立的"翻译层"，而是 agent 能力的真实组成部分。

**3. 唯分数论掩盖了成本效率这个关键维度**

SWE-bench 分数只报告 Pass@1，DeepSeek-V4 Flash（70.3%，$8.2）和 GPT 5.5（78.0%，$1,399）在单一指标下看似可比，但背后成本相差约 170 倍。Pareto 前沿图将成本和准确率同时可视化，才真正揭示了「什么组合在预算约束下最值得选用」这个问题。真实研发不是一次性冲榜，而是在成本和准确率之间反复权衡。

**4. 基准的完整性并非理所当然——Git 历史泄露案例**

在构建 Claw-SWE-Bench 过程中发现 SWE-bench-Multilingual 存在答案泄露：部分实例中 `base_commit` 之后的 Git 历史仍然可见，Agent 可通过 `git log` 窥见未来的修复提交。清理后 9 个模型在 300 个 Multilingual 实例上的 Pass@1 全部下降，Claude Opus 4.7 下降最多达 8pp。这提醒我们：benchmark 的公平性需要持续审计，任何看似客观的数字背后都可能藏有系统性偏差。

**5. 多语言覆盖打破了 Python 中心主义的评测盲区**

SWE-bench 长期以 Python 为绝对主力，而 Claw-SWE-Bench 的 350 个实例中有 300 个非 Python 实例（Java、Go、Rust、JS/TS、C/C++、Ruby、PHP）。这一多语言视角揭示了一个关键问题：Python 编程能力并不能泛化代表其他语言的 agent 能力，语言间的工具链差异、构建系统差异和类型系统差异都会显著影响评测结论。

## 实践启示

**1. 评测报告必须包含 API 总成本，而不只是 Pass@1**

单一 Pass@1 数字无法支撑真实决策。同等准确率下成本可能相差两个数量级，而成本直接影响可持续的迭代频率。未来的编程 Agent 评测规范应强制要求汇报完整运行成本，让横向比较真正有意义。 [Harness Engineering](https://github.com/QianJinGuo/wiki/blob/main/entities/harness-engineering-framework.md)

**2. 使用 Lite-80 进行高频迭代，full-350 用于正式汇报**

Lite-80 的成本约为 full-350 的 22.9%，在 17 个校准列上两者 Pass@1 偏差仅 0.4pp。对于学术团队、开源社区和资源有限的小团队，Lite-80 是日常 prompt 调整、模型替换和回归测试的务实选择；full-350 则保留给正式论文和技术报告。 [Harness Engineering 7 Layers](https://github.com/QianJinGuo/wiki/blob/main/entities/harness-engineering-7-layers-openclaw-hermes-claude-code-p1aNu.md)

**3. 在设计 agent 评测方案时，将适配器层视为 first-class component**

适配器的设计质量直接影响 agent 在基准上的表现。Full adapter 强制 agent 通过工具真实编辑仓库文件而非在最终回复中写 diff，这一设计选择将 19.1% 变成了 73.4%。在搭建任何新的编程 agent 评测流程时，接口层（适配器）的设计应作为核心工程问题而非事后补丁来处理。

**4. 标准化评测协议是隔离 harness 效应的前提**

Claw-SWE-Bench 在外层固定了 prompt 模板、任务集、Docker 运行环境、超时预算（3600 秒），使得不同 harness 之间的 Pass@1 差异可以真正归因到 harness 自身的内部实现。在内部评测中复现这一思路——控制住所有外部变量——才能真正识别出是模型强了还是 harness 优化了。 [Agent Eval 框架](https://github.com/QianJinGuo/wiki/blob/main/entities/agent-eval-wallezhang-yaml-driven-agent-evaluation-framework.md)

**5. 定期审计 benchmark 的数据完整性，防止答案泄露破坏公平性**

Git 历史泄露问题在被发现前存在于 SWE-bench-Multilingual 的生产数据中，且没有任何一个模型在清理后出现分数上升——说明这个漏洞在清理前可能普遍被利用。任何依赖 benchmark 进行模型选型和 agent 评估的团队，都应建立定期的数据完整性检查流程，确保 base_commit 之后的敏感历史已被清除。

## 相关实体

- [Harness Engineering](https://github.com/QianJinGuo/wiki/blob/main/entities/harness-engineering.md)
- [Coding Harness 工程本质](https://github.com/QianJinGuo/wiki/blob/main/entities/pi-openclaw-coding-harness.md)
- [复旦北大 AHE Agentic Harness Engineering](https://github.com/QianJinGuo/wiki/blob/main/entities/fudan-peking-ahe-agentic-harness-engineering.md)
- [OpenClaw Agent Loop Design Patterns](https://github.com/QianJinGuo/wiki/blob/main/entities/openclaw-agent-loop-design-patterns.md)
- [Harness Engineering 7 Layers](https://github.com/QianJinGuo/wiki/blob/main/entities/harness-engineering-7-layers-openclaw-hermes-claude-code-p1aNu.md)
- [Agent Eval 框架](https://github.com/QianJinGuo/wiki/blob/main/entities/agent-eval-wallezhang-yaml-driven-agent-evaluation-framework.md)
- [AI Agent 评测实战：5 维指标体系 + L1/L2/L3 准出分级](https://github.com/QianJinGuo/wiki/blob/main/entities/ai-coding-practice-agent-evaluation-five-dimension-three-level-gating.md)
- [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/claw-swe-bench-harness-evaluation-benchmark-tokenrhythm.md)
- [MOC](https://github.com/QianJinGuo/wiki/blob/main/moc/evaluation-and-benchmarks.md)

---

