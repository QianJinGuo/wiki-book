# AI Evals 评估方法论

## Ch01.286 AI Evals 评估方法论

> 📊 Level ⭐⭐ | 22.1KB | `entities/ai-evals-methodology.md`

## 三种评估方法
### 1. 人工评估
手动查看输出、打分。**永远是最重要的第一步。** ^["Evals到底在评什么？一文拆解AI评估的三种方法 (Lotte Verheyden, Langfuse, 2026-05-20)"]
跳过人工评估直接自动化的团队，最后衡量的往往是无关紧要的东西。人工评估还产生标注，作为自动评估器的基准真值。 ^["Evals到底在评什么？一文拆解AI评估的三种方法 (Lotte Verheyden, Langfuse, 2026-05-20)"]

### 2. 基于代码的评估
检查确定性逻辑：JSON 有效性、关键词模式、长度限制、SQL 可执行性。速度最快、成本最低、每次结果一致。 ^["Evals到底在评什么？一文拆解AI评估的三种方法 (Lotte Verheyden, Langfuse, 2026-05-20)"]
**局限：无法评估含义。** ^["Evals到底在评什么？一文拆解AI评估的三种方法 (Lotte Verheyden, Langfuse, 2026-05-20)"]

### 3. LLM-as-a-Judge
用语言模型打分。适合：相关性、语气匹配、摘要质量。 ^["Evals到底在评什么？一文拆解AI评估的三种方法 (Lotte Verheyden, Langfuse, 2026-05-20)"]
**局限：需要校准；可能与应用 LLM 共享盲点（同模型家族）。** 一个经人工标注校准 + 基于代码检查兜底的 LLM 裁判可以可靠。 ^["Evals到底在评什么？一文拆解AI评估的三种方法 (Lotte Verheyden, Langfuse, 2026-05-20)"]

## 参考答案 vs 无参考答案
| | 参考答案 | 无参考答案 |
|--|---------|---------|
| 机制 | 与预定义期望输出比较 | 只评估输出本身 |
| 优势 | 精确可量化 | 可用于未见过的生产数据 |
| 局限 | 需要预先定义参考 | 无法精确对比 |

## 关键原则
**1. 二元分数优先于分级量表** ^["Evals到底在评什么？一文拆解AI评估的三种方法 (Lotte Verheyden, Langfuse, 2026-05-20)"]

- 二元（通过/失败）迫使定义清晰边界
- 分级（1-5）引入歧义：3分 vs 4 分差在哪里？
**2. 失败模式判断** ^["Evals到底在评什么？一文拆解AI评估的三种方法 (Lotte Verheyden, Langfuse, 2026-05-20)"]

- "修一次就解决" → 直接改，不需要评估器
- "会反复出现" → 设置评估器
**3. 演进路径：人工审阅 → 识别失败模式 → 自动化 ^["Evals到底在评什么？一文拆解AI评估的三种方法 (Lotte Verheyden, Langfuse, 2026-05-20)"]

## 与 Langfuse 的关系
Langfuse 是 YC W23 项目，专注于 LLM 应用可观测性和评估。Langfuse Academy 提供系统的 AI Engineering 实践内容。 ^["Evals到底在评什么？一文拆解AI评估的三种方法 (Lotte Verheyden, Langfuse, 2026-05-20)"]

## 深度分析
### AI Engineering Loop 的完整闭环
Evals 不是孤立的测试环节，而是嵌入在完整的 AI Engineering Loop 中： ^["Evals到底在评什么？一文拆解AI评估的三种方法 (Lotte Verheyden, Langfuse, 2026-05-20)"]
```
生产 traces → 识别失败模式 → 沉淀数据集 → 实验评估 → CI门禁/灰度发布 → 线上监控/漂移检测 → 新traces
```
这个循环的每个环节都有明确职责： ^["Evals到底在评什么？一文拆解AI评估的三种方法 (Lotte Verheyden, Langfuse, 2026-05-20)"]

- **生产 traces**：真实用户输入和模型输出的记录
- **识别失败模式**：从 traces 中发现反复出现的问题
- **沉淀数据集**：将典型失败案例变成可复用的测试用例
- **实验评估**：在受控环境中验证修复效果
- **CI门禁/灰度发布**：防止有问题的版本上线
- **线上监控/漂移检测**：发现生产环境中新出现的问题

### 三种评估方法的互补关系
三种评估方法不是替代关系，而是互补关系： ^["Evals到底在评什么？一文拆解AI评估的三种方法 (Lotte Verheyden, Langfuse, 2026-05-20)"]

- **人工评估**是所有评估的起点和基准。它建立对应用实际行为的直觉，产生标注数据，并发现自动评估器无法覆盖的维度。但人工评估无法规模化。
- **基于代码的评估**最适合检查结构化属性：JSON 有效性、schema 合规性、关键词存在性、长度约束。这些检查精确、可重复、成本低。但无法评估语义正确性。
- **LLM-as-a-Judge**扩展了语义评估的规模。当经过校准后（用人类偏好标注验证），它可以评估相关性、语气、摘要质量等主观维度。但与被评估模型共享盲点是真实风险。
成熟团队组合使用三种方法：用代码检查快速过滤结构性问题，用 LLM 裁判评估语义质量，用人工审阅校准和验证。 ^["Evals到底在评什么？一文拆解AI评估的三种方法 (Lotte Verheyden, Langfuse, 2026-05-20)"]

### 二元分数 vs 分级量表的设计哲学
二元分数（通过/失败）比分级量表更有效，因为： ^["Evals到底在评什么？一文拆解AI评估的三种方法 (Lotte Verheyden, Langfuse, 2026-05-20)"]
1. **迫使清晰定义边界**：当"3分"和"4分"没有明确区别标准时，分数就失去了意义。二元分数要求明确定义"可接受"和"不可接受"之间的分界线。 ^["Evals到底在评什么？一文拆解AI评估的三种方法 (Lotte Verheyden, Langfuse, 2026-05-20)"]
2. **减少解释变异**：不同评估者、不同时刻对同一输出的判断可能不同。二元判断减少了这种变异。 ^["Evals到底在评什么？一文拆解AI评估的三种方法 (Lotte Verheyden, Langfuse, 2026-05-20)"]
3. **更适合集成到 CI**：通过/失败可以直接决定是否允许发布，分数则需要额外设定阈值。 ^["Evals到底在评什么？一文拆解AI评估的三种方法 (Lotte Verheyden, Langfuse, 2026-05-20)"]

### 判断是否需要自动评估器的决策框架
不是所有质量问题都需要自动评估器。决策标准： ^["Evals到底在评什么？一文拆解AI评估的三种方法 (Lotte Verheyden, Langfuse, 2026-05-20)"]

- **修一次就解决** → 直接改代码，不需要评估器（问题不会反复出现）
- **会反复出现** → 需要评估器（防止回归）
- **需要在大量输入上测试** → 需要自动评估器（人工不可行）
- **跨时间监控** → 需要自动评估器（持续跟踪质量变化）

### Agent 评估的特殊性
对于 Agent 系统，评估比普通 LLM 应用更复杂： ^["Evals到底在评什么？一文拆解AI评估的三种方法 (Lotte Verheyden, Langfuse, 2026-05-20)"]

- **不只是最终答案**：要观察中间轨迹、工具调用、策略偏移
- **高风险行为**：Agent 可能执行危险操作，需要单独监控
- **成本和延迟**：token 消耗和响应时间是重要的非功能性指标
- **多轮交互**：评估 Agent 在多轮对话中的连贯性和状态管理

## 相关链接
- [Ai Evals Methodology](ch01/286-ai-evals.html)

## 实践启示
### 1. 永远从人工审阅开始
在设置任何自动评估器之前： ^["Evals到底在评什么？一文拆解AI评估的三种方法 (Lotte Verheyden, Langfuse, 2026-05-20)"]
1. 人工审阅大量真实输出，建立对"好"和"坏"的直觉 ^["Evals到底在评什么？一文拆解AI评估的三种方法 (Lotte Verheyden, Langfuse, 2026-05-20)"]
2. 识别反复出现的具体失败模式 ^["Evals到底在评什么？一文拆解AI评估的三种方法 (Lotte Verheyden, Langfuse, 2026-05-20)"]
3. 尽可能清晰地定义每个失败模式 ^["Evals到底在评什么？一文拆解AI评估的三种方法 (Lotte Verheyden, Langfuse, 2026-05-20)"]
4. 只有当需要在大量输入上或跨时间反复测试时，才自动化 ^["Evals到底在评什么？一文拆解AI评估的三种方法 (Lotte Verheyden, Langfuse, 2026-05-20)"]

### 2. 用正确的评估方法做正确的事
| 评估目标 | 推荐方法 |
|---------|---------|
| JSON 有效性 | 基于代码 |
| Schema 合规 | 基于代码 |
| 关键词存在性 | 基于代码 |
| SQL 可执行性 | 基于代码 |
| 回答相关性 | LLM-as-Judge |
| 语气匹配 | LLM-as-Judge |
| 摘要质量 | LLM-as-Jaude |
| 整体质量直觉 | 人工审阅 |

### 3. 校准 LLM 裁判的实用方法
LLM-as-Judge 的核心问题是"衡量的是你以为在衡量的东西"。校准步骤： ^["Evals到底在评什么？一文拆解AI评估的三种方法 (Lotte Verheyden, Langfuse, 2026-05-20)"]
1. 收集人类偏好标注（人类评判一批输出，记录偏好） ^["Evals到底在评什么？一文拆解AI评估的三种方法 (Lotte Verheyden, Langfuse, 2026-05-20)"]
2. 用同样数据测试 LLM 裁判的判断 ^["Evals到底在评什么？一文拆解AI评估的三种方法 (Lotte Verheyden, Langfuse, 2026-05-20)"]
3. 比较人类和 LLM 裁判的一致性 ^["Evals到底在评什么？一文拆解AI评估的三种方法 (Lotte Verheyden, Langfuse, 2026-05-20)"]
4. 如果不一致，调整 prompt 或换成另一个模型 ^["Evals到底在评什么？一文拆解AI评估的三种方法 (Lotte Verheyden, Langfuse, 2026-05-20)"]
5. 用代码检查兜底（如检查输出是否包含某关键词） ^["Evals到底在评什么？一文拆解AI评估的三种方法 (Lotte Verheyden, Langfuse, 2026-05-20)"]

### 4. 构建参考答案库的策略
参考答案评估适合： ^["Evals到底在评什么？一文拆解AI评估的三种方法 (Lotte Verheyden, Langfuse, 2026-05-20)"]

- 任务有明确"正确答案"的场景（如数学解题、代码生成）
- 可以预先定义输入-输出对
- 需要精确衡量输出质量
但注意： ^["Evals到底在评什么？一文拆解AI评估的三种方法 (Lotte Verheyden, Langfuse, 2026-05-20)"]

- 参考答案需要覆盖多样性，不能只是"最常见的输入"
- 要包含边界情况和对抗性输入

### 5. 无参考答案评估的生产监控
无参考答案评估可以应用到实时流量： ^["Evals到底在评什么？一文拆解AI评估的三种方法 (Lotte Verheyden, Langfuse, 2026-05-20)"]
1. 部署 LLM 裁判评估生产输出 ^["Evals到底在评什么？一文拆解AI评估的三种方法 (Lotte Verheyden, Langfuse, 2026-05-20)"]
2. 监控质量分数的分布和趋势 ^["Evals到底在评什么？一文拆解AI评估的三种方法 (Lotte Verheyden, Langfuse, 2026-05-20)"]
3. 当分数显著下降时触发告警 ^["Evals到底在评什么？一文拆解AI评估的三种方法 (Lotte Verheyden, Langfuse, 2026-05-20)"]
4. 将异常案例捕获到 traces 中 ^["Evals到底在评什么？一文拆解AI评估的三种方法 (Lotte Verheyden, Langfuse, 2026-05-20)"]
5. 人工审阅后加入数据集 ^["Evals到底在评什么？一文拆解AI评估的三种方法 (Lotte Verheyden, Langfuse, 2026-05-20)"]

### 6. 为 Agent 评估的特殊需求设计
Agent 评估需要额外的维度： ^["Evals到底在评什么？一文拆解AI评估的三种方法 (Lotte Verheyden, Langfuse, 2026-05-20)"]

- **轨迹评估**：不仅看最终输出，还看中间步骤是否合理
- **工具调用准确率**：Agent 是否在正确的时机调用了正确的工具
- **状态一致性**：多轮交互中 Agent 是否保持了状态
- **成本和延迟**：每次任务的 token 消耗和响应时间
- **高风险行为检测**：Agent 是否执行了危险操作

### 7. 将评估集成到 CI/CD
评估应该是发布流程的一部分： ^["Evals到底在评什么？一文拆解AI评估的三种方法 (Lotte Verheyden, Langfuse, 2026-05-20)"]

- **Prompt 变更后**：运行评估套件确保没有回归
- **模型变更后**：比较新旧模型在评估集上的表现
- **定期生产监控**：确保生产质量没有漂移
## 相关实体
- [Better Harness Eval Trace Methodology](../ch05/018-harness.html)
- [Anthropic Claude Next Gen Alex Infoq](ch01/1240-anthropic-claude.html)
- [Agent Skill Writing](../ch04/265-agent-skill.html)
- [Programbench Agent Benchmark](../ch04/164-programbench-agent-benchmark.html)
- [Llm As A Verifier Framework](ch01/1182-llm.html)

---

- [MOC](https://github.com/QianJinGuo/wiki/blob/main/moc/evaluation-and-benchmarks.md)
## 第 2 来源 — 腾讯 TEG 网关测试团队「AI Agent & Skill 测评方案及落地实践」(2026-06-16)

> Source: [第2原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/tencent-teg-agent-skill-evaluation-tperf-martinskxu-2026-06-16.md)
> Author: martinskxu (腾讯程序员 / 腾讯技术工程)
> Team: TEG 云架构平台部 网关测试团队
> Date: 2026-06-16 17:33

第 1 来源 (Langfuse Lotte 2026-05-20) 给出 **AI Evals 三种方法**(人工/代码/LLM-as-Judge)的**抽象方法论**。第 2 来源是**腾讯 TEG 网关测试团队在 TPerf 性能平台智能分析 Agent 项目上的生产级落地** — 把抽象方法细化为**三类评委角色 + 五大评估维度 + Trace 捕获 + Rubric 模板 + 悄悄退化告警** 的工程体系。 ^["Evals到底在评什么？一文拆解AI评估的三种方法 (Lotte Verheyden, Langfuse, 2026-05-20)"]

### 核心痛点(Agent 三大难题,本来源独家显式定义)

1. **非确定性**: 同一 prompt 多次执行结果不同,"跑通一次"≠"稳定能跑" ^["Evals到底在评什么？一文拆解AI评估的三种方法 (Lotte Verheyden, Langfuse, 2026-05-20)"]
2. **黑盒化**: 模型升级/Prompt 微调/工具链变化 → 行为漂移,肉眼难察觉 ^["Evals到底在评什么？一文拆解AI评估的三种方法 (Lotte Verheyden, Langfuse, 2026-05-20)"]
3. **错误级联放大** (本来源独家痛点): 一次任务涉及几十步工具调用,前序小偏差沿链路逐级放大,结论完全偏离 ^["Evals到底在评什么？一文拆解AI评估的三种方法 (Lotte Verheyden, Langfuse, 2026-05-20)"]

### 没有测评的 6 大被动局面(本来源独家清单)

| 痛点 | 后果 |
|------|------|
| 主观性强 | 依赖"感觉变好了"的直觉判断 |
| 悄悄退化 (本来源独家) | 改了 Prompt 或升级依赖,旧场景悄悄变差无人知晓 |
| 人工验证成本高 | Skill 越多/模型迭代越快,人肉回归成本指数级增长 |
| 模型不敢升级 | 没对比数据,错过能力提升和成本下降的红利 |
| 缺少效率基线 | 没延迟/Token/费用历史基线 |
| 过程易忽略 | 最终答案碰巧正确但推理路径错 |

### Eval 公式(本来源独家表达)

> **Eval(评估) = Agent 输入 → 执行 → 捕获执行过程(Trace + 产物) → 一组检查规则 → 可对比的分数**

### 三类评委角色定位(本来源 vs Langfuse 三方法对照)

| 维度 | 本来源三类评委 | Langfuse 三方法 | 角色定位 |
|------|-------------|---------------|---------|
| **主观强/慢** | **人工评分器(专家)** | 人工评估 | **校准/诊断/兜底** (本来源独家角色) |
| **客观快** | **确定性评分器** | 基于代码的评估 | **日常主力** (本来源独家角色) |
| **灵活中** | **Rubric 评分器(LLM-as-Judge)** | LLM-as-a-Judge | **扩展能力** (本来源独家角色) |

> **核心洞察**: Agent 测评**没有"银弹评分器"**,必须三类组合使用 — 本来源把 Langfuse 的抽象三方法**细化为"日常主力/扩展能力/校准兜底"的角色定位**。

### 五大评估维度(本来源独家,比 Anthropic 更全面)

| 维度 | 内容 |
|------|------|
| **功能正确性** | 最终答案对不对?任务完成没? |
| **过程质量** | 路径是否合理?工具调用正确?推理逻辑对? |
| **效率成本** | 延迟/Token/费用/步数 |
| **鲁棒性安全** (本来源独家) | 异常输入/对抗 prompt 注入/越权 |
| **体验对齐** (本来源独家) | 输出风格/语气/可读性/用户满意度 |

vs Anthropic Demystifying: **过程/结果/效率 三维** — 腾讯加 **鲁棒性安全 + 体验对齐** 两个维度。 ^["Evals到底在评什么？一文拆解AI评估的三种方法 (Lotte Verheyden, Langfuse, 2026-05-20)"]

### 用例设计 — Agent × Skill 二维矩阵(本来源独家)

**Agent 类型**: Task Agent(任务型) / Workflow Agent(工作流型) / Decision Agent(决策型) ^["Evals到底在评什么？一文拆解AI评估的三种方法 (Lotte Verheyden, Langfuse, 2026-05-20)"]
**Skill 类型**: Tool Skill(工具型) / Knowledge Skill(知识型) / Code Skill(代码型) ^["Evals到底在评什么？一文拆解AI评估的三种方法 (Lotte Verheyden, Langfuse, 2026-05-20)"]

按 **Agent 类型 × Skill 类型** 二维交叉生成测试用例 — 覆盖所有组合。 ^["Evals到底在评什么？一文拆解AI评估的三种方法 (Lotte Verheyden, Langfuse, 2026-05-20)"]

### Rubric 三要素(本来源独家可执行模板)

1. **评分维度 (criteria)**: 准确性/完整性/格式/推理合理性 ^["Evals到底在评什么？一文拆解AI评估的三种方法 (Lotte Verheyden, Langfuse, 2026-05-20)"]
2. **评分量表 (scale)**: 0-5 分制或 0-1 连续分 ^["Evals到底在评什么？一文拆解AI评估的三种方法 (Lotte Verheyden, Langfuse, 2026-05-20)"]
3. **评分说明 (rubric)**: 每个分数段对应的具体描述 ^["Evals到底在评什么？一文拆解AI评估的三种方法 (Lotte Verheyden, Langfuse, 2026-05-20)"]

**Rubric 模板示例(智能分析 Agent)**: ^["Evals到底在评什么？一文拆解AI评估的三种方法 (Lotte Verheyden, Langfuse, 2026-05-20)"]
| 维度 | 0 分 | 1 分 | 2 分 | 3 分 |
|------|------|------|------|------|
| 准确性 | 完全错误 | 部分正确 | 基本正确 | 完全正确 |
| 完整性 | 只回答 1 点 | 回答 <50% | 回答 ≥50% | 全覆盖 |
| 格式 | 不符合 | 部分符合 | 基本符合 | 完全符合 |

### Trace 捕获基础设施(本来源独家)

**必抓字段**: ^["Evals到底在评什么？一文拆解AI评估的三种方法 (Lotte Verheyden, Langfuse, 2026-05-20)"]
- 每步的输入/输出/耗时/Token 消耗
- 工具调用的完整参数和返回值
- 模型的思考过程 (thinking / reasoning)
- 错误信息(异常类型/堆栈/恢复路径)

**存储格式**: ^["Evals到底在评什么？一文拆解AI评估的三种方法 (Lotte Verheyden, Langfuse, 2026-05-20)"]
- **JSON Lines**: 每步一行,便于流式写入和回放
- **Schema 校验**: 强制字段类型,防止数据漂移
- **关联 run_id**: 单次执行所有步骤共享一个 ID

### TPerf 落地实践(本来源独家)

**项目**: TPerf 性能平台智能分析 Agent — 自动分析接口响应时间/吞吐量/错误率 ^["Evals到底在评什么？一文拆解AI评估的三种方法 (Lotte Verheyden, Langfuse, 2026-05-20)"]
**测评落地**: ^["Evals到底在评什么？一文拆解AI评估的三种方法 (Lotte Verheyden, Langfuse, 2026-05-20)"]
- **日常回归**: 确定性评分器(指标计算公式正确性 + 告警逻辑正确性)
- **质量评估**: Rubric 评分器(根因分析的合理性 + 建议的可执行性)
- **校准**: 人工评分器(每月抽样 50 例,与 Rubric 评分对照校准)

**关键收益**: ^["Evals到底在评什么？一文拆解AI评估的三种方法 (Lotte Verheyden, Langfuse, 2026-05-20)"]
- **模型升级决策**: 每次新模型发布可量化对比
- **Prompt 微调效果**: 改 prompt 后自动跑分,看趋势
- **悄悄退化告警**: 历史基线对比,异常波动立即发现

### 与已有评测实体的关系(本来源定位)

| 视角 | 本来源(腾讯 TEG 2026-06-16) | Anthropic Demystifying | WalleZhang YAML | Spotify Funnel | Langfuse Lotte |
|------|---------------------------|----------------------|----------------|---------------|---------------|
| **核心定位** | **腾讯 TEG 生产级落地** | 官方概念框架 | YAML 声明式框架 | 实验文化漏斗 | 三种方法拆解 |
| **评委分类** | **三类(确定性+Rubric+人工)** | grader 抽象 | pass@k + llm + constraint | funnels before exp | 人工+代码+LLM-as-Judge |
| **评估维度** | **5 维(功能/过程/效率/鲁棒/体验)** | 过程/结果/效率 | pass@k + pass^k | 漏斗指标 | 单方法 |
| **Trace 捕获** | **核心组件**(JSON Lines + Schema) | transcript/trace | 简单记录 | 未涉及 | 未涉及 |
| **错误级联** | **明确定义**(本来源独家痛点) | 未涉及 | 未涉及 | 未涉及 | 未涉及 |
| **悄悄退化** | **明确定义**(本来源独家痛点) | 未涉及 | 未涉及 | 未涉及 | 未涉及 |
| **生产落地** | **TPerf**(本来源独家) | 概念 | 框架 | Spotify 实践 | 概念 |

### 关键独到判断(本来源独家)

- **三类评委"日常主力/扩展能力/校准兜底"角色定位**: 把 Langfuse 抽象三方法细化为可操作的角色定义
- **五大维度 vs Anthropic 三维**: 加 **鲁棒性安全** 和 **体验对齐** — 这是 Agent 生产落地的实际需求
- **错误级联放大**(本来源独家痛点): Agent 与传统软件的根本差异,前序小偏差逐级放大
- **悄悄退化**(本来源独家痛点): 改 Prompt 或升级依赖,旧场景悄悄变差无人知晓 — 直到用户投诉才暴露
- **TPerf 落地实战**: 指标计算公式 + 告警逻辑 + 根因分析 + 优化建议 — 完整评估闭环
- **Rubric 三要素 (criteria/scale/rubric)**: 比 Langfuse 抽象的 LLM-as-Judge 更具体到可执行模板
- **Trace 捕获 Schema 校验**: 强制字段类型,防止数据漂移 — 工程纪律

### 实践启示

- **三类评委组合**: 不要只用 LLM-as-Judge — 加确定性评分器做日常主力,人工评分器做校准兜底
- **五大维度全覆盖**: 不能只看"最终答案对不对",要评估过程/效率/鲁棒/体验
- **建立 Trace 捕获**: 没有 Trace 就无法做"过程质量"评估 — Trace 是 Agent 评测的基础设施
- **悄悄退化告警**: 历史基线对比,异常波动立即发现 — 避免"靠用户投诉才发现"
- **Rubric 模板可复用**: 把好的 Rubric 沉淀为模板,跨项目复用
- **人工评分器做校准**: 每月抽样 50 例,与 Rubric 评分对照校准 — 防止 LLM 评分漂移
- **TPerf 案例可参考**: 性能分析 Agent 是"任务型 + 知识型 Skill"的典型组合,适合作为入门参考
- **错误级联放大是 Agent 评测的核心难点**: 任何"过程质量"评估必须考虑前序步骤对后续步骤的影响

→ [第2原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/tencent-teg-agent-skill-evaluation-tperf-martinskxu-2026-06-16.md) ^["Evals到底在评什么？一文拆解AI评估的三种方法 (Lotte Verheyden, Langfuse, 2026-05-20)"]

---

