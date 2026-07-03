# How to Build an AI-Native Startup

## Ch04.498 How to Build an AI-Native Startup

> 📊 Level ⭐⭐ | 4.3KB | `entities/ai-native-startup-cyberfund-guide.md`

# How to Build an AI-Native Startup

## 深度分析

### 核心框架：AI 原生公司的操作系统

Stepan Gershuni 在 cyber.fund 发布的这篇创始人指南，提出了 AI 原生创业公司的核心操作系统：**Context·Agents·Evals·Skills**。与传统公司"雇更多人"的扩张模式不同，AI 原生公司的核心差异在于**学习速度**——每天快一点，几周后差距开始拉开，几个月后只有一家会活下来。

### 七步操作系统

1. **先画地图**：把公司重复发生的工作列出来（20-40 项），按自主程度分级。**频率胜过重要性**——高频工作才能积累足够样本优化评估系统。

2. **把记忆装进代码库**：Context 是「操作记忆库」——模型会换代，但那层提炼（"客户说再考虑考虑=价格太高"）是跟着公司走的。Anthropic MCP 将 context 从 15 万 token 压缩到 2000 token（↓98.7%）。**原始数据与提炼数据必须分离**。

3. **选最轻的那个**：脚本→AI辅助人工→工作流→智能体，用最轻工具处理当前工作。**Harness 六步**：预检→计划→审批→执行→验证→记录。**安全边界在代码层，不在提示词**。

4. **什么叫做对了**：Skills（可复用技能）+ Evals（评估系统）是引擎。没有 eval，每次迭代都是口味之争。核心指标是**接受率**（<70% → 不提升自主度）。

5. **创始人先上**：Jack Dorsey 在 Block 每天花几小时亲自使用工具后才决定重组。入职第一天就要有真实输出。**招聘测判断力，不测知识**。

6. **每周进化**：内环优化现有工作，外环探索新方向。**硬规则：智能体不能直接写生产**。真正瓶颈是"能否写出 eval"，不是模型能力。

7. **护城河**：评论者认为 Gershuni 漏掉了最根本的东西——判断什么值得编码是一种**无法被方法论覆盖的稀缺能力**。先跑起来的公司学习速度指数级领先。

### 关键洞察

- **频率 > 重要性**：低频工作无论多重要，样本量不够无法优化。C.H. Robinson 从全自主退回起草人审批的案例说明：量太大时单条错误路由代价被总量淹没。
- **Context 压缩**：同一模型，读了三个月提炼 context 的公司 vs 刚接 API 的公司，输出质量差距不是一个级别。
- **溯源是信任基础**：每个智能体总结必须能追溯到源头，没有溯源信任会崩溃。
- **Replit 教训**：提示词指令不是安全边界，只有代码层面限制才是。

### 护城河再思考

评论者的核心反驳：Gershuni 把问题框定为"执行纪律"，但真正的瓶颈是**自我认知诚实度**——创始人能否承认自己 80% 的时间在做 L3 的事。判断什么值得编码本身是稀缺能力。

如果 OS 真是护城河，先发公司的学习速度指数领先后来者。但历史上每次"指数差距不可逆"的论断最后都被范式跳跃打断。

## 实践启示

1. **从高频低风险工作开始自动化**——工单分类比董事会战略决策更适合优先自动化
2. **context 压缩优先**——先做提炼数据层（决策/反对意见/风险），不要让原始数据淹没智能体
3. **eval 先行**——在调提示词之前，先建立接受率评估体系
4. **安全边界写进代码**——生产删除权限、合并门槛必须在代码层实现
5. **创始人先用**——在会议室讲 PPT 之前，先在真实 context 下现场演示

## 相关实体
- [Agent Harness Architecture Design Production Guide](ch03/045-agent.md)
- [Schemaflow Openai Cookbook Staged Agentic Workflow](ch04/150-ai.md)
- [How To Build Audio Transcription Agent](ch04/407-how-to-build-audio-transcription-agent.md)
- [Gaode Ai Native 7X24 Pipeline Self Healing](ch04/150-ai.md)
- [Harness Engineering Comprehensive Guide Conardli](ch05/061-harness-engineering.md)

→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/ai-native-startup-cyberfund-2026.md)
- [how frontier teams are reinventing ai-native development](ch01/330-how-frontier-teams-are-reinventing-ai-native-development.md)
- [MOC](https://github.com/QianJinGuo/wiki/blob/main/moc/memory-context-systems.md)

---

