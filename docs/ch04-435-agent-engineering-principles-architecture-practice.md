# agent-engineering-principles-architecture-practice

## Ch04.435 agent-engineering-principles-architecture-practice

> 📊 Level ⭐⭐ | 4.9KB | `entities/agent-engineering-principles-architecture-practice.md`

## agent-engineering-principles-architecture-practice

你不知道的 Agent：原理、架构与工程实践
文章内容基于作者个人技术实践与独立思考，旨在分享经验，仅代表个人观点。
这篇文章主要讲 Agent 架构里几块最影响工程效果的内容，包括控制流、上下文工程、工具设计、记忆、多 Agent 组织、评测、追踪和安全，最后再用 OpenClaw 的实现把这些设计原则串起来看一遍。
整理下来，有几处判断和我原来想的不太一样，更贵的模型带来的提升，很多时候没有想象中那么大，反而 Harness 和验证测试质量对成功率的影响更大，调试 Agent 行为时，也应优先检查工具定义，因为多数工具选择错误都出在描述不准确，另外，评测系统本身的问题，很多时候比 Agent 出问题更难发现，如果一直在 Agent 代码上反复调，效果未必明显，读完这篇，这几个问题应该能有些答案。
Agent Loop 的核心实现逻辑抽象后其实不到 20 行代码：

## 深度分析

1. **Harness 比模型更决定系统稳定性**：验收基线、执行边界、反馈信号和回退手段比模型本身更关键。任务清晰度和验证自动化程度决定 Agent 适合区域——目标明确且结果可自动验证的右上角区域最适合 Agent 部署

2. **上下文分层是防 Context Rot 的核心**：通过常驻层（身份定义/项目约定）、按需加载（Skills/领域知识）、运行时注入（动态信息）、记忆层（跨会话经验）、系统层（确定性逻辑）的五层架构防上下文稀释。Prompt Caching 让常驻层越稳定，前缀命中率越高

3. **ACI 原则重新定义工具设计**：工具应面向 Agent 目标而不是底层 API，调试 Agent 时应优先检查工具定义——大多数工具选择错误的原因出在描述不准确，不在模型能力

4. **记忆系统采用分层混合策略**：工作记忆、程序性记忆、情景记忆、语义记忆四级分类，通过 token 阈值触发整合，配合可回退设计避免信息丢失

5. **评测系统的问题比 Agent 出问题更难发现**：Pass@k 验证能力边界，Pass^k 保证上线质量；评测系统本身的资源不足、评分器 bug、测试用例脱节与模型退化表现一模一样，需先修评测再改 Agent

## 实践启示

1. **构建 Harness 验证基础设施**：优先于模型选型，建立自动化验收基线和执行边界，让对错有机器可执行的判断标准

2. **用五层架构管理上下文风险**：常驻层保持短硬可执行，Skills 按需加载只保留索引，完整知识触发时再注入

3. **按 ACI 原则设计工具**：面向目标而非 API、边界明确、参数防错、定义里直接给示例，避免工具数量失控

4. **建立 MEMORY.md 加可回退的记忆系统**：混合检索（70% 向量 + 30% 关键词），token 阈值触发整合，指针移动不删除原始消息

5. **先建评测体系再优化 Agent**：区分 Pass@k（探索能力上限）和 Pass^k（上线回归），按确定性选择评分器（代码 > 模型 > 人工）

## 相关实体
- [Agent Principle Architecture Engineering Practice](/ch04-300-agent-principle-architecture-engineering-practice/)
- [Harness Engineering 让 Coding Agent 可靠完成长程任务 V2](/ch04-422-harness-engineering-让-coding-agent-可靠完成长程任务/)
- [Factory Mission Multi Agent Architecture](/ch01-864-factory-mission-multi-agent-architecture/)
- [Harness Engineering Long Term Agent Tasks](/ch04-160-harness-engineering-让-coding-agent-可靠完成长程任务/)
- [Huggingface Ai Agent Glossary Model Scaffolding Harness Tool Skill Subagent](/ch02-prompt/)
- MOC

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/agent-engineering-principles-architecture-practice.md)

---

