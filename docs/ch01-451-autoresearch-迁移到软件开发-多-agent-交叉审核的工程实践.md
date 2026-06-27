# AutoResearch 迁移到软件开发：多 Agent 交叉审核的工程实践

## Ch01.451 AutoResearch 迁移到软件开发：多 Agent 交叉审核的工程实践

> 📊 Level ⭐⭐ | 7.9KB | `entities/autoresearch-software-development.md`

# AutoResearch 迁移到软件开发：多 Agent 交叉审核的工程实践

→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/autoresearch-software-development.md)

## 摘要

鸟窝（smallnest）2026 年开源的 `autoresearch` 项目：把 Karpathy 的 AutoResearch（ML 研究自动化）思路迁移到软件开发领域，核心创新是用 Codex 和 Claude 交叉审核 + 5 维度加权评分 + 审核反馈驱动下一轮，实现"Issue 自动实现+审核+合并"的完整闭环。

## 核心要点

- **三大关键改进**：①多 Agent 交叉审核（Codex 和 Claude 轮流做实现者和审核者）②5 维度加权评分（功能正确性 35% + 测试充分性 25% + 代码质量 20% + 安全性 10% + 性能 10%）③审核反馈驱动下一轮（不是盲循环，而是把上一轮问题传入下一轮 prompt）。
- **4 阶段流水线**：Phase 1 环境准备（检查依赖、获取 Issue、创建分支）→ Phase 2 迭代核心（多 Agent 轮流实现+审核、测试验证、评分判定，完全自主）→ Phase 3 自动提交（评分达标后自动 commit + PR + 合并）→ Phase 4 记录归档（写入 results.tsv 和 log.md）。
- **达标线**：总分 ≥ 9.0 才合并。各维度评分标准：无问题 10 / 建议改进 9 / 一般问题 7 / 严重问题 4 / 致命问题 1。
- **实战结果**：Issue #21（中等复杂度）3 轮迭代约 10 分钟完成评分 9.0/10；Issue #15 2 轮迭代评分 9.1/10；Issue #6（高复杂度）5 轮迭代评分 15/10（Codex 和 Claude 均给出最高分）。
- **program.md 权限边界**：Agent 可修改 internal/、cmd/、测试文件、运行测试和 lint、创建本地分支；不可修改 go.mod、.github/、Makefile、CI/CD、删除文件、推送远程、修改 autoresearch/ 规则文件。

## 深度分析

### 从 ML 研究自动化到软件开发自动化的迁移逻辑

Karpathy 的 AutoResearch 核心思想是：给 AI Agent 一个真实的小型 LLM 训练环境（单 GPU，5 分钟训练预算），让它自主修改 train.py → 跑实验 → 检查结果，只有 val loss 改善时才 commit，否则 git revert 回滚。 三个核心要素：①量化目标（val loss 是唯一判断标准）②自主循环 ③只保留改进（退化就回滚）。这个模式之所以能在 ML 研究中成功，是因为 ML 训练有明确的量化指标（val loss），而软件开发的"代码质量"缺乏统一量化标准——这正是鸟窝项目要解决的核心问题。

### 多 Agent 交叉审核的工程价值

单 Agent 自审的效果远不如双 Agent 交叉审核——这是项目实践中最重要的发现之一。 不同模型有不同的盲区和强项：Codex 在某些场景下表现更好，Claude 在另一些场景下更优；让它们轮流担任实现者和审核者，能发现单 Agent 看不到的问题。但这个设计的代价是 token 消耗翻倍——审核 Agent 也要调用完整的工具链。因此，鸟窝引入了 5 维度加权评分机制，让审核 Agent 的输出可量化、可比较。

### 5 维度加权评分的工程取舍

5 维度的权重分配（35/25/20/10/10）反映了软件工程中"功能正确 > 测试 > 质量 > 安全 > 性能"的优先级。 这个分配不是随意的——功能正确性是合并的硬门槛（任何致命问题都会让评分跌至 4 分以下），测试充分性是回归保护，代码质量影响长期维护成本，安全和性能虽然在权重上偏低，但任何维度的"致命问题"都会把该项拉到 1 分（5 项相加最多 80 分，远低于 9.0 达标线），所以实际权重更像是"安全/性能是合并否决项"。这种加权评分的设计哲学：把"必须满足"和"应该满足"分开量化。

### 审核反馈驱动 vs 盲循环：信息流的本质改进

传统 Agent 循环的最大问题是"盲循环"——每轮都是独立尝试，不知道上一轮为什么失败。 鸟窝的改进是把审核反馈直接传入下一轮 Agent 的 prompt，让 Agent 看到上一轮的具体问题（功能不正确？测试覆盖不足？安全漏洞？）后针对性改进。这种"局部最优搜索 + 信息传递"的模式，本质上把 Agent 循环从"独立采样"变成了"梯度下降"——虽然不是真的梯度，但每一轮都基于上一轮的反馈做局部调整，避免在同一个错误上反复尝试。

### 4 阶段流水线的工程取舍

项目刻意把流水线切成 4 个独立阶段，而不是一个端到端的循环。 这种切分的工程价值：
- **可观测性**：每个阶段有明确的输入输出，失败时可以定位到具体阶段
- **可中断性**：Phase 2 评分不达标时，可以停在 Phase 2 不进入 Phase 3，避免无效 commit
- **可审计性**：Phase 4 归档 results.tsv 和 log.md，每次迭代都有完整记录，方便后续复盘

这是典型的"工作流引擎 + Agent"的混合架构——用确定性代码管控制流（阶段切换、合并、归档），用 Agent 管创造性任务（实现、审核、评分）。

### 权限边界设计：为什么 Agent 不能修改 autoresearch/ 规则文件

program.md 的权限边界设计 体现了"防止 Agent 改写自己的规则"这一安全原则。如果 Agent 可以修改 go.mod，可能引入依赖混乱；如果可以修改 autoresearch/ 规则文件，可能降低审核标准让自己通过。这两类操作必须由人类或外部流程控制。这种"安全护栏 + 创造性空间"的二元划分，是 Agent 自治系统的通用设计模式。

## 实践启示

1. **量化目标优先**：在搭建 Agent 自动开发系统前，先定义"什么算改进"的量化指标。没有量化指标，Agent 循环就是盲循环，token 消耗无法收敛。
2. **多 Agent 交叉而非单 Agent 自审**：单 Agent 看不到自己的盲区。引入第二个 Agent 做审核者，能显著提升代码质量——代价是 token 翻倍，根据场景权衡。
3. **加权评分优于二元判定**：不要用"通过/不通过"的二元判定，引入多维度加权评分能更精细地区分"必须修复"和"建议改进"，避免 Agent 在细节上反复纠结。
4. **审核反馈驱动下一轮**：每轮 Agent 的 prompt 必须包含上一轮的失败信息。这是从"采样"到"搜索"的关键转变。
5. **权限边界要硬编码**：Agent 可修改的文件清单和不可修改的文件清单，必须写在 program.md 里硬编码，不能由 Agent 自己判断。

## 相关实体

- [OpenClaw 多 Agent 协同开发](../ch04-199-openclaw-完全指南)
- [Karpathy Agentic Engineering](../ch04-125-karpathy-最新访谈-从-vibe-coding-到-agentic-engineering)
- [Karpathy Vibe Coding](../ch04-070-从氛围编程到智能体工程)
- [Ethan He Cosmos Grok Imagine Latent Space Video Agent 20260606](../ch01-781-ethan-he-cosmos-grok-imagine-latent-space-video-agent-202606)
- [OpenClaw 多智能体团队搭建](../ch01-715-龙虾装上了-可以用来干啥-分享下我的-openclaw-多智能体团队搭建经验)
- MOC
- 
-

---

