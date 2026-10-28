# Cloud Use 框架：Agent 作为云上受治理主体的四层模型

> 📊 Level ⭐⭐⭐ | 13.1KB

Cloud Use 是阿里技术提出的原创框架，系统性定义了 AI Agent 如何成为云上受治理、可审计的工作负载。与仅关注"模型如何调用工具"的 Tool Use 不同，Cloud Use 解决的是"云如何接纳 Agent 成为受治理的使用主体"的问题。

## 核心论点

Agent 是云计算迎来的**第三类使用者**——继人类操作者和确定性自动化程序（CI/CD/Terraform/K8s Controller）之后。Agent 同时具备人的目标理解能力和程序的执行速度与调用规模，但其运行需要完整的身份、权限、工具、运行时、状态管理、成本记录、失败恢复和审计链路。

仅具 Tool Use 的 Agent 站在人的影子里——借用人的账号、AK/SK、在线状态维持，缺乏独立身份、凭证、运行时和审计体系，无法成为稳定工作负载。

## Cloud Use 四层能力模型（依赖链）

| 层级 | 核心问题 | 关键能力 |
|------|---------|---------|
| **Identity Use** | 谁在操作 | Agent 不能冒用人的账号，每次动作可回答任务发起者、执行身份、权限来源、过期时间 |
| **Credential Use** | 凭证怎么用 | Vault、短期令牌、受控注入、服务端代理——能用但看不到 |
| **Tool/API Use** | 工具怎么被治理 | MCP + 权限/参数约束/调用审计/速率限制/风险确认 |
| **Runtime Use** | 任务怎么活下去 | 云端 Session、状态管理、事件流、取消机制、结果回传 |

## 三类任务场景

1. **周期性任务**：从"有人每天打开系统"到"任务自己醒来"。BI 分析 111 次工具调用，21.5 分钟，0 人工干预。ETL 116 个事件，13 分钟，cron 触发。
2. **诊断任务**：从"人喂材料"到"Agent 进入现场取证"。CI 失败诊断 3-8 分钟写回 MR，慢查询诊断 2-5 分钟给结论。
3. **执行任务**：从"脚本自动化"到"受治理执行"。低风险自动，高风险审批，全过程可追溯。

## 工程实践：咖啡品牌 BI 案例的六道门槛

一个真实 BI 分析案例展示了 Cloud Use 落地的完整工程栈：

1. **凭证**：先进 Vault，不进 Prompt。vault_credential_id 引用，运行时由平台兑换注入
2. **路径**：Skill 沉淀踩坑史，避免约 13 分钟错误路径探索
3. **角色边界**：任务合约——结论带数字 → 数字回到查询 → 异常不能越权
4. **运行时**：云上 Session — 21 分 32 秒，111 次工具调用，312 个事件，0 人工干预
5. **结果回传**：监听正确事件（session.thread_idled），Webhook 签名验证
6. **验收**：可执行的 Rubric，每个结论有数字，数字回到 SQL 查询结果

## 失败恢复模式

Cloud Use 的独特贡献之一是系统性地讨论了 Agent 如何"失败得可控"：

- **错误路径**：正确+错误路径都沉淀进 Skill
- **基础设施异常**：资源组冻结 → 受控自救（检查→预授权创建→记录），超出边界停止
- **结果回传异常**：监听线程 idle 后再拉取 + 签名验证 + 幂等 + 重试
- **验收过松**：写可执行可检查的标准而非模糊规则

## 成熟度三阶段

Cloud Use 定义了 Agent 用云的成熟度路径：

1. **巡检/诊断/生成（只读）**——低风险高频可验证
2. **带确认的执行（IaC review/流水线确认）**——人在环中
3. **高风险变更（仍需人审批）**——人做最终决策

## 与相关框架的关系

- 与 **Harness Engineering** 的"人在环中"安全原则一致——Agent 能力范围随信任积累逐步扩展
- Cloud Use 的 **四层模型 (Identity→Credential→Tool→Runtime)** 是 Agent 云工作负载的完整治理栈，补充了 [Qoder Cloud Agents 用云新范式](https://github.com/QianJinGuo/wiki-public/blob/main/entities/qoder-cloud-agents-alibaba-skills.md) 中 Skills 层的底层基础设施视角
- Cloud Use 的 **Credential Use 层**（Vault 注入、短期令牌、服务端代理）可视为 Agent 版本的 [阿里云 Agentic Cloud 战略](https://github.com/QianJinGuo/wiki-public/blob/main/entities/alibaba-agentic-cloud.md) 中任务级身份鉴权的具体实现

## 深度分析

### Agent 为何必须被建模为受治理主体，而非工具

Cloud Use 最根本的立场是：Agent 与云的关系不能套用"客户端调用服务"的工具心智模型。工具是被动的能力点，被调用、被授权、用完即走；而 Agent 是一个持续运行、自主决策、会积累状态和信任历史的执行主体。它有目标理解能力（传统上属于"人"的属性），也有程序的调用速度与规模（传统上属于"机器"的属性），这种双重性使它无法被塞进任何一类现有治理框架——按"人"治理缺少账号体系适配，按"程序"治理缺少意图与可变行为的约束。

"站在人的影子里"是这个问题的精准诊断：Agent 借用人的账号和 AK/SK，意味着每一次动作在审计链路上都伪装成人——权限无法按任务最小化，凭证生命周期与任务生命周期错位，出问题时无法回答"到底是谁、在什么授权下做了这件事"。只有把 Agent 提升为一等治理主体，给它独立身份、独立凭证、独立运行时，云才能对它应用与人类和 CI/CD 同等严谨但形态不同的治理规则。

### 四层能力模型的依赖链逻辑

Identity → Credential → Tool/API → Runtime 的排序不是并列清单，而是严格的依赖链：每一层的存在都以下一层为前提，反向不可行。没有 Identity Use（谁在操作可被回答），Credential Use 的短期令牌就无处签发、无人担责；没有 Credential Use（能用但看不到），Tool/API Use 的参数约束与调用审计就形同虚设——Agent 可以绕过治理直接持有明文凭证；没有 Tool/API Use 的治理边界，Runtime Use 里持续运行的 Session 就是一个无人看管的自动化进程，任务"活下去"等于风险"活下去"。

这个依赖链也解释了为什么落地时必须自底向上补课：咖啡品牌 BI 案例的六道门槛（凭证、路径、角色边界、运行时、结果回传、验收）本质上就是四层模型在单一任务上的实例化——vault_credential_id 引用对应 Credential Use，任务合约对应 Tool/API Use 的边界约束，云上 Session 对应 Runtime Use，而"每个动作可回答发起者与权限来源"横贯 Identity 层。

### 失败恢复模式才是真正的成熟度信号

大多数 Agent 框架用"能完成什么任务"来衡量成熟度，Cloud Use 反其道而行：用"失败得是否可控"来衡量。这个视角转换的背后是一个工程事实——Agent 的失败模式与传统自动化根本不同。CI/CD 失败是确定性的、可复现的；Agent 会走向"看似合理但不可用"的 API，会在基础设施异常时自主"发挥"，会在结果回传时拿到半成品数据。这些失败不是 bug，而是自主决策能力的固有副产品。

四类失败模式各有对应的结构性解法：错误路径沉淀进 Skill（把失败转化为组织记忆），基础设施异常用"预授权 + 边界"约束受控自救（自主性有上限），结果回传用 idle-后拉取 + 签名验证 + 幂等（分布式系统的老智慧迁移到 Agent 场景），验收用可执行 Rubric 收紧（把模糊的"做得好不好"变成可判定的谓词）。成熟度三阶段（只读 → 带确认执行 → 高风险人审批）本质上是信任随失败可控性积累而逐步放大的阶梯——一个框架把失败工程放在核心位置，说明它已经从 demo 心态进入生产心态。

### 与 MCP / 工具治理类框架的对比定位

以 [MCP](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/model-context-protocol-mcp.md) 为代表的工具治理框架解决的是"模型与工具之间的标准化接口"——它让任何模型能以统一方式发现和调用工具，但治理半径止步于调用边界之内。Cloud Use 的治理半径从身份开始、贯穿凭证生命周期、延伸到运行时与审计链路，边界是"云原生执行体系"——两者不是竞争关系，而是不同层的抽象：MCP 是 Tool/API Use 层的一种实现选择，Cloud Use 是包含该层的完整治理栈。

与 [Harness Engineering](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/harness-engineering-framework.md) 的"人在环中"原则相比，Cloud Use 把同样的信任渐进思想从交互层（什么时候问人）下沉到基础设施层（身份、凭证、运行时如何为"问人"提供机制支撑）；与 [Agent 身份可移植性](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/agent-identity-portability.md) 讨论的跨系统身份问题相比，Cloud Use 给出了单一云域内身份—凭证—审计的完整闭环实现。更广地看，[Agent 安全架构](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/agent-security-architecture.md) 关注威胁建模与攻防，而 Cloud Use 关注接纳机制——前者回答"Agent 会被怎么攻击"，后者回答"云应该用什么姿势把 Agent 接进来"。Cloud Use 的独特贡献在于它是少数从云平台视角（而非 Agent 框架视角）出发的治理框架。

## 实践启示

1. **先给身份，再谈能力**：任何要让 Agent 进生产的团队，第一件事不是接更多工具，而是解决独立身份与凭证问题。若 Agent 还在用人的 AK/SK，它做的一切都只是"人的影子操作"，治理和审计从根上就是空的。
2. **凭证永远不进 Prompt**：用 Vault 引用（如 vault_credential_id）+ 运行时兑换注入，让 Agent "能用但看不到"。这是 Credential Use 层最低成本、最高收益的第一步。
3. **按依赖链补课，跳层必返工**：跳过 Identity/Credential 直接堆 Runtime 能力，等于给无身份的自动化进程长跑能力——跑得越远越危险。四层模型给出的是补课顺序，不是可选项清单。
4. **把失败预案写进工程栈**：为错误路径沉淀 Skill、为基础设施异常设定预授权边界、为结果回传设计幂等重试、为验收写可执行 Rubric——这四件事的完备度比 Agent 能完成的任务上限更能预测生产可靠性。
5. **信任用阶梯发放**：从只读巡检开始，逐步到带确认的执行、再到高风险人审批。每一次扩展都以"上一阶段的失败可控"为前提，而非以功能 demo 成功为前提。
6. **验收标准要可判定**："结论带数字，数字回到查询结果"式的 Rubric 才能同时防住"验收过松"（LLM 自评放水）和"验收过细"（反复修正死循环）两种失败。

## 关键洞察

- **Agent 让"任务"本身成为新的云抽象**——过去云核心抽象是资源（ECS/RDS/NAS），Agent 时代还需要面向任务和机器执行体的新抽象
- **Tool Use vs Cloud Use 的边界**：Tool Use 是 Agent 用自己的方式调用 API，Cloud Use 是 Agent 以受治理身份进入云原生执行体系。前者解决"模型怎么叫工具"，后者解决"云怎么接纳 Agent"
- **可执行的 Rubric 是验收关键**：并非宽松的描述性标准，而是每个结论可追溯到具体数据（如 BI 结论有数字，数字回到 SQL 查询结果）
- **6 道工程门槛是 Cloud Use 落地的最小可行工程栈**——凭证管理、踩坑知识库、角色边界契约、运行时 Session、事件驱动的结果回传、可执行验收标准，缺一不可

→ [原文存档](https://mp.weixin.qq.com/s/1g0q05XPMsTrSZi-RRPPoA)

---

