# AI 时代的 EKS 升级范式：Kiro-cli Agent 接管识别、升级与排障

## Ch04.630 AI 时代的 EKS 升级范式：Kiro-cli Agent 接管识别、升级与排障

> 📊 Level ⭐⭐ | 3.3KB | `entities/ai-eks-upgrade-kiro-cli-agent-paradigm-2026.md`

# AI 时代的 EKS 升级范式：Kiro-cli Agent 接管识别、升级与排障

AWS Kiro-cli 结合 Arm MCP Server 与 Kiro Powers，让 AI Agent 自主执行 EKS 集群升级的全流程：风险识别、路径规划、升级执行与故障排查。对照实验显示：加载 Skill 知识库后 agent 自主执行耗时仅 2.5 小时（vs 无 Skill 时工程师全程介入的 6 小时），节省 60%。

## 传统 EKS 升级的三大痛点

1. **风险识别靠"经验记忆"**——14+ EKS Add-on 和 6-10 个自管理 Helm 组件的兼容性信息分散在 K8s release notes、AWS 文档和各项目 GitHub README 中，经验随人员流动而流失。
2. **执行靠"runbook 翻页"**——跨 3 个大版本的升级涉及 3 次控制面升级、3 轮 Add-on 同步、3 轮节点组滚动，每一步需对照 runbook 手工执行和验证。
3. **故障排查靠"再 google 一遍"**——PodEvictionFailure 等典型故障的根因（PDB 反模式/PVC AZ 锁/EKS 驱逐 API 严格性）分散在多个文档层级中，跨层关联的知识难以沉淀。

## Kiro-cli 架构

Kiro-cli 是 AWS Kiro IDE 的命令行版本，结合 Arm MCP Server（嵌入 Arm 架构知识）和 Kiro Powers（专用工具包），提供：
- **migrate_ease_scan**：扫描代码兼容性问题
- **knowledge_base_search**：搜索 Arm 文档获取迁移指导
- 无需具备提示工程能力，结构化工作流由 AI 代理执行

## 对照实验

在同一集群（EKS 1.32 → 1.35），唯一变量是是否加载 Skill 知识库：

| 条件 | 耗时 | 人工介入程度 |
|------|------|-------------|
| 无 Skill | ~6 小时 | 全程人工介入 |
| 加载 Skill | ~2.5 小时 | Agent 自主执行，节省 60% |

两组共享同一工具链，差距主要来自 Skill。agent 在实战中主动发现新隐性约束并补充回 Skill，说明知识库具备随实战增长的潜力。

## 三个核心场景

1. **AI 驱动的风险识别**：Agent 自动扫描集群配置，对比目标 K8s 版本兼容矩阵，输出风险评级报告
2. **AI 驱动的升级执行**：按 Skill 定义步骤自主执行，每步自动验证，失败时自动回滚或暂停征询
3. **AI 驱动的故障排查**：基于 Skill 沉淀的故障诊断树，自动执行分级排查

## 运维范式启示

Kiro 系统将 Kubernetes 运维从"人工记忆 + 手动执行"升级为"Skill 知识库 + Agent 自主执行"。Skill 知识库不仅是静态文档，而是随实战自动演化的执行指南——agent 在执行过程中发现的新约束自动补回 Skill，形成"执行 → 发现 → 沉淀 → 复用"的正向循环。

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/ai-eks-upgrade-kiro-cli-agent-paradigm-2026.md)

---

