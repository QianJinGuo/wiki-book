# Superpowers 深度解析：给 Claude Code 装上工程大脑

## Ch05.073 Superpowers 深度解析：给 Claude Code 装上工程大脑

> 📊 Level ⭐⭐ | 4.7KB | `entities/superpowers-claude-code-engineering-brain-baidu-geek.md`

> 原文归档：[原文归档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/superpowers-claude-code-engineering-brain-baidu-geek.md)

17000+ 字深度解析 Claude Code Superpowers：14 技能拆解、brainstorming SKILL.md 源码解析、概率操控技巧、querit.ai 真实案例复盘、负向收益诚实评估。百度Geek说/奔跑的脆皮肠。

## 一句话

**大模型=能力，Superpowers=纪律，你=方向。14 Skill 强制"澄清→设计→规划→执行→验证"五阶段流程，概率操控让"正确行为"从 20%→80%。**

## 三大原罪

1. **回答随机性** — 模型是概率预测器，每次采样都是"掷骰子"
2. **直觉快思考** — 只有快思考没有慢思考。认知负荷理论：拆成"每次只想一件事"
3. **注意力稀释** — 长上下文注意力衰减。《清单革命》：术前清单使并发症死亡率降 47%

## brainstorming SKILL.md 关键设计

- **强制触发**："You MUST use this before any creative work" → 触发概率 20%→80%
- **单问题约束**：One question per message（5 个问题→概率分布指数增长；1 个→聚焦高质量）
- **多方案探索**：Propose 2-3 different approaches with trade-offs
- **YAGNI ruthlessly**：硬编码做减法
- **输出物规范**：写入 `docs/plans/YYYY-MM-DD-<topic>-design.md` + git commit
- **链式调用**：→ using-git-worktrees → writing-plans

## 概率操控四技巧

1. **强制词汇**：MUST/NEVER → 概率分布大幅偏移
2. **结构模板**：具体数字作锚点（1, 2-3, 200-300）
3. **状态锁定**：强制文件输出持久化对话状态，防止概率漂移
4. **链式调用**：显式指定下一个 Skill，形成确定性状态机

## 作者 Jesse Vincent (obra)

30 年开源老兵。方法论来自"2000 年代初通过 IRC 远程指挥 MIT 实习生"——管理 AI = 管理初级程序员。Cialdini《影响力》说服原则对 LLM 有效。

## 项目热度

0→170k Stars（2025.10→2026.05），Anthropic 官方市场第三方安装量第一（近 30 万次）

## 负向收益（7 项诚实评估）

1. 简单任务流程开销 > 收益
2. 创意性任务约束扼杀灵感
3. Skills 注入提示词浪费上下文窗口
4. 过度工程化（YAGNI 讽刺：流程本身制造复杂度）
5. 学习曲线
6. 团队协作摩擦
7. 安全感陷阱（流程规范 ≠ 结果正确）

**核心警示**：提高下限，不保证上限

## 后悔成本决策

- 低后悔成本（改文案/修样式）→ 裸跑
- 中后悔成本（新功能/重构）→ 部分流程
- 高后悔成本（支付/安全/核心逻辑）→ 全流程

## 相关实体

- [Harness Engineering](ch05/092-harness-engineering.md)
- [Claude Code Skills Superpowers 实践](../ch01/508-claude-code-skills-superpowers.md)
- [AI Coding Agent Token 成本控制](../ch09/047-coding-agent.md)
- [Skill 版本对比五大原则](../ch04/262-skill.md)

---

