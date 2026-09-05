---
title: 高德 SkillClaw：让 Agent Skill 学会进化——跨会话、跨Agent、跨设备、跨用户
source_url: https://mp.weixin.qq.com/s/Qy8TFzm6rhLxW3EbzjZZSA
publish_date: 2026-04-24
tags: [wechat, article, openai, agent, llm, openclaw]
review_value: 7
review_confidence: 7
review_recommendation: neutral
sha256: 795962d0f4c1d74dd8390b3cc716133f28e95ed479742553519dc916bcde03be
---
# 高德 SkillClaw：让 Agent Skill 学会进化——跨会话、跨Agent、跨设备、跨用户
> 原文：https://mp.weixin.qq.com/s/Qy8TFzm6rhLxW3EbzjZZSA  
> 来源：高德技术（官方技术号）| 2026-04-22  
> 论文：https://arxiv.org/abs/2604.08377  
> 代码：https://github.com/AMAP-ML/SkillClaw  
> 评测基准：https://github.com/InternLM/WildClawBench
---
## 核心主张
当一个 Skill 的成长不再局限于单次会话或单个实例，而是能跨 Agent、跨设备、跨用户地持续从真实交互中吸收经验、迭代改进，这件事本身就已经具备了群体智能的雏形。
## 背景问题
现有 Agent 系统（Hermes、OpenClaw 等）能自动学习——碰到新场景生成新 Skill。但这些经验只留在当前实例里：
- 用户A踩的坑，用户B还得重新踩
- 笔记本上的 Agent 学到的东西，公司电脑上的 Agent 不知道
- 同一项目上5个 Worker 各自独立犯同样的错
更底层的问题：这些系统主要做"写入"——不断生成新 Skill。但已有的 Skill 该不该改、怎么改、哪些该合并、哪些已经过时，没人管。技能库越用越乱。
## 四个层次的群体智能
| 层次 | 范围 | 效果 |
|------|------|------|
| 第一层 | 单个用户 | 不同会话之间的经验被汇聚和压缩，自动去重/合并/淘汰 |
| 第二层 | 多个 Agent | ClawTeam 中多个 Worker 的经验共享，一个 Worker 的坑所有 Worker 不再踩 |
| 第三层 | 多台设备 | 家里的 Hermes + 公司的 Hermes + 学校的 Hermes 共享同一套技能库 |
| 第四层 | 多个用户 | 团队经验自动沉淀，个人踩坑 → 系统沉淀 → 所有人受益 |
## 系统架构
两个独立模块，只通过共享存储（OSS/S3/本地文件系统）交互：
**Client Proxy（skillclaw/）**：
- 每个用户本地运行的 API 代理
- 拦截请求、录制完整会话轨迹、管理本地技能库
**Evolve Server（evolve_server/）**：
- 后台进化服务
- 从对象存储拉取会话数据，分析并更新技能
- 支持 Workflow 引擎（固定 LLM 管道）和 Agent 引擎（OpenClaw 自主工作区）
先只装 Client 也能用，后面再加 Evolve Server 做自动进化。
## Agentic Evolver：核心压缩引擎
**问题**：如何把散乱的个体经验压缩成真正有用的集体知识？
**传统做法**：预定义规则（相似度去重、频率淘汰、按模板合并）。确定性强，但只能覆盖已预见到的模式，本质上是被动的信息处理。
**SkillClaw 的做法**：进化器本身就是一个 LLM Agent。
它主动阅读所有实例聚合起来的会话证据，自主判断每个 Skill 应该怎么更新——理解失败的根因、区分 Skill 缺陷和环境因素、决定修改的范围和方式。做的是编辑决策，不是模式匹配。
三种操作：
- **Refine**：改进已有 Skill
- **Create**：新建缺失的 Skill
- **Skip**：证据不足时跳过
这就是"Agentic"的含义：群体经验的汇聚和压缩，不是由规则驱动的，而是由一个有自主判断力的 Agent 驱动的。
## 验证机制
技能更新不会直接发布。SkillClaw 支持 `validated` 模式：
候选更新先进入验证队列，Client Proxy 在空闲时拉取任务，让新旧版本在相同场景下跑对比，只有新版本确实更好的更新才会被接受。
思路类似 CI/CD——只有通过测试的改动才能合入。
## 实验情况
在 WildClawBench（60个真实世界 Agent 任务）上验证：
- 模拟8个并发用户
- 6天的白天-夜间循环
- 执行和进化均使用 Qwen3-Max
全部4个评测类别都呈现了持续提升的趋势。不同类别的进化轨迹有差异：
- 工具使用类和 API 调用类提升较明显
- 纯推理类提升有限
**局限性**：8用户、6天的测试规模有限，更大规模验证是后续工作。
## 实际案例
技能进化对"缺失或错误的过程性知识"（比如端口写错、缺少环境检查步骤）效果比较好，对纯推理层面的问题帮助有限。后者可能需要结合模型层面的优化来解决。
## 兼容性
SkillClaw 不绑定特定 Agent 框架，目前支持：
Hermes、OpenClaw、CoPaw、IronClaw、PicoClaw、ZeroClaw、NanoClaw、NemoClaw，以及任何 OpenAI 兼容 API。
## 快速上手
```bash
git clone https://github.com/AMAP-ML/SkillClaw.git && cd SkillClaw
bash scripts/install_skillclaw.sh
source .venv/bin/activate
skillclaw setup
skillclaw start --daemon
```
启动后正常聊天即可。如果需要本地闭环进化：
```bash
skillclaw-evolve-server --use-skillclaw-config --interval 300 --port 8787
```