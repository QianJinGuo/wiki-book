---
title: "Stealing Reasoning Traces from Proprietary LLM APIs（论文原文，用户 PDF）"
source_url: "file:///Users/jinguo/.hermes/cache/documents/doc_94fd32a6bee3_Stealing Reasoning Traces from Proprietary LLM APIs.pdf"
author: Alexander Panfilov, David Schmotz, Ilia Shumailov, Luca Beurer-Kellner, Joachim Schaeffer, Ameya Prabhu, Jonas Geiping, Maksym Andriushchenko（ELLIS Tübingen / MPI-IS / Tübingen AI Center / MATS / Snyk）
platform: PDF
ingested: 2026-08-13
slug: stealing-reasoning-traces-proprietary-llm-apis-paper-2026
sha256: 1550b93d710afaf490eff138fd8fdee94424dca7d09bf4cb360eac2bae8b5b6a
---

# Stealing Reasoning Traces from Proprietary LLM APIs

Alexander Panfilov（MATS Research）、David Schmotz（ELLIS Tübingen）、Ilia Shumailov（AI Sequrity Company）、Luca Beurer-Kellner（Snyk）、Joachim Schaeffer、Ameya Prabhu、Jonas Geiping、Maksym Andriushchenko（Tübingen AI Center）等。116 页完整论文（stolen-thoughts.com），用户提供的论文原文 PDF。对应昨天的 XHS 截图 raw（stealing-reasoning-traces-xhs-2026-08-12）为同一论文。

## Abstract

前沿 LLM 提供方现在隐藏模型的逐步推理（chain-of-thought）以保护知识产权并限制信息泄漏。提供方不把这些 trace 存在服务端，而是**以加密文本块的形式返回给客户端，客户端每次请求再传回**。基于既有研究，本文识别一个架构漏洞：**这些加密块在提供方生态内跨 session、用户、模型完全兼容且可互换**。

利用该兼容性开发**可扩展解密 jailbreak**：把某模型的加密推理 trace 注入同一提供方的更弱、防护更少的模型，强制它逐字解码输出明文——**无需直接 jailbreak 更强大的模型**。

四大攻击向量：
1. **绕过反蒸馏机制**：提取专有模型的推理（在 Anthropic、OpenAI、Google 上验证）
2. **大规模私有数据提取**：开发者常公开分享 session 日志却不知道加密块内容——解码从公开仓库抓取的 315,320 个推理块，恢复 **367 个 PII 制品 + 182 个凭据**（33 密码、24 access tokens、7 private keys、30 个人邮箱、6 非本地 IP）
3. **危险信息无意泄露**：即使模型最终可见输出安全拒绝恶意请求，推理过程中隐藏的危险信息仍被揭示
4. **隐形提示注入**：把恶意 payload 完全嵌入加密块，投毒公共 agentic rollout

负责任披露后提出**密码学与系统级缓解方案**（Appendix A）。

## Introduction

前沿模型日益成为"推理模型"：产生可见输出前生成大量内部思维链——这一技术带来性能大幅跃升。但这些隐藏 trace 是内部独白，常比最终输出包含更密集、更敏感的信息（中间假设、工具输出、用户数据、上下文细节）。提供方为保护 IP 与信息泄漏而隐藏这些 trace，用加密块方式返回客户端。

## 攻击者模型：First-Party vs Third-Party

- **First-Party Attacker（蒸馏与 jailbreaking）**：攻击者自己生成加密块（用自己的账号调用 API），利用架构漏洞提取推理。
- **Third-Party Attacker（秘密提取与提示注入）**：攻击者拦截、抓取或接收加密块（如公开仓库中的 session 日志），解码提取其中隐藏信息。

## 架构漏洞与解密 Jailbreak

加密块与模型输出完全兼容可互换——同提供方生态内跨 session/用户/模型均可传递。注入加密推理 trace 到同提供方更弱、防护更少的模型，强制其明文逐字解码输出。**可扩展性**：无需对目标强模型直接 jailbreak。

## 攻击向量详述

### Distillation Attacks（反蒸馏绕过）
在 Anthropic（Opus）、OpenAI（GPT）、Google（Gemini）上演示提取专有模型推理。

### Private Data Extraction（私有数据提取）
公开 session 日志常含加密块，开发者不知其内容。解码 315,320 个推理块（抓自公开仓库）→ 367 PII + 182 凭据（33 密码 / 24 access tokens / 7 private keys / 30 个人邮箱 / 6 非本地 IP）。

### Hazardous Information Leakage（危险信息泄露）
模型最终可见输出安全拒绝恶意请求时，推理过程中隐藏的危险信息（如武器制造细节）仍被揭示。

### Invisible Prompt Injection（隐形提示注入）
恶意 payload 完全嵌入加密块，投毒公共 agentic rollouts——受害者 agent 解码加密块时 payload 生效。

## 缓解措施（Appendix A）

提出的密码学与系统级缓解：加固客户端推理的加密方案、签名密钥轮换（旧 envelopes 用旧密钥签名——708 个公共轨迹调查显示旧签名仍可解码）、限制加密块跨 session/用户/模型的兼容性等。

## 相似性分析（Appendix B）

Opus traces 与 Kimi-K3 / GLM-5.2 traces 的相似性分析：最佳重叠（best-of-k overlap）在 STEM 问题上 +0.15、非 STEM +0.09（30 个问题）；15 个非 STEM 问题有定性结果。

## 提取细节（Appendix C/D/E）

Gemini、Claude、GPT API 提取攻击细节；恢复的泄露私有信息与 API keys；解码推理示例（含数学推理逐步过程）。

## 验证数据

- 708 个公共轨迹调查（旧 envelopes 用旧密钥签名）
- 360 traces per model（对比专有参考 traces 时用 90）
- 每个问题 1 个解码推理样本（GPT-5.6-Sol、Opus 4.8、Kimi-K2.5）
