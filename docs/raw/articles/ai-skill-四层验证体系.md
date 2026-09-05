---
source_url: https://juejin.cn/post/7620307193841270818
tags: [juejin]
ingested: 2026-05-14
sha256: b34042fdcfc5d65a77b0e125c6930d5d918ac917a6be6e6a3d1a945d5ed3dd5b
---
# 04—为什么不能让 AI 自己评审自己？AI Skill 四层验证体系完整解析
系列：SkillSentry · AI Skill 测评体系从零到一（四）
难度：深入
适合读者：想构建可信测评机制的工程师
📌 一句话摘要：让模型自判卷会产生系统性偏差，本文拆解 AI Skill 四层验证体系如何用独立 Grader Agent 和盲测 Comparator 彻底消除自判卷问题。
## 问题：为什么不能让模型自己评审自己
让模型自己评审自己的输出，会产生「自判卷偏差」——这是 AI Skill 四层验证体系要解决的核心问题。
实验中观察到的现象：
- 同一个用例，with_skill 跑出来通过率 100%，without_skill 也是 100%
- 展开看 evidence，发现很多断言的 evidence 是空的，或者只写了「根据整体输出判断通过」
- 这说明评审是「感觉通过」，不是「有证据通过」
## 四层验证体系
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
三条强制规则：
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