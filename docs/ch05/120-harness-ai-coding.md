# 应用宝活动平台 Harness 工程实践——从对话式 AI Coding 到工程化系统

## Ch05.120 应用宝活动平台 Harness 工程实践——从对话式 AI Coding 到工程化系统

> 📊 Level ⭐⭐⭐ | 8.7KB | `entities/appstore-activity-harness-engineering-tencent.md`

# 应用宝活动平台 Harness 工程实践——从对话式 AI Coding 到工程化系统

> 原文归档：[原文归档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/tencent-appstore-activity-platform-harness-2026-07-03.md)

腾讯应用宝活动平台（支撑应用宝内 app、pc、手助等产品所有日常/节假日活动）在生产环境中实践 Harness Engineering 的完整报告，详细记录了从对话式 AI Coding 走向工程化系统的路径、架构设计与实战经验。

## 一句话

**应用宝活动平台团队在 90+ 微服务、800+ 文档、12 个专家 Agent 的生产规模下，用"知识库工程 ✖️ 端到端开发工程"双重架构，实现了从对话式 AI Coding 到系统化 Harness 工程的全流程落地。**

## 从对话式 AI Coding 到 Harness 工程化

团队初期使用对话式 AI coding（CodeBuddy + Plan Mode、Rules + Prompt）开发，但随着项目复杂度提升暴露四大问题：

- **单窗口上下文快速膨胀**：每次启动已在塞知识/规则，多轮交互后上下文有损压缩
- **缺乏完整的业务知识**：每次需求依赖人捋清多服务串联关系喂给 AI
- **缺乏工程自动化闭环**：AI 只负责 coding，需求拆解/部署/验证仍需人工
- **单窗口无法并行**：多任务只能串行或开多个窗口人工切换

核心判断：**任务越是完整、规模化、可抽象成稳定流程，对话式 AI coding 的弊端越明显，Harness 工程化的价值越高。**

## 独特贡献

本文是当前 wiki 中 Harness Engineering 相关实体中**最详细的生产级实现报告**，提供了以下独特概念和实践机制：

### 1. 知识库工程子系统

在 [Harness 综合实体](ch05/052-harness-engineering.html) 的基础上，本文贡献了一个可操作的知识库工程架构：

- **三层目录结构**：总览层（overview.md）→ 域层（meta.yaml + custom/）→ 服务层（8类自动生成文档 + custom/）
- **8类自动生成文档**：overview/interfaces/architecture/dependencies/storage/config/pitfalls/log，各有面向读者和内容规范
- **知识自动生成流水线**：gen-project-docs / batch-doc-generator 两个 skill，import 追踪 → proto 提取 → 增量融合保留人工批注
- **接口活跃度标注**：以伽利略平台调用量为指标判断接口活跃性
- **渐进式加载检索**：三层分层 + grep，4 种查询模式（需求拆解/技术方案/接口搜索/知识问答），替代传统 RAG
- **文档新鲜度检测**：meta.yaml 中 git_hash vs 仓库 HEAD hash 比对，超阈值触发增量更新

### 2. 状态文件驱动

区别于依赖对话历史传递上下文，本文提出了长链路状态化的关键实践：

- **product-state.json**：多 Story 并行开发流程状态（breakdown → forking → joining）
- **e2e-state.json**：单 Story 端到端流程 Phase 0-7
- **Hook 机制**：Stop/SessionStart/SessionEnd 三事件注入脚本，强制流程确定性、跨会话断点恢复、清理残留

### 3. 12 专家 Agent 体系

设计原则——单一职责、上下文隔离、工具最小权限、确定性输入输出（结构化状态文件）、模型可插拔：

| 类别 | Agent | 职责 |
|------|-------|------|
| 规划 | product-analyst | 需求拆解 + kb-query |
| 规划 | requirement-analyst | 需求澄清 + 技术方案 |
| 规划 | task-planner | 任务拆解 + DAG 编排 |
| 执行 | proto-engineer | Proto 变更 + 桩代码 |
| 执行 | backend-developer | Worktree 开发 |
| 执行 | code-fixer | 复用性修复 |
| 验证 | unit-tester | 单测 + 覆盖率 |
| 验证 | interface-verifier | 接口验证 + 根因分析 |
| 验证 | test-case-designer | 用例设计 |
| 审查 | code-reviewer | Codar 评审（只评不改） |
| 集成 | publisher | 发布 + 配置重启 |
| 集成 | git-committer | 提交 + MR |

### 4. DAG 编排 + Fork-Join 并行模式

- **Worktree 隔离**：task-planner 按 DAG 编排任务，同一层并发，git worktree 隔离，统一 merge
- **Fork-Join**：R 阶段需求拆解 → Fork 段多子需求并行 Phase 1-4 → Join 段串行收口
- **冲突治理四策略**：Merge Conflict（事前文件隔离，不绕过）/ Shared file（收口串行）/ Proto 协议（前置串行统一生成）/ DB/配置（一次性前置确认）

### 5. 脚本化执行

"AI 负责认知，脚本负责执行"——前后沉淀近 15 个脚本将确定性操作固化：

- e2e-dev.py（状态机解析执行）
- worktree.sh / sub_worktree.sh（多 Agent 并行开发工作流）
- build-and-publish.sh（编译发布）
- kb-init.sh（知识库初始化更新）

### 6. DevOps 全流程集成

tRPC-Gateway（本地 AI 调内网接口）、Codar CR 流水线、TAPD/Rick/123/七彩石/伽利略等多平台能力集成。

### 7. 调度架构演进：从 Agent 驱动到强类型代码编排

团队在演进过程中做出两个关键调整：

- **弃用主子 Agent 模式**：改由外部主程序编排全局流程，hy3-preview 聚焦局部文档生成，Claude 负责高维度域综述
- **弃用 Shell 脚本**：大模型生成的 Shell 脚本常藏隐性语法错误，最终驱动层全面重构为 Go 代码

## 七条核心原则

本文提出贯穿整套 Harness 工程的核心原则，是已有的 [Harness 综合实体](ch05/052-harness-engineering.html) 未覆盖的生产级判断准则：

1. **AI 负责认知，脚本负责执行**
2. **长链路必须状态化**
3. **知识库必须结构化**
4. **Agent 必须职责隔离**
5. **执行步骤必须脚本化**
6. **Workflow 比 Prompt 更重要**
7. **把 AI 当作工程系统来设计**

## 开放性思考

### TDD 在 AI 时代

TDD 落地不在代码层面，而是在接口测试用例上——一开始生成需求级测试用例（含输入输出预期），流程中基于用例构请求、判结果。

### AI 工程架构分层

当前 AI 工程缺乏类似 MVC/DDD/Clean Architecture 的成熟架构方法论——Agent、Skill 之间如何组织、AI 工程与 AI 工具如何解耦、Agent 与 Skill 如何插拔式组合是亟待解决的问题。

### 代码还重要吗？

核心立场：**核心在线业务系统仍需要人守住架构这条线**——AI 代码腐化速度快、高质量代码和架构会反哺 AI、人对代码失去掌控后线上问题只能靠 AI 排查。但结果导向/容错率高的系统（如运营看板）适合 vibe coding 黑盒化。

> 参见 [Code is cheap: Harness 方法论——水流理论、最小混沌单元与反 slop](ch05/099-harness.html)——前者从第一性原理推导 Harness 方法论，本文提供生产级实现细节，两者互补。本文也补充了 [腾讯技术工程 Harness 探索之旅](ch05/052-harness-engineering.html) 中缺失的工程细节。

## 标签

#HarnessEngineering #腾讯 #应用宝 #生产实践 #知识工程 #状态驱动 #专家Agent #ForkJoin #冲突治理 #脚本执行 #DevOps集成 #TDD #代码架构

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/tencent-appstore-activity-platform-harness-2026-07-03.md)

---

