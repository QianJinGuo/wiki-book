# Defense-as-Skill：把 Agent 运行时安全守卫做成可进化 Skill（SkillSonar / SCOPE-R）

> 📊 Level ⭐⭐ | 9.9KB

## Defense-as-Skill：把 Agent 运行时安全守卫做成可进化 Skill

NeurIPS 2026 论文《Defense-as-Skill: Evolving Runtime Guard Skill for Skill-Augmented Agents》的解读：当 Agent 的能力靠 Skill 积累、经验靠记忆沉淀时，安全防御却是唯一静止的部分。这条工作把守卫本身做成一个可以被编辑、被评估、被进化的 Skill（SkillSonar），并配套构造对抗数据集 SCOPE-R 与基于 MCTS 的进化引擎。→ [原文存档](https://mp.weixin.qq.com/s?__biz=MzIwMTc4ODE0Mw==&mid=2247723504&idx=2&sn=91e06e58ac5f247fb67d8bb4cc80f883)

## 问题：静态防御追不上进化中的攻击

Agent 系统里几乎一切都在进化——能力靠 Skill 持续积累，经验靠记忆不断沉淀，唯独安全防御通常是一份手写的策略文本，写完的那一刻就开始过时。恶意 Skill 的典型形态是不在安装时做任何坏事，而是等到「具体任务 + 工作区状态 + 可用工具集」三者凑齐时才让危险动作显得有用：顺手读 `.env` 里的密钥、顺手把日志传到外部地址、顺手跳过权限确认。安装前审查拦不住这种潜伏风险，因为它发生在运行时。

问题因此是双层的：Agent 执行的动作是否越界，以及防御本身能不能跟着威胁一起变强。这两层分别对应载体设计与进化机制设计。

## 载体：守卫做成 Skill（SkillSonar）

SkillSonar 像普通 Skill 一样被安装、被加载，与不可信的任务技能并行待在同一个 Agent 内。Agent 每次执行敏感操作（工具调用、文件读写、Shell 命令、数据访问、外部副作用）之前，它基于用户任务边界做一次核查，给出三级裁决：Allow（任务边界内放行）、Replan（收窄或重新规划动作）、Require Confirm（风险较高，需用户显式确认）。核查对象是**动作本身**，因此防护范围不限于恶意 Skill——注入指令骗出来的动作、模型自己跑偏产生的动作都走同一套逻辑。

工程上是零改动接入：不需要改 Agent 底层运行时，不需要外部分类器或独立审核服务，同一份守卫技能可直接部署到 Claude Code 和 OpenClaw 两个 Harness 上；又因为它是普通 Skill 文件，任何人都可以打开检查、动手修改，防御本身是透明的。这条「守卫即工件」的路线与 [Harness 工程范式](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/agent-harness-engineering-paradigm.md) 同源：把安全从提示词里的口头约束，变成运行时里可审计、可替换的结构件。

有一个容易漏掉的部署细节：安全技能和能力技能不同，它的触发不会天然被任务检索命中，所以部署配置里必须包含一条显式指令，为 SkillSonar 指派持续的安全职责，要求 Agent 行动前先咨询它。消融显示这一步不可或缺——把触发交给普通的任务-技能匹配，ASR 只能降到 0.400/0.582（ID/OOD），显式指派后才能降到 0.104/0.109，而良性效用几乎不变。

## 燃料：SCOPE-R 数据集与三 Agent 闭环

回答「防御能不能拦住恶意动作又不耽误正常干活」需要能同时支撑优化和评测的数据集。SCOPE-R 把技能引发的风险按运行时路径组织成六大家族：规约完整性（S）、能力管控（C）、操作副作用（O）、隐私与数据流（P）、执行安全（E）、资源与可靠性（R），下分 21 个子类。

构造方式是「攻击者—受害者—裁判」三 Agent 闭环：攻击 Agent 在不改动用户任务的前提下改写 Skill 注入恶意行为；受害者 Agent 拿着被污染的 Skill 真实执行任务；裁判 Agent 对照可观测的运行时证据判定攻击是否成功，并把失败原因反馈给攻击者继续改进。只有裁判确认攻击真实发生的样本才会保留——最终 206 个恶意实例 + 43 个不含注入的良性任务，用于衡量防御会不会误伤。C 和 P 两族完全不参与训练，专用于测试对没见过攻击的泛化。

## 引擎：MCTS 把守卫当可优化对象

进化引擎用蒙特卡洛树搜索维护一棵候选守卫的搜索树：每轮选一个候选放到真实任务里跑，裁判返回的不只是分数，还有「这次是怎么被绕过的」这类自然语言反馈，据此对守卫做局部编辑、扩展出新变体。目标函数是安全优先——攻击成功率主导，任务效用、确认次数、token 开销作为次级偏好，防止搜索把守卫推向「逢操作必拦」的退化解。整个过程离线完成，最终选出全量评估最优的版本部署。9 轮迭代把恶意攻击成功率从 0.300 降到 0.078。

## 实验结果

实验覆盖两个 Harness（Claude Code、OpenClaw）与三个受害者模型（GLM-5、GPT-5.4、Claude Haiku 4.5），裁判由独立于受害者阵营的 Qwen3.5-122B-A10B 担任并经过人工审计（构造/评估两个环节的裁判一致性 94% / 98%）。

| 维度 | 结果 |
|------|------|
| 安全与效用兼得 | 平台自带权限闸门（AcceptEdits）也能压低 ASR，但代价是任务完成率跳水（GPT-5.4 的 OOD 效用从 0.766 跌到 0.258）；SkillSonar 在 GLM-5 / Haiku 上保持接近无防御水平的效用，ID 上 ASR 比权限闸门更低 |
| 对抗未见攻击 | OOD 两族（能力管控、隐私与数据流）训练时完全没出现；GLM-5 十次重复主实验 OOD ASR 60.6%→11.5%，跨模型点估计 Haiku 70.7%→25.4%、GPT-5.4 55.9%→3.4% |
| 跨 benchmark | 同一守卫不做改动：SkillSafetyBench ASR 93.3%→52.9%，WildClawBench 安全分 38.0→54.0（所测方法最好）；WildClawBench 安全子集测的是长程工作流的一般安全行为，说明动作级核查不限于 Skill 场景 |
| 自适应攻击 | 面对「见过守卫、专门迭代三轮」的攻击者，ASR 45.1%→22.9% |
| 跨模型迁移 | GLM-5 上优化出的守卫可零样本迁移到 Kimi-K2.6 / Haiku / GPT-5.4，无需重新搜索 |
| 表示形式本身有收益 | 内容对齐的对照实验：同样的策略内容，Skill 原生表示比拍平塞进系统提示 ASR 更低、效用更高、token 省约 21% |

## 为什么这是「软防线」

SkillSonar 不是沙箱、不是内核监控、也不是任何形式的硬隔离——它是策略层防御，以 Skill 形式存在，意味着理论上仍可被绕过，ASR 也没有降到零。作者主张其价值在于零改动接入 + 全透明可审计，用极低接入成本换取攻击成功率的显著下降，因此适合作为纵深防御中的一层，而不应被当成唯一防线。

这与 [Agent 安全全生命周期体系](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/agent-security-full-lifecycle-system.md) 的分层思路吻合：防御需要按「动作边界核查（软）/ 运行时隔离（硬）/ 权限闸门（平台）」分层叠加，单层都不可能覆盖全部攻击面。同为 2026 年的另一条安全路线 [SafeEvolve（Harness–Policy 协同进化）](https://github.com/QianJinGuo/wiki-public/blob/main/entities/she-safeevolve-agent-safety-harness-policy-coevolution.md) 把安全策略的进化放在 Harness 与 Policy 双向协同上，SkillSonar 则把 Policy 固化成一个可被搜索编辑的 Skill 工件——两者共同指向「防御本身要进入与能力同频的迭代循环」。

## 可迁移的工程结论

1. **防御的载体决定它能否进化**：一条写在系统提示里的规则无法被版本化、评估和替换；一份 Skill 文件可以。载体选择是进化能力的前置条件。
2. **必须显式指派安全职责**：安全技能不会自然被任务检索命中，靠隐式匹配触发会损失约 4 倍防护效果（0.400 → 0.104）。
3. **进化的目标函数要防退化**：只优化 ASR 会把守卫推向全拦，效用/确认次数/token 开销必须作为次级约束。
4. **动作级核查优于来源级封堵**：同一套边界检查同时覆盖恶意 Skill、注入指令与模型跑偏，比按攻击来源枚举规则更耐 drift。
5. **软防线的定位要写清楚**：ASR 不可能归零，防御的价值是降低概率并为硬隔离争取纵深，而非替代隔离。

## 关联

- [Agent 安全攻防](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/agent-security-attack-defense.md) — 攻击面分类与防御层次的总体框架
- [Agent 安全全生命周期体系](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/agent-security-full-lifecycle-system.md) — 运行时防御在生命周期中的位置
- [Harness 工程范式](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/agent-harness-engineering-paradigm.md) — Skill 作为 Harness 结构件的一般化视角
- [SafeEvolve：Harness–Policy 安全协同进化](https://github.com/QianJinGuo/wiki-public/blob/main/entities/she-safeevolve-agent-safety-harness-policy-coevolution.md) — 同期另一条进化式安全路线
- [上下文工程](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/context-engineering.md) — 系统提示 vs Skill 原生表示的信息密度差异
- → [原文存档](https://mp.weixin.qq.com/s?__biz=MzIwMTc4ODE0Mw==&mid=2247723504&idx=2&sn=91e06e58ac5f247fb67d8bb4cc80f883)

---

