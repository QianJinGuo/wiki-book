# Perplexity Computer Empirical Study: How AI Agents Reshape Knowledge Work

## Ch04.096 Perplexity Computer Empirical Study: How AI Agents Reshape Knowledge Work

> 📊 Level ⭐⭐ | 17.4KB | `entities/perplexity-computer-knowledge-work-empirical-study.md`

# Perplexity Computer Empirical Study: How AI Agents Reshape Knowledge Work

> 2026-06-08 Perplexity AI Research 与 Harvard Business School 联合发布的第一份全面 Perplexity Computer 真实部署实证研究。arXiv 技术报告 2606.07489。在 Computer 上线后仅约 105 天内 (2026-02-25 → 2026-06-08) 即拿出 HBS 学术严格度的生产数据。

## 深度分析

### 1. 知识工作的实证研究
Perplexity 的实证研究提供了 AI 对知识工作影响的量化数据——不只是"AI 有用"的定性断言，而是具体的效率提升、质量变化和使用模式数据。

### 2. Computer use vs structured API 的效率差异
与 `Computer Use 45X More Expensive Than Structured Apis` 的结论一致——结构化 API 调用在知识工作场景中比 computer use（模拟人类操作）效率高得多。

### 3. 知识工作者的行为变化
AI 不只提升效率，还改变知识工作者的行为模式——从"搜索信息"转变为"验证 AI 提供的信息"，从"写初稿"转变为"编辑 AI 生成的初稿"。

## 实践启示

### 1. 追踪 AI 对知识工作的行为影响
不只度量效率——还要度量行为变化（搜索→验证、写作→编辑）。

### 2. 验证技能比生成技能更重要
AI 时代，验证信息的准确性和完整性比从零生成信息更重要——投资验证工具和技能。

### 3. 用实证数据驱动 AI 采用策略
不要基于假设做 AI 采用决策——用 A/B 测试和实证数据量化实际影响。

## 相关实体
- [Perplexity Search As Code Generation](https://github.com/QianJinGuo/wiki/blob/main/entities/perplexity-search-as-code-generation.md)
- [Agent Harness Observability Production](../ch05/039-agent-harness.html)
- [Harness Engineering Systematic Explainer](../ch05/112-harness-engineering.html)
- [Google Agentic Rag Sufficient Context Agent Framesqa](../ch01/382-google-agentic-rag-sufficient-context-agent-framesqa-90.html)
- [Harness Engineered Business Agent Evaluation Aliyun Boyu](../ch05/099-harness.html)

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/perplexity-computer-knowledge-work-empirical-study.md)

## 三个独有贡献 (不应合并到现有 entity)

1. **首批 HBS-rigorous 的 general-purpose agent 生产实证** — 此前 agent 实证 (Sarkar 2026; McCain et al. 2026; Demirer/Musolff/Yang 2026; Yang et al. 2025) 多集中于 specialized coding agents 或 browser agents；本文把 assistant literature 与 agent literature 桥接，量化 general-purpose agent orchestrator 对 knowledge work 全谱的真实影响。
2. **Autonomy / Efficiency / Scope 三维度量化框架** — 不是单维度 productivity，而是从「自主程度」「效率收益」「任务范围扩张」三个互补维度构造 matched-pair 设计；100K 任务样本 + 8 域 x 18 sub-domain 覆盖，附 BLS OEWS wage 数据做 cost normalization。
3. **匹配任务下 Computer 87% 时间 / 94% 成本缩减 + 50% Create-level + 跨职业工作 59%** — 第一次给出可被同行复现的具体倍数 (在 18 个领域内一致 79-92% 时间节约)，且支持「user 从 operator 转向 supervisor」的范式跳跃论断。这是衡量 agent 真正经济价值的早期 baseline。

## 核心研究问题与三维分析框架

研究问题：frontier AI 如何改变跨职业的 knowledge work？预计会有怎样的结构性与经济性转变？

分析三维框架：
- **Autonomy (自主程度)** — 同样任务下 Computer 比 Search 多做多少自主执行？
- **Efficiency (效率)** — Computer 比 Search 节省多少时间和人工成本？
- **Scope (范围)** — Computer 如何改变用户愿意尝试的任务类型？

数据基础：
- Computer 上线日期：2026-02-25
- 观察窗口：2026-02-27 ~ 2026-05-27 (共 90 天)
- Computer 累计查询量 = 首周 84x (同期非 Computer 用户 Search 增长 12x，Computer 用户 Search 增长 14x)
- 10,000 对 matched Computer/Search 任务对比 (同初始 query)
- 100,000 条 Computer 任务类别分类样本
- 8,000 名 8 职业簇用户的跨职业行为样本
- 5,000 对 Computer/Search 双产品用户的 cognitive complexity 分析
- 25 名 active Computer 用户的半结构化访谈

## Autonomy (自主执行时长与质量)

### 自主时长差距

matched sessions 上 Computer 平均执行 26 分钟 vs Search 33 秒 (**48x 自主工作量差距**)。中位数差距 9 分钟 vs 14 秒 (**40x**)。Computer 均值远高于中位数说明长尾任务多。

18 个领域内 Computer 都比 Search 多做 26-75x 机器工作。

### 不会变成放弃率

- Computer session 3.7% 至少包含一次 user stop event
- Search session 3.4% 至少包含一次 user stop event
- 差距 0.3pp — **Computer 跑更久但 user 不会因此放弃**

### Pause-for-user 检查点

- 13% Computer queries 触发至少一次 pause-for-user tool
- Search 仅 0.3%
- **这是 agent 设计上的有意 checkpoint**：自主运行大多数时间，但关键决策点需要 user permission 和 clarification

### 跨服务 tool chain

- 7.9% Computer session 至少一次 connector call (vs Search 1.8%，4x 差)
- 平均每次 Computer session 1.19 connector calls (vs Search 0.10，**12x ratio**)
- **不只是跑更久，而是触达 user 连接的更多服务** (MCP/API endpoints)

### 多轮 follow-up 行为迁移

1,000 对 multi-turn 样本：
- 任务推进率几乎相同 (Computer 52.7% vs Search 52.9%)
- 但内容变化：Computer 用户的 follow-up 更偏 review-and-extend (extensions 14.2% vs 12.5%；review/revise 24.6% vs 23.6%)
- Search 更偏 short-directive (confirmations/retry/format 11.6% vs 9.9%)
- **Search = 短 digest-and-execute loop；Computer = 长 review-and-extend loop**

### 质量不下降

- 多轮 session 的 "meaningful next-turn dissatisfaction"：Computer 1.3% vs Search 2.9% (**55% 降低**)
- "any dissatisfaction" (含 mild signals)：Computer 10.8% vs Search 16.6%
- **自主提升未带来质量下降**

## Efficiency (87% 时间 / 94% 成本节约)

### 三种独立估计法

1. **Tool-based estimate**：把 Computer tool calls 分类为 "Search" (已是 Search 产品功能，不计人工时间) vs "Do" (Search-only 模式下 human 必须手动执行的步骤)，按 trained professional 标准估算 Do tool 的人工分钟数
2. **LLM-based estimate**：用 LLM 估算「拿到 Search 答案后 skilled professional 手动执行所有步骤需要的时间」
3. **User-reported estimate**：访谈 25 名 active Computer user，得出 pre-Computer workflow 时间基线

### 主要结果

Tool-based：
- Search + Human 平均 269 分钟
- Computer + Human 平均 36 分钟
- **87% 时间缩减**
- 引入 BLS OEWS May 2025 领域 hourly wage 后 → **94% 成本缩减**

跨 18 域：
- 时间节省 79-92%
- 成本节省 87-96%
- Programming 最极端：596 分钟 vs 48 分钟 (92% 时间 / 96% 成本)
- Business / Technology / Education / Writing 也大幅获利
- 高工资域时间节省 → 成本节省更大

### Robustness

- Break-even：Search + Human 要在 14-24 分钟 (median 18) 完成所有手动步骤才能与 Computer + Human 持平
- 即使 per-tool time 高估 8x 或 Computer oversight time 低估 12x，Computer 在所有 domain 都保持领先

LLM-based estimate：
- 84% 时间缩减
- 93% 成本缩减
- 与 tool-based 一致

User interviews：
- 5x 到 300+x speedup (巨大变异反映 pre-Computer baseline 差异)
- 中位数 **25x speedup = 96% 时间缩减**

## Scope (任务范围扩张 — 跨职业 + 认知层级)

### 横向扩张 (Cross-Occupation)

- 8 职业簇 x 8,000 user 样本
- Computer 用户 59% 工作发生在主职业簇之外 vs Search 50%
- 最大增幅：Management / Entrepreneurship、Digital Technology、Arts / Design、Healthcare / Human Services
- **Computer 用户把工作 delegate 到更多需要 specialist 的域**

### 纵向扩张 (Cognitive Complexity)

5,000 Computer + 5,000 Search paired query 比较：

**Bloom's Revised Taxonomy**：
- Computer 76% queries 是 higher-order cognition vs Search 55%
- 顶部集中：50% Computer queries 是 Create-level vs Search 26%
- Search 大量 mass 在 Remember-level (事实查询)

**Abstract vs Routine**：
- 71% Computer queries 是 abstract non-routine vs Search 53%

**O*NET Knowledge breadth**：
- 平均每条 Computer task 需要 2.40 个 O*NET Knowledge areas vs Search 1.74 (**+38%**)
- 51% Computer queries 需要 >=3 个 knowledge domains vs Search 17% (**3x ratio**)

**Work Activities breadth**：
- Generalized Work Activities：2.95 vs 2.24 (+32%)
- Intermediate Work Activities：4.01 vs 2.87 (+40%)
- Detailed Work Activities：+59%
- Task Statements：+60%

**Computer-only Task Statements**：
- 严格定义 (Computer 出现但 Search 完全不出现)：23% Computer queries 至少有一个
- 放宽到 <=5 Search occurrences：38%
- plateau 约 41%
- 这些 Computer-only 活动集中在 software/web development、documentation production、data visualization/graphics
- **这就是 autonomous execution 价值最大的地方：Search 解释；Computer 产出**

## User 角色范式转换

从 operator 转向 supervisor：
- 减少时间：操作 workflow
- 增加时间：specifying goals、supplying context、checking outputs、asking for extensions

文章预测：individual 层面 task frontier 扩张 (更广更深)，organizational 层面 work bundling / role definition / team structure 将重塑。

## 三个独有贡献的细节补充

**贡献 1 详 — HBS-rigorous**：HBS 合作给研究带来学术严格度 (matched-pair design、BLS wage normalization、breakeven analysis、sensitivity test)；这是 few agent empirical studies 提供的 rigor 等级。

**贡献 2 详 — 三维互补**：单一 productivity 数字无法回答 "Computer 是否在替代 Search" 还是 "Computer 在做 Search 之外的事"；autonomy、efficiency、scope 三维一起证明：Computer 主要不是让 Search 更快，而是让原本不做的事成为可能。

**贡献 3 详 — 可复现倍数**：所有倍数在 18 个领域内一致；break-even analysis + sensitivity 给出 Computer 不会被打破的最坏假设。这是衡量 agent 经济价值的早期 baseline，比 anecdotal 「AI 提升 X%」报道更可信。

## 与现有实体的差异化

| 维度 | perplexity-search-as-code-generation (现有, 2026-06-03) | perplexity-computer-knowledge-work-empirical-study (本文) |
|------|----------|----------|
| 主题 | 范式：search = code generation | 实证：Computer vs Search 部署数据 |
| 维度 | 系统架构 / SDK primitives | autonomy / efficiency / scope + 8 域 x 18 sub-domain |
| 数据 | 理论框架 + primitives 设计 | 10K matched sessions、100K 任务样本、25 访谈 |
| 输出 | 「如何重新建模 search」 | 「agent 对知识工作的量化影响」 |
| 价值 | 概念框架 | 实证 baseline |
| tags | agentic-search, code-generation, harness | empirical-study, hbs, productivity, autonomy |

| 维度 | agent-harness-engineering-survey (现有) | perplexity-computer-knowledge-work-empirical-study (本文) |
|------|----------|----------|
| 类型 | 系统综述 / 框架综述 | 单一产品实证研究 |
| 来源 | 多论文综合 | Perplexity + HBS 单篇 |
| 焦点 | harness 工程的通用原则 | Computer 在 knowledge work 中的真实行为 |
| 数据 | 综合多源文献 | 105 天生产数据 + 8 域样本 |
| 输出 | harness 设计原则 | agent 行为 / 经济量化 |

## 实践启示

1. **评估 agent 真实价值**：不要看 productivity 倍数，要看 autonomy x efficiency x scope 三维。Computer 48x 自主执行 + 87% 时间缩减 + 50% Create-level 三者一起才能证明 agent 价值。
2. **跨职业 delegate 是 agent 真正的 leverage**：59% 跨主职业簇 + 51% >=3 knowledge domains — agent 解放的是 specialist boundary，不是简单提速。
3. **Operator -> Supervisor 范式迁移**：工程团队需要重新设计 user 交互，从「给工具给用户」转向「给 supervisor dashboard 给用户」(context / checkpoint / extension API)。
4. **Pause-for-user checkpoint 设计**：13% pause 率是合理的；agent 设计应在关键决策点显式请求 user approval，而不是简单自动执行。
5. **Connector call 重要性**：Computer 1.19 connector calls / session 是 agent 价值的关键 — agent 不只是 LLM + 内部 tool，而是要 reach into 用户的实际工作 services。

## 局限

1. **观察窗口早，early adopter skew AI-native** — patterns 可能随主流用户进入而变化
2. **Session-based matched-query 设计** — 把没有 close Search equivalent 的 Computer 任务排除；session 是 noisy task unit proxy
3. **效率估算依赖假设** — human-equivalent tool time + oversight time；break-even + sensitivity 显示 robust 但精确幅度应作近似
4. **LLM classification 误差** — 引入额外 measurement noise
5. **仅 Perplexity 生态内** — 看不到用户在 Perplexity 之外的活动

## 参考文献与扩展

- arXiv 技术报告：[https://arxiv.org/abs/2606.07489](https://arxiv.org/abs/2606.07489)
- Perplexity Computer 产品页：[https://www.perplexity.ai/products/computer](https://www.perplexity.ai/products/computer)
- 同源前期工作 (Yang et al. 2025)：arXiv 2512.07828 — 「The Adoption and Usage of AI Agents: Early Evidence from Perplexity」
- 同作者 HBS 系列：Brynjolfsson, Li, Raymond 2025 (QJE)；Cui et al. 2026 (Management Science)；Demirer/Musolff/Yang 2026 (NBER WP 35275)

---

