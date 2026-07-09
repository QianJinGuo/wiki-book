# Building AI Agents in Accounting

## Ch04.005 Building AI Agents in Accounting

> 📊 Level ⭐ | 9.2KB | `entities/building-ai-agents-in-accounting.md`

## 核心要点
- Skill 与 Config 分离：Skill 是可复用的工作流定义，Config 是业务参数配置，两者分离使系统易于维护和跨场景复用 
- MCP（Model Context Protocol）是 AI Agent 连接 ERP、云盘、Slack 等系统的标准协议，是实现端到端自动化的关键基础设施 
- 人机协同模式：AI Agent 承担重复性操作，人工保留 Preparer 和 Reviewer 控制节点，符合会计内控要求 
- 实践效果：预付账款对账从约 2 小时压缩至约 5 分钟，跨多个对账项目可节省整天的月末结账时间 

## 深度分析
### 1. Skill-Config 分离架构的设计思想
文章中最核心的工程洞察是 Skill 与 Config 的严格分离。Skill（技能）是一个自包含的工作流，包含系统提示词（System Prompt）定义"做什么"、MCP 连接器定义"能操作哪些系统"、触发机制和驱动行为的配置。一个 Skill 一旦编写完成，就可以永久运行，无需每次手动调用。
而 Config（配置）则是 YAML 文件，其中存放的是具体业务参数：预付账款 GL 账户代码、供应商编码映射表、重要性水平阈值、期末部分月 convention、以及路由规则（谁在哪个频道被呼叫）。当业务规则变化时，只需编辑 Config 文件，而不需要触碰 Skill 本体。
作者指出这是他之前犯过的错误——把所有东西都塞进一个 Prompt 或一个 Skill 文件里，每当业务变化就必须更新整个 Skill，导致维护成本高且无法跨场景复用。分离之后，Skill 可以在多个对账(Entity/Entity 组)之间共享，只需替换 Config 文件。这与软件工程中配置与逻辑分离的原则一脉相承，与传统财务信息化中"科目表与核算逻辑分离"的思路也高度相似。
从架构角度看，这种设计将 AI Agent 的能力边界（Skill）与业务上下文（Config）解耦，使得同一套 Skill 可以部署在不同的会计实体、不同的会计准则或不同的组织单元中——只要提供相应的 Config 文件即可。这大大提升了系统的可扩展性。

### 2. MCP 作为 AI Agent 操作系统级的连接协议
文章反复强调"MCP 是最大的解锁点"。MCP（Model Context Protocol）是一个标准协议，允许 AI Agent 插入到各种软件系统（Deel、NetSuite、Google Drive 等），读取数据、执行操作并在这些系统中代表用户采取行动。
作者的核心洞察是：大量公司仍然把 AI 当作简单的聊天机器人使用。但如果不给 AI 系统级的可见性（visibility），它就无法完成真正端到端的工作。AI 需要"看到"完整的上下文，并有能力采取行动（哪怕是只读行动），才能真正有用。
在具体实现中，作者的预付账款 Agent 通过 MCP 直连 ERP GL 模块，无需手动 CSV 导出/导入。工作底稿则通过 MCP 连接 Google Drive——Agent 读取上月工作底稿、创建新文件、写入当月新增预付及摊销数据，均由 Agent 自动完成。
Slack 是整个 Agent 的交互界面。用户通过slash command（`/prepaid April`）或自然语言聊天（"I want to kick off the prepaid recon for April"）触发 Agent。这意味着用户无需改变工作习惯，AI Agent 自然融入了现有的协作工作流。

### 3. 会计内控框架下的人机协同模式
文章的人机协同设计值得特别关注。AI Agent 完成工作后，并不自动过账（post JE），而是仍然保留人工 Preparer 和人工 Reviewer 两个控制节点。
具体流程是：Agent 完成后生成摘要（含工作底稿、JE CSV 和 Preparer 标记），Post 到 Slack。Prepaider 负责管理 Agent、修复 Agent 标记的错误/Flag，并做一轮检查。Reviewer 则执行原有的复核程序，是最终的控制节点和签字确认人。
当 Agent 标记出需要人工处理的问题时，Preparer 有两种应对方式：（1）打开工作底稿手动修复问题，然后 Slack 回复 ✅ 信号通知 Agent 重新读取文件并更新；（2）如果该问题会重复出现，则直接更新 Skill 或 Config 文件，使其在下个周期自动处理。这种设计形成了一个持续改进的正反馈循环——人工修复转化为自动化规则。
这一设计体现了对会计职业本质的深刻理解：结账流程中的多层复核不是负担，而是防止错误传导的内在机制。AI Agent 的定位是"超级助手"而非"替代者"，它将人工从重复性操作中解放出来，让人聚焦于判断和复核。

### 4. 实施路径与演进规律
文章描述的演进路径并非一步到位。首次运行预付账款对账花费的时间更长，团队在此基础上持续迭代，不断改进 Skill 和 Config，最终实现 90%+ 的自动化率。这个"先让它跑起来，再持续优化" 的路径，与精益创业的 MVP（最小可行产品）思路高度一致。
扩展路径也比较清晰：在预付账款对账验证可行性后，将同一套 Skill 复用到其他对账项目，最终实现整月月末结账的时间压缩。可以预见，当多个高频对账流程实现 Agent 化后，会计团队每月可节省的时间将非常可观。

## 实践启示
### 给财务领导者的建议
**第一步：确认 ERP 是否有 MCP 连接器**。作者明确指出，"如果你的 ERP 没有 MCP 连接器，那是第一个要解决的问题"。没有系统连接，AI 就是"盲人"，无法获取实时数据，也就无法实现端到端的自动化。在评估 AI Agent 路线图时，应优先评估现有 ERP/财务系统的 MCP 兼容性。
**从小处着手，选择高频重复任务作为切入点**。文章选择预付账款对账作为首个 Agent 场景并非偶然——它是月末结账中的高频重复任务，规则相对明确，且有清晰的可量化收益（2小时→5分钟）。财务团队在选择首个 Agent 场景时，应优先考虑：频率高、规则相对稳定、输出标准化的场景。
**建立 Skill 资产库思维**。当一个 Skill 在某个对账场景验证成功后，它可以复用到其他类似场景。财务团队应系统性地梳理月末结账流程中的各类任务，识别可复用同一 Skill 模板的场景，逐步建立内部 Skill 资产库。
**不要把 AI 当聊天机器人用**。真正的价值在于让 AI 连接到所有相关系统，拥有完整的上下文可见性，并能够代表用户执行操作。只有这样才能实现从"AI 辅助查询"到"AI 驱动的自动化流程"的跨越。

### 技术层面的关键原则
**业务参数必须从 Skill 中剥离**。GL 账户代码、供应商映射、重要性水平等业务参数应统一管理在 Config 文件中，而非硬编码在 Skill Prompt 里。这是实现 Skill 复用和降低维护成本的关键。
**设计清晰的人机交互协议**。当 Agent 发现无法自动处理的问题时，需要人工介入。应在设计阶段就明确：什么情况下 Agent 应主动标记问题、人工如何通知 Agent 已完成修复、Agent 在修复后如何确认并继续执行。Slack 的 ✅ 反应机制是一个简洁有效的参考。
**会计 Agent 应保留完整的人工复核节点**。即便 Agent 能完成 90% 的工作，Preparer 和 Reviewer 的复核角色仍应保留。这不仅是合规要求，也是持续改进的触发机制——人工修复的 Flag 应反向推动 Skill/Config 的优化。

## 关联阅读
## 相关实体
- [Www Networkworld Com Versa Takes Aim At Fragmented Enterprise Security](../ch01/295-rag.html)
- [Create Custom Mcp Catalogs And Profiles](../ch07/071-create-custom-mcp-catalogs-and-profiles.html)
- [Turn Repeated Instructions Into Reusable Skills In Lovable L](../ch03/019-turn-repeated-instructions-into-reusable-skills-in-lovable.html)
- [Skillos Learning Skill Curation For Self Evolving Agents](ch04/143-skillos-learning-skill-curation-for-self-evolving-agents.html)
- [Automation Anywhere Collaborates With Cisco Nvidia Okta And Openai Launching Ent](ch04/016-automation-anywhere-collaborates-with-cisco-nvidia-okta-a.html)
- [MOC](https://github.com/QianJinGuo/wiki/blob/main/moc/workflow-orchestration.md)

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/building-ai-agents-in-accounting.md)

---

