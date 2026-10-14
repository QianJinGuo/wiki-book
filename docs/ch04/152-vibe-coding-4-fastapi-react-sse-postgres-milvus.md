# Vibe Coding 全栈交付模板：4 个项目沉淀的 FastAPI+React+SSE+Postgres/Milvus 架构

> 📊 Level ⭐⭐⭐ | 9.2KB

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

## 深度分析

### 数据归属先于一切：真相源单点化

这套模板最容易被误读成"向量数据库选型"，实际是一条更硬的规则：**Milvus 只是索引，真相源永远在 Postgres**。业务数据、会话、问答日志、人工复核队列全部落在 Postgres，Milvus 里的 dense+BM25 向量随时可删可重建。这条规则的工程含义很长：换 Embedding 模型或维度只需重建集合并全量重灌（CANDOR 2500 篇公告切约 6400 个知识块，4 路并行导入约 13 分钟）；入库脚本必须以业务主键 unit_id 幂等（先删后插），worker 每日增量导入的时间窗口故意与上次重叠一天，用幂等性换"绝不漏数据"。问答日志表还反过来长出了评测集与人工复核队列——数据归属决策喂养了整个质量闭环。

### 协议先行：一套 SSE 事件契约是前后端唯一交汇点

step → sources → delta* → complete | error → [DONE] 的价值不在"用了 SSE"，而在前后端把所有认知对齐到同一个类型化事件序列（前端 types.ts 与后端事件一一对应）。选 SSE 而非 WebSocket 的理由很冷静：智能体对话本质是"一问+一串推送"，单向足够；它是普通 HTTP 响应，nginx、网关、负载均衡都友好，无需粘性会话，还能 `curl -N` 直接调试。证据先于正文（sources 事件在 delta 之前）则把"回答必须带出处"做成了协议约束而非提示词约定。作者甚至用一次前端整体迁移反证了这一点：React 迁到 Vue、删 46 个生成组件、+1321/−5993 行，后端一个文件没动——**前端框架可以换，API 契约和事件协议才是需要认真设计的资产**。

### 降级是一等公民：每一步都留无模型路径

四个项目一致的做法：每个依赖大模型的步骤都保留一条不调大模型的替代路径——LLM 不可达退化为规则识别+结构化模板直答，Embedding 不可达只走 BM25，LLM 端点用 60 秒 TTL 探活实现自动降级、恢复后自动启用。模板自带评测集在零模型模式下 9 道可答题全对、2 道不该答的题全部不硬答。收益远不止容灾：开发与 CI 不需要 GPU 和密钥，演示现场不会白屏；"规则优先、大模型兜底"还顺带解决了成本与可解释性（110 道真实工单测试题里 61 道直接走规则路径）。这与 [Harness 减法工程](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/evaluation-harness-design.md) 的"机械可判定"原则同源。

### 从 Demo 到交付：最后一公里全是"无聊"的事

sales-compass 是四个项目中唯一真正交付、天天有人用的，贡献了几乎全部生产经验——而它们大多与模型无关：镜像推仓库、客户只拿一份不含 build: 的 compose（升级=改 tag，回滚=把 tag 改回去）；更新脚本先备份数据库再拉取更新；不写 container_name，一台机器跑多套实例只需改 name、端口和数据目录。安全底线同样具体：生产只暴露 nginx 端口，Postgres/Milvus/MinIO 端口映射全删，管理接口加令牌，VITE_* 变量会被打进 JS 包、天生公开、绝不能放密钥。"能交付"的分水岭不在模型能力，而在部署、备份、多实例与权限这些 demo 阶段会被跳过的环节。

## 实践启示

1. **架构决策仍需人做**：AI 把写代码的成本打到地板价，但目录分层、数据归属、事件协议这些决策没有变便宜——先把这些定死再让 AI 写，速度才是真实的。
2. **给智能体留退路**：每个调大模型的步骤都写一条零模型路径，配上探活+自动降级+自动恢复；这不仅让系统更稳，也让开发和 CI 彻底摆脱 GPU 依赖。
3. **评测集先行，别凭感觉调 prompt**：CANDOR 用"评测→错例→改规则/知识→再评测"的循环，把事项识别准确率从 53.2% 提到 84.2%、Top5 检索命中率从 71.3% 提到 90.8%；评测报告同时照出短板（"未覆盖"题不硬答率仅 52.9%），直接决定下一步让 AI 干什么，与 [美团评测方法](https://github.com/QianJinGuo/wiki-public/blob/main/entities/meituan-turing-agent-evaluation-methodology-2026-08-06.md) 互证。
4. **文档是写给 AI 的**：需求转写稿、逐版迭代清单、模块规格、现状流程图之外，最有价值的是项目稳定后沉淀的"再生提示词"（完整技术栈+数据模型+API+编码规范）——留下能重新生成项目的说明书，比只留下代码更重要。
5. **提交粒度是护栏的一部分**：AI 一轮能改十几个文件，"update"式的粗粒度提交让问题无法回到上一个好状态；每完成一个可验证的小步就提交（提交信息可让 AI 代写），一版需求一个分支，并行方案用 git worktree。
6. **可复制的起步顺序**：新项目 Day 0 即定事件协议并用 mock 流跑通前端、第一天就 alembic init、先攒 20 道评测题和一个 run_eval.py；这套顺序比任何单点技术选型更值得照抄，适合与 [Anthropic 技能工程实践](https://github.com/QianJinGuo/wiki-public/blob/main/entities/anthropic-14-skill-patterns-best-practices.md) 并读。

## 定位

与库内 vibe coding 讨论互补：本篇是**可运行模板级**的工程沉淀（协议/数据/测试/降级四类护栏），核心思想"没有护栏的速度只会让项目更快失控——给 AI 铺轨道"与 [Anthropic 工程实践](https://github.com/QianJinGuo/wiki-public/blob/main/entities/anthropic-14-skill-patterns-best-practices.md) 和评测驱动思想（[美团评测](https://github.com/QianJinGuo/wiki-public/blob/main/entities/meituan-turing-agent-evaluation-methodology-2026-08-06.md)）互证。降级路径设计与 Harness 减法工程中"机械可判定"原则同源。

→ [原文存档](https://mp.weixin.qq.com/s/aeGHJWKgGFqtJGhiQQLYUw)

---

