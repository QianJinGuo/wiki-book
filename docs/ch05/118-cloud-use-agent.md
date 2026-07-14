# Cloud Use 框架：Agent 作为云上受治理主体的四层模型

## Ch05.118 Cloud Use 框架：Agent 作为云上受治理主体的四层模型

> 📊 Level ⭐⭐⭐ | 6.3KB | `entities/cloud-use-framework-agent-cloud-workload.md`

# Cloud Use 框架：Agent 作为云上受治理主体的四层模型

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
- Cloud Use 的 **四层模型 (Identity→Credential→Tool→Runtime)** 是 Agent 云工作负载的完整治理栈，补充了 [Qoder Cloud Agents 用云新范式](../ch03/070-skills.html) 中 Skills 层的底层基础设施视角
- Cloud Use 的 **Credential Use 层**（Vault 注入、短期令牌、服务端代理）可视为 Agent 版本的 [阿里云 Agentic Cloud 战略](../ch04/332-agentic-cloud.html) 中任务级身份鉴权的具体实现

## 关键洞察

- **Agent 让"任务"本身成为新的云抽象**——过去云核心抽象是资源（ECS/RDS/NAS），Agent 时代还需要面向任务和机器执行体的新抽象
- **Tool Use vs Cloud Use 的边界**：Tool Use 是 Agent 用自己的方式调用 API，Cloud Use 是 Agent 以受治理身份进入云原生执行体系。前者解决"模型怎么叫工具"，后者解决"云怎么接纳 Agent"
- **可执行的 Rubric 是验收关键**：并非宽松的描述性标准，而是每个结论可追溯到具体数据（如 BI 结论有数字，数字回到 SQL 查询结果）
- **6 道工程门槛是 Cloud Use 落地的最小可行工程栈**——凭证管理、踩坑知识库、角色边界契约、运行时 Session、事件驱动的结果回传、可执行验收标准，缺一不可

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/cloud-use-agent-cloud-native-execution-alibaba-2026.md)

---

