# Hermes Agent 与 Agent Skill 设计解析

## Ch04.388 Hermes Agent 与 Agent Skill 设计解析

> 📊 Level ⭐⭐ | 7.0KB | `entities/hermes-agent-skill-design-analysis.md`

# Hermes Agent 与 Agent Skill 设计解析

> **来源**：[飞樰 - 阿里云开发者](https://mp.weixin.qq.com/s/2xFei8dMx99lc-iyrZZrww)（2026-04-24）& [云朵君 - 数据STUDIO](https://mp.weixin.qq.com/s/six9MKhvBgyZyUvyAIujTA)（2026-04-23）

## 一、Hermes Agent：自进化的开源 Agent

### 背景

- **项目**：Hermes Agent，由美国开源 AI 研究机构 **Nous Research** 于2026年2月底推出
- **成绩**：GitHub 4万+ Stars，迭代速度超越多数商业化 Agent 产品
- **定位**：不是 IDE 绑定的 Copilot，也不是单一 API 聊天机器人外壳，而是**部署在服务器上的自主智能体**

### 核心亮点

| 能力 | 说明 |
|------|------|
| **持久运行（Persistent）** | 部署在服务器上，长期运行持续服务 |
| **自进化（Self-Evolving）** | 运行时间越长，能力越强 |

### 功能特性

- **40+ 款内置工具**
- **兼容多种主流大语言模型**
- **内置 Cron 调度器**执行复杂定时任务
- **支持多种第三方消息平台**接入（类 OpenClaw）

## 二、Self-Evolving：双路径驱动的自进化

Hermes 的自进化依赖**两条路径**，构成"内外"双轮驱动闭环：

### 路径一：动态 Skill 生成（"记笔记"）

#### 与 OpenClaw/Claude Code 的核心差异

| 特性 | OpenClaw / Claude Code | Hermes |
|------|----------------------|--------|
| Skill 来源 | 静态的，需预定义或手动创建 | **动态生成**，基于执行轨迹自动沉淀 |
| 学习方式 | 无法自主从历史中学习 | **自动复盘**，从试错中提取经验 |
| 积累方式 | 独立使用，不自动优化 | **持续优化**，遇更优路径自动更新 |

#### 触发机制

- **`_iters_since_skill` 计数器**：记录距离上次使用 `skill_manage` 工具过了多少轮
- **`_skill_nudge_interval = 10`**：连续10轮对话未创建/修改技能时，系统"提醒" Agent 整理经验

#### 后台审查 Agent（异步复盘）

主 Agent 回复后，**后台异步启动**轻量级 Agent 从三个维度复盘：

| 维度 | Prompt | 作用 |
|------|--------|------|
| **记忆审查** | `_MEMORY_REVIEW_PROMPT` | 判断是否蕴含值得长期保留的经验/事实 → 存入记忆库 |
| **技能审查** | `_SKILL_REVIEW_PROMPT` | 分析任务解决路径是否具有通用性 → 抽象固化为可复用 Skill |
| **综合审查** | `_COMBINED_REVIEW_PROMPT` | 反思执行过程中是否存在优化空间或潜在错误模式 |

> **设计模式**：前台即时响应、后台异步进化。用户看到秒回，背后审查 Agent 慢慢整理经验。

### 路径二：RL 训练闭环（"练内功"）

基于**强化学习（RL）**改变模型权重，实现真正的能力进化。
- 不仅是"记笔记"（Skill 沉淀），更是"练内功"（权重内化）
- 构建完整闭环：数据合成 → 质量筛选 → RL训练环境构建 → 小规模实验 → 正式训练 → 自动化评估
- 被称为 **"Research-Ready"（研究就绪）框架**

## 三、Agent Skills 详解

### 什么是 Skill？

**本质**：一个文件夹，核心是 `SKILL.md` 文件

```
my-skill/
├── SKILL.md       # 必须：元数据 + 核心指令
├── scripts/       # 可选：可执行脚本（Python/Bash等）
├── references/    # 可选：参考文档（API说明等）
└── assets/        # 可选：静态资源
```

### 核心设计哲学：渐进式披露

像**外卖骑手接单**一样分三步：

| 阶段 | 比喻 | AI 加载内容 |
|------|------|------------|
| **发现** | 骑手看订单列表 | 只加载 `name` + `description`，判断是否匹配任务 |
| **激活** | 骑手接单看详情 | 匹配后加载完整 `SKILL.md` |
| **执行** | 骑手出发送货 | 按需加载 `references/` 或执行 `scripts/` |

> **好处**：上下文窗口不被塞满，保持思考速度，只在需要时加载必要信息

### SKILL.md 结构

```yaml
---
name: pdf-processing
description: 从PDF提取文本表格、填写表单、合并文件。当用户需要处理PDF文档时使用此技能。
---
# 正文：详细操作指令
## Triggers（触发条件）
## Steps（执行步骤）
## Pitfalls（避坑指南）
```

### Skill vs Prompt 对比

| 对比项 | 塞进 Prompt | 用 Skill |
|--------|------------|---------|
| 复用性 | 低，每次复制粘贴 | 高，文件夹式管理 |
| 维护性 | 难，更新麻烦 | 易，单独修改 |
| 上下文占用 | 全量加载 | 按需加载（渐进式披露） |

## 四、总结

### Hermes 的自进化全景

```
┌─────────────────────────────────────────────────────────┐
│                    Hermes Self-Evolving                  │
├─────────────────────────┬───────────────────────────────┤
│   "记笔记"              │   "练内功"                      │
│   Skill 动态沉淀         │   RL 训练闭环                   │
│   (Context Engineering) │   (Weight Evolution)          │
├─────────────────────────┼───────────────────────────────┤
│  • 自动生成 Skill       │  • 数据合成                      │
│  • 持续优化 Skill       │  • 质量筛选                     │
│  • 持续积累经验         │  • RL 训练                       │
│  • 快速、轻量、即时生效  │  • 深度、根本改变模型能力        │
└─────────────────────────┴───────────────────────────────┘
```

### 核心认知

> **Skill** = 岗位职责说明书 + 操作SOP + 避坑指南
>
> AI 像刚入职的新员工——聪明、学习能力强，但不懂业务"潜规则"。Skill 让通用模型秒变领域专家。

## 相关概念

- [Claude Code 工具设计演进](https://github.com/QianJinGuo/wiki/blob/main/concepts/claude-code-tool-design-evolution.md) — Hermes 的 Skill 渐进式披露与 Claude Code/OpenClaw 的 Skill 机制同源，但增加了动态生成与后台复盘
- [Harness Engineering](https://github.com/QianJinGuo/wiki/blob/main/concepts/harness-engineering-framework.md) — Hermes 的"前台即时响应+后台异步进化"模式是 Harness 工程范式的自进化延伸
- [Agent 记忆系统设计](https://github.com/QianJinGuo/wiki/blob/main/concepts/agent-memory-system-design.md) — 后台审查 Agent 的记忆/技能/综合三维复盘，是 Agent 记忆自动沉淀的一种实现

## 相关资源

- Hermes Agent GitHub：https://github.com/NousResearch/hermes-agent
- 系列文章：
  - 深度解析OpenClaw
  - 深度解析Claude Code

---
*整理自微信公众平台，2026年4月*

---

