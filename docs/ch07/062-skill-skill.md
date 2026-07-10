# 龙虾之父教你省钱：开源Skill给你的Skill减肥

## Ch07.062 龙虾之父教你省钱：开源Skill给你的Skill减肥

> 📊 Level ⭐⭐ | 5.7KB | `entities/steipete-skill-cleaner-liangzide.md`

# 龙虾之父教你省钱：开源Skill给你的Skill减肥

> **来源**：量子位（2026-05-26）| 原文存档：[原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/steipete-skill-cleaner-liangzide.md)

## 深度分析

本文报道 OpenClaw 创始人 Peter Steinberger（@steipete，「龙虾之父」）开源的 skill-cleaner 工具——一个用于审计和优化 Skill 描述、降低 Agent 运行时 token 成本的技能系统分析工具。

### 核心主张：Skill 是路标，不是说明书

Peter 的核心观点：Skill 描述写得像本书一样、把乱七八糟的东西都塞进上下文，是 Skill 设计中最常见的问题。

Skill 的目的是让 Agent 找到路，不该把整本说明挂在路标上。Skill.md 应该是简洁的指引（路标），调用逻辑应该是代码（说明书）。

实操案例：有人写了 90 多词的 Skill 描述，Agent 无法正确调用技能；砍到 40 词以内后，Agent 一次选对了技能。

### skill-cleaner 工具设计

Peter 开源的 skill-cleaner 做了示范：Skill.md 只有 56 行提示词，调用的脚本近千行代码。

5 个核心功能：

1. **技能提示词预算审计计算**：分析技能占用的上下文令牌空间、预算占用比例，给出预算优化方案。脚本采用 Codex 官方源码同款提示词预算核算逻辑（UTF8 字节数/4 向上取整），以模型上下文 2% 为默认技能预算基数，结合技能优先级排序规则（系统技能＞内置技能＞插件技能＞仓库自定义技能），核算全量技能原始占用令牌、最小渲染令牌、预算内可用令牌。

2. **重复技能检测**：跨 Codex 内置库、插件缓存、代码库、个人技能根目录，扫描同名技能、描述/内容高度相似的重复技能，标记冗余项。

3. **未使用技能筛查**：基于历史日志，识别长期未被调用、未被提及、无使用痕迹的闲置技能，提供清理候选清单。

4. **技能根目录审计**：统计所有技能的来源根目录，标注已启用/禁用状态，梳理技能加载链路。

5. **描述精简优化**：找出冗长的技能描述，通过简化语法压缩长度，节省提示词预算。精简流程：文本预处理（统一格式、全部小写、剔除标点符号）→ 匹配预设场景关键词词库 → 调用标准化短动作词组替换。

精简示例：调试类 → debug, inspect, fix；部署发布类 → deploy, release, verify；检索归档类 → search, sync, summarize。

### 三步工作流

1. **执行分析脚本**：在技能目录/仓库根目录运行 Node.js 脚本，支持自定义参数（时间范围、日志深度、预算阈值、自定义根目录等）
2. **查看审计报告**：按顺序阅读技能预算→描述优化项→重复技能→未使用技能→根目录汇总
3. **安全清理/编辑**：优先保留 Codex 内置技能，删除本地/重复副本；保留仓库核心运维技能；修改前验证保留文件有效性

### Token 成本思维

Skill 描述每多一句，Agent 每次调用就要多付一笔 token 账单。Agent 看到的信息越多，选择时的噪声也越多——延迟、成本、注意力全部受影响。

这与 Harness Engineering 的原则一致：把约束写进代码，而非提示词。Skill 的预算边界应由代码层面的计量决定，而非描述文本的模糊暗示。

Peter 本人在评论区开始用「穴居人」风格说话，把省 token 刻到骨子里：

```
install skill
agent smart
user happy
```

### 与现有实体的关系

已有 `entities/peter-steinberger-openclaw-100-ai-agents.md`（Peter 的 100 AI agent 30 天 $130 万案例），本文是其技能工程实践的延续——从「如何用大量 agent」到「如何让 agent 高效调用 skill」。

## 实践启示

1. **Skill 描述简洁性直接影响 Agent 选对率**：过长描述（90+ 词）导致 Agent 选错；40 词以内反而一次成功。Skill 应作为路标而非说明书。
2. **用脚本实现 Skill 逻辑而非提示词**：skill-cleaner 示例：56 行 Skill.md + 近千行脚本。逻辑越复杂，越应封装在代码而非提示词里。
3. **定期审计 Skill 预算**：基于 Codex 官方计费规则（UTF8 字节/4 向上取整，2% 上下文预算）计算技能占用，及时发现冗余。
4. **检测并清理重复/未使用 Skill**：跨目录扫描重复 Skill，识别长期闲置 Skill，保持技能系统精简。
5. **用标准化短词组精简描述**：调试类→debug/inspect/fix；部署类→deploy/release/verify；检索类→search/sync/summarize。

## 相关实体
- [Openclaw Prompt Context Harness](../ch11/222-openclaw.html)
- [Skill System Design Three Way Comparison](../ch04/266-skill.html)
- [Openclaw Agent Loop Design Patterns](../ch01/1121-openclaw-agent.html)
- [Tencent Skill Writing Complete Playbook Jackjchou](../ch04/266-skill.html)
- [Ai Skill Skill Creator 源码拆解](../ch04/421-skill-skill.html)

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/steipete-skill-cleaner-liangzide.md)

---

