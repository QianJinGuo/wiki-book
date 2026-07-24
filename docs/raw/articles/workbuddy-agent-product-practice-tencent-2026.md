---
source_url: "https://mp.weixin.qq.com/s/kYJ2kHrQrolmY8nDfN_Q3Q"
source_title: "腾讯WorkBuddy实践：如何把Agent做成可用产品"
source_author: "腾讯技术工程/Anne"
source_date: "2026-07-24"
ingested: "2026-07-24"
sha256: "7d45491eff037d70f5aa6a1cbbcefc3defd66cb82efc8d6d07c2b8b4f60201ea"
source_type: "weixin"
---

# 腾讯WorkBuddy实践：如何把Agent做成可用产品

**作者:** 腾讯技术工程/Anne（WorkBuddy策略产品经理）
**时间:** 2026年7月24日 17:36

> 模型能力只是起点。Agent 能否稳定完成任务取决于工具接入、上下文组织、权限边界、结果验证、反馈纠正和跨会话延续。

## 核心抽象

模型调用 = 模型(系统提示词 + 工具 + 会话历史 + 其他上下文 + 用户指令)

两条约束：模型是无状态的；模型知识截止到训练日期。

## 四层能力体系

| 概念 | 核心问题 | 消费者 |
|------|---------|--------|
| Tool Call | 模型怎么请求动作 | 模型 + Agent |
| MCP | 外部系统怎么标准化接入 | Agent / Server |
| Skill | 一类任务该怎么做 | Agent |
| Plugin | 一组能力怎么打包分发 | 用户/团队/产品 |

## Context Engineering 五类动作

1. **写入**：把目标、规则、环境写进上下文
2. **选择**：从已有信息中只挑当前需要
3. **检索**：从外部按需拉取
4. **压缩**：长内容外置、清理过期/重复内容
5. **隔离**：独立会话/Sub-agent 处理旁支任务

## Memory 系统

五类记忆：稳定事实、用户知识背景、行为信号、表达偏好、会话延续信息。

关键设计：程序性记忆（做事方法）不进入长期记忆——经过验证的工作方法走 Skill 路径（可版本化、可评审、可测试、可回滚）。

## Harness Engineering 五层架构

1. **运行环境层**：文件系统、Shell、Sandbox、Browser、MCP、权限
2. **引导层（Feedforward）**：项目/环境上下文、规则、Skills
3. **反馈层（Feedback）**：工具结果含纠正信息、时间戳校验、外部验证信号
4. **编排层**：渐进式加载、意图识别、多模型路由、Teams 协作
5. **迭代层**：Harness 自身持续调整

## Loop Engineering

Loop = 触发器 + 独立执行环境 + Skills + Tools/MCP + Sub-agents + Memory + Sensors + 停止条件

## 未解决问题

- 功能/业务正确性验证缺口（需求和实现可能共享同一误解）
- 代码库的 Harnessability 决定建设难度
- AI 可能推动技术方案标准化
- Harness 需要持续投入

