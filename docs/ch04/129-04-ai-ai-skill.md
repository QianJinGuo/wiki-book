# 04—为什么不能让 AI 自己评审自己？AI Skill 四层验证体系完整解析

## Ch04.129 04—为什么不能让 AI 自己评审自己？AI Skill 四层验证体系完整解析

> 📊 Level ⭐⭐ | 14.6KB | `entities/ai-skill-四层验证体系.md`

## 问题：为什么不能让模型自己评审自己

让模型自己评审自己的输出，会产生「自判卷偏差」——这是 AI Skill 四层验证体系要解决的核心问题。

实验中观察到的现象：

- 同一个用例，with_skill 跑出来通过率 100%，without_skill 也是 100%
- 展开看 evidence，发现很多断言的 evidence 是空的，或者只写了「根据整体输出判断通过」
- 这说明评审是「感觉通过」，不是「有证据通过」

这个问题本质上是 **执行者与评审者未分离** 导致的确认偏误（confirmation bias）。参见 [对抗式验证](https://github.com/QianJinGuo/wiki/blob/main/entities/adversarial-verification.md) 中关于 Worker-Verifier 对抗关系的论述——Verifier 若与 Worker 共享上下文，就会丧失独立校验能力。

## 四层验证体系总览

```
Layer 0: 执行模式分发
    → 检测 Skill 类型（mcp_based / code_execution / text_generation）
    → 选择对应执行模式，分发给 Layer 1
Layer 1: Executor（执行层）
    → 真实执行 Skill，记录所有证据（transcript + response + metrics）
Layer 2a: 字段精确校验（Ground Truth）
    → 从 transcript 直接提取字段值，assertEqual / 正则匹配
    → 不经 LLM，完全客观
Layer 2b: 独立 Grader Agent（语义评审）
    → 独立 LLM 读 transcript + response，找原文 evidence
    → 执行者和评审者完全分离
Layer 3: 盲测 Comparator + Analyzer（正常路径 + E2E 必跑）
    → Comparator 不知道哪个是 with_skill，纯质量评分
    → Analyzer 解盲，定位胜负根因
```

## Layer 0：执行模式分发

根据 Skill 类型选择对应的执行模式，确保每种类型都能产生可验证的 transcript。

| Skill 类型 | 执行模式 | transcript 内容 |
|-----------|---------|---------------|
| mcp_based | 真实 MCP 工具调用 | 完整工具调用记录（入参、返回值、报错） |
| code_execution | 真实 Bash/脚本执行 | 命令执行记录 + 输出文件内容 |
| text_generation | 纯文本模式 | 模型推理过程 + 最终输出（无工具调用） |

## Layer 1：Executor

**职责**：真实执行 Skill，记录完整证据。没有 Layer 1 的 transcript，后续所有验证层都无法工作。

### 文件系统隔离规则（P0 问题）

without_skill subagent 会通过读取同一 workspace 目录，「借用」with_skill 已上传的文件 URL，导致 Δ 被系统性低估。

**强制隔离结构**：

```
eval-N/
├── with_skill/
│   ├── workspace/     ← with_skill 专属沙箱
│   └── outputs/
└── without_skill/
    ├── workspace/     ← without_skill 专属沙箱，完全隔离
    └── outputs/
```

**三条强制规则**：

1. without_skill subagent 只能读取自己的 workspace/，禁止读取 with_skill 下的任何文件
2. without_skill 执行失败时，记录真实失败，不允许降级复用 with_skill 的中间产物
3. 启动 without_skill subagent 的 prompt 必须明确写：「禁止读取 with_skill 目录下的任何内容」

### transcript 双分离格式（P2 问题）

transcript 把 MCP 原始返回值和 AI 主观解释混在一起是信任漏洞。强制双区块分离：

```

## [tool_calls] Step 5: saveExpenseDoc
<!-- 原始工具调用日志，禁止添加任何 AI 注释，一字不改复制 -->
Tool:   expense-mcp_saveExpenseDoc
Args:   {"docStatus":"10","expenseType":"1",...}
Return: {"code":"200","body":"a1b2c3d4"}
Status: success

## [agent_notes] Step 5: 草稿已保存
<!-- AI 主观解释区 -->
解读：saveExpenseDoc 成功，fdId=a1b2c3d4，草稿状态为 10
```

**Grader 引用优先级**：

1. [tool_calls] 区块 → 系统原始数据，可信度最高
2. response.md / outputs 文件 → 最终呈现内容
3. [agent_notes] 区块 → AI 主观解释，仅辅助参考

**规则**：如果只有 [agent_notes] 支撑、无 [tool_calls] 佐证 → 强制 FAIL

## Layer 2a：字段精确校验（Ground Truth）

四层中最可信的一层，完全不经过任何 LLM，是纯文本匹配。

**适合验证的断言类型**：

- 接口调用次数：saveExpenseDoc 调用了几次（计数）
- 固定参数值：docStatus == "10"（精确匹配）
- 链接格式：不含字面占位符 {fdId}（正则）
- 字段值：fdMonthOfOccurrence 是否等于当前月份计算值

**不适合 Layer 2a 的断言**（转交 Layer 2b）：

- 「输出格式是否对用户友好」→ 主观，需要 LLM 评审
- 「报销主题内容是否合理」→ 语义性，需要 LLM 评审

## Layer 2b：独立 Grader Agent

强制引用原文 evidence，从根本上消除「感觉通过」的评审方式——找不到原文支持，就是 FAIL。

**三种评审标准**：

| skill_type | evidence 来源 | 特殊注意点 |
|-----------|-------------|-----------|
| mcp_based | transcript 中的工具调用记录 | 验证入参/返回值/调用次数 |
| code_execution | Bash 调用记录 + 输出文件内容 | 验证命令正确性和文件内容 |
| text_generation | response.md 原文段落 | 无工具调用，从输出文本找证据 |

**Grader 工作方式**：

1. 读取 skill_type，选择评审标准
2. 读取 transcript.md 或 response.md
3. 对每条断言：找原文 → 判定 PASS/FAIL → 必须 quote 具体文字
4. 提取隐含 claims 并验证（幻觉检测）
5. 批评断言质量（eval_feedback）

**幻觉检测（最有价值的额外工作）**：Grader 从输出中提取「隐含声明」并逐一核查：

- 隐含声明：「saveExpenseDoc 调用了一次」→ factual → true
- 隐含声明：「fdMonthOfOccurrence 取当前月份」→ factual → false（实际取的是发票月而非提单月）

> **关联**：Layer 2b 的设计体现了  的核心原则——Grader Agent 与 Executor 必须是对抗关系，而非协作关系。

## Layer 3：盲测 Comparator + Analyzer

**触发规则**：正常路径用例（Happy Path）和 E2E 用例完成后必须执行，不可跳过。

**Comparator 评分维度**（六维度，每项 1-5 分）：

- 内容维度：正确性、完整性、准确性
- 结构维度：组织性、格式规范、可用性
- 综合得分 = (内容均值 + 结构均值) / 2 × 2

**Analyzer**：Comparator 评分完成后解盲（得知哪个是 with_skill），定位胜负根因，生成可操作的改进建议。

## quick 模式最少运行 2 次

单次运行无法判断结论是否稳定。大模型每次运行结果略有不同。

**规则**：quick 模式强制运行最少 2 次，取均值（不取最优）

| 两次差距 | 处理方式 |
|---------|---------|
| ≤ 15% | 正常，标注「quick 2次」 |
| > 15% | 报告标红，发布决策从 PASS 降为 CONDITIONAL PASS |

## 四层关系总结

| 层 | 解决的核心问题 | 产出 | 可信度 | 触发时机 |
|---|------------|------|--------|---------|
| Layer 0 | Skill 类型分发；workspace 污染 | skill_type + 独立沙箱 | — | 每次启动 |
| Layer 1 | 无真实执行记录 | transcript + response + timing.json | 基础 | 每个用例必跑 |
| Layer 2a | LLM 评审精确字段不可靠 | ground_truth.json | **最高** | Layer 1 后立即 |
| Layer 2b | 执行者自判卷；agent_notes 当原始数据 | grading.json | 高 | Layer 1 后立即 |
| Layer 3 | 评审者知道「好版本」存在偏见 | comparison.json + analysis.json | 高（盲测） | 仅 Happy Path + E2E |

## 与系列其他文章的关系

本文是 SkillSentry 系列的第四篇，前序文章见：

- **（一）** [AI Skill 测评的底层逻辑](https://github.com/QianJinGuo/wiki/blob/main/entities/ai-skill-evolution底层逻辑.md) — 入门篇，介绍自判卷偏差、随机性、负向增益三大核心问题
- **（二）** AI Skill 触发与控制 — 待关联
- **（三）** AI Skill 防过拟合 — 待关联
- **（四）** 本文 — 四层验证体系完整解析

> **关联**：四层验证体系是 [Harness Engineering](https://github.com/QianJinGuo/wiki/blob/main/entities/harness-engineering.md) 在 AI Skill 评测场景的具体实现——Layer 0-1 对应 Harness 的执行基础设施，Layer 2a/2b 对应评估回路，Layer 3 对应可观测性管道。

→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/ai-skill-四层验证体系.md)

## 深度分析

四层验证体系的层次设计揭示了一个深层原则：**可信度必须分层建立，不能依赖单一评审机制**。Layer 0 的执行模式分发看似是一个简单的路由决策，实际上它决定了整个验证链条的可信度上限——如果 transcript 格式不对，后续所有验证层的结论都是空中楼阁。这一点在传统的软件测试中也有对应：测试基础设施的可靠性决定了测试结论的可信度。

Layer 2a 与 Layer 2b 的分离是整个体系中最关键的设计决策之一。字段精确校验（Ground Truth）完全排除 LLM 做判断，确保接口调用次数、参数值等客观事实的验证不被主观因素污染；而 Layer 2b 则用独立的 Grader Agent 处理语义性、主观性判断。两层的分工边界（客观 vs 主观）不是人为划分的，而是由问题的本质属性决定的。在实践中，许多评测系统失败的原因恰恰是把本该分层的验证混在一起——既想让 LLM 做语义判断，又想让同样的 LLM 做精确值验证，结果两类判断互相干扰。

transcript 双分离格式（[tool_calls] vs [agent_notes]）解决了一个被大多数评测系统忽视的问题：AI 在执行过程中会对自己的行动进行事后解释，而这个解释往往包含了对结果的乐观解读。把原始工具调用记录和 AI 主观解释强制分离，确保 Grader 永远先看系统事实、再听 AI 解读。规则「如果只有 agent_notes 支撑、无 tool_calls 佐证 → 强制 FAIL」把这个约束变成了不可绕过的硬性规则，而不是可协商的软建议。

Layer 3 的盲测Comparator是整个体系中设计最精妙的部分。传统的 A/B 测试中，评估者知道哪个是「实验组」会导致系统性偏见——对实验组更严格或更宽松。盲测设计从根本上切断了这个偏见来源。但盲测只是手段，真正的价值在Analyzer 解盲后的归因过程：Comparator 给出分数，Analyzer 解释「为什么with_skill 赢了/输了」。这种「评分 + 归因」的双层结构，使得评测结论从单纯的「好坏」变成了可操作的「改进建议」。

quick 模式强制运行 2 次的规则，用样本标准差代替点估计，本质上是在承认 AI 输出的内在不确定性。这个设计选择背后的统计思想值得深入理解：当 n=3 时，样本标准差比总体标准差大约大 22%，这意味着小样本场景下我们对不确定性的估计必须更保守。在实际工程中，这个规则防止了一个常见的错误——用单次运行的 pass rate 做出发布决策，而忽略了 AI 输出的波动性。

## 实践启示

- **设计验证体系时，先确定 transcript 格式，再设计验证层**。四层体系的依赖关系是单向的：transcript 质量决定了所有后续验证层的有效性。在设计新的评测场景时，应该优先投入资源在 Layer 1 的执行和记录基础设施上。

- **区分客观验证和主观判断，让合适的工具做合适的事**。接口调用次数、参数值等精确字段必须用 Layer 2a 的规则匹配；语义质量、格式友好性等主观判断必须交给 Layer 2b 的独立 Grader Agent。不要试图用一个 LLM 同时完成两类判断。

- **强制执行者与评审者的上下文隔离**。without_skill subagent 禁止读取 with_skill 的 workspace——这条规则不是可选项，而是确保评测有效性的前提。任何能让评审者「借用」执行者中间产物的漏洞，都会系统性地高估 Skill 的价值。

- **在 Grader 的 prompt 中明确 evidence 引用优先级**。建立明确的规则：[tool_calls] 区块 > response.md > [agent_notes]。如果只有 agent_notes 支撑而没有 tool_calls 佐证，强制判定 FAIL。这条规则把「感觉通过」变成「有证据通过」的操作性保障。

- **盲测 Comparator + Analyzer 的双层结构是给出可操作改进建议的关键**。单独的评分只能告诉你「哪个更好」，不能告诉你「为什么更好」和「怎么改进」。在设计评测系统时，务必保留 Analyzer 的归因环节，否则评测结论只是分数、没有行动价值。

## 相关实体

- [MOC](https://github.com/QianJinGuo/wiki/blob/main/moc/evaluation-benchmarks-extended.md)

---

