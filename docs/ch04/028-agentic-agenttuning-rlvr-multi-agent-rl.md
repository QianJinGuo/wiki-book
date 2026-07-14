# 淘宝直播数字人 Agentic 架构升级：AgentTuning + RLVR + Multi-Agent RL

## Ch04.028 淘宝直播数字人 Agentic 架构升级：AgentTuning + RLVR + Multi-Agent RL

> 📊 Level ⭐ | 2.3KB | `entities/taobao-digital-human-agentic-architecture.md`

# 淘宝直播数字人 Agentic 架构升级

> 淘天集团直播 AIGC 团队将数字人互动从静态 Workflow 升级为动态 Agentic 架构，融合 AgentTuning 蒸馏、RLVR 和 Multi-Agent RL。

## 原 Workflow 三大瓶颈

1. **灵活性差**：新增 1 个意图需 2 个月迭代，FAQ 利用率不足 2%
2. **上下文感知弱**：无法联动多源信息，误判无法反思
3. **并发调度缺失**：无法处理高频多弹幕并发

## 架构升级

- **感知域**：单维度匹配 → 全局上下文感知（弹幕+历史+商品信息融合）
- **决策域**：单次分类 → 多次按需工具调用与自我纠错
- **执行域**：单意图话术 → 多模态响应

## 模型优化

### AgentTuning 蒸馏
千亿参数教师采样完整 trajectory，蒸馏至两个 Qwen3-30B-A3B 小模型（工具调用 + 回复生成），剔除思考序列，单次调用 0.3s。

### RLVR
对回复模型进行 GRPO 强化学习，优化事实正确性和帮助性。**端到端延迟降至 1.79 秒**，多轮对话用户比例提升 2.76%。

## Multi-Agent RL（核心贡献）

将工具调用模型与回复模型分为两个 Agent，使用不同奖励在线协同优化：

| 模型 | 奖励 |
|------|------|
| 工具调用模型 | 规则遵守 + 工具调用合理性 |
| 回复模型 | 事实正确性 + 帮助性 |

- 回复模型 vs SFT：正确性 **+4.1pt**，帮助性 **+23.6pt**
- 工具调用合理性：**+18.2pt**
- 消融实验验证 Multi-Agent RL 优于固定工具模型仅 RLVR 回复模型

## 未来方向

从串行 MultiAgent 向并行 sub-agent/agent-swarm 演进；从 task-specific 训练向通用模型 + Skill 方式演进。

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/taobao-digital-human-agentic-rl-multiagent-rl.md)

---

