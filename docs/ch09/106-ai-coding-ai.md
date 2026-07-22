# AI Coding 入门指南：如何更好地让 AI 真正帮你干活

## Ch09.106 AI Coding 入门指南：如何更好地让 AI 真正帮你干活

> 📊 Level ⭐⭐ | 7.3KB | `entities/ai-coding-入门指南-如何更好地让ai真正帮你干活.md`

# AI Coding 入门指南：如何更好地让 AI 真正帮你干活

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/ai-coding-入门指南-如何更好地让ai真正帮你干活.md)

## 摘要

这是网盘主端团队编写的 AI Coding 入门指南，面向初次接触 AI 辅助编程的开发者。文章系统性地梳理了 AI Coding 的概念体系、工具层配置、标准开发流程和实战技巧，核心论点是：**AI Coding 的成败取决于上下文构建质量，而非模型能力**。文章将 Vibe Coding、Spec Coding、Rules、Skills 等概念统一到"上下文工程"这个核心框架下，提出了 Harness Engineering 的最小实践维度。全文约 9500 字，覆盖从认知到实战的完整链路。

## 核心要点

### 1. AI 替代了什么、没替代什么

- **替代了**：机械重复的编码动作（样板代码、CRUD）、低价值信息检索（查 API 文档、查语法）、简单逻辑拼接
- **没有替代**：理解需求背后的业务意图、架构决策和技术选型、组织上下文和识别边界条件、对生成结果的质量判断与把控
- **核心结论**：谁能更快、更准确地组织上下文，谁的 AI 生产效率就越高——这是一项新的核心技能

### 2. 三种编程范式

| 维度 | Vibe Coding | Spec Coding | Harness Engineering |
|------|-------------|-------------|---------------------|
| 方式 | 凭感觉，随时开始 | 规格先行，整理好再生成 | Rules + Skills + 标准流程打包 |
| 上下文 | 几乎不做准备 | 提前整理边界、状态、约束 | 团队级约束持久化 |
| 输出质量 | 不稳定，依赖运气 | 可预期，更高 | 团队规模化复用 |
| 适用场景 | 个人原型、一次性脚本 | 功能开发、生产代码 | 团队协作、规模化开发 |

一句话区分：Vibe 是"先射箭再画靶"，Spec 是"先画靶再射箭"，Harness 是"给每个人发一把校准过的弓"。

### 3. Harness Engineering 的最小实践维度

作者提出三个最小维度来理解 Harness Engineering：

1. **任务边界**——AI 负责什么、不负责什么
2. **背景信息**——代码库状态、业务约束、技术栈
3. **验收标准**——怎么算完成

这三个问题回答不清，AI Coding 必然失败。

### 4. Rules vs Skills 的本质区别

- **Rules**：写给 AI 看的"持久约束"，每次生成代码时自动生效。相当于《团队开发规范手册》。始终占用 Context Window。
- **Skills**：可复用的任务模板，把一类重复性生成任务封装起来。相当于《标准作业流程 SOP》。只在调用时占用 Context Window。

关键洞察：**把 AI 想象成刚入职的实习生——Rules 是规范手册，Skills 是 SOP。** Rules 内容要精简（持续占上下文），Skills 可以详细（按需加载）。

### 5. 上下文缺失的"道生一"效应

上下文不完整 → AI 基于假设生成代码 → 生成结果有偏差 → 在偏差基础上追加需求 → 偏差继续放大 → 最终代码面目全非。

**投入到前期上下文整理的时间，是整个开发流程里回报率最高的时间。**

## 深度分析

### 上下文是 AI Coding 的核心战场

这篇文章最核心的洞察不是某个具体技巧，而是把散落的概念统一到一个框架下：**Spec Coding = 给 AI 固定骨架，减少发散；Rules = 给 AI 划红线，避免犯错；Skill = 给 AI 塞套路，提升质量。工程规范 = 上下文的持久化与标准化。**

这个框架的价值在于：它让团队可以从"感觉 AI 不好用"升级到"上下文构建不足"的精确诊断。问题不再是"模型不行"，而是"我们没有给模型足够的信息"。

### 反例分析的价值

文章中三个反例（当搜索引擎用、上下文残缺、一次性要求全部功能）比正例更有教育价值：

1. **反例一**：Prompt 里没有任何上下文，AI 只能按最通用的方式理解——结果必然是"需要大面积修改，返工成本 > 自己手写成本"
2. **反例二**：缺少组件库、数据量级、权限数据结构、状态管理方式——每个缺失都会导致 AI 猜一个方案
3. **反例三**：单次生成 600 行代码，Review 负担过重，出错后难以精准定位——生成粒度太大

这些反例的共同模式：**缺失的上下文越多，AI 的"猜测"越多，猜测的累积误差越大。**

### 幻觉管理的"重启但不归零"策略

文章提出的幻觉应对策略值得记录：

1. **识别信号**：AI 答非所问、反复修改同一段代码、引用不存在的 API
2. **错误做法**：在已经"偏了"的对话上继续追问（越陷越深）
3. **正确做法**：重启对话，但先让 AI 总结当前状态（需求、已完成、未完成、问题、根因），把总结复制到新对话作为起点

### Rules 的六个陷阱

1. 子目录不自动继承父级 Rules
2. 多份 Rules 合并可能产生意外行为
3. 模糊规则（"写好代码"）会被忽略，需要具体约束
4. Rules 和 Skills 职责混淆——"任何时候"→ Rules，"做某件事时"→ Skills
5. Rules 变更需走 Review 流程并纳入 Git 版本管理
6. 修改后需重启或重新加载上下文验证生效

## 实践启示

- **标准开发流程**：先让 AI 出方案（不写代码）→ 确认边界让 AI 提问 → 分模块生成每次 Review → Rules 全程托底
- **语音输入法**：语音比打字快 3-5 倍，直接消除"写 Prompt 太麻烦"的障碍
- **"反问"模式**：让 AI 先提问——"在开始之前，你有哪些不确定的地方需要我补充？"——AI 的提问会帮你发现忽略的边界条件
- **分层 Review**：逻辑正确性 → 边界处理 → 代码规范，不要一次性 Review 所有东西
- **Context Window 管理**：随着对话变长，早期约束会"掉出"窗口，AI 会"忘记"技术栈要求——需要主动管理上下文长度

## 相关实体

- [Harness Engineering](https://github.com/QianJinGuo/wiki/blob/main/concepts/harness-engineering-framework.md)
- [Context Engineering](https://github.com/QianJinGuo/wiki/blob/main/concepts/context-engineering.md)
- [Spec Coding](https://github.com/QianJinGuo/wiki/blob/main/concepts/specification-driven-agent-development.md)
- [Claude Code Dynamic Workflows](ch09/092-claude-code-dynamic-workflows.html)
- [MOC](https://github.com/QianJinGuo/wiki/blob/main/moc/memory-context-systems.md)

---

