# Claude Code Agent View

## Ch09.001 Claude Code Agent View

> 📊 Level ⭐ | 7.8KB | `entities/claude-code-agent-view.md`

> -> [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/claude-code-agent-view-huashu.md)

# Claude Code Agent View
**Agent View** 是 Anthropic 在 Claude Code v2.1.139 中推出的多 Agent 可视化面板，被其工程 lead Thariq 称为「给 Claude Code 的 tmux」。它解决的不是 AI 能力问题，而是**人类在多 Agent 工作流中的注意力分配问题**——当同时运行 N 个 Claude Code 实例时，人的调度能力成为瓶颈。[^1]

## 核心设计
### 三层架构
Claude Code 中有三个易混淆但本质不同的概念：[^1]

- **Subagent** — 单个 session 内，主 agent 派出的临时助手（服务于 AI 自身）
- **Agent Team** — 单个 session 内的固定协作小组，Leader + Teammates（服务于 AI 自身）
- **Agent View** — 跨多个独立 Claude 实例的可视化面板（服务于**人类**）

### 关键能力
| 功能 | 命令 |  
|------|------|  
| 打开 Agent View | `claude agents` 或按← |  
| 后台启动任务 | `claude --bg "task"` 或 `/bg` |  
| 后台会话持久化 | 关终端继续跑；重启后 `claude respawn --all` |  

### 四个关键技术细节[^1]
1. **会话-终端解耦**：后台 Cloude 由常驻监工程序管理，不受终端窗口生命周期影响  
2. **Git Worktree 隔离**：每个后台 agent 自动分配到独立 `.claude/worktrees/<会话名>/`，N 个 agent 同时改同一仓库不会冲突  
3. **AI 驱动的状态摘要**：面板上每行状态描述由 **Haiku**（Anthropic 最小模型）每 15 秒重新生成，而非简单规则输出  
4. **/loop 集成**：后台会话支持按 schedule 自迭代，带 ✢ 图标标识  

## 与 Hermes 的关联
Agent View 解决的问题域与 Hermes 的 [Agent 编排](../ch04-418-hermes-agent/) 高度相关：  

- Hermes 通过 wiki-pipeline 编排多个 agent 协作
- Agent View 的 worktree 隔离方案是 Agent Harness 中多 agent 并行的参考模式
- 状态摘要的 AI 化（Haiku 每 15s 刷新）可启发 Hermes 的 cron 任务进度报告机制

## 深度分析
### 多 Agent 协作的注意力经济学
花叔在文中揭示了一个核心矛盾：**AI 派任务的边际成本趋近于零，但人类 review 任务的边际成本不是。** 这正是 Agent View 试图解决的本质问题。当 38 个项目、606 个会话并行运转时，调度者成为系统瓶颈。Anthropic 内部 Boris Cherny 需要管理 5 个终端 tab、5-10 个浏览器 session 加移动端——这不是个人管理能力问题，而是人机协作界面的设计问题。 

### 平台化的必然性：Sherlocking 时刻
Agent View 上线前第三方社区已有一批多 Agent 管理工具（ Crystal、claude-squad、Vibe Kanban 等），Anthropic 选择产品化而非收购或合作，说明：  
1. 多 Agent 调度是核心竞争力，必须官方掌控  
2. 第三方工具能跨 vendor（同时管 Claude Code + Codex + Gemini），官方版本只需专注单一生态绑定  
3. 这是典型的平台「Sherlocking」——但凡有长期价值的功能，平台终将纳入官方版本  

### 三层架构的认知价值
花叔在文中清晰地区分了 Subagent、Agent Team、Agent View 三层概念，这个划分的价值在于**服务对象不同**：  

- Subagent 和 Agent Team 是 AI 内部的并行优化，服务 AI 自身
- Agent View 是人类的多路复用面板，服务操作者
这个分层思维可以迁移到 Hermes：如果 Hermes 未来有多 Agent 协作需求，应该区分 AI 内并行（类似 Subagent）和人类可观察的多实例管理（类似 Agent View），而非混为一体。 

### Worktree 隔离的工程哲学
每个后台 agent 独立 Git Worktree 的设计，本质是用文件系统级隔离替代进程级隔离。这解决了多 Agent 同时操作同一代码库时的冲突问题，但也带来「主目录看不到产物」的认知障碍。这个trade-off的启示：**隔离越强，协作越难感知**。对于需要紧密协作的任务（如代码审查、调试），过度隔离反而增加认知负担。 

## 实践启示
### 对个人用户
- **单 session 用户**：先用 `claude --bg` 将长任务丢后台，通过 `←` 查看面板感受多路管理
- **多窗口用户**：将手开的多个窗口迁移到 `claude agents` 统一管理，最大收益是 Worktree 隔离带来的并行安全性

### 对工具设计者
- **任务调度边界**：AI 派任务无成本，但人类 review 有成本。设计多 Agent 系统时，需考虑人类的注意力带宽，而非仅优化 AI 并行度
- **状态可视化**：Haiku 每 15 秒刷新的 AI 驱动摘要比静态状态更智能，但也意味着面板本身有延迟——实时性要求高的场景需注意
- **隔离策略**：Worktree 隔离适合独立任务，但紧密协作场景需提供 merge 或 cross-talk 机制

### 对生态观察者
- **平台化信号**：Agent View 的官方化是明确信号——多 Agent 工作流管理已从极客玩票进入主流工程实践
- **跨 vendor 工具的窗口期**：官方方案只管 Claude Code，第三方跨 vendor 工具仍有存在价值，尤其在多生态并行的工作场景

## 参考来源
[^1]: 花叔. *Claude Code 发布 Agent View，多任务流的 ADHD 患者有救了*. 微信公众号, 2026-05-12. [raw](../ch09-001-claude-code-agent-view/)

- 官方博客: https://claude.com/blog/agent-view-in-claude-code
- Release v2.1.139: https://github.com/anthropics/claude-code/releases/tag/v2.1.139

## 相关实体
- [Claude Code Agent 工程设计](../ch04-015-claude-code-的-agent-工程/)
- [深入理解 Claude Code 源码中的 Agent Harness 构建之道](../ch01-170-深入理解-claude-code-源码中的-agent-harness-构建之道/)
- [imclaw通过微信飞书操控claude-code-coodex-gemini-clipi-agent蜂群](../ch01-328-imclaw-通过微信-飞书操控claudecode-codex-geminicli-pi-agent蜂群/)
- Claude Code vs OpenClaw Agent 记忆系统对比
- [开源 AI 知识管理搭档 Obsidian + Claude Code 完整集成指南](../ch03-076-开源-ai-知识管理搭档-obsidian-claude-code-完整集成指南/)
- [CLAUDE.md 12 条规则：Karpathy 扩展模板](../ch09-039-claude-md-12-条规则-karpathy-扩展模板/)
- [Cat Wu — Anthropic Claude Code/Cowork产品负责人](../ch03-013-cat-wu-anthropic-claude-code-cowork产品负责人/)
- Claude Code 工具设计演化
- [AutoResearch：多 Agent 自动化软件开发](../ch09-030-autoresearch-多-agent-自动化软件开发/)
- [Claude Opus 4.7 发布分析](../ch01-314-claude-opus-4-7-发布分析/)
- [Anthropic 官方技能最佳实践：14 个可复用的 Agent Skills 设计模式](../ch04-084-anthropic-官方技能最佳实践-14-个可复用的-agent-skills-设计模式/)
- [AI Agent工具数量陷阱——5个边界清楚的工具胜过20个模糊工具](../ch04-243-ai-agent工具数量陷阱-5个边界清楚的工具胜过20个模糊工具/)
- [Anthropic发布「AI原生创业公司」手册：涵盖全流程四大核心阶段，一人公司法典来了](../ch01-354-anthropic发布-ai原生创业公司-手册-涵盖全流程四大核心阶段-一人公司法典来了/)
- [Claude Code 大型代码库最佳实践 — Anthropic 企业级部署指南](../ch09-053-claude-code-大型代码库最佳实践-anthropic-企业级部署指南/)
- [Boris Cherny 新访谈：开发工具正在从 IDE 变成 Agent 控制台](../ch04-086-boris-cherny-新访谈-开发工具正在从-ide-变成-agent-控制台/)
- [Claude 发布官方报告，承认存在 3 处质量退化问题](../ch01-375-claude-发布官方报告-承认存在-3-处质量退化问题/)

→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/xero-announces-integration-with-anthropics-claude.md)
- [2026年最值得关注的15款开发者工具深度解读](../ch01-001-2026年最值得关注的15款开发者工具深度解读/)
- MOC

---

