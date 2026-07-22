---
source_url: https://mp.weixin.qq.com/s/VBbr0jqHSQQn1W-iwRuG8g
ingested: 2026-07-15
sha256: 23a7ae2a0b245c6c70f64601b89db3ca77de05faad492d3c2bc677c0664a3dff
source_published: 2026-07-15
title: "AINMM：存量生产级工程向 AI Native 演进的五级成熟度模型"
author: 木直
feed_name: 大淘宝技术
---

AINMM（AI Native Maturity Model）是一套评估和指导软件工程组织在 AI 原生研发范式下成熟程度的结构化框架，借鉴 CMMI 核心思想，针对 "AI Agent 参与软件研发全生命周期" 定义了 5 个成熟度等级（ML1-ML5），围绕 5 大过程域构建。配套 AI Native Evolution Kit 工具支持自动化评估与演进。

## 背景

行业面临结构性矛盾：AI 代码产出能力快速增长但端到端交付效率未同步提升。Sonar 报告显示 42% 新增代码由 AI 生成；GitClear 研究指出代码搅动率翻倍、重复代码增长 4x；OpenAI 将此缺口定义为 Harness Gap。问题在于大多数组织对自身的 AI 协作能力缺乏客观量化的评估手段。

## 五大过程域

PA1 上下文工程（Context Engineering）：建立 AI 能理解的项目语义层。AGENTS.md 做"地图"，docs/ 做"手册"。
PA2 能力封装（Capability Encapsulation）：高频操作封装为可复用 Skill，行为可预测可复制。
PA3 验证回路（Verification Loop）：自动化门禁（Gate 1-4）+ 质量评估。
PA4 协作契约（Collaboration Contract）：人机协作边界通过 Design by Contract 定义。前置断言/后置断言/不变式 + 置信度路由（4 级分流）+ 8 阶段 SOP。
PA5 自进化（Self-Evolution）：经验沉淀→主动优化→量化管理→跨项目复制。

## 五级成熟度

ML1 已感知级（Aware）：AGENTS.md 就位，AI 认识项目。D1≥8, 总分 8-16。
ML2 已管理级（Managed）：Skill 封装 + 基础门禁（编译+架构），AI 行为可预测可验证。D1≥12, D2≥8, D3≥8, 总分 32-44。
ML3 已定义级（Defined）：契约式协作 + 置信度路由 + 组织级标准流程。D1≥16, D2≥12, D3≥12, D4≥10, 总分 50-64。
ML4 已量化级（Quantitatively Managed）：量化管理 + 自进化受控运行 + Critic Agent。D1≥18, D2≥16, D3≥16, D4≥12, D5≥8, 总分 70-85。
ML5 持续优化级（Optimizing）：进化可遗传，组织级持续创新，AI Native 成为组织级资产。D1≥18, D2≥18, D3≥18, D4≥16, D5≥16, 总分 86-100。

## 提升路径

ML1: 建立 AGENTS.md，创建 docs/ 目录，信息分级。
ML1→ML2: Skill Sprint + Gate Sprint。识别高频操作→封装 Skill→建立编译+架构门禁→启用 MEMORY.md。
ML2→ML3: Contract Sprint。契约式设计→置信度路由→8 阶段 SOP→偏航检测信号→全链路 Gate 1-4。
ML3→ML4: Metrics Sprint + Evolution Sprint。建立指标基线→Critic Agent→进化元约束→阈值校准。
ML4→ML5: Ecosystem Sprint。Evolution Kit 抽取→新项目验证→反哺机制→虚拟 Monorepo→实践社区。

## 实践案例：挽单系统

挽单系统是淘天内部一个典型的存量生产级 Java 系统（千余文件、微服务架构、跨多端交付）。作为 AINMM 的"孵化器"，采用"双循环"方法论：内层循环（工程演进：评估→识别短板→定向改造→验证→再评估）+ 外层循环（框架沉淀：实践→模式提炼→通用化→AINMM 定义→反哺实践）。

第一阶段：ML0→ML1。AINA 初始评估 30 分。改造：150 行 AGENTS.md + docs/ 目录 + 部署能力上下文 + MEMORY.md。
第二阶段：ML1→ML2。为 a1 CLI 补充领域层 Harness，建立 Gate 1-2（编译+架构约束），引入协议桥打通端到端验证。
第三阶段：ML2→ML3（进行中）。契约式设计 + 置信度路由 + 8 阶段 SOP + 偏航检测信号。
总分从 30→48，等级从 ML1→ML2。

识别三个配套设施缺口：子工程划分与 Monorepo 策略、电商场景全自动测试链路、线上数据回流与运维闭环。

## 参考资料

[1] Sonar. State of Code Developer Survey Report, 2025.
[2] GitClear. AI Copilot Code Quality, 2025.
[3] Stack Overflow. Mind the gap: Closing the AI trust gap for developers, 2026.
[4] OpenAI. Harness engineering: leveraging Codex in an agent-first world, 2026.
[5] CMMI Institute. CMMI for Development, Version 2.0, 2018.
