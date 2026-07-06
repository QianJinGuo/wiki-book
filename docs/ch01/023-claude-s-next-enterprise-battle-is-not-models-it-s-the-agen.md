# Claude's next enterprise battle is not models: it's the agent control plane

## Ch01.023 Claude's next enterprise battle is not models: it's the agent control plane

> 📊 Level ⭐ | 9.7KB | `entities/claudes_next_enterprise_battle_is_not_mo.md`

## 核心要点
- 模型竞争已不再是企业 AI 的唯一焦点；**agent 控制平面**正成为新的战略高地 
- VB Pulse 调查：Microsoft Copilot Studio & Azure AI Studio 以 **38.6%** 领跑企业级 agent 编排平台，OpenAI 25.7% 排名第二，Anthropic 首次出现占 5.7% 
- **安全与权限**连续两月成为编排平台选型首要标准（39.3% → 37.1%），超过灵活性需求 
- 企业偏好**混合控制平面**架构（约 35-36%），不愿将编排全权委托给单一供应商 
- vendor lock-in 是唯一环比上升的风险担忧（23.2% → 25.7%） 
- 独立编排框架（LangChain/LangGraph）从 5.4% 跌至 1.4%，企业级包装能力不足 
- MCP 协议层开放不等于运行时层开放；**运行时锁定风险依然存在** 

## 深度分析
### 1. 从模型博弈到基础设施博弈的范式转移
过去两年企业 AI 竞争被描述为"模型之战"，但本文揭示了一个更深刻的结构性转变：**竞争焦点正从模型能力层向 agent 运行环境层迁移**。这个迁移的背后逻辑并不复杂——当模型本身越来越同质化（Claude、GPT-4o、Gemini 在多数基准上差距缩小），企业开始意识到**真正的差异化在于 agent 如何被管理、监控和治理**。
VB Pulse 数据印证了这一转移：安全与权限在 Q1 2026 连续两月成为编排平台选型首要标准，而"多模型多工具灵活性"则从 35.7% 跌至 25.7%。这说明市场正在从"可选性优先"向"治理优先"切换。一个可以 act 的 AI agent（发送邮件、修改文档、查询数据库、调用工作流）其"爆炸半径"远大于一个只生成文本的聊天机器人——企业的问题不再是"agent 够不够聪明"，而是"**谁来授权、触发了什么、能否回滚**"。

### 2. 模型易换，运行时难迁——锁定效应的真实机制
文章的核心洞察在于区分了"模型"与"agent 运行时"的替换成本：模型相对容易切换（一条指令换 API），但一旦工作流、工具权限、凭证、审计日志、记忆、隔离执行和运营监控都跑在某个供应商的环境里，切换供应商就变成了**换基础设施**而非"换模型"。
这个机制对 Anthropic 的战略意义极为重要。Anthropic 的 Claude Managed Agents 文档明确描述了公开 beta：一个托管的 agent harness，包含安全沙箱、内置工具和 API 运行的 session。这已经不是纯推理 API，而是**可操作的基础设施**。Anthropic 在做的事情本质上是：让 Claude  agents 的 context 记忆、工具调用、代码执行、隔离运行和长流程持久化都跑在 Anthropic 的托管环境里。

### 3. Anthropic 的 5.7% 为何战略意义大于数字本身
从 0% 到 5.7% 看起来很小，但本文的价值在于解释了这个数字的战略含义——它标志着 Claude 使用从**模型层开始渗入原生编排层**。更重要的是，Anthropic 在 Foundation Models tracker 中已经展现出强劲势头：Claude 从 1 月的 23.9% 上升到 3 月的 56.2%（尽管 3 月样本仅 16 人，属于方向性判断）。
模型层的 momentum 会逐渐传导到编排层，这是合理的：当企业已经在使用 Claude 处理高风险、高复杂度任务时，让 Anthropic 也负责这些 agent 的运行环境就成了自然延伸。Anthropic 不需要打败 Microsoft 成为默认企业平台，只需要成为"那些已经信任 Claude 处理敏感复杂工作负载的企业"的 agent 运行时。

### 4. Microsoft 的分发优势与 OpenAI 的稳定跟随
Microsoft 的领先地位并不令人意外——Copilot Studio 和 Azure AI Studio 嵌入了企业已有的技术栈（Microsoft 365、Teams、Entra ID、Azure），采购关系本身就带着分发渠道。这是一种**分发的制度性优势**，而非技术性优势。
OpenAI 的 Assistants 和 Responses API 稳居第二（23.2% → 25.7%），这说明 OpenAI 通过早期开发者生态建立了可持续的编排存在感。Anthropic 作为新进入者面临的选择是：是在 Microsoft 和 OpenAI 的既有生态夹缝中竞争，还是在自己的强项（安全、合规、复杂推理）领域建立独立的 agent 运行环境。

### 5. MCP 的开放性与运行时的锁定风险
本文的一个重要细节是对 MCP（Model Context Protocol）的辩证分析：MCP 是 Anthropic 推出的开放标准，用于连接 AI 系统与数据和工具。但协议层的开放不等于运行时层的开放——企业可以用开放协议连接工具，同时仍然依赖供应商的托管 session、日志、沙箱、权限模型、工作流状态和部署环境。
这意味着 **MCP 降低了集成摩擦，但托管 agent 基础设施可能反而增加切换成本**。这是一个关于"开放接口、封闭实现"的标准商业故事，在云基础设施领域已经反复上演。

### 6. Agent Ops 崛起：从 LLMOps 到跨供应商协作
行业正在经历从 MLOps → LLMOps → **Agent Ops** 的演进。治理边界必须从 LLM 调用本身扩展到整个 agent scope。Dr. Rania Khalaf（WSO2）的观点切中要害：LLM 调用层的 guardrail 可以捕获 hallucination 或 toxic output，但无法捕获 agent 在无法 break 的高成本循环中 thrashing。
这催生了下一个竞争cycle：**跨供应商协作层**。Arick Goomanovsky（BAND）的判断是：企业现在在各处运行 agent——个人助手、编码 agent、生产多 agent 系统、嵌入在 Agentforce 和 ServiceNow 中的 agent、作为 service 消费的第三方 agent——但它们默认不跨边界协作。"下一个竞争周期是跨供应商的 agent 协作"，这意味着需要一个让来自 Microsoft、OpenAI、Anthropic 和内部团队的 agent 作为一个 workforce 协同工作的交互层。

## 实践启示
### 对企业买家
1. **优先建立 agent 身份与权限层，而非急于选择编排平台**。Ev Kontsevoy（Teleport）的警告值得重视："没有身份层，编排只是在倍增混乱。"在部署 agent 之前，先建立统一的身份层是必要前提。
2. **采用混合控制平面策略**，避免单一供应商全权托管。VB Pulse 数据显示 35-36% 企业倾向混合架构，这是理性的风险分散。
3. **将 MCP 等开放协议纳入架构评估**。协议层开放不意味着运行时层开放——需要在架构设计阶段区分集成层（可用开放标准）和运行时层（评估供应商锁定程度）。
4. **安全与治理需求应从模型层延伸到 agent 运营层**。Nithya Lakshmanan（Outreach.ai）的建议——领域特定数据作为治理层，编排平台位于其上——值得参考。

### 对 AI 管理者和开发者
1. **从 LLMOps 向 Agent Ops 的演进是必由之路**。需要将 guardrail、evals、策略、bindings 和 agent identity 从核心 agent 逻辑中分离出来，使它们可以按部署和环境配置，由安全和合规团队拥有。
2. **关注跨供应商协作层的解决方案**。随着多供应商 agent 环境的普及，跨边界协作层将成为下一个热点。
3. **独立框架需要补齐企业级交付能力**。LangChain/LangGraph 的下滑（5.4% → 1.4%）说明安全认证、支持体系、合规文档和供应商责任是企业采购的硬性门槛，开源框架必须解决这些问题才能进入企业采购名单。
4. **Anthropic 的 agent 托管策略值得密切关注**。如果 Anthropic 能成功说服 Claude 企业客户让其处理更多周边 machinery（工具、工作流、记忆、执行和治理），Claude 将从"多模型组合中的一个模型"变成"企业工作负载的基础设施层"。

### 对供应商
1. **安全与治理能力正在成为差异化关键**。39.3% 的企业将安全和权限作为编排平台选型首要标准——这不是可以绕过的特性，而是核心卖点。
2. **分发渠道优势在企业市场依然有效**。Microsoft 的领先地位很大程度上来自已有的企业采购关系和 M365/Azure 生态集成——这说明企业 AI 市场的竞争不只是技术竞争，也是渠道和生态竞争。
3. **领域特定 agent 可能帮助 Anthropic 建立编排滩头**。Anthropic 面向 finance 和 design 推出的领域特定 agent，代表了一种"垂直渗透"策略——不需要赢得整个编排市场，只需要在自己强项领域建立 agent 运行时的信任。

## 关联阅读
- [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/claudes_next_enterprise_battle_is_not_mo.md)
- [Agent Orchestration](../ch04/465-agent-orchestration.md)

## ## 相关实体
- [Anthropic最危险路线图曝光: 无限记忆、多智能体! 硅谷AI终局仅剩双雄决顶](ch01/846-anthropic.md)

## ## 相关实体
- [AI 行业就业八大变化（腾讯研究院纵向对比）](../ch04/070-ai.md)

## ## 相关实体
- [Harness Engineering 三次范式跃迁与四根支柱](https://github.com/QianJinGuo/wiki/blob/main/concepts/harness-engineering-paradigm-shift.md)

## ## 相关实体
- [CDP Bridge MCP：真实浏览器直连 MCP 工具](../ch03/045-agent.md)
- [MOC](https://github.com/QianJinGuo/wiki/blob/main/moc/openai-developer-ecosystem.md)

---

