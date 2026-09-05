---
title: "Google 刚发布了 Harness Engineering PDF（9 页）"
source_url: "https://www.xiaohongshu.com/explore/6a912471000000002603767d"
author: "ReMarkLand"
source: "小红书"
ingested: 2026-08-28
sha256: 4de16272de3c92a4891fa78124d181fd3530d4072dea891992117e0f9bb2c874
---

Google 团队刚发布了一份 9 页的 Harness Engineering PDF：一个公式取代了提示工程。

它把转折点说得很直白：同一个 Claude Sonnet、同一个基准测试，只改 harness，结果完全不同。公式只有一句：Agent = Model + Harness。

这套清单分成 6 步：

1. 加指南：AGENTS.md、规则文件、约束文档。每一行都对应过去一次 Agent 失败，后来被固化成修复规则。
2. 加传感器：lint 工具、测试和验证脚本。Agent 先检查自己的输出，再交给人看。
3. 搭 Agent 循环：计划、执行、验证、修复，并设置重试上限、预算上限，卡住时升级处理。
4. 把记忆外置：模型每次会话都会忘记，Harness 负责跨会话保存状态、决策和产物。
5. 管好权限：规定哪些工具能用、最多写入多少次、哪些操作要审批。安全边界交给 Harness 执行。
6. 接上可观测性：记录工具调用、成本和重试；行为开始漂移时，触发保护机制。

它想表达的结果是：Agent 不再只是一次演示，而是朝基础设施靠近。每次失败都能沉淀成系统改进，而不是只修好下一次对话。
