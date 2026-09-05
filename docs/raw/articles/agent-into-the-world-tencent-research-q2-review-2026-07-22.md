---
title: "Agent 跌跌撞撞进入世界：腾讯研究院 2026 Q2 智能体产业回顾"
source_url: "https://mp.weixin.qq.com/s/ObcMGtaQX7I8vfi6QLQOuA"
source_account: "腾讯研究院"
author: "博阳（腾讯科技）"
ingested: 2026-07-22
type: raw-article
tags: [tencent, industry-review, 2026-q2, agent, tokenmaxxing, multi-agent, loop-engineering, cpu-centric, human-in-the-loop]
review_value: 8
review_confidence: 8
review_vxc: 64
review_decision: entity
sha256: 696d6aa6a13222f3feb910b969d2b6cb1405b8acca12478c2f95fb2c83f1bba2
---

# Agent 跌跌撞撞进入世界：腾讯研究院 2026 Q2 智能体产业回顾

> **来源**：腾讯研究院/腾讯科技，作者博阳
> **评分**：v=8, c=8, v×c=64 → **新 Entity**

## 八大趋势

### 1. Agent 成为通用入口
- Codex 用户中 20% 从不做编程工作，成长速度是编程用户的 3 倍
- Google 关闭 Project Mariner，能力并入 Gemini Agent
- 浏览器从"总入口"降级为 Agent 工具箱里的一个工具
- CUI 在 Human-in-the-loop 中仍不可或缺

### 2. 垂直行业批量装配
- Anthropic Claude Design → 金融 Agent（估值/总账/KYC）→ 法律 Agent
- 通用 Agent → 行业 Agent，只需替换行业知识/数据/规则，运行环境可复用
- 企业数据、权限和验收记录成为新护城河

### 3. Tokenmaxxing 运动的失败
- 黄仁勋公开表示年薪 50 万美元的工程师应烧 25 万美元 Token/年
- 亚马逊内部排行榜诱发无效任务 → 关闭
- Uber Claude Code 全年预算四月接近耗尽
- 哈工大"有效反馈算力"概念：复杂任务中仅约 10% Token 真正影响下一步

### 4. 组织瓶颈取代技术瓶颈
- MIT 研究：自主编程 Agent 代码提交量 +120%，但发布上线仅剩 30%
- 验证、审批、发布流程成为新瓶颈
- 替代理论：流程效率由不可自动化部分决定

### 5. 技能严重重复
- 南洋理工分析 2 万多个 Skill，约 3/4 高度雷同，去重后仅余 5 千多个
- Agent 提交的修复因"别人已解决"而被拒绝

### 6. Multi-Agent 的现状
- "编排者-执行者"模式最稳妥
- 多 Agent Token 消耗可达普通 Agent 的 4 倍（Anthropic 披露）
- 去掉中心"包工头"后，群体智能未形成——模型训练中没有"合作"课题
- 下一阶段需要设计制度：任务分派、信息共享、错误归责、奖励回流

### 7. 自进化 AI / RSI / Loop Engineering
- Anthropic RSI：Claude 3 → Mythos 代码优化从 3× 到 50×
- Loop Engineering 将循环做成长期运行工程，Agent 自主找任务→执行→验证→反馈
- 品味/方向判断仍弱：复杂方向决策中模型仅 20% 优于人

### 8. CPU 重归算力中心
- _A CPU-Centric Perspective on Agentic AI_（2025）：工具处理占延迟 90.6%，CPU 能耗占系统 44%
- GPU 继续推理，CPU 维持并发环境/任务队列/工具调用
- 三者协同（GPU+CPU+网络）决定 Agent 系统总效率
