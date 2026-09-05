---
sha256: f1665884cc2ba8c4827b2905e4870dddb8a83e1a947d52bd2e63ef3bfa934c59
source: rss
source_url: https://aws.amazon.com/cn/blogs/china/spec-ship-bmad-aidlc
ingested: 2026-07-14
feed_name: AWS China Blog
source_published: 2026-07-14
---

# 从 Spec 到 Ship:用 BMad 把 AIDLC 跑成可复制的工程流程

摘要：本文介绍利用 AIDLC 方法论与 BMAD 框架，在 AWS Serverless 上构建端到端 AI 驱动开发流程。通过引入“定义约束、人工评审（Review Gate）、TDD 验证”机制，实现 AI 并行产出与业务、架构及测试的跨阶段一致性，将 AIDLC 转化为可复制的工程流。

**目录**

01 引言

02 概述

03 关于本文中的约束条件

04 前置知识

05 AIDLC 生命周期模型

06 BMAD 的 Agent 约束机制

07 Kiro 在流程中的角色

08 实战：Hotel Booking Inventory API

09 Brownfield 项目适配

10 多人团队协作模型

11 工程实践要点

12 局限性

13 总结

14 动手实操

15 相关资源

* * *

## **一、引言**

[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/07/02/spec-ship-bmad-aidlc-engineering-1.png>)  
---  
  
当团队开始大规模使用 AI 编码工具时，一个问题很快浮出水面：AI 生成的代码片段质量不错，但缺乏跨阶段的一致性保证。PRD 定义了 5 个端点，架构文档只覆盖了 3 个，测试在验证一个两边都没提到的行为——这类不一致在人工编写的项目中需要数天暴露，在 AI 高速产出的项目中可能在几小时内就堆积成系统性风险。

本文介绍如何使用 AIDLC（AI-Driven Developer Life Cycle）方法论和 BMAD Method 框架，在 AWS Serverless 技术栈上建立从需求到部署的端到端 AI 驱动开发流程。我们以一个酒店预订库存管理 API 的构建为例，展示该方法在实际工程实践中的运作方式。

## **二、概述**

AIDLC 将软件开发生命周期重构为 AI 执行 + 人类评审的协作模型。开发者的核心职责从”编写代码”转变为”定义约束、评审产出、把控质量门禁”。

BMAD Method（Build More Architect Dreams）是 AIDLC 的落地框架——一个开源的规模自适应 Agent 编排系统，通过配置文件约束每个 AI Agent 的行为边界，通过结构化工作流串联从需求分析到代码交付的完整流程。

两者结合解决的核心问题是：如何让多个 AI Agent 在受控的约束条件下并行工作，同时确保它们的产出在业务语义、技术实现和质量标准上保持一致。

## **三、关于本文中的约束条件**

本文基于一个 Workshop 场景来演示完整流程。文中的 Agent 配置包含了 Workshop 特有的约束条件，例如时间限制（“30 分钟内完成架构文档”）、预设的技术栈选型等——这些是为了在有限时间内完成演练而设定的，并非生产环境的推荐配置。在实际项目中，时间预算应根据系统复杂度和团队节奏灵活设定，技术选型约束也应视具体需求而定。时间约束作为 Agent 配置手段本身是有效的，但具体数值和约束范围需要按实际场景调整。

## **四、前置知识**

本文假设读者熟悉以下概念：

  * [AWS Lambda](<https://aws.amazon.com/cn/lambda/>)、[Amazon API Gateway](<https://aws.amazon.com/cn/api-gateway/>)、[Amazon DynamoDB](<https://aws.amazon.com/cn/dynamodb/>) 的基本使用
  * [AWS CDK](<https://aws.amazon.com/cn/cdk/>)（Cloud Development Kit）项目结构
  * TDD（测试驱动开发）的基本流程
  * AI 辅助编码工具的日常使用经验



## **五、AIDLC 生命周期模型**

AIDLC 将开发过程划分为三个阶段，阶段之间由 Review Gate（评审门禁）隔开：

[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/07/02/spec-ship-bmad-aidlc-engineering-2.png>)  
---  
  
这里有一个容易被误读的地方需要先澄清：Review Gate 不是”人唯一介入的地方”，而是”人必须签字放行的地方”。人始终在环（Human-in-the-Loop）——贯穿每个阶段的内部，而不只是阶段之间的关卡。 AI 负责并行产出和起草，人负责定义约束、即时纠偏、做决策、最终验收。Review Gate 只是把这种持续的人机协作收束成一个不可跳过的强制确认点。

下表中”人在环中的工作”一列描述的是阶段内部持续发生的人工介入，“Review Gate 把关要点”则是跨阶段那道强制门禁上人要确认的事项：

阶段 | AI Agent 执行 | 人在环中的工作（阶段内部，持续） | Review Gate 把关要点（跨阶段，强制）  
---|---|---|---  
Inception | 基于 Product Brief 并行产出PRD、架构文档、测试策略 | 提供 Product Brief、回答 Agent 的澄清提问、对每份草稿做即时反馈与迭代 | 三份文档之间的一致性：端点定义、数据模型、验收标准是否对齐  
Construction | TDD 模式实现代码、CDK 基础设施、E2E 测试 | 审阅每个 Story 的测试与实现、确认技术决策、对偏离架构的产出立即叫停 | 代码是否符合架构约束、测试是否覆盖验收标准、IAM 权限是否最小化  
Operations | 监控配置、告警规则、部署流水线定义 | 提供业务 SLA 与运维约束、校准告警阈值、确认部署窗口 | 告警阈值是否合理、部署策略是否匹配业务 SLA  
  
可以看到，没有任何一个阶段是”AI 全自动跑完再交给人验收”的。即便在 Construction 这种最接近”放手让 AI 写代码”的阶段，人也在每个 Story 的粒度上持续介入：审阅测试是否真的表达了预期行为、确认实现没有偏离架构、在 Agent 跑偏的第一时间叫停。AI 提供速度，人提供判断，两者交替进行。

Review Gate 是人工审查，不可由 AI 替代。 即使借助 BMAD 的 Party Mode（多 Agent 交叉检查）辅助评审，AI 仍然会遗漏语义层面的不一致——涉及领域惯例、隐含假设或跨文档间接依赖时，AI 的理解存在盲区。实际操作中，Review Gate #1 卡住问题的频率相当高，PRD 和架构之间的语义分歧几乎每次都会出现。人类审查者能基于业务经验捕获 Agent 无法识别的分歧，提前解决这些问题的成本远低于流入 Construction 阶段后的返工代价。

需要说明的是，这里的人工评审指向的是业务语义、跨文档一致性和关键决策——例如”删除”到底是物理删除还是归档、某个验收标准是否符合领域惯例——而不是逐行审读代码。代码层面的正确性验证由 TDD 承担（见后文”TDD 作为 AI 验证机制”）：测试就是 AI 产出代码的可执行合同，比人工逐行 review 更高效可靠。人的精力应当投入到 AI 看不出的语义和决策问题上，而把机械的行级校验交给测试。

## **六、BMAD 的 Agent 约束机制**

BMAD 使用 TOML 配置文件定义每个 Agent 的行为空间。这是整套方法的关键技术设计——没有约束的 Agent 在面对开放式问题时，倾向于扩大讨论范围（“要不要考虑缓存？”“认证方案有三种选择……”），这在探索阶段有价值，但在执行阶段是效率损耗。

[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/07/02/spec-ship-bmad-aidlc-engineering-3.png>)  
---  
  
以架构师 Agent 的配置为例：
    
    
    TOML
    [agent]role = """
    技术架构师，负责在已确定的技术栈约束内完成系统设计。
    不讨论技术选型替代方案，聚焦于如何最优地使用已选定的技术。
    """persistent_facts = [
      "技术栈：AWS Lambda + API Gateway + DynamoDB + CDK (TypeScript)。已锁定。",
      "数据库模式：DynamoDB 单表设计，访问模式已在 PRD 中定义。",
      "认证：JWT via Lambda Authorizer，token 格式和声明结构已确定。",
      "时间约束：30 分钟内完成架构文档，超时输出当前最佳结果。",
    ]
    
    principles = [
      "不讨论技术选型 — 选型已定，直接进入设计。",
      "所有 IAM 权限遵循最小权限原则。",
      "输出必须包含可通过 cdk synth 验证的代码骨架。",
    ]
    

`persistent_facts` 是 Agent 的不可变前提——它不能质疑这些事实，也不需要向用户确认。principles 是行为准则——Agent 在做每个决策时都需要遵守。

这种配置的实际效果是：Agent 从接到任务到开始产出有效设计之间，几乎不再需要往返的”确认对话”。技术选型不再需要讨论，范围不需要再确认，Agent 直接进入设计细节。

## **七、Kiro 在流程中的角色**

BMAD 定义了 Agent 的行为约束和工作流结构，但需要一个执行环境将这些定义转化为可运行的交互。[Kiro](<https://kiro.dev/>) 是 AWS 推出的 AI IDE，其设计哲学与 AIDLC 的约束优先原则天然对齐，是本流程推荐的执行载体。

[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/07/02/spec-ship-bmad-aidlc-engineering-4.png>)  
---  
  
四者的关系是：AIDLC 提供方法论框架，BMAD 将其落地为可配置的 Agent 约束和工作流，Spec-driven development 是贯穿其中的核心理念（先约束后执行），而 Kiro 是将这三层整合在一起的执行环境——BMAD 的 Agent 配置通过 Kiro 的 Skills 系统运行，AIDLC 各阶段的产出物以 Spec 的形式成为 AI 编码的刚性约束。

需要强调图中那两条向上的红色迭代箭头：这套关系不是单向瀑布。当 Kiro 的执行过程中暴露出需求遗漏、设计缺陷或验收标准需要调整时，正确的做法不是在 Kiro 里直接改代码绕过约束，而是回到上游——回到 BMAD 去更新 Agent 配置或重跑相关工作流，回到 SDD 去修订 Spec，再让变更重新驱动一次执行。约束始终是上游的 PRD、架构文档和 Spec，代码只是它们的产物；一旦在工具层私自偏离，前文强调的跨阶段一致性就会被破坏。这条”执行 → 回流上游 → 重新驱动”的闭环，正是 AIDLC 与 Spec 驱动方法可迭代、而非一次性瀑布的关键。

### **7.1 Spec 驱动：约束在执行之前**

Kiro 的核心理念是 Spec-driven development——在 AI 动手编码之前，先通过结构化的规格文档（Spec）明确定义预期行为、接口契约和验收标准。这与 AIDLC 的”先定义约束、再让 AI 执行”一脉相承：

AIDLC 视角: PRD → 架构文档 → Review Gate → 受约束的 AI 执行Kiro 视角: Spec 定义 → AI 在 Spec 约束内生成代码 → 验证输出符合 Spec 

两者的共同假设是：无约束的 AI 产出不可预测，约束本身就是产品质量的第一道防线。PRD 中定义的验收标准、架构文档中锁定的技术选型，在 Kiro 中以 Spec 的形式成为 AI 编码时不可违反的前提条件。

### **7.2 Skills 系统：BMAD Agent 的运行时**

BMAD 的每个 Agent（PM、Architect、Dev、TEA 测试架构师）在 Kiro 中以 Skill 的形式存在。Skill 是 Kiro 的结构化工作流单元，包含：
    
    
    激活条件：通过斜杠命令触发（如 /bmad-create-prd、/bmad-create-architecture）
    

  * 持久事实加载：自动读取 TOML 配置中的 `persistent_facts`，Agent 启动即携带所有约束
  * 多步骤编排：复杂工作流拆分为有序步骤，每步有明确输入输出，支持条件分支
  * 定制化层级：base 配置 → 团队覆盖 → 个人覆盖，三层合并确保约束可继承可调整


    
    
    .kiro/skills/
    ├── bmad-agent-pm/          # PM Agent → 产出 PRD
    ├── bmad-agent-architect/   # Architect Agent → 产出架构文档
    ├── bmad-agent-dev/         # Dev Agent → TDD 实现
    ├── bmad-tea/               # TEA Agent → 测试架构与 E2E 测试
    ├── bmad-sprint-planning/   # Sprint 规划工作流
    ├── bmad-party-mode/        # 多 Agent 交叉评审
    └── bmad-brainstorming/     # 深度探索模式
    

每个 Skill 执行时，Kiro 确保 Agent 只在其定义的行为空间内运作——不会越权访问其他 Agent 的上下文，不会在未经明确指令时修改 Spec 之外的文件。这种隔离机制与 AIDLC 的”对话隔离”原则在工具层面形成对应。

### **7.3 实际效果**

在多团队实践中，相较于纯命令行工具，Kiro 的 Skills 系统带来两个可观测的效率提升：

  * 启动摩擦降低：Agent 约束通过 Skill 激活自动加载，开发者无需在每次对话开头手动粘贴 TOML 配置或提示词
  * 工作流连续性：多步骤 Skill 在步骤之间保持上下文一致性，避免了手动拆分对话时的信息丢失



实践团队反馈：”BMAD 结构化工作流可以约束模型签名一致，AI 负责质量和速度，人负责决策和验检，BMAD 负责不让模型跑偏。”Kiro 的 Skills 系统正是让”不让模型跑偏”从人工纪律变为工具保障的关键环节。

## **八、实战：Hotel Booking Inventory API**

以下是使用该方法在 AWS 上构建一个完整 Serverless API 的过程记录。

### **8.1 目标系统**

[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/07/02/spec-ship-bmad-aidlc-engineering-5.png>)  
---  
  
功能范围：酒店房间库存的 CRUD 管理 + 可用性查询，JWT 认证，单物业 MVP。

### **8.2 Inception 阶段：并行产出**

[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/07/02/spec-ship-bmad-aidlc-engineering-6.png>)  
---  
  
三个 Agent 同时启动，各自基于同一份 Product Brief 独立工作：

PM Agent 产出 PRD，定义了 5 个核心端点：
    
    
    POST   /api/v1/rooms              创建房间
    GET    /api/v1/rooms/{id}         获取房间详情
    GET    /api/v1/rooms              列出房间（支持 status/type 筛选）
    PUT    /api/v1/rooms/{id}         更新房间信息
    GET    /api/v1/rooms/availability 按日期范围查询可用性
    

每个端点包含请求 Schema、响应格式、错误码和验收标准。验收标准足够具体以支撑后续自动化测试——例如”无效 JWT → 401，响应体包含 `error: 'unauthorized'`“。

Architect Agent 产出技术架构文档，核心是 DynamoDB 单表设计：

实体 | PK | SK | 访问模式  
---|---|---|---  
Room | HOTEL# | ROOM# | 单房间 CRUD、按酒店列出所有房间  
Booking | HOTEL# | BOOKING## | 按日期范围查询预订  
Availability | HOTEL# | AVAIL# | 按日期查询可用房间数  
  
这个 Schema 通过 PK 的 `HOTEL#` 前缀实现数据隔离，通过 SK 的前缀实现同一分区内的多实体共存。所有查询模式都可以用 Query 操作（而非 Scan）高效完成。

QA Agent 产出测试策略，按风险等级排列测试优先级：

  * P0（必测）：JWT 认证绕过、并发写入冲突、输入验证
  * P1（应测）：正常 CRUD 流程、可用性查询准确性
  * P2（可选）：性能基线（p95 < 200ms）、边界条件



### **8.3 Review Gate #1：一致性验证**

[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/07/02/spec-ship-bmad-aidlc-engineering-7.png>)  
---  
  
Review Gate #1 由两道工序串联组成，二者缺一不可：

  * AI 交叉评审（Party Mode）：先用 BMAD 的 Party Mode 做第一遍机器评审。Party Mode 是 BMAD 的多 Agent 协作机制——多个 Agent 以各自的专业视角（PM、架构、测试）对同一组产出物进行交叉检查，快速捞出格式错位、字段缺失、端点数量对不上这类”机器能发现”的不一致。它的价值在于速度和覆盖广度，能在几分钟内把明显的硬性冲突标记出来。
  * 全角色人工评审：Party Mode 跑完后，所有相关角色（PM、架构师、开发、QA）必须再坐下来做一次人工评审。这一步不是走过场——AI 评审擅长发现”对不上”的问题，却看不出”对得上但错了”的问题：领域惯例、隐含业务假设、跨文档的间接依赖，这些都需要人基于经验来判断。人工评审同时承担两个职责：一是验收本阶段产出（三份文档是否真的达到可以进入 Construction 的质量），二是为下一阶段做准备（统一认知、明确分工、确认 Sprint Planning 的输入就绪）。



换句话说，Party Mode 是”加速器”,负责把人从机械比对里解放出来;全角色人工评审才是”放行闸”,决定本阶段能否验收通过。只跑 Party Mode 而跳过人工评审，等于让 AI 给 AI 的产出签字——这恰恰是 AIDLC 要避免的。

以下是某次评审中发现的一个典型不一致案例（每次执行的具体发现会有所不同，但这类跨文档语义分歧几乎必然出现）。值得注意的是，这个案例正是在全角色人工评审环节、由具备业务经验的人发现的，Party Mode 在前一道工序并未捕获——因为三份文档在字面上都”自洽”,分歧藏在对”删除”一词的语义理解里：

PRD 定义了DELETE /rooms/{id} 端点，架构文档设计的是软删除（设置 status=archived），而测试策略写的验收标准是”删除后 GET 返回 404”。三方对”删除”的语义理解不同。

对齐决策：采用软删除，端点语义调整为”归档”，测试标准改为”归档后 GET 返回 410 Gone 并包含归档时间戳”。

这类分歧在 Inception 阶段解决成本极低（修改三份文档中的几行描述），如果流入 Construction 阶段后才发现，已有的代码和测试都需要返工。

### **8.4 Construction 阶段：TDD 并行构建**

[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/07/02/spec-ship-bmad-aidlc-engineering-8.png>)  
---  
  
Sprint Planning 完成后，四个角色进入并行工作。

**Dev Agent：TDD 实现**

BMAD 的 Dev Agent 配置强制 TDD 模式——先写测试定义预期行为，再实现代码使测试通过。这个约束在 AI 编码场景下有特殊价值：测试本身就是对 AI 行为的可执行验收标准，比逐行 code review 更高效也更可靠。

以 `POST /rooms` 端点为例：
    
    
    // 测试定义预期行为describe('POST /api/v1/rooms', () => {
      it('should create room and return 201 with roomId', async () => {
        const res = await request(app)
          .post('/api/v1/rooms')
          .set('Authorization', `Bearer ${validToken}`)
          .send({ hotelId: 'h-001', type: 'deluxe', price: 299.99, status: 'available' });
    
        expect(res.status).toBe(201);
        expect(res.body.roomId).toBeDefined();
        expect(res.body.type).toBe('deluxe');
      });
    
      it('should return 400 when required fields missing', async () => {
        const res = await request(app)
          .post('/api/v1/rooms')
          .set('Authorization', `Bearer ${validToken}`)
          .send({ hotelId: '' });
    
        expect(res.status).toBe(400);
        expect(res.body.error).toContain('validation');
      });
    
      it('should return 401 without valid JWT', async () => {
        const res = await request(app).post('/api/v1/rooms').send({ hotelId: 'h-001' });
        expect(res.status).toBe(401);
      });
    });
    
    
    
    // 实现通过测试import { z } from 'zod';
    import { DynamoDBClient, PutItemCommand } from '@aws-sdk/client-dynamodb';
    import { marshall } from '@aws-sdk/util-dynamodb';
    
    const CreateRoomSchema = z.object({
      hotelId: z.string().min(1),
      type: z.enum(['standard', 'deluxe', 'suite']),
      price: z.number().positive(),
      status: z.enum(['available', 'maintenance', 'blocked']),
    });
    
    export const handler = async (event: APIGatewayProxyEvent) => {
      const parsed = CreateRoomSchema.safeParse(JSON.parse(event.body || '{}'));
      if (!parsed.success) {
        return {
          statusCode: 400,
          body: JSON.stringify({ error: 'validation', details: parsed.error.issues }),
        };
      }
    
      const roomId = crypto.randomUUID();
      await client.send(new PutItemCommand({
        TableName: process.env.TABLE_NAME,
        Item: marshall({
          PK: `HOTEL#${parsed.data.hotelId}`,
          SK: `ROOM#${roomId}`,
          ...parsed.data,
          roomId,
          createdAt: new Date().toISOString(),
        }),
      }));
    
      return { statusCode: 201, body: JSON.stringify({ roomId, ...parsed.data }) };
    };
    

实现代码里值得留意的是入口处的CreateRoomSchema.safeParse(…)——这正是测试中”缺少必填字段返回 400”那条验收标准在代码侧的落点。这里用到的 [Zod](<https://zod.dev/>) 是 TypeScript 生态常用的运行时校验库：用声明式语法把”合法输入长什么样”写成一个Schema，请求进来时校验是否匹配，不匹配就直接在 Lambda 入口拦截并返回结构化的400。选它的原因也很契合本流程——Schema 一处定义即可同时得到运行时校验和 TypeScript 类型，让 PRD 里的字段约束、测试里的验收标准、代码里的实际校验三者天然对齐，正是 Review Gate 想要保证的那种一致性。DynamoDB 操作则使用 @aws-sdk/client-dynamodb v3 SDK。

**Architect Agent：CDK 基础设施**

与代码实现并行，Architect Agent 产出 CDK Stack：
    
    
    import * as cdk from 'aws-cdk-lib';
    import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
    import * as lambda from 'aws-cdk-lib/aws-lambda-nodejs';
    import * as apigw from 'aws-cdk-lib/aws-apigateway';
    import * as cloudwatch from 'aws-cdk-lib/aws-cloudwatch';
    
    export class HotelBookingStack extends cdk.Stack {
      constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
        super(scope, id, props);
    
        // DynamoDB: 按需计费，生产保留const table = new dynamodb.Table(this, 'HotelTable', {
          partitionKey: { name: 'PK', type: dynamodb.AttributeType.STRING },
          sortKey: { name: 'SK', type: dynamodb.AttributeType.STRING },
          billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
          removalPolicy: cdk.RemovalPolicy.RETAIN,
          pointInTimeRecovery: true,
        });
    
        // Lambda: 最小权限，X-Ray 追踪const createRoomFn = new lambda.NodejsFunction(this, 'CreateRoom', {
          entry: 'src/handlers/create-room.ts',
          environment: { TABLE_NAME: table.tableName },
          tracing: lambda.Tracing.ACTIVE,
          timeout: cdk.Duration.seconds(10),
          memorySize: 256,
        });
        table.grantWriteData(createRoomFn);  // 仅授予写权限，非 grantFullAccess// API Gatewayconst api = new apigw.RestApi(this, 'HotelApi', {
          restApiName: 'Hotel Booking API',
          deployOptions: { tracingEnabled: true, metricsEnabled: true },
        });
    
        const rooms = api.root.addResource('api').addResource('v1').addResource('rooms');
        rooms.addMethod('POST', new apigw.LambdaIntegration(createRoomFn), {
          authorizer: jwtAuthorizer,
          authorizationType: apigw.AuthorizationType.CUSTOM,
        });
    
        // CloudWatch 告警new cloudwatch.Alarm(this, 'ApiErrorRate', {
          metric: api.metricServerError({ period: cdk.Duration.minutes(1) }),
          threshold: 5,
          evaluationPeriods: 2,
          alarmDescription: 'API 5xx error rate exceeded threshold',
        });
      }
    }
    

关键设计决策：
    
    
    grantWriteData 而非 grantFullAccess，遵循最小权限原则
    pointInTimeRecovery: true，启用时间点恢复防止数据丢失
    removalPolicy: RETAIN，防止 cdk destroy 意外删除生产数据
    

  * 每个 Lambda 独立的 IAM Role，避免权限累积



**TEA Agent：端到端测试**

代码就绪后，测试工程师 Agent 生成 E2E 测试验证完整业务流程：
    
    
    describe('Booking Lifecycle E2E', () => {
      it('create room → check availability → book → verify blocked', async () => {
        // Step 1: 创建房间const room = await api.post('/api/v1/rooms', {
          hotelId: 'hotel-test', type: 'deluxe', price: 299.99, status: 'available'
        });
        expect(room.status).toBe(201);
    
        // Step 2: 验证可用性const avail = await api.get(
          `/api/v1/rooms/availability?hotelId=hotel-test&date=2026-07-15`
        );
        expect(avail.body.available).toBe(true);
    
        // Step 3: 创建预订const booking = await api.post('/api/v1/reservations', {
          roomId: room.body.roomId, checkIn: '2026-07-15', checkOut: '2026-07-17'
        });
        expect(booking.status).toBe(201);
    
        // Step 4: 验证可用性变更const afterBook = await api.get(
          `/api/v1/rooms/availability?hotelId=hotel-test&date=2026-07-16`
        );
        expect(afterBook.body.available).toBe(false);
      });
    });
    

### **8.5 Review Gate #2：最终验证**

与 Review Gate #1 一样，Construction 阶段的产出也要经过先 AI 交叉评审、再全角色人工评审两道工序：Party Mode 先扫一遍代码与文档的硬性对齐问题，随后所有角色共同做一次人工验收，确认本阶段可以交付、并为 Operations 阶段的部署与监控做好准备。两道工序检查的维度包括：

**代码与架构对齐**

  * Lambda 函数结构是否与 API Gateway 路由定义一一对应
  * DynamoDB 操作是否遵循架构文档中定义的访问模式
  * IAM 权限是否为每个函数独立配置且最小化



**测试完整性**

  * PRD 中每个验收标准是否有对应的自动化测试
  * E2E 测试是否覆盖核心业务流程
  * 错误场景（401/400/404/409）是否验证



**可部署性**

  * `cdk synth` 无 warning 通过
  * `npm test` 全绿
  * 无硬编码的环境变量或凭据



## **九、Brownfield 项目适配**

[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/07/02/spec-ship-bmad-aidlc-engineering-9.png>)  
---  
  
对于已有代码库的项目，BMAD 通过”上下文发现”机制进行适配。流程是在 AI IDE 中输入一段结构化提示词，AI 自动扫描代码库并产出项目上下文确认卡：
    
    
    ┌─────────────────────────────────────┐
    │   项目: order-management-api        │
    │   语言: TypeScript                  │
    │   框架: Express + AWS Lambda        │
    │   数据库: DynamoDB (3 tables)       │
    │   测试: Jest (覆盖率 72%)           │
    │   架构: 微服务 (6 Lambda functions) │
    │   规模: 12,400 行代码               │
    └─────────────────────────────────────┘
    

人工确认准确性后，AI 基于检测结果生成 Agent 配置——`persistent_facts` 中包含实际的技术栈和代码约定，`principles` 中包含”遵循已有模式”和”不修改受保护路径”等 Brownfield 专属约束。

Brownfield 场景的关键纪律是：每次代码修改后运行完整测试套件。新增代码破坏了现有测试 → 立即停止修复，不允许积累回归。Agent 的 TOML 配置中直接写入这条约束，使其成为不可违反的行为规则。

## **十、多人团队协作模型**

[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/07/02/spec-ship-bmad-aidlc-engineering-10.png>)  
---  
  
BMAD 的设计哲学是”单人 + AI Agent 团队”。将其扩展到多人团队时，核心原则是规划收敛、实施发散：

  * Inception 阶段（收敛）：一人主笔 PRD 和架构，全员参与 Review Gate 评审。这里的”全员”指本阶段产出涉及的所有角色——Tech Lead（架构）、产品/需求负责人（PRD）、开发工程师（实现可行性）、QA Lead（测试策略与验收标准）。每个角色从自己的专业视角对三份文档做一次人工评审，确保没有任何一方的关切被遗漏，避免多人各自产出相互矛盾的文档。
  * Construction 阶段（发散）：按 Epic 分工并行实现。每人在独立的 AI 对话中工作，互不干扰。



Sprint Planning 是两个模式的切换点。之前是收敛的（统一认知），之后是发散的（并行执行）。

推荐的角色分配（3-6 人团队）：

角色 | 人数 | 阶段  
---|---|---  
Tech Lead | 1 | 主笔 Inception 文档 + 架构评审  
开发工程师 | 2-4 | Construction 阶段按 Epic 并行  
QA Lead | 1 | 全程测试策略 + 所有 PR 的质量审查  
  
## **十一、工程实践要点**

[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/07/02/spec-ship-bmad-aidlc-engineering-11.png>)  
---  
  
通过多次实际执行验证，以下实践对产出质量影响显著：

**对话隔离**

每个独立任务（Story 实现、Review Gate 评审、角色切换）在新的 AI 对话中执行。上下文在不同任务之间累积会导致 Agent 行为漂移——在长对话中，Agent 倾向于混淆早期讨论内容和当前任务需求。BMAD 将此作为强制性纪律而非建议。

**约束前置**

通过 TOML 配置将技术选型、时间限制、质量标准等约束预先写入 Agent 的 `persistent_facts`。Agent 在接到任务时已经”知道”所有前提条件，无需在对话中逐一确认。实测效果：相同任务的完成时间从 45-60 分钟降低到 20-25 分钟，减少的部分几乎全是确认性对话。

**TDD 作为 AI 验证机制**

在 AI 编码场景下，TDD 的价值从”设计驱动”转变为”行为验证”。测试是 AI 产出代码的可执行合同——通过测试即符合预期，失败即偏离规格。这比人工逐行审读 AI 生成的代码更高效、更可靠。

**Review Gate 的投入产出比**

[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/07/02/spec-ship-bmad-aidlc-engineering-12.png>)  
---  
  
Review Gate #1 通常只需一次短会即可完成。跳过此步直接进入 Construction 的团队，往往要在后续阶段花费数倍的时间回头修复一致性问题。这背后的逻辑很直接：早期发现分歧的修复成本（改几行文档描述）远低于后期发现的返工成本（丢弃已实现的代码和测试）。

## **十二、局限性**

该方法在以下场景效果受限：

  * 开放式技术选型：BMAD 的约束机制基于”决策已定”的前提。如果团队仍在评估技术方案，Agent 约束无从配置。
  * 大范围探索性需求：Product Brief 不明确时，Inception 阶段的 Agent 产出质量会显著下降。建议先通过头脑风暴或用户调研明确方向后再进入 AIDLC 流程。
  * 高度耦合的遗留系统：Brownfield 适配依赖 AI 对代码库的正确理解。如果代码库缺乏清晰的模块边界或存在大量隐式依赖，自动扫描的准确度会下降，需要更多人工校准。



## **十三、总结**

[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/07/02/spec-ship-bmad-aidlc-engineering-13.png>)  
---  
  
AIDLC + BMAD 的核心命题不是”AI 能替代开发者”，而是”如何让 AI 在工程纪律的约束下高效执行”。人始终在环——在每个阶段内部持续提供约束、纠偏与决策，并在 Review Gate 上做最终签字。Review Gate 确保产出一致性，TOML 配置约束 Agent 行为空间，TDD 提供可执行的验证标准，对话隔离防止上下文污染。需要强调的是，每道 Review Gate 都由”AI 交叉评审 + 全角色人工评审”两道工序组成——AI 加速比对，人做最终验收。

这些机制组合在一起，使得”AI 高速产出、人全程把关”的开发模式变得可控和可预测。

如果您希望在现有项目中尝试，建议从一个低风险的功能迭代开始，安装 BMAD 后完成一轮完整的 Inception → Review Gate → Construction → Review Gate 循环。两到三次迭代后，Agent 配置趋于稳定，后续迭代即可复用已验证的流程。

**下一步行动：**

**相关产品：**

  * [AWS Lambda](<https://aws.amazon.com/cn/lambda/?p=bl_pr_lambda_l=1>) — 无需服务器即可运行代码
  * [Amazon DynamoDB](<https://aws.amazon.com/cn/dynamodb/?p=bl_pr_dynamodb_l=2>) — 无服务器分布式 NoSQL 数据库
  * [Amazon CDK](<https://aws.amazon.com/cn/cdk/?p=bl_pr_cdk_l=3>) — 基础设施即代码框架
  * [Amazon API Gateway](<https://aws.amazon.com/cn/api-gateway/?p=bl_pr_api-gateway_l=4>) — 完全托管的 RESTful API 服务
  * [Amazon IAM](<https://aws.amazon.com/cn/iam/?p=bl_pr_iam_l=5>) — 身份管理和访问权限



**相关文章：**

  * [（上篇）基于 AWS Bedrock AgentCore 构建企业级航空客服智能体 —— 基于AIDLC方法从需求分析到生产部署的完整实践](<https://aws.amazon.com/cn/blogs/china/based-on-aws-bedrock-agentcore-build-enterprise-intelligent-based-on-aidlc-analytics-deploy-practice/?p=bl_ar_l=1>)
  * [AI 驱动的大数据工程：从平台驱动到 AIDLC 的范式迁移](<https://aws.amazon.com/cn/blogs/china/ai-engineering-platform-aidlc-migration/?p=bl_ar_l=2>)
  * [基于Amazon Bedrock的云基础设施代码化自动解决方案实践](<https://aws.amazon.com/cn/blogs/china/from-code-to-molecules-discovering-egfr-inhibitors-with-ai/?p=bl_ar_l=3>)
  * [Apache SeaTunnel 创新加速 ：AIDLC 方法论实践](<https://aws.amazon.com/cn/blogs/china/apache-seatunnel-aidlc-practice/?p=bl_ar_l=4>)
  * [基于 AWS DevOps Agent 构建 AI 驱动的运维分析系统](<https://aws.amazon.com/cn/blogs/china/based-on-aws-devops-agent-build-ai-operations-analytics-system/?p=bl_ar_l=5>)



## **十四、动手实操**

如果您希望亲自体验本文描述的完整流程，可以参加我们的 Workshop：

  * [AIDLC: From Dreams to Delivery — AWS Workshop](<https://catalog.us-east-1.prod.workshops.aws/workshops/d620c761-4eb9-43d7-956b-49ee37bf688a/en-US>) — 4 小时动手实操，从 Product Brief 到可部署 API 的端到端演练



## **十五、相关资源**

  * [BMAD Method](<https://github.com/bmad-code-org/BMAD-METHOD>) — 开源 Agent 编排框架
  * [Amazon DynamoDB — 单表设计最佳实践](<https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/bp-modeling-nosql.html>)
  * [AWS CDK Developer Guide](<https://docs.aws.amazon.com/cdk/v2/guide/home.html>)
  * [AWS Well-Architected Framework — Serverless Applications Lens](<https://docs.aws.amazon.com/wellarchitected/latest/serverless-applications-lens/welcome.html>)
  * [AWS Lambda — 最小权限 IAM 策略](<https://docs.aws.amazon.com/lambda/latest/dg/access-control-identity-based.html>)



*前述特定亚马逊云科技生成式人工智能相关的服务目前在亚马逊云科技海外区域可用。亚马逊云科技中国区域相关云服务由西云数据和光环新网运营，具体信息以中国区域官网为准。

## 本篇作者

###  林业

 亚马逊云科技资深解决方案架构师，负责基于亚马逊云科技的云计算方案的咨询与架构设计。拥有超过 18 年研发经验，曾打造千万级用户 APP，开发 Github 开源项目获 3000+ 星。在零售、游戏、IoT、智慧城市、汽车、电商等多个领域都拥有丰富的实践经验。现专注企业云原生架构和 GenAI 发展，致力将前沿技术应用于企业业务场景，推动数字化转型。热爱技术，追求卓越，乐于分享交流。

###  夏骏

 亚马逊云科技资深解决方案架构师，专注于为企业客户设计云原生架构和 AI 解决方案。在系统设计、产品交付和工程团队管理方面拥有丰富经验，曾在跨国企业领导技术团队完成大型产品交付。当前专注于帮助企业客户规模化落地Agentic AI解决方案。

###  华成

 亚马逊云科技客户解决方案经理，目前在亚马逊云科技主要支持泛零售行业的客户。通过运用云相关解决方案等帮助客户在迁移到亚马逊云和云上运维期间实现自身的业务价值，帮助客户成功。

###  李宛真

 亚马逊云科技技术客户经理，主要负责企业级客户的安全合规、成本管理和技术支持等工作。目前专注于协助客户落地在亚马逊云的安全合规工作。在加入亚马逊云科技前拥有丰富的视频云行业（如 CDN、直播、对像存储等）的技术支持经验。

###  詹健宇

 亚马逊云技术客户经理，在内核安全、电商推荐、机器学习领域均有经验。目前专注于 AI/ML 领域，致力于结合客户场景的 AI 解决方案的落地。

* * *

## AWS 架构师中心：云端创新的引领者

探索 AWS 架构师中心，获取经实战验证的最佳实践与架构指南，助您高效构建安全、可靠的云上应用 **[](<https://aws.amazon.com/cn/solutions/architect-center/>)**|   
---|---
