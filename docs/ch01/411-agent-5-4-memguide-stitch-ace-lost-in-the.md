# Agent 记忆注入实战：5 维框架（选什么/放哪里/怎么放/放多少/何时放）+ 4 前沿论文（MemGuide/STITCH/ACE/Lost in the Middle）

## Ch01.411 Agent 记忆注入实战：5 维框架（选什么/放哪里/怎么放/放多少/何时放）+ 4 前沿论文（MemGuide/STITCH/ACE/Lost in the Middle）

> 📊 Level ⭐⭐ | 11.4KB | `entities/agent-memory-injection-5-dimensions-4-papers-agent-shouji-2026.md`

# Agent 记忆注入实战：5 维框架 + 4 前沿论文

> 原文存档：[原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/agent-memory-injection-5-dimensions-4-papers-agent-shouji-2026.md)

## 一句话定位

**「Agent技术笔记」第 9 篇** — 5 维记忆注入框架（选什么/放哪里/怎么放/放多少/何时放）+ 4 篇前沿论文综合（MemGuide 意图驱动 / STITCH 上下文过滤 / ACE 策略手册 / Lost-in-the-Middle 位置效应），解决"存好了怎么用"的实战问题。

> 第 4 篇《Memory 模块设计实录》讲"存什么、怎么存"，本篇讲"存好了怎么塞进 Prompt 才能发挥价值"——合在一起是记忆管理的完整闭环。

## 4 个常见问题

| 问题 | 表现 | 后果 |
|------|------|------|
| 检索到了但不相关 | 字面上像，任务上无关 | 引入噪声，误导模型 |
| 信息塞进 Prompt 但模型没看到 | 重要信息放到了 Prompt 中间 | **准确率下降 30%+** |
| 塞太多有效信息被淹没 | 一股脑放 20 条记忆 | 噪声翻倍，效果反而变差 |
| 格式混乱模型分不清主次 | 信息堆砌，没有结构 | 模型困惑，输出质量下降 |

**核心方法论**：把对的信息，放在对的位置，以对的方式呈现，控制在对的量。

## 4 篇前沿论文

| 论文 | 出处 | 解决问题 | 关键数据 |
|------|------|---------|---------|
| **MemGuide** | Google DeepMind 2025.05 | 意图驱动的记忆选择 | 任务成功率 88% → 99% (+11%) / 对话轮次 -2.84 |
| **STITCH** | Microsoft Research 2026.01 | 上下文意图过滤 | Contextual Intent 三元组 |
| **ACE** | Anthropic 2025 | 记忆作为策略手册 | 通用 Agent +10.6% / 金融分析 +8.6% |
| **Lost in the Middle** | Stanford + UC Berkeley 2024 | 位置对性能的影响 | 中间位置准确率 -30%+ |

## 5 维框架详解

### 维度 1：选什么（记忆选择）— MemGuide + STITCH

#### MemGuide：意图驱动

| 流程对比 | 步骤 |
|---------|------|
| 传统 RAG | Query → Embedding → 相似度排序 → Top-K → 拼接 |
| MemGuide | Query → **意图识别** → **槽位分析** → 匹配记忆 → **槽位过滤** → 精选记忆 |

**两阶段机制**：
- **Stage 1 - 意图对齐检索**：每条记忆带"意图标签"（如"短途轻货"），QA 格式存储
- **Stage 2 - 槽位补充过滤**：分析当前信息缺口，优先保留能填补缺口的记忆

#### STITCH：上下文驱动

**Contextual Intent 三元组**：
- Thematic Scope (主题范围)：商业送货 vs 个人回乡
- Action Type (动作类型)：接单 / 询价 / 拒单
- Key Entities (关键实体)：货物类型 / 目的地

#### 记忆选择三原则

1. **意图优先**：先识别"用户想干什么"，按意图匹配记忆
2. **槽位驱动**：分析"当前还缺什么"，优先选能补缺口的记忆
3. **上下文过滤**：判断"当前什么场景"，只匹配相同场景下的记忆

### 维度 2：放哪里（注入位置）— Lost-in-the-Middle

**Prompt 位置关注度 U 形分布**：
- 开头：高关注度 ✅
- 中间：注意力下降 ⚠️
- 结尾：高关注度 ✅

**3 条位置规则**：
1. **核心约束放开头**：最重要的硬性规则
2. **历史偏好放 Query 前**：用户画像和偏好信息
3. **重要提醒放结尾**：利用"末尾效应"强化记忆

### 维度 3：怎么放（注入格式）— Section + QA

| 格式 | 推荐度 |
|------|--------|
| 纯文本段落 | ⭐⭐ |
| Bullet 列表 | ⭐⭐⭐ |
| QA 问答对 | ⭐⭐⭐⭐ |
| **Section + QA** | **⭐⭐⭐⭐⭐** |

**Section + QA 优势**：
- Section 标记让模型快速跳转
- QA 格式天然对应信息槽位
- 便于维护和扩展

### 维度 4：放多少（数量控制）— 宁缺毋滥

**华盛顿大学研究**：检索条数从 10 增加到 20 条，**任务性能提升 <5%，但引入噪声增 2 倍**。

**实战建议**：
- 精选 > 泛选：三重过滤后取 Top-5
- 复杂场景不超过 10 条
- 每条记忆都应有明确的"注入理由"

### 维度 5：何时放（动态控制）— Context Burst (ACE)

**核心思想**：平时 Prompt 保持精简 (1-2k tokens)，关键时刻动态注入详细信息 (3-5k tokens)。

**4 种典型触发场景**：
- 司机犹豫不决 → 注入相似司机的成功转化案例（社会证明）
- 接了低于预期的价格 → 注入该司机的历史接单情况和履约数据
- 首次运输特殊货物 → 注入该类型货物的注意事项 + 司机运单历史
- 有投诉/纠纷历史 → 注入过往投诉详情和处理结果

## ACE 框架：把记忆当作策略手册

### 记忆观转变

| 维度 | 传统做法 | ACE 做法 |
|------|---------|---------|
| 记忆的本质 | 静态历史记录 | 动态策略手册 |
| 更新方式 | 覆盖重写 | 增量追加 |
| 组织形式 | 一段话描述 | 分类标记（策略 / 失误 / 约束） |

### 策略手册结构

```markdown
## STRATEGIES（成功经验）
[str-001] helpful=5 :: 司机犹豫时，强调货物轻便和路线熟悉度，转化效果最好

## COMMON MISTAKES（失败教训）
[mis-001] helpful=6 :: 不要给新手推荐高价值货源，履约风险极高
```

### 3 角色协作

- **Generator (生成器)**：产生详细推理轨迹
- **Reflector (反思器)**：从执行结果中提炼可复用洞察
- **Curator (策展器)**：筛选/合并/淘汰

## 完整流程整合

```
Step 1: 意图识别 + 槽位分析 (MemGuide)
   ↓
Step 2: 智能检索 + 上下文过滤 (MemGuide+STITCH) → 精选 5 条
   ↓
Step 3: Context Burst 触发判断 (ACE)
   ↓
Step 4: 结构化注入 (Section + QA + 位置规则)
   ↓
LLM → 个性化推荐结果
```

## 关键洞察

1. **真正的难点往往在"用"这一步**：很多人以为记忆管理最难的是"存和取"，但真实落地发现"用"才是关键
2. **MemGuide 三阶段效果最佳**：意图识别 + 槽位分析 + 槽位补充过滤，比单纯相似度排序好 11%
3. **Section+QA 是 Agent 记忆的"自然格式"**：每个 Q 对应一个信息槽位，模型提取路径最短
4. **Context Burst 是 token 经济学的实践**：银行 VIP 类比 — 平时 1-2k tokens，关键时 3-5k tokens
5. **"5 条好过 20 条"是数据驱动结论**：10→20 条检索，性能提升 <5%，噪声增 2 倍

## 改进效果对比

| 维度 | 传统 RAG | 优化后 |
|------|---------|--------|
| 记忆选择 | 字面相似度 Top-K | 意图 + 槽位 + 上下文三重过滤 |
| 注入位置 | 随机拼接 | 开头放约束、中间放偏好、结尾放提醒 |
| 注入格式 | 纯文本堆砌 | Section + QA 结构化 |
| 数量控制 | 盲目 20 条 | 精选 5 条，宁缺毋滥 |
| 动态控制 | 每次全量注入 | Context Burst 按需注入 |

## 4 维度核心原则

| 维度 | 核心原则 | 一句话总结 |
|------|---------|----------|
| 选什么 | 意图驱动 > 相似度 | 不是找"最像的"，而是找"最有用的" |
| 放哪里 | 重要信息放两端 | 避开 Lost-in-the-Middle 效应 |
| 怎么放 | Section + QA 结构化 | 让模型一眼看到重点 |
| 放多少 | 宁缺毋滥，5 条好过 20 条 | 每条都应有明确的"注入理由" |
| 何时放 | Context Burst 动态控制 | 平时省钱，关键时刻舍得花 |

## 关联引用

→ [Agent Memory 模块化框架与评测](../ch04/121-agent-memory.html) — Memory 4 模块框架（ICLR 2026 论文）
→ [Agent Memory 架构本质](../ch04/121-agent-memory.html) — Memory 治理理论
→ [三种 Agent Memory 方案对比实验](https://github.com/QianJinGuo/wiki/blob/main/entities/context-engineering-three-memory-paradigms.md) — MSA/Doc-to-lora/RAG 量化对比
→ [Agent Loop 8 痛点](../ch05/007-loop-engineering.html) — 记忆大小是痛点 4（同模型盲区）
→ [Agent Memory 评测综述 (淘天)](../ch04/121-agent-memory.html) — Mem0 评测视角
→ [原文存档（本篇）](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/agent-memory-injection-5-dimensions-4-papers-agent-shouji-2026.md)

---

