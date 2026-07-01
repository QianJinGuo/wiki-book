# Skill Craft — Claude Skill 质量工程框架

## Ch07.043 Skill Craft — Claude Skill 质量工程框架

> 📊 Level ⭐⭐ | 7.8KB | `entities/skill-craft.md`

## 7 类系统性失效模式
| # | 模式 | 描述 |  
|---|------|------|  
| 1 | **约束衰减** | 对话一长，规则越来越像没写 |  
| 2 | **工具选择漂移** | 指定工具超时后自行替换替代方案 |  
| 3 | **输出膨胀** | 要简明结论，回一篇论文；消耗上下文 |  
| 4 | **依赖链断裂** | Step 之间对象数量不一致（29→20，9个蒸发） |  
| 5 | **并行孤岛** | 子 Agent 结论矛盾，主 Agent 不做去重直接合并 |  
| 6 | **触发模糊** | 随口一问被误判为完整执行流程 |  
| 7 | **幻觉填充** | 工具没查到，\"补一个像样的答案\" |  
**关键**：这 7 类会**连锁触发**（输出一膨胀→上下文挤满→约束衰减→工具漂移/幻觉填充更常见）。

## 四模式架构
| 模式 | 生命周期阶段 | 核心机制 |  
|------|------------|---------|  
| `check` | 评估 | 8 结构模块 + 7 类反模式 + 3 条完整性原则 |  
| `fix` | 修复 | 回归验证（修完重跑评估）+ 四类关联检查 |  
| `create` | 创建 | 轻量/中等/重型分级 + smoke check |  
| `audit` | 治理 | 多 Skill 路由边界/职责分工/真值源统一 |  

## 三层评估体系
**第一层：8 个结构模块**
触发条件 · 行为准则 · 工具优先级 · 输出约束 · 流程 Checkpoint · 依赖链 · 子 Agent 委派规则 · 幻觉防护
**第二层：7 类反模式风险**
结构有没有防御力，而非有没有模块。
**第三层：3 条完整性原则**
1. **可计数验收** — \"处理数必须等于总数\"而非\"逐个处理\"
2. **Checkpoint 阻断** — 每步有中间输出，防止跳到最后
3. **失败路径定义** — 不能只有正常路径没有 else（else 默认往往是 skip）

## fix 模式：四类关联检查
每次修复后要求检查：

- 引用方有没有同步
- 对称方有没有同步
- 消费方有没有同步
- 同层结构有没有类似问题

## 深度分析
### 从\"有功能\"到\"有质量\"的范式转移
Skill Craft 的核心贡献在于重新定义了 Skill 的质量问题。大多数人关注 Skill \"能不能用\"——功能是否完整、指令是否清晰。但 Skill Craft 指出真正的问题：**Skill 能否在生产环境中持续可靠地运行**。这个问题不是写好 instructions 能解决的，需要结构性的防御机制。

### 七类失效的根因：上下文压缩与约束稀释
约束衰减和输出膨胀是连锁的。输出越长，上下文窗口被塞得越满，前面写的约束就越容易被\"忽略\"。这不是模型的 bug，而是 LLM 的注意力机制在超长上下文中天然倾向于\"跟着最近的指令走\"。因此 Skill Craft 强调：

- **Checkpoint 机制**：强制在每步输出中间结果，防止模型\"一口气跑到底\"
- **可计数验收**：用具体的数字约束替代模糊的\"逐个处理\"，让模型在每步都能自我检验

### 并行孤岛：多 Agent 系统的同步失效
子 Agent 独立工作却不共享上下文，是并行孤岛的根本原因。主 Agent 在合并结果时如果不做去重，会导致矛盾输出直接暴露给用户。Skill Craft 的解法是：在 Skill 层面预设\"一致性校验\"步骤，而非事后人工检查。

### 触发模糊：边界定义决定系统可控性
Skill 的触发条件如果写得不严格，用户随口一问就会触发完整执行流程——既浪费资源，又容易给出不匹配需求的答案。最容易被忽略的反而是 **\"DO NOT trigger\"** 条件——明确什么时候不该触发，比写清楚什么时候该触发更重要。

### audit 模式的意义：从单体到系统的治理升维
当 Skill 数量达到 5 个以上，单个 Skill 的质量已经无法保证整体系统的可靠性。路由边界重叠、文档版本不一致、引用链断裂等问题开始出现。这时的核心矛盾是：**每个 Skill 单独看都没问题，放在一起却开始冲突**。audit 模式就是为这个阶段准备的。

## 实践启示
### 1. 设计新 Skill 时，从\"防御\"而非\"功能\"出发
先想：这个 Skill 在什么情况下会乱触发、什么时候会不触发、什么时候会跑偏。围绕这三点设计防御结构，再补充功能实现。

### 2. 验收标准要\"可计数\"，不要\"模糊描述\"
- ❌ \"逐个处理所有文件\"
- ✅ \"处理文件数 == 扫描到的文件数，跳过需有明确记录\"

### 3. 每加入一个子 Agent，必须同时定义\"合并规则\"
没有合并规则的并行任务，是制造矛盾输出的流水线。

### 4. 修复后必须回归验证，不能\"凭感觉修完\"
Skill Craft fix 模式要求修完后重新跑评估，确认分数提升。修复前后的分数对比是判断修复有效的唯一客观依据。

### 5. Skill 数量 ≥ 5 时，启动 audit 模式
路由边界、职责分工、真值源统一、文档传播链路——这四件事在单体阶段可以忽略，进入系统阶段后必须定期审计。

### 6. 幻觉防护的底线：\"没有来源就不输出\"
不是写\"请注意准确性\"，而是在 Skill 里明确要求：**工具查不到结果时，必须返回\"未找到\"而非猜测**。

## 与 Harness Engineering 的关系
Skill Craft 和 [Harness Engineering](https://github.com/QianJinGuo/wiki/blob/main/concepts/harness-engineering-framework.md) 都关注 LLM 系统的**工程化治理**，但侧重点不同：

- **Harness Engineering**：经验如何沉淀成下一轮默认存在的能力（宏观框架）
- **Skill Craft**：Skill 本身的结构质量和系统级治理（微观工具）
Skill Craft 的 fix 回归验证逻辑与 Harness 的 Generator/Evaluator 循环有共通之处——都是通过**持续验证**防止能力退化。

## 关联阅读
## 相关实体
- [Skill Issues Compromising Claude Code With Malicious Skills Agents Part 1](ch04/245-skill.md)
- [Claude Design Skill Web Design Engineer](ch04/245-skill.md)
- [Claude Code Skill Writing Guide](ch04/245-skill.md)
- [Claude Design Skill](ch01/799-claude-design-skill.md)
- [Skill Issues Compromising Claude Code With Malicious Skills Agents](ch04/245-skill.md)

→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/claude-skill-quality-tool-skill-craft.md)

- [MOC](https://github.com/QianJinGuo/wiki/blob/main/moc/ai-skill-design.md)
## 使用
```bash  

# 把 Skill 放进 ~/.claude/skills/ 后
评估 /path/to/my-skill  
```

---

