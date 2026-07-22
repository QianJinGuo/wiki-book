---
title: "手把手：用 Hermes Skills + Karpathy 的 LLM Wiki 让 AI 越用越懂你"
description: "三层结构：Memory记住你是谁、Skills记住怎么干活、Wiki目录组织零散知识。三十多个Skill两个月搭建，渐进式披露避免context撑爆"
source_url: "https://mp.weixin.qq.com/s/KE4BRvYJJysKpoy3jpaFbQ"
feed_name: "AI赋能说"
author: "AI赋能说"
published: 2026-05-08
created: 2026-05-27
type: raw
tags: [hermes, skill, llm-wiki, karpathy, knowledge-management, agent]
sha256: bbafddc74d38614876173af8437540c8f057fbc3f922ec65167729a3b2837dcb
---

## When to Use
当完成功能开发，准备提交 PR 的时候。

## Procedure
1. 读取 git diff 的变更摘要
2. 按模板填写：Summary / Changes / Testing
3. 如果涉及 breaking change，加 Migration 段落

## Pitfalls
- 不要把实现细节写进 Summary
- Testing 段落要写实际跑过的命令

## Verification
PR 描述包含三个必填段落，且 Summary 不超过两句话。
```

五个部分：frontmatter是元信息，When to Use告诉agent什么时候加载，Procedure是步骤，Pitfalls是坑，Verification是完成标准。

## 第三步：让 agent 自动创建 Skill

不用自己写所有 Skill。agent完成一个复杂任务后（5个以上工具调用），它会判断这个过程是否值得记录，如果值得就自动创建。

```
agent 完成复杂任务 → 问"要不要把这个过程存为 Skill" → 用户确认 → ~/.hermes/skills/ 里多一个新文件夹
```

## 第四步：搭建 Wiki 目录（Karpathy 的 LLM Wiki 思路）

```bash
mkdir -p ~/wiki
touch ~/wiki/index.md
touch ~/wiki/log.md
```

**index.md** 是空间维度，按主题组织知识：

```markdown
# Knowledge Index

## 项目
- [[project-alpha]] - 电商后台重构
- [[project-beta]] - 数据管道

## 工具链
- [[docker-patterns]] - 常用 Docker 配置
- [[git-workflows]] - 团队 Git 规范
```

**log.md** 是时间维度，每次有新发现追加一条：

```markdown
# Knowledge Log

## 2026-05-07
- 发现 pnpm workspace 的 catalog 功能可以统一依赖版本
- Hermes skill_manage patch 比 edit 省 token

## 2026-05-06
- PostgreSQL NOTIFY/LISTEN 比轮询省资源
```

**沉淀规律**：log里反复出现的条目，就该提炼成Skill或index里的一个页面。

## 第五步：配置外部 Skill 目录

```yaml
# ~/.hermes/config.yaml
skills:
  external_dirs:
    - ~/wiki/skills
    - ~/team-repo/shared-skills
```

好处：Wiki里沉淀的方法论可以直接变成Skill；团队共享的Skills放在Git仓库，新人clone一下agent立刻知道团队工作方式。

## 第六步：用 Skills Hub 补充能力

```bash
hermes skills browse
hermes skills search "code review"
hermes skills install systematic-debugging
hermes skills check
hermes skills update
```

作者装了几个通用底层能力：systematic-debugging、test-driven-development、verification-before-completion，几乎每天触发。

## 第七步：建立复利循环

日常工作流：
1. 做任务。agent 加载相关 Skill，按步骤执行
2. 任务完成。如果过程复杂，agent 创建新 Skill
3. 如果有新发现，追加到 wiki/log.md
4. 每周看一次 log。反复出现的模式，提炼成 Skill 或 index 条目

**一个月后的效果**：Skills目录从0变成20+，agent不再问"用什么测试框架""PR格式是什么""部署到哪个环境"，因为它做过。

## 关于 token 效率

不会撑爆context。渐进式披露：
- Level 0：只有名字和描述列表，大概3000 token
- 需要时 才加载完整内容

而且 skill_manage patch 可以只改 Skill 的一小段，省 token，也保留历史演化痕迹。

## Memory 和 Skills 的配合

- **Memory** 存事实：我用pnpm，项目部署在AWS ap-northeast-1，我讨厌console.log调试
- **Skills** 存方法：怎么用pnpm workspace初始化monorepo，怎么部署到ap-northeast-1的ECS，怎么用debugger替代console.log

Memory让agent认识你。Skills让agent能帮你。两个一起才是完整的个人知识系统。

**核心不是工具，是习惯**：做完一件事多花三十秒想一下"这个过程值得记住吗"，值得就记录。三十秒换来的是下次不用再花三十分钟。

这就是复利——不是知道得越来越多，是做得越来越快。

## 参考资源

- [Skills System 文档](https://hermes-agent.nousresearch.com/docs/user-guide/features/skills)
- [Karpathy LLM Wiki gist](https://gist.github.com/karpathy/1dd0294ef9567971c1e4348a90d69285)
- [Hermes Agent GitHub](https://github.com/nousresearch/hermes-agent)