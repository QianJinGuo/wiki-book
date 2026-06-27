# The new AI lock-in

## Ch01.656 The new AI lock-in

> 📊 Level ⭐⭐ | 5.1KB | `entities/the-new-ai-lock-in.md`

## 核心要点
- Published Time: 2026-05-16T22:36:49-06:00 Even as models get easier to swap, the work that surrounds them is not. Developers already move among Claude Code, Codex, Gemini, and local models with less c
## 相关实体
- [New Lock](/ch01-681-the-new-ai-lock-in/)
- [Introducing Claude Platform On Aws Anthropics Native Platfor](/ch01-392-introducing-claude-platform-on-aws-anthropic-s-native-platf/)
- [刚刚Opus 47发布相比46核心变化与Claude Code搭配最佳实践](/ch01-273-刚刚opus-4-7发布-相比4-6核心变化-与claude-code搭配最佳实践/)
- [Anthropic Nla Natural Language Autoencoders Interpretability](/ch01-279-claude思考黑箱终结了-anthropic-祭出ai读心术-揭秘claude的隐藏想法/)
- [Opus 4 7 Launch Claude Code Best Practices Wechat](/ch01-172-刚刚opus-4-7发布-相比4-6核心变化-与claude-code搭配最佳实践/)

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/the-new-ai-lock-in.md)

## 深度分析
**锁定的本质从未消失，只是上移了层级**
文章的核心诊断精准：模型层的替换成本正在下降（API 标准化、OpenAI/Anthropic/Google 的模型能力趋同），但围绕模型的 workflow、治理结构和操作流程的粘性并未减弱。一旦企业在某个 orchestration 框架（LangGraph）、某个 workflow 平台（Claude Cowork）或某个服务商（PwC/Accenture/Deloitte）上投入了数万小时的人工整合工作，替换该层的成本就远远超过替换底层模型 API 的成本。
**MIT NANDA 数据的深层含义**
95% 的企业 GenAI 试点未能交付可衡量业务价值这一数字（尽管在方法论上存在争议）指向一个结构性问题：AI 工具无法"学会"现有的工作流程——它们需要被嵌入到审批路径中、获得正确的权限、携带组织的制度记忆。这不是模型能力不足，而是**部署工程**（deployment engineering）的失败。DeployCo 之所以存在，就是因为 OpenAI 最终认识到：客户真正需要的不是更聪明的模型，而是一个能到现场做"无聊、昂贵、难替换"的流程整合工作的真人。这与 Palantir 的商业模式殊途同归。
**MCP 的历史先例：Kubernetes 的镜像**
作者用 Kubernetes 来类比 MCP 是恰当的。Kubernetes 标准化了容器编排层，消除了"在哪运行容器"的锁定——但紧接着，锁定就转移到了上层托管服务、身份管理、网络策略和数据重力之上。MCP 正在做类似的事：将"模型如何连接工具和数据"这一层标准化和低成本化，但企业工作流的粘性——谁批准了这个 agent、它能访问哪些数据、它的行为如何被记录、如何在操作员离职后安全关闭——这些 irreducibly local 的问题依然存在，且更加难以迁移。
**三层锁定的结构差异**
1. **Orchestration 层**：LangGraph 等框架积累了业务逻辑、eval 框架、恢复策略和可观测性追踪，一旦投入生产使用，替换代价等同于部分重写。
2. **Vendor-controlled workflow surface**：Claude Cowork 的插件市场、per-user provisioning 和预建 agent 表面上是"平台"，但真正的粘性来自管理员不想要 400 个随机 agent 接入合同系统、HR 数据和客户记录——这个管理成本本身就是壁垒。
3. **Services 层**：OpenAI、Anthropic 与 PwC/Accenture 的合作本质上是在训练一支懂 AI 和懂企业流程的混合部队，这支部队的know-how 是无法通过切换底层模型复制的。

## 实践启示
- **在模型 bake-off 上少花时间，在 orchestration 框架选型上多花时间**。模型 API 替换成本已低至 1-2 周代码改动，而 LangGraph 的替换成本是 6-12 个月。
- **以"workflow 可移植性"而非"模型可替换性"作为 AI 架构的核心目标**：将核心业务逻辑抽象到与模型无关的中间层，使底层模型更换不触发业务流程重写。
- **警惕 vendor-controlled workflow surface 的隐性锁定**：Claude Cowork 的预建 agent 表面上是"功能"，实际上是企业特定工作流程的编码——一旦深度使用，迁移成本极高。
- **服务商关系是最深层的锁定**：PwC 和 Anthropic 的合作带来的 10 周到 10 天的 underwriting 效率提升，不是因为模型，而是因为数万名顾问的流程再设计经验。选择服务伙伴时，应评估其流程知识而非模型推荐能力。
- **MCP 作为解药的一面**：MCP 降低了工具连接成本，使企业不至于因为"换一个模型就要重写所有 connector"而被锁定在单一 provider——但它只能解轻度锁定，无法消除重度 workflow 粘性。
- **Agent Skills 的开放性是战略杠杆**：Anthropic 开放 Agent Skills 且强调"skills you create aren't locked to Claude"是争取客户信任的正确方式，企业在选择技能体系时也应优先考虑不与特定 provider 强绑定的方案。

---

