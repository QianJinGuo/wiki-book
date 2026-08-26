# AI Native SDLC Playbook：Anthropic 应用 AI 团队的软件开发生命周期重构方法论

## Ch04.639 AI Native SDLC Playbook：Anthropic 应用 AI 团队的软件开发生命周期重构方法论

> 📊 Level ⭐⭐ | 5.5KB | `entities/ai-native-sdlc-playbook-anthropic.md`

# AI Native SDLC Playbook：Anthropic 应用 AI 团队的软件开发生命周期重构方法论

> **Background**：本文基于对 Anthropic 官方《The AI-Native SDLC playbook》的两篇中文解读（夕小瑶科技说 2026-08-26、AI编程实验室/鲁工 2026-08-24）综合建立。Anthropic 应用 AI 团队把给企业客户做 AI 落地时的做法整理成手册，按传统软件开发生命周期六阶段（计划/设计/构建/测试/部署/维护）逐一重做。

## 立论：瓶颈从「构建」转移到「构建左右两侧」

传统 SDLC 六阶段靠文档、工单、签字传递，是为写代码最贵最慢的年代设计的。Agent 把构建压缩到小时级后，计划、评审、部署仍是人的速度；逐行看代码在 AI Coding 时代不合时宜。手册思路：**把旧的控制目标留下来，换一套执行手段，把线性流程改成循环**。

当写代码变成最快的一步后，组织流程与治理机制没跟上，于是出现两种失败模式：要么 code review 一直堆积，要么代码带着风险直接上线。

## 贯穿六阶段的 artifact 链（commit 链即审计轨迹）

每个阶段以提交一个文件到版本控制收尾，下一阶段以读取它开始。

| 阶段 | 产物 | 说明 |
|------|------|------|
| 01 计划 | intent.md | 面向有想法的人，Claude 像产品专家追问范围/用户/约束/成功标准 |
| 02 设计 | spec.md | 在组织内部 skills（品牌/安全/合规/UX）约束下产出 |
| 03 构建 | plan.md → diff → test | 先出实现计划再写代码和测试 |
| 04 测试 | 会话自查 + 配置回归 | 护栏成熟后默认 auto mode |
| 05 部署 | 带评审记录的 PR | production-gate hook，Agent 不绕过授权 |
| 06 维护 | 事故记录 | 事故记录写成新 intent.md 回到计划，Loop 合上 |

这一串文件同时给人读，也给 AI 接着执行。版本会记录谁提了需求、AI 产出了什么、谁批准了什么——整条链路是一条可被追溯的执行轨迹。

## 关键机制

- **production-gate hook**：部署用 `PreToolUse:Bash` hook 做生产门禁（Production deploys need a release authorization），Agent 不绕过授权、由人决定放行。
- **plan mode 迭代标准**：迭代到「没看过对话的工程师也能照着实现」才写代码；PR 评审拿 diff 对照 plan.md，实现偏离就在同一 commit 更新 plan.md（hook 强制同步）。
- **CLAUDE.md 精简**：削减到新人第一天需要的一页以内；同一错误犯第二次就写进 CLAUDE.md；必须一致执行的内部知识才整理成 skills。
- **人类职责转移**：人类仍然对需要判断力的决策负责，从事事亲力亲为挪到在关键节点审核 AI 已完成的产出。

## 遗留系统 sidebar

遗留系统（Jira 工单 / 带监管追溯的工具 / 变更委员会）处理原则：每种产物指定唯一 source of truth——仓库为准（遗留系统引用 commit）或遗留系统为准（markdown 只是工作副本）；最低标准是互相链接（artifact 记工单 ID、工单记 commit SHA）。把 Jira 换成飞书三种配置同样能跑通。

## 与既有方法论的关系

本文档与 [Loop Engineering](https://github.com/QianJinGuo/wiki/blob/main/concepts/loop-engineering-methodology.md) 共享「把线性流水线改成循环」的核心直觉，但 Anthropic 版本更强调六阶段 artifact 链与版本控制审计轨迹的工程落地。与 [AI-DLC（紫讯）](../ch05/022-ai-native.html) 同属 AI-native 研发流程主题——AI-DLC 是组织级四件套实践（知识底座/流程契约/系统约束/协作平台），Anthropic 版本是官方方法论手册，两者互补。

## 关联

- 相关概念: [Harness Engineering](https://github.com/QianJinGuo/wiki/blob/main/concepts/harness-engineering-framework.md)、[Coding Harness Engineering](https://github.com/QianJinGuo/wiki/blob/main/concepts/coding-harness-engineering.md)、[SDD 规范驱动开发](https://github.com/QianJinGuo/wiki/blob/main/concepts/sdd-specification-driven-development-harness.md)
- 相关实体: [AI-DLC（紫讯）](../ch05/022-ai-native.html)、[采用 AI Coding Agent 的六课](ch04/410-ai-coding-agent.html)、[Agentic AI 系统架构](../ch05/108-harness-skill.html)

→ [第 1 来源原文](https://github.com/QianJinGuo/wiki-book/tree/main/docs/raw/articles/ai-native-sdlc-playbook-anthropic-2026.md)
→ [第 2 来源原文](https://github.com/QianJinGuo/wiki-book/tree/main/docs/raw/articles/ai-native-sdlc-playbook-lugong-aicodinglab-2026-08-24.md)

---

