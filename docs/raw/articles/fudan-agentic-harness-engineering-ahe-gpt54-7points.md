---
title: "全球排名前三，复旦自进化Harness Engineering让GPT-5.4再涨7个点"
source: "https://mp.weixin.qq.com/s/ObREWAzbx9znsfuz1r4ZuQ"
tags: [harness-engineering, 复旦, ahe]
created: 2026-05-20
sha256: a6a2d39b22488dc088f2b3e9d55692b650b3e4ca2d1509691c2f82981793321c
---
---
# 全球排名前三，复旦自进化Harness Engineering让GPT‑5.4再涨7个点
**来源:** 机器之心
**URL:** https://mp.weixin.qq.com/s/ObREWAzbx9znsfuz1r4ZuQ
**日期:** 2026年5月20日
**标签:** #HarnessEngineering #AHE #自动化优化 #复旦 #北京大学
---
## 核心问题
Harness Engineering 迭代依赖人工经验，但模型以月为单位进化、任务场景往长尾分布发展——如何让 Harness 自动从经验中学习并改进？
## 核心方案：Agentic Harness Engineering (AHE)
**团队：** 复旦大学、北京大学、上海奇绩智峰
**论文：** arxiv.org/abs/2604.25850
**代码：** github.com/china-qijizhifeng/agentic-Harness-engineering
**三角色：**
- **Coding Agent**：运行测试
- **Agent Debugger**：整理轨迹
- **Evolve Agent**：修改 Harness 实现进化
**可观测体系三部分：**
| 层级 | 组件 | 说明 |
|------|------|------|
| 组件可观测性 | NexAU | 七种正交文件级组件（System Prompt、Tool Description、Tool Implementation、Middleware、Skill、Sub-agent Config、Long-term Memory），Git 版本管理 |
| 经验可观测性 | Agent Debugger | 10M token raw trace → 10K token 概览报告（分层提炼流水线） |
| 决策可观测性 | Evolve Agent | 证据驱动修改，每次修改附带"变更清单"（失败证据 + 推断根因 + 修改方案 + 自我预测） |
## 关键实验结果
| 指标 | 数值 |
|------|------|
| GPT-5.4 Terminal-Bench 2 提升 | 69.7 → **77.0**（+7.3点，相对+10.5%）|
| vs OpenAI Codex-CLI | 71.9%（AHE 更高）|
| 全球排名 | **第三** |
| 跨模型泛化（GPT-5.4 演化 Harness 直接迁移）| Qwen-3.6-Plus/Gemini-3.1-Flash/DeepSeek-V4：+5.1 ~ +10.1 点 |
| 跨任务泛化 | SWE-Bench Verified 上比 ACE 和 TF-GRPO 更高成功率 |
## 关键洞察
**"事实比策略更可迁移"**
消融实验结果：
- **Memory 单独就能恢复全局增幅的 95% 以上**
- Tool 在中等难度题目上提升显著
- **System Prompt 单独迁移反而导致性能下降**
原因：Prompt 的语义是"策略性的"（你应该这样做），而 Memory 和 Tool 的语义是"事实性的"（这里有一段可复用代码）。事实比策略迁移性好。
**人工先验的陷阱：**
- 仅在 30 道 hard 题目上演化 → 反复震荡（16-20），因为 Evolve Agent 写针对性 hack
- 加入"Safety/Creativity/Generality"原则指导 → 曲线在 75.3% 早早触顶，因为人工行为先验成了进化的僵化之源
- 最终方案：删除所有行为指导，只保留证据驱动过程要求和回滚规则
**最终修改分布：** middleware 37% + tool 48% + prompt 10%
## 启示
> 当模型足够强，搭建一个结构化的、可观测的演化环境，比直接开发 Harness 更重要。
无需替 Agent 思考方法论——给它一个清晰的 workspace、明确的修改接口和高质量的反馈信号，Evolve Agent 的行为便自动向真实工程师收敛。
## 相关概念
- [[HarnessEngineering]] — Harness Engineering 基本概念
- [[AgenticHarnessEngineering]] — AHE 框架
- [[MemoryInAgent]] — Memory 是事实性载体，比策略性 Prompt 更可迁移