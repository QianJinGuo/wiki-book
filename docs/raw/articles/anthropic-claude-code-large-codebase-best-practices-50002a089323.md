---

title: "Anthropic 博客：Claude Code 大型代码库最佳实践"
author: AGI Hunt（Anthropic）
date: 2026-05-15
source: https://mp.weixin.qq.com/s/svqke7ZZPU4q5iemPiUMWA
sha256: 50002a089323
review_value: 9
review_confidence: 9
review_score: 81
review_recommendation: 入库
ingested: 2026-05-16
tags: [anthropic, claude-code, enterprise-deployment, large-codebase, harness, claude-md, hook, skills, plugins, lsp, mcp, sub-agents, rag, configuration, 治理]
  - anthropic
  - claude-code
  - enterprise-deployment
  - large-codebase
  - harness
  - claude-md
  - hooks
  - skills
  - plugins
  - lsp
  - mcp
  - sub-agents
  - rag
  - configuration
  - 治理

---
# Anthropic 博客：Claude Code 大型代码库最佳实践
> 来源：Anthropic 官方博客《How Claude Code Works in Large Codebases: Best Practices and Where to Start》
> 分析：AGI Hunt · 2026-05-15
## 核心结论
**「Claude Code 的能力上限，取决于你怎么配它，模型本身有多强反倒是其次的。」**
模型能力是地板，配置质量才是天花板。
## 核心反常识：Agent式搜索 vs RAG
Claude Code 在大型代码库里找东西的方式：
- **遍历文件系统、读文件、grep 搜索、追踪引用**——跟真人工程师一样
- 跑在开发者本地，**不需要预先构建索引**，不需要把代码库上传到服务器
RAG 的致命缺陷：索引更新速度跟不上几千个工程师提交代码的速度。你查的时候可能是两周前被重命名的函数、上个 sprint 已经删掉的模块。**没有任何提示告诉你「这已经过期了」**。
Claude Code 的 agent 式搜索避开了这个坑。每个开发者的实例直接对着最新代码工作。
## 七层扩展体系（Harness）
按构建顺序排列，从底到顶：
1. **CLAUDE.md**：会话自动加载的上下文文件，根目录放全局信息，子目录放局部约定。Claude 在文件系统中移动时**自动向上遍历，逐层叠加加载**。内容要克制。
2. **Hooks**：不只是防护栏，更是有价值的自我进化机制。例如 stop hook 在会话结束时反思，提议更新 CLAUDE.md；start hook 根据所在模块动态加载对应配置。
3. **Skills**：按需加载的专业知识包，「渐进式披露」。可绑定到特定目录。
4. **Plugins**：把 Skills、Hooks、MCP 配置打成一个包，新人第一天装上就拥有和老手一样的环境。解决部落知识问题。
5. **LSP（语言服务器协议）**：提供「跳转到定义」「查找所有引用」，Claude 能按符号精确导航，区分同名函数。
6. **MCP 服务器**：连接内部工具、数据源和 API。但 Anthropic 建议先把基本功做扎实再上 MCP。
7. **子 Agent**：独立 Claude 实例，只把最终结果返回主 agent。核心价值：**把探索和编辑分开做**，避免 context 撑爆。
## 配置迭代：随模型进化
**为当前模型写的指令，下一代模型可能适得其反。**
例子：一条 CLAUDE.md 规则要求每次重构只改一个文件。在老模型上有效，但新模型已经完全能做跨文件协调编辑，这条规则反而变成枷锁。
建议：每 3-6 个月做一次完整配置审查。每次大模型发布后也值得检查一轮。
## 三个成功部署模式
### 模式1：让代码库对 Claude 可读
- CLAUDE.md 精简且分层：根目录只放指针和关键注意事项，细节下沉到子目录
- 在**子目录初始化 Claude**（不是从仓库根目录开始）—— Claude 会自动向上遍历，根目录上下文不会丢
- 测试和 lint 命令按子目录配置（改了一个服务就跑整个测试套件会超时）
- 用 `.claudeignore` 排除生成文件、构建产物、第三方代码
- 给代码库画地图：根目录放 markdown 列出每个顶层文件夹的一句话说明
### 模式2：指定专人负责
- 推广最快的组织，都是先有一小队人把基础设施搭好了才大面积开放
- 新角色：**Agent Manager**（半 PM 半工程师）
- 规模更小的组织至少需要一个 **DRI**（直接责任人）
- 自底向上的采用能激发热情，但缺了组织层面的收敛，好用的实践会变成部落知识
### 模式3：治理先行
大组织/受监管行业的治理问题会更早出现：
- 谁控制哪些 Skills 和 Plugins 可用？
- 怎么防止几千个工程师各自造轮子？
- AI 生成的代码怎么走和人类代码相同的审查流程？
建议：从小组开始，预定义已批准的 Skills、必须的代码审查流程、有限的初始访问权限。随信心增长再逐步放开。
## 三步部署
| 阶段 | 内容 |
|------|------|
| **基础设施阶段** | 小团队搭好工具链、Plugins、MCP，把地基打好 |
| **试点阶段** | 有限初始访问，配上已定义的审批流程 |
| **规模阶段** | 在已建立的治理体系和约定基础上，大面积推广 |
## 适用边界
- **适合**：常规软件工程环境（工程师是主要贡献者、仓库用 Git、目录结构标准）
- **需要额外配置工作**：大量二进制资产的游戏引擎、非 Git 版本控制环境、非工程师往代码库贡献内容
## Anthropic 官方链接
- 博客原文：https://claude.com/blog/how-claude-code-works-in-large-codebases-best-practices-and-where-to-start