# Agent 观测与优化开发者摸底：Close the Loop 方法论与 700+ 调研基线

> 📊 Level ⭐⭐⭐ | 4.7KB | `entities/agent-observability-optimization-survey-aliyun-2026-09.md`

阿里云云原生 2026 年 8-9 月在北京、上海、深圳三城发起「Agent 评估与优化 · Close the Loop」系列开发者沙龙，基于 700+ 报名问卷数据给出企业 Agent 落地现状画像，并沉淀出闭环优化方法论。核心结论：**需求强烈、基建薄弱、认知体系化不够**——六成受访者已进入 POC/生产，但观测、评估、优化闭环的工程化程度极低。

## 行业基线：四维成熟度数据

这份报告的价值在于给 AgentOps 成熟度提供了可量化的行业基线：

- **观测**：近半数（46.7%）没有专门可观测工具，40.4% 用日志/print 人工拼调用链，19.6% 靠猜或复现；**能拿到完整 trajectory 的仅 13.4%**；云厂商可观测产品渗透率仅 11.6%。没有轨迹，评估与优化都缺乏事实依据。
- **评估**：人工驱动评估合计 70.9%（43.4% 人肉抽查/用户反馈），自动化评估仅 19.8%，**完整线上评估 + A/B 数据驱动发版仅 6.9%**；29.8% 尚未建立指标体系；最受关注硬指标为任务完成率与工具调用准确率（合计过半），事实一致性占 40.2%。
- **优化**：**52.6% 完全没有数据回灌闭环**，30.2% 会看线上数据但没闭环，合计 82.8% 的优化停留在人工/半人工；仅 2.8% 建成数据飞轮；优化诉求为推理质量（81.7%）、Skills 沉淀（78.1%）、缩短迭代周期（74.6%）、降本（63.5%）。
- **审计**：审计/可追溯需求渗透率高达 94.2%，但 36.2%"有要求却还没落地"，已强制全链路留痕的仅 31.4%——可追溯是 Agent 进入生产前的真实门槛。

## Close the Loop：七环节可验证优化链路

阿里云智能 AgentLoop 提出把每次运行变成下次改进证据的七环节链路：**数据接入统一 Trace 口径 → 观测下钻到异常 Step 原始证据 → 冻结样本保证评估可复现 → 数据处理组装可评估轨迹 → 评估指出哪里错/为什么/谁来改 → 同样本 A/B 保证唯一变量 → Agent 侧与平台侧选最小改动杠杆**。全程贯穿质量、效率、成本、安全四类指标，运行结果与用户反馈回流样本池形成闭环。经验（Experience）也被统一管理：事实解析 → 模式挖掘 → 质量 Gate → 匹配召回 → 效果回写，保证每条经验有来源、有边界、可退出。

这与 [美团图灵评测方法论](https://github.com/QianJinGuo/wiki-public/blob/main/entities/agent-evaluation-turing-meituan-2026.md) 的"人人一致/人机一致/Rubric 二元化"测度视角互补：美团重在评测口径本身，本文重在观测到优化的工程闭环。

## SkillOps：Skill 作为可度量战略资产

瓴岳科技把 Skill 当作"可发现、可衡量、可迭代"的战略资产，以**模型广场 + MCP 广场 + Skill 广场 + Plugin 广场**四位一体 AI 基建支撑流转，生命周期六阶段：**发现（优先复用已有）→ 创建（一键生成 Prompt/配置/测试/文档）→ 发布（Git 仓库自动上架）→ 采集（Loongsuite 无感捕获调用数据 + Skill 归因）→ 评测（with/without_skill 离线实验，三维度量：功能正确性/能力增益/Token 成本）→ 迭代（失败场景预标注 + 人工审阅生成高可信数据集）**。

## 相关实体
- [Agent 图灵评测方法论（美团）](https://github.com/QianJinGuo/wiki-public/blob/main/entities/agent-evaluation-turing-meituan-2026.md)
- [Agent 可观测体系五层架构](https://github.com/QianJinGuo/wiki-public/blob/main/entities/agent-observability-5-layer-architecture.md)
- [Agent Gym 持续评估与进化（Google）](https://github.com/QianJinGuo/wiki-public/blob/main/entities/agent-gym-continuous-eval-evolution-google-2026.md)
- [Agent Harness 生产可观测](https://github.com/QianJinGuo/wiki-public/blob/main/entities/agent-harness-observability-production.md)

---

