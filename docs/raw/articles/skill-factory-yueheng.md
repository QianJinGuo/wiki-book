---
title: "Skill Factory：三天手搓面向Harness设计的技能工厂"
sha256: 8dafd9bc505f8d6d9a272e6f0bebbffa23be5e5ef2b45e398c18f1a007f7d45d
source_url: https://mp.weixin.qq.com/s/tm7M3N8f45K87YUTwERkhg
author: 月珩
publisher: 阿里云开发者
published: 2026-05-14
created: 2026-05-14
type: raw
tags:
  - skill-system
  - skill-factory
  - llm-agent
  - harness
  - tdd
  - trace2skill
  - 月珩
review_value: 7
review_confidence: 7
review_recommendation: worth-reading
review_stars: 3
summary: Skill Factory 测试驱动技能生成平台——多路并发生成3策略择优、TDD验证闭环、Trace2Skill轨迹蒸馏、SkillRL强化学习联调、三种skill创建模式对比表（人工vs对话AI vs SkillFactory）。
---

## 产品功能：测试驱动技能生成流水线
### 1. 技能定义
用户输入：想生成的技能 + 测试问题 + API 接口（后续支持 SOP 文档挂载）
### 2. 基线诊断
判断是否有必要生成新 skill：
- **裸模型评估**：直接让模型执行目标任务，作为基线对照
- **Skill 匹配分析**：召回相似 skill，执行测试问题，评估现有 skill 是否满足需求
→ 失败点和不确定行为 = Skill 需要解决的真实能力缺口
### 3. 多路并发 Skill 生成
**核心思路**：并行调用 3 种不同策略/模型/Prompt 模板的 Creator，相当于"一次性买三张不同号码的彩票"。
**结果**：只要其中一路生成高质量代码，整个任务就成功。极大提高 **First-Time Pass Rate**。
调研参考：
- Anthropic `skill-creator`
- OpenClaw `skill-creator`
- Superpowers（GitHub 138k ⭐）的 `writing-skills`
### 4. 回归迭代
**测试阶段**：从格式规范、复用创新、功能可用性、运行稳定性、文档规范五个维度评价打分
**优化阶段**：生成优化版本 skill，支持下载或发布
### 5. 质量检查
---
## 生态适配
基于知流平台的 MCP / HTTP / Dify Agent 工具，可直接生产技能。
---
## 迭代方向
### Trace2Skill：轨迹 → 技能
千问团队 Distill Trajectory-Local Lessons into Transferable Agent Skills：
> Trace2Skill 本质：将智能体的"隐性经验"（大量具体执行轨迹）转化为"显性知识"（结构化技能文档）
**关键结论**：高质量技能不需要依赖昂贵的人工编写，也不需要更新模型参数，仅通过开源小模型进行轨迹分析，就能提炼出通用的专家级能力。
→ 基于日志数据沉淀可固定技能，有利于 Agent 稳定执行长程任务
### SkillRL 联调方向
把智能体与环境交互产生的冗长轨迹蒸馏成紧凑、可复用的"技能卡片"，并在**强化学习训练过程中让技能库与策略共同进化**。
### 虚拟环境回归
对于不能实际执行的 skill，考虑模拟虚拟环境让 Agent 进行测试回归。
---
## AI Coding 实践
开发过程中使用的 AI 编程工具：
| 工具 | 用途 |
|------|------|
| idealab | 产品功能页面详细设计 |
| Qoderwork | 产品功能页面详细设计 |
| 爱码仕 | 前端页面生成 |
| 灵码 aonecopilot | Debug/优化/生成整体编码框架 demo |
---
## 参考链接
- [Trae IDE: How to write a good skill](https://docs.trae.cn/ide/best-practice-for-how-to-write-a-good-skill)
- [Anthropic Skills](https://github.com/anthropics/skills)
- [OpenClaw skill-creator](https://github.com/openclaw/openclaw/tree/main/skills/skill-creator)