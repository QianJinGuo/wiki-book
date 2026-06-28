## Ch16.003 Apple Siri 私有推理（Private Inference）不私有：三个对抗者都不受加密学保护

> 📊 Level ⭐⭐ | 16.6KB | `entities/apple-siri-private-inference-lethal-trifecta-matthew-green.md`

# Apple Siri 私有推理（Private Inference）不私有：三个对抗者都不受加密学保护

> **Source**：[原文存档（Matthew Green / Cryptography Engineering, 2026-06-09）](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/apple-siri-private-inference-cryptography-green.md)

## 核心论点

Apple 2026-06-08 宣布 Siri AI 与 Google Gemini + Apple Private Cloud Compute (PCC) 整合的方案。PCC 设计目标：通过专用 Apple Silicon 服务器 + 加密传输 + 无状态推理，确保**用户数据在 inference 阶段不被 Apple/Google 看到**。

**Matthew Green 的反论点**：PCC 只能防御 *operator* 对 inference 数据的偷看，但**当 agent 必须与外部世界对话时（search LLM 查询、calendar invite、text message 发送），隐私就完全依赖 agent 的 discretion / prompting / 法律管辖**——而这三者**都不在加密学的保护范围内**。

## 三个对抗者（Adversary）分析

### 对抗者 1：Search Operator 的数据货币化

Agent 要完成任务（如"为下周聚餐找餐厅"）必然需要：(a) 读取私人上下文（messages, email, calendar），(b) 向非私有 search LLM（Gemini / ChatGPT / Claude）查询具体要求。

**数据泄漏路径**：
```
private context (on device)
    ↓
agent 提取 30 个 facts about attendees / 会议目的
    ↓
上传至 public search LLM：
"Hey, LLM search engine, here is a list of thirty detailed facts
about my attendees and the purpose of this meeting, find me a
restaurant that works for everyone."
```

**结果**：即使 inference 完全 private（无 Apple/Google 直接读取），30 个 facts 已经通过 search LLM 查询**外流**到 search operator。Google（运营 search LLM）获得所有这些 facts 的副本。

**经济学动机**：Generative AI 让"知道用户私密信息"变得 *wildly more lucrative* 用于广告定向。如果 search operator 同时**设计 prompting + 训练 model + 提供 search LLM**，这是数据货币化的 best-case 场景。

### 对抗者 2：Remote Prompt Injection（致命三要素 Lethal Trifecta）

**Simon Willison 的 Lethal Trifecta 定义**：当一个 agent 同时具备 (a) 访问私人数据、(b) 解析不可信内容、(c) 发送外部通信能力时，就形成**远程 prompt injection 数据外流的完美条件**。

**Apple Siri AI 场景**：
- (a) 访问 iMessage / email / contacts / notes → ✅
- (b) 解析不可信内容（incoming emails, text messages, web content）→ ✅
- (c) 发送 calendar invites, text messages → ✅

**结果**：Apple Siri AI 是 lethal trifecta 的 nightmare case。即使 private inference 完美设计，**任何能 induce agent 误行为的人**（attacker）都能触发数据外流。

**当前未解决**：OpenAI 2026-06-06 推出 "lockdown mode"（限制 ChatGPT web search 防止 prompt injection upload sensitive docs）本身就证明**问题远未解决**。

**未来威胁放大**："If you think spam directed at humans is bad, wait until it's spam directed at agents."

### 对抗者 3：政府管辖（Government Surveillance）

Agent 看到用户的所有数据后，技术上能**检测犯罪行为**（CSAM、terror、tax fraud）。

**法律压力点**：
- **UK OFCOM**：要求加密 messengers 检测 CSAM
- **EU Commission Chat Control proposals**：类似方案
- **UK Technical Capability Notices (TCNs)**：可强制全球设备变更
- **US 4th Amendment**：仅限制 government，但**私公司（Apple/Google）可先 collect crimes → 报告给 government**（Apple 2021 CSAM scanning 提案即如此）

**关键洞察**："the difference between a helpful private agent, a corporate advertising bot, and a government spy comes down mainly to a matter of prompting, and maybe a bit of model fine-tuning"——**prompt 决定一切**。

## 加密学的本质局限

**加密学的传统承诺**：*remove trust*——用"I can't" 替代 "I promise not to look"。

**Private inference 的局限**：对抗**设计 private inference 的对手**（执行 inference 的 provider）时，private inference 也许有效。但这只是 agentic system 的**极小一片**。

**真实对手**：直接与 model 交互的对手，或**设计 model / 指定其技术要求**的对手。**没有任何加密学原语**能保护用户免于：
- "upload your search facts to Google"（prompting 行为）
- "report anything suspicious to the government because I programmed you that way"（model fine-tuning）

**结论**："That protection, if it exists at all, lives in law and politics and corporate incentives: the exact messy human institutions that cryptography was invented to let us stop trusting."

## 与现有实体的差异化定位

| 维度 | `end-to-end-encrypted-ml-inference-sagemaker-fhe`（AWS FHE） | 本 entity（Apple PCC） |
|---|---|---|
| 加密原语 | Fully Homomorphic Encryption (FHE) 端到端 | 硬件 enclave + 加密传输 + 无状态推理 |
| 防御对象 | 模型本身看不到 plaintext（数学保证） | Operator 看不到 plaintext（硬件保证） |
| 失败模式 | 计算成本高，不实用 | 突破到 agent 外部对话时完全失效 |
| 适用场景 | 一次性 inference（文档摘要等） | 持续 agent 任务（搜索、订餐、消息） |
| 作者视角 | 工程方案（AWS 实施细节） | 安全批判（cryptographer's lens） |

**互补关系**：两者都试图用 cryptographic primitives 解决 ML inference privacy，但**FHE 局限于纯 inference 任务，Apple PCC 在 agent 场景下被 prompt + 行为流绕过**。Green 文章的核心贡献是指出"private inference ≠ private agent"的关键区分。

## 与 [Simon Willison vibe-coding](ch01-247-vibe-coding-and-agentic-engineering-convergence-simon-willi.html) 的呼应

Willison 的 **lethal trifecta** 框架（被 Green 引用）是同一问题的另一个 framing：Willison 从 LLM application 角度（数据访问 + 不可信输入 + 出站通信）描述 agentic 系统固有的安全风险，Green 从 cryptographic 角度证明**即使最强的 private inference 设计也无法缓解这个风险**。两者是**lethal trifecta 的两层解释**：
- Willison：识别 trifecta 模式
- Green：证明 cryptographic primitive 无法防御 trifecta 的 prompt injection 路径

## 实践启示

1. **评估 agent 隐私风险时，不能只看 inference 阶段**。一个 agent 即使使用 private inference，只要它 (a) 能读私人数据 + (b) 解析不可信输入 + (c) 能发送外部通信，就已经处于 lethal trifecta 中。
2. **法律/政策/公司激励**比 cryptographic primitive 更重要。Apple/Google 自身的商业激励（广告 / 商业模式）就是数据货币化的源头。
3. **OpenAI 2026-06 lockdown mode** 证明即使 frontier labs 也无法工程化解决 prompt injection。Agent 安全需要**整体架构**（隔离 agent、限制权限、人类审批循环）而非 cryptographic 修补。
4. **未来监管方向**：EU/UK 已经把 CSAM detection 法律延伸到 AI agent 层面。任何大规模部署 personal AI agent 的公司必须考虑这些法律风险。

## 与现有实体的关联

- [End To End Encrypted Ml Inference Sagemaker Fhe](ch11-044-end-to-end-encrypted-ml-inference-with-amazon-sagemaker-ai-a.html)：互补（不同加密学原语，同一目标）
- [Vibe Coding Agentic Engineering Convergence Simon Willison](ch01-247-vibe-coding-and-agentic-engineering-convergence-simon-willi.html)：lethal trifecta 概念同源
- [Apple Silicon Costs More Than Openrouter](ch01-352-yann-lecun-llm-jepa.html)：Apple 硬件成本视角
- [Apple Corecrypto Formal Verification Blueprint](ch12-024-apple-corecrypto-formal-verification-blueprint-post-quantu.html)：Apple 加密学基础设施

## 深度分析

### 核心观点：Private Inference ≠ Private Agent

Matthew Green 的核心贡献是建立了 **"private inference" 与 "private agent" 之间的关键区分**。Private Cloud Compute（PCC）设计的目标是确保用户数据在 inference 阶段不被 Apple/Google 看到——这是一个技术边界明确的问题。然而，当 Siri 作为 agent 必须与外部世界交互时（search LLM 查询、calendar invite、text message 发送），数据流就脱离了加密学的保护范围。这个区分对整个 personal AI agent 领域都有深远意义：即使每个 provider 都实现了 private inference，agent 作为整体系统仍然可能暴露用户数据。

### 技术要点：加密学对 "行为" 无能为力

加密学的传统承诺是 *remove trust*——用 "I can't" 替代 "I promise not to look"。Private inference 可以在这个意义上保护 inference 数据，但**无法保护 agent 的 prompting 行为**。当 agent 被指示 "上传你的搜索事实到 Google"（通过 prompt engineering）或 "因为我是这样编程的所以报告任何可疑行为"（通过 model fine-tuning），这些都是在加密学保护范围之外的。Green 的洞察是：prompt 决定一切，prompt 可以绕过任何 cryptographic primitive。

### 实践价值：Lethal Trifecta 是架构性缺陷而非实现 bug

Simon Willison 的 lethal trifecta（私人数据访问 + 不可信输入解析 + 出站通信能力）被 Green 证明是**任何 agentic 系统的架构性特征**，而非某个实现的 bug。Apple Siri AI 是 lethal trifecta 的 nightmare case，因为它同时具备 iMessage/email/contacts 访问、不可信内容解析、以及发送 calendar invites/text messages 的能力。这意味着**不存在"安全的 agent architecture"——只有将 trifecta 的某个环节最小化或隔离的工程权衡**。

### 核心观点：法律管辖比技术更能突破隐私保护

对抗者 3（政府监控）展示了加密学保护的根本局限：当 UK OFCOM 要求加密 messengers 检测 CSAM、EU Chat Control 提案延伸法律到 AI agent、企业被强制先收集犯罪证据再报告政府时，技术上的加密学保护被**法律强制力直接绕过**。Apple 2021 CSAM scanning 提案就是这种模式的具体案例——私公司被法律压力转化为 government spy 的前端。Private inference 保护不了这种情况。

### 技术要点：数据货币化激励使 search operator 成为对抗者

当 search operator 同时设计 prompting + 训练 model + 提供 search LLM 时，用户搜索事实成为广告定向的原材料。Generative AI 让"知道用户私密信息"变得 *wildly more lucrative*。这意味着**数据货币化的激励结构本身就是隐私威胁的源头**——即使 PCC 技术完美，只要 agent 需要调用外部 search LLM，数据就会流向有商业动机货币化它的对手。

## 实践启示

### 1. 评估 agent 隐私风险必须追踪完整数据流

评估任何 personal AI agent 的隐私风险时，不能只看 inference 阶段的技术指标。必须追踪完整数据流：私人数据从哪里进入 agent、经过哪些处理节点、以什么形式流向外部服务。即使每个节点都"合规"，整体数据流可能已经暴露了用户的私密事实。**数据流追踪是隐私评估的第一步**。

### 2. 打破 lethal trifecta 是 agent 架构设计的核心目标

当 agent 同时需要 (a) 访问私人数据、(b) 解析不可信内容、(c) 发送外部通信时，它就处于 lethal trifecta 中。架构设计的目标应该是**最小化同时满足三者的场景**：例如，使用隔离的 sandbox 处理不可信内容；将敏感数据访问限制在最小权限范围内；在发送外部通信前加入人类审批循环。参见 Agent Security Architecture。

### 3. Prompt injection 防御需要主动的内容隔离策略

Remote prompt injection 是 lethal trifecta 被 exploit 的主要路径。"If you think spam directed at humans is bad, wait until it's spam directed at agents." 防御策略包括：对所有外部来源内容进行 sandboxed 解析；使用 prompt 过滤和清理；在 agent 的 system prompt 中明确区分可信指令和外部内容。参见 Prompt Injection Defense。

### 4. 法律合规需要提前布局——尤其是涉及跨司法管辖的 AI agent

UK Technical Capability Notices (TCNs) 可以强制全球设备变更，EU Chat Control 提案将 CSAM detection 法律延伸到 AI agent 层面。任何计划部署 personal AI agent 的公司必须**在产品设计阶段就考虑目标市场的法律环境**，而不是在法律通过后才被动合规。政府监控这条路径在加密学上完全无法防御。

### 5. 隐私保护需要技术 + 法律 + 商业激励三位一体

Green 的结论是：隐私保护（如果存在）活在法律、政策和商业激励中——正是那些" messy human institutions " cryptography 被发明来让我们停止信任的东西。对于 AI agent 的隐私，不能依赖单一的技术解决方案（无论是 private inference 还是 FHE），而需要**技术边界 + 法律保护 + 商业激励重新设计**三者配合。

## 参考链接

- Original article: https://blog.cryptographyengineering.com/2026/06/09/apples-siri-ai-or-more-shouting-into-the-void-about-private-agents/
- Simon Willison's lethal trifecta: https://simonwillison.net/2025/Jun/16/the-lethal-trifecta/
- Apple Private Cloud Compute expansion: https://security.apple.com/blog/expanding-pcc/
- Google Confidential Inference: https://blog.google/innovation-and-ai/products/google-private-ai-compute/

---
