# Spec-Driven Development (SDD) 全面总结：从5人7天案例到方法论全集

## Ch05.053 Spec-Driven Development (SDD) 全面总结：从5人7天案例到方法论全集

> 📊 Level ⭐⭐ | 9.8KB | `entities/sdd-spec-driven-development-summary-qoder.md`

# Spec-Driven Development (SDD) 全面总结：从5人7天案例到方法论全集

阿里云开发者王砚舒系统总结了 SDD（Spec-Driven Development）方法论，包含5人7天交付案例、四阶段模型、三文件体系、好Spec六要素、工具生态对比及硬数据验证。

## 核心案例：5人7天干完20人数周的活

团队使用 Qoder 与 SDD 方法，在 7 天内交付了 QoderWork 产品，完成了传统需要 20 人数周的工作量。核心洞察是 **DAY 0 的 Spec 编写决定了整个项目的成败**——Spec 是锚点，效率源于 Spec 约束下的人机协作没有失控。

这一案例的关键因素并非 AI 编码速度本身，而是 Spec 提供了明确的「成功标准」和「边界定义」，使得 AI 在有限的决策空间内高效产出，而人工审查只需要验证 Spec 符合性而非逐行检查代码。这种分工模式将人的稀缺注意力集中在高价值判断上，将执行层面的重复劳动完全交给了 AI。

## 什么是 SDD

Spec-Driven Development 的核心思想是将规格说明（Specification）作为唯一真实来源（Single Source of Truth），代码作为其派生产物。先定义 WHAT，再让 AI 做 HOW。

SDD 是为 AI 编程时代量身定制的工程方法。在传统开发中，Spec 仅仅是影响沟通效率的文档；在 AI 时代，Spec 的质量直接决定代码质量——因为模型对模糊需求的理解偏差会通过快速代码生成被急剧放大。

SDD 的行业共识在 2025 年从多个方向同时收敛：
- Karpathy Vibe Coding（反面参照，暴露了无约束 AI 编程的致命问题）
- GitHub Spec Kit（Agent-agnostic 工具链）
- AWS Kiro（内置 SDD 工作流的 IDE）
- Fission-AI OpenSpec（轻量迭代路线）
- 阿里 QoderWork（Quest 模式规模化执行）

## SDD 四阶段模型

1. **Specify（规格定义）** — 人主导，产出 spec.md，定义问题、边界、成功标准
2. **Plan（方案规划）** — 人 + AI 协作，产出 plan.md，架构选型、模块划分
3. **Implement（代码实现）** — AI 主导，按 plan 逐任务实现
4. **Validate（验证确认）** — 人 + AI，自动化测试 + 人工 Review

核心原则：**人定义 WHAT，AI 实现 HOW**。

**为什么 Specify 和 Validate 必须有人参与**：这两步涉及价值判断——定义"什么值得建"和"建成后是否满足需求"。Value Judgment 当前仍是人类的比较优势领域，而 Plan 和 Implement 则属于逻辑推理和模式匹配，AI 已能胜任甚至超越人类平均水平。

## 三文件体系（GitHub Spec Kit）

- **spec.md**: 需求规格/唯一真实来源。回答"做什么"和"为什么做"
- **plan.md**: 架构方案，AI 起草，人审核修改
- **tasks.md**: 任务清单，可执行原子任务
- **constitution.md**: 不可变项目原则，技术决策固化为 AI 的"潜意识"

### 好 Spec 六要素
Problem Statement / Success Metrics / User Stories / Acceptance Criteria / Non-Goals / Constraints

### 粒度检验标准
是否能用不同技术栈实现同一个 Spec？若能，说明没把 HOW 混进 WHAT。

**constitution.md 的特殊作用**：它是项目中唯一"不可变"的文件。一旦写入（如"所有 API 必须是 RESTful"、"禁止使用全局状态"、"优先选用 PostgreSQL"），所有后续的 Spec 和 Plan 都必须遵守，相当于项目级别的技术宪章。这解决了长周期项目中 AI 代码风格漂移和架构一致性退化的问题。

## 工具生态对比

| 工具 | 定位 | 核心理念 | 适合团队 |
|------|------|----------|----------|
| Spec Kit (GitHub) | Agent-agnostic 框架 | 三文件 + constitution | 多 Agent 混合团队 |
| OpenSpec (Fission-AI) | 轻量迭代 | 对话式 Spec 演化 | 小团队快速验证 |
| Kiro (AWS) | SDD-native IDE | 端到端工作流 | 企业级交付 |
| QoderWork (阿里) | Quest 执行引擎 | 规模化任务编排 | 中大型产品团队 |

**选择建议**：如果你正在建设团队级的 AI 编码规范，推荐从 GitHub Spec Kit 开始，它不绑定特定 Agent 或 IDE，具有最高的灵活性。如果你的团队已经在使用阿里云生态，QoderWork 的 Quest 模式可以提供开箱即用的任务执行引擎。

## 数据验证

- API 变更周期缩短 75%（金融领域）
- 代码错误率减少 50%
- Stripe 交付 1,300 个 AI PR 未引发系统性问题
- 无 Spec AI 编程 45% 代码含安全漏洞（Veracode 2025）
- 4 年代码重复率增长 4 倍（GitClear）

**Stripe 的数据尤其值得注意**：1,300 个 AI PR 且未引发系统性问题，说明 SDD 的约束力在大规模组织中仍然有效。Stripe 的成功不仅在于 SDD 方法论，还在于其严格的 CI/CD 门禁和代码审查文化——SDD 提供的是上游的质量保证，下游的工程门禁仍然是必须的。

## 深度分析

### SDD 与 Vibe Coding 的本质差异：约束 vs 自由

Vibe Coding 在项目初期效率极高（无 Spec，直接 Prompt → 代码），但会在 3 个月后遇到「约束墙」：代码重复率指数级增长、安全漏洞累积、架构不可维护。SDD 通过前置约束（Spec）将决策质量从"执行时"提前到"计划时"，本质上是 **Constraints Engineering**——用高质量的约束换取低成本的执行。

两者的核心区别在于不确定性管理：
- **Vibe Coding**：将不确定性推迟到执行阶段解决，适合探索性/一次性任务
- **SDD**：在计划阶段解决不确定性，适合生产级/长期维护任务

### Spec 作为共享心智模型（Shared Mental Model）

SDD 的真正价值不在于文档本身，而在于 Spec 创建过程中建立的人与 AI 的**共享心智模型**。当人类开发者撰写 Spec 时，AI 在后台"理解"这个 Spec；当 AI 根据 Spec 生成 Plan 时，人类可以验证 AI 的理解是否正确。这种双向校对（Alignment Loop）比传统的单向需求传递（需求文档 → 开发 → 测试）更具鲁棒性。

### SDD 在 Agent Teams 中的扩展

在多 Agent 协作场景（Agent Teams）中，SDD 的三文件体系提供了一个自然的通信协议：
- **spec.md** 作为跨 Agent 的任务契约
- **plan.md** 作为 Agent 间的分工文档
- **tasks.md** 作为可并行的原子工作单元
- **constitution.md** 确保所有 Agent 遵守相同的架构约束

这使得 SDD 从单人 AI 编码工具扩展到团队级 AI 协作的编排框架。

### 为什么 Vibe Coding 仍然不可替代

尽管 SDD 在生产级项目中具有明显优势，但 Vibe Coding 在以下场景仍然不可替代：
1. **原型验证**：在不确定需求价值时，快速 Demo 优先于架构质量
2. **个人小工具**：无长期维护需求的脚本和一次性工具
3. **探索性数据分析**：在数据中寻找模式的非结构化任务
4. **学习与教学**：通过自由试错理解技术边界

最佳实践是在项目初期使用 Vibe Coding 快速验证概念，确认方向后切换为 SDD 进入工程化阶段——即 **Vibe → SDD 两阶段过渡**。

## 实践启示

1. **从 Day 0 开始写 Spec**：不要等到"稳定需求后再补文档"。Spec 的第一版只需要 1-2 页，重点是定义 Problem Statement 和 Success Metrics。随着项目推进逐步细化，保持 Spec 与代码同步更新。

2. **用 Spec 粒度检验判断是否"过度设计"**：好的 Spec 应当能用不同技术栈实现相同的结果。如果你的 Spec 包含"用 React 写一个按钮"，说明已经混入了 HOW。修正为"用户需要能提交表单的入口，成功提交后显示确认页面"。

3. **Constitution.md 是长期项目的秘密武器**：在超过 3 个月的 AI 编码项目中，代码风格和架构一致性必然退化。写入 constitution.md 的决策（"所有配置项必须可环境变量覆盖"）会在每次 AI 生成时自动执行，不需要人工提醒。

4. **SDD 的 ROI 在时间轴上的拐点在 2-4 周**：对于短于 2 周的项目（黑客松、紧急修复），Vibe Coding 更高效。超过 4 周的项目，SDD 节省的返工成本已超过 Spec 书写的投入。拐点位置取决于团队规模和项目复杂度。

5. **不要跳过 Validate 阶段**：SDD 最常见的失败模式是"Spec + AI 生成 → 直接上线"。Validate 阶段（自动化测试 + 人工 Review）是不可或缺的，AI 生成的代码即使通过了 Spec 检查，仍可能有边缘情况错误、安全隐患和架构偏差。

## 相关实体

- [Vibe Coding 的局限性与 Agentic Engineering](../ch04/678-karpathy-vibe-coding-agentic-engineering.html)
- [Harness Engineering 实践指南](ch05/052-harness-engineering.html)
- [Spec Kit & OpenSpec 混合 Harness](ch05/050-openspec.html)
- [SDD 实践：Lattice Harness 团队 AI 编码](ch05/100-ai-coding.html)
- [Codex 五层架构](../ch01/534-codex.html)

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/sdd-spec-driven-development-summary-qoder.md)

---

