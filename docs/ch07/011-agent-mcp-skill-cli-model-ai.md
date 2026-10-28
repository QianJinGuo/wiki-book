# Agent、MCP、Skill、CLI、Model 一次讲透：老系统接入 AI 的概念地图与三条路径

> 📊 Level ⭐⭐⭐ | 12.9KB

> **来源**：腾讯技术工程（腾讯程序员，作者 robinji，2026-10-12）| 原文存档：[原文存档](https://mp.weixin.qq.com/s?__biz=MjM5ODYwMjI2MA==&mid=2649804252&idx=1&sn=073e0806e5a950fae374c9e5f7a2a8b6)

这是一份面向企业 IT 团队的「概念对齐 + 落地路径」梳理：先回答 Agent/Skill/MCP/CLI/Model 五个概念谁调用谁，再回答跑了十年八年的老系统该从哪里切入 AI。场景是某大型整车集团研究院的「让 AI 深入老业务系统」课题——管理层没有说「上一套新的 AI 系统」，所以这本质是工程问题而非采购问题。

## 五概念关系：一支数字化团队

作者用「新入职团队」的隐喻把五个概念一次定死，避免了常见的能力混淆：

| 概念 | 团队角色 | 职责 |
|---|---|---|
| Model | 大脑 | 推理与生成引擎，有参数量/上下文/多模态属性，但碰不到数据库里的一行数据 |
| Agent | 数字员工 | 目标驱动闭环：感知→规划→行动→观察→再规划；**Agent 是一套系统，Model 只是它的部件** |
| Skill | 岗位技能手册 | 触发条件 + 操作流程 + 领域知识 + 工具清单，可版本管理的流程资产；与 Prompt 的区别是 SOP vs 随口叮嘱 |
| MCP | 万能转接头 | 开放标准协议，把任意系统（数据库/API/文件/设备）统一暴露给 Agent |
| CLI | 对讲机 | 既是工程师的高效操作，也是 Agent 的结构化调用通道 |

关键洞察是 **MCP 与 CLI 可嵌套**：一个 MCP Server 的内部实现常常就是封装了一个 CLI（最小样本是把 git bash 包成 MCP Server），Agent 只看到 MCP 标准外壳，背后是 CLI、API 还是脚本并不重要。作者给出传统软件到 AI 世界的映射表：微服务→Agent、OpenAPI/REST→MCP、内部 Wiki/SOP→Skill、SDK/命令行→CLI。

一次工具调用的完整接力（以「查上周请假记录」为例）：用户在 CLI/对话入口说目标 → Agent 交给 Model 规划 → Model 判断需要 HR 系统、手册里有标准流程 → Agent 加载对应 [Skill](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/skill-engineering-principles.md) → 通过 [MCP](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/model-context-protocol-mcp.md) 协议调用请假销假 MCP Server → Server 再调老系统 REST API → 结果沿原路逐层返回。

## 老系统接入的三条路径

作者明确说「没有银弹」，先体检四个维度：API 开放程度、文档完整性、鉴权体系、变更风险承受度，再走决策树：

1. **API 封装为 MCP（首选）**：系统有开放 API 时，前面加一层 MCP Server 薄封装。改动最小、最稳定、可灰度。唯一纪律是封装层只做协议转换，不碰业务逻辑。
2. **CLI 包装（次选）**：没有 API 但有命令行/运维脚本时，把脚本封装成结构化 CLI，外面再包 MCP。技术要求是 CLI 输出必须结构化（最好 JSON），Agent 才消费得动。
3. **浏览器自动化 / RPA（兜底）**：只剩网页界面时模拟人操作。能用但脆，页面改版即失效，是过渡方案而非终态。

三条路按优先级从上到下，改造深度递减、脆弱性递增。

安全部分作者泼了冷水：Agent 代人操作系统时，身份如何从用户传到 Agent 再传到系统、权限如何最小化、操作如何审计、敏感动作要不要人工确认，行业还没有通用标准方案，必须一案一议——「谁跟你打包票说有现成方案，谁就没干过企业级落地」。排序方法是用「使用频次-业务价值」四象限，从高频、低风险、有 API 的系统先动手，理由是第一场仗必须赢且赢得便宜。

## MCP 实现形式的常见误读

客户以为 MCP 有 stdio、HTTP、SSE 三种实现，「对，但不全对」：MCP 官方规范只有两种标准传输方式——**stdio 与 Streamable HTTP**；SSE 已属旧的 HTTP+SSE 传输方式，Streamable HTTP 是其后继而非并列第三种。这个细节在很多中文技术文章里被写错，直接影响老系统封装层选型。

## 与既有实践的关系

本文的价值不在新技术，而在**把企业落地时的概念混乱收敛成一张可操作的地图**：Agent/Skill/MCP/CLI 的层级与嵌套关系、三条改造路径的优先级、以及「安全一案一议」的诚实边界。它与 [MCP/CLI/Skill 连接栈实践](https://github.com/QianJinGuo/wiki-public/blob/main/entities/production-ai-agents-mcp-cli-skills-stack-ayi.md) 属同一主题族，但角度不同：前者讲「工具该选哪个」，本文讲「老系统该怎么被一层层包出来」。企业侧落地还应结合 [企业 AI 落地](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/enterprise-ai-adoption.md) 的组织与流程前置条件。

## 深度分析

### 五个概念的边界，与三种高频错配

团队隐喻定死的是**职责而非能力**：Model 只负责想，碰不到数据库里的一行数据；Agent 是感知—规划—行动—观察的闭环系统，Model 只是它的部件；Skill 管「会」，MCP 管「接」，CLI 管「说」。 边界一混，就会出现三种错配。

**把 Skill 当集成层**：在 Skill 里写死接口地址、鉴权、重试，它就从「岗位手册」退化成隐式脚本，老系统换个端点，同族 Skill 一起失效。Skill 该描述「先查余额、再校验额度、最后提交」这类意图序列，接口细节归 MCP 层。

**把 MCP 当业务 API**：把审批链、额度计算、状态机塞进 MCP Server。原文纪律只有一条——封装层只做协议转换，不碰业务逻辑。 代价是同一份规则两处各存，静默分叉直到对账不平才暴露。

**把 CLI 当临时手段**：把输出人读表格的脚本直接丢给 Agent，模型解析不了，只好在提示词里做正则。

还有一层常被漏掉：CLI 与 MCP 是嵌套而非并列——一个 MCP Server 的内部实现常常就是封装了一个 CLI。 「要不要上 MCP」与「底层用什么执行」是两个独立决策。

### 三条路径：同一种模式的三次降级

三条路表面是技术选型，实际是同一动作在三种「契约可得性」下的降级：把老系统能力收敛成可被描述、可被代理调用的契约。API 已有契约，加薄封装即可；CLI 要人造契约，把输出结构化；RPA 只有像素，只能模拟人，因而最脆。

但四维度体检问的其实是同一件事：这份契约能否被安全、稳定地代理。答案决定走哪条路，而非「要不要做 AI」。

成本与可控性并不单调：API 路径工程成本最低，但组织成本最高——要老团队愿意开放接口并承诺兼容；CLI 绕开接口评审，把成本转到格式治理；RPA 起步最便宜，却把稳定性寄托在别人的页面上。

### CLI 为什么是老系统最便宜的胶水层

便宜首先因为它是沉没成本：老系统旁边早有运维脚本、批处理、客户端 SDK，只是没人当它们是接口；包成结构化 CLI，不改一行代码，也不必走接口评审。

其次它是进程级契约（参见 [为什么 Agent 时代大家都在做 CLI](https://github.com/QianJinGuo/wiki-public/blob/main/entities/why-cli-agent-era-alibaba-tech.md)）：stdin/stdout 加退出码，天然可观测、可重放、可审计，也是 PLM 案例「沿用客户端已有登录态」能成立的原因——同机部署，身份不必重新发明。

代价是 CLI 对人友好、对模型不友好。前提是三条约束——JSON 且字段稳定、退出码区分「业务失败」与「执行失败」、提供 dry-run 让 Agent 先看后做。原文只说「最好 JSON」，但仅 JSON 不够：没有语义化退出码，Agent 判断不了该重试还是该上报。

### MCP 的三层误读：传输、部署形态、tool 粒度

第一层传输：以为有 stdio、HTTP、SSE 三种，实际官方标准只有 stdio 与 Streamable HTTP，SSE 自 2025 年 3 月起被取代。 后果不是功能不可用，而是上生产后才被迫迁移。

第二层部署形态：Gateway、Proxy、托管 MCP 常与传输方式混为一谈（见 [AI 网关与 MCP 网关](https://github.com/QianJinGuo/wiki-public/blob/main/entities/ai-gateways-vs-mcp-gateways-what-security-teams-need-to-know.md)），实际只是部署架构——MCP 传输无关，变的只是消息怎么跑腿。 混掉的后果是把网关的鉴权、限流、审计误当协议特性，在每个 Server 里重复实现。

第三层 tool 粒度，原文未展开却最致命：一个系统一个 tool，参数成巨型对象，模型选不准也填不对；按 REST 端点逐个映射，上下文膨胀、失败点变多。合理粒度是**按业务意图切**——查余额、提申请、撤申请各一个 tool，而非按 URL 切。粒度错了封装层会被反复重写，等于把耦合原样搬到 Agent 侧。

### 与中台、网关治理的关系：不是替代，是加一层代理

映射表是全文最省事的判断工具：微服务→Agent、OpenAPI→MCP、Wiki/SOP→Skill、SDK/命令行→CLI。 AI 层不是新架构，只是既有架构图上换了一层内容，由此有两条接口约定。

其一，MCP Server 应挂在既有 API 网关之后：网关管流量、限流、WAF、审计留痕，MCP 管协议转换与工具描述。把鉴权写进 MCP Server 是最常见的重复建设。中台的服务目录则是 MCP tool 清单的天然来源，新增工作量只在「给模型看的描述」——tool description、参数语义、失败语义、幂等声明。

其二，治理上真正的新增项是**代理身份**（[Agent 身份可移植性](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/agent-identity-portability.md)）：用户 → Agent → 系统的三段式传递，既有 IAM 里没有对应物，权限最小化与敏感动作确认也无通用方案。

## 实践启示

1. **先出体检表，再谈选型。** 按四维度给每个系统打分，输出「可走哪几条路」而非「要不要上 MCP」；选型是体检的结论。
2. **把「封装层只做协议转换」写成验收条件。** MCP Server 里出现业务判断、额度计算、状态机分支一律打回，规则回流老系统。
3. **CLI 路径先定输出契约。** JSON schema、语义化退出码、dry-run 三项齐备再谈接入；缺一项，失败处理就只能靠猜，重试策略会变成事故放大器。
4. **传输按部署形态选，不按文章热度选。** 本地 stdio，企业共享 Streamable HTTP 加 OAuth，SSE 只做迁移，WebSocket 留给实时与浏览器桥接。
5. **身份与审计进第一版计划。** 三段式身份、最小权限、敏感动作确认、全量留痕，行业无标准答案；列为「上线前再补」的多半补不上。
6. **首战按「频次 × 价值」选，并给 RPA 写退出条件。** 从高频、低风险、有 API 的系统切入，同时约定兜底方案被替换的触发条件，避免它沉淀成新的遗留系统。

## 关联

- [Model Context Protocol (MCP)](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/model-context-protocol-mcp.md)
- [Skill 工程原则](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/skill-engineering-principles.md)
- [企业 AI 落地](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/enterprise-ai-adoption.md)
- [生产级 AI Agent 的 MCP / CLI / Skill 连接栈](https://github.com/QianJinGuo/wiki-public/blob/main/entities/production-ai-agents-mcp-cli-skills-stack-ayi.md)
- → [原文存档](https://mp.weixin.qq.com/s?__biz=MjM5ODYwMjI2MA==&mid=2649804252&idx=1&sn=073e0806e5a950fae374c9e5f7a2a8b6)

---

