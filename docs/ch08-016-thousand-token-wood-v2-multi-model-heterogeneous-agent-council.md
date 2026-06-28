## Ch08.016 Thousand Token Wood v2: Multi-Model Heterogeneous Agent Council

> 📊 Level ⭐⭐⭐ | 10.6KB | `entities/thousand-token-wood-sim-v2-hackathon.md`

# Thousand Token Wood v2: Multi-Model Heterogeneous Agent Council

> 原文存档：[原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/thousand-token-wood-sim-v2-hackathon.md)

## 概述

Lester Leong（AdmiralTaco）Build Small Hackathon 2026 第二次提交的"Thousand Token Wood v2"工程报告。**核心创新**：4 个不同实验室的小模型组成 heterogeneous council，共同驱动一个金融市场游戏。

**v1 → v2 进化**：
- v1: 一个 fine-tuned 0.5B 模型跑 5 个 woodland creatures 交易市场（"看热闹"型）
- v2: 玩家 = Patron（金融大佬）— 放贷、传内幕消息、做空、行贿、结盟；magistrate 追踪内幕交易；creatures 记得玩家如何对待它们

## 核心架构创新

### 1. Heterogeneity is the product（异质性即产品，不是约束）

**Council 组成**（4 实验室的小模型）：
- **gpt-oss-20b**（OpenAI）
- **MiniCPM3-4B**（OpenBMB）
- **Nemotron-Mini-4B**（NVIDIA）
- **Qwen 0.5B fine-tune**（作者自训）

**为什么不同模型更好玩？**
- 同质模型 + 不同 prompt = "脚本"（行为可预测）
- 异质模型 = "活的争论"（市场参与者真正"不同"）
- 猫头鹰囤积方式 ≠ 狐狸投机方式——different training data + post-training 带来真实差异

### 2. 服务层摩擦是真实工程痛点（不是模型层）

实测发现的 vLLM 0.22.1 痛点：
- JIT 编译 kernel 需 CUDA toolkit（`nvcc`）→ lean base image 不带 → 4 个模型全部同样失败 "could not find nvcc" → **一个 image fix 解锁全部**（不是 gpt-oss 特殊问题）
- gpt-oss-20b MXFP4 原生量化 → 24GB L4 跑得动，channel 格式包裹 answer → consumer 需 extract final channel
- MiniCPM3 需 `trust_remote_code`；Nemotron 干净加载
- 通用解法：**tolerant JSON parse-and-repair layer**——所有模型输出都过这层，drop 无法 salvage 的部分，simulation 从不崩溃

**经验法则**：建好一次这个 layer，加新模型 = config 改动，不需要 refactor

### 3. 信息不对称需要 firewall（不是 prompt instruction）

**机制**：玩家可"传 tip" 给 creature — 真实 tip（预测市场会涨）或虚假 tip（诱饵）。真实 tip 正确使用 → 玩家"heat" 上升；过线 → magistrate 调查。

**安全属性要求**：
- 真相标记（truth flag）必须**对 creatures 不可见**——这是安全属性，不是 UI
- 隐藏 flag 存在玩家 ledger（off-prompt），公共 event record 构造时 strip
- narrator 永远只总结公共事件
- **核心测试**：每轮扫每个 creature 的完整 prompt，检查 banned tokens——**这是测试套件里最重要的一个**

**原则**：给 agent 秘密信息时，"假设它会泄露，除非有测试证明它不能"

### 4. 持久 memory：bounded summary 而非 raw history

**机制**：creatures 之间 + 与 Patron 之间的 signed sentiment（你 short 我的作物、你偿还贷款、你拉我结盟）。

**陷阱**：prompt inflation——raw history 无限增长 → 小模型淹没

**解法**：
- 模型永远只看到 **一行 bucketed summary**（"你对 Oona 感到温暖，对 Patron 警惕"）
- 摘要从 integer sentiment 派生，cap 在最强几个 feelings
- 完整 notes 留存（trace）但 bounded 不显示
- 行为偏差：50% emergent（summary 引导模型）+ 50% mechanical（强敌对 creature deterministic 拒绝）

## 实测结果（"What actually happened" 单次 seeded run）

| Lever | Result |
| --- | --- |
| Council 模型 | 4 实验室，皆 <32B，部署在 Modal |
| Fine-tuned 0.5B 可靠性 | 0% 自买、100% valid offer（击败自己的 3B teacher）|
| Truth firewall | 0 tip flag 泄露（每 prompt 扫）|
| Insider tip edge | 真实 tip 预先定位 → 正 P&L；虚假 tip 不获益 |
| Heat → 调查 | 2 次 suspicious 胜利触发 magistrate 调查 |
| Ruin | margin call + 贷款违约 → creature 流放，下一章归来 |

## Takeaways（作者总结）

1. **小模型是可靠格式生成器 + 不可靠推理器**——用 structure + prompting + 小 fine-tune 缩小 gap，不靠 scale
2. **Heterogeneous council 比 homogeneous 有趣**——服务层稳定后，加新模型只需 config
3. **Agent 秘密信息是 firewall 问题**——firewall 属数据流（测试证明），不是 prompt 指令
4. **持久 memory 是让 agent 活起来的最便宜方式**——前提是 prompt 只看到 bounded summary

## 实践价值

- **Multi-lab 模型组合**是 agent 工程的真实方向（vs 单一 frontier model）——用差异化取代同质化
- **Service layer 标准化**（vLLM config + JSON parser）是 heterogeneous council 的关键
- **安全测试自动化**（扫每个 prompt 的 banned tokens）是 production agent 必修课
- **Memory bounding**（一行摘要 + integer sentiment）证明小模型也能管理长期关系

## 与现有实体的差异化

现有 `entities/claude-code-hackathon-winners-2026.md` 和 `entities/claude-code-hackathon-expertise-digitization.md` 关注 Claude Code 生态内的 hackathon；本 entity 关注**多实验室小模型组合**的 agent council 工程实现——属于 Hackathon 维度的不同子主题。

`entities/defense_at_ai_speed_microsofts_new_multi.md` 关注 multi-agent 在 security 场景；本 entity 关注 multi-agent **在游戏/经济模拟**场景，且是 heterogeneous models（同 multi-agent 标签但维度不同）。

## 上线状态

- 原文 URL: https://huggingface.co/blog/build-small-hackathon/thousand-token-wood-sim-v2
- 作者: Lester Leong（AdmiralTaco）— Build Small Hackathon 参赛
- 部署平台: Modal
- Council 完全开源 + traces 公开

## 深度分析

### 1. Hackathon 作为 AI 应用创新的加速器
千 token 木材模拟 v2 展示了 hackathon 在 AI 应用创新中的价值——在有限时间内（24-48 小时），团队可以验证从"想法"到"可用原型"的路径。hackathon 的约束（时间短、资源有限）反而促进了创造性解决方案。

### 2. 模拟+AI 的混合方法论
木材模拟与 AI 的结合代表了一个新兴的方法论：用物理模拟生成训练数据，用 AI 学习模拟中的模式并加速预测。这种"模拟-学习-加速"循环在材料科学、气候模拟、药物发现中都有应用。

### 3. 千 token 的效率约束创新
"千 token"约束（极简提示词）迫使开发者找到最精炼的提示词设计——这与 prompt engineering 中的"少即是多"原则一致。约束驱动创新是 hackathon 的核心价值。

### 4. 从 hackathon 原型到生产系统的鸿沟
hackathon 原型证明了可行性，但从原型到生产系统需要：持续的数据流、错误处理、用户界面、性能优化——这些在 hackathon 时间框架内不可完成。

### 5. 领域特异性 AI 应用的长尾价值
木材模拟这类领域特异性应用不会登上头条，但对特定行业（林业、建筑）可能有巨大价值。AI 的最大价值可能在长尾领域而非通用场景。

## 实践启示

### 1. 用 hackathon 验证 AI 应用可行性
在投入大量资源前，用 hackathon 快速验证"AI 能否解决 X 问题"——48 小时的验证远比 6 个月的规划高效。

### 2. 模拟+AI：适合数据稀缺的场景
如果你的领域缺乏真实数据但可以建立物理模拟，用模拟生成训练数据是可行路径。

### 3. 约束驱动创新：设定 token/时间/资源上限
给 AI 应用开发设定显式约束（如"1000 token 提示词"），迫使团队找到最精炼的解决方案。

### 4. Hackathon 原型后：做可行性评估再做投入
hackathon 证明了可行性后，先评估原型到生产的差距和成本，再决定是否投入全面开发。

### 5. 关注你领域的长尾 AI 应用
AI 的最大价值可能不在通用场景而在你领域的特定痛点——用 AI 解决"小但关键"的问题。

## 相关实体
- [构建基于多智能体架构的深度思考交易系统](ch04-205-构建基于多智能体架构的深度思考交易系统.html)
- [Scalable Voice Agent Design With Amazon Nova Sonic Multi Agent Tools And Session](ch04-305-stripe-sessions-2026-ai-agents.html)
- [Factory Mission Multi Agent Architecture](ch01-864-page-864.html)
- [构建基于多智能体架构的深度思考交易系统](ch04-205-构建基于多智能体架构的深度思考交易系统.html)
- [Openclaw Multi Agent Team Practice V2](ch04-038-openclaw-multi-agent-team-practice-v2.html)

## 原文链接

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/thousand-token-wood-sim-v2-hackathon.md)

---
