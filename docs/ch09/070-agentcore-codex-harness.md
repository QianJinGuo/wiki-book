# AgentCore + Codex：把平台能力和 Harness 职责切干净

> 📊 Level ⭐⭐⭐⭐ | 14.1KB

## 一句话结论

阿里云 AgentCore 官方给了一份"自定义 Harness + 托管平台"的端到端拼装方案：**平台提供身份、模型、工具、技能、凭证、存储、观测；Harness（Codex）只负责推理循环**。真正的贡献不是教程本身，而是七个**分层决策**——尤其是那句最硬的约束：**"凭证只保留在 Runloop 控制面，由 Runloop 代模型完成请求签名；模型、Codex 和执行 Worker 均不能读取密钥。"**

## 一、工具：平台编译，Harness 收口

- AgentCore 提供**资源元数据 + 数据面凭证**；
- **Harness 把资源编译成"会话级 MCP Tool Registry"**；
- **Codex 只连接 Runloop MCP Aggregator**，用标准 `tools/list` / `tools/call`；
- **"实际鉴权、HITL、路由和执行全部由 Harness 完成。"**

这条分层的意义在于：**模型看到的是一张扁平的工具清单，而权限、审批、路由都发生在它看不到的一层**。与 vivo 那篇"工具是业务动作协议"、速卖通"能力单入口暴露"完全一致——**聚合层是治理点，也是唯一需要模型理解的那一层**。

## 二、技能：不做成普通 Tool，而挂成"逻辑路径"

平台给 **Skill 元数据 + 受控下载入口**；Harness 负责**签名下载、安装到工作区并注入技能索引**；Codex **仅在任务匹配时渐进读取 `SKILL.md` 及附件**，由既有工具与沙箱执行其中操作——**"Skill 本身不作为普通 MCP Tool"**。

最有价值的实现细节在这儿：**Skill 包按版本持久化在 NAS/AgenticFS 的隔离目录，Harness 在每次运行时把它只读映射为统一的 `.agents/skills/` 逻辑路径**。于是 **Codex 始终用相对路径访问技能**——**解耦了物理存储、执行环境与 Skill 内部引用，同时降低路径冲突与越权访问风险**。

> 这是一个可迁移的模式：**物理位置随环境变，逻辑路径永不变**。技能、工作区、附件都能用同一招隔离。

## 三、存储：对象交换层 + 会话工作盘

| 层 | 介质 | 适合 | 不适合 |
|---|---|---|---|
| **会话工作盘** | NAS（**AgenticFS**，POSIX 语义） | 目录结构、随机读写、文件编辑、**原子改名**、大量小文件；代码检出、Git、依赖解压、中间结果 | — |
| **对象交换层** | OSS | 大对象、生命周期独立的文件：上传附件、只读输入、模型数据、最终 Artifact、跨系统交付 | **随机修改、目录操作、rename 不是它的优势** |

作者的判断很直接：**"默认不将 OSS FUSE 作为 Agent 的工作目录"**，并把分层压缩成一句——**"AgenticFS 负责过程产生数据及持久化，OSS 负责拿到结果展示给用户。"** 当前已做**用户粒度**内部文件隔离，未来才上更严格的沙箱级隔离（这点自我限定值得记）。

## 四、身份：三重上下文，凭证从不进上下文

作者开宗明义：**"Agent 身份是当前构建 Agent 被低估了的一项能力"**——"随着 Agent 进入生产以及进行商业化，可信性变为一种刚需"。Agent 身份是一组执行上下文：

| 维度 | 内容 | 作用 |
|---|---|---|
| **业务身份** | `uid`、租户、云账号 | **表示任务代表谁** |
| **执行身份** | `conversationId`、`runId` | 会话隔离与审计 |
| **资源身份** | 本次允许访问的工具、Skill、Sandbox、子 Agent | 权限边界 |

两处语义澄清很关键：**"用户身份和资源归属由可信网关校验；`uid` 只用于隔离和追踪，本身不是认证凭证。"** 云资源访问走**短期、最小权限的 STS 凭证**，绑定**账号、地域、资源范围、操作权限、有效期**。

而这段是全篇最该抄的设计：

> **"凭证只保留在 Runloop 控制面，由 Runloop 代模型完成请求签名；模型、Codex 和执行 Worker 均不能读取密钥。凭证不写入提示词、事件历史、日志或工作盘，过期后由上游重新签发，不回退使用永久 AK。"**

一句话覆盖四个泄露面（**提示词 / 事件历史 / 日志 / 工作盘**）+ 一条退路禁令（**不回退永久 AK**）。这是"Agent 拿不到密钥却能访问资源"的标准答案——**用代理签名替代凭证分发**。

## 五、观测：环境变量接入，不逐 span 埋点

只需配置 AgentLoop 上报参数，**"无需在业务代码中逐个创建 span"**，背后是自定义 OpenTelemetry 埋点。十项变量覆盖：配置来源（`env`/`agentcore`）、OTLP 地址（必须 HTTPS）、License Key（应存 Secret）、Project、Workspace、服务名、服务版本（建议用镜像 Tag 或 Git SHA）、部署环境、**是否采集 Prompt/回复/工具参数与结果**（`CAPTURE_CONTENT`）、AgentCore 模式下的凭据名。

## 六、多模态：文件驱动，而非原生 Content Block

文本走 AG-UI 直传；**图片、文档先被物化为工作区文件**，再由 Agent 用受控工具读取；PPT/图片/文档等生成结果以**文件产物**发布并在前端预览。链路六步：

```
前端选文件 / 粘贴剪贴板图片
→ /api/uploads 申请短期上传地址 → 直传 OSS
→ 服务端校验大小·类型·ETag，并校验附件属于当前用户与会话
→ 调用 Agent 前，适配层下载到隔离工作区 /workspace/uploads/<uploadId>/file.png
→ Runloop 转成 user.attachment 事件，把文件路径写入 Agent 上下文
→ Agent 按类型调 view_image / 文件读取 / 文档处理工具
```

作者对能力边界毫不含糊：**"当前实现本质上是'工具增强的文件多模态'，而不是把图片直接作为模型原生多模态 Content Block 发送。"** 换来的是结构上的干净——**Runloop 不访问 OSS、不签发上传凭证、不持有存储密钥，只消费"已物化且执行环境可访问的路径"**；而且**不依赖特定模型的原生图片协议**，能在不同 Agent CLI 与模型间保持一致的文件处理、安全隔离与产物交付。

## 七、性能实测

自定义 Codex 的典型 **TTFT ≈ 1.7 秒，P95 ≈ 1.95 秒**；**网关约 0.18 秒开始返回 SSE**——"主要耗时仍在模型首文本生成阶段"；20 个样本中**没有发现明显稳定性问题或严重长尾**。

## 八、落地清单（实践章节要点）

- **需开通**：AgentCore、AgentLoop、SLS、CMS、AgentIdentity、ACR（**需企业实例**）、RAM、FC、OSS、NAS（**需申请加白 AgenticFS**）；
- **镜像**：`agentcore-app-registry.cn-hangzhou.cr.aliyuncs.com/template-images/agentcore-runloop:v0.1.0`（或基于源码构建推 ACR EE）；启动 `node /app/agentcore-runloop/scripts/start.mjs`；
- **核心环境变量**：`AGENTCORE_MODEL_CONNECTION` / `AGENTCORE_MODEL_NAME` / `AGENTCORE_SKILLS` / `AGENTCORE_SYSTEM_PROMPT` / `AGENTCORE_MCP_SERVERS` / `AGENTCORE_WORKDIR`（→ AgenticFS）/ `AGENTCORE_ARTIFACT_ROOT`（→ OSS）；
- **知识库双向往授权**：执行角色需 `AliyunBailianDataFullAccess`，**且要在百炼页面给该角色授予数据操作权限**——只做一边会调不通；
- **多模态凭证**：识图默认 `qwen-vl-max`、生图默认 `qwen-image-plus`，可用 `AGENTCORE_IMAGE_VISION_MODEL` / `AGENTCORE_IMAGE_GENERATION_MODEL` 调整；密钥用 `DASHBOARD_API_KEY` 并**在百炼侧做最小粒度约束**（只允许这两个模型）防越权滥用；
- **源码**：`github.com/ai-agentcore/agentcore-runloop`、`github.com/ai-agentcore/agentcore-chat`。

## 深度分析

### 这篇的真正主题是"边界"，不是"教程"

通篇在回答同一个问题：**哪些东西该由平台管、哪些该由 Harness 管、哪些两者都不许碰**。工具由平台备料、Harness 编译成 Registry；技能由平台托管、Harness 挂成逻辑路径；存储分两层各司其职；凭证**谁都拿不到**，只有控制面能签名。**一个成熟的 Agent 平台，标志不是能力多，而是边界清。**

### "凭证不进上下文"是这代 Agent 安全的分水岭

把密钥塞进环境变量、再让模型用工具读它，是最常见的做法，也是最危险的做法——因为**提示词、事件历史、日志、工作盘四处都会漏**。这里的解法是**代理签名**：模型永远只发"逻辑请求"，由控制面持密钥签名。附带效果是**审计天然完整**（每次签名都是控制面的一个事件），且**不依赖模型自觉**。这与速卖通"不越域直调"、vivo"授权绑 Subject/Resource/Action"是同一族思路：**把权限从"给予"改成"代行"**。

### 逻辑路径映射：一个便宜但极强的隔离手法

`.agents/skills/` 这个统一逻辑路径，同时解决四个问题：**物理存储可换**（NAS/本地/容器都能挂）、**执行环境可换**、**技能内部引用不用改**、**路径冲突与越权可防**（只读映射 + 相对路径）。**它不依赖任何平台特性，任何自建 harness 都能立刻用**——这是本篇最容易被抄走也最该被抄走的一条。

### 文件驱动多模态，是"兼容性优先"的工程取舍

放弃原生 Content Block，意味着放弃部分模型原生的图文联合推理能力；换来的是**跨模型、跨 CLI 的一致行为**，以及**安全隔离与产物交付的统一**。这个取舍在平台侧是合理的——**平台要服务多家模型，就不能把命脉押在某家的协议上**。但要清楚代价：**图片理解质量取决于 `view_image` 工具与视觉模型，而不是主模型本身**。

### 1.7s / P95 1.95s 这组数说明"长尾被治住了"

TTFT 典型值与 P95 只差 0.25 秒、网关 0.18 秒就开始吐 SSE，说明**瓶颈在模型首文本而非平台链路**，且**没有严重长尾**——这对生产可用性比平均延迟更重要。20 个样本的规模很小，但足以说明"链路本身不是瓶颈"。

## 实践启示

1. **平台管能力，Harness 管理智**：身份/凭证/工具目录/存储/观测交给平台，推理循环与工具编排留给 harness。

2. **工具用聚合层收口**：模型只连一个 MCP Aggregator，鉴权、HITL、路由都在它下面——**模型看到的越简单，治理越集中**。

3. **技能不做成 Tool**：给元数据 + 按需渐进读取 `SKILL.md`，避免技能污染工具空间。

4. **技能/工作区用逻辑路径映射**：物理位置随环境变，`.agents/skills/` 这类逻辑路径不变——成本极低，收益很大。

5. **存储分两层**：POSIX 语义的会话盘放过程数据（代码、Git、中间结果），对象存储放交付物；**别拿对象存储当工作目录**。

6. **凭证永不进模型上下文**：控制面代签名，四处（提示词/事件历史/日志/工作盘）都不落，**过期重新签发，不回退永久 AK**。

7. **`uid` 不是认证凭证**：只用于隔离与追踪，归属校验交给可信网关。

8. **观测用环境变量接入**，别在业务代码里逐 span 埋点；把 `CAPTURE_CONTENT` 做成显式开关（涉及合规）。

9. **多模态走文件驱动**：上传 → 物化到隔离工作区 → 事件 + 路径 → 受控工具读取；平台不碰存储密钥。

10. **外部凭证做最小粒度约束**（只允许指定模型），防凭证滥用。

11. **看 P95 与首字节时间，不只看平均**：典型 1.7s 与 P95 1.95s 的接近程度才是稳定性证据。

## 与相关实体的关系

- AgentCore Managed Harness（AWS）、[AgentCore Harness](https://github.com/QianJinGuo/wiki-public/blob/main/entities/agentcore-harness.md) 是同期另一朵云的"平台托管 harness"思路；本篇是**阿里云版**，差异在于**Runloop 自持控制面代签名**与 **AgenticFS 会话工作盘**这两处具体机制。
- [阿里云 AgentCore 长程 Agent 解读（存档）](https://mp.weixin.qq.com/s/O6NdGGHP_rKAnH9PKrt6iQ) 讲平台的设计意图（连续·高效·主动·持久）；本篇是**同平台的可运行落地**（工具/技能/存储/身份/观测怎么接）。
- [vivo PM 视角 Harness 契约](https://github.com/QianJinGuo/wiki-public/blob/main/entities/vivo-pm-agent-harness-design-task-card-contract-2026-11-04.md) 的"工具九字段契约 + 授权绑 Subject/Resource/Action"与本篇"三重身份 + 控制面代签名"是同一问题的需求侧与平台侧答案。
- [天猫国际智能建场](https://github.com/QianJinGuo/wiki-public/blob/main/entities/tmall-intl-ai-venue-building-agent-harness-taobao-2026-11-04.md) 的"Tool Runtime 收口"与本篇"MCP Aggregator 收口"结构相同：**模型不直接触达业务系统**。
- Harness Engineering 提供概念框架；本篇是"harness 与平台如何分工"的具体案例。

→ [原文存档](https://mp.weixin.qq.com/s/truZRvXkzIj6ZZoCLQ_vOQ)

---

