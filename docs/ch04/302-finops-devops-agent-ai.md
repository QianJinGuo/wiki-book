# FinOps + DevOps 双Agent 协作：AI驱动的云成本优化实战

> 📊 Level ⭐⭐⭐⭐ | 10.7KB

> **Background**：本文基于 AWS China Blog 2026-06-29 发布的实战案例，由亚马逊云科技客户解决方案经理倪晓峻和李刚撰写。案例展示 FinOps Agent（Preview）与 DevOps Agent（GA）通过结构化交接协议实现端到端云成本优化。

## 三个独有贡献（不应合并到现有 entity）

1. **双Agent 结构化交接协议** — FinOps Agent 识别能力边界后自动生成排查清单（含 CLI 命令、决策条件、风险提示），作为 FinOps→DevOps 的协作桥梁
2. **边界意识设计模式** — Agent 主动声明"我能做什么/不能做什么"，在用户要求越权操作时坚守只读边界
3. **18个月隐性成本案例** — SageMaker Canvas Quick Setup 向导创建的会话 24/7 空转，累计浪费 $47,629，揭示 Quick Setup 的"便利陷阱"

## 双Agent 协作架构

### 关注点分离

| 维度 | FinOps Agent | DevOps Agent |
|------|-------------|-------------|
| 职责 | 费用异常发现、根因分析 | 运行时验证、依赖分析、资源清理 |
| 权限 | **只读**（即使用户要求执行删除也拒绝） | 可写（需用户确认后执行） |
| 数据源 | CloudWatch 账单数据 | CloudTrail 审计日志、SageMaker API |
| 边界 | 无法查询运行时状态、无法执行操作 | 无法进行费用趋势分析 |

### 结构化交接清单

FinOps Agent 生成的排查清单是整个协作的关键：

```
FinOps Agent 输出 → DevOps Agent 输入：
1. 目标资源：3个区域的 Canvas 会话
2. 验证命令：aws sagemaker list-apps ...
3. 决策条件：如果无活跃任务 → 可安全关闭
4. 预期收益：~$4,100/月
5. 风险提示：需确认无外部依赖
```

### 设计哲学

1. **关注点分离** — 分析归分析，执行归执行
2. **最小权限** — FinOps 只读，DevOps 可写但需用户确认
3. **结构化交接** — 通过排查清单传递上下文，避免信息丢失
4. **人在回路** — 关键决策（是否删除）由人类做出

## 案例详情

### 问题发现

FinOps Agent 对测试账号进行全景扫描后发现：
- MTD 总花费 $4,211.96（日均 $351）
- Top 1 服务：Amazon SageMaker，占比 36%（$1,515）
- 98.5% 来自 Canvas:Session-Hrs（Canvas 会话时长）

### 根因分析

- 3 个区域的 SageMaker Canvas 会话 24/7 持续运行
- 所有 Domain 命名遵循 `QuickSetupDomain-{timestamp}` 模式
- 使用 IAM 认证模式，未绑定具体用户身份
- 历史累计浪费：$47,629（18个月）

### DevOps Agent 验证与清理

1. **运行时状态验证** — 并行查询 3 个区域，确认 Canvas 会话完全空闲
2. **关联资源扫描** — 识别 34 个关联资源（3 EFS + 3 EMR + 8 IAM Roles + 6 S3 桶等）
3. **依赖关系评估** — 确认与现有 Notebook 实例完全独立
4. **清理脚本生成** — 按依赖顺序排列的 8 步清理脚本（先删 App → Profile → Domain）
5. **执行后验证** — 再次扫描确认清理完成

## SageMaker Canvas 隐性成本陷阱

- 计费模型：按会话运行时间（~$1.90/小时），非按使用量
- Quick Setup 向导创建的环境默认不自动关闭
- 多区域部署成倍放大问题
- **建议**：定期审计 Canvas/Studio 会话状态，超过 7 天无活跃任务设置自动告警

## 提示词设计技巧

1. **渐进式深入** — 全景扫描 → 聚焦根因 → 历史追溯
2. **一句话传达目标+约束+期望** — "我计划回收...同时帮我确认...确保不影响生产"
3. **适时转向** — Agent 无法提供更多信息时果断转向
4. **了解风险后再授权** — 先理解"不能做"vs"不应该做"，再授权执行

## 深度分析

### 为什么 FinOps+DevOps 必须双 Agent 分工

传统 FinOps 流程的结构性矛盾在于：发现问题靠账单数据，解决问题靠运行时与审计数据。费用数据只能回答"花了多少钱"，无法回答"为什么在花钱"；确认浪费后还要评估依赖关系、避免影响生产——这正是 FinOps 与 DevOps 的分界线。人工流程体现为"提工单 → 运维排查 → 审批 → 清理"，耗时数天到数周，期间浪费持续产生。双 Agent 设计把这条分界线内化为协议边界：FinOps Agent 专注账单维度的异常发现与根因分析，DevOps Agent 专注运行时验证、依赖分析与清理执行，将闭环从"天级"压缩到"小时级"，正是 [多Agent协作模式](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/multi-agent-collaboration-patterns.md) 关注点分离原则的具体化。

### 结构化交接协议的工程价值

案例中最具工程意义的时刻，是 FinOps Agent 被问及 Canvas 运行时状态时明确回答"那是运行时/操作数据，不是账单数据"——没有猜测或编造，而是识别出能力边界。随后生成的排查清单本质上是一份机器可读的协作协议，含五个字段：目标资源、验证命令、决策条件、预期收益、风险提示。这解决了多 Agent 交接信息丢失的经典问题：接收方拿到的不是模糊的"去查一下"，而是可直接执行的 CLI 命令和可判定的决策条件。且清单由输出方主动生成，不依赖共享内存或中心编排器，与 [Agent 角色特化](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/agent-role-specialization.md) 以显式工件交接的思路相呼应。

### Agent 自主执行清理动作的边界设计

本案例的权限模型呈三层结构：FinOps Agent 只读（即使用户要求删除 Canvas，也回答"我是只读的 FinOps 成本分析工具"）；DevOps Agent 可生成清理脚本但自身无删除权限，实际执行由用户运行其 CLI 命令完成；是否删除由人决策。文章称这不是缺陷而是安全设计。另一个细节：用户授权前先追问"是技术限制还是存在风险"——刻意区分"不能做"与"不应该做"之后才授权清理。8 步清理脚本同样体现边界约束：按依赖顺序（先 App → Profile → 最后 Domain）、步骤间加等待、明确排除 VPC/子网/KMS 共享资源、S3 桶标记确认后再删。

### 隐性成本发现的模式归纳

$47,629 的浪费持续 18 个月无人察觉，源于四个叠加的陷阱模式：其一，计费与使用量脱钩——Canvas 按会话运行时间计费（~$1.90/小时），会话处于 InService 即持续计费，即使从未训练模型；其二，便利工具副作用——Quick Setup 创建的环境默认不自动关闭，且关联生成大量用户不知道其存在的辅助资源；其三，命名与归属缺失——`QuickSetupDomain-{timestamp}` 命名、默认 User Profile 不绑定用户，难以追溯责任人；其四，多区域对称部署放大——3 个区域费用几乎完全对称、日均稳定无波动，反而因"看起来正常"躲过异常检测。检测信号是"费用曲线过于平稳"而非"突然飙升"，与突发告警式监控形成互补。

## 实践启示

1. **把"知道自己不知道什么"当作 Agent 的一等能力**：FinOps Agent 在能力边界处主动生成协作清单而非编造答案；工程设计中应显式声明每个 Agent 的能力边界表。
2. **交接走结构化工件，不走对话摘要**：五字段排查清单（目标资源/验证命令/决策条件/预期收益/风险提示）可直接复用为多 Agent 协作的交接模板。
3. **写权限分层下发，删除类操作由人执行**：Agent 生成脚本、用户执行命令，既保留自动化效率又将不可逆操作的控制权留给人；授权前先让 Agent 解释"哪些必须手动、为什么"。
4. **把 Quick Setup 类便利工具纳入定期审计**：按前缀搜索向导生成的资源、检查 IAM Roles 最后使用时间识别僵尸角色。
5. **用 SCP 和标签强制弥补归属缺失**：组织层面限制 Quick Setup 使用或强制添加 Owner 标签；对 Canvas/Studio 等按会话计费的服务，超过 7 天无活跃任务即设自动告警。

## 与现有 FinOps 实体差异化

| 维度 | 本实体（双Agent协作） | strands-agents-cloud-cost-optimizer | amazon-quick-bedrock-agentcore-finops-chat |
|------|------|------|------|
| 架构 | **FinOps + DevOps 双Agent** | 单Agent（Strands SDK） | Quick Chat + Bedrock AgentCore |
| 独特价值 | 结构化交接协议 + 边界意识 | Strands SDK 框架实现 | MCP Server 自然语言查询 |
| 执行能力 | DevOps Agent 可执行清理 | 分析+建议 | 只读查询 |
| 案例 | $47,629 隐性成本发现 | 通用成本优化 | 多账号成本查询 |

→ [原文存档](https://aws.amazon.com/cn/blogs/china/finops-devops-agent-ai-cost-optimize/)
→ [Strands 云成本优化](https://github.com/QianJinGuo/wiki-public/blob/main/entities/strands-agents-cloud-cost-optimizer.md)
→ [Quick + AgentCore FinOps](https://github.com/QianJinGuo/wiki-public/blob/main/entities/amazon-quick-bedrock-agentcore-finops-chat.md)

---

