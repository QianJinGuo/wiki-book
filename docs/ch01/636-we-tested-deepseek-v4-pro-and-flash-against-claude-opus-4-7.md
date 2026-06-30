# We Tested DeepSeek V4 Pro and Flash Against Claude Opus 4.7 and Kimi K2.6

## Ch01.636 We Tested DeepSeek V4 Pro and Flash Against Claude Opus 4.7 and Kimi K2.6

> 📊 Level ⭐⭐ | 5.4KB | `entities/deepseek-v4-pro-vs-claude.md`

> -> [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/deepseek-v4-pro-vs-claude.md)

## 核心要点
- value=8, confidence=9, product=72
- Well-structured technical benchmarking
→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/deepseek-v4-pro-vs-claude.md)

## 相关实体
- We Tested DeepSeek V4 Pro and Flash Against Claude
- [We Tested DeepSeek V4 Pro and Flash Against Claude Opus 4.7 and Kimi K2.6](https://github.com/QianJinGuo/wiki/blob/main/entities/wetesteddeepseekv4proandflashagainstclau.md)
- [DeepSeek-V4深度拆解：一篇论文同时做了五件大事](https://github.com/QianJinGuo/wiki/blob/main/entities/deepseek-v4.md)
- [ds4c deepseek v4 antirez](https://github.com/QianJinGuo/wiki/blob/main/entities/ds4c-deepseek-v4-antirez.md)

- [deepseek-v4深度拆解一篇论文同时做了五件大事](https://github.com/QianJinGuo/wiki/blob/main/entities/deepseek-v4深度拆解一篇论文同时做了五件大事.md)

- [MOC](https://github.com/QianJinGuo/wiki/blob/main/moc/evaluation-benchmarks-extended.md)
## 深度分析
### 评测方法论的价值
本次评测采用 FlowGraph 规范，一个包含 20 个端点、持久状态、租约管理、重试和事件流的基础设施级工作流编排后端。这比典型的编码基准测试更重，更能push模型到极限 ^。
关键洞察：**表面代码覆盖率与正确性之间的差距**。如果仅停留在模型总结层面，DeepSeek V4 Pro 和 Flash 的表现看起来更接近 Claude Opus 4.7，但直接代码审查加针对隔离 SQLite 数据库的定向复现揭示了隐藏的问题 ^。

### 核心问题模式
评测发现的问题集中在以下领域，这些领域在 Kimi K2.6 上也有类似表现 ^：
1. **租约过期处理**：DeepSeek V4 Pro 在心跳时强制执行租约过期，但不在完成时执行。API 返回 200 并将步骤记录为成功，即使原始 worker 已不再拥有该步骤 ^
2. **调度逻辑缺陷**：当 run 达到并行上限时，claim 逻辑一次只检查一个候选者，如果该候选者恰好属于已达到并行上限的 run，函数会放弃并返回空，而不是继续检查下一个候选者 ^
3. **构建完整性问题**：npm test 通过但 npm run build 不通过。TypeScript 配置设置为不发射任何编译输出，而 package.json 期望 npm start 运行该编译输出 ^

### 成本效益分析
DeepSeek V4 Flash 以 $0.02 的成本开创了一个新类别 ^：

- DeepSeek V4 Flash 的每点成本比 Kimi K2.6 便宜约 30 倍，比 Opus 4.7 便宜 100 倍
- 评分较低，但绝对美元金额如此之小，以至于运行相同任务三或四次比较尝试仍比一次 Kimi K2.6 运行便宜
- DeepSeek V4 Pro 评测时未使用官方折扣（75% off），使用折扣后同等运行成本接近 $0.55，低于 Kimi K2.6 ^

### 恢复机制是最难的部分
"任何模型在第一次通过时最难做对的spec部分"——这是评测的核心结论 ^。涉及时间、恢复或移动部件之间协调的部分是所有其他模型失分的地方。Claude Opus 4.7 只有1个可复现的bug，而其他三个模型有更多。
DeepSeek V4 Flash 还有另一个致命问题：路由前缀错误。规范要求 `/workflows/key/:key/runs`，但实际在 `/runs/key/:key/runs` 提供服务 ^。从测试套件角度看一切正常，但从实际客户端角度看，系统入口点缺失。

## 相关查询

- [DeepSeek 模型技术优势与 Agent 开发选型](https://github.com/QianJinGuo/wiki/blob/main/queries/deepseek-model-technical-advantages-agent-development-considerations.md) — DeepSeek V4 技术优势、训练方法、推理成本与 Agent 开发场景选型

## 实践启示
### 对于 AI 应用开发者的建议
1. **不要仅依赖测试通过率**：DeepSeek V4 Pro 的测试套件通过了，但构建失败 ^。在使用模型生成的代码前，必须进行端到端验证。
2. **关注边界条件**：租约管理、过期处理、并发调度等基础设施逻辑是模型最容易出错的地方 ^。生产部署前必须进行针对性测试。
3. **考虑成本效益权衡**：DeepSeek V4 Flash 的工具调用可靠性出人意料地好，在 Kilo CLI 中表现稳健，没有迷路、参数格式错误或幻觉文件路径 ^。对于可以接受粗糙首次通过加人工审查的场景，$0.02 的价格改变了经济学计算 ^。

### 对于模型选择决策者
1. **Claude Opus 4.7 仍然领先**：在涉及时间、恢复或协调的复杂逻辑上，只有 Opus 4.7 保持低错误率 ^
2. **DeepSeek V4 Pro 是 Kimi K2.6 的实用升级**：评分高 9 点，per-token 列表价格更低，产生的大致相同的失败模式，但结构更清晰、规范级差距更少 ^
3. **利用促销活动**：DeepSeek 的 75% 促销（截至 2026 年 5 月 31 日）显著改变了成本比较，使 DeepSeek V4 Pro 在绝对成本上低于 Kimi K2.6 ^

### 对于 AI 工程团队
1. **建立专门的评测规范**：使用基础设施级工作负载（而不是简单 CRUD）来评估模型的真实能力边界 ^
2. **实现多模型冗余策略**：DeepSeek V4 Flash 的 $0.02 成本使得同一任务多次尝试的策略在财务上可行 ^
3. **投资代码审查自动化**：鉴于所有模型在边界条件下的失败模式相似，需要建立自动化的边界条件测试套件 ^

---

