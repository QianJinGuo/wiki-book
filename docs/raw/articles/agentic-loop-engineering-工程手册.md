---
type: source
title: "Agentic Loop Engineering 工程手册（附完整代码）"
source: "数据STUDIO（微信公众号）"
author: "云朵君"
source_url: "https://mp.weixin.qq.com/s/HZ8DD90RmVb953zlvq_4Hg"
sha256: "a45da255c703dc8cbc31c543e0572eb29dd6a00b43d214e8fbe44b0249986fae"
ingested: 2026-07-09
review_value: 9
review_confidence: 8
review_stars: 5
tags: [loop-engineering, harness-engineering, agent, empirical, feedback, measurement]
---

# 这份 Agentic Loop Engineering 工程手册火了！附完整代码！

**作者**: 云朵君
**来源**: 数据STUDIO（微信公众号）
**URL**: https://mp.weixin.qq.com/s/HZ8DD90RmVb953zlvq_4Hg
**日期**: 2026-07-09

## 全文内容

完全可复现的 Agentic Loop Engineering 工程手册，18 个 py 文件 + 共享工具库，在一张 A100 80GB GPU 上用 Qwen2.5-Coder-32B-Instruct-AWQ 逐项测量 17 种 loop 工程化技术。

**核心结论**：一个 loop 的质量完全取决于它接入了什么可验证信号——接入真实测试/schema/检索事实/评估 harness 的 loop，每次都产生可测量的提升；接入模型自我意见的 loop，几乎不动。

## 一、什么是 Loop Engineering

**四次变迁**：Prompt Engineering → Context Engineering → Harness Engineering → Loop Engineering

**Loop 结构**：Schedule（调度）→ Triage skill（优先级判断）→ State/Memory（状态与记忆）→ Worktree（隔离工作区）→ Implementer（实现者）→ Verifier（验证者）→ Connectors（外部连接器）→ Human gate（人工门）

**三条测量规则**：
1. 验证信号再接入 loop
2. 基线必须真正失败
3. 报告 null 结果和饱和

## 二、基础设施

**环境**：A100 80GB + Qwen2.5-Coder-32B-Instruct-AWQ(4bit) + vLLM + BAAI/bge-large-en-v1.5

统一的 LLM 客户端：每次调用记录 token 消耗和延迟

评分器自检（最重要部分）：self_test() 喂入已知正确/错误解，断言每个 checker 判定正确。基线 pass@1 = 0.80。

## 三、六大核心

### 3.1 Run Until Done — 关键在 feedback 不是 retry
- 有真实 execution feedback：0.767→0.850（+8.3 pts）
- 无 feedback 只喊"再试一次"：0.767→0.783（+1.7 pts）
- token 消耗几乎相同（21,680 vs 20,675）
- 增益集中在第 2 次尝试后平坦

### 3.2 Skill 注入与 Context Engineering
- Cold（无 schema）：0% executable
- Skill（注入 CREATE TABLE schema）：95% executable
- Skill + few-shot：仍 95%（瓶颈移除后更多上下文无增益）
- 找到那一个承重的知识点，只注入它

### 3.3 Maker-Checker 分离
- Trust-All：100% 误接受
- Self-Assess：77%（实现者盲点共享）
- LLM-Judge：54%
- Test-Running（写测试并运行）：31% 误接受，88.6% 精度
- Best-of-N 对这个模型无效（32B 在 temperature 0.8 下近乎确定性）

### 3.4 记忆与检索
- Closed-book：7.1%（1/14）
- RAG（BGE top-3）：100%（14/14）
- 检索永远返回 top-k，需要相似度阈值

### 3.5 Worktree 并行隔离
- 共享 working tree：16.7% 存活（1/6，静默丢失）
- git worktree + merge：100%（冲突 surfaced 并 resolved）

### 3.6 连接器与工具
- 无工具（从权重猜答案）：10%
- ReAct + Python 工具：83.3%
- 工具彻底消除算术错误，只留下规格错误

## 四、协调与运营

### 4.1 多 Loop 协调
共享 acting_on registry，碰撞 5→0，浪费 tokens ~1M→0

### 4.2 预算与成本
频率是成本主导杠杆（daily-triage 23K/天 vs ci-sweeper 184.8 万/天）
- loop+feedback：2.1x token 成本买 8.3 百分点提升
- 无 feedback loop：付了 loop 价格得接近基线质量（被支配的）

### 4.3 安全线
三道护栏（路径 denylist + 文件数阈值 + 置信度下限）
- 朴素（只看 verifier）：60.5% 误自动执行
- 护栏：0% 误自动执行，100% 升级召回

## 五、七大生产 Pattern

1. **日度 Triage**：关键词规则 recall 0.35 vs embedding 分类器 0.65
2. **重复检测**：TF-IDF recall@10 0.56 vs BGE 0.65
3. **CI Sweeper**：先分类再修，省 ~2M tokens，修 10 个真回归
4. **PR Babysitter**：verifier-gated 0% false-ready（vs naive 33%）
5. **Dependency Sweeper**：风险路由，0% 误自动合并（vs naive 83%）
6. **技术债检测**：关键词 F1 0.857 vs embedding 0.844（刻意保留 null 结果）
7. **Changelog 起草**：zero-shot classifier macro-F1 0.43（约 4x baseline）

## 六、Capstone Orchestra

三阶段：Run-until-done → 采样 4 候选 → Checker 写测试选最佳
解决率：greedy 0.80 → orchestra 0.95（+15 pts，40 道 MBPP+ held-out）
SWE-bench 3/3 gold patch resolved

**共享库**：common/llm.py（LLM 客户端）、common/eval.py（评分器）、common/agents.py（生成与评审）、common/loops.py（迭代引擎）、common/memory.py（向量记忆）、common/tools.py（Python 执行）、common/sqltools.py（SQL 评分）
