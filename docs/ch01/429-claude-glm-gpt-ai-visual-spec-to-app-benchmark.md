# Claude、GLM、GPT谁才是真正的AI软件工程师？首个持续更新Visual Spec-to-App Benchmark发布

## Ch01.429 Claude、GLM、GPT谁才是真正的AI软件工程师？首个持续更新Visual Spec-to-App Benchmark发布

> 📊 Level ⭐⭐ | 10.6KB | `entities/claudeglmgpt谁才是真正的ai软件工程师首个持续更新visual-spec-to-app-benchmark发布.md`

# Claude、GLM、GPT谁才是真正的AI软件工程师？首个持续更新Visual Spec-to-App Benchmark发布

> VISTA（VIsual Spec-To-App Benchmark）是由 University of Arizona、Zoom 与 Stony Brook University 联合推出的首个面向 Visual Spec-to-Web-App 的端到端 Benchmark。它不再要求 Agent 修复已有代码，而是要求 Agent 根据产品需求、网页设计稿和 Figma 信息，从零构建完整、可运行的多页面 Web 应用，标志着 Coding Agent 评估从"代码评测"到"产品评测"的范式转变。

## 摘要

Coding Agent 已经从"修复代码"进化到"开发产品"，但现有 Benchmark（如 SWE-bench）仍专注于 GitHub Issue 修复。VISTA 填补了这一空白：它要求 Agent 根据产品需求（PRD）、Figma 设计稿和网页截图，从零构建可运行的多页面 Web 应用。Benchmark 覆盖 10 类真实 Web 应用、128 个页面、3253 个可交互组件和 458 个视觉锚点。通过 DOM-Grounded Evaluation 同时衡量定位和交互行为，VISTA 从质量（Quality）、速度（Speed）、成本（Cost）三个维度全面评估 Coding Agent 的真实软件工程能力。

## 核心要点

- **端到端产品开发评测**：从 PRD + Figma 设计稿到完整 Web 应用，模拟真实软件开发流程
- **覆盖 10 类应用**：新闻、房产、招聘、论坛、旅行预订、聊天、云存储、电商、项目管理、音乐流媒体
- **DOM-Grounded Evaluation**：定位分 × 行为分 = 最终得分，交互必须"位置对且行为对"
- **三种维度考量**：质量（Quality）、速度（Speed）、成本（Cost）
- **持续更新（Living Benchmark）**：随模型和 Harness 更新实时刷新排行榜
- "模型 + Harness"系统竞争**：同一模型在不同 Harness 下表现可能不同

## 研究背景：从"写代码"到"开发产品"

### 现有 Benchmark 的局限

过去几年，SWE-bench、OpenHands 等 Benchmark 极大推动了 Coding Agent 的发展，但它们主要关注代码仓库维护和 GitHub Issue 修复。真实的软件开发通常始于一份产品需求和一张 Figma 设计稿，需要开发者从零构建完整的 Web 应用。Coding Agent 面临的挑战已经从 **Code Generation** 演变为 **Product Generation**。

### VISTA 的定位

VISTA 不再将任务定义为代码补全或仓库修复，而是直接从产品设计开始。每个任务要求 Agent：理解需求 → 分析页面布局 → 选择开发框架 → 实现交互逻辑 → 启动应用 → 调试修复。这更贴近现实中的软件开发流程，而非理想化的网页生成任务。

## Benchmark 设计

### 数据构建

如图 3 所示，VISTA 覆盖 10 类典型 Web 应用，共 128 个页面、3253 个交互组件、458 个视觉锚点。

Benchmark 从 Figma 设计稿出发（而非互联网网页），以 Figma 渲染截图和结构化 JSON 共同作为 Ground Truth。这意味着：

- 避免直接使用 HTML/CSS/JavaScript 带来的数据污染风险
- 确保每个任务有精确的视觉和结构参考
- 支持细粒度的组件级评测

### 五种输入条件

VISTA 设计了五种 Prompt Conditions，从纯文本需求逐步增加页面截图和 Figma 结构信息，同时评测固定技术栈与自由技术栈两种开发模式：

这种方式不仅比较整体能力，还能回答更细粒度的问题：截图能带来多少帮助？Figma 结构信息是否真正有价值？技术栈约束是否影响开发能力？

### DOM-Grounded Evaluation

VISTA 的评测流程分四步：

1. **坐标对齐**：用语义锚点估计仿射变换，将参考稿坐标映射到渲染页面坐标系
2. **DOM 元素匹配**：在真实浏览器中渲染，将标注目标匹配到可见的可交互 DOM 元素
3. **行为专项检查**：覆盖导航、文本输入、开关、外链、弹窗等交互类型
4. **聚合评分**：定位分 × 行为分，逐项相乘后取平均

相乘的设计意味着**交互必须"位置对并且行为对"才能得分**——画出来的按钮、缺失的控件、错位的组件都无法通过评测。

## 核心发现

### 发现一："模型 + Harness"系统竞争

Coding Agent 的竞争已经从模型竞争演变为"模型 + Harness"的系统竞争。排行榜上的评测对象不再是 GPT、Claude 或 GLM 单独，而是模型与开发 Harness 共同组成的完整 Agent。工作流设计、工具调用和执行策略已成为影响软件开发能力的重要因素。

### 发现二：领先模型差距缩小但远未满分

当前排名前列的 fable-5、Claude Opus 4.8、GPT-5.5 和 GLM-5.2 已能根据产品需求和 Figma 设计完成完整 Web 应用开发，但最高综合得分仍不足 0.3。说明 Coding Agent 虽具备一定开发能力，但距离稳定完成真实产品开发仍有巨大提升空间。

### 发现三：模型形成不同的工程风格

不同 Coding Agent 展现了截然不同的开发策略：

- **fable-5**：最高质量，但平均约 75 万 Tokens/任务
- **GLM-5.2**：约 30 万 Tokens，约为 fable-5 的一半
- **GPT-5.5**：约 28 万 Tokens，开发效率更高

### 发现四：开发流程行为差异显著

研究团队将开发过程拆解为上下文检查（Inspect）、代码编写（Write）、结果验证（Verify）、错误恢复（Failure Recovery）等阶段。Claude 系列更倾向于反复检查上下文并重新诊断，GPT 系列则采用更多样化的修复路径。

## 深度分析

### 从"谁更会写代码"到"谁更会开发产品"

VISTA 的提出标志着 AI 软件工程评估的一个关键转折点。传统代码评测（Code-Centric Evaluation）关注的是代码是否正确、语法是否规范；而产品评测（Product-Centric Evaluation）关注的是最终产品能否真正交付使用。这要求 Agent 具备更全面的能力：视觉理解 → 组件分解 → 框架选择 → 交互实现 → 调试修复。VISTA 的 DOM-Grounded Evaluation 确保了一个组件只有**位置正确且功能正确**才能获得高分。

### "模型 + Harness"系统竞争的含义

同一模型在不同 Harness 下的表现差异表明，**工作流设计和工具调用策略正在成为比模型本身更具区分度的因素**。这与 Harness Engineering 范式的基本观点高度一致——Agent 系统的工程化质量决定了模型能力的实际落地效果。参见 [Harness Engineering 的核心地位](../ch05/052-harness-engineering.html) 和 [Agent Harness 综述](../ch05/039-agent-harness.html)。

### 与现有评估体系的互补性

VISTA 填补了现有 Benchmark 的空白：SWE-bench 评测代码修复能力，RoadmapBench 评测长周期开发，VISTA 评测视觉驱动的从零开发能力。三者共同构成了 Coding Agent 评估的完整拼图，分别覆盖不同能力维度——这与 [RoadmapBench 长周期开发评估](../ch04/250-roadmapbench-long-horizon-agentic-software-development.html) 中讨论的"评估体系需要多维度覆盖"的观点一致。

## 实践启示

1. **评估 Coding Agent 需要多维度指标**：质量、速度、成本三者缺一不可——仅看质量排行榜会忽略不同模型在工程效率上的显著差异

2. **Harness 设计比模型选择可能更重要**：VISTA 显示同一模型在不同 Harness 下表现不同，应将工作流设计、工具调用和执行策略的优化放在与模型选择同等重要的位置

3. **视觉驱动的软件开发是下一波浪潮**：从 Figma 设计到 Web 应用的端到端自动生成正在成为现实，Agent 的视觉理解和组件分解能力将成为核心竞争力

4. **持续更新的 Living Benchmark 是评估体系的必要形态**：Coding Agent 迭代速度极快，静态 Benchmark 很快过时——VISTA 的持续更新模式值得其他评估体系借鉴

5. **关注开发流程分析的价值**：VISTA 对开发过程阶段的拆解分析揭示了不同模型的工作风格差异，这些见解可以指导 Harness 设计（如对某些模型减少上下文检查频率）

## 相关实体

- [RoadmapBench — 长周期 Agentic 软件开发评估](../ch04/250-roadmapbench-long-horizon-agentic-software-development.html) — 从版本升级角度看长周期编码能力
- [Harness Engineering 的核心地位](../ch05/052-harness-engineering.html) — 工作流设计与模型能力的系统整合
- [Agent Harness 综述](../ch05/039-agent-harness.html) — 同一模型在不同架构下的表现差异分析
- [SWE-bench Agent 评估](../ch04/657-swe-bench-agent.html) — 传统代码修复 Benchmark 的方法论
- [Design-to-Code](../ch09/005-design-to-code.html) — 从设计稿到代码的自动化转换技术
- [Agent 评估系统指南](../ch03/046-agent.html) — 系统性 Agent 评估方法论

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/claudeglmgpt谁才是真正的ai软件工程师首个持续更新visual-spec-to-app-benchmark发布.md)

---

