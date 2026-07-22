---
title: "改造 Multica 再让它读懂 AgentWaker"
source_url: "https://mp.weixin.qq.com/s/8BIwK9If5nBJwEtEbLNE3w"
source_account: "code2rich"
author: "code2rich"
ingested: 2026-07-22
type: raw-article
tags: [multica, agentwaker, agent-system, role-management, personal-agent, snapshot-plan, runtime]
review_value: 6
review_confidence: 5
review_vxc: 30
review_decision: raw-only
---

# 改造 Multica 再让它读懂 AgentWaker

> **来源**：code2rich（个人公众号）
> **评分**：v=6, c=5, v×c=30 → **Raw only**

## 核心内容

个人 Agent 系统搭建经验，将 Multica（看板/任务框架）与 AgentWaker（角色定义系统）整合。

### 改造要点
1. **角色源**：把目录登记到工作区而非上传压缩包，实现版本化管理
2. **Daemon 扫描**：只识别契约，不执行仓库里的脚本——关注点分离
3. **快照与计划**：先看变化再决定是否应用（类似 Terraform plan-apply 模式）
4. **运行时物化**：角色、技能、共享能力和配置各归其位
5. **.env 管理**：必须参与同步但不能到处可见
6. **运行与入口**：让角色真正接任务并留下证据

### 两个实验
1. **微信公众号助手**：目标不是自动群发，而是可靠进入草稿
2. **小红书助手**：先证明链路真的跑通，不谈"爆款"

### 即页（jpage）角色
作为"发布前的中间层"，连接 Agent 输出与内容平台。
