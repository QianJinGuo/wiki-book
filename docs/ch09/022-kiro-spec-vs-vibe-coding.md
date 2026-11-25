# 用 Kiro 构建行业专业软件：Spec vs Vibe Coding 的分层结论

> 📊 Level ⭐⭐⭐ | 11.8KB

Kiro 是一个 AI 原生开发环境。在一项为期 5 天、实际编码约十余小时的行业垂直软件开发实践中（陆上地震勘探多次波压制处理系统），交付约 2,408 行代码与文档，涵盖预测反褶积、双曲 Radon 变换、SRME 三种经典算法，以及 CLI、桌面 GUI 与多炮并行流水线。

## 核心论点：Spec vs Vibe Coding 的分层适用边界

本文的核心方法论贡献是提出了 **"内核用 Spec、外围用 Vibe、衔接靠接口"**的分层开发范式：

- **算法内核（Spec 驱动）**：采用 Speck 固化统一接口规范，确保算法实现的正确性、可测试性和可维护性。Spec 驱动适合确定性高、边界明确的逻辑核心。
- **外围交互（Vibe Coding）**：GUI 和 CLI 等用户交互层采用探索式迭代快速成型，Vibe Coding 让快速试错成为可能。
- **衔接层**：通过明确的 API 接口连接 Spec 内核与 Vibe 外壳，保持系统整体的一致性。

## 行业专业软件的 AI 赋能路径

文章记录了一个重要观察：AI 工具不会替你突破方法的物理边界（地震波压制方法本身的数学物理限制依然存在），但 AI 能显著降低"将领域知识转化为可运行、可扩展代码"的成本。

在投入产出方面，5 天时间（实际编码十余小时）完成从需求分析到交付一个可运行的行业软件系统，代表了 AI 辅助开发行业垂直软件的新效率水平。

## 算法实现验证

三种经典地震信号处理算法在 Kiro 中实现，并在小合成数据上验证：
- **预测反褶积**：接近论文最佳水平
- **双曲 Radon 变换**：受方法本身限制，效果有限
- **SRME**：受数据条件限制，效果有限

项目坦诚讨论了算法在小合成数据上的适用边界，强调工程落地价值而非指标刷榜。

## 深度分析

### 分层范式的内在逻辑：不确定性放在哪个阶段消化

Spec 驱动与 Vibe Coding 的本质差异，在于二者消化不确定性的时机不同：Spec 把不确定性放在编码之前、用规格收敛；Vibe Coding 把不确定性放在编码之后、用迭代消化。 文章给出的可操作判别标准非常朴素——**该模块是否会被其他部分依赖、是否需要复用**：是，则先行 Spec；否（纯探索性工作），可直接 Vibe。

"内核用 Spec、外围用 Vibe、衔接靠接口"这一分层结论的深层含义是：**Vibe Coding 的高效并非源于省略设计，而是建立在已有的良好接口设计之上**。GUI 之所以能在几十分钟内零重复代码完成，前提是算法层已通过 Spec 固化了统一的 `process(data, dt, **params)` 接口规范，GUI 仅在其上复用。 缺少这层经 Spec 沉淀的接口基础，同样的探索式迭代往往产出高耦合、难维护的代码——短期的速度收益最终会以维护成本偿还。 这与 [Claude Dispatch 的接口之力](https://github.com/QianJinGuo/wiki-public/blob/main/entities/claude-dispatch-and-the-power-of-interfaces.md) 所观察到的规律一致：接口是 AI 时代工程复杂度的控制阀。

### 对照实验：同一项目内的 Spec vs Vibe

文章在同一开发者、同一工具链下让两种范式各管一层，得到可直接横向比较的对照数据：

| 维度 | Spec 驱动（算法内核 + Pipeline） | Vibe Coding（GUI） |
|---|---|---|
| 前期成本 | 较高：4 轮交互产出 45 行规格，无即时代码产出 | 极低：无规格，初版即时可见 |
| 质量保障 | 每个 Phase 配量化验证（SNR/相关系数），缺陷可早期暴露 | 依赖人工目视确认，缺乏定量校验 |
| 可追溯性 | 需求、选型、接口均沉淀为文档，可回溯 | 决策分散于对话过程，难以复原 |
| 演化风险 | 低；但存在前期过度设计的可能 | 较高；缺乏约束易累积技术债 |

其中可追溯性的差异值得特别记录：GUI 的探索式对话日志未留存，导致其实际耗时无法精确还原——而算法内核的每个决策都能回溯到 requirements.md 的 45 行规格。 **Spec 不仅是正确性保障，更是一种知识资产化手段**：它把对话中易逝的共识固化为可审计的文档。这与 [SDD + Harness 研发范式](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/sdd-specification-driven-development-harness.md) 的核心主张同构。

### 地震流水线的 Spec/Vibe 边界划分及其原因

落到本项目的具体流水线上，Spec 与 Vibe 的边界划分呈现出清晰的"依赖方向"逻辑：

- **Spec 驱动的部分**：三个算法模块（预测反褶积、双曲 Radon、SRME）、SEG-Y IO、Pipeline 编排。原因有三——正确性敏感（处理结果需量化验证）、被反复依赖（GUI 和并行化都构建在 Pipeline 之上）、领域知识密集（算法选型直接来自 requirements.md 的"多次波类型→算法→选型理由"映射表）。
- **Vibe Coding 的部分**：tkinter GUI（410 行）。初版当晚交付后连着三轮迭代（导出按钮、参数可调、Tab 切换），四次提交集中在 44 分钟内完成。 交互形态需要通过可见原型澄清——用户说不清想要什么样的界面，但看到初版后立刻知道要改什么。

值得注意的细节是：统一接口 `process(data, dt, **params) -> (cleaned, removed)` 是 Kiro 在 Phase 5 **主动**统一而非被动执行指令的结果。基于这个约定，Pipeline 实现极简（102 行），后来扩展并行处理只新增一个 `run_parallel` 方法、原有代码零改动，实测 8 炮并行提速约 5.6 倍；GUI 的处理逻辑直接复用 Pipeline，没有任何重复代码。

### 三种经典算法如何约束 AI 的杠杆空间

AI 在这个项目中的杠杆不是均匀分布的，三种算法的效果差异揭示了其中的约束结构：

- **预测反褶积**：多次波能量衰减 58.8%、相关系数 0.828、SNR 改善 +3.85 dB，接近论文报告的最佳水平。其前提是短程多次波的周期性强，恰好匹配 Wiener 预测的假设。
- **双曲 Radon 变换**：能量衰减仅 13.0%、相关系数 0.540。不是实现 bug，而是速度可分离性依赖足够的偏移距孔径，单炮 48 道的合成数据偏小。
- **SRME**：能量衰减仅 9.7%、相关系数 0.321。SRME 本质上是为海洋自由表面多次波设计的数据驱动方法，在陆上叠前 + 单炮合成数据条件下（缺少近偏移距/负偏移距道），预测精度天然受限。

关键在于：这三个约束全部来自**方法本身的数学物理假设与数据条件的匹配度**，而非代码实现质量。Kiro 在实现 SRME 前就主动提示"单炮集 SRME 效果有限，理想情况需要补充零偏移距和负偏移距道"——这个预告与最终测试结果完全吻合。 这构成了一条完整的证据链：**AI 能把算法实现、向量化优化（速度扫描约 0.18 秒、较纯 Python 循环提速约 30 倍）、工程化封装的成本拉到新低，但方法的物理边界它一分一毫也替你突破不了**。 AI 降低的是"领域知识→可运行代码"的转化成本，而不是"错误假设→正确结果"的转化成本。前者是工程问题，后者是科学问题，AI 的杠杆只作用于前者。

## 实践启示

1. **先给身份，再谈需求**。开场设定"你是一名地球物理勘探专家，同时擅长软件开发"，让 AI 用专家视角主动澄清边界比直接丢需求高效得多（五个定位问题：领域、用途、用户、对标、部署）。
2. **用分层判别标准分配范式，别一刀切**。会被其他模块依赖、需要复用的部分（算法、数据格式、接口）先行 Spec；纯探索性的部分（界面、交互、一次性脚本）大胆 Vibe。本项目 4 轮交互产出 45 行需求文档避免了内核大量返工，而 GUI 的快速迭代收益也真实兑现。
3. **先定义统一接口，再写实现**。`process(data, dt, **params)` 这个简单约定让后期加 GUI、加并行几乎零成本。接口约定的最佳时机是"第二个依赖者出现之前"——晚了要返工，早了可能过度设计。
4. **分阶段验证胜过整体提交**。5 个 Phase 严格分离，每个阶段都有独立验证脚本和量化指标（能量衰减/相关系数/SNR），让 AI 的产出可被持续校验，而不是等全部写完再发现错误。
5. **把 AI 的"保守"当领域知识用**。Kiro 会主动告诉你方法的局限（陆上单炮 SRME 效果有限），别把这种诚实当能力不足——那恰恰是领域 know-how 的体现，后续测试数据也验证了这个预告。
6. **让 AI 同步生成文档，同时守住"物理边界清醒"**。论文、需求记录、操作手册随开发同步生成（本项目同步产出 693 行文档含 381 行技术论文，所有指标从测试输出提取而非编造）；但必须清醒：AI 不替你突破方法的物理边界，它的价值是把"领域知识→可运行代码"的成本拉到新低。 对于 [Vibe Coding 范式](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/vibe-coding-paradigm.md) 的实践者，这条是行业专业软件与玩具项目的分水岭。

## 相关实体

- [OpenSpec/Spec-Driven Development](https://github.com/QianJinGuo/wiki-public/blob/main/entities/openspec-spec-driven-development-trae-solo.md)
- [Spec-Driven Development 认知框架](https://github.com/QianJinGuo/wiki-public/blob/main/entities/spec-driven-development-cognitive-framework.md)
- [Spec-Driven Development 总结](https://github.com/QianJinGuo/wiki-public/blob/main/entities/sdd-spec-driven-development-summary-qoder.md)
- [Beyond Vibe Coding](https://github.com/QianJinGuo/wiki-public/blob/main/entities/beyond-vibe-coding-directed-generation-design-uxmag.md)
- [AI 生产力悖论](https://github.com/QianJinGuo/wiki-public/blob/main/entities/ai-productivity-paradox-cost-shifting-poischeme.md)

→ [原文存档](https://aws.amazon.com/cn/blogs/china/kiro-build-tool-practice)

---

