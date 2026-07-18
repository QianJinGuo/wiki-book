# Claude Code Loop 四档控制权：自检→目标→定时→工作域

## Ch09.156 Claude Code Loop 四档控制权：自检→目标→定时→工作域

> 📊 Level ⭐⭐ | 3.2KB | `entities/claude-code-loop-control-rights-four-levels.md`

# Claude Code Loop 四档控制权：自检→目标→定时→工作域

> 架构师（JiaGouX）对 Claude Code 官方四类 Loop 的深度解读：不沿命令清单走，沿**控制权**这条线看——每往前走一档，人就少盯一层，系统就多承担一层责任。

## 控制权升级四档

| 阶 | Loop 类型 | 交出什么 | 人还握住什么 | 失败半径 |
|---|-----------|---------|-------------|---------|
| 1 | **Turn-based** | 检查权 | 下一轮是否继续 | 当前修改，可回滚 |
| 2 | **Goal-based** | 继续/停止权 | 目标定义和预算边界 | 一轮尝试，有上限 |
| 3 | **Time-based** | 触发权 | 节奏、范围和生命周期 | 跨时间边界，可能空跑 |
| 4 | **Proactive** | 工作域处置权 | 权限、审计、升级和降级 | 跨工具、分支、PR、团队 |

## 核心工程原则

### 愿望句 vs 条件句
- **愿望句**：把判断留给模型（"帮我把页面优化一下"）
- **条件句**：把判断落到证据上（"首页 Lighthouse performance 提到 90 以上，最多尝试 5 次"）
- `/goal` 需要的是条件句

### 升级前先看失败半径
- 改错一段测试→可控。改错权限策略、生产配置、客户消息→性质完全不同
- **能降级，才敢升级**：跑不稳就从 proactive 降到 time-based；目标写不清就从 goal-based 降到 turn-based
- 证据越密，团队越敢让它多跑一层

### 渐进路线
1. **W1**：Turn-based（让 Agent 按 Skill 自检，区分"已修改"和"已验证"）
2. **W2**：加 `/goal`（逼团队把"完成"写清楚）
3. **W3**：Time-based（如每 20 分钟检查一次 PR 状态）
4. **W4+**：Proactive routine（补独立身份、最小权限、运行记录、成本上限、人工升级路径）

## 与既有实体的关系

- 与 [Agent vs Workflow 控制权连续谱](../ch04/639-agent-vs-workflow.html) 互补——前者讨论宏观的 Agent/Workflow 选型，本文是 Claude Code 具体实现的控制权分层
- 补充 [Loop Engineering](../ch05/007-loop-engineering.html) 中"停止条件"的设计——条件句 vs 愿望句可以作为停止条件设计的决策框架
- 与 [Claude Code Loop Engineering 完整攻略](ch09/132-claude-code-loop-engineering.html) 互补——前者从功能/命令角度，本文从控制权/工程约束角度
- 四档控制权的渐进路线与 腾讯 Token 优化 的"约束金字塔"理念一致
- **核心洞察**：最容易被忽略的能力是**及时降级**——工程上能降级，才敢升级

---

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/claude-code-loop-control-rights-four-levels.md)

---

