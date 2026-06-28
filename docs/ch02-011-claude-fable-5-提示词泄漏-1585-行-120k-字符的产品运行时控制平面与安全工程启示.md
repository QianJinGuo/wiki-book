## Ch02.011 Claude Fable 5 提示词泄漏 — 1585 行 120K 字符的产品运行时控制平面与安全工程启示

> 📊 Level ⭐⭐ | 12.0KB | `entities/claude-fable-5-prompt-leak-runtime-control-plane-vibecoder-2026.md`

## 概述

2026-06-12 VibeCoder 公众号深度分析 2026-06-09 Anthropic 发布 Fable 5 + Mythos 5 后 **CL4R1T4S 仓库泄漏的 `CLAUDE-FABLE-5.md`（1585 行 / 120,040 字符）**——这份提示词不是普通角色卡，而是**完整的产品运行时控制平面**（工具地图 + 权限边界 + 上下文结构 + 产品路由策略）。泄漏降低探索成本，把"产品架构文档"直接公开。文章提出 3 个核心安全工程论断：**(1) Prompt 不能继续当保险箱** — 风险判断应拉到工作流层（请求 + 历史 + 工具输出 + 计划 + 产物 = 同一条审计链）；**(2) 攻击面像系统** — MCP 联网后模型风险边界从文本输出迁移到动作执行，等同 SaaS 权限系统；**(3) 分类器要处理组合风险** — 单点判断 → 状态判断（跨轮 + 工具链 + 产物 + 试探轨迹）。核心设计原则："**所有 system prompt / AGENTS.md / skill / tool schema 都应按会被公开来写。能公开的放进去，不能公开的搬到服务端。**"

## 深度分析

**CLAUDE-FABLE-5.md 是 6 层产品运行时控制平面，不是单层系统提示词。** 文章把它翻译为分层配置：**第 1 层行为宪法**（Fable/Mythos 产品口径 + 10+ 敏感场景拒答策略）、**第 2 层产品说明**（Claude Code/Cowork/in Chrome/in Excel/in PowerPoint 携带官方口径）、**第 3 层能力系统**（Memory system + Artifact 持久化存储 — Claude 不只回答问题，还能生成有状态小应用）、**第 4 层 computer use**（创建文件/写代码/做幻灯片前先读 SKILL.md）、**第 5 层搜索与版权**（近期事件/陌生产品按"信息是否会变"决策 + 限制长引用）、**第 6 层工具和环境**（完整工具 schema + 网络白名单 + 只读目录）。**10 大设计亮点**：Fable/Mythos 差异是产品口径、高风险拒答"不能因为公开可得就放行"、MCP 推荐带 opt-in、Skills 先读再执行、完整工具 schema 进入上下文、网络/目录边界显式可见——这些都是**架构决策**而不是 prompt 技巧。

**"Prompt 不能继续当保险箱"是 Fable 5 泄漏的核心启示。** 文章把 Agent 安全责任重新划界：**能写进 prompt 的** = 用户体验规则（语气/格式/解释方式/工具最小说明/错误沟通）；**应放在服务端策略层的** = 高风险分类/权限判定/工具授权/用户数据边界/fallback 路由/内部策略开关。理由：长上下文模型可把任务拆成多段，Agent 可把一个请求变成搜索+文件读取+代码生成+工具调用+结果重组，**安全判断如果只看当前用户消息，很容易漏掉跨轮组合意图**。**更稳的方式是把风险判断拉到工作流层**——一次请求 + 历史上下文 + 工具输出 + 计划步骤 + 最终产物都要进入同一条审计链。某个片段看起来无害，不代表最终组合结果无害。

**"攻击面像系统"标志着 Agent 安全从内容风险时代进入动作风险时代。** 当模型只能聊天时，安全边界主要在文本输出。当模型能搜索、读写文件、调用 bash、生成 artifact、使用 MCP、连接外部 app 时，**边界就扩展到动作**。攻击者关心的不只是模型会说什么，还会关心**模型能碰到什么、能把数据送到哪里、能不能诱导它调用某个工具**。**MCP 联网后这一迁移尤其剧烈**——连接器让 AI 从聊天窗口走向真实账户和真实业务系统，攻击面变得更像 **SaaS 权限系统**：推荐连接器、选择供应商、读取用户数据、执行第三方动作——都不能只靠模型自觉。**对所有 Coding Agent（Claude Code、OpenCode、Cursor、Windsurf）都有启发**：系统提示词 + AGENTS.md + skills + 工具 schema 本质上都是模型可见上下文，**不要放秘密、不要放绕行路径、不要放内部开关**。

**"分类器要处理组合风险"是 Fable 5 争议的真正难点。** 攻击者可把危险意图拆成低风险问题：上下文埋进长文档、目标伪装成小说/课程/论文/测试题、多个模型/Agent 串起来。**每一步都不一定触发分类器，最终输出却可能越界**。文章提出**单点判断 → 状态判断**的演进方向：分类器要能看到**跨轮意图 + 工具调用链 + 生成产物 + 用户反复试探的轨迹**。对于高风险领域还要有**任务级别的预算和中断机制**：当系统发现方向已经偏离安全研究或合法防御，就应该停止继续提供细节，而不是等最终答案成型。**这并不意味着把所有敏感词都封死**（误伤会伤害正常研究，尤其是网络安全/防御/生命科学），更现实的做法是**分层**：普通解释给、防御建议给、检测加固给；**可执行攻击/武器化步骤/违禁合成/绕过安全系统的操作细节挡在模型外侧**。

**3 个开发者判断**把"提示词泄漏"事件升级为 Agent 工程反思框架：

**判断 1：系统提示词会越来越像基础设施配置。** 过去泄漏 prompt 大家看个热闹，研究模型人设和口癖；现在泄漏 prompt 看到的是**产品能力 + 工具协议 + 权限设计 + 安全策略**，**已经接近架构文档**。

**判断 2：Agent 安全会从模型层挪到 harness 层。** 模型拒答只是一环，**真正要管的**：执行环境 / 工具权限 / 上下文压缩 / 日志审计 / 回滚恢复 / 连接器授权 / 服务端策略。

**判断 3：红队实验要讲决策价值。** 看到一种绕过方式 ≠ 穷举 100 种变体。更好的实验问题是："**这类绕过说明分类器要改还是工具权限要改？说明 prompt 需要移出敏感规则还是需要跨轮风险聚合？**"如果某组实验只是在重复确认"还能绕"，边际信息就很低。

## 实践启示

1. **审查你自己的 Agent 系统提示词**："哪些信息一旦泄漏会出事？哪些工具权限过宽？哪些风险只能单轮判断？哪些日志根本查不到？" 这个检查比围观 Fable 5 破解更有用。文章的 8 个具体动作（不要放秘密 / 工具按最小权限 / 日志记录 / MCP 按 SaaS 权限系统设计 / 风险判断放工作流层 / 分类器从单点到状态 / 任务级别预算 + 中断 / 分层放行）应作为内部 Agent 安全审计 checklist。

2. **把"system prompt 按公开材料设计"作为 2026 H2 的安全红线**：能公开的（UX 规则、错误信息格式、工具最小说明）放 prompt；不能公开的（高风险分类、权限矩阵、fallback 路由、内部策略开关）放服务端策略层。这意味着 `AGENTS.md` / `skill` / `tool schema` 同样适用此原则——**它们都是模型可见上下文，等同于公开材料**。

3. **为 Coding Agent 引入"工作流层审计链"**：在工具调用层记录"请求 + 历史上下文 + 工具输出 + 计划步骤 + 最终产物"的完整 trace，能在事故后回放而非猜测。这与 [Loop Engineering 的"状态文件"](/raw/articles/loop-engineering-addy-osmani-challengehub) 有共鸣——两者都是"对话之外的可审计载体"。

4. **MCP 连接器按 SaaS 权限系统设计**：连接器推荐 / 用户数据读取 / 第三方动作执行不能只靠模型自觉，需要 opt-in + 权限范围 + 操作日志三件套。这是 Fable 5 提示词里"MCP App 商业边界"的具体工程化。

5. **任务级别预算 + 中断机制是高风险领域的必备**：当系统检测到方向偏离合法研究/合法防御时，**主动中断而非被动拒绝**。这与 [Harness Engineering](ch05-041-harness-engineering.html) 中的"deterministic guards" 思路一致——哪些事交给模型决定、哪些事用确定性代码保证，这条线要画清楚。

6. **红队实验重新定位为"决策输入"而非"绕过证明"**：每次越狱实验的产出应是一个工程决策（"分类器要改 / 工具权限要改 / prompt 要移出敏感规则"），而不是"我们又绕过了一种变体"——后者边际信息很低。

## CLAUDE-FABLE-5.md 6 层架构图

| 层 | 主题 | 关键内容 | 安全责任 |
|----|------|----------|----------|
| **1. 行为宪法** | 自我介绍 + 拒答口径 | Fable/Mythos 差异 + 10+ 敏感场景 | 高风险 |
| **2. 产品说明** | 产品矩阵 | Claude Code/Cowork/in Chrome/in Excel/in PPT | 中 |
| **3. 能力系统** | Memory + Artifact | 用户记忆 + 持久化 KV 存储 | 中 |
| **4. computer use** | 文件 + 幻灯片 + PDF | 先读 SKILL.md + 真实文件判定 | 中 |
| **5. 搜索与版权** | 搜索规则 + 引用 | "信息是否会变"决策 + 长引用限制 | 中 |
| **6. 工具和环境** | 完整工具 schema | bash/web/file/MCP/网络白名单/只读目录 | **高** |

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/claude-fable-5-prompt-leak-runtime-control-plane-vibecoder-2026.md)

## 相关实体

- [Claude Fable 5 安全寓言](ch01-649-reinforcing-recursive-language-models-alphaxiv.html) — Nathan Lambert 的安全政策分析
- [Fable 5 on AWS Bedrock](ch01-293-anthropic-claude-fable-5-on-aws-内置保护措施的-mythos-级功能现已推出.html) — 企业部署视角
- [Mollick Fable 5 patron vs wizard](ch01-242-claude-fable-5-ethan-mollick-hands-on-qualitative-evaluati.html) — 用户体验视角
- [阿里云云原生 安全护栏三域演进](ch01-252-claude-code-harness-claude-code-100-loop.html) — 3 域对比（云资源约束 / AI 输出约束 / 模型路由约束）
- [Mythos bug hunting 营销](ch01-675-anthropic-s-bug-hunting-mythos-was-greatest-marketing-stunt.html)
- [System over Model tested](ch01-754-claude-code-agent-teams-agent-runtime-lead-task-list-m.html) — 评测视角
- [Loop Engineering](ch05-002-loop-engineering-13-addy-osmani-boris-cherny-pete.html) — 状态文件作为对话外可审计载体
- [Anthropic 12 MCP 生产模式](ch04-032-people-oriented-agent-oriented-infra.html)
- [Anthropic 14 Skill 模式](ch04-030-agent-memory-architecture-past-influence-future-ruofei.html)
- [Skill Issues Claude Code](ch09-084-ai.html) — 同样的 supply chain 攻击视角
- [System Prompt vs Post-Training — 行为约束应进训练而非 prompt](ch01-232-three-years-from-gpt-3-to-gemini-3.html)
- [AIMap Security Testing](ch04-356-github-s-plan-for-agents-kyle-daigle-github.html) — 同样聚焦 AI Agent 安全测试
- MOC

---
