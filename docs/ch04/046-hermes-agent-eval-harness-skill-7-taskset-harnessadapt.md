# Hermes Agent Eval Harness：可验证 Skill 进化的 7 模块闭环（TaskSet/HarnessAdapter/TrajectoryStore/Verifier/Selection Gate/Regression Gate/Report & Replay + 6 类 Verifier + 3 类 Regression + 6 阶段落地路径）

## Ch04.046 Hermes Agent Eval Harness：可验证 Skill 进化的 7 模块闭环（TaskSet/HarnessAdapter/TrajectoryStore/Verifier/Selection Gate/Regression Gate/Report & Replay + 6 类 Verifier + 3 类 Regression + 6 阶段落地路径）

> 📊 Level ⭐⭐ | 26.9KB | `entities/sota-ai-hermes-agent-eval-harness-skillopt-implementation.md`

strategic_context: "[Frontier 1 — Harness/Skill 从个人能力到组织资产](https://github.com/QianJinGuo/wiki/blob/main/queries/research-frontier-map.md)"
provenance_state: inferred
---
---

# Hermes Agent Eval Harness：可验证 Skill 进化的 7 模块闭环

> **来源**：SOTA AI 微信公众号，2026-06-18
> **作者**：Hermes Agent 技术实现团队
> **核心命题**：**SkillOpt 真正难落地的不是"让模型提出 skill patch"，而是更底层的问题："你怎么证明一个 agent 真的变好了？"** 本文给出 Hermes Agent Eval Harness 的 **7 模块闭环** + **6 类 Verifier** + **3 类 Regression** + **6 阶段落地路径**。

## 一、定位：从 SkillOpt 学术到 Eval Harness 工程

[Skillopt](../ch05/042-skillopt.html)（Microsoft + SJTU SkillOpt 论文 arxiv 2605.23904）提出了"把 SKILL.md 当成冻结模型之外的可训练状态"——通过 rollout、bounded edits 和 held-out validation gate 优化 agent skills。但 SkillOpt 学术框架在生产环境落地需要完整的工程实施：

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
| [Skillopt](../ch05/042-skillopt.html) | **SkillOpt 学术理论** | Microsoft + SJTU SkillOpt 训练范式（121 行）：把 SKILL.md 当可训练状态、bounded edits、held-out validation gate；本文是其在 Hermes Agent 的工程实施蓝图 |
| [Skillopt Microsoft Train Skill Like Neural Network](../ch05/042-skillopt.html) | **SkillOpt 产品视角** | 别再手写 Skill！像神经网络一样训练（58 行）：SkillOpt 产品介绍 |
| [Skillopt Microsoft Train Skill Hyman'S Blog](../ch05/042-skillopt.html) | **SkillOpt Hyman 视角** | 微软等 SkillOpt 解读（64 行） |
| [Hermes Agent Skill Crossover Optimization](../ch01/394-hermes-agent-skill.html) | **Hermes Skill 互优化** | SkillEvolver × Darwin × EmbodiSkill 4 轮闭环（277 行）— Skill 之间的相互优化 |
| [Skill Self Evolution Three Approaches](ch04/267-skill.html) | **Skill 自进化 3 路线** | Trace2Skill 归纳法 / EvoSkill 验证闭环 / SkillOpt 训练范式（45 行）；本文是 SkillOpt + EvoSkill 的工程化展开 |
| [Agent Self Improvement Six Mechanisms](../ch03/046-agent.html) | **6 大自改进机制** | Agent 自改进的 6 大机制 |
| [Ai Recursive Self Improvement Nanogpt Prime Intellect](../ch05/085-ai.html) | **递归自改进** | nanogpt + Prime Intellect |
| [Darwin Skill 2 Huashu](ch04/267-skill.html) | **Darwin Skill 2** | Darwin Skill 进化 |
| [Embabel](../ch07/021-embabel.html) | **Embabel** | Embabel 自进化框架 |
| [Pith Train Agent Native Moe Training Framework](../ch03/046-agent.html) | **Pith 训练框架** | Agent 原生 MoE 训练 |
| [Hermes Agent 12 Layer Full Configuration Guide](../ch03/091-hermes-agent.html) | **Hermes 12 层配置** | Hermes Agent 12 层完整配置 |
| [Hermes 9 Module Architecture](../ch01/723-9.html) | **Hermes 9 模块** | Hermes 9 模块架构 |
| [Harness Engineering 7 Layers Openclaw Hermes Claude Code P1Anu](../ch05/069-harness-engineering.html) | **7 层 Harness** | OpenClaw/Hermes/Claude Code 7 层 Harness |
| [Slim Cuhk Skill Lifecycle Agentic Rl](ch04/537-agentic-rl.html) | **SLIM Skill 生命周期** | CUHK SLIM Skill 生命周期 + Agentic RL |
| [Deli Auto Research Skill V2 Continual Learning Self Improvement](ch04/267-skill.html) | **Deli Auto Research** | Continual learning + self-improvement |
| [Claude Code Vs Hermes Session Vs Goal Lifecycle](../ch03/076-claude-code.html) | **Hermes 生命周期** | Session vs Goal lifecycle 对比 |

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

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/sota-ai-hermes-agent-eval-harness-skillopt-implementation-2026-06-18.md)

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

