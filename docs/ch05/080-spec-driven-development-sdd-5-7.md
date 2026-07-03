# Spec-Driven Development (SDD) 全面总结：从5人7天案例到方法论全集

## Ch05.080 Spec-Driven Development (SDD) 全面总结：从5人7天案例到方法论全集

> 📊 Level ⭐⭐ | 2.7KB | `entities/sdd-spec-driven-development-summary-qoder.md`

# Spec-Driven Development (SDD) 全面总结：从5人7天案例到方法论全集

阿里云开发者王砚舒系统总结了 SDD（Spec-Driven Development）方法论，包含5人7天交付案例、四阶段模型、三文件体系、好Spec六要素、工具生态对比及硬数据验证。

## 核心案例：5人7天干完20人数周的活

团队使用 Qoder 与 SDD 方法，在 7 天内交付了 QoderWork 产品。核心洞察是 DAY 0 的 Spec 编写决定了整个项目的成败——Spec 是锚点，效率源于 Spec 约束下的人机协作没有失控。

## SDD 四阶段模型

1. **Specify（规格定义）** — 人主导，产出 spec.md，定义问题、边界、成功标准
2. **Plan（方案规划）** — 人 + AI 协作，产出 plan.md，架构选型、模块划分
3. **Implement（代码实现）** — AI 主导，按 plan 逐任务实现
4. **Validate（验证确认）** — 人 + AI，自动化测试 + 人工 Review

核心原则：人定义 WHAT，AI 实现 HOW。

## 三文件体系（GitHub Spec Kit）

- **spec.md**: 需求规格/唯一真实来源。回答"做什么"和"为什么做"
- **plan.md**: 架构方案，AI 起草，人审核修改
- **tasks.md**: 任务清单，可执行原子任务
- **constitution.md**: 不可变项目原则，技术决策固化为 AI 的"潜意识"

### 好 Spec 六要素
Problem Statement / Success Metrics / User Stories / Acceptance Criteria / Non-Goals / Constraints

粒度检验标准：是否能用不同技术栈实现同一个 Spec？若能，说明没把 HOW 混进 WHAT。

## 工具生态对比

| 工具 | 定位 |
|------|------|
| Spec Kit (GitHub) | Agent-agnostic 框架，三文件 + constitution |
| OpenSpec (Fission-AI) | 轻量迭代，对话式 |
| Kiro (AWS) | SDD-native IDE |
| QoderWork (阿里) | Quest 执行引擎 |

## 数据验证
- API 变更周期缩短 75%（金融领域）
- 代码错误率减少 50%
- Stripe 交付 1,300 个 AI PR 未引发系统性问题
- 无 Spec AI 编程 45% 代码含安全漏洞（Veracode 2025）
- 4 年代码重复率增长 4 倍（GitClear）

→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/sdd-spec-driven-development-summary-qoder.md)

---

