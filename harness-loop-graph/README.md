# 《智能体工程三原语：Harness、Loop、Graph》

**Agent Engineering: The Three Primitives — Harness, Loop, Graph**

> 从概率模型到可靠系统：给资深工程师的智能体工程手册
> From probabilistic models to reliable systems: a field manual for senior engineers

本书基于 [Hermes Wiki](https://github.com/QianJinGuo/wiki-book) 知识库（~/wiki，截至 2026 年中约 2,700+ 篇实体笔记、16,000+ 条交叉链接）系统编撰，中英双版内容对等。所有关键论断与数据均标注出处：库内笔记路径（见各章"本章参考"与附录 C）或公开文献（论文、官方工程博客）。**本书不杜撰数据；对存在争议的命题（如"模型进步是否会让 Harness 工程贬值"），本书同时呈现正反方证据与裁决框架。**

## 核心主张

智能体工程的全部问题，可以归纳为三个原语：

| 原语 | 回答的问题 | 一句话 |
|------|-----------|--------|
| **Harness** | 单次任务怎么才能可靠？ | `Agent = Model + Harness`，模型决定上限，Harness 决定这个上限能否稳定释放 |
| **Loop** | 任务怎么持续发生并自我纠偏？ | 提示给 Agent 的是指令，循环给 Agent 的是一份工作；没有验证器的循环是失控的自动化 |
| **Graph** | 多个上下文怎么协同？ | 状态机与编排拓扑：LLM 负责产生动作，图负责决定什么时候做什么 |

三者是层级关系而非并列关系：**Loop ⊃ Harness ⊃ Context ⊃ Prompt**。

## 与 hello-agents 的定位差异

本书对标 [datawhalechina/hello-agents](https://github.com/datawhalechina/hello-agents)（16 章，从 LLM 基础教到多智能体应用）。两本书互补：

- hello-agents 教你**从零构建**智能体与应用（框架、范式、代码全流程），面向入门到中级；
- 本书教你**让智能体在生产中可靠运行**（Harness/Loop/Graph 三原语 + 评估 + 治理），面向已被"demo 惊艳、上线翻车"伤害过的资深工程师。本书假设你已会调用 LLM API、用过至少一个编码智能体。

## 目录（中英对等）

- 前言（阅读指南 / 三原语模型 / 编撰方法）
- **第一部 · 基石**：Ch1 从生成到交付；Ch2 模型的边界
- **第二部 · Loop 工程**：Ch3 解剖 Agent Loop；Ch4 验证器优先；Ch5 让循环持续
- **第三部 · Harness 工程**：Ch6 五层架构与最小可行 Harness；Ch7 上下文工程；Ch8 工具、权限与护栏；Ch9 状态与记忆
- **第四部 · Graph 工程**：Ch10 从循环到图；Ch11 多智能体编排
- **第五部 · 生产与治理**：Ch12 评估与可观测；Ch13 衰减、主权与工程师的下一站
- **附录**：A 术语表；B 检查清单合集；C 参考文献

## 本地构建

```bash
pip install mkdocs-material mkdocs-material[imaging]

# 中文站
mkdocs serve -f harness-loop-graph/mkdocs.yml     # http://127.0.0.1:8000

# 英文站
mkdocs serve -f harness-loop-graph/mkdocs-en.yml -a 127.0.0.1:8001
```

## 许可

与所在仓库一致（见仓库根目录 LICENSE）。书中引用的库内笔记遵循原知识库约定；引用的公开数据版权归原出处，各章参考中已逐条标注。
