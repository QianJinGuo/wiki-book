---
title: "浅谈 SKILL 研发的最佳实践——以百补详情助手为例"
source_url: "https://mp.weixin.qq.com/s/Dok_hZa7tEXC_6wFi4VIpw"
ingested: "2026-09-02"
sha256: "07182fa977059b0616d1bdac1eb2bc6df7a7d4801e326dc28a8bc01dac04b2aa"
author: "曲士"
account: "大淘宝技术"
team: "淘天集团-天猫技术团队"
tags: [skill-development, skill-authoring, agent-skill, progressive-disclosure, control-tuning, decision-tree, bridge-pattern, taobao, tmall]
---

# 浅谈 SKILL 研发的最佳实践——以百补详情助手为例

> **来源**：大淘宝技术（曲士，天猫技术团队，原创）
> **时间**：2026-08-21
> **案例**：bybt-detail-assistant（百亿补贴详情助手，50+ commit）
> **团队**：已开发 50+ Skill，涵盖补贴查询/创建/分析、舆情分析、频道巡检、智能圈品、素材生成、代码助手、商品诊断

## 核心命题

业界对怎么写好 SKILL.md 标准讲得多，但对 Skill 如何研发、如何迭代的具体实践介绍相对少。不能持续迭代的 Skill，说到底只是一次性的 demo。

## 业界方法论梳理

### Claude Skills：渐进式披露 + 控制调优
- **渐进式披露**三层加载：L1 元信息（name+description，每次启动加载）→ L2 SKILL.md 正文（判断需要时才加载）→ L3 附件资源（执行中按需读取）。官方建议 SKILL.md ≤500 行，超过拆分独立文件。description 要写得"有侵略性"（pushy），列出触发条件和排除条件。
- **控制调优**：指令自由度与任务鲁棒性匹配（matching instruction freedom to task fragility）

### MiniMax Skills：标准化仓库 + 工业化生产
16+ 生产级 Skill，CONTRIBUTING.md 要求"One PR, one purpose"

### 6 种工作流结构模式
1. 线性（Linear）
2. 决策树（Decision Tree）— 输入多样→处理逻辑互斥时优先
3. 循环迭代（Loop）— 尝试→验证→重试
4. 并行（Parallel）
5. 管道（Pipeline）
6. 状态机（State Machine）

高频实践模式：渐进式披露、控制调优、Context Budget 意识

## bybt-detail-assistant 最佳实践

### 4.1 架构设计

**桥接器解耦本地与远程** 🌟
- 本地 Skill 通过 xiaomi.py 桥接远程 Agent API
- 远程 Agent 扛分析能力（埋点解读/问题排查），几乎每周迭代
- 本地 Skill 只保留信息收集/商品查询/结果呈现（薄客户端）
- 架构边界把"需要稳定"和"需要高频迭代"在物理上隔开
- 代价：跨系统桥接更脆、归因成本更高；收益：灰度发布/一键回滚/版本管理

**决策树按需加载而非全量展开**
- 共享全局约束（~60行）→ 决策树（4条规则，~20行）→ 路径A/B/C各含输出规则和主动引导
- 路径逻辑互斥，执行路径A时不需要知道路径C细节
- 便于后续物理拆分为多文件渐进式披露

**注意力聚焦：减少 SKILL.md 中的次要信息**
- 埋点解读逻辑不塞 prompt，本地只描述"什么时候调 xiaomi.py、参数怎么传"
- 用 Python 脚本固化埋点逻辑，比 LLM 处理快 7 倍且格式 100% 统一
- Context Budget 意识：接近 500 行时每次新增都问"删掉会不会出错？"

### 4.2 研发效能

**直接用最强模型开发**
- 中端模型写 Skill 频繁理解偏差，改三四轮消耗总 token 远超强模型一次开销
- 开发阶段强模型一步到位（官方最佳实践 + 真实案例数据 + 现有 SKILL.md），验证时再测弱模型兼容性

**本地远程共享视角：按需暴露上下文**
- 借鉴 Monorepo：远程 Agent 代码纳入同一工作区
- 常规迭代：独立会话只加载当前侧代码（避免上下文污染/越界修改）
- 协议设计/边界调整：共享视角做跨边界原子性修改

**小步提交：每次改动可追溯可回滚**
- 每次只改一个维度，改完验证即提交 commit，diff 越小 AI 辅助审查越精准

**让 Agent 看到"运行时"**
- 用真实数据调试（百补热门商品 1 分钟上千条记录 vs 普通商品）
- 脚本异常时打包错误堆栈+源码+触发输入数据（完整运行时快照）
- 真实场景暴露的极端 case 立刻固化为 SKILL.md 中的 gotcha

### 4.3 运行优化

**强制"原文直出"对抗 LLM 总结冲动**
- SKILL.md 用极强语气禁止：不要总结/改写/重新排版/添加标题解释
- 脚本生成 Markdown 格式标准化报告 → Agent 一字不改直出

**sessionId 复用维持远程 Agent 上下文连贯**
- 每个会话第一次调用 xiaomi.py 前生成随机 sessionId，后续复用
- 远程 Agent 通过 sessionId 识别同一对话上下文，实现跨调用记忆保持
- SKILL.md 只增加 ~10 行，用户体验提升显著

**优先输出 HTML 报告提高信息密度**
- 长内容（几十条日志记录）处理为 html 文件，优先输出本地路径
- 用户点击直接在浏览器打开，支持搜索等操作
- 必须让本地 Agent 执行 html 转换（远程产出会丢失内容信息）

**主动引导：该问的先问清，用户没问到的主动递问题**
- 执行前：关键信息缺失时用 AskUserQuestion 合并多疑点为一轮提问
- 执行后：扫分析结果，命中异常信号追引导式提问（如"检测到区域限售，要不要看看？"）
- 只递出问题，深挖不深挖用户自己定（高自由度一档）

## 结语

1. **Skill 质量上限由"上下文工程"能力决定，而非写作技巧**——在对的时机把对的信息以对的粒度递到模型面前
2. **让 Agent 自己写/改 Skill 是一种"元能力"**——开发者从"编写者"变成"审查者+上下文提供者"
