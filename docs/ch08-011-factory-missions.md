## Ch08.011 Factory Missions

> 📊 Level ⭐⭐⭐ | 13.4KB | `entities/factory-missions-multi-agent-shipping.md`

## 核心架构
**三角色**：Orchestrator（规划/拆解/调度）+ Worker（单个 feature 实现）+ Validator（Scrutiny + User-Testing 两类）。
**关键约束**：

- Orchestrator **不参与实现细节调查**，避免累积过细上下文
- Worker 用 **fresh context** 先写测试再实现，不做"完成"判断
- Validator **不看实现代码也不看 worker trajectory**，只读 validation contract 和 git 成品

## 五大可抄设计原则
1. **角色责任明文化**：先写"不许做什么"
2. **Validation contract 前置**：在写代码之前产出行为断言列表，生成 agent 和评估 agent 必须不同
3. **结构化 handoff 取代记忆**：5 字段（completed/not_completed/commands_executed/issues_found/procedure_compliance）
4. **写串行、读并行**：文件写入/commit/validator 评估严格串行；检索/调研可以并行
5. **验证用不同模型**：GPT-5.3-Codex 检查 Sonnet 写的代码是结构性对抗设计

## 多 Agent 通信 5 模式
| 模式 | Missions 用了吗 |
|------|--------------|
| Delegation | ✅ |
| Creator-Verifier | ✅ |
| Broadcast | ✅ |
| Negotiation | ✅ |
| Direct Communication | ❌ 故意不用（避免 state fragmentation） |

## Validation Contract
在任何代码出现之前 orchestrator 产出行为断言列表。每条包含：行为描述 + 验证工具 + 证据要求。
**效果**：21 个 fix features 占 61 个实现 features 的 34.4%，一轮验证从未通过——说明 validator 在做该做的事。

## Token 效率
Slack 克隆 mission：778.5M tokens，**96% cache 命中**（744.9M 是 cache read）。关键：共享状态文件在 mission 期间几乎只读，prefix cache 最大化复用。

## 竞品对比
| 系统 | State 位置 | 验证方式 |
|------|-----------|---------|
| Mission Control | git + 共享 markdown | Validation contract |
| Agent Teams | 每个 teammate 对话窗口 | lead/peer 互检 |
| Experts Mode | Team Lead plan | QA/Review 专家并行触发 |

## Bitter Lesson 反驳
为什么不会被下一代模型 obsolete：
1. orchestration 是 prompt，不是状态机——模型变好 = 规划变好
2. separation of concerns 让 model specialization 收益随模型分化而增加
3. validation contract 为人类需求建模，不为某模型建模——契约本身稳定
**"锁死在单一模型家族的系统永远被这家最弱的能力约束。"**

## 来源
- Luke Alvoeiro @ AI Engineer Europe（YouTube, 2026-05-06）
- How Missions Work — Theo Luan, Factory（2026-04-10）：https://factory.ai/news/missions-architecture
- Introducing Missions（2025-02-26，2026 数据更新版）：https://factory.ai/news/missions

## 深度分析
### 为什么 Validation Contract 是核心
传统的 agent 系统中，验证往往后置——代码写完后跑测试，测试驱动开发（TDD）在人类工程师中是好的实践，但在 agent 系统中容易被绕过。Factory 的关键洞察是：**"Tests written after implementation don't catch bugs. They confirm decisions."**
Validation contract 的设计把"正确性定义"从实现过程中剥离出来，强制在写第一行代码之前完成。这不只是流程约束，而是认知约束——它切断了实现细节回流到验收标准的路径。在 agent 系统中，这意味着 validator 的判断不会被实现者之前的推理路径所污染。

### Self-Evaluation Bias 的系统性影响
Agent 的 trajectory 是 append-only 的。模型会从自己之前的推理里寻求连贯性，而不是质疑它。一个写完代码的 agent 评估自己写的代码，几乎一定会偏向"合理化"而非"找问题"。
这个 bias 不是通过"提高模型能力"能解决的——它需要结构性对抗：让不同的 agent、用不同的模型、在不同的上下文中做验证。Factory 的设计是把 Scrutiny Validator 和 User-Testing Validator 都放在这个位置上，而验证者看的不是实现过程，是 git 成品和 validation contract。

### Token 效率的本质：共享状态即 Cache
96% 的 cache 命中率不是优化技巧的结果，而是架构设计的自然产物。当所有 agent 读写同一组共享状态文件（validation-contract.md、features.json、services.yaml、AGENTS.md），这些文件的内容在 mission 期间几乎只读，prefix cache 自动最大化复用。
这揭示了一个朴素的原则：**如果要高效复用 cache，文件结构的稳定性比文件内容的变化更重要**。与其优化单个文件的 token 密度，不如确保共享状态文件在整个 mission 生命周期内保持稳定。

### 串行写的数学必然性
Factory 给了明确的数学：如果每个 agent run 错误率 0.1%，100 步累计成功率 90%；如果并行让每步错误率涨到 1%，100 步累计成功率暴跌到 36%。长周期任务的正确性是复利。
这个数字解释了为什么 Factory 坚持"写串行"——不是不要并行，而是**写操作不允许并行**。并行读可以提速，写操作并行会导致互相覆盖、重复劳动、架构决策不一致。协调成本会吃掉并行带来的速度收益。

### 模型分化时代的编排哲学
"锁死在单一模型家族的系统永远被这家最弱的能力约束"——这句话指向了 Factory 的核心设计意图：用 model-agnostic 的方式，让不同角色使用不同提供商的模型。GPT-5.3-Codex 验证 Sonnet 写的代码，是结构性对抗设计，不是 marketing。
随着模型能力持续分化，Claude、GPT、Gemini、DeepSeek 各自在某些维度上有比较优势。"把最对的模型放到最对的角色"这个收益，会随模型分化程度增加而增加，而不是减少。

## 相关实体
- [Factory Missions Architecture](ch04-151-factory-missions-多智能体工程纪律.html)
- [Rag技术框架的演进方向](ch01-193-postmortem-tanstack-npm-supply-chain-compromise-tanstack.html)
- [构建基于多智能体架构的深度思考交易系统](ch04-205-构建基于多智能体架构的深度思考交易系统.html)
- [Wow Harness V3 Governance Protocol](ch05-028-wow-harness-v3-ai.html)
- [Hermes Agent 12 Layer Full Configuration Guide](ch07-007-hermes-agent-满配-12-层配置完整指南-从裸装到-24h-agent-团队.html)

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/amazon-cloudfront-deploy-guide-cloudfront-domain-multi-tenant-architecture.md)

- MOC
## 实践启示
1. **在写代码之前先写验收标准**：Validation contract 应该描述行为，而不是实现细节。每条 assertion 包含：行为描述 + 验证工具 + 证据要求。生成 contract 的 agent 和评估 contract 的 agent 必须不同。
2. **用结构化 handoff 取代对话记忆**：Worker 完成后填 5 字段（completed/not_completed/commands_executed/issues_found/procedure_compliance），下一个 worker 读这份文档而不是上一个的对话历史。共享状态文件在 mission 期间保持只读稳定。
3. **写串行，读并行**：文件写入、commit、validator 评估必须严格串行；codebase 检索、文档调研可以并行。不要让并行写入同一个 codebase。
4. **验证用不同模型**：哪怕只是换另一家提供商的中等规模模型，也能避开同家族训练数据 bias。刻意让验证和实现走不同提供商的模型。
5. **最小操作单元是计划级再分配**：Mission Control 里，用户是 50 个 droid 的项目经理，不是工程师。介入话术是"Drop X feature and add Y instead"，而不是"在函数 Z 里改一行代码"。
6. **编排逻辑写成 prompt，不要写成状态机**：700 行文本中，4 句话的修改就能让执行策略发生戏剧性变化。新模型出来时只需改几句 prompt，不需要重写状态机。
7. **用 five-field handoff 约束 worker 行为**：Worker 不被允许做"这功能完成了"的判断——这是 validator 的事。Handoff 文档的结构本身就在强化这个约束。
→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/factory-missions-multi-agent-shipping-for-days-luke.md)

---
