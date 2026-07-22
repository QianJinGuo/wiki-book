# 驾驭AI Coding：面向团队的Harness Engineering落地规范

## Ch05.101 驾驭AI Coding：面向团队的Harness Engineering落地规范

> 📊 Level ⭐⭐ | 3.6KB | `entities/tencent-harness-engineering-team-specification-2026.md`

# 驾驭AI Coding：面向团队的Harness Engineering落地规范

腾讯技术工程 atreusliu 发布的团队级 Harness Engineering 完整落地规范，从理念到实操覆盖 6 大支柱、5 层架构、3 阶段路线图和详细配置步骤，是 AI Coding 工具链在团队中系统化落地的生产级实践指南。

## Harness 6 大支柱

| 支柱 | 核心问题 | 对应工具与团队实践 |
|------|---------|------------------|
| 上下文管理 | AI 看到什么信息？ | AGENTS.md 渐进式披露、Spec 文档进 Git、changes/ 变更隔离、Skills 按需加载、知识库挂载、AI Wiki |
| 工具系统 | AI 能触达什么？ | MCP（DB/API/知识库/运维）+ Skills（工具接入/代码生成/元技能/搜索发现）+ 知识库（iWiki/代码库/AI Wiki） |
| 执行编排 | AI 按什么顺序做？ | "3+1 Phase"（Planner→Generator→Evaluator→Archiver），SDD 工作流 |
| 状态与记忆 | AI 记住什么？ | 短期=会话、中期=Memories、长期=Git Spec、变更=Spec Deltas |
| 评估与观测 | AI 做得对不对？ | L1-L4 四层评估 + AI Code Review |
| 约束与恢复 | AI 不能做什么？ | Rules 硬性红线 + Skills 软性约束 + Safety 安全策略，Git 回滚 |

## AI Coding 一体化架构（5 层）

输入层 → 工作台（CodeBuddy：配置中心+模式引擎+Agent核心）→ MCP 层（DB/API/Wiki/CI/CD）→ 输出层（代码/测试/文档）→ 度量层（AI占比/交付量/Bug率）→ 反馈优化配置中心。

## "3+1 Phase" 多 Agent 协作

标准化工作流定义了四类 Agent 角色：
- **Planner**：理解需求、拆解任务、生成方案（Plan 模式 + 项目 Spec）
- **Generator**：按方案写代码、写测试（Rules + Skills + MCP）
- **Evaluator**：代码审查、规范检查、测试验证（Rules + 验收标准）
- **Archiver**：归档变更、更新知识库（归档脚本 + Git）

## 实施路线图（3 阶段）

1. **基础建设**（1-2 周）：CodeBuddy 安装、team-harness 仓库、基础 Rules、知识库配置
2. **工具接入**（2-4 周）：MCP 接入、Skills 沉淀、Spec 驱动开发流程跑通
3. **持续优化**（持续）：度量看板、规范迭代、知识飞轮

## 工具系统三件套

MCP 是开门的钥匙，Skills 是开门后做的事情，知识库是进门前读的说明书。三个比喻精准概括了三者的职责分工与协作关系。

## 关键理念

- **反模式总结**：7 种常见错误（环境配在 prompt 里、跳过 Plan、不 Review 直接合入等）
- **harness-audit Skill**：自动化合规性自检，确保团队规范被机械执行
- **约束三层**：硬性红线（不可违反）→ 软性约束（推荐遵循）→ 安全策略（兜底保护）

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/tencent-harness-engineering-team-specification-2026.md)

---

