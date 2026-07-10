# Owner-Worker-Verifier 架构

## Ch01.1238 Owner-Worker-Verifier 架构

> 📊 Level ⭐⭐⭐ | 6.1KB | `entities/owner-worker-verifier-architecture.md`

## 三角色
| 角色 | 职责 | 特点 | 
|------|------|------| 
| **Owner** | 任务分解、调度、最终验收 | 全局视角 | 
| **Worker** | 具体执行、产出中间结果 | 可多个并行 | 
| **Verifier** | 质量检查、对抗式验证 | 与 Worker 对抗 | 

## 核心原则
- Worker-Verifier 是对抗关系，非可选附加步骤
- 适用于需要严格质量控制的场景

## 深度分析
**对抗式验证是质量保障的核心机制**  ^[raw/minimax-agent-team-mavis-owner-worker-verifier]
Owner-Worker-Verifier 架构的核心洞察在于：Worker 和 Verifier 之间是对抗关系，而非合作关系。Verifier 的职责不是帮助 Worker 改进输出，而是主动寻找 Worker 的漏洞和错误。这与软件工程中的"测试驱动开发"或"红队安全审计"的逻辑相同——有效的质量保障需要主动的、敌对的检验，而非被动的、协作的反馈。当 Verifier 对抗越强，最终输出的质量越可靠。  ^[raw/minimax-agent-team-mavis-owner-worker-verifier]
**这种对抗关系在实际系统中有多种体现**：  ^[raw/minimax-agent-team-mavis-owner-worker-verifier]
1. **软件测试**：单元测试/集成测试就是在对抗代码——如果测试只是"帮代码确认是对的"，几乎无法发现 bug。有效的测试必须站在 bug 的角度去攻击代码。  ^[raw/minimax-agent-team-mavis-owner-worker-verifier]
2. **代码审查**：Reviewer 的价值在于找出作者没想到的漏洞，而非认同作者的实现。  ^[raw/minimax-agent-team-mavis-owner-worker-verifier]
3. **安全红队**：真正的红队不是帮助蓝队改进防御，而是主动寻找突破点。  ^[raw/minimax-agent-team-mavis-owner-worker-verifier]
**Owner 的角色是"系统架构师"而非"上级领导"**  ^[raw/minimax-agent-team-mavis-owner-worker-verifier]
Owner 不是简单地分配任务和等待结果，而是负责：  ^[raw/minimax-agent-team-mavis-owner-worker-verifier]

- 将复杂任务分解为可验证的子任务
- 定义每个子任务的验收标准（这是 Verifier 判断的依据）
- 决定何时需要重新执行（当 Verifier 发现失败时）
- 最终验收并决定是否继续迭代
这要求 Owner 具有全局视角和对任务边界的清晰定义。如果 Owner 任务分解粒度不够，Worker 的执行就容易偏离目标，Verifier 也无法有效验证。  ^[raw/minimax-agent-team-mavis-owner-worker-verifier]
**多 Worker 并行是效率的来源**  ^[raw/minimax-agent-team-mavis-owner-worker-verifier]
多个 Worker 可以并行执行独立子任务，这是该架构效率的来源。但并行带来了新的挑战：  ^[raw/minimax-agent-team-mavis-owner-worker-verifier]

- 各 Worker 之间的输出如何整合？
- 如果一个 Worker 的输出不合格需要重试，是否影响其他 Worker 的执行？
- Owner 如何判断哪些 Worker 需要等待其他 Worker 完成后再执行？
这些问题需要在系统设计中预先考虑。  ^[raw/minimax-agent-team-mavis-owner-worker-verifier]

## 实践启示
**第一步：为每个 Worker 配套独立的 Verifier**  ^[raw/minimax-agent-team-mavis-owner-worker-verifier]
不要让一个 Verifier 验证多个 Worker——Verifier 应该有明确的验证对象和标准。当发现错误时，Verifier 的输出应该是可操作的（如"哪些地方不符合规范，具体第几行代码有问题"），而非模糊的（如"质量不够好"）。  ^[raw/minimax-agent-team-mavis-owner-worker-verifier]
**第二步：用对抗性思维定义 Verifier 的验收标准**  ^[raw/minimax-agent-team-mavis-owner-worker-verifier]
在定义验收标准时，站到 Worker 的对立面思考：Worker 最可能在哪偷懒？在哪产生幻觉？在哪因为理解偏差而跑偏？这些是 Verifier 必须覆盖的检验点。验收标准的定义本身就是一个"威胁建模"的过程。  ^[raw/minimax-agent-team-mavis-owner-worker-verifier]
**第三步：控制 Worker-Verifier 的循环次数**  ^[raw/minimax-agent-team-mavis-owner-worker-verifier]
对抗式验证可能导致无限重试。为每个子任务设定最大重试次数和退避策略（如：第 1 次失败重试，第 2 次失败降级处理，第 3 次失败人工介入）。这防止系统在边缘案例上无限循环。  ^[raw/minimax-agent-team-mavis-owner-worker-verifier]
**第四步：Owner 的任务分解需要经验和迭代**  ^[raw/minimax-agent-team-mavis-owner-worker-verifier]
任务分解是最难做好的环节——分解太粗，Worker 执行效率低且难以精准验证；分解太细，管理成本高。初期可以先用较粗粒度，观察哪些子任务在验证时反复失败，针对这些子任务进行更细粒度的分解。这是一种渐进式的任务分解优化方法。  ^[raw/minimax-agent-team-mavis-owner-worker-verifier]
**第五步：考虑将 Verifier 也作为 Worker 被验证的对象**  ^[raw/minimax-agent-team-mavis-owner-worker-verifier]
当系统复杂度提升时，Verifier 本身也可能出错。可以考虑"Verifier 的输出由另一个 Verifier 检查"的机制（如代码审查中 Reviewer 的评论也需要被审视），但这会显著增加系统复杂度。建议仅在核心质量关卡使用多层验证。  ^[raw/minimax-agent-team-mavis-owner-worker-verifier]

## 参考
- [Minimax Agent Team Mavis](../ch04/147-ai-minimax-agent-team-mavis.html)

## 相关实体
- [Scalable voice agent design with Amazon Nova Sonic: multi-agent, tools, and session segmentation](../ch11/278-amazon-nova.html)
- [Claude Code 架构解析](../ch03/075-claude-code.html)
- [Agent 时代架构师技能指南](../ch03/069-skills.html)

- [基于多智能体架构的深度思考交易系统](https://github.com/QianJinGuo/wiki/blob/main/entities/构建基于多智能体架构的深度思考交易系统.md)
- [routa 多智能体协同交付平台](../ch03/045-agent.html)
- [MOC](https://github.com/QianJinGuo/wiki/blob/main/moc/agent-engineering-guide.md)

---

