---
source: rss
source_url: https://aws.amazon.com/cn/blogs/china/ai-eks-kiro-cli-agent-recognition
ingested: 2026-07-03
feed_name: AWS China Blog
source_published: 2026-07-03
sha256: 1bfcf9b19fe5ac7501be47b90b8a69899f0cf3ea1124a2c2af9cf9f84bd6f3a7
---

# AI 时代的 EKS 升级范式：用 Kiro-cli 让 Agent 接管识别、升级与排障

摘要：本文以真实集群从 EKS 1.32 升级到 1.35 为例，展示如何将风险识别、路径规划、升级执行和故障定位交给 Kiro agent。我们在同一集群做对照实验——唯一变量是否加载 Skill 知识库：无 Skill 时工程师需全程介入，耗时约 6 小时；加载 Skill 后 agent 自主执行，耗时约 2.5 小时，节省 60%。两组共享同一工具链，差距主要来自 Skill。更值得关注的是，agent 在实战中主动发现新隐性约束并补充回 Skill，说明知识库具备随实战增长的潜力。

## 一、引言：传统运维的三个痛点

EKS 升级长期面临三个反复出现的痛点：

### 1.1 风险识别靠"经验记忆"

一个典型的中等规模 EKS 集群运行：14 个 EKS 官方 Add-on + 6-10 个自管理 Helm 组件。升级前需要手工回答：每个组件当前版本是否兼容目标 K8s 版本？哪些必须升级、哪些可滞后？新版本引入的硬变更（cgroup v1 移除、AL2 EOL、containerd 2.x、Endpoints API 弃用、IPVS 弃用）是否影响当前集群？这些信息分散在 K8s 上游 release notes、AWS 文档、各 Helm 项目 GitHub README 中，经验随人员流动而流失。

### 1.2 执行靠"runbook 翻页"

一次跨 3 个大版本的 EKS 升级（1.32 → 1.35）涉及：3 次控制面升级、3 轮 Add-on 同步升级、3 轮节点组滚动、每轮之间的稳定性观察。每一步需要工程师对照 runbook 抄命令、核对输出。任何一处漏掉 sanity check 都可能触发难以排查的失败。

### 1.3 故障排查靠"再 google 一遍"

当 EKS managed nodegroup 在升级中报出 PodEvictionFailure 时，重试同一个 update、加 --force、再重试都不会成功。实际真因（PDB 反模式 / PVC AZ 锁 / EKS 驱逐 API 严格性）分散在多个文档中。跨层关联的知识大多记录在踩过坑的人的记里。

## 二、Kiro-cli 解决方案架构

Kiro-cli 是 AWS Kiro IDE 的命令行版本，结合 Arm MCP Server（嵌入 Arm 架构知识）和 Kiro Powers（专用工具包），提供：

- migrate_ease_scan：扫描代码兼容性问题
- knowledge_base_search：搜索 Arm 文档获取迁移指导
- 无需开发者具备提示工程能力，结构化工作流由 AI 代理执行

### 对照实验

在同一集群做对照实验，唯一变量是否加载 Skill 知识库：
- 无 Skill：工程师需全程介入，耗时约 6 小时
- 加载 Skill：agent 自主执行，耗时约 2.5 小时，节省 60%

更关键的是，agent 在实战中主动发现新隐性约束并补充回 Skill，说明知识库具备随实战增长的潜力。

## 三、三个核心场景

### 场景一：AI 驱动的风险识别
Kiro agent 自动扫描当前集群配置（Add-on 版本、Helm 组件、节点配置），对比目标 K8s 版本的兼容矩阵，输出风险评级报告。

### 场景二：AI 驱动的升级执行
从控制面升级到 Add-on 同步到节点组滚动，agent 按 Skill 定义的步骤自主执行，每一步执行后自动验证，失败时自动回滚或暂停征询。

### 场景三：AI 驱动的故障排查
当遇到 PodEvictionFailure 等典型故障时，agent 基于 Skill 中沉淀的故障诊断树，自动执行分级排查：先检查 PDB 反模式、再确认 PVC AZ 锁、最后验证驱逐 API 兼容性。

## 四、对运维范式的启示

核心启示：Kiro 系统将 Kubernetes 运维中的三大痛点（风险识别、runbook 执行、故障排查）从"人工记忆 + 手动执行"升级为"Skill 知识库 + Agent 自主执行"。Skill 知识库不仅是静态文档，而是随实战自动演化的执行指南——agent 在升级过程中发现的新约束会自动补回 Skill，形成"执行 → 发现 → 沉淀 → 复用"的正向循环。
