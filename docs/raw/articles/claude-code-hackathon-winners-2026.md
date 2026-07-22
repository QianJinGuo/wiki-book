---
source_url: ""
tags: [wechat, article, claude, openai]
ingested: 2026-05-21
sha256: ""
---

# Anthropic + Cerebral Valley 联合黑客松：用 Opus 4.7 + Claude Code，一周时间做一个项目

## 获奖项目：虚拟诊室

让医学生在 AI 病人身上练手。

### 核心功能

- **语音驱动的虚拟问诊系统**：AI 病人会说症状、会追问过敏史
- **临床评估**：每次问诊结束按临床指南逐项打分（沟通能力/病史采集/临床推理），每个扣分点附文献引用
- **技术实现**：Claude Managed Agents，一个 Opus 4.7 主治医师 Agent 管三个子 Agent（病人角色扮演/观察者评估/问诊复盘）

### 技术亮点

- 使用 Opus 4.7 作为主治医师 Agent 的核心模型
- Claude Code 作为开发工具，一周内完成从概念到可演示项目
- 多 Agent 协作架构：病人角色扮演 + 观察者评估 + 问诊复盘
- 语音交互能力，模拟真实的医患问诊场景

### 应用场景

- 医学生临床技能训练
- 住院医师规范化培训
- 临床沟通能力评估
