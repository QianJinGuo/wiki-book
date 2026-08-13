# The best argument I’ve heard for why AI won't take your job

## Ch01.795 The best argument I’ve heard for why AI won't take your job

> 📊 Level ⭐⭐ | 8.0KB | `entities/platformer-ai-job-loss-levie.md`

# The best argument I’ve heard for why AI won't take your job

## 摘要

Platformer 与 Box CEO Aaron Levie 的对谈系统反驳了「SaaSpocalypse」与大规模 AI 失业叙事：AI Agent 将「乘以」而非取代企业软件的使用者，专业工作真正创造价值的「最后 20%」远比舆论想象的耐用，seat 制 SaaS 之上将叠加 agent 消费层。Levie 由此预测软件工程师不会减少，但工程师会从「写应用」转向在制药、银行、制造等各行各业部署 AI。

## 核心要点

- **90/10 反转之争**：当前约 90% 的软件交互来自人类，三年后可能倒转为 90% 由 agent 发起；Levie 的判断是「10x 倍增」而非「人类减少 90%」——agent 是并行运行的新工作者，使数据与平台更有价值。
- **「前 80%」陷阱**：vibe-code 生成的内容只是职业的前 80%，最后 20%——领域知识、判断、上下文、关系——才是全部价值创造所在；外行看到 AI 产出的文本就误以为整份工作被取代。
- **工作是动态方程**：静态看可逐层自动化（90% → 9% → 0.9%），但能力每抬升一档，市场对交付的期望也同步抬高，自动化掉的 90% 会变成新基准的 50%——需求增长抵消替代。
- **seat 不死，叠加 consumption**：seat 承载身份、权限与状态化表征，agent 在其上做百倍于人的「无界消费」；超出阈值后按用量计费，形成「人类 seat + agent 消费」的 stacking 双层模式。
- **vibe-code 重写 SaaS 不划算**：Box 内部没有任何获批项目去重写 ERP/HR/CRM——现有系统即将因 agent 调用其数据而增值 10 倍；全民自建企业软件的安全与维护负担（凭据泄露、漏洞升级）在经济上不成立。
- **企业数据与治理在 agent 世界更值钱**：agent 要读、写、理解企业内容，非结构化文档仍需存储、治理、安全与保留策略；数据层成为所有 agent 的公共底座。
- **工程师焦虑不具代表性**：工程是「产出即文本」的特例；律师、医生、药剂研究员渴望自动化的是苦役（病历、pitch deck），而非被取代。
- **未来工程师 = 组织内 FDE**：Eli Lilly 的「lab automation software adviser」是原型——把 AI 创新部署进具体业务流程；原本流向硅谷大厂的人才将转向制药、银行与制造。

## 深度分析

### Agent 是乘数而非减法：90/10 之争的产业含义

Levie 把「人类交互从 90% 降到 10%」定义为本行业最开放的辩论：这到底意味着人类岗位缩水 90%，还是 agent 数量增长 10 倍？他押注后者，证据来自企业内部软件消费——几乎找不到「削减 seat」的实例，反而到处是新的 agentic 用例：Salesforce 的销售代表今年不减反增，而可想象的 agent 用例从两年前的个位数变成 10–100 个。agent 未必直接操作 Salesforce 界面——它们出现在 Claude Cowork、Codex 或 ChatGPT 里——但底层「某人以某级权限访问某类数据」的 seat 表征不会消失，这与 [The UI is dead, long live the agent](../ch04/455-the-ui-is-dead-long-live-the-agent-servicenow-goes-headles.html) 的判断一致：交互入口迁移到 agent，系统与数据层仍是承载者。

### 「最后 20%」：价值藏在生成文本之外

Levie 用 Gell-Mann 失忆症解释外行的高估：人用自己的 AI 做事时看得见收尾的琐碎与上下文，看别人的工作时却只看到「前 80%」的文本产物。真正难自动化的恰是最后 20%——问对问题、补齐缺失信息、审校输出、响应安全事件、保证系统上线与质量。更关键的是动态方程：自动化前 90% 后市场会立刻抬高期望，把 90% 变成新的 50%，于是需求增长持续抵消能力替代。这解释了「If You Give a Mouse a Cookie」效应——AI 降低了启动任务的固定成本，让原本不值得做的事变得可行，反而制造出更多下游工作，甚至催生新岗位（Levie 自嘲考虑雇一个专职的人陪他做 agent 客户调研）。

### 从 seat 到 stacking：SaaS 商业模式的适应性重构

「SaaSpocalypse」是「软件已死」故事的最新版本，Levie 认为市场其实在分化定价：Box 股价跑赢多数 SaaS 同行，因为「最 agentic、最 vibe-code 的未来也得把数据存到某个地方、治理并保护它」。seat 模式不会消失，但 agent 的消费规模是人的百倍，超出阈值必然出现 consumption 计费层，形成「seat + 消费」的 stacking 结构。至于「vibe-code 重写 Salesforce/Workday」的加速主义论，Levie 明确否决：现有系统即将因 agent 使用其数据而增值十倍，此时迁移自建会同时输掉旧投资与新机遇。

### 企业数据成为 agent 时代的「新护城河」

Levie 给出判断平台存亡的框架：是否承载业务逻辑与工作流、是否存储数据、是否拥有 agent 训练无法替代的领域上下文、是否涉及安全治理信任、是否有网络效应、是否受益于「多 agent 共享数据」而非「单 agent 独占」。保险理赔自动化案例说明：agent 无论建在 Anthropic 还是 OpenAI 上，都必须连接企业内全部内容与数据，企业要做的是升级基础设施而非砍掉它。数据应抽象在 agent 之外、结构化治理后再供所有 agent 对话——这正是 Databricks、Snowflake 持续增长的原因，也呼应了 [谁在赢得企业 AI](../ch05/105-ai.html) 的竞争议题。未来十年的管理问题随之变成：智能充裕但不免费时，如何像管理 headcount 一样分配 token——参见 [Token 经济学](ch01/760-the-token-economy.html)。

## 实践启示

1. **SaaS 从业者**：用「Levie 公式」自检产品——有工作流逻辑、是数据的自然存放处、受益于多 agent 共享者最安全；纯任务型 to-do 类工具风险最高（Levie 直言「那个行业正在 pivot」）。
2. **企业决策者**：不要用 vibe-code 重写成熟的 ERP/HR/CRM；正确路径是在现有系统之上叠加 agent 层，把 IT 资源投向「用 agent 挖掘存量数据价值」的新用例。
3. **知识工作者**：把「执行生成」升级为「定义问题 + 校验输出」——最后 20% 的判断、上下文与关系能力比生成文本的技能更抗替代；同时警惕只做「review AI 输出」的枯燥岗位。
4. **工程师与求职者**：不必挤硅谷大厂——关注制药、银行、制造等行业的 FDE 型岗位（如 Eli Lilly 的 lab automation software adviser），未来工程师的价值在于把 AI 部署进具体业务。
5. **管理层**：开始像管理 headcount 一样管理 token——建立消耗热力图与价值分配机制；「70% 的 agent 工作可能无价值，但没人知道是哪 70%」，需要可观测性而非一刀切禁止。
6. **投资者与分析师**：区分市场对 SaaSpocalypse 的分化定价——押注拥有专有数据、治理与工作流深度、受益于 agent 倍增的平台，而非被「软件已死」叙事一锅端。

## 相关实体

- [AI 驱动的裁员没有商业意义](../ch03/011-cio.html)
- [Kimi Work：通用 Agent 工作范式迁移](ch01/735-codex.html)
- [The UI is dead, long live the agent](../ch04/455-the-ui-is-dead-long-live-the-agent-servicenow-goes-headles.html)
- [谁在赢得企业 AI](../ch05/105-ai.html)
- [Token 经济学](ch01/760-the-token-economy.html)
- [校长与 AI 时代](../ch05/105-ai.html)

→ [原文存档](https://github.com/QianJinGuo/wiki-book/tree/main/docs/raw/articles/platformer-ai-job-loss-levie.md)

---

