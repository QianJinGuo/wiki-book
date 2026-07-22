---
source_url: https://mp.weixin.qq.com/s/ONYZFjxpIDgoRBSblLtGZg
title: "Agent核心技术概念与范式发生了哪些演变以及背后的思考"
source: "阿里技术"
ingested: 2026-06-01
sha256: 69e8aecbe1541339d1e18903cbfef9a0e2680599219155a2e438f825f0b0fce4
---

# Agent核心技术概念与范式发生了哪些演变以及背后的思考

**作者：** 飞樰
**发布日期：** 2026年6月1日

## 摘要

梳理 Agent 技术从2023-2026年的四个阶段演进（被动ReAct→工作流→自主→自进化）及六大核心维度（Prompt/Planning/Memory/Tools/Workflow/Environment）的技术概念变化。强调四个阶段非替代关系而是并存互补。核心洞察：宏观架构"形"未变，内核已重构——从"人为适配模型"到"利用模型原生能力"，从"刚性约束"到"动态智能"。

## 内容

（本文覆盖的4阶段+6维度Agent框架已由 entity [[entities/agent-evolution-four-stages-six-dimensions-aliyun|Agent 四阶段演化与六维度技术变化]] 完整收录。以下为本文独特补充内容。）

### Prompt：渐进式披露

System Prompt 从"单体大作文"到"System Prompt + 渐进式加载上下文文件"的解耦。动态内容拆解存储到外部文件系统（`SKILL.md`、`USER.md`、`SOUL.md`、`CLAUDE.md`、`AGENTS.md`），通过渐进式披露（Progressive Disclosure）读取，实现真正的"动静分离"。

### Memory：文件系统化+向量混合

长期记忆从"向量数据库主导"回归"文件系统主导"，细分为：
- **事项型记忆（Episodic Memory）：** 用户偏好/历史行为/待办，用 `MEMORY.md` 或日志文件结构化存储，比向量检索更可控可读
- **知识型记忆（Semantic Memory）：** LLM-Wiki、GBrain 等本地知识库理念普及，文件系统+Obsidian 笔记工具补充/替代纯 RAG。企业级海量知识需搭配 QMD/SQLite 向量化检索

### Tools：CLI 命令行原生化

工具范式从 Function Call 到 CLI + Script 的范式转移：
- **零样本学习优势：** grep/cat/vim 等 Linux 命令是模型预训练数据中的"先天知识"，无需定义 API Schema
- **可扩展性：** 遵循标准 Linux/Unix 规范的第三方 CLI 工具，模型可在运行时通过 `--help` 自主理解参数
- **Script 脚本化：** Python 等脚本封装具体工具逻辑，本地与远程统一，协议黑盒化

### 总结框架

宏观架构"形"未变，但内核重构：
- Prompt：单体小作文 → 解耦的上下文工程
- Planning：线性 CoT → 复杂长程任务拆解
- Memory：前置向量检索 → 文件系统化+向量混合
- Tools：API 封装 → CLI + Script 原生
- Workflow：刚性编排 → 动态 Skill 封装
- Environment：无状态 → 有状态隔离运行时

核心思想不变：**通过工程化手段构建确定性，以承载模型不确定性**。
