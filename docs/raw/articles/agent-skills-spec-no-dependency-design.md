---
title: "翻完 Agent Skills 官方规范，发现一个反常识设计：skill 之间压根不传数据"
source_url: https://mp.weixin.qq.com/s/0I64tEEThpHwp0stRZpk7w
source_site: 术哥无界
author: 运维有术
date: 2026-07-10
ingested: 2026-07-10
sha256: c0459c8369965f6e8b47f7bbb6e224d7d1f90fe12dc3b3baa1a6d62385376897
---

# 翻完 Agent Skills 官方规范，发现一个反常识设计：skill 之间压根不传数据。一堆 Agent Skill 又该如何协作

原创 运维有术 术哥无界
2026年7月10日 08:30 山东

🚩2026 年「术哥无界」系列实战文档 X 篇原创计划 第 162 篇，Skills 最佳实战「2026」系列第 17 篇

大家好，欢迎来到 术哥无界 | ShugeX ｜ 运维有术。

我是术哥，一名专注于 AI 编程、AI 智能体、Agent Skills、MCP、云原生、AIOps、Milvus 向量数据库的技术实践者与开源布道者！

Talk is cheap, let's explore。无界探索，有术而行。

写过微服务的人都知道，模块之间要协作，得先把依赖关系理清楚：谁调谁、传什么参数、失败了怎么办。这套思维几乎是工程师的本能。

所以当你第一次打开 Agent Skills 的官方规范，准备给一堆 skill 设计依赖图的时候，会发现一件反常识的事：规范里根本没有任何字段让你声明依赖。没有 requires、没有 depends-on、没有 inputs、没有 outputs。

skill 和 skill 之间，在规范层面是彻底断开的。

这不是规范写漏了。这是刻意的设计取舍。下面拆解一下这套设计到底怎么运作，以及它为什么敢这么干。

说明：本文基于 Agent Skills 官方规范（https://agentskills.io/specification）和本地参考实现源码（github.com/agentskills/agentskills 的 skills-ref 目录）分析整理。文中对规范字段、运行模型、<available_skills> XML 结构的描述均以规范文档和源码为准；对"本项目 12 个 skill"的实证考察基于笔者当前工作项目（webchat-writer）的实际配置。规范仍处于演进阶段，部分字段（如 allowed-tools）标注为 Experimental，后续版本可能有调整。如果你在生产环境中使用 Agent Skills，请以官方最新规范为准。

## 1. 先看规范给了什么：6 个字段，全是自我描述

Skill 的全部身份信息，就装在一个 SKILL.md 文件的 frontmatter 里。规范定义的可选字段拢共 6 个：

```
name: shuge-fact-check       # 你叫什么
description:...              # 你能干什么
license:MIT                  # 可选，许可证
compatibility:opencode       # 可选，环境要求
metadata:                    # 可选，键值对
  version:"1.0"
  author:"shuge"
allowed-tools:[]             # 可选，工具白名单
```

逐个看下来，这 6 个字段全部是自我描述，描述自己是谁、能干什么、在什么环境跑。没有任何一个字段指向别的 skill。

对比传统依赖声明：Node 的 package.json 有 dependencies，Python 的 pyproject.toml 有 dependencies，Java 的 Maven 有 <dependencies>。这些体系的共同特征是模块自己声明"我需要谁"。Skill 规范里没有这一栏。不是少写了一列，是整个设计哲学就不往这个方向走。

## 2. 运行模型：三阶段都在单个 skill 内部完成

规范给 skill 定义了一套叫"渐进式披露"（progressive disclosure）的运行模型，分三个阶段：

- **阶段一，Discovery**：系统启动时把所有 skill 的 name 和 description 加载进上下文。只读 frontmatter，不碰正文。目的是让 agent 知道手头有哪些能力可用。
- **阶段二，Activation**：当 agent 判断某个 skill 跟当前任务相关，加载这个 skill 的 SKILL.md 全文。
- **阶段三，Execution**：skill 正文里如果写了 Read(references/xxx.md) 或 scripts/foo.py，这些资源在用到时才按需加载。

每个阶段都只涉及单个 skill 的内部状态，没有跨 skill 的数据流动。Discovery 阶段虽然把多个 skill 并列加载，但它们是平铺的列表，互相之间没有连接。从规范的运行模型看，skill 天生就不具备把数据传给另一个 skill 的通道。

## 3. 关键证据：available_skills 是平铺的，不是图

规范推荐了一段 agent 系统提示词格式，agent 启动时看到的 skill 清单长这样：

```
<available_skills>
  <skill>
    <name>shuge-fact-check</name>
    <description>对草稿做事实校验...</description>
    <location>.opencode/skills/shuge-fact-check/SKILL.md</location>
  </skill>
  <skill>
    <name>shuge-assemble</name>
    <description>把中间产物组装成最终文章...</description>
    <location>.opencode/skills/shuge-assemble/SKILL.md</location>
  </skill>
  ...
</available_skills>
```

这是一份平铺的清单。每个 skill 是一个独立节点，没有连接关系，不是图，不是树，不是 pipeline，就是一份目录。如果 skill 之间真有依赖，你期待看到的至少是个 DAG。但 <available_skills> 的结构明确告诉你：所有 skill 是平级的、孤立的、可任意组合的零件。

## 4. 规范不仅不鼓励依赖，还明确反对 skill 互相耦合

skills 的 best-practices 文档明确反对 skill 间耦合：如果 skill 设计得太窄，单个任务必须同时加载多个 skill 才能完成，会带来开销，指令之间也容易打架。

规范鼓励的方向是：每个 skill 自成完整的能力单元，独立可用。skill 是给 LLM 读的指令文本，LLM 每多加载一个 skill 就多消耗一份上下文窗口。让 skill 自给自足，是在上下文成本和指令一致性之间做的权衡。

## 5. 依赖去哪了？推给了 agent 层

编排责任全部推给了 agent（也就是 LLM）层。agent 拿到任务后自己做三件事：
1. 扫一遍 <available_skills> 清单，根据每个 skill 的 description 判断哪些相关（语义匹配，不是查依赖表）
2. 按需激活相关 skill，加载进自己的上下文窗口
3. 自己决定执行顺序，自己把上一个 skill 的产出当成下一个 skill 的输入

这种设计可以叫"无依赖的依赖"：skill 层面没有任何依赖；但从任务执行看，存在事实上的先后和数据流转，流转的载体是 agent 的上下文窗口。

## 6. 一个实证案例：12 个 skill 互相不认识

作者手上的写作项目（webchat-writer）有 12 个 skill，覆盖从调研、写作、事实校验、去 AI 味，到配图规划、生图、上传、组装全链路。

12 个 skill 的 frontmatter 里没有任何一个提到另一个 skill 的名字。编排逻辑放在一个 agent 文件（shuge-article-writer）里，用 task.allow 白名单列出能调度的子 agent，用自然语言写清楚整个流程。

skill 保持彻底的无状态、无依赖、可独立分发；编排是 agent 的事，跟 skill 无关。

## 7. 跟 MCP、微服务放一起看，反差更明显

对比维度：

| 维度 | Java import | 微服务调用 | MCP 工具 | Agent Skill |
|------|------------|-----------|---------|------------|
| 依赖声明 | 编译期硬依赖 | 服务注册/发现 | 接口 schema | 无 |
| 数据传递 | 方法参数/返回值 | RPC/HTTP 报文 | 结构化输入输出 | agent 上下文 |
| 组合方 | 开发者写代码 | 网关/编排服务 | client 程序 | LLM 运行时决策 |
| 契约强度 | 最强 | 中 | 中 | 最弱（自然语言描述） |

skill 的契约就是 description 那段自然语言，靠 LLM 理解语义来匹配。弱契约的好处是极度灵活，坏处是确定性差——同一个 skill，换个模型、换个 agent，表现完全不同。

## 8. 这套设计的得失

**得到**：skill 极度可移植。一个 skill 就是一个目录加一个 SKILL.md，没有任何外部耦合。跟 npm 包、Docker 镜像的可移植逻辑类似。

**失去**：agent 层的编排逻辑没有标准化。规范管 skill 不管 agent，每个 agent 产品（Claude Code、Cursor、Gemini CLI、OpenCode）编排策略都不一样。同一个 skill 在不同 agent 上可能被组合出完全不同的执行路径。

## 9. 给 skill 设计者的实操建议

1. **把 skill 写得能独立跑通**。别设计成"这个 skill 必须跟那个 skill 配合才有意义"的结构。让 orchestrator agent 去编排，不是让 skill 互相牵手。
2. **description 是唯一的匹配入口，认真写**。agent 靠语义匹配决定激活哪个 skill，description 就是 skill 的接口契约。写清楚触发场景、能力边界、什么时候不该用。
3. **数据流转靠文件，别指望内存传递**。最稳妥的做法是让每个 skill 把产出写到约定路径的文件里，下一个 skill 去读这个文件。文件系统充当了 skill 之间的消息队列。
4. **编排逻辑集中放，别散在 skill 里**。谁先跑谁后跑、中间在哪里暂停等用户，这些决策放在 orchestrator agent 文件里。

## 总结

skill 层保持极简、无状态、可独立分发；真正的依赖关系和数据流转由 agent 的上下文窗口和运行时决策承载。这种"无依赖的依赖"设计跟 Java import、微服务调用、MCP 工具协议都不同——它的契约是自然语言，它的编排靠 LLM 理解语义，它的数据通道是文件系统。

skill 不是函数、不是服务、也不是工具，它是给 LLM 读的一段指令。它的依赖不在代码里，在上下文里。
