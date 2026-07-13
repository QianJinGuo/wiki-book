# The down fall of bug bounties

## Ch12.072 The down fall of bug bounties

> 📊 Level ⭐⭐ | 6.9KB | `entities/down-fall-of-bug-bounties.md`

## 核心要点
- Published Time: 2026-05-18T12:32:41.000Z Markdown Content: May 18 2026 A few days ago, I was reading a post by Kabir Ach...

## 相关实体

- [anthropic acquires stainless](../ch04/596-anthropic-acquires-stainless.html)
→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/down-fall-of-bug-bounties.md)

## 深度分析
### AI slop 涌入：从信号噪声比恶化到平台信任危机
AI 模型的大规模普及正在从根本上瓦解 bug bounty 生态系统的信号质量。与 CTF 场景类似，AI 工具让任何拥有强大模型访问权限的人都能生成看似可信的安全报告，但这与真正的安全研究能力之间存在巨大鸿沟。
核心矛盾在于：优秀的安全研究员借助 AI 提升了产出效率，而缺乏基础的报告者则借助 AI 大规模生产无人审查的低质量报告。这种两极分化导致 triage 队列被 AI slop 淹没，平台不得不消耗不成比例的人力资源去甄别无效报告。
值得注意的是，AI slop 的涌入并非平台体验下降的唯一原因。作者明确指出，即便撇开 AI 噪音影响，平台在响应速度和人性化处理方面的长期退化同样严重。以 Uber 为例，一位在平台深耕近十年、排名第一的研究员提交的 PII 泄漏高危漏洞报告，从 4 月 24 日提交到 5 月 6 日才获得人类首次响应，历时 12 天——而此前同类漏洞的平均处理时间是 1-3 天。 这一案例揭示了一个更深层的问题：平台的风险评估和优先级排序机制已失效，优秀研究员的长期贡献和 AI slop 在平台眼中被等量齐观。

### 平台应对策略的局限：技术对抗 vs 信任重建
HackerOne 选择用 AI 对抗 AI，试图通过自动化检测识别 AI 生成报告；Bugcrowd 则侧重于引入更严格的控制机制来阻断 AI agent 的批量提交行为。 两种路径都未能解决根本问题：平台未能建立基于研究员历史贡献的可信度评估体系，导致真正有价值的研究者反而被淹没在审查延迟中。
这与 Daniel Stenberg 关闭 cURL bug bounty 的决策形成呼应——后者明确以「AI slop 泛滥」为由终止了整个项目，虽然他也承认部分 AI 辅助报告确实具有价值（参见 [Anthropic S Bug Hunting Mythos Was Greatest Marketing Stunt Ever Says Curl Creat](ch12/109-anthropic-s-bug-hunting-mythos-was-greatest-marketing-stunt.html)）。这种矛盾立场揭示了安全社区对 AI 的核心焦虑：AI 确实能提升安全研究的效率，但同时也系统性地提升了噪声（noise）而非信号（signal）。

### 研究员动机退化：从经济激励到纯粹的研究热情
作者坦承自己参与 bug bounty 的动力已从经济回报彻底转向对技术的纯粹热爱——这是经济激励失效的危险信号。 当顶尖研究员发现其十年积累的可信度在平台算法中毫无权重、提交高价值漏洞得不到及时响应时，理性选择是转向能快速验证成果的平台，或将精力投入纯粹以兴趣为导向的研究。人才流失将进一步降低平台的有效报告密度，形成恶性循环。

### 安全研究的自动化博弈：防御方的结构性劣势
更宏观地看，AI 正在重塑安全研究的攻防经济学。勒索软件集团已经开始使用 LLM 生成了30种语言的钓鱼邮件，而 bug bounty 自动化工具有能力快速完成 fuzz→分类→利用的全链路（参见 [Cybersecqwen 4B Why Defensive Cyber Needs Small Specialized Locally Runnable Mod](../ch01/038-cybersecqwen-4b-why-defensive-cyber-needs-small-specialize.html)）。防御方若不拥有并运营自己的 AI 工具，将在反应速度上处于系统性劣势。这一趋势意味着传统依赖人工审查的 bug bounty 模式，不仅在人力资源上面临 AI slop 的压力，在与攻击方的自动化博弈中也逐渐丧失优势。

### 平台与社区的认知错位
作者批评平台在应对 AI 浪潮时缺乏对自身社区的深层理解——尤其是对那些贡献了十年高水平研究的老牌研究员缺乏差异化保护机制。 这种「 hacker first 」精神的背离，正在腐蚀 bug bounty 计划最初存在的社区信任基础。Uber 作为作者持续贡献近十年的平台，其对待高质量报告的冷漠态度，是一个警示性的案例：当平台将所有报告一视同仁地置入噪音队列，它实际上是在向最 valuable 的贡献者发送退出信号。

## 实践启示
1. **建立研究员可信度分层机制**：平台应将研究员的历史提交记录、响应时效和有效漏洞率纳入评估体系，对高可信度研究员开启快速通道，从根本上解决「 slop 淹没 signal 」的问题。这需要平台从单纯的报告处理工具转变为具备长期研究员关系管理能力的社区平台。
2. **AI 检测需与人工复审结合，而非单纯对抗**：HackerOne 的「 AI vs AI 」策略在方向上存在根本缺陷——AI 生成的报告可能具有与真实研究相似的表面特征，误伤率高的检测机制会进一步寒了高价值研究者的心。有效的 AI 预处理应该配合人工复审的快速通道机制。
3. **对攻击方的自动化提速不能视而不见**：企业应意识到 bug bounty 生态的劣化与网络威胁的 AI 化加速是同步发生的。在漏洞响应延迟增加、人力审查资源被 AI slop 消耗的同时，攻击者正利用 AI 工具实现更高频、更大规模的漏洞挖掘与利用。企业需要将 AI 辅助的防御能力建设纳入安全预算（参见 ），而非单纯依赖外部 bug bounty 生态。
4. **研究者在选择平台时需评估响应效率**：对于专注于高质量研究的安全研究员，平台的响应速度和人性化管理比漏洞悬赏金额更重要。作者的经历表明，十年排名第一的历史贡献在平台眼中可能一文不值——选择那些对高质量报告有明确 SLA 承诺的平台，是保护自身研究价值的理性策略。
5. **安全社区需建立 AI 报告预处理共识**：借鉴 Daniel Stenberg 的实践，更建设性的方案是建立「 AI 报告预处理 pipeline」——自动聚类、去重、初步分类，减少维护者的筛选成本，同时保留人工复审的上升通道（参见  的分析）。

---

