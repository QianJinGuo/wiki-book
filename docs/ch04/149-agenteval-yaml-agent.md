# AgentEval：YAML驱动的Agent评测框架

## Ch04.149 AgentEval：YAML驱动的Agent评测框架

> 📊 Level ⭐⭐ | 13.2KB | `entities/agent-eval-wallezhang-yaml-driven-agent-evaluation-framework.md`

## 核心问题
传统测试金字塔（单元测试 → 集成测试 → E2E 测试）覆盖不了 Agent 的核心质量问题：
1. **非确定性**：同一 prompt 跑两次结果可能不同，无法用断言判定
2. **传播效应**：改一个词可能导致整个行为链路变化，且不可预测
3. **上游波动**：模型本身升级，Agent 表现可能出现波动
> "Teams without evals get bogged down in reactive loops — fixing one failure, creating another." — Anthropic, *Demystifying Evals for AI Agents*

## 关键指标：pass@k vs pass^k
| 指标 | 含义 | 衡量什么 |
|------|------|---------|
| **pass@k** | k 次里至少有一次通过的概率 | 能力上限 |
| **pass^k** | k 次全部通过的概率 | 可靠性 |
两者一起看才有意义。可靠性指标（pass^k）是评估 Agent 稳定性的关键。
> pass@k 计算用对数空间算术，避免组合数在大 n 时的溢出精度问题。

## 评分器体系
| 类型 | 适用场景 |
|------|---------|
| `exact_match` | 有标准答案的知识问答 |
| `contains` | 检查关键词是否出现 |
| `regex` | 有格式要求的任务 |
| `command` | 能跑测试脚本的场景 |
| `llm` | 开放式问答主观评分（LLM-as-judge） |
| `constraint` | 合规检查（must_match/must_not_match，字数范围） |
多评分器可组合，通过 `weight` 控制权重。最终通过条件是 AND——两个评分器都得通过才算 trial 通过。

## CI/CD 集成
```bash

# PR 合并前只跑核心用例
agent-eval run -c eval.yaml --tags core --fail-under 0.9

# 日常回归跑全量
agent-eval run -c eval.yaml --fail-under 0.8

# 安全审查单独跑
agent-eval run -c eval.yaml --tags safety --fail-under 1.0
```
`--fail-under` 通过率低于阈值返回退出码 1，阻断流水线。`results/summary.json` 可被后续流水线步骤消费。

## 缓存机制
缓存 key = SHA256(Agent 类型 + Agent 配置 + 任务输入)。Agent 端不变才命中缓存。评分规则变更后重跑评测，不会重复调用 Agent API。

## A/B 对比
```bash
agent-eval compare <run_id_a> <run_id_b>  # 支持 ID 前缀匹配
```
输出标注每个任务是回归了还是改进了。

## 扩展接口
Agent（两个方法）：
```go
type Agent interface {
    Execute(ctx context.Context, input model.TaskInput) (*model.AgentOutput, error)
    Close() error
}
// 在 init() 里注册：Register("internal_rpc", func(config) (Agent, error) { ... })
```
Grader（两个方法）：
```go
type Grader interface {
    Grade(ctx context.Context, input GradeInput) (*model.GradeResult, error)
    Type() string
}
```

## 实现细节
- **SQLite**：纯 Go 实现（modernc.org/sqlite），不需要 CGO，交叉编译方便
- **缓存透明**：Agent 被 CachedAgent 包裹，缓存命中时 metadata 加 `cache_hit: true` 标记
- **Hook 失败非致命**：生命周期 Hook 执行失败只打 warning 日志，不终止评测

## 深度分析
### pass@k 与 pass^k 的双指标哲学
大多数测试框架只看 pass@k 来衡量"能力上限"，但 AgentEval 同时追踪 pass^k 来衡量"可靠性"。这两个指标的关系类似于大模型评估中的 precision 与 recall——单独看任何一个都会产生误导。
当 pass@k 很高但 pass^k 很低时，说明 Agent 有一定概率做对，但不稳定。这种情况下单纯提高 pass@k 阈值没有意义，因为问题根源在于 agent 的随机性，而非能力上限。

### 评分器的分层设计
六种评分器形成了一个从客观到主观的连续光谱：

- **确定性端**（exact_match/regex/contains）：可复现、无歧义，适合有明确正确答案的场景
- **不确定性端**（llm）：适合开放式任务，但引入了评分不稳定性的问题
多评分器 AND 组合的设计值得注意：它要求所有评分器都通过才算成功，这意味着一个弱评分器就会拖累整体。这在某些场景下过于严格，但也强制保证了结果的可靠性。

### 缓存机制的战略价值
Agent 评测的成本（API 调用 + 计算资源）远高于传统单元测试。缓存机制使得"改评分规则 → 重跑评测"的迭代成本从 O(n·API_calls) 降低到 O(n)，这对于日常 CI/CD 集成至关重要。
缓存 key 的设计（Agent 类型 + 配置 + 输入）是合理的，因为它确保了：当同一个任务在相同 Agent 配置下运行，结果必然相同。

### 扩展接口的工程思维
Agent 和 Grader 两个接口的极简设计（各两个方法）降低了插件开发的门槛。`init()` 注册机制允许在运行时动态加载插件，不需要修改核心代码。

## 实践启示
**1. 评测先行，不要事后补救**
在没有量化指标的情况下优化 Agent，就像在没有测试的情况下重构——你不知道改进了什么，也可能破坏了原本正常的功能。建议在引入 Agent 的第一天就搭建评测框架。
**2. pass@k 和 pass^k 要一起看**
如果团队只关注 pass@k，建议加入 pass^k 监控。当两者差距过大时（pass@k 高但 pass^k 低），说明 agent 行为不稳定，需要从 prompt 工程或架构层面解决随机性问题。
**3. 评分器选择要有策略**

- 上线前的自动化测试：用 exact_match/regex/command——这些可复现
- 线上监控：加 llm 评分器捕捉开放式任务的质量问题
- 敏感场景（安全/合规）：constraint 评分器必须作为守门员，fail-under 设置为 1.0
**4. CI/CD 集成要分层**
不要把所有用例放在同一个流水线里。用 tags 分离核心用例（pass-under 0.9）、日常回归（0.8）、安全审查（1.0）。这样可以平衡评测成本和覆盖率。
**5. 缓存要配合版本控制**
当 Agent 版本升级时，缓存失效是正常的。但如果评测结果出现大幅波动，要区分是模型升级导致的真实改进/退化，还是缓存失效导致的评测偏差。建议每个 Agent 版本对应独立的 run ID。

## 路线图
- 动态多轮交互评测（LLM 扮演用户动态追问）
- 可视化 Dashboard（交互式历史趋势面板）
- 国内主流模型 API 适配
- 评测集市场（客服、代码生成、信息提取标准评测集）
- 分布式执行

## 相关实体
- [Anthropic Generator-Evaluator Harness](../ch01/846-anthropic.html) — 另一种评测闭环思路
- [Superpowers](../ch01/503-claude-code-skills-superpowers.html) — Agent 工作流规范
- [Skill Writing Patterns](ch04/262-skill.html) — Skill 质量评估相关
- [LBS-IntentBench — 首个真实出行隐式意图评测基准](ch04/264-lbs-intentbench.html)
- [AI Skill 测评指标体系](../ch01/477-ai-skill.html)
- [Perplexity 内部 Skill 设计指南：四维体系与维护方法论](ch04/262-skill.html)
- [Skills赏析：使用skills-refiner提升skill质量](../ch03/069-skills.html)
- [MOC](https://github.com/QianJinGuo/wiki/blob/main/moc/evaluation-benchmarks-extended.md)

---

