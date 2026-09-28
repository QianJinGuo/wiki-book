# GLM-5.2 is the step change for open agents

> 📊 Level ⭐⭐⭐ | 9.5KB

→ [原文存档](https://www.interconnects.ai/p/glm-52-is-the-step-change-for-open)

## GLM-5.2 is the step change for open agents

##### Housekeeping: Following my “State of the blog” post last week, noting a slight increase in paid features, it’s a good time to remind folks that I offer group subscriptions with larger discounts proportional to the number of seats.   
I also released a new paper today on open RL recipes for terminal agents, read more here.

A bit over a week ago, when the AI world was still reeling from the shocking export restriction, and effective banning, of Claude Fable 5, Z.ai released their latest model, GLM-5.2. This model was rolled out unusually on a Saturday, June 13th, to GLM Coding Plan members. This is an unusual release practice, normally when an AI model is released on a weekend it’s for a weird reason (most famously, Llama 4).1 In this case, it seemed like Z.ai was excited to capitalize on the zeitgeist of “Anthropic being anti open-science” with their silent safeguards on AI researchers. For the past year or two, the Chinese open-weight labs have taken every opportunity they have for easy marketing wins like this.

Share

GLM-5.2, in a common naming convention across the industry, looked potentially like an incremental update following the popular GLM-5.1 model. At this point, Moonshot AI, makers of the Kimi models, and Z.ai, makers of the GLM models, have consolidated the top of the reputational market with the most beloved open-weight models among AI researchers. What unfolded is a common lesson in tracking AI models that often minor version numbers can have AI models crossing meaningful user experience thresholds. A small change in benchmarks and training can open a wide range of new use-cases.

What has followed is a slow, groundswell of hype for GLM-5.2. The official, MIT-licensed model weights and release blog dropped three days after the initial rollout, on June 16th. One could ramble many technical details, such as the strong benchmark scores, the very popular RL framework that Z.ai uses (SLIME), the recommendation of always using the model on Max thinking effort, and so on, but the initial release blogs usually aren’t the thing to focus on. You can wait and read the ecosystem reaction to know if it’s the real deal. [Benchmarks are half dead these days](<https://www.interconnects.ai/p/opus-46-vs-codex-53

## 深度分析

### 小版本号跨越体验门槛:评估方法论的一课

GLM-5.2 从命名上看只是 GLM-5.1 之后的常规 minor version bump,实际却跨过了"在 coding harness 里作为 general agent 用起来感觉对"(feels right)的体验门槛。这是 AI 模型跟踪中反复出现的模式:benchmark 分数和训练上的小改动,可能打开一大片新用例。作者由此给出的判断标准是——发布博客不值得细读,benchmark 本身已经"半死",真正的信号是生态反应:社区 benchmark 结果、从业者自发评测、以及"我尊敬的 AI 评论者和研究者几乎人人实测称赞"这种 focal point 现象。上一次开源模型获得这种级别的社区聚焦,还是 DeepSeek R1;Kimi K2 发布时被比作"DeepSeek Moment",而 GLM-5.2 已远超那一级别。

### 开闭差距停在约 6.8 个月,而非继续拉大

Opus 4.5 发布(2025-11-24)到 GLM-5.2 权重以 MIT 协议开放(2026-06-16)间隔 204 天,约 6.8 个月,正好落在公认的"美国闭源实验室 vs 中国开源实验室 6-9 个月性能滞后"区间。作者原本预期:随着美国实验室过去一年急剧拉高 compute 投入,且更依赖规模与最新 GPU 的 Claude Fable 5 出现,这个差距应该被拉大——事实是没有。这个反常本身值得追踪:它暗示算法效率与 RL recipe(如 Z.ai 开源且广受欢迎的 SLIME 框架)部分抵消了 compute 差距。后续 [GLM-5.3 继续咬住前沿](https://github.com/QianJinGuo/wiki-public/blob/main/entities/glm-53-how-chinese-labs-keep-stride-with-the-frontier.md) 也印证了这一趋势线。

### 开源叙事的 one-way door:声誉市场头部已经固化

Moonshot(Kimi 系列)与 Z.ai(GLM 系列)已经垄断了开源模型声誉市场的头部——它们是 AI 研究者群体中最受喜爱的 open-weight 模型。GLM-5.2 的特殊性在于:它是第一个在 coding harness 中作为通用 agent "feels right" 的开源权重模型,作者称之为 AI 进展的 one-way door。这 structurally 改变了 Anthropic 靠 Claude Code 独占"唯一能真正做到的模型"的商业模式前提:GLM-5.2 只是第一批发力模型中的第一个,后面还有一串在排队。而这一切并非必然——随着 AI 系统越来越复杂(tools、integrated harnesses、scaled model weights),这个 moment 本可以不发生。

### 经济传导:定价压力与开源推理经济的 inflection point

最直接的冲击是定价压力:那些 tokenmaxxing、把 Anthropic 营收推向月球的组织,第一次有了可信的替代选项。作者认为这不必然导致 Anthropic 达不到预测的 ARR——真实需求仍在增长——但 [开源模型廉价化](https://github.com/QianJinGuo/wiki-public/blob/main/entities/25-the-unbearable-cheapness-of-open-weight-models.md) 的经济效应会长期扩散:Fireworks、Together、Thinky(经 Tinker)、Prime Intellect 等一切卖开源模型推理或微调的供应商"又 hit 了另一个 inflection point"。更尖锐的是时机:这场扩散发生在 Anthropic 旗舰模型仍被出口禁令困住的窗口期——前沿实验室本想向高毛利领域推进,经济腹地却先被开源模型蚕食,作者称之为一记 severe economic dagger。

### 治理交叉点:开源权重与 Mythos 级能力的监管碰撞

GLM-5.2 的发布日期将永远与 Claude Fable 5 的出口管制绑定在同一个叙事坐标上:美国政府判定 Mythos 级能力不宜公开,而中国实验室把同级别的能力开源给所有人。两条趋势线不一定有因果联系——GLM-5.2 相对前代的 cyber 能力当时未知(不过 [独立 cyber benchmark 显示其击败了 Claude](https://github.com/QianJinGuo/wiki-public/blob/main/entities/we-have-mythos-at-home-glm-5-2-beats-claude-in-our-cyber-ben.md)),但能力显然是相关的。作者点出的潜在情景:美国政府某天判定某个中国开源权重模型"对公众不安全"。同时脚注提醒开闭二分并非黑白分明——连闭源模型(Mythos preview)也经常落入未授权用户之手或被越狱,所以"开放 vs 封闭"在访问控制上不是可靠的安全边界。作者的基本立场:廉价智能广泛扩散是经济上的好事,若开源模型现在被封禁、而闭源模型在一两家公司手里再强 10-100 倍,问题会更大。

## 实践启示

- **选模型看生态反应,不看发布稿**:权重开放后等几天,观察 Arena agent leaderboard、Design Arena 这类社区 benchmark 和可信从业者的实测反馈再决定是否切换——GLM-5.2 案例中官方博客几乎没有提供可操作信息。
- **跑 GLM-5.2 用 Max thinking effort,并先做 harness 冒烟测试**:官方推荐始终使用 Max thinking effort;作者在 Claude Code + Fireworks API 中遇到"发图请求 brick 整个会话、必须手动 clear context"的 knife-cut,切换 inference provider 前先用小任务验证兼容性。
- **按工作流阶段分工模型**:planning、主力 coding、subagent dispatch 可以分配不同模型——开源模型先吃下对成本敏感的主力编码段,前沿闭源模型留给最高价值的规划与复杂决策段。
- **把 6-9 个月的开闭滞后当成采购杠杆**:闭源旗舰的领先窗口只有约 7 个月,非前沿敏感的内部工具链可以等开源对位出现再迁移,能大幅压低 token 成本。
- **保持多 inference provider 冗余**:开源模型每次 step change 都会重排 Fireworks、Together 等供应商的能力与价格版图;连作者自己也仍在 tinkering 该用哪个 harness 和 provider,值得定期重估。
- **给开源权重依赖做治理预案**:把工作负载建在开源权重上的团队,应预演"某模型被监管判定不安全/下架"的情景并准备迁移路径;合规判断不能按开源/闭源一刀切,因为闭源模型同样会泄漏和被越狱。

---
## 关联
- 相关概念: [Harness Engineering](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/harness-engineering-framework.md)
- 相关: Agent 架构

---

