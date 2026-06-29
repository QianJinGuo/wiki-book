# Netflix 分层通知系统：Thinking Fast & Slow 的 Slow-Fast RL 架构

## Ch11.240 Netflix 分层通知系统：Thinking Fast & Slow 的 Slow-Fast RL 架构

> 📊 Level ⭐⭐⭐ | 2.3KB | `entities/netflix-notification-slow-fast-hierarchical-rl.md`

## Netflix 分层通知系统：Thinking Fast & Slow 的 Slow-Fast RL 架构

Netflix 将 Kahneman 的"快慢思维"理论应用于通知系统设计，构建了 **Slow Policy + Fast Policy** 的分层 RL 架构。Slow 层做周级频率规划，Fast 层做实时消息选择，解决了短期 engagement 与长期用户健康的矛盾。

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/thinking-fast-slow-for-a-personalized-notification-system.md)

## 核心问题

| 问题 | 旧系统 | 新系统 |
|------|--------|--------|
| 奖励视野 | 短期（单消息即时行为） | 长期（周级用户留存） |
| 频率控制 | 隐式（阈值校准） | 显式（Slow Policy 个性化规划） |
| 排序与节奏 | 耦合（同一决策规则） | 解耦（分层决策） |

## Slow-Fast 分层架构

### Slow Policy（System 2）
- **输入**：成员长期参与模式
- **输出**：周级 Pacing Plan Action（Push 频率 × Email 频率 ≈ O(100) 种组合）
- **目标函数**：`U(member, action) = Σ wₖ·Reward_k - Cost(action)`
  - 正信号：用户参与平台的可能性
  - 负信号：疲劳/退订倾向
- **Universal Message Cost**：防止退化为"always send"策略的额外成本项

### Fast Policy（System 1）
- **输入**：Slow Policy 的 pacing 约束 + 当前发送机会
- **输出**：选择最优消息
- **目标**：在 pacing 约束内最大化即时相关性

## Pacing 策略

- **Uniform Random**：将频率目标转为每次机会的发送概率，加权抛硬币
- **非均匀扩展**：星期几模式、用户活跃度条件、发布对齐突发

## 关键设计洞察

1. **频率与质量解耦**：旧系统中调整频率阈值会改变消息质量分布，新系统完全解耦
2. **稀疏负反馈处理**：显式负反馈极稀疏，需要 universal cost 项保持奖励函数凹性
3. **周级视野**：关键指标（观看习惯、退订风险）只在长时间尺度显现

---
