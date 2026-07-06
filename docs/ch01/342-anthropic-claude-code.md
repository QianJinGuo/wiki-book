# Anthropic 博客：Claude Code 大型代码库最佳实践

## Ch01.342 Anthropic 博客：Claude Code 大型代码库最佳实践

> 📊 Level ⭐⭐ | 14.1KB | `entities/anthropic-claude-code-large-codebase-best-practices-50002a089323.md`

## 核心结论

模型能力是地板，配置质量才是天花板。Anthropic 的核心观点是：Claude Code 在大型代码库中的表现，不取决于模型本身有多强，而取决于 harness 系统的配置质量。

## 核心反常识：Agent式搜索 vs RAG

Claude Code 在大型代码库里找东西的方式与传统的 RAG 系统有本质区别。

Claude Code 的工作方式是遍历文件系统、读文件、grep 搜索、追踪引用——跟真人工程师一样，跑在开发者本地，不需要预先构建索引，不需要把代码库上传到服务器。

RAG 的致命缺陷在于索引更新速度跟不上几千个工程师提交代码的速度。你查的时候可能是两周前被重命名的函数、上个 sprint 已经删掉的模块，而且没有任何提示告诉你这已经过期了。Claude Code 的 agent 式搜索避开了这个坑，每个开发者的实例直接对着最新代码工作。

## 七层扩展体系（Harness）

Anthropic 将 Claude Code 的企业级扩展能力描述为一个七层体系，从底到顶依次为：

### 1. CLAUDE.md：分层上下文文件

CLAUDE.md 是会话自动加载的上下文文件，根目录放全局信息，子目录放局部约定。Claude 在文件系统中移动时会自动向上遍历，逐层叠加加载。内容要克制，根目录只放指针和关键注意事项，细节下沉到子目录。CLAUDE.md 是 harness 系统最基础也是最核心的组件。

### 2. Hooks：自我进化机制

Hooks 不只是防护栏，更是有价值的自我进化机制。典型的 stop hook 在会话结束时反思并提议更新 CLAUDE.md；start hook 则根据所在模块动态加载对应配置。Hooks 让 Claude Code 能够从每次会话中学习和改进，是 harness 系统持续演化的关键机制。

### 3. Skills：渐进式知识披露

Skills 是按需加载的专业知识包，实现了渐进式披露原则——只在需要时加载相关专业知识，而非一次性倾倒所有上下文。Skills 可绑定到特定目录，实现模块化的专业能力配置。

### 4. Plugins：团队环境标准化

Plugins 把 Skills、Hooks、MCP 配置打成一个包，新人第一天装上就拥有和老手一样的环境。核心价值是解决部落知识问题——在快速扩张的团队中，Plugins 确保所有工程师都基于相同的工具链配置工作。

### 5. LSP：精确代码导航

LSP（语言服务器协议）提供跳转到定义、查找所有引用等能力，Claude 能按符号精确导航，区分同名函数。在大型代码库中，LSP 是避免 Claude 被同名符号混淆的关键基础设施。

### 6. MCP 服务器：内部工具连接

MCP 服务器用于连接内部工具、数据源和 API。但 Anthropic 的建议是先把基本功做扎实再上 MCP，过早引入 MCP 会增加系统复杂度，而基础 harness 层的配置不当会被 MCP 放大。

### 7. 子 Agent：探索与编辑分离

Sub-agents 是独立 Claude 实例，只把最终结果返回主 agent。核心价值是把探索和编辑分开做，避免 context 撑爆。在超大型代码库中，主 agent 负责规划协调，子 agent 负责具体模块的深度探索。

## 配置迭代：随模型进化

为当前模型写的指令，下一代模型可能适得其反。例如一条 CLAUDE.md 规则要求每次重构只改一个文件，在老模型上有效，但新模型已经完全能做跨文件协调编辑，这条规则反而变成枷锁。建议每 3-6 个月做一次完整配置审查，每次大模型发布后也值得检查一轮。这意味着 harness 配置不是一次性工程，而是需要随模型能力进化持续迭代的长期资产。

## 三个成功部署模式

### 模式1：让代码库对 Claude 可读

CLAUDE.md 应精简且分层，根目录只放指针和关键注意事项，细节下沉到子目录。应在子目录初始化 Claude（不是从仓库根目录开始），Claude 会自动向上遍历，根目录上下文不会丢。测试和 lint 命令按子目录配置，避免改了一个服务就跑整个测试套件导致超时。用 .claudeignore 排除生成文件、构建产物、第三方代码。给代码库画地图，根目录放 markdown 列出每个顶层文件夹的一句话说明。这一模式强调的是让 Claude 像一位新加入的工程师一样，通过标准工程实践理解代码库。

### 模式2：指定专人负责

推广最快的组织，都是先有一小队人把基础设施搭好了才大面积开放。新角色 Agent Manager（半 PM 半工程师）负责统筹规划和协调，规模更小的组织至少需要一个 DRI（直接责任人）。自底向上的采用能激发热情，但缺了组织层面的收敛，好用的实践会变成部落知识。

### 模式3：治理先行

大组织或受监管行业的治理问题会更早出现：谁控制哪些 Skills 和 Plugins 可用？怎么防止几千个工程师各自造轮子？AI 生成的代码怎么走和人类代码相同的审查流程？建议从小组开始，预定义已批准的 Skills、必须的代码审查流程、有限的初始访问权限，随信心增长再逐步放开。

## 三步部署框架

| 阶段 | 内容 |
|------|------|
| **基础设施阶段** | 小团队搭好工具链、Plugins、MCP，把地基打好 |
| **试点阶段** | 有限初始访问，配上已定义的审批流程 |
| **规模阶段** | 在已建立的治理体系和约定基础上，大面积推广 |

## 适用边界

Claude Code 适合常规软件工程环境（工程师是主要贡献者、仓库用 Git、目录结构标准）。需要额外配置工作的场景包括：大量二进制资产的游戏引擎、非 Git 版本控制环境、非工程师往代码库贡献内容。

## 深度分析

**1. 模型能力是地板，配置质量才是天花板**

Anthropic 的核心论断挑战了「等待更强模型」的惰性思维：Claude Code 在大型代码库中的表现，模型本身只决定下限，而 harness 系统的配置质量决定上限。这意味着投入工程资源优化配置，比被动等待模型迭代，回报更为直接和持续。

**2. Agent 式搜索从根本上规避了 RAG 的时效性陷阱**

Claude Code 的本地遍历式搜索（读文件、grep、追踪引用），相比 RAG 预构建索引的方式，核心优势在于始终对着最新代码工作。RAG 索引可能是两周前的重命名函数、上个 sprint 已删除的模块，且没有任何过期提示。这个问题在代码库变更频繁的大型组织中会被严重放大。

**3. 七层扩展体系揭示了企业级定制的深度**

从 CLAUDE.md 到子 Agent 的七层结构，展示了一个重要事实：Claude Code 的企业级应用远非「开箱即用」，而是需要系统性工程规划。尤其值得注意的是，越基础的层（如 CLAUDE.md 和 Hooks）越重要，越上层的组件（如 MCP 和子 Agent）越应建立在扎实的基础层之上。

**4. 配置不是一次性工程，而是随模型能力进化的长期资产**

Anthropic 警告：今天为当前模型精心编写的 CLAUDE.md 指令，可能在下一代模型上适得其反。这要求组织建立定期配置审查机制（建议 3-6 个月一次），将 harness 配置视为需要持续迭代的长期资产，而非一劳永逸的工程。

**5. 治理先行是规模化部署的必要条件，而非可选项**

在小型团队中有效的实践，在大规模采用时会迅速失效：部落知识蔓延、Skills/Plugins 失控、AI 生成代码的审查流程缺失。受监管行业或大组织的这些问题会更早暴露。从一开始就定义好治理框架（谁可以添加 Skills、代码审查如何进行、访问权限如何逐步放开），是可持续规模化的前提。

## 实践启示

**1. 从子目录初始化 Claude，在根目录只放指针和关键注意事项**

Claude 会自动向上遍历加载 CLAUDE.md，根目录的上下文应保持克制，只放全局指针和核心注意事项，细节下沉到子目录。这种分层设计避免了一次性倾倒过多上下文导致的干扰。

**2. 用 Hooks 建立自我进化机制，让每次会话都留下改进痕迹**

Stop hook 在会话结束时主动反思并提议更新 CLAUDE.md，将单次会话的经验转化为系统性知识积累。这是让 Claude Code 团队配置持续优化的关键飞轮，而非仅仅把 Hooks 当作防护栏使用。

**3. Skills 实现渐进式知识披露，避免 context 一次性倾倒**

Skills 是按需加载的专业知识包，应绑定到特定目录实现模块化。这意味着不要在根 CLAUDE.md 中堆砌所有上下文，而是在需要时加载对应模块的专业知识。

**4. Plugins 是新人第一天就能上手老手环境的工程基础**

把 Skills、Hooks、MCP 配置打包成 Plugin，新工程师装上就拥有完整的工具链。这解决了快速扩张团队中的部落知识问题，是企业级部署的标准工程实践。

**5. 用子 Agent 分离探索与编辑，避免 context 撑爆**

在超大型代码库中，主 agent 负责规划协调，子 agent 负责具体模块的深度探索。只把最终结果返回主 agent，避免 context 被中间过程撑爆。这是处理复杂代码库的标准工程分解思路。

**6. 部署从治理框架开始，而非从技术选型开始**

建议从小组开始，预定义已批准的 Skills 列表、必须的代码审查流程、有限的初始访问权限，随信心增长再逐步放开。这确保了规模化过程中的质量控制和合规要求。

## Anthropic 官方资源

## 相关实体
- [Claude Code Large Codebase Enterprise Deployment](ch03/075-claude-code.md)
- [Claude Code Core Internals](ch03/075-claude-code.md)
- [Claude Code Harness Deep Understanding](ch01/456-claude-code-harness-deep-understanding.md)
- [Claude Code Large Codebase Harness Configuration](ch03/075-claude-code.md)
- [Claude Code Openclaw Memory Vector Db Doubt](ch03/075-claude-code.md)

→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/anthropic-claude-code-large-codebase-best-practices-50002a089323.md)

- 博客原文：https://claude.com/blog/how-claude-code-works-in-large-codebases-best-practices-and-where-to-start
- [openai 的最强对手，离「ai windows」又近了一步](ch04/069-ai.md)
- [钉钉 stream + cli 代理双引擎 ai 助手架构](ch04/069-ai.md)
- [claude code 1.0.24 工具调用安全事故：静默删 .gitignore 与 redis flush 复盘](ch03/075-claude-code.md)
- [MOC](https://github.com/QianJinGuo/wiki/blob/main/moc/tool-use-mcp-patterns.md)

---

