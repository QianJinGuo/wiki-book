# Harness工程火遍硅谷，AgentCore今天交卷!

> 📊 Level ⭐⭐⭐ | 9.9KB

> 本页原内容在 2026-09-07 质量闭环中判定为 **dup-0.8**，已按导航页（MOC）重建；
> 原文备份见 `_archive/hub-rewrite-2026-09-07/agentcore-managed-harness.md`，一手来源仍见下方 sources。

## 机制与论文
- [Kimi Work：通用 Agent 战场从云端迁移到本地](https://github.com/QianJinGuo/wiki-public/blob/main/entities/kimi-work-codex-vibe-working-paradigm-shift.md) — Vibe Working开启+本地Harness 20356字rv9
- [Harness Engineering 综合论述：为什么 2026 年真正重要的是它（含 ECC 开源实现案例）](https://github.com/QianJinGuo/wiki-public/blob/main/entities/harness-engineering-paradigm-comprehensive-2026.md) — 综合论述17305字含ECC案例rv9
- [一篇看懂 Agent Harness 的结构！ — 12组件+7决策完整框架](https://github.com/QianJinGuo/wiki-public/blob/main/entities/agent-harness-12-components-7-decisions.md) — harness 12组件框架
- 深度解析 OpenClaw 在 Prompt / Context / Harness 三个维度中的设计哲学与实践 — 三维度源码：23模块拼装+自适应分块+双层Memory
- [Cloudflare Kitesurf：运行在 Workers V8 isolate 上的 agent-first 浏览器](https://github.com/QianJinGuo/wiki-public/blob/main/entities/cloudflare-kitesurf-agent-first-browser-workers-2026.md) — agent-first浏览器
- [Agent 自我改进的六条路](https://github.com/QianJinGuo/wiki-public/blob/main/entities/agent-self-improvement-six-mechanisms.md) — 六种自改进机制
- [Agent Harness 解析：智能体架构深度拆解](https://github.com/QianJinGuo/wiki-public/blob/main/entities/agent-harness-architecture-deep-dive-aksahy.md) — harness解剖深度
- [从 Prompt 到 Harness：Claude 官方学习资料](https://github.com/QianJinGuo/wiki-public/blob/main/entities/from-prompt-to-harness-claude-official.md) — Harness五子系统闭环解读
- [Claude Opus 4.7 并不是一次全面升级，甚至部分能力大幅衰退](https://github.com/QianJinGuo/wiki-public/blob/main/entities/claude-opus-47.md) — 4.7衰退面分析
- [复旦北大 AHE：Agentic Harness Engineering 瓶颈分析](https://github.com/QianJinGuo/wiki-public/blob/main/entities/fudan-peking-ahe-agentic-harness-engineering.md) — AHE三支柱可观测性5622字深析版
- [Prompt Context Harness 三次演进](https://github.com/QianJinGuo/wiki-public/blob/main/entities/prompt-context-harness-three-evolutions.md) — Harness衰变定律：模型越强harness越简3681字
- Three Years from GPT-3 to Gemini 3 — 9699字最全三年演进版
- [Grok Bot 0.18 运行时重建：Agent 的五层运行时与可靠性协议](https://github.com/QianJinGuo/wiki-public/blob/main/entities/grok-bot-agent-runtime-five-layer-vibecoder-2026.md) — 145万行bundle重建五层运行时+可靠性协议

## 工程实践
- ['长周期 Agent 详解：从 Ralph Loop 到可接管 Harness'](https://github.com/QianJinGuo/wiki-public/blob/main/entities/long-running-agent-ralph-loop-handover-harness-ruofei.md) — 三类漂移+5张卡治理12390字rv10全版
- [Karpathy 最新访谈：从 Vibe Coding 到 Agentic Engineering](https://github.com/QianJinGuo/wiki-public/blob/main/entities/karpathy-vibe-coding-agentic-engineering-v4.md) — v4 8090字rv10：可验证性上限+MenuGen警示
- [Codex /goal：长任务Agent的目标运行时](https://github.com/QianJinGuo/wiki-public/blob/main/entities/codex-goal-agent-runtime.md) — goal运行时rv9主版
- [SchemaFlow: OpenAI Cookbook Partner — Agentic Database Change Impact Analysis, SQL Generation, and Eval Guardrails](https://github.com/QianJinGuo/wiki-public/blob/main/entities/schemaflow-openai-cookbook-staged-agentic-workflow.md) — 五阶段staged workflow+Pydantic约束+Promptfoo护栏
- [Anthropic 发布 Computer Use 最佳实践](https://github.com/QianJinGuo/wiki-public/blob/main/entities/anthropic-computer-use-best-practices.md) — 坐标映射与梯度分配
- AWS Bedrock Agentcore Quality Optimization Flywheel — 质量飞轮
- [长周期-agent-详解-从-ralph-loop-到可接管-harness](https://github.com/QianJinGuo/wiki-public/blob/main/entities/长周期-agent-详解-从-ralph-loop-到可接管-harness.md) — Ralph loop到接管harness
- [Anthropic Managed Agents：用 K8s 思路虚拟化 Agent 组件](https://github.com/QianJinGuo/wiki-public/blob/main/entities/anthropic-managed-agents-scaling.md) — 宠物到牛群
- [AI第一次科研竞赛中击败人类！Opus 4.7狂飙2930步创世界纪录](https://github.com/QianJinGuo/wiki-public/blob/main/entities/prime-intellect-auto-nanogpt-opus-2930.md) — AI首胜人类科研竞赛：2930步+两种研究人格
- [Prompt 调试器：A/B 测试模板对比](https://github.com/QianJinGuo/wiki-public/blob/main/entities/prompt-debugger-compare-templates-winty.md) — Prompt调试器三件套：A/B+评分沉淀+模板库
- [第 09 篇 · Agent 配置：模型、工具、技能、MCP 与提示词的组合](https://github.com/QianJinGuo/wiki-public/blob/main/entities/agent-config-model-tool-skill-mcp-prompt-combination-yexiaochai-09.md) — 配置驱动架构教程

## 深度分析

### Harness 的边界：模型之外的一切

原文给出的定义非常干脆：Harness = 模型之外的一切，具体拆成六件事——编排逻辑、执行环境、工具连接、状态管理、身份认证、可观测性。 这个六分法的价值在于把"harness"从一个营销热词变成了可操作的工程清单：任何一个做 Agent 的团队都可以逐项盘点，这六块里哪些自己造、哪些外包给托管服务。AgentCore Managed Harness 本质上就是 AWS 把这六件事全部做成托管原语的一次尝试——这也解释了原文那句被广泛引用的观察：每个做 Agent 的团队都在搭这套系统，每个团队搭出来的都不一样，每个团队都觉得在重复造轮子。造轮子的痛点真实存在，托管化才有市场。

### 三阶段演进坐标：AgentCore 站在第三阶段

原文把 AI 工程划成三个阶段：Prompt Engineering 解决"怎么跟模型说话"，Context Engineering 解决"怎么给模型喂信息"，Harness Engineering 解决"怎么让 Agent 真正跑起来"，并断言第三阶段是 2026 年的新风潮。 AgentCore 的发布时点正踩在这个拐点上：模型层趋同之后，差异化只能往运行时层迁移。但这里存在一个张力——本页导航体系里的[三次演进](https://github.com/QianJinGuo/wiki-public/blob/main/entities/prompt-context-harness-three-evolutions.md)条目记录过"Harness 衰变定律"：模型越强，harness 越简。如果衰变定律成立，托管 harness 的长期价值就不在"功能多"，而在把各家反复重写的样板件（会话管理、工具协议、隔离、持久化）一次性摊销掉，让团队只在真正差异化的编排逻辑上花精力。与[Claude 官方五子系统框架](https://github.com/QianJinGuo/wiki-public/blob/main/entities/from-prompt-to-harness-claude-official.md)对照读，可以看到两家厂商对同一趋势的不同切法。

### 托管与不锁定的张力：Strands 是关键落子

托管 harness 历史上最大的心理障碍是锁定：一旦编排、状态、工具全在厂商闭源服务里，迁移成本极高。原文的特性表给出了 AWS 的回应方式——模型层 Bedrock/OpenAI/Gemini 随时切换且 session 内不丢上下文，工具层走 MCP Server 与 Gateway（REST API 转工具）这类开放协议，底层基于开源框架 Strands Agents，代码可随时导出自部署，且按底层用量计费、不用不收费。 真正的产品决策不是"隔离做得好"（Firecracker microVM 属于 AWS 的常规优势），而是用开源底座换取托管服务的可信度：先把"可导出"的退路留给用户，托管才有说服力。这个思路与[Anthropic Managed Agents 用 K8s 思路把宠物变牛群](https://github.com/QianJinGuo/wiki-public/blob/main/entities/anthropic-managed-agents-scaling.md)是同一代问题——托管化的前提是先解决" cattle 也能随时牵走"。

### 确定性下沉：Shell 直跑是被低估的设计

特性表里最容易被略过、但工程含金量最高的条目是"Shell 直跑"：克隆仓库、安装依赖、跑测试这类确定性操作不经过模型，直接脚本执行，零 token 费用。这背后的原则是把确定性从概率系统里剥离出来——LLM 生成的每一步都是概率事件，凡是输入输出完全确定的操作，走模型只会引入两类成本：token 开销和幻觉失败面。这与[SchemaFlow 的五阶段 staged workflow](https://github.com/QianJinGuo/wiki-public/blob/main/entities/schemaflow-openai-cookbook-staged-agentic-workflow.md)里用 Pydantic 约束钉死输出格式的做法同源：好的 agent 工程不是让模型更聪明，而是让模型少做它不需要做的事。断点续跑同理——文件系统持久化把"失败后整个任务重跑"降级为"从断点继续"，是把可靠性做进基础设施而不是靠模型自己扛。

## 实践启示

1. **六件套自检**：用"编排逻辑 / 执行环境 / 工具连接 / 状态管理 / 身份认证 / 可观测性"六个维度逐项盘点自家 Agent 系统，缺哪块先补哪块，而不是先堆模型能力——模型之外的短板才是真正的失败源。
2. **确定性操作下沉到 Shell**：克隆、安装、测试等零歧义操作一律脚本直跑、不走模型生成，同时省下 token 和一类幻觉失败；先给任务分类"确定/概率"，再决定路由给谁。
3. **换模型当回归测试**：利用 session 内随时切换模型不丢上下文的能力，把"同一任务换模型跑一遍"纳入常规回归，既测兼容性也量化对单一厂商的依赖度。
4. **工具层只用开放协议**：新工具一律以 MCP Server 形式接入，或经 Gateway 把 REST API 转成工具，避免工具实现与特定 harness 绑死，给未来的迁移留活口。
5. **断点续跑当成本杠杆**：长任务设计上就默认可暂停恢复（文件系统持久化 + 跨会话记忆），失败重试的粒度从"整个任务"降到"最后一个断点"，长周期任务的成本模型因此完全不同。
6. **保留导出退路**：即使采用托管 harness，也要坚持底座可导出（如基于 Strands 的代码自部署能力），把"不被锁定"写进架构决策而不是厂商承诺里。

## 延伸导航
- [Agent 工程全景指南](https://github.com/QianJinGuo/wiki-public/blob/main/moc/agent-engineering-guide.md)

## 关联

- 同题异语种孪生页：[Agent架构关键变化Harness正在成为新后端](https://github.com/QianJinGuo/wiki-public/blob/main/entities/agent架构关键变化harness正在成为新后端.md)（归并候选，提案卡 #11 批1）

→ [原文存档](https://mp.weixin.qq.com/s/n3j56hLiv1p0ZIRGMFwuLA)

---

