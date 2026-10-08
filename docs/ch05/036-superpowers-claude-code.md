# Superpowers 深度解析：给 Claude Code 装上工程大脑

> 📊 Level ⭐⭐⭐ | 11.0KB

> 原文归档：[原文归档](https://mp.weixin.qq.com/s/6Zr-ysk7F2UyaJzJ2YKjeQ)

17000+ 字深度解析 Claude Code Superpowers：14 技能拆解、brainstorming SKILL.md 源码解析、概率操控技巧、querit.ai 真实案例复盘、负向收益诚实评估。百度Geek说/奔跑的脆皮肠。

## 一句话

**大模型=能力，Superpowers=纪律，你=方向。14 Skill 强制"澄清→设计→规划→执行→验证"五阶段流程，概率操控让"正确行为"从 20%→80%。**

## 三大原罪

1. **回答随机性** — 模型是概率预测器，每次采样都是"掷骰子"
2. **直觉快思考** — 只有快思考没有慢思考。认知负荷理论：拆成"每次只想一件事"
3. **注意力稀释** — 长上下文注意力衰减。《清单革命》：术前清单使并发症死亡率降 47%

## brainstorming SKILL.md 关键设计

- **强制触发**："You MUST use this before any creative work" → 触发概率 20%→80%
- **单问题约束**：One question per message（5 个问题→概率分布指数增长；1 个→聚焦高质量）
- **多方案探索**：Propose 2-3 different approaches with trade-offs
- **YAGNI ruthlessly**：硬编码做减法
- **输出物规范**：写入 `docs/plans/YYYY-MM-DD-<topic>-design.md` + git commit
- **链式调用**：→ using-git-worktrees → writing-plans

## 概率操控四技巧

1. **强制词汇**：MUST/NEVER → 概率分布大幅偏移
2. **结构模板**：具体数字作锚点（1, 2-3, 200-300）
3. **状态锁定**：强制文件输出持久化对话状态，防止概率漂移
4. **链式调用**：显式指定下一个 Skill，形成确定性状态机

## 作者 Jesse Vincent (obra)

30 年开源老兵。方法论来自"2000 年代初通过 IRC 远程指挥 MIT 实习生"——管理 AI = 管理初级程序员。Cialdini《影响力》说服原则对 LLM 有效。

## 项目热度

0→170k Stars（2025.10→2026.05），Anthropic 官方市场第三方安装量第一（近 30 万次）

## 负向收益（7 项诚实评估）

1. 简单任务流程开销 > 收益
2. 创意性任务约束扼杀灵感
3. Skills 注入提示词浪费上下文窗口
4. 过度工程化（YAGNI 讽刺：流程本身制造复杂度）
5. 学习曲线
6. 团队协作摩擦
7. 安全感陷阱（流程规范 ≠ 结果正确）

**核心警示**：提高下限，不保证上限

## 后悔成本决策

- 低后悔成本（改文案/修样式）→ 裸跑
- 中后悔成本（新功能/重构）→ 部分流程
- 高后悔成本（支付/安全/核心逻辑）→ 全流程

## 深度分析

### 概率操控：把"下命令"换成"调先验"

Superpowers 容易被误读成"更严格的提示词模板"，但它真正的机制不是命令，而是**概率偏置**。模型是采样器而非执行器，于是强制词汇、数字锚点、强制写文件、显式指名下一技能这些技巧本质相同：不规定唯一动作，而是把候选动作的分布向"正确路径"压缩，再用自回归的逐 token 条件化把已偏好路径锁定。

推论是：**可执行性来自约束的形状，而不是约束的数量**。一堆"请尽量"式措辞只稀释分布，一句带量化边界的硬约束才真正移动概率质量；把选项收敛、把输出位置固定（写进 `docs/plans/...` 而非留在对话里），都是降熵手段。这也解释了"状态锁定"为何能防漂移：上下文会被后续轮次重写注意力权重，而磁盘文件是不参与采样的外部锚点，可对照 [Context Engineering](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/context-engineering.md) 与 [Prompt Engineering 基础](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/prompt-engineering-fundamentals.md)。

### brainstorming SKILL.md 是一台多轮对话编译器

单个 SKILL.md 文件能稳定改变多轮交互形态，靠的是三条互相咬合的设计：**强制触发**（触发概率从约 20% 抬到约 80%）、**One question per message**、**强制产出设计文档并提交**。

单问题约束最有信息量：一次抛 5 个问题，模型要在联合分布上同时满足 5 个约束，答案空间指数级膨胀，用户也无法在一次回答里给出五个高质量答复。拆成一问一答后，每轮只收敛一个决策节点，步数变多但每一步方差骤降——这是用**轮次成本换单步精度**的显式交易，也解释了它为何在复杂任务上"看着慢，实际更省"。

强制文档产出则是"中间表示"落地：设计文档把散落对话里的隐含决策冻结成可审查、可 diff 的工件。三者合起来，Superpowers 提供的其实是一套**带状态机语义的对话协议**：状态在文件里，迁移条件在 SKILL.md 里，终止条件是验证通过。

### 后悔成本规则其实是一个验证成本函数

原文的"低后悔成本→裸跑、中→部分流程、高→全流程"表像经验法则，拆开却是一条决策不等式：把流程与验证的投入控制在与"错误逃逸后的修复代价"相称的量级。 更精确地说，期望损失 ≈ 出错概率 × 爆炸半径 × **暴露时长**（从错误产生到被发现的时间）。支付与安全改动之所以要走全流程，更因为其错误往往**静默**——能跑通、不报错，上线后以事故形式显形，暴露时长以周计，期望损失被放大若干倍。

边界也很清晰：爆炸半径在开场通常未知，用它配预算会低估高风险任务；流程有成本，不等式存在下界——小任务上"裸跑 + 快速回滚"可能才最优；规则还假设错误可被检测，无测试、无可观测性时它会直接失效，此时该补的是检测手段而不是流程。换言之，后悔成本表是**结果**而非原因，原因是验证预算的边际收益曲线长什么样。

### 7 项负向收益不是缺陷清单，而是三类采用风险

7 条归拢后处在不同层级。**固定成本**（简单任务的流程开销、学习曲线）在小任务上必亏，与其说反对 Superpowers，不如说反对无差别使用。**上下文预算挤占**：技能注入本身消耗窗口，这与 [上下文漂移与工具幻觉](https://github.com/QianJinGuo/wiki-public/blob/main/entities/agent-reliability-context-drift-tool-hallucination.md)、[上下文窗口经济学](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/context-window-economics.md) 的观察同源，14 技能、SKILL.md 动辄数百行，技能数量本身就是成本项。**信任错位**最危险："安全感陷阱"让团队把"走了完整流程"误当"结果正确"，而 [验证者悖论](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/verifier-paradox.md) 提示验证环节会制造虚假确定性；团队摩擦与过度工程化说明副作用往往落在组织协商成本上。"提高下限，不保证上限"这句自我限定把它定位成**方差削弱器**而非**能力放大器**。

### 与裸 TDD、Plan Mode 的分界

TDD 是一种技术，Plan mode 是一种只读预演，二者都不含**强制执行与状态持久化**。Superpowers 的差异不在知识含量，而在三件事：把多个技术按固定顺序串成状态机（brainstorming → worktrees → writing-plans → subagent-driven → verification-before-completion）、把每步产物落盘、把"该用哪个技能"写成显式迁移而非留给模型临场判断。

因此它更像 [验证驱动开发](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/verifier-driven-development.md) 与 [OpenSpec + Superpowers 的 SDD/TDD 工作流](https://github.com/QianJinGuo/wiki-public/blob/main/entities/openspec-superpowers-opencode-sdd-tdd-workflow-2026.md) 这类"以可验证工件为交付物"的路线；与 [Matt Pocock 与 Superpowers 对比](https://github.com/QianJinGuo/wiki-public/blob/main/entities/matt-pocock-skills-vs-superpowers-comparison.md) 的分野也在这里——迁移条件越硬、状态越外置，越能抵抗长任务漂移，代价是小任务被附加固定开销。

## 实践启示

1. **把 SKILL.md 当概率偏置器写**：用 MUST/NEVER 划硬边界，用具体数字给锚点（一次只问 1 个问题、给 2-3 个方案），并在结尾显式写出下一个该调用的技能。
2. **按后悔成本分配验证预算，先估暴露时长**：低（文案/样式）裸跑 + 快速回滚；中（新功能/重构）部分流程；高（支付/安全/核心状态机）全流程。同时问"这个错误多久才会被发现"——静默错误会把期望损失推高一个量级。
3. **为负向收益预埋退出口**：写出"流程豁免条件"（单文件、低风险、可秒回滚的改动允许跳过），并定期盘一下技能注入占了多少上下文预算，别给简单任务强加仪式。
4. **把"流程正确"与"结果正确"分开验收**：verification-before-completion 是独立关卡，不以"走完了流程"作为验收理由——流程提高下限，不保证上限。

## 相关实体

- Harness Engineering
- [Claude Code Skills Superpowers 实践](https://github.com/QianJinGuo/wiki-public/blob/main/entities/claude-code-skills-superpowers-practice.md)
- [AI Coding Agent Token 成本控制](https://github.com/QianJinGuo/wiki-public/blob/main/entities/token-cost-control-coding-agent-devinyzeng-tencent.md)
- [Skill 版本对比五大原则](https://github.com/QianJinGuo/wiki-public/blob/main/entities/skill-version-comparison-five-principles-winty.md)

---

