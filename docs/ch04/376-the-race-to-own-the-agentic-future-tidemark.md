# The Race to Own the Agentic Future | Tidemark

## Ch04.376 The Race to Own the Agentic Future | Tidemark

> 📊 Level ⭐⭐ | 6.8KB | `entities/the-race-to-own-the-agentic-future-tidemark.md`

## 深度分析
Tidemark 这篇文章的核心命题是：**AI 不会杀死垂直 SaaS，恰恰相反，垂直 SaaS 的 Control Point 有机会成为 Agentic Future 的 System of Action**。这个结论挑战了 2024-2025 年公开市场的主流叙事——后者普遍认为 AI 将对垂直 SaaS 造成毁灭性打击，并将相关股票估值压低 40%。

### 1. 反驳「AI 杀 SaaS」叙事的六点框架
文章提出的六点框架值得拆解：
**内容型模型和单玩家工具处境最危险。** 当 LLM 可以直接生成用户需要的内容时，以内容消费为核心的产品（如某些文档工具、创意工具）面临直接替代。但这不是 SaaS 的全部——大量垂直 SaaS 的价值并非内容生成，而是**工作流编排和数据沉淀**，后者 LLM 无法凭空替代。
**Control Point 的「护城河三要素」：数据、 workflow 和 account gravity。** 垂直 SaaS 在特定领域积累了客户的工作流数据和行为数据，这是新进入者难以复制的。Tidemark 认为，Control Point 可以基于这三要素向客户销售增量产品（包括 AI 和 Agent），这是其相对 Native AI 初创公司的结构性优势。
**「先发优势不是决定性结果，是一场竞赛」** — 原文表述是 "It's a head start, not a predetermined outcome." 这个区分很关键：Control Point 拥有进入 Agent 市场的优先权，但必须主动出击，否则会被基础模型厂商从上下两侧夹击。

### 2. 威胁来源：从「水平竞争」到「垂直夹击」
文章的威胁分析尤其值得注意。Tidemark 指出，当前垂直 SaaS 和 Native AI 公司的最大威胁**不是彼此，而是来自下方**——基础模型厂商（$1 万亿市值）正在向上下两端扩张：

- **从下往上**：基础设施和 Harness 层（如 Claude Cowork 成为知识工作者的统一 UI）
- **从上往下**：用私募资金在资产负债表上构建 FDE（Forward Deployed Engineers），绕过传统 SaaS 直接服务客户
这与 ServiceNow 的战略高度吻合——ServiceNow 明确将自己的平台定位为 **Action Fabric**，并让 Anthropic 的 Claude Cowork 直接对接其受治理的 System of Action。 这种「基础模型 + SaaS 平台」的深度耦合正在成为行业标准架构。

### 3. 四步行动框架的内在逻辑
文章给出的四步行动框架（Win Strategic Product Surfaces → Replumb for Velocity → Charge for Agents → Build Moats）并非随意排序，其内在逻辑是：
| 步骤 | 核心命题 | 关键判断 |
|------|----------|----------|
| Step 1 | 赢得战略产品表面 | 防止被 Native AI 绕过，成为新的 System of Action |
| Step 2 | 为速度重建组织 | AI 速度差距将决定谁能留在市场 |
| Step 3 | 为 Agent 收费 | 独立定价=价值验证=给投资人的信号 |
| Step 4 | 构建护城河 | 护城河仍然重要，但要针对 AI 时代重新定义 |
Step 2 的论述尤为深刻：**全 Agent 开发已经可行**，公司间差距将越来越多地体现在「能否以 AI 速度交付」而非「功能列表长短」。这直接呼应了 Martin Fowler 关于 Harness Engineering 的核心洞察——**不确定性进入研发链路后，Harness 才真正开始承重**。

### 4. Moats 重新定义：Sean Doherty 的「micro harness」框架
GovDash CEO Sean Doherty 的引言值得单独拆解："Customers will be consuming tokens; I want them to consume on GovDash. We need to ensure that customers get the highest output per token on GovDash... every product surface must be the best micro harness to do that job."
这揭示了一个关键的护城河逻辑转变：**在 Agent 时代，护城河不再是功能多少，而是每个产品表面作为特定任务 micro harness 的效率**。用户关心的不是「你的软件有多少功能」，而是「用你的软件完成任务，每 token 产出的质量」。这个框架与 [Harness Engineering](ch05/061-harness-engineering.md) 实体高度互补。

## 实践启示
1. **立即行动而非等待清晰**：文章明确说"如果你不感到害怕，你已经落后了"。对于 Vertical SaaS 公司，这意味着现在就必须把 Agent 集成到产品路线图的核心位置，而不是放在实验层。
2. **用独立定价验证 Agent 价值**：将 Agent 作为独立产品线定价，而非打包进订阅。这不仅是对客户的信号，也是对内部团队和投资人的诚实度量。
3. **重新思考 SDLC**：用全 Agent 开发方式重建软件交付流程。Tidemark 的判断是「 dispersion 将越来越多地存在于能用 AI 速度交付和不能的公司之间」，这对工程组织是一个结构性要求。
4. **识别你的 Micro Harness**：对照 Doherty 的框架，逐一审视自己产品的每个表面——它们作为特定任务 harness 的效率如何？是否有明显短板？
5. **警惕 FDE 绕过**：私募资金支持的 FDE 团队正在直接服务你的客户，这是被忽视的竞争威胁来源。

## 关联阅读
- [ServiceNow Action Fabric](ch04/502-agent.md) — System of Action 概念的行业标杆实现，Claude Cowork 直接对接
-  — Micro harness 框架的完整工程方法论，与 Doherty 引言直接相关
- [Enterprise Software Moats in Agent Era](ch04/502-agent.md) — 同一时期 a16z 对企业软件护城河在 Agent 时代变化的分析
- [ServiceNow: The UI is Dead, Long Live the Agent](ch04/502-agent.md) — ServiceNow Agent 战略的深度解析
## 相关实体
- Investing In Stitch.Md

---

