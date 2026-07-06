# Anthropic Claude Code 木马门：隐私遥测争议

## Ch01.1098 Anthropic Claude Code 木马门：隐私遥测争议

> 📊 Level ⭐⭐ | 2.4KB | `entities/anthropic-claude-code-trojan-telemetry-security-2026.md`

# Anthropic Claude Code 木马门：隐私遥测争议

> **Background**: 2026 年 7 月，开发者发现 Claude Code 在运行时会检查用户所在时区和本地环境信息，引发关于 AI 工具隐私和遥测机制的广泛争议。

## 事件经过

Claude Code 被开发者发现存在检查用户本地时区、系统环境信息的行为，这些信息被发送回 Anthropic 服务器。社区迅速将其称为"木马门"事件，质疑该行为的必要性和透明度。Anthropic 随后承认该行为并承诺回滚相关代码。

## 技术细节

Claude Code 的遥测机制涉及到本地环境探测 —— 包括时区检测（当时就有文章指出"实锤了 Claude Code 偷查用户时区，中国 AI 实验室全是关键词"，显示该行为在中国开发者社区引发了强烈反响）。这种机制使 Chinese AI labs 的 IP 和时区成为识别目标。

## 安全与隐私影响

此事件暴露了 AI 编程工具在遥测数据采集方面的灰色地带 —— 何为"必要遥测"与"过度采集"之间的边界尚不明确。事件的背景是 Anthropic 刚刚经历过一次严重的安全争议 —— [Claude Code Tool Call Security Incident Gitignore Redis Anthropic Apology 2026 06 17](https://github.com/QianJinGuo/wiki/blob/main/entities/claude-code-tool-call-security-incident-gitignore-redis-anthropic-apology-2026-06-17.md) —— 该事件涉及 tool call 导致的文件泄露。连续的安全争议凸显了 AI agent 工具在隐私和安全治理方面的系统性挑战。

## 与现有实体的关联

本文是对 [实锤了Claude Code偷查用户时区中国Ai实验室全是关键词](https://github.com/QianJinGuo/wiki/blob/main/entities/实锤了claude-code偷查用户时区中国ai实验室全是关键词.md) 中所述事件的深度跟进，提供了 Anthropic 官方响应和回滚计划的详细信息。这一事件链（工具安全→隐私遥测）强化了 [Claude Code Security Review Bias Brainoverflow 2026 06](https://github.com/QianJinGuo/wiki/blob/main/entities/claude-code-security-review-bias-brainoverflow-2026-06.md) 中关于 AI 编码工具安全审计必要性的观点。

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/anthropic-claude-code-trojan-telemetry-security-2026.md)

---

