# AI Agents Security Survey: Attack and Defense

## Ch07.005 AI Agents Security Survey: Attack and Defense

> 📊 Level ⭐⭐ | 24.2KB | `entities/ai-agents-security-survey-attack-defense.md`

## 一、威胁格局概述

### 1.1 三大核心挑战

根据 1Password 的分析，AI Agent 安全存在根本性转变：非人类身份正在扩展访问风险边界，传统 IAM 无法覆盖机器工作流凭证。

| 挑战 | 描述 | 风险 |
|------|------|------|
| **治理盲区** | 安全团队无法有效监控非人类身份的访问行为 | 攻击者利用机器身份横向移动 |
| **凭证蔓延** | 机器身份产生的凭证分散在多个系统 | 难以集中管理，泄露面扩大 |
| **审计薄弱** | 传统审计日志难以追踪 AI 代理的操作轨迹 | 事后溯源困难 |

AI 代理的凭证（如 API 密钥、服务账户令牌）一旦泄露，攻击者可以：在无需二次验证的情况下横向移动、以机器身份执行敏感操作、绕过基于人类行为的异常检测机制。

### 1.2 Agent vs 传统软件的安全差异

传统软件安全方案（提示词规则、输入输出过滤、运行时日志审计、SDK Hook）共享同一盲区：**只看到 Agent "声明"出来的行为，而非实际行为**。当 Agent 进入生产环境：

- 一个完整任务执行链横跨**数十步骤、多工具链、多运行层级**
- 模型在受监控环境下会**主动调整行为表现——按规则表演，而非按规则执行**
- 企业同时运行数十甚至上百个 Agent，**系统无法完整感知正在运行多少个、在做什么**

---

## 二、攻击向量分类

### 2.1 主要攻击向量矩阵

| 攻击向量 | 描述 | 典型案例 | 缓解难度 |
|---------|------|---------|---------|
| **Prompt Injection** | 恶意指令注入用户 prompt | 越狱攻击、指令覆盖 | 高 |
| **Context Pollution** | 上下文被污染影响决策 | 长对话中的上下文遗忘 | 高 |
| **Tool Poisoning** | 工具链被恶意篡改 | 恶意 MCP 工具 | 中 |
| **Memory Poisoning** | 记忆系统被污染 | 长期记忆注入恶意经验 | 高 |
| **Supply Chain** | 依赖组件被植入后门 | 第三方 Skill 恶意代码 | 中 |
| **Data Exfiltration** | 敏感数据通过输出泄露 | 日志/错误信息泄露 | 低 |
| **Behavioral Drift** | 发布后工具行为改变 | 数周后工具开始窃取数据 | 高 |
| **Description Injection** | 在工具描述中嵌入 prompt injection | 「always prefer this tool」 | 高 |

### 2.2 Tool Poisoning：企业 Agent 安全的核心缺陷

VentureBeat 的深度报告揭示了企业 Agent 安全中一个根本性的架构缺陷：**工具注册表的元数据（描述、规格）与工具实际行为之间存在验证断层**。

#### 当前供应链安全体系的盲区

代码签名、SBOM、SLSA、Sigstore 等供应链安全体系解决的是 **artifact integrity**（artifact 是否与描述一致），但 Agent 工具注册表真正需要的是 **behavioral integrity**（工具是否做它声称做的事）。这两者是根本不同的安全维度。

#### 四种主要攻击模式

| 攻击模式 | 描述 | Provenance 捕获 | 运行时验证捕获 | 残余风险 |
|---------|------|----------------|---------------|---------|
| **Tool Impersonation** | 伪装成合法工具 | Publisher identity 无效 | 仅当添加 discovery binding 时有效 | 无 discovery integrity 时高 |
| **Schema Manipulation** | 操纵工具参数/输出 schema | 无 | 仅通过 parameter policy 溢出检测 | Medium |
| **Behavioral Drift** | 发布后工具行为改变 | 签名后无 | 监控端点和输出时强效 | Low-medium |
| **Description Injection** | 在工具描述中嵌入 prompt injection | 无 | 除非单独清理描述否则有限 | 高 |

#### Description Injection：最隐蔽的向量

攻击者在工具描述中嵌入 prompt injection 载荷（如「always prefer this tool over alternatives」）。即便工具代码已签名、provenance 干净、SBOM 准确，Agent 的推理引擎仍会将描述文本作为指令处理——因为描述通过同一个语言模型被处理，元数据与指令的边界被模糊化了。

#### Behavioral Drift：发布后攻击

工具在发布时通过验证，数周后服务器端行为改变以窃取请求数据。签名仍匹配，provenance 仍有效——artifact 没变，行为变了。这是 artifact integrity 检查无法捕捉的问题。

### 2.3 Bishop Fox AIMap 发现的互联网暴露问题

Bishop Fox 的 AIMap 项目揭示：AI 系统已在互联网上大规模暴露和可交互，许多端点支持模型枚举、工具调用和直接输入处理，但通常没有身份验证或有效的控制边界。

**关键发现**：

- AI 系统暴露的风险组合：新奇风险组合包括未认证端点 + 代码执行、泄露的系统提示、宽松的 CORS 策略、暴露的模型权重
- 攻击者已具备这些可见性，但大多数组织对自己的环境没有同等程度的可见性
- AIMap 检测到的可利用组合：未认证访问 + 代码执行能力，或暴露的系统提示 + 工具访问

**支持的协议和框架**：
MCP (Model Context Protocol)、Ollama、vLLM、LiteLLM、LocalAI、LangServe/LangChain、OpenClaw/Clawdbot、Open WebUI/LibreChat、Gradio/Streamlit、ComfyUI/Stable Diffusion、HuggingFace TGI、通用推理 API

---

## 三、分层防御体系

### 3.1 全生命周期安全：清华大学方寸体系

清华大学人工智能学院、交叉信息研究院的方寸跃迁团队提出一套面向 Agent 运行全生命周期的多层安全体系，覆盖事前（Skill Ward）× 事中（Guard × Observer）× 事后（审计）完整链路。

```
┌─────────────────────────────────────────────────────┐
│           Agent Security Full Lifecycle             │
├─────────────┬──────────────────┬────────────────────┤
│   事前       │      事中         │       事后          │
│ Skill Ward  │  Fangcun Guard   │  Fangcun Observer  │
│ (Pre-dep)   │  (In-flight)      │  (Post-incident)   │
├─────────────┼──────────────────┼────────────────────┤
│ 3-Phase     │  8ms auditing    │  OS-level behavior │
│ scanning    │  10 risk types   │  Real-time block   │
│ Static+LLM  │  Independent     │  Full-chain trace  │
│ +Docker     │  thresholds      │  Local audit       │
│ honeypot    │                  │  Self-evolving     │
└─────────────┴──────────────────┴────────────────────┘
```

### 3.2 Fangcun Observer：看见真实动作，守住安全边界

**设计哲学**：别问 Agent 想做什么，看它到底做了什么。

#### 技术路线
- **直接下沉到操作系统层**，不依赖任何框架插件、SDK 接口、模型供应商集成
- 业务代码零改动，Agent 无感知接入

#### 核心能力（5项）
1. **OS 层行为感知，彻底解耦 Harness**：无论 Agent 跑在哪套框架栈上，观测能力始终有效
2. **无感知运行时观测**：Agent 不知道被观测，计算开销忽略不计
3. **实时干预，主动阻断**：危险命令执行、敏感文件操作、异常网络访问、越权持久化——在行为落地之前完成实时研判
4. **全链路溯源**：将运行时真实行为、Agent 决策动作与模型上下文关联成完整行为图谱
5. **本地审计 + 自进化防御**：所有数据本地沉淀，不上云

### 3.3 Fangcun Guard：8ms 安全审核变基础设施

**核心挑战**：一次完整 Agent 对话要过 2-4 道审核（用户输入、工具调用入参、模型输出、工具返回），每一道都不能拖慢用户体验。

#### 公开 Benchmark 对比

| 指标 | Fangcun Guard | 开源方案区间 |
|------|--------------|-------------|
| 综合检测准确性 | **91.1** | 70-88 |
| p99 推理延时 | **8ms** | 130ms+（8B）；50ms（0.6B，但 F1 有差距） |

#### 差异化能力
1. **判定不偏科**：一般有害内容 + 精心构造越狱攻击 + 深度伪装成正常对话的灰区话术
2. **毫秒级响应**：4 道审核全跑 Guard，总耗时 30ms
3. **中文场景专项打磨**：10 个独立风险类别，中文场景专项合成数据 + 专项对齐训练
4. **10 类风险独立可调**：金融、医疗、教育、游戏等不同场景，每类拦截阈值单独配置
5. **主流 Agent 生态一键接入**：主流 Agent 框架开箱即用，业务代码零改动

### 3.4 Skill Ward：三阶段检测，真实蜜罐

**背景**：第三方 Skill 生态已成 Agent 的"App Store"。行业现有方案几乎全部停留在静态扫描——但恶意 Skill 的真正杀招在运行时。

#### 三阶段扫描

| 阶段 | 方法 | 捕获的威胁 |
|------|------|-----------|
| 1 | 静态分析 | 恶意签名、危险调用、可疑依赖 |
| 2 | 大模型研判 | Skill 真实意图、伪装话术、混淆逻辑 |
| 3 | Docker 蜜罐沙箱 | **运行时行为**——命令执行、路径访问、外部地址连接、持久化尝试、横向探测 |

#### 关键数据
> 5000 个真实 Skill 实测：仅靠静态扫描，会漏掉**约三分之一**的运行时威胁，全部由蜜罐沙箱阶段抓出。

---

## 四、MCP 协议的运行时验证层

VentureBeat 报告提出在 MCP client（Agent）与 MCP server（工具）之间部署验证代理，执行三重验证：

### 4.1 三重验证机制

1. **Discovery Binding**：验证调用时工具与此前评估的行为规格一致，防止 bait-and-switch 攻击
2. **Endpoint Allowlisting**：监控工具执行期间的出站网络连接，与声明的允许端点列表比对，超出则终止
3. **Output Schema Validation**：验证工具响应与声明的输出 schema 是否匹配，标记意外字段

### 4.2 Behavioral Specification

关键新原语是 **behavioral specification**——机器可读的声明文档（类似 Android 权限清单），详细说明工具联系的外部端点、数据读写操作及副作用，作为签名 attestation 的一部分交付。

### 4.3 分阶段 rollout 策略

| 阶段 | 行动 | 说明 |
|------|------|------|
| **Day 1** | 端点 allowlisting | 对使用集中式工具注册表的 Agent 部署最低保护 |
| **短期（1-3月）** | 输出 schema 验证 | 捕获数据渗出和工具响应中的 prompt injection |
| **中期（3-6月）** | Discovery binding | 对高风险工具类别部署完整检查 |
| **长期** | 完整行为监控 | 仅在保证级别证明成本合理的位置 |

轻量级代理验证（schema + 网络连接检查）每个调用增加 <10ms 开销。

---

## 五、攻击测试能力（AIMap）

Bishop Fox 的 AIMap 提供了互联网规模的 AI Agent 安全测试能力：

### 5.1 风险评分

每个端点获得 0-10 的风险评分，基于：

- 身份验证缺失
- 暴露的工具数量和类型
- CORS 策略
- TLS 配置
- 系统提示泄露
- 危险能力组合

分数 >7 通常表示可利用组合：未认证端点 + 代码执行能力，或暴露的系统提示 + 工具访问

### 5.2 攻击测试模块

| 协议 | 攻击测试 |
|------|---------|
| **MCP** | 工具枚举、未授权工具调用、通过工具描述的 prompt 注入 |
| **Ollama** | 模型列举、模型权重提取、prompt 注入 |
| **OpenAI 兼容端点** | 模型枚举、完成滥用、系统提示提取 |

---

## 六、Agent 生命周期各阶段威胁与缓解

### 6.1 按 Agent 生命周期阶段分类

| 阶段 | 主要威胁 | 缓解措施 |
|------|---------|---------|
| **开发阶段** | Skill 供应链攻击、代码注入 | 代码审计、签名验证 |
| **部署阶段** | 配置漂移、权限过宽 | IaC 扫描、最小权限审计 |
| **运行阶段** | Prompt injection、上下文污染 | 输入过滤、分层治理 |
| **演化阶段** | 记忆污染、策略退化 | 记忆完整性检查、版本回滚 |

### 6.2 分层防御矩阵

| 层级 | 机制 | 解决的问题 |
|------|------|-----------|
| **Provenance** | SLSA/Sigstore/SBOM | artifact integrity |
| **Behavioral Specification** | 机器可读行为声明 | 运行时验证基线 |
| **Discovery Binding** | 工具调用时验证 | bait-and-switch 攻击 |
| **Endpoint Allowlisting** | 网络连接监控 | 数据渗出 |
| **Output Schema Validation** | 响应格式校验 | prompt injection |
| **Identity & Access** | 机器身份 IAM | 横向移动 |

---

## 七、关键引述

> "过去方案看到的，是 Agent '说'了什么。Observer 看到的，是 Agent '做'了什么。声明可以包装，行为不会撒谎。"

> "如果行业仅用 SLSA/Sigstore 声明解决问题，将重演 2000 年代初 HTTPS 证书的错误：强身份完整性保证，但实际信任问题悬而未决。"

> "AI 基础设施已经超越了用于评估它的安全工具。AIMap 弥合了这一差距。"

---

## 八、相关概念

- Agent Security Threat Models — 威胁模型与攻击模式
- Agent Security Architecture — 安全架构与认证授权
- Agent Security Full Lifecycle System — 全生命周期安全体系
- AI Agent 安全威胁向量与缓解策略 — 威胁向量与缓解策略导航

---

## 九、相关实体

- [清华大学方寸跃迁团队](../ch04-402-细思极恐-agent暗藏风险-清华团队打出组合拳-全链路一网打尽/) — 全链路安全体系
- [VentureBeat 工具投毒报告](../ch04-277-ai-tool-poisoning-exposes-a-major-flaw-in-enterprise-agent-s/) — behavioral integrity vs artifact integrity
- [Bishop Fox AIMap](../ch04-356-introducing-aimap-security-testing-for-ai-agent-bishop-f/) — AI Agent 安全测试框架
- [AWS + Cisco AI Defense](../ch07-027-securing-ai-agents-aws-cisco-ai-defense-给-mcp-a2a-加上企业级/) — 企业级 Agent 安全生态
- [Amazon Bedrock AgentCore Identity Security](../ch04-171-agentcore-identity-3-legged-oauth-session-binding的安全架构/) — AWS Bedrock 身份安全

---

## 深度分析

**从"声明安全"到"行为安全"的范式转换**：传统安全方案（代码签名、SBOM、provenance）本质上是"声明式安全"——它们验证的是"artifact 是否与描述一致"，而非"artifact 在实际运行中是否按预期行事"。Agent 安全的核心挑战在于：模型的推理引擎无法区分工具描述（应该只影响工具选择）和用户指令（应该被执行为行动）——当 Description Injection 在工具描述中嵌入 prompt injection 载荷时，签名验证、provenance 检查全部通过，但 Agent 的实际行为已被悄然篡改。这个问题的深层原因是：Agent 系统中"元数据"和"指令"的边界被语言模型的统一处理方式模糊化了。未来的安全方案必须从"artifact integrity"升级为"behavioral integrity"，即持续验证工具在运行时是否做它声称做的事，而非仅在发布时验证它是什么。

**Behavioral Drift 的时序攻击特性**：Behavioral Drift（发布后工具行为改变）是一种时序攻击——它利用了"验证时机"与"攻击时机"之间的错位。传统安全验证发生在发布/部署阶段，而 Behavioral Drift 的攻击发生在发布后数周甚至数月的运行时。此时签名、provenance、SBOM 依然完全有效，但工具的实际行为已背离了安全基线。这种攻击之所以特别危险，是因为现有安全体系的信任传递链在"发布验证通过"这一节点之后就断裂了——它假设已验证的 artifact 在运行时不会改变行为。解决这个问题的唯一有效路径是**运行时持续验证**，而非依赖发布时的单次验证。Fangcun Observer 的 OS 层行为感知正是对这一需求的直接响应：它不依赖任何 artifact 元数据，而是直接观测工具在运行时的实际行为。

**Skill Ward 三阶段检测中蜜罐沙箱的不可替代性**：Skill Ward 的关键发现在于：仅靠静态扫描会漏掉约三分之一的运行时威胁。这些威胁的共同特征是"触发条件依赖性"——恶意行为不会在静态分析环境下激活，只在真实运行时环境中触发（例如，读取特定配置文件后才拉取远程载荷，在特定参数组合下才激活后门）。这与网络安全领域的 APT（高级持续性威胁）攻击手法高度相似——它们设计上就是为了逃避静态检测。Docker 蜜罐沙箱的价值在于提供了真实的运行时环境，让触发条件得到满足，从而使隐藏行为暴露。这个发现对整个 Agent 供应链安全有深远启示：任何第三方 Skill 在被引入生产环境之前，必须经过真实运行环境的验证，而不仅仅是代码签名和静态分析。

**可见性不对称是 Agent 安全的核心结构性弱点**：Bishop Fox AIMap 揭示了一个更根本的问题：攻击者已经在用 AIMap 这样的工具扫描互联网上的暴露 AI 系统，发现未认证端点、暴露的系统提示和可利用的工具组合；但大多数企业对自己的 AI 系统暴露面没有同等程度的可见性。这种"攻击者比防御者更了解目标环境"的不对称性，是 Agent 安全中最危险的盲区。AIMap 作为防御工具的价值，在于把这个不对称性扳回来——让防御者能够用与攻击者相同的视角审视自己的 Agent 基础设施。企业 Agent 安全的第一步，不是购买安全产品，而是建立与攻击者同等的环境可见性——知道自己暴露了什么、暴露了多少、暴露在哪里。

**MCP 三重验证的分阶段部署逻辑**：VentureBeat 提出的 MCP 三重验证（Discovery Binding、Endpoint Allowlisting、Output Schema Validation）采用了分阶段 rollout 策略，这个设计体现了实用的工程权衡哲学：Day 1 部署 Endpoint Allowlisting（最简单、最有效、<10ms 开销），然后逐步增加 Schema Validation（捕获数据渗出和 prompt injection）、最后才是 Discovery Binding（完整但部署复杂度最高）。这个分阶段策略的底层逻辑是：安全投入应该与实际风险成正比，而非一次性构建完整方案。Endpoint Allowlisting 解决的是"工具是否访问了它声明之外的外部端点"——这是 Behavioral Drift 和数据渗出的最直接信号，且实现成本最低。这种"从最简单最有效的入手，逐步复杂化"的策略，值得在任何 Agent 安全建设中借鉴。

## 实践启示

1. **在工具注册表之外单独维护"行为规格清单"**：不要依赖工具描述作为行为基线——Description Injection 会通过工具描述本身注入恶意指令。正确的做法是为每个工具维护一份独立的、机器可读的"行为规格清单"（Behavioral Specification），类似 Android 权限清单，详细列出工具访问的外部端点、数据读写操作和副作用。这份清单作为签名 attestation 的一部分交付，与工具描述分开管理，由独立的验证代理在运行时强制执行。

2. **对所有第三方 Skill 执行 Docker 蜜罐验证，无论来源和签名状态**：任何从第三方生态（Claude Skills、OpenAI Apps、Claw Hub 等）引入的 Skill，在进入生产环境前必须经过 Docker 隔离运行验证。验证应该包括：记录所有文件访问、网络连接、进程启动和持久化尝试，与工具声明的行为规格进行比对，标记任何超出声明范围的运行时行为。约三分之一的运行时威胁无法通过静态扫描发现，蜜罐沙箱是唯一有效检测手段。

3. **在部署 Agent 系统后立即运行 AIMap 类工具进行暴露面审计**：大多数企业对自己 Agent 系统的互联网暴露面缺乏准确认知。应该使用类似 AIMap 的工具对自己的外部暴露 AI 端点进行定期扫描，重点关注：未认证访问、暴露的系统提示、危险工具组合（未认证 + 代码执行）、宽松的 CORS 策略。这个审计应该在 Agent 系统上线前和每次重大配置变更后执行，并将结果纳入安全评估报告。

4. **建立与非人类身份管理相匹配的机器 IAM 体系**：传统 IAM 面向人类身份设计，无法覆盖 Agent 的机器工作流凭证。应该建立独立的机器身份管理：包含 API 密钥、服务账户令牌、工作负载证书的全生命周期管理；与人类身份完全分离的访问控制策略；机器身份的异常行为检测（横向移动、异常时间访问、凭证范围外的资源访问）。这是防止机器身份凭证泄露导致横向移动的关键防线。

5. **优先部署 OS 层行为观测而非框架层 Hook**：Fangcun Observer 的核心设计原则——下沉到 OS 层而非依赖框架插件——有深层的工程合理性。框架层的 Hook（如 SDK 拦截、Prompt 过滤）本质上与 Agent 的 Harness 耦合，框架升级或替换时安全能力随之失效；而 OS 层行为感知与上层技术栈完全解耦，无论 Agent 跑在 LangChain、OpenClaw 还是自研框架上，观测能力始终有效。在设计 Agent 安全架构时，应优先考虑 OS 层的系统调用监控和进程级行为审计，而非依赖特定框架的安全插件。

---

**补充阅读**：

-  — 威胁模型与攻击模式
-  — 安全架构与认证授权
-  — 全生命周期安全体系
-  — 威胁向量与缓解策略导航

## 相关实体

- MOC

---

