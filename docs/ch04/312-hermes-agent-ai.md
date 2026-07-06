# Hermes Agent 保姆级教程：一句话组建你的 AI 打工团队

## Ch04.312 Hermes Agent 保姆级教程：一句话组建你的 AI 打工团队

> 📊 Level ⭐⭐ | 8.5KB | `entities/hermes-agent-getting-started-guide-2026.md`

## 你能做到什么
- 用一句话设定目标，让 Hermes 自己跑到完成
- 用三行命令，组一个多 agent 小团队并行干活
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
`--parent` 告诉调度器：writer 任务要等两个 researcher 都完成才启动。

## 阶段四：进阶玩法

**第九步：在手机上指挥（可选）**
支持 Telegram、Discord、Slack、WhatsApp 等 26+ 平台。

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

## 深度分析

**1. 任务分片与受限循环机制是 Hermes 的核心创新**
传统的 LLM agent 在复杂任务中容易陷入过早终止或无限循环。Hermes 通过 20-turn budget 的 `/goal` 机制强制任务分片，每次只改一个文件、改完验证再继续。这种「受限迭代」设计将 agent 的自主性与系统边界进行显式绑定，从根本上降低了失败成本。

**2. 项目上下文文件（.hermes.md）构建了本地知识边界**
与通用 API 调用不同，Hermes 在本地项目目录中运行，自动读取 `.hermes.md`、`AGENTS.md` 等项目级上下文文件。这意味着 agent 的行为约束不是来自系统 prompt，而是来自项目自身定义的操作约定（如测试命令、代码风格检查命令）。这是本地 agent 框架区别于云端 API 调用的关键架构差异。

**3. Kanban + Gateway 模式将多 agent 协作工程化**
通过 `--parent` 依赖链和 `--assignee` 角色分配，Hermes 将多 agent 协作从「几个 agent 发消息」提升到任务调度层面。Gateway 作为调度器嵌入，支持任务状态的实时监控和干预。这种模式本质上是一个轻量级的分布式任务队列，特别适合需要研究调研、并行实验的工程团队。

**4. 裁判模型误判是当前所有 agent 系统的根本性挑战**
教程专门用一节讲「容易踩的坑」，其中最核心的问题是：裁判模型（judge model）会错误判断任务是否完成，导致 agent 过早停止或循环。解决方案是目标描述必须可验证（零报错优于「优化」类模糊描述）。这说明当前 LLM 的自我评估能力仍是 agent 可靠性的主要瓶颈。

**5. 平台无关的设计理念降低了 agent 系统的锁定风险**
从 WSL2/Linux/macOS 到 26+ 消息平台，Hermes 的跨平台支持意味着团队可以在不改变核心逻辑的前提下切换底层运行环境和通信渠道。这对于需要在不同组织安全策略下部署 agent 的团队尤为重要。

## 实践启示

1. **为每个项目编写 `.hermes.md`，定义可验证的操作约定**：将测试命令（`pytest tests/`）、代码检查命令（`ruff check src/`）写入 `.hermes.md`，使 agent 的每一步操作都有可验证的退出条件，从源头减少裁判模型误判的概率。

2. **用 Kanban 的 `--parent` 依赖链编排多 agent 工作流**：当团队需要并行研究多个方向再汇总时，先创建多个 `researcher` 任务，再用 `--parent` 指向它们的输出任务，Gateway 会自动阻塞汇总任务直到所有依赖完成，实现真正的自动化流水线。

3. **优先使用 `hermes kanban watch` 而非轮询**：实时监控任务状态变化可以及时发现 agent 陷入无效循环的早期信号，比等待任务完成后发现失败的成本低得多。

4. **在 CI 流程中集成 `/goal` 状态检查**：将 `hermes goal status` 的输出作为 CI step，可以将 agent 的修复结果与自动化测试流程打通，实现「agent 修 bug → 自动验证」的闭环。

5. **关注 profile 配置的正确性**：在创建 kanban 任务前先用 `hermes kanban assignees` 确认所有 profile 已配置，避免静默失败。profile 是 agent 执行权限和模型偏好的载体，配置错误是最隐蔽的失败模式。

## 相关实体
- [Hermes Agent Deep Dive Alibaba](ch03/045-agent.md)
- [Llm Agent脚手架如何具备自进化能力以Hermes Agent为例](ch03/045-agent.md)
- [Hermes Agent Kanban Deep Test By Wjjagi 2026](ch01/216-0.md)
- [Hermes Agent Goal Runtime Architecture State Persistence Judge Closed Loop](ch03/045-agent.md)
- [我用 Skillmd 做了一个简历生成器](ch04/258-skill.md)

→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/hermes-agent-getting-started-guide-2026.md)

---

