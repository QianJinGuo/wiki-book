---
title: "Qwen Code Skill Testing Framework Issue 2447"
source: ""
tags: [qwen, skill, testing, framework]
created: 2026-05-20
sha256: 2dba967fe3c4403da3c5259e97d6cc49530f85cfaaff5e15409bb5bf43a739c1
---
---
# Skill Testing Framework: Recording, Playback, and Assertions
> 来源：[GitHub Issue #2447](https://github.com/QwenLM/qwen-code/issues/2447) | 作者：@wenshao | 2026-03-17
## 背景
qwen-code 代码库管理着数百个 Skill。目前缺少自动化的 Skill 测试机制。当 Skill 修改通过 PR 提交时，无法验证：
- 现有功能是否被破坏（回归）
- Token 消耗是否增加
- 对话轮次是否增加
- 是否出现了意外的 ASK User Question
## 核心功能
### 测试录制（Test Recording）
- 通过 `--record` 参数触发录制
- 自动脱敏敏感数据（API keys、文件路径、邮箱）
- 保存为人类可读的 YAML 格式
- 支持测试附件（fixture files）
- 可使用强模型（如 Opus 4.6）智能生成断言
### 测试回放（Test Playback）
- 回放录制的输入并验证输出
- 与基线指标对比
- 支持基于断言的验证
### 多维度验证（Multi-dimensional Verification）
每次测试运行时验证：
- **功能正确性**（断言通过）
- **Token 消耗 vs 基线**
- **轮次 vs 基线**
- **ASK User Question 验证**：检测意外的 ASK User Question、验证必需的 ASK User Question 出现、追踪优化目标
## 技术规格
### 测试文件 Schema（YAML）
```yaml
name: "Basic PDF parsing"
description: "Parse a simple PDF file"
input:
  user: "帮我解析 test.pdf"
  files:
    - "fixtures/test.pdf"
baseline:
  model: claude-opus-4.6
  tokens: 1250
  rounds: 3
asserts:
  - type: "contains"
    expect: "解析完成"
  - type: "tool_called"
    tool: "read"
  - type: "no_ask_user"
```
### 断言类型
`contains` | `tool_called` | `no_ask_user` | `ask_user_count` | `question_exists` | `question_removed` | `max_tokens` | `max_rounds` | `throws`
### 输出格式
**终端（人类可读）：**
```
{p skillName} test results
Tests: {passed} passed, {failed} failed ({total} total)
Time: {duration}s / Model: {modelName}
```
**JSON（机器可读）：**
```json
{
  "skillName": "pdf",
  "summary": { "total": 6, "passed": 5, "failed": 1, "duration": 12500, "exitCode": 1 },
  "regression": { "detected": true, "details": { "tokensChange": "+12%", "roundsChange": 1 } },
  "tests": [{ "name": "basic-usage", "passed": true, "duration": 2300, "model": "claude-opus-4.6", "metrics": { "tokens": 1250, "rounds": 3, "askUserCount": 0 } }]
}
```
### CLI 接口
```bash
# 录制测试
qwen skill test pdf --record
# 录制并智能生成断言
qwen skill test pdf --record --generate-assertions
# 运行测试
qwen skill test pdf
# JSON 输出
qwen skill test pdf --format json
# 多模型
qwen skill test pdf --models opus-4.6,sonnet-4.6,gemini-2.0
```
### 约束
- **不得修改现有核心代码**
- **必须复用 ChatRecordingService 进行录制**
- **不得给 core 包引入新依赖**
- **测试文件必须存储在 Skill 文件夹内的 `__tests__/` 子目录**
### 预计新增代码
~700 行，0 修改现有核心代码
## 架构扩展：从 Skill Test 到 Scenario Regression Framework
Issue 后续讨论将范围扩展为**更通用的"场景回归测试框架"**：
```
正常对话来源（CLI / Agent 平台）
    ↓
会话录制
    ↓
LLM + 规则分析录制结果
    ↓
生成可编辑 DSL
    ↓
人工微调后落库
    ↓
测试执行引擎
    ↓
解析 DSL → 准备输入/fixtures/模型/参数
    ↓
执行完整 scenario → 产出 normalized trace
    ↓
Deterministic Asserts + Optional Judge
    ↓
单 case 结果 → 测试集汇总 → LLM 分析整体测试状况
```
**关键设计原则：**
1. **执行和验证分开**：先执行 case 拿到 normalized trace，再跑 deterministic asserts，必要时补 judge model 做语义评估
2. **DSL 应可编辑**：自动生成的断言不一定总是对，需要支持人工再微调
3. **硬约束靠 asserts**：tool_called、no_ask_user、max_rounds、max_tokens、max_duration、throws、no_error
4. **语义质量由 judge 补充**：补充但不完全依赖
5. **测试集层面整体分析**：回归原因、风险提示交给 LLM 总结
**扩展场景**（超越 Skill 本身）：
- 模型升级验证
- CLI 改动验证
- prompt / scheduler 变化对行为的影响
### MVP 第一阶段
1. record / export case
2. replay / execute case
3. normalized trace
4. deterministic assertions
5. terminal / json 输出
6. exit code
### 需收敛的问题
1. 测试对象到底定义在哪一层（Skill 还是 Scenario）
2. DSL 最小需要描述哪些内容
3. deterministic asserts 和 LLM judge 的边界怎么划分
4. ASK User Question 这种行为应该如何稳定建模和断言
5. 是否应该把"从真实 session / transcript 导出 case"作为一等能力
## 相关链接
- [xurik/dataworks-skill-evaluator](https://github.com/xurik/dataworks-skill-evaluator)
- QwenLM/qwen-code 仓库