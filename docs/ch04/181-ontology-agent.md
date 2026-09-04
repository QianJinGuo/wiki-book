# 本体论（Ontology）：Agent 事实系统的语义控制面

> 📊 Level ⭐⭐⭐ | 9.2KB | `entities/ontology-semantic-control-plane-agent-facts-ruofei-2026-08-08.md`

# 本体论（Ontology）：Agent 事实系统的语义控制面

→ [原文存档](https://mp.weixin.qq.com/s/d9C-0aR1fCIkKkFVtz7_jg)

## 摘要

作者若飞以"付款 Agent 该付给谁"为切口，回答 Agent 事实系统最容易忽视的问题：多 Agent 共享同一批事实时，如何保证每条关系被一致解释。向量检索答不了，图数据库也不会替我们回答——问题不在抽取链路，而缺一个明确对象、关系、约束与可推导边界的"语义控制面"。本文的答案是本体论（Ontology），把它摆在事实层与动作层之间，约束不同 Agent 对同一条事实的解释。

核心是架构分工：大模型提出候选，事实层保存主张，本体约束含义，能否执行由权限与策略系统决定——本体要守住的是候选进入系统后的共同含义。

## 核心要点

- **语义控制面**：本体不是存储引擎，而是约束层；放在证据层、事实层、语义控制面、动作层四层架构中。
- **一条边不够**：RDF 三元组在真实业务里藏着五个问题——对象是否稳定、谓词语义、生效/失效时间、来源与复核、谁有权消费；W3C 在 RDF 1.2 候选推荐中提醒，RDF 模型本身无时间，时间/版本/来源必须显式建模。
- **主张账本**：生产事实带状态、有效期和来源存成 claim（含 claim_id, valid_from, valid_to, source_ref, status, schema_version），status 走 candidate → validated → published → retracted。
- **四层分工**：RAG 服务证据层；图谱/关系表服务事实层；本体在语义控制面；动作层独立存在——即使已有发布的收款关系，付款仍要查额度、账户状态、审批、幂等与权限。
- **推理 ≠ 校验**：OWL 2 用开放世界假设，缺失事实只说明"还不知道"，不推出是假的；OWL 做推理、SHACL 做校验、策略系统决定谁执行，三者不可替代。

## 深度分析

### 语义控制面：不是一层存储，而是一层约束

"知识库"太宽——文档、向量索引、关系表、图谱和本体常被塞进同一盒子。拆开评审应为四层：证据层存原文上下文；事实层存候选与已发布主张；语义控制面定义类型、关系、约束与推理边界；动作层处理权限、策略、审批与副作用。

这层分层的价值在于把"含义"从存储中抽出来单独管辖。RAG 够用时只服务证据层；一旦多 Agent 共同消费和更新同一批事实，语义控制面就成为保证所有消费者一致解释的唯一去处。作者说存储可替换，语义债务很难靠换库还清——稳定 ID、关系字典、事实生命周期与动作边界不随存储消失。它同样适用研发系统：Service A calls Service B、Team X owns Service A 都是关系，全压成 related_to 则图很热闹，故障路由与变更影响分析仍做不准，这与 [RAG](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/retrieval-augmented-generation-rag.md) 只能服务证据层相互印证。

### 从三元组到可追溯主张

供应商案例中，同批材料抽出品牌甲→收款主体→乙公司与上版合同签约主体→丙公司两条边，链路不留痕，付款 Agent 却须回答：是不是同一种关系？哪条有效？证据在哪？缺页时判"没有"还是"不知道"？

生产级做法是把每条边升格为带状态和来源的 claim。status 生命周期：candidate（可核对、不作付款依据）→ validated → published（经消歧、校验、人工复核）→ retracted（来源有误，不悄悄覆盖旧记录），即 [数据质量](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/data-quality-framework.md) 的"校验先于发布"。

### Agent 事实的边界：三种确定性来源与开放世界假设

本体管四件事：对象（稳定 ID 胜过名称，实体合并要保守，无法确认时保留两个待解析实体而非强行合并）、关系（关系字典写清两端类型、业务含义、时间/证据/多值规则，谓词越含糊越易越权）、约束（回答"能否进入已发布事实"）、推理（事实、规则、推论分开保存，继承/传递/反向要有规则和测试——图上路径易找，路径是否构成业务结论要慢一点）。

推理与校验最易混淆：OWL 回答"还能推出什么"，SHACL 回答"是否满足发布条件"，策略系统回答"谁能执行什么动作"。把推理器当校验器、或把校验当授权系统，都会在边界留洞。缺失事实先视为未知，流程再决定暂停、补证或拒绝——这是 [多 Agent](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/multi-agent-systems.md) 共享事实时获得确定性的关键：确定性不来自某系统一次判对，而来自候选、校验、发布、查询、撤回五环节的分权与留痕。

### 大模型在链路里的位置：提议而不裁断

大模型先提出实体、关系与主张的候选（GraphRAG 抽实体/关系/主张，OntoGPT 用 SPIRES 按 LinkML schema 抽取）。但符合 JSON 不代表主张真实。更可信的链路：原文 → 模型生成候选 → 消歧、类型检查、时间与来源校验 → 冲突检查与人工复核 → 发布事实 → 查询层组织回答 → 策略/权限/审批决定是否执行。跳过硬校验直接出结果，是许多事实系统虚假确定性的根源，也与 [Agent 记忆](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/agent-memory-architecture.md)"写入前校验、按版本读取"一致。

## 实践启示

1. **不做"企业级统一本体"起步**：先选一条输入、输出、责任人都明确的流程，只做四样——实体清单（首轮收敛 5-10 个核心类型，稳定 ID + 别名/来源/匹配方法/合并记录）、关系字典（10-30 个高频谓词，写清 domain/range/含义/反向/基数/时态/证据）、主张账本（候选/已发布/已撤回分开，查询支持 as_of）、发布测试（同名不误合并、端点错误拦截、按时间查新旧主体、来源撤回后旧事实不返回等样本）。
2. **五个动作拆成五个接口**：submit_claim / validate_claim / publish_fact / query_facts / retract_fact 分开，才好加权限、幂等、审计和回放。
3. **按压力决定上图**：同一实体散落大量来源需持续对齐、业务常跨两跳以上查询、关系累积要按来源/时间/版本追踪、多 Agent 共同消费更新——这些压力同时出现才上图；否则固定场景用 [RAG](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/retrieval-augmented-generation-rag.md) 或关系库即可。
4. **分权而非全能裁断**：模型可读、可提议、可解释冲突，但发布权、全局语义修改权、高危动作执行权要分别授权。
5. **把缺失当未知而非错误**：开放世界假设落到产品，缺失事实先视为未知，流程再决定暂停、补证或拒绝；对付款 Agent 宁可"不知道"也不凭猜测付错。
6. **暂缓选型，先跑通一条事实链**：先答清六个问题——有无稳定 ID、关系是否精确定义、事实何时有效、证据在哪、谁有权发布撤回、哪类动作可消费；答不清就暂缓选型。

## 相关实体

- [检索增强生成（RAG）](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/retrieval-augmented-generation-rag.md) —— 四层架构中的证据层，负责段落检索而非事实判断
- [数据质量框架](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/data-quality-framework.md) —— 主张的校验在发布前发生
- [多 Agent 系统](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/multi-agent-systems.md) —— 语义控制面约束多 Agent 对同一事实的一致解释
- [Agent 记忆架构](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/agent-memory-architecture.md) —— 写入前校验、按版本读取，与本体分层互补
- [原文存档](https://mp.weixin.qq.com/s/d9C-0aR1fCIkKkFVtz7_jg)

---

