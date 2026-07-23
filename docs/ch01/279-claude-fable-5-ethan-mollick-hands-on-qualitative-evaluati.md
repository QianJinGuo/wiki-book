# Claude Fable 5 — Ethan Mollick hands-on qualitative evaluation

## Ch01.279 Claude Fable 5 — Ethan Mollick hands-on qualitative evaluation

> 📊 Level ⭐⭐ | 14.7KB | `entities/claude-fable-5-mollick-patron-vs-wizard.md`

# Claude Fable 5 — Ethan Mollick hands-on qualitative evaluation

> **来源**：[Ethan Mollick, One Useful Thing, 2026-06-09](https://www.oneusefulthing.org/p/what-it-feels-like-to-work-with-mythos) 原文存档：[原文存档](https://github.com/QianJinGuo/wiki-book/tree/main/docs/raw/articles/oneusefulthing-mythos-fable-mollick-feels-like.md)
>
> **Background**: 本文聚焦 Mollick 作为 AI 研究学者（Wharton 教授，One Useful Thing 作者）于 2026-06-09 在 Claude 5 Fable 公开发布前的 early access 评测。其独特贡献不在于安全分析（已有 Lambert/Interconnects 与 AWS 中文版覆盖），而在于 (1) 一手定性使用体验的具体案例（游戏、等时线地图、Concord 研究工具），(2) "patron vs wizard" 框架对人类-AI 关系转变的提炼，(3) Token 经济学的具体量化（Fable = 2× Opus 成本）。与现有 Fable 5 entity 互为补充。

## 三个独有贡献（不应合并到现有 entity）

1. **"Patron vs Wizard" 人类-AI 关系转变框架** — Mollick 把 2025 年自诩的 "wizard"（人施咒、AI 反应）重新定位为 "patron"（人描述需求、AI 完成、人评判结果）。这个从"过程导向"到"结果导向"的工作关系转变是其他 Fable 5 entity 未覆盖的维度。

2. **4 个具体长周期任务执行实例** — 不同于 Nathan Lambert 的安全分析视角或 AWS 官方发布稿：
   - **游戏三件套**（硬币翻转、贪吃蛇自意识版、深度探索）— 单 prompt + 1-2 次 "make it better" 反馈生成
   - **1881 风格等时线地图** — 4-6 小时多智能体协作，2,200+ 航班检索、TGV/Shinkansen 时刻表、跨国道路速度
   - **Concord 研究工具** — 9.5 小时自主执行，19 页设计文档，AI/人类判断校准软件（Calibration of Human/AI Judgment）
   - **学术级社会科学生成** — "我所见过 AI 生成的最精致的学术社论"

3. **Token 经济学具体量化** — Fable = 2× Opus 成本，"a tremendous number of tokens in a very short period of time"。但 Fable 巧妙委派给更便宜的 Claude Sonnet 处理子任务，可能降低真实价格。Fable 安全护栏触发即降级到 Claude 4.8 Opus（"happens way too often"）。

## 核心发现：Fable 表现细节

### 游戏三件套：单 prompt + 反馈的极致杠杆

每个游戏是**一个初始 prompt** + **1-2 次"make it better"反馈**。所有美术与 3D 对象用纯数学生成（Claude 无法生成图片）。这种"单 prompt → 完整可玩游戏"的杠杆比是前所未有的，尤其考虑到没有外部资产生成能力。

### 等时线地图：4-6 小时多智能体工作流

详细工作流：
- 启动多个**Claude Sonnet**子代理检索 2,200+ 航班、TGV 到 Shinkansen 时刻表、各国道路速度（来自学术论文）
- 主代理在子代理运行时开始**编码**
- 启动**对抗性 agent group**——一方研究、一方验证
- 结果包含 1881 风格地图 + 互动版本（含方法与来源）
- Pitcairn Island 船期、Grise Fjord 路径——连偏远地点都能算出实际旅行时间
- **多轮反馈**：第一版有估计值（Greenland），用户给反馈"actually get travel times to remote airports"，第二版用对抗性工作流补救

Mollick 关键观察：**"The details of the AI's decision making are not shown to me, and the process would be too long to even be worth following"**——这正是 black box 体验的具象化。

### Concord：9.5 小时 19 页设计文档自主执行

研究方法学问题：人类产生混乱答案（"how innovative is an idea?"），传统上用人类研究员判断 + 统计校准。AI 一直想做但 calibration 难 + 贵。Fable 接到 prompt 后：
- 先生成 19 页复杂设计文档
- 然后 9.5 小时自主执行
- 输出完整的 Concord 工具：接受多数据集、校准人类与 AI 响应、进行复杂数据分析

Mollick 自己说："a piece of software that researchers have needed for years but was never profitable to create"——长期存在但商业上不可行的研究工具，被 Fable 直接交付。

## Patron vs Wizard 框架

### Wizard 阶段（2025 年）

> "Last year I called this working with a wizard: you chant the spell and something happens."

施咒者（人类）→ 咒语（prompt）→ 反应（AI 输出）。人主导过程。

### Patron 阶段（2026 年 Fable）

> "With Fable the spell has gotten powerful enough that I am no longer sure I am the wizard. I am closer to a patron. I describe what I want, I pay for it, and I judge the result. The conjuring happens somewhere I cannot watch, in hundreds of small choices I never get a vote on. The work has shifted from process to outcome. I no longer steer; I commission."

**关键差异**：
- 不再"操控"过程，而"委托"任务
- 看不见 AI 内部决策（数百个小选择）
- 评判的角色依然保留，但操作的角色消失
- "A patron commissions a single artist. Fable is closer to a whole studio, where I am the client who signs off on the final work without ever setting foot on the floor."

### 未来方向判断

Mollick 给出两种可能：
1. **临时性**（更乐观）— 只是接口未跟上，未来会有更好的中间观察窗口
2. **结构性**（更可能）— 模型越强，人类能做的越少，black box 是能力的代价

> "I suspect that is more likely to be the real direction."

**Steering 仍然存在**——但不再是"doing"。"But steering is no longer the same as doing. I brief the model, it spins up its own agents to research and write and check one another's work, and what comes back is finished."

## 三个独有贡献（"过程到结果"工作关系）

1. **从"施咒"到"委托"的角色转移** — 不是失去控制（仍可 steering），而是失去"doing"。AI 启动自己的 agents 完成研究/写作/校验，人只 sign off。

2. **"Steering ≠ Doing" 的明确区分** — 之前 wizard 模型把 steering 和 doing 混在一起；patron 模型则把两者分开：briefing + signing off。

3. **"Client signs off without setting foot on the floor" 隐喻** — 类似艺术赞助人（patron）— 委托艺术创作但不下场亲自画。Fable 已成为 "whole studio"，人类只是 client。

## Token 经济学与护栏细节

| 维度 | 数值 | 备注 |
|------|------|------|
| Fable vs Opus 成本比 | 2× | 比 Opus 贵一倍 |
| Token 消耗速率 | "tremendous in very short period" | 等时线地图一轮反馈即大量 token |
| 真实成本估算 | 通过委派 Sonnet 子任务降低 | Mollick 称"may lower the real price considerably" |
| 安全护栏触发 | "faintest hint of security problem" | 立即降级到 Claude 4.8 Opus |
| 护栏触发频率 | "happens way too often" | 这是评测中的 friction point |
| 风格痕迹 | "Claudisms" 仍在 | 软件产出 + 进度报告都带 Claude 风格 |

## 与现有 Fable 5 entity 的差异化

| 维度 | 本 entity（Mollick） | [claude-fable-5-and-new-ai-safety-fables](entities/claude-fable-5-and-new-ai-safety-fables)（Lambert/Interconnects） | [anthropic-claude-fable-5-aws内置保护措施](entities/anthropic-claude-fable-5-on-aws内置保护措施的-mythos-级功能现已推出)（AWS 中文） |
|------|--------------------|--------------------------------------------|----------------------------------------------------|
| 作者身份 | Wharton 教授 / AI 应用研究者 | Nathan Lambert / Interconnects 研究员 | AWS 中国 / 中文工程视角 |
| 视角 | 定性 hands-on 体验 | 安全 + 训练 + 推理机制 | AWS 集成 + 内置保护 + 实际部署 |
| 重点 | 4 个具体长周期任务实例 | 模型能力 + 风险 + 开源 | AWS Bedrock 集成 + 多服务部署 |
| 关键贡献 | Patron vs Wizard 框架 | Fable 安全/治理视角 | 企业级 AWS 上线指南 |
| 评测时间 | 2026-06-09 early access | 2026-06-09 同步 | 2026-06-09 同步 |
| 独特价值 | "过程→结果"工作关系转变 | 行业风险评估 | 中文企业部署视角 |

**结论**：三 entity 共同构成 Fable 5 发布日的多视角图谱——Lambert 提供理论风险视角、AWS 提供工程落地视角、Mollick 提供日常使用视角。

## 深度分析

### 核心洞察：Patron vs Wizard 是人类-AI 关系范式的结构性转变

Mollick 提出的"Patron vs Wizard"框架揭示的不是接口层面的变化，而是人类-AI 工作关系的基础范式转移。Wizard 阶段（2025 年）本质上是"人在操控过程，AI 执行动作"——人类是施咒者，AI 是魔法效果。Patron 阶段（2026 年 Fable）则是"人在定义结果，AI 主导过程"——人类从 doing 层退出，只保留 steering 和 judging 层。这个转变与 [Claude Fable 5 And New Ai Safety Fables](ch01/877-claude-fable-5-and-new-ai-safety-fables.html) 中 Lambert 的安全分析形成互补：Lambert 关注 AI 能力增强后的风险边界，Mollick 关注人类角色的相应收缩。

### 技术要点：Black Box 是能力增长的必然代价

Mollick 对两种未来方向的判断（临时性 vs 结构性）指向了一个不舒服的真相：**模型越强，人类能参与的过程越少**。"The details of the AI's decision making are not shown to me, and the process would be too long to even be worth following"——这句话是 Fable 级别 agentic workflow 的具象化体验。[Anthropic Claude Fable 5 On Aws内置保护措施的 Mythos 级功能现已推出](ch01/1316-anthropic-claude.html) 的 AWS 内置保护措施在此背景下更具现实意义：当 AI 的决策过程对人类不可见时，安全护栏是唯一的事后保障。

### 技术要点：9.5 小时 19 页设计文档揭示"长周期任务"的重新定义

Concord 案例（9.5 小时，19 页设计文档，Calibration of Human/AI Judgment）突破了"AI 不擅长长周期任务"的传统认知。但关键在于 Mollick 的 prompting 策略：**先文档后执行**——先让 Fable 生成详细设计文档，再让 Fable 按文档执行。这意味着 Fable 不是在"摸索中执行"，而是在"已知框架内执行"。与 [Claude Fable 5 And New Ai Safety Fables](ch01/877-claude-fable-5-and-new-ai-safety-fables.html) 的 Lambert 视角对比：Lambert 关注 Fable 的安全护栏为什么会触发（"faintest hint of security problem"），Mollick 关注护栏触发频率带来的 friction（"happens way too often"）。

### 实践价值：多智能体委派是 Fable 成本控制的核心机制

Fable = 2× Opus 成本，但 Mollick 指出"may lower the real price considerably"——因为 Fable 会将子任务委派给更便宜的 Sonnet。这个委派机制意味着 Fable 的实际成本取决于任务结构：需要大量检索/验证的长周期任务，真实成本可能低于单次 Opus 调用。与 [Claude Fable 5 And New Ai Safety Fables](ch01/877-claude-fable-5-and-new-ai-safety-fables.html) 的 token 消耗量化结合看，Fable 的成本优化策略不是减少用量，而是**正确的任务分层委派**。

### 实践价值："Steering ≠ Doing" 是 AI 协作设计的新原则

Wizard 阶段 steering 和 doing 混在一起（人类施咒即执行），Patron 阶段两者被明确分离：briefing + signing off。Mollick 的这句话是关键——"But steering is no longer the same as doing. I brief the model, it spins up its own agents to research and write and check one another's work, and what comes back is finished." 这意味着 AI 协作设计的新原则是：**设计 briefing（清晰定义 desired outcome + acceptance criteria）比监控执行过程更重要**。

## 实践启示

- **"Patron" 工作流**适用于任何 Fable 级别的 AI 协作场景——与其试图看清过程，不如定义清楚 desired outcome + acceptance criteria
- **多智能体委派**是 Fable 的核心成本控制机制——主模型执行高价值任务，子模型处理检索/验证等高 token 消耗步骤
- **9.5 小时 19 页设计文档**显示长周期任务不再是"AI 不擅长"，而是需要合理 prompting（先文档后执行）
- **安全护栏过敏感**仍是 Fable 当前的实际部署问题——任何"安全相关"问题立即降级到 Opus 4.8
- **"Black box 即能力代价"**——若接受 black box，可获得前所未有的执行力；若要求透明过程，需要等更好的接口层

## 来源

- → [原文存档](https://github.com/QianJinGuo/wiki-book/tree/main/docs/raw/articles/oneusefulthing-mythos-fable-mollick-feels-like.md)
- 相关 entity: [Claude Fable 5 And New Ai Safety Fables](ch01/877-claude-fable-5-and-new-ai-safety-fables.html)（Lambert/Interconnects 安全分析视角）
- 相关 entity: [Anthropic Claude Fable 5 On Aws内置保护措施的 Mythos 级功能现已推出](ch01/1316-anthropic-claude.html)（AWS 中文工程落地视角）

---

