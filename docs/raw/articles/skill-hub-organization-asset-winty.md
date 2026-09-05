---
title: "AI 越用越聪明公司却越用越白用：Skill Hub 是企业级 AI 经验资产化的关键"
source_url: https://mp.weixin.qq.com/s/MDyTPOVEHpu-ocrpBENdLg
ingested: 2026-06-02
sha256: fe0257ae68099fc8b90d20d6d2a47376f945e56cbc663f330d653f30ee413e1b
author: "winty"
feed: "前端Q"
published: 2026-06-02
tags: [skill-hub, skill-governance, organization-asset, hermes-agent, winty, ai-tax, ai-platform, agent-architecture]
---

## When to use
当用户准备发布前端服务到生产时使用

## Steps
1. 检查是否有未提交变更
2. 拉取最新 main 分支
3. 跑 lint / typecheck / unit test
4. 跑 build
5. 生成 changelog
6. 提示需要人工 QA 的页面
```

效果好多了。但问题：
- 这个 Skill 只在老张工作目录里，**别人用不到**
- 它没考虑小李的支付页面回归
- 它没考虑阿强的 vault 路径
- 它的"成功"和"失败"只能靠老张主观判断

### 第三阶段：进入 Skill Hub

把 Skill 推送到企业 Skill Hub 之后：
- **小李**提 PR，加"如果改动涉及 pages/payment/* 必须发起人工 QA 流程"
- **阿强**加一段从 vault 拉环境变量的步骤
- Skill Hub **自动给这个 Skill 跑 50 个历史发版回放，生成正确率报告**
- v1.1.0 上线时**先在风控团队灰度三天，没问题再全量**
- 所有调用都进了**审计日志**：谁、什么时候、用了哪一版、结果如何

**到这一步，"前端发版"不再是老张脑子里的隐性经验，而是一份组织资产**：
- 有版本号
- 有 owner
- 有审核记录
- 有评估指标
- 有灰度策略
- 有回滚机制

> **当 Skill 进入 Hub，它就从"个人聪明"变成了"组织默认聪明"。**
>
> 新人入职那天，AI 就已经知道怎么帮他发版了，因为这套经验已经在 Skill Hub 里。

## 6. 没有 Skill Hub，会发生什么

很多公司觉得"我们先用着，再慢慢治理"——最后基本都会进入两个状态：

### 状态一：Prompt 失控

- 每个团队各写各的 Prompt，每个项目各接各的 MCP，每个人各调各的模型
- 突然有一天 AI 输出变笨了，没人能查出哪一段 Prompt 改坏了
- **调试一次至少消耗一个工程师两天**

> 这其实和早年没做日志规范、没做监控规范的项目最后变成"线上一出问题查不出来"是一回事。

### 状态二：能力孤岛

- A 团队的"代码评审 Agent"和 B 团队的"代码评审 Agent"，各做各的
- 互相不知道对方踩过什么坑
- **一年下来，公司层面 AI 能力没有"叠加"，只是"重复"**

> 平台朋友的话：**"前两年我们在补的是 DevOps 课，未来两年我们要补的是 AIOps、Skill Ops 的课。AI 不像普通工具，越没规则越乱。"**

## 7. Skill Hub 不是大公司专属

**判断标准不是"公司大不大"，而是这两个问题**：
- 你的 AI 能力**是否需要被多人共享**？
- 你**是否在乎** AI 在生产环境里的稳定性？

只要这两个里有一个回答"是"，就值得把 Skill 当成正经资产管。

### 中小团队最小可用 Skill Hub

- 一个 Git 仓库当 Skill 仓库
- 一个 GitHub Actions 跑自动化评估
- 一个简单的 issue 模板做审核
- 一个共用的飞书表格记录使用统计

**也能跑得起来一个最小可用的 Skill Hub**。

## 8. 我的判断

> 企业 AI 落地走到 2026 年这个节点，最大的瓶颈不是模型不够强，也不是工具不够多。
>
> **最大的瓶颈是：企业还没准备好把 AI 学到的东西管起来。**

- 模型每年都在升级
- 工具每月都在更新
- Prompt 每天都在被人改

如果一个组织**没有"AI 能力资产"这一层**，它的 AI 投入就只是"个体生产力工具"，永远变不成"组织能力"。

> **Skill Hub 的真正意义，是给企业一个机会，把 AI 的智慧从个人脑子里、从一次次的对话里、从分散的工具配置里，沉淀成一份可见、可管、可评估、可演进的组织资产。**

---

- 原文：winty / 前端Q / 2026-06-02
- 系列：Hermes Agent：构建自进化 Agent 系统
- 下一篇预告：一个真正能上线的 Skill 应该长什么样（Skill 的设计规范）

## 进一步阅读

- Hermes Agent 官方文档：https://hermes-agent.nousresearch.com/docs/
- Hermes Agent Skills：https://hermes-agent.nousresearch.com/docs/user-guide/features/skills
- Anthropic: Building Effective Agents（关于 Workflow vs Agent 与组织级能力沉淀的部分）
