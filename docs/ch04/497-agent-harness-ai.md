# Agent Harness 可观测性：生产级 AI 项目必须补上的一课

## Ch04.497 Agent Harness 可观测性：生产级 AI 项目必须补上的一课

> 📊 Level ⭐⭐ | 3.8KB | `entities/agent-harness-observability-production.md`

# Agent Harness 可观测性：生产级 AI 项目必须补上的一课

## 深度分析

本文来自"叶小钗"，分享开发 Mini-Openclaw Agent 时的可观测性实践。

**核心问题**：Agent 执行路径不确定（概率输出），传统三件套（指标/日志/链路追踪）不够用。

**AI Min > AI Max**：可观测性只在"能不用 AI 就不用 AI"模式下可行，关键在于知道错在哪、为什么错、怎么改。

**Agent 可观测性八大组件**：
1. **原始数据记录**：model_call/result、tool_call/result、anomaly、evaluation
2. **指标设计**：工具错误率、token消耗、调用耗时、压缩频率
3. **Trace调用树**：model_call_id + tool_call_id + delegation_id 关联父子关系
4. **决策归因**：system prompt 规范让模型在 reasoning 输出决策块（目标/候选/选择/原因/结果）
5. **任务状态机**：pending→planning→running→waiting_child→succeeded/failed/cancelled
6. **异常检测**：重复失败、空响应循环、迭代超限、压缩频繁
7. **评估**：用户反馈 + 启发式评估 + LLM-as-judge
8. **回放对比**：同 case 新配置重跑，对比两棵 Trace 调用树

**闭环**：发现问题 → 定位轨迹 → 修改配置 → 回放对比

## 实践启示

1. **Trace > 日志**：时间线日志需要靠猜，Trace 调用树靠 model_call_id/tool_call_id/delegation_id 字段直接关联
2. **决策归因的价值**：让模型自己输出选择原因，等同于大模型自我反思，正确率也会变高
3. **异常检测核心**：不是工具调用失败本身，而是连续失败不能收敛还在不停执行
4. **评估是优化闭环**：否则改完 prompt 只知道"好像顺了"，不知道错误率有没有降
5. **回放不是严格复现**：模型有随机性，回放只能做相似条件下的验证，用于判断优化方向

## 相关实体
- [Harness Engineered Business Agent Evaluation Aliyun Boyu](ch04/503-agent.md)
- [Code As Agent Harness Survey](ch09/046-code-as-agent-harness.md)
- [Cong 30 Fen Zhong Shou Gu Agent Dao Harness Cheng Wei Xin Hou Duan](ch04/503-agent.md)
- [从 30 分钟手搓 Agent到 Harness 成为新后端](ch04/503-agent.md)
- [Agent Harness Architecture](ch04/503-agent.md)

→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/agent-harness-observability-production.md)
- [perplexity computer empirical study: how ai agents reshape k](https://github.com/QianJinGuo/wiki/blob/main/entities/perplexity-computer-knowledge-work-empirical-study.md)
- [MOC](https://github.com/QianJinGuo/wiki/blob/main/moc/agent-engineering-guide.md)

---

