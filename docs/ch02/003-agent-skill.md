# Agent Skill 编写指南

> 📊 Level ⭐ | 4.7KB

> 本页原内容在 2026-09-07 质量闭环中判定为 **dup-0.85**，已按导航页（MOC）重建；
> 原文备份见 `_archive/hub-rewrite-2026-09-07/agent-skill-writing.md`，一手来源仍见下方 sources。

## 机制与论文
- [Skill 设计模式](https://github.com/QianJinGuo/wiki-public/blob/main/entities/skill-design-patterns.md) — 5社区模式+14官方模式全集
- [Hermes Agent 深度解析（阿里云/飞樰）](https://github.com/QianJinGuo/wiki-public/blob/main/entities/hermes-agent-deep-dive.md) — 自进化内外双路径+四维工程7934字rv9全版
- [阿里Qwen提出Skill-RM：把奖励模型做成可复用Agent Skill](https://github.com/QianJinGuo/wiki-public/blob/main/entities/skill-rm-qwen-agent-skill-reward-model.md) — Skill-RM奖励模型技能化
- [SkillCorpus: 大规模社区 Skill 生态的筛选、评测与边界分析](https://github.com/QianJinGuo/wiki-public/blob/main/entities/skillcorpus-consolidating-open-skill-ecosystem.md) — 96k技能提纯流水线评测
- [AI能接管实验室了？中国科大最新研究给出真实物理世界的压力测试](https://github.com/QianJinGuo/wiki-public/blob/main/entities/ai能接管实验室了中国科大最新研究给出真实物理世界的压力测试.md) — 机器实验室评测

## 工程实践
- [Qoder Skills 完全指南 + Agent Skill 迭代式编写 — AI 按你的标准执行](https://github.com/QianJinGuo/wiki-public/blob/main/entities/qoder-skills-完全指南从零开始让-ai-按你的标准执行-v2.md) — 菜单菜谱比喻+三级渐进披露18168字rv9全版
- [企业级 Skill 8 块最小骨架 + 8 条 checklist 设计规范](https://github.com/QianJinGuo/wiki-public/blob/main/entities/skill-design-spec-8-block-checklist-winty.md) — 8块骨架checklist设计规范
- [Harness Engineering 综合性指南（ConardLi 系列 · 含 Beautiful Article 实证 + Reacticle 协议）](https://github.com/QianJinGuo/wiki-public/blob/main/entities/harness-engineering-comprehensive-guide-conardli.md) — ConardLi六层架构14634字rv9
- [Harness 工程搭建式业务 Agent 评测方案：Claude Code 作 Harness 搭建者](https://github.com/QianJinGuo/wiki-public/blob/main/entities/harness-engineered-business-agent-evaluation-aliyun-boyu.md) — CC搭评测Harness，1.5周→1-2天
- [Skill 版本管理五大原则：从越改越差到持续演进](https://github.com/QianJinGuo/wiki-public/blob/main/entities/skill-version-management-semantic-versioning-practices-winty.md) — skill语义化版本五原则
- [重新定义Skill开发：保姆级教程&一站式开发助手](https://github.com/QianJinGuo/wiki-public/blob/main/entities/skill-development-guide-linyi.md) — 11320字最全教程版
- [Skill 版本对比五大原则：从'两个数字比大小'到工程化质量门禁](https://github.com/QianJinGuo/wiki-public/blob/main/entities/skill-version-comparison-five-principles-winty.md) — 版本对比五原则六陷阱
- [Harness 工程之道：Skill 原理与最佳实践](https://github.com/QianJinGuo/wiki-public/blob/main/entities/harness-skill-engineering-alibaba-practice.md) — Skill渐进披露三阶段+作用域优先级
- [Qoder Skill UI — Agent 与人类的协作界面层](https://github.com/QianJinGuo/wiki-public/blob/main/entities/qoder-skill-ui.md) — 软件双形态：Agent用CLI人用GUI，HTML沙箱路线
- [AI Agent 落地：如何攻克稳定性、成本与评估难题？ — Trace即Evals](https://github.com/QianJinGuo/wiki-public/blob/main/entities/ai-agent-trace-evals-stability-cost-evaluation-zhangyanfei.md) — trace即evals
- [skill-up: 阿里开源 Agent Skill 评测框架](https://github.com/QianJinGuo/wiki-public/blob/main/entities/alibaba-skill-up-agent-skill-evaluation.md) — skill-up主版
- [Agent Skill 评估与迭代](https://github.com/QianJinGuo/wiki-public/blob/main/entities/agent-skill-writing-evaluation.md) — skill评估迭代
- [Agent Skill 高质量编写规范](https://github.com/QianJinGuo/wiki-public/blob/main/entities/agent-skill-writing-practices.md) — 编写规范六条
- [Claude Code Dynamic Workflows 实战模式与构建技巧](https://github.com/QianJinGuo/wiki-public/blob/main/entities/claude-code-dynamic-workflows-thariq-practical-patterns.md) — 3失败6模式11用例
- [Skill Craft：Claude Skill 质量工程工具](https://github.com/QianJinGuo/wiki-public/blob/main/entities/claude-skill-quality-tool-skill-craft.md) — skill质量工程
- [Harness Engineering 系统性解读](https://github.com/QianJinGuo/wiki-public/blob/main/entities/harness-engineering-systematic-explainer.md) — 李宏毅课程解读7933字最全版
- [腾讯 Token 优化实战 — 省 Token 和用好 AI 是同一件事](https://github.com/QianJinGuo/wiki-public/blob/main/entities/tencent-token-optimization-agent-architecture.md) — context rot四步工程化
- [Agent Skills 开发指南：6 字段规范、3 级加载、5 步评估闭环](https://github.com/QianJinGuo/wiki-public/blob/main/entities/agent-skills-development-guide.md) — 6字段开发指南
- [腾讯 AI Coding 深水区 — 事实vs判断尺子与提示词→框架→runtime 下沉方法论](https://github.com/QianJinGuo/wiki-public/blob/main/entities/tencent-ai-coding-deep-water-fact-vs-judgment-2026.md) — 事实判断尺子runtime主权

## 延伸导航
- [评测体系与基准测试扩展](https://github.com/QianJinGuo/wiki-public/blob/main/moc/evaluation-benchmarks-extended.md)

---

