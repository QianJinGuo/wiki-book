# Loop Engineering 半年实战拆解：claude-ship 开源自进化开发系统

## Ch01.1063 Loop Engineering 半年实战拆解：claude-ship 开源自进化开发系统

> 📊 Level ⭐⭐ | 3.3KB | `entities/loop-engineering-6-month-practice-claude-ship-peakstone.md`

## 核心概述

Peakstone Labs（AI 原生量化研究实验室）开源的 claude-ship 系统（github.com/Peakstone-Labs/claude-ship），单人 AI 开发 Loop Engineering 半年实战总结。核心判断：Loop Engineering 的本质是设计一个会自我进化的开发系统——用工程约束对抗确认偏误和技术债，用记忆和校准让每一次循环都比上一次更强。

→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/loop-engineering-6-month-practice-claude-ship-peakstone.md)

## 七 Agent 流水线

Seven slash commands: `/clarify` → `/architect` → (`/third_party_review`) → `/ship` → `/retro`。每个 agent 有独立人格定义、工具权限、模型分配。

### 五大设计决策

1. **单问澄清**：Clarify agent 一次只问一个问题，先读代码再问，第 8 轮自动暂停
2. **预提交预测**：Review agent 先基于 design 预测 3-5 个缺陷区域，再带预测审代码。记录命中/漏掉的问题（认知盲区=进化入口）
3. **分级阻断 + 低风险即修**：🔴/🟡 阻断循环，🟢/💡 四条件满足则必须修（有客观依据、无副作用、≤20行单文件、无需用户确认）
4. **三条铁律筛 memory**：Non-Googleable + Codebase-Specific + Hard-Won，总文件数 5-8 硬上限
5. **跨厂商设计评审**：third_party_review 用不同厂商模型设计评审（headless Claude Code + 切换 endpoint）

### 编排层：/ship 状态机

- review 和 qa 跑在独立 subagent（隔离上下文，防止思维污染）
- review gate 硬阻断：🔴/🟡 > 0 跳过 QA 打回 dev
- 循环上限 5 轮，第 4 轮暂停询问
- 文档增量追加，不得修改历史章节

## 进化循环 vs 代码循环

最重要的循环不是 dev→review→qa，而是 **retro→memory→下一个 feature** 的进化循环。

* 代码循环：保证这一次不出错
* 进化循环：保证下一次比这一次更强（知识积累 + 校准积累 + 流程积累）

## 诚实缺陷

1. 多轮 loop 后 context window 吃紧
2. 同模型家族的 review/qa 共有偏见
3. 对简单任务太重
4. retro→memory 闭环不够紧
5. 依赖写清楚的 CLAUDE.md

## 快速开始

```bash
git clone https://github.com/Peakstone-Labs/claude-ship.git && cd claude-ship && ./install.sh
```

## 相关实体

- [从 SDD 到 Lattice Harness](https://github.com/QianJinGuo/wiki/blob/main/entities/sdd-practice-lattice-harness-team-ai-coding.md) — 另一团队级 AI Coding 闭环实践
- [《Loop Engineering橙皮书》](https://github.com/QianJinGuo/wiki/blob/main/entities/2026-06-17--Loop-Engineering橙皮书-发布-免费-开源-花叔.md) — Loop Engineering 概念框架
- [Agent Loop 工程手册 8 个未解问题](https://github.com/QianJinGuo/wiki/blob/main/entities/agent-loop-engineering-handbook-8-questions-chen-jin-tencent-self-2026.md) — 腾讯云陈进 Loop Engineering 解读

---

