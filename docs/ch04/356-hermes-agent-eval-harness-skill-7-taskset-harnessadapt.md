# Hermes Agent Eval Harness：可验证 Skill 进化的 7 模块闭环（TaskSet/HarnessAdapter/TrajectoryStore/Verifier/Selection Gate/Regression Gate/Report & Replay + 6 类 Verifier + 3 类 Regression + 6 阶段落地路径）

> 📊 Level ⭐⭐⭐⭐⭐ | 36.7KB

## Hermes Agent Eval Harness：可验证 Skill 进化的 7 模块闭环

> **来源**：SOTA AI 微信公众号，2026-06-18
> **作者**：Hermes Agent 技术实现团队
> **核心命题**：**SkillOpt 真正难落地的不是"让模型提出 skill patch"，而是更底层的问题："你怎么证明一个 agent 真的变好了？"** 本文给出 Hermes Agent Eval Harness 的 **7 模块闭环** + **6 类 Verifier** + **3 类 Regression** + **6 阶段落地路径**。

## 一、定位：从 SkillOpt 学术到 Eval Harness 工程

Skillopt（Microsoft + SJTU SkillOpt 论文 arxiv 2605.23904）提出了"把 SKILL.md 当成冻结模型之外的可训练状态"——通过 rollout、bounded edits 和 held-out validation gate 优化 agent skills。但 SkillOpt 学术框架在生产环境落地需要完整的工程实施：

1. **轨迹采集**：没有完整执行轨迹，reflection 只能看结果，无法诊断失败
2. **可比较分数**：不同任务需要不同 verifier（精确/产物/执行/轨迹/策略/Judge）
3. **Selection Gate**：训练样本只暴露问题，selection split 才决定 patch 是否更好
4. **Regression Gate**：防止"修好 A、打坏 B"，每次 patch 都要跑稳定回归集
5. **Rejected Buffer**：失败 patch 是训练数据，指导 optimizer 不再犯同样错误

**关键金句**：

> **Self-improving skills 的关键不是"self"，而是"verified improvement"。**

## 二、为什么 Agent 不能只看"这次成功了"

普通软件测试可以输入固定参数，断言返回值。Agent 不一样 — 输出不仅是 final answer，还包括中间决策：

- 调用了哪些工具
- 是否读取了正确文件
- 是否验证了修改结果
- 是否越权访问敏感路径
- 是否在失败后做了合理排查
- 是否把大输出截断后仍能找到关键证据

**一个 agent 最终答对了，不代表过程安全；一次答错了，也不代表 skill 方向错。**

Agent Eval Harness 评估**三层结果**：

| 层级 | 评估对象 | 典型问题 |
|---|---|---|
| Final output | 最终答案或 artifact | 是否完成用户目标 |
| Process trace | 工具调用和观察 | 是否走了正确路径 |
| Policy boundary | 权限、审批、安全 | 是否违反约束 |

## 三、Eval Harness 最小闭环：7 模块

| 模块 | 功能 |
|---|---|
| **TaskSet** | 定义任务输入、初始文件、环境状态、可用工具、期望输出和评分方式 |
| **HarnessAdapter** | 启动 agent turn，注入 task context，限制工具集，收集 messages、tool calls、observations 和 artifacts |
| **TrajectoryStore** | 保存完整执行过程（结构化事件流） |
| **Verifier** | 把轨迹和输出变成可比较分数 |
| **Selection Gate** | 决定一个候选 skill 是否接受 |
| **Regression Gate** | 防止"修好 A、打坏 B" |
| **Report & Replay** | 输出失败样本、关键轨迹、分数变化、工具统计和可复现命令 |

## 四、任务集不是 prompt 列表，而是环境快照

很多人做 agent eval 的第一步是写 `prompts.jsonl`。**这只能覆盖最浅层的问答任务**。真实 agent 任务应该包含环境状态：

### 4.1 代码修改任务 TaskSet

至少需要：
- repo checkout 或 fixture 文件
- 用户请求
- 初始 git diff
- 允许的工具集
- **禁止的路径**
- 验证命令
- 期望 artifact
- 超时和预算

### 4.2 文档任务 TaskSet

- 输入文档
- 可访问资料
- 目标格式
- **禁止引用的来源**
- 评分 rubric

### 4.3 Skill patch 任务 TaskSet

- 当前 SKILL.md
- 历史 rejected edits
- 训练样本失败轨迹
- selection split
- patch budget

> **TaskSet 是"任务 + 世界状态 + 验证契约"。只有 prompt，没有 world state，就很难复现。**

## 五、TrajectoryStore：Agent Eval 的事实来源

Eval Harness 需要把 trajectory 扩展成**结构化事件流**：

```
run_id | task_id | model | skill_version | toolset
messages[] | tool_calls[] | tool_results[] | artifacts[]
verifier_results[] | policy_events[] | duration_ms | token_usage
```

**关键洞察 — 工具输出持久化**：工具输出太大时不能把全文塞回上下文。Hermes 的 `tools/tool_result_storage.py` 已经处理：写入 sandbox temp dir 并用 `<persisted-output>` 给模型 preview + 文件路径。**Eval Harness 应保留"工具真实返回了什么"，不仅是"模型看到了什么"。**

## 六、Verifier 不是函数，而是一组判定器（6 类）

| Verifier | 适用任务 | 输出 |
|---|---|---|
| **Exact verifier** | 问答、分类、JSON 输出 | pass/fail |
| **Artifact verifier** | 文件、表格、代码修改 | diff、hash、字段检查 |
| **Execution verifier** | 代码、脚本、测试命令 | exit code、stdout、coverage |
| **Trace verifier** | 工具路径、操作顺序 | 是否读取/验证/回滚 |
| **Policy verifier** | 安全、审批、敏感路径 | violation events |
| **Judge verifier** | 开放答案、摘要、策略判断 | rubric score |

**成熟 harness 应输出 breakdown 而非总分**：

```yaml
final_answer_score: 0.8
artifact_score: 1.0
trace_score: 0.6
policy_score: 1.0
regression_risk: medium
```

这避免两个问题：
1. **final answer 掩盖过程错误**（如代码改对了但 agent 没运行测试）
2. **过程正确但 final answer 小错**（如找到正确证据但输出格式缺字段；应指导 skill patch 而非判死）

## 七、Selection Gate：Skill Patch 不能靠直觉合入

```
old_score = evaluate(selection_set, old_skill)
new_score = evaluate(selection_set, candidate_skill)

accept only if:
  new_score > old_score
  and policy_score has no regression
  and critical regression set passes
```

### 7.1 三个细节

1. **训练样本不能决定接受** — 训练只负责产生候选规则
2. **tie 不应该默认接受** — 自然语言规则增加上下文长度和冲突风险，无明确收益就不该扩大 skill
3. **安全回归要高优先级** — patch 即使提升任务成功率，只要引入越权访问、审批绕过、敏感路径写入就应该拒绝

这是 SkillOpt 里 held-out gate 的工程版本。

## 八、Regression Gate：让 Agent 能长期进化（3 类）

| 类型 | 覆盖范围 |
|---|---|
| **Domain regression** | 该 skill 所属任务域（spreadsheet / code review / web research） |
| **Runtime regression** | 基础 agent 能力（tool call 解析 / 工具结果持久化 / checkpoint-resume / 上下文压缩 / approval） |
| **Safety regression** | 敏感路径 / 危险命令 / 权限升级 / prompt injection / 数据泄露 |

Hermes 现有测试已体现此思路：
- `tests/test_batch_runner_checkpoint.py` — 批处理 checkpoint/resume
- `tests/test_transform_tool_result_hook.py` — tool hook 语义
- `tools/approval.py` — 危险命令审批独立安全系统

**Eval Harness 要做的是把这些测试思想带进 agent 真实执行轨迹。**

## 九、Rejected Buffer：失败 patch 是训练数据

很多 self-improving 系统忽略失败 patch，但失败 patch 非常有价值：

- 哪类规则听起来对但实际会降分
- 哪些行为已被 existing skill 覆盖
- 哪些修复过于样本特化
- 哪些 patch 会触发安全回归

**Rejected Buffer 应记录**：
```
candidate_patch | source_failures | selection_score_delta
regression_failures | rejection_reason | review_notes
```

> 后续 reflection 看到这些记录，就不会反复提出同一类坏规则。
> 这和软件工程里的 review history 很像 — 好的团队不会只保存 merged PR，也会保留 rejected design 的理由。

## 十、6 阶段落地路径

| 阶段 | 内容 | 复用 Hermes 能力 |
|---|---|---|
| **第 1 阶段** | 只做离线 eval | 新增 `eval_runs/` 目录，复用 `batch_runner.py` 的 checkpoint/resume |
| **第 2 阶段** | 接入 trajectory | 每个 eval run 保存完整 messages、tool calls、tool results 和 persisted-output 路径 |
| **第 3 阶段** | 加 verifier registry | 不同任务绑定不同 verifier（命令执行、文件 diff、JSON schema、LLM judge、policy checker） |
| **第 4 阶段** | 加 skill gate | 对 `skill_manage(action="patch")` 或人工 patch 生成 candidate skill，selection split 上比较 old/new score |
| **第 5 阶段** | 加 regression suite | 每个 skill 维护一组 critical tasks，critical regression 失败 patch 不能自动合入 |
| **第 6 阶段** | 加 rejected buffer | 把失败 patch 和原因写入 skill 训练历史，只给 optimizer 使用，不注入线上 prompt |

## 十一、最小数据结构

**Task**：
```json
{
  "id": "spreadsheet-001",
  "prompt": "修复表格中的汇总结果",
  "fixture": "fixtures/spreadsheet-001/",
  "toolsets": ["files", "execute_code"],
  "verifier": "spreadsheet_diff",
  "timeout_sec": 180
}
```

**Run result**：
```json
{
  "run_id": "2026-06-07T10-00-00Z",
  "task_id": "spreadsheet-001",
  "model": "gpt-5.5",
  "skill_version": "spreadsheet@v12",
  "completed": true,
  "score": 0.87,
  "tool_stats": {"execute_code": {"count": 3, "success": 3}},
  "artifacts": ["output.xlsx"],
  "trajectory_path": "runs/.../trajectory.jsonl"
}
```

**Skill patch decision**：
```json
{
  "patch_id": "skillpatch-042",
  "base_skill": "spreadsheet@v12",
  "candidate_skill": "spreadsheet@v13-candidate",
  "selection_delta": 0.04,
  "regression_passed": true,
  "accepted": true
}
```

> 最小系统只要能保存这些，就已经比"凭感觉改 skill"前进了一大步。

## 十二、5 大常见坑

1. **只跑训练集** — 把 skill 训练成"样本答案提示词"，而不是可迁移过程知识
2. **只看平均分** — 平均分会掩盖安全回归（Agent 系统里某些任务失败成本远高于普通任务）
3. **不保存完整轨迹** — 失败分析只能靠猜
4. **用 LLM judge 替代所有 verifier** — LLM judge 适合开放任务，不适合文件 diff、代码执行、权限边界这类可确定验证
5. **自动合入过大 patch** — 自然语言 skill 越长冲突越多；bounded patch 和 rollback 比"让模型重写最佳实践"更可靠

## 十三、与既有实体的关联

| 实体 | 关系 | 互补角度 |
|---|---|---|
| Skillopt | **SkillOpt 学术理论** | Microsoft + SJTU SkillOpt 训练范式（121 行）：把 SKILL.md 当可训练状态、bounded edits、held-out validation gate；本文是其在 Hermes Agent 的工程实施蓝图 |
| [Skillopt Microsoft Train Skill Like Neural Network](https://github.com/QianJinGuo/wiki-public/blob/main/entities/skillopt-microsoft-train-skill-like-neural-network.md) | **SkillOpt 产品视角** | 别再手写 Skill！像神经网络一样训练（58 行）：SkillOpt 产品介绍 |
| [Skillopt Microsoft Train Skill Hyman'S Blog](https://github.com/QianJinGuo/wiki-public/blob/main/entities/skillopt-microsoft-train-skill-hyman's-blog.md) | **SkillOpt Hyman 视角** | 微软等 SkillOpt 解读（64 行） |
| [Hermes Agent Skill Crossover Optimization](https://github.com/QianJinGuo/wiki-public/blob/main/entities/hermes-agent-skill-crossover-optimization.md) | **Hermes Skill 互优化** | SkillEvolver × Darwin × EmbodiSkill 4 轮闭环（277 行）— Skill 之间的相互优化 |
| [Skill Self Evolution Three Approaches](https://github.com/QianJinGuo/wiki-public/blob/main/entities/skill-self-evolution-three-approaches.md) | **Skill 自进化 3 路线** | Trace2Skill 归纳法 / EvoSkill 验证闭环 / SkillOpt 训练范式（45 行）；本文是 SkillOpt + EvoSkill 的工程化展开 |
| [Agent Self Improvement Six Mechanisms](https://github.com/QianJinGuo/wiki-public/blob/main/entities/agent-self-improvement-six-mechanisms.md) | **6 大自改进机制** | Agent 自改进的 6 大机制 |
| [Ai Recursive Self Improvement Nanogpt Prime Intellect](https://github.com/QianJinGuo/wiki-public/blob/main/entities/ai-recursive-self-improvement-nanogpt-prime-intellect.md) | **递归自改进** | nanogpt + Prime Intellect |
| [Darwin Skill 2 Huashu](https://github.com/QianJinGuo/wiki-public/blob/main/entities/darwin-skill-2-huashu.md) | **Darwin Skill 2** | Darwin Skill 进化 |
| Embabel | **Embabel** | Embabel 自进化框架 |
| [Pith Train Agent Native Moe Training Framework](https://github.com/QianJinGuo/wiki-public/blob/main/entities/pith-train-agent-native-moe-training-framework.md) | **Pith 训练框架** | Agent 原生 MoE 训练 |
| [Hermes Agent 12 Layer Full Configuration Guide](https://github.com/QianJinGuo/wiki-public/blob/main/entities/hermes-agent-12-layer-full-configuration-guide.md) | **Hermes 12 层配置** | Hermes Agent 12 层完整配置 |
| [Hermes 9 Module Architecture](https://github.com/QianJinGuo/wiki-public/blob/main/entities/hermes-9-module-architecture.md) | **Hermes 9 模块** | Hermes 9 模块架构 |
| [Harness Engineering 7 Layers Openclaw Hermes Claude Code P1Anu](https://github.com/QianJinGuo/wiki-public/blob/main/entities/harness-engineering-7-layers-openclaw-hermes-claude-code-p1anu.md) | **7 层 Harness** | OpenClaw/Hermes/Claude Code 7 层 Harness |
| [Slim Cuhk Skill Lifecycle Agentic Rl](https://github.com/QianJinGuo/wiki-public/blob/main/entities/slim-cuhk-skill-lifecycle-agentic-rl.md) | **SLIM Skill 生命周期** | CUHK SLIM Skill 生命周期 + Agentic RL |
| [Deli Auto Research Skill V2 Continual Learning Self Improvement](https://github.com/QianJinGuo/wiki-public/blob/main/entities/deli-auto-research-skill-v2-continual-learning-self-improvement.md) | **Deli Auto Research** | Continual learning + self-improvement |
| [Claude Code Vs Hermes Session Vs Goal Lifecycle](https://github.com/QianJinGuo/wiki-public/blob/main/entities/claude-code-vs-hermes-session-vs-goal-lifecycle.md) | **Hermes 生命周期** | Session vs Goal lifecycle 对比 |

## 十四、关键金句

> Self-improving skills 的关键不是"self"，而是"verified improvement"。

> 一个 agent 最终答对了，不代表过程安全；一次答错了，也不代表 skill 方向错。

> TaskSet 是"任务 + 世界状态 + 验证契约"。只有 prompt，没有 world state，就很难复现。

> Tie 不应该默认接受 — 自然语言规则增加上下文长度和冲突风险，无明确收益就不该扩大 skill。

> 安全回归要高优先级 — patch 即使提升任务成功率，只要引入越权访问就应该拒绝。

> LLM judge 适合开放任务，不适合文件 diff、代码执行、权限边界这类可确定验证。

> Bounded patch 和 rollback 比"让模型重写最佳实践"更可靠。

> Hermes Agent 已经具备一些拼图：轨迹保存、批量运行、工具统计、大输出持久化、审批系统、执行沙箱、测试体系。下一步不是再加一个"让模型反思"的 prompt，而是把这些拼图组织成一个完整评测闭环。

> 这个闭环一旦建立，skills 就不再只是手写经验文档，而会变成可训练、可验证、可回滚、可迁移的运行时资产。**这也是从 agent demo 走向 agent engineering 的分水岭。**

## 深度分析

### 环境快照是复现性的根基，而不仅是任务的包装

把 TaskSet 理解成"环境快照"而非"prompt 列表"，本质上是把实验科学里的控制变量思想搬进 agent 评测。一个只有 prompt 的评测集，测到的其实是"模型 + 当时世界状态"的联合表现——repo 的依赖版本变了、fixture 文件被上一个任务改动了、目标格式规范更新了，分数都会漂移，而这种漂移会被误读成某个 skill patch 带来的效果。环境快照把世界状态钉死在 fixture 里：初始 git diff、允许与禁止的路径、验证命令、超时预算全部随任务一起冻结，于是任何两个 skill 版本之间的分数差，才可能唯一归因于 skill 本身。这正是第七节那个对比公式的隐含前提——`new_score > old_score` 只有在两次 evaluate 面对同一个世界时才是一个有意义的比较；快照缺失时，Selection Gate 比较的其实是两个不同的实验。

更深一层，快照里的"禁止路径"和"验证命令"不只是执行环境的配置，它们同时就是验证契约的另一半：policy verifier 之所以能对一次执行给出可解释的判定，是因为快照预先声明了"什么算越界、什么算完成"。换句话说，复现性与可判定性是同一个设计的两面——只冻结输入而不冻结契约，得到的只是可重复的失败；只冻结契约而不冻结输入，verifier 的判定对象本身就不可比。这也解释了 6 阶段落地路径为什么把"离线 eval"排在第一步：先在受控世界里建立基线，后续接入轨迹、判定器和双 Gate 时，每一步的分数才有锚点可依。快照的另一个经常被忽略的收益是版本化：fixture 与验证契约一起进入版本管理后，评测集本身就变成了可 diff、可回滚、可演进的资产——某个任务发现设计缺陷时可以修快照而不是改分数历史，历史 run 仍能追溯到当时的快照版本重放验证。评测基础设施的成熟度，很大程度上就体现在"任务资产是否和代码一样被认真管理"上。

### TrajectoryStore 的单一写入方原则：从日志目录到仲裁机构

TrajectoryStore 常被当作日志目录，但它真正的架构价值在于"单一事实源"：只有 HarnessAdapter 一个写入方，所有下游消费者——verifier、Report & Replay、reflection、regression triage——读的是同一份结构化事件流。这消除了评测系统里最隐蔽的故障模式：同一个 run 存在多个互相矛盾的版本（模型自己复述的版本、adapter 内存里的版本、事后重放拼接的版本），任何基于它们的分数与结论都不可信。一个只有单一写入方、追加式的事件流，天然具备审计性质——任何分数都能追溯到产生它的原始证据，这在 patch 争议时是唯一的仲裁依据。

"模型看到了什么"与"工具真实返回了什么"必须分开持久化，正是因为模型侧视图经过截断与摘要（persisted-output 机制给的是 preview 加路径），已经是二手证据；verifier 若只看模型视图，等于让被评者自己剪辑呈堂证供。单一事实源还让分数去抖与回归分诊脱离猜测：当某个任务分数在两个 skill 版本之间翻转时，不需要重新烧一次昂贵的 rollout，直接 replay 事件流就能定位翻转发生在理解、检索、工具调用、结果验证还是安全边界的哪一层。三类 regression 的分诊同理——domain 失败看任务域事件，runtime 失败看基础能力事件，safety 失败看 policy_events——分类的置信度完全取决于事件流的完整性。轨迹存档与事实仲裁的区别就在这里：前者是"存过"，后者是"随时可查证"。事件流里同时保存的 token_usage 和 duration_ms 还让成本进入评分维度——两个分数相同的候选 skill，一个是靠三次昂贵重试堆出来的，一个是一次干净通过，replay 一眼可辨。Agent 的 rollout 本身带模型非确定性噪声，同一任务多次运行的分数天然有方差；去抖不等于抹平噪声，而是让每一次分数波动都能被下钻到具体事件，把"分数奇怪"转化为"某个具体环节可解释的异常"。

### 6 类 Verifier 是一条判定器成本-精度阶梯，而非并列选项

六类 verifier 不该被看作六种并列的评分方式，而是一条按确定性与成本排序的阶梯。exact 与 artifact verifier 确定性最强、成本最低（毫秒级的字符串、hash、字段比较），适合做第一道闸门；execution verifier 要真正运行命令，成本中档，但能杀死"代码看起来对、跑起来错"这一类 exact/artifact 无法触及的假阳性；trace 与 policy verifier 依赖结构化事件流的存在——没有 TrajectoryStore 它们根本无从谈起——它们守护的是过程正确性与权限边界；judge verifier 最贵也最吵，方差来自模型本身，天然不适合文件 diff、命令执行、权限边界这类可确定验证。

工程上的正确姿势是把阶梯当作升级路径：先用便宜的判定器把确定性错误筛掉，只把真正含糊的案例（开放问答、摘要、策略判断）escalate 给 judge，而不是让 judge 通吃全部分数。判死与放行要交给不同价的判定器——breakdown 输出的意义正在于此：final answer 的高分不能掩盖 trace 的低分（改对了代码却没跑测试），trace 的高分也不该因 final answer 的小瑕疵而判死（找到正确证据但输出缺字段，应指导 skill patch 而非一票否决）。每一维的错误由对应精度的判定器负责解释，总分永远不作为合入依据——平均分恰恰是掩盖 safety regression 的地方。这条阶梯还有一层经济学含义：判定成本决定了回归集的规模上限，贵的 judge 只能覆盖开放任务，便宜的 exact verifier 才能支撑高频跑的 critical regression set。judge 的方差虽可用更细的 rubric 和多次采样压低，但每次压低都让成本翻倍，这更说明 judge 的用量应留给阶梯顶端真正含糊的案例，而不是被当作万能默认。

### 双 Gate 结构：让学术闭环敢在活体 agent 上运行

SkillOpt 学术框架里的 held-out validation gate 是一个离线实验装置；要在一台正在服务真实用户的 agent 上演化 skill，单个 gate 远远不够。Selection Gate 回答"新 skill 是否更好"，Regression Gate 回答"旧能力是否还在"——两者必须同时在场，因为任何一次 patch 都是双侧行动：它在 selection split 上的提升，永远可能是以牺牲未覆盖能力为代价的。这正是"修好 A、打坏 B"的结构性根源——不是 optimizer 不小心，而是任何有限评测集都存在未观测的代价面。

双 Gate 的设计里藏着一套不对称风险原则：selection 提升是收益项，可以用分数阈值裁量；safety regression 是一票否决项，哪怕任务成功率大涨也不许赎回。tie 默认拒绝则是保守先验——自然语言 skill 只增不减，上下文长度与规则冲突是单向累积的成本，无明确收益就等于净损失，这也与 bounded patch 和 rollback 优先于"让模型重写最佳实践"的取向一脉相承。三类 regression 的分层覆盖（domain / runtime / safety）进一步界定了风险边界：runtime regression 保护的是所有 skill 共享的底座能力，所以它属于整个系统而不属于某个 skill。正是"收益须证明、风险须清零、平局即拒绝"这三条，把一个原本只在论文里成立的优化循环，改造成风险有界、可回滚、敢在线上运行的机制——这是学术思想与生产系统之间真正的工程鸿沟所在。Report & Replay 是双 Gate 的最后一公里：每次接受或拒绝都不是一个孤立结论，而是附带失败样本、关键轨迹、分数变化与可复现命令的完整案卷，人和 optimizer 都能据此复核——一个不可解释的 gate 决策，在团队里活不过两个迭代周期。

### Rejected Buffer 是会复利的失败资本

大多数自改进系统只积累成功——合入的 skill 越来越多，失败的尝试被丢弃。Rejected Buffer 的反直觉之处在于：失败知识比成功知识更耐用。合入的正向规则会过时——环境变了、模型升级了、规则互相冲突需要修订；而"哪类规则听起来对但实际降分""哪些行为已被 existing skill 覆盖""哪种修复过于样本特化""哪类 patch 会触发安全回归"这类负面结论，在相当长的时间窗内保持有效，且极其紧凑——一条 rejection_reason 加 selection_score_delta 就能封存一次昂贵 rollout 换来的全部教训。

它还是罕见的对人类与机器同时有效的资产：对 reviewer，它扮演 review history 的角色——好的工程团队不会只保存 merged PR，也会保留 rejected design 的理由；对 optimizer，它是负样本集，直接压缩后续候选规则的搜索空间，让 reflection 不再反复提出同类坏规则。最关键的是它的成本结构：Rejected Buffer 只进 skill 训练历史、不注入线上 prompt，所以它积累时几乎零运行时代价，却让每一次拒绝都变成后续所有候选 patch 的先验。第六阶段把它放在落地路径的最后一环也是这个道理——前五个阶段产生的每一次失败（gate 拒绝、regression 击杀）都自动成为它的进料，闭环转得越久，这本失败账簿的复利越厚。失败在这里不是损耗，而是复利。唯一的前提是记录质量：rejection_reason 必须写清楚拒绝的机制而非笼统的"效果不好"，否则负样本退化成噪音，optimizer 既学不到教训，reviewer 也无从复核——失败资本的价值完全取决于记账的认真程度。

## 十五、实践启示

### 对 Eval Harness 设计者：从 7 模块逐个落地

不要试图一步到位实现完整闭环。按 6 阶段路径，先离线 eval → 接 trajectory → 加 verifier registry → 加 skill gate → 加 regression suite → 加 rejected buffer。每个阶段都是上阶段的能力叠加。

### 对 Skill 作者：tie 不应该被接受

每次提 skill patch 要回答"明确收益是什么"——自然语言 skill 越长冲突越多，没有明确选择率提升就应该拒绝。

### 对安全团队：safety regression 优先级最高

Domain/Runtime/Safety 三类 regression 中，safety 失败立即拒绝 patch，不能因为任务成功率提升而妥协。

### 对 optimizer/reviewer：失败 patch 是训练数据

Rejected Buffer 不是"垃圾箱"——它是 optimizer 不再重复同类错误的关键证据。每次 reject 要写明原因、selection_score_delta、regression_failures。

### 对整个团队：把"verified improvement"当作 KPI

不是"agent 反思了"或"skill 添加了"——而是"在 selection split 上 score 从 X 提升到 Y，且 safety regression 通过"。**Self-improving 系统的关键不是 self，而是 verified**。

## 十六、引用与延伸阅读

→ [原文存档](https://mp.weixin.qq.com/s/V_1HVbB74rhCgKkV1an46w)

**学术参考**：
- SkillOpt: Executive Strategy for Self-Evolving Agent Skills — https://arxiv.org/pdf/2605.23904

**Hermes Agent 代码引用**：
- `agent/trajectory.py` — 轨迹保存
- `batch_runner.py` — 批量运行、checkpoint、resume、tool statistics
- `tools/tool_result_storage.py` — 大工具输出持久化（`<persisted-output>` 机制）
- `tools/approval.py` — 审批系统
- `tools/code_execution_tool.py` — 执行沙箱

**测试引用**：
- `tests/test_batch_runner_checkpoint.py` — 批处理 checkpoint 和 resume
- `tests/test_transform_tool_result_hook.py` — tool hook 语义

#HermesAgent #EvalHarness #SkillOpt #SelectionGate #RegressionGate #VerifiedImprovement #AgentEngineering

---

