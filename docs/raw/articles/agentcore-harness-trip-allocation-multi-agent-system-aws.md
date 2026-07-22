---
source: rss
source_url: https://aws.amazon.com/cn/blogs/china/based-on-agentcore-harness-build-efficient
ingested: 2026-07-13
feed_name: AWS China Blog
source_published: 2026-07-13
sha256: 2a48ad769a7b67db44366cd5bb7797680c72a9a79f57784e5b7b7324f6423095
---

# 基于AgentCore harness构建高效、稳定的行程分配与优化多智能体系统

摘要：本文以大型头部旅行社中“大规模集体出行任务”为案例，针对其现实场景中需求复杂、人员众多、涉及的资源量大的特点，结合“LLM的语义理解能力”与“运筹学求解器的确定性”，开发出了一套高效、稳定、可人工审核、可循环迭代的行程分配与优化Multi-Agent系统，在实际应用中取得了较为满意的效果。  
  
**目录**

01 引言

02 需求概述

03 方案设计

04 技术实现

05 运行分析

06 应用场景

07 参考引用

08 相关链接

* * *

## **1\. 引言**

在多智能体（Multi-Agent）技术与框架快速发展的当下，开发一个能够完成Demo或PoC的多智能体应用已经不是难题。然而，从”能够运行”到”能够稳定运行”，再到”能够支撑企业级生产环境”，仍然存在明显的工程鸿沟。工业级多智能体系统不仅需要解决大语言模型固有的概率性输出、幻觉、不确定性和上下文漂移等问题，还需要应对Prompt编排、Agent协作、状态管理、异常恢复、人工干预、可观测性、可追溯性以及成本控制等一系列工程挑战。相比模型能力本身，这些工程能力往往才是决定系统是否能够真正落地的关键。

本文以大型头部旅行社中“大规模集体出行任务”为案例，针对其现实场景中需求复杂、人员众多、涉及的资源量大的特点，结合“LLM的语义理解能力”与“运筹学求解器的确定性”，开发出了一套高效、稳定、可人工审核、可循环迭代的行程分配与优化Multi-Agent系统，在实际应用中取得了较为满意的效果。

## **2\. 需求概述**

大型头部旅行社经常需要承接数千人/上万人规模的集体出行任务，包括大型活动/赛事、国际峰会、行业展会、企业年会/奖励旅游等等。这类“大规模集体出行任务”不同于普通的旅行团，是对旅行社统筹运营能力和资源整合能力的一种极度考验：即要满足不同客群的偏好、个性化需求，又要保证来自全国（甚至全世界）的几千人能在同一天（甚至同一时间段）抵达目的地，同时，也需要考虑目的地城市在住宿、餐饮、景区等方面的接待能力，还需要满足方案的经济性/安全性/执行效率等等。

由于任务的复杂性，长期以来，大型头部旅行社对这类“大规模集体出行任务”的行程安排与资源分配等工作完全依赖行业专家手工处理。处理过程往往以“月”为单位，耗时费力、极易出错，严重受制于工作人员的经验与细致程度，并且很难做到经济效益的优化。随着LLM与AI Agent技术的发展，一些行业先锋开始尝试使用Agent来实现处理过程的自动化，但是由于任务的复杂性，实际应用中发现挑战很多，效果并不理想。

“大规模集体出行任务”的出行人员通常分布在不同的城市，拥有不同的职级、身份、舱位资格与出行偏好；对可供调度的航班资源、国内联程接驳、口岸资源等也都有相应限制；同时出行方案还要求满足企业财务的成本目标、出行便利度目标等等。这里以我们收到的客户实际需求为例，先了解一下概况。

[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/07/08/based-on-agentcore-harness-build-efficient-1.png>) [图1：出行人员]  
---  
  
图1所示的是出行人员数据，包含至少15个属性字段——城市群、属地城市、性质（如 ABO/特邀家属/同游伙伴）、出席意向、国际交通选择（公司安排/自行安排）、餐食、批次、职级（VIP1–VIP5）、身份、可乘坐舱位、户籍号、规定抵达/离开日期等。

[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/07/08/based-on-agentcore-harness-build-efficient-2.png>) [图2：航班资源]  
---  
  
以图2所示的是航班资源数据，包含口岸、方向、日期、起飞/抵达时间、机型，以及关键的 F/C/Y 三舱总机位、F/C/Y 三舱团队票价、Y 舱阶梯价格、税费、备注等。

由于出行人员来自不同的城市，需要根据城市群到达出境口岸城市，这部分的交通费用也需要计划进行程安排中，图3所示的就是从周边城市到北京的往返接驳信息（高铁/大巴等，含耗时与价格）。

[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/07/08/based-on-agentcore-harness-build-efficient-3.png>) [图3：联程接驳交通]  
---  
  
其它必要信息还包括对航空公司的标识、联程接驳口岸住宿的酒店信息等，如图4所示。

[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/07/08/based-on-agentcore-harness-build-efficient-4-1.png>) | [](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/07/08/based-on-agentcore-harness-build-efficient-4-2.png>)  
---|---  
[图4：航空公司标识与联程接驳酒店]  
  
同时，“大规模集体出行任务”还附有非常复杂的匹配规则和交付要求，本例中主要包括：

  * 要求需要能根据出行人员名单，以户籍/属地城市为单位进行航班资源分配，同一属地城市必须在同一口岸，尽量同一航班；
  * 要求同一户籍号下的所有人员必须同一航班；
  * 要求按职级要求分配舱等（F/C/Y），不可升舱，可接受降舱；但要至少保证“职级分类=VIP1、VIP2”可搭乘头等或商务舱人员要安排商务舱；
  * 要求优先匹配离店铺城市最近的口岸；如果“口岸城市=属地城市”，则优先分配；当同一口岸同批次多航司时，接受-10个位以内的机位缺口；
  * 要求同一航班分配机位不可超过总机位数80%；
  * 要求同一口岸如有其他航班选择，尽量不使用廉航（如必须使用，只能安排口岸本地城市及周边城市）；
  * 要求国际航班，去程尽量避免使用早于12点、晚于18点后抵达的航班；回程尽量避免使用早于10点前，晚于14点后出发的航班；
  * 要求员工要和本属地城市ABO安排在同一航班，如无本属地城市，则须和本城市群ABO安排同一航班等等。



如图5所示。

[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/07/08/based-on-agentcore-harness-build-efficient-5.png>) [图5：匹配规则]  
---  
  
## **3\. 方案设计**

鉴于“大规模集体出行任务”需求的复杂性，使用单一的技术或模型很难直接解决。这里先考查“大语言模型LLM”和“运筹学求解器”在此类任务中的优劣势，再分析多智能体Multi-Agent系统在任务中的运行效率和稳定性问题，最后根据任务需求，设计出技术架构。

### 3.1 LLM与运筹学求解器

从客户需求中的数据来看，要给几千人进行航班的分配，虽然表面看数据量不大，但由于条件众多，组合的复杂度却极高。每个出席人员都要从若干航班中选择一组，并落在某个舱位，还要同时满足“同户籍同航班”、“同城市同口岸”、“按舱位资格分配”、“每舱不超80%容量”、“员工跟随本地ABO”等彼此耦合的约束，是一类典型的NP难（NP-hard）的组合优化问题，仅靠大语言模型（LLM）的推理能力很难取得满意的效果。

在客户需求数据中一共提供了出行人员3507人，每人需要从110个航班中选择合适的往返航班、并落在F/C/Y三个舱位之一，考查整体决策空间，计算朴素笛卡尔积（Cartesian Product）可知：

[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/07/10/based-on-agentcore-harness-build-efficient.png>)  
---  
  
其中：

  * 示出行人员总数；
  * 表示候选航班总数；
  * 表示候选舱位总数（即 F/C/Y 3个舱位）。



可以看到计算出的总决策空间极大，是一个天文数字。然而，真正复杂的还不是变量的数量，而是约束之间的强耦合——“同一户籍号必须同航班”需要把若干人绑成一个不可拆分的整体、“同一属地城市必须同口岸”又把人按城市聚团、“每舱不超过总机位80%”在航班维度需要施加容量上界、“VIP1/VIP2至少商务舱”需要在个体维度施加舱位下界、“员工跟随本地ABO”则在人与人之间建立联动。这些约束彼此牵制，其中任意一个局部的调整，都可能引发全局的连锁违例。

对以上客户需求进行深入分析，可以发现这个任务本质上属于运筹学中经典的调度难题：排班问题（Rostering/Scheduling）。排班问题通常具有一组必须要遵守的硬性约束条件，和一组弹性的约束条件，目标是要确保排班的质量。典型场景包括：

  * 医护排班：医院按法定工时、技能资质、连续值班限制、个人偏好等为护士/医生排班；
  * 机组与乘务排班（Crew Scheduling/Pairing）：航空公司在适航规则下为机组分配航段；
  * 客服/零售/制造班次：在覆盖需求、劳动法规与员工偏好之间求平衡；
  * 会议/差旅出行调度：类似本文中，大型头部旅行社所面临的场景。



对于排班问题，学术界已经证明其属于NP难（NP-hard）问题——这意味着随着出行人员与约束规模的增长，可行解空间会出现组合爆炸，不存在已知的多项式时间算法能对所有实例高效求解最优解。其困难来源正是“需要在众多彼此竞争的硬约束与软约束（法定上限、覆盖需求、个人偏好等）的同时满足并优化求解”。已知可能的求解方法包括数学上精确的求解法，以及使用分解方法的各种启发式算法、并行计算、随机优化、遗传算法、蚁群算法、模拟退火、量子退火、禁忌搜索以及坐标下降法等方法。

随着大语言模型（LLM）的发展，可以发现LLM擅长理解自然语言、抽取结构化信息、做开放式推理等，但是如果直接用LLM去”算”排班结果，则存在根本性的能力错配，实践中很难直接获得满意的求解结果。

因此，在“大规模集体出行任务”中，我们把LLM和运筹学求解器结合起来使用：将LLM用在它真正擅长的环节，即通过LLM把人类用自然语言写的匹配规则和杂乱的要求，理解并转化为结构化表示；而对“在约束下求最优解”任务则使用运筹学求解器算法完成。

### 3.2 多智能体的效率和稳定性

3.1节通过对客户需求数据的分析，使用LLM负责“读懂规则与要求”、使用求解器负责“算出合法且优化的方案”。要使这二者良好的协作，需要构建一个多智能体/多组件的系统结构。

分析“大规模集体出行任务”的行程分配与优化的处理链条，可以分拆出以下4个职责清晰、技术栈各异的”智能体/工序”：

  * 资源抽取智能体：从Excel中把人员、航班、联程、航司等信息抽取成结构化的JSON；
  * 规则抽取智能体：用LLM把自然语言匹配规则理解为结构化约束；
  * 求解智能体：用运筹学求解器在约束下求解最优排班；
  * 人工审核环节：业务专家在关键节点对数据进行核对、修正、审查。



这4个环节输入输出明确、可以独立演进、也可以独立失败重试。因此把它们拆成多个协作的智能体/任务，比塞进一个巨型Prompt或一段单体代码要更加清晰，非常适合Multi-Agent实现。

但是，业界常见的Multi-Agent实现，是让一个LLM Orchestrator（编排者）在运行时动态决定调用哪些子Agent、以什么顺序调用、传什么参数等等。这种“LLM编排LLM”的模式在探索性任务中有其价值，但用在“大规模集体出行任务”行程分配与优化这类有明确工序、需要稳定交付的生产流程上，会暴露出结构性的不足和问题：

[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/07/08/based-on-agentcore-harness-build-efficient-6.png>) [图6：LLM Orchestrator的不足和问题]  
---  
  
  * 流程不可控：整个业务流程的编排如果仅靠Orchestrator在运行时的”推理”，由于概率模型内在的不确定性，可能导致同样的输入走出不同的执行路径，以致流程无法被100%准确定义、无法被严格保证。对于需要合规、审计的企业级流程，这是不可接受的。
  * 出错时难以调试：当链路出错时，会发现问题有可能源自Orchestrator的错误决策、也有可能是子Agent的输出错误、或参数传递的语义偏差。由于编排过程本身是”黑箱推理”，缺乏明确的状态边界，定位、根因往往要反复回放整段对话，成本极高。
  * 失败即全盘重来，浪费 Token：传统编排通常把整条链路当作一次”会话”。一旦末端环节（如本例中的求解）失败或结果不满意，前面所有LLM抽取的成果（往往是Token 消耗的大头）会随会话一起作废，只能从头再跑一遍。每次整体的重复执行，对资源和算力都是巨大的浪费。
  * 处理速度慢：每一步编排决策都要经过一次LLM推理。Orchestrator在每个分支点都”想一想”，叠加上子Agent自身的推理延迟，就会导致端到端时延的升高且不稳定；而像本例中的”读Excel”、”跑求解”这种确定性工序，完全不需要为编排再付一次LLM的延迟与费用。
  * 中间无法稳定地人工审核与干预：“大规模集体出行任务”必须允许业务专家在“规则抽取后”、“资源确认后”等关键节点介入审核、修改、决定是否继续。但LLM Orchestrator的执行是一气呵成的推理流，缺乏可靠的、长时间的“暂停—等待人工—唤醒”机制，难以把人工确认真正嵌进流程里。



总结上面这五个问题可以发现：要使多智能体系统能真正高效、稳定、可人工审核的运行，单靠LLM Orchestrator是不够的。

**3.2.1 编排框架**

下面对市场上常见的多智能体编排框架进行调研、比较和分析。

  * Temporal



Temporal是一款开源的分布式状态管理与编排平台，开创了持久化执行（Durable Execution）范式。它允许开发者使用纯代码（Go/Python/TS等）编写复杂的业务工作流，无需依赖传统状态机。通过事件历史记录（Event History）机制，Temporal能在底层计算崩溃、超时或网络中断后，自动从确定的失败点精准恢复，天然具备强一致性、高可用与无限水平扩展能力，是工业级长时运行任务与微服务编排的核心利器。

  * AWS Lambda Durable Functions



AWS Lambda Durable Functions是AWS在2025年12月的re:Invent大会上发布的一项Serverless持久化执行特性。它允许开发者直接在Lambda中使用原生代码（Python/Node.js）编写长达一年的多步骤工作流与AI编排。该特性采用检查点与全量回放（Checkpoint & Replay）机制，当遇到wait()等挂起操作时函数会自动释放算力以消除闲置成本；被唤醒后则通过历史事件回放并跳过已完成步骤，从而在无须外部状态机的情况下实现透明的故障恢复与状态保持。

  * [AWS Step Functions](<https://aws.amazon.com/cn/step-functions/>)



AWS Step Functions是AWS提供的全托管声明式视觉工作流服务。它基于状态机（State Machine）模型，通过ASL（Amazon States Language）编排各种AWS服务。服务内置了强大的分布式事务管理能力，提供确定性的错误重试、条件分支、并行执行及长达一年的“Human-in-the-loop”人工审批机制。在AI时代，它更深度集成了[Amazon Bedrock AgentCore](<https://aws.amazon.com/cn/bedrock/agentcore/>)，能够将复杂的非确定性智能体推理包裹在高度稳定的工程化状态机中，是构建工业级、可观测多智能体应用与微服务架构的官方核心利器。

三者的核心维度横向对比如下：

维度 | Temporal | Lambda Durable Functions | AWS Step Functions  
---|---|---|---  
设计范式 | 代码即工作流  
(Python/TS/Go) | 代码即工作流  
(Python/Node.js) | 声明式状态机(Visual/ASL)  
底层恢复机制 | 状态事件历史追加  
（不回放代码） | 事件全量回放  
（从头Replay） | 状态机节点状态转移  
（天生幂等）  
AWS原生集成度 | 低  
（需自建或桥接） | 高  
（原生Lambda增强） | 极高（拥有Bedrock AgentCore专属优化步骤）  
可观测性 & 审计 | 极高  
（Temporal Web UI） | 中  
（需依赖SDK日志与CloudWatch） | 极高（可视化的分布式追踪+CloudWatch决策全审计）  
长时运行与人回路 | 支持  
（最长无限制） | 支持  
（最长1年，等待不收计算费） | 支持（最长1年，内置Human-in-the-loop）  
运维成本 | 高（需管理服务器/数据库或买商业版） | 低  
（按需Serverless） | 最低  
（全托管Serverless）  
  
【表1：多智能编排框架对比】

我们都知道，以前在Step Functions中要调用AI Agent，需要编写复杂的 Lambda函数来处理轮询和状态保持。所幸的是，根据AWS的最新公告（2026-06-03），AWS Step Functions已经与Bedrock AgentCore完成了深度整合，这次更新让Step Functions能够在工作流中直接编排和调度AI Agent。现在Step Functions提供了与AgentCore的原生优化集成，这样就可以直接在工作流中添加Agent推理节点了。也就是说可以实现一个全托管的Agent运行循环：AgentCore负责提供声明式的Agent配置（指定大模型、工具和行为），而Step Functions则直接调用这个托管环境，自动执行完整的Agent思考与行动循环（Agent Loop）。

同时，原有Step Functions的优点也可以完整复用，包括：

  * 可视化编辑器（Workflow Studio）：可以直接在Workflow Studio中快速创建和编辑Agent节点。
  * 混合编排能力：可以让多个AI Agent在同一个工作流中并行（Parallel）或串行（Sequence）运行，并完美结合Step Functions的分支判断、错误处理（Error Handling）以及人工审批（Human Approval）步骤，确保关键决策有据可查、有人把关。
  * 全链路日志：工作流的执行历史记录会完整保留Agent的输入、输出、Token使用量（Token Usage）以及执行耗时。
  * 下钻查看能力：日志中直接包含指向[Amazon CloudWatch](<https://aws.amazon.com/cn/cloudwatch/>)的链接，允许深入查看Agent内部每一次“思考-行动”的细节（Agent Turn Details），完美解决AI决策“黑盒”导致难以审计的问题。
  * 无额外集成费用：Step Functions部分依然按照标准的调用次数计费，不收取额外的集成手续费；AgentCore运行和模型推理则按照Bedrock和AgentCore的标准价格计费，无需要额外付费。



**3.2.2 AgentCore harness**

在Agent的运行环境（Runtime Environment）方面，我们选择[Amazon Bedrock](<https://aws.amazon.com/cn/bedrock/>) AgentCore harness，它是一个全托管的AI智能体编排与运行基础设施。AgentCore harness通过极简的API封装了复杂的底层架构，让开发者能快速开发AI智能体，并快速投入生产。

该服务还内置了浏览器沙箱、代码解释器、持久化记忆及AWS专家技能库Skill等，自动处理并发、隔离、存储和CloudWatch统一观测性，大幅降低了智能体从原型到生产环境的工程和运维成本。

[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/07/08/based-on-agentcore-harness-build-efficient-7.png>) [图7：Amazon Bedrock AgentCore harness]  
---  
  
AgentCore harness的核心特性与优势包括：

  * 极简开发：封装了复杂的底层架构，仅需两个API（CreateHarness定义，InvokeHarness 运行）即可快速启动。
  * 多模型切换：支持Bedrock、OpenAI、Gemini等主流模型，并允许在会话中途无缝切换模型且保留上下文。
  * 免代码集成工具：内置浏览器沙箱、代码解释器，并支持通过AgentCore Gateway或MCP轻松配置外部工具与API。
  * 内置记忆与专业Skill：自动管理跨会话的用户记忆，并提供AWS官方沉淀的专家Skill库（Git/S3/AWS专属能力）。
  * 高可靠与可优化：运行在独立的微虚拟机环境中，具备统一的CloudWatch观测性、A/B测试优化及“配置转代码”的灵活平滑迁移机制。



### 3.3 技术架构

按照客户需求，整个项目设计成一个云原生无服务器架构：

（1）用户上传通过Web界面上传Excel文件（包括出行人员、航班信息、匹配规则等），Web Lambda首先把它们存储到S3桶，再调用Step Functions进行后续处理。

（2）Step Functions中预先定义了核心业务处理流程的状态机。它首先调用Lambda抽取Excel中的结构化数据，如出席人员名单等，待用户人工核对并确认后，存储到S3桶中备用。再调用AgentCore harness使用LLM抽取Excel中的非结构化数据（如约束条件、需要联程的城市等） ，待用户人工核对并确认后，存储到S3桶中备用。最后调用运筹学求解器进行人员和资源的匹配。

（3）待匹配结束，用户可以从S3桶中下载匹配结果。如果发现其中任意步骤还需要再次确认，可以回到之前的状态和界面进行编辑和再次处理。技术架构图如图8所示。

[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/07/08/based-on-agentcore-harness-build-efficient-8.png>) [图8：技术架构图]  
---  
  
在这个技术架构中，我们结合了大语言模型LLM对于非结构化数据处理的优势，以及运筹学求解器对于复杂NP难问题的高效求解，通过Step Functions的新特性将它们串联起来，即保证了系统的运行稳定性，也便于人工编辑/审核和确认，并且解耦每个Agent运行的结果，提升系统效果、节约Token的用量。

同时，对于Excel中的结构化数据使用Lambda直接抽取，对于非结构化数据通过LLM抽取，也兼顾了文本处理的效率和LLM抽取的灵活性。

## **4\. 技术实现**

接下来从整体流程角度，概览“大规模集体出行任务”中行程分配的6个步骤；再分析Step Functions状态机的可循环有向图；然后通过源代码介绍AgentCore harness的构建和组织。

### 4.1 整体流程

从整体流程上看项目实现分为6个步骤。用户上传Excel定义文件后，进入（1）数据准备，抽取出结构性数据并写入S3；然后进入（2）约束抽取，通过AgentCore harness抽取非结构性数据；随后进入（3）等待用户确认约束信息和（4）等待用户确认资源信息；在用户确认后进入（5）运筹学求解器，从S3中获取信息进行求解，并展示匹配结果；最后一个步骤可以根据用户的人工审查情况回溯到（3）-（5），以满足用户个性化的需求，并且重用之前处理的结果。系统交互时序流程如图9所示。

[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/07/08/based-on-agentcore-harness-build-efficient-9.png>) [图9：交互时序图]  
---  
  
### 4.2 状态机

Step Functions状态机使用ASL定义，其拓扑是一个可循环的有向图，这种结构可以有效支持人工审查：当用户对于匹配结果不满意时，可以回溯到之前的步骤，并且能有效的复用这前处理的结果，具体如图10所示。

[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/07/08/based-on-agentcore-harness-build-efficient-10.png>) [图10：状态机：可循环的有向图]  
---  
  
Step Functions的引用不仅有效的解决了传统Multi-Agent实现中LLM Orchestrator编排的不稳定、效率低等问题，可循环有向图的设计还进一步提升了系统运行的弹性和鲁棒性：

（1）当结果不可行时系统也不会终止：即使求解器返回“INFEASIBLE”（无可行解），状态机也不会直接失败，而是写明状态后同样进入“决策等待”状态，让用户去放宽规则或调整资源后再次重试。这样有效避免了“一次算不出来就前功尽弃”的问题。

（2）用状态指回，实现业务循环：“CheckReviewDecision”在“action=loop”时把“Next”指回“WaitForConstraintReview”，形成一个环路，这样就实现了业务的重用和循环。同时，由于Standard工作流单次执行可长达一年、执行历史足够支撑成百上千轮人工迭代，这种循环在工程上充分满足了用户的需求。

### 4.3 核心代码

AgentCore harness自身跟AWS的许多服务都做了非常好的整合，使得开发过程非常便利。这里我们把跟业务相关的内容都抽象成SKILL.md，存储在S3桶中，便于统一管理和测试、拓展。在创建好harness后，再将对应的SKILL.md配置进去即可，核心代码如下：
    
    
    import time
    import boto3
    from pathlib import Path
    REGION = "us-west-2"
    PROJECT = "liam"
    ACCOUNT = boto3.client("sts").get_caller_identity()["Account"]
    BUCKET = f"{PROJECT}-scheduling-{ACCOUNT}"
    s3 = boto3.client("s3", region_name=REGION)
    ctl = boto3.client("bedrock-agentcore-control", region_name=REGION)
    HARNESSES = [
        ("liamExtractConstraints", "extract-constraints",
         "You are a Scheduling Constraint Extraction Expert. Please follow the instructions in SKILL.md to extract structured constraints from the provided rule table data and output JSON."),
        ("liamExtractConnections", "extract-connections",
         "You are a Connecting Flight Data Extraction Expert. Please follow the instructions in SKILL.md to extract connection information from the provided connecting flight table and output JSON."),
        ("liamExtractLcc", "extract-lcc",
         "You are a Low-Cost Carrier (LCC) Identification Expert. Please follow the instructions in SKILL.md to extract airline information from the provided LCC identification table and output JSON."),
    ]
    # Detailed extraction logic, output formats, and examples are all defined in SKILL.md and are not duplicated here.
    SKILLS_SRC = Path(__file__).parent.parent.parent / "liam3" / "skills"
    MODEL = "anthropic.claude-sonnet-4-6"
    def setup_harnesses():
        harness_ids = {}
        print("  Uploading SKILL.md files to S3...")
        for name, skill_dir, _ in HARNESSES:
            skill_src = SKILLS_SRC / skill_dir / "SKILL.md"
            if not skill_src.exists():
                raise FileNotFoundError(f"SKILL.md not found: {skill_src}")
            s3.upload_file(str(skill_src), BUCKET, f"skills/{skill_dir}/SKILL.md")
            print(f"  ✓ s3://{BUCKET}/skills/{skill_dir}/SKILL.md")
        # Create Harnesses
        for name, skill_dir, _ in HARNESSES:
            try:
                resp = ctl.create_harness(harnessName=name, executionRoleArn=HARNESS_ROLE_ARN)
                hid = resp["harness"]["harnessId"]
                print(f"  Creating {name} ({hid})...")
            except ctl.exceptions.ConflictException:
                hid = next(
                    x["harnessId"] for x in ctl.list_harnesses()["harnesses"]
                    if x["harnessName"] == name
                )
                print(f"  Exists: {name} ({hid})")
            harness_ids[name] = hid
        print("  Waiting for READY status...")
        for name, hid in harness_ids.items():
            for _ in range(20):
                if ctl.get_harness(harnessId=hid)["harness"]["status"] == "READY":
                    break
                time.sleep(5)
        # Configure Harness parameters
        for name, skill_dir, system_prompt in HARNESSES:
            hid = harness_ids[name]
            ctl.update_harness(
                harnessId=hid,
                model={"bedrockModelConfig": {"modelId": MODEL}},
                systemPrompt=[{"text": system_prompt}],
                skills=[{"path": f"s3://{BUCKET}/skills/{skill_dir}/SKILL.md"}],
            )
            print(f"✓ Harness configured: {name} → skill={skill_dir}")
        return harness_ids
    

## **5\. 运行分析**

在工作区域部署并运行程序，可以看到在Step Functions的加持下，“大规模集体出行任务”运行良好，顺利的产出了需要的结果，下面对结果做一个简要的分析。

### 5.1 总体分析

图11中给出的是一个3508人的出行计划，其中标识为“出席”且需要“公司安排”的一共2300人，使用航班54班。最终分配状态为“OPTIMAL”，成功分配2296人，其中4人由于资源不足未分配（原因见后文）。分配耗时53.95秒，所有分配的出行费用总计6,910,131元。

[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/07/08/based-on-agentcore-harness-build-efficient-11.png>) [图11：整体概况输出样例]  
---  
  
客户关注的费用汇总如图12所示，包括机票费、税费、国内联程的费用，最后计算出人均3009.64元。很好的满足了客户对方案经济性的需求。

[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/07/08/based-on-agentcore-harness-build-efficient-12.png>) [图12：费用汇总输出样例]  
---  
  
### 5.2 行程分配

具体的行程分配提供了“出境口岸”、“分配航班”、“分配舱位”、“机票价格”、“税费”、“联程费用”等，如图13所示。

[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/07/08/based-on-agentcore-harness-build-efficient-13.png>) [图13：分配结果输出样例]  
---  
  
同时，提供了航班机位的统计信息，包括“航班号”、“F/C/Y舱总机位”、“F/C/Y已分配”、“利用率”等。可以看到所有航班的利用率都不超过80%，满足客户在规则中的要求，如图14所示。

[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/07/08/based-on-agentcore-harness-build-efficient-14.png>) [图14：机位统计输出样例]  
---  
  
对于未能成功分配的乘客，给出单独的表格，并注明“未分配原因”，同时提出可能的优化建议，如图15所示。

[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/07/08/based-on-agentcore-harness-build-efficient-15.png>) [图15：未分配乘客输出样例]  
---  
  
## **6\. 应用场景**

本文以大型头部旅行的“大规模集体出行任务”行程分配与优化为场景，介绍了如何基于AgentCore harness和Step Functions构建一个高效、稳定的Multi-Agent系统。通过应用Step Functions的新特性，方便的整合了AgentCore harness，提升Token的使用效率、提高了系统的运行的稳定性，同时这种深度的整合也降低了开发与维护的成本，提升了整体系统的运营效率。在方案设计中，我们还结合了大语言模型LLM和运筹学求解器的长处，规避了各自的不足，进一步提升了整个系统的运行效率和稳定性。

这一方案的核心价值不仅在于提升了大规模集体出行中行程分配问题的自动化程度、节省了人力，更在于为企业打开了智能化的大门，随着企业智能化的深入，可以逐步提升出行的整体运营成本和运营效率。

该方案的架构思路同样适用于其他排班相关的处理场景，如零售行业、客户服务行业、制造业排班等。如果你正在面临类似的业务挑战，欢迎参考本文的实现思路，也期待与同行交流探讨。

## **7\. 参考引用**

  * [AgentCore harness](<https://aws.amazon.com/blogs/machine-learning/amazon-bedrock-agentcore-harness-is-now-generally-available-go-from-idea-to-production-grade-agent-in-minutes/>):
  * [Step Functions](<https://aws.amazon.com/about-aws/whats-new/2026/06/aws-step-functions-agentcore/>)：
  * [Nurse Scheduling Problem](<https://en.wikipedia.org/wiki/Nurse_scheduling_problem>):
  * [Temporal](<https://docs.temporal.io/develop>):
  * [Lambda Durable Functions](<https://docs.aws.amazon.com/lambda/latest/dg/durable-functions.html>):
  * [Step Functions as the Outer Loop for Long-Running AI Workflows](<https://builder.aws.com/content/3Bfg6PkDQJPTWMK4mdVicc2TtVY/step-functions-as-the-outer-loop-for-long-running-ai-workflows>)



## **8\. 相关链接**

**下一步行动：**

**相关产品：**

  * [Amazon Step Functions](<https://aws.amazon.com/cn/step-functions/?p=bl_pr_step-functions_l=1>) — 分布式应用程序的可视工作流
  * [AWS Lambda](<https://aws.amazon.com/cn/lambda/?p=bl_pr_lambda_l=2>) — 无需服务器即可运行代码
  * [Amazon Bedrock](<https://aws.amazon.com/cn/bedrock/?p=bl_pr_bedrock_l=3>) — 用于构建生成式人工智能应用程序和代理的端到端平台
  * [Amazon S3](<https://aws.amazon.com/cn/s3/?p=bl_pr_s3_l=4>) — 适用于 AI、分析和存档的几乎无限的安全对象存储
  * [Amazon Bedrock AgentCore](<https://aws.amazon.com/cn/bedrock/agentcore/?p=bl_pr_bedrock-agentcore_l=5>) — 加快代理投入生产的速度



**相关文章：**

  * [基于AgentCore构建自学习、可进化的文旅行业近似信息抽取Agents](<https://aws.amazon.com/cn/blogs/china/self-learning-evolvable-agents-for-cultural-tourism-info-extraction-with-agentcore/?p=bl_ar_l=1>)
  * [（上篇）基于 AWS Bedrock AgentCore 构建企业级航空客服智能体 —— 基于AIDLC方法从需求分析到生产部署的完整实践](<https://aws.amazon.com/cn/blogs/china/based-on-aws-bedrock-agentcore-build-enterprise-intelligent-based-on-aidlc-analytics-deploy-practice/?p=bl_ar_l=2>)
  * [航班变更信息智能识别解决方案](<https://aws.amazon.com/cn/blogs/china/flight-change-information-intelligent/?p=bl_ar_l=3>)
  * [AI Agent 如何为企业上云按下”加速键” —— CRM系统迁移实战](<https://aws.amazon.com/cn/blogs/china/ai-agent-how-to-enterprise-crm-system-migration/?p=bl_ar_l=4>)
  * [三剑合璧Quick Suite + Agent Core + Kiro联动实践：海外物流报价助手实战](<https://aws.amazon.com/cn/blogs/china/quick-suite-agent-core-kiro-logistics-quote-assistant/?p=bl_ar_l=5>)



*前述特定亚马逊云科技生成式人工智能相关的服务目前在亚马逊云科技海外区域可用。亚马逊云科技中国区域相关云服务由西云数据和光环新网运营，具体信息以中国区域官网为准。

## 本篇作者

### 刘黎明

西云数据解决方案架构师。10+年IT专业服务经验，积淀多行业项目实践，深耕AI/ML/Agent领域并落地技术架构设计。

### 刘营宇

西云数据解决方案架构师，主要负责基于AWS云计算的方案咨询和设计。15年软件研发、架构设计经验，擅长大型信息系统架构设计。

* * *

## AWS 架构师中心：云端创新的引领者

探索 AWS 架构师中心，获取经实战验证的最佳实践与架构指南，助您高效构建安全、可靠的云上应用 **[](<https://aws.amazon.com/cn/solutions/architect-center/>)**|   
---|---
