---
title: "Agent Skill 规范、构建与设计模式（核心摘要）"
type: source
source: wechat
source_url: "https://mp.weixin.qq.com/s/LCpiLyLnRn5WyuHpribyHw"
sha256: 5ca5275e13328882765bf954396c0aafab83f92646d60b0626655e2d7f746ec2
ingested: 2026-07-02
authors: [阿里云开发者]
---

# Agent Skill 规范、构建与设计模式（核心摘要）

来源：阿里云开发者（基于Anthropic Agent Skills规范、Skill-Creator方法论、Superpowers Writing-Skills框架及Google ADK设计模式）

## 一、核心概念与规范

### 1.1 定义
Skill ≠ Prompt：Skill是围绕任务、工具、流程和输出边界的结构化行为设计，是可复用的Prompt增强包。

格式标准（Anthropic 2025.12发布，33+产品采纳）：
- SKILL.md: 必需：YAML元数据 + Markdown指令
- scripts/: 可选：可执行脚本
- references/: 可选：按需加载的参考文档
- assets/: 可选：模板、资源文件

### 1.2 三层渐进式加载机制
解决上下文膨胀问题，借鉴UI/UX渐进式信息披露策略。
- L1 目录层: name + description，会话启动时加载，~50-100 tokens/个
- L2 指令层: 完整SKILL.md body，Skill被激活时加载，建议<5000 tokens
- L3 资源层: scripts/references/assets，指令引用时按需加载

关键价值：即使安装20个Skill，初始加载仅1000-2000 tokens，上下文使用量减少约90%。

### 1.3 触发机制
完全由模型自行判断当前任务是否匹配description，非关键词硬编码。
最关键发现：Description只应描述触发条件，绝不要总结工作流程！

## 二、Skill-Creator（Anthropic）——工程化方法论

核心思想：
1. 泛化而非过拟合：不要为测试用例做针对性修改
2. 解释"为什么"而非堆砌"必须"：今天的LLM有良好的心智理论
3. 提取重复模式：Agent反复写类似辅助脚本时，应抽取到scripts/目录直接调用

完整生命周期：需求捕获 → 编写Skill → 测试执行(并行A/B) → 评估与评审 → 迭代改进 → 优化与发布

三Agent专业化评估链：Grader（评分者）→ Comparator（盲比较者）→ Analyzer（分析者）

## 三、五大设计模式（Google ADK）
- Tool Wrapper: SKILL.md不写完整规范，只告诉Agent去references/按需加载
- Generator: 模板+风格指南+主动提问
- Reviewer: 分离"查什么"与"怎么查"，解释WHY不是WHAT
- Inversion: 翻转交互模式：Agent先采访用户，收集完需求再动手
- Pipeline: 多步严格顺序，明确输入/输出/通过条件，禁止跳步

## 总结
1. Skill是结构化行为设计，不是Prompt
2. 渐进式加载是核心机制，解决了Agent系统上下文膨胀问题
3. Description是触发的关键
