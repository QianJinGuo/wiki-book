---
title: "openJiuwen开源SwarmFlow — 从'能协作'到'稳稳地干完'，开创蜂群可控协同新范式"
source_url: "https://mp.weixin.qq.com/s/phRUNiBQonR-22DRKFvLZA"
mp: "AI技术立文"
pub_date: "2026-06-12"
ingested: "2026-06-12"
sha256: "0f6d30060b218fffb31e648695d5e8b2769d4581283bb0202c4dbd56dc05f52a"
type: source
tags: ["multi-agent", "swarmflow", "openjiuwen", "jiuwenswarm", "orchestration", "coordinat-2026-06"]
---

# openJiuwen开源SwarmFlow — 从"能协作"到"稳稳地干完"

## 核心论点

在单个 AI Agent 能力天花板显现后，"组队干活"成行业共识，但**真正考验的不是"能不能配合"，而是"这套配合方式能不能被稳定、可控地反复执行"**。

openJiuwen 最新开源的 **SwarmFlow** 是一种面向多智能体团队的可控工作流编排方案，目标让团队协作从"临场发挥"变成"按流程交付"。**核心思路一句话：编排归系统，智能归 Agent**——谁先做、谁并行、谁把结果交给谁，编排交给系统按程序稳定执行；每个子任务具体怎么理解、怎么推理，智能才交给 Agent。SwarmFlow 增加的不是 Agent 数量，而是**协作的确定性**。

## 三个绕不开的问题（复杂任务带来的考验）

主流多 Agent 协作模式（Leader Agent 临场调度）在面对长链路、多分支任务时：

1. **Leader 变成瓶颈**：每份中间结果都回 Leader，上下文被过程信息淹没
2. **过程不稳定**：同一任务跑两次可能走出两条不同路径（每步都取决于 Leader 当场决定）
3. **执行不可靠**：谁先做、谁并行、什么时候汇总、失败怎么处理，即便提前写清楚，仍依赖 Leader 临场发挥

## SwarmFlow 在架构中的位置

SwarmFlow 不是另起炉灶，它长在 **Swarm Skill** 里：
- **Swarm Skill** = 团队协作的能力包（有哪些角色、各自负责什么、如何协作）
- **SwarmFlow** = 团队协作中"可执行编排"的那部分

当一支团队的协作流程可以提前确定时，就把编排写进 Swarm Skill 的 `scripts/workflow.py`，让它从"靠 Agent 临场照做"变成"被系统直接执行"。

## 关键设计：Swarm Skill 的两种形态

**判定标准只有一个：编排能不能提前确定？**

### 形态一：不带 workflow.py 脚本 — 保留开放协作

适合编排本身就动态的场景（多专家圆桌研讨、方案评审、战略讨论）。议程是确定的（独立思考、相互讨论、观点汇总），但谁回应谁、谁质疑谁，得在协作过程中自然发生。强行写成脚本会束缚协作。

### 形态二：带 workflow.py 脚本 — 承接可执行编排

适合编排可以提前确定的任务（论文分析、办公自动化）。论文解析的结果交给总结，总结交给文档生成，文档再交给邮件撰写——谁接谁、下一步做什么都能提前定好，于是脚本里用 SwarmFlow 把这套编排固化下来。

**一句话总结：编排是动态的，用不带脚本的 Swarm Skill 保留开放协作；编排能提前确定，用带脚本的 Swarm Skill 承接可执行编排。**

## 算子积木（Operator Library）

openJiuwen 提供了一组算子当积木，用于搭建 SwarmFlow——每个算子只管一件事，拼起来就能描述出复杂的团队协作。四类算子：

1. **派生智能体**：去执行子任务
2. **并发与流转**：让多个智能体以不同方式并发（parallel / pipeline / agents_session）
3. **阶段切分**：把长流程切分成可观察的阶段，支持子流程复用
4. **人机交互**：在关键环节插入人机节点（human node）

### 几个值得一提的设计

- **并发不止一种**：parallel（几个智能体一起跑、全部完成后统一汇总，适合多视角研判后合并）vs pipeline（多个条目各自独立逐级流过、互不等待，适合批量逐条处理）
- **agents_session**：有状态智能体能在多轮协作中保留记忆，甚至"分身"出一个副本去做假设推演而不污染主线
- **human 节点**：需要人拍板时插入人机节点，向人类要一条输入或一次审批
- **budget 算子**：专门约束资源与额度消耗，把"会不会跑超"也纳入了可控范围

## 可视化：JiuwenSwarm TUI

SwarmFlow 不是黑盒。用户通过 `/swarmflows` 打开内置可视化视图，用一张**实时交互式树状图**查看当前会话里的所有 Swarm Workflow：
- 上方展示**阶段进度**
- 下方联动展示选中阶段里的 **Agent 状态**
- 需要排查时，可下钻到单个 Agent，查看**提示词、输出结果或错误日志**

## 生成端：SwarmSkill Creator

JiuwenSwarm 内置 SwarmSkill Creator，根据自然语言需求**自动判断该生成哪种形态**：
- 默认生成不带脚本的 Swarm Skill（角色、协作规则、流程说明、约束），适合开放协作
- 判断用户要的是一条工作流（"帮我写一条工作流，逐篇分析这批论文、汇总成报告再发邮件"）→ 生成仅含脚本的版本（最小 Skill.md + workflow.py）
- 两者都要时支持生成完整协作规范 + 脚本的版本

**用户不必先理解文件结构，也不必手写编排脚本。**

## 调用端：Team 模式自动进入

用户不用分辨任务属于哪种形态，在 Team 模式下一句需求自动进入。系统判断任务形态：
- 适合固定编排 → 进入 SwarmFlow
- 更适合开放协作 → 用不带脚本的 Swarm Skill
- 单个 Agent 够用 → 不额外启动多 Agent

**这是 openJiuwen 想定义的可控协同工程新范式——让复杂协作在系统内部变得可控，让用户侧保持自然和简单。**

## 三个实战场景

### 场景一：从一张流程图，生成金融分析 SwarmFlow

用户上传流程图，JiuwenSwarm 基于该流程图使用 SwarmSkill Creator 直接生成对应 SwarmFlow 团队技能，包含工作流执行脚本——**整条 SwarmFlow 不用手动编排，由一张图直接生成**。

- 数据采集、清洗
- 5 个维度并行分析（财务、行情等）
- 交叉验证、综合置信度
- 输出完整分析报告和总结建议

### 场景二：技术调研 + 邮件发送

给定技术分享主题和目标读者，SwarmFlow 自动组织多阶段：
1. 搜索相关论文和资料
2. 整理素材、提取可用图片并保存到本地目录
3. 分析核心问题、技术趋势、关键观点、可讨论议题
4. 生成结构清晰的分享邮件并发送

技术分享是会反复发生的团队工作，SwarmFlow 把流程固化下来，避免步骤遗漏、口径变化、交付不一致。

### 场景三：200 页 PPT 稳定产出

基于已有团队技能补充工作流，**设计三阶段流程**：
- 阶段一：规划章节主题和分工
- 阶段二：**10 个章节并行生成 PPT**
- 阶段三：合并汇总，整理成 200 页完整 PPT

做大型 PPT 正是那种"步骤固定、但量大易乱"的任务：两百页若全靠 Leader 一页页临场调度，每次跑出来的结构、风格、详略都可能不一样；固化成工作流之后，既靠并行明显加速，又能稳定产出结构统一、风格一致的 200 页 PPT。

## 自演进引擎

Swarm Skills 支持自演进——**演进引擎持续观察任务执行轨迹，自动反推可优化的点**（增减角色、补充规则、沉淀成员经验等），提交用户审批即可更新技能。

从生成工作流（可控）到自演进（越用越强），沉淀、编排、演进三者环环相扣，构成 Coordination Engineering 的完整闭环。

## 上手指南

```bash
# 安装 JiuwenSwarm（提供 exe 安装包）
# 安装 JiuwenSwarm-TUI
pip install jiuwenswarm-tui
# 启动
jiuwenswarm-tui

# 在 TUI 中切换到 Team 模式
/mode team
```

**Tips**：
- 建议在 query 中明确指出"使用 SwarmFlow 模式"
- 若报缺少"swarmskill-creator"，可在"技能广场-预置"点击安装

## 开源地址

- **JiuwenSwarm** (AtomGit): https://atomgit.com/openJiuwen/jiuwenswarm
- **JiuwenSwarm** (GitHub): https://github.com/openJiuwen-ai/jiuwenswarm
- **Swarm Skills Hub**: https://swarmskills.openjiuwen.com/

## 社区背景

openJiuwen 是华为支持的开源 AI Agent 平台社区，标杆智能体 JiuwenSwarm 沉淀了 openJiuwen 平台在 **Harness 工程、多智能体协同、自演进、算力亲和**等关键能力。华为云 AgentArts 已将 openJiuwen 引入商业化平台能力中。
