# 你写的 Skill，及格了吗？

## Ch07.055 你写的 Skill，及格了吗？

> 📊 Level ⭐⭐ | 7.1KB | `entities/ni-xie-de-skill-ji-ge-liao-ma.md`

## 核心概念
本文提出了一套 **8 维度 Skill 量化评估框架**，通过元数据质量、执行引导清晰度、领域知识密度等指标对 Skill 进行打分评级（S/A/B/C/D 五档），解决 Skill 质量难以客观衡量的问题。

## 8 个评估维度
分布在 Skill 从发现到执行的完整生命周期，分三个阶段：
**第一阶段：能不能被找到**

- D1. 元数据质量 — description 是否精准描述功能、包含触发关键词，甚至写明不应触发场景
**第二阶段：用起来顺不顺**

- D2. 执行引导清晰度 — Agent 能否顺畅执行任务
- D4. 工作流完整性 — 流程是否端到端、异常是否有处理
- D5. 输入输出清晰度 — 起点终点是否明确
- D6. 资源利用 — 脚本、参考文档是否按需加载（渐进式披露）
**第三阶段：值不值得存在**

- D3. 领域知识密度 — 是否内嵌难以获取的专业知识
- D7. 写作质量 — 技术文档结构是否清晰
- D8. 范围与聚焦 — 是否做好一件事而非包揽一切

## 多模型交叉验证机制
- **独立评估**：多模型各自按 8 维度独立打分
- **交叉互审**：分差 ≥2 分时需引用 Skill 具体内容作为证据，并可自我修正
- **仲裁综合**：主模型汇总所有结果做最终裁决
- **三级共识机制**：强共识/弱共识/仲裁，标注每个维度的共识度

## 四种执行策略自动路由
根据模型列表自动分类：

- 全是工具原生模型 → 策略 A
- 全是第三方 → 策略 B（依赖 Python 脚本调用千帆 API）
- 两者都有 → 策略 A+B
- 出问题自动降级 → 策略 C

## 关键价值
- **改进路线图**：帮助开发者识别短板
- **选型决策工具**：横向对比多个 Skill
> 注意：评估框架度量的是 Skill 的**文档工程质量**，而非运行时全部真相。

## 深度分析
1. **D1 是唯一决定 Skill 生死的维度**。description 的质量决定 Agent 是否会触发该 Skill——如果这一步没做好，后面七 个维度写得再精细也毫无意义。好的 description 应同时包含触发关键词和反向排除条件，防止误触发
2. **8 维度映射 Skill 完整生命周期三阶段**。"能不能被找到"（D1 元数据）→ "用起来顺不顺"（D2/D4/D5/D6 执行引导）→ "值不值得存在"（D3/D7/D8 存在价值）。这种分层设计让评估既有广度又有纵深
3. **多模型共识比单模型绝对分数更可靠**。GLM-5.1 评 7.8/A，Claude Opus 4.6 评 6.5/B——分差一个等级但核心问题趋同，说明绝对值因模型而异，共识才是稳定信号。交叉互审要求分差 ≥2 分时必须引用 Skill 具体内容作为证据
4. **渐进式披露是资源利用的核心原则**。SKILL.md 应保持精简，详细脚本和参考文档按需加载，而非把所有内容堆砌在一个巨大的 Markdown 文件中。这直接影响 Agent 能否快速扫描并抓到关键信息
5. **D3 是 Skill 存在的根本理由**。如果通用 Agent 不依赖该 Skill 也能完成同等任务，则该 Skill 没有存在价值。真正的 Skill 应内嵌难以获取的专业知识：私有 API 调用方式、内部系统数据模型、行业特定最佳实践

## 实践启示
1. **从 D1 description 开始优先改进**。扩展 description 包含触发关键词、功能概述和明确的不触发场景——这是投入产出比最高的改进动作，能直接提升 Skill 被正确触发的概率
2. **设计端到端工作流并预设异常处理方案**。D4 要求流程端到端、步骤衔接顺畅，且必须覆盖 API 超时、文件下载失败等异常场景。可以在 Skill 中内置重试逻辑和降级策略
3. **单模型多视角评估可作为多模型验证的降级方案**。让同一模型扮演严格派/务实派/温和派三个评审角色，强制引入多样性视角。角色分化后的分歧（如 D4 一个给 5 分一个给 8 分）本身就有分析价值
4. **采用场景路由表设计提升输入输出清晰度**。subordinate-weekly-report 的场景路由表设计可借鉴——每个 action 配置完整的输入输出示例，让 Agent 能快速匹配用户意图，降低理解成本
5. **Skill 完成后用多模型横向对比选型**。对同类 Skill 分别独立评估，对比 D1-D8 各维度得分和共识度，识别各自优势领域（workos-weekly 领域知识密度更高，subordinate-weekly-report 元数据质量更优），选择时各取所长
→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/ni-xie-de-skill-ji-ge-liao-ma.md)

## 相关实体
- [Skill.md 简历生成器 Resume Forge](../ch04/267-skill.html)
- [从 0 到 1 教你写 Agent Skill，让 AI 懂你的"潜规则"](../ch04/604-agent-skill.html)
- [Hermes Agent](../ch03/092-hermes-agent.html)
- [Qoder Skills 完全指南](ch07/034-qoder-skills.html)
- [Hermes Agent Skill](https://github.com/QianJinGuo/wiki/blob/main/concepts/hermes-agent-skill.md)
- [9个Agent技能模块化SageMaker微调生命周期](../ch04/398-aws-sagemaker-ai-agent.html)
- [Perplexity 内部 Skill 设计指南：四维体系与维护方法论](../ch04/267-skill.html)
- [SkillClaw](../ch04/447-skillclaw-nacos-agent-skill-registry.html)
- [Skill 系统：Agent 如何把经验沉淀成可复用能力](ch07/017-hermes-skill.html)
- [重新定义Skill开发：保姆级教程&一站式开发助手发布](../ch04/267-skill.html)
- [SkillX — 层次化技能知识库](ch07/051-skillx.html)
- [Anthropic 14 个 Agent Skills 设计模式](../ch04/251-anthropic-agent.html)
- [Trace2Skill: 轨迹经验蒸馏为可迁移 Agent Skills](../ch04/392-agent-skills.html)
- [Qoder Skills 完全指南：从零开始，让 AI 按你的标准执行](ch07/034-qoder-skills.html)
- [Thin Harness Fat Skills](../ch05/079-thin-harness-fat-skills-ai.html)
- [从Vibe Coding到Agentic Engineering：重构后台开发全流程 — 腾讯技术工程](../ch04/203-tencent-vibe-coding-to-agentic-engineering-backend.html)

---

