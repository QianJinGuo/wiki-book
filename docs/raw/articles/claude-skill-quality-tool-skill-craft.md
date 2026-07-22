---
title: Claude Skill 质检工具 Skill Craft
source_url: https://mp.weixin.qq.com/s/R2mdJlmrhwGp4CZvcQ7Tgg
publish_date: 2026-04-30
tags: [wechat, article, claude, agent]
review_value: 7
review_confidence: 7
review_recommendation: neutral
sha256: f26ae5897fcf285c6ed78c87bc5c871443f84e78fe9fcc4a6e6462831a2344de
---
# Claude Skill 质检工具 Skill Craft
> Source: https://mp.weixin.qq.com/s/R2mdJlmrhwGp4CZvcQ7Tgg
> Author: 三石随笔录（微信公众号）
> Published: 2026-04-30
> GitHub: https://github.com/3stoneBrother/skill-craft
## 文章摘要
作者开发了一个面向 Claude Skill 的质量工程工具 **Skill Craft**，解决"不触发、乱触发、越用越跑偏"三类典型问题。核心观点：大多数 Skill 的问题不在"有没有功能"，而在"有没有质量防护"——本质上是没有把 Skill 当成需要工程化治理的对象。
## 7 类系统性失效模式
1. **约束衰减** — 对话一长，前面写在 Skill 里的规则越来越"像没写"。前五轮还严格执行，第十轮开始变味。
2. **工具选择漂移** — 指定优先用某工具，第一次超时后自行换成替代方案，再不回来。
3. **输出膨胀** — 要简明结论，回你一篇论文。消耗上下文，让后面的约束更容易失效。
4. **依赖链断裂** — Step 1 找到 29 个对象，Step 3 只处理 20 个，中间 9 个蒸发。
5. **并行孤岛** — 子 Agent 结论互相矛盾，主 Agent 不做去重一致性校验直接合并。
6. **触发模糊** — 用户随口一问"这个方案怎么样"，Skill 误判为"请开始执行完整流程"。
7. **幻觉填充** — 工具没查到结果，不说"没查到"，而是"补一个像样的答案"。
**关键洞察**：这 7 类问题会**连锁触发**。输出一膨胀 → 上下文挤满 → 约束衰减 → 工具漂移/步骤跳过/幻觉填充都更常见。
## Skill Craft 四种模式
| 模式 | 作用 |
|------|------|
| `check` | 评估单个 Skill 质量（8 结构模块 + 7 类反模式 + 3 条完整性原则） |
| `fix` | 修复 + 回归验证（修完后重新评估，确认分数提升 + 四类关联检查） |
| `create` | 从零生成合规 Skill（含 validate-metadata.py / validate-structure.py smoke check） |
| `audit` | 系统级审计多 Skill 路由边界、职责分工、真值源统一、外围文档传播 |
覆盖 Skill 完整生命周期：**创建 → 评估 → 修复 → 系统治理**。
## 三层评估体系
**第一层：8 个结构模块**
触发条件、行为准则、工具优先级、输出约束、流程 Checkpoint、依赖链、子 Agent 委派规则、幻觉防护。
每个模块的关键验收点：
- 触发条件：要有"触发"**"不触发"**"歧义处理"
- 流程步骤：不是写"逐个处理"，而是要写出**已完成数 == 应完成数**
- 幻觉防护：不是写"注意准确"，而是要求**"没有来源就不能输出"**
**第二层：7 类反模式风险**
看你的结构能不能真的防住对应问题。不是有没有模块，而是模块有没有**防御力**。
**第三层：3 条完整性原则**
1. **可计数验收** — 不写"逐个处理"，要写"处理数必须等于总数"
2. **Checkpoint 阻断** — 每一步都要有中间输出，防止模型一口气跳到最后
3. **失败路径定义** — 不能只有正常路径，没有 else。没写 else，模型默认的 else 往往就是 skip
## fix 模式关键机制
发现问题 → 输出问题清单 → 按优先级修复 → **回归验证**
修完后重新跑评估，看分数有没有提升、风险有没有下降、结构有没有闭环。分数没变或新旧口径打架，不算修好。
**四类关联检查**（每次修复都要求）：
- 引用方有没有同步
- 对称方有没有同步
- 消费方有没有同步
- 同层结构有没有类似问题
## create 模式
目标：生成从第一天开始就尽量合规的 Skill。判断 Skill 是轻量/中等/重型，再决定包含哪些模块。生成后跑自检 + 基础校验（validate-metadata.py / validate-structure.py）。
刻意定义为 **smoke check**，而非"最终裁决"——脚本只能快速筛掉明显错误，真正的质量判断仍要回到结构、约束和流程本身。
## audit 模式
当系统里有 5+ Skill 时，单独看每个也许都"不算太差"，但放在一起系统就会越来越不可控。关注**整个系统**的：
- 路由边界重叠
- 主文档改了，README 还在传播旧规则
- 引用链断裂
- 一个 Skill 在修，另一个 Skill 的路由说明停留在旧版本
## 实际案例发现（Obsidian 插件 Skill 系统，5 个 Skill）
- 有的 Skill 主文件接近 500 行，明显超预算
- 有的 Skill 看起来内容很多，但核心模块几乎没建起来
- 有的 Skill 最致命问题是没有写清楚 **"DO NOT trigger"**
- 系统层面，多个 Skill 的触发边界存在重叠风险
## 使用方式
```bash
# 放入 ~/.claude/skills/ 后，直接说：
评估 /path/to/my-skill
```
GitHub 开源：https://github.com/3stoneBrother/skill-craft