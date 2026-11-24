# AI Agent 评测实战：5 维指标体系 + L1/L2/L3 准出分级 + 评测集三层设计 + 6 大 Benchmark + LLM-as-Judge 三模式

> 📊 Level ⭐⭐⭐⭐⭐ | 39.1KB

## AI Agent 评测实战：5 维指标体系 + L1/L2/L3 准出分级

> **来源**：AI编程实践 公众号，2026-06-18
> **核心命题**：**Agent 评测要从"答得好不好"转向"事办没办成"**。本文给出工程化的 **5 维指标体系**（任务完成度/工具使用/规划推理/SubAgent 协作/安全效率）+ **L1/L2/L3 分级准出门槛** + **评测集三层设计**（单工具 200-500 / 多工具链 100-200 / 对抗边界 50-100）+ **LLM-as-Judge 三模式**（结果/工具链/对比）+ **6 大 Benchmark 对比表**。

## 一、定位：Agent 评测与对话评测的本质差异

| 对比维度 | 对话 LLM 评测 | Agent 评测 |
|---|---|---|
| 评测对象 | 单轮/多轮回复 | 多步任务执行链 |
| 核心问题 | 答得好不好 | 事办没办成 |
| 评测粒度 | 单次对话 | 完整任务（含工具调用链） |
| 正确性 | 答案 vs 参考答案 | 任务结果 vs 预期结果 |
| 路径多样性 | 低 | 高（不同工具组合可达同一目标） |
| 错误处理 | 基本不考虑 | **核心评测维度** |

### Agent 评测的 5 个独特挑战

1. **任务链 vs 单次回答**：Agent: 用户给目标 → 规划 → 工具 A → 读结果 → 工具 B → 发现错误 → 修正 → 工具 C → 返回结果
2. **工具调用正确性难自动判定**：`read_file("src/auth.ts")` vs `read_file("src/auth/login.ts")` 算对还是算错？
3. **犯错+修复是正常行为**：评测"从错误中恢复"的能力
4. **SubAgent 协作是空白地带**：创建时机、并行调度、结果整合
5. **路径多样性**：不同 Agent 走不同路径都可能是对的——只能按"结果"评判

## 二、5 维 Agent 评测指标体系

```
┌─────────────────────────────────────────────────────────────┐
│                  Agent 5 维评测框架                          │
│                                                             │
│  ① 任务完成度（北极星指标）                                   │
│     任务成功率 / 目标达成率 / 输出可用率                       │
│                                                             │
│  ② 工具使用质量                                              │
│     工具选择准确率 / 参数准确率 / 调用链效率                   │
│                                                             │
│  ③ 规划与推理                                                │
│     规划合理性 / 步骤效率 / 死循环率 / 错误恢复率              │
│                                                             │
│  ④ SubAgent 协作                                            │
│     SubAgent 创建时机 / 并行合理性 / 结果整合质量              │
│                                                             │
│  ⑤ 安全与效率                                                │
│     危险操作率 / 幻觉引入率 / 平均完成时间 / 费用              │
└─────────────────────────────────────────────────────────────┘
```

### 2.1 维度① 任务完成度（北极星）

**判定"成功"的 3 个层次**：
- **L1 - 严格成功**：输出完全匹配预期，零人工修正即可用（代码可直接运行并通过所有测试）
- **L2 - 基本成功**：输出核心部分正确，需少量人工修正
- **L3 - 失败**：输出无法使用，或 Agent 中途报错放弃

**生产级基线**：

| Agent 类型 | L1 ≥ | L1+L2 ≥ |
|---|---|---|
| 代码生成 Agent | 40% | 75% |
| 文档写作 Agent | 60% | 85% |
| 数据分析 Agent | 50% | 80% |

**3 个子指标**：
- 端到端任务成功率
- 目标达成率（子目标完成度）
- 输出可用率（无需修改即可用的比例）

### 2.2 维度② 工具使用质量

**工具选择准确率**（分场景基线）：
- 单一工具场景：≥ 95%
- 多工具场景：≥ 90%
- 需特定工具场景：≥ 85%

**参数准确率**（分档打分）：
- 3 分：参数完全正确
- 2 分：核心参数正确，可选参数有出入但不影响结果
- 1 分：核心参数部分错误但方向对
- 0 分：参数完全错误或缺失必要参数

**调用链效率** = 最小必要调用次数 / Agent 实际调用次数
- 效率 > 1.0 → 多余调用
- 效率 = 1.0 → 最优
- **生产基线：≥ 0.6**

**Python 评测代码**：
```python
def evaluate_tool_call_chain(agent_trace, reference_trace):
    score = {
        "tool_selection": 0,
        "parameter_accuracy": 0,
        "chain_efficiency": 0,
    }
    selection_correct = 0
    for step in agent_trace:
        if step["tool"] in allowed_tools_for_step(reference_trace, step):
            selection_correct += 1
    score["tool_selection"] = selection_correct / len(agent_trace)
    param_scores = []
    for step in agent_trace:
        ref = find_matching_step(reference_trace, step)
        if ref:
            param_scores.append(score_params(step["args"], ref["args"]))
    score["parameter_accuracy"] = sum(param_scores) / len(param_scores)
    score["chain_efficiency"] = len(reference_trace) / len(agent_trace)
    return score
```

### 2.3 维度③ 规划与推理

**规划合理性**（1-5 分人工/LLM-Judge 评分）：
- 5 分：计划完整、步骤清晰、考虑了异常情况
- 3 分：基本合理但遗漏边缘情况
- 1 分：根本性错误，按此执行必然失败

**死循环率**（**Agent 特有红线指标**）：
- 检测：连续 5 次调用同一工具且参数相同 / 上下文窗口内出现 3 次以上相同决策模式
- Agent 自身发出"我无法完成"信号 → **不算死循环**（正确行为）
- **生产级红线：> 2% 必须修复**

**错误恢复率** = 从错误中恢复并最终成功的任务数 / 遇到错误的任务总数
- **生产基线：≥ 60%**

### 2.4 维度④ SubAgent 协作

**SubAgent 创建时机合理性**：

| 应并行 ✅ | 不应并行 ❌ |
|---|---|
| 独立模块搜索（前端 + 后端 + 数据库） | 简单搜索（单文件单关键词） |
| 独立文件分析（多个不相关文件） | 强依赖步骤（必须先找到文件再分析） |
| 多维度审查（安全 + 性能 + 规范） | 结果需要实时交互判断的 |

**结果整合质量**（4 项检查）：
1. 包含所有 SubAgent 关键发现
2. 无重复或矛盾信息
3. SubAgent A → SubAgent B 依赖传递正确
4. 失败 SubAgent 兜底处理

### 2.5 维度⑤ 安全与效率

**安全指标红线**：
- **危险操作率**（rm -rf / drop table / force push）：目标 **0%**
- **幻觉引入率**（编造 API / 虚构文件内容 / 错误理解工具返回结果）：基线 **≤ 3%**

**效率指标**：
- 平均任务完成时间：简单任务 < 30s，复杂任务 < 5min
- 平均费用/任务：API 调用费用 + 工具执行费用
- Token 效率：若 Prompt 变更 Token 翻倍但质量只提升 5% → 值得讨论

## 三、评测集三层设计

| Layer | 规模 | 类型 | 用途 |
|---|---|---|---|
| **Layer 1：单工具任务集** | 200-500 个 | read_file / search / execute | 回归测试，每次变更必跑 |
| **Layer 2：多工具链任务集** | 100-200 个 | 搜索→读取→分析 / 编辑→验证 / SubAgent 类 | 核心评测，决定能否上线 |
| **Layer 3：对抗/边界任务集** | 50-100 个 | 工具不可用 / 文件不存在 / 权限不足 / 20+ 步复杂任务 | 安全评测 + 鲁棒性测试 |

**Agent 任务标注 JSON Schema**：
```json
{
  "task_id": "agent-eval-001",
  "category": "multi-tool-chain",
  "difficulty": "medium",
  "context": {
    "project": "nodejs-web-app",
    "files": ["src/auth.ts"],
    "constraints": []
  },
  "instruction": "分析项目的认证逻辑，找出所有安全问题并生成修复报告",
  "expected_outcome": {
    "type": "file_created",
    "must_contain": ["XSS漏洞", "CSRF防护"],
    "must_not_contain": ["删库"],
    "files_expected": ["security-report.md"]
  },
  "reference_trace": [
    {"tool": "search_code", "args": {"query": "auth"}},
    {"tool": "read_file", "args": {"path": "src/auth/login.ts"}}
  ],
  "key_tools": ["search_code", "read_file"]
}
```

## 四、LLM-as-Judge 三模式

由于 Agent 输出是非确定性的（不同路径可能都对），LLM-as-Judge 是最实用的评测方式。

### 模式 1：结果评判（最常用）

不看执行路径，只看最终结果是否符合预期。

**Judge Prompt 模板**：
```
你是一个Agent评测员。给定一个编程任务和Agent的执行结果，判断结果是否符合任务要求。

任务：{instruction}
预期结果要点：{expected_outcome}
Agent输出：{agent_output}

请判断：
1. 任务是否完成？（完成/部分完成/未完成）
2. 输出是否包含预期要点？
3. 整体质量评分（1-5分）
4. 评分理由
```

### 模式 2：工具链评判

评估 Agent 的工具使用是否合理：
1. 工具选择是否合理？（合理/基本合理/不合理）
2. 是否有冗余调用？
3. 是否有更好的工具选择？
4. 整体效率评分（1-5 分）

### 模式 3：对比评判（A/B 实验用）

两个 Agent 执行同一任务，判断哪个更好（结果质量 / 执行效率 / 错误处理 / 输出可用性）。

## 五、6 大 Agent 评测 Benchmark 对比

| Benchmark | 任务类型 | 评测方式 | 关键指标 | 代表模型得分 |
|---|---|---|---|---|
| **SWE-bench** | 从 GitHub issue 自动修 bug / 加功能 | 运行测试用例，看 patch 是否通过 | resolve rate | Devin **13.86%**, SWE-Agent **12.47%** |
| **ToolBench** | 16K+ 真实 API 工具调用场景 | 工具选择 + 参数正确性 | 工具选择准确率、参数准确率、端到端成功率 | — |
| **AgentBench** | 8 个交互环境（OS / DB / 知识图谱 / Web） | 模拟环境自主操作 | 任务完成率 | — |
| **WebArena** | 真实 Web 环境（购物、协作、内容管理） | 浏览器操作 | 任务成功率 | — |
| **τ-bench** | 推理 + 工具调用组合任务 | 检查推理链 | 推理链正确率、工具调用准确率 | — |
| **GAIA** | 推理 + 多模态 + 工具使用的复杂问题 | 答案精确匹配（避免 LLM-Judge 主观性） | 必须"答对"而非"答得好" | — |

## 六、5 大评测方法论

### 方法论 1：LLM-as-Judge（LMSYS 范式）
- 用 GPT-4 等强模型作为裁判
- **关键实践**：位置偏差修正（交换 AB 位置各评一次）+ 多 Judge 一致性（≥2 个交叉验证）+ Judge 与人工校准
- 资源：MT-Bench、Chatbot Arena 数据集公开

### 方法论 2：Arena 式众包评测（Chatbot Arena）
- 真实用户在盲测中选择"哪个回答更好"，Elo 评分排名
- 优点：真实用户偏好、大规模、持续更新
- 局限：只反映"偏好"不反映"能力"

### 方法论 3：G-Eval（Chain-of-Thought 评测）
- 让 LLM Judge 先写出评测步骤（CoT），再打分
- 和人工评测相关性显著提升（超直接打分 10-15%）

### 方法论 4：Eval-as-Service（OpenAI Evals / Anthropic Eval Tool）
- 每个 PR 自动跑评测，评测结果作为 merge 的 blocking check
- 工具：LangSmith CI、DeepEval CI、Promptfoo CI

### 方法论 5：分层阶梯式评测（Google/DeepMind 实践）

| Level | 能力 | 评测方式 |
|---|---|---|
| L1 | 基础能力（单轮问答、翻译、摘要） | 自动化指标 |
| L2 | 推理能力（多步推理、代码生成） | LLM-Judge |
| L3 | Agent 能力（工具使用、规划、自主执行） | 端到端任务 |
| L4 | 安全与对齐（红队测试、偏见检测） | 专项评测 |

## 七、L1/L2/L3 准出分级（变更风险维度）

| 等级 | 范围 | 必须过的评测 | 准出门槛 |
|---|---|---|---|
| **L1**（低风险） | SKILL 内容修改、Prompt 措辞调整、单个工具配置变更 | 单工具任务集回归（200条+）+ LLM-as-Judge 结果评判（100条多工具） | 两项均不劣化 |
| **L2**（中风险） | 模型版本升级、新增/移除工具、Agent 系统Prompt 变更 | L1 全部 + 多工具链任务集（100条+，成功率 ≥ 基线）+ 工具选择准确率 ≥ 85% + 死循环率 = 0% + 安全评测（危险操作率=0%，幻觉率≤3%） | 核心指标无劣化 + 安全全通过 |
| **L3**（高风险） | Agent 框架升级、模型全量切换、SubAgent 策略变更 | L2 全部 + 对抗/边界任务集（错误恢复率 ≥ 60%）+ 3 人以上人工评测（50 条多工具链，Cohen's Kappa ≥ 0.6）+ 灰度上线（5%→20%→50%→100%）+ 线上费用对比（不劣化超 30%） | 全部通过 + 至少 1 个核心维度显著提升 |

**准出决策流程**：
```
变更发起 → 识别变更等级 (L1/L2/L3) → 执行对应评测套件
                                       ↓
                            ┌──────────┴──────────┐
                            ↓                     ↓
                        全部通过                任一失败
                            ↓                     ↓
                        准出合并            回滚/修复 + 重新评测
```

## 八、持续运营

### 评测集定期更新（每月）
- 从线上真实 Agent 执行日志中抽样新任务
- 补充新发现的 badcase
- 淘汰"已过时"的任务（Agent 已经 100% 通过的）

### 异常监控告警阈值
| 指标 | 告警阈值 |
|---|---|
| 任务成功率突然下降 | > 10% |
| 死循环率 | > 0% |
| 工具选择准确率下降 | > 5% |
| 幻觉率上升 | > 50% |

### "评测墙"（Evaluation Wall）
- 每个 PR / 每次 Prompt 变更 → 自动触发 L1 评测
- 每次模型升级 → 自动触发 L1+L2 评测
- 每个版本发布前 → 触发全量 L3 评测

## 九、核心原则（5 条）

1. **任务完成度是北极星指标** — 不管 Agent 多聪明、工具用得多好，最终只看"事有没有办成"
2. **评测集必须覆盖端到端任务链** — 不能只用"回答得好不好"来评测 Agent
3. **死循环和幻觉是 Agent 的红线** — 死循环率必须为 0%，幻觉率必须持续压低
4. **按风险投入评测资源** — Prompt 微调不用跑全套，模型升级必须跑全套
5. **LLM-as-Judge 是 Agent 评测的最佳方式** — 路径多样性让规则匹配失效

## 十、与既有实体的关联

| 实体 | 关系 | 互补角度 |
|---|---|---|
| [Ai Evals Methodology](https://github.com/QianJinGuo/wiki-public/blob/main/entities/ai-evals-methodology.md) | **方法论概念层** | 概念页：人工/代码/LLM-as-Judge 三大评估类型 + 何时需要评估器的判断框架；本文是其在 Agent 场景的工程化展开 |
| [Agent Eval Wallezhang Yaml Driven Agent Evaluation Framework](https://github.com/QianJinGuo/wiki-public/blob/main/entities/agent-eval-wallezhang-yaml-driven-agent-evaluation-framework.md) | **YAML 驱动框架** | AgentEval 工具（130 行）：YAML 驱动的 Agent 评测框架 + pass@k + Golang + CI-CD |
| [Agent Evalkit Aws Opensource Cli Agent Eval Toolkit](https://github.com/QianJinGuo/wiki-public/blob/main/entities/agent-evalkit-aws-opensource-cli-agent-eval-toolkit.md) | **AWS 开源工具** | AgentEvalKit：AWS 开源的 CLI Agent 评测工具包 |
| [Aws Reinforcement Fine Tuning Llm As Judge](https://github.com/QianJinGuo/wiki-public/blob/main/entities/aws-reinforcement-fine-tuning-llm-as-judge.md) | **LLM-as-Judge RFT** | AWS 用 LLM-as-Judge 做 RLHF/RFT 的实践 |
| [Spotify Llm Evals Funnel Not Fork](https://github.com/QianJinGuo/wiki-public/blob/main/entities/spotify-llm-evals-funnel-not-fork.md) | **评测漏斗** | Spotify：评测要 funnel 而非 fork |
| Langsmith Trajectory Evals | **LangSmith trace 评测** | LangSmith trajectory 级评测 |
| [Saas Bench Gui Agent Eval Unipat](https://github.com/QianJinGuo/wiki-public/blob/main/entities/saas-bench-gui-agent-eval-unipat.md) | **GUI Agent 评测** | SaaS-Bench：GUI Agent 评测基准 |
| [Taobao Smart Shopping Guide Agent Evaluation Pzmx](https://github.com/QianJinGuo/wiki-public/blob/main/entities/taobao-smart-shopping-guide-agent-evaluation-pzmx.md) | **电商导购 Agent 评测** | 淘天智能导购 Agent 评测实践 |
| [Aliyun Agentloop Enterprise Agent Self Evolution Flywheel](https://github.com/QianJinGuo/wiki-public/blob/main/entities/aliyun-agentloop-enterprise-agent-self-evolution-flywheel.md) | **阿里 AgentLoop** | 4 环飞轮中"评估环"的产品化（Agent-as-a-Judge 13 个评估器） |
| [Harness Engineered Business Agent Evaluation Aliyun Boyu](https://github.com/QianJinGuo/wiki-public/blob/main/entities/harness-engineered-business-agent-evaluation-aliyun-boyu.md) | **业务 Agent 评测** | 阿里"伯禹"业务 Agent 评测实践 |
| [Better Harness Eval Trace Harness Hill Climbing](https://github.com/QianJinGuo/wiki-public/blob/main/entities/better-harness-eval-trace-harness-hill-climbing.md) | **trace 评测** | trace 级 harness 爬坡的工程方法 |
| [Claw Swe Bench Harness Evaluation Benchmark Tokenrhythm](https://github.com/QianJinGuo/wiki-public/blob/main/entities/claw-swe-bench-harness-evaluation-benchmark-tokenrhythm.md) | **SWE-Bench 评测** | Claw-SWE-Bench：harness 对编程 Agent 影响的独立基准 |
| Anthropic Demystifying Evals For Ai Agents | **Anthropic evals** | Anthropic Agent 评测揭秘 |

## 深度分析

### 红线指标之间的相互挤压：死循环率、错误恢复率与调用链效率

三条指标各自陈述时都成立，放进同一张约束表里会立刻显出张力。死循环率必须为 0 的红线与错误恢复率 ≥ 60% 的基线方向相反：一个被高压规则驯化出"宁可早停也不重试"行为的 Agent，死循环率会很漂亮，错误恢复率却必然塌陷——因为"Agent 自身发出无法完成信号不算死循环"的豁免条款，实际是在奖励放弃。反过来，一个敢于反复重读文件、换关键词再搜的 Agent，恰恰因为框架开篇肯定的"犯错+修复是正常行为"而推高实际调用次数，机械地压低维度②的调用链效率（最小必要次数/实际次数）。于是维度②与维度③之间构成一个三难：越激进地探索恢复路径，效率分越低；越保守地早停，红线越干净但恢复能力越差。现有检测规则（连续 5 次同工具同参数、3 次相同决策模式）度量的是重试的次数而非重试之间的信息增量——参数变了、决策路径分化了，就不是循环。若把三条指标当作各自独立的及格线去优化，团队会被推向"保守早停"这个对三者同时有利的局部最优；正确的读法是把它们当作一组联合边界条件来审读，任何一条的改善都必须同时报告另外两条付出的代价。

把这个张力操作化的方向不是再加一条独立阈值，而是改变报告结构：每次变更的评测报告应同时给出死循环率、错误恢复率、调用链效率三个指标的联合快照，并显式标注每一个改善是以哪一条的退化为代价换来的。更进一步，可以把"有效恢复"（恢复路径最终成功）消耗的额外调用次数与其挽救的任务价值并置，形成恢复的性价比视角，而不是单独追求恢复率最大化。这背后是对事实的承认：探索预算是有限资源，评测体系的职责不是命令 Agent 既永不放弃又永不重试，而是把"值得重试"与"应当止损"的边界显性化，让三条红线从彼此冲突的命令变成一张可谈判的预算表。

### 准出分级保护的是变更风险，漏掉的是环境漂移

L1/L2/L3 分级的隐含假设是：风险由变更引入，变更越重、评测越全。但生产环境在两次变更之间持续漂移——依赖库升级、仓库重构、工具服务端行为变化、上游接口弃用——这些都不经过准出门槛，却直接使 Layer 1/2 的历史基线失效。更尖锐的是，对抗/边界任务集只在高风险变更（L3 级）时才被触发，可"文件不存在、权限不足、工具不可用"这类失效恰恰最容易在低风险变更之后的日常运行中率先暴露。因此持续运营一节的监控告警阈值不应读作补充手段，而应读作漂移风险的那个缺失闸门：评测墙拦截变更引入的回归，是 [Eval Optimizer Firewall](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/eval-optimizer-firewall.md) 承担的角色；线上监控拦截时间引入的退化。两者合起来才构成完整的准出语义，只按变更等级配置评测强度，等于默认环境是静止的。Anthropic Demystifying Evals For Ai Agents 对 Agent 评测的分析同样指出，真正的失败集中在长尾场景而非均值表现——而长尾正是漂移最先冲击的区域：均值指标仍然稳定时，长尾可能已经开始塌方。

顺着这个缺口再推一步，基线本身应当被当作有版本的生命周期对象来管理：一条基线实际是 任务集 × 环境版本 × Judge 版本 × 模型版本 的四元组快照，任何一元变动都应触发基线重锚（在同一组合下重跑并重新发布基准值），而不是默认旧基线仍然适用。实践中最常见的隐性误诊是把"连续两个月成功率下滑"归因于模型或 Prompt 退化，排查到最后发现只是仓库结构重构让旧任务的 expected_outcome 过时了。评测集对环境的隐式依赖之所以危险，恰恰因为它从未被声明——没被声明的前提，永远不会进入变更评审的检查清单。

### LLM-as-Judge 本身是未被分级的变更源

框架把模型升级、框架升级列为 L2/L3 级变更，却默认 Judge 模型是测量仪器而非被测系统。Judge 换版、Judge 提示词微调、甚至 Judge 服务端的静默更新，都会让历史基线失去可比性：上周与本周测得的 75% 通过率若出自不同 Judge 版本，数字相同而含义不同。由此有三个推论：其一，Judge 版本必须像依赖项一样被锁定与记录，任何基线只在其产生时的 Judge 版本内有效；其二，Judge 升级本身应按中风险变更对待，用固定的校准任务集量化新旧判定器的漂移，再决定是否重测基线；其三，结果评判与工具链评判执行着两种不相容的哲学——前者承认路径多样性、只认终局，后者隐含了一条 reference_trace 式的"正路"。评测任务 Schema 中保留 reference_trace 字段，即使团队声明只做结果评判，该字段也在持续诱导评测向模仿参考路径的方向优化，恰好惩罚了框架开篇强调的路径多样性。合理的分工是：结果评判决定"能不能上线"，trace 级分析只回答"下一步往哪里爬坡"（[Better Harness Eval Trace Harness Hill Climbing](https://github.com/QianJinGuo/wiki-public/blob/main/entities/better-harness-eval-trace-harness-hill-climbing.md) 的用法），路径层面的分数永远不应反向变成准出门槛，否则 LLM-as-Judge 最大的价值——容忍不同的正确路径——会被自己的辅助维度侵蚀掉。

与 Judge 版本化并列的，还有一个未言明的测量协议缺口：运行次数。Agent 执行是非确定性的，同一 (Agent, 任务) 对两次运行可能一胜一败，而框架所有阈值（L1 ≥ 40%、错误恢复率 ≥ 60%、死循环率 = 0%）都没有声明每任务跑几次、按哪种口径聚合——单次运行的通过率、多次运行的平均成功率、pass@k 与 pass^k 度量的其实是不同的东西（能力上限与稳定性下限各取其一）。"死循环率 = 0%" 在单次运行口径下尤其脆弱：一个 2% 的真实死循环率在 100 条任务的一次运行中大概率观测为零，红线由此沦为抽签。配套的动作是把运行协议写进分级标准本身——例如 L2 级每任务至少 3 次运行、A/B 对比强制使用同任务集的配对设计——否则所有"不劣化"判定都是在噪声幅度内做决策。

### 评测集是可执行规格：淘汰机制、幸存者偏差与代价结构

评测集一旦用于 merge blocking，它事实上成为 Agent 产品的可执行规格说明书："完成"的定义不再由需求文档给出，而由这三五百条任务给出。这个地位带来两个二阶后果。第一，每月淘汰 100% 通过的任务在维持区分度的同时引入幸存者偏差：留存下来的任务聚积着 Agent 反复失败的样本，而反复失败的原因可能是任务描述含混、预期结果过时，或环境变化已使题目本身失效——未必是 Agent 能力不足。淘汰因此必须伴随对留存任务的规格复核，否则评测集会被出题缺陷缓慢污染，团队还会把这些缺陷误读成能力缺口去"修复"。第二，分级准出的真实功能是评测成本的摊销结构：多数变更只付单工具回归的低成本，少数昂贵变更才触发全量套件，各层规模数字（200-500/100-200/50-100）与其说是统计学的样本量要求，不如说是一张按变更风险概率分配评测预算的定价表，这正是评测成本应当分层流动的逻辑 [Spotify Llm Evals Funnel Not Fork](https://github.com/QianJinGuo/wiki-public/blob/main/entities/spotify-llm-evals-funnel-not-fork.md)。顺着这层理解，评测集的轮换与扩充就不是运营杂务，而是规格维护 [Eval Surface Rotation](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/eval-surface-rotation.md)：这份"活的规格"由谁、经什么门槛修改，比谁修改 Agent 代码更值得被制度化——因为改代码出错会被评测集拦住，改评测集出错则会放行其后所有错误。

把这条逻辑推到底还会撞上 Goodhart 问题：评测集一旦成为 merge blocker，它同时成为团队的适应度景观——Prompt 与 SKILL 的每次修改都是一次针对固定几百条任务的爬坡，被优化的逐渐是"通过这套评测"而非"办成用户的事"。每月从线上日志抽样新任务、补充 badcase 的轮换机制因此获得第二重身份：它不只是维持区分度的运营动作，而是防止过拟合的核心机制，轮换节奏直接决定了评测集被"刷穿"的时间尺度。更隐蔽的是 badcase 采样形成的闭环——线上流量决定评测课程，评测课程塑造 Agent 行为，行为再产生新的线上流量——评测集由此携带的永远是昨天的失败分布，会持续把能力投资引向已经出现过的失败形态，而非尚未出现的。对这份偏差保持自觉，是把评测体系当作度量仪器而非目标本身的最后一道防线。

## 十一、实践启示

### 对 Agent 平台建设者：5 维框架 + L1-L3 准出是基础设施
没有分级准出门槛，Agent 评测就只是"测着玩"，无法成为 release blocker。本文给出的 L1（200条）/L2（100条）/L3（50条对抗）规模基线 + Cohen's Kappa ≥ 0.6 人工评测一致性 + 灰度 5%→100% 是可直接套用的工程模板。

### 对 Agent 设计者：死循环和幻觉是红线
> 死循环率 > 2% 必须修复，> 0% 就要告警

设计 Agent 时就要在 runtime 内置死循环检测（5 次同工具同参数 / 3 次相同决策模式触发）。幻觉率 ≤ 3% 是基线，> 50% 上升需立即告警。

### 对评测工具选型者：6 框架各有侧重
LangSmith / Braintrust 适合全面 Trace + 评测 + 人工标注（付费）；DeepEval + Promptfoo 适合开源快速上手；Ragas 重 RAG 场景；Arize Phoenix 偏线上监控。本文给出选型决策树。

### 对评测方法论选择者：5 大方法论组合用
LLM-as-Judge + Arena + G-Eval + Eval-as-Service + 分层阶梯式 — 不是互斥而是互补。生产 Agent 评测通常需要 LLM-as-Judge（语义）+ G-Eval（高分辨力）+ Eval-as-Service（CI 集成）+ 分层（成本匹配）四件套。

### 对比阿里 AgentLoop：评估环的产品化
阿里 AgentLoop 把本文的"评估环"产品化为 13 个标准评估器 + Agent-as-a-Judge 范式（90% 一致率 vs LLM-Judge 65%），且把评估与 Trace2Dataset / 记忆库 / 经验库整合形成完整 4 环飞轮。本文侧重"自己搭建评估体系"，AgentLoop 侧重"用现成平台"。

## 十二、引用与延伸阅读

→ [原文存档](https://mp.weixin.qq.com/s/emNgDJciraMSQIshpcZIIw)

**评测框架官方资源**：
- LangSmith https://www.langchain.com/langsmith
- DeepEval https://docs.confident-ai.com/
- Promptfoo https://promptfoo.dev/
- Ragas https://docs.ragas.io/
- Arize Phoenix https://phoenix.arize.com/

**Benchmark 资源**：
- SWE-bench https://www.swebench.com/
- ToolBench https://github.com/OpenBMB/ToolBench
- AgentBench https://github.com/THUDM/AgentBench
- WebArena https://webarena.dev/
- GAIA https://huggingface.co/datasets/gaia-benchmark

#Agent评测 #5维指标体系 #LLM-as-Judge #分级准出 #死循环红线

## 相关实体

- [MOC](https://github.com/QianJinGuo/wiki-public/blob/main/moc/evaluation-benchmarks-extended.md)

---

