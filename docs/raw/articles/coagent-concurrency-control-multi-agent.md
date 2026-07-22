---
title: "Agent并发干活像'三个和尚没水喝'？CoAgent新框架：让它们学会看懂冲突再动手"
source_url: "https://mp.weixin.qq.com/s/kBCoRX5gyJKxwR_ceSoixA"
source_author: "CoAgent团队 投稿"
source_site: "量子位 (公众号 QbitAI)"
ingested: 2026-07-13
sha256: "fb95616c574e2fc2812944546463820f3d00ce24c1520452b2fdcf87b8875d6a"
score_value: 8
score_confidence: 8
score_stars: 4
score_vxc: 64
---

# Agent并发干活像"三个和尚没水喝"？CoAgent新框架：让它们学会看懂冲突再动手

> 量子位 | 公众号 QbitAI
> 2026年7月13日 10:10 北京
> 论文：CoAgent: Concurrency Control for Multi-Agent Systems (arXiv:2606.15376)
> 团队：上海交通大学IPADS实验室（吕泓涛、张鼎言；指导老师：吴明瑜、魏星达、陈海波）

## 核心问题

上海交通大学IPADS实验室发现，多Agent并发执行时存在 Race Condition 问题，但传统操作系统并发控制方法在 Agent 场景下异常低效：

- **悲观加锁**：Agent 任务持续几分钟到几小时，锁持有时间过长，导致其他 Agent 长时间阻塞
- **乐观并发控制**：要求写操作先放入局部缓冲区，但 Agent 操作 K8s 等实际系统难以暂存；且 Agent 的"读放大"行为（如先 grep 整个仓库）导致冲突频繁、重做代价极高

在 K8s 修复任务上（2倍并发 vs 串行）：
- 加锁方案加速比仅 1.04x，每轮死锁 0.81 次
- 乐观并发方案加速比 0.93x（比串行慢），token 多烧 83%

## CoAgent 方案

CoAgent 的核心洞察：LLM 能分析冲突语义，因此不应像传统系统那样盲目上锁或整体重做，而应将冲突信息交给 Agent 自行判断和最小化修复。

一致性模型：**可串行化一致性**（serializable）—— 并发结果等价于某串行顺序执行结果。

### 四种机制

1. **预定序（Pre-ordering）**：提前给 Agent 分配序号，明确逻辑顺序。靠后 Agent 看到靠前 Agent 的冲突操作则无需修复
2. **读后写 → 冲突通知（R-W Conflict Notification）**：追踪每次工具调用的读写集。靠后 Agent 读过的内容被靠前 Agent 修改时，通知靠后 Agent 自行设计最小化修正方案
3. **写后读 → 读过滤（W-R Read Filtering）**：过滤掉后序 Agent 写入物的影响，还原前序 Agent 本应读到的结果。若无法还原（如 K8s 操作已生效），进入第 4 步
4. **写后写 → 撤销重做（W-W Undo+Redo）**：撤销逆序写操作，还原原始状态（如回滚 K8s），让前序 Agent 完成操作后，通知被撤销的 Agent 重做

### 系统架构

引入**服务 Agent**（Service Agent）：
- 实时构造 Worker 所需工具，标记每次工具调用的读写集
- 所有写操作执行前先跑准备逻辑（快照/日志兜底）
- 负责编写撤销逻辑

## 实验结果

- 评测覆盖 10 个高竞争多 Agent 场景，250 次真实 K8s 部署实验
- 正确率比串行低不到 5%（用较便宜模型），比无保护并发提高 **7.2x**
- 速度接近裸并发，冲突处理额外仅 **7%** 时间
- Token 开销比串行多 **15%**
- 加锁/重做方案速度与串行相当，额外烧大量 Token

## 团队

来自上海交通大学 **IPADS**（并行与分布式系统研究所），国内系统软件方向代表实验室：SOSP、OSDI、EuroSys 常客，近年获 SOSP 2023、EuroSys 2024、SOSP 2025 最佳论文。教材《现代操作系统：原理与实现》被近 200 所高校采用。
