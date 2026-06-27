# Stealing Passwords via HTML Injection Under a Strict CSP

## Ch09.114 Stealing Passwords via HTML Injection Under a Strict CSP

> 📊 Level ⭐⭐ | 2.9KB | `entities/afine-csp-html-injection-password-exfiltration.md`

# Stealing Passwords via HTML Injection Under a Strict CSP

→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/afine-csp-html-injection-password-exfiltration.md)

## 深度分析

Stealing Passwords via HTML Injection Under a Strict CSP 涉及code领域的核心技术议题。
### 核心观点
1. # Stealing Passwords via HTML Injection Under a Strict CSP
Published Time: 2026-06-01T10:12:06.
2. 536Z
Markdown Content:
You see plenty of writeups that steal saved passwords through XSS.
3. You see far fewer that pull it off with HTML injection, minimal user interaction, and a Content-Security-Policy strict enough that XSS is dead on arrival.
4. During a test I found exactly that: a reflected HTML injection so constrained by a strict CSP that script execution was impossible.
5. My goal became raising the impact anyway, and the path ran straight through Chrome password autofill and one piece of unusual browser behavior around the Referer header.

### 内容结构
- Stealing Passwords via HTML Injection Under a Strict CSP
- **Why the Referer Header Matters**
- **When Does the Browser Attach a Referer?**
- **The Browser's Default Referer Behavior**
- **The Strange Browser Behavior**
- **Reflected HTML Injection in a GET Parameter**
- **Letting Chrome Password Autofill Do the Work**
- **Exfiltrating Data When the CSP Blocks Everything**

### 技术要点

- **code架构**: 本文在code方向提出的设计理念与实现路径
- **工程挑战**: 实际落地中面临的关键问题与应对策略
- **data趋势**: 相关技术演进方向与新兴范式
### 关联实体

- [Openclaw 完全指南这可能是全网最新最全的系统化教程了32W字建议收藏](../ch04-199-openclaw-完全指南)
- [Scale Robot Reinforcement Learning With Nvidia Isaac Lab On ](../ch01-800-scale-robot-reinforcement-learning-with-nvidia-isaac-lab-on)
- Nvidia Isaac Lab Sagemaker Robot Rl Humanoid
- [Openclaw 完全指南这可能是全网最新最全的系统化教程了32W字建议收藏 V2](../ch04-199-openclaw-完全指南)
- [Karpathy 最新访谈从 Vibe Coding 到 Agentic Engineering](../ch04-125-karpathy-最新访谈-从-vibe-coding-到-agentic-engineering)
- [一文带你弄懂 Ai 圈爆火的新概念Harness Engineering](../ch05-005-一文带你弄懂-ai-圈爆火的新概念-harness-engineering)

## 实践启示
1. **工程落地**: code领域方案需关注可观测性、可维护性和成本效率
2. **技术选型**: 根据场景选择合适的技术栈，避免过度设计或盲目追新
3. **持续迭代**: 建立数据驱动的反馈闭环，持续优化系统表现
4. **风险管控**: 引入新技术需评估对现有系统稳定性的影响，做好降级预案

## 相关实体

- MOC

---

