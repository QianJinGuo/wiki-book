# Here Comes (Forward Deployed) Everybody

## Ch11.149 Here Comes (Forward Deployed) Everybody

> 📊 Level ⭐⭐ | 7.6KB | `entities/here-comes-forward-deployed-everybody.md`

## 核心要点
- Forward Deployed Engineer (FDE) 概念成为 Salesforce Headless 360 发布的核心理念
- 企业软件正在从套装走向模块化解耦
- 头部客户对定制化需求推动"贴身工程团队"模式兴起

## 文章背景
2026年4月，Salesforce 发布 Headless 360，Marc Benioff 提出"No browser required. The API is the UI."——这是企业软件领域的一个转折信号：最大的企业软件供应商将产品定制的责任外化给了客户自身。本文作者认为这代表了一种方向性转变，未来每个企业软件厂商都会效仿这一模式。

## 深度分析
### 1. 从"套装软件"到"原材料供应"的范式转移
Salesforce 作为全球最大的企业软件厂商，主动宣告其用户最依赖的产品部分不再是 Salesforce 的职责，而是客户的责任——这是一种前所未有的供应商姿态转变。作者指出，这意味着 Salesforce 不再交付成品软件，而是交付"软件的原材料"，让客户自己组装出符合业务需求的解决方案。
这一转变的本质是将实施成本从供应商侧转移到客户侧，但这并非全新事物。Salesforce 过去依赖一个三层的实施生态：供应商付费的解决方案工程师（顶层）、客户付费的集成商和代理商（中层），以及客户内部的 Salesforce 管理员（底层）。客户一直需要为大部分实施工作付费。

### 2. 历史先例：Piggly Wiggly 与自助服务革命
作者引用了1917年 Clarence Saunders 在孟菲斯创办 Piggly Wiggly 的案例来说明这种"劳动外包"的模式：1920年代，杂货店从店员代取模式转变为开放货架模式，顾客自行挑选商品。这个过程经历了多次能力解锁——开放货架布局、UPC 条码、廉价触摸屏——每一波都伴随着"便利性"作为营销话语被推销。
企业软件领域的"自助化"进程类似：供应商将配置工作外化给客户，客户需要雇佣或培养能够驾驭这些"原材料"的人才。区别在于，杂货店的选择是自愿的，而企业软件的选择往往是被动的——企业无法选择不使用 Salesforce，但必须承担实施它的成本。

### 3. Clay Shirky 的预言与新一轮成本曲线
2008年，Clay Shirky 在《Here Comes Everybody》中指出，互联网将协调成本降至接近零，导致机构功能开始向临时团体外泄——Wikipedia 取代大英百科全书，Flash Mob 兴起，无需组织的协调成为可能。
作者认为，18年后，我们正在用不同的成本曲线做同样的事：这一次是"构建"的故事，而非"协调"的故事。构建复杂软件曾经需要软件公司——工程师、构建流程、UI 设计阶段、JIRA 票据管理。Agentic 编程工具、MCP、Headless 平台正在将构建成本大幅压缩：财务负责人可以在星期二下午启动一个对账代理，招聘人员可以边喝咖啡边搭建候选人研究工作流。

### 4. "Everybody"的分化：聚合与原子化的对立
Shirky 的《Here Comes Everybody》描述的是聚合：数百万人协同构建 Wikipedia。而2026版本的"Everybody"则是原子化的——数百万人在各自的角落里各自构建各自的东西：数百万个对账代理、数百万个候选人研究工作流，彼此不可共享、不可组合。社会学方向完全相反。
作者总结道："旧的 everybody 汇聚，新的 everybody 分散。协调曾经是我们因为软件稀缺而支付的税，现在我们不再需要支付了。这就是软件终于变得丰裕的样子。"

### 5. Pit Crew 角色：新的职业类别
作者借用 Near Zero 的"Pit Crew"概念来描述这种新型角色：营销人员是司机，AI 是他们驾驶的汽车——强大、快速、挑剔，如果调校不当会出人意料地脱轨。Pit Crew 负责调校这辆车。
Pit Crew 不需要写品牌调性指南，营销人员不需要配置 MCP 服务器或拼接六个 API——两者缺一都赢不了比赛。营销人员提供"构建什么"和"为什么"，Pit Crew 提供"如何构建"和"如何保持高速运行"。
每个职能领域都将需要这种角色（或成为这种角色）：营销、财务、法务、运营、客服、招聘，甚至工程。

### 6. 两种商业模式：替代 vs 乘法
作者指出了一个关键分歧：

- **替代模式（Substitution）**：公司视 Pit Crew 为以更低成本完成相同工作的方式——一个 Pit Crew 成员完成过去二十个营销人员的工作，因此裁员并提升 EBITDA。
- **乘法模式（Multiplication）**：公司视 Pit Crew 为完成更多工作的方式——营销团队和 Pit Crew 的规模都扩大，产出扩展，需求也随之扩展。
作者明确认为替代模式是错误的：高效能的团队会获得更多预算、招聘更多人手，产出扩张，需求也随之扩张。历史上每一次软件工程成本下降，需求都会飙升——这次没有理由不同。

## 实践启示
### 给企业的建议
1. **重新定义 IT 与业务的边界**：Headless 架构趋势下，企业需要重新评估谁负责"构建"和谁负责"使用"的分工。传统的 IT 职能将向业务部门渗透，每个业务线都需要能够理解 AI 能力的"Pit Crew"型人才。
2. **优先构建领域专业知识 + 技术能力的复合团队**：单一依赖技术团队或业务团队都无法在新范式下发挥最大价值。Pit Crew 的核心价值在于既懂业务语境，又能驾驭 AI 能力。
3. **避免"替代思维"，拥抱"乘法思维"**：将 AI 投资视为扩展业务能力的手段，而非裁员的工具。早期采用"乘法思维"的企业将在18个月后获得竞争优势。

### 给个人的建议
1. **成为领域专家 + 技术桥梁**：纯技术能力或纯业务能力都不足以在新范式下产生最大杠杆。持续投资于理解 AI 能力边界的同时深化领域专业知识。
2. **Pit Crew 是真实可持续的职业路径**：作者认为这是一个有真正杠杆作用的职业方向，早期精通者将获得丰厚回报。
3. **模型是通用的，业务语境是私有的**：理解 AI 在特定工作流、数据集和人员接触点上的具体应用，才是价值真正产生的地方。通用"AI 团队"的模式将让位于每个业务功能的专属 AI 能力建设。
## 相关实体
- from-system-of-record-to-system-of-intelligence.md-intelligence
- [Enterprise Software Moats Agent Era](../ch03/045-agent.md)
- [Salesforce Headless Software Losing Head A16Z](https://github.com/QianJinGuo/wiki/blob/main/entities/salesforce-headless-software-losing-head-a16z.md)
- [Ibm Forward Deployed Units Ai Deployment](../ch04/070-ai.md)
- from-system-of-record-to-system-of-intelligence.md-intelligence-1

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/here-comes-forward-deployed-everybody.md)

---

