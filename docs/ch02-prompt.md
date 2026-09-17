# Ch02 提示词工程与上下文工程

> 与 AI 高效对话的科学与艺术：Prompt、CoT、Context Engineering

> 本章收录 **27 篇**实体，按深度递增排列。

---

## 本章导航

| Level | 含义 | 篇数 |
|-------|------|------|
| ⭐ 入门 | 零基础可读 | 7 |
| ⭐⭐ 工程师 | 需编程基础 | 3 |
| ⭐⭐⭐ 专家 | 需ML基础 | 8 |
| ⭐⭐⭐⭐ 科学家 | 需研究背景 | 5 |
| ⭐⭐⭐⭐⭐ 大师 | 前沿/哲学 | 4 |

---

## 导读

一个精心设计的提示词，可以让同一个模型的表现相差 10 倍。

本章从最基础的 Prompt 写法开始：如何给模型足够的上下文、如何用 Few-shot 示例引导输出格式、如何用 Chain-of-Thought 让模型"展示推理过程"。然后进入更高阶的 Context Engineering——不是"写更好的提示词"，而是"设计更好的信息环境"。

你会看到 Hermes Agent 的 Prompt 调试器如何做 A/B 对比，Codex 的上下文工程如何用 Append-only 策略管理信息流，以及为什么 Karpathy 说"未来的工程师不是写代码，而是设计上下文"。

这是从"会用 AI"到"用好 AI"的关键跳板。

---



---

## 本章内容

### ⭐ 入门（7 篇）

- [001. NetCanvas：用「可交互视觉拓扑」给运维 Agent 造一张外部工作记忆](ch02/001-netcanvas-agent)
- [002. Hermes Agent 自进化机制源码解析](ch02/002-hermes-agent)
- [003. Claude Code Prompt 与上下文 Harness 设计](ch02/003-claude-code-prompt-harness)
- [004. Agent Skill 编写指南](ch02/004-agent-skill)
- [005. Skills 重新定义 Agent 喂知识：从'提前给'到'按需取'的范式反转](ch02/005-skills-agent)
- [006. Enrich your datasets with business context](ch02/006-enrich-your-datasets-with-business-context)
- [007. AE 到可运行代码：大淘宝 AI 动画全链路方案（实践篇）](ch02/007-ae-ai)

### ⭐⭐ 工程师（3 篇）

- [008. AINMM：存量生产级工程向 AI Native 演进的五级成熟度模型](ch02/008-ainmm-ai-native)
- [009. 新程Alpha认知模型：4B参数端侧部署，群体智能以小搏大比肩GPT-5.4](ch02/009-alpha-4b-gpt-5-4)
- [010. AI 导购在 vivo 官网的落地实践](ch02/010-ai-vivo)

### ⭐⭐⭐ 专家（8 篇）

- [011. Using Claude](ch02/011-using-claude)
- [012. Development environments for your cloud agents](ch02/012-development-environments-for-your-cloud-agents)
- [013. Claude Fable 5 提示词泄漏 — 1585 行 120K 字符的产品运行时控制平面与安全工程启示](ch02/013-claude-fable-5-1585-120k)
- [014. Superpowers 6.0 跑了 25 个实验才发现：prompt 里写的每一条\"不要\"，可能都在帮倒忙](ch02/014-superpowers-6-0-25-prompt)
- [015. 深度解析 OpenClaw 在 Prompt / Context / Harness 三个维度中的设计哲学与实践](ch02/015-openclaw-prompt-context-harness)
- [016. Prompt Context Harness 三次演进](ch02/016-prompt-context-harness)
- [017. System Prompt vs Post-Training：行为约束该写还是该训？](ch02/017-system-prompt-vs-post-training)
- [018. 深度解析 Hermes Agent 如何实现自进化及其 Prompt / Context / Harness 的设计实践](ch02/018-hermes-agent-prompt-context-harness)

### ⭐⭐⭐⭐ 科学家（5 篇）

- [019. Codex 上下文工程 — Prompt Layout + Append-only + Latent Space Moat（LastWhisper 解读）](ch02/019-codex-prompt-layout-append-only-latent-space-moat-la)
- [020. Headroom：上下文压缩与缓存稳定化框架（live zone + CCR + RawValue 字节级 patch）](ch02/020-headroom-live-zone-ccr-rawvalue-patch)
- [021. 视觉 AI 的下一前沿是代码：a16z 关于视觉生成范式转移的论述](ch02/021-ai-a16z)
- [022. LLM Wiki 架构](ch02/022-llm-wiki)
- [023. OneReason：快手将推理注入推荐基模的系统性尝试](ch02/023-onereason)

### ⭐⭐⭐⭐⭐ 大师（4 篇）

- [024. Hugging Face AI Agent 术语表：Model / Agent / Scaffolding / Harness / Context Engineering / Policy / Tool / Skill / Sub-agent 完整区分](ch02/024-hugging-face-ai-agent-model-agent-scaffolding-harnes)
- [025. 反向审计 Prompt 范式 — 从 VB 50 行 Codex 自我蒸馏到 5 行核心](ch02/025-prompt-vb-50-codex-5)
- [026. Hermes Agent 深度解析（阿里云/飞樰）](ch02/026-hermes-agent)
- [027. Claude Code Prompt 提示词体系源码解析](ch02/027-claude-code-prompt)


---

## 本章收束

这一章的演进线索只有一条：从"把话术磨好"走到"把环境设计好"。提示词工程的收益有天花板，因为模型的发挥受它能看到的信息约束；上下文工程没有——你给模型什么样的信息环境，它就还你什么样的产出。当你开始为上下文建模而不是为措辞焦虑时，你已经在用工程师的方式用模型了。

---
