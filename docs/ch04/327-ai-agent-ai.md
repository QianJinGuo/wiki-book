# AI 浏览器三条技术路线：侧栏 / Agent / AI 原生

## Ch04.327 AI 浏览器三条技术路线：侧栏 / Agent / AI 原生

> 📊 Level ⭐⭐ | 8.4KB | `entities/ai-native-browser-three-routes-tabbit-meituan-2026.md`

# AI 浏览器三条技术路线：侧栏 / Agent / AI 原生

> **Background**：本文基于机器之心 PRO 会员通讯专题整理。2026 年 6 月美团 GN06 团队发布 AI 原生浏览器 Tabbit 1.0，以此为契机梳理当前 AI 浏览器的三条技术路线与架构特征。

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/当-ai-浏览器走向原生ai-侧栏会被吞并还是与之共存.md)

当前 AI 浏览器行业呈现三条并存的技术路线，它们在架构融合度、模型绑定策略和自动化执行深度三个维度上呈现不同取向。

## 核心要点

- **路线一（传统内核 + AI 侧栏）**：以 Edge+Copilot 和 Brave+Leo 为代表。AI 以侧边栏插件形式接入，承担问答、总结、检索任务，不改变浏览器内核的页面加载与权限管理机制。
- **路线二（研究/Agent 向浏览器）**：以 Perplexity Comet 和 ChatGPT Atlas 为代表。仍基于 Chromium 内核，但将 AI 从侧栏移入核心模块，具备视觉多模态理解与全局上下文记忆能力，支持跨标签页关联分析。
- **路线三（AI 原生浏览器）**：以 Tabbit、Dia、Fellou 为代表。以 "Browser + Agent + Workflow"架构将 Agent 调度能力写入浏览器运行时，从底层构建标签页、输入框和智能体。
- **Tabbit 1.0 里程碑**：美团 GN06 团队（原光年之外）开发的 AI 原生浏览器，公测 100 天内 Agent 任务成功率从 53.1% 提升至 91.8%，单用户月均 Token 消耗达 853 万。
- **多模型调度**：Tabbit 内置 LongCat、DeepSeek、GLM、Kimi 等多款大模型，支持根据任务类型动态切换而非绑定单一厂商。

## 深度分析

### 三条技术路线的演进逻辑

AI 浏览器的三条路线实际上是"AI 与浏览器集成深度"的渐进阶梯，而非平行的技术选择：

| 维度 | 路线一：侧栏插件 | 路线二：Agent 嵌入 | 路线三：AI 原生 |
|------|-----------------|-------------------|----------------|
| **架构深度** | 外挂式（add-on） | 模块化整合 | 内核重构 |
| **AI 能力** | 问答/总结 | 视觉理解+跨页记忆 | Agent + Workflow 编排 |
| **执行范围** | 当前页面 | 跨标签页 | 跨页面工作流 |
| **模型策略** | 单一绑定 | 单一绑定 | 多模型可切换 |
| **代表产品** | Edge+Copilot, Brave+Leo | Perplexity Comet, ChatGPT Atlas | Tabbit, Dia, Fellou |

路线一到路线二的演进核心是 **AI 角色的转变**：从"辅助信息处理"变为"协助完成网页中的任务"。路线二到路线三的跨越则是**架构的根本性重构**——不再将 Chromium 作为不可变的基础设施，而是从 Shell 层开始用 Agent 调度取代传统的标签页管理逻辑。

Tabbit 的四阶迭代过程直观展示了这一演进：从传统网址输入 → 全网搜索 → 大模型对话 → 自主 Agent，每一步都是架构集成深度的跃升。

### AI 原生浏览器的架构突破

Tabbit 的 "Browser + Agent + Workflow" 架构标志着浏览器从"信息展示工具"向"任务执行平台"的转变。其关键架构特性包括：

- **Agent 运行时写入浏览器内核**：传统浏览器中，标签页是网页的容器；在 Tabbit 架构中，标签页被 Agent 调度系统接管，AI 可以跨页面执行信息采集、表单填写和文件生成等操作。
- **多模型调度层**：不绑定单一模型体系，而是将模型能力以可切换、可调度的形式存在，根据任务类型、响应效果或成本条件动态调用不同的模型。这与 [Agent Harness 招聘场景](../ch05/039-agent-harness.html) 中提到的"多模型路由"架构一致。
- **自主 Agent 能力**：Tabbit 的 Agent 可以自主跨网页执行复杂任务（信息采集、表单填写、文件生成），其成功率在公测期内从 53.1% 提升到 91.8%，展示了 AI 原生浏览器的自主学习能力。

### 技术分化背后的商业逻辑

三条路线并存反映了不同的商业策略：

- **传统浏览器厂商（Edge、Brave）**倾向于侧栏路线，因为这是风险最低的渐进式创新，不会动摇核心浏览体验，但创新能力也被现有架构所限制。
- **AI 原生公司（Perplexity、OpenAI）**走 Agent 嵌入路线，他们理解 AI 的能力边界但缺乏底层浏览器架构改造的工程积累。
- **新兴创业公司（Tabbit、Dia）**选择 AI 原生路线，因为没有历史包袱，可以从零构建 AI-first 的浏览器架构。Tabbit 背靠美团 GN06 团队（原光年之外），具备充足的工程资源和 AI 人才储备。

值得关注的是，三条路线在未来可能趋同：传统浏览器厂商会逐步将 AI 从侧栏移入内核，AI 公司会加深对浏览器底层的控制。但短期内，路线三（AI 原生）的创新速度会显著快于前两者，因为其架构不需要向后兼容。

### 对 Agent 生态的影响

AI 原生浏览器是 [Harness Engineering](https://github.com/QianJinGuo/wiki/blob/main/concepts/harness-engineering-framework.md) 理念在浏览器场景的具象化——浏览器本身变成了 Agent 的运行时环境（Runtime Environment）。这意味着：

1. **浏览器从"通过 API 访问 Web"变为"Agent 直接操作 Web"**：Agent 不再需要通过 Puppeteer/Playwright 等自动化工具间接操作网页，浏览器原生提供 Agent 操作接口。
2. **任务执行从"告诉用户如何做"到"帮用户做完"**：AI 侧栏只能告诉用户操作步骤，AI 原生浏览器可以直接执行跨站点的复杂工作流。
3. **浏览器成为 Agent 的数据采集和交互界面**：Agent 的感知范围从 API 返回的结构化数据扩展到浏览器的完整视觉上下文。

## 实践启示

1. **选择 AI 浏览器时应关注架构路线而非功能列表**：短期看，三条路线都能提供 AI 问答功能；长期看，架构深度决定了 AI 的能力上限。如果 Agent 自动化执行是核心需求，应选择路线二或三而非路线一的侧栏方案。

2. **Agent 任务成功率是 AI 浏览器最核心的 KPI**：Tabbit 从 53.1% 到 91.8% 的迭代曲线提示，AI 原生浏览器的价值不是一蹴而就的——需要持续的数据反馈和模型调优。在评估 AI 浏览器时，应关注其任务成功率的提升速度和当前水平。

3. **多模型调度比单一模型绑定更有战略价值**：AI 领域模型迭代极快，绑定单一模型可能导致产品能力被锁死在某个模型版本。选择支持多模型切换的 AI 浏览器，在未来模型生态变化时更具适应性。

4. **AI 浏览器改变的不只是浏览方式，还有 Agent 的工作方式**：当浏览器原生支持 Agent 操作，很多现有的 Web 自动化工具（Selenium、Playwright）和 RPA 方案可能被重新定义。关注这一趋势对于 Agent 开发者和企业自动化决策者至关重要。

## 相关实体

- [Agent Harness 招聘场景](../ch05/039-agent-harness.html)
- [Agent Harness 生产化](../ch05/039-agent-harness.html)
- [Perplexity 自改进记忆](../ch05/085-ai.html)
- [AI Native 企业转型](../ch05/019-ai-native.html)
- [Harness Engineering 框架](https://github.com/QianJinGuo/wiki/blob/main/concepts/harness-engineering-framework.md)
- [Agent 可观测性](https://github.com/QianJinGuo/wiki/blob/main/concepts/agent-observability.md)

---

