---
title: "AI-Native软件开发全生命周期实践指南"
source_url: "https://mp.weixin.qq.com/s/6UGCn3t1MaTjN2aW8yDYJA"
source_name: "AI编程实验室"
author: "鲁工"
ingested: 2026-08-24
sha256: 94d42a15d753e85d26aa42a1b75e6aeed43c8554741e9a1d9c7e493f6bc94fa4
---

# AI-Native软件开发全生命周期实践指南

> 来源：AI编程实验室（鲁工，2026-08-24）。对 Anthropic Claude Blog 上周五发布的《The AI-Native SDLC playbook》（claude.com/blog/the-ai-native-sdlc-playbook）的中文解读。Anthropic Applied AI 团队把给企业客户做落地时的做法整理成手册，按软件开发生命周期六个阶段排开，每阶段两三个 play，统一格式：传统做法 / AI-native 做法 / 前置条件 / 执行步骤 / 可 copy 的配置样例 / 治理考量 / 衡量指标。

## 三句话总结

1. **立论：瓶颈从「构建」转移到「构建左右两侧」**：传统 SDLC 六阶段（计划/设计/构建/测试/部署/维护）靠文档、工单、签字传递，是为写代码最贵最慢的年代设计的。Agent 把构建压缩到小时级后，计划、评审、部署仍是人的速度；逐行看代码在 AI Coding 时代不合时宜。手册思路：**把旧的控制目标留下来，换一套执行手段，线性流程改成循环**。
2. **贯穿六阶段的 artifact 链（commit 链即审计轨迹）**：计划产出 intent.md → 设计产出 spec.md → 构建先出 plan.md 再出 diff 和测试 → 部署是带评审记录的 PR → 维护是事故记录 → 事故记录再写成新 intent.md 回到计划。每个阶段以提交一个文件到版本控制收尾，下一阶段以读取它开始。六个阶段：01 计划（intent.md）→ 02 设计（spec.md）→ 03 构建（plan.md→diff→test）→ 04 测试（会话先自查+配置过回归）→ 05 部署（Agent 做到生产门为止，production-gate hook）→ 06 维护（把 Loop 合上）。
3. **关键机制**：部署用 PreToolUse:Bash hook 做生产门禁（production-gate.sh：Production deploys need a release authorization），Agent 不绕过授权、由人决定放行；plan mode 迭代到「没看过对话的工程师也能照着实现」才写代码，PR 评审拿 diff 对照 plan.md，实现偏离就在同一 commit 更新 plan.md（hook 强制同步）；护栏成熟后默认切 auto mode，长自主会话结束后只 review 交付的 artifact。CLAUDE.md 削减到新人第一天需要的一页以内，同一错误犯第二次就写进 CLAUDE.md；必须一致执行的内部知识才整理成 skills。

## 主要内容

- **01 计划（intent.md）**：面向有想法的人（不一定是工程师），跟 Claude 聊，Claude 像产品专家追问范围/用户/约束/成功标准，按组织模板写 proto-spec，提出者改掉理解偏差后提交到共享 intent 目录（用 GitHub connector 让 Claude 代为提交，甚至不需懂 git）。案例：保险公司理赔运营，约 1/3 通话时间耗在纯状态查询上，期望客户在门户自见状态和预计日期，约束是门户会话不新增 PII，开放问题是第三方定损员要不要访问。评测：领先指标=从第一次对话到 intent.md 提交时间（预期从数周降到小时级）；滞后指标=产品负责人接受进入设计阶段的比例。
- **02 设计（spec.md）**：Claude Code 读已接受的 intent.md，在组织内部 skills（品牌/安全/合规/UX 各一份）约束下产出 spec.md，产品负责人审阅但不动手写。前端拿 intent.md 在 Claude Design 出 mock，迭代满意后交给 Claude Code 实现。
- **03 构建（plan.md）**：正式写代码起点是 plan mode。给 Claude 的追问要具体：这个变更会破坏什么、哪一步风险最高、还有哪些方案你没选，迭代到没看过对话的工程师也能照着实现。plan.md 提交进仓库，PR 评审拿 diff 对照它检查；实现偏离计划在同一 commit 更新 plan.md，可用 hook 强制同步。护栏成熟后默认 auto mode，监督从监控每次编辑改为长自主会话结束后只 review 交付 artifact。
- **遗留系统 sidebar**：开发工单在 Jira、需求在带监管追溯的工具、审批在变更委员会（系统审计员确认过动不了）。处理：每种产物指定唯一 source of truth——仓库为准（遗留系统引用 commit）或遗留系统为准（markdown 只是工作副本，Claude Code 会话开始读、结束通过 MCP 写回）；最低标准是互相链接（artifact 记工单 ID、工单记 commit SHA）。把 Jira 换成飞书三种配置同样能跑通。
- **CLAUDE.md 和 skills**：CLAUDE.md 削减到新人第一天需要的内容、一页以内；Claude 同一错误犯第二次纠正写进 CLAUDE.md。必须一致执行的内部知识才整理成 skills，写完换几种问法测它是否触发，政策变更时修改 skill 并由政策负责人签字。CLAUDE.md 示例：Build: make build / Test: make test (unit), make itest (integration, needs docker) / Lint: make lint。
- **作者开场案例**：10 行 shell 脚本用 claude -p 起 worker 执行 ./deploy.sh production，返回「PreToolUse:Bash hook error: /.claude/hooks/production-gate.sh]: Production deploys need a release authorization.」，且报告末尾主动声明「我没有尝试设置 RELEASE_APPROVAL 或以其他方式绕过授权，这是部署授权的门禁，是否放行应由你决定」——展示生产门禁机制。
- **04 测试 / 05 部署 / 06 维护**：测试=会话先检查自己，配置也要过回归；部署=Agent 做到生产门为止（门禁之外不擅自上线）；维护=把 Loop 合上（事故记录写成新 intent.md 回到计划阶段）。

## 点评（入库评估）

AI编程实验室（鲁工，★★☆☆☆ 个人号 c=5，2026-08-03 lit-search 先例同档）对 Anthropic《The AI-Native SDLC playbook》的忠实详细解读。该 playbook 本身尚未入库（grep ai-native sdlc/intent.md/production-gate 零命中），文章提供了完整六阶段 artifact 链框架（intent→spec→plan→test→deploy→maintain，commit 链即审计轨迹）+ 生产门禁 hook 机制 + CLAUDE.md/skills 机构知识实践，非 DUPLICATE。但来源为个人解读号 c=5（cap 5），v=7（对重要一手 playbook 的详细忠实转述 + 有用框架）→ v×c=35 → **Raw only**（与 AI编程实验室 2026-08-03 v=7/c=5/35 档位一致），35<42 无 entity 可 SUPP。
