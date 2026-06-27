# Garry Tan

## Ch01.508 Garry Tan

> 📊 Level ⭐⭐ | 7.1KB | `entities/garry-tan-yc-ceo.md`

## 核心经历
- 2008年创立 **Posterous**（邮件博客，全球前200网站），被Twitter以约$20M收购
- 2025年1月重写Posterous第三次（改名Garry's List），花费$200（Claude Code Max账号）+ 5天 vs 原来$4M + 6人 + 18个月
- GitHub超10万星，同时担任YC CEO + 每月交付数十万行代码

## 核心概念
### Token Maxxing（Token 极大化）
"如果增量的工作能让事情更完整、更出色，那就值得。" Token是买机器的意识时间，换回自己的时间。

- 不满足单一来源，20个来源交叉比对
- Token预算 = 必备生产力支出（像房租一样）
- 通过Token极大化成为"时间亿万富翁"

### Thin Harness, Fat Skills
- **Thin Harness**：核心循环（接收输入→LLM→执行工具），平台搞定，不要重写
- **Fat Skills**：把逻辑写在Markdown里，让LLM理解动机；确定性操作放代码

### Claude + Codex 双AI协作
- **Claude Code**：多动症型CEO，快速迭代
- **Codex**（/codex）：高冷CTO，"智商200且几乎不说话"，找Bug
- 只要能被另一个Agent修复，Agent的脆弱性就不是问题

### 400倍代码产出
专业软件工程师平均每天30-50行逻辑代码（按逻辑代码行数计），Garry当时兼职每天14行 → 400倍提升来自指挥15个Agent并行工作。

## 未来判断
- **个人AI革命 = 个人电脑革命**：每个人都将有满足自己独特需求的AI
- **"个人AI主权"**：自己写提示词 vs 被平台黑箱控制
- **当前阶段**：类似1970年代"自制电脑俱乐部"阶段
→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/yc-ceo-garry-tan-200-dollar-vs-4-million.md)

## 深度分析
### Token经济学的范式转变
Garry Tan的实验揭示了一个根本性转变：Token正在成为继电力、带宽之后的下一代基础生产资料。传统软件开发的最大成本是人力时间（6人×18个月=$4M），而AI时代的成本结构变成了Token消耗+创意决策。这种转变意味着：

- **边际成本趋零**：代码一旦写好，复制成本可忽略，但人力时间无法叠加
- **注意力成为稀缺资源**：不是"写代码"而是"指挥AI写代码"，人的角色从执行者变为评判者
- **Token预算的刚性化**：如同企业必须支付水电费，Token支出将成为刚性生产力成本

### "时间亿万富翁"背后的生产关系重构
Garry提出的"时间亿万富翁"概念，本质上是AI时代生产关系的重新定义：

- **传统模式**：出售自己的时间换取报酬（线性增长，有天花板）
- **AI模式**：购买机器意识时间为自己服务（可叠加，无上限）
这解释了为什么YC现在大力投资AI Native应用——不是用AI"辅助"人，而是用AI"替代"人力时间中的重复部分，释放人的创造力到更高维度的决策。

### Thin Harness的工程哲学
"Thin Harness, Fat Skills"本质上是一个工程边界划分问题：
```
LLM（不确定但通用） ← Markdown定义动机 → 代码（确定但专用）
```
Garry的实践表明，在Agentic Workflow中，应该：

- 让LLM处理"动机理解"（为什么做）
- 让代码处理"执行确定"（怎么做）
- Harness（框架）只负责连接，不负责逻辑

### 双AI协作的认知分工
Claude Code（发散式CEO）+ Codex（收敛式CTO）的组合，本质上是模拟了创业团队中：

- **CEO的思维模式**：快速迭代、接受不完美、推动前进
- **CTO的思维模式**：寻找漏洞、质疑假设、要求证明
这种分工让单个"人"能够同时拥有两种认知模式，而不需切换上下文。

## 实践启示
### 1. 建立Token预算意识
将Token视为生产投资而非成本：

- 为每个项目设定Token预算上限
- 用Token投入换取原本需要外包的开发成本
- 追踪Token投入产出比（$/Token）

### 2. 实践"薄框架、厚技能"
不要在Harness上投入大量定制开发：

- 选用现成的Agent框架（Conductor、OpenClaw）
- 将领域知识写在Markdown/SOP中
- 代码只处理确定性逻辑，LLM处理不确定性

### 3. 采用双AI评审机制
引入第二个AI形成制衡：

- 主AI（Claude Code）负责生成
- 副AI（Codex）负责审查
- 通过prompt设计实现"CEO-CTO"对话

### 4. 设定明确的测试覆盖率标准
Garry的80-90%标准：

- 没有测试的代码=向用户扔"垃圾"
- 用Token生成测试代码比手写更经济
- 宁可多投Token也要保证质量

### 5. 从"时间出售"到"时间购买"的思维转换
核心问题从"我怎么写出更多代码"变成"我怎么用Token买到更多时间"：

- 评估任务是否值得Token投入
- 计算Token成本 vs 人力成本
- 将省下的时间用于更高价值的决策

## 相关实体
- [Qoder Skills 完全指南：从零开始，让 AI 按你的标准执行](/ch04-024-qoder-skills-完全指南-agent-skill-迭代式编写-ai-按你的标准执行/)
- [Agent Skill 设计模式](/ch04-406-从-anthropic-到-google-agent-skills-正在进入-设计模式-阶段/)
- [柚漫剧 AI 全流程提效拆解](/ch01-356-柚漫剧-ai-全流程提效拆解/)
- [AI 行业就业八大变化（腾讯研究院纵向对比）](/ch01-218-我们刚过了人类最后一个劳动节-ai新职业的八个变化/)
- [CDP Bridge MCP：真实浏览器直连 MCP 工具](/ch01-548-cdp-bridge-mcp-让-llm-操作真实浏览器/)
> 主题导航

- [Improving token efficiency in GitHub Agentic Workflows](/ch04-297-improving-token-efficiency-in-github-agentic-workflows/)
- [复杂度棘轮：AI编程的质量只升不降机制](/ch01-309-复杂度棘轮-ai编程的质量只升不降机制/)
- [要实现一个工作流选择-agent-skills-还是-ai-表格](/ch04-192-要实现一个工作流选择-agent-skills-还是-ai-表格/)
- [十年老技术开发的 AI Agent 探索之路](/ch04-266-十年老技术开发的-ai-agent-探索之路/)
- [Agent Workflows](/ch04-306-agent-workflows/)
- Hermes Agent 新手上手指南
- [重新定义Skill开发：保姆级教程&一站式开发助手发布](/ch07-045-重新定义skill开发-保姆级教程-一站式开发助手发布/)
- [四种 Sub Agent 模式](/ch04-302-四种-sub-agent-模式/)

---

