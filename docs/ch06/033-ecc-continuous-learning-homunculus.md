# ECC Continuous Learning：从工具调用轨迹到本能沉淀的持续学习闭环（homunculus 观察式本能提取）

> 📊 Level ⭐⭐ | 6.6KB | `entities/ecc-continuous-learning-homunculus-observation-instinct-aliexpress-2026.md`

# ECC Continuous Learning：从工具调用轨迹到本能沉淀的持续学习闭环

## 一句话总结

ECC（Everything Claude Code）的 continuous-learning 模块实现了**「homunculus 观察式本能提取」**：后台用 Hook 静默采集 Agent 每次工具调用的真实轨迹，从执行流中自动识别「用户纠正 / 错误修复 / 重复工作流 / 工具偏好」四类反复出现的行为模式，沉淀成带**触发条件 + 置信度 + 作用域**的「本能」文件，再通过聚类进化（evolve）与跨项目提升（promote）注入上下文，让 Agent 在**不改模型权重、不写手写规则**的前提下，仅靠上下文层闭环长出属于自己的「肌肉记忆」。

## 为什么它是独立维度（与既有自演化/技能进化机制的区别）

与已有的技能自演化机制相比，homunculus 的核心差异化在于**学习信号的来源与粒度**：
- 既有机制（如 SkillOpt 的文档可训练、skill-self-evolution 的训练式进化）多在**模型/技能文档层面**优化，需要预先定义训练目标或验证集。
- homunculus 则在**执行轨迹层面**做无监督观察——只关心「Agent 实际做了什么」，不要求用户预先声明偏好，从零散的 tool_start/tool_complete 事件流里归纳模式，产出的不是参数或文档，而是**带触发条件和置信度的可注入本能**。

这一「观察执行轨迹 → 提炼本能 → 注入上下文」的闭环，在全库已有实体中零覆盖，构成不可替代的新维度。

## 核心机制

### 四段闭环
1. **项目初始化**：Hook 配置（PreToolUse/PostToolUse 全工具匹配）+ 项目身份识别（按项目隔离数据）+ 进程守护（懒启动 + 30 分钟空闲自动回收）
2. **行为采集**：行为采集器把工具调用变成结构化观察记录（含敏感信息 `[REDACTED]`），追加写 observations.jsonl，攒够量发 SIGUSR1 信号
3. **模式识别**：两种唤醒（信号 + 定时）+ 多层门禁（ANALYZING 锁 / 60s 冷却 / guardian 三层门禁）+ 四类待识别模式 + 非交互式 LLM 子进程（采样 500 条，递归熔断）
4. **本能积累与管理**：本能文件落盘 + instinct-cli 生命周期（status/import/export/evolve/promote/projects）

### 四类待识别模式
| 模式 | 触发特征 | 产出本能 |
|------|---------|---------|
| 用户纠正 | 刚 Edit 完紧接着又改成别的样子；报错后重试 | "做 X 时优先用 Y" |
| 错误修复 | tool_complete 报错 → 随后工具改好 → 再次成功 | "遇到错误 X，试试 Y" |
| 重复工作流 | 同一串工具序列反复出现 | "做 X 时按 Y→Z→W 步骤" |
| 工具偏好 | 工具选择规律 | "需要 X 时用工具 Y" |

### 本能文件的工程化设计
- **置信度**：按频次定初值（3-5 次=0.5 / 6-10 次=0.7 / 11+ 次=0.85），随时间 -0.02 每周衰减
- **作用域**：project vs global，拿不准默认 project 避免污染全局
- **触发条件 trigger**：本身就是「适用场景」的自然语言描述，可直接向量化做按需检索注入

## 上游发现 + 下游固化的分工

持续学习在上游负责**发现**（从行为数据捞无意识经验），记忆系统在下游负责**固化与加载**（借 Agent 原生静态记忆/自动记忆机制把验证过的本能注入上下文），形成「观察 → 提炼 → 沉淀 → 注入 → 产生新行为 → 再观察」的全自动闭环。这一「发现-固化」分工视角是对 Agent 记忆系统架构的补充。

## 应用

- **沉淀个人隐形工作习惯**：固化无意识的探索顺序、试错路径与工具偏好
- **上下文成本优化**：量化「哪些弯路最烧 token」，把最贵的弯路固化成本能后测算 token 消耗与步数下降
- **业务规则浮现**：从反复调用序列提炼业务约束
- **good case 评测基线**：高置信本能成功轨迹作 good case、反之 bad case，构建回归评测基线

## 相关概念
- [Skill 工程原则](https://github.com/QianJinGuo/wiki/blob/main/concepts/skill-engineering-principles.md)
- [技能自演化三种路径](../ch04/349-skill.html)
- [Memento 自演化 Agent](../ch04/503-memento-skills-agent.html)
- [SkillOpt 技能文档训练](../ch05/033-skillopt.html)
- [原文存档](https://github.com/QianJinGuo/wiki-book/tree/main/docs/raw/articles/ecc-continuous-learning-homunculus-observation-instinct-aliexpress-2026-08-21.md)

→ [原文存档](https://github.com/QianJinGuo/wiki-book/tree/main/docs/raw/articles/ecc-continuous-learning-homunculus-observation-instinct-aliexpress-2026-08-21.md)

---

