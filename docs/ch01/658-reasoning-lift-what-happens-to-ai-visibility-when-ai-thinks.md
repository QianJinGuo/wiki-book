# Reasoning lift: What happens to AI visibility when AI thinks harder

## Ch01.658 Reasoning lift: What happens to AI visibility when AI thinks harder

> 📊 Level ⭐⭐ | 7.0KB | `entities/reasoning-lift.md`

## 核心要点
- AI 电台实验：四个 AI 运行电台广播
- 实验过程与结果分析
- Reasoning 模式大幅提升 AI 可见性：引用率从 50% 升至 68%，fan-out 查询增加 4.6 倍
- 不同 reasoning 模式下引用的域名重叠仅 25.6%，几乎完全不同
- TOFU 内容在 reasoning 模式下具有新的战略价值：品牌可持续从 Problem 阶段延续到 Selection 阶段
## 相关实体
- [Eclecticlightco 2026 05 29 What Happens In The Log When An App Cra](ch01/950-20.html)
- [Npm Supply Chain Compromise Postmortem](../ch05/081-ai.html)
- [Cloudflare Glasswing Mythos Security](../ch12/030-mythos.html)
- [When Growth Slows Is It Sales Fault Or The Products Fault The Answer Has Changed](https://github.com/QianJinGuo/wiki/blob/main/entities/when-growth-slows-is-it-sales-fault-or-the-products-fault-the-answer-has-changed.md)
- [Tmall Ai Coding Practice Team Knowledge Base](../ch05/093-ai-coding.html)

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/reasoning-lift.md)

## 深度分析
### 核心发现：reasoning 模式重塑 AI 信息获取机制
高 reasoning 与低 reasoning 模式下，AI 引用的网络内容几乎完全不同。测试中 173 个域名里，仅 25.6%（约 44 个）与低 reasoning 重叠，99 个域名只在高 reasoning 中出现。这意味着品牌的 AI 可见性不能依赖单一策略，必须针对两种模式分别优化。
reasoning 模式带来的不只是更多的搜索，而是更深层的处理模式。当模型开启高 reasoning 时，它将早期漏斗问题（Problem、Exploration）视为研究任务，而非从记忆库直接提取答案。这一机制转变导致：

- **Problem 阶段差距最大**：高 reasoning 引用率提升 +35pp，低 reasoning 仅 +10pp
- **Comparison 阶段 fan-out 查询峰值**：高 reasoning 产生 24 个子查询，低 reasoning 仅 5.5 个
- **Selection 阶段查询方差最大**：0 到 40 个 fan-out 查询，取决于 prompt 的开放程度

### 品牌持久性的机制差异
这是文章最重要的发现之一。在 20 条 buyer journeys 中：
| 模式 | 品牌从 Problem 延续到 Selection |
|------|------|
| Minimal reasoning | 0 条 journey |
| High reasoning | 4 条 journey（全部在 Finance 领域） |
高 reasoning 在同一 response 内也更强烈地锚定单个信源：100 个高 reasoning 回答中，有 51 个在同一次回答中多次引用同一域名，低 reasoning 组这一数字为 26。模型一旦认定某个信源，就会反复引用。
TOFU 内容价值的重新发现：当品牌在 Problem 阶段被引用，高 reasoning 模式下 tend to carry through to Selection。这改变了 TOFU 内容的战略定位——它不仅仅是品牌认知的前置环节，更是最终决策的前置指标。

### 为什么 Finance 领域表现最突出
全部 4 条品牌持久化 journey 都在 Finance 领域。这并非巧合。Finance 品类的信源结构（监管页面、官方品牌网站）具备高权威性和可验证性，与 reasoning 模式对权威信源的偏好高度吻合。该领域总体 lift 达到 +28pp，印证了这一逻辑。

### 两种模式的信息架构差异
高 reasoning 模式下的信息架构呈现"漏斗型"特征：

- 早期（Problem/Exploration）引用率提升幅度大，模型将问题视为研究任务
- 中期（Comparison）fan-out 查询和引用数达到峰值，模型展开多维度比较
- 后期（Selection）引用数收窄，但查询方差最大——开放性 prompt 触发更多研究，结构性 prompt 几乎不触发查询
→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/reasoning-lift.md)

## 实践启示
### 1. 测量必须按 reasoning 模式分割
不要用聚合数据追踪 prompt 表现。高 reasoning 和 minimal reasoning 是两个完全不同的系统：引用的域名不同、信源类型不同、各阶段分布不同。分开追踪才能发现真实的品牌位置。
具体操作：在 prompt tracking pipeline 中为每个 prompt 跑两次（minimal + high），分别记录citation rate、avg citations、fan-out queries。

### 2. TOFU 内容策略需要重新评估
如果目标用户使用高 reasoning 模式，Problem 阶段和 Exploration 阶段的内容处于活跃竞争中。这与以往"TOFU 只做品牌认知、BOFU 才影响决策"的假设相悖。在 reasoning 模式下，TOFU 内容是通往 Selection 的前导指标。
实操建议：为 buyer journey 的每个阶段创建独立的内容单元，确保 Problem 阶段的品牌信息能在 Comparison 和 Selection 阶段被模型引用和延续。

### 3. 优化信源的可检索性，而非排名
在高 reasoning 模式下，模型产生大量 fan-out 子查询。以 B2B SaaS CRM 对比为例，模型分别查询各供应商的 API 限速、SOC 2 合规性、SAML/SSO 支持、webhook 架构等信息。这意味着"赢得比较"的品牌不是那些在父 prompt 下排名靠前的品牌，而是那些在每个子查询维度上信息清晰、结构化的品牌。
实操建议：审查产品的技术文档、集成文档、合规文档，确保每个子维度都有独立、可检索的页面，而不是汇总在一个页面里。

### 4. Selection 阶段的 prompt 设计影响研究深度
Selection 阶段的查询方差极大（0–40），核心驱动因素是 prompt 的"自由度"。结构化 prompt（如"我应该以 0% APR 通过经销商融资还是用银行？"）几乎不触发查询。开放性 prompt（如"3000 美元家庭健身购物清单"）触发 28–40 个查询。
实操建议：在 AI SEO / AEO 策略中考虑这一机制。开放性 prompt 对品牌的机会最大，但也需要品牌在相关维度上都有内容支撑。

### 5. Finance 品类的先行优势
Finance 是 reasoning 模式下 lift 最大的品类（+28pp），且是唯一出现品牌持久化的品类。该领域的高权威信源（监管页面、官方站点）与 reasoning 模式的偏好高度一致。
如果品牌在 Finance 领域，高 reasoning 模式下的内容策略优先级应提升；如果是其他品类，应研究该品类中高权威信源的结构特征，针对性优化文档结构。

### 6. 警惕旧策略的适用性风险
文章末尾的警告值得重视：如果内容策略基于去年的 AEO / GEO / AI SEO 经验构建，它很可能已经在 reasoning 模式下表现不佳。reasoning 模式和 minimal 模式的信息生态差异太大，不能假设一套策略两者兼顾。
→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/reasoning-lift.md)

---

