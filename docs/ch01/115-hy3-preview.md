# 腾讯混元Hy3-preview发布

## Ch01.115 腾讯混元Hy3-preview发布

> 📊 Level ⭐ | 5.0KB | `entities/tencent-hunyuan-hy3-preview-open-source-agent.md`

> -> [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/tencent-hunyuan-hy3-preview-open-source-agent.md)

## 摘要
腾讯混元 Hy3-preview 发布并开源，这是一个快慢思考融合的混合专家模型（MoE），总参数 295B，激活参数 21B，最大支持 256K 上下文长度，在复杂推理、指令遵循、上下文学习、代码、智能体等能力上实现大幅提升。

## 关键要点
- 混元 MoE 架构：总参数 295B，激活 21B，支持 256K 上下文
- 强化学习驱动：2026 年 2 月完成预训练和 RL 基础设施重建
- Agent 能力全面提升：SWE-Bench Verified、Terminal-Bench 2.0、ClawEval 等基准表现竞争力
- 推理效率提升 40%，成本大幅下降
- 已接入腾讯生态：元宝、ima、CodeBuddy、WorkBuddy、QQ、腾讯文档等

## 相关实体
- [Cline releases open-source agent runtime SDK](../ch03/045-agent.html)
- [Cline releases open-source agent runtime SDK](../ch04/455-cline-releases-open-source-agent-runtime-sdk.html)

- [Claude Code 接入自建开源模型：企业私有化与降本实践 | 亚马逊AWS官方博客](../ch03/075-claude-code.html)

## 深度分析
### 架构选择：快慢融合的 MoE 路线
Hy3 preview 采用混合专家（MoE）架构，总参数 295B、激活 21B，这一选择体现了腾讯对"能力体系化"原则的贯彻。MoE 架构在保持高参数总量的同时通过稀疏激活控制推理成本，使 256K 上下文的支持在工程上可行。快慢思考融合意味着模型同时处理需要快速响应的简单查询和需要深度推理的复杂任务，避免了单一模型切换思维模式的延迟开销。

### 评测策略：从公开榜单到真实战斗力
腾讯明确提出"主动跳出易被刷榜的公开榜单"，转向自建题目、最新考试、人工评测、产品众测等多元评估体系。CL-bench 和 CL-bench-Life 的提出尤其值得关注——这是针对腾讯自有业务场景设计的上下文学习基准，试图衡量模型在真实生产环境中的能力。这与行业中某些仅优化公开 benchmark 的做法形成对比，反映了腾讯对实用性的追求。

### Agent 能力的重点突破
代码和智能体被明确为"提升最为显著的方向"。SWE-Bench Verified、Terminal-Bench 2.0、WideSearch 等主流基准的表现，以及 ClawEval、WildClawBench 等智能体专项评测的结果，构成了多维度的能力验证。内部评测集 Hy-Backend、Hy-Vibe Bench、Hy-SWE Max 的存在表明腾讯在公开榜单之外建立了更贴近真实开发场景的评估体系。这种"公开+内部"的双层评测结构值得其他研究机构参考。

### 开源策略与生态布局
Hy3 preview 支持接入 OpenClaw、OpenCode、KiloCode 等流行开源智能体产品，并上架腾讯云 TokenHub。这一策略既通过开源社区获得真实反馈（姚顺雨明确表示"希望通过这次开源和发布，获得来自开源社区和用户的真实反馈"），又通过云服务变现。TokenHub 的定价（输入 1.2 元/百万tokens，输出 4 元/百万tokens）和定制套餐（个人版 28 元/月）显示出对 Agent 开发场景的商业化意图。

## 实践启示
### 对模型研发团队
MoE 架构 + 强化学习重建的组合路径表明，即使拥有充足计算资源的团队，也需要优先确保预训练和 RL 基础设施的现代化。腾讯在 2026 年 2 月完成重建后，仅用约两个月就推出了 Hy3 preview，这种迭代速度依赖于成熟的 infrastructure。

### 对 Agent 应用开发者
Hy3 preview 在 495 步复杂工作流中的稳定表现，以及 99.99%+ 的成功率，为构建长时间跨度的多步骤 Agent 提供了可选基座。TokenHub 的低价策略（输入 1.2 元/百万tokens）降低了 Agent 开发的试错成本，28 元/月的个人套餐尤其适合独立开发者。

### 对企业评估标准
腾讯的"评测真实性"原则值得借鉴：不应仅依赖公开榜单评估模型，需结合自有业务场景设计评估集。当 Agent 场景涉及代码执行、工具调用、多轮对话等复合能力时，单一基准的得分往往不足以预测真实表现。

## 相关链接
- [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/tencent-hunyuan-hy3-preview-open-source-agent.md)
- 
-

---

