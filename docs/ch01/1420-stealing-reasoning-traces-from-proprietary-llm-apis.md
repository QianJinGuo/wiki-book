# Stealing Reasoning Traces from Proprietary LLM APIs（加密推理块跨模型解码攻击）

## Ch01.1420 Stealing Reasoning Traces from Proprietary LLM APIs（加密推理块跨模型解码攻击）

> 📊 Level ⭐⭐ | 3.2KB | `entities/stealing-reasoning-traces-proprietary-llm-apis.md`

# Stealing Reasoning Traces from Proprietary LLM APIs

Panfilov 等（ELLIS Tübingen / MPI-IS / Tübingen AI Center / MATS / Snyk，stolen-thoughts.com）识别 LLM API 加密思维链块的**架构漏洞**：加密 CoT 块在提供方生态内跨 session、用户、模型**完全兼容且可互换**——由此开发可扩展解密 jailbreak。

## 核心机制：加密块兼容性漏洞

提供方把隐藏的思维链以**加密文本块**形式返回客户端，客户端每次请求传回。漏洞在于这些加密块兼容可互换——**把某模型的加密推理 trace 注入同一提供方更弱、防护更少的模型，强制它逐字解码输出明文**，无需直接 jailbreak 更强大的模型。

## 攻击者模型：First-Party vs Third-Party

- **First-Party Attacker（蒸馏与 jailbreaking）**：自己生成加密块（自己账号调 API），提取推理
- **Third-Party Attacker（秘密提取与提示注入）**：拦截/抓取/接收公开加密块（如公开仓库 session 日志），解码提取隐藏信息

## 四大攻击向量

1. **绕过反蒸馏**：在 Anthropic（Opus）、OpenAI（GPT）、Google（Gemini）上演示提取专有推理
2. **大规模私有数据提取**：公开 session 日志常含加密块——解码 315,320 个推理块 → **367 PII + 182 凭据**（33 密码 / 24 access tokens / 7 private keys / 30 个人邮箱 / 6 非本地 IP）
3. **危险信息无意泄露**：最终可见输出安全拒绝恶意请求时，推理过程隐藏的危险信息仍被揭示
4. **隐形提示注入**：恶意 payload 完全嵌入加密块，投毒公共 agentic rollouts

## 验证与缓解

- 708 个公共轨迹调查（旧 envelopes 用旧密钥签名仍可解码）；360 traces per model
- 相似性分析（Appendix B）：Opus traces vs Kimi-K3/GLM-5.2，best-of-k overlap STEM +0.15、非 STEM +0.09
- 负责任披露后提出**密码学与系统级缓解**（Appendix A）：加固客户端推理加密、密钥轮换、限制加密块跨 session/用户/模型兼容性

## 与库内其他实体的关系

- [Claude Code 工具调用安全事件](../ch03/084-claude-code.html) — 同为 LLM 客户端侧安全漏洞方向
- [LLM 记忆容量](ch01/1513-llm.html) — 思维链包含敏感信息的表征基础
- 与 Trace Inversion（Cornell Tech，同一 XHS 帖提及）互补：前者从加密块解码，后者仅凭输入/答案/摘要合成推理轨迹蒸馏黑盒模型

→ [论文原文存档](https://github.com/QianJinGuo/wiki-book/tree/main/docs/raw/articles/stealing-reasoning-traces-proprietary-llm-apis-paper-2026.md)

---

