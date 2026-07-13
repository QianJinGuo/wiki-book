# SkillOpt — 微软训练 Skill 文档的方法论

## Ch07.028 SkillOpt — 微软训练 Skill 文档的方法论

> 📊 Level ⭐⭐ | 10.4KB | `entities/skillopt-microsoft-research-skill-training.md`

# SkillOpt — 微软训练 Skill 文档的方法论

## 核心思想

SkillOpt 的核心洞察：**Agent 的模型参数是冻结的，但 Skill 文档是纯文本，可以随便改**。既然如此，为什么不能像训练神经网络一样，用一套完整的优化流程来迭代优化这份文档呢？

把 Skill 文档当作神经网络的「权重」，用类似的训练循环来优化它。

## 训练循环：深度学习 → 文本空间

| 深度学习概念 | SkillOpt 对应操作 |
|------------|-----------------|
| forward pass | **rollout**：让 Agent 带当前 Skill 文档做一批任务，收集完成情况 |
| gradient | **reflection**：优化器模型分析失败任务，提炼改进方向 |
| weight update | **edit**：对 Skill 文档做 add/delete/replace 三种结构化编辑 |
| learning rate | **textual learning rate**：每轮最多改 L_t 条规则（默认 4 条），cosine decay 衰减 |
| validation checkpoint | **validation gating**：验证集跑一遍，分数没涨则不接受修改 |

## 两个模型分工

- **target model**：被优化的 Agent，模型参数冻结不动
- **optimizer model**：更强的前沿模型，分析 target model 表现并提出修改建议

optimizer model 的成本只在训练阶段产生，部署时完全不需要它。同级别优化器可恢复强优化器 56%-74% 的增益。

## 关键设计

### 克制的学问（textual learning rate）
每轮最多只改 4 条规则。**无限制重写（unbounded）反而更差**，比 L_t=4 低 2-3 分。一次改太多，好的坏的混在一起，验证集无法准确判断哪些有用。

### rejected-edit buffer
被验证集否掉的修改存进缓冲区，reflection 阶段看到这些「前车之鉴」，避免重复犯同样的错。类似训练时的 negative feedback。

### slow/meta update
类似深度学习的 momentum。每个 epoch 结束时跨 epoch 纵向更新，慢更新内容受保护，step 级别编辑不能覆盖它。去掉后 SpreadsheetBench 从 77.5 暴跌到 55.0（**-22.5 分**）。

## 实验结果

### 6 个 benchmark 相比直怼 GPT-5.5

| Benchmark | 直怼 GPT-5.5 | SkillOpt | 提升 |
|-----------|-------------|----------|------|
| SearchQA | 77.7 | 87.3 | +9.6 |
| SpreadsheetBench | 41.8 | 80.7 | **+39.0** |
| OfficeQA | 33.1 | 72.1 | **+39.0** |
| DocVQA | 78.8 | 91.2 | +12.4 |
| LiveMath | 37.6 | 66.9 | +29.3 |
| ALFWorld | 83.6 | 95.5 | +11.9 |
| **平均** | — | — | **+23.5** |

52 个测试格，**全部最优或并列最优**。在 Codex 执行环境中平均 +24.8 分，在 Claude Code 执行环境中平均 +19.1 分。

## 学到的规则特点

优化出来的 Skill 文档（379-1995 tokens，中位数约 920）有三条共同特征：

1. **极度具体**：没有「仔细检查」「认真思考」的空话，每条精确到操作层面
2. **反直觉**：涉及的场景人类写 Skill 时压根不会想到
3. **紧凑**：最终 Skill 文件小而精

### 规则示例

**ALFWorld**：维护一个包含地平线感知的已访问/前沿位置清单，在连续相同类型的失败后切换搜索方向，并在拿到目标物品之前避免重新访问目的地。→ 教会 Agent 在虚拟环境中做空间记忆管理，防止在同一个地方转圈。

**SpreadsheetBench**：先检查工作簿结构和公式，然后在整个请求的目标范围内写入已计算的静态值，而非依赖 Excel 自动重算。→ 抓住关键 bug：自动化环境中 Agent 写 Excel 公式期望自动计算，往往靠不住。

**SearchQA**：根据线索的措辞推断预期答案的类型，然后从共现的独特证据中选择最短的规范实体。

## 跨模型跨环境迁移

训练成本一次性付出（离线），部署零额外开销。优化后的 Skill 是纯文本，跨模型、跨执行环境迁移：

| 迁移类型 | 示例 | 提升 |
|---------|------|------|
| 跨模型 | GPT-5.4 → GPT-5.4-mini | +9.4 |
| 跨环境 | Codex → Claude Code | +59.7 |
| 跨任务 | OlympiadBench → Omni-MATH | +3.7 |

## 训练成本

- 流程类 benchmark（SearchQA、DocVQA）：每提升 1 分需 0.6-3.6M 训练 token
- 复杂轨迹类（SpreadsheetBench、ALFWorld）：需 37.9-46.4M token

一次性训练成本，后续每次使用零额外成本。

## 局限

SkillOpt 需要任务有可自动评估的标准（exact match 或自动评分器），**开放性任务暂不适用**。

## 深度分析

### 1. 「权重冻结」哲学的普适性
SkillOpt 的核心前提是「模型参数不可动」，这与当前绝大多数生产 Agent 的约束完全一致。这意味着任何能写文本指令的场景，理论上都可以用 SkillOpt 的训练循环来优化。这意味着该方法不依赖模型架构，任何冻结参数的 Agent 都可以套用这套框架。

### 2. Textual Learning Rate 是克制优化的体现
每轮 L_t=4 的限制不是随意的，而是通过实验发现无限制重写会导致「好改混在坏改里」，使验证集失去判断能力。这与深度学习中过大的学习率导致梯度不稳定是同一原理，只是表现形式换成了文本编辑。

### 3. Slow/Meta Update 是系统稳定性的关键
SpreadsheetBench 从 77.5 暴跌到 55.0（-22.5 分）的实验揭示：跨 epoch 的慢更新承担了类似 momentum 的稳定性角色，保护已经学到的有价值规则不被单个 bad step 覆盖。这说明 Skill 文档内部存在「已学到的模式」和「当前轮次探索」的区分，需要梯度累积一样的机制来区分。

### 4. Rejected-Edit Buffer 的 Negative Feedback 本质
将验证集否掉的修改存起来用于后续 reflection 阶段，本质上是在训练一个「已知的错误模式」的记忆库。这是比纯粹 KL 散度正则化更直接的方式——让优化器模型明确知道「这条路走过并且不通」，从而更有效地探索新方向。

### 5. 跨模型迁移的零成本特性
优化后的 Skill 是纯文本，与模型无关、与执行环境无关。GPT-5.4 训练出的 Skill 可以直接给 GPT-5.4-mini 用，Codex 环境训练出的可以直接在 Claude Code 环境跑。这与模型微调形成鲜明对比——微调的权重无法直接迁移，必须重新训练。

## 实践启示

### 1. 为团队 Skill 文档建立 rollout + validation 循环
在引入 SkillOpt 框架之前，团队应首先建立可自动评估的 benchmark 套件——这是 SkillOpt 工作的前提条件。没有自动化评分，就无法做 validation gating，整个训练循环就无法运转。可以从 Exact Match 起步，逐步引入启发式评分器。

### 2. 严格控制每次修改的规则数量
当开始迭代优化 Skill 文档时，每轮编辑不超过 4 条规则。如果一次性重写大量规则，验证集无法归因哪些修改有正向价值。推荐使用结构化的 add/delete/replace 操作而非自由文本替换，保持编辑的结构性。

### 3. 维护 rejected-edit buffer 并在 reflection 中主动查询
当某个修改被验证集拒绝时，必须将其存入 buffer。在后续 reflection 阶段，优化器模型应优先查询该 buffer，避免重复提出类似的修改建议。这个机制是 SkillOpt 在复杂轨迹类任务（SpreadsheetBench、ALFWorld）取得突破的关键。

### 4. 区分 step-level 和 epoch-level 的更新，保护慢更新内容
在实现 SkillOpt 训练循环时，需要显式区分两种更新频率：当前 epoch 内每个 step 的编辑（可能被验证集拒绝），以及跨 epoch 的慢更新（step-level 编辑不能覆盖）。这条机制去掉后性能崩溃表明它承担了稳定性核心角色，不可省略。

### 5. 跨模型/跨环境迁移时直接复用优化后的 Skill
当组织在不同模型或不同执行环境（Codex → Claude Code）之间迁移 Agent 能力时，不需要重新训练——可以直接将优化后的纯文本 Skill 文档迁移过去，在新环境中运行 rollout 验证效果。成本从 37.9-46.4M token 降至接近零。

## 相关链接

- 论文：https://arxiv.org/abs/2605.23904
- GitHub：https://github.com/microsoft/SkillOpt
- 项目主页：https://microsoft.github.io/SkillOpt/

## 相关实体
- [Tencent Skill Writing Complete Playbook Jackjchou](../ch04/266-skill.html)
- [Claude Design Skill](../ch01/1096-claude-design-skill.html)
- [Git Repo Based Pm Automation](https://github.com/QianJinGuo/wiki/blob/main/entities/git-repo-based-pm-automation.md)
- [Ai Skill Skill Creator 源码拆解](../ch04/425-skill-skill.html)
- [Qoder Skill Ui Agent Human Collaboration](../ch03/064-qoder-skill-ui-agent.html)

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/skillopt-microsoft-train-skill-like-neural-network.md)

---

