# Personal AI 工作台：Claude 18 动作框架

## Ch01.223 Personal AI 工作台：Claude 18 动作框架

> 📊 Level ⭐⭐ | 17.3KB | `entities/ruofei-personal-ai-workbench-18-actions.md`

## 核心立场
> Claude 用得好不好，越来越像一个**环境工程问题**，而非提示词技巧问题。
核心论点：给 Claude 一个稳定的工作现场（Personal Harness），比优化单次提示词更有复利价值。   ^[原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/ruofei-claude-18-actions-personal-ai-workbench.md)]

## 六层工作台结构
| 层 | 核心问题 | 解决的痛点 |  
|----|---------|----------|  
| 工作区 | 不同任务放不同 Project | 上下文互相污染 |  
| 身份 | 你是谁、做什么项目 | Claude 无法从零猜 |  
| 行为契约 | Custom Instructions | 每次重复设定偏好 |  
| 任务入口 | 先问 3 个关键问题再执行 | 需求不清就开干 |  
| 输出标准 | 风格样本、长度、完成证据 | 输出跑偏不可验 |  
| 上下文治理 | 新话题开新 chat | 旧上下文污染新任务 |  

## 18 个动作映射到六层
### 工作区（边界）
1. **建 Project，而不是长期混用一个 chat** — Project 是边界，不是万能记忆   ^[原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/ruofei-claude-18-actions-personal-ai-workbench.md)]

### 身份
2. **写一份个人说明** — 让 Claude 知道角色、目标、知识背景   ^[原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/ruofei-claude-18-actions-personal-ai-workbench.md)]

### 行为契约
3. **把个人说明转成 Custom Instructions** — 固化默认协作方式   ^[原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/ruofei-claude-18-actions-personal-ai-workbench.md)]

### 任务入口
4. **不只问定义，而是给出真实任务场景** — 让 Claude 参与解题   ^[原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/ruofei-claude-18-actions-personal-ai-workbench.md)]
5. **复杂任务开始前先让它问问题** — 少靠平均经验猜   ^[原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/ruofei-claude-18-actions-personal-ai-workbench.md)]
6. **给 3 到 5 段风格样本** — 把"像我"变成可学习样例   ^[原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/ruofei-claude-18-actions-personal-ai-workbench.md)]

### 输出标准
7. **让它反向评审方案，再做支持方论证** — 挖出隐含假设   ^[原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/ruofei-claude-18-actions-personal-ai-workbench.md)]
8. **复杂问题打开 Extended Thinking** — 给困难任务更多推理空间   ^[原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/ruofei-claude-18-actions-personal-ai-workbench.md)]
9. **让 Claude 先替 Claude 写任务说明** — 把模糊需求改成可执行任务单   ^[原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/ruofei-claude-18-actions-personal-ai-workbench.md)]
10. **指定输出长度** — 控制阅读成本和调用成本   ^[原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/ruofei-claude-18-actions-personal-ai-workbench.md)]
11. **去掉客套开场、重复总结和无效免责声明** — 让结果更干净   ^[原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/ruofei-claude-18-actions-personal-ai-workbench.md)]

### 上下文治理
12. **不要每次重新解释自己** — 把稳定信息放进工作区   ^[原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/ruofei-claude-18-actions-personal-ai-workbench.md)]
13. **新话题开新 chat** — 避免旧任务污染新任务   ^[原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/ruofei-claude-18-actions-personal-ai-workbench.md)]

### 反馈回路
14. **用类比和费曼法解释复杂概念** — 检查是否真的理解   ^[原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/ruofei-claude-18-actions-personal-ai-workbench.md)]
15. **用真实偏好和约束做计划** — 避免生成通用方案   ^[原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/ruofei-claude-18-actions-personal-ai-workbench.md)]
16. **用真实数据做开支、时间或项目分析** — 让建议落到证据上   ^[原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/ruofei-claude-18-actions-personal-ai-workbench.md)]
17. **先提问、再复述、最后给观点** — 不急着给建议   ^[原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/ruofei-claude-18-actions-personal-ai-workbench.md)]
18. **投入前压力测试商业想法或关键方案** — 提前暴露失败点   ^[原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/ruofei-claude-18-actions-personal-ai-workbench.md)]

## 关键设计原则
### Project 是边界，不是万能记忆
> 同一 Project 里的不同 chat，并不会天然共享彼此的上下文。除非信息被放进 knowledge base，或者你在新 chat 里重新提供。
适合放进 Project 的：角色、长期目标、常用资料、术语表、判断标准、已确认事实、输出格式。   ^[原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/ruofei-claude-18-actions-personal-ai-workbench.md)]
不适合塞进来的：临时偏好、未验证结论、只对一次任务有效的东西。   ^[原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/ruofei-claude-18-actions-personal-ai-workbench.md)]

### Custom Instructions = 行为契约，而非人格设定
bad example:   ^[原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/ruofei-claude-18-actions-personal-ai-workbench.md)]
```  
你是一位顶级专家，回答要深刻、全面、专业。  
```  
good example:   ^[原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/ruofei-claude-18-actions-personal-ai-workbench.md)]
```  
你默认用中文回答，段落短一点。  
遇到技术判断时，先给结论，再说依据和边界。  
如果任务信息不足，先问最多 3 个关键问题，不要自己补全高风险假设。  
不要重复我的问题，不要用"这是一个好问题"开头。  
涉及事实、日期、链接、版本、价格时，需要先核对来源。  
```  

### 流程卡片 = 过程资产，而非一次性提示词
高频任务应沉淀为流程卡片：   ^[原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/ruofei-claude-18-actions-personal-ai-workbench.md)]
```markdown  

# 方案评审流程卡
适用场景：当我要评审一个产品、架构、文章主线或商业想法时使用。  
默认步骤：  
1. 先复述方案的目标和约束。  
2. 找出 5 个最可能失败的假设。  
3. 给出反方视角，不要急着帮我圆。  
4. 再给出最完整的支持理由。  
5. 最后给出你的真实判断，并列出需要验证的证据。  
完成标准：输出需要区分事实、推测和建议；不能只给泛泛风险。  
```  
使用时只需一句：「按方案评审流程卡处理下面这个想法。」   ^[原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/ruofei-claude-18-actions-personal-ai-workbench.md)]

### 上下文隔离：新话题开新 chat
这个动作的价值不只是省 token，更重要是**隔离上下文**：   ^[原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/ruofei-claude-18-actions-personal-ai-workbench.md)]

- 前半段讨论旅游规划，后半段写商业邮件 — 旧上下文白白占窗口
- 前半段用轻松语气写朋友圈，后半段写技术分析 — 可能带语气惯性
- 临时偏好（「这次不要讲风险」）可能延续到不相关的后续任务

### "先问我问题"的价值
需求澄清前置 — 软件项目最贵的错误通常来自问题定义错了，而非代码写慢。问最多 3 个关键问题，在"准确"和"推进"之间保持平衡。   ^[原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/ruofei-claude-18-actions-personal-ai-workbench.md)]

### 反馈回路：让 Claude 反对你
不要只让 Claude 待在生成回路里，也要让它进入反馈回路：   ^[原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/ruofei-claude-18-actions-personal-ai-workbench.md)]
```  
下面是我的方案。先不要优化它。  
请先做三件事：  
1. 找出它最可能失败的 5 个假设。  
2. 站在反方角度，给出更完整的反驳。  
3. 再站在支持方角度，说明它在什么条件下成立。  
最后给出你的真实判断，并列出需要验证的证据。  
```  

## 与 Harness 工程化的对应关系
| Personal AI 工作台 | 团队 Harness 层 | 对应 Claude 功能 |  
|-------------------|----------------|-----------------|  
| 工作区（Project） | 上下文隔离层 | Claude Projects |  
| 身份 + 行为契约 | SOUL.md / AGENTS.md | Custom Instructions + Project Instructions |  
| 事实源（Knowledge Index） | 知识库 / 地图 | Project Knowledge Base |  
| 流程卡片 | Skills | Project 内 Markdown 流程文档 |  
| 输出标准 | 验证 / 边界 | 输出格式约定 |  
| 反馈回路 | 观测 / 复盘 | 反方评审 + 压力测试 |  

## 最小可行版本
```  
3 个 Project：Work / Writing / Learning  
每 Project 一份 ~300-500 字的个人说明  
3-5 张流程卡片（写作、调研、方案评审）  
3-5 个风格样本  
每周一次 Project 清理  
```  

## 边界注意事项
1. **敏感信息**：身份证、密钥、内部数据，默认不放 Project knowledge base   ^[原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/ruofei-claude-18-actions-personal-ai-workbench.md)]
2. **临时偏好 ≠ 长期规则**：任务结束偏好失效，不应写入长期 Instructions   ^[原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/ruofei-claude-18-actions-personal-ai-workbench.md)]
3. **警惕"更懂你"**：AI 系统迎合你 ≠ 帮助你保持正确   ^[原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/ruofei-claude-18-actions-personal-ai-workbench.md)]
4. **知识库要维护**：旧资料不删 → 另一种技术债   ^[原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/ruofei-claude-18-actions-personal-ai-workbench.md)]

## 深度分析
### 框架定位：Personal Harness 的最小化实现
这篇文章本质上是 Harness 工程化思想在个人使用场景的降级适配。团队级 Harness（SOUL.md、AGENTS.md、Skills）强调的是**多人协作的知识固化与流程标准化**，而 Personal Harness 的核心张力在于：**个人用户既需要 Harness 的结构化约束，又受限于没有团队反馈回路来纠正偏差**。   ^[原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/ruofei-claude-18-actions-personal-ai-workbench.md)]
作者提出的六层结构实际上是在用有限的操作动作弥补机制上的先天缺陷——没有同行 Code Review，就用"反方评审"；没有团队知识库，就用 Project 边界；没有标准化 Skills 库，就用流程卡片。   ^[原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/ruofei-claude-18-actions-personal-ai-workbench.md)]

### 18 个动作的设计逻辑
这 18 个动作并非随意排列，而是遵循一个**需求澄清 → 上下文构建 → 执行约束 → 反馈验证**的隐式流程：   ^[原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/ruofei-claude-18-actions-personal-ai-workbench.md)]

- **入口动作**（1-6）：解决"Claude 不知道我是谁、要什么"的问题
- **执行动作**（7-11）：解决"输出跑偏、无法验收"的问题  
- **治理动作**（12-13）：解决"上下文污染"的问题
- **反馈动作**（14-18）：解决"生成回路过强、批评回路过弱"的问题
值得注意的是，动作 14-18 本质上是在用**认知策略**替代**机制保障**——这恰好说明 Personal Harness 的核心局限：它依赖用户的自我约束而非系统强制。   ^[原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/ruofei-claude-18-actions-personal-ai-workbench.md)]

### 与官方框架的缺口
文章没有触及几个关键问题：   ^[原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/ruofei-claude-18-actions-personal-ai-workbench.md)]
1. **版本漂移**：当 Custom Instructions 多次修改后，如何追踪哪些规则是"经验证的"、哪些是"临时补丁"   ^[原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/ruofei-claude-18-actions-personal-ai-workbench.md)]
2. **上下文上限**：当单个 Project 积累过多 Knowledge 文件后，检索效率下降如何处理   ^[原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/ruofei-claude-18-actions-personal-ai-workbench.md)]
3. **跨 Project 知识迁移**：一个 Project 里验证过的判断标准，能否复用到另一个   ^[原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/ruofei-claude-18-actions-personal-ai-workbench.md)]
这些问题在团队 Harness 里有明确的解决方案（Skills 版本化、Knowledge 分层），但在 Personal Harness 场景下仍需用户自行设计机制。   ^[原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/ruofei-claude-18-actions-personal-ai-workbench.md)]

### 核心洞察评估
> "Claude 用得好不好，越来越像一个环境工程问题，而非提示词技巧问题"
这个论断在 2026 年的上下文下是**方向正确但表述不完整**的。环境工程确实越来越重要，但它解决的是**下限问题**——确保 Claude 不会因为上下文混乱而给出低质量回答。**上限问题**（如何让 Claude 真正参与复杂推理、如何设计有效的思维链）仍然取决于提示词设计的深度。   ^[原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/ruofei-claude-18-actions-personal-ai-workbench.md)]
两者不是非此即彼的关系，而是**正交维度**：好的环境工程 × 好的提示词设计 = 协同效应。   ^[原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/ruofei-claude-18-actions-personal-ai-workbench.md)]

## 实践启示
### 立即可执行的动作（优先级排序）
**高价值、低门槛（建议本周完成）：**   ^[原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/ruofei-claude-18-actions-personal-ai-workbench.md)]
1. **动作 13：新话题开新 chat** — 零成本，立即生效，唯一阻力是习惯   ^[原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/ruofei-claude-18-actions-personal-ai-workbench.md)]
2. **动作 3：把个人说明转成 Custom Instructions** — 一次性投入，长期复利   ^[原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/ruofei-claude-18-actions-personal-ai-workbench.md)]
3. **动作 10：指定输出长度** — 在要求前加一句"控制在 200 字以内"，效果立竿见影   ^[原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/ruofei-claude-18-actions-personal-ai-workbench.md)]
**中等价值、需要习惯养成：**   ^[原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/ruofei-claude-18-actions-personal-ai-workbench.md)]
4. **动作 4：给出真实任务场景而非定义** — 改变提问方式，从"什么是 X"到"我需要做 Y，背景是 Z"   ^[原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/ruofei-claude-18-actions-personal-ai-workbench.md)]
5. **动作 7：让 Claude 先做反方评审** — 在收到方案后加一句"先不急着夸，指出最可能的 3 个问题"   ^[原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/ruofei-claude-18-actions-personal-ai-workbench.md)]
**高价值但需要流程支撑：**   ^[原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/ruofei-claude-18-actions-personal-ai-workbench.md)]
6. **动作 6：积累风格样本** — 建立一个 `style-samples.md` 文件，每次遇到好的输出就存进去   ^[原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/ruofei-claude-18-actions-personal-ai-workbench.md)]
7. **动作 15-16：用真实约束做计划、用真实数据分析** — 这两个动作的价值取决于你能否提供真实数据   ^[原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/ruofei-claude-18-actions-personal-ai-workbench.md)]

### 流程卡片的设计模板
参考文章中的"方案评审流程卡"，可以快速设计自己的第一张卡片：   ^[原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/ruofei-claude-18-actions-personal-ai-workbench.md)]
```markdown  

# [任务类型] 流程卡
适用场景：当你需要 [具体场景描述] 时使用。  
前置确认：  

- [ ] 关键约束已明确（截止日期、受众、格式）
- [ ] 背景信息已提供（而非让 Claude 猜测）
默认步骤：  
1. [ ] 第一步  
2. [ ] 第二步  
3. [ ] 第三步  
完成标准：  

- [ ] 输出包含 [具体要求]
- [ ] 避免了 [常见错误]
验收信号：  

- 你能向一个不了解背景的人复述核心结论
```  

### 常见陷阱预警
| 陷阱 | 表现 | 后果 | 应对 |  
|-----|-----|-----|-----|  
| 身份模糊 | 不同 Project 用同一套 Custom Instructions | 角色预期混乱 | 按 Project 差异化配置 |  
| 流程卡片囤积 | 卡片越来越多，但从不使用 | 维护负担 > 实际收益 | 最多保留 5-8 张高频卡片 |  
| 风格样本污染 | 把"喜欢的"风格样本混进专业场景 | 输出风格错位 | 按 Project 分离风格样本 |  
| 反馈回路失效 | 只用 Claude 生成，从不让它评审 | 陷入生成回路 | 强制在每个任务后加一次反方视角 |  

### 与团队 Harness 的衔接路径
如果你在团队环境中使用 Claude，Personal Harness 可以作为**个人入口层**，与团队 Harness 形成互补：   ^[原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/ruofei-claude-18-actions-personal-ai-workbench.md)]
```  
团队 Harness（SOUL.md / AGENTS.md / Skills）  
        ↓  
   个人工作台（Project 配置 + Custom Instructions）  
        ↓  
   当前任务（Chat + 流程卡片 + 风格样本）  

## ## 相关实体

## ## 相关实体
```  
关键原则：**团队 Harness 定义"做什么"，Personal Harness 定义"怎么做"**。不要在 Personal Harness 里重复团队 Harness 的规则，而是让 Personal Harness 处理团队规范没有覆盖的个人偏好和习惯。   ^[原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/ruofei-claude-18-actions-personal-ai-workbench.md)]

## 关联阅读
- 原文：https://mp.weixin.qq.com/s/pAVt6MeapUIDyVu256FI4w（若飞/架构师，2026-05-18）
- 属于 JiaGouX 公众号 Harness 系列文章之一（Agent Harness、Memory、Goal、Skills、Personal Harness）
- [Agent Memory 架构本质](https://github.com/QianJinGuo/wiki/blob/main/entities/agent-memory-architecture.md)

→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/2026.md) ^[原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/ruofei-claude-18-actions-personal-ai-workbench.md)]

- [gsd-get-shit-done-context-management-tool](https://github.com/QianJinGuo/wiki/blob/main/entities/gsd-get-shit-done-context-management-tool.md)

---

