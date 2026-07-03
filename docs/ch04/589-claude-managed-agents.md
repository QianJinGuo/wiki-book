# Claude Managed Agents 企业边界更新

## Ch04.589 Claude Managed Agents 企业边界更新

> 📊 Level ⭐⭐⭐ | 11.7KB | `entities/claude-managed-agents-self-hosted-sandbox-enterprise.md`

## 概述
Anthropic 2026年5月18日更新 Claude Managed Agents，新增 self-hosted sandboxes 和 MCP tunnels 功能。本质是"brain Anthropic化、hand 企业侧化"的混合控制平面架构落地。 ^[https://mp.weixin.qq.com/s/dqg5rr2V073oloyAZVPB9Q]

## 核心架构：混合控制平面
| 组件 | 归属 |
|------|------|
| agent loop、session、编排、模型调用、事件流、控制台 | Anthropic（平台） |
| 代码执行、文件访问、内部服务调用 | 企业侧（客户基础设施） |
**执行边界客户侧化，控制平面 Anthropic 化。** ^[https://mp.weixin.qq.com/s/dqg5rr2V073oloyAZVPB9Q]

## Self-hosted Sandboxes
**机制**：企业在自有基础设施跑一个 worker，从 Anthropic 平台拉取工作项，在客户控制环境里执行工具/访问文件/跑命令，结果返回 Managed Agents session。 ^[https://mp.weixin.qq.com/s/dqg5rr2V073oloyAZVPB9Q]
**解决的问题**：私有仓库、内部依赖、构建工具、日志文件、测试环境、受限文档的安全评审阻力。 ^[https://mp.weixin.qq.com/s/dqg5rr2V073oloyAZVPB9Q]
**不是完整自托管**：决策过程、session 状态、事件流、工具调用结果仍在托管控制平面。 ^[https://mp.weixin.qq.com/s/dqg5rr2V073oloyAZVPB9Q]

## MCP Tunnels
**机制**：私有 MCP server（工单系统、内部文档库、数据库查询代理、监控平台、审批流、GitHub Enterprise）可通过 tunnel 被 Claude 调用，无需开放公网入口。 ^[https://mp.weixin.qq.com/s/dqg5rr2V073oloyAZVPB9Q]
**局限性**：只解决网络可达性，不解决工具治理。后面需要 MCP gateway（OAuth、tool allowlist、参数校验、审计、限流、PII redaction、危险动作审批）。 ^[https://mp.weixin.qq.com/s/dqg5rr2V073oloyAZVPB9Q]

## 两次更新的完整图景
| 日期 | 更新重点 | 解决的问题 |
|------|----------|------------|
| 2026-05-06 | Dreaming、Outcomes、Multi-agent orchestration、webhooks | 记忆腐化、交付验收、任务拆分、事件对接 |
| 2026-05-18 | Self-hosted sandbox、MCP tunnels | 代码执行边界、私有工具连接 |

## 社区质疑回应情况
| 质疑 | 状态 |
|------|------|
| 数据边界/私有文档接入 | ✅ 已回应（self-hosted sandbox） |
| 正确性/产物错了谁发现 | ✅ 已回应（Outcomes grader） |
| 记忆腐化 | ✅ 已回应（Dreaming） |
| 复杂任务拆分 | ✅ 已回应（Multi-agent orchestration） |
| 模型锁定（只能 Claude） | ❌ 未回应 |
| 成本/token 透明度 | ❌ 未回应 |
| 跨模型 harness | ❌ 未回应 |
| 失败恢复 | ❌ 未回应 |
| token 归因 | ❌ 未回应 |

## 四象限验证框架
1. **self-hosted sandbox 能不能过安全评审**：只读任务 + 结构化摘要 + 少量证据片段，不大量返回完整代码 ^[https://mp.weixin.qq.com/s/dqg5rr2V073oloyAZVPB9Q]
2. **MCP tunnel 能不能承载真实私有工具**：read-only tool + 限制参数枚举 + 去敏 + 调用记录 ^[https://mp.weixin.qq.com/s/dqg5rr2V073oloyAZVPB9Q]
3. **Outcomes 能不能发现真实错误**：rubric 写必须覆盖的文件/引用的证据/不能出现的错误，不写"质量高" ^[https://mp.weixin.qq.com/s/dqg5rr2V073oloyAZVPB9Q]
4. **成本和延迟能不能解释**：拆解为 session 时长、tool call 次数、worker 执行时间、grader 轮数、人工返工次数 ^[https://mp.weixin.qq.com/s/dqg5rr2V073oloyAZVPB9Q]

## 产品定位
Claude Managed Agents ≠ Claude Code。Claude Code 适合本地 CLI 协作（人+Agent 一起读代码/改文件/跑测试）。Managed Agents 站在另一层：长任务控制平面、异步执行、session log、sandbox、MCP、outcomes、多 Agent 编排、事件追踪。 ^[https://mp.weixin.qq.com/s/dqg5rr2V073oloyAZVPB9Q]

## 工程哲学
> 控制平面继续托管化，执行环境开始客户侧化，私有工具连接开始标准化，质量、记忆、编排继续平台对象化。
四件事能过，Managed Agents 才具备接进生产工作流的条件：**数据流能不能审计，工具权限能不能收紧，outcome rubric 能不能发现真实错误，成本能不能按任务解释。** ^[https://mp.weixin.qq.com/s/dqg5rr2V073oloyAZVPB9Q]

## 深度分析
### 混合控制平面的架构意义
Anthropic 选择"控制平面托管化、执行环境客户侧化"的架构，反映了对企业需求的精准把握。关键洞察是：**企业不想要完整自托管（失去模型能力），也不接受全托管（数据安全/合规问题）**。混合模式提供了第三种路径——让能做好的那部分（模型推理、agent loop、session 管理）留在平台，让必须留在客户环境的那部分（代码执行、文件访问、私有工具）留在客户侧。 ^[https://mp.weixin.qq.com/s/dqg5rr2V073oloyAZVPB9Q]
这个架构的核心价值在于**边界清晰**。控制平面负责"大脑"功能（决策、记忆、编排），执行环境负责"手"功能（执行具体命令）。这与传统的"AI能力必须全在云端"假设不同，是一种务实的工程分解。 ^[https://mp.weixin.qq.com/s/dqg5rr2V073oloyAZVPB9Q]

### Self-hosted Sandbox 的安全模型
Sandbox 设计解决了企业采用 Agent 的核心顾虑——代码不会跑在未知环境里。但更重要的是"Sandbox 不是 VM"这一设计选择：企业侧的 worker 只是一个轻量进程，平台无法直接访问客户网络，只能通过定义好的工具接口操作。这种"受约束的执行"比"完整 VM"更符合企业安全模型。 ^[https://mp.weixin.qq.com/s/dqg5rr2V073oloyAZVPB9Q]
验证框架中"不大量返回完整代码"的要求揭示了一个关键原则：**产物可以审计，但原始代码不能暴露**。这对金融、医疗、法律等强合规行业尤为重要。 ^[https://mp.weixin.qq.com/s/dqg5rr2V073oloyAZVPB9Q]

### MCP Tunnels 的连接器定位
MCP Tunnels 本质上是一个"网络层解决方案"，而非"治理层解决方案"。文章明确指出：tunnel 只解决网络可达性，工具治理需要单独的 MCP Gateway。这意味着： ^[https://mp.weixin.qq.com/s/dqg5rr2V073oloyAZVPB9Q]
1. **当前阶段**：MCP Tunnels 让企业可以先连上私有工具（快速落地） ^[https://mp.weixin.qq.com/s/dqg5rr2V073oloyAZVPB9Q]
2. **下一阶段**：MCP Gateway 才能让工具治理真正生效（安全合规） ^[https://mp.weixin.qq.com/s/dqg5rr2V073oloyAZVPB9Q]
这是一个"先连接再治理"的务实路径，与当年 VPN 先连接再升级到零信任网络的演进路径类似。 ^[https://mp.weixin.qq.com/s/dqg5rr2V073oloyAZVPB9Q]

### 两次更新的互补性
| 更新日期 | 解决的问题 | 未解决的问题 |
|----------|------------|--------------|
| 2026-05-06 | 记忆腐化、交付验收、任务拆分、事件对接 | 数据边界、私有工具连接 |
| 2026-05-18 | 代码执行边界、私有工具连接 | 模型锁定、成本透明度、失败恢复 |
第一次更新补全了"大脑"能力（Dreaming/Outcomes/Multi-agent），第二次更新补全了"手"能力（Sandbox/Tunnels）。两次结合，才是完整的 Agent 能力图谱。 ^[https://mp.weixin.qq.com/s/dqg5rr2V073oloyAZVPB9Q]

### 未回应的质疑揭示的战略边界
模型锁定、成本透明度、跨模型 harness 等未回应问题，揭示了 Anthropic 的战略边界： ^[https://mp.weixin.qq.com/s/dqg5rr2V073oloyAZVPB9Q]

- **模型锁定**：Anthropic 不打算让 Managed Agents 支持第三方模型——这是平台差异化的核心
- **成本透明度**：按 session/按任务的成本归因尚未成熟，可能需要下一版本
- **失败恢复**：长任务的中断恢复需要更复杂的 state management

## 相关链接
- [Claude Managed Agents Self Hosted Sandbox Enterprise](ch03/045-agent.md)

## 实践启示
### 1. 评估企业 Agent 平台的四维框架
用文章提供的四象限框架评估任何企业 Agent 方案： ^[https://mp.weixin.qq.com/s/dqg5rr2V073oloyAZVPB9Q]

- **数据流审计性**：工具调用记录是否完整、可查询、不可篡改？
- **权限控制粒度**：能否限制 Agent 只能访问特定文件、API、数据库？
- **验收自动化程度**：Outcomes/Rubric 能否捕获真实错误，而非只是评分？
- **成本可解释性**：能否将成本归因到具体任务、工具、Agent？

### 2. MCP 工具接入的渐进路径
对于企业已有 MCP 生态的团队： ^[https://mp.weixin.qq.com/s/dqg5rr2V073oloyAZVPB9Q]
1. **第一阶段**：用 MCP Tunnels 连通私有工具，先跑通场景 ^[https://mp.weixin.qq.com/s/dqg5rr2V073oloyAZVPB9Q]
2. **第二阶段**：增加 MCP Gateway，实现 OAuth、allowlist、审计 ^[https://mp.weixin.qq.com/s/dqg5rr2V073oloyAZVPB9Q]
3. **第三阶段**：细化 PII redaction、危险动作审批、限流 ^[https://mp.weixin.qq.com/s/dqg5rr2V073oloyAZVPB9Q]
不要等到 Gateway 完善才开始——Tunnels 足以支持 PoC，但生产环境必须配 Gateway。 ^[https://mp.weixin.qq.com/s/dqg5rr2V073oloyAZVPB9Q]

### 3. Self-hosted Sandbox 的适用场景判断
**适合用 Sandbox 的场景**： ^[https://mp.weixin.qq.com/s/dqg5rr2V073oloyAZVPB9Q]

- 私有代码仓库（不允许代码上传到第三方）
- 内部依赖/私有包管理
- 敏感文档处理（财务、医疗、法律）
- 需要完整测试环境的任务
**不需要 Sandbox 的场景**： ^[https://mp.weixin.qq.com/s/dqg5rr2V073oloyAZVPB9Q]

- 公开代码库处理
- 不涉及敏感数据的分析任务
- 已有成熟云端开发环境的团队

### 4. 验证循环的 rubric 设计
Outcomes grader 的有效性取决于 rubric 质量。建议 rubric 设计原则： ^[https://mp.weixin.qq.com/s/dqg5rr2V073oloyAZVPB9Q]

- **覆盖的文件/模块**：明确列出 Agent 必须检查的代码范围
- **引用的证据**：要求 Agent 在输出中引用具体文件行号、测试用例
- **禁止的错误类型**：如"不能出现硬编码凭据"、"不能删除非预期文件"
避免 rubric 写"质量高"、"逻辑正确"等模糊描述——要写可验证的具体条件。 ^[https://mp.weixin.qq.com/s/dqg5rr2V073oloyAZVPB9Q]

### 5. 与 Claude Code 的选择决策树
```
任务类型？
├── 本地 CLI 协作（人+Agent 一起读代码/改文件/跑测试）→ Claude Code
├── 长任务异步执行（小时级任务、脱离终端）→ Managed Agents
├── 私有环境处理 → Managed Agents + Sandbox
├── 需要深度代码库理解 → Claude Code（实时交互）
└── 需要编排多个 Agent → Managed Agents + Multi-agent
```

### 6. Anthropic 平台锁定的风险管理
如果决定使用 Managed Agents，需要管理模型锁定风险： ^[https://mp.weixin.qq.com/s/dqg5rr2V073oloyAZVPB9Q]

- 将关键流程的 Prompt/Instruction 文档化（非硬编码在 Agent 配置中）
- 保持人工审核节点，尤其在高风险操作（删除、部署、财务）
- 监控 Anthropic 产品路线图，为跨模型迁移留有预案
→ （原始来源待补充，综合分析） ^[https://mp.weixin.qq.com/s/dqg5rr2V073oloyAZVPB9Q]
## 相关实体
- [Claude Managed Agents Self Hosted Sandbox Mcp Tunnels Enterprise](ch03/045-agent.md)
- [Claude Managed Agents Official](ch04/479-claude-managed-agents-official.md)
- [Claude Managed Agents](ch04/537-claude-managed-agents.md)
- [Anthropic Claude Managed Agents Platform Launch](ch04/340-anthropic-claude-managed-agents-platform-launch.md)
- [Anthropic Claude Managed Agents Platform 2026](ch03/045-agent.md)
- [MOC](https://github.com/QianJinGuo/wiki/blob/main/moc/multi-agent-coordination.md)

---

