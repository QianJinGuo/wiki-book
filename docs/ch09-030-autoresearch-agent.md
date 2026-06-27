# AutoResearch：多 Agent 自动化软件开发

## Ch09.030 AutoResearch：多 Agent 自动化软件开发

> 📊 Level ⭐⭐ | 14.6KB | `entities/autoresearch-multi-agent-software.md`

## 核心命题
Karpathy AutoResearch 把 ML 研究变成"写 train.py → 跑 5 分钟实验 → val loss 改善才保留"的自动循环。本项目将此方法迁移到软件开发：GitHub Issue → 多 Agent 交叉审核 → 5 维度量化评分达标 → 自动 PR + 合并。约 10 分钟完成中等复杂度 Issue，全程零人工干预。

## 核心对比：AutoResearch vs 传统 Agentic Coding
| 模式 | 循环方式 | 质量保证 | 人的参与 |
|------|---------|---------|---------|
| 传统 Vibe Coding | 单 Agent 自己写、自己改 | 测试 backpressure | 全程绑在循环里 |
| Ralph Wiggum | 单 Agent 自主循环 | 无外部审核视角 | 每轮重新开始，不记上轮错误 |
| Karpathy AutoResearch（ML） | 单 Agent 自主循环 | val loss 量化 + git revert | 极低（program.md 定义目标） |
| **本项目（Software）** | **多 Agent 交叉审核** | **5 维度量化评分 ≥ 9.0** | **极低（仅 Issue 号）** |

## 三大关键改进
### 1. 多 Agent 交叉审核
Codex 和 Claude 轮流担任实现者和审核者（A 写完 B 审，B 写完 A 审），交叉验证减少单 Agent 盲区。实践证明单 Agent 效果远不如双 Agent 交叉审核。

### 2. 5 维度加权评分
总分 10 分，≥ 9.0 才合并：
| 维度 | 权重 | 得分规则 |
|------|------|---------|
| 功能正确性 | 35% | 无问题 10 / 建议改进 9 / 一般问题 7 / 严重问题 4 / 致命问题 1 |
| 测试充分性 | 25% | 同上 |
| 代码质量 | 20% | 同上 |
| 安全性 | 10% | 同上 |
| 性能 | 10% | 同上 |

### 3. 审核反馈驱动下一轮
每轮审核反馈直接注入下一轮 Agent 提示词，Agent 针对性改进上轮具体问题，而非盲重试。

## 系统架构：4 阶段
```
Phase 1: 环境准备（一次性）
  └─ 检查依赖 (gh, acpx, go) → 获取 Issue → 创建分支
Phase 2: 迭代核心（完全自主）
  奇数轮: Codex 审核 → Codex 实现 → 测试 → Claude 审核 → Claude 实现
  偶数轮: Claude 审核 → Claude 实现 → 测试 → Codex 审核 → Codex 实现
  评分 ≥ 9.0 → Phase 3 / 评分 < 9.0 → 反馈驱动下一轮
Phase 3: 自动提交
  └─ git commit + push → gh pr create → gh pr merge
Phase 4: 记录归档
  └─ results.tsv + workflows/issue-N/log.md
```

## program.md：Agent 宪法
定义 Agent 的权限边界和约束——本质上是给 Agent 的"研究章程/操作手册"，与 Skill 的 description 有类似作用但更底层。
**权限边界示例**：

- 可以：修改 internal/、cmd/；创建/修改测试文件；运行测试和 lint；创建本地分支和 commit
- 不可以：修改 go.mod/.github/Makefile；删除现有文件；推送远程；修改规则文件本身

## 与 Harness Engineering 的关系
本项目本质上是软件开发场景的 **Harness Engineering**：program.md = 宪法级约束，审核评分 = 量化验收标准，反馈驱动 = 自动化修正循环。Codex/Claude 在 Harness 内自主运行，评分达标前不退出。

## 新增洞察：2026-05-18 百度Geek说版本
**新增内容（鸟窝/百度Geek说）：**

- **opencode 支持**：可配置 1-3 个任意 Coding Agent 组合进行交叉审核，不再限于 Codex/Claude 二人组
- **program.md 权限边界详解**：明确列出 Agent 可做/不可做的事（不能修改 go.mod/.github/Makefile，不能删除文件，不能推送远程）
- **退火重试机制**：指数退避 + 随机抖动，最大 60 秒，最多重试 10 次；连续失败 ≥ 3 次停止运行
- **Issue 选择策略**：排除 wontfix/duplicate/invalid/blocked/needs discussion/on hold/external，优先级计算 = 基础(15) + 标签 + 类型 + 时间因子
- **与达尔文.skill（花叔）的关联**：Skill 开发领域同样应用 AutoResearch 方法（auto-optimize-skill 项目），三者核心机制相同但质量保证机制各有侧重
- **达标线 9.0/10**：5 维度评分（正确性35%+测试25%+代码质量20%+安全10%+性能10%），Claude/Codex 轮流担任实现者和审核者
**已入库旧文（2026-04）：**

- source_url: https://mp.weixin.qq.com/s/JFvYo9RCn9Xm8ilx1Chd6g（鸟窝/高可用架构）
- 评分 value=8, confidence=8 → 56分（strong）
**合并判断：** 新文相比旧文增加了大量工程细节（权限边界、退火重试、Issue选择策略、opencode扩展），是已有的质量提升而非重复。合并入库，两文均为同一作者（鸟窝）的同一主题深度覆盖。

## 新增洞察：2026-05-23 AutoResearch 方法论全景
**新增内容（白白小白/知乎，转载）：**

- **四种 AutoResearch 循环类型**（四维通用框架的"搜索拓扑"维度）：
  - **线性循环（Keep-or-Discard）**：Karpathy AutoResearch（ML）— 固定5分钟预算，val loss 量化，简洁但易陷入局部最优
  - **树搜索循环**：AIDE、AI Scientist v2 — 维护搜索树，支持回溯和多方向并行，避免单路径饿死
  - **遗传进化池循环**：FunSearch、AlphaEvolve、GEPA — 维护候选种群，MAP-Elites 保留各 niche 最优；GEPA 用文本反馈替代标量奖励驱动突变
  - **异步多 Agent 进化循环**：CORAL — 多 Agent 独立运行完整搜索循环，通过共享持久记忆（attempts/notes/skills/ 三目录）间接协调
- **四维通用分析框架**（评估任意 AutoResearch 系统的元框架）：
  - 搜索拓扑：线性/树形/遗传池/异步并行
  - 反馈信号：标量奖励 → 结构化指标 → 文本反馈（信息密度递增）
  - 记忆架构：无记忆/Git历史/解树/文件系统池/知识图谱
  - 决策主体：人类硬编码 → LLM 突变算子 → LLM 自主策略选择
- **CORAL 共享记忆三目录**：attempts/（JSON，按 commit hash 索引历史评估）、notes/（Markdown，观察和反思）、skills/（可复用过程和工具）
- **AIDE 三算子**：Draft（从零生成全新方案）、Debug（修复 bug 节点）、Improve（对已运行节点做 atomic improvement）
**合并判断：** 现有 entity 专注软件工程实现，本篇补充 ML/AI 研究前沿的 AutoResearch 方法论全景，两者互补。merge 后完整覆盖"软件工程实现 + ML研究方法论"两个维度。

## 深度分析
### 1. AutoResearch 本质：量化目标驱动的自主循环
Karpathy AutoResearch 的核心是把"什么是改进"量化成 val loss，只有改善才保留，否则 git revert。迁移到软件开发后，本项目用 5 维度加权评分（≥ 9.0/10）替代单一 metric，本质上做的是同一件事——**把质量判断从主观变成可计算的数字**。

### 2. 多 Agent 交叉审核的必要性
单 Agent 自审（无论是 Ralph Wiggum 还是 Karpathy AutoResearch）存在固有盲区：同一个模型的生成和审核用同一套知识体系，容易漏掉视角缺陷。本项目的核心洞察是**不同模型有不同的盲区和强项**，Codex 和 Claude 交叉审核能发现单 Agent 发现不了的问题。实践也证明单 Agent 效果远不如双 Agent 交叉审核。opencode 扩展允许 1-3 个任意 Coding Agent 组合，进一步放大了这种多样性价值。

### 3. 反馈驱动 vs 盲循环
Ralph Wiggum 方法的每轮循环是独立的——新上下文重新开始，不记得上轮犯了什么错。本项目的审核反馈直接传入下一轮 Agent 的提示词，Agent 看到上一轮的具体问题后针对性改进。这个机制将迭代效率从"掷骰子"提升到"有方向地试错"。

### 4. program.md 作为"宪法级约束"
program.md 定义了 Agent 的权限边界和操作规范，本质上是给 Agent 的"研究章程/操作手册"。权限边界的清晰定义（如不可修改 go.mod/.github/、不可推送远程、不可删除文件）防止 Agent 越界操作，同时保留了其自主修改 internal/ 和 cmd/ 的能力。这种"最小权限+最大自主"的设计是 Harness Engineering 思想的具体实践。

### 5. 与 Harness Engineering 的深层联系
本项目本质上是**软件开发场景的 Harness Engineering**：program.md = 宪法级约束，审核评分 = 量化验收标准，反馈驱动 = 自动化修正循环。Codex/Claude 在 Harness 内自主运行，评分达标前不退出。这与 [Harness Engineering Long Term Agent Tasks](/ch04-160-harness-engineering-让-coding-agent-可靠完成长程任务/) 描述的"让 Agent 产出可预期、可衡量、可持续"高度一致。

### 6. 质量优先级设计的工程考量
5 维度权重分配（正确性35%、测试25%、代码质量20%、安全10%、性能10%）反映了软件工程的质量优先级：功能正确最重要，测试其次，代码规范第三，安全和性能各占一席之地。这个权重体系不是拍脑袋而是工程实践的沉淀——错误的功能比性能问题更致命，测试覆盖不足会在未来引发更多回归。

## 实践启示
### 1. 从小 Issue 开始验证流程
建议先用简单的 bug fix 类 Issue 测试完整流程，积累信心后再处理复杂的功能请求或重构任务。小 Issue 验证了流程可靠性，大 Issue 才能发挥多 Agent 交叉审核的最大价值。

### 2. 保持 program.md 随实操迭代更新
program.md 不是一次性定义完毕的静态文件。根据实际运行效果调整规则和约束——如果评分机制不符合预期、或者某些权限边界需要调整，就修改 program.md。这是让系统越来越顺滑的关键维护动作。

### 3. 关注评分趋势而非单轮分数
每次迭代的评分记录在 log.md 中，观察是否稳步上升比关注某一次的具体分数更有意义。如果评分长期停滞，说明当前方法有系统性问题，需要调整 program.md 或评分标准，而非继续盲目迭代。

### 4. 善用多 Agent 对抗机制
Codex/Claude 轮流实现+审核的模式本质上是交叉验证。充分利用这一机制：让实现者和审核者保持不同的关注点，审核者的职责是发现实现者忽略的边界情况和异常场景。opencode 支持 1-3 个任意 Agent 组合，可以根据项目特点选择最合适的搭配。

### 5. 退火重试机制是生产级可靠性保障
API 不稳定时的指数退避+随机抖动（最大 60 秒、最多 10 次重试）和连续失败≥3次停止的保护机制，是将实验性项目变成生产级工具的关键。这些细节保证了系统在网络抖动或 API 临时故障时不会失控。

### 6. Issue 选择策略决定自动化成功率
不是所有 Issue 都适合自动化——排除 wontfix/duplicate/invalid/blocked/needs discussion/on hold/external，保留标题不含 [WIP]/[DRAFT]、正文不含 DO NOT IMPLEMENT 的 Issue，是保证自动化不被脏数据干扰的第一道防线。优先级计算（基础+标签+类型+时间因子）确保最值得处理的 Issue 优先被自动化。

### 7. AutoResearch 思想可迁移到其他领域
本项目和达尔文.skill（Skill 优化）、Karpathy AutoResearch（ML 研究）三者核心机制相同——量化目标+自动迭代+只保留改进。这个模式可以被迁移到任何可以用量化指标定义"改进"的领域：测试自动化、文档生成、数据管道优化等。关键是要找到那个可以被量化的核心 metric。

## 相关主题
- [Hermes Agent](/ch04-418-hermes-agent/) — 自进化机制与 AutoResearch 的"只保留改进"思想同源
-  — Harness Engineering 让 Agent 产出可预期、可衡量、可持续
- [Thin Harness Fat Skills](/ch05-063-thin-harness-fat-skills-ai工程架构的本质/) — Fat Skills + Thin Harness 架构与 program.md 宪法约束异曲同工
- [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/autoresearch-software-development.md)

## 相关实体
- [快手首个打工人Agent](/ch01-009-快手首个打工人agent/)
- [Enterprise Software Moats in the Agent Era — 系统性护城河分析框架](/ch04-184-enterprise-software-moats-in-the-agent-era-系统性护城河分析框架/)
- [factory mission multi agent architecture](/ch01-864-factory-mission-multi-agent-architecture/)
- [基于多智能体架构的深度思考交易系统](/ch04-205-构建基于多智能体架构的深度思考交易系统/)
- OpenClaw 多智能体团队搭建实战经验
- [龙虾装上了可以用来干啥 - OpenCLAW 多智能体团队搭建经验](/ch04-038-openclaw-multi-agent-team-practice-v2/)
- [Claude Code 可控性：软规则无法变成硬约束](/ch09-067-claude-code-可控性-软规则无法变成硬约束/)
- [claude-code-agent-view](/ch09-001-claude-code-agent-view/)
- [深入理解 Claude Code 源码中的 Agent Harness 构建之道](/ch01-367-claude-code-harness-deep-understanding/)
- [两万字详解Claude Code源码核心机制](/ch09-056-两万字详解claude-code源码核心机制/)
- [Claude Code 设计原则与对照分析](/ch01-403-claude-code-设计原则与对照分析/)
- [Claude Code 大型代码库最佳实践 — Anthropic 企业级部署指南](/ch09-053-claude-code-大型代码库最佳实践-anthropic-企业级部署指南/)
- [Boris Cherny 新访谈：开发工具正在从 IDE 变成 Agent 控制台](/ch04-126-boris-cherny-新访谈-开发工具正在从-ide-变成-agent-控制台/)
- [Harness如何支撑Agent在生产环境稳定运行？](/ch04-127-harness如何支撑agent在生产环境稳定运行/)
- [Agent 原理、架构与工程实践](/ch04-435-agent-engineering-principles-architecture-practice/)
- MOC

---

