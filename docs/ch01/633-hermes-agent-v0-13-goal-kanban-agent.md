# Hermes Agent v0.13 — /goal 目标管理与 Kanban 多 agent 协作

## Ch01.633 Hermes Agent v0.13 — /goal 目标管理与 Kanban 多 agent 协作

> 📊 Level ⭐⭐ | 7.1KB | `entities/hermes-agent-goal-and-kanban.md`

# Hermes Agent — /goal 目标管理与 Kanban 多 agent 协作
> Hermes Agent v0.13.0 的两个核心功能： `/goal` 目标管理和 `Kanban` 多 agent 团队协作。本教程来自「AI赋能说」，十分钟跑通。

## 核心功能
### /goal — 让单个 agent 自主跑目标
```
/goal 修复 tests/ 目录下所有失败的测试。每次只改一个文件，改完跑测试确认通过，全部通过后停止。
```

- 20-turn budget（可配置）
- 每轮结束裁判模型判断目标是否达成
- 支持 `/goal status | pause | resume | clear`
- 状态存在 session 数据库，重启后可 `/resume` 接上

### Kanban — 多 agent 团队协作
```
hermes kanban init
hermes gateway start    # 调度器嵌在 gateway 里
hermes kanban create "调研竞品A" --assignee researcher
hermes kanban create "汇总报告" --assignee writer --parent t_001
hermes kanban watch
```

- `--parent` 声明任务依赖（parent 全部 done 才启动 child）
- `--assignee` 对应本地配置的 profile（不同 profile 有不同 system prompt、工具集、记忆）
- 支持 26+ 平台接入（Telegram、Discord、Slack、WhatsApp 等）
- 内置 Dashboard（`hermes dashboard`，类似 Linear 界面）

## 常见坑
| 坑 | 原因 | 解法 |
|----|------|------|
| 裁判误判完成 | 目标写得太模糊 | 写具体可验证的指令，如 `ruff check src/ 零报错` |
| 任务静默失败 | `--assignee` 的 profile 不存在 | 先 `hermes kanban assignees` 确认 |
| 任务一直是 ready 不动 | Gateway 没启动 | 检查 `hermes gateway start` |
| macOS + Python 3.13 冲突 | 已知问题 | 用 pyenv 切到 3.12 |

## 深度分析
Hermes Agent v0.13 的 `/goal` 和 `Kanban` 代表了两种不同的 agent 自主性抽象：单个 agent 的有限自主（goal） vs 多 agent 团队的协调式自主（Kanban）。
**/goal 的设计哲学**：20-turn budget + 裁判模型判断构成一个"可审计的有限自主"单元。目标达成由独立裁判判断，而非 agent 自我评估——这避免了 agent 对自己的成果过度自信的问题，也使得目标定义本身成为关键瓶颈。坑#1（裁判误判）印证了这一点：模糊目标 → 裁判无法验证 → 任务失败或无限继续。这个模式的隐含假设是：人类比 agent 更清楚"目标完成"的标准，但人类的判断被延迟到了 20-turn 之后。
**Kanban 的依赖管理**：`--parent` 声明的 DAG 依赖是整个系统的核心价值。与 LangChain Agent 生态的 implicit dependency 不同，Hermes Kanban 强制要求父任务全部 done 才启动 child——这避免了 agent 生态常见的"依赖任务还没好就开始等结果"的问题，但也要求任务分解足够细致。`--assignee` 对应本地 profile 意味着每个 profile 有独立的 system prompt、工具集和记忆——这是多 agent 团队"角色化"的基础。
**Gateway 嵌入调度器的架构**：调度器嵌在 gateway 里意味着不需要额外部署消息中间件或 task queue。这降低了运维复杂度，但约束了 horizontal scaling——gateway 本身的 throughput 成为瓶颈。对于中小规模团队（<20 并发 agent）这不是问题；大规模团队需要评估 gateway 的横向扩展能力。

## 实践启示
- **目标撰写是核心竞争力**：与 AI coding 一样，/goal 的效果高度依赖目标描述的精确性。推荐格式：`[具体动作] + [可验证标准] + [停止条件]`，如 `ruff check src/ 零报错` 而非"检查代码质量问题"。
- **Profile 命名约定**：为不同角色（researcher/writer/coder/reviewer）预定义 profile，每个 profile 的 system prompt 应该明确其职责边界和输出格式。没有清晰的 profile 边界，Kanban 的 assignee 机制会退化为"随机分配"。
- **依赖拆分的粒度**：parent/child 链不宜过长（建议不超过 3 层），否则 DAG 可视化和进度追踪的复杂度会超过协作收益。对于复杂工作流，考虑在 Kanban 外部用专门的项目管理工具做顶层规划，Kanban 只管理可独立交付的 leaf 任务。
- **macOS + Python 3.13 坑**：用 pyenv 切换到 3.12 是已知问题的标准解法，但 CI/CD pipeline 中也需要同步指定 Python 版本——不要只在本地修复。
- **Gateway 高可用**：gateway 嵌在调度器里的设计意味着它是 single point of failure。对于生产环境，需要配置 gateway 的进程管理（systemd/supervisord）并设置健康检查，而非仅靠 terminal 启动。

## 安装
```bash
curl -fsSL https://raw.githubusercontent.com/NousResearch/hermes-agent/main/scripts/install.sh | bash
source ~/.zshrc
hermes setup    # 配置 LLM provider（推荐 OpenCode Go）
hermes doctor   # 检查环境
```

## 相关链接
- GitHub: https://github.com/NousResearch/hermes-agent
- 官方文档: https://hermes-agent.nousresearch.com/docs/
- Kanban 文档: https://hermes-agent.nousresearch.com/docs/user-guide/features/kanban

## Related

- `Hermes Agent Loop 架构`

## Related

## 相关实体
- [Hermes Agent Kanban Deep Test](../ch03/092-hermes-agent.html)
- [Hermes Agent Goal Runtime Architecture](../ch04/368-hermes-agent-goal.html)
- [Hermes Agent](../ch03/092-hermes-agent.html)
- [Hermes Agent Kanban Deep Test By Wjjagi 2026](../ch03/092-hermes-agent.html)
- [Hermes Agent Self Evolution Tengxun](../ch03/092-hermes-agent.html)

→ [原文存档](https://github.com/QianJinGuo/wiki-book/tree/main/docs/raw/articles/mattpocock-skills-grill-me-grill-with-docs-caveman.md)

## 第 2 来源 — 小红书奥森木：Kanban 调度系统深度拆解

[Hermes Agent 推出 Kanban 多 agent 调度](https://github.com/QianJinGuo/wiki-book/tree/main/docs/raw/articles/hermes-agent-kanban-xiaohongshu.md)

与 WeChat 教程的互补角度：
1. **6 列看板状态机** — Triage→Todo→Ready→In progress→Blocked→Done，完整生命周期
2. **5 核心对象模型** — task/run/assignee/dispatcher/tenant 的领域建模
3. **Worker 4 步循环协议** — 抓卡→show(worker_context)→heartbeat→complete/block，标准化的 Worker 契约
4. **Retry 一等公民** — task_runs 留档 + worker_context 继承上轮 reason，进程崩溃 dispatcher 自动重派
5. **结构化 Handoff** — summary + metadata 自动传递给下游 worker，无需翻文件
6. **原生熔断** — spawn 失败 3 次自动 gave_up

→ [原文存档](https://github.com/QianJinGuo/wiki-book/tree/main/docs/raw/articles/hermes-agent-kanban-xiaohongshu.md)

- `Self-Evolving Agent`

---

