---
title: "Loop Engineering 半年实战拆解：自进化的开发系统已开源"
source_url: "https://mp.weixin.qq.com/s/LUR7nZK77UbbcolO3P0peQ"
author: "Peakstone Labs"
feed_name: "Peakstone Labs"
publish_date: 2026-07-04
created: 2026-07-05
ingested: 2026-07-05
tags: [loop-engineering, claude-code, slash-commands, review, memory, agent-orchestration, subagent, open-source, wechat]
type: article
review_value: 8
review_confidence: 8
review_recommendation: strong
review_stars: 4
sha256: 06c1bbb477f4bef973398e003dc826ca0eefb4b1b218fc5b74818f85d5c80d12
---

# Loop Engineering 半年实战拆解：自进化的开发系统已开源

> **核心判断：Loop Engineering 的本质不是"让 AI 循环干活"，而是设计一个会自我进化的开发系统——用工程约束对抗确认偏误和技术债，用记忆和校准让每一次循环都比上一次更强。**

来自 Peakstone Labs（AI 原生量化研究实验室）的半年实战分享，整套系统已开源为 **github.com/Peakstone-Labs/claude-ship**。

## 三个致命弱点

单人 AI 辅助开发面临三个天然问题：
1. **确认偏误**：AI 顺着你的思路走，永远不会知道方案 B 更好
2. **审查疲劳**：95% 代码正确 → 大脑自动把审查预算降到 5%
3. **记忆蒸发**：三个月前的 bug 修复经验无人可问

## 七个 Agent 流水线

七个 agent，每个有独立人格、工具权限、模型分配，输出落在 `<feature-name>/` 下形成"七件套"：requirements → design → third_party_review → implementation → review → test_report → retro。

### 设计决策一：禁止"顺便问一下"
Clarify agent 一次只问一个问题，禁止批量提问。先读代码再提问（不问代码里已能回答的问题）。用户可随时输入"够了"/"开始设计"终止循环。第 8 轮主动暂停防无限追问。

### 设计决策二：先猜后看
Review agent 工作流：先不读代码 → 基于 design 预测 3-5 个最可能的缺陷区域 → 带着预测审代码 → 记录命中/漏掉的问题。漏掉的问题 = 认知盲区 = 下一次进化的入口。预测起点来自 retro agent 积累的 memory。

### 设计决策三：分级阻断 + 低风险即修
- 🔴 Critical / 🟡 Important：阻断循环，必须修复或白名单豁免
- 🟢 Minor / 💡 Suggestion：四条件满足则必须修（有客观依据、无副作用、≤20行单文件、无需用户确认）

### 设计决策四：三条铁律筛 memory
- Non-Googleable：网上搜不到
- Codebase-Specific：能指到具体文件/错误信息
- Hard-Won：真实 debug 付出代价
memory 总文件数保持 5-8 个，有硬上限。

### 设计决策五：跨厂商设计评审
third_party_review：在写任何代码之前，用不同厂商模型独立评审 design.md。通过 headless Claude Code + 切换 ANTHROPIC_BASE_URL 到第三方端点完成（DeepSeek、Kimi 等）。建议性，不阻断。

## 编排层：/ship 状态机

`/ship` 不是一个 agent，是一个状态机：
- review 和 qa 跑在独立 subagent（隔离上下文，强制 review 不被 dev 思维污染）
- review gate 硬阻断：🔴/🟡 > 0 则跳过 QA 打回 dev
- 循环上限：第 4 轮结束暂停询问用户，第 5 轮强制终止
- 文档增量追加：不得修改/删除历史章节

## 真正的瓶颈

1. 多轮 loop 后 context window 吃紧（尝试自动摘要压缩）
2. review 和 qa 串通（同一个模型家族的共有偏见）
3. 对简单任务太重（小任务不走完整流水线）
4. retro → memory 闭环不够紧

## 进化循环

最重要的不是 dev → review → qa 的代码循环，而是 retro → memory → 下一个 feature 的 **进化循环**。

代码循环保证这一次不出错。进化循环保证下一次比这一次更强。

**少而精的 memory 才是进化的燃料，多而杂的 memory 是进化的阻力。**
**预提交预测创造了可度量的校准回路——认知盲区暴露的那一刻，就是下一次进化的入口。**

## 快速开始

```bash
git clone https://github.com/Peakstone-Labs/claude-ship.git
cd claude-ship
./install.sh
```

之后在任意项目里：`/clarify <feature>` → `/architect <feature>` → （可选 `/third_party_review <feature>`）→ `/ship <feature>` → `/retro <feature>`。

建议：从 review 和 retro 开始，先写好 CLAUDE.md。
