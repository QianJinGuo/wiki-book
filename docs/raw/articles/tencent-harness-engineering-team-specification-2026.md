---
source_url: "https://mp.weixin.qq.com/s/g4nTfxm7ebzRwkAVIGdIbg"
source_author: "atreusliu"
source_title: "驾驭AI Coding：一份面向团队的Harness Engineering落地规范"
source_date: "2026-07-17"
source_publication: "腾讯技术工程"
ingested: "2026-07-17"
sha256: "3ed66a06c8a350402aa01a1b2d5abb0866b79414bef93f10fb7984d8315aebed"
---

腾讯技术工程 atreusliu 发布面向团队的 Harness Engineering 完整落地规范，涵盖理念、架构、实施路线图、详细配置步骤与 SOP。

## 核心理念

Agent = Model + Harness。模型提供智能，Harness 让智能变成生产力。LLM 本身没有状态、没有工具、没有记忆，Harness 层就是给模型装上"手脚和记忆"的工程基础设施。

## Harness 6 大支柱

### 1. 上下文管理（Context Architecture）
解决 AI 在对的时间看到对的信息。实践工具：AGENTS.md（渐进式披露~100行目录文件）、Spec .md 文件（需求/任务文档进 Git）、changes/ 目录（Proposals 机制隔离变更）、Skills 按需加载、知识库挂载（iWiki/代码库/自定义文件）、AI Wiki（代码库自动生成结构化知识）。

原则：别给 AI 一个几千行的规范文件，建分层索引，让 AI 按需深入。OpenAI 踩过坑：早期试过"一个巨大的 AGENTS.md"，失败了。

### 2. 工具系统（Tool System）
三部分组成：MCP（连接外部世界：DB/Knowledge Base/API/运维 MCP）、Skills（封装专家经验：工具接入类/代码生成类/元技能类/搜索发现类）、知识库（注入业务上下文：iWiki/代码库/AI Wiki/自定义文件）。

核心比喻：MCP 是开门的钥匙，Skills 是开门后做的事情，知识库是进门前读的说明书。三者缺一不可。

### 3. 执行编排与多 Agent 协作（Execution Orchestration）
"3+1 Phase" 标准化工作流：
- Phase 1 计划：Planner 角色，Plan 模式生成 requirements.md → 人工审核 → 创建 task.md
- Phase 2 编码：Generator 角色，加载 Rules+Skills 实现代码
- Phase 3 交付：Evaluator 角色，自动规范合规检查 + 代码逻辑审查
- Phase 4 沉淀：Archiver 角色，Spec 归档，更新知识库

四类 Agent 角色：Planner / Generator / Evaluator / Archiver。

### 4. 状态与记忆（State & Memory）
短期记忆=会话上下文，中期记忆=Memories 功能（跨会话持久化），长期记忆=Git 仓库 Spec 文件，变更记忆=Spec Deltas（changes/ 目录）。

### 5. 评估与观测（Evaluation & Observability）
四层评估：L1 语法（编译/Lint）→ L2 逻辑（单元测试）→ L3 规范（Rules 约束）→ L4 架构（人工+AI 联合审查）。引入 AI 代码审查（CR）作为合入前质量把关。

### 6. 约束与恢复（Guardrails & Recovery）
三级约束：硬性红线（Rules，不可违反）→ 软性约束（Skills，推荐遵循）→ 安全策略（Safety 兜底保护）。所有变更通过 Git 管理随时可回滚。

## AI Coding 一体化架构（5 层）

输入层（Spec/自然语言/代码上下文）→ 工作台 CodeBuddy（配置中心+模式引擎+Agent 核心）→ 底层支撑 MCP（DB/API/Wiki/CI/CD）→ 输出层（代码/测试/文档）→ 度量层（AI 代码占比/交付量/Bug 率），形成闭环反馈。

## 实施路线图（3 阶段）

第一阶段基础建设（1-2 周）：CodeBuddy 安装 + team-harness 仓库 + 基础 Rules + 知识库配置
第二阶段工具接入（2-4 周）：MCP 接入 + Skills 沉淀 + Spec 驱动开发流程
第三阶段持续优化（持续）：度量看板 + 规范迭代 + 知识飞轮

## 具体规范（3-9 章）

涵盖 CodeBuddy 安装与配置（VSCode / JetBrains / CLI）、核心配置（模型选择/Memories/Knowledge Base）、Rules 编写规范（结构约束/行为约束/安全约束）、Skills 沉淀模板（带 skills.json 和测试用例）、SDD 工作流 SOP（requirements.md → 人工审核 → task.md → 执行 → 归档）、多 Agent 协作规范（Planner/Generator/Evaluator 角色职责与切换）、反模式总结（把环境配在 prompt 里/跳过 Plan 直接编码/skill 不做测试等 7 种），以及 harness-audit Skill 自动化合规自检。

## 反模式总结

1. 把环境配置写在 prompt 里（应写在 Rules 或 Skills 中）
2. 跳过 Plan 直接让 AI 编码
3. 用 AI 写完代码不 Review 直接合入
4. 不对 AI 生成的代码做安全审计
5. 一个 Rules 文件写几千行（应拆分）
6. Skill 不做测试直接共享
7. 不对 AI 的使用效果做度量
