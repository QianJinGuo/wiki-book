# 科维斯 AI（Corvus AI）— TencentOS 内核漏洞研究智能体首秀

## Ch04.776 科维斯 AI（Corvus AI）— TencentOS 内核漏洞研究智能体首秀

> 📊 Level ⭐⭐ | 1.9KB | `entities/corvus-ai-tencentos-kernel-vulnerability-agent-2026.md`

# 科维斯 AI（Corvus AI）— TencentOS 内核漏洞研究智能体首秀

> TencentOS 安全团队打造的**内核漏洞研究智能体**首次公开亮相：发现 Linux 内核 SCTP 协议栈中潜伏 18 年的 0day 漏洞（CVE-2026-64564，命名为 SCTPhantom）。

## 核心发现

- **CVE-2026-64564 / SCTPhantom**：SCTP 协议栈长期潜伏漏洞，可普通用户权限 → 服务器 root 提权；容器内可突破隔离取得宿主机 root。
- 修复仅 6 行代码，2026-07-23 合入 Linux 内核主线。
- 18 年间经 Google syzkaller 等顶级 fuzzer 反复测试、全球数千开发者审阅未被发现。

## 意义

AI 安全智能体在**真实内核漏洞发现**上超越既有 fuzzer + 人工审计组合的首个公开案例，属于 [Agent 安全攻防](ch04/209-ai-agent.html) 方向的高价值实证。与 [Agent 评测基准](../ch03/037-agent.html) 的"能力上限"叙事不同，本文展示的是 Agent 在安全审计这类长程、高噪声任务中的工程化路径。

→ [原文存档](https://github.com/QianJinGuo/wiki-book/tree/main/docs/raw/articles/linux-内核藏了-18-年的漏洞这次-ai-比所有人先找到.md)

---

