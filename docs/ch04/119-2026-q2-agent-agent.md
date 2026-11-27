# 腾讯研究院 2026 Q2 Agent 产业回顾——Agent 跌跌撞撞进入世界

> 📊 Level ⭐⭐⭐ | 10.6KB

> **来源**：腾讯研究院/腾讯科技，作者博阳，2026-07-22
> **评分**：
> **概述**：从技术、经济、组织三维度回顾 2026 Q2 Agent 产业发展，覆盖入口争夺、垂直行业入侵、Tokenmaxxing 失败、多 Agent 合作瓶颈、自进化 AI 和 CPU 重归算力中心等八大趋势。

## 一、Agent 成为通用入口

2025 年行业曾押宝"AI 浏览器"（Google Mariner / OpenAI Operator / Perplexity Comet），但 2026 年趋势逆转：Google 关闭 Mariner 并入 Gemini Agent，Operator 并入 ChatGPT Agent。Codex、Claude Code、Cowork 等直接接入文件/终端/代码仓库的工具使用量涨得更快。

Codex 用户中 20% 从不做编程工作，成长速度是编程用户的 3 倍。浏览器从"总入口"降级为 Agent 工具箱里的一个工具——数据在底层跑，页面只负责把结果摆给人看。

## 二、垂直行业批量装配

Anthropic 四月推出 Claude Design，随后推出按岗位拆分的金融 Agent（估值审核/总账核对/KYC）和法律 Agent。通用 Agent → 行业 Agent 的模式确立：只需替换行业知识、数据和工作规则，运行环境可完全复用。

护城河变化：MCP 和 Harness 使垂直软件壁垒降低，企业自身的数据、权限和验收记录成为更难被复制的竞争优势。

## 三、Tokenmaxxing 运动的教训

黄仁勋公开表示年薪 50 万美元的工程师一年应烧 25 万美元 Token。但实践很快碰壁：

- 亚马逊内部排行榜诱发大量无效任务 → 最终关闭
- Uber 的 Claude Code 全年预算到四月接近耗尽，Token 消耗与功能增长无稳定关系
- 哈工大提出"有效反馈算力"概念：复杂任务中仅约 10% Token 真正影响下一步，剩下 90% 消耗在重读、试错和无效往返上

## 四、组织瓶颈取代技术瓶颈

MIT 覆盖 10 万+ GitHub 开发者研究：自主编程 Agent 能让代码提交量增加 120%，但到立项环节缩水到 50%，能真正发布上线的版本只剩 30%。

替代理论：流程效率将由不可自动化部分决定。AI 拉高生成速度，但 review/判断/协调/担责等环节未同步提升。

## 五、技能严重重复

南洋理工分析市场上两万多个 Skill，约四分之三高度雷同，去重后仅剩五千多个。Agent 提交的代码修复也经常因"别人已经解决过"而被拒绝。Token 消耗上去了，但留下的是大量重复轮子。

## 六、Multi-Agent 合作瓶颈

"编排者-执行者"模式最稳妥，但 Anthropic 披露多 Agent 研究系统 Token 消耗可达普通 Agent 的 4 倍。去掉中心"包工头"后群体智能未形成——模型训练中没有"合作"课题。

> 合作是另一种游戏。我的行动会改变你的处境，你的判断也会改变我的选择。

多 Agent 接下来需补制度：任务怎么分、信息如何共享、错误算谁的、奖励如何回流、长期表现差的 Agent 是否被淘汰。

## 七、Loop Engineering 与自进化

Anthropic RSI：从 Claude 3 到 Mythos，代码优化从约 3× 加速到 50×+。Minimax 等公司已将自动化流程做进后训练。但方向判断/品味仍弱——复杂方向决策中模型仅 20% 优于人。

Loop Engineering 将循环做成长期运行工程：Agent 不再等人按一下才动一下，自主找任务→执行→验证→记录反馈→决定下一轮。

## 八、CPU 重归算力中心

_A CPU-Centric Perspective on Agentic AI_（2025）：工具处理最多占完整任务延迟 90.6%，CPU 动态能耗最高占系统 44%。联合调整 CPU 与 GPU 的任务安排后，中位延迟改善 2× 以上。

GPU 继续推理，CPU 维持并发环境/任务队列/工具调用，KV 和内存保存沙箱与日志，网络负责芯片间数据传输——三者协同决定 Agent 系统总效率。

→ [原文存档](https://mp.weixin.qq.com/s/ObcMGtaQX7I8vfi6QLQOuA)

## 深度分析

### Tokenmaxxing、技能重复与组织瓶颈：同一种病的三个部位

表面上是三件独立的事：Token 烧得太狠、Skill 四分之三重复、代码提交增 120% 却只有 30% 上线。拆开看是同一个结构性缺陷——**生成端的自动化速度远超筛选端，且筛选端没有被同步工程化**。哈工大"有效反馈算力"指出复杂任务中约 90% 的 Token 消耗在重读、试错与无效往返；南洋理工的去重分析指出 75% 的 Skill 是对既有能力的重新生成；MIT 的漏斗则显示组织的 review/立项/发布环节截掉了七成 AI 产出。三者在说同一句话：一个只有生成、没有去重与反馈机制的系统，投入翻倍只会让废品翻倍。这也解释了为何"多烧 Token"在个人层面偶有收益、在组织层面必然崩溃——重复劳动的组织放大效应远大于个人。

### 多 Agent 合作缺的不是智能，而是制度

模型训练中没有"合作"课题，但这不意味着要等下一代模型——人类组织早就遇到过同样的问题，解法从来不是让每个个体更聪明，而是建立制度：契约、分工、追责、激励与退出机制。报告中列出的五问（任务怎么分、信息如何共享、错误算谁的、奖励如何回流、长期表现差者是否淘汰）几乎逐一对应制度经济学的经典命题。这与组织瓶颈章节形成互证：流程效率由不可自动化部分决定，而制度恰恰是那部分的核心。因此多 Agent 的下一步进展更可能被制度设计实验（而非模型升级）卡住——这是把 [多 Agent 协作模式](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/multi-agent-collaboration-patterns.md) 从工程问题重新定义为制度问题的含义。

### CPU 中心性把 Harness 从"胶水层"提升为主战场

工具处理最多占完整任务延迟的 90.6%、CPU 动态能耗最高占系统 44%——这组数字的含义是：性能主战场不在 GPU 推理，而在 Harness 所在的 CPU 侧（工具分发、并发环境、任务队列、沙箱与日志状态）。Harness 不是包装胶水，而是真正的运行时系统软件。对 [Harness Engineering](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/harness-engineering-framework.md) 的直接推论有三条：其一，Harness 设计应借用操作系统的调度与内存分层技术，而非停留在 API 编排；其二，KV、沙箱状态、日志应作为一等资源做容量规划；其三，评测维度要加上"工具链路延迟"与"CPU/IO 占比"，只看 GPU 利用率会系统性误判 Agent 系统的瓶颈。

### 三条趋势线的交汇点：价值向"循环持有人"转移

浏览器从总入口降级为工具箱中的一个工具、垂直 Agent 的护城河转移到数据/权限/验收记录、Loop Engineering 让 Agent 不再等人按一下才动一下——三条线指向同一个位置：**价值正从入口与一次性生成，转移到运行循环及其反馈记录的持有人**。谁持有长期运行的循环和它沉淀的验证/验收记录，谁就掌握复利。但自进化章节同时给出约束：复杂方向决策中模型仅 20% 优于人。两个事实拼起来，人类的位置被重新定义——不再是循环内部的操作员，而是循环顶端的方向设定者；"品味"与方向判断成为 [Agent 自改进循环](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/agent-self-improvement-loops.md) 时代最稀缺的互补品。落地时这正是 [Loop Engineering 方法论](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/loop-engineering-methodology.md) 中"验证与反馈记录"环节必须由人深度参与设计的原因。

## 实践启示

1. **用"有效反馈算力"替换 Token 消耗指标**：衡量 Agent 投入产出时，统计"真正改变下一步决策的 Token 占比"而非总消耗；扩 Token 预算之前，先建去重与反馈机制，否则只是放大废品。
2. **把 review 与验收当成一等预算项**：按 MIT 漏斗，瓶颈在立项与发布端而非生成端。给 review 人力、验收标准（acceptance criteria）、担责流程分配与模型预算同级的资源，并随生成能力提升同步扩容。
3. **建立 Skill 资产登记与查重制度**：新写 Skill 或子 Agent 前强制检索现有资产库；给 Skill 设 owner、版本与生命周期，把"重复率"作为红线指标监控——南洋理工 75% 重复的教训值得直接写入团队规范。
4. **多 Agent 先定制度、再上规模**：扩编排规模前先回答五问——任务怎么分、信息怎么共享、错误算谁的、奖励怎么回流、差的怎么淘汰；起步采用"编排者-执行者"最小结构，并给多 Agent 系统（可达 4 倍 Token）设独立 ROI 核算。
5. **按 CPU 中心视角做 Harness 容量规划**：profile 工具调用与沙箱链路的 CPU/IO 延迟（可能占总延迟九成），而非只盯 GPU；对 CPU 与 GPU 做联合任务调度，把 KV、沙箱与日志纳入内存分层管理。
6. **把人放在循环的方向端**：让 Agent 跑"自主找任务→执行→验证→记录反馈→下一轮"的执行循环，人保留方向判断与品味把关——那是模型目前仅 20% 胜率的环节，也是组织中最该重仓的能力。

---
## 关联
- 相关概念: [Harness Engineering](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/harness-engineering-framework.md)
- 相关: Agent 架构

---

