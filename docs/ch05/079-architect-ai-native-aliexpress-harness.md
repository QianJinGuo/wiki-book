# 从 Architect 视角看 AI-Native 落地：AliExpress Harness 生成能力建设

## Ch05.079 从 Architect 视角看 AI-Native 落地：AliExpress Harness 生成能力建设

> 📊 Level ⭐⭐ | 7.5KB | `entities/aliexpress-harness-ai-native-architect-2026.md`

# 从 Architect 视角看 AI-Native 落地：AliExpress Harness 生成能力建设

**来源**: AliExpress技术（喜橙）

**发布日期**: 2026-08-03

**原文链接**: https://mp.weixin.qq.com/s/UbF04NBK6jccBpAeLr5InQ

## 摘要

AliExpress 团队在 Harness Engineering / Context Engineering / Loop Engineering 范式升级背景下，将 H5 B/C 端 Harness 生成能力从 Spec Coding + LangGraph 升级为「七层工程基础设施 + 四层确定性模型」双层架构，并在 Harness 之上重点建设**标准化、评测、自进化**三个能力。核心洞见：评测的断言依据、最优路径判定、标准的延续性与可解释性，是 Harness 落地绕不开的问题。

## Harness 架构

**/ait 生码 command 管线**：init（扫描工作区/docs/环境校验）→ clarify（PRD 结构化 + 页面 spec + 组件 spec 并行 + 执行计划）→ generate（plan.yaml 驱动脚手架+模块+页面代码）→ docs（知识库同步）→ evaluation → verify（发布卡口）→ publish → evolve（session 归因 + harness 工程优化 PR）。

**双层能力**：

- **七层工程基础设施**（Agent "能跑起来"的基座）：规则、记忆、上下文、执行、循环、反馈、恢复
- **四层确定性模型**（Agent "做得对"的业务层）：针对生码场景编排的确定性约束

## 三大核心能力

### 1. 标准化（领域适配层决定产出是否"对"）

标准模块 = **UI 契约 × 数据契约 × 功能契约**三位一体的最小封装单元。

- **UI 标准化**：设计-代码协同组件契约体系。组件库两层（基础组件契约层进映射表 / 业务组装组件模板层不进映射表）；双轨制（存量直出 componentKey 硬绑定 / 自定义生成评估后沉淀回组件库）
- **数据标准化**：接口标准化（命名即架构归属）+ 场景数据协议（表格固定 list/total/pageSize/current 等预设字段）+ 字段标准化（三类独立注册/推导规则）+ **13 个一级领域治理体系**（Owner 负责注册审批、业务能力聚合原则、领域确定后归属自动推导）
- **功能标准化**：原子级功能组件（埋点/国际化/加购/收藏封装 SDK）+ 复合功能三层 Spec 结构化澄清（PRD Spec"要做什么"/Tech Spec"怎么做"/Data Spec"数据怎么流"，内置填空结构防自由发挥）

### 2. 评测（生成的代码怎么保证是对的）

**5 个评测维度**：结构正确性（tsc --noEmit + DevServer + 无 console.error）、数据完整性（AST 扫描字段引用 vs Data Spec diff）、逻辑正确性（逐条对照 PRD 功能点+条件分支覆盖）、UI 保真度（Chrome DevTools MCP 截图 vs Figma AI 视觉对比 + DOM 嵌套 + Figma JSON 间距校验）、E2E 功能（MCP 自然语言驱动测试 + Observation-First AI 视觉断言）。

**客观性保障机制**：

- 检测与修复分离（Phase 1 SubAgent 只报告不修复，报告写独立文件）
- 多 Agent 交叉验证（logic-checker 与 data-checker 问题交叉印证）
- 不可篡改检测结果（evaluation/{dimension}/report.json 写入后不可改）
- 人工兜底（verify 阶段系统给 verdict，人做最终决策）

**4-Gate 自修复流程**：Gate1 能跑（编译+启动+无 crash，≤3轮）→ Gate2 数据足（字段完整+接口对齐，≤2轮）→ Gate3 用法对（Props/Hooks 合规，≤2轮）→ Gate4 功能通（E2E 全过，≤2轮）。核心约束：**前置 Gate 未通过时后置 Gate 结果无效**——先解决结构性问题再处理语义性问题。

### 3. Evolve 自进化（修过的 bug 下次不再出现）

三阶段：发现问题（Python：修复记录→重复模式→跨生成聚合→噪声过滤）→ 定位根因并修复（LLM：分析根因→判断修哪里 Skill/Spec/Rules→生成补丁）→ 审查合入（Python+LLM+人：格式校验→LLM 评审 ≥85 分→MR 人工确认）。

关键设计决策：

- **修复方向优先级**：skill > spec > hooks > rules > knowledge（修 Skill 执行步骤比加 rule 更彻底）
- **永不降级**：证据不足时暂缓（deferred），不写没人用的 knowledge
- **消费保障**：每条新知识必须有明确消费者（某个 Skill 会读它），无消费者 = 拒绝合入

## 效果数据

- **C 端 D2C 导购**：商品类模块 97.2 总分（UI 97.0/功能 96.5/数据 98.4）、瀑布流 95.5、券类型 96.3、玩法类型 93.4。目标：简单模块一次准确率 98% 交付 2h，复杂模块 95% 交付 4h
- **B 端 AIT 中后台**：简单页面（≤1 万行）~90 分、复杂页面（>1.5 万行）~80 分。目标：95% 交付 4h / 90% 交付 8h

## 过程思考与判断（Architect 视角）

- **三角平衡**：生成准确度/效率/用户体验不可同时最大化——先保准确度（生成就能上线）再追效率，体验由标准化组件库兜底。"能生成"不是结束，"能上线"才是
- **资产 vs 补丁**：保留跨范式资产（标准化体系/领域知识库/Spec-Driven/端到端评测/上线卡口）；丢弃模型增强后消解的补丁（自建 RAG 检索链路/LangGraph 多轮决策树/过度设计智能路由矩阵）
- **可动/不可动边界**：影响生成质量的规则不可动，服务端实现可动——共识起点是让步边界清晰可见
- **真实 case**：早期 d2c Agent 简单模块跑 50 分钟，排查发现 1424 行 SKILL.md 无用加载，实际 LLM 生成仅 94 秒（90% 流程无用）——系统天花板不在模型能力而在架构设计
- **架构师定位**（阿伦特 Labor/Work/Action 三层）：AI 替代 Labor、参与 Work、无法触及 Action——架构师新定位是 Action 层"定义什么是对的 + 设计让对的事自动发生的机制"：判断/诚实/体感/发起/组织感知五种行为

## 相关链接

- → [原文存档](https://github.com/QianJinGuo/wiki-book/tree/main/docs/raw/articles/aliexpress-harness-ai-native-architect-2026-08-03.md)
- 同源姊妹篇：[AI Agent 应用精细化评测（AliExpress）](ch05/100-ai.html)、[全球化商品中心智能答疑 Agent（AliExpress）](ch03/035-agent.html)
- 相关主题：[端到端 CodingAgent 设计（大淘宝）](ch03/035-agent.html)、[高德 AutoSDK 全链路 AI Native（架构篇）](ch05/100-ai.html)、[AI Agent Skill 系统设计（淘宝技术）](ch04/341-skill.html)

---

