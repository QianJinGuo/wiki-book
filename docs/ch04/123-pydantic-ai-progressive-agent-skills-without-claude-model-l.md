# Pydantic AI: Progressive Agent Skills without Claude Model Lock-in

## Ch04.123 Pydantic AI: Progressive Agent Skills without Claude Model Lock-in

> 📊 Level ⭐⭐ | 15.0KB | `entities/pydantic-ai-progressive-agent-skills-automatorrunner.md`

> → [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/pydantic-ai-progressive-agent-skills-automatorrunner.md)

## 摘要

AutomatorRunner 在 WeChat 发表的技术文章，记录了从 Claude Skills 迁移到 Pydantic AI 的实战经验。核心结论：**Claude Skills 的设计哲学（渐进式加载、capability 组合、依赖注入）值得借鉴，但其模型绑定 Claude SDK 带来的成本和厂商锁定问题，可以通过 Pydantic AI 这种模型无关的框架以更灵活的方式实现**。文章给出了完整的 6 个 Skills → 5 个 Capabilities 迁移步骤和迁移后一个月的真实生产效果。

## 核心要点

- Claude Skills 绑定 Claude SDK，月费成本高；想切换到 DeepSeek/Gemini 需要 litellm 转接，增加故障点
- Progressive Loading 是设计哲学而非 Claude 专利——可应用于任何 Agent 框架
- Claude 官方《Building Effective Agents》核心观点：框架不重要，工具设计和上下文管理才是关键
- Pydantic AI 提供了一种不依赖特定模型的 Agent Skills 渐进式加载方案
- 关键权衡：Claude Skills 体验好但成本高，通用方案灵活但集成复杂度增加
- 迁移后意外发现：白盒控制比 Claude Skills 黑盒魔法更适合生产环境

## 深度分析

### Claude Skills 的商业价值与技术限制

Claude Skills 是 Anthropic 推出的一种 Agent 能力加载机制，通过 frontmatter/正文/references 三层渐进式披露，让模型"按需获取"上下文。用户体验优秀：开发者写好 Skill 文件，框架自动决定何时加载哪个 Skill。

但 Claude Skills 绑定 Claude SDK 带来两个根本问题：

**1. 成本问题**：文章作者用 Claude Skills 搭了用户反馈日报系统（抓取 Reddit/App Store/内测群→分类→生成 HTML 报告→推飞书），效果好但三个月后账单"够雇一个初级工程师"。这是 Claude 模型 API + Skills 月费叠加的结果。

**2. 厂商锁定**：想切换到 DeepSeek/Gemini 时，必须用 litellm 转接——多一层故障点，且 litellm 对所有模型的参数格式抹平可能引入微妙的行为差异。

### Claude 官方《Building Effective Agents》的关键洞察

Anthropic 自己发布的《Building Effective Agents》文档有三句核心话：

> 1. "很多模式只需几行代码就能实现"
> 2. "成功不在于构建最复杂的系统，而在于构建最适合你需求的系统"
> 3. "Frameworks can help you get started quickly, but don't hesitate to reduce abstraction layers and build with basic components as you move to production"

这翻译成中文是：**工具设计 + 上下文管理比框架重要；渐进式加载是设计哲学而非 Claude 专利**。

这是一个反直觉的洞察——Anthropic 自己在告诉用户：不要过度依赖 Claude Skills 这种高级抽象，必要时应该回到基础组件。这意味着 Claude Skills 不是"必须的依赖"，而是一种"便利实现"。

### Pydantic AI 的四个核心能力

Pydantic AI 作为模型无关的 Agent 框架，提供了 Claude Skills 的功能对应物：

**1. 模型自由（40+ provider）**

原生支持 OpenAI/Anthropic/DeepSeek/Gemini/通义/Ollama，不需要 litellm。`FallbackModel` 支持主模型失败自动切备用——文章作者的真实案例：DeepSeek 某次 API 波动时自动切 Claude，团队无感知。这比 litellm 转接更优雅，因为：

- 不需要额外的代理层
- 内部直接抹平参数格式（避免 litellm 的兼容性问题）
- fallback 是框架级原生支持，不是中间件 hack

**2. Capabilities ≈ Skills，可组合可复用**

一个 Capability 打包：工具函数（tool）/ 指令（系统 prompt 追加）/ 生命周期 hooks。Claude Skills 是"自动触发"（框架判断"现在该加载哪个"），Pydantic AI 是"显式传入"（创建 Agent 时指定）。这是第一个需要手动补的缺口——但显式传入反而更可控。

**3. Hooks 手动实现渐进式加载**

通过两个核心 hook：

- `PrepareTools`：每次模型请求前动态过滤工具列表
- `before_model_request`：每次模型请求前追加指令、修改请求内容

组合这两个 hook 可以实现 Claude Skills 的渐进式披露效果——但需要开发者自己写逻辑。

文章给出了两种方案：

- 方案 A：按步骤过滤工具（"现在不调用搜索工具"）
- 方案 B（更自然）：按步骤追加指令（告诉模型"现在该做什么"而非藏工具）

方案 B 更贴近 Claude Skills 的渐进式披露语义。

**4. 类型安全的依赖注入（比 Claude SDK 更优）**

Claude SDK：工具函数靠字符串 prompt 和 cwd 参数传递上下文，**无类型检查**——IDE 无法补全，运行时才报错。

Pydantic AI：`RunContext[DepsType]` 依赖注入——IDE 自动补全，静态检查捕获错误。这是文章作者从 Claude SDK 迁移的隐藏收益之一。

### Pydantic AI 的三个局限性

诚实地指出 Pydantic AI 不是 Claude Skills 的完美替代：

- ❌ 不会自动判断调用哪个 Capability（Claude Skills 自动触发，需显式传入）
- ❌ 无内置三层渐进加载（frontmatter/正文/references 需手动实现）
- ❌ 自定义 Capability 不能直接用于 YAML Spec，需先注册

这些缺口的本质是：**Pydantic AI 给底层积木但不提供黑盒魔法**——开发者需要自己组装，但组装后的系统是白盒可控的。

### 实战迁移：6 个 Claude Skills → 5 个 Capabilities

文章给出了五步迁移流程：

**第一步：Skill 拆成 Capability**（6 → 5）—— 合并某些 Skill，简化结构。

**第二步：组装 Agent**——功能对应原来的 6 个 Skills，缺渐进式加载。

**第三步：手动实现渐进式加载**——选择方案 B（按步骤追加指令）。

**第四步：依赖注入**——日报依赖（数据库连接/网络客户端/推送地址）转换为类型安全的 `RunContext`。

**第五步：YAML 声明式配置**——内置 Capability 可直接用 YAML，**自定义 Capability 需先注册**（Python 代码组装更实在）。

### 迁移后一个月的真实生产效果

**故障韧性提升**：DeepSeek API 波动时，`FallbackModel` 自动切 Claude，团队无感知——这是文章作者验证的第一个真实价值。

**白盒控制优势**：意外发现白盒控制比 Claude Skills 黑盒魔法更适合生产环境：

- 可精确控制"第几步追加哪段指令、暴露哪份参考资料"
- Claude Skills 的 references "需要时"加载由框架判断，但**有时模型该看标签体系文档但框架没加载**——这是 Claude Skills 自动触发机制的盲区

文章提炼的核心 Token 经济学原则：**别让模型在不该分心时看到不该看的东西**——白盒控制让这条原则可执行。

### Claude SDK vs Pydantic AI 对比

| 维度 | Claude SDK | Pydantic AI |
|------|-----------|------------|
| 模型绑定 | 绑定 Claude | 模型自由 (40+ provider) |
| Skills 机制 | 自动触发 | 显式传入 |
| 渐进加载 | 内置黑盒 | 需自己搭 hooks |
| 依赖注入 | 字符串 prompt + 无类型 | `RunContext[DepsType]` 类型安全 |
| 生产扩展 | 需 litellm | 内置 FallbackModel |
| 故障韧性 | 单点依赖 Claude | 自动 fallback 多模型 |
| 调试可见性 | 黑盒魔法 | 白盒可控 |

## 实践启示

### 对使用 Claude Skills 的团队

- **成本审计**：每月检查 Claude Skills 的实际调用量与成本，当接近"雇一个初级工程师"的阈值时，应评估替代方案
- **不要把 Skills 当黑盒**：即使继续用 Claude Skills，也应该理解其渐进式加载原理，避免"references 该加载没加载"的盲区
- **预留迁移路径**：把 Skills 设计为可拆解的 Capability，而非紧耦合的 Claude 专属实现

### 对选择 Agent 框架的架构师

- **Claude Skills 的设计哲学比实现更重要**：渐进式加载、capability 组合、依赖注入这些思想值得在自己的框架中实现
- **模型无关性是长期价值**：避免厂商锁定是 5 年视角下的关键决策——今天便宜好用不代表明天
- **类型安全 vs 字符串 prompt**：长期看，类型安全的依赖注入会显著降低维护成本
- **白盒 vs 黑盒权衡**：生产环境倾向于白盒可控；原型/MVP 阶段可以接受黑盒便利

### 对 Pydantic AI 选型

- **Pydantic AI 适合的场景**：多模型 fallback 需求、类型安全有要求的团队、愿意自己实现渐进加载的工程团队
- **Pydantic AI 不适合的场景**：想要 Claude Skills 那种零配置自动化的小团队、纯原型/MVP 阶段
- **迁移评估**：现有 Claude Skills 实现拆解为 Capability 的工作量、技能组合的复杂度、对 fallback 的需求强度

### 对 Agent 框架设计者

- **渐进式加载应作为框架原语**：通过 hooks（PrepareTools、before_model_request）暴露给开发者，而非黑盒内置
- **类型安全的依赖注入是差异化优势**：Pydantic AI 的 `RunContext[DepsType]` 值得其他框架学习
- **FallbackModel 应该是框架级能力**：单模型故障不应该让整个 Agent 系统宕机

## 相关实体

- [Pydantic Three Piece Suite Yunduo](https://github.com/QianJinGuo/wiki/blob/main/entities/pydantic-three-piece-suite-yunduo.md) — Pydantic 三件套（pydantic-core / Logfire / Pydantic AI）生态全景
- `Tencent Ai Infra Backend Engineer Huangrunpeng` — Python-first AI 框架的另一视角
- [Harness Engineering](https://github.com/QianJinGuo/wiki/blob/main/concepts/harness-engineering-framework.md) — Agent 工程化的更高层抽象
- [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/pydantic-ai-progressive-agent-skills-automatorrunner.md)
- [面向 skills 编程：大淘宝企业购 5 阶段演进与 anthropic agent skills 标准实战](https://github.com/QianJinGuo/wiki/blob/main/entities/skills-driven-programming-taobao-enterprise-5-phase-evolution-2026-06-17.md)

---

