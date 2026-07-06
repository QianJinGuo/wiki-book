# FinOps + DevOps 双Agent 协作：AI驱动的云成本优化实战

## Ch04.479 FinOps + DevOps 双Agent 协作：AI驱动的云成本优化实战

> 📊 Level ⭐⭐ | 5.2KB | `entities/finops-devops-dual-agent-cost-optimization.md`

# FinOps + DevOps 双Agent 协作：AI驱动的云成本优化实战

> **Background**：本文基于 AWS China Blog 2026-06-29 发布的实战案例，由亚马逊云科技客户解决方案经理倪晓峻和李刚撰写。案例展示 FinOps Agent（Preview）与 DevOps Agent（GA）通过结构化交接协议实现端到端云成本优化。

## 三个独有贡献（不应合并到现有 entity）

1. **双Agent 结构化交接协议** — FinOps Agent 识别能力边界后自动生成排查清单（含 CLI 命令、决策条件、风险提示），作为 FinOps→DevOps 的协作桥梁
2. **边界意识设计模式** — Agent 主动声明"我能做什么/不能做什么"，在用户要求越权操作时坚守只读边界
3. **18个月隐性成本案例** — SageMaker Canvas Quick Setup 向导创建的会话 24/7 空转，累计浪费 $47,629，揭示 Quick Setup 的"便利陷阱"

## 双Agent 协作架构

### 关注点分离

| 维度 | FinOps Agent | DevOps Agent |
|------|-------------|-------------|
| 职责 | 费用异常发现、根因分析 | 运行时验证、依赖分析、资源清理 |
| 权限 | **只读**（即使用户要求执行删除也拒绝） | 可写（需用户确认后执行） |
| 数据源 | CloudWatch 账单数据 | CloudTrail 审计日志、SageMaker API |
| 边界 | 无法查询运行时状态、无法执行操作 | 无法进行费用趋势分析 |

### 结构化交接清单

FinOps Agent 生成的排查清单是整个协作的关键：

```
FinOps Agent 输出 → DevOps Agent 输入：
1. 目标资源：3个区域的 Canvas 会话
2. 验证命令：aws sagemaker list-apps ...
3. 决策条件：如果无活跃任务 → 可安全关闭
4. 预期收益：~$4,100/月
5. 风险提示：需确认无外部依赖
```

### 设计哲学

1. **关注点分离** — 分析归分析，执行归执行
2. **最小权限** — FinOps 只读，DevOps 可写但需用户确认
3. **结构化交接** — 通过排查清单传递上下文，避免信息丢失
4. **人在回路** — 关键决策（是否删除）由人类做出

## 案例详情

### 问题发现

FinOps Agent 对测试账号进行全景扫描后发现：
- MTD 总花费 $4,211.96（日均 $351）
- Top 1 服务：Amazon SageMaker，占比 36%（$1,515）
- 98.5% 来自 Canvas:Session-Hrs（Canvas 会话时长）

### 根因分析

- 3 个区域的 SageMaker Canvas 会话 24/7 持续运行
- 所有 Domain 命名遵循 `QuickSetupDomain-{timestamp}` 模式
- 使用 IAM 认证模式，未绑定具体用户身份
- 历史累计浪费：$47,629（18个月）

### DevOps Agent 验证与清理

1. **运行时状态验证** — 并行查询 3 个区域，确认 Canvas 会话完全空闲
2. **关联资源扫描** — 识别 34 个关联资源（3 EFS + 3 EMR + 8 IAM Roles + 6 S3 桶等）
3. **依赖关系评估** — 确认与现有 Notebook 实例完全独立
4. **清理脚本生成** — 按依赖顺序排列的 8 步清理脚本（先删 App → Profile → Domain）
5. **执行后验证** — 再次扫描确认清理完成

## SageMaker Canvas 隐性成本陷阱

- 计费模型：按会话运行时间（~$1.90/小时），非按使用量
- Quick Setup 向导创建的环境默认不自动关闭
- 多区域部署成倍放大问题
- **建议**：定期审计 Canvas/Studio 会话状态，超过 7 天无活跃任务设置自动告警

## 提示词设计技巧

1. **渐进式深入** — 全景扫描 → 聚焦根因 → 历史追溯
2. **一句话传达目标+约束+期望** — "我计划回收...同时帮我确认...确保不影响生产"
3. **适时转向** — Agent 无法提供更多信息时果断转向
4. **了解风险后再授权** — 先理解"不能做"vs"不应该做"，再授权执行

## 与现有 FinOps 实体差异化

| 维度 | 本实体（双Agent协作） | strands-agents-cloud-cost-optimizer | amazon-quick-bedrock-agentcore-finops-chat |
|------|------|------|------|
| 架构 | **FinOps + DevOps 双Agent** | 单Agent（Strands SDK） | Quick Chat + Bedrock AgentCore |
| 独特价值 | 结构化交接协议 + 边界意识 | Strands SDK 框架实现 | MCP Server 自然语言查询 |
| 执行能力 | DevOps Agent 可执行清理 | 分析+建议 | 只读查询 |
| 案例 | $47,629 隐性成本发现 | 通用成本优化 | 多账号成本查询 |

→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/finops-devops-双agent-ai驱动的云成本优化实战.md)
→ [Strands 云成本优化](ch03/045-agent.md)
→ [Quick + AgentCore FinOps](ch03/045-agent.md)

---

