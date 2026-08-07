# 面向 Coding Agent 的多仓库 Git Worktree

## Ch09.110 面向 Coding Agent 的多仓库 Git Worktree

> 📊 Level ⭐⭐ | 8.0KB | `entities/面向-coding-agent-的多仓库-git-worktree.md`

# 面向 Coding Agent 的多仓库 Git Worktree

**来源**: 百度Geek说
**作者**: 王伟、付笑
**发布日期**: 2026-07-27
**评分**: v=7 c=7 s=4 vxc=49

## 核心论点

百度 LLM Arena 平台采用 Git Submodule 管理多个代码仓库（多仓库架构）。将 Git worktree 应用于多仓库场景时，父仓库的 worktree 只创建主仓库工作目录，Submodule 仍需单独初始化并按 Gitlink 检出对应 commit。文章记录为多仓库场景设计面向 Coding Agent 的 worktree 工作流，处理子模块初始化、REQ-ID 编号冲突和多 Agent 编排等问题，最终沉淀出「推理与执行分离、优先复用已有约束、明确方案边界」三个原则。

## 多仓库 worktree 的目录结构与初始化

目标结构：每个需求一个独立 worktree（如 `versus-REQ-001/`、`versus-REQ-002/`），各自包含完整子模块（versus-server、versus-fe），可由不同 Coding Agent 并行操作。父仓库 worktree 有独立工作目录、独立索引和当前分支，共享父仓库 Git 对象库。

**子模块初始化**：在 worktree 中需执行 `git submodule sync --recursive` + `git submodule update --init --recursive`。手动执行繁琐；让 Coding Agent 临时推理生成步骤不仅消耗额外 token，还易因上下文差异产生不稳定行为。因此编写 `wt.sh` 脚本，将 worktree 创建、子模块初始化、端口分配和环境配置固化为确定性流程。

**Git Submodule 限制**：Git 官方文档指出多 worktree 场景下 Submodule 支持仍不完整，不推荐对 superproject 进行多重检出，方案需结合实际 Git 版本验证。

## wt.sh 设计：确定性流程固化

`wt.sh` 的核心设计目标：每个需求一个独立 worktree（代码任务真正并行互不干扰）、每个 worktree 分配独立端口（后端 9000+N / 前端 4000+N，接口测试可并行）、数据库共享 dev 不隔离、不改入库业务代码（端口与代理只在 worktree 内本地改 + assume-unchanged）、代码提交复用 commit.sh（百度 iCode Gerrit 评审流程）。

```bash
# wt.sh 用法
./scripts/wt.sh new <id>                    # 创建 worktree (id 如 req-030 / REQ-030 / 030)
./scripts/wt.sh list                        # 列出所有 worktree + 端口 + 状态
./scripts/wt.sh go <id>                     # 切换到 worktree
./scripts/wt.sh remove <id> [--keep-branch] # 删除 worktree
./scripts/wt.sh info <id>                   # 查看单个 worktree 详情
./scripts/wt.sh current                     # 查看当前目录属于哪个 worktree
```

## worktree-manager Agent：Agent 化封装

在原有 Harness 闭环（6 个 Sub-Agent 实现需求开发）中新增 `worktree-manager` Agent，在 requirement-designer 之前触发，确保每个需求获得独立 Git Worktree + 独立端口和运行时环境。本质是 wt.sh 的 Agent 化封装：**Agent 负责理解意图和编排步骤，脚本负责执行确定性的底层操作**。REQ-ID 生成从需求设计阶段前移到 worktree 创建阶段。

## REQ-ID 冲突：复用 Git 互斥而非自建锁

两个 Session 进入不同 worktree 却生成相同 REQ-ID（都读到 `REQ-30` 为最新，都计算 `REQ-31`）——典型的并发竞争，与数据库「丢失更新」问题同构。解决思路：**复用 Git 已有的互斥保护**，不另外实现一套锁：
- 所有 worktree 共享同一 Git 引用空间
- `git worktree add -b <branch>` 创建新分支；分支已存在则默认失败
- Git 默认禁止同一本地分支被多个 worktree 同时检出

实现：让 REQ-ID 参与分支命名，把创建 `feat/<REQ-ID>` 分支作为编号预占操作。即使两个进程计算出相同 REQ-ID，也只有一个能成功创建分支；失败一方重新扫描分配新编号。同时 `wt.sh` 在主仓库 `.wt` 目录记录已分配 REQ-ID（注册表，.gitignore 已忽略），分配前先扫描元数据再尝试 Git 分支创建完成最终确认。

**方案边界**：这套互斥机制依赖同一份本地 Git 引用空间，只能解决同一台机器、同一父仓库的并发分配。多工程师跨机器并行开发时本地分支无法形成全局互斥——需改用中心化服务、数据库唯一约束或远程原子引用等全局协调机制。

## /teamwork-preview：Skill 封装的多 Agent 工作流

最初 7 个 Sub-Agent 的编排规则都定义在 `versus/CLAUDE.md`，每次启动要重复输入相同指令。受 Google Antigravity Agent Teams（7 月 14 日 `/teamwork-preview` 演示）启发，实现 `/teamwork-preview`：用一条稳定指令启动完整协作流程，将 CLAUDE.md 中的编排规则迁移到 Skill 中集中管理。

```text
用户: "开启 7 个 Agent 协作实现 XXX 需求"
▼ [0] worktree-manager → 创建隔离 worktree + 分配端口
▼ [1] requirement-designer → 产出 PRD.md + 分配需求 ID（人工审核）
▼ [2] go-api-implementer → 产出 Go 代码 + api-summary.md
▼ [3] frontend-engineer → 产出 React 代码
▼ [4] test-case-designer → 产出 api-test-cases.json + e2e-test-cases.json
▼ [5] integration-test-runner (worktree端口) / [6] e2e-test-executor (worktree端口+1)
     → has_bugs: Bug 修复循环 | all_passed: 流水线完成
```

本质：基于 Skill 编排 Sub-Agent 的工作流——Skill 组织领域知识和操作流程降低重复上下文成本、外部状态文件记录执行进度增强恢复能力、管理类 Skill 编排工作流 + 能力类 Skill 增强各个 Sub-Agent。

## 三个原则与启示

Coding Agent 提升代码生成和任务执行速度，却不会让并发竞争、状态一致性和资源隔离等经典工程问题自动消失；Agent 越多、并行度越高，问题越容易暴露。沉淀出的三个原则：
1. **将推理与执行分离**——Agent 负责理解需求和编排流程，脚本负责执行可重复、可验证的底层操作
2. **优先复用已有约束**——使用 Git 分支创建的失败保护完成本地互斥，比另行维护脆弱的锁机制更简单
3. **明确方案边界**——本地 Git 引用只能协调单机并发；跨机器场景需要真正的全局协调机制

「AI 可以替我们完成更多操作，但不能替我们理解系统。恰恰因为开发速度更快、并行规模更大，我们更需要掌握底层原理，并用清晰的架构约束 Agent 的行为。」

## 相关实体

- [Codex Goal Agent](../ch04/162-codex-goal-agent.html) — Coding Agent 运行时
- [Claude Code Agentic Harness 设计模式](../ch03/074-claude-code-agent.html) — Sub-Agent 编排体系
- [端到端 CodingAgent 设计](../ch04/030-codingagent.html) — 另一团队 CodingAgent 工程化
- [Harness Engineering 范式](https://github.com/QianJinGuo/wiki/blob/main/concepts/agent-harness-engineering-paradigm.md) — 驾驭工程约束 Agent 行为
- [Agent 编排模式](https://github.com/QianJinGuo/wiki/blob/main/concepts/agent-orchestration-patterns.md)
- [SDD 规格驱动开发](https://github.com/QianJinGuo/wiki/blob/main/concepts/sdd-specification-driven-development-harness.md) — 需求 ID 分配与流程编排参照
- [Agent 部署策略](https://github.com/QianJinGuo/wiki/blob/main/concepts/agent-deployment-strategy.md)

→ [原文存档](https://github.com/QianJinGuo/wiki-book/tree/main/docs/raw/articles/面向-coding-agent-的多仓库-git-worktree.md)

---

