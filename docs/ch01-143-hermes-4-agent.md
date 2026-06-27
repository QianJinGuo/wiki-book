# 我给Hermes配了4个Agent

## Ch01.143 我给Hermes配了4个Agent

> 📊 Level ⭐ | 3.8KB | `entities/hermes-four-agents-setup.md`

> -> [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/hermes-four-agents-setup.md)

## 摘要
我给Hermes配了4个Agent

## 关键要点
- [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/hermes-four-agents-setup.md)

## 相关实体
> ai agent platforms topic map（已删除）

- [我给Hermes配了4个Agent，真正有用的是这些事](/ch01-065-我给hermes配了4个agent-真正有用的是这些事/)
- [语音输入喊了这么多年，千问电脑版一出手就把键盘卷没了？](/ch03-014-语音输入喊了这么多年-千问电脑版一出手就把键盘卷没了/)
- [特斯拉百万年薪招数据标注员，朝九晚五，无需AI经验](/ch01-079-特斯拉百万年薪招数据标注员-朝九晚五-无需ai经验/)

## 深度分析
**从生活痛点出发而非技术栈出发**：vmiss 反复强调的核心观点是"先问自己日常生活里有哪些麻烦，而不是先研究技术栈"。他记录了一周的活动清单，找出重复性高、价值低的任务，然后才去配置对应的 Agent。这个方法论的本质是把 AI Agent 当作"外包苦力"而非"智能伙伴"——你指挥，它执行，你验证。这与当下许多 Agent 项目的宣推路径完全相反。
**多 Agent 分工的经济学**：一个负责研究、一个负责执行、一个负责提醒、一个负责健康咨询——这种分工背后有经济逻辑。每个 Agent 可以使用不同的模型和 provider，研究 Agent 用昂贵的 MiniMax M2.7 追求质量，提醒 Agent 用免费的 NVIDIA Nemotron 3 Super 追求成本。模型不是越贵越好，而是越合适越好。vmiss 明确表示他不想一天花几百美元在 Anthropic API 上。
**Agent 的"生活化"用例揭示了 Personal AI 的真谛**：喝水提醒、坐姿提醒、晚饭吃什么——这些看似荒唐的用例恰恰是 AI Agent 最先能创造真实价值的场景。它们不需要复杂推理，不需要最新模型，不需要高成本，但能直接改善生活质量。这提示我们：Agent 的落地路径可能不是"替代程序员"，而是"替代生活中的小麻烦"。

## 实践启示
1. **先做"活动日志"再配置 Agent**：花一周时间记录每天做什么、哪些事情重复、哪些事情无聊。然后从这些痛点出发去设计 Agent 职责，而不是反过来对着技术文档配置一通。用 vmiss 的话说："先做起来，从你的生活开始，从你的摩擦点开始。"
2. **利用多 Provider 组合控制成本**：不要把所有 Agent 都绑定同一个模型或 provider。通过 Hermes 的 profile 切换功能，给不同任务的 Agent 配置不同的 provider——研究任务用付费高质量模型，日常提醒任务用免费模型。本地模型（Qwen 3.5 9B 量化）处理不敏感的生活咨询类任务，完全可行且零成本。
3. **用 Telegram 承接 Agent 输出**：vmiss 通过 Telegram 接收 Agent 提醒，这是个务实的选择。比起在 Hermes TUI 里查看，一条 Telegram 消息更接近"真实助手"的交互体验，而且手机通知可以确保你不会错过关键提醒。
4. **研究型 Agent 应该教你会做而不是替你做**：vmiss 用研究 Agent 学习模型量化时，让 Agent"教我怎么自己做量化"而不是"替我做量化"。这个原则确保了你不是在依赖 AI 打下手，而是在利用 AI 加速学习——当 Agent 有一天不可用时，你的能力还在。

---

