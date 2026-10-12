# Vibe Coding 全栈交付模板：4 个项目沉淀的 FastAPI+React+SSE+Postgres/Milvus 架构

> 📊 Level ⭐ | 3.4KB

## Vibe Coding 全栈交付模板（agent-fullstack-template）

作者用 vibe coding 方式做了 4 个项目（论文趋势平台、校园服务问答、对话式数据分析、已交付客户日常使用的销售管理系统）后沉淀的全栈模板：**FastAPI + React/Vite + SSE 流式 + Postgres + Milvus + Docker Compose**，一条 `docker compose up -d --build` 拉起全栈，开源在 github.com/yanqiangmiffy/agent-fullstack-template（MIT）。核心论点：**AI 让写代码变便宜了，但没有让架构决策变便宜**——从 demo 到交付靠的是目录分层、事件协议、数据归属和评测集这些"无聊"的东西。

## 五条架构决策

1. **目录固定**：backend/（FastAPI）+ frontend/（React+Vite）+ 根目录 docker-compose.yml。
2. **数据二分**：Postgres 管"事"（业务数据、会话、日志、人工复核队列），Milvus 管"义"（dense+BM25 混合检索）——**Milvus 只是索引，随时可重建**，真相源永远在 Postgres。
3. **唯一 SSE 事件协议**：`step → sources → delta* → complete | error → [DONE]`，前后端只有一套说话方式。
4. **智能体先不上框架**：流程写成异步生成器，每步 yield 一个事件，**每步都留一条不调大模型的降级路径**（零模型模式下 BM25 检索 + 原文摘录照样跑）。
5. **Vibe coding 的真杠杆不在 prompt 技巧**，在三样东西：写给 AI 看的文档（AGENTS.md）、给 AI 抄的参考代码、告诉你到底变好没有的**评测集**（自带 9 道可答题全对、2 道不该答题不硬答）。

## 从 Demo 到交付（sales-compass）的工程清单

32 个后端测试不依赖外部服务、Alembic 数据库迁移、人工复核队列（LLM 结果先入队再由人确认）、证据闸门（回答必须带 sources）、每完成一个能验证的小步就提交。文章含踩坑速查表与 Day 0 清单。

## 定位

与库内 vibe coding 讨论互补：本篇是**可运行模板级**的工程沉淀（协议/数据/测试/降级四类护栏），核心思想"没有护栏的速度只会让项目更快失控——给 AI 铺轨道"与 [Anthropic 工程实践](https://github.com/QianJinGuo/wiki-public/blob/main/entities/anthropic-14-skill-patterns-best-practices.md) 和评测驱动思想（[美团评测](https://github.com/QianJinGuo/wiki-public/blob/main/entities/meituan-turing-agent-evaluation-methodology-2026-08-06.md)）互证。降级路径设计与 Harness 减法工程中"机械可判定"原则同源。

→ [原文存档](https://mp.weixin.qq.com/s/aeGHJWKgGFqtJGhiQQLYUw)

---

