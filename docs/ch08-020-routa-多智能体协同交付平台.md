## Ch08.020 Routa 多智能体协同交付平台

> 📊 Level ⭐⭐⭐ | 6.9KB | `entities/routa-multi-agent-coordination-platform.md`

## 核心理念
"单一 Agent 聊天适合处理孤立任务，但一旦同一条线程同时承担拆解、实现、评审、证据收集和发布决策，语义边界就会迅速混乱。"
**解决方案**：让软件交付链路显式化，每个角色干自己的活。

## 三层架构
1. **Planning**（规划层）
2. **Execution**（执行层）
3. **Verification**（验证层）

## Kanban 六列
- **Backlog** → Refiner 改写需求为 YAML story
- **Todo** → Orchestrator 验证可执行性
- **Dev** → Crafter 实现+验证+提交
- **Review** → Guard 独立验证
- **Done** → Reporter 总结交付
- **Blocked** → Resolver 处理阻塞

## 专业化 Agents
| Agent | 职责 |
|-------|------|
| Backlog Refiner | 将粗糙需求改写为结构化YAML，包含acceptance criteria、INVEST检查 |
| Todo Orchestrator | 重新解析YAML，不合格则退回 |
| Dev Crafter | 实现、验证、提交、写Dev Evidence |
| Review Guard | 独立验证每条acceptance criteria |
| Done Reporter | 留下completion summary |
| Blocked Resolver | 处理依赖/环境/需求歧义导致的阻塞 |

## Review Gate 三层验证
1. **Code Analysis**（代码分析）
2. **Test Verification**（测试验证）
3. **Specification Compliance**（规格合规）

## Entrix 验证引擎
- Rust 编写（`crates/harness-monitor/`）
- 定义 fitness rules（文件行数、测试存在性、代码模式）
- 支持 dry-run 和多 tier 运行
```bash
cargo build -p entrix
entrix run --tier fast
entrix run --tier normal
```

## 深度分析
**从痛点出发理解 Routa 的设计动机**：
当前大多数 Coding Agent 产品（如 Claude Code、Codex）解决的是"需求翻译成代码"这前半段问题，但软件交付远不止翻译这一个环节。真实需求需要经历拆解、确认边界、明确验收标准、实现、复核、上线确认，这条链路，单个 Agent 在单条聊天线程里根本无法承担。
phodal 在 README 中指出的核心矛盾：「单一 Agent 聊天适合处理孤立任务，但一旦同一条线程同时承担拆解、实现、评审、证据收集和发布决策，语义边界就会迅速混乱。」这个观察直接催生了 Routa 的设计哲学——**让软件交付链路显式化，每个角色干自己的活**。
**Kanban 范式对 Agent 协作的深层意义**：
Routa 选择 Kanban 而非线性流水线是有深意的。Kanban 的可视化板不仅展示了"做什么"，更重要的是展示了"在哪卡住了"。六列（Backlog → Todo → Dev → Review → Done → Blocked）天然提供了状态可视化和阻塞检测能力。Dev Crafter 完成后进入 Review Guard，如果被阻塞在 Review 阶段，Blocked Resolver 可以精准介入而不是让整个流程停摆。
更重要的是，卡片本身会随流转逐渐严格化：Backlog 产出 YAML story，Todo 补上 execution brief，Dev 追加 Evidence，Review 加上 Findings，Done 写 summary。信息逐层累积，形成完整的证据链，而不是在一条聊天记录里反复拉扯。
**Entrix 验证引擎的设计理念**：
Review Gate 不是靠 AI 喊"LGTM"，而是通过 Rust 编写的 Entrix 验证引擎，依据明确的 fitness rules 判定。fitness rules 可以定义：文件行数上限、测试存在性要求、禁止代码模式等。这种规则驱动的方式避免了 AI 评审的主观性，为自动化交付提供了客观基准。
**技术架构的统一性**：
Web 端（Next.js 16.2）和桌面端（Tauri + Rust Axum）共享同一套 `api-contract.yaml` 定义的语义边界（workspace、session、task、trace、codebase、worktree、review），确保两端行为一致。Rust crates 分层（routa-core、routa-server、routa-cli、harness-monitor）提供了清晰的责任边界和可扩展性。

## 实践启示
**1. 复杂软件交付场景应显式建模角色职责**：当任务涉及需求分析、实现、评审、发布等多个环节时，单一 Agent 聊天窗口会因语义边界混乱而失效。应将交付链路显式化，让每个 Agent 专注单一角色。
**2. Kanban 范式可有效解决 Agent 状态追踪问题**：相比线性流水线，Kanban 的列状态天然适合追踪多 Agent 协作中的进度和阻塞。结合 Blocked Resolver 角色，可以实现"发现阻塞 → 诊断原因 → 路由到正确泳道"的闭环。
**3. 证据链驱动的 Review 比 AI 主观评审更可靠**：在代码评审中定义明确的 fitness rules（文件行数、测试存在性、代码模式），并通过自动化工具验证，比 AI 生成的"LGTM"更有可重复性和可审计性。
**4. 上下文信息应随任务流转逐层累积**：卡片从 YAML story → execution brief → Evidence → Findings → summary 的演化过程，本质上是将散落在对话记录里的信息结构化沉淀，便于追溯和审计。
**5. 多端一致性需要统一语义边界**：Web 和桌面端共享 `api-contract.yaml` 定义的核心概念，确保不同入口的行为语义一致，这是构建可信 Agent 平台的基础。

## 与现有知识的链接
- → Routa Harness 可视化 — 旧版 harness 可视化方向
- → Harness Context — 多 Agent 协作的上下文管理
- → [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/routa-multi-agent-coordination-platform.md)

---
