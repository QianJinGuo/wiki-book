# Claude 4/5 Sonnet & Opus Release Notes

## Ch01.305 Claude 4/5 Sonnet & Opus Release Notes

> 📊 Level ⭐⭐ | 17.5KB | `entities/claude-4-5-sonnet-opus-release-notes.md`

## 发布时间线

| 模型 | 发布日期 | 定位 |
|------|----------|------|
| Claude Opus 4.7 | 2026-05-06 | 旗舰模型，编程/视觉/知识工作 SOTA |
| Claude Sonnet 4.6 | 2026-04 (推测) | 中端主力，高性价比推理 |
| Claude Opus 4.6 | 2026-03 (推测) | 前代旗舰 |
| Claude Sonnet 4.5 | 2026-02 (推测) | 前代中端 |
| Claude Sonnet 5 | 2026-06-30 | 最新 Sonnet 旗舰，接近 Opus 智能的 Sonnet 定价 |

## Sonnet 5 核心升级

Claude Sonnet 5 是 Anthropic 最新一代 Sonnet 模型，在 Amazon Bedrock 和 Claude Platform on AWS 上可用。它带来接近 Opus 级别的智能，同时保持 Sonnet 的定价和速度。

### 关键能力

- **编程**：导航真实代码库、落地多文件变更、完成长调试和重构任务，代码更干净、维护性更好
- **Agent 任务**：更可靠的自主操作骨干，处理复杂依赖链和多步骤工具调用
- **专业工作**：将长而复杂的非结构化源综合为结构化交付物（简报、分析、报告）
- **Computer Use**：自动化浏览器和桌面工作流

### 行业应用

- **金融服务**：电子表格建模、财务分析、审计代理（边做边自检）
- **生产力**：报告构建和审计、文档起草、结构化分析
- **Agent 自动化**：调用工具和运行多步骤无人值守任务的骨干模型

### 可用性

Sonnet 5 通过 Amazon Bedrock 和 Claude Platform on AWS 提供，支持 Anthropic Messages API、Invoke API 和 Converse API。

## Opus 4.7 核心升级

### 新 Tokenizer
- 同一输入可多消耗 **1.0-1.35x token**
- 但整体推理效率提升使总 token 用量**减少最多 50%**
- 对结构化文档理解有特殊优化

### 视觉增强
- 支持 **2,576px 长边图片**（~3.75 MP），3x 于前代
- 可用于密集截图读取的 Computer-Use Agent
- XBOW 安全视觉测试从 54.5% → **98.5%**，接近满分

### 新 Reasoning Effort：`xhigh`
- 介于 `high` 和 `max` 之间
- Claude Code **默认使用**此级别
- 采用**自适应思考**而非固定思考预算

### 自适应思考（Adaptive Thinking）
Opus 4.7 不支持带固定 thinking budget 的 Extended Thinking，取而代之的是自适应思考：

- 每一步是否思考是**可选的**，模型根据上下文自己决定
- 快速回应简单查询，不需要思考时直接跳过
- 把 thinking tokens 投入到最可能有帮助的地方
- **不再容易过度思考**

#### 精确控制思考频率的 Prompt 技巧
- **想让它多想**：`Think carefully and step-by-step before responding; this problem is harder than it looks.`
- **想让它少想**：`Prioritize responding quickly rather than thinking deeply. When in doubt, respond directly.`（可节省 token 但可能在困难步骤上损失准确性）

### 其他功能
- **任务预算 beta**、`/ultrareview`、Max 用户 Auto mode 扩展
- **指令遵循更加字面化**：针对 4.6 优化的提示词可能失效
- **文件系统记忆**：跨多会话长程工作记忆处理能力更强
- **现实世界知识工作**：Finance Agent 和 GDPval-AA（金融/法律领域）达到 SOTA

## Benchmark 跃进

| 基准 | Opus 4.6 | Opus 4.7 | 提升 |
|------|----------|----------|------|
| SWE-bench Pro | ~53% | **64.3%** | +11pp |
| SWE-bench Verified | ~80% | **87.6%** | +7pp |
| TerminalBench 2.0 | ~65% | **69.4%** | +4pp |
| Document reasoning (OfficeQA Pro) | 57.1% | **80.6%** | +23.5pp |
| Vals Index | 67.7% | **71.4%** | #1 SOTA |
| XBOW 安全视觉 | 54.5% | **98.5%** | +44pp |

## 第三方验证

- **Cursor**：内部 benchmark 58% → **70%**（+12pp）
- **Notion**：内部 eval **+14%**，工具错误减少 **1/3**
- **LlamaIndex ParseBench**：图表 13.5% → **55.8%**（大幅改善），排版轻微倒退 16.5% → 14.0%
- **定价**：~7¢/页（OCR 场景），vs agentic mode ~1.25¢/页

## Sonnet 4.6 定位

根据 Anthropic Managed Agents 平台文档，Claude Sonnet 4.6 作为中端模型：

- 支持 **多 Session 并发**（单次最多 100 个 Session）
- 与 Opus 4.7 共用同一基础设施
- 适合**高并发、高吞吐量**的 Agent 任务场景
- 迅速占据 Sonnet 系列主导地位，根据 AI Gateway Production Index，"Claude Sonnet 4.6 在发布后第一个完整月内吸收了 Sonnet 系列的大部分份额"

### Sonnet 4.6 性能基准

| 输入类型 | 文件大小 | Input Tokens | 推理时间 |
|---------|---------|--------------|---------|
| 单张图片 | 114 KB | ~1,600 | 1-5s |
| 20 页带图 PDF | 4.5 MB | ~33,000 | 20-26s |
| 100 张图片 | 11.1 MB | ~23,000 | 50-70s |

## Haiku 4.5 定位

Claude Haiku 4.5 作为轻量级模型，主打**高性价比**和**快速响应**：

- **最低延迟**：单张图片处理仅需 1-5 秒
- **多模态支持**：尽管体积小，仍支持图像理解
- **成本优化**：适合需要快速迭代的 Agent 任务
- 与 Sonnet 4.6、Opus 4.6 共用同一基础设施架构

### Haiku 4.5 vs 其他层级延迟对比

| 模型 | 单张图片 | 20页PDF | 100张图片 |
|------|---------|---------|-----------|
| Haiku 4.5 | 1-5s | 20-26s | 50-70s |
| Sonnet 4.6 | 1-5s | 20-26s | 50-70s |
| Opus 4.6 | 1-5s | 20-26s | 50-70s |

注：推理时间在不同层级模型间相近，但成本差异显著

## 模型层级与适用场景对照

| 层级 | 模型 | 核心优势 | 最佳场景 |
|------|------|---------|---------|
| **轻量级** | Haiku 4.5 | 最低成本、快速响应 | 简单查询、高频调用、初步筛选 |
| **中端** | Sonnet 4.6 | 高并发、高吞吐量 | Agent 任务、高流量应用 |
| **旗舰** | Opus 4.6 | 最高智能、长上下文 | 复杂推理、深度研究、代码重构 |
| **最新旗舰** | Opus 4.7 | 视觉 SOTA、编程增强 | Computer Use、深度调研 |

## 关键行为变化（4.6 → 4.7）

> [!warning] 破坏性变更警告
> Anthropic 明确警告：针对 4.6 优化的提示词可能失效。这是**破坏性变更**而非平滑迁移。

### 已确认的行为变化

1. **响应长度自适应**：简单查询更短，开放式分析更长。提供正向示例比否定式"不要这样写"更有效
2. **工具调用频率降低但推理增加**：需明确告诉它何时该用工具
3. **生成更少 subagent**：谨慎委派，需要并行时需显式说明。如果单次响应能直接完成就不生成 subagent
4. **思考成本变化**：高 effort 下会思考更久，输出更多 token
5. **medium/low 级别仍优于 4.6**：Opus 4.7 即使在低 effort 级别也优于 Opus 4.6 同级别表现

### 需重新调优的领域

- 测试框架（如 harness eval）对指令的敏感度改变
- Prompt 工程需要系统性回归测试
- 安全概况与 4.6 持平，提升诚实度和抗提示词注入，但伤害减少建议略弱

## Claude Code 最佳实践（Opus 4.7）

### 推荐 Effort 设置

| Effort | 适用场景 |
|--------|----------|
| **medium/low** | 成本/延迟敏感或范围明确的小任务。Opus 4.7 在此级别仍优于 Opus 4.6 同级别，有时甚至用更少 token |
| **high** | 智能水平与成本平衡，适合并发多会话 |
| **xhigh（默认/推荐）** | 最强自主性与智能水平，适合大多数编码和 Agent 场景。Claude Code 所有方案默认值设为 xhigh |
| **max** | 极困难问题，收益递减，容易过度思考。仅对当前会话生效，其他级别具有"粘性" |

> [!note]
> `medium/low` 级别在 Opus 4.7 下依然优于 Opus 4.6 同级别表现，有时消耗更少 token

### 交互式编码会话组织
- **第一轮讲清楚**：意图、约束、验收标准、相关文件位置都要在首轮提供
- **减少用户交互次数**：每多一轮增加推理开销
- **使用 auto mode**：适合完整上下文 + 长时间运行的任务
- **设置任务完成通知**：让 Claude 播放提示音或创建 hook 通知
- **使用 `/go` 组合技能**：让 Claude 自动执行 E2E 自测 → `/simplify` 重构 → 直接提交 PR

### 验证工作至关重要
确保 Claude 能验证自己的工作成果，效率可提升 **2-3 倍**：

- 后端：启动服务进行 E2E 测试
- 前端：Chromium 浏览器扩展
- 桌面应用：Computer Use

### Claude Code 新功能（Opus 4.7 配套）

#### Recaps（内容回顾）
- 对 Agent 已完成工作和后续计划的简短总结
- 适合长时间离开后回来查看进度

#### Focus Mode（专注模式）
- 隐藏所有中间执行过程，专注最终结果
- 使用 `/focus` 命令切换
- 适合信任模型可以准确执行任务的场景

#### /fewer-permission-prompts 技能
- 扫描会话历史，识别本质安全但反复触发权限的命令
- 生成白名单建议，避免不必要的干扰
- 精细化调整权限设置，不开启 auto mode 时尤其实用

#### /ultrareview
- 专属代码审查模式，标记 Bug 和设计缺陷
- Pro 和 Max 用户拥有 3 次免费额度

## Auto mode（自动模式）

- Opus 4.7 擅长复杂长时任务（深度调研/代码重构/构建复杂功能/持续迭代至达标）
- Auto mode 将权限请求路由至**基于模型的分类器**，判定安全则**自动批准**
- 分类器独立判断，风险低于"完全跳过权限确认"
- 意味着可**并行运行多个 Claude 实例**
- 面向 Max/Teams/Enterprise 用户，Shift+Tab 或在桌面版下拉菜单开启
- CLI：Shift+Tab | 桌面/VSCode：下拉菜单选择

## 定价信息

| 层级 | 输入 | 输出 |
|------|------|------|
| Opus | $5/1M tokens | $25/1M tokens |
| Sonnet | ~$1.5/1M tokens (推测) | ~$7.5/1M tokens (推测) |

定价持平但能力跃升，性价比窗口打开

## 注意事项（Caveats）

1. **新 tokenizer**：同一输入 token 消耗增加 1.0-1.35x
2. **思考成本**：高 effort 下会思考更久，输出更多 token
3. **安全概况**：与 4.6 持平，提升诚实度和抗提示词注入，但伤害减少建议略弱
4. **定位**：弱于 Claude Mythos Preview，Opus 4.7 是 Mythos 安全技术的试验场

## 战略定位

### 从工具到代理的范式跃迁
Opus 4.7 的核心叙事不是「更强」，而是**从辅助工具向自主代理**的角色转变。Auto mode 并行化、「Claude 做某某任务 /go」组合技能、以及 2-3 倍效率提升的验证机制，都在重新定义 human-AI 协作的边界——人类从「监督者」变成「发起者」。

### Mythos 的试验场定位
Opus 4.7 是 Anthropic 在安全护栏和网络保护技术上的**试验场**，这些技术最终会支撑 Mythos 的大规模推广。这意味着：

- 4.7 刻意在能力上弱于 Mythos Preview（受控发布）
- 但安全层面的迭代会首先在 4.7 上验证
- 后续 Mythos 可能会复用 4.7 验证过的护栏技术

## 深度分析

### 1. 旗舰模型定位出现战略分化：长上下文 vs 任务执行

Opus 4.7 最值得关注的不是它的全面提升，而是一次**有意识的战略放弃**。MRCR v2 256k 上下文检索从 91.9% 暴跌至 59.2%，1M 上下文从 78.3% 跌至 32.2%——这意味着 Anthropic 主动牺牲了长文档精确检索能力，将资源集中投向编程、视觉理解和任务执行。这一分化在 Claude Opus 4.7 与 4.6 之间形成了明确的使用场景分野：深度研究（RAG、长文档理解）继续用 4.6，自动化任务执行（coding、computer use）升级到 4.7 。

### 2. 范式跃迁：从"辅助工具"到"自主代理"的质变拐点

Opus 4.7 真正重要的叙事不是 SOTA 数字，而是 Auto mode 的推出——它将权限请求路由至基于模型的分类器，判定安全则自动批准执行。这意味着 Claude 可以**代表用户做决策**而非仅仅是执行指令。Boris Cherny 明确表示这次更新的核心在于增强 Agent 能力，让模型能更自主地处理长期任务。Auto mode 使得并行运行多个 Claude 实例成为可能，人类从「监督者」变成「发起者」 。

### 3. 新 tokenizer 的隐性成本：效率提升掩盖了潜在的隐形涨价

Anthropic 宣称整体推理效率提升使总 token 用量**减少最多 50%**，但前提是任务落在 4.7 提升明显的场景（编程、办公自动化、视觉理解）。对于日常知识管理、写方案、数据分析等提升不大的场景，token 消耗反而增加 1.0-1.35x。这是一个典型的「性价比陷阱」：定价不变但实际成本因使用场景而异 。

### 4. 自适应思考机制：模型从"被动工具"到"主动判断者"的认知升级

Opus 4.7 不再使用固定 thinking budget 的 Extended Thinking，而是采用 adaptive thinking——每一步是否思考由模型自己决定。这是模型判断能力的一次质变：模型被赋予了在「快速响应」和「深度思考」之间自主切换的权利，而不仅仅是执行用户指定的思考预算。配合 Prompt 技巧（"Think carefully..."或"Prioritize responding quickly..."），用户可以引导但无法强制模型的思考深度 。

### 5. 破坏性变更的深层逻辑：Anthropic 的主动技术换代策略

Anthropic 明确警告「针对 4.6 优化的提示词可能失效」，并将此定性为**破坏性变更**而非平滑迁移。这种直白的警告本身就是一个战略信号：Anthropic 不再追求向后兼容的渐进式升级，而是愿意牺牲短期的用户体验一致性来换取更大的技术换代力度。这与之前「4.6 是 4.5 的全面升级」的模式完全不同，暗示 Anthropic 正在进入一个更激进的技术迭代周期 。

## 实践启示

### 选型决策：建立场景-模型对照矩阵

不应盲目追求「最新最强」，而应根据任务类型建立严格的模型选择标准。编程、视觉理解、Computer Use 类任务优先选 4.7；长文档精确检索（超过 100k token 的 RAG 场景）、deep research 类任务继续用 4.6；日常闲聊和成本敏感型任务用 Sonnet 4.6 或 Haiku 4.5 。

### Prompt 迁移：对 4.6 提示词进行系统性回归测试

针对 4.6 精细调优的 Prompt 需要逐条回归测试，尤其是涉及「脑补」逻辑的提示词——4.7 会更字面化地执行，可能产生非预期结果。建议在切换前准备对照实验，验证输出质量是否下降 。

### Agent 开发：充分利用 Auto mode 的并行化能力

Auto mode 的自动批准机制使得并行运行多个 Claude 实例成为可能。对于可以拆分的独立子任务（如多个文件的代码审查、多个报告的数据分析），可以将任务并行化并通过 Auto mode 自动执行，显著提升吞吐量 。

### 成本监控：区分「表面定价」和「实际成本」

API 定价维持 $5/$25 不变，但新 tokenizer 导致实际 token 消耗变化 0.85x-1.35x。需要建立针对不同任务类型的 token 消耗监控，在账单分析中识别哪些场景实际在「隐形涨价」 。

### 效率优化：让 Claude 验证自己的输出

Anthropic 数据显示验证工作可将效率提升 2-3 倍。对于代码任务，确保 Claude 知道如何运行 E2E 测试；对于前端任务，使用 Claude Chromium 扩展让它控制浏览器验证；对于桌面应用，使用 Computer Use 功能。验证闭环是 Opus 4.7 Agent 工作流的核心组成部分 。

## 相关实体

- [Claude Opus 4.7](ch01/1132-claude.html) — 最新旗舰模型发布
- [Claude Opus 4.7 深度分析](ch01/844-claude-opus-4-7.html) — 详细发布分析
- [Anthropic](ch01/885-anthropic.html) — 模型开发商
- [MOC](https://github.com/QianJinGuo/wiki/blob/main/moc/evaluation-benchmarks-extended.md)

---

