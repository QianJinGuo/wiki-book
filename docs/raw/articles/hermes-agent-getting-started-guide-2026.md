---
source_url: https://mp.weixin.qq.com/s/2b5ZO-zScsU5EJK3v7ynLw
tags: [wechat, article, claude, openai, gpt, agent, harness, openclaw]
title: "Hermes Agent 保姆级教程：一句话组建你的 AI 打工团队"
author: AI赋能说
published: 2026-05-17
platform: WeChat
ingested: 2026-05-20
review_value: 4
review_confidence: 9
review_recommendation: worth-reading
review_stars: 3
sha256: 4f54d019152e06f11f71fb090cefbe1b3ee5e4059fc4e282ab474836ee69a21c
---
---
# Hermes Agent 保姆级教程：一句话组建你的 AI 打工团队
## 你能做到什么
- 用一句话设定目标，让 Hermes 自己跑到完成
- 用三行命令，组一个多 agent 小团队并行干活
## 前提条件
- macOS 或 Linux（Windows 用 WSL2）
- 一个 LLM provider 的 API key（推荐 OpenCode Go，$5/月起）
## 阶段一：装好 Hermes
**第一步：一行命令安装**
```bash
curl -fsSL https://raw.githubusercontent.com/NousResearch/hermes-agent/main/scripts/install.sh | bash
source ~/.zshrc   # 或 source ~/.bashrc
```
**第二步：配置 provider**
```bash
hermes setup     # 选 opencode-go 或你喜欢的 provider
hermes doctor    # 检查环境是否正常
```
验证：`hermes --version` 看到 v0.13.x 就装对了。
## 阶段二：用 /goal 让 agent 自己跑
**第三步：进入你的项目**
```bash
cd /path/to/your/repo
hermes
```
Hermes 自动读取项目里的 `.hermes.md`、`AGENTS.md`、`CLAUDE.md` 或 `.cursorrules`。
`.hermes.md` 示例：
```markdown
# 项目约定
- 测试命令：pytest tests/
- 代码风格：black + ruff
- 修 bug 时先跑测试确认问题，再改代码
```
**第四步：设定目标**
```
/goal 修复 tests/ 目录下所有失败的测试。每次只改一个文件，改完跑测试确认通过，全部通过后停止。
```
回车后看到：`⊙ Goal set (20-turn budget): 修复 tests/ 目录下所有失败的测试...`
**第五步：观察和干预**
- `/goal status` — 看状态
- `/goal pause` — 暂停
- `/goal resume` — 继续
- `/goal clear` — 放弃
验证：看到 `✓ Goal achieved` 或 `⏸ Goal paused` 就跑通了。
## 阶段三：用 Kanban 组多 agent 团队
**第六步：初始化看板**
```bash
hermes kanban init
hermes gateway start   # 调度器嵌在 gateway 里
```
**第七步：创建任务，分配角色**
```bash
hermes kanban create "调研竞品A的定价策略" --assignee researcher
hermes kanban create "调研竞品B的定价策略" --assignee researcher
hermes kanban create "汇总两份调研，写一页定价建议" \
  --assignee writer \
  --parent t_001 \
  --parent t_002
```
`--parent` 告诉调度器：writer 任务要等两个 researcher 都完成才启动。`--assignee` 对应本地配置的 profile 名字。
**第八步：看它跑**
```bash
hermes kanban watch    # 实时看任务状态变化
hermes kanban list     # 整体列表
hermes kanban stats    # 统计
```
## 阶段四：进阶玩法
**第九步：在手机上指挥（可选）**
支持 Telegram、Discord、Slack、WhatsApp 等 26+ 平台：
```
/kanban create "写周报" --assignee writer
/kanban list
/goal 把 README 翻译成中文
```
**第十步：打开 Dashboard**
```bash
hermes dashboard
```
浏览器打开，类似 Linear 的看板界面，拖拽卡片改状态。
## 容易踩的坑
| 坑 | 解法 |
|----|------|
| 裁判模型误判「已完成」 | 目标写具体，如「让 ruff check src/ 零报错」，别写「优化代码」 |
| profile 不存在导致静默失败 | 先跑 `hermes kanban assignees` 确认有该 profile |
| macOS + Python 3.13 安装冲突 | 用 pyenv 切到 3.12 |
| Gateway 没启动，任务一直是 ready | 检查 `hermes gateway start` 是否在跑 |
| 关掉终端目标丢了 | 不会丢，`/goal` 状态存在 session 数据库里，`/resume` 可接上 |
## 参考资料
- Hermes Agent GitHub: https://github.com/NousResearch/hermes-agent
- Hermes Agent 官方文档: https://hermes-agent.nousresearch.com/docs/
- Kanban 官方文档: https://hermes-agent.nousresearch.com/docs/user-guide/features/kanban
- OpenCode Go: https://opencode.ai/docs/go/