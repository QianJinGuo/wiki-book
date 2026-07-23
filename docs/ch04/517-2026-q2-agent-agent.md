# 腾讯研究院 2026 Q2 Agent 产业回顾——Agent 跌跌撞撞进入世界

## Ch04.517 腾讯研究院 2026 Q2 Agent 产业回顾——Agent 跌跌撞撞进入世界

> 📊 Level ⭐⭐ | 5.2KB | `entities/tencent-research-agent-q2-2026-industry-review.md`

# 腾讯研究院 2026 Q2 Agent 产业回顾——Agent 跌跌撞撞进入世界

> **来源**：腾讯研究院/腾讯科技，作者博阳，2026-07-22
> **评分**：v=8, c=8, v×c=64
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

→ [原文存档](https://github.com/QianJinGuo/wiki-book/tree/main/docs/raw/articles/agent-into-the-world-tencent-research-q2-review-2026-07-22.md)

---

