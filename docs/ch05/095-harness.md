# 如何利用 Harness 一句话交付产品功能

## Ch05.095 如何利用 Harness 一句话交付产品功能

> 📊 Level ⭐⭐ | 2.1KB | `entities/harness-one-sentence-product-delivery-baidu-geek.md`

# 如何利用 Harness "一句话交付产品功能"

百度Geek说17哥分享团队将开发模式从 "Vibe Coding" 升级为 "Harness模式" 的实践——代码库为唯一事实源，Agent 自治流转。

## 核心模式

Harness 模式的三个核心转变：
- **从 "AI 写代码，人统筹" 到 "代码库为唯一事实源，Agent 自治流转"**
- **从单 Agent 完成所有任务到 6 个专业 Sub-Agent 协作流水线**
- **从人工联调到 Agent Handoff 协议自动流转**

## 6 Sub-Agent 架构

流水线由以下 6 个专业 Agent 组成，覆盖全流程：
1. **需求分析 Agent** — 理解需求并拆解为可执行任务
2. **前端开发 Agent** — 负责 UI/UX 实现
3. **后端开发 Agent** — 负责 API/业务逻辑
4. **集成测试 Agent** — 验证前后端对接
5. **E2E 测试 Agent** — 端到端场景验证
6. **部署 Agent** — 自动化发布

## 基础设施

- **单仓（Monorepo）**：使用 Git Submodule 整合前后端代码
- **Agent Handoff 协议**：定义任务状态在不同 Agent 间安全、自动化流转的接口规范
- **代码库作为事实源**：所有 Agent 的操作基于代码库当前状态，避免状态漂移

## 效率提升

实践表明，该模式将原本需要 **1 天**完成的功能开发缩短至 **约 2 小时**，效率提升约 **4 倍**。显著降低了前后端联调的沟通成本。

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/如何利用-harness-一句话交付产品功能.md)

---

