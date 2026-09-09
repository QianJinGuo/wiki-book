# 你不知道的 Agent：原理、架构与工程实践

> 📊 Level ⭐ | 4.9KB | `entities/你不知道的-agent原理架构与工程实践.md`

> 本页原内容在 2026-09-07 质量闭环中判定为 **thin-0.78**，已按导航页（MOC）重建；
> 原文备份见 `_archive/hub-rewrite-2026-09-07/你不知道的-agent原理架构与工程实践.md`，一手来源仍见下方 sources。

## 机制与论文
- [GPT-5.6 Preview System Card — Community Detection & Benchmarks](https://github.com/QianJinGuo/wiki-public/blob/main/entities/gpt-5-6-preview.md) — GPT-5.6系统卡：三模型+安全评估rv9
- [Everything a Senior Engineer Needs to Know About What's Inside an LLM](https://github.com/QianJinGuo/wiki-public/blob/main/entities/senior-engineer-guide-inside-llm.md) — LLM内部机制工程师向讲解
- [Hermes Agent /goal 长任务运行时架构](https://github.com/QianJinGuo/wiki-public/blob/main/entities/hermes-agent-goal-runtime-architecture.md) — GoalState四部件+Judge保守优先5161字全版
- [Accelerating Gemini Nano models on Pixel with frozen Multi-Token Prediction](https://github.com/QianJinGuo/wiki-public/blob/main/entities/blog-accelerating-gemini-nano-models-on-pixel-with-frozen-multi-token-prediction.md) — MTP端侧全版
- [Lean Software Scaling Laws](https://github.com/QianJinGuo/wiki-public/blob/main/entities/lean-scaling.md) — Lean scaling laws研究提案3102字全版
- [POPO (Group Prioritized Off-Policy Optimization)：清华 RLVR 训练高效组级回放框架](https://github.com/QianJinGuo/wiki-public/blob/main/entities/tsinghua-popo-group-prioritized-off-policy-optimization-rlvr.md) — 组级回放解耦off-policy
- [国产顶尖模型 benchmark 评分那么高，可实际效果为什么差？看完 Anthropic 这篇博客，刷分的因素太单一了](https://github.com/QianJinGuo/wiki-public/blob/main/entities/国产顶尖模型-benchmark-评分那么高可实际效果为什么差看完-anthropic-这篇博客刷分的因素太单一了.md) — 评测环境系统性偏差
- [token级，精准控制生成长度：3B模型击败GPT 5.4、Claude](https://github.com/QianJinGuo/wiki-public/blob/main/entities/token级精准控制生成长度3b模型击败gpt-54claude.md) — 长度即值函数LenVM

## 工程实践
- ['Harness Engineering：AI 从](../ch05/061-harness-engineering.html) — 六层架构+七大反模式+分级决策树19712字rv9
- [一点天下：Context Engineering 与 Agentic AI (QCon)](https://github.com/QianJinGuo/wiki-public/blob/main/entities/yidian-tianxia-context-engineering-agentic-ai-qcon.md) — 7114字最全六层上下文版
- [Cursor 复盘 Harness：模型决定能力上限，Harness 决定生产下限](https://github.com/QianJinGuo/wiki-public/blob/main/entities/cursor-复盘-harness模型决定能力上限harness-决定生产下限.md) — Cursor复盘主版
- [三器合一：gstack + Superpowers + OpenSpec 工程化 AI 编程实战](https://github.com/QianJinGuo/wiki-public/blob/main/entities/three-tools-in-one-gstack-superpowers-openspec-engineering-ai-coding.md) — gstack变体四串联点
- [Claude Code 之父最新访谈：编程已经结束、harness 将消失、Claude Code 将只有 100 行代码、loop 才是未来](https://github.com/QianJinGuo/wiki-public/blob/main/entities/claude-code-之父最新访谈编程已经结束harness-将消失claude-code-将只有-100-行代码loop-才是未来.md) — Boris访谈全版
- [Codeindex · 让大模型更好地理解你的代码](https://github.com/QianJinGuo/wiki-public/blob/main/entities/codeindex-让大模型更好地理解你的代码.md) — 语义索引+依赖图
- [在 RDS PostgreSQL 中实现 RaBitQ 量化](https://github.com/QianJinGuo/wiki-public/blob/main/entities/在-rds-postgresql-中实现-rabitq-量化.md) — 32倍压缩理论误差界
- [GLM-5 Scaling 痛点与推理优化](https://github.com/QianJinGuo/wiki-public/blob/main/entities/glm5-scaling-pain-inference.md) — KV Cache竞态排查复盘7544字全版
- [vivo Agent 系统分析：大模型是大脑不是马，Harness 是 ICU 不是马鞍](https://github.com/QianJinGuo/wiki-public/blob/main/entities/vivo-agent-brain-body-icu-harness-evolutionary-framework-2026.md) — 大脑身体ICU隐喻框架
- [高德 Marketing AutoResearch：AI Native 营销增长经营托管框架](https://github.com/QianJinGuo/wiki-public/blob/main/entities/autoresearch-marketing-growth-amap-ai-native.md) — 营销经营托管
- [AgentOps: Operationalize agentic AI at scale with Amazon Bedrock AgentCore](https://github.com/QianJinGuo/wiki-public/blob/main/entities/agentops-operationalize-agentic-ai-at-scale-with-amazon-bedr.md) — 四支柱解析版
- [别再把上下文当聊天记录](https://github.com/QianJinGuo/wiki-public/blob/main/entities/别再把上下文当聊天记录.md) — 上下文是工作空间四家趋同
- [告别“氛围编程”：基于 Harness 治理和 SDD 的团队级 AI 研发范式演进与实践](https://github.com/QianJinGuo/wiki-public/blob/main/entities/告别氛围编程基于-harness-治理和-sdd-的团队级-ai-研发范式演进与实践.md) — 确定性承重层四步骤
- [我把 Karpathy 的 AutoResearch 搬到了软件开发领域，效果炸了](https://github.com/QianJinGuo/wiki-public/blob/main/entities/我把-karpathy-的-autoresearch-搬到了软件开发领域效果炸了.md) — val loss换多维评分
- [精选 10 个开发者常用的 AI 智能体技能（Agent Skills）](https://github.com/QianJinGuo/wiki-public/blob/main/entities/精选-10-个开发者常用的-ai-智能体技能agent-skills.md) — 四类技能质量筛选节点
- [你写的 Skill，及格了吗？](https://github.com/QianJinGuo/wiki-public/blob/main/entities/你写的-skill及格了吗.md) — D1元数据定生死评估框架

---

