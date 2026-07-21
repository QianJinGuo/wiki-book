# CLAUDE.md 12 条规则：Karpathy 扩展模板

## Ch09.044 CLAUDE.md 12 条规则：Karpathy 扩展模板

> 📊 Level ⭐⭐ | 12.9KB | `entities/claude-code-12-rules-karpathy-extension.md`

## 概述
基于 Forrest Chang 整理的 Karpathy 4 条 CLAUDE.md 规则，扩展 8 条覆盖 2026 年 5 月 agent 驱动场景的新规则。6 周 30 个代码库实测，错误率从 41% 降至 3%，遵循率保持 76-78%。

## 核心设计原则
CLAUDE.md 不是愿望清单，而是**行为契约**，每条规则对应一个可观察的失败模式： ^["[Claude写代码错误率从41%降到11%](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/claude-code-12-rules-karpathy-extension.md)"]

- 规则 ≤200 行，超过后遵循率骤降
- 命令式优于身份式（"说出假设" > "像资深工程师"）
- 规则优于例子（例子使模型过拟合，且更耗上下文）
- 不依赖可能不存在的工具（"匹配代码库风格"而非"使用 eslint"）
- 不可测试的规则（"小心一点"）遵循率仅 ~30%

## 规则体系
### 基础层（Karpathy 4 条）——防写代码失败
| 规则 | 核心 | 防什么 |
|------|------|--------|
| 1. 先思考再写 | 暴露假设，猜之前先问 | 静默假设 |
| 2. 简单优先 | 最少代码，不做推测性功能 | 过度工程 |
| 3. 手术式修改 | 只碰必须碰的，不顺手改进 | 无关破坏 |
| 4. 目标驱动 | 定义成功标准，循环验证 | 薄弱成功标准 |

### 扩展层（新增 8 条）——防 agent 编排失败
| 规则 | 核心 | 防什么 | 那个时刻 |
|------|------|--------|---------|
| 5. 模型只做判断 | 确定性逻辑用代码，非 LLM | 用 $0.003/token 跑不稳定 if-else | 503 重试策略变随机 |
| 6. 硬 token 预算 | 每任务 4K，每 session 30K | 无预算的 agent 循环 | 90min debugging 建议已否方案 |
| 7. 暴露冲突不折中 | 选择一方，解释原因，标记清理 | 冲突折中产生不连贯代码 | 两套错误处理模式混合 |
| 8. 先读再写 | 读 exports/调用者/工具后再加代码 | 写出冲突的重复代码 | 同名函数重复创建 |
| 9. 测试验证意图 | 测试编码 WHY，不只看 WHAT | 测试通过但业务逻辑错 | 12 测试全过，生产 auth 坏 |
| 10. 每步检查点 | 总结做了什么/验证什么/剩什么 | 多步骤任务断裂 | 6 步重构第 4 步走错继续 |
| 11. 约定胜过新奇 | 一致性 > 口味 | 引入第二套模式测试失效 | React hooks 入 class 代码库 |
| 12. 失败要响亮 | 跳过即失败，不确定即暴露 | 静默成功掩盖静默失败 | migration 跳 14% 记录 |

## Karpathy 模板的 4 个失效点
1. **长时间运行的 agent 任务**：无预算/检查点/失败显式，pipeline 漂移 ^["[Claude写代码错误率从41%降到11%](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/claude-code-12-rules-karpathy-extension.md)"]
2. **多代码库一致性**："匹配既有风格"假设只有一种风格 ^["[Claude写代码错误率从41%降到11%](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/claude-code-12-rules-karpathy-extension.md)"]
3. **测试质量**：目标驱动把"测试通过"当成功，没要求有意义 ^["[Claude写代码错误率从41%降到11%](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/claude-code-12-rules-karpathy-extension.md)"]
4. **生产 vs 原型**："简单优先"在早期原型上过度触发 ^["[Claude写代码错误率从41%降到11%](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/claude-code-12-rules-karpathy-extension.md)"]

## 数据
- 无规则 → 错误率 41%
- Karpathy 4 条 → 错误率 ~3%，遵循率 78%
- 全部 12 条 → 错误率 3%，遵循率 76%
- 超过 14 条 → 遵循率从 76% 掉到 52%

## 深度分析
**1. 遵循率-规则数量的倒 U 型曲线揭示了认知带宽的物理限制** ^["[Claude写代码错误率从41%降到11%](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/claude-code-12-rules-karpathy-extension.md)"]
当规则从 4 条增至 12 条，遵循率仅从 78% 微降至 76%（下降 2 个点），但继续增至 14+ 条时，遵循率骤降至 52%（下降 24 个点）。这表明存在一个认知容量阈值：规则在 6-12 条范围内时，每条规则的边际认知成本低于临界值；超过临界值后，规则之间开始竞争上下文资源，导致全面失效。这不是简单的"规则越多越难记"，而是上下文窗口在承载规则集时存在结构性容量限制。 ^["[Claude写代码错误率从41%降到11%](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/claude-code-12-rules-karpathy-extension.md)"]
**2. 例子过拟合比规则失效更难诊断和修复** ^["[Claude写代码错误率从41%降到11%](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/claude-code-12-rules-karpathy-extension.md)"]
作者明确指出"在 CLAUDE.md 放例子比规则更重，Claude 会过拟合"。这是因为例子锚定了特定的代码模式，而规则提供了可泛化的行为边界。当模型拟合了例子后，遇到变体时会尝试匹配而非推理。即使更新规则，旧的例子仍然在上下文中持续干扰新规则的解释。这种污染是隐性的——测试通过，但覆盖场景与原始意图已发生漂移。 ^["[Claude写代码错误率从41%降到11%](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/claude-code-12-rules-karpathy-extension.md)"]
**3. "像资深工程师"失效的根因是身份声明不等于能力分配** ^["[Claude写代码错误率从41%降到11%](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/claude-code-12-rules-karpathy-extension.md)"]
Karpathy 的原始规则用身份语言（"像资深工程师"）来传递行为期望，但实验中这条完全失效——Claude 已经认为自己就是资深工程师。问题在于身份声明只激活了模型的自我定位，没有提供能力边界信息。有效的规则必须显式声明约束条件，而不是假设身份会自动附带约束。这是 prompt 工程中"身份式 vs 命令式"差异的核心：前者依赖模型的自我认知，后者提供客观执行边界。 ^["[Claude写代码错误率从41%降到11%](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/claude-code-12-rules-karpathy-extension.md)"]
**4. 硬 token 预算规则是 agent 系统的"断路器"设计** ^["[Claude写代码错误率从41%降到11%](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/claude-code-12-rules-karpathy-extension.md)"]
规则 6（Per-task 4K, Per-session 30K）将 token 消耗从"可优化成本"变为"硬性停止条件"。在无预算约束下，模型会在错误的路线上持续消耗 token 直到用户干预——这正是"90min debugging 建议已否方案"所描述的典型失效模式。Token 预算的本质是给模型一个自主决策的退出权限，防止它在局部最优路径上无限徘徊。这与软件工程中断路器模式（circuit breaker）的设计哲学完全一致：在远程调用失败超限后自动熔断，防止级联故障。 ^["[Claude写代码错误率从41%降到11%](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/claude-code-12-rules-karpathy-extension.md)"]
**5. 失败显式化（Fail Loud）将系统可观测性扩展到了 agent 决策层** ^["[Claude写代码错误率从41%降到11%](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/claude-code-12-rules-karpathy-extension.md)"]
规则 12 要求任何被跳过的步骤都必须显式声明，这意味着将代码级别的异常处理（exception handling）语义迁移到了 agent 行为层。传统软件中，忽略错误而不报是严重反模式；在 agent 系统中，"静默成功"（silent success）是同等危险的反模式——它让模型在后台跳过关键步骤而表面状态正常。Fail Loud 规则把这个可观测性问题显式化，使 agent 的行为图谱与人类的可理解性对齐。 ^["[Claude写代码错误率从41%降到11%](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/claude-code-12-rules-karpathy-extension.md)"]

## 实践启示
1. **从实际失败案例而非模板生成规则**：在编写 CLAUDE.md 前，先审查模型在过去代码库中产生的具体错误类型，每条规则必须能回答"这条规则防止哪种已观察到的失败"。空降 Karpathy 模板而不根据项目实际情况剪裁，会导致规则与实际风险不对齐。 ^["[Claude写代码错误率从41%降到11%](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/claude-code-12-rules-karpathy-extension.md)"]
2. **用每任务 4K token 预算作为自动断路器**：在 agent 系统中集成 token 计数监控，当单任务消耗超过 4K tokens 时强制中断并生成决策摘要报告。超过 30K tokens 的 session 必须触发上下文重置并保存交接文件。这不是保守主义，而是防止模型在局部最优路径上消耗超出比例的资源。 ^["[Claude写代码错误率从41%降到11%](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/claude-code-12-rules-karpathy-extension.md)"]
3. **规则 5（模型只做判断）是成本控制的核心杠杆**：对于确定性逻辑分支（状态码处理、重试策略、路由选择），强制使用规则判断替代模型推理。这直接降低了每千次调用的成本（从 $0.003/token 层级降至接近零）。建议在项目初期就建立确定性逻辑目录，并将其从 LLM 可调用函数集中排除。 ^["[Claude写代码错误率从41%降到11%](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/claude-code-12-rules-karpathy-extension.md)"]
4. **保持规则数在 6-12 条的认知安全边界内**：如果项目需要覆盖更多风险场景，优先将低频场景合并到现有规则的"或"条件中，而不是新增独立规则。14 条后遵循率骤降 24 个点的数据表明，在规则数量上妥协远比在规则质量上妥协危险。 ^["[Claude写代码错误率从41%降到11%](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/claude-code-12-rules-karpathy-extension.md)"]
5. **测量并追踪遵循率作为迭代信号**：建议在每次 sprint 后随机抽样 10 个代码变更，计算其中有多少符合 CLAUDE.md 规则（而非只看错误率）。遵循率是规则有效性的领先指标——它下降往往先于错误率上升出现。如果遵循率低于 70%，说明规则需要重新设计，而非继续增加规则数量。 ^["[Claude写代码错误率从41%降到11%](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/claude-code-12-rules-karpathy-extension.md)"]

## 参考来源
- [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/claude-code-12-rules-karpathy-extension.md)
- Karpathy 原始模板：[Forrest Chang's repo](https://github.com/forrestchang/andrej-karpathy-skills) (120K star)

## 相关实体
- [Claude Code 可控性：软规则无法变成硬约束](../ch03/076-claude-code.html) — 软规则 vs 硬约束的深度对比
- [Claude Code 源码解析：Skills/MCP/Rules 底层机制对比](../ch07/006-claude-code-skills-mcp-rules.html)
- [Claude Code vs OpenClaw Agent 记忆系统对比](../ch03/076-claude-code.html)
- [两万字详解Claude Code源码核心机制](../ch03/076-claude-code.html)
- [Claude Code Subagent 上下文卫生](../ch04/302-claude-code-subagent.html)
- [开源 AI 知识管理搭档 Obsidian + Claude Code 完整集成指南](../ch03/075-obsidian-claude-code.html)
- [MOC](https://github.com/QianJinGuo/wiki/blob/main/moc/prompt-engineering-guide.md)

---

