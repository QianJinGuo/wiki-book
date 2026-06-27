# Ch08 多 Agent 协作

> 从单兵到团队：编排、通信、治理

> 本章收录 **24 篇**实体，按深度递增排列。

---

## 本章导航

| Level | 含义 | 篇数 |
|-------|------|------|
| ⭐ 入门 | 零基础可读 | 2 |
| ⭐⭐ 工程师 | 需编程基础 | 3 |
| ⭐⭐⭐ 专家 | 需ML基础 | 18 |
| ⭐⭐⭐⭐ 科学家 | 需研究背景 | 1 |

---

## 导读

一个 Agent 能完成简单任务，但复杂任务需要团队。

本章探讨多 Agent 协作的核心问题：如何编排（谁先做、谁后做、谁并行）、如何通信（共享上下文 vs 消息传递）、如何治理（冲突解决、权限控制、审计追踪）。

你会看到 Claude Code 的 Subagent 如何避免上下文污染，OpenClaw 的多 Agent 团队搭建经验，以及阿里云 AgentRun 的 A2A 开放协议。

多 Agent 不是"把任务分给多个 Agent"那么简单——通信开销、状态同步、故障传播，每一个都是工程挑战。

---

## Ch08.001 Hermes+Kimi K2.6 多Agent军团实战教程

> 📊 Level ⭐ | 14.1KB | `entities/hermes-agent-k2-6-tutorial.md`

## Overview
苍何（微信公众号，521篇原创）的万字实战教程，手把手演示用 Hermes Agent + Kimi K2.6 搭建 7×24h 不间断运行的 AI 研发军团。从飞书下达需求到最终交付，市场调研、PRD、架构设计、开发、测试全部由不同 Agent 自主完成。
原文：https://mp.weixin.qq.com/s/x_Jtmk4-ThuNtZTGqJqncQ
> **注**：本文为个人开发者经验分享，置信度 medium。技术步骤（安装命令、Profile创建）可验证；具体数据指标请以官方文档为准。

## 工作流程
```
飞书发需求 → 总管(commander) → 市场调研 → 产品设计 → 架构设计 → 开发实现 → 测试验收
```
每个 Agent 独立上下文、互不干扰，Agent 间通过飞书互相通信。开发总监自主调用本地 Claude Code（含 K2.6 模型）进行代码开发，实现"7×24小时无人值守"。

## Profile 体系
| Profile | 角色 | 职责 |
|---------|------|------|
| commander | 总管 | 接收需求、调度流程、协调各 Agent |
| market-director | 市场总监 | 市场调研、竞品分析 |
| product-director | 产品总监 | PRD 文档输出 |
| architect-director | 架构总监 | 技术架构设计，有权打回产品返工 |
| dev-director | 开发总监 | 通过 tmux 控制本地 Claude Code 执行开发 |
| test-director | 测试总监 | 全面测试、输出测试报告、跟进修复 |
> 核心理解：每个 profile 是独立 Agent，有独立 workspace（上下文不污染）。

## 安装配置
### 一键安装
```bash
wsl
curl -fsSL https://raw.githubusercontent.com/NousResearch/hermes-agent/main/scripts/install.sh | bash
```

### 创建 Profile
```bash
hermes profile create commander
hermes profile create market-director
hermes profile create product-director
hermes profile create architect-director
hermes profile create dev-director
hermes profile create test-director
```

### 启动
```bash
source ~/.bashrc  # 或 ~/.zshrc
hermes
```

### 飞书网关配置
```bash
hermes gateway setup

# 选择飞书 → 自动创建机器人（推荐）/ 手动输入 AppID+AppSecret
# 授权方式：私聊配对授权
# 安装 systemd 服务
sudo $(which hermes) gateway install --system --run-as-user <username>
sudo $(which hermes) gateway start --system

# 验证
systemctl status hermes-gateway
```

## Kimi K2.6 在多 Agent 场景的优势
| 能力 | 说明 |
|------|------|
| 超长上下文窗口 | 支持大规模任务输入，关键信息不被截断 |
| 长任务链路稳定 | 多轮任务不丢上下文，链路完整不断掉 |
| 多工具协同能力强 | 文件读写/终端/搜索混合调用，决策准确率高 |
文章观点：K2.6 让"给方向、它自跑"成为可能，中途几乎不需要人工介入纠偏。

## 核心原理解析
### 四组件
| 组件 | 职责 | 类比 |
|------|------|------|
| Profiles | 多个独立 Agent 的组织方式 | 公司里的不同部门 |
| Gateway | Agent 对外收发消息的通道 | 公司的前台/客服 |
| Honcho | 多 Agent 共享长期记忆和上下文 | 公司的共享知识库 |
| tmux | 进程保活工具（非通信机制） | 让办公室的灯一直开着 |

### Agent 间任务交接流程
1. 总管通过 Honcho 写入共享上下文（需求+调研报告）
2. 总管通过 Gateway 发送飞书通知 @目标 Agent
3. 目标 Agent 从 Honcho 读取共享上下文，开始工作
4. 完成后回写结果，通过 Gateway 通知总管

### 核心公式
```
角色化分工（Profiles）+ 共享上下文（Honcho）+ 明确任务交接（Gateway）= 多 Agent 协同
```

## 常见问题
| 错误类型 | 典型报错 | 解决方式 |
|----------|----------|----------|
| 命令找不到 | `hermes: command not found` | `source ~/.bashrc` |
| Python 版本低 | `requires Python >=3.10` | 升级 Python 到 3.10+ |
| API Key 错误 | `Invalid API key` | 检查 `.env` |
| 上下文溢出 | `context length exceeded` | 清理会话历史或换大模型 |
| Subagent 超时 | `RPC timeout after 30s` | 增加超时时间 |

## 结论
> "框架负责协调，模型负责执行。一个好的多 Agent 框架配上一个真正能打长任务的模型，才是这套方案的核心竞争力所在。"

## 深度分析
**框架与模型的协同效应**
Hermes Agent 框架与 Kimi K2.6 模型的组合体现了"框架负责协调、模型负责执行"的分工理念 。框架承担了多 Agent 间的通信、任务调度和上下文管理，而 K2.6 则凭借其超长上下文窗口和长任务链路稳定性，负责具体的推理和生成任务。这种分工使得系统能够处理复杂的端到端工作流，而无需人工在每个环节介入。
**四组件的职责边界**
从原文的结构可以看出，Profiles、Gateway、Honcho、tmux 四组件各司其职 。值得注意的是，tmux 仅负责进程保活，并非 Agent 间通信机制——这种关注点分离（separation of concerns）避免了将进程生命周期管理与消息传递混淆。 Honcho 作为共享记忆层，是实现"上下文不污染"这一核心特性的关键：每个 Agent 有独立 workspace，需要共享的信息通过 Honcho 显式传递。
**K2.6 在多 Agent 场景的独特价值**
原文强调 K2.6 解决了传统模型在长链路任务中的上下文丢失问题 。在多 Agent 场景中，这意味着：总管下达的复杂需求可以完整传递给下游 Agent，而无需人工拆分任务边界；开发总监能够自主完成从需求理解到代码实现的完整链路，中间无需人工纠偏。
**与单 Agent 开发的本质区别**
传统单 Agent 方案的核心瓶颈在于：随着任务复杂度增加，上下文窗口被快速耗尽，Agent 难以保持对全局目标的追踪。多 Agent 军团方案通过职责分离（每个 Agent 只关注一个环节）和显式交接（通过 Honcho + Gateway）来缓解这一问题。每个 Agent 的上下文窗口只承载其职责范围内的信息，而非整个项目的全部历史。

## 实践启示
**基础设施准备**
采用这一架构需要以下基础设施：WSL 或原生 Linux 环境（tmux 依赖）、Python 3.10+（Hermes Agent 要求）、有效的 Kimi API Key、以及飞书账号（作为人机交互和 Agent 间通信的渠道）。原文提供了一键安装脚本，但 systemd 服务的配置（`--system --run-as-user`）需要根据实际部署环境调整 。
**最小可行配置的验证路径**
建议从最小配置开始验证整个链路：先只部署 commander + 一个执行 Agent（如 market-director），跑通"飞书发需求 → Agent 执行 → 结果回传"的完整闭环。在此基础上，再按需增加 product-director、architect-director 等角色。过早引入全部 6 个 Agent 会导致问题定位困难（无法判断是哪个环节出错），也会不必要地消耗 API 调用配额。
**上下文溢出的应对策略**
当工作流链路变长时，上下文字符数会持续累积（每个 Agent 的历史输出都在 Honcho 中）。原文提到的"上下文溢出"错误  本质上需要从两个维度解决：一是设计更精简的 prompt 和输出格式，减少每个 Agent 的文本量；二是对 Honcho 中的历史信息做定期压缩（如只保留关键决策点，而非完整日志）。
**飞书网关的高可用配置**
生产环境中，应确保 hermes-gateway 作为 systemd 服务运行，而非前台进程（断连后不会自动重启）。使用 `systemctl status` 和 `journalctl -u hermes-gateway -f` 验证服务状态是部署后的必要检查步骤 。若在 WSL 环境中使用 systemd，需要额外配置（如 genie 或直接用 WSL2 的 systemd 支持）。
**Agent 角色划分的设计考量**
从原文的 Profile 体系可以看出职责划分原则 ：每个 Agent 的职责边界清晰（一个 Agent 只做一件事）、信息流向明确（单向链式而非网状）、且设置了一个"有否决权"的环节（architect-director 有权打回产品返工）。这种设计避免了在复杂任务中多个 Agent 同时输出冲突结果的问题。

## Related
- [Hermes Agent](/ch04-418-hermes-agent/) — Nous Research 开源框架，核心基础
- Hermes Agent 深度解析（阿里云） — Self-Evolving/Prompt/Context/Harness 四维度技术解析
- [Claude Code 架构](/ch01-571-claude-code-架构解析/) — 开发总监调用 Claude Code 实现自动写代码
- [Hermes 自进化机制](/ch04-418-hermes-agent/) — Skill 生成 + RL 训练双路径
- [claude-code-agent-view-huashu](/ch03-065-claude-code-agent-view-huashu/)
[K2-6 多 Agent 教程](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/hermes-agent-k2-6-multi-agent.md)

## 相关实体
- [四种 Sub Agent 模式](/ch04-302-四种-sub-agent-模式/)
- [10x is a lot](/ch03-027-10x-is-a-lot/)
- [还在手写 os.getenv？pydantic-settings 让你配置管理效率翻倍](/ch03-031-还在手写-os-getenv-pydantic-settings-让你配置管理效率翻倍/)
- MOC

---

## Ch08.002 OpenClaw 多智能体团队搭建实战经验

> 📊 Level ⭐ | 5.2KB | `entities/openclaw-multi-agent-team-practice.md`

## 花园多智能体团队（7个Agent）
1. **花园生图助手** — Nanobana + Seedream 模型，定义审美偏好
2. **花园资讯助手** — 每日自动抓取AI动态，整理日报推送
3. **花园开发助手** — 手机飞书远程控制 Claude Code
4. **花园投资助手** — 个股数据分析、走势指标、买卖建议
5. **花园社区助手** — Moltbook 运营、内容发布、评论互动
6. **花园写作助手** — 写作搭档：记忆风格、搜索资料、梳理大纲
7. **花园智能专家** — 协调各Agent协作处理复杂任务

## 核心设计原则
- **每个 Agent 一个飞书 Bot** — 像在公司群里 @不同同事
- **单 Agent 只做一件事** — 不堆叠技能，模块化设计
- **主管 Agent 协调** — 智能专家了解所有 Agent 的能力，复杂任务编排
- **零人工干预** — 日报生成、股票分析等已做到每日自动运行

## 深度分析
ConardLi 的实践经验揭示了多智能体团队从"安装了什么"到"能做什么"的关键跃迁。核心洞察是：**Agent 不是设计出来的，是用出来的**——从每日最高频需求出发逐个搭建，而非一开始就规划完整的体系。
**不做全能 Agent 的三大理由**：上下文污染（一个 Agent 的注意力被多领域术语分散）、技能冲突（开发协议权限对写作助手多余且有安全风险）、人设冲突（投资助手的严谨与写作助手的有温度无法共存）。这对应了 Agent 设计的最小权限原则和关注点分离原则。
**联邦学习效应**：多 Agent 团队的价值不仅在于并行处理，更在于各 Agent 在自己领域持续优化形成的能力积累。当生图助手积累了审美偏好、投资助手积累了金融模型、写作助手学会了风格偏好，整个团队的能力在各自维度上持续进化，这是单一全能 Agent 难以实现的。

## 实践启示
- **从高频场景切入**：不要试图规划完美的 Agent 体系，先观察自己每天重复最高频的任务是什么，从那里开始一个个搭建
- **人设即边界**：每个 Agent 的人设（role + behavior + communication style）就是它的边界，定义清楚比塞更多技能更重要
- **主管 Agent 的协调价值**：当任务需要多个 Agent 协作时，主管 Agent 的存在使得复杂任务的编排成为可能，而不是让用户自己决定该 @谁
- **Bot 即入口**：每个 Agent 绑定独立飞书 Bot 的设计降低了使用门槛——用户不需要学习复杂的命令或工作流，只需要像在群里 @同事一样自然地对话

## 实践经验
- Agent 不是设计出来的，是用出来的 — 从每日最高频需求出发逐个搭建
- 写了 Agent Skill 后要反复调试，确保工具调用准确
- 多 Agent 团队的价值在于"联邦学习"——各 Agent 在自己的领域持续优化
→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/openclaw-multi-agent-team-practice-v2.md)

## 相关实体
- [龙虾装上了可以用来干啥 - OpenCLAW 多智能体团队搭建经验](/ch04-038-openclaw-multi-agent-team-practice-v2/)
- [基于 Amazon EKS 和 Graviton 构建多租户 AI Agent 平台：OpenClaw on Kubernetes 实践 | 亚马逊AWS官方博客](/ch11-050-基于-amazon-eks-和-graviton-构建多租户-ai-agent-平台-openclaw-on-kuber/)
- [Multi-Agent 架构在零售供应链运营中的实践：贯穿数据、洞察与行动 | 亚马逊AWS官方博客](/ch11-201-multi-agent-架构在零售供应链运营中的实践-贯穿数据-洞察与行动-亚马逊aws官方博客/)
- [你不知道的 Agent 原理架构与工程实践](/ch04-300-agent-principle-architecture-engineering-practice/)
- [Agent 原理、架构与工程实践](/ch04-435-agent-engineering-principles-architecture-practice/)
- [OpenCLAW 完全指南](/ch04-199-openclaw-完全指南/)

---

## Ch08.003 Oz Multi-Harness Cloud Agent Orchestration (Warp)

> 📊 Level ⭐⭐ | 12.1KB | `entities/oz-multi-harness-cloud-agent-orchestration.md`

# Oz Multi-Harness Cloud Agent Orchestration

Warp 在 2026-05-19 推出 [Oz](https://www.warp.dev/oz) 重大升级，将其定位为**首个真正的多 harness 云 Agent 控制平面**。核心命题：**「企业不应该被迫把未来押在单一模型或 harness 上」**。Oz 在云端统一编排 Claude Code、Codex、Warp Agent 三个主流 harness，提供自动多 Agent 编排、跨 harness 的 Agent Memory、扩展的自托管选项（Docker / Kubernetes / 远程开发环境）、以及精细化成本与权限治理。这是 Agent 编排模式从「单 harness 多 model」升级到「多 harness 多 model」的标志性事件。

→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/oz-multi-harness-cloud-agent-orchestration.md)

## 摘要

Warp 团队与工程领导者深度合作后总结出三大共同需求：（1）2026 年要规模化部署云 Agent，但需要可控可治理；（2）需要 harness 选择权——不同任务用不同 harness 并测量效果；（3）希望 Agents 跑在自己的基础设施上，数据完全所有。本次 Oz 升级正面回应这三点。最大变化是 **multi-harness**：Oz 原本就是 multi-model，现在进一步抽象到 harness 这一层，因为「Agent 性能是 harness 和 model 的联合函数」。它成了所有云 Agent 的 single pane of glass——统一的启动、追踪、治理、对比、审计接口。

## 核心要点

- **核心定位**：first truly multi-harness control plane for cloud agents——比 [AgentCore Harness](/ch04-206-agentcore-managed-harness/) 多了一层「harness 选择权」的抽象
- **支持的 harness**：Claude Code、Codex、Warp Agent 三家可在云端互换运行；multi-harness orchestration 对所有用户开放（beta）
- **自动多 Agent 编排**：Oz 可以自动 spawn 多个 subagent 并行处理长时任务（大特性构建、code migration、生产部署），跨 harness 自动追踪、steering、提供管理界面
- **跨 harness Agent Memory（research preview）**：业界第一个跨 harness 的记忆系统——code review agent 学习团队代码风格、生产 agent 记住部署拓扑、数据分析 agent 记住数据结构
- **Agent Memory 关键特性**：（1）可插拔数据源（文件、MCP、数据库、企业应用）；（2）可写入（Oz 完成任务后自动添加到知识库）；（3）企业可自托管，自己拥有 memory corpus
- **扩展自托管**：支持有/无 Docker、Kubernetes pods、远程开发环境，直接代码执行也可——「Oz works with your existing systems」
- **治理增强**：per-team billing、个人 credit cap、用量与产出可视化；每个 agent 的服务访问权限可独立设置，对应「Least Privilege for Agents」原则
- **会话便携**：API/SDK 支持返回 artifacts + 原始对话；本地 ↔ 云端 ↔ 远程随时切换——「手机上启动十个 agent、笔记本继续、晚上推回云端」
- **战略含义**：Warp 从「最好的终端」延伸到「云 Agent 的 Kubernetes」——这是终端公司向 AI 基础设施迁移的典型案例

## 深度分析

### 「不要押注单一 harness」是 2026 企业 AI 战略的核心命题

Oz 给出的命题非常清晰：**「Agent 性能是 harness 和 model 的联合函数」**。这一句话至少包含三层判断：

1. **harness 和 model 是正交维度**：同样的 Claude 4 跑在 Claude Code、Cursor、自研 harness 里表现差异巨大——上下文管理、tool 调用策略、规划方式都不同
2. **不同任务的最优 harness 不同**：代码审查可能 Codex 更稳，长任务规划可能 Claude Code 更强，自定义脚本可能 Warp Agent 最贴合
3. **多供应商对冲是基础设施层的责任**：让业务侧自己写 harness 适配是错的，应当由编排层抽象掉

这与 Agent 框架对比中的核心论点一致——但 Oz 是少数把这个判断**直接做成产品**的厂商。绝大多数企业当前还在「按 harness 各自做 PoC」的阶段，Oz 是把这一阶段产品化的尝试。

### Cross-Harness Agent Memory 是真正的差异化

公告里其他特性（Kubernetes 自托管、per-team billing、API/SDK）基本都是「企业必选项的补全」；唯一真正具有产品壁垒的是 **cross-harness Agent Memory**。

它的设计有几点值得特别关注：

- **跨 harness**：Claude Code 学到的东西可以被 Codex 复用——这要求 memory 不能绑定到 harness 的内部表示
- **可写入**：Oz 完成任务后自动追加到 memory，形成 self-improvement 闭环
- **可插拔数据源**：文件（skills）、MCP、数据库、企业应用——把企业现有知识资产纳入 Agent 上下文
- **可自托管**：「Warp 可以替你托管，但我们相信企业会想自己拥有 corpus」——这一句直接回应了企业对数据所有权的核心顾虑

这套架构与 [Agent Memory 架构](/ch04-146-agent-memory-架构本质/)和 Agent 记忆系统框架中讨论的「双向、长期、企业自有」三个理想性质完全对齐。它和 Obsidian + QMD 类型的本地方案（见 [Obsidian + Claude Code 集成指南](/ch03-072-obsidian-claude-code-完整集成指南-五种知识管理策略/)策略 5）属于同一思路的两个层级：QMD 是个人工作站方案，Oz Agent Memory 是企业方案。

### 「single pane of glass」对企业 AI 治理的真正含义

Oz 反复强调「统一控制平面」——这是企业 AI 部署的核心痛点。在没有 Oz 的世界里：

- Claude Code 的使用统计在 Anthropic 后台
- Codex 的使用在 OpenAI 后台
- Warp Agent 在 Warp 自己
- 各自的审计日志、权限模型、计费维度完全不同
- 想知道「我们公司这个月 AI 总开销 / 高风险操作」需要至少跨三个系统

Oz 的价值是把「**审计 / 治理 / 计费 / 权限**」这四件事从 harness 厂商手里收回到企业自己的控制平面里。这对受合规约束的行业（金融、医疗、政府）几乎是必选项。

### Least Privilege for Agents：从理论走向产品

文中提到「individual agents to have granular permissions to internal services, following the model of allowing agents to have the least privilege」——把信息安全里的最小权限原则正式应用到 Agent 上。

具体含义：**处理生产系统的 agent** 和 **访问 CRM 的 agent** 应当持有完全不同的凭证集合。这与 Agent 安全架构中讨论的核心原则一致，但 Oz 把它从「最佳实践建议」做成了「产品默认配置」。

这是个被严重低估的特性。当前 AI Agent 安全事故的相当一部分根因是「Agent 用了过宽的服务账号」——给 read-only 任务的 agent 配了 admin 凭证，然后被 prompt injection 引发越权操作。

### 战略层面：Warp 从「终端」延伸到「AI 基础设施」

Warp 起家是「最好用的现代终端」，现在通过 Oz 把战线推到了云 Agent 编排层。这是一个非常聪明的 land-and-expand：

- 终端是开发者每天都开的入口
- 从终端 → 终端里集成 Agent → 多个 Agent 协作需要 orchestration → 自然演化到云端控制平面

对比：Cursor 从编辑器切入，Replit 从云开发环境切入，[AgentCore](/ch04-428-harness工程火遍硅谷-agentcore今天交卷/) 从云厂商基础设施切入——四条路径都在收敛到同一个目标（**企业级 Agent 控制平面**），但起点完全不同。Warp 的路径有「终端无关于 IDE」的优势，可以兼容 VS Code、Cursor、JetBrains 的用户。

### 与 AgentCore 的微妙差异

Oz 和 AWS [AgentCore](/ch04-428-harness工程火遍硅谷-agentcore今天交卷/) 在功能列表上有大量重叠，但定位有微妙不同：

| 维度 | Oz | AgentCore |
|---|---|---|
| 抽象层级 | harness 编排 | runtime 托管 |
| 默认绑定 | 工具中立 | AWS 生态 |
| 多 harness | 是（Claude Code/Codex/Warp Agent） | 主要是 Strands SDK 框架 |
| 自托管 | Kubernetes / 远程开发环境 | 主要是 AWS |
| 切入用户 | 已有 AI 工具试点的工程团队 | AWS 已有客户 |

简单说：AgentCore 是「AWS 让你在 AWS 上跑 Agent 更方便」，Oz 是「让你在任何地方跑任何 harness 更方便」。两者会在中型企业市场正面竞争。

## 实践启示

1. **企业 AI 选型应当假设 multi-harness**：不要把所有押注放在一个 harness 上——半年后最佳实践可能完全不同
2. **Agent Memory 是下一个差异化战场**：评估编排平台时，问「memory 是否可写入、跨 harness、可自托管」三件事
3. **Least Privilege 必须从一开始就做**：不要给所有 agent 同一个 admin 凭证——按服务类型拆分凭证
4. **会话便携性是新基础设施特性**：本地 ↔ 云端 ↔ 远程随时切换，会改变开发者的工作节奏
5. **single pane of glass 是合规行业的硬需求**：金融/医疗/政府绕不开统一审计与治理
6. **关注 Warp 的产品演化**：从终端切入做 AI 基础设施是值得追踪的战略路径
7. **AgentCore vs Oz 的选型逻辑**：已在 AWS 的选 AgentCore，工具中立选 Oz，跨多家 AI 厂商必选 Oz
8. **「harness 是性能维度」是新的工程认知**：性能调优不再只是换模型——换 harness 可能效果更显著

## 相关实体

- [Agentcore Harness](/ch04-206-agentcore-managed-harness/) — AgentCore Harness 综述
- [Agentcore Managed Harness](/ch04-428-harness工程火遍硅谷-agentcore今天交卷/) — Managed Harness 定位
- [Agent Harness Architecture](/ch04-207-agent-harness-架构/) — Agent Harness 架构
- [Agent Harnesses Are Dead Long Live Agent Harnesses](/ch04-505-agent-harnesses-are-dead-long-live-agent-harnesses/) — Harness 演进观察
- [Agent Memory Architecture](/ch04-146-agent-memory-架构本质/) — Agent Memory 架构综述
- [57U6Xekcgtvkqxnnqg9Djq](/ch03-072-obsidian-claude-code-完整集成指南-五种知识管理策略/) — Obsidian + Claude Code 集成（个人版的跨 harness 记忆）
- Agent Orchestration Patterns — Agent 编排模式
- Multi Agent Orchestration — 多 Agent 编排
- [Harness Engineering Framework](/ch05-041-harness-engineering-概念框架/) — Harness 工程框架
- Agent Security Architecture — Agent 安全架构
- Agent Memory Systematic Framework — Agent 记忆系统框架
- MOC

---

## Ch08.004 这篇52页综述把AI做科研这件事，明明白白划成了L0到L4五个等级

> 📊 Level ⭐⭐ | 7.1KB | `entities/autoresearch-ai-scientific-discovery-l0-l4-challengehub.md`

> -> [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/autoresearch-ai-scientific-discovery-l0-l4-challengehub.md)

# AI做科研：L0到L4五级自主度框架

## 核心框架

arXiv 2605.23204v1《AutoResearch AI》给出了L0-L4五级自主度框架——按workflow控制权、任务执行权、验证权、科学问责权看人和AI怎么分工：

| 等级 | 描述 | 代表系统 |
|------|------|----------|
| **L0** | Human Only，纯人工 | 历史基线 |
| **L1** | Human-Led, AI-Assisted | ChatGPT/Claude/Gemini 辅助科研 |
| **L2-S** | 单步自动化执行 | Coscientist (Nature 2023) |
| **L2-I** | 交互式工作流自动化 | AI co-scientist (Nature 2026) |
| **L2-P** | 流水线自动化（人验证下） | The AI Scientist、AI Scientist-v2、Agent Laboratory |
| **L3** | AI-Led, Human-Assisted | **目前无系统达到** |
| **L4** | AI-Autonomous | **理想化远期目标，无任何系统达到** |

**关键切分**：L1-L2是Vibe Research（人在驾驶座），L3-L4才是真正的AutoResearch。「pipeline能跑通 ≠ 到了L3」——只要还需要人判断hypothesis是否有意义、experiment是否valid、result是否reproducible，就还在L2-P。

## 核心警示

「流程被打通了」不等于「科研自主了」。当前系统在搜索、起草、写代码、bounded execution 上越来越强，但 validation、rejection（拒绝弱方向）、reproducibility、exception handling、accountable closure 这些环节还差得远。

## 五个评估维度

从「任务完成度」切换到「科学可信度」：
- **Novelty**（新颖性）
- **Validity**（有效性）
- **Impact**（影响力）
- **Reliability**（可靠性）
- **Provenance**（可溯源性）

## 领域间不均衡

- **计算/形式科学**最快：artifact 本身是 digital/executable/replayable
- **化学/材料**：有 robotic lab 支持
- **生物/医学/社科**：embodiment、ethical constraint、causal reasoning 的难度不是「加大模型」能解决的

**重要判断**：不要拿 coding agent 的进展去推断「AI能做全科学的端到端研究」。

## 深度分析

### 从专用模型到通用科研Agent的范式跃迁

这篇综述揭示了一个根本性转变：AlphaFold代表的**专用模型时代**和以LLM驱动的**通用科研Agent时代**是两条不同的路。AlphaFold把单一任务做到极致，但无法迁移；LLM驱动的系统则在广度上打开了一扇门——文献调研、想法生成、计划制定、代码执行、结果分析、论文撰写，第一次有可能被同一个系统串起来。

### L2-P的三种形态揭示了当前Pipeline的分化

L2-P内部存在显著分化：**单步执行（L2-S）**、**交互式工作流（L2-I）**、**流水线自动化（L2-P）** 代表了不同程度的自动化成熟度。Coscientist代表单步执行能力；AI co-scientist引入了交互迭代；The AI Scientist则试图做端到端流水线。这种分化说明当前所谓的"SOTA系统"实际上能力梯度很大，不能一概而论。

### 为什么L3是真正的分水岭

L3的核心要求是**AI主导、人辅助**——这意味着机器不仅执行任务，还要判断hypothesis的价值、决定实验方向、承担科学责任。目前没有任何系统达到L3，关键卡点在于：validation能力不足、rejection能力（即主动放弃弱方向）几乎为零、reproducibility验证缺失、exception handling机制不完善。这不是加大模型参数能解决的，需要架构层面的创新。

### 当代Landscape的分工架构说明什么

当前Landscape不是被某个统一架构统治，而是分为**知识支持层**（文献 grounding、QA、planning）、**执行底座层**（code agent、tool use）、**Pipeline协同层**（The AI Scientist等）、**开源基础设施层**（NanoResearch、ResearchClaw等）。这种分工提示：端到端系统还处于非常早期，基础设施正在成为竞争焦点。

## 实践启示

1. **不要被demo误导**：看到"端到端科研Agent"的演示视频时，首先问清楚它在哪一级——是L2-S/L2-I还是L2-P，距离L3还有多远。
2. **评估重点切换**：从"任务完成率"转向"科学可信度"——novelty、validity、reliability、provenance五个维度才是衡量科研AI的真正标尺。
3. **领域差异巨大**：计算科学可以快速推进，生物医学受限于embodiment和ethical constraint，社科则几乎无法自动化。选择落地场景时必须考虑领域特性。
4. **基础设施是壁垒**：2026年的趋势是从"研究agent demo"转向"可复用研究基础设施"——NanoResearch、ResearchClaw、AutoResearchClaw等正在建立workspace、可复用环境、persistent project state的能力。这将是下一阶段的核心竞争力。
5. **L3路线图**：如果要向L3推进，重点必须放在validation/rejection能力建设、reproducibility自动化、exception handling机制，以及最终的accountable scientific closure能力上。

## 相关主题

- [AutoResearch 多Agent软件开发](/ch09-030-autoresearch-多-agent-自动化软件开发/) — Karpathy 风格，software engineering 场景（非science）
## 相关实体

- nature丨google和futurehouse同日登刊，把ai科学助理推到科研前线
- MOC

---

## Ch08.005 微软 Agent Framework 全栈指南（Python）

> 📊 Level ⭐⭐ | 5.4KB | `entities/microsoft-agent-framework-python-zizhi.md`

> 来源：[原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/microsoft-agent-framework-python-zizhi.md)

## 深度分析
**1. 三层架构的统一抽象：Agent / Workflow / Hosting 解耦设计**
微软 Agent Framework 的核心价值在于将 Semantic Kernel 的企业底座、AutoGen 的 Agent 抽象与新增的 Workflow 图编排整合为统一 API。框架明确区分了三种场景的选型原则：开放对话、自主调工具 → Agent；步骤固定、要强控执行顺序 → Workflow；纯确定性逻辑 → 普通函数。这种分层使得开发者可以根据任务性质选择合适的编程模型，而非强行把所有场景都塞进 Agent。
**2. Provider 模式实现记忆与上下文的可组合性**
Step 4 展示的 `ContextProvider` / `HistoryProvider` 体系是框架最的设计亮点。通过 `before_run` 和 `after_run` 钩子，开发者可以在每轮对话前后注入自定义上下文或提取状态。多个 Provider 可以组合（记忆存储 + 外部记忆 + 审计），且只有一个应设置 `load_messages=True` 以避免重复回放。这套模式比直接硬编码记忆逻辑更具工程化价值。
**3. 工具安全模型：从 Demo 到生产的必要跃迁**
文章用 `approval_mode` 参数区分了演示环境（`never_require`）与生产环境（`always_require`）的差异。工具描述（docstring + `Field(description=...)`）的质量直接影响模型调用准确率，这个细节在很多入门教程中被忽略。生产 checklist 进一步强调了 ManagedIdentityCredential 优于 DefaultAzureCredential（避免探测延迟与安全面），说明框架设计者对企业安全有清晰认知。
**4. Workflow 与多 Agent 的组合模式**
Step 5 揭示了框架的编排野心：图中节点可以是 Agent，边定义协作顺序；需要对外暴露为单一 Agent 时，可将 Workflow 包装为 `AIAgent` 接入 A2A/OpenAI 兼容端点。这意味着框架既支持细粒度的多 Agent 协作，也支持将协作结果封装为统一接口，兼顾了灵活性与易用性。
**5. 六步能力矩阵的渐进式学习路径**
文章将 Agent 开发分为六个阶段（首 Agent → 工具 → 多轮 → 记忆 → 工作流 → 托管），每步都有明确的 API 概念和解决的问题。这种设计符合认知负荷理论：开发者可以从简单场景起步，逐步引入复杂特性，而不需要在一开始就理解整个框架。

## 实践启示
**1. 从 pip install 到 Azure Functions 暴露 HTTP，路径清晰**
Python 侧的开发体验设计良好：`pip install agent-framework` 后，用 `FoundryChatClient` 接模型，`Agent` 创建实例，`agent.run()` 验证逻辑，最后用 `AgentFunctionApp` 暴露为 HTTP 端点。建议按 01 → 06 顺序在本地跑通示例后再接入业务数据与鉴权，避免过早引入复杂性。
**2. Session 是会话级状态容器，分布式部署需对接外部存储**
文章特别指出：同一 `session` 对象贯穿多轮 `run()`，历史由框架在会话内维护。但分布式部署时需把 Session 与存储后端（Redis、数据库等）对接，而非仅依赖进程内对象。这意味着单进程开发环境与生产环境的 Session 管理策略需要分别设计。
**3. 工具描述质量直接影响调用准确率**
在定义工具时，docstring 和 `Field(description=...)` 的描述会进入模型的 function schema。生产环境中应投入时间优化这些描述，而非仅关注函数逻辑本身。工具描述质量是模型能否准确调用工具的关键因素。
**4. 生产环境优先使用显式凭证**
开发环境可用 `AzureCliCredential`，但生产建议 `ManagedIdentityCredential` 等明确凭证。这避免了 `DefaultAzureCredential` 的探测延迟（首次调用时会尝试多种凭证源）和潜在的安全风险。迁移旧项目时需要特别注意这一配置变更。
**5. Provider 组合时注意 load_messages 互斥**
多个 `HistoryProvider` 组合时，只有一个应设置 `load_messages=True` 以避免多存储重复回放。审计类 Provider 应放在列表末尾并设置 `store_context_messages=True` 以记录其他 Provider 注入的上下文。这个约束需要在设计阶段就明确，否则运行时会出现难以排查的重复消息问题。
## 相关实体
- [Microsoft Agent Framework Python Full Guide Zizhi](/ch01-585-微软-agent-framework-全栈指南-从-hello-agent-到生产托管-python/)
- [Microsoft Agent Framework Structured Output](/ch03-102-microsoft-agent-framework-结构化输出-response_format-与-response-v/)
- [Microsoft Agent Framework Tools Overview Provider Matrix](/ch07-063-microsoft-agent-framework-tools-总览-4-类工具-provider-矩阵-too/)
- [Agentscope Java Harness Framework Enterprise Distributed](/ch03-048-agentscope-java-harness-framework-2-0-企业级-agent-分布式场景的-har/)
- [New And Improved Agent Governance Intelligent Workflows Connected App Exp](/ch04-446-page-not-found-microsoft-copilot-blog/)

---

## Ch08.006 Claude Code Dynamic Workflows 多Agent编排

> 📊 Level ⭐⭐⭐ | 57.4KB | `entities/claude-code-dynamic-workflows-multi-agent-orchestration.md`

## 核心价值

Dynamic Workflows 把"循环/分支/复查逻辑"从主会话抽到 workflow 脚本里，主会话只拿最终报告。上下文压力小，执行稳定，适合普通 subagents 处理不了的代码库级大任务。

## vs Subagents / Skills / Agent Teams

| 能力 | 本质 | 适合场景 |
|------|------|---------|
| Subagents | 结果回主对话 | 旁路任务（查日志/读文件/局部review） |
| Skills | 操作手册 | 固定流程（写文章/发小红书） |
| Agent teams | 多session协作+互发消息 | 跨层功能开发/不同假设并行调试 |
| **Dynamic Workflows** | **任务图固化，脚本调度** | **代码库审计/文件迁移/多来源研究** |

## 关键设计边界

- **脚本不读写文件/不跑shell**：只协调 agents，真实操作由 agents 执行
- **subagent 权限继承用户 allowlist**：文件编辑自动批准；shell/web fetch/MCP 按用户配置
- **并发上限**：16 agents（低CPU可能更少），单次最多 1000 agents
- **中途不能等人输入**：只有 agent 权限提示能暂停；必须人工 sign-off 的场景需拆成多个 workflow

## 触发方式

1. **@workflow**：在 prompt 里写 `@workflow`，Claude 高亮生成 workflow 脚本。按 `Ctrl+G` 可忽略。
2. **ultracode**：`/ultracode` 是 xhigh reasoning effort + 自动 workflow 编排。Claude 自己判断哪些任务值得跑 workflow，可能拆成多个连续 workflow（先理解→实施→验证）。

内置 workflow：`@workflow:research` 从多个角度搜索资料、交叉验证 claim、生成带引用报告。

## 运行时管理

**审批阶段**：CLI 显示 planned phases，可选择运行/以后同项目不再询问/查看 raw script/取消。Desktop app 显示 approval card（workflow名/阶段列表/token使用提醒），可选 Once/Always/Deny。

**运行中监控**：`/workflow status` 查看每个 phase 的 agent 数/token总量/耗时。常用按键：`Enter` 详情/`Space` 暂停恢复/`X` 停止/`R` 重启选中agent/`S` 保存成可复用命令。

**保存位置**：项目级（进仓库，团队共用）或个人级。保存后变成 slash command。项目级优先于个人级。

## 深度分析

### 调度器 vs Worker 的职责分离

Dynamic Workflows 的核心架构是**调度器-工作者模式（Orchestrator-Worker Pattern）**的变体。workflow 脚本作为调度器存在，本身不执行业务操作，只负责任务分解、agents 派发、结果收集和汇总。这种关注点分离带来了三个实际好处：

1. **上下文隔离**：主会话不需要在整个任务生命周期中保持活跃，避免了长任务导致的上下文膨胀
2. **执行稳定性**：循环/分支逻辑固化在脚本变量里，不依赖主会话的推理判断
3. **并行效率**：多个 subagents 可同时工作，调度器等待所有 workers 完成后才汇总结论

这与 [Fan-Out 模式](/ch04-302-四种-sub-agent-模式/) 的核心区别在于：Fan-Out 是"启动和收集分离"，Dynamic Workflows 则在此基础上增加了**多阶段（phases）和互相复查**的能力。

### 与 Agent Teams 的本质区别

Sub-Agent vs Agent Team 选型 的核心判断准则：按上下文边界设计，而不是按角色设计。Dynamic Workflows 更接近 Sub-Agent 模式——subagent 之间不直接通信，所有协调经过 workflow 脚本。但它引入了**阶段（phases）**概念，使得多步骤协作成为可能。

Dynamic Workflows 适合的场景：
- 代码库审计（先 map 文件，再按模块分配 agents，最后 verifier 复查）
- 几百文件迁移（有明确的任务图，可固化执行顺序）
- 多来源研究（@workflow:research 类型，内置交叉验证逻辑）

不适合的场景：
- 做着做着需要互相调头的任务（这应该上 Agent Teams）
- 需要跨 subagent 传递中间状态的工作（Dynamic Workflows 只传递最终报告）
- 必须人工 sign-off 的决策节点（需要拆成多个 workflow）

### 并发模型的工程限制

16 agents 的并发上限对于大多数代码库级任务是够用的，但要注意：
- 低 CPU 机器可能更少（实际并发受限于机器资源）
- 单次 1000 agents 的限制意味着超大型任务需要分批跑
- subagent 总在 `@claude` 模式下运行，继承用户的 tool allowlist——如果 shell/MCP 不在 allowlist 里，中途可能需要人工授权

### ultracode 的自动编排价值

`/ultracode` 的核心价值不是"更快"，而是**自动判断任务是否值得跑 workflow 以及如何拆解**。这解决了工作流设计中最难的部分——判断什么时候需要多阶段、什么时候需要并行、什么时候需要 verifier agents。可能的拆解方式：先理解代码结构 → 再实施修改 → 最后验证。

## 使用建议

1. **先用只读审计**：确认结果质量后再跑修复型 workflow
2. **ultracode**：自动判断任务是否值得跑 workflow，可能拆成多阶段连续 workflow
3. **保存成可复用命令**：项目级（团队共用）和个人级（跨项目），项目级优先

## 示例 Prompt（审计类）

```
Phase 1: map all relevant files and entry points.
Phase 2: assign independent agents by module; each agent must cite exact files and lines.
Phase 3: run verifier agents that try to disprove each finding.
```

→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/claude-code-dynamic-workflows-multi-agent-orchestration.md)
→ [Thariq 官方博客中文版](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/claude-code-dynamic-workflows-thariq-blog-gaia.md)

## Thariq 官方博客补充：6 种模式 + 3 类失败模式

Anthropic Claude Code 团队 Thariq Shihipar 2026-06-03 发布的官方博客，补充了**使用模式分类**和**失败模式分类**——这是 VibeCoder 技术解析（聚焦调度器/worker 架构）未覆盖的视角。

### 3 类失败模式（必须用 workflow 对抗的根因）

| 失败模式 | 表现 | 触发条件 | workflow 对抗手段 |
|---------|------|---------|------------------|
| **智能体懒惰** | 多部分任务未完成时提前停下，宣称完成（如安全审查 50 项只处理 20 项） | 长任务、复杂任务 | 强制阶段化、verifier agent 检查完成度 |
| **自我偏好偏差** | 验证/评判自己的结果时倾向给高分 | 单上下文窗口、要求基于评分标准验证 | 派生独立 verifier agent（看不到原始思考） |
| **目标漂移** | 多轮对话/上下文压缩后丢失原始目标和约束 | 上下文压缩、边界条件、否定约束（"不要做 X"） | 每个 subagent 独立窗口 + 隔离目标 |

这 3 类失败模式是**为什么需要 workflow 的根本原因**，而不是简单的"任务大了装不下"。动态工作流的核心价值 = **架构性地隔离上下文 + 派生独立验证者**。

### 6 种核心模式

| 模式 | 作用 | 典型场景 |
|------|------|---------|
| **分类再行动** | 分类器 agent 判任务类型 → 路由到不同 handler | 多类型混合任务（如同时含 bug 修复 + 文档更新） |
| **扇出并综合** | 拆 N 个小步 → N 个 agent → 综合 agent 等待屏障 → 合并 | 大规模并行研究、跨文件审计 |
| **对抗性验证** | 每个生成 agent 配独立 verifier agent 评分 | 事实核查、技术主张验证、CLAUDE.md 规则验证 |
| **生成并过滤** | 围绕主题生成一批 → 评分/去重 → 留最佳 | 命名头脑风暴、设计方案探索 |
| **锦标赛** | N 个 agent 竞争同一任务 → 成对评判直到选胜者 | 排序（按 bug 严重度）、UI 选最佳 |
| **循环直到完成** | 不设固定轮数 → 满足停止条件才结束 | 大规模分诊、根因调查（不预设工作量） |

**关键观察**：6 模式不是互斥的，**实际 workflow 通常组合多种**。例如 "深度研究 skill" = 扇出（web 搜索）+ 对抗性验证（核查 claim）+ 综合（带引用报告）。

## Thariq 实战：10 大使用场景

### 1. 迁移与重构
Bun 用 workflow 从 Zig 重写为 Rust。**关键技巧**：把任务拆为 callsite/失败测试/模块等步骤 → 每个修复派生子 agent 到独立 worktree → 另一 agent 做对抗性审查 → 合并。**反模式提醒**：告诉 agent 避开资源密集型命令，最大化并行度。

### 2. 深度研究
内置 `/deep-research` skill = 扇出 web 搜索 + 抓取来源 + 对抗性验证 + 综合报告（带引用）。**不只用于 web**——也可从 Slack 汇总状态报告、或深入探索代码库理解某功能。

### 3. 深度验证
对**已有报告**做事实核查：① 一个 agent 识别所有事实性主张 ② 每条主张派生子 agent 详细核查 ③ 验证 agent 还能反查溯源 agent 用的来源质量。**双重 adversarial verification**。

### 4. 排序
1000+ 行定性排序在单 prompt 里质量急剧下降。workflow 方案：
- **锦标赛**：成对比较 agent 流水线（相对判断 > 绝对打分）
- **分桶并行**：先并行分桶排序，再合并
- **赛程管理**：确定性循环维护赛程表，只有当前 run 在上下文里

### 5. 记忆与规则遵守
CLAUDE.md 里写了但常被漏的规则 → 创建 workflow，每条规则对应一个验证 agent，**怀疑者人格 agent** 审查规则本身是否合理（防误报）。**反向**也成立：挖最近 session/CR 评论 → 并行聚类 → 对抗性验证 → 提炼回 CLAUDE.md。

### 6. 根因调查
独立假设法：派生多个 agent，从**互不重叠的证据**（日志/文件/数据）生成假设。每个假设交一组验证者+反驳者。**适用所有"事后复盘"**——销售下滑、pipeline 失败、PR 退版本。

### 7. 大规模分诊
支持队列、bug backlog。**隔离区模式**（关键安全模式）：读不可信公开内容的 agent 禁止执行高权限操作，由负责行动的 agent 完成。搭配 `/loop` 让 Claude 持续跑。

### 8. 探索与品味
设计、命名这类基于品味的任务 + 评分标准 = workflow 主场。agent 探索方案 + 审查 agent 用评分标准评估，达到条件即停。

### 9. 评估（Evals）
为特定任务运行轻量评估：worktree 派生独立 agent → 派生比较 agent 按评分标准打分。**真实使用场景**：评估并改进自己创建的 skill。

### 10. 模型与智能路由
分类器 agent 先研究任务 → 根据复杂度路由到 Sonnet/Opus。例如"解释 auth 模块"：先看文件数 + 代码结构 → 决定用哪个模型。**节省成本 + 提升质量**。

## 静态 vs 动态工作流演进

| 维度 | 静态（Claude Agent SDK / `claude -p`） | 动态（Dynamic Workflows） |
|------|---------------------------------------|--------------------------|
| 边界覆盖 | 需覆盖所有边界情况，更通用 | Claude 即时编写，专门为用例定制 |
| 智能水平依赖 | 不强 | 需要 Claude Opus 4.8+ 才足够智能 |
| 复用方式 | 代码库、CI | `~/.claude/workflows` 或 skill 模板 |
| 适用阶段 | 成熟稳定的工作流 | 探索期、Claude 自己判断最优路径 |

**核心判断**：动态工作流 = **让 Claude 自己当架构师**写定制执行框架，前提是模型够强。Opus 4.8 之后才成熟。

## 提示词最佳实践

| 技巧 | 说明 |
|------|------|
| **写详细提示词** | 具体技术 + 模式名称 = 最佳结果（"用 fan-out 加对抗性验证" > "用多 agent"） |
| **quick workflow** | 不只大任务用，小假设验证也可用 workflow 加速 |
| **/goal + /loop** | 重复任务（分诊/研究/验证）配 /loop 周期跑 + /goal 硬性完成要求 |
| **Token 预算** | "use 10k tokens" 类预算提示词控制成本 |

## 保存与分享

- **个人保存**：工作流菜单按 `s` → 写入 `~/.claude/workflows`
- **skill 化分享**：把 JS workflow 文件放进 skill 目录 + 在 `SKILL.md` 中引用
- **模板化提示**：建议提示 Claude 把 skill 里的 workflow 当**模板**而非逐字脚本，保留灵活性

## 什么时候不要用

> 工作流还很新。虽然有很多场景可以带来超额结果，但**并非每个任务都需要它们**，而且它们可能会使用明显更多 token。

**反模式清单**：
- 常规编码任务（不需要 5 人审查小组）
- 简单对话查询
- 一次性小修改
- 任务太小不值得 trade-off token 成本

**判断准则**：问自己——"这个任务是否能用 workflow 做到**过去做不到**的事？"如果是 → 用；如果只是"做得更快/更稳" → 评估 token 成本。

## 相关实体

- [Agent Orchestration](/ch04-409-agent-orchestration/) — 多 Agent 编排的控制平面、状态管理、human-in-the-loop 审批
- [四种 Sub Agent 模式](/ch04-302-四种-sub-agent-模式/) — 内联工具/Fan-Out/Agent Pool/Teams 的控制粒度与状态保留对比
- Sub-Agent vs Agent Team 选型 — 上下文边界设计准则与五种编排原语
- [Claude Code 架构](/ch01-571-claude-code-架构解析/) — Claude Code 整体架构设计
- [Claude Code 大代码库使用](/ch01-384-how-claude-code-works-in-large-codebases-best-practices-and/) — 大型代码库场景的最佳实践

- MOC
## Thariq 2026-06-04 实战模式与构建技巧补遗
> 整理自 Thariq Shihipar 2026-06-04 的一手经验博客（与 sidbid 合作）
> 原文：https://mp.weixin.qq.com/s/1eSGt71P-PeaGszs2cikTw

**核心新内容**：模型够强（Claude Opus 4.8）后，**不再需要为每个用例写静态 harness**——直接让 Claude **现场生成**动态工作流。

### 3 大失败模式（动态工作流要对抗的）
| 失败模式 | 表现 | 对抗手段 |
|---|---|---|
| **智能体惰性** (agentic laziness) | 复杂任务没干完就停（如安全评审 50 条只处理 20 条） | 拆 subagent + /goal 硬性完成要求 |
| **自我偏好偏差** (self-preferential bias) | 偏袒自己产出，对照评分标准核实时更明显 | 独立 subagent 对抗式校验 |
| **目标漂移** (goal drift) | 多轮交互后丢失原始目标，尤其是 compaction 后 | 每次摘要都是有损的 → "不要做 X" 约束丢失 → 拆 subagent 隔离 |

### 6 大基础模式（前文已总结，详见 [原文](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/claude-code-dynamic-workflows-thariq-blog-gaia.md)）

### 11 大实战用例（新增 5.10 + 5.11）
| # | 场景 | 核心套路 |
|---|---|---|
| 5.1 | **迁移与重构**（如 Bun 从 Zig → Rust） | 拆步骤 → 每处修复分 worktree → 另起 subagent 对抗式评审 → 合并 |
| 5.2 | **深度研究**（`/deep-research`） | 扇出多路网络搜索 + 抓取 + 对抗式校验 + 汇总带引用报告 |
| 5.3 | **深度核查** | 报告 → 识别所有事实性论断 → 每条分 subagent 核查 → 校验 subagent 检查溯源质量 |
| 5.4 | **排序**（1000+ 行排序） | **成对比较 (pairwise) 比绝对打分更可靠**；并行分桶排名 + 合并；确定性循环只留当前排序在上下文 |
| 5.5 | **记忆与规则遵循**（CLAUDE.md 老漏规则） | 列出必须由校验 subagent 逐条检查的规则；再加 "怀疑论者" subagent 复核避免误报 |
| 5.6 | **根因排查**（调试/复盘） | 多 subagent 从**互不相交证据**提假设（日志/文件/数据各一个）→ 每个假设面对校验+反驳者 |
| 5.7 | **规模化分流**（支持队列/bug 报告） | 每条目分类 + 去重 + 行动（修复/上报人类）；**隔离区模式** |
| 5.8 | **探索与品味**（设计/命名） | subagent 探索一堆方案 → 评审 subagent 按评分标准判断 |
| 5.9 | **评测**（为技能打分） | worktree 拆 N subagent + 比较 subagent 对照评分标准打分 |
| **5.10** | **模型与智能路由** | **分类 subagent 调校** → 决定每个任务用哪个模型；例 "auth 模块" 先看代码库规模/形态 → 路由 Sonnet/Opus |
| **5.11** | **什么时候不该用** | 常规编程任务大多不需要；不要给每件事 5 评审者 |

### 5 大构建技巧
1. **详尽提示词** → 最好结果；可提示 "快速工作流"（如快速对抗式评审）
2. **与 `/goal` + `/loop` 配合** → 可重复工作流（分流/研究/核查）按固定间隔跑 + 硬性完成要求
3. **Token 用量预算** → 提示如 "用 10k token" 设定上限
4. **保存与分享** → 菜单按 "s" → 签入 `~/.claude/workflows` 或**通过技能分发**（工作流放技能文件夹 + SKILL.MD 引用）
5. **隔离区 (Quarantine) 模式**（5.7 实战）→ 禁止读取不可信公开内容的 subagent 执行高权限操作

### 静态 vs 动态工作流
| 维度 | 静态 (Claude Agent SDK / `claude -p`) | 动态 (Opus 4.8+) |
|---|---|---|
| 应对边界 | 必须覆盖所有 → 通用、笼统 | Claude 现编 → 量身定制 |
| 适配 | 写代码时考虑所有用例 | **为你的具体用例**生成 |
| 模型要求 | 任意 | **需要 Claude Opus 4.8 智能** |

### 8 个示例 Prompt（打开思路）
1. "测试每跑 50 次失败 1 次 → 建工作流复现 + 假设 + worktree 对抗式验证。/goal：在某假设被证实前不要停"
2. "翻最近 50 次会话 → 挖反复纠正 → 归纳成 CLAUDE.md 规则"
3. "查过去半年 #incidents Slack → 找反复出现却没人提工单的根因"
4. "商业计划书 → 多 Agent 视角（投资人/客户/竞争对手）批得体无完肤"
5. "80 份简历按后端岗位排名 → 锦标赛复核前 10 → AskUserQuestion 整理评分标准"
6. "命令行工具起名 → 头脑风暴 → 锦标赛挑前 3"
7. "把所有 User 模型重命名为 Account"
8. "博客草稿 → 对照代码库核实每个技术论断"

### 关键启示
1. **harness 之争 → 动态生成 harness** — 模型够强后不需要为每个用例写静态 harness
2. **多 subagent + 独立上下文 = 对抗 3 大失败模式**（惰性/自我偏好/目标漂移）
3. **锦标赛（pairwise）比绝对打分更可靠** — 5.4 排序场景的工程经验
4. **隔离区模式是安全/不可信输入场景标配**
5. **工作流是 skill.md 的天然内容** — 工作流放技能文件夹 + SKILL.MD 引用 = 可分享模板
6. **Token 预算必设** — 动态工作流消耗更多 token
7. **不是每个任务都需要工作流** — 常规编程任务大多用不上

## AGI Hunt 公众号 5th 译本：上手指南视角（2026-06-04）
> 整理自 AGI Hunt 公众号 2026-06-04 对同一篇 Anthropic 博客的中文译解
> 原文：https://mp.weixin.qq.com/s/hxBkT-iJleQkaODzjWVC2A
> 与前文 4 个 source **同源**（Anthropic "A harness for every task" 博客）

**该译本的独特视角**（相比 1eSGt71P 实战版 / 高可用架构 gaia 版）：
- **结构差异**：按"为什么需要 → 怎么量身定制 → 六种编排 → 实战 → 上手 → 克制"叙事流，而非 1eSGt71P 的"模式→场景→技巧"分类法
- **官方表态首次中文呈现**：Claude Code 官方账号 + Cat Wu（Anthropic PM）的 1:1 原文翻译（含 "ultracode 模式"命名 + `/effort ultracode` 触发方式）
- **Agent Teams vs Dynamic Workflows 区分图**：明确 N=100+ 个 subagent 的"执行者/验证者/修复者"三层架构
- **猫吴本（Cat Wu）个人用例**：用 Workflow 清理内部上百个 A/B test flag → 自动识别 roll out 到 0% / 100% 的废弃 flag
- **「是否值得用」决策启发**：6 大使用场景（迁移/规则生成/根因/分诊/探索/评测）+ 模型路由（按任务复杂度分 Sonnet/Opus）+ Quarantine 隔离区
- **与 1eSGt71P 实战版的细微差异**：强调 "**适合 100+ subagent 大规模并发**" 而非 1eSGt71P 强调的 "**实时恢复**"

**复用结论**：本译本**不独立入库**（80% 内容与已有 4 source 重叠），但补充了：
1. Cat Wu（Anthropic PM）的官方营销文案
2. Agent Teams vs Dynamic Workflows 视觉化对比框架
3. 大规模并发（N=100+）的可行性与 token 成本现实

**一句话整合**：Anthropic 用 Dynamic Workflow 把"每个任务写静态 harness"范式翻篇到"现场为每个任务量身定制动态工作流"，**5 个中文译本**（1eSGt71P 实战 / 高可用架构 gaia 详尽 / Anthropic 官方英文 / 32da0cfe merge / 当前 hxBkT 5th）**叙事角度不同但核心模式完全收敛**——6 种编排 / 3 类失败 / Quarantine 隔离 / 8 个示例 prompt / `/goal`+`/loop`+token 预算三件套。

## 玉澄 / 51CTO 译本补充（6th source, 2026-06-04）

[玉澄译本](https://raw/articles/claude-code-dynamic-workflows-zhuge6-yucheng-translation) 是 Dynamic Workflows 同源内容的**第 6 个中文译本**。**主体内容（6 模式 / 3 失败模式 / 8 Prompt / 10 场景 / 静态 vs 动态 / 5 Tips）与前 5 source 高度重叠**。**本译本独特补充**：

### 1. "quick workflow（快速工作流）" 概念
> "Workflows 不仅仅适用于大型任务。您可以**提示模型使用'quick workflow（快速工作流）'**。例如，你可以针对某个假设创建一个快速的对抗性审查。"

**价值**：打破"Workflows = 大型任务"的刻板印象，**让快速对抗性审查也用 Workflow**。

### 2. Bun 重写 Zig→Rust 案例 + X 帖子链接
> "Bun 曾使用 Workflows 将其底层代码从 Zig 重写为 Rust。您可以在 Jarred 的 X 帖中了解更多关于这一过程的细节。"

**具体链接**：[https://x.com/jarredsumner/status/2060050578026189172](https://x.com/jarredsumner/status/2060050578026189172)

**价值**：**真实生产案例**（Bun 著名 JavaScript 工具链）证明 Workflows 在大规模代码迁移中的可行性。

### 3. Slack 上下文状态报告生成
> "你不仅可以在网络搜索中应用此类研究。例如，您可以让 Claude **根据 Slack 中的上下文汇编一份状态报告**，或者通过深入探索代码库来研究某个功能的运作原理。"

**价值**：**Workflows 适用于非技术性工作**的又一例证（继 Thariq "非技术性工作有时更有用" 补充）。

### 4. Static workflows 精确定义
> "Claude Code 的 Static workflows（静态工作流）是指**预先定义好、结构固定的工作流模板，其 Agent 类型、数量和执行步骤都是固定的，适合重复使用和分享（可保存到 ~/.claude/workflows 文件夹）**。"

**价值**：明确 Static vs Dynamic 边界（"通用" vs "为你的特定用例量身定制的 Harness"）。

### 5. Skill 把 Workflow 当"模板"
> "为了获得更大的灵活性，你可能需要提示 Claude **将 Skill 中的 Workflow 视为'模板'，而不是必须逐字逐句严格执行的脚本**。"

**价值**：Workflow + Skill 的灵活使用模式（不是"写死"而是"模板"）。

**整合视角**：6 个中文译本叙事的**唯一非冗余新增**是 **Bun 案例的具体 X 帖子链接**（其他如"quick workflow"/"Skill 当模板" 等概念性补充已被前 5 source 部分覆盖）。这一案例链接值得在最终汇总时高亮——**真实生产级代码迁移 + 公开 trace** 是 Dynamic Workflows 能力的最强证据。

## 架构师 JiaGouX 译本补充（7th source, 2026-06-04）

[架构师 JiaGouX 译本](https://raw/articles/claude-code-dynamic-workflows-jiagoux-architect-perspective) 是 Dynamic Workflows 同源内容的**第 7 个中文译本**。**主体内容（6 模式 / 3 失败模式 / 8 Prompt / 10 场景 / 5 Tips）与前 6 source 高度重叠**。**本译本独特贡献**（**最不可替代**）：

### 1. 任务级 Harness 统一框架
> "**Dynamic Workflows 这次露出来的新信号，是 Claude Code 开始把这些任务级约束写进一段可执行流程里。**"

**6 大能力统一框架**（架构师视角）：

| 能力 | 主要解决的问题 | 架构师理解 |
|---|---|---|
| **Subagents** | 隔离上下文和局部任务 | 派一个人去看一块材料 |
| **Agent Teams** | 多块工作协作 | 几个人围绕同一个任务协同 |
| **Cowork** | 停止条件和交互节奏 | 什么时候继续，什么时候交回人 |
| **Skills** | 过程资产复用 | 把做对的方法沉淀下来 |
| **Harness** | 状态、权限、验证、记录 | 管住任务怎么跑、怎么查 |
| **Dynamic Workflows** | 任务级编排 | **为当前任务临时写一套可执行流程** |

> "**当 Subagents、Skills、Agent Teams、Goals、Hooks、Worktrees 都慢慢补齐以后，系统需要一种方式，把这些能力按任务临时编排起来。这就是任务级 Harness。**"

### 2. 任务级 Harness 把什么管起来（7 问清单）
> "**只盯着'能并发 1000 个 Agent'，很容易把它用成昂贵的自动化噪声。换成任务级 Harness 这个角度，问题会变得更具体：**"

1. 这个任务的**材料稳定吗**
2. **工作单元能不能拆开**
3. **每个单元的证据是什么**
4. **哪些动作只读，哪些动作会改状态**
5. **哪些动作要先问人**
6. **超过多少 token 或多少轮就停**
7. **最后交给人的是什么证据包**

> "**这些问题不花哨，但很接近生产系统。**"

### 3. 团队新瓶颈转移（Anthropic 内部观察）
> "**在 Claude Code 团队里，写代码、写测试、重构，已经越来越少成为唯一瓶颈。新的瓶颈开始转向验证、代码审查和安全。**"

> "**模型越来越会写以后，团队紧张的地方会转向验证、审查和守门。**"

### 4. 7 个"日常土问题"（Agent 系统设计自检）
1. 它知道自己什么时候没完成吗
2. 它能把证据留给我吗
3. 它会不会偏爱自己的结论
4. 它能不能把失败写回下一次流程
5. 它知道哪些事不能做、最多花多少吗
6. 人什么时候介入最合适

### 5. Bun 案例的边界判断
> "**Thariq 在后续讨论里补过一个边界：模型还没有完全到那一步，Bun 适合，是因为它非常可验证，测试覆盖也很好。这句比案例数字更能说明边界。**"

> "**Bun 更像是在提醒我们：只有足够可验证的旧系统，才适合被 Agent 切开、迁移、反复修复，再由人做最终判断。**"

**对迁移任务来说，代码量当然重要，后面这些条件往往更难**：
- 行为能不能被测试约束 / 编译错误能不能快速暴露 / 性能回退能不能被 benchmark 看见 / 每个模块的等价性有没有证据 / 最后合并前有没有人类 review

### 6. Cat Wu 整理 A/B test flags 案例（更接地气）
> "**这个场景没有 Bun 那么戏剧化，但我反而觉得它更适合团队第一批尝试。**"

**为什么适合**：每个 flag 都能单独检查 / 结果可以并行收集 / 判断标准相对明确 / 最终动作可以先交给人确认 / 错了也不至于直接改坏生产系统

> "**这类任务说明，Dynamic Workflows 不只属于代码迁移。它更适合'很多独立小单元 + 每个都要验证 + 最后统一合成'的工作。**"

### 7. 7 个"要写清楚的事"清单（落地策略）

| 维度 | 我会问的问题 |
|---|---|
| **材料** | 要读哪些目录、链接、issue、日志 |
| **结果** | 最后给报告、补丁、PR，还是分类表 |
| **证据** | 每个结论需要哪些引用、命令、测试或截图 |
| **动作** | 只读，还是允许改文件；哪些命令不能碰 |
| **模型** | 哪些阶段用强模型，哪些阶段用便宜模型 |
| **停止** | 最多多少轮、多少 token、哪些失败直接交回人 |
| **人的介入** | 人在什么时候 review，怎么判断能不能继续 |

### 8. 首轮只读试跑实例（billing 模块风险盘点）
```
目标：盘点 billing 模块里可能缺测试的路径。
范围：只读 src/billing、tests/billing，不访问 .env，不改文件。
拆分：按目录分给 4 个 subagents，每个只看自己负责的目录。
每个分支输出：文件路径、风险描述、证据、未确认点。
验证：再拉 1 个 reviewer，只检查证据是否站得住。
停止：最多 1 轮，不做修复，不自动开 PR。
交付：一张风险表，按高/中/低优先级排序。
```

> "**这件事说到底很朴素：Agent 能往前推，边界就要早一点写清楚。目标模糊、能做什么没说清、验收也没说清，在强 Agent 手里反而更危险。**"

### 9. token 预算 7 件事
1. 哪些阶段用强模型
2. 哪些阶段用便宜模型
3. 哪些分支只读不写
4. 哪些验证只抽样
5. 哪些任务最多跑一轮
6. 哪些任务可以配合 /loop 长跑
7. 哪些任务超过预算直接交回人

> "**我也不建议把 /effort ultracode 当成默认日常模式。它适合大任务、硬任务、验证成本高的任务。日常小改动用它，通常只是把一件简单事做贵。**"

**整合视角**：7 个中文译本叙事中，**JiaGouX 译本的最不可替代新增** = **"任务级 Harness" 统一框架** + **团队新瓶颈转移（写代码→验证/审查/安全）** + **7 个"要写清楚的事"清单** —— 这三点是前 6 译本完全没出现的元层洞察 + 落地策略。**[raw/articles/claude-code-dynamic-workflows-jiagoux-architect-perspective.md]**

---

## 8th 来源（2026-06）：行小招译注 + Hermes DAG 对比视角

> "**Anthropic 又开始抄袭了，把这套抄进了 claude code，改名为 dynamic workflow**"

**作者**："行小招"（落地公司研发交付智能体；研究大量开源智能体实现）

**3 大新增视角（前 7 译本完全没有）**：

### 1. **Hermes DAG 动态图先于 Claude Code Dynamic Workflow**

> "**Hermes 的 DAG 动态图，效果非常显著，这不，Anthropic 又开始抄袭了，把这套抄进了 claude code，改名为 dynamic workflow**"

**作者主张**：
- Hermes Agent **早于** Claude Code 提出 DAG 动态图范式
- Anthropic 把这套"抄"进 Claude Code 改名为 **dynamic workflow**
- 这是**开源 → 闭源反向流动**的典型案例

### 2. **Opus 4.8 + Dynamic Workflow > GPT-5.5（实测对比）**

> "**纯粹的 Opus 4.8 在 xhigh/max 级别上其实比不上 GPT-5.5，但加上 dynamic workflow 之后直接反超**"

**核心数据点**（**唯一来自中文译本的实测对比**）：
- 纯 Opus 4.8（xhigh/max 级别）< GPT-5.5
- Opus 4.8 + Dynamic Workflow > GPT-5.5
- **结论**：Harness 模式（dynamic workflow）能把模型能力曲线推到 Pareto Frontier 推进的位置

### 3. **企业级智能体终局判断 — Dynamic Workflow > Agent Teams**

> "**当下企业级智能体的终局就是这个了，不是那比较虚的 Agent team's，那玩意不稳定**"

**作者核心断言**：
- **企业级智能体终局 = Dynamic Workflow**（任务图固化 + 脚本调度）
- **不是 Agent Teams**（角色分工 + 自主协调）—— "**那玩意不稳定**"
- 这是从企业落地角度对两种范式的**直接对垒判断**

**Thariq 原文 6 种工作流模式**（行小招译注版本）：

| 模式 | 中文译名 | 适用场景 |
|---|---|---|
| Classify-and-act | **分类再行动** | 任务类型判断 + 分派 |
| Fan-out-and-synthesize | **扇出再综合** | 大量小步骤 + 干净独立上下文 |
| Adversarial verification | **对抗式验证** | 子智能体输出 + 独立审查 |
| Generate-and-filter | **生成再过滤** | 多想法生成 + 评分筛选 |
| Tournament | **锦标赛** | N 个智能体竞争 + 两两比较 |
| Loop until done | **循环直到完成** | 工作量未知 + 满足停止条件 |

**Thariq 原文 3 类失效模式**（行小招译注版本）：

| 失效模式 | 中文译名 | 表现 |
|---|---|---|
| **Agentic laziness** | **智能体懒惰** | 复杂多部分任务中**未真正完成就提前收工**；只处理 50 项里的 20 项就宣布完成 |
| **Self-preferential bias** | **自我偏好偏差** | Claude 更倾向认可自己的结果/发现，**按评分标准验证时尤其明显** |
| **Goal drift** | **目标漂移** | 多轮交互后逐渐偏离最初目标；**尤其在上下文压缩之后**（每次摘要都损失信息） |

**Thariq 原文 8 大实战场景**（行小招译注版本）：

| 场景 | 关键 insight |
|---|---|
| **迁移与重构** | 拆成调用点/失败测试/模块 → 每任务子智能体 + worktree 隔离 + 对抗式审查；**明确告诉智能体不要使用资源消耗很大的命令** |
| **深度研究** | /deep-research 技能 = 扇出网页搜索 + 抓取来源 + 对抗式验证 + 综合成带引用报告 |
| **深度验证** | 一个智能体识别事实声明 → 每条声明一个子智能体核查 → **再加一个验证智能体检查来源质量** |
| **排序** | 1000+ 行单 prompt 排序质量下降；**锦标赛或两两比较流水线**；并行分桶 + 合并；**相对判断比绝对打分更可靠** |
| **记忆与规则遵循** | 经常漏掉的规则 → 工作流列出必查规则 + 每条配验证智能体 + **怀疑者子智能体审查规则是否合理** |
| **根因调查** | 多个独立假设 + 多个不重叠证据来源 + 验证者和反驳者；**结构上避免自我偏好偏差** |
| **大规模分诊** | 隔离区模式：**读不可信公开内容的智能体不能执行高权限操作**；+ /loop 持续执行 |
| **探索与品味判断** | 设计/命名任务 + 评分标准 + 评审智能体；**方案按标准通过锦标赛排序** |

**Thariq 原文 4 大构建技巧**（行小招译注版本）：

1. **提示词技巧**：**为动态工作流编写提示词时，越具体越好**；可以提示"快速工作流"（如快速对某个假设做一次对抗式审查）
2. **结合 /goal 和 /loop**：适合重复运行（分诊/研究/验证）+ 定期执行 + /goal 设置明确完成要求
3. **Token 使用预算**：**提示词中写 "use 10k tokens" 就会设置对应上限**
4. **保存和分享**：菜单按 "s" 保存 → ~/.claude/workflows → **通过技能分发**（放进技能目录 + 在 SKILL.MD 引用）；**提示 Claude 把技能里的工作流视为模板，而不是必须逐字照跑的脚本**

**关键触发词**：
- **"ultracode"** = 触发词，确保 Claude Code 创建工作流
- 直接说 "**用工作流 ...**" 也可
- 普通任务**不要硬上**："**大多数传统编程任务并不需要 5 个审查者组成的评审团**"

**Token 消耗警告**：
> "**动态工作流通常会消耗更多 token，所以需要认真思考何时使用、如何使用。**"

**保存到技能目录**：
- JavaScript 工作流文件放进技能目录
- 在 SKILL.MD 中引用它们
- **提高灵活性**：把工作流视为**模板**，不是必须逐字照跑的脚本

**8 译本整体定位**：
- **1-7 译本**：偏 Anthropic 官方视角（技术拆解 + 实践模式）
- **8 译本（行小招）**：**中文社区视角** + Hermes DAG 先发论 + Opus vs GPT-5.5 实测 + 企业终局判断

**Hermes Agent `hermes-agent-skill-crossover-optimization` ↔ Claude Code Dynamic Workflow 关系**（中文社区视角）：
- **Hermes DAG 动态图**（开源） = Dynamic Workflow 的**前身 / 灵感来源**
- **Claude Code Dynamic Workflow**（闭源） = 借鉴后**产品化重命名**
- **两个生态互相喂养**：开源创新 → 闭源产品化 → 反哺开源

**核心金句（行小招版）**：

- "**Anthropic 又开始抄袭了，把这套抄进了 claude code，改名为 dynamic workflow**"
- "**Hermes 的 DAG 动态图，效果非常显著**"
- "**纯粹的 Opus 4.8 在 xhigh/max 级别上其实比不上 GPT-5.5，但加上 dynamic workflow 之后直接反超**"
- "**当下企业级智能体的终局就是这个了，不是那比较虚的 Agent team's，那玩意不稳定**"
- "**多部分任务中尚未真正完成就提前收工，并在只取得部分进展后宣布任务完成**"
- "**Claude 更倾向于认可自己的结果或发现，尤其是在你要求它按照评分标准去验证或评判这些结果时**"
- "**每一次摘要都会损失信息，像边缘条件要求，或者'不要做 X'之类的约束，都可能在过程中丢失**"
- "**综合步骤相当于一道屏障，它会等待所有扇出的智能体完成，再把它们的结构化输出合并成一个结果**"
- "**相对判断通常比绝对打分更可靠。每次比较都由自己的智能体完成**"
- "**可以让不同智能体分别查看日志、文件和数据。随后，每个假设都要接受一组验证者和反驳者的审视**"
- "**读取不可信公开内容的智能体不能执行高权限操作，高权限操作改由负责行动的智能体完成**"
- "**当评审智能体认为某个方案已经达到标准时，任务就完成了**"
- "**大多数传统编程任务并不需要 5 个审查者组成的评审团**"
- "**为动态工作流编写提示词时，越具体越好**"
- "**也可以提示模型使用'快速工作流'**"
- "**当工作流适合重复运行时，比如分诊、研究或验证，可以和 /loop 搭配**"
- "**为了提高灵活性，你可能会希望提示 Claude，把技能里的工作流视为模板，而不是必须逐字照跑的脚本**"

**整合视角（8 译本全栈）**：
- **8 译本叙事中，行小招译本的最不可替代新增** = **3 大中文社区视角**：
  1. **Hermes DAG 先发论**（**开源 → 闭源反向流动**的典型案例）
  2. **Opus 4.8 + Dynamic Workflow > GPT-5.5** 实测对比
  3. **企业级智能体终局 = Dynamic Workflow > Agent Teams**（直接对垒判断）
- 这三点是前 7 译本完全没出现的**元层判断 + 实测数据**

## 9th 来源（2026-06-05）：机器之心权威译本

> 「该功能允许 Claude 根据具体任务即时编写定制化执行框架，协调多个子 Agent 并行工作，解决大规模、高并行、对抗性任务中的系统性失效问题。」

**译者**：机器之心编辑部（机器之心 = AI 主流媒体，权威译本）

**译本特色**（vs 前 8 译本）：
- **版本号具体化**：明确「使用 Claude Opus 4.8 的动态工作流」
- **开篇 8 个示例 prompt 完整列出**（测试失败调试 / 会话错误挖掘 / Slack 工单根因 / 商业计划多视角拆解 / 简历排名 / CLI 工具命名 / User→Account 重命名 / 博客技术声明审查）
- **三阶段叙述**：上周发布 → 解决什么问题 → Thariq 博客全文译述
- **章节归类与高可用架构版基本一致**（核心机制 → 失败模式 → 6 模式 → 10 场景 → 构建技巧）

**9th 译本定位**（vs 前 8 译本）：

| 译本 | 来源公众号 | 独家价值 |
|------|------------|----------|
| 1st-2nd | 高可用架构 / 独立翻译 | 官方视角完整技术拆解 |
| 3rd-4th | 多公众号转载 | 复述 + 译注 |
| 5th | AGI Hunt | 上手指南视角 |
| 6th | 玉澄 / 51CTO | 静态 vs 动态精确边界 + Skill 模板 |
| 7th | 架构师 JiaGouX | 任务级 Harness 7 问清单 + Anthropic 内部观察 |
| 8th | 行小招 | Hermes DAG 先发论 + Opus vs GPT-5.5 实测 + 终局判断 |
| **9th** | **机器之心** | **权威媒体完整译本 + Opus 4.8 版本号 + 开篇 8 示例 prompt 完整版** |

**9th 译本对 entity 的新增贡献**：
- **Opus 4.8 显式版本号** — 机器之心译本明确「Claude Opus 4.8」作为 Dynamic Workflow 的基础模型，前 8 译本多省略具体版本
- **开篇 8 示例 prompt 完整保留** — 8 个使用案例的 prompt 写法对实践者最有参考价值
- **权威性背书** — 机器之心作为 AI 主流媒体的完整译本，**最适合作为对外引用的单一权威译本**

**9 译本整合后的 entity 价值**：
- **官方视角**（1-2 译本）+ **实战模式**（3-4）+ **上手指南**（5）+ **静态/动态精确边界**（6）+ **任务级 Harness 框架**（7）+ **中文社区元层判断**（8）+ **权威媒体背书**（9）
- 形成**9 个独立视角**的完整整合，**主实体总价值 v×c ≈ 9×10 = 90**

**整合后 9 译本相互验证的关键点**：
- **6 模式 + 3 失败 + 10 场景**：所有 9 译本一致（同一原文）
- **触发词 "ultracode"**：8th + 9th 都明确
- **保存到 `~/.claude/workflows`**：8th + 9th 都明确
- **Token 预算 "use 10k tokens"**：8th + 9th 都明确
- **静态 vs 动态差异**：6th 精确定义，9th 译本补充"Claude Opus 4.8"

**与 [机器之心译本](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/claude-code-dynamic-workflows-jiqizhixin-9th-translation.md) raw 的关系**：
- 机器之心版 raw 保留完整正文 + 译本特色
- 主 entity 已 merge 全部 9 译本的洞察，机器之心版无独家洞察，因此只作为"权威媒体背书"补遗
- 引用模式：本文即可作为对外引用 dynamic workflows 的**最权威单一译本**

## 10th Source：林月半子的 AI 笔记（2026-06-05）—— 实战触发 + ultracode 模式 + /deep-research + 编排者哲学

> 来源：[林月半子的 AI 笔记](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/anthropic-dynamic-workflows-ultracode-deep-research-lyuyuebannzi.md)（2026-06-05）
> **关系**：与 1st-9th 译本同源不同公众号的实战解读。**保留独家数据**：3 步跑起来（`/config` 开启 / prompt 含 "workflow" / `ultracode` / `/deep-research`）+ Claude Code 版本要求 v2.1.154 + Subagent/Skill/Workflow 三者核心差异（"谁握着计划"）+ 编排者哲学（"AI 写编排代码 vs 人写编排代码"）+ Sisyphus Labs 抄袭指控事件。

### Sisyphus Labs 抄袭指控事件

上周 Anthropic 发布 Dynamic Workflows，**24 小时不到**就被人公开指控"抄袭"。一个叫 **Sisyphus Labs** 的团队直接在推特上@了 Anthropic，说 Claude Code 新推的 **ultracode 模式**跟他们做的 OMO 工具里的 **ultrawork 和 atlas** 功能几乎一模一样。

> 抄没抄的，我不评价。但这件事背后有个更值得想的问题：**让 AI 自己写编排脚本这个能力，已经成了 Coding Agent 赛道的兵家必争之地**。
>
> **OpenAI Codex `/goal` 模式、第三方 OMO 开源、Anthropic Dynamic Workflows**——路径各不相同，但所有人都要解决同一个问题：**AI 要能自己拆任务、调度一支 Agent 舰队去干大活**。

### Subagent / Skill / Dynamic Workflows 三者核心差异

> **核心问题只有一个：谁握着计划？**

| 类型 | 谁决定下一步 | 中间结果流向 | 适用 |
|------|------------|------------|------|
| **Subagent** | Claude 逐轮判断 | **所有中间结果回到你的对话上下文** | "跑腿" |
| **Skill** | Claude 决定，按 prompt 走 | **同样回到对话上下文** | 预写 SOP |
| **Dynamic Workflows** | **脚本自己决定下一步** | **循环/分支/中间结果全在脚本变量里流转** | "流水线作业" |

**上下文占用关键洞察**：

> **用 subagent 或 skill 派 10 个小弟去干活，10 份结果全部作为 tool result 回到你的对话里，上下文越跑越臃肿，到后面 Claude 的注意力都被过程信息稀释了。**
>
> **Workflow 的 10 份中间结果在脚本变量里流转，最后只有一份汇总报告回到 Claude 的上下文。**

### 3 步跑起来你的第一个 Workflow（实战独家）

| 步骤 | 操作 | 独家细节 |
|------|------|---------|
| **1. 准备** | `/config` 命令 | 检查 Dynamic workflows 开启 + **版本要求 Claude Code v2.1.154+** |
| **2a. 触发方式一** | prompt 含 `workflow` 关键词 | Claude Code 会高亮成彩色提示 |
| **2b. 触发方式二** | `/effort ultracode` | **推理努力拉到最高档 xhigh + 自动判断何时用 Workflow** |
| **2c. 触发方式三** | `/deep-research <问题>` | 内置工作流：多角度搜索 + 交叉核对 + 投票表决 + 没通过验证的剔除 |

**ultracode 模式独家细节**：

- 开了之后**一个复杂的请求可能被拆成连续好几个 Workflow**——先理解代码，再修改，最后验证
- **每个请求消耗的 token 明显更高**
- **别在简单任务上开着忘关了**——退回用 `/effort high`

### 运行中可执行操作（独家）

| 操作 | 快捷键 | 效果 |
|------|--------|------|
| 查看详情 | Enter / → | 看调了什么模型/花了多少 token/用了几次工具/跑了多久/完整 prompt 和输出 |
| 暂停运行 | `p` | 随时暂停再恢复，已完成的工作不白费 |
| 保存 Workflow | `s` | 保存成 `/命令名` 斜杠命令，下次直接调用 |

**保存路径**：

- `.claude/workflows/`——项目级（克隆仓库的人都能用）
- `~/.claude/workflows/`——个人级（每个项目都能用，但只有你能看到）

### 编排者哲学（独家核心金句）

> **在官方推出这个功能之前，想让多个 Agent 并行干活、结果汇总、错误重试，你得自己写编排代码，处理并发控制、限流重试、中间状态管理、结果聚合，全是脏活。**
>
> **Dynamic Workflows 把编排这层的技术门槛直接抹平了。**
>
> **以前是人写编排代码、手搓各种脏活，AI 只管卖力气。**
>
> **现在是 AI 自己根据任务现场生成编排逻辑，跑在官方提供的运行时里。**
>
> **门槛从"会写编排代码"降到了"会定义目标"。**

### 10 译本对照

| 译本 | 来源 | 独家贡献 |
|------|------|---------|
| 1st-2nd | 高可用架构 / 独立翻译 | 官方视角完整技术拆解 |
| 3rd-4th | 多公众号转载 | 复述 + 译注 |
| 5th | AGI Hunt | 上手指南视角 |
| 6th | 玉澄 / 51CTO | 静态 vs 动态精确边界 + Skill 模板 |
| 7th | 架构师 JiaGouX | 任务级 Harness 7 问清单 + Anthropic 内部观察 |
| 8th | 行小招 | Hermes DAG 先发论 + Opus vs GPT-5.5 实测 + 终局判断 |
| 9th | 机器之心 | 权威媒体完整译本 + Opus 4.8 版本号 + 开篇 8 示例 prompt 完整版 |
| **10th（本节）** | **林月半子的 AI 笔记** | **3 步跑起来 + ultracode + /deep-research + Subagent/Skill/Workflow 三者核心差异（"谁握着计划"）+ 编排者哲学 + Sisyphus Labs 抄袭指控事件 + Claude Code v2.1.154 版本要求** |

**10 译本整合后的 entity 价值**：
- **10 个独立视角**的完整整合
- **主实体总价值 v×c ≈ 10×10 = 100**（接近本 wiki 上限）
- 整合后形成"**官方视角 → 实战模式 → 上手指南 → 边界定义 → Harness 框架 → 元层判断 → 权威背书 → 抄袭事件 → 哲学抽象**"完整 10 维坐标系

---

## Ch08.007 JiuwenSwarm — Coordination Engineering 多智能体协作框架（含 SwarmFlow 可控编排 + Jiuwen Symphony 技能编排与分发）

> 📊 Level ⭐⭐⭐ | 25.2KB | `entities/jiuwenswarm-coordination-engineering.md`

## 概述
JiuwenSwarm 是 openJiuwen 社区发布的**多智能体蜂群协作框架**，代表从 Harness Engineering 向 **Coordination Engineering** 的范式跃迁。
**背景演进路径：** ^["[InfoQ: 蜂群Agent来了！JiuwenSwarm](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/jiuwenswarm-coordination-engineering.md)"]

- Prompt Engineering → Context Engineering → Harness Engineering → **Coordination Engineering**

## 核心架构：四组件全栈体系
| 组件 | 解决的问题 |
|------|-----------|
| **Agent Swarm** | 多个 Agent 如何"成军"——自主分工、动态协商、高效协作 |
| **Swarm Skills** | 如何把团队经验沉淀为可复用资产 |
| **Swarm Skills Hub** | 能力如何在开发者之间流通、复用 |
| **Swarm Skills 自演进** | 系统如何越用越强，而非越跑越僵 |

### Agent Swarm
多智能体团队协同机制内核。支持**成员对不同模型的路由**，针对不同角色提供合适能力的模型，减少负载压力，提升整体效果。
核心能力：**自主分工 + 动态协商 + 高效协作**，从"单兵作战"到"精锐团队"。 ^["[InfoQ: 蜂群Agent来了！JiuwenSwarm](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/jiuwenswarm-coordination-engineering.md)"]

### Swarm Skills
把团队协作中的最佳实践、SOP、角色搭配、调度策略**标准化封装成"团队级技能"**——让优秀的 Agent 团队变成一套即插即用的作战能力。

### Swarm Skills Hub
开放的团队级协作经验共享市场。地址：https://swarmskills.openjiuwen.com/

### Swarm Skills 自演进
演进引擎观察完整轨迹（任务拆解、角色调度、消息往来），**自动从轨迹反推出可复用的 Swarm Skill**，提交用户审批即可入库。
两层同时演进： ^["[InfoQ: 蜂群Agent来了！JiuwenSwarm](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/jiuwenswarm-coordination-engineering.md)"]

- **团队层**：自动增减角色、补充约束规则、优化协作流程
- **成员层**：沉淀工具报错、接口超时、调用技巧等实战经验

## Human-Agent 协作模式
| 模式 | 描述 | 姿态 |
|------|------|------|
| **HOTS** (Human on the Swarm) | 人是指挥官，实时观察全局，随时下场介入 | 全局调度 |
| **HITS** (Human in the Swarm) | 人是团队成员，与 Agent 同流程实时协作 | 沉浸式参与 |

## Benchmark 表现
- **PinchBench**：94.2% SOTA（OpenClaw 91.6%），token 消耗降低 34.8%
- **LOCOMO**：记忆准确率 85%（8B 大模型），优于业界主流记忆系统
底层支撑来自 openJiuwen Harness 的 DeepAgent 架构、上下文工程、长期记忆机制。

## 开源地址
- GitHub：https://github.com/openJiuwen-ai/jiuwenswarm
- Swarm Skills Hub：https://swarmskills.openjiuwen.com/

## 相关概念
- Harness Engineering — Coordination Engineering 的前置范式
- Multi-Agent Collaboration — 广义的 Multi-Agent 协作研究
- Agent Swarm — 蜂群智能体架构模式

## 深度分析
### 1. 从单Agent到多Agent协作的范式跨越
JiuwenSwarm 的出现映射了 AI Agent 工程领域的核心矛盾：当任务复杂度超过单个 Agent 的能力边界时，如何组织多个 Agent 像团队一样工作？
传统单 Agent 框架（如 LangChain Agent、AutoGPT）在面对跨领域调研、软件交付，多角色决策等真实复杂任务时，暴露出明显的协作盲区。JiuwenSwarm 的**Coordination Engineering**范式，将多 Agent 协作从"多个单 Agent 堆叠"提升为"原生团队协同"——这不是工具升级，而是工程思维的根本转变。

### 2. 四组件体系的递进逻辑
四组件构成了一套完整的递进体系： ^["[InfoQ: 蜂群Agent来了！JiuwenSwarm](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/jiuwenswarm-coordination-engineering.md)"]

- **Agent Swarm** 是协作内核，解决"能协同"的基础问题
- **Swarm Skills** 解决"协同经验可复用"的知识沉淀问题
- **Swarm Skills Hub** 解决"跨团队能力流通"的价值放大问题
- **Swarm Skills 自演进** 解决"系统持续进化"的长期生命力问题
自演进机制是这套体系中最具创新性的设计——它不是让用户手动维护技能库，而是通过**轨迹自动发现**模式，将实战中涌现的协作规律自动提取为可复用的 Swarm Skill，形成越用越强的正向飞轮。

### 3. HOTS vs HITS：人机协作的两极
HOTS（Human on the Swarm）和 HITS（Human in the Swarm）代表了人参与多 Agent 系统的两种截然不同的哲学：

- **HOTS** 保留了人类的主体性和全局视角，适合高不确定性的战略决策场景
- **HITS** 将人类嵌入协作流程，适合需要人类直觉和判断力的创意探索场景
这种二分法为实际落地提供了清晰的选择框架：是想让 AI 团队做执行、人类做决策（→ HOTS），还是想让人类和 AI 共同参与执行过程（→ HITS）。

### 4. Benchmark 数据的意义
PinchBench 94.2% SOTA 配合 token 消耗降低 34.8%，说明多 Agent 协作不仅没有因为协作开销而降低效率，反而通过**合理的角色分工和模型路由**实现了更好的效果。这与单 Agent 时代"更大模型=更好效果"的思路形成鲜明对比。

## 实践启示
### 何时考虑引入 JiuwenSwarm
- 任务涉及**多个领域或多个专业角色**的协同（如医疗联合会诊、复杂软件交付）
- 需要**跨模型路由**以充分利用不同模型的优势
- 团队积累了大量**可复用的协作 SOP**，希望将其固化为可分享的技能资产
- 项目需要**长期演进能力**，而非一次性解决方案

### 如何从 Harness Engineering 过渡到 Coordination Engineering
对于已有 Harness Engineering 基础的团队，过渡路径可以是： ^["[InfoQ: 蜂群Agent来了！JiuwenSwarm](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/jiuwenswarm-coordination-engineering.md)"]
1. **先单 Agent 跑通**：确保每个角色 Agent 在 Harness 层面已经过优化 ^["[InfoQ: 蜂群Agent来了！JiuwenSwarm](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/jiuwenswarm-coordination-engineering.md)"]
2. **识别协作瓶颈**：哪些任务因为"单 Agent 能力边界"而受限 ^["[InfoQ: 蜂群Agent来了！JiuwenSwarm](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/jiuwenswarm-coordination-engineering.md)"]
3. **引入 Agent Swarm**：从两个角色开始尝试协作，观察通信和协商机制 ^["[InfoQ: 蜂群Agent来了！JiuwenSwarm](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/jiuwenswarm-coordination-engineering.md)"]
4. **沉淀 Swarm Skills**：将成功的协作模式标准化为可复用技能 ^["[InfoQ: 蜂群Agent来了！JiuwenSwarm](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/jiuwenswarm-coordination-engineering.md)"]

### 使用 Swarm Skills Hub 的策略
- **从社区共享技能开始**：不要重复造轮子，先在 Hub 中寻找场景匹配的技能
- **贡献打磨过的技能**：团队验证有效的协作模式是高质量的技能来源
- **关注自演进信号**：当系统开始自动推荐新的 Swarm Skill 时，说明实战数据在积累

## SwarmFlow — 从"能协作"到"稳稳地干完"（2026-06 增量）

openJiuwen 在 2026-06 开源 **SwarmFlow** —— 面向多智能体团队的**可控工作流编排方案**，把"团队怎么配合"从 Leader 临场判断升级为**系统稳定执行 + 自动追踪 + 可被复用**。 ^["[InfoQ: 蜂群Agent来了！JiuwenSwarm](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/jiuwenswarm-coordination-engineering.md)"]

**核心思路一句话：编排归系统，智能归 Agent。** SwarmFlow 增加的不是 Agent 数量，而是**协作的确定性**。 ^["[InfoQ: 蜂群Agent来了！JiuwenSwarm](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/jiuwenswarm-coordination-engineering.md)"]

### 三个绕不开的问题（复杂任务带来的考验）

主流多 Agent 协作模式（Leader Agent 临场调度）在面对长链路、多分支任务时： ^["[InfoQ: 蜂群Agent来了！JiuwenSwarm](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/jiuwenswarm-coordination-engineering.md)"]

1. **Leader 变成瓶颈**：每份中间结果都回 Leader，上下文被过程信息淹没 ^["[InfoQ: 蜂群Agent来了！JiuwenSwarm](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/jiuwenswarm-coordination-engineering.md)"]
2. **过程不稳定**：同一任务跑两次可能走出两条不同路径 ^["[InfoQ: 蜂群Agent来了！JiuwenSwarm](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/jiuwenswarm-coordination-engineering.md)"]
3. **执行不可靠**：谁先做、谁并行、什么时候汇总、失败怎么处理，即便提前写清楚仍依赖 Leader 临场发挥 ^["[InfoQ: 蜂群Agent来了！JiuwenSwarm](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/jiuwenswarm-coordination-engineering.md)"]

### Swarm Skill 的两种形态

**判定标准只有一个：编排能不能提前确定？** ^["[InfoQ: 蜂群Agent来了！JiuwenSwarm](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/jiuwenswarm-coordination-engineering.md)"]

| 形态 | 适用场景 | 协作方式 | workflow.py |
|------|---------|---------|-------------|
| **形态一**：不带脚本 | 多专家圆桌、方案评审、战略讨论 | 议程确定，但观点如何流动得在协作中自然发生 | 无 |
| **形态二**：带脚本 | 论文分析、办公自动化、批量 PPT 生成 | 角色 + 阶段 + 交接都提前定好 | 固化编排 |

**形态选择哲学**：编排是动态的用形态一保留开放协作；编排能提前确定的用形态二承接可执行编排。**确定性与开放性在同一套体系里各得其所。** ^["[InfoQ: 蜂群Agent来了！JiuwenSwarm](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/jiuwenswarm-coordination-engineering.md)"]

### 算子积木（Operator Library）

SwarmFlow 提供一组算子作为积木，每个算子只管一件事，拼起来就能描述出复杂协作： ^["[InfoQ: 蜂群Agent来了！JiuwenSwarm](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/jiuwenswarm-coordination-engineering.md)"]

| 算子 | 作用 | 备注 |
|------|------|------|
| **parallel** | 多个智能体一起跑、全部完成后统一汇总 | 适合多视角研判后合并 |
| **pipeline** | 多个条目各自独立逐级流过、互不等待 | 适合批量逐条处理 |
| **agents_session** | 有状态智能体在多轮协作中保留记忆 | 可"分身"一个副本做假设推演而不污染主线 |
| **human** | 在关键环节插入人机节点 | 向人类要一条输入或一次审批 |
| **budget** | 约束资源与额度消耗 | 把"会不会跑超"也纳入可控范围 |

**一个动作一块积木，复杂协作由简单积木拼出来，无需从零设计编排逻辑。** ^["[InfoQ: 蜂群Agent来了！JiuwenSwarm](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/jiuwenswarm-coordination-engineering.md)"]

### 可视化：JiuwenSwarm TUI

通过 `/swarmflows` 命令打开**实时交互式树状图**： ^["[InfoQ: 蜂群Agent来了！JiuwenSwarm](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/jiuwenswarm-coordination-engineering.md)"]
- 上方展示**阶段进度**
- 下方联动展示选中阶段里的 **Agent 状态**
- 排查时下钻到单个 Agent，查看**提示词、输出结果、错误日志**

### 三个真实落地场景

| 场景 | 流程 | 价值点 |
|------|------|--------|
| **金融分析** | 用户上传流程图 → SwarmSkill Creator 直接生成 SwarmFlow → 数据采集清洗 → 5 维度并行分析 → 交叉验证 + 综合置信度 → 完整报告 | **整条 SwarmFlow 不用手动编排，由一张图直接生成** |
| **技术调研 + 邮件** | 搜资料 → 整理素材 + 提取图片 → 分析核心问题/趋势/可讨论议题 → 生成结构清晰邮件并发送 | 避免步骤遗漏、口径变化、交付不一致 |
| **200 页 PPT 稳定产出** | 阶段一规划章节分工 → 阶段二 10 章节**并行生成** → 阶段三合并汇总 | 既靠并行明显加速，又能稳定产出结构统一、风格一致的 200 页 |

### SwarmSkill Creator（生成端）

JiuwenSwarm 内置 SwarmSkill Creator，根据自然语言需求**自动判断该生成哪种形态**： ^["[InfoQ: 蜂群Agent来了！JiuwenSwarm](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/jiuwenswarm-coordination-engineering.md)"]
- 默认生成不带脚本的 Swarm Skill（角色、协作规则、流程说明、约束）
- 判断用户要工作流 → 生成仅含脚本的版本（最小 Skill.md + workflow.py）
- 两者都要时支持生成完整协作规范 + 脚本的版本

**用户不必先理解文件结构，也不必手写编排脚本，只要把目标说清楚。** ^["[InfoQ: 蜂群Agent来了！JiuwenSwarm](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/jiuwenswarm-coordination-engineering.md)"]

### Team 模式自动调用（调用端）

用户不用分辨任务属于哪种形态，在 Team 模式下一句需求自动进入。系统判断任务形态： ^["[InfoQ: 蜂群Agent来了！JiuwenSwarm](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/jiuwenswarm-coordination-engineering.md)"]
- 适合固定编排 → 进入 SwarmFlow
- 更适合开放协作 → 用不带脚本的 Swarm Skill
- 单个 Agent 够用 → 不额外启动多 Agent

**这是 openJiuwen 想定义的可控协同工程新范式——让复杂协作在系统内部变得可控，让用户侧保持自然和简单。** ^["[InfoQ: 蜂群Agent来了！JiuwenSwarm](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/jiuwenswarm-coordination-engineering.md)"]

### 与自演进的衔接

从生成工作流（可控）到自演进（越用越强），**沉淀、编排、演进三者环环相扣**，构成 Coordination Engineering 的完整闭环。 ^["[InfoQ: 蜂群Agent来了！JiuwenSwarm](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/jiuwenswarm-coordination-engineering.md)"]

## Jiuwen Symphony — 海量技能的"精准发现 + 稳定协同"（2026-06-17 增量）

如果说 SwarmFlow 解决的是**多 Agent 团队怎么稳定配合**，那么 Jiuwen Symphony 解决的是更底层的问题：**单个 Agent 面对海量技能时怎么选得对、串得稳**。 ^["[InfoQ: 蜂群Agent来了！JiuwenSwarm](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/jiuwenswarm-coordination-engineering.md)"]

> 当一个 Agent 能调用的 Skill 从 5 个膨胀到 50 个，会发生什么？答案是：任务执行效果出现"断崖式下滑"——技能越多，Agent 反而越选不准。

### 两个绕不开的核心难题

- **选不准**：技能太多，上下文窗口装不下所有技能说明书，必然出现信息过载、上下文过长。改用语义检索查找相似技能，由于检索与任务执行相互独立，仍无法解决多意图、隐式意图这类需要推理的选择问题。
- **用不好**：技能选对了，还需要精准编排。技能广场上的技能标准不统一，上一个技能的产出能否喂给下一个、谁先谁后、谁依赖谁，若每次让模型临场发挥，常常出现执行失败、流程中断等稳定性问题。

### 双核心架构：检索用树，编排用图

| 组件 | 数据结构 | 解决的问题 | 关键机制 |
|------|---------|-----------|---------|
| **技能检索** | 层次化技能树 | 选不准 | LLM 在树上按任务需求**逐步导航**，而非一次性读完全部技能 |
| **技能编排** | 技能依赖图 | 用不好 | 基于能力指纹 + 双向搜索（向后扩展"下一步"+ 反向回溯"谁能补上"） |

**技能检索设计要点**： ^["[InfoQ: 蜂群Agent来了！JiuwenSwarm](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/jiuwenswarm-coordination-engineering.md)"]

- 把平铺的技能列表预先组织成层次化技能树，变成可逐层浏览的技能目录；
- 检索机制被设计为面向 Agent 的**专用工具集**（递归能力树构建 / 分支探索 / 轻量预览 / 候选技能读取），而非执行前的一次性预处理；
- 关键判断："**技能选择被真正融入了 Agent loop，而非检索与执行相互独立**"。

**技能编排设计要点**： ^["[InfoQ: 蜂群Agent来了！JiuwenSwarm](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/jiuwenswarm-coordination-engineering.md)"]

- **离线能力指纹**：覆盖技能的基础信息、输入输出产物、能力质量评估；
- **动态词表归一**：把命名不一的同义字段（如 body / content / 正文）归一到规范词；
- **依赖关系图**：节点是技能，边是"技能 A 的输出能否成为技能 B 的输入"，**作为结构化资产沉淀，可被反复读取、复用和演进**；
- **运行时双向搜索**：种子技能 → 向后扩展 / 反向回溯 → 拼出真正接得上的技能组合。

### SkillsBench 实测数据（Top-5 选择）

| 方案 | 召回率 | 成功率 | 平均最大上下文 |
|------|--------|--------|---------------|
| 关闭检索 | 低 | 低 | ~82k tokens |
| Embedding 检索 | 中 | 中 | 中 |
| **Symphony 技能检索** | **0.741** | **0.615** | **~21.5k tokens** |

Symphony 在 Top-5 选择上取得最佳效果，且把平均最大上下文从约 82k tokens 降到约 21.5k tokens（**降幅 ~74%**）。

### 三个实战场景（独立可接力）

**场景一：视频处理（仅使用技能检索）**——技能库膨胀到数千时，Agent 通过技能目录逐步探索"视频/音频处理"主分支 + "文本整理 / 报告生成"辅助分支，最终覆盖：视频读取与处理 / 音频转写 / 口头禅检测 / 停顿分析 / 关键片段整理 / 报告生成 / 备选兜底处理。 ^["[InfoQ: 蜂群Agent来了！JiuwenSwarm](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/jiuwenswarm-coordination-engineering.md)"]

**场景二：办公写作（仅使用技能编排）**——任务："英文博客截图翻译后整理成公众号文案并发邮件"。没有编排时 Agent 输出仍是图片无法串联；有编排后规划稳定路径：**图片翻译 → 文字识别（图片→可编辑文本）→ 文案撰写 → 邮件发送**，每步输出必须能喂入下一步。 ^["[InfoQ: 蜂群Agent来了！JiuwenSwarm](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/jiuwenswarm-coordination-engineering.md)"]

**场景三：出行规划（先检索后编排）**——两个核心组件联动的典型用例。

启用方式：在 JiuwenSwarm 页面"配置信息-其他配置"打开"**技能交响乐**"开关。 ^["[InfoQ: 蜂群Agent来了！JiuwenSwarm](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/jiuwenswarm-coordination-engineering.md)"]

### Symphony 与 SwarmFlow 的层次关系

| 维度 | SwarmFlow（团队层） | Symphony（能力层） |
|------|-------------------|------------------|
| 抽象对象 | 多个 Agent 角色 | 多个 Skill |
| 核心数据结构 | 工作流编排图（含阶段 / 交接 / 并行） | 技能依赖图（输入输出衔接） |
| 解决的问题 | 团队怎么稳定配合 | 单 Agent 怎么从海量技能里选对 + 串稳 |
| 决策权 | 编排归系统、智能归 Agent | 检索归 LLM（融入 Agent loop）、编排归图结构 |

**关键洞察**：SwarmFlow 是"团队怎么配合"，Symphony 是"个人怎么打仗"。两者在 openJiuwen 体系里形成 **Agent 内部能力编排（Symphony） + Agent 之间协同（SwarmFlow）** 的完整双层架构。

### 与"动态能力分发"行业趋势的对照

openJiuwen 的判断与行业共识一致：**模型能力在增强，但系统能力没有同步增长**： ^["[InfoQ: 蜂群Agent来了！JiuwenSwarm](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/jiuwenswarm-coordination-engineering.md)"]

- 模型可以理解复杂需求，却常常无法稳定调用外部能力；
- 工具越来越多，却难以被高质量地检索和复用；
- 流程越来越复杂，却缺乏统一的技能组织方式。

Symphony 把 skill 当作"系统资产"来管理，而不只是提示词里附带的一段工具说明。这与 Anthropic MCP、OpenAI Codex 等的行业探索方向一致，但 Symphony 的差异点在于**双核心（树检索 + 图编排）同时落地**，且给出了 SkillsBench 上的量化收益（82k → 21.5k tokens 上下文降幅）。

### 5 条独到判断

1. **"选不准 + 用不好"是技能规模化的两大死结**，分开解决都不彻底——必须"检索 + 编排"双核心同时设计。 ^["[InfoQ: 蜂群Agent来了！JiuwenSwarm](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/jiuwenswarm-coordination-engineering.md)"]
2. **检索要融入 Agent loop，而不是执行前一次性预处理**。否则多意图 / 隐式意图这种需要推理的选择问题永远解不掉。 ^["[InfoQ: 蜂群Agent来了！JiuwenSwarm](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/jiuwenswarm-coordination-engineering.md)"]
3. **依赖图作为"结构化资产"沉淀**比每次临场推理更有价值——图可以"反复读取、复用、演进"，符合"长期资产 > 一次性推理"的工程哲学。 ^["[InfoQ: 蜂群Agent来了！JiuwenSwarm](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/jiuwenswarm-coordination-engineering.md)"]
4. **能力指纹 + 动态词表归一**是图能起作用的前提，否则"同名不同义 / 同义不同名"会让依赖关系失真。这是从 RAG / Schema 工程借来的关键技巧。 ^["[InfoQ: 蜂群Agent来了！JiuwenSwarm](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/jiuwenswarm-coordination-engineering.md)"]
5. **失败可局部修复**——沿图结构定位失败节点，就近替换或修补，不必整条链路推倒重跑。这把"局部性"思想从系统架构层（cache locality）推到了 Agent 编排层。 ^["[InfoQ: 蜂群Agent来了！JiuwenSwarm](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/jiuwenswarm-coordination-engineering.md)"]

### 3 条实践启示

1. **技能数量超过 10-20 个就该考虑检索机制**，而非等"出问题再修"。Embedding 检索是过渡方案，**树检索 + Agent loop 集成**才是规模化终态。 ^["[InfoQ: 蜂群Agent来了！JiuwenSwarm](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/jiuwenswarm-coordination-engineering.md)"]
2. **依赖关系图应该离线构建 + 在线查询**，避免每次编排都做语义匹配——性能与稳定性双赢。 ^["[InfoQ: 蜂群Agent来了！JiuwenSwarm](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/jiuwenswarm-coordination-engineering.md)"]
3. **组合可靠 / 协同可解释 / 失败可局部修复**是判断"编排系统是否成熟"的三个硬指标，比"功能丰富"更重要。 ^["[InfoQ: 蜂群Agent来了！JiuwenSwarm](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/jiuwenswarm-coordination-engineering.md)"]

## 相关实体
- [Agent Development Crawl Walk Run Crewai Iterative](/ch04-166-agent-开发应小步快跑-第一个-agent-只需做一件事-哪怕很烂/)
- [Agent Orchestration](/ch04-409-agent-orchestration/)（AWS — 多 Agent 编排对照）
- [Meta Skill Skill Orchestration Opensquilla Jay](/ch01-810-meta-skill-skill-之上编排-skill-的抽象层/)（笨小葱 — 单 Skill 编排对照）
- [Ai Agent Tool Count Trap](/ch04-243-ai-agent工具数量陷阱-5个边界清楚的工具胜过20个模糊工具/)（execute_code 算子的极简设计同源思想）
- [Agentic Design System From Chatbot To Orchestration](/ch01-012-agentic-design-system-from-chatbot-to-orchestration/)

## 3rd Source 原文存档
→ [openJiuwen 开源 Jiuwen Symphony 技能编排与分发系统 — CSDN 2026-06-17](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/jiuwen-symphony-skill-orchestration-distribution-openjiuwen.md)

## 2nd Source 原文存档
→ [openJiuwen开源SwarmFlow — AI技术立文 2026-06-12](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/jiuwenswarm-swarmflow-controllable-orchestration-ai-tech-newspaper.md)

→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/05-11-the-great-memory-panic-of-2026.md)

### HOTS/HITS 选择指南
| 场景 | 推荐模式 | 理由 |
|------|---------|------|
| 战略决策支持 | HOTS | 需要人类把握全局，AI 做信息处理和方案生成 |
| 创意探索/头脑风暴 | HITS | 需要人类的直觉和灵感，与 AI 共同推演 |
| 标准化流程执行 | HOTS | AI 团队负责执行，人只在异常时介入 |
| 游戏/沉浸式体验 | HITS | 体验的核心是参与感，而非结果优化 |
---
→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/jiuwenswarm-coordination-engineering.md)

---

## Ch08.008 ai agent memory systems

> 📊 Level ⭐⭐⭐ | 16.0KB | `entities/ai-agent-memory-systems.md`

> 来源：[原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/memory-agent-systems-cobanov.md)

# How AI Agent Memory Works
Language models forget the moment they finish replying. Memory is everything the system around them does to make that not matter. This essay walks through the ideas one at a time, with something to touch in every section.
**Source**: [raw article](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/memory-agent-systems-cobanov.md) | **Review**: value=8 confidence=7

## 核心要点
- AI agent memory 是一个循环系统：接收消息 → 编码 → 检索相似记忆 → 组装 prompt → 生成响应 → 决定是否记住新信息
- 四种记忆类型：Episodic（事件）、Semantic（事实）、Procedural（技能）、Working（当前工作区）
- 向量检索是语义搜索的基础，通过 cosine similarity 找到最相关的记忆片段
- 记忆 governance（PII 过滤、时间有效性、超额标记）是区分 demo 与生产系统的关键
- Multi-agent memory 是权限拓扑问题，而非简单的存储扩展
- 生产系统需要分离读写路径、背景 worker 处理慢操作、多租户隔离、延迟预算管理
→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/memory-agent-systems-cobanov.md)

## 相关实体
> 主题导航

- [memory agent systems cobanov](/ch04-458-memory-agent-systems-cobanov/)
- [AI Agent 记忆系统架构](/ch04-145-how-ai-agent-memory-works/)
- [当 AI Agent 学会"忘记"：Amazon Bedrock AgentCore Memory 的记忆哲学](/ch11-147-当-ai-agent-学会-忘记-amazon-bedrock-agentcore-memory-的记忆哲学-亚/)
- Hermes Agent 记忆系统 vs OpenClaw 记忆观
- [深度拆解 Hermes Agent 记忆系统](/ch06-memory/)
- [Agent Memory 架构本质](/ch04-146-agent-memory-架构本质/)

- MOC
## 深度分析
### 记忆的本质是循环，而非存储
Cobanov 的核心论点是"Language models forget the moment they finish replying"——这一定义将记忆问题从"存储"重新框架为"循环"。传统开发者倾向于将 memory 理解为 database（一种持久化存储），但实际上 memory 是一个持续运转的处理管道：每个用户消息触发一次完整的检索-组装-生成-写入循环。
这一框架的重要推论是：记忆系统的性能不仅取决于存储层（vector DB 的查询速度），还取决于整个循环中每一个环节的效率——查询重写是否准确、embedding 模型是否适配领域、reranker 是否能平衡相关性与新鲜度。任何一个环节的瓶颈都会成为整个记忆系统的瓶颈。Memory is a lifecycle problem: write, age, supersede, redact, forget，而非简单的 CRUD 操作。

### 四种记忆类型的认知科学映射
Episodic / Semantic / Procedural / Working 的四分法直接借鉴自认知科学，每种类型对应不同的认知功能：

- **Episodic memory**：时间有序的事件日志，回答"我们上次谈了什么"。检索策略以时间 recency 为主，但也可以按日期范围或主题查询。实现上，每轮对话结束后生成一个短摘要并写入 vector DB，下一轮对话时通过 embedding 相似度召回 top-3~5 条。
- **Semantic memory**：结构化的事实和关系，回答"用户知道什么"。通常通过知识图谱实现，支持多跳推理（如"用户工作的公司位于哪个城市"）。图谱的边代表关系类型（works_at、lives_in、prefers），节点代表实体。
- **Procedural memory**：学会的技能和工具使用，回答"agent 能做什么"。这决定了 agent 的工具调用模式和错误处理策略，而非关于用户的事实。实现上通常是 prompt 或 policy 文件中的规则集。
- **Working memory**：当前的 scratchpad，回答"现在正在处理什么"。这决定了模型的"注意力焦点"，是唯一完全位于 in-prompt 的记忆类型。其容量受限于 context window 大小。
四者的协同工作机制是：访客走到博物馆 agent 说"Tell me more about that Refik piece you mentioned earlier"时，episodic 找到之前聊过 Refik 的记录 → semantic 从 catalog 拉取该作品的完整描述 → procedural 触发 artwork_detail 工具获取实时数据 → working 将所有检索结果和当前消息一并放入 context，LLM 在此基础上作答。四个 store 对用户是"无感"的，但每个 store 有不同的读写规则和检索策略。

### 向量检索的几何直觉与局限
Embedding 将文本映射到高维向量空间（通常 1536-3072 维），相似语义的内容在该空间中距离较近。Cosine similarity 是衡量相似度的标准方法，因为它对向量长度不敏感。HyDE（Hypothetical Document Embeddings）的核心洞察是：问题和答案往往是不同"形状"的——直接 embedding 问题可能找不到包含答案的文档，因为答案的表述方式与问题不同。HyDE 先让 LLM 生成一个假设性答案，再 embedding 那个答案，找到形状相似的文档。这一技巧在实践中能将检索召回率提升显著。
然而，embedding 模型的选择直接影响检索质量——通用 embedding 在垂直领域（如医疗、法律）可能表现不佳，需要 fine-tuned domain-specific embedding。此外，embedding 模型一旦更换，旧存储的所有向量都需要重新计算，这是一个被经常低估的运维成本。

### 读写分离与治理门
Memory governance 是将 demo 级记忆系统推向生产的关键。"Naive append"会导致 PII 泄露（credit card number 进入记忆存储）和矛盾（用户搬家后，新旧两个地址都存在，agent 不知道哪个是当前的）。"Naive overwrite"丢失时间上下文，无法回答"用户以前住在哪里"的问题。Governed 写入则维护了完整的时间线：标记旧事实为 superseded，保留用于时序推理，同时通过 PII filter 阻止敏感信息进入存储。
这一设计的实现要求是：写入路径必须经过一个 governance gate，该 gate 负责 PII 检测（正则或模型）、时间有效性标注（valid_from / valid_until）和矛盾检测（发现新事实与旧事实冲突时，标记旧事实为 superseded 而非删除）。读取路径则需要在组装 prompt 之前应用时间过滤器（如"只返回当前有效的事实"）。

### Multi-agent Memory：权限拓扑而非存储扩展
当记忆从单个 agent 扩展到多个 agent 时，问题从"如何存储"变成"谁能看到什么"。Shared memory 不再是单一向量数据库，而是变成了一个权限图：Researcher agent 的研究笔记默认是 private（不需要广播到项目频道），Planner 的决策记录可能需要 shared（因为其他 agent 需要知道计划上下文），而用户偏好（如饮食禁忌）应该是 User-profile scoped（只对当前用户可见）。
六种失败模式揭示了 shared memory 的核心风险：Cross-user leakage（研究笔记中的用户偏好泄露给其他租户）、Over-sharing（过多共享导致噪声）、Poition propagation（错误信息通过共享记忆扩散）、Conflicting decisions（不同 agent 基于不同版本的记忆做出矛盾决策）、Stale playbook（共享的决策规则过时但未被更新）、Attribution loss（无法追溯某条记忆是谁在什么上下文中写入的）。

### 生产系统架构：读写路径分离与延迟预算
Reference architecture 将系统分为两条路径：Agent runtime 在 request path 上（必须低延迟），Memory service 作为 side-quest（允许异步处理）。背景 worker 负责慢操作：embedding 计算、摘要生成、re-embedding 过时记忆、decay 策略执行。这些操作如果放在 request path 上，会直接增加用户感知延迟。
Latency budget 分析显示 p95 目标 800ms 中，retrieval 占用约 495ms（Query rewrite 80ms + Dense search 60ms + BM25 30ms + Graph walk 50ms + Reranker 250ms + Pack+send 25ms）。Reranker 是最大的单一瓶颈（250ms），这解释了为什么许多系统在 production 中跳过 reranker 或使用轻量级 reranker——用一点点相关性损失换取显著延迟改善。

## 实践启示
### 对 AI 应用开发者
1. **从四种记忆类型出发设计架构**：在设计新的 agent memory 时，先明确需要支持哪种记忆类型。简单的个人助手只需要 episodic + semantic；复杂的 multi-agent 系统需要额外考虑 procedural（工具策略）和共享 memory 的权限拓扑。
2. **Embedding 模型选型决定检索质量上限**：不要默认使用 OpenAI 的 ada-002 或 text-embedding-3-large。花时间在具体垂直领域评估 embedding 质量——医疗场景用 PubMedBERT，法律场景用 LegalBERT，可能比通用 embedding 好很多。同时建立 embedding 模型版本管理策略，以便在未来模型升级时重新计算所有历史向量。
3. **HyDE + RRF 是 production retrieval 的标配组合**：HyDE 处理 query/answer shape mismatch 问题，RRF（Reciprocal Rank Fusion）融合 dense/sparse/graph 三种检索结果。这两者一起使用可以将召回率提升 20-30%，而实现成本相对可控。
4. **永远不要跳过"是否需要检索"的判断**：对于"Can you translate hello to Japanese"这类不需要记忆的请求，调用 vector search 是纯粹的浪费。在 retrieval pipeline 入口增加"need detection"步骤（简单的分类模型或规则），可以显著降低无用检索的延迟和成本。

### 对安全与隐私工程师
1. **PII governance 必须在写入路径而非读取路径**：在读取时过滤 PII 意味着敏感信息已经进入了存储，风险暴露面已经形成。正确的做法是在写入路径上用正则匹配（如 `\b\d{4}-\d{4}-\d{4}-\d{4}\b` 匹配信用卡号）和/或专用 PII 检测模型（如 Microsoft Presidio）拦截敏感信息。
2. **多租户隔离是 multi-agent memory 的生死线**：每个租户的记忆必须严格隔离。实现上建议在 namespace per tenant 和 single collection + payload filter 之间做出选择——前者隔离严格但成本高，后者成本低但存在隔离失效的风险。对于高价值客户或有合规要求的场景，namespace per tenant 是值得的。
3. **Deletion lineage 是审计合规的基础**：GDPR 的"被遗忘权"要求系统能够删除特定用户的所有记忆。但简单的物理删除（从 vector DB 中移除对应向量）可能不够——该记忆可能已经被用于生成 response 或写入其他 agent 的 shared memory。因此 deletion 操作本身应该是一个 audit event，触发 propagate 流程到所有衍生索引和共享存储。
4. **Cross-user leakage 的测试用例**：在 memory 系统上线前，必须设计覆盖以下场景的测试：租户 A 的研究笔记中的用户偏好信息，是否会出现在租户 B 的 agent 响应中？这是最常见的 memory 相关安全漏洞，也是最难通过单元测试发现的——需要专门的 integration test 环境。

### 对平台工程师
1. **热/温/冷三层存储是 cost-efficiency 的关键**：并非所有记忆都需要 vector search 的计算成本。Top facts（活跃用户/项目的核心信息）放在 Redis 或内存 KV 中，每轮都读取；Recent episodes（近期对话）放在 vector DB 中，按需检索；Archived sessions（历史日志）放在 S3 中，仅用于回填或审计。三层架构可以将热数据的检索延迟降低一个数量级，同时将存储成本降低 70-80%。
2. **Memory API 的最小表面设计**：生产系统的 memory API 只需要三个端点：`POST/memory/events`（追加原始事件）、`POST/memory/search`（混合检索，服务器端强制 scope 过滤）、`DELETE/memory/{id}`（遗忘，propagate 到衍生索引）。不要在 API 层面暴露过多的内部实现细节（如"更新某条记忆的 embedding"），这会破坏封装性并增加安全风险。
3. **Embedding 模型更换的运维流程**：每当 embedding 模型更换时，所有历史存储的向量都需要重新计算。这不是简单的 batch job——它需要在重新计算期间暂停写入（否则新模型生成的向量和旧向量混在一起无法检索），或者采用双写策略（新旧向量并行写入，切换完成后清理旧向量）。提前设计好这个流程，避免在凌晨 3 点手忙脚乱。
4. **Background worker 的优先级队列设计**：embedding 计算、摘要生成和 re-embedding 是不同的作业类型，应该使用不同的优先级队列。高优先级队列处理用户等待的同步检索，中优先级处理需要尽快完成的写入后任务（如 summary），低优先级队列处理非紧急的维护作业（如过时记忆的 re-embedding）。

### 对产品经理
1. **"记住一切"是错误的产品假设**：用户并不总是希望 agent 记住所有对话历史。有些对话是临时性的（"帮我查一下这个航班"），有些是敏感但不相关的（医疗信息不应与产品偏好混淆）。产品设计应该让用户能够选择性地"标记重要记忆"和"遗忘临时对话"，而不是默认将所有内容都写入长期记忆。
2. **Memory 的"忘记"功能是信任建立的关键**：在用户界面中明确显示"agent 记得什么"并允许用户删除特定记忆，能够显著提高用户对 AI 产品的信任度。这不仅是隐私合规的要求（GDPR 等），也是产品竞争力的体现——用户更愿意使用一个他们能够控制的记忆系统。
3. **Multi-agent memory 的 shared/private 默认为 private**：如果 agent 之间需要共享记忆，那应该是一个有意识的显式操作（类似"发布到项目"），而不是默认行为。默认共享会导致信息噪音和隐私泄露，而默认私有则要求开发者主动考虑共享场景——这是一个更安全的默认选择。
4. **Memory 系统的可观测性指标**：上线 memory 系统前，必须建立以下 metrics：检索召回率（通过用户反馈或 ground truth 数据集评估）、PII 泄露次数（每次 governance gate 拦截都是一次告警）、平均检索延迟（p50/p95/p99）、记忆更新成功率（写入路径的 SLA）。这些指标应该在 dashboard 上实时展示，并在异常时触发告警。

---

## Ch08.009 古法程序员复杂任务 Spec 写作：多 Agent 编排 + Skill 三层架构 + Gate 四态

> 📊 Level ⭐⭐⭐ | 15.9KB | `entities/gufabiancheng-spec-for-complex-tasks-cc-codex.md`

# 古法程序员复杂任务 Spec 写作：多 Agent 编排 + Skill 三层架构 + Gate 四态

## 核心定位

古法程序员（公众号 cc-codex实践）Harness Engineering **系列中篇**——回答"业务侧的 spec 到底要写些什么"。**核心命题**：当任务复杂到需要多角色协作、跨多阶段、保证每步可追溯，**spec 就不再是"一段提示词"，而是一套有结构的工程资产**。

**三件套**：**工作流编排 + skill 组织 + 知识库建连**。

## 一、多 Agent：一个编排者 + 一队专职执行者

### 分工

- **编排者（入口 Agent）**：只做编排和收口——判断阶段、门禁、派发、是否继续。**不亲自写业务代码**
- **执行者**（7 角色）：需求分析师 / 架构师 / 各端实现者 / 代码评审者 / 测试工程师 / 联调工程师 / 效率工程师

### 派发纪律（血泪教训）

- **角色绑定规则约束**：错派角色 = 绕过该角色该过的关卡（作者亲历：UI 实现错派架构师 → 视觉对齐问题复发）
- **先按阶段选角色**，再用"改动文件路径 → 角色"映射表校验写入范围
- **跨端改动禁止一个 Agent 包办**：必须架构师出统一契约 → 各端实现者隔离写入范围并行

### 并行配额

- 同主线**最多 5 个子 Agent**（常态 4 + 1 备用）
- 派发时声明：交付什么 / 什么格式 / 写到哪 / 验收条件
- 完成后**先核验产物再关闭释放名额**——否则就是失控的并发进程

## 二、入口文件（CLAUDE.md / AGENTS.md）写作

### 第一原则：薄入口

入口只放**启动索引和硬边界**，不放具体步骤。具体步骤 → skill，硬规则 → rules，角色契约 → agents，背景决策 → docs。**入口本身只是一张地图**。

### 入口 Agent 契约（写死）

- 编排者和收口者，**不是执行者**
- 只判断阶段/门禁/交接/派发
- 小型机械修订/索引更新/跑校验可自做，**其余默认派子 Agent**
- 不直接改生产代码，**不绕过门禁、评审、校验**
- 非致命问题**先记录 owner/route/证据/下一步继续**，不要停下来问
- 只有**致命错误或门禁明确卡住**才允许停

### 模板投影（反模式提醒）

入口真正的权威源是**模板文件**，CLAUDE.md / AGENTS.md 是从模板**投影**出来的。直接改投影文件 = 下次同步被覆盖。**多 Agent 协作里很容易踩**。

## 三、rules / docs / skills 三类目录

### 职责切分

| 目录 | 答什么 | 内容 |
|---|---|---|
| **skills** | **怎么做** | 具体步骤和流程 |
| **rules** | **必须遵守什么** | 硬约束、检查清单 |
| **docs** | **为什么是现在这样** | 架构、背景、长期决策记录 |

**核心好处**：同一条知识**只有一个权威位置**。

### 一个 skill 的标准结构

```
某个 skill/
├── SKILL.md        # 薄入口：路由 + 职责 + 边界 + 输出契约
├── references/     # 按需加载的长内容
└── scripts/        # 确定性脚本（仅 script-backed skill）
```

测试样例 → **平行的 evals 目录**（按 skill 名一一对应，不放 skill 内）。

### SKILL.md 固定骨架

frontmatter（name / 用于路由的 description「含适用/不适用/典型触发语」 / 层级 / 风险等级 / 是否人工复核）+ 职责边界 + 适用与不适用 + 工作方式（含"什么时候去读哪个 reference"）+ 按需加载 references 清单 + 输出与验证。

**核心纪律**：SKILL.md 要薄。**它是路由卡不是知识库**。

### skill 怎么引用 rule / docs / 知识库

- **references**（skill 自有长内容）：按需点名加载，**平时不占上下文**
- **rule**（硬约束）：不在 skill 正文抄，**靠路径和角色自动挂**——目录级规则按路径加载，角色绑定规则随角色加载，最硬的几条启动就常驻
- **docs**（长期知识）：**每条 docs 知识都必须有明确消费方**（某 skill/rule/角色引用它）——**没有消费方 = 孤儿知识**

**新 docs 知识入系统时，必须顺手补上谁会用它**。

### script 硬要求

- 优先标准库 + POSIX shell，少引外部依赖
- 写状态文件**原子写入**，并发加锁
- 命令包装器**只调配置里声明过的入口**
- 完整日志落盘，主会话只回传摘要
- **新脚本必须配测试**，改流程脚本要跑回归
- 脚本是用来兜住确定性的，**自己不可靠就失去意义**

## 四、Skill 三层架构

### 三层职责（严格不重叠）

- **编排层（orchestrator）**：通常 1 个，维护状态机、派发控制权，**不干具体活**
- **阶段层（phase）**：对应交付链路每段（需求/设计/开发/评审/测试/发布），管输入输出和门禁
- **原子层（atom）**：单一确定能力，**只做一件事，不编排别的 skill，不发明命令**

### 阶段层关键设计：gate 四态

| Gate | 含义 | 处置 |
|---|---|---|
| **pass** | 通过 | 进下一阶段 |
| **blocked** | 卡住 | 附负责人和回退路径 |
| **not_required** | 本阶段对该模块不适用 | 放行（例：纯后端模块 UI 还原阶段） |
| **risk_accepted** | 有问题但显式接受 | 留痕继续 |

**核心纪律**：**没有证据时，宁可卡住也不要假装完成**。

### 节点清单：单一事实来源

每个节点声明：属于哪一层 / 怎么执行（脚本 vs 模型推进）/ 路由描述（含"适用/不适用/典型触发语"）/ 输入输出 / 可用工具 / 风险等级 / 是否人工复核。

### 节点间三种 edge

| Edge | 含义 | 驱动方 |
|---|---|---|
| **handoff** | 阶段间流转 | 编排者驱动 |
| **dynamic_load** | 子 Agent 新上下文动态加载能力 | **用什么加载什么，不全塞进去** |
| **semantic** | 证据依赖 | 例："发现候选"只产候选地图，定点证据必须下游证据 skill 收敛，**不能看到候选就当结论** |

### 为什么要分层

变化频率和失败模式不同：
- 编排逻辑**很少变**（一变就全局）
- 阶段契约**中等频率变**（改一段输入输出）
- 原子能力**最常变**（每次只动一个点）

**混在一起没法只改一层而不担心其他层崩**。分层后每个能力**独立路由、独立测、独立改**，不会悄悄拖动其他部分。

## 下一篇预告

**测试三件套**：
1. **对照**：同题配 skill vs 不配 skill 跑两遍，比差在哪（避免把通用规则的功劳算到 skill 头上）
2. **存档**：模型每次真实回答存为文件、提交进代码库，跑完能复查而非跑完就忘
3. **不用大模型打分**：裁判自己也不稳（今天给 8 分明天给 6 分），用写死的、对错一目了然的检查项来判

## 一句话总结

> 复杂任务的 spec 核心是**三件资产**：工作流怎么编排、skill 怎么组织、知识库怎么建连。把这三件分别说清楚，比写一段更长的提示词管用得多。

## 与 wiki 既有内容关系

- **Claude Code Dynamic Workflows 多Agent编排**（696 行 9 source）：jiagoux/thariq 视角（6 模式/3 失败/10 场景）↔ 古法程序员视角（spec 写作/skill 三层/gate 四态/edge 三种）。**互补不重复**
- **[高德 Spec as AI OS：反熵增架构](/ch05-013-spec-as-aios-ai-native-全栈交付的抗熵架构-高德技术系列第二期/)**（274 行）：都强调 spec 结构化；高德更宏观（OS 级反熵增），古法程序员更落地（文件目录/skill 分层/edge 种类）
- **[Harness Engineering](/ch05-010-harness-engineering-ai-从-聪明-到-可靠-的第三代工程范式/)**（290 行 5 source）：理论 + 5 制品 + 3 阵营；古法程序员的"skill 三层 + edge 三种 + gate 四态" = **Harness 概念的工程实现映射**

## 深度分析

**Spec 从"提示词"到"工程资产"的范式转换**：古法程序员的核心洞察在于，当任务复杂度超过单个 Agent 的能力边界时，spec 的性质发生根本变化——它不再是"更好的提示词"，而是包含编排逻辑（谁做什么）、skill 目录（怎么做的知识）和知识图谱（用什么做）的三维工程资产。这与 Harness Engineering 的"5 制品"理论完全对应，但提供了更落地的文件组织方案。

**Gate 四态是编排鲁棒性的关键**：pass/blocked/not_required/risk_accepted 四种 gate 状态的设计，解决了多 Agent 编排中最常见的问题——某个 Agent 失败后，整个 pipeline 是卡死还是优雅降级？blocked 态允许人工介入，risk_accepted 态允许跳过非关键检查点。这比简单的 try/catch 模式更适合生产环境。

**Skill 三层架构的工程智慧**：编排层 skill（全局调度）→ 阶段层 skill（单步执行）→ 原子 skill（可复用工具）的三层结构，本质上是软件工程中"模块化"思想在 AI Agent 领域的映射。它解决了两个关键问题：(1) skill 复用——原子 skill 可以跨多个阶段层 skill 调用；(2) 测试隔离——每层可以独立测试。

**"不用大模型打分"的 eval 哲学**：测试三件套中最有价值的洞察是"裁判自己也不稳"——LLM 评分的随机性（今天 8 分明天 6 分）使得自动化 eval 不可靠。用写死的检查项替代 LLM 评分，虽然覆盖面窄，但结果确定可复现。这是工程实践中"可复现性 > 覆盖面"原则的体现。

**Edge 三种类型的语义价值**：handoff（Agent 间交接）、dynamic_load（运行时加载）、semantic（语义级连接）三种 edge 类型，比简单的"数据传递"抽象层次更高。特别是 semantic edge——它允许 Agent 间通过语义相似度而非硬编码接口连接，是松耦合编排的关键创新。

## 实践启示

1. **用"三件套"结构组织复杂任务 spec**：不要写一个巨大的 prompt——拆分为 (1) 工作流编排文件（定义 Agent 分工和 gate 条件）、(2) skill 目录（按三层结构组织）、(3) 知识库（规则+文档+示例）。每个文件独立可测试。

2. **为每个关键步骤定义 gate 状态**：不要假设所有步骤都会成功——为每个步骤明确 gate 条件（pass/blocked/risk_accepted），并定义 blocked 态的升级路径（人工介入 or 自动重试）。

3. **投资原子 skill 的复用性**：在三层 skill 架构中，原子 skill 的复用价值最高。优先将通用能力（文件读写、API 调用、格式转换）封装为原子 skill，而不是在每个阶段层 skill 中重复实现。

4. **eval 用确定性检查项替代 LLM 评分**：对于自动化测试，优先使用写死的、对错一目了然的检查项（文件是否存在、格式是否正确、关键字段是否出现），而不是让 LLM 打分。LLM 评分只用于人工 review 环节。

5. **CLAUDE.md 作为薄入口 + 模板投影**：不要把所有规则写进 CLAUDE.md——保持它为"薄入口"（指向 rules/docs/skills 目录），用模板投影机制将详细规则注入到具体任务上下文中。这避免了 context window 浪费。

## 相关实体

→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/gufabiancheng-spec-for-complex-tasks-cc-codex.md)

- [Claude Code 多智能体协作体系设计](/ch01-856-claude-code-多智能体协作体系设计-从单agent到多agent工作流/)
- [Harness Engineering](/ch05-010-harness-engineering-ai-从-聪明-到-可靠-的第三代工程范式/)
- [Agent Loop 工程手册 8 个未解问题](/ch04-143-agent-loop-工程手册-8-个未解问题-self-protocol-治理薄壳-腾讯陈进的二手解读与单-age/)
- [jiagoux 架构师视角 Dynamic Workflows](/ch01-731-claude-code-dynamic-workflows-第-7-译本-架构师-jiagoux-视角-任务级-harn/)
- [Agent Harness 架构深度](/ch01-316-agent-harness-解析-智能体架构深度拆解/)
- MOC

---

## Ch08.010 How Grab is Using AI Agents to Boost Team Productivity

> 📊 Level ⭐⭐⭐ | 13.5KB | `entities/how-grab-is-using-ai-agents-to-boost-team-productivity.md`

> 来源：[原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/how-grab-is-using-ai-agents-to-boost-team-productivity.md)（ByteByteGo, 2026-05-18）

## 核心要点
- **问题背景**：Grab ADW（Analytics Data Warehouse）团队管理 15,000+ 张表，每月约 1000 人查询，最优秀工程师每周花 2 天回答同事的临时问题
- **核心架构**：Classifier + Data Agent + Code Search Agent + On-call Agent + Summarizer 的多 Agent 协作系统
- **读写分离**：Read-only 调查路径（4 个 Agent 并行协作）和 Write Enhancement 路径（单 Agent + 人工审核 gate）有根本不同的风险模型
- **四大生产挑战**：①上下文累积导致 token 爆炸 ②工具定义过于冗余 ③PII/危险操作安全风险 ④用户信任建立
- **核心洞察**：多 Agent 系统里，生产 Hardening 工作量远大于 Agent 开发本身；反馈回路的工程化是系统持续进化的关键

## 技术洞察
### 问题结构化：一致性比差异性更值钱
Grab ADW 团队的核心观察是：**问题的答案各不相同，但回答的过程高度一致**。工程师收到的问题每次不同（"为什么这个 ID 是乱码？"、"能给这个表加一列吗？"），但调查过程都是：搜索数据目录 → 追踪数据血缘 → 验证 SQL → 检查日志。这个一致性是自动化的前提信号——只要调查过程可重复，就能自动化。
这给我们的启发是：在评估一个工作是否适合 Agent 化时，重要的不是问题看起来多复杂，而是**解决过程的变异性有多高**。变异性低（即使问题本身复杂），Agent 化的成功概率高；变异性高（即使单个问题简单），Agent 化难度大。

### 大脑与手的分离
Grab 的设计哲学是"Decoupling the Brain from the Hands"：

- **Brain** = LLM，负责推理、决策、生成
- **Hands** = Specialized Agents 和 Tools，负责实际执行（查询、代码搜索、状态检查）
这个分离的价值是**可调试性（Debuggability）**。当系统输出错误答案时，团队可以定位：问题是推理层（Brain 给出了错误判断）还是执行层（特定 Tool 返回了错误信息）。这个定位能力在单一大模型系统里往往很难做到。

### 专业化 Agent vs 单体 Agent 的权衡
| 维度 | 单体 Agent | 专业化 Multi-Agent |
|------|-----------|-------------------|
| 部署复杂度 | 低（一个模型调用） | 高（多个 Agent 协调） |
| 可调试性 | 低（黑盒） | 高（每个 Agent 职责清晰） |
| 可维护性 | 高（改一处） | 低（改一处可能影响协调） |
| 推理延迟 | 低 | 高（串行执行） |
| 能力上限 | 受单模型能力限制 | 可叠加各 Agent 专长 |
Grab 明确选择了专业化路线：**当你要替代一个需要几小时的人工调查时，多花几分钟获取精确答案仍然massive improvement**。这个取舍逻辑值得借鉴——Agent 化系统的延迟代价只有在它相对于基线没有显著优势时才成问题。

### 技术栈选择
- **FastAPI**：接收传入请求，管理 HTTP 层
- **LangGraph**：管理多 Agent 协作的有状态逻辑（循环、条件分支、任务交接）
- **Redis**：缓存和实时 Session 管理
- **PostgreSQL**：对话历史和 Agent 元数据的持久化存储
- **Hubble**：集中式元数据和数据目录
- **Genchi**：数据质量可观测性平台（强制数据契约）
- **Lighthouse**：Pipeline 执行状态和健康追踪
注意 LangGraph 在这里的作用不是简单的工作流引擎，而是**状态机**——它处理真实的 Agent 循环、context switching 和任务交接，这些在 LangGraph 之前需要大量手写状态管理代码。

## 深度分析
### Agent 间 Context 管理的工程挑战
多 Agent 系统的 token 累积问题比单 Agent 更严重：每个 Agent 的输出都是下一个 Agent 输入的一部分，context 在 Agent 间传递时会膨胀。 Grab 的解法是**层级式 context 压缩**：

- **tiktoken 实时追踪**：每条消息都记录 token 计数，接近限制时自动摘要早期消息
- **Tool 输出剪枝**：在将结果传递给下一个 Agent 前，用小模型提取相关片段和描述，而非传递完整输出
- **Orchestrator 中介**：在每个 Agent 间加入清理和压缩逻辑
这里有一个重要的架构洞察：**上下文管理不是 LLM 的责任，是基础设施的责任**。如果把所有 context 管理工作交给 LLM 判断，LLM 会消耗额外的推理能力处理自己的 context，而且判断质量不稳定。让基础设施层处理 context 压缩，LLM 只处理它最擅长的事情（推理和生成），这是合理的分工。

### 工具设计的工程价值
大多数 Agent 系统的工具设计是事后的——先有工具，再给工具写描述。但 Grab 的经验表明：**工具设计是 Agent 系统性能的主要杠杆之一**。
初始设计有 30+ 工具，每个工具的描述都像通用 API 文档一样冗长。由于工具描述是 Agent prompt 的一部分，每个推理调用都要处理全部 30+ 工具的描述文本拖累了速度和输出质量。
改进方案：Aggressive Simplification——只包含决策所需的工具描述部分，截断冗余输出，让每个工具的定义简洁可操作。结果是系统响应性显著提升。
这个教训是：**工具数量和工具质量之间存在负相关**，特别是在 LLM 推理能力有限的情况下。一个设计良好的小工具集比一个臃肿的工具集更有价值。

### 安全四层防御的纵深设计
Grab 的多 Agent 系统接入数据库和代码生成能力，存在真实风险。他们的 4 层防御体系值得详细分析：
**Layer 1 - Input Classification**：Classifier Agent 在执行前检测 PII 请求和超出范围查询。这个 layer 解决"问的问题本身是否合法"——而不是"答案对不对"。
**Layer 2 - SQL Validation**：每个查询在被执行前检查：是否访问了 PII 列？是否包含危险操作（DELETE/DROP）？是否缺少分区过滤器（这会导致全表扫描）？Schema 合法性验证。这个 layer 解决"执行的查询是否危险"。
**Layer 3 - Timeout Protection**：所有数据库查询都有严格执行时间限制，防止失控操作。
**Layer 4 - Enhancement Controls**：Enhancement Agent 不能直接提交到主分支，所有变更需要人工审核，所有代码先在 staging 环境运行。这个 layer 解决"变更是否经过适当授权"。
四层防御的逻辑是**每层的盲点由其他层覆盖**。Input Classification 可能有漏网的 PII 请求，但 SQL Validation 会拦住访问 PII 列的操作。每个 layer 独立负责一个维度的安全，但共同构成纵深防御。

### 信任建立的动态调整
最初设计：所有 AI 生成的回答在工程师审核前不发布。这安全但慢——在高峰期问题堆积，无人审核。
改进后的设计：**立即发布答案，但标注为"未经审核"**。用户获得快速响应，同时知道答案的置信状态，可以选择性地进行人工复核。
这个设计演变的深层逻辑是：信任不是静态的，是**随着系统性能证据积累动态扩展的**。系统上线初期，信任资本有限，高的审核率是合理的；随着系统性能数据积累（rejection rate 低，user feedback 好），信任边界可以扩展，释放人工审核资源用于更高价值的 work。
这个模式对所有 AI Agent 系统有普遍参考价值：不要在系统上线初期就追求"无人化"，也不要永远停留在"全人工审核"阶段——建立性能指标驱动的动态审核策略。

## 实践启示
### 识别 Agent 化机会的第一步：画出调查路径
不是所有重复工作都适合 Agent 化。第一步是把工作过程的调查路径画出来（不需要写代码，用白板或文档）。如果路径是**高度一致的**（每次都是：搜索 → 追踪 → 验证 → 检查日志），即使问题本身看起来千变万化，Agent 化成功概率高。如果路径本身不确定（不同问题需要完全不同的调查方式），Agent 化复杂度会大幅上升。

### 从"帮手"到"主要工作者"的渐进策略
不要在初期就设定"AI Agent 替代人工"的目标，这会造成政治阻力。更好的叙事是：**让最好的工程师把时间从回答问题中解放出来，专注于只有人才能做的事**。这个叙事让干系人更容易接受系统上线初期需要人工复核的设计，因为最终目标不是"消灭人工"而是"人工用在更有价值的地方"。

### 生产 Hardening 的优先级排序
当一个 Agent 原型在 demo 效果很好时，下一步不是上线，而是问"上线后会出什么问题"。Grab 发现的 4 类问题（context 爆炸、工具冗余、安全风险、信任建立）是有普遍性的。
建议的上线前 Hardening 检查清单：
1. **Context 压力测试**：模拟长会话（20+ 轮次），观察 token 累积对输出质量的影响
2. **工具边界测试**：用边界条件调用（空输入、超大输入、恶意输入），观察 Agent 的错误处理
3. **安全边界测试**：尝试注入 PII 请求、危险 SQL、越权操作，验证每层防御是否有效
4. **信任校准测试**：让真实用户使用系统，收集第一批反馈，不急于扩大 AI 的自主范围

### 反馈回路的工程化
很多 AI Agent 系统在第一版上线后性能冻结——因为没有机制让系统从 production 使用中学习。Grab 的 annotation 系统值得学习：

- **随机抽样测试**：随机选择 annotation 作为离线测试用例，确保系统在真实 failure 上测试
- **模式分析**：问"Classifier 是否持续路由到错误的 Agent？"——这是系统性问题，不是单次失误
- **质量指标趋势**：跟踪 rejection rate 的时间序列——突然上升意味着某处发生了变化
- **定向改进**：基于分析结果，改进 Agent prompt、增强 Guardrail、为特定查询类型增加示例
这个反馈回路的设计关键：**annotation 不只是记录，而是驱动改进的输入**。如果 annotation 只存在于数据库里没有人分析，它的价值接近于零。

### 写操作 Agent 的人工 Gate 设计
对于改变 production 数据的 Agent 操作（Enhancement Pathway），Grab 的设计是**半自动化**：AI 生成变更，但每一步都需要人工审核和批准。这个设计值得推广。
关键原则：AI 生成的内容接触 production 的 gate 数量取决于内容的风险等级：

- 读操作（调查、查询）→ 轻量监督或无监督
- 写操作（数据变更、代码修改）→ 强制人工审核
- 高风险写操作（删除数据、修改 schema）→ 强制多人审核 + staging 验证
这个分层授权机制可以在任何企业 Agent 系统中复用。
## 相关实体
- [Baixing Ontoz Enterprise Ontology Multi Agent](/ch04-131-百型智能-ontoz-企业本体论-群智能体协同体系-出海企业数字大脑-palantir-中国类比/)
- [Dipg Ant Insurance Host Research Verify Offline Closed Loop](/ch05-075-dipg-蚂蚁保-host-research-verify-三-agent-离线-verify-闭环-c-端-aigc/)
- [Building Ai Agents For Business Support Using Amazon Bedrock](/ch04-064-building-ai-agents-for-business-support-using-amazon-bedrock/)
- [Vercel Com How Superset Built The Ide For Ai Agents On Vercel](/ch01-058-how-superset-built-the-ide-for-ai-agents-on-vercel/)
- [Low Code Api Integration](/ch03-070-how-to-build-low-code-api-integrations-for-enterprise-apps-u/)
- MOC

→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/how-grab-is-using-ai-agents-to-boost-team-productivity.md)

## 相关实体

---

## Ch08.011 Factory Missions

> 📊 Level ⭐⭐⭐ | 13.4KB | `entities/factory-missions-multi-agent-shipping.md`

## 核心架构
**三角色**：Orchestrator（规划/拆解/调度）+ Worker（单个 feature 实现）+ Validator（Scrutiny + User-Testing 两类）。
**关键约束**：

- Orchestrator **不参与实现细节调查**，避免累积过细上下文
- Worker 用 **fresh context** 先写测试再实现，不做"完成"判断
- Validator **不看实现代码也不看 worker trajectory**，只读 validation contract 和 git 成品

## 五大可抄设计原则
1. **角色责任明文化**：先写"不许做什么"
2. **Validation contract 前置**：在写代码之前产出行为断言列表，生成 agent 和评估 agent 必须不同
3. **结构化 handoff 取代记忆**：5 字段（completed/not_completed/commands_executed/issues_found/procedure_compliance）
4. **写串行、读并行**：文件写入/commit/validator 评估严格串行；检索/调研可以并行
5. **验证用不同模型**：GPT-5.3-Codex 检查 Sonnet 写的代码是结构性对抗设计

## 多 Agent 通信 5 模式
| 模式 | Missions 用了吗 |
|------|--------------|
| Delegation | ✅ |
| Creator-Verifier | ✅ |
| Broadcast | ✅ |
| Negotiation | ✅ |
| Direct Communication | ❌ 故意不用（避免 state fragmentation） |

## Validation Contract
在任何代码出现之前 orchestrator 产出行为断言列表。每条包含：行为描述 + 验证工具 + 证据要求。
**效果**：21 个 fix features 占 61 个实现 features 的 34.4%，一轮验证从未通过——说明 validator 在做该做的事。

## Token 效率
Slack 克隆 mission：778.5M tokens，**96% cache 命中**（744.9M 是 cache read）。关键：共享状态文件在 mission 期间几乎只读，prefix cache 最大化复用。

## 竞品对比
| 系统 | State 位置 | 验证方式 |
|------|-----------|---------|
| Mission Control | git + 共享 markdown | Validation contract |
| Agent Teams | 每个 teammate 对话窗口 | lead/peer 互检 |
| Experts Mode | Team Lead plan | QA/Review 专家并行触发 |

## Bitter Lesson 反驳
为什么不会被下一代模型 obsolete：
1. orchestration 是 prompt，不是状态机——模型变好 = 规划变好
2. separation of concerns 让 model specialization 收益随模型分化而增加
3. validation contract 为人类需求建模，不为某模型建模——契约本身稳定
**"锁死在单一模型家族的系统永远被这家最弱的能力约束。"**

## 来源
- Luke Alvoeiro @ AI Engineer Europe（YouTube, 2026-05-06）
- How Missions Work — Theo Luan, Factory（2026-04-10）：https://factory.ai/news/missions-architecture
- Introducing Missions（2025-02-26，2026 数据更新版）：https://factory.ai/news/missions

## 深度分析
### 为什么 Validation Contract 是核心
传统的 agent 系统中，验证往往后置——代码写完后跑测试，测试驱动开发（TDD）在人类工程师中是好的实践，但在 agent 系统中容易被绕过。Factory 的关键洞察是：**"Tests written after implementation don't catch bugs. They confirm decisions."**
Validation contract 的设计把"正确性定义"从实现过程中剥离出来，强制在写第一行代码之前完成。这不只是流程约束，而是认知约束——它切断了实现细节回流到验收标准的路径。在 agent 系统中，这意味着 validator 的判断不会被实现者之前的推理路径所污染。

### Self-Evaluation Bias 的系统性影响
Agent 的 trajectory 是 append-only 的。模型会从自己之前的推理里寻求连贯性，而不是质疑它。一个写完代码的 agent 评估自己写的代码，几乎一定会偏向"合理化"而非"找问题"。
这个 bias 不是通过"提高模型能力"能解决的——它需要结构性对抗：让不同的 agent、用不同的模型、在不同的上下文中做验证。Factory 的设计是把 Scrutiny Validator 和 User-Testing Validator 都放在这个位置上，而验证者看的不是实现过程，是 git 成品和 validation contract。

### Token 效率的本质：共享状态即 Cache
96% 的 cache 命中率不是优化技巧的结果，而是架构设计的自然产物。当所有 agent 读写同一组共享状态文件（validation-contract.md、features.json、services.yaml、AGENTS.md），这些文件的内容在 mission 期间几乎只读，prefix cache 自动最大化复用。
这揭示了一个朴素的原则：**如果要高效复用 cache，文件结构的稳定性比文件内容的变化更重要**。与其优化单个文件的 token 密度，不如确保共享状态文件在整个 mission 生命周期内保持稳定。

### 串行写的数学必然性
Factory 给了明确的数学：如果每个 agent run 错误率 0.1%，100 步累计成功率 90%；如果并行让每步错误率涨到 1%，100 步累计成功率暴跌到 36%。长周期任务的正确性是复利。
这个数字解释了为什么 Factory 坚持"写串行"——不是不要并行，而是**写操作不允许并行**。并行读可以提速，写操作并行会导致互相覆盖、重复劳动、架构决策不一致。协调成本会吃掉并行带来的速度收益。

### 模型分化时代的编排哲学
"锁死在单一模型家族的系统永远被这家最弱的能力约束"——这句话指向了 Factory 的核心设计意图：用 model-agnostic 的方式，让不同角色使用不同提供商的模型。GPT-5.3-Codex 验证 Sonnet 写的代码，是结构性对抗设计，不是 marketing。
随着模型能力持续分化，Claude、GPT、Gemini、DeepSeek 各自在某些维度上有比较优势。"把最对的模型放到最对的角色"这个收益，会随模型分化程度增加而增加，而不是减少。

## 相关实体
- [Factory Missions Architecture](/ch04-151-factory-missions-多智能体工程纪律/)
- [Rag技术框架的演进方向](/ch01-193-rag技术框架的演进方向/)
- [构建基于多智能体架构的深度思考交易系统](/ch04-205-构建基于多智能体架构的深度思考交易系统/)
- [Wow Harness V3 Governance Protocol](/ch05-028-wow-harness-v3-ai-开发的治理协议/)
- [Hermes Agent 12 Layer Full Configuration Guide](/ch07-007-hermes-agent-满配-12-层配置完整指南-从裸装到-24h-agent-团队/)

→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/amazon-cloudfront-deploy-guide-cloudfront-domain-multi-tenant-architecture.md)

- MOC
## 实践启示
1. **在写代码之前先写验收标准**：Validation contract 应该描述行为，而不是实现细节。每条 assertion 包含：行为描述 + 验证工具 + 证据要求。生成 contract 的 agent 和评估 contract 的 agent 必须不同。
2. **用结构化 handoff 取代对话记忆**：Worker 完成后填 5 字段（completed/not_completed/commands_executed/issues_found/procedure_compliance），下一个 worker 读这份文档而不是上一个的对话历史。共享状态文件在 mission 期间保持只读稳定。
3. **写串行，读并行**：文件写入、commit、validator 评估必须严格串行；codebase 检索、文档调研可以并行。不要让并行写入同一个 codebase。
4. **验证用不同模型**：哪怕只是换另一家提供商的中等规模模型，也能避开同家族训练数据 bias。刻意让验证和实现走不同提供商的模型。
5. **最小操作单元是计划级再分配**：Mission Control 里，用户是 50 个 droid 的项目经理，不是工程师。介入话术是"Drop X feature and add Y instead"，而不是"在函数 Z 里改一行代码"。
6. **编排逻辑写成 prompt，不要写成状态机**：700 行文本中，4 句话的修改就能让执行策略发生戏剧性变化。新模型出来时只需改几句 prompt，不需要重写状态机。
7. **用 five-field handoff 约束 worker 行为**：Worker 不被允许做"这功能完成了"的判断——这是 validator 的事。Handoff 文档的结构本身就在强化这个约束。
→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/factory-missions-multi-agent-shipping-for-days-luke.md)

---

## Ch08.012 Sub-Agent vs Agent Team 选型与编排原语

> 📊 Level ⭐⭐⭐ | 12.3KB | `entities/sub-agent-vs-agent-team-selection.md`

## 概述
Sub-Agent vs Agent Team 选型指南——核心判断准则：**按上下文边界设计，而不是按角色设计**。五种编排原语（Prompt Chaining / Routing / Parallelization / Orchestrator-Worker / Evaluator-Optimizer）。

## 核心判断准则
> 多智能体架构里，最先该判断的不是"要拆几个"，而是这些子任务之间是否共享同一段上下文。能干净切开的用 Sub-Agent，必须共享状态的才上 Agent Team。
**Design around context boundaries, not roles.**
工程三问：
1. 这两件事，需不需要看到对方的中间过程？
2. 这两件事，会不会因为对方做完了某一步就影响自己下一步？
3. 交给同一个 Agent 一次性干，会不会更省心？
如果答案偏向"是"，就别拆。

## Sub-Agent vs Agent Team
| 维度 | Sub-Agent | Agent Team | 
|------|-----------|------------| 
| 上下文 | 独立上下文 | 共享上下文 | 
| 通信 | 必须经过父 Agent | Agent 之间直接对话 | 
| 新 Agent | 不能再生新 Agent | 可以互相拉起 | 
| 适用场景 | 隔离 + 压缩 + 并行 | 持续协作 + 共享状态 + 互相调头 | 
**Sub-Agent 硬约束：**

- 子 Agent 之间不能直接通信
- 子 Agent 不能再生新 Agent
- 所有流量必须经过父 Agent
- 只返回最终输出，不带中间思考
**Sub-Agent 三个价值：隔离 / 压缩 / 并行**
**Agent Team 适合：** 做着做着会发现问题然后需要互相调头的任务（如软件项目：前端改接口后端要立刻知道）。成本远高于 Sub-Agent，需要共享状态层 + 通信协议 + Lead Agent 仲裁。
**口诀：任务不互相依赖，就别上 team；任务必须互相依赖，就别用 sub。** 

## 最大坑：按岗位拆而不是按上下文边界拆
常见错误：Planner → Developer → Tester → Reviewer，按人类公司分工切。
每次交接信息都在变薄：

- Planner 知道"代码刚被重构过某个奇怪判断是有原因的"——没传到 Developer
- Developer 做了临时取舍（"这次先不改 token 校验顺序因为影响下游 SSO"）——也没沉淀
LLM 没有上下班、没有茶水间记忆，靠上下文吃饭。能拿到什么上下文，就只能基于什么上下文做事。

## 五种编排原语
| 原语 | 说明 | 典型场景 | 
|------|------|---------| 
| **Prompt Chaining** | A 做完给 B，B 做完给 C | 先抽取 → 再翻译 → 再润色 | 
| **Routing** | 根据任务特征派给最合适的 Agent | 客服"识别意图再分流" | 
| **Parallelization** | 互不依赖任务并行跑再汇总 | 代码审查多维度分析 | 
| **Orchestrator–Worker** | orchestrator 拆/派/收，workers 各自干 | Sub-Agent 标准形态 | 
| **Evaluator–Optimizer** | 先生成，再评估，再迭代 | 报告生成、代码补全自检 | 
> 多 Agent 不是产品形态，是一组可组合的工作流原语。

## Sub-Agent description 是路由信号
```python 
"security-reviewer": AgentDefinition( 
    description="Find vulnerabilities and security risks",  # ← 这是路由信号 
    prompt="You are a security expert.", 
    ... 
) 
``` 
description 不是注释，是路由信号。写得含糊，路由就含糊；边界清楚，分发也清楚。

## 判断框架
| 你在问的问题 | 该考虑的方向 | 
|-------------|-------------| 
| 能不能一个 Agent 干完？ | 能就先这样，别提前优化 | 
| 子任务需不需要看到彼此中间过程？ | 不需要 → Sub-Agent；需要 → Agent Team | 
| 子任务跑的时候要不要互相影响？ | 不要 → 并行 Sub-Agent；要 → Team | 
| 是不是只想"看起来更高级"？ | 是 → 退回单 Agent，先把任务模型搞清楚 | 
| 每步要不要严格按业务规则走？ | 要 → 加确定性中间层，不要硬塞给 team | 

## 隐藏成本
多 Agent 带来：编排逻辑维护成本 / Agent 间契约版本化 / 调试链路变长 / 上下文一致流转（信息差导致动作错）/ 治理成本翻倍。
**当任务高度依赖，协调成本远大于收益，或上下文压根没法切干净时，单 Agent 反而最稳。**

## 深度分析
1. **Sub-Agent 本质是"上下文压缩隔离"而非任务分解**
   许多资料将 Sub-Agent 描述为"把大任务拆小"，但更深层的逻辑是：**通过隔离上下文来压缩信息流复杂度**。每个 Sub-Agent 只看到自己需要的那段上下文，不是任务变小了，而是信息量被合理切分了。这一洞察解释了为什么强行让 Sub-Agent 之间互相传递中间结果会迅速失控——那等于在破坏隔离机制本身。
2. **Agent Team 的协调成本被严重低估**
   现有讨论集中在"共享状态层、仲裁机制"等技术成本，但更大的隐性成本是**契约稳定性**：当一个 Agent 的输出格式发生变化时，所有依赖它的其他 Agent 都需要同步调整，这形成了一种全链接的脆弱性。传统的微服务好歹有 API 版本管理，而 Agent Team 里的隐式契约完全靠"默契"维持。
3. **"按岗位拆"错误的认知根源是拟人化**
   Planner → Developer → Tester 的拆法本质上是在用人类组织的隐喻设计系统。但 LLM 没有固定的"下班时间"，它的上下文窗口就是它的工作记忆——强行模拟人类的岗位边界，只会制造不必要的上下文断裂点，而不是真正的职责分离。
4. **Routing description 的模糊性是架构设计问题而非命名问题**
   当 description 写得含糊时，根源往往不是措辞不够精准，而是**对任务边界本身就没有想清楚**。一个边界清晰的 Agent definition，其 description 自然精准；description 模糊是症状，任务边界不清晰才是病因。这个视角将代码层面的优化建议提升为了架构设计方法论。
5. **编排原语的选择应该先于 Agent 类型选择**
   现有资料通常先讨论"用 Sub-Agent 还是 Agent Team"，然后再带出编排原语。但实际上应该倒过来：**先确定用哪种编排原语（chain/route/parallel/orchestrator/evaluator）——这决定了信息流拓扑，然后才知道该选哪种 Agent 类型**。这是因为某些编排原语天然适配特定的 Agent 模式，比如 Orchestrator-Worker 基本就是 Sub-Agent 的标准形态，而 Evaluator-Optimizer 几乎必然需要 Agent Team 才能运作。

## 实践启示
1. **在写 Agent definition 前先画信息流拓扑图**
   不要直接开始定义"security-reviewer"、"performance-optimizer"这些角色，而是先用箭头画出：信息从哪里进入，经过哪些转换节点，每个节点输出什么格式。只有在拓扑图上验证了信息流没有交叉或断裂之后，再把节点翻译成 Agent definition。这样可以提前发现"按岗位拆"的错误设计。
2. **Sub-Agent 的 description 应由输出反推而非由角色正向定义**
   常规思路是"这个 Agent 是什么角色 → 写对应的 description"，正确思路是"这个 Agent 需要让父 Agent 做出什么路由决策 → 反推 description 应该精确传达什么信号"。例如，"Find vulnerabilities"比"Security expert"更好，因为后者暗示的是角色标签，而前者明确表达了任务边界和输出预期。
3. **为 Sub-Agent 设置明确的"拒绝继续"条件**
   由于 Sub-Agent 不能直接通信，当它发现自己无法独立完成任务时，需要有明确的机制将控制权返还父 Agent。建议在 Agent definition 的 prompt 中显式声明：如果任务超出当前 Agent 能力边界或检测到需要其他 Agent 介入的情况，返回特定格式的"ESCALATE"信号而非尝试自行解决。这比依赖隐式的上下文判断更可靠。
4. **评估是否需要 Agent Team 时，先做"协调成本实验"**
   在正式引入 Agent Team 之前，先用以下实验估算协调成本：让两个独立 Sub-Agent 在完全隔离的情况下分别完成同一个任务的两个子环节，然后人工检查接口适配成本。如果发现人工适配成本已经很高，那么 Agent Team 的协调成本只会更高。这个实验成本极低，但能有效避免过度设计。
5. **编排原语选型后，用日志追踪验证信息流是否符合预期**
   多 Agent 系统的一个常见故障模式是：设计时选了 Parallelization（并行），但运行日志显示实际上是 Chaining（串行）——子任务在等待父 Agent 分发时引入了隐式的顺序依赖。通过在每个 Agent 的输入输出加上可读的流转标记（任务 ID、来源 Agent、目标 Agent、时间戳），可以低成本验证实际信息流是否匹配设计意图，而不是等线上出了问题再调试。

## 相关
- [Agent/Skills/Teams 架构演进与选型](/ch04-219-agent-skills-teams-架构演进过程及技术选型之道/)（阿里云飞樰，更全面的演进视角）
- [Harness Engineering 系统梳理](/ch05-049-harness-engineering-系统梳理/)
- [AutoResearch 多 Agent 开发](/ch09-030-autoresearch-多-agent-自动化软件开发/)

## 相关实体
>- [Sub-Agent vs Agent Team 选型指南](/ch04-102-sub-agent-vs-agent-team-selection-guide/) — 五种编排原语 + 硬约束 + 判断准则（中文原文）
>- [Hermes Agent vs OpenClaw 对比分析](/ch04-188-hermes-agent-为什么火了-和-openclaw-龙虾比一比/)
>- [CLI、MCP、API 选型：Agent 接入层决策指南](/ch07-053-cli系列④-选型cli-mcp还是api/)

- OpenClaw 多智能体团队搭建实战经验
- [龙虾装上了可以用来干啥 - OpenCLAW 多智能体团队搭建经验](/ch04-038-openclaw-multi-agent-team-practice-v2/)
- MiniMax Agent Team: Mavis (Owner-Worker-Verifier)
- MOC

---

## Ch08.013 Scalable voice agent design with Amazon Nova Sonic: multi-agent, tools, and session segmentation

> 📊 Level ⭐⭐⭐ | 12.0KB | `entities/scalable-voice-agent-design-with-amazon-nova-sonic-multi-agent-tools-and-session.md`

> 来源：[原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/scalable-voice-agent-design-with-amazon-nova-sonic-multi-agent-tools-and-session.md)

## 核心要点
- AWS Nova Sonic 支持多智能体架构、工具调用和会话分段
- 三种架构模式：单智能体（工具直接调用）、路由多智能体（sub-agent as tool）、会话分段（session segmentation）
- 与 DynamoDB、Kendra 等 AWS 服务深度集成
- 基于 Amazon Bedrock AgentCore Runtime 和 Strands BidiAgent 框架
- MCP 协议用于工具调用，A2A 协议用于 agent-to-agent 通信
→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/scalable-voice-agent-design-with-amazon-nova-sonic-multi-agent-tools-and-session.md)

## 相关实体
- [构建基于多智能体架构的深度思考交易系统](/ch04-205-构建基于多智能体架构的深度思考交易系统/)
- [上下文隔离](/ch01-892-上下文隔离/)
- [Agentium — 从零实现 Agent 系统的开源框架](/ch01-870-agentium-从零实现-agent-系统的开源框架/)
- [Owner-Worker-Verifier 架构](/ch01-889-owner-worker-verifier-架构/)
- [基于多智能体架构的深度思考交易系统](/ch04-205-构建基于多智能体架构的深度思考交易系统/)
- [Agent 原理、架构与工程实践](/ch04-435-agent-engineering-principles-architecture-practice/)

- livekit agents：给大模型接上麦克风，没你想的那么简单

## 深度分析
### 三种集成模式的架构哲学
文章提出了三种递进的集成模式，每种模式对应不同的延迟-复杂度权衡：
**Pattern 1: AgentCore Gateway — 工具直接调用（最低延迟）**
Nova Sonic 通过 AgentCore Gateway 直接调用 MCP 服务器上的工具，无需中间推理层。语音模型理解意图 → 选择工具 → 传递参数 → 获得结果 → 语音回复，全流程在语音模型端完成。
这个模式的局限在于：复杂工作流（多步验证、条件逻辑、链式调用）的推理负担完全落在语音模型的 system prompt 上。当工具数量增加时，工具选择本身成为性能瓶颈。
**Pattern 2: Sub-Agent（Agent-as-Tool）— 解耦推理**
语音 orchestrator 将完整任务委托给子智能体，每个子智能体有自己的模型、system prompt、工具和推理能力。Strands 支持两种连接方式：

- **Local agent-as-tool**：子智能体在进程内运行，无网络延迟，但与 orchestrator 共用进程和扩展资源
- **Remote agent via A2A**：子智能体部署在 AgentCore Runtime 上独立运行，通过 A2A 协议通信。A2A 是连接不同框架（Strands、OpenAI、LangGraph、Google ADK）构建的智能体的开放协议
关键延迟权衡： 子智能体调用会增加延迟（子智能体自身推理 + 工具调用），对于语音对话场景意味着「更长的沉默」。AWS 建议子智能体使用 Amazon Nova 2 Lite 等小型高效模型来控制延迟。
**Pattern 3: Session Segmentation — 超低延迟**
这是针对语音场景专门设计的模式，不是 MCP 或 A2A 的直接映射。在同一 WebSocket 连接内，当对话从一个阶段转换到另一个阶段（如认证 → 账户查询 → 抵押贷款询问）时，关闭当前 Nova Sonic 会话并打开新的会话（新的 system prompt、新的工具集）。
每个阶段获得：

- 更短、更具体的 system prompt（减少推理开销）
- 只加载当前阶段需要的工具（而非一个巨大的工具集）
- 可选的子智能体（复杂阶段可用 Pattern 2，简单阶段保持工具调用）

### 延迟优化的工程实践
文章系统地总结了语音智能体的延迟优化技术：
**1. 子智能体使用小模型**：orchestrator 用 Nova Sonic，对话质量由其保证；子智能体不需要大语言模型，用 Nova 2 Lite/Micro 即可。默认小模型，有必要时升级特定子智能体。
**2. 状态化子智能体 + 缓存**：无状态的子智能体每次调用都访问数据库或 API，引入额外延迟。设计子智能体在会话内缓存数据源结果，后续问题从内存读取而非重复调用后端。
**3. 认证后预取数据**：尤其适用于客服中心场景。用户认证后，主动在后台拉取账户余额、近期交易、待处理警示、抵押贷款状态。当用户询问时，答案已在内存中。
**4. 并行化独立工具调用**：用户请求「给我所有账户概览」时，不要顺序调用「活期 → 储蓄 → 信用卡」，用并发执行一次完成三个调用。Strands 原生支持独立工具调用的并行化。
**5. 填充短语掩盖延迟**：当工具调用不可避免时，通过 system prompt 指示语音模型说填充短语（"Let me check that for you…"）而非沉默等待。

### MCP vs A2A：两个协议的角色分工
文章澄清了两个协议的定位：

- **MCP（Model Context Protocol）**：连接 agent 到工具的协议。AgentCore Gateway 托管 MCP 服务器作为托管端点，语音模型通过 Gateway ARNs 访问工具。
- **A2A（Agent-to-Agent）**：连接 agent 到其他 agent 的协议。在 AgentCore Runtime 上，不同框架构建的智能体可以共享上下文和推理，使用共同格式通信。
两者是正交的关系：MCP 解决「agent 如何调用外部功能」，A2A 解决「agent 如何与其他 agent 协作」。

## 实践启示
### 对语音 AI 产品经理
1. **选择正确的集成模式**：

   - 简单工具调用（查余额、查天气）：Pattern 1，延迟最低
   - 复杂多步推理（贷款申请、故障排查）：Pattern 2，子智能体承担推理
   - 多阶段对话（客服IVR流程）：Pattern 3，阶段隔离减少认知负担
2. **延迟预算是核心指标**：语音对话的用户体验容忍度远低于文本。对每个查询，明确「用户期望的响应时间」，并用延迟预算反推架构选择。
3. **系统 prompt 的分阶段设计**：即使不使用 Pattern 3，主动将系统 prompt 按对话阶段组织也能提升效果。将认证逻辑、账户查询、投诉处理分为独立的 prompt 分支，减少模型每次需要「忽略无关上下文」的计算。

### 对架构师和工程师
1. **A2A 协议的长期价值**：如果你的组织已有不同框架构建的智能体（LangGraph、AutoGen、自研），A2A 提供了跨框架协作的可能性。评估 AgentCore Runtime 上的 A2A 支持是未来智能体集成的关键投资。
2. **MCP 工具托管的安全边界**：AgentCore Gateway 是 AWS 托管的 MCP 服务器。需要评估业务工具通过 Gateway 暴露的安全边界——哪些工具可以在 Gateway 上注册，哪些必须保持独立服务。
3. **会话分段的上下文传递**：Pattern 3 的会话切换需要显式传递上下文（chat history）。设计阶段间的「交接协议」——认证阶段的结果（用户身份、权限级别）如何传递到下一阶段的 session。
4. **Nova Sonic 异步工具调用**：Amazon Nova 2 Sonic 支持异步工具调用， 对话可以在工具运行时继续，接受输入、多工具并行、在用户中途改变请求时优雅调整。这是减少感知延迟的关键特性。

### 对 DevOps 和 SRE
1. **WebSocket 连接管理**：语音智能体依赖 WebSocket 维持实时双向流。设计连接管理策略：断线重连、超时处理、并发连接数限制。AgentCore Runtime 提供 microVM 级会话隔离，避免「 noisy neighbor」问题。
2. **延迟监控指标**：除标准 LLM 指标外，语音智能体需要追踪：

   - Time-to-first-audio（用户说话到听到响应的延迟）
   - 工具调用成功率
   - 阶段切换频率和切换延迟
3. **容量规划**：语音智能体的扩展不是简单的实例数横向扩展。需要考虑并发 WebSocket 连接数、Bedrock AgentCore 的容器调度、以及下游工具服务的吞吐能力。

### 对创业者和 ISV
1. **现有智能体的复用是核心资产**：文章在结论中强调「The sub-agents you've already built are your biggest asset. Reuse them.」 如果你已有文本聊天机器人的工具/子智能体，它们可以低成本迁移到语音场景。
2. **Strands BidiAgent 的框架价值**：Strands 提供了连接 Nova Sonic 和应用的双向流生命周期管理。对于不想深入 WebSocket 细节的团队，这是快速起步的集成路径。
3. **垂直场景的专注**：文章的场景示例（银行、抵押贷款）都是高价值、复杂对话的垂直领域。语音智能体在这些场景的价值高于简单查询。评估创业方向时，优先考虑「对话复杂度高、人工成本高」的领域。

---

## Ch08.014 扣子 3.0 协作系统：项目化 + Agent 编排 + 工具链打通

> 📊 Level ⭐⭐⭐ | 11.8KB | `entities/coze-3-0-collaboration-system.md`

# 扣子 3.0 协作系统：项目化 + Agent 编排 + 工具链打通
> "AI Agent 的下一步，不只是更强的模型，而是**更像真实团队的工作系统**。" —— 量子位（编辑：金磊）报道

**扣子 3.0 = 把 AI 对话升级为"项目化 + Agent 协作 + 工具链打通"的协作系统**。用户在一个项目里 @ 多个 Agent，每个 Agent 负责一个角色，围绕同一目标持续推进。

> 核心转变：**从"随问随答的聪明人"到"能开工的小团队"**。

→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/coze-3-release-official-quantum-bit.md)

## 三大核心升级（3 层抽象）
| 层 | 升级 | 关键能力 |
|---|---|---|
| **L1 项目化** | 任务从对话 → 项目 | 资料/角色/任务/产物放进同一空间，围绕同一目标持续推进 |
| **L2 Agent 编排** | 多人多 Agent 协作 | 选题 Agent 判断 / 资料 Agent 补背景 / 产品 Agent 拆结构 / 代码 Agent 实现 / 本地 Claude Code 工程检查 |
| **L3 工具链打通** | Agent 不只在对话框 | 编程项目 + 视频项目 + 本地 Agent 接入 + 行业技能包 + 多端同步 + 桌面端本地文件处理 |

> 关键表达："**@ 一下全员就位**" —— 用户需要的是**一组可以被调度的 AI 伙伴**。

## 4 组实测亮点

### 4 Agent 协作 = AI 热点追踪仪表盘
- 角色：小曜（自带）+ 选题写作 + 产品设计 + 前端开发
- 流程：判断新闻 → 补背景查事实找角度 → 拆页面模块 → 写代码
- 价值：把"大而全的回答"拆成"不同角色的连续劳动"

### 本地 Agent 接入 = 工程化项目
- **导入 Claude Code / Codex CLI / OpenClaw** 到项目
- 范式：从"自己组 AI 团队"到"把你原来用顺手的 AI 工具也拉进团队"

### AI 编辑部桌宠
- 4 种状态：待机眨眼/思考加载/提醒气泡/夸夸鼓励
- 验证：从模糊创意 → 清晰产品结构 → 玩+用结合 → 可运行代码 → 后续扩展

### 选题 → 文章 → 视频 一气呵成
- 默认视频生成模型：**Seedance 2.0**
- **角色/道具/文档/资产沉淀在项目里** → 后续不必每次重新定义

## 行业技能包（不是简单加 prompt）
> "把行业数据库、专业方法和高频工作流封装成**可调用能力**。"

| 场景 | 能力 |
|---|---|
| 金融 | A 股/基金实时数据引擎 + 专业分析 |
| 法律 | 法律法规检索 + 合同审阅 + 诉讼策略材料整理 |
| 医疗健康 | 体检报告识别 + 关键信息结构化提取 + 健康档案整理 |
| 自媒体 | 爆款笔记洞察 + 标题生成 |
| 科研 | 论文检索 + 文献引用溯源 |

> 对新人：降低从零摸索门槛
> 对专业人士：接住检索/整理/初稿/结构化分析，**把人的时间留给真正需要判断和经验的部分**

## 多端覆盖
- iOS / Android / macOS / Windows / Web（coze.cn）
- **手机远程遥控电脑完成工作**（手机可调用电脑桌面文件）
- 任务不再被某一台电脑绑住 = Agent 从工具走向协作对象

## 范式判断
> 过去一年 AI 产品的竞争很容易被简化成**模型能力竞争**：
> 谁更聪明，谁推理更强，谁写代码更好，谁上下文更长。
>
> 但到了 Agent 产品阶段，另一个问题开始变得更关键：
> **一个 AI 再聪明，能不能和其他 AI、工具、人类一起工作？**

扣子 3.0 答案：**协作系统**。
- 开发者：本地 Agent + 编程项目并行
- 创作者：脚本/分镜/视频/音乐/续集一项目
- 复杂业务：行业技能包
- 新手用户：不懂 API/MCP 也能从项目开始

## 真正的 Agent 产品 6 维
> "**真正好用的 Agent，不应该只比单点能力，而要看它能不能进入真实工作流。**"

1. 能不能把任务拆开
2. 能不能接住上下文
3. 能不能调用工具
4. 能不能沉淀资产
5. 能不能跨端延续
6. 能不能让用户少切窗口、少搬材料、少重复解释

## 与已入库 Coze 3.0 报道对照
| 实体 | 来源 | 角度 |
|---|---|---|
| [扣子 3.0 多 Agent 协同实战](/ch04-110-扣子-3-0-多-agent-协同实战-指挥所有-agent-的-agent-5-人团队-6-步流水线/) | 网黑哥 2026-06-02 | 实战（开发小队 3 Agent / 品牌 4 风格 / 公众号 5 人 6 步） |
| [扣子 3.0 本地 Agent 项目编排](/ch04-341-coze-3-0-本地-agent-项目编排/) | 技术角度 | coze-bridge / Claude Code / Codex CLI 接入 |
| **本文** | 量子位 2026-06-04 | 官方升级新闻 + 3 层抽象 + 行业技能包 |

## 关键启示（对 Agent 团队）
1. **项目化是 2026 Agent 产品的标准抽象** —— 对话框 = 临时；项目 = 持久
2. **角色化 Agent 编排 > 单体 LLM** —— 把"大而全"拆成"角色分工"
3. **本地工具接入是护城河** —— 把用户已顺手的工具拉进团队 = 黏性
4. **行业技能包是商业化路径** —— 不只调教 Agent，而是预装专家经验
5. **跨端是产品从工具到协作对象的关键** —— 任务不被某台电脑绑住
6. **资产沉淀在项目里** —— 角色/道具/文档/中间产物都进项目空间
7. **"@ 一下全员开工"是 Agent UI 的新范式** —— 用户与一组 AI 伙伴的协作界面

## 相关对照
- [Agent Skills vs Coze/Dify/n8n](/ch04-282-agent-skills-vs-workflow低代码平台-选型分析/)
- [字节 Trae Harness 指南](/ch01-520-来自字节跳动trae的harness-engineering指南/)
- [Meta Skill](/ch07-022-meta-skill/) —— "Skill 的 Skill"（OpenSquilla 抽象层）
- [SkillOpt](/ch05-048-skillopt/) —— 训练 Skill 文档（与 Coze 3.0 的 Skill 包机制不同）

## 深度分析

### 洞察 1：协作系统是 Agent 产品竞争的第二条曲线
量子位报道指出，2025 年 AI 产品竞争的核心是模型能力——谁推理更强、上下文更长、代码更好。但到了 Agent 产品阶段，真正的分水岭变成了**"一个 AI 能不能和其他 AI、工具、人类一起工作"** 。这意味着产品竞争从单点能力转向系统整合能力，协作系统成为新的差异化方向。

### 洞察 2：@ 机制是 AI 用户界面的元问题解决方案
"@ 一下全员就位"不只是快捷指令，而是一种**自然语言调度协议**的雏形。用户不再需要记住每个 Agent 的名字或调用方式，只需 @ 全体就能触发一组角色分工明确的 AI 伙伴 。这解决了 AI 产品普遍存在的"用完即走"问题，让任务能够在多个 Agent 之间持续推进。

### 洞察 3：项目化本质上是上下文持久化
项目空间将资料、角色、任务、产物全部沉淀在同一空间，使 Agent 的上下文不会因会话结束而丢失 。这对传统对话式 AI 是根本性颠覆——对话是临时的，项目是持久的。这意味着 AI 产品的状态管理边界从单次请求扩展到了整个项目生命周期。

### 洞察 4：本地 Agent 接入重新定义"工程化项目"的边界
导入 Claude Code / Codex CLI / OpenClaw 到项目，意味着 Coze 3.0 不再是一个封闭系统，而是一个**可以整合用户既有工具链的协作平台** 。范式从"自己组 AI 团队"变为"把你原来用顺手的 AI 工具也拉进团队"，这是从头造轮子到生态集成的转变，对于有工程化需求的用户具有强吸引力。

### 洞察 5：行业技能包是 Agent 商业化的可复制路径
金融/法律/医疗等行业的技能包不是简单加 system prompt，而是把**行业数据库、专业方法论和高频工作流封装成可调用能力** 。这种预装专家经验的模式比通用 Agent 更容易实现商业化——对新手降低门槛，对专业人士接管检索/整理/初稿等重复性工作，把人的时间留给真正需要判断的部分。

## 实践启示

### 1. 用项目作为 AI 工作的基本单元
不论是内容创作还是开发任务，都应该从"项目"而非"对话"开始。创建项目时明确角色分工（选题/资料/产品/前端），让资产自然沉淀在项目空间内。这样可以在后续会话中直接复用上下文，避免每次重新定义角色和上传材料。

### 2. 设计角色化 Agent 编排而非单体 LLM 调用
在设计工作流时，优先考虑多角色分工而非让单一 Agent 完成全流程。例如 AI 热点追踪场景中，选题 Agent 负责判断新闻价值，资料 Agent 负责查事实，产品 Agent 负责拆结构，代码 Agent 负责实现。这种分工不仅提升了任务质量，也让每个 Agent 的能力边界更清晰。

### 3. 将本地工具接入作为产品护城河
如果你的 Agent 产品支持本地工具接入（如 Claude Code），应该学习 Coze 3.0 的思路：不是替代用户顺手的工具，而是**把它们整合进协作系统**。这比让用户迁移到新工具链的摩擦小得多，也更容易建立用户黏性。

### 4. 在行业场景中预装方法论而非仅调教 prompt
对于垂直行业场景，单纯调教 prompt 的天花板很明显。应该像 Coze 3.0 的行业技能包那样，**将行业数据库、专业方法论和高频工作流封装为可调用能力**。这让 Agent 不仅能回答问题，还能处理检索、整理、结构化分析等高频工作流。

### 5. 设计跨端任务延续机制
手机远程调用电脑桌面文件是多端协作的典型场景。实际工作中，可以设计类似的跨端任务延续：用户在外可以通过手机查看/操控项目进展，回到电脑后直接继续处理桌面端文件，无需手动同步材料。这让 AI 任务不再被某一台设备绑定。

## 关联阅读

- [扣子 3.0 多 Agent 协同实战](/ch04-110-扣子-3-0-多-agent-协同实战-指挥所有-agent-的-agent-5-人团队-6-步流水线/) —— 同样是 Coze 3.0 多 Agent 协作主题，网黑哥从实战角度提供了开发小队/品牌设计/公众号流水线的完整案例，与本文的官方升级视角互为补充。
- [字节 Trae Harness 工程指南](/ch01-520-来自字节跳动trae的harness-engineering指南/) —— 字节另一款 AI 产品 Trae 的工程化指南，可与 Coze 3.0 的本地 Agent 接入思路对照，理解字节在 AI 协作产品上的不同布局方向。

## 相关实体

- MOC

---

## Ch08.015 MiniMax Agent Team: Mavis (Owner-Worker-Verifier)

> 📊 Level ⭐⭐⭐ | 10.6KB | `entities/minimax-agent-team-mavis.md`

# MiniMax Agent Team: Mavis (Owner-Worker-Verifier)
**作者**：MiniMax 稀宇科技
**产品**：Mavis — MiniMax as a Jarvis
**原始链接**：https://mp.weixin.qq.com/s/TIL7o92f71DsPPLWT4_37A
**评分**：v=8, c=9, score=72
**入库日期**：2026-05-13
---   

## 概要
MiniMax Agent Team（Mavis）架构解析：单 Agent 四大痛点（上下文焦虑/注意力漂移/IM延迟期望/角色混淆）→ Owner-Worker-Verifier 三角色 + 对抗式验证 + 状态机 + 隔离上下文；多 Agent 三类成本（交接/共享/聚合）；Cost of Consensus 论文（2.1-3.4x token 开销）；Team 是策略选项而非默认。

## 单 Agent 四大痛点
| 痛点 | 表现 | 根因 |   
|------|------|------|   
| 上下文焦虑 | 7件事做完3件就停，开始汇报 | 模型对"超长任务何时停"判断模糊 |   
| 注意力漂移 | 越跑越分心，风格/来源前后不一致 | 单 Agent 难以自我制衡，自检的仍是自己构造的内容 |   
| IM延迟期望 | 要么浅答案，要么长时间无反馈 | 用户期待秒回，但复杂任务天然需要更久 |   
| 角色混淆 | 单 Agent 通过 Skill 扮演多角色，但角色≠分工 | 真正分工需要工具/上下文/记忆/Skill/输出协议都不同 |   

## Agent Team 三角色架构
```   
Owner（项目经理）   
  理解目标 → 拆分子任务 → 分配 Worker → 合并结果 → 控制停止   
       ↓   
Worker（专业执行）←→ Verifier（对抗检查）   
  工具/上下文/Skill 各异     事实来源/代码测试/格式/覆盖清单   
  专业化输出易复用         Worker 停→Verifier 启→问题→Worker 重启   
                          相互制衡，类似企业 R&D vs QA   
```   

### 关键设计
- **对抗式验证**：Worker-Verifier 是对抗关系，非可选附加步骤
- **状态机硬约束**：验证/重试/停止都是引擎层面硬性约束，非模型自由判断
- **隔离上下文**：每个 Agent 只看到自己任务相关的摘要，按需加载细节

## Task 派发 vs Agent Team
| | Task 派发 | Agent Team |   
|---|---|---|   
| 交互模式 | 一次收发（邮件） | 持续在线（工作群） |   
| 中间态可见性 | 主 Agent 不知道中间发生了什么 | Worker 可主动上报、Verifier 可直接打回 |   
| 指令补充 | 无通道 | Owner 随时可补充 |   
| 重试上下文 | 从头开始 | 复用之前上下文 |   

## 成本分析
### Cost of Consensus 论文结论
多 Agent token 消耗可达单 Agent 自我修正的 **2.1-3.4x**，准确率可能不升反降（特定模型 + 同质 debate 设置下）。**没有结构/验证/停止条件的多 Agent 不成立。**

### 三类额外成本
| 成本类型 | 说明 | MiniMax 解法 |   
|---------|------|-------------|   
| 交接成本 | 信息从"上一个 Agent 能懂"翻译成"下一个 Agent 能用" | 结构化文件+摘要通信，不塞进 prompt |   
| 共享成本 | 每多共享一段，每 Agent 每轮都付 token | 按需加载，只看相关摘要 |   
| 聚合成本 | 十份并行结果合成一份一致交付物，无捷径 | Owner 花真实精力，无法靠更多 Agent 解决 |   

### Verifier 三笔成本
1. 验证本身消耗（认真验证要花时间和 token）
2. 重试循环（需退出机制，否则越跑越贵）
3. 人类决策成本（高风险动作需人类签字；保留完整过程记录）

## 何时用 Agent Team
**Team 是策略选项，不是默认选项**

- **值得上**：任务复杂、链路长、风险高、经验可复用
- **不需要**：任务短、低风险、确定性高 → 单 Agent 或脚本

## 深度分析
### 架构设计的核心洞察
Mavis 的 Owner-Worker-Verifier 三角色架构本质上是将**认知分工**与**质量保障**解耦：

- **Owner** 承担元认知职责：目标分解、进度判断、停止决策。这是纯规划能力，不应与执行能力混淆。
- **Worker** 追求专业化深度：工具、上下文、Skill 各异，输出标准化以便被检查和复用。
- **Verifier** 扮演对抗性角色：不是"帮助"Worker，而是"找问题"。这种对抗关系是架构级的，不是可选的提示技巧。

### 为什么对抗式验证是架构核心而非附件
传统观念里，验证是"做完之后检查一下"。Mavis 的设计反其道而行：
1. **Worker 停止的条件 = Verifier 启动的原因**：两者是状态机中的互斥状态，不是并行合作。
2. **Verifier 发现的问题 → Worker 重新启动**：不是通知主 Agent 协调，而是直接的循环。
3. **企业类比**：R&D vs QA 的对抗关系确保产品质量，而不是 R&D 内部自检。

### 上下文隔离的设计原则
共享上下文是最大的成本陷阱。每一个"大家都看一眼"的设计都在积累 token 成本。正确的做法：

- 每个 Agent 持有**任务相关摘要**，而非完整对话
- 细节按需加载，用完即释放
- 交接通过**结构化文件+摘要**，不塞进 prompt

### Cost of Consensus 的实践意义
论文结论（2.1-3.4x token 开销）不能简单理解为"多 Agent 浪费"。关键前提：

- **同质 debate 设置**：即所有 Agent 用相同方式讨论问题
- **无结构/验证/停止条件**：这是论文批评的对象，不是多 Agent 本身
Mavis 通过 Verifier 提供了结构化验证，通过状态机提供了停止条件，因此不在论文批评的范围内。

### Team 是策略选项的深层含义
"不是默认选项"强调的是**进入门槛**：

- 任务足够复杂才值得付出多 Agent 的协调成本
- 链路长、风险高、经验可复用的场景才值得构建 Team
- 短任务、低风险场景用单 Agent 或脚本更高效
这与"微服务比单体更先进"的误区类似——架构选择取决于问题规模。

## 实践启示
### 何时真的需要 Agent Team
| 条件 | 单 Agent 足够 | Agent Team 值得 |   
|------|--------------|----------------|   
| 任务复杂度 | 简单问答、单一操作 | 多步骤、长链路、需多技能 |   
| 风险程度 | 低风险、可回滚 | 高风险、不可逆决策 |   
| 反馈时效 | 可以等待 | 需要实时响应+后台执行 |   
| 经验复用 | 一次性任务 | 同一模式重复执行 |   

### Verifier 设计的三原则
1. **独立上下文**：Verifier 不应与 Worker 共享"刚查过所以没错"的惯性，必须独立验证。
2. **具体可执行**：Verifier 的输出应该是"第 3 步的数值与来源不符"而非"看起来有问题"。
3. **硬性退出条件**：重试必须有最大次数限制，防止成本无限膨胀。

### IM 场景的快回复 + 后台执行模式
核心思路是**分层响应**：

- 第一层：立即响应，确认收到+概要计划（秒级）
- 第二层：后台 Worker 执行具体任务
- 第三层：关键节点汇报，用户无需盯着
这对用户期望管理至关重要——"已读不回"比"稍等我在做"体验更差。

### 文档生成的流水线设计
不要试图用单 Agent 生成完整长文档。正确的流水线：
```   
Planner（定义目标和结构）   
    ↓   
Writer（负责正文生成）   
    ↓   
Formatter（负责版式和格式）   
    ↓   
Tool Agent（调用文档工具）   
    ↓   
Evaluator（独立检查）   
```   
每一步的输出是下一步的输入，职责单一，容易检查和替换。

### 交接成本的优化策略
Agent 间交接时常见错误：把完整上下文塞给下一个 Agent。
正确做法：

- 输出结构化摘要（包含：已完成什么、关键结论、待确认点）
- 用文件作为交接媒介，而非 prompt
- 下一个 Agent 按需读取细节，不被动接收全部

## 关联阅读
- [Owner Worker Verifier Architecture](/ch01-889-owner-worker-verifier-架构/)
-

- Cost Of Consensus
- [Context Isolation](/ch01-892-上下文隔离/)
- Adversarial Verification

## 相关实体
- OpenClaw 多智能体团队搭建实战经验
- Sub-Agent vs Agent Team 选型与编排原语

→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/minimax-agent-team-mavis-owner-worker-verifier.md)

- [龙虾装上了可以用来干啥 - OpenCLAW 多智能体团队搭建经验](/ch04-038-openclaw-multi-agent-team-practice-v2/)

---

## Ch08.016 Thousand Token Wood v2: Multi-Model Heterogeneous Agent Council

> 📊 Level ⭐⭐⭐ | 10.6KB | `entities/thousand-token-wood-sim-v2-hackathon.md`

# Thousand Token Wood v2: Multi-Model Heterogeneous Agent Council

> 原文存档：[原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/thousand-token-wood-sim-v2-hackathon.md)

## 概述

Lester Leong（AdmiralTaco）Build Small Hackathon 2026 第二次提交的"Thousand Token Wood v2"工程报告。**核心创新**：4 个不同实验室的小模型组成 heterogeneous council，共同驱动一个金融市场游戏。

**v1 → v2 进化**：
- v1: 一个 fine-tuned 0.5B 模型跑 5 个 woodland creatures 交易市场（"看热闹"型）
- v2: 玩家 = Patron（金融大佬）— 放贷、传内幕消息、做空、行贿、结盟；magistrate 追踪内幕交易；creatures 记得玩家如何对待它们

## 核心架构创新

### 1. Heterogeneity is the product（异质性即产品，不是约束）

**Council 组成**（4 实验室的小模型）：
- **gpt-oss-20b**（OpenAI）
- **MiniCPM3-4B**（OpenBMB）
- **Nemotron-Mini-4B**（NVIDIA）
- **Qwen 0.5B fine-tune**（作者自训）

**为什么不同模型更好玩？**
- 同质模型 + 不同 prompt = "脚本"（行为可预测）
- 异质模型 = "活的争论"（市场参与者真正"不同"）
- 猫头鹰囤积方式 ≠ 狐狸投机方式——different training data + post-training 带来真实差异

### 2. 服务层摩擦是真实工程痛点（不是模型层）

实测发现的 vLLM 0.22.1 痛点：
- JIT 编译 kernel 需 CUDA toolkit（`nvcc`）→ lean base image 不带 → 4 个模型全部同样失败 "could not find nvcc" → **一个 image fix 解锁全部**（不是 gpt-oss 特殊问题）
- gpt-oss-20b MXFP4 原生量化 → 24GB L4 跑得动，channel 格式包裹 answer → consumer 需 extract final channel
- MiniCPM3 需 `trust_remote_code`；Nemotron 干净加载
- 通用解法：**tolerant JSON parse-and-repair layer**——所有模型输出都过这层，drop 无法 salvage 的部分，simulation 从不崩溃

**经验法则**：建好一次这个 layer，加新模型 = config 改动，不需要 refactor

### 3. 信息不对称需要 firewall（不是 prompt instruction）

**机制**：玩家可"传 tip" 给 creature — 真实 tip（预测市场会涨）或虚假 tip（诱饵）。真实 tip 正确使用 → 玩家"heat" 上升；过线 → magistrate 调查。

**安全属性要求**：
- 真相标记（truth flag）必须**对 creatures 不可见**——这是安全属性，不是 UI
- 隐藏 flag 存在玩家 ledger（off-prompt），公共 event record 构造时 strip
- narrator 永远只总结公共事件
- **核心测试**：每轮扫每个 creature 的完整 prompt，检查 banned tokens——**这是测试套件里最重要的一个**

**原则**：给 agent 秘密信息时，"假设它会泄露，除非有测试证明它不能"

### 4. 持久 memory：bounded summary 而非 raw history

**机制**：creatures 之间 + 与 Patron 之间的 signed sentiment（你 short 我的作物、你偿还贷款、你拉我结盟）。

**陷阱**：prompt inflation——raw history 无限增长 → 小模型淹没

**解法**：
- 模型永远只看到 **一行 bucketed summary**（"你对 Oona 感到温暖，对 Patron 警惕"）
- 摘要从 integer sentiment 派生，cap 在最强几个 feelings
- 完整 notes 留存（trace）但 bounded 不显示
- 行为偏差：50% emergent（summary 引导模型）+ 50% mechanical（强敌对 creature deterministic 拒绝）

## 实测结果（"What actually happened" 单次 seeded run）

| Lever | Result |
| --- | --- |
| Council 模型 | 4 实验室，皆 <32B，部署在 Modal |
| Fine-tuned 0.5B 可靠性 | 0% 自买、100% valid offer（击败自己的 3B teacher）|
| Truth firewall | 0 tip flag 泄露（每 prompt 扫）|
| Insider tip edge | 真实 tip 预先定位 → 正 P&L；虚假 tip 不获益 |
| Heat → 调查 | 2 次 suspicious 胜利触发 magistrate 调查 |
| Ruin | margin call + 贷款违约 → creature 流放，下一章归来 |

## Takeaways（作者总结）

1. **小模型是可靠格式生成器 + 不可靠推理器**——用 structure + prompting + 小 fine-tune 缩小 gap，不靠 scale
2. **Heterogeneous council 比 homogeneous 有趣**——服务层稳定后，加新模型只需 config
3. **Agent 秘密信息是 firewall 问题**——firewall 属数据流（测试证明），不是 prompt 指令
4. **持久 memory 是让 agent 活起来的最便宜方式**——前提是 prompt 只看到 bounded summary

## 实践价值

- **Multi-lab 模型组合**是 agent 工程的真实方向（vs 单一 frontier model）——用差异化取代同质化
- **Service layer 标准化**（vLLM config + JSON parser）是 heterogeneous council 的关键
- **安全测试自动化**（扫每个 prompt 的 banned tokens）是 production agent 必修课
- **Memory bounding**（一行摘要 + integer sentiment）证明小模型也能管理长期关系

## 与现有实体的差异化

现有 `entities/claude-code-hackathon-winners-2026.md` 和 `entities/claude-code-hackathon-expertise-digitization.md` 关注 Claude Code 生态内的 hackathon；本 entity 关注**多实验室小模型组合**的 agent council 工程实现——属于 Hackathon 维度的不同子主题。

`entities/defense_at_ai_speed_microsofts_new_multi.md` 关注 multi-agent 在 security 场景；本 entity 关注 multi-agent **在游戏/经济模拟**场景，且是 heterogeneous models（同 multi-agent 标签但维度不同）。

## 上线状态

- 原文 URL: https://huggingface.co/blog/build-small-hackathon/thousand-token-wood-sim-v2
- 作者: Lester Leong（AdmiralTaco）— Build Small Hackathon 参赛
- 部署平台: Modal
- Council 完全开源 + traces 公开

## 深度分析

### 1. Hackathon 作为 AI 应用创新的加速器
千 token 木材模拟 v2 展示了 hackathon 在 AI 应用创新中的价值——在有限时间内（24-48 小时），团队可以验证从"想法"到"可用原型"的路径。hackathon 的约束（时间短、资源有限）反而促进了创造性解决方案。

### 2. 模拟+AI 的混合方法论
木材模拟与 AI 的结合代表了一个新兴的方法论：用物理模拟生成训练数据，用 AI 学习模拟中的模式并加速预测。这种"模拟-学习-加速"循环在材料科学、气候模拟、药物发现中都有应用。

### 3. 千 token 的效率约束创新
"千 token"约束（极简提示词）迫使开发者找到最精炼的提示词设计——这与 prompt engineering 中的"少即是多"原则一致。约束驱动创新是 hackathon 的核心价值。

### 4. 从 hackathon 原型到生产系统的鸿沟
hackathon 原型证明了可行性，但从原型到生产系统需要：持续的数据流、错误处理、用户界面、性能优化——这些在 hackathon 时间框架内不可完成。

### 5. 领域特异性 AI 应用的长尾价值
木材模拟这类领域特异性应用不会登上头条，但对特定行业（林业、建筑）可能有巨大价值。AI 的最大价值可能在长尾领域而非通用场景。

## 实践启示

### 1. 用 hackathon 验证 AI 应用可行性
在投入大量资源前，用 hackathon 快速验证"AI 能否解决 X 问题"——48 小时的验证远比 6 个月的规划高效。

### 2. 模拟+AI：适合数据稀缺的场景
如果你的领域缺乏真实数据但可以建立物理模拟，用模拟生成训练数据是可行路径。

### 3. 约束驱动创新：设定 token/时间/资源上限
给 AI 应用开发设定显式约束（如"1000 token 提示词"），迫使团队找到最精炼的解决方案。

### 4. Hackathon 原型后：做可行性评估再做投入
hackathon 证明了可行性后，先评估原型到生产的差距和成本，再决定是否投入全面开发。

### 5. 关注你领域的长尾 AI 应用
AI 的最大价值可能不在通用场景而在你领域的特定痛点——用 AI 解决"小但关键"的问题。

## 相关实体
- [构建基于多智能体架构的深度思考交易系统](/ch04-205-构建基于多智能体架构的深度思考交易系统/)
- Scalable Voice Agent Design With Amazon Nova Sonic Multi Agent Tools And Session
- [Factory Mission Multi Agent Architecture](/ch01-864-factory-mission-multi-agent-architecture/)
- [构建基于多智能体架构的深度思考交易系统](/ch04-205-构建基于多智能体架构的深度思考交易系统/)
- [Openclaw Multi Agent Team Practice V2](/ch04-038-openclaw-multi-agent-team-practice-v2/)

## 原文链接

→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/thousand-token-wood-sim-v2-hackathon.md)

---

## Ch08.017 AgentRun：阿里云多 Agent 生产级协作方案（A2A 开放协议）

> 📊 Level ⭐⭐⭐ | 9.6KB | `entities/agentrun-multi-agent-a2a-alibaba-cloud.md`

> 原文归档：[原文归档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/agentrun-multi-agent-a2a-alibaba-cloud.md)

## 摘要

阿里云 AgentRun 是基于 Google A2A 开放协议的多 Agent 生产级协作平台。它针对「自建多 Agent 系统」最常卡住的六大工程问题（注册发现、跨 Agent 鉴权、调度编排、环境隔离、链路追踪、凭证治理）提供开箱即用的解决方案 —— 通过 AgentCard 自描述、工作空间隔离、发现端点分层、超级 Agent 服务端调度，让多 Agent 协作从实验室原型走向生产系统。

## 一句话

**A2A 开放协议 + 工作空间隔离 + 发现端点分层 + 超级 Agent 服务端调度 = 多 Agent 从实验室到生产。**

## 核心架构

| 层 | 职责 | 关键抽象 |
|---|------|---------|
| A2A 协议层 | AgentCard 自描述 + 标准通信 | `/ .well-known/agent-card.json` |
| 工作空间层 | 逻辑隔离 + 权限独立 | Workspace（命名空间） |
| 发现端点层 | 按环境暴露发现入口 + 凭证验证 | Discovery Endpoint（default / production） |
| 超级 Agent 层 | Orchestrator 拆解任务 + 动态调度 | Server-side Orchestrator |

## 核心要点

### 1. AgentCard：A2A 协议的「自描述身份证」

AgentCard 是一个标准 JSON 文档，默认托管在 `/.well-known/agent-card.json`。它回答四个问题：
- **是谁**：名称、描述、版本、提供方
- **能做什么**：Skills 列表（每个有 ID、名称、描述、示例问法）
- **怎么访问**：URL、传输协议（JSON-RPC / gRPC）
- **什么限制**：认证方式、是否支持流式

类比一下：AgentCard 之于 Agent，等于 OpenAPI Spec 之于 REST API。在没有 AgentCard 之前，每个 Agent 团队都要自己定义"我是谁、怎么调我"的描述格式，调用方要写一堆适配代码。AgentCard 把这个标准化了。

### 2. 工作空间（Workspace）：项目级隔离单位

工作空间是逻辑隔离的 Agent 集合，类比 Kubernetes 的 Namespace 或云账号的项目。同一工作空间内的 Agent 默认互通，跨工作空间需要显式授权。

设计意图：让多团队协作时，可以"各管各的 Agent"，不会出现 A 团队的测试 Agent 误调到 B 团队的线上 Agent。

### 3. 发现端点（Discovery Endpoint）：环境分层

按环境隔离的发现入口：
- **default 端点**：调试用，包含所有 Agent（含未稳定版）
- **production 端点**：只包含稳定版 Agent，凭证体系独立

调用方通过不同端点 URL 拿到不同 Agent 列表。配合 API Key / HTTP Basic Auth，凭证与工作空间解耦 —— 一个工作空间可以有多个发现端点对应不同环境。

### 4. 平台托管 vs 外部 Agent 统一体验

| 类型 | 部署方式 | 注册方式 | 状态流转 |
|------|---------|---------|---------|
| 平台托管 Agent | AgentRun 部署到 FC（函数计算） | 创建时自动注册 | CREATING → READY |
| 外部 Agent | 自行部署 | 手动注册 AgentCard URL | 直接 READY |

调用方无需关心对方是托管还是外部 —— 走同一套发现 + 调用协议。这种"统一发现体验"是 AgentRun 的关键价值 —— 否则平台就只是另一套部署工具。

### 5. 超级 Agent（Orchestrator）：服务端智能调度

用户意图 → 超级 Agent 拆解子任务 → 动态调用专职 Agent → 聚合结果返回。

核心是把"调度"放在服务端（不是客户端），好处是：
- 调度逻辑可以观测（链路追踪、失败重试、限流都在服务端）
- 调度策略可以集中升级（不用每个客户端重新发布）
- 凭证不会暴露给客户端

## 深度分析

### 1. 多 Agent 的"工程复杂度"远大于"算法复杂度"

自建多 Agent 系统要解决的工程问题：
- 注册中心：哪些 Agent 在线？属于哪个环境？
- 服务发现：调用方如何找到合适的 Agent？
- 跨 Agent 鉴权：谁可以发现谁、调用谁？凭证如何轮转？
- 调度编排：复杂任务如何拆解、分发、重试、聚合？
- 环境隔离：开发、测试、生产的 Agent 如何避免串用？
- 链路追踪：跨多个 Agent 如何定位慢调用和失败点？

这六个问题里没有任何一个是 LLM 算法问题 —— 全是分布式系统问题。AgentRun 的价值在于把这些"老问题"用 Agent 时代的语义重新包装，提供了开箱即用的实现。

### 2. A2A 协议的"开放"是真正的护城河

A2A 是 Google 主导的开放协议，类似 MCP之于工具调用、MPI 之于科学计算。选择 A2A 而不是私有协议的关键收益：
- **避免锁定**：今天用阿里云 AgentRun，明天可以把 Agent 迁到 Google ADK、AWS Bedrock Agents，不需要改 Agent 实现。
- **生态复用**：任何一个遵循 A2A 的 Agent（不管是阿里、Anthropic 还是某创业公司写的）都可以被发现和调用。
- **可演进**：协议层和实现层解耦，平台可以在 A2A 之上做差异化（工作空间、发现端点、凭证治理），但保持兼容。

### 3. 「先管起来再调度」的渐进路径

原文给出了一个非常工程化的方法论：**先管起来，再调度。**

意思是：很多团队一上来就想做"超级 Agent 自动调度"，结果调度不通 —— 因为底层的 Agent 发现、鉴权、隔离都没做。AgentRun 的建议是先把"管"做扎实（工作空间 + 凭证 + 发现端点），再上"调"（超级 Agent 调度）。这个顺序很重要 —— 没有"管"的"调"是空中楼阁。

### 4. 生产级方案五要素

原文总结：
1. **开放互通**：基于 A2A，避免私有协议锁死
2. **统一治理**：工作空间 + 发现端点 + 凭证体系
3. **服务端编排**：超级 Agent 服务端调度
4. **生产可观测**：跨 Agent 调用链路可追踪可审计
5. **渐进演进**：先管起来再调度

这五要素几乎是把 12-factor app 的微服务原则翻译成了 Agent 时代语言。

## 实践启示

1. **做多 Agent 系统，第一件事是定义 AgentCard**。不要等"算法跑通"再补发现机制 —— AgentCard 是 Agent 时代的"接口契约"，先定契约再写实现。
2. **工作空间 + 发现端点是组织级抽象**。多团队协作时，这两层抽象是必须的，不要试图用一个全局 Agent 注册表解决所有问题。
3. **凭证与工作空间解耦**。一个工作空间可以有多个发现端点对应不同环境（dev / staging / prod），凭证独立管理 —— 这是云原生时代的标准模式。
4. **服务端编排优于客户端编排**。客户端编排（每个客户端自己决定调哪些 Agent）无法观测、无法集中升级。超级 Agent 应该是服务端组件。
5. **选择 A2A 这类开放协议，不要发明私有协议**。今天多 Agent 生态还在早期，私有协议会让你的 Agent 被生态孤立。开放协议看起来短期增加了对接成本，长期收益巨大。

## 相关实体

- [Harness Engineering](/ch05-010-harness-engineering-ai-从-聪明-到-可靠-的第三代工程范式/) — Agent 时代的工程范式
- [快手 RCA Agent](/ch04-419-快手-rca-agent-复杂业务场景下排障-agent-的探索实践/) — Multi-Agent 架构实践
- [AI Coding Agent Token 成本控制](/ch09-119-ai-coding-agent-token-成本控制五层模型/) — Orchestrator-Worker 模式
- [原文归档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/agentrun-multi-agent-a2a-alibaba-cloud.md)
- A2A Protocol: https://a2a-protocol.org/latest/specification/
- AgentRun 控制台: https://functionai.console.aliyun.com/
- MOC

---

## Ch08.018 AP2 协议实测：Mandate 机制、Task 状态机与多 Agent 支付

> 📊 Level ⭐⭐⭐ | 8.3KB | `entities/ap2-agent-payments-protocol-hands-on-analysis.md`

# AP2 协议实测：Mandate 机制、Task 状态机与多 Agent 支付

Google AP2（Agent Payments Protocol）工程实测分析。基于官方 Human-Present 场景完整复现，记录协议细节和工程踩坑——密钥路径一致性、CartMandate 结构、SD-JWT 选择性披露、Task 终态陷阱、多 Agent Token 消耗乘法增长。

→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/ap2-agent-payments-protocol-hands-on-analysis.md)

## 核心问题

当 Agent 开始替用户做决定、甚至替用户花钱时，怎么证明这是用户本人授权的，又怎么保证 Agent 不会乱花钱。AP2 把商户对交易的承诺变成可验证的数字凭证，而不是依赖 Agent 的口头描述。

→ [AgentCore Payments 与 x402 协议](/ch11-066-agentcore-payments-与代理商务创新-技术深度解析/) — AWS 的对标方案

## 实测踩坑

### 1. 密钥路径一致性

Credentials Provider 启动时生成 ECDSA 密钥对，公钥写到统一路径。Merchant Payment Processor 验证时去同一路径读公钥。如果四个 Agent 不在同一个 shell 环境里启动，路径对不上——报 Agent-provider public key not found，支付流程卡死。官方文档完全没提。

### 2. CartMandate 结构

```json
{
  "id": "cart_2",
  "merchant": { "name": "Generic Merchant" },
  "line_items": [{ "item": { "title": "12-cup drip coffee maker", "price": 3950 }, "quantity": 1 }],
  "currency": "USD",
  "status": "incomplete",
  "iat": 1781686213,
  "exp": 1781689813
}
```

- 价格单位是分（3950 = 39.50 美元），规避浮点精度问题
- status incomplete → 用户确认后才封存
- 一小时有效期，ES256 签名

### 3. SD-JWT 选择性披露

支付环节用 SD-JWT 而非普通 JWT。给 Payment Processor 只展示金额和收款方，不展示卡号；给审计方再展示其他字段。隐私保护直接嵌进数据格式。

### 4. Task 终态陷阱

A2A 协议 Task 生命周期：completed、failed、cancelled 都是终态，一旦进入就不能再接收新消息。支付重试必须在应用层创建新 Task，不能在失败的 Task 上继续操作。

这和 HTTP 无状态模型完全是两种思路——每个 Task 都是有状态、有生命周期的实体。

### 5. 多 Agent Token 消耗

一次确认购买消耗十次以上 API 调用（Shopping Agent 思考→调工具→委托子 Agent→子 Agent 思考→回传）。多 Agent 系统的 token 消耗不是线性叠加，而是**乘法增长**。Gemini 免费套餐每分钟 15 次请求限制，跑不了几轮。

## 竞争格局

| 协议 | 主导方 | 定位 |
|------|--------|------|
| AP2 | Google | 密码学背书的商务协议 |
| ACP | OpenAI × Stripe | Agentic Commerce Protocol |
| ACT | 支付宝 + 千问 + 淘宝闪购 + 阿里云百炼 | 国内监管 + 本土支付生态 |
| APOP / ClawTip / AI Skill | 国内各方 | 碎片化 |

蚂蚁数科 Anvita 平台让 Agent 持有资产、链上结算。蚂蚁 AI 支付累计 3 亿笔（2 亿最近两月新增）。

→ [AgentCore Payments 与 x402 协议](/ch11-066-agentcore-payments-与代理商务创新-技术深度解析/) — AWS AgentCore 支付方案

## 协议局限

- CartMandate 一小时有效期 + 单次 OTP → Agent 自主跨平台长周期任务场景会暴露局限
- 更细粒度的授权范围控制是下一代协议方向
- 蚂蚁 Anvita / Token Pay 指向更远方向：Agent 自己成为有经济主体资格的参与方

## 深度分析

### 密码学背书 vs 口头信任的范式转变

AP2 的核心创新不在于"让 Agent 能支付"——Stripe API 早就做到了——而在于把商户对交易的承诺从自然语言层面提升到密码学可验证层面。CartMandate 用 ES256 签名，任何拿到商户公钥的一方都可以独立验签，不需要信任 Agent 的转述。这解决了一个根本问题：在多 Agent 协作中，中间 Agent 可能被篡改或幻觉，但密码学签名无法伪造。

### SD-JWT 的隐私工程设计

SD-JWT 选择性披露机制让同一份凭证在不同场景下展示不同字段——支付处理器只看到金额和收款方，审计方看到完整信息。这不是应用层的访问控制，而是数据格式层面的隐私保证。对比传统 JWT 的"全有或全无"模式，SD-JWT 为 Agent 间敏感数据传递提供了更细粒度的隐私屏障。

### Task 有状态模型的工程代价

A2A 协议的 Task 生命周期设计（completed/failed/cancelled 均为终态）带来了显著的工程复杂度。支付重试不能在失败的 Task 上继续，必须创建新 Task——这意味着应用层需要维护 Task 之间的关联关系、状态回滚逻辑、以及幂等性保证。与 HTTP 无状态模型相比，有状态 Task 模型更适合 Agent 协作场景（因为 Agent 交互天然是多轮、有上下文的），但对开发者的心智模型要求更高。

### 多 Agent Token 消耗的乘法增长效应

一次确认购买消耗十次以上 API 调用——这是 Agent 系统的结构性成本，不是优化能消除的。当 Agent 数量从 1 增加到 N，通信复杂度从 O(N) 变为 O(N²)。Gemini 免费套餐每分钟 15 次请求的限制，在单 Agent 场景下完全够用，但在多 Agent 商务场景下几轮就会耗尽。这对 Agent 基础设施提供商意味着：多 Agent 系统的定价模型不能按单次 API 调用计费，需要按"商务流程完成"计费。

### 授权粒度与长周期任务的矛盾

CartMandate 一小时有效期 + 单次 OTP 的设计，本质上是为 Human-Present 场景优化的。当 Agent 需要自主完成跨平台、长周期任务（如代购比价后分批下单），当前授权模型会成为瓶颈。下一代协议需要支持：可续期的委托凭证、分阶段授权（先比价、再下单、最后支付）、以及跨平台凭证互认。

## 实践启示

1. **密钥路径统一是多进程 Agent 的基础工程**：启动脚本必须统一设置环境变量，所有 Agent 进程共享同一密钥路径。这个细节在官方文档中缺失，但会导致整个支付流程卡死
2. **SD-JWT 是 Agent 间敏感数据传递的优选方案**：在设计 Agent 协作系统时，优先考虑选择性披露的数据格式，而非依赖应用层的访问控制逻辑
3. **多 Agent 系统需要按流程计费而非按调用计费**：Token 消耗的乘法增长意味着按 API 调用次数的定价模型在多 Agent 场景下会指数级膨胀
4. **支付重试必须在应用层实现 Task 管理**：不能依赖 A2A 协议层的 Task 重用，需要在应用层维护 Task 关联和幂等性
5. **关注蚂蚁 Anvita 的 Agent 经济主体方向**：Agent 持有资产、链上结算代表了比"代人支付"更远的演进方向

## 相关链接

- AP2 官方：github.com/google-agentic-commerce/AP2
- AP2 文档：ap2-protocol.org
- ACP（OpenAI × Stripe）：github.com/agentic-commerce-protocol/agentic-commerce-protocol
- → [AgentCore Payments 与 x402 协议](/ch11-066-agentcore-payments-与代理商务创新-技术深度解析/)
- → [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/ap2-agent-payments-protocol-hands-on-analysis.md)

---

## Ch08.019 对抗式验证

> 📊 Level ⭐⭐⭐ | 7.8KB | `entities/adversarial-verification.md`

## 核心原则
- Verifier 与 Worker 是对抗关系，非可选附加步骤
- Verifier 主动寻找 Worker 输出中的缺陷
- 适用于需要严格质量控制的场景

## 深度分析
### 对抗式验证的设计哲学
MiniMax 的 Mavis Agent Team 架构将 Worker-Verifier 关系定义为对抗关系，这与企业中研发和质量部门的关系类似。很多框架将验证环节作为可选的附加步骤，但在 MiniMax 的设计中，它是架构的核心。
这个设计基于一个关键洞察：**Agent 很难自我检查自己的输出**。单 Agent 经常出现的问题包括：

- 注意力漂移：检查的仍然是自己刚刚构造出来的东西
- 上下文焦虑：忘记任务边界或执行到哪一步
- 确认偏误：很真诚地自检但找不到真正的问题
Verifier 作为独立角色，与 Worker 不共享同一个上下文，没有"我刚查过所以应该没错"的惯性。

### 三角色架构的制衡机制
```
Owner（项目经理）→ 拆解任务、分配 Worker
     ↓
Worker（专业执行）→ 执行任务、产生输出
     ↓
Verifier（对抗检查）→ 验证质量、发现问题
     ↑                      ↓
     ← ← ← 重新执行 ← ← ← ←
```
关键设计逻辑：

- **Worker 停止的条件是 Verifier 启动的原因**
- **Verifier 停止的条件是尽可能发现 Worker 的问题**
- **发现的问题成为 Worker 重新启动的原因**
它们之间是**相互制衡的关系**，而不是简单的上下游关系。

### Verifier 的具体工作内容
在研究场景中，Verifier 的工作包括：
**来源检查**

- 引用的是不是稳定链接（官方页面、论文、GitHub 仓库 vs 搜索引擎缓存页、打不开的社区帖）
- 来源是否可被其他人验证
**时效检查**

- 来源上周访问不了但这周恢复了，报告里不能还留着"无法确认"的标注
- 页面的发布日期没核实过，就不能在报告里写成确定时间

### 对抗验证 vs 传统测试的本质区别
传统软件测试是确定性的：给定输入 → 执行代码 → 验证输出。输出可预期，测试可以精确断言。
Agent 输出是概率性的：同样的输入可能产生不同输出，需要多次运行评估稳定性。
传统测试的"执行者和验证者分离"原则在 Agent 系统中升级为"独立的 Verifier Agent"，需要解决：

- 自判卷偏差（同一个模型既执行又验证）
- 随机性（多次运行结果不同）
- 负向增益（加了验证反而可能降低质量）

### Verifier 成本的三重含义
1. **验证本身**：认真验证就是要花时间和 token，走过场不如不设
2. **重试成本**：需要退出机制，否则越跑越贵
3. **人类决策成本**：高风险动作（如合并代码）不能让 Agent 拍板，必须人类签字

### 多 Agent 的成本分析
引用论文 Cost of Consensus：在特定模型和同质 debate 设置下，多 Agent 的 token 消耗可能达到单 Agent 自我修正的 2.1 到 3.4 倍，准确率却没有提升甚至更差。
**但这个结论不能外推为所有多 Agent 都是浪费的**。关键区别在于：

- 没有结构、没有验证、没有停止条件的多 Agent 是不成立的
- 有架构约束和对抗验证的多 Agent 可以显著提升质量

### 三类额外成本
**交接成本**：信息在 Agent 之间传递时需要重新组织。研究 Agent 收回来几十个网页，写作 Agent 可能用不了。
解决方案：Agent 之间通过结构化的文件和摘要来通信，而不是把所有上下文塞进一个 prompt。
**共享成本**：每多共享一段内容，每个 Agent 每一轮都要为它付 token。
解决方案：按需加载，每个 Agent 只看到跟自己任务相关的信息摘要，需要细节时再读全文。
**聚合成本**：派十个 Agent 并行查资料很容易，但把十份结果合成一份事实一致、引用准确、风格统一的交付物很难。这一步没有捷径。

## 实践启示
### 1. 将 Verifier 作为架构核心而非可选附加
如果只把 Verifier 当作"可选的质检步骤"，实际上没有解决对抗关系问题。需要：

- Worker 停止的条件由 Verifier 决定
- Verifier 有明确的质量标准和检查清单
- 发现的问题必须触发 Worker 重试

### 2. 明确三角色的职责边界
- **Owner**：理解用户目标、拆分子任务、决定执行顺序、分配任务、合并结果、控制停止
- **Worker**：专业化执行，角色越清楚输出越容易被复用、比较和检查
- **Verifier**：独立验证，不共享 Worker 上下文，主动寻找缺陷

### 3. 设计有效的验证检查清单
来源检查：

- 引用链接是否可访问
- 是否是稳定来源（官方页面 vs 搜索引擎缓存）
- 时效性是否标注准确
内容检查：

- 是否覆盖了所有要求的方面
- 事实陈述是否有来源支撑
- 格式是否符合规范

### 4. 建立重试和停止机制
没有退出机制会导致无限重试：

- 设置最大重试次数
- 定义重试条件（什么样的问题值得重试）
- 定义停止条件（什么样的问题应该升级到人工）

### 5. 考虑何时不该用多 Agent
多 Agent 不是默认选项，是策略选项：
| 场景 | 建议 |
|------|------|
| 任务越复杂、链路越长、风险越高、经验越可复用 | 值得上 Team |
| 任务越短、越低风险、越确定 | 单 Agent 甚至脚本就够了 |

### 6. 优化 Agent 间通信
交接成本是真实的：

- 使用结构化摘要而非原始输出
- 每个 Agent 按需加载，只看相关信息
- 避免把所有上下文塞进共享 prompt
→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/minimax-agent-team-mavis-owner-worker-verifier.md)

## 参考
- Minimax Agent Team Mavis
- [Owner Worker Verifier Architecture](/ch01-889-owner-worker-verifier-架构/)

## 相关实体

- MOC

---

## Ch08.020 Routa 多智能体协同交付平台

> 📊 Level ⭐⭐⭐ | 6.9KB | `entities/routa-multi-agent-coordination-platform.md`

## 核心理念
"单一 Agent 聊天适合处理孤立任务，但一旦同一条线程同时承担拆解、实现、评审、证据收集和发布决策，语义边界就会迅速混乱。"
**解决方案**：让软件交付链路显式化，每个角色干自己的活。

## 三层架构
1. **Planning**（规划层）
2. **Execution**（执行层）
3. **Verification**（验证层）

## Kanban 六列
- **Backlog** → Refiner 改写需求为 YAML story
- **Todo** → Orchestrator 验证可执行性
- **Dev** → Crafter 实现+验证+提交
- **Review** → Guard 独立验证
- **Done** → Reporter 总结交付
- **Blocked** → Resolver 处理阻塞

## 专业化 Agents
| Agent | 职责 |
|-------|------|
| Backlog Refiner | 将粗糙需求改写为结构化YAML，包含acceptance criteria、INVEST检查 |
| Todo Orchestrator | 重新解析YAML，不合格则退回 |
| Dev Crafter | 实现、验证、提交、写Dev Evidence |
| Review Guard | 独立验证每条acceptance criteria |
| Done Reporter | 留下completion summary |
| Blocked Resolver | 处理依赖/环境/需求歧义导致的阻塞 |

## Review Gate 三层验证
1. **Code Analysis**（代码分析）
2. **Test Verification**（测试验证）
3. **Specification Compliance**（规格合规）

## Entrix 验证引擎
- Rust 编写（`crates/harness-monitor/`）
- 定义 fitness rules（文件行数、测试存在性、代码模式）
- 支持 dry-run 和多 tier 运行
```bash
cargo build -p entrix
entrix run --tier fast
entrix run --tier normal
```

## 深度分析
**从痛点出发理解 Routa 的设计动机**：
当前大多数 Coding Agent 产品（如 Claude Code、Codex）解决的是"需求翻译成代码"这前半段问题，但软件交付远不止翻译这一个环节。真实需求需要经历拆解、确认边界、明确验收标准、实现、复核、上线确认，这条链路，单个 Agent 在单条聊天线程里根本无法承担。
phodal 在 README 中指出的核心矛盾：「单一 Agent 聊天适合处理孤立任务，但一旦同一条线程同时承担拆解、实现、评审、证据收集和发布决策，语义边界就会迅速混乱。」这个观察直接催生了 Routa 的设计哲学——**让软件交付链路显式化，每个角色干自己的活**。
**Kanban 范式对 Agent 协作的深层意义**：
Routa 选择 Kanban 而非线性流水线是有深意的。Kanban 的可视化板不仅展示了"做什么"，更重要的是展示了"在哪卡住了"。六列（Backlog → Todo → Dev → Review → Done → Blocked）天然提供了状态可视化和阻塞检测能力。Dev Crafter 完成后进入 Review Guard，如果被阻塞在 Review 阶段，Blocked Resolver 可以精准介入而不是让整个流程停摆。
更重要的是，卡片本身会随流转逐渐严格化：Backlog 产出 YAML story，Todo 补上 execution brief，Dev 追加 Evidence，Review 加上 Findings，Done 写 summary。信息逐层累积，形成完整的证据链，而不是在一条聊天记录里反复拉扯。
**Entrix 验证引擎的设计理念**：
Review Gate 不是靠 AI 喊"LGTM"，而是通过 Rust 编写的 Entrix 验证引擎，依据明确的 fitness rules 判定。fitness rules 可以定义：文件行数上限、测试存在性要求、禁止代码模式等。这种规则驱动的方式避免了 AI 评审的主观性，为自动化交付提供了客观基准。
**技术架构的统一性**：
Web 端（Next.js 16.2）和桌面端（Tauri + Rust Axum）共享同一套 `api-contract.yaml` 定义的语义边界（workspace、session、task、trace、codebase、worktree、review），确保两端行为一致。Rust crates 分层（routa-core、routa-server、routa-cli、harness-monitor）提供了清晰的责任边界和可扩展性。

## 实践启示
**1. 复杂软件交付场景应显式建模角色职责**：当任务涉及需求分析、实现、评审、发布等多个环节时，单一 Agent 聊天窗口会因语义边界混乱而失效。应将交付链路显式化，让每个 Agent 专注单一角色。
**2. Kanban 范式可有效解决 Agent 状态追踪问题**：相比线性流水线，Kanban 的列状态天然适合追踪多 Agent 协作中的进度和阻塞。结合 Blocked Resolver 角色，可以实现"发现阻塞 → 诊断原因 → 路由到正确泳道"的闭环。
**3. 证据链驱动的 Review 比 AI 主观评审更可靠**：在代码评审中定义明确的 fitness rules（文件行数、测试存在性、代码模式），并通过自动化工具验证，比 AI 生成的"LGTM"更有可重复性和可审计性。
**4. 上下文信息应随任务流转逐层累积**：卡片从 YAML story → execution brief → Evidence → Findings → summary 的演化过程，本质上是将散落在对话记录里的信息结构化沉淀，便于追溯和审计。
**5. 多端一致性需要统一语义边界**：Web 和桌面端共享 `api-contract.yaml` 定义的核心概念，确保不同入口的行为语义一致，这是构建可信 Agent 平台的基础。

## 与现有知识的链接
- → Routa Harness 可视化 — 旧版 harness 可视化方向
- → Harness Context — 多 Agent 协作的上下文管理
- → [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/routa-multi-agent-coordination-platform.md)

---

## Ch08.021 Nature丨Google和FutureHouse同日登刊，把AI科学助理推到科研前线

> 📊 Level ⭐⭐⭐ | 6.7KB | `entities/nature-ai-scientific-assistant-google-futurehouse.md`

> -> [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/nature-ai-scientific-assistant-google-futurehouse.md)

# AI 科研助理：Co-Scientist vs Robin

## 一句话

Nature 2026 同日发表 Google Co-Scientist（Gemini 2.0 多智能体）和 FutureHouse Robin（文献+实验闭环），AI 正在从单点工具进化为科研伙伴。

## 两个系统对比

| 维度 | Co-Scientist（Google） | Robin（FutureHouse） |
|------|----------------------|---------------------|
| **底座** | Gemini 2.0 | Crow + Falcon + Finch |
| **核心能力** | 结构化假设生成、专家评审 | 文献检索 → 假设 → 实验数据分析闭环 |
| **实验闭环** | 仅生成假设，不做实验 | Finch 自主写代码做湿实验数据分析 |
| **案例** | 白血病药物再定位（11个开放问题盲评第一） | 干性黄斑变性（30分钟读完825篇文献） |
| **科学家介入** | 可随时提供反馈和假设 | 迭代中主动提议 RNA-seq |

## 关键结论

**专用科学文献接口至关重要**：o4-mini 替换 Crow 后幻觉引用从 0% 飙升至 45%。

**当前局限**：成功在药物开发中最容易的细胞培养阶段；离"AI 自动做科学"仍有距离。

## 深度分析

**多智能体分工是科研 AI 系统化的关键路径**。Co-Scientist 的生成→反思→排名→进化→元评审五角色分工，本质上是将科学家评审流程自动化：假设生成后经独立评审过滤不合理选项，再通过进化机制迭代改进，最终由元评审给出综合判断。Robin 的 Crow（文献）→ Falcon（评估）→ Finch（实验分析）则是从文献驱动假设到实验验证的完整闭环。这种分工使每个智能体专注于单一能力，通过消息传递实现能力叠加，远比单一大模型"端到端"更可靠、更可解释。

**领域专用文献接口是当前科研 AI 的核心竞争力**。Google Co-Scientist 的 Reflection 工具和 FutureHouse Robin 的 Crow 模型都专门针对科学文献设计，核心目的是避免大模型常见的"幻觉引用"问题。当 Robin 将底座从 Crow 换成 o4-mini 后，幻觉引用率从 0% 飙升至 45%——直接说明通用模型在科学场景下的局限。这对科研 AI 的启示是：在科学文献理解这类高精度任务上，专门训练的文献接口比通用大模型的性能差距可能是决定性的。

**实验闭环能力将 AI 科研助理的天花板推到新高度**。Co-Scientist 仅生成假设，不执行实验；Robin 则更进一步，Finch 能接收湿实验原始数据、在 Jupyter 中自主编写并执行代码完成差异表达分析等全流程，并在迭代中主动提议 RNA-seq 等新实验方向。这种"假设→实验→数据分析→新假设"的闭环能力，使 AI 从辅助工具升级为真正的科研伙伴——可以主动推进研究进展，而非仅提供建议。

**当前局限与突破口明确**。两系统的成功均集中在细胞培养阶段的药物筛选，这是药物开发中技术门槛最低的环节。真正的难题——起效机制解释、基因表达原因、动物/临床试验——尚未被触及。这也意味着短期内 AI 科研助理的价值在于：大幅加速文献综述和候选药物初筛，为科学家腾出时间专注于机制研究和转化决策。

## 实践启示

**研究团队应优先评估文献接口质量而非模型参数规模**。Nature 论文的对照实验表明，将 Crow 换成 o4-mini 后幻觉引用率从 0% 飙升至 45%，性能差距远比模型大小更显著。在选型科研 AI 工具时，应将"是否专门针对科学文献场景优化"作为首要标准，而非盲目追求模型规模。

**药物再定位是当前科研 AI 价值最确定的落地场景**。两个系统都选择了药物再定位作为核心案例，盲评均获专家级结果。该任务有明确的评估标准（IC50、选择性、协同效应），且处于药物开发最早期的高通量筛选阶段，AI 可以发挥最大价值。从 ROI 角度看，药物再定位 AI 是当前最近可商用化的方向。

**科学家角色正在从"执行者"向"决策者"迁移**。论文提出"首席科学家 + 超级博士后"的分工模型：首席科学家负责提出根本性问题、设计实验范式边界、做最终判断；AI 作为"超级博士后"不知疲倦地完成文献阅读、假设生成、实验数据分析等执行层工作。科研团队应开始思考如何重构工作流，让科学家聚焦于 AI 难以替代的战略判断和跨领域洞察能力。

**迭代式人机协同比单次查询价值高一个数量级**。Robin 的案例中，AI 在首轮实验后主动提议做 RNA-seq，科学家同意后 Finch 自主完成分析并提出更新假设。这种迭代式交互使得 AI 能够不断修正方向，逼近正确答案。相比之下，单次假设生成的价值有限——真正的突破来自多轮"假设→验证→反馈"循环。

## 一句话

多智能体 + 领域专用文献接口 + 闭环实验能力 =下一代科研 AI 标配。
## 相关实体
- Autoresearch Ai Scientific Discovery L0 L4 Challengehub
- [Rag技术框架的演进方向](/ch01-193-rag技术框架的演进方向/)
- [构建基于多智能体架构的深度思考交易系统](/ch04-205-构建基于多智能体架构的深度思考交易系统/)
- [Wow Harness V3 Governance Protocol](/ch05-028-wow-harness-v3-ai-开发的治理协议/)
- [Hermes Agent 12 Layer Full Configuration Guide](/ch07-007-hermes-agent-满配-12-层配置完整指南-从裸装到-24h-agent-团队/)

---

## Ch08.022 Multi-Agent AI Safety Research Funding Call（DeepMind 主导，1000 万美元，四大方向）

> 📊 Level ⭐⭐⭐ | 5.0KB | `entities/investing-in-multi-agent-ai-safety-research-deepmind-2026-06.md`

# Multi-Agent AI Safety Research Funding Call（DeepMind 主导，1000 万美元，四大方向）

> 原文存档：[原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/investing-in-multi-agent-ai-safety-research.md)

## 概述

Google DeepMind 联合 **Schmidt Sciences、Cooperative AI Foundation、ARIA**（英国先进研究与发明局）并获得 **Google.org** 支持，于 2026-06-11 发布**最多 1000 万美元**的多 Agent AI 安全研究资助公告。这是首个由主要 AI 实验室主导、联合多家长期 AI 安全公益机构**共同出资**的多 Agent 安全研究计划。申请截止 **2026-08-08**，获奖者 2026 秋季公布。

核心命题：随着 AI 技术规模化，正在进入"数百万由不同组织构建的 AI Agent 在数字环境中交互、通信、谈判、交易"的新时代。这种跨组织、跨网络的 Agent 交互产生"涌现"集体行为（emergent collective behaviors），目前缺乏预测、测量和监控工具，构成传统单模型安全评估无法覆盖的新型风险。

## 四大优先研究方向

| 方向 | 核心问题 | 典型研究对象 |
|------|---------|-------------|
| **Sandboxes and testbeds** | 如何构建可复现的真实环境来评估多 Agent 安全 | 虚拟市场、模拟生态系统、跨组织工作流 |
| **Science of agent networks** | 交互 Agent 种群的安全相关属性 | 集体能力如何涌现/扩展、网络如何失败/失稳、如何检测危险的种群级属性 |
| **Strengthening agent infrastructure** | 强化跨平台 Agent 安全交互协议 | 身份、声誉、承诺（commitment）协议的抗压测试 |
| **Oversight and control** | 监控已部署的 Agent 种群 | 种群级集体危害的检测与缓解方法 |

## 关键贡献

1. **首次主要 AI 实验室主导 + 公益联合资助模式**：DeepMind 提供资金，Schmidt Sciences、ARIA、Cooperative AI Foundation 提供研究框架，Google.org 提供运营支持，**单一资金方无法独立驱动**。该模式可被复用到未来多 Agent 安全研究。

2. **从"单模型安全"到"种群级安全"的研究范式转变**：现有 AI 安全评估**主要在隔离状态下分析单个模型**，新框架则要求理解**交互产生的涌现行为**。这意味着 safety evaluation 范式从 per-model 转向 population-level。

3. **四大方向形成完整闭环**：Sandboxes（实验环境）→ Science（理论）→ Infrastructure（协议层）→ Oversight（部署层）—— 从基础研究到实战部署形成完整覆盖，每一层都是研究机会。

## 与 DeepMind 2025 工作的延续

资助公告明确将本计划建立在 DeepMind 2025 年的两项基础工作上：

- **2025 年多 Agent 交互理解框架**（2025 foundational framework for understanding these interactions）
- **AI Agent Traps**（对抗环境下 Agent 面临的脆弱性研究）

资助计划是这两项工作的规模化扩展，从实验室单点研究转向"全球独立研究者网络"协同推进。

## 申请要点

- **金额**：up to $10M total
- **截止**：2026-08-08
- **公布**：Autumn 2026
- **资格**：学术界 + 独立研究者（全球范围）
- **优先方向**：上述四大方向
- **背景契合度**：
  - Schmidt Sciences: Science of Trustworthy AI + AI Agents 计划
  - ARIA: Scaling Trust 计划（关注 cyber-physical multi-agent coordination）
  - Cooperative AI Foundation: cooperative AI 基础研究

## 相关主题

- [DiffusionGemma](/ch01-688-diffusiongemma-扩散式文本生成模型-google-26b-moe-4-推理加速/) — 同为 Google DeepMind 2026-06 公告
- Multi-Agent System Safety — 概念层（待创建）

## 一句话定位

**"单模型安全 → 种群级安全"**的研究范式转变 + 首个主要 AI 实验室联合公益机构的 $10M 多 Agent 安全研究资助计划

---

## Ch08.023 Cost of Consensus

> 📊 Level ⭐⭐⭐ | 3.5KB | `entities/cost-of-consensus.md`

## 核心发现
- 2.1-3.4x token 开销用于 Agent 间共识
- 共识成本是多 Agent 的主要开销来源

## 深度分析
Cost of Consensus 研究揭示了多 Agent 系统中一个关键但常被忽视的开销维度：**各 Agent 就任务结果达成共识所消耗的 token 成本，往往超过实际任务执行本身的成本**。2.1-3.4x 的共识开销系数意味着，在设计多 Agent 系统时，通信和协调成本必须被作为一等公民来对待。   ^[raw/minimax-agent-team-mavis-owner-worker-verifier]
**为什么共识如此昂贵**：多 Agent 共识的本质是"让多个 Agent 对同一个结论形成一致置信"。在缺乏全局真的情况下，每个 Agent 需要：(1) 理解其他 Agent 的推理过程；(2) 评估对方论点的有效性；(3) 调整自己的置信度或提出反驳。这需要大量的上下文传递和推理 token 消耗，远超单 Agent 独立决策的开销。   ^[raw/minimax-agent-team-mavis-owner-worker-verifier]
**这一发现在工程上的重量级**：如果共识开销是主要成本来源，那么多 Agent 系统的吞吐量瓶颈不在计算能力，而在 Agent 间的通信效率。优化方向应该指向：减少不必要的共识需求（Owner-Worker-Verifier 架构中 Verifier 只验证不参与讨论）、压缩共识消息的体积、减少共识轮次。   ^[raw/minimax-agent-team-mavis-owner-worker-verifier]
**与单 Agent 相比的战略含义**：在任务可以由单个 Agent 完成的情况下，引入多 Agent 共识往往会增加总成本而非减少。只有在以下场景多 Agent 共识才是合理的：(1) 任务需要多专业视角（如安全审查 + 性能审查 + 业务逻辑审查并行）；(2) 单 Agent 的置信度不足以支撑高风险决策；(3) 需要冗余和交叉验证来满足审计要求。   ^[raw/minimax-agent-team-mavis-owner-worker-verifier]

## 实践启示
1. **在系统设计阶段就把共识成本纳入评估**：比较"单 Agent 完成"vs"多 Agent 共识"的实际 token 成本，不要假设多 Agent 一定更优或更可靠。   ^[raw/minimax-agent-team-mavis-owner-worker-verifier]
2. **最小化共识范围**：只在关键决策点引入共识机制，非关键路径用单 Agent 决策。Owner-Worker-Verifier 模式中，Verifier 只做验证不参与讨论，可以显著降低共识开销。   ^[raw/minimax-agent-team-mavis-owner-worker-verifier]
3. **用结构化输出减少歧义**：当必须进行跨 Agent 通信时，使用严格定义的输出格式（JSON schema、状态机事件）而非自然语言，减少因歧义导致的反复确认。   ^[raw/minimax-agent-team-mavis-owner-worker-verifier]
4. **考虑异步共识而非同步轮询**：多 Agent 间的同步等待是成本最高的模式之一，改用事件驱动/消息队列的异步确认机制，可以在保持一致性的同时大幅降低空转开销。   ^[raw/minimax-agent-team-mavis-owner-worker-verifier]
5. **在需要高置信度的关键路径上使用多 Agent 共识**：涉及资金、身份、安全、高风险决策的环节，2.1-3.4x 的共识开销可能是值得支付的保险成本。   ^[raw/minimax-agent-team-mavis-owner-worker-verifier]

## 参考
- Minimax Agent Team Mavis

## 相关实体

- MOC

---

## Ch08.024 γ-World: 多 Agent 世界建模（NVIDIA Research）

> 📊 Level ⭐⭐⭐⭐ | 7.4KB | `entities/nvidia-gamma-world-multi-agent-world-model.md`

# γ-World: 多 Agent 世界建模（NVIDIA Research）

> **Background**: NVIDIA Research 2026-05 发布的生成式多 Agent 世界模型。支持独立可控、置换对称的多 Agent，实时 24 FPS rollout，两 Agent 训练可零样本泛化到四 Agent。

## 核心创新

### 1. Simplex Rotary Agent Encoding

- 3D RoPE 的无参数扩展
- 将 Agent 表示为旋转角空间中正单纯形的顶点
- 每个 Agent 获得独特相位
- 所有 Agent **置换等价**（permutation-equivalent）
- 无需学习 per-slot identity 或固定 Agent 顺序

### 2. Sparse Hub Attention

- 可学习 hub token 介导跨 Agent 通信
- **跨 Agent attention 成本从 quadratic 降到 linear**
- 支持 4+ Agent 高效扩展

### 3. Bidirectional Multi-Agent Distillation

- 双向多 Agent teacher 指导 block-causal student
- 蒸馏后可使用 KV cache 做流式推理
- 实时 24 FPS 动作响应

## 性能

- **24 FPS** 实时 rollout
- 零样本从 2-player 泛化到 4-player（**无额外训练**）
- 视频保真度优于 slot-based 和 dense-attention baseline
- 动作可控性 + 跨 Agent 一致性更优

## 适用场景

- 多人虚拟游戏（multiplayer environments）
- 真实世界多机器人协调
- 任何需要"多个智能体在同一演化世界中独立行动"的场景

## 与传统 World Model 的差异

| 维度 | 传统 World Model | γ-World |
|------|------------------|---------|
| Agent 数 | 1 (single-agent) | N (multi-agent) |
| Agent 控制 | N/A | 独立可控 + 置换对称 |
| Attention | dense / quadratic | sparse hub / linear |
| 推理速度 | 受限 | 24 FPS (real-time) |
| 泛化能力 | 固定 Agent 数 | 2 → 4 零样本 |

## 工程意义

- 解决了"多个 Agent 同时作用 + 共享一致世界状态"的可扩展性
- 实时性达到 24 FPS，可用于交互式应用
- 编码和 attention 设计可推广到其他多 Agent 任务

## 待关注

- 论文正式发表（当前为项目页）
- 训练数据规模
- 与其他多 Agent 框架（PettingZoo, Melting Pot）的对比

## 深度分析

### 1. 置换对称性：从归纳偏置到架构必然

传统多 Agent 模型依赖固定顺序或 per-slot 可学习标识来区分 Agent，本质上是一种弱归纳偏置。γ-World 的 Simplex Rotary Agent Encoding 将 Agent 身份编码为旋转角空间正单纯形的顶点，使置换对称性成为几何结构的自然推论，而非需要学习的性质。这种"无参数"设计意味着模型无需任何额外权重即可处理任意数量的 Agent 排列组合，从根本上消除了顺序偏差问题。

### 2. 线性 Attention 与多 Agent 可扩展性的本质联系

多 Agent 系统的核心瓶颈不在于单 Agent 推理能力，而在于 Agent 间的通信复杂度。Dense attention 要求每对 Agent 之间进行交互，当 Agent 数为 N 时，复杂度为 O(N²)。γ-World 引入可学习的 hub token 作为信息中介，将复杂度降至 O(N)。这一设计不仅降低了计算成本，更重要的是使得跨 Agent 信息传递不再受限于 Agent 数量——这正是从 2 Agent 到 4 Agent 零样本泛化的技术基础之一。

### 3. 蒸馏与 KV Cache 的联合优化

双向 teacher + block-causal student 的蒸馏路径并非简单模型压缩，而是针对流式推理的定向优化。block-causal 结构允许 KV cache 的复用，这意味着在多步 rollout 过程中，每个时间步只需计算新增 hidden state 而非完整序列。24 FPS 的实时响应依赖于这一机制——没有 KV cache，每次推理都需要重新计算全部历史 context，帧率将大幅下降。这提示多 Agent 实时系统可能需要将"因果推理结构"纳入架构设计的核心考量。

### 4. 世界一致性的分层维护机制

γ-World 解决了多 Agent 世界模型中的一个微妙问题：每个 Agent 独立行动，但共享的世界状态必须保持时间一致性。这通过将所有 Agent 的 action stream 作为统一输入、由单一模型生成共享 rollout 来实现——而非分别模拟每个 Agent 再试图融合结果。这种中心化生成、分布式控制的设计在保证世界一致性的同时，保留了 Agent 间的独立性。

## 实践启示

### 1. 在多 Agent 系统中优先考虑置换对称架构

如果你的多 Agent 系统可能遇到 Agent 数量或顺序变化，应尽早将置换对称性纳入架构设计。Simplex Rotary Agent Encoding 的思路可以启发类似的无参数标识方案——例如在多机器人协调任务中，不应依赖固定 Robot ID 而应让标识从任务结构中自然涌现。

### 2. 使用 Hub Token 模式改造现有多 Agent 通信

当系统中的 Agent 数量增长时，传统的全连接 attention 成为瓶颈。在智能家居、协作机器人或多玩家游戏等场景中，引入可学习的 hub token 中介通信可以在不牺牲信息传递完整性的前提下显著降低延迟。这一设计模式可以独立于完整世界模型被提取并应用于现有系统。

### 3. 为实时多 Agent 推理预留因果蒸馏路径

如果你正在构建需要低延迟响应的多 Agent 交互系统（如实时游戏 AI 或在线协作工具），应在设计早期就规划 teacher-student 蒸馏路径和 block-causal 结构。KV cache 的复用和多步 rollout 的效率优化是实现实时响应的关键技术，不应作为后期优化而忽视。

### 4. 利用零样本泛化减少多 Agent 系统的训练成本

γ-World 展示了从 2 Agent 到 4 Agent 的零样本泛化能力，这提示多 Agent 系统的训练策略可以从"针对固定配置训练"转向"针对最小配置训练 + 架构泛化"。在资源受限的场景中，可以用少量 Agent 收集数据训练，再依靠架构本身的能力泛化到更多 Agent。

### 5. 中心化生成 + 分布式控制是多 Agent 世界一致性的推荐范式

在构建多 Agent 仿真或游戏环境时，应避免分别模拟每个 Agent 再融合结果的方式。中心化的世界状态生成器能更可靠地维护跨 Agent 的一致性，同时允许 Agent 独立决策。这一范式在虚拟世界建模和数字孪生应用中具有广泛适用性。

## 相关实体
- [Anthropic Multi Agent Research System](/ch04-443-anthropic-multi-agent-research-system/)
- [Dipg Ant Insurance Host Research Verify Offline Closed Loop](/ch05-075-dipg-蚂蚁保-host-research-verify-三-agent-离线-verify-闭环-c-端-aigc/)
- [Nvidia Secure Local Agent Nemoclaw Openclaw](/ch04-339-nvidia-secure-local-agent-nemoclaw-openclaw/)
- Video Agent Paradigm Compute Talent Flywheel Ethan He 20260606
- [Baixing Ontoz Enterprise Ontology Multi Agent](/ch04-131-百型智能-ontoz-企业本体论-群智能体协同体系-出海企业数字大脑-palantir-中国类比/)

→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/nvidia-gamma-world-multi-agent-world-model.md)
- trump media
- MOC

---
