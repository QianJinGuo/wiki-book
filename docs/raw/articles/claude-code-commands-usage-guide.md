---
title: claude-code-commands-usage-guide
source_url: https://mp.weixin.qq.com/s/derfnFDP1ZOP6KZx55bUdA
publish_date: 2026-04-30
tags: [wechat, article, claude, agent]
review_value: 7
review_confidence: 7
review_recommendation: neutral
sha256: c0d6599b2a81c27fe626b7480bafa5600aa78100125bf7bc18b0d9f534bf2d31
---
## 五大类命令
### 第一类：会话与上下文管理
- `clear`：彻底清空，重新开始（不适合日常整理，适合"重开一局"）
- `compact`：压缩上下文，保留主线清理包袱（比 clear 更该高频使用）
- `context`：可视化查看上下文使用情况，决定要不要收拾
- `resume`：恢复之前的会话，减少重复铺垫
- `rewind`：回退到之前的节点，精细化回退而非全盘重开
- `recap`：生成当前会话的一句话摘要，阶段性收口
### 第二类：模型、推理强度与成本
- `model`：判断任务类型——执行型优先效率，判断型优先能力
- `effort`：任务明确就收低，复杂再往上拨（不是越高越好）
- `status`：确认当前状态（版本/模型/账号/连接）
- `cost` / `stats`：建立成本感，看 Token 使用结构、时间维度、代码改动量、活动分布
### 第三类：权限、安全与排障
- `permissions`：管理 allow/ask/deny 三类规则，deny 优先级最高
- `auto mode`：运行时尽量少打断，不替代 permissions 静态边界
- `doctor`：诊断安装和配置状态，"先体检再排障"
- `debug`：开启调试日志，把问题卡在哪一层看清楚
- `sandbox`：减少低价值确认，同时保留执行边界（适合项目目录内排查）
- `security-review`：涉及权限、数据、文件、外部输入时补一轮安全检查
- `fewer-permission-prompts`：基于历史使用记录，把低风险高频确认沉淀成 allowlist
### 第四类：扩展能力
- `memory`：只放长期稳定信息，不要当会话垃圾桶
- `skills`：把重复流程沉淀成可复用命令（CLAUDE.md 放事实，skills 放流程）
- `agents`：拆出专门角色（code-reviewer/debugger/test-writer），主会话变协调者
- `hooks`：把固定动作自动化（格式化了/测试/危险命令拦截）
- `mcp`：没有好用的官方 CLI 但有 API 时考虑；优先 CLI + skill
- `schedule`：把低风险重复性检查变成 routine（先从读/查/汇总开始）
### 第五类：高阶效率和工作流
- `batch`：大规模可拆分的代码改造（并行交后台 agent，独立 git worktree）
- `simplify`：功能做完后的代码收口（复用/质量/效率问题）
- `loop`：持续盯一件事（等部署/CI/日志），优先用于"看"和"查"
- `autofix-pr`：监听 PR，CI 失败或 reviewer 评论时自动推送修复
- `team-onboarding`：根据使用历史生成团队上手指南初稿
- `powerup`：交互式小课程，快速学习新功能
- `release-notes`：直接在 Claude Code 里看版本更新
## 速查表
| 场景 | 优先命令 |
|------|---------|
| 会话聊乱了 | `context` → `compact` → `clear` |
| 想继续上次任务 | `resume` |
| Claude Code 又慢又贵 | `model`、`effort`、`cost`、`stats` |
| 权限弹窗太多 | `permissions`、`fewer-permission-prompts` |
| 刚配置完不好使 | `doctor` |
| 工具调用失败 | `debug` |
| 涉及权限/数据/文件 | `security-review` |
| 想沉淀项目规则 | `memory` |
| 想沉淀重复流程 | `skills` |
| 把固定动作自动化 | `hooks` |
| 批量大规模改造 | `batch` |
| PR 后续反馈明确 | `autofix-pr` |
| 团队推广 | `team-onboarding` |
## 分阶段优先级
**第一优先级（直接影响日常体验）**：`compact`、`permissions`、`model`、`effort`
**第二优先级（有反馈地使用）**：`context`、`stats`、`cost`、`doctor`、`debug`
**第三优先级（用深）**：`skills`、`hooks`、`agents`、`sandbox`
**第四优先级（看场景）**：`mcp`、`schedule`、`batch`、`autofix-pr`