# 复制这套神仙配置，让Claude Code全自动修Bug！告别每天重复教AI写代码

## Ch09.121 复制这套神仙配置，让Claude Code全自动修Bug！告别每天重复教AI写代码

> 📊 Level ⭐⭐ | 6.3KB | `entities/claude-code-self-repair-hooks-memory-config.md`

> -> [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/claude-code-self-repair-hooks-memory-config.md)

# 复制这套神仙配置，让Claude Code全自动修Bug！

## 核心问题

Claude 没有跨会话记忆。每次新会话都从零开始，昨天花 20 分钟修的 bug，明天照样会出现。Boris Cherny（Claude Code 创始人）采访爆料：Claude 团队内部已停止人为修复 Claude 的错误，改用自动化配置让 Claude 自己修复。

## 六层配置体系

### 1. CLAUDE.md 持续累积规则

CLAUDE.md 应该随着每次错误不断扩充。关键是「从错误中学到的」这一节——每次纠正 Claude 后加一句「更新 CLAUDE.md」。

研究建议：甜蜜点是 12 条规则、200 行以内。超过这个范围，执行率会明显下降。

### 2. PostToolUse 钩子：实时捕捉错误

在 Claude 写完或编辑完文件后立即运行，在问题扩散之前把它抓住：

- .ts 文件：Prettier 格式化 + TypeScript 类型检查
- .tsx 文件：ESLint 自动修复

### 3. Stop 钩子：质量门禁

在 Claude 说「我完成了」时触发，验证工作是否达标。如果测试失败，Claude 会自动继续修复。

**关键**：必须检查 stop_hook_active，避免循环。

### 4. PreToolUse 钩子：事前拦截

在工具执行之前运行，阻止代价高昂的操作。如拦截 .env 文件写入。

### 5. 自动重试模式

修复失败的测试，最多 3 次尝试。必须设置上限，避免无限重试。

### 6. 三层跨会话记忆

| 层级 | 捕获内容 | 更新方式 |
|------|----------|----------|
| CLAUDE.md | 项目级规律 | 每次纠正后手动更新 |
| /memory | 会话级学习 | 手动 add |
| Dreaming | 持久知识 | 后台自动积累 |

## 深度分析

Boris Cherny 这套配置的深层逻辑，是把「错误修复」从人力密集型工作转变为系统自动化工作。传统的 AI 协作模式是：AI 犯错 → 人发现问题 → 人解释给 AI → AI 修复 → 明天同样的错再来一遍。这套配置把中间的人工环节全部自动化：钩子在错误扩散前拦截，CLAUDE.md 把每次纠正固化为规则，记忆系统在会话间传递知识。

**三层防护网的协同效应**值得特别关注。PostToolUse 是即时反馈层，在代码写入后几秒内捕获类型错误和格式化问题；Stop 钩子是质量验收层，在 Claude 准备退出时验证整体行为；CLAUDE.md 是知识沉淀层，把具体错误转化为通用规则。三者组合在一起，形成了「发现→修复→固化」的完整闭环，单次错误几乎不会需要两次人工介入。

研究提到的 12 条规则、200 行上限是一个关键约束。CLAUDE.md 的价值不在于记录所有细节，而在于提炼高频模式。超过这个规模后规则本身的维护成本会超过收益，Claude 对规则的执行率也会下降。这意味着配置是一个持续精简的过程——每次添加新规则时，应该先删除已过时的规则，保持总规则数稳定。

另一个关键设计是 Stop 钩子中的 `stop_hook_active` 检查。这个变量防止 Claude 因为自己的修复行为触发 Stop 钩子而陷入循环。没有这个检查，Claude 可能陷入「修复→触发验证→验证认为还要修→继续修复」的死循环，消耗大量 token。

## 实践启示

**配置应该从小开始，逐步扩展**。不要试图一开始就设计完美的 CLAUDE.md 规则集。从最重要的 3-5 条规则开始（如「先跑测试」「不动 .env 文件」），每次错误后评估是否需要新增规则。定期回顾 CLAUDE.md，删除不再适用的规则。

**优先实现 PostToolUse + Stop 钩子的基础组合**，再考虑 PreToolUse 和重试逻辑。前两者解决 80% 的日常问题，后两者处理边界情况。一上来就构建完整配置容易因为过度工程化而难以维护。

**区分「项目规律」和「会话学习」**。CLAUDE.md 放跨项目适用的原则（如测试先行的开发流程），/memory 放当前任务特有的上下文（如某个 API 的特殊行为）。混在一起会导致 CLAUDE.md 膨胀过快，降低执行率。

**监控 token 消耗**。自动重试和 Stop 钩子组合使用时会显著增加 token 消耗。建议在前两周观察 token 增长曲线，如果发现异常飙升，检查是否陷入循环或规则过于严格导致反复重试。

## 相关主题

- [Agent Hooks：可编程工作流](../ch03/046-agent.html) — Hooks 生命周期节点详解（PostToolUse/Stop/PreToolUse 等）

## 相关实体

- [MOC](https://github.com/QianJinGuo/wiki/blob/main/moc/workflow-orchestration.md)

---

