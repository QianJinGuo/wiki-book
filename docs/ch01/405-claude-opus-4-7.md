# Claude Opus 4.7 发布分析

## Ch01.405 Claude Opus 4.7 发布分析

> 📊 Level ⭐⭐ | 11.7KB | `entities/claude-opus-4-7-launch.md`

## 核心升级
- **新 tokenizer**：同一输入可多消耗 1.0-1.35x token，但整体推理效率提升使总 token 用量减少最多 50%
- **视觉增强**：支持 2,576px 长边图片（~3.75 MP），3x 于前代，可用于密集截图读取的 Computer-Use Agent
- **新 xhigh reasoning effort**：介于 high 和 max 之间，Claude Code 默认使用
- **任务预算 beta**、`/ultrareview`、Max 用户 Auto mode 扩展
- **指令遵循更加字面化**：针对 4.6 优化的提示词可能失效，测试框架需重新调优
- **文件系统记忆**：跨多会话长程工作记忆处理能力更强
- **现实世界知识工作**：Finance Agent 和 GDPval-AA（金融/法律领域）达到 SOTA

## Benchmark 跃进
| 基准 | Opus 4.6 | Opus 4.7 | 提升 |
|------|----------|----------|------|
| SWE-bench Pro | ~53% | 64.3% | +11pp |
| SWE-bench Verified | ~80% | 87.6% | +7pp |
| TerminalBench 2.0 | ~65% | 69.4% | +4pp |
| Document reasoning | 57.1% | 80.6% | +23.5pp |
| Vals Index | 67.7% | 71.4% | #1 |

## 第三方验证
- **Cursor**：内部 benchmark 58% → 70%
- **Notion**：内部 eval +14%，工具错误减少 1/3
- **LlamaIndex ParseBench**：图表 13.5% → 55.8%（大幅改善），排版轻微倒退 16.5% → 14.0%
- **定价**：~7¢/页（OCR 场景），vs agentic mode ~1.25¢/页

## Claude Code 负责人 Boris Cherny 更新要点
### 自动模式（Auto mode）= 告别权限弹窗
- Opus 4.7 擅长复杂长时任务（深度调研/代码重构/构建复杂功能/持续迭代至达标）
- Auto mode 将权限请求路由至模型分类器，判定安全则自动批准
- 意味着可**并行运行多个 Claude 实例**
- 面向 Max/Teams/Enterprise 用户，Shift+Tab 或在桌面版下拉菜单开启

### 新技能 `/fewer-permission-prompts`
- 扫描会话历史，识别本质安全但频繁触发弹窗的 bash/MCP 命令
- 推荐白名单（allowlist）以减少干扰

### Recaps（回顾）
- 对 Agent 已完成工作和后续计划的简短总结
- 离开长时间运行会话后回来查看进度极好用

### 专注模式（Focus mode）
- `/focus` 命令切换，隐藏中间执行过程，只关注最终结果

### Effort 设置
- Opus 4.7 采用**自适应思考**而非固定思考预算
- 低 Effort：更快响应、更低 token 消耗
- 高 Effort：最顶尖智能水平和执行能力
- `xhigh` 推荐用于大多数任务，`max` 仅对当前会话生效

### 验证工作至关重要
- 确保 Claude 能验证自己的工作成果，效率可提升 2-3 倍
- 后端：启动服务进行 E2E 测试
- 前端：Chromium 浏览器扩展
- 桌面应用：Computer Use
- Boris 常用 prompt：`"Claude，做某某任务 /go"` → `/go` 组合技能自动执行 E2E 自测 → `/simplify` → 提交 PR

## 官方 Claude Code 搭配最佳实践
### 交互式编码会话组织
- **第一轮讲清楚**：意图、约束、验收标准、相关文件位置都要在首轮提供
- **减少用户交互次数**：每多一轮增加推理开销
- **使用 auto mode**：适合完整上下文 + 长时间运行的任务
- **设置任务完成通知**：让 Claude 播放提示音或创建 hook 通知

### 推荐 effort 设置
- **medium/low**：成本/延迟敏感或范围明确的小任务
- **high**：智能水平与成本平衡，适合并发多会话
- **xhigh（默认/推荐）**：最强自主性与智能水平，适合大多数编码和 Agent 场景
- **max**：极困难问题，收益递减，容易过度思考

### 自适应思考配合
- Opus 4.7 不支持固定 thinking budget，每一步是否思考是**可选的**
- 想多思考：`Think carefully and step-by-step before responding; this problem is harder than it looks.`
- 想少思考：`Prioritize responding quickly rather than thinking deeply. When in doubt, respond directly.`

### 值得注意的行为变化（4.6→4.7）
- **响应长度自适应**：简单查询更短，开放式分析更长
- **工具调用频率降低但推理增加**：需明确告诉它何时该用工具
- **生成更少 subagent**：谨慎委派，需要并行时需显式说明

### 最佳适用场景
- 复杂多文件修改、定义模糊的调试、跨服务代码审查、多步骤智能体工作
- 过去主要受限于人工监督成本的任务

## 注意事项（Caveats）
1. **新 tokenizer**：同一输入 token 消耗增加 1.0-1.35x   ^[https://www.latent.space/p/ainews-anthropic-claude-opus-47-literally]
2. **思考成本**：高 effort 下会思考更久，输出更多 token   ^[https://www.latent.space/p/ainews-anthropic-claude-opus-47-literally]
3. **安全概况**：与 4.6 持平，提升诚实度和抗提示词注入，但伤害减少建议略弱   ^[https://www.latent.space/p/ainews-anthropic-claude-opus-47-literally]
4. **定位**：弱于 Claude Mythos Preview，Opus 4.7 是 Mythos 安全技术的试验场   ^[https://www.latent.space/p/ainews-anthropic-claude-opus-47-literally]

## 总结
相对 4.6，这是一次极具意义的升级，精准命中 Anthropic 核心客户群的三个痛点：**Agent 编程可靠性**、**Computer-Use Agent 视觉能力**、**知识工作基准表现**（GDPval-AA）。

## Cross-links
- → [Anthropic](ch01/847-anthropic.html)
- → [Claude Code 深度架构分析](https://github.com/QianJinGuo/wiki/blob/main/concepts/claude-code-deep-architecture-analysis.md)
- → [Claude Code 工具设计演化](https://github.com/QianJinGuo/wiki/blob/main/concepts/claude-code-tool-design-evolution.md)
- → [KAIROS Claude Code 常驻协作范式](https://github.com/QianJinGuo/wiki/blob/main/concepts/kairos-claude-code-paradigm.md)
- → [Claude Code Agent 工程设计](../ch03/067-claude-code-agent.html)
- → [Claude Harness 设计：Generator-Evaluator](ch01/847-anthropic.html)

## 相关实体
- [刚刚Opus 4.7发布，相比4.6核心变化，与Claude Code搭配最佳实践](../ch03/075-claude-code.html)
- [Cat Wu — Anthropic Claude Code/Cowork产品负责人](../ch03/075-claude-code.html)
- [claude-code-agent-view](../ch09/001-claude-code-agent-view.html)
- [Anthropic 官方技能最佳实践：14 个可复用的 Agent Skills 设计模式](../ch04/376-agent-skills.html)
- [AI Agent工具数量陷阱——5个边界清楚的工具胜过20个模糊工具](../ch04/147-ai-agent.html)
- [Anthropic发布「AI原生创业公司」手册：涵盖全流程四大核心阶段，一人公司法典来了](../ch04/432-anthropic-ai.html)
- [Claude Code 大型代码库最佳实践 — Anthropic 企业级部署指南](../ch03/075-claude-code.html)
- [Boris Cherny 新访谈：开发工具正在从 IDE 变成 Agent 控制台](../ch03/045-agent.html)
- [Claude 发布官方报告，承认存在 3 处质量退化问题](ch01/1037-claude.html)

- [Harness Engineering 七层框架](https://github.com/QianJinGuo/wiki/blob/main/concepts/harness-engineering-7-layers-framework.md)

- [MOC](https://github.com/QianJinGuo/wiki/blob/main/moc/evaluation-benchmarks-extended.md)
## 深度分析
### 战略定位：从工具到代理的范式跃迁
Opus 4.7 的核心叙事不是「更强」，而是**从辅助工具向自主代理**的角色转变。Boris Cherny 强调的 Auto mode 并行化、「Claude 做某某任务 /go」组合技能、以及 2-3 倍效率提升的验证机制，都在重新定义 human-AI 协作的边界——人类从「监督者」变成「发起者」。

### Tokenizer 变化的双面影响
1.0-1.35x 的 token 消耗增加是显性成本，但需放在总推理效率框架下理解：虽然单 token 成本上升，但整体任务完成所需的 token 总数减少最多 50%。这意味着**单次交互成本上升，但完整任务成本可能下降**。对于长程 Agent 任务，这个换算对成本模型有根本性影响。    ^[https://www.latent.space/p/ainews-anthropic-claude-opus-47-literally]

### Benchmark 跃进的真实含义
- **SWE-bench Pro 64.3%**：从「能辅助」到「能独立完成复杂工程任务」的临界点
- **Document reasoning 57.1% → 80.6% (+23.5pp)**：增幅最大，说明新 tokenizer 对结构化文档理解有特殊优化
- **Vals Index 71.4% 第一**：在第三方综合评估中确立 SOTA 地位
- **第三方验证（Cursor +12pp，Notion +14%）**：不是官方自测，而是客户实际场景的背书

### 指令遵循「字面化」的双刃剑
Anthropic 明确警告 4.6 优化提示词可能失效。这是一个**破坏性变更**而非平滑迁移：   ^[https://www.latent.space/p/ainews-anthropic-claude-opus-47-literally]

- 对于已建立 prompt 体系的团队，需要系统性回归测试
- 对于新用户是利好——字面化意味着更可预测、更少「自作主张」
- 测试框架（如 harness eval）需要同步调优，因为模型对指令的敏感度改变了 

### Mythos 的试验场定位
Opus 4.7 是 Anthropic 在安全护栏和网络保护技术上的**试验场**，这些技术最终会支撑 Mythos 的大规模推广。这意味着：

- 4.7 刻意在能力上弱于 Mythos Preview（受控发布）
- 但安全层面的迭代会首先在 4.7 上验证
- 后续 Mythos 可能会复用 4.7 验证过的护栏技术

## 实践启示
### 对于已有 Claude Code 投入的团队
1. **立即行动**：用原有 prompt 在 4.7 上跑一次完整任务，对比 4.6 的输出质量差异   ^[https://www.latent.space/p/ainews-anthropic-claude-opus-47-literally]
2. **Effort 再校准**：不要假设 4.6 的最佳 effort 设置在 4.7 上仍最优，xhigh 是新默认值得优先测试   ^[https://www.latent.space/p/ainews-anthropic-claude-opus-47-literally]
3. **Prompt 审计**：检查所有针对 4.6 特定行为优化的指令，可能需要重写   ^[https://www.latent.space/p/ainews-anthropic-claude-opus-47-literally]
4. **验证回路优先**：建立 E2E 测试能力——Claude 能验证自己工作成果时效率提升 2-3 倍   ^[https://www.latent.space/p/ainews-anthropic-claude-opus-47-literally]

### 对于 Cursor、Copilot 等第三方集成者
- 内部 benchmark 已有显著提升（58% → 70%），说明模型升级红利明显
- 需要关注工具调用频率降低但推理增加这一行为变化——可能需要调整 agent 协调逻辑
- Max 用户 Auto mode 是将 AI 编程推向完全自主的关键节点，值得提前布局

### 对于企业决策者
- Finance Agent 和 GDPval-AA 的 SOTA 表现说明其在**高经济价值知识工作**上的成熟度
- 定价持平（$5/$25 per M tokens）但能力跃升，性价比窗口打开
- 并行多 Claude 实例能力使「人机比」可以从 1:1 提升到 1:N，成本结构重估

### 对于个人开发者
- 简单查询会用更少 token 得到更短回答——成本意识场景天然利好
- 开放式分析/复杂任务会更长——这是「聪明」的代价，不必强行压缩
- `/focus` 模式让 CLI 用户可以在不关心过程时隐藏干扰，专注结果

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/claude-code-tool-design-evolution-anthropic.md)

- 建议先用 `xhigh` 跑一个完整项目再决定是否调整，而不是凭直觉选择低 effort 省成本

---

