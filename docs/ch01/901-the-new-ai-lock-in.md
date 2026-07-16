# The new AI lock-in

## Ch01.901 The new AI lock-in

> 📊 Level ⭐⭐ | 4.4KB | `entities/new-lock.md`

## 核心要点
- source: [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/new-lock.md)
- review: v=7 × c=8 = 56

## 摘要
## 相关实体
- [The New Ai Lock In](ch01/848-the-new-ai-lock-in.html)
- [New Ai Lock In](ch01/848-the-new-ai-lock-in.html)
- [Cloud Ai Mobile Testing New Era Amazon Device Farm Mcp Server Practical Guide En](../ch05/086-ai.html)
- [P Ic Work Is The New Career Flex](../ch03/009-ic-work-is-the-new-career-flex.html)
- [Thehackernews Com The New Phishing Click How Oauth](https://github.com/QianJinGuo/wiki/blob/main/entities/thehackernews-com-the-new-phishing-click-how-oauth.md)

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/new-lock.md)

## 深度分析
文章核心命题：AI 供应商锁定（lock-in）并未消失，而是从模型层向上迁移到了编排层、工作流表面和服务层。
**锁定结构的三层迁移**
1. **模型层**：替换成本持续下降。Claude Code、Codex、Gemini、Local 模型之间的迁移越来越顺畅，API 层的抽象也在改善。但这是供应商最希望客户关注的层面——因为它最容易替代。
2. **编排层（Orchestration Layer）**：框架如 LangGraph 本身不是锁定陷阱，但编排逻辑会积累粘性。Klarna、Replit、Elastic、Ally 等已在 LangGraph 上投入一年时间构建 agent 行为、评估、恢复逻辑和可观测性追踪的公司，不太可能因为竞品发布更快/更便宜的模型就拆除它。
3. **工作流表面（Workflow Surface）**：Anthropic 的 Claude Cowork 战略真正发力的地方——私有插件市场、per-user 配置预构建 HR/金融/投行/设计 agent。企业 IT 不希望 400 个随机 agent 接入合同系统、HR 数据和客户记录，因此围绕 agent 的管理平面成为产品本身。
4. **服务层（Services Layer）**：讽刺的是，AI 价值正在向实施层面迁移。OpenAI、Anthropic、PwC、Accenture、Deloitte 都在训练咨询大军做工作流映射、系统连接和流程重新设计。PwC 与 Anthropic 声称合作将网络安全事件响应从小时级缩短到分钟级，承保周期从 10 周缩短到 10 天——但这些收益来自了解如何重新设计周围流程的数万名顾问，而非模型本身。
**MCP 的局限**
Model Context Protocol 降低了模型连接工具和数据源的成本，但它无法解决企业级问题：谁批准了那个 agent？它能访问哪些数据？其操作如何记录？如何安全关闭？K8s 同样如此——它标准化了容器层，但下一场战斗转移到托管服务、身份、网络、可观测性和数据重力。MCP 使建筑的一层变得可移植，但将更难的企业问题留在了上一层。
**95% 失败率的真正含义**
MIT NANDA 报告显示 95% 企业 genAI pilot 未能交付可衡量的业务影响。大多数失败不是模型能力问题，而是运营适配问题：工具不学习工作流，不融入审批路径，不携带正确的权限。它们无法在人们实际工作的环境中存活。

## 实践启示
**对 Enterprise IT 决策者的战略建议**
1. **停止在点解决方案上过度纠结**：模型替换成本正在下降，应将注意力转向真正需要审慎决策的层级。
2. **三个需要认真审查的战略决策**：

   - 你将向哪个编排框架提交代码？（Multi-year code rewrite）
   - 最终用户将实际生活在哪个工作流表面上？（Behavior change across thousands of employees）
   - 哪个服务合作伙伴将足够深入地嵌入你的运营，使其模型建议具有事实约束力？（Budget line item with long tail）
3. **将工作流集成视为你真正拥有的东西**：模型和合作伙伴都是可替代的围绕它的层。Anthropic 开源 Agent Skills 并声称"你创建的技能不锁定在 Claude 上"是正确的对冲策略。同时与第二层前沿模型保持可选性。
4. **团队能力是持久优势**：学会了将 AI 集成到可重复工作中的团队，将使能力商品化保持在他们的账本上。模型会商品化，但集成能力不会。

---

