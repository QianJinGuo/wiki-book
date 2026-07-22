---
title: "Hermes Agent Eval Harness 深度解析：从执行轨迹到可验证的 Skill 进化（7 模块闭环 + 6 类 Verifier + 3 类 Regression + 6 阶段落地路径）"
source_url: "https://mp.weixin.qq.com/s/V_1HVbB74rhCgKkV1an46w"
ingested: 2026-06-18
sha256: 7caa494a16c0a569eca9689a4fa06e044b629875e90eee7210291206dc9c5886
type: raw
tags: [hermes-agent, eval-harness, trajectory, skillopt, selection-gate, regression-gate, verifier, task-set, harness-adapter, trajectory-store, report-replay, rejected-buffer, 7-modules, 6-verifier-types, 3-regression-types, 6-stage-rollout, exact-verifier, artifact-verifier, execution-verifier, trace-verifier, policy-verifier, judge-verifier, sota-ai, arxiv-2605-23904, agent-self-improvement, skill-crossover]
---

# Hermes Agent Eval Harness 深度解析

> **作者**：SOTA AI ｜ Hermes Agent 技术实现
> **核心命题**：SkillOpt 真正难落地的不是"让模型提出 skill patch"，而是更底层的问题：**你怎么证明一个 agent 真的变好了？**本文给出 7 模块闭环的工程实施蓝图。

## 1. 为什么 Agent 不能只看"这次成功了"

普通软件测试可以输入固定参数，断言返回值。Agent 不一样。它的输出不仅是 final answer，还包括中间决策（调用哪些工具、是否读取正确文件、是否验证修改结果、是否越权访问、是否在失败后做了合理排查、是否把大输出截断后仍能找到关键证据）。

**Agent Eval Harness 评估三层结果**：

| 层级 | 评估对象 | 典型问题 |
|---|---|---|
| Final output | 最终答案或 artifact | 是否完成用户目标 |
| Process trace | 工具调用和观察 | 是否走了正确路径 |
| Policy boundary | 权限、审批、安全 | 是否违反约束 |

没有轨迹，reflection 只能看结果；有轨迹，才能知道失败发生在理解、检索、工具、验证还是安全边界。

## 2. Eval Harness 的最小闭环：7 模块

1. **TaskSet**：定义任务输入、初始文件、环境状态、可用工具、期望输出和评分方式
2. **HarnessAdapter**：启动 agent turn，注入 task context，限制工具集，收集 messages、tool calls、observations 和 artifacts
3. **TrajectoryStore**：保存完整执行过程
4. **Verifier**：把轨迹和输出变成可比较分数
5. **Selection Gate**：决定一个候选 skill 是否接受
6. **Regression Gate**：防止"修好 A、打坏 B"
7. **Report & Replay**：输出失败样本、关键轨迹、分数变化、工具统计和可复现命令

## 3. 任务集不是 prompt 列表，而是环境快照

**代码修改任务 TaskSet 至少需要**：repo checkout / 用户请求 / 初始 git diff / 允许的工具集 / 禁止的路径 / 验证命令 / 期望 artifact / 超时和预算

**文档任务 TaskSet**：输入文档 / 可访问资料 / 目标格式 / 禁止引用的来源 / 评分 rubric

**Skill patch 任务 TaskSet**：当前 SKILL.md / 历史 rejected edits / 训练样本失败轨迹 / selection split / patch budget

> TaskSet 是"任务 + 世界状态 + 验证契约"。只有 prompt，没有 world state，就很难复现。

## 4. TrajectoryStore：Agent Eval 的事实来源

Eval Harness 需要把 trajectory 扩展成结构化事件流：

```
run_id | task_id | model | skill_version | toolset
messages[] | tool_calls[] | tool_results[] | artifacts[]
verifier_results[] | policy_events[] | duration_ms | token_usage
```

**关键洞察**：工具输出太大时，不能把全文塞回上下文，要写入 sandbox temp dir 并用 `<persisted-output>` 给模型 preview + 文件路径。

TrajectoryStore 不应该只保存"模型看到了什么"，还应该保存"工具真实返回了什么"。否则 verifier 和 debug 都会丢证据。

## 5. Verifier 不是函数，而是一组判定器（6 类）

| Verifier | 适用任务 | 输出 |
|---|---|---|
| **Exact verifier** | 问答、分类、JSON 输出 | pass/fail |
| **Artifact verifier** | 文件、表格、代码修改 | diff、hash、字段检查 |
| **Execution verifier** | 代码、脚本、测试命令 | exit code、stdout、coverage |
| **Trace verifier** | 工具路径、操作顺序 | 是否读取/验证/回滚 |
| **Policy verifier** | 安全、审批、敏感路径 | violation events |
| **Judge verifier** | 开放答案、摘要、策略判断 | rubric score |

**成熟 harness 应该输出 breakdown** 而非总分：
```
final_answer_score: 0.8
artifact_score: 1.0
trace_score: 0.6
policy_score: 1.0
regression_risk: medium
```

这避免两个问题：
1. final answer 掩盖过程错误（如代码改对了但没跑测试）
2. 过程正确但 final answer 小错（应指导 skill patch 而不是判死）

## 6. Selection Gate：Skill Patch 不能靠直觉合入

**Selection Gate 逻辑**：
```
old_score = evaluate(selection_set, old_skill)
new_score = evaluate(selection_set, candidate_skill)

accept only if:
  new_score > old_score
  and policy_score has no regression
  and critical regression set passes
```

**三个细节**：
1. 训练样本不能决定接受（训练只产生候选规则）
2. **tie 不应该默认接受**（自然语言规则增加上下文长度和冲突风险）
3. **安全回归要高优先级**（一个 patch 即使提升任务成功率，只要引入越权访问就应该拒绝）

## 7. Regression Gate：让 Agent 能长期进化（3 类）

**三类 regression**：

1. **Domain regression**：只覆盖该 skill 所属任务域（spreadsheet / code review / web research）
2. **Runtime regression**：覆盖基础 agent 能力（tool call 解析 / 工具结果持久化 / checkpoint-resume / 上下文压缩 / approval）
3. **Safety regression**：覆盖敏感路径 / 危险命令 / 权限升级 / prompt injection / 数据泄露

## 8. Rejected Buffer：失败 patch 要成为训练数据

失败 patch 告诉 optimizer：
- 哪类规则听起来对但实际会降分
- 哪些行为已经被 existing skill 覆盖
- 哪些修复过于样本特化
- 哪些 patch 会触发安全回归

Rejected Buffer 应记录：
```
candidate_patch | source_failures | selection_score_delta
regression_failures | rejection_reason | review_notes
```

> 后续 reflection 看到这些记录，就不会反复提出同一类坏规则。

这和软件工程里的 review history 很像。好的团队不会只保存 merged PR，也会保留 rejected design 的理由。

## 9. Hermes 落地路径：6 阶段

| 阶段 | 内容 |
|---|---|
| **第 1 阶段** | 只做离线 eval — 新增 eval_runs/ 目录，复用 batch_runner.py 的 checkpoint/resume |
| **第 2 阶段** | 接入 trajectory — 每个 eval run 保存完整 messages、tool calls、tool results 和 persisted-output 路径 |
| **第 3 阶段** | 加 verifier registry — 不同任务绑定不同 verifier（命令执行、文件 diff、JSON schema、LLM judge、policy checker） |
| **第 4 阶段** | 加 skill gate — 对 skill_manage(action="patch") 或人工 patch 生成 candidate skill，selection split 上比较 old/new score |
| **第 5 阶段** | 加 regression suite — 每个 skill 维护一组 critical tasks，critical regression 失败 patch 不能自动合入 |
| **第 6 阶段** | 加 rejected buffer — 把失败 patch 和原因写入 skill 训练历史，只给 optimizer 使用，不注入线上 prompt |

## 10. 最小数据结构

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

## 11. 5 大常见坑

1. **只跑训练集**：会把 skill 训练成"样本答案提示词"，而不是可迁移过程知识
2. **只看平均分**：平均分会掩盖安全回归（Agent 系统里某些任务失败成本远高于普通任务）
3. **不保存完整轨迹**：失败分析只能靠猜
4. **用 LLM judge 替代所有 verifier**：LLM judge 适合开放任务，不适合文件 diff、代码执行、权限边界这类可确定验证
5. **自动合入过大 patch**：自然语言 skill 越长冲突越多；bounded patch 和 rollback 比"让模型重写最佳实践"更可靠

## 12. 结论

> **Self-improving skills 的关键不是"self"，而是"verified improvement"。**
> 
> 没有 Eval Harness，就没有可验证改进；没有轨迹，就没有可诊断失败；没有 selection gate，就没有办法区分真实提升和样本过拟合；没有 regression gate，就无法让 skills 长期进化。
>
> Hermes Agent 已经具备一些拼图：轨迹保存、批量运行、工具统计、大输出持久化、审批系统、执行沙箱、测试体系。下一步不是再加一个"让模型反思"的 prompt，而是把这些拼图组织成一个完整评测闭环。
>
> 这个闭环一旦建立，skills 就不再只是手写经验文档，而会变成可训练、可验证、可回滚、可迁移的运行时资产。这也是从 agent demo 走向 agent engineering 的分水岭。

## 参考资料

- SkillOpt: Executive Strategy for Self-Evolving Agent Skills — https://arxiv.org/pdf/2605.23904
- Hermes Agent 代码引用：agent/trajectory.py, batch_runner.py, tools/tool_result_storage.py, tools/approval.py, tools/code_execution_tool.py

#HermesAgent #EvalHarness #SkillOpt #SelectionGate #RegressionGate #Verifier
