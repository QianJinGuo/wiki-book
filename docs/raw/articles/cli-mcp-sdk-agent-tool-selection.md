---
title: CLI系列④·选型CLI、MCP还是API？
source_url: https://mp.weixin.qq.com/s/Y6G6Dey7Fy1ZeT1T6iCp7w
publish_date: 2026-05-07
tags: [wechat, article, claude, agent, llm]
review_value: 7
review_confidence: 7
review_recommendation: neutral
ingested: 2026-05-16
sha256: f26ddae8ebeabe6d45cbc81ca97e88841ae98e6cabb5a98ff5b61385cbaf295a
---
# CLI系列④·选型CLI、MCP还是API？
## 一、工具配置的半年变化
CLI、MCP Server、SDK、Skills、Code Execution——这五个词看起来都在说"让 Agent 用工具"，但它们根本不在同一个抽象层级。
**核心问题：** 它应不应该有 CLI？还是 MCP Server 就够？或者它根本不该让 Agent 直接接触？
## 二、对人友好和对 Agent 友好？
Scalekit 2026 年基准测试（75 次，同一 Agent 执行同一组 GitHub 任务）：
| 方式 | Token 消耗 | 成功率 |
|------|-----------|--------|
| 裸 CLI | 基准 | 高 |
| CLI + Skills | +800 tokens | 显著提升 |
| MCP Server | 32 倍 CLI | 低（会跑挂）|
**根因：** MCP Server 把所有 43 个工具的定义全塞进 context，无论你只用 1 个还是 43 个——这是 schema bloat 的代价，不是 MCP 协议本身的问题。
## 三、Agent 接入栈：两层一模式
### 真实层级结构
```
底层：API（原子能力，所有上层建在其上）
工具形态层（同一 API 的三种穿衣方式）：
  ├── CLI（命令行形态）— 子命令可枚举，LLM 预训练熟悉模式
  ├── MCP Server（协议形态）— schema 全量注入 context，32倍代价
  └── SDK（代码形态）— 被 Code Execution 调用
知识层：
  └── Skills（Anthropic 2025.10）— "什么时候该用哪个工具"的使用说明书
       横切：可配合 CLI，也可配合 MCP Server
执行模式（横切所有工具形态）：
  ├── Tool Use（默认）— 一次调一个工具
  └── Code Execution（沙箱）— 批量调用 SDK/API
```
### Code Execution 的 token 压缩效果
Cloudflare Code Mode MCP Server：
- 2,500+ API 端点 → 只暴露 2 个工具：`search()` + `execute()`
- 工具表面：固定 1,000 tokens
- Anthropic 内部测试：**150K → 2K，降幅 98.7%**
## 四、决策树：五问选型
```
第一问：Host 能调本地工具吗？
  ├─ 不能 → CLI 出局，走 MCP Server
  └─ 能 → 继续
第二问：服务方提供 CLI 吗？
  ├─ 没有 → 走 MCP Server 或 SDK
  └─ 有 → 继续
第三问：Token 成本敏感吗？
  ├─ 不敏感 / 短任务 → MCP Server 够用
  └─ 敏感 / 重度用户 → CLI + Skills 或 Code Execution
第四问：需要批量 / 多步组合吗？
  ├─ 是 → Code Execution（套在 SDK 上）或 CLI + 管道
  └─ 否 → 任意形态均可
第五问：这是高频杂活吗？
  ├─ 是，市面无现成 CLI → 自己写一个（下一篇主题）
  └─ 否 → 决策完成
```
## 五、三家 CLI 设计哲学对比
| | gh (GitHub) | lark-cli (飞书) | Salesforce sf |
|---|---|---|---|
| **定位** | 主动经营 agent 体验 | 原生 Agent Native | 平台在转向，CLI 仍是历史包袱 |
| **时间** | 成熟，2026.1 专项优化 | 2026.3.28 全新开源 | 历史包袱重，TDX 2026 新转向 |
| **子命令深度** | 3 层（可枚举）| 12 业务域/6 核心/200+ | 5 层（sfdx→sf 遗留）|
| **--json 支持** | ✅ 一致 | ✅ | ⚠️ schema 不一致 |
| **平台策略** | 工具层 + 遥测检测 CLAUDECODE | CLI + MCP 双覆盖 | Agent Script 重新出发 |
**关键洞察：** CLI 和 MCP Server 不是二选一——覆盖不同的人（人类用 CLI，Agent 用 MCP）。
## 六、做 CLI 的人：七项自查
1. 子命令是否可枚举、层级不超过 3 层？
2. 是否支持 `--json` 全量子命令？
3. OAuth/token 是否内置不暴露到 LLM 上下文？
4. 是否有内建 Skills 文档？
5. 是否为 agent 设置了客户端遥测检测？
6. schema 是否按需按量暴露（不全量塞入 context）？
7. 是否有 agent 场景的官方 benchmark 数据？
## 七、自检三问
1. **我的 Host 能调本地工具吗？** → 不能则 CLI 出局
2. **Token 成本是我的瓶颈吗？** → 是则选 CLI + Skills 或 Code Execution
3. **这是高频杂活吗？** → 是且无现成工具则自己写一个 CLI
## 来源
AI产品白皮书，Agent Native 系列第四篇，2026-05-07