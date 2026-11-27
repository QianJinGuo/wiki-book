# Skill 评测三层：触发、选择、执行完整度

> 📊 Level ⭐⭐⭐ | 13.2KB

## 一句话结论

AWS 在 Strands Evals 与 Bedrock AgentCore Evaluations 里加了 **Skill 级评估**，把"Skill 有没有被用对"拆成**三层可判定检查**：**Skill Invoked（确定性）→ Skill Selection Accuracy（路由是否合理）→ Skill Instruction Following（步骤落实到几分，五档）**。真正的意义不是多了个指标，而是 **Skill 开始有软件组件才有的工程设施**——输入场景、行为约束、测试 Case、回归检查、部署 Gate、生产 Trace。作者引 AWS 的原话：**"Skill 的质量回归应该像失败的单元测试一样阻止发布。"**

## 一、问题转移：从"怎么写"到"有没有按它执行"

**两类失败**：

| 失败类型 | 例子 | 为什么危险 |
|---|---|---|
| **选错 Skill** | HR Agent 同时有 Benefits 与 PTO 两个 Skill，员工问牙科/视力福利却加载了 PTO | "即使最后依靠模型自身知识生成了一段看起来正常的答案，**执行路径仍然错了**" |
| **选对但执行错** | PTO Skill 要求"识别员工 ID → 查余额 → 检查最新 rollover policy → 按条件提交"，Agent 查完余额**直接提交**、跳过规则检查 | "**最终结果甚至仍可能看起来正确**" |

所以"只看 Final Answer 的 Eval 很难解决"：**"一个审批 Agent 最后给出了正确结果，并不能证明它查过应该查的权限；一个财务 Agent 算出了正确金额，也不能证明它执行了要求的校验步骤。"**

## 二、三层检查

| 层 | 查什么 | 判定方式 |
|---|---|---|
| **① Skill Invoked** | 指定 Skill 到底有没有被成功加载（"用户要求总结 PDF 财务表格 → 必须加载 `pdf-table-extraction`"） | **确定性**，**不调用 Judge Model**；该触发没触发直接失败——"三项里最接近传统软件断言的一项" |
| **② Skill Selection Accuracy** | 当前任务调用这份 Skill 是否**合理** | 结合**用户任务 + 可选 Skill 列表 + 实际调用的 Skill + 上下文**，对每次 Invocation 给 Yes/No；**"它检查的是 Agent 的 Routing"** |
| **③ Skill Instruction Following** | 已加载 `SKILL.md` 里要求的步骤，**落实了几分** | 读 `SKILL.md` 识别步骤 → 从执行记录判断每步"完成/部分完成/被跳过" → **五档：Fully / Mostly / Partially / Minimally / Not Followed** |

**结构上的关键变化**：**"过去大家经常把 Agent 的'工具调用错误'看成一个整体，但 Skills 加进来以后，路由本身又多了一层：用户请求先进入 Agent，Agent 要决定是否加载 Skill、加载哪一个 Skill，之后才进入 Skill 规定的工具调用和操作步骤。"** 一次任务因此被拆成：**用户任务 → Skill 选择 → Skill 加载 → Skill 指令执行 → Tool 调用 → Tool 参数 → 最终完成**，"**每一层都可能单独出错**"。

**最能说明分层的例子（PDF）**：Agent 成功加载了 `pdf-table-extraction`，也执行了 `pdftotext -layout`，但**没打开提取文件、没定位表格边界**——于是 **Skill Selection 可以是满分，Instruction Following 只有 0.5**。诊断价值就在这儿：**问题不再只是"Agent 做错了"，而是能定位到"没触发 / 选错 / 选对但没做完"。**

## 三、评测位置往 Trace 里钻

- **传统 LLM Eval** 围绕输入与最终输出（是否正确、相关、完整、是否完成）；
- Agent 出现后开始看 **Tool Selection / Tool Parameter Accuracy / Goal Success**；
- **Skill Eval 又插进一个新观察层**——而且**依赖运行轨迹**：**Strands Evals 对开发期记录的 `trajectory` 跑评测**；**AgentCore Evaluations 直接读 OpenTelemetry Trace**，从 **Session / Trace / Span** 中找出 Skill Invocation 再评测。

三种方式：**on-demand（排查某次异常 Session）/ batch（批量分析历史会话）/ online（从生产流量持续采样）**。由此"把 Skill 的问题从'离线测试几个 Prompt'带进了**生产可观测性**：团队可以看到某次请求具体加载了哪份 Skill、哪份 Skill 的哪些步骤被执行、哪些被跳过，以及问题发生在哪个 Span。"

## 四、进了 CI，性质就变了

- 可为关键 Skill 写回归 Case：**规定某类任务必须触发指定 Skill，同时检查 Selection 与 Instruction Following**；
- 用 `report.test_passes` 决定 Build 成败：**"只要存在未通过项，就退出并阻断后续流程"**；
- AWS 建议：**"对于已经知道正确路由结果的场景，不必全部依赖 Judge Model，而应该给关键 Skill 增加确定性的 `SkillInvoked` 断言。"**

于是形成一个生命周期：**改 `SKILL.md` → 跑测试 Case（是否触发 / 选择是否正确 / 步骤是否完整）→ 通过后部署 → 生产从 Trace 持续采样评估**。

**"走向软件工程"成立的真正原因**，作者说得很准：

> **"并不是因为 Markdown 变成了代码，而是因为围绕它出现了过去软件组件才会有的工程设施：明确的输入场景、行为约束、测试 Case、回归检查、部署 Gate，以及生产运行后的 Trace 和持续 Eval。"**

**但也要看清边界（原文自己划的）**：`SkillInvoked` 是确定性检查，而 **Selection Accuracy 与 Instruction Following 依然属于 LLM-as-a-Judge**，"本身存在模型判断波动，也需要结合自己的业务数据校准阈值"；**"不同评测界面的通过阈值不能简单互换"**，Strands Evals 与 AgentCore 的 Pass"不保证代表完全相同的质量标准"。所以"'单元测试'更准确地说是一种**工程类比**"。

## 五、跨 Harness 与规模化

**跨 Harness 识别**（评测层的野心）：Strands Evals 可从 **Strands AgentSkills、Claude Code、Claude Agent SDK、OpenAI Agents SDK、Codex、Gemini CLI、OpenHands、Google ADK，以及通用 `SKILL.md` 读取**中识别 Skill 信号。作者刻意区分了一句：**"这并不代表这些产品已经采用完全相同的 Skill Runtime，也不意味着 AWS 能统一控制这些 Harness。它说明的是，评测层正在尝试把不同 Harness 里的 Skill 调用抽象成一种共同的可观察对象。"**（AgentCore 生产 Trace 的原生识别范围更窄：Strands Agents、LangGraph Deep Agents、Google ADK、Claude Agent SDK。）

**规模化后的真问题**：三五个 Skill 还能手工测，几十上百个时——**"新的 Skill 可能和旧 Skill 描述重叠，用户新的表达方式可能让 Router 选错，长上下文也可能让后续步骤执行越来越不完整"**。AWS 已把三类现象列为在线评测要发现的问题：**catalog drift · 真实请求与测试 Prompt 之间的表达差异 · 长 Session 中 Instruction Following 的退化**。

## 深度分析

### 它给"Skill 工程化"补的正是最缺的一环：可判定的中间态

此前 Skill 的讨论几乎全是"怎么写"（结构、粒度、渐进披露），评测则停在最终答案。而三类失败里有两类**在最终答案上完全看不出来**——选错 Skill 靠模型常识也能编出像样的回答，跳过步骤也能算出对的数字。**三层检查的价值在于把"看起来对"和"按规矩做"拆开**：一层管触发（确定性）、一层管路由（判断）、一层管执行完整度（细粒度评分）。**这是把"过程正确性"第一次变成可断言的量。**

### "Skill 选择"是新增的一跳，也是新的故障源

以前的路由是"用户 → 工具"，现在是"用户 → Skill → 工具"。多出的这一跳带来一个**此前不存在的失败模式**：**Skill 描述之间的语义重叠**。这与千问那篇"description 自进化"、SkillHone"放入 Skill 不等于能做对事"正好接上——**Skill 越多，路由越难；路由越难，描述越重要**。而 AWS 把 `catalog drift` 列为在线指标，等于承认这是**长期演化的结构性问题**，不是一次性调优能解决的。

### 0.5 这个分数比任何"通过/失败"都有信息量

PDF 案例里 Selection 满分、Instruction 0.5，恰好说明**分档评分的诊断价值**：如果只给"未通过"，团队会去调 Prompt；有了分档，才知道该修的是"没打开提取文件、没定位表格边界"这两个具体动作。**可修复性来自分辨率**——这也解释了为什么要五档而不是二元。

### "像单元测试"是类比，作者没让它变成神话

三处限定很扎实：确定性只覆盖第一层；后两层是 LLM-as-a-Judge 有波动、要按自家数据校准阈值；两个产品的 Pass 不可互换。**在一个人人爱说"Agent 测试就是单元测试"的时期，肯把边界写清的文章更有用**——因为它告诉你哪部分可以进 CI 当硬门禁，哪部分只能当观察指标。

### 竞争焦点的迁移判断，和 SkillHone 撞在同一处

AWS 说"下一步竞争从'谁有 Skills'变成'谁能维护 Skills'"，SkillHone 说"Skill 是活物，要维护决策历史"。**两家从不同入口（评测 vs 进化）得出同一个结论**：Skill 的价值不在数量，而在**可维护性**——能不能测、能不能回归、能不能解释改动。这个共识比任何单一方案都更值得记。

## 实践启示

1. **评测按三层分开**：触发（确定性断言）→ 选择（是否合理）→ 执行完整度（分档），别用最终答案一票判定。

2. **能确定性判断的绝不用 Judge**：已知正确路由的场景，直接断言"该 Skill 必须被加载"。

3. **给关键 Skill 写回归 Case 并接 CI**：`test_passes` 不达标就阻断发布——**别让 Skill 改动绕过 Gate**。

4. **评测要读 Trace，不读回答**：从 OpenTelemetry 的 Span 里找 Skill Invocation，才能定位到"哪一步被跳过"。

5. **三种评测方式配三种用途**：on-demand 排障、batch 盘历史、online 采生产。

6. **用五档而非二元**：0.5 分比"失败"更能指向要修的动作。

7. **盯三个规模化现象**：catalog drift、真实表达 vs 测试 Prompt 的差异、长会话中的指令衰减。

8. **阈值要按自家数据校准**，且不同评测产品的 Pass 不可互换。

9. **别指望 AWS 统一 Harness**：它只是把 Skill 调用抽象成共同的可观察对象。

10. **Skill 数量增长时先治描述重叠**：路由错误多半是描述语义冲突，而不是模型能力问题。

## 与相关实体的关系

- [SkillHone（腾讯微信）](https://github.com/QianJinGuo/wiki-public/blob/main/entities/skillhone-continual-agent-skill-evolution-decision-history-wechat-2026-11-05.md) 从"进化/维护历史"侧回答同一问题；本篇从"评测"侧回答——**两者共同指向"Skill 的竞争在维护，不在数量"**。
- [千问 Skill 路由 description 自进化](https://github.com/QianJinGuo/wiki-public/blob/main/entities/skill-routing-description-self-evolution-qwen-platform-2026-11-03.md) 优化的是本层的 `Skill Selection Accuracy`（描述怎么写才被选中），可直接对接 AWS 的第二层检查做验收。
- AgentCore Managed Harness、[AgentCore 质量评估与策略控制](https://github.com/QianJinGuo/wiki-public/blob/main/entities/amazon-bedrock-agentcore-adds-quality-evaluations-and-policy-controls-for-deploying-trusted-ai-agents.md) 是同一平台的能力底座；本篇补上 **Skill 这个新观察层**。
- [高德 AI 质量工程](https://github.com/QianJinGuo/wiki-public/blob/main/entities/amap-marketing-ai-quality-engineering-oracle-permission-ladder-2026-11-05.md) 的"预期来源 + 权限阶梯 + 契约测试"是同类工程化思路在研发侧的实现，可与本篇三层检查对读（一个管代码交付，一个管 Skill 交付）。
- [vivo PM 视角 Harness 契约](https://github.com/QianJinGuo/wiki-public/blob/main/entities/vivo-pm-agent-harness-design-task-card-contract-2026-11-04.md) 的"契约测试（requiredTools/forbiddenTools/resultSchema）"与本篇 `SkillInvoked` 断言同源：**把必须发生的事写成可执行断言**。

→ [原文存档](https://mp.weixin.qq.com/s/nBadI60SzbIG0lcxg3tyyA)

---

