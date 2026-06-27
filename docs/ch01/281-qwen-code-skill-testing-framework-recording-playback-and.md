# Qwen Code Skill Testing Framework: Recording, Playback, and Assertions

## Ch01.281 Qwen Code Skill Testing Framework: Recording, Playback, and Assertions

> 📊 Level ⭐⭐ | 13.6KB | `entities/qwen-code-skill-testing-framework-issue-2447.md`

## 背景与动机
qwen-code 代码库管理数百个 Skill，缺少自动化测试机制。PR 提交时无法验证：回归/Token 消耗/对话轮次/ASK User Question 异常。
Issue 最初提出 JUnit-like Skill 测试框架，后续讨论扩展为**通用场景回归测试框架**（scenario-based），覆盖 Skill 测试、模型升级验证、CLI 改动验证。

## 核心架构
```
录制来源 → LLM+规则分析 → 可编辑 DSL → 人工微调 → 测试执行引擎
                                                         ↓
                                                    产出 normalized trace
                                                         ↓
                            Deterministic Asserts ←→ Optional Judge Model
```
**关键原则：**
1. 执行和验证分离（先 trace 再断言）
2. DSL 可编辑（支持人工微调）
3. 硬约束靠 asserts（tool_called、no_ask_user、max_rounds、max_tokens）
4. judge model 补充语义，不完全依赖
5. 测试集层面分析交给 LLM

## 测试文件 Schema
```yaml
name: "Basic PDF parsing"
input:
  user: "帮我解析 test.pdf"
  files: ["fixtures/test.pdf"]
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
断言类型：`contains` | `tool_called` | `no_ask_user` | `ask_user_count` | `question_exists` | `question_removed` | `max_tokens` | `max_rounds` | `throws`

## 回归指标
- Token 消耗 vs 基线
- 执行轮次 vs 基线
- 执行耗时
- error / error type 是否变化
- ASK User Question 出现频率
- tool / skill 调用路径
- 最终结果摘要

## MVP 阶段
1. record/export case
2. replay/execute case
3. normalized trace
4. deterministic assertions
5. terminal + JSON 输出
6. exit code（0=通过，非0=失败）

## 与现有工具的差异
| 维度 | 现有工具（Promptfoo等） | Qwen Skill Testing |
|------|----------------------|-------------------|
| 测试单元 | Prompt / 单一输入输出 | 完整 Code Agent 对话流 |
| 回归指标 | 响应质量 | Token/轮次/ASK User |
| 断言类型 | 语义匹配 | 确定性行为验证 |
| Git 集成 | 无 | Skill 通过 Git 管理，PR 即验证 |

## 深度分析
### 1. 从"测试工具"到"回归框架"的范式跃迁
Qwen Skill Testing Framework 的核心创新不是测试录制，而是**将 Code Agent 的执行从"不可观测"变为"可验证"**。
传统 Agent 开发的问题：代码改动了，但无法知道对现有 Skill 的影响。Qwen 的解法是把 Skill 执行变成一个**可重复、可比对的实验**：

- **录制** = 建立实验基准（baseline）
- **回放** = 复现实验条件
- **断言** = 验证实验结论
- **回归分析** = 对比实验差异
这本质上是一个**测试驱动开发（TDD）循环在 Agent 时代的复现**。

### 2. 执行与验证分离的架构价值
架构图中的关键洞察：**执行和验证分开**。

- 先执行 case，拿到 normalized trace（标准化的执行轨迹）
- 再跑 deterministic asserts（确定性断言）
- 必要时补 judge model 做语义评估
这个分离的价值：
1. **失败可定位**：Assertion 失败 ≠ 执行失败，先确认执行完成，再分析断言
2. **语义评估可选**：对于确定性行为（tool_called、max_tokens），不需要 LLM judge
3. **trace 可复用**：normalized trace 可以被多种断言策略复用

### 3. ASK User Question 的建模问题
Issue 中反复提到"ASK User Question"的验证，这揭示了 Code Agent 设计中的一个核心问题：
**什么时候应该问用户？**

- 问多了：Agent 没主见，用户烦
- 问少了：Agent 自作主张，可能出错
Qwen 的解法是**把这个行为也变成可测量的指标**：

- `no_ask_user`：不该问但问了
- `ask_user_count`：问了几次
- `question_exists`：该问的是否问了
这本质上是把"对话策略"变成了可量化的回归指标。

### 4. DSL 可编辑的工程考量
自动生成的断言不一定对，需要支持人工微调。这个设计决策背后的工程逻辑：

- LLM 生成的断言有概率错误（尤其是数值类断言）
- 但完全依赖人工编写测试用例成本太高
- **机器生成 + 人工微调**是当前 AI 辅助测试的最优解

### 5. 与 Promptfoo 等现有工具的本质差异
| 维度 | Promptfoo | Qwen Skill Testing |
|------|-----------|-------------------|
| 测试对象 | Prompt 模板 | 完整 Code Agent 对话流 |
| 验证内容 | 输出质量 | 行为正确性（tool_called/rounds/tokens） |
| 回归指标 | 无 | Token 消耗、执行轮次、ASK 频率 |
| Git 集成 | 无 | PR 即触发测试 |
Promptfoo 测试的是"AI 回答得好不好"，Qwen 测试的是"Agent 行为对不对"——这是两个完全不同的问题域。

## 实践启示
### 架构设计
1. **采用执行-验证分离架构**：

   - 测试引擎负责执行，输出 normalized trace
   - 断言引擎负责验证，支持 deterministic asserts + optional LLM judge
   - 两者通过标准化的 trace 格式解耦
2. **设计可扩展的断言类型**：

   - 确定性断言（tool_called、no_ask_user、max_tokens）：无需 LLM
   - 语义断言（contains、question_exists）：需要 LLM judge
   - 预留 `custom` 类型供用户扩展
3. **Normalized trace 格式设计**：
   ```json
   {
     "model": "claude-opus-4.6",
     "tokens": 1250,
     "rounds": 3,
     "askUserCount": 0,
     "toolCalls": [{"tool": "read", "args": {...}}],
     "error": null
   }
   ```

### 工程实现
1. **复用现有录制基础设施**：Issue 明确要求复用 ChatRecordingService，避免重复建设
2. **测试文件放 Skill 目录内**：`__tests__/` 子目录是合理的组织方式，与代码近绑定
3. **约束：不得修改核心代码**：测试框架不应该侵入被测系统，这是正确的边界
4. **CLI 接口设计**：
   ```bash
   qwen skill test pdf --record           # 录制
   qwen skill test pdf --record --generate-assertions  # 智能生成断言
   qwen skill test pdf --models opus-4.6,sonnet-4.6    # 多模型矩阵
   ```

### 场景扩展
1. **模型升级验证**：新模型上线前跑全量 Skill 测试，对比 baseline 的 tokens/rounds 变化
2. **CLI 改动验证**：CLI 修改后跑回归测试，确认 Skill 调用行为不变
3. **Prompt/scheduler 变化验证**：当 Agent 框架改动时，通过测试确认行为未漂移

### 成熟度评估
Issue 本身处于 proposal 阶段（v1），距离生产可用还需解决：
1. DSL 最小 Schema 定义
2. ASK User Question 的稳定建模
3. Deterministic asserts 和 LLM judge 的边界划分
4. 从真实 session 导出 case 的能力
建议参考 [xurik/dataworks-skill-evaluator](https://github.com/xurik/dataworks-skill-evaluator) 作为起步实现。

## 相关链接
- [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/qwen-code-skill-testing-framework-issue-2447.md)
## 相关实体
- [Skill Issues Compromising Claude Code With Malicious Skills Agents Part 1](../ch01-615-skill-issues-compromising-claude-code-with-malicious-skills/)
- [How Claude Code Works In Large Codebases Best Practices And Where To Start](../ch01-384-how-claude-code-works-in-large-codebases-best-practices-and/)
- [Claude Code Skill Writing Guide](../ch07-020-claude-code-skill-md-写作指南/)
- Ai Skill Evolution Framework
- [Tracking Tampered Chef Clusters Aef374](../ch01-517-tracking-tamperedchef-clusters-via-certificate-and-code-reus/)

---

