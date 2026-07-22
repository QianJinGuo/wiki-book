---
title: "Agent 记忆注入实战：5 维框架 + 4 前沿论文（MemGuide/STITCH/ACE/Lost in the Middle）+ Context Burst 动态控制"
source: "Agent手记 / Agent技术笔记"
source_url: "https://mp.weixin.qq.com/s/ohkdS_tPhbpK-Re3-jZeYw"
ingested: 2026-06-16
sha256: "895f791d047c3f5d6c997328866cf91d097e42a4494c9ec724ff6ba3527dc41d"
type: raw
tags: [agent-memory, memory-injection, context-engineering, memguide, stitch, ace-framework, lost-in-the-middle, context-burst, intent-driven, slot-driven, context-filter, section-qa, rag, dynamic-context, google-deepmind, microsoft-research, anthropic, stanford, uc-berkeley, agent-shouji, 2026]
review_value: 9
review_confidence: 8
---

# Agent 记忆注入实战：5 维框架 + 4 前沿论文

**作者**：Agent手记 / Agent技术笔记 | **发布时间**：2026-06-15 20:30

**系列**：「Agent技术笔记」第 9 篇。第 4 篇《Memory 模块设计实录》讲"存什么、怎么存"，本篇讲"存好了怎么塞进 Prompt 才能发挥价值"。

## 4 个常见问题

| 问题 | 表现 | 后果 |
|------|------|------|
| 检索到了但不相关 | 字面上像，任务上无关 | 引入噪声，误导模型 |
| 信息塞进 Prompt 但模型没看到 | 重要信息放到了 Prompt 中间 | 准确率下降 30%+ |
| 塞太多有效信息被淹没 | 一股脑放 20 条记忆 | 噪声翻倍，效果反而变差 |
| 格式混乱模型分不清主次 | 信息堆砌，没有结构 | 模型困惑，输出质量下降 |

**核心方法论**：把对的信息，放在对的位置，以对的方式呈现，控制在对的量。

**核心参考 4 篇前沿研究**：
- **MemGuide** (Google DeepMind, 2025.05)
- **STITCH** (Microsoft Research, 2026.01)
- **ACE** (Anthropic, 2025)
- **Lost in the Middle** (Stanford + UC Berkeley, 2024)

## 场景：司机说"今天想跑个轻松的活"

传统 RAG 问题：
- "去年想轻松，跑了长途回家" 语义相似但任务无关
- "接了轻货短途" 真正相关但排第 3
- 5 条记忆里 2-3 条是噪声

### 3 个根本性问题

1. **Lost-in-the-Middle**：模型对 Prompt 中间位置关注度低（**准确率下降 30%+**）
2. **语义相似 ≠ 任务相关**：Embedding 只看字面像不像
3. **数量-质量失衡**：增加条数性能提升 <5%，噪声增 2 倍

## 一、记忆选择：MemGuide + STITCH

### MemGuide：意图驱动

| 流程对比 | 步骤 |
|---------|------|
| 传统 RAG | Query → Embedding → 相似度排序 → Top-K → 拼接 |
| MemGuide | Query → 意图识别 → 槽位分析 → 匹配记忆 → 槽位过滤 → 精选记忆 |

#### Stage 1 - 意图对齐检索
- 每条记忆带"意图标签"（如"短途轻货"）
- 关键槽位：运输距离 / 货物重量 / 结款方式
- QA 格式存储：每条记忆 = 一个问答对 = 一个信息槽位

示例记忆库：
- "偏好短途，北京周边 100km 内" → 短途轻货 / 运输距离
- "只接 3 吨到 5 吨的货" → 短途轻货 / 货物重量
- "上次轻松活跑了天津，送急件" → 短途轻货 / 货物类型

#### Stage 2 - 槽位补充过滤
- 分析当前信息还缺什么
- 优先保留能填补缺口的记忆
- 过滤掉与已知槽位重复的记忆

#### MemGuide 效果数据

| 指标 | 传统 RAG | MemGuide | 提升 |
|------|---------|---------|------|
| 任务成功率 | 88% | 99% | **+11%** |
| 平均对话轮次 | - | 减少 2.84 轮 | 效率显著 |

### STITCH：上下文驱动

**同一句话在不同场景下意思完全不同**：
- 司机两次说"想跑趟上海"
- 3 月份是送货给老客户（**商业送货**）
- 6 月份是顺路回老家（**个人出行**）

#### Contextual Intent 三元组

| 维度 | 含义 | 示例 |
|------|------|------|
| Thematic Scope (主题范围) | 当时在做什么大事 | 商业送货 vs 个人回乡 |
| Action Type (动作类型) | 具体做了什么 | 接单 / 询价 / 拒单 |
| Key Entities (关键实体) | 涉及哪些要素 | 货物类型 / 目的地 |

### 记忆选择三原则

1. **意图优先**：先识别"用户想干什么"，按意图匹配记忆
2. **槽位驱动**：分析"当前还缺什么"，优先选能补缺口的记忆
3. **上下文过滤**：判断"当前什么场景"，只匹配相同场景下的记忆

### 完整代码示例 (smart_memory_select)

```python
def smart_memory_select(query: str, current_context: dict) -> list:
    # Step 1: 意图识别
    intent = identify_intent(query)
    # 示例：query="今天想跑个轻松的活" → intent="短途轻货"

    # Step 2: 槽位分析
    known_slots = extract_known_slots(current_context)
    missing_slots = get_missing_slots(intent, known_slots)
    # 示例：known={价格, 时间} → missing={运输距离, 货物重量}

    # Step 3: 上下文三元组构建
    context_tuple = build_context_tuple(current_context)
    # 示例：(商业送货, 找货, 短途)

    # Step 4: 检索 + 过滤
    candidates = search_by_intent(intent, top_k=20)
    filtered = filter_by_context(candidates, context_tuple)
    ranked = rerank_by_slot_coverage(filtered, missing_slots)

    return ranked[:5]  # 宁缺毋滥，最多5条
```

## 二、记忆注入位置：Lost-in-the-Middle

**Prompt 位置关注度 U 形分布**：

```
Prompt 位置 ←————————————————————→
   开头            中间            结尾
  ████████        ░░░░░░░░        ████████
  高关注度 ✅      注意力下降 ⚠️    高关注度 ✅
```

**3 条位置规则**：

| 规则 | 说明 | 示例 |
|------|------|------|
| **核心约束放开头** | 最重要的硬性规则 | "该司机是新手，禁止推荐高价值货源" |
| **历史偏好放 Query 前** | 用户画像和偏好信息 | "偏好：短途、轻货、日结" |
| **重要提醒放结尾** | 关键警告，利用"末尾效应" | "注意：上次因超重被罚，务必确认货物重量" |

## 三、记忆注入格式：Section + QA

| 格式 | 结构 | 优点 | 缺点 | 推荐度 |
|------|------|------|------|--------|
| 纯文本段落 | 一段话描述所有信息 | 自然流畅 | 难以定位 | ⭐⭐ |
| Bullet 列表 | 用 - 列出要点 | 比纯文本清晰 | 层级扁平 | ⭐⭐⭐ |
| QA 问答对 | 每条信息用 Q&A | 结构清晰 | 适合事实型 | ⭐⭐⭐⭐ |
| **Section + QA** | **分区块 + 区块内 QA** | **层次分明，模型定位快** | **编写成本略高** | **⭐⭐⭐⭐⭐** |

### Section + QA 完整示例

```markdown
## 司机画像
该司机为活跃老用户，信用等级 A，车辆 4.2 米厢货，载重 2 吨。

## 历史偏好
Q：线路偏好？  A：短途，北京周边 100km 内
Q：货物偏好？  A：轻货，电子产品和日用百货
Q：结款方式？  A：日结优先，可接受周结

## 注意事项
Q：历史违规？  A：上次因超重被罚，务必确认货物重量 ≤ 2 吨
Q：特殊要求？  A：不接夜间长途，不接危险品
```

## 四、Context Burst：动态控制 (Anthropic ACE)

**核心思想**：平时 Prompt 保持精简 (1-2k tokens)，关键时刻动态注入详细信息 (3-5k tokens)。

银行柜台 VIP 服务类比：平时只看客户简单资料卡，VIP 客户或复杂投诉时立刻调出完整档案深度服务。

### 两种极端问题

| 策略 | 问题 |
|------|------|
| 一直放很多 | Token 成本高 / 响应慢 / 噪声多 / 模型困惑 |
| 一直只放很少 | 复杂场景信息不足 / 个性化弱 / 关键信息遗漏 |

### 4 种典型触发场景

| 触发场景 | 爆发时注入什么 | 目的 |
|---------|--------------|------|
| 司机犹豫不决 | 相似司机的成功转化案例 | 社会证明，增强信心 |
| 接了低于预期的价格 | 该司机的历史接单情况和履约数据 | 预防拒单，提升履约率 |
| 首次运输特殊货物 | 该类型货物的注意事项 + 司机运单历史 | 降低出错率 |
| 有投诉/纠纷历史 | 过往投诉详情和处理结果 | 避免踩同样的坑 |

### context_burst 代码示例

```python
def context_burst(driver_profile: dict, current_state: dict) -> str:
    base_tokens = 1500  # 基础 prompt 的 token 量

    triggers = []
    if current_state.get("driver_hesitant"):
        triggers.append("success_cases")
    if current_state.get("price_below_expectation"):
        triggers.append("fulfillment_history")
    if current_state.get("special_cargo"):
        triggers.append("cargo_guidelines")
    if driver_profile.get("complaint_history"):
        triggers.append("complaint_details")

    if triggers:
        extra_memories = fetch_memories(triggers, driver_profile["id"])
        return format_prompt(base_profile, extra_memories)  # 3-5k tokens
    else:
        return format_prompt(base_profile)  # 1-2k tokens
```

## 五、数量控制：宁缺毋滥

**华盛顿大学研究**：检索条数从 10 增加到 20 条，**任务性能提升 <5%，但引入噪声增 2 倍**。

### 实战建议

- **精选 > 泛选**：三重过滤后取 Top-5
- **复杂场景不超过 10 条**：超过 10 条大概率得不偿失
- **每条记忆都应有明确的"注入理由"**

```python
# ❌ 错误做法：盲目 Top-K
memories = rag_search(query, top_k=20)  # 数量多，噪声翻倍

# ✅ 正确做法：意图+槽位精选
memories = smart_memory_select(query, context)  # 三重过滤，宁缺毋滥
assert len(memories) <= 10, "超过10条记忆，请检查过滤逻辑"
```

## 六、ACE 框架：把记忆当作策略手册

### 记忆观转变

| 维度 | 传统做法 | ACE 做法 |
|------|---------|---------|
| 记忆的本质 | 静态历史记录 | 动态策略手册 |
| 更新方式 | 覆盖重写（每次重写整个 Context） | 增量追加（新知识以 bullet 追加） |
| 组织形式 | 一段话描述所有信息 | 分类标记（策略 / 失误 / 约束） |

### 策略手册结构

```markdown
## STRATEGIES（成功经验）
[str-001] helpful=5 :: 司机犹豫时，强调货物轻便和路线熟悉度，转化效果最好
[str-002] helpful=4 :: 短途推荐用"不到2小时就到"的表述，比"距离短"更有效

## COMMON MISTAKES（失败教训）
[mis-001] helpful=6 :: 不要给新手推荐高价值货源，履约风险极高
[mis-002] helpful=5 :: 夜间长途推荐必须提前确认司机休息安排
```

### 3 角色协作

- **Generator (生成器)**：产生详细推理轨迹和行动步骤
- **Reflector (反思器)**：从执行结果中提炼可复用洞察
- **Curator (策展器)**：筛选 / 合并重复 / 淘汰过期和低分策略

**ACE 效果**：通用 Agent **+10.6%** / 金融分析 **+8.6%**

## 完整流程整合

```
用户输入："今天想跑个轻松的活"
    ↓
┌─────────────────────────────────────────────┐
│  Step 1: 意图识别 + 槽位分析（MemGuide）      │
│  → 意图：短途轻货                            │
│  → 已知：价格、时间                          │
│  → 缺失：运输距离、货物重量                   │
└─────────────────────┬───────────────────────┘
                      ↓
┌─────────────────────────────────────────────┐
│  Step 2: 智能检索 + 上下文过滤（MemGuide+STITCH）│
│  → 意图匹配"短途轻货"标签                    │
│  → 上下文过滤：商业送货场景                  │
│  → 槽位补充：优先保留能填"距离""重量"的记忆   │
│  → 输出：精选 5 条高质量记忆                  │
└─────────────────────┬───────────────────────┘
                      ↓
┌─────────────────────────────────────────────┐
│  Step 3: Context Burst 触发判断              │
│  → 无特殊触发条件 → 常规模式                 │
│  → 注入量：基础信息 ~1.5k tokens             │
└─────────────────────┬───────────────────────┘
                      ↓
┌─────────────────────────────────────────────┐
│  Step 4: 结构化注入（ACE 格式）               │
│  → 位置：核心约束放开头，偏好放 Query 前，    │
│         注意事项放结尾                        │
│  → 格式：Section + QA                       │
│  → 数量：5 条，宁缺毋滥                     │
└─────────────────────┬───────────────────────┘
                      ↓
                LLM → 个性化推荐结果
```

## 总结：4 维度核心原则

| 维度 | 核心原则 | 一句话总结 |
|------|---------|----------|
| 选什么 | 意图驱动 > 相似度 | 不是找"最像的"，而是找"最有用的" |
| 放哪里 | 重要信息放两端 | 避开 Lost-in-the-Middle 效应 |
| 怎么放 | Section + QA 结构化 | 让模型一眼看到重点 |
| 放多少 | 宁缺毋滥，5 条好过 20 条 | 每条都应有明确的"注入理由" |
| 何时放 | Context Burst 动态控制 | 平时省钱，关键时刻舍得花 |

**4 个问题归结为一句话**：把对的信息，放在对的位置，以对的方式呈现，控制在对的量 —— 记忆注入的终极目标。

## 关联引用

→ [[entities/agent-memory-modular-framework|Agent Memory 模块化框架与评测]] — Memory 4 模块框架
→ [[entities/agent-memory-architecture-essence|Agent Memory 架构本质]] — Memory 治理理论
→ [[entities/context-engineering-three-memory-paradigms|三种 Agent Memory 方案对比实验]] — MSA/Doc-to-lora/RAG 量化对比
→ [[entities/agent-loop-engineering-handbook-8-questions-chen-jin-tencent-self-2026|Agent Loop 8 痛点]] — 记忆大小是痛点 4
→ [[raw/articles/agent-memory-injection-5-dimensions-4-papers-agent-shouji-2026|原文存档（本篇）]]
