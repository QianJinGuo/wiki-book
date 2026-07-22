---
title: "万级实时推理的商品领域Agent实践思考和总结"
author: "商品中心技术团队"
source: "大淘宝技术"
source_url: "https://mp.weixin.qq.com/s/VacWMG2oaAPq4vBsKEf7SA"
created: 2026-05-25
type: raw
tags: [article]
sha256: c01bb39d8c7e281a47b3e97aa21255db5138e55e1fb354373b33f15c507a6b64
---

# 万级实时推理的商品领域Agent实践思考和总结

## 引言

商品域在商品理解业务中引入大模型能力，对商品卖点、规格等核心链路进行升级改造。早期沿用T+1离线批处理的生产思路，已在多个场景取得了较好的前台效果。

核心问题：
1. AI化主线下，商品域应储备什么技术基建能力？
2. AI化在商品域如何拆解为可落地、可演进的技术路线？
3. 能否从离线推理走向实时推理？若到SKU粒度是否能够支撑？推理成本问题如何解决？
4. 能否通过Agent思路在商品领域提供更完整的SKU化解决方案？

## 为什么是商品Agent？

业界已探索的多种将大模型能力落地的路径均存在"能力碎片化"与"工程不可持续"的瓶颈：
- Prompt Engineering：难以应对复杂逻辑、多步骤决策
- RAG：本质仍是"问答式"单轮交互，缺乏主动规划
- Fine-tuning：成本高、迭代慢、无法动态调用工具
- MaaS：业务逻辑与模型强耦合
- Function Calling：不包含状态管理、目标分解或长期记忆

Agent以"操作系统级"容器整合上述能力：内嵌Function Calling实现系统集成、天然融合RAG机制、可结合微调模型但保持松耦合、具备目标驱动的动态推理与回溯能力。

## 商品Agent架构建设

### 框架选型

2025年选择轻度"耦合"spring-ai-alibaba来构建商品域Agent应用。基于集团成熟的Java生态，新的技术栈会带来额外复杂度。未来会向多应用类似微服务的架构演进，引入deepeval做评测、deepresearch做事实性验证等开源组件。

### 架构设计

商品Agent抽象为两层结构：
- **上层**：面向业务场景的workflow编排层
- **下层**：统一的能力供给层

两层之间通过抽象的AIFunction接口交互。

### AIFunction SDK

开发轻量aiagentsdk，提供注解：@AIWorkflow、@AIAction、@AIFunction、@AIParameter、@AIResult、@AIResultField。

AIFunction字段规范：
- name：function唯一标识
- description：一句话能力描述（必需）
- parameters：通过@AiParam反射自动推导
- returns：返回值类型/含义说明
- expose：是否对外暴露
- tags：能力标签（llm、rag、tool、memory等）
- sideEffect：是否有副作用
- timeoutMs：推荐执行超时时间

访问规范：调用function时按{Registry}.{DomainRegistry}.{FunctionClass}.{FunctionName}方式进行链式调用，如`registry.item().query().invoke(params)`。

## 商品领域知识库

### 三层知识分类

1. **显性事实知识**：对"显卡的GPU品牌"、"SPU下不同SKU差异"等的客观描述。用于运营决策、prompt增强、数据清洗。
2. **关联情景知识**：商品-商品关系、商品-场景连接。如主配件场景，在10个类目近10000条案例中总结出53条规则。
3. **隐性经验知识**：来源于用户使用经验、专家评测、品牌文化。最能建立信任，用于商品卖点、参数说明。

### 知识存储架构

采用两层异构存储：
- **MySQL**：主持久化存储，保障强一致性
- **TisPlus**：批量向量化处理与大规模KV存储，支持语义检索

## AIWorkflow：在离线业务流程统一

### 旧架构问题

- 数据处理复杂且维护成本高（复杂SQL、UDF、离散节点编排）
- 流程扩展性与灵活性不足
- 推理调度存在不确定性（共享资源池争抢）
- 在线与离线体系割裂（两套技术栈）

### 新架构实现

基于Spring AI Agent将业务流程封装为Workflow，向上屏蔽触发源差异（定时调度 vs 实时事件），向下屏蔽计算资源差异（单机执行 vs 分布式集群）。

核心设计：
- Function（原子能力）、Action（业务动作）、Workflow（流程编排）三个标准化组件
- 两种入口模式：离线批量推理（调度任务触发）+ 在线增量推理（实时事件驱动）
- 统一存储写入：MySQL（在线）+ ODPS（离线）

## 事务型商品领域事件：实时推理关键

通过精卫链路实现基于商品ID+事务ID的数据行变更聚合并转发，将秒级别处理事务量级降低一个数量级。下游Java应用消费消息并补全数据，最终落到异构sku数据表。

商品Agent通过事务型商品领域事件搭建实时推理能力，实现万级实时推理。

## 应用分层

- **客户端层**（item-agent-client）：JDK 8兼容轻量级SDK
- **服务层**：agent-server（业务逻辑）+ Agent实例层（商品数据加工/问答/SKU引擎）+ 评估客户端层
- **功能层**（item-agent-functions）：原子能力（向量写入、文本解析、属性提取）
- **SDK层**（item-agent-sdk）：统一调用契约
- **公共模块**：事件引擎层（item-agent-event-engine）+ 管理后台层（item-agent-admin）

## 部署架构

- **SKU引擎分组**：商品领域事件驱动，完成商品粒度→SKU粒度转换
- **LLM分组**：大模型实时推理核心职能，支持评测体系
- **服务分组**：读写分离+单元化架构（写服务：张北中心；读服务：单元化+Tair缓存）

## 应用效果

- 覆盖亿级在线商品
- 显著提升商品信息完整性、准确率、丰富性
- 搜索、详情等核心导购场景成交转化率正向提升
- 新需求开发周期：1周/人

## 总结

搭建完成"事件驱动的Function-Centric Agent架构"，验证了大模型能力以结构化、工程化方式嵌入商品数据生产链路的可行性。未来方向：
- 以Harness、Skill等新一代Agent框架持续演进
- 以商品理解"大脑"为核心构建自适应决策机制
- 夯实"数据+工具+知识+决策"四位一体的Agent基础设施
