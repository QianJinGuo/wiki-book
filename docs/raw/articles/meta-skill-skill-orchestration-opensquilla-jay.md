---
title: "Meta Skill：Skill 之上编排 Skill 的抽象层（OpenSquilla）"
source_url: "https://mp.weixin.qq.com/s/bsuGN9a4XaeLpPwMM-WVag"
publish_date: 2026-06-04
tags: [wechat, article, meta-skill, opensquilla, skill-orchestration, agent-workflow, long-horizon, routing, token-optimization, project-manager, abstraction]
review_value: 8
review_confidence: 8
review_recommendation: strong
sha256: 29f67f8f88ec4364240ae04bc2e446bd944c9b102e70213e445470c0cc506dda
---
# Meta Skill：Skill 之上编排 Skill 的抽象层
> 整理自量子位 Jay 报道
> 原文：https://mp.weixin.qq.com/s/bsuGN9a4XaeLpPwMM-WVag
> GitHub：https://github.com/opensquilla/opensquilla
> 项目状态：2026-06-04，2,757 ⭐，Apache-2.0，Python
> 团队：基元律动（创始人王云鹤）

## 一句话定位
**Meta Skill = "Skill 的 Skill" = 多个原子 Skill 的"项目经理操作手册"。** 把多步骤编排、并行/串行决策、产出物上下游衔接，**全部内嵌到一份 SKILL.md**，端到端打通一整套长程 Workflow。

> "当员工（Agent）变多，业务（Skill）变多，必然会遇到指数级放大的噪音。Meta Skill 是用来指导 Agent 三省六部的白皮书。"

## 解决了什么问题
**SOP 已经梳理清楚，但每个蓝色方块都要在对话框单独调 Skill** —— 像戳一下动一下，全程 Human in the loop，光翻 Skill 列表就够忙活半天。

工作流固化后，**把所有上下文炼化成超级 Skill**：自动判断当前阶段 → 调用对应子 Skill 交付结果 + 心跳机制定时查状态文档 → 完全自动化推进。

> 关键转换：从"手动组合 Skill"到"Skill 自我编排"。

## 9 个内置 Meta Skill（仓库）
- **meta-kid-project-planner**：儿童项目规划（科学展/兴趣手工/创意小发明）
- **meta-skill-creator** ← 最重要的一个：用来创建 Meta Skill 的 Meta Skill
- 其他 7 个未在文章中详述

## 典型实测：meta-kid-project-planner
**Prompt**：
> 孩子9岁，想做一本 Meta Skill 魔法书，先网页呈现再做纸质小书，每页介绍一个咒语。

**内部流程**（5 个原子 Skill 拼接）：
1. **立项**：询问用户偏好（年龄/周期/预算/家长参与度）
2. **可行性分类**：判断安全/需不需要大人帮/要不要额外买东西
3. **执行**：分步计划 → 材料清单 → 安全提醒 → 家长学习目标 → 最终组装交付
4. **外部信息**：户外活动 → web search 查天气
5. **安全审查**：单独一轮为儿童场景跑安全 filter

**结果**：
- 全程无需人介入，自己跑 20+ 分钟
- 交付完整 7 天项目规划包（3000 字 md）
- 再用 Claude Opus 4.7 把上下文搓成 HTML（交互式翻页动画）
- 哈利波特风格指令讲解 + 「魔镜魔镜」Skill 选择器

## 三大要素组合
| 要素 | 角色 | 类比 |
|---|---|---|
| **Meta Skill** | "项目经理的操作手册"——决定哪些步骤并行/串行、产出物上下游衔接 | PM |
| **智能路由** | "老虎机"——每个子步骤根据复杂度分配最便宜的合适模型 | 预算管理 |
| **Meta-skill-creator** | 写 PM 手册的元方法——把"想清楚 SOP"这件事工业化 | PM 培训 |

> 三个加起来：调度 + 预算 + 写调度说明书的工具 —— **端到端闭环**。

## 真实痛点
- **Meta Skill 创建成本高**：单个 kid-project-planner 400+ 行 SKILL.md，跟 AI 迭代 ~30 分钟（前提是你脑中已有清晰 SOP）
- **跨行业 Know-How 整合灾难**：内容行业还能凑合，跨行业专家经验排列组合 = 不可行
- **社区 Skill 爆炸后供需匹配**：未来上百个 Meta Skill，如何知道哪个最适合场景

## 解决方案：个人 × 社区索引协议
> "你平时常用哪些 Skill、偏好什么组合顺序、哪个试过不好使……这些会作为信号，被 Agent 拿去匹配社区里别人做好的 Skill，然后根据你的工作流缝合出个新的。"

- **个人侧信号采集**：Skill 使用频率/偏好/拒绝
- **社区侧 Skill 共享**
- **自动推荐引擎**：根据个人信号 + 社区 Meta Skill 库，缝合新方案
- 简单来说：**自动的 Skill 推荐引擎**

## 范式：Skill 2.0
> "单个 Skill 已经不够用了，自动化想要进一步深入，必须要学会对多个子 Skill 排列组合。
> Agent 下一步要解决的问题，已经从'会不会调用工具'，变成了'**会不会组织工具**'。"

| 维度 | Skill 1.0 | Skill 2.0 (Meta Skill) |
|---|---|---|
| **粒度** | 一个 Skill 干一件事 | 多个原子 Skill 拼接 |
| **编排** | 手动（Human in the loop） | SKILL.md 写清楚并行/串行 |
| **选择** | 人工翻 Skill 列表 | 自动按上下文判断 |
| **预算** | 全部用最贵模型 | 按子任务复杂度路由 |
| **生产** | 手写 | Meta-skill-creator 辅助生成 |
| **匹配** | 关键词搜索 | 个人信号 × 社区推荐 |

## 三条线交点
为什么 Skill 2.0 **现在**出来？
1. **模型**：复杂多步骤指令理解能力飞速拉升，Agent token 数据飞轮已转
2. **生态**：社区 Skill 爆发式增长（手写→自动生成→社区共享）—— 当可选 Skill 成千上万时，需要 Meta Skill 这种更高抽象
3. **成本**：大规模跑大模型依然贵；Meta Skill 把"trial-and-error 烧 token"前置到 Skill 层

> 三个痛点同时指向了又一次正在被倒逼出来的范式迭代。

## 与多 Agent 团队的关系
> 最近不少模型都推出了自己的 Agent 团队：腾讯 Marvis / MiniMax Mavis / Kimi Agent 集群。
> 但 Skill 层似乎还停留在 Claude 带火时的阶段 —— **社区基本都还在为单个模型写 SKILL.md**。
> 多 Agent 的潜能其实一直没能被完全释放。

**Meta Skill 的可能性**：专为 Agent 团队设计的白皮书，赋予模型更宏观的全局上下文 —— **从单兵作战到团队作战**。

## 实测 Token 节省
- **整体**：比龙虾（Hermes Agent 类）省 60-80%
- **弱智问题**：3 分钱搞定（"你前面看到的那个'老虎机'，就是帮这位 PM 做预算管理"）
- **子任务路由**：提取孩子年龄/偏好 → DS 即可；安全审查 + 14 天规划 → 大模型
- **可关闭/锁定**：可关掉智能路由，也可 Prompt 锁定特定模型

## 安装
```bash
# Install uv
curl -LsSf https://astral.sh/uv/install.sh | sh
. "$HOME/.local/bin/env"
# Install OpenSquilla
uv tool install --python 3.12 "opensquilla[recommended] @ https://github.com/opensquilla/opensquilla/releases/download/v0.3.0/opensquilla-0.3.0-py3-none-any.whl"
# Configure and run
opensquilla onboard
opensquilla gateway run
```
- Mac/Linux 走终端
- Windows 走压缩包
- 入口：飞书 / Discord / QQ / Web（智能路由老虎机和 Token 节省动画**仅网页端**）

## 相关资料链接
- GitHub: https://github.com/opensquilla/opensquilla
- Skill 魔法书（9 个 Meta Skill HTML 讲解）: https://imtangyujing.github.io/opensquilla-meta-skill-grimoire/
