# Kitta：领域深度定制的 Code Review Agent（阿里云龙蜥社区实践）

> 📊 Level ⭐ | 2.7KB

## Kitta：领域深度定制的 Code Review Agent

阿里云《AI Agent Handbook》（github.com/aliyun/ai-agent-handbook）节选，介绍龙蜥社区的领域定制 Code Review Agent **Kitta**：累计审查 7 万+ 补丁、门禁准确率 97%、合入率稳定 62%，领域定制方法论在操作系统内核、编译器、Agent 平台应用等六大领域验证，审查质量提升 17.0%–31.6%，把 Maintainer 精力从逐行审查释放到关键争议裁决。

## 背景数据：研发瓶颈从"写"转向"审"

- Linux 内核 CVE 修复数：6.9–6.19 版本约 400–500/版本 → 7.0 跳升约 1250 → 7.2 逼近 1900，7.3 预估超 2000；全行业 CVE 同比 +394%、高危 +811%（Linux Foundation 2026 报告）。
- DORA《State of AI-assisted Software Development》：AI 深度参与开发的同时代码 Bug 率 +9%、评审时间 +91%、平均 PR 体积 +154%（约 5000 受访者，相关性口径）。
- 结论：编码不再受人力限制但审查人力未同步增长，通用 AI Review 因缺乏领域知识与业务理解难以满足专家级审查。

## 方法论：领域定制三件套

沉淀**项目级专家资产**（领域知识库 + 项目级审查规则）→ **定制审查流程**（领域专属检查项，非通用 lint）→ 构建**在线离线协同进化闭环**（线上审查结果回流优化资产）。属于 Agentic CI 场景：审查 Agent 嵌入门禁流程而非事后抽检。

## 定位

与库内代码审查/质量防线实体互补：Kitta 的"领域资产沉淀 + 门禁嵌入"与 [AI Coding 质量防线五机制](https://github.com/QianJinGuo/wiki-public/blob/main/entities/ai-coding-agent-quality-defense-five-control-mechanisms.md) 的控制点思想互证；其领域定制路线对通用 Review 工具（缺业务理解）的批判与本库 harness 领域化讨论（如 [Harness Survey](https://github.com/QianJinGuo/wiki-public/blob/main/entities/agent-harness-engineering-survey-2026.md)）呼应。

→ [原文存档](https://mp.weixin.qq.com/s/thZD8n53iiVEeSKKzLidUQ)

---

