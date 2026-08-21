# Exaforce | Agentic SOC Platform and MDR

## Ch01.116 Exaforce | Agentic SOC Platform and MDR

> 📊 Level ⭐ | 6.4KB | `entities/exaforceagenticsocplatformandmdr.md`

→ [原文存档](https://github.com/QianJinGuo/wiki-book/tree/main/docs/raw/articles/exaforceagenticsocplatformandmdr.md)

## 摘要
Exaforce 是主打 Agentic SOC 的 AI 安全运营平台，近期宣布完成 $125M Series B，提供 **Platform 自运营** 与 **MDR 托管运营** 两种交付模式，核心由 Detect / Triage / Investigate / Respond 四个 Exabot 智能体构成。其技术底座为统一实时数据层 + 实时知识图谱 + 多模型 AI，宣称可将检测、调查与响应从"小时/天"压缩到"分钟"，并大幅降低误报。

## 核心要点
- **融资与定位**：$125M Series B，定位"AI 原生"端到端 SOC 平台，回应"AI 给了攻击者机器级规模"的不对称。
- **双运营模式**：Platform（内部团队 + Exabot 自运营）与 MDR（Exaforce 分析师 + Exabot 7×24 代运营）共享同一架构、同一批 Exabot、同样结果，仅运营责任归属不同。
- **四大 Exabot**：Detect / Triage / Investigate / Respond 对应检测工程师、分流分析师、威胁猎人、应急响应者四类 SOC 角色，基于统一实时环境视图推理。
- **数据层先行**：从数据而非告警出发，接入 100+ 数据源（含 GitHub、Google Workspace 等常被忽略的源），实时存储原始数据并归一化富化。
- **多模型 AI**：将数据关系、异常检测、专家推理拆为专用模型，避免单一 LLM 决策不一致，追求确定性、可执行的安全结论。
- **量化结果**：Accton MTTI 3 小时→10 分钟（-94%）、Invisible 月度回收 6+ FTE、Guardant Health 误报 -90% 且告警到响应 <30 分钟、>$600K 年均节省。
- **vs 传统 MSSP**：ForcePoint 从"需大量人工监督的 MSSP"迁至"全自动 AI 驱动调查与升级"的 MDR，响应时间降至分钟级。

## 深度分析
### 双模式运营：同一平台、两种责任归属
Exaforce 的设计核心是不让客户在"能力"与"控制权"之间二选一：Platform 模式下内部团队保留全部决策可见性，Exabot 只升级需要人类判断的事项；MDR 模式下客户不承担招人、SIEM 运维与爬坡成本，却仍保有平台完全访问权（full transparency）。ForcePoint CISO 的证词最能说明迁移动机：传统 MSSP 需大量人工监督，而 MDR 的全自动 AI 调查与升级把响应从小时/天级压到分钟级并改善质量。这是用同一技术栈同时服务"要掌控感的成熟团队"与"要省心力的成长公司"。

### Exabot 流水线与多模型 AI：把 SOC 角色产品化
Exaforce 把四类 SOC 岗位直接映射为四个 Exabot，架构起点是数据而非告警：专用数据层跨 identity、cloud、endpoint、code、SaaS 摄取日志与配置，实时保存原始数据、归一化并富化，再喂给面向安全运营定制的多模型 AI。产品叙事强调单一 LLM 决策不一致的问题，因此拆分数据关系、异常检测与专家推理为专用模型，输出"deterministic、可执行"的结果——这是 NTT Data 称其"多模型 AI 方法业内独特"的依据。

### 跨源关联：超越传统 SIEM/MSSP 的检测能力
Fuze CTO 指出核心痛点：GuardDuty 告警淹没团队，Exaforce 将其梳理成"人类可读告警 + 可执行缓解建议"，并能跨数据源关联动作、生成可视化，揭示团队此前毫无察觉的模式。另一案例中，平台自动把"东欧异常 service account key 使用"与提权行为关联——这是需数年训练分析师才能建立的关联。Accton 与 CFS 则补充了 auto-triage 第三方告警、rule-free detection 的价值：自动分流节省数十小时人工。整体上，Exaforce 把 SIEM 的"收集"升级为"关联 + 推理"，调查时间从数小时压至 10 分钟级。

### 证据强度与阅读视角
原文本质是官网营销材料：客户证词覆盖创业公司（Invisible、LottieFiles、Fuze）到企业（ForcePoint、Accton、Guardant Health）及生物科技/医疗等受监管行业，但 6+ FTE 回收、95% MTTI 降幅、<$30 分钟告警到响应、>$600K 节省等指标均为客户自报，缺乏第三方基准。值得留意的信号是 onboarding 效率：LottieFiles 声称 <30 天上线即出首次响应，某 F500 客户声称 24 小时内即发现第三方供应商凭据滥用——此类"早期见效"指标对选型有参考价值，但应经 PoC 自行验证。

## 实践启示
1. **把透明度写进 MDR 合同**：Exaforce 的卖点是客户保有平台完全访问权；评估托管服务时应明确要求平台、数据与自动化决策日志的访问权，警惕黑箱式"交钥匙"服务。
2. **按团队现状选模式**：已有安全工程师但告警过载 → 选 Platform 自运营；从零建 SOC 或人力不足 → 选 MDR，转嫁招人、SIEM 运维与爬坡成本。
3. **把跨源关联列为评估重点**：Fuze 案例表明，能跨 GuardDuty、身份、云服务关联动作并可视化的平台才能发现单一源告警无法揭示的攻击链；用真实多源事件测试，而非只看集成数量。
4. **以 MTTI / 告警到响应时间为核心 KPI**：把 3h→10min（-94%）、<30 分钟等宣称换算为威胁驻留时间缩短，写入 SLA 对比基线。
5. **警惕自报指标，要求 PoC**：原文数据全部来自客户证词，无第三方验证；对"6+ FTE 回收""95% 误报降幅"应要求方法论与可复现验证。
6. **关注 onboarding 到首次响应速度**：<30 天上线即出首次响应、24 小时内产出可行动洞察，是衡量数据接入与模型预热效率的实用信号。

## 相关实体
> [主题导航](https://github.com/QianJinGuo/wiki/blob/main/moc/cybersecurity-privacy.md)

- [Exaforce | Agentic SOC Platform and MDR](../ch04/025-exaforce-agentic-soc-platform-and-mdr.html)
- [Versa takes aim at fragmented enterprise security with CSPM, orchestration update, and AI agent controls](ch01/1286-rag.html)
- [We Tested DeepSeek V4 Pro and Flash Against Claude Opus 4.7](ch01/587-deepseek.html)
- [AI 安全全景](https://github.com/QianJinGuo/wiki/blob/main/concepts/ai-security-landscape.md)

---

