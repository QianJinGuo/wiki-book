---
source_url: https://mp.weixin.qq.com/s/HoStCq53XElBlbLU6uPTJA
ingested: 2026-06-10
sha256: 43a4ddeba1d8efb0e0d834e220d94b3c9f201a339e1a5b6cecdfb44f576aa025
title: "AI 不缺智商缺纪律:一场 Harness 工程化实践"
author: 杜学友
publisher: 阿里技术
publish_date: 2026-XX-XX
tags: [harness, harness-engineering, alibaba, enterprise, agent-orchestration, evaluation, claude-code, multi-agent]
---

# AI 不缺智商缺纪律:一场 Harness 工程化实践

**作者**: 杜学友 (阿里技术)

## 引言

**核心观点**: AI Coding 的瓶颈正从「模型能力」转移到「流程工程」——模型已经足够聪明,但不稳定,而稳定性必须由外部框架供给。

**读完你能带走**: 一套可抄的 harness 分层结构、一个「把流程当被测对象」的评测方法、4 条用代价换来的踩坑教训,以及一个能迁移到任何 AI 工作流的工程化模式。

**作者故事**: 我曾经用一个不断膨胀的 CLAUDE.md 解决 AI "不守纪律"的问题——把所有规矩写进去:先写单测、部署前评审、提交前合 master。它确实管用了三天。然后问题以更严重的形式回来了:规则多到"撑爆"上下文,模型读完规则就没"脑容量"读代码,于是它开始遗忘、串味、自我矛盾。

**那一刻我意识到**: 对付 AI 的不确定性,堆 prompt 是负债,做框架才是资产。这篇文章就是这套框架 (harness) 两个月的演进复盘。

## 01 — harness 是什么,它到底解决什么

**定义**: harness = 把「AI 该怎么干活」固化成可执行、可约束、可评测的工程框架。它和"写更好的 prompt"有本质区别:**prompt 是一次性的说服,harness 是结构性的约束**。模型供给智商,harness 供给纪律。

**三个痛点**: 用过 AI 编码的人大概率遇到过——AI 遗忘、AI 串味、AI 自我矛盾。

**结构性根因**: 
- VILA-Lab 对 Claude Code 的逆向工程揭示: Claude Code 的记忆**完全基于文件系统** (CLAUDE.md + JSONL 日志),没有向量数据库、没有 Embedding
- 上下文管理靠一条 **5 层渐进式压缩管线**——从裁剪低优先级提示、截断工具输出,一直到最后手段的全量模型摘要 (Auto-Compact),**流程状态细节恰恰会在这一层被丢失**
- Devin 的 CPO 在 Latent Space 播客中坦言: 当记忆达到数千条时,如何在正确的时机检索到正确的记忆——"尚未解决"

**Agent 遗忘三重根因**:
1. 压缩丢失 (Auto-Compact 省略"看似不重要"的流程步骤)
2. 检索失败 (记忆文件在但没被加载进上下文)
3. 指令遵循失败 (信息都在但模型仍然跳步)

**harness 的三层设计**(规则外置、状态持久化、门禁阻断)恰好对应这三个根因,逐一堵漏。

## 02 — 搭建:我的 harness 长什么样

**核心设计思想**: 把上下文当预算来管理。**主会话的上下文是最贵的资源,不是免费的草稿纸**。

**分层唯一标准**: 不是"按功能分类",而是"按何时被读取"——常驻的极小,深的按需加载。

### 2.1 常驻入口层:CLAUDE.md + CLAUDE.local.md

放角色、代码偏好、流程触发规则、G1–G8 门禁速查。关键设计是 `CLAUDE.local.md` 自包含、不依赖全局 `@import`:新项目接入只需拷一份模版进去就能独立运作。

- **解决**: 每个项目的流程规范彼此隔离、互不串味
- **效果**: 主会话常驻上下文压到 ≤8K,把宝贵窗口留给真正的代码

### 2.2 原子规则层:rules/ (7 个)

每个规则单一职责、可被按需引用。**每条规则都是一次事故的墓志铭**。坑只踩一次,之后由规则兜底——这是 harness 最朴素也最值钱的复利。

### 2.3 角色 Agent 层:agents/ (全套装配的发动机)

**核心设计**: 把一个"全能主会话"拆成一条职责清晰的流水线:

| 角色 | 职责 | 类比 |
|------|------|------|
| `dispatcher` | 读 state.json + workflow.yaml,决定下一步该调谁 | 交通警察,只管路由不管业务 |
| `orchestrator` | 读三角色写入 phases/*.md 的观点,合成结论 | 会议秘书,只管合成不管调度 |
| `requirement-analyst` | 业务评审 | 三角色之一 |
| `tech-architect` | 技术评审 | 三角色之一 |
| `quality-guardian` | 质量评审 | 三角色之一 |
| `plan-generator` | 流程执行第 1 步 | 从方案到验收 |
| `developer` | 流程执行第 2 步 | TDD 编码 |
| `verifier` | 流程执行第 3 步 | 跑 G1–G8 门禁 |
| `deployer` | 流程执行第 4 步 | 部署预发 |
| `tester` | 流程执行第 5 步 | 接口测试 |

**主会话退化原则**: 主会话应该退化成一个「什么都不想、只执行 dispatcher 指令」的纯执行器。**这是反直觉的**——我们本能地想让主模型更全能;但全能恰恰是污染之源。主会话不是能力不足,而是职责收窄,像微服务里的 thin controller,不是它不行,是它不该管。

**Devin 的对应思路**: Devin 从第一天就做了"脑机分离":推理("大脑")在沙箱外执行,执行环境("机器")无权访问大脑状态。Cognition 的评价是"更好的架构",**代价是状态管理更复杂**。

**杜学友的轻量化路径**: 不隔离进程,转而通过 **agent 职责隔离 + 文件交接** 达到类似效果。

**「薄主会话」三条铁律**:
1. 主会话只听 dispatcher: dispatcher 读 state.json 返回"下一步调谁",主会话照做,**禁止自己 Read phases/*.md / evidence.json**
2. 职责隔离: dispatcher 只管路由、orchestrator 只管合成、developer 只管编码、verifier 只管检查,每个 agent 的可用工具严格受限
3. 上下文 ≤8K: 主会话只加载 CLAUDE.md + 触发规则 + 最近一条 dispatcher 指令

### 2.4 按需上下文层:context/ (10 个)

完整流程详情、Pre-Mortem 模板、对抗辩论模板、证据链规范、TDD/ATDD 指南、记忆进化机制全放这层,**只在进入对应阶段时才被 Read**。

**理论支撑**:
- LLM 注意力呈 U 型分布,**中部信息准确率显著下降** (Stanford "Lost in the Middle", TACL 2024)
- 声称支持 32K+ 的模型**仅半数能在该长度保持可靠性能** (NVIDIA RULER)

**设计原则**: 上下文不是越大越好的「免费缓冲区」,是需要精心管理的稀缺资源。每份 context 只含该阶段所需最小集,用完即释放。**代价是依赖元数据质量**——context 文件描述写得模糊就会在该加载时漏加载,对策是 orchestrator 按阶段维护强制 Read 清单。

### 2.5 执行支撑层:skills/ (22 个) + commands/ (12 个) + evals/

**skills/ (22 个)**: 把内部 CLI 和研发工具链封装成 AI 可调用的能力。最核心的是 `ubase` 全家桶:一句"帮我看下 wrate 最近半小时的日志"就能自动拼 SLS 查询、做时间窗口换算、把命中结果聚类成异常摘要,而不是把原始日志全量灌回上下文。还有 `dev1-5` 需求开发全链路、`hsf-workflow` 接口测试流程、`setup-change-env` 一键建变更等。

**commands/ (12 个)**: slash 命令入口。`/init-harness` 一键接入新项目、`/harness-audit` 体检当前配置健康度、`/learn` 把踩坑经验沉淀成规则。

**经验三级进化** (auto-learn 规则驱动): 这是 harness "越用越聪明"的核心机制。以 `mvn -am 卡死` 为例——
- 第一次踩坑写成 **lesson** (单次记录)
- 第二次在不同项目又遇到,归纳为 **pattern** ("Mac + system-scope 依赖 = 禁用 -am")
- 第三次验证后晋升 **instinct**,自动注入所有新项目的 `build.md` 规则

**每一级晋升都需人工确认**,防止错误经验扩散。

### 2.6 稳定性支点:eval 检测 + hook 拦截

**核心论点**: 让 harness 真正稳定的不是规则本身,是**验证机制**。

**理论支撑 (arxiv 2605.29682)**: 原始 token 消耗和工具调用仅解释 agent 成功率方差的 **R²=0.33~0.42**,而**验证反馈质量 (Effective Feedback Compute) 达到 R²=0.94~0.99**。换句话说: 决定 AI 干活靠不靠谱的并非「给它多少预算」,而是「检查做得多好」。

**两个机制**:
- **G1–G8 门禁墙 (eval 式硬校验)**: 每个门禁是确定性的 Python 函数,检查产物存不存在、编译过不过、单测通没通。verifier agent 跑完后写 `phases/verification.json`,任一 gate FAIL 则流程退回 DEVELOPING——**不是"建议",是"阻断"**。
- **hook 拦截 (运行时硬约束)**: Claude Code 的 hook 机制在工具调用执行前拦截。① 状态文件写操作只允许编排层 agent 触发 (其他绕过直接 reject); ② 危险操作 (git push --force、rm -rf) 弹确认。

**业界共识**: 
- sd0x-dev-flow 总结为四个关键词: "**hook-enforced dual review, state-machine gates that survive context compaction, and fail-closed safety**"——"survive context compaction" 直接针对 Claude Code Auto-Compact 阶段丢失流程状态的问题
- Apache Burr (已进入 Apache 基金会) 把这个模式做成通用框架: 每个 Agent 决策表达为状态机节点 + 可插拔持久化 + 实时追踪 UI

**核心原则**: 流程强制执行必须从 LLM 推理中外置到确定性基础设施。不能依赖模型"记住"该执行哪个步骤——**门禁必须是确定性代码,独立于上下文窗口,fail-closed** (默认拒绝,只放行显式允许的操作)。

### 19 节点标准研发链路

需求评审 → 需求确认 → 方案设计 → 方案确认 → Pre-Mortem → 实施计划 → 验收标准确认
→ 拉变更 → 建分支 → 建 worktree → 开发 → 编译 → 单测 → ATDD → 证据链
→ 部署预发 → 接口测试 → 上线确认 → 验收报告

**动态裁剪**: 不是每个需求都走全 19 步——由 **意图 × 风险** 决定。

**硬规则**: "改完必部署"——只要检测到真实业务代码改动,自动把部署预发、接口测试追加为必需节点。

**当前边界 (诚实声明)**: 流程止步于预发部署 + 接口测试 + 验收报告,**online (G8 生产上线) 节点不强制**。原因是生产发布涉及灰度策略、流量切换、线上回归——目前这些动作的"出错成本"远高于让 AI 自主操作的"效率收益",所以**由人兜底**。

**下次演进**: AI 自主完成预发验证 → 触发生产发布 → 观测线上指标 → 产出线上验收报告,把 G8 从「人工确认」进化为「AI 执行 + 人工兜底」。

## 03 — 打磨:从「能用」到「好用」的关键几跳

**作者反思**: 上面是成品。但它不是设计出来的,是被现实一路逼出来的。**每一阶段的切换都并非优化,而是止损**。**核心转变只有一句话**: 从「用更多的字约束 AI」,到「用更好的结构约束 AI」。

### 第一阶段 · 拿来主义

起点是开源。用 oh-my-claudecode、everything-claude-code 等社区项目的 OpenSpec 规范直接上手。很快碰到天花板: 通用规范覆盖不了我的开发流程 (需求分析 + 技术方案 + 验收标准 + 开发 + 单元测试 + 项目环境预发流水线 + 自动化验证),边界情况全靠临场补丁。

**触发词**: 每次我要写的额外 prompt 比规范本身还长时,就意味着该自己造了。

### 第二阶段 · 重 prompt 约束

最初思路极其朴素: 把所有流程规矩写进 CLAUDE.md,让 AI 按步骤一步步走。三天后,**崩了**:
- **不听话**——规则太多,模型开始"选择性遵守"
- **上下文爆炸**——所有规则常驻窗口,留给实际代码的空间被挤压
- **自我矛盾**——规则间偶尔冲突 (比如"快速修复走简化路径" vs "所有改动必须走评审"),模型不知道听谁的

**核心教训**: prompt 约束是说服,不是强制。模型"理解"了规则不等于"遵守"了规则——**你无法用更多的字来对抗概率性的遗忘**。

### 第三阶段 · 减负 + 分层加载

**给 harness "减负"**: 把常驻 prompt 从"全流程指令手册"砍到只剩角色定义 + 触发规则,压到 ≤8K。深度内容 (TDD 指南、Pre-Mortem 模板、对抗辩论规范) 全部移到 `context/` 层,只在进入对应阶段时才 Read 进来。

**效果立竿见影**: 主会话不再被规则淹没,模型终于有"脑容量"去理解代码了。**但新问题在长程会话中暴露了**——写了几百行代码、跑了几十次工具调用之后,上下文被业务代码和工具输出逐渐填满,规则虽然还在但已经被稀释到**注意力衰减区**。

### 第四阶段 · Agent 调度编排

**最后一跳是认知上最大的转变**: 不再约束模型"你该怎么做",而是让不同的 agent **各司其职、互相制衡**。

核心设计: 一个 dispatcher (流程驱动器) 作为大脑,只负责"算下一步该谁上场";其他 agent 各管一段——三角色评审独立思考互不串味、developer 只管编码不管流程、verifier 只管检查不管实现。**第二章描述的"笨主会话"原则,在这里真正落地了**。

**一次高强度全天重构验证**: 状态外置、决策收敛给 dispatcher,即使单次会话崩了、上下文被压缩了,**状态不丢、流程能续**。

**24 agent 的代价**: 每个 agent 的 system prompt 本身就是一个"小型 CLAUDE.md",规则指令占满上下文后留给实际任务的空间反而更少;agent 间转交多、调试链路长、维护心智负担大。后续把 intent-classifier / debate-moderator / pre-mortem 等流程节点合并入主干 agent,精简冗余的中间调度层。

### 三条路:为什么选文件交接而不是现成编排

**Claude Code 原生提供两种多 agent 机制**, 杜学友逐一试过后走了第三条路:**dispatcher 状态机 + 文件系统交接**。核心原因: **harness 本质上是控制平面,不是计算平面**。

| 机制 | 优势 | 致命伤 | 适合场景 |
|------|------|--------|----------|
| **Workflow** (JS 脚本编排) | 确定性控制流 (循环/条件/扇出)、高并行 pipeline() / parallel()、schema 强校验 | ① Bash 默认 120s 超时 (最大 10 分钟),TDD/Maven 长构建被静默杀死,只返回 null ② 无 `askUser` 交互原语 ③ 跨 session 不可续 | **单阶段、无人工交互、可在超时窗口内完成的计算任务** (如三角色并行评审) |
| **Agent Team** (消息驱动团队) | 多 agent 并行 | 松散协调无确定性工序保证、状态散落在 TaskList、SendMessage 是"通知"不是"阻断" | **多人并行改多模块** |
| **dispatcher + 文件交接** (本方案) | 天然持久化、可审计、强一致性 | 每次 agent 切换需 Read 上一步产物 (~2-5K tokens IO 开销)、并行受限于文件交接序列化 | **控制平面:有状态工序链 + 人工门禁 + 跨天续跑** |

**dispatcher + 文件交接三个硬优势**:
1. **天然持久化**——进程崩了文件还在,跨天需求 `Read state.json` 即续
2. **可审计**——每步产物都是人可读的 markdown,`git diff` 一眼看清楚谁在哪步写了什么
3. **强一致性**——state-keeper 单写者 (hook 拦截其他写者) + ajv schema 校验前置,从架构层面消除多 agent 写冲突

**结论**: 三种机制正交互补。**Workflow 管计算平面** (高并行单阶段),**Team 管协作平面** (多人独立任务),**dispatcher + 文件交接管控制平面** (有状态工序链 + 人工门禁 + 跨天续跑)。

**当前实验方向**: 混合编排——dispatcher 管控制流,Workflow 加速三角色评审等纯计算环节。

## 04 — 评测:把流程作为被测对象

**核心理念**: 评测平台是**评估者,不是执行者**。它只检测被试 claude 是否走完了 harness 的每个节点 (产物在不在、门禁过没过),而**绝不替它去执行部署或测试**。一旦平台开始"帮忙干活",它就失去了客观裁判的资格。

**三条互不串联的轨道** (按"用 harness 的三种姿势"分)。

### 评分引擎:7 维确定性评分

**核心特征**: 100% Python 确定性逻辑、零 LLM 调用、3 次跑分 hash 完全一致。

**设计来源**: SWE-bench (用测试通过率验证代码改动)、AgentBench (用工具调用效率衡量 agent)、Anthropic Eval Guide (双评分器对抗偏差)、CMMI (流程域成熟度)。

**7 维评分**:
1. 流程完整性 (22%, 最高权重之一) — 不靠"模型说做了",要靠"产物文件在不在"——**文件系统不会说谎**。按 intent×risk 裁剪必需节点: QUERY 不要求任何产物 (满分)、BUG_FIX/LOW 只查 5 个节点、FEATURE/HIGH 查满 19 个
2. 代码正确性 (22%, 最高权重之一) — 用 amaven + jdk 真编译、真跑单测。对比 evidence.json 的自报结果和真实编译结果,计算"诚实度差距" (honesty gap)——AI 声称 G3 通过但编译其实挂了,这个差距就会暴露
3. 评审充分性
4. 验证质量
5. 部署完整性
6. 文档一致性
7. 经验沉淀度

**核心论点**: 宁要可复现的「粗糙分」,不要会漂移的「精准分」。评测的唯一目的是驱动迭代——只有 3 次跑分完全一致,才能回答"这次改规范到底变好还是变坏"。

**反直觉坑**: 最初图"干净",给评测配了空的隔离 Maven 仓库,结果依赖全解析失败、**恒为 0 分**;换回共享本地 6.9G 的 `~/.m2` 缓存离线复用才跑通。**评测环境越"干净",反而越不真实**。

### 自进化闭环

有了确定性分数,harness 的自进化闭环才能转起来:
**创建** (AI 生成 / fork) → **评测对比** (7 维 × 多 case) → **激活基线** (留备份可回退) → **收集弱项维度再优化**。

**极致玩法**: 让 AI 拿"好配置"去改"待优化配置"生成候选版本——**用 AI 优化约束 AI 的规则,再用确定性分数验证优化是否有效**。

## 05 — 还能怎么提升:诚实的代价与边界

**作者诚实声明**: 这套系统最大的风险不在于「不够准」,在于「假装它覆盖了一切」。

**调研中看到的业界前沿方向**:
- **结构化记忆层**: VikingMem (VLDB 2026, ByteDance) 证明: **更少的 Token 留存 + 更智能的组织 > 全量保留** (16.82% Token 留存得分 75.80,朴素 RAG 100% 留存仅 63.81)。Sverklo 的双时态记忆 (valid_from_sha / valid_until_sha) 可让 harness 精确回答「在 commit X 时 Agent 知道什么」
- **代码知识图谱**: Codebase-Memory-MCP 通过多轮 AST 分析构建持久化知识图谱 (13+ 节点类型、18+ 边类型)。虽然其声称的「99.2% Token 减少」在对抗验证中被证伪,但**架构模式本身对 AI Coding 场景有价值**
- **编排形态 A/B 对比**: v-agentwf-nodecomp (agent 编排) vs v-dynwf (dynamic workflow)——**由评测分数决定优劣,不靠拍脑袋**

**核心金句**: 能「用实验回答架构之争」这件事本身,就是评测平台最大的价值。

## 06 — 结语:一个可迁移的模式

**两个月最大的收获**: 任何「能力够强但输出不稳定、且过程可观测」的 AI 工作流,都可以被这样工程化——给它**分层的约束、外置的状态、确定性的评分**,让每一次改动都能被证明是进步还是退步。

**边界**: 这个模式依赖「过程可观测」。如果一个 AI 任务的中间产物无法落盘、无法检测 (比如纯创意生成),这套打法就会失效;而它的价值也会随模型进化而衰减——**当模型强到能自我保证流程纪律的那天,harness 就该功成身退**。

**作者立场**: 但那一天还没来。在此之前,我们这些工程师的主场依然清晰——模型负责聪明,我们负责让它守纪律。

## 参考资料

1. VILA-Lab 对 Claude Code 的逆向工程 — https://github.com/VILA-Lab/Dive-into-Claude-Code
2. Latent Space 播客 — Cognition's Walden Yan & OpenInspect's Cole Murray — https://www.latent.space/p/cognition
3. Lost in the Middle: How Language Models Use Long Contexts — https://arxiv.org/abs/2307.03172
4. RULER: What's the Real Context Size of Your Long-Context Language Models? — https://arxiv.org/abs/2404.06654
5. Scaling Laws for Agent Harnesses via Effective Feedback Compute — https://arxiv.org/abs/2605.29682
6. sd0x-dev-flow — https://github.com/sd0xdev/sd0x-dev-flow
7. VikingMem (VLDB 2026, ByteDance) — https://arxiv.org/html/2605.29640v1
8. Sverklo — https://github.com/sverklo/sverklo
9. Codebase-Memory-MCP — https://github.com/DeusData/codebase-memory-mcp
