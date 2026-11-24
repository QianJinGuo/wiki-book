# 我给Hermes配了4个Agent

> 📊 Level ⭐⭐⭐ | 8.5KB

## 摘要
我给Hermes配了4个Agent

## 关键要点

## 相关实体
> ai agent platforms topic map（已删除）

- [我给Hermes配了4个Agent，真正有用的是这些事](https://github.com/QianJinGuo/wiki-public/blob/main/entities/我给hermes配了4个agent真正有用的是这些事.md)
- [语音输入喊了这么多年，千问电脑版一出手就把键盘卷没了？](https://github.com/QianJinGuo/wiki-public/blob/main/entities/语音输入喊了这么多年千问电脑版一出手就把键盘卷没了.md)
- [特斯拉百万年薪招数据标注员，朝九晚五，无需AI经验](https://github.com/QianJinGuo/wiki-public/blob/main/entities/特斯拉百万年薪招数据标注员朝九晚五无需ai经验.md)

## 深度分析
vmiss 这套配置的价值不在“4 个 Agent”这个数字，而在它展示了一条完整路径：从个人生活摩擦出发发现需求，按角色拆分 Agent，再按任务价值给每个角色匹配不同成本的模型与 provider。以下从四个维度拆解它为什么能跑通。

### 需求发现先于技术选型：一周活动日志当作 Agent 蓝图

起点不是模型评测，而是记录。vmiss 先把一天做过的事写下来，再扩展到一整周，然后追问两个问题：“哪些事情花了很多时间？”“哪些事情我必须做，但对我的工作流价值不高？” 清单法把需求从想象拉回实测。配套的第二问更生活化：“你日常生活里有哪些麻烦？”——并且他明确警告“先别急着想该在本地硬件上跑哪个模型”。文章结尾他把这上升为对新手最大的错误警告：一开始就盯着技术栈而不是从问题出发，“你不需要先搞一堆 3090 才能开始”。这套方法论还有一条容易被忽略的边界：只自动化“我已经知道该怎么做的事情”，AI 负责苦活，人负责验证。需求、边界、验证三点合起来，正是 [Agentic Workflow Patterns](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/agentic-workflow-patterns.md) 里“人在回路”模式在个人场景的最小实现。

### 四 Agent 分工：角色、模型、成本的三维解耦

分工粒度远超“研究/执行”二分。技术研究 Agent 的产出契约是“带引用的研究简报”，引用之所以关键，是因为他要自己读学术论文和源材料；学模型量化时，他让 Agent“教我怎么自己做”而不是“替我做”——把 Agent 当学习加速器而非外包执行者。该 Agent 跑 Nous Portal 上的 MiniMax M2.7，过去也用过 NVIDIA NIM 的模型。技术任务管家承担 Hermes skills 构建和全部 Agent 的 TUI 定制，是“万能 Agent”，用 ChatGPT Plus Codex 订阅里的 GPT 5.5 而非 API 计费，并预留配额耗尽时的备用方案。作者最终把分工收敛为一句话：“一个负责研究，另一个负责执行”——[Multi Agent Collaboration Patterns](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/multi-agent-collaboration-patterns.md) 与 [Agent Role Specialization](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/agent-role-specialization.md) 所描述的角色特化，在个人场景的最小可用形态就是这四个格子。

两个生活方式 Agent 进一步暴露分工的经济学。喝水、坐姿、起身提醒走 OpenRouter 免费模型 NVIDIA Nemotron 3 Super，经 Telegram 推送；处理 MCAS 健康资讯搜索和“今晚吃什么”的生活/研究 Agent，反而跑在一台 8GB RTX 4070 游戏本的本地 Qwen 3.5 9B 量化模型上（64k 上下文），也是全套配置里最让他“惊讶”的一个。Hermes 的 profile 机制让每个 Agent 绑定不同 provider 与模型，并可在 TUI 里随时切换——“贵模型做研究、免费模型做提醒、本地模型做生活咨询”由此成为一行配置而非一次重构。

### Provider 组合定价：订阅制 + 免费层 + 本地推理的三层成本结构

成本立场极为鲜明：“尽可能便宜地做这件事”，并点名直接接 Anthropic API 一天花几百美元的“恐怖故事”。解法是三层叠加：OpenRouter 充值 10 美元解锁免费模型每天 1000 次、每分钟 20 次请求（纯免费账户每天只有 50 次），首选 nvidia/nemotron-3-super-120b-a12b:free；Nous Portal 每月 10 美元 API 订阅，含 tool calling，跑 MiniMax M2.7 但“用得比较克制”；ChatGPT Plus 每月 20 美元承载 GPT 5.5，尚未遇到配额问题。外围还留了两个备选池：NVIDIA NIM 的免费模型适合低成本“感受手感”；DeepSeek v4 API 五月底前有 75% 折扣，被他当作 provider 补贴策略的直接例证。这一切的前提被他点破：“很多个人 Agent AI 的关键，在于知道哪个模型能完成你需要的事情”，免费模型的取舍（如速度）要靠试错摸清。这实质是一份个人规模的 [Ai Cost Optimization Framework](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/ai-cost-optimization-framework.md) 实操样本：按任务价值分层购买算力，而不是为单一供应商的旗舰模型付溢价。这套结构还有一个自我指涉的细节：他把“研究哪些模型便宜或免费”这件事本身也交给了 Agent——直接让 Agent 展示 Nous Portal / OpenRouter 的最新价格。成本优化本身被 Agent 化，skills 成为这套体系的粘合剂。

### 本地小模型的可用性边界：8GB VRAM 已能承载一个生产 Agent

最容易被低估的细节是本地环节的真实配置：一台 8GB VRAM 的 RTX 4070 游戏本，用 llama.cpp 提供 64k 上下文，Hermes 经无线网络访问；同一个模型也曾在 16GB RAM 的 M1 MacBook 上跑通。他的结论是“你会惊讶于手头现有设备能在本地跑起什么”，并把 LMStudio 列为最容易上手的入口、可从 Hermes 直接连接。这意味着“本地 vs 云”不是意识形态二选一：低复杂度、低风险的生活任务（菜谱选择、固定提醒）下沉到零边际成本的本地推理，高质量研究上移到订阅模型——恰是 [Local Vs Cloud Agent Deployment Strategy](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/local-vs-cloud-agent-deployment-strategy.md) 在个人开发者尺度上的投影。对没有 3090 集群的多数个人用户，这条“现有设备 + 量化小模型”的路径比任何跑分都更具可复制性。

## 实践启示
1. **先做"活动日志"再配置 Agent**：花一周时间记录每天做什么、哪些事情重复、哪些事情无聊。然后从这些痛点出发去设计 Agent 职责，而不是反过来对着技术文档配置一通。用 vmiss 的话说："先做起来，从你的生活开始，从你的摩擦点开始。"
2. **利用多 Provider 组合控制成本**：不要把所有 Agent 都绑定同一个模型或 provider。通过 Hermes 的 profile 切换功能，给不同任务的 Agent 配置不同的 provider——研究任务用付费高质量模型，日常提醒任务用免费模型。本地模型（Qwen 3.5 9B 量化）处理不敏感的生活咨询类任务，完全可行且零成本。
3. **用 Telegram 承接 Agent 输出**：vmiss 通过 Telegram 接收 Agent 提醒，这是个务实的选择。比起在 Hermes TUI 里查看，一条 Telegram 消息更接近"真实助手"的交互体验，而且手机通知可以确保你不会错过关键提醒。
4. **研究型 Agent 应该教你会做而不是替你做**：vmiss 用研究 Agent 学习模型量化时，让 Agent"教我怎么自己做量化"而不是"替我做量化"。这个原则确保了你不是在依赖 AI 打下手，而是在利用 AI 加速学习——当 Agent 有一天不可用时，你的能力还在。

→ [原文存档](https://mp.weixin.qq.com/s/kNZE9fzCvOi3Em6JlueB0g)

---

