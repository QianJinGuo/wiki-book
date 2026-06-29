# Harness Pilot：Claude Code 插件的项目规范预验证与 Agent 协作框架

## Ch04.334 Harness Pilot：Claude Code 插件的项目规范预验证与 Agent 协作框架

> 📊 Level ⭐⭐ | 7.6KB | `entities/harness-pilot-claude-code-plugin-yangtong-2026-06-17.md`

## Harness Pilot：Claude Code 插件的项目规范预验证与 Agent 协作框架

## 摘要

杨桐开发的 Claude Code 插件 Harness Pilot，将项目规范显式化、版本化并集成到 Git 工作流。核心范式转变：从依赖 AI"自觉"的事后检查，转变为依靠自动化脚本在编码前进行强制预验证。包含两大 Skill（harness-analyze/harness-apply）、五类内置 Agent、分层模板系统、Ralph Wiggum Loop 自动质量循环、Handoff 跨会话机制。实测效果：项目健康分从 10/100 提升至 91/100。

## 深度分析

### 1. 核心问题：AI Agent 的隐性规则盲区

AI Agent 在代码库协作中的核心问题是可见性——分层约束、命名规范、架构约定对 Agent 是隐性的。如果规则未在 Git 仓库中显式化，Agent 将反复违规、陷入修复循环，上下文被错误日志填满。

### 2. 范式转变：从"教"到"验"

现有方案（System Prompt、RAG、CI/CD Lint）的根本局限：规则更新滞后于代码演进、检查时机过于靠后、约束力过度依赖"自觉"。Harness Pilot 的优势：规则在 Git 仓库中版本化、编码前预验证、自动化脚本强制执行。

### 3. 四条设计原则

| 原则 | 内容 |
|------|------|
| Git 作为唯一事实来源（SSOT） | 规则沉淀在代码库中，通过 Git 版本化与代码同步演进 |
| .harness/ 自包含 | 所有生成文件集中于 .harness/ 目录，manifest.json 追踪状态 |
| 关注边界，解耦实现 | 明确层级依赖规则，不强制规定设计模式或编码风格 |
| 预验证优于事后检查 | 在执行结构性操作前验证合法性，大幅降低修复成本 |

### 4. 两大 Skill

**harness-analyze**：四步分析流程，评分权重：文档覆盖率 35% + 架构合规度 35% + 测试覆盖率 30%，支持历史趋势追踪。

**harness-apply**：三种模式。默认 SPEC（SDD）模式，由复杂度分数强制执行。复杂度 ≥11 自动组建专家团（Architect/Implementer/Reviewer）。集成 openspec 插件：已安装则委托完整 SDD 工作流，未安装则使用内置 fallback。覆盖标志：`--auto` 跳过所有提示、`--no-panel` 跳过专家团。

### 5. 五大关键机制

**Ralph Wiggum Loop**：自动化审查-测试-修复质量循环，harness-apply 后自动运行，最多 3 轮。失败轨迹记录在 `.harness/trace/failures/`。

**Handoff 跨会话机制**：tool call 约 40 次后早期关键信息易被压缩或丢弃。Handoff 通过结构化 artifacts 实现状态持久化——Session A 写到文件（agent-state.json / context.json / resume.json）→ Session B 读取恢复。基于文件系统，不受上下文压缩影响。

**Reentrant Apply**：manifest.json 追踪状态，支持增量更新。记录上次 apply 时间与版本，增量更新时保留用户自定义内容，仅覆盖标准生成部分。

**AGENTS.md 导航地图**：AI Agent 进入项目时的第一站，包含 First Principles、Project Overview、Key Files、AI Rules Location、Available Harness Skills、Workflow。避免 Agent 在目录中盲目搜索，降低上下文消耗。

**分层模板系统**：base/ → languages/ → frameworks/ → rules/ → capabilities/，越靠后优先级越高。轻量级 Mustache-like 引擎渲染，支持变量替换、条件块、循环，内置 LRU 缓存。

### 6. 插件架构

```
plugins/harness-pilot/
├── .claude-plugin/         ← 插件元数据
├── skills/                 ← harness-analyze + harness-apply
├── agents/                 ← 5 个 Agent 定义
├── templates/              ← 分层模板系统
├── lib/                    ← 共享工具模块
├── scripts/                ← 模板引擎 + JIT 测试生成
├── hooks/                  ← session-start hook
└── tests/                  ← 单元测试
```

生成产物 `.harness/` 包含：manifest.json、capabilities.json、docs/（ARCHITECTURE/DEVELOPMENT/PRODUCT_SENSE）、scripts/（lint-deps/lint-quality/lint-imports/lint-semantic/validate）、rules/、memory/（情景/程序/失败）、trace/、hooks/、tasks/、handoffs/。

### 7. 业界共识

- OpenAI：Harness Engineering 让 Codex 在复杂任务中保持可靠
- Anthropic："手"与"脑"分离——Managed Agents 实现规模化
- DeepMind：小模型 + 好 Harness > 大模型（Gemini Flash + AutoHarness > Gemini Pro）
- LangChain：五大 Harness 中间件让 Terminal Bench 得分从 52.8% 提升至 66.5%
- Meta：PR 阶段自动生成测试（JiT），AI 代码缺陷检出率提升 4 倍

### 8. 实测效果

claude-code-go 项目（~19,912 行 Go 代码，23 个 internal packages）：
- **应用前**：Score 10/100 (D)，文档 0、架构 0、质量规则 0、验证 0
- **应用后**：Score 91/100 (A)，文档 100、架构 100、质量规则 100、验证 100，0 层级违规、0 循环依赖

## 核心金句

"与其试图'教导' AI Agent 如何正确执行任务，不如赋予其自动验证执行结果正确性的能力。依靠代码、linter 及自动化测试来保障正确性，而非依赖 LLM 的'直觉'。"

## 实践启示

1. **预验证 > 事后检查**：编码前验证合法性，修复成本远低于事后修补。
2. **Git 作为唯一事实来源**：规则版本化与代码同步演进，Agent 接入项目即可获取完整上下文。
3. **Handoff 解决长会话上下文丢失**：基于文件系统的结构化 artifacts 传递，不受上下文压缩影响。
4. **Ralph Wiggum Loop 上限 3 轮**：自动修复但不能无限自证，与 SSD 的闸门管道修复上限设计一致。

## 相关页面

- [SSD Spec 驱动开发 ASD Harness](/ch05-045-ssd-spec-驱动开发实战-从四条约束到-asd-harness-的工程落地/)
- [术哥三器对比](/ch01-176-三器合一-comet-openspec-superpowers-用文件系统给-ai-编程上工程纪律-术哥源/)
- [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/harness-pilot-claude-code-plugin-yangtong-2026-06-17.md)

## 相关实体

- MOC

---

