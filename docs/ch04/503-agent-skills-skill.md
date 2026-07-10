# Agent Skills 无依赖设计：Skill 之间不传数据的哲学与实践

## Ch04.503 Agent Skills 无依赖设计：Skill 之间不传数据的哲学与实践

> 📊 Level ⭐⭐ | 5.2KB | `entities/agent-skills-no-dependency-design-philosophy.md`

# Agent Skills 无依赖设计：Skill 之间不传数据的哲学与实践

Agent Skills 官方规范的一个反常识设计：**skill 之间在规范层面彻底断开，没有任何字段让 skill 声明对其他 skill 的依赖**。这不是规范写漏了，而是刻意的设计取舍——skill 层保持极简、无状态、可独立分发，真正的依赖关系和数据流转由 agent 的上下文窗口和运行时决策承载。

## 核心设计原则

### 6 个自描述字段，零个指向外部

Skill 的 SKILL.md frontmatter 只有 6 个字段：`name`、`description`、`license`、`compatibility`、`metadata`、`allowed-tools`。全部是自我描述，没有任何一个字段指向别的 skill。这与传统包管理器（Node 的 dependencies、Python 的 pyproject.toml、Java 的 Maven）形成根本性对比。

### Progressive Disclosure 三阶段

| 阶段 | 内容 | 加载时机 |
|------|------|----------|
| Discovery | name + description | 会话启动时，只读 frontmatter |
| Activation | 完整 SKILL.md 正文 | agent 判断 skill 与任务相关时 |
| Execution | references/scripts/assets | 指令引用时按需加载 |

每个阶段都只涉及单个 skill 的内部状态，没有跨 skill 的数据流动。

### available_skills 是平铺清单，不是 DAG

agent 启动时看到的 skill 清单是 `<available_skills>` 平铺列表，每个 skill 是独立节点，没有任何连接关系——不是图，不是树，不是 pipeline。

## 与四种体系的反差对比

| 维度 | Java import | 微服务调用 | MCP 工具 | Agent Skill |
|------|------------|-----------|---------|------------|
| 依赖声明 | 编译期硬依赖 | 服务注册/发现 | 接口 schema | **无** |
| 数据传递 | 方法参数/返回值 | RPC/HTTP 报文 | 结构化输入输出 | **agent 上下文** |
| 组合方 | 开发者写代码 | 网关/编排服务 | client 程序 | **LLM 运行时决策** |
| 契约强度 | 最强（编译器强制） | 中（接口约定） | 中（schema 约束） | **最弱（自然语言描述）** |

skill 的契约就是 `description` 那段自然语言，靠 LLM 理解语义来匹配。弱契约的好处是极度灵活，坏处是确定性差。

## 编排责任推给了 agent 层

skill 不传数据、不声明依赖，复杂任务的协作靠 agent（LLM）层完成：
1. **语义匹配**：扫 available_skills，根据每个 skill 的 description 判断相关性
2. **按需激活**：加载相关 skill 进上下文窗口
3. **隐式编排**：自定执行顺序，上一个 skill 的产出传给下一个 skill——通过 agent 上下文，而非 skill 间接口

这种设计可称为"**无依赖的依赖**"：skill 层面无耦合，但任务执行存在事实上的先后和数据流转，载体是 agent 的上下文窗口。

## 实证案例：12 个 skill 互相不认识

作者的项目（webchat-writer）有 12 个 skill 覆盖全链路，但 frontmatter 里没有一个提到另一个 skill。编排逻辑放在 orchestrator agent 文件里，用 `task.allow` 白名单列出可调度的子 agent，用自然语言写清楚流程。skill 保持彻底的无状态、无依赖、可独立分发。

## 设计得失

**得**：skill 极度可移植。一个 skill 就是一个目录加一个 SKILL.md，无外部耦合，与 npm 包、Docker 镜像的可移植逻辑类似。

**失**：agent 层编排没有标准化。每个 agent 产品（Claude Code、Cursor、Gemini CLI、OpenCode）编排策略各不相同。同一个 skill 在不同 agent 上可能被组合出完全不同的执行路径。

## 给 Skill 设计者的建议

1. **独立可跑**：别设计成"必须跟另一个 skill 配合才有意义"的结构，让 orchestrator 去编排
2. **description 是接口契约**：写清楚触发场景、能力边界、什么时候不该用
3. **数据流转靠文件**：skill 把产出写到约定路径的文件，下一个 skill 去读——文件系统充当消息队列
4. **编排集中放**：谁先谁后、哪里暂停等用户，全在 orchestrator agent 文件里统一管理

## 与其他实体的关系

- → [Agent Skill 规范、构建与设计模式](ch04/264-agent-skill.html) — 更多关注如何构建 skill（Skill-Creator、设计模式等）
- → [Hermes Agent Skills 源码级拆解](ch04/403-hermes-agent-skills.html) — 同一作者（术哥）的源码级分析
- → [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/agent-skills-spec-no-dependency-design.md)

---

