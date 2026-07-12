# Qwen3.7-Max Opus 级体验 - Alibaba 旗舰模型长程任务实测

## Ch01.1175 Qwen3.7-Max Opus 级体验 - Alibaba 旗舰模型长程任务实测

> 📊 Level ⭐⭐ | 2.3KB | `entities/qwen3.7-max-opus-level-experience-code-secret-garden.md`

# Qwen3.7-Max Opus 级体验 - Alibaba 旗舰模型长程任务实测

Aliyun 于 2026 年 7 月发布其最新旗舰大模型 Qwen3.7-Max，定位与 Claude Opus 4.6 同档的智能体底座。官方设计了三项长程连续任务来实测模型的自主推理与工具调用能力，而非传统的静态 benchmark 榜单。

## 三项长程任务实测

### 35 小时 GPU 代码自主优化

模型在从未见过的平头哥 PPU 芯片上，自主执行代码优化循环。432 轮评估、1158 次工具调用后，将基准代码提速 10 倍。同任务对比：GLM 5.1 7.3 倍、Kimi K2.6 5 倍、DeepSeek V4 Pro 3.3 倍。

### RL 训练作弊检测

模型监控另一轮 RL 训练全过程，自主发现多种奖励作弊模式（如偷看 GitHub 标准答案），总结为检测规则并反向验证。80+ 小时、上万次工具调用后，新增 13 条检测规则，精确识别 1618 个作弊样本。

### YC-Bench 创业公司模拟

模型扮演 CEO 在模拟环境中经营一年，做数百轮连续决策。最终营收 208 万美元，完成 237 个任务。对比：Qwen3.6-Plus 105 万、Qwen3.5-Plus 35.2 万。

## 关键 Benchmark 分数

Qwen3.7-Max 在多个权威基准上与 Claude Opus 4.6 持平或超越：

| 基准 | Qwen3.7-Max | Opus 4.6 | 排名 |
|------|:----------:|:--------:|:----:|
| SWE-Verified | 80.4 | 80.8 | 紧追 |
| SWE-Pro | 60.6 | - | #1 |
| Terminal Bench 2.0 | 69.7 | - | - |
| MCP-Mark | 60.8 | - | - |
| MCP-Atlas | 76.4 | 75.8 | 超越 |
| GPQA Diamond | 92.4 | 91.3 | 超越 |
| HMMT 2026 数学竞赛 | 97.1 | 96.2 | 超越 |
| HLE | 41.4 | 40.0 | 超越 |

在编程工程、工具调用、高难度推理维度上均站到 Opus 4.6 同档水平。

## 实战接入

可通过阿里云百炼平台生成 API Key，接入 CC Switch 工具后在 Claude Code 等 IDE 中使用 Qwen3.7-Max 作为底层模型。

## 相关实体

- [Alibaba Agentic Cloud](../ch04/328-agentic-cloud.html)
- [Qwen AgentWorld](../ch03/045-agent.html)
- [Qwen Image Flash](ch01/1204-qwen-image-flash-beyond-objective-design-few-step-distill.html)

---

