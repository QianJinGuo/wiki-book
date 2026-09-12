# Harness工程火遍硅谷，AgentCore今天交卷!

> 📊 Level ⭐ | 4.8KB | `entities/agentcore-managed-harness.md`

> 本页原内容在 2026-09-07 质量闭环中判定为 **dup-0.8**，已按导航页（MOC）重建；
> 原文备份见 `_archive/hub-rewrite-2026-09-07/agentcore-managed-harness.md`，一手来源仍见下方 sources。

## 机制与论文
- [Kimi Work：通用 Agent 战场从云端迁移到本地](https://github.com/QianJinGuo/wiki-public/blob/main/entities/kimi-work-codex-vibe-working-paradigm-shift.md) — Vibe Working开启+本地Harness 20356字rv9
- [Harness Engineering 综合论述：为什么 2026 年真正重要的是它（含 ECC 开源实现案例）](https://github.com/QianJinGuo/wiki-public/blob/main/entities/harness-engineering-paradigm-comprehensive-2026.md) — 综合论述17305字含ECC案例rv9
- [一篇看懂 Agent Harness 的结构！ — 12组件+7决策完整框架](https://github.com/QianJinGuo/wiki-public/blob/main/entities/agent-harness-12-components-7-decisions.md) — harness 12组件框架
- [深度解析 OpenClaw 在 Prompt / Context / Harness 三个维度中的设计哲学与实践](https://github.com/QianJinGuo/wiki-public/blob/main/entities/openclaw-prompt-context-harness.md) — 三维度源码：23模块拼装+自适应分块+双层Memory
- [Cloudflare Kitesurf：运行在 Workers V8 isolate 上的 agent-first 浏览器](https://github.com/QianJinGuo/wiki-public/blob/main/entities/cloudflare-kitesurf-agent-first-browser-workers-2026.md) — agent-first浏览器
- [Agent 自我改进的六条路](https://github.com/QianJinGuo/wiki-public/blob/main/entities/agent-self-improvement-six-mechanisms.md) — 六种自改进机制
- [Agent Harness 解析：智能体架构深度拆解](https://github.com/QianJinGuo/wiki-public/blob/main/entities/agent-harness-architecture-deep-dive-aksahy.md) — harness解剖深度
- [从 Prompt 到 Harness：Claude 官方学习资料](https://github.com/QianJinGuo/wiki-public/blob/main/entities/from-prompt-to-harness-claude-official.md) — Harness五子系统闭环解读
- [Claude Opus 4.7 并不是一次全面升级，甚至部分能力大幅衰退](https://github.com/QianJinGuo/wiki-public/blob/main/entities/claude-opus-47.md) — 4.7衰退面分析
- [复旦北大 AHE：Agentic Harness Engineering 瓶颈分析](https://github.com/QianJinGuo/wiki-public/blob/main/entities/fudan-peking-ahe-agentic-harness-engineering.md) — AHE三支柱可观测性5622字深析版
- [Prompt Context Harness 三次演进](https://github.com/QianJinGuo/wiki-public/blob/main/entities/prompt-context-harness-three-evolutions.md) — Harness衰变定律：模型越强harness越简3681字
- [Three Years from GPT-3 to Gemini 3](../ch01/435-three-years-from-gpt-3-to-gemini-3.html) — 9699字最全三年演进版
- [Grok Bot 0.18 运行时重建：Agent 的五层运行时与可靠性协议](https://github.com/QianJinGuo/wiki-public/blob/main/entities/grok-bot-agent-runtime-five-layer-vibecoder-2026.md) — 145万行bundle重建五层运行时+可靠性协议

## 工程实践
- ['长周期 Agent 详解：从 Ralph Loop 到可接管 Harness'](https://github.com/QianJinGuo/wiki-public/blob/main/entities/long-running-agent-ralph-loop-handover-harness-ruofei.md) — 三类漂移+5张卡治理12390字rv10全版
- [Karpathy 最新访谈：从 Vibe Coding 到 Agentic Engineering](https://github.com/QianJinGuo/wiki-public/blob/main/entities/karpathy-vibe-coding-agentic-engineering-v4.md) — v4 8090字rv10：可验证性上限+MenuGen警示
- [Codex /goal：长任务Agent的目标运行时](https://github.com/QianJinGuo/wiki-public/blob/main/entities/codex-goal-agent-runtime.md) — goal运行时rv9主版
- [SchemaFlow: OpenAI Cookbook Partner — Agentic Database Change Impact Analysis, SQL Generation, and Eval Guardrails](https://github.com/QianJinGuo/wiki-public/blob/main/entities/schemaflow-openai-cookbook-staged-agentic-workflow.md) — 五阶段staged workflow+Pydantic约束+Promptfoo护栏
- [Anthropic 发布 Computer Use 最佳实践](https://github.com/QianJinGuo/wiki-public/blob/main/entities/anthropic-computer-use-best-practices.md) — 坐标映射与梯度分配
- [AWS Bedrock Agentcore Quality Optimization Flywheel](../ch11/097-aws-bedrock-agentcore-quality-optimization-flywheel.html) — 质量飞轮
- [长周期-agent-详解-从-ralph-loop-到可接管-harness](https://github.com/QianJinGuo/wiki-public/blob/main/entities/长周期-agent-详解-从-ralph-loop-到可接管-harness.md) — Ralph loop到接管harness
- [Anthropic Managed Agents：用 K8s 思路虚拟化 Agent 组件](https://github.com/QianJinGuo/wiki-public/blob/main/entities/anthropic-managed-agents-scaling.md) — 宠物到牛群
- [AI第一次科研竞赛中击败人类！Opus 4.7狂飙2930步创世界纪录](https://github.com/QianJinGuo/wiki-public/blob/main/entities/prime-intellect-auto-nanogpt-opus-2930.md) — AI首胜人类科研竞赛：2930步+两种研究人格
- [Prompt 调试器：A/B 测试模板对比](https://github.com/QianJinGuo/wiki-public/blob/main/entities/prompt-debugger-compare-templates-winty.md) — Prompt调试器三件套：A/B+评分沉淀+模板库
- [第 09 篇 · Agent 配置：模型、工具、技能、MCP 与提示词的组合](https://github.com/QianJinGuo/wiki-public/blob/main/entities/agent-config-model-tool-skill-mcp-prompt-combination-yexiaochai-09.md) — 配置驱动架构教程

## 延伸导航
- [Agent 工程全景指南](https://github.com/QianJinGuo/wiki-public/blob/main/moc/agent-engineering-guide.md)

## 关联

- 同题异语种孪生页：[Agent架构关键变化Harness正在成为新后端](https://github.com/QianJinGuo/wiki-public/blob/main/entities/agent架构关键变化harness正在成为新后端.md)（归并候选，提案卡 #11 批1）

---

