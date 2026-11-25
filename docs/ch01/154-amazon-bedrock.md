# 滴滴国际化客服质检智能化之路：基于 Amazon Bedrock 的多语种多业务线质检实践

> 📊 Level ⭐⭐⭐ | 11.2KB

## 摘要

滴滴国际化事业部客户体验部门与 AWS 合作，基于 Amazon Bedrock 构建了一套覆盖西班牙语、葡萄牙语，横跨出行、外卖、金融三大业务线的智能客服质检系统，将依赖第三方的"黑盒"质检迁移为透明可控的自研 AI 架构。系统由意图验证、合规评估、VOC 聚合分析三条并行管线组成：进线原因验证准确率从 38% 提升至 86%，合规评分平均准确率超过 90%，批量工单的趋势分析从数小时压缩至数分钟。项目最核心的经验结论是：构建可靠的 LLM 应用，关键不在模型与工具本身，而在团队对调用架构和数据定义的深度掌握——这是靠外包无法获得的能力。

## 核心要点

- 质检判定从黑盒转为完全透明：每项输出附带完整推理过程，质检由单向的合规考核转变为双向的服务改进机制，客服可基于具体判定依据改进服务。
- 意图管线采用"验证与分类分离 + 任务隔离"的双层架构，规避 LLM 面对完整选项列表时的"过度纠错"倾向，进线原因验证准确率从 38% 提升到 86%。
- "其他"标签走专门的三级分析（同层替代 → 全树搜索 → 建议新增），反向审计分类体系（CR Tree）的覆盖缺口，形成从质检到体系优化的闭环。
- 评估管线用统一 Prompt 模板 + 动态变量注入应对语种×业务线的组合爆炸：语种、业务线、评估标准全部为外部配置，新增组合只改配置不改代码。
- 输出经 Amazon Bedrock 的 Tool Use 能力约束为结构化 JSON；规则性强的指标在 LLM 返回后做程序化校验，用确定性逻辑校准语义判断。
- VOC 管线采用并行提取 → embedding 语义聚类 → 报告生成的三阶段流水线，每个阶段精确控制 LLM 可见的信息范围，避免一次性投喂导致关键细节被淹没。
- 多语种多业务线质检是典型的规模化难题：原有第三方方案既不可追溯，也难以跟随质检标准的频繁迭代，过渡期新旧标准并行还会造成结果波动。

## 深度分析

### 调用架构比 Prompt 措辞更根本：意图管线的教训

最直接的方案是把完整的 CR Tree 和对话内容一次性交给 LLM，同时完成标注验证与"其他"标签审计，但实测准确率远低于预期。根因在于 LLM 看到完整选项列表后会自动逐一比较——即使原始标注完全合理，只要找到一个"看起来更精确"的替代选项，就判定当前标注错误。多轮 Prompt 调整均无法改变这一行为，说明问题出在调用架构而非措辞。修复手段是信息隔离与任务隔离：常规进线原因拆为两个阶段，验证阶段只给 LLM 当前标注的标签，判断其是否合理；仅当验证不通过时才进入分类阶段，把完整 CR Tree 连同验证阶段的推理过程一起交给模型，推荐替代分类并输出置信度和理由。"其他"标签则走独立的三级路径：先查同层有无更合适标签，再搜索整棵树，仍无匹配则判定为体系覆盖缺口并建议新增标签。这套设计背后是一个清晰的归因过程：团队没有停留在"准确率低"的现象层面，而是定位到"模型面对完整选项集时的系统性偏差"这一机制性根因，再通过改变模型在每一步能看到什么来消除偏差。这与 [Prompt Engineering Fundamentals](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/prompt-engineering-fundamentals.md) 中的一类判断一致：当 Prompt 工程反复失效时，应优先怀疑任务边界与信息可见性的划分，而不是继续打磨措辞。值得注意的还有闭环价值——"其他"标签的三级审计让质检系统反过来监督分类体系自身的健康度，识别出的覆盖缺口沉淀为新增标签，质检能力与业务知识库同步演进。

### 配置驱动的 Prompt 组装化解组合爆炸

语种×业务线×评估项的组合随业务扩张迅速膨胀，逐一维护独立 Prompt 的方式难以为继。评估管线把语种、业务线、每项评估标准的定义和判定规则全部外置为配置，在每次调用时按当前工单动态组装为完整 Prompt：新增评估项只需更新配置文件，新增语种或业务线只需添加对应上下文块，一套模板覆盖所有组合，并在一次 LLM 调用中完成全部评估项。这本质上是把软件工程"数据与逻辑分离"的原则移植到 Prompt 层——模板是稳定的代码，质检标准是可热更的数据，思路与 [Context Engineering](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/context-engineering.md) 强调的"按调用现场组装上下文"同构。质检标准频繁变更的痛点因此被消解：切换标准等于切换配置版本，过渡期内新旧标准可以按工单分别套用，结果天然可比、波动可控。这套机制对国际化团队的隐性收益在于组织层面：语种与业务线的扩张不再需要同步扩充 Prompt 维护人力，"上线一个新的语种-业务线组合"从工程任务降级为配置任务，质检能力的扩展速度第一次跟上了业务扩张的速度。此外，由于评估标准以配置形式集中存放，合规审计可以基于配置文件本身核对标准的完备性与一致性，而不必逐条反推 Prompt 的实际行为。

### 确定性逻辑与语义判断的分层校准

LLM 的输出通过 Bedrock Tool Use 约束为结构化 JSON，每项评分同时携带判定结果与推理过程，这是 [Tool Use Patterns Ai Agents](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/tool-use-patterns-ai-agents.md) 中"以结构化接口锁定模型行为"的典型落地。对规则性强的指标，系统在 LLM 返回后再叠加程序化校验——确定性逻辑兜底语义判断的边界情况，准确率因此稳定在 90% 以上。这种"LLM 判语义、代码判规则"的分层让每次质检判定都能还原为一段完整证据链：输入对话、组装后的 Prompt、模型推理、后置校验，人工复核可以直接定位争议环节，而不是重新跑一遍黑盒。质检因此具备了 [Llm Observability 4 Layer Model](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/llm-observability-4-layer-model.md) 意义上的可观测性，从单向考核变成客服与管理层共同信任的改进依据。推理透明化还改变了质检的政治属性：客服从"被判分"的一方变成了能看见判分依据的一方，争议可以通过复核推理链解决而不是靠申诉博弈，这对一线团队的接受度至关重要——再高的准确率，若判定过程不可解释，也难以支撑服务改进的组织共识。

### VOC 聚合：把趋势发现从数小时压到数分钟

单条工单的质检回答"这条对话做得好不好"，VOC 管线回答"这个阶段什么问题最多"。三阶段设计各有分工：并行提取阶段对每条对话独立调用 LLM，抽取问题类型、用户情绪、解决结果、根因等结构化字段，工单之间天然可并行；聚类阶段用 embedding 模型对问题类型标签做语义聚类，合并同义表述（如 "unpaid cancellation fee" 与 "cancellation fee not paid"），再按工单频次排序定位影响面最大的问题，这一阶段刻意不依赖 LLM，靠 embedding 相似度加统计排序保证同输入同输出的一致性；报告生成阶段才让 LLM 基于高频聚类的结构化信息产出执行摘要、痛点分析和可执行的改进建议。关键原则是每个阶段只让模型看到该阶段该看的信息——把"生成报告"这个巨任务拆成职责单一的三段，可靠性远高于把全部原文一次性塞给模型端到端生成。以拉美市场短时间集中涌入的取消费投诉为例：运营团队触发 VOC 分析后，无需逐条阅读多语种对话，几分钟内即获得根因分析、高频触发场景和行动建议的结构化报告。更深层看，VOC 管线补上了质检体系里最容易缺位的一环：单条质检是抽样视角，趋势发现是全量视角，运营团队从"事后逐条排查"转为"事前识别系统性风险"，这在投诉集中爆发等时效敏感场景下尤为关键——早几个小时看到趋势，干预成本可能差一个量级。

## 实践启示

1. 遇到 LLM 行为不符合预期时，先审查调用架构（信息可见性、任务边界），再调 Prompt——把完整选项列表和现有答案一起交给模型评判，几乎必然诱发过度纠错。
2. 验证与分类分离是多分类验证类任务的可复用模式：先让模型独立判断"现状是否正确"，仅在不通过时才给完整选项列表做推荐，并要求输出置信度和理由。
3. 把语种、业务线、评估标准等易变维度全部外置为配置，用统一 Prompt 模板 + 动态组装覆盖组合爆炸，新增场景实现零代码变更、标准切换即配置切换。
4. LLM 输出必须用结构化约束（Tool Use / JSON Schema）锁定格式，并对规则性强的指标叠加程序化校验；推理过程要随判定一起输出，否则质检结论无法复核与审计。
5. 批量文本聚合分析采用"并行提取 → embedding 聚类 → 报告生成"三阶段流水线，聚类排序交给 embedding 与统计以保证一致性，不要把全部原文一次性交给 LLM 生成报告。
6. 从黑盒第三方质检迁移到自研 LLM 方案的价值不止准确率：判定可追溯、标准可快速迭代，以及团队对调用架构与数据定义的自主掌握，都是外包买不到的长期能力。

## 相关实体

- [How Aws Smgs Uses An Ai Powered Conversational Assistant To ](https://github.com/QianJinGuo/wiki-public/blob/main/entities/how-aws-smgs-uses-an-ai-powered-conversational-assistant-to-.md)
- [Automate Aml Alert Triage With Amazon Quick And Snowflake Co](https://github.com/QianJinGuo/wiki-public/blob/main/entities/automate-aml-alert-triage-with-amazon-quick-and-snowflake-co.md)
- [对抗 Agent 遗忘Kollab 基于Amazon Bedrock Agentcore 的团队Ai工作空间实践](https://github.com/QianJinGuo/wiki-public/blob/main/entities/对抗-agent-遗忘kollab-基于amazon-bedrock-agentcore-的团队ai工作空间实践.md)
- [Comprehensive Observability For Amazon Sagemaker Ai Llm Infe](https://github.com/QianJinGuo/wiki-public/blob/main/entities/comprehensive-observability-for-amazon-sagemaker-ai-llm-infe.md)
- [Process Financial Documents Using Amazon Bedrock Data Automa](https://github.com/QianJinGuo/wiki-public/blob/main/entities/process-financial-documents-using-amazon-bedrock-data-automa.md)

相关概念：[Prompt Engineering Fundamentals](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/prompt-engineering-fundamentals.md) · [Context Engineering](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/context-engineering.md) · [Tool Use Patterns Ai Agents](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/tool-use-patterns-ai-agents.md) · [Llm Observability 4 Layer Model](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/llm-observability-4-layer-model.md)

---

