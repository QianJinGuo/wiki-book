---
title: "我把 Karpathy 的 AutoResearch 搬到了软件开发领域，效果炸了"
source_url: "https://mp.weixin.qq.com/s/JFvYo9RCn9Xm8ilx1Chd6g"
ingested: 2026-04-30
type: raw
tags: [autoresearch, multi-agent, code-review, karpathy, software-engineering, automated-development, codex, claude-code]
review_value: 8
review_confidence: 8
review_recommendation: strong
review_stars: 4
sha256: "{pending}"
created: 2026-05-10
updated: 2026-05-10
---
# 原文存档：AutoResearch 迁移到软件开发
## 文章信息
- **作者**：鸟窝
- **项目地址**：https://github.com/smallnest/autoresearch
- **参考**：Karpathy AutoResearch（ML 研究自动化）、acpx（Agent 控制工具）、imclaw
## 背景：Karpathy AutoResearch 核心思想
给 AI Agent 一个真实的小型 LLM 训练环境（单 GPU，5 分钟训练预算），让它自主修改 train.py → 跑实验 → 检查结果，只有 val loss 改善时才 commit，否则 git revert 回滚。核心三点：①量化目标（val loss 是唯一判断标准）②自主循环 ③只保留改进（退化就回滚）。
## 本项目的三大关键改进
### 1. 多 Agent 交叉审核（替代单 Agent 自审）
Codex 和 Claude 轮流担任实现者和审核者——A 写完 B 审，B 写完 A 审。不同模型有不同的盲区和强项，交叉审核能发现单 Agent 发现不了的问题。实践证明单 Agent 效果远不如双 Agent 交叉审核。
### 2. 5 维度加权评分（替代单一 metric）
| 维度 | 权重 | 说明 |
|------|------|------|
| 功能正确性 | 35% | 最重要 |
| 测试充分性 | 25% | 其次 |
| 代码质量 | 20% | — |
| 安全性 | 10% | — |
| 性能 | 10% | — |
各维度得分：无问题 10 / 建议改进 9 / 一般问题 7 / 严重问题 4 / 致命问题 1。达标线：总分 ≥ 9.0 才合并。
### 3. 审核反馈驱动下一轮（替代盲循环）
审核反馈直接传入下一轮 Agent 的提示词，Agent 看到上一轮的具体问题后针对性改进，而非漫无目的地重试。
## 系统架构：4 个阶段
| 阶段 | 说明 |
|------|------|
| Phase 1 环境准备 | 检查依赖 (gh, acpx, go)、获取 Issue、创建分支 |
| Phase 2 迭代核心 | 多 Agent 轮流实现+审核、测试验证、评分判定（完全自主） |
| Phase 3 自动提交 | 评分达标后自动 commit + PR + 合并 |
| Phase 4 记录归档 | 写入 results.tsv 和 log.md |
### 迭代流程示例
```
迭代 1: Codex 审核(5.0) → Codex 实现 → 测试 → Claude 审核 → Claude 实现
迭代 2: Codex 审核(7.0) → Codex 实现 → 测试 → Claude 审核 → Claude 实现
迭代 3: Codex 审核(9.1) → 达标！→ 自动 PR + 合并 ✓
```
## 核心文件结构
```
autoresearch/
├── program.md          # 宪法：实现规则、权限边界、代码规范、质量标准
├── issue-selector.md   # Issue 选择策略
├── run.sh              # 编排引擎
├── agents/
│   ├── codex.md        # Codex 角色指令
│   ├── claude.md       # Claude 角色指令（审核者）
│   └── gemini.md       # Gemini 角色指令
└── workflows/
    └── issue-{n}/
        ├── log.md      # 总日志
        └── test-N.log  # 各轮测试结果
```
## program.md 权限边界示例
**Agent 可以**：修改 internal/、cmd/；创建/修改测试文件；运行测试和 lint；创建本地分支和 commit；在 workflows/ 记录日志
**Agent 不可以**：修改 go.mod, .github/, Makefile, CI/CD；删除现有文件；推送到远程仓库；修改 autoresearch/ 规则文件
## 实战结果
- Issue #21（中等复杂度）：3 轮迭代，约 10 分钟完成，评分 9.0/10
- Issue #15：2 轮迭代，评分 9.1/10
- Issue #6（高复杂度）：5 轮迭代，评分 15/10（Codex 和 Claude 均给出最高分）