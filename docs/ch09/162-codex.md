# Codex 五层架构：记忆/知识/护栏/委派/分发

## Ch09.162 Codex 五层架构：记忆/知识/护栏/委派/分发

> 📊 Level ⭐⭐ | 2.5KB | `entities/codex-5-layer-architecture.md`

# Codex 五层架构：记忆/知识/护栏/委派/分发

## 摘要

Codex 团队开发环境配置的五层架构：AGENTS.md（记忆层）→ skills/（知识层）→ hooks/（护栏层）→ subagents/（委派层）→ plugins/（分发层），形成一个从规则对齐到安全管控到多 Agent 协作的完整工程体系。

## 五层详解

| 层 | 目录 | 核心价值 | 类比 |
|----|------|---------|------|
| L1 记忆层 | AGENTS.md | 统一命名/结构/规范，团队共识 | 宪法 |
| L2 知识层 | skills/ | 最佳实践，按场景匹配能力 | 图书馆 |
| L3 护栏层 | hooks/ | 事前拦截、事后留痕 | 安检门 |
| L4 委派层 | subagents/ | 独立上下文、并行执行 | 事业部 |
| L5 分发层 | plugins/ | NPM 包分发、版本可控 | 快递系统 |

### L1 记忆层 — AGENTS.md

全局配置、项目级规则、代码规范、工程红线。写死的团队共识，所有 AI 成员以此对齐。这是 Codex 环境的"宪法"层。

### L2 知识层 — skills/

沉淀团队最佳实践，避免重复造轮子。Agent 按场景自动识别并调用对应 skill，按需获取能力。

### L3 护栏层 — hooks/

特定行为前后自动执行：
- 事前拦截危险命令
- 自动化操作验证
- 部署通知

确保 AI 操作安全可控。

### L4 委派层 — subagents/

每个子智能体有独立上下文窗口、自定义工具与权限。结果回传主线程，保持主线逻辑干净。支持并行执行。

### L5 分发层 — plugins/

通过 NPM 包分发，版本可控。技能、规则、子智能体一键安装，确保全队配置同步。

## 参照

- [Codex AGENTS.md 配置实践](../ch01/540-codex.html)
- [古法程序员 Codex 三层 Skill 架构](../ch01/540-codex.html)

## 来源

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/codex-5-layer-architecture-xiaohongshu.md)

---

