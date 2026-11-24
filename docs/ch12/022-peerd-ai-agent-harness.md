# peerd: 浏览器原生的 AI Agent Harness

> 📊 Level ⭐⭐⭐ | 8.3KB

peerd 是第一个完全运行在浏览器中的 [AI Agent Harness](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/harness-engineering-framework.md)——一个 Chrome/Firefox 扩展，在你现有的浏览器中运行完整的 agent loop，驱动你的标签页，启动沙箱化计算环境（JS Notebook、WASM Linux VM、客户端应用），并通过 WebRTC 网络实现 peer-to-peer 的 agent 间通信。

## 架构创新

peerd 的核心设计决策是**将浏览器本身作为运行时和安全模型**，而非在浏览器之上构建额外的隔离层：

- **V8 isolates** 提供沙箱隔离
- **WebCrypto** 管理密钥保险库
- **WebAuthn passkeys** 解锁访问
- **Opaque-origin iframes** 实现内容隔离
- **Subresource Integrity** 验证代码完整性

peerd **不自行编写任何加密或进程隔离代码**——完全复用浏览器平台数十年积累的安全基础设施。

## 安全模型：双角色架构

这是 peerd 最独特的设计贡献：

1. **Key-holder agent**：持有 API 密钥，负责推理和决策，但**永远不接触原始页面内容**
2. **Disposable runner**：无密钥、无网络权限的临时执行器，负责读取页面内容
3. **Fenced output**：runner 的输出被标记为不可信（fenced as untrusted）
4. **动作验证**：每个 agent 驱动的操作都必须在实际页面上验证后才算完成

这种分离确保了即使 runner 被注入恶意内容（prompt injection），key-holder 也不会泄露密钥。

## 计算沙箱

peerd 提供三层沙箱化计算环境：

- **JS Notebooks**：轻量级代码执行
- **WASM Linux VMs**：完整的 Linux 环境编译为 WebAssembly
- **Client-side apps**：个人应用的本地运行

所有计算都在浏览器沙箱内完成，无后端依赖。

## Peer-to-Peer Agent 通信（Preview）

peerd 的 preview channel 支持通过 WebRTC 进行 agent-to-peer 通信：

- **无中心服务器**：agent 之间直接通信
- **WebRTC 数据通道**：低延迟、端到端加密
- **DWeb 协议**：研究级别，仍在演进中

## BYOK 模式

Bring Your Own Key——用户可以连接任何模型提供商（OpenAI、Anthropic、本地模型等），peerd 不强制绑定特定模型。

## 与其他 Agent Harness 的差异化

| 维度 | peerd | Claude Computer Use | OpenAI Operator | 传统 Browser Agent |
|------|-------|--------------------|-----------------|-------------------|
| 运行位置 | 浏览器扩展 | 云端/API | 云端 | 云端/本地 |
| 后端依赖 | 无 | 有 | 有 | 通常有 |
| 安全模型 | 浏览器原生 + 双角色 | API 层 | 云端沙箱 | 自定义 |
| Agent 间通信 | P2P WebRTC | 无 | 无 | 无 |
| 密钥管理 | WebCrypto vault | API 传参 | 云端 | 环境变量 |
| 沙箱 | V8 isolates + WASM | 无 | 云端 | 自定义 |

## 当前状态

0.x 实验性 beta。初始功能已完成集成，但 API 表面仍在变动，breaking changes 可能发生，存储格式可能变化。

## 三个独有贡献（不应合并到现有 entity）

1. **双角色安全架构**：key-holder agent 与 disposable runner 的分离，确保密钥持有者永远不接触原始页面内容
2. **浏览器原生安全复用**：完全依赖 V8 isolates/WebCrypto/WebAuthn，不自建加密或隔离代码
3. **P2P Agent 通信**：WebRTC 基础的去中心化 agent 间通信，无中心服务器依赖

## 深度分析

**1. 双角色架构本质是把最小权限原则应用到 agent loop 内部**

传统 harness 把"模型推理"与"页面操作"放在同一个信任域里——prompt 注入的内容与 API 密钥共享同一段上下文，注入即拖库。peerd 的 key-holder/runner 分离把 agent loop 拆成两个信任域：持密钥的推理方永不阅读原始页面，读页面的执行方永不持有密钥与网络。这是经典 confused-deputy 问题的解法——LLM 可以是 deputy，但不能是密钥的唯一守门人。fenced output（runner 输出标记为不可信）则进一步保证：即使注入成功，注入内容的传播路径也被限制在无密钥的一侧，无法拖走凭证。

**2. 平台复用 vs 自建安全：把安全预算外包给浏览器厂商**

peerd 不写自研加密/隔离代码不是偷懒，而是杠杆：V8 isolates、opaque-origin iframe、SRI、WebCrypto、WebAuthn 的攻击面由 Chrome/Firefox 的发布节奏持续投资与修复，peerd 的安全更新随之"搭车"。代价是它整体继承了浏览器的威胁模型——包括历史上所有 sandbox escape 的教训，且无法自行修补平台层漏洞。对自建 harness 的启示：先盘点平台原语，缺什么再自建什么，而不是默认自建。参见 [Agent 安全架构](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/agent-security-architecture.md)。

**3. P2P 通信把 agent 拓扑从星型改为图型——但信任必须自己解决**

云端 harness 隐含星型拓扑（中心 orchestrator 中转一切）；WebRTC 数据通道让 agent 间直连，拓扑变成任意图。去中心化的代价是身份与信任不能再委托给平台：谁在说话、能不能信，必须由 agent 自己的密钥材料（WebCrypto vault + passkeys）回答。这与双角色架构形成闭环——同一套密钥基础设施同时服务"人→agent"解锁与"agent→agent"认证。参见 [多 Agent 系统](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/multi-agent-systems.md)。

**4. 动作验证是 harness 与 wrapper 的分界线**

"每个动作都要在实际页面上验证后才算完成"把观察-行动闭环接地到真实页面状态，而不是工具调用的返回码。这是 [harness 工程](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/harness-engineering-framework.md)里区分 tool wrapper 与完整 agent loop 的关键：前者以 API 成功为完成判据，后者以世界状态改变为完成判据。0.x 阶段就内置这一判据，说明作者把它当作 harness 的必备层而非可选增强。

## 实践启示

1. **先画密钥路径，再写 agent 代码**：设计任何能读外部内容（网页、文档、邮件）的 agent 时，先回答"这段内容能否到达持有密钥的上下文"。能到达 → 重新设计（双角色拆分或 fenced 通道），参考 [提示注入防御](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/prompt-injection-defense.md)。
2. **runner 输出默认当作对抗样本**：所有页面衍生的文本都可能是注入载体，进入规划上下文前必须打标、走隔离通道或经验证——Computer Use 类项目尤其如此。
3. **平台原语清单化**：动手自建沙箱前先对照清单——V8 isolates / opaque-origin iframe / SRI / WebCrypto / WebAuthn，参见 [Agent 沙箱](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/agent-sandbox.md)。
4. **P2P 之前先有身份层**：启用 agent-to-agent 直连前，先定义身份与信任（passkeys/vault），否则拓扑图本身就是攻击面。
5. **完成判据写成"页面状态已验证"**：把"动作完成"定义为"在实际页面上验证过"，而不是"工具返回 200"，并写进 harness 的验收标准。

## 相关实体

- [Agent Harness 工程框架](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/harness-engineering-framework.md)
- Computer Use Agent
- [Gemini 3.5 Flash Computer Use Agent Harness](https://github.com/QianJinGuo/wiki-public/blob/main/entities/gemini-35-flash-computer-use-agent-harness.md)
- [Agent 安全架构](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/agent-security-architecture.md)

---

